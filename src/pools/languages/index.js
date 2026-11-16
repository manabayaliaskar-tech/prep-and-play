// Иностранные языки (испанский, французский, китайский): задания по уровням.
// Уровень — от 1 до 6 (A1–C2 или HSK 1–6). Задания не повторяются, пока не закончится уровень.

import { pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';

const FILL = L(
  'Choose the option that completes the sentence correctly.',
  'Выбери вариант, который правильно дополняет предложение.',
  'Сөйлемді дұрыс толықтыратын нұсқаны таңда.',
);

/** Сложность для очков опыта: уровни 1–2 → 1, 3–4 → 2, 5–6 → 3. */
const difficulty = (level) => Math.min(3, Math.ceil(level / 2));

/**
 * Генератор для языкового банка: (ctx, уровень) → задание.
 * Если вопрос — строка с пропуском, она показывается как текст, а условие общее («Выбери вариант…»).
 * Если вопрос — текст на трёх языках, он и есть условие.
 */
export function languageMaker(topic, rows) {
  const items = rows.map((row, i) => ({ row, id: `${topic}:${i}` }));
  return (ctx, level) => {
    const pool = items.filter((it) => it.row[0] === level);
    if (!pool.length) throw new Error(`No ${topic} items at level ${level}`);
    const fresh = pool.filter((it) => !ctx.used?.has(it.id));
    const it = pick(ctx.rng, fresh.length ? fresh : pool);
    const [, question, correct, wrong, ex] = it.row;
    const order = shuffle([0, 1, 2, 3], ctx.rng);
    const all = [correct, ...wrong];
    const fill = typeof question === 'string';
    const q = poolQ(topic, difficulty(level), {
      kind: 'text',
      passage: fill ? question : null,
      prompt: fill ? FILL : question,
      ex,
      mc: { choices: order.map((i) => all[i]), answer: order.indexOf(0) },
    });
    q.id = it.id;
    return q;
  };
}
