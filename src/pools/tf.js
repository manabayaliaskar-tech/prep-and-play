// Задания «верно / неверно»: утверждение строится из пары «понятие - ответ» (верной или подменённой).
import { L, poolQ } from './gen.js';

export const TRUE_CHOICE = L('True', 'Верно', 'Дұрыс');
export const FALSE_CHOICE = L('False', 'Неверно', 'Қате');

/** ok - утверждение верное; id - постоянный номер задания (по паре и значению ok). */
export function tfQ(ctx, topic, d, { prompt, ok, ex, id }) {
  const choices = ctx.rng() < 0.5 ? [TRUE_CHOICE, FALSE_CHOICE] : [FALSE_CHOICE, TRUE_CHOICE];
  const q = poolQ(topic, d, { kind: 'text', prompt, ex, mc: { choices, answer: choices.indexOf(ok ? TRUE_CHOICE : FALSE_CHOICE) } });
  q.id = id;
  return q;
}

/** Вопрос «верна ли пара». a, b - тексты L(en, ru, kk). */
export const pairPrompt = (a, b) =>
  L(`Is this pair correct: "${a.en}" - "${b.en}"?`, `Верна ли пара: «${a.ru}» - «${b.ru}»?`, `Бұл жұп дұрыс па: «${a.kk}» - «${b.kk}»?`);
