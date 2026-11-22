// Математика 6 класса: действия с дробями, масштаб, окружность и круг, модуль, рациональные числа,
// координатная плоскость, раскрытие скобок, параллельные и перпендикулярные прямые,
// диаграммы, задачи на проценты, симметрия.

import { MINUS as M, fracHtml, simplify } from '../../core/format.js';
import { L, askFrac, dec, n, poolQ, same, steps, why } from '../gen.js';
import { DIV, MINUS, R, TIMES, anyOf, barsSvg, kkDat, one, pieSvg, planeSvg, qNum, qText, svg, txt } from './kit.js';

const calc = (e) => L(`Calculate: ${e}`, `Вычисли: ${e}`, `Есепте: ${e}`);
const ans = (v) => L(`Answer: ${v}.`, `Ответ: ${v}.`, `Жауабы: ${v}.`);
const fr = (a, b) => fracHtml(a, b);
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const lcm = (a, b) => (a / gcd(a, b)) * b;
const sg = (x) => (x < 0 ? `(${M}${Math.abs(x)})` : `${x}`);
const nm = (x) => (x < 0 ? `${M}${n(Math.abs(x))}` : n(x));

/** Задание с ответом-дробью. */
function qFrac(ctx, id, d, prompt, ex, answer, wrong) {
  let ok = wrong.filter((w) => {
    const v = w?.__why ? w.v : w;
    return v && Number.isFinite(v[0]) && Number.isFinite(v[1]) && v[1] !== 0;
  });
  // Варианты без тегов не должны совпадать: 1/12 и 11/2 на экране разные, а текстом - «112».
  const vis = (c) => String(c).replace(/<[^>]+>/g, '');
  const extra = [[answer[0] * 2, answer[1]], [answer[0], answer[1] * 2], [answer[0] + answer[1], answer[1]], [answer[0] * 3, answer[1] * 2]];
  for (let i = 0; ; i++) {
    const q = poolQ(id, d, { prompt, ex: steps(...ex), ...askFrac(ctx, answer, ok) });
    if (q.type !== 'mc' || new Set(q.choices.map(vis)).size === q.choices.length || i > 4) return q;
    const seen = new Map();
    for (const c of q.choices) seen.set(vis(c), (seen.get(vis(c)) ?? 0) + 1);
    const bad = new Set([...seen].filter(([, k]) => k > 1).map(([key]) => key));
    ok = [...ok.filter((w) => !bad.has(vis(fracHtml(...(w?.__why ? w.v : w))))), ...extra.slice(i)];
  }
}

// ---------- Сложение и вычитание дробей с разными знаменателями ----------

export function fracAdd(ctx, d) {
  const { rng } = ctx;
  const id = 'm.fracadd';
  let b1;
  let b2;
  if (d === 1) {
    b1 = R(rng, 2, 6);
    b2 = b1 * R(rng, 2, 3);
  } else {
    [b1, b2] = [R(rng, 2, 9), R(rng, 2, 12)];
    if (b1 === b2 || b2 % b1 === 0 || b1 % b2 === 0) [b1, b2] = [one(rng, [3, 4, 6, 8]), one(rng, [5, 9, 10, 12])];
  }
  if (rng() < 0.5) [b1, b2] = [b2, b1];
  let a1 = R(rng, 1, b1 - 1);
  let a2 = R(rng, 1, b2 - 1);
  const plus = rng() < 0.55 || a1 * b2 === a2 * b1;
  // При вычитании первая дробь больше второй.
  if (!plus && a1 * b2 < a2 * b1) [a1, b1, a2, b2] = [a2, b2, a1, b1];
  const L2 = lcm(b1, b2);
  const [x1, x2] = [a1 * (L2 / b1), a2 * (L2 / b2)];
  const top = plus ? x1 + x2 : x1 - x2;
  const res = simplify(top, L2);
  const w = d === 3 ? R(rng, 1, 4) : 0;
  const w2 = d === 3 ? R(rng, plus ? 1 : 0, plus ? 4 : w - 1) : 0;
  const lhs = d === 3 ? `${w}\u2009${fr(a1, b1)} ${plus ? '+' : MINUS} ${w2 ? `${w2}\u2009` : ''}${fr(a2, b2)}` : `${fr(a1, b1)} ${plus ? '+' : MINUS} ${fr(a2, b2)}`;
  const total = d === 3 ? [res[0] + (plus ? w + w2 : w - w2) * res[1], res[1]] : res;
  const T = simplify(total[0], total[1]);
  return qFrac(
    ctx, id, d,
    calc(lhs),
    [
      L(`Common denominator: LCM(${b1}, ${b2}) = ${L2}.`, `Общий знаменатель: НОК(${b1}, ${b2}) = ${L2}.`, `Ортақ бөлім: ЕКОЕ(${b1}, ${b2}) = ${L2}.`),
      same(`${fr(a1, b1)} = ${`<span class="frac"><span>${x1}</span><span>${L2}</span></span>`}, ${fr(a2, b2)} = ${`<span class="frac"><span>${x2}</span><span>${L2}</span></span>`}`),
      d === 3 ? L('Add (subtract) the whole parts separately, then combine.', 'Целые части складываем (вычитаем) отдельно, потом объединяем.', 'Бүтін бөліктерін бөлек қосып (азайтып), сосын біріктіреміз.') : null,
      same(`= ${fracHtml(T[0], T[1])}`),
    ],
    T,
    [why(d === 3 ? [plus ? a1 + a2 + (w + w2) * (b1 + b2) : a1 - a2 + (w - w2) * (b1 + b2), b1 + b2] : [plus ? a1 + a2 : a1 - a2, b1 + b2], L('Denominators are not added: bring the fractions to a common denominator.', 'Знаменатели не складывают: приведи дроби к общему знаменателю.', 'Бөлімдерді қоспайды: бөлшектерді ортақ бөлімге келтір.')), [T[0] + 1, T[1]], [T[0], T[1] + 1], [plus ? x1 - x2 : x1 + x2, L2]],
  );
}

// ---------- Умножение и деление дробей ----------

export function fracMul(ctx, d) {
  const { rng } = ctx;
  const id = 'm.fracmul';
  const b1 = R(rng, 2, 9);
  const b2 = R(rng, 2, 9);
  let a1 = R(rng, 1, d === 1 ? b1 - 1 || 1 : 12);
  let a2 = R(rng, 1, d === 1 ? b2 - 1 || 1 : 12);
  // Дроби в условии не должны сокращаться до целого числа.
  if (a1 % b1 === 0) a1 += 1;
  if (a2 % b2 === 0) a2 += 1;
  const k = R(rng, 0, d === 1 ? 2 : 3);
  if (k === 0) {
    const T = simplify(a1 * a2, b1 * b2);
    return qFrac(ctx, id, d, calc(`${fr(a1, b1)} ${TIMES} ${fr(a2, b2)}`), [L('Multiply numerators and denominators.', 'Числитель умножаем на числитель, знаменатель - на знаменатель.', 'Алымды алымға, бөлімді бөлімге көбейтеміз.'), same(`${fr(a1, b1)} ${TIMES} ${fr(a2, b2)} = <span class="frac"><span>${a1 * a2}</span><span>${b1 * b2}</span></span> = ${fracHtml(T[0], T[1])}`)], T, [why([a1 * b2, b1 * a2], L('That is division. For multiplication multiply straight across.', 'Это деление. При умножении перемножаем «прямо».', 'Бұл - бөлу. Көбейткенде тура көбейтеміз.')), [a1 + a2, b1 + b2], [a1 * a2, b1 + b2]]);
  }
  if (k === 1) {
    const T = simplify(a1 * b2, b1 * a2);
    return qFrac(ctx, id, d, calc(`${fr(a1, b1)} ${DIV} ${fr(a2, b2)}`), [L('To divide, multiply by the reciprocal of the second fraction.', 'Чтобы разделить, умножаем на дробь, обратную делителю.', 'Бөлу үшін бөлгішке кері бөлшекке көбейтеміз.'), same(`${fr(a1, b1)} ${TIMES} <span class="frac"><span>${b2}</span><span>${a2}</span></span> = ${fracHtml(T[0], T[1])}`)], T, [why([a1 * a2, b1 * b2], L('You multiplied instead of dividing. Flip the second fraction.', 'Ты умножил вместо деления. Переверни вторую дробь.', 'Бөлудің орнына көбейттің. Екінші бөлшекті төңкер.')), [b1 * a2, a1 * b2], [a1 * b2 + 1, b1 * a2]]);
  }
  if (k === 2) {
    const m = R(rng, 2, 9) * b1;
    const v = (m / b1) * a1;
    return qNum(ctx, id, d, L(`Find ${fr(a1, b1)} of ${m}.`, `Найди ${fr(a1, b1)} от числа ${m}.`, `${m} санының ${fr(a1, b1)} бөлігін тап.`), [L('To find a fraction of a number, multiply the number by the fraction.', 'Чтобы найти дробь от числа, умножаем число на эту дробь.', 'Санның бөлшегін табу үшін санды сол бөлшекке көбейтеміз.'), same(`${m} ${TIMES} ${fr(a1, b1)} = ${v}`)], v, [m / b1, m * a1, v + a1], { min: 0 });
  }
  const m = R(rng, 2, 9);
  const T = simplify(m * b2, a2);
  return qFrac(ctx, id, d, calc(`${m} ${DIV} ${fr(a2, b2)}`), [L('Multiply by the reciprocal fraction.', 'Умножаем на обратную дробь.', 'Кері бөлшекке көбейтеміз.'), same(`${m} ${TIMES} <span class="frac"><span>${b2}</span><span>${a2}</span></span> = ${fracHtml(T[0], T[1])}`)], T, [[m * a2, b2], [m, a2 * b2], [m * b2 + 1, a2]]);
}

// ---------- Масштаб ----------

export function scale(ctx, d) {
  const { rng } = ctx;
  const id = 'm.scale';
  const sc = one(rng, d === 1 ? [100, 1000, 10000, 100000] : [200, 500, 5000, 25000, 50000, 200000, 1000000]);
  const mapCm = R(rng, 2, 15) + (d === 3 ? one(rng, [0, 0.5]) : 0);
  const realCm = mapCm * sc;
  const toUnit = realCm >= 100000 ? ['km', 'км', 'км', 100000] : ['m', 'м', 'м', 100];
  const real = Math.round((realCm / toUnit[3]) * 1000) / 1000;
  const k = R(rng, 0, 2);
  const scaleTxt = `1 : ${n(sc)}`;
  if (k === 0)
    return qNum(
      ctx, id, d,
      L(`The scale of a map is ${scaleTxt}. The distance on the map is ${dec(mapCm).en} cm. What is the real distance in ${toUnit[0]}?`, `Масштаб карты ${scaleTxt}. Расстояние на карте ${dec(mapCm).ru} см. Каково расстояние на местности в ${toUnit[1]}?`, `Картаның масштабы ${scaleTxt}. Картадағы қашықтық ${dec(mapCm).kk} см. Жердегі қашықтық неше ${toUnit[2]}?`),
      [L(`1 cm on the map is ${n(sc)} cm on the ground.`, `1 см на карте - это ${n(sc)} см на местности.`, `Картадағы 1 см - жердегі ${n(sc)} см.`), loc((l) => `${dec(mapCm)[l]} ${TIMES} ${n(sc)} = ${n(realCm)} ${l === 'en' ? 'cm' : 'см'} = ${dec(real)[l]} ${toUnit[l === 'en' ? 0 : l === 'ru' ? 1 : 2]}`)],
      real, [why(Math.round((realCm / (toUnit[3] / 10)) * 100) / 100, L('Check the units: 1 m = 100 cm, 1 km = 100 000 cm.', 'Проверь единицы: 1 м = 100 см, 1 км = 100 000 см.', 'Бірліктерді тексер: 1 м = 100 см, 1 км = 100 000 см.')), Math.round(real * 10 * 1000) / 1000, Math.round((real / 10) * 1000) / 1000],
      { fmt: dec, min: 0 },
    );
  if (k === 1) {
    const realTxt = L(`${dec(real).en} ${toUnit[0]}`, `${dec(real).ru} ${toUnit[1]}`, `${dec(real).kk} ${toUnit[2]}`);
    return qNum(
      ctx, id, d,
      L(`The scale of a map is ${scaleTxt}. The real distance is ${realTxt.en}. How many centimetres is it on the map?`, `Масштаб карты ${scaleTxt}. Расстояние на местности ${realTxt.ru}. Сколько это сантиметров на карте?`, `Картаның масштабы ${scaleTxt}. Жердегі қашықтық ${realTxt.kk}. Картада бұл неше сантиметр?`),
      [L(`Change the real distance into centimetres: ${n(realCm)} cm, and divide by ${n(sc)}.`, `Переведём расстояние в сантиметры: ${n(realCm)} см - и разделим на ${n(sc)}.`, `Қашықтықты сантиметрге айналдырамыз: ${n(realCm)} см - және ${kkDat(sc)} бөлеміз.`), loc((l) => `${n(realCm)} ${DIV} ${n(sc)} = ${dec(mapCm)[l]}`)],
      mapCm, [Math.round(mapCm * 10 * 1000) / 1000, Math.round((mapCm / 10) * 1000) / 1000, mapCm + 1],
      { fmt: dec, min: 0 },
    );
  }
  return qText(
    ctx, id, d,
    L(`${n(mapCm)} cm on a map corresponds to ${dec(real).en} ${toUnit[0]} on the ground. What is the scale of the map?`, `${dec(mapCm).ru} см на карте соответствуют ${dec(real).ru} ${toUnit[1]} на местности. Каков масштаб карты?`, `Картадағы ${dec(mapCm).kk} см жердегі ${dec(real).kk} ${toUnit[2]} қашықтыққа сәйкес. Картаның масштабы қандай?`),
    [L(`Real distance in cm: ${n(realCm)}.`, `Расстояние в сантиметрах: ${n(realCm)}.`, `Сантиметрмен қашықтық: ${n(realCm)}.`), same(`${n(realCm)} ${DIV} ${n(mapCm)} = ${n(sc)} → ${scaleTxt}`)],
    same(scaleTxt), [same(`1 : ${n(sc * 10)}`), same(`1 : ${n(sc / 10)}`), same(`1 : ${n(Math.round(realCm))}`), same(`${n(sc)} : 1`)],
  );
}
const loc = (fn) => L(fn('en'), fn('ru'), fn('kk'));

// ---------- Длина окружности и площадь круга ----------

export function circle6(ctx, d) {
  const { rng } = ctx;
  const id = 'm.circle';
  const r = R(rng, 2, d === 1 ? 20 : 25);
  const k = R(rng, 0, 3);
  const pi = (v) => (v === 1 ? 'π' : `${v}π`);
  const r2 = (x) => Math.round(x * 1000) / 1000;
  if (k === 0)
    return qNum(ctx, id, d, L(`The radius of a circle is ${r} cm. Find its circumference (take π ≈ 3.14).`, `Радиус окружности ${r} см. Найди её длину (π ≈ 3,14).`, `Шеңбердің радиусы ${r} см. Оның ұзындығын тап (π ≈ 3,14).`), [same('C = 2πr'), loc((l) => `C = 2 ${TIMES} ${dec(3.14)[l]} ${TIMES} ${r} = ${dec(r2(6.28 * r))[l]}`)], r2(6.28 * r), [why(r2(3.14 * r), L('C = 2πr: do not forget the 2.', 'C = 2πr: не забудь множитель 2.', 'C = 2πr: 2 көбейткішін ұмытпа.')), why(r2(3.14 * r * r), L('That is the area of the circle.', 'Это площадь круга.', 'Бұл - дөңгелектің ауданы.')), r2(6.28 * r + 3.14)], { fmt: dec, min: 0 });
  if (k === 1)
    return qNum(ctx, id, d, L(`The radius of a circle is ${r} cm. Its area is <i>k</i>π cm². Find <i>k</i>.`, `Радиус круга ${r} см. Его площадь равна <i>k</i>π см². Найди <i>k</i>.`, `Дөңгелектің радиусы ${r} см. Оның ауданы <i>k</i>π см². <i>k</i>-ны тап.`), [same('S = πr²'), same(`S = π ${TIMES} ${r}² = ${pi(r * r)}`)], r * r, [why(2 * r, L('S = πr²: square the radius.', 'S = πr²: радиус нужно возвести в квадрат.', 'S = πr²: радиусты квадраттау керек.')), 4 * r * r, r * r + r], { min: 0 });
  if (k === 2) {
    const dd = 2 * r;
    return qNum(ctx, id, d, L(`The diameter of a wheel is ${dd} cm. How far does it roll in one turn? (π ≈ 3.14)`, `Диаметр колеса ${dd} см. Какое расстояние оно проезжает за один оборот? (π ≈ 3,14)`, `Дөңгелектің диаметрі ${dd} см. Ол бір айналымда қанша жол жүреді? (π ≈ 3,14)`), [same('C = πd'), loc((l) => `C = ${dec(3.14)[l]} ${TIMES} ${dd} = ${dec(r2(3.14 * dd))[l]}`)], r2(3.14 * dd), [r2(6.28 * dd), r2(3.14 * r), r2(3.14 * dd + 1)], { fmt: dec, min: 0 });
  }
  const c = 2 * r;
  return qNum(ctx, id, d, L(`The circumference of a circle is ${pi(c)} cm. Find its radius.`, `Длина окружности равна ${pi(c)} см. Найди её радиус.`, `Шеңбердің ұзындығы ${pi(c)} см. Оның радиусын тап.`), [same(`2πr = ${pi(c)}`), same(`r = ${c} ${DIV} 2 = ${r}`)], r, [c, r * r, r + 1], { min: 0 });
}

// ---------- Модуль числа ----------

export function modulus(ctx, d) {
  const { rng } = ctx;
  const id = 'm.modulus';
  const k = R(rng, 0, d === 1 ? 1 : 3);
  const a = R(rng, 1, d === 1 ? 30 : 99) * (rng() < 0.6 ? -1 : 1);
  const b = R(rng, 1, d === 1 ? 30 : 99) * (rng() < 0.5 ? -1 : 1);
  const rule = L('The modulus |a| is the distance from 0 to a: it is never negative.', 'Модуль |a| - расстояние от 0 до числа a: он не бывает отрицательным.', '|a| модулі - 0-ден a санына дейінгі қашықтық: ол теріс болмайды.');
  if (k === 0) return qNum(ctx, id, d, calc(`|${nm(a)}|`), [rule, same(`|${nm(a)}| = ${Math.abs(a)}`)], Math.abs(a), [why(-Math.abs(a), L('A modulus cannot be negative.', 'Модуль не может быть отрицательным.', 'Модуль теріс бола алмайды.')), Math.abs(a) + 1, 0], { min: -999 });
  if (k === 1) {
    const op = rng() < 0.5;
    const v = op ? Math.abs(a) + Math.abs(b) : Math.abs(a) * Math.abs(b) <= 999 && d > 1 ? Math.abs(a) * Math.abs(b) : Math.abs(a) - Math.abs(b);
    const sym = op ? '+' : d > 1 && Math.abs(a) * Math.abs(b) <= 999 ? TIMES : MINUS;
    return qNum(ctx, id, d, calc(`|${nm(a)}| ${sym} |${nm(b)}|`), [rule, same(`${Math.abs(a)} ${sym} ${Math.abs(b)} = ${nm(v)}`)], v, [why(op ? a + b : sym === TIMES ? a * b : a - b, L('First take the moduli, then calculate.', 'Сначала найди модули, потом вычисляй.', 'Алдымен модульдерді тап, сосын есепте.')), v + 1, -v], { min: -9999 });
  }
  if (k === 2) {
    const v = Math.abs(a);
    return qText(ctx, id, d, L(`Solve the equation |x| = ${v}.`, `Реши уравнение |x| = ${v}.`, `|x| = ${v} теңдеуін шеш.`), [L(`Two numbers are at distance ${v} from 0: ${v} and ${M}${v}.`, `На расстоянии ${v} от 0 находятся два числа: ${v} и ${M}${v}.`, `0-ден ${v} қашықтықта екі сан бар: ${v} және ${M}${v}.`)], loc((l) => `x = ${v} ${{ en: 'or', ru: 'или', kk: 'немесе' }[l]} x = ${M}${v}`), [same(`x = ${v}`), same(`x = ${M}${v}`), loc((l) => ({ en: 'no solutions', ru: 'нет решений', kk: 'шешімі жоқ' })[l])]);
  }
  const [x, y] = [a, b === a ? -a : b];
  const sign = Math.abs(x) > Math.abs(y) ? '&gt;' : Math.abs(x) < Math.abs(y) ? '&lt;' : '=';
  return qText(ctx, id, d, L(`Compare: |${nm(x)}| ☐ |${nm(y)}|`, `Сравни: |${nm(x)}| ☐ |${nm(y)}|`, `Салыстыр: |${nm(x)}| ☐ |${nm(y)}|`), [rule, same(`${Math.abs(x)} ${sign} ${Math.abs(y)}`)], same(sign), ['&gt;', '&lt;', '='].filter((s) => s !== sign).map(same));
}

// ---------- Действия с рациональными числами ----------

export function rational(ctx, d) {
  const { rng } = ctx;
  const id = 'm.rational';
  const r1 = (x) => Math.round(x * 100) / 100;
  const k = R(rng, 0, d === 1 ? 1 : 3);
  const a = r1(R(rng, -99, 99) / 10) || 1.5;
  const b = r1(R(rng, -99, 99) / 10) || -2.5;
  const D = (x) => (x < 0 ? loc((l) => `(${dec(x)[l]})`) : dec(x));
  if (k === 0) {
    const plus = rng() < 0.5;
    const v = r1(plus ? a + b : a - b);
    return qNum(ctx, id, d, loc((l) => `${{ en: 'Calculate', ru: 'Вычисли', kk: 'Есепте' }[l]}: ${dec(a)[l]} ${plus ? '+' : MINUS} ${D(b)[l]}`), [plus ? L('Same signs - add the moduli; different signs - subtract the smaller modulus from the bigger and take the sign of the bigger.', 'Одинаковые знаки - складываем модули; разные - из большего модуля вычитаем меньший и ставим знак большего.', 'Таңбалары бірдей - модульдерді қосамыз; әртүрлі - үлкен модульден кішісін азайтып, үлкенінің таңбасын қоямыз.') : L('Subtracting a number = adding its opposite.', 'Вычесть число - то же, что прибавить противоположное.', 'Санды азайту - оған қарама-қарсы санды қосумен бірдей.'), loc((l) => `= ${dec(v)[l]}`)], v, [why(r1(-v), L('Check the sign of the answer.', 'Проверь знак ответа.', 'Жауаптың таңбасын тексер.')), r1(plus ? a - b : a + b), r1(v + 1)], { fmt: dec, min: -999 });
  }
  if (k === 1) {
    const x = R(rng, -12, 12) || 3;
    const y = R(rng, -12, 12) || -4;
    const mul = rng() < 0.5;
    if (mul) return qNum(ctx, id, d, calc(`${nm(x)} ${TIMES} ${sg(y)}`), [L('Same signs give plus, different signs give minus.', 'Одинаковые знаки дают плюс, разные - минус.', 'Таңбалары бірдей болса - плюс, әртүрлі болса - минус.'), same(`= ${nm(x * y)}`)], x * y, [why(-x * y, L('Check the sign: minus times minus is plus.', 'Проверь знак: минус на минус даёт плюс.', 'Таңбаны тексер: минусты минусқа көбейтсе - плюс.')), x + y, x * y + 1], { min: -999 });
    const p = x * y;
    return qNum(ctx, id, d, calc(`${nm(p)} ${DIV} ${sg(y)}`), [L('Same signs give plus, different signs give minus.', 'Одинаковые знаки дают плюс, разные - минус.', 'Таңбалары бірдей болса - плюс, әртүрлі болса - минус.'), same(`= ${nm(x)}`)], x, [why(-x, L('Check the sign of the quotient.', 'Проверь знак частного.', 'Бөліндінің таңбасын тексер.')), p - y, x + 1], { min: -999 });
  }
  if (k === 2) {
    const b1 = R(rng, 2, 9);
    const a1 = -R(rng, 1, b1 - 1);
    const b2 = R(rng, 2, 9);
    const a2 = R(rng, 1, b2 - 1);
    const T = simplify(a1 * b2 + a2 * b1, b1 * b2);
    return qFrac(ctx, id, d, calc(`${fracHtml(a1, b1)} + ${fracHtml(a2, b2)}`), [L('Bring to a common denominator and add, keeping the signs.', 'Приводим к общему знаменателю и складываем с учётом знаков.', 'Ортақ бөлімге келтіріп, таңбаларын ескеріп қосамыз.'), same(`= ${fracHtml(a1 * b2 + a2 * b1, b1 * b2)} = ${fracHtml(T[0], T[1])}`)], T, [why([-T[0], T[1]], L('Check the sign.', 'Проверь знак.', 'Таңбаны тексер.')), [a1 + a2, b1 + b2], [-a1 * b2 + a2 * b1, b1 * b2]]);
  }
  const x = R(rng, -9, 9) || 2;
  const y = R(rng, 2, 6);
  const z = R(rng, -20, 20);
  const v = x * y + z;
  return qNum(ctx, id, d, calc(`${nm(x)} ${TIMES} ${y} + ${sg(z)}`), [L('Multiply first, then add.', 'Сначала умножение, потом сложение.', 'Алдымен көбейту, сосын қосу.'), same(`${nm(x * y)} + ${sg(z)} = ${nm(v)}`)], v, [x * (y + z), -v, v + y], { min: -999 });
}

// ---------- Координатная плоскость ----------

const QUAD = [L('I', 'I', 'I'), L('II', 'II', 'II'), L('III', 'III', 'III'), L('IV', 'IV', 'IV')];

export function coord(ctx, d) {
  const { rng } = ctx;
  const id = 'm.coord';
  const p = () => [R(rng, -6, 6) || 1, R(rng, -6, 6) || -1];
  const fmt = ([x, y]) => `(${nm(x)}; ${nm(y)})`;
  const read = () => {
    const P = p();
    const lab = one(rng, ['A', 'B', 'C', 'M', 'K']);
    return qText(ctx, id, d, L(`What are the coordinates of point ${lab}?`, `Каковы координаты точки ${lab}?`, `${lab} нүктесінің координаталары қандай?`), [L('First x (along the horizontal axis), then y (along the vertical axis).', 'Сначала x (по горизонтальной оси), потом y (по вертикальной).', 'Алдымен x (көлденең ось бойынша), сосын y (тік ось бойынша).'), same(`${lab}${fmt(P)}`)], same(fmt(P)), [same(fmt([P[1], P[0]])), same(fmt([-P[0], P[1]])), same(fmt([P[0], -P[1]])), same(fmt([-P[0], -P[1]]))], { fig: planeSvg({ [lab]: P }) });
  };
  const quad = () => {
    const x = (R(rng, 1, 40) * (rng() < 0.5 ? -1 : 1));
    const y = (R(rng, 1, 40) * (rng() < 0.5 ? -1 : 1));
    const q = x > 0 ? (y > 0 ? 0 : 3) : y > 0 ? 1 : 2;
    return qText(ctx, id, d, L(`In which quadrant is the point (${nm(x)}; ${nm(y)})?`, `В какой координатной четверти лежит точка (${nm(x)}; ${nm(y)})?`, `(${nm(x)}; ${nm(y)}) нүктесі қай координаталық ширекте жатыр?`), [L('I: (+; +), II: (−; +), III: (−; −), IV: (+; −).', 'I: (+; +), II: (−; +), III: (−; −), IV: (+; −).', 'I: (+; +), II: (−; +), III: (−; −), IV: (+; −).')], QUAD[q], QUAD.filter((_, i) => i !== q));
  };
  const axis = () => {
    const onX = rng() < 0.5;
    const v = R(rng, -9, 9) || 4;
    const P = onX ? [v, 0] : [0, v];
    const correct = onX ? L('on the x-axis', 'на оси абсцисс (Ox)', 'абсцисса осінде (Ox)') : L('on the y-axis', 'на оси ординат (Oy)', 'ордината осінде (Oy)');
    return qText(ctx, id, d, L(`Where does the point ${fmt(P)} lie?`, `Где лежит точка ${fmt(P)}?`, `${fmt(P)} нүктесі қайда жатыр?`), [L('If y = 0, the point is on the x-axis; if x = 0, it is on the y-axis.', 'Если y = 0, точка на оси Ox; если x = 0 - на оси Oy.', 'y = 0 болса, нүкте Ox осінде; x = 0 болса - Oy осінде.')], correct, [onX ? L('on the y-axis', 'на оси ординат (Oy)', 'ордината осінде (Oy)') : L('on the x-axis', 'на оси абсцисс (Ox)', 'абсцисса осінде (Ox)'), L('in quadrant I', 'в I четверти', 'I ширекте'), L('at the origin', 'в начале координат', 'координаталар басында')]);
  };
  const dist = () => {
    const x = R(rng, -5, 5);
    const y1 = R(rng, -6, 6);
    let y2 = R(rng, -6, 6);
    while (y2 === y1) y2 = R(rng, -6, 6);
    const same_x = rng() < 0.5;
    const A = same_x ? [x, y1] : [y1, x];
    const B = same_x ? [x, y2] : [y2, x];
    const v = Math.abs(y1 - y2);
    return qNum(ctx, id, d, L(`Find the length of segment AB if A${fmt(A)} and B${fmt(B)}.`, `Найди длину отрезка AB, если A${fmt(A)}, B${fmt(B)}.`, `A${fmt(A)}, B${fmt(B)} болса, AB кесіндісінің ұзындығын тап.`), [same_x ? L('The x-coordinates are equal: the segment is vertical.', 'Абсциссы равны: отрезок вертикальный.', 'Абсциссалары тең: кесінді тік.') : L('The y-coordinates are equal: the segment is horizontal.', 'Ординаты равны: отрезок горизонтальный.', 'Ординаталары тең: кесінді көлденең.'), same(`|${nm(y1)} ${MINUS} ${sg(y2)}| = ${v}`)], v, [Math.abs(y1 + y2) === v ? v + 2 : Math.abs(y1 + y2), v + 1, Math.abs(x)].filter((t) => t !== v), { fig: planeSvg({ A, B }), min: 0 });
  };
  if (d === 1) return anyOf(rng, [read, read, quad]);
  return anyOf(rng, [read, quad, axis, dist]);
}

// ---------- Раскрытие скобок и подобные слагаемые ----------

const term = (c, v, first = false) => {
  const abs = Math.abs(c);
  const body = v ? `${abs === 1 ? '' : abs}${v}` : `${abs}`;
  if (first) return c < 0 ? `${M}${body}` : body;
  return `${c < 0 ? MINUS : '+'} ${body}`;
};
const expr = (parts) => parts.filter(([c]) => c !== 0).map(([c, v], i) => term(c, v, i === 0)).join(' ') || '0';

export function brackets(ctx, d) {
  const { rng } = ctx;
  const id = 'm.brackets';
  const v = one(rng, ['x', 'a', 'y', 'b', 'm']);
  const nz = (lo, hi) => {
    let t = 0;
    while (t === 0) t = R(rng, lo, hi);
    return t;
  };
  const k = R(rng, 0, d === 1 ? 1 : 3);
  if (k === 0) {
    const m = nz(d === 1 ? 2 : -9, 9);
    const p = nz(-9, 9);
    const right = expr([[m, v], [m * p, '']]);
    return qText(ctx, id, d, L(`Expand the brackets: ${nm(m)}(${v} ${term(p, '')})`, `Раскрой скобки: ${nm(m)}(${v} ${term(p, '')})`, `Жақшаны аш: ${nm(m)}(${v} ${term(p, '')})`), [L('Multiply the factor by every term in the brackets.', 'Множитель умножаем на каждое слагаемое в скобках.', 'Көбейткішті жақшадағы әр қосылғышқа көбейтеміз.'), same(right)], same(right), [same(expr([[m, v], [p, '']])), same(expr([[m, v], [-m * p, '']])), same(expr([[-m, v], [m * p, '']])), same(expr([[m + p, v]]))]);
  }
  if (k === 1) {
    const a = nz(1, 15);
    const b = nz(-15, 15);
    const sign = rng() < 0.5 ? 1 : -1;
    const inside = expr([[a, v], [b, '']]);
    const right = expr([[sign * a, v], [sign * b, '']]);
    return qText(ctx, id, d, L(`Expand the brackets: ${sign < 0 ? M : '+'}(${inside})`, `Раскрой скобки: ${sign < 0 ? M : '+'}(${inside})`, `Жақшаны аш: ${sign < 0 ? M : '+'}(${inside})`), [sign < 0 ? L('A minus before the brackets changes the sign of every term inside.', 'Минус перед скобками меняет знак каждого слагаемого в скобках.', 'Жақша алдындағы минус ішіндегі әр қосылғыштың таңбасын өзгертеді.') : L('A plus before the brackets keeps the signs.', 'Плюс перед скобками знаков не меняет.', 'Жақша алдындағы плюс таңбаларды өзгертпейді.'), same(right)], same(right), [same(expr([[sign * a, v], [-sign * b, '']])), same(expr([[-sign * a, v], [sign * b, '']])), same(expr([[-sign * a, v], [-sign * b, '']])), same(expr([[sign * (a + b), v]]))]);
  }
  if (k === 2) {
    const [p, q, r, s] = [nz(-9, 12), nz(-15, 15), nz(-9, 12), nz(-15, 15)];
    const right = expr([[p + r, v], [q + s, '']]);
    if (p + r === 0) return brackets(ctx, d);
    return qText(ctx, id, d, L(`Combine like terms: ${expr([[p, v], [q, ''], [r, v], [s, '']])}`, `Приведи подобные слагаемые: ${expr([[p, v], [q, ''], [r, v], [s, '']])}`, `Ұқсас қосылғыштарды біріктір: ${expr([[p, v], [q, ''], [r, v], [s, '']])}`), [L(`Letters with letters: ${nm(p)} + ${sg(r)} = ${nm(p + r)}; numbers with numbers: ${nm(q)} + ${sg(s)} = ${nm(q + s)}.`, `Буквенные с буквенными: ${nm(p)} + ${sg(r)} = ${nm(p + r)}; числа с числами: ${nm(q)} + ${sg(s)} = ${nm(q + s)}.`, `Әріптілерді әріптілермен: ${nm(p)} + ${sg(r)} = ${nm(p + r)}; сандарды сандармен: ${nm(q)} + ${sg(s)} = ${nm(q + s)}.`), same(right)], same(right), [same(expr([[p + r + q + s, v]])), same(expr([[p - r, v], [q + s, '']])), same(expr([[p + r, v], [q - s, '']])), same(expr([[p + r, v], [-(q + s), '']]))]);
  }
  const m = nz(2, 6);
  const p = nz(-9, 9);
  const c = nz(-9, 9);
  const x = nz(-5, 5);
  const val = m * (x + p) + c * x;
  return qNum(ctx, id, d, L(`Simplify and find the value for ${v} = ${nm(x)}: ${m}(${v} ${term(p, '')}) ${term(c, v)}`, `Упрости выражение и найди его значение при ${v} = ${nm(x)}: ${m}(${v} ${term(p, '')}) ${term(c, v)}`, `Өрнекті ықшамдап, ${v} = ${nm(x)} болғандағы мәнін тап: ${m}(${v} ${term(p, '')}) ${term(c, v)}`), [same(`${m}(${v} ${term(p, '')}) ${term(c, v)} = ${expr([[m + c, v], [m * p, '']])}`), same(`${m + c} ${TIMES} ${sg(x)} ${term(m * p, '')} = ${nm(val)}`)], val, [m * x + p + c * x, -val, val + m], { min: -9999 });
}

// ---------- Параллельные и перпендикулярные прямые ----------

function linesFig(rng, angles, labels) {
  const parts = [];
  const centers = [[90, 70], [170, 100], [130, 60], [120, 120]];
  angles.forEach((a, i) => {
    const t = (a * Math.PI) / 180;
    const [cx, cy] = centers[i];
    const dx = Math.cos(t) * 160;
    const dy = -Math.sin(t) * 160;
    parts.push(`<line x1="${Math.round(cx - dx)}" y1="${Math.round(cy - dy)}" x2="${Math.round(cx + dx)}" y2="${Math.round(cy + dy)}" stroke="${['currentColor', 'var(--primary)', 'var(--accent)', 'var(--orange, #f97316)'][i]}" stroke-width="2.5"/>`);
    // Подписи разносим к разным концам прямых, чтобы они не слипались.
    const dir = i % 2 ? -1 : 1;
    const lx = Math.max(12, Math.min(248, cx + dir * Math.cos(t) * 100 + Math.sin(t) * 12));
    const ly = Math.max(16, Math.min(162, cy - dir * Math.sin(t) * 100 + Math.cos(t) * 12));
    parts.push(txt(lx, ly, labels[i], { cls: 'geo-v' }));
  });
  return svg(260, 170, parts.join(''));
}

export function lines(ctx, d) {
  const { rng } = ctx;
  const id = 'm.lines';
  const th = 5 * R(rng, 0, 35);
  const names = ['a', 'b', 'c', 'd'].sort(() => rng() - 0.5);
  // 0, 1 - параллельные; 2 - перпендикулярная к ним; 3 - «случайная».
  const angles = [th, th, th + 90, th + one(rng, [35, 45, 55, -35, -45, -55])];
  const par = () =>
    qText(ctx, id, d, L('Which lines are parallel?', 'Какие прямые параллельны?', 'Қай түзулер параллель?'), [L('Parallel lines go in the same direction and never meet.', 'Параллельные прямые идут в одном направлении и не пересекаются.', 'Параллель түзулер бір бағытта өтеді және қиылыспайды.'), same(`${names[0]} ∥ ${names[1]}`)], same(`${names[0]} ∥ ${names[1]}`), [same(`${names[0]} ∥ ${names[2]}`), same(`${names[1]} ∥ ${names[3]}`), same(`${names[2]} ∥ ${names[3]}`), same(`${names[0]} ∥ ${names[3]}`)], { fig: linesFig(rng, angles, names) });
  const perp = () => {
    const ref = R(rng, 0, 1);
    return qText(ctx, id, d, L(`Which line is perpendicular to line ${names[ref]}?`, `Какая прямая перпендикулярна прямой ${names[ref]}?`, `Қай түзу ${names[ref]} түзуіне перпендикуляр?`), [L('Perpendicular lines meet at a right angle (90°).', 'Перпендикулярные прямые пересекаются под прямым углом (90°).', 'Перпендикуляр түзулер тік бұрышпен (90°) қиылысады.'), same(`${names[2]} ⊥ ${names[ref]}`)], same(names[2]), [same(names[1 - ref]), same(names[3]), L('none', 'никакая', 'ешқайсысы')], { fig: linesFig(rng, angles, names) });
  };
  const facts = () => {
    const kind = R(rng, 0, 2);
    if (kind === 0)
      return qText(ctx, id, d, L('Lines a and b are both perpendicular to line c. How are a and b placed?', 'Прямые a и b перпендикулярны прямой c. Как расположены прямые a и b?', 'a және b түзулері c түзуіне перпендикуляр. a мен b түзулері қалай орналасқан?'), [L('Two lines perpendicular to the same line are parallel.', 'Две прямые, перпендикулярные третьей, параллельны.', 'Үшінші түзуге перпендикуляр екі түзу параллель.')], L('parallel', 'параллельны', 'параллель'), [L('perpendicular', 'перпендикулярны', 'перпендикуляр'), L('they meet at 45°', 'пересекаются под углом 45°', '45° бұрышпен қиылысады'), L('they coincide', 'совпадают', 'беттеседі')]);
    if (kind === 1)
      return qText(ctx, id, d, L('Line a is parallel to b, and line c is perpendicular to a. How are c and b placed?', 'Прямая a параллельна b, а прямая c перпендикулярна a. Как расположены c и b?', 'a түзуі b-ға параллель, ал c түзуі a-ға перпендикуляр. c мен b қалай орналасқан?'), [L('A line perpendicular to one of two parallel lines is perpendicular to the other.', 'Прямая, перпендикулярная одной из параллельных прямых, перпендикулярна и другой.', 'Параллель түзулердің біріне перпендикуляр түзу екіншісіне де перпендикуляр.')], L('perpendicular', 'перпендикулярны', 'перпендикуляр'), [L('parallel', 'параллельны', 'параллель'), L('they do not meet', 'не пересекаются', 'қиылыспайды'), L('they meet at 60°', 'пересекаются под углом 60°', '60° бұрышпен қиылысады')]);
    const a = 5 * R(rng, 3, 17);
    return qNum(ctx, id, d, L(`Two perpendicular lines form four angles. One of them is split by a ray into ${a}° and x°. Find x.`, `Две перпендикулярные прямые образуют четыре угла. Один из них луч делит на ${a}° и x°. Найди x.`, `Екі перпендикуляр түзу төрт бұрыш құрайды. Олардың бірін сәуле ${a}° және x° бұрыштарына бөледі. x-ті тап.`), [L('All four angles are right: 90°.', 'Все четыре угла прямые - по 90°.', 'Төрт бұрыштың бәрі тік - 90°-тан.'), same(`x = 90° ${MINUS} ${a}° = ${90 - a}°`)], 90 - a, [180 - a, 90 + a, a], { min: 0 });
  };
  if (d === 1) return anyOf(rng, [par, perp]);
  return anyOf(rng, [par, perp, facts]);
}

// ---------- Диаграммы: столбчатые и круговые ----------

const PIES = [
  [50, 25, 25],
  [40, 30, 20, 10],
  [50, 30, 20],
  [25, 25, 50],
  [60, 25, 15],
  [45, 35, 20],
  [30, 30, 40],
  [10, 20, 30, 40],
  [35, 25, 25, 15],
  [70, 20, 10],
];

export function diagram(ctx, d) {
  const { rng } = ctx;
  const id = 'm.diagram';
  const pieQ = () => {
    const ps = one(rng, PIES);
    const labels = ['A', 'B', 'C', 'D'].slice(0, ps.length);
    const total = one(rng, [200, 400, 500, 600, 800, 1000, 1200, 300, 40, 60, 80]);
    const i = R(rng, 0, ps.length - 1);
    const v = (total * ps[i]) / 100;
    if (!Number.isInteger(v)) return pieQ();
    const fig = pieSvg(ps.map((p) => p / 100), ps.map((p, j) => `${labels[j]} ${p}%`));
    if (d >= 2 && rng() < 0.5) {
      let j = R(rng, 0, ps.length - 1);
      while (j === i) j = R(rng, 0, ps.length - 1);
      const w = (total * ps[j]) / 100;
      if (!Number.isInteger(w) || v === w) return pieQ();
      return qNum(ctx, id, d, L(`${total} pupils chose one of the clubs A-${labels.at(-1)}. How many more pupils chose club ${labels[Math.max(v, w) === v ? i : j]} than club ${labels[Math.max(v, w) === v ? j : i]}?`, `${total} учеников выбрали один из кружков A-${labels.at(-1)}. На сколько больше учеников выбрали кружок ${labels[Math.max(v, w) === v ? i : j]}, чем кружок ${labels[Math.max(v, w) === v ? j : i]}?`, `${total} оқушы A-${labels.at(-1)} үйірмелерінің бірін таңдады. ${labels[Math.max(v, w) === v ? i : j]} үйірмесін ${labels[Math.max(v, w) === v ? j : i]} үйірмесінен неше оқушыға көп таңдады?`), [L(`${ps[i]}% of ${total} = ${v}; ${ps[j]}% of ${total} = ${w}.`, `${ps[i]}% от ${total} = ${v}; ${ps[j]}% от ${total} = ${w}.`, `${total}-дің ${ps[i]}%-ы = ${v}; ${ps[j]}%-ы = ${w}.`), same(`${Math.max(v, w)} ${MINUS} ${Math.min(v, w)} = ${Math.abs(v - w)}`)], Math.abs(v - w), [Math.abs(ps[i] - ps[j]), v + w, Math.abs(v - w) + 10], { fig, min: 0 });
    }
    return qNum(ctx, id, d, L(`${total} pupils chose one of the clubs A-${labels.at(-1)}. How many pupils chose club ${labels[i]}?`, `${total} учеников выбрали один из кружков A-${labels.at(-1)}. Сколько учеников выбрали кружок ${labels[i]}?`, `${total} оқушы A-${labels.at(-1)} үйірмелерінің бірін таңдады. ${labels[i]} үйірмесін неше оқушы таңдады?`), [L(`Find ${ps[i]}% of ${total}.`, `Найдём ${ps[i]}% от ${total}.`, `${total}-дің ${ps[i]}%-ын табамыз.`), same(`${total} ${TIMES} ${ps[i]} ${DIV} 100 = ${v}`)], v, [why(ps[i], L('That is the percentage. Find this percentage of the total.', 'Это процент. Найди этот процент от общего числа.', 'Бұл - пайыз. Жалпы санның осы пайызын тап.')), total - v, v * 2], { fig, min: 0 });
  };
  const barQ = () => {
    const labels = ['A', 'B', 'C', 'D', 'E'];
    const top = one(rng, [50, 100, 200]);
    const step = top / 10;
    const vals = labels.map(() => step * R(rng, 1, 10));
    const total = vals.reduce((s, x) => s + x, 0);
    const i = R(rng, 0, 4);
    const mean = total / 5;
    if (d >= 2 && Number.isInteger(mean) && rng() < 0.5)
      return qNum(ctx, id, d, L('The chart shows the sales of five shops A-E. Find the average (mean) value.', 'На диаграмме - продажи пяти магазинов A-E. Найди среднее значение.', 'Диаграммада A-E бес дүкеннің сатылымы көрсетілген. Орта мәнін тап.'), [same(`(${vals.join(' + ')}) ${DIV} 5 = ${total} ${DIV} 5 = ${mean}`)], mean, [total, Math.max(...vals), mean + step], { fig: barsSvg(labels, vals, top), min: 0 });
    return qNum(ctx, id, d, L(`The chart shows the sales of five shops A-E. How much did shop ${labels[i]} sell?`, `На диаграмме - продажи пяти магазинов A-E. Сколько продал магазин ${labels[i]}?`, `Диаграммада A-E бес дүкеннің сатылымы көрсетілген. ${labels[i]} дүкені қанша сатты?`), [L('Read the height of the bar on the scale.', 'Читаем высоту столбика по шкале.', 'Бағанның биіктігін шкаладан оқимыз.'), ans(vals[i])], vals[i], [vals[i] + step, vals[i] - step, vals[(i + 1) % 5]], { fig: barsSvg(labels, vals, top), min: 0 });
  };
  if (d === 1) return anyOf(rng, [pieQ, barQ]);
  return anyOf(rng, [pieQ, pieQ, barQ]);
}

// ---------- Задачи на проценты ----------

export function pctTask(ctx, d) {
  const { rng } = ctx;
  const id = 'm.pcttask';
  const p = one(rng, d === 1 ? [10, 20, 25, 50, 75] : [5, 10, 12, 15, 20, 25, 30, 35, 40, 60, 75, 80]);
  const base = one(rng, [40, 60, 80, 120, 200, 240, 300, 400, 500, 600, 800, 1200, 1500, 2000, 2400]);
  const part = (base * p) / 100;
  if (!Number.isInteger(part)) return pctTask(ctx, d);
  const k = R(rng, 0, d === 1 ? 2 : 4);
  if (k === 0) return qNum(ctx, id, d, L(`A class has ${base} tickets; ${p}% of them are sold. How many tickets are sold?`, `Из ${base} билетов продано ${p}%. Сколько билетов продано?`, `${base} билеттің ${p}%-ы сатылды. Неше билет сатылды?`), [L('1% is a hundredth part: divide by 100, then multiply by the percent.', '1% - сотая часть: делим на 100 и умножаем на число процентов.', '1% - жүзден бір бөлік: 100-ге бөліп, пайыз санына көбейтеміз.'), same(`${base} ${DIV} 100 ${TIMES} ${p} = ${part}`)], part, [why(base - part, L('That is how many are left, not sold.', 'Это сколько осталось, а не продано.', 'Бұл - сатылғаны емес, қалғаны.')), base / p === Math.round(base / p) ? base / p : part + 10, part * 10], { min: 0 });
  if (k === 1) return qNum(ctx, id, d, L(`${p}% of a number is ${part}. Find the number.`, `${p}% числа равны ${part}. Найди число.`, `Санның ${p}%-ы ${kkDat(part)} тең. Санды тап.`), [L('Divide by the percent and multiply by 100.', 'Делим на число процентов и умножаем на 100.', 'Пайыз санына бөліп, 100-ге көбейтеміз.'), same(`${part} ${DIV} ${p} ${TIMES} 100 = ${base}`)], base, [why(Math.round((part * p) / 100 * 100) / 100, L('To find the whole, divide by the percent, then multiply by 100.', 'Чтобы найти целое, делим на проценты и умножаем на 100.', 'Бүтінді табу үшін пайызға бөліп, 100-ге көбейтеміз.')), part * p, base + part], { min: 0 });
  if (k === 2) return qNum(ctx, id, d, L(`What percent of ${base} is ${part}?`, `Сколько процентов составляет ${part} от ${base}?`, `${part} саны ${base} санының неше пайызын құрайды?`), [L('Divide the part by the whole and multiply by 100%.', 'Делим часть на целое и умножаем на 100%.', 'Бөлікті бүтінге бөліп, 100%-ға көбейтеміз.'), same(`${part} ${DIV} ${base} ${TIMES} 100% = ${p}%`)], p, [100 - p, p * 2, Math.round(base / part)].filter((x) => x !== p), { min: 0 });
  if (k === 3) {
    const up = rng() < 0.5;
    const v = up ? base + part : base - part;
    return qNum(ctx, id, d, up ? L(`A price of ${base} tenge went up by ${p}%. What is the new price?`, `Цена ${base} тенге выросла на ${p}%. Какой стала цена?`, `${base} теңге баға ${p}%-ға өсті. Жаңа баға қанша?`) : L(`A price of ${base} tenge was cut by ${p}%. What is the new price?`, `Цена ${base} тенге снизилась на ${p}%. Какой стала цена?`, `${base} теңге баға ${p}%-ға төмендеді. Жаңа баға қанша?`), [L(`${p}% of ${base} is ${part}.`, `${p}% от ${base} - это ${part}.`, `${base}-дің ${p}%-ы - ${part}.`), same(`${base} ${up ? '+' : MINUS} ${part} = ${v}`)], v, [why(part, L('That is only the change. Add it to (or subtract it from) the old price.', 'Это только изменение. Его нужно прибавить к старой цене (или вычесть).', 'Бұл - тек өзгеріс. Оны ескі бағаға қосу (не азайту) керек.')), up ? base - part : base + part, base + p], { min: 0 });
  }
  const v = base - part;
  return qNum(ctx, id, d, L(`After a ${p}% discount, a jacket costs ${v} tenge. What was the price before the discount?`, `После скидки ${p}% куртка стоит ${v} тенге. Сколько она стоила до скидки?`, `${p}% жеңілдіктен кейін күрте ${v} теңге тұрады. Жеңілдікке дейін ол қанша тұрды?`), [L(`${v} tenge is ${100 - p}% of the old price.`, `${v} тенге - это ${100 - p}% старой цены.`, `${v} теңге - ескі бағаның ${100 - p}%-ы.`), same(`${v} ${DIV} ${100 - p} ${TIMES} 100 = ${base}`)], base, [why(v + Math.round((v * p) / 100), L('The discount was taken from the old price, not the new one.', 'Скидку считали от старой цены, а не от новой.', 'Жеңілдік жаңа бағадан емес, ескі бағадан есептелген.')), v + p, base + part], { min: 0 });
}

// ---------- Осевая и центральная симметрия ----------

export function symmetry(ctx, d) {
  const { rng } = ctx;
  const id = 'm.sym';
  const fmt = ([x, y]) => `(${nm(x)}; ${nm(y)})`;
  const pointQ = () => {
    const P = [R(rng, -5, 5) || 3, R(rng, -5, 5) || -2];
    const kind = R(rng, 0, d === 1 ? 1 : 2);
    const Q = kind === 0 ? [P[0], -P[1]] : kind === 1 ? [-P[0], P[1]] : [-P[0], -P[1]];
    const what = [L('the x-axis', 'оси абсцисс (Ox)', 'абсцисса осіне (Ox)'), L('the y-axis', 'оси ординат (Oy)', 'ордината осіне (Oy)'), L('the origin', 'начала координат', 'координаталар басына')][kind];
    const rule = [L('Symmetry in Ox: x stays, y changes sign.', 'Симметрия относительно Ox: x не меняется, у y меняется знак.', 'Ox осіне қатысты симметрия: x өзгермейді, y таңбасын өзгертеді.'), L('Symmetry in Oy: y stays, x changes sign.', 'Симметрия относительно Oy: y не меняется, у x меняется знак.', 'Oy осіне қатысты симметрия: y өзгермейді, x таңбасын өзгертеді.'), L('Central symmetry in O: both coordinates change sign.', 'Центральная симметрия относительно O: обе координаты меняют знак.', 'O нүктесіне қатысты центрлік симметрия: екі координата да таңбасын өзгертеді.')][kind];
    return qText(
      ctx, id, d,
      L(`Point A${fmt(P)}. Find the point symmetric to A about ${what.en}.`, `Дана точка A${fmt(P)}. Найди точку, симметричную A относительно ${what.ru}.`, `A${fmt(P)} нүктесі берілген. A нүктесіне ${what.kk} қатысты симметриялы нүктені тап.`),
      [rule, same(`A${fmt(P)} → A′${fmt(Q)}`)],
      same(fmt(Q)), [same(fmt([P[0], -P[1]])), same(fmt([-P[0], P[1]])), same(fmt([-P[0], -P[1]])), same(fmt([P[1], P[0]])), same(fmt(P))],
      { fig: planeSvg({ A: P }, 6) },
    );
  };
  const axes = () => {
    const SH = [
      [L('a square', 'квадрата', 'шаршының'), 4],
      [L('a rectangle (not a square)', 'прямоугольника (не квадрата)', 'тіктөртбұрыштың (шаршы емес)'), 2],
      [L('an equilateral triangle', 'равностороннего треугольника', 'теңқабырғалы үшбұрыштың'), 3],
      [L('an isosceles triangle (not equilateral)', 'равнобедренного треугольника (не равностороннего)', 'теңбүйірлі үшбұрыштың (теңқабырғалы емес)'), 1],
      [L('a regular hexagon', 'правильного шестиугольника', 'дұрыс алтыбұрыштың'), 6],
      [L('a scalene triangle', 'разностороннего треугольника', 'әртүрлі қабырғалы үшбұрыштың'), 0],
      [L('a segment', 'отрезка', 'кесіндінің'), 2],
      [L('a rhombus (not a square)', 'ромба (не квадрата)', 'ромбының (шаршы емес)'), 2],
    ];
    const [name, v] = one(rng, SH);
    return qNum(ctx, id, d, L(`How many axes of symmetry does ${name.en} have?`, `Сколько осей симметрии у ${name.ru}?`, `${name.kk} неше симметрия осі бар?`), [L('An axis of symmetry folds the figure into two matching halves.', 'Ось симметрии делит фигуру на две половинки, которые совпадают при перегибании.', 'Симметрия осі фигураны бүктегенде беттесетін екі жартыға бөледі.'), ans(v)], v, [v + 1, v === 0 ? 2 : v - 1, v * 2, 4].filter((x) => x !== v), { spr: 0, min: 0 });
  };
  const centre = () => {
    const P = [R(rng, -5, 5), R(rng, -5, 5)];
    const C = [R(rng, -3, 3), R(rng, -3, 3)];
    const Q = [2 * C[0] - P[0], 2 * C[1] - P[1]];
    return qText(ctx, id, d, L(`Point B is symmetric to A${fmt(P)} about the point C${fmt(C)}. Find B.`, `Точка B симметрична точке A${fmt(P)} относительно точки C${fmt(C)}. Найди B.`, `B нүктесі A${fmt(P)} нүктесіне C${fmt(C)} нүктесіне қатысты симметриялы. B-ны тап.`), [L('C is the midpoint of AB: B = 2C - A.', 'C - середина отрезка AB: B = 2C - A.', 'C - AB кесіндісінің ортасы: B = 2C - A.'), same(`B(2 ${TIMES} ${sg(C[0])} ${MINUS} ${sg(P[0])}; 2 ${TIMES} ${sg(C[1])} ${MINUS} ${sg(P[1])}) = B${fmt(Q)}`)], same(fmt(Q)), [same(fmt([-P[0], -P[1]])), same(fmt([C[0] - P[0], C[1] - P[1]])), same(fmt([P[0] + C[0], P[1] + C[1]])), same(fmt([Q[0] + 1, Q[1]]))]);
  };
  if (d === 1) return anyOf(rng, [pointQ, pointQ, axes]);
  if (d === 2) return anyOf(rng, [pointQ, axes]);
  return anyOf(rng, [pointQ, axes, centre]);
}
