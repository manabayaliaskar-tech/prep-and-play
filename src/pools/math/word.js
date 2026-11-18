// Текстовые задачи: движение, совместная работа, покупки, растворы и смеси.

import { gcd } from '../../core/format.js';
import { pick, randomInt } from '../../core/random.js';
import { L, ask, n, poolQ, same, steps } from '../gen.js';
import { frac } from './fractions.js';

const TIMES = '×';
const DIV = '÷';
const MINUS = '−';

export function motion(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const v = 5 * randomInt(rng, 8, 18);
    const t = randomInt(rng, 2, 6);
    const s = v * t;
    const kind = randomInt(rng, 0, 2);
    if (kind === 0) {
      return poolQ('m.motion', d, {
        prompt: L(
          `A car travels at ${v} km/h. How many kilometres will it cover in ${t} hours?`,
          `Автомобиль едет со скоростью ${v} км/ч. Сколько километров он проедет за ${t} ч?`,
          `Автомобиль ${v} км/сағ жылдамдықпен жүреді. Ол ${t} сағатта неше километр жүреді?`,
        ),
        ex: steps(L('Distance = speed × time.', 'Расстояние = скорость × время.', 'Қашықтық = жылдамдық × уақыт.'), same(`${v} ${TIMES} ${t} = ${s}`)),
        ...ask(ctx, s, [v + t, s + v, s - v, v * (t + 2)].filter((x) => x !== s)),
      });
    }
    if (kind === 1) {
      return poolQ('m.motion', d, {
        prompt: L(
          `A car covered ${s} km in ${t} hours. Find its speed in km/h.`,
          `Автомобиль проехал ${s} км за ${t} ч. Найди его скорость в км/ч.`,
          `Автомобиль ${t} сағатта ${s} км жүрді. Оның жылдамдығын км/сағ-пен тап.`,
        ),
        ex: steps(L('Speed = distance ÷ time.', 'Скорость = расстояние ÷ время.', 'Жылдамдық = қашықтық ÷ уақыт.'), same(`${s} ${DIV} ${t} = ${v}`)),
        ...ask(ctx, v, [v + 5, v - 5, v + 10, s - t].filter((x) => x !== v)),
      });
    }
    return poolQ('m.motion', d, {
      prompt: L(
        `A car travels at ${v} km/h. How many hours will it need to cover ${s} km?`,
        `Автомобиль едет со скоростью ${v} км/ч. За сколько часов он проедет ${s} км?`,
        `Автомобиль ${v} км/сағ жылдамдықпен жүреді. Ол ${s} км жолды неше сағатта жүріп өтеді?`,
      ),
      ex: steps(L('Time = distance ÷ speed.', 'Время = расстояние ÷ скорость.', 'Уақыт = қашықтық ÷ жылдамдық.'), same(`${s} ${DIV} ${v} = ${t}`)),
      ...ask(ctx, t, [t + 1, t - 1, t + 2, t * 2].filter((x) => x !== t && x > 0)),
    });
  }
  if (d === 2) {
    const v1 = 5 * randomInt(rng, 9, 18);
    if (rng() < 0.5) {
      const v2 = 5 * randomInt(rng, 8, 16);
      const t = randomInt(rng, 2, 5);
      const s = (v1 + v2) * t;
      return poolQ('m.motion', d, {
        prompt: L(
          `Two cars start at the same time from two towns ${s} km apart and drive towards each other at ${v1} km/h and ${v2} km/h. In how many hours will they meet?`,
          `Из двух городов, расстояние между которыми ${s} км, одновременно навстречу друг другу выехали два автомобиля со скоростями ${v1} км/ч и ${v2} км/ч. Через сколько часов они встретятся?`,
          `Арақашықтығы ${s} км екі қаладан бір уақытта бір-біріне қарсы ${v1} км/сағ және ${v2} км/сағ жылдамдықпен екі автомобиль шықты. Олар неше сағаттан кейін кездеседі?`,
        ),
        ex: steps(
          L(`The closing speed is ${v1} + ${v2} = ${v1 + v2} km/h.`, `Скорость сближения: ${v1} + ${v2} = ${v1 + v2} км/ч.`, `Жақындасу жылдамдығы: ${v1} + ${v2} = ${v1 + v2} км/сағ.`),
          same(`${s} ${DIV} ${v1 + v2} = ${t}`),
        ),
        ...ask(ctx, t, [t + 1, t - 1, t + 2, t * 2].filter((x) => x !== t && x > 0)),
      });
    }
    const diff = 5 * randomInt(rng, 2, 5);
    const v2 = v1 - diff;
    const t = randomInt(rng, 2, 6);
    const gap = diff * t;
    return poolQ('m.motion', d, {
      prompt: L(
        `A cyclist rides at ${v2} km/h. A motorcyclist starts ${gap} km behind and rides in the same direction at ${v1} km/h. In how many hours will the motorcyclist catch up?`,
        `Велосипедист едет со скоростью ${v2} км/ч. Мотоциклист выезжает вдогонку, отставая на ${gap} км, и едет в том же направлении со скоростью ${v1} км/ч. Через сколько часов он догонит велосипедиста?`,
        `Велосипедші ${v2} км/сағ жылдамдықпен жүреді. Мотоциклші ${gap} км артта қалып, сол бағытта ${v1} км/сағ жылдамдықпен қуып шығады. Ол велосипедшіні неше сағаттан кейін қуып жетеді?`,
      ),
      ex: steps(
        L(`The gap closes at ${v1} ${MINUS} ${v2} = ${diff} km/h.`, `Скорость сближения: ${v1} ${MINUS} ${v2} = ${diff} км/ч.`, `Жақындасу жылдамдығы: ${v1} ${MINUS} ${v2} = ${diff} км/сағ.`),
        same(`${gap} ${DIV} ${diff} = ${t}`),
      ),
      ...ask(ctx, t, [t + 1, t - 1, t + 2, t * 2].filter((x) => x !== t && x > 0)),
    });
  }
  // Лодка: по течению p км/ч, против течения q км/ч.
  let p;
  let q;
  do {
    q = 2 * randomInt(rng, 3, 9);
    p = q + 2 * randomInt(rng, 1, 4);
  } while (gcd(p, q) === 1);
  const g = gcd(p, q);
  const t1 = q / g;
  const t2 = p / g;
  const s = (p * q) / g;
  const current = (p - q) / 2;
  const own = (p + q) / 2;
  const askCurrent = rng() < 0.5;
  const ans = askCurrent ? current : own;
  return poolQ('m.motion', d, {
    prompt: askCurrent
      ? L(
          `A boat covers ${s} km downstream in ${t1} h and the same distance upstream in ${t2} h. Find the speed of the current in km/h.`,
          `Лодка проходит ${s} км по течению за ${t1} ч, а то же расстояние против течения - за ${t2} ч. Найди скорость течения в км/ч.`,
          `Қайық ағыс бойымен ${s} км жолды ${t1} сағатта, ал ағысқа қарсы сол жолды ${t2} сағатта жүзіп өтеді. Ағыс жылдамдығын км/сағ-пен тап.`,
        )
      : L(
          `A boat covers ${s} km downstream in ${t1} h and the same distance upstream in ${t2} h. Find the speed of the boat in still water in km/h.`,
          `Лодка проходит ${s} км по течению за ${t1} ч, а то же расстояние против течения - за ${t2} ч. Найди собственную скорость лодки в км/ч.`,
          `Қайық ағыс бойымен ${s} км жолды ${t1} сағатта, ал ағысқа қарсы сол жолды ${t2} сағатта жүзіп өтеді. Қайықтың меншікті жылдамдығын км/сағ-пен тап.`,
        ),
    ex: steps(
      L(`Downstream speed: ${s} ${DIV} ${t1} = ${p} km/h.`, `Скорость по течению: ${s} ${DIV} ${t1} = ${p} км/ч.`, `Ағыс бойымен жылдамдық: ${s} ${DIV} ${t1} = ${p} км/сағ.`),
      L(`Upstream speed: ${s} ${DIV} ${t2} = ${q} km/h.`, `Скорость против течения: ${s} ${DIV} ${t2} = ${q} км/ч.`, `Ағысқа қарсы жылдамдық: ${s} ${DIV} ${t2} = ${q} км/сағ.`),
      askCurrent
        ? L(`The current is half the difference: (${p} ${MINUS} ${q}) ${DIV} 2 = ${current}.`, `Скорость течения - половина разности: (${p} ${MINUS} ${q}) ${DIV} 2 = ${current}.`, `Ағыс жылдамдығы - айырманың жартысы: (${p} ${MINUS} ${q}) ${DIV} 2 = ${current}.`)
        : L(`The boat's own speed is half the sum: (${p} + ${q}) ${DIV} 2 = ${own}.`, `Собственная скорость - половина суммы: (${p} + ${q}) ${DIV} 2 = ${own}.`, `Меншікті жылдамдық - қосындының жартысы: (${p} + ${q}) ${DIV} 2 = ${own}.`),
    ),
    ...ask(ctx, ans, [askCurrent ? own : current, p - q, p, q].filter((x) => x !== ans)),
  });
}

const PAIRS = [
  [3, 6, 2],
  [4, 12, 3],
  [6, 12, 4],
  [10, 15, 6],
  [12, 24, 8],
  [20, 30, 12],
  [6, 30, 5],
  [10, 40, 8],
  [9, 18, 6],
  [15, 30, 10],
];

export function work(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const rate = randomInt(rng, 5, 20);
    const t = randomInt(rng, 3, 12);
    const total = rate * t;
    return poolQ('m.work', d, {
      prompt: L(
        `A printer prints ${rate} pages per minute. How many minutes does it need to print ${total} pages?`,
        `Принтер печатает ${rate} стр. в минуту. За сколько минут он напечатает документ объёмом ${total} стр.?`,
        `Принтер минутына ${rate} бет басады. Ол ${total} бетті неше минутта басып шығарады?`,
      ),
      ex: steps(L('Time = amount of work ÷ rate.', 'Время = объём работы ÷ производительность.', 'Уақыт = жұмыс көлемі ÷ өнімділік.'), same(`${total} ${DIV} ${rate} = ${t}`)),
      ...ask(ctx, t, [t + 1, t - 1, t + 2, t * 2].filter((x) => x !== t && x > 0)),
    });
  }
  const [a, b, both] = pick(rng, PAIRS);
  if (d === 2) {
    return poolQ('m.work', d, {
      prompt: L(
        `One pipe fills a pool in ${a} hours, and another pipe fills it in ${b} hours. In how many hours will both pipes fill the pool together?`,
        `Одна труба наполняет бассейн за ${a} ч, а другая - за ${b} ч. За сколько часов наполнят бассейн обе трубы вместе?`,
        `Бір құбыр бассейнді ${a} сағатта, ал екіншісі ${b} сағатта толтырады. Екі құбыр бірге бассейнді неше сағатта толтырады?`,
      ),
      ex: steps(
        L(
          `In one hour the pipes fill ${frac(1, a)} and ${frac(1, b)} of the pool.`,
          `За один час трубы наполняют ${frac(1, a)} и ${frac(1, b)} бассейна.`,
          `Бір сағатта құбырлар бассейннің ${frac(1, a)} және ${frac(1, b)} бөлігін толтырады.`,
        ),
        same(`${frac(1, a)} + ${frac(1, b)} = ${frac(1, both)}`),
        L(`Together they need ${both} hours.`, `Вместе им нужно ${both} ч.`, `Бірге оларға ${both} сағат керек.`),
      ),
      ...ask(ctx, both, [a + b, (a + b) / 2, b - a, both + 1].filter((x) => x !== both && Number.isInteger(x))),
    });
  }
  return poolQ('m.work', d, {
    prompt: L(
      `Two workers finish a job together in ${both} hours. The first worker alone needs ${a} hours. How many hours does the second worker need alone?`,
      `Двое рабочих вместе выполняют работу за ${both} ч. Первый рабочий один выполняет её за ${a} ч. За сколько часов выполнит эту работу один второй рабочий?`,
      `Екі жұмысшы бірге жұмысты ${both} сағатта бітіреді. Бірінші жұмысшы жалғыз өзі ${a} сағатта бітіреді. Екінші жұмысшы жалғыз өзі неше сағатта бітіреді?`,
    ),
    ex: steps(
      L(
        `Together they do ${frac(1, both)} of the job per hour, the first one does ${frac(1, a)}.`,
        `Вместе они выполняют ${frac(1, both)} работы в час, первый - ${frac(1, a)}.`,
        `Бірге олар сағатына жұмыстың ${frac(1, both)} бөлігін, біріншісі ${frac(1, a)} бөлігін орындайды.`,
      ),
      same(`${frac(1, both)} ${MINUS} ${frac(1, a)} = ${frac(1, b)}`),
      L(`The second worker needs ${b} hours.`, `Второму рабочему нужно ${b} ч.`, `Екінші жұмысшыға ${b} сағат керек.`),
    ),
    ...ask(ctx, b, [a - both, a + both, b + a, b - 1].filter((x) => x !== b && x > 0)),
  });
}

export function mixtures(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const price = 10 * randomInt(rng, 3, 25);
    const k = randomInt(rng, 2, 4);
    const m = randomInt(rng, 7, 12);
    const ans = price * m;
    return poolQ('m.mix', d, {
      prompt: L(
        `${k} notebooks cost ${n(price * k)}. How much do ${m} such notebooks cost?`,
        `${k} тетради стоят ${n(price * k)}. Сколько стоят ${m} таких тетрадей?`,
        `${k} дәптер ${n(price * k)} тұрады. Осындай ${m} дәптер қанша тұрады?`,
      ),
      ex: steps(
        L(`One notebook costs ${n(price * k)} ${DIV} ${k} = ${price}.`, `Одна тетрадь стоит ${n(price * k)} ${DIV} ${k} = ${price}.`, `Бір дәптер ${n(price * k)} ${DIV} ${k} = ${price} тұрады.`),
        same(`${price} ${TIMES} ${m} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [price * k * m, price * (m - k), ans + price, ans - price].filter((x) => x !== ans)),
    });
  }
  if (d === 2) {
    const [p, q] = pick(rng, [[30, 20], [40, 25], [50, 20], [20, 10], [25, 10], [60, 40], [30, 10], [40, 10], [50, 40]]);
    const j = randomInt(rng, 1, 4);
    const total = p * 10 * j;
    const mass = q * 10 * j;
    const water = total - mass;
    return poolQ('m.mix', d, {
      prompt: L(
        `${water} g of water was added to ${mass} g of a ${p}% salt solution. Find the concentration of the new solution in percent.`,
        `К ${mass} г ${p}%-го раствора соли добавили ${water} г воды. Найди концентрацию нового раствора в процентах.`,
        `${mass} г ${p}%-дық тұз ерітіндісіне ${water} г су қосылды. Жаңа ерітіндінің концентрациясын пайызбен тап.`,
      ),
      ex: steps(
        L(`Salt: ${mass} ${TIMES} ${p} ${DIV} 100 = ${(mass * p) / 100} g. It does not change.`, `Соли: ${mass} ${TIMES} ${p} ${DIV} 100 = ${(mass * p) / 100} г. Её количество не меняется.`, `Тұз: ${mass} ${TIMES} ${p} ${DIV} 100 = ${(mass * p) / 100} г. Оның мөлшері өзгермейді.`),
        L(`New mass: ${mass} + ${water} = ${total} g.`, `Новая масса раствора: ${mass} + ${water} = ${total} г.`, `Ерітіндінің жаңа массасы: ${mass} + ${water} = ${total} г.`),
        same(`${(mass * p) / 100} ${DIV} ${total} ${TIMES} 100 = ${q}%`),
      ),
      ...ask(ctx, q, [p - q, p / 2, q + 5, p].filter((x) => x !== q && Number.isInteger(x) && x > 0)),
    });
  }
  let a;
  let b;
  let p1;
  let p2;
  do {
    a = randomInt(rng, 1, 4);
    b = randomInt(rng, 1, 4);
    p1 = 5 * randomInt(rng, 2, 8);
    p2 = 5 * randomInt(rng, 9, 16);
  } while ((a * p1 + b * p2) % (a + b) !== 0);
  const m1 = 100 * a;
  const m2 = 100 * b;
  const ans = (a * p1 + b * p2) / (a + b);
  return poolQ('m.mix', d, {
    prompt: L(
      `${m1} g of a ${p1}% solution is mixed with ${m2} g of a ${p2}% solution of the same substance. Find the concentration of the mixture in percent.`,
      `Смешали ${m1} г ${p1}%-го раствора и ${m2} г ${p2}%-го раствора одного и того же вещества. Найди концентрацию смеси в процентах.`,
      `Бір заттың ${m1} г ${p1}%-дық ерітіндісі мен ${m2} г ${p2}%-дық ерітіндісі араластырылды. Қоспаның концентрациясын пайызбен тап.`,
    ),
    ex: steps(
      L(
        `Substance: ${a * p1} g in the first solution and ${b * p2} g in the second, ${a * p1 + b * p2} g in total.`,
        `Вещества: ${a * p1} г в первом растворе и ${b * p2} г во втором, всего ${a * p1 + b * p2} г.`,
        `Зат: бірінші ерітіндіде ${a * p1} г, екіншісінде ${b * p2} г, барлығы ${a * p1 + b * p2} г.`,
      ),
      L(`Total mass: ${m1} + ${m2} = ${m1 + m2} g.`, `Общая масса: ${m1} + ${m2} = ${m1 + m2} г.`, `Жалпы масса: ${m1} + ${m2} = ${m1 + m2} г.`),
      same(`${a * p1 + b * p2} ${DIV} ${m1 + m2} ${TIMES} 100 = ${ans}%`),
    ),
    ...ask(ctx, ans, [(p1 + p2) / 2, p1, ans + 5, ans - 5, p2].filter((x) => x !== ans && Number.isInteger(x) && x > 0 && x < 100)),
  });
}
