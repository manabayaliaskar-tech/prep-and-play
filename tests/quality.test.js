// Проверка качества заданий: каждая тема на каждом используемом ключе даёт задание
// без «undefined» и «[object …]», с текстом на трёх языках, разными вариантами и ответом среди них.
import test from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS } from '../src/pools/topics.js';
import { COURSES } from '../src/catalog/index.js';
import { createRng } from '../src/core/random.js';

const SAMPLES = 8;
const strs = (v) => (v == null ? [] : typeof v === 'string' || typeof v === 'number' ? [String(v)] : Array.isArray(v) ? v.flatMap(strs) : typeof v === 'object' ? Object.values(v).flatMap(strs) : []);
const norm = (v) => String(v && typeof v === 'object' ? v.ru ?? v.en : v).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

test('качество заданий: нет пустых и сломанных текстов, варианты разные, ответ среди вариантов', () => {
  const keys = {};
  for (const c of COURSES) for (const tr of c.tracks) for (const [tp, ks] of tr.spec) (keys[tp] ??= new Set()), ks.forEach((k) => keys[tp].add(k));
  const problems = [];
  for (const tp of Object.keys(TOPICS))
    for (const k of keys[tp] ?? [1, 2, 3])
      for (let s = 1; s <= SAMPLES; s++) {
        const q = TOPICS[tp].make({ rng: createRng(s * 7919 + k), used: new Set(), state: {} }, k);
        const where = `${tp} [${k}] #${s}`;
        if (strs({ p: q.prompt, c: q.choices, e: q.ex }).some((x) => /undefined|\[object /.test(x))) problems.push(`${where}: undefined в тексте`);
        if (q.prompt && typeof q.prompt === 'object' && ['en', 'ru', 'kk'].some((l) => !String(q.prompt[l] ?? '').trim())) problems.push(`${where}: нет текста на одном из языков`);
        if (q.type === 'mc') {
          const c = (q.choices ?? []).map(norm);
          if (c.length < 2) problems.push(`${where}: меньше двух вариантов`);
          if (new Set(c).size !== c.length) problems.push(`${where}: одинаковые варианты (${c.join(' | ')})`);
          if (c.some((x) => !x)) problems.push(`${where}: пустой вариант`);
          if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < c.length)) problems.push(`${where}: ответ вне вариантов`);
        } else if (q.type === 'spr' && (q.value === undefined || q.value === null || q.value === '' || Number.isNaN(q.value))) {
          problems.push(`${where}: нет правильного ответа`);
        }
      }
  assert.deepEqual(problems.slice(0, 20), []);
});
