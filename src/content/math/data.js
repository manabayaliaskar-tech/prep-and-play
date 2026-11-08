// Домен «Задачи и анализ данных»: отношения и скорости, проценты, статистика,
// вероятность по таблице, линейные модели по данным.

import { pick, randomInt } from '../../core/random.js';
import { MINUS, fracHtml, fracText, num, simplify, v } from '../../core/format.js';
import { choose, makeMc, mathQ, st, steps } from './util.js';

const same = (text) => st(text, text, text);
const pct = (x) => `${num(x)}%`;

export function ratios(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 2, 5);
    let b = randomInt(rng, 1, 4);
    if (b === a) b += 1;
    const n = randomInt(rng, 2, 6);
    const ans = a * n;
    return mathQ('ratios', d, {
      prompt: `A recipe uses ${a} cups of flour for every ${b} ${b === 1 ? 'cup' : 'cups'} of sugar. How many cups of flour are needed for ${b * n} cups of sugar?`,
      ex: steps(
        st(
          `${b * n} cups of sugar is ${n} times as much as ${b} cups (${b * n} ÷ ${b} = ${n}).`,
          `${b * n} стаканов сахара — это в ${n} раз больше, чем ${b} (${b * n} ÷ ${b} = ${n}).`,
          `${b * n} стақан қант ${b} стақаннан ${n} есе көп (${b * n} ÷ ${b} = ${n}).`,
        ),
        st(
          `So the flour is also multiplied by ${n}: ${a} · ${n} = ${ans} cups.`,
          `Значит, муки тоже нужно в ${n} раз больше: ${a} · ${n} = ${ans} стаканов.`,
          `Демек, ұн да ${n} есе көп керек: ${a} · ${n} = ${ans} стақан.`,
        ),
      ),
      ...choose(ctx, ans, [(b * n * b) / a, b * n + (a - b), a * b * n].filter(Number.isInteger)),
    });
  }
  if (d === 2) {
    const rate = randomInt(rng, 12, 45);
    const m1 = randomInt(rng, 4, 10);
    const m2 = randomInt(rng, 15, 45);
    const c = rate * m1;
    const ans = rate * m2;
    return mathQ('ratios', d, {
      prompt: `A machine fills ${num(c)} bottles in ${m1} minutes. At this rate, how many bottles will the machine fill in ${m2} minutes?`,
      ex: steps(
        st(
          `Find the unit rate: ${num(c)} ÷ ${m1} = ${rate} bottles per minute.`,
          `Найдём скорость за 1 минуту: ${num(c)} ÷ ${m1} = ${rate} бутылок в минуту.`,
          `1 минуттағы жылдамдықты табамыз: ${num(c)} ÷ ${m1} = минутына ${rate} бөтелке.`,
        ),
        same(`${rate} · ${m2} = ${num(ans)}.`),
      ),
      ...choose(ctx, ans, [c + (m2 - m1), c * m2, rate * (m2 - m1)]),
    });
  }
  const k = randomInt(rng, 2, 6);
  const kmh = 18 * k;
  const ans = 5 * k;
  return mathQ('ratios', d, {
    prompt: `A cyclist rides at a constant speed of ${kmh} kilometers per hour. What is this speed in meters per second? (1 kilometer = 1,000 meters)`,
    ex: steps(
      st(
        `1 hour = 60 · 60 = 3,600 seconds, and ${kmh} km = ${num(kmh * 1000)} m.`,
        `1 час = 60 · 60 = 3 600 секунд, а ${kmh} км = ${num(kmh * 1000)} м.`,
        `1 сағат = 60 · 60 = 3 600 секунд, ал ${kmh} км = ${num(kmh * 1000)} м.`,
      ),
      same(`${num(kmh * 1000)} ÷ 3,600 = ${ans}.`),
    ),
    ...choose(ctx, ans, [(kmh * 1000) / 60, kmh * 3.6, kmh / 60]),
  });
}

export function percent(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const p = pick(rng, [5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 75]);
    const N = 20 * randomInt(rng, 2, 20);
    const ans = (p * N) / 100;
    return mathQ('percent', d, {
      prompt: `What is ${p}% of ${num(N)}?`,
      ex: steps(
        st(
          `${p}% means ${p}/100 = ${(p / 100).toString()}.`,
          `${p}% — это ${p}/100 = ${(p / 100).toString()}.`,
          `${p}% дегеніміз ${p}/100 = ${(p / 100).toString()}.`,
        ),
        same(`${(p / 100).toString()} · ${num(N)} = ${num(ans)}.`),
      ),
      ...choose(ctx, ans, [N - ans, (p * N) / 10, N / p].filter(Number.isInteger)),
    });
  }
  if (d === 2) {
    let A;
    let rate;
    do {
      A = pick(rng, [40, 50, 60, 80, 120, 150, 200, 250]);
      rate = pick(rng, [10, 15, 20, 25, 30, 40]);
    } while ((A * rate) % 100 !== 0);
    const up = rng() < 0.6;
    const B = up ? A + (A * rate) / 100 : A - (A * rate) / 100;
    const word = up ? 'increase' : 'decrease';
    const change = Math.abs(B - A);
    return mathQ('percent', d, {
      prompt: `The price of a pair of headphones changed from $${A} to $${B}. What was the percent ${word} in the price?`,
      ex: steps(
        st(
          `Percent change = (change ÷ original price) · 100%. The change is ${change}.`,
          `Процент изменения = (изменение ÷ исходная цена) · 100%. Изменение: ${change}.`,
          `Өзгеріс пайызы = (өзгеріс ÷ бастапқы баға) · 100%. Өзгеріс: ${change}.`,
        ),
        st(
          `${change} ÷ ${A} = ${(change / A).toString()} = ${rate}%. Divide by the ORIGINAL price (${A}), not the new one.`,
          `${change} ÷ ${A} = ${(change / A).toString()} = ${rate}%. Делим на ИСХОДНУЮ цену (${A}), а не на новую.`,
          `${change} ÷ ${A} = ${(change / A).toString()} = ${rate}%. БАСТАПҚЫ бағаға (${A}) бөлеміз, жаңасына емес.`,
        ),
      ),
      mc: makeMc(rng, rate, [change, Math.round(((change / B) * 100) * 10) / 10, 100 + rate], pct),
    });
  }
  const pairs = [
    [-20, 25],
    [10, 20],
    [25, -20],
    [-10, 10],
    [50, -50],
    [-25, 20],
    [20, 20],
    [-40, 50],
    [30, -10],
  ];
  const [c1, c2] = pick(rng, pairs);
  const f1 = 1 + c1 / 100;
  const f2 = 1 + c2 / 100;
  const ans = Math.round(f1 * f2 * 10000) / 100;
  const verb = (c) => (c > 0 ? 'increased' : 'decreased');
  return mathQ('percent', d, {
    prompt: `The price of a jacket was ${verb(c1)} by ${Math.abs(c1)}%, and then the new price was ${verb(c2)} by ${Math.abs(c2)}%. The final price is what percent of the original price?`,
    ex: steps(
      st(
        `A change of ${c1 > 0 ? '+' : MINUS}${Math.abs(c1)}% multiplies the price by ${f1}; a change of ${c2 > 0 ? '+' : MINUS}${Math.abs(c2)}% multiplies it by ${f2}.`,
        `Изменение на ${c1 > 0 ? '+' : MINUS}${Math.abs(c1)}% умножает цену на ${f1}, изменение на ${c2 > 0 ? '+' : MINUS}${Math.abs(c2)}% — на ${f2}.`,
        `${c1 > 0 ? '+' : MINUS}${Math.abs(c1)}% өзгеріс бағаны ${f1} санына, ${c2 > 0 ? '+' : MINUS}${Math.abs(c2)}% өзгеріс ${f2} санына көбейтеді.`,
      ),
      st(
        `${f1} · ${f2} = ${(f1 * f2).toFixed(2)}, so the final price is ${num(ans)}% of the original. Percents can't simply be added!`,
        `${f1} · ${f2} = ${(f1 * f2).toFixed(2)}, значит итоговая цена — ${num(ans)}% от исходной. Проценты нельзя просто складывать!`,
        `${f1} · ${f2} = ${(f1 * f2).toFixed(2)}, демек соңғы баға бастапқының ${num(ans)}% құрайды. Пайыздарды жай қосуға болмайды!`,
      ),
    ),
    ...choose(ctx, ans, [100 + c1 + c2, 100 + c1, 100 + c2], { fmt: pct }),
  });
}

export function stats(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    let values;
    do {
      values = Array.from({ length: 5 }, () => randomInt(rng, 55, 98));
    } while (values.reduce((s, x) => s + x, 0) % 5 !== 0);
    const sum = values.reduce((s, x) => s + x, 0);
    const mean = sum / 5;
    const sorted = [...values].sort((a, b) => a - b);
    return mathQ('stats', d, {
      prompt: `The test scores of five students are ${values.join(', ')}. What is the mean score?`,
      ex: steps(
        st(`Mean = sum ÷ number of values.`, `Среднее = сумма ÷ количество чисел.`, `Орта мән = қосынды ÷ сандар саны.`),
        same(`(${values.join(' + ')}) ÷ 5 = ${sum} ÷ 5 = ${mean}.`),
      ),
      ...choose(ctx, mean, [sorted[2], sorted[4] - sorted[0], sum / 4].filter(Number.isInteger)),
    });
  }
  if (d === 2) {
    let values;
    let sorted;
    do {
      values = Array.from({ length: 6 }, () => randomInt(rng, 40, 99));
      sorted = [...values].sort((a, b) => a - b);
    } while (new Set(values).size < 6);
    const median = (sorted[2] + sorted[3]) / 2;
    const mean = values.reduce((s, x) => s + x, 0) / 6;
    return mathQ('stats', d, {
      prompt: `The list shows the number of minutes six students spent on homework: ${values.join(', ')}. What is the median of the list?`,
      ex: steps(
        st(`Sort the list: ${sorted.join(', ')}.`, `Упорядочим список: ${sorted.join(', ')}.`, `Тізімді реттейміз: ${sorted.join(', ')}.`),
        st(
          `There are 6 values, so the median is the average of the 3rd and 4th: (${sorted[2]} + ${sorted[3]}) ÷ 2 = ${num(median)}.`,
          `Чисел 6 — чётное количество, поэтому медиана — среднее 3-го и 4-го: (${sorted[2]} + ${sorted[3]}) ÷ 2 = ${num(median)}.`,
          `Сандар саны 6 (жұп), сондықтан медиана — 3-ші және 4-ші сандардың орташасы: (${sorted[2]} + ${sorted[3]}) ÷ 2 = ${num(median)}.`,
        ),
      ),
      ...choose(ctx, median, [(values[2] + values[3]) / 2, Math.round(mean * 10) / 10, sorted[2], sorted[3]]),
    });
  }
  const n = randomInt(rng, 6, 12);
  const m1 = randomInt(rng, 70, 82);
  let delta = randomInt(rng, 1, 2);
  if (m1 + (n + 1) * delta > 100) delta = 1;
  const m2 = m1 + delta;
  const ans = (n + 1) * m2 - n * m1;
  return mathQ('stats', d, {
    prompt: `The mean score of ${n} students on a quiz was ${m1}. When a new student's score was added, the mean score of all ${n + 1} students became ${m2}. What was the new student's score?`,
    ex: steps(
      st(
        `Total of the first ${n} scores: ${n} · ${m1} = ${n * m1}.`,
        `Сумма первых ${n} результатов: ${n} · ${m1} = ${n * m1}.`,
        `Алғашқы ${n} нәтиженің қосындысы: ${n} · ${m1} = ${n * m1}.`,
      ),
      st(
        `Total of all ${n + 1} scores: ${n + 1} · ${m2} = ${(n + 1) * m2}.`,
        `Сумма всех ${n + 1} результатов: ${n + 1} · ${m2} = ${(n + 1) * m2}.`,
        `Барлық ${n + 1} нәтиженің қосындысы: ${n + 1} · ${m2} = ${(n + 1) * m2}.`,
      ),
      st(
        `New score = ${(n + 1) * m2} ${MINUS} ${n * m1} = ${ans}.`,
        `Новый результат = ${(n + 1) * m2} ${MINUS} ${n * m1} = ${ans}.`,
        `Жаңа нәтиже = ${(n + 1) * m2} ${MINUS} ${n * m1} = ${ans}.`,
      ),
    ),
    ...choose(ctx, ans, [m2, m1 + delta * n, m1 + delta]),
  });
}

export function probability(ctx, d) {
  const { rng } = ctx;
  for (;;) {
    const a = randomInt(rng, 8, 30);
    const b = randomInt(rng, 8, 30);
    const c = randomInt(rng, 8, 30);
    const e = randomInt(rng, 8, 30);
    const r1 = a + b;
    const r2 = c + e;
    const k1 = a + c;
    const k2 = b + e;
    const total = r1 + r2;
    const table = {
      headers: ['', 'Robotics', 'Debate', 'Total'],
      rows: [
        ['Grade 10', a, b, r1],
        ['Grade 11', c, e, r2],
        ['Total', k1, k2, total],
      ],
    };
    const intro = `The table shows the number of students in grades 10 and 11 who chose each of two clubs. Each student chose exactly one club.`;
    let prompt;
    let ans;
    let wrong;
    let ex;
    if (d === 1) {
      prompt = `${intro} If one of these students is selected at random, what is the probability that the student is in grade 11?`;
      ans = [r2, total];
      wrong = [[r2, r1], [c, total], [r1, total], [e, r2]];
      ex = steps(
        st(
          `Probability = favorable ÷ total. Grade 11 students: ${r2}; all students: ${total}.`,
          `Вероятность = подходящие ÷ все. Учеников 11 класса: ${r2}; всего учеников: ${total}.`,
          `Ықтималдық = қолайлы ÷ барлығы. 11-сынып оқушылары: ${r2}; барлық оқушылар: ${total}.`,
        ),
        same(`${r2}/${total} = ${fracText(r2, total)}.`),
      );
    } else if (d === 2) {
      prompt = `${intro} If a grade 10 student is selected at random, what is the probability that the student chose Debate?`;
      ans = [b, r1];
      wrong = [[b, total], [b, k2], [r1, total], [a, r1]];
      ex = steps(
        st(
          `"A grade 10 student is selected" — so only the grade 10 row counts: ${r1} students.`,
          `«Выбран ученик 10 класса» — значит, считаем только строку 10 класса: ${r1} учеников.`,
          `«10-сынып оқушысы таңдалды» — тек 10-сынып жолын санаймыз: ${r1} оқушы.`,
        ),
        st(
          `Of them, ${b} chose Debate: ${b}/${r1} = ${fracText(b, r1)}.`,
          `Из них Debate выбрали ${b}: ${b}/${r1} = ${fracText(b, r1)}.`,
          `Олардың ${b} оқушысы Debate таңдады: ${b}/${r1} = ${fracText(b, r1)}.`,
        ),
      );
    } else {
      prompt = `${intro} If a student who chose Robotics is selected at random, what is the probability that the student is in grade 11?`;
      ans = [c, k1];
      wrong = [[c, r2], [c, total], [k1, total], [a, k1]];
      ex = steps(
        st(
          `The condition "chose Robotics" limits us to the Robotics column: ${k1} students.`,
          `Условие «выбрал Robotics» оставляет только столбец Robotics: ${k1} учеников.`,
          `«Robotics таңдаған» шарты бойынша тек Robotics бағанын аламыз: ${k1} оқушы.`,
        ),
        st(
          `Of them, ${c} are in grade 11: ${c}/${k1} = ${fracText(c, k1)}.`,
          `Из них в 11 классе ${c}: ${c}/${k1} = ${fracText(c, k1)}.`,
          `Олардың ${c} оқушысы 11-сыныпта: ${c}/${k1} = ${fracText(c, k1)}.`,
        ),
      );
    }
    const keyOf = ([n, m]) => simplify(n, m).join('/');
    const keys = new Set([keyOf(ans), ...wrong.map(keyOf)]);
    if (keys.size < 4) continue;
    if (!ctx.mcOnly && rng() < 0.3) {
      return mathQ('probability', d, {
        prompt,
        table,
        ex,
        spr: { value: ans[0] / ans[1], display: fracText(ans[0], ans[1]) },
      });
    }
    const uniqueWrong = [];
    const seen = new Set([keyOf(ans)]);
    for (const w of wrong) {
      if (!seen.has(keyOf(w))) {
        seen.add(keyOf(w));
        uniqueWrong.push(w);
      }
    }
    const mc = makeMc(rng, ans, uniqueWrong, ([n, m]) => fracHtml(n, m));
    return mathQ('probability', d, { prompt, table, ex, mc });
  }
}

const MODELS = [
  {
    intro: (m, b) =>
      `A biologist measured the height of a plant every week. The line of best fit for the data is <i>y</i> = ${m}<i>x</i> + ${b}, where <i>y</i> is the height of the plant, in centimeters, <i>x</i> weeks after the first measurement.`,
    unit: 'centimeters',
    slopeText: 'The predicted increase in the height of the plant, in centimeters, for each additional week',
    interceptText: 'The predicted height of the plant, in centimeters, at the first measurement',
    others: ['The number of weeks the plant was measured', 'The predicted height of the plant, in centimeters, after one week'],
    ms: [1.5, 2, 2.5, 3, 3.5],
    bs: [10, 12, 15, 20, 24, 30],
  },
  {
    intro: (m, b) =>
      `A company tracked the number of downloads of its app. The line of best fit for the data is <i>y</i> = ${m}<i>x</i> + ${b}, where <i>y</i> is the number of downloads, in thousands, <i>x</i> months after launch.`,
    unit: 'thousand downloads',
    slopeText: 'The predicted increase in downloads, in thousands, for each additional month',
    interceptText: 'The predicted number of downloads, in thousands, at launch',
    others: ['The number of months since launch', 'The total number of downloads, in thousands, after one year'],
    ms: [1.2, 1.5, 2, 2.4, 4],
    bs: [6, 8, 12, 15, 18],
  },
];

export function models(ctx, d) {
  const { rng } = ctx;
  const M = pick(rng, MODELS);
  const m = pick(rng, M.ms);
  const b = pick(rng, M.bs);
  const X = v('x');
  if (d === 1) {
    const x = randomInt(rng, 4, 16);
    const ans = Math.round((m * x + b) * 100) / 100;
    return mathQ('models', d, {
      prompt: `${M.intro(m, b)} According to the line of best fit, what is the predicted value of <i>y</i> when <i>x</i> = ${x}?`,
      ex: steps(
        st(`Substitute ${X} = ${x}:`, `Подставим ${X} = ${x}:`, `${X} = ${x} мәнін қоямыз:`),
        same(`<i>y</i> = ${m} · ${x} + ${b} = ${num(m * x)} + ${b} = ${num(ans)}.`),
      ),
      ...choose(ctx, ans, [Math.round(m * x * 100) / 100, b + x, Math.round((m + b * x) * 100) / 100]),
    });
  }
  if (d === 2) {
    const askSlope = rng() < 0.65;
    const correct = askSlope ? M.slopeText : M.interceptText;
    const wrong = [askSlope ? M.interceptText : M.slopeText, ...M.others];
    return mathQ('models', d, {
      prompt: `${M.intro(m, b)} What is the best interpretation of ${askSlope ? m : b} in this context?`,
      ex: steps(
        st(
          `In <i>y</i> = ${m}${X} + ${b}, the slope (${m}) is how much <i>y</i> changes when ${X} increases by 1.`,
          `В <i>y</i> = ${m}${X} + ${b} угловой коэффициент (${m}) показывает, на сколько меняется <i>y</i>, когда ${X} растёт на 1.`,
          `<i>y</i> = ${m}${X} + ${b} теңдеуінде еңіс (${m}) — ${X} 1-ге артқанда <i>y</i> қаншаға өзгеретінін көрсетеді.`,
        ),
        st(
          `The <i>y</i>-intercept (${b}) is the predicted value when ${X} = 0, at the very start.`,
          `Свободный член (${b}) — это прогноз при ${X} = 0, в самом начале.`,
          `Бос мүше (${b}) — ${X} = 0 кездегі, яғни ең басындағы болжам.`,
        ),
      ),
      mc: makeMc(rng, correct, wrong, (s) => s),
    });
  }
  const x = randomInt(rng, 5, 20);
  const target = Math.round((m * x + b) * 100) / 100;
  return mathQ('models', d, {
    prompt: `${M.intro(m, b)} According to the line of best fit, for what value of <i>x</i> is the predicted value of <i>y</i> equal to ${num(target)}?`,
    ex: steps(
      st(
        `Solve ${num(target)} = ${m}${X} + ${b}.`,
        `Решим уравнение ${num(target)} = ${m}${X} + ${b}.`,
        `${num(target)} = ${m}${X} + ${b} теңдеуін шешеміз.`,
      ),
      same(`${m}${X} = ${num(target)} ${MINUS} ${b} = ${num(target - b)} → ${X} = ${num(target - b)} ÷ ${m} = ${x}.`),
    ),
    ...choose(ctx, x, [Math.round((target / m) * 10) / 10, Math.round(((target + b) / m) * 10) / 10, x + 2]),
  });
}
