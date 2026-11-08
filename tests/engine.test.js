import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer, isSprCorrect, parseSpr } from '../src/engine/answer.js';
import { applyAnswer, comboBonus, createRun, starsFor, BOSS_HITS } from '../src/engine/session.js';
import { moduleDifficulties, routeAfterModule1, sectionScore } from '../src/engine/scoring.js';
import { DUEL_LENGTH, decodeDuel, duelOutcome, encodeDuel } from '../src/core/duel-code.js';
import { createRng, hashString } from '../src/core/random.js';
import { daysBetween } from '../src/core/dates.js';
import { levelInfo } from '../src/core/profile.js';

test('ввод ответа: дроби, десятичные, отрицательные', () => {
  assert.equal(parseSpr('3/4'), 0.75);
  assert.equal(parseSpr('-5/2'), -2.5);
  assert.equal(parseSpr('−2'), -2);
  assert.equal(parseSpr('.5'), 0.5);
  assert.equal(parseSpr('0,75'), 0.75);
  assert.ok(Number.isNaN(parseSpr('abc')));
  assert.ok(Number.isNaN(parseSpr('1/0')));
  assert.ok(Number.isNaN(parseSpr('')));
});

test('правила SAT для ответа с вводом', () => {
  assert.ok(isSprCorrect(0.75, '3/4'));
  assert.ok(isSprCorrect(0.75, '.75'));
  assert.ok(isSprCorrect(2 / 3, '2/3'));
  assert.ok(isSprCorrect(2 / 3, '.666'));
  assert.ok(isSprCorrect(2 / 3, '0.667'));
  assert.ok(!isSprCorrect(2 / 3, '0.66'), 'слишком грубое округление');
  assert.ok(!isSprCorrect(2 / 3, '0.67'));
  assert.ok(isSprCorrect(12.5, '25/2'));
  assert.ok(!isSprCorrect(5, '6'));
});

test('проверка ответа по типу задания', () => {
  assert.ok(checkAnswer({ type: 'mc', answer: 2 }, 2));
  assert.ok(!checkAnswer({ type: 'mc', answer: 2 }, 1));
  assert.ok(!checkAnswer({ type: 'mc', answer: 0 }, null));
  assert.ok(checkAnswer({ type: 'spr', value: -4 }, '-4'));
});

test('опыт, комбо и жизни', () => {
  const run = createRun({ lives: 3 });
  const q = { d: 3 };
  applyAnswer(run, { question: q, correct: true });
  applyAnswer(run, { question: q, correct: true });
  const third = applyAnswer(run, { question: q, correct: true });
  assert.equal(third.combo, 3);
  assert.equal(third.xp, 10 + 6 + comboBonus(3));
  applyAnswer(run, { question: q, correct: false });
  assert.equal(run.combo, 0);
  assert.equal(run.lives, 2);
  assert.equal(run.bestCombo, 3);
  applyAnswer(run, { question: q, correct: false });
  const last = applyAnswer(run, { question: q, correct: false });
  assert.ok(last.outOfLives);
  assert.equal(run.log.length, 6);
});

test('босс побеждается ровно за BOSS_HITS правильных ответов', () => {
  const run = createRun({ bossHp: 100 });
  for (let i = 1; i < BOSS_HITS; i++) assert.ok(!applyAnswer(run, { question: { d: 2 }, correct: true }).bossDefeated);
  assert.ok(applyAnswer(run, { question: { d: 2 }, correct: true }).bossDefeated);
});

test('звёзды за уровень', () => {
  assert.equal(starsFor(5, 5), 3);
  assert.equal(starsFor(4, 5), 2);
  assert.equal(starsFor(3, 5), 1);
  assert.equal(starsFor(2, 5), 0);
});

test('прогноз балла: границы, маршрут и монотонность', () => {
  const items = (n, correct, d = 2) => Array.from({ length: n }, (_, i) => ({ d, correct: i < correct }));
  assert.equal(routeAfterModule1(items(10, 6)), 'hard');
  assert.equal(routeAfterModule1(items(10, 5)), 'easy');
  assert.equal(sectionScore(items(10, 10, 3), items(10, 10, 3), 'hard'), 800);
  assert.equal(sectionScore(items(10, 0), items(10, 0), 'easy'), 200);
  assert.ok(sectionScore(items(10, 10), items(10, 10), 'easy') <= 620, 'лёгкий маршрут ограничивает потолок');
  let prev = 0;
  for (let c = 0; c <= 10; c++) {
    const s = sectionScore(items(10, 7), items(10, c), 'hard');
    assert.ok(s >= prev);
    assert.equal(s % 10, 0);
    prev = s;
  }
  assert.deepEqual(moduleDifficulties(1, 'hard', 3), [2, 3, 3]);
});

test('код дуэли кодируется и раскодируется, включая кириллицу', () => {
  const data = { seed: 123456, section: 'math', name: 'Әлия', correct: 7, timeMs: 95000 };
  const decoded = decodeDuel(encodeDuel(data));
  assert.deepEqual(decoded, { seed: 123456, section: 'math', name: 'Әлия', correct: 7, total: DUEL_LENGTH, timeMs: 95000 });
  assert.equal(decodeDuel('мусор'), null);
  assert.equal(decodeDuel(encodeDuel({ ...data, correct: 99 })), null);
  assert.equal(duelOutcome({ correct: 8, timeMs: 1 }, { correct: 7, timeMs: 1 }), 'win');
  assert.equal(duelOutcome({ correct: 7, timeMs: 50000 }, { correct: 7, timeMs: 40000 }), 'lose');
  assert.equal(duelOutcome({ correct: 7, timeMs: 40000 }, { correct: 7, timeMs: 40500 }), 'draw');
});

test('уровни игрока и даты', () => {
  assert.deepEqual(levelInfo(0), { level: 1, into: 0, need: 100 });
  assert.equal(levelInfo(100).level, 2);
  assert.equal(levelInfo(240).level, 3);
  assert.equal(daysBetween('2026-02-28', '2026-03-01'), 1);
  assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1);
});

test('генератор случайных чисел детерминирован', () => {
  const a = createRng(hashString('daily-2026-11-09'));
  const b = createRng(hashString('daily-2026-11-09'));
  for (let i = 0; i < 20; i++) assert.equal(a(), b());
});
