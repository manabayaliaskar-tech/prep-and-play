// Арифметика: сложение и вычитание, умножение и деление, порядок действий,
// отрицательные числа, делимость, числовые закономерности.
// Каждый генератор: (ctx, d) → задание. ctx = { rng, mcOnly }, d - сложность 1…3.

import { MINUS, gcd } from '../../core/format.js';
import { pick, randomInt, shuffle } from '../../core/random.js';
import { ask, L, loc, mc, n, par, poolQ, same, steps, val, W, why } from '../gen.js';

const calc = (expr) => loc((l) => `${W.calc[l]}: ${expr}`);
const TIMES = '×';
const DIV = '÷';

export function add(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 12, 68);
    const b = randomInt(rng, 11, 29);
    const tens = Math.floor(b / 10) * 10;
    const ones = b % 10;
    if (rng() < 0.5) {
      const ans = a + b;
      return poolQ('m.add', d, {
        prompt: calc(`${a} + ${b}`),
        ex: steps(
          L('Add the tens first, then the ones.', 'Сначала прибавим десятки, потом единицы.', 'Алдымен ондықтарды, сосын бірліктерді қосамыз.'),
          same(`${a} + ${tens} = ${a + tens}, ${a + tens} + ${ones} = ${ans}`),
        ),
        ...ask(ctx, ans, [ans + 10, ans - 10, ans + 1, ans - 1]),
      });
    }
    const total = a + b;
    return poolQ('m.add', d, {
      prompt: calc(`${total} ${MINUS} ${b}`),
      ex: steps(
        L('Subtract the tens first, then the ones.', 'Сначала вычтем десятки, потом единицы.', 'Алдымен ондықтарды, сосын бірліктерді азайтамыз.'),
        same(`${total} ${MINUS} ${tens} = ${total - tens}, ${total - tens} ${MINUS} ${ones} = ${a}`),
      ),
      ...ask(ctx, a, [a + 10, a - 10, a + 1, a + 2]),
    });
  }
  if (d === 2) {
    const a = randomInt(rng, 125, 640);
    const b = randomInt(rng, 118, 359);
    if (rng() < 0.5) {
      const ans = a + b;
      const h = Math.floor(b / 100) * 100;
      return poolQ('m.add', d, {
        prompt: calc(`${a} + ${b}`),
        ex: steps(
          L('Add the hundreds, then the rest.', 'Прибавим сотни, затем остаток.', 'Жүздіктерді, сосын қалғанын қосамыз.'),
          same(`${a} + ${h} = ${a + h}, ${a + h} + ${b - h} = ${ans}`),
        ),
        ...ask(ctx, ans, [ans + 100, ans - 100, ans + 10, ans - 10]),
      });
    }
    const total = a + b;
    const h = Math.floor(b / 100) * 100;
    return poolQ('m.add', d, {
      prompt: calc(`${total} ${MINUS} ${b}`),
      ex: steps(
        L('Subtract the hundreds, then the rest.', 'Вычтем сотни, затем остаток.', 'Жүздіктерді, сосын қалғанын азайтамыз.'),
        same(`${total} ${MINUS} ${h} = ${total - h}, ${total - h} ${MINUS} ${b - h} = ${a}`),
      ),
      ...ask(ctx, a, [a + 100, a - 100, a + 10, a - 10]),
    });
  }
  const a = randomInt(rng, 1200, 4800);
  const b = randomInt(rng, 350, 990);
  const c = randomInt(rng, 150, 890);
  const ans = a - b + c;
  return poolQ('m.add', d, {
    prompt: calc(`${n(a)} ${MINUS} ${b} + ${c}`),
    ex: steps(
      L('Work from left to right.', 'Выполняем действия слева направо.', 'Амалдарды солдан оңға қарай орындаймыз.'),
      same(`${n(a)} ${MINUS} ${b} = ${n(a - b)}`),
      same(`${n(a - b)} + ${c} = ${n(ans)}`),
    ),
    ...ask(ctx, ans, [a - b - c, a + b + c, ans + 100, ans - 10]),
  });
}

export function mul(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 2, 9);
    const b = randomInt(rng, 3, 9);
    if (rng() < 0.5) {
      return poolQ('m.mul', d, {
        prompt: calc(`${a} ${TIMES} ${b}`),
        ex: steps(
          L(`From the multiplication table: ${a} ${TIMES} ${b} = ${a * b}.`, `По таблице умножения: ${a} ${TIMES} ${b} = ${a * b}.`, `Көбейту кестесі бойынша: ${a} ${TIMES} ${b} = ${a * b}.`),
        ),
        ...ask(ctx, a * b, [a * (b + 1), a * (b - 1), why(a + b, L('You added the numbers instead of multiplying.', 'Ты сложил числа вместо того, чтобы умножить.', 'Сандарды көбейтудің орнына қостың.')), a * b + 2]),
      });
    }
    return poolQ('m.mul', d, {
      prompt: calc(`${a * b} ${DIV} ${a}`),
      ex: steps(
        L(
          `Division undoes multiplication: ${a} ${TIMES} ${b} = ${a * b}, so ${a * b} ${DIV} ${a} = ${b}.`,
          `Деление обратно умножению: ${a} ${TIMES} ${b} = ${a * b}, значит ${a * b} ${DIV} ${a} = ${b}.`,
          `Бөлу - көбейтуге кері амал: ${a} ${TIMES} ${b} = ${a * b}, демек ${a * b} ${DIV} ${a} = ${b}.`,
        ),
      ),
      ...ask(ctx, b, [b + 1, b - 1, b + 2, a]),
    });
  }
  if (d === 2) {
    const a = randomInt(rng, 13, 79);
    const b = randomInt(rng, 3, 9);
    const tens = Math.floor(a / 10) * 10;
    const ones = a % 10;
    if (rng() < 0.5) {
      const ans = a * b;
      return poolQ('m.mul', d, {
        prompt: calc(`${a} ${TIMES} ${b}`),
        ex: steps(
          L('Multiply the tens and the ones separately, then add.', 'Умножим отдельно десятки и единицы, потом сложим.', 'Ондықтар мен бірліктерді бөлек көбейтіп, қосамыз.'),
          same(`${tens} ${TIMES} ${b} = ${tens * b}, ${ones} ${TIMES} ${b} = ${ones * b}`),
          same(`${tens * b} + ${ones * b} = ${ans}`),
        ),
        ...ask(ctx, ans, [ans + b, ans - b, ans + 10, tens * b]),
      });
    }
    const total = a * b;
    return poolQ('m.mul', d, {
      prompt: calc(`${total} ${DIV} ${b}`),
      ex: steps(
        L('Split the number into parts that are easy to divide.', 'Разобьём число на части, которые удобно делить.', 'Санды бөлуге ыңғайлы бөліктерге жіктейміз.'),
        same(`${total} = ${tens * b} + ${ones * b}`),
        same(`${tens * b} ${DIV} ${b} = ${tens}, ${ones * b} ${DIV} ${b} = ${ones}, ${tens} + ${ones} = ${a}`),
      ),
      ...ask(ctx, a, [a + 1, a - 1, a + 10, a - 10]),
    });
  }
  const a = randomInt(rng, 12, 48);
  const b = randomInt(rng, 11, 29);
  const bt = Math.floor(b / 10) * 10;
  const bo = b % 10;
  if (rng() < 0.5) {
    const ans = a * b;
    return poolQ('m.mul', d, {
      prompt: calc(`${a} ${TIMES} ${b}`),
      ex: steps(
        L(`Split ${b} into ${bt} + ${bo}.`, `Разложим ${b} на ${bt} + ${bo}.`, `${b} санын ${bt} + ${bo} деп жіктейміз.`),
        same(`${a} ${TIMES} ${bt} = ${a * bt}, ${a} ${TIMES} ${bo} = ${a * bo}`),
        same(`${a * bt} + ${a * bo} = ${ans}`),
      ),
      ...ask(ctx, ans, [ans + a, ans - a, ans + 10, a * bt]),
    });
  }
  const total = a * b;
  return poolQ('m.mul', d, {
    prompt: calc(`${total} ${DIV} ${b}`),
    ex: steps(
      L(`Check by multiplication: ${b} ${TIMES} ${a} = ${total}.`, `Проверим умножением: ${b} ${TIMES} ${a} = ${total}.`, `Көбейту арқылы тексереміз: ${b} ${TIMES} ${a} = ${total}.`),
      L(`So ${total} ${DIV} ${b} = ${a}.`, `Значит, ${total} ${DIV} ${b} = ${a}.`, `Демек, ${total} ${DIV} ${b} = ${a}.`),
    ),
    ...ask(ctx, a, [a + 1, a - 1, a + 2, a - 2]),
  });
}

const FIRST_MUL = L('Multiplication and division come before addition and subtraction.', 'Умножение и деление выполняются раньше сложения и вычитания.', 'Көбейту мен бөлу қосу мен азайтудан бұрын орындалады.');
const FIRST_PAR = L('Brackets come first.', 'Сначала выполняем действия в скобках.', 'Алдымен жақша ішіндегі амалдарды орындаймыз.');

export function order(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 3, 25);
    const b = randomInt(rng, 2, 9);
    const c = randomInt(rng, 2, 9);
    const ans = a + b * c;
    return poolQ('m.order', d, {
      prompt: calc(`${a} + ${b} ${TIMES} ${c}`),
      ex: steps(FIRST_MUL, same(`${b} ${TIMES} ${c} = ${b * c}`), same(`${a} + ${b * c} = ${ans}`)),
      ...ask(ctx, ans, [why((a + b) * c, L('You added first. Multiplication comes before addition.', 'Ты сначала сложил. Умножение выполняется раньше сложения.', 'Алдымен қостың. Көбейту қосудан бұрын орындалады.')), a + b + c, ans + c, a * b + c]),
    });
  }
  if (d === 2) {
    const a = randomInt(rng, 2, 12);
    const b = randomInt(rng, 3, 12);
    const c = randomInt(rng, 2, 6);
    const e = randomInt(rng, 2, 9);
    const k = randomInt(rng, 2, 9);
    const ans = (a + b) * c - e * k;
    return poolQ('m.order', d, {
      prompt: calc(`(${a} + ${b}) ${TIMES} ${c} ${MINUS} ${e} ${TIMES} ${k}`),
      ex: steps(
        FIRST_PAR,
        same(`${a} + ${b} = ${a + b}`),
        FIRST_MUL,
        same(`${a + b} ${TIMES} ${c} = ${(a + b) * c}, ${e} ${TIMES} ${k} = ${e * k}`),
        same(`${(a + b) * c} ${MINUS} ${e * k} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [a + b * c - e * k, ((a + b) * c - e) * k, ans + c, ans - k]),
    });
  }
  const a = randomInt(rng, 3, 9);
  const b = randomInt(rng, 2, 6);
  const c = randomInt(rng, 2, 7);
  const e = randomInt(rng, 2, 8);
  const ans = a * a - b * (c + e);
  return poolQ('m.order', d, {
    prompt: calc(`${a}<sup>2</sup> ${MINUS} ${b} ${TIMES} (${c} + ${e})`),
    ex: steps(
      L('Order: brackets, powers, multiplication, then subtraction.', 'Порядок: скобки, степень, умножение, затем вычитание.', 'Реті: жақша, дәреже, көбейту, сосын азайту.'),
      same(`${c} + ${e} = ${c + e}, ${a}<sup>2</sup> = ${a * a}`),
      same(`${b} ${TIMES} ${c + e} = ${b * (c + e)}`),
      same(`${a * a} ${MINUS} ${b * (c + e)} = ${n(ans)}`),
    ),
    ...ask(ctx, ans, [(a * a - b) * (c + e), a * a - b * c + e, a * 2 - b * (c + e), ans + b]),
  });
}

export function neg(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 3, 20);
    const b = randomInt(rng, a + 2, a + 25);
    if (rng() < 0.5) {
      const ans = a - b;
      return poolQ('m.neg', d, {
        prompt: calc(`${a} ${MINUS} ${b}`),
        ex: steps(
          L(
            'The number being subtracted is larger, so the result is negative.',
            'Вычитаемое больше уменьшаемого, поэтому ответ отрицательный.',
            'Азайтқыш азайғыштан үлкен, сондықтан жауап теріс болады.',
          ),
          same(`${a} ${MINUS} ${b} = ${MINUS}(${b} ${MINUS} ${a}) = ${n(ans)}`),
        ),
        ...ask(ctx, ans, [why(b - a, L('The difference is right, but the sign is lost: the subtrahend is larger, so the answer is negative.', 'Разность верная, но потерян знак: вычитаемое больше, поэтому ответ отрицательный.', 'Айырма дұрыс, бірақ таңба жоғалды: азайтқыш үлкен, сондықтан жауап теріс.')), why(-(a + b), L('You added the numbers. Here you subtract them and keep the minus.', 'Ты сложил числа. Здесь их нужно вычесть и оставить минус.', 'Сандарды қостың. Мұнда оларды азайтып, минусты қалдыру керек.')), ans - 1, ans + 2]),
      });
    }
    const ans = -a + b;
    return poolQ('m.neg', d, {
      prompt: calc(`${MINUS}${a} + ${b}`),
      ex: steps(
        L('Swap the terms: it is the same as subtracting.', 'Переставим слагаемые: это то же, что вычитание.', 'Қосылғыштардың орнын ауыстырамыз: бұл азайтумен бірдей.'),
        same(`${MINUS}${a} + ${b} = ${b} ${MINUS} ${a} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [why(-(a + b), L('A minus and a plus are different signs: subtract the smaller number from the larger one.', 'У чисел разные знаки: из большего модуля вычитают меньший, а не складывают.', 'Сандардың таңбасы әртүрлі: үлкен модульден кішісін азайтады, қоспайды.')), a + b, why(-ans, L('The sign is wrong: the positive number is larger, so the answer is positive.', 'Ошибка в знаке: положительное число больше по модулю, поэтому ответ положительный.', 'Таңба қате: оң сан модулі бойынша үлкен, сондықтан жауап оң.')), ans + 1]),
    });
  }
  if (d === 2) {
    const a = randomInt(rng, 2, 12);
    const b = randomInt(rng, 2, 12);
    const kind = randomInt(rng, 0, 2);
    if (kind === 0) {
      return poolQ('m.neg', d, {
        prompt: calc(`(${MINUS}${a}) ${TIMES} (${MINUS}${b})`),
        ex: steps(
          L('A negative times a negative is positive.', 'Произведение двух отрицательных чисел положительно.', 'Екі теріс санның көбейтіндісі оң болады.'),
          same(`(${MINUS}${a}) ${TIMES} (${MINUS}${b}) = ${a * b}`),
        ),
        ...ask(ctx, a * b, [-a * b, a + b, -(a + b), a * b + a]),
      });
    }
    if (kind === 1) {
      return poolQ('m.neg', d, {
        prompt: calc(`${a} ${MINUS} (${MINUS}${b})`),
        ex: steps(
          L('Subtracting a negative number is the same as adding.', 'Вычесть отрицательное число - то же, что прибавить положительное.', 'Теріс санды азайту - оң санды қосумен бірдей.'),
          same(`${a} ${MINUS} (${MINUS}${b}) = ${a} + ${b} = ${a + b}`),
        ),
        ...ask(ctx, a + b, [a - b, b - a, -(a + b), a + b + 1].filter((x) => x !== a + b)),
      });
    }
    return poolQ('m.neg', d, {
      prompt: calc(`${MINUS}${a} ${MINUS} ${b}`),
      ex: steps(
        L('Both numbers move left on the number line, so add them and keep the minus.', 'Оба числа сдвигают влево по числовой прямой: складываем и ставим минус.', 'Екі сан да сан түзуінде солға жылжытады: қосып, минус таңбасын қоямыз.'),
        same(`${MINUS}${a} ${MINUS} ${b} = ${MINUS}(${a} + ${b}) = ${n(-(a + b))}`),
      ),
      ...ask(ctx, -(a + b), [a + b, b - a, a - b, -(a + b) - 1].filter((x) => x !== -(a + b))),
    });
  }
  const a = randomInt(rng, 2, 9);
  const b = randomInt(rng, 2, 9);
  const c = randomInt(rng, 2, 9);
  const e = randomInt(rng, 2, 9);
  const ans = -a * b - -c * e;
  return poolQ('m.neg', d, {
    prompt: calc(`(${MINUS}${a}) ${TIMES} ${b} ${MINUS} (${MINUS}${c}) ${TIMES} ${e}`),
    ex: steps(
      L('Do the multiplications first.', 'Сначала выполним умножение.', 'Алдымен көбейтуді орындаймыз.'),
      same(`(${MINUS}${a}) ${TIMES} ${b} = ${n(-a * b)}, (${MINUS}${c}) ${TIMES} ${e} = ${n(-c * e)}`),
      same(`${n(-a * b)} ${MINUS} ${par(-c * e)} = ${n(-a * b)} + ${c * e} = ${n(ans)}`),
    ),
    ...ask(ctx, ans, [-a * b - c * e, a * b - c * e, a * b + c * e, ans + 1].filter((x) => x !== ans)),
  });
}

export function divis(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const k = pick(rng, [3, 9]);
    // Одно число делится на k, остальные три - нет.
    const good = k * randomInt(rng, 12, 110);
    const wrong = [];
    while (wrong.length < 3) {
      const cand = good + pick(rng, [-1, 1, 2, -2, 4, 5, 10, 11, -10]) + k * randomInt(rng, -3, 3);
      if (cand > 10 && cand % k !== 0 && !wrong.includes(cand)) wrong.push(cand);
    }
    const sum = String(good)
      .split('')
      .reduce((s, c) => s + Number(c), 0);
    const all = shuffle([good, ...wrong], rng);
    return poolQ('m.divis', d, {
      prompt: L(`Which number is divisible by ${k}?`, `Какое число делится на ${k}?`, `Қай сан ${k}-ке бөлінеді?`),
      ex: steps(
        L(
          `A number is divisible by ${k} if the sum of its digits is divisible by ${k}.`,
          `Число делится на ${k}, если сумма его цифр делится на ${k}.`,
          `Цифрларының қосындысы ${k}-ке бөлінсе, сан ${k}-ке бөлінеді.`,
        ),
        L(
          `For ${good} the digit sum is ${sum}, and ${sum} ${DIV} ${k} = ${sum / k}.`,
          `У числа ${good} сумма цифр равна ${sum}, а ${sum} ${DIV} ${k} = ${sum / k}.`,
          `${good} санының цифрлар қосындысы ${sum}, ал ${sum} ${DIV} ${k} = ${sum / k}.`,
        ),
      ),
      mc: { choices: all.map(String), answer: all.indexOf(good) },
    });
  }
  const g = randomInt(rng, 2, 9);
  let x = randomInt(rng, 2, 9);
  let y = randomInt(rng, 2, 9);
  while (gcd(x, y) !== 1 || x === y) {
    x = randomInt(rng, 2, 9);
    y = randomInt(rng, 3, 11);
  }
  const a = g * x;
  const b = g * y;
  if (d === 2) {
    return poolQ('m.divis', d, {
      prompt: L(
        `Find the greatest common divisor of ${a} and ${b}.`,
        `Найди наибольший общий делитель чисел ${a} и ${b}.`,
        `${a} және ${b} сандарының ең үлкен ортақ бөлгішін тап.`,
      ),
      ex: steps(
        same(`${a} = ${g} ${TIMES} ${x}, ${b} = ${g} ${TIMES} ${y}`),
        L(
          `${x} and ${y} have no common divisors other than 1, so the GCD is ${g}.`,
          `У чисел ${x} и ${y} нет общих делителей, кроме 1, поэтому НОД равен ${g}.`,
          `${x} пен ${y} сандарының 1-ден басқа ортақ бөлгіші жоқ, сондықтан ЕҮОБ ${g}-ге тең.`,
        ),
      ),
      ...ask(ctx, g, [g * 2, 1, x, y, g + 1].filter((v) => v !== g)),
    });
  }
  const lcm = g * x * y;
  return poolQ('m.divis', d, {
    prompt: L(
      `Find the least common multiple of ${a} and ${b}.`,
      `Найди наименьшее общее кратное чисел ${a} и ${b}.`,
      `${a} және ${b} сандарының ең кіші ортақ еселігін тап.`,
    ),
    ex: steps(
      same(`${a} = ${g} ${TIMES} ${x}, ${b} = ${g} ${TIMES} ${y}`),
      L(
        `LCM = GCD ${TIMES} ${x} ${TIMES} ${y} = ${g} ${TIMES} ${x} ${TIMES} ${y} = ${lcm}.`,
        `НОК = НОД ${TIMES} ${x} ${TIMES} ${y} = ${g} ${TIMES} ${x} ${TIMES} ${y} = ${lcm}.`,
        `ЕКОЕ = ЕҮОБ ${TIMES} ${x} ${TIMES} ${y} = ${g} ${TIMES} ${x} ${TIMES} ${y} = ${lcm}.`,
      ),
    ),
    ...ask(ctx, lcm, [a * b, g, lcm * 2, a + b, lcm + g].filter((v) => v !== lcm)),
  });
}

const NEXT = L('Which number comes next?', 'Какое число следующее?', 'Келесі сан қандай?');

export function seq(ctx, d) {
  const { rng } = ctx;
  const row = (items) => `${items.map(n).join(', ')}, …`;
  if (d === 1) {
    const start = randomInt(rng, 1, 20);
    const step = randomInt(rng, 2, 9) * (rng() < 0.25 ? -1 : 1);
    const base = step < 0 ? start + 60 : start;
    const items = Array.from({ length: 5 }, (_, i) => base + i * step);
    const ans = base + 5 * step;
    return poolQ('m.seq', d, {
      prompt: loc((l) => `${NEXT[l]} ${row(items)}`),
      ex: steps(
        L(
          `Each number differs from the previous one by ${n(step)}.`,
          `Каждое число отличается от предыдущего на ${n(step)}.`,
          `Әр сан алдыңғысынан ${n(step)}-ге өзгеріп отырады.`,
        ),
        same(`${n(items[4])} ${step < 0 ? MINUS : '+'} ${Math.abs(step)} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [ans + step, ans - step, ans + 1, ans - 1]),
    });
  }
  if (d === 2) {
    if (rng() < 0.5) {
      const start = randomInt(rng, 1, 5);
      const r = randomInt(rng, 2, 3);
      const items = Array.from({ length: 5 }, (_, i) => start * r ** i);
      const ans = start * r ** 5;
      return poolQ('m.seq', d, {
        prompt: loc((l) => `${NEXT[l]} ${row(items)}`),
        ex: steps(
          L(`Each number is ${r} times the previous one.`, `Каждое число в ${r} раза больше предыдущего.`, `Әр сан алдыңғысынан ${r} есе үлкен.`),
          same(`${n(items[4])} ${TIMES} ${r} = ${n(ans)}`),
        ),
        ...ask(ctx, ans, [items[4] + (items[4] - items[3]), ans + r, items[4] * (r + 1), ans - start]),
      });
    }
    const start = randomInt(rng, 1, 12);
    const first = randomInt(rng, 1, 4);
    const items = [start];
    for (let i = 0; i < 4; i++) items.push(items[i] + first + i);
    const ans = items[4] + first + 4;
    return poolQ('m.seq', d, {
      prompt: loc((l) => `${NEXT[l]} ${row(items)}`),
      ex: steps(
        L(
          `The differences grow by 1: +${first}, +${first + 1}, +${first + 2}, +${first + 3}.`,
          `Разности растут на 1: +${first}, +${first + 1}, +${first + 2}, +${first + 3}.`,
          `Айырмалар 1-ге өсіп отырады: +${first}, +${first + 1}, +${first + 2}, +${first + 3}.`,
        ),
        same(`${items[4]} + ${first + 4} = ${ans}`),
      ),
      ...ask(ctx, ans, [items[4] + first + 3, ans + 1, ans + 2, items[4] + first + 5]),
    });
  }
  if (rng() < 0.5) {
    const k = randomInt(rng, 1, 4);
    const items = Array.from({ length: 5 }, (_, i) => (i + k) ** 2);
    const ans = (5 + k) ** 2;
    return poolQ('m.seq', d, {
      prompt: loc((l) => `${NEXT[l]} ${row(items)}`),
      ex: steps(
        L(
          `These are squares: ${k}², ${k + 1}², ${k + 2}², ${k + 3}², ${k + 4}².`,
          `Это квадраты чисел: ${k}², ${k + 1}², ${k + 2}², ${k + 3}², ${k + 4}².`,
          `Бұл сандардың квадраттары: ${k}², ${k + 1}², ${k + 2}², ${k + 3}², ${k + 4}².`,
        ),
        same(`${k + 5}² = ${ans}`),
      ),
      ...ask(ctx, ans, [items[4] + (items[4] - items[3]), ans + 1, ans - 2, (k + 6) ** 2]),
    });
  }
  const a = randomInt(rng, 1, 4);
  const b = randomInt(rng, a + 1, a + 4);
  const items = [a, b];
  for (let i = 2; i < 6; i++) items.push(items[i - 1] + items[i - 2]);
  const ans = items[5] + items[4];
  return poolQ('m.seq', d, {
    prompt: loc((l) => `${NEXT[l]} ${row(items)}`),
    ex: steps(
      L('Each number is the sum of the two before it.', 'Каждое число равно сумме двух предыдущих.', 'Әр сан алдыңғы екі санның қосындысына тең.'),
      same(`${items[4]} + ${items[5]} = ${ans}`),
    ),
    ...ask(ctx, ans, [items[5] * 2, ans + 1, items[5] + items[3], ans + items[0]]),
  });
}
