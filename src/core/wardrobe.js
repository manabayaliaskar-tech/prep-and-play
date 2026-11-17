// Гардероб Препи: вещи по слотам (голова, лицо, шея, спина, цвет, аура, питомец) и за что они открываются —
// бесплатно, сундук за серию, достижение, уровень или покупка в магазине за монеты.
// Можно носить по одной вещи в каждом слоте.

import { ACHIEVEMENTS } from '../content/achievements.js';
import { META as PA_META, NAMES as PA_NAMES } from '../content/pets-auras-meta.js';
import { META as EXTRA_META, NAMES as EXTRA_NAMES } from '../content/wear-extra-meta.js';
import { META as OUTFIT_META, NAMES as OUTFIT_NAMES } from '../content/wear-outfit-meta.js';
import { getProfile, levelInfo } from './profile.js';
import { openedChests } from './rewards.js';
import { storage } from './storage.js';
import { THEMES } from './season.js';

export const SLOTS = ['head', 'face', 'neck', 'body', 'feet', 'hand', 'back', 'color', 'aura', 'pet'];

/** Редкость вещи и базовая цена в магазине. */
export const RARITIES = ['common', 'rare', 'epic', 'legendary'];
export const PRICES = { common: 150, rare: 400, epic: 900, legendary: 2000 };

const item = (id, slot, icon, unlock = null, rarity = 'common') => ({ id, slot, icon, unlock, rarity });
const chest = (days) => ({ type: 'chest', value: days });
const ach = (id) => ({ type: 'ach', value: id });
const level = (n) => ({ type: 'level', value: n });
/** Вещь из магазина: цена по редкости (или своя). */
const shop = (id, slot, icon, rarity, price = PRICES[rarity]) => item(id, slot, icon, { type: 'shop', value: price }, rarity);

export const ITEMS = [
  // ===== Голова =====
  item('cap', 'head', '🎓'),
  item('party', 'head', '🥳', ach('first')),
  item('beret', 'head', '🎨', ach('polyglot'), 'rare'),
  item('headphones', 'head', '🎧', chest(14), 'rare'),
  item('crown', 'head', '👑', chest(30), 'epic'),
  item('bow', 'head', '🎀', chest(60), 'epic'),
  item('laurel', 'head', '🌿', ach('olympian'), 'epic'),
  item('wizard', 'head', '🧙', ach('quizmaster'), 'epic'),
  item('halo', 'head', '😇', level(20), 'legendary'),
  item('astro', 'head', '🚀', chest(100), 'legendary'),
  item('nightcap', 'head', '🌙', ach('night'), 'rare'),
  shop('cowboy', 'head', '🤠', 'common'),
  shop('chef', 'head', '👨‍🍳', 'common'),
  shop('bunny', 'head', '🐰', 'common'),
  shop('catears', 'head', '🐱', 'common'),
  shop('flowers', 'head', '🌸', 'common'),
  shop('ninja', 'head', '🥷', 'rare'),
  shop('tophat', 'head', '🎩', 'rare'),
  shop('pirate', 'head', '🏴‍☠️', 'rare'),
  shop('santa', 'head', '🎅', 'rare'),
  shop('propeller', 'head', '🧢', 'rare'),
  shop('viking', 'head', '🪖', 'epic'),
  shop('tiara', 'head', '👸', 'epic'),
  shop('unicorn', 'head', '🦄', 'legendary'),
  shop('flamecrown', 'head', '🔥', 'legendary', 2500),
  // ===== Лицо =====
  item('glasses', 'face', '🤓', chest(7)),
  item('sunglasses', 'face', '😎', ach('quizsprint'), 'rare'),
  item('starglasses', 'face', '🤩', ach('quizdaily'), 'rare'),
  item('mustache', 'face', '🥸', ach('combo15'), 'rare'),
  item('monocle', 'face', '🧐', ach('accuracy'), 'epic'),
  shop('clownnose', 'face', '🤡', 'common'),
  shop('blush', 'face', '⭐', 'common'),
  shop('eyepatch', 'face', '🏴', 'common'),
  shop('glasses3d', 'face', '🎬', 'rare'),
  shop('heartglasses', 'face', '😍', 'rare'),
  shop('vr', 'face', '🥽', 'epic'),
  shop('cyber', 'face', '🤖', 'legendary'),
  // ===== Шея =====
  item('scarf', 'neck', '🧣', chest(3)),
  item('bowtie', 'neck', '🤵', ach('streak3')),
  item('medal', 'neck', '🏅', ach('century'), 'rare'),
  item('chain', 'neck', '📿', ach('flawless'), 'epic'),
  item('lei', 'neck', '🌺', ach('weekend'), 'rare'),
  shop('tie', 'neck', '👔', 'common'),
  shop('bell', 'neck', '🔔', 'common'),
  shop('winterscarf', 'neck', '🎄', 'rare'),
  shop('pearls', 'neck', '🤍', 'rare'),
  shop('amulet', 'neck', '🧿', 'epic'),
  // ===== Спина =====
  item('backpack', 'back', '🎒', ach('practice1')),
  item('cape', 'back', '🦸', level(5), 'rare'),
  item('sword', 'back', '🗡️', ach('champion'), 'epic'),
  item('wings', 'back', '🪽', level(10), 'epic'),
  item('jetpack', 'back', '🔥', ach('marathon'), 'epic'),
  shop('balloon', 'back', '🎈', 'common'),
  shop('shield', 'back', '🛡️', 'rare'),
  shop('guitar', 'back', '🎸', 'rare'),
  shop('batwings', 'back', '🦇', 'rare'),
  shop('katana', 'back', '⚔️', 'epic'),
  shop('butterfly', 'back', '🦋', 'epic'),
  shop('dragonwings', 'back', '🐉', 'legendary'),
  // ===== Цвет =====
  item('classic', 'color', '🟣'),
  item('mint', 'color', '🟢', ach('streak7')),
  item('pink', 'color', '🩷', ach('explorer'), 'rare'),
  item('night', 'color', '🌑', ach('perfect'), 'rare'),
  item('gold', 'color', '🟡', level(15), 'epic'),
  item('rainbow', 'color', '🌈', ach('quizsurvivor'), 'legendary'),
  item('ocean', 'color', '🌊', ach('linguist'), 'rare'),
  item('sunset', 'color', '🌅', ach('streak30'), 'epic'),
  shop('emerald', 'color', '💚', 'common'),
  shop('ice', 'color', '🧊', 'common'),
  shop('candy', 'color', '🍬', 'common'),
  shop('ruby', 'color', '❤️', 'rare'),
  shop('toxic', 'color', '☢️', 'rare'),
  shop('lava', 'color', '🌋', 'rare'),
  shop('pearl', 'color', '🤍', 'rare'),
  shop('shadow', 'color', '🖤', 'epic'),
  shop('galaxy', 'color', '🌌', 'epic'),
  shop('diamond', 'color', '💎', 'legendary'),
  // ===== Аура (летает вокруг Препи) =====
  shop('sparkles', 'aura', '✨', 'common'),
  shop('hearts', 'aura', '💖', 'common'),
  shop('bubbles', 'aura', '🫧', 'common'),
  shop('leaves', 'aura', '🍃', 'common'),
  shop('snow', 'aura', '❄️', 'rare'),
  shop('notes', 'aura', '🎵', 'rare'),
  shop('sakura', 'aura', '🌸', 'rare'),
  shop('stars', 'aura', '⭐', 'rare'),
  shop('money', 'aura', '💸', 'epic'),
  shop('lightning', 'aura', '⚡', 'epic'),
  shop('fire', 'aura', '🔥', 'epic'),
  shop('goldglow', 'aura', '🌟', 'legendary'),
  shop('rainbowring', 'aura', '🌈', 'legendary'),
  // ===== Питомец (сидит рядом с Препи) =====
  shop('chick', 'pet', '🐥', 'common'),
  shop('hamster', 'pet', '🐹', 'common'),
  shop('frog', 'pet', '🐸', 'common'),
  shop('turtle', 'pet', '🐢', 'common'),
  shop('cat', 'pet', '🐱', 'rare'),
  shop('dog', 'pet', '🐶', 'rare'),
  shop('penguin', 'pet', '🐧', 'rare'),
  shop('parrot', 'pet', '🦜', 'rare'),
  shop('fox', 'pet', '🦊', 'rare'),
  shop('panda', 'pet', '🐼', 'epic'),
  shop('owl', 'pet', '🦉', 'epic'),
  shop('octopus', 'pet', '🐙', 'epic'),
  shop('robot', 'pet', '🤖', 'epic'),
  shop('dino', 'pet', '🦖', 'epic'),
  shop('unicornpet', 'pet', '🦄', 'legendary'),
  shop('dragon', 'pet', '🐲', 'legendary'),
];

// Сезонные эксклюзивы: по три вещи на каждый месяц (аура, цвет, питомец) — только за ступени сезона.
const SEASON_ICONS = {
  frost: '🌨️', aurora: '🌌', snowman: '⛄', valentine: '💘', rose: '🌹', teddy: '🧸',
  tulips: '🌷', spring: '🌱', bee: '🐝', planets: '🪐', nebula: '🔭', alien: '👽',
  daisies: '🌼', meadow: '🍀', ladybug: '🐞', suns: '☀️', lemonade: '🍋', crab: '🦀',
  shells: '🐚', lagoon: '🏝️', dolphin: '🐬', fireworks: '🎆', neon: '💜', lion: '🦁',
  pencils: '✏️', chalk: '🖍️', bookworm: '🐛', ghosts: '👻', pumpkin: '🎃', batpet: '🦇',
  maple: '🍁', autumn: '🍂', hedgehog: '🦔', gifts: '🎁', xmas: '🎄', reindeer: '🦌',
};
THEMES.forEach((theme, month) =>
  theme.items.forEach((id, k) =>
    ITEMS.push(item(id, ['aura', 'color', 'pet'][k], SEASON_ICONS[id], { type: 'season', value: month }, k === 2 ? 'legendary' : 'epic')),
  ),
);

// Новые нарисованные вещи магазина (костюмы, обувь, вещи в руке, шапки, питомцы, ауры): цена — по редкости.
const NEW_NAMES = { ...OUTFIT_NAMES, ...EXTRA_NAMES, ...PA_NAMES };
for (const m of [...OUTFIT_META, ...EXTRA_META, ...PA_META]) {
  if (!SLOTS.includes(m.slot) || ITEMS.some((x) => x.id === m.id)) continue;
  const it = shop(m.id, m.slot, m.icon ?? '🎁', m.rarity ?? 'common', m.price ?? PRICES[m.rarity ?? 'common']);
  it.name = NEW_NAMES[m.id] ?? null;
  ITEMS.push(it);
}

/** Коллекции: собери все вещи набора — получи монеты (один раз). */
export const SETS = [
  { id: 'pirate', icon: '🏴‍☠️', items: ['pirate', 'eyepatch', 'parrot', 'pearls'], coins: 400 },
  { id: 'winter', icon: '❄️', items: ['santa', 'winterscarf', 'snow', 'penguin', 'ice'], coins: 500 },
  { id: 'cute', icon: '🐰', items: ['bunny', 'blush', 'hearts', 'hamster', 'bell'], coins: 300 },
  { id: 'nature', icon: '🌿', items: ['flowers', 'leaves', 'frog', 'turtle', 'emerald'], coins: 300 },
  { id: 'rock', icon: '🎸', items: ['glasses3d', 'tie', 'guitar', 'notes'], coins: 400 },
  { id: 'ninja', icon: '🥷', items: ['ninja', 'katana', 'sakura', 'shadow'], coins: 600 },
  { id: 'royal', icon: '👑', items: ['tiara', 'amulet', 'shield', 'ruby', 'goldglow'], coins: 900 },
  { id: 'cyber', icon: '🤖', items: ['cyber', 'vr', 'robot', 'lightning', 'toxic'], coins: 1000 },
  { id: 'magic', icon: '🦄', items: ['unicorn', 'butterfly', 'rainbowring', 'unicornpet', 'candy'], coins: 1500 },
  { id: 'dragon', icon: '🐲', items: ['flamecrown', 'dragonwings', 'fire', 'dragon', 'lava'], coins: 2000 },
];

export const itemById = (id) => ITEMS.find((x) => x.id === id) ?? null;

/** Открыта ли вещь для этого профиля. */
export function isUnlocked(it, profile = getProfile(), chests = openedChests()) {
  const u = it.unlock;
  if (!u) return true;
  if (u.type === 'chest') return chests.includes(u.value);
  if (u.type === 'ach') return Boolean(profile.achievements?.[u.value]);
  if (u.type === 'level') return levelInfo(profile.xp ?? 0).level >= u.value;
  if (u.type === 'shop') return (profile.owned ?? []).includes(it.id);
  if (u.type === 'season') return (profile.seasonItems ?? []).includes(it.id);
  return false;
}

export const unlockedItems = (profile = getProfile()) => ITEMS.filter((it) => isUnlocked(it, profile)).map((it) => it.id);

/** Как открыть вещь: { key, params } для перевода. */
export function unlockHint(it) {
  const u = it.unlock;
  if (!u) return null;
  if (u.type === 'chest') return { key: 'wear.byChest', params: { n: u.value } };
  if (u.type === 'level') return { key: 'wear.byLevel', params: { n: u.value } };
  if (u.type === 'shop') return { key: 'wear.byShop', params: { n: u.value } };
  if (u.type === 'season') return { key: 'wear.bySeason', params: { name: THEMES[u.value].name } };
  const a = ACHIEVEMENTS.find((x) => x.id === u.value);
  return { key: 'wear.byAch', params: { name: a?.name } };
}

const DEFAULT_OUTFIT = { head: 'cap', face: null, neck: null, body: null, feet: null, hand: null, back: null, color: 'classic', aura: null, pet: null };

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
  // О покупках, выигрышах в сундуке и наградах сезона сообщают магазин и страница сезона.
  return fresh.map(itemById).filter((it) => it.unlock?.type !== 'shop' && it.unlock?.type !== 'season');
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
  emerald: ['#bbf7d0', '#22c55e', '#14532d'],
  ice: ['#f0f9ff', '#a5f3fc', '#0891b2'],
  candy: ['#fdf2f8', '#f9a8d4', '#a855f7'],
  ruby: ['#fecdd3', '#e11d48', '#4c0519'],
  toxic: ['#ecfccb', '#a3e635', '#3f6212'],
  lava: ['#fde047', '#ef4444', '#450a0a'],
  pearl: ['#ffffff', '#e2e8f0', '#94a3b8'],
  shadow: ['#71717a', '#27272a', '#09090b'],
  galaxy: ['#c4b5fd', '#4c1d95', '#020617'],
  diamond: ['#ffffff', '#67e8f9', '#6366f1'],
  // Сезонные цвета.
  aurora: ['#a7f3d0', '#818cf8', '#312e81'],
  rose: ['#ffe4e6', '#fb7185', '#9f1239'],
  spring: ['#ecfccb', '#86efac', '#15803d'],
  nebula: ['#f5d0fe', '#7c3aed', '#0f172a'],
  meadow: ['#fef9c3', '#84cc16', '#365314'],
  lemonade: ['#fefce8', '#fde047', '#ca8a04'],
  lagoon: ['#ccfbf1', '#2dd4bf', '#115e59'],
  neon: ['#fae8ff', '#e879f9', '#6b21a8'],
  chalk: ['#f8fafc', '#cbd5e1', '#334155'],
  pumpkin: ['#ffedd5', '#fb923c', '#7c2d12'],
  autumn: ['#fef3c7', '#d97706', '#78350f'],
  xmas: ['#dcfce7', '#ef4444', '#14532d'],
};
