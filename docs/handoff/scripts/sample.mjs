import { TOPICS } from '/home/user/School/src/pools/topics.js';
import { createRng } from '/home/user/School/src/core/random.js';
const only = process.argv[2] ?? '';
const lang = process.argv[3] ?? 'ru';
const per = Number(process.argv[4] ?? 2);
const strip = (s) => String(s).replace(/<span class="frac"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, '($1)/($2)').replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<sub>(.*?)<\/sub>/g, '_$1').replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ');
const tx = (x) => (typeof x === 'object' && x ? x[lang] : x);
for (const [id, t] of Object.entries(TOPICS)) {
  if (!id.startsWith(only)) continue;
  for (const d of [1, 2, 3]) for (let s = 0; s < per; s++) {
    const q = t.make({ rng: createRng(1000 + s * 77 + d * 13), mcOnly: s % 2 === 0, used: new Set() }, d);
    const ans = q.type === 'mc' ? strip(tx(q.choices[q.answer])) + '   [' + q.choices.map((c) => strip(tx(c))).join(' | ') + ']' : 'SPR ' + q.display;
    console.log(`${id} d${d}: ${q.passage ? strip(tx(q.passage)) + ' // ' : ''}${strip(tx(q.prompt))}\n      => ${ans}\n      ex: ${(Array.isArray(q.ex[lang]) ? q.ex[lang] : [q.ex[lang]]).map(strip).join(' ▸ ')}`);
  }
}
