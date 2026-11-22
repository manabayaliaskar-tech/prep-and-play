import { build } from 'esbuild';
const r = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'esm', write: false, metafile: true, outdir: 'xx', splitting: true });
const main = r.metafile.outputs['xx/main.js'];
const eager = new Set(['xx/main.js']);
const q = ['xx/main.js'];
while (q.length) {
  const f = q.shift();
  for (const i of r.metafile.outputs[f].imports) if (i.kind === 'import-statement' && !eager.has(i.path)) eager.add(i.path), q.push(i.path);
}
const files = {};
for (const f of eager) for (const [inp, v] of Object.entries(r.metafile.outputs[f].inputs)) files[inp] = (files[inp] ?? 0) + v.bytesInOutput;
console.log(Object.entries(files).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([f, b]) => `${(b / 1024).toFixed(0)}KB ${f}`).join('\n'));
