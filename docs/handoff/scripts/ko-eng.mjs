import { koForms, koWrong } from '/home/user/School/src/pools/languages/ko-verbs.js';
import { KO_WORDS } from '/home/user/School/src/pools/languages/ko-words.js';
const pick = ['가다','오다','먹다','마시다','보다','쓰다','듣다','살다','만들다','모르다','돕다','춥다','낫다','공부하다','바쁘다','예쁘다','배우다','기다리다','쉬다','앉다','걷다','부르다','짓다','게으르다','비롯되다','이루다','배고프다','크다','고르다','열다','붓다','줍다','귀엽다','다르다'];
for (const k of pick) { const w = KO_WORDS.find(x=>x.ko===k); if(!w){console.log('missing',k);continue;} const f=koForms(w); console.log(k, Object.entries(f).map(([a,b])=>`${a}=${b}`).join(' ')); console.log('   wrong yo:', koWrong(w,'yo').join(','), '| fut:', koWrong(w,'fut').join(','), '| hon:', w.pos==='v'?koWrong(w,'hon').join(','):''); }
for (let lv=1; lv<=6; lv++) console.log(lv, KO_WORDS.filter(w=>w.level===lv).length);
const seen=new Set(); for (const w of KO_WORDS){ if(seen.has(w.ko)) console.log('dup',w.ko); seen.add(w.ko);}
