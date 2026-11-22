import { TOPICS } from '/home/user/School/src/pools/topics.js';
import { createRng } from '/home/user/School/src/core/random.js';
import { COURSES } from '/home/user/School/src/catalog/courses.js';
const keysFor = {};
const walk = (spec) => { for (const [tp, keys] of spec ?? []) { keysFor[tp] ??= new Set(); keys.forEach(k => keysFor[tp].add(k)); } };
for (const c of COURSES) for (const tr of c.tracks ?? []) walk(tr.spec);
const rows = [];
for (const [id, T] of Object.entries(TOPICS)) {
  const keys = [...(keysFor[id] ?? [1])];
  let n = 0, noEx = 0, arr = 0, short = 0;
  const rng = createRng(7);
  for (const k of keys) for (let i = 0; i < 6; i++) {
    let q; try { q = T.make({ rng, used: new Set(), state: {} }, k); } catch (e) { continue; }
    n++;
    const ex = q.ex?.ru ?? q.ex?.en ?? q.ex;
    if (!ex || (typeof ex === 'string' && ex.length < 3)) noEx++;
    else if (Array.isArray(ex)) arr++;
    else if (String(ex).length < 60) short++;
  }
  rows.push([id, T.pool, n, noEx, arr, short]);
}
console.log('topics', rows.length);
for (const r of rows) if (r[3] || r[5] > r[2] / 2) console.log(r.join('\t'));
