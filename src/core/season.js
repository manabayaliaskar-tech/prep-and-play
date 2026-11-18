// Препи Пасс: каждый календарный месяц — новый сезон со своей темой и 30 уровнями наград на двух дорожках:
// бесплатной и «Золотой» (открывается за монеты). Очки пасса — опыт за месяц плюс задания пасса (3 на день, 5 на неделю).
// После 30-го уровня — бесконечные бонусные уровни с осколками.
// Очки сезона = опыт, заработанный в этом месяце (с множителем серии). На ступенях — монеты,
// бесплатные сундуки удачи и три эксклюзивные вещи, которые можно получить только в этом месяце.

import { dayKey } from './dates.js';

export const TIERS = 30;
export const TIER_PTS = 150;

/** Темы сезонов по месяцам: иконка, цвета и три эксклюзива (аура, цвет, питомец). */
export const THEMES = [
  { name: { en: 'Winter tale', ru: 'Зимняя сказка', kk: 'Қысқы ертегі' }, icon: '❄️', colors: ['#bae6fd', '#6366f1'], items: ['frost', 'aurora', 'snowman'] },
  { name: { en: 'Hearts', ru: 'Сердечки', kk: 'Жүрекшелер' }, icon: '💝', colors: ['#fbcfe8', '#e11d48'], items: ['valentine', 'rose', 'teddy'] },
  { name: { en: 'Spring bloom', ru: 'Весеннее цветение', kk: 'Көктемгі гүлдену' }, icon: '🌷', colors: ['#bbf7d0', '#ec4899'], items: ['tulips', 'spring', 'bee'] },
  { name: { en: 'Space', ru: 'Космос', kk: 'Ғарыш' }, icon: '🚀', colors: ['#c7d2fe', '#1e1b4b'], items: ['planets', 'nebula', 'alien'] },
  { name: { en: 'Garden', ru: 'Сад', kk: 'Бақ' }, icon: '🌼', colors: ['#fef08a', '#16a34a'], items: ['daisies', 'meadow', 'ladybug'] },
  { name: { en: 'Summer', ru: 'Лето', kk: 'Жаз' }, icon: '☀️', colors: ['#fde68a', '#f97316'], items: ['suns', 'lemonade', 'crab'] },
  { name: { en: 'Ocean', ru: 'Океан', kk: 'Мұхит' }, icon: '🌊', colors: ['#a5f3fc', '#0369a1'], items: ['shells', 'lagoon', 'dolphin'] },
  { name: { en: 'Festival', ru: 'Фестиваль', kk: 'Фестиваль' }, icon: '🎆', colors: ['#f0abfc', '#7c3aed'], items: ['fireworks', 'neon', 'lion'] },
  { name: { en: 'Back to school', ru: 'Снова в школу', kk: 'Қайтадан мектепке' }, icon: '📚', colors: ['#fde68a', '#065f46'], items: ['pencils', 'chalk', 'bookworm'] },
  { name: { en: 'Halloween', ru: 'Хэллоуин', kk: 'Хэллоуин' }, icon: '🎃', colors: ['#fdba74', '#4c1d95'], items: ['ghosts', 'pumpkin', 'batpet'] },
  { name: { en: 'Leaf fall', ru: 'Листопад', kk: 'Жапырақ түсу' }, icon: '🍂', colors: ['#fed7aa', '#9a3412'], items: ['maple', 'autumn', 'hedgehog'] },
  { name: { en: 'New Year', ru: 'Новый год', kk: 'Жаңа жыл' }, icon: '🎄', colors: ['#bbf7d0', '#b91c1c'], items: ['gifts', 'xmas', 'reindeer'] },
];

/** Ступени с вещами и сундуками; остальные — монеты. */
const ITEM_TIERS = { 10: 0, 20: 1, 30: 2 };
const BOX_TIERS = { 5: 'basic', 15: 'super', 25: 'mega' };

export const seasonId = (day = dayKey()) => day.slice(0, 7);
export const seasonMonth = (id) => Number(id.slice(5, 7)) - 1;
export const themeOf = (id) => THEMES[seasonMonth(id)];

/** Цена «Золотой» дорожки в монетах. */
export const GOLD_PRICE = 1500;

// «Золотая» дорожка: на особых уровнях — вещи магазина (какие именно — выбирает магазин по сезону), сундуки и главный приз.
const GOLD_SPECIAL = {
  3: { type: 'good', kind: 'emote', rarity: 'rare' },
  6: { type: 'good', kind: 'room', rarity: 'rare' },
  9: { type: 'good', kind: 'wear', rarity: 'epic' },
  12: { type: 'box', box: 'super' },
  15: { type: 'good', kind: 'emote', rarity: 'epic' },
  18: { type: 'good', kind: 'room', rarity: 'epic' },
  21: { type: 'good', kind: 'wear', rarity: 'epic' },
  24: { type: 'box', box: 'mega' },
  27: { type: 'good', kind: 'emote', rarity: 'legendary' },
  30: { type: 'good', kind: 'wear', rarity: 'legendary', prize: true },
};

/**
 * Награда уровня. Бесплатная дорожка: { type: 'coins', n } | { type: 'shards', n } | { type: 'box', box } | { type: 'item', id }.
 * «Золотая» — ещё { type: 'good', kind, rarity } (вещь магазина этого сезона).
 */
export function tierReward(id, tier, track = 'free') {
  if (track === 'gold') {
    if (GOLD_SPECIAL[tier]) return { ...GOLD_SPECIAL[tier] };
    return tier % 2 ? { type: 'shards', n: 15 + tier * 2 } : { type: 'coins', n: 80 + tier * 10 };
  }
  if (ITEM_TIERS[tier] !== undefined) return { type: 'item', id: themeOf(id).items[ITEM_TIERS[tier]] };
  if (BOX_TIERS[tier]) return { type: 'box', box: BOX_TIERS[tier] };
  if (tier % 3 === 0) return { type: 'shards', n: 10 + tier };
  return { type: 'coins', n: Math.round((30 + tier * 5) / 5) * 5 };
}

/** Состояние сезона в профиле (новый месяц — новый сезон). */
export function seasonState(profile, day = dayKey()) {
  const id = seasonId(day);
  const s = profile.season?.id === id ? profile.season : { id, pts: 0, claimed: [] };
  const tier = Math.min(TIERS, Math.floor(s.pts / TIER_PTS));
  const into = tier >= TIERS ? (s.pts - TIERS * TIER_PTS) % TIER_PTS : s.pts - tier * TIER_PTS;
  const gold = Boolean(s.gold);
  const claimedGold = s.claimedGold ?? [];
  const claimable = [];
  const claimableGold = [];
  for (let k = 1; k <= tier; k++) {
    if (!s.claimed.includes(k)) claimable.push(k);
    if (gold && !claimedGold.includes(k)) claimableGold.push(k);
  }
  const bonus = Math.max(0, Math.floor((s.pts - TIERS * TIER_PTS) / TIER_PTS));
  const bonusReady = Math.max(0, bonus - (s.bonusClaimed ?? 0));
  return { id, pts: s.pts, tier, into, claimed: s.claimed, claimable, gold, claimedGold, claimableGold, bonus, bonusReady };
}

/** Профиль на текущий сезон (новый месяц — новый сезон). */
function ensureSeason(profile, day) {
  const id = seasonId(day);
  if (profile.season?.id !== id) profile.season = { id, pts: 0, claimed: [] };
  return profile.season;
}

/** Открыть «Золотую» дорожку за монеты. Награды уже пройденных уровней сразу становятся доступны. */
export function buyGold(profile, day = dayKey()) {
  const s = ensureSeason(profile, day);
  if (s.gold) return { ok: false, reason: 'owned' };
  if ((profile.coins ?? 0) < GOLD_PRICE) return { ok: false, reason: 'coins' };
  profile.coins -= GOLD_PRICE;
  s.gold = true;
  s.claimedGold = [];
  return { ok: true };
}

/** Бонусный уровень после 30-го: осколки (на «Золотой» — вдвое больше). */
export const BONUS_SHARDS = 50;
export function claimBonus(profile, day = dayKey()) {
  const st = seasonState(profile, day);
  if (!st.bonusReady) return null;
  const s = ensureSeason(profile, day);
  s.bonusClaimed = (s.bonusClaimed ?? 0) + 1;
  const n = BONUS_SHARDS * (st.gold ? 2 : 1);
  profile.shards = (profile.shards ?? 0) + n;
  return { type: 'shards', n };
}

/** Сколько дней и часов до конца сезона (до конца месяца). */
export function seasonLeft(now = new Date()) {
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const ms = end - now;
  return { days: Math.floor(ms / 86400000), hours: Math.floor((ms % 86400000) / 3600000) };
}

/**
 * Начисляет очки сезона. Если начался новый месяц, невзятые награды прошлого сезона
 * выдаются автоматически (сундуки — монетами), а очки начинаются с нуля.
 * Возвращает { tierUp: новая ступень или 0, rollover: { coins, items } | null }.
 */
export function addSeasonPts(profile, pts, day = dayKey()) {
  const id = seasonId(day);
  let rollover = null;
  if (profile.season?.id !== id) {
    if (profile.season?.id) rollover = settleSeason(profile);
    profile.season = { id, pts: 0, claimed: [] };
  }
  const before = Math.min(TIERS, Math.floor(profile.season.pts / TIER_PTS));
  profile.season.pts += Math.max(0, pts);
  const after = Math.min(TIERS, Math.floor(profile.season.pts / TIER_PTS));
  return { tierUp: after > before ? after : 0, rollover };
}

const BOX_COINS = { basic: 150, super: 400, mega: 900 };
/** Невзятая вещь «Золотой» дорожки в конце сезона превращается в осколки. */
const GOOD_SHARDS = { rare: 160, epic: 400, legendary: 1000 };

/** Невзятые награды закончившегося сезона: монеты и вещи выдаются сразу. */
function settleSeason(profile) {
  const st = seasonState(profile, `${profile.season.id}-15`);
  let coins = 0;
  const items = [];
  let shards = 0;
  const take = (r) => {
    if (r.type === 'coins') coins += r.n;
    else if (r.type === 'shards') shards += r.n;
    else if (r.type === 'box') coins += BOX_COINS[r.box];
    else if (r.type === 'good') shards += GOOD_SHARDS[r.rarity];
    else items.push(r.id);
  };
  for (const k of st.claimable) take(tierReward(st.id, k));
  for (const k of st.claimableGold) take(tierReward(st.id, k, 'gold'));
  profile.coins = (profile.coins ?? 0) + coins;
  if (shards) profile.shards = (profile.shards ?? 0) + shards;
  profile.seasonItems = [...new Set([...(profile.seasonItems ?? []), ...items])];
  return { coins, items, shards };
}

/**
 * Забирает награду уровня на дорожке (если уровень достигнут, награда ещё не взята, а для «Золотой» — пасс куплен).
 * Монеты, осколки и вещи сезона выдаются сразу; сундуки и вещи магазина открывает экран.
 */
export function claimTier(profile, tier, day = dayKey(), track = 'free') {
  const st = seasonState(profile, day);
  if (tier > st.tier) return null;
  if (track === 'gold' ? !st.gold || st.claimedGold.includes(tier) : st.claimed.includes(tier)) return null;
  const s = ensureSeason(profile, day);
  if (track === 'gold') s.claimedGold = [...(s.claimedGold ?? []), tier];
  else s.claimed = [...s.claimed, tier];
  const r = tierReward(st.id, tier, track);
  if (r.type === 'coins') profile.coins = (profile.coins ?? 0) + r.n;
  if (r.type === 'shards') profile.shards = (profile.shards ?? 0) + r.n;
  if (r.type === 'item') profile.seasonItems = [...new Set([...(profile.seasonItems ?? []), r.id])];
  return r;
}

// ---------- Задания пасса ----------

const count = (key) => (p) => p.counters?.[key] ?? 0;
/** Задания: metric — счётчик профиля (прогресс = прирост с момента выдачи задания) или abs — текущее значение. */
export const QUESTS = {
  'd.answer': { kind: 'day', target: 20, pts: 120, metric: count('answered') },
  'd.correct': { kind: 'day', target: 15, pts: 120, metric: count('correct') },
  'd.xp': { kind: 'day', target: 150, pts: 150, abs: (p, day) => (p.today?.date === day ? p.today.xp : 0) },
  'd.goal': { kind: 'day', target: 60, pts: 100, abs: (p, day) => (p.today?.date === day ? p.today.xp : 0) },
  'd.quiz': { kind: 'day', target: 1, pts: 100, metric: count('quizzes') },
  'd.daily': { kind: 'day', target: 1, pts: 100, metric: count('dailyDone') },
  'd.explain': { kind: 'day', target: 1, pts: 80, metric: count('explained') },
  'w.answer': { kind: 'week', target: 150, pts: 400, metric: count('answered') },
  'w.correct': { kind: 'week', target: 100, pts: 400, metric: count('correct') },
  'w.quiz': { kind: 'week', target: 5, pts: 350, metric: count('quizzes') },
  'w.streak': { kind: 'week', target: 5, pts: 350, abs: (p) => p.streak?.count ?? 0 },
  'w.xp': { kind: 'week', target: 1000, pts: 450, metric: (p) => p.xp ?? 0 },
  'w.mock': { kind: 'week', target: 1, pts: 500, metric: count('mocks') },
  'w.box': { kind: 'week', target: 2, pts: 250, metric: count('boxes') },
  'w.buy': { kind: 'week', target: 1, pts: 200, metric: count('bought') },
};

const seedOf = (text) => [...text].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);
/** Понедельник недели дня (ключ недели). */
export function weekKey(day) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
const pickQuests = (kind, key, n) =>
  Object.keys(QUESTS)
    .filter((q) => QUESTS[q].kind === kind)
    .sort((a, b) => seedOf(`${key}:${a}`) - seedOf(`${key}:${b}`))
    .slice(0, n);

/**
 * Задания пасса на сегодня и на неделю: [{ id, kind, target, pts, value, done, claimed }].
 * При первом обращении в день/неделю запоминает стартовые значения счётчиков.
 */
export function passQuests(profile, day = dayKey()) {
  const s = ensureSeason(profile, day);
  const q = (s.quests ??= {});
  const wk = weekKey(day);
  const base = (ids) => Object.fromEntries(ids.map((id) => [id, QUESTS[id].metric ? QUESTS[id].metric(profile) : 0]));
  if (q.day !== day) {
    const ids = pickQuests('day', day, 3);
    Object.assign(q, { day, daily: ids, dayBase: base(ids), dayDone: [] });
  }
  if (q.week !== wk) {
    const ids = pickQuests('week', wk, 5);
    Object.assign(q, { week: wk, weekly: ids, weekBase: base(ids), weekDone: [] });
  }
  const row = (id, isDay) => {
    const def = QUESTS[id];
    const b = (isDay ? q.dayBase : q.weekBase)[id] ?? 0;
    const value = Math.max(0, def.abs ? def.abs(profile, day) : def.metric(profile) - b);
    const claimed = (isDay ? q.dayDone : q.weekDone).includes(id);
    return { id, kind: def.kind, target: def.target, pts: def.pts, value: Math.min(value, def.target), done: value >= def.target, claimed };
  };
  return { daily: q.daily.map((id) => row(id, true)), weekly: q.weekly.map((id) => row(id, false)) };
}

/** Забрать очки за выполненное задание. Возвращает { pts, tierUp } или null. */
export function claimQuest(profile, id, day = dayKey()) {
  const all = passQuests(profile, day);
  const quest = [...all.daily, ...all.weekly].find((x) => x.id === id);
  if (!quest || !quest.done || quest.claimed) return null;
  const q = profile.season.quests;
  (quest.kind === 'day' ? q.dayDone : q.weekDone).push(id);
  const res = addSeasonPts(profile, quest.pts, day);
  return { pts: quest.pts, tierUp: res.tierUp };
}
