// Профиль игрока: опыт, уровень, серия дней, статистика навыков, карта, рекорды, достижения.
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
    today: { date: null, xp: 0 },
    daily: {},
    skills: {},
    map: { stars: {}, bosses: {} },
    records: { survival: 0, blitz: 0, detective: 0 },
    exams: [],
    achievements: {},
    counters: { answered: 0, correct: 0, bestCombo: 0, detectiveFound: 0, duelsSent: 0, langSwitch: 0, dailyDone: 0 },
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

export function addXp(amount) {
  if (!(amount > 0)) return;
  const before = levelInfo(profile.xp).level;
  profile.xp += amount;
  const today = dayKey();
  if (profile.today.date !== today) profile.today = { date: today, xp: 0 };
  profile.today.xp += amount;
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
