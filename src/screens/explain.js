// Анимированные объяснения тем: интерактивные картинки, которые можно крутить ползунками и запускать.
// Каждая анимация — сцена (SVG) + ползунки/кнопки + подпись, которая объясняет, что происходит.

import { t, tx } from '../core/i18n.js';
import { getProfile, saveProfile } from '../core/profile.js';
import { navigate } from '../core/router.js';
import { EXPLAINERS, explainerById } from '../content/explainers.js';
import { skillName } from '../content/labels.js';
import { L } from '../pools/gen.js';
import { esc } from '../ui/dom.js';
import { runAdaptive } from './learn.js';

const W = 320;
const H = 220;
const reduced = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const fmt = (x, d = 2) => String(Math.round(x * 10 ** d) / 10 ** d).replace('-', '−');

/** Ползунок: { id, label, min, max, step, value }. */
function slider(s) {
  return `<label class="ex-slider"><span>${s.label}</span><input type="range" data-k="${s.id}" min="${s.min}" max="${s.max}" step="${s.step ?? 1}" value="${s.value}"><b data-v="${s.id}">${s.value}</b></label>`;
}

// ---------- Сцены ----------

const SCENES = {
  balance: {
    title: L('Equations as a balance', 'Уравнение — это весы', 'Теңдеу — таразы'),
    intro: L(
      'An equation is a balance: whatever you do to one pan, do to the other, and it stays level.',
      'Уравнение — это весы в равновесии. Что делаешь с одной чашей, то же делай с другой — и весы не перекосятся.',
      'Теңдеу — тепе-теңдіктегі таразы. Бір табақпен не істесең, екіншісімен де соны істе — таразы қисаймайды.',
    ),
    sliders: [
      { id: 'a', label: 'a', min: 1, max: 4, value: 3 },
      { id: 'x', label: 'x', min: 1, max: 5, value: 2 },
      { id: 'b', label: 'b', min: 0, max: 6, value: 4 },
    ],
    buttons: [L('Remove b from both pans', 'Убрать b с обеих чаш', 'Екі табақтан b-ны алу'), L('Divide both pans by a', 'Разделить обе чаши на a', 'Екі табақты a-ға бөлу'), L('Start again', 'Сначала', 'Басынан')],
    draw(v, step) {
      const { a, x, b } = v;
      const c = a * x + b;
      const leftX = step >= 2 ? 1 : a;
      const leftB = step >= 1 ? 0 : b;
      const rightN = step >= 2 ? x : step >= 1 ? c - b : c;
      const box = (i, n, cx, y, cls, label) => {
        const per = Math.min(5, n);
        const col = i % per;
        const row = Math.floor(i / per);
        return `<g class="${cls}" style="--i:${i}"><rect x="${cx - per * 11 + col * 22}" y="${y - 22 - row * 22}" width="19" height="19" rx="4"/><text x="${cx - per * 11 + col * 22 + 9.5}" y="${y - 8 - row * 22}">${label}</text></g>`;
      };
      const left = [
        ...Array.from({ length: leftX }, (_, i) => box(i, leftX + leftB, 85, 120, 'ex-x', 'x')),
        ...Array.from({ length: leftB }, (_, i) => box(leftX + i, leftX + leftB, 85, 120, 'ex-w', '1')),
      ].join('');
      const right = Array.from({ length: rightN }, (_, i) => box(i, rightN, 235, 120, 'ex-w', '1')).join('');
      const eq = [`${a === 1 ? '' : a}x + ${b} = ${c}`, `${a === 1 ? '' : a}x = ${c - b}`, `x = ${x}`][step];
      return {
        svg: `<line class="ex-axis" x1="160" y1="128" x2="160" y2="196"/><path class="ex-base" d="M130 200 L190 200 L160 180 Z"/>
          <g class="ex-beam"><line x1="40" y1="124" x2="280" y2="124"/><path class="ex-pan" d="M35 124 Q85 150 135 124"/><path class="ex-pan" d="M185 124 Q235 150 285 124"/>${left}${right}</g>
          <text class="ex-big" x="160" y="30">${eq}</text>`,
        caption: [
          L(`On the left: ${a} boxes x and ${b} weights. On the right: ${c} weights. The scale is level.`, `Слева: ${a} коробки x и ${b} гирь. Справа: ${c} гирь. Весы в равновесии.`, `Сол жақта: ${a} x қорапшасы және ${b} гір. Оң жақта: ${c} гір. Таразы тең.`),
          L(`We removed ${b} weights from both pans — still level: ${a}x = ${c - b}.`, `Убрали по ${b} гирь с обеих чаш — равновесие осталось: ${a}x = ${c - b}.`, `Екі табақтан ${b} гірден алдық — тепе-теңдік сақталды: ${a}x = ${c - b}.`),
          L(`Split each pan into ${a} equal parts: one box x weighs ${x}.`, `Делим каждую чашу на ${a} равные части: одна коробка x весит ${x}.`, `Әр табақты ${a} тең бөлікке бөлеміз: бір x қорапшасы ${x} тартады.`),
        ][step],
      };
    },
  },

  fractions: {
    title: L('What a fraction is', 'Что такое дробь', 'Бөлшек дегеніміз не'),
    intro: L('The denominator says into how many equal parts the whole is cut; the numerator says how many parts we take.', 'Знаменатель показывает, на сколько равных частей разрезали целое, числитель — сколько частей взяли.', 'Бөлім бүтінді неше тең бөлікке бөлгенін, алым — неше бөлік алғанын көрсетеді.'),
    sliders: [
      { id: 'n', label: L('numerator', 'числитель', 'алым'), min: 0, max: 12, value: 3 },
      { id: 'd', label: L('denominator', 'знаменатель', 'бөлім'), min: 2, max: 12, value: 4 },
    ],
    clamp(v) {
      v.n = Math.min(v.n, v.d);
    },
    buttons: [L('Multiply top and bottom by 2', 'Умножить числитель и знаменатель на 2', 'Алым мен бөлімді 2-ге көбейту'), L('Start again', 'Сначала', 'Басынан')],
    draw(v, step) {
      const d0 = v.d;
      const n0 = Math.min(v.n, d0);
      const k = step >= 1 ? 2 : 1;
      const d = d0 * k;
      const n = n0 * k;
      const cx = 95;
      const cy = 112;
      const r = 78;
      const slices = Array.from({ length: d }, (_, i) => {
        const a0 = (i / d) * Math.PI * 2 - Math.PI / 2;
        const a1 = ((i + 1) / d) * Math.PI * 2 - Math.PI / 2;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const p = `M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`;
        return `<path class="ex-slice ${i < n ? 'on' : ''}" style="--i:${i}" d="${p}"/>`;
      }).join('');
      const bar = Array.from({ length: d }, (_, i) => `<rect class="ex-slice ${i < n ? 'on' : ''}" style="--i:${i}" x="${195 + (i * 110) / d}" y="150" width="${110 / d - 1}" height="26" rx="3"/>`).join('');
      return {
        svg: `${slices}${bar}
          <text class="ex-big" x="250" y="70">${n}/${d}</text>
          <text class="ex-small" x="250" y="100">= ${fmt(n / d, 3).replace('.', ',')}</text>
          <text class="ex-small" x="250" y="126">= ${fmt((n / d) * 100, 1).replace('.', ',')}%</text>`,
        caption:
          step === 0
            ? L(`The whole is cut into ${d} equal parts and ${n} are shaded: ${n}/${d}.`, `Целое разрезали на ${d} равных частей и закрасили ${n}: это ${n}/${d}.`, `Бүтінді ${d} тең бөлікке бөліп, ${n}-ін бояды: бұл ${n}/${d}.`)
            : L(`Each part was cut in two: ${n}/${d} is the same amount as ${n0}/${d0}. That is why fractions can be simplified.`, `Каждую часть разрезали пополам: ${n}/${d} — то же количество, что ${n0}/${d0}. Поэтому дроби можно сокращать.`, `Әр бөлікті екіге бөлдік: ${n}/${d} — ${n0}/${d0}-пен бірдей мөлшер. Сондықтан бөлшекті қысқартуға болады.`),
      };
    },
  },

  percent: {
    title: L('Percent: one hundredth', 'Процент — это сотая часть', 'Пайыз — жүзден бір бөлік'),
    intro: L('Imagine the number cut into 100 equal cells. p% is p of those cells.', 'Представь, что число разрезали на 100 равных клеточек. p% — это p таких клеточек.', 'Санды 100 тең торкөзге бөлді деп елестет. p% — осындай p торкөз.'),
    sliders: [
      { id: 'p', label: 'p, %', min: 0, max: 100, value: 25 },
      { id: 'N', label: 'N', min: 100, max: 2000, step: 100, value: 400 },
    ],
    buttons: [],
    draw(v) {
      const cells = Array.from({ length: 100 }, (_, i) => `<rect class="ex-cell ${i < v.p ? 'on' : ''}" style="--i:${i}" x="${12 + (i % 10) * 18}" y="${18 + Math.floor(i / 10) * 18}" width="16" height="16" rx="3"/>`).join('');
      const one = v.N / 100;
      return {
        svg: `${cells}<text class="ex-small" x="262" y="60">1% = ${fmt(one)}</text><text class="ex-big" x="262" y="100">${v.p}%</text><text class="ex-small" x="262" y="130">= ${fmt((v.N * v.p) / 100)}</text>`,
        caption: L(`One cell is 1% of ${v.N}, that is ${v.N} ÷ 100 = ${fmt(one)}. ${v.p} cells: ${fmt(one)} × ${v.p} = ${fmt((v.N * v.p) / 100)}.`, `Одна клетка — 1% от ${v.N}, то есть ${v.N} ÷ 100 = ${fmt(one)}. ${v.p} клеток: ${fmt(one)} × ${v.p} = ${fmt((v.N * v.p) / 100)}.`, `Бір торкөз — ${v.N}-нің 1%-ы, яғни ${v.N} ÷ 100 = ${fmt(one)}. ${v.p} торкөз: ${fmt(one)} × ${v.p} = ${fmt((v.N * v.p) / 100)}.`),
      };
    },
  },

  pythagoras: {
    title: L('The Pythagorean theorem', 'Теорема Пифагора', 'Пифагор теоремасы'),
    intro: L('Build a square on each side of a right triangle: the two small squares together have exactly the area of the big one.', 'Построим квадрат на каждой стороне прямоугольного треугольника: два маленьких квадрата вместе равны по площади большому.', 'Тікбұрышты үшбұрыштың әр қабырғасына шаршы саламыз: екі кіші шаршының ауданы бірге үлкенінікіне тең.'),
    sliders: [
      { id: 'a', label: 'a', min: 1, max: 6, value: 3 },
      { id: 'b', label: 'b', min: 1, max: 6, value: 4 },
    ],
    buttons: [],
    draw(v) {
      const s = 16;
      const A = [120, 150];
      const B = [120 + v.b * s, 150];
      const C = [120, 150 - v.a * s];
      const c2 = v.a * v.a + v.b * v.b;
      const sq = (p, q, cls, i) => {
        const dx = q[0] - p[0];
        const dy = q[1] - p[1];
        return `<path class="ex-sq ${cls}" style="--i:${i}" d="M${p[0]} ${p[1]} L${q[0]} ${q[1]} L${q[0] + dy} ${q[1] - dx} L${p[0] + dy} ${p[1] - dx} Z"/>`;
      };
      return {
        svg: `<g transform="translate(-10 22) scale(0.82)">${sq(A, C, 'sq-a', 0)}${sq(B, A, 'sq-b', 1)}${sq(C, B, 'sq-c', 2)}<path class="ex-tri" d="M${A} L${B} L${C} Z"/></g>
          <text class="ex-small" x="250" y="60">a² = ${v.a * v.a}</text><text class="ex-small" x="250" y="86">b² = ${v.b * v.b}</text><text class="ex-big" x="250" y="122">c² = ${c2}</text><text class="ex-small" x="250" y="150">c = √${c2}${Number.isInteger(Math.sqrt(c2)) ? ` = ${Math.sqrt(c2)}` : ` ≈ ${fmt(Math.sqrt(c2))}`}</text>`,
        caption: L(`${v.a}² + ${v.b}² = ${v.a * v.a} + ${v.b * v.b} = ${c2}, so the hypotenuse is √${c2}. Try a = 3, b = 4 or a = 6, b = 8 for whole numbers.`, `${v.a}² + ${v.b}² = ${v.a * v.a} + ${v.b * v.b} = ${c2}, значит гипотенуза равна √${c2}. Попробуй a = 3, b = 4 — получится целое число.`, `${v.a}² + ${v.b}² = ${v.a * v.a} + ${v.b * v.b} = ${c2}, демек гипотенуза √${c2}. a = 3, b = 4 етіп көр — бүтін сан шығады.`),
      };
    },
  },

  angles: {
    title: L('Angles of a triangle add up to 180°', 'Сумма углов треугольника — 180°', 'Үшбұрыш бұрыштарының қосындысы — 180°'),
    intro: L('Tear off the three corners of any triangle and put them together: they always form a straight line.', 'Оторви три угла любого треугольника и сложи их вместе — всегда получится развёрнутый угол.', 'Кез келген үшбұрыштың үш бұрышын жыртып, бірге қос — әрқашан жазыңқы бұрыш шығады.'),
    sliders: [
      { id: 'A', label: 'A°', min: 20, max: 120, value: 60 },
      { id: 'B', label: 'B°', min: 20, max: 120, value: 50 },
    ],
    buttons: [L('Put the corners together', 'Сложить углы вместе', 'Бұрыштарды бірге қосу'), L('Start again', 'Сначала', 'Басынан')],
    draw(v, step) {
      let { A, B } = v;
      if (A + B > 160) B = 160 - A;
      const Cc = 180 - A - B;
      const rad = (d) => (d * Math.PI) / 180;
      const P = [40, 150];
      const Q = [200, 150];
      const ta = Math.tan(rad(A));
      const tb = Math.tan(rad(B));
      const x = (160 * tb) / (ta + tb);
      const R = [40 + x, 150 - x * ta];
      const wedge = (cx, cy, from, sweep, cls) => {
        const r = 26;
        const a0 = rad(from);
        const a1 = rad(from + sweep);
        return `<path class="ex-wedge ${cls}" d="M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy - r * Math.sin(a0)} A${r} ${r} 0 0 0 ${cx + r * Math.cos(a1)} ${cy - r * Math.sin(a1)} Z"/>`;
      };
      const together = step >= 1;
      const line = together ? `<line class="ex-axis" x1="210" y1="190" x2="310" y2="190"/>` : '';
      const wA = together ? wedge(260, 190, 0, A, 'w-a') : wedge(P[0], P[1], 0, A, 'w-a');
      const wB = together ? wedge(260, 190, A, Cc, 'w-c') : wedge(Q[0], Q[1], 180 - B, B, 'w-b');
      const wC = together ? wedge(260, 190, A + Cc, B, 'w-b') : wedge(R[0], R[1], 180 + A, Cc, 'w-c');
      return {
        svg: `<path class="ex-tri" d="M${P} L${Q} L${R} Z"/>${line}<g class="ex-move">${wA}${wB}${wC}</g>
          <text class="ex-small" x="${P[0] - 8}" y="${P[1] + 18}">A = ${A}°</text><text class="ex-small" x="${Q[0] + 4}" y="${Q[1] + 18}">B = ${B}°</text><text class="ex-small" x="${R[0]}" y="${R[1] - 10}">C = ${Cc}°</text>`,
        caption: together
          ? L(`${A}° + ${Cc}° + ${B}° = 180°: together the three angles make a straight line.`, `${A}° + ${Cc}° + ${B}° = 180°: три угла вместе образуют развёрнутый угол — прямую линию.`, `${A}° + ${Cc}° + ${B}° = 180°: үш бұрыш бірге жазыңқы бұрыш — түзу сызық құрайды.`)
          : L(`Change A and B: C always equals 180° − A − B = ${Cc}°.`, `Меняй A и B: угол C всегда равен 180° − A − B = ${Cc}°.`, `A мен B-ны өзгерт: C бұрышы әрқашан 180° − A − B = ${Cc}°.`),
      };
    },
  },

  parabola: {
    title: L('The parabola y = ax² + bx + c', 'Парабола y = ax² + bx + c', 'Парабола y = ax² + bx + c'),
    intro: L('a sets the direction and width, c moves the graph up and down, b shifts the vertex sideways. The discriminant tells how many times the graph crosses the x-axis.', 'a задаёт направление ветвей и ширину, c поднимает и опускает график, b сдвигает вершину вбок. Дискриминант показывает, сколько раз график пересекает ось x.', 'a тармақтардың бағыты мен енін, c графикті жоғары-төмен жылжытады, b төбені бүйірге ығыстырады. Дискриминант график x осін неше рет қиятынын көрсетеді.'),
    sliders: [
      { id: 'a', label: 'a', min: -3, max: 3, step: 0.5, value: 1 },
      { id: 'b', label: 'b', min: -6, max: 6, value: -2 },
      { id: 'c', label: 'c', min: -6, max: 6, value: -3 },
    ],
    buttons: [],
    draw(v) {
      const a = v.a === 0 ? 0.5 : v.a;
      const { b, c } = v;
      const sx = (x) => 160 + x * 22;
      const sy = (y) => 110 - y * 11;
      let path = '';
      for (let x = -7; x <= 7.001; x += 0.1) {
        const y = a * x * x + b * x + c;
        path += `${path ? 'L' : 'M'}${sx(x).toFixed(1)} ${Math.max(-50, Math.min(270, sy(y))).toFixed(1)} `;
      }
      const D = b * b - 4 * a * c;
      const xv = -b / (2 * a);
      const yv = a * xv * xv + b * xv + c;
      const roots = D < 0 ? [] : D === 0 ? [xv] : [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)];
      const grid = Array.from({ length: 15 }, (_, i) => `<line class="ex-grid" x1="${sx(i - 7)}" y1="0" x2="${sx(i - 7)}" y2="${H}"/>`).join('');
      return {
        svg: `${grid}<line class="ex-axis" x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}"/><line class="ex-axis" x1="${sx(0)}" y1="0" x2="${sx(0)}" y2="${H}"/>
          <path class="ex-curve" d="${path}"/>${roots.map((r) => `<circle class="ex-dot dot-root" cx="${sx(r)}" cy="${sy(0)}" r="5"/>`).join('')}<circle class="ex-dot" cx="${sx(xv)}" cy="${sy(yv)}" r="5"/>
          <text class="ex-tag" x="8" y="18">D = ${fmt(D)}</text>`,
        caption: L(
          `D = b² − 4ac = ${fmt(D)}: ${D > 0 ? 'two roots' : D === 0 ? 'one root' : 'no real roots'}. Vertex at x = −b/(2a) = ${fmt(xv)}.${roots.length ? ` Roots: ${roots.map((r) => fmt(r)).join('; ')}.` : ''}`,
          `D = b² − 4ac = ${fmt(D)}: ${D > 0 ? 'два корня' : D === 0 ? 'один корень' : 'корней нет'}. Вершина в x = −b/(2a) = ${fmt(xv)}.${roots.length ? ` Корни: ${roots.map((r) => fmt(r)).join('; ')}.` : ''}`,
          `D = b² − 4ac = ${fmt(D)}: ${D > 0 ? 'екі түбір' : D === 0 ? 'бір түбір' : 'түбір жоқ'}. Төбесі x = −b/(2a) = ${fmt(xv)}.${roots.length ? ` Түбірлер: ${roots.map((r) => fmt(r)).join('; ')}.` : ''}`,
        ),
      };
    },
  },

  'unit-circle': {
    title: L('Sine and cosine on the unit circle', 'Синус и косинус на единичной окружности', 'Бірлік шеңбердегі синус пен косинус'),
    intro: L('A point moves around a circle of radius 1. Its x-coordinate is the cosine of the angle, its y-coordinate is the sine.', 'Точка движется по окружности радиуса 1. Её координата x — косинус угла, координата y — синус.', 'Нүкте радиусы 1 шеңбер бойымен қозғалады. Оның x координатасы — бұрыштың косинусы, y координатасы — синусы.'),
    sliders: [{ id: 'deg', label: L('angle, °', 'угол, °', 'бұрыш, °'), min: 0, max: 360, step: 5, value: 30 }],
    buttons: [L('▶ Rotate', '▶ Крутить', '▶ Айналдыру')],
    play: 'deg',
    draw(v) {
      const r = 70;
      const cx = 90;
      const cy = 110;
      const a = (v.deg * Math.PI) / 180;
      const px = cx + r * Math.cos(a);
      const py = cy - r * Math.sin(a);
      let wave = '';
      for (let d = 0; d <= v.deg; d += 5) wave += `${wave ? 'L' : 'M'}${(180 + (d / 360) * 130).toFixed(1)} ${(cy - r * Math.sin((d * Math.PI) / 180)).toFixed(1)} `;
      return {
        svg: `<circle class="ex-ring" cx="${cx}" cy="${cy}" r="${r}"/><line class="ex-axis" x1="10" y1="${cy}" x2="315" y2="${cy}"/><line class="ex-axis" x1="${cx}" y1="25" x2="${cx}" y2="195"/>
          <line class="ex-cos" x1="${cx}" y1="${cy}" x2="${px}" y2="${cy}"/><line class="ex-sin" x1="${px}" y1="${cy}" x2="${px}" y2="${py}"/><line class="ex-rad" x1="${cx}" y1="${cy}" x2="${px}" y2="${py}"/>
          <circle class="ex-dot" cx="${px}" cy="${py}" r="6"/><path class="ex-curve thin" d="${wave}"/><line class="ex-axis" x1="180" y1="25" x2="180" y2="195"/>
          <text class="ex-tag t-cos" x="12" y="20">cos = ${fmt(Math.cos(a))}</text><text class="ex-tag t-sin" x="12" y="210">sin = ${fmt(Math.sin(a))}</text>`,
        caption: L(`Angle ${v.deg}°: cos = ${fmt(Math.cos(a))} (green, along x), sin = ${fmt(Math.sin(a))} (pink, along y). On the right, the sine traced as a wave.`, `Угол ${v.deg}°: cos = ${fmt(Math.cos(a))} (зелёный отрезок по x), sin = ${fmt(Math.sin(a))} (розовый по y). Справа — синус, нарисованный как волна.`, `Бұрыш ${v.deg}°: cos = ${fmt(Math.cos(a))} (x бойынша жасыл кесінді), sin = ${fmt(Math.sin(a))} (y бойынша қызғылт). Оң жақта — толқын түріндегі синус.`),
      };
    },
  },

  derivative: {
    title: L('The derivative is the slope of the tangent', 'Производная — наклон касательной', 'Туынды — жанаманың көлбеулігі'),
    intro: L('Take a secant through two close points of the graph and bring them together: the secant turns into the tangent, and its slope is the derivative.', 'Проведём секущую через две близкие точки графика и будем сближать их: секущая превратится в касательную, а её наклон — это производная.', 'График екі жақын нүктесі арқылы қиюшы жүргізіп, оларды жақындатайық: қиюшы жанамаға айналады, ал оның көлбеулігі — туынды.'),
    sliders: [
      { id: 'x0', label: 'x₀', min: -2, max: 2, step: 0.1, value: 0.5 },
      { id: 'h', label: 'h', min: 0, max: 2, step: 0.05, value: 1.5 },
    ],
    buttons: [L('▶ h → 0', '▶ h → 0', '▶ h → 0')],
    play: 'h',
    draw(v) {
      const f = (x) => (x * x * x) / 3 - x;
      const df = (x) => x * x - 1;
      const sx = (x) => 160 + x * 55;
      const sy = (y) => 110 - y * 55;
      let path = '';
      for (let x = -2.6; x <= 2.601; x += 0.05) path += `${path ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(f(x)).toFixed(1)} `;
      const x0 = v.x0;
      const x1 = x0 + v.h;
      const k = v.h > 0.001 ? (f(x1) - f(x0)) / v.h : df(x0);
      const line = (m) => `M${sx(-3)} ${sy(f(x0) + m * (-3 - x0))} L${sx(3)} ${sy(f(x0) + m * (3 - x0))}`;
      return {
        svg: `<line class="ex-axis" x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}"/><line class="ex-axis" x1="${sx(0)}" y1="0" x2="${sx(0)}" y2="${H}"/>
          <path class="ex-curve" d="${path}"/><path class="ex-tan" d="${line(df(x0))}"/>${v.h > 0.001 ? `<path class="ex-sec" d="${line(k)}"/><circle class="ex-dot dot-root" cx="${sx(x1)}" cy="${sy(f(x1))}" r="5"/>` : ''}<circle class="ex-dot" cx="${sx(x0)}" cy="${sy(f(x0))}" r="6"/>
          <text class="ex-tag" x="8" y="18">f(x) = x³/3 − x</text><text class="ex-tag t-sin" x="8" y="210">${t('explain.slope')}: ${fmt(k)}</text>`,
        caption: L(`Secant slope (f(x₀+h) − f(x₀)) / h = ${fmt(k)}. As h → 0 it approaches f′(x₀) = x₀² − 1 = ${fmt(df(x0))}.`, `Наклон секущей (f(x₀+h) − f(x₀)) / h = ${fmt(k)}. При h → 0 он стремится к f′(x₀) = x₀² − 1 = ${fmt(df(x0))}.`, `Қиюшының көлбеулігі (f(x₀+h) − f(x₀)) / h = ${fmt(k)}. h → 0 болғанда ол f′(x₀) = x₀² − 1 = ${fmt(df(x0))} мәніне ұмтылады.`),
      };
    },
  },

  probability: {
    title: L('Probability and the law of large numbers', 'Вероятность и закон больших чисел', 'Ықтималдық және үлкен сандар заңы'),
    intro: L('Roll a die many times. Each face has probability 1/6 ≈ 16.7%, and the more rolls, the closer the frequencies get to it.', 'Бросай кубик много раз. У каждой грани вероятность 1/6 ≈ 16,7%, и чем больше бросков, тем ближе к ней частоты.', 'Ойын сүйегін көп рет лақтыр. Әр жақтың ықтималдығы 1/6 ≈ 16,7%, лақтыру көбейген сайын жиіліктер соған жақындайды.'),
    sliders: [],
    buttons: [L('Roll 1', 'Бросить 1', '1 лақтыру'), L('Roll 10', 'Бросить 10', '10 лақтыру'), L('Roll 100', 'Бросить 100', '100 лақтыру'), L('Reset', 'Сбросить', 'Тазалау')],
    state: () => ({ counts: [0, 0, 0, 0, 0, 0], last: null }),
    onButton(i, st) {
      if (i === 3) {
        st.counts = [0, 0, 0, 0, 0, 0];
        st.last = null;
        return;
      }
      const n = [1, 10, 100][i];
      for (let k = 0; k < n; k++) {
        const f = Math.floor(Math.random() * 6);
        st.counts[f] += 1;
        st.last = f + 1;
      }
    },
    draw(v, step, st) {
      const total = st.counts.reduce((s, x) => s + x, 0);
      const bars = st.counts
        .map((cnt, i) => {
          const share = total ? cnt / total : 0;
          const h = share * 300;
          return `<rect class="ex-bar" x="${30 + i * 46}" y="${180 - h}" width="34" height="${h}" rx="4"/><text class="ex-small" x="${47 + i * 46}" y="198">${i + 1}</text><text class="ex-tiny" x="${47 + i * 46}" y="${174 - h}">${total ? Math.round(share * 100) : 0}%</text>`;
        })
        .join('');
      const ideal = 180 - 300 / 6;
      return {
        svg: `<line class="ex-axis" x1="20" y1="180" x2="310" y2="180"/>${bars}<line class="ex-ideal" x1="20" y1="${ideal}" x2="310" y2="${ideal}"/><text class="ex-tag" x="210" y="${ideal - 6}">1/6 ≈ 16,7%</text>
          ${st.last ? `<text class="ex-die" x="285" y="40">${'⚀⚁⚂⚃⚄⚅'[st.last - 1]}</text>` : ''}<text class="ex-tag" x="8" y="18">N = ${total}</text>`,
        caption: total
          ? L(`After ${total} rolls the bars are ${total < 60 ? 'still uneven — chance plays a big role' : 'getting close to the dashed line at 1/6'}.`, `После ${total} бросков столбики ${total < 60 ? 'ещё неровные — случай играет большую роль' : 'приближаются к пунктиру на уровне 1/6'}.`, `${total} лақтырудан кейін бағаналар ${total < 60 ? 'әлі тегіс емес — кездейсоқтықтың рөлі үлкен' : '1/6 деңгейіндегі пунктирге жақындап келеді'}.`)
          : L('Press a button to roll.', 'Нажми кнопку, чтобы бросить кубик.', 'Ойын сүйегін лақтыру үшін батырманы бас.'),
      };
    },
  },

  motion: {
    title: L('Moving towards each other', 'Движение навстречу', 'Қарсы қозғалыс'),
    intro: L('When two objects move towards each other, the distance between them shrinks by v₁ + v₂ every hour (the closing speed).', 'Когда два объекта движутся навстречу, расстояние между ними каждый час уменьшается на v₁ + v₂ — это скорость сближения.', 'Екі нысан қарама-қарсы қозғалғанда, олардың арасындағы қашықтық әр сағат сайын v₁ + v₂-ге азаяды — бұл жақындасу жылдамдығы.'),
    sliders: [
      { id: 'S', label: 'S, km', min: 60, max: 300, step: 20, value: 240 },
      { id: 'v1', label: 'v₁, km/h', min: 20, max: 100, step: 10, value: 60 },
      { id: 'v2', label: 'v₂, km/h', min: 20, max: 100, step: 10, value: 80 },
      { id: 'tt', label: 't, h', min: 0, max: 100, value: 0 },
    ],
    buttons: [L('▶ Go', '▶ Поехали', '▶ Жүрдік')],
    play: 'tt',
    draw(v) {
      const tMeet = v.S / (v.v1 + v.v2);
      const time = (v.tt / 100) * tMeet;
      const x1 = 30 + ((v.v1 * time) / v.S) * 260;
      const x2 = 290 - ((v.v2 * time) / v.S) * 260;
      const gap = Math.max(0, v.S - (v.v1 + v.v2) * time);
      return {
        svg: `<line class="ex-road" x1="20" y1="120" x2="300" y2="120"/><text class="ex-small" x="30" y="150">A</text><text class="ex-small" x="290" y="150">B</text>
          <text class="ex-car" x="${x1}" y="114">🚗</text><text class="ex-car flip" x="${x2}" y="114">🚙</text>
          <text class="ex-tag" x="8" y="20">t = ${fmt(time)} ${t('explain.h')}</text><text class="ex-tag" x="8" y="42">${t('explain.gap')}: ${fmt(gap, 0)} km</text>
          <text class="ex-small" x="160" y="190">t = S / (v₁ + v₂) = ${v.S} / ${v.v1 + v.v2} = ${fmt(tMeet)} ${t('explain.h')}</text>`,
        caption: L(`Closing speed ${v.v1} + ${v.v2} = ${v.v1 + v.v2} km/h. ${v.S} km ÷ ${v.v1 + v.v2} km/h = ${fmt(tMeet)} h until they meet.`, `Скорость сближения ${v.v1} + ${v.v2} = ${v.v1 + v.v2} км/ч. ${v.S} км ÷ ${v.v1 + v.v2} км/ч = ${fmt(tMeet)} ч до встречи.`, `Жақындасу жылдамдығы ${v.v1} + ${v.v2} = ${v.v1 + v.v2} км/сағ. Кездескенге дейін ${v.S} км ÷ ${v.v1 + v.v2} км/сағ = ${fmt(tMeet)} сағ.`),
      };
    },
  },
};

// ---------- Страницы ----------

export function explainIndexRoute(app) {
  const render = () => {
    app.innerHTML = `
      <section class="page explain-index">
        <div class="page-head">
          <h1>🎬 ${t('explain.title')}</h1>
          <p class="muted">${t('explain.desc')}</p>
        </div>
        <div class="explain-grid">${EXPLAINERS.map(
          (e, i) => `<a class="explain-card" href="#/explain/${e.id}" style="--i:${i}">
            <span class="explain-icon" aria-hidden="true">${e.icon}</span>
            <b>${esc(tx(SCENES[e.id].title))}</b>
            <small>${e.topics.map((id) => esc(tx(skillName(id)))).join(' · ')}</small>
          </a>`,
        ).join('')}</div>
      </section>`;
  };
  render();
  return { relabel: render };
}

export function explainRoute(app, { id }) {
  const meta = explainerById(id);
  const scene = SCENES[id];
  if (!meta || !scene) {
    navigate('/explain');
    return null;
  }
  const values = Object.fromEntries(scene.sliders.map((s) => [s.id, s.value]));
  const st = scene.state?.() ?? {};
  let step = 0;
  let anim = 0;
  let session = null;
  const p = getProfile();
  p.counters.explained = (p.counters.explained ?? 0) + 1;
  saveProfile();

  const draw = () => {
    if (scene.clamp) {
      scene.clamp(values);
      for (const s of scene.sliders) {
        const input = app.querySelector(`[data-k="${s.id}"]`);
        if (input && Number(input.value) !== values[s.id]) input.value = values[s.id];
      }
    }
    const out = scene.draw(values, step, st);
    app.querySelector('.ex-stage svg').innerHTML = out.svg;
    app.querySelector('.ex-caption').textContent = tx(out.caption);
    for (const s of scene.sliders) {
      const b = app.querySelector(`[data-v="${s.id}"]`);
      if (b) b.textContent = values[s.id];
    }
  };

  function play() {
    const key = scene.play;
    const s = scene.sliders.find((x) => x.id === key);
    cancelAnimationFrame(anim);
    const input = app.querySelector(`[data-k="${key}"]`);
    const from = key === 'h' ? s.max : s.min;
    const to = key === 'h' ? 0 : s.max;
    if (reduced()) {
      values[key] = to;
      input.value = to;
      draw();
      return;
    }
    const t0 = performance.now();
    const dur = key === 'deg' ? 4000 : 2600;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      const raw = from + (to - from) * e;
      values[key] = Math.round(raw / (s.step ?? 1)) * (s.step ?? 1);
      values[key] = Math.round(values[key] * 100) / 100;
      input.value = values[key];
      draw();
      if (k < 1) anim = requestAnimationFrame(tick);
    };
    anim = requestAnimationFrame(tick);
  }

  const render = () => {
    const topic = meta.topics[0];
    app.innerHTML = `
      <section class="page explain-page">
        <a class="crumb" href="#/explain">← ${t('explain.title')}</a>
        <div class="explain-head"><span class="explain-icon big" aria-hidden="true">${meta.icon}</span><div><h1>${esc(tx(scene.title))}</h1><p class="muted">${esc(tx(scene.intro))}</p></div></div>
        <div class="ex-card">
          <div class="ex-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(tx(scene.title))}"></svg></div>
          <p class="ex-caption" aria-live="polite"></p>
          ${scene.sliders.length ? `<div class="ex-controls">${scene.sliders.map((s) => slider({ ...s, label: typeof s.label === 'string' ? s.label : tx(s.label), value: values[s.id] })).join('')}</div>` : ''}
          ${scene.buttons.length ? `<div class="ex-buttons">${scene.buttons.map((b, i) => `<button type="button" class="btn ${i === 0 ? 'btn-primary' : 'btn-soft'} btn-sm" data-b="${i}">${esc(tx(b))}</button>`).join('')}</div>` : ''}
        </div>
        <div class="explain-next">
          <button type="button" class="btn btn-primary ex-train">▶ ${t('explain.train', { name: tx(skillName(topic)) })}</button>
          ${EXPLAINERS.length > 1 ? `<a class="btn btn-soft" href="#/explain/${EXPLAINERS[(EXPLAINERS.indexOf(meta) + 1) % EXPLAINERS.length].id}">${t('explain.next')} →</a>` : ''}
        </div>
      </section>`;
    app.querySelectorAll('[data-k]').forEach((input) =>
      input.addEventListener('input', () => {
        cancelAnimationFrame(anim);
        values[input.dataset.k] = Number(input.value);
        if (!scene.state) step = Math.min(step, 0);
        draw();
      }),
    );
    app.querySelectorAll('[data-b]').forEach((b) =>
      b.addEventListener('click', () => {
        const i = Number(b.dataset.b);
        if (scene.onButton) scene.onButton(i, st);
        else if (scene.play) play();
        else step = i === scene.buttons.length - 1 && i > 0 ? 0 : Math.min(i + 1, scene.buttons.length - 1);
        if (!scene.play || scene.onButton) draw();
      }),
    );
    app.querySelector('.ex-train').addEventListener('click', () => {
      session = runAdaptive(app, {
        title: () => `🎬 ${tx(skillName(topic))}`,
        spec: [[topic, [1, 2, 3]]],
        tier: 1,
        count: 8,
        exitTo: `/explain/${id}`,
        back: { label: `🎬 ${t('explain.back')}`, href: `/explain/${id}` },
      });
    });
    draw();
  };
  render();
  return {
    cleanup: () => {
      cancelAnimationFrame(anim);
      session?.cleanup?.();
    },
    relabel: () => (session ? session.relabel() : render()),
  };
}
