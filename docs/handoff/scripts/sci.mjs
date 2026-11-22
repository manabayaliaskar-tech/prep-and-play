import { TOPICS } from '/home/user/School/src/pools/topics.js';
import { createRng } from '/home/user/School/src/core/random.js';
const t=(x,l='ru')=>typeof x==='object'&&x?x[l]:x;
const ids=process.argv[2].split(','); const n=+process.argv[3]||2; const show=process.argv[4]!=='q';
for (const id of ids) { const ids2=new Set(); const rng=createRng(9);
 for(let d=1;d<=3;d++) for(let i=0;i<n;i++){ const q=TOPICS[id].make({rng,used:new Set()},d); ids2.add(q.id);
  const blob=JSON.stringify(q); if(/undefined|NaN|null,/.test(JSON.stringify([q.prompt,q.choices,q.ex]))) console.log('BAD',q.id,blob.slice(0,300));
  const keys=(q.choices??[]).map(c=>t(c,'kk')); if(q.choices && new Set(keys).size!==keys.length) console.log('DUPKK',q.id,keys);
  if(show) console.log(`[${q.id}] ${t(q.prompt)} ${q.passage??''}\n   ${(q.choices??[q.display]).map((c,i)=>(i===q.answer?'*':'')+t(c)).join(' / ')}\n   ${JSON.stringify(t(q.ex)).slice(0,200)}`);}
 console.log(id,'distinct',ids2.size,'of',3*n);}
