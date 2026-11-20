// Набор тем английского для уровней курса. Лёгкий модуль: не тянет банк заданий, только список уровней.

import { ENGLISH_LEVELS } from './levels.js';

/**
 * Темы английского для указанных уровней: темы банка (где на уровне есть задания),
 * лексика и грамматика всех уровней, неправильные глаголы (A1-C1) и степени сравнения (A1-B1).
 */
export function englishSpec(levels) {
  const spec = [];
  for (const [topic, has] of Object.entries(ENGLISH_LEVELS)) {
    const keys = levels.filter((level) => has.includes(level));
    if (keys.length) spec.push([topic, keys]);
  }
  spec.push(['e.words', levels], ['e.gram', levels]);
  const irreg = levels.filter((l) => l <= 5);
  if (irreg.length) spec.push(['e.irreg', irreg]);
  const comp = levels.filter((l) => l <= 3);
  if (comp.length) spec.push(['e.comp', comp]);
  return spec;
}
