// Генератор случайных чисел с «зерном» (seed).
// Одинаковое зерно → одинаковые задания. Так работают дуэли и ежедневный челлендж:
// у всех игроков одно зерно, значит и задания одинаковые.

export function createRng(seed = Date.now()) {
  let t = seed >>> 0;
  return function rng() {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

export function shuffle(items, rng) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function newSeed() {
  return Math.floor(Math.random() * 2 ** 31);
}

/** Превращает строку в число (хеш FNV-1a). Нужен для «зерна» ежедневного челленджа. */
export function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
