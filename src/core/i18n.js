// Переводы интерфейса: русский, английский, казахский.
// t('ключ') — строка на текущем языке; tx({ en, ru, kk }) — для текстов из контента.

import { STRINGS } from '../i18n/strings.js';
import { guessCurrency } from './pricing.js';
import { storage } from './storage.js';

export const LANGS = [
  { id: 'ru', label: 'RU' },
  { id: 'en', label: 'EN' },
  { id: 'kk', label: 'KZ' },
];

/** Валюты стран, где русский — общий язык общения. По ним узнаём регион по часовому поясу. */
const RU_REGION = new Set(['KZT', 'UZS', 'KGS', 'TJS', 'AZN', 'AMD', 'MDL', 'GEL', 'TMT', 'UAH', 'RUB', 'BYN']);

/**
 * Язык при первом заходе на сайт (потом его можно переключить в любой момент).
 * Казахский — если браузер на казахском. Русский — для стран СНГ: по языку браузера
 * или по часовому поясу, потому что у многих в регионе телефон настроен на английский.
 * Для остального мира — английский.
 */
export function detectLang(navLanguage = '', timeZone = '') {
  const nav = navLanguage.toLowerCase();
  if (nav.startsWith('kk')) return 'kk';
  if (/^(ru|be|uk|uz|ky|tg|az|hy|ka|tk)\b/.test(nav)) return 'ru';
  if (RU_REGION.has(guessCurrency(timeZone, navLanguage))) return 'ru';
  return nav ? 'en' : 'ru';
}

function detect() {
  let zone = '';
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    // Часовой пояс недоступен — определяем язык только по настройкам браузера.
  }
  return detectLang(globalThis.navigator?.language ?? '', zone);
}

let lang = storage.get('lang', null) ?? detect();
if (!STRINGS[lang]) lang = 'ru';
const listeners = new Set();

export function getLang() {
  return lang;
}

export function setLang(next) {
  if (!STRINGS[next] || next === lang) return;
  lang = next;
  storage.set('lang', next);
  if (globalThis.document) document.documentElement.lang = next;
  listeners.forEach((fn) => fn(next));
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function t(key, params = {}) {
  const template = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, k) => (params[k] ?? '').toString());
}

export function tx(obj, l = lang) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[l] ?? obj.en;
}
