import { TOPICS } from '/home/user/School/src/pools/topics.js';
import { createRng as mulberry32 } from '/home/user/School/src/core/random.js';
const ids = process.argv.slice(2);
for (const id of ids) {
  const t = TOPICS[id];
  const rng = mulberry32(7);
  const q = t.make({ rng, used: new Set(), state: {}, mcOnly: true }, 2);
  console.log(id, JSON.stringify(q, null, 0).slice(0, 900));
}
