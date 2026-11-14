# 🎙️ AivisSpeech Studio デスクトップ版

**文字を入れると、AIが声で読んでくれる。ダウンロードして、ひらくだけ。**

むずかしい設定はいりません。サーバーも、プログラミングも、いりません。
自分のパソコンの中だけで動くので、入れた文章が外に出ることもありません。

| | 状態 |
|---|---|
| 🍎 **Mac**（Apple Silicon） | ✅ 動くことを確認ずみ |
| 🪟 **Windows**（64bit） | 🛠️ 作る準備はできています（まだ作って確かめていません）。下の「Windows版を作る」を見てください |

> これは**サーバー版とは別のもの**です。サーバー版（`hit-aivis-webui` + `hit-aivis-router`）はそのまま動いています。

---

## 🌟 はじめての人へ：4つのステップ

パソコンが苦手でも大丈夫です。順番に、1つずつやってみましょう。
かかる時間は、ぜんぶで **10分くらい** です。

### ステップ1　まず「AivisSpeech」を入れる（声を出す本体）

このアプリは、声を出すときに **AivisSpeech（エーアイビス スピーチ）** という無料のソフトを使います。
先に、これを入れてください。

1. 次のページをひらきます → **https://aivis-project.com/**
2. 「ダウンロード」のボタンをおして、自分のパソコン（Mac か Windows）に合うものをえらびます
3. ダウンロードできたら、ひらいて、画面の言うとおりに「次へ」をおしていきます

> 💡 **もう入れてある人は、ステップ2へ進んでください。**
> 入れ忘れても大丈夫です。このアプリをひらくと、「AivisSpeech が必要です」と教えてくれます。

### ステップ2　このアプリを入れる

**🍎 Mac の人**

1. `AivisSpeech-Studio-…-mac-arm64.dmg` というファイルをダブルクリックします
2. 出てきた小さな窓の中の「AivisSpeech Studio」を、**「Applications」のフォルダにドラッグ**します（ひっぱって、はなす）
3. 小さな窓は、とじてかまいません

**🪟 Windows の人**

1. `AivisSpeech-Studio-…-win-x64.exe` というファイルをダブルクリックします
2. しばらく待つと、ひとりでに入ります（画面でおす場所はありません）

### ステップ3　ひらく

**🍎 Mac の人**

- 「Applications」の中の **AivisSpeech Studio** をダブルクリックします
- ⚠️ はじめてのときだけ「開発元が未確認のため開けません」と出ることがあります。こわれているわけではありません。次のようにすると、ひらけます。
  1. 画面の左上の 🍎 → **「システム設定」** → **「プライバシーとセキュリティ」** をひらく
  2. 下の方に出ている **「このまま開く」** をおす（パスワードを聞かれたら、パソコンのパスワードを入れます）

**🪟 Windows の人**

- スタートボタンをおして、**AivisSpeech Studio** をえらびます
- ⚠️ 「WindowsによってPCが保護されました」と青い画面が出たら、**「詳細情報」** をおしてから **「実行」** をおします。こわれているわけではありません。

### ステップ4　しゃべらせてみよう！

1. もし「AivisSpeech が必要です」と出たら → 「ダウンロードページを開く」をおして、ステップ1をやります。入れて **AivisSpeech をひらく** と、このアプリが自動でつながります
2. もし「AivisSpeech を起動しますか？」と出たら → **「AivisSpeech を起動」** をおします
3. 画面の四角い場所に、読ませたい文章を書きます（例：「こんにちは！」）
4. ▶（再生）のボタンをおすと、声が出ます 🎉

---

## 🆘 こまったとき

| こうなった | こうしてみて |
|---|---|
| 声が出ない | パソコンの音量が小さくなっていないか見てください。それから AivisSpeech がひらいているか見てください |
| 話す人（声の種類）の一覧が空っぽ | AivisSpeech をひらいてから、このアプリをとじて、もう一度ひらいてください |
| 「開発元が未確認」「PCが保護されました」と出た | ステップ3の ⚠️ のところを見てください |
| 「AivisSpeech が必要です」と出た | ステップ1をやってください |

それでもだめなときは、おうちの人や詳しい人に、このページを見せてください。

---
---

## 👩‍💻 ここから下は、作る人（開発者）向けです

### 仕組み

```
Electron
 ├─ 同梱ルーター (hit-aivis-router を PyInstaller で固めたもの)  127.0.0.1:<空きポート>
 │     └─ AivisSpeech Engine (ユーザーが別途インストール) 127.0.0.1:10101
 └─ 同梱の画面 (hit-aivis-webui の index.html)  ← 「かんたんモード」で表示
```

- 画面とルーターはサーバー版のファイルを**ビルド時にコピー**して使います（このリポジトリには入れない）。サーバー版の更新は `npm run prepare:vendor` で取り込めます。
- 接続先ポートと既定の表示モードは `preload.js` が localStorage に入れます（画面側は無改造）。
- 設定・履歴などは OS のアプリデータ領域（Mac: `~/Library/Application Support/hit-aivis-desktop/router/`、Windows: `%APPDATA%\hit-aivis-desktop\router\`）に保存されます。ルーターのログは同フォルダの親にある `router.log` です。

### AivisSpeech が見つからないとき

起動時に AivisSpeech Engine（既定 `127.0.0.1:10101`）が応答しないと、ダイアログが出ます。

- **入っているが起動していない** → 「AivisSpeech を起動」で起動し、エンジンが立ち上がったら画面を自動で再読み込み
- **入っていない** → 「ダウンロードページを開く」で公式サイト（`https://aivis-project.com/`）を開き、入れて起動してもらうと自動で再接続（最大10分待つ）
- 探す場所: Mac は `/Applications/AivisSpeech.app` と `~/Applications/`、Windows は `%LOCALAPPDATA%\Programs\AivisSpeech\AivisSpeech.exe` と `Program Files`（**Windows の場所は公式の既定を想定したもので、実機では未確認**）

### 使い方（開発）

前提: Node.js、Python 3.12（ルーターのビルド用）、AivisSpeech アプリ（エンジン）。

```bash
npm install
npm run prepare:vendor   # 画面のコピー + ルーターのビルド(vendor/ に出力)
npm start                # AivisSpeech を起動してから
```

環境変数: `AIVIS_BACKEND_URLS`（エンジンの場所。既定 `http://127.0.0.1:10101`）、`AIVIS_ROUTER_BIN`（ルーター実行ファイルの差し替え）。

### インストーラーを作る

```bash
npm run prepare:vendor   # 画面とルーターを vendor/ に集める（初回・サーバー版を更新したとき）
npm run dist:mac         # dist/AivisSpeech-Studio-<版>-mac-arm64.dmg
npm run dist:win         # dist/AivisSpeech-Studio-<版>-win-x64.exe （Windows 上で実行する）
```

- **Mac 版**: Apple Silicon 専用（約136MB）。**署名・公証なし**（ad-hoc 署名のみ。`scripts/adhoc-sign.js`）。自分の Mac ではそのまま動きますが、**ダウンロードして別の Mac で開く**と「開発元が未確認」の警告が出ます。警告なしで配るには Apple Developer での署名と公証が必要です。
- **アイコン**は Electron の既定のままです。

### Windows版を作る

ルーターを固める PyInstaller は**動かしている OS 用のものしか作れない**ため、Mac では Windows 用の `.exe` は作れません。次のどちらかで作ります。

1. **GitHub Actions（推奨）**: `.github/workflows/build.yml` が Mac 版と Windows 版を同時に作ります。Actions タブの「Run workflow」で実行 → 成果物（Artifacts）をダウンロード。
   サーバー版の画面・ルーター（公開リポジトリ）を取り込むので、**ルーターの `desktop/` を先に push しておく必要があります**。
2. **Windows の PC で手作業**: Node.js と Python 3.12 を入れて、`npm install` → `npm run prepare:vendor` → `npm run dist:win`。

> ⚠️ Windows 版は**まだ一度も作って動かしていません**。署名なしなので、配ると SmartScreen の警告（「詳細情報」→「実行」）が出ます。

### 未対応（これから）

- 署名・公証（Mac）、コード署名（Windows）、自動更新、アプリアイコン
- Intel Mac のビルド
- 初回起動での「ローカルエンジン / Aivis Cloud(自前APIキー)」の選択
- 同梱 ffmpeg のライセンス確認（配布前に LGPL ビルドへ）
- 配布ページ（ダウンロード用のリンク）
