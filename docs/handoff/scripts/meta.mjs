import { build } from 'esbuild';
const r = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'esm', write: false, metafile: true, outfile: 'x.js' });
const ins = Object.entries(r.metafile.outputs['x.js'].inputs).map(([f, v]) => [f, v.bytesInOutput]).sort((a, b) => b[1] - a[1]);
const dir = {};
for (const [f, b] of ins) { const d = f.split('/').slice(0, 3).join('/'); dir[d] = (dir[d] ?? 0) + b; }
console.log(Object.entries(dir).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([d, b]) => `${(b / 1024).toFixed(0)}KB ${d}`).join('\n'));
console.log('--- top files'); console.log(ins.slice(0, 12).map(([f, b]) => `${(b / 1024).toFixed(0)}KB ${f}`).join('\n'));
