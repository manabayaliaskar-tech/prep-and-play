// Генерация входных данных для сортировок и разбор пользовательского ввода.

import { randomInt, shuffle } from '../core/random.js';

export const MIN_SIZE = 2;
export const MAX_SIZE = 60;
export const MIN_VALUE = 1;
export const MAX_VALUE = 999;

export const ARRAY_PRESETS = {
  random: 'Случайный',
  nearly: 'Почти отсортированный',
  reversed: 'Обратный порядок',
  few: 'Много повторов',
};

export function generateArray(kind, size, rng) {
  const n = Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(size)));
  const sortedValues = () =>
    Array.from({ length: n }, () => randomInt(rng, 5, 100)).sort((x, y) => x - y);

  switch (kind) {
    case 'nearly': {
      const values = sortedValues();
      const swaps = Math.max(1, Math.round(n / 10));
      for (let k = 0; k < swaps; k++) {
        const i = randomInt(rng, 0, n - 2);
        [values[i], values[i + 1]] = [values[i + 1], values[i]];
      }
      return values;
    }
    case 'reversed':
      return sortedValues().reverse();
    case 'few': {
      const pool = [20, 40, 60, 80, 100];
      return shuffle(
        Array.from({ length: n }, (_, i) => pool[i % pool.length]),
        rng,
      );
    }
    case 'random':
    default:
      return Array.from({ length: n }, () => randomInt(rng, 5, 100));
  }
}

/** Разбирает строку вида «5, 3, 8 1» в массив чисел. Возвращает { ok, values } или { ok: false, error }. */
export function parseArrayInput(text) {
  const parts = String(text)
    .split(/[\s,;]+/)
    .filter(Boolean);
  if (parts.length < MIN_SIZE) {
    return { ok: false, error: `Введите хотя бы ${MIN_SIZE} числа через запятую или пробел.` };
  }
  if (parts.length > MAX_SIZE) {
    return { ok: false, error: `Слишком много чисел: максимум ${MAX_SIZE}.` };
  }
  const values = [];
  for (const part of parts) {
    if (!/^\d+$/.test(part)) {
      return { ok: false, error: `«${part}» — не целое положительное число.` };
    }
    const value = Number(part);
    if (value < MIN_VALUE || value > MAX_VALUE) {
      return { ok: false, error: `Числа должны быть от ${MIN_VALUE} до ${MAX_VALUE}.` };
    }
    values.push(value);
  }
  return { ok: true, values };
}
