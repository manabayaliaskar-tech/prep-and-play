const { TOPICS } = await import('/home/user/School/src/pools/topics.js');
const { COURSES } = await import('/home/user/School/src/catalog/index.js');
const { createRng } = await import('/home/user/School/src/core/random.js');
const N = Number(process.argv[2] || 40);
const keys = {};
for (const c of COURSES) for (const tr of c.tracks) for (const [tp, ks] of tr.spec) (keys[tp] ??= new Set()), ks.forEach((k) => keys[tp].add(k));
const strs = (v) => (v == null ? [] : typeof v === 'string' || typeof v === 'number' ? [String(v)] : Array.isArray(v) ? v.flatMap(strs) : typeof v === 'object' ? Object.values(v).flatMap(strs) : []);
const norm = (v) => (typeof v === 'object' && v ? v.ru ?? v.en : String(v)).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const issues = {};
const add = (tp, k, msg, q) => { const key = `${tp} [${k}] ${msg}`; if (!issues[key]) issues[key] = { n: 0, ex: q }; issues[key].n++; };
let total = 0;
for (const tp of Object.keys(TOPICS)) {
  const ks = keys[tp] ? [...keys[tp]] : [1, 2, 3];
  for (const k of ks) for (let s = 1; s <= N; s++) {
    let q;
    try { q = TOPICS[tp].make({ rng: createRng(s * 7919 + k), used: new Set(), state: {} }, k); } catch (e) { add(tp, k, 'THROW ' + e.message.slice(0, 60)); continue; }
    total++;
    const all = strs({ p: q.prompt, c: q.choices, e: q.ex, pass: q.passage });
    if (all.some((x) => /undefined|NaN|\[object|null\b/.test(x))) add(tp, k, 'bad token', all.find((x) => /undefined|NaN|\[object|null\b/.test(x)).slice(0, 120));
    if (q.prompt && typeof q.prompt === 'object' && ['en', 'ru', 'kk'].some((l) => !q.prompt[l] || !String(q.prompt[l]).trim())) add(tp, k, 'prompt missing lang');
    if (q.type === 'mc') {
      if (!Array.isArray(q.choices) || q.choices.length < 2) { add(tp, k, 'few choices'); continue; }
      if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length)) add(tp, k, 'answer out of range');
      const n = q.choices.map(norm);
      if (new Set(n).size !== n.length) add(tp, k, 'duplicate choices', n.join(' | ').slice(0, 140));
      if (n.some((x) => !x)) add(tp, k, 'empty choice');
    } else if (q.type === 'spr') {
      if (q.value === undefined || q.value === null || q.value === '' || Number.isNaN(q.value)) add(tp, k, 'spr no value');
    }
  }
}
console.log('checked', total);
for (const [k, v] of Object.entries(issues).sort((a, b) => b[1].n - a[1].n)) console.log(v.n, k, v.ex ? '=> ' + v.ex : '');
