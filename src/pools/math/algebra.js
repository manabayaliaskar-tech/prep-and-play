// Алгебра: линейные уравнения, выражения, степени и корни, квадратные уравнения,
// системы, неравенства, функции, прогрессии.

import { MINUS, linear, polyStr, terms } from '../../core/format.js';
import { pick, randomInt } from '../../core/random.js';
import { L, W, ask, askFrac, loc, mcText, n, par, poolQ, same, signed, steps } from '../gen.js';
import { frac } from './fractions.js';

const X = '<i>x</i>';
const Y = '<i>y</i>';
const TIMES = '×';
const DIV = '÷';
const calc = (expr) => loc((l) => `${W.calc[l]}: ${expr}`);
const solve = (eq) => loc((l) => `${W.solve[l]}: ${eq}`);
const system = (...lines) => `<span class="system">${lines.map((line) => `<span>${line}</span>`).join('')}</span>`;
const sq = (x) => `${x}<sup>2</sup>`;

function nonZero(rng, min, max) {
  let v = 0;
  while (v === 0) v = randomInt(rng, min, max);
  return v;
}

export function linearEq(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const x = nonZero(rng, -9, 12);
    const a = randomInt(rng, 2, 9);
    const b = nonZero(rng, -20, 20);
    const c = a * x + b;
    return poolQ('m.lineq', d, {
      prompt: solve(`${linear(a, b)} = ${n(c)}`),
      ex: steps(
        L('Move the number to the right side.', 'Перенесём число в правую часть.', 'Санды оң жаққа шығарамыз.'),
        same(`${a}${X} = ${n(c)} ${signed(-b)} = ${n(c - b)}`),
        same(`${X} = ${n(c - b)} ${DIV} ${a} = ${n(x)}`),
      ),
      ...ask(ctx, x, [(c + b) / a, c - b, -x, x + 2].filter(Number.isInteger)),
    });
  }
  if (d === 2) {
    const x = nonZero(rng, -8, 10);
    const c = randomInt(rng, 1, 6);
    const a = c + randomInt(rng, 1, 6);
    const b = nonZero(rng, -15, 15);
    const e = (a - c) * x + b;
    return poolQ('m.lineq', d, {
      prompt: solve(`${linear(a, b)} = ${linear(c, e)}`),
      ex: steps(
        L(
          `Move the terms with ${X} to the left and the numbers to the right.`,
          `Перенесём слагаемые с ${X} влево, а числа вправо.`,
          `${X} бар мүшелерді сол жаққа, сандарды оң жаққа шығарамыз.`,
        ),
        same(`${a}${X} ${MINUS} ${c === 1 ? '' : c}${X} = ${n(e)} ${signed(-b)}`),
        same(`${linear(a - c, 0)} = ${n(e - b)}`),
        a - c === 1 ? null : same(`${X} = ${n(e - b)} ${DIV} ${a - c} = ${n(x)}`),
      ),
      ...ask(ctx, x, [(e + b) / (a - c), (e - b) / (a + c), -x, x + 1].filter(Number.isInteger)),
    });
  }
  const x = nonZero(rng, -6, 9);
  const c = randomInt(rng, 2, 5);
  const a = c + randomInt(rng, 1, 4);
  const b = randomInt(rng, 1, 6);
  const e = randomInt(rng, 1, 6);
  const f = a * (x + b) - c * (x - e);
  return poolQ('m.lineq', d, {
    prompt: solve(`${a}(${X} + ${b}) ${MINUS} ${c}(${X} ${MINUS} ${e}) = ${n(f)}`),
    ex: steps(
      L(
        'Expand the brackets. Mind the sign before the second bracket.',
        'Раскроем скобки. Следи за знаком перед второй скобкой.',
        'Жақшаларды ашамыз. Екінші жақшаның алдындағы таңбаға назар аудар.',
      ),
      same(`${a}${X} + ${a * b} ${MINUS} ${c}${X} + ${c * e} = ${n(f)}`),
      same(`${linear(a - c, a * b + c * e)} = ${n(f)}`),
      same(`${linear(a - c, 0)} = ${n(f - a * b - c * e)}, ${X} = ${n(x)}`),
    ),
    ...ask(ctx, x, [(f - a * b + c * e) / (a - c), (f - a * b - c * e) / (a + c), -x, x - 1].filter(Number.isInteger)),
  });
}

export function expressions(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 2, 7);
    const b = randomInt(rng, 2, 7);
    const x = nonZero(rng, -5, 8);
    const y = nonZero(rng, -6, 6);
    const ans = a * x - b * y;
    const expr = terms([
      [a, 'x'],
      [-b, 'y'],
    ]);
    return poolQ('m.expr', d, {
      prompt: L(
        `Find the value of ${expr} when ${X} = ${n(x)} and ${Y} = ${n(y)}.`,
        `Найди значение выражения ${expr} при ${X} = ${n(x)}, ${Y} = ${n(y)}.`,
        `${X} = ${n(x)}, ${Y} = ${n(y)} болғанда ${expr} өрнегінің мәнін тап.`,
      ),
      ex: steps(
        L('Substitute the values.', 'Подставим значения.', 'Мәндерін орнына қоямыз.'),
        same(`${a} ${TIMES} ${par(x)} ${MINUS} ${b} ${TIMES} ${par(y)} = ${n(a * x)} ${MINUS} ${par(b * y)} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [a * x + b * y, a * y - b * x, -ans, ans + b].filter((v) => v !== ans)),
    });
  }
  if (d === 2) {
    const a = randomInt(rng, 2, 6);
    const c = randomInt(rng, 2, 6);
    const b = randomInt(rng, 1, 7);
    const e = randomInt(rng, 1, 7);
    const right = linear(a + c, a * b - c * e);
    return poolQ('m.expr', d, {
      prompt: loc((l) => `${W.simplify[l]}: ${a}(${X} + ${b}) + ${c}(${X} ${MINUS} ${e})`),
      ex: steps(
        L('Expand the brackets.', 'Раскроем скобки.', 'Жақшаларды ашамыз.'),
        same(`${a}${X} + ${a * b} + ${c}${X} ${MINUS} ${c * e}`),
        L('Combine like terms.', 'Приведём подобные слагаемые.', 'Ұқсас мүшелерді біріктіреміз.'),
        same(right),
      ),
      mc: mcText(ctx.rng, right, uniqueStrings(right, [
        linear(a + c, a * b + c * e),
        linear(a + c, b - e),
        linear(a * c, a * b - c * e),
        linear(a + c, a * b - c * e + 1),
        linear(a + c + 1, a * b - c * e),
      ])),
    });
  }
  if (rng() < 0.5) {
    const k = randomInt(rng, 3, 24);
    const base = pick(rng, [50, 100]);
    const a = base + k;
    const b = base - k;
    const ans = a * a - b * b;
    return poolQ('m.expr', d, {
      prompt: calc(`${sq(a)} ${MINUS} ${sq(b)}`),
      ex: steps(
        L('Use the difference of squares: a² − b² = (a − b)(a + b).', 'Применим формулу разности квадратов: a² − b² = (a − b)(a + b).', 'Квадраттар айырмасының формуласын қолданамыз: a² − b² = (a − b)(a + b).'),
        same(`(${a} ${MINUS} ${b})(${a} + ${b}) = ${a - b} ${TIMES} ${a + b} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [(a - b) ** 2, (a - b) * (a + b) + 100, ans / 2, ans + 2 * k * 10].filter((v) => v !== ans)),
    });
  }
  const s = pick(rng, [50, 100]);
  const a = randomInt(rng, 11, s - 11);
  const b = s - a;
  const ans = s * s;
  return poolQ('m.expr', d, {
    prompt: calc(`${sq(a)} + 2 ${TIMES} ${a} ${TIMES} ${b} + ${sq(b)}`),
    ex: steps(
      L('This is a perfect square: a² + 2ab + b² = (a + b)².', 'Это полный квадрат: a² + 2ab + b² = (a + b)².', 'Бұл толық квадрат: a² + 2ab + b² = (a + b)².'),
      same(`(${a} + ${b})<sup>2</sup> = ${sq(s)} = ${n(ans)}`),
    ),
    ...ask(ctx, ans, [a * a + b * b, 2 * a * b, ans + 2 * a * b, ans - 100].filter((v) => v !== ans)),
  });
}

/** Оставляет из кандидатов три строки, не совпадающие с правильной и между собой. */
function uniqueStrings(correct, candidates) {
  const out = [];
  for (const c of candidates) {
    if (c !== correct && !out.includes(c)) out.push(c);
    if (out.length === 3) break;
  }
  return out;
}

export function powers(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const [a, k] = pick(rng, [
      [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [3, 2], [3, 3], [3, 4], [4, 3], [5, 3], [6, 2], [7, 2], [10, 3], [10, 4], [5, 4], [9, 2],
    ]);
    const ans = a ** k;
    return poolQ('m.pow', d, {
      prompt: calc(`${a}<sup>${k}</sup>`),
      ex: steps(
        L(`A power is a product of equal factors: here there are ${k} of them.`, `Степень — это произведение одинаковых множителей: здесь их ${k}.`, `Дәреже — бірдей көбейткіштердің көбейтіндісі: мұнда олар ${k}.`),
        same(`${Array(k).fill(a).join(` ${TIMES} `)} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [a * k, a ** (k - 1), a ** (k + 1), ans + a]),
    });
  }
  if (d === 2) {
    const a = pick(rng, [2, 3, 5, 7]);
    const m = randomInt(rng, 3, 9);
    const k = randomInt(rng, 2, 8);
    if (rng() < 0.5) {
      const j = randomInt(rng, 1, m + k - 1);
      const ans = m + k - j;
      return poolQ('m.pow', d, {
        prompt: L(
          `Find ${X} if ${a}<sup>${m}</sup> ${TIMES} ${a}<sup>${k}</sup> ${DIV} ${a}<sup>${j}</sup> = ${a}<sup>${X}</sup>.`,
          `Найди ${X}, если ${a}<sup>${m}</sup> ${TIMES} ${a}<sup>${k}</sup> ${DIV} ${a}<sup>${j}</sup> = ${a}<sup>${X}</sup>.`,
          `${a}<sup>${m}</sup> ${TIMES} ${a}<sup>${k}</sup> ${DIV} ${a}<sup>${j}</sup> = ${a}<sup>${X}</sup> болса, ${X}-ті тап.`,
        ),
        ex: steps(
          L(
            'When multiplying powers with the same base, add the exponents; when dividing, subtract them.',
            'При умножении степеней с одинаковым основанием показатели складываются, при делении — вычитаются.',
            'Негіздері бірдей дәрежелерді көбейткенде көрсеткіштер қосылады, бөлгенде — азайтылады.',
          ),
          same(`${X} = ${m} + ${k} ${MINUS} ${j} = ${ans}`),
        ),
        ...ask(ctx, ans, [m * k - j, m + k + j, m * k, ans + 1].filter((v) => v !== ans)),
      });
    }
    const ans = m * k;
    return poolQ('m.pow', d, {
      prompt: L(
        `Find ${X} if (${a}<sup>${m}</sup>)<sup>${k}</sup> = ${a}<sup>${X}</sup>.`,
        `Найди ${X}, если (${a}<sup>${m}</sup>)<sup>${k}</sup> = ${a}<sup>${X}</sup>.`,
        `(${a}<sup>${m}</sup>)<sup>${k}</sup> = ${a}<sup>${X}</sup> болса, ${X}-ті тап.`,
      ),
      ex: steps(
        L('When a power is raised to a power, multiply the exponents.', 'При возведении степени в степень показатели перемножаются.', 'Дәрежені дәрежеге шығарғанда көрсеткіштер көбейтіледі.'),
        same(`${X} = ${m} ${TIMES} ${k} = ${ans}`),
      ),
      ...ask(ctx, ans, [m + k, m ** 2, ans + k, ans - m].filter((v) => v !== ans)),
    });
  }
  const kind = randomInt(rng, 0, 2);
  if (kind === 0) {
    const p = randomInt(rng, 2, 7);
    const k = pick(rng, [2, 3, 5, 6, 7]);
    const ans = p * k;
    return poolQ('m.pow', d, {
      prompt: calc(`√${p * p * k} ${TIMES} √${k}`),
      ex: steps(
        L('The product of roots is the root of the product.', 'Произведение корней равно корню из произведения.', 'Түбірлердің көбейтіндісі көбейтіндінің түбіріне тең.'),
        same(`√(${p * p * k} ${TIMES} ${k}) = √${p * p * k * k} = ${ans}`),
      ),
      ...ask(ctx, ans, [p * k * k, p * p * k, ans + k, p + k].filter((v) => v !== ans)),
    });
  }
  if (kind === 1) {
    const [base, root, k] = pick(rng, [
      [2, 3, 3], [3, 3, 3], [2, 4, 4], [3, 4, 4], [2, 5, 5], [4, 3, 3], [5, 3, 3], [10, 3, 3],
    ]);
    const j = k === 3 ? 2 : k === 4 ? 3 : randomInt(rng, 2, 3);
    const big = base ** root;
    const ans = base ** j;
    return poolQ('m.pow', d, {
      prompt: calc(`${big}<sup>${j}/${k}</sup>`),
      ex: steps(
        L(
          `${big} = ${base}<sup>${root}</sup>. A fractional exponent means: take the root, then raise to the power.`,
          `${big} = ${base}<sup>${root}</sup>. Дробный показатель означает: извлечь корень и возвести в степень.`,
          `${big} = ${base}<sup>${root}</sup>. Бөлшек көрсеткіш: түбір алып, сосын дәрежеге шығару дегенді білдіреді.`,
        ),
        same(`(${base}<sup>${root}</sup>)<sup>${j}/${k}</sup> = ${base}<sup>${j}</sup> = ${ans}`),
      ),
      ...ask(ctx, ans, [(big * j) / k, base * j, base ** (j + 1), base].filter((v) => v !== ans && Number.isInteger(v))),
    });
  }
  const a = pick(rng, [2, 3, 4, 5, 10]);
  const k = randomInt(rng, 1, a === 2 ? 5 : 3);
  return poolQ('m.pow', d, {
    prompt: calc(`${a}<sup>${MINUS}${k}</sup>`),
    ex: steps(
      L('A negative exponent means the reciprocal.', 'Отрицательный показатель означает обратное число.', 'Теріс көрсеткіш кері санды білдіреді.'),
      same(`${a}<sup>${MINUS}${k}</sup> = ${frac(1, `${a}<sup>${k}</sup>`)} = ${frac(1, a ** k)}`),
    ),
    ...askFrac(ctx, [1, a ** k], [
      [1, a * k + (a * k === a ** k ? 1 : 0)],
      [1, a ** (k + 1)],
      [k, a],
      [1, a ** k + a],
    ]),
  });
}

export function quadratics(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const k = randomInt(rng, 2, 13);
    if (rng() < 0.5) {
      return poolQ('m.quad', d, {
        prompt: L(
          `Find the positive root of the equation ${sq(X)} = ${k * k}.`,
          `Найди положительный корень уравнения ${sq(X)} = ${k * k}.`,
          `${sq(X)} = ${k * k} теңдеуінің оң түбірін тап.`,
        ),
        ex: steps(
          L(`The equation has two roots: ${X} = ±√${k * k}.`, `У уравнения два корня: ${X} = ±√${k * k}.`, `Теңдеудің екі түбірі бар: ${X} = ±√${k * k}.`),
          same(`√${k * k} = ${k}`),
        ),
        ...ask(ctx, k, [(k * k) / 2, k * k, k + 1, k - 1].filter((v) => v !== k && Number.isInteger(v))),
      });
    }
    return poolQ('m.quad', d, {
      prompt: L(
        `Find the non-zero root of the equation ${sq(X)} ${MINUS} ${k}${X} = 0.`,
        `Найди ненулевой корень уравнения ${sq(X)} ${MINUS} ${k}${X} = 0.`,
        `${sq(X)} ${MINUS} ${k}${X} = 0 теңдеуінің нөлге тең емес түбірін тап.`,
      ),
      ex: steps(
        L(`Factor out ${X}.`, `Вынесем ${X} за скобки.`, `${X}-ті жақша сыртына шығарамыз.`),
        same(`${X}(${X} ${MINUS} ${k}) = 0`),
        L(`So ${X} = 0 or ${X} = ${k}.`, `Значит, ${X} = 0 или ${X} = ${k}.`, `Демек, ${X} = 0 немесе ${X} = ${k}.`),
      ),
      ...ask(ctx, k, [-k, k * k, k + 1, 2 * k]),
    });
  }
  let r1 = nonZero(rng, -9, 9);
  let r2 = nonZero(rng, -9, 9);
  while (r1 === r2 || r1 === -r2) r2 = nonZero(rng, -9, 10);
  if (r1 > r2) [r1, r2] = [r2, r1];
  const b = -(r1 + r2);
  const c = r1 * r2;
  const eq = `${polyStr([1, b, c])} = 0`;
  if (d === 2) {
    const larger = rng() < 0.5;
    const ans = larger ? r2 : r1;
    return poolQ('m.quad', d, {
      prompt: larger
        ? L(`Find the larger root of the equation ${eq}.`, `Найди больший корень уравнения ${eq}.`, `${eq} теңдеуінің үлкен түбірін тап.`)
        : L(`Find the smaller root of the equation ${eq}.`, `Найди меньший корень уравнения ${eq}.`, `${eq} теңдеуінің кіші түбірін тап.`),
      ex: steps(
        L(
          `By Vieta's theorem the roots add up to ${n(-b)} and multiply to ${n(c)}.`,
          `По теореме Виета сумма корней равна ${n(-b)}, а произведение равно ${n(c)}.`,
          `Виет теоремасы бойынша түбірлердің қосындысы ${n(-b)}, көбейтіндісі ${n(c)}.`,
        ),
        L(`These numbers are ${n(r1)} and ${n(r2)}.`, `Это числа ${n(r1)} и ${n(r2)}.`, `Бұл сандар: ${n(r1)} және ${n(r2)}.`),
      ),
      ...ask(ctx, ans, [larger ? r1 : r2, -r1, -r2, c].filter((v) => v !== ans)),
    });
  }
  if (rng() < 0.5) {
    const ans = r1 * r1 + r2 * r2;
    return poolQ('m.quad', d, {
      prompt: L(
        `Find the sum of the squares of the roots of the equation ${eq}.`,
        `Найди сумму квадратов корней уравнения ${eq}.`,
        `${eq} теңдеуінің түбірлерінің квадраттарының қосындысын тап.`,
      ),
      ex: steps(
        L(
          `By Vieta's theorem: ${X}<sub>1</sub> + ${X}<sub>2</sub> = ${n(-b)}, ${X}<sub>1</sub>${X}<sub>2</sub> = ${n(c)}.`,
          `По теореме Виета: ${X}<sub>1</sub> + ${X}<sub>2</sub> = ${n(-b)}, ${X}<sub>1</sub>${X}<sub>2</sub> = ${n(c)}.`,
          `Виет теоремасы бойынша: ${X}<sub>1</sub> + ${X}<sub>2</sub> = ${n(-b)}, ${X}<sub>1</sub>${X}<sub>2</sub> = ${n(c)}.`,
        ),
        same(`${X}<sub>1</sub><sup>2</sup> + ${X}<sub>2</sub><sup>2</sup> = (${X}<sub>1</sub> + ${X}<sub>2</sub>)<sup>2</sup> ${MINUS} 2${X}<sub>1</sub>${X}<sub>2</sub>`),
        same(`${par(-b)}<sup>2</sup> ${MINUS} 2 ${TIMES} ${par(c)} = ${b * b} ${MINUS} ${par(2 * c)} = ${ans}`),
      ),
      ...ask(ctx, ans, [b * b, b * b + 2 * c, (r1 + r2) ** 2 - c, ans + 2].filter((v) => v !== ans)),
    });
  }
  const a = randomInt(rng, 2, 4);
  const disc = (a * b) ** 2 - 4 * a * (a * c);
  return poolQ('m.quad', d, {
    prompt: L(
      `Find the discriminant of the equation ${polyStr([a, a * b, a * c])} = 0.`,
      `Найди дискриминант уравнения ${polyStr([a, a * b, a * c])} = 0.`,
      `${polyStr([a, a * b, a * c])} = 0 теңдеуінің дискриминантын тап.`,
    ),
    ex: steps(
      same(`<i>D</i> = <i>b</i><sup>2</sup> ${MINUS} 4<i>ac</i>`),
      same(`<i>D</i> = ${par(a * b)}<sup>2</sup> ${MINUS} 4 ${TIMES} ${a} ${TIMES} ${par(a * c)} = ${(a * b) ** 2} ${MINUS} ${par(4 * a * a * c)} = ${n(disc)}`),
    ),
    ...ask(ctx, disc, [(a * b) ** 2 + 4 * a * a * c, (a * b) ** 2 - a * a * c, disc + 4, a * b - 4 * a * a * c].filter((v) => v !== disc)),
  });
}

export function systems(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const x = randomInt(rng, 3, 20);
    const y = randomInt(rng, 1, x - 1);
    const askX = rng() < 0.5;
    const ans = askX ? x : y;
    const name = askX ? X : Y;
    return poolQ('m.sys', d, {
      prompt: L(
        `Solve the system and find ${name}: ${system(`${X} + ${Y} = ${x + y}`, `${X} ${MINUS} ${Y} = ${x - y}`)}`,
        `Реши систему и найди ${name}: ${system(`${X} + ${Y} = ${x + y}`, `${X} ${MINUS} ${Y} = ${x - y}`)}`,
        `Жүйені шешіп, ${name}-ті тап: ${system(`${X} + ${Y} = ${x + y}`, `${X} ${MINUS} ${Y} = ${x - y}`)}`,
      ),
      ex: steps(
        L('Add the two equations.', 'Сложим два уравнения.', 'Екі теңдеуді қосамыз.'),
        same(`2${X} = ${2 * x}, ${X} = ${x}`),
        same(`${Y} = ${x + y} ${MINUS} ${x} = ${y}`),
      ),
      ...ask(ctx, ans, [askX ? y : x, x + y, x - y, ans + 1].filter((v) => v !== ans)),
    });
  }
  const x = nonZero(rng, -5, 7);
  const y = nonZero(rng, -5, 7);
  const lo = d === 2 ? 1 : 2;
  let a1;
  let b1;
  let a2;
  let b2;
  do {
    a1 = randomInt(rng, lo, 5);
    b1 = randomInt(rng, lo, 5);
    a2 = randomInt(rng, lo, 5);
    b2 = -randomInt(rng, lo, 5);
  } while (a1 * b2 - a2 * b1 === 0);
  const c1 = a1 * x + b1 * y;
  const c2 = a2 * x + b2 * y;
  const eq1 = `${terms([[a1, 'x'], [b1, 'y']])} = ${n(c1)}`;
  const eq2 = `${terms([[a2, 'x'], [b2, 'y']])} = ${n(c2)}`;
  const sys = system(eq1, eq2);
  const ans = d === 2 ? x + y : x * y;
  const what = d === 2 ? `${X} + ${Y}` : `${X}${Y}`;
  return poolQ('m.sys', d, {
    prompt: L(
      `Solve the system and find ${what}: ${sys}`,
      `Реши систему и найди ${what}: ${sys}`,
      `Жүйені шешіп, ${what} мәнін тап: ${sys}`,
    ),
    ex: steps(
      L(
        `Multiply the first equation by ${Math.abs(b2)} and the second by ${b1}, then add them to eliminate ${Y}.`,
        `Умножим первое уравнение на ${Math.abs(b2)}, второе на ${b1} и сложим — ${Y} исчезнет.`,
        `Бірінші теңдеуді ${Math.abs(b2)}-ге, екіншісін ${b1}-ге көбейтіп қосамыз — ${Y} жойылады.`,
      ),
      same(`${a1 * Math.abs(b2) + a2 * b1}${X} = ${n(c1 * Math.abs(b2) + c2 * b1)}, ${X} = ${n(x)}`),
      L(`Substitute into the first equation: ${Y} = ${n(y)}.`, `Подставим в первое уравнение: ${Y} = ${n(y)}.`, `Бірінші теңдеуге қоямыз: ${Y} = ${n(y)}.`),
      same(`${what} = ${n(ans)}`),
    ),
    ...ask(ctx, ans, [d === 2 ? x - y : x + y, d === 2 ? x * y : x - y, -ans, ans + 1, ans - 2].filter((v) => v !== ans)),
  });
}

export function inequalities(ctx, d) {
  const { rng } = ctx;
  if (d === 3) {
    const a = randomInt(rng, 2, 4);
    const b = nonZero(rng, -6, 8);
    const xLo = randomInt(rng, -4, 4);
    const count = randomInt(rng, 3, 8);
    const xHi = xLo + count;
    // xLo < x ≤ xHi  ⇔  a·xLo + b < a·x + b ≤ a·xHi + b
    const lo = a * xLo + b;
    const hi = a * xHi + b;
    return poolQ('m.ineq', d, {
      prompt: L(
        `How many integers ${X} satisfy ${n(lo)} &lt; ${linear(a, b)} ≤ ${n(hi)}?`,
        `Сколько целых чисел ${X} удовлетворяют неравенству ${n(lo)} &lt; ${linear(a, b)} ≤ ${n(hi)}?`,
        `${n(lo)} &lt; ${linear(a, b)} ≤ ${n(hi)} теңсіздігін неше бүтін ${X} саны қанағаттандырады?`,
      ),
      ex: steps(
        L(`Subtract ${n(b)} from all three parts.`, `Вычтем ${n(b)} из всех трёх частей.`, `Үш бөліктен де ${n(b)} санын азайтамыз.`),
        same(`${n(lo - b)} &lt; ${a}${X} ≤ ${n(hi - b)}`),
        L(`Divide by ${a}: ${n(xLo)} &lt; ${X} ≤ ${n(xHi)}.`, `Разделим на ${a}: ${n(xLo)} &lt; ${X} ≤ ${n(xHi)}.`, `${a}-ге бөлеміз: ${n(xLo)} &lt; ${X} ≤ ${n(xHi)}.`),
        L(
          `The integers from ${n(xLo + 1)} to ${n(xHi)}: there are ${count} of them.`,
          `Целые числа от ${n(xLo + 1)} до ${n(xHi)}: их ${count}.`,
          `${n(xLo + 1)}-ден ${n(xHi)}-ге дейінгі бүтін сандар: олар ${count}.`,
        ),
      ),
      ...ask(ctx, count, [count + 1, count - 1, hi - lo, count + 2]),
    });
  }
  const k = nonZero(rng, -7, 9);
  const a = randomInt(rng, 2, 7);
  const b = nonZero(rng, -12, 12);
  const neg = d === 2;
  const coef = neg ? -a : a;
  const c = coef * k + b;
  const sign = rng() < 0.5 ? '&gt;' : '&lt;';
  const flip = (s) => (s === '&gt;' ? '&lt;' : '&gt;');
  const resSign = neg ? flip(sign) : sign;
  const correct = `${X} ${resSign} ${n(k)}`;
  const wrong = uniqueStrings(correct, [
    `${X} ${flip(resSign)} ${n(k)}`,
    `${X} ${resSign} ${n(-k)}`,
    `${X} ${flip(resSign)} ${n(-k)}`,
    `${X} ${resSign} ${n(k + 1)}`,
  ]);
  return poolQ('m.ineq', d, {
    prompt: L(
      `Solve the inequality: ${linear(coef, b)} ${sign} ${n(c)}`,
      `Реши неравенство: ${linear(coef, b)} ${sign} ${n(c)}`,
      `Теңсіздікті шеш: ${linear(coef, b)} ${sign} ${n(c)}`,
    ),
    ex: steps(
      L('Move the number to the right side.', 'Перенесём число в правую часть.', 'Санды оң жаққа шығарамыз.'),
      same(`${linear(coef, 0)} ${sign} ${n(c - b)}`),
      neg
        ? L(
            `Divide by ${n(coef)}. Dividing by a negative number reverses the sign: ${correct}.`,
            `Разделим на ${n(coef)}. При делении на отрицательное число знак неравенства меняется: ${correct}.`,
            `${n(coef)}-ге бөлеміз. Теріс санға бөлгенде теңсіздік таңбасы өзгереді: ${correct}.`,
          )
        : L(`Divide by ${a}: ${correct}.`, `Разделим на ${a}: ${correct}.`, `${a}-ге бөлеміз: ${correct}.`),
    ),
    mc: mcText(ctx.rng, correct, wrong),
  });
}

export function functions(ctx, d) {
  const { rng } = ctx;
  const F = '<i>f</i>';
  if (d === 1) {
    const a = nonZero(rng, -5, 6);
    const b = nonZero(rng, -9, 9);
    const k = nonZero(rng, -5, 6);
    const ans = a * k + b;
    return poolQ('m.func', d, {
      prompt: L(
        `The function is ${F}(${X}) = ${linear(a, b)}. Find ${F}(${n(k)}).`,
        `Дана функция ${F}(${X}) = ${linear(a, b)}. Найди ${F}(${n(k)}).`,
        `${F}(${X}) = ${linear(a, b)} функциясы берілген. ${F}(${n(k)}) мәнін тап.`,
      ),
      ex: steps(
        L(`Substitute ${X} = ${n(k)}.`, `Подставим ${X} = ${n(k)}.`, `${X} = ${n(k)} мәнін қоямыз.`),
        same(`${F}(${n(k)}) = ${n(a)} ${TIMES} ${par(k)} ${signed(b)} = ${n(a * k)} ${signed(b)} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [a * k - b, a + k + b, -ans, a * (k + b)].filter((v) => v !== ans)),
    });
  }
  if (d === 2) {
    const k = nonZero(rng, -4, 5);
    const b = randomInt(rng, -8, 8);
    const x1 = randomInt(rng, -3, 2);
    const x2 = x1 + randomInt(rng, 1, 4);
    const y1 = k * x1 + b;
    const y2 = k * x2 + b;
    return poolQ('m.func', d, {
      prompt: L(
        `A line passes through the points (${n(x1)}; ${n(y1)}) and (${n(x2)}; ${n(y2)}). Find its slope.`,
        `Прямая проходит через точки (${n(x1)}; ${n(y1)}) и (${n(x2)}; ${n(y2)}). Найди её угловой коэффициент.`,
        `Түзу (${n(x1)}; ${n(y1)}) және (${n(x2)}; ${n(y2)}) нүктелері арқылы өтеді. Оның бұрыштық коэффициентін тап.`,
      ),
      ex: steps(
        L('Slope = change in y divided by change in x.', 'Угловой коэффициент = изменение y, делённое на изменение x.', 'Бұрыштық коэффициент = y өзгерісі бөлінген x өзгерісі.'),
        same(`<i>k</i> = ${frac(`${n(y2)} ${MINUS} ${par(y1)}`, `${n(x2)} ${MINUS} ${par(x1)}`)} = ${frac(n(y2 - y1), n(x2 - x1))} = ${n(k)}`),
      ),
      ...ask(ctx, k, [-k, y2 - y1, x2 - x1, k + 1, b].filter((v) => v !== k)),
    });
  }
  const h = nonZero(rng, -5, 6);
  const m = randomInt(rng, -9, 9);
  // y = (x − h)² + m = x² − 2h·x + h² + m
  const poly = polyStr([1, -2 * h, h * h + m]);
  return poolQ('m.func', d, {
    prompt: L(
      `Find the least value of the function ${Y} = ${poly}.`,
      `Найди наименьшее значение функции ${Y} = ${poly}.`,
      `${Y} = ${poly} функциясының ең кіші мәнін тап.`,
    ),
    ex: steps(
      L(
        `The vertex of the parabola: ${X}<sub>0</sub> = ${MINUS}<i>b</i> / (2<i>a</i>) = ${n(h)}.`,
        `Вершина параболы: ${X}<sub>0</sub> = ${MINUS}<i>b</i> / (2<i>a</i>) = ${n(h)}.`,
        `Параболаның төбесі: ${X}<sub>0</sub> = ${MINUS}<i>b</i> / (2<i>a</i>) = ${n(h)}.`,
      ),
      same(`${Y}(${n(h)}) = ${par(h)}<sup>2</sup> ${MINUS} ${par(2 * h)} ${TIMES} ${par(h)} ${signed(h * h + m)} = ${n(m)}`),
    ),
    ...ask(ctx, m, [h * h + m, h, -m, m - h * h, m + 1].filter((v) => v !== m)),
  });
}

export function progressions(ctx, d) {
  const { rng } = ctx;
  const A = (i) => `<i>a</i><sub>${i}</sub>`;
  const B = (i) => `<i>b</i><sub>${i}</sub>`;
  if (d === 1) {
    const a1 = randomInt(rng, -10, 15);
    const diff = nonZero(rng, -6, 9);
    const k = randomInt(rng, 6, 20);
    const ans = a1 + (k - 1) * diff;
    return poolQ('m.prog', d, {
      prompt: L(
        `In an arithmetic progression ${A(1)} = ${n(a1)} and the common difference is ${n(diff)}. Find ${A(k)}.`,
        `В арифметической прогрессии ${A(1)} = ${n(a1)}, разность равна ${n(diff)}. Найди ${A(k)}.`,
        `Арифметикалық прогрессияда ${A(1)} = ${n(a1)}, айырмасы ${n(diff)}. ${A(k)} мүшесін тап.`,
      ),
      ex: steps(
        same(`${A('<i>n</i>')} = ${A(1)} + (<i>n</i> ${MINUS} 1)<i>d</i>`),
        same(`${A(k)} = ${n(a1)} + ${k - 1} ${TIMES} ${par(diff)} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [a1 + k * diff, a1 + (k - 2) * diff, a1 * k + diff, ans + 1].filter((v) => v !== ans)),
    });
  }
  if (d === 2) {
    const a1 = randomInt(rng, -5, 12);
    const diff = randomInt(rng, 1, 7);
    const k = randomInt(rng, 5, 20);
    const last = a1 + (k - 1) * diff;
    const ans = ((a1 + last) * k) / 2;
    return poolQ('m.prog', d, {
      prompt: L(
        `In an arithmetic progression ${A(1)} = ${n(a1)} and the common difference is ${diff}. Find the sum of the first ${k} terms.`,
        `В арифметической прогрессии ${A(1)} = ${n(a1)}, разность равна ${diff}. Найди сумму первых ${k} членов.`,
        `Арифметикалық прогрессияда ${A(1)} = ${n(a1)}, айырмасы ${diff}. Алғашқы ${k} мүшесінің қосындысын тап.`,
      ),
      ex: steps(
        same(`${A(k)} = ${n(a1)} + ${k - 1} ${TIMES} ${diff} = ${n(last)}`),
        same(`<i>S</i><sub>${k}</sub> = ${frac(`${A(1)} + ${A(k)}`, 2)} ${TIMES} ${k} = ${frac(`${n(a1)} + ${par(last)}`, 2)} ${TIMES} ${k} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [(a1 + last) * k, ans + last, last, ans - a1].filter((v) => v !== ans && Number.isInteger(v))),
    });
  }
  const b1 = randomInt(rng, 1, 5);
  const q = pick(rng, [2, 3, -2]);
  if (rng() < 0.5) {
    const k = randomInt(rng, 4, 6);
    const ans = b1 * q ** (k - 1);
    return poolQ('m.prog', d, {
      prompt: L(
        `In a geometric progression ${B(1)} = ${b1} and the common ratio is ${n(q)}. Find ${B(k)}.`,
        `В геометрической прогрессии ${B(1)} = ${b1}, знаменатель равен ${n(q)}. Найди ${B(k)}.`,
        `Геометриялық прогрессияда ${B(1)} = ${b1}, еселігі ${n(q)}. ${B(k)} мүшесін тап.`,
      ),
      ex: steps(
        same(`${B('<i>n</i>')} = ${B(1)} ${TIMES} <i>q</i><sup><i>n</i> ${MINUS} 1</sup>`),
        same(`${B(k)} = ${b1} ${TIMES} ${par(q)}<sup>${k - 1}</sup> = ${b1} ${TIMES} ${par(q ** (k - 1))} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [b1 * q ** k, b1 * q * (k - 1), -ans, b1 * q ** (k - 2)].filter((v) => v !== ans)),
    });
  }
  const k = randomInt(rng, 4, 6);
  const qq = Math.abs(q);
  const ans = (b1 * (qq ** k - 1)) / (qq - 1);
  return poolQ('m.prog', d, {
    prompt: L(
      `In a geometric progression ${B(1)} = ${b1} and the common ratio is ${qq}. Find the sum of the first ${k} terms.`,
      `В геометрической прогрессии ${B(1)} = ${b1}, знаменатель равен ${qq}. Найди сумму первых ${k} членов.`,
      `Геометриялық прогрессияда ${B(1)} = ${b1}, еселігі ${qq}. Алғашқы ${k} мүшесінің қосындысын тап.`,
    ),
    ex: steps(
      same(`<i>S</i><sub><i>n</i></sub> = ${frac(`${B(1)}(<i>q</i><sup><i>n</i></sup> ${MINUS} 1)`, `<i>q</i> ${MINUS} 1`)}`),
      same(`<i>S</i><sub>${k}</sub> = ${frac(`${b1} ${TIMES} (${qq}<sup>${k}</sup> ${MINUS} 1)`, `${qq} ${MINUS} 1`)} = ${frac(`${b1} ${TIMES} ${qq ** k - 1}`, qq - 1)} = ${n(ans)}`),
    ),
    ...ask(ctx, ans, [b1 * qq ** k, b1 * qq ** (k - 1), ans + b1, ans - 1].filter((v) => v !== ans)),
  });
}

