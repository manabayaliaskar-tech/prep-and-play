// Домен «Алгебра»: линейные уравнения, функции, модели, системы, неравенства.
// Каждый генератор: (ctx, d) → задание. ctx = { rng, mcOnly }, d — сложность 1…3.

import { pick, randomInt } from '../../core/random.js';
import { MINUS, linear, num, v } from '../../core/format.js';
import { choose, makeMc, mathQ, moveConst, nonZero, P, say, st, steps } from './util.js';

const X = v('x');
const Y = v('y');
const F = v('f');
/** Число в скобках, если оно отрицательное: (−3). */
const p = (n) => (n < 0 ? `(${num(n)})` : num(n));
const plusMinus = (n) => `${n < 0 ? MINUS : '+'} ${num(Math.abs(n))}`;
const system = (...lines) => `<span class="system">${lines.map((l) => `<span>${l}</span>`).join('')}</span>`;

export function linEq(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const x = randomInt(rng, -5, 12);
    const a = randomInt(rng, 2, 9);
    const b = nonZero(rng, -15, 20);
    const c = a * x + b;
    return mathQ('lin-eq', d, {
      prompt: `If ${linear(a, b)} = ${num(c)}, what is the value of ${X}?`,
      ex: steps(say(moveConst(b), `${num(a)}${X} = ${num(c - b)}`), say(P.div(num(a)), `${X} = ${num(x)}`)),
      ...choose(ctx, x, [(c + b) / a, c - b, -x, x + 2].filter(Number.isInteger)),
    });
  }
  if (d === 2) {
    const x = randomInt(rng, -6, 10);
    const a = randomInt(rng, 2, 6);
    const b = nonZero(rng, -6, 6);
    let c = randomInt(rng, 1, 9);
    if (c === a) c += 1;
    const e = a * (x + b) - c * x;
    const left = `${num(a)}(${linear(1, b)})`;
    const k = a - c;
    const items = [
      st(
        `Expand the left side: ${linear(a, a * b)} = ${linear(c, e)}.`,
        `Раскроем скобки слева: ${linear(a, a * b)} = ${linear(c, e)}.`,
        `Сол жақтағы жақшаны ашамыз: ${linear(a, a * b)} = ${linear(c, e)}.`,
      ),
      st(
        `Move the ${X}-terms to the left and the numbers to the right: ${linear(k, 0)} = ${num(e - a * b)}.`,
        `Перенесём слагаемые с ${X} влево, а числа вправо: ${linear(k, 0)} = ${num(e - a * b)}.`,
        `${X} бар мүшелерді сол жаққа, сандарды оң жаққа шығарамыз: ${linear(k, 0)} = ${num(e - a * b)}.`,
      ),
    ];
    if (k !== 1) items.push(say(P.div(num(k)), `${X} = ${num(x)}`));
    return mathQ('lin-eq', d, {
      prompt: `What value of ${X} satisfies the equation ${left} = ${linear(c, e)}?`,
      ex: steps(...items),
      ...choose(ctx, x, [(e - b) / k, (e + a * b) / k, -x, (e - a * b) / (a + c)].filter(Number.isInteger)),
    });
  }
  const a = randomInt(rng, 2, 7);
  const b = nonZero(rng, -9, 9);
  const c = randomInt(rng, 10, 40);
  const k = randomInt(rng, 2, 4);
  const m = nonZero(rng, -12, 12);
  const ka = k * (c - b);
  const ans = ka + m;
  const mc = moveConst(b);
  return mathQ('lin-eq', d, {
    prompt: `If ${linear(a, b)} = ${num(c)}, what is the value of ${linear(k * a, m)}?`,
    ex: steps(
      st(
        `You don't need ${X} itself. ${mc.en}: ${num(a)}${X} = ${num(c - b)}.`,
        `Находить сам ${X} не нужно. ${mc.ru}: ${num(a)}${X} = ${num(c - b)}.`,
        `${X}-тің өзін табу міндетті емес. ${mc.kk}: ${num(a)}${X} = ${num(c - b)}.`,
      ),
      st(
        `Since ${num(k * a)}${X} = ${k} · ${num(a)}${X}, we get ${num(k * a)}${X} = ${k} · ${p(c - b)} = ${num(ka)}.`,
        `Так как ${num(k * a)}${X} = ${k} · ${num(a)}${X}, получаем ${num(k * a)}${X} = ${k} · ${p(c - b)} = ${num(ka)}.`,
        `${num(k * a)}${X} = ${k} · ${num(a)}${X} болғандықтан, ${num(k * a)}${X} = ${k} · ${p(c - b)} = ${num(ka)}.`,
      ),
      st(
        `Therefore ${linear(k * a, m)} = ${num(ka)} ${plusMinus(m)} = ${num(ans)}.`,
        `Значит, ${linear(k * a, m)} = ${num(ka)} ${plusMinus(m)} = ${num(ans)}.`,
        `Демек, ${linear(k * a, m)} = ${num(ka)} ${plusMinus(m)} = ${num(ans)}.`,
      ),
    ),
    ...choose(ctx, ans, [k * c + m, ka, ka - m, (c - b) / a].filter(Number.isInteger)),
  });
}

export function linFunc(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const m = nonZero(rng, -6, 8);
    const b = nonZero(rng, -10, 10);
    const k = nonZero(rng, -4, 6);
    const ans = m * k + b;
    return mathQ('lin-func', d, {
      prompt: `The function ${F} is defined by ${F}(${X}) = ${linear(m, b)}. What is the value of ${F}(${num(k)})?`,
      ex: steps(
        st(
          `Substitute ${X} = ${num(k)}: ${F}(${num(k)}) = ${num(m)} · ${p(k)} ${plusMinus(b)} = ${num(m * k)} ${plusMinus(b)} = ${num(ans)}.`,
          `Подставим ${X} = ${num(k)}: ${F}(${num(k)}) = ${num(m)} · ${p(k)} ${plusMinus(b)} = ${num(m * k)} ${plusMinus(b)} = ${num(ans)}.`,
          `${X} = ${num(k)} мәнін қоямыз: ${F}(${num(k)}) = ${num(m)} · ${p(k)} ${plusMinus(b)} = ${num(m * k)} ${plusMinus(b)} = ${num(ans)}.`,
        ),
      ),
      ...choose(ctx, ans, [m * k - b, m + k + b, m * (k + b), -ans]),
    });
  }
  if (d === 2) {
    const m = nonZero(rng, -4, 5);
    const b = randomInt(rng, -8, 8);
    const x1 = randomInt(rng, -3, 3);
    const x2 = x1 + randomInt(rng, 2, 5);
    const y1 = m * x1 + b;
    const y2 = m * x2 + b;
    const formula = `(${num(y2)} ${MINUS} ${p(y1)}) ÷ (${num(x2)} ${MINUS} ${p(x1)}) = ${num(y2 - y1)} ÷ ${num(x2 - x1)} = ${num(m)}`;
    return mathQ('lin-func', d, {
      prompt: `In the ${X}${Y}-plane, a line passes through the points (${num(x1)}, ${num(y1)}) and (${num(x2)}, ${num(y2)}). What is the slope of the line?`,
      ex: steps(
        st(
          `Slope = (change in ${Y}) ÷ (change in ${X}).`,
          `Угловой коэффициент = (изменение ${Y}) ÷ (изменение ${X}).`,
          `Еңіс (бұрыштық коэффициент) = (${Y} өзгерісі) ÷ (${X} өзгерісі).`,
        ),
        st(`${formula}.`, `${formula}.`, `${formula}.`),
      ),
      ...choose(ctx, m, [-m, (x2 - x1) / (y2 - y1), b, y2 - y1].filter(Number.isInteger)),
    });
  }
  const m = nonZero(rng, -5, 6);
  const b = randomInt(rng, -12, 12);
  const a = randomInt(rng, 1, 3);
  const c = a + randomInt(rng, 2, 4);
  const fa = m * a + b;
  const fc = m * c + b;
  return mathQ('lin-func', d, {
    prompt: `For the linear function ${F}, ${F}(${a}) = ${num(fa)} and ${F}(${c}) = ${num(fc)}. What is the value of ${F}(0)?`,
    ex: steps(
      st(
        `Slope: (${num(fc)} ${MINUS} ${p(fa)}) ÷ (${c} ${MINUS} ${a}) = ${num(fc - fa)} ÷ ${c - a} = ${num(m)}.`,
        `Угловой коэффициент: (${num(fc)} ${MINUS} ${p(fa)}) ÷ (${c} ${MINUS} ${a}) = ${num(fc - fa)} ÷ ${c - a} = ${num(m)}.`,
        `Еңіс: (${num(fc)} ${MINUS} ${p(fa)}) ÷ (${c} ${MINUS} ${a}) = ${num(fc - fa)} ÷ ${c - a} = ${num(m)}.`,
      ),
      st(
        `Going from ${X} = ${a} back to ${X} = 0 changes the value by ${a} slopes: ${F}(0) = ${num(fa)} ${MINUS} ${a} · ${p(m)} = ${num(b)}.`,
        `Переход от ${X} = ${a} к ${X} = 0 меняет значение на ${a} угловых коэффициента: ${F}(0) = ${num(fa)} ${MINUS} ${a} · ${p(m)} = ${num(b)}.`,
        `${X} = ${a} нүктесінен ${X} = 0 нүктесіне өткенде мән ${a} еңіске өзгереді: ${F}(0) = ${num(fa)} ${MINUS} ${a} · ${p(m)} = ${num(b)}.`,
      ),
    ),
    ...choose(ctx, b, [fa, b + m, -b, m]),
  });
}

const MODEL_CONTEXTS = [
  {
    setup: (f, r) => `A gym charges a one-time membership fee of $${f} plus $${r} per month.`,
    unit: 'months',
    one: 'month',
    fees: [25, 30, 40, 50, 60],
    rates: [15, 20, 25, 30, 35],
  },
  {
    setup: (f, r) => `A taxi ride costs a flat fee of $${f} plus $${r} for each mile traveled.`,
    unit: 'miles',
    one: 'mile',
    fees: [3, 4, 5, 6],
    rates: [2, 3, 4],
  },
  {
    setup: (f, r) => `A print shop charges a setup fee of $${f} plus $${r} for each poster printed.`,
    unit: 'posters',
    one: 'poster',
    fees: [20, 25, 30, 40],
    rates: [3, 4, 5, 6],
  },
];

export function linModel(ctx, d) {
  const { rng } = ctx;
  const c = pick(rng, MODEL_CONTEXTS);
  const f = pick(rng, c.fees);
  let r = pick(rng, c.rates);
  // Плата и тариф не должны совпадать, иначе вопрос «что означает число» станет двусмысленным.
  while (r === f) r = pick(rng, c.rates);
  const n = randomInt(rng, 4, 18);
  const total = f + r * n;
  if (d === 1) {
    return mathQ('lin-model', d, {
      prompt: `${c.setup(f, r)} What is the total cost, in dollars, for ${n} ${c.unit}?`,
      ex: steps(
        st(
          `Total = fixed fee + rate × number of ${c.unit} = ${f} + ${r} · ${n}.`,
          `Итого = фиксированная плата + цена за единицу × количество = ${f} + ${r} · ${n}.`,
          `Барлығы = тұрақты төлем + бірлік бағасы × саны = ${f} + ${r} · ${n}.`,
        ),
        st(`${f} + ${r * n} = ${total}.`, `${f} + ${r * n} = ${total}.`, `${f} + ${r * n} = ${total}.`),
      ),
      ...choose(ctx, total, [r * n, (f + r) * n, f * n + r]),
    });
  }
  if (d === 2) {
    return mathQ('lin-model', d, {
      prompt: `${c.setup(f, r)} A customer paid a total of $${total}. For how many ${c.unit} was the customer charged?`,
      ex: steps(
        st(
          `Write an equation: ${f} + ${r}${v('n')} = ${total}.`,
          `Составим уравнение: ${f} + ${r}${v('n')} = ${total}.`,
          `Теңдеу құрамыз: ${f} + ${r}${v('n')} = ${total}.`,
        ),
        say(P.sub(String(f)), `${r}${v('n')} = ${total - f}`),
        say(P.div(String(r)), `${v('n')} = ${n}`),
      ),
      ...choose(ctx, n, [(total + f) / r, total / r, n + 1, n - 1].filter(Number.isInteger)),
    });
  }
  const askRate = rng() < 0.5;
  const options = [`The cost per ${c.one}`, 'The one-time fee', `The total cost for ${n} ${c.unit}`, `The number of ${c.unit}`];
  const correct = askRate ? options[0] : options[1];
  const wrong = options.filter((o) => o !== correct);
  return mathQ('lin-model', d, {
    prompt: `${c.setup(f, r)} The total cost <i>C</i>, in dollars, for ${X} ${c.unit} is given by <i>C</i> = ${f} + ${r}${X}. What is the best interpretation of ${askRate ? r : f} in this context?`,
    ex: steps(
      st(
        `In <i>C</i> = ${f} + ${r}${X}, the number multiplied by ${X} (${r}) is the amount added for each ${c.one} — the rate.`,
        `В <i>C</i> = ${f} + ${r}${X} число при ${X} (${r}) — это сколько добавляется за каждую единицу, то есть цена за единицу.`,
        `<i>C</i> = ${f} + ${r}${X} өрнегінде ${X}-ке көбейтілген сан (${r}) — әр бірлік үшін қосылатын сома, яғни бірлік бағасы.`,
      ),
      st(
        `The constant term (${f}) is paid no matter what ${X} is — the one-time fee.`,
        `Свободный член (${f}) платится при любом ${X} — это разовая плата.`,
        `Бос мүше (${f}) ${X}-ке тәуелсіз төленеді — бұл бір реттік төлем.`,
      ),
    ),
    mc: makeMc(rng, correct, wrong, (s) => s),
  });
}

export function systems(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const x = randomInt(rng, 2, 15);
    const y = randomInt(rng, 1, 12);
    const askX = rng() < 0.5;
    const sum = x + y;
    const diff = x - y;
    const ans = askX ? x : y;
    const sys = system(`${X} + ${Y} = ${sum}`, `${X} ${MINUS} ${Y} = ${num(diff)}`);
    const exStep = askX
      ? st(
          `Add the equations: 2${X} = ${sum} + ${p(diff)} = ${sum + diff}, so ${X} = ${x}.`,
          `Сложим уравнения: 2${X} = ${sum} + ${p(diff)} = ${sum + diff}, значит ${X} = ${x}.`,
          `Теңдеулерді қосамыз: 2${X} = ${sum} + ${p(diff)} = ${sum + diff}, демек ${X} = ${x}.`,
        )
      : st(
          `Subtract the second equation from the first: 2${Y} = ${sum} ${MINUS} ${p(diff)} = ${sum - diff}, so ${Y} = ${y}.`,
          `Вычтем второе уравнение из первого: 2${Y} = ${sum} ${MINUS} ${p(diff)} = ${sum - diff}, значит ${Y} = ${y}.`,
          `Біріншіден екіншісін азайтамыз: 2${Y} = ${sum} ${MINUS} ${p(diff)} = ${sum - diff}, демек ${Y} = ${y}.`,
        );
    return mathQ('systems', d, {
      prompt: `${sys}The solution to the given system of equations is (${X}, ${Y}). What is the value of ${askX ? X : Y}?`,
      ex: steps(exStep),
      ...choose(ctx, ans, [askX ? y : x, sum, diff, sum / 2].filter(Number.isInteger)),
    });
  }
  if (d === 2) {
    let a1, b1, a2, b2, det;
    do {
      a1 = nonZero(rng, -4, 6);
      b1 = nonZero(rng, -4, 6);
      a2 = nonZero(rng, -4, 6);
      b2 = nonZero(rng, -4, 6);
      det = a1 * b2 - a2 * b1;
    } while (det === 0);
    const x = randomInt(rng, -5, 8);
    const y = randomInt(rng, -5, 8);
    const c1 = a1 * x + b1 * y;
    const c2 = a2 * x + b2 * y;
    const ask = pick(rng, ['x', 'y', 'sum']);
    const ans = ask === 'x' ? x : ask === 'y' ? y : x + y;
    const askHtml = ask === 'x' ? X : ask === 'y' ? Y : `${X} + ${Y}`;
    const eq = (a, b, c) => `${linear(a, 0)} ${b < 0 ? MINUS : '+'} ${Math.abs(b) === 1 ? '' : num(Math.abs(b))}${Y} = ${num(c)}`;
    const items = [
      st(
        `Eliminate ${X}: multiply the first equation by ${p(a2)} and the second by ${p(a1)}, then subtract.`,
        `Исключим ${X}: умножим первое уравнение на ${p(a2)}, второе — на ${p(a1)} и вычтем.`,
        `${X}-ті жоямыз: бірінші теңдеуді ${p(a2)} санына, екіншісін ${p(a1)} санына көбейтіп, азайтамыз.`,
      ),
      st(
        `(${num(a1 * b2)} ${MINUS} ${p(a2 * b1)})${Y} = ${num(a1 * c2)} ${MINUS} ${p(a2 * c1)} → ${num(det)}${Y} = ${num(det * y)} → ${Y} = ${num(y)}.`,
        `(${num(a1 * b2)} ${MINUS} ${p(a2 * b1)})${Y} = ${num(a1 * c2)} ${MINUS} ${p(a2 * c1)} → ${num(det)}${Y} = ${num(det * y)} → ${Y} = ${num(y)}.`,
        `(${num(a1 * b2)} ${MINUS} ${p(a2 * b1)})${Y} = ${num(a1 * c2)} ${MINUS} ${p(a2 * c1)} → ${num(det)}${Y} = ${num(det * y)} → ${Y} = ${num(y)}.`,
      ),
      st(
        `Substitute ${Y} = ${num(y)} into the first equation: ${linear(a1, 0)} ${plusMinus(b1 * y)} = ${num(c1)}, so ${X} = ${num(x)}.`,
        `Подставим ${Y} = ${num(y)} в первое уравнение: ${linear(a1, 0)} ${plusMinus(b1 * y)} = ${num(c1)}, откуда ${X} = ${num(x)}.`,
        `${Y} = ${num(y)} мәнін бірінші теңдеуге қоямыз: ${linear(a1, 0)} ${plusMinus(b1 * y)} = ${num(c1)}, сонда ${X} = ${num(x)}.`,
      ),
    ];
    if (ask === 'sum') {
      items.push(st(`${X} + ${Y} = ${num(x)} + ${p(y)} = ${num(x + y)}.`, `${X} + ${Y} = ${num(x)} + ${p(y)} = ${num(x + y)}.`, `${X} + ${Y} = ${num(x)} + ${p(y)} = ${num(x + y)}.`));
    }
    return mathQ('systems', d, {
      prompt: `${system(eq(a1, b1, c1), eq(a2, b2, c2))}If (${X}, ${Y}) is the solution to the given system of equations, what is the value of ${askHtml}?`,
      ex: steps(...items),
      ...choose(ctx, ans, [x - y, ask === 'x' ? y : x, x * y, -ans]),
    });
  }
  const m = randomInt(rng, 2, 4);
  const a = randomInt(rng, 1, 5);
  const b = nonZero(rng, -6, 7);
  const c1 = randomInt(rng, 1, 9);
  const c2 = m * c1 + nonZero(rng, -5, 5);
  const K = v('k');
  const eq1 = `${linear(a, 0)} + ${K}${Y} = ${c1}`;
  const eq2 = `${linear(m * a, 0)} ${m * b < 0 ? MINUS : '+'} ${num(Math.abs(m * b))}${Y} = ${num(c2)}`;
  return mathQ('systems', d, {
    prompt: `${system(eq1, eq2)}In the given system of equations, ${K} is a constant. For what value of ${K} does the system have no solution?`,
    ex: steps(
      st(
        `Two linear equations have no solution when their lines are parallel: the ${X}- and ${Y}-coefficients are proportional, but the constants are not.`,
        `Система двух линейных уравнений не имеет решений, когда прямые параллельны: коэффициенты при ${X} и ${Y} пропорциональны, а свободные члены — нет.`,
        `Екі сызықтық теңдеудің шешімі болмайды, егер түзулер параллель болса: ${X} пен ${Y} коэффициенттері пропорционал, ал бос мүшелер пропорционал емес.`,
      ),
      st(
        `The ${X}-coefficient grows by a factor of ${m} (${num(a)} → ${num(m * a)}), so ${num(m * b)} = ${m}${K}, which gives ${K} = ${num(b)}.`,
        `Коэффициент при ${X} увеличился в ${m} раза (${num(a)} → ${num(m * a)}), поэтому ${num(m * b)} = ${m}${K}, откуда ${K} = ${num(b)}.`,
        `${X} коэффициенті ${m} есе артты (${num(a)} → ${num(m * a)}), сондықтан ${num(m * b)} = ${m}${K}, демек ${K} = ${num(b)}.`,
      ),
      st(
        `Check: ${num(c2)} ≠ ${m} · ${c1} = ${m * c1}, so the lines are parallel and distinct.`,
        `Проверка: ${num(c2)} ≠ ${m} · ${c1} = ${m * c1}, значит прямые параллельны и не совпадают.`,
        `Тексеру: ${num(c2)} ≠ ${m} · ${c1} = ${m * c1}, демек түзулер параллель және беттеспейді.`,
      ),
    ),
    ...choose(ctx, b, [m * b, -b, b + m, a]),
  });
}

export function inequalities(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 2, 6);
    const x0 = randomInt(rng, -4, 9);
    const b = nonZero(rng, -12, 12);
    const c = a * x0 + b;
    const correct = x0 + randomInt(rng, 1, 3);
    const mc = makeMc(rng, correct, [x0, x0 - 1, x0 - randomInt(rng, 2, 5)]);
    return mathQ('inequalities', d, {
      prompt: `Which of the following values of ${X} satisfies the inequality ${linear(a, b)} &gt; ${num(c)}?`,
      ex: steps(
        say(moveConst(b), `${num(a)}${X} &gt; ${num(c - b)}`),
        say(P.div(num(a)), `${X} &gt; ${num(x0)}`),
        st(
          `Only ${num(correct)} is greater than ${num(x0)}. (${num(x0)} itself does not work: the inequality is strict.)`,
          `Только ${num(correct)} больше ${num(x0)}. (Само ${num(x0)} не подходит: неравенство строгое.)`,
          `Тек ${num(correct)} саны ${num(x0)} санынан үлкен. (${num(x0)} өзі жарамайды: теңсіздік қатаң.)`,
        ),
      ),
      mc,
    });
  }
  if (d === 2) {
    const a = randomInt(rng, 2, 5);
    const x0 = nonZero(rng, -6, 6);
    const b = nonZero(rng, -10, 10);
    const c = -a * x0 + b;
    const ge = '≥';
    const le = '≤';
    const correct = `${X} ${ge} ${num(x0)}`;
    const wrong = [`${X} ${le} ${num(x0)}`, `${X} ${ge} ${num(-x0)}`, `${X} ${le} ${num(-x0)}`];
    return mathQ('inequalities', d, {
      prompt: `Which of the following is the solution to the inequality ${linear(-a, b)} ${le} ${num(c)}?`,
      ex: steps(
        say(moveConst(b), `${linear(-a, 0)} ${le} ${num(c - b)}`),
        st(
          `Divide both sides by ${num(-a)}. Dividing by a negative number reverses the inequality sign: ${X} ${ge} ${num(x0)}.`,
          `Разделим обе части на ${num(-a)}. При делении на отрицательное число знак неравенства меняется: ${X} ${ge} ${num(x0)}.`,
          `Екі жағын да ${num(-a)} санына бөлеміз. Теріс санға бөлгенде теңсіздік таңбасы ауысады: ${X} ${ge} ${num(x0)}.`,
        ),
      ),
      mc: makeMc(rng, correct, wrong, (s) => s),
    });
  }
  let W;
  let F0;
  let w;
  do {
    W = 50 * randomInt(rng, 12, 24);
    F0 = randomInt(rng, 60, 95);
    w = randomInt(rng, 20, 45);
  } while ((W - F0) % w === 0);
  const q = (W - F0) / w;
  const ans = Math.floor(q);
  const N = v('n');
  return mathQ('inequalities', d, {
    prompt: `An elevator has a maximum capacity of ${num(W)} kilograms. A worker who weighs ${F0} kilograms will ride with boxes that weigh ${w} kilograms each. What is the maximum number of boxes the worker can take in one trip?`,
    ex: steps(
      st(
        `If ${N} is the number of boxes: ${F0} + ${w}${N} ≤ ${num(W)}.`,
        `Пусть ${N} — число коробок: ${F0} + ${w}${N} ≤ ${num(W)}.`,
        `${N} — жәшіктер саны болсын: ${F0} + ${w}${N} ≤ ${num(W)}.`,
      ),
      st(
        `${w}${N} ≤ ${num(W - F0)}, so ${N} ≤ ${num(W - F0)} ÷ ${w} ≈ ${q.toFixed(2)}.`,
        `${w}${N} ≤ ${num(W - F0)}, значит ${N} ≤ ${num(W - F0)} ÷ ${w} ≈ ${q.toFixed(2)}.`,
        `${w}${N} ≤ ${num(W - F0)}, демек ${N} ≤ ${num(W - F0)} ÷ ${w} ≈ ${q.toFixed(2)}.`,
      ),
      st(
        `The number of boxes must be a whole number, so the maximum is ${ans} (rounding up would exceed the limit).`,
        `Число коробок — целое, поэтому максимум ${ans} (если округлить вверх, лифт будет перегружен).`,
        `Жәшіктер саны бүтін сан болуы керек, сондықтан ең көбі ${ans} (жоғары дөңгелектесек, лифт асқын жүктеледі).`,
      ),
    ),
    ...choose(ctx, ans, [ans + 1, ans - 1, Math.floor(W / w)]),
  });
}
