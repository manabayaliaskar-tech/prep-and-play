// Гардероб Препи: вещи по слотам (голова, лицо, шея, спина, цвет) и за что они открываются —
// бесплатно, сундук за серию, достижение или уровень. Можно носить по одной вещи в каждом слоте.

import { ACHIEVEMENTS } from '../content/achievements.js';
import { getProfile, levelInfo } from './profile.js';
import { openedChests } from './rewards.js';
import { storage } from './storage.js';

export const SLOTS = ['head', 'face', 'neck', 'back', 'color'];

const item = (id, slot, icon, unlock = null) => ({ id, slot, icon, unlock });
const chest = (days) => ({ type: 'chest', value: days });
const ach = (id) => ({ type: 'ach', value: id });
const level = (n) => ({ type: 'level', value: n });

export const ITEMS = [
  // Голова
  item('cap', 'head', '🎓'),
  item('party', 'head', '🥳', ach('first')),
  item('beret', 'head', '🎨', ach('polyglot')),
  item('headphones', 'head', '🎧', chest(14)),
  item('crown', 'head', '👑', chest(30)),
  item('bow', 'head', '🎀', chest(60)),
  item('laurel', 'head', '🌿', ach('olympian')),
  item('wizard', 'head', '🧙', ach('quizmaster')),
  item('halo', 'head', '😇', level(20)),
  item('astro', 'head', '🚀', chest(100)),
  item('nightcap', 'head', '🌙', ach('night')),
  // Лицо
  item('glasses', 'face', '🤓', chest(7)),
  item('sunglasses', 'face', '😎', ach('quizsprint')),
  item('starglasses', 'face', '🤩', ach('quizdaily')),
  item('mustache', 'face', '🥸', ach('combo15')),
  item('monocle', 'face', '🧐', ach('accuracy')),
  // Шея
  item('scarf', 'neck', '🧣', chest(3)),
  item('bowtie', 'neck', '🤵', ach('streak3')),
  item('medal', 'neck', '🏅', ach('century')),
  item('chain', 'neck', '📿', ach('flawless')),
  item('lei', 'neck', '🌺', ach('weekend')),
  // Спина
  item('backpack', 'back', '🎒', ach('practice1')),
  item('cape', 'back', '🦸', level(5)),
  item('sword', 'back', '🗡️', ach('champion')),
  item('wings', 'back', '🪽', level(10)),
  item('jetpack', 'back', '🔥', ach('marathon')),
  // Цвет
  item('classic', 'color', '🟣'),
  item('mint', 'color', '🟢', ach('streak7')),
  item('pink', 'color', '🩷', ach('explorer')),
  item('night', 'color', '🌑', ach('perfect')),
  item('gold', 'color', '🟡', level(15)),
  item('rainbow', 'color', '🌈', ach('quizsurvivor')),
  item('ocean', 'color', '🌊', ach('linguist')),
  item('sunset', 'color', '🌅', ach('streak30')),
];

export const itemById = (id) => ITEMS.find((x) => x.id === id) ?? null;

/** Открыта ли вещь для этого профиля. */
export function isUnlocked(it, profile = getProfile(), chests = openedChests()) {
  const u = it.unlock;
  if (!u) return true;
  if (u.type === 'chest') return chests.includes(u.value);
  if (u.type === 'ach') return Boolean(profile.achievements?.[u.value]);
  if (u.type === 'level') return levelInfo(profile.xp ?? 0).level >= u.value;
  return false;
}

export const unlockedItems = (profile = getProfile()) => ITEMS.filter((it) => isUnlocked(it, profile)).map((it) => it.id);

/** Как открыть вещь: { key, params } для перевода. */
export function unlockHint(it) {
  const u = it.unlock;
  if (!u) return null;
  if (u.type === 'chest') return { key: 'wear.byChest', params: { n: u.value } };
  if (u.type === 'level') return { key: 'wear.byLevel', params: { n: u.value } };
  const a = ACHIEVEMENTS.find((x) => x.id === u.value);
  return { key: 'wear.byAch', params: { name: a?.name } };
}

const DEFAULT_OUTFIT = { head: 'cap', face: null, neck: null, back: null, color: 'classic' };

/** Что сейчас надето. Старое сохранение (одна вещь строкой) переносится в свой слот. */
export function getOutfit(profile = getProfile()) {
  let saved = storage.get('outfit', null);
  if (!saved || typeof saved !== 'object') {
    saved = { ...DEFAULT_OUTFIT };
    const legacy = itemById(storage.get('prepiWear', ''));
    if (legacy) saved[legacy.slot] = legacy.id;
  }
  const out = { ...DEFAULT_OUTFIT };
  for (const slot of SLOTS) {
    const it = itemById(saved[slot]);
    out[slot] = it && it.slot === slot && isUnlocked(it, profile) ? it.id : slot === 'color' ? 'classic' : saved[slot] === null ? null : DEFAULT_OUTFIT[slot];
  }
  return out;
}

/** Надеть вещь или снять, если она уже надета (цвет снимается до классического). */
export function toggleItem(id) {
  const it = itemById(id);
  if (!it || !isUnlocked(it)) return getOutfit();
  const outfit = getOutfit();
  outfit[it.slot] = outfit[it.slot] === id ? (it.slot === 'color' ? 'classic' : null) : id;
  storage.set('outfit', outfit);
  return outfit;
}

/** Новые открытые вещи, о которых ещё не сообщали. В первый раз просто запоминает текущие. */
export function takeNewItems(profile = getProfile()) {
  const unlocked = unlockedItems(profile);
  const known = storage.get('wearKnown', null);
  if (!Array.isArray(known)) {
    storage.set('wearKnown', unlocked);
    return [];
  }
  const fresh = unlocked.filter((id) => !known.includes(id));
  if (fresh.length) storage.set('wearKnown', [...known, ...fresh]);
  return fresh.map(itemById);
}

/** Цвета шара для слота «цвет». */
export const COLORS = {
  mint: ['#d1fae5', '#34d399', '#047857'],
  pink: ['#fce7f3', '#f472b6', '#be185d'],
  night: ['#c7d2fe', '#4338ca', '#0f172a'],
  gold: ['#fef9c3', '#facc15', '#b45309'],
  rainbow: ['#fde68a', '#f472b6', '#6366f1'],
  ocean: ['#bae6fd', '#0ea5e9', '#075985'],
  sunset: ['#fed7aa', '#f97316', '#9a3412'],
};
