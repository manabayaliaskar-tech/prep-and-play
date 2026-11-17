// Сборка сайта для публикации: node tools/build.mjs → папка _site.
// Исходники не меняются: код из 160+ модулей склеивается в один сжатый файл src/main.js,
// стили сжимаются, картинки и остальные файлы копируются как есть.
// Так на телефоне сайт грузит один файл вместо цепочки из сотен — заметно быстрее, особенно на медленном интернете.

import { build, transform } from 'esbuild';
import { cpSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const OUT = '_site';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/styles`, { recursive: true });

for (const item of ['index.html', 'manifest.webmanifest', 'sw.js', 'icons']) cpSync(item, `${OUT}/${item}`, { recursive: true });

await build({
  entryPoints: ['src/main.js'],
  outfile: `${OUT}/src/main.js`,
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2020'],
  charset: 'utf8',
  legalComments: 'none',
  logLevel: 'warning',
});

const css = await transform(readFileSync('styles/main.css', 'utf8'), { loader: 'css', minify: true, charset: 'utf8' });
writeFileSync(`${OUT}/styles/main.css`, css.code);

const kb = (f) => {
  const raw = statSync(f).size;
  const gz = gzipSync(readFileSync(f)).length;
  return `${(raw / 1024).toFixed(0)} КБ (сжатие при передаче: ${(gz / 1024).toFixed(0)} КБ)`;
};
console.log(`src/main.js — ${kb(`${OUT}/src/main.js`)}`);
console.log(`styles/main.css — ${kb(`${OUT}/styles/main.css`)}`);
