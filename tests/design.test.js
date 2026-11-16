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

test('план подготовки: норма растёт к экзамену, готовность и слабые предметы считаются по профилю', async () => {
  const { dailyTarget, readiness, planSpec, trackScores, planExams } = await import('../src/core/plan.js');
  assert.ok(dailyTarget(120) < dailyTarget(50) && dailyTarget(50) < dailyTarget(25) && dailyTarget(25) < dailyTarget(5));
  const ent = COURSES.find((c) => c.id === 'ent');
  const empty = { skills: {}, practice: {} };
  assert.equal(readiness(ent, empty), 0);
  const strong = { skills: {}, practice: Object.fromEntries(ent.tracks.map((tr) => [`ent:${tr.id}`, { pct: 100 }])) };
  assert.equal(readiness(ent, strong), 90);
  // Самые слабые предметы идут в тренировку дня.
  const partial = { skills: {}, practice: { 'ent:mathlit': { pct: 100 }, 'ent:math': { pct: 100 } } };
  const weakest = trackScores(ent, partial).sort((a, b) => a.score - b.score).slice(0, 2).map((x) => x.track.id);
  assert.ok(!weakest.includes('mathlit') && !weakest.includes('math'));
  assert.ok(planSpec(ent, partial).length > 0);
  assert.ok(planExams().some((c) => c.id === 'sat') && planExams().some((c) => c.id === 'ent'));
});

test('карточки слов: 4 раза «знал» — слово выучено, «не знал» — завтра с начала; колоды на 4 языка', async () => {
  const { rateCard, cardState, deck, sessionCards, deckStats } = await import('../src/core/cards.js');
  const { addDays } = await import('../src/core/review.js');
  const mem = new Map();
  globalThis.localStorage ??= { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() };
  globalThis.localStorage.removeItem('prepplay:cards');
  const day = '2026-11-16';
  assert.equal(rateCard('es:0', true, day), false);
  assert.equal(cardState()['es:0'].d, addDays(day, 1));
  rateCard('es:0', false, addDays(day, 1));
  assert.equal(cardState()['es:0'].s, 0);
  let d = addDays(day, 2);
  const results = [];
  for (const gap of [1, 3, 7, 21]) {
    results.push(rateCard('es:0', true, d));
    d = addDays(d, gap);
  }
  assert.deepEqual(results, [false, false, false, true]);
  assert.equal(deckStats('es', d).learned, 1);
  for (const lang of ['en', 'es', 'fr', 'zh']) {
    assert.ok(deck(lang).length >= 380, lang);
    assert.ok(deck(lang).every((c) => c.front && c.back.ru && c.back.kk && c.back.en), lang);
    assert.equal(sessionCards(lang, 1, 15, day).length, 15);
  }
});

test('сундуки и отчёт: сундук по лучшей серии, открывается один раз; неделя считается с понедельника', async () => {
  const mem = new Map();
  globalThis.localStorage ??= { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() };
  globalThis.localStorage.removeItem('prepplay:chests');
  const { availableChests, openChest, nextChest, weekStart, weekSummary } = await import('../src/core/rewards.js');
  const { isUnlocked, itemById } = await import('../src/core/wardrobe.js');
  const p = { streak: { count: 2, best: 8 } };
  assert.deepEqual(availableChests(p).map((c) => c.days), [3, 7]);
  assert.equal(openChest(3).xp, 30);
  assert.equal(openChest(3), null, 'второй раз не открывается');
  assert.ok(isUnlocked(itemById('scarf'), { achievements: {}, xp: 0 }) && !isUnlocked(itemById('glasses'), { achievements: {}, xp: 0 }));
  assert.equal(nextChest(p).days, 14);
  assert.equal(nextChest(p).left, 6);
  assert.equal(weekStart('2026-11-16'), '2026-11-16');
  assert.equal(weekStart('2026-11-22'), '2026-11-16');
  assert.equal(weekStart('2026-11-23'), '2026-11-23');
  const week = weekSummary('2026-11-09');
  assert.equal(week.rows.length, 7);
  assert.equal(week.rows[6].day, '2026-11-15');
});

test('гардероб: вещи по слотам открываются за сундуки, достижения и уровни; надеть и снять', async () => {
  const mem = new Map();
  globalThis.localStorage ??= { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() };
  for (const k of ['outfit', 'prepiWear', 'wearKnown', 'chests']) globalThis.localStorage.removeItem(`prepplay:${k}`);
  const { ITEMS, SLOTS, isUnlocked, itemById, unlockHint, getOutfit } = await import('../src/core/wardrobe.js');
  const { ACHIEVEMENTS } = await import('../src/content/achievements.js');
  assert.ok(ITEMS.length >= 25);
  assert.equal(new Set(ITEMS.map((x) => x.id)).size, ITEMS.length);
  for (const it of ITEMS) {
    assert.ok(SLOTS.includes(it.slot), it.id);
    if (it.unlock?.type === 'ach') assert.ok(ACHIEVEMENTS.some((a) => a.id === it.unlock.value), `${it.id}: нет достижения ${it.unlock.value}`);
  }
  const fresh = { achievements: {}, xp: 0 };
  assert.ok(isUnlocked(itemById('cap'), fresh) && !isUnlocked(itemById('wings'), fresh));
  assert.ok(isUnlocked(itemById('cape'), { achievements: {}, xp: 5000 }));
  assert.ok(isUnlocked(itemById('wizard'), { achievements: { quizmaster: 1 }, xp: 0 }));
  assert.equal(unlockHint(itemById('crown')).key, 'wear.byChest');
  // Старое сохранение одной вещью переносится в её слот, а закрытая вещь не надевается.
  globalThis.localStorage.setItem('prepplay:prepiWear', JSON.stringify('glasses'));
  assert.equal(getOutfit(fresh).face, null);
  globalThis.localStorage.setItem('prepplay:chests', JSON.stringify([7]));
  assert.equal(getOutfit(fresh).face, 'glasses');
  assert.equal(getOutfit(fresh).head, 'cap');
});

test('приложение (PWA): манифест, иконки и сервис-воркер на месте и попадают на сайт', async () => {
  const { readFileSync, existsSync } = await import('node:fs');
  const manifest = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some((i) => i.sizes === '512x512') && manifest.icons.some((i) => i.purpose === 'maskable'));
  for (const icon of manifest.icons) assert.ok(existsSync(icon.src), icon.src);
  assert.ok(existsSync('icons/apple-touch-icon.png') && existsSync('sw.js'));
  const html = readFileSync('index.html', 'utf8');
  assert.ok(html.includes('rel="manifest"') && html.includes('apple-touch-icon'));
  const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
  for (const f of ['icons', 'manifest.webmanifest', 'sw.js']) assert.ok(ci.includes(f), `CI не копирует ${f}`);
});
