// Сборка src/explain/scenes-science.js из частей: head.js + parts/*.js (код до //@@SCENE - верх модуля, после - члены объекта).
import fs from 'node:fs';
import path from 'node:path';

const dir = path.dirname(new URL(import.meta.url).pathname);
const out = '/home/user/School/src/explain/scenes-science.js';
const keepOld = process.argv.includes('--old');
const head = fs.readFileSync(path.join(dir, 'head.js'), 'utf8').trimEnd();
const files = fs.readdirSync(path.join(dir, 'parts')).filter((f) => f.endsWith('.js')).sort();
const tops = [];
const members = [];
const ids = new Set();
for (const f of files) {
  const src = fs.readFileSync(path.join(dir, 'parts', f), 'utf8');
  const [top, mem] = src.includes('//@@SCENE') ? src.split('//@@SCENE') : ['', src];
  if (top.trim()) tops.push(top.trim());
  if (mem.trim()) members.push(mem.replace(/^\n+/, '').trimEnd());
  for (const m of mem.matchAll(/^  ('?)([a-z-]+)\1: \{$/gm)) ids.add(m[2]);
}
let old = '';
if (keepOld) {
  const body = fs.readFileSync(path.join(dir, 'old-body.js'), 'utf8').split('\n');
  let cur = null;
  const blocks = [];
  for (const line of body) {
    const m = line.match(/^  ('?)([a-z-]+)\1: \{$/);
    if (m) {
      cur = { id: m[2], lines: [] };
      blocks.push(cur);
    }
    if (cur) cur.lines.push(line);
  }
  old = blocks
    .filter((b) => !ids.has(b.id))
    .map((b) => b.lines.join('\n').trimEnd())
    .join('\n\n');
  old = old.replace(/\n\};\s*$/, '');
}
const data = keepOld ? fs.readFileSync(path.join(dir, 'old-data.js'), 'utf8') : '';
const text = `${head}\n\n${tops.join('\n\n')}\n\nexport const SCENES_SCIENCE = {\n${members.join('\n\n')}\n${old}\n};\n${data}`;
fs.writeFileSync(out, text.replace(/\n{3,}/g, '\n\n'));
console.log('scenes new:', [...ids].join(' '), keepOld ? '(+old)' : '');
