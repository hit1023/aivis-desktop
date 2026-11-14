// AivisSpeech Studio デスクトップ版（最小構成）
//   1. 同梱ルーター(PyInstaller)を 127.0.0.1 の空きポートで子プロセス起動
//   2. /health が返るまで待つ
//   3. 同梱の画面(vendor/ui/index.html)を開く。接続先は preload.js が localStorage に入れる
//   4. 終了時にルーターを止める
const { app, BrowserWindow, dialog, shell } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');

const RES = app.isPackaged ? process.resourcesPath : path.join(__dirname, 'vendor');
const ROUTER_BIN = process.env.AIVIS_ROUTER_BIN
  || path.join(RES, 'router', process.platform === 'win32' ? 'aivis-router.exe' : 'aivis-router');
const UI_INDEX = path.join(RES, 'ui', 'index.html');
// AivisSpeech Engine の既定の場所（AivisSpeech アプリを起動していれば 10101 で待っている）
const ENGINE_URL = process.env.AIVIS_BACKEND_URLS || 'http://127.0.0.1:10101';

if (process.env.AIVIS_DEBUG_PORT) app.commandLine.appendSwitch('remote-debugging-port', process.env.AIVIS_DEBUG_PORT);

let router = null;
let mainWin = null;
let quitting = false;

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });
}

async function waitHealthy(port, ms = 60000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (!router || router.exitCode !== null) throw new Error('ルーターが起動直後に終了しました');
    try {
      const r = await fetch(`http://127.0.0.1:${port}/health`);
      if (r.ok) return;
    } catch (e) { /* まだ起動中 */ }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('ルーターの起動がタイムアウトしました');
}

function startRouter(port) {
  const data = path.join(app.getPath('userData'), 'router');
  fs.mkdirSync(data, { recursive: true });
  const log = fs.openSync(path.join(app.getPath('userData'), 'router.log'), 'a');
  router = spawn(ROUTER_BIN, ['--port', String(port), '--data-dir', data], {
    env: { ...process.env, AIVIS_BACKEND_URLS: ENGINE_URL },
    stdio: ['ignore', log, log],
    windowsHide: true,   // Windows で黒いコンソール窓を出さない
  });
  router.on('exit', (code) => {
    if (!quitting) dialog.showErrorBox('AivisSpeech Studio', `ルーターが終了しました (code ${code})。アプリを再起動してください。`);
  });
}

function stopRouter() {
  quitting = true;
  if (router && router.exitCode === null) {
    router.kill('SIGTERM');
    setTimeout(() => { if (router.exitCode === null) router.kill('SIGKILL'); }, 3000).unref();
  }
}

// AivisSpeech Engine が応答するか。応答しない間は話者が出ないので、起動を案内する。
async function engineUp() {
  try { return (await fetch(`${ENGINE_URL.split(',')[0].trim()}/version`, { signal: AbortSignal.timeout(2000) })).ok; }
  catch (e) { return false; }
}

// AivisSpeech の配布元（公式サイト。ここからダウンロードして入れてもらう）
const AIVIS_DOWNLOAD_URL = 'https://aivis-project.com/';

// インストール済みの AivisSpeech（Mac: AivisSpeech.app / Windows: AivisSpeech.exe）を探す。なければ null。
function findAivisApp() {
  let cands = [];
  if (process.platform === 'darwin') {
    cands = ['/Applications/AivisSpeech.app', path.join(app.getPath('home'), 'Applications', 'AivisSpeech.app')];
  } else if (process.platform === 'win32') {
    // 公式インストーラーは既定でユーザー領域（%LOCALAPPDATA%\Programs）に入れる。全ユーザー用の場所も見る。
    const local = process.env.LOCALAPPDATA || path.join(app.getPath('home'), 'AppData', 'Local');
    const bases = [path.join(local, 'Programs'), process.env.ProgramFiles, process.env['ProgramFiles(x86)']].filter(Boolean);
    for (const b of bases) cands.push(path.join(b, 'AivisSpeech', 'AivisSpeech.exe'));
  }
  return cands.find((p) => fs.existsSync(p)) || null;
}

// エンジンが応答するまで待つ。応答したら true。
async function waitEngine(tries = 60) {
  for (let i = 0; i < tries; i++) {
    if (await engineUp()) return true;
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

async function ensureEngine() {
  if (await engineUp()) return;
  const appPath = findAivisApp();
  const win = mainWin && !mainWin.isDestroyed() ? mainWin : undefined;

  if (appPath) {
    // インストール済みだが起動していない → 起動を案内
    const { response } = await dialog.showMessageBox(win, {
      type: 'info',
      message: 'AivisSpeech Engine に接続できません',
      detail: '音声合成には AivisSpeech（エンジン）が必要です。\nAivisSpeech を起動しますか？（起動後、自動で再接続します）',
      buttons: ['AivisSpeech を起動', 'このまま続ける'],
      defaultId: 0, cancelId: 1,
    });
    if (response !== 0) return;
    await shell.openPath(appPath);
  } else {
    // 未インストール → ダウンロードページへ案内。入れて起動したら自動で再接続する
    const { response } = await dialog.showMessageBox(win, {
      type: 'info',
      message: 'AivisSpeech のインストールが必要です',
      detail: 'このアプリは音声合成に AivisSpeech（無料）を使います。まだ見つかりません。\n\n'
        + '1. 「ダウンロードページを開く」から AivisSpeech を入れる\n'
        + '2. AivisSpeech を起動する\n\n'
        + '起動すると、このアプリが自動で接続します。',
      buttons: ['ダウンロードページを開く', 'あとで'],
      defaultId: 0, cancelId: 1,
    });
    if (response !== 0) return;
    shell.openExternal(AIVIS_DOWNLOAD_URL);
  }
  // どちらの場合も、エンジンが立ち上がったら画面を再読み込みして話者を出す
  if (await waitEngine(appPath ? 60 : 300) && mainWin && !mainWin.isDestroyed()) mainWin.reload();
}

async function createWindow(port) {
  const win = new BrowserWindow({
    width: 1180, height: 820, minWidth: 720, minHeight: 560,
    backgroundColor: '#0b0a09',
    title: 'AivisSpeech Studio',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: [`--aivis-api-port=${port}`],
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  // 外部リンクは既定のブラウザで開く（アプリ内に別サイトを表示しない）
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  mainWin = win;
  await win.loadFile(UI_INDEX);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(async () => {
    try {
      for (const p of [ROUTER_BIN, UI_INDEX]) {
        if (!fs.existsSync(p)) throw new Error(`見つかりません: ${p}\n先に npm run prepare:vendor を実行してください。`);
      }
      const port = await freePort();
      startRouter(port);
      await waitHealthy(port);
      await createWindow(port);
      ensureEngine();   // 待たずに案内（ウィンドウは先に出す）
    } catch (e) {
      dialog.showErrorBox('AivisSpeech Studio', String(e.message || e));
      stopRouter();
      app.quit();
    }
  });
  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', stopRouter);
  process.on('exit', stopRouter);
}
