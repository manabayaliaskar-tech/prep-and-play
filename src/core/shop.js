// Магазин Препи: покупки за монеты, товары дня со скидкой, сундуки удачи и коллекции.

import { dayKey } from './dates.js';
import { addCoins, getProfile, saveProfile } from './profile.js';
import { createRng, shuffle } from './random.js';
import { ITEMS, RARITIES, SETS, getOutfit, isUnlocked, itemById } from './wardrobe.js';
import { storage } from './storage.js';

export const shopItems = () => ITEMS.filter((it) => it.unlock?.type === 'shop');
export const isOwned = (it, profile = getProfile()) => isUnlocked(it, profile);

// ---------- Товары дня ----------

export const DEAL_DISCOUNTS = [50, 35, 25];

const seedOf = (text) => [...text].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);

/** Три товара дня (одни и те же весь день): один эпический или легендарный и два попроще. */
export function dailyDeals(day = dayKey()) {
  const rng = createRng(seedOf(`deals:${day}`));
  const items = shopItems();
  const top = shuffle(items.filter((it) => it.rarity === 'epic' || it.rarity === 'legendary'), rng)[0];
  const rest = shuffle(items.filter((it) => it !== top), rng).slice(0, 2);
  return [top, ...rest].map((it, i) => ({ id: it.id, discount: DEAL_DISCOUNTS[i] }));
}

/** Цена вещи сегодня (со скидкой, если это товар дня). */
export function priceOf(it, day = dayKey()) {
  const base = it.unlock?.value ?? 0;
  const deal = dailyDeals(day).find((d) => d.id === it.id);
  return deal ? Math.round((base * (100 - deal.discount)) / 100 / 5) * 5 : base;
}

// ---------- Покупка ----------

/**
 * Покупка вещи: списывает монеты, добавляет вещь и сразу надевает её.
 * Возвращает { ok: true, sets } (sets — только что собранные коллекции) или { ok: false, reason }.
 */
export function buyItem(id, day = dayKey()) {
  const it = itemById(id);
  const p = getProfile();
  if (!it || it.unlock?.type !== 'shop') return { ok: false, reason: 'notForSale' };
  if (isOwned(it, p)) return { ok: false, reason: 'owned' };
  const price = priceOf(it, day);
  if (!addCoins(-price)) return { ok: false, reason: 'coins' };
  grant(it, p);
  p.counters.bought = (p.counters.bought ?? 0) + 1;
  const sets = claimSets(p);
  saveProfile();
  return { ok: true, price, sets };
}

/** Выдать вещь и надеть её. */
function grant(it, p) {
  p.owned = [...new Set([...(p.owned ?? []), it.id])];
  const outfit = getOutfit(p);
  outfit[it.slot] = it.id;
  storage.set('outfit', outfit);
}

// ---------- Коллекции ----------

export function setProgress(set, profile = getProfile()) {
  const got = set.items.filter((id) => isOwned(itemById(id), profile)).length;
  return { got, total: set.items.length, done: got === set.items.length, claimed: (profile.sets ?? []).includes(set.id) };
}

/** Начисляет награды за только что собранные коллекции. Возвращает их список. */
export function claimSets(profile = getProfile()) {
  const fresh = SETS.filter((set) => setProgress(set, profile).done && !(profile.sets ?? []).includes(set.id));
  for (const set of fresh) {
    profile.sets = [...(profile.sets ?? []), set.id];
    addCoins(set.coins);
  }
  return fresh;
}

// ---------- Сундуки удачи ----------

export const BOXES = [
  { id: 'basic', icon: '📦', price: 250, odds: { common: 70, rare: 25, epic: 5 } },
  { id: 'super', icon: '🎁', price: 700, odds: { rare: 60, epic: 32, legendary: 8 } },
  { id: 'mega', icon: '💎', price: 1600, odds: { epic: 65, legendary: 35 } },
];

export const boxById = (id) => BOXES.find((b) => b.id === id) ?? null;

/** Можно ли что-то выиграть в сундуке (остались ли некупленные вещи нужной редкости). */
export function boxPool(box, profile = getProfile()) {
  return shopItems().filter((it) => box.odds[it.rarity] && !isOwned(it, profile));
}

/**
 * Открывает сундук: списывает монеты и выдаёт случайную вещь, которой ещё нет.
 * Шансы редкостей берутся из box.odds; если вещей какой-то редкости уже не осталось, её шанс делится между остальными.
 */
export function openBox(boxId, rng = Math.random, { free = false } = {}) {
  const box = boxById(boxId);
  const p = getProfile();
  if (!box) return { ok: false, reason: 'notForSale' };
  const pool = boxPool(box, p);
  if (!pool.length) {
    // Бесплатный сундук (награда сезона), когда собрано всё, превращается в монеты.
    if (free) {
      addCoins(Math.round(box.price / 2));
      saveProfile();
      return { ok: true, item: null, coins: Math.round(box.price / 2), sets: [] };
    }
    return { ok: false, reason: 'empty' };
  }
  if (!free && !addCoins(-box.price)) return { ok: false, reason: 'coins' };
  const rarities = RARITIES.filter((r) => box.odds[r] && pool.some((it) => it.rarity === r));
  const total = rarities.reduce((sum, r) => sum + box.odds[r], 0);
  let roll = rng() * total;
  let rarity = rarities[rarities.length - 1];
  for (const r of rarities) {
    roll -= box.odds[r];
    if (roll < 0) {
      rarity = r;
      break;
    }
  }
  const options = pool.filter((it) => it.rarity === rarity);
  const it = options[Math.floor(rng() * options.length)];
  grant(it, p);
  p.counters.boxes = (p.counters.boxes ?? 0) + 1;
  const sets = claimSets(p);
  saveProfile();
  return { ok: true, item: it, sets };
}

/** Сколько вещей из магазина уже есть и сколько всего. */
export function collectionStats(profile = getProfile()) {
  const all = shopItems();
  return { got: all.filter((it) => isOwned(it, profile)).length, total: all.length };
}
