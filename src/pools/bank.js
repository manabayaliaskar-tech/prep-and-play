// Банк заданий с выбором ответа для предметов, где важны знания: история, биология, география и другие.
// Запись: [сложность, вопрос, правильный ответ, [три неправильных], разбор].
// Тексты - на трёх языках (T) либо только на языке экзамена (R).

import { pick } from '../core/random.js';
import { oldestOf } from '../core/seen.js';
import { L, mcText, poolQ } from './gen.js';

/** Текст на трёх языках в порядке: русский, казахский, английский. */
export const T = (ru, kk, en) => L(en, ru, kk);
/** Текст только на языке экзамена: показывается одинаково при любом языке интерфейса. */
export const R = (text) => L(text, text, text);

/**
 * Генератор для банка: (ctx, ключ) → задание. Ключ 0 - любая сложность, 1…3 - только заданная.
 * Внутри одной сессии задания не повторяются, пока банк не закончится.
 */
export function bankMaker(topic, rows, opts = {}) {
  const items = rows.map((row, i) => ({ row, id: `${topic}:${i}`, i }));
  const TRUE = L('True', 'Верно', 'Дұрыс');
  const FALSE = L('False', 'Неверно', 'Қате');
  const pickLang = (x, l) => (typeof x === 'string' ? x : x[l]);
  const say = (q, a) => L(
    `${pickLang(q, 'en')} Proposed answer: "${pickLang(a, 'en')}". Is it correct?`,
    `${pickLang(q, 'ru')} Предложенный ответ: «${pickLang(a, 'ru')}». Верно ли это?`,
    `${pickLang(q, 'kk')} Ұсынылған жауап: «${pickLang(a, 'kk')}». Бұл дұрыс па?`,
  );
  return (ctx, key = 0) => {
    const byKey = key ? items.filter((it) => it.row[0] === key) : items;
    const pool = byKey.length ? byKey : items;
    // Варианты одного вопроса: обычный (с весом 3), «верно» и три «неверно».
    const variants = opts.tf ? pool.flatMap((it) => [[it, 'base'], [it, 'base'], [it, 'base'], [it, 't'], [it, 0], [it, 1], [it, 2]]) : pool.map((it) => [it, 'base']);
    const idOf = ([it, v]) => (v === 'base' ? it.id : `${it.id}:${v === 't' ? 't' : `f${v}`}`);
    // Сначала - факты, которых ещё не было ни в каком виде (обычный вопрос чаще, «верно ли» реже).
    // Повтор того же факта в другом виде - только когда новые факты в теме закончились.
    const seenItem = (it) => ctx.used?.has(it.id) || (opts.tf && [it.id + ':t', it.id + ':f0', it.id + ':f1', it.id + ':f2'].some((id) => ctx.used?.has(id)));
    const freshItems = variants.filter(([it]) => !seenItem(it));
    const freshVariants = variants.filter((x) => !ctx.used?.has(idOf(x)));
    const [it, v] = pick(ctx.rng, freshItems.length ? freshItems : freshVariants.length ? freshVariants : oldestOf(variants, idOf));
    const [d, question, correct, wrong, ex] = it.row;
    if (v === 'base') {
      const q = poolQ(topic, d, { kind: 'text', prompt: question, ex, mc: mcText(ctx.rng, correct, wrong) });
      q.id = it.id;
      return q;
    }
    const ok = v === 't';
    const shown = ok ? correct : wrong[v];
    const choices = ctx.rng() < 0.5 ? [TRUE, FALSE] : [FALSE, TRUE];
    const why = ok
      ? ex
      : L(
          `Correct answer: ${pickLang(correct, 'en')}. ${pickLang(ex, 'en')}`,
          `Правильный ответ: ${pickLang(correct, 'ru')}. ${pickLang(ex, 'ru')}`,
          `Дұрыс жауап: ${pickLang(correct, 'kk')}. ${pickLang(ex, 'kk')}`,
        );
    const q = poolQ(topic, d, { kind: 'text', prompt: say(question, shown), ex: why, mc: { choices, answer: choices.indexOf(ok ? TRUE : FALSE) } });
    q.id = idOf([it, v]);
    return q;
  };
}
