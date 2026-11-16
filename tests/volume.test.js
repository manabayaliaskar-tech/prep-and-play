import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COURSES } from '../src/catalog/courses.js';
import { TOPICS } from '../src/pools/topics.js';
import { createRng } from '../src/core/random.js';

/** Сколько разных заданий удаётся получить из набора тем за n попыток. */
function distinct(spec, n) {
  const seen = new Set();
  const rng = createRng(2);
  for (let i = 0; i < n; i++) {
    for (const [topic, keys] of spec) {
      const q = TOPICS[topic].make({ rng, used: new Set(), state: {} }, keys[i % keys.length]);
      seen.add(q.id);
    }
  }
  return seen.size;
}

// Тексты для чтения пишутся вручную, их число проверяется отдельно.
const HANDWRITTEN = new Set(['reading']);

test('объём: в каждом уровне каждого курса — не меньше сотни разных заданий', () => {
  const small = [];
  for (const course of COURSES) {
    for (const track of course.tracks) {
      if (HANDWRITTEN.has(track.id)) continue;
      const count = distinct(track.spec, 250);
      if (count < 100) small.push(`${course.id}/${track.id}: ${count}`);
    }
  }
  assert.deepEqual(small, [], `мало заданий: ${small.join(', ')}`);
});

test('объём: у всех курсов с уровнями — по шесть уровней или больше', () => {
  for (const course of COURSES.filter((c) => c.leveled)) {
    assert.ok(course.tracks.length >= 6, `${course.id}: ${course.tracks.length}`);
  }
});
