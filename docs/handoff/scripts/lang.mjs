import { verbsMaker } from '/home/user/School/src/pools/languages/verbs.js';
import { wordsMaker, WORDS } from '/home/user/School/src/pools/languages/vocab.js';
import { createRng } from '/home/user/School/src/core/random.js';
const show=(q,l='ru')=>{const t=x=>typeof x==='object'?x[l]:x; console.log(`[${q.id}] ${t(q.prompt)} ${q.passage?'| '+q.passage:''}\n   ${q.choices.map((c,i)=>(i===q.answer?'*':'')+t(c)).join(' / ')}\n   ${t(q.ex)}`);};
const lang=process.argv[2], kind=process.argv[3], n=+process.argv[4]||6;
const rng=createRng(+process.argv[5]||3);
for (let lv=1;lv<=6;lv++){ const mk = kind==='v'? verbsMaker('x.v',lang):wordsMaker('x.w',lang); for(let i=0;i<n;i++) show(mk({rng,used:new Set()},lv)); }
console.log(WORDS.length);
