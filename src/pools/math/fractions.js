// Дроби, десятичные числа, проценты, отношения и пропорции.

import { MINUS, fracHtml, gcd, simplify } from '../../core/format.js';
import { pick, randomInt } from '../../core/random.js';
import { L, W, ask, askFrac, dec, loc, n, poolQ, same, steps } from '../gen.js';

const TIMES = '×';
const DIV = '÷';
const calc = (expr) => loc((l) => `${W.calc[l]}: ${expr}`);
const lcmOf = (a, b) => (a * b) / gcd(a, b);
/** Дробь с произвольным содержимым (не сокращается). */
export const frac = (top, bottom) => `<span class="frac"><span>${top}</span><span>${bottom}</span></span>`;

export function fractions(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const den = randomInt(rng, 5, 12);
    const a = randomInt(rng, 1, den - 2);
    const b = randomInt(rng, 1, den - 1);
    const plus = rng() < 0.5 || a === b;
    const [x, y] = plus ? [a, b] : [Math.max(a, b), Math.min(a, b)];
    const top = plus ? x + y : x - y;
    const [sn, sd] = simplify(top, den);
    return poolQ('m.frac', d, {
      prompt: calc(`${frac(x, den)} ${plus ? '+' : MINUS} ${frac(y, den)}`),
      ex: steps(
        L(
          'The denominators are equal, so work with the numerators only.',
          'Знаменатели одинаковые, поэтому действуем только с числителями.',
          'Бөлімдері бірдей, сондықтан тек алымдарымен амал орындаймыз.',
        ),
        same(`${frac(`${x} ${plus ? '+' : MINUS} ${y}`, den)} = ${frac(top, den)}${sd !== den ? ` = ${fracHtml(sn, sd)}` : ''}`),
      ),
      ...askFrac(ctx, [top, den], [
        [top, den * 2],
        [plus ? Math.abs(x - y) || 1 : x + y, den],
        [top + 1, den],
        [top, den + 1],
      ]),
    });
  }
  if (d === 2) {
    let p = randomInt(rng, 2, 8);
    let q = randomInt(rng, 3, 9);
    while (p === q) q = randomInt(rng, 3, 9);
    let a = randomInt(rng, 1, p - 1);
    while (gcd(a, p) !== 1) a = randomInt(rng, 1, p - 1);
    let b = randomInt(rng, 1, q - 1);
    while (gcd(b, q) !== 1) b = randomInt(rng, 1, q - 1);
    const m = lcmOf(p, q);
    const ax = a * (m / p);
    const bx = b * (m / q);
    const plus = rng() < 0.5 || ax === bx;
    const big = ax >= bx;
    const top = plus ? ax + bx : Math.abs(ax - bx);
    const [sn, sd] = simplify(top, m);
    const left = plus || big ? frac(a, p) : frac(b, q);
    const right = plus || big ? frac(b, q) : frac(a, p);
    const lx = plus || big ? ax : bx;
    const rx = plus || big ? bx : ax;
    return poolQ('m.frac', d, {
      prompt: calc(`${left} ${plus ? '+' : MINUS} ${right}`),
      ex: steps(
        L(`The common denominator is ${m}.`, `Общий знаменатель — ${m}.`, `Ортақ бөлім — ${m}.`),
        same(`${left} = ${frac(lx, m)}, ${right} = ${frac(rx, m)}`),
        same(`${frac(lx, m)} ${plus ? '+' : MINUS} ${frac(rx, m)} = ${frac(top, m)}${sd !== m ? ` = ${fracHtml(sn, sd)}` : ''}`),
      ),
      ...askFrac(ctx, [top, m], [
        [plus ? a + b : Math.abs(a - b) || 1, plus ? p + q : Math.abs(p - q) || 1],
        [plus ? a + b : Math.abs(a - b) || 1, m],
        [top + 1, m],
        [top, m * 2],
      ]),
    });
  }
  const b = randomInt(rng, 2, 9);
  let a = randomInt(rng, 1, b - 1);
  while (gcd(a, b) !== 1) a = randomInt(rng, 1, b - 1);
  const e = randomInt(rng, 2, 9);
  let c = randomInt(rng, 1, 9);
  while (c === e || gcd(c, e) !== 1) c = randomInt(rng, 1, 9);
  if (rng() < 0.5) {
    const [sn, sd] = simplify(a * c, b * e);
    return poolQ('m.frac', d, {
      prompt: calc(`${frac(a, b)} ${TIMES} ${frac(c, e)}`),
      ex: steps(
        L('Multiply numerator by numerator and denominator by denominator.', 'Умножаем числитель на числитель, знаменатель на знаменатель.', 'Алымды алымға, бөлімді бөлімге көбейтеміз.'),
        same(`${frac(`${a} ${TIMES} ${c}`, `${b} ${TIMES} ${e}`)} = ${frac(a * c, b * e)}${sd !== b * e ? ` = ${fracHtml(sn, sd)}` : ''}`),
      ),
      ...askFrac(ctx, [a * c, b * e], [
        [a * e, b * c],
        [a + c, b + e],
        [a * c, b + e],
        [a * c + 1, b * e],
      ]),
    });
  }
  const [sn, sd] = simplify(a * e, b * c);
  return poolQ('m.frac', d, {
    prompt: calc(`${frac(a, b)} ${DIV} ${frac(c, e)}`),
    ex: steps(
      L('To divide by a fraction, multiply by its reciprocal.', 'Чтобы разделить на дробь, умножаем на обратную ей.', 'Бөлшекке бөлу үшін оған кері бөлшекке көбейтеміз.'),
      same(`${frac(a, b)} ${TIMES} ${frac(e, c)} = ${frac(a * e, b * c)}${sd !== b * c ? ` = ${fracHtml(sn, sd)}` : ''}`),
    ),
    ...askFrac(ctx, [a * e, b * c], [
      [a * c, b * e],
      [b * c, a * e],
      [a + e, b + c],
      [a * e + 1, b * c],
    ]),
  });
}

export function decimals(ctx, d) {
  const { rng } = ctx;
  const fx = (x) => Math.round(x * 1000) / 1000;
  if (d === 1) {
    const a = randomInt(rng, 12, 95);
    const b = randomInt(rng, 11, 79);
    const plus = rng() < 0.5;
    const [x, y] = plus ? [a, b] : [Math.max(a, b) + 10, Math.min(a, b)];
    const ans = fx((plus ? x + y : x - y) / 10);
    return poolQ('m.dec', d, {
      prompt: loc((l) => `${W.calc[l]}: ${dec(x / 10)[l]} ${plus ? '+' : MINUS} ${dec(y / 10)[l]}`),
      ex: steps(
        L(
          'Line up the decimal points and work as with whole numbers.',
          'Записываем запятую под запятой и считаем как с целыми числами.',
          'Үтірді үтірдің астына жазып, бүтін сандар сияқты есептейміз.',
        ),
        loc((l) => `${x} ${plus ? '+' : MINUS} ${y} = ${plus ? x + y : x - y} → ${dec(ans)[l]}`),
      ),
      ...ask(ctx, ans, [fx(ans + 1), fx(ans - 0.1), fx(ans * 10), fx(ans + 0.1)], { fmt: dec }),
    });
  }
  if (d === 2) {
    const a = randomInt(rng, 12, 85);
    const b = randomInt(rng, 2, 9);
    if (rng() < 0.5) {
      const ans = fx((a * b) / 10);
      return poolQ('m.dec', d, {
        prompt: loc((l) => `${W.calc[l]}: ${dec(a / 10)[l]} ${TIMES} ${b}`),
        ex: steps(
          L('Multiply as whole numbers, then put one digit after the decimal point.', 'Умножаем как целые числа, затем отделяем один знак после запятой.', 'Бүтін сандар сияқты көбейтіп, үтірден кейін бір таңба қалдырамыз.'),
          loc((l) => `${a} ${TIMES} ${b} = ${a * b} → ${dec(ans)[l]}`),
        ),
        ...ask(ctx, ans, [fx(ans * 10), fx(ans / 10), fx(ans + b / 10), fx(ans - 1)], { fmt: dec }),
      });
    }
    const c = randomInt(rng, 2, 9);
    const ans = fx((a * c) / 100);
    return poolQ('m.dec', d, {
      prompt: loc((l) => `${W.calc[l]}: ${dec(a / 10)[l]} ${TIMES} ${dec(c / 10)[l]}`),
      ex: steps(
        L(
          'Multiply as whole numbers. The factors have 2 decimal digits in total, so the answer has 2 as well.',
          'Умножаем как целые числа. В множителях вместе 2 знака после запятой — столько же в ответе.',
          'Бүтін сандар сияқты көбейтеміз. Көбейткіштерде үтірден кейін барлығы 2 таңба — жауапта да сонша.',
        ),
        loc((l) => `${a} ${TIMES} ${c} = ${a * c} → ${dec(ans)[l]}`),
      ),
      ...ask(ctx, ans, [fx(ans * 10), fx(ans * 100), fx(ans + 0.1), fx(ans / 10)], { fmt: dec }),
    });
  }
  const q = randomInt(rng, 3, 24);
  const k = randomInt(rng, 2, 9);
  const x = fx((q * k) / 10);
  const y = fx(k / 10);
  return poolQ('m.dec', d, {
    prompt: loc((l) => `${W.calc[l]}: ${dec(x)[l]} ${DIV} ${dec(y)[l]}`),
    ex: steps(
      L(
        'Multiply both numbers by 10 to make the divisor a whole number.',
        'Умножим оба числа на 10, чтобы делитель стал целым.',
        'Бөлгіш бүтін сан болуы үшін екі санды да 10-ға көбейтеміз.',
      ),
      same(`${q * k} ${DIV} ${k} = ${q}`),
    ),
    ...ask(ctx, q, [fx(q / 10), q * 10, q + 1, q - 1].filter((v) => v !== q), { fmt: dec }),
  });
}

export function percent(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const p = pick(rng, [5, 10, 15, 20, 25, 30, 40, 50, 75]);
    const N = 20 * randomInt(rng, 2, 40);
    const ans = (N * p) / 100;
    return poolQ('m.pct', d, {
      prompt: L(`Find ${p}% of ${N}.`, `Найди ${p}% от числа ${N}.`, `${N} санының ${p}%-ын тап.`),
      ex: steps(
        L(`1% of ${N} is ${N} ${DIV} 100.`, `1% от ${N} — это ${N} ${DIV} 100.`, `${N} санының 1%-ы — ${N} ${DIV} 100.`),
        loc((l) => `${N} ${DIV} 100 ${TIMES} ${p} = ${dec(ans)[l]}`),
      ),
      ...ask(ctx, ans, [N / p, ans * 10, N - ans, ans + p].filter((v) => v !== ans && Number.isInteger(v))),
    });
  }
  if (d === 2) {
    if (rng() < 0.5) {
      const p = pick(rng, [5, 10, 15, 20, 25, 30, 40, 60, 75]);
      const b = 20 * randomInt(rng, 2, 30);
      const a = (b * p) / 100;
      return poolQ('m.pct', d, {
        prompt: L(`What percent of ${b} is ${a}?`, `Сколько процентов от ${b} составляет число ${a}?`, `${a} саны ${b} санының неше пайызын құрайды?`),
        ex: steps(
          L('Divide the part by the whole and multiply by 100.', 'Делим часть на целое и умножаем на 100.', 'Бөлікті бүтінге бөліп, 100-ге көбейтеміз.'),
          same(`${a} ${DIV} ${b} ${TIMES} 100 = ${p}%`),
        ),
        ...ask(ctx, p, [100 - p, p + 5, p * 2, p + 10].filter((v) => v !== p), { fmt: (x) => `${n(x)}%` }),
      });
    }
    const p = pick(rng, [5, 10, 15, 20, 25, 30, 50]);
    const N = 20 * randomInt(rng, 3, 40);
    const up = rng() < 0.5;
    const ans = (N * (100 + (up ? p : -p))) / 100;
    return poolQ('m.pct', d, {
      prompt: up
        ? L(`A price of ${N} was increased by ${p}%. Find the new price.`, `Цену ${N} увеличили на ${p}%. Найди новую цену.`, `${N} бағасын ${p}%-ға арттырды. Жаңа бағаны тап.`)
        : L(`A price of ${N} was reduced by ${p}%. Find the new price.`, `Цену ${N} снизили на ${p}%. Найди новую цену.`, `${N} бағасын ${p}%-ға төмендетті. Жаңа бағаны тап.`),
      ex: steps(
        L(`${p}% of ${N} is ${(N * p) / 100}.`, `${p}% от ${N} — это ${(N * p) / 100}.`, `${N} санының ${p}%-ы — ${(N * p) / 100}.`),
        same(`${N} ${up ? '+' : MINUS} ${(N * p) / 100} = ${ans}`),
      ),
      ...ask(ctx, ans, [(N * p) / 100, N + (up ? -1 : 1) * ((N * p) / 100), N + p, ans + 10].filter((v) => v !== ans)),
    });
  }
  if (rng() < 0.5) {
    const p = pick(rng, [10, 20, 25, 30, 40, 50]);
    const orig = 20 * randomInt(rng, 5, 60);
    const now = (orig * (100 - p)) / 100;
    return poolQ('m.pct', d, {
      prompt: L(
        `After a ${p}% discount, a jacket costs ${n(now)}. What was the price before the discount?`,
        `После скидки ${p}% куртка стоит ${n(now)}. Сколько она стоила до скидки?`,
        `${p}% жеңілдіктен кейін күрте ${n(now)} тұрады. Жеңілдікке дейін ол қанша тұрған?`,
      ),
      ex: steps(
        L(`The new price is ${100 - p}% of the old one.`, `Новая цена — это ${100 - p}% от старой.`, `Жаңа баға — ескі бағаның ${100 - p}%-ы.`),
        same(`${n(now)} ${DIV} ${100 - p} ${TIMES} 100 = ${n(orig)}`),
      ),
      ...ask(ctx, orig, [(now * (100 + p)) / 100, now + p, orig + 20, orig - 20].filter((v) => v !== orig && Number.isInteger(v))),
    });
  }
  const p = pick(rng, [10, 20, 30, 50]);
  const N = 100 * randomInt(rng, 2, 30);
  const upPrice = (N * (100 + p)) / 100;
  const ans = (upPrice * (100 - p)) / 100;
  return poolQ('m.pct', d, {
    prompt: L(
      `A price of ${n(N)} was increased by ${p}% and then reduced by ${p}%. Find the final price.`,
      `Цену ${n(N)} сначала повысили на ${p}%, а затем снизили на ${p}%. Найди итоговую цену.`,
      `${n(N)} бағасын алдымен ${p}%-ға көтеріп, сосын ${p}%-ға төмендетті. Соңғы бағаны тап.`,
    ),
    ex: steps(
      L(`After the increase: ${n(N)} ${TIMES} ${dec((100 + p) / 100).en} = ${n(upPrice)}.`, `После повышения: ${n(N)} ${TIMES} ${dec((100 + p) / 100).ru} = ${n(upPrice)}.`, `Көтергеннен кейін: ${n(N)} ${TIMES} ${dec((100 + p) / 100).kk} = ${n(upPrice)}.`),
      L(
        `The reduction is taken from the new price: ${n(upPrice)} ${TIMES} ${dec((100 - p) / 100).en} = ${n(ans)}.`,
        `Скидка считается уже от новой цены: ${n(upPrice)} ${TIMES} ${dec((100 - p) / 100).ru} = ${n(ans)}.`,
        `Жеңілдік жаңа бағадан есептеледі: ${n(upPrice)} ${TIMES} ${dec((100 - p) / 100).kk} = ${n(ans)}.`,
      ),
    ),
    ...ask(ctx, ans, [N, upPrice, N - p, ans + N / 100].filter((v) => v !== ans)),
  });
}

export function ratio(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const x = randomInt(rng, 2, 12);
    const a = randomInt(rng, 2, 9);
    const m = randomInt(rng, 2, 6);
    const b = x * m;
    const c = a * m;
    return poolQ('m.ratio', d, {
      prompt: L(
        `Find <i>x</i> in the proportion ${frac('<i>x</i>', a)} = ${frac(b, c)}.`,
        `Найди <i>x</i> из пропорции ${frac('<i>x</i>', a)} = ${frac(b, c)}.`,
        `${frac('<i>x</i>', a)} = ${frac(b, c)} пропорциясынан <i>x</i>-ті тап.`,
      ),
      ex: steps(
        L('Cross-multiply.', 'Перемножим крест-накрест.', 'Айқастырып көбейтеміз.'),
        same(`<i>x</i> ${TIMES} ${c} = ${a} ${TIMES} ${b} = ${a * b}`),
        same(`<i>x</i> = ${a * b} ${DIV} ${c} = ${x}`),
      ),
      ...ask(ctx, x, [x * m, x + m, x + 1, b - a].filter((v) => v !== x && v > 0)),
    });
  }
  if (d === 2) {
    const a = randomInt(rng, 1, 5);
    let b = randomInt(rng, 2, 7);
    while (gcd(a, b) !== 1 || a === b) b = randomInt(rng, 2, 9);
    const k = randomInt(rng, 3, 20);
    const N = (a + b) * k;
    const big = Math.max(a, b) * k;
    return poolQ('m.ratio', d, {
      prompt: L(
        `The number ${N} is split into two parts in the ratio ${a} : ${b}. Find the larger part.`,
        `Число ${N} разделили на две части в отношении ${a} : ${b}. Найди большую часть.`,
        `${N} санын ${a} : ${b} қатынасында екі бөлікке бөлді. Үлкен бөлікті тап.`,
      ),
      ex: steps(
        L(`There are ${a} + ${b} = ${a + b} equal shares.`, `Всего ${a} + ${b} = ${a + b} равных долей.`, `Барлығы ${a} + ${b} = ${a + b} тең үлес.`),
        L(`One share is ${N} ${DIV} ${a + b} = ${k}.`, `Одна доля: ${N} ${DIV} ${a + b} = ${k}.`, `Бір үлес: ${N} ${DIV} ${a + b} = ${k}.`),
        same(`${Math.max(a, b)} ${TIMES} ${k} = ${big}`),
      ),
      ...ask(ctx, big, [Math.min(a, b) * k, k, N / 2, big + k].filter((v) => v !== big && Number.isInteger(v))),
    });
  }
  const w2 = randomInt(rng, 2, 8);
  const t2 = randomInt(rng, 2, 12);
  const f = pick(rng, [2, 3, 4]);
  const w1 = w2 * f;
  const total = w2 * t2 * f;
  const t1 = total / w1;
  // w1 рабочих — t1 дней; w2 рабочих — ? дней. Работа одна и та же: w1·t1 = w2·x.
  const ans = total / w2;
  return poolQ('m.ratio', d, {
    prompt: L(
      `A team of ${w1} workers finishes a job in ${t1} days. How many days will a team of ${w2} workers need for the same job?`,
      `Бригада из ${w1} чел. выполняет работу за ${t1} дн. За сколько дней ту же работу выполнит бригада из ${w2} чел.?`,
      `${w1} жұмысшы жұмысты ${t1} күнде бітіреді. Сол жұмысты ${w2} жұмысшы неше күнде бітіреді?`,
    ),
    ex: steps(
      L(
        `The whole job is ${w1} ${TIMES} ${t1} = ${total} worker-days.`,
        `Вся работа — это ${w1} ${TIMES} ${t1} = ${total} человеко-дней.`,
        `Бүкіл жұмыс — ${w1} ${TIMES} ${t1} = ${total} адам-күн.`,
      ),
      L(
        `Fewer workers need more time: ${total} ${DIV} ${w2} = ${ans}.`,
        `Чем меньше рабочих, тем больше времени: ${total} ${DIV} ${w2} = ${ans}.`,
        `Жұмысшы аз болса, уақыт көп керек: ${total} ${DIV} ${w2} = ${ans}.`,
      ),
    ),
    ...ask(ctx, ans, [t1 / f, t1 + (w1 - w2), t1 * 2 + 1, ans + f].filter((v) => v !== ans && Number.isInteger(v) && v > 0)),
  });
}
