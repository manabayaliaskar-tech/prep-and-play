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
  { id: 'aurora', name: { en: 'Aurora', ru: 'Аврора', kk: 'Аврора' }, colors: ['#7c3aed', '#06b6d4'], meta: '#5b4ee6' },
  { id: 'sakura', name: { en: 'Sakura', ru: 'Сакура', kk: 'Сакура' }, colors: ['#e2557f', '#f9a8d4'], meta: '#e2557f' },
  { id: 'forest', name: { en: 'Forest', ru: 'Лес', kk: 'Орман' }, colors: ['#15803d', '#a16207'], meta: '#15803d' },
  { id: 'sand', name: { en: 'Desert', ru: 'Пустыня', kk: 'Шөл' }, colors: ['#c2410c', '#d4a017'], meta: '#b45309' },
  { id: 'mono', name: { en: 'Graphite', ru: 'Графит', kk: 'Графит' }, colors: ['#27272a', '#a1a1aa'], meta: '#27272a' },
  { id: 'night', name: { en: 'Night', ru: 'Ночь', kk: 'Түн' }, colors: ['#8b6cff', '#22d3ee'], meta: '#110d26', dark: true },
  { id: 'cosmos', name: { en: 'Cosmos', ru: 'Космос', kk: 'Ғарыш' }, colors: ['#38bdf8', '#f472b6'], meta: '#0a1022', dark: true },
  { id: 'neon', name: { en: 'Neon', ru: 'Неон', kk: 'Неон' }, colors: ['#e879f9', '#a3e635'], meta: '#0b0614', dark: true },
  { id: 'midnight', name: { en: 'Midnight', ru: 'Полночь', kk: 'Түн ортасы' }, colors: ['#fbbf24', '#60a5fa'], meta: '#0a0f1f', dark: true },
  { id: 'lava', name: { en: 'Lava', ru: 'Лава', kk: 'Лава' }, colors: ['#f97316', '#ef4444'], meta: '#160807', dark: true },
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
  // Признак тёмной темы — для общих правил всех тёмных тем.
  if (theme.dark) doc.documentElement.dataset.dark = '1';
  else delete doc.documentElement.dataset.dark;
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
