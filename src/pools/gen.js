// Общие помощники для заданий на трёх языках (русский, казахский, английский).
// В отличие от SAT, где задания только на английском, здесь условие и решение
// показываются на языке интерфейса.

import { MINUS, fracHtml, fracText, simplify } from '../core/format.js';
import { hashString, shuffle } from '../core/random.js';

/** Текст на трёх языках. */
export const L = (en, ru, kk) => ({ en, ru, kk });
/** Один и тот же текст на всех языках (формулы, вычисления). */
export const same = (s) => ({ en: s, ru: s, kk: s });
/** Текст по шаблону: loc((l) => `${W.calc[l]}: 2 + 2`). */
export const loc = (fn) => ({ en: fn('en'), ru: fn('ru'), kk: fn('kk') });

export const textOf = (x, l = 'en') => (x !== null && typeof x === 'object' ? x[l] : String(x));

/** Число без запятых-разделителей, с типографским минусом. Большие числа - с тонким пробелом. */
export function n(x) {
  if (!Number.isFinite(x)) return String(x);
  const r = Math.round(x * 1e6) / 1e6;
  const [int, frac] = String(Math.abs(r)).split('.');
  const grouped = int.length > 4 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : int;
  return (r < 0 ? MINUS : '') + grouped + (frac ? `.${frac}` : '');
}

/** Десятичное число: точка в английском, запятая в русском и казахском. */
export function dec(x) {
  const s = n(x);
  const comma = s.replace('.', ',');
  return L(s, comma, comma);
}

/** Русское склонение после числа: plural(3, 'день', 'дня', 'дней') → «дня». */
export function plural(count, one, few, many) {
  const k = Math.abs(count) % 100;
  const k1 = k % 10;
  if (k > 10 && k < 20) return many;
  if (k1 === 1) return one;
  if (k1 >= 2 && k1 <= 4) return few;
  return many;
}

/** Число в скобках, если оно отрицательное. */
export const par = (x) => (x < 0 ? `(${n(x)})` : n(x));
/** « + 5» или « − 5» - для записи выражений. */
export const signed = (x) => `${x < 0 ? MINUS : '+'} ${n(Math.abs(x))}`;

/**
 * «Ловушка» с объяснением: why(12, L('…', '…', '…')). Если ученик выберет (или введёт) это значение,
 * под ответом появится «Почему не 12: …» - типичная ошибка, которая к нему приводит.
 */
export const why = (v, reason) => ({ __why: true, v, reason });
/** Значение варианта: у «ловушки» с объяснением - её v. */
export const val = (d) => (d && d.__why ? d.v : d);

/** Шаги решения → { en: [...], ru: [...], kk: [...] }. */
export function steps(...items) {
  const flat = items.filter(Boolean);
  return {
    en: flat.map((i) => textOf(i, 'en')),
    ru: flat.map((i) => textOf(i, 'ru')),
    kk: flat.map((i) => textOf(i, 'kk')),
  };
}

function shuffled(all, rng) {
  const order = shuffle([0, 1, 2, 3], rng);
  return { choices: order.map((i) => all[i]), answer: order.indexOf(0) };
}

/**
 * Варианты ответа: правильный + три неправильных без повторов.
 * fmt превращает значение в строку или в текст на трёх языках.
 * Если «ловушек» не хватает, для чисел добавляются соседние значения.
 */
export function mc(rng, correct, distractors, fmt = n) {
  const key = (x) => textOf(fmt(x));
  const seen = new Set([key(correct)]);
  const wrong = [];
  const reasons = new Map();
  for (const raw of distractors) {
    if (wrong.length === 3) break;
    const d = val(raw);
    if (d === undefined || d === null || (typeof d === 'number' && !Number.isFinite(d))) continue;
    const k = key(d);
    if (!seen.has(k)) {
      seen.add(k);
      wrong.push(d);
      if (raw?.__why) reasons.set(k, raw.reason);
    }
  }
  let step = 1;
  while (wrong.length < 3) {
    if (typeof correct !== 'number') throw new Error(`Not enough distractors for ${key(correct)}`);
    for (const cand of [correct + step, correct - step]) {
      const k = key(cand);
      if (wrong.length < 3 && !seen.has(k)) {
        seen.add(k);
        wrong.push(cand);
      }
    }
    step += 1;
  }
  return withWhys(shuffled([correct, ...wrong].map(fmt), rng), reasons);
}

/** Добавляет к вариантам объяснения «ловушек» (по тексту варианта). */
function withWhys(result, reasons) {
  if (reasons.size) result.whys = result.choices.map((c) => reasons.get(textOf(c)) ?? null);
  return result;
}

/** Варианты-дроби. Значения - пары [числитель, знаменатель]. */
export function mcFrac(rng, correct, distractors) {
  const norm = ([a, b]) => simplify(a, b);
  const key = (p) => norm(p).join('/');
  const seen = new Set([key(correct)]);
  const wrong = [];
  const reasons = new Map();
  const push = (raw) => {
    const p = val(raw);
    if (wrong.length === 3 || !p || !Number.isFinite(p[0]) || !Number.isFinite(p[1]) || p[1] === 0) return;
    const k = key(p);
    if (!seen.has(k)) {
      seen.add(k);
      wrong.push(p);
      if (raw?.__why) reasons.set(fracHtml(...p), raw.reason);
    }
  };
  distractors.forEach(push);
  const [a, b] = norm(correct);
  for (let step = 1; wrong.length < 3; step++) {
    push([a + step, b]);
    push([a, b + step]);
    push([Math.abs(a - step) || 1, b]);
  }
  return withWhys(
    shuffled(
      [correct, ...wrong].map(([x, y]) => fracHtml(x, y)),
      rng,
    ),
    reasons,
  );
}

/** Варианты-тексты (строки или тексты на трёх языках). Нужны ровно три неправильных. */
export function mcText(rng, correct, wrong) {
  const all = [correct, ...wrong];
  const keys = new Set(all.map((x) => textOf(x)));
  if (all.length !== 4 || keys.size !== 4) throw new Error(`Need 4 distinct choices: ${[...keys].join(' | ')}`);
  return shuffled(all, rng);
}

const plain = (x) => String(Math.round(x * 1000) / 1000);

/**
 * Тип задания: с вариантами или с вводом ответа (примерно 30% - с вводом).
 * ctx.mcOnly - только варианты (для быстрых режимов).
 */
/** «Ловушки» для ответа с вводом: если ученик введёт такое число, покажем, откуда оно берётся. */
function trapsOf(distractors, toNumber = (v) => v) {
  const traps = distractors.filter((d) => d?.__why).map((d) => ({ v: toNumber(d.v), why: d.reason }));
  return traps.filter((x) => Number.isFinite(x.v));
}

export function ask(ctx, answer, distractors, { fmt = n, display, spr = 0.3 } = {}) {
  if (!ctx.mcOnly && ctx.rng() < spr) return { spr: { value: answer, display: display ?? plain(answer), traps: trapsOf(distractors) } };
  return { mc: mc(ctx.rng, answer, distractors, fmt) };
}

/** То же для ответа-дроби [числитель, знаменатель]. */
export function askFrac(ctx, answer, distractors, { spr = 0.3 } = {}) {
  const [a, b] = simplify(answer[0], answer[1]);
  if (!ctx.mcOnly && ctx.rng() < spr) return { spr: { value: a / b, display: fracText(a, b), traps: trapsOf(distractors, ([x, y]) => x / y) } };
  return { mc: mcFrac(ctx.rng, [a, b], distractors) };
}

/** Собирает задание в общем формате. kind: 'math' (в условии можно HTML) или 'text' (обычный текст). */
export function poolQ(topic, d, { prompt, ex, mc: choices = null, spr = null, figure = null, table = null, passage = null, kind = 'math' }) {
  const q = { topic, skill: topic, section: kind === 'math' ? 'math' : 'rw', local: true, d, prompt, ex, figure, table };
  if (passage) q.passage = passage;
  if (spr) {
    q.type = 'spr';
    q.value = spr.value;
    q.display = spr.display;
    if (spr.traps?.length) q.traps = spr.traps;
  } else {
    q.type = 'mc';
    q.choices = choices.choices;
    q.answer = choices.answer;
    if (choices.whys) q.whys = choices.whys;
  }
  const body = [textOf(prompt), textOf(passage ?? ''), ...(q.choices ?? []).map((c) => textOf(c))].join('|');
  q.id = `${topic}:${hashString(body)}`;
  return q;
}

/** Частые слова в условиях. */
export const W = {
  calc: L('Calculate', 'Вычисли', 'Есепте'),
  solve: L('Solve the equation', 'Реши уравнение', 'Теңдеуді шеш'),
  simplify: L('Simplify', 'Упрости', 'Ықшамда'),
};
