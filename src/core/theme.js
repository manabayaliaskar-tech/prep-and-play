// Цветовые темы оформления. Основная — «Преп» (фиолетовая). Выбор хранится в этом браузере.
// Палитры описаны в styles/main.css в блоках [data-theme="…"]; здесь — список для переключателя.

import { storage } from './storage.js';

export const DEFAULT_THEME = 'prep';

/** colors — цвета образца в переключателе, meta — цвет панели браузера на телефоне. */
export const THEMES = [
  { id: 'prep', name: { en: 'Prep', ru: 'Преп', kk: 'Преп' }, colors: ['#6c4cf5', '#ec4899'], meta: '#6c4cf5' },
  { id: 'ocean', name: { en: 'Ocean', ru: 'Океан', kk: 'Мұхит' }, colors: ['#0284c7', '#14b8a6'], meta: '#0284c7' },
  { id: 'sunset', name: { en: 'Sunset', ru: 'Закат', kk: 'Күн батуы' }, colors: ['#f97316', '#e11d48'], meta: '#ea580c' },
  { id: 'mint', name: { en: 'Mint', ru: 'Мята', kk: 'Жалбыз' }, colors: ['#0d9488', '#84cc16'], meta: '#0d9488' },
  { id: 'candy', name: { en: 'Candy', ru: 'Конфета', kk: 'Кәмпит' }, colors: ['#db2777', '#a855f7'], meta: '#db2777' },
  { id: 'night', name: { en: 'Night', ru: 'Ночь', kk: 'Түн' }, colors: ['#8b6cff', '#22d3ee'], meta: '#110d26', dark: true },
  { id: 'cosmos', name: { en: 'Cosmos', ru: 'Космос', kk: 'Ғарыш' }, colors: ['#38bdf8', '#f472b6'], meta: '#0a1022', dark: true },
];

export const themeById = (id) => THEMES.find((theme) => theme.id === id) ?? THEMES[0];

export function getTheme() {
  return themeById(storage.get('theme', DEFAULT_THEME)).id;
}

/** Применяет тему к странице: атрибут data-theme на <html> и цвет панели браузера. */
export function applyTheme(id = getTheme(), doc = globalThis.document) {
  const theme = themeById(id);
  if (!doc) return theme;
  doc.documentElement.dataset.theme = theme.id;
  doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.meta);
  return theme;
}

export function setTheme(id) {
  const theme = themeById(id);
  storage.set('theme', theme.id);
  applyTheme(theme.id);
  globalThis.document?.dispatchEvent(new CustomEvent('themechange', { detail: theme.id }));
  return theme;
}
