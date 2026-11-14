// デスクトップ版に同梱するものを vendor/ に集める（Mac / Windows 共通）。
//   vendor/ui/      … hit-aivis-webui の画面（サーバー版のファイルをコピーして使う。元は変更しない）
//   vendor/router/  … hit-aivis-router を PyInstaller で固めた実行フォルダ（動かしている OS 用）
// 兄弟ディレクトリ（../hit-aivis-webui, ../hit-aivis-router）を参照する。環境変数 WEBUI_DIR / ROUTER_DIR で変更可。
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const HERE = path.resolve(__dirname, '..');
const WEBUI = process.env.WEBUI_DIR || path.join(HERE, '..', 'hit-aivis-webui');
const ROUTER = process.env.ROUTER_DIR || path.join(HERE, '..', 'hit-aivis-router');
const V = path.join(HERE, 'vendor');

for (const d of [WEBUI, ROUTER]) {
  if (!fs.existsSync(d)) { console.error(`見つかりません: ${d}`); process.exit(1); }
}

// --- 画面 ---
const ui = path.join(V, 'ui');
fs.rmSync(ui, { recursive: true, force: true });
fs.mkdirSync(ui, { recursive: true });
for (const f of ['index.html', 'reader.html']) fs.copyFileSync(path.join(WEBUI, f), path.join(ui, f));
fs.cpSync(path.join(WEBUI, 'assets'), path.join(ui, 'assets'), { recursive: true });
if (fs.existsSync(path.join(WEBUI, 'docs'))) fs.cpSync(path.join(WEBUI, 'docs'), path.join(ui, 'docs'), { recursive: true });
// ビルド時プレースホルダー（サーバー版では docker-entrypoint.sh が置換する）。
// API の実際の接続先は起動時に preload.js が localStorage へ入れるので、ここは予備の値。
for (const f of ['index.html', 'reader.html']) {
  const p = path.join(ui, f);
  const s = fs.readFileSync(p, 'utf8').split('__AIVIS_API_URL__').join('http://127.0.0.1:8000').split('__AIVIS_UI_MODE__').join('simple');
  fs.writeFileSync(p, s);
}

// --- ルーター（PyInstaller。動かしている OS 用のものができる） ---
const build = path.join(V, 'router-build');
fs.rmSync(build, { recursive: true, force: true });
const py = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3.12');
const r = spawnSync(py, [path.join(ROUTER, 'desktop', 'build.py'), build], { stdio: 'inherit' });
if (r.status !== 0) { console.error('ルーターのビルドに失敗しました'); process.exit(r.status || 1); }
fs.rmSync(path.join(V, 'router'), { recursive: true, force: true });
fs.renameSync(path.join(build, 'aivis-router'), path.join(V, 'router'));
fs.rmSync(build, { recursive: true, force: true });
console.log('OK:', V);
