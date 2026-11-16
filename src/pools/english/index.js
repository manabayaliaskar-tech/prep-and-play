// Задания по английскому из банка: предложение с пропуском и четыре варианта.
// Уровень задаётся числом от 1 (A1) до 6 (C2).

import { pick } from '../../core/random.js';
import { L, mcText, poolQ } from '../gen.js';
import { BANK } from './bank.js';
import { RULES } from './rules.js';

export const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const PROMPT = L(
  'Choose the option that completes the sentence correctly.',
  'Выбери вариант, который правильно дополняет предложение.',
  'Сөйлемді дұрыс толықтыратын нұсқаны таңда.',
);

function explain(item) {
  const [, , correct, , ref] = item;
  if (Array.isArray(ref)) {
    return L(
      `Correct: "${correct}". It is the only option that fits the meaning and grammar of the sentence.`,
      `Правильно: «${correct}» — ${ref[0]}.`,
      `Дұрысы: «${correct}» — ${ref[1]}.`,
    );
  }
  const rule = RULES[ref];
  return L(`Correct: "${correct}". ${rule.en}`, `Правильно: «${correct}». ${rule.ru}`, `Дұрысы: «${correct}». ${rule.kk}`);
}

/** Генератор для одной темы: (ctx, уровень) → задание. Старается не повторять задания внутри сессии. */
export function englishMaker(topic) {
  const items = BANK[topic].map((row, i) => ({ row, id: `${topic}:${i}` }));
  return (ctx, level) => {
    const pool = items.filter((it) => it.row[0] === level);
    if (!pool.length) throw new Error(`No ${topic} items at level ${level}`);
    const fresh = pool.filter((it) => !ctx.used?.has(it.id));
    const it = pick(ctx.rng, fresh.length ? fresh : pool);
    const [, sentence, correct, wrong] = it.row;
    const q = poolQ(topic, Math.ceil(level / 2), {
      kind: 'text',
      passage: sentence,
      prompt: PROMPT,
      ex: explain(it.row),
      mc: mcText(ctx.rng, correct, wrong),
    });
    q.id = it.id;
    q.level = CEFR[level - 1];
    return q;
  };
}

/**
 * Темы уровня: банк (где на уровне есть хотя бы два задания) и генераторы — слова, времена,
 * неправильные глаголы (A1–C1) и степени сравнения (A1–B1).
 */
export function englishSpec(levels) {
  const spec = [];
  for (const topic of Object.keys(BANK)) {
    const keys = levels.filter((level) => BANK[topic].filter((row) => row[0] === level).length >= 2);
    if (keys.length) spec.push([topic, keys]);
  }
  spec.push(['e.words', levels], ['e.gram', levels]);
  const irreg = levels.filter((l) => l <= 5);
  if (irreg.length) spec.push(['e.irreg', irreg]);
  const comp = levels.filter((l) => l <= 3);
  if (comp.length) spec.push(['e.comp', comp]);
  return spec;
}

/** Генераторы английского (их нет в банке BANK). */
export const ENGLISH_GENERATED = ['e.words', 'e.gram', 'e.irreg', 'e.comp'];

export const ENGLISH_COUNT = Object.values(BANK).reduce((sum, rows) => sum + rows.length, 0);
