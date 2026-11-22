import { MATH_GENERATORS } from '/home/user/School/src/content/math/index.js';
import { createRng } from '/home/user/School/src/core/random.js';
const problems = {};
for (const g of MATH_GENERATORS) for (const d of [1,2,3]) for (let s=0;s<400;s++) {
  const rng = createRng(s*7+d); let q;
  try { q = g.make({ rng, mcOnly: s%2===0 }, d); } catch(e) { (problems[g.skill+d] ??= []).push('THROW '+e.message); continue; }
  const txt = JSON.stringify(q);
  const errs = [];
  if (/NaN|undefined|Infinity|null\)/.test(txt.replace(/"figure":null|"table":null|"spr":null/g,''))) errs.push('bad token');
  if (q.type==='mc') { if (q.choices.length!==4) errs.push('choices'); if (new Set(q.choices).size!==4) errs.push('dup choices '+q.choices.join(' | ')); if (!(q.answer>=0&&q.answer<4)) errs.push('answer'); }
  else if (!Number.isFinite(q.value)) errs.push('spr value');
  if (s%2===0 && q.type==='spr') errs.push('spr in mcOnly');
  for (const l of ['en','ru','kk']) if (!Array.isArray(q.ex[l]) || q.ex[l].length !== q.ex.en.length) errs.push('ex '+l);
  if (errs.length) (problems[g.skill+d] ??= []).push(errs.join(',') + ' :: ' + q.prompt.slice(0,80));
}
for (const [k,v] of Object.entries(problems)) console.log(k, v.length, v.slice(0,2));
console.log('done', MATH_GENERATORS.length);
