// Общие помощники для японского и корейского: разбор словарей, подбор неправильных вариантов
// и сборка задания. Варианты не должны совпадать ни в одном значении (на любом из трёх языков),
// иначе два ответа могли бы оказаться верными.

import { shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';

/** «en|ru|kk» → L(en, ru, kk). */
export const tri = (s) => {
  const [en, ru, kk] = s.split('|');
  return L(en, ru, kk);
};

/** Отдельные значения перевода: «дом, семья» → ['дом', 'семья'] (без пояснений в скобках). */
const parts = (s) =>
  String(s)
    .toLowerCase()
    .split(/[,;]\s*/)
    .map((x) => x.replace(/\([^)]*\)/g, '').replace(/^to /, '').trim())
    .filter(Boolean);

/** Пересекаются ли значения двух слов хотя бы на одном языке. */
export function overlap(a, b) {
  for (const l of ['en', 'ru', 'kk']) {
    const pa = parts(a[l]);
    const pb = new Set(parts(b[l]));
    if (pa.some((x) => pb.has(x))) return true;
  }
  return false;
}

/**
 * Три неправильных варианта к слову w: сначала из соседних уровней и той же части речи,
 * потом из любых. ok(x) - дополнительное условие (например, разное чтение).
 */
export function pickWrong(rng, w, list, ok = () => true, count = 3) {
  const near = list.filter((x) => x !== w && Math.abs(x.level - w.level) <= 1);
  const tiers = [near.filter((x) => x.pos === w.pos), near, list.filter((x) => x !== w)];
  const chosen = [w];
  for (const tier of tiers) {
    for (const x of shuffle(tier, rng)) {
      if (chosen.length > count) break;
      if (chosen.includes(x) || !ok(x)) continue;
      if (chosen.some((c) => overlap(c, x))) continue;
      chosen.push(x);
    }
  }
  return chosen.slice(1);
}

/** Сложность для очков опыта по уровню (1-6): 1-2 → 1, 3-4 → 2, 5-6 → 3. */
export const levelD = (level) => Math.min(3, Math.ceil(level / 2));

/** Задание с выбором ответа: правильный - первый в списке all. */
export function choiceQ(ctx, topic, { id, d, prompt, passage = null, ex, all, label }) {
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const q = poolQ(topic, d, { kind: 'text', passage, prompt, ex, mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) } });
  q.id = id;
  if (label) q.level = label;
  return q;
}

/**
 * Выбор задания без повторов в сессии: make(rng) → задание; пробуем несколько раз,
 * пока не найдём id, которого ещё не было (ctx.used).
 */
export function freshTask(ctx, make, tries = 10) {
  let q = null;
  for (let i = 0; i < tries; i++) {
    q = make();
    if (!ctx.used?.has(q.id)) return q;
  }
  return q;
}

/** Строки словаря «поле|поле|…» по уровням → объекты. fields - имена полей. */
export function parseRows(blocks, fields, start = 0) {
  const out = [];
  blocks.forEach((text, k) => {
    for (const line of text.trim().split('\n')) {
      const p = line.split('|').map((x) => x.trim());
      if (p.length !== fields.length) throw new Error(`Словарь: ${line}`);
      out.push({ level: k + 1, i: start + out.length, ...Object.fromEntries(fields.map((f, j) => [f, p[j]])) });
    }
  });
  return out;
}
