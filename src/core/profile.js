// Профиль игрока: опыт, уровень, серия дней, статистика навыков, карта SAT, результаты по уровням
// и экзаменам, рекорды, достижения.
// Хранится в localStorage этого браузера.

import { evaluateAchievements } from '../content/achievements.js';
import { ACH_COINS, RESCUE_XP, XP_PER_COIN, levelCoins, streakMultiplier } from './economy.js';
import { addSeasonPts } from './season.js';
import { dayKey, daysBetween } from './dates.js';
import { emit } from './events.js';
import { resetSeen } from './seen.js';
import { storage } from './storage.js';

export const DAILY_GOAL = 60;
const KEY = 'profile';

function defaults() {
  return {
    v: 1,
    name: '',
    sound: true,
    xp: 0,
    // Монеты для магазина Препи; coinDust - остаток XP, ещё не превращённый в монету.
    coins: 0,
    coinDust: 0,
    // Купленные вещи, полученные награды за коллекции и день последнего подарка Препи.
    owned: [],
    sets: [],
    gift: null,
    // Погасшая серия, которую можно спасти сегодня: { count, day }.
    streakLost: null,
    streak: { count: 0, last: null, best: 0 },
    // Счётчики сегодняшнего дня: цель по опыту и ежедневные задания (quests - уже выданные награды).
    today: { date: null, xp: 0, answered: 0, correct: 0, combo: 0, stars2: 0, bosses: 0, quizzes: 0, quests: {} },
    daily: {},
    // Итоги прошлых дней { 'ГГГГ-ММ-ДД': { xp, a, c } } - для недельного отчёта.
    history: {},
    skills: {},
    map: { stars: {}, bosses: {} },
    records: { survival: 0, blitz: 0, detective: 0, quiz: {} },
    exams: [],
    // Результаты тренировок по дорожкам каталога: { 'math:l3': { best, runs, pct, last } }.
    practice: {},
    // Последнее занятие - для кнопки «Продолжить» на главной.
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
  merged.owned = Array.isArray(saved.owned) ? [...saved.owned] : [];
  // Монеты появились позже опыта: старым игрокам начисляем их за весь накопленный опыт и достижения.
  if (saved.coins === undefined) merged.coins = Math.floor((saved.xp ?? 0) / XP_PER_COIN) + ACH_COINS * Object.keys(saved.achievements ?? {}).length;
  merged.sets = Array.isArray(saved.sets) ? [...saved.sets] : [];
  merged.seasonItems = Array.isArray(saved.seasonItems) ? [...saved.seasonItems] : [];
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
  // Вернулся после перерыва в неделю и больше - достижение «Возвращение».
  if (s.last && daysBetween(s.last, today) >= 8) profile.counters.comeback = (profile.counters.comeback ?? 0) + 1;
  // Пропущен ровно один день - серию ещё можно спасти сегодня двойной нормой.
  profile.streakLost = s.last && s.count >= 2 && daysBetween(s.last, today) === 2 ? { count: s.count, day: today } : null;
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

// Бонус к монетам за опыт (например, +10 % за надетый целиком набор). Задаёт магазин, чтобы не было циклического импорта.
let coinBoost = () => 1;
export function setCoinBoost(fn) {
  coinBoost = fn;
}

/**
 * Начисляет опыт с множителем за серию и монеты (1 монета за XP_PER_COIN XP).
 * Возвращает, сколько XP начислено на самом деле.
 */
export function addXp(amount) {
  if (!(amount > 0)) return 0;
  const today = dayKey();
  touchStreak(today);
  const gained = Math.round(amount * streakMultiplier(profile.streak.count));
  const before = levelInfo(profile.xp).level;
  profile.xp += gained;
  const day = todayStats(today);
  day.xp += gained;
  const dust = (profile.coinDust ?? 0) + gained * coinBoost();
  addCoins(Math.floor(dust / XP_PER_COIN));
  profile.coinDust = dust % XP_PER_COIN;
  maybeRescue(today, day.xp);
  // Очки сезона = опыт этого месяца.
  const season = addSeasonPts(profile, gained, today);
  if (season.rollover) emit('seasonEnd', season.rollover);
  if (season.tierUp) emit('seasonTier', season.tierUp);
  const after = levelInfo(profile.xp).level;
  for (let l = before + 1; l <= after; l += 1) addCoins(levelCoins(l));
  if (after > before) emit('levelup', after);
  return gained;
}

/** Монеты: добавить (amount > 0) или потратить (amount < 0). Возвращает false, если не хватает. */
export function addCoins(amount) {
  if (!amount) return true;
  const now = profile.coins ?? 0;
  if (now + amount < 0) return false;
  profile.coins = now + amount;
  if (amount > 0) profile.coinsEarned = (profile.coinsEarned ?? 0) + amount;
  return true;
}

/** Серия возвращается, если в день возвращения набрано RESCUE_XP опыта. */
function maybeRescue(today, xpToday) {
  const lost = profile.streakLost;
  if (lost?.day !== today || xpToday < RESCUE_XP) return;
  const s = profile.streak;
  s.count = lost.count + 1;
  s.best = Math.max(s.best, s.count);
  profile.streakLost = null;
  profile.counters.rescued = (profile.counters.rescued ?? 0) + 1;
  emit('streakRescued', s.count);
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
  // Время занятий - для достижений «Сова» и «Жаворонок».
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 4) profile.counters.night = (profile.counters.night ?? 0) + 1;
  else if (hour >= 4 && hour < 8) profile.counters.lark = (profile.counters.lark ?? 0) + 1;
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
    addCoins(ACH_COINS);
    emit('achievement', id);
  }
  return fresh;
}

/** Проверить достижения после действий вне заданий (гардероб, план, карточки, сундук) и сохранить. */
export function syncAchievements() {
  if (checkAchievements().length) saveProfile();
}

export function resetProgress() {
  const keep = { name: profile.name, sound: profile.sound };
  profile = { ...defaults(), ...keep };
  resetSeen();
  saveProfile();
}

/** Для тестов: подменить профиль. */
export function _setProfileForTests(p) {
  profile = { ...defaults(), ...p };
}
