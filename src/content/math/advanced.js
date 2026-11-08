// Домен «Продвинутая математика»: квадратные уравнения, тождества, показательные функции,
// функции и их композиции, нелинейные функции и системы.

import { pick, randomInt } from '../../core/random.js';
import { MINUS, linear, num, polyStr, v } from '../../core/format.js';
import { choose, makeMc, mathQ, nonZero, st, steps } from './util.js';

const X = v('x');
const Y = v('y');
const F = v('f');
const G = v('g');
const T = v('t');
const A = v('a');
const B = v('b');
const p = (n) => (n < 0 ? `(${num(n)})` : num(n));
const plusMinus = (n) => `${n < 0 ? MINUS : '+'} ${num(Math.abs(n))}`;
const same = (text) => st(text, text, text);
const factorPair = (r1, r2) => `(${linear(1, -r1)})(${linear(1, -r2)})`;

export function quadratics(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const r1 = randomInt(rng, 1, 9);
    const r2 = -randomInt(rng, 1, 9);
    const b = -(r1 + r2);
    const c = r1 * r2;
    const poly = polyStr([1, b, c]);
    return mathQ('quadratics', d, {
      prompt: `What is the positive solution to the equation ${poly} = 0?`,
      ex: steps(
        st(
          `Find two numbers whose product is ${num(c)} and whose sum is ${num(b)}: ${num(-r1)} and ${num(-r2)}.`,
          `Найдём два числа, произведение которых ${num(c)}, а сумма ${num(b)}: это ${num(-r1)} и ${num(-r2)}.`,
          `Көбейтіндісі ${num(c)}, қосындысы ${num(b)} болатын екі сан: ${num(-r1)} және ${num(-r2)}.`,
        ),
        st(
          `So ${poly} = ${factorPair(r1, r2)} = 0, and ${X} = ${num(r1)} or ${X} = ${num(r2)}.`,
          `Значит, ${poly} = ${factorPair(r1, r2)} = 0, откуда ${X} = ${num(r1)} или ${X} = ${num(r2)}.`,
          `Демек, ${poly} = ${factorPair(r1, r2)} = 0, сонда ${X} = ${num(r1)} немесе ${X} = ${num(r2)}.`,
        ),
        st(`The positive solution is ${num(r1)}.`, `Положительный корень — ${num(r1)}.`, `Оң түбір — ${num(r1)}.`),
      ),
      ...choose(ctx, r1, [r2, -r2, c, b]),
    });
  }
  if (d === 2) {
    const a = randomInt(rng, 2, 3);
    const r1 = nonZero(rng, -6, 7);
    let r2 = nonZero(rng, -6, 7);
    if (r2 === r1) r2 = r1 + 1 === 0 ? r1 + 2 : r1 + 1;
    const coefs = [a, -a * (r1 + r2), a * r1 * r2];
    const askSum = rng() < 0.6;
    const ans = askSum ? r1 + r2 : r1 * r2;
    const word = askSum ? 'sum' : 'product';
    return mathQ('quadratics', d, {
      prompt: `What is the ${word} of the solutions to the equation ${polyStr(coefs)} = 0?`,
      ex: steps(
        st(
          `Divide both sides by ${a}: ${polyStr([1, -(r1 + r2), r1 * r2])} = 0.`,
          `Разделим обе части на ${a}: ${polyStr([1, -(r1 + r2), r1 * r2])} = 0.`,
          `Екі жағын да ${a} санына бөлеміз: ${polyStr([1, -(r1 + r2), r1 * r2])} = 0.`,
        ),
        st(
          `Factor: ${factorPair(r1, r2)} = 0, so the solutions are ${num(r1)} and ${num(r2)}.`,
          `Разложим на множители: ${factorPair(r1, r2)} = 0, корни ${num(r1)} и ${num(r2)}.`,
          `Көбейткіштерге жіктейміз: ${factorPair(r1, r2)} = 0, түбірлері ${num(r1)} және ${num(r2)}.`,
        ),
        askSum
          ? st(
              `Sum: ${num(r1)} + ${p(r2)} = ${num(ans)}. (Shortcut: the sum of the solutions of ${A}${X}<sup>2</sup> + ${B}${X} + <i>c</i> = 0 is ${MINUS}${B}/${A}.)`,
              `Сумма: ${num(r1)} + ${p(r2)} = ${num(ans)}. (Быстрый способ — теорема Виета: сумма корней равна ${MINUS}${B}/${A}.)`,
              `Қосынды: ${num(r1)} + ${p(r2)} = ${num(ans)}. (Қысқа жол — Виет теоремасы: түбірлер қосындысы ${MINUS}${B}/${A}.)`,
            )
          : st(
              `Product: ${num(r1)} · ${p(r2)} = ${num(ans)}. (Shortcut: the product of the solutions is <i>c</i>/${A}.)`,
              `Произведение: ${num(r1)} · ${p(r2)} = ${num(ans)}. (Быстрый способ — теорема Виета: произведение корней равно <i>c</i>/${A}.)`,
              `Көбейтінді: ${num(r1)} · ${p(r2)} = ${num(ans)}. (Қысқа жол — Виет теоремасы: түбірлер көбейтіндісі <i>c</i>/${A}.)`,
            ),
      ),
      ...choose(ctx, ans, askSum ? [-(r1 + r2), r1 * r2, coefs[1], r1 - r2] : [-(r1 * r2), r1 + r2, coefs[2], a * r1 * r2 + 1]),
    });
  }
  if (rng() < 0.5) {
    const h = nonZero(rng, -7, 7);
    const b = 2 * h;
    const K = v('k');
    return mathQ('quadratics', d, {
      prompt: `In the equation ${polyStr([1, b, 0])} + ${K} = 0, ${K} is a constant. If the equation has exactly one real solution, what is the value of ${K}?`,
      ex: steps(
        st(
          `A quadratic has exactly one real solution when its discriminant is zero: ${B}<sup>2</sup> ${MINUS} 4${A}<i>c</i> = 0.`,
          `Квадратное уравнение имеет ровно один корень, когда дискриминант равен нулю: ${B}<sup>2</sup> ${MINUS} 4${A}<i>c</i> = 0.`,
          `Квадрат теңдеудің дәл бір түбірі болады, егер дискриминант нөлге тең болса: ${B}<sup>2</sup> ${MINUS} 4${A}<i>c</i> = 0.`,
        ),
        same(`${p(b)}<sup>2</sup> ${MINUS} 4 · 1 · ${K} = 0 → ${b * b} = 4${K} → ${K} = ${h * h}.`),
      ),
      ...choose(ctx, h * h, [b, -(h * h), b * b, Math.abs(h)]),
    });
  }
  const a = randomInt(rng, 1, 5);
  const b = randomInt(rng, -9, 9);
  const c = nonZero(rng, -9, 9);
  const D = b * b - 4 * a * c;
  const options = ['Zero', 'Exactly one', 'Exactly two', 'Infinitely many'];
  const correct = D > 0 ? options[2] : D === 0 ? options[1] : options[0];
  const verdict =
    D > 0
      ? st('D &gt; 0, so there are exactly two real solutions.', 'D &gt; 0, значит действительных корней ровно два.', 'D &gt; 0, демек нақты түбірлер дәл екеу.')
      : D === 0
        ? st('D = 0, so there is exactly one real solution.', 'D = 0, значит корень ровно один.', 'D = 0, демек түбір дәл біреу.')
        : st('D &lt; 0, so there are no real solutions.', 'D &lt; 0, значит действительных корней нет.', 'D &lt; 0, демек нақты түбірлер жоқ.');
  return mathQ('quadratics', d, {
    prompt: `How many distinct real solutions does the equation ${polyStr([a, b, c])} = 0 have?`,
    ex: steps(
      st(
        `Compute the discriminant D = ${B}<sup>2</sup> ${MINUS} 4${A}<i>c</i>.`,
        `Найдём дискриминант D = ${B}<sup>2</sup> ${MINUS} 4${A}<i>c</i>.`,
        `Дискриминантты табамыз: D = ${B}<sup>2</sup> ${MINUS} 4${A}<i>c</i>.`,
      ),
      same(`D = ${p(b)}<sup>2</sup> ${MINUS} 4 · ${a} · ${p(c)} = ${b * b} ${MINUS} ${p(4 * a * c)} = ${num(D)}.`),
      verdict,
    ),
    mc: makeMc(rng, correct, options.filter((o) => o !== correct), (s) => s),
  });
}

export function equivalent(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = nonZero(rng, -9, 9);
    let b = nonZero(rng, -9, 9);
    if (a + b === 0) b += b > 0 ? 1 : -1;
    const correct = polyStr([1, a + b, a * b]);
    const wrong = [polyStr([1, a + b, -a * b]), polyStr([1, -(a + b), a * b]), polyStr([1, 0, a * b])];
    return mathQ('equivalent', d, {
      prompt: `Which expression is equivalent to (${linear(1, a)})(${linear(1, b)})?`,
      ex: steps(
        st(
          `Multiply every term of the first factor by every term of the second: ${X}<sup>2</sup> ${plusMinus(b)}${X} ${plusMinus(a)}${X} ${plusMinus(a * b)}.`,
          `Умножим каждое слагаемое первой скобки на каждое слагаемое второй: ${X}<sup>2</sup> ${plusMinus(b)}${X} ${plusMinus(a)}${X} ${plusMinus(a * b)}.`,
          `Бірінші жақшаның әр мүшесін екінші жақшаның әр мүшесіне көбейтеміз: ${X}<sup>2</sup> ${plusMinus(b)}${X} ${plusMinus(a)}${X} ${plusMinus(a * b)}.`,
        ),
        st(`Combine like terms: ${correct}.`, `Приведём подобные: ${correct}.`, `Ұқсас мүшелерді біріктіреміз: ${correct}.`),
      ),
      mc: makeMc(rng, correct, wrong, (s) => s),
    });
  }
  if (d === 2) {
    const k = randomInt(rng, 2, 5);
    const m = randomInt(rng, 1, 9);
    if (rng() < 0.5) {
      const correct = `(${linear(k, -m)})(${linear(k, m)})`;
      const wrong = [`(${linear(k, -m)})<sup>2</sup>`, `(${linear(k, m)})<sup>2</sup>`, `(${linear(k * k, -m)})(${linear(1, m)})`];
      return mathQ('equivalent', d, {
        prompt: `Which expression is equivalent to ${polyStr([k * k, 0, -m * m])}?`,
        ex: steps(
          st(
            `This is a difference of squares: ${A}<sup>2</sup> ${MINUS} ${B}<sup>2</sup> = (${A} ${MINUS} ${B})(${A} + ${B}).`,
            `Это разность квадратов: ${A}<sup>2</sup> ${MINUS} ${B}<sup>2</sup> = (${A} ${MINUS} ${B})(${A} + ${B}).`,
            `Бұл квадраттар айырмасы: ${A}<sup>2</sup> ${MINUS} ${B}<sup>2</sup> = (${A} ${MINUS} ${B})(${A} + ${B}).`,
          ),
          st(
            `Here ${A} = ${linear(k, 0)} and ${B} = ${m}, so the answer is ${correct}.`,
            `Здесь ${A} = ${linear(k, 0)}, ${B} = ${m}, поэтому ответ ${correct}.`,
            `Мұнда ${A} = ${linear(k, 0)}, ${B} = ${m}, сондықтан жауап ${correct}.`,
          ),
        ),
        mc: makeMc(rng, correct, wrong, (s) => s),
      });
    }
    const correct = polyStr([k * k, 2 * k * m, m * m]);
    const wrong = [polyStr([k * k, 0, m * m]), polyStr([k * k, k * m, m * m]), polyStr([k, 2 * k * m, m * m])];
    return mathQ('equivalent', d, {
      prompt: `Which expression is equivalent to (${linear(k, m)})<sup>2</sup>?`,
      ex: steps(
        st(
          `Use (${A} + ${B})<sup>2</sup> = ${A}<sup>2</sup> + 2${A}${B} + ${B}<sup>2</sup> with ${A} = ${linear(k, 0)}, ${B} = ${m}.`,
          `Формула (${A} + ${B})<sup>2</sup> = ${A}<sup>2</sup> + 2${A}${B} + ${B}<sup>2</sup>, где ${A} = ${linear(k, 0)}, ${B} = ${m}.`,
          `(${A} + ${B})<sup>2</sup> = ${A}<sup>2</sup> + 2${A}${B} + ${B}<sup>2</sup> формуласы, мұнда ${A} = ${linear(k, 0)}, ${B} = ${m}.`,
        ),
        same(`${k * k}${X}<sup>2</sup> + 2 · ${linear(k, 0)} · ${m} + ${m * m} = ${correct}.`),
        st(
          `Common trap: (${A} + ${B})<sup>2</sup> is NOT ${A}<sup>2</sup> + ${B}<sup>2</sup> — don't forget the middle term.`,
          `Частая ошибка: (${A} + ${B})<sup>2</sup> — это НЕ ${A}<sup>2</sup> + ${B}<sup>2</sup>, не забывай среднее слагаемое.`,
          `Жиі қате: (${A} + ${B})<sup>2</sup> ≠ ${A}<sup>2</sup> + ${B}<sup>2</sup>, ортаңғы мүшені ұмытпа.`,
        ),
      ),
      mc: makeMc(rng, correct, wrong, (s) => s),
    });
  }
  const s = randomInt(rng, 1, 5);
  const k = randomInt(rng, 2, 4);
  const a = randomInt(rng, 2, 5);
  const b = nonZero(rng, -6, 6);
  const rhs = polyStr([a * k, a * b + s * k, s * b]);
  return mathQ('equivalent', d, {
    prompt: `If (${A}${X} + ${s})(${k}${X} + ${B}) = ${rhs} for all values of ${X}, where ${A} and ${B} are constants, what is the value of ${A} + ${B}?`,
    ex: steps(
      st(
        `Expand the left side: ${k}${A}${X}<sup>2</sup> + (${A}${B} + ${s * k})${X} + ${s}${B}.`,
        `Раскроем скобки слева: ${k}${A}${X}<sup>2</sup> + (${A}${B} + ${s * k})${X} + ${s}${B}.`,
        `Сол жақтағы жақшаларды ашамыз: ${k}${A}${X}<sup>2</sup> + (${A}${B} + ${s * k})${X} + ${s}${B}.`,
      ),
      st(
        `Match the ${X}<sup>2</sup>-terms: ${k}${A} = ${a * k}, so ${A} = ${a}. Match the constants: ${s}${B} = ${num(s * b)}, so ${B} = ${num(b)}.`,
        `Сравним коэффициенты при ${X}<sup>2</sup>: ${k}${A} = ${a * k}, значит ${A} = ${a}. Свободные члены: ${s}${B} = ${num(s * b)}, значит ${B} = ${num(b)}.`,
        `${X}<sup>2</sup> коэффициенттерін теңестіреміз: ${k}${A} = ${a * k}, демек ${A} = ${a}. Бос мүшелер: ${s}${B} = ${num(s * b)}, демек ${B} = ${num(b)}.`,
      ),
      st(
        `Check the middle term: ${a} · ${p(b)} + ${s * k} = ${num(a * b + s * k)} ✓. So ${A} + ${B} = ${num(a + b)}.`,
        `Проверим среднее слагаемое: ${a} · ${p(b)} + ${s * k} = ${num(a * b + s * k)} ✓. Значит, ${A} + ${B} = ${num(a + b)}.`,
        `Ортаңғы мүшені тексереміз: ${a} · ${p(b)} + ${s * k} = ${num(a * b + s * k)} ✓. Демек, ${A} + ${B} = ${num(a + b)}.`,
      ),
    ),
    ...choose(ctx, a + b, [a * b, a - b, a * k + s * b, b]),
  });
}

export function exponential(ctx, d) {
  const { rng } = ctx;
  const pct = (x) => `${num(x)}%`;
  if (d === 1) {
    const A0 = pick(rng, [200, 300, 500, 800, 1200, 1500]);
    const r = pick(rng, [2, 3, 4, 5, 6, 8, 10, 12, 15]);
    const factor = (1 + r / 100).toFixed(2);
    const model = `<i>S</i>(${T}) = ${num(A0)}(${factor})<sup>${T}</sup>`;
    const intro = `The function ${model} gives the number of subscribers to a video channel ${T} months after it was created.`;
    if (rng() < 0.5) {
      return mathQ('exponential', d, {
        prompt: `${intro} How many subscribers did the channel have when it was created?`,
        ex: steps(
          st(
            `"When it was created" means ${T} = 0. Any number to the power 0 equals 1.`,
            `«Когда канал создали» — это ${T} = 0. Любое число в степени 0 равно 1.`,
            `«Арна ашылғанда» — бұл ${T} = 0. Кез келген санның 0 дәрежесі 1-ге тең.`,
          ),
          same(`<i>S</i>(0) = ${num(A0)} · 1 = ${num(A0)}.`),
        ),
        ...choose(ctx, A0, [Math.round(A0 * (1 + r / 100)), r, (A0 * r) / 100]),
      });
    }
    return mathQ('exponential', d, {
      prompt: `${intro} By what percent does the number of subscribers increase each month?`,
      ex: steps(
        st(
          `In a model ${A}(1 + <i>r</i>)<sup>${T}</sup>, the growth rate is <i>r</i>. Here 1 + <i>r</i> = ${factor}, so <i>r</i> = ${(r / 100).toFixed(2)} = ${r}%.`,
          `В модели ${A}(1 + <i>r</i>)<sup>${T}</sup> скорость роста равна <i>r</i>. Здесь 1 + <i>r</i> = ${factor}, значит <i>r</i> = ${(r / 100).toFixed(2)} = ${r}%.`,
          `${A}(1 + <i>r</i>)<sup>${T}</sup> моделінде өсу қарқыны — <i>r</i>. Мұнда 1 + <i>r</i> = ${factor}, демек <i>r</i> = ${(r / 100).toFixed(2)} = ${r}%.`,
        ),
      ),
      mc: makeMc(rng, r, [100 + r, Number(factor), r / 100], pct),
    });
  }
  if (d === 2) {
    const A0 = pick(rng, [100, 250, 400, 600, 1200]);
    const k = randomInt(rng, 2, 6);
    const correct = `${num(A0)}(2)<sup>${T}/${k}</sup>`;
    const wrong = [`${num(A0)}(2)<sup>${k}${T}</sup>`, `${num(A0)}(${k})<sup>${T}/2</sup>`, `2(${num(A0)})<sup>${T}/${k}</sup>`, `${num(A0)}(0.5)<sup>${T}/${k}</sup>`];
    return mathQ('exponential', d, {
      prompt: `A sample contains ${num(A0)} bacteria, and the number of bacteria doubles every ${k} hours. Which function gives the number of bacteria ${T} hours from now?`,
      ex: steps(
        st(
          `The starting amount is ${num(A0)} and each doubling multiplies by 2.`,
          `Начальное количество — ${num(A0)}, каждое удвоение умножает на 2.`,
          `Бастапқы саны — ${num(A0)}, әр екі еселену 2-ге көбейтеді.`,
        ),
        st(
          `In ${T} hours there are ${T}/${k} doublings (for example, ${2 * k} hours → 2 doublings). So the function is ${correct}.`,
          `За ${T} часов происходит ${T}/${k} удвоений (например, за ${2 * k} часов — 2 удвоения). Значит, функция ${correct}.`,
          `${T} сағатта ${T}/${k} рет екі еселенеді (мысалы, ${2 * k} сағатта — 2 рет). Демек, функция ${correct}.`,
        ),
      ),
      mc: makeMc(rng, correct, wrong, (s) => s),
    });
  }
  const V = pick(rng, [18000, 24000, 30000, 36000]);
  const r = pick(rng, [10, 12, 15, 20, 25]);
  const N = v('n');
  const keep = (1 - r / 100).toFixed(2);
  const correct = `${num(V)}(${keep})<sup>${N}</sup>`;
  const wrong = [
    `${num(V)}(${(r / 100).toFixed(2)})<sup>${N}</sup>`,
    `${num(V)}(${(1 + r / 100).toFixed(2)})<sup>${N}</sup>`,
    `${num(V)} ${MINUS} ${(r / 100).toFixed(2)}${N}`,
  ];
  return mathQ('exponential', d, {
    prompt: `A car was bought for $${num(V)}. Its value decreases by ${r}% each year. Which expression gives the value of the car, in dollars, ${N} years after it was bought?`,
    ex: steps(
      st(
        `Losing ${r}% means keeping ${100 - r}% each year, so the value is multiplied by ${keep} every year.`,
        `Потерять ${r}% — значит сохранить ${100 - r}%, поэтому каждый год стоимость умножается на ${keep}.`,
        `${r}% жоғалту — ${100 - r}% сақтау деген сөз, сондықтан құны жыл сайын ${keep} санына көбейеді.`,
      ),
      st(
        `After ${N} years: ${correct}. Trap: ${(r / 100).toFixed(2)} is the part that is lost, not the part that remains.`,
        `Через ${N} лет: ${correct}. Ловушка: ${(r / 100).toFixed(2)} — это теряемая часть, а не оставшаяся.`,
        `${N} жылдан кейін: ${correct}. Тұзақ: ${(r / 100).toFixed(2)} — жоғалатын бөлік, қалатын бөлік емес.`,
      ),
    ),
    mc: makeMc(rng, correct, wrong, (s) => s),
  });
}

export function functions(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = pick(rng, [1, 1, 2, 3, -1]);
    const b = randomInt(rng, -6, 6);
    const c = randomInt(rng, -9, 9);
    const k = nonZero(rng, -3, 4);
    const ans = a * k * k + b * k + c;
    return mathQ('functions', d, {
      prompt: `If ${F}(${X}) = ${polyStr([a, b, c])}, what is the value of ${F}(${num(k)})?`,
      ex: steps(
        st(
          `Substitute ${X} = ${num(k)} everywhere: ${num(a)} · ${p(k)}<sup>2</sup> + ${p(b)} · ${p(k)} + ${p(c)}.`,
          `Подставим ${X} = ${num(k)} везде: ${num(a)} · ${p(k)}<sup>2</sup> + ${p(b)} · ${p(k)} + ${p(c)}.`,
          `Барлық жерге ${X} = ${num(k)} қоямыз: ${num(a)} · ${p(k)}<sup>2</sup> + ${p(b)} · ${p(k)} + ${p(c)}.`,
        ),
        same(`= ${num(a * k * k)} + ${p(b * k)} + ${p(c)} = ${num(ans)}.`),
      ),
      ...choose(ctx, ans, [a * k * k - b * k + c, -a * k * k + b * k + c, 2 * a * k + b * k + c]),
    });
  }
  if (d === 2) {
    const m = nonZero(rng, -3, 4);
    const n = randomInt(rng, -6, 6);
    const q = randomInt(rng, -5, 5);
    const k = nonZero(rng, -3, 3);
    const f = (x) => m * x + n;
    const g = (x) => x * x + q;
    const fOfG = rng() < 0.5;
    const inner = fOfG ? g(k) : f(k);
    const ans = fOfG ? f(inner) : g(inner);
    const outerName = fOfG ? F : G;
    const innerName = fOfG ? G : F;
    return mathQ('functions', d, {
      prompt: `The functions ${F} and ${G} are defined by ${F}(${X}) = ${linear(m, n)} and ${G}(${X}) = ${polyStr([1, 0, q])}. What is the value of ${outerName}(${innerName}(${num(k)}))?`,
      ex: steps(
        st(
          `Work from the inside out: ${innerName}(${num(k)}) = ${num(inner)}.`,
          `Считаем изнутри наружу: ${innerName}(${num(k)}) = ${num(inner)}.`,
          `Іштен сыртқа қарай есептейміз: ${innerName}(${num(k)}) = ${num(inner)}.`,
        ),
        st(
          `Then ${outerName}(${num(inner)}) = ${num(ans)}.`,
          `Затем ${outerName}(${num(inner)}) = ${num(ans)}.`,
          `Содан кейін ${outerName}(${num(inner)}) = ${num(ans)}.`,
        ),
      ),
      ...choose(ctx, ans, [fOfG ? g(f(k)) : f(g(k)), f(k) * g(k), f(k) + g(k)]),
    });
  }
  const a = nonZero(rng, -3, 4);
  const c = randomInt(rng, -8, 10);
  const f2 = 4 * a + c;
  const ans = 9 * a + c;
  return mathQ('functions', d, {
    prompt: `The function ${F} is defined by ${F}(${X}) = ${A}${X}<sup>2</sup> + <i>c</i>, where ${A} and <i>c</i> are constants. If ${F}(0) = ${num(c)} and ${F}(2) = ${num(f2)}, what is the value of ${F}(3)?`,
    ex: steps(
      st(`${F}(0) = <i>c</i>, so <i>c</i> = ${num(c)}.`, `${F}(0) = <i>c</i>, значит <i>c</i> = ${num(c)}.`, `${F}(0) = <i>c</i>, демек <i>c</i> = ${num(c)}.`),
      st(
        `${F}(2) = 4${A} + ${p(c)} = ${num(f2)}, so 4${A} = ${num(4 * a)} and ${A} = ${num(a)}.`,
        `${F}(2) = 4${A} + ${p(c)} = ${num(f2)}, значит 4${A} = ${num(4 * a)} и ${A} = ${num(a)}.`,
        `${F}(2) = 4${A} + ${p(c)} = ${num(f2)}, демек 4${A} = ${num(4 * a)}, ${A} = ${num(a)}.`,
      ),
      same(`${F}(3) = 9 · ${p(a)} + ${p(c)} = ${num(ans)}.`),
    ),
    ...choose(ctx, ans, [6 * a + c, 9 * a, 3 * a + c]),
  });
}

export function nonlinear(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 1, 4);
    const h = nonZero(rng, -6, 6);
    const k = randomInt(rng, -9, 9);
    const fx = `${a === 1 ? '' : a}(${linear(1, -h)})<sup>2</sup> ${k === 0 ? '' : plusMinus(k)}`.trim();
    const askMin = rng() < 0.5;
    const ans = askMin ? k : h;
    return mathQ('nonlinear', d, {
      prompt: askMin
        ? `What is the minimum value of the function ${F}(${X}) = ${fx}?`
        : `The function ${F}(${X}) = ${fx} reaches its minimum value at ${X} = <i>m</i>. What is the value of <i>m</i>?`,
      ex: steps(
        st(
          `A square is never negative, so ${a === 1 ? '' : a}(${linear(1, -h)})<sup>2</sup> ≥ 0, and it equals 0 when ${X} = ${num(h)}.`,
          `Квадрат не бывает отрицательным: ${a === 1 ? '' : a}(${linear(1, -h)})<sup>2</sup> ≥ 0, и он равен 0 при ${X} = ${num(h)}.`,
          `Квадрат теріс болмайды: ${a === 1 ? '' : a}(${linear(1, -h)})<sup>2</sup> ≥ 0, ол ${X} = ${num(h)} болғанда 0-ге тең.`,
        ),
        st(
          `So the vertex is (${num(h)}, ${num(k)}): the minimum value is ${num(k)}, reached at ${X} = ${num(h)}.`,
          `Значит, вершина (${num(h)}, ${num(k)}): минимум равен ${num(k)} и достигается при ${X} = ${num(h)}.`,
          `Демек, төбесі (${num(h)}, ${num(k)}): ең кіші мән ${num(k)}, ол ${X} = ${num(h)} кезінде.`,
        ),
      ),
      ...choose(ctx, ans, askMin ? [h, -k, -h, k + a] : [-h, k, a, -k]),
    });
  }
  if (d === 2) {
    const h = nonZero(rng, -6, 6);
    const b = -2 * h;
    const c = randomInt(rng, -10, 12);
    const ans = c - h * h;
    return mathQ('nonlinear', d, {
      prompt: `What is the minimum value of the function ${F}(${X}) = ${polyStr([1, b, c])}?`,
      ex: steps(
        st(
          `The vertex of a parabola ${A}${X}<sup>2</sup> + ${B}${X} + <i>c</i> is at ${X} = ${MINUS}${B}/(2${A}) = ${MINUS}${p(b)}/2 = ${num(h)}.`,
          `Вершина параболы ${A}${X}<sup>2</sup> + ${B}${X} + <i>c</i> находится в ${X} = ${MINUS}${B}/(2${A}) = ${MINUS}${p(b)}/2 = ${num(h)}.`,
          `${A}${X}<sup>2</sup> + ${B}${X} + <i>c</i> параболасының төбесі ${X} = ${MINUS}${B}/(2${A}) = ${MINUS}${p(b)}/2 = ${num(h)} нүктесінде.`,
        ),
        same(`${F}(${num(h)}) = ${p(h)}<sup>2</sup> + ${p(b)} · ${p(h)} + ${p(c)} = ${h * h} ${MINUS} ${2 * h * h} + ${p(c)} = ${num(ans)}.`),
      ),
      ...choose(ctx, ans, [h, c, c + h * h, -ans]),
    });
  }
  const r1 = randomInt(rng, -5, 6);
  let r2 = randomInt(rng, -5, 6);
  if (r2 === r1) r2 += 2;
  const m = nonZero(rng, -3, 3);
  const n = randomInt(rng, -6, 6);
  const B1 = m - (r1 + r2);
  const C1 = n + r1 * r2;
  const sub = (i) => `<i>x</i><sub>${i}</sub>`;
  return mathQ('nonlinear', d, {
    prompt: `The graphs of ${Y} = ${polyStr([1, B1, C1])} and ${Y} = ${linear(m, n)} intersect at the points (${sub(1)}, <i>y</i><sub>1</sub>) and (${sub(2)}, <i>y</i><sub>2</sub>). What is the value of ${sub(1)} + ${sub(2)}?`,
    ex: steps(
      st(
        `At an intersection the ${Y}-values are equal: ${polyStr([1, B1, C1])} = ${linear(m, n)}.`,
        `В точках пересечения значения ${Y} равны: ${polyStr([1, B1, C1])} = ${linear(m, n)}.`,
        `Қиылысу нүктелерінде ${Y} мәндері тең: ${polyStr([1, B1, C1])} = ${linear(m, n)}.`,
      ),
      st(
        `Move everything to one side: ${polyStr([1, B1 - m, C1 - n])} = 0, which factors as ${factorPair(r1, r2)} = 0.`,
        `Перенесём всё в одну часть: ${polyStr([1, B1 - m, C1 - n])} = 0, это ${factorPair(r1, r2)} = 0.`,
        `Барлығын бір жаққа шығарамыз: ${polyStr([1, B1 - m, C1 - n])} = 0, яғни ${factorPair(r1, r2)} = 0.`,
      ),
      st(
        `So ${sub(1)} + ${sub(2)} = ${num(r1)} + ${p(r2)} = ${num(r1 + r2)}.`,
        `Значит, ${sub(1)} + ${sub(2)} = ${num(r1)} + ${p(r2)} = ${num(r1 + r2)}.`,
        `Демек, ${sub(1)} + ${sub(2)} = ${num(r1)} + ${p(r2)} = ${num(r1 + r2)}.`,
      ),
    ),
    ...choose(ctx, r1 + r2, [-(r1 + r2), r1 * r2, B1, m]),
  });
}
