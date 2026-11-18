// Мини-уроки «сначала знания, потом задания»: по одному уроку на тему (id темы как в pools/topics.js).
//
// Формат урока (все тексты - L(en, ru, kk); формулы без слов - same('...')):
//   rule:    L(...)                     - главная мысль, 1-3 предложения
//   points:  [L(...), ...]              - 2-4 коротких пункта: формулы, признаки, исключения (необязательно)
//   example: { q: L(...), steps: [L(...), ...] } - разобранный пример по шагам (2-4 шага)
//   check:   { q: L(...), options: [L(...), L(...), L(...)], answer: 0, why: L(...) } - «проверь себя»
//
// Без эмодзи и без длинных тире: только обычный дефис «-».

import code from './code.js';
import english from './english.js';
import humanities from './humanities.js';
import languages from './languages.js';
import math from './math.js';
import olymp from './olymp.js';
import science from './science.js';

export const LESSONS = { ...math, ...olymp, ...science, ...english, ...humanities, ...languages, ...code };

/** Урок по теме или null. */
export const lessonFor = (topic) => LESSONS[topic] ?? null;
