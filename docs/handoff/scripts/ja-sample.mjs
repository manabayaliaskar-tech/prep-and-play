import { kanaMaker, jaWordsMaker, kanjiMaker, jaBankMaker } from '/home/user/School/src/pools/languages/ja.js';
import { createRng } from '/home/user/School/src/core/random.js';
const t = (x) => (x && typeof x === 'object' ? x.ru : x);
const show = (q) => console.log(q.id, '|', t(q.prompt), '|', q.passage ?? '', '|', q.choices.map(t).join(' / '), '| ✓', t(q.choices[q.answer]), '|', t(q.ex));
const rng = createRng(5);
for (const lv of [1,2,3]) show(kanaMaker('ja.kana')({ rng, used: new Set() }, lv));
for (const lv of [1,3,5]) for (let i=0;i<2;i++) show(jaWordsMaker('ja.words')({ rng, used: new Set() }, lv));
for (const lv of [1,4]) for (let i=0;i<3;i++) show(kanjiMaker('ja.kanji')({ rng, used: new Set() }, lv));
for (const lv of [1,2,3,4,5]) for (let i=0;i<3;i++) show(jaBankMaker('ja.bank')({ rng, used: new Set() }, lv));
