import { hangulMaker, koWordsMaker, koBankMaker, koCounts } from '/home/user/School/src/pools/languages/ko.js';
import { createRng } from '/home/user/School/src/core/random.js';
const text = (x, l) => (x && typeof x === 'object' ? x[l] : String(x));
const problems = [];
const makers = { 'ko.hangul': [hangulMaker('ko.hangul'), [1, 2]], 'ko.words': [koWordsMaker('ko.words'), [1, 2, 3, 4, 5, 6]], 'ko.bank': [koBankMaker('ko.bank'), [1, 2, 3, 4, 5, 6]] };
for (const [id, [make, levels]] of Object.entries(makers)) for (const lv of levels) {
  const ids = new Set();
  for (let s = 0; s < 1500; s++) {
    const q = make({ rng: createRng(s * 7 + lv), used: new Set() }, lv);
    ids.add(q.id);
    for (const l of ['en', 'ru', 'kk']) {
      const c = q.choices.map((x) => text(x, l));
      if (new Set(c).size !== 4) problems.push(`${id} ${lv} dup ${l}: ${c.join(' | ')}`);
    }
    if (/undefined|NaN/.test(JSON.stringify(q))) problems.push(`${id} undefined ${JSON.stringify(q).slice(0, 200)}`);
  }
  console.log(id, lv, 'distinct', ids.size);
}
for (let lv = 1; lv <= 6; lv++) console.log(lv, koCounts(lv));
console.log([...new Set(problems)].slice(0, 30).join('\n'));
const t = (x) => (x && typeof x === 'object' ? x.ru : x);
const rng = createRng(9);
for (const [id, [make, levels]] of Object.entries(makers)) for (const lv of levels) for (let i = 0; i < 2; i++) { const q = make({ rng, used: new Set() }, lv); console.log(q.id, '|', t(q.prompt), '|', q.passage ?? '', '|', q.choices.map(t).join(' / '), '| ✓', t(q.choices[q.answer]), '|', t(q.ex)); }
