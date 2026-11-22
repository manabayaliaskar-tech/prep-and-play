import { build } from 'esbuild';
const target = process.argv[2];
const r = await build({ entryPoints: ['src/main.js'], bundle: true, write: false, metafile: true, outdir: 'xx', format: 'esm', splitting: true });
const g = r.metafile.inputs;
// Только статические импорты (как при первой загрузке).
const prev = { 'src/main.js': null };
const q = ['src/main.js'];
while (q.length) {
  const f = q.shift();
  for (const im of g[f]?.imports ?? []) if (im.kind === 'import-statement' && !(im.path in prev)) (prev[im.path] = f), q.push(im.path);
}
const t = Object.keys(prev).find((f) => f.includes(target));
const path = [];
for (let c = t; c; c = prev[c]) path.unshift(c);
console.log(path.join('\n  -> '));
