import { TOPICS } from '/home/user/School/src/pools/topics.js';
import { createRng } from '/home/user/School/src/core/random.js';
const text = (x, l = 'en') => (x !== null && typeof x === 'object' ? x[l] : String(x));
for (const id of ['de.bank', 'de.words', 'de.verbs', 'tr.bank', 'tr.words', 'tr.verbs']) {
  const counts = [];
  for (let level = 1; level <= 6; level++) {
    const ids = new Set();
    const rng = createRng(level);
    for (let s = 0; s < 3000; s++) {
      const q = TOPICS[id].make({ rng, used: new Set() }, level);
      ids.add(q.id);
      const blob = JSON.stringify([q.prompt, q.choices, q.ex, q.passage ?? '']);
      if (/NaN|undefined|null|[—–]/.test(blob)) { console.log('BAD', id, blob.slice(0, 300)); process.exit(1); }
      for (const l of ['en', 'ru', 'kk']) if (new Set(q.choices.map((c) => text(c, l))).size !== 4) { console.log('DUPOPT', id, level, q.choices); process.exit(1); }
    }
    counts.push(ids.size);
  }
  console.log(id, counts.join(' '));
}
if (process.argv[2]) {
  const rng = createRng(5);
  for (let level = 1; level <= 6; level++) for (let s = 0; s < +process.argv[3]; s++) {
    const q = TOPICS[process.argv[2]].make({ rng, used: new Set() }, level);
    console.log(level, q.passage ?? '', '|', text(q.prompt, 'ru'), '=>', text(q.choices[q.answer], 'ru'), '|', q.choices.map((c) => text(c, 'ru')).join(' / '), '||', text(q.ex, 'kk'));
  }
}
