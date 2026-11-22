import { COURSES } from '/home/user/School/src/catalog/courses.js';
import { TOPICS } from '/home/user/School/src/pools/topics.js';
import { createRng } from '/home/user/School/src/core/random.js';
const ids = process.argv.slice(2);
for (const id of ids) {
  const c = COURSES.find((x) => x.id === id); let total = 0; const per = [];
  const all = new Set();
  for (const t of c.tracks) {
    const seen = new Set(); const rng = createRng(1);
    for (const [topic, keys] of t.spec) for (const k of keys) for (let i = 0; i < 3000; i++) { const q = TOPICS[topic].make({ rng, used: new Set(), state: {} }, k); seen.add(q.id); all.add(q.id); }
    per.push(seen.size);
  }
  console.log(id, 'всего', all.size, 'по уровням', per.join(' '));
}
