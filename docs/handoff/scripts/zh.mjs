import { hanziMaker } from '/home/user/School/src/pools/languages/zh.js';
import { HANZI } from '/home/user/School/src/pools/languages/hanzi.js';
import { createRng } from '/home/user/School/src/core/random.js';
const t=(x,l='ru')=>typeof x==='object'?x[l]:x;
const rng=createRng(5); const mk=hanziMaker('zh.words');
for(let lv=1;lv<=6;lv++) for(let i=0;i<3;i++){const q=mk({rng,used:new Set()},lv); console.log(`[${q.id}] ${t(q.prompt)} ${q.passage??''}\n   ${q.choices.map((c,i)=>(i===q.answer?'*':'')+t(c)).join(' / ')}\n   ${t(q.ex)}`);}
const seen=new Set(); for(const w of HANZI){ if(seen.has(w.hz)) console.log('DUP',w.hz); seen.add(w.hz);} console.log(HANZI.length, [1,2,3,4,5,6].map(l=>HANZI.filter(w=>w.level===l).length));
