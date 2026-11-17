// Общий каталог магазина: вещи гардероба (wear), предметы комнаты (room) и эмоции (emote).
// У каждого товара: id, kind, slot, rarity, icon (для уведомлений), name ({ ru, en, kk } — у новых товаров)
// и unlock — как открывается (бесплатно, покупкой, за сезон, достижение и т. д.).

import { META as EMOTE_META, NAMES as EMOTE_NAMES } from '../content/emote-meta.js';
import { META as ROOM_META, NAMES as ROOM_NAMES } from '../content/room-meta.js';
import { getProfile } from './profile.js';
import { ITEMS, isUnlocked } from './wardrobe.js';

export const KINDS = ['wear', 'room', 'emote'];
export const ROOM_PRICES = { common: 120, rare: 350, epic: 800, legendary: 1800 };
export const EMOTE_PRICES = { common: 200, rare: 500, epic: 1100, legendary: 2400 };

for (const it of ITEMS) it.kind = 'wear';

const roomGoods = ROOM_META.map((m) => ({
  id: m.id,
  kind: 'room',
  slot: m.room,
  rarity: m.rarity ?? 'common',
  icon: m.icon ?? '🏠',
  name: ROOM_NAMES[m.id] ?? null,
  free: Boolean(m.free),
  unlock: m.free ? null : { type: 'shop', value: m.price ?? ROOM_PRICES[m.rarity ?? 'common'] },
}));

const emoteGoods = EMOTE_META.map((m) => ({
  id: m.id,
  kind: 'emote',
  slot: 'emote',
  rarity: m.rarity ?? 'common',
  icon: m.icon ?? '💃',
  name: EMOTE_NAMES[m.id] ?? null,
  unlock: { type: 'shop', value: m.price ?? EMOTE_PRICES[m.rarity ?? 'common'] },
}));

export const GOODS = [...ITEMS, ...roomGoods, ...emoteGoods];
const BY_ID = new Map(GOODS.map((g) => [g.id, g]));

export const goodById = (id) => BY_ID.get(id) ?? null;
export const roomGoodsList = () => roomGoods;
export const emoteGoodsList = () => emoteGoods;

/** Есть ли товар у игрока. */
export function hasGood(g, profile = getProfile()) {
  if (typeof g === 'string') g = goodById(g);
  if (!g) return false;
  if (g.kind === 'wear') return isUnlocked(g, profile);
  if (g.free) return true;
  return (profile.owned ?? []).includes(g.id);
}

/** Продаётся ли товар за монеты. */
export const forSale = (g) => g?.unlock?.type === 'shop';
