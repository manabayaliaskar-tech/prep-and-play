import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COURSES, GROUPS, courseById, courseHref, courseStars, coursesIn, groupOfPath, practiceKey, trackById, trackHref } from '../src/catalog/index.js';
import { TOPICS } from '../src/pools/topics.js';
import { TopicStream, buildTopicSet, cells } from '../src/pools/stream.js';
import { READING } from '../src/pools/reading.js';
import { createRng } from '../src/core/random.js';
import { _setProfileForTests, getProfile, recordAnswer } from '../src/core/profile.js';
import { evaluateAchievements } from '../src/content/achievements.js';
import { saveTrackResult } from '../src/screens/practice.js';
import { courseProgress, satMapStars, topicAccuracy } from '../src/screens/profile.js';

const LANGS = ['en', 'ru', 'kk'];
const full = (obj, label) => {
  for (const l of LANGS) assert.ok(obj?.[l]?.length > 0, `${label}: нет текста на ${l}`);
};

test('каталог: у каждого курса есть название, описание и раздел', () => {
  assert.deepEqual(GROUPS.map((g) => g.id), ['exams', 'olymp', 'code', 'daily']);
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
  for (const id of ['sat', 'ielts', 'toefl', 'hsk', 'ent', 'ege', 'oge', 'ct', 'dtm', 'ort', 'tj', 'dim', 'arm', 'bac']) assert.ok(courseById(id), id);
  assert.equal(coursesIn('exams', 'intl').length, 4);
  assert.equal(coursesIn('exams', 'cis').length, 10);
  assert.equal(courseById('math').tracks.length, 14, '11 классов и три уровня после школы');
  assert.deepEqual(courseById('english').tracks.map((t) => t.icon), ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  assert.equal(courseById('olymp').tracks.length, 13);
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
  const tracks = courseById('math').tracks;
  // 1 класс - счёт до 10, 11 класс - производная, после школы - пределы и интегралы.
  assert.deepEqual(tracks[0].spec, [['m.early', [1]]]);
  assert.ok(tracks[10].spec.some(([topic]) => topic === 'm.deriv'));
  assert.ok(tracks.at(-1).spec.some(([topic]) => topic === 'm.integral'));
  // Геометрия и тригонометрия входят в школьные классы.
  const school = tracks.slice(0, 11).flatMap((t) => t.spec.map(([topic]) => topic));
  for (const topic of ['m.area', 'm.angle', 'm.pyth', 'm.vol', 'm.trig']) assert.ok(school.includes(topic), topic);
  // Каждая школьная тема встречается хотя бы в одном классе.
  for (const id of Object.keys(TOPICS).filter((id) => TOPICS[id].pool === 'math' && !['m.limit', 'm.integral', 'm.complex', 'm.vector', 'm.matrix'].includes(id))) {
    assert.ok(school.includes(id), `тема ${id} не входит ни в один класс`);
  }
  // Английский: на каждом уровне свой ключ.
  courseById('english').tracks.forEach((track, i) => assert.ok(cells(track.spec).every((c) => c.key === i + 1)));
});

test('чтение: вопросы одного текста идут подряд, тексты не повторяются до исчерпания', () => {
  for (const exam of ['ielts', 'toefl']) {
    const course = courseById(exam);
    const stream = new TopicStream({ rng: createRng(5), spec: trackById(course, 'reading').spec });
    const order = Array.from({ length: 40 }, () => stream.next());
    const passages = order.map((q) => q.id.split(':')[1]);
    // Каждый текст идёт одним блоком: число «смен текста» равно числу разных текстов минус один.
    const runs = passages.filter((id, i) => i === 0 || id !== passages[i - 1]).length;
    assert.equal(runs, new Set(passages).size, `${exam}: текст должен идти блоком`);
    assert.ok(new Set(passages).size >= 6, `${exam}: за 40 вопросов - не меньше шести текстов`);
    for (const q of order) {
      assert.ok(q.passage.length > 400 && q.passageLabel);
      assert.ok(q.choices.length === 3 || q.choices.length === 4);
    }
  }
  for (const list of Object.values(READING)) {
    for (const passage of list) {
      const words = passage.text.split(/\s+/).length;
      assert.ok(words >= 120 && words <= 480, `${passage.id}: ${words} слов`);
      for (const item of passage.qs) {
        for (const l of LANGS) assert.ok(item.ex[l].length > 20, passage.id);
        if (item.type === 'tfng') assert.ok([0, 1, 2].includes(item.answer));
        else assert.equal(new Set(item.choices).size, 4, passage.id);
      }
      // В IELTS-текстах есть все три ответа: True, False, Not Given.
      const tf = passage.qs.filter((q) => q.type === 'tfng').map((q) => q.answer);
      if (tf.length) assert.deepEqual([...new Set(tf)].sort(), [0, 1, 2], passage.id);
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

test('профиль: прогресс по разделам и точность по темам', () => {
  _setProfileForTests({});
  assert.deepEqual(courseProgress(getProfile()), [], 'у нового игрока прогресса нет');
  assert.deepEqual(topicAccuracy(getProfile()), []);
  assert.deepEqual(satMapStars(getProfile()), { stars: 0, max: 96 });

  const math = courseById('math');
  const olymp = courseById('olymp');
  saveTrackResult(math, math.tracks[0], { correct: 10, total: 10 });
  saveTrackResult(math, math.tracks[1], { correct: 6, total: 10 });
  saveTrackResult(olymp, olymp.tracks[2], { correct: 8, total: 10 });
  const rows = courseProgress(getProfile());
  // Курсы идут в порядке каталога: олимпиада раньше ежедневной математики.
  assert.deepEqual(rows.map((r) => [r.course.id, r.stars, r.max, r.done, r.total]), [
    ['olymp', 2, 39, 1, 13],
    ['math', 4, 42, 2, 14],
  ]);

  // Точность: слабые темы идут первыми, темы с одним-двумя ответами не показываются.
  const answer = (topic, results) => results.forEach((ok) => recordAnswer(topic, ok));
  answer('m.frac', [true, false, false, false]);
  answer('m.add', [true, true, true]);
  answer('e.tenses', [true, false]);
  answer('o.digit', [true, false, true, false]);
  answer('lin-eq', [false, false, false]);
  const stats = topicAccuracy(getProfile());
  assert.deepEqual(stats.map((s) => [s.id, s.pct]), [['m.frac', 25], ['o.digit', 50], ['m.add', 100]]);
  assert.ok(stats.every((s) => TOPICS[s.id]), 'навыки SAT сюда не попадают');

  const profile = getProfile();
  profile.map.stars = { 'rw1-1': 3, 'm1-1': 2 };
  assert.equal(satMapStars(profile).stars, 5);
});

test('достижения за уровни и экзамены из каталога', () => {
  const base = {
    counters: { answered: 0, bestCombo: 0, detectiveFound: 0, duelsSent: 0, langSwitch: 0, dailyDone: 0 },
    map: { stars: {}, bosses: {} },
    records: { survival: 0, blitz: 0 },
    streak: { best: 0 },
    exams: [],
  };
  const got = (practice) => new Set(evaluateAchievements({ ...base, practice }));
  assert.equal(got(undefined).size, 0, 'старый профиль без записей о тренировках не ломает проверку');
  assert.deepEqual([...got({ 'math:l1': { best: 1, runs: 1, pct: 60 } })], ['practice1']);
  assert.ok(got({ 'math:l1': { best: 3, runs: 1, pct: 100 } }).has('flawless'));
  const five = Object.fromEntries(['math:l1', 'math:l2', 'english:a1', 'ent:mathlit', 'ielts:reading'].map((k) => [k, { best: 0, runs: 1, pct: 30 }]));
  assert.ok(got(five).has('explorer'));
  assert.ok(!got(five).has('olympian') && !got(five).has('flawless'));
  assert.ok(got({ 'olymp:l2': { best: 2, runs: 1, pct: 80 } }).has('olympian'));
  assert.ok(!got({ 'olymp:l2': { best: 1, runs: 1, pct: 60 } }).has('olympian'));
});

// ---------- Квиз ----------

import { QUIZ_COUNT, buildQuiz, englishLevel, quizSubjects } from '../src/pools/quiz.js';
import { saveQuizResult } from '../src/screens/quiz.js';

test('квиз: вопросы из разных предметов подряд, на каждой сложности', () => {
  for (let level = 1; level <= 10; level++) {
    assert.ok(quizSubjects(level).every((s) => s.spec.every(([topic]) => TOPICS[topic])), `уровень ${level}`);
    for (let seed = 0; seed < 15; seed++) {
      const questions = buildQuiz({ rng: createRng(seed * 7 + level), level });
      assert.equal(questions.length, QUIZ_COUNT);
      assert.equal(new Set(questions.map((q) => q.id)).size, QUIZ_COUNT, `повтор вопроса, уровень ${level}`);
      const pools = questions.map((q) => TOPICS[q.skill].pool);
      for (let i = 1; i < pools.length; i++) assert.notEqual(pools[i], pools[i - 1], `два вопроса подряд по одному предмету: ${pools.join(', ')}`);
      assert.ok(new Set(pools).size >= 7, `предметов: ${new Set(pools).size}`);
      assert.ok(questions.every((q) => q.type === 'mc'), 'в квизе только вопросы с вариантами');
    }
  }
  const ids = (seed) => buildQuiz({ rng: createRng(seed), level: 5 }).map((q) => q.id);
  assert.deepEqual(ids(11), ids(11));
  // Математика: сложность 1 - 2 класс, сложность 10 - 11 класс.
  assert.deepEqual(quizSubjects(1)[0].spec, courseById('math').tracks[1].spec);
  assert.deepEqual(quizSubjects(10)[0].spec, courseById('math').tracks[10].spec);
  assert.deepEqual([1, 5, 10].map(englishLevel), [1, 3, 6]);
});

test('квиз: рекорд на каждой сложности не ухудшается, достижения засчитываются', () => {
  _setProfileForTests({});
  assert.equal(saveQuizResult(7, 8), true);
  assert.equal(saveQuizResult(7, 6), false);
  assert.equal(saveQuizResult(3, 10), true);
  assert.deepEqual(getProfile().records.quiz, { 7: 8, 3: 10 });
  let got = new Set(evaluateAchievements(getProfile()));
  assert.ok(got.has('quiz') && !got.has('quizmaster'), '10 из 10 на сложности 3 - ещё не мастер');
  saveQuizResult(8, 10);
  got = new Set(evaluateAchievements(getProfile()));
  assert.ok(got.has('quizmaster'));
});
