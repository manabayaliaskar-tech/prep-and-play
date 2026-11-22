// Математика 2 класса: числа до 100 и разряды, устные вычисления, столбик, смысл умножения,
// таблица на 2 и 3, законы сложения, скобки, уравнения, единицы длины, время, периметр,
// прямой угол, задачи в два действия, покупки и сдача.

import { L, n, same, why } from '../gen.js';
import { DIV, ITEMS, MINUS, NAMES, R, TIMES, angleSvg, anyOf, clockSvg, cnt, columnSvg, g, groupsSvg, kkAt, kkDat, one, polySvg, qNum, qText, rectPts, ru, rulerSvg, two } from './kit.js';
import { clockQ, hm } from './grade1.js';

const calc = (e) => L(`Calculate: ${e}`, `Вычисли: ${e}`, `Есепте: ${e}`);
const solve = (e) => L(`Solve the equation: ${e}`, `Реши уравнение: ${e}`, `Теңдеуді шеш: ${e}`);
const ans = (v) => L(`Answer: ${v}.`, `Ответ: ${v}.`, `Жауабы: ${v}.`);
const TG = (v) => L(`${n(v)} tenge`, `${n(v)} тенге`, `${n(v)} теңге`);

// ---------- Числа до 100, разряды ----------

export function place100(ctx, d) {
  const { rng } = ctx;
  const id = 'm.place100';
  const x = R(rng, 11, 99);
  const t = Math.floor(x / 10);
  const o = x % 10;
  const expand = () =>
    qText(
      ctx, id, d,
      L(`Write ${x} as a sum of tens and ones.`, `Представь число ${x} в виде суммы разрядных слагаемых.`, `${x} санын разрядтық қосылғыштардың қосындысы түрінде жаз.`),
      [L(`${x} has ${t} tens and ${o} ones.`, `В числе ${x} ${t} дес. и ${o} ед.`, `${x} санында ${t} ондық және ${o} бірлік бар.`), same(`${x} = ${t * 10} + ${o}`)],
      same(`${t * 10} + ${o}`), [same(`${t} + ${o}`), same(`${o * 10} + ${t}`), same(`${t * 10} + ${o * 10}`), same(`${t * 10 + 10} + ${o}`)],
    );
  const digitAt = () => {
    const tens = rng() < 0.5;
    if (o === t) return expand();
    return qNum(
      ctx, id, d,
      tens ? L(`Which digit is in the tens place of ${x}?`, `Какая цифра стоит в разряде десятков числа ${x}?`, `${x} санының ондықтар разрядында қай цифр тұр?`) : L(`Which digit is in the ones place of ${x}?`, `Какая цифра стоит в разряде единиц числа ${x}?`, `${x} санының бірліктер разрядында қай цифр тұр?`),
      [L('In a two-digit number the left digit is tens, the right digit is ones.', 'В двузначном числе левая цифра - десятки, правая - единицы.', 'Екі таңбалы санда сол жақ цифр - ондықтар, оң жағы - бірліктер.'), ans(tens ? t : o)],
      tens ? t : o, [tens ? o : t, tens ? t * 10 : o * 10, x],
      { spr: 0, min: 0 },
    );
  };
  const cmp = () => {
    let y = R(rng, 11, 99);
    while (y === x) y = R(rng, 11, 99);
    const sign = x > y ? '&gt;' : '&lt;';
    return qText(
      ctx, id, d,
      L(`Which sign goes in the box: ${x} ☐ ${y}`, `Какой знак поставить в окошко: ${x} ☐ ${y}`, `Терезеге қай таңбаны қою керек: ${x} ☐ ${y}`),
      [Math.floor(x / 10) !== Math.floor(y / 10) ? L('Compare the tens first.', 'Сначала сравниваем десятки.', 'Алдымен ондықтарды салыстырамыз.') : L('The tens are equal, so compare the ones.', 'Десятки равны, поэтому сравниваем единицы.', 'Ондықтар тең, сондықтан бірліктерді салыстырамыз.'), same(`${x} ${sign} ${y}`)],
      sign, ['&gt;', '&lt;', '='].filter((s) => s !== sign),
    );
  };
  const plus10 = () => {
    const more = rng() < 0.5;
    const k = d === 1 ? 10 : 10 * R(rng, 1, 3);
    const v = more ? x + k : x - k;
    if (v < 0 || v > 99) return expand();
    return qNum(
      ctx, id, d,
      more ? L(`Which number is ${k} more than ${x}?`, `Какое число на ${k} больше, чем ${x}?`, `${x} санынан ${kkDat(k)} артық сан қандай?`) : L(`Which number is ${k} less than ${x}?`, `Какое число на ${k} меньше, чем ${x}?`, `${x} санынан ${kkDat(k)} кем сан қандай?`),
      [L(`Only the tens change: ${k / 10} ten(s) ${more ? 'more' : 'less'}.`, `Меняются только десятки: на ${k / 10} дес. ${more ? 'больше' : 'меньше'}.`, `Тек ондықтар өзгереді: ${k / 10} ондыққа ${more ? 'артық' : 'кем'}.`), same(`${x} ${more ? '+' : MINUS} ${k} = ${v}`)],
      v, [more ? x + 1 : x - 1, more ? x - k : x + k, v + 1],
      { min: 0 },
    );
  };
  const fromDigits = () => {
    let [a, b] = two(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const big = rng() < 0.5;
    const v = big ? Math.max(a, b) * 10 + Math.min(a, b) : Math.min(a, b) * 10 + Math.max(a, b);
    const other = big ? Math.min(a, b) * 10 + Math.max(a, b) : Math.max(a, b) * 10 + Math.min(a, b);
    return qNum(
      ctx, id, d,
      big ? L(`Make the largest two-digit number from the digits ${a} and ${b} (each digit once).`, `Составь из цифр ${a} и ${b} самое большое двузначное число (каждую цифру - один раз).`, `${a} және ${b} цифрларынан ең үлкен екі таңбалы сан құра (әр цифр бір рет).`) : L(`Make the smallest two-digit number from the digits ${a} and ${b} (each digit once).`, `Составь из цифр ${a} и ${b} самое маленькое двузначное число (каждую цифру - один раз).`, `${a} және ${b} цифрларынан ең кіші екі таңбалы сан құра (әр цифр бір рет).`),
      [big ? L('Put the bigger digit in the tens place.', 'Большую цифру ставим в разряд десятков.', 'Үлкен цифрды ондықтар разрядына қоямыз.') : L('Put the smaller digit in the tens place.', 'Меньшую цифру ставим в разряд десятков.', 'Кіші цифрды ондықтар разрядына қоямыз.'), ans(v)],
      v, [other, a + b, v + 1],
      { min: 10 },
    );
  };
  const tensCount = () => {
    const v = 10 * R(rng, 2, 9) + R(rng, 0, 9);
    return qNum(
      ctx, id, d,
      L(`How many whole tens are in ${v}?`, `Сколько всего десятков в числе ${v}?`, `${v} санында барлығы неше ондық бар?`),
      [L(`${v} = ${Math.floor(v / 10) * 10} + ${v % 10}.`, `${v} = ${Math.floor(v / 10) * 10} + ${v % 10}.`, `${v} = ${Math.floor(v / 10) * 10} + ${v % 10}.`), ans(Math.floor(v / 10))],
      Math.floor(v / 10), [v % 10, Math.floor(v / 10) * 10, Math.floor(v / 10) + 1],
      { min: 0 },
    );
  };
  if (d === 1) return anyOf(rng, [expand, digitAt, cmp, plus10]);
  return anyOf(rng, [fromDigits, cmp, plus10, tensCount, expand]);
}

// ---------- Устное сложение и вычитание двузначных чисел ----------

export function add2d(ctx, d) {
  const { rng } = ctx;
  const id = 'm.add2d';
  if (d === 1) {
    const k = R(rng, 0, 3);
    const a = R(rng, 21, 79);
    if (k === 0) {
      const b = 10 * R(rng, 1, Math.floor((99 - a) / 10));
      return qNum(ctx, id, d, calc(`${a} + ${b}`), [L('Add tens to tens; the ones stay.', 'Десятки прибавляем к десяткам, единицы не меняются.', 'Ондықтарды ондықтарға қосамыз, бірліктер өзгермейді.'), same(`${a} + ${b} = ${a + b}`)], a + b, [a + b / 10, a + b + 1, a + b - 10], { min: 0 });
    }
    if (k === 1) {
      const b = 10 * R(rng, 1, Math.floor(a / 10));
      return qNum(ctx, id, d, calc(`${a} ${MINUS} ${b}`), [L('Subtract tens from tens; the ones stay.', 'Десятки вычитаем из десятков, единицы не меняются.', 'Ондықтардан ондықтарды азайтамыз, бірліктер өзгермейді.'), same(`${a} ${MINUS} ${b} = ${a - b}`)], a - b, [a - b / 10, a - b + 10, a - b - 1], { min: 0 });
    }
    const o = a % 10;
    if (k === 2) {
      const b = R(rng, 1, 9 - o || 1);
      if (o + b > 9) return add2d(ctx, d);
      return qNum(ctx, id, d, calc(`${a} + ${b}`), [L('Add ones to ones.', 'Единицы прибавляем к единицам.', 'Бірліктерді бірліктерге қосамыз.'), same(`${o} + ${b} = ${o + b}, ${a} + ${b} = ${a + b}`)], a + b, [a + b * 10, a + b + 1, a + b - 1], { min: 0 });
    }
    if (o === 0) return add2d(ctx, d);
    const b = R(rng, 1, o);
    return qNum(ctx, id, d, calc(`${a} ${MINUS} ${b}`), [L('Subtract ones from ones.', 'Единицы вычитаем из единиц.', 'Бірліктерден бірліктерді азайтамыз.'), same(`${a} ${MINUS} ${b} = ${a - b}`)], a - b, [a - b * 10, a - b + 1, a - b - 1], { min: 0 });
  }
  const a = R(rng, 15, 69);
  const b = R(rng, 12, Math.min(29, 99 - a));
  const bt = b - (b % 10);
  if (rng() < 0.5)
    return qNum(ctx, id, d, calc(`${a} + ${b}`), [L('Add the tens first, then the ones.', 'Сначала прибавим десятки, потом единицы.', 'Алдымен ондықтарды, сосын бірліктерді қосамыз.'), same(`${a} + ${bt} = ${a + bt}, ${a + bt} + ${b % 10} = ${a + b}`)], a + b, [why(a + b - 10, L('You forgot the carried ten.', 'Ты забыл перенесённый десяток.', 'Ауысқан ондықты ұмыттың.')), a + b + 10, a + b + 1], { min: 0 });
  const s = a + b;
  return qNum(ctx, id, d, calc(`${s} ${MINUS} ${b}`), [L('Subtract the tens first, then the ones.', 'Сначала вычтем десятки, потом единицы.', 'Алдымен ондықтарды, сосын бірліктерді азайтамыз.'), same(`${s} ${MINUS} ${bt} = ${s - bt}, ${s - bt} ${MINUS} ${b % 10} = ${a}`)], a, [a + 10, a - 10, a + 1, why(Math.abs(Math.floor(s / 10) - Math.floor(b / 10)) * 10 + Math.abs((s % 10) - (b % 10)), L('You subtracted the smaller digit from the bigger one in each place.', 'Ты вычитал в каждом разряде меньшую цифру из большей.', 'Әр разрядта үлкен цифрдан кішісін азайттың.'))], { min: 0 });
}

// ---------- Сложение и вычитание столбиком ----------

/** Сумма «без переноса» - типичная ошибка. */
const noCarry = (a, b) => [...String(a + b)].length && Number([...String(Math.max(a, b))].map((_, i, arr) => {
  const da = Math.floor(a / 10 ** (arr.length - 1 - i)) % 10;
  const db = Math.floor(b / 10 ** (arr.length - 1 - i)) % 10;
  return (da + db) % 10;
}).join(''));
/** Вычитание «меньшее из большего в каждом разряде» - типичная ошибка. */
const noBorrow = (a, b) => Number([...String(a)].map((_, i, arr) => {
  const p = 10 ** (arr.length - 1 - i);
  return Math.abs((Math.floor(a / p) % 10) - (Math.floor(b / p) % 10));
}).join(''));

export function column(ctx, d, id = 'm.col', digits = 2, carry = d >= 2) {
  const { rng } = ctx;
  const lo = 10 ** (digits - 1);
  const hi = 10 ** digits - 1;
  let a;
  let b;
  const plus = rng() < 0.5;
  // Подбираем числа с переходом через разряд (d >= 2) или без него (d = 1).
  for (let i = 0; i < 200; i++) {
    a = R(rng, lo, hi);
    b = R(rng, lo, hi);
    if (plus && a + b > hi) continue;
    if (!plus && a < b) [a, b] = [b, a];
    if (!plus && a === b) continue;
    const has = plus ? noCarry(a, b) !== a + b : noBorrow(a, b) !== a - b;
    if (has === carry) break;
  }
  const res = plus ? a + b : a - b;
  const kk = L(
    plus ? 'Write the numbers one under the other: ones under ones, tens under tens. Add starting from the ones.' : 'Write the numbers one under the other: ones under ones, tens under tens. Subtract starting from the ones.',
    plus ? 'Пишем единицы под единицами, десятки под десятками. Складываем, начиная с единиц.' : 'Пишем единицы под единицами, десятки под десятками. Вычитаем, начиная с единиц.',
    plus ? 'Бірліктерді бірліктердің, ондықтарды ондықтардың астына жазамыз. Бірліктерден бастап қосамыз.' : 'Бірліктерді бірліктердің, ондықтарды ондықтардың астына жазамыз. Бірліктерден бастап азайтамыз.',
  );
  const note = carry
    ? plus
      ? L('If a column gives 10 or more, write the ones and carry 1 to the next column.', 'Если в разряде получилось 10 или больше, пишем единицы, а 1 переносим в следующий разряд.', 'Разрядта 10 немесе одан көп шықса, бірлігін жазып, 1-ді келесі разрядқа ауыстырамыз.')
      : L('If the top digit is smaller, borrow 1 ten from the next column.', 'Если верхняя цифра меньше, занимаем 1 десяток в соседнем разряде.', 'Жоғарғы цифр кіші болса, көрші разрядтан 1 ондық аламыз.')
    : null;
  return qNum(
    ctx, id, d,
    plus ? L(`Add in a column: ${a} + ${b}`, `Сложи столбиком: ${a} + ${b}`, `Бағанмен қос: ${a} + ${b}`) : L(`Subtract in a column: ${a} ${MINUS} ${b}`, `Вычти столбиком: ${a} ${MINUS} ${b}`, `Бағанмен азайт: ${a} ${MINUS} ${b}`),
    [kk, note, ans(res)],
    res,
    plus
      ? [why(noCarry(a, b), L('You forgot to carry 1 to the next column.', 'Ты забыл перенести 1 в следующий разряд.', '1-ді келесі разрядқа ауыстыруды ұмыттың.')), res + 10, res - 1, res + 100]
      : [why(noBorrow(a, b), L('You subtracted the smaller digit from the bigger one. Borrow a ten instead.', 'Ты вычел меньшую цифру из большей. Нужно занять десяток.', 'Үлкен цифрдан кішісін азайттың. Ондық алу керек.')), res + 10, res - 10, res + 1],
    { fig: columnSvg(a, b, plus ? '+' : MINUS), min: 0 },
  );
}
export const col = (ctx, d) => column(ctx, d, 'm.col', 2);

// ---------- Смысл умножения и деления ----------

export function mulMean(ctx, d) {
  const { rng } = ctx;
  const id = 'm.mulmean';
  const k = R(rng, 2, 5);
  const m = R(rng, 2, d === 1 ? 6 : 7);
  const pic = () =>
    qNum(
      ctx, id, d,
      L('How many dots are there in all? Count using multiplication.', 'Сколько всего точек? Посчитай с помощью умножения.', 'Барлығы неше нүкте бар? Көбейту арқылы есепте.'),
      [L(`There are ${k} groups of ${m}.`, `Здесь ${k} групп(ы) по ${m}.`, `Мұнда ${m}-ден ${k} топ бар.`), same(`${Array(k).fill(m).join(' + ')} = ${m} ${TIMES} ${k} = ${m * k}`)],
      m * k, [why(m + k, L('Multiplication is repeated addition, not adding the two numbers.', 'Умножение - это сумма одинаковых слагаемых, а не сумма двух чисел.', 'Көбейту - бірдей қосылғыштардың қосындысы, екі санның қосындысы емес.')), m * k + m, m * k - m],
      { fig: groupsSvg(k, m), min: 1 },
    );
  const toMul = () =>
    qText(
      ctx, id, d,
      L(`Write the sum as a product: ${Array(k).fill(m).join(' + ')}`, `Замени сложение умножением: ${Array(k).fill(m).join(' + ')}`, `Қосуды көбейтумен алмастыр: ${Array(k).fill(m).join(' + ')}`),
      [L(`The number ${m} is added ${k} times.`, `Число ${m} взято слагаемым ${k} раз(а).`, `${m} саны ${k} рет қосылған.`), same(`${m} ${TIMES} ${k} = ${m * k}`)],
      same(`${m} ${TIMES} ${k}`), [same(`${m} + ${k}`), same(`${m} ${TIMES} ${k + 1}`), same(`${m * k} ${TIMES} ${k}`), same(`${m} ${TIMES} ${m}`)],
    );
  const share = () => {
    const it = one(rng, ITEMS);
    const total = k * m;
    return qNum(
      ctx, id, d,
      L(`${cnt(total, it).en} were shared equally among ${k} children. How many did each child get?`, `${cnt(total, it).ru} разделили поровну между ${k} детьми. Сколько досталось каждому?`, `${cnt(total, it).kk} ${k} балаға тең бөлінді. Әр балаға нешеуден тиді?`),
      [L('Equal sharing is division.', 'Делить поровну - это деление.', 'Тең бөлу - бұл бөлу амалы.'), same(`${total} ${DIV} ${k} = ${m}`), ans(m)],
      m, [why(total - k, L('Sharing equally is division, not subtraction.', 'Делить поровну - значит делить, а не вычитать.', 'Тең бөлу - азайту емес, бөлу.')), m + 1, m - 1, k],
      { min: 1 },
    );
  };
  const groups = () => {
    const total = k * m;
    return qNum(
      ctx, id, d,
      L(`${total} pencils are put in boxes of ${m}. How many boxes are needed?`, `${ru(total, ['карандаш', 'карандаша', 'карандашей'])} разложили по ${m} в коробку. Сколько получилось коробок?`, `${total} қарындашты әр қорапқа ${m}-ден салды. Неше қорап шықты?`),
      [L(`Count how many times ${m} fits into ${total}.`, `Узнаем, сколько раз по ${m} содержится в ${total}.`, `${total} ішінде ${m} неше рет бар екенін табамыз.`), same(`${total} ${DIV} ${m} = ${k}`)],
      k, [k + 1, k - 1, total - m, m],
      { min: 1 },
    );
  };
  const toAdd = () =>
    qText(
      ctx, id, d,
      L(`Write the product as a sum: ${m} ${TIMES} ${k}`, `Замени умножение сложением: ${m} ${TIMES} ${k}`, `Көбейтуді қосумен алмастыр: ${m} ${TIMES} ${k}`),
      [L(`${m} ${TIMES} ${k} means: take ${m} ${k} times.`, `${m} ${TIMES} ${k} - это ${m} взять ${k} раз(а).`, `${m} ${TIMES} ${k} - ${m} санын ${k} рет алу.`), same(`${Array(k).fill(m).join(' + ')} = ${m * k}`)],
      same(Array(k).fill(m).join(' + ')), [same(`${m} + ${k}`), same(Array(k + 1).fill(m).join(' + ')), same(Array(k - 1).fill(m).join(' + ')), same(`${m} + ${m} + ${k}`)],
    );
  if (d === 1) return anyOf(rng, [pic, pic, toMul, toAdd, groups]);
  return anyOf(rng, [pic, toMul, share, groups, toAdd]);
}

// ---------- Таблица умножения на 2 и 3 ----------

export function tab23(ctx, d) {
  const { rng } = ctx;
  const id = 'm.tab23';
  const a = one(rng, [2, 3]);
  const b = R(rng, 1, 10);
  const p = a * b;
  const k = R(rng, 0, d === 1 ? 2 : 3);
  if (k === 0) {
    const [x, y] = rng() < 0.5 ? [a, b] : [b, a];
    return qNum(ctx, id, d, calc(`${x} ${TIMES} ${y}`), [L(`Count by ${a}s: ${Array.from({ length: b }, (_, i) => a * (i + 1)).join(', ')}.`, `Считаем по ${a}: ${Array.from({ length: b }, (_, i) => a * (i + 1)).join(', ')}.`, `${a}-ден санаймыз: ${Array.from({ length: b }, (_, i) => a * (i + 1)).join(', ')}.`), same(`${x} ${TIMES} ${y} = ${p}`)], p, [why(a + b, L('This is multiplication, not addition.', 'Здесь умножение, а не сложение.', 'Бұл - қосу емес, көбейту.')), p + a, p - a], { min: 0 });
  }
  if (k === 1) return qNum(ctx, id, d, calc(`${p} ${DIV} ${a}`), [L(`Ask: ${a} times what is ${p}?`, `Спросим: на что умножить ${a}, чтобы получить ${p}?`, `Сұраймыз: ${a}-ні неге көбейтсек, ${p} шығады?`), same(`${a} ${TIMES} ${b} = ${p}, ${p} ${DIV} ${a} = ${b}`)], b, [p - a, b + 1, b - 1, a], { min: 0 });
  if (k === 2) return qNum(ctx, id, d, L(`Find the missing number: ${a} ${TIMES} ☐ = ${p}`, `Найди пропущенное число: ${a} ${TIMES} ☐ = ${p}`, `Жетіспейтін санды тап: ${a} ${TIMES} ☐ = ${p}`), [L('An unknown factor = product : known factor.', 'Неизвестный множитель = произведение : известный множитель.', 'Белгісіз көбейткіш = көбейтінді : белгілі көбейткіш.'), same(`${p} ${DIV} ${a} = ${b}`)], b, [p - a, b + 1, p + a], { min: 0 });
  const c = R(rng, 2, 9);
  return qNum(ctx, id, d, calc(`${a} ${TIMES} ${b} + ${c}`), [L('Multiply first, then add.', 'Сначала умножаем, потом прибавляем.', 'Алдымен көбейтеміз, сосын қосамыз.'), same(`${a} ${TIMES} ${b} = ${p}, ${p} + ${c} = ${p + c}`)], p + c, [why(a * (b + c), L('Multiplication comes before addition.', 'Умножение выполняется раньше сложения.', 'Көбейту қосудан бұрын орындалады.')), p + c + a, p], { min: 0 });
}

// ---------- Переместительный и сочетательный законы ----------

export function laws(ctx, d) {
  const { rng } = ctx;
  const id = 'm.laws';
  const swapAdd = () => {
    const a = R(rng, 12, 68);
    const b = R(rng, 3, 29);
    return qText(
      ctx, id, d,
      L(`Which expression has the same value as ${a} + ${b}?`, `Какое выражение имеет то же значение, что и ${a} + ${b}?`, `Қай өрнектің мәні ${a} + ${b} өрнегінің мәніндей?`),
      [L('Swapping the addends does not change the sum.', 'От перестановки слагаемых сумма не меняется.', 'Қосылғыштардың орнын ауыстырғаннан қосынды өзгермейді.'), same(`${a} + ${b} = ${b} + ${a}`)],
      same(`${b} + ${a}`), [same(`${a} ${MINUS} ${b}`), same(`${a} + ${b + 1}`), same(`${b} ${TIMES} ${a}`), same(`${a + 1} + ${b + 1}`)],
    );
  };
  const swapMul = () => {
    const a = R(rng, 2, 9);
    const b = R(rng, 2, 9);
    if (a === b) return swapMul();
    return qText(
      ctx, id, d,
      L(`Which expression has the same value as ${a} ${TIMES} ${b}?`, `Какое выражение имеет то же значение, что и ${a} ${TIMES} ${b}?`, `Қай өрнектің мәні ${a} ${TIMES} ${b} өрнегінің мәніндей?`),
      [L('Swapping the factors does not change the product.', 'От перестановки множителей произведение не меняется.', 'Көбейткіштердің орнын ауыстырғаннан көбейтінді өзгермейді.'), same(`${a} ${TIMES} ${b} = ${b} ${TIMES} ${a}`)],
      same(`${b} ${TIMES} ${a}`), [same(`${a} + ${b}`), same(`${b} ${TIMES} ${a + 1}`), same(`${a} ${TIMES} ${a}`), same(`${b} + ${b}`)],
    );
  };
  const smart = () => {
    const c = R(rng, 1, 9);
    const a = 10 * R(rng, 1, 5) + (10 - c);
    const b = R(rng, 2, 39);
    if (a + b + c > 100) return smart();
    return qNum(
      ctx, id, d,
      L(`Calculate in a smart way: ${a} + ${b} + ${c}`, `Вычисли удобным способом: ${a} + ${b} + ${c}`, `Ыңғайлы тәсілмен есепте: ${a} + ${b} + ${c}`),
      [L(`Group the numbers that make a round ten: ${a} + ${c} = ${a + c}.`, `Сгруппируем числа, которые дают круглое число: ${a} + ${c} = ${a + c}.`, `Дөңгелек сан беретін сандарды топтаймыз: ${a} + ${c} = ${a + c}.`), same(`${a + c} + ${b} = ${a + b + c}`)],
      a + b + c, [a + b + c + 10, a + b + c - 10, a + b + c + 1],
      { min: 0 },
    );
  };
  const group = () => {
    const a = R(rng, 11, 49);
    const b = R(rng, 2, 9);
    const c = R(rng, 2, 9);
    return qText(
      ctx, id, d,
      L(`Which expression equals ${a} + ${b} + ${c}?`, `Какое выражение равно ${a} + ${b} + ${c}?`, `Қай өрнек ${a} + ${b} + ${c} өрнегіне тең?`),
      [L('Neighbouring addends can be grouped in any way.', 'Соседние слагаемые можно группировать как угодно.', 'Көрші қосылғыштарды кез келген тәсілмен топтауға болады.'), same(`(${a} + ${b}) + ${c} = ${a} + (${b} + ${c})`)],
      same(`${a} + (${b} + ${c})`), [same(`${a} + (${b} ${MINUS} ${c})`), same(`(${a} + ${b}) ${TIMES} ${c}`), same(`${a} ${MINUS} (${b} + ${c})`), same(`${a} + ${b} ${TIMES} ${c}`)],
    );
  };
  const mul3 = () => {
    const [x, y] = one(rng, [[2, 5], [5, 2], [4, 5], [5, 4], [2, 10]]);
    const z = R(rng, 2, 9);
    const order = R(rng, 0, 1);
    const e = order ? `${x} ${TIMES} ${z} ${TIMES} ${y}` : `${z} ${TIMES} ${x} ${TIMES} ${y}`;
    return qNum(
      ctx, id, d,
      L(`Calculate in a smart way: ${e}`, `Вычисли удобным способом: ${e}`, `Ыңғайлы тәсілмен есепте: ${e}`),
      [L(`First multiply ${x} ${TIMES} ${y} = ${x * y}.`, `Сначала перемножим ${x} ${TIMES} ${y} = ${x * y}.`, `Алдымен ${x} ${TIMES} ${y} = ${x * y} көбейтеміз.`), same(`${x * y} ${TIMES} ${z} = ${x * y * z}`)],
      x * y * z, [x + y + z, x * y + z, x * y * z + 10],
      { min: 0 },
    );
  };
  if (d === 1) return anyOf(rng, [swapAdd, swapMul, smart]);
  return anyOf(rng, [group, smart, mul3, swapMul]);
}

// ---------- Скобки и порядок действий (2 класс) ----------

export function order2(ctx, d) {
  const { rng } = ctx;
  const id = 'm.ord2';
  if (d === 1) {
    const a = R(rng, 30, 90);
    const b = R(rng, 5, 25);
    const c = R(rng, 2, 15);
    if (rng() < 0.5) {
      if (b + c >= a) return order2(ctx, d);
      return qNum(ctx, id, d, calc(`${a} ${MINUS} (${b} + ${c})`), [L('Brackets first.', 'Сначала действие в скобках.', 'Алдымен жақшадағы амал.'), same(`${b} + ${c} = ${b + c}, ${a} ${MINUS} ${b + c} = ${a - b - c}`)], a - b - c, [why(a - b + c, L('Do the bracket first, not left to right.', 'Сначала скобки, а не по порядку слева направо.', 'Алдымен жақша, солдан оңға ретімен емес.')), a - b - c + 10, a - b - c - 1], { min: 0 });
    }
    if (b <= c) return order2(ctx, d);
    return qNum(ctx, id, d, calc(`${a} + (${b} ${MINUS} ${c})`), [L('Brackets first.', 'Сначала действие в скобках.', 'Алдымен жақшадағы амал.'), same(`${b} ${MINUS} ${c} = ${b - c}, ${a} + ${b - c} = ${a + b - c}`)], a + b - c, [a + b + c, a - b + c, a + b - c + 1], { min: 0 });
  }
  const k = R(rng, 0, 2);
  const a = one(rng, [2, 3]);
  const b = R(rng, 2, 9);
  const c = R(rng, 3, 30);
  if (k === 0) return qNum(ctx, id, d, calc(`${c} + ${a} ${TIMES} ${b}`), [L('Multiplication comes before addition.', 'Умножение выполняется раньше сложения.', 'Көбейту қосудан бұрын орындалады.'), same(`${a} ${TIMES} ${b} = ${a * b}, ${c} + ${a * b} = ${c + a * b}`)], c + a * b, [why((c + a) * b, L('Multiply first, then add.', 'Сначала умножение, потом сложение.', 'Алдымен көбейту, сосын қосу.')), c + a + b, c + a * b + 1], { min: 0 });
  if (k === 1) {
    const big = a * b + R(rng, 1, 30);
    return qNum(ctx, id, d, calc(`${big} ${MINUS} ${a} ${TIMES} ${b}`), [L('Multiplication comes before subtraction.', 'Умножение выполняется раньше вычитания.', 'Көбейту азайтудан бұрын орындалады.'), same(`${a} ${TIMES} ${b} = ${a * b}, ${big} ${MINUS} ${a * b} = ${big - a * b}`)], big - a * b, [why((big - a) * b, L('Multiply first, then subtract.', 'Сначала умножение, потом вычитание.', 'Алдымен көбейту, сосын азайту.')), big - a - b, big - a * b + 1], { min: 0 });
  }
  const x = R(rng, 1, 5);
  const y = R(rng, 1, 5);
  return qNum(ctx, id, d, calc(`(${x} + ${y}) ${TIMES} ${a}`), [L('Brackets first, then multiply.', 'Сначала скобки, потом умножение.', 'Алдымен жақша, сосын көбейту.'), same(`${x} + ${y} = ${x + y}, ${x + y} ${TIMES} ${a} = ${(x + y) * a}`)], (x + y) * a, [why(x + y * a, L('The bracket must be done first.', 'Сначала нужно выполнить действие в скобках.', 'Алдымен жақшадағы амалды орындау керек.')), (x + y) * a + a, x * y * a], { min: 0 });
}

// ---------- Простые уравнения ----------

export function eq1(ctx, d) {
  const { rng } = ctx;
  const id = 'm.eq1';
  const x = R(rng, 2, d === 1 ? 40 : 60);
  const a = R(rng, 2, d === 1 ? 40 : 35);
  const k = d === 1 ? R(rng, 0, 1) : R(rng, 0, 3);
  const check = (e) => L(`Check: ${e}.`, `Проверка: ${e}.`, `Тексеру: ${e}.`);
  if (k === 0) return qNum(ctx, id, d, solve(`x + ${a} = ${x + a}`), [L('An unknown addend = sum - known addend.', 'Неизвестное слагаемое = сумма - известное слагаемое.', 'Белгісіз қосылғыш = қосынды - белгілі қосылғыш.'), same(`x = ${x + a} ${MINUS} ${a} = ${x}`), check(`${x} + ${a} = ${x + a}`)], x, [why(x + 2 * a, L('To find an addend, subtract, do not add.', 'Чтобы найти слагаемое, вычитают, а не складывают.', 'Қосылғышты табу үшін қоспаймыз, азайтамыз.')), x + 1, x - 1], { min: 0 });
  if (k === 1) return qNum(ctx, id, d, solve(`${a} + x = ${x + a}`), [L('An unknown addend = sum - known addend.', 'Неизвестное слагаемое = сумма - известное слагаемое.', 'Белгісіз қосылғыш = қосынды - белгілі қосылғыш.'), same(`x = ${x + a} ${MINUS} ${a} = ${x}`), check(`${a} + ${x} = ${x + a}`)], x, [x + 2 * a, x + 10, x - 1], { min: 0 });
  if (k === 2) return qNum(ctx, id, d, solve(`x ${MINUS} ${a} = ${x}`), [L('An unknown minuend = difference + subtrahend.', 'Неизвестное уменьшаемое = разность + вычитаемое.', 'Белгісіз азайғыш = айырма + азайтқыш.'), same(`x = ${x} + ${a} = ${x + a}`), check(`${x + a} ${MINUS} ${a} = ${x}`)], x + a, [why(Math.abs(x - a), L('To find the minuend, add the difference and the subtrahend.', 'Чтобы найти уменьшаемое, складывают разность и вычитаемое.', 'Азайғышты табу үшін айырма мен азайтқышты қосамыз.')), x + a + 1, x + a - 10], { min: 0 });
  const big = x + a;
  return qNum(ctx, id, d, solve(`${big} ${MINUS} x = ${a}`), [L('An unknown subtrahend = minuend - difference.', 'Неизвестное вычитаемое = уменьшаемое - разность.', 'Белгісіз азайтқыш = азайғыш - айырма.'), same(`x = ${big} ${MINUS} ${a} = ${x}`), check(`${big} ${MINUS} ${x} = ${a}`)], x, [why(big + a, L('To find the subtrahend, subtract the difference from the minuend.', 'Чтобы найти вычитаемое, из уменьшаемого вычитают разность.', 'Азайтқышты табу үшін азайғыштан айырманы азайтамыз.')), x + 1, x - 1], { min: 0 });
}

// ---------- Единицы длины ----------

const U = {
  mm: ['mm', 'мм', 'мм'],
  cm: ['cm', 'см', 'см'],
  dm: ['dm', 'дм', 'дм'],
  m: ['m', 'м', 'м'],
};

export function units2(ctx, d) {
  const { rng } = ctx;
  const id = 'm.units';
  const RULES = [
    ['dm', 'cm', 10],
    ['m', 'dm', 10],
    ['cm', 'mm', 10],
    ['m', 'cm', 100],
  ];
  const simple = () => {
    const [big, small, k] = one(rng, RULES);
    const v = R(rng, 2, k === 100 ? 9 : 9);
    const toSmall = rng() < 0.6;
    const prompt = toSmall
      ? L(`${v} ${U[big][0]} = ? ${U[small][0]}`, `${v} ${U[big][1]} = ? ${U[small][1]}`, `${v} ${U[big][2]} = ? ${U[small][2]}`)
      : L(`${v * k} ${U[small][0]} = ? ${U[big][0]}`, `${v * k} ${U[small][1]} = ? ${U[big][1]}`, `${v * k} ${U[small][2]} = ? ${U[big][2]}`);
    const rule = L(`1 ${U[big][0]} = ${k} ${U[small][0]}`, `1 ${U[big][1]} = ${k} ${U[small][1]}`, `1 ${U[big][2]} = ${k} ${U[small][2]}`);
    return qNum(
      ctx, id, d, prompt,
      [rule, toSmall ? same(`${v} ${TIMES} ${k} = ${v * k}`) : same(`${v * k} ${DIV} ${k} = ${v}`)],
      toSmall ? v * k : v,
      toSmall ? [why(v, L('Smaller units - the number gets bigger.', 'Единицы мельче - число становится больше.', 'Бірлік кішірейсе - сан үлкейеді.')), v * (k === 10 ? 100 : 10), v + k] : [v * k * 10, v * 10, v + 1],
      { min: 1 },
    );
  };
  const mixed = () => {
    const [big, small, k] = one(rng, RULES.slice(0, 3));
    const a = R(rng, 1, 9);
    const b = R(rng, 1, 9);
    return qNum(
      ctx, id, d,
      L(`${a} ${U[big][0]} ${b} ${U[small][0]} = ? ${U[small][0]}`, `${a} ${U[big][1]} ${b} ${U[small][1]} = ? ${U[small][1]}`, `${a} ${U[big][2]} ${b} ${U[small][2]} = ? ${U[small][2]}`),
      [L(`1 ${U[big][0]} = ${k} ${U[small][0]}`, `1 ${U[big][1]} = ${k} ${U[small][1]}`, `1 ${U[big][2]} = ${k} ${U[small][2]}`), same(`${a} ${TIMES} ${k} + ${b} = ${a * k + b}`)],
      a * k + b, [why(a + b, L('Change the bigger units into smaller ones first.', 'Сначала переведи крупные единицы в мелкие.', 'Алдымен үлкен бірлікті кіші бірлікке айналдыр.')), a * 100 + b, b * k + a],
      { min: 1 },
    );
  };
  const compare = () => {
    const [big, small, k] = one(rng, RULES);
    const a = R(rng, 1, 9);
    const b = a * k + one(rng, [-R(rng, 1, 9), 0, R(rng, 1, 9)]);
    const left = a * k;
    const sign = left > b ? '&gt;' : left < b ? '&lt;' : '=';
    return qText(
      ctx, id, d,
      L(`Compare: ${a} ${U[big][0]} ☐ ${b} ${U[small][0]}`, `Сравни: ${a} ${U[big][1]} ☐ ${b} ${U[small][1]}`, `Салыстыр: ${a} ${U[big][2]} ☐ ${b} ${U[small][2]}`),
      [L(`Change to the same units: ${a} ${U[big][0]} = ${left} ${U[small][0]}.`, `Переведём в одинаковые единицы: ${a} ${U[big][1]} = ${left} ${U[small][1]}.`, `Бірдей бірлікке келтіреміз: ${a} ${U[big][2]} = ${left} ${U[small][2]}.`), same(`${left} ${sign} ${b}`)],
      sign, ['&gt;', '&lt;', '='].filter((s) => s !== sign),
    );
  };
  const mmRuler = () => {
    const a = R(rng, 0, 4) + R(rng, 0, 9) / 10;
    const lenMm = R(rng, 12, 58);
    const b = a + lenMm / 10;
    if (b > 8) return mmRuler();
    return qNum(
      ctx, id, d,
      L('How long is the red segment in millimetres?', 'Какой длины красный отрезок в миллиметрах?', 'Қызыл кесіндінің ұзындығы неше миллиметр?'),
      [L('Small marks are millimetres; 1 cm = 10 mm.', 'Маленькие деления - миллиметры; 1 см = 10 мм.', 'Кішкентай бөліктер - миллиметрлер; 1 см = 10 мм.'), same(`${Math.round(b * 10)} ${MINUS} ${Math.round(a * 10)} = ${lenMm}`)],
      lenMm, [why(Math.round(lenMm / 10), L('That is centimetres. The question asks for millimetres.', 'Это сантиметры, а спрашивают миллиметры.', 'Бұл - сантиметр, ал миллиметр сұралып тұр.')), lenMm + 1, lenMm - 1, lenMm + 10],
      { fig: rulerSvg(a, b, { len: 8, mm: true }), min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [simple, simple, compare]);
  return anyOf(rng, [mixed, compare, mmRuler, simple]);
}

// ---------- Время: час, минута, календарь ----------

export const MONTHS = [
  ['January', 'январь', 'қаңтар', 'января', 'январе', 31],
  ['February', 'февраль', 'ақпан', 'февраля', 'феврале', 28],
  ['March', 'март', 'наурыз', 'марта', 'марте', 31],
  ['April', 'апрель', 'сәуір', 'апреля', 'апреле', 30],
  ['May', 'май', 'мамыр', 'мая', 'мае', 31],
  ['June', 'июнь', 'маусым', 'июня', 'июне', 30],
  ['July', 'июль', 'шілде', 'июля', 'июле', 31],
  ['August', 'август', 'тамыз', 'августа', 'августе', 31],
  ['September', 'сентябрь', 'қыркүйек', 'сентября', 'сентябре', 30],
  ['October', 'октябрь', 'қазан', 'октября', 'октябре', 31],
  ['November', 'ноябрь', 'қараша', 'ноября', 'ноябре', 30],
  ['December', 'декабрь', 'желтоқсан', 'декабря', 'декабре', 31],
];

export function time2(ctx, d) {
  const { rng } = ctx;
  const id = 'm.time2';
  const h = R(rng, 1, 12);
  const clock5 = () => clockQ(ctx, id, d, h, 5 * R(rng, 1, 11));
  const toMin = () => {
    const hh = R(rng, 1, 3);
    const mm = d === 1 ? 0 : 5 * R(rng, 1, 11);
    const v = hh * 60 + mm;
    return qNum(
      ctx, id, d,
      mm ? L(`${hh} h ${mm} min = ? min`, `${hh} ч ${mm} мин = ? мин`, `${hh} сағ ${mm} мин = ? мин`) : L(`${hh} h = ? min`, `${hh} ч = ? мин`, `${hh} сағ = ? мин`),
      [L('1 h = 60 min.', '1 ч = 60 мин.', '1 сағ = 60 мин.'), same(mm ? `${hh} ${TIMES} 60 + ${mm} = ${v}` : `${hh} ${TIMES} 60 = ${v}`)],
      v, [why(hh * 100 + mm, L('An hour has 60 minutes, not 100.', 'В часе 60 минут, а не 100.', 'Бір сағатта 100 емес, 60 минут бар.')), hh + mm, v + 10],
      { min: 1 },
    );
  };
  const endTime = () => {
    const sh = R(rng, 8, 16);
    const sm = 5 * R(rng, 0, 11);
    const dur = 5 * R(rng, 4, 17);
    const end = sh * 60 + sm + dur;
    const e = hm(Math.floor(end / 60), end % 60);
    const wrong = [hm(sh, (sm + dur) % 60), hm(Math.floor(end / 60) + 1, end % 60), hm(sh + Math.floor(dur / 10), sm), hm(Math.floor(end / 60), (end + 10) % 60)];
    return qText(
      ctx, id, d,
      L(`A lesson started at ${hm(sh, sm)} and lasted ${dur} minutes. When did it end?`, `Занятие началось в ${hm(sh, sm)} и длилось ${dur} минут. Когда оно закончилось?`, `Сабақ ${kkAt(sh, sm)} басталып, ${dur} минутқа созылды. Ол қашан аяқталды?`),
      [L(`${sm} + ${dur} = ${sm + dur} min${sm + dur >= 60 ? ` = 1 h ${sm + dur - 60} min` : ''}.`, `${sm} + ${dur} = ${sm + dur} мин${sm + dur >= 60 ? ` = 1 ч ${sm + dur - 60} мин` : ''}.`, `${sm} + ${dur} = ${sm + dur} мин${sm + dur >= 60 ? ` = 1 сағ ${sm + dur - 60} мин` : ''}.`), same(e)],
      same(e), wrong.filter((w) => w !== e).map(same),
    );
  };
  const nextMonth = () => {
    const i = R(rng, 0, 11);
    const j = (i + 1) % 12;
    const m = (x) => L(MONTHS[x][0], MONTHS[x][1], MONTHS[x][2]);
    return qText(
      ctx, id, d,
      L(`Which month comes after ${MONTHS[i][0]}?`, `Какой месяц идёт после ${MONTHS[i][3]}?`, `${MONTHS[i][2]} айынан кейін қай ай келеді?`),
      [L('A year has 12 months: from January to December.', 'В году 12 месяцев: от января до декабря.', 'Жылда 12 ай бар: қаңтардан желтоқсанға дейін.'), m(j)],
      m(j), [m((i + 11) % 12), m((j + 1) % 12), m(i)],
    );
  };
  const daysIn = () => {
    const i = one(rng, [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const v = MONTHS[i][5];
    return qNum(
      ctx, id, d,
      L(`How many days are there in ${MONTHS[i][0]}?`, `Сколько дней в ${MONTHS[i][4]}?`, `${MONTHS[i][2]} айында неше күн бар?`),
      [L('Months have 30 or 31 days (February has 28 or 29). Use your knuckles: a knuckle is 31 days.', 'В месяцах 30 или 31 день (в феврале 28 или 29). Посчитай по косточкам кулака: косточка - 31 день.', 'Айларда 30 немесе 31 күн болады (ақпанда 28 немесе 29). Жұдырықтың буындарымен санауға болады: буын - 31 күн.'), ans(v)],
      v, [v === 31 ? 30 : 31, 28, 7],
      { spr: 0, min: 1 },
    );
  };
  const weeks = () => {
    const w = R(rng, 2, 5);
    const extra = R(rng, 0, 6);
    return qNum(
      ctx, id, d,
      extra ? L(`How many days are in ${w} weeks and ${extra} days?`, `Сколько дней в ${w} неделях и ${extra} днях?`, `${w} апта ${extra} күнде неше күн бар?`) : L(`How many days are in ${w} weeks?`, `Сколько дней в ${w} неделях?`, `${w} аптада неше күн бар?`),
      [L('1 week = 7 days.', '1 неделя = 7 дней.', '1 апта = 7 күн.'), same(extra ? `7 ${TIMES} ${w} + ${extra} = ${7 * w + extra}` : `7 ${TIMES} ${w} = ${7 * w}`)],
      7 * w + extra, [w + extra, 7 * w, 10 * w + extra],
      { min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [clock5, toMin, nextMonth, daysIn]);
  return anyOf(rng, [clock5, toMin, endTime, weeks]);
}

// ---------- Периметр многоугольника ----------

const SHAPES_P = [
  // [точки, число сторон]
  [[40, 140], [220, 140], [120, 30]],
  [[30, 140], [230, 140], [70, 40]],
  [[40, 140], [220, 140], [190, 40], [70, 40]],
  [[30, 130], [210, 150], [230, 50], [60, 30]],
  [[130, 20], [225, 85], [190, 160], [70, 160], [35, 85]],
];

export function perim(ctx, d) {
  const { rng } = ctx;
  const id = 'm.perim';
  const cmL = (v) => String(v);
  const anyPoly = () => {
    const pts = one(rng, d === 1 ? SHAPES_P.slice(0, 4) : SHAPES_P);
    const sides = pts.map(() => R(rng, 2, d === 1 ? 9 : 19));
    const p = sides.reduce((s, x) => s + x, 0);
    return qNum(
      ctx, id, d,
      L('Find the perimeter of the shape (in cm).', 'Найди периметр фигуры (в см).', 'Фигураның периметрін тап (см-мен).'),
      [L('The perimeter is the sum of the lengths of all sides.', 'Периметр - сумма длин всех сторон.', 'Периметр - барлық қабырғалар ұзындықтарының қосындысы.'), same(`${sides.join(' + ')} = ${p}`)],
      p, [p - sides[0], p + sides[0], p + 1, p - 1],
      { fig: polySvg(pts, sides.map(cmL)), min: 1 },
    );
  };
  const rect = () => {
    const a = R(rng, 3, 15);
    let b = R(rng, 2, 12);
    const sq = rng() < 0.3;
    if (sq) b = a;
    const p = 2 * (a + b);
    const fig = polySvg(rectPts(a, b), sq ? [cmL(a)] : [cmL(a), cmL(b)], { right: [0, 1, 2, 3], h: 170 });
    return qNum(
      ctx, id, d,
      sq ? L(`The side of a square is ${a} cm. Find its perimeter.`, `Сторона квадрата ${a} см. Найди его периметр.`, `Шаршының қабырғасы ${a} см. Оның периметрін тап.`) : L(`A rectangle has sides ${a} cm and ${b} cm. Find its perimeter.`, `Стороны прямоугольника ${a} см и ${b} см. Найди его периметр.`, `Тіктөртбұрыштың қабырғалары ${a} см және ${b} см. Оның периметрін тап.`),
      [sq ? L('A square has 4 equal sides.', 'У квадрата 4 равные стороны.', 'Шаршының 4 қабырғасы тең.') : L('Opposite sides of a rectangle are equal.', 'У прямоугольника противоположные стороны равны.', 'Тіктөртбұрыштың қарама-қарсы қабырғалары тең.'), same(sq ? `${a} + ${a} + ${a} + ${a} = ${p}` : `${a} + ${b} + ${a} + ${b} = ${p}`)],
      p, [why(sq ? a * 2 : a + b, L('You added only some of the sides. Add all four.', 'Ты сложил не все стороны. Нужно сложить все четыре.', 'Барлық қабырғаны қоспадың. Төртеуін де қосу керек.')), a * b, p + 2],
      { fig, min: 1 },
    );
  };
  const missing = () => {
    const sides = [R(rng, 3, 12), R(rng, 3, 12), R(rng, 3, 12)];
    const p = sides[0] + sides[1] + sides[2];
    return qNum(
      ctx, id, d,
      L(`The perimeter of a triangle is ${p} cm. Two sides are ${sides[0]} cm and ${sides[1]} cm. Find the third side.`, `Периметр треугольника ${p} см. Две стороны равны ${sides[0]} см и ${sides[1]} см. Найди третью сторону.`, `Үшбұрыштың периметрі ${p} см. Екі қабырғасы ${sides[0]} см және ${sides[1]} см. Үшінші қабырғасын тап.`),
      [L('Subtract the known sides from the perimeter.', 'Из периметра вычтем известные стороны.', 'Периметрден белгілі қабырғаларды азайтамыз.'), same(`${p} ${MINUS} ${sides[0]} ${MINUS} ${sides[1]} = ${sides[2]}`)],
      sides[2], [p + sides[0] + sides[1], p - sides[0], sides[2] + 1],
      { min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [anyPoly, rect]);
  return anyOf(rng, [anyPoly, rect, missing]);
}

// ---------- Прямой угол, прямоугольник и квадрат ----------

export function rightAngle(ctx, d) {
  const { rng } = ctx;
  const id = 'm.rect';
  const T3 = { right: L('right', 'прямой', 'тік'), acute: L('acute', 'острый', 'сүйір'), obtuse: L('obtuse', 'тупой', 'доғал') };
  const angleType = () => {
    const kind = one(rng, ['right', 'right', 'acute', 'obtuse']);
    const deg = kind === 'right' ? 90 : kind === 'acute' ? 5 * R(rng, 5, 15) : 5 * R(rng, 22, 32);
    const rot = R(rng, 0, Math.min(40, 180 - deg));
    return qText(
      ctx, id, d,
      L('What kind of angle is this?', 'Какой это угол?', 'Бұл қандай бұрыш?'),
      [L('Compare it with the corner of a sheet of paper: that is a right angle.', 'Сравни его с уголком листа бумаги - это прямой угол.', 'Оны қағаз парағының бұрышымен салыстыр - ол тік бұрыш.'), kind === 'right' ? L('The sides meet like the corner of the sheet - the angle is right.', 'Стороны сходятся как уголок листа - угол прямой.', 'Қабырғалары парақтың бұрышындай түйіседі - бұрыш тік.') : kind === 'acute' ? L('The angle is smaller than a right angle - it is acute.', 'Угол меньше прямого - он острый.', 'Бұрыш тік бұрыштан кіші - ол сүйір.') : L('The angle is bigger than a right angle - it is obtuse.', 'Угол больше прямого - он тупой.', 'Бұрыш тік бұрыштан үлкен - ол доғал.')],
      T3[kind], Object.keys(T3).filter((k) => k !== kind).map((k) => T3[k]),
      { fig: angleSvg(deg, rot) },
    );
  };
  const countRight = () => {
    const w = R(rng, 110, 190);
    const h = R(rng, 60, 110);
    const s = R(rng, 25, 60);
    const x0 = 30;
    const y0 = 20;
    const kinds = [
      [[[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], 4],
      [[[x0, y0], [x0 + h, y0], [x0 + h, y0 + h], [x0, y0 + h]], 4],
      [[[x0, y0], [x0 + w - s, y0], [x0 + w, y0 + h], [x0, y0 + h]], 2],
      [[[x0 + s, y0], [x0 + w, y0], [x0 + w - s, y0 + h], [x0, y0 + h]], 0],
      [[[x0, y0], [x0 + w, y0 + h], [x0, y0 + h]], 1],
      [[[x0 + w / 2, y0], [x0 + w, y0 + h], [x0, y0 + h]], 0],
      [[[x0, y0 + 40], [x0 + w / 2, y0], [x0 + w, y0 + 40], [x0 + w, y0 + h + 30], [x0, y0 + h + 30]], 2],
    ];
    const [pts, k] = one(rng, kinds);
    return qNum(
      ctx, id, d,
      L('How many right angles does this shape have?', 'Сколько прямых углов у этой фигуры?', 'Бұл фигураның неше тік бұрышы бар?'),
      [L('Check each corner with the corner of a sheet of paper.', 'Проверь каждый угол уголком листа бумаги.', 'Әр бұрышты қағаз парағының бұрышымен тексер.'), ans(k)],
      k, [pts.length, k + 1, k === 0 ? 2 : k - 1, 4].filter((x) => x <= pts.length),
      { fig: polySvg(pts, [], { h: 200 }), spr: 0, min: 0 },
    );
  };
  const rectSides = () => {
    const a = R(rng, 3, 20);
    const b = R(rng, 2, a - 1 || 2);
    const k = R(rng, 0, 1);
    if (k === 0)
      return qNum(
        ctx, id, d,
        L(`The length of a rectangle is ${a} cm and its width is ${b} cm. What is the sum of the lengths of its two longer sides?`, `Длина прямоугольника ${a} см, ширина ${b} см. Чему равна сумма длин двух его длинных сторон?`, `Тіктөртбұрыштың ұзындығы ${a} см, ені ${b} см. Оның екі ұзын қабырғасының ұзындықтарының қосындысы қанша?`),
        [L('Opposite sides of a rectangle are equal: both long sides are ' + a + ' cm.', `У прямоугольника противоположные стороны равны: обе длинные стороны по ${a} см.`, `Тіктөртбұрыштың қарама-қарсы қабырғалары тең: екі ұзын қабырғасы да ${a} см.`), same(`${a} + ${a} = ${2 * a}`)],
        2 * a, [a + b, 2 * b, 2 * (a + b)],
        { min: 1 },
      );
    return qNum(
      ctx, id, d,
      L(`The perimeter of a square is ${4 * a} cm. Find its side.`, `Периметр квадрата ${4 * a} см. Найди его сторону.`, `Шаршының периметрі ${4 * a} см. Оның қабырғасын тап.`),
      [L('A square has 4 equal sides.', 'У квадрата 4 равные стороны.', 'Шаршының 4 қабырғасы тең.'), same(`${4 * a} ${DIV} 4 = ${a}`)],
      a, [2 * a, 4 * a - 4, a + 4],
      { min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [angleType, countRight]);
  return anyOf(rng, [angleType, countRight, rectSides]);
}

// ---------- Задачи в два действия ----------

export function word2(ctx, d) {
  const { rng } = ctx;
  const id = 'm.word2';
  const p = one(rng, NAMES);
  const [p2] = NAMES.filter((x) => x !== p).sort(() => rng() - 0.5);
  const it = one(rng, ITEMS);
  const pl = it[2][2];
  const max = d === 1 ? 50 : 100;
  const kind = R(rng, 0, 3);
  if (kind === 0) {
    const a = R(rng, 10, max - 10);
    const b = R(rng, 2, Math.min(30, max - a));
    const c = R(rng, 2, a + b - 1);
    return qNum(
      ctx, id, d,
      L(`${p[0]} bought ${cnt(a, it).en}, then ${cnt(b, it).en} more, and gave ${c} to friends. How many ${it[1]} are left?`, `${p[1]} ${g(p, 'купил', 'купила')} ${cnt(a, it).ru}, потом ещё ${cnt(b, it).ru}, а ${c} ${g(p, 'раздал', 'раздала')} друзьям. Сколько ${pl} осталось?`, `${p[2]} ${cnt(a, it).kk} сатып алды, сосын тағы ${cnt(b, it).kk} сатып алды, ал ${c}-еуін достарына үлестірді. Неше ${it[3]} қалды?`),
      [L(`1) How many were bought: ${a} + ${b} = ${a + b}.`, `1) Сколько всего купили: ${a} + ${b} = ${a + b}.`, `1) Барлығы неше сатып алынды: ${a} + ${b} = ${a + b}.`), L(`2) How many are left: ${a + b} ${MINUS} ${c} = ${a + b - c}.`, `2) Сколько осталось: ${a + b} ${MINUS} ${c} = ${a + b - c}.`, `2) Неше қалды: ${a + b} ${MINUS} ${c} = ${a + b - c}.`), ans(a + b - c)],
      a + b - c, [why(a + b, L('That is only the first step. Now subtract what was given away.', 'Это только первое действие. Теперь вычти то, что раздали.', 'Бұл - тек бірінші амал. Енді үлестірілгенін азайт.')), a - b - c, a + b + c],
      { min: 0 },
    );
  }
  if (kind === 1) {
    const a = R(rng, 5, Math.floor(max / 2) - 5);
    const k = R(rng, 2, Math.min(20, max - 2 * a));
    const total = a + a + k;
    return qNum(
      ctx, id, d,
      L(`${cnt(a, it).en} were put in the first box and ${k} more in the second. How many ${it[1]} are there in the two boxes?`, `В первую коробку положили ${cnt(a, it).ru}, а во вторую - на ${k} больше. Сколько ${pl} в двух коробках?`, `Бірінші қорапқа ${cnt(a, it).kk} салды, ал екіншісіне одан ${kkDat(k)} артық салды. Екі қорапта барлығы неше ${it[3]} бар?`),
      [L(`1) The second box: ${a} + ${k} = ${a + k}.`, `1) Во второй коробке: ${a} + ${k} = ${a + k}.`, `1) Екінші қорапта: ${a} + ${k} = ${a + k}.`), L(`2) Both boxes: ${a} + ${a + k} = ${total}.`, `2) В двух коробках: ${a} + ${a + k} = ${total}.`, `2) Екі қорапта: ${a} + ${a + k} = ${total}.`), ans(total)],
      total, [why(a + k, L('That is only the second box. Add the first box too.', 'Это только вторая коробка. Прибавь ещё первую.', 'Бұл - тек екінші қорап. Біріншісін де қос.')), a + a - k, total + k],
      { min: 0 },
    );
  }
  if (kind === 2) {
    const a = R(rng, 20, max);
    const b = R(rng, 2, Math.floor(a / 3));
    const c = R(rng, 2, Math.floor(a / 3));
    return qNum(
      ctx, id, d,
      L(`There were ${a} children in the park. ${b} went home, then ${c} more went home. How many children are still in the park?`, `В парке гуляли ${a} детей. ${b} ушли домой, потом ушли ещё ${c}. Сколько детей осталось в парке?`, `Саябақта ${a} бала серуендеп жүрді. ${b} бала үйіне кетті, сосын тағы ${c} бала кетті. Саябақта неше бала қалды?`),
      [L(`1) ${a} ${MINUS} ${b} = ${a - b}.`, `1) ${a} ${MINUS} ${b} = ${a - b}.`, `1) ${a} ${MINUS} ${b} = ${a - b}.`), L(`2) ${a - b} ${MINUS} ${c} = ${a - b - c}.`, `2) ${a - b} ${MINUS} ${c} = ${a - b - c}.`, `2) ${a - b} ${MINUS} ${c} = ${a - b - c}.`), ans(a - b - c)],
      a - b - c, [a - b, a - b + c, a - c],
      { min: 0 },
    );
  }
  const a = R(rng, 10, Math.floor((max + 20) / 2));
  const k = R(rng, Math.max(2, 2 * a - max), Math.min(a - 1, 20));
  const b = a - k;
  return qNum(
    ctx, id, d,
    L(`${p[0]} has ${cnt(a, it).en}, ${p2[0]} has ${k} fewer. How many ${it[1]} do they have together?`, `${p[1]} ${g(p, 'собрал', 'собрала')} ${cnt(a, it).ru}, а ${p2[1]} - на ${k} меньше. Сколько ${pl} они собрали вместе?`, `${p[2]} ${cnt(a, it).kk} жинады, ал ${p2[2]} одан ${kkDat(k)} кем жинады. Олар бірге неше ${it[3]} жинады?`),
    [L(`1) ${p2[0]}: ${a} ${MINUS} ${k} = ${b}.`, `1) ${p2[1]}: ${a} ${MINUS} ${k} = ${b}.`, `1) ${p2[2]}: ${a} ${MINUS} ${k} = ${b}.`), L(`2) Together: ${a} + ${b} = ${a + b}.`, `2) Вместе: ${a} + ${b} = ${a + b}.`, `2) Бірге: ${a} + ${b} = ${a + b}.`), ans(a + b)],
    a + b, [why(b, L('That is only the first step.', 'Это только первое действие.', 'Бұл - тек бірінші амал.')), a + a + k, a + b + 1],
    { min: 0 },
  );
}

// ---------- Деньги: стоимость покупки и сдача ----------

const GOODS = [
  ['a notebook', 'тетрадь', 'дәптер'],
  ['a pen', 'ручка', 'қалам'],
  ['an eraser', 'ластик', 'өшіргіш'],
  ['a ruler', 'линейка', 'сызғыш'],
  ['a bun', 'булочка', 'тоқаш'],
  ['juice', 'сок', 'шырын'],
];

export function change2(ctx, d) {
  const { rng } = ctx;
  const id = 'm.change';
  const [x, y] = two(rng, GOODS);
  const k = R(rng, 0, d === 1 ? 1 : 3);
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  if (k === 0) {
    const a = R(rng, 5, 45);
    const b = R(rng, 5, 45);
    return qNum(
      ctx, id, d,
      L(`${cap(x[0])} costs ${TG(a).en} and ${y[0]} costs ${TG(b).en}. How much do they cost together?`, `${cap(x[1])} стоит ${TG(a).ru}, а ${y[1]} - ${TG(b).ru}. Сколько стоит вся покупка?`, `${cap(x[2])} ${TG(a).kk}, ал ${y[2]} ${TG(b).kk} тұрады. Бүкіл сатып алу қанша тұрады?`),
      [L('The cost of a purchase is the sum of the prices.', 'Стоимость покупки - сумма цен.', 'Сатып алудың құны - бағалардың қосындысы.'), same(`${a} + ${b} = ${a + b}`)],
      a + b, [Math.abs(a - b), a + b + 10, a + b - 1],
      { min: 1 },
    );
  }
  if (k === 1) {
    const paid = one(rng, [50, 100]);
    const a = R(rng, 5, paid === 50 ? 22 : 45);
    const b = R(rng, 5, paid === 50 ? 22 : 45);
    const rest = paid - a - b;
    return qNum(
      ctx, id, d,
      L(`${cap(x[0])} costs ${TG(a).en} and ${y[0]} costs ${TG(b).en}. You pay ${TG(paid).en}. How much change do you get?`, `${cap(x[1])} стоит ${TG(a).ru}, ${y[1]} - ${TG(b).ru}. Ты даёшь ${TG(paid).ru}. Сколько сдачи?`, `${cap(x[2])} ${TG(a).kk}, ${y[2]} ${TG(b).kk} тұрады. Сен ${TG(paid).kk} бересің. Қанша қайтарады?`),
      [L(`1) Cost: ${a} + ${b} = ${a + b}.`, `1) Стоимость: ${a} + ${b} = ${a + b}.`, `1) Құны: ${a} + ${b} = ${a + b}.`), L(`2) Change: ${paid} ${MINUS} ${a + b} = ${rest}.`, `2) Сдача: ${paid} ${MINUS} ${a + b} = ${rest}.`, `2) Қайтарым: ${paid} ${MINUS} ${a + b} = ${rest}.`)],
      rest, [why(a + b, L('That is the cost. The change is what is left from the money you paid.', 'Это стоимость. Сдача - то, что осталось от денег.', 'Бұл - құны. Қайтарым - берген ақшадан қалғаны.')), paid - a, rest + 10],
      { min: 0 },
    );
  }
  if (k === 2) {
    const price = R(rng, 4, 30);
    const m = one(rng, [2, 3]);
    return qNum(
      ctx, id, d,
      L(`${cap(x[0])} costs ${TG(price).en}. How much do ${m} of them cost?`, `${cap(x[1])} стоит ${TG(price).ru}. Сколько нужно заплатить за ${m} штуки?`, `${cap(x[2])} ${TG(price).kk} тұрады. Осындай ${m} дана қанша тұрады?`),
      [L(`Price × quantity = cost.`, 'Цена × количество = стоимость.', 'Баға × саны = құны.'), same(`${price} ${TIMES} ${m} = ${price * m}`)],
      price * m, [why(price + m, L('Multiply the price by the quantity.', 'Цену нужно умножить на количество.', 'Бағаны санына көбейту керек.')), price * (m + 1), price * m + 10],
      { min: 1 },
    );
  }
  const have = 10 * R(rng, 3, 9);
  const price = R(rng, 15, have + 20);
  const enough = have >= price;
  return qText(
    ctx, id, d,
    L(`A child has ${TG(have).en}. ${cap(x[0])} costs ${TG(price).en}. Is the money enough?`, `У ребёнка ${TG(have).ru}. ${cap(x[1])} стоит ${TG(price).ru}. Хватит ли денег?`, `Балада ${TG(have).kk} бар. ${cap(x[2])} ${TG(price).kk} тұрады. Ақша жете ме?`),
    [L(`Compare: ${have} ${have >= price ? '≥' : '<'} ${price}.`, `Сравним: ${have} ${have >= price ? '≥' : '<'} ${price}.`, `Салыстырамыз: ${have} ${have >= price ? '≥' : '<'} ${price}.`), enough ? L(`Yes, and ${have - price} tenge will be left.`, `Да, и останется ${have - price} тенге.`, `Иә, тағы ${have - price} теңге қалады.`) : L(`No, ${price - have} tenge is missing.`, `Нет, не хватает ${price - have} тенге.`, `Жоқ, ${price - have} теңге жетпейді.`)],
    enough ? L(`Yes, ${have - price} tenge will be left`, `Да, останется ${have - price} тенге`, `Иә, ${have - price} теңге қалады`) : L(`No, ${price - have} tenge is missing`, `Нет, не хватает ${price - have} тенге`, `Жоқ, ${price - have} теңге жетпейді`),
    enough
      ? [L(`No, ${have - price + 1} tenge is missing`, `Нет, не хватает ${have - price + 1} тенге`, `Жоқ, ${have - price + 1} теңге жетпейді`), L(`Yes, ${have + price} tenge will be left`, `Да, останется ${have + price} тенге`, `Иә, ${have + price} теңге қалады`), L(`Yes, ${have - price + 10} tenge will be left`, `Да, останется ${have - price + 10} тенге`, `Иә, ${have - price + 10} теңге қалады`)]
      : [L(`Yes, ${price - have} tenge will be left`, `Да, останется ${price - have} тенге`, `Иә, ${price - have} теңге қалады`), L(`No, ${price + have} tenge is missing`, `Нет, не хватает ${price + have} тенге`, `Жоқ, ${price + have} теңге жетпейді`), L(`No, ${price - have + 10} tenge is missing`, `Нет, не хватает ${price - have + 10} тенге`, `Жоқ, ${price - have + 10} теңге жетпейді`)],
  );
}
