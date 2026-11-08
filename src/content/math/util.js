// Общие помощники для генераторов математических задач.

import { hashString, randomInt, shuffle } from '../../core/random.js';
import { num } from '../../core/format.js';
import { SKILLS } from '../skills.js';

export function nonZero(rng, min, max) {
  let value = 0;
  while (value === 0) value = randomInt(rng, min, max);
  return value;
}

/** Один шаг решения на трёх языках. */
export const st = (en, ru, kk) => ({ en, ru, kk });

/** Собирает шаги в объект { en: [...], ru: [...], kk: [...] }. */
export function steps(...items) {
  return {
    en: items.map((i) => i.en),
    ru: items.map((i) => i.ru),
    kk: items.map((i) => i.kk),
  };
}

/** Частые фразы решений. */
export const P = {
  sub: (n) => st(`Subtract ${n} from both sides`, `Вычтем ${n} из обеих частей`, `Екі жағынан да ${n} санын азайтамыз`),
  add: (n) => st(`Add ${n} to both sides`, `Прибавим ${n} к обеим частям`, `Екі жағына да ${n} санын қосамыз`),
  div: (n) => st(`Divide both sides by ${n}`, `Разделим обе части на ${n}`, `Екі жағын да ${n} санына бөлеміз`),
  mul: (n) => st(`Multiply both sides by ${n}`, `Умножим обе части на ${n}`, `Екі жағын да ${n} санына көбейтеміз`),
};

/** «Перенести константу b»: вычесть, если b > 0, иначе прибавить. */
export const moveConst = (b) => (b > 0 ? P.sub(num(b)) : P.add(num(-b)));

/** Склеивает фразу и формулу на каждом языке: phrase + ': ' + formula. */
export const say = (phrase, formula) =>
  st(`${phrase.en}: ${formula}.`, `${phrase.ru}: ${formula}.`, `${phrase.kk}: ${formula}.`);

/**
 * Варианты ответа: правильный + три неправильных (без повторов).
 * Если «ловушек» не хватает, добавляются соседние числа.
 */
export function makeMc(rng, correct, distractors, fmt = num) {
  const seen = new Set([fmt(correct)]);
  const wrong = [];
  for (const d of distractors) {
    if (wrong.length === 3) break;
    if (d === undefined || d === null || (typeof d === 'number' && !Number.isFinite(d))) continue;
    const key = fmt(d);
    if (!seen.has(key)) {
      seen.add(key);
      wrong.push(d);
    }
  }
  let step = 1;
  while (wrong.length < 3) {
    if (typeof correct !== 'number') throw new Error('Not enough distractors');
    for (const cand of [correct + step, correct - step]) {
      const key = fmt(cand);
      if (wrong.length < 3 && !seen.has(key)) {
        seen.add(key);
        wrong.push(cand);
      }
    }
    step += 1;
  }
  const all = [correct, ...wrong];
  const order = shuffle([0, 1, 2, 3], rng);
  return { choices: order.map((i) => fmt(all[i])), answer: order.indexOf(0) };
}

/**
 * Решает, будет ли задание с вариантами или с вводом ответа (как на SAT ~30% — с вводом).
 * ctx.mcOnly — только варианты (для «Блица»).
 */
export function choose(ctx, answer, distractors, { fmt = num, display, sprChance = 0.3 } = {}) {
  if (!ctx.mcOnly && ctx.rng() < sprChance) {
    return { spr: { value: answer, display: display ?? String(Math.round(answer * 1000) / 1000) } };
  }
  return { mc: makeMc(ctx.rng, answer, distractors, fmt) };
}

/** Собирает объект задания в общем формате. */
export function mathQ(skill, d, { prompt, ex, mc = null, spr = null, figure = null, table = null }) {
  const q = { section: 'math', domain: SKILLS[skill].domain, skill, d, prompt, ex, figure, table };
  if (spr) {
    q.type = 'spr';
    q.value = spr.value;
    q.display = spr.display;
  } else {
    q.type = 'mc';
    q.choices = mc.choices;
    q.answer = mc.answer;
  }
  q.id = `${skill}:${hashString(prompt + '|' + (q.choices ?? []).join('|'))}`;
  return q;
}
