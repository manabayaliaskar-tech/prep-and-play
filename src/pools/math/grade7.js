// Математика 7 класса: одночлены, многочлены, формулы сокращённого умножения, разложение на множители,
// свойства степени, линейная функция, статистика; геометрия: начальные понятия, смежные и вертикальные углы,
// признаки равенства треугольников, равнобедренный треугольник, параллельные прямые, сумма углов, окружность.

import { L, dec, loc, n, same, why } from '../gen.js';
import { R, TIMES, one, qNum, qText, triangleSvg } from './kit.js';
import { M, NZ, X, fr, fv, iv, letters, mono, nm, plot, poly, pr, px, scene, sg, sup } from './hkit.js';

const ans = (v) => L(`Answer: ${v}.`, `Ответ: ${v}.`, `Жауабы: ${v}.`);
const VARS = [['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q'], ['a', 'c'], ['b', 'c']];
const deg = (a) => `${a}°`;

// ---------- Одночлены ----------

/** Произведение одночленов: [коэффициент, {буква: показатель}, степень всего множителя]. */
function prodMono(factors) {
  let c = 1;
  const e = {};
  for (const [k, vars, p = 1] of factors) {
    c *= k ** p;
    for (const [v, x] of Object.entries(vars)) e[v] = (e[v] ?? 0) + x * p;
  }
  return [c, e];
}
const showF = ([k, vars, p = 1], first) => {
  const body = mono(k, vars);
  if (p > 1) return `(${body})<sup>${p}</sup>`;
  return k < 0 && !first ? `(${body})` : body;
};
const degOf = (e) => Object.values(e).reduce((s, x) => s + x, 0);

export function monom(ctx, d) {
  const { rng } = ctx;
  const id = 'm.monom';
  const [u, w] = one(rng, VARS);
  const k = R(rng, 0, d === 1 ? 3 : 4);
  const rule = L('Multiply the coefficients; add the exponents of equal letters.', 'Коэффициенты перемножаем, показатели одинаковых букв складываем.', 'Коэффициенттерді көбейтеміз, бірдей әріптердің дәреже көрсеткіштерін қосамыз.');
  if (k === 0) {
    const f1 = [NZ(rng, -6, 7), { [u]: R(rng, 1, 4), ...(d > 1 ? { [w]: R(rng, 0, 3) } : {}) }];
    const f2 = [NZ(rng, -5, 6), { [u]: R(rng, 1, 3), ...(d > 1 ? { [w]: R(rng, 1, 3) } : {}) }];
    const fs = d === 3 ? [f1, f2, [one(rng, [-1, 2, -2, 3]), { [w]: R(rng, 1, 2) }, 2]] : [f1, f2];
    const [c, e] = prodMono(fs);
    const expr = fs.map((f, i) => showF(f, i === 0)).join(' · ');
    const mulE = {};
    for (const f of fs) for (const [v, x] of Object.entries(f[1])) mulE[v] = (mulE[v] ?? 1) * x * (f[2] ?? 1);
    const csum = fs.reduce((s, f) => s + f[0], 0);
    return qText(ctx, id, d, L(`Write the monomial in standard form: ${expr}`, `Приведи одночлен к стандартному виду: ${expr}`, `Бірмүшені стандарт түрге келтір: ${expr}`),
      [rule, d === 3 ? L('A power of a monomial: raise the coefficient to the power and multiply the exponents.', 'Степень одночлена: коэффициент возводим в степень, показатели умножаем.', 'Бірмүшенің дәрежесі: коэффициентті дәрежеге шығарып, көрсеткіштерді көбейтеміз.') : null, same(`${expr} = ${mono(c, e)}`)],
      same(mono(c, e)), [same(mono(-c, e)), same(mono(csum || c + 1, e)), same(mono(c, mulE)), same(mono(c, { ...e, [u]: e[u] + 1 }))]);
  }
  if (k === 1) {
    const c = NZ(rng, -9, 9);
    const e = { [u]: R(rng, 1, 5), [w]: R(rng, d === 1 ? 0 : 1, 4) };
    const z = d > 1 && rng() < 0.5 ? { z: R(rng, 1, 3) } : {};
    const all = { ...e, ...z };
    const dg = degOf(all);
    const cntL = Object.values(all).filter((x) => x).length;
    return qNum(ctx, id, d, L(`Find the degree of the monomial ${mono(c, all)}.`, `Найди степень одночлена ${mono(c, all)}.`, `${mono(c, all)} бірмүшесінің дәрежесін тап.`),
      [L('The degree of a monomial is the sum of the exponents of all its letters.', 'Степень одночлена - сумма показателей степеней всех букв.', 'Бірмүшенің дәрежесі - барлық әріптердің дәреже көрсеткіштерінің қосындысы.'), same(Object.values(all).filter((x) => x).join(' + ') + ` = ${dg}`)],
      dg, [why(Math.max(...Object.values(all)), L('Add the exponents of all letters, not only the largest one.', 'Складываются показатели всех букв, а не берётся наибольший.', 'Ең үлкенін емес, барлық әріптердің көрсеткіштерін қосамыз.')), why(cntL, L('Count the exponents, not the letters.', 'Считаем показатели, а не количество букв.', 'Әріптер санын емес, көрсеткіштерді қосамыз.')), dg + Math.abs(c), dg + 1]);
  }
  if (k === 2) {
    const c = one(rng, d === 1 ? [2, 3, -2, -1, 5] : [-2, -3, 2, 3, -1, 4]);
    const p = d === 1 ? 2 : R(rng, 2, 3);
    const e = { [u]: R(rng, 1, 4), ...(d > 1 ? { [w]: R(rng, 1, 4) } : {}) };
    const [cc, ee] = prodMono([[c, e, p]]);
    const addE = Object.fromEntries(Object.entries(e).map(([v, x]) => [v, x + p]));
    return qText(ctx, id, d, L(`Raise to the power: (${mono(c, e)})<sup>${p}</sup>`, `Возведи в степень: (${mono(c, e)})<sup>${p}</sup>`, `Дәрежеге шығар: (${mono(c, e)})<sup>${p}</sup>`),
      [L('Raise the coefficient to the power and multiply every exponent by it.', 'Коэффициент возводим в степень, каждый показатель умножаем на неё.', 'Коэффициентті дәрежеге шығарып, әр көрсеткішті соған көбейтеміз.'), same(`(${mono(c, e)})<sup>${p}</sup> = ${pr(c)}<sup>${p}</sup>${letters(ee)} = ${mono(cc, ee)}`)],
      same(mono(cc, ee)), [same(mono(c * p, ee)), same(mono(cc, addE)), same(mono(-cc, ee)), same(mono(c, ee))]);
  }
  if (k === 3) {
    const e1 = { [u]: R(rng, 1, 3), [w]: R(rng, 1, 2) };
    const c = NZ(rng, -4, 4);
    const a = NZ(rng, -3, 3);
    const b = NZ(rng, -3, 3);
    const v = c * a ** e1[u] * b ** e1[w];
    return qNum(ctx, id, d, L(`Find the value of the monomial ${mono(c, e1)} at ${iv(u)} = ${nm(a)}, ${iv(w)} = ${nm(b)}.`, `Найди значение одночлена ${mono(c, e1)} при ${iv(u)} = ${nm(a)}, ${iv(w)} = ${nm(b)}.`, `${iv(u)} = ${nm(a)}, ${iv(w)} = ${nm(b)} болғанда ${mono(c, e1)} бірмүшесінің мәнін тап.`),
      [L('Substitute the numbers; a negative number in brackets.', 'Подставим числа; отрицательные - в скобках.', 'Сандарды қоямыз; теріс сандарды жақшаға аламыз.'), same(`${nm(c)} · ${e1[u] > 1 ? sup(pr(a), e1[u]) : pr(a)} · ${e1[w] > 1 ? sup(pr(b), e1[w]) : pr(b)} = ${nm(v)}`)],
      v, [why(-v, L('Check the sign: an even power of a negative number is positive.', 'Проверь знак: чётная степень отрицательного числа положительна.', 'Таңбаны тексер: теріс санның жұп дәрежесі оң.')), c * a * e1[u] * b * e1[w], v + c], { min: -1e9 });
  }
  const e2 = { [u]: R(rng, 1, 3), [w]: R(rng, 1, 3) };
  const e1 = { [u]: R(rng, 1, 4), [w]: R(rng, 0, 2) };
  const c1 = NZ(rng, -6, 6);
  const c2 = NZ(rng, -5, 5);
  const [cp, ep] = prodMono([[c1, e1], [c2, e2]]);
  const divE = Object.fromEntries(Object.entries(ep).map(([v, x]) => [v, Math.max(1, Math.round(x / e2[v]))]));
  return qText(ctx, id, d, L(`Divide: ${mono(cp, ep)} : ${c2 < 0 ? `(${mono(c2, e2)})` : mono(c2, e2)}`, `Выполни деление: ${mono(cp, ep)} : ${c2 < 0 ? `(${mono(c2, e2)})` : mono(c2, e2)}`, `Бөлуді орында: ${mono(cp, ep)} : ${c2 < 0 ? `(${mono(c2, e2)})` : mono(c2, e2)}`),
    [L('Divide the coefficients; subtract the exponents of equal letters.', 'Коэффициенты делим, показатели одинаковых букв вычитаем.', 'Коэффициенттерді бөлеміз, бірдей әріптердің көрсеткіштерін азайтамыз.'), same(`= ${mono(c1, e1)}`)],
    same(mono(c1, e1)), [same(mono(-c1, e1)), same(mono(c1, divE)), same(mono(cp * c2, e1)), same(mono(c1, ep))]);
}

// ---------- Многочлены ----------

export function polyOps(ctx, d) {
  const { rng } = ctx;
  const id = 'm.poly';
  const k = R(rng, 0, d === 1 ? 2 : 4);
  if (k === 0 || k === 1) {
    const a = [NZ(rng, -6, 7), NZ(rng, -9, 9), NZ(rng, -9, 9)];
    const b = [NZ(rng, -6, 6), NZ(rng, -9, 9), NZ(rng, -9, 9)];
    const minus = k === 1;
    const r = a.map((x, i) => (minus ? x - b[i] : x + b[i]));
    const bad = a.map((x, i) => (i === 0 ? r[0] : minus ? x + b[i] : x - b[i]));
    const expr = `(${px(a)}) ${minus ? M : '+'} (${px(b)})`;
    return qText(ctx, id, d, L(`Simplify: ${expr}`, `Упрости: ${expr}`, `Ықшамда: ${expr}`),
      [minus ? L('A minus before the brackets changes the sign of every term inside.', 'Минус перед скобкой меняет знак каждого члена в скобке.', 'Жақша алдындағы минус ішіндегі әр мүшенің таңбасын өзгертеді.') : L('Open the brackets and add like terms.', 'Раскроем скобки и приведём подобные члены.', 'Жақшаларды ашып, ұқсас мүшелерді біріктіреміз.'), same(`= ${px(r)}`)],
      same(px(r)), [same(px(bad)), same(px(r.map((x, i) => (i === 2 ? -x : x)))), same(px([r[0] + r[1], r[2]].length ? [r[0], r[1] + 1, r[2]] : r)), same(px([r[0], -r[1], r[2]]))]);
  }
  if (k === 2) {
    const m = NZ(rng, -5, 6);
    const e = R(rng, 1, d === 1 ? 1 : 2);
    const b = [NZ(rng, -5, 5), NZ(rng, -9, 9), ...(d > 1 ? [NZ(rng, -9, 9)] : [])];
    const mm = [m, ...Array(e).fill(0)];
    const r = [...b.map((x) => x * m), ...Array(e).fill(0)];
    const expr = `${mono(m, { x: e })}(${px(b)})`;
    const lastOnly = [...b.map((x, i) => (i === 0 ? x * m : x)), ...Array(e).fill(0)];
    return qText(ctx, id, d, L(`Multiply: ${expr}`, `Выполни умножение: ${expr}`, `Көбейтуді орында: ${expr}`),
      [L('Multiply the monomial by every term of the polynomial.', 'Одночлен умножаем на каждый член многочлена.', 'Бірмүшені көпмүшенің әр мүшесіне көбейтеміз.'), same(`= ${px(r)}`)],
      same(px(r)), [same(px(lastOnly)), same(px([...b.map((x) => x * m), ...Array(Math.max(0, e - 1)).fill(0)])), same(px(r.map((x, i) => (i === r.length - 1 - e ? -x : x)))), same(px(mm.length ? r.map((x, i) => (i === 0 ? -x : x)) : r))]);
  }
  if (k === 3) {
    const a = d === 3 ? NZ(rng, -3, 4) : 1;
    const c = d === 3 ? NZ(rng, -3, 3) : 1;
    const b = NZ(rng, -9, 9);
    const e = NZ(rng, -9, 9);
    const r = [a * c, a * e + b * c, b * e];
    const expr = `(${px([a, b])})(${px([c, e])})`;
    return qText(ctx, id, d, L(`Multiply: ${expr}`, `Выполни умножение: ${expr}`, `Көбейтуді орында: ${expr}`),
      [L('Multiply every term of the first bracket by every term of the second, then add like terms.', 'Каждый член первой скобки умножаем на каждый член второй и приводим подобные.', 'Бірінші жақшаның әр мүшесін екіншісінің әр мүшесіне көбейтіп, ұқсас мүшелерді біріктіреміз.'), same(`= ${px([a * c, a * e, b * c, b * e].slice(0, 1))} ${sg(a * e).trim() ? '' : ''}${poly([[a * e, { x: 1 }], [b * c, { x: 1 }]]).replace(/^/, a * e < 0 ? '' : '+ ')} ${sg(b * e)} = ${px(r)}`)],
      same(px(r)), [why(same(px([a * c, 0, b * e])), null), same(px([a * c, a * e + b * c, -b * e])), same(px([a * c, a * e - b * c || a * e + b * c + 1, b * e])), same(px([a * c, b + e, b * e]))].map((x) => (x?.__why ? x.v : x)));
  }
  // степень многочлена после упрощения
  const top = R(rng, 2, 5);
  const c1 = NZ(rng, 2, 7);
  const c2 = NZ(rng, -9, 9);
  const c3 = NZ(rng, -9, 9);
  const cancel = rng() < 0.5;
  const terms = [[c1, { x: top }], [c2, { x: top - 1 }], [cancel ? -c1 : NZ(rng, -5, 5), { x: top }], [c3, { x: 1 }], [NZ(rng, -9, 9), {}]];
  const coef = {};
  for (const [c, e] of terms) coef[e.x ?? 0] = (coef[e.x ?? 0] ?? 0) + c;
  const dg = Math.max(...Object.entries(coef).filter(([, c]) => c !== 0).map(([p]) => Number(p)));
  return qNum(ctx, id, d, L(`Bring the polynomial to standard form and find its degree: ${poly(terms)}`, `Приведи многочлен к стандартному виду и найди его степень: ${poly(terms)}`, `Көпмүшені стандарт түрге келтіріп, дәрежесін тап: ${poly(terms)}`),
    [L('Add like terms first; the degree is the largest exponent left.', 'Сначала приведём подобные; степень - наибольший из оставшихся показателей.', 'Алдымен ұқсас мүшелерді біріктіреміз; дәреже - қалған ең үлкен көрсеткіш.'), same(`= ${poly(Object.entries(coef).sort((p, q) => q[0] - p[0]).map(([p, c]) => [c, { x: Number(p) }]))}`), ans(dg)],
    dg, [why(top, L('The highest terms cancel out - look at the standard form.', 'Старшие члены взаимно уничтожаются - смотри на стандартный вид.', 'Жоғары мүшелер жойылады - стандарт түріне қара.')), top + 1, terms.length, dg + 1].filter((x) => (x?.__why ? x.v : x) !== dg));
}

// ---------- Формулы сокращённого умножения ----------

export function fsu(ctx, d) {
  const { rng } = ctx;
  const id = 'm.fsu';
  const k = R(rng, 0, d === 1 ? 3 : 5);
  const [u] = one(rng, VARS);
  const a = d === 1 ? 1 : R(rng, 1, 5);
  const b = R(rng, 1, 9);
  const s = rng() < 0.5 ? 1 : -1;
  const sq = (c) => (c === 1 ? iv(u) : `${c}${iv(u)}`);
  if (k === 0) {
    const r = [[a * a, { [u]: 2 }], [2 * a * b * s, { [u]: 1 }], [b * b, {}]];
    const e = `(${sq(a)} ${s < 0 ? M : '+'} ${b})<sup>2</sup>`;
    return qText(ctx, id, d, L(`Expand: ${e}`, `Раскрой скобки: ${e}`, `Жақшаны аш: ${e}`),
      [s > 0 ? same('(a + b)<sup>2</sup> = a<sup>2</sup> + 2ab + b<sup>2</sup>') : same(`(a ${M} b)<sup>2</sup> = a<sup>2</sup> ${M} 2ab + b<sup>2</sup>`), same(`= ${poly(r)}`)],
      same(poly(r)), [same(poly([r[0], r[2]])), same(poly([r[0], [a * b * s, { [u]: 1 }], r[2]])), same(poly([r[0], [2 * a * b * s, { [u]: 1 }], [-b * b, {}]])), same(poly([[a, { [u]: 2 }], r[1], r[2]]))]);
  }
  if (k === 1) {
    const e = `(${sq(a)} ${M} ${b})(${sq(a)} + ${b})`;
    const r = [[a * a, { [u]: 2 }], [-b * b, {}]];
    return qText(ctx, id, d, L(`Multiply: ${e}`, `Выполни умножение: ${e}`, `Көбейтуді орында: ${e}`),
      [same(`(a ${M} b)(a + b) = a<sup>2</sup> ${M} b<sup>2</sup>`), same(`= ${poly(r)}`)],
      same(poly(r)), [same(poly([r[0], [b * b, {}]])), same(poly([r[0], [-2 * a * b, { [u]: 1 }], [-b * b, {}]])), same(poly([[a, { [u]: 2 }], [-b, {}]])), same(poly([r[0], [-2 * b, {}]]))]);
  }
  if (k === 2) {
    const base = one(rng, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    const t = R(rng, 1, d === 1 ? 2 : 3);
    const which = R(rng, 0, 2);
    if (which === 2) {
      const v = base * base - t * t;
      return qNum(ctx, id, d, L(`Calculate: ${base - t} × ${base + t}`, `Вычисли: ${base - t} × ${base + t}`, `Есепте: ${base - t} × ${base + t}`),
        [same(`(${base} ${M} ${t})(${base} + ${t}) = ${base}<sup>2</sup> ${M} ${t}<sup>2</sup>`), same(`= ${n(base * base)} ${M} ${t * t} = ${n(v)}`)], v, [base * base + t * t, base * base, v - 2 * t]);
    }
    const x = which ? base + t : base - t;
    const v = x * x;
    return qNum(ctx, id, d, L(`Calculate using a formula: ${x}<sup>2</sup>`, `Вычисли по формуле: ${x}<sup>2</sup>`, `Формула бойынша есепте: ${x}<sup>2</sup>`),
      [same(`${x}<sup>2</sup> = (${base} ${which ? '+' : M} ${t})<sup>2</sup> = ${n(base * base)} ${which ? '+' : M} ${2 * base * t} + ${t * t}`), same(`= ${n(v)}`)], v,
      [why(base * base + (which ? 1 : -1) * t * t, L('Do not forget the middle term 2ab.', 'Не забудь удвоенное произведение 2ab.', 'Екі еселенген көбейтінді 2ab-ны ұмытпа.')), v + 2 * t * t, v - 10]);
  }
  if (k === 3) {
    const r = [[a * a, { [u]: 2 }], [2 * a * b * s, { [u]: 1 }], [b * b, {}]];
    const right = `(${sq(a)} ${s < 0 ? M : '+'} ${b})<sup>2</sup>`;
    return qText(ctx, id, d, L(`Write as a square of a binomial: ${poly(r)}`, `Представь в виде квадрата двучлена: ${poly(r)}`, `Екімүшенің квадраты түрінде жаз: ${poly(r)}`),
      [L(`${poly([r[0]])} = (${sq(a)})<sup>2</sup>, ${b * b} = ${b}<sup>2</sup>, the middle term is 2 · ${sq(a)} · ${b}.`, `${poly([r[0]])} = (${sq(a)})<sup>2</sup>, ${b * b} = ${b}<sup>2</sup>, средний член - 2 · ${sq(a)} · ${b}.`, `${poly([r[0]])} = (${sq(a)})<sup>2</sup>, ${b * b} = ${b}<sup>2</sup>, ортаңғы мүше - 2 · ${sq(a)} · ${b}.`), same(`= ${right}`)],
      same(right), [same(`(${sq(a)} ${s > 0 ? M : '+'} ${b})<sup>2</sup>`), same(`(${sq(a)} ${M} ${b})(${sq(a)} + ${b})`), same(`(${sq(a)} ${s < 0 ? M : '+'} ${b * b})<sup>2</sup>`), same(`(${sq(a * a)} ${s < 0 ? M : '+'} ${b})<sup>2</sup>`)]);
  }
  if (k === 4) {
    const p = R(rng, 1, 4);
    const cube = rng() < 0.5;
    if (cube) {
      const r = [[1, { [u]: 3 }], [3 * p * s, { [u]: 2 }], [3 * p * p, { [u]: 1 }], [s * p ** 3, {}]];
      const e = `(${iv(u)} ${s < 0 ? M : '+'} ${p})<sup>3</sup>`;
      return qText(ctx, id, d, L(`Expand: ${e}`, `Раскрой скобки: ${e}`, `Жақшаны аш: ${e}`),
        [same(`(a ± b)<sup>3</sup> = a<sup>3</sup> ± 3a<sup>2</sup>b + 3ab<sup>2</sup> ± b<sup>3</sup>`), same(`= ${poly(r)}`)],
        same(poly(r)), [same(poly([r[0], r[3]])), same(poly([r[0], [3 * p * s, { [u]: 2 }], [3 * p * p * s, { [u]: 1 }], r[3]].map((x, i) => (i === 2 ? [-3 * p * p, { [u]: 1 }] : x)))), same(poly([r[0], [p * s, { [u]: 2 }], [p * p, { [u]: 1 }], r[3]])), same(poly([r[0], [3 * p * s, { [u]: 2 }], [3 * p * p, { [u]: 1 }], [-s * p ** 3, {}]]))]);
    }
    const c = p + 1;
    const plus = s > 0;
    const e = `${sup(iv(u), 3)} ${plus ? '+' : M} ${c ** 3}`;
    const right = `(${iv(u)} ${plus ? '+' : M} ${c})(${poly([[1, { [u]: 2 }], [plus ? -c : c, { [u]: 1 }], [c * c, {}]])})`;
    return qText(ctx, id, d, L(`Factor: ${e}`, `Разложи на множители: ${e}`, `Көбейткіштерге жікте: ${e}`),
      [plus ? same(`a<sup>3</sup> + b<sup>3</sup> = (a + b)(a<sup>2</sup> ${M} ab + b<sup>2</sup>)`) : same(`a<sup>3</sup> ${M} b<sup>3</sup> = (a ${M} b)(a<sup>2</sup> + ab + b<sup>2</sup>)`), same(`${c ** 3} = ${c}<sup>3</sup>, ${e} = ${right}`)],
      same(right), [same(`(${iv(u)} ${plus ? '+' : M} ${c})(${poly([[1, { [u]: 2 }], [plus ? c : -c, { [u]: 1 }], [c * c, {}]])})`), same(`(${iv(u)} ${plus ? '+' : M} ${c})<sup>3</sup>`), same(`(${iv(u)} ${plus ? M : '+'} ${c})(${poly([[1, { [u]: 2 }], [plus ? -c : c, { [u]: 1 }], [c * c, {}]])})`), same(`(${iv(u)} ${plus ? '+' : M} ${c})(${poly([[1, { [u]: 2 }], [plus ? -2 * c : 2 * c, { [u]: 1 }], [c * c, {}]])})`)]);
  }
  const big = R(rng, 30, 99);
  const small = R(rng, 11, big - 3);
  const v = big * big - small * small;
  return qNum(ctx, id, d, L(`Calculate conveniently: ${big}<sup>2</sup> ${M} ${small}<sup>2</sup>`, `Вычисли удобным способом: ${big}<sup>2</sup> ${M} ${small}<sup>2</sup>`, `Ыңғайлы тәсілмен есепте: ${big}<sup>2</sup> ${M} ${small}<sup>2</sup>`),
    [same(`a<sup>2</sup> ${M} b<sup>2</sup> = (a ${M} b)(a + b)`), same(`(${big} ${M} ${small})(${big} + ${small}) = ${big - small} × ${big + small} = ${n(v)}`)], v, [(big - small) ** 2, big + small, v + 2 * small]);
}

// ---------- Разложение на множители ----------

export function factor(ctx, d) {
  const { rng } = ctx;
  const id = 'm.factor';
  const k = R(rng, 0, d === 1 ? 2 : 5);
  const [u, w] = one(rng, VARS);
  if (k === 0) {
    const g = R(rng, 2, 7);
    const a = NZ(rng, 1, 6);
    const b = NZ(rng, -9, 9) || 1;
    const e = R(rng, 1, d === 1 ? 1 : 3);
    const inner = poly([[a, { [u]: 1 }], [b, {}]]);
    const expr = poly([[g * a, { [u]: e + 1 }], [g * b, { [u]: e }]]);
    const right = `${mono(g, { [u]: e })}(${inner})`;
    return qText(ctx, id, d, L(`Factor out the common factor: ${expr}`, `Вынеси общий множитель за скобки: ${expr}`, `Ортақ көбейткішті жақша сыртына шығар: ${expr}`),
      [L(`Common factor: ${mono(g, { [u]: e })} (the GCD of the coefficients and the lowest power of ${iv(u)}).`, `Общий множитель: ${mono(g, { [u]: e })} (НОД коэффициентов и наименьшая степень ${iv(u)}).`, `Ортақ көбейткіш: ${mono(g, { [u]: e })} (коэффициенттердің ЕҮОБ-ы және ${iv(u)}-тің ең кіші дәрежесі).`), same(`${expr} = ${right}`)],
      same(right), [same(`${mono(g, { [u]: e })}(${poly([[a, { [u]: 1 }], [-b, {}]])})`), same(`${mono(g, { [u]: e + 1 })}(${poly([[a, {}], [b, {}]])})`), same(`${mono(g, {})}(${poly([[a, { [u]: e + 1 }], [b, { [u]: e }]])})`), same(`${mono(g, { [u]: e })}(${poly([[a, { [u]: 1 }], [b * g, {}]])})`)]);
  }
  if (k === 1) {
    const a = R(rng, 1, d === 1 ? 1 : 5);
    const b = R(rng, 1, 10);
    const sq = a === 1 ? iv(u) : `${a}${iv(u)}`;
    const expr = poly([[a * a, { [u]: 2 }], [-b * b, {}]]);
    const right = `(${sq} ${M} ${b})(${sq} + ${b})`;
    return qText(ctx, id, d, L(`Factor: ${expr}`, `Разложи на множители: ${expr}`, `Көбейткіштерге жікте: ${expr}`),
      [same(`a<sup>2</sup> ${M} b<sup>2</sup> = (a ${M} b)(a + b)`), same(`${expr} = (${sq})<sup>2</sup> ${M} ${b}<sup>2</sup> = ${right}`)],
      same(right), [same(`(${sq} ${M} ${b})<sup>2</sup>`), same(`(${sq} + ${b})<sup>2</sup>`), same(`(${sq} ${M} ${b * b})(${sq} + ${b * b})`), same(`(${iv(u)} ${M} ${b})(${a * a}${iv(u)} + ${b})`)]);
  }
  if (k === 2) {
    const a = R(rng, 1, d === 1 ? 1 : 4);
    const b = R(rng, 1, 9);
    const s = rng() < 0.5 ? 1 : -1;
    const sq = a === 1 ? iv(u) : `${a}${iv(u)}`;
    const expr = poly([[a * a, { [u]: 2 }], [2 * a * b * s, { [u]: 1 }], [b * b, {}]]);
    const right = `(${sq} ${s < 0 ? M : '+'} ${b})<sup>2</sup>`;
    return qText(ctx, id, d, L(`Factor: ${expr}`, `Разложи на множители: ${expr}`, `Көбейткіштерге жікте: ${expr}`),
      [L('This is a perfect square: a² ± 2ab + b² = (a ± b)².', 'Это полный квадрат: a² ± 2ab + b² = (a ± b)².', 'Бұл - толық квадрат: a² ± 2ab + b² = (a ± b)².'), same(`${expr} = ${right}`)],
      same(right), [same(`(${sq} ${s > 0 ? M : '+'} ${b})<sup>2</sup>`), same(`(${sq} ${M} ${b})(${sq} + ${b})`), same(`(${sq} ${s < 0 ? M : '+'} ${2 * b})<sup>2</sup>`), same(`(${sq} ${s < 0 ? M : '+'} ${b * b})<sup>2</sup>`)]);
  }
  if (k === 3) {
    // группировка: ux + uq + px + pq = (u + p)(x + q)
    const p = NZ(rng, -7, 7);
    const q = NZ(rng, -7, 7);
    const expr = poly([[1, { [u]: 1, [w]: 1 }], [q, { [u]: 1 }], [p, { [w]: 1 }], [p * q, {}]]);
    const right = `(${poly([[1, { [u]: 1 }], [p, {}]])})(${poly([[1, { [w]: 1 }], [q, {}]])})`;
    return qText(ctx, id, d, L(`Factor by grouping: ${expr}`, `Разложи на множители способом группировки: ${expr}`, `Топтау тәсілімен көбейткіштерге жікте: ${expr}`),
      [same(`${iv(u)}(${poly([[1, { [w]: 1 }], [q, {}]])}) ${p < 0 ? M : '+'} ${Math.abs(p)}(${poly([[1, { [w]: 1 }], [q, {}]])})`), same(`= ${right}`)],
      same(right), [same(`(${poly([[1, { [u]: 1 }], [-p, {}]])})(${poly([[1, { [w]: 1 }], [q, {}]])})`), same(`(${poly([[1, { [u]: 1 }], [q, {}]])})(${poly([[1, { [w]: 1 }], [p, {}]])})`), same(`(${poly([[1, { [u]: 1 }], [p, {}]])})(${poly([[1, { [w]: 1 }], [-q, {}]])})`), same(`(${poly([[1, { [u]: 1 }], [p * q, {}]])})(${poly([[1, { [w]: 1 }], [1, {}]])})`)]);
  }
  if (k === 4) {
    const r1 = NZ(rng, -9, 9);
    let r2 = NZ(rng, -9, 9);
    if (r2 === -r1) r2 += 1;
    const b = -(r1 + r2);
    const c = r1 * r2;
    if (b === 0) return factor(ctx, d);
    const expr = px([1, b, c]);
    const f = (r) => `(${X} ${r < 0 ? '+' : M} ${Math.abs(r)})`;
    const right = `${f(r1)}${f(r2)}`;
    return qText(ctx, id, d, L(`Factor: ${expr}`, `Разложи на множители: ${expr}`, `Көбейткіштерге жікте: ${expr}`),
      [L(`Find two numbers with product ${nm(c)} and sum ${nm(-b)}: ${nm(r1)} and ${nm(r2)}.`, `Найдём два числа с произведением ${nm(c)} и суммой ${nm(-b)}: ${nm(r1)} и ${nm(r2)}.`, `Көбейтіндісі ${nm(c)}, қосындысы ${nm(-b)} болатын екі сан: ${nm(r1)} және ${nm(r2)}.`), same(`${expr} = ${right}`)],
      same(right), [same(`${f(-r1)}${f(-r2)}`), same(`${f(r1)}${f(-r2)}`), same(`${f(-r1)}${f(r2)}`), same(`(${X} ${c < 0 ? M : '+'} ${Math.abs(c)})(${X} + 1)`)]);
  }
  const a = R(rng, 11, 89);
  const b = one(rng, [100 - a, 10 - (a % 10)].filter((x) => x > 0));
  const c = R(rng, 12, 79);
  const v = c * (a + b);
  return qNum(ctx, id, d, L(`Calculate conveniently: ${c} × ${a} + ${c} × ${b}`, `Вычисли удобным способом: ${c} × ${a} + ${c} × ${b}`, `Ыңғайлы тәсілмен есепте: ${c} × ${a} + ${c} × ${b}`),
    [L('Factor out the common factor.', 'Вынесем общий множитель за скобки.', 'Ортақ көбейткішті жақша сыртына шығарамыз.'), same(`${c} × (${a} + ${b}) = ${c} × ${a + b} = ${n(v)}`)], v, [c * a + b, v + c, v - c]);
}

// ---------- Степень с натуральным показателем ----------

export function powProps(ctx, d) {
  const { rng } = ctx;
  const id = 'm.powprop';
  const k = R(rng, 0, d === 1 ? 3 : 5);
  const [u] = one(rng, VARS);
  const a = R(rng, 2, 9);
  const b = R(rng, 2, 8);
  const U = iv(u);
  if (k <= 2) {
    const [expr, r, wrongs, rule] = [
      [`${sup(U, a)} · ${sup(U, b)}`, a + b, [a * b, Math.abs(a - b) || a + b + 1, a + b + 1], L('When multiplying powers with the same base, add the exponents.', 'При умножении степеней с одинаковым основанием показатели складывают.', 'Негіздері бірдей дәрежелерді көбейткенде көрсеткіштері қосылады.')],
      [`${sup(U, a + b)} : ${sup(U, b)}`, a, [Math.round((a + b) / b) === a ? a + 1 : Math.round((a + b) / b), a + 2 * b, a - 1], L('When dividing powers with the same base, subtract the exponents.', 'При делении степеней с одинаковым основанием показатели вычитают.', 'Негіздері бірдей дәрежелерді бөлгенде көрсеткіштері азайтылады.')],
      [`(${sup(U, a)})<sup>${b}</sup>`, a * b, [a + b, a ** b > 60 ? a * b + 1 : a ** b, a * b - 1], L('When raising a power to a power, multiply the exponents.', 'При возведении степени в степень показатели перемножают.', 'Дәрежені дәрежеге шығарғанда көрсеткіштері көбейтіледі.')],
    ][k];
    return qText(ctx, id, d, L(`Simplify: ${expr}`, `Упрости: ${expr}`, `Ықшамда: ${expr}`), [rule, same(`${expr} = ${sup(U, r)}`)], same(sup(U, r)), [...wrongs.map((e) => same(sup(U, e))), same(`${k === 0 ? 2 : 1}${sup(U, r)}`)]);
  }
  if (k === 3) {
    const base = one(rng, [2, 3, 5, -2, -3, 10]);
    const e = base === 10 ? R(rng, 2, 5) : Math.abs(base) === 2 ? R(rng, 2, 7) : R(rng, 2, 4);
    const minusOut = base > 0 && rng() < 0.4;
    const v = minusOut ? -(base ** e) : base ** e;
    const expr = minusOut ? `${M}${base}<sup>${e}</sup>` : `${pr(base)}<sup>${e}</sup>`;
    return qNum(ctx, id, d, L(`Calculate: ${expr}`, `Вычисли: ${expr}`, `Есепте: ${expr}`),
      [minusOut ? L(`Only ${base} is raised to the power; the minus stays in front.`, `В степень возводится только ${base}, минус остаётся перед числом.`, `Дәрежеге тек ${base} шығарылады, минус алдында қалады.`) : L('A negative number to an even power is positive, to an odd power - negative.', 'Отрицательное число в чётной степени положительно, в нечётной - отрицательно.', 'Теріс сан жұп дәрежеде оң, тақ дәрежеде теріс.'), same(`${expr} = ${nm(v)}`)],
      v, [why(-v, L('Check the sign.', 'Проверь знак.', 'Таңбаны тексер.')), base * e, v + base], { min: -1e9 });
  }
  if (k === 4) {
    const base = one(rng, [2, 3, 5]);
    const p = R(rng, 2, 6);
    const q = R(rng, 2, 5);
    const r = R(rng, 1, Math.min(p + q - 1, base === 2 ? p + q - 1 : 3));
    const top = p + q - r;
    const res = base ** (p + q - top);
    const expr = fr(`${sup(base, p)} · ${sup(base, q)}`, sup(base, top));
    if (top < 1) return powProps(ctx, d);
    return qNum(ctx, id, d, L(`Calculate: ${expr}`, `Вычисли: ${expr}`, `Есепте: ${expr}`),
      [same(`${sup(base, p)} · ${sup(base, q)} = ${sup(base, p + q)}`), same(`${sup(base, p + q)} : ${sup(base, top)} = ${sup(base, p + q - top)} = ${n(res)}`)], res, [base * (p + q - top), base ** (p * q - top) > 1e6 ? res * base : base ** Math.max(1, p * q - top), res * base]);
  }
  // разные основания: 4^a · 8^b : 2^c
  const [b1, e1] = one(rng, [[4, 2], [8, 3], [9, 2], [27, 3], [25, 2]]);
  const base = b1 === 9 || b1 === 27 ? 3 : b1 === 25 ? 5 : 2;
  const p = R(rng, 2, 4);
  const tot = e1 * p;
  const q = R(rng, tot - (base === 2 ? 4 : 2), tot - 1);
  const res = base ** (tot - q);
  const expr = `${sup(b1, p)} : ${sup(base, q)}`;
  return qNum(ctx, id, d, L(`Calculate: ${expr}`, `Вычисли: ${expr}`, `Есепте: ${expr}`),
    [L(`Write ${b1} as a power of ${base}: ${b1} = ${sup(base, e1)}.`, `Запишем ${b1} как степень числа ${base}: ${b1} = ${sup(base, e1)}.`, `${b1} санын ${base} санының дәрежесі түрінде жазамыз: ${b1} = ${sup(base, e1)}.`), same(`${sup(b1, p)} = ${sup(base, tot)}, ${sup(base, tot)} : ${sup(base, q)} = ${sup(base, tot - q)} = ${res}`)],
    res, [why(base ** Math.max(1, p - q + 2), L('First write both numbers with the same base.', 'Сначала приведи оба числа к одному основанию.', 'Алдымен екі санды бір негізге келтір.')), res * base, (b1 / base) ** 1 * (tot - q)]);
}

// ---------- Линейная функция ----------

const kx = (k, b, kd = 1) => {
  const kk = kd === 1 ? (k === 1 ? X : k === -1 ? `${M}${X}` : `${nm(k)}${X}`) : `${k < 0 ? M : ''}${fr(Math.abs(k), kd)}${X}`;
  return `${iv('y')} = ${k === 0 ? n(b) : kk + (b ? sg(b) : '')}`;
};

export function linFunc(ctx, d) {
  const { rng } = ctx;
  const id = 'm.linfunc';
  const k = R(rng, 0, d === 1 ? 2 : 5);
  const a = NZ(rng, -4, 4);
  const b = R(rng, -6, 6);
  if (k === 0) {
    const x = R(rng, -6, 6);
    const v = a * x + b;
    return qNum(ctx, id, d, L(`The function is ${kx(a, b)}. Find ${iv('y')} at ${X} = ${nm(x)}.`, `Функция задана формулой ${kx(a, b)}. Найди ${iv('y')} при ${X} = ${nm(x)}.`, `Функция ${kx(a, b)} формуласымен берілген. ${X} = ${nm(x)} болғанда ${iv('y')} мәнін тап.`),
      [same(`${iv('y')} = ${nm(a)} · ${pr(x)}${sg(b)} = ${nm(v)}`)], v, [why(a * x - b, L('Check the sign of b.', 'Проверь знак у b.', 'b-ның таңбасын тексер.')), a + x + b, -v], { min: -1e9 });
  }
  if (k === 1) {
    const x = R(rng, -6, 6);
    const v = a * x + b;
    return qNum(ctx, id, d, L(`For the function ${kx(a, b)} find ${X} at which ${iv('y')} = ${nm(v)}.`, `Для функции ${kx(a, b)} найди ${X}, при котором ${iv('y')} = ${nm(v)}.`, `${kx(a, b)} функциясы үшін ${iv('y')} = ${nm(v)} болатын ${X} мәнін тап.`),
      [same(`${nm(a)}${X}${sg(b)} = ${nm(v)}`), same(`${X} = (${nm(v)}${sg(-b)}) : ${pr(a)} = ${nm(x)}`)], x, [a * v + b, -x, x + 1], { min: -1e9 });
  }
  if (k === 2) {
    const kk = one(rng, [-3, -2, -1, 1, 2, 3]);
    const bb = R(rng, -3, 3);
    const wrong = [kx(-kk, bb), kx(kk, -bb || 2), kx(-kk, -bb || -2), kx(kk, bb + (bb > 0 ? -1 : 1) * 2)];
    return qText(ctx, id, d, L('Which formula matches the graph?', 'Какой формуле соответствует график?', 'График қай формулаға сәйкес келеді?'),
      [L(`The line crosses the ${iv('y')}-axis at ${nm(bb)}, so b = ${nm(bb)}.`, `Прямая пересекает ось ${iv('y')} в точке ${nm(bb)}, значит b = ${nm(bb)}.`, `Түзу ${iv('y')} осін ${nm(bb)} нүктесінде қияды, демек b = ${nm(bb)}.`), L(`When ${X} grows by 1, ${iv('y')} changes by ${nm(kk)}: k = ${nm(kk)}.`, `При увеличении ${X} на 1 значение ${iv('y')} меняется на ${nm(kk)}: k = ${nm(kk)}.`, `${X} 1-ге артқанда ${iv('y')} ${nm(kk)}-ге өзгереді: k = ${nm(kk)}.`), same(kx(kk, bb))],
      same(kx(kk, bb)), wrong.map(same), { fig: plot({ fns: [{ f: (x) => kk * x + bb }], xr: [-5, 5], yr: [-5, 5] }) });
  }
  if (k === 3) {
    const x0 = NZ(rng, -6, 6);
    const kk = NZ(rng, -4, 4);
    const bb = -kk * x0;
    const toY = rng() < 0.5;
    if (toY) return qNum(ctx, id, d, L(`At what point does the graph of ${kx(kk, bb)} cross the ${iv('y')}-axis? Give its ordinate.`, `В какой точке график функции ${kx(kk, bb)} пересекает ось ${iv('y')}? Укажи ординату.`, `${kx(kk, bb)} функциясының графигі ${iv('y')} осін қай нүктеде қияды? Ординатасын жаз.`), [L(`On the ${iv('y')}-axis ${X} = 0, so ${iv('y')} = b.`, `На оси ${iv('y')} ${X} = 0, поэтому ${iv('y')} = b.`, `${iv('y')} осінде ${X} = 0, сондықтан ${iv('y')} = b.`), ans(nm(bb))], bb, [x0, kk, -bb], { min: -1e9 });
    return qNum(ctx, id, d, L(`Find the abscissa of the point where the graph of ${kx(kk, bb)} crosses the ${X}-axis.`, `Найди абсциссу точки пересечения графика функции ${kx(kk, bb)} с осью ${X}.`, `${kx(kk, bb)} функциясы графигінің ${X} осімен қиылысу нүктесінің абсциссасын тап.`),
      [L(`On the ${X}-axis ${iv('y')} = 0.`, `На оси ${X} значение ${iv('y')} = 0.`, `${X} осінде ${iv('y')} = 0.`), same(`${nm(kk)}${X}${sg(bb)} = 0 → ${X} = ${nm(x0)}`)], x0, [why(bb, L('That is where the graph meets the y-axis.', 'Это точка пересечения с осью y.', 'Бұл - y осімен қиылысу нүктесі.')), -x0, kk], { min: -1e9 });
  }
  if (k === 4) {
    const k2 = a;
    const b2 = b === 3 ? 1 : 3;
    return qText(ctx, id, d, L(`Which line is parallel to the graph of ${kx(a, b)}?`, `Какая прямая параллельна графику функции ${kx(a, b)}?`, `Қай түзу ${kx(a, b)} функциясының графигіне параллель?`),
      [L('Lines y = kx + b are parallel when the slopes k are equal and b are different.', 'Прямые y = kx + b параллельны, если угловые коэффициенты k равны, а b разные.', 'y = kx + b түзулері бұрыштық коэффициенттері k тең, ал b әртүрлі болса, параллель.'), same(kx(k2, b2))],
      same(kx(k2, b2)), [same(kx(-a, b2)), same(kx(a === 1 ? 2 : 1, b)), same(kx(-a, b)), same(kx(a * 2, b2))]);
  }
  // точка пересечения двух прямых
  const x0 = R(rng, -5, 5);
  const y0 = R(rng, -6, 6);
  const k1 = NZ(rng, -4, 4);
  let k2 = NZ(rng, -4, 4);
  if (k2 === k1) k2 = -k1;
  const b1 = y0 - k1 * x0;
  const b2 = y0 - k2 * x0;
  return qNum(ctx, id, d, L(`Find the abscissa of the intersection point of the lines ${kx(k1, b1)} and ${kx(k2, b2)}.`, `Найди абсциссу точки пересечения прямых ${kx(k1, b1)} и ${kx(k2, b2)}.`, `${kx(k1, b1)} және ${kx(k2, b2)} түзулерінің қиылысу нүктесінің абсциссасын тап.`),
    [L('At the intersection point the y values are equal.', 'В точке пересечения значения y равны.', 'Қиылысу нүктесінде y мәндері тең.'), same(`${nm(k1)}${X}${sg(b1)} = ${nm(k2)}${X}${sg(b2)} → ${nm(k1 - k2)}${X} = ${nm(b2 - b1)} → ${X} = ${nm(x0)}`)],
    x0, [why(y0, L('That is the ordinate (y) of the point.', 'Это ордината (y) точки.', 'Бұл - нүктенің ординатасы (y).')), -x0, x0 + 1], { min: -1e9 });
}

// ---------- Статистика: мода, медиана, размах ----------

export function stat7(ctx, d) {
  const { rng } = ctx;
  const id = 'm.stat7';
  const len = d === 1 ? one(rng, [5, 7]) : one(rng, [6, 8, 7, 9]);
  const data = [];
  const modeV = R(rng, 2, 30);
  for (let i = 0; i < len; i++) data.push(R(rng, 1, 40));
  // мода - единственная: одно значение встречается трижды, остальные различны
  const uniq = [...new Set(data.filter((x) => x !== modeV))].slice(0, len - 3);
  while (uniq.length < len - 3) {
    const x = R(rng, 1, 45);
    if (x !== modeV && !uniq.includes(x)) uniq.push(x);
  }
  const arr = [...uniq, modeV, modeV, modeV].map((x) => [rng(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  const sorted = [...arr].sort((p, q) => p - q);
  const med = len % 2 ? sorted[(len - 1) / 2] : (sorted[len / 2 - 1] + sorted[len / 2]) / 2;
  const range = sorted[len - 1] - sorted[0];
  const sum = arr.reduce((s, x) => s + x, 0);
  const list = arr.join('; ');
  const k = R(rng, 0, d === 1 ? 2 : 4);
  const intro = (en, ru, kk) => L(`Data: ${list}. ${en}`, `Ряд чисел: ${list}. ${ru}`, `Сандар қатары: ${list}. ${kk}`);
  const sortStep = L(`Sorted: ${sorted.join('; ')}.`, `Упорядочим: ${sorted.join('; ')}.`, `Ретке келтіреміз: ${sorted.join('; ')}.`);
  if (k === 0) return qNum(ctx, id, d, intro('Find the mode.', 'Найди моду.', 'Модасын тап.'), [L('The mode is the value that occurs most often.', 'Мода - число, которое встречается чаще всего.', 'Мода - ең жиі кездесетін сан.'), L(`${modeV} occurs 3 times.`, `${modeV} встречается 3 раза.`, `${modeV} саны 3 рет кездеседі.`)], modeV, [why(med, L('That is the median.', 'Это медиана.', 'Бұл - медиана.')), sorted[len - 1], arr[0]], { fmt: dec });
  if (k === 1) return qNum(ctx, id, d, intro('Find the median.', 'Найди медиану.', 'Медианасын тап.'), [sortStep, len % 2 ? L('The median is the middle number.', 'Медиана - число в середине.', 'Медиана - ортасындағы сан.') : L('Even count: the median is the mean of the two middle numbers.', 'Чисел чётное количество: медиана - среднее двух средних.', 'Сандар саны жұп: медиана - ортадағы екі санның арифметикалық ортасы.'), ans(dec(med).ru === dec(med).en ? n(med) : `${dec(med).en}`)].map((x, i) => (i === 2 ? L(`Answer: ${dec(med).en}.`, `Ответ: ${dec(med).ru}.`, `Жауабы: ${dec(med).kk}.`) : x)), med, [why(len % 2 ? arr[(len - 1) / 2] : (arr[len / 2 - 1] + arr[len / 2]) / 2, L('Sort the numbers first.', 'Сначала упорядочи числа.', 'Алдымен сандарды ретке келтір.')), modeV, Math.round((sum / len) * 10) / 10], { fmt: dec });
  if (k === 2) return qNum(ctx, id, d, intro('Find the range.', 'Найди размах.', 'Құлашын тап.'), [L('Range = largest − smallest.', 'Размах = наибольшее − наименьшее.', 'Құлаш = ең үлкені − ең кішісі.'), same(`${sorted[len - 1]} ${M} ${sorted[0]} = ${range}`)], range, [why(sorted[len - 1], L('Subtract the smallest number.', 'Нужно вычесть наименьшее число.', 'Ең кіші санды азайту керек.')), Math.abs(arr[len - 1] - arr[0]) === range ? range + 1 : Math.abs(arr[len - 1] - arr[0]), sorted[len - 1] + sorted[0]]);
  if (k === 3) {
    const extra = R(rng, 1, 40);
    const target = Math.round(((sum + extra) / (len + 1)) * 100) / 100;
    if (!Number.isInteger(((sum + extra) * 10) / (len + 1))) return stat7(ctx, d);
    return qNum(ctx, id, d, intro(`The number ${extra} is added. Find the new mean.`, `К ряду добавили число ${extra}. Найди новое среднее арифметическое.`, `Қатарға ${extra} саны қосылды. Жаңа арифметикалық ортасын тап.`),
      [same(`(${sum} + ${extra}) : ${len + 1} = ${dec(target).ru}`)].map(() => L(`(${sum} + ${extra}) : ${len + 1} = ${dec(target).en}`, `(${sum} + ${extra}) : ${len + 1} = ${dec(target).ru}`, `(${sum} + ${extra}) : ${len + 1} = ${dec(target).kk}`)), target, [Math.round(((sum + extra) / len) * 100) / 100, Math.round((sum / len) * 100) / 100, target + 1], { fmt: dec });
  }
  const mean = R(rng, 5, 30);
  const known = Array.from({ length: len - 1 }, () => R(rng, Math.max(1, mean - 10), mean + 10));
  const miss = mean * len - known.reduce((s, x) => s + x, 0);
  if (miss < 0) return stat7(ctx, d);
  return qNum(ctx, id, d, L(`The mean of ${len} numbers is ${mean}. ${len - 1} of them are ${known.join('; ')}. Find the last number.`, `Среднее арифметическое ${len} чисел равно ${mean}. ${len - 1} из них: ${known.join('; ')}. Найди последнее число.`, `${len} санның арифметикалық ортасы ${mean}. Олардың ${len - 1} саны: ${known.join('; ')}. Соңғы санды тап.`),
    [L(`Sum of all numbers = ${mean} × ${len} = ${mean * len}.`, `Сумма всех чисел = ${mean} × ${len} = ${mean * len}.`, `Барлық сандардың қосындысы = ${mean} × ${len} = ${mean * len}.`), same(`${mean * len} ${M} ${known.reduce((s, x) => s + x, 0)} = ${miss}`)], miss, [mean, miss + mean, Math.abs(mean * (len - 1) - known.reduce((s, x) => s + x, 0))]);
}

// ---------- Начальные понятия геометрии ----------

const segFig = (labels, marks) => scene({ P: Object.fromEntries(labels.map(([nme, x]) => [nme, [x, 0]])), segs: [[labels[0][0], labels[labels.length - 1][0]]], dots: labels.map((l) => l[0]), lab: Object.fromEntries(labels.map(([nme]) => [nme, [0, -14]])), sides: marks, h: 80, pad: 20 });

export function geoBasic(ctx, d) {
  const { rng } = ctx;
  const id = 'm.geobasic';
  const k = R(rng, 0, d === 1 ? 3 : 5);
  if (k === 0) {
    const a = R(rng, 2, 15);
    const b = R(rng, 2, 15);
    const unit = d === 1 ? 'cm' : 'dm';
    const U = L(unit, unit === 'cm' ? 'см' : 'дм', unit === 'cm' ? 'см' : 'дм');
    const between = rng() < 0.5;
    if (between)
      return qNum(ctx, id, d, L(`Point B lies on segment AC. AB = ${a} ${U.en}, BC = ${b} ${U.en}. Find AC.`, `Точка B лежит на отрезке AC. AB = ${a} ${U.ru}, BC = ${b} ${U.ru}. Найди AC.`, `B нүктесі AC кесіндісінде жатыр. AB = ${a} ${U.kk}, BC = ${b} ${U.kk}. AC кесіндісін тап.`),
        [L('The whole segment equals the sum of its parts.', 'Длина отрезка равна сумме длин его частей.', 'Кесіндінің ұзындығы оның бөліктерінің ұзындықтарының қосындысына тең.'), same(`AC = ${a} + ${b} = ${a + b}`)], a + b, [Math.abs(a - b), a * b, a + b + 1], { fig: segFig([['A', 0], ['B', a], ['C', a + b]], [['A', 'B', String(a)], ['B', 'C', String(b)]]) });
    const big = a + b;
    return qNum(ctx, id, d, L(`Point C lies on segment AB. AB = ${big} ${U.en}, AC = ${a} ${U.en}. Find CB.`, `Точка C лежит на отрезке AB. AB = ${big} ${U.ru}, AC = ${a} ${U.ru}. Найди CB.`, `C нүктесі AB кесіндісінде жатыр. AB = ${big} ${U.kk}, AC = ${a} ${U.kk}. CB кесіндісін тап.`),
      [same(`CB = AB ${M} AC = ${big} ${M} ${a} = ${b}`)], b, [big + a, a, b + 1], { fig: segFig([['A', 0], ['C', a], ['B', big]], [['A', 'B', '']]) });
  }
  if (k === 1) {
    const half = R(rng, 2, 30) + (d > 1 && rng() < 0.5 ? 0.5 : 0);
    const toWhole = rng() < 0.5;
    const val = toWhole ? half * 2 : half;
    const given = toWhole ? half : half * 2;
    return qNum(ctx, id, d, toWhole ? loc((l) => ({ en: `M is the midpoint of segment AB, AM = ${dl(given, l)} cm. Find AB.`, ru: `M - середина отрезка AB, AM = ${dl(given, l)} см. Найди AB.`, kk: `M - AB кесіндісінің ортасы, AM = ${dl(given, l)} см. AB кесіндісін тап.` })[l]) : loc((l) => ({ en: `M is the midpoint of segment AB, AB = ${dl(given, l)} cm. Find AM.`, ru: `M - середина отрезка AB, AB = ${dl(given, l)} см. Найди AM.`, kk: `M - AB кесіндісінің ортасы, AB = ${dl(given, l)} см. AM кесіндісін тап.` })[l]),
      [L('The midpoint divides a segment into two equal parts.', 'Середина делит отрезок на две равные части.', 'Кесіндінің ортасы оны екі тең бөлікке бөледі.'), loc((l) => (toWhole ? `AB = 2 · ${dl(given, l)} = ${dl(val, l)}` : `AM = ${dl(given, l)} : 2 = ${dl(val, l)}`))], val, [toWhole ? half : half * 4, val + 1, val * 2], { fmt: dec });
  }
  if (k === 2) {
    const nPts = R(rng, 3, d === 1 ? 6 : 10);
    const kind = R(rng, 0, d === 1 ? 0 : 2);
    if (kind === 0) {
      const v = (nPts * (nPts - 1)) / 2;
      return qNum(ctx, id, d, L(`${nPts} points are marked on a line. How many segments with ends at these points are there?`, `На прямой отметили ${nPts} точек. Сколько получилось отрезков с концами в этих точках?`, `Түзуде ${nPts} нүкте белгіленді. Ұштары осы нүктелерде болатын неше кесінді бар?`).ru.includes('5 точек') ? L(`${nPts} points are marked on a line. How many segments with ends at these points are there?`, `На прямой отметили ${nPts} точек. Сколько получилось отрезков с концами в этих точках?`, `Түзуде ${nPts} нүкте белгіленді. Ұштары осы нүктелерде болатын неше кесінді бар?`) : L(`${nPts} points are marked on a line. How many segments with ends at these points are there?`, `На прямой отметили ${nPts} ${nPts < 5 ? 'точки' : 'точек'}. Сколько получилось отрезков с концами в этих точках?`, `Түзуде ${nPts} нүкте белгіленді. Ұштары осы нүктелерде болатын неше кесінді бар?`),
        [L(`Each point pairs with ${nPts - 1} others; every segment is counted twice.`, `Каждая точка соединяется с ${nPts - 1} другими; каждый отрезок посчитан дважды.`, `Әр нүкте қалған ${nPts - 1} нүктемен қосылады; әр кесінді екі рет саналады.`), same(`${nPts} · ${nPts - 1} : 2 = ${v}`)], v, [why(nPts - 1, L('Those are only the shortest neighbouring segments.', 'Это только соседние отрезки.', 'Бұл - тек көрші кесінділер.')), nPts * (nPts - 1), nPts]);
    }
    if (kind === 1) {
      const v = 2 * nPts;
      return qNum(ctx, id, d, L(`${nPts} points are marked on a line. How many rays start at these points and lie on this line?`, `На прямой отметили ${nPts} ${nPts < 5 ? 'точки' : 'точек'}. Сколько лучей этой прямой начинается в отмеченных точках?`, `Түзуде ${nPts} нүкте белгіленді. Осы түзудің белгіленген нүктелерден басталатын неше сәулесі бар?`),
        [L('Each point divides the line into two rays.', 'Каждая точка делит прямую на два луча.', 'Әр нүкте түзуді екі сәулеге бөледі.'), same(`2 · ${nPts} = ${v}`)], v, [nPts, (nPts * (nPts - 1)) / 2 === v ? v + 1 : (nPts * (nPts - 1)) / 2, v - 2]);
    }
    const v = (nPts * (nPts - 1)) / 2;
    return qNum(ctx, id, d, L(`${nPts} points are marked on a plane, no three on one line. How many lines pass through two of them?`, `На плоскости отметили ${nPts} ${nPts < 5 ? 'точки' : 'точек'}, никакие три не лежат на одной прямой. Сколько прямых проходит через пары этих точек?`, `Жазықтықта ${nPts} нүкте белгіленді, кез келген үшеуі бір түзуде жатпайды. Осы нүктелердің жұптары арқылы неше түзу өтеді?`),
      [L('Through two points there is exactly one line.', 'Через две точки проходит ровно одна прямая.', 'Екі нүкте арқылы бір ғана түзу өтеді.'), same(`${nPts} · ${nPts - 1} : 2 = ${v}`)], v, [nPts * (nPts - 1), nPts, v + nPts]);
  }
  if (k === 3) {
    const a = R(rng, 1, 179);
    const ang = one(rng, [a, a, 90, 180]);
    const T = [L('acute', 'острый', 'сүйір'), L('right', 'прямой', 'тік'), L('obtuse', 'тупой', 'доғал'), L('straight', 'развёрнутый', 'жазыңқы')];
    const i = ang < 90 ? 0 : ang === 90 ? 1 : ang < 180 ? 2 : 3;
    return qText(ctx, id, d, L(`An angle is ${deg(ang)}. What kind of angle is it?`, `Угол равен ${deg(ang)}. Какой это угол?`, `Бұрыш ${deg(ang)}-қа тең. Бұл қандай бұрыш?`.replace('-қа', ang % 10 === 0 || [2, 7].includes(ang % 10) ? '-қа' : '-ке'),
      [L('Acute < 90°, right = 90°, obtuse between 90° and 180°, straight = 180°.', 'Острый < 90°, прямой = 90°, тупой - от 90° до 180°, развёрнутый = 180°.', 'Сүйір < 90°, тік = 90°, доғал - 90°-тан 180°-қа дейін, жазыңқы = 180°.'), T[i]], T[i], T.filter((_, j) => j !== i));
  }
  if (k === 4) {
    const whole = 2 * R(rng, 10, 89);
    const toHalf = rng() < 0.5;
    const P = { O: [0, 0], A: [1.6, 0], B: [1.6 * Math.cos((whole * Math.PI) / 180), 1.6 * Math.sin((whole * Math.PI) / 180)], C: [1.6 * Math.cos((whole * Math.PI) / 360), 1.6 * Math.sin((whole * Math.PI) / 360)] };
    const fig = scene({ P, segs: [['O', 'A'], ['O', 'B'], ['O', 'C']], angles: [['A', 'O', 'C', '', 18], ['C', 'O', 'B', '', 24]], h: 160 });
    if (toHalf)
      return qNum(ctx, id, d, L(`Ray OC is the bisector of ∠AOB = ${deg(whole)}. Find ∠AOC.`, `Луч OC - биссектриса угла AOB, ∠AOB = ${deg(whole)}. Найди ∠AOC.`, `OC сәулесі - AOB бұрышының биссектрисасы, ∠AOB = ${deg(whole)}. ∠AOC бұрышын тап.`),
        [L('A bisector divides an angle in half.', 'Биссектриса делит угол пополам.', 'Биссектриса бұрышты қақ бөледі.'), same(`${whole}° : 2 = ${whole / 2}°`)], whole / 2, [whole, 180 - whole / 2, whole / 2 + 10], { fig });
    return qNum(ctx, id, d, L(`Ray OC is the bisector of ∠AOB, ∠AOC = ${deg(whole / 2)}. Find ∠AOB.`, `Луч OC - биссектриса угла AOB, ∠AOC = ${deg(whole / 2)}. Найди ∠AOB.`, `OC сәулесі - AOB бұрышының биссектрисасы, ∠AOC = ${deg(whole / 2)}. ∠AOB бұрышын тап.`),
      [same(`∠AOB = 2 · ${whole / 2}° = ${whole}°`)], whole, [whole / 4 === Math.round(whole / 4) ? whole / 4 : whole + 2, 180 - whole / 2, whole + 10], { fig });
  }
  // угол между лучами: OC внутри угла AOB
  const ab = R(rng, 40, 170);
  const ac = R(rng, 10, ab - 10);
  const P = { O: [0, 0], A: [1.6, 0], B: [1.6 * Math.cos((ab * Math.PI) / 180), 1.6 * Math.sin((ab * Math.PI) / 180)], C: [1.6 * Math.cos((ac * Math.PI) / 180), 1.6 * Math.sin((ac * Math.PI) / 180)] };
  return qNum(ctx, id, d, L(`Ray OC lies inside ∠AOB. ∠AOB = ${deg(ab)}, ∠AOC = ${deg(ac)}. Find ∠COB.`, `Луч OC проходит внутри угла AOB. ∠AOB = ${deg(ab)}, ∠AOC = ${deg(ac)}. Найди ∠COB.`, `OC сәулесі AOB бұрышының ішінен өтеді. ∠AOB = ${deg(ab)}, ∠AOC = ${deg(ac)}. ∠COB бұрышын тап.`),
    [L('The ray divides the angle into two parts whose sum is the whole angle.', 'Луч делит угол на два угла, сумма которых равна всему углу.', 'Сәуле бұрышты қосындысы бүкіл бұрышқа тең екі бұрышқа бөледі.'), same(`∠COB = ${ab}° ${M} ${ac}° = ${ab - ac}°`)], ab - ac, [ab + ac, 180 - ac, ab - ac + 10], { fig: scene({ P, segs: [['O', 'A'], ['O', 'B'], ['O', 'C']], angles: [['A', 'O', 'C', '', 18]], h: 160 }) });
}

// ---------- Смежные и вертикальные углы ----------

function crossFig(t, label) {
  const r = (a) => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)];
  const P = { O: [0, 0], A: r(0), B: r(180), C: r(t), D: r(t + 180) };
  return scene({ P, segs: [['A', 'B'], ['C', 'D']], angles: [['A', 'O', 'C', label]], h: 150 });
}

export function adjVert(ctx, d) {
  const { rng } = ctx;
  const id = 'm.adjvert';
  const k = R(rng, 0, d === 1 ? 2 : 4);
  const a = R(rng, 15, 165);
  if (k === 0) return qNum(ctx, id, d, L(`One of two adjacent angles is ${deg(a)}. Find the other.`, `Один из смежных углов равен ${deg(a)}. Найди другой.`, `Сыбайлас бұрыштардың бірі ${deg(a)}. Екіншісін тап.`), [L('Adjacent angles add up to 180°.', 'Сумма смежных углов равна 180°.', 'Сыбайлас бұрыштардың қосындысы 180°-қа тең.'), same(`180° ${M} ${a}° = ${180 - a}°`)], 180 - a, [why(90 - a > 0 ? 90 - a : a, L('Adjacent angles add up to 180°, not 90°.', 'Сумма смежных углов 180°, а не 90°.', 'Сыбайлас бұрыштардың қосындысы 90° емес, 180°.')), 360 - a, a]);
  if (k === 1) {
    const which = R(rng, 0, 2);
    const ang = ['∠BOD', '∠BOC', '∠AOD'][which];
    const v = which === 0 ? a : 180 - a;
    return qNum(ctx, id, d, L(`Lines AB and CD intersect at O, ∠AOC = ${deg(a)}. Find ${ang}.`, `Прямые AB и CD пересекаются в точке O, ∠AOC = ${deg(a)}. Найди ${ang}.`, `AB және CD түзулері O нүктесінде қиылысады, ∠AOC = ${deg(a)}. ${ang} бұрышын тап.`),
      [which === 0 ? L('∠BOD and ∠AOC are vertical, vertical angles are equal.', '∠BOD и ∠AOC вертикальные, а вертикальные углы равны.', '∠BOD және ∠AOC - вертикаль бұрыштар, олар тең.') : L(`${ang} and ∠AOC are adjacent: their sum is 180°.`, `${ang} и ∠AOC смежные: их сумма 180°.`, `${ang} мен ∠AOC - сыбайлас бұрыштар: қосындысы 180°.`), ans(`${v}°`)], v, [which === 0 ? 180 - a : a, 360 - a, v + 10], { fig: crossFig(a, `${a}°`) });
  }
  if (k === 2) {
    const diff = 2 * R(rng, 5, 60);
    const small = (180 - diff) / 2;
    const wantBig = rng() < 0.5;
    const v = wantBig ? small + diff : small;
    return qNum(ctx, id, d, L(`One of two adjacent angles is ${diff}° greater than the other. Find the ${wantBig ? 'larger' : 'smaller'} angle.`, `Один из смежных углов на ${diff}° больше другого. Найди ${wantBig ? 'больший' : 'меньший'} угол.`, `Сыбайлас бұрыштардың бірі екіншісінен ${diff}°-қа үлкен. ${wantBig ? 'Үлкен' : 'Кіші'} бұрышты тап.`),
      [same(`${X} + (${X} + ${diff}°) = 180°`), same(`2${X} = ${180 - diff}°, ${X} = ${small}°; ${small}° + ${diff}° = ${small + diff}°`)], v, [wantBig ? small : small + diff, 180 - diff, diff], {});
  }
  if (k === 3) {
    const [p, q] = one(rng, [[1, 2], [1, 3], [2, 3], [1, 4], [1, 5], [2, 7], [4, 5], [3, 7], [1, 8], [5, 7], [7, 11], [1, 9]]);
    const unit = 180 / (p + q);
    const wantBig = rng() < 0.5;
    const v = (wantBig ? q : p) * unit;
    return qNum(ctx, id, d, L(`Two adjacent angles are in the ratio ${p} : ${q}. Find the ${wantBig ? 'larger' : 'smaller'} angle.`, `Смежные углы относятся как ${p} : ${q}. Найди ${wantBig ? 'больший' : 'меньший'} из них.`, `Сыбайлас бұрыштар ${p} : ${q} қатынасындай. ${wantBig ? 'Үлкенін' : 'Кішісін'} тап.`),
      [same(`${p}${X} + ${q}${X} = 180°, ${X} = ${n(unit)}°`), same(`${wantBig ? q : p} · ${n(unit)}° = ${n(v)}°`)], v, [(wantBig ? p : q) * unit, (360 / (p + q)) * (wantBig ? q : p), v + 10], { fmt: dec });
  }
  const sum = 2 * R(rng, 20, 89);
  const asked = rng() < 0.5;
  const each = sum / 2;
  return qNum(ctx, id, d, asked ? L(`Two lines intersect. The sum of two of the angles formed is ${deg(sum)}. Find the larger of the four angles.`, `Две прямые пересекаются. Сумма двух из образовавшихся углов равна ${deg(sum)}. Найди больший из четырёх углов.`, `Екі түзу қиылысады. Пайда болған бұрыштардың екеуінің қосындысы ${deg(sum)}. Төрт бұрыштың үлкенін тап.`) : L(`Two lines intersect. The sum of two of the angles formed is ${deg(sum)}. Find each of these angles.`, `Две прямые пересекаются. Сумма двух из образовавшихся углов равна ${deg(sum)}. Найди каждый из этих углов.`, `Екі түзу қиылысады. Пайда болған бұрыштардың екеуінің қосындысы ${deg(sum)}. Осы бұрыштардың әрқайсысын тап.`),
    [L('Two adjacent angles would give 180°, so these two angles are vertical, hence equal.', 'Сумма смежных была бы 180°, значит, это вертикальные углы - они равны.', 'Сыбайлас бұрыштар болса, қосындысы 180° болар еді, демек бұлар - вертикаль бұрыштар, олар тең.'), same(`${sum}° : 2 = ${each}°${asked ? `, 180° ${M} ${each}° = ${180 - each}°` : ''}`)], asked ? 180 - each : each, [asked ? each : 180 - each, 180 - sum, sum]);
}

// ---------- Признаки равенства треугольников ----------

const TRIS = [['ABC', 'KLM'], ['ABC', 'DEF'], ['MNP', 'RST'], ['ABC', 'A₁B₁C₁'], ['KMN', 'PQR'], ['DEF', 'XYZ']];

export function congr(ctx, d) {
  const { rng } = ctx;
  const id = 'm.congr';
  const [t1, t2raw] = one(rng, TRIS);
  const t2 = t2raw.includes('₁') ? ['A₁', 'B₁', 'C₁'] : [...t2raw];
  const v1 = [...t1];
  const k = R(rng, 0, d === 1 ? 1 : 3);
  if (k === 0) {
    // соответствие сторон и углов
    const perm = one(rng, [[0, 1, 2], [0, 2, 1], [1, 0, 2], [2, 1, 0], [1, 2, 0], [2, 0, 1]]);
    const T2 = perm.map((i) => t2[i]);
    const sides = [R(rng, 3, 9), R(rng, 4, 11), R(rng, 5, 12)];
    const pairs = [[0, 1], [1, 2], [0, 2]];
    const askI = R(rng, 0, 2);
    const nm2 = (p) => `${T2[p[0]]}${T2[p[1]]}`;
    const nm1 = (p) => `${v1[p[0]]}${v1[p[1]]}`;
    if (rng() < 0.5) {
      const given = pairs.map((p, i) => `${nm1(p)} = ${sides[i]}`).join(', ');
      return qNum(ctx, id, d, L(`△${t1} = △${T2.join('')}, ${given}. Find ${nm2(pairs[askI])}.`, `△${t1} = △${T2.join('')}, ${given}. Найди ${nm2(pairs[askI])}.`, `△${t1} = △${T2.join('')}, ${given}. ${nm2(pairs[askI])} қабырғасын тап.`),
        [L('In equal triangles the corresponding sides are equal; vertices are listed in matching order.', 'В равных треугольниках соответственные стороны равны; вершины записаны в соответствующем порядке.', 'Тең үшбұрыштарда сәйкес қабырғалар тең; төбелер сәйкес ретпен жазылады.'), same(`${nm2(pairs[askI])} = ${nm1(pairs[askI])} = ${sides[askI]}`)], sides[askI], sides.filter((_, i) => i !== askI).concat([sides.reduce((s, x) => s + x, 0)]));
    }
    const A = R(rng, 30, 80);
    const B = R(rng, 30, 150 - A);
    const angs = [A, B, 180 - A - B];
    const ai = R(rng, 0, 2);
    const known = [0, 1, 2].filter((i) => i !== ai);
    return qNum(ctx, id, d, L(`△${t1} = △${T2.join('')}, ∠${v1[known[0]]} = ${angs[known[0]]}°, ∠${v1[known[1]]} = ${angs[known[1]]}°. Find ∠${T2[ai]}.`, `△${t1} = △${T2.join('')}, ∠${v1[known[0]]} = ${angs[known[0]]}°, ∠${v1[known[1]]} = ${angs[known[1]]}°. Найди ∠${T2[ai]}.`, `△${t1} = △${T2.join('')}, ∠${v1[known[0]]} = ${angs[known[0]]}°, ∠${v1[known[1]]} = ${angs[known[1]]}°. ∠${T2[ai]} бұрышын тап.`),
      [L(`∠${T2[ai]} corresponds to ∠${v1[ai]}.`, `∠${T2[ai]} соответствует ∠${v1[ai]}.`, `∠${T2[ai]} бұрышы ∠${v1[ai]} бұрышына сәйкес.`), same(`∠${v1[ai]} = 180° ${M} ${angs[known[0]]}° ${M} ${angs[known[1]]}° = ${angs[ai]}°`)], angs[ai], [angs[known[0]], angs[known[1]], 180 - angs[ai]]);
  }
  if (k === 1) {
    const sum = [R(rng, 3, 15), R(rng, 3, 15), R(rng, 3, 15)].sort((p, q) => p - q);
    if (sum[0] + sum[1] <= sum[2]) sum[2] = sum[0] + sum[1] - 1;
    const P = sum[0] + sum[1] + sum[2];
    return qNum(ctx, id, d, L(`△${t1} = △${t2.join('')}. The sides of △${t1} are ${sum.join(', ')} cm. Find the perimeter of △${t2.join('')}.`, `△${t1} = △${t2.join('')}. Стороны △${t1} равны ${sum.join(', ')} см. Найди периметр △${t2.join('')}.`, `△${t1} = △${t2.join('')}. △${t1} қабырғалары ${sum.join(', ')} см. △${t2.join('')} периметрін тап.`),
      [L('Equal triangles have equal sides, so equal perimeters.', 'У равных треугольников стороны равны, значит, равны и периметры.', 'Тең үшбұрыштардың қабырғалары тең, демек периметрлері де тең.'), same(`${sum.join(' + ')} = ${P}`)], P, [2 * P, sum[2], P - sum[0]]);
  }
  if (k === 2) {
    const T = [L('by two sides and the included angle (SAS)', 'по двум сторонам и углу между ними', 'екі қабырғасы және олардың арасындағы бұрышы бойынша'), L('by a side and two adjacent angles (ASA)', 'по стороне и двум прилежащим к ней углам', 'бір қабырғасы және оған іргелес екі бұрышы бойынша'), L('by three sides (SSS)', 'по трём сторонам', 'үш қабырғасы бойынша'), L('the data are not enough', 'данных недостаточно', 'деректер жеткіліксіз')];
    const [A, B, C] = v1;
    const [A2, B2, C2] = t2;
    const cases = [
      [0, `${A}${B} = ${A2}${B2}, ${A}${C} = ${A2}${C2}, ∠${A} = ∠${A2}`],
      [0, `${B}${A} = ${B2}${A2}, ${B}${C} = ${B2}${C2}, ∠${B} = ∠${B2}`],
      [1, `${A}${B} = ${A2}${B2}, ∠${A} = ∠${A2}, ∠${B} = ∠${B2}`],
      [1, `${B}${C} = ${B2}${C2}, ∠${B} = ∠${B2}, ∠${C} = ∠${C2}`],
      [2, `${A}${B} = ${A2}${B2}, ${B}${C} = ${B2}${C2}, ${A}${C} = ${A2}${C2}`],
      [3, `∠${A} = ∠${A2}, ∠${B} = ∠${B2}, ∠${C} = ∠${C2}`],
      [3, `${A}${B} = ${A2}${B2}, ${B}${C} = ${B2}${C2}, ∠${A} = ∠${A2}`],
      [3, `${A}${B} = ${A2}${B2}, ∠${A} = ∠${A2}`],
    ];
    const [i, data] = one(rng, cases);
    return qText(ctx, id, d, L(`In △${t1} and △${t2.join('')}: ${data}. By which criterion are the triangles equal?`, `В △${t1} и △${t2.join('')}: ${data}. По какому признаку треугольники равны?`, `△${t1} және △${t2.join('')} үшін: ${data}. Үшбұрыштар қай белгі бойынша тең?`),
      [i === 3 ? L('Equal angles only, or two sides and an angle that is not between them, do not guarantee equal triangles.', 'Равенство только углов или двух сторон и угла не между ними не гарантирует равенства треугольников.', 'Тек бұрыштардың немесе екі қабырға мен олардың арасында емес бұрыштың теңдігі үшбұрыштардың теңдігіне кепіл емес.') : L('Check which elements are given and how they are placed.', 'Смотрим, какие элементы даны и как они расположены.', 'Қандай элементтер берілгенін және қалай орналасқанын қараймыз.'), T[i]], T[i], T.filter((_, j) => j !== i));
  }
  // отрезки AB и CD пересекаются в своей середине O
  const ac = R(rng, 3, 15);
  const ang = R(rng, 25, 80);
  const angB = R(rng, 25, 150 - ang);
  const P = { A: [0, 2], B: [4, 0], C: [0, 0], D: [4, 2], O: [2, 1] };
  const fig = scene({ P, segs: [['A', 'B'], ['C', 'D'], ['A', 'C'], ['D', 'B']], ticks: [['A', 'O', 1], ['O', 'B', 1], ['C', 'O', 2], ['O', 'D', 2]], h: 150 });
  if (rng() < 0.5)
    return qNum(ctx, id, d, L(`Segments AB and CD intersect at their common midpoint O. AC = ${ac} cm. Find BD.`, `Отрезки AB и CD пересекаются в точке O, которая является серединой каждого из них. AC = ${ac} см. Найди BD.`, `AB және CD кесінділері әрқайсысының ортасы болатын O нүктесінде қиылысады. AC = ${ac} см. BD кесіндісін тап.`),
      [L('AO = OB, CO = OD, ∠AOC = ∠BOD (vertical): △AOC = △BOD by SAS.', 'AO = OB, CO = OD, ∠AOC = ∠BOD (вертикальные): △AOC = △BOD по двум сторонам и углу между ними.', 'AO = OB, CO = OD, ∠AOC = ∠BOD (вертикаль): △AOC = △BOD екі қабырғасы және арасындағы бұрышы бойынша.'), same(`BD = AC = ${ac}`)], ac, [2 * ac, ac / 2 === Math.round(ac / 2) ? ac / 2 : ac + 1, ac + 2], { fig });
  return qNum(ctx, id, d, L(`Segments AB and CD intersect at their common midpoint O. In △AOC ∠A = ${ang}°, ∠C = ${angB}°. Find ∠B in △BOD.`, `Отрезки AB и CD пересекаются в их общей середине O. В △AOC ∠A = ${ang}°, ∠C = ${angB}°. Найди ∠B треугольника BOD.`, `AB және CD кесінділері ортақ ортасы O нүктесінде қиылысады. △AOC-да ∠A = ${ang}°, ∠C = ${angB}°. BOD үшбұрышының ∠B бұрышын тап.`),
    [L('△AOC = △BOD (SAS), and ∠B corresponds to ∠A.', '△AOC = △BOD (по двум сторонам и углу между ними), ∠B соответствует ∠A.', '△AOC = △BOD (екі қабырғасы және арасындағы бұрышы бойынша), ∠B бұрышы ∠A бұрышына сәйкес.'), same(`∠B = ∠A = ${ang}°`)], ang, [angB, 180 - ang - angB, 180 - ang], { fig });
}

// ---------- Равнобедренный треугольник ----------

const isoFig = (top, labelTop, labelBase) => {
  const base = (180 - top) / 2;
  const P = triByAnglesLocal(base, base);
  return scene({ P: { A: P.A, C: P.B, B: P.C }, polys: [['A', 'B', 'C']], ticks: [['A', 'B', 1], ['B', 'C', 1]], angles: [['C', 'A', 'B', labelBase], ['A', 'B', 'C', labelTop]], h: 160 });
};
function triByAnglesLocal(A, B) {
  const ra = (A * Math.PI) / 180;
  const rb = (B * Math.PI) / 180;
  const t = Math.sin(rb) / Math.sin(ra + rb);
  return { A: [0, 0], B: [1, 0], C: [t * Math.cos(ra), t * Math.sin(ra)] };
}

export function isosc(ctx, d) {
  const { rng } = ctx;
  const id = 'm.isosc';
  const k = R(rng, 0, d === 1 ? 2 : 5);
  if (k === 0) {
    const b = R(rng, 20, 85);
    return qNum(ctx, id, d, L(`The angle at the base of an isosceles triangle is ${deg(b)}. Find the angle at the vertex.`, `Угол при основании равнобедренного треугольника равен ${deg(b)}. Найди угол при вершине.`, `Теңбүйірлі үшбұрыштың табанындағы бұрышы ${deg(b)}. Төбесіндегі бұрышты тап.`),
      [L('The angles at the base are equal.', 'Углы при основании равны.', 'Табанындағы бұрыштар тең.'), same(`180° ${M} 2 · ${b}° = ${180 - 2 * b}°`)], 180 - 2 * b, [why(180 - b, L('There are two equal base angles.', 'Углов при основании два, и они равны.', 'Табанында екі тең бұрыш бар.')), b, (180 - b) / 2 === Math.round((180 - b) / 2) ? (180 - b) / 2 : 180 - 2 * b + 10], { fig: isoFig(180 - 2 * b, '?', `${b}°`) });
  }
  if (k === 1) {
    const top = 2 * R(rng, 10, 80);
    const v = (180 - top) / 2;
    return qNum(ctx, id, d, L(`The angle at the vertex of an isosceles triangle is ${deg(top)}. Find an angle at the base.`, `Угол при вершине равнобедренного треугольника равен ${deg(top)}. Найди угол при основании.`, `Теңбүйірлі үшбұрыштың төбесіндегі бұрышы ${deg(top)}. Табанындағы бұрышты тап.`),
      [same(`(180° ${M} ${top}°) : 2 = ${v}°`)], v, [180 - top, 180 - 2 * top > 0 ? 180 - 2 * top : v + 10, top / 2], { fig: isoFig(top, `${top}°`, '?') });
  }
  if (k === 2) {
    const side = R(rng, 4, 25);
    const base = R(rng, 2, 2 * side - 1);
    const P = 2 * side + base;
    if (rng() < 0.5)
      return qNum(ctx, id, d, L(`The perimeter of an isosceles triangle is ${P} cm, the base is ${base} cm. Find a lateral side.`, `Периметр равнобедренного треугольника ${P} см, основание ${base} см. Найди боковую сторону.`, `Теңбүйірлі үшбұрыштың периметрі ${P} см, табаны ${base} см. Бүйір қабырғасын тап.`),
        [L('The two lateral sides are equal.', 'Боковые стороны равны.', 'Бүйір қабырғалары тең.'), same(`(${P} ${M} ${base}) : 2 = ${side}`)], side, [P - base, (P - base) / 3 === Math.round((P - base) / 3) ? (P - base) / 3 : side + 1, side + base]);
    return qNum(ctx, id, d, L(`The lateral side of an isosceles triangle is ${side} cm, the perimeter is ${P} cm. Find the base.`, `Боковая сторона равнобедренного треугольника ${side} см, периметр ${P} см. Найди основание.`, `Теңбүйірлі үшбұрыштың бүйір қабырғасы ${side} см, периметрі ${P} см. Табанын тап.`),
      [same(`${P} ${M} 2 · ${side} = ${base}`)], base, [P - side, base + side, Math.abs(P - 3 * side) === base ? base + 2 : Math.abs(P - 3 * side)]);
  }
  if (k === 3) {
    const top = 2 * R(rng, 15, 75);
    const which = R(rng, 0, 1);
    return qNum(ctx, id, d, which ? L(`BD is the median drawn to the base AC of isosceles triangle ABC. ∠ABC = ${deg(top)}. Find ∠ABD.`, `BD - медиана, проведённая к основанию AC равнобедренного треугольника ABC, ∠ABC = ${deg(top)}. Найди ∠ABD.`, `BD - ABC теңбүйірлі үшбұрышының AC табанына жүргізілген медиана, ∠ABC = ${deg(top)}. ∠ABD бұрышын тап.`) : L(`BD is the median drawn to the base AC of isosceles triangle ABC. Find ∠BDA.`, `BD - медиана, проведённая к основанию AC равнобедренного треугольника ABC, ∠ABC = ${deg(top)}. Найди ∠BDA.`, `BD - ABC теңбүйірлі үшбұрышының AC табанына жүргізілген медиана, ∠ABC = ${deg(top)}. ∠BDA бұрышын тап.`),
      [L('The median to the base of an isosceles triangle is also the bisector and the altitude.', 'Медиана, проведённая к основанию равнобедренного треугольника, является биссектрисой и высотой.', 'Теңбүйірлі үшбұрыштың табанына жүргізілген медиана әрі биссектриса, әрі биіктік болады.'), which ? same(`∠ABD = ${top}° : 2 = ${top / 2}°`) : same('∠BDA = 90°')], which ? top / 2 : 90, which ? [top, 90 - top / 2, 90] : [top / 2, 180 - top, (180 - top) / 2]);
  }
  if (k === 4) {
    const ext = R(rng, 95, 170);
    const base = 180 - ext;
    const top = 180 - 2 * base;
    return qNum(ctx, id, d, L(`The exterior angle at a base vertex of an isosceles triangle is ${deg(ext)}. Find the angle at the vertex opposite the base.`, `Внешний угол при основании равнобедренного треугольника равен ${deg(ext)}. Найди угол при вершине, противолежащей основанию.`, `Теңбүйірлі үшбұрыштың табанындағы сыртқы бұрышы ${deg(ext)}. Табанға қарсы жатқан төбедегі бұрышты тап.`),
      [same(`180° ${M} ${ext}° = ${base}°`), same(`180° ${M} 2 · ${base}° = ${top}°`)], top, [base, 180 - ext / 2 === Math.round(180 - ext / 2) ? 180 - ext / 2 : top + 5, ext - base]);
  }
  const a = R(rng, 30, 80);
  const vertexCase = `${180 - 2 * a}°, ${a}° ${'{and}'} ${a}°`;
  const baseCase = `${a}°, ${(180 - a) / 2}° ${'{and}'} ${(180 - a) / 2}°`;
  if ((180 - a) % 2) return isosc(ctx, d);
  const both = L(`${vertexCase.replace('{and}', 'and')} or ${baseCase.replace('{and}', 'and')}`, `${vertexCase.replace('{and}', 'и')} или ${baseCase.replace('{and}', 'и')}`, `${vertexCase.replace('{and}', 'және')} немесе ${baseCase.replace('{and}', 'және')}`);
  return qText(ctx, id, d, L(`One angle of an isosceles triangle is ${deg(a)}. What can its other angles be?`, `Один из углов равнобедренного треугольника равен ${deg(a)}. Какими могут быть остальные углы?`, `Теңбүйірлі үшбұрыштың бір бұрышы ${deg(a)}. Қалған бұрыштары қандай болуы мүмкін?`),
    [L(`If ${a}° is a base angle, the vertex angle is ${180 - 2 * a}°.`, `Если ${a}° - угол при основании, то угол при вершине ${180 - 2 * a}°.`, `Егер ${a}° - табандағы бұрыш болса, төбедегі бұрыш ${180 - 2 * a}°.`), L(`If ${a}° is the vertex angle, each base angle is ${(180 - a) / 2}°. Both cases are possible.`, `Если ${a}° - угол при вершине, то углы при основании по ${(180 - a) / 2}°. Возможны оба случая.`, `Егер ${a}° - төбедегі бұрыш болса, табандағы бұрыштар ${(180 - a) / 2}°-тан. Екі жағдай да мүмкін.`)],
    both, [L(`${a}° and ${180 - 2 * a}°`, `${a}° и ${180 - 2 * a}°`, `${a}° және ${180 - 2 * a}°`), L(`${(180 - a) / 2}° and ${(180 - a) / 2}°`, `${(180 - a) / 2}° и ${(180 - a) / 2}°`, `${(180 - a) / 2}° және ${(180 - a) / 2}°`), L(`${a}° and ${180 - a}°`, `${a}° и ${180 - a}°`, `${a}° және ${180 - a}°`)]);
}

// ---------- Параллельные прямые и секущая ----------

// Углы 1-8: 1-4 у прямой a (сверху), 5-8 у прямой b. Внутри четвёрки: 1 - слева сверху, 2 - справа сверху, 3 - слева снизу, 4 - справа снизу.
const Q = ['TL', 'TR', 'BL', 'BR'];
const angVal = (i, phi) => (Q[(i - 1) % 4] === 'TR' || Q[(i - 1) % 4] === 'BL' ? phi : 180 - phi);
function pairKind(i, j) {
  const [a, b] = i < j ? [i, j] : [j, i];
  const qa = Q[(a - 1) % 4];
  const qb = Q[(b - 1) % 4];
  if (a <= 4 && b <= 4) return qa[0] !== qb[0] && qa[1] !== qb[1] ? 'vert' : 'adj';
  if (a > 4) return qa[0] !== qb[0] && qa[1] !== qb[1] ? 'vert' : 'adj';
  if (qa === qb) return 'corr';
  if (qa[0] === 'B' && qb[0] === 'T') return qa[1] !== qb[1] ? 'alt' : 'co';
  if (qa[0] === 'T' && qb[0] === 'B') return qa[1] !== qb[1] ? 'altext' : 'coext';
  return 'other';
}
function parFig(phi, marks) {
  const W = 260;
  const ya = 55;
  const yb = 135;
  const t = (phi * Math.PI) / 180;
  const xa = 150;
  const xb = xa - (yb - ya) / Math.tan(t);
  const ux = Math.cos(t);
  const uy = -Math.sin(t);
  const out = [`<line x1="10" y1="${ya}" x2="${W - 10}" y2="${ya}" stroke="currentColor" stroke-width="2.3"/>`, `<line x1="10" y1="${yb}" x2="${W - 10}" y2="${yb}" stroke="currentColor" stroke-width="2.3"/>`];
  out.push(`<line x1="${(xb - ux * 45).toFixed(1)}" y1="${(yb - uy * 45).toFixed(1)}" x2="${(xa + ux * 45).toFixed(1)}" y2="${(ya + uy * 45).toFixed(1)}" stroke="var(--primary)" stroke-width="2.3"/>`);
  out.push(`<text x="${W - 14}" y="${ya - 6}" class="geo-v" text-anchor="end">a</text>`, `<text x="${W - 14}" y="${yb - 6}" class="geo-v" text-anchor="end">b</text>`, `<text x="${(xa + ux * 45 + 8).toFixed(1)}" y="${(ya + uy * 45 + 4).toFixed(1)}" class="geo-v">c</text>`);
  // Биссектрисы четвертей в экранных углах (y вниз): TR, TL, BL, BR.
  const bis = { TR: -phi / 2, TL: 270 - phi / 2, BL: 180 - phi / 2, BR: 90 - phi / 2 };
  for (const [i, s] of Object.entries(marks)) {
    const q = Q[(i - 1) % 4];
    const [cx, cy] = i <= 4 ? [xa, ya] : [xb, yb];
    const r = q === 'TR' || q === 'BL' ? 30 : 24;
    const rad = (bis[q] * Math.PI) / 180;
    out.push(`<text x="${(cx + r * Math.cos(rad)).toFixed(1)}" y="${(cy + r * Math.sin(rad) + 5).toFixed(1)}" class="geo-l" text-anchor="middle" font-size="13">${s}</text>`);
  }
  return `<svg viewBox="0 0 ${W} 190" class="geo" style="width:min(320px,100%)" role="img" aria-label="figure">${out.join('')}</svg>`;
}
const KIND = {
  vert: L('vertical', 'вертикальные', 'вертикаль'),
  adj: L('adjacent', 'смежные', 'сыбайлас'),
  corr: L('corresponding', 'соответственные', 'сәйкес'),
  alt: L('alternate interior', 'накрест лежащие', 'айқыш'),
  co: L('co-interior (same-side interior)', 'односторонние', 'тұстас'),
  altext: L('alternate exterior', 'накрест лежащие внешние', 'сыртқы айқыш'),
  coext: L('same-side exterior', 'односторонние внешние', 'сыртқы тұстас'),
};

export function parallel(ctx, d) {
  const { rng } = ctx;
  const id = 'm.parallel';
  const phi = R(rng, 35, 80);
  const k = R(rng, 0, d === 1 ? 1 : 3);
  const pairsFor = (kinds) => {
    const out = [];
    for (let i = 1; i <= 8; i++) for (let j = i + 1; j <= 8; j++) if (kinds.includes(pairKind(i, j))) out.push([i, j]);
    return out;
  };
  if (k === 0) {
    const [i, j] = one(rng, pairsFor(d === 1 ? ['corr', 'alt', 'vert', 'adj'] : ['corr', 'alt', 'co', 'altext', 'coext']));
    const [g, a] = rng() < 0.5 ? [i, j] : [j, i];
    const given = angVal(g, phi);
    const v = angVal(a, phi);
    const kd = pairKind(g, a);
    return qNum(ctx, id, d, L(`Lines a ∥ b, c is a transversal. ∠${g} = ${given}°. Find ∠${a}.`, `Прямые a ∥ b, c - секущая. ∠${g} = ${given}°. Найди ∠${a}.`, `a ∥ b түзулері, c - қиюшы. ∠${g} = ${given}°. ∠${a} бұрышын тап.`),
      [L(`∠${g} and ∠${a} are ${KIND[kd].en} angles.`, `∠${g} и ∠${a} - ${KIND[kd].ru} углы.`, `∠${g} және ∠${a} - ${KIND[kd].kk} бұрыштар.`), v === given ? L('So they are equal.', 'Значит, они равны.', 'Демек, олар тең.') : L('Their sum is 180°.', 'Их сумма равна 180°.', 'Олардың қосындысы 180°.'), ans(`${v}°`)], v, [v === given ? 180 - given : given, 90, v + 10], { fig: parFig(phi, { [g]: `${given}°`, [a]: '?' }) });
  }
  if (k === 1) {
    const [i, j] = one(rng, pairsFor(['corr', 'alt', 'co', 'vert', 'adj']));
    const kd = pairKind(i, j);
    const opts = ['corr', 'alt', 'co', 'vert', 'adj'].filter((x) => x !== kd);
    return qText(ctx, id, d, L(`How are angles ${i} and ${j} called?`, `Как называются углы ${i} и ${j}?`, `${i} және ${j} бұрыштары қалай аталады?`),
      [L('Corresponding - in the same position; alternate - inside, on opposite sides of c; co-interior - inside, on one side of c.', 'Соответственные - в одинаковом положении; накрест лежащие - внутри, по разные стороны от c; односторонние - внутри, по одну сторону от c.', 'Сәйкес - бірдей орналасқан; айқыш - ішінде, c-ның екі жағында; тұстас - ішінде, c-ның бір жағында.'), KIND[kd]],
      KIND[kd], opts.map((x) => KIND[x]), { fig: parFig(phi, { [i]: String(i), [j]: String(j) }) });
  }
  if (k === 2) {
    const diff = 2 * R(rng, 5, 60);
    const small = (180 - diff) / 2;
    const wantBig = rng() < 0.5;
    return qNum(ctx, id, d, L(`a ∥ b, c is a transversal. One of the co-interior angles is ${diff}° greater than the other. Find the ${wantBig ? 'larger' : 'smaller'} one.`, `a ∥ b, c - секущая. Один из односторонних углов на ${diff}° больше другого. Найди ${wantBig ? 'больший' : 'меньший'}.`, `a ∥ b, c - қиюшы. Тұстас бұрыштардың бірі екіншісінен ${diff}°-қа үлкен. ${wantBig ? 'Үлкенін' : 'Кішісін'} тап.`),
      [L('Co-interior angles at parallel lines add up to 180°.', 'Сумма односторонних углов при параллельных прямых равна 180°.', 'Параллель түзулердегі тұстас бұрыштардың қосындысы 180°.'), same(`${X} + ${X} + ${diff}° = 180° → ${X} = ${small}°`)], wantBig ? small + diff : small, [wantBig ? small : small + diff, diff, 180 - diff]);
  }
  const [i, j] = one(rng, pairsFor(['corr', 'alt', 'co']));
  const kd = pairKind(i, j);
  const a1 = R(rng, 40, 140);
  const par = rng() < 0.5;
  const a2 = kd === 'co' ? (par ? 180 - a1 : 180 - a1 + one(rng, [-10, 10, 20])) : par ? a1 : 180 - a1 === a1 ? a1 + 10 : 180 - a1;
  const isPar = kd === 'co' ? a1 + a2 === 180 : a1 === a2;
  const T = [L('yes, a ∥ b', 'да, a ∥ b', 'иә, a ∥ b'), L('no, they intersect', 'нет, они пересекаются', 'жоқ, олар қиылысады'), L('it cannot be determined', 'определить нельзя', 'анықтау мүмкін емес')];
  return qText(ctx, id, d, L(`A transversal c crosses lines a and b. ∠${i} = ${a1}°, ∠${j} = ${a2}°. Are lines a and b parallel?`, `Секущая c пересекает прямые a и b. ∠${i} = ${a1}°, ∠${j} = ${a2}°. Параллельны ли прямые a и b?`, `c қиюшысы a және b түзулерін қияды. ∠${i} = ${a1}°, ∠${j} = ${a2}°. a және b түзулері параллель ме?`),
    [L(`∠${i} and ∠${j} are ${KIND[kd].en}.`, `∠${i} и ∠${j} - ${KIND[kd].ru}.`, `∠${i} және ∠${j} - ${KIND[kd].kk} бұрыштар.`), kd === 'co' ? L(`Lines are parallel if the sum is 180°: ${a1}° + ${a2}° = ${a1 + a2}°.`, `Прямые параллельны, если сумма 180°: ${a1}° + ${a2}° = ${a1 + a2}°.`, `Қосындысы 180° болса, түзулер параллель: ${a1}° + ${a2}° = ${a1 + a2}°.`) : L('Lines are parallel if these angles are equal.', 'Прямые параллельны, если эти углы равны.', 'Бұл бұрыштар тең болса, түзулер параллель.')],
    T[isPar ? 0 : 1], [T[isPar ? 1 : 0], T[2]], { fig: parFig(phi, { [i]: String(i), [j]: String(j) }) });
}

// ---------- Сумма углов треугольника ----------

export function triSum(ctx, d) {
  const { rng } = ctx;
  const id = 'm.trisum';
  const k = R(rng, 0, d === 1 ? 2 : 5);
  const A = R(rng, 20, 100);
  const B = R(rng, 15, 160 - A);
  const C = 180 - A - B;
  if (k === 0) return qNum(ctx, id, d, L(`In triangle ABC ∠A = ${A}°, ∠B = ${B}°. Find ∠C.`, `В треугольнике ABC ∠A = ${A}°, ∠B = ${B}°. Найди ∠C.`, `ABC үшбұрышында ∠A = ${A}°, ∠B = ${B}°. ∠C бұрышын тап.`), [L('The angles of a triangle add up to 180°.', 'Сумма углов треугольника равна 180°.', 'Үшбұрыш бұрыштарының қосындысы 180°.'), same(`180° ${M} ${A}° ${M} ${B}° = ${C}°`)], C, [why(360 - A - B, L('The sum of the angles of a triangle is 180°, not 360°.', 'Сумма углов треугольника 180°, а не 360°.', 'Үшбұрыш бұрыштарының қосындысы 360° емес, 180°.')), A + B, C + 10], { fig: triangleSvg(A, B, { labels: false }) });
  if (k === 1) {
    const acute = R(rng, 10, 80);
    return qNum(ctx, id, d, L(`One acute angle of a right triangle is ${acute}°. Find the other acute angle.`, `Один из острых углов прямоугольного треугольника равен ${acute}°. Найди другой острый угол.`, `Тікбұрышты үшбұрыштың бір сүйір бұрышы ${acute}°. Екінші сүйір бұрышын тап.`), [L('The acute angles of a right triangle add up to 90°.', 'Сумма острых углов прямоугольного треугольника равна 90°.', 'Тікбұрышты үшбұрыштың сүйір бұрыштарының қосындысы 90°.'), same(`90° ${M} ${acute}° = ${90 - acute}°`)], 90 - acute, [180 - acute, 180 - 90 - acute + 90, acute]);
  }
  if (k === 2) {
    const ext = A + B;
    return qNum(ctx, id, d, L(`The exterior angle at vertex C of triangle ABC is ${ext}°, ∠A = ${A}°. Find ∠B.`, `Внешний угол треугольника ABC при вершине C равен ${ext}°, ∠A = ${A}°. Найди ∠B.`, `ABC үшбұрышының C төбесіндегі сыртқы бұрышы ${ext}°, ∠A = ${A}°. ∠B бұрышын тап.`),
      [L('An exterior angle equals the sum of the two interior angles not adjacent to it.', 'Внешний угол равен сумме двух внутренних углов, не смежных с ним.', 'Сыртқы бұрыш өзімен сыбайлас емес екі ішкі бұрыштың қосындысына тең.'), same(`∠B = ${ext}° ${M} ${A}° = ${B}°`)], B, [why(180 - ext, L('That is ∠C, adjacent to the exterior angle.', 'Это ∠C - смежный с внешним углом.', 'Бұл - сыртқы бұрышпен сыбайлас ∠C.')), 180 - B, ext + A]);
  }
  if (k === 3) {
    const [p, q, r] = one(rng, [[1, 2, 3], [2, 3, 4], [1, 3, 5], [2, 3, 7], [3, 4, 5], [1, 1, 2], [4, 5, 6], [1, 2, 6], [5, 6, 7], [2, 5, 11], [1, 4, 7], [3, 5, 10]]);
    const u = 180 / (p + q + r);
    const askMax = rng() < 0.6;
    const v = (askMax ? r : p) * u;
    return qNum(ctx, id, d, L(`The angles of a triangle are in the ratio ${p} : ${q} : ${r}. Find the ${askMax ? 'largest' : 'smallest'} angle.`, `Углы треугольника относятся как ${p} : ${q} : ${r}. Найди ${askMax ? 'наибольший' : 'наименьший'} угол.`, `Үшбұрыштың бұрыштары ${p} : ${q} : ${r} қатынасындай. ${askMax ? 'Ең үлкен' : 'Ең кіші'} бұрышын тап.`),
      [same(`${p}${X} + ${q}${X} + ${r}${X} = 180°, ${X} = ${n(u)}°`), same(`${askMax ? r : p} · ${n(u)}° = ${n(v)}°`)], v, [(askMax ? p : r) * u, q * u, v + 10], { fmt: dec });
  }
  if (k === 4) {
    const a = 2 * R(rng, 10, 50);
    const b = 2 * R(rng, 10, 85 - a / 2);
    const v = 180 - (a + b) / 2;
    return qNum(ctx, id, d, L(`In triangle ABC ∠A = ${a}°, ∠B = ${b}°. The bisectors of angles A and B meet at O. Find ∠AOB.`, `В треугольнике ABC ∠A = ${a}°, ∠B = ${b}°. Биссектрисы углов A и B пересекаются в точке O. Найди ∠AOB.`, `ABC үшбұрышында ∠A = ${a}°, ∠B = ${b}°. A және B бұрыштарының биссектрисалары O нүктесінде қиылысады. ∠AOB бұрышын тап.`),
      [L(`In △AOB: ∠OAB = ${a / 2}°, ∠OBA = ${b / 2}°.`, `В △AOB: ∠OAB = ${a / 2}°, ∠OBA = ${b / 2}°.`, `△AOB-да: ∠OAB = ${a / 2}°, ∠OBA = ${b / 2}°.`), same(`∠AOB = 180° ${M} ${a / 2}° ${M} ${b / 2}° = ${v}°`)], v, [180 - a - b, (a + b) / 2, 90 + (180 - a - b) / 2 === v ? v + 10 : 90 + (180 - a - b) / 2]);
  }
  const e1 = 180 - A;
  const e2 = 180 - B;
  return qNum(ctx, id, d, L(`Two exterior angles of a triangle (at different vertices) are ${e1}° and ${e2}°. Find the third angle of the triangle.`, `Два внешних угла треугольника (при разных вершинах) равны ${e1}° и ${e2}°. Найди третий угол треугольника.`, `Үшбұрыштың (әртүрлі төбелеріндегі) екі сыртқы бұрышы ${e1}° және ${e2}°. Үшбұрыштың үшінші бұрышын тап.`),
    [L(`The interior angles at those vertices: 180° − ${e1}° = ${A}°, 180° − ${e2}° = ${B}°.`, `Внутренние углы при этих вершинах: 180° − ${e1}° = ${A}°, 180° − ${e2}° = ${B}°.`, `Сол төбелердегі ішкі бұрыштар: 180° − ${e1}° = ${A}°, 180° − ${e2}° = ${B}°.`), same(`180° ${M} ${A}° ${M} ${B}° = ${C}°`)], C, [360 - e1 - e2 === C ? C + 10 : 360 - e1 - e2 + 180, 180 - C, e1 + e2 - 180 === C ? C + 5 : e1 + e2 - 180]);
}

// ---------- Окружность и построения ----------

export function circle7(ctx, d) {
  const { rng } = ctx;
  const id = 'm.constr';
  const k = R(rng, 0, d === 1 ? 2 : 5);
  if (k === 0) {
    const r = R(rng, 3, 15);
    const dist = one(rng, [r, R(rng, 1, r - 1), R(rng, r + 1, 2 * r + 3)]);
    const v = dist < r ? 2 : dist === r ? 1 : 0;
    return qNum(ctx, id, d, L(`The radius of a circle is ${r} cm, the distance from its centre to line a is ${dist} cm. How many common points do the line and the circle have?`, `Радиус окружности ${r} см, расстояние от её центра до прямой a равно ${dist} см. Сколько общих точек у прямой и окружности?`, `Шеңбердің радиусы ${r} см, центрінен a түзуіне дейінгі қашықтық ${dist} см. Түзу мен шеңбердің неше ортақ нүктесі бар?`),
      [L('d < r - two points; d = r - one point (tangent); d > r - none.', 'd < r - две точки; d = r - одна (касательная); d > r - ни одной.', 'd < r - екі нүкте; d = r - бір нүкте (жанама); d > r - ортақ нүкте жоқ.'), same(`d = ${dist}, r = ${r} → ${v}`)], v, [0, 1, 2, 3].filter((x) => x !== v), { spr: 0 });
  }
  if (k === 1) {
    const ang = R(rng, 20, 80);
    const toCentral = rng() < 0.5;
    return toCentral
      ? qNum(ctx, id, d, L(`AB is a chord of a circle with centre O, ∠OAB = ${ang}°. Find ∠AOB.`, `AB - хорда окружности с центром O, ∠OAB = ${ang}°. Найди ∠AOB.`, `AB - центрі O шеңбердің хордасы, ∠OAB = ${ang}°. ∠AOB бұрышын тап.`),
          [L('OA = OB (radii), so triangle AOB is isosceles.', 'OA = OB (радиусы), значит, треугольник AOB равнобедренный.', 'OA = OB (радиустар), демек AOB үшбұрышы теңбүйірлі.'), same(`∠AOB = 180° ${M} 2 · ${ang}° = ${180 - 2 * ang}°`)], 180 - 2 * ang, [180 - ang, 2 * ang, ang], { fig: chordFig(180 - 2 * ang) })
      : qNum(ctx, id, d, L(`AB is a chord of a circle with centre O, ∠AOB = ${180 - 2 * ang}°. Find ∠OAB.`, `AB - хорда окружности с центром O, ∠AOB = ${180 - 2 * ang}°. Найди ∠OAB.`, `AB - центрі O шеңбердің хордасы, ∠AOB = ${180 - 2 * ang}°. ∠OAB бұрышын тап.`),
          [L('OA = OB, so the angles at A and B are equal.', 'OA = OB, поэтому углы при A и B равны.', 'OA = OB, сондықтан A мен B бұрыштары тең.'), same(`(180° ${M} ${180 - 2 * ang}°) : 2 = ${ang}°`)], ang, [180 - 2 * ang, 90 - ang, 2 * ang], { fig: chordFig(180 - 2 * ang) });
  }
  if (k === 2) {
    const r = R(rng, 2, 30);
    const toD = rng() < 0.5;
    return qNum(ctx, id, d, toD ? L(`The radius of a circle is ${r} cm. Find the length of its longest chord.`, `Радиус окружности ${r} см. Найди длину самой большой её хорды.`, `Шеңбердің радиусы ${r} см. Оның ең үлкен хордасының ұзындығын тап.`) : L(`The longest chord of a circle is ${2 * r} cm. Find the radius.`, `Самая большая хорда окружности равна ${2 * r} см. Найди радиус.`, `Шеңбердің ең үлкен хордасы ${2 * r} см. Радиусын тап.`),
      [L('The longest chord is the diameter: d = 2r.', 'Самая большая хорда - диаметр: d = 2r.', 'Ең үлкен хорда - диаметр: d = 2r.'), same(toD ? `2 · ${r} = ${2 * r}` : `${2 * r} : 2 = ${r}`)], toD ? 2 * r : r, toD ? [r, 4 * r, r * r] : [2 * r, r / 2 === Math.round(r / 2) ? r / 2 : r + 1, 4 * r]);
  }
  if (k === 3) {
    const R1 = R(rng, 4, 15);
    const r = R(rng, 1, R1 - 1);
    const c = R(rng, 0, 4);
    const dist = [R1 + r, R1 - r, R(rng, R1 - r + 1, R1 + r - 1), R1 + r + R(rng, 1, 6), R(rng, 0, R1 - r - 1)][c];
    if (c === 2 && R1 - r + 1 > R1 + r - 1) return circle7(ctx, d);
    if (c === 4 && R1 - r - 1 < 0) return circle7(ctx, d);
    const T = [L('they touch externally', 'касаются внешним образом', 'сырттай жанасады'), L('they touch internally', 'касаются внутренним образом', 'іштей жанасады'), L('they intersect at two points', 'пересекаются в двух точках', 'екі нүктеде қиылысады'), L('they have no common points, each lies outside the other', 'не имеют общих точек, одна вне другой', 'ортақ нүктесі жоқ, бірі екіншісінің сыртында'), L('they have no common points, one lies inside the other', 'не имеют общих точек, одна внутри другой', 'ортақ нүктесі жоқ, бірі екіншісінің ішінде')];
    return qText(ctx, id, d, L(`Two circles have radii ${R1} cm and ${r} cm, the distance between their centres is ${dist} cm. How are they placed?`, `Радиусы двух окружностей ${R1} см и ${r} см, расстояние между центрами ${dist} см. Как расположены окружности?`, `Екі шеңбердің радиустары ${R1} см және ${r} см, центрлерінің арақашықтығы ${dist} см. Шеңберлер қалай орналасқан?`),
      [same(`R + r = ${R1 + r}, R ${M} r = ${R1 - r}, d = ${dist}`), L('d = R + r - external touch; d = R − r - internal touch; between them - two points; d > R + r or d < R − r - no common points.', 'd = R + r - внешнее касание; d = R − r - внутреннее; между ними - две точки; d > R + r или d < R − r - общих точек нет.', 'd = R + r - сырттай жанасу; d = R − r - іштей жанасу; олардың арасында - екі нүкте; d > R + r немесе d < R − r - ортақ нүкте жоқ.')],
      T[c], [...T.filter((_, j) => j !== c)].slice(c === 0 ? 1 : 0).concat(T.filter((_, j) => j !== c)).slice(0, 4));
  }
  if (k === 4) {
    const T = [
      [L('the set of points equidistant from the ends of a segment', 'множество точек, равноудалённых от концов отрезка', 'кесіндінің ұштарынан бірдей қашықтықтағы нүктелер жиыны'), L('the perpendicular bisector of the segment', 'серединный перпендикуляр к отрезку', 'кесіндіге жүргізілген орта перпендикуляр')],
      [L('the set of points inside an angle equidistant from its sides', 'множество точек внутри угла, равноудалённых от его сторон', 'бұрыштың ішіндегі, қабырғаларынан бірдей қашықтықтағы нүктелер жиыны'), L('the bisector of the angle', 'биссектриса угла', 'бұрыштың биссектрисасы')],
      [L(`the set of points at distance ${R(rng, 2, 9)} cm from point O`, `множество точек на расстоянии ${R(rng, 2, 9)} см от точки O`, `O нүктесінен ${R(rng, 2, 9)} см қашықтықтағы нүктелер жиыны`), L('a circle with centre O', 'окружность с центром O', 'центрі O шеңбер')],
      [L('the set of points equidistant from two parallel lines', 'множество точек, равноудалённых от двух параллельных прямых', 'екі параллель түзуден бірдей қашықтықтағы нүктелер жиыны'), L('a line parallel to them, halfway between', 'прямая, параллельная им, посередине между ними', 'олардың дәл ортасынан өтетін параллель түзу')],
    ];
    const i = R(rng, 0, T.length - 1);
    return qText(ctx, id, d, L(`What figure is ${T[i][0].en}?`, `Какая фигура - ${T[i][0].ru}?`, `${T[i][0].kk[0].toUpperCase()}${T[i][0].kk.slice(1)} - қандай фигура?`),
      [L('This is a basic locus; it is used in constructions with compass and ruler.', 'Это одно из основных геометрических мест точек; оно используется в построениях циркулем и линейкой.', 'Бұл - нүктелердің негізгі геометриялық орны; циркуль мен сызғышпен салуда қолданылады.'), T[i][1]], T[i][1], T.filter((_, j) => j !== i).map((x) => x[1]));
  }
  const R1 = R(rng, 3, 20);
  const r = R(rng, 1, R1 - 1);
  const ext = rng() < 0.5;
  return qNum(ctx, id, d, L(`Circles with radii ${R1} cm and ${r} cm touch ${ext ? 'externally' : 'internally'}. Find the distance between their centres.`, `Окружности с радиусами ${R1} см и ${r} см касаются ${ext ? 'внешним' : 'внутренним'} образом. Найди расстояние между их центрами.`, `Радиустары ${R1} см және ${r} см шеңберлер ${ext ? 'сырттай' : 'іштей'} жанасады. Центрлерінің арақашықтығын тап.`),
    [ext ? L('External touch: d = R + r.', 'Внешнее касание: d = R + r.', 'Сырттай жанасу: d = R + r.') : L('Internal touch: d = R − r.', 'Внутреннее касание: d = R − r.', 'Іштей жанасу: d = R − r.'), same(ext ? `${R1} + ${r} = ${R1 + r}` : `${R1} ${M} ${r} = ${R1 - r}`)], ext ? R1 + r : R1 - r, [ext ? R1 - r : R1 + r, R1 * r, R1]);
}
const chordFig = (central) => {
  const a = 90 + central / 2;
  const b = 90 - central / 2;
  const P = { O: [0, 0], A: [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)], B: [Math.cos((b * Math.PI) / 180), Math.sin((b * Math.PI) / 180)] };
  return scene({ P, circles: [{ c: 'O', r: 1 }], segs: [['O', 'A'], ['O', 'B'], ['A', 'B']], dots: ['O'], lab: { O: [0, 16] }, h: 170 });
};
const dl = (x, l) => (l === 'en' ? n(x) : n(x).replace('.', ','));
