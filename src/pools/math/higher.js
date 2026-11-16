// Математика после школы (уровни 11+): пределы, интегралы, комплексные числа, векторы, матрицы.

import { MINUS, polyStr } from '../../core/format.js';
import { pick, randomInt, shuffle } from '../../core/random.js';
import { L, ask, n, par, poolQ, same, signed, steps } from '../gen.js';
import { frac } from './fractions.js';

const X = '<i>x</i>';
const TIMES = '×';
const nz = (rng, lo, hi) => {
  let v = 0;
  while (v === 0) v = randomInt(rng, lo, hi);
  return v;
};

export function limits(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = nz(rng, -5, 5);
    const b = randomInt(rng, -9, 9);
    const c = nz(rng, -4, 4);
    const ans = a * c + b;
    return poolQ('m.limit', d, {
      prompt: L(
        `Find the limit: lim<sub>${X}→${n(c)}</sub> (${polyStr([a, b])})`,
        `Найди предел: lim<sub>${X}→${n(c)}</sub> (${polyStr([a, b])})`,
        `Шекті тап: lim<sub>${X}→${n(c)}</sub> (${polyStr([a, b])})`,
      ),
      ex: steps(
        L('The function is continuous, so substitute the value.', 'Функция непрерывна, поэтому просто подставим значение.', 'Функция үзіліссіз, сондықтан мәнді орнына қоямыз.'),
        same(`${n(a)} ${TIMES} ${par(c)} ${signed(b)} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [a + b, a * c - b, -ans, ans + 1].filter((v) => v !== ans)),
    });
  }
  if (d === 2) {
    const c = nz(rng, -6, 6);
    const ans = 2 * c;
    return poolQ('m.limit', d, {
      prompt: L(
        `Find the limit: lim<sub>${X}→${n(c)}</sub> ${frac(`${X}<sup>2</sup> ${MINUS} ${c * c}`, `${X} ${signed(-c)}`)}`,
        `Найди предел: lim<sub>${X}→${n(c)}</sub> ${frac(`${X}<sup>2</sup> ${MINUS} ${c * c}`, `${X} ${signed(-c)}`)}`,
        `Шекті тап: lim<sub>${X}→${n(c)}</sub> ${frac(`${X}<sup>2</sup> ${MINUS} ${c * c}`, `${X} ${signed(-c)}`)}`,
      ),
      ex: steps(
        L('Direct substitution gives 0/0. Factor the numerator.', 'Подстановка даёт 0/0. Разложим числитель на множители.', 'Тікелей қою 0/0 береді. Алымын көбейткіштерге жіктейміз.'),
        same(`${frac(`(${X} ${signed(-c)})(${X} ${signed(c)})`, `${X} ${signed(-c)}`)} = ${X} ${signed(c)}`),
        same(`${n(c)} ${signed(c)} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [c, 0, c * c, -ans].filter((v) => v !== ans)),
    });
  }
  const a = randomInt(rng, 2, 9);
  const b = randomInt(rng, 2, 9);
  const p = randomInt(rng, 1, 9);
  const q = randomInt(rng, 1, 9);
  const g = gcd(a, b);
  return poolQ('m.limit', d, {
    prompt: L(
      `Find the limit: lim<sub>${X}→∞</sub> ${frac(`${a}${X}<sup>2</sup> + ${p}`, `${b}${X}<sup>2</sup> + ${q}${X}`)}`,
      `Найди предел: lim<sub>${X}→∞</sub> ${frac(`${a}${X}<sup>2</sup> + ${p}`, `${b}${X}<sup>2</sup> + ${q}${X}`)}`,
      `Шекті тап: lim<sub>${X}→∞</sub> ${frac(`${a}${X}<sup>2</sup> + ${p}`, `${b}${X}<sup>2</sup> + ${q}${X}`)}`,
    ),
    ex: steps(
      L(`Divide the numerator and denominator by ${X}<sup>2</sup>; the other terms tend to 0.`, `Разделим числитель и знаменатель на ${X}<sup>2</sup>: остальные слагаемые стремятся к 0.`, `Алым мен бөлімді ${X}<sup>2</sup>-қа бөлеміз: қалған қосылғыштар 0-ге ұмтылады.`),
      same(`${frac(a, b)}${g > 1 ? ` = ${frac(a / g, b / g)}` : ''}`),
    ),
    ...askFracLike(ctx, a, b, [[p, q], [b, a], [a + p, b + q], [a, b + q]]),
  });
}

function gcd(a, b) {
  return b ? gcd(b, a % b) : Math.abs(a);
}

/** Ответ-дробь: при вводе засчитывается и дробь, и десятичная запись. */
function askFracLike(ctx, a, b, wrong) {
  const g = gcd(a, b);
  const [x, y] = [a / g, b / g];
  if (!ctx.mcOnly && ctx.rng() < 0.3) return { spr: { value: x / y, display: y === 1 ? String(x) : `${x}/${y}` } };
  const seen = new Set([`${x}/${y}`]);
  const options = [[x, y]];
  for (const [p, q] of wrong) {
    const h = gcd(p, q);
    const key = `${p / h}/${q / h}`;
    if (!seen.has(key) && options.length < 4) {
      seen.add(key);
      options.push([p / h, q / h]);
    }
  }
  for (let k = 1; options.length < 4; k++) {
    const key = `${x + k}/${y}`;
    if (!seen.has(key)) {
      seen.add(key);
      options.push([x + k, y]);
    }
  }
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const show = ([p, q]) => (q === 1 ? n(p) : frac(p, q));
  return { mc: { choices: order.map((i) => show(options[i])), answer: order.indexOf(0) } };
}

export function integrals(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const k = randomInt(rng, 2, 6);
    const c = randomInt(rng, 1, 5);
    // ∫ k·x^(k−1) dx = x^k
    return poolQ('m.integral', d, {
      prompt: L(
        `Find the antiderivative coefficient: ∫ ${c * k}${X}<sup>${k - 1}</sup> d${X} = <i>a</i>${X}<sup>${k}</sup> + C. Find <i>a</i>.`,
        `Найди коэффициент первообразной: ∫ ${c * k}${X}<sup>${k - 1}</sup> d${X} = <i>a</i>${X}<sup>${k}</sup> + C. Найди <i>a</i>.`,
        `Алғашқы функцияның коэффициентін тап: ∫ ${c * k}${X}<sup>${k - 1}</sup> d${X} = <i>a</i>${X}<sup>${k}</sup> + C. <i>a</i>-ны тап.`,
      ),
      ex: steps(
        same(`∫ ${X}<sup><i>n</i></sup> d${X} = ${frac(`${X}<sup><i>n</i>+1</sup>`, '<i>n</i> + 1')} + C`),
        same(`∫ ${c * k}${X}<sup>${k - 1}</sup> d${X} = ${frac(c * k, k)}${X}<sup>${k}</sup> + C = ${c}${X}<sup>${k}</sup> + C`),
      ),
      ...ask(ctx, c, [c * k, c * (k - 1), k, c + 1].filter((v) => v !== c)),
    });
  }
  const a = randomInt(rng, 0, 2);
  const b = a + randomInt(rng, 1, 3);
  if (d === 2) {
    const m = 2 * randomInt(rng, 1, 4);
    const ans = (m / 2) * (b * b - a * a);
    return poolQ('m.integral', d, {
      prompt: L(
        `Calculate: ∫<sub>${a}</sub><sup>${b}</sup> ${m}${X} d${X}`,
        `Вычисли: ∫<sub>${a}</sub><sup>${b}</sup> ${m}${X} d${X}`,
        `Есепте: ∫<sub>${a}</sub><sup>${b}</sup> ${m}${X} d${X}`,
      ),
      ex: steps(
        L(`The antiderivative of ${m}${X} is ${m / 2}${X}<sup>2</sup>.`, `Первообразная для ${m}${X} — это ${m / 2}${X}<sup>2</sup>.`, `${m}${X} үшін алғашқы функция — ${m / 2}${X}<sup>2</sup>.`),
        same(`${m / 2} ${TIMES} ${b}<sup>2</sup> ${MINUS} ${m / 2} ${TIMES} ${a}<sup>2</sup> = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [m * (b - a), m * b * b, ans + m, (m * (b + a)) / 2].filter((v) => v !== ans)),
    });
  }
  const ans = b ** 3 - a ** 3 + (b - a);
  return poolQ('m.integral', d, {
    prompt: L(
      `Calculate: ∫<sub>${a}</sub><sup>${b}</sup> (3${X}<sup>2</sup> + 1) d${X}`,
      `Вычисли: ∫<sub>${a}</sub><sup>${b}</sup> (3${X}<sup>2</sup> + 1) d${X}`,
      `Есепте: ∫<sub>${a}</sub><sup>${b}</sup> (3${X}<sup>2</sup> + 1) d${X}`,
    ),
    ex: steps(
      L(`The antiderivative is ${X}<sup>3</sup> + ${X}.`, `Первообразная: ${X}<sup>3</sup> + ${X}.`, `Алғашқы функция: ${X}<sup>3</sup> + ${X}.`),
      same(`(${b}<sup>3</sup> + ${b}) ${MINUS} (${a}<sup>3</sup> + ${a}) = ${b ** 3 + b} ${MINUS} ${a ** 3 + a} = ${n(ans)}`),
    ),
    ...ask(ctx, ans, [b ** 3 - a ** 3, 3 * (b * b - a * a) + 1, ans + 1, b ** 3 + b].filter((v) => v !== ans)),
  });
}

const I = '<i>i</i>';

export function complexNumbers(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const k = pick(rng, [2, 3, 4, 5, 6, 7, 10, 11, 13]);
    const r = k % 4;
    const value = ['1', I, `${MINUS}1`, `${MINUS}${I}`][r];
    const wrong = ['1', I, `${MINUS}1`, `${MINUS}${I}`].filter((v) => v !== value);
    const order = shuffle([0, 1, 2, 3], rng);
    const all = [value, ...wrong];
    return poolQ('m.complex', d, {
      prompt: L(`Calculate: ${I}<sup>${k}</sup>`, `Вычисли: ${I}<sup>${k}</sup>`, `Есепте: ${I}<sup>${k}</sup>`),
      ex: steps(
        L(`${I}<sup>2</sup> = ${MINUS}1, and the powers of ${I} repeat with period 4: ${I}, ${MINUS}1, ${MINUS}${I}, 1.`, `${I}<sup>2</sup> = ${MINUS}1, а степени ${I} повторяются с периодом 4: ${I}, ${MINUS}1, ${MINUS}${I}, 1.`, `${I}<sup>2</sup> = ${MINUS}1, ал ${I} дәрежелері 4 периодпен қайталанады: ${I}, ${MINUS}1, ${MINUS}${I}, 1.`),
        same(`${k} = 4 ${TIMES} ${Math.floor(k / 4)} + ${r}, ${I}<sup>${k}</sup> = ${I}<sup>${r}</sup> = ${value}`),
      ),
      mc: { choices: order.map((i) => all[i]), answer: order.indexOf(0) },
    });
  }
  if (d === 2) {
    const [a, b, m] = pick(rng, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 5, 13]]);
    const sa = rng() < 0.5 ? -1 : 1;
    const sb = rng() < 0.5 ? -1 : 1;
    return poolQ('m.complex', d, {
      prompt: L(
        `Find the modulus of the complex number ${n(sa * a)} ${signed(sb * b)}${I}.`,
        `Найди модуль комплексного числа ${n(sa * a)} ${signed(sb * b)}${I}.`,
        `${n(sa * a)} ${signed(sb * b)}${I} комплекс санының модулін тап.`,
      ),
      ex: steps(same(`|<i>z</i>| = √(${a}<sup>2</sup> + ${b}<sup>2</sup>) = √${a * a + b * b} = ${m}`)),
      ...ask(ctx, m, [a + b, m * m, Math.abs(a - b), m + 1].filter((v) => v !== m)),
    });
  }
  const a = nz(rng, -4, 4);
  const b = nz(rng, -4, 4);
  const c = nz(rng, -4, 4);
  const e = nz(rng, -4, 4);
  const re = a * c - b * e;
  const im = a * e + b * c;
  return poolQ('m.complex', d, {
    prompt: L(
      `Find the real part of the product (${n(a)} ${signed(b)}${I})(${n(c)} ${signed(e)}${I}).`,
      `Найди действительную часть произведения (${n(a)} ${signed(b)}${I})(${n(c)} ${signed(e)}${I}).`,
      `(${n(a)} ${signed(b)}${I})(${n(c)} ${signed(e)}${I}) көбейтіндісінің нақты бөлігін тап.`,
    ),
    ex: steps(
      L(`Multiply out and use ${I}<sup>2</sup> = ${MINUS}1.`, `Раскроем скобки и учтём, что ${I}<sup>2</sup> = ${MINUS}1.`, `Жақшаларды ашып, ${I}<sup>2</sup> = ${MINUS}1 екенін ескереміз.`),
      same(`Re = ${n(a)} ${TIMES} ${par(c)} ${MINUS} ${par(b)} ${TIMES} ${par(e)} = ${n(re)}`),
    ),
    ...ask(ctx, re, [a * c + b * e, im, a * c, -re].filter((v) => v !== re)),
  });
}

export function vectors(ctx, d) {
  const { rng } = ctx;
  const a = [nz(rng, -6, 6), nz(rng, -6, 6)];
  const b = [nz(rng, -6, 6), nz(rng, -6, 6)];
  const vec = (v) => `(${n(v[0])}; ${n(v[1])})`;
  if (d === 1) {
    const sum = [a[0] + b[0], a[1] + b[1]];
    const ans = sum[0] + sum[1];
    return poolQ('m.vector', d, {
      prompt: L(
        `Vectors <b>a</b> = ${vec(a)} and <b>b</b> = ${vec(b)}. Find the sum of the coordinates of <b>a</b> + <b>b</b>.`,
        `Даны векторы <b>a</b> = ${vec(a)} и <b>b</b> = ${vec(b)}. Найди сумму координат вектора <b>a</b> + <b>b</b>.`,
        `<b>a</b> = ${vec(a)} және <b>b</b> = ${vec(b)} векторлары берілген. <b>a</b> + <b>b</b> векторының координаталарының қосындысын тап.`,
      ),
      ex: steps(same(`<b>a</b> + <b>b</b> = ${vec(sum)}`), same(`${n(sum[0])} ${signed(sum[1])} = ${n(ans)}`)),
      ...ask(ctx, ans, [a[0] - b[0] + a[1] - b[1], sum[0], sum[1], ans + 1].filter((v) => v !== ans)),
    });
  }
  if (d === 2) {
    const ans = a[0] * b[0] + a[1] * b[1];
    return poolQ('m.vector', d, {
      prompt: L(
        `Find the dot product of <b>a</b> = ${vec(a)} and <b>b</b> = ${vec(b)}.`,
        `Найди скалярное произведение векторов <b>a</b> = ${vec(a)} и <b>b</b> = ${vec(b)}.`,
        `<b>a</b> = ${vec(a)} және <b>b</b> = ${vec(b)} векторларының скаляр көбейтіндісін тап.`,
      ),
      ex: steps(same(`<b>a</b> · <b>b</b> = <i>x</i><sub>1</sub><i>x</i><sub>2</sub> + <i>y</i><sub>1</sub><i>y</i><sub>2</sub>`), same(`${n(a[0])} ${TIMES} ${par(b[0])} + ${par(a[1])} ${TIMES} ${par(b[1])} = ${n(ans)}`)),
      ...ask(ctx, ans, [a[0] * b[1] + a[1] * b[0], a[0] * b[0] - a[1] * b[1], -ans, ans + 2].filter((v) => v !== ans)),
    });
  }
  const k = nz(rng, -5, 5);
  const m = nz(rng, -5, 5);
  // Векторы (k; 2) и (m; t) перпендикулярны: k·m + 2t = 0 → t = −k·m/2. Берём чётное k·m.
  const kk = k % 2 === 0 ? k : k * 2;
  const t = -(kk * m) / 2;
  return poolQ('m.vector', d, {
    prompt: L(
      `For what value of <i>t</i> are the vectors (${n(kk)}; 2) and (${n(m)}; <i>t</i>) perpendicular?`,
      `При каком значении <i>t</i> векторы (${n(kk)}; 2) и (${n(m)}; <i>t</i>) перпендикулярны?`,
      `<i>t</i>-ның қандай мәнінде (${n(kk)}; 2) және (${n(m)}; <i>t</i>) векторлары перпендикуляр болады?`,
    ),
    ex: steps(
      L('Perpendicular vectors have a zero dot product.', 'У перпендикулярных векторов скалярное произведение равно нулю.', 'Перпендикуляр векторлардың скаляр көбейтіндісі нөлге тең.'),
      same(`${n(kk)} ${TIMES} ${par(m)} + 2<i>t</i> = 0, <i>t</i> = ${n(t)}`),
    ),
    ...ask(ctx, t, [-t, kk * m, t + 1, m].filter((v) => v !== t)),
  });
}

export function matrices(ctx, d) {
  const { rng } = ctx;
  const mat = (rows) => `<span class="matrix">${rows.map((r) => `<span>${r.map(n).join('&nbsp;&nbsp;')}</span>`).join('')}</span>`;
  if (d < 3) {
    const lim = d === 1 ? 5 : 9;
    const a = randomInt(rng, -lim, lim);
    const b = randomInt(rng, -lim, lim);
    const c = randomInt(rng, -lim, lim);
    const e = randomInt(rng, -lim, lim);
    const det = a * e - b * c;
    return poolQ('m.matrix', d, {
      prompt: L(
        `Find the determinant of the matrix ${mat([[a, b], [c, e]])}`,
        `Найди определитель матрицы ${mat([[a, b], [c, e]])}`,
        `Матрицаның анықтауышын тап: ${mat([[a, b], [c, e]])}`,
      ),
      ex: steps(same(`det = <i>ad</i> ${MINUS} <i>bc</i>`), same(`${n(a)} ${TIMES} ${par(e)} ${MINUS} ${par(b)} ${TIMES} ${par(c)} = ${n(det)}`)),
      ...ask(ctx, det, [a * e + b * c, a * b - c * e, -det, det + 1].filter((v) => v !== det)),
    });
  }
  const A = [[randomInt(rng, -3, 3), randomInt(rng, -3, 3)], [randomInt(rng, -3, 3), randomInt(rng, -3, 3)]];
  const B = [[randomInt(rng, -3, 3), randomInt(rng, -3, 3)], [randomInt(rng, -3, 3), randomInt(rng, -3, 3)]];
  const ans = A[0][0] * B[0][0] + A[0][1] * B[1][0];
  return poolQ('m.matrix', d, {
    prompt: L(
      `Find the element in the first row and first column of the product ${mat(A)} ${TIMES} ${mat(B)}`,
      `Найди элемент первой строки и первого столбца произведения ${mat(A)} ${TIMES} ${mat(B)}`,
      `${mat(A)} ${TIMES} ${mat(B)} көбейтіндісінің бірінші жолы мен бірінші бағанындағы элементті тап.`,
    ),
    ex: steps(
      L('Multiply the first row of the first matrix by the first column of the second.', 'Умножаем первую строку первой матрицы на первый столбец второй.', 'Бірінші матрицаның бірінші жолын екіншісінің бірінші бағанына көбейтеміз.'),
      same(`${par(A[0][0])} ${TIMES} ${par(B[0][0])} + ${par(A[0][1])} ${TIMES} ${par(B[1][0])} = ${n(ans)}`),
    ),
    ...ask(ctx, ans, [A[0][0] * B[0][0] + A[0][1] * B[0][1], A[0][0] * B[0][0], ans + 1, -ans].filter((v) => v !== ans)),
  });
}
