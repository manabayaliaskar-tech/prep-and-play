import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SORTING_ALGORITHMS } from '../src/algorithms/sorting.js';
import { generateArray, ARRAY_PRESETS } from '../src/algorithms/arrays.js';
import { createRng } from '../src/core/random.js';

const sortedCopy = (arr) => [...arr].sort((x, y) => x - y);

const edgeCases = [[], [7], [2, 1], [1, 2], [5, 5, 5, 5], [3, 1, 2, 3, 1], [9, 8, 7, 6, 5, 4, 3, 2, 1]];

for (const [key, algo] of Object.entries(SORTING_ALGORITHMS)) {
  test(`${key}: сортирует крайние случаи`, () => {
    for (const input of edgeCases) {
      const steps = algo.run(input);
      assert.deepEqual(steps.at(-1).array, sortedCopy(input), `вход: [${input}]`);
    }
  });

  test(`${key}: сортирует 300 случайных массивов всех типов`, () => {
    const rng = createRng(42);
    for (let k = 0; k < 300; k++) {
      const preset = Object.keys(ARRAY_PRESETS)[k % 4];
      const input = generateArray(preset, 2 + (k % 40), rng);
      const steps = algo.run(input);
      assert.deepEqual(steps.at(-1).array, sortedCopy(input));
    }
  });

  test(`${key}: не изменяет исходный массив`, () => {
    const input = [4, 2, 9, 1];
    algo.run(input);
    assert.deepEqual(input, [4, 2, 9, 1]);
  });

  test(`${key}: первый шаг — исходный массив, последний — «готово»`, () => {
    const input = [3, 1, 2];
    const steps = algo.run(input);
    assert.equal(steps[0].type, 'start');
    assert.deepEqual(steps[0].array, input);
    assert.equal(steps.at(-1).type, 'done');
    assert.equal(steps.at(-1).sorted.length, input.length);
  });

  test(`${key}: счётчики совпадают с числом шагов`, () => {
    const steps = algo.run(generateArray('random', 30, createRng(7)));
    const last = steps.at(-1);
    assert.equal(last.comparisons, steps.filter((s) => s.type === 'compare').length);
    assert.equal(last.swaps, steps.filter((s) => s.type === 'swap').length);
    assert.equal(last.writes, steps.filter((s) => s.type === 'write').length);
  });

  test(`${key}: у каждого шага есть пояснение и корректная строка псевдокода`, () => {
    const steps = algo.run(generateArray('random', 15, createRng(3)));
    for (const step of steps) {
      assert.ok(step.text.length > 0);
      assert.ok(step.line >= -1 && step.line < algo.pseudocode.length);
    }
  });

  test(`${key}: вопросы режима «Угадай шаг» имеют ответ да/нет`, () => {
    const steps = algo.run(generateArray('random', 20, createRng(11)));
    const questions = steps.filter((s) => s.question);
    assert.ok(questions.length > 0);
    for (const s of questions) {
      assert.equal(s.type, 'compare');
      assert.equal(typeof s.question.answer, 'boolean');
      assert.ok(s.question.text.endsWith('?'));
    }
  });
}

test('bubble: ответ на вопрос совпадает с тем, что происходит дальше', () => {
  const steps = SORTING_ALGORITHMS.bubble.run(generateArray('random', 25, createRng(5)));
  steps.forEach((s, i) => {
    if (!s.question) return;
    assert.equal(steps[i + 1].type === 'swap', s.question.answer);
  });
});

test('bubble: на отсортированном массиве делает n−1 сравнение и выходит досрочно', () => {
  const steps = SORTING_ALGORITHMS.bubble.run([1, 2, 3, 4, 5, 6]);
  assert.equal(steps.at(-1).comparisons, 5);
  assert.equal(steps.at(-1).swaps, 0);
});

test('insertion: на почти отсортированном массиве работает быстрее выбора', () => {
  const input = generateArray('nearly', 40, createRng(9));
  const ops = (key) => SORTING_ALGORITHMS[key].run(input).at(-1).comparisons;
  assert.ok(ops('insertion') < ops('selection') / 4);
});
