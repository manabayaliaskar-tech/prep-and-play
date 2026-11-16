// Профиль игрока: опыт, уровень, серия дней, статистика навыков, карта SAT, результаты по уровням
// и экзаменам, рекорды, достижения.
// Хранится в localStorage этого браузера.

import { evaluateAchievements } from '../content/achievements.js';
import { dayKey, daysBetween } from './dates.js';
import { emit } from './events.js';
import { storage } from './storage.js';

export const DAILY_GOAL = 60;
const KEY = 'profile';

function defaults() {
  return {
    v: 1,
    name: '',
    sound: true,
    xp: 0,
    streak: { count: 0, last: null, best: 0 },
    // Счётчики сегодняшнего дня: цель по опыту и ежедневные задания (quests — уже выданные награды).
    today: { date: null, xp: 0, answered: 0, correct: 0, combo: 0, stars2: 0, bosses: 0, quizzes: 0, quests: {} },
    daily: {},
    // Итоги прошлых дней { 'ГГГГ-ММ-ДД': { xp, a, c } } — для недельного отчёта.
    history: {},
    skills: {},
    map: { stars: {}, bosses: {} },
    records: { survival: 0, blitz: 0, detective: 0, quiz: {} },
    exams: [],
    // Результаты тренировок по дорожкам каталога: { 'math:l3': { best, runs, pct, last } }.
    practice: {},
    // Последнее занятие — для кнопки «Продолжить» на главной.
    last: null,
    achievements: {},
    counters: { answered: 0, correct: 0, bestCombo: 0, detectiveFound: 0, duelsSent: 0, langSwitch: 0, dailyDone: 0, quizzes: 0 },
  };
}

function load() {
  const saved = storage.get(KEY, null);
  const base = defaults();
  if (!saved || typeof saved !== 'object') return base;
  const merged = { ...base, ...saved };
  for (const key of ['streak', 'today', 'map', 'records', 'counters']) {
    merged[key] = { ...base[key], ...(saved[key] ?? {}) };
  }
  merged.map.stars = { ...(saved.map?.stars ?? {}) };
  merged.map.bosses = { ...(saved.map?.bosses ?? {}) };
  merged.practice = { ...(saved.practice ?? {}) };
  return merged;
}

let profile = load();

export function getProfile() {
  return profile;
}

export function saveProfile() {
  storage.set(KEY, profile);
  emit('profile', profile);
}

/** Уровень по опыту: на уровень 2 нужно 100 XP, дальше каждый следующий на 40 XP дороже. */
export function levelInfo(xp) {
  let level = 1;
  let need = 100;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    level += 1;
    need = 100 + (level - 1) * 40;
  }
  return { level, into: rest, need };
}

function touchStreak(today) {
  const s = profile.streak;
  if (s.last === today) return;
  s.count = s.last && daysBetween(s.last, today) === 1 ? s.count + 1 : 1;
  s.last = today;
  s.best = Math.max(s.best, s.count);
}

export function currentStreak(today = dayKey()) {
  const s = profile.streak;
  if (!s.last) return 0;
  const gap = daysBetween(s.last, today);
  return gap <= 1 ? s.count : 0;
}

export function todayXp(today = dayKey()) {
  return profile.today.date === today ? profile.today.xp : 0;
}

/** Счётчики сегодняшнего дня; в новый день начинаются с нуля. */
export function todayStats(today = dayKey()) {
  if (profile.today.date !== today) {
    archiveDay(profile.today);
    profile.today = { ...defaults().today, date: today };
  }
  return profile.today;
}

const HISTORY_DAYS = 70;

/** Переносит итоги закончившегося дня в историю (для недельного отчёта). Хранятся последние 70 дней. */
function archiveDay(day) {
  if (!day?.date || !(day.answered || day.xp)) return;
  const history = (profile.history ??= {});
  history[day.date] = { xp: day.xp, a: day.answered, c: day.correct };
  const keys = Object.keys(history).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - HISTORY_DAYS))) delete history[k];
}

/** Итоги дня: из истории или (для сегодняшнего) из текущих счётчиков. */
export function dayRecord(day) {
  if (profile.today.date === day) return { xp: profile.today.xp, a: profile.today.answered, c: profile.today.correct };
  return profile.history?.[day] ?? null;
}

export function addXp(amount) {
  if (!(amount > 0)) return;
  const before = levelInfo(profile.xp).level;
  profile.xp += amount;
  const today = dayKey();
  todayStats(today).xp += amount;
  touchStreak(today);
  const after = levelInfo(profile.xp).level;
  if (after > before) emit('levelup', after);
}

export function recordAnswer(skill, correct) {
  const stat = (profile.skills[skill] ??= { a: 0, c: 0 });
  stat.a += 1;
  if (correct) stat.c += 1;
  profile.counters.answered += 1;
  if (correct) profile.counters.correct += 1;
  const day = todayStats();
  day.answered += 1;
  if (correct) day.correct += 1;
}

/** Освоение навыка 0…1 (сглаженная доля правильных) или null, если ещё не решал. */
export function mastery(skill) {
  const stat = profile.skills[skill];
  return stat ? (stat.c + 1) / (stat.a + 2) : null;
}

export function checkAchievements() {
  const fresh = evaluateAchievements(profile).filter((id) => !profile.achievements[id]);
  for (const id of fresh) {
    profile.achievements[id] = dayKey();
    emit('achievement', id);
  }
  return fresh;
}

export function resetProgress() {
  const keep = { name: profile.name, sound: profile.sound };
  profile = { ...defaults(), ...keep };
  saveProfile();
}

/** Для тестов: подменить профиль. */
export function _setProfileForTests(p) {
  profile = { ...defaults(), ...p };
}
