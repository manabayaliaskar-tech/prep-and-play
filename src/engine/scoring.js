// Примерный прогноз балла SAT по пробнику.
// Как и на настоящем цифровом SAT, второй модуль зависит от первого:
// хорошо решил первый → второй модуль сложнее, и потолок балла выше.
// Это учебная модель, а не официальная шкала College Board.

export const ROUTE_THRESHOLD = 0.6;
export const DIFFICULTY_WEIGHT = { 1: 1, 2: 1.5, 3: 2 };

export function weightedRatio(items) {
  let earned = 0;
  let possible = 0;
  for (const { d, correct } of items) {
    const w = DIFFICULTY_WEIGHT[d] ?? 1;
    possible += w;
    if (correct) earned += w;
  }
  return possible ? earned / possible : 0;
}

export function routeAfterModule1(items) {
  if (!items.length) return 'easy';
  const ratio = items.filter((i) => i.correct).length / items.length;
  return ratio >= ROUTE_THRESHOLD ? 'hard' : 'easy';
}

/** Балл раздела 200–800 (шаг 10). */
export function sectionScore(module1, module2, route) {
  const perf = 0.5 * weightedRatio(module1) + 0.5 * weightedRatio(module2);
  const raw = route === 'hard' ? 380 + 420 * perf : 200 + 420 * perf;
  return Math.min(800, Math.max(200, Math.round(raw / 10) * 10));
}

/** Сложности заданий модуля: первый — смешанный, второй — по маршруту. */
export function moduleDifficulties(moduleIndex, route, count) {
  const pattern = moduleIndex === 0 ? [1, 2, 3] : route === 'hard' ? [2, 3, 3] : [1, 1, 2];
  return Array.from({ length: count }, (_, i) => pattern[i % pattern.length]);
}
