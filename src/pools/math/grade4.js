// Математика 4 класса: многозначные числа, письменные вычисления, скорость и движение,
// часть числа, единицы массы и площади, объём, уравнения, диаграммы, закономерности, римские цифры.

import { L, n, same, why } from '../gen.js';
import { DIV, MINUS, R, TIMES, anyOf, barsSvg, boxSvg, kkDat, one, qNum, qText, ru, two } from './kit.js';
import { column } from './grade2.js';

const calc = (e) => L(`Calculate: ${e}`, `Вычисли: ${e}`, `Есепте: ${e}`);
const solve = (e) => L(`Solve the equation: ${e}`, `Реши уравнение: ${e}`, `Теңдеуді шеш: ${e}`);
const ans = (v) => L(`Answer: ${v}.`, `Ответ: ${v}.`, `Жауабы: ${v}.`);
const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

// ---------- Многозначные числа ----------

const PLACES = [
  [L('ones', 'единиц', 'бірліктер'), 1],
  [L('tens', 'десятков', 'ондықтар'), 10],
  [L('hundreds', 'сотен', 'жүздіктер'), 100],
  [L('thousands', 'единиц тысяч', 'мыңдар'), 1000],
  [L('ten thousands', 'десятков тысяч', 'он мыңдықтар'), 10000],
  [L('hundred thousands', 'сотен тысяч', 'жүз мыңдықтар'), 100000],
  [L('millions', 'единиц миллионов', 'миллиондар'), 1000000],
];

export function bigNum(ctx, d) {
  const { rng } = ctx;
  const id = 'm.bignum';
  const digits = d === 1 ? R(rng, 5, 6) : R(rng, 6, 7);
  let x = R(rng, 10 ** (digits - 1), 10 ** digits - 1);
  if (rng() < 0.4) x = Math.floor(x / 1000) * 1000 + R(rng, 0, 99); // нули в середине
  const digitAt = () => {
    const i = R(rng, 1, digits - 1);
    const [name, p] = PLACES[i];
    const v = Math.floor(x / p) % 10;
    return qNum(
      ctx, id, d,
      L(`Which digit is in the ${name.en} place of ${n(x)}?`, `Какая цифра стоит в разряде ${name.ru} числа ${n(x)}?`, `${n(x)} санының ${name.kk} разрядында қай цифр тұр?`),
      [L('Count the places from the right: ones, tens, hundreds, thousands, ten thousands, hundred thousands, millions.', 'Считаем разряды справа: единицы, десятки, сотни, тысячи, десятки тысяч, сотни тысяч, миллионы.', 'Разрядтарды оңнан санаймыз: бірліктер, ондықтар, жүздіктер, мыңдар, он мыңдықтар, жүз мыңдықтар, миллиондар.'), ans(v)],
      v, [Math.floor(x / (p * 10)) % 10, Math.floor(x / (p / 10 || 1)) % 10, (v + 1) % 10, (v + 5) % 10],
      { spr: 0, min: 0 },
    );
  };
  const thousands = () => {
    const v = Math.floor(x / 1000);
    return qNum(
      ctx, id, d,
      L(`How many whole thousands are there in ${n(x)}?`, `Сколько всего тысяч в числе ${n(x)}?`, `${n(x)} санында барлығы неше мың бар?`),
      [L('Drop the last three digits (the class of units).', 'Отбросим три последние цифры (класс единиц).', 'Соңғы үш цифрды (бірліктер класын) алып тастаймыз.'), ans(n(v))],
      v, [v % 10, Math.floor(x / 100), Math.floor(v / 10), v + 1],
      { min: 0 },
    );
  };
  const write = () => {
    const m = d === 1 ? 0 : R(rng, 1, 9);
    const th = R(rng, 1, 999);
    const u = R(rng, 1, 999);
    const v = m * 1e6 + th * 1000 + u;
    const words = (l) => {
      const parts = [];
      if (m) parts.push(l === 'en' ? `${m} million` : l === 'ru' ? `${m} млн` : `${m} млн`);
      parts.push(l === 'en' ? `${th} thousand` : l === 'ru' ? `${th} тыс.` : `${th} мың`);
      parts.push(String(u));
      return parts.join(' ');
    };
    const wrongA = m * 1e6 + th * 100 + u;
    const wrongB = Number(`${m || ''}${th}${u}`);
    return qNum(
      ctx, id, d,
      L(`Write the number in digits: ${words('en')}.`, `Запиши число цифрами: ${words('ru')}.`, `Санды цифрмен жаз: ${words('kk')}.`),
      [L('Each class has three digits; fill empty places with zeros.', 'В каждом классе по три цифры; пустые разряды заполняем нулями.', 'Әр класта үш цифр бар; бос разрядтарды нөлмен толтырамыз.'), ans(n(v))],
      v, [why(wrongB, L('Each class must have exactly three digits - add zeros.', 'В каждом классе должно быть ровно три цифры - допиши нули.', 'Әр класта дәл үш цифр болуы керек - нөл қос.')), wrongA, v + 1000, v * 10],
      { min: 0, display: String(v) },
    );
  };
  const cmp = () => {
    const y = x + one(rng, [-1000, 1000, -10000, 10000, -100, 100, 9000, -9000]);
    const sign = x > y ? '&gt;' : '&lt;';
    return qText(
      ctx, id, d,
      L(`Which sign goes in the box: ${n(x)} ☐ ${n(y)}`, `Какой знак поставить в окошко: ${n(x)} ☐ ${n(y)}`, `Терезеге қай таңбаны қою керек: ${n(x)} ☐ ${n(y)}`),
      [L('Compare from the highest place.', 'Сравниваем с высшего разряда.', 'Жоғары разрядтан бастап салыстырамыз.'), same(`${n(x)} ${sign} ${n(y)}`)],
      sign, ['&gt;', '&lt;', '='].filter((s) => s !== sign),
    );
  };
  const times = () => {
    const k = one(rng, [10, 100, 1000]);
    const base = R(rng, 12, 999) * (rng() < 0.5 ? 1 : 10);
    const up = rng() < 0.5;
    const a = up ? base : base * k;
    const v = up ? base * k : base;
    return qNum(
      ctx, id, d,
      calc(up ? `${n(a)} ${TIMES} ${k}` : `${n(a)} ${DIV} ${k}`),
      [up ? L(`Multiplying by ${k} adds ${String(k).length - 1} zero(s).`, `При умножении на ${k} справа приписываем ${String(k).length - 1} нул${k === 10 ? 'ь' : 'я'}.`, `${kkDat(k)} көбейткенде оң жағына ${String(k).length - 1} нөл жазамыз.`) : L(`Dividing by ${k} removes ${String(k).length - 1} zero(s).`, `При делении на ${k} отбрасываем ${String(k).length - 1} нул${k === 10 ? 'ь' : 'я'}.`, `${kkDat(k)} бөлгенде ${String(k).length - 1} нөлді алып тастаймыз.`), same(`${n(v)}`)],
      v, up ? [v * 10, v / 10, a + k] : [v * 10, Math.round(v / 10), a - k].filter(Number.isInteger),
      { min: 0, display: String(v) },
    );
  };
  if (d === 1) return anyOf(rng, [digitAt, thousands, write, cmp]);
  return anyOf(rng, [digitAt, write, cmp, times, thousands]);
}

// ---------- Сложение и вычитание многозначных чисел ----------

export const addBig = (ctx, d) => column(ctx, d, 'm.addbig', d + 3, true);

// ---------- Умножение и деление на двузначное и трёхзначное число ----------

export function mul2d(ctx, d) {
  const { rng } = ctx;
  const id = 'm.mul2d';
  const b = d === 3 ? R(rng, 102, 409) : R(rng, 12, 89);
  const a = d === 1 ? R(rng, 12, 98) : R(rng, 102, 899);
  const mul = rng() < 0.5;
  if (mul) {
    const p = a * b;
    const bt = Math.floor(b / 10) * 10;
    const bo = b % 10;
    return qNum(
      ctx, id, d,
      L(`Multiply in a column: ${a} ${TIMES} ${b}`, `Умножь столбиком: ${a} ${TIMES} ${b}`, `Бағанмен көбейт: ${a} ${TIMES} ${b}`),
      [L('Multiply by each digit of the second factor; shift each partial product one place left; add them.', 'Умножаем на каждую цифру второго множителя; каждое неполное произведение сдвигаем на разряд влево; складываем.', 'Екінші көбейткіштің әр цифрына көбейтеміз; әр толымсыз көбейтіндіні бір разряд солға жылжытамыз; қосамыз.'), b < 100 ? same(`${a} ${TIMES} ${bo} = ${n(a * bo)}, ${a} ${TIMES} ${bt} = ${n(a * bt)}, ${n(a * bo)} + ${n(a * bt)} = ${n(p)}`) : same(`${a} ${TIMES} ${b} = ${n(p)}`)],
      p, [why(a * bo + a * Math.floor(b / 10), L('The second partial product must be shifted one place left (it is tens).', 'Второе неполное произведение нужно сдвинуть на разряд влево (это десятки).', 'Екінші толымсыз көбейтіндіні бір разряд солға жылжыту керек (бұл ондықтар).')), p + a, p - 10 * a, p + 100],
      { min: 0, display: String(p) },
    );
  }
  const q = d === 1 ? R(rng, 12, 99) : R(rng, 21, 409);
  const p = q * b;
  return qNum(
    ctx, id, d,
    calc(`${n(p)} ${DIV} ${b}`),
    [L(`Estimate each digit of the quotient and check by multiplying: ${b} ${TIMES} ${q} = ${n(p)}.`, `Подбираем каждую цифру частного и проверяем умножением: ${b} ${TIMES} ${q} = ${n(p)}.`, `Бөліндінің әр цифрын таңдап, көбейтумен тексереміз: ${b} ${TIMES} ${q} = ${n(p)}.`), ans(q)],
    q, [q + 1, q - 1, q * 10, q + 10, why(Number(String(q).replace(/0/g, '')) || q + 2, L('Do not lose a zero in the quotient.', 'Не потеряй ноль в частном.', 'Бөліндідегі нөлді жоғалтпа.'))],
    { min: 1 },
  );
}

// ---------- Скорость, время, расстояние ----------

const VEH = [
  // [en, ru, kk, скорость от, до, единица, ru: «движется», «прошёл», «пройдёт», «он/она»]
  ['A cyclist', 'Велосипедист', 'Велосипедші', 10, 20, 'kmh', ['едет', 'проехал', 'проедет', 'он']],
  ['A car', 'Автомобиль', 'Автокөлік', 50, 95, 'kmh', ['едет', 'проехал', 'проедет', 'он']],
  ['A train', 'Поезд', 'Пойыз', 60, 120, 'kmh', ['идёт', 'прошёл', 'пройдёт', 'он']],
  ['A pedestrian', 'Пешеход', 'Жаяу жүргінші', 3, 6, 'kmh', ['идёт', 'прошёл', 'пройдёт', 'он']],
  ['A snail', 'Улитка', 'Ұлу', 2, 9, 'mmin', ['ползёт', 'проползла', 'проползёт', 'она']],
  ['A boy', 'Мальчик', 'Бала', 50, 90, 'mmin', ['идёт', 'прошёл', 'пройдёт', 'он']],
];
const UNITS = {
  kmh: { v: L('km/h', 'км/ч', 'км/сағ'), s: L('km', 'км', 'км'), t: L('h', 'ч', 'сағ') },
  mmin: { v: L('m/min', 'м/мин', 'м/мин'), s: L('m', 'м', 'м'), t: L('min', 'мин', 'мин') },
};
const q3 = (v, u) => L(`${n(v)} ${u.en}`, `${n(v)} ${u.ru}`, `${n(v)} ${u.kk}`);

export function speed(ctx, d) {
  const { rng } = ctx;
  const id = 'm.speed';
  const [en, ruN, kk, lo, hi, uk, vb] = one(rng, VEH);
  const U = UNITS[uk];
  const v = R(rng, lo, hi);
  const t = R(rng, 2, d === 1 ? 5 : 9);
  const s = v * t;
  const k = R(rng, 0, 2);
  if (k === 0)
    return qNum(ctx, id, d, L(`${en} moves at ${q3(v, U.v).en} for ${q3(t, U.t).en}. What distance does it cover?`, `${ruN} ${vb[0]} со скоростью ${q3(v, U.v).ru}. Какое расстояние ${vb[3]} ${vb[2]} за ${q3(t, U.t).ru}?`, `${kk} ${q3(v, U.v).kk} жылдамдықпен ${q3(t, U.t).kk} жүрді. Ол қанша қашықтық жүрді?`), [L('Distance = speed × time.', 'Расстояние = скорость × время.', 'Қашықтық = жылдамдық × уақыт.'), same(`${v} ${TIMES} ${t} = ${n(s)}`)], s, [why(v + t, L('Multiply speed by time.', 'Скорость нужно умножить на время.', 'Жылдамдықты уақытқа көбейту керек.')), s + v, s - v], { min: 1 });
  if (k === 1)
    return qNum(ctx, id, d, L(`${en} covered ${q3(s, U.s).en} in ${q3(t, U.t).en}. Find its speed.`, `${ruN} ${vb[1]} ${q3(s, U.s).ru} за ${q3(t, U.t).ru}. Найди скорость.`, `${kk} ${q3(t, U.t).kk} ішінде ${q3(s, U.s).kk} жүрді. Жылдамдығын тап.`), [L('Speed = distance : time.', 'Скорость = расстояние : время.', 'Жылдамдық = қашықтық : уақыт.'), same(`${n(s)} ${DIV} ${t} = ${v}`)], v, [why(s - t, L('Divide the distance by the time.', 'Расстояние нужно разделить на время.', 'Қашықтықты уақытқа бөлу керек.')), v + t, v * 10], { min: 1 });
  return qNum(ctx, id, d, L(`${en} moves at ${q3(v, U.v).en}. How long will it take to cover ${q3(s, U.s).en}?`, `${ruN} ${vb[0]} со скоростью ${q3(v, U.v).ru}. За какое время ${vb[3]} ${vb[2]} ${q3(s, U.s).ru}?`, `${kk} ${q3(v, U.v).kk} жылдамдықпен жүреді. Ол ${q3(s, U.s).kk} қашықтықты қанша уақытта жүреді?`), [L('Time = distance : speed.', 'Время = расстояние : скорость.', 'Уақыт = қашықтық : жылдамдық.'), same(`${n(s)} ${DIV} ${v} = ${t}`)], t, [why(s - v, L('Divide the distance by the speed.', 'Расстояние нужно разделить на скорость.', 'Қашықтықты жылдамдыққа бөлу керек.')), t + 1, v], { min: 1 });
}

// ---------- Движение навстречу и вдогонку ----------

export function motion4(ctx, d) {
  const { rng } = ctx;
  const id = 'm.motion4';
  const [a, b] = two(rng, [40, 45, 50, 55, 60, 65, 70, 75, 80, 90]);
  const t = R(rng, 2, 6);
  const kmh = (x) => L(`${x} km/h`, `${x} км/ч`, `${x} км/сағ`);
  const toward = () => {
    const s = (a + b) * t;
    if (rng() < 0.5)
      return qNum(ctx, id, d, L(`Two cars left two towns towards each other at the same time, at ${kmh(a).en} and ${kmh(b).en}. They met after ${t} h. Find the distance between the towns.`, `Из двух городов одновременно навстречу друг другу выехали две машины со скоростями ${kmh(a).ru} и ${kmh(b).ru}. Они встретились через ${t} ч. Найди расстояние между городами.`, `Екі қаладан бір мезгілде бір-біріне қарсы екі көлік шықты, жылдамдықтары ${kmh(a).kk} және ${kmh(b).kk}. Олар ${t} сағаттан кейін кездесті. Қалалардың арақашықтығын тап.`), [L(`Closing speed: ${a} + ${b} = ${a + b} km/h.`, `Скорость сближения: ${a} + ${b} = ${a + b} км/ч.`, `Жақындасу жылдамдығы: ${a} + ${b} = ${a + b} км/сағ.`), same(`${a + b} ${TIMES} ${t} = ${s}`)], s, [why(Math.abs(a - b) * t, L('Moving towards each other, the speeds add up.', 'При движении навстречу скорости складываются.', 'Қарсы қозғалғанда жылдамдықтар қосылады.')), (a + b) * (t + 1), a * t], { min: 1 });
    return qNum(ctx, id, d, L(`The distance between two towns is ${s} km. Two cars left them towards each other at ${kmh(a).en} and ${kmh(b).en}. In how many hours will they meet?`, `Расстояние между городами ${s} км. Из них навстречу друг другу выехали две машины со скоростями ${kmh(a).ru} и ${kmh(b).ru}. Через сколько часов они встретятся?`, `Қалалардың арақашықтығы ${s} км. Олардан бір-біріне қарсы ${kmh(a).kk} және ${kmh(b).kk} жылдамдықпен екі көлік шықты. Олар неше сағаттан кейін кездеседі?`), [L(`Closing speed: ${a} + ${b} = ${a + b} km/h.`, `Скорость сближения: ${a} + ${b} = ${a + b} км/ч.`, `Жақындасу жылдамдығы: ${a} + ${b} = ${a + b} км/сағ.`), same(`${s} ${DIV} ${a + b} = ${t}`)], t, [t + 1, t - 1, t * 2], { min: 1 });
  };
  const apart = () => {
    const s = (a + b) * t;
    return qNum(ctx, id, d, L(`Two cyclists left the same place in opposite directions at ${kmh(a / 5).en} and ${kmh(b / 5).en}. How far apart will they be after ${t} h?`, `Два велосипедиста выехали из одного места в противоположных направлениях со скоростями ${kmh(a / 5).ru} и ${kmh(b / 5).ru}. Какое расстояние будет между ними через ${t} ч?`, `Екі велосипедші бір жерден қарама-қарсы бағытта ${kmh(a / 5).kk} және ${kmh(b / 5).kk} жылдамдықпен шықты. ${t} сағаттан кейін олардың арақашықтығы қанша болады?`), [L(`They move apart at ${a / 5} + ${b / 5} = ${(a + b) / 5} km/h.`, `Скорость удаления: ${a / 5} + ${b / 5} = ${(a + b) / 5} км/ч.`, `Алыстау жылдамдығы: ${a / 5} + ${b / 5} = ${(a + b) / 5} км/сағ.`), same(`${(a + b) / 5} ${TIMES} ${t} = ${s / 5}`)], s / 5, [Math.abs(a - b) / 5 * t, s / 5 + (a + b) / 5, (a / 5) * t], { min: 1 });
  };
  const chase = () => {
    const [fast, slow] = [Math.max(a, b), Math.min(a, b)];
    const gap = (fast - slow) * t;
    return qNum(ctx, id, d, L(`A truck left at ${kmh(slow).en}. Later a car followed it at ${kmh(fast).en}. When the car started, the truck was ${gap} km ahead. In how many hours will the car catch up?`, `Грузовик едет со скоростью ${kmh(slow).ru}. За ним выехала машина со скоростью ${kmh(fast).ru}. В момент выезда машины грузовик был впереди на ${gap} км. Через сколько часов машина догонит грузовик?`, `Жүк көлігі ${kmh(slow).kk} жылдамдықпен келе жатыр. Оның артынан ${kmh(fast).kk} жылдамдықпен жеңіл көлік шықты. Сол сәтте жүк көлігі ${gap} км алда болды. Жеңіл көлік оны неше сағаттан кейін қуып жетеді?`), [L(`Catch-up speed: ${fast} ${MINUS} ${slow} = ${fast - slow} km/h.`, `Скорость сближения: ${fast} ${MINUS} ${slow} = ${fast - slow} км/ч.`, `Жақындасу жылдамдығы: ${fast} ${MINUS} ${slow} = ${fast - slow} км/сағ.`), same(`${gap} ${DIV} ${fast - slow} = ${t}`)], t, [why(Math.round((gap / (fast + slow)) * 100) / 100, L('When catching up, subtract the speeds.', 'При движении вдогонку скорости вычитают.', 'Қуып жеткенде жылдамдықтарды азайтады.')), t + 1, t * 2], { min: 1 });
  };
  const second = () => {
    const s = (a + b) * t;
    return qNum(ctx, id, d, L(`Two trains left two stations ${s} km apart towards each other and met after ${t} h. One went at ${kmh(a).en}. Find the speed of the other.`, `Два поезда вышли навстречу друг другу со станций, расстояние между которыми ${s} км, и встретились через ${t} ч. Скорость одного - ${kmh(a).ru}. Найди скорость другого.`, `Арақашықтығы ${s} км екі бекеттен бір-біріне қарсы екі пойыз шығып, ${t} сағаттан кейін кездесті. Біреуінің жылдамдығы ${kmh(a).kk}. Екіншісінің жылдамдығын тап.`), [L(`Closing speed: ${s} ${DIV} ${t} = ${a + b} km/h.`, `Скорость сближения: ${s} ${DIV} ${t} = ${a + b} км/ч.`, `Жақындасу жылдамдығы: ${s} ${DIV} ${t} = ${a + b} км/сағ.`), same(`${a + b} ${MINUS} ${a} = ${b}`)], b, [why(a + b, L('That is the closing speed. Subtract the known speed.', 'Это скорость сближения. Вычти известную скорость.', 'Бұл - жақындасу жылдамдығы. Белгілі жылдамдықты азайт.')), s / t + a, b + 5], { min: 1 });
  };
  if (d === 1) return anyOf(rng, [toward, apart]);
  return anyOf(rng, [toward, chase, second, apart]);
}

// ---------- Нахождение части числа и числа по части ----------

export function partOf(ctx, d) {
  const { rng } = ctx;
  const id = 'm.partof';
  const den = one(rng, [3, 4, 5, 6, 8, 10]);
  let num = R(rng, 1, den - 1);
  while (d >= 2 && num === 1) num = R(rng, 1, den - 1);
  const unit = R(rng, 2, d === 1 ? 12 : 30);
  const whole = den * unit;
  const part = num * unit;
  const k = R(rng, 0, d === 1 ? 1 : 3);
  if (k === 0 || (d === 1 && num === 1))
    return qNum(
      ctx, id, d,
      L(`Find ${fr(num, den)} of ${whole}.`, `Найди ${fr(num, den)} от числа ${whole}.`, `${whole} санының ${fr(num, den)} бөлігін тап.`),
      [L(`Divide by the denominator, multiply by the numerator.`, `Делим на знаменатель, умножаем на числитель.`, `Бөлімге бөліп, алымға көбейтеміз.`), same(`${whole} ${DIV} ${den} ${TIMES} ${num} = ${unit} ${TIMES} ${num} = ${part}`)],
      part, [why(unit, L('That is only one part. Multiply by the numerator.', 'Это только одна доля. Умножь на числитель.', 'Бұл - тек бір үлес. Алымға көбейт.')), whole * num, part + unit],
      { min: 1 },
    );
  if (k === 1)
    return qNum(
      ctx, id, d,
      L(`${fr(num, den)} of a number is ${part}. Find the number.`, `${fr(num, den)} числа равны ${part}. Найди число.`, `Санның ${fr(num, den)} бөлігі ${kkDat(part)} тең. Санды тап.`),
      [L(`Divide by the numerator, multiply by the denominator.`, `Делим на числитель, умножаем на знаменатель.`, `Алымға бөліп, бөлімге көбейтеміз.`), same(`${part} ${DIV} ${num} ${TIMES} ${den} = ${unit} ${TIMES} ${den} = ${whole}`)],
      whole, [why(Math.round((part / den) * num), L('To find the whole, divide by the numerator and multiply by the denominator.', 'Чтобы найти целое, делим на числитель и умножаем на знаменатель.', 'Бүтінді табу үшін алымға бөліп, бөлімге көбейтеміз.')), part * den, whole + unit],
      { min: 1 },
    );
  if (k === 2)
    return qNum(
      ctx, id, d,
      L(`A road is ${whole} km long. ${fr(num, den)} of it is repaired. How many kilometres are repaired?`, `Длина дороги ${whole} км. Отремонтировали ${fr(num, den)} дороги. Сколько километров отремонтировали?`, `Жолдың ұзындығы ${whole} км. Жолдың ${fr(num, den)} бөлігі жөнделді. Неше километр жөнделді?`),
      [same(`${whole} ${DIV} ${den} = ${unit}`), same(`${unit} ${TIMES} ${num} = ${part}`)],
      part, [unit, whole - part, part + num],
      { min: 1 },
    );
  return qNum(
    ctx, id, d,
    L(`Dana read ${part} pages, which is ${fr(num, den)} of the book. How many pages are in the book?`, `Дана прочитала ${ru(part, ['страницу', 'страницы', 'страниц'])}, это ${fr(num, den)} книги. Сколько страниц в книге?`, `Дана ${part} бет оқыды, бұл кітаптың ${fr(num, den)} бөлігі. Кітапта неше бет бар?`),
    [same(`${part} ${DIV} ${num} = ${unit}`), same(`${unit} ${TIMES} ${den} = ${whole}`)],
    whole, [part * den, whole - part, unit],
    { min: 1 },
  );
}

// ---------- Единицы массы и площади ----------

export function units4(ctx, d) {
  const { rng } = ctx;
  const id = 'm.units4';
  const RULES = [
    [L('t', 'т', 'т'), L('kg', 'кг', 'кг'), 1000, L('1 t = 1000 kg', '1 т = 1000 кг', '1 т = 1000 кг')],
    [L('t', 'т', 'т'), L('c', 'ц', 'ц'), 10, L('1 t = 10 c (centners)', '1 т = 10 ц', '1 т = 10 ц')],
    [L('c', 'ц', 'ц'), L('kg', 'кг', 'кг'), 100, L('1 c (centner) = 100 kg', '1 ц = 100 кг', '1 ц = 100 кг')],
    [L('ha', 'га', 'га'), L('m²', 'м²', 'м²'), 10000, L('1 ha = 10 000 m²', '1 га = 10 000 м²', '1 га = 10 000 м²')],
    [L('km²', 'км²', 'км²'), L('ha', 'га', 'га'), 100, L('1 km² = 100 ha', '1 км² = 100 га', '1 км² = 100 га')],
    [L('a', 'а', 'а'), L('m²', 'м²', 'м²'), 100, L('1 a (are) = 100 m²', '1 а (ар, сотка) = 100 м²', '1 а (ар, сотық) = 100 м²')],
  ];
  const conv = () => {
    const [big, small, k, rule] = one(rng, RULES);
    const v = R(rng, 2, 9);
    const extra = d >= 2 && k >= 100 && rng() < 0.6 ? R(rng, 1, k - 1) : 0;
    const toSmall = extra > 0 || rng() < 0.6;
    const total = v * k + extra;
    const p = (l) => (toSmall ? (extra ? `${v} ${big[l]} ${n(extra)} ${small[l]} = ? ${small[l]}` : `${v} ${big[l]} = ? ${small[l]}`) : `${n(total)} ${small[l]} = ? ${big[l]}`);
    return qNum(
      ctx, id, d, L(p('en'), p('ru'), p('kk')),
      [rule, same(toSmall ? (extra ? `${v} ${TIMES} ${n(k)} + ${n(extra)} = ${n(total)}` : `${v} ${TIMES} ${n(k)} = ${n(total)}`) : `${n(total)} ${DIV} ${n(k)} = ${v}`)],
      toSmall ? total : v,
      toSmall ? [why(v * (k === 10 ? 100 : k / 10) + extra, L(`Check the rule: ${rule.en}.`, `Проверь правило: ${rule.ru}.`, `Ережені тексер: ${rule.kk}.`)), v * k * 10 + extra, v + extra] : [v * 10, total / 100 === v ? v * 100 : total / 100, v + 1].filter(Number.isInteger),
      { min: 1, display: String(toSmall ? total : v) },
    );
  };
  const field = () => {
    const a = 100 * R(rng, 1, 9);
    const b = 100 * R(rng, 1, 5);
    const ha = (a * b) / 10000;
    if (!Number.isInteger(ha)) return field();
    return qNum(
      ctx, id, d,
      L(`A field is a rectangle ${a} m by ${b} m. Find its area in hectares.`, `Поле имеет форму прямоугольника ${a} м на ${b} м. Найди его площадь в гектарах.`, `Егістік ${a} м-ге ${b} м тіктөртбұрыш пішінді. Оның ауданын гектармен тап.`),
      [same(`${a} ${TIMES} ${b} = ${n(a * b)}`), L(`1 ha = 10 000 m², so ${n(a * b)} : 10 000 = ${ha} ha.`, `1 га = 10 000 м², поэтому ${n(a * b)} : 10 000 = ${ha} га.`, `1 га = 10 000 м², сондықтан ${n(a * b)} : 10 000 = ${ha} га.`)],
      ha, [why(a * b, L('That is the area in m². Change it to hectares.', 'Это площадь в м². Переведи в гектары.', 'Бұл - м²-дегі аудан. Гектарға айналдыр.')), ha * 10, (a * b) / 100],
      { min: 1 },
    );
  };
  const load = () => {
    const t = R(rng, 2, 9);
    const c = R(rng, 2, 9);
    const kg = t * 1000;
    return qNum(
      ctx, id, d,
      L(`A truck carried ${t} t of grain. How many centners is that?`, `Грузовик перевёз ${t} т зерна. Сколько это центнеров?`, `Жүк көлігі ${t} т астық тасыды. Бұл неше центнер?`),
      [L('1 t = 10 c.', '1 т = 10 ц.', '1 т = 10 ц.'), same(`${t} ${TIMES} 10 = ${t * 10}`)],
      t * 10, [why(kg, L('That is kilograms. 1 t = 10 c.', 'Это килограммы. 1 т = 10 ц.', 'Бұл - килограмм. 1 т = 10 ц.')), t * 100, t + c],
      { min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [conv, conv, load]);
  return anyOf(rng, [conv, field, load]);
}

// ---------- Прямоугольный параллелепипед и куб ----------

export function box(ctx, d) {
  const { rng } = ctx;
  const id = 'm.box';
  const a = R(rng, 2, 12);
  const b = R(rng, 2, 9);
  const c = R(rng, 2, 8);
  const vol = () =>
    qNum(
      ctx, id, d,
      L(`A box has length ${a} cm, width ${b} cm and height ${c} cm. Find its volume in cm³.`, `Длина прямоугольного параллелепипеда ${a} см, ширина ${b} см, высота ${c} см. Найди его объём в см³.`, `Тікбұрышты параллелепипедтің ұзындығы ${a} см, ені ${b} см, биіктігі ${c} см. Оның көлемін см³-пен тап.`),
      [L('Volume = length × width × height.', 'Объём = длина × ширина × высота.', 'Көлем = ұзындық × ен × биіктік.'), same(`${a} ${TIMES} ${b} ${TIMES} ${c} = ${a * b * c}`)],
      a * b * c, [why(a + b + c, L('Multiply the three dimensions, do not add them.', 'Три измерения нужно перемножить, а не сложить.', 'Үш өлшемді қоспаймыз, көбейтеміз.')), a * b, 2 * (a * b + b * c + a * c)],
      { fig: boxSvg(a, b, c), min: 1 },
    );
  const cube = () => {
    const s = R(rng, 2, 10);
    return qNum(
      ctx, id, d,
      L(`The edge of a cube is ${s} cm. Find its volume.`, `Ребро куба ${s} см. Найди его объём.`, `Текшенің қыры ${s} см. Оның көлемін тап.`),
      [L('All edges of a cube are equal: V = a × a × a.', 'У куба все рёбра равны: V = a × a × a.', 'Текшенің барлық қырлары тең: V = a × a × a.'), same(`${s} ${TIMES} ${s} ${TIMES} ${s} = ${s ** 3}`)],
      s ** 3, [why(s * s, L('That is the area of one face. Multiply by the edge once more.', 'Это площадь одной грани. Умножь ещё раз на ребро.', 'Бұл - бір жағының ауданы. Тағы бір рет қырына көбейт.')), 3 * s, 12 * s],
      { fig: boxSvg(s, s, s), min: 1 },
    );
  };
  const height = () => {
    const v = a * b * c;
    return qNum(
      ctx, id, d,
      L(`The volume of a box is ${v} cm³, its length is ${a} cm and width ${b} cm. Find its height.`, `Объём прямоугольного параллелепипеда ${v} см³, длина ${a} см, ширина ${b} см. Найди высоту.`, `Тікбұрышты параллелепипедтің көлемі ${v} см³, ұзындығы ${a} см, ені ${b} см. Биіктігін тап.`),
      [L(`Base area: ${a} ${TIMES} ${b} = ${a * b}.`, `Площадь основания: ${a} ${TIMES} ${b} = ${a * b}.`, `Табанының ауданы: ${a} ${TIMES} ${b} = ${a * b}.`), same(`${v} ${DIV} ${a * b} = ${c}`)],
      c, [v - a - b, Math.round(v / a), c + 1],
      { fig: boxSvg(a, b, '?'), min: 1 },
    );
  };
  const parts = () => {
    const what = R(rng, 0, 2);
    const v = [6, 12, 8][what];
    const names = [L('faces', 'граней', 'жағы'), L('edges', 'рёбер', 'қыры'), L('vertices', 'вершин', 'төбесі')];
    const cubeQ = rng() < 0.5;
    return qNum(
      ctx, id, d,
      cubeQ ? L(`How many ${names[what].en} does a cube have?`, `Сколько ${names[what].ru} у куба?`, `Текшенің неше ${names[what].kk} бар?`) : L(`How many ${names[what].en} does a rectangular box have?`, `Сколько ${names[what].ru} у прямоугольного параллелепипеда?`, `Тікбұрышты параллелепипедтің неше ${names[what].kk} бар?`),
      [L('A box has 6 faces, 12 edges and 8 vertices; a cube too.', 'У параллелепипеда 6 граней, 12 рёбер и 8 вершин; у куба так же.', 'Параллелепипедтің 6 жағы, 12 қыры және 8 төбесі бар; текшеде де солай.'), ans(v)],
      v, [6, 12, 8, 4].filter((x) => x !== v),
      { fig: boxSvg('', '', ''), spr: 0, min: 1 },
    );
  };
  const cm3 = () => {
    const v = R(rng, 2, 9);
    const toCm = rng() < 0.5;
    return qNum(
      ctx, id, d,
      toCm ? L(`${v} dm³ = ? cm³`, `${v} дм³ = ? см³`, `${v} дм³ = ? см³`) : L(`${v} m³ = ? dm³`, `${v} м³ = ? дм³`, `${v} м³ = ? дм³`),
      [L('A cube with edge 10 small units holds 10 × 10 × 10 = 1000 small cubes.', 'В кубе с ребром 10 мелких единиц помещается 10 × 10 × 10 = 1000 маленьких кубиков.', 'Қыры 10 кіші бірлік текшеге 10 × 10 × 10 = 1000 кіші текше сыяды.'), same(`${v} ${TIMES} 1000 = ${v * 1000}`)],
      v * 1000, [why(v * 100, L('For volume 1 big unit = 1000 small ones.', 'Для объёма 1 крупная единица = 1000 мелких.', 'Көлем үшін 1 үлкен бірлік = 1000 кіші бірлік.')), v * 10, v * 10000],
      { min: 1, display: String(v * 1000) },
    );
  };
  if (d === 1) return anyOf(rng, [vol, cube, parts]);
  return anyOf(rng, [vol, cube, height, cm3]);
}

// ---------- Уравнения в два действия ----------

export function eq2step(ctx, d) {
  const { rng } = ctx;
  const id = 'm.eq2step';
  const x = R(rng, 2, d === 1 ? 12 : 40);
  const a = R(rng, 2, 9);
  const b = R(rng, 2, d === 1 ? 20 : 90);
  const k = R(rng, 0, d === 1 ? 2 : 4);
  const check = (e) => L(`Check: ${e}.`, `Проверка: ${e}.`, `Тексеру: ${e}.`);
  if (k === 0)
    return qNum(ctx, id, d, solve(`x ${TIMES} ${a} + ${b} = ${x * a + b}`), [L(`x ${TIMES} ${a} is an unknown addend: x ${TIMES} ${a} = ${x * a + b} ${MINUS} ${b} = ${x * a}.`, `x ${TIMES} ${a} - неизвестное слагаемое: x ${TIMES} ${a} = ${x * a + b} ${MINUS} ${b} = ${x * a}.`, `x ${TIMES} ${a} - белгісіз қосылғыш: x ${TIMES} ${a} = ${x * a + b} ${MINUS} ${b} = ${x * a}.`), same(`x = ${x * a} ${DIV} ${a} = ${x}`), check(`${x} ${TIMES} ${a} + ${b} = ${x * a + b}`)], x, [why((x * a + b) / a - b, L('First subtract, then divide.', 'Сначала вычитаем, потом делим.', 'Алдымен азайтамыз, сосын бөлеміз.')), x + 1, x * a].filter(Number.isInteger), { min: 1 });
  if (k === 1)
    return qNum(ctx, id, d, solve(`(x ${MINUS} ${b}) ${TIMES} ${a} = ${x * a}`), [L(`The bracket is an unknown factor: x ${MINUS} ${b} = ${x * a} ${DIV} ${a} = ${x}.`, `Скобка - неизвестный множитель: x ${MINUS} ${b} = ${x * a} ${DIV} ${a} = ${x}.`, `Жақша - белгісіз көбейткіш: x ${MINUS} ${b} = ${x * a} ${DIV} ${a} = ${x}.`), same(`x = ${x} + ${b} = ${x + b}`), check(`(${x + b} ${MINUS} ${b}) ${TIMES} ${a} = ${x * a}`)], x + b, [why(x, L('That is the value of the bracket. Now add.', 'Это значение скобки. Теперь прибавь.', 'Бұл - жақшаның мәні. Енді қос.')), x - b > 0 ? x - b : x + b + a, x * a + b], { min: 1 });
  if (k === 2) {
    const bb = Math.min(b, a * x - 1);
    return qNum(ctx, id, d, solve(`${a} ${TIMES} x ${MINUS} ${bb} = ${a * x - bb}`), [L(`${a} ${TIMES} x is the minuend: ${a} ${TIMES} x = ${a * x - bb} + ${bb} = ${a * x}.`, `${a} ${TIMES} x - уменьшаемое: ${a} ${TIMES} x = ${a * x - bb} + ${bb} = ${a * x}.`, `${a} ${TIMES} x - азайғыш: ${a} ${TIMES} x = ${a * x - bb} + ${bb} = ${a * x}.`), same(`x = ${a * x} ${DIV} ${a} = ${x}`), check(`${a} ${TIMES} ${x} ${MINUS} ${bb} = ${a * x - bb}`)], x, [x + 1, a * x, (a * x - 2 * bb) / a].filter(Number.isInteger), { min: 1 });
  }
  if (k === 3) {
    const q = R(rng, 2, 9);
    const c = R(rng, 2, 30);
    return qNum(ctx, id, d, solve(`${q * x} ${DIV} x + ${c} = ${q + c}`), [L(`${q * x} ${DIV} x = ${q + c} ${MINUS} ${c} = ${q}.`, `${q * x} ${DIV} x = ${q + c} ${MINUS} ${c} = ${q}.`, `${q * x} ${DIV} x = ${q + c} ${MINUS} ${c} = ${q}.`), same(`x = ${q * x} ${DIV} ${q} = ${x}`), check(`${q * x} ${DIV} ${x} + ${c} = ${q + c}`)], x, [q, x + 1, q * x - c], { min: 1 });
  }
  const q = R(rng, 2, 12);
  const c = R(rng, 2, 9);
  const bb = R(rng, 1, q * c - 1);
  const xx = q * c - bb;
  return qNum(ctx, id, d, solve(`(x + ${bb}) ${DIV} ${c} = ${q}`), [L(`The bracket is the dividend: x + ${bb} = ${q} ${TIMES} ${c} = ${q * c}.`, `Скобка - делимое: x + ${bb} = ${q} ${TIMES} ${c} = ${q * c}.`, `Жақша - бөлінгіш: x + ${bb} = ${q} ${TIMES} ${c} = ${q * c}.`), same(`x = ${q * c} ${MINUS} ${bb} = ${xx}`), check(`(${xx} + ${bb}) ${DIV} ${c} = ${q}`)], xx, [why(q * c + bb, L('Subtract the known addend, do not add it.', 'Известное слагаемое нужно вычесть, а не прибавить.', 'Белгілі қосылғышты қоспаймыз, азайтамыз.')), q * c, xx + c], { min: 1 });
}

// ---------- Таблицы и диаграммы ----------

const TEAMS = ['A', 'B', 'C', 'D', 'E'];

export function chart(ctx, d) {
  const { rng } = ctx;
  const id = 'm.chart';
  const cnt = d === 1 ? 4 : 5;
  const top = one(rng, d === 1 ? [10, 20] : [20, 50, 100]);
  const step = top <= 10 ? 1 : top <= 20 ? (rng() < 0.5 ? 2 : 1) : top <= 50 ? 5 : 10;
  const vals = Array.from({ length: cnt }, () => step * R(rng, 1, top / step));
  const labels = TEAMS.slice(0, cnt);
  const fig = barsSvg(labels, vals, top);
  const intro = L('The chart shows how many points the teams A-E scored.', 'На диаграмме - сколько очков набрали команды A-E.', 'Диаграммада A-E командаларының жинаған ұпайлары көрсетілген.');
  const read = L('Read the height of each bar on the scale on the left.', 'Высоту каждого столбика читаем по шкале слева.', 'Әр бағанның биіктігін сол жақтағы шкаладан оқимыз.');
  const k = R(rng, 0, 3);
  const i = R(rng, 0, cnt - 1);
  let j = R(rng, 0, cnt - 1);
  while (j === i) j = R(rng, 0, cnt - 1);
  if (k === 0)
    return qNum(ctx, id, d, L(`${intro.en} How many points did team ${labels[i]} score?`, `${intro.ru} Сколько очков набрала команда ${labels[i]}?`, `${intro.kk} ${labels[i]} командасы неше ұпай жинады?`), [read, ans(vals[i])], vals[i], [vals[i] + step, vals[i] - step, vals[j]], { fig, min: 0 });
  if (k === 1) {
    if (vals[i] === vals[j]) return chart(ctx, d);
    const [x, y] = vals[i] > vals[j] ? [i, j] : [j, i];
    return qNum(ctx, id, d, L(`${intro.en} How many more points did team ${labels[x]} score than team ${labels[y]}?`, `${intro.ru} На сколько очков больше набрала команда ${labels[x]}, чем команда ${labels[y]}?`, `${intro.kk} ${labels[x]} командасы ${labels[y]} командасынан неше ұпай артық жинады?`), [read, same(`${vals[x]} ${MINUS} ${vals[y]} = ${vals[x] - vals[y]}`)], vals[x] - vals[y], [vals[x] + vals[y], vals[x], vals[x] - vals[y] + step], { fig, min: 0 });
  }
  if (k === 2) {
    const total = vals.reduce((s, v) => s + v, 0);
    return qNum(ctx, id, d, L(`${intro.en} How many points did all the teams score together?`, `${intro.ru} Сколько очков набрали все команды вместе?`, `${intro.kk} Барлық командалар бірге неше ұпай жинады?`), [read, same(`${vals.join(' + ')} = ${total}`)], total, [total - vals[0], total + step, Math.max(...vals)], { fig, min: 0 });
  }
  const best = vals.indexOf(Math.max(...vals));
  if (vals.filter((v) => v === vals[best]).length > 1) return chart(ctx, d);
  return qText(ctx, id, d, L(`${intro.en} Which team scored the most points?`, `${intro.ru} Какая команда набрала больше всего очков?`, `${intro.kk} Қай команда ең көп ұпай жинады?`), [L('Find the tallest bar.', 'Найдём самый высокий столбик.', 'Ең биік бағанды табамыз.'), same(labels[best])], same(labels[best]), labels.filter((_, x) => x !== best).map(same), { fig });
}

// ---------- Числовые закономерности ----------

export function seq4(ctx, d) {
  const { rng } = ctx;
  const id = 'm.seq4';
  const kind = R(rng, 0, d === 1 ? 2 : 4);
  let seq;
  let rule;
  if (kind === 0) {
    const s = R(rng, 3, 9) * (d === 1 ? 1 : 10);
    const st = R(rng, 6, 25) * (d === 1 ? 1 : 5);
    seq = Array.from({ length: 6 }, (_, i) => s + i * st);
    rule = L(`Each time add ${st}.`, `Каждый раз прибавляем ${st}.`, `Әр жолы ${st} қосамыз.`);
  } else if (kind === 1) {
    const m = one(rng, [2, 3]);
    const s = R(rng, 1, 5);
    seq = Array.from({ length: 6 }, (_, i) => s * m ** i);
    rule = L(`Each number is ${m} times the one before.`, `Каждое число в ${m} раза больше предыдущего.`, `Әр сан алдыңғысынан ${m} есе үлкен.`);
  } else if (kind === 2) {
    const s = R(rng, 1, 20);
    const st = R(rng, 1, 4);
    seq = [s];
    for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + st + i - 1);
    rule = L(`The differences grow by 1: +${st}, +${st + 1}, +${st + 2} ...`, `Разности растут на 1: +${st}, +${st + 1}, +${st + 2} ...`, `Айырмалар 1-ге өседі: +${st}, +${st + 1}, +${st + 2} ...`);
  } else if (kind === 3) {
    const s = R(rng, 10, 60);
    const [p, q] = [R(rng, 3, 9), R(rng, 1, 2)];
    seq = [s];
    for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 ? p : -q));
    rule = L(`Add ${p}, subtract ${q}, add ${p}, subtract ${q} ...`, `Прибавляем ${p}, вычитаем ${q}, прибавляем ${p}, вычитаем ${q} ...`, `${p} қосамыз, ${q} азайтамыз, ${p} қосамыз, ${q} азайтамыз ...`);
  } else {
    const s = R(rng, 2, 9);
    seq = Array.from({ length: 6 }, (_, i) => (s + i) * (s + i));
    rule = L(`These are squares: ${s}${TIMES}${s}, ${s + 1}${TIMES}${s + 1}, ...`, `Это квадраты чисел: ${s}${TIMES}${s}, ${s + 1}${TIMES}${s + 1}, ...`, `Бұлар - сандардың квадраттары: ${s}${TIMES}${s}, ${s + 1}${TIMES}${s + 1}, ...`);
  }
  const hole = d === 1 ? 5 : R(rng, 2, 5);
  const v = seq[hole];
  const shown = seq.map((x, i) => (i === hole ? '?' : n(x))).join(', ');
  const diff = seq[hole - 1] - seq[hole - 2];
  return qNum(
    ctx, id, d,
    L(`Find the missing number: ${shown}`, `Найди пропущенное число: ${shown}`, `Жетіспейтін санды тап: ${shown}`),
    [rule, ans(n(v))],
    v, [seq[hole - 1] + diff, v + 1, v - 1, seq[hole - 1] * 2],
    { min: 0 },
  );
}

// ---------- Римские цифры ----------

const ROMAN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export function roman(x) {
  let s = '';
  for (const [v, r] of ROMAN) while (x >= v) (s += r), (x -= v);
  return s;
}

export function romanQ(ctx, d) {
  const { rng } = ctx;
  const id = 'm.roman';
  const max = d === 1 ? 39 : d === 2 ? 100 : 2100;
  const x = d === 3 ? R(rng, 1000, max) : R(rng, d === 1 ? 4 : 30, max);
  const r = roman(x);
  const rule = L('I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. A smaller digit before a bigger one is subtracted: IV = 4, IX = 9, XL = 40, XC = 90.', 'I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. Меньшая цифра перед большей вычитается: IV = 4, IX = 9, XL = 40, XC = 90.', 'I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. Үлкен цифрдың алдындағы кіші цифр азайтылады: IV = 4, IX = 9, XL = 40, XC = 90.');
  // Типичные ошибки: «сложили» вычитаемую цифру, переставили цифры.
  const naive = [...r].reduce((s, ch) => s + { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }[ch], 0);
  if (rng() < 0.5)
    return qNum(
      ctx, id, d,
      L(`Write the Roman numeral ${r} in ordinary digits.`, `Запиши римское число ${r} арабскими цифрами.`, `${r} рим санын араб цифрларымен жаз.`),
      [rule, ans(x)],
      x, [why(naive, L('A smaller digit before a bigger one is subtracted, not added.', 'Меньшая цифра перед большей вычитается, а не прибавляется.', 'Үлкен цифрдың алдындағы кіші цифр қосылмайды, азайтылады.')), x + 10, x - 1, x + 2],
      { min: 1 },
    );
  const wrong = [roman(x + 1), roman(Math.max(1, x - 1)), r.replace('IV', 'IIII').replace('IX', 'VIIII').replace('XL', 'XXXX').replace('XC', 'LXXXX'), roman(x + 10), roman(Math.max(1, x - 10))];
  return qText(
    ctx, id, d,
    L(`How is ${x} written in Roman numerals?`, `Как записать число ${x} римскими цифрами?`, `${x} санын рим цифрларымен қалай жазады?`),
    [rule, same(`${x} = ${r}`)],
    same(r), wrong.filter((w) => w !== r).map(same),
  );
}
