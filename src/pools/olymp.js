// Олимпиадная математика: задачи с идеей. Три уровня: 1 - 5-6 классы, 2 - 7-8 классы, 3 - 9-11 классы.
// Каждый генератор: (ctx, уровень) → задание. В q.meta лежат параметры задачи:
// по ним тесты пересчитывают ответ полным перебором.

import { gcd } from '../core/format.js';
import { pick, randomInt, shuffle } from '../core/random.js';
import { L, ask, askFrac, n, plural, poolQ, same, steps } from './gen.js';
import { frac } from './math/fractions.js';

const TIMES = '×';
const DIV = '÷';
const MINUS = '−';

function make(topic, d, meta, parts) {
  const q = poolQ(topic, d, parts);
  q.meta = meta;
  return q;
}

const coprimePair = (rng, lo, hi) => {
  let a;
  let b;
  do {
    a = randomInt(rng, lo, hi);
    b = randomInt(rng, lo, hi);
  } while (a >= b || gcd(a, b) !== 1);
  return [a, b];
};

// ---------- Подсчёт: формула включений и исключений ----------

export function counting(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 3, 9);
    const N = randomInt(rng, 50, 200);
    const ans = Math.floor(N / a);
    return make('o.count', d, { kind: 'div1', N, a }, {
      prompt: L(
        `How many integers from 1 to ${N} are divisible by ${a}?`,
        `Сколько целых чисел от 1 до ${N} делятся на ${a}?`,
        `1-ден ${N}-ге дейінгі бүтін сандардың нешеуі ${a}-ге бөлінеді?`,
      ),
      ex: steps(
        L(
          `Every ${a}-th number is divisible by ${a}: ${a}, ${2 * a}, ${3 * a}, …`,
          `На ${a} делится каждое ${a}-е число: ${a}, ${2 * a}, ${3 * a}, …`,
          `${a}-ге әрбір ${a}-ші сан бөлінеді: ${a}, ${2 * a}, ${3 * a}, …`,
        ),
        L(
          `${N} ${DIV} ${a} = ${ans} with a remainder of ${N % a}, so there are ${ans} such numbers.`,
          `${N} ${DIV} ${a} = ${ans} (остаток ${N % a}), значит таких чисел ${ans}.`,
          `${N} ${DIV} ${a} = ${ans} (қалдық ${N % a}), демек мұндай сандар ${ans}.`,
        ),
      ),
      ...ask(ctx, ans, [ans + 1, ans - 1, N - a, ans + 2]),
    });
  }
  const [a, b] = coprimePair(rng, 2, 7);
  const N = 10 * randomInt(rng, 6, 30);
  const na = Math.floor(N / a);
  const nb = Math.floor(N / b);
  const nab = Math.floor(N / (a * b));
  const either = na + nb - nab;
  if (d === 2) {
    return make('o.count', d, { kind: 'div2', N, a, b }, {
      prompt: L(
        `How many integers from 1 to ${N} are divisible by ${a} or by ${b}?`,
        `Сколько целых чисел от 1 до ${N} делятся на ${a} или на ${b}?`,
        `1-ден ${N}-ге дейінгі бүтін сандардың нешеуі ${a}-ге немесе ${b}-ге бөлінеді?`,
      ),
      ex: steps(
        L(`Divisible by ${a}: ${na}. Divisible by ${b}: ${nb}.`, `Делятся на ${a}: ${na}. Делятся на ${b}: ${nb}.`, `${a}-ге бөлінетіндер: ${na}. ${b}-ге бөлінетіндер: ${nb}.`),
        L(
          `Numbers divisible by both (by ${a * b}) were counted twice: there are ${nab} of them.`,
          `Числа, которые делятся на оба (то есть на ${a * b}), посчитаны дважды: их ${nab}.`,
          `Екеуіне де (яғни ${a * b}-ге) бөлінетін сандар екі рет саналды: олар ${nab}.`,
        ),
        same(`${na} + ${nb} ${MINUS} ${nab} = ${either}`),
      ),
      ...ask(ctx, either, [na + nb, na + nb + nab, either - 1, na * nb].filter((v) => v !== either)),
    });
  }
  const neither = N - either;
  return make('o.count', d, { kind: 'div3', N, a, b }, {
    prompt: L(
      `How many integers from 1 to ${N} are divisible neither by ${a} nor by ${b}?`,
      `Сколько целых чисел от 1 до ${N} не делятся ни на ${a}, ни на ${b}?`,
      `1-ден ${N}-ге дейінгі бүтін сандардың нешеуі ${a}-ге де, ${b}-ге де бөлінбейді?`,
    ),
    ex: steps(
      L(
        `First count the numbers divisible by ${a} or by ${b}: ${na} + ${nb} ${MINUS} ${nab} = ${either}.`,
        `Сначала найдём, сколько чисел делятся на ${a} или на ${b}: ${na} + ${nb} ${MINUS} ${nab} = ${either}.`,
        `Алдымен ${a}-ге немесе ${b}-ге бөлінетін сандарды санаймыз: ${na} + ${nb} ${MINUS} ${nab} = ${either}.`,
      ),
      L(`All the rest are suitable: ${N} ${MINUS} ${either} = ${neither}.`, `Все остальные подходят: ${N} ${MINUS} ${either} = ${neither}.`, `Қалғандарының бәрі сәйкес келеді: ${N} ${MINUS} ${either} = ${neither}.`),
    ),
    ...ask(ctx, neither, [N - na - nb, either, neither + nab, neither - 1].filter((v) => v !== neither)),
  });
}

// ---------- Последняя цифра ----------

const cycleOf = (a) => {
  const seen = [];
  let x = a % 10;
  while (!seen.includes(x)) {
    seen.push(x);
    x = (x * a) % 10;
  }
  return seen;
};

export function lastDigit(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const f = [randomInt(rng, 12, 99), randomInt(rng, 12, 99), randomInt(rng, 12, 99)];
    const ans = ((f[0] % 10) * (f[1] % 10) * (f[2] % 10)) % 10;
    return make('o.digit', d, { kind: 'prod', f }, {
      prompt: L(
        `What is the last digit of the product ${f.join(` ${TIMES} `)}?`,
        `Какой цифрой оканчивается произведение ${f.join(` ${TIMES} `)}?`,
        `${f.join(` ${TIMES} `)} көбейтіндісі қандай цифрмен аяқталады?`,
      ),
      ex: steps(
        L(
          'The last digit of a product depends only on the last digits of the factors.',
          'Последняя цифра произведения зависит только от последних цифр множителей.',
          'Көбейтіндінің соңғы цифры тек көбейткіштердің соңғы цифрларына тәуелді.',
        ),
        same(`${f[0] % 10} ${TIMES} ${f[1] % 10} ${TIMES} ${f[2] % 10} = ${(f[0] % 10) * (f[1] % 10) * (f[2] % 10)} → ${ans}`),
      ),
      ...ask(ctx, ans, [(ans + 2) % 10, (ans + 5) % 10, (ans + 7) % 10, (ans + 4) % 10]),
    });
  }
  const digitPow = (a, e) => {
    const c = cycleOf(a);
    return c[(e - 1) % c.length];
  };
  const explain = (a, e) => {
    const c = cycleOf(a);
    const r = ((e - 1) % c.length) + 1;
    return L(
      `The last digits of the powers of ${a} repeat with period ${c.length}: ${c.join(', ')}. Since ${e} = ${c.length} ${TIMES} ${Math.floor((e - r) / c.length)} + ${r}, the last digit of ${a}<sup>${e}</sup> is ${c[r - 1]}.`,
      `Последние цифры степеней числа ${a} повторяются с периодом ${c.length}: ${c.join(', ')}. Так как ${e} = ${c.length} ${TIMES} ${Math.floor((e - r) / c.length)} + ${r}, последняя цифра ${a}<sup>${e}</sup> равна ${c[r - 1]}.`,
      `${a} санының дәрежелерінің соңғы цифрлары ${c.length} периодпен қайталанады: ${c.join(', ')}. ${e} = ${c.length} ${TIMES} ${Math.floor((e - r) / c.length)} + ${r} болғандықтан, ${a}<sup>${e}</sup> санының соңғы цифры ${c[r - 1]}.`,
    );
  };
  const a = pick(rng, [2, 3, 7, 8, 12, 13, 17, 18]);
  const e = randomInt(rng, 21, 99);
  if (d === 2) {
    const ans = digitPow(a, e);
    return make('o.digit', d, { kind: 'pow', a, e }, {
      prompt: L(
        `What is the last digit of ${a}<sup>${e}</sup>?`,
        `Какой цифрой оканчивается число ${a}<sup>${e}</sup>?`,
        `${a}<sup>${e}</sup> саны қандай цифрмен аяқталады?`,
      ),
      ex: steps(explain(a, e)),
      ...ask(ctx, ans, cycleOf(a).filter((v) => v !== ans).concat([(ans + 5) % 10, (ans + 1) % 10])),
    });
  }
  const b = pick(rng, [3, 7, 9, 13, 19, 4, 14].filter((v) => v !== a));
  const m = randomInt(rng, 21, 99);
  const da = digitPow(a, e);
  const db = digitPow(b, m);
  const ans = (da + db) % 10;
  return make('o.digit', d, { kind: 'powsum', a, e, b, m }, {
    prompt: L(
      `What is the last digit of ${a}<sup>${e}</sup> + ${b}<sup>${m}</sup>?`,
      `Какой цифрой оканчивается число ${a}<sup>${e}</sup> + ${b}<sup>${m}</sup>?`,
      `${a}<sup>${e}</sup> + ${b}<sup>${m}</sup> саны қандай цифрмен аяқталады?`,
    ),
    ex: steps(explain(a, e), explain(b, m), same(`${da} + ${db} = ${da + db} → ${ans}`)),
    ...ask(ctx, ans, [(da * db) % 10, (ans + 2) % 10, (ans + 5) % 10, (ans + 8) % 10, (ans + 3) % 10].filter((v) => v !== ans)),
  });
}

// ---------- Делители ----------

export function divisors(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const N = pick(rng, [12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50, 54, 56, 60]);
    const list = [];
    for (let i = 1; i <= N; i++) if (N % i === 0) list.push(i);
    return make('o.div', d, { kind: 'count', N }, {
      prompt: L(
        `How many positive divisors does the number ${N} have?`,
        `Сколько натуральных делителей у числа ${N}?`,
        `${N} санының неше натурал бөлгіші бар?`,
      ),
      ex: steps(
        L('Divisors come in pairs whose product is the number itself.', 'Делители удобно выписывать парами, произведение которых равно самому числу.', 'Бөлгіштерді көбейтіндісі сол санға тең жұптармен жазған ыңғайлы.'),
        L(`${list.join(', ')} - ${list.length} divisors.`, `${list.join(', ')} - всего ${list.length}.`, `${list.join(', ')} - барлығы ${list.length}.`),
      ),
      ...ask(ctx, list.length, [list.length - 2, list.length + 2, list.length - 1, list.length + 1].filter((v) => v > 0)),
    });
  }
  const [p, q] = pick(rng, [[2, 3], [2, 5], [3, 5], [2, 7], [3, 7]]);
  const x = randomInt(rng, 2, p === 2 ? 5 : 3);
  const y = randomInt(rng, 1, 3);
  const N = p ** x * q ** y;
  const factorised = `${p}<sup>${x}</sup> ${TIMES} ${q}${y > 1 ? `<sup>${y}</sup>` : ''}`;
  if (d === 2) {
    const ans = (x + 1) * (y + 1);
    return make('o.div', d, { kind: 'count', N }, {
      prompt: L(
        `How many positive divisors does the number ${n(N)} have?`,
        `Сколько натуральных делителей у числа ${n(N)}?`,
        `${n(N)} санының неше натурал бөлгіші бар?`,
      ),
      ex: steps(
        same(`${n(N)} = ${factorised}`),
        L(
          `A divisor is ${p}<sup>i</sup> ${TIMES} ${q}<sup>j</sup>, where i is from 0 to ${x} (${x + 1} choices) and j is from 0 to ${y} (${y + 1} choices).`,
          `Делитель имеет вид ${p}<sup>i</sup> ${TIMES} ${q}<sup>j</sup>, где i - от 0 до ${x} (вариантов: ${x + 1}), а j - от 0 до ${y} (вариантов: ${y + 1}).`,
          `Бөлгіштің түрі ${p}<sup>i</sup> ${TIMES} ${q}<sup>j</sup>, мұнда i - 0-ден ${x}-ке дейін (${x + 1} нұсқа), j - 0-ден ${y}-ке дейін (${y + 1} нұсқа).`,
        ),
        same(`${x + 1} ${TIMES} ${y + 1} = ${ans}`),
      ),
      ...ask(ctx, ans, [x * y, x + y, ans + 2, (x + 1) * (y + 1) - 1, x * y + 1].filter((v) => v !== ans && v > 0)),
    });
  }
  // Сколько делителей кратны p (для p = 2 - чётные делители).
  const ans = x * (y + 1);
  return make('o.div', d, { kind: 'multiple', N, p }, {
    prompt: L(
      `How many positive divisors of ${n(N)} are divisible by ${p}?`,
      `Сколько натуральных делителей числа ${n(N)} делятся на ${p}?`,
      `${n(N)} санының натурал бөлгіштерінің нешеуі ${p}-ге бөлінеді?`,
    ),
    ex: steps(
      same(`${n(N)} = ${factorised}`),
      L(
        `A divisor ${p}<sup>i</sup> ${TIMES} ${q}<sup>j</sup> is divisible by ${p} when i is at least 1: i is from 1 to ${x} (${x} choices), j is from 0 to ${y} (${y + 1} choices).`,
        `Делитель ${p}<sup>i</sup> ${TIMES} ${q}<sup>j</sup> делится на ${p}, если i не меньше 1: i - от 1 до ${x} (вариантов: ${x}), j - от 0 до ${y} (вариантов: ${y + 1}).`,
        `${p}<sup>i</sup> ${TIMES} ${q}<sup>j</sup> бөлгіші i кемінде 1 болса ${p}-ге бөлінеді: i - 1-ден ${x}-ке дейін (${x} нұсқа), j - 0-ден ${y}-ке дейін (${y + 1} нұсқа).`,
      ),
      same(`${x} ${TIMES} ${y + 1} = ${ans}`),
    ),
    ...ask(ctx, ans, [(x + 1) * (y + 1), y + 1, x * y, ans + 1, ans - 1].filter((v) => v !== ans && v > 0)),
  });
}

// ---------- Принцип Дирихле ----------

export function pigeonhole(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const k = randomInt(rng, 3, 7);
    return make('o.pigeon', d, { kind: 'pair', k }, {
      prompt: L(
        `A drawer contains socks of ${k} colours, many of each. The room is dark. What is the smallest number of socks you must take to be sure of getting two socks of the same colour?`,
        `В ящике лежат носки ${k} цветов, каждого цвета много. В комнате темно. Какое наименьшее число носков нужно взять, чтобы среди них наверняка оказались два носка одного цвета?`,
        `Жәшікте ${k} түсті шұлық бар, әр түстен көп. Бөлме қараңғы. Бір түсті екі шұлық міндетті түрде шығуы үшін ең аз дегенде неше шұлық алу керек?`,
      ),
      ex: steps(
        L(
          `In the worst case the first ${k} socks are all of different colours.`,
          `В худшем случае первые ${k} ${plural(k, 'носок', 'носка', 'носков')} окажутся разных цветов.`,
          `Ең нашар жағдайда алғашқы ${k} шұлықтың бәрі әртүрлі түсті болады.`,
        ),
        L(`The next sock must repeat a colour: ${k} + 1 = ${k + 1}.`, `Следующий носок обязательно повторит какой-то цвет: ${k} + 1 = ${k + 1}.`, `Келесі шұлық міндетті түрде бір түсті қайталайды: ${k} + 1 = ${k + 1}.`),
      ),
      ...ask(ctx, k + 1, [k, 2 * k, k + 2, 2]),
    });
  }
  if (d === 2) {
    const k = randomInt(rng, 3, 6);
    const m = randomInt(rng, 3, 6);
    const ans = k * (m - 1) + 1;
    return make('o.pigeon', d, { kind: 'many', k, m }, {
      prompt: L(
        `A box contains pencils of ${k} colours, many of each. What is the smallest number of pencils you must take without looking to be sure of getting ${m} pencils of the same colour?`,
        `В коробке лежат карандаши ${k} цветов, каждого цвета много. Какое наименьшее число карандашей нужно взять не глядя, чтобы среди них наверняка нашлось ${m} ${plural(m, 'карандаш', 'карандаша', 'карандашей')} одного цвета?`,
        `Қорапта ${k} түсті қарындаш бар, әр түстен көп. Бір түсті ${m} қарындаш міндетті түрде табылуы үшін қарамай ең аз дегенде неше қарындаш алу керек?`,
      ),
      ex: steps(
        L(
          `In the worst case you take ${m - 1} pencils of each colour: ${k} ${TIMES} ${m - 1} = ${k * (m - 1)}.`,
          `В худшем случае возьмём по ${m - 1} ${plural(m - 1, 'карандашу', 'карандаша', 'карандашей')} каждого цвета: ${k} ${TIMES} ${m - 1} = ${k * (m - 1)}.`,
          `Ең нашар жағдайда әр түстен ${m - 1} қарындаштан аламыз: ${k} ${TIMES} ${m - 1} = ${k * (m - 1)}.`,
        ),
        L(`One more pencil gives ${m} of the same colour: ${k * (m - 1)} + 1 = ${ans}.`, `Ещё один карандаш даст ${m} одного цвета: ${k * (m - 1)} + 1 = ${ans}.`, `Тағы бір қарындаш бір түстен ${m} дана береді: ${k * (m - 1)} + 1 = ${ans}.`),
      ),
      ...ask(ctx, ans, [k * m, k * (m - 1), k + m, ans + k].filter((v) => v !== ans)),
    });
  }
  const a = randomInt(rng, 2, 5);
  const b = a + randomInt(rng, 1, 4);
  const c = b + randomInt(rng, 1, 5);
  const ans = b + c + 1;
  return make('o.pigeon', d, { kind: 'each', a, b, c }, {
    prompt: L(
      `A bag contains ${a} red, ${b} blue and ${c} green balls. What is the smallest number of balls you must take without looking to be sure of getting at least one ball of each colour?`,
      `В мешке лежат шары: красных - ${a}, синих - ${b}, зелёных - ${c}. Какое наименьшее число шаров нужно взять не глядя, чтобы среди них наверняка оказался хотя бы один шар каждого цвета?`,
      `Қапта ${a} қызыл, ${b} көк және ${c} жасыл шар бар. Әр түстен кемінде бір шар міндетті түрде шығуы үшін қарамай ең аз дегенде неше шар алу керек?`,
    ),
    ex: steps(
      L(
        `In the worst case you first take all the balls of the two most numerous colours: ${b} + ${c} = ${b + c}.`,
        `В худшем случае сначала попадутся все шары двух самых многочисленных цветов: ${b} + ${c} = ${b + c}.`,
        `Ең нашар жағдайда алдымен ең көп екі түстің барлық шары шығады: ${b} + ${c} = ${b + c}.`,
      ),
      L(`The next ball is certainly red: ${b + c} + 1 = ${ans}.`, `Следующий шар точно будет красным: ${b + c} + 1 = ${ans}.`, `Келесі шар міндетті түрде қызыл болады: ${b + c} + 1 = ${ans}.`),
    ),
    ...ask(ctx, ans, [a + b + 1, a + c + 1, 4, a + b + c].filter((v) => v !== ans)),
  });
}

// ---------- Суммы ----------

export function sums(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const k = pick(rng, [20, 30, 40, 50, 60, 80, 100, 200]);
    const ans = (k * (k + 1)) / 2;
    return make('o.sum', d, { kind: 'gauss', k }, {
      prompt: L(`Find the sum 1 + 2 + 3 + … + ${k}.`, `Найди сумму 1 + 2 + 3 + … + ${k}.`, `1 + 2 + 3 + … + ${k} қосындысын тап.`),
      ex: steps(
        L(
          `Pair the numbers from the two ends: 1 + ${k}, 2 + ${k - 1}, … Each pair gives ${k + 1}.`,
          `Разобьём числа на пары с двух концов: 1 + ${k}, 2 + ${k - 1}, … В каждой паре сумма ${k + 1}.`,
          `Сандарды екі шетінен жұптаймыз: 1 + ${k}, 2 + ${k - 1}, … Әр жұптың қосындысы ${k + 1}.`,
        ),
        L(`There are ${k / 2} pairs: ${k / 2} ${TIMES} ${k + 1} = ${n(ans)}.`, `Пар всего ${k / 2}: ${k / 2} ${TIMES} ${k + 1} = ${n(ans)}.`, `Барлығы ${k / 2} жұп: ${k / 2} ${TIMES} ${k + 1} = ${n(ans)}.`),
      ),
      ...ask(ctx, ans, [(k * k) / 2, k * (k + 1), ans - k, ans + k]),
    });
  }
  if (d === 2) {
    const k = randomInt(rng, 12, 60);
    const last = 2 * k - 1;
    const ans = k * k;
    return make('o.sum', d, { kind: 'odd', k }, {
      prompt: L(
        `Find the sum of all odd numbers from 1 to ${last}: 1 + 3 + 5 + … + ${last}.`,
        `Найди сумму всех нечётных чисел от 1 до ${last}: 1 + 3 + 5 + … + ${last}.`,
        `1-ден ${last}-ге дейінгі барлық тақ сандардың қосындысын тап: 1 + 3 + 5 + … + ${last}.`,
      ),
      ex: steps(
        L(`There are (${last} + 1) ${DIV} 2 = ${k} terms.`, `Слагаемых (${last} + 1) ${DIV} 2 = ${k}.`, `Қосылғыштар саны: (${last} + 1) ${DIV} 2 = ${k}.`),
        L(
          `The sum of the first k odd numbers equals k²: ${k}<sup>2</sup> = ${n(ans)}.`,
          `Сумма первых k нечётных чисел равна k²: ${k}<sup>2</sup> = ${n(ans)}.`,
          `Алғашқы k тақ санның қосындысы k²-қа тең: ${k}<sup>2</sup> = ${n(ans)}.`,
        ),
      ),
      ...ask(ctx, ans, [k * (k + 1), k * last, ans + k, ans - k].filter((v) => v !== ans)),
    });
  }
  const k = randomInt(rng, 8, 60);
  return make('o.sum', d, { kind: 'telescope', k }, {
    prompt: L(
      `Find the sum ${frac(1, `1 ${TIMES} 2`)} + ${frac(1, `2 ${TIMES} 3`)} + ${frac(1, `3 ${TIMES} 4`)} + … + ${frac(1, `${k} ${TIMES} ${k + 1}`)}.`,
      `Найди сумму ${frac(1, `1 ${TIMES} 2`)} + ${frac(1, `2 ${TIMES} 3`)} + ${frac(1, `3 ${TIMES} 4`)} + … + ${frac(1, `${k} ${TIMES} ${k + 1}`)}.`,
      `${frac(1, `1 ${TIMES} 2`)} + ${frac(1, `2 ${TIMES} 3`)} + ${frac(1, `3 ${TIMES} 4`)} + … + ${frac(1, `${k} ${TIMES} ${k + 1}`)} қосындысын тап.`,
    ),
    ex: steps(
      L(
        `Each fraction is a difference: ${frac(1, 'k(k + 1)')} = ${frac(1, 'k')} ${MINUS} ${frac(1, 'k + 1')}.`,
        `Каждую дробь можно записать как разность: ${frac(1, 'k(k + 1)')} = ${frac(1, 'k')} ${MINUS} ${frac(1, 'k + 1')}.`,
        `Әр бөлшекті айырма түрінде жазуға болады: ${frac(1, 'k(k + 1)')} = ${frac(1, 'k')} ${MINUS} ${frac(1, 'k + 1')}.`,
      ),
      L(
        `All the middle terms cancel, leaving 1 ${MINUS} ${frac(1, k + 1)} = ${frac(k, k + 1)}.`,
        `Все промежуточные слагаемые сокращаются, остаётся 1 ${MINUS} ${frac(1, k + 1)} = ${frac(k, k + 1)}.`,
        `Аралық қосылғыштардың бәрі қысқарады, 1 ${MINUS} ${frac(1, k + 1)} = ${frac(k, k + 1)} қалады.`,
      ),
    ),
    ...askFrac(ctx, [k, k + 1], [[k - 1, k], [1, k + 1], [k + 1, k + 2], [k, k + 2], [1, k]]),
  });
}

// ---------- Турниры и рукопожатия ----------

export function tournaments(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const k = randomInt(rng, 5, 15);
    const ans = (k * (k - 1)) / 2;
    return make('o.games', d, { kind: 'handshake', k }, {
      prompt: L(
        `${k} people met, and each shook hands with every other person exactly once. How many handshakes were there?`,
        `Встретились несколько человек: их было ${k}. Каждый пожал руку каждому ровно один раз. Сколько всего было рукопожатий?`,
        `${k} адам кездесті, әрқайсысы қалғандарының әрқайсысымен дәл бір рет қол алысты. Барлығы неше рет қол алысу болды?`,
      ),
      ex: steps(
        L(
          `Each of the ${k} people shakes ${k - 1} hands: ${k} ${TIMES} ${k - 1} = ${k * (k - 1)}.`,
          `Каждый из ${k} человек здоровается со всеми остальными, а их ${k - 1}: ${k} ${TIMES} ${k - 1} = ${k * (k - 1)}.`,
          `${k} адамның әрқайсысы ${k - 1} рет қол алысады: ${k} ${TIMES} ${k - 1} = ${k * (k - 1)}.`,
        ),
        L(
          `Each handshake was counted twice, so divide by 2: ${ans}.`,
          `Каждое рукопожатие посчитано дважды, поэтому делим на 2: ${ans}.`,
          `Әр қол алысу екі рет саналды, сондықтан 2-ге бөлеміз: ${ans}.`,
        ),
      ),
      ...ask(ctx, ans, [k * (k - 1), k * k, ans + k, 2 * k].filter((v) => v !== ans)),
    });
  }
  if (d === 2) {
    if (rng() < 0.5) {
      const k = randomInt(rng, 17, 130);
      return make('o.games', d, { kind: 'knockout', k }, {
        prompt: L(
          `${k} players take part in a knockout tournament: the loser of each match leaves, and there are no draws. How many matches are needed to find the winner?`,
          `В турнире по олимпийской системе участвуют игроки: их ${k}. Проигравший в каждой партии выбывает, ничьих нет. Сколько партий нужно сыграть, чтобы определить победителя?`,
          `Олимпиадалық жүйедегі турнирге ${k} ойыншы қатысады: әр кездесуде жеңілген ойыншы шығып қалады, тең ойын болмайды. Жеңімпазды анықтау үшін неше кездесу керек?`,
        ),
        ex: steps(
          L('Each match removes exactly one player.', 'Каждая партия выбивает из турнира ровно одного игрока.', 'Әр кездесу турнирден дәл бір ойыншыны шығарады.'),
          L(
            `Everyone except the winner must be removed: ${k} ${MINUS} 1 = ${k - 1} matches.`,
            `Выбыть должны все, кроме победителя, поэтому партий нужно ${k} ${MINUS} 1 = ${k - 1}.`,
            `Жеңімпаздан басқасының бәрі шығуы керек: ${k} ${MINUS} 1 = ${k - 1} кездесу.`,
          ),
        ),
        ...ask(ctx, k - 1, [k, Math.floor(k / 2), k + 1, k - 2]),
      });
    }
    const k = randomInt(rng, 6, 20);
    const games = (k * (k - 1)) / 2;
    return make('o.games', d, { kind: 'inverse', games }, {
      prompt: L(
        `In a chess tournament every player played every other player exactly once. ${games} games were played. How many players took part?`,
        `В шахматном турнире каждый сыграл с каждым ровно одну партию. Всего было сыграно партий: ${games}. Сколько шахматистов участвовало?`,
        `Шахмат турнирінде әрқайсысы әрқайсысымен дәл бір партия ойнады. Барлығы ${games} партия ойналды. Турнирге неше шахматшы қатысты?`,
      ),
      ex: steps(
        L(`With k players there are k(k ${MINUS} 1) ${DIV} 2 games.`, `Если игроков k, то партий k(k ${MINUS} 1) ${DIV} 2.`, `Ойыншылар саны k болса, партиялар саны k(k ${MINUS} 1) ${DIV} 2.`),
        same(`k(k ${MINUS} 1) = ${2 * games} = ${k} ${TIMES} ${k - 1}`),
        same(`k = ${k}`),
      ),
      ...ask(ctx, k, [k - 1, k + 1, k + 2, k - 2]),
    });
  }
  const k = randomInt(rng, 5, 10);
  const games = (k * (k - 1)) / 2;
  const draws = randomInt(rng, 2, games - 2);
  const total = 3 * games - draws;
  return make('o.games', d, { kind: 'draws', k, total }, {
    prompt: L(
      `${k} teams played a round-robin football tournament (each pair played once). A win gives 3 points, a draw 1 point to each team, a loss 0. The teams scored ${total} points in total. How many matches ended in a draw?`,
      `В футбольном турнире участвовали команды: их ${k}. Каждая сыграла с каждой один раз. За победу дают 3 очка, за ничью - по 1 очку каждой команде, за поражение - 0. Все команды вместе набрали ${total} ${plural(total, 'очко', 'очка', 'очков')}. Сколько матчей закончилось вничью?`,
      `Футбол турниріне ${k} команда қатысты, әрқайсысы әрқайсысымен бір рет ойнады. Жеңіске 3 ұпай, тең ойынға әр командаға 1 ұпай, жеңіліске 0 ұпай беріледі. Барлық команда бірге ${total} ұпай жинады. Неше матч тең аяқталды?`,
    ),
    ex: steps(
      L(`There were ${k} ${TIMES} ${k - 1} ${DIV} 2 = ${games} matches.`, `Всего матчей: ${k} ${TIMES} ${k - 1} ${DIV} 2 = ${games}.`, `Барлық матч саны: ${k} ${TIMES} ${k - 1} ${DIV} 2 = ${games}.`),
      L(
        `A match with a winner gives 3 points in total, a draw gives 2. If there were no draws, there would be ${3 * games} points.`,
        `Матч с победителем даёт в сумме 3 очка, ничья - 2. Без ничьих очков было бы ${3 * games}.`,
        `Жеңімпазы бар матч барлығы 3 ұпай, тең ойын 2 ұпай береді. Тең ойынсыз ${3 * games} ұпай болар еді.`,
      ),
      L(`Each draw takes away 1 point: ${3 * games} ${MINUS} ${total} = ${draws}.`, `Каждая ничья уменьшает сумму на 1: ${3 * games} ${MINUS} ${total} = ${draws}.`, `Әр тең ойын қосындыны 1-ге азайтады: ${3 * games} ${MINUS} ${total} = ${draws}.`),
    ),
    ...ask(ctx, draws, [draws + 1, draws - 1, games - draws, draws + 2].filter((v) => v !== draws && v >= 0)),
  });
}

// ---------- Логика и рассуждения ----------

export function logic(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const rabbits = randomInt(rng, 3, 15);
    const chickens = randomInt(rng, 4, 20);
    const heads = rabbits + chickens;
    const legs = 4 * rabbits + 2 * chickens;
    return make('o.logic', d, { kind: 'heads', heads, legs }, {
      prompt: L(
        `There are chickens and rabbits in a yard: ${heads} heads and ${legs} legs in total. How many rabbits are there?`,
        `Во дворе гуляют куры и кролики. У них вместе ${heads} голов и ${legs} ног. Сколько кроликов во дворе?`,
        `Аулада тауықтар мен қояндар жүр. Олардың барлығында ${heads} бас және ${legs} аяқ бар. Аулада неше қоян бар?`,
      ),
      ex: steps(
        L(
          `Imagine that all ${heads} animals are chickens: then there would be ${heads} ${TIMES} 2 = ${2 * heads} legs.`,
          `Представим, что все ${heads} животных - куры: тогда ног было бы ${heads} ${TIMES} 2 = ${2 * heads}.`,
          `Барлық ${heads} жануар тауық деп елестетейік: сонда аяқ саны ${heads} ${TIMES} 2 = ${2 * heads} болар еді.`,
        ),
        L(
          `There are ${legs} ${MINUS} ${2 * heads} = ${legs - 2 * heads} extra legs. Each rabbit adds 2 extra legs.`,
          `Лишних ног: ${legs} ${MINUS} ${2 * heads} = ${legs - 2 * heads}. Каждый кролик добавляет 2 лишние ноги.`,
          `Артық аяқ саны: ${legs} ${MINUS} ${2 * heads} = ${legs - 2 * heads}. Әр қоян 2 артық аяқ қосады.`,
        ),
        same(`${legs - 2 * heads} ${DIV} 2 = ${rabbits}`),
      ),
      ...ask(ctx, rabbits, [chickens, heads - rabbits + 1, rabbits + 1, rabbits - 1, legs / 4].filter((v) => v !== rabbits && Number.isInteger(v) && v > 0)),
    });
  }
  if (d === 2) {
    // Сейчас отец старше сына в a раз, через k лет - в b раз.
    let a;
    let b;
    let k;
    let son;
    do {
      a = randomInt(rng, 4, 7);
      b = randomInt(rng, 2, a - 1);
      son = randomInt(rng, 5, 12);
      k = (son * (a - b)) / (b - 1);
    } while (!Number.isInteger(k) || k < 2 || k > 30 || a * son > 60);
    const father = a * son;
    return make('o.logic', d, { kind: 'ages', a, b, k }, {
      prompt: L(
        `A father is now ${a} times as old as his son. In ${k} years he will be ${b} times as old as his son. How old is the son now?`,
        `Сейчас отец старше сына в ${a} ${plural(a, 'раз', 'раза', 'раз')}, а через ${k} ${plural(k, 'год', 'года', 'лет')} он будет старше сына в ${b} ${plural(b, 'раз', 'раза', 'раз')}. Сколько лет сыну сейчас?`,
        `Қазір әкесі ұлынан ${a} есе үлкен, ал ${k} жылдан кейін ол ұлынан ${b} есе үлкен болады. Ұлы қазір неше жаста?`,
      ),
      ex: steps(
        L(`Let the son be x years old; then the father is ${a}x.`, `Пусть сыну x лет, тогда отцу ${a}x лет.`, `Ұлы x жаста болсын, сонда әкесі ${a}x жаста.`),
        same(`${a}x + ${k} = ${b}(x + ${k})`),
        same(`${a - b}x = ${b * k - k}, x = ${son}`),
        L(`Check: now ${son} and ${father}; in ${k} years ${son + k} and ${father + k}.`, `Проверка: сейчас им ${son} и ${father}; через ${k} ${plural(k, 'год', 'года', 'лет')} будет ${son + k} и ${father + k}.`, `Тексеру: қазір ${son} және ${father}; ${k} жылдан кейін - ${son + k} және ${father + k}.`),
      ),
      ...ask(ctx, son, [son + 1, son - 1, son + k, father - son].filter((v) => v !== son && v > 0)),
    });
  }
  // Улитка: поднимается на up за день, сползает на down за ночь.
  const down = randomInt(rng, 1, 4);
  const up = down + randomInt(rng, 1, 4);
  const height = up + (up - down) * randomInt(rng, 3, 12) + randomInt(rng, 0, up - down - 1);
  const fullDays = Math.ceil((height - up) / (up - down));
  const ans = fullDays + 1;
  return make('o.logic', d, { kind: 'snail', height, up, down }, {
    prompt: L(
      `A snail climbs a pole ${height} m high. Each day it climbs ${up} m, and each night it slides down ${down} m. On which day will it reach the top?`,
      `Улитка ползёт по столбу высотой ${height} м. За день она поднимается на ${up} м, а за ночь сползает на ${down} м. На какой по счёту день она доберётся до вершины?`,
      `Ұлу биіктігі ${height} м бағанамен өрмелейді. Күндіз ол ${up} м көтеріледі, ал түнде ${down} м төмен сырғиды. Ол нешінші күні төбеге жетеді?`,
    ),
    ex: steps(
      L(
        `In a full day and night the snail gains ${up} ${MINUS} ${down} = ${up - down} m. But on the last day it climbs ${up} m and does not slide back.`,
        `За полные сутки улитка поднимается на ${up} ${MINUS} ${down} = ${up - down} м. Но в последний день она проползает ${up} м и уже не сползает.`,
        `Толық тәулікте ұлу ${up} ${MINUS} ${down} = ${up - down} м көтеріледі. Бірақ соңғы күні ол ${up} м өрмелеп, қайта сырғымайды.`,
      ),
      L(
        `Before the last day it must be at a height of at least ${height} ${MINUS} ${up} = ${height - up} m: this takes ${fullDays} full days.`,
        `Перед последним днём она должна быть на высоте не меньше ${height} ${MINUS} ${up} = ${height - up} м: на это уйдёт ${fullDays} полных суток.`,
        `Соңғы күннің алдында ол кемінде ${height} ${MINUS} ${up} = ${height - up} м биіктікте болуы керек: бұған ${fullDays} толық тәулік кетеді.`,
      ),
      L(`So it reaches the top on day ${ans}.`, `Значит, она доберётся до вершины на ${ans}-й день.`, `Демек, ол төбеге ${ans}-ші күні жетеді.`),
    ),
    ...ask(ctx, ans, [Math.ceil(height / (up - down)), ans + 1, ans - 1, Math.ceil(height / up)].filter((v) => v !== ans && v > 0)),
  });
}

// ---------- Комбинаторная геометрия ----------

const c2 = (k) => (k * (k - 1)) / 2;

export function shapes(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const k = randomInt(rng, 5, 12);
    const ans = c2(k);
    return make('o.geom', d, { kind: 'segments', k }, {
      prompt: L(
        `${k} points are marked on a line. How many different segments have both ends at these points?`,
        `На прямой отмечены точки: их ${k}. Сколько существует различных отрезков с концами в этих точках?`,
        `Түзу бойында ${k} нүкте белгіленген. Ұштары осы нүктелерде жататын неше түрлі кесінді бар?`,
      ),
      ex: steps(
        L(
          `A segment is a pair of points. The first end can be chosen in ${k} ways, the second in ${k - 1} ways.`,
          `Отрезок - это пара точек. Первый конец можно выбрать ${k} способами, второй - ${k - 1} способами.`,
          `Кесінді - нүктелер жұбы. Бірінші ұшын ${k} тәсілмен, екіншісін ${k - 1} тәсілмен таңдауға болады.`,
        ),
        L(`Each segment was counted twice: ${k} ${TIMES} ${k - 1} ${DIV} 2 = ${ans}.`, `Каждый отрезок посчитан дважды: ${k} ${TIMES} ${k - 1} ${DIV} 2 = ${ans}.`, `Әр кесінді екі рет саналды: ${k} ${TIMES} ${k - 1} ${DIV} 2 = ${ans}.`),
      ),
      ...ask(ctx, ans, [k - 1, k * (k - 1), ans + k, 2 * k].filter((v) => v !== ans)),
    });
  }
  if (d === 2) {
    if (rng() < 0.5) {
      const k = randomInt(rng, 6, 20);
      const ans = (k * (k - 3)) / 2;
      return make('o.geom', d, { kind: 'diagonals', k }, {
        prompt: L(
          `How many diagonals does a convex polygon with ${k} sides have?`,
          `Сколько диагоналей у выпуклого ${k}-угольника?`,
          `Дөңес ${k}-бұрыштың неше диагоналі бар?`,
        ),
        ex: steps(
          L(
            `From each vertex you can draw a diagonal to every vertex except itself and its two neighbours: ${k} ${MINUS} 3 = ${k - 3}.`,
            `Из каждой вершины диагональ идёт ко всем вершинам, кроме неё самой и двух соседних: ${k} ${MINUS} 3 = ${k - 3}.`,
            `Әр төбеден өзінен және екі көршісінен басқа барлық төбеге диагональ жүргізуге болады: ${k} ${MINUS} 3 = ${k - 3}.`,
          ),
          L(`Each diagonal was counted from both ends: ${k} ${TIMES} ${k - 3} ${DIV} 2 = ${ans}.`, `Каждая диагональ посчитана с двух концов: ${k} ${TIMES} ${k - 3} ${DIV} 2 = ${ans}.`, `Әр диагональ екі ұшынан саналды: ${k} ${TIMES} ${k - 3} ${DIV} 2 = ${ans}.`),
        ),
        ...ask(ctx, ans, [c2(k), k * (k - 3), ans + k, k - 3].filter((v) => v !== ans)),
      });
    }
    const k = randomInt(rng, 3, 8);
    let ans = 0;
    for (let s = 1; s <= k; s++) ans += (k - s + 1) ** 2;
    return make('o.geom', d, { kind: 'squares', k }, {
      prompt: L(
        `A ${k} ${TIMES} ${k} square is divided into unit cells. How many squares of all sizes with sides along the grid lines can be found in it?`,
        `Квадрат ${k} ${TIMES} ${k} разбит на единичные клетки. Сколько в нём квадратов всех размеров со сторонами по линиям сетки?`,
        `${k} ${TIMES} ${k} шаршы бірлік торкөздерге бөлінген. Онда қабырғалары тор сызықтарымен өтетін барлық өлшемдегі неше шаршы бар?`,
      ),
      ex: steps(
        L(
          `A square with side s can be placed in (${k} ${MINUS} s + 1)² positions.`,
          `Квадрат со стороной s можно расположить (${k} ${MINUS} s + 1)² способами.`,
          `Қабырғасы s шаршыны (${k} ${MINUS} s + 1)² тәсілмен орналастыруға болады.`,
        ),
        same(`${Array.from({ length: k }, (_, i) => `${k - i}<sup>2</sup>`).join(' + ')} = ${ans}`),
      ),
      ...ask(ctx, ans, [k * k, ans - 1, ans + k, k * k + (k - 1) ** 2].filter((v) => v !== ans)),
    });
  }
  if (rng() < 0.5) {
    const k = randomInt(rng, 6, 14);
    const ans = (k * (k - 1) * (k - 2)) / 6;
    return make('o.geom', d, { kind: 'triangles', k }, {
      prompt: L(
        `${k} points are marked on a circle. How many triangles have all three vertices at these points?`,
        `На окружности отмечены точки: их ${k}. Сколько существует треугольников с вершинами в этих точках?`,
        `Шеңбер бойында ${k} нүкте белгіленген. Төбелері осы нүктелерде жататын неше үшбұрыш бар?`,
      ),
      ex: steps(
        L(
          'No three points of a circle lie on one line, so any three points give a triangle.',
          'Никакие три точки окружности не лежат на одной прямой, поэтому любая тройка точек даёт треугольник.',
          'Шеңбердің ешбір үш нүктесі бір түзуде жатпайды, сондықтан кез келген үш нүкте үшбұрыш береді.',
        ),
        same(`${frac(`${k} ${TIMES} ${k - 1} ${TIMES} ${k - 2}`, `3 ${TIMES} 2 ${TIMES} 1`)} = ${ans}`),
      ),
      ...ask(ctx, ans, [k * (k - 1) * (k - 2), c2(k), ans + k, (k * (k - 1) * (k - 2)) / 2].filter((v) => v !== ans)),
    });
  }
  const w = randomInt(rng, 3, 7);
  const h = randomInt(rng, 2, 6);
  const ans = c2(w + 1) * c2(h + 1);
  return make('o.geom', d, { kind: 'rects', w, h }, {
    prompt: L(
      `A ${w} ${TIMES} ${h} rectangle is divided into unit cells. How many rectangles (including squares) with sides along the grid lines can be found in it?`,
      `Прямоугольник ${w} ${TIMES} ${h} разбит на единичные клетки. Сколько в нём прямоугольников (включая квадраты) со сторонами по линиям сетки?`,
      `${w} ${TIMES} ${h} тіктөртбұрыш бірлік торкөздерге бөлінген. Онда қабырғалары тор сызықтарымен өтетін неше тіктөртбұрыш (шаршыларды қоса) бар?`,
    ),
    ex: steps(
      L(
        `A rectangle is defined by two vertical lines out of ${w + 1} and two horizontal lines out of ${h + 1}.`,
        `Прямоугольник задаётся двумя вертикальными линиями из ${w + 1} и двумя горизонтальными из ${h + 1}.`,
        `Тіктөртбұрыш ${w + 1} тік сызықтың екеуімен және ${h + 1} көлденең сызықтың екеуімен анықталады.`,
      ),
      same(`${frac(`${w + 1} ${TIMES} ${w}`, 2)} ${TIMES} ${frac(`${h + 1} ${TIMES} ${h}`, 2)} = ${c2(w + 1)} ${TIMES} ${c2(h + 1)} = ${ans}`),
    ),
    ...ask(ctx, ans, [w * h, c2(w) * c2(h), (w + 1) * (h + 1), ans + w * h].filter((v) => v !== ans && v > 0)),
  });
}

// ---------- Остатки ----------

const DAYS = [
  L('Monday', 'понедельник', 'дүйсенбі'),
  L('Tuesday', 'вторник', 'сейсенбі'),
  L('Wednesday', 'среда', 'сәрсенбі'),
  L('Thursday', 'четверг', 'бейсенбі'),
  L('Friday', 'пятница', 'жұма'),
  L('Saturday', 'суббота', 'сенбі'),
  L('Sunday', 'воскресенье', 'жексенбі'),
];

const powMod = (a, e, m) => {
  let r = 1;
  for (let i = 0; i < e; i++) r = (r * a) % m;
  return r;
};

export function remainders(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const start = randomInt(rng, 0, 6);
    const days = randomInt(rng, 30, 200);
    const ans = (start + days) % 7;
    const wrong = [1, 2, 3].map((s) => DAYS[(ans + s * 2) % 7]);
    const all = [DAYS[ans], ...wrong];
    const order = shuffle([0, 1, 2, 3], rng);
    return make('o.rem', d, { kind: 'weekday', start, days }, {
      prompt: L(
        `Today is ${DAYS[start].en}. What day of the week will it be in ${days} days?`,
        `Сегодня ${DAYS[start].ru}. Какой день недели будет через ${days} ${plural(days, 'день', 'дня', 'дней')}?`,
        `Бүгін ${DAYS[start].kk}. ${days} күннен кейін аптаның қай күні болады?`,
      ),
      ex: steps(
        L('The days of the week repeat every 7 days, so only the remainder matters.', 'Дни недели повторяются каждые 7 дней, поэтому важен только остаток.', 'Апта күндері әр 7 күн сайын қайталанады, сондықтан тек қалдық маңызды.'),
        L(
          `${days} = 7 ${TIMES} ${Math.floor(days / 7)} + ${days % 7}. Count ${days % 7} days forward from ${DAYS[start].en}: ${DAYS[ans].en}.`,
          `${days} = 7 ${TIMES} ${Math.floor(days / 7)} + ${days % 7}. Отсчитаем ${days % 7} дн. вперёд от дня «${DAYS[start].ru}»: получится ${DAYS[ans].ru}.`,
          `${days} = 7 ${TIMES} ${Math.floor(days / 7)} + ${days % 7}. «${DAYS[start].kk}» күнінен ${days % 7} күн алға санаймыз: ${DAYS[ans].kk} шығады.`,
        ),
      ),
      mc: { choices: order.map((i) => all[i]), answer: order.indexOf(0) },
    });
  }
  if (d === 2) {
    const m = pick(rng, [3, 5, 7, 9, 11]);
    let a = randomInt(rng, 2, 9);
    while (a % m === 0 || gcd(a, m) !== 1) a = randomInt(rng, 2, 9);
    const e = randomInt(rng, 20, 60);
    let period = 1;
    while (powMod(a, period, m) !== 1) period += 1;
    const r = e % period;
    const ans = powMod(a, e, m);
    return make('o.rem', d, { kind: 'powmod', a, e, m }, {
      prompt: L(
        `Find the remainder when ${a}<sup>${e}</sup> is divided by ${m}.`,
        `Найди остаток от деления числа ${a}<sup>${e}</sup> на ${m}.`,
        `${a}<sup>${e}</sup> санын ${m}-ге бөлгендегі қалдықты тап.`,
      ),
      ex: steps(
        L(
          `Look at the remainders of the powers of ${a}: ${a}<sup>${period}</sup> gives remainder 1 when divided by ${m}, so the remainders repeat with period ${period}.`,
          `Посмотрим на остатки степеней числа ${a}: ${a}<sup>${period}</sup> даёт остаток 1 при делении на ${m}, значит остатки повторяются с периодом ${period}.`,
          `${a} санының дәрежелерінің қалдықтарына қарайық: ${a}<sup>${period}</sup> санын ${m}-ге бөлгенде қалдық 1, демек қалдықтар ${period} периодпен қайталанады.`,
        ),
        L(
          `${e} = ${period} ${TIMES} ${Math.floor(e / period)} + ${r}, so the remainder is the same as for ${a}<sup>${r}</sup>: it equals ${ans}.`,
          `${e} = ${period} ${TIMES} ${Math.floor(e / period)} + ${r}, поэтому остаток такой же, как у ${a}<sup>${r}</sup>: он равен ${ans}.`,
          `${e} = ${period} ${TIMES} ${Math.floor(e / period)} + ${r}, сондықтан қалдық ${a}<sup>${r}</sup> санының қалдығымен бірдей: ол ${ans}-ге тең.`,
        ),
      ),
      ...ask(ctx, ans, [(ans + 1) % m, (ans + 2) % m, (ans + m - 1) % m, (ans + 3) % m].filter((v) => v !== ans)),
    });
  }
  const [m1, m2] = coprimePair(rng, 3, 9);
  const r1 = randomInt(rng, 1, m1 - 1);
  const r2 = randomInt(rng, 1, m2 - 1);
  let ans = r2;
  while (ans % m1 !== r1) ans += m2;
  if (ans === 0) ans = m1 * m2;
  const trail = [];
  for (let v = r2; v <= ans; v += m2) trail.push(v);
  return make('o.rem', d, { kind: 'crt', m1, r1, m2, r2 }, {
    prompt: L(
      `Find the smallest positive integer that gives a remainder of ${r1} when divided by ${m1} and a remainder of ${r2} when divided by ${m2}.`,
      `Найди наименьшее натуральное число, которое при делении на ${m1} даёт остаток ${r1}, а при делении на ${m2} - остаток ${r2}.`,
      `${m1}-ге бөлгенде ${r1} қалдық, ал ${m2}-ге бөлгенде ${r2} қалдық беретін ең кіші натурал санды тап.`,
    ),
    ex: steps(
      L(
        `List the numbers that give remainder ${r2} when divided by ${m2}: ${trail.join(', ')}, …`,
        `Выпишем числа, дающие остаток ${r2} при делении на ${m2}: ${trail.join(', ')}, …`,
        `${m2}-ге бөлгенде ${r2} қалдық беретін сандарды жазамыз: ${trail.join(', ')}, …`,
      ),
      L(
        `The first of them that gives remainder ${r1} when divided by ${m1} is ${ans}.`,
        `Первое из них, дающее остаток ${r1} при делении на ${m1}, - это ${ans}.`,
        `Олардың ішінде ${m1}-ге бөлгенде ${r1} қалдық беретін алғашқысы - ${ans}.`,
      ),
    ),
    ...ask(ctx, ans, [ans + m1 * m2, r1 + r2, r1 * m2 + r2, ans + m2, ans + m1].filter((v) => v !== ans)),
  });
}

// ---------- Цифры и факториалы ----------

export function factorials(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const pages = randomInt(rng, 25, 99);
    const ans = 9 + 2 * (pages - 9);
    return make('o.fact', d, { kind: 'pages', pages }, {
      prompt: L(
        `The pages of a book are numbered from 1 to ${pages}. How many digits were written in total?`,
        `Страницы книги пронумерованы от 1 до ${pages}. Сколько всего цифр понадобилось для нумерации?`,
        `Кітап беттері 1-ден ${pages}-ге дейін нөмірленген. Нөмірлеуге барлығы неше цифр жұмсалды?`,
      ),
      ex: steps(
        L('Pages 1-9 use one digit each: 9 digits.', 'Страницы 1-9 - по одной цифре: 9 цифр.', '1-9 беттер - бір цифрдан: 9 цифр.'),
        L(
          `Pages 10-${pages} use two digits each: there are ${pages - 9} of them, ${pages - 9} ${TIMES} 2 = ${2 * (pages - 9)} digits.`,
          `Страницы 10-${pages} - по две цифры: таких страниц ${pages - 9}, цифр на них ${pages - 9} ${TIMES} 2 = ${2 * (pages - 9)}.`,
          `10-${pages} беттер - екі цифрдан: олар ${pages - 9}, бұл ${pages - 9} ${TIMES} 2 = ${2 * (pages - 9)} цифр.`,
        ),
        same(`9 + ${2 * (pages - 9)} = ${ans}`),
      ),
      ...ask(ctx, ans, [2 * pages, pages, ans + 2, ans - 9].filter((v) => v !== ans)),
    });
  }
  const p = d === 2 ? 5 : pick(rng, [2, 3]);
  const k = d === 2 ? randomInt(rng, 26, 130) : randomInt(rng, 12, 40);
  const terms = [];
  for (let pw = p; pw <= k; pw *= p) terms.push([pw, Math.floor(k / pw)]);
  const ans = terms.reduce((s, [, v]) => s + v, 0);
  const sumLine = same(`${terms.map(([pw]) => `[${k} ${DIV} ${pw}]`).join(' + ')} = ${terms.map(([, v]) => v).join(' + ')} = ${ans}`);
  if (d === 2) {
    return make('o.fact', d, { kind: 'zeros', k }, {
      prompt: L(
        `How many zeros are at the end of the number ${k}! (the product of all integers from 1 to ${k})?`,
        `Сколькими нулями оканчивается число ${k}! (произведение всех натуральных чисел от 1 до ${k})?`,
        `${k}! саны (1-ден ${k}-ге дейінгі барлық натурал сандардың көбейтіндісі) неше нөлмен аяқталады?`,
      ),
      ex: steps(
        L(
          'A zero at the end comes from a factor 10 = 2 × 5. There are more twos than fives, so count the fives.',
          'Ноль в конце даёт множитель 10 = 2 × 5. Двоек больше, чем пятёрок, поэтому считаем пятёрки.',
          'Соңындағы нөлді 10 = 2 × 5 көбейткіші береді. Екіліктер бестіктерден көп, сондықтан бестіктерді санаймыз.',
        ),
        L(
          'Multiples of 5 give one five each, multiples of 25 one more, multiples of 125 another one.',
          'Числа, кратные 5, дают по одной пятёрке, кратные 25 - ещё по одной, кратные 125 - ещё по одной.',
          '5-ке еселі сандар бір бестіктен, 25-ке еселілер тағы бір бестіктен, 125-ке еселілер тағы бір бестіктен береді.',
        ),
        sumLine,
      ),
      ...ask(ctx, ans, [Math.floor(k / 5), Math.floor(k / 10), ans + 1, ans - 1].filter((v) => v !== ans && v > 0)),
    });
  }
  return make('o.fact', d, { kind: 'legendre', k, p }, {
    prompt: L(
      `What is the largest power of ${p} that divides ${k}!? Give the exponent.`,
      `На какую наибольшую степень числа ${p} делится ${k}!? В ответе укажи показатель степени.`,
      `${k}! саны ${p} санының ең үлкен қандай дәрежесіне бөлінеді? Жауапқа дәреже көрсеткішін жаз.`,
    ),
    ex: steps(
      L(
        `Count how many factors ${p} are in the product 1 × 2 × … × ${k}: multiples of ${p} give one each, multiples of ${p * p} one more, and so on.`,
        `Посчитаем, сколько множителей ${p} в произведении 1 × 2 × … × ${k}: кратные ${p} дают по одному, кратные ${p * p} - ещё по одному, и так далее.`,
        `1 × 2 × … × ${k} көбейтіндісінде неше ${p} көбейткіші бар екенін санаймыз: ${p}-ге еселілер бір-бірден, ${p * p}-ге еселілер тағы бір-бірден береді, осылай жалғасады.`,
      ),
      sumLine,
    ),
    ...ask(ctx, ans, [Math.floor(k / p), ans + 1, ans - 1, ans - Math.floor(k / p)].filter((v) => v !== ans && v > 0)),
  });
}

// ---------- Пути и правило умножения ----------

const binom = (a, b) => {
  let r = 1;
  for (let i = 1; i <= b; i++) r = (r * (a - b + i)) / i;
  return Math.round(r);
};

export function paths(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 2, 6);
    const b = randomInt(rng, 2, 6);
    const c = randomInt(rng, 2, 5);
    const ans = a * b * c;
    return make('o.paths', d, { kind: 'roads', a, b, c }, {
      prompt: L(
        `There are ${a} roads from town A to town B, ${b} roads from B to C and ${c} roads from C to D. In how many ways can you travel from A to D through B and C?`,
        `Города соединены дорогами. Число дорог: из A в B - ${a}, из B в C - ${b}, из C в D - ${c}. Сколькими способами можно проехать из A в D через B и C?`,
        `A қаласынан B қаласына ${a} жол, B-дан C-ға ${b} жол, C-дан D-ға ${c} жол апарады. A-дан D-ға B мен C арқылы неше тәсілмен жетуге болады?`,
      ),
      ex: steps(
        L('The choices on each part of the route are independent, so multiply them.', 'Выбор дороги на каждом участке независим, поэтому количества перемножаем.', 'Әр бөліктегі жол таңдау тәуелсіз, сондықтан сандарды көбейтеміз.'),
        same(`${a} ${TIMES} ${b} ${TIMES} ${c} = ${ans}`),
      ),
      ...ask(ctx, ans, [a + b + c, a * b + c, ans + a, a * (b + c)].filter((v) => v !== ans)),
    });
  }
  if (d === 2) {
    const w = randomInt(rng, 3, 6);
    const h = randomInt(rng, 2, 4);
    const ans = binom(w + h, h);
    return make('o.paths', d, { kind: 'grid', w, h }, {
      prompt: L(
        `A city is a grid of streets. You need to go ${w} blocks east and ${h} blocks north, moving only east or north. How many different shortest routes are there?`,
        `Город - это сетка улиц. Нужно пройти ${w} ${plural(w, 'квартал', 'квартала', 'кварталов')} на восток и ${h} ${plural(h, 'квартал', 'квартала', 'кварталов')} на север, двигаясь только на восток или на север. Сколько существует различных кратчайших маршрутов?`,
        `Қала - көшелер торы. Тек шығысқа немесе солтүстікке жүріп, ${w} орам шығысқа және ${h} орам солтүстікке өту керек. Неше түрлі ең қысқа маршрут бар?`,
      ),
      ex: steps(
        L(
          `Every route is a sequence of ${w + h} steps, ${h} of which go north.`,
          `Любой маршрут - это последовательность из ${w + h} шагов, из которых ${h} - на север.`,
          `Кез келген маршрут - ${w + h} қадамнан тұратын тізбек, оның ${h} қадамы солтүстікке.`,
        ),
        L(
          `Choose which ${h} of the ${w + h} steps go north: C(${w + h}, ${h}) = ${ans}.`,
          `Выберем, какие ${h} из ${w + h} шагов будут на север: C(${w + h}, ${h}) = ${ans}.`,
          `${w + h} қадамның қай ${h}-і солтүстікке болатынын таңдаймыз: C(${w + h}, ${h}) = ${ans}.`,
        ),
      ),
      ...ask(ctx, ans, [w * h, (w + 1) * (h + 1), 2 ** (w + h), ans + w, binom(w + h, h - 1)].filter((v) => v !== ans)),
    });
  }
  const w1 = randomInt(rng, 2, 4);
  const h1 = randomInt(rng, 1, 3);
  const w2 = randomInt(rng, 2, 4);
  const h2 = randomInt(rng, 1, 3);
  const first = binom(w1 + h1, h1);
  const second = binom(w2 + h2, h2);
  const ans = first * second;
  return make('o.paths', d, { kind: 'via', w1, h1, w2, h2 }, {
    prompt: L(
      `On a grid you move only right or up. How many shortest routes lead from the point (0; 0) to the point (${w1 + w2}; ${h1 + h2}) and pass through the point (${w1}; ${h1})?`,
      `По клетчатой сетке можно двигаться только вправо или вверх. Сколько кратчайших маршрутов ведут из точки (0; 0) в точку (${w1 + w2}; ${h1 + h2}) и проходят через точку (${w1}; ${h1})?`,
      `Торкөзді торда тек оңға немесе жоғары жылжуға болады. (0; 0) нүктесінен (${w1 + w2}; ${h1 + h2}) нүктесіне апаратын және (${w1}; ${h1}) нүктесі арқылы өтетін неше ең қысқа маршрут бар?`,
    ),
    ex: steps(
      L(
        `From (0; 0) to (${w1}; ${h1}): C(${w1 + h1}, ${h1}) = ${first} routes.`,
        `От (0; 0) до (${w1}; ${h1}): C(${w1 + h1}, ${h1}) = ${first} маршрутов.`,
        `(0; 0)-ден (${w1}; ${h1})-ге дейін: C(${w1 + h1}, ${h1}) = ${first} маршрут.`,
      ),
      L(
        `From (${w1}; ${h1}) to (${w1 + w2}; ${h1 + h2}): C(${w2 + h2}, ${h2}) = ${second} routes.`,
        `От (${w1}; ${h1}) до (${w1 + w2}; ${h1 + h2}): C(${w2 + h2}, ${h2}) = ${second} маршрутов.`,
        `(${w1}; ${h1})-ден (${w1 + w2}; ${h1 + h2})-ге дейін: C(${w2 + h2}, ${h2}) = ${second} маршрут.`,
      ),
      same(`${first} ${TIMES} ${second} = ${ans}`),
    ),
    ...ask(ctx, ans, [first + second, binom(w1 + w2 + h1 + h2, h1 + h2), ans + first, first * second * 2].filter((v) => v !== ans)),
  });
}

// ---------- Уравнения в целых числах ----------

export function diophantine(ctx, d) {
  const { rng } = ctx;
  const [a, b] = coprimePair(rng, d === 2 ? 2 : 3, 9);
  if (d === 2) {
    const total = randomInt(rng, 3 * b, 8 * b);
    const sols = [];
    for (let y = 0; b * y <= total; y++) if ((total - b * y) % a === 0) sols.push([(total - b * y) / a, y]);
    return make('o.eq', d, { kind: 'count', a, b, total }, {
      prompt: L(
        `In how many ways can the number ${total} be written as a sum of several ${a}s and ${b}s? The order does not matter, and using only one of the two numbers is allowed.`,
        `Сколькими способами можно получить сумму ${total}, складывая только числа ${a} и ${b}? Порядок слагаемых не важен, можно брать и только одно из двух чисел.`,
        `${total} санын тек ${a} және ${b} сандарын қосу арқылы неше тәсілмен алуға болады? Қосылғыштардың реті маңызды емес, екі санның тек біреуін ғана қолдануға да болады.`,
      ),
      ex: steps(
        L(
          `We need non-negative integers x and y with ${a}x + ${b}y = ${total}. Try every y from 0 to ${Math.floor(total / b)} and check whether the rest is divisible by ${a}.`,
          `Нужны целые неотрицательные x и y, для которых ${a}x + ${b}y = ${total}. Перебираем y от 0 до ${Math.floor(total / b)} и проверяем, делится ли остаток суммы на ${a}.`,
          `${a}x + ${b}y = ${total} болатын теріс емес бүтін x пен y керек. y-ті 0-ден ${Math.floor(total / b)}-ге дейін тексеріп, соманың қалғаны ${a}-ге бөліне ме - соны қараймыз.`,
        ),
        sols.length
          ? L(
              `Suitable pairs (x; y): ${sols.map(([x, y]) => `(${x}; ${y})`).join(', ')}. There are ${sols.length}.`,
              `Подходят пары (x; y): ${sols.map(([x, y]) => `(${x}; ${y})`).join(', ')}. Всего ${sols.length}.`,
              `Сәйкес келетін (x; y) жұптары: ${sols.map(([x, y]) => `(${x}; ${y})`).join(', ')}. Барлығы ${sols.length}.`,
            )
          : L('No pair works, so the answer is 0.', 'Ни одна пара не подходит, поэтому ответ 0.', 'Ешбір жұп сәйкес келмейді, сондықтан жауап 0.'),
      ),
      ...ask(ctx, sols.length, [sols.length + 1, sols.length + 2, Math.floor(total / b), sols.length - 1].filter((v) => v !== sols.length && v >= 0)),
    });
  }
  const ans = a * b - a - b;
  return make('o.eq', d, { kind: 'frobenius', a, b }, {
    prompt: L(
      `A shop sells sweets only in boxes of ${a} and boxes of ${b}. What is the largest number of sweets that cannot be bought exactly?`,
      `В магазине конфеты продают только коробками по ${a} и по ${b} штук. Какое наибольшее количество конфет нельзя купить ровно, не вскрывая коробки?`,
      `Дүкенде кәмпит тек ${a} және ${b} даналық қораптармен сатылады. Қораптарды ашпай дәл сатып алуға болмайтын кәмпиттің ең үлкен саны қандай?`,
    ),
    ex: steps(
      L(
        `${a} and ${b} have no common divisor greater than 1. For such numbers the largest sum that cannot be made is a${TIMES}b ${MINUS} a ${MINUS} b.`,
        `Числа ${a} и ${b} взаимно просты. Для таких чисел наибольшая сумма, которую нельзя набрать, равна a${TIMES}b ${MINUS} a ${MINUS} b.`,
        `${a} мен ${b} сандары өзара жай. Мұндай сандар үшін жинауға болмайтын ең үлкен қосынды a${TIMES}b ${MINUS} a ${MINUS} b-ға тең.`,
      ),
      same(`${a} ${TIMES} ${b} ${MINUS} ${a} ${MINUS} ${b} = ${ans}`),
      L(
        `Every number greater than ${ans} can be bought, and ${ans} itself cannot.`,
        `Любое количество больше ${ans} купить можно, а ровно ${ans} - нельзя.`,
        `${ans}-ден үлкен кез келген санды сатып алуға болады, ал дәл ${ans}-ді - болмайды.`,
      ),
    ),
    ...ask(ctx, ans, [a * b, a * b - 1, a + b - 1, ans - a, ans + b].filter((v) => v !== ans && v > 0)),
  });
}
