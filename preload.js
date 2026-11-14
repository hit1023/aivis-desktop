// ページのスクリプトより先に実行され、接続先（同梱ルーターのポート）と既定の表示モードを localStorage に入れる。
// サーバー版の index.html は localStorage の aivis_api_url / aivis_ui_mode を読むので、画面側は無改造で動く。
const arg = process.argv.find((a) => a.startsWith('--aivis-api-port='));
if (arg) {
  const port = arg.split('=')[1];
  try {
    localStorage.setItem('aivis_api_url', `http://127.0.0.1:${port}`);
    // 表示モードはユーザーが設定で変えたものを尊重し、未設定のときだけ「かんたん」にする
    if (!localStorage.getItem('aivis_ui_mode')) localStorage.setItem('aivis_ui_mode', 'simple');
  } catch (e) { /* 保存できなくても画面は動く */ }
}
