// usage: node stills.mjs <outDir> <sec> [sec...]  — renders review stills
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [out, ...secs] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Edit1019', browserExecutable});
for (const s of secs) {
  await renderStill({serveUrl, composition, browserExecutable, frame: Math.round(Number(s) * 60), output: `${out}/f_${s}.jpg`, imageFormat: 'jpeg', jpegQuality: 80});
  console.log('ok', s);
}
