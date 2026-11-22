import { TOPICS } from '/home/user/School/src/pools/topics.js';
import { createRng } from '/home/user/School/src/core/random.js';
for (const id of ['h.uzt', 'h.kgt', 'h.tjt', 'h.azt', 'h.amt', 'h.byt', 'h.mdt']) {
  const rng = createRng(4);
  const seen = new Set();
  for (let i = 0; i < 400; i++) {
    const q = TOPICS[id].make({ rng, used: new Set(), state: {} }, 1 + (i % 3));
    if (new Set(q.choices.map((c) => c.ru ?? c)).size !== 4) console.log('DUP CHOICES', id, q.prompt.ru);
    seen.add(q.id);
  }
  const q = TOPICS[id].make({ rng, used: new Set(), state: {} }, 2);
  console.log(id, 'разных заданий:', seen.size, '|', q.prompt.ru, '→', q.choices[q.answer].ru);
}
