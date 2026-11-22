// Математика 5 класса: координатный луч, округление, степени, свойства действий, уравнения,
// формулы, смешанные числа, округление десятичных дробей, виды треугольников, простые числа.

import { L, dec, n, same, why } from '../gen.js';
import { DIV, MINUS, R, TIMES, anyOf, kkDat, lineSvg, one, qNum, qText, triangleSvg } from './kit.js';

const calc = (e) => L(`Calculate: ${e}`, `Вычисли: ${e}`, `Есепте: ${e}`);
const solve = (e) => L(`Solve the equation: ${e}`, `Реши уравнение: ${e}`, `Теңдеуді шеш: ${e}`);
const ans = (v) => L(`Answer: ${v}.`, `Ответ: ${v}.`, `Жауабы: ${v}.`);
const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
const mixed = (w, a, b) => (a === 0 ? String(w) : w ? `${w}\u2009${fr(a, b)}` : fr(a, b));
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// ---------- Координатный луч и шкалы ----------

export function ray(ctx, d) {
  const { rng } = ctx;
  const id = 'm.ray';
  const step = one(rng, d === 1 ? [1, 2, 5, 10] : d === 2 ? [2, 5, 10, 20, 25, 50] : [25, 50, 100, 200, 500]);
  const from = 0;
  const count = 10;
  const k = R(rng, 1, count - 1);
  const v = from + k * step;
  const kind = R(rng, 0, 2);
  if (kind === 0)
    return qNum(
      ctx, id, d,
      L('Find the coordinate of point A.', 'Найди координату точки A.', 'A нүктесінің координатасын тап.'),
      [L(`One division is ${n(step)} (from 0 to the first mark).`, `Цена деления - ${n(step)} (от 0 до первого штриха).`, `Бір бөліктің құны - ${n(step)} (0-ден бірінші сызықшаға дейін).`), same(`${k} ${TIMES} ${n(step)} = ${n(v)}`)],
      v, [why(k, L('Count divisions and multiply by the value of one division.', 'Посчитай деления и умножь на цену деления.', 'Бөліктерді санап, бір бөліктің құнына көбейт.')), v + step, v - step],
      { fig: lineSvg(from, step, count, { A: v }), min: 0 },
    );
  if (kind === 1) {
    let k2 = R(rng, 1, count - 1);
    while (k2 === k) k2 = R(rng, 1, count - 1);
    const dist = Math.abs(k2 - k) * step;
    return qNum(
      ctx, id, d,
      L('Find the distance between points A and B (in unit segments).', 'Найди расстояние между точками A и B (в единичных отрезках).', 'A және B нүктелерінің арақашықтығын тап (бірлік кесінділермен).'),
      [L(`A = ${n(v)}, B = ${n(k2 * step)}.`, `A = ${n(v)}, B = ${n(k2 * step)}.`, `A = ${n(v)}, B = ${n(k2 * step)}.`), same(`${n(Math.max(v, k2 * step))} ${MINUS} ${n(Math.min(v, k2 * step))} = ${n(dist)}`)],
      dist, [Math.abs(k2 - k), v + k2 * step, dist + step],
      { fig: lineSvg(from, step, count, { A: v, B: k2 * step }), min: 0 },
    );
  }
  const m = one(rng, [2, 4, 5, 10]);
  const total = step * m;
  return qNum(
    ctx, id, d,
    L(`On a scale, the distance from 0 to ${n(total)} is divided into ${m} equal parts. What is one division worth?`, `На шкале промежуток от 0 до ${n(total)} разделён на ${m} равных частей. Чему равна цена деления?`, `Шкалада 0-ден ${n(total)}-ге дейінгі аралық ${m} тең бөлікке бөлінген. Бір бөліктің құны қанша?`),
    [L('Value of a division = length of the interval : number of parts.', 'Цена деления = длина промежутка : число частей.', 'Бөлік құны = аралық ұзындығы : бөліктер саны.'), same(`${n(total)} ${DIV} ${m} = ${n(step)}`)],
    step, [why(total - m, L('Divide, do not subtract.', 'Нужно делить, а не вычитать.', 'Азайтпай, бөлу керек.')), m, step * 2],
    { min: 0 },
  );
}

// ---------- Округление натуральных чисел ----------

const ROUND_TO = [
  [10, L('ten', 'десятков', 'ондыққа')],
  [100, L('hundred', 'сотен', 'жүздікке')],
  [1000, L('thousand', 'тысяч', 'мыңдыққа')],
];

export function roundNat(ctx, d) {
  const { rng } = ctx;
  const id = 'm.round';
  const [p, name] = d === 1 ? one(rng, ROUND_TO.slice(0, 2)) : one(rng, ROUND_TO);
  const x = R(rng, p * 2, d === 3 ? 999999 : d === 2 ? 99999 : 9999);
  const down = Math.floor(x / p) * p;
  const rest = Math.floor((x % p) / (p / 10));
  const r = rest >= 5 ? down + p : down;
  if (x % p === 0) return roundNat(ctx, d);
  return qNum(
    ctx, id, d,
    L(`Round ${n(x)} to the nearest ${name.en}.`, `Округли число ${n(x)} до ${name.ru}.`, `${n(x)} санын ${name.kk} дейін дөңгелекте.`),
    [L(`Look at the digit right after the place: ${rest}. ${rest >= 5 ? '5 or more - round up.' : 'Less than 5 - round down.'}`, `Смотрим на следующую цифру: ${rest}. ${rest >= 5 ? '5 и больше - увеличиваем разряд на 1.' : 'Меньше 5 - разряд не меняем.'}`, `Келесі цифрға қараймыз: ${rest}. ${rest >= 5 ? '5 немесе одан көп - разрядты 1-ге арттырамыз.' : '5-тен кем - разряд өзгермейді.'}`), same(`${n(x)} ≈ ${n(r)}`)],
    r, [why(rest >= 5 ? down : down + p, rest >= 5 ? L('The next digit is 5 or more, so round up.', 'Следующая цифра 5 или больше - округляем с избытком.', 'Келесі цифр 5 немесе одан көп - артығымен дөңгелектейміз.') : L('The next digit is less than 5, so round down.', 'Следующая цифра меньше 5 - округляем с недостатком.', 'Келесі цифр 5-тен кем - кемімен дөңгелектейміз.')), r + p, Math.round(x / (p / 10)) * (p / 10) === r ? r - p : Math.round(x / (p / 10)) * (p / 10)],
    { min: 0, display: String(r) },
  );
}

// ---------- Степень: квадрат и куб ----------

export function sqCube(ctx, d) {
  const { rng } = ctx;
  const id = 'm.sqcube';
  const sup = (b, e) => `${b}<sup>${e}</sup>`;
  const k = R(rng, 0, 3);
  if (k === 0) {
    const b = R(rng, 2, d === 1 ? 20 : 25);
    return qNum(ctx, id, d, calc(sup(b, 2)), [L(`A square is the number times itself.`, `Квадрат числа - это число, умноженное само на себя.`, `Санның квадраты - санның өзіне-өзі көбейтіндісі.`), same(`${b} ${TIMES} ${b} = ${b * b}`)], b * b, [why(2 * b, L('A power is repeated multiplication, not multiplication by 2.', 'Степень - это повторное умножение, а не умножение на 2.', 'Дәреже - 2-ге көбейту емес, қайталап көбейту.')), b * b + b, b + 2], { min: 0 });
  }
  if (k === 1) {
    const b = R(rng, 1, d === 1 ? 6 : 10);
    return qNum(ctx, id, d, calc(sup(b, 3)), [L('A cube is the number taken as a factor three times.', 'Куб числа - число, взятое множителем три раза.', 'Санның кубы - үш рет көбейткіш ретінде алынған сан.'), same(`${b} ${TIMES} ${b} ${TIMES} ${b} = ${b ** 3}`)], b ** 3, [why(3 * b, L('A cube is b × b × b, not 3 × b.', 'Куб - это b × b × b, а не 3 × b.', 'Куб - b × b × b, 3 × b емес.')), b * b, b ** 3 + b], { min: 0 });
  }
  if (k === 2) {
    const b = one(rng, [2, 3, 5, 10]);
    const e = b === 2 ? R(rng, 4, 8) : b === 10 ? R(rng, 3, 6) : R(rng, 2, 4);
    return qNum(ctx, id, d, calc(sup(b, e)), [L(`Multiply ${b} by itself ${e} times.`, `Умножим ${b} само на себя ${e} раз(а).`, `${b} санын өзіне ${e} рет көбейтеміз.`), same(`${Array(e).fill(b).join(` ${TIMES} `)} = ${n(b ** e)}`)], b ** e, [b * e, b ** (e - 1), b ** (e + 1)], { min: 0, display: String(b ** e) });
  }
  const a = R(rng, 2, 9);
  const b = R(rng, 2, 9);
  const plus = rng() < 0.5;
  const v = plus ? a * a + b * b : Math.abs(a * a - b * b);
  const [x, y] = plus || a >= b ? [a, b] : [b, a];
  return qNum(ctx, id, d, calc(`${sup(x, 2)} ${plus ? '+' : MINUS} ${sup(y, 2)}`), [L('Powers first, then add or subtract.', 'Сначала степени, потом сложение или вычитание.', 'Алдымен дәрежелер, сосын қосу не азайту.'), same(`${x * x} ${plus ? '+' : MINUS} ${y * y} = ${v}`)], v, [why(plus ? (x + y) ** 2 : (x - y) ** 2, L('You cannot add (subtract) first and then square.', 'Нельзя сначала сложить (вычесть), а потом возвести в квадрат.', 'Алдымен қосып (азайтып), сосын квадраттауға болмайды.')), plus ? 2 * (x + y) : 2 * (x - y), v + 1], { min: 0 });
}

// ---------- Свойства сложения и умножения ----------

export function props(ctx, d) {
  const { rng } = ctx;
  const id = 'm.props';
  const k = R(rng, 0, d === 1 ? 2 : 4);
  if (k === 0) {
    const [p, q] = one(rng, [[25, 4], [4, 25], [5, 2], [2, 50], [20, 5], [125, 8], [50, 4]]);
    const m = R(rng, 3, 99);
    const order = R(rng, 0, 1);
    const e = order ? `${p} ${TIMES} ${m} ${TIMES} ${q}` : `${m} ${TIMES} ${p} ${TIMES} ${q}`;
    return qNum(ctx, id, d, L(`Calculate in a smart way: ${e}`, `Вычисли удобным способом: ${e}`, `Ыңғайлы тәсілмен есепте: ${e}`), [L(`Group ${p} ${TIMES} ${q} = ${p * q} first.`, `Сгруппируем ${p} ${TIMES} ${q} = ${p * q}.`, `Алдымен ${p} ${TIMES} ${q} = ${p * q} топтаймыз.`), same(`${p * q} ${TIMES} ${m} = ${n(p * q * m)}`)], p * q * m, [p * q + m, p * q * m + p * q, m * (p + q)], { min: 0, display: String(p * q * m) });
  }
  if (k === 1) {
    const m = R(rng, 12, 99);
    const a = R(rng, 2, 98);
    const c = 100 - a;
    const plus = rng() < 0.5;
    if (plus) return qNum(ctx, id, d, L(`Calculate in a smart way: ${m} ${TIMES} ${a} + ${m} ${TIMES} ${c}`, `Вычисли удобным способом: ${m} ${TIMES} ${a} + ${m} ${TIMES} ${c}`, `Ыңғайлы тәсілмен есепте: ${m} ${TIMES} ${a} + ${m} ${TIMES} ${c}`), [L('Take the common factor out: m × a + m × c = m × (a + c).', 'Вынесем общий множитель: m × a + m × c = m × (a + c).', 'Ортақ көбейткішті жақша сыртына шығарамыз: m × a + m × c = m × (a + c).'), same(`${m} ${TIMES} (${a} + ${c}) = ${m} ${TIMES} ${a + c} = ${n(m * (a + c))}`)], m * (a + c), [m + a + c, m * (a + c) + m, m * a + c], { min: 0, display: String(m * (a + c)) });
    const big = a + c + R(rng, 1, 9) * 10;
    const small = big - (a + c);
    return qNum(ctx, id, d, L(`Calculate in a smart way: ${m} ${TIMES} ${big} ${MINUS} ${m} ${TIMES} ${small}`, `Вычисли удобным способом: ${m} ${TIMES} ${big} ${MINUS} ${m} ${TIMES} ${small}`, `Ыңғайлы тәсілмен есепте: ${m} ${TIMES} ${big} ${MINUS} ${m} ${TIMES} ${small}`), [L('Take the common factor out.', 'Вынесем общий множитель за скобки.', 'Ортақ көбейткішті жақша сыртына шығарамыз.'), same(`${m} ${TIMES} (${big} ${MINUS} ${small}) = ${m} ${TIMES} ${big - small} = ${n(m * (big - small))}`)], m * (big - small), [m * (big + small), m * (big - small) + m, big - small], { min: 0, display: String(m * (big - small)) });
  }
  if (k === 2) {
    const a = R(rng, 101, 899);
    const c = 100 - (a % 100) || 100;
    const b = R(rng, 11, 299);
    return qNum(ctx, id, d, L(`Calculate in a smart way: ${a} + ${b} + ${c}`, `Вычисли удобным способом: ${a} + ${b} + ${c}`, `Ыңғайлы тәсілмен есепте: ${a} + ${b} + ${c}`), [L(`${a} + ${c} = ${a + c} - a round number.`, `${a} + ${c} = ${a + c} - круглое число.`, `${a} + ${c} = ${a + c} - дөңгелек сан.`), same(`${a + c} + ${b} = ${a + b + c}`)], a + b + c, [a + b + c + 10, a + b + c - 100, a + b + c + 1], { min: 0 });
  }
  const v = one(rng, ['a', 'x', 'y', 'b', 'm']);
  const p = R(rng, 2, 19);
  const q = R(rng, 2, 19);
  const plus = k === 3 || p <= q;
  if (plus || p === q) return qText(ctx, id, d, L(`Simplify: ${p}${v} + ${q}${v}`, `Упрости выражение: ${p}${v} + ${q}${v}`, `Өрнекті ықшамда: ${p}${v} + ${q}${v}`), [L(`Distributive law: ${p}${v} + ${q}${v} = (${p} + ${q})${v}.`, `Распределительный закон: ${p}${v} + ${q}${v} = (${p} + ${q})${v}.`, `Үлестірімділік заңы: ${p}${v} + ${q}${v} = (${p} + ${q})${v}.`), same(`${p + q}${v}`)], same(`${p + q}${v}`), [same(`${p * q}${v}`), same(`${p + q}${v}<sup>2</sup>`), same(`${p + q + 1}${v}`), same(`${p * q}${v}<sup>2</sup>`)]);
  return qText(ctx, id, d, L(`Simplify: ${p}${v} ${MINUS} ${q}${v}`, `Упрости выражение: ${p}${v} ${MINUS} ${q}${v}`, `Өрнекті ықшамда: ${p}${v} ${MINUS} ${q}${v}`), [L(`${p}${v} ${MINUS} ${q}${v} = (${p} ${MINUS} ${q})${v}.`, `${p}${v} ${MINUS} ${q}${v} = (${p} ${MINUS} ${q})${v}.`, `${p}${v} ${MINUS} ${q}${v} = (${p} ${MINUS} ${q})${v}.`), same(`${p - q === 1 ? '' : p - q}${v}`)], same(`${p - q === 1 ? '' : p - q}${v}`), [same(`${p + q}${v}`), same(`${p - q}`), same(`${p * q}${v}`), same(`${p - q + 1}${v}`)]);
}

// ---------- Уравнения (5 класс) ----------

export function eq5(ctx, d) {
  const { rng } = ctx;
  const id = 'm.eq5';
  const x = R(rng, 3, d === 1 ? 40 : 120);
  const k = R(rng, 0, d === 1 ? 1 : 3);
  if (k === 0) {
    const a = R(rng, 5, 60);
    const b = R(rng, 2, Math.min(a + x - 1, 50));
    return qNum(ctx, id, d, solve(`(x + ${a}) ${MINUS} ${b} = ${x + a - b}`), [L(`The bracket is the minuend: x + ${a} = ${x + a - b} + ${b} = ${x + a}.`, `Скобка - уменьшаемое: x + ${a} = ${x + a - b} + ${b} = ${x + a}.`, `Жақша - азайғыш: x + ${a} = ${x + a - b} + ${b} = ${x + a}.`), same(`x = ${x + a} ${MINUS} ${a} = ${x}`)], x, [x + 2 * a, x - b > 0 ? x - b : x + b, x + 1], { min: 0 });
  }
  if (k === 1) {
    const a = R(rng, 2, 9);
    const b = R(rng, 2, 9);
    const xx = R(rng, 2, d === 1 ? 15 : 40);
    return qNum(ctx, id, d, solve(`${a}x + ${b}x = ${(a + b) * xx}`), [L(`Combine: ${a}x + ${b}x = ${a + b}x.`, `Приведём: ${a}x + ${b}x = ${a + b}x.`, `Біріктіреміз: ${a}x + ${b}x = ${a + b}x.`), same(`x = ${(a + b) * xx} ${DIV} ${a + b} = ${xx}`)], xx, [why((a + b) * xx - a - b, L('The coefficients are multiplied by x: divide, do not subtract.', 'Коэффициенты умножены на x: нужно делить, а не вычитать.', 'Коэффициенттер x-ке көбейтілген: азайтпай, бөлу керек.')), xx + 1, a * b * xx], { min: 0 });
  }
  if (k === 2) {
    const a = R(rng, 5, 15);
    const b = R(rng, 2, a - 1);
    const xx = R(rng, 3, 40);
    return qNum(ctx, id, d, solve(`${a}x ${MINUS} ${b}x = ${(a - b) * xx}`), [L(`${a}x ${MINUS} ${b}x = ${a - b}x.`, `${a}x ${MINUS} ${b}x = ${a - b}x.`, `${a}x ${MINUS} ${b}x = ${a - b}x.`), same(`x = ${(a - b) * xx} ${DIV} ${a - b} = ${xx}`)], xx, [Math.round(((a - b) * xx) / (a + b)) || xx + 2, xx + 1, (a - b) * xx], { min: 0 });
  }
  const a = R(rng, 100, 900);
  return qNum(ctx, id, d, solve(`${a + x} ${MINUS} x = ${a}`), [L('Unknown subtrahend = minuend - difference.', 'Неизвестное вычитаемое = уменьшаемое - разность.', 'Белгісіз азайтқыш = азайғыш - айырма.'), same(`x = ${a + x} ${MINUS} ${a} = ${x}`)], x, [2 * a + x, x + 10, x - 1], { min: 0 });
}

// ---------- Формулы ----------

export function formula(ctx, d) {
  const { rng } = ctx;
  const id = 'm.formula';
  const a = R(rng, 2, 20);
  const b = R(rng, 2, 15);
  const c = R(rng, 2, 10);
  const k = R(rng, 0, d === 1 ? 2 : 5);
  const F = (s) => `<i>${s}</i>`;
  if (k === 0) return qNum(ctx, id, d, L(`Use the formula ${F('S')} = ${F('a')}${F('b')}: find ${F('S')} if ${F('a')} = ${a}, ${F('b')} = ${b}.`, `По формуле ${F('S')} = ${F('a')}${F('b')} найди ${F('S')}, если ${F('a')} = ${a}, ${F('b')} = ${b}.`, `${F('S')} = ${F('a')}${F('b')} формуласы бойынша ${F('a')} = ${a}, ${F('b')} = ${b} болса, ${F('S')}-ті тап.`), [same(`${F('S')} = ${a} ${TIMES} ${b} = ${a * b}`)], a * b, [a + b, 2 * (a + b), a * b + a], { min: 0 });
  if (k === 1) return qNum(ctx, id, d, L(`Use the formula ${F('P')} = 2(${F('a')} + ${F('b')}): find ${F('P')} if ${F('a')} = ${a}, ${F('b')} = ${b}.`, `По формуле ${F('P')} = 2(${F('a')} + ${F('b')}) найди ${F('P')}, если ${F('a')} = ${a}, ${F('b')} = ${b}.`, `${F('P')} = 2(${F('a')} + ${F('b')}) формуласы бойынша ${F('a')} = ${a}, ${F('b')} = ${b} болса, ${F('P')}-ні тап.`), [same(`${F('P')} = 2 ${TIMES} (${a} + ${b}) = 2 ${TIMES} ${a + b} = ${2 * (a + b)}`)], 2 * (a + b), [why(2 * a + b, L('Brackets first: multiply the whole sum by 2.', 'Сначала скобки: на 2 умножается вся сумма.', 'Алдымен жақша: 2-ге бүкіл қосынды көбейтіледі.')), a * b, a + b], { min: 0 });
  if (k === 2) return qNum(ctx, id, d, L(`Use the formula ${F('V')} = ${F('abc')}: find ${F('V')} if ${F('a')} = ${a}, ${F('b')} = ${b}, ${F('c')} = ${c}.`, `По формуле ${F('V')} = ${F('abc')} найди ${F('V')}, если ${F('a')} = ${a}, ${F('b')} = ${b}, ${F('c')} = ${c}.`, `${F('V')} = ${F('abc')} формуласы бойынша ${F('a')} = ${a}, ${F('b')} = ${b}, ${F('c')} = ${c} болса, ${F('V')}-ні тап.`), [same(`${F('V')} = ${a} ${TIMES} ${b} ${TIMES} ${c} = ${a * b * c}`)], a * b * c, [a + b + c, a * b, a * b * c + c], { min: 0 });
  if (k === 3) return qNum(ctx, id, d, L(`The area of a rectangle is ${F('S')} = ${a * b} cm², its side ${F('b')} = ${b} cm. Use ${F('S')} = ${F('a')}${F('b')} to find ${F('a')}.`, `Площадь прямоугольника ${F('S')} = ${a * b} см², сторона ${F('b')} = ${b} см. По формуле ${F('S')} = ${F('a')}${F('b')} найди ${F('a')}.`, `Тіктөртбұрыштың ауданы ${F('S')} = ${a * b} см², қабырғасы ${F('b')} = ${b} см. ${F('S')} = ${F('a')}${F('b')} формуласы бойынша ${F('a')}-ны тап.`), [same(`${F('a')} = ${F('S')} : ${F('b')} = ${a * b} ${DIV} ${b} = ${a}`)], a, [a * b - b, a * b * b, a + 1], { min: 0 });
  if (k === 4) return qNum(ctx, id, d, L(`The volume of a box is ${F('V')} = ${a * b * c} cm³, the base area is ${F('S')} = ${a * b} cm². Use ${F('V')} = ${F('S')}${F('h')} to find the height ${F('h')}.`, `Объём параллелепипеда ${F('V')} = ${a * b * c} см³, площадь основания ${F('S')} = ${a * b} см². По формуле ${F('V')} = ${F('S')}${F('h')} найди высоту ${F('h')}.`, `Параллелепипедтің көлемі ${F('V')} = ${a * b * c} см³, табанының ауданы ${F('S')} = ${a * b} см². ${F('V')} = ${F('S')}${F('h')} формуласы бойынша ${F('h')} биіктігін тап.`), [same(`${F('h')} = ${a * b * c} ${DIV} ${a * b} = ${c}`)], c, [a * b * c - a * b, c + 1, a * b], { min: 0 });
  const v = 5 * R(rng, 2, 18);
  return qNum(ctx, id, d, L(`Use the formula ${F('s')} = ${F('vt')}: find ${F('t')} if ${F('s')} = ${v * c} km, ${F('v')} = ${v} km/h.`, `По формуле ${F('s')} = ${F('vt')} найди ${F('t')}, если ${F('s')} = ${v * c} км, ${F('v')} = ${v} км/ч.`, `${F('s')} = ${F('vt')} формуласы бойынша ${F('s')} = ${v * c} км, ${F('v')} = ${v} км/сағ болса, ${F('t')}-ны тап.`), [same(`${F('t')} = ${F('s')} : ${F('v')} = ${v * c} ${DIV} ${v} = ${c}`)], c, [v * c - v, c + 1, v], { min: 0 });
}

// ---------- Смешанные числа ----------

export function mixedNum(ctx, d) {
  const { rng } = ctx;
  const id = 'm.mixed';
  const b = R(rng, 2, d === 1 ? 9 : 12);
  const w = R(rng, 1, d === 1 ? 5 : 9);
  let a = R(rng, 1, b - 1);
  const k = R(rng, 0, d === 1 ? 1 : 3);
  if (k === 0) {
    const top = w * b + a;
    return qText(
      ctx, id, d,
      L(`Write the improper fraction ${fr(top, b)} as a mixed number.`, `Выдели целую часть из дроби ${fr(top, b)}.`, `${fr(top, b)} бөлшегінің бүтін бөлігін бөліп шығар.`),
      [L('Divide the numerator by the denominator: the quotient is the whole part, the remainder is the new numerator.', 'Делим числитель на знаменатель: частное - целая часть, остаток - числитель.', 'Алымды бөлімге бөлеміз: бөлінді - бүтін бөлігі, қалдық - алымы.'), same(`${top} ${DIV} ${b} = ${w} (${a}) → ${mixed(w, a, b)}`)],
      same(mixed(w, a, b)), [same(mixed(a, w < b ? w : 1, b)), same(mixed(w + 1, a, b)), same(mixed(w, b - a, b)), same(mixed(w, a, top))],
    );
  }
  if (k === 1) {
    const top = w * b + a;
    return qText(
      ctx, id, d,
      L(`Write ${mixed(w, a, b)} as an improper fraction.`, `Запиши смешанное число ${mixed(w, a, b)} в виде неправильной дроби.`, `${mixed(w, a, b)} аралас санын бұрыс бөлшек түрінде жаз.`),
      [L('Multiply the whole part by the denominator and add the numerator.', 'Целую часть умножаем на знаменатель и прибавляем числитель.', 'Бүтін бөлігін бөлімге көбейтіп, алымды қосамыз.'), same(`${w} ${TIMES} ${b} + ${a} = ${top} → ${fr(top, b)}`)],
      same(fr(top, b)), [same(fr(w + a, b)), same(fr(w * a + b, b)), same(fr(top, w * b)), same(fr(top + 1, b))],
    );
  }
  // Сложение и вычитание смешанных чисел с одинаковыми знаменателями.
  const w2 = R(rng, 1, w + 2);
  let a2 = R(rng, 1, b - 1);
  if (k === 2) {
    let sw = w + w2;
    let sa = a + a2;
    const carry = sa >= b;
    if (carry) (sw += 1), (sa -= b);
    const res = mixed(sw, sa, b);
    return qText(
      ctx, id, d,
      calc(`${mixed(w, a, b)} + ${mixed(w2, a2, b)}`),
      [L('Add the whole parts and the fractional parts separately.', 'Складываем отдельно целые и дробные части.', 'Бүтін бөліктерін және бөлшек бөліктерін бөлек қосамыз.'), same(`${w} + ${w2} = ${w + w2}, ${fr(a, b)} + ${fr(a2, b)} = ${fr(a + a2, b)}${carry ? ` = 1${sa ? fr(sa, b) : ''}` : ''}`), same(res)],
      same(res), [same(mixed(w + w2, a + a2, b + b)), same(mixed(w + w2, (a + a2) % b || 1, b)), same(mixed(sw + 1, sa, b)), same(mixed(sw, sa + 1 < b ? sa + 1 : 1, b))],
    );
  }
  // Вычитание: первое число больше второго.
  let [W1, A1, W2, A2] = [w + w2, a, w2, a2];
  let borrow = A1 < A2;
  const rw = borrow ? W1 - 1 - W2 : W1 - W2;
  const ra = borrow ? A1 + b - A2 : A1 - A2;
  const res = mixed(rw, ra, b);
  return qText(
    ctx, id, d,
    calc(`${mixed(W1, A1, b)} ${MINUS} ${mixed(W2, A2, b)}`),
    [borrow ? L(`${fr(A1, b)} is less than ${fr(A2, b)}: borrow 1 = ${fr(b, b)} from the whole part.`, `${fr(A1, b)} меньше ${fr(A2, b)}: занимаем 1 = ${fr(b, b)} у целой части.`, `${fr(A1, b)} саны ${fr(A2, b)}-ден кіші: бүтін бөліктен 1 = ${fr(b, b)} аламыз.`) : L('Subtract the whole parts and the fractional parts separately.', 'Вычитаем отдельно целые и дробные части.', 'Бүтін және бөлшек бөліктерін бөлек азайтамыз.'), same(res)],
    same(res), [same(mixed(W1 - W2, Math.abs(A1 - A2) || 1, b)), same(mixed(rw + 1, ra, b)), same(mixed(rw, ra === b - 1 ? 1 : ra + 1, b)), same(mixed(rw, ra, b + 1))],
  );
}

// ---------- Округление десятичных дробей ----------

const DPL = [
  [1, L('whole number', 'целых', 'бүтінге')],
  [0.1, L('tenths', 'десятых', 'ондықтарға')],
  [0.01, L('hundredths', 'сотых', 'жүздіктерге')],
];

export function roundDec(ctx, d) {
  const { rng } = ctx;
  const id = 'm.rounddec';
  const [p, name] = d === 1 ? one(rng, DPL.slice(0, 2)) : one(rng, DPL);
  const digits = p === 1 ? 2 : p === 0.1 ? 3 : 3;
  const x = R(rng, 10 ** digits + 1, 10 ** digits * 99) / 10 ** digits;
  const scale = Math.round(1 / p);
  const rnd = (v) => Math.round(v * 1e6) / 1e6;
  const r = rnd(Math.round(x * scale + 1e-9) / scale);
  const down = rnd(Math.floor(x * scale + 1e-9) / scale);
  if (rnd(x) === down) return roundDec(ctx, d);
  const nextDigit = Math.floor(rnd(x * scale * 10)) % 10;
  return qNum(
    ctx, id, d,
    L(`Round ${dec(x).en} to ${name.en === 'whole number' ? 'a whole number' : name.en}.`, `Округли ${dec(x).ru} до ${name.ru}.`, `${dec(x).kk} санын ${name.kk} дейін дөңгелекте.`),
    [L(`The next digit is ${nextDigit}: ${nextDigit >= 5 ? 'round up' : 'round down'}; drop the digits after it.`, `Следующая цифра ${nextDigit}: ${nextDigit >= 5 ? 'увеличиваем на 1' : 'оставляем как есть'}; остальные цифры отбрасываем.`, `Келесі цифр ${nextDigit}: ${nextDigit >= 5 ? '1-ге арттырамыз' : 'өзгертпейміз'}; қалған цифрларды алып тастаймыз.`), loc((l) => `${dec(x)[l]} ≈ ${dec(r)[l]}`)],
    r, [why(r === down ? rnd(down + p) : down, L('Check the next digit: 5 or more - round up, less - round down.', 'Смотри на следующую цифру: 5 и больше - с избытком, меньше - с недостатком.', 'Келесі цифрға қара: 5 және одан көп - артығымен, кем болса - кемімен.')), rnd(r + p * 10), rnd(Math.round(x * scale * 10) / (scale * 10)) === r ? rnd(r - p) : rnd(Math.round(x * scale * 10) / (scale * 10))],
    { fmt: dec, min: 0, display: String(r) },
  );
}
const loc = (fn) => L(fn('en'), fn('ru'), fn('kk'));

// ---------- Виды треугольников ----------

export function triKinds(ctx, d) {
  const { rng } = ctx;
  const id = 'm.tri';
  const byAngles = () => {
    const kind = R(rng, 0, 2);
    let A;
    let B;
    if (kind === 1) {
      A = 90;
      B = 5 * R(rng, 4, 14);
    } else if (kind === 2) {
      A = 5 * R(rng, 20, 28);
      B = 5 * R(rng, 3, (175 - A) / 5 - 2 > 3 ? Math.min(10, (175 - A) / 5 - 2) : 4);
    } else {
      A = 5 * R(rng, 9, 17);
      B = 5 * R(rng, Math.max(9, 19 - A / 5), 17);
      if (180 - A - B >= 90) return byAngles();
    }
    const C = 180 - A - B;
    const swap = rng() < 0.5;
    const [x, y] = swap ? [B, A] : [A, B];
    const T = [L('acute', 'остроугольный', 'сүйірбұрышты'), L('right', 'прямоугольный', 'тікбұрышты'), L('obtuse', 'тупоугольный', 'доғалбұрышты')];
    return qText(
      ctx, id, d,
      L(`A triangle has angles ${x}°, ${y}° and ${C}°. What kind of triangle is it?`, `Углы треугольника равны ${x}°, ${y}° и ${C}°. Какой это треугольник?`, `Үшбұрыштың бұрыштары ${x}°, ${y}° және ${C}°. Бұл қандай үшбұрыш?`),
      [L('All angles less than 90° - acute; one angle 90° - right; one angle more than 90° - obtuse.', 'Все углы меньше 90° - остроугольный; есть угол 90° - прямоугольный; есть угол больше 90° - тупоугольный.', 'Барлық бұрыштары 90°-тан кіші - сүйірбұрышты; 90° бұрышы бар - тікбұрышты; 90°-тан үлкен бұрышы бар - доғалбұрышты.'), T[kind]],
      T[kind], [...T.filter((_, i) => i !== kind), L('isosceles', 'равнобедренный', 'теңбүйірлі')],
      { fig: triangleSvg(x, y) },
    );
  };
  const bySides = () => {
    const kind = R(rng, 0, 2);
    const a = R(rng, 4, 15);
    let s;
    if (kind === 0) s = [a, a, a];
    else if (kind === 1) {
      let b = R(rng, Math.ceil(a / 2) + 1, 2 * a - 1);
      if (b === a) b += 1;
      s = rng() < 0.5 ? [a, a, b] : [b, a, a];
    } else {
      const b = a + R(rng, 1, 4);
      const c = b + R(rng, 1, Math.min(4, a - 1));
      s = [a, b, c];
    }
    const T = [L('equilateral', 'равносторонний', 'теңқабырғалы'), L('isosceles (not equilateral)', 'равнобедренный (не равносторонний)', 'теңбүйірлі (теңқабырғалы емес)'), L('scalene', 'разносторонний', 'әртүрлі қабырғалы')];
    return qText(
      ctx, id, d,
      L(`The sides of a triangle are ${s[0]} cm, ${s[1]} cm and ${s[2]} cm. What kind of triangle is it?`, `Стороны треугольника ${s[0]} см, ${s[1]} см и ${s[2]} см. Какой это треугольник?`, `Үшбұрыштың қабырғалары ${s[0]} см, ${s[1]} см және ${s[2]} см. Бұл қандай үшбұрыш?`),
      [L('All sides equal - equilateral; two sides equal - isosceles; all sides different - scalene.', 'Все стороны равны - равносторонний; две стороны равны - равнобедренный; все разные - разносторонний.', 'Барлық қабырғалары тең - теңқабырғалы; екі қабырғасы тең - теңбүйірлі; бәрі әртүрлі - әртүрлі қабырғалы.'), T[kind]],
      T[kind], [...T.filter((_, i) => i !== kind), L('right', 'прямоугольный', 'тікбұрышты')],
    );
  };
  const perimEq = () => {
    const a = R(rng, 3, 25);
    const iso = rng() < 0.5;
    const b = R(rng, 2, 2 * a - 1);
    const p = iso ? 2 * a + b : 3 * a;
    return qNum(
      ctx, id, d,
      iso ? L(`An isosceles triangle has equal sides of ${a} cm and a base of ${b} cm. Find its perimeter.`, `Боковые стороны равнобедренного треугольника по ${a} см, основание ${b} см. Найди периметр.`, `Теңбүйірлі үшбұрыштың бүйір қабырғалары ${a} см-ден, табаны ${b} см. Периметрін тап.`) : L(`The side of an equilateral triangle is ${a} cm. Find its perimeter.`, `Сторона равностороннего треугольника ${a} см. Найди периметр.`, `Теңқабырғалы үшбұрыштың қабырғасы ${a} см. Периметрін тап.`),
      [iso ? L('Two sides are equal.', 'Две боковые стороны равны.', 'Екі бүйір қабырғасы тең.') : L('All three sides are equal.', 'Все три стороны равны.', 'Үш қабырғасы да тең.'), same(iso ? `${a} + ${a} + ${b} = ${p}` : `3 ${TIMES} ${a} = ${p}`)],
      p, [iso ? a + b : 2 * a, p + a, p - 1],
      { min: 1 },
    );
  };
  const third = () => {
    const A = 5 * R(rng, 6, 20);
    const B = 5 * R(rng, 4, Math.min(20, (175 - A) / 5 - 1));
    const C = 180 - A - B;
    return qNum(
      ctx, id, d,
      L(`Two angles of a triangle are ${A}° and ${B}°. Find the third angle.`, `Два угла треугольника равны ${A}° и ${B}°. Найди третий угол.`, `Үшбұрыштың екі бұрышы ${A}° және ${B}°. Үшінші бұрышын тап.`),
      [L('The angles of a triangle add up to 180°.', 'Сумма углов треугольника равна 180°.', 'Үшбұрыш бұрыштарының қосындысы 180°.'), same(`180° ${MINUS} ${A}° ${MINUS} ${B}° = ${C}°`)],
      C, [why(360 - A - B, L('The sum is 180°, not 360°.', 'Сумма углов 180°, а не 360°.', 'Қосынды 360° емес, 180°.')), C + 10, A + B],
      { fig: triangleSvg(A, B, { labels: false }), min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [byAngles, bySides, perimEq]);
  return anyOf(rng, [byAngles, bySides, third, perimEq]);
}

// ---------- Простые и составные числа ----------

const isPrime = (x) => {
  if (x < 2) return false;
  for (let i = 2; i * i <= x; i++) if (x % i === 0) return false;
  return true;
};
const factors = (x) => {
  const out = [];
  for (let p = 2; x > 1; p++) while (x % p === 0) out.push(p), (x /= p);
  return out;
};

export function primes(ctx, d) {
  const { rng } = ctx;
  const id = 'm.prime';
  const max = d === 1 ? 50 : d === 2 ? 100 : 200;
  const whichPrime = () => {
    const ps = [];
    for (let i = 2; i <= max; i++) if (isPrime(i)) ps.push(i);
    const comps = [];
    for (let i = 4; i <= max; i++) if (!isPrime(i) && (i % 2 || i > 10)) comps.push(i);
    const p = one(rng, ps.filter((x) => x > 10 || d === 1));
    const wrong = [];
    while (wrong.length < 3) {
      const c = one(rng, comps.filter((x) => x % 2 === 1 || x % 10 !== 0));
      if (!wrong.includes(c)) wrong.push(c);
    }
    const f = (c) => `${c} = ${factors(c).join(' · ')}`;
    return qText(
      ctx, id, d,
      L('Which of these numbers is prime?', 'Какое из чисел простое?', 'Бұл сандардың қайсысы жай сан?'),
      [L('A prime number has exactly two divisors: 1 and itself.', 'У простого числа ровно два делителя: 1 и само число.', 'Жай санның дәл екі бөлгіші бар: 1 және санның өзі.'), same(wrong.map(f).join('; ')), L(`${p} divides only by 1 and ${p}.`, `${p} делится только на 1 и на ${p}.`, `${p} тек 1-ге және ${p} санына бөлінеді.`)],
      same(String(p)), wrong.map((x) => same(String(x))),
    );
  };
  const factorize = () => {
    let x;
    do x = R(rng, 12, max * (d === 3 ? 4 : 2));
    while (isPrime(x) || factors(x).length < 3);
    const fs = factors(x);
    const fmt = (arr) => arr.join(' · ');
    const w1 = [...fs.slice(0, -2), fs.at(-2) * fs.at(-1)];
    const w2 = [...fs.slice(1), fs[0] * 1 + (fs[0] === 2 ? 1 : 2)].sort((a, b) => a - b);
    const w3 = fs.length > 2 ? fs.slice(1) : [...fs, 2];
    return qText(
      ctx, id, d,
      L(`Factorise ${x} into prime factors.`, `Разложи число ${x} на простые множители.`, `${x} санын жай көбейткіштерге жікте.`),
      [L('Divide by the smallest prime numbers (2, 3, 5, 7 ...) while it divides.', 'Делим на наименьшие простые числа (2, 3, 5, 7 ...), пока делится.', 'Бөлінгенше ең кіші жай сандарға (2, 3, 5, 7 ...) бөлеміз.'), same(`${x} = ${fmt(fs)}`)],
      same(fmt(fs)), [same(fmt(w1)), same(fmt(w2)), same(fmt(w3))],
    );
  };
  const isP = () => {
    const x = R(rng, 11, max);
    const p = isPrime(x);
    const f = factors(x);
    return qText(
      ctx, id, d,
      L(`Is ${x} a prime or a composite number?`, `Число ${x} простое или составное?`, `${x} саны жай ма, әлде құрама ма?`),
      [p ? L(`${x} has no divisors except 1 and itself.`, `У ${x} нет делителей, кроме 1 и самого числа.`, `${x} санының 1 мен өзінен басқа бөлгіші жоқ.`) : L(`${x} = ${f.join(' · ')}, so it has other divisors.`, `${x} = ${f.join(' · ')}, значит, есть и другие делители.`, `${x} = ${f.join(' · ')}, демек басқа бөлгіштері де бар.`)],
      p ? L('prime', 'простое', 'жай') : L('composite', 'составное', 'құрама'),
      [p ? L('composite', 'составное', 'құрама') : L('prime', 'простое', 'жай'), L('neither prime nor composite', 'ни простое, ни составное', 'жай да, құрама да емес')],
    );
  };
  const smallest = () => {
    let x;
    do x = R(rng, 20, max * 2);
    while (isPrime(x));
    const f = factors(x);
    return qNum(
      ctx, id, d,
      L(`Find the largest prime divisor of ${x}.`, `Найди наибольший простой делитель числа ${x}.`, `${x} санының ең үлкен жай бөлгішін тап.`),
      [L('Factorise the number.', 'Разложим число на простые множители.', 'Санды жай көбейткіштерге жіктейміз.'), same(`${x} = ${f.join(' · ')}`)],
      f.at(-1), [f[0], x, x / f[0]].filter((v) => v !== f.at(-1)),
      { min: 1, spr: 0.4 },
    );
  };
  if (d === 1) return anyOf(rng, [whichPrime, isP, factorize]);
  return anyOf(rng, [whichPrime, isP, factorize, smallest]);
}
