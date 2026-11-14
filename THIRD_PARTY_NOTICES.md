# サードパーティのソフトウェアとライセンス

AivisSpeech Studio デスクトップ版は、次のソフトウェアを利用・同梱しています。
それぞれの著作権は各権利者に帰属し、各ライセンスの条件に従って利用しています。
このアプリ自身のコードは MIT License（[LICENSE](LICENSE)）です。
（インストーラーにも、この文書を `THIRD_PARTY_NOTICES.md` として同梱しています）

## 利用するが同梱しないもの

| 名称 | ライセンス | 説明 |
|---|---|---|
| [AivisSpeech](https://github.com/Aivis-Project/AivisSpeech) / [AivisSpeech Engine](https://github.com/Aivis-Project/AivisSpeech-Engine) | LGPL-3.0 | 音声合成を行う本体です。ユーザーが別にインストールして使います。このアプリには含まれていません。 |
| 音声モデル（`.aivmx`。[Aivis Hub](https://hub.aivis-project.com/) で配布） | モデルごとに異なります（例: ACML） | 声の種類ごとに利用規約・ライセンスがあります。使うモデルの条件に従ってください。 |

## 同梱しているもの

### FFmpeg

- バージョン: 7.1（[imageio-ffmpeg](https://github.com/imageio/imageio-ffmpeg) が配布する静的ビルド。ルーターの中で、音声を MP3 に変換するために使います）
- ライセンス: **GNU GPL v2 以降**（この静的ビルドは `--enable-gpl` を指定してビルドされており、libx264・libx265・libmp3lame などを含みます）
- FFmpeg のソースコード: <https://ffmpeg.org/download.html>
- FFmpeg は、このアプリのほかの部分とは別の実行ファイルとして同梱し、コマンドとして呼び出して使っています。
- 今後、GPL を含まない（LGPL のみの）ビルドへ切り替える予定です。

### Electron / Chromium

- Electron 33（MIT License）、およびそれに含まれる Chromium と各種ライブラリ（BSD などの各ライセンス）。
- Chromium に含まれるライブラリのライセンス一覧は、Electron の配布物に含まれる `LICENSES.chromium.html` に載っています（Windows 版のインストール先に入ります）。
- <https://github.com/electron/electron/blob/main/LICENSE>

### 同梱ルーター（Python のプログラム）

画面とルーター（[hit-aivis-router](https://github.com/hit1023/hit-aivis-router)）は [PyInstaller](https://pyinstaller.org/) で固めて同梱しています。

| 名称 | バージョン | ライセンス |
|---|---|---|
| Python | 3.12 | PSF License |
| PyInstaller | 6.11.1 | GPL-2.0-or-later（ブートローダー例外付き。作成したプログラムには GPL は及びません） |
| FastAPI | 0.115.0 | MIT |
| Starlette | 0.38.x | BSD-3-Clause |
| Uvicorn | 0.30.6 | BSD-3-Clause |
| HTTPX | 0.27.2 | BSD-3-Clause |
| Pydantic / pydantic-settings | 2.x / 2.5.2 | MIT |
| pydub | 0.25.1 | MIT |
| python-multipart | 0.0.12 | Apache-2.0 |
| imageio-ffmpeg | 0.6.0 | BSD-2-Clause |

上の表のライブラリが依存するそのほかのパッケージ（anyio、h11、certifi など）も、MIT・BSD・Apache・MPL などの許諾型ライセンスです。

### 画面（hit-aivis-webui）

- [hit-aivis-webui](https://github.com/hit1023/hit-aivis-webui) の `index.html` などを、そのままコピーして使っています。
- フォント: Syne、JetBrains Mono、Noto Sans JP（いずれも SIL Open Font License 1.1）。Google Fonts から読み込みます。

## ライセンスの全文

各ライセンスの全文は、それぞれのプロジェクトのサイトに載っています。

- GNU GPL v2: <https://www.gnu.org/licenses/old-licenses/gpl-2.0.html>
- GNU LGPL v3: <https://www.gnu.org/licenses/lgpl-3.0.html>
- MIT License: <https://opensource.org/license/mit>
- BSD 3-Clause: <https://opensource.org/license/bsd-3-clause>
- SIL Open Font License 1.1: <https://openfontlicense.org/>
