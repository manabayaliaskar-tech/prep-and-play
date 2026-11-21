// Повторение правил: очередь по ошибкам, интервалы 1-3-7-14 дней, не больше 5 за раз, «отложить до завтра».
import test from 'node:test';
import assert from 'node:assert/strict';

const mem = new Map();
globalThis.localStorage ??= { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() };

const { applyRule, dueRules, getRules, noteRuleMistake, restRulesToday, rulesTileCount, RULES_PER_DAY } = await import('../src/core/rules.js');

test('ошибка ставит правило на завтра, а не на сегодня', () => {
  globalThis.localStorage.clear();
  noteRuleMistake('m.quad', '2026-11-21');
  assert.deepEqual(dueRules('2026-11-21'), []);
  assert.deepEqual(dueRules('2026-11-22'), ['m.quad']);
});

test('верные повторы: 1 → 3 → 7 → 14 дней, потом правило выучено', () => {
  globalThis.localStorage.clear();
  noteRuleMistake('m.quad', '2026-11-01');
  assert.equal(applyRule('m.quad', true, '2026-11-02'), '2026-11-05');
  assert.equal(applyRule('m.quad', true, '2026-11-05'), '2026-11-12');
  assert.equal(applyRule('m.quad', true, '2026-11-12'), '2026-11-26');
  assert.equal(applyRule('m.quad', true, '2026-11-26'), null);
  assert.deepEqual(getRules(), {});
});

test('ошибка на повторе - правило вернётся завтра', () => {
  globalThis.localStorage.clear();
  noteRuleMistake('p.kin', '2026-11-01');
  applyRule('p.kin', true, '2026-11-02');
  assert.equal(applyRule('p.kin', false, '2026-11-05'), '2026-11-06');
  assert.equal(getRules()['p.kin'].stage, 0);
});

test('не больше 5 правил за раз и «отложить» прячет плитку до завтра', () => {
  globalThis.localStorage.clear();
  for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) noteRuleMistake(id, '2026-11-01');
  assert.equal(dueRules('2026-11-03').length, RULES_PER_DAY);
  assert.equal(rulesTileCount('2026-11-03'), RULES_PER_DAY);
  restRulesToday('2026-11-03');
  assert.equal(rulesTileCount('2026-11-03'), 0);
  assert.equal(rulesTileCount('2026-11-04'), RULES_PER_DAY);
});
