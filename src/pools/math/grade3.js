// Математика 3 класса: деление с остатком, внетабличное умножение и деление, числа до 1000,
// письменные вычисления, доли, площадь, масса, время, уравнения, цена и стоимость, окружность.

import { L, n, same, why } from '../gen.js';
import { DIV, MINUS, R, TIMES, anyOf, barFracSvg, circleSvg, columnSvg, gridSvg, kkAbl, kkDat, one, pieFracSvg, polySvg, qNum, qText, ru } from './kit.js';
import { column } from './grade2.js';

const calc = (e) => L(`Calculate: ${e}`, `Вычисли: ${e}`, `Есепте: ${e}`);
const solve = (e) => L(`Solve the equation: ${e}`, `Реши уравнение: ${e}`, `Теңдеуді шеш: ${e}`);
const ans = (v) => L(`Answer: ${v}.`, `Ответ: ${v}.`, `Жауабы: ${v}.`);
const TG = (v) => L(`${n(v)} tenge`, `${n(v)} тенге`, `${n(v)} теңге`);

// ---------- Деление с остатком ----------

const qr = (q, r) => L(`${q} remainder ${r}`, `${q} (ост. ${r})`, `${q} (қалдық ${r})`);

export function remDiv(ctx, d) {
  const { rng } = ctx;
  const id = 'm.remdiv';
  const b = R(rng, 2, 9);
  const q = R(rng, d === 1 ? 1 : 3, d === 1 ? 9 : 15);
  const r = R(rng, 1, b - 1);
  const a = b * q + r;
  const rule = L(`Find the largest multiple of ${b} not bigger than ${a}: ${b} ${TIMES} ${q} = ${b * q}.`, `Найдём наибольшее число, не больше ${a}, которое делится на ${b}: ${b} ${TIMES} ${q} = ${b * q}.`, `${a} санынан аспайтын, ${b}-ге бөлінетін ең үлкен санды табамыз: ${b} ${TIMES} ${q} = ${b * q}.`);
  const remStep = L(`Remainder: ${a} ${MINUS} ${b * q} = ${r}. It is less than ${b}.`, `Остаток: ${a} ${MINUS} ${b * q} = ${r}. Он меньше делителя ${b}.`, `Қалдық: ${a} ${MINUS} ${b * q} = ${r}. Ол ${b} бөлгішінен кіші.`);
  const full = () =>
    qText(
      ctx, id, d,
      L(`Divide with a remainder: ${a} ${DIV} ${b}`, `Выполни деление с остатком: ${a} ${DIV} ${b}`, `Қалдықпен бөл: ${a} ${DIV} ${b}`),
      [rule, remStep, same(`${a} ${DIV} ${b} = ${q} (${r})`)],
      qr(q, r), [qr(q + 1, r), qr(q, r + 1 < b ? r + 1 : r - 1), qr(q - 1, r + b), qr(r, q), qr(q + 1, 0)],
    );
  const remOnly = () =>
    qNum(
      ctx, id, d,
      L(`Find the remainder: ${a} ${DIV} ${b}`, `Найди остаток от деления ${a} на ${b}.`, `${a} санын ${kkDat(b)} бөлгендегі қалдықты тап.`),
      [rule, remStep],
      r, [why(r + b, L('The remainder must be less than the divisor.', 'Остаток должен быть меньше делителя.', 'Қалдық бөлгіштен кіші болуы керек.')), q, b - r],
      { min: 0 },
    );
  const story = () => {
    const kind = R(rng, 0, 1);
    if (kind === 0)
      return qNum(
        ctx, id, d,
        L(`${a} sweets are packed ${b} to a bag. How many full bags are there?`, `${ru(a, ['конфету', 'конфеты', 'конфет'])} разложили по ${b} в пакет. Сколько получилось полных пакетов?`, `${a} кәмпитті пакетке ${kkAbl(b)} салды. Неше толық пакет шықты?`),
        [same(`${a} ${DIV} ${b} = ${q} (${r})`), L(`${q} full bags, and ${r} sweets are left over.`, `${q} полных пакетов, и ещё ${r} конфет(ы) осталось.`, `${q} толық пакет, тағы ${r} кәмпит артылады.`)],
        q, [q + 1, r, why(q + r, L('Add nothing: the leftover sweets do not make a full bag.', 'Оставшиеся конфеты полного пакета не дают.', 'Артылған кәмпиттер толық пакет болмайды.'))],
        { min: 0 },
      );
    return qNum(
      ctx, id, d,
      L(`${a} children go by boats, ${b} children in a boat. How many boats are needed for everyone?`, `${a} детей переправляются на лодках, по ${b} в каждой. Сколько нужно лодок, чтобы переправить всех?`, `${a} бала қайықпен өтеді, әр қайыққа ${b} баладан. Барлығын өткізу үшін неше қайық керек?`),
      [same(`${a} ${DIV} ${b} = ${q} (${r})`), L(`${q} boats are full and ${r} children still need one more boat: ${q} + 1 = ${q + 1}.`, `${q} лодок заполнены, а ещё ${r} детям нужна ещё одна лодка: ${q} + 1 = ${q + 1}.`, `${q} қайық толады, ал қалған ${r} балаға тағы бір қайық керек: ${q} + 1 = ${q + 1}.`)],
      q + 1, [why(q, L('The children who are left also need a boat.', 'Оставшимся детям тоже нужна лодка.', 'Қалған балаларға да қайық керек.')), r, q + 2],
      { min: 0 },
    );
  };
  const dividend = () =>
    qNum(
      ctx, id, d,
      L(`A number was divided by ${b}: the quotient is ${q}, the remainder is ${r}. Find the number.`, `Число разделили на ${b}, получили ${q} и остаток ${r}. Найди это число.`, `Бір санды ${kkDat(b)} бөлгенде, бөлінді ${q}, қалдық ${r} шықты. Сол санды тап.`),
      [L('Dividend = divisor × quotient + remainder.', 'Делимое = делитель × частное + остаток.', 'Бөлінгіш = бөлгіш × бөлінді + қалдық.'), same(`${b} ${TIMES} ${q} + ${r} = ${a}`)],
      a, [why(b * q, L('Do not forget to add the remainder.', 'Не забудь прибавить остаток.', 'Қалдықты қосуды ұмытпа.')), b * q - r, b + q + r],
      { min: 0 },
    );
  if (d === 1) return anyOf(rng, [full, remOnly, remOnly]);
  return anyOf(rng, [full, story, dividend, remOnly]);
}

// ---------- Внетабличное умножение и деление ----------

export function mulBig(ctx, d) {
  const { rng } = ctx;
  const id = 'm.mulbig';
  const k = R(rng, 0, 3);
  if (d === 1) {
    if (k === 0) {
      const t = R(rng, 2, 9);
      const b = R(rng, 2, Math.max(2, Math.floor(30 / t)));
      return qNum(ctx, id, d, calc(`${t * 10} ${TIMES} ${b}`), [L(`${t} tens ${TIMES} ${b} = ${t * b} tens.`, `${t} дес. ${TIMES} ${b} = ${t * b} дес.`, `${t} ондық ${TIMES} ${b} = ${t * b} ондық.`), same(`${t * 10} ${TIMES} ${b} = ${t * b * 10}`)], t * b * 10, [t * b, t * b * 100, t * b * 10 + 10], { min: 0 });
    }
    if (k === 1) {
      const t = R(rng, 2, 9);
      const b = one(rng, [2, 3, 4, 5, 6, 7, 8, 9].filter((x) => (t * 10) % x === 0));
      const v = (t * 10) / b;
      return qNum(ctx, id, d, calc(`${t * 10} ${DIV} ${b}`), [L(`Think: ${b} ${TIMES} ? = ${t * 10}.`, `Подумаем: ${b} ${TIMES} ? = ${t * 10}.`, `Ойлаймыз: ${b} ${TIMES} ? = ${t * 10}.`), same(`${b} ${TIMES} ${v} = ${t * 10}, ${t * 10} ${DIV} ${b} = ${v}`)], v, [v / 10, v * 10, v + 10].filter(Number.isInteger), { min: 0 });
    }
    const a = R(rng, 11, 29);
    const b = R(rng, 2, Math.floor(99 / a));
    const t = a - (a % 10);
    if (k === 2) return qNum(ctx, id, d, calc(`${a} ${TIMES} ${b}`), [L('Multiply the tens and the ones separately, then add.', 'Умножим отдельно десятки и единицы, потом сложим.', 'Ондықтар мен бірліктерді бөлек көбейтіп, сосын қосамыз.'), same(`${t} ${TIMES} ${b} + ${a % 10} ${TIMES} ${b} = ${t * b} + ${(a % 10) * b} = ${a * b}`)], a * b, [why(t * b + (a % 10), L('Multiply the ones too, not only the tens.', 'Умножать нужно и единицы, а не только десятки.', 'Тек ондықтарды емес, бірліктерді де көбейту керек.')), a * b + 10, a + b], { min: 0 });
    const p = a * b;
    return qNum(ctx, id, d, calc(`${p} ${DIV} ${b}`), [L(`Split ${p} into parts that divide easily: ${t * b} + ${(a % 10) * b}.`, `Разобьём ${p} на удобные слагаемые: ${t * b} + ${(a % 10) * b}.`, `${p} санын ыңғайлы қосылғыштарға жіктейміз: ${t * b} + ${(a % 10) * b}.`), same(`${t * b} ${DIV} ${b} + ${(a % 10) * b} ${DIV} ${b} = ${t} + ${a % 10} = ${a}`)], a, [a + 10, a - 1, a + 1], { min: 0 });
  }
  if (k <= 1) {
    const b = R(rng, 3, 9);
    const q = R(rng, 12, Math.floor(99 / b));
    if (q * b > 99) return mulBig(ctx, d);
    const p = q * b;
    if (k === 0) return qNum(ctx, id, d, calc(`${q} ${TIMES} ${b}`), [L('Multiply the tens and the ones separately, then add.', 'Умножим отдельно десятки и единицы, потом сложим.', 'Ондықтар мен бірліктерді бөлек көбейтіп, сосын қосамыз.'), same(`${q - (q % 10)} ${TIMES} ${b} + ${q % 10} ${TIMES} ${b} = ${(q - (q % 10)) * b} + ${(q % 10) * b} = ${p}`)], p, [why((q - (q % 10)) * b + (q % 10), L('Multiply the ones too.', 'Единицы тоже нужно умножить.', 'Бірліктерді де көбейту керек.')), p + b, p - 10], { min: 0 });
    const t10 = Math.floor(q / 10) * 10 * b;
    return qNum(ctx, id, d, calc(`${p} ${DIV} ${b}`), [L(`Split ${p} into parts that divide easily: ${t10} + ${p - t10}.`, `Разобьём ${p} на удобные слагаемые: ${t10} + ${p - t10}.`, `${p} санын ыңғайлы қосылғыштарға жіктейміз: ${t10} + ${p - t10}.`), same(`${t10} ${DIV} ${b} + ${p - t10} ${DIV} ${b} = ${t10 / b} + ${(p - t10) / b} = ${q}`)], q, [q + 1, q - 1, q + 10, why(p - b, L('This is division, not subtraction.', 'Здесь деление, а не вычитание.', 'Бұл - азайту емес, бөлу.'))], { min: 0 });
  }
  const b = R(rng, 11, 33);
  const q = R(rng, 2, Math.floor(99 / b));
  const p = b * q;
  if (k === 2) return qNum(ctx, id, d, calc(`${p} ${DIV} ${b}`), [L(`Try numbers: ${b} ${TIMES} ${q} = ${p}.`, `Подберём частное: ${b} ${TIMES} ${q} = ${p}.`, `Бөліндіні таңдаймыз: ${b} ${TIMES} ${q} = ${p}.`), ans(q)], q, [q + 1, q - 1, p - b], { min: 1 });
  return qNum(ctx, id, d, L(`Find the missing number: ${b} ${TIMES} ☐ = ${p}`, `Найди пропущенное число: ${b} ${TIMES} ☐ = ${p}`, `Жетіспейтін санды тап: ${b} ${TIMES} ☐ = ${p}`), [L('Unknown factor = product : known factor.', 'Неизвестный множитель = произведение : известный множитель.', 'Белгісіз көбейткіш = көбейтінді : белгілі көбейткіш.'), same(`${p} ${DIV} ${b} = ${q}`)], q, [q + 1, p - b, q + 2], { min: 1 });
}

// ---------- Числа до 1000 ----------

export function num1000(ctx, d) {
  const { rng } = ctx;
  const id = 'm.num1000';
  const x = R(rng, 101, 999);
  const [h, t, o] = [Math.floor(x / 100), Math.floor(x / 10) % 10, x % 10];
  const expand = () =>
    qText(
      ctx, id, d,
      L(`Write ${x} as a sum of place values.`, `Представь число ${x} в виде суммы разрядных слагаемых.`, `${x} санын разрядтық қосылғыштардың қосындысы түрінде жаз.`),
      [L(`${x} has ${h} hundreds, ${t} tens, ${o} ones.`, `В числе ${x}: ${h} сот., ${t} дес., ${o} ед.`, `${x} санында ${h} жүздік, ${t} ондық, ${o} бірлік бар.`)],
      same([h * 100, t * 10, o].filter(Boolean).join(' + ')),
      [same([h * 10, t, o].filter(Boolean).join(' + ') || '0'), same([h * 100, t, o * 10].filter(Boolean).join(' + ') || '0'), same([h * 100 + 100, t * 10, o].filter(Boolean).join(' + ')), same(`${h} + ${t} + ${o}`)],
    );
  const digitAt = () => {
    const place = R(rng, 0, 2);
    const v = [h, t, o][place];
    const names = [L('hundreds', 'сотен', 'жүздіктер'), L('tens', 'десятков', 'ондықтар'), L('ones', 'единиц', 'бірліктер')][place];
    return qNum(
      ctx, id, d,
      L(`Which digit is in the ${names.en} place of ${x}?`, `Какая цифра стоит в разряде ${names.ru} числа ${x}?`, `${x} санының ${names.kk} разрядында қай цифр тұр?`),
      [L('From the right: ones, tens, hundreds.', 'Справа налево: единицы, десятки, сотни.', 'Оңнан солға: бірліктер, ондықтар, жүздіктер.'), ans(v)],
      v, [h, t, o, v * 10, v * 100].filter((y) => y !== v),
      { spr: 0, min: 0 },
    );
  };
  const step = () => {
    const k = one(rng, [1, 10, 100]);
    const more = rng() < 0.5;
    const v = more ? x + k : x - k;
    if (v > 1000 || v < 100) return expand();
    return qNum(
      ctx, id, d,
      more ? L(`Which number is ${k} more than ${x}?`, `Какое число на ${k} больше, чем ${x}?`, `${x} санынан ${kkDat(k)} артық сан қандай?`) : L(`Which number is ${k} less than ${x}?`, `Какое число на ${k} меньше, чем ${x}?`, `${x} санынан ${kkDat(k)} кем сан қандай?`),
      [same(`${x} ${more ? '+' : MINUS} ${k} = ${v}`)],
      v, [more ? x - k : x + k, ...[1, 10, 100].filter((z) => z !== k).map((z) => (more ? x + z : x - z))],
      { min: 0 },
    );
  };
  const cmp = () => {
    const y = x + one(rng, [-100, -10, -1, 1, 10, 100, 90, -90, 9, -9]);
    const sign = x > y ? '&gt;' : '&lt;';
    return qText(
      ctx, id, d,
      L(`Which sign goes in the box: ${x} ☐ ${y}`, `Какой знак поставить в окошко: ${x} ☐ ${y}`, `Терезеге қай таңбаны қою керек: ${x} ☐ ${y}`),
      [L('Compare hundreds, then tens, then ones.', 'Сравниваем сотни, потом десятки, потом единицы.', 'Жүздіктерді, сосын ондықтарды, сосын бірліктерді салыстырамыз.'), same(`${x} ${sign} ${y}`)],
      sign, ['&gt;', '&lt;', '='].filter((s) => s !== sign),
    );
  };
  const build = () => {
    const parts = [h * 100, o, t * 10].filter(Boolean);
    return qNum(
      ctx, id, d,
      L(`Write the number: ${h} hundreds, ${t} tens and ${o} ones.`, `Запиши число: ${h} сот., ${t} дес. и ${o} ед.`, `Санды жаз: ${h} жүздік, ${t} ондық және ${o} бірлік.`),
      [same(`${parts.join(' + ')} = ${x}`)],
      x, [h * 100 + o * 10 + t, h + t + o, h * 100 + t + o, x + 100].filter((y) => y >= 0),
      { min: 0 },
    );
  };
  const tensIn = () => {
    const v = 10 * R(rng, 11, 99);
    return qNum(
      ctx, id, d,
      L(`How many tens are there in ${v} altogether?`, `Сколько всего десятков в числе ${v}?`, `${v} санында барлығы неше ондық бар?`),
      [L(`${v} = ${v / 10} ${TIMES} 10.`, `${v} = ${v / 10} ${TIMES} 10.`, `${v} = ${v / 10} ${TIMES} 10.`), ans(v / 10)],
      v / 10, [Math.floor(v / 10) % 10, Math.floor(v / 100), v],
      { min: 0 },
    );
  };
  if (d === 1) return anyOf(rng, [expand, digitAt, step, build]);
  return anyOf(rng, [cmp, step, tensIn, expand, build]);
}

// ---------- Письменное сложение и вычитание трёхзначных чисел ----------

export const col3 = (ctx, d) => column(ctx, d, 'm.col3', 3);

// ---------- Умножение и деление на однозначное число столбиком ----------

export function colMul(ctx, d) {
  const { rng } = ctx;
  const id = 'm.colmul';
  const b = R(rng, 2, 9);
  const mul = rng() < 0.55;
  if (mul) {
    const top = R(rng, 102, Math.floor(999 / b));
    const p = top * b;
    const noCarry = Number([...String(top)].map((ch) => (Number(ch) * b) % 10).join(''));
    return qNum(
      ctx, id, d,
      L(`Multiply in a column: ${top} ${TIMES} ${b}`, `Умножь столбиком: ${top} ${TIMES} ${b}`, `Бағанмен көбейт: ${top} ${TIMES} ${b}`),
      [L('Multiply each digit by the factor, starting with the ones; carry the tens to the next place.', 'Умножаем каждую цифру на множитель, начиная с единиц; десятки переносим в следующий разряд.', 'Әр цифрды бірліктерден бастап көбейткішке көбейтеміз; ондықтарды келесі разрядқа ауыстырамыз.'), same(`${top} ${TIMES} ${b} = ${p}`)],
      p, [why(noCarry, L('You forgot to add the carried tens.', 'Ты забыл прибавить перенесённые десятки.', 'Ауысқан ондықтарды қосуды ұмыттың.')), p + b, p - 10, p + 100],
      { fig: columnSvg(top, b, TIMES), min: 0 },
    );
  }
  const q = R(rng, d === 1 ? 21 : 101, Math.floor(999 / b));
  const p = q * b;
  return qNum(
    ctx, id, d,
    L(`Divide: ${p} ${DIV} ${b}`, `Раздели столбиком (уголком): ${p} ${DIV} ${b}`, `Бұрышпен бөл: ${p} ${DIV} ${b}`),
    [L('Divide from the highest place: take the first part that is not smaller than the divisor.', 'Делим, начиная со старшего разряда: берём первое неполное делимое не меньше делителя.', 'Жоғары разрядтан бастап бөлеміз: бөлгіштен кіші емес бірінші толымсыз бөлінгішті аламыз.'), L(`Check: ${q} ${TIMES} ${b} = ${p}.`, `Проверка: ${q} ${TIMES} ${b} = ${p}.`, `Тексеру: ${q} ${TIMES} ${b} = ${p}.`)],
    q, [q + 10, q - 1, q * 10 > 999 ? q + 2 : q * 10, why(Number(String(q).replace(/0/g, '')) || q + 3, L('Do not lose the zero in the quotient.', 'Не потеряй ноль в частном.', 'Бөліндідегі нөлді жоғалтпа.'))],
    { min: 1 },
  );
}

// ---------- Доли: половина, треть, четверть ----------

/** Дробь без сокращения (как на рисунке). */
const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

const PART = {
  2: L('a half', 'половина', 'жартысы'),
  3: L('a third', 'треть', 'үштен бірі'),
  4: L('a quarter', 'четверть', 'төрттен бірі'),
};
const PART_OF = {
  2: L('half', 'половину', 'жартысын'),
  3: L('a third', 'треть', 'үштен бірін'),
  4: L('a quarter', 'четверть', 'төрттен бірін'),
};

export function parts(ctx, d) {
  const { rng } = ctx;
  const id = 'm.parts';
  const pic = () => {
    const nParts = d === 1 ? one(rng, [2, 3, 4, 5, 6, 8]) : one(rng, [3, 4, 5, 6, 8]);
    const k = d === 1 ? 1 : R(rng, 1, nParts - 1);
    const round = rng() < 0.5;
    return qText(
      ctx, id, d,
      L('What part of the shape is coloured?', 'Какая часть фигуры закрашена?', 'Фигураның қай бөлігі боялған?'),
      [L(`The shape is cut into ${nParts} equal parts, ${k} of them are coloured.`, `Фигура разделена на ${nParts} равных частей, закрашено ${k}.`, `Фигура ${nParts} тең бөлікке бөлінген, оның ${k} бөлігі боялған.`), same(fr(k, nParts))],
      same(fr(k, nParts)),
      [same(fr(nParts - k, nParts)), same(fr(k, nParts + 1)), same(fr(nParts, k)), same(fr(k + 1, nParts)), same(fr(1, k + nParts))],
      { fig: round ? pieFracSvg(nParts, k) : barFracSvg(nParts, k) },
    );
  };
  const partOf = () => {
    const den = one(rng, [2, 3, 4]);
    const v = R(rng, 2, d === 1 ? 10 : 25);
    const total = den * v;
    return qNum(
      ctx, id, d,
      L(`Find ${PART_OF[den].en} of ${total}.`, `Найди ${PART_OF[den].ru} от числа ${total}.`, `${total} санының ${PART_OF[den].kk} тап.`),
      [L(`To find one part out of ${den}, divide by ${den}.`, `Чтобы найти одну из ${den} равных частей, делим на ${den}.`, `${den} тең бөліктің бірін табу үшін ${kkDat(den)} бөлеміз.`), same(`${total} ${DIV} ${den} = ${v}`)],
      v, [why(total * den, L('To find a part, divide - do not multiply.', 'Чтобы найти долю, делят, а не умножают.', 'Үлесті табу үшін көбейтпейміз, бөлеміз.')), total - den, total / 2 === v ? v + 1 : total / 2].filter(Number.isInteger),
      { min: 1 },
    );
  };
  const story = () => {
    const den = one(rng, [2, 3, 4]);
    const v = R(rng, 2, 12);
    const total = den * v;
    return qNum(
      ctx, id, d,
      L(`There were ${total} pages in a book. Aru read ${PART_OF[den].en} of the book. How many pages did she read?`, `В книге ${ru(total, ['страница', 'страницы', 'страниц'])}. Ару прочитала ${PART_OF[den].ru} книги. Сколько страниц она прочитала?`, `Кітапта ${total} бет бар. Ару кітаптың ${PART_OF[den].kk} оқыды. Ол неше бет оқыды?`),
      [L(`${PART[den].en[0].toUpperCase() + PART[den].en.slice(1)} means dividing by ${den}.`, `${PART[den].ru[0].toUpperCase() + PART[den].ru.slice(1)} - значит, делим на ${den}.`, `Бұл - ${kkDat(den)} бөлу деген сөз.`), same(`${total} ${DIV} ${den} = ${v}`)],
      v, [total - den, v + den, total * den],
      { min: 1 },
    );
  };
  const whole = () => {
    const den = one(rng, [2, 3, 4]);
    const v = R(rng, 2, 15);
    return qNum(
      ctx, id, d,
      L(`${PART[den].en[0].toUpperCase() + PART[den].en.slice(1)} of a number is ${v}. Find the number.`, `${PART[den].ru[0].toUpperCase() + PART[den].ru.slice(1)} числа равна ${v}. Найди это число.`, `Санның ${PART[den].kk} ${kkDat(v)} тең. Сол санды тап.`),
      [L(`The whole has ${den} such parts, so multiply.`, `В целом ${den} таких части - умножаем.`, `Бүтінде мұндай ${den} бөлік бар - көбейтеміз.`), same(`${v} ${TIMES} ${den} = ${v * den}`)],
      v * den, [why(v / den, L('The whole is bigger than its part, so multiply.', 'Целое больше части, поэтому умножаем.', 'Бүтін бөліктен үлкен, сондықтан көбейтеміз.')), v + den, v * den + den].filter((x) => Number.isInteger(x)),
      { min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [pic, partOf, story, whole]);
  return anyOf(rng, [pic, partOf, story, whole]);
}

// ---------- Площадь: см², дм², м² ----------

const SQ = { cm: ['cm²', 'см²', 'см²'], dm: ['dm²', 'дм²', 'дм²'], m: ['m²', 'м²', 'м²'] };

export function area3(ctx, d) {
  const { rng } = ctx;
  const id = 'm.area3';
  const cells = () => {
    const cols = 10;
    const rows = 6;
    const w = R(rng, 2, 6);
    const h = R(rng, 2, 4);
    const x0 = R(rng, 0, cols - w);
    const y0 = R(rng, 0, rows - h);
    const list = [];
    for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) list.push([x0 + i, y0 + j]);
    // Иногда добавим «выступ», чтобы фигура не была прямоугольником.
    if (d >= 2 && rng() < 0.6) {
      const extra = R(rng, 1, Math.min(3, w));
      for (let i = 0; i < extra; i++) {
        const y = y0 > 0 ? y0 - 1 : y0 + h;
        if (y < rows) list.push([x0 + i, y]);
      }
    }
    const v = list.length;
    return qNum(
      ctx, id, d,
      L('Each small square is 1 cm². What is the area of the coloured shape in cm²?', 'Каждая клетка - 1 см². Какова площадь закрашенной фигуры в см²?', 'Әр шаршы - 1 см². Боялған фигураның ауданы неше см²?'),
      [L('Count the squares inside the shape.', 'Посчитаем клетки внутри фигуры.', 'Фигураның ішіндегі шаршыларды санаймыз.'), v === w * h ? same(`${w} ${TIMES} ${h} = ${v}`) : ans(v)],
      v, [v === w * h ? why(2 * (w + h), L('That is the perimeter (the border). Area counts the squares inside.', 'Это периметр (граница). Площадь - число клеток внутри.', 'Бұл - периметр (шекара). Аудан - ішіндегі шаршылар саны.')) : v + 2, v + 1, v - 1, v + w],
      { fig: gridSvg(list, cols, rows), min: 1 },
    );
  };
  const rect = () => {
    const a = R(rng, 2, 12);
    const b = R(rng, 2, 9);
    const u = one(rng, ['cm', 'dm', 'm']);
    const U1 = { cm: ['cm', 'см', 'см'], dm: ['dm', 'дм', 'дм'], m: ['m', 'м', 'м'] }[u];
    return qNum(
      ctx, id, d,
      L(`A rectangle is ${a} ${U1[0]} long and ${b} ${U1[0]} wide. Find its area in ${SQ[u][0]}.`, `Длина прямоугольника ${a} ${U1[1]}, ширина ${b} ${U1[1]}. Найди его площадь в ${SQ[u][1]}.`, `Тіктөртбұрыштың ұзындығы ${a} ${U1[2]}, ені ${b} ${U1[2]}. Оның ауданын ${SQ[u][2]}-мен тап.`),
      [L('Area of a rectangle = length × width.', 'Площадь прямоугольника = длина × ширина.', 'Тіктөртбұрыштың ауданы = ұзындығы × ені.'), same(`${a} ${TIMES} ${b} = ${a * b}`)],
      a * b, [why(2 * (a + b), L('That is the perimeter. Area = length × width.', 'Это периметр. Площадь = длина × ширина.', 'Бұл - периметр. Аудан = ұзындық × ен.')), a + b, a * b + a],
      { fig: polySvg([[30, 30], [30 + 16 * Math.min(a, 12), 30], [30 + 16 * Math.min(a, 12), 30 + 14 * b], [30, 30 + 14 * b]], [String(a), String(b)], { right: [0, 1, 2, 3], h: 175 }), min: 1 },
    );
  };
  const convert = () => {
    const [big, small] = one(rng, [['dm', 'cm'], ['m', 'dm']]);
    const v = R(rng, 2, 9);
    const toSmall = rng() < 0.6;
    return qNum(
      ctx, id, d,
      toSmall ? L(`${v} ${SQ[big][0]} = ? ${SQ[small][0]}`, `${v} ${SQ[big][1]} = ? ${SQ[small][1]}`, `${v} ${SQ[big][2]} = ? ${SQ[small][2]}`) : L(`${v * 100} ${SQ[small][0]} = ? ${SQ[big][0]}`, `${v * 100} ${SQ[small][1]} = ? ${SQ[big][1]}`, `${v * 100} ${SQ[small][2]} = ? ${SQ[big][2]}`),
      [L(`A square with side 1 ${big} = 10 ${small} holds 10 ${TIMES} 10 = 100 small squares: 1 ${SQ[big][0]} = 100 ${SQ[small][0]}.`, `В квадрат со стороной 1 ${big === 'dm' ? 'дм' : 'м'} = 10 ${small === 'cm' ? 'см' : 'дм'} помещается 10 ${TIMES} 10 = 100 маленьких квадратов: 1 ${SQ[big][1]} = 100 ${SQ[small][1]}.`, `Қабырғасы 1 ${big === 'dm' ? 'дм' : 'м'} = 10 ${small === 'cm' ? 'см' : 'дм'} шаршыға 10 ${TIMES} 10 = 100 кіші шаршы сыяды: 1 ${SQ[big][2]} = 100 ${SQ[small][2]}.`), same(toSmall ? `${v} ${TIMES} 100 = ${v * 100}` : `${v * 100} ${DIV} 100 = ${v}`)],
      toSmall ? v * 100 : v, toSmall ? [why(v * 10, L('For area 1 big unit = 100 small ones, not 10.', 'Для площади 1 крупная единица = 100 мелких, а не 10.', 'Аудан үшін 1 үлкен бірлік = 100 кіші бірлік, 10 емес.')), v * 1000, v + 100] : [v * 10, v * 1000, v + 1],
      { min: 1 },
    );
  };
  const side = () => {
    const a = R(rng, 2, 12);
    const b = R(rng, 2, 9);
    return qNum(
      ctx, id, d,
      L(`The area of a rectangle is ${a * b} cm², its length is ${a} cm. Find its width.`, `Площадь прямоугольника ${a * b} см², длина ${a} см. Найди ширину.`, `Тіктөртбұрыштың ауданы ${a * b} см², ұзындығы ${a} см. Енін тап.`),
      [L('Width = area : length.', 'Ширина = площадь : длина.', 'Ені = аудан : ұзындық.'), same(`${a * b} ${DIV} ${a} = ${b}`)],
      b, [a * b - a, b + 1, a],
      { min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [cells, cells, rect]);
  return anyOf(rng, [cells, rect, convert, side]);
}

// ---------- Масса: грамм, килограмм ----------

export function mass(ctx, d) {
  const { rng } = ctx;
  const id = 'm.mass';
  const toG = () => {
    const kg = R(rng, 1, 9);
    const g = d === 1 ? 0 : 50 * R(rng, 1, 19);
    const v = kg * 1000 + g;
    return qNum(
      ctx, id, d,
      g ? L(`${kg} kg ${g} g = ? g`, `${kg} кг ${g} г = ? г`, `${kg} кг ${g} г = ? г`) : L(`${kg} kg = ? g`, `${kg} кг = ? г`, `${kg} кг = ? г`),
      [L('1 kg = 1000 g.', '1 кг = 1000 г.', '1 кг = 1000 г.'), same(g ? `${kg} ${TIMES} 1000 + ${g} = ${v}` : `${kg} ${TIMES} 1000 = ${v}`)],
      v, [why(kg * 100 + g, L('1 kg is 1000 g, not 100 g.', '1 кг - это 1000 г, а не 100 г.', '1 кг - 100 г емес, 1000 г.')), kg + g, v + 1000],
      { min: 1 },
    );
  };
  const toKg = () => {
    const kg = R(rng, 2, 15);
    return qNum(
      ctx, id, d,
      L(`${kg * 1000} g = ? kg`, `${kg * 1000} г = ? кг`, `${kg * 1000} г = ? кг`),
      [L('1 kg = 1000 g, so divide by 1000.', '1 кг = 1000 г, значит, делим на 1000.', '1 кг = 1000 г, демек 1000-ға бөлеміз.'), same(`${kg * 1000} ${DIV} 1000 = ${kg}`)],
      kg, [kg * 10, kg * 100, kg + 1],
      { min: 1 },
    );
  };
  const story = () => {
    const a = R(rng, 2, 25);
    const b = R(rng, 2, 25);
    const k = R(rng, 0, 2);
    if (k === 0) return qNum(ctx, id, d, L(`A bag of potatoes weighs ${a} kg, a bag of onions weighs ${b} kg. How much do they weigh together?`, `Мешок картофеля весит ${a} кг, мешок лука - ${b} кг. Сколько они весят вместе?`, `Бір қап картоп ${a} кг, бір қап пияз ${b} кг тартады. Екеуі бірге қанша тартады?`), [same(`${a} + ${b} = ${a + b}`), ans(a + b)], a + b, [Math.abs(a - b), a + b + 10, a * b], { min: 1 });
    if (k === 1) {
      const m = R(rng, 2, 6);
      return qNum(ctx, id, d, L(`One box of apples weighs ${a} kg. How much do ${m} such boxes weigh?`, `Один ящик яблок весит ${a} кг. Сколько весят ${ru(m, ['такой ящик', 'таких ящика', 'таких ящиков'])}?`, `Бір жәшік алма ${a} кг тартады. Осындай ${m} жәшік қанша тартады?`), [same(`${a} ${TIMES} ${m} = ${a * m}`)], a * m, [a + m, a * m + a, a * (m - 1)], { min: 1 });
    }
    const big = Math.max(a, b) + R(rng, 5, 20);
    return qNum(ctx, id, d, L(`A watermelon weighs ${big} kg and a melon weighs ${Math.min(a, b)} kg. How many kilograms heavier is the watermelon?`, `Арбуз весит ${big} кг, а дыня - ${Math.min(a, b)} кг. На сколько килограммов арбуз тяжелее?`, `Қарбыз ${big} кг, ал қауын ${Math.min(a, b)} кг тартады. Қарбыз неше килограмға ауыр?`), [L('"How much heavier" - subtract.', '«На сколько тяжелее» - вычитаем.', '«Қаншаға ауыр» - азайтамыз.'), same(`${big} ${MINUS} ${Math.min(a, b)} = ${big - Math.min(a, b)}`)], big - Math.min(a, b), [big + Math.min(a, b), big - Math.min(a, b) + 1, big], { min: 1 });
  };
  const compare = () => {
    const kg = R(rng, 1, 5);
    const g = kg * 1000 + one(rng, [-500, -200, -50, 0, 50, 200, 500, 300]);
    const sign = kg * 1000 > g ? '&gt;' : kg * 1000 < g ? '&lt;' : '=';
    return qText(
      ctx, id, d,
      L(`Compare: ${kg} kg ☐ ${g} g`, `Сравни: ${kg} кг ☐ ${g} г`, `Салыстыр: ${kg} кг ☐ ${g} г`),
      [L(`${kg} kg = ${kg * 1000} g.`, `${kg} кг = ${kg * 1000} г.`, `${kg} кг = ${kg * 1000} г.`), same(`${kg * 1000} ${sign} ${g}`)],
      sign, ['&gt;', '&lt;', '='].filter((s) => s !== sign),
    );
  };
  if (d === 1) return anyOf(rng, [toG, toKg, story]);
  return anyOf(rng, [toG, story, compare, toKg]);
}

// ---------- Время: год, месяц, сутки ----------

export function time3(ctx, d) {
  const { rng } = ctx;
  const id = 'm.time3';
  // [крупная единица: en, ru (формы), kk], [мелкая: en, ru, kk], сколько мелких в одной крупной, правило
  const RULES = [
    [['days', ['сутки', 'суток', 'суток'], 'тәулік'], ['h', 'ч', 'сағ'], 24, L('1 day = 24 hours', '1 сутки = 24 часа', '1 тәулік = 24 сағат')],
    [['years', ['год', 'года', 'лет'], 'жыл'], ['months', 'мес.', 'ай'], 12, L('1 year = 12 months', '1 год = 12 месяцев', '1 жыл = 12 ай')],
    [['weeks', ['неделя', 'недели', 'недель'], 'апта'], ['days', 'дн.', 'күн'], 7, L('1 week = 7 days', '1 неделя = 7 дней', '1 апта = 7 күн')],
    [['h', ['ч', 'ч', 'ч'], 'сағ'], ['min', 'мин', 'мин'], 60, L('1 hour = 60 minutes', '1 час = 60 минут', '1 сағат = 60 минут')],
    [['min', ['мин', 'мин', 'мин'], 'мин'], ['s', 'с', 'с'], 60, L('1 minute = 60 seconds', '1 минута = 60 секунд', '1 минут = 60 секунд')],
  ];
  const conv = () => {
    const [big, small, k, rule] = one(rng, RULES);
    const v = R(rng, 2, d === 1 ? 5 : 9);
    const extra = d === 1 ? 0 : R(rng, 0, k - 1);
    const total = v * k + extra;
    const bigText = [`${v} ${big[0]}`, ru(v, big[1]), `${v} ${big[2]}`];
    const p = (i) => (extra ? `${bigText[i]} ${extra} ${small[i]} = ? ${small[i]}` : `${bigText[i]} = ? ${small[i]}`);
    return qNum(
      ctx, id, d, L(p(0), p(1), p(2)),
      [rule, same(extra ? `${v} ${TIMES} ${k} + ${extra} = ${total}` : `${v} ${TIMES} ${k} = ${total}`)],
      total, [why(v * 100 + extra, L(`It is ${k} small units in one big unit, not 100.`, `В одной крупной единице ${k}, а не 100 мелких.`, `Бір үлкен бірлікте 100 емес, ${k} кіші бірлік бар.`)), v + extra, total + k],
      { min: 1 },
    );
  };
  const age = () => {
    const born = R(rng, 2010, 2020);
    const now = R(rng, 2024, 2030);
    return qNum(
      ctx, id, d,
      L(`Timur was born in ${born}. How old will he be in ${now}?`, `Тимур родился в ${born} году. Сколько лет ему исполнится в ${now} году?`, `Тимур ${born} жылы туған. ${now} жылы оған неше жас толады?`),
      [L('Subtract the year of birth from the current year.', 'Из текущего года вычтем год рождения.', 'Ағымдағы жылдан туған жылын азайтамыз.'), same(`${now} ${MINUS} ${born} = ${now - born}`)],
      now - born, [now - born + 1, now - born - 1, why(now + born, L('Subtract, do not add.', 'Нужно вычитать, а не складывать.', 'Қоспаймыз, азайтамыз.'))],
      { min: 1 },
    );
  };
  const century = () => {
    const c = R(rng, 2, 9);
    const k = R(rng, 0, 1);
    if (k === 0) return qNum(ctx, id, d, L(`How many years are in ${c} centuries?`, `Сколько лет в ${c} веках?`, `${c} ғасырда неше жыл бар?`), [L('1 century = 100 years.', '1 век = 100 лет.', '1 ғасыр = 100 жыл.'), same(`${c} ${TIMES} 100 = ${c * 100}`)], c * 100, [c * 10, c * 1000, c * 12], { min: 1 });
    const y = 100 * R(rng, 10, 20) + R(rng, 1, 99);
    const cent = Math.floor(y / 100) + 1;
    return qNum(ctx, id, d, L(`Which century does the year ${y} belong to?`, `К какому веку относится ${y} год?`, `${y} жыл қай ғасырға жатады?`), [L(`The years ${(cent - 1) * 100 + 1}-${cent * 100} make the ${cent}th century.`, `Годы ${(cent - 1) * 100 + 1}-${cent * 100} - это ${cent} век.`, `${(cent - 1) * 100 + 1}-${cent * 100} жылдар - ${cent} ғасыр.`), ans(cent)], cent, [why(cent - 1, L('Count centuries from 1: the years 1-100 are the 1st century.', 'Века считают с первого: годы 1-100 - это I век.', 'Ғасырларды біріншіден санайды: 1-100 жылдар - I ғасыр.')), cent + 1, Math.floor(y / 10)], { min: 1, spr: 0 });
  };
  const daysYear = () => {
    const leap = rng() < 0.5;
    const y = leap ? 4 * R(rng, 503, 507) : 4 * R(rng, 503, 507) + R(rng, 1, 3);
    return qNum(
      ctx, id, d,
      L(`How many days are there in the year ${y}?`, `Сколько дней в ${y} году?`, `${y} жылы неше күн бар?`),
      [L('A leap year (divisible by 4) has 366 days, other years have 365.', 'В високосном году (номер делится на 4) 366 дней, в остальных - 365.', 'Кібісе жылда (нөмірі 4-ке бөлінеді) 366 күн, басқа жылдарда 365 күн бар.'), ans(leap ? 366 : 365)],
      leap ? 366 : 365, [leap ? 365 : 366, 360, 12],
      { spr: 0, min: 1 },
    );
  };
  if (d === 1) return anyOf(rng, [conv, conv, age]);
  return anyOf(rng, [conv, age, century, daysYear]);
}

// ---------- Уравнения с умножением и делением ----------

export function eq3(ctx, d) {
  const { rng } = ctx;
  const id = 'm.eq3';
  const a = R(rng, 2, 9);
  const x = R(rng, 2, d === 1 ? 9 : 25);
  const k = R(rng, 0, 3);
  const check = (e) => L(`Check: ${e}.`, `Проверка: ${e}.`, `Тексеру: ${e}.`);
  if (k === 0 || (d === 1 && k === 3)) {
    const lhs = rng() < 0.5 ? `x ${TIMES} ${a}` : `${a} ${TIMES} x`;
    return qNum(ctx, id, d, solve(`${lhs} = ${a * x}`), [L('Unknown factor = product : known factor.', 'Неизвестный множитель = произведение : известный множитель.', 'Белгісіз көбейткіш = көбейтінді : белгілі көбейткіш.'), same(`x = ${a * x} ${DIV} ${a} = ${x}`), check(`${x} ${TIMES} ${a} = ${a * x}`)], x, [why(a * x * a, L('To find a factor, divide the product.', 'Чтобы найти множитель, произведение делят.', 'Көбейткішті табу үшін көбейтіндіні бөледі.')), a * x - a, x + 1], { min: 1 });
  }
  if (k === 1) return qNum(ctx, id, d, solve(`x ${DIV} ${a} = ${x}`), [L('Unknown dividend = quotient × divisor.', 'Неизвестное делимое = частное × делитель.', 'Белгісіз бөлінгіш = бөлінді × бөлгіш.'), same(`x = ${x} ${TIMES} ${a} = ${a * x}`), check(`${a * x} ${DIV} ${a} = ${x}`)], a * x, [why(x / a, L('To find the dividend, multiply.', 'Чтобы найти делимое, умножают.', 'Бөлінгішті табу үшін көбейтеді.')), x + a, a * x + a].filter(Number.isInteger), { min: 1 });
  if (k === 2) return qNum(ctx, id, d, solve(`${a * x} ${DIV} x = ${a}`), [L('Unknown divisor = dividend : quotient.', 'Неизвестный делитель = делимое : частное.', 'Белгісіз бөлгіш = бөлінгіш : бөлінді.'), same(`x = ${a * x} ${DIV} ${a} = ${x}`), check(`${a * x} ${DIV} ${x} = ${a}`)], x, [why(a * x * a, L('To find the divisor, divide the dividend by the quotient.', 'Чтобы найти делитель, делимое делят на частное.', 'Бөлгішті табу үшін бөлінгішті бөліндіге бөледі.')), x + 1, a], { min: 1 });
  const c = R(rng, 2, 30);
  return qNum(ctx, id, d, solve(`x ${TIMES} ${a} = ${a * x - c} + ${c}`), [L('First calculate the right side.', 'Сначала вычислим правую часть.', 'Алдымен оң жағын есептейміз.'), same(`x ${TIMES} ${a} = ${a * x}, x = ${a * x} ${DIV} ${a} = ${x}`)], x, [a * x, x + 1, x - 1], { min: 1 });
}

// ---------- Цена, количество, стоимость ----------

// [en ед., en мн., ru им. ед., ru формы после числа (вин. ед., 2-4, 5+), kk]
const GOODS3 = [
  ['notebook', 'notebooks', 'Тетрадь', ['тетрадь', 'тетради', 'тетрадей'], 'дәптер'],
  ['pen', 'pens', 'Ручка', ['ручку', 'ручки', 'ручек'], 'қалам'],
  ['book', 'books', 'Книга', ['книгу', 'книги', 'книг'], 'кітап'],
  ['ball', 'balls', 'Мяч', ['мяч', 'мяча', 'мячей'], 'доп'],
  ['album', 'albums', 'Альбом', ['альбом', 'альбома', 'альбомов'], 'альбом'],
  ['marker', 'markers', 'Маркер', ['маркер', 'маркера', 'маркеров'], 'маркер'],
];

export function price(ctx, d) {
  const { rng } = ctx;
  const id = 'm.price';
  const it = one(rng, GOODS3);
  const p = 10 * R(rng, 3, d === 1 ? 20 : 50);
  const m = R(rng, 2, Math.min(9, Math.floor(1000 / p)));
  const c = p * m;
  const k = R(rng, 0, d === 1 ? 2 : 3);
  const many = it[3][2];
  if (k === 0)
    return qNum(ctx, id, d, L(`One ${it[0]} costs ${TG(p).en}. How much do ${m} ${it[1]} cost?`, `${it[2]} стоит ${TG(p).ru}. Сколько стоят ${ru(m, it[3])}?`, `Бір ${it[4]} ${TG(p).kk} тұрады. ${m} ${it[4]} қанша тұрады?`), [L('Cost = price × quantity.', 'Стоимость = цена × количество.', 'Құн = баға × саны.'), same(`${p} ${TIMES} ${m} = ${n(c)}`)], c, [why(p + m, L('Multiply the price by the quantity.', 'Цену нужно умножить на количество.', 'Бағаны санына көбейту керек.')), c + p, c - p], { min: 1 });
  if (k === 1)
    return qNum(ctx, id, d, L(`${m} ${it[1]} cost ${TG(c).en}. What is the price of one?`, `За ${ru(m, it[3])} заплатили ${TG(c).ru}. Какова цена одной штуки?`, `${m} ${it[4]} үшін ${TG(c).kk} төленді. Біреуінің бағасы қанша?`), [L('Price = cost : quantity.', 'Цена = стоимость : количество.', 'Баға = құн : саны.'), same(`${n(c)} ${DIV} ${m} = ${p}`)], p, [why(c - m, L('Divide the cost by the quantity.', 'Стоимость нужно разделить на количество.', 'Құнды санына бөлу керек.')), p + 10, p * 10], { min: 1 });
  if (k === 2)
    return qNum(ctx, id, d, L(`One ${it[0]} costs ${TG(p).en}. How many ${it[1]} can you buy with ${TG(c).en}?`, `${it[2]} стоит ${TG(p).ru}. Сколько ${many} можно купить на ${TG(c).ru}?`, `Бір ${it[4]} ${TG(p).kk} тұрады. ${n(c)} теңгеге неше ${it[4]} сатып алуға болады?`), [L('Quantity = cost : price.', 'Количество = стоимость : цена.', 'Саны = құн : баға.'), same(`${n(c)} ${DIV} ${p} = ${m}`)], m, [m + 1, m - 1, m * 10], { min: 1 });
  const p2 = p + 10 * R(rng, 1, 5);
  return qNum(
    ctx, id, d,
    L(`They bought ${m} pens at ${TG(p).en} each and ${m} notebooks at ${TG(p2).en} each. How much more did the notebooks cost?`, `Купили ${ru(m, ['ручку', 'ручки', 'ручек'])} по ${p} тенге и ${ru(m, ['тетрадь', 'тетради', 'тетрадей'])} по ${p2} тенге. На сколько тенге тетради стоили дороже ручек?`, `${p} теңгеден ${m} қалам және ${p2} теңгеден ${m} дәптер сатып алды. Дәптерлер қаламдардан неше теңгеге қымбат?`),
    [L(`1) ${p2} ${TIMES} ${m} = ${p2 * m}, ${p} ${TIMES} ${m} = ${p * m}.`, `1) ${p2} ${TIMES} ${m} = ${p2 * m}, ${p} ${TIMES} ${m} = ${p * m}.`, `1) ${p2} ${TIMES} ${m} = ${p2 * m}, ${p} ${TIMES} ${m} = ${p * m}.`), same(`2) ${p2 * m} ${MINUS} ${p * m} = ${(p2 - p) * m}`)],
    (p2 - p) * m, [why(p2 - p, L('That is the difference for one item. Multiply by the quantity.', 'Это разница для одной штуки. Умножь на количество.', 'Бұл - бір данасының айырмасы. Санына көбейт.')), p2 * m, (p2 - p) * m + 10],
    { min: 1 },
  );
}

// ---------- Окружность и круг ----------

export function circle3(ctx, d) {
  const { rng } = ctx;
  const id = 'm.circle3';
  const r = R(rng, 2, d === 1 ? 12 : 45);
  const unit = one(rng, [['cm', 'см', 'см'], ['mm', 'мм', 'мм'], ['dm', 'дм', 'дм'], ['m', 'м', 'м']]);
  const k = R(rng, 0, d === 1 ? 2 : 3);
  if (k === 0)
    return qNum(ctx, id, d, L(`The radius of a circle is ${r} ${unit[0]}. Find its diameter.`, `Радиус окружности ${r} ${unit[1]}. Найди её диаметр.`, `Шеңбердің радиусы ${r} ${unit[2]}. Оның диаметрін тап.`), [L('The diameter is two radii.', 'Диаметр равен двум радиусам.', 'Диаметр екі радиусқа тең.'), same(`${r} ${TIMES} 2 = ${2 * r}`)], 2 * r, [why(r / 2, L('The diameter is bigger than the radius: multiply by 2.', 'Диаметр больше радиуса: умножаем на 2.', 'Диаметр радиустан үлкен: 2-ге көбейтеміз.')), r + 2, 4 * r].filter(Number.isInteger), { fig: circleSvg('r', `${r}`), min: 1 });
  if (k === 1)
    return qNum(ctx, id, d, L(`The diameter of a circle is ${2 * r} ${unit[0]}. Find its radius.`, `Диаметр окружности ${2 * r} ${unit[1]}. Найди её радиус.`, `Шеңбердің диаметрі ${2 * r} ${unit[2]}. Оның радиусын тап.`), [L('The radius is half the diameter.', 'Радиус - половина диаметра.', 'Радиус - диаметрдің жартысы.'), same(`${2 * r} ${DIV} 2 = ${r}`)], r, [why(4 * r, L('The radius is smaller than the diameter: divide by 2.', 'Радиус меньше диаметра: делим на 2.', 'Радиус диаметрден кіші: 2-ге бөлеміз.')), r + 2, 2 * r - 2], { fig: circleSvg('d', `${2 * r}`), min: 1 });
  if (k === 2) {
    const terms = [
      [L('radius', 'радиус', 'радиус'), L('A segment from the centre to a point on the circle is called a ...', 'Отрезок, соединяющий центр окружности с точкой на ней, называется ...', 'Шеңбердің центрін оның бойындағы нүктемен қосатын кесінді ... деп аталады.')],
      [L('diameter', 'диаметр', 'диаметр'), L('A segment through the centre joining two points of the circle is called a ...', 'Отрезок, проходящий через центр и соединяющий две точки окружности, называется ...', 'Центр арқылы өтіп, шеңбердің екі нүктесін қосатын кесінді ... деп аталады.')],
      [L('centre', 'центр', 'центр'), L('The point at the same distance from all points of a circle is its ...', 'Точка, одинаково удалённая от всех точек окружности, - это её ...', 'Шеңбердің барлық нүктелерінен бірдей қашықтықтағы нүкте - оның ...')],
      [L('compass', 'циркуль', 'циркуль'), L('A circle is drawn with a ...', 'Окружность чертят с помощью ...', 'Шеңберді ... көмегімен сызады.')],
    ];
    const [term, def] = one(rng, terms);
    const all = terms.map((x) => x[0]);
    // Вопросы о терминах добавляем к числовым, чтобы заданий было больше.
    if (rng() < 0.5) return circle3(ctx, d);
    return qText(ctx, id, d, def, [L('Remember the words: centre, radius, diameter (= 2 radii).', 'Запомним: центр, радиус, диаметр (= 2 радиуса).', 'Есте сақтаймыз: центр, радиус, диаметр (= 2 радиус).'), term], term, [...all.filter((x) => x !== term), L('chord', 'хорда', 'хорда')], { fig: circleSvg(rng() < 0.5 ? 'r' : 'd', '') });
  }
  const R2 = r + R(rng, 2, 9);
  return qNum(ctx, id, d, L(`Two circles have radii ${r} ${unit[0]} and ${R2} ${unit[0]}. By how much is the diameter of the bigger circle longer?`, `Радиусы двух окружностей ${r} ${unit[1]} и ${R2} ${unit[1]}. На сколько диаметр большей окружности больше диаметра меньшей?`, `Екі шеңбердің радиустары ${r} ${unit[2]} және ${R2} ${unit[2]}. Үлкен шеңбердің диаметрі кішісінен қаншаға артық?`), [same(`2 ${TIMES} ${R2} ${MINUS} 2 ${TIMES} ${r} = ${2 * R2} ${MINUS} ${2 * r} = ${2 * (R2 - r)}`)], 2 * (R2 - r), [why(R2 - r, L('That is the difference of the radii. Diameters are twice as long.', 'Это разница радиусов. Диаметры вдвое длиннее.', 'Бұл - радиустардың айырмасы. Диаметрлер екі есе ұзын.')), 2 * (R2 + r), 2 * (R2 - r) + 2], { min: 1 });
}
