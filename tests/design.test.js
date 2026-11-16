import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COURSES, courseById, practiceKey } from '../src/catalog/index.js';
import { BOSSES, bossFor } from '../src/catalog/bosses.js';
import { _setProfileForTests, getProfile, recordAnswer, todayStats } from '../src/core/profile.js';
import { QUESTS, QUESTS_PER_DAY, claimQuests, dailyQuests, questState } from '../src/core/quests.js';
import { THEMES, themeById } from '../src/core/theme.js';
import { evaluateAchievements } from '../src/content/achievements.js';
import { mascot } from '../src/ui/mascot.js';
import { saveBossResult, saveTrackResult } from '../src/screens/practice.js';
import { pathHtml } from '../src/screens/catalog.js';

test('темы: у каждой есть палитра в CSS, основная — «Преп»', () => {
  const css = readFileSync('styles/main.css', 'utf8');
  assert.equal(THEMES[0].id, 'prep');
  assert.equal(themeById('нет такой').id, 'prep');
  assert.equal(new Set(THEMES.map((t) => t.id)).size, THEMES.length);
  for (const theme of THEMES.slice(1)) assert.ok(css.includes(`[data-theme='${theme.id}']`), theme.id);
  assert.ok(THEMES.some((t) => t.dark), 'есть тёмная тема');
  // Белый цвет поверхностей больше не зашит в стили — иначе тёмные темы сломаются.
  assert.ok(!/background:\s*#fff(fff)?;/.test(css));
});

test('задания дня: три разных, одинаковые весь день, счётчики сбрасываются в новый день', () => {
  assert.equal(dailyQuests('2026-11-16').length, QUESTS_PER_DAY);
  assert.deepEqual(dailyQuests('2026-11-16'), dailyQuests('2026-11-16'));
  assert.equal(new Set(dailyQuests('2026-11-16').map((q) => q.id)).size, QUESTS_PER_DAY);
  const days = new Set(Array.from({ length: 10 }, (_, i) => dailyQuests(`2026-12-${10 + i}`).map((q) => q.id).join()));
  assert.ok(days.size > 1, 'задания меняются от дня к дню');

  _setProfileForTests({});
  const day = '2026-11-16';
  const stats = todayStats(day);
  for (const q of QUESTS) assert.ok(typeof q.value(stats) === 'number', q.id);
  Object.assign(stats, { answered: 99, correct: 99, xp: 999, stars2: 1, bosses: 1, quizzes: 1, combo: 9 });
  const fresh = claimQuests(getProfile(), day);
  assert.equal(fresh.length, QUESTS_PER_DAY);
  assert.equal(claimQuests(getProfile(), day).length, 0, 'награда выдаётся один раз');
  assert.ok(questState(getProfile(), day).every((s) => s.done && s.claimed));
  // Вчерашние счётчики не засчитываются сегодня.
  assert.ok(questState(getProfile(), '2026-11-17').every((s) => s.value === 0 && !s.claimed));
  assert.equal(todayStats('2026-11-17').answered, 0);
});

test('ответы, тренировки и бои с боссом пополняют счётчики дня', () => {
  _setProfileForTests({});
  recordAnswer('m.add', true);
  recordAnswer('m.add', false);
  const math = courseById('math');
  const [g1, g2] = math.tracks;
  saveTrackResult(math, g1, { correct: 9, total: 10 });
  assert.equal(saveBossResult(math, g2, false), false);
  assert.equal(saveBossResult(math, g2, true), true, 'первая победа');
  assert.equal(saveBossResult(math, g2, true), false);
  const day = getProfile().today;
  assert.equal(day.answered, 2);
  assert.equal(day.correct, 1);
  assert.equal(day.stars2, 1);
  assert.equal(day.bosses, 2);
  assert.equal(getProfile().practice[practiceKey(math, g2)].boss, true);
  // Победа над боссом без тренировки не считается «пройденной тренировкой».
  assert.ok(!evaluateAchievements({ ...getProfile(), practice: { [practiceKey(math, g2)]: { boss: true, runs: 0, best: 0 } } }).includes('practice1'));
});

test('боссы: у каждого уровня свой постоянный босс с именем на трёх языках', () => {
  for (const b of BOSSES) for (const l of ['en', 'ru', 'kk']) assert.ok(b.name[l]);
  for (const course of COURSES) {
    for (const track of course.tracks) {
      assert.ok(BOSSES.includes(bossFor(course, track)));
      assert.equal(bossFor(course, track), bossFor(course, track));
    }
  }
});

test('путь уровней: узел на каждый уровень, Препи стоит у первого непройденного', () => {
  _setProfileForTests({});
  const math = courseById('math');
  saveTrackResult(math, math.tracks[0], { correct: 10, total: 10 });
  const html = pathHtml(math);
  assert.equal((html.match(/class="path-node /g) ?? []).length, math.tracks.length);
  assert.equal((html.match(/is-current/g) ?? []).length, 1);
  assert.equal((html.match(/path-prepi/g) ?? []).length, 1);
  assert.ok(html.indexOf('is-current') > html.indexOf('is-done'));
  assert.ok(!/NaN|undefined/.test(html));
});

test('Препи: каждое настроение рисуется, id градиентов не повторяются', () => {
  const a = mascot('happy');
  const b = mascot('happy');
  const id = (svg) => svg.match(/radialGradient id="([^"]+)"/)[1];
  assert.notEqual(id(a), id(b));
  for (const mood of ['happy', 'wow', 'sad', 'win', 'think']) {
    const svg = mascot(mood);
    assert.ok(svg.includes(`mascot-${mood}`) && !svg.includes('undefined'), mood);
  }
});

test('главная: 4 курса в блоке — сначала закреплённые, потом недавние, потом по умолчанию', async () => {
  const { homeCourses } = await import('../src/core/pins.js');
  const daily = COURSES.filter((c) => c.group === 'daily');
  const fresh = homeCourses(daily, 'daily', { pins: [], profile: {} });
  assert.equal(fresh.shown.length, 4);
  assert.deepEqual(fresh.shown.slice(0, 2).map((c) => c.id), ['math', 'english']);
  assert.equal(fresh.hidden, daily.length - 4);
  const recent = homeCourses(daily, 'daily', { pins: ['geography'], profile: { practice: { 'chemistry:c1': { last: '2026-11-10' }, 'history:h1': { last: '2026-11-15' } } } });
  assert.deepEqual(recent.shown.map((c) => c.id), ['geography', 'history', 'chemistry', 'math']);
  // Закреплённый курс из другого раздела в этот блок не попадает.
  assert.ok(!homeCourses(daily, 'daily', { pins: ['python'], profile: {} }).shown.some((c) => c.id === 'python'));
});

test('квиз: без повторов внутри игры и между играми, квиз дня одинаков весь день', async () => {
  const { QuizStream, QUIZ_POOLS, buildQuiz, dailyQuiz, survivalLevel, bySubject } = await import('../src/pools/quiz.js');
  const { createRng } = await import('../src/core/random.js');
  const { TOPICS } = await import('../src/pools/topics.js');
  // Пять игр подряд на одной сложности: вопросы прошлых игр не повторяются.
  const seen = new Set();
  let repeats = 0;
  for (let game = 0; game < 5; game++) {
    const qs = buildQuiz({ rng: createRng(100 + game), level: 5, seen });
    assert.equal(new Set(qs.map((q) => q.id)).size, qs.length, 'повтор внутри игры');
    for (const q of qs) {
      if (seen.has(q.id)) repeats += 1;
      seen.add(q.id);
    }
  }
  assert.equal(repeats, 0, 'вопросы прошлых игр вернулись');
  // Соседние вопросы — из разных предметов.
  const qs = buildQuiz({ rng: createRng(7), level: 4 });
  for (let i = 1; i < qs.length; i++) assert.notEqual(TOPICS[qs[i].skill].pool, TOPICS[qs[i - 1].skill].pool);
  // Свой квиз: только выбранные предметы.
  const own = buildQuiz({ rng: createRng(8), level: 6, pools: ['geography', 'history'] });
  assert.ok(own.every((q) => ['geography', 'history'].includes(TOPICS[q.skill].pool)));
  assert.ok(QUIZ_POOLS.length >= 11);
  // Квиз дня одинаковый весь день и разный в разные дни.
  const ids = (day) => dailyQuiz(day).map((q) => q.id).join();
  assert.equal(ids('2026-11-16'), ids('2026-11-16'));
  assert.notEqual(ids('2026-11-16'), ids('2026-11-17'));
  // Выживание: сложность растёт и не выходит за 10.
  assert.equal(survivalLevel(0, 1), 1);
  assert.equal(survivalLevel(6, 1), 3);
  assert.equal(survivalLevel(100, 4), 10);
  // Блиц: длинный поток без повторов.
  const stream = new QuizStream({ rng: createRng(3) });
  const blitz = Array.from({ length: 60 }, () => stream.next(5));
  assert.equal(new Set(blitz.map((q) => q.id)).size, 60);
  const rows = bySubject(blitz.map((question, i) => ({ question, correct: i % 2 === 0 })));
  assert.equal(rows.reduce((s, r) => s + r.total, 0), 60);
});

test('работа над ошибками: ступени 0 → 1 день → 3 дня → неделя → освоено; ошибка — снова завтра', async () => {
  const { addMistake, applyReview, dueMistakes, getMistakes, addDays } = await import('../src/core/review.js');
  // В Node нет localStorage — подставляем простое хранилище в памяти.
  const mem = new Map();
  globalThis.localStorage ??= { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() };
  globalThis.localStorage.clear();
  const q = { id: 'test:1', skill: 'm.add', prompt: 'x', type: 'mc', choices: ['1', '2', '3', '4'], answer: 0 };
  const day = '2026-11-16';
  addMistake(q, day);
  assert.equal(dueMistakes(day).length, 1, 'новая ошибка доступна сразу');
  assert.equal(applyReview('test:1', true, day), false);
  assert.equal(getMistakes()[0].due, addDays(day, 1));
  assert.equal(dueMistakes(day).length, 0);
  applyReview('test:1', true, addDays(day, 1));
  assert.equal(getMistakes()[0].due, addDays(day, 4));
  applyReview('test:1', false, addDays(day, 4));
  assert.equal(getMistakes()[0].stage, 0);
  assert.equal(getMistakes()[0].due, addDays(day, 5));
  let d = addDays(day, 5);
  for (const gap of [1, 3, 7]) {
    assert.equal(applyReview('test:1', true, d), false);
    d = addDays(d, gap);
  }
  assert.equal(applyReview('test:1', true, d), true, 'четвёртый верный ответ — освоено');
  assert.equal(getMistakes().length, 0);
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});

test('слабые темы курса: только темы с точностью ниже 75% и хотя бы 3 ответами', async () => {
  const { courseWeakTopics, weakSpec } = await import('../src/screens/review.js');
  const math = COURSES.find((c) => c.id === 'math');
  const profile = { skills: { 'm.add': { a: 10, c: 3 }, 'm.mul': { a: 10, c: 9 }, 'm.frac': { a: 2, c: 0 }, 'm.pct': { a: 6, c: 4 } } };
  const weak = courseWeakTopics(math, profile);
  assert.deepEqual(weak.map((w) => w.topic), ['m.add', 'm.pct']);
  const spec = weakSpec(math, weak);
  assert.equal(spec.length, 2);
  assert.ok(spec.every(([, keys]) => keys.length >= 1));
});
