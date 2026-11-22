// Темы 1-6 классов: каждая тема в своём классе, есть урок, 60+ разных заданий на каждом уровне,
// ответы примеров «Вычисли» и уравнений сходятся с пересчётом.
import test from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS } from '../src/pools/topics.js';
import { LESSONS } from '../src/content/lessons/index.js';
import { courseById } from '../src/catalog/index.js';
import { createRng } from '../src/core/random.js';

const GRADES = {
  1: ['m.num10', 'm.cmp', 'm.add10', 'm.num20', 'm.add20', 'm.word1', 'm.len', 'm.shapes', 'm.orient', 'm.pattern', 'm.money1', 'm.clock1', 'm.count100'],
  2: ['m.place100', 'm.add2d', 'm.col', 'm.mulmean', 'm.tab23', 'm.laws', 'm.ord2', 'm.eq1', 'm.units', 'm.time2', 'm.perim', 'm.rect', 'm.word2', 'm.change'],
  3: ['m.remdiv', 'm.mulbig', 'm.num1000', 'm.col3', 'm.colmul', 'm.parts', 'm.area3', 'm.mass', 'm.time3', 'm.eq3', 'm.price', 'm.circle3'],
  4: ['m.bignum', 'm.addbig', 'm.mul2d', 'm.speed', 'm.motion4', 'm.partof', 'm.units4', 'm.box', 'm.eq2step', 'm.chart', 'm.seq4', 'm.roman'],
  5: ['m.ray', 'm.round', 'm.sqcube', 'm.props', 'm.eq5', 'm.formula', 'm.mixed', 'm.rounddec', 'm.tri', 'm.prime'],
  6: ['m.fracadd', 'm.fracmul', 'm.scale', 'm.circle', 'm.modulus', 'm.rational', 'm.coord', 'm.brackets', 'm.lines', 'm.diagram', 'm.pcttask', 'm.sym'],
};

const math = courseById('math');
const keysOf = (grade, id) => math.tracks[grade - 1].spec.find(([t]) => t === id)?.[1];
const make = (id, d, seed, mcOnly = false) => TOPICS[id].make({ rng: createRng(seed), mcOnly, used: new Set(), state: {} }, d);

test('темы 1-6 классов: в реестре, с уроком и в своём классе', () => {
  for (const [grade, ids] of Object.entries(GRADES))
    for (const id of ids) {
      assert.ok(TOPICS[id], `${id}: нет в реестре`);
      assert.ok(LESSONS[id], `${id}: нет урока`);
      assert.ok(keysOf(Number(grade), id), `${id}: нет в ${grade} классе`);
    }
});

test('темы 1-6 классов: не меньше 60 разных заданий на каждом уровне', () => {
  const small = [];
  for (const [grade, ids] of Object.entries(GRADES))
    for (const id of ids)
      for (const d of keysOf(Number(grade), id)) {
        const seen = new Set();
        for (let s = 0; s < 600; s++) {
          const q = make(id, d, s * 13 + d);
          seen.add(q.prompt.ru + (q.figure ?? ''));
        }
        if (seen.size < 60) small.push(`${id} [${d}]: ${seen.size}`);
      }
  assert.deepEqual(small, []);
});

// ---------- Пересчёт ответов ----------

const plain = (s) =>
  String(s)
    .replace(/<[^>]+>/g, '')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/(\d) (?=\d{3}\b)/g, '$1')
    .trim();
const toJs = (e) => e.replace(/−/g, '-').replace(/×|·/g, '*').replace(/:|÷/g, '/').replace(/(\d),(\d)/g, '$1.$2');
const SAFE = /^[\d+\-*/(). ]+$/;
const evalExpr = (e) => {
  const js = toJs(e);
  if (!SAFE.test(js)) return NaN;
  return Function(`return (${js});`)();
};
const answerOf = (q) => (q.type === 'spr' ? q.value : Number(toJs(plain(q.choices[q.answer]?.en ?? q.choices[q.answer]))));

/** Возвращает true/false, если ответ удаётся пересчитать, иначе null. */
function recheck(q) {
  if (/frac|<sup>/.test(q.prompt.en) || (q.type === 'mc' && /frac/.test(JSON.stringify(q.choices[q.answer])))) return null;
  const p = plain(q.prompt.en);
  const ans = answerOf(q);
  if (!Number.isFinite(ans)) return null;
  let m = p.match(/^Calculate: (.+)$/);
  if (m) {
    const v = evalExpr(m[1]);
    return Number.isFinite(v) ? Math.abs(v - ans) < 1e-6 : null;
  }
  m = p.match(/^(?:Find the missing number|Solve the equation|Solve): (.+)=(.+)$/);
  if (m) {
    const sub = (s) => s.replace(/☐|\bx\b/g, `(${ans})`).replace(/(\d|\))\(/g, '$1*(');
    const l = evalExpr(sub(m[1]));
    const r = evalExpr(sub(m[2]));
    return Number.isFinite(l) && Number.isFinite(r) ? Math.abs(l - r) < 1e-6 : null;
  }
  return null;
}

test('темы 1-6 классов: ответы примеров и уравнений сходятся с пересчётом', () => {
  const bad = [];
  let checked = 0;
  for (const [grade, ids] of Object.entries(GRADES))
    for (const id of ids)
      for (const d of keysOf(Number(grade), id))
        for (let s = 0; s < 150; s++) {
          const q = make(id, d, s * 7 + d, s % 2 === 0);
          const ok = recheck(q);
          if (ok === null) continue;
          checked += 1;
          if (!ok) bad.push(`${id} [${d}]: ${plain(q.prompt.en)} → ${answerOf(q)}`);
        }
  assert.deepEqual(bad.slice(0, 10), []);
  assert.ok(checked > 300, `пересчитано: ${checked}`);
});
