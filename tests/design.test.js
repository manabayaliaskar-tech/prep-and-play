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
