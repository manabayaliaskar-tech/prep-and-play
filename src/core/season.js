// Сезоны: каждый календарный месяц — новый сезон со своей темой и 30 ступенями наград.
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

/** Награда ступени: { type: 'coins', n } | { type: 'box', box } | { type: 'item', id }. */
export function tierReward(id, tier) {
  if (ITEM_TIERS[tier] !== undefined) return { type: 'item', id: themeOf(id).items[ITEM_TIERS[tier]] };
  if (BOX_TIERS[tier]) return { type: 'box', box: BOX_TIERS[tier] };
  return { type: 'coins', n: Math.round((30 + tier * 5) / 5) * 5 };
}

/** Состояние сезона в профиле (новый месяц — новый сезон). */
export function seasonState(profile, day = dayKey()) {
  const id = seasonId(day);
  const s = profile.season?.id === id ? profile.season : { id, pts: 0, claimed: [] };
  const tier = Math.min(TIERS, Math.floor(s.pts / TIER_PTS));
  const into = tier >= TIERS ? TIER_PTS : s.pts - tier * TIER_PTS;
  const claimable = [];
  for (let k = 1; k <= tier; k++) if (!s.claimed.includes(k)) claimable.push(k);
  return { id, pts: s.pts, tier, into, claimed: s.claimed, claimable };
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

/** Невзятые награды закончившегося сезона: монеты и вещи выдаются сразу. */
function settleSeason(profile) {
  const st = seasonState(profile, `${profile.season.id}-15`);
  let coins = 0;
  const items = [];
  for (const k of st.claimable) {
    const r = tierReward(st.id, k);
    if (r.type === 'coins') coins += r.n;
    else if (r.type === 'box') coins += BOX_COINS[r.box];
    else items.push(r.id);
  }
  profile.coins = (profile.coins ?? 0) + coins;
  profile.seasonItems = [...new Set([...(profile.seasonItems ?? []), ...items])];
  return { coins, items };
}

/** Забирает награду ступени (если ступень достигнута и награда ещё не взята). */
export function claimTier(profile, tier, day = dayKey()) {
  const st = seasonState(profile, day);
  if (tier > st.tier || st.claimed.includes(tier)) return null;
  if (profile.season?.id !== st.id) profile.season = { id: st.id, pts: st.pts, claimed: [] };
  profile.season.claimed = [...profile.season.claimed, tier];
  const r = tierReward(st.id, tier);
  if (r.type === 'coins') profile.coins = (profile.coins ?? 0) + r.n;
  if (r.type === 'item') profile.seasonItems = [...new Set([...(profile.seasonItems ?? []), r.id])];
  return r;
}
