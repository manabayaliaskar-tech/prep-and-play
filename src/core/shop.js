// Магазин Препи 3.0: одежда, комната и эмоции за монеты; товары дня; сундуки с шансами, гарантией
// легендарки и осколками за повторки; обмен осколков на любую вещь; наборы с наградой и бонусом к монетам.

import { dayKey } from './dates.js';
import { GOODS, forSale, goodById, hasGood } from './goods.js';
import { addCoins, getProfile, saveProfile, setCoinBoost } from './profile.js';
import { createRng, shuffle } from './random.js';
import { storage } from './storage.js';
import { ITEMS, RARITIES, SETS, getOutfit, itemById } from './wardrobe.js';

export const shopGoods = (kind = null) => GOODS.filter((g) => forSale(g) && (!kind || g.kind === kind));
/** Вещи гардероба, которые продаются. */
export const shopItems = () => shopGoods('wear');
export const isOwned = (g, profile = getProfile()) => hasGood(g, profile);

// ---------- Товары дня ----------

export const DEAL_DISCOUNTS = [50, 35, 25, 20];

const seedOf = (text) => [...text].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);

/**
 * Четыре товара дня (одни и те же весь день): эпическая или легендарная вещь, вещь попроще,
 * предмет для комнаты и эмоция (если они есть в каталоге).
 */
export function dailyDeals(day = dayKey()) {
  const rng = createRng(seedOf(`deals:${day}`));
  const wear = shopGoods('wear');
  const top = shuffle(wear.filter((g) => g.rarity === 'epic' || g.rarity === 'legendary'), rng)[0];
  const picks = [top];
  const add = (list) => {
    const g = shuffle(list.filter((x) => !picks.includes(x)), rng)[0];
    if (g) picks.push(g);
  };
  add(wear);
  add(shopGoods('room'));
  add(shopGoods('emote'));
  while (picks.length < 4) add(shopGoods());
  return picks.map((g, i) => ({ id: g.id, discount: DEAL_DISCOUNTS[i] }));
}

/** Цена товара сегодня (со скидкой, если это товар дня). */
export function priceOf(g, day = dayKey()) {
  if (typeof g === 'string') g = goodById(g);
  const base = g?.unlock?.value ?? 0;
  const deal = dailyDeals(day).find((d) => d.id === g?.id);
  return deal ? Math.round((base * (100 - deal.discount)) / 100 / 5) * 5 : base;
}

// ---------- Выдача товара ----------

/** Выдать товар: одежду сразу надеть, предмет комнаты — поставить, эмоцию — выбрать победной, если её ещё нет. */
function grant(g, p) {
  p.owned = [...new Set([...(p.owned ?? []), g.id])];
  if (g.kind === 'wear') {
    const outfit = getOutfit(p);
    outfit[g.slot] = g.id;
    storage.set('outfit', outfit);
  } else if (g.kind === 'room') {
    storage.set('room', { ...getRoom(p), [g.slot]: g.id });
  } else if (g.kind === 'emote' && !getEmote(p)) {
    storage.set('emote', g.id);
  }
}

/**
 * Покупка за монеты. Возвращает { ok: true, price, sets } (sets — только что собранные наборы)
 * или { ok: false, reason: 'notForSale' | 'owned' | 'coins' }.
 */
export function buyItem(id, day = dayKey()) {
  const g = goodById(id);
  const p = getProfile();
  if (!g || !forSale(g)) return { ok: false, reason: 'notForSale' };
  if (hasGood(g, p)) return { ok: false, reason: 'owned' };
  const price = priceOf(g, day);
  if (!addCoins(-price)) return { ok: false, reason: 'coins' };
  grant(g, p);
  p.counters.bought = (p.counters.bought ?? 0) + 1;
  const sets = claimSets(p);
  saveProfile();
  return { ok: true, price, sets };
}

// ---------- Наборы ----------

/** Скидка на покупку всех недостающих вещей набора разом. */
export const SET_DISCOUNT = 20;
/** Бонус к монетам за опыт, пока надет весь набор. */
export const SET_BONUS = 10;

export const setById = (id) => SETS.find((s) => s.id === id) ?? null;

export function setProgress(set, profile = getProfile()) {
  const got = set.items.filter((id) => hasGood(goodById(id), profile)).length;
  return { got, total: set.items.length, done: got === set.items.length, claimed: (profile.sets ?? []).includes(set.id) };
}

/** Начисляет награды за только что собранные наборы. Возвращает их список. */
export function claimSets(profile = getProfile()) {
  const fresh = SETS.filter((set) => setProgress(set, profile).done && !(profile.sets ?? []).includes(set.id));
  for (const set of fresh) {
    profile.sets = [...(profile.sets ?? []), set.id];
    addCoins(set.coins);
  }
  return fresh;
}

/** Сколько стоят недостающие вещи набора разом (со скидкой SET_DISCOUNT %). */
export function setPrice(set, profile = getProfile(), day = dayKey()) {
  const missing = set.items.map(goodById).filter((g) => g && !hasGood(g, profile));
  if (missing.some((g) => !forSale(g))) return null;
  const full = missing.reduce((sum, g) => sum + priceOf(g, day), 0);
  return { missing, full, price: Math.round((full * (100 - SET_DISCOUNT)) / 100 / 5) * 5 };
}

/** Купить все недостающие вещи набора разом и надеть набор. */
export function buySet(setId, day = dayKey()) {
  const set = setById(setId);
  const p = getProfile();
  if (!set) return { ok: false, reason: 'notForSale' };
  const offer = setPrice(set, p, day);
  if (!offer || !offer.missing.length) return { ok: false, reason: offer ? 'owned' : 'notForSale' };
  if (!addCoins(-offer.price)) return { ok: false, reason: 'coins' };
  for (const g of offer.missing) grant(g, p);
  wearSet(set, p);
  p.counters.bought = (p.counters.bought ?? 0) + offer.missing.length;
  const sets = claimSets(p);
  saveProfile();
  return { ok: true, price: offer.price, sets };
}

/** Надеть все вещи набора, которые есть. */
export function wearSet(set, p = getProfile()) {
  const outfit = getOutfit(p);
  for (const id of set.items) {
    const it = itemById(id);
    if (it && hasGood(it, p)) outfit[it.slot] = it.id;
  }
  storage.set('outfit', outfit);
  return outfit;
}

/** Набор, который сейчас надет целиком (все его вещи гардероба на Препи), — он даёт бонус к монетам. */
export function activeSet(profile = getProfile(), outfit = getOutfit(profile)) {
  return (
    SETS.find((set) => {
      const wear = set.items.map(itemById).filter(Boolean);
      return wear.length >= 2 && setProgress(set, profile).done && wear.every((it) => outfit[it.slot] === it.id);
    }) ?? null
  );
}

setCoinBoost(() => (activeSet() ? 1 + SET_BONUS / 100 : 1));

// ---------- Сундуки ----------

export const BOXES = [
  { id: 'basic', icon: '📦', price: 250, odds: { common: 70, rare: 25, epic: 5 } },
  { id: 'super', icon: '🎁', price: 700, odds: { rare: 60, epic: 32, legendary: 8 }, pity: 10 },
  { id: 'mega', icon: '💎', price: 1600, odds: { epic: 65, legendary: 35 }, pity: 4 },
];

/** Сколько осколков даёт повторка и сколько осколков стоит вещь при обмене. */
export const DUP_SHARDS = { common: 15, rare: 40, epic: 100, legendary: 250 };
export const SHARD_PRICES = { common: 60, rare: 160, epic: 400, legendary: 1000 };
/** Шанс, что сундук выдаст новую вещь (а не повторку), пока новые этой редкости ещё есть. */
export const NEW_CHANCE = 0.8;

export const boxById = (id) => BOXES.find((b) => b.id === id) ?? null;

/** Что может выпасть в сундуке: все продающиеся товары его редкостей (включая уже купленные — они станут осколками). */
export function boxPool(box) {
  return shopGoods().filter((g) => box.odds[g.rarity]);
}

/** Через сколько открытий этого сундука легендарка гарантирована (null — у сундука нет гарантии). */
export function pityLeft(box, profile = getProfile()) {
  if (!box.pity) return null;
  return Math.max(1, box.pity - (profile.pity?.[box.id] ?? 0));
}

/**
 * Открывает сундук: списывает монеты (если не бесплатный) и выдаёт товар.
 * Редкость — по шансам сундука (на последнем открытии до гарантии — легендарка). Новая вещь выпадает с шансом NEW_CHANCE,
 * иначе — повторка, которая превращается в осколки. Возвращает { ok, item, dup, shards, sets }.
 */
export function openBox(boxId, rng = Math.random, { free = false } = {}) {
  const box = boxById(boxId);
  const p = getProfile();
  if (!box) return { ok: false, reason: 'notForSale' };
  if (!free && !addCoins(-box.price)) return { ok: false, reason: 'coins' };
  const pool = boxPool(box);
  const rarities = RARITIES.filter((r) => box.odds[r] && pool.some((g) => g.rarity === r));
  let rarity = rarities[rarities.length - 1];
  const pity = (p.pity ??= {});
  if (box.pity && (pity[box.id] ?? 0) + 1 >= box.pity) rarity = 'legendary';
  else {
    const total = rarities.reduce((sum, r) => sum + box.odds[r], 0);
    let roll = rng() * total;
    for (const r of rarities) {
      roll -= box.odds[r];
      if (roll < 0) {
        rarity = r;
        break;
      }
    }
  }
  if (box.pity) pity[box.id] = rarity === 'legendary' ? 0 : (pity[box.id] ?? 0) + 1;
  const options = pool.filter((g) => g.rarity === rarity);
  const fresh = options.filter((g) => !hasGood(g, p));
  const list = fresh.length && rng() < NEW_CHANCE ? fresh : options;
  const g = list[Math.floor(rng() * list.length)];
  p.counters.boxes = (p.counters.boxes ?? 0) + 1;
  if (hasGood(g, p)) {
    const shards = DUP_SHARDS[g.rarity];
    p.shards = (p.shards ?? 0) + shards;
    saveProfile();
    return { ok: true, item: g, dup: true, shards, sets: [] };
  }
  grant(g, p);
  const sets = claimSets(p);
  saveProfile();
  return { ok: true, item: g, dup: false, shards: 0, sets };
}

/** Обмен осколков на любую продающуюся вещь. */
export function buyWithShards(id) {
  const g = goodById(id);
  const p = getProfile();
  if (!g || !forSale(g)) return { ok: false, reason: 'notForSale' };
  if (hasGood(g, p)) return { ok: false, reason: 'owned' };
  const price = SHARD_PRICES[g.rarity];
  if ((p.shards ?? 0) < price) return { ok: false, reason: 'shards' };
  p.shards -= price;
  grant(g, p);
  const sets = claimSets(p);
  saveProfile();
  return { ok: true, price, sets };
}

// ---------- Комната ----------

/** Что стоит в комнате: { slot: id }. Бесплатные базовые вещи (обои, пол, окно) стоят по умолчанию. */
export function defaultRoom() {
  const room = {};
  for (const g of shopGoodsAll('room')) if (g.free && !(g.slot in room)) room[g.slot] = g.id;
  return room;
}
const shopGoodsAll = (kind) => GOODS.filter((g) => g.kind === kind);

export function getRoom(profile = getProfile()) {
  const saved = storage.get('room', null);
  const room = defaultRoom();
  if (saved && typeof saved === 'object') {
    for (const [slot, id] of Object.entries(saved)) {
      const g = goodById(id);
      if (id === null && !(slot in defaultRoom())) room[slot] = null;
      else if (g?.kind === 'room' && g.slot === slot && hasGood(g, profile)) room[slot] = id;
    }
  }
  return room;
}

/** Поставить предмет в комнату или убрать (обои, пол и окно при снятии возвращаются к базовым). */
export function toggleRoomItem(id) {
  const g = goodById(id);
  const p = getProfile();
  if (!g || g.kind !== 'room' || !hasGood(g, p)) return getRoom(p);
  const room = getRoom(p);
  const base = defaultRoom()[g.slot] ?? null;
  room[g.slot] = room[g.slot] === id ? base : id;
  storage.set('room', room);
  return room;
}

// ---------- Эмоции ----------

export const ownedEmotes = (profile = getProfile()) => shopGoodsAll('emote').filter((g) => hasGood(g, profile)).map((g) => g.id);

/** Победная эмоция: Препи танцует её после удачных тренировок. */
export function getEmote(profile = getProfile()) {
  const id = storage.get('emote', null);
  return id && ownedEmotes(profile).includes(id) ? id : null;
}

export function setEmote(id) {
  storage.set('emote', id && ownedEmotes().includes(id) ? id : null);
  return getEmote();
}

// ---------- Статистика ----------

/** Сколько товаров уже есть и сколько всего (по разделу или всего). */
export function collectionStats(profile = getProfile(), kind = null) {
  const all = shopGoods(kind);
  return { got: all.filter((g) => hasGood(g, profile)).length, total: all.length };
}

export { ITEMS };
