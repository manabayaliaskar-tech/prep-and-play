import { COURSES } from '/home/user/School/src/catalog/courses.js';
import { TOPICS } from '/home/user/School/src/pools/topics.js';
import { createRng } from '/home/user/School/src/core/random.js';
const res=[]; let grand=new Set();
for (const c of COURSES) for (const t of c.tracks) {
  const seen=new Set(); const rng=createRng(2);
  for (let i=0;i<600;i++) for (const [topic, keys] of t.spec) { const k = keys[i%keys.length]; const q=TOPICS[topic].make({rng,used:new Set(),state:{}},k); seen.add(q.id); grand.add(q.id); }
  res.push([seen.size, c.id+'/'+t.id]);
}
res.sort((a,b)=>a[0]-b[0]); console.log(res.slice(0,15).map(r=>r.join(' ')).join('\n')); console.log('tracks',res.length,'grand',grand.size);
