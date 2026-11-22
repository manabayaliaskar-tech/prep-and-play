import { grammarMaker, irregularMaker, comparisonMaker } from '/home/user/School/src/pools/english/gen.js';
import { createRng } from '/home/user/School/src/core/random.js';
const t=(x,l='ru')=>typeof x==='object'?x[l]:x;
const rng=createRng(+process.argv[2]||1);
for (const [name,mk] of [['g',grammarMaker('e.gram')],['i',irregularMaker('e.irreg')],['c',comparisonMaker('e.comp')]])
for(let lv=1;lv<=6;lv++) for(let i=0;i<2;i++){const q=mk({rng,used:new Set()},lv); console.log(`[${q.id} ${q.level}] ${t(q.prompt)} ${q.passage??''}\n   ${q.choices.map((c,i)=>(i===q.answer?'*':'')+t(c)).join(' / ')}\n   ${t(q.ex)}`);}
