// electron-builder の afterPack フック。Developer ID が無いビルドでも、アプリ全体に正しい ad-hoc 署名を付ける。
// （同梱の Electron を書き換えると元の署名の封印が壊れるため、そのままだと macOS の検査で不整合になる）
// 配布用に Developer ID で署名・公証するときは、このフックを外して mac.identity を設定する。
const { execFileSync } = require('child_process');
const path = require('path');

exports.default = async function (context) {
  if (context.electronPlatformName !== 'darwin') return;
  const app = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
  console.log('  • ad-hoc signed:', app);
};
