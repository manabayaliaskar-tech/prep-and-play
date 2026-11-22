const { TOPICS } = await import('/home/user/School/src/pools/topics.js');
const { COURSES } = await import('/home/user/School/src/catalog/index.js');
const { createRng } = await import('/home/user/School/src/core/random.js');
const { buildSet } = await import('/home/user/School/src/content/bank.js');
const clean = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/−/g, '-').replace(/\s+/g, '').toLowerCase();
const tx = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v.ru ?? v.en : v);
const keys = {};
for (const c of COURSES) for (const tr of c.tracks) for (const [tp, ks] of tr.spec) (keys[tp] ??= new Set()), ks.forEach((k) => keys[tp].add(k));
const res = {};
let n = 0;
for (const tp of Object.keys(TOPICS).filter((x) => x.startsWith('m.') || x.startsWith('p.') || x.startsWith('c.mol'))) {
  for (const k of keys[tp] ?? [1, 2, 3]) for (let s = 1; s <= 30; s++) {
    const q = TOPICS[tp].make({ rng: createRng(s * 31 + k), used: new Set(), state: {} }, k);
    if (q.type !== 'mc' || !q.ex) continue;
    n++;
    const right = clean(tx(q.choices[q.answer]));
    const ex = clean([].concat(tx(q.ex) ?? []).join(' '));
    if (right.length && !ex.includes(right)) { (res[tp + ' [' + k + ']'] ??= []).push(`${tx(q.choices[q.answer])} :: ${[].concat(tx(q.ex)).join(' / ').replace(/<[^>]+>/g,'').slice(0, 160)}`); }
  }
}
console.log('math mc checked', n);
for (const [k, v] of Object.entries(res).sort((a, b) => b[1].length - a[1].length)) console.log(v.length, k, '\n   e.g.', v[0]);
// SAT bank
let bad = 0, m = 0;
for (const section of ['rw', 'math']) for (let s = 1; s <= 60; s++) {
  for (const q of buildSet({ rng: createRng(s), section, difficulties: [1, 2, 3], count: 12 })) {
    m++;
    if (q.type === 'mc') {
      const c = q.choices.map((x) => clean(tx(x)));
      if (new Set(c).size !== c.length || !(q.answer >= 0 && q.answer < c.length)) { bad++; if (bad < 5) console.log('SAT bad', q.id, c.join('|')); }
    } else if (q.type === 'spr' && (q.value === undefined || Number.isNaN(q.value))) { bad++; console.log('SAT spr', q.id); }
  }
}
console.log('SAT checked', m, 'bad', bad);
