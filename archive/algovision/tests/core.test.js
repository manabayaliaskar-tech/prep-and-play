import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MinHeap } from '../src/core/heap.js';
import { createRng } from '../src/core/random.js';
import { StepPlayer, speedToDelay, speedToBatch } from '../src/core/player.js';
import { parseArrayInput, generateArray, MAX_SIZE } from '../src/algorithms/arrays.js';
import { QUIZ_QUESTIONS, QUIZ_LENGTH } from '../src/data/quiz-questions.js';

test('куча выдаёт элементы по возрастанию', () => {
  const rng = createRng(1);
  const heap = new MinHeap();
  const values = Array.from({ length: 500 }, () => Math.floor(rng() * 1000));
  values.forEach((v) => heap.push(v));
  const out = [];
  while (heap.size) out.push(heap.pop());
  assert.deepEqual(out, [...values].sort((a, b) => a - b));
  assert.equal(heap.pop(), undefined);
});

test('генератор с одинаковым зерном повторяет последовательность', () => {
  const a = createRng(99);
  const b = createRng(99);
  for (let i = 0; i < 10; i++) assert.equal(a(), b());
});

test('разбор пользовательского массива', () => {
  assert.deepEqual(parseArrayInput('5, 3 8;1'), { ok: true, values: [5, 3, 8, 1] });
  assert.equal(parseArrayInput('5').ok, false);
  assert.equal(parseArrayInput('5, -3').ok, false);
  assert.equal(parseArrayInput('5, abc').ok, false);
  assert.equal(parseArrayInput('5, 1000').ok, false);
  assert.equal(parseArrayInput(Array(MAX_SIZE + 1).fill(1).join(',')).ok, false);
});

test('генерация массивов нужного размера в допустимых границах', () => {
  const rng = createRng(2);
  for (const kind of ['random', 'nearly', 'reversed', 'few']) {
    assert.equal(generateArray(kind, 25, rng).length, 25);
  }
  assert.equal(generateArray('random', 1000, rng).length, MAX_SIZE);
  const reversed = generateArray('reversed', 10, rng);
  assert.deepEqual(reversed, [...reversed].sort((a, b) => b - a));
});

test('проигрыватель шагов не выходит за границы', () => {
  const rendered = [];
  const player = new StepPlayer({ onRender: (i) => rendered.push(i) });
  player.load(3);
  assert.equal(player.prev(), false);
  assert.equal(player.next(), true);
  assert.equal(player.next(), true);
  assert.equal(player.next(), false);
  assert.ok(player.atEnd);
  player.seek(-10);
  assert.equal(player.index, 0);
  assert.deepEqual(rendered, [0, 1, 2, 0]);
});

test('скорость: выше уровень — меньше пауза', () => {
  for (let l = 1; l < 10; l++) assert.ok(speedToDelay(l) >= speedToDelay(l + 1));
  assert.equal(speedToBatch(1), 1);
  assert.ok(speedToBatch(10) > 1);
});

test('вопросы квиза корректны', () => {
  assert.ok(QUIZ_QUESTIONS.length >= QUIZ_LENGTH);
  for (const q of QUIZ_QUESTIONS) {
    assert.ok(q.options.length >= 2);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length);
    assert.equal(new Set(q.options).size, q.options.length, `повтор вариантов: ${q.question}`);
    assert.ok(q.explanation.length > 0);
  }
});
