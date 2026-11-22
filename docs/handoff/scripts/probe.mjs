import { TOPICS } from '/home/user/School/src/pools/topics.js';
import { createRng } from '/home/user/School/src/core/random.js';
const only = process.argv[2];
let bad = 0;
for (const [id, t] of Object.entries(TOPICS)) {
  if (only && !id.startsWith(only)) continue;
  for (const d of (/^(es|fr|zh)\./.test(id) ? [1, 2, 3, 4] : [1, 2, 3])) {
    for (let s = 0; s < 400; s++) {
      let q;
      try { q = t.make({ rng: createRng(s * 31 + d), mcOnly: s % 3 === 0, used: new Set() }, d); }
      catch (e) { console.log('THROW', id, d, s, e.message); bad++; continue; }
      const blob = JSON.stringify([q.prompt, q.choices ?? '', q.ex, q.display ?? '', q.passage ?? '']);
      if (/NaN|undefined|Infinity|null/.test(blob)) { console.log('BAD', id, d, s, blob.slice(0, 300)); bad++; }
      if (q.type === 'mc') {
        const keys = q.choices.map((c) => (typeof c === 'object' ? c.en : c));
        if (new Set(keys).size !== 4 || !(q.answer >= 0 && q.answer < 4)) { console.log('DUP', id, d, s, keys); bad++; }
      } else if (!Number.isFinite(q.value)) { console.log('SPR', id, d, s); bad++; }
      for (const l of ['en', 'ru', 'kk']) {
        if (!q.prompt[l] || (Array.isArray(q.ex.en) && q.ex[l].length !== q.ex.en.length) || !q.ex[l] || q.ex[l].length === 0) { console.log('LANG', id, d, s, l); bad++; }
      }
      if (bad > 30) process.exit(1);
    }
  }
}
console.log('probe done, problems:', bad);
