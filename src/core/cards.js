// Карточки слов с интервальным повтором (как в Anki): английский, испанский, французский, китайский.
// «Знал» — карточка вернётся через 1, 3, 7, 21 день, после этого слово выучено.
// «Не знал» — карточка вернётся завтра и начнёт с начала.

import { WORDS } from '../pools/languages/vocab.js';
import { HANZI } from '../pools/languages/hanzi.js';
import { dayKey } from './dates.js';
import { addDays } from './review.js';
import { storage } from './storage.js';

export const CARD_INTERVALS = [1, 3, 7, 21];
export const LEARNED = CARD_INTERVALS.length;
export const DECK_LANGS = ['en', 'es', 'fr', 'zh'];
/** Какой курс соответствует колоде. */
export const DECK_COURSE = { en: 'english', es: 'spanish', fr: 'french', zh: 'chinese' };

/** Колода языка: [{ id, level, front, sub, back: { en, ru, kk } }]. */
export function deck(lang) {
  if (lang === 'zh') {
    return HANZI.map((w) => ({ id: `zh:${w.i}`, level: w.level, front: w.hz, sub: w.py, back: { en: w.en, ru: w.ru, kk: w.kk } }));
  }
  return WORDS.map((w) => ({
    id: `${lang}:${w.i}`,
    level: w.level,
    front: w[lang],
    sub: '',
    // В английской колоде английский интерфейс показывает русский и казахский перевод.
    back: lang === 'en' ? { en: `${w.ru} · ${w.kk}`, ru: w.ru, kk: w.kk } : { en: w.en, ru: w.ru, kk: w.kk },
  }));
}

export function cardState() {
  const s = storage.get('cards', {});
  return s && typeof s === 'object' && !Array.isArray(s) ? s : {};
}

/** Карточки к повтору сегодня и сколько слов выучено. */
export function deckStats(lang, today = dayKey()) {
  const state = cardState();
  let due = 0;
  let learned = 0;
  let seen = 0;
  for (const [id, st] of Object.entries(state)) {
    if (!id.startsWith(`${lang}:`)) continue;
    seen += 1;
    if (st.s >= LEARNED) learned += 1;
    else if (st.d <= today) due += 1;
  }
  return { due, learned, seen };
}

/** Колода на сессию: сначала карточки к повтору, потом новые слова выбранного уровня. */
export function sessionCards(lang, level, count = 15, today = dayKey()) {
  const state = cardState();
  const all = deck(lang);
  const due = all.filter((c) => state[c.id] && state[c.id].s < LEARNED && state[c.id].d <= today);
  const fresh = all.filter((c) => !state[c.id] && c.level === level);
  return [...due, ...fresh].slice(0, count);
}

/** Ответ на карточку: knew — знал или нет. Возвращает true, если слово выучено. */
export function rateCard(id, knew, today = dayKey()) {
  const state = cardState();
  const st = state[id] ?? { s: 0, d: today };
  if (knew) {
    if (st.s < LEARNED) {
      st.d = addDays(today, CARD_INTERVALS[st.s]);
      st.s += 1;
    }
  } else {
    st.s = 0;
    st.d = addDays(today, 1);
  }
  state[id] = st;
  storage.set('cards', state);
  return st.s >= LEARNED;
}
