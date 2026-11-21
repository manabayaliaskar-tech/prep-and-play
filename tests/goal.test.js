// Цель при первом заходе: свои экзамены первыми и ссылка в первый урок.
import test from 'node:test';
import assert from 'node:assert/strict';
import { COURSES, courseById } from '../src/catalog/index.js';
import { goalHref, regionExams } from '../src/core/goal.js';

const ids = COURSES.filter((c) => c.group === 'exams').map((c) => c.id);

test('экзамены по стране: свои, потом международные, потом остальные', () => {
  assert.deepEqual(regionExams(ids, 'KZT', null).slice(0, 5), ['ent', 'nis', 'bil', 'sat', 'ielts']);
  assert.deepEqual(regionExams(ids, 'RUB', null).slice(0, 3), ['ege', 'oge', 'sat']);
  assert.deepEqual(regionExams(ids, 'USD', null).slice(0, 2), ['sat', 'ielts']);
  assert.equal(regionExams(ids, 'KZT', 'toefl')[0], 'toefl', 'выбранная цель - первой');
  assert.equal(new Set(regionExams(ids, 'UZS', null)).size, ids.length, 'все экзамены без повторов');
});

test('первый урок цели: уровень 1 первого раздела экзамена', () => {
  assert.equal(goalHref(courseById('sat')), '/level/rw1/1');
  const ent = courseById('ent');
  assert.equal(goalHref(ent), `/x/ent/lv/${ent.tracks[0].id}/1`);
  assert.equal(goalHref(courseById('math')), '/c/math');
  assert.equal(goalHref(null), '/');
});
