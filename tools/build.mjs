// Сборка сайта для публикации: node tools/build.mjs → папка _site.
// Исходники не меняются: код из 160+ модулей склеивается в один сжатый файл src/main.js,
// стили сжимаются, картинки и остальные файлы копируются как есть.
// Код делится на части: при первом заходе грузится только нужное главной.
// Так на телефоне сайт грузит один файл вместо цепочки из сотен - заметно быстрее, особенно на медленном интернете.

import { build, transform } from 'esbuild';
import { cpSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const OUT = '_site';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/styles`, { recursive: true });

for (const item of ['index.html', 'manifest.webmanifest', 'sw.js', 'icons']) cpSync(item, `${OUT}/${item}`, { recursive: true });

const result = await build({
  entryPoints: ['src/main.js'],
  outdir: `${OUT}/src`,
  // Код делится на части: главная грузит только своё, а задания, магазин и т. д. - когда их открывают.
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
  metafile: true,
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

// Номер версии в ссылках на код и стили: после публикации браузер сразу берёт новые файлы, а не старую копию из кеша.
const chunks = Object.keys(result.metafile.outputs).filter((f) => f.includes('/chunks/')).map((f) => f.slice(`${OUT}/`.length));
const hash = createHash('sha1').update(readFileSync(`${OUT}/src/main.js`)).update(chunks.join()).update(css.code).digest('hex').slice(0, 10);
const html = readFileSync(`${OUT}/index.html`, 'utf8').replace('href="styles/main.css"', `href="styles/main.css?v=${hash}"`).replace('src="src/main.js"', `src="src/main.js?v=${hash}"`);
writeFileSync(`${OUT}/index.html`, html);
writeFileSync(
  `${OUT}/sw.js`,
  readFileSync(`${OUT}/sw.js`, 'utf8')
    .replace("const CACHE = 'prepplay-v2';", `const CACHE = 'prepplay-${hash}';`)
    .replace('const LAZY = [];', `const LAZY = ${JSON.stringify(chunks)};`),
);

const kb = (f) => {
  const raw = statSync(f).size;
  const gz = gzipSync(readFileSync(f)).length;
  return `${(raw / 1024).toFixed(0)} КБ (сжатие при передаче: ${(gz / 1024).toFixed(0)} КБ)`;
};
const firstLoad = [`${OUT}/src/main.js`, ...result.metafile.outputs[`${OUT}/src/main.js`].imports.filter((i) => i.kind === 'import-statement').map((i) => i.path)];
const sum = (list, fn) => list.reduce((a, f) => a + fn(f), 0);
console.log(`src/main.js + сразу нужные части - ${(sum(firstLoad, (f) => statSync(f).size) / 1024).toFixed(0)} КБ (сжатие: ${(sum(firstLoad, (f) => gzipSync(readFileSync(f)).length) / 1024).toFixed(0)} КБ)`);
console.log(`частей кода по требованию: ${chunks.length}, всего ${(sum(chunks.map((c) => `${OUT}/${c}`), (f) => statSync(f).size) / 1024).toFixed(0)} КБ`);
console.log(`styles/main.css - ${kb(`${OUT}/styles/main.css`)}`);
