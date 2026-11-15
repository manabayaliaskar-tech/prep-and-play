import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COURSES, GROUPS, courseById, courseHref, courseStars, coursesIn, groupOfPath, practiceKey, trackById, trackHref } from '../src/catalog/index.js';
import { TOPICS } from '../src/pools/topics.js';
import { TopicStream, buildTopicSet, cells } from '../src/pools/stream.js';
import { READING } from '../src/pools/reading.js';
import { createRng } from '../src/core/random.js';
import { _setProfileForTests } from '../src/core/profile.js';
import { saveTrackResult } from '../src/screens/practice.js';

const LANGS = ['en', 'ru', 'kk'];
const full = (obj, label) => {
  for (const l of LANGS) assert.ok(obj?.[l]?.length > 0, `${label}: нет текста на ${l}`);
};

test('каталог: у каждого курса есть название, описание и раздел', () => {
  assert.deepEqual(GROUPS.map((g) => g.id), ['exams', 'olymp', 'daily']);
  const ids = new Set();
  for (const course of COURSES) {
    assert.ok(!ids.has(course.id), `повтор курса ${course.id}`);
    ids.add(course.id);
    assert.ok(GROUPS.some((g) => g.id === course.group), course.id);
    full(course.name, `${course.id}.name`);
    full(course.full, `${course.id}.full`);
    full(course.about, `${course.id}.about`);
    assert.match(course.color, /^#[0-9a-f]{6}$/);
    if (course.official) assert.match(course.official.url, /^https:\/\//);
    for (const item of course.soon ?? []) full(item, `${course.id}.soon`);
    if (course.group === 'exams') assert.ok(['intl', 'cis'].includes(course.region), course.id);
    assert.ok(course.href || course.tracks.length > 0, `${course.id}: нет ни одной дорожки`);
  }
  // Экзамены всех стран СНГ, где есть единый экзамен, и три международных.
  for (const id of ['sat', 'ielts', 'toefl', 'ent', 'ege', 'oge', 'ct', 'dtm', 'ort', 'tj', 'dim', 'arm', 'bac']) assert.ok(courseById(id), id);
  assert.equal(coursesIn('exams', 'intl').length, 3);
  assert.equal(coursesIn('exams', 'cis').length, 10);
  assert.equal(courseById('math').tracks.length, 9);
  assert.deepEqual(courseById('english').tracks.map((t) => t.icon), ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  assert.equal(courseById('olymp').tracks.length, 3);
});

test('каталог: каждая тема каждой дорожки даёт корректное задание', () => {
  for (const course of COURSES) {
    const trackIds = new Set();
    for (const track of course.tracks) {
      const label = `${course.id}/${track.id}`;
      assert.ok(!trackIds.has(track.id), `повтор дорожки ${label}`);
      trackIds.add(track.id);
      full(track.name, `${label}.name`);
      full(track.desc, `${label}.desc`);
      assert.ok(track.spec.length > 0, label);
      const seen = new Set();
      for (const { topic, key } of cells(track.spec)) {
        assert.ok(TOPICS[topic], `${label}: неизвестная тема ${topic}`);
        assert.ok(!seen.has(`${topic}|${key}`), `${label}: повтор ${topic} ${key}`);
        seen.add(`${topic}|${key}`);
        const q = TOPICS[topic].make({ rng: createRng(11), mcOnly: false, used: new Set(), state: {} }, key);
        assert.ok(q.id && q.prompt && q.ex, `${label}: ${topic} ${key}`);
      }
      if (track.test) assert.ok(track.test.count >= 5 && track.test.minutes >= 5, label);
    }
  }
});

test('каталог: тренировка и тест собираются без повторов', () => {
  for (const course of COURSES) {
    for (const track of course.tracks) {
      for (const count of [10, track.test?.count ?? 10]) {
        const set = buildTopicSet({ rng: createRng(count * 7 + 1), spec: track.spec, count });
        assert.equal(set.length, count);
        assert.equal(new Set(set.map((q) => q.id)).size, count, `${course.id}/${track.id}: повтор заданий (${count})`);
      }
    }
  }
});

test('уровни математики идут от простого к сложному', () => {
  const avg = (track) => {
    const all = cells(track.spec);
    return all.reduce((sum, c) => sum + c.key, 0) / all.length;
  };
  const tracks = courseById('math').tracks;
  // Темы первых уровней — арифметика, последних — старшая школа.
  assert.ok(tracks[0].spec.every(([topic]) => ['m.add', 'm.mul', 'm.seq'].includes(topic)));
  assert.ok(tracks.at(-1).spec.some(([topic]) => topic === 'm.log'));
  assert.ok(avg(tracks[0]) < 2.1);
  // Английский: на каждом уровне свой ключ.
  courseById('english').tracks.forEach((track, i) => assert.ok(cells(track.spec).every((c) => c.key === i + 1)));
});

test('чтение: вопросы одного текста идут подряд, тексты не повторяются до исчерпания', () => {
  for (const exam of ['ielts', 'toefl']) {
    const course = courseById(exam);
    const stream = new TopicStream({ rng: createRng(5), spec: trackById(course, 'reading').spec });
    const order = Array.from({ length: 20 }, () => stream.next());
    const passages = order.map((q) => q.id.split(':')[1]);
    for (let i = 0; i < 20; i += 5) assert.equal(new Set(passages.slice(i, i + 5)).size, 1, `${exam}: текст должен идти блоком`);
    assert.equal(new Set(passages).size, 4, `${exam}: все четыре текста`);
    for (const q of order) {
      assert.ok(q.passage.length > 400 && q.passageLabel);
      assert.ok(q.choices.length === 3 || q.choices.length === 4);
    }
  }
  for (const list of Object.values(READING)) {
    for (const passage of list) {
      const words = passage.text.split(/\s+/).length;
      assert.ok(words >= 120 && words <= 220, `${passage.id}: ${words} слов`);
      for (const item of passage.qs) {
        for (const l of LANGS) assert.ok(item.ex[l].length > 20, passage.id);
        if (item.type === 'tfng') assert.ok([0, 1, 2].includes(item.answer));
        else assert.equal(new Set(item.choices).size, 4, passage.id);
      }
      // В IELTS-текстах есть все три ответа: True, False, Not Given.
      const tf = passage.qs.filter((q) => q.type === 'tfng').map((q) => q.answer);
      if (tf.length) assert.deepEqual([...tf].sort(), [0, 1, 2], passage.id);
    }
  }
});

test('ссылки, разделы меню и сохранение результата', () => {
  const ent = courseById('ent');
  const mathlit = trackById(ent, 'mathlit');
  assert.equal(courseHref(ent), '/c/ent');
  assert.equal(courseHref(courseById('sat')), '/sat');
  assert.equal(trackHref(ent, mathlit), '/c/ent/mathlit');
  assert.equal(practiceKey(ent, mathlit), 'ent:mathlit');
  assert.equal(trackById(ent, 'nope'), null);
  assert.equal(courseById('nope'), null);
  assert.equal(groupOfPath('/exams'), 'exams');
  assert.equal(groupOfPath('/sat'), 'exams');
  assert.equal(groupOfPath('/level/rw1/2'), 'exams');
  assert.equal(groupOfPath('/c/ent/mathlit'), 'exams');
  assert.equal(groupOfPath('/c/math/l3'), 'daily');
  assert.equal(groupOfPath('/practice'), 'daily');
  assert.equal(groupOfPath('/c/olymp'), 'olymp');
  assert.equal(groupOfPath('/profile'), null);

  _setProfileForTests({});
  assert.deepEqual(courseStars(ent), { stars: 0, max: ent.tracks.length * 3 });
  let rec = saveTrackResult(ent, mathlit, { correct: 8, total: 10 }, '2026-11-15');
  assert.deepEqual(rec, { best: 2, runs: 1, pct: 80, last: '2026-11-15' });
  rec = saveTrackResult(ent, mathlit, { correct: 6, total: 10 }, '2026-11-16');
  assert.deepEqual(rec, { best: 2, runs: 2, pct: 80, last: '2026-11-16' }, 'лучший результат не ухудшается');
  rec = saveTrackResult(ent, mathlit, { correct: 10, total: 10 }, '2026-11-17');
  assert.equal(rec.best, 3);
  assert.equal(courseStars(ent).stars, 3);
});
