// Как показывать товары магазина: миниатюра, название, редкость, раздел.

import { goodById } from '../core/goods.js';
import { t, tx } from '../core/i18n.js';
import * as roomArt from './art/room.js';
import { itemThumb } from './item-thumb.js';
import { mascot } from './mascot.js';

const STATIC_OUTFIT = { head: 'cap', face: null, neck: null, body: null, feet: null, hand: null, back: null, color: 'classic', aura: null, pet: null };

/** Название товара на текущем языке. */
export function goodName(g) {
  if (typeof g === 'string') g = goodById(g);
  if (!g) return '';
  return g.name ? tx(g.name) : t(`wear.${g.id}`);
}

/** Миниатюра товара (SVG). */
export function goodThumb(g) {
  if (typeof g === 'string') g = goodById(g);
  if (!g) return '';
  if (g.kind === 'room') return roomArt.roomItemThumb?.(g.slot, g.id) || `<span class="item-thumb thumb-icon">${g.icon}</span>`;
  if (g.kind === 'emote') return `<span class="item-thumb thumb-emote">${mascot('happy', 'mascot-thumb', STATIC_OUTFIT, { emote: g.id })}</span>`;
  return itemThumb(g);
}

export const rarityPill = (r) => `<span class="rarity r-${r}">${t(`rar.${r}`)}</span>`;

/** Подпись раздела: «Шапка», «Комната · Диван», «Эмоция». */
export function kindLabel(g) {
  if (g.kind === 'room') return `${t('shop3.room')} · ${t(`room.slot.${g.slot}`)}`;
  if (g.kind === 'emote') return t('shop3.emote');
  return t(`wear.slot.${g.slot}`);
}
