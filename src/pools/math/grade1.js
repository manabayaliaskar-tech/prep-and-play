// Математика 1 класса: числа до 10 и до 20, сравнение, сложение и вычитание, задачи,
// длина, фигуры, ориентация, закономерности, деньги, время, счёт до 100.

import { L, n, same, why } from '../gen.js';
import { COLORS, ITEMS, MINUS, NAMES, R, anyOf, clockSvg, cnt, countSvg, g, kkAbl, kkAt, kkDat, lineSvg, moneySvg, one, qNum, qText, rulerSvg, shape, svg, tensSvg, two } from './kit.js';

const cm = (x) => L(`${x} cm`, `${x} см`, `${x} см`);
/** Формула + величина с единицей на трёх языках. */
const loc2 = (pre, v) => L(pre + v.en, pre + v.ru, pre + v.kk);

const calc = (e) => L(`Calculate: ${e}`, `Вычисли: ${e}`, `Есепте: ${e}`);
const SIGNS = ['&gt;', '&lt;', '='];
const signOf = (a, b) => (a > b ? '&gt;' : a < b ? '&lt;' : '=');
const signWords = (a, b) =>
  a > b ? L(`${a} is greater than ${b}`, `${a} больше, чем ${b}`, `${a} саны ${kkAbl(b)} үлкен`) : a < b ? L(`${a} is less than ${b}`, `${a} меньше, чем ${b}`, `${a} саны ${kkAbl(b)} кіші`) : L('The numbers are equal', 'Числа равны', 'Сандар тең');

// ---------- Числа от 1 до 10 ----------

const SHAPE_COUNT = [
  L('circles', 'кружков', 'дөңгелек'),
  L('squares', 'квадратов', 'шаршы'),
  L('triangles', 'треугольников', 'үшбұрыш'),
  L('stars', 'звёздочек', 'жұлдызша'),
  L('rectangles', 'прямоугольников', 'тіктөртбұрыш'),
];
const SHAPE_FILL = ['var(--primary)', 'var(--accent)', 'var(--blue, #3b82f6)', 'var(--orange, #f97316)'];

export function num10(ctx, d) {
  const { rng } = ctx;
  const id = 'm.num10';
  const countPic = (max) => {
    const kind = R(rng, 0, 4);
    const c = R(rng, 1, max);
    const w = SHAPE_COUNT[kind];
    return qNum(
      ctx, id, d,
      L(`How many ${w.en} are in the picture?`, `Сколько ${w.ru} на рисунке?`, `Суретте неше ${w.kk} бар?`),
      [L('Count them one by one, touching each with your finger.', 'Считаем по одному, показывая каждую пальцем.', 'Әрқайсысын саусақпен көрсетіп, бір-бірлеп санаймыз.'), L(`Answer: ${c}.`, `Ответ: ${c}.`, `Жауабы: ${c}.`)],
      c, [c + 1, c - 1, c + 2],
      { fig: countSvg(c, kind, one(rng, SHAPE_FILL)), min: 1 },
    );
  };
  const neighbour = () => {
    const a = R(rng, 1, 9);
    const after = rng() < 0.5;
    const x = after ? a : a + 1;
    const ans = after ? a + 1 : a;
    return qNum(
      ctx, id, d,
      after ? L(`Which number comes right after ${x}?`, `Какое число идёт сразу после ${x}?`, `${x} санынан кейін бірден қандай сан келеді?`) : L(`Which number comes right before ${x}?`, `Какое число стоит перед ${x}?`, `${x} санының алдында қандай сан тұр?`),
      [after ? L('The next number is 1 more.', 'Следующее число на 1 больше.', 'Келесі сан 1-ге артық.') : L('The previous number is 1 less.', 'Предыдущее число на 1 меньше.', 'Алдыңғы сан 1-ге кем.'), same(after ? `${x} + 1 = ${ans}` : `${x} ${MINUS} 1 = ${ans}`)],
      ans, [after ? x - 1 : x + 1, x, ans + 1, ans - 1],
      { min: 0 },
    );
  };
  const parts = () => {
    const whole = R(rng, d === 1 ? 2 : 4, 10);
    const a = R(rng, 1, whole - 1);
    const b = whole - a;
    return qNum(
      ctx, id, d,
      L(`The number ${whole} is made of ${a} and what number?`, `Число ${whole} - это ${a} и сколько ещё?`, `${whole} саны - ол ${a} және тағы қанша?`),
      [L(`Which number together with ${a} makes ${whole}?`, `Какое число вместе с ${a} даёт ${whole}?`, `Қай сан ${a}-мен бірге ${whole} береді?`), same(`${a} + ${b} = ${whole}`)],
      b, [why(whole + a, L('We do not add here: the part is smaller than the whole.', 'Здесь не складывают: часть меньше целого.', 'Мұнда қоспаймыз: бөлік бүтіннен кіші.')), b + 1, b - 1, a],
      { min: 1 },
    );
  };
  const toTen = () => {
    const a = R(rng, 1, 9);
    return qNum(
      ctx, id, d,
      L(`How many do you need to add to ${a} to get 10?`, `Сколько не хватает числу ${a} до 10?`, `${a} санына 10 болу үшін қанша жетпейді?`),
      [L(`Count on from ${a} to 10.`, `Досчитаем от ${a} до 10.`, `${kkAbl(a)} 10-ға дейін санаймыз.`), same(`${a} + ${10 - a} = 10`)],
      10 - a, [10 + a, 11 - a, 9 - a, a],
      { min: 0 },
    );
  };
  const twoColors = () => {
    const a = R(rng, 1, 5);
    const b = R(rng, 1, 5);
    const kind = R(rng, 0, 3);
    const items = [];
    for (let i = 0; i < a + b; i++) items.push(shape(kind, 24 + (i % 5) * 44, 26 + Math.floor(i / 5) * 42, 30, i < a ? SHAPE_FILL[0] : SHAPE_FILL[3]));
    return qNum(
      ctx, id, d,
      L('How many shapes are there in all?', 'Сколько всего фигур на рисунке?', 'Суретте барлығы неше фигура бар?'),
      [L(`Dark ones: ${a}, light ones: ${b}.`, `Тёмных - ${a}, светлых - ${b}.`, `Күңгірті - ${a}, ашығы - ${b}.`), same(`${a} + ${b} = ${a + b}`)],
      a + b, [a + b + 1, a + b - 1, Math.max(a, b)],
      { fig: svg(240, 16 + Math.ceil((a + b) / 5) * 42, items.join('')), min: 1 },
    );
  };
  const between = () => {
    const a = R(rng, 0, 8);
    return qNum(
      ctx, id, d,
      L(`Which number is between ${a} and ${a + 2}?`, `Какое число стоит между ${a} и ${a + 2}?`, `${a} мен ${a + 2} арасында қандай сан тұр?`),
      [L(`Count: ${a}, ${a + 1}, ${a + 2}.`, `Считаем: ${a}, ${a + 1}, ${a + 2}.`, `Санаймыз: ${a}, ${a + 1}, ${a + 2}.`)],
      a + 1, [a + 3, a, a + 2],
      { min: 0 },
    );
  };
  if (d === 1) return anyOf(rng, [() => countPic(10), () => countPic(10), neighbour, parts]);
  return anyOf(rng, [parts, toTen, twoColors, between, () => countPic(10)]);
}

// ---------- Сравнение чисел ----------

export function compare(ctx, d) {
  const { rng } = ctx;
  const id = 'm.cmp';
  const max = d === 1 ? 10 : 20;
  const signQ = () => {
    const a = R(rng, 0, max);
    const b = rng() < 0.15 ? a : R(rng, 0, max);
    return qText(
      ctx, id, d,
      L(`Which sign goes in the box: ${a} ☐ ${b}`, `Какой знак поставить в окошко: ${a} ☐ ${b}`, `Терезеге қай таңбаны қою керек: ${a} ☐ ${b}`),
      [signWords(a, b), same(`${a} ${signOf(a, b)} ${b}`)],
      signOf(a, b), SIGNS.filter((s) => s !== signOf(a, b)),
    );
  };
  const bigger = () => {
    const [a, b] = two(rng, Array.from({ length: max }, (_, i) => i + 1));
    const big = rng() < 0.5;
    const ans = big ? Math.max(a, b) : Math.min(a, b);
    const other = big ? Math.min(a, b) : Math.max(a, b);
    return qNum(
      ctx, id, d,
      big ? L(`Which number is greater: ${a} or ${b}?`, `Какое число больше: ${a} или ${b}?`, `Қай сан үлкен: ${a} әлде ${b}?`) : L(`Which number is less: ${a} or ${b}?`, `Какое число меньше: ${a} или ${b}?`, `Қай сан кіші: ${a} әлде ${b}?`),
      [L('When counting, the bigger number comes later.', 'При счёте большее число называют позже.', 'Санағанда үлкен сан кейінірек айтылады.'), same(`${Math.max(a, b)} &gt; ${Math.min(a, b)}`)],
      ans, [other, a + b, ans + 1],
      { spr: 0, min: 0 },
    );
  };
  const diff = () => {
    const [x, y] = two(rng, Array.from({ length: max }, (_, i) => i + 1));
    const a = Math.max(x, y);
    const b = Math.min(x, y);
    return qNum(
      ctx, id, d,
      L(`How much greater is ${a} than ${b}?`, `На сколько ${a} больше, чем ${b}?`, `${a} саны ${kkAbl(b)} қаншаға артық?`),
      [L('To find how much greater, subtract the smaller number from the bigger one.', 'Чтобы узнать, на сколько больше, из большего вычитаем меньшее.', 'Қаншаға артық екенін білу үшін үлкен саннан кішісін азайтамыз.'), same(`${a} ${MINUS} ${b} = ${a - b}`)],
      a - b, [why(a + b, L('We subtract to compare, not add.', 'Для сравнения вычитают, а не складывают.', 'Салыстыру үшін қоспаймыз, азайтамыз.')), a - b + 1, a - b - 1, b],
      { min: 1 },
    );
  };
  const exprQ = () => {
    const a = R(rng, 1, 9);
    const b = R(rng, 1, 9);
    const s = a + b;
    const c = Math.max(0, Math.min(20, s + R(rng, -2, 2)));
    return qText(
      ctx, id, d,
      L(`Which sign goes in the box: ${a} + ${b} ☐ ${c}`, `Какой знак поставить в окошко: ${a} + ${b} ☐ ${c}`, `Терезеге қай таңбаны қою керек: ${a} + ${b} ☐ ${c}`),
      [L(`First find the sum: ${a} + ${b} = ${s}.`, `Сначала найдём сумму: ${a} + ${b} = ${s}.`, `Алдымен қосындыны табамыз: ${a} + ${b} = ${s}.`), same(`${s} ${signOf(s, c)} ${c}`)],
      signOf(s, c), SIGNS.filter((x) => x !== signOf(s, c)),
    );
  };
  if (d === 1) return anyOf(rng, [signQ, signQ, bigger, diff]);
  return anyOf(rng, [signQ, exprQ, exprQ, diff]);
}

// ---------- Сложение и вычитание в пределах 10 ----------

export function add10(ctx, d) {
  const { rng } = ctx;
  const id = 'm.add10';
  const plus = () => {
    const a = R(rng, 0, 9);
    const b = R(rng, d === 1 ? 1 : 0, 10 - a);
    return qNum(ctx, id, d, calc(`${a} + ${b}`), [L(`Count on ${b} from ${a}.`, `От ${a} отсчитаем ещё ${b}.`, `${kkAbl(a)} тағы ${b} санаймыз.`), same(`${a} + ${b} = ${a + b}`)], a + b, [a + b + 1, a + b - 1, Math.abs(a - b)], { min: 0 });
  };
  const minus = () => {
    const a = R(rng, 1, 10);
    const b = R(rng, 0, a);
    return qNum(ctx, id, d, calc(`${a} ${MINUS} ${b}`), [L(`Count back ${b} from ${a}.`, `От ${a} отсчитаем назад ${b}.`, `${kkAbl(a)} ${b} кері санаймыз.`), same(`${a} ${MINUS} ${b} = ${a - b}`)], a - b, [why(a + b, L('This is subtraction: count back, not on.', 'Здесь вычитание: считаем назад, а не вперёд.', 'Бұл - азайту: алға емес, кері санаймыз.')), a - b + 1, a - b - 1], { min: 0 });
  };
  const missing = () => {
    const s = R(rng, 3, 10);
    const a = R(rng, 1, s - 1);
    const b = s - a;
    if (rng() < 0.5)
      return qNum(ctx, id, d, L(`Find the missing number: ${a} + ☐ = ${s}`, `Найди пропущенное число: ${a} + ☐ = ${s}`, `Жетіспейтін санды тап: ${a} + ☐ = ${s}`), [L('To find an unknown part, subtract the known part from the sum.', 'Чтобы найти неизвестное слагаемое, из суммы вычитаем известное.', 'Белгісіз қосылғышты табу үшін қосындыдан белгілі қосылғышты азайтамыз.'), same(`${s} ${MINUS} ${a} = ${b}`)], b, [why(s + a, L('Adding makes it bigger than the sum.', 'Если сложить, получится больше суммы.', 'Қоссақ, қосындыдан үлкен болады.')), b + 1, b - 1], { min: 0 });
    return qNum(ctx, id, d, L(`Find the missing number: ${s} ${MINUS} ☐ = ${a}`, `Найди пропущенное число: ${s} ${MINUS} ☐ = ${a}`, `Жетіспейтін санды тап: ${s} ${MINUS} ☐ = ${a}`), [L('Subtract the result from the first number.', 'Из первого числа вычтем результат.', 'Бірінші саннан нәтижені азайтамыз.'), same(`${s} ${MINUS} ${b} = ${a}`)], b, [s + a, b + 1, b - 1], { min: 0 });
  };
  const three = () => {
    const a = R(rng, 1, 5);
    const b = R(rng, 1, 8 - a);
    const c = R(rng, 1, 10 - a - b);
    if (rng() < 0.5) return qNum(ctx, id, d, calc(`${a} + ${b} + ${c}`), [L('Add from left to right.', 'Складываем по порядку слева направо.', 'Солдан оңға қарай ретімен қосамыз.'), same(`${a} + ${b} = ${a + b}, ${a + b} + ${c} = ${a + b + c}`)], a + b + c, [a + b, a + b + c + 1, a + b + c - 1], { min: 0 });
    const s = a + b + c;
    return qNum(ctx, id, d, calc(`${s} ${MINUS} ${a} ${MINUS} ${b}`), [L('Subtract from left to right.', 'Вычитаем по порядку слева направо.', 'Солдан оңға қарай ретімен азайтамыз.'), same(`${s} ${MINUS} ${a} = ${s - a}, ${s - a} ${MINUS} ${b} = ${c}`)], c, [s - a, c + 1, c + 2], { min: 0 });
  };
  if (d === 1) return anyOf(rng, [plus, minus]);
  return anyOf(rng, [missing, three, plus, minus]);
}

// ---------- Числа от 11 до 20 ----------

export function num20(ctx, d) {
  const { rng } = ctx;
  const id = 'm.num20';
  const pic = () => {
    const ones = R(rng, d === 1 ? 1 : 0, 9);
    const tens = d === 1 ? 1 : R(rng, 1, 2);
    const x = tens * 10 + ones;
    if (x > 20) return pic();
    return qNum(
      ctx, id, d,
      L('Each stick is a ten. What number is shown?', 'Каждая полоска - это десяток. Какое число показано?', 'Әр жолақ - бір ондық. Қандай сан көрсетілген?'),
      [L(`${tens} ten(s) and ${ones} one(s).`, `${tens} дес. и ${ones} ед.`, `${tens} ондық және ${ones} бірлік.`), same(`${tens * 10} + ${ones} = ${x}`)],
      x, [why(tens + ones, L('A stick is ten, not one.', 'Полоска - это десять, а не один.', 'Жолақ - бір емес, он.')), ones * 10 + tens, x + 1, x - 1],
      { fig: tensSvg(tens, ones), min: 0 },
    );
  };
  const digits = () => {
    const x = R(rng, 11, 20);
    const t = Math.floor(x / 10);
    const o = x % 10;
    const f = (a, b) => L(`${a} ten(s) ${b} one(s)`, `${a} дес. ${b} ед.`, `${a} ондық ${b} бірлік`);
    return qText(
      ctx, id, d,
      L(`How many tens and ones are in ${x}?`, `Сколько десятков и единиц в числе ${x}?`, `${x} санында неше ондық және неше бірлік бар?`),
      [L(`The first digit shows tens, the second shows ones.`, `Первая цифра - десятки, вторая - единицы.`, `Бірінші цифр - ондықтар, екіншісі - бірліктер.`), same(`${x} = ${t * 10} + ${o}`)],
      f(t, o), [f(o, t), f(t, o + 1), f(t + 1, o), f(0, x)],
    );
  };
  const tenPlus = () => {
    const o = R(rng, 1, 9);
    const k = R(rng, 0, 3);
    if (k === 0) return qNum(ctx, id, d, calc(`10 + ${o}`), [L('Ten and some ones: write 1 and then the ones.', 'Десяток и единицы: пишем 1, а за ней единицы.', 'Ондық пен бірліктер: 1 жазып, артынан бірліктерді жазамыз.'), same(`10 + ${o} = ${10 + o}`)], 10 + o, [o, 100 + o, 11 + o], { min: 0 });
    if (k === 1) return qNum(ctx, id, d, calc(`${10 + o} ${MINUS} ${o}`), [L('Take away all the ones - a ten is left.', 'Убираем все единицы - остаётся десяток.', 'Барлық бірліктерді алып тастасақ, ондық қалады.'), same(`${10 + o} ${MINUS} ${o} = 10`)], 10, [o, 10 + o, 11], { min: 0 });
    if (k === 2) return qNum(ctx, id, d, calc(`${10 + o} ${MINUS} 10`), [L('Take away the ten - the ones are left.', 'Убираем десяток - остаются единицы.', 'Ондықты алып тастасақ, бірліктер қалады.'), same(`${10 + o} ${MINUS} 10 = ${o}`)], o, [10, 10 + o, o + 1], { min: 0 });
    return qNum(ctx, id, d, calc(`${o} + 10`), [L('Order does not matter: it is the same as 10 + ' + o + '.', `От перестановки ничего не меняется: это 10 + ${o}.`, `Орын ауыстырғаннан ештеңе өзгермейді: бұл 10 + ${o}.`), same(`${o} + 10 = ${10 + o}`)], 10 + o, [o, 100 + o, 11 + o], { min: 0 });
  };
  const nextPrev = () => {
    const x = R(rng, 10, 19);
    const after = rng() < 0.5;
    const ans = after ? x + 1 : x - 1;
    return qNum(
      ctx, id, d,
      after ? L(`Which number comes after ${x}?`, `Какое число следует за ${x}?`, `${x} санынан кейін қандай сан тұр?`) : L(`Which number comes before ${x}?`, `Какое число стоит перед ${x}?`, `${x} санының алдында қандай сан тұр?`),
      [same(after ? `${x} + 1 = ${ans}` : `${x} ${MINUS} 1 = ${ans}`)],
      ans, [after ? x - 1 : x + 1, x, x + 10],
      { min: 0 },
    );
  };
  const byK = () => {
    const x = R(rng, 11, 17);
    const k = R(rng, 2, 20 - x);
    const more = rng() < 0.5;
    const ans = more ? x + k : x - k;
    return qNum(
      ctx, id, d,
      more ? L(`Which number is ${k} more than ${x}?`, `Какое число на ${k} больше, чем ${x}?`, `${x} санынан ${kkDat(k)} артық сан қандай?`) : L(`Which number is ${k} less than ${x}?`, `Какое число на ${k} меньше, чем ${x}?`, `${x} санынан ${kkDat(k)} кем сан қандай?`),
      [more ? L('"More by" means add.', '«На ... больше» - значит, прибавляем.', '«...-ге артық» - демек, қосамыз.') : L('"Less by" means subtract.', '«На ... меньше» - значит, вычитаем.', '«...-ге кем» - демек, азайтамыз.'), same(more ? `${x} + ${k} = ${ans}` : `${x} ${MINUS} ${k} = ${ans}`)],
      ans, [more ? x - k : x + k, ans + 1, ans - 1],
      { min: 0 },
    );
  };
  const make = () => {
    const o = R(rng, 0, 9);
    return qNum(
      ctx, id, d,
      L(`Write the number: 1 ten and ${o} ones.`, `Запиши число: 1 десяток и ${o} единиц.`, `Санды жаз: 1 ондық және ${o} бірлік.`),
      [same(`10 + ${o} = ${10 + o}`)],
      10 + o, [o + 1, o * 10 + 1, 10 + o + 1],
      { min: 0 },
    );
  };
  if (d === 1) return anyOf(rng, [pic, digits, tenPlus, nextPrev]);
  return anyOf(rng, [pic, byK, make, digits, tenPlus]);
}

// ---------- Сложение и вычитание в пределах 20 ----------

export function add20(ctx, d) {
  const { rng } = ctx;
  const id = 'm.add20';
  if (d === 1) {
    // Без перехода через десяток.
    const o = R(rng, 0, 8);
    const b = R(rng, 1, 9 - o);
    const a = 10 + o;
    if (rng() < 0.5) return qNum(ctx, id, d, calc(`${a} + ${b}`), [L('Add the ones to the ones; the ten stays.', 'Единицы складываем с единицами, десяток остаётся.', 'Бірліктерді бірліктерге қосамыз, ондық орнында қалады.'), same(`${o} + ${b} = ${o + b}, 10 + ${o + b} = ${a + b}`)], a + b, [a + b + 10, a + b - 1, a + b + 1, o + b], { min: 0 });
    const s = a + b;
    return qNum(ctx, id, d, calc(`${s} ${MINUS} ${b}`), [L('Subtract ones from ones; the ten stays.', 'Из единиц вычитаем единицы, десяток остаётся.', 'Бірліктерден бірліктерді азайтамыз, ондық орнында қалады.'), same(`${s % 10} ${MINUS} ${b} = ${o}, 10 + ${o} = ${a}`)], a, [o, a + 1, a - 1, s + b], { min: 0 });
  }
  const a = R(rng, 2, 9);
  const b = R(rng, Math.max(2, 11 - a), 9);
  const s = a + b;
  const k = R(rng, 0, 2);
  if (k === 0)
    return qNum(
      ctx, id, d, calc(`${a} + ${b}`),
      [L(`Make ten first: ${a} + ${10 - a} = 10.`, `Сначала дополним до десяти: ${a} + ${10 - a} = 10.`, `Алдымен онға дейін толықтырамыз: ${a} + ${10 - a} = 10.`), L(`Then add the rest: 10 + ${b - (10 - a)} = ${s}.`, `Потом прибавим остальное: 10 + ${b - (10 - a)} = ${s}.`, `Сосын қалғанын қосамыз: 10 + ${b - (10 - a)} = ${s}.`)],
      s, [why(s - 10, L('You forgot the ten.', 'Ты забыл про десяток.', 'Ондықты ұмыттың.')), s + 1, s - 1],
      { min: 0 },
    );
  if (k === 1)
    return qNum(
      ctx, id, d, calc(`${s} ${MINUS} ${b}`),
      [L(`Subtract down to ten first: ${s} ${MINUS} ${s - 10} = 10.`, `Сначала вычтем до десяти: ${s} ${MINUS} ${s - 10} = 10.`, `Алдымен онға дейін азайтамыз: ${s} ${MINUS} ${s - 10} = 10.`), L(`Then the rest: 10 ${MINUS} ${b - (s - 10)} = ${a}.`, `Потом остальное: 10 ${MINUS} ${b - (s - 10)} = ${a}.`, `Сосын қалғанын: 10 ${MINUS} ${b - (s - 10)} = ${a}.`)],
      a, [a + 1, a - 1, why(a + 10, L('Subtract the whole number, not just the ones.', 'Вычесть нужно всё число, а не только единицы.', 'Тек бірліктерді емес, бүкіл санды азайту керек.'))],
      { min: 0 },
    );
  return qNum(
    ctx, id, d,
    L(`Find the missing number: ${a} + ☐ = ${s}`, `Найди пропущенное число: ${a} + ☐ = ${s}`, `Жетіспейтін санды тап: ${a} + ☐ = ${s}`),
    [L('Subtract the known part from the sum.', 'Из суммы вычтем известное слагаемое.', 'Қосындыдан белгілі қосылғышты азайтамыз.'), same(`${s} ${MINUS} ${a} = ${b}`)],
    b, [s + a, b + 1, b - 1],
    { min: 0 },
  );
}

// ---------- Задачи в одно действие ----------

/** Простая задача: kind 0 - всего, 1 - осталось, 2 - на больше, 3 - на меньше, 4 - на сколько больше. Числа до max. */
export function wordProblem(ctx, d, id, max) {
  const { rng } = ctx;
  const p = one(rng, NAMES);
  const [p2] = two(rng, NAMES.filter((x) => x !== p));
  const it = one(rng, ITEMS);
  const kind = R(rng, 0, 4);
  const [b1, b2] = [R(rng, 1, Math.floor(max / 2)), R(rng, 1, Math.floor(max / 2))];
  const big = Math.max(b1 + b2, 2);
  const nm = (x) => L(x[0], x[1], x[2]);
  const pl = it[2][2];
  const answer = (v) => L(`Answer: ${v}.`, `Ответ: ${v}.`, `Жауабы: ${v}.`);
  if (kind === 0) {
    const a = R(rng, 1, max - 1);
    const b = R(rng, 1, max - a);
    return qNum(
      ctx, id, d,
      L(`${p[0]} bought ${cnt(a, it).en}, then ${cnt(b, it).en} more. How many ${it[1]} did ${p[0]} buy in all?`, `${p[1]} ${g(p, 'купил', 'купила')} ${cnt(a, it).ru}, а потом ещё ${cnt(b, it).ru}. Сколько всего ${pl} ${g(p, 'купил', 'купила')} ${p[1]}?`, `${p[2]} ${cnt(a, it).kk} сатып алды, сосын тағы ${cnt(b, it).kk} сатып алды. ${p[2]} барлығы неше ${it[3]} сатып алды?`),
      [L('"In all" means we add.', '«Всего» - значит, складываем.', '«Барлығы» - демек, қосамыз.'), same(`${a} + ${b} = ${a + b}`), answer(a + b)],
      a + b, [why(Math.abs(a - b), L('"In all" means put together - add.', '«Всего» - значит, вместе: нужно сложить.', '«Барлығы» - бірге деген сөз: қосу керек.')), a + b + 1, a + b - 1],
      { min: 0 },
    );
  }
  if (kind === 1) {
    const a = R(rng, 2, max);
    const b = R(rng, 1, a - 1);
    return qNum(
      ctx, id, d,
      L(`${p[0]} had ${cnt(a, it).en} and gave ${cnt(b, it).en} to a friend. How many ${it[1]} are left?`, `${p[1]} ${g(p, 'купил', 'купила')} ${cnt(a, it).ru} и ${cnt(b, it).ru} ${g(p, 'отдал', 'отдала')} другу. Сколько ${pl} осталось?`, `${p[2]} ${cnt(a, it).kk} сатып алып, досына ${cnt(b, it).kk} берді. Неше ${it[3]} қалды?`),
      [L('"Gave away" - there are fewer, so we subtract.', '«Отдал» - стало меньше, значит, вычитаем.', '«Берді» - азайды, демек, азайтамыз.'), same(`${a} ${MINUS} ${b} = ${a - b}`), answer(a - b)],
      a - b, [why(a + b, L('After giving some away there are fewer, not more.', 'После того как отдали, стало меньше, а не больше.', 'Бергеннен кейін көбеймейді, азаяды.')), a - b + 1, a - b - 1],
      { min: 0 },
    );
  }
  if (kind === 2 || kind === 3) {
    const more = kind === 2;
    const a = more ? R(rng, 1, max - 1) : R(rng, 2, max);
    const k = more ? R(rng, 1, max - a) : R(rng, 1, a - 1);
    const ans = more ? a + k : a - k;
    return qNum(
      ctx, id, d,
      more
        ? L(`${p[0]} bought ${cnt(a, it).en}, and ${p2[0]} bought ${k} more. How many ${it[1]} did ${p2[0]} buy?`, `${p[1]} ${g(p, 'купил', 'купила')} ${cnt(a, it).ru}, а ${p2[1]} - на ${k} больше. Сколько ${pl} ${g(p2, 'купил', 'купила')} ${p2[1]}?`, `${p[2]} ${cnt(a, it).kk} сатып алды, ал ${p2[2]} одан ${kkDat(k)} артық сатып алды. ${p2[2]} неше ${it[3]} сатып алды?`)
        : L(`${p[0]} bought ${cnt(a, it).en}, and ${p2[0]} bought ${k} fewer. How many ${it[1]} did ${p2[0]} buy?`, `${p[1]} ${g(p, 'купил', 'купила')} ${cnt(a, it).ru}, а ${p2[1]} - на ${k} меньше. Сколько ${pl} ${g(p2, 'купил', 'купила')} ${p2[1]}?`, `${p[2]} ${cnt(a, it).kk} сатып алды, ал ${p2[2]} одан ${kkDat(k)} кем сатып алды. ${p2[2]} неше ${it[3]} сатып алды?`),
      [more ? L('"More by" - add.', '«На ... больше» - прибавляем.', '«...-ге артық» - қосамыз.') : L('"Fewer by" - subtract.', '«На ... меньше» - вычитаем.', '«...-ге кем» - азайтамыз.'), same(more ? `${a} + ${k} = ${ans}` : `${a} ${MINUS} ${k} = ${ans}`), answer(ans)],
      ans, [more ? a - k : a + k, ans + 1, ans - 1].filter((x) => x >= 0),
      { min: 0 },
    );
  }
  const a = Math.min(max, big + R(rng, 0, 2));
  const b = R(rng, 1, a - 1);
  return qNum(
    ctx, id, d,
    L(`${p[0]} bought ${cnt(a, it).en}, and ${p2[0]} bought ${cnt(b, it).en}. How many more did ${p[0]} buy?`, `${p[1]} ${g(p, 'купил', 'купила')} ${cnt(a, it).ru}, а ${p2[1]} - ${cnt(b, it).ru}. На сколько больше ${g(p, 'купил', 'купила')} ${p[1]}?`, `${p[2]} ${cnt(a, it).kk}, ал ${p2[2]} ${cnt(b, it).kk} сатып алды. ${p[2]} қаншаға артық сатып алды?`),
    [L('"How many more" - subtract the smaller number from the bigger one.', '«На сколько больше» - из большего числа вычитаем меньшее.', '«Қаншаға артық» - үлкен саннан кішісін азайтамыз.'), same(`${a} ${MINUS} ${b} = ${a - b}`), answer(a - b)],
    a - b, [why(a + b, L('To compare, subtract - do not add.', 'Чтобы сравнить, вычитаем, а не складываем.', 'Салыстыру үшін қоспаймыз, азайтамыз.')), a - b + 1, a - b - 1],
    { min: 0 },
  );
}
export const word1 = (ctx, d) => wordProblem(ctx, d, 'm.word1', d === 1 ? 10 : 20);

// ---------- Длина: сантиметр, линейка ----------

export function length1(ctx, d) {
  const { rng } = ctx;
  const id = 'm.len';
  const measure = () => {
    const a = d === 1 && rng() < 0.6 ? 0 : R(rng, 1, 6);
    const b = R(rng, a + 1, Math.min(12, a + 10));
    const len = b - a;
    return qNum(
      ctx, id, d,
      L('How long is the red segment in centimetres?', 'Какой длины красный отрезок в сантиметрах?', 'Қызыл кесіндінің ұзындығы неше сантиметр?'),
      [a === 0 ? L(`The segment starts at 0 and ends at ${b}.`, `Отрезок начинается у 0 и заканчивается у ${b}.`, `Кесінді 0-ден басталып, ${b} белгісінде аяқталады.`) : L(`The segment goes from ${a} to ${b}, so subtract.`, `Отрезок идёт от ${a} до ${b} - вычитаем.`, `Кесінді ${kkAbl(a)} ${kkDat(b)} дейін созылады - азайтамыз.`), loc2(`${b} ${MINUS} ${a} = `, cm(len))],
      len, a ? [why(b, L('The segment does not start at 0. Subtract the start.', 'Отрезок начинается не с 0. Вычти начало.', 'Кесінді 0-ден басталмайды. Басын азайт.')), len + 1, len - 1] : [len + 1, len - 1, len + 2],
      { fig: rulerSvg(a, b), min: 1 },
    );
  };
  const sumLen = () => {
    const a = R(rng, 2, d === 1 ? 8 : 15);
    const b = R(rng, 1, d === 1 ? 10 - a : 20 - a);
    const add = rng() < 0.5;
    if (add)
      return qNum(ctx, id, d, L(`One ribbon is ${a} cm long, the other is ${b} cm. How long are they together?`, `Одна лента длиной ${a} см, другая - ${b} см. Какая длина у них вместе?`, `Бір таспаның ұзындығы ${a} см, екіншісі - ${b} см. Екеуінің ұзындығы бірге қанша?`), [L('Together - we add the lengths.', 'Вместе - складываем длины.', 'Бірге - ұзындықтарды қосамыз.'), loc2(`${a} + ${b} = `, cm(a + b))], a + b, [Math.abs(a - b), a + b + 1, a + b - 1], { min: 1 });
    const c = a + b;
    return qNum(ctx, id, d, L(`A pencil was ${c} cm long. After sharpening it became ${b} cm shorter. How long is it now?`, `Карандаш был длиной ${c} см. После заточки он стал на ${b} см короче. Какой он длины теперь?`, `Қарындаштың ұзындығы ${c} см еді. Ұшталғаннан кейін ол ${b} см-ге қысқарды. Енді оның ұзындығы қанша?`), [L('Shorter - subtract.', 'Короче - вычитаем.', 'Қысқа - азайтамыз.'), loc2(`${c} ${MINUS} ${b} = `, cm(a))], a, [c + b, a + 1, a - 1], { min: 1 });
  };
  const compareSeg = () => {
    const a = R(rng, 2, 12);
    let b = R(rng, 2, 12);
    while (b === a) b = R(rng, 2, 12);
    return qNum(
      ctx, id, d,
      L(`Segment AB is ${a} cm long and segment CD is ${b} cm long. By how many centimetres is the longer one longer?`, `Отрезок AB длиной ${a} см, а отрезок CD - ${b} см. На сколько сантиметров один длиннее другого?`, `AB кесіндісі ${a} см, ал CD кесіндісі ${b} см. Біреуі екіншісінен неше сантиметр ұзын?`),
      [L('Subtract the shorter length from the longer one.', 'Из большей длины вычтем меньшую.', 'Үлкен ұзындықтан кішісін азайтамыз.'), loc2(`${Math.max(a, b)} ${MINUS} ${Math.min(a, b)} = `, cm(Math.abs(a - b)))],
      Math.abs(a - b), [a + b, Math.abs(a - b) + 1, Math.abs(a - b) + 2],
      { min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [measure, measure, sumLen]);
  return anyOf(rng, [measure, sumLen, compareSeg]);
}

// ---------- Геометрические фигуры ----------

const SH = [
  // [номер фигуры для shape(), en, ru, kk, углов]
  [0, 'circle', 'круг', 'дөңгелек', 0],
  [1, 'square', 'квадрат', 'шаршы', 4],
  [2, 'triangle', 'треугольник', 'үшбұрыш', 3],
  [4, 'rectangle', 'прямоугольник', 'тіктөртбұрыш', 4],
];
const LINES = [
  ['segment', 'отрезок', 'кесінді'],
  ['curved line', 'кривая линия', 'қисық сызық'],
  ['broken line', 'ломаная линия', 'сынық сызық'],
  ['point', 'точка', 'нүкте'],
];

function lineFig(kind, rng) {
  const y = R(rng, 40, 80);
  const x0 = R(rng, 20, 60);
  const x1 = R(rng, 180, 230);
  const st = 'stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const dot = (x, yy) => `<circle cx="${x}" cy="${yy}" r="5" fill="var(--primary)"/>`;
  if (kind === 0) {
    const y1 = y + R(rng, -20, 20);
    return svg(250, 120, `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y1}" ${st}/>` + dot(x0, y) + dot(x1, y1));
  }
  if (kind === 1) return svg(250, 120, `<path d="M${x0},${y} C${x0 + 50},${y - 50} ${x1 - 60},${y + 60} ${x1},${y}" ${st}/>`);
  if (kind === 2) {
    const k = R(rng, 3, 5);
    const pts = Array.from({ length: k + 1 }, (_, i) => `${Math.round(x0 + ((x1 - x0) * i) / k)},${i % 2 ? y + R(rng, 20, 35) : y - R(rng, 0, 25)}`);
    return svg(250, 120, `<polyline points="${pts.join(' ')}" ${st}/>`);
  }
  return svg(250, 120, `<circle cx="${R(rng, 60, 190)}" cy="${y}" r="6" fill="currentColor"/>`);
}

export function shapes1(ctx, d) {
  const { rng } = ctx;
  const id = 'm.shapes';
  const nm = (s) => L(s[1], s[2], s[3]);
  const name = () => {
    const s = one(rng, SH);
    const size = R(rng, 60, 110);
    const fig = svg(250, 140, shape(s[0], R(rng, 70, 180), 70, size, one(rng, SHAPE_FILL)));
    return qText(
      ctx, id, d,
      L('What is this shape called?', 'Как называется эта фигура?', 'Бұл фигура қалай аталады?'),
      [s[4] ? L(`It has ${s[4]} corners and ${s[4]} straight sides.`, `У неё ${s[4]} угла и ${s[4]} прямые стороны.`, `Оның ${s[4]} бұрышы және ${s[4]} түзу қабырғасы бар.`) : L('It has no corners: the edge is round.', 'У неё нет углов: край круглый.', 'Оның бұрышы жоқ: шеті дөңгелек.'), s[0] === 1 ? L('All four sides are equal - it is a square.', 'Все четыре стороны равны - это квадрат.', 'Төрт қабырғасы да тең - бұл шаршы.') : s[0] === 4 ? L('Opposite sides are equal, two sides are longer - it is a rectangle.', 'Противоположные стороны равны, две стороны длиннее - это прямоугольник.', 'Қарама-қарсы қабырғалары тең, екеуі ұзынырақ - бұл тіктөртбұрыш.') : nm(s)],
      nm(s), SH.filter((x) => x !== s).map(nm),
      { fig },
    );
  };
  const lineName = () => {
    const k = R(rng, 0, 3);
    const nl = (x) => L(x[0], x[1], x[2]);
    return qText(
      ctx, id, d,
      L('What is drawn in the picture?', 'Что изображено на рисунке?', 'Суретте не салынған?'),
      [[L('A segment is a straight piece of a line between two points.', 'Отрезок - прямая часть линии между двумя точками.', 'Кесінді - екі нүктенің арасындағы түзу сызықтың бөлігі.'), L('A curved line bends smoothly, without corners.', 'Кривая линия плавно изгибается, без углов.', 'Қисық сызық бұрышсыз, бір қалыпты иіледі.'), L('A broken line is made of segments joined at corners.', 'Ломаная состоит из отрезков, соединённых углами.', 'Сынық сызық бұрыштармен жалғасқан кесінділерден тұрады.'), L('A point is a tiny dot.', 'Точка - маленький знак-кружок.', 'Нүкте - кішкентай белгі.')][k], nl(LINES[k])],
      nl(LINES[k]), LINES.filter((_, i) => i !== k).map(nl),
      { fig: lineFig(k, rng) },
    );
  };
  const countKind = () => {
    const total = R(rng, 5, 9);
    const kinds = Array.from({ length: total }, () => one(rng, SH));
    const target = one(rng, kinds);
    const ans = kinds.filter((x) => x === target).length;
    const fig = svg(300, 120, kinds.map((s, i) => shape(s[0], 24 + (i % 5) * 60, 32 + Math.floor(i / 5) * 58, 40, SHAPE_FILL[i % 4])).join(''));
    const pl = { circle: ['circles', 'кругов', 'дөңгелек'], square: ['squares', 'квадратов', 'шаршы'], triangle: ['triangles', 'треугольников', 'үшбұрыш'], rectangle: ['rectangles', 'прямоугольников', 'тіктөртбұрыш'] }[target[1]];
    return qNum(
      ctx, id, d,
      L(`How many ${pl[0]} are in the picture?`, `Сколько ${pl[1]} на рисунке?`, `Суретте неше ${pl[2]} бар?`),
      [L(`Find every ${target[1]} and count them.`, `Найдём каждый ${target[2]} и посчитаем.`, `Суреттегі әр ${target[3]} фигурасын тауып, санаймыз.`), L(`Answer: ${ans}.`, `Ответ: ${ans}.`, `Жауабы: ${ans}.`)],
      ans, [ans + 1, ans - 1, total],
      { fig, min: 0, spr: 0.2 },
    );
  };
  const corners = () => {
    const [a, b] = two(rng, SH.slice(1));
    const ka = R(rng, 1, 3);
    const kb = R(rng, 1, 2);
    const ans = ka * a[4] + kb * b[4];
    const fig = svg(300, 80, [...Array(ka).fill(a), ...Array(kb).fill(b)].map((s, i) => shape(s[0], 30 + i * 55, 40, 40, SHAPE_FILL[i % 4])).join(''));
    return qNum(
      ctx, id, d,
      L('How many corners do all the shapes in the picture have together?', 'Сколько всего углов у всех фигур на рисунке?', 'Суреттегі барлық фигуралардың бұрыштары барлығы нешеу?'),
      [L(`A triangle has 3 corners, a square and a rectangle have 4.`, `У треугольника 3 угла, у квадрата и прямоугольника - 4.`, `Үшбұрыштың 3 бұрышы бар, шаршы мен тіктөртбұрыштың - 4.`), same(`${Array(ka).fill(a[4]).concat(Array(kb).fill(b[4])).join(' + ')} = ${ans}`)],
      ans, [ka + kb, ans + 1, ans - 1, ans + 3],
      { fig, min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [name, lineName, countKind]);
  return anyOf(rng, [countKind, corners, lineName, name]);
}

// ---------- Ориентация: левее-правее, выше-ниже ----------

// [номер фигуры, en, ru, kk, родительный kk, союз kk «и», ж. р. в ru]
const OR_SHAPES = [
  [0, 'circle', 'круг', 'дөңгелек', 'дөңгелектің', 'пен', 0],
  [1, 'square', 'квадрат', 'шаршы', 'шаршының', 'мен', 0],
  [2, 'triangle', 'треугольник', 'үшбұрыш', 'үшбұрыштың', 'пен', 0],
  [3, 'star', 'звезда', 'жұлдыз', 'жұлдыздың', 'бен', 1],
];

export function orient(ctx, d) {
  const { rng } = ctx;
  const id = 'm.orient';
  // Пять разных фигур разного цвета.
  const pool = [];
  for (const s of OR_SHAPES) for (const c of COLORS) pool.push([s, c]);
  const row = [];
  while (row.length < 5) {
    const x = one(rng, pool);
    if (!row.includes(x)) row.push(x);
  }
  const name = ([s, c]) => L(`${c[0]} ${s[1]}`, `${s[6] ? c[2] : c[1]} ${s[2]}`, `${c[3]} ${s[3]}`);
  const gen = ([s, c]) => `${c[3]} ${s[4]}`;
  const ruGen = ([s, c]) => (s[6] ? `${c[2].replace(/ая$/, 'ой').replace(/яя$/, 'ей')} звезды` : `${c[1].replace(/ый$/, 'ого').replace(/ий$/, 'его').replace(/ой$/, 'ого')} ${s[2]}а`);
  const horizontal = (items) => svg(300, 80, items.map(([s, c], i) => shape(s[0], 32 + i * 58, 40, 42, c[4])).join(''));
  const vertical = (items) => svg(120, 250, items.map(([s, c], i) => shape(s[0], 60, 30 + i * 48, 38, c[4])).join(''));
  const others = (ans) => row.filter((x) => x !== ans).map(name);
  const rightOf = () => {
    const i = R(rng, 0, 3);
    const right = rng() < 0.5;
    const [ref, ans] = right ? [row[i], row[i + 1]] : [row[i + 1], row[i]];
    return qText(
      ctx, id, d,
      right ? L(`Which shape is right after the ${name(ref).en}, to its right?`, `Какая фигура стоит сразу справа от ${ruGen(ref)}?`, `${gen(ref)} оң жағында бірден қандай фигура тұр?`) : L(`Which shape is right before the ${name(ref).en}, to its left?`, `Какая фигура стоит сразу слева от ${ruGen(ref)}?`, `${gen(ref)} сол жағында бірден қандай фигура тұр?`),
      [L(`Find the ${name(ref).en} and look ${right ? 'right' : 'left'}.`, `Найдём фигуру «${name(ref).ru}» и посмотрим ${right ? 'вправо' : 'влево'}.`, `«${name(ref).kk}» фигурасын тауып, ${right ? 'оң' : 'сол'} жағына қараймыз.`), name(ans)],
      name(ans), others(ans),
      { fig: horizontal(row) },
    );
  };
  const between = () => {
    const i = R(rng, 0, 2);
    const ans = row[i + 1];
    const [a, b] = [row[i], row[i + 2]];
    return qText(
      ctx, id, d,
      L(`Which shape is between the ${name(a).en} and the ${name(b).en}?`, `Какая фигура стоит между фигурами «${name(a).ru}» и «${name(b).ru}»?`, `«${name(a).kk}» ${a[0][5]} «${name(b).kk}» арасында қандай фигура тұр?`),
      [L('"Between" means it has one neighbour on each side.', '«Между» - значит, у неё по соседу с каждой стороны.', '«Арасында» - оның екі жағында да көршісі бар деген сөз.'), name(ans)],
      name(ans), others(ans),
      { fig: horizontal(row) },
    );
  };
  const place = () => {
    const i = R(rng, 0, 4);
    const left = rng() < 0.5;
    const ans = left ? i + 1 : 5 - i;
    return qNum(
      ctx, id, d,
      left ? L(`Counting from the left, what place is the ${name(row[i]).en} in?`, `На каком месте, если считать слева, стоит фигура «${name(row[i]).ru}»?`, `Сол жақтан санағанда «${name(row[i]).kk}» нешінші орында тұр?`) : L(`Counting from the right, what place is the ${name(row[i]).en} in?`, `На каком месте, если считать справа, стоит фигура «${name(row[i]).ru}»?`, `Оң жақтан санағанда «${name(row[i]).kk}» нешінші орында тұр?`),
      [left ? L('Count from the left edge: first, second, ...', 'Считаем от левого края: первая, вторая, ...', 'Сол жақ шеттен санаймыз: бірінші, екінші, ...') : L('Count from the right edge: first, second, ...', 'Считаем от правого края: первая, вторая, ...', 'Оң жақ шеттен санаймыз: бірінші, екінші, ...'), L(`Answer: ${ans}.`, `Ответ: ${ans}.`, `Жауабы: ${ans}.`)],
      ans, [6 - ans, ans + 1, ans - 1].filter((x) => x >= 1 && x <= 5),
      { fig: horizontal(row), min: 1, spr: 0 },
    );
  };
  const updown = () => {
    const col = row.slice(0, 4);
    const k = R(rng, 0, 2);
    if (k === 0) {
      const top = rng() < 0.5;
      const ans = top ? col[0] : col[3];
      return qText(
        ctx, id, d,
        top ? L('Which shape is at the very top?', 'Какая фигура находится выше всех?', 'Ең жоғарыда қандай фигура тұр?') : L('Which shape is at the very bottom?', 'Какая фигура находится ниже всех?', 'Ең төменде қандай фигура тұр?'),
        [top ? L('Look at the top of the column.', 'Смотрим на верх столбика.', 'Бағананың жоғарғы жағына қараймыз.') : L('Look at the bottom of the column.', 'Смотрим на низ столбика.', 'Бағананың төменгі жағына қараймыз.'), name(ans)],
        name(ans), col.filter((x) => x !== ans).map(name),
        { fig: vertical(col) },
      );
    }
    const i = R(rng, 0, 2);
    const below = k === 1;
    const [ref, ans] = below ? [col[i], col[i + 1]] : [col[i + 1], col[i]];
    return qText(
      ctx, id, d,
      below ? L(`Which shape is right below the ${name(ref).en}?`, `Какая фигура находится сразу под фигурой «${name(ref).ru}»?`, `«${name(ref).kk}» фигурасының дәл астында қандай фигура тұр?`) : L(`Which shape is right above the ${name(ref).en}?`, `Какая фигура находится сразу над фигурой «${name(ref).ru}»?`, `«${name(ref).kk}» фигурасының дәл үстінде қандай фигура тұр?`),
      [below ? L('"Below" means lower.', '«Под» - значит, ниже.', '«Астында» - төменірек деген сөз.') : L('"Above" means higher.', '«Над» - значит, выше.', '«Үстінде» - жоғарырақ деген сөз.'), name(ans)],
      name(ans), col.filter((x) => x !== ans).map(name),
      { fig: vertical(col) },
    );
  };
  if (d === 1) return anyOf(rng, [rightOf, place, updown]);
  return anyOf(rng, [rightOf, between, place, updown]);
}

// ---------- Закономерности ----------

const PATTERNS = ['AB', 'ABC', 'AAB', 'ABB', 'AABB', 'ABCC'];

export function pattern1(ctx, d) {
  const { rng } = ctx;
  const id = 'm.pattern';
  const shapesQ = () => {
    const pat = one(rng, d === 1 ? PATTERNS.slice(0, 4) : PATTERNS);
    const pool = [];
    for (const s of OR_SHAPES) for (const c of COLORS) pool.push([s, c]);
    const used = [];
    while (used.length < 4) {
      const x = one(rng, pool);
      if (!used.includes(x)) used.push(x);
    }
    const map = { A: used[0], B: used[1], C: used[2] };
    const len = R(rng, 6, 8);
    const seq = Array.from({ length: len + 1 }, (_, i) => map[pat[i % pat.length]]);
    const ans = seq[len];
    const name = ([s, c]) => L(`${c[0]} ${s[1]}`, `${s[6] ? c[2] : c[1]} ${s[2]}`, `${c[3]} ${s[3]}`);
    const fig = svg(30 + (len + 1) * 34, 60, seq.slice(0, len).map(([s, c], i) => shape(s[0], 22 + i * 34, 30, 26, c[4])).join('') + `<rect x="${7 + len * 34}" y="14" width="30" height="32" rx="6" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3"/><text x="${22 + len * 34}" y="37" class="geo-v" text-anchor="middle">?</text>`);
    return qText(
      ctx, id, d,
      L('Which shape comes next?', 'Какая фигура должна быть следующей?', 'Келесі қай фигура болуы керек?'),
      [L(`The group of ${pat.length} shapes repeats again and again.`, `Группа из ${pat.length} фигур повторяется снова и снова.`, `${pat.length} фигурадан тұратын топ қайта-қайта қайталанады.`), name(ans)],
      name(ans), used.filter((x) => x !== ans).map(name),
      { fig },
    );
  };
  const numbersQ = () => {
    const step = d === 1 ? one(rng, [1, 2, -1, -2]) : one(rng, [2, 3, 5, 10, -2, -3, -5]);
    const len = 5;
    const top = d === 1 ? 20 : 60;
    const start = step > 0 ? R(rng, 0, top - step * len) : R(rng, -step * len, top);
    const seq = Array.from({ length: len }, (_, i) => start + i * step);
    const hole = d === 1 ? len - 1 : R(rng, 1, len - 1);
    const ans = seq[hole];
    const shown = seq.map((x, i) => (i === hole ? '?' : x)).join(', ');
    return qNum(
      ctx, id, d,
      L(`Find the missing number: ${shown}`, `Найди пропущенное число: ${shown}`, `Жетіспейтін санды тап: ${shown}`),
      [step > 0 ? L(`Each number is ${step} more than the one before.`, `Каждое число на ${step} больше предыдущего.`, `Әр сан алдыңғысынан ${kkDat(step)} артық.`) : L(`Each number is ${-step} less than the one before.`, `Каждое число на ${-step} меньше предыдущего.`, `Әр сан алдыңғысынан ${kkDat(-step)} кем.`), same(`${seq[hole - 1]} ${step > 0 ? '+' : MINUS} ${Math.abs(step)} = ${ans}`)],
      ans, [ans + step, ans - step, ans + 1, ans - 1],
      { min: 0 },
    );
  };
  return anyOf(rng, [shapesQ, numbersQ]);
}

// ---------- Деньги ----------

const TG = (v) => L(`${n(v)} tenge`, `${n(v)} тенге`, `${n(v)} теңге`);

export function money1(ctx, d) {
  const { rng } = ctx;
  const id = 'm.money1';
  const coinsSum = () => {
    const kinds = d === 1 ? [1, 2, 5, 10] : [1, 2, 5, 10, 20, 50];
    const k = R(rng, 2, d === 1 ? 4 : 5);
    let coins = Array.from({ length: k }, () => one(rng, kinds)).sort((a, b) => b - a);
    const limit = d === 1 ? 20 : 100;
    while (coins.reduce((s, x) => s + x, 0) > limit) coins = coins.slice(1);
    const sum = coins.reduce((s, x) => s + x, 0);
    return qNum(
      ctx, id, d,
      L('How many tenge are in the picture?', 'Сколько тенге на рисунке?', 'Суретте неше теңге бар?'),
      [L('Add the values of all the coins, starting with the biggest.', 'Сложим достоинства всех монет, начиная с самой крупной.', 'Барлық монеталардың құнын ең үлкенінен бастап қосамыз.'), same(`${coins.join(' + ')} = ${sum}`)],
      sum, [why(coins.length, L('We add the values of the coins, not count them.', 'Складываем достоинства монет, а не считаем их штуки.', 'Монеталардың санын емес, құнын қосамыз.')), sum + 1, sum - 1, sum + 5],
      { fig: moneySvg(coins), min: 1 },
    );
  };
  const howMany = () => {
    const [c, total] = d === 1 ? one(rng, [[2, 10], [2, 6], [2, 8], [5, 10], [5, 15], [5, 20], [2, 12], [2, 14], [10, 20], [2, 16], [2, 18], [2, 20]]) : one(rng, [[5, 30], [5, 40], [10, 50], [10, 70], [20, 60], [20, 80], [10, 90], [5, 25], [5, 35], [50, 100], [20, 100], [10, 100], [5, 45], [2, 30]]);
    return qNum(
      ctx, id, d,
      L(`How many coins of ${c} tenge make ${total} tenge?`, `Сколько монет по ${c} тенге нужно, чтобы получилось ${total} тенге?`, `${total} теңге болу үшін ${c} теңгелік неше монета керек?`),
      [L(`Count by ${c}: ${Array.from({ length: total / c }, (_, i) => (i + 1) * c).join(', ')}.`, `Считаем по ${c}: ${Array.from({ length: total / c }, (_, i) => (i + 1) * c).join(', ')}.`, `${kkAbl(c)} санаймыз: ${Array.from({ length: total / c }, (_, i) => (i + 1) * c).join(', ')}.`), L(`That is ${total / c} coins.`, `Это ${total / c} монет(ы).`, `Бұл - ${total / c} монета.`)],
      total / c, [total - c, total / c + 1, total / c - 1],
      { min: 1 },
    );
  };
  const change = () => {
    const price = R(rng, 2, d === 1 ? 9 : 45);
    const paid = d === 1 ? one(rng, [10, 20].filter((p) => p > price)) : one(rng, [50, 50, 100].filter((p) => p > price));
    const rest = paid - price;
    return qNum(
      ctx, id, d,
      L(`A pen costs ${TG(price).en}. You pay with a coin of ${paid} tenge. How much change do you get?`, `Ручка стоит ${TG(price).ru}. Ты платишь монетой ${paid} тенге. Сколько сдачи тебе дадут?`, `Қалам ${TG(price).kk} тұрады. Сен ${paid} теңгелік монетамен төлейсің. Саған қанша қайтарады?`),
      [L('Change = what you paid - the price.', 'Сдача = сколько дали - сколько стоит.', 'Қайтарым = берген ақша - баға.'), same(`${paid} ${MINUS} ${price} = ${rest}`)],
      rest, [why(paid + price, L('Change is what is left over, so subtract.', 'Сдача - это остаток, поэтому вычитаем.', 'Қайтарым - артылған ақша, сондықтан азайтамыз.')), rest + 1, rest - 1],
      { min: 1 },
    );
  };
  const enough = () => {
    const coins = Array.from({ length: R(rng, 2, 4) }, () => one(rng, d === 1 ? [1, 2, 5] : [5, 10, 20])).sort((a, b) => b - a);
    const have = coins.reduce((s, x) => s + x, 0);
    const price = have + R(rng, 1, d === 1 ? 5 : 15);
    return qNum(
      ctx, id, d,
      L(`A toy costs ${TG(price).en}. The child has the coins shown. How many tenge are missing?`, `Игрушка стоит ${TG(price).ru}. У ребёнка монеты, как на рисунке. Сколько тенге не хватает?`, `Ойыншық ${TG(price).kk} тұрады. Баланың монеталары суреттегідей. Неше теңге жетпейді?`),
      [L(`The child has ${coins.join(' + ')} = ${have} tenge.`, `У ребёнка ${coins.join(' + ')} = ${have} тенге.`, `Балада ${coins.join(' + ')} = ${have} теңге бар.`), same(`${price} ${MINUS} ${have} = ${price - have}`)],
      price - have, [have, price + have, price - have + 1],
      { fig: moneySvg(coins), min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [coinsSum, coinsSum, howMany, change]);
  return anyOf(rng, [coinsSum, howMany, change, enough]);
}

// ---------- Время: часы, дни недели ----------

export const DAYS = [
  ['Monday', 'понедельник', 'дүйсенбі'],
  ['Tuesday', 'вторник', 'сейсенбі'],
  ['Wednesday', 'среда', 'сәрсенбі'],
  ['Thursday', 'четверг', 'бейсенбі'],
  ['Friday', 'пятница', 'жұма'],
  ['Saturday', 'суббота', 'сенбі'],
  ['Sunday', 'воскресенье', 'жексенбі'],
];
const RU_AFTER = ['понедельника', 'вторника', 'среды', 'четверга', 'пятницы', 'субботы', 'воскресенья'];
const KK_AFTER = ['дүйсенбіден', 'сейсенбіден', 'сәрсенбіден', 'бейсенбіден', 'жұмадан', 'сенбіден', 'жексенбіден'];
export const hm = (h, m) => `${h}:${String(m).padStart(2, '0')}`;

/** Сколько показывают часы: варианты - типичные путаницы стрелок. */
export function clockQ(ctx, id, d, h, m) {
  const ans = hm(h, m);
  const swapH = m === 0 ? 12 : Math.round(m / 5) || 12;
  const swapM = (h % 12) * 5;
  const wrong = [hm(swapH, swapM), hm(h === 12 ? 1 : h + 1, m), hm(h === 1 ? 12 : h - 1, m), hm(h, (m + 30) % 60), hm(h, m === 15 ? 45 : 15)];
  return qText(
    ctx, id, d,
    L('What time does the clock show?', 'Сколько времени показывают часы?', 'Сағат қанша уақытты көрсетіп тұр?'),
    [L(`The short hand shows the hours: ${m === 0 ? h : `between ${h} and ${h === 12 ? 1 : h + 1}`}.`, `Короткая стрелка показывает часы: ${m === 0 ? h : `между ${h} и ${h === 12 ? 1 : h + 1}`}.`, `Қысқа тіл сағатты көрсетеді: ${m === 0 ? h : `${h} мен ${h === 12 ? 1 : h + 1} арасында`}.`), L(`The long hand shows the minutes: ${m}.`, `Длинная стрелка показывает минуты: ${m}.`, `Ұзын тіл минутты көрсетеді: ${m}.`), same(ans)],
    ans, wrong.filter((w) => w !== ans),
    { fig: clockSvg(h, m) },
  );
}

export function dayQ(ctx, id, d, maxShift) {
  const { rng } = ctx;
  const i = R(rng, 0, 6);
  const k = R(rng, 1, maxShift);
  const forward = maxShift === 1 || rng() < 0.6;
  const j = (i + (forward ? k : 7 - k)) % 7;
  const day = (x) => L(DAYS[x][0], DAYS[x][1], DAYS[x][2]);
  const prompt =
    k === 1 && forward
      ? L(`Which day of the week comes after ${DAYS[i][0]}?`, `Какой день недели идёт после ${RU_AFTER[i]}?`, `Аптаның қай күні ${KK_AFTER[i]} кейін келеді?`)
      : forward
        ? L(`Today is ${DAYS[i][0]}. What day will it be in ${k} days?`, `Сегодня ${DAYS[i][1]}. Какой день будет через ${k} ${k === 1 ? 'день' : k < 5 ? 'дня' : 'дней'}?`, `Бүгін - ${DAYS[i][2]}. ${k} күннен кейін қай күн болады?`)
        : L(`Today is ${DAYS[i][0]}. What day was it ${k} days ago?`, `Сегодня ${DAYS[i][1]}. Какой день был ${k} ${k === 1 ? 'день' : k < 5 ? 'дня' : 'дней'} назад?`, `Бүгін - ${DAYS[i][2]}. ${k} күн бұрын қай күн болған?`);
  return qText(
    ctx, id, d,
    prompt,
    [L('Days go in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday - and again Monday.', 'Дни идут по порядку: понедельник, вторник, среда, четверг, пятница, суббота, воскресенье - и снова понедельник.', 'Күндер ретімен келеді: дүйсенбі, сейсенбі, сәрсенбі, бейсенбі, жұма, сенбі, жексенбі - сосын қайтадан дүйсенбі.'), day(j)],
    day(j), [day((j + 1) % 7), day((j + 6) % 7), day(i), day((j + 2) % 7)],
  );
}

export function clock1(ctx, d) {
  const { rng } = ctx;
  const id = 'm.clock1';
  const h = R(rng, 1, 12);
  const passed = () => {
    const a = R(rng, 1, 9);
    const b = R(rng, a + 1, 12);
    return qNum(
      ctx, id, d,
      L(`A lesson started at ${a}:00 and the walk ended at ${b}:00. How many hours passed?`, `Занятия начались в ${a}:00, а прогулка закончилась в ${b}:00. Сколько часов прошло?`, `Сабақ ${kkAt(a, 0)} басталып, серуен ${kkAt(b, 0)} аяқталды. Неше сағат өтті?`),
      [L('Subtract the start time from the end time.', 'Из времени окончания вычтем время начала.', 'Аяқталу уақытынан басталу уақытын азайтамыз.'), same(`${b} ${MINUS} ${a} = ${b - a}`)],
      b - a, [a + b, b - a + 1, b - a - 1],
      { min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [() => clockQ(ctx, id, d, h, 0), () => clockQ(ctx, id, d, h, 30), () => dayQ(ctx, id, d, rng() < 0.4 ? 1 : 3), passed]);
  return anyOf(rng, [() => clockQ(ctx, id, d, h, one(rng, [15, 30, 45])), () => clockQ(ctx, id, d, h, one(rng, [0, 15, 45])), () => dayQ(ctx, id, d, 6), passed]);
}

// ---------- Счёт в пределах 100 ----------

export function count100(ctx, d) {
  const { rng } = ctx;
  const id = 'm.count100';
  const nextPrev = () => {
    const x = d === 1 ? 10 * R(rng, 2, 9) + one(rng, [9, 0, R(rng, 1, 8)]) : R(rng, 21, 99);
    if (x >= 100) return nextPrev();
    const after = rng() < 0.5;
    const ans = after ? x + 1 : x - 1;
    return qNum(
      ctx, id, d,
      after ? L(`Which number comes after ${x}?`, `Какое число идёт после ${x}?`, `${x} санынан кейін қандай сан келеді?`) : L(`Which number comes before ${x}?`, `Какое число стоит перед ${x}?`, `${x} санының алдында қандай сан тұр?`),
      [after && x % 10 === 9 ? L('After 9 ones comes a new ten.', 'После 9 единиц начинается новый десяток.', '9 бірліктен кейін жаңа ондық басталады.') : L('Neighbours differ by 1.', 'Соседние числа отличаются на 1.', 'Көрші сандар 1-ге ерекшеленеді.'), same(after ? `${x} + 1 = ${ans}` : `${x} ${MINUS} 1 = ${ans}`)],
      ans, [after ? x - 1 : x + 1, ans + 10, ans - 10, x],
      { min: 0 },
    );
  };
  const tensPic = () => {
    const t = R(rng, 2, 9);
    const o = R(rng, 0, 9);
    const x = t * 10 + o;
    return qNum(
      ctx, id, d,
      L('Each stick is a ten. What number is shown?', 'Каждая полоска - десяток. Какое число показано?', 'Әр жолақ - бір ондық. Қандай сан көрсетілген?'),
      [L(`${t} tens and ${o} ones.`, `${t} дес. и ${o} ед.`, `${t} ондық және ${o} бірлік.`), same(`${t * 10} + ${o} = ${x}`)],
      x, [why(t + o, L('A stick is ten, not one.', 'Полоска - это десять, а не один.', 'Жолақ - бір емес, он.')), o * 10 + t, x + 10, x - 1],
      { fig: tensSvg(t, o), min: 0 },
    );
  };
  const byTens = () => {
    const start = d === 1 ? 10 * R(rng, 1, 5) : R(rng, 3, 45);
    const seq = [0, 1, 2, 3].map((i) => start + i * 10);
    const ans = start + 40;
    return qNum(
      ctx, id, d,
      L(`Count on by tens: ${seq.join(', ')}, ...`, `Продолжи счёт десятками: ${seq.join(', ')}, ...`, `Ондықпен санауды жалғастыр: ${seq.join(', ')}, ...`),
      [L('Each time add one ten (10).', 'Каждый раз прибавляем один десяток (10).', 'Әр жолы бір ондық (10) қосамыз.'), same(`${seq[3]} + 10 = ${ans}`)],
      ans, [seq[3] + 1, ans + 10, ans - 1],
      { min: 0 },
    );
  };
  const tensOf = () => {
    const t = R(rng, 1, 9);
    if (rng() < 0.5)
      return qNum(ctx, id, d, L(`How many tens are in ${t * 10}?`, `Сколько десятков в числе ${t * 10}?`, `${t * 10} санында неше ондық бар?`), [same(`${t * 10} = ${Array(t).fill(10).join(' + ')}`)], t, [t * 10, t + 1, 10], { min: 1 });
    const x = t * 10 + R(rng, 1, 9);
    return qNum(ctx, id, d, L(`Which number has ${t} tens and ${x % 10} ones?`, `В каком числе ${t} дес. и ${x % 10} ед.?`, `Қай санда ${t} ондық және ${x % 10} бірлік бар?`), [same(`${t * 10} + ${x % 10} = ${x}`)], x, [(x % 10) * 10 + t, t + (x % 10), x + 10], { min: 1 });
  };
  const missing = () => {
    const a = R(rng, 20, 95);
    const seq = [a, a + 1, a + 2, a + 3].filter((x) => x <= 100);
    if (seq.length < 4) return missing();
    const hole = R(rng, 1, 3);
    return qNum(
      ctx, id, d,
      L(`Find the missing number: ${seq.map((x, i) => (i === hole ? '?' : x)).join(', ')}`, `Найди пропущенное число: ${seq.map((x, i) => (i === hole ? '?' : x)).join(', ')}`, `Жетіспейтін санды тап: ${seq.map((x, i) => (i === hole ? '?' : x)).join(', ')}`),
      [L('The numbers go up by 1.', 'Числа идут по порядку, каждое на 1 больше.', 'Сандар ретімен келеді, әрқайсысы 1-ге артық.'), same(`${seq[hole - 1]} + 1 = ${seq[hole]}`)],
      seq[hole], [seq[hole] + 10, seq[hole] - 10, seq[hole] + 2],
      { min: 0 },
    );
  };
  const line = () => {
    const from = 10 * R(rng, 0, 8);
    const k = R(rng, 1, 9);
    return qNum(
      ctx, id, d,
      L('Which number does point A show?', 'Какое число отмечено точкой A?', 'A нүктесі қандай санды көрсетеді?'),
      [L('Each step on the line is 1.', 'Каждый шаг на линейке - это 1.', 'Сызғыштағы әр қадам - 1.'), same(`${from} + ${k} = ${from + k}`)],
      from + k, [from + k + 1, from + k - 1, k],
      { fig: lineSvg(from, 1, 10, { A: from + k }, { showAll: true }), min: 0 },
    );
  };
  if (d === 1) return anyOf(rng, [nextPrev, tensPic, byTens, tensOf]);
  return anyOf(rng, [nextPrev, missing, line, byTens, tensPic]);
}
