// Старшая школа: логарифмы, тригонометрия, комбинаторика, вероятность, производная, статистика.

import { MINUS, fracHtml, gcd, polyStr } from '../../core/format.js';
import { pick, randomInt, shuffle } from '../../core/random.js';
import { L, ask, askFrac, dec, loc, mcText, n, poolQ, same, signed, steps } from '../gen.js';
import { frac } from './fractions.js';

const X = '<i>x</i>';
const TIMES = '×';
const DIV = '÷';
const log = (base, arg) => `log<sub>${base}</sub> ${arg}`;
/** Дробь и, если она сократима, её сокращённый вид. */
const fr = (a, b) => `${frac(a, b)}${gcd(a, b) > 1 ? ` = ${fracHtml(a, b)}` : ''}`;

export function logarithms(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const [a, max] = pick(rng, [[2, 7], [3, 4], [5, 3], [10, 4], [4, 3]]);
    const k = randomInt(rng, 1, max);
    return poolQ('m.log', d, {
      prompt: loc((l) => `${{ en: 'Calculate', ru: 'Вычисли', kk: 'Есепте' }[l]}: ${log(a, n(a ** k))}`),
      ex: steps(
        L(
          `A logarithm is the exponent: to what power must ${a} be raised to get ${n(a ** k)}?`,
          `Логарифм — это показатель степени: в какую степень нужно возвести ${a}, чтобы получить ${n(a ** k)}?`,
          `Логарифм — дәреже көрсеткіші: ${n(a ** k)} шығу үшін ${a} санын қандай дәрежеге шығару керек?`,
        ),
        same(`${a}<sup>${k}</sup> = ${n(a ** k)}, ${log(a, n(a ** k))} = ${k}`),
      ),
      ...ask(ctx, k, [k + 1, k - 1, a, k + 2].filter((v) => v !== k && v >= 0)),
    });
  }
  if (d === 2) {
    const [base, x, y, plus, ans] = pick(rng, [
      [6, 4, 9, true, 2], [10, 25, 4, true, 2], [10, 20, 5, true, 2], [10, 8, 125, true, 3], [12, 3, 48, true, 2],
      [15, 3, 75, true, 2], [6, 12, 3, true, 2], [6, 8, 27, true, 3], [2, 48, 3, false, 4], [3, 54, 2, false, 3],
      [5, 75, 3, false, 2], [2, 80, 5, false, 4], [3, 162, 2, false, 4], [4, 32, 2, false, 2], [10, 50, 2, true, 2],
    ]);
    return poolQ('m.log', d, {
      prompt: loc((l) => `${{ en: 'Calculate', ru: 'Вычисли', kk: 'Есепте' }[l]}: ${log(base, x)} ${plus ? '+' : MINUS} ${log(base, y)}`),
      ex: steps(
        plus
          ? L('The sum of logarithms is the logarithm of the product.', 'Сумма логарифмов равна логарифму произведения.', 'Логарифмдердің қосындысы көбейтіндінің логарифміне тең.')
          : L('The difference of logarithms is the logarithm of the quotient.', 'Разность логарифмов равна логарифму частного.', 'Логарифмдердің айырмасы бөліндінің логарифміне тең.'),
        same(`${log(base, `(${x} ${plus ? TIMES : DIV} ${y})`)} = ${log(base, plus ? x * y : x / y)} = ${ans}`),
      ),
      ...ask(ctx, ans, [ans + 1, ans - 1, plus ? x + y : x - y, ans * 2].filter((v) => v !== ans)),
    });
  }
  const a = pick(rng, [2, 3, 5]);
  const c = randomInt(rng, 2, a === 2 ? 5 : 3);
  const b = randomInt(rng, -6, 9) || 4;
  const x = a ** c - b;
  return poolQ('m.log', d, {
    prompt: L(
      `Solve the equation: ${log(a, `(${X} ${signed(b)})`)} = ${c}`,
      `Реши уравнение: ${log(a, `(${X} ${signed(b)})`)} = ${c}`,
      `Теңдеуді шеш: ${log(a, `(${X} ${signed(b)})`)} = ${c}`,
    ),
    ex: steps(
      L('By the definition of a logarithm:', 'По определению логарифма:', 'Логарифмнің анықтамасы бойынша:'),
      same(`${X} ${signed(b)} = ${a}<sup>${c}</sup> = ${a ** c}`),
      same(`${X} = ${a ** c} ${signed(-b)} = ${n(x)}`),
    ),
    ...ask(ctx, x, [a ** c + b, a * c - b, c - b, x + 1].filter((v) => v !== x)),
  });
}

const VAL = {
  0: '0',
  h: frac(1, 2),
  r2: frac('√2', 2),
  r3: frac('√3', 2),
  1: '1',
  t3: '√3',
  t13: frac('√3', 3),
};
const SIN = { 0: '0', 30: 'h', 45: 'r2', 60: 'r3', 90: '1' };
const TAN = { 0: '0', 30: 't13', 45: '1', 60: 't3' };
const FN_NAME = { sin: same('sin'), cos: same('cos'), tan: L('tan', 'tg', 'tg') };

function trigValue(fn, ref) {
  if (fn === 'sin') return SIN[ref];
  if (fn === 'cos') return SIN[90 - ref];
  return TAN[ref];
}

const withSign = (key, negative) => (negative && key !== '0' ? `${MINUS}${VAL[key]}` : VAL[key]);

export function trig(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const fn = pick(rng, ['sin', 'cos', 'tan']);
    const angle = pick(rng, fn === 'tan' ? [0, 30, 45, 60] : [0, 30, 45, 60, 90]);
    const key = trigValue(fn, angle);
    const others = shuffle(Object.keys(VAL).filter((k) => k !== key), rng).slice(0, 3);
    return poolQ('m.trig', d, {
      prompt: loc((l) => `${{ en: 'Find the value', ru: 'Найди значение', kk: 'Мәнін тап' }[l]}: ${FN_NAME[fn][l]} ${angle}°`),
      ex: steps(
        L('This is a value from the table of special angles — it is worth memorising.', 'Это табличное значение — его стоит запомнить.', 'Бұл — кестелік мән, оны жаттап алған жөн.'),
        loc((l) => `${FN_NAME[fn][l]} ${angle}° = ${VAL[key]}`),
      ),
      mc: mcText(rng, VAL[key], others.map((k) => VAL[k])),
    });
  }
  if (d === 2) {
    const [p, q, h] = pick(rng, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]);
    const [opp, adj] = rng() < 0.5 ? [p, q] : [q, p];
    const wantCos = rng() < 0.5;
    const ans = wantCos ? [adj, h] : [opp, adj];
    return poolQ('m.trig', d, {
      prompt: wantCos
        ? L(
            `An acute angle α has sin α = ${frac(opp, h)}. Find cos α.`,
            `Для острого угла α известно, что sin α = ${frac(opp, h)}. Найди cos α.`,
            `α сүйір бұрышы үшін sin α = ${frac(opp, h)}. cos α мәнін тап.`,
          )
        : L(
            `An acute angle α has sin α = ${frac(opp, h)}. Find tan α.`,
            `Для острого угла α известно, что sin α = ${frac(opp, h)}. Найди tg α.`,
            `α сүйір бұрышы үшін sin α = ${frac(opp, h)}. tg α мәнін тап.`,
          ),
      ex: steps(
        same(`sin<sup>2</sup> α + cos<sup>2</sup> α = 1`),
        same(`cos<sup>2</sup> α = 1 ${MINUS} ${frac(opp * opp, h * h)} = ${frac(adj * adj, h * h)}`),
        L(`The angle is acute, so cos α = ${frac(adj, h)}.`, `Угол острый, поэтому cos α = ${frac(adj, h)}.`, `Бұрыш сүйір, сондықтан cos α = ${frac(adj, h)}.`),
        wantCos ? null : loc((l) => `${FN_NAME.tan[l]} α = sin α ${DIV} cos α = ${frac(opp, adj)}`),
      ),
      ...askFrac(ctx, ans, wantCos ? [[opp, h], [adj, opp], [h - opp, h], [opp, adj]] : [[adj, opp], [adj, h], [opp, h], [h, adj]], { spr: 0 }),
    });
  }
  const fn = pick(rng, ['sin', 'cos', 'tan']);
  const angle = pick(rng, [120, 135, 150, 210, 225, 240, 300, 315, 330]);
  const quadrant = angle < 180 ? 2 : angle < 270 ? 3 : 4;
  const ref = quadrant === 2 ? 180 - angle : quadrant === 3 ? angle - 180 : 360 - angle;
  const negative = { sin: quadrant !== 2, cos: quadrant !== 4, tan: quadrant !== 3 }[fn];
  const key = trigValue(fn, ref);
  const correct = withSign(key, negative);
  const coKey = fn === 'tan' ? (key === 't3' ? 't13' : key === 't13' ? 't3' : 'r2') : trigValue(fn === 'sin' ? 'cos' : 'sin', ref);
  const wrong = [];
  for (const cand of [withSign(key, !negative), withSign(coKey, negative), withSign(coKey, !negative), withSign('1', negative), withSign('h', !negative)]) {
    if (cand !== correct && !wrong.includes(cand) && wrong.length < 3) wrong.push(cand);
  }
  return poolQ('m.trig', d, {
    prompt: loc((l) => `${{ en: 'Find the value', ru: 'Найди значение', kk: 'Мәнін тап' }[l]}: ${FN_NAME[fn][l]} ${angle}°`),
    ex: steps(
      loc(
        (l) =>
          ({
            en: `${angle}° is in quadrant ${quadrant}, where ${FN_NAME[fn].en} is ${negative ? 'negative' : 'positive'}.`,
            ru: `Угол ${angle}° лежит в ${quadrant}-й четверти, где ${FN_NAME[fn].ru} ${negative ? 'отрицателен' : 'положителен'}.`,
            kk: `${angle}° бұрышы ${quadrant}-ширекте жатыр, онда ${FN_NAME[fn].kk} ${negative ? 'теріс' : 'оң'}.`,
          })[l],
      ),
      L(`The reference angle is ${ref}°.`, `Опорный острый угол равен ${ref}°.`, `Тірек сүйір бұрыш ${ref}°-қа тең.`),
      loc((l) => `${FN_NAME[fn][l]} ${angle}° = ${negative ? MINUS : ''}${FN_NAME[fn][l]} ${ref}° = ${correct}`),
    ),
    mc: mcText(rng, correct, wrong),
  });
}

const fact = (k) => (k <= 1 ? 1 : k * fact(k - 1));
const choose = (m, k) => fact(m) / (fact(k) * fact(m - k));

export function combinatorics(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const k = randomInt(rng, 3, 6);
    const ans = fact(k);
    return poolQ('m.comb', d, {
      prompt: L(
        `In how many ways can ${k} different books be arranged in a row on a shelf?`,
        `На полке нужно расставить в ряд книги: их ${k}, и все они разные. Сколькими способами это можно сделать?`,
        `${k} әртүрлі кітапты сөреге қатарынан неше тәсілмен қоюға болады?`,
      ),
      ex: steps(
        L(
          `Any of the ${k} books can go first, any of the remaining ${k - 1} second, and so on.`,
          `На первое место можно поставить любую из ${k} книг, на второе — любую из оставшихся ${k - 1}, и так далее.`,
          `Бірінші орынға ${k} кітаптың кез келгенін, екіншіге қалған ${k - 1} кітаптың кез келгенін қоюға болады, осылай жалғасады.`,
        ),
        same(`${k}! = ${Array.from({ length: k }, (_, i) => k - i).join(` ${TIMES} `)} = ${ans}`),
      ),
      ...ask(ctx, ans, [k * k, k * (k - 1), ans / 2, ans + k].filter((v) => v !== ans)),
    });
  }
  if (d === 2) {
    const m = randomInt(rng, 5, 10);
    if (rng() < 0.5) {
      const k = randomInt(rng, 2, 3);
      const ans = choose(m, k);
      return poolQ('m.comb', d, {
        prompt: L(
          `In how many ways can ${k} students be chosen from ${m} for a team? The order does not matter.`,
          `Сколькими способами можно выбрать ${k} учеников из ${m} в команду? Порядок не важен.`,
          `${m} оқушының ішінен командаға ${k} оқушыны неше тәсілмен таңдауға болады? Реті маңызды емес.`,
        ),
        ex: steps(
          L('The order does not matter, so these are combinations.', 'Порядок не важен, значит это сочетания.', 'Реті маңызды емес, демек бұл — терулер.'),
          same(
            `<i>C</i> = ${frac(Array.from({ length: k }, (_, i) => m - i).join(` ${TIMES} `), Array.from({ length: k }, (_, i) => k - i).join(` ${TIMES} `))} = ${ans}`,
          ),
        ),
        ...ask(ctx, ans, [fact(m) / fact(m - k), m * k, ans + m, m ** k].filter((v) => v !== ans)),
      });
    }
    const ans = m * (m - 1);
    return poolQ('m.comb', d, {
      prompt: L(
        `A class of ${m} students elects a president and a deputy. In how many ways can this be done?`,
        `В классе из ${m} учеников выбирают старосту и его заместителя. Сколькими способами это можно сделать?`,
        `${m} оқушысы бар сыныпта староста мен оның орынбасарын сайлайды. Мұны неше тәсілмен жасауға болады?`,
      ),
      ex: steps(
        L(
          `The roles are different, so the order matters: ${m} choices for the president, ${m - 1} for the deputy.`,
          `Роли разные, поэтому порядок важен: старостой может стать любой из ${m}, заместителем — любой из оставшихся ${m - 1}.`,
          `Рөлдер әртүрлі, сондықтан реті маңызды: старостаға ${m} нұсқа, орынбасарға ${m - 1} нұсқа.`,
        ),
        same(`${m} ${TIMES} ${m - 1} = ${ans}`),
      ),
      ...ask(ctx, ans, [choose(m, 2), m * m, 2 * m, ans + m].filter((v) => v !== ans)),
    });
  }
  if (rng() < 0.5) {
    const k = randomInt(rng, 4, 6);
    const ans = 2 * fact(k - 1);
    return poolQ('m.comb', d, {
      prompt: L(
        `${k} friends stand in a row for a photo. In how many ways can they stand if two of them, Ali and Dana, must be next to each other?`,
        `Компания из ${k} человек встаёт в ряд для фото. Сколькими способами они могут встать, если двое из них, Али и Дана, должны стоять рядом?`,
        `${k} дос суретке түсу үшін қатарға тұрады. Олардың екеуі, Әли мен Дана, қатар тұруы керек болса, неше тәсілмен тұра алады?`,
      ),
      ex: steps(
        L(
          `Glue Ali and Dana into one block. Then there are ${k - 1} objects to arrange: ${k - 1}! = ${fact(k - 1)} ways.`,
          `«Склеим» Али и Дану в один блок. Тогда расставляем ${k - 1} объектов: ${k - 1}! = ${fact(k - 1)} способов.`,
          `Әли мен Дананы бір блокқа біріктіреміз. Сонда ${k - 1} нысанды орналастырамыз: ${k - 1}! = ${fact(k - 1)} тәсіл.`,
        ),
        L(
          `Inside the block they can swap places: ${fact(k - 1)} ${TIMES} 2 = ${ans}.`,
          `Внутри блока они могут поменяться местами: ${fact(k - 1)} ${TIMES} 2 = ${ans}.`,
          `Блок ішінде олар орын ауыстыра алады: ${fact(k - 1)} ${TIMES} 2 = ${ans}.`,
        ),
      ),
      ...ask(ctx, ans, [fact(k), fact(k - 1), fact(k) / 2 + 1, ans + k].filter((v) => v !== ans)),
    });
  }
  const m = randomInt(rng, 4, 7);
  const digits = Array.from({ length: m }, (_, i) => i).join(', ');
  const ans = (m - 1) * (m - 1) * (m - 2);
  return poolQ('m.comb', d, {
    prompt: L(
      `How many three-digit numbers with all different digits can be made from the digits ${digits}?`,
      `Сколько трёхзначных чисел с различными цифрами можно составить из цифр ${digits}?`,
      `${digits} цифрларынан цифрлары әртүрлі неше үш таңбалы сан құрастыруға болады?`,
    ),
    ex: steps(
      L(
        `The first digit cannot be 0: ${m - 1} choices.`,
        `Первая цифра не может быть нулём, поэтому для неё вариантов: ${m - 1}.`,
        `Бірінші цифр 0 бола алмайды: ${m - 1} нұсқа.`,
      ),
      L(
        `The second digit is any of the remaining ${m - 1} (0 is allowed now), the third is any of the remaining ${m - 2}.`,
        `Вторая цифра — любая из оставшихся ${m - 1} (ноль уже можно), третья — любая из оставшихся ${m - 2}.`,
        `Екінші цифр — қалған ${m - 1} цифрдың кез келгені (енді 0 болады), үшіншісі — қалған ${m - 2} цифрдың кез келгені.`,
      ),
      same(`${m - 1} ${TIMES} ${m - 1} ${TIMES} ${m - 2} = ${ans}`),
    ),
    ...ask(ctx, ans, [m * (m - 1) * (m - 2), (m - 1) * (m - 2) * (m - 3) || 1, m ** 3, ans + m].filter((v) => v !== ans)),
  });
}

export function probability(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const r = randomInt(rng, 2, 8);
    const b = randomInt(rng, 2, 8);
    const g = randomInt(rng, 1, 6);
    const total = r + b + g;
    return poolQ('m.prob', d, {
      prompt: L(
        `A bag has ${r} red, ${b} blue and ${g} green balls. One ball is taken at random. Find the probability that it is red.`,
        `В мешке лежат шары: красных — ${r}, синих — ${b}, зелёных — ${g}. Наугад вынимают один шар. Найди вероятность того, что он красный.`,
        `Қапта ${r} қызыл, ${b} көк және ${g} жасыл шар бар. Кездейсоқ бір шар алынады. Оның қызыл болу ықтималдығын тап.`,
      ),
      ex: steps(
        L(`There are ${total} balls in total, ${r} of them red.`, `Всего шаров ${total}, из них красных ${r}.`, `Барлығы ${total} шар, оның ${r}-і қызыл.`),
        L(
          `Probability = favourable outcomes ${DIV} all outcomes = ${fr(r, total)}.`,
          `Вероятность = благоприятные исходы ${DIV} все исходы = ${fr(r, total)}.`,
          `Ықтималдық = қолайлы нәтижелер ${DIV} барлық нәтижелер = ${fr(r, total)}.`,
        ),
      ),
      ...askFrac(ctx, [r, total], [[r, b + g], [b, total], [g, total], [1, total], [r, total + 1]]),
    });
  }
  if (d === 2) {
    if (rng() < 0.5) {
      const s = randomInt(rng, 3, 11);
      const ways = s <= 7 ? s - 1 : 13 - s;
      return poolQ('m.prob', d, {
        prompt: L(
          `Two dice are rolled. Find the probability that the sum of the points is ${s}.`,
          `Бросают два игральных кубика. Найди вероятность того, что сумма очков равна ${s}.`,
          `Екі ойын сүйегі лақтырылады. Ұпайлар қосындысы ${s} болу ықтималдығын тап.`,
        ),
        ex: steps(
          L('There are 6 × 6 = 36 equally likely outcomes.', 'Всего 6 × 6 = 36 равновозможных исходов.', 'Барлығы 6 × 6 = 36 тең мүмкіндікті нәтиже бар.'),
          L(
            `The sum ${s} appears in ${ways} of them, so the probability is ${fr(ways, 36)}.`,
            `Сумма ${s} получается в ${ways} из них, поэтому вероятность равна ${fr(ways, 36)}.`,
            `${s} қосындысы олардың ${ways}-інде шығады, сондықтан ықтималдық ${fr(ways, 36)}.`,
          ),
        ),
        ...askFrac(ctx, [ways, 36], [[ways + 1, 36], [1, 6], [ways, 12], [1, 36], [s, 36], [ways + 2, 36]]),
      });
    }
    const k = randomInt(rng, 1, 2);
    const ways = 3;
    return poolQ('m.prob', d, {
      prompt: L(
        `A coin is tossed 3 times. Find the probability of getting exactly ${k} head${k > 1 ? 's' : ''}.`,
        `Монету бросают 3 раза. Найди вероятность того, что орёл выпадет ровно ${k} раз${k > 1 ? 'а' : ''}.`,
        `Тиын 3 рет лақтырылады. Елтаңба жағы дәл ${k} рет түсу ықтималдығын тап.`,
      ),
      ex: steps(
        L('There are 2 × 2 × 2 = 8 equally likely outcomes.', 'Всего 2 × 2 × 2 = 8 равновозможных исходов.', 'Барлығы 2 × 2 × 2 = 8 тең мүмкіндікті нәтиже бар.'),
        L(
          `Exactly ${k} head${k > 1 ? 's' : ''} appear${k > 1 ? '' : 's'} in ${ways} of them, so the probability is ${frac(ways, 8)}.`,
          `Орёл выпадает ровно ${k} раз${k > 1 ? 'а' : ''} в ${ways} исходах из 8, поэтому вероятность равна ${frac(ways, 8)}.`,
          `Дәл ${k} елтаңба олардың ${ways}-інде түседі, сондықтан ықтималдық ${frac(ways, 8)}.`,
        ),
      ),
      ...askFrac(ctx, [ways, 8], [[1, 8], [1, 2], [k, 3], [1, 4], [5, 8]]),
    });
  }
  const r = randomInt(rng, 3, 6);
  const b = randomInt(rng, 2, 6);
  const total = r + b;
  return poolQ('m.prob', d, {
    prompt: L(
      `A box has ${r} red and ${b} blue pencils. Two pencils are taken at random without putting the first one back. Find the probability that both are red.`,
      `В коробке лежат карандаши: красных — ${r}, синих — ${b}. Наугад берут два карандаша, не возвращая первый. Найди вероятность того, что оба красные.`,
      `Қорапта ${r} қызыл және ${b} көк қарындаш бар. Біріншісін қайтармай, кездейсоқ екі қарындаш алынады. Екеуі де қызыл болу ықтималдығын тап.`,
    ),
    ex: steps(
      L(`The first pencil is red with probability ${frac(r, total)}.`, `Первый карандаш красный с вероятностью ${frac(r, total)}.`, `Бірінші қарындаш ${frac(r, total)} ықтималдықпен қызыл болады.`),
      L(
        `After that ${r - 1} red pencils are left out of ${total - 1}: ${frac(r - 1, total - 1)}.`,
        `После этого осталось ${r - 1} красных из ${total - 1}: ${frac(r - 1, total - 1)}.`,
        `Содан кейін ${total - 1} қарындаштың ${r - 1}-і қызыл болып қалады: ${frac(r - 1, total - 1)}.`,
      ),
      same(`${frac(r, total)} ${TIMES} ${frac(r - 1, total - 1)} = ${fr(r * (r - 1), total * (total - 1))}`),
    ),
    ...askFrac(ctx, [r * (r - 1), total * (total - 1)], [[r * r, total * total], [r, total], [r - 1, total], [r - 1, total - 1], [r * (r - 1), total * total]]),
  });
}

export function derivative(ctx, d) {
  const { rng } = ctx;
  const F = '<i>f</i>';
  const nz = (lo, hi) => randomInt(rng, lo, hi) || 2;
  if (d === 1) {
    const a = randomInt(rng, 1, 3);
    const b = nz(-4, 4);
    const c = nz(-6, 6);
    const e = randomInt(rng, -9, 9);
    const k = nz(-2, 3);
    const ans = 3 * a * k * k + 2 * b * k + c;
    return poolQ('m.deriv', d, {
      prompt: L(
        `The function is ${F}(${X}) = ${polyStr([a, b, c, e])}. Find ${F}′(${n(k)}).`,
        `Дана функция ${F}(${X}) = ${polyStr([a, b, c, e])}. Найди ${F}′(${n(k)}).`,
        `${F}(${X}) = ${polyStr([a, b, c, e])} функциясы берілген. ${F}′(${n(k)}) мәнін тап.`,
      ),
      ex: steps(
        L('Differentiate each term: (xⁿ)′ = n·xⁿ⁻¹.', 'Дифференцируем каждое слагаемое: (xⁿ)′ = n·xⁿ⁻¹.', 'Әр қосылғышты дифференциалдаймыз: (xⁿ)′ = n·xⁿ⁻¹.'),
        same(`${F}′(${X}) = ${polyStr([3 * a, 2 * b, c])}`),
        same(`${F}′(${n(k)}) = ${3 * a} ${TIMES} ${k * k} ${signed(2 * b * k)} ${signed(c)} = ${n(ans)}`),
      ),
      ...ask(ctx, ans, [a * k ** 3 + b * k * k + c * k + e, 3 * a * k * k + 2 * b * k, ans + c, 3 * a * k + 2 * b + c].filter((v) => v !== ans)),
    });
  }
  if (d === 2) {
    const a = randomInt(rng, 1, 5);
    const b = randomInt(rng, 1, 9);
    const t0 = randomInt(rng, 2, 6);
    const ans = 2 * a * t0 + b;
    const T = '<i>t</i>';
    const law = `${a === 1 ? '' : a}${T}<sup>2</sup> + ${b}${T}`;
    return poolQ('m.deriv', d, {
      prompt: L(
        `A point moves by the law <i>s</i>(${T}) = ${law} (in metres, ${T} in seconds). Find its speed at ${T} = ${t0} s.`,
        `Точка движется по закону <i>s</i>(${T}) = ${law} (в метрах, ${T} — в секундах). Найди её скорость в момент ${T} = ${t0} с.`,
        `Нүкте <i>s</i>(${T}) = ${law} заңы бойынша қозғалады (метрмен, ${T} — секундпен). ${T} = ${t0} с мезетіндегі жылдамдығын тап.`,
      ),
      ex: steps(
        L('Speed is the derivative of the distance.', 'Скорость — это производная пути по времени.', 'Жылдамдық — жолдың уақыт бойынша туындысы.'),
        same(`<i>v</i>(${T}) = <i>s</i>′(${T}) = ${2 * a}${T} + ${b}`),
        same(`<i>v</i>(${t0}) = ${2 * a} ${TIMES} ${t0} + ${b} = ${ans}`),
      ),
      ...ask(ctx, ans, [a * t0 * t0 + b * t0, 2 * a * t0, a * t0 + b, ans + a].filter((v) => v !== ans)),
    });
  }
  const k = randomInt(rng, 1, 4);
  const m = randomInt(rng, -9, 9);
  return poolQ('m.deriv', d, {
    prompt: L(
      `Find the minimum point of the function ${F}(${X}) = ${polyStr([1, 0, -3 * k * k, m])}.`,
      `Найди точку минимума функции ${F}(${X}) = ${polyStr([1, 0, -3 * k * k, m])}.`,
      `${F}(${X}) = ${polyStr([1, 0, -3 * k * k, m])} функциясының минимум нүктесін тап.`,
    ),
    ex: steps(
      same(`${F}′(${X}) = ${polyStr([3, 0, -3 * k * k])} = 3(${X} ${MINUS} ${k})(${X} + ${k})`),
      L(
        `The derivative is zero at ${X} = ${MINUS}${k} and ${X} = ${k}.`,
        `Производная равна нулю при ${X} = ${MINUS}${k} и ${X} = ${k}.`,
        `Туынды ${X} = ${MINUS}${k} және ${X} = ${k} болғанда нөлге тең.`,
      ),
      L(
        `At ${X} = ${k} the derivative changes sign from minus to plus, so this is the minimum point.`,
        `В точке ${X} = ${k} производная меняет знак с минуса на плюс — это точка минимума.`,
        `${X} = ${k} нүктесінде туынды таңбасын минустан плюске өзгертеді — бұл минимум нүктесі.`,
      ),
    ),
    ...ask(ctx, k, [-k, 0, k * k, 3 * k, m - 2 * k ** 3].filter((v) => v !== k)),
  });
}

export function statistics(ctx, d) {
  const { rng } = ctx;
  const list = (items) => items.map(n).join(', ');
  if (d === 1) {
    const items = Array.from({ length: 4 }, () => randomInt(rng, 2, 30));
    const sum4 = items.reduce((s, v) => s + v, 0);
    let last = randomInt(rng, 2, 30);
    while ((sum4 + last) % 5 !== 0) last += 1;
    items.push(last);
    const sum = sum4 + last;
    const ans = sum / 5;
    return poolQ('m.stat', d, {
      prompt: L(`Find the mean of the numbers: ${list(items)}.`, `Найди среднее арифметическое чисел: ${list(items)}.`, `Сандардың арифметикалық ортасын тап: ${list(items)}.`),
      ex: steps(
        L(`Add the numbers: ${sum}.`, `Сложим числа: ${sum}.`, `Сандарды қосамыз: ${sum}.`),
        L(`Divide by how many there are: ${sum} ${DIV} 5 = ${ans}.`, `Разделим на их количество: ${sum} ${DIV} 5 = ${ans}.`, `Олардың санына бөлеміз: ${sum} ${DIV} 5 = ${ans}.`),
      ),
      ...ask(ctx, ans, [sum / 4, ans + 1, ans - 1, [...items].sort((p, q) => p - q)[2]].filter((v) => v !== ans && Number.isInteger(v))),
    });
  }
  if (d === 2) {
    const count = pick(rng, [5, 6, 7]);
    const items = [];
    while (items.length < count) {
      const v = randomInt(rng, 1, 40);
      if (!items.includes(v)) items.push(v);
    }
    const sorted = [...items].sort((p, q) => p - q);
    const mid = count / 2;
    const ans = count % 2 ? sorted[Math.floor(mid)] : (sorted[mid - 1] + sorted[mid]) / 2;
    return poolQ('m.stat', d, {
      prompt: L(`Find the median of the numbers: ${list(items)}.`, `Найди медиану набора чисел: ${list(items)}.`, `Сандар жиынының медианасын тап: ${list(items)}.`),
      ex: steps(
        L(`Put the numbers in order: ${list(sorted)}.`, `Запишем числа по возрастанию: ${list(sorted)}.`, `Сандарды өсу ретімен жазамыз: ${list(sorted)}.`),
        count % 2
          ? L(`The middle number is ${ans}.`, `Число в середине — ${ans}.`, `Ортадағы сан — ${ans}.`)
          : loc(
              (l) =>
                ({
                  en: `There are two middle numbers: (${sorted[mid - 1]} + ${sorted[mid]}) ${DIV} 2 = ${dec(ans).en}.`,
                  ru: `В середине два числа: (${sorted[mid - 1]} + ${sorted[mid]}) ${DIV} 2 = ${dec(ans).ru}.`,
                  kk: `Ортада екі сан бар: (${sorted[mid - 1]} + ${sorted[mid]}) ${DIV} 2 = ${dec(ans).kk}.`,
                })[l],
            ),
      ),
      ...ask(ctx, ans, [items[Math.floor(count / 2)], sorted[Math.floor(mid) - 1], sorted[Math.min(count - 1, Math.floor(mid) + 1)], ans + 1].filter((v) => v !== ans), { fmt: dec }),
    });
  }
  const count = randomInt(rng, 4, 6);
  const mean = randomInt(rng, 16, 40);
  const known = Array.from({ length: count - 1 }, () => mean + randomInt(rng, -3, 3));
  const missing = mean * count - known.reduce((s, v) => s + v, 0);
  return poolQ('m.stat', d, {
    prompt: L(
      `The mean of ${count} numbers is ${mean}. ${count - 1} of them are ${list(known)}. Find the remaining number.`,
      `Среднее арифметическое ${count} чисел равно ${mean}. Известны ${count - 1} из них: ${list(known)}. Найди оставшееся число.`,
      `${count} санның арифметикалық ортасы ${mean}-ге тең. Олардың ${count - 1}-і белгілі: ${list(known)}. Қалған санды тап.`,
    ),
    ex: steps(
      L(`The sum of all the numbers is ${mean} ${TIMES} ${count} = ${mean * count}.`, `Сумма всех чисел: ${mean} ${TIMES} ${count} = ${mean * count}.`, `Барлық сандардың қосындысы: ${mean} ${TIMES} ${count} = ${mean * count}.`),
      L(`The known numbers add up to ${mean * count - missing}.`, `Сумма известных чисел: ${mean * count - missing}.`, `Белгілі сандардың қосындысы: ${mean * count - missing}.`),
      same(`${mean * count} ${MINUS} ${mean * count - missing} = ${n(missing)}`),
    ),
    ...ask(ctx, missing, [mean, missing + count, missing - 1, mean * count - missing].filter((v) => v !== missing)),
  });
}

