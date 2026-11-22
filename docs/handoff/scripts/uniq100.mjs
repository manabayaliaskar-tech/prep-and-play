const { TOPICS } = await import('/home/user/School/src/pools/topics.js');
const { TOPIC_NAMES } = await import('/home/user/School/src/pools/topic-names.js');
const { COURSES } = await import('/home/user/School/src/catalog/index.js');
const { createRng } = await import('/home/user/School/src/core/random.js');
const keys = {}; const usedIn = {};
for (const c of COURSES) for (const tr of c.tracks) for (const [tp, ks] of tr.spec) { (keys[tp] ??= new Set()); ks.forEach((k) => keys[tp].add(k)); (usedIn[tp] ??= new Set()).add(c.id); }
const rows = [];
for (const tp of Object.keys(TOPICS)) {
  const per = [];
  for (const k of keys[tp] ?? [1]) {
    const ids = new Set();
    const used = new Set();
    const rng = createRng(12345 + k); const state = {}; for (let s = 1; s <= 400; s++) { const q = TOPICS[tp].make({ rng, used: new Set(), state }, k); ids.add(q.id); }
    per.push(`${k}:${ids.size >= 4000 ? '∞' : ids.size}`);
  }
  const min = Math.min(...per.map((x) => (x.endsWith('∞') ? 1e9 : Number(x.split(':')[1]))));
  rows.push([min, tp, TOPIC_NAMES[tp][1].ru, per.join(' '), [...(usedIn[tp] ?? [])].length]);
}
rows.sort((a, b) => a[0] - b[0]);
for (const r of rows.filter((r) => r[0] < 100)) console.log(String(r[0]).padStart(4), r[1].padEnd(12), r[2].slice(0, 34).padEnd(34), r[3].slice(0, 60), 'курсов:', r[4]);
console.log('всего тем', rows.length, 'с < 100 уникальными на каком-то уровне:', rows.filter((r) => r[0] < 100).length);
