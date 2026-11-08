// Домен «Геометрия и тригонометрия»: площади и объёмы, углы, прямоугольные треугольники,
// окружности, подобие. Для части задач рисуются SVG-чертежи.

import { pick, randomInt } from '../../core/random.js';
import { MINUS, fracHtml, fracText, linear, num, simplify, v } from '../../core/format.js';
import { choose, makeMc, mathQ, nonZero, st, steps } from './util.js';

const X = v('x');
const same = (text) => st(text, text, text);
const piFmt = (k) => (k === 1 ? 'π' : `${num(k)}π`);

// ---------- Чертежи ----------

function svgWrap(inner) {
  return `<svg viewBox="0 0 260 180" class="geo" role="img" aria-label="figure">${inner}</svg>`;
}

/** Прямоугольный треугольник: прямой угол в C (слева внизу), B сверху, A справа. */
function rightTriangleSvg({ bc = '', ac = '', ab = '' }) {
  return svgWrap(`
    <polygon points="40,150 40,30 220,150" fill="var(--fig-fill)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <polyline points="40,134 56,134 56,150" fill="none" stroke="currentColor" stroke-width="2"/>
    <text x="26" y="164" class="geo-v">C</text><text x="26" y="28" class="geo-v">B</text><text x="226" y="164" class="geo-v">A</text>
    <text x="16" y="94" class="geo-l">${bc}</text><text x="122" y="172" class="geo-l" text-anchor="middle">${ac}</text>
    <text x="140" y="80" class="geo-l">${ab}</text>`);
}

/** Произвольный треугольник с подписями углов. */
function triangleSvg({ a = '', b = '', c = '' }) {
  return svgWrap(`
    <polygon points="30,155 235,155 95,30" fill="var(--fig-fill)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <text x="14" y="170" class="geo-v">A</text><text x="238" y="170" class="geo-v">B</text><text x="88" y="22" class="geo-v">C</text>
    <text x="50" y="148" class="geo-l">${a}</text><text x="185" y="148" class="geo-l">${b}</text><text x="88" y="62" class="geo-l">${c}</text>`);
}

// ---------- Генераторы ----------

export function areaVolume(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const L = randomInt(rng, 6, 15);
    const W = randomInt(rng, 2, L - 1);
    const P = 2 * (L + W);
    const ans = L * W;
    return mathQ('area-volume', d, {
      prompt: `A rectangle has a length of ${L} centimeters and a perimeter of ${P} centimeters. What is the area of the rectangle, in square centimeters?`,
      ex: steps(
        st(
          `Perimeter = 2(length + width), so length + width = ${P} ÷ 2 = ${P / 2} and the width is ${P / 2} ${MINUS} ${L} = ${W}.`,
          `Периметр = 2(длина + ширина), значит длина + ширина = ${P} ÷ 2 = ${P / 2}, а ширина = ${P / 2} ${MINUS} ${L} = ${W}.`,
          `Периметр = 2(ұзындық + ені), демек ұзындық + ені = ${P} ÷ 2 = ${P / 2}, ал ені = ${P / 2} ${MINUS} ${L} = ${W}.`,
        ),
        st(`Area = ${L} · ${W} = ${ans}.`, `Площадь = ${L} · ${W} = ${ans}.`, `Аудан = ${L} · ${W} = ${ans}.`),
      ),
      ...choose(ctx, ans, [L * (P / 2), L * (P - L), P * L]),
    });
  }
  if (d === 2) {
    const r = randomInt(rng, 2, 6);
    const h = randomInt(rng, 3, 10);
    const k = r * r * h;
    return mathQ('area-volume', d, {
      prompt: `A right circular cylinder has a radius of ${r} inches and a height of ${h} inches. What is the volume of the cylinder, in cubic inches?`,
      ex: steps(
        st(
          `Volume of a cylinder: <i>V</i> = π<i>r</i><sup>2</sup><i>h</i> (it's on the SAT reference sheet).`,
          `Объём цилиндра: <i>V</i> = π<i>r</i><sup>2</sup><i>h</i> (формула есть в справке SAT).`,
          `Цилиндр көлемі: <i>V</i> = π<i>r</i><sup>2</sup><i>h</i> (формула SAT анықтамасында бар).`,
        ),
        same(`<i>V</i> = π · ${r}<sup>2</sup> · ${h} = π · ${r * r} · ${h} = ${piFmt(k)}.`),
      ),
      mc: makeMc(rng, k, [2 * r * h, r * h * h, 4 * r * r * h, (r * r * h) / 3].filter(Number.isInteger), piFmt),
    });
  }
  if (rng() < 0.5) {
    const p = pick(rng, [10, 20, 30, 50]);
    const factor = 1 + p / 100;
    const ans = Math.round((factor * factor - 1) * 100);
    return mathQ('area-volume', d, {
      prompt: `Each side of a square is increased by ${p}%. By what percent does the area of the square increase?`,
      ex: steps(
        st(
          `If the side is multiplied by ${factor}, the area (side × side) is multiplied by ${factor}<sup>2</sup> = ${num(factor * factor)}.`,
          `Если сторону умножить на ${factor}, то площадь (сторона × сторона) умножится на ${factor}<sup>2</sup> = ${num(factor * factor)}.`,
          `Қабырғаны ${factor} санына көбейтсек, аудан (қабырға × қабырға) ${factor}<sup>2</sup> = ${num(factor * factor)} санына көбейеді.`,
        ),
        st(
          `${num(factor * factor)} means an increase of ${ans}% — not ${p}% and not ${2 * p}%.`,
          `${num(factor * factor)} означает рост на ${ans}% — не на ${p}% и не на ${2 * p}%.`,
          `${num(factor * factor)} — ${ans}% өсу деген сөз, ${p}% та, ${2 * p}% та емес.`,
        ),
      ),
      ...choose(ctx, ans, [2 * p, p, p * p], { fmt: (x) => `${num(x)}%` }),
    });
  }
  const s = randomInt(rng, 2, 8);
  const sa = 6 * s * s;
  return mathQ('area-volume', d, {
    prompt: `The surface area of a cube is ${sa} square centimeters. What is the volume of the cube, in cubic centimeters?`,
    ex: steps(
      st(
        `A cube has 6 equal square faces: 6<i>s</i><sup>2</sup> = ${sa}, so <i>s</i><sup>2</sup> = ${s * s} and <i>s</i> = ${s}.`,
        `У куба 6 одинаковых квадратных граней: 6<i>s</i><sup>2</sup> = ${sa}, значит <i>s</i><sup>2</sup> = ${s * s} и <i>s</i> = ${s}.`,
        `Кубтың 6 бірдей шаршы жағы бар: 6<i>s</i><sup>2</sup> = ${sa}, демек <i>s</i><sup>2</sup> = ${s * s}, <i>s</i> = ${s}.`,
      ),
      st(`Volume = <i>s</i><sup>3</sup> = ${s * s * s}.`, `Объём = <i>s</i><sup>3</sup> = ${s * s * s}.`, `Көлем = <i>s</i><sup>3</sup> = ${s * s * s}.`),
    ),
    ...choose(ctx, s * s * s, [s * s, sa / 6, 6 * s * s * s, sa]),
  });
}

export function angles(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const A = randomInt(rng, 30, 80);
    const B = randomInt(rng, 30, 80);
    const C = 180 - A - B;
    return mathQ('angles', d, {
      prompt: `In triangle <i>ABC</i>, the measure of angle <i>A</i> is ${A}° and the measure of angle <i>B</i> is ${B}°. What is the measure, in degrees, of angle <i>C</i>?`,
      figure: triangleSvg({ a: `${A}°`, b: `${B}°`, c: '?' }),
      ex: steps(
        st(
          `The angles of a triangle add up to 180°.`,
          `Сумма углов треугольника равна 180°.`,
          `Үшбұрыш бұрыштарының қосындысы 180°.`,
        ),
        same(`<i>C</i> = 180° ${MINUS} ${A}° ${MINUS} ${B}° = ${C}°.`),
      ),
      ...choose(ctx, C, [180 - A, A + B, 360 - A - B]),
    });
  }
  if (d === 2) {
    const V = 2 * randomInt(rng, 10, 70);
    const ans = (180 - V) / 2;
    return mathQ('angles', d, {
      prompt: `In isosceles triangle <i>PQR</i>, <i>PQ</i> = <i>PR</i> and the measure of angle <i>P</i> is ${V}°. What is the measure, in degrees, of angle <i>Q</i>?`,
      ex: steps(
        st(
          `Since <i>PQ</i> = <i>PR</i>, the angles opposite these sides are equal: ∠<i>Q</i> = ∠<i>R</i>.`,
          `Так как <i>PQ</i> = <i>PR</i>, углы напротив этих сторон равны: ∠<i>Q</i> = ∠<i>R</i>.`,
          `<i>PQ</i> = <i>PR</i> болғандықтан, осы қабырғаларға қарсы бұрыштар тең: ∠<i>Q</i> = ∠<i>R</i>.`,
        ),
        same(`∠<i>Q</i> = (180° ${MINUS} ${V}°) ÷ 2 = ${ans}°.`),
      ),
      ...choose(ctx, ans, [V, 180 - V, 90 - V / 2 === ans ? V / 2 : 90 - V / 2]),
    });
  }
  const equal = rng() < 0.5;
  const x = randomInt(rng, 8, 30);
  const theta = randomInt(rng, 40, 140);
  const a = randomInt(rng, 2, 6);
  let c = randomInt(rng, 2, 6);
  if (c === a) c += 1;
  const b = theta - a * x;
  const dd = (equal ? theta : 180 - theta) - c * x;
  const kind = equal ? 'alternate interior angles' : 'same-side interior angles';
  return mathQ('angles', d, {
    prompt: `Two parallel lines are cut by a transversal. Two of the angles formed are ${kind} with measures (${linear(a, b)})° and (${linear(c, dd)})°. What is the value of ${X}?`,
    ex: steps(
      equal
        ? st(
            `Alternate interior angles formed by parallel lines are equal: ${linear(a, b)} = ${linear(c, dd)}.`,
            `Накрест лежащие углы при параллельных прямых равны: ${linear(a, b)} = ${linear(c, dd)}.`,
            `Параллель түзулердегі айқыш бұрыштар тең: ${linear(a, b)} = ${linear(c, dd)}.`,
          )
        : st(
            `Same-side interior angles add up to 180°: ${linear(a, b)} + ${linear(c, dd)} = 180.`,
            `Односторонние углы в сумме дают 180°: ${linear(a, b)} + ${linear(c, dd)} = 180.`,
            `Бір жақты ішкі бұрыштардың қосындысы 180°: ${linear(a, b)} + ${linear(c, dd)} = 180.`,
          ),
      equal
        ? same(`${linear(a - c, 0)} = ${num(dd - b)} → ${X} = ${x}.`)
        : same(`${linear(a + c, b + dd)} = 180 → ${linear(a + c, 0)} = ${num(180 - b - dd)} → ${X} = ${x}.`),
    ),
    ...choose(ctx, x, [theta, equal ? (180 - b - dd) / (a + c) : (dd - b) / (a - c), x + 5].filter(Number.isInteger)),
  });
}

const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [6, 8, 10],
  [9, 12, 15],
];

export function rightTri(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const [a, b, c] = pick(rng, TRIPLES);
    const askHyp = rng() < 0.6;
    if (askHyp) {
      return mathQ('right-tri', d, {
        prompt: `In right triangle <i>ABC</i>, angle <i>C</i> is a right angle, <i>BC</i> = ${a}, and <i>AC</i> = ${b}. What is the length of <i>AB</i>?`,
        figure: rightTriangleSvg({ bc: a, ac: b, ab: '?' }),
        ex: steps(
          st(
            `Pythagorean theorem: <i>AB</i><sup>2</sup> = <i>BC</i><sup>2</sup> + <i>AC</i><sup>2</sup>.`,
            `Теорема Пифагора: <i>AB</i><sup>2</sup> = <i>BC</i><sup>2</sup> + <i>AC</i><sup>2</sup>.`,
            `Пифагор теоремасы: <i>AB</i><sup>2</sup> = <i>BC</i><sup>2</sup> + <i>AC</i><sup>2</sup>.`,
          ),
          same(`<i>AB</i><sup>2</sup> = ${a * a} + ${b * b} = ${c * c} → <i>AB</i> = ${c}.`),
        ),
        ...choose(ctx, c, [a + b, c * c, b + 1]),
      });
    }
    return mathQ('right-tri', d, {
      prompt: `In right triangle <i>ABC</i>, angle <i>C</i> is a right angle, <i>AB</i> = ${c}, and <i>BC</i> = ${a}. What is the length of <i>AC</i>?`,
      figure: rightTriangleSvg({ bc: a, ac: '?', ab: c }),
      ex: steps(
        st(
          `Pythagorean theorem: <i>AC</i><sup>2</sup> = <i>AB</i><sup>2</sup> ${MINUS} <i>BC</i><sup>2</sup>.`,
          `Теорема Пифагора: <i>AC</i><sup>2</sup> = <i>AB</i><sup>2</sup> ${MINUS} <i>BC</i><sup>2</sup>.`,
          `Пифагор теоремасы: <i>AC</i><sup>2</sup> = <i>AB</i><sup>2</sup> ${MINUS} <i>BC</i><sup>2</sup>.`,
        ),
        same(`<i>AC</i><sup>2</sup> = ${c * c} ${MINUS} ${a * a} = ${b * b} → <i>AC</i> = ${b}.`),
      ),
      ...choose(ctx, b, [c - a, c + a, b * b]),
    });
  }
  if (d === 2) {
    const [a, b, c] = pick(rng, TRIPLES);
    const fn = pick(rng, ['sin', 'cos', 'tan']);
    const val = fn === 'sin' ? [a, c] : fn === 'cos' ? [b, c] : [a, b];
    const all = { sin: [a, c], cos: [b, c], tan: [a, b], inv: [b, a], other: [c, a] };
    const wrong = Object.entries(all)
      .filter(([k]) => k !== fn)
      .map(([, pair]) => pair);
    const keyOf = ([n, m]) => simplify(n, m).join('/');
    const uniq = [];
    const seen = new Set([keyOf(val)]);
    for (const w of wrong) if (!seen.has(keyOf(w))) (seen.add(keyOf(w)), uniq.push(w));
    const names = {
      sin: ['opposite', 'hypotenuse', 'противолежащий катет', 'гипотенуза', 'қарсы катет', 'гипотенуза'],
      cos: ['adjacent', 'hypotenuse', 'прилежащий катет', 'гипотенуза', 'іргелес катет', 'гипотенуза'],
      tan: ['opposite', 'adjacent', 'противолежащий катет', 'прилежащий катет', 'қарсы катет', 'іргелес катет'],
    }[fn];
    const ratio = `${val[0]}/${val[1]} = ${fracText(val[0], val[1])}`;
    const q = {
      prompt: `In right triangle <i>ABC</i>, angle <i>C</i> is a right angle, <i>BC</i> = ${a}, <i>AC</i> = ${b}, and <i>AB</i> = ${c}. What is the value of ${fn}(<i>A</i>)?`,
      figure: rightTriangleSvg({ bc: a, ac: b, ab: c }),
      ex: steps(
        st(
          `For angle <i>A</i>: ${fn} = ${names[0]} ÷ ${names[1]} (remember SOH-CAH-TOA).`,
          `Для угла <i>A</i>: ${fn} = ${names[2]} ÷ ${names[3]}.`,
          `<i>A</i> бұрышы үшін: ${fn} = ${names[4]} ÷ ${names[5]}.`,
        ),
        st(
          `The side opposite <i>A</i> is <i>BC</i> = ${a}, the adjacent side is <i>AC</i> = ${b}, the hypotenuse is <i>AB</i> = ${c}. So ${fn}(<i>A</i>) = ${ratio}.`,
          `Против угла <i>A</i> лежит <i>BC</i> = ${a}, прилежащий катет <i>AC</i> = ${b}, гипотенуза <i>AB</i> = ${c}. Значит, ${fn}(<i>A</i>) = ${ratio}.`,
          `<i>A</i> бұрышына қарсы катет — <i>BC</i> = ${a}, іргелес катет — <i>AC</i> = ${b}, гипотенуза — <i>AB</i> = ${c}. Демек, ${fn}(<i>A</i>) = ${ratio}.`,
        ),
      ),
    };
    if (!ctx.mcOnly && rng() < 0.3) return mathQ('right-tri', d, { ...q, spr: { value: val[0] / val[1], display: fracText(val[0], val[1]) } });
    return mathQ('right-tri', d, { ...q, mc: makeMc(rng, val, uniq, ([n, m]) => fracHtml(n, m)) });
  }
  if (rng() < 0.5) {
    const [a, , c] = pick(rng, TRIPLES);
    const val = [a, c];
    return mathQ('right-tri', d, {
      prompt: `In a right triangle, the two acute angles measure <i>x</i>° and <i>y</i>°. If sin(<i>x</i>°) = ${fracHtml(a, c)}, what is the value of cos(<i>y</i>°)?`,
      ex: steps(
        st(
          `The acute angles of a right triangle add up to 90°, so <i>y</i> = 90 ${MINUS} <i>x</i>.`,
          `Острые углы прямоугольного треугольника в сумме дают 90°, значит <i>y</i> = 90 ${MINUS} <i>x</i>.`,
          `Тікбұрышты үшбұрыштың сүйір бұрыштарының қосындысы 90°, демек <i>y</i> = 90 ${MINUS} <i>x</i>.`,
        ),
        st(
          `The side opposite one acute angle is adjacent to the other, so cos(<i>y</i>°) = sin(<i>x</i>°) = ${fracText(a, c)}.`,
          `Катет, противолежащий одному острому углу, прилежит к другому, поэтому cos(<i>y</i>°) = sin(<i>x</i>°) = ${fracText(a, c)}.`,
          `Бір сүйір бұрышқа қарсы катет екіншісіне іргелес, сондықтан cos(<i>y</i>°) = sin(<i>x</i>°) = ${fracText(a, c)}.`,
        ),
      ),
      ...(ctx.mcOnly || rng() >= 0.3
        ? { mc: makeMc(rng, val, [[c, a], [Math.sqrt(c * c - a * a), c], [a, Math.sqrt(c * c - a * a)]], ([n, m]) => fracHtml(n, m)) }
        : { spr: { value: a / c, display: fracText(a, c) } }),
    });
  }
  const [a, b, c] = pick(rng, TRIPLES);
  return mathQ('right-tri', d, {
    prompt: `In right triangle <i>ABC</i>, angle <i>C</i> is a right angle and cos(<i>A</i>) = ${fracHtml(b, c)}. What is the value of tan(<i>A</i>)?`,
    ex: steps(
      st(
        `cos(<i>A</i>) = adjacent ÷ hypotenuse, so take adjacent = ${b} and hypotenuse = ${c} (or any multiple).`,
        `cos(<i>A</i>) = прилежащий катет ÷ гипотенуза, возьмём прилежащий = ${b}, гипотенуза = ${c}.`,
        `cos(<i>A</i>) = іргелес катет ÷ гипотенуза, іргелес = ${b}, гипотенуза = ${c} деп аламыз.`,
      ),
      st(
        `Opposite side: √(${c * c} ${MINUS} ${b * b}) = ${a}. Then tan(<i>A</i>) = opposite ÷ adjacent = ${fracText(a, b)}.`,
        `Противолежащий катет: √(${c * c} ${MINUS} ${b * b}) = ${a}. Тогда tan(<i>A</i>) = противолежащий ÷ прилежащий = ${fracText(a, b)}.`,
        `Қарсы катет: √(${c * c} ${MINUS} ${b * b}) = ${a}. Сонда tan(<i>A</i>) = қарсы ÷ іргелес = ${fracText(a, b)}.`,
      ),
    ),
    ...(ctx.mcOnly || rng() >= 0.3
      ? { mc: makeMc(rng, [a, b], [[b, a], [a, c], [c, b]], ([n, m]) => fracHtml(n, m)) }
      : { spr: { value: a / b, display: fracText(a, b) } }),
  });
}

export function circles(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const r = randomInt(rng, 2, 12);
    if (rng() < 0.5) {
      return mathQ('circles', d, {
        prompt: `A circle has a radius of ${r} centimeters. What is the area of the circle, in square centimeters?`,
        ex: steps(
          st(`Area of a circle: <i>A</i> = π<i>r</i><sup>2</sup>.`, `Площадь круга: <i>A</i> = π<i>r</i><sup>2</sup>.`, `Дөңгелек ауданы: <i>A</i> = π<i>r</i><sup>2</sup>.`),
          same(`<i>A</i> = π · ${r}<sup>2</sup> = ${piFmt(r * r)}.`),
        ),
        mc: makeMc(rng, r * r, [2 * r, r, 4 * r * r], piFmt),
      });
    }
    return mathQ('circles', d, {
      prompt: `A circle has a diameter of ${2 * r} meters. What is the circumference of the circle, in meters?`,
      ex: steps(
        st(
          `Circumference: <i>C</i> = 2π<i>r</i> = π<i>d</i>.`,
          `Длина окружности: <i>C</i> = 2π<i>r</i> = π<i>d</i>.`,
          `Шеңбер ұзындығы: <i>C</i> = 2π<i>r</i> = π<i>d</i>.`,
        ),
        same(`<i>C</i> = π · ${2 * r} = ${piFmt(2 * r)}.`),
      ),
      mc: makeMc(rng, 2 * r, [4 * r, r, r * r], piFmt),
    });
  }
  if (d === 2) {
    let r;
    let deg;
    do {
      r = randomInt(rng, 2, 18);
      deg = pick(rng, [30, 40, 45, 60, 72, 80, 90, 120, 135, 150]);
    } while ((r * deg) % 180 !== 0);
    const k = (r * deg) / 180;
    return mathQ('circles', d, {
      prompt: `A circle has a radius of ${r} inches. What is the length, in inches, of an arc of the circle that has a central angle of ${deg}°?`,
      ex: steps(
        st(
          `The arc is ${deg}/360 of the whole circumference 2π · ${r} = ${piFmt(2 * r)}.`,
          `Дуга составляет ${deg}/360 всей окружности 2π · ${r} = ${piFmt(2 * r)}.`,
          `Доға бүкіл шеңбердің ${deg}/360 бөлігі, шеңбер ұзындығы 2π · ${r} = ${piFmt(2 * r)}.`,
        ),
        same(`${piFmt(2 * r)} · ${deg}/360 = ${piFmt(k)}.`),
      ),
      mc: makeMc(rng, k, [(r * r * deg) / 360, 2 * k, deg / r].filter(Number.isInteger), piFmt),
    });
  }
  const h = nonZero(rng, -6, 6);
  const k = nonZero(rng, -6, 6);
  const r = randomInt(rng, 2, 9);
  const D = -2 * h;
  const E = -2 * k;
  const Fc = r * r - h * h - k * k;
  const eq = `<i>x</i><sup>2</sup> + <i>y</i><sup>2</sup> ${D < 0 ? MINUS : '+'} ${Math.abs(D)}<i>x</i> ${E < 0 ? MINUS : '+'} ${Math.abs(E)}<i>y</i> = ${num(Fc)}`;
  return mathQ('circles', d, {
    prompt: `The equation ${eq} defines a circle in the <i>xy</i>-plane. What is the radius of the circle?`,
    ex: steps(
      st(
        `Complete the square for ${X} and for <i>y</i>: (<i>x</i> ${h > 0 ? MINUS : '+'} ${Math.abs(h)})<sup>2</sup> + (<i>y</i> ${k > 0 ? MINUS : '+'} ${Math.abs(k)})<sup>2</sup> = ${num(Fc)} + ${h * h} + ${k * k}.`,
        `Выделим полные квадраты по ${X} и по <i>y</i>: (<i>x</i> ${h > 0 ? MINUS : '+'} ${Math.abs(h)})<sup>2</sup> + (<i>y</i> ${k > 0 ? MINUS : '+'} ${Math.abs(k)})<sup>2</sup> = ${num(Fc)} + ${h * h} + ${k * k}.`,
        `${X} және <i>y</i> бойынша толық квадрат бөлеміз: (<i>x</i> ${h > 0 ? MINUS : '+'} ${Math.abs(h)})<sup>2</sup> + (<i>y</i> ${k > 0 ? MINUS : '+'} ${Math.abs(k)})<sup>2</sup> = ${num(Fc)} + ${h * h} + ${k * k}.`,
      ),
      st(
        `The right side is ${r * r} = <i>r</i><sup>2</sup>, so the radius is ${r}.`,
        `Справа ${r * r} = <i>r</i><sup>2</sup>, значит радиус равен ${r}.`,
        `Оң жақта ${r * r} = <i>r</i><sup>2</sup>, демек радиус ${r}.`,
      ),
    ),
    ...choose(ctx, r, [r * r, Math.abs(Fc) || r + 3, Math.abs(h) + Math.abs(k)]),
  });
}

export function similar(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const k = pick(rng, [1.5, 2, 2.5, 3]);
    let a;
    do a = randomInt(rng, 2, 10);
    while (!Number.isInteger(a * k));
    let b;
    do b = randomInt(rng, 3, 12);
    while (!Number.isInteger(b * k) || b === a);
    const ans = b * k;
    return mathQ('similar', d, {
      prompt: `Triangle <i>ABC</i> is similar to triangle <i>DEF</i>, where <i>A</i>, <i>B</i>, and <i>C</i> correspond to <i>D</i>, <i>E</i>, and <i>F</i>. If <i>AB</i> = ${a}, <i>DE</i> = ${num(a * k)}, and <i>BC</i> = ${b}, what is the length of <i>EF</i>?`,
      ex: steps(
        st(
          `Similar triangles have proportional sides. Scale factor: <i>DE</i>/<i>AB</i> = ${num(a * k)}/${a} = ${k}.`,
          `У подобных треугольников стороны пропорциональны. Коэффициент подобия: <i>DE</i>/<i>AB</i> = ${num(a * k)}/${a} = ${k}.`,
          `Ұқсас үшбұрыштардың қабырғалары пропорционал. Ұқсастық коэффициенті: <i>DE</i>/<i>AB</i> = ${num(a * k)}/${a} = ${k}.`,
        ),
        same(`<i>EF</i> = ${b} · ${k} = ${num(ans)}.`),
      ),
      ...choose(ctx, ans, [b + (a * k - a), b / k, a * k]),
    });
  }
  if (d === 2) {
    const [s, t] = pick(rng, [
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
      [3, 5],
    ]);
    const small = s * s * randomInt(rng, 2, 9);
    const ans = (small * t * t) / (s * s);
    return mathQ('similar', d, {
      prompt: `Two triangles are similar, and the ratio of their corresponding side lengths is ${s}:${t}. The area of the smaller triangle is ${small} square units. What is the area of the larger triangle, in square units?`,
      ex: steps(
        st(
          `If sides are in the ratio ${s}:${t}, areas are in the ratio ${s}<sup>2</sup>:${t}<sup>2</sup> = ${s * s}:${t * t}.`,
          `Если стороны относятся как ${s}:${t}, то площади — как ${s}<sup>2</sup>:${t}<sup>2</sup> = ${s * s}:${t * t}.`,
          `Қабырғалар ${s}:${t} қатынасында болса, аудандар ${s}<sup>2</sup>:${t}<sup>2</sup> = ${s * s}:${t * t} қатынасында болады.`,
        ),
        same(`${small} · ${t * t}/${s * s} = ${num(ans)}.`),
      ),
      ...choose(ctx, ans, [(small * t) / s, small + (t - s), small * t * t].filter(Number.isInteger)),
    });
  }
  let a;
  let b;
  let e;
  let ans;
  do {
    a = randomInt(rng, 2, 8);
    b = randomInt(rng, 2, 10);
    e = randomInt(rng, 3, 12);
    ans = (e * (a + b)) / a;
  } while (!Number.isInteger(ans * 2));
  return mathQ('similar', d, {
    prompt: `In triangle <i>ABC</i>, point <i>D</i> lies on <i>AB</i> and point <i>E</i> lies on <i>AC</i> so that <i>DE</i> is parallel to <i>BC</i>. If <i>AD</i> = ${a}, <i>DB</i> = ${b}, and <i>DE</i> = ${e}, what is the length of <i>BC</i>?`,
    ex: steps(
      st(
        `Because <i>DE</i> ∥ <i>BC</i>, triangle <i>ADE</i> is similar to triangle <i>ABC</i>.`,
        `Так как <i>DE</i> ∥ <i>BC</i>, треугольник <i>ADE</i> подобен треугольнику <i>ABC</i>.`,
        `<i>DE</i> ∥ <i>BC</i> болғандықтан, <i>ADE</i> үшбұрышы <i>ABC</i> үшбұрышына ұқсас.`,
      ),
      st(
        `<i>AB</i> = ${a} + ${b} = ${a + b}, so <i>BC</i>/<i>DE</i> = <i>AB</i>/<i>AD</i> = ${a + b}/${a}. Then <i>BC</i> = ${e} · ${a + b}/${a} = ${num(ans)}.`,
        `<i>AB</i> = ${a} + ${b} = ${a + b}, поэтому <i>BC</i>/<i>DE</i> = <i>AB</i>/<i>AD</i> = ${a + b}/${a}. Тогда <i>BC</i> = ${e} · ${a + b}/${a} = ${num(ans)}.`,
        `<i>AB</i> = ${a} + ${b} = ${a + b}, сондықтан <i>BC</i>/<i>DE</i> = <i>AB</i>/<i>AD</i> = ${a + b}/${a}. Сонда <i>BC</i> = ${e} · ${a + b}/${a} = ${num(ans)}.`,
      ),
      st(
        `Trap: the ratio uses the WHOLE side <i>AB</i>, not <i>DB</i>.`,
        `Ловушка: в пропорции участвует ВСЯ сторона <i>AB</i>, а не <i>DB</i>.`,
        `Тұзақ: пропорцияда <i>DB</i> емес, БҮКІЛ <i>AB</i> қабырғасы алынады.`,
      ),
    ),
    ...choose(ctx, ans, [(e * b) / a, e + b, (e * a) / b].map((x) => Math.round(x * 2) / 2), {
      display: fracText(e * (a + b), a),
    }),
  });
}
