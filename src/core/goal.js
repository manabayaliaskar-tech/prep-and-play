// Цель пользователя: к какому экзамену он готовится. Спрашиваем при первом заходе,
// чтобы сразу вести в нужный экзамен, а на главной показывать свои экзамены первыми.

import { storage } from './storage.js';
import { guessCurrency } from './pricing.js';

/** Национальные экзамены по стране (страну узнаём по валюте часового пояса). */
const LOCAL = {
  KZT: ['ent'],
  RUB: ['ege', 'oge'],
  BYN: ['ct'],
  UZS: ['dtm'],
  KGS: ['ort'],
  TJS: ['tj'],
  AZN: ['dim'],
  AMD: ['arm'],
  MDL: ['bac'],
};
/** Международные экзамены - сразу после своих. */
const WORLD = ['sat', 'ielts', 'toefl', 'hsk'];

/** Валюта страны пользователя по часовому поясу и языку браузера. */
export function userCurrency() {
  let zone = '';
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    // Часовой пояс недоступен - решаем только по языку браузера.
  }
  return guessCurrency(zone, globalThis.navigator?.language ?? '');
}

/** Экзамены в порядке «свои, международные, остальные». ids - все экзамены каталога. */
export function regionExams(ids, currency = userCurrency(), goal = getGoal()) {
  return [...new Set([goal, ...(LOCAL[currency] ?? []), ...WORLD, ...ids])].filter((id) => id && ids.includes(id));
}

export const WELCOME_KEY = 'welcomeDone';
/** Приветствие «К чему готовишься?» уже показывали. */
export const welcomeDone = () => storage.get(WELCOME_KEY, false) === true;

export const getGoal = () => {
  const goal = storage.get('goal', null);
  return typeof goal === 'string' ? goal : null;
};

export const setGoal = (id) => storage.set('goal', id);

/** Первый урок курса: для экзамена - уровень 1 первого раздела, иначе - страница курса. */
export function goalHref(course) {
  if (!course) return '/';
  if (course.id === 'sat') return '/level/rw1/1';
  if (course.group === 'exams' && course.tracks?.length) return `/x/${course.id}/lv/${course.tracks[0].id}/1`;
  return `/c/${course.id}`;
}
