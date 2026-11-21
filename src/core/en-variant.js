// Вариант английского: британский ('uk', по умолчанию) или американский ('us').
// Влияет на написание слов в заданиях английского и на голос озвучки.

import { storage } from './storage.js';

export const EN_VARIANTS = ['uk', 'us'];

export function getEnVariant() {
  const v = storage.get('enVariant', 'uk');
  return EN_VARIANTS.includes(v) ? v : 'uk';
}

export function setEnVariant(v) {
  if (EN_VARIANTS.includes(v)) storage.set('enVariant', v);
}
