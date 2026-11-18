// Банк заданий с выбором ответа для предметов, где важны знания: история, биология, география и другие.
// Запись: [сложность, вопрос, правильный ответ, [три неправильных], разбор].
// Тексты - на трёх языках (T) либо только на языке экзамена (R).

import { pick } from '../core/random.js';
import { L, mcText, poolQ } from './gen.js';

/** Текст на трёх языках в порядке: русский, казахский, английский. */
export const T = (ru, kk, en) => L(en, ru, kk);
/** Текст только на языке экзамена: показывается одинаково при любом языке интерфейса. */
export const R = (text) => L(text, text, text);

/**
 * Генератор для банка: (ctx, ключ) → задание. Ключ 0 - любая сложность, 1…3 - только заданная.
 * Внутри одной сессии задания не повторяются, пока банк не закончится.
 */
export function bankMaker(topic, rows) {
  const items = rows.map((row, i) => ({ row, id: `${topic}:${i}` }));
  return (ctx, key = 0) => {
    const byKey = key ? items.filter((it) => it.row[0] === key) : items;
    const pool = byKey.length ? byKey : items;
    const fresh = pool.filter((it) => !ctx.used?.has(it.id));
    const it = pick(ctx.rng, fresh.length ? fresh : pool);
    const [d, question, correct, wrong, ex] = it.row;
    const q = poolQ(topic, d, { kind: 'text', prompt: question, ex, mc: mcText(ctx.rng, correct, wrong) });
    q.id = it.id;
    return q;
  };
}
