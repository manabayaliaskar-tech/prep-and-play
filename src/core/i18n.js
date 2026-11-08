// Переводы интерфейса: русский, английский, казахский.
// t('ключ') — строка на текущем языке; tx({ en, ru, kk }) — для текстов из контента.

import { STRINGS } from '../i18n/strings.js';
import { storage } from './storage.js';

export const LANGS = [
  { id: 'ru', label: 'RU' },
  { id: 'en', label: 'EN' },
  { id: 'kk', label: 'KZ' },
];

function detect() {
  const nav = (globalThis.navigator?.language ?? '').toLowerCase();
  // По умолчанию — русский (основная аудитория), казахский — если браузер на казахском.
  return nav.startsWith('kk') ? 'kk' : 'ru';
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
