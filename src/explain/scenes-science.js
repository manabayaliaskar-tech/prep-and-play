// Анимации тем: физика, химия и биология. Формат сцены описан в src/screens/explain.js.
// В каждой сцене есть режимы (кнопки-переключатели), подписи с числами и почти везде «Задание» со случайной целью.

import { getLang, t, tx } from '../core/i18n.js';
import { L } from '../pools/gen.js';
import { esc } from '../ui/dom.js';
import { W, H, C, SVGNS, reduced, clamp, lerp, ease, n1, fmt, term, coef, lineEq, u, hhmm, arrow, plot, axes, slider, morph, AGAIN, RESET, PROGRESS } from './kit.js';

// ---------- Общие помощники сцен ----------

/** Текст в SVG. cls: exs-t (10,5), exs-s (9,5 серый), exs-m (12), exs-h (15), ex-big (22); якорь - ex-start / ex-end. */
const tt = (x, y, s, cls = 'exs-t', more = '') => `<text class="${cls}" x="${n1(x)}" y="${n1(y)}"${more}>${s}</text>`;
/** Линия цвета cls (exc-*). */
const ln = (x1, y1, x2, y2, cls = 'exc-m', w = 1.5, more = '') => `<line class="ex-stroke ${cls}" style="stroke-width:${w}" x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}"${more}/>`;
/** Подложка под подписи. */
const box = (x, y, w, h, more = '') => `<rect class="exs-panel" x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="6"${more}/>`;
/** Стрелка с подписью у конца (подпись не рисуется, если стрелка слишком короткая). */
const varrow = (x1, y1, x2, y2, cls, label, w = 2.5, dx = 0, dy = 0) => {
  if (Math.hypot(x2 - x1, y2 - y1) < 2) return '<g/>';
  return `${arrow(x1, y1, x2, y2, cls, w)}${label ? tt(x2 + dx, y2 + dy, label, `exs-t tc ${cls}`) : ''}`;
};
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const near = (x, y, tol) => Math.abs(x - y) <= tol;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
/** Подстрочные и надстрочные цифры. */
const sub = (n) => String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]);
const sup = (n) => String(n).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).replace('-', '⁻').replace('+', '⁺');
/** Русские окончания: ruN(5, 'атом', 'атома', 'атомов'). */
const ruN = (n, a, b, c) => {
  const k = Math.abs(Math.round(n));
  return k % 10 === 1 && k % 100 !== 11 ? a : k % 10 >= 2 && k % 10 <= 4 && (k % 100 < 12 || k % 100 > 14) ? b : c;
};
/** Единицы на трёх языках (для SVG - строкой на текущем языке). */
const UN = {
  V: () => u('V', 'В', 'В'),
  A: () => u('A', 'А', 'А'),
  Om: () => u('Ω', 'Ом', 'Ом'),
  W: () => u('W', 'Вт', 'Вт'),
  N: () => u('N', 'Н', 'Н'),
  kg: () => u('kg', 'кг', 'кг'),
  g: () => u('g', 'г', 'г'),
  m: () => u('m', 'м', 'м'),
  cm: () => u('cm', 'см', 'см'),
  s: () => u('s', 'с', 'с'),
  ms: () => u('m/s', 'м/с', 'м/с'),
  ms2: () => u('m/s²', 'м/с²', 'м/с²'),
  kPa: () => u('kPa', 'кПа', 'кПа'),
  kJ: () => u('kJ', 'кДж', 'кДж'),
  J: () => u('J', 'Дж', 'Дж'),
  mol: () => u('mol', 'моль', 'моль'),
  Hz: () => u('Hz', 'Гц', 'Гц'),
  L: () => u('L', 'л', 'л'),
};
// Кнопка «Задание»: первое нажатие включает режим задания, следующие дают новое.
const TASK = L('Task', 'Задание', 'Тапсырма');
const FREE = L('Free play', 'Свободно', 'Еркін');
const NEXT_TASK = u.bind(null, 'Press «Task» again for a new one.', 'Нажми «Задание» ещё раз - будет новое.', 'Жаңасы үшін «Тапсырма» батырмасын тағы бас.');
/** Подпись задания: условие + проверка. ok - решено ли; hint - подсказка, пока не решено. */
const taskCap = (goal, ok, hint, done) =>
  ok ? `✓ ${u('Correct!', 'Верно!', 'Дұрыс!')} ${done} ${NEXT_TASK()}` : `${u('Task', 'Задание', 'Тапсырма')}: ${goal} ${hint}`;
/** Значок задания на картинке. */
const taskBadge = (ok, x = 316, y = 14) =>
  `<g class="${ok ? 'exc-g' : 'exc-o'}"><rect class="ex-fill" x="${x - 74}" y="${y - 11}" width="74" height="16" rx="8" style="opacity:.18"/>${tt(x - 37, y + 1, ok ? `✓ ${u('solved', 'решено', 'шешілді')}` : u('task', 'задание', 'тапсырма'), 'exs-t tc')}</g>`;

// Закон Ома: схема с амперметром и вольтметром, график I(U), задания.
const ohmTask = () => {
  const type = ri(0, 2);
  for (let g = 0; g < 200; g++) {
    if (type === 0) {
      const R = pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 16, 20]);
      const U = ri(2, 12);
      if ((U * 100) % R === 0 && U / R >= 0.3 && U / R <= 4) return { type, U, R, I: U / R };
    } else if (type === 1) {
      const R = ri(2, 10);
      const I = pick([0.5, 1, 1.5, 2]);
      if (I * R <= 12 && I * R >= 2) return { type, U: I * R, R, I };
    } else {
      const U = pick([6, 9, 12]);
      const R = ri(2, 20);
      if ((U * U) % R === 0) return { type, U, R, I: U / R, P: (U * U) / R };
    }
  }
  return { type: 0, U: 12, R: 4, I: 3 };
};

// Схема: батарейка слева, резистор сверху, вольтметр параллельно резистору, амперметр справа.
function ohmCircuit(v, st, I) {
  const along = (s) => {
    s = ((s % 700) + 700) % 700;
    if (s < 240) return [40 + s, 40];
    if (s < 350) return [280, 40 + (s - 240) * (136 / 110)];
    if (s < 590) return [280 - (s - 350), 176];
    return [40, 176 - (s - 590) * (136 / 110)];
  };
  // Электроны идут от «−» к «+» по внешней цепи: против направления тока.
  const el = Array.from({ length: 22 }, (_, i) => {
    const [x, y] = along(-(i * 32 + st.ph));
    const hideR = y === 40 && x > 112 && x < 208;
    return `<circle class="ex-fill exc-b" cx="${n1(x)}" cy="${n1(y)}" r="${I > 0.005 && !hideR ? 2.4 : 0}"/>`;
  }).join('');
  const P = v.U * I;
  const heat = clamp(P / 40, 0, 1);
  const meter = (x, y, s, val, cls) => `<circle class="exs-panel" cx="${x}" cy="${y}" r="13"/><g class="${cls}"><circle class="ex-stroke" style="stroke-width:2" cx="${x}" cy="${y}" r="13"/></g>${tt(x, y + 4.5, s, 'exs-m')}${val}`;
  return `<path class="ex-wire" d="M40 40 H280 V176 H40 Z"/>
    <path class="ex-wire" style="stroke-width:2" d="M100 40 V78 H147 M173 78 H220 V40"/>
    <circle class="ex-glow" cx="160" cy="40" r="${n1(10 + 22 * heat)}" opacity="${n1(heat * 70) / 100}" style="fill:var(--orange)"/>
    <rect x="118" y="31" width="84" height="18" rx="4" class="ex-res" style="fill:color-mix(in srgb, var(--orange) ${Math.round(20 + heat * 70)}%, var(--card))"/>
    ${tt(160, 26, `R = ${fmt(v.R, 1)} ${UN.Om()}`, 'exs-t')}
    <rect x="30" y="100" width="20" height="18" style="fill:var(--surface)"/><line class="ex-batt" x1="27" y1="103" x2="53" y2="103"/><line class="ex-batt thin" x1="33" y1="114" x2="47" y2="114"/>
    ${tt(22, 99, '+', 'exs-m tc exc-r')}${tt(22, 123, '−', 'exs-m tc exc-b')}
    ${tt(58, 113, `U = ${fmt(v.U, 1)} ${UN.V()}`, 'exs-t ex-start')}
    ${el}
    ${meter(160, 78, 'V', tt(160, 104, `${fmt(v.U, 1)} ${UN.V()}`, 'exs-t tc exc-p'), 'exc-p')}
    ${meter(280, 108, 'A', tt(262, 112, `${fmt(I, 2)} ${UN.A()}`, 'exs-t ex-end tc exc-g'), 'exc-g')}
    ${I > 0.005 ? varrow(232, 52, 262, 52, 'exc-r', '', 2) + tt(247, 66, 'I', 'exs-t tc exc-r') : '<g/>'}
    ${box(66, 124, 188, 44)}
    ${tt(160, 141, `I = U / R = ${fmt(v.U, 1)} / ${fmt(v.R, 1)} = ${fmt(I, 2)} ${UN.A()}`, 'exs-t')}
    ${tt(160, 159, `P = U · I = ${fmt(P, 1)} ${UN.W()}`, 'exs-s')}
    ${tt(160, 200, u('blue dots - electrons (move from − to +), red arrow - current', 'синие точки - электроны (идут от − к +), красная стрелка - ток', 'көк нүктелер - электрондар (− -тен + -ке), қызыл нұсқар - ток'), 'exs-s')}`;
}

function ohmGraph(v, I) {
  const sx = (U) => 42 + U * 22;
  const sy = (i) => 186 - i * 40;
  let g = '';
  for (let U = 0; U <= 12; U += 2) g += `<line class="ex-grid" x1="${sx(U)}" y1="${sy(0)}" x2="${sx(U)}" y2="${sy(4)}"/>${tt(sx(U), 199, fmt(U, 0), 'exs-s')}`;
  for (let i = 0; i <= 4; i++) g += `<line class="ex-grid" x1="${sx(0)}" y1="${sy(i)}" x2="${sx(12)}" y2="${sy(i)}"/>${tt(34, sy(i) + 3, fmt(i, 0), 'exs-s ex-end')}`;
  const line = (R, cls, w) => {
    const Ue = Math.min(12, 4 * R);
    return `${ln(sx(0), sy(0), sx(Ue), sy(Ue / R), cls, w)}`;
  };
  const refs = [2, 4, 8]
    .map((R) => {
      const Ue = Math.min(12, 4 * R);
      return `<g class="ex-faint">${line(R, 'exc-m', 1.3)}</g>${tt(Ue < 12 ? sx(Ue) + 4 : sx(12), sy(Ue / R) - 5, `${R} ${UN.Om()}`, `exs-s ${Ue < 12 ? 'ex-start' : 'ex-end'}`)}`;
    })
    .join('');
  const Ue = Math.min(12, 4 * v.R);
  const shown = I <= 4.05;
  return `${g}<line class="ex-axis" x1="${sx(0)}" y1="${sy(0)}" x2="${sx(12) + 6}" y2="${sy(0)}"/><line class="ex-axis" x1="${sx(0)}" y1="${sy(0)}" x2="${sx(0)}" y2="${sy(4) - 6}"/>
    ${tt(sx(12) + 4, 212, `U, ${UN.V()}`, 'exs-t ex-end')}${tt(sx(0) + 4, 14, `I, ${UN.A()}`, 'exs-t ex-start')}
    ${refs}${line(v.R, 'exc-p', 3)}${tt(sx(Ue) - 4, sy(Ue / v.R) + 14, `R = ${fmt(v.R, 1)} ${UN.Om()}`, 'exs-t ex-end tc exc-p')}
    ${shown ? `${ln(sx(v.U), sy(I), sx(v.U), sy(0), 'exc-o ex-dash', 1.2)}${ln(sx(v.U), sy(I), sx(0), sy(I), 'exc-o ex-dash', 1.2)}<circle class="ex-dot" cx="${n1(sx(v.U))}" cy="${n1(sy(I))}" r="5"/>` : '<g/><g/><g/>'}
    ${box(50, 20, 104, 38)}${tt(102, 35, `I = ${fmt(I, 2)} ${UN.A()}`, 'exs-m')}${tt(102, 50, u('slope = 1 / R', 'наклон = 1 / R', 'көлбеулік = 1 / R'), 'exs-s')}`;
}

// Соединения проводников: последовательно, параллельно, смешанно (U = 12 В), задание на амперметр.
const CIR_U = 12;
const cirTotal = (m, a, b, c) => (m === 0 ? a + b + c : m === 1 ? 1 / (1 / a + 1 / b + 1 / c) : a + (b * c) / (b + c));
const cirTask = () => {
  for (let g = 0; g < 500; g++) {
    const m = ri(0, 2);
    const r1 = ri(1, 12);
    const r2 = ri(2, 20);
    const r3 = ri(1, 20);
    const R = cirTotal(m, r1, r2, r3);
    const I = CIR_U / R;
    if (Math.abs(I * 100 - Math.round(I * 100)) < 1e-6 && I >= 0.5 && I <= 12) return { m, r1, r2, r3, I };
  }
  return { m: 0, r1: 2, r2: 4, r3: 6, I: 1 };
};
// Резистор с подписью: R над ним, U и I под ним.
const cirRes = (cx, y, i, R, U, I, side = false) =>
  `<rect x="${cx - 22}" y="${y - 8}" width="44" height="16" rx="4" class="ex-res"/>${tt(cx, y - 13, `R${sub(i)} = ${fmt(R, 0)} ${UN.Om()}`, 'exs-t')}${side ? tt(cx + 28, y + 16, `${fmt(U, 1)} ${UN.V()} · ${fmt(I, 2)} ${UN.A()}`, 'exs-s ex-start tc exc-p') : tt(cx, y + 20, `${fmt(U, 1)} ${UN.V()} · ${fmt(I, 2)} ${UN.A()}`, 'exs-s tc exc-p')}`;
const cirBatt = (x, y, below = false) =>
  `<rect x="${x - 8}" y="${y - 14}" width="16" height="28" style="fill:var(--surface)"/><line class="ex-batt" x1="${x - 5}" y1="${y - 13}" x2="${x - 5}" y2="${y + 13}"/><line class="ex-batt thin" x1="${x + 5}" y1="${y - 7}" x2="${x + 5}" y2="${y + 7}"/>${tt(x, below ? y + 26 : y - 18, `${CIR_U} ${UN.V()}`, 'exs-t')}`;
const cirAmm = (x, y, I) =>
  `<circle class="exs-panel" cx="${x}" cy="${y}" r="11"/><g class="exc-g"><circle class="ex-stroke" style="stroke-width:2" cx="${x}" cy="${y}" r="11"/></g>${tt(x, y + 4, 'A', 'exs-m')}${tt(x, y - 16, `${fmt(I, 2)} ${UN.A()}`, 'exs-t tc exc-g')}`;

function cirDraw(m, v) {
  const [a, b, c] = [v.r1, v.r2, v.r3];
  const R = cirTotal(m, a, b, c);
  const I = CIR_U / R;
  let svg;
  if (m === 0) {
    svg = `<path class="ex-wire" d="M30 50 H290 V170 H30 Z"/>${cirBatt(110, 170)}${cirAmm(210, 170, I)}
      ${cirRes(80, 50, 1, a, I * a, I)}${cirRes(160, 50, 2, b, I * b, I)}${cirRes(240, 50, 3, c, I * c, I)}
      ${box(46, 92, 228, 52)}${tt(160, 110, `R = ${fmt(a, 0)} + ${fmt(b, 0)} + ${fmt(c, 0)} = ${fmt(R, 2)} ${UN.Om()}`, 'exs-t')}
      ${tt(160, 126, `I = U / R = ${CIR_U} / ${fmt(R, 2)} = ${fmt(I, 2)} ${UN.A()}`, 'exs-t')}
      ${tt(160, 139, u('the same current everywhere, U adds up', 'ток везде одинаковый, U складываются', 'ток бәрінде бірдей, U қосылады'), 'exs-s')}`;
  } else if (m === 1) {
    const ys = [34, 72, 110];
    const rs = [a, b, c];
    svg = `<path class="ex-wire" d="M70 34 V186 H250 V34 M70 34 H250 M70 72 H250 M70 110 H250"/>
      ${ys.map((y) => `<circle class="ex-fill" style="color:var(--ink)" cx="70" cy="${y}" r="3"/><circle class="ex-fill" style="color:var(--ink)" cx="250" cy="${y}" r="3"/>`).join('')}
      ${ys.map((y, i) => cirRes(140, y, i + 1, rs[i], CIR_U, CIR_U / rs[i], true)).join('')}
      ${cirBatt(110, 186, true)}${cirAmm(196, 186, I)}
      ${box(76, 128, 168, 32)}${tt(160, 141, `1/R = 1/${fmt(a, 0)} + 1/${fmt(b, 0)} + 1/${fmt(c, 0)}`, 'exs-t')}${tt(160, 155, `R = ${fmt(R, 2)} ${UN.Om()}, I = ${fmt(I, 2)} ${UN.A()}`, 'exs-t')}`;
  } else {
    const p = (b * c) / (b + c);
    const I1 = I;
    const Up = I * p;
    svg = `<path class="ex-wire" d="M30 70 H140 M140 40 V100 M140 40 H260 M140 100 H260 M260 40 V100 M260 70 H290 V184 H30 V70"/>
      <circle class="ex-fill" style="color:var(--ink)" cx="140" cy="70" r="3"/><circle class="ex-fill" style="color:var(--ink)" cx="260" cy="70" r="3"/>
      ${cirRes(80, 70, 1, a, I * a, I1)}${cirRes(200, 40, 2, b, Up, Up / b)}${cirRes(200, 100, 3, c, Up, Up / c)}
      ${cirBatt(110, 184, true)}${cirAmm(210, 184, I)}
      ${box(40, 122, 240, 30)}${tt(160, 134, `R = ${fmt(a, 0)} + ${fmt(b, 0)}·${fmt(c, 0)}/(${fmt(b, 0)} + ${fmt(c, 0)}) = ${fmt(R, 2)} ${UN.Om()}`, 'exs-t')}${tt(160, 147, `I = ${CIR_U} / ${fmt(R, 2)} = ${fmt(I, 2)} ${UN.A()}`, 'exs-t')}`;
  }
  return { svg, R, I };
}

// Второй закон Ньютона с трением: силы на тележке, движение, график v(t), задания.
const G = 9.8;
const nwtA = (F, m, mu) => Math.max(0, (F - mu * m * G) / m);
const nwtTask = () => {
  const type = ri(0, 2);
  for (let g = 0; g < 300; g++) {
    if (type === 0) {
      const m = pick([1, 2, 4, 5]);
      const mu = pick([0, 0.1, 0.2]);
      const a = pick([0.5, 1, 1.5, 2, 3]);
      const F = m * (a + mu * G);
      if (F <= 19.5) return { type, m, mu, a, F };
    } else if (type === 1) {
      const m = pick([1, 2, 2.5, 4, 5, 8]);
      const F = ri(4, 20);
      const a = F / m;
      if (Math.abs(a * 10 - Math.round(a * 10)) < 1e-9 && a <= 10) return { type, m, mu: 0, a, F };
    } else {
      const m = pick([2, 3, 4, 5]);
      const mu = pick([0.2, 0.3, 0.4]);
      const F = mu * m * G;
      if (F <= 19.5) return { type, m, mu, a: 0, F };
    }
  }
  return { type: 0, m: 2, mu: 0, a: 2, F: 4 };
};

// Бросок под углом (и горизонтальный с высоты): Земля, Луна, Марс, векторы скорости, энергия, задания.
const PLANETS = [
  { g: 9.8, name: L('Earth', 'Земля', 'Жер') },
  { g: 1.62, name: L('Moon', 'Луна', 'Ай') },
  { g: 3.7, name: L('Mars', 'Марс', 'Марс') },
];
/** Полёт: время, дальность, наибольшая высота. */
const flight = (v0, al, h0, g) => {
  const vx = v0 * Math.cos(rad(al));
  const vy = v0 * Math.sin(rad(al));
  const T = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g;
  return { vx, vy, T, L: vx * T, Hm: h0 + (vy > 0 ? (vy * vy) / (2 * g) : 0), tTop: vy > 0 ? vy / g : 0 };
};
const prjTask = (g) => {
  const type = ri(0, 3);
  if (type === 0) {
    const v0 = pick([15, 18, 20]);
    const h0 = pick([0, 0, 10]);
    const a = ri(15, 70);
    return { type, v0, h0, D: Math.round(flight(v0, a, h0, g).L), al: 80 };
  }
  if (type === 1) return { type, v0: pick([12, 16, 20, 24]), h0: 0, al: 20 };
  if (type === 2) {
    const a0 = pick([15, 20, 25, 30, 35, 40]);
    return { type, v0: pick([16, 20]), h0: 0, a0, al: 45 };
  }
  const h0 = pick([5, 20, 30]);
  const v = pick([8, 10, 12, 15]);
  return { type, v0: 5, h0, al: 0, D: Math.round(v * Math.sqrt((2 * h0) / g)) };
};

// Линза: собирающая и рассеивающая, три луча, все классические случаи, формула тонкой линзы, задания.
const LENS_CASES = [
  { k: 3, name: L('d > 2F: camera, eye', 'd > 2F: фотоаппарат, глаз', 'd > 2F: фотоаппарат, көз') },
  { k: 2, name: L('d = 2F: copier', 'd = 2F: копировальный аппарат', 'd = 2F: көшіру аппараты') },
  { k: 1.5, name: L('F < d < 2F: projector', 'F < d < 2F: проектор', 'F < d < 2F: проектор') },
  { k: 1, name: L('d = F: searchlight, no image', 'd = F: прожектор, изображения нет', 'd = F: прожектор, кескін жоқ') },
  { k: 0.5, name: L('d < F: magnifying glass', 'd < F: лупа', 'd < F: лупа') },
];
const LENS_SHOTS = [
  [10, 15, 30], [10, 20, 20], [10, 30, 15], [10, 14, 35], [8, 12, 24], [8, 16, 16], [8, 24, 12], [6, 9, 18], [6, 12, 12], [6, 18, 9],
];
const lensTask = () => {
  const type = ri(0, 4);
  if (type === 3) {
    const [F, d, f] = pick(LENS_SHOTS);
    return { type, F, d, f };
  }
  const F = pick([6, 8, 10, 12]);
  const d = [1.5 * F, 2 * F, F / 2, 0, F][type];
  return { type, F, d };
};
/** Изображение: f (минус - мнимое), увеличение. */
const lensImg = (d, F, div) => {
  if (div) {
    const f = -(d * F) / (d + F);
    return { f, G: -f / d, none: false };
  }
  if (Math.abs(d - F) < 0.01) return { f: Infinity, G: Infinity, none: true };
  const f = (d * F) / (d - F);
  return { f, G: Math.abs(f / d), none: false };
};

// Преломление и полное внутреннее отражение: пары сред, углы, скорость света в среде, задания.
const MEDIA = [
  [1, L('air', 'воздух', 'ауа')],
  [1.33, L('water', 'вода', 'су')],
  [1.5, L('glass', 'стекло', 'шыны')],
  [2.42, L('diamond', 'алмаз', 'алмас')],
];
const MEDIA_PAIRS = [[1, 1.33], [1, 1.5], [1, 2.42], [1.33, 1], [1.5, 1], [1.5, 1.33], [2.42, 1]];
const medName = (n) => {
  const m = MEDIA.find(([k]) => Math.abs(k - n) < 0.006);
  return m ? tx(m[1]) : `n = ${fmt(n, 2)}`;
};
const refrTask = () => {
  const type = ri(0, 2);
  if (type === 0) {
    const [n1, n2] = pick([[1, 1.33], [1, 1.5], [1.5, 1], [1.33, 1]]);
    const b = n1 < n2 ? pick([20, 25, 30, 35]) : pick([30, 35, 40, 50, 60]);
    return { type, n1, n2, b, a: 10 };
  }
  if (type === 1) {
    const [n1, n2] = pick([[1.5, 1], [1.33, 1], [2.42, 1], [1.5, 1.33]]);
    return { type, n1, n2, crit: deg(Math.asin(n2 / n1)), a: 10 };
  }
  const [n2, b] = pick([[1.33, 40.6], [1.5, 35.3], [2.42, 21]]);
  return { type, n1: 1, n2: 1.7, a: 60, b, ans: n2 };
};

// Уравнивание реакций: три уровня, подсчёт атомов каждого элемента, подсказка, ответ.
/** 'Al2(SO4)3' → { Al: 2, S: 3, O: 12 }. */
const parseF = (f) => {
  const stack = [{}];
  const re = /([A-Z][a-z]?|\(|\))(\d*)/g;
  let m;
  while ((m = re.exec(f))) {
    const k = Number(m[2] || 1);
    if (m[1] === '(') stack.push({});
    else if (m[1] === ')') {
      const g = stack.pop();
      for (const [e, c] of Object.entries(g)) stack.at(-1)[e] = (stack.at(-1)[e] ?? 0) + c * k;
    } else stack.at(-1)[m[1]] = (stack.at(-1)[m[1]] ?? 0) + k;
  }
  return stack[0];
};
const subF = (f) => f.replace(/\d+/g, (d) => sub(d));
const RX_TYPES = [L('synthesis', 'соединение', 'қосылу'), L('decomposition', 'разложение', 'айырылу'), L('single replacement', 'замещение', 'орын басу'), L('exchange', 'обмен', 'алмасу'), L('combustion', 'горение', 'жану')];
// [реагенты, продукты, ответ, тип]
const RX = [
  [
    [['H2', 'O2'], ['H2O'], [2, 1, 2], 0],
    [['N2', 'H2'], ['NH3'], [1, 3, 2], 0],
    [['Mg', 'O2'], ['MgO'], [2, 1, 2], 0],
    [['Na', 'Cl2'], ['NaCl'], [2, 1, 2], 0],
    [['H2', 'Cl2'], ['HCl'], [1, 1, 2], 0],
    [['H2O'], ['H2', 'O2'], [2, 2, 1], 1],
    [['HgO'], ['Hg', 'O2'], [2, 2, 1], 1],
    [['CaCO3'], ['CaO', 'CO2'], [1, 1, 1], 1],
    [['Ca', 'O2'], ['CaO'], [2, 1, 2], 0],
  ],
  [
    [['Al', 'O2'], ['Al2O3'], [4, 3, 2], 0],
    [['P', 'O2'], ['P2O5'], [4, 5, 2], 0],
    [['Fe', 'O2'], ['Fe3O4'], [3, 2, 1], 0],
    [['Zn', 'HCl'], ['ZnCl2', 'H2'], [1, 2, 1, 1], 2],
    [['Al', 'HCl'], ['AlCl3', 'H2'], [2, 6, 2, 3], 2],
    [['Na', 'H2O'], ['NaOH', 'H2'], [2, 2, 2, 1], 2],
    [['Fe2O3', 'H2'], ['Fe', 'H2O'], [1, 3, 2, 3], 2],
    [['KClO3'], ['KCl', 'O2'], [2, 2, 3], 1],
    [['H2O2'], ['H2O', 'O2'], [2, 2, 1], 1],
    [['CH4', 'O2'], ['CO2', 'H2O'], [1, 2, 1, 2], 4],
  ],
  [
    [['C3H8', 'O2'], ['CO2', 'H2O'], [1, 5, 3, 4], 4],
    [['C2H6', 'O2'], ['CO2', 'H2O'], [2, 7, 4, 6], 4],
    [['C6H12O6', 'O2'], ['CO2', 'H2O'], [1, 6, 6, 6], 4],
    [['NH3', 'O2'], ['NO', 'H2O'], [4, 5, 4, 6], 4],
    [['FeS2', 'O2'], ['Fe2O3', 'SO2'], [4, 11, 2, 8], 4],
    [['KMnO4'], ['K2MnO4', 'MnO2', 'O2'], [2, 1, 1, 1], 1],
    [['Ca(OH)2', 'HCl'], ['CaCl2', 'H2O'], [1, 2, 1, 2], 3],
    [['Ca(OH)2', 'H3PO4'], ['Ca3(PO4)2', 'H2O'], [3, 2, 1, 6], 3],
    [['Al2(SO4)3', 'NaOH'], ['Al(OH)3', 'Na2SO4'], [1, 6, 2, 3], 3],
    [['Fe2O3', 'CO'], ['Fe', 'CO2'], [1, 3, 2, 3], 2],
  ],
];
const EL_CLS = { H: 'exc-p', O: 'exc-r', N: 'exc-b', C: 'exc-m', Cl: 'exc-g', Na: 'exc-o', K: 'exc-o', Fe: 'exc-o', Al: 'exc-k', S: 'exc-y', Ca: 'exc-a', Mg: 'exc-k', Zn: 'exc-b', P: 'exc-o', Hg: 'exc-m', Mn: 'exc-k' };
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// Атом: элементы 1-20, протоны, нейтроны, электроны по слоям и подуровням, ионы, изотопы, задания.
const EL = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca'.split(' ');
const EL_EN = 'Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium'.split(' ');
const EL_RU = 'Водород Гелий Литий Бериллий Бор Углерод Азот Кислород Фтор Неон Натрий Магний Алюминий Кремний Фосфор Сера Хлор Аргон Калий Кальций'.split(' ');
const EL_KK = 'Сутек Гелий Литий Бериллий Бор Көміртек Азот Оттек Фтор Неон Натрий Магний Алюминий Кремний Фосфор Күкірт Хлор Аргон Калий Кальций'.split(' ');
const EL_AR = [1, 4, 7, 9, 11, 12, 14, 16, 19, 20, 23, 24, 27, 28, 31, 32, 35.5, 40, 39, 40];
// Нейтроны изотопов: первый - самый распространённый; радиоактивные помечены в ISO_RAD (Z-A).
const EL_ISO = [[0, 1, 2], [2, 1], [4, 3], [5], [6, 5], [6, 7, 8], [7, 8], [8, 9, 10], [10], [10, 12, 11], [12], [12, 13, 14], [14], [14, 15, 16], [16], [16, 18, 17], [18, 20], [22, 18, 20], [20, 22, 21], [20, 24, 22]];
const ISO_RAD = ['1-3', '6-14', '19-40'];
const EL_ION = [1, 0, 1, 2, 0, 0, -3, -2, -1, 0, 1, 2, 3, 0, -3, -2, -1, 0, 1, 2];
const EL_KIND = [0, 2, 1, 1, 0, 0, 0, 0, 0, 2, 1, 1, 1, 0, 0, 0, 0, 2, 1, 1];
const elName = (z) => u(EL_EN[z - 1], EL_RU[z - 1], EL_KK[z - 1]);
const elLow = (z) => u(EL_EN[z - 1], EL_RU[z - 1].toLowerCase(), EL_KK[z - 1].toLowerCase());
const shellsOf = (e) => {
  const out = [];
  for (let left = e, i = 0, cap = [2, 8, 8, 2]; left > 0 && i < 4; i++) out.push(Math.min(left, cap[i])), (left -= cap[i]);
  return out;
};
const configOf = (e) => {
  const subs = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2]];
  const out = [];
  for (let left = e, i = 0; left > 0 && i < subs.length; i++) out.push(`${subs[i][0]}${sup(Math.min(left, subs[i][1]))}`), (left -= subs[i][1]);
  return out.join(' ') || '-';
};
const chargeSup = (q) => (q === 0 ? '' : `${Math.abs(q) > 1 ? sup(Math.abs(q)) : ''}${q > 0 ? '⁺' : '⁻'}`);
const groupOf = (z) => {
  const val = z === 2 ? 8 : shellsOf(z).at(-1);
  return `${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][val - 1]}A`;
};
const atomTask = () => {
  const type = ri(0, 3);
  const z = ri(3, 20);
  if (type === 1) {
    const iso = EL_ISO[z - 1];
    return { type, z, n: iso.length > 1 ? iso[1] : iso[0] };
  }
  if (type === 2) {
    const zi = pick([3, 7, 8, 9, 11, 12, 13, 15, 16, 17, 19, 20]);
    return { type, z: zi, e: zi - EL_ION[zi - 1] };
  }
  return { type, z };
};

// Моль: n = m/M, число частиц, объём газа при н. у., массовая доля элемента, задания.
const SUBST = [
  ['H2O', 0], ['CO2', 1], ['O2', 1], ['NaCl', 0], ['H2SO4', 0], ['CaCO3', 0], ['NH3', 1], ['CH4', 1], ['HCl', 1], ['NaOH', 0], ['H2', 1], ['N2', 1], ['C6H12O6', 0],
];
const arOf = (e) => EL_AR[EL.indexOf(e)];
const molarOf = (f) => Object.entries(parseF(f)).reduce((s, [e, k]) => s + k * arOf(e), 0);
const molarSum = (f) => Object.entries(parseF(f)).map(([e, k]) => `${k > 1 ? `${k}·` : ''}${fmt(arOf(e), 1)}`).join(' + ');
const molTask = () => {
  const type = ri(0, 2);
  if (type === 1) {
    const s = pick(SUBST.map((x, i) => [x, i]).filter(([x]) => x[1]));
    const V = pick([5.6, 11.2, 22.4, 33.6, 44.8]);
    const M = molarOf(s[0][0]);
    if ((V / 22.4) * M <= 200) return { type, s: s[1], V, n: V / 22.4, m: (V / 22.4) * M };
  }
  for (let g = 0; g < 100; g++) {
    const s = ri(0, SUBST.length - 1);
    const M = molarOf(SUBST[s][0]);
    const n = pick([0.1, 0.2, 0.25, 0.5, 1, 1.5, 2, 3]);
    if (n * M <= 200 && n * M >= 3) return { type: type === 1 ? 0 : type, s, n, m: n * M };
  }
  return { type: 0, s: 0, n: 2, m: 36 };
};

// Генетика: моно- и дигибридное скрещивание, неполное доминирование, сцепленное с полом, задания на расщепление.
let PUN_MODE = 0; // для подписей ползунков: текущий режим сцены punnett
const punA = (i) => Math.floor(i / 3);
const punB = (i) => i % 3;
const allele = (n, big, small) => (n === 2 ? [big, big] : n === 1 ? [big, small] : [small, small]);
const geno = (i, mode, female) => {
  const a = punA(i);
  if (mode === 3) return female ? ['XᴴXᴴ', 'XᴴXʰ', 'XʰXʰ'][2 - a] : a ? 'XᴴY' : 'XʰY';
  const A = allele(a, 'A', 'a').join('');
  return mode === 1 ? A + allele(punB(i), 'B', 'b').join('') : A;
};
const PUN_TASKS = [
  { mode: 0, ph: [3, 1], text: L('get the phenotype ratio 3 : 1', 'получи расщепление по фенотипу 3 : 1', 'фенотип бойынша 3 : 1 ажырауын ал') },
  { mode: 0, ph: [1, 1], text: L('get the phenotype ratio 1 : 1 (a test cross)', 'получи расщепление 1 : 1 (анализирующее скрещивание)', '1 : 1 ажырауын ал (талдаушы будандастыру)') },
  { mode: 0, gt: 'Aa', text: L('make all offspring Aa (uniform F₁)', 'сделай так, чтобы всё потомство было Aa (единообразие F₁)', 'барлық ұрпақ Aa болсын (F₁ біркелкілігі)') },
  { mode: 1, ph: [9, 3, 3, 1], text: L('get the ratio 9 : 3 : 3 : 1', 'получи расщепление 9 : 3 : 3 : 1', '9 : 3 : 3 : 1 ажырауын ал') },
  { mode: 1, ph: [1, 1, 1, 1], text: L('get the ratio 1 : 1 : 1 : 1', 'получи расщепление 1 : 1 : 1 : 1', '1 : 1 : 1 : 1 ажырауын ал') },
  { mode: 1, ph: [3, 3, 1, 1], text: L('get the ratio 3 : 3 : 1 : 1', 'получи расщепление 3 : 3 : 1 : 1', '3 : 3 : 1 : 1 ажырауын ал') },
  { mode: 2, ph: [2, 1, 1], text: L('get red, pink and white flowers 1 : 2 : 1', 'получи красные, розовые и белые цветки 1 : 2 : 1', 'қызыл, қызғылт және ақ гүлдерді 1 : 2 : 1 ал') },
  { mode: 2, gt: 'Aa', text: L('make all flowers pink', 'сделай все цветки розовыми', 'барлық гүл қызғылт болсын') },
  { mode: 3, sex: true, text: L('all daughters healthy, half of the sons with haemophilia', 'все дочери здоровы, половина сыновей с гемофилией', 'барлық қыздары сау, ұлдарының жартысы гемофилиямен') },
];
/** Потомство: список { g: генотип, p: номер фенотипа } по клеткам решётки. */
function punCross(i1, i2, mode) {
  const gam = (i) => {
    if (mode === 3) return null;
    const A = allele(punA(i), 'A', 'a');
    if (mode !== 1) return A;
    const B = allele(punB(i), 'B', 'b');
    return [A[0] + B[0], A[0] + B[1], A[1] + B[0], A[1] + B[1]];
  };
  let g1;
  let g2;
  if (mode === 3) {
    g1 = allele(punA(i1), 'Xᴴ', 'Xʰ');
    g2 = [punA(i2) ? 'Xᴴ' : 'Xʰ', 'Y'];
  } else {
    g1 = gam(i1);
    g2 = gam(i2);
  }
  const cells = [];
  for (const r of g2)
    for (const c of g1) {
      let g;
      let p;
      if (mode === 3) {
        // 0 - здоровая дочь, 1 - дочь-носитель, 2 - здоровый сын, 3 - больная дочь, 4 - больной сын
        if (r === 'Y') {
          g = `${c}Y`;
          p = c === 'Xʰ' ? 4 : 2;
        } else {
          g = c === r ? c + r : 'XᴴXʰ';
          const hs = (g.match(/ʰ/g) ?? []).length;
          p = hs === 2 ? 3 : hs;
        }
      } else if (mode === 1) {
        const a = [c[0], r[0]].sort().join('');
        const b = [c[1], r[1]].sort().join('');
        g = a + b;
        p = (a.includes('A') ? 0 : 2) + (b.includes('B') ? 0 : 1);
      } else {
        g = [c, r].sort().join('');
        const n = (g.match(/A/g) ?? []).length;
        p = mode === 2 ? 2 - n : n ? 0 : 1;
      }
      cells.push({ g, p });
    }
  return { g1, g2, cells };
}
const PH_NAMES = [
  [L('yellow', 'жёлтые', 'сары'), L('green', 'зелёные', 'жасыл')],
  [L('yellow smooth', 'жёлтые гладкие', 'сары тегіс'), L('yellow wrinkled', 'жёлтые морщинистые', 'сары бүріскен'), L('green smooth', 'зелёные гладкие', 'жасыл тегіс'), L('green wrinkled', 'зелёные морщинистые', 'жасыл бүріскен')],
  [L('red', 'красные', 'қызыл'), L('pink', 'розовые', 'қызғылт'), L('white', 'белые', 'ақ')],
  [L('healthy daughter', 'здоровая дочь', 'сау қыз'), L('carrier daughter', 'дочь-носитель', 'тасымалдаушы қыз'), L('healthy son', 'здоровый сын', 'сау ұл'), L('sick daughter', 'больная дочь', 'науқас қыз'), L('haemophilia son', 'сын с гемофилией', 'гемофилиямен ұл')],
];
/** Значок фенотипа: горошина (цвет, форма), цветок или человек. */
function phIcon(mode, p, x, y, r = 6) {
  if (mode === 0 || mode === 1) {
    const green = mode === 0 ? p === 1 : p >= 2;
    const wr = mode === 1 && p % 2 === 1;
    const cls = green ? 'ex-pea rec' : 'ex-pea dom';
    if (!wr) return `<circle class="${cls}" cx="${n1(x)}" cy="${n1(y)}" r="${r}"/>`;
    let d = '';
    for (let k = 0; k < 16; k++) {
      const rr = k % 2 ? r * 0.72 : r;
      d += `${k ? 'L' : 'M'}${n1(x + rr * Math.cos((k * Math.PI) / 8))} ${n1(y + rr * Math.sin((k * Math.PI) / 8))} `;
    }
    return `<path class="${cls}" d="${d}Z"/>`;
  }
  if (mode === 2) {
    const fill = ['var(--red)', 'color-mix(in srgb, var(--pink) 55%, var(--card))', 'var(--card)'][p];
    let petals = '';
    for (let k = 0; k < 5; k++) petals += `<circle cx="${n1(x + r * 0.62 * Math.cos((k * 2 * Math.PI) / 5))}" cy="${n1(y + r * 0.62 * Math.sin((k * 2 * Math.PI) / 5))}" r="${n1(r * 0.48)}" style="fill:${fill};stroke:var(--ink);stroke-width:.6"/>`;
    return `${petals}<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r * 0.28)}" class="ex-fill exc-y"/>`;
  }
  const cls = ['exc-g', 'exc-y', 'exc-g', 'exc-r', 'exc-r'][p];
  // Знаки пола рисуем линиями (не символами-эмодзи).
  const male = p === 2 || p === 4;
  const rr = r * 0.6;
  const cy2 = male ? y + 1.5 : y - 1.5;
  const mark = male
    ? `M${n1(x + rr * 0.7)} ${n1(cy2 - rr * 0.7)} L${n1(x + rr * 1.7)} ${n1(cy2 - rr * 1.7)} M${n1(x + rr * 0.9)} ${n1(cy2 - rr * 1.7)} H${n1(x + rr * 1.7)} V${n1(cy2 - rr * 0.9)}`
    : `M${n1(x)} ${n1(cy2 + rr)} V${n1(cy2 + rr * 2.2)} M${n1(x - rr * 0.6)} ${n1(cy2 + rr * 1.6)} H${n1(x + rr * 0.6)}`;
  return `<g class="${cls}"><circle class="ex-stroke" style="stroke-width:1.6" cx="${n1(x)}" cy="${n1(cy2)}" r="${n1(rr)}"/><path class="ex-stroke" style="stroke-width:1.6" d="${mark}"/></g>`;
}

// Фотосинтез: свет, CO₂, температура, дыхание, точка компенсации, график, задания.
const psT = (t) => (t <= 27 ? Math.exp(-(((t - 27) / 12) ** 2)) : t <= 40 ? Math.exp(-(((t - 27) / 16) ** 2)) : Math.exp(-((13 / 16) ** 2)) * Math.max(0, (48 - t) / 8));
const psC = (c) => c / (c + 0.04) / (0.15 / 0.19);
/** Валовая скорость (0..1), дыхание и чистая скорость. */
const psRate = (light, c, t) => {
  const P = psC(c) * psT(t) * (1 - Math.exp(-light / 28));
  const R = 0.05 + 0.0015 * t;
  return { P, R, net: P - R };
};
const psComp = (c, t) => {
  let a = 0;
  let b = 100;
  if (psRate(100, c, t).net < 0) return null;
  for (let i = 0; i < 40; i++) {
    const m = (a + b) / 2;
    if (psRate(m, c, t).net < 0) a = m;
    else b = m;
  }
  return b;
};
const psLimit = (v) => {
  const p0 = psRate(v.light, v.co2, v.t).P;
  const d = [psRate(Math.min(100, v.light + 15), v.co2, v.t).P - p0, psRate(v.light, Math.min(0.15, v.co2 + 0.03), v.t).P - p0, Math.max(psRate(v.light, v.co2, Math.min(50, v.t + 4)).P, psRate(v.light, v.co2, Math.max(0, v.t - 4)).P) - p0];
  const k = d.indexOf(Math.max(...d));
  return Math.max(...d) < 0.01 ? -1 : k;
};
const psTask = () => {
  const type = ri(0, 2);
  if (type === 0) {
    const co2 = pick([0.04, 0.1]);
    const t = pick([20, 25, 30]);
    return { type, co2, t, light: 0, Lc: psComp(co2, t) };
  }
  if (type === 1) return { type, light: 80, co2: 0.02, t: 8 };
  return { type, light: 80, co2: 0.1, t: 5 };
};

// Газ под поршнем: изотерма, изобара, изохора (pV = νRT), молекулы, графики, задания.
const GAS_NU = 0.0802; // моль: при 2 л и 300 К давление ≈ 100 кПа
const gasP = (V, T) => (GAS_NU * 8.31 * T) / (V / 1000) / 1000; // кПа, V в литрах
const gasTask = () => {
  const type = ri(0, 2);
  if (type === 0) {
    const [V0, V1] = pick([[2, 1], [3, 1.5], [2, 4], [4, 2], [3, 1]]);
    return { type, V0, T0: 300, p: gasP(V1, 300), ans: V1 };
  }
  if (type === 1) {
    const [T0, T1] = pick([[300, 450], [300, 600], [400, 200], [300, 150], [200, 500]]);
    return { type, V0: (GAS_NU * 8.31 * T0) / 100, T0, p0: 100, ans: T1, V1: (GAS_NU * 8.31 * T1) / 100 };
  }
  const [T0, T1] = pick([[300, 450], [300, 600], [400, 200], [300, 150]]);
  return { type, V0: 2, T0, ans: T1, p: gasP(2, T1) };
};

// Математический маятник: период, планеты, сравнение l и l/4, энергия, секундомер, задание.
const pendTask = (g) => {
  for (let k = 0; k < 100; k++) {
    const l = ri(2, 24) / 10;
    const T = Math.round(2 * Math.PI * Math.sqrt(l / g) * 10) / 10;
    const lt = (g * T * T) / (4 * Math.PI * Math.PI);
    if (lt >= 0.12 && lt <= 2.45) return { T, l: lt };
  }
  return { T: 2, l: (g * 4) / (4 * Math.PI * Math.PI) };
};

export const SCENES_SCIENCE = {
  ohm: {
    title: L("Ohm's law: I = U / R", 'Закон Ома: I = U / R', 'Ом заңы: I = U / R'),
    intro: L('Voltage pushes the charges, resistance holds them back: the current is I = U / R.', 'Напряжение толкает заряды, сопротивление их тормозит: сила тока I = U / R.', 'Кернеу зарядтарды итереді, кедергі тежейді: ток күші I = U / R.'),
    sliders: [
      { id: 'U', label: L('U, V', 'U, В', 'U, В'), min: 0, max: 12, step: 0.1, value: 6, hidden: (v, st) => st.m === 2 && st.task.type !== 1 },
      { id: 'R', label: L('R, Ω', 'R, Ом', 'R, Ом'), min: 1, max: 20, step: 0.1, value: 4, hidden: (v, st) => st.m === 2 && st.task.type === 1 },
    ],
    buttons: [L('Circuit', 'Схема', 'Схема'), L('Graph I(U)', 'График I(U)', 'I(U) графигі'), TASK],
    state: () => ({ ph: 0, m: 0, task: null }),
    pressed: (i, v, st) => i === st.m,
    onButton(i, st) {
      if (i < 2) {
        st.m = i;
        return null;
      }
      st.m = 2;
      st.task = ohmTask();
      return st.task.type === 1 ? { R: st.task.R, U: 1 } : { U: st.task.U, R: 20 };
    },
    live(dt, v, st) {
      st.ph = (st.ph + dt * (v.U / v.R) * 40) % 700;
    },
    draw(v, step, st) {
      const I = v.U / v.R;
      if (st.m === 1)
        return {
          svg: ohmGraph(v, I),
          caption: u(
            `The graph I(U) is a straight line through zero: I = U / R = ${fmt(v.U, 1)} / ${fmt(v.R, 1)} = ${fmt(I, 2)} A. The bigger R, the flatter the line (grey lines: 2, 4 and 8 Ω). Doubling U doubles I.`,
            `График I(U) - прямая через ноль: I = U / R = ${fmt(v.U, 1)} / ${fmt(v.R, 1)} = ${fmt(I, 2)} А. Чем больше R, тем положе прямая (серые - 2, 4 и 8 Ом). Увеличишь U вдвое - вдвое вырастет и I.`,
            `I(U) графигі - нөлден өтетін түзу: I = U / R = ${fmt(v.U, 1)} / ${fmt(v.R, 1)} = ${fmt(I, 2)} А. R неғұрлым үлкен болса, түзу соғұрлым жатық (сұр түзулер - 2, 4 және 8 Ом). U екі есе артса, I да екі есе артады.`,
          ),
        };
      let caption = u(
        `I = U / R = ${fmt(v.U, 1)} V ÷ ${fmt(v.R, 1)} Ω = ${fmt(I, 2)} A. The ammeter (in series) shows the current, the voltmeter (in parallel to R) shows the voltage. Power P = U · I = ${fmt(v.U * I, 1)} W - the resistor heats up.`,
        `I = U / R = ${fmt(v.U, 1)} В ÷ ${fmt(v.R, 1)} Ом = ${fmt(I, 2)} А. Амперметр (последовательно) показывает ток, вольтметр (параллельно R) - напряжение. Мощность P = U · I = ${fmt(v.U * I, 1)} Вт - резистор греется.`,
        `I = U / R = ${fmt(v.U, 1)} В ÷ ${fmt(v.R, 1)} Ом = ${fmt(I, 2)} А. Амперметр (тізбектей) токты, вольтметр (R-ге параллель) кернеуді көрсетеді. Қуат P = U · I = ${fmt(v.U * I, 1)} Вт - резистор қызады.`,
      );
      let extra = '';
      if (st.m === 2) {
        const k = st.task;
        let ok;
        let goal;
        let hint;
        let done;
        if (k.type === 0) {
          ok = near(v.R, k.R, 0.15);
          goal = u(`at U = ${k.U} V, choose R so that the ammeter shows I = ${fmt(k.I, 2)} A.`, `при U = ${k.U} В подбери R, чтобы амперметр показал I = ${fmt(k.I, 2)} А.`, `U = ${k.U} В кезінде амперметр I = ${fmt(k.I, 2)} А көрсететіндей R-ді тап.`);
          hint = I > k.I ? u('The current is too big - increase R.', 'Ток слишком большой - увеличь R.', 'Ток тым үлкен - R-ді арттыр.') : u('The current is too small - decrease R.', 'Ток слишком мал - уменьши R.', 'Ток тым аз - R-ді азайт.');
          done = `R = U / I = ${k.U} / ${fmt(k.I, 2)} = ${k.R} ${UN.Om()}.`;
        } else if (k.type === 1) {
          ok = near(v.U, k.U, 0.15);
          goal = u(`the resistor is R = ${k.R} Ω. What voltage gives I = ${fmt(k.I, 2)} A?`, `резистор R = ${k.R} Ом. Какое напряжение даст ток I = ${fmt(k.I, 2)} А?`, `резистор R = ${k.R} Ом. Қандай кернеу I = ${fmt(k.I, 2)} А ток береді?`);
          hint = I > k.I ? u('Too much current - lower U.', 'Ток больше нужного - уменьши U.', 'Ток артық - U-ды азайт.') : u('Too little current - raise U.', 'Ток меньше нужного - увеличь U.', 'Ток аз - U-ды арттыр.');
          done = `U = I · R = ${fmt(k.I, 2)} · ${k.R} = ${fmt(k.U, 1)} ${UN.V()}.`;
        } else {
          ok = near(v.R, k.R, 0.15);
          goal = u(`at U = ${k.U} V the resistor must give out P = ${fmt(k.P, 1)} W of heat. Choose R.`, `при U = ${k.U} В резистор должен выделять мощность P = ${fmt(k.P, 1)} Вт. Подбери R.`, `U = ${k.U} В кезінде резистор P = ${fmt(k.P, 1)} Вт қуат бөлуі керек. R-ді тап.`);
          hint = v.U * I > k.P ? u(`Now P = ${fmt(v.U * I, 1)} W - too much, increase R (P = U² / R).`, `Сейчас P = ${fmt(v.U * I, 1)} Вт - много, увеличь R (P = U² / R).`, `Қазір P = ${fmt(v.U * I, 1)} Вт - көп, R-ді арттыр (P = U² / R).`) : u(`Now P = ${fmt(v.U * I, 1)} W - too little, decrease R (P = U² / R).`, `Сейчас P = ${fmt(v.U * I, 1)} Вт - мало, уменьши R (P = U² / R).`, `Қазір P = ${fmt(v.U * I, 1)} Вт - аз, R-ді азайт (P = U² / R).`);
          done = `R = U² / P = ${k.U * k.U} / ${fmt(k.P, 1)} = ${k.R} ${UN.Om()}.`;
        }
        caption = taskCap(goal, ok, hint, done);
        extra = taskBadge(ok, 318, 14);
      }
      return { svg: ohmCircuit(v, st, I) + extra, caption };
    },
  },

  circuits: {
    title: L('Series, parallel and mixed circuits', 'Последовательное, параллельное и смешанное соединение', 'Тізбектей, параллель және аралас жалғау'),
    intro: L('In series resistances add up, in parallel the reciprocals add up. The battery gives U = 12 V.', 'При последовательном соединении складываются сопротивления, при параллельном - обратные величины. Батарея даёт U = 12 В.', 'Тізбектей жалғағанда кедергілер, параллель жалғағанда кері шамалар қосылады. Батарея U = 12 В береді.'),
    sliders: [
      { id: 'r1', label: L('R₁, Ω', 'R₁, Ом', 'R₁, Ом'), min: 1, max: 20, step: 1, value: 6, hidden: (v, st) => st.m === 3 },
      { id: 'r2', label: L('R₂, Ω', 'R₂, Ом', 'R₂, Ом'), min: 1, max: 20, step: 1, value: 3, hidden: (v, st) => st.m === 3 },
      { id: 'r3', label: L('R₃, Ω', 'R₃, Ом', 'R₃, Ом'), min: 1, max: 20, step: 1, value: 2 },
    ],
    buttons: [L('Series', 'Последовательно', 'Тізбектей'), L('Parallel', 'Параллельно', 'Параллель'), L('Mixed', 'Смешанно', 'Аралас'), TASK],
    state: () => ({ m: 0, task: null }),
    pressed: (i, v, st) => i === st.m,
    onButton(i, st) {
      st.m = i;
      if (i < 3) return null;
      st.task = cirTask();
      return { r1: st.task.r1, r2: st.task.r2, r3: 1 };
    },
    draw(v, step, st) {
      const task = st.m === 3 ? st.task : null;
      const m = task ? task.m : st.m;
      const { svg, R, I } = cirDraw(m, v);
      const [a, b, c] = [v.r1, v.r2, v.r3];
      let caption;
      if (task) {
        const ok = near(I, task.I, 0.004);
        const need = CIR_U / task.I;
        const kind = [u('series', 'последовательно', 'тізбектей'), u('parallel', 'параллельно', 'параллель'), u('R₁ in series with R₂ ∥ R₃', 'R₁ последовательно с R₂ ∥ R₃', 'R₁ мен R₂ ∥ R₃ тізбектей')][m];
        caption = taskCap(
          u(`(${kind}) choose R₃ so that the ammeter shows ${fmt(task.I, 2)} A.`, `(${kind}) подбери R₃, чтобы амперметр показал ${fmt(task.I, 2)} А.`, `(${kind}) амперметр ${fmt(task.I, 2)} А көрсететіндей R₃-ті тап.`),
          ok,
          u(`You need R = U / I = 12 / ${fmt(task.I, 2)} = ${fmt(need, 2)} Ω in total; now R = ${fmt(R, 2)} Ω.`, `Нужно общее R = U / I = 12 / ${fmt(task.I, 2)} = ${fmt(need, 2)} Ом, сейчас R = ${fmt(R, 2)} Ом.`, `Жалпы R = U / I = 12 / ${fmt(task.I, 2)} = ${fmt(need, 2)} Ом керек, қазір R = ${fmt(R, 2)} Ом.`),
          u(`R₃ = ${task.r3} Ω gives R = ${fmt(R, 2)} Ω and I = ${fmt(I, 2)} A.`, `R₃ = ${task.r3} Ом даёт R = ${fmt(R, 2)} Ом и I = ${fmt(I, 2)} А.`, `R₃ = ${task.r3} Ом R = ${fmt(R, 2)} Ом және I = ${fmt(I, 2)} А береді.`),
        );
        return { svg: svg + taskBadge(ok, 318, 12), caption };
      }
      if (m === 0)
        caption = u(
          `Series: R = R₁ + R₂ + R₃ = ${fmt(R, 0)} Ω. The same current I = ${fmt(I, 2)} A flows through all; the voltage splits in proportion to R: ${fmt(I * a, 1)} + ${fmt(I * b, 1)} + ${fmt(I * c, 1)} = 12 V.`,
          `Последовательно: R = R₁ + R₂ + R₃ = ${fmt(R, 0)} Ом. Через все течёт один ток I = ${fmt(I, 2)} А, а напряжение делится пропорционально R: ${fmt(I * a, 1)} + ${fmt(I * b, 1)} + ${fmt(I * c, 1)} = 12 В.`,
          `Тізбектей: R = R₁ + R₂ + R₃ = ${fmt(R, 0)} Ом. Барлығынан бір ток I = ${fmt(I, 2)} А өтеді, ал кернеу R-ге пропорционал бөлінеді: ${fmt(I * a, 1)} + ${fmt(I * b, 1)} + ${fmt(I * c, 1)} = 12 В.`,
        );
      else if (m === 1)
        caption = u(
          `Parallel: every resistor gets the full 12 V, the currents add up: ${fmt(12 / a, 2)} + ${fmt(12 / b, 2)} + ${fmt(12 / c, 2)} = ${fmt(I, 2)} A. The total R = ${fmt(R, 2)} Ω is smaller than the smallest resistor.`,
          `Параллельно: на каждом резисторе все 12 В, а токи складываются: ${fmt(12 / a, 2)} + ${fmt(12 / b, 2)} + ${fmt(12 / c, 2)} = ${fmt(I, 2)} А. Общее R = ${fmt(R, 2)} Ом меньше самого маленького.`,
          `Параллель: әр резисторда толық 12 В, ал токтар қосылады: ${fmt(12 / a, 2)} + ${fmt(12 / b, 2)} + ${fmt(12 / c, 2)} = ${fmt(I, 2)} А. Жалпы R = ${fmt(R, 2)} Ом ең кішісінен де аз.`,
        );
      else {
        const p = (b * c) / (b + c);
        caption = u(
          `First the parallel part: R₂₃ = ${fmt(b, 0)}·${fmt(c, 0)}/(${fmt(b, 0)} + ${fmt(c, 0)}) = ${fmt(p, 2)} Ω, then add R₁: R = ${fmt(R, 2)} Ω, I = ${fmt(I, 2)} A. R₁ takes ${fmt(I * a, 1)} V, the pair ${fmt(I * p, 1)} V.`,
          `Сначала параллельный участок: R₂₃ = ${fmt(b, 0)}·${fmt(c, 0)}/(${fmt(b, 0)} + ${fmt(c, 0)}) = ${fmt(p, 2)} Ом, потом прибавляем R₁: R = ${fmt(R, 2)} Ом, I = ${fmt(I, 2)} А. На R₁ ${fmt(I * a, 1)} В, на паре ${fmt(I * p, 1)} В.`,
          `Алдымен параллель бөлік: R₂₃ = ${fmt(b, 0)}·${fmt(c, 0)}/(${fmt(b, 0)} + ${fmt(c, 0)}) = ${fmt(p, 2)} Ом, сосын R₁ қосамыз: R = ${fmt(R, 2)} Ом, I = ${fmt(I, 2)} А. R₁-де ${fmt(I * a, 1)} В, жұпта ${fmt(I * p, 1)} В.`,
        );
      }
      return { svg, caption };
    },
  },

  newton: {
    title: L("Newton's second law: F = m · a", 'Второй закон Ньютона: F = m · a', 'Ньютонның екінші заңы: F = m · a'),
    intro: L('The resultant force gives the body an acceleration a = F / m. Friction Fтр = μmg works against the motion.', 'Равнодействующая сила сообщает телу ускорение a = F / m. Сила трения Fтр = μmg мешает движению.', 'Тең әсерлі күш денеге a = F / m үдеу береді. Үйкеліс күші Fүйк = μmg қозғалысқа кедергі жасайды.'),
    sliders: [
      { id: 'F', label: L('F, N', 'F, Н', 'F, Н'), min: 0, max: 20, step: 0.1, value: 8, hidden: (v, st) => st.m === 1 && st.task.type === 1 },
      { id: 'm', label: L('m, kg', 'm, кг', 'm, кг'), min: 0.5, max: 10, step: 0.1, value: 2, hidden: (v, st) => st.m === 1 && st.task.type !== 1 },
      { id: 'mu', label: L('friction μ', 'трение μ', 'үйкеліс μ'), min: 0, max: 0.6, step: 0.01, value: 0.1, hidden: (v, st) => st.m === 1 },
    ],
    buttons: [L('▶ Push', '▶ Толкнуть', '▶ Итеру'), L('F × 2', 'F × 2', 'F × 2'), L('m × 2', 'm × 2', 'm × 2'), TASK, FREE],
    state: () => ({ m: 0, t: 1.5, run: false, task: null }),
    pressed: (i, v, st) => i === 3 && st.m === 1,
    btnHidden: (i, v, st) => (st.m === 1 ? i === 1 || i === 2 : i === 4),
    onButton(i, st, v) {
      if (i === 0) {
        st.t = reduced() ? 3 : 0;
        st.run = !reduced();
        return null;
      }
      st.t = 3;
      st.run = false;
      if (i === 1) return { F: clamp(v.F * 2, 0, 20) };
      if (i === 2) return { m: clamp(v.m * 2, 0.5, 10) };
      if (i === 4) {
        st.m = 0;
        return null;
      }
      st.m = 1;
      st.task = nwtTask();
      const k = st.task;
      return k.type === 1 ? { F: k.F, mu: 0, m: 10 } : { m: k.m, mu: k.mu, F: 0 };
    },
    live(dt, v, st) {
      if (!st.run) return;
      st.t = Math.min(3, st.t + dt);
      if (st.t >= 3) st.run = false;
    },
    draw(v, step, st) {
      const { F, m, mu } = v;
      const fmax = mu * m * G;
      const moving = F > fmax + 1e-9;
      const fr = moving ? fmax : F;
      const a = nwtA(F, m, mu);
      const t = st.t;
      const s = (a * t * t) / 2;
      const vel = a * t;
      const s3 = a * 4.5;
      const Ltr = [1, 2, 5, 10, 20, 50, 100, 200].find((x) => x >= s3) ?? 200;
      const X0 = 62;
      const px = 200 / Ltr;
      const cw = 30 + m * 2.6;
      const ch = 18 + m * 1.2;
      const gy = 168;
      const x = X0 + s * px;
      const cy = gy - 6 - ch / 2;
      // Масштаб сил: самая большая сила - 46 px.
      const k = 46 / Math.max(F, m * G, 1);
      let ticks = '';
      for (let i = 0; i <= 5; i++) ticks += `${ln(X0 + (i * 200) / 5, gy, X0 + (i * 200) / 5, gy + 4, 'exc-m', 1)}${tt(X0 + (i * 200) / 5, gy + 22, fmt((i * Ltr) / 5, 1), 'exs-s')}`;
      const cart = `<g transform="translate(${n1(x)} 0)"><rect class="ex-cart" x="0" y="${n1(gy - 6 - ch)}" width="${n1(cw)}" height="${n1(ch)}" rx="4"/><circle class="ex-wheel" cx="${n1(cw * 0.25)}" cy="${gy - 4}" r="4"/><circle class="ex-wheel" cx="${n1(cw * 0.75)}" cy="${gy - 4}" r="4"/>${tt(cw / 2, cy + 4, `${fmt(m, 1)} ${UN.kg()}`, 'exs-t ex-cartt')}</g>`;
      const cxm = x + cw / 2;
      const forces = `${F > 0.05 ? varrow(x - F * k - 6, cy, x - 2, cy, 'exc-o', '', 2.5) + tt(x - F * k - 10, cy + 4, 'F', 'exs-t ex-end tc exc-o') : '<g/><g/>'}
        ${fr > 0.05 ? varrow(x + cw, gy + 7, x + cw - fr * k - 4, gy + 7, 'exc-r', '', 2.5) + tt(x + cw + 3, gy + 11, u('Ffr', 'Fтр', 'Fүйк'), 'exs-s ex-start tc exc-r') : '<g/><g/>'}
        ${varrow(cxm, cy, cxm, cy + m * G * k, 'exc-b', 'mg', 2, -13, -2)}${varrow(cxm, cy, cxm, cy - m * G * k, 'exc-g', 'N', 2, 9, 6)}
        ${a > 0.005 ? varrow(x - 30, gy - 12 - ch, x - 4, gy - 12 - ch, 'exc-p', 'a', 2, -13, -5) : '<g/>'}`;
      // График v(t) в правом верхнем углу.
      const vmax = Math.max(1, nwtA(20, m, mu) * 3);
      const gx = (tt2) => 232 + tt2 * 26;
      const gyv = (vv) => 66 - (vv / vmax) * 48;
      const graph = `${box(214, 4, 104, 80)}<line class="ex-axis" x1="232" y1="66" x2="314" y2="66"/><line class="ex-axis" x1="232" y1="66" x2="232" y2="14"/>
        ${tt(312, 78, 't, ' + UN.s(), 'exs-s ex-end')}${tt(236, 16, 'v', 'exs-s ex-start')}
        ${ln(232, 66, gx(3), gyv(a * 3), 'exc-p ex-faint', 1.5)}${ln(232, 66, gx(t), gyv(vel), 'exc-p', 2.5)}<circle class="ex-dot" cx="${n1(gx(t))}" cy="${n1(gyv(vel))}" r="3.5"/>`;
      const info = `${box(4, 4, 200, 62)}${tt(10, 20, `a = (F − μmg) / m = ${fmt(a, 2)} ${UN.ms2()}`, 'exs-t ex-start')}${tt(10, 36, `${u('t', 't', 't')} = ${fmt(t, 1)} ${UN.s()}: v = a·t = ${fmt(vel, 2)} ${UN.ms()}`, 'exs-t ex-start')}${tt(10, 52, `s = a·t²/2 = ${fmt(s, 2)} ${UN.m()}`, 'exs-t ex-start')}`;
      const svg = `<line class="ex-axis" x1="10" y1="${gy}" x2="312" y2="${gy}" style="stroke-width:2"/>${ticks}${tt(300, gy + 22, UN.m(), 'exs-s')}
        ${mu > 0 ? `<rect x="10" y="${gy}" width="302" height="4" class="ex-fill exc-m" style="opacity:${n1(0.1 + mu)}"/>` : '<g/>'}${cart}${forces}${graph}${info}`;
      const fric = u(
        `Friction Fтр = μmg = ${fmt(mu, 2)} · ${fmt(m, 1)} · 9.8 = ${fmt(fmax, 2)} N.`,
        `Трение Fтр = μmg = ${fmt(mu, 2)} · ${fmt(m, 1)} · 9,8 = ${fmt(fmax, 2)} Н.`,
        `Үйкеліс Fүйк = μmg = ${fmt(mu, 2)} · ${fmt(m, 1)} · 9,8 = ${fmt(fmax, 2)} Н.`,
      );
      let caption = moving
        ? u(
            `${fric} Resultant F − Fтр = ${fmt(F - fr, 2)} N, so a = ${fmt(F - fr, 2)} / ${fmt(m, 1)} = ${fmt(a, 2)} m/s². Twice the force - more acceleration, twice the mass - less.`,
            `${fric} Равнодействующая F − Fтр = ${fmt(F - fr, 2)} Н, поэтому a = ${fmt(F - fr, 2)} / ${fmt(m, 1)} = ${fmt(a, 2)} м/с². Больше сила - больше ускорение, больше масса - меньше.`,
            `${fric} Тең әсерлі күш F − Fүйк = ${fmt(F - fr, 2)} Н, сондықтан a = ${fmt(F - fr, 2)} / ${fmt(m, 1)} = ${fmt(a, 2)} м/с². Күш көп - үдеу көп, масса көп - үдеу аз.`,
          )
        : u(
            `F = ${fmt(F, 1)} N is not more than the maximum friction ${fmt(fmax, 2)} N: the cart stays, static friction equals F and a = 0.`,
            `F = ${fmt(F, 1)} Н не больше наибольшей силы трения ${fmt(fmax, 2)} Н: тележка стоит, трение покоя равно F, a = 0.`,
            `F = ${fmt(F, 1)} Н ең үлкен үйкеліс күшінен ${fmt(fmax, 2)} Н артық емес: арба тұр, тыныштық үйкелісі F-ке тең, a = 0.`,
          );
      let extra = '';
      if (st.m === 1) {
        const q = st.task;
        let ok;
        let goal;
        let hint;
        let done;
        if (q.type === 0) {
          ok = near(a, q.a, 0.05);
          goal = u(`a cart of ${q.m} kg, μ = ${fmt(q.mu, 1)}. Find the force that gives a = ${fmt(q.a, 1)} m/s².`, `тележка ${q.m} кг, μ = ${fmt(q.mu, 1)}. Подбери силу, чтобы ускорение было a = ${fmt(q.a, 1)} м/с².`, `арба ${q.m} кг, μ = ${fmt(q.mu, 1)}. Үдеу a = ${fmt(q.a, 1)} м/с² болатындай күшті тап.`);
          hint = u(`Now a = ${fmt(a, 2)} m/s². Use F = m·a + μmg.`, `Сейчас a = ${fmt(a, 2)} м/с². Подсказка: F = m·a + μmg.`, `Қазір a = ${fmt(a, 2)} м/с². Кеңес: F = m·a + μmg.`);
          done = `F = ${q.m}·${fmt(q.a, 1)} + ${fmt(q.mu, 1)}·${q.m}·9,8 = ${fmt(q.F, 2)} ${UN.N()}.`;
        } else if (q.type === 1) {
          ok = near(m, q.m, 0.05);
          goal = u(`a force of ${q.F} N, no friction. What mass gets a = ${fmt(q.a, 1)} m/s²?`, `сила ${q.F} Н, трения нет. Какая масса получит ускорение a = ${fmt(q.a, 1)} м/с²?`, `күш ${q.F} Н, үйкеліс жоқ. Қандай масса a = ${fmt(q.a, 1)} м/с² үдеу алады?`);
          hint = u(`Now a = ${fmt(a, 2)} m/s². m = F / a.`, `Сейчас a = ${fmt(a, 2)} м/с². m = F / a.`, `Қазір a = ${fmt(a, 2)} м/с². m = F / a.`);
          done = `m = F / a = ${q.F} / ${fmt(q.a, 1)} = ${fmt(q.m, 1)} ${UN.kg()}.`;
        } else {
          ok = F > q.F - 0.02 && F <= q.F + 0.2;
          goal = u(`a cart of ${q.m} kg, μ = ${fmt(q.mu, 1)}. Find the smallest force that starts it moving.`, `тележка ${q.m} кг, μ = ${fmt(q.mu, 1)}. Найди наименьшую силу, которая сдвинет её с места.`, `арба ${q.m} кг, μ = ${fmt(q.mu, 1)}. Оны орнынан қозғайтын ең кіші күшті тап.`);
          hint = F < q.F ? u('The cart does not move yet - push harder.', 'Тележка пока стоит - толкни сильнее.', 'Арба әлі тұр - қаттырақ ит.') : u('It moves, but the force is bigger than needed.', 'Едет, но сила больше, чем нужно.', 'Қозғалды, бірақ күш қажеттіден көп.');
          done = `F = μmg = ${fmt(q.mu, 1)} · ${q.m} · 9,8 = ${fmt(q.F, 2)} ${UN.N()}.`;
        }
        caption = taskCap(goal, ok, hint, done);
        extra = taskBadge(ok, 318, 100);
      }
      return { svg: svg + extra, caption };
    },
  },

  projectile: {
    title: L('Throwing at an angle', 'Бросок под углом к горизонту', 'Көкжиекке бұрыш жасай лақтыру'),
    intro: L('Horizontally the ball keeps its speed, vertically gravity changes it. The path is a parabola; on the Moon it is much longer.', 'По горизонтали мяч сохраняет скорость, по вертикали её меняет сила тяжести. Траектория - парабола, на Луне она намного длиннее.', 'Көлденеңінен доп жылдамдығын сақтайды, тігінен оны ауырлық күші өзгертеді. Траектория - парабола, Айда әлдеқайда ұзын.'),
    sliders: [
      { id: 'v0', label: L('v₀, m/s', 'v₀, м/с', 'v₀, м/с'), min: 5, max: 30, step: 0.5, value: 20, hidden: (v, st) => st.m === 1 && st.task.type !== 3 },
      { id: 'al', label: 'α, °', min: 0, max: 90, step: 1, value: 50, hidden: (v, st) => st.m === 1 && st.task.type === 3 },
      { id: 'h0', label: L('height h₀, m', 'высота h₀, м', 'биіктік h₀, м'), min: 0, max: 40, step: 1, value: 0, hidden: (v, st) => st.m === 1 },
    ],
    buttons: [L('▶ Throw', '▶ Бросить', '▶ Лақтыру'), L('Planet ↻', 'Планета ↻', 'Ғаламшар ↻'), L('Velocity vectors', 'Векторы скорости', 'Жылдамдық векторлары'), TASK, FREE],
    state: () => ({ k: 0.3, run: false, p: 0, vec: true, m: 0, task: null, prev: null }),
    pressed: (i, v, st) => (i === 2 && st.vec) || (i === 3 && st.m === 1),
    btnHidden: (i, v, st) => (i === 4 ? st.m !== 1 : i === 1 && st.m === 1),
    onButton(i, st, v) {
      if (i === 0) {
        st.prev = { v0: v.v0, al: v.al, h0: v.h0, p: st.p };
        st.k = reduced() ? 1 : 0;
        st.run = !reduced();
      } else if (i === 1) {
        st.p = (st.p + 1) % 3;
        st.prev = null;
      } else if (i === 2) st.vec = !st.vec;
      else if (i === 4) st.m = 0;
      else {
        st.m = 1;
        st.prev = null;
        st.task = prjTask(PLANETS[st.p].g);
        st.k = 1;
        return { v0: st.task.v0, h0: st.task.h0, al: st.task.al };
      }
      return null;
    },
    live(dt, v, st) {
      if (!st.run) return;
      st.k = Math.min(1, st.k + dt / 2.6);
      if (st.k >= 1) st.run = false;
    },
    draw(v, step, st) {
      const P = PLANETS[st.p];
      const g = P.g;
      const f = flight(v.v0, v.al, v.h0, g);
      const task0 = st.m === 1 ? st.task : null;
      // Масштаб под текущий полёт (и флажок), из «круглого» ряда, чтобы картинка не дёргалась.
      const fit = Math.min(270 / Math.max(f.L, task0?.D ?? 0, 8), 170 / Math.max(f.Hm, 4));
      const sc = [6, 5, 4, 3, 2.5, 2, 1.6, 1.25, 1, 0.8, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.16, 0.12, 0.1, 0.08].find((x) => x <= fit) ?? 0.06;
      const X0 = 26;
      const GY = 200;
      const X = (x) => X0 + x * sc;
      const Y = (y) => GY - y * sc;
      const path = (q, upto = 1) => {
        const ff = flight(q.v0, q.al, q.h0, g);
        let d = '';
        for (let i = 0; i <= 60; i++) {
          const t = (ff.T * upto * i) / 60;
          d += `${i ? 'L' : 'M'}${n1(X(ff.vx * t))} ${n1(Y(q.h0 + ff.vy * t - (g * t * t) / 2))} `;
        }
        return d;
      };
      const t = f.T * st.k;
      const bx = f.vx * t;
      const by = v.h0 + f.vy * t - (g * t * t) / 2;
      const vy = f.vy - g * t;
      const stepM = [5, 10, 20, 50, 100, 200, 500, 1000].find((s2) => s2 * sc >= 38);
      let ticks = '';
      for (let x = 0; X(x) <= 296; x += stepM) ticks += `${ln(X(x), GY, X(x), GY + 4, 'exc-m', 1)}${tt(X(x), GY + 14, fmt(x, 0), 'exs-s')}`;
      const task = st.m === 1 ? st.task : null;
      let target = '<g/>';
      if (task && (task.type === 0 || task.type === 3)) {
        const tx2 = X(task.D);
        target = `<g class="exc-r">${ln(tx2, GY, tx2, GY - 26, 'exc-r', 2)}<path class="ex-fill" d="M${n1(tx2)} ${GY - 26} l14 5 l-14 5 Z"/></g>${tt(tx2, GY - 30, `${task.D} ${UN.m()}`, 'exs-t tc exc-r')}`;
      }
      if (task && task.type === 2) target = `<path class="ex-stroke exc-r ex-dash" style="stroke-width:1.5" d="${path({ v0: v.v0, al: task.a0, h0: 0 })}"/>`;
      const prev = st.prev && st.prev.p === st.p ? `<path class="ex-stroke exc-m ex-faint" style="stroke-width:1.5" d="${path(st.prev)}"/>` : '<g/>';
      const tower = v.h0 > 0 ? `<rect x="${X0 - 14}" y="${n1(Y(v.h0))}" width="14" height="${n1(v.h0 * sc)}" class="ex-fill exc-m" style="opacity:.35"/>${tt(X0 - 7, Y(v.h0) - 5, `${fmt(v.h0, 0)} ${UN.m()}`, 'exs-s')}` : '<g/>';
      const bX = X(bx);
      const bY = Y(by);
      // Масштаб векторов: 1,6 px на м/с, но стрелки не выходят за кадр.
      const vs = Math.min(1.6, vy < 0 ? (212 - bY) / -vy : (bY - 10) / Math.max(vy, 0.01), (306 - bX) / Math.max(f.vx, 0.01));
      const vecs = st.vec
        ? `${varrow(bX, bY, bX + f.vx * vs, bY - vy * vs, 'exc-o', 'v', 2.5, 8, 0)}${varrow(bX, bY, bX + f.vx * vs, bY, 'exc-g', 'vₓ', 1.8, 9, 4)}${Math.abs(vy) > 0.6 ? varrow(bX, bY, bX, bY - vy * vs, 'exc-k', 'v_y'.replace('_y', 'ᵧ'), 1.8, -9, vy > 0 ? 4 : 8) : '<g/>'}`
        : '<g/><g/><g/>';
      // Энергия: доля Eк и Eп (от земли).
      const E = (v.v0 * v.v0) / 2 + g * v.h0;
      const ep = clamp((g * Math.max(0, by)) / E, 0, 1);
      const KE = u('KE', 'Eк', 'Eк');
      const PE = u('PE', 'Eп', 'Eп');
      const ebar = `<rect x="212" y="62" width="${n1(100 * (1 - ep))}" height="9" rx="3" class="ex-fill exc-o"/><rect x="${n1(212 + 100 * (1 - ep))}" y="62" width="${n1(100 * ep)}" height="9" rx="3" class="ex-fill exc-b"/>${tt(212, 82, KE, 'exs-s ex-start tc exc-o')}${tt(312, 82, PE, 'exs-s ex-end tc exc-b')}`;
      const info = `${box(206, 4, 112, 84)}${tt(212, 17, `${tx(P.name)}: g = ${fmt(g, 2)}`, 'exs-t ex-start')}${tt(212, 31, `T = ${fmt(f.T, 2)} ${UN.s()}`, 'exs-t ex-start')}${tt(212, 44, `L = ${fmt(f.L, 1)} ${UN.m()}`, 'exs-t ex-start')}${tt(212, 57, `H = ${fmt(f.Hm, 1)} ${UN.m()}`, 'exs-t ex-start')}${ebar}`;
      const angle = v.al > 0 && v.al < 90 ? `<path class="ex-stroke exc-p" style="stroke-width:1.2" d="M${X0 + 22} ${n1(Y(v.h0))} A22 22 0 0 0 ${n1(X0 + 22 * Math.cos(rad(v.al)))} ${n1(Y(v.h0) - 22 * Math.sin(rad(v.al)))}"/>${tt(X0 + 30, Y(v.h0) - 6, `${fmt(v.al, 0)}°`, 'exs-s ex-start tc exc-p')}` : '<g/><g/>';
      const svg = `<rect x="0" y="${GY}" width="${W}" height="${H - GY}" class="exs-ground"/><line class="ex-axis" x1="0" y1="${GY}" x2="${W}" y2="${GY}"/>${ticks}${tt(316, GY + 14, UN.m(), 'exs-s ex-end')}
        ${tower}${prev}${target}<path class="ex-stroke exc-m ex-dash" style="stroke-width:1.3" d="${path(v)}"/><path class="ex-curve" d="${path(v, st.k)}"/>${angle}
        ${vecs}<circle class="ex-ball" cx="${n1(bX)}" cy="${n1(bY)}" r="6"/>${info}`;
      let caption = u(
        `${tx(P.name)}, g = ${fmt(g, 2)} m/s². Flight time T = ${fmt(f.T, 2)} s, range L = vₓ·T = ${fmt(f.vx, 2)} · ${fmt(f.T, 2)} = ${fmt(f.L, 1)} m, top height H = ${fmt(f.Hm, 1)} m. At t = ${fmt(t, 2)} s: vₓ = v₀cos α = ${fmt(f.vx, 1)} m/s (constant), vᵧ = v₀sin α − gt = ${fmt(vy, 1)} m/s.`,
        `${tx(P.name)}, g = ${fmt(g, 2)} м/с². Время полёта T = ${fmt(f.T, 2)} с, дальность L = vₓ·T = ${fmt(f.vx, 2)} · ${fmt(f.T, 2)} = ${fmt(f.L, 1)} м, наибольшая высота H = ${fmt(f.Hm, 1)} м. При t = ${fmt(t, 2)} с: vₓ = v₀cos α = ${fmt(f.vx, 1)} м/с (не меняется), vᵧ = v₀sin α − gt = ${fmt(vy, 1)} м/с.`,
        `${tx(P.name)}, g = ${fmt(g, 2)} м/с². Ұшу уақыты T = ${fmt(f.T, 2)} с, қашықтық L = vₓ·T = ${fmt(f.vx, 2)} · ${fmt(f.T, 2)} = ${fmt(f.L, 1)} м, ең үлкен биіктік H = ${fmt(f.Hm, 1)} м. t = ${fmt(t, 2)} с кезде: vₓ = v₀cos α = ${fmt(f.vx, 1)} м/с (өзгермейді), vᵧ = v₀sin α − gt = ${fmt(vy, 1)} м/с.`,
      );
      if (task) {
        let ok;
        let goal;
        let hint;
        let done;
        if (task.type === 0) {
          ok = near(f.L, task.D, 1.5);
          goal = u(`v₀ = ${task.v0} m/s${task.h0 ? `, from ${task.h0} m` : ''}. Choose the angle so that the ball lands at the flag (${task.D} m).`, `v₀ = ${task.v0} м/с${task.h0 ? `, с высоты ${task.h0} м` : ''}. Подбери угол, чтобы мяч упал у флажка (${task.D} м).`, `v₀ = ${task.v0} м/с${task.h0 ? `, ${task.h0} м биіктіктен` : ''}. Доп жалаушаға (${task.D} м) түсетіндей бұрышты тап.`);
          hint = u(`Now L = ${fmt(f.L, 1)} m - ${f.L < task.D ? 'short' : 'too far'}. Often there are two good angles.`, `Сейчас L = ${fmt(f.L, 1)} м - ${f.L < task.D ? 'недолёт' : 'перелёт'}. Часто подходят два угла.`, `Қазір L = ${fmt(f.L, 1)} м - ${f.L < task.D ? 'жетпей қалды' : 'асып кетті'}. Көбіне екі бұрыш сәйкес келеді.`);
          done = u(`α = ${fmt(v.al, 0)}° gives L = ${fmt(f.L, 1)} m.`, `α = ${fmt(v.al, 0)}° даёт L = ${fmt(f.L, 1)} м.`, `α = ${fmt(v.al, 0)}° L = ${fmt(f.L, 1)} м береді.`);
        } else if (task.type === 1) {
          ok = v.al === 45;
          goal = u(`at what angle does the ball fly farthest (v₀ = ${task.v0} m/s, from the ground)?`, `под каким углом мяч улетит дальше всего (v₀ = ${task.v0} м/с, с земли)?`, `доп қандай бұрышпен ең алысқа ұшады (v₀ = ${task.v0} м/с, жерден)?`);
          hint = u(`Now L = ${fmt(f.L, 1)} m. Watch L in the corner and look for its maximum.`, `Сейчас L = ${fmt(f.L, 1)} м. Следи за L в углу и найди максимум.`, `Қазір L = ${fmt(f.L, 1)} м. Бұрыштағы L-ді бақылап, максимумын тап.`);
          done = u(`L = v₀²·sin 2α / g is largest when sin 2α = 1, that is α = 45°: L = ${fmt(f.L, 1)} m.`, `L = v₀²·sin 2α / g больше всего при sin 2α = 1, то есть α = 45°: L = ${fmt(f.L, 1)} м.`, `L = v₀²·sin 2α / g ең үлкені sin 2α = 1 кезде, яғни α = 45°: L = ${fmt(f.L, 1)} м.`);
        } else if (task.type === 2) {
          ok = v.al === 90 - task.a0;
          goal = u(`the red dashed path is a throw at ${task.a0}°. Find another angle with the same range.`, `красный пунктир - бросок под ${task.a0}°. Найди другой угол с той же дальностью.`, `қызыл пунктир - ${task.a0}° лақтыру. Дәл сондай қашықтық беретін басқа бұрышты тап.`);
          hint = u(`Now L = ${fmt(f.L, 1)} m, needed ${fmt(flight(v.v0, task.a0, 0, g).L, 1)} m.`, `Сейчас L = ${fmt(f.L, 1)} м, нужно ${fmt(flight(v.v0, task.a0, 0, g).L, 1)} м.`, `Қазір L = ${fmt(f.L, 1)} м, керегі ${fmt(flight(v.v0, task.a0, 0, g).L, 1)} м.`);
          done = u(`${task.a0}° and ${90 - task.a0}° add up to 90°, and sin 2α is the same for them.`, `${task.a0}° и ${90 - task.a0}° в сумме дают 90°, а sin 2α у них одинаковый.`, `${task.a0}° пен ${90 - task.a0}° қосындысы 90°, ал sin 2α бірдей.`);
        } else {
          ok = near(f.L, task.D, 1);
          const T = Math.sqrt((2 * task.h0) / g);
          goal = u(`throw horizontally from ${task.h0} m so that the ball lands at ${task.D} m. Choose v₀.`, `брось горизонтально с высоты ${task.h0} м так, чтобы мяч упал в ${task.D} м. Подбери v₀.`, `${task.h0} м биіктіктен көлденең лақтырып, доп ${task.D} м жерге түсетіндей v₀-ді тап.`);
          hint = u(`The fall lasts t = √(2h/g) = ${fmt(T, 2)} s whatever v₀ is; L = v₀·t = ${fmt(f.L, 1)} m now.`, `Падение длится t = √(2h/g) = ${fmt(T, 2)} с при любой v₀; сейчас L = v₀·t = ${fmt(f.L, 1)} м.`, `Құлау кез келген v₀ үшін t = √(2h/g) = ${fmt(T, 2)} с созылады; қазір L = v₀·t = ${fmt(f.L, 1)} м.`);
          done = `v₀ = L / t = ${task.D} / ${fmt(T, 2)} ≈ ${fmt(task.D / T, 1)} ${UN.ms()}.`;
        }
        caption = taskCap(goal, ok, hint, done);
        return { svg: svg + taskBadge(ok, 200, 14), caption };
      }
      return { svg, caption };
    },
  },

  lens: {
    title: L('How a lens makes an image', 'Как линза строит изображение', 'Линза кескінді қалай құрады'),
    intro: L('Three easy rays: parallel → through the focus, through the centre → straight, through the focus → parallel. 1/F = 1/d + 1/f.', 'Три удобных луча: параллельный → через фокус, через центр → прямо, через фокус → параллельно. 1/F = 1/d + 1/f.', 'Үш ыңғайлы сәуле: параллель → фокус арқылы, орталық арқылы → түзу, фокус арқылы → параллель. 1/F = 1/d + 1/f.'),
    sliders: [
      { id: 'd', label: L('object distance d, cm', 'до предмета d, см', 'нәрсеге дейін d, см'), min: 2, max: 50, step: 0.5, value: 30 },
      { id: 'F', label: L('focal length F, cm', 'фокус F, см', 'фокус F, см'), min: 5, max: 15, step: 0.5, value: 10, hidden: (v, st) => st.m === 1 },
    ],
    buttons: [L('Converging', 'Собирающая', 'Жинағыш'), L('Diverging', 'Рассеивающая', 'Шашыратқыш'), L('Next case ↻', 'Следующий случай ↻', 'Келесі жағдай ↻'), TASK, FREE],
    state: () => ({ div: false, c: 0, m: 0, task: null }),
    pressed: (i, v, st) => (i === 0 && !st.div && st.m === 0) || (i === 1 && st.div && st.m === 0) || (i === 3 && st.m === 1),
    btnHidden: (i, v, st) => (st.m === 1 ? i < 3 : i === 4 || (i === 2 && st.div)),
    onButton(i, st, v) {
      if (i === 0 || i === 1) {
        st.div = i === 1;
        return null;
      }
      if (i === 2) {
        st.c = (st.c + 1) % LENS_CASES.length;
        return { d: LENS_CASES[st.c].k * v.F };
      }
      if (i === 4) {
        st.m = 0;
        return null;
      }
      st.m = 1;
      st.div = false;
      st.task = lensTask();
      return { F: st.task.F, d: 45 };
    },
    draw(v, step, st) {
      const { d, F } = v;
      const div = st.div;
      // Масштаб: предмет и 3F всегда помещаются слева от линзы.
      const s = 140 / Math.max(d, 3 * F);
      const L0 = 168;
      const ax = 120;
      const h = 34;
      const Xo = L0 - d * s;
      const Yt = ax - h;
      const im = lensImg(d, F, div);
      const real = !im.none && im.f > 0;
      const Xi = L0 + im.f * s;
      const hi = im.none ? 0 : real ? -h * im.G : h * im.G;
      const Yi = ax - hi;
      const Fp = L0 + F * s;
      const Fm = L0 - F * s;
      // Продлить отрезок до края картинки.
      const ext = (x1, y1, x2, y2) => {
        const k = 900 / (Math.hypot(x2 - x1, y2 - y1) || 1);
        return [x1 + (x2 - x1) * k, y1 + (y2 - y1) * k];
      };
      const seg = (pts, cls, dash = false) => `<path class="ex-stroke ${cls}${dash ? ' ex-dash' : ''}" style="stroke-width:${dash ? 1.1 : 1.6}" d="M${pts.map((p) => `${n1(p[0])} ${n1(p[1])}`).join(' L')}"/>`;
      let rays = '';
      let back = '';
      if (!div) {
        rays += seg([[Xo, Yt], [L0, Yt], ext(L0, Yt, Fp, ax)], 'exc-o');
        rays += seg([[Xo, Yt], ext(Xo, Yt, L0, ax)], 'exc-g');
        if (Math.abs(d - F) > 0.3) {
          const y3 = Yt + ((ax - Yt) * (L0 - Xo)) / (Fm - Xo);
          if (Math.abs(y3 - ax) < 95) rays += seg([[Xo, Yt], [L0, y3], [W + 20, y3]], 'exc-k');
          if (!real && Math.abs(y3 - ax) < 95) back += seg([[L0, y3], [Xi, Yi]], 'exc-k', true);
        }
        if (!real && !im.none) back += seg([[L0, Yt], [Xi, Yi]], 'exc-o', true) + seg([[Xo, Yt], [Xi, Yi]], 'exc-g', true);
      } else {
        rays += seg([[Xo, Yt], [L0, Yt], ext(Fm, ax, L0, Yt)], 'exc-o');
        back += seg([[L0, Yt], [Fm, ax]], 'exc-o', true);
        rays += seg([[Xo, Yt], ext(Xo, Yt, L0, ax)], 'exc-g');
        const y3 = Yt + ((ax - Yt) * (L0 - Xo)) / (Fp - Xo);
        rays += seg([[Xo, Yt], [L0, y3], [W + 20, y3]], 'exc-k');
        back += seg([[L0, y3], [Xi, y3]], 'exc-k', true);
      }
      const lensPath = div
        ? `M${L0 - 7} 50 Q${L0} ${ax} ${L0 - 7} 190 H${L0 + 7} Q${L0} ${ax} ${L0 + 7} 50 Z`
        : `M${L0} 50 Q${L0 + 14} ${ax} ${L0} 190 Q${L0 - 14} ${ax} ${L0} 50 Z`;
      const marks = [-2, -1, 1, 2]
        .map((m) => {
          const x = L0 + m * F * s;
          return x > 4 && x < 316 ? `<circle class="ex-fill exc-m" cx="${n1(x)}" cy="${ax}" r="2.5"/>${tt(x, ax + 13, `${Math.abs(m) === 2 ? '2F' : 'F'}`, 'exs-s')}` : '<g/>';
        })
        .join('');
      const onScreen = !im.none && Xi > 2 && Xi < 318;
      const hiC = clamp(hi, -100, 100);
      const img = onScreen ? arrow(Xi, ax, Xi, ax - hiC, `exc-k${real ? '' : ' ex-faint'}`, 3) : '<g/>';
      const kindTxt = im.none
        ? u('no image', 'изображения нет', 'кескін жоқ')
        : `${real ? u('real', 'действительное', 'нақты') : u('virtual', 'мнимое', 'жалған')}, ${hi < 0 ? u('inverted', 'перевёрнутое', 'төңкерілген') : u('upright', 'прямое', 'тура')}, ${Math.abs(im.G - 1) < 0.01 ? u('same size', 'равное', 'тең') : im.G > 1 ? u('magnified', 'увеличенное', 'үлкейген') : u('reduced', 'уменьшенное', 'кішірейген')}`;
      const info = `${box(4, 4, 312, 40)}${tt(10, 16, `${div ? '−' : ''}1/F = 1/d ${div ? '−' : '+'} 1/f · D = ${div ? '−' : '+'}${fmt(100 / F, 1)} ${u('dpt', 'дптр', 'дптр')}`, 'exs-t ex-start')}${tt(10, 28, `f = ${im.none ? '∞' : fmt(Math.abs(im.f), 1) + ' ' + UN.cm()}${im.none ? '' : `, Γ = f/d = ${fmt(im.G, 2)}`}`, 'exs-t ex-start tc exc-k')}${tt(10, 40, kindTxt, 'exs-s ex-start tc exc-k')}`;
      const dims = `${ln(Xo, 198, L0, 198, 'exc-p', 1.2)}${ln(Xo, 194, Xo, 202, 'exc-p', 1.2)}${tt(Math.min((Xo + L0) / 2, L0 - 22), 209, `d = ${fmt(d, 1)}`, 'exs-s tc exc-p')}${onScreen && Math.abs(Xi - L0) > 3 ? ln(Xi, real ? 198 : 214, L0, real ? 198 : 214, 'exc-k', 1.2) + ln(Xi, real ? 194 : 210, Xi, real ? 202 : 218, 'exc-k', 1.2) + tt(real ? Math.max((Xi + L0) / 2, L0 + 22) : L0 + 4, real ? 209 : 217, `f = ${fmt(Math.abs(im.f), 1)}`, `exs-s tc exc-k${real ? '' : ' ex-start'}`) : '<g/><g/><g/>'}`;
      const svg = `<line class="ex-axis" x1="0" y1="${ax}" x2="${W}" y2="${ax}"/><path class="ex-lens" d="${lensPath}"/>${marks}${back}${rays}${arrow(Xo, ax, Xo, Yt, 'exc-b', 3)}${img}${dims}${info}`;
      const fNum = im.none ? '∞' : fmt(Math.abs(im.f), 1);
      let caption;
      if (div)
        caption = u(
          `A diverging lens always gives a virtual, upright, reduced image between F and the lens: 1/f = 1/F + 1/d → f = dF/(d + F) = ${fNum} cm, Γ = ${fmt(im.G, 2)}. The rays spread out; their dashed extensions meet at the image.`,
          `Рассеивающая линза всегда даёт мнимое, прямое, уменьшенное изображение между F и линзой: 1/f = 1/F + 1/d → f = dF/(d + F) = ${fNum} см, Γ = ${fmt(im.G, 2)}. Лучи расходятся, а их пунктирные продолжения сходятся в изображении.`,
          `Шашыратқыш линза әрқашан F пен линза арасында жалған, тура, кішірейген кескін береді: 1/f = 1/F + 1/d → f = dF/(d + F) = ${fNum} см, Γ = ${fmt(im.G, 2)}. Сәулелер тарайды, ал олардың пунктир жалғасы кескінде тоғысады.`,
        );
      else if (im.none)
        caption = u('d = F: after the lens all rays go parallel and never meet - there is no image (a searchlight works like this).', 'd = F: после линзы лучи идут параллельно и не пересекаются - изображения нет (так работает прожектор).', 'd = F: линзадан кейін сәулелер параллель жүріп, қиылыспайды - кескін жоқ (прожектор осылай жұмыс істейді).');
      else
        caption = u(
          `1/F = 1/d + 1/f: 1/${fmt(F, 1)} = 1/${fmt(d, 1)} + 1/f → f = dF/(d − F) = ${real ? '' : '−'}${fNum} cm. Image: ${kindTxt}, Γ = ${fmt(im.G, 2)}.${real ? ' It can be caught on a screen.' : ' The rays spread, the eye sees it behind the lens.'}`,
          `1/F = 1/d + 1/f: 1/${fmt(F, 1)} = 1/${fmt(d, 1)} + 1/f → f = dF/(d − F) = ${real ? '' : '−'}${fNum} см. Изображение: ${kindTxt}, Γ = ${fmt(im.G, 2)}.${real ? ' Его можно поймать на экране.' : ' Лучи расходятся, глаз видит его за линзой.'}`,
          `1/F = 1/d + 1/f: 1/${fmt(F, 1)} = 1/${fmt(d, 1)} + 1/f → f = dF/(d − F) = ${real ? '' : '−'}${fNum} см. Кескін: ${kindTxt}, Γ = ${fmt(im.G, 2)}.${real ? ' Оны экранға түсіруге болады.' : ' Сәулелер тарайды, көз оны линзаның артында көреді.'}`,
        );
      const ci = LENS_CASES.findIndex((c) => Math.abs(d - c.k * F) < 0.01);
      if (!div && ci >= 0 && st.m === 0) caption = `${tx(LENS_CASES[ci].name)}. ${caption}`;
      if (st.m === 1) {
        const q = st.task;
        let ok;
        let goal;
        let hint;
        let done;
        const now = u(`Now: ${kindTxt}, Γ = ${im.none ? '∞' : fmt(im.G, 2)}.`, `Сейчас: ${kindTxt}, Γ = ${im.none ? '∞' : fmt(im.G, 2)}.`, `Қазір: ${kindTxt}, Γ = ${im.none ? '∞' : fmt(im.G, 2)}.`);
        if (q.type === 0) {
          ok = real && near(im.G, 2, 0.03);
          goal = u(`F = ${q.F} cm. Get a real image twice as big as the object.`, `F = ${q.F} см. Получи действительное изображение в 2 раза больше предмета.`, `F = ${q.F} см. Нәрседен 2 есе үлкен нақты кескін ал.`);
          done = u(`d = 1.5F = ${fmt(q.d, 1)} cm, f = 2d = ${fmt(2 * q.d, 0)} cm.`, `d = 1,5F = ${fmt(q.d, 1)} см, f = 2d = ${fmt(2 * q.d, 0)} см.`, `d = 1,5F = ${fmt(q.d, 1)} см, f = 2d = ${fmt(2 * q.d, 0)} см.`);
        } else if (q.type === 1) {
          ok = real && near(im.G, 1, 0.02);
          goal = u(`F = ${q.F} cm. Get a real image of the same size.`, `F = ${q.F} см. Получи действительное изображение того же размера.`, `F = ${q.F} см. Өлшемі бірдей нақты кескін ал.`);
          done = u(`d = f = 2F = ${2 * q.F} cm.`, `d = f = 2F = ${2 * q.F} см.`, `d = f = 2F = ${2 * q.F} см.`);
        } else if (q.type === 2) {
          ok = !real && !im.none && near(im.G, 2, 0.03);
          goal = u(`F = ${q.F} cm. Use the lens as a magnifier: a virtual image 2 times bigger.`, `F = ${q.F} см. Сделай из линзы лупу: мнимое изображение в 2 раза больше.`, `F = ${q.F} см. Линзаны лупа ет: 2 есе үлкен жалған кескін.`);
          done = u(`d = F/2 = ${fmt(q.F / 2, 1)} cm: the object is inside the focus.`, `d = F/2 = ${fmt(q.F / 2, 1)} см: предмет внутри фокуса.`, `d = F/2 = ${fmt(q.F / 2, 1)} см: нәрсе фокус ішінде.`);
        } else if (q.type === 3) {
          ok = real && near(im.f, q.f, 0.3);
          goal = u(`F = ${q.F} cm. The screen is ${q.f} cm behind the lens. Where must the object be for a sharp image?`, `F = ${q.F} см. Экран стоит в ${q.f} см за линзой. Где поставить предмет, чтобы изображение было резким?`, `F = ${q.F} см. Экран линзадан ${q.f} см қашықта. Кескін анық болуы үшін нәрсені қайда қою керек?`);
          done = `1/d = 1/F − 1/f = 1/${q.F} − 1/${q.f} → d = ${fmt(q.d, 1)} ${UN.cm()}.`;
        } else {
          ok = im.none;
          goal = u(`F = ${q.F} cm. Where must the object be so that there is no image at all?`, `F = ${q.F} см. Где должен стоять предмет, чтобы изображения не было совсем?`, `F = ${q.F} см. Кескін мүлде болмауы үшін нәрсе қайда тұруы керек?`);
          done = u(`In the focus: d = F = ${q.F} cm, the rays leave parallel.`, `В фокусе: d = F = ${q.F} см, лучи выходят параллельно.`, `Фокуста: d = F = ${q.F} см, сәулелер параллель шығады.`);
        }
        hint = now;
        caption = taskCap(goal, ok, hint, done);
        return { svg: svg + taskBadge(ok, 316, 48), caption };
      }
      return { svg, caption };
    },
  },

  refraction: {
    title: L('Refraction of light', 'Преломление света', 'Жарықтың сынуы'),
    intro: L('On a boundary light bends: n₁·sin α = n₂·sin β. In a medium it is n times slower: v = c / n.', 'На границе сред свет преломляется: n₁·sin α = n₂·sin β. В среде он в n раз медленнее: v = c / n.', 'Орталар шекарасында жарық сынады: n₁·sin α = n₂·sin β. Ортада ол n есе баяу: v = c / n.'),
    sliders: [
      { id: 'a', label: L('angle of incidence α, °', 'угол падения α, °', 'түсу бұрышы α, °'), min: 0, max: 89, step: 0.5, value: 40, hidden: (v, st) => st.m === 1 && st.task.type === 2 },
      { id: 'n1', label: 'n₁', min: 1, max: 2.42, step: 0.01, value: 1, hidden: (v, st) => st.m === 1 },
      { id: 'n2', label: 'n₂', min: 1, max: 2.42, step: 0.01, value: 1.5, hidden: (v, st) => st.m === 1 && st.task.type !== 2 },
    ],
    buttons: [L('Media ↻', 'Среды ↻', 'Орталар ↻'), L('Total reflection', 'Полное отражение', 'Толық шағылу'), TASK, FREE],
    state: () => ({ pair: 1, m: 0, task: null }),
    pressed: (i, v, st) => i === 2 && st.m === 1,
    btnHidden: (i, v, st) => (st.m === 1 ? i < 2 : i === 3),
    onButton(i, st) {
      if (i === 0) {
        st.pair = (st.pair + 1) % MEDIA_PAIRS.length;
        const [n1, n2] = MEDIA_PAIRS[st.pair];
        return { n1, n2 };
      }
      if (i === 1) return { n1: 1.5, n2: 1, a: 45 };
      if (i === 3) {
        st.m = 0;
        return null;
      }
      st.m = 1;
      st.task = refrTask();
      const q = st.task;
      return { n1: q.n1, n2: q.n2, a: q.a };
    },
    draw(v, step, st) {
      const a = rad(v.a);
      const s = (v.n1 / v.n2) * Math.sin(a);
      const tir = s > 1;
      const b = tir ? null : Math.asin(s);
      const cx = 150;
      const cy = 112;
      const R = 92;
      const crit = v.n1 > v.n2 ? deg(Math.asin(v.n2 / v.n1)) : null;
      // Доля отражённого света (формулы Френеля, среднее для двух поляризаций) - для яркости луча.
      let refl = 1;
      if (!tir) {
        const ci = Math.cos(a);
        const ct = Math.cos(b);
        const rs = ((v.n1 * ci - v.n2 * ct) / (v.n1 * ci + v.n2 * ct)) ** 2;
        const rp = ((v.n1 * ct - v.n2 * ci) / (v.n1 * ct + v.n2 * ci)) ** 2;
        refl = (rs + rp) / 2;
      }
      const op = (x) => n1(clamp(x, 0.15, 1));
      const tint = (n) => n1(0.06 + ((n - 1) / 1.42) * 0.42);
      const arc = (r, a0, a1, up, cls) => {
        // Дуга угла от нормали: up - над границей.
        const sgn = up ? -1 : 1;
        const p0 = [cx + r * Math.sin(a0), cy + sgn * r * Math.cos(a0)];
        const p1 = [cx + r * Math.sin(a1), cy + sgn * r * Math.cos(a1)];
        return `<path class="ex-stroke ${cls}" style="stroke-width:1.3" d="M${n1(p0[0])} ${n1(p0[1])} A${r} ${r} 0 0 ${(a1 > a0) === up ? 1 : 0} ${n1(p1[0])} ${n1(p1[1])}"/>`;
      };
      const inc = arrow(cx - R * Math.sin(a), cy - R * Math.cos(a), cx, cy, 'exc-y', 3);
      const reflRay = `<g style="opacity:${op(refl * 1.2 + (tir ? 1 : 0.1))}">${arrow(cx, cy, cx + R * Math.sin(a), cy - R * Math.cos(a), 'exc-y', tir ? 3 : 1.8)}</g>`;
      const refr = tir ? '<g/>' : `<g style="opacity:${op(1 - refl)}">${arrow(cx, cy, cx + R * Math.sin(b), cy + R * Math.cos(b), 'exc-o', 3)}</g>`;
      const c8 = (n) => fmt(3 / n, 2);
      const critLine = crit !== null ? `<g class="ex-faint">${ln(cx, cy, cx - 80 * Math.sin(rad(crit)), cy - 80 * Math.cos(rad(crit)), 'exc-r ex-dash', 1.2)}</g>` : '<g/>';
      const critTxt = crit !== null ? tt(10, 45, `${u('critical', 'предельный', 'шекті')} α₀ = ${fmt(crit, 1)}°`, 'exs-s ex-start tc exc-r') : '<g/>';
      const svg = `<rect x="0" y="0" width="${W}" height="${cy}" class="ex-fill exc-b" style="opacity:${tint(v.n1)}"/><rect x="0" y="${cy}" width="${W}" height="${H - cy}" class="ex-fill exc-b" style="opacity:${tint(v.n2)}"/>
        <line class="ex-axis" x1="0" y1="${cy}" x2="${W}" y2="${cy}" style="stroke-width:2"/>${ln(cx, 8, cx, 214, 'exc-m ex-dash', 1.2)}${tt(cx + 4, 16, u('normal', 'нормаль', 'нормаль'), 'exs-s ex-start')}
        ${critLine}${v.a > 0.4 ? arc(28, -a, 0, true, 'exc-y') + tt(cx - 40 * Math.sin(a + 0.3) - 2, cy - 40 * Math.cos(a + 0.3) + 4, `α = ${fmt(v.a, 1)}°`, 'exs-t ex-end tc exc-o') : '<g/><g/>'}
        ${!tir && b > 0.01 ? arc(30, 0, b, false, 'exc-o') + tt(cx + 42 * Math.sin(b + 0.3) + 2, cy + 42 * Math.cos(b + 0.3) + 4, `β = ${fmt(deg(b), 1)}°`, 'exs-t ex-start tc exc-o') : '<g/><g/>'}
        ${inc}${reflRay}${refr}
        ${box(4, 4, 104, crit !== null ? 48 : 34)}${tt(10, 17, `${medName(v.n1)}, n₁ = ${fmt(v.n1, 2)}`, 'exs-t ex-start')}${tt(10, 31, `v = ${c8(v.n1)}·10⁸ ${UN.ms()}`, 'exs-s ex-start')}${critTxt}
        ${box(4, 180, 104, 34)}${tt(10, 193, `${medName(v.n2)}, n₂ = ${fmt(v.n2, 2)}`, 'exs-t ex-start')}${tt(10, 207, `v = ${c8(v.n2)}·10⁸ ${UN.ms()}`, 'exs-s ex-start')}
        ${tir ? `${box(200, 130, 116, 22)}${tt(258, 145, u('total reflection', 'полное отражение', 'толық шағылу'), 'exs-t tc exc-r')}` : `${box(196, 180, 120, 34)}${tt(256, 194, u('reflected', 'отражается', 'шағылады') + ` ${fmt(refl * 100, 0)}%`, 'exs-s')}${tt(256, 207, u('passes', 'проходит', 'өтеді') + ` ${fmt((1 - refl) * 100, 0)}%`, 'exs-s')}`}`;
      let caption = tir
        ? u(
            `sin β would be ${fmt(v.n1, 2)}·sin ${fmt(v.a, 1)}° / ${fmt(v.n2, 2)} = ${fmt(s, 2)} > 1 - impossible. The light does not get out: total internal reflection (α > α₀ = ${fmt(crit, 1)}°, sin α₀ = n₂/n₁). Optical fibres work this way.`,
            `sin β получился бы ${fmt(v.n1, 2)}·sin ${fmt(v.a, 1)}° / ${fmt(v.n2, 2)} = ${fmt(s, 2)} > 1 - так не бывает. Свет не выходит: полное внутреннее отражение (α > α₀ = ${fmt(crit, 1)}°, sin α₀ = n₂/n₁). Так работает оптоволокно.`,
            `sin β = ${fmt(v.n1, 2)}·sin ${fmt(v.a, 1)}° / ${fmt(v.n2, 2)} = ${fmt(s, 2)} > 1 болар еді - бұлай болмайды. Жарық шықпайды: толық ішкі шағылу (α > α₀ = ${fmt(crit, 1)}°, sin α₀ = n₂/n₁). Оптоталшық осылай жұмыс істейді.`,
          )
        : u(
            `${fmt(v.n1, 2)} · sin ${fmt(v.a, 1)}° = ${fmt(v.n2, 2)} · sin β → sin β = ${fmt(s, 3)}, β = ${fmt(deg(b), 1)}°. ${v.n2 > v.n1 ? 'Into an optically denser medium the ray bends toward the normal.' : v.n2 < v.n1 ? `Into a less dense medium it bends away from the normal; beyond α₀ = ${fmt(crit, 1)}° it will not get out.` : 'Same n - no bending.'}`,
            `${fmt(v.n1, 2)} · sin ${fmt(v.a, 1)}° = ${fmt(v.n2, 2)} · sin β → sin β = ${fmt(s, 3)}, β = ${fmt(deg(b), 1)}°. ${v.n2 > v.n1 ? 'В оптически более плотную среду луч отклоняется к нормали.' : v.n2 < v.n1 ? `В менее плотную - от нормали; при α > α₀ = ${fmt(crit, 1)}° он не выйдет совсем.` : 'n одинаковые - преломления нет.'}`,
            `${fmt(v.n1, 2)} · sin ${fmt(v.a, 1)}° = ${fmt(v.n2, 2)} · sin β → sin β = ${fmt(s, 3)}, β = ${fmt(deg(b), 1)}°. ${v.n2 > v.n1 ? 'Оптикалық тығызырақ ортаға сәуле нормальға қарай ауытқиды.' : v.n2 < v.n1 ? `Тығыздығы аз ортаға - нормальдан алыс; α > α₀ = ${fmt(crit, 1)}° болса, мүлде шықпайды.` : 'n бірдей - сыну жоқ.'}`,
          );
      if (st.m === 1) {
        const q = st.task;
        const bd = tir ? null : deg(b);
        let ok;
        let goal;
        let hint;
        let done;
        if (q.type === 0) {
          ok = !tir && near(bd, q.b, 0.5);
          goal = u(`${medName(q.n1)} → ${medName(q.n2)}. Choose α so that the angle of refraction is β = ${q.b}°.`, `${medName(q.n1)} → ${medName(q.n2)}. Подбери α, чтобы угол преломления был β = ${q.b}°.`, `${medName(q.n1)} → ${medName(q.n2)}. Сыну бұрышы β = ${q.b}° болатындай α-ны тап.`);
          hint = u(`Now β = ${tir ? '-' : fmt(bd, 1) + '°'}.`, `Сейчас β = ${tir ? '-' : fmt(bd, 1) + '°'}.`, `Қазір β = ${tir ? '-' : fmt(bd, 1) + '°'}.`);
          done = `sin α = ${fmt(q.n2, 2)}·sin ${q.b}° / ${fmt(q.n1, 2)} → α ≈ ${fmt(deg(Math.asin((q.n2 * Math.sin(rad(q.b))) / q.n1)), 1)}°.`;
        } else if (q.type === 1) {
          ok = v.a >= q.crit - 0.01 && v.a <= q.crit + 0.6;
          goal = u(`${medName(q.n1)} → ${medName(q.n2)}. Find the critical angle: the smallest α at which the light no longer gets out.`, `${medName(q.n1)} → ${medName(q.n2)}. Найди предельный угол: наименьший α, при котором свет уже не выходит.`, `${medName(q.n1)} → ${medName(q.n2)}. Шекті бұрышты тап: жарық енді шықпайтын ең кіші α.`);
          hint = tir ? u('Total reflection - but maybe α can be smaller.', 'Полное отражение - но, может быть, α можно взять меньше.', 'Толық шағылу - бірақ α-ны кішірек алуға болатын шығар.') : u(`The ray still gets out (β = ${fmt(bd, 1)}°) - increase α.`, `Луч ещё выходит (β = ${fmt(bd, 1)}°) - увеличь α.`, `Сәуле әлі шығады (β = ${fmt(bd, 1)}°) - α-ны арттыр.`);
          done = `sin α₀ = n₂/n₁ = ${fmt(q.n2, 2)}/${fmt(q.n1, 2)} → α₀ = ${fmt(q.crit, 1)}°.`;
        } else {
          ok = !tir && near(v.n2, q.ans, 0.015);
          goal = u(`light goes from air at α = 60° and refracts at β = ${fmt(q.b, 1)}°. Find n₂ of the second medium.`, `свет идёт из воздуха под α = 60° и преломляется под β = ${fmt(q.b, 1)}°. Подбери n₂ второй среды.`, `жарық ауадан α = 60° бұрышпен келіп, β = ${fmt(q.b, 1)}° бұрышпен сынады. Екінші ортаның n₂-сін тап.`);
          hint = u(`Now β = ${tir ? '-' : fmt(bd, 1) + '°'}. n₂ = sin α / sin β.`, `Сейчас β = ${tir ? '-' : fmt(bd, 1) + '°'}. n₂ = sin α / sin β.`, `Қазір β = ${tir ? '-' : fmt(bd, 1) + '°'}. n₂ = sin α / sin β.`);
          done = u(`n₂ = sin 60° / sin ${fmt(q.b, 1)}° ≈ ${fmt(q.ans, 2)} - it is ${medName(q.ans)}.`, `n₂ = sin 60° / sin ${fmt(q.b, 1)}° ≈ ${fmt(q.ans, 2)} - это ${medName(q.ans)}.`, `n₂ = sin 60° / sin ${fmt(q.b, 1)}° ≈ ${fmt(q.ans, 2)} - бұл ${medName(q.ans)}.`);
        }
        caption = taskCap(goal, ok, hint, done);
        return { svg: svg + taskBadge(ok, 316, 14), caption };
      }
      return { svg, caption };
    },
  },

  balancing: {
    title: L('Balancing chemical equations', 'Уравниваем химические реакции', 'Химиялық реакцияларды теңестіру'),
    intro: L('Atoms are not created or lost, only regrouped. Change the coefficients (not the small indices) until every element is equal on both sides.', 'Атомы не появляются и не исчезают, а только перегруппировываются. Меняй коэффициенты (не индексы), пока атомов каждого элемента не станет поровну.', 'Атомдар пайда болмайды да, жоғалмайды да, тек қайта топтасады. Әр элемент атомдары теңелгенше коэффициенттерді (индекстерді емес) өзгерт.'),
    sliders: [1, 2, 3, 4].map((i) => ({ id: `k${i}`, label: `k${sub(i)}`, min: 1, max: 12, step: 1, value: 1, hidden: (v, st) => i > RX[st.lv][st.r][0].length + RX[st.lv][st.r][1].length })),
    buttons: [L('Level 1', 'Уровень 1', '1-деңгей'), L('Level 2', 'Уровень 2', '2-деңгей'), L('Level 3', 'Уровень 3', '3-деңгей'), L('Next ↻', 'Следующая ↻', 'Келесі ↻'), L('Answer', 'Ответ', 'Жауап')],
    state: () => ({ lv: 0, r: 0 }),
    pressed: (i, v, st) => i === st.lv,
    onButton(i, st) {
      if (i < 3) {
        st.lv = i;
        st.r = ri(0, RX[i].length - 1);
      } else if (i === 3) st.r = (st.r + 1) % RX[st.lv].length;
      else {
        const ans = RX[st.lv][st.r][2];
        return { k1: ans[0], k2: ans[1], k3: ans[2], k4: ans[3] ?? 1 };
      }
      return { k1: 1, k2: 1, k3: 1, k4: 1 };
    },
    draw(v, step, st) {
      const [re, pr, , type] = RX[st.lv][st.r];
      const all = [...re, ...pr];
      const ks = [v.k1, v.k2, v.k3, v.k4].slice(0, all.length);
      const comp = all.map(parseF);
      const els = [];
      for (const c of comp) for (const e of Object.keys(c)) if (!els.includes(e)) els.push(e);
      const side = (from, to) => {
        const cnt = {};
        for (let j = from; j < to; j++) for (const [e, c] of Object.entries(comp[j])) cnt[e] = (cnt[e] ?? 0) + c * ks[j];
        return cnt;
      };
      const left = side(0, re.length);
      const right = side(re.length, all.length);
      const okEl = (e) => left[e] === right[e];
      const ok = els.every(okEl);
      const g = ks.reduce(gcd);
      // Уравнение: коэффициенты и формулы по центру.
      const parts = all.map((f, j) => ({ k: ks[j], f: subF(f), j }));
      const term2 = (p) => `${p.k > 1 ? p.k : ''}${p.f}`;
      const eqTxt = `${parts.slice(0, re.length).map(term2).join(' + ')} → ${parts.slice(re.length).map(term2).join(' + ')}`;
      const n = all.length;
      const colX = (j) => 160 + (j - (n - 1) / 2) * (n === 4 ? 74 : n === 3 ? 92 : 120);
      const cols = all
        .map((f, j) => {
          const x = colX(j);
          const mid = j === re.length - 1 ? '→' : j < n - 1 ? '+' : '';
          return `${box(x - 34, 36, 68, 36)}${tt(x, 51, `${ks[j] > 1 ? ks[j] : ''}${subF(f)}`, 'exs-m')}${tt(x, 66, `k${sub(j + 1)} = ${ks[j]}`, 'exs-s tc exc-p')}${mid ? tt((x + colX(j + 1)) / 2, 58, mid, 'exs-h') : ''}`;
        })
        .join('');
      const rowH = Math.min(24, 120 / els.length);
      const dots = (cnt, x0, dir, cls) => {
        const shown = Math.min(cnt, 12);
        let out = '';
        for (let q = 0; q < shown; q++) out += `<circle class="ex-fill ${cls}" cx="${n1(x0 + dir * (q * 7.5))}" cy="0" r="3"/>`;
        return out + (cnt > 12 ? tt(x0 + dir * 90, 4, `+${cnt - 12}`, `exs-s ${dir > 0 ? 'ex-start' : 'ex-end'}`) : '');
      };
      const rows = els
        .map((e, q) => {
          const y = 96 + q * rowH;
          const good = okEl(e);
          const cls = EL_CLS[e] ?? 'exc-p';
          return `<g transform="translate(0 ${n1(y)})" class="${cls}">${dots(left[e], 132, -1, cls)}${dots(right[e], 188, 1, cls)}</g>${tt(160, y + 4, e, 'exs-t')}${tt(8, y + 4, String(left[e]), `exs-t ex-start tc ${good ? 'exc-g' : 'exc-r'}`)}${tt(314, y + 4, `${right[e]} ${good ? '✓' : '✗'}`, `exs-t ex-end tc ${good ? 'exc-g' : 'exc-r'}`)}`;
        })
        .join('');
      const lv = `${tt(8, 16, `${u('Level', 'Уровень', 'Деңгей')} ${st.lv + 1} · ${tx(RX_TYPES[type])}`, 'exs-s ex-start')}${tt(312, 16, ok ? `✓ ${u('balanced', 'уравнено', 'теңестірілді')}` : u('not balanced', 'не уравнено', 'теңестірілмеген'), `exs-t ex-end tc ${ok ? 'exc-g' : 'exc-r'}`)}`;
      const head = `${tt(84, 88, u('left', 'слева', 'сол жақ'), 'exs-s')}${tt(236, 88, u('right', 'справа', 'оң жақ'), 'exs-s')}`;
      const svg = `${lv}${cols}${head}${rows}`;
      let caption;
      if (ok && g === 1) {
        const list = els.map((e) => `${e}: ${left[e]}`).join(', ');
        caption = u(`✓ Balanced: ${eqTxt}. Atoms on each side: ${list}. The coefficients ${ks.join(' : ')} are also the mole ratio of the reaction.`, `✓ Уравнено: ${eqTxt}. Атомов с каждой стороны: ${list}. Коэффициенты ${ks.join(' : ')} - это и соотношение молей в реакции.`, `✓ Теңестірілді: ${eqTxt}. Әр жақтағы атомдар: ${list}. ${ks.join(' : ')} коэффициенттері - реакциядағы моль қатынасы да.`);
      } else if (ok) caption = u(`Balanced, but all coefficients can be divided by ${g}. Use the smallest whole numbers: ${ks.map((k) => k / g).join(' : ')}.`, `Уравнено, но все коэффициенты делятся на ${g}. Нужны наименьшие целые: ${ks.map((k) => k / g).join(' : ')}.`, `Теңестірілді, бірақ барлық коэффициенттер ${g}-ге бөлінеді. Ең кіші бүтін сандар керек: ${ks.map((k) => k / g).join(' : ')}.`);
      else {
        const e = els.find((x) => !okEl(x));
        const lessLeft = left[e] < right[e];
        const from = lessLeft ? 0 : re.length;
        const to = lessLeft ? re.length : all.length;
        const cand = all.slice(from, to).find((f) => parseF(f)[e]);
        caption = u(
          `${e}: ${left[e]} on the left, ${right[e]} on the right. Try a bigger coefficient in front of ${subF(cand)}. Tip: balance O and H last, and check every element again after each change.`,
          `${e}: слева ${left[e]}, справа ${right[e]}. Попробуй увеличить коэффициент перед ${subF(cand)}. Совет: O и H уравнивай в конце и после каждого шага пересчитывай все элементы.`,
          `${e}: сол жақта ${left[e]}, оң жақта ${right[e]}. ${subF(cand)} алдындағы коэффициентті арттырып көр. Кеңес: O мен H-ты соңында теңестір, әр қадамнан кейін барлық элементті қайта сана.`,
        );
      }
      return { svg, caption };
    },
  },

  atom: {
    title: L('Atom: protons, neutrons, electrons', 'Атом: протоны, нейтроны, электроны', 'Атом: протондар, нейтрондар, электрондар'),
    intro: L('Z is the number of protons and (in a neutral atom) electrons. Electrons fill layers 2, 8, 8, ...; the outer ones decide the chemistry.', 'Z - число протонов и (в нейтральном атоме) электронов. Электроны заполняют слои по 2, 8, 8, ...; внешние решают химию.', 'Z - протондар саны және (бейтарап атомда) электрондар саны. Электрондар қабаттарды 2, 8, 8, ... толтырады; сыртқылары химияны шешеді.'),
    sliders: [
      { id: 'Z', label: L('Z (protons)', 'Z (протоны)', 'Z (протондар)'), min: 1, max: 20, step: 1, value: 11 },
      { id: 'N', label: L('N (neutrons)', 'N (нейтроны)', 'N (нейтрондар)'), min: 0, max: 24, step: 1, value: 12, hidden: (v, st) => !(st.m === 2 || (st.m === 3 && st.task.type === 1)) },
      { id: 'e', label: L('electrons', 'электроны', 'электрондар'), min: 0, max: 20, step: 1, value: 11, hidden: (v, st) => !(st.m === 1 || (st.m === 3 && st.task.type === 2)) },
    ],
    buttons: [L('Atom', 'Атом', 'Атом'), L('Ion', 'Ион', 'Ион'), L('Isotopes ↻', 'Изотопы ↻', 'Изотоптар ↻'), TASK],
    state: () => ({ ph: 0, m: 0, z: 11, task: null }),
    pressed: (i, v, st) => i === st.m,
    onButton(i, st, v) {
      const z = Math.round(v.Z);
      if (i === 0) {
        st.m = 0;
        return { e: z, N: EL_ISO[z - 1][0] };
      }
      if (i === 1) {
        st.m = 1;
        return { e: z - EL_ION[z - 1] };
      }
      if (i === 2) {
        const iso = EL_ISO[z - 1];
        const k = st.m === 2 ? (iso.indexOf(Math.round(v.N)) + 1) % iso.length : 0;
        st.m = 2;
        return { N: iso[k], e: z };
      }
      st.m = 3;
      st.task = atomTask();
      st.z = 1;
      return { Z: 1, N: 0, e: 1 };
    },
    live(dt, v, st) {
      st.ph = (st.ph + dt * 0.5) % (Math.PI * 2);
    },
    draw(v, step, st) {
      const z = clamp(Math.round(v.Z), 1, 20);
      // Сменили элемент - нейтроны и электроны подстраиваются под него.
      if (z !== st.z) {
        st.z = z;
        v.N = EL_ISO[z - 1][0];
        v.e = st.m === 1 ? z - EL_ION[z - 1] : z;
      }
      const N = Math.round(v.N);
      const e = Math.round(v.e);
      const q = z - e;
      const A = z + N;
      const sh = shellsOf(e);
      const cx = 92;
      const cy = 112;
      // Ядро: протоны (красные) и нейтроны (серые) «подсолнухом».
      let nuc = '';
      const ga = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < A; i++) {
        const r = 2.45 * Math.sqrt(i + 0.5);
        const isP = Math.floor(((i + 1) * z) / A) > Math.floor((i * z) / A);
        nuc += `<circle class="ex-fill ${isP ? 'exc-r' : 'exc-m'}" cx="${n1(cx + r * Math.cos(i * ga))}" cy="${n1(cy + r * Math.sin(i * ga))}" r="2.7" style="stroke:var(--card);stroke-width:.6"/>`;
      }
      const rings = sh
        .map((cnt, i) => {
          const r = 30 + i * 18;
          const dots = Array.from({ length: cnt }, (_, k) => {
            const a = st.ph * (1 - i * 0.18) + (k / cnt) * Math.PI * 2;
            return `<circle class="ex-fill exc-b" cx="${n1(cx + r * Math.cos(a))}" cy="${n1(cy + r * Math.sin(a))}" r="3.3"/>`;
          }).join('');
          return `<circle class="ex-stroke exc-m" style="stroke-width:1;opacity:.6" cx="${cx}" cy="${cy}" r="${r}"/>${dots}${tt(cx + r * 0.71 + 3, cy - r * 0.71 - 2, String(cnt), 'exs-s ex-start tc exc-b')}`;
        })
        .join('');
      const isoKey = `${z}-${A}`;
      const natural = EL_ISO[z - 1].includes(N);
      const rad2 = ISO_RAD.includes(isoKey);
      const kind = [u('non-metal', 'неметалл', 'бейметалл'), u('metal', 'металл', 'металл'), u('noble gas', 'благородный газ', 'асыл газ')][EL_KIND[z - 1]];
      const val = sh.at(-1) ?? 0;
      const sym = `${EL[z - 1]}${chargeSup(q)}`;
      const card = `${box(176, 4, 140, 212)}
        ${tt(184, 20, String(z), 'exs-t ex-start')}${tt(310, 20, `Ar = ${fmt(EL_AR[z - 1], 1)}`, 'exs-s ex-end')}
        ${tt(246, 50, sym, 'ex-big')}${tt(246, 66, elName(z), 'exs-t')}
        ${tt(184, 86, `p⁺ = ${z}`, 'exs-t ex-start tc exc-r')}${tt(234, 86, `n⁰ = ${N}`, 'exs-t ex-start tc exc-m')}${tt(278, 86, `e⁻ = ${e}`, 'exs-t ex-start tc exc-b')}
        ${tt(184, 104, `A = Z + N = ${A}: ${sup(A)}${EL[z - 1]}`, 'exs-t ex-start')}
        ${tt(184, 122, `${u('layers', 'слои', 'қабаттар')}: ${sh.join(', ') || '-'}`, 'exs-t ex-start')}
        ${tt(184, 138, configOf(e), 'exs-s ex-start tc exc-b')}
        ${tt(184, 156, `${u('period', 'период', 'период')} ${shellsOf(z).length} · ${u('group', 'группа', 'топ')} ${groupOf(z)}`, 'exs-t ex-start')}
        ${tt(184, 172, kind, 'exs-s ex-start')}
        ${tt(184, 192, st.m === 2 || !natural || rad2 ? `${EL[z - 1]}-${A}: ${rad2 ? u('radioactive', 'радиоактивный', 'радиоактивті') : natural ? u('stable isotope', 'устойчивый изотоп', 'тұрақты изотоп') : u('not found in nature', 'в природе нет', 'табиғатта жоқ')}` : `${u('outer electrons', 'внешних e⁻', 'сыртқы e⁻')}: ${val}`, `exs-s ex-start tc ${rad2 || !natural ? 'exc-o' : 'exc-g'}`)}
        ${tt(184, 208, q === 0 ? u('neutral atom', 'нейтральный атом', 'бейтарап атом') : `${u('ion', 'ион', 'ион')} ${sym}: ${q > 0 ? u(`gave away ${q} e⁻`, `отдал ${q} e⁻`, `${q} e⁻ берді`) : u(`took ${-q} e⁻`, `принял ${-q} e⁻`, `${-q} e⁻ қосып алды`)}`, `exs-s ex-start tc ${q === 0 ? 'exc-m' : q > 0 ? 'exc-r' : 'exc-b'}`)}`;
      const svg = `${rings}${nuc}${card}`;
      const pRu = `${z} ${ruN(z, 'протон', 'протона', 'протонов')}, ${N} ${ruN(N, 'нейтрон', 'нейтрона', 'нейтронов')}, ${e} ${ruN(e, 'электрон', 'электрона', 'электронов')}`;
      let caption;
      if (st.m === 1)
        caption = q === 0
          ? u(`${EL[z - 1]} has no typical ion${EL_KIND[z - 1] === 2 ? ': its outer layer is already full' : ''}. Change the electrons to make one.`, `У ${EL[z - 1]} нет типичного иона${EL_KIND[z - 1] === 2 ? ': внешний слой уже заполнен' : ''}. Измени число электронов, чтобы получить ион.`, `${EL[z - 1]}-да типтік ион жоқ${EL_KIND[z - 1] === 2 ? ': сыртқы қабаты толық' : ''}. Ион алу үшін электрондар санын өзгерт.`)
          : u(
              `${sym}: ${z} protons and ${e} electrons, charge ${q > 0 ? '+' : '−'}${Math.abs(q)}. ${q > 0 ? 'A metal gives away its outer electrons' : 'A non-metal takes electrons'}, and the ion gets the layers ${sh.join(', ') || '0'}${[2, 10, 18].includes(e) ? ' - like a noble gas' : ''}.`,
              `${sym}: ${z} ${ruN(z, 'протон', 'протона', 'протонов')} и ${e} ${ruN(e, 'электрон', 'электрона', 'электронов')}, заряд ${q > 0 ? '+' : '−'}${Math.abs(q)}. ${q > 0 ? 'Металл отдаёт внешние электроны' : 'Неметалл принимает электроны'}, и у иона слои ${sh.join(', ') || '0'}${[2, 10, 18].includes(e) ? ' - как у благородного газа' : ''}.`,
              `${sym}: ${z} протон және ${e} электрон, заряды ${q > 0 ? '+' : '−'}${Math.abs(q)}. ${q > 0 ? 'Металл сыртқы электрондарын береді' : 'Бейметалл электрон қосып алады'}, ионның қабаттары ${sh.join(', ') || '0'}${[2, 10, 18].includes(e) ? ' - асыл газдағыдай' : ''}.`,
            );
      else if (st.m === 2)
        caption = u(
          `Isotopes of ${elName(z)} have the same Z = ${z} but different numbers of neutrons. ${EL[z - 1]}-${A}: ${N} neutrons, mass number A = ${z} + ${N} = ${A}. Press «Isotopes» again for the next one. Ar = ${fmt(EL_AR[z - 1], 1)} is the average over natural isotopes.`,
          `Изотопы элемента ${elLow(z)} (${EL[z - 1]}) - одинаковый Z = ${z}, но разное число нейтронов. ${EL[z - 1]}-${A}: ${N} ${ruN(N, 'нейтрон', 'нейтрона', 'нейтронов')}, массовое число A = ${z} + ${N} = ${A}. Нажми «Изотопы» ещё раз - следующий. Ar = ${fmt(EL_AR[z - 1], 1)} - среднее по природным изотопам.`,
          `${elName(z)} изотоптарында Z = ${z} бірдей, нейтрондар саны әртүрлі. ${EL[z - 1]}-${A}: ${N} нейтрон, массалық сан A = ${z} + ${N} = ${A}. Келесісі үшін «Изотоптар» батырмасын тағы бас. Ar = ${fmt(EL_AR[z - 1], 1)} - табиғи изотоптардың орташасы.`,
        );
      else
        caption = u(
          `${elName(z)} (${EL[z - 1]}): ${z} protons, ${N} neutrons, ${e} electrons. Layers ${sh.join(', ')}: ${sh.length} layers → period ${sh.length}; ${EL_KIND[z - 1] === 2 ? 'the outer layer is full - a noble gas' : `${val} outer electron${val > 1 ? 's' : ''} → group ${groupOf(z)}`}. Formula: ${configOf(e)}.`,
          `${elName(z)} (${EL[z - 1]}): ${pRu}. Слои ${sh.join(', ')}: ${sh.length} ${ruN(sh.length, 'слой', 'слоя', 'слоёв')} → ${sh.length} период; ${EL_KIND[z - 1] === 2 ? 'внешний слой заполнен - благородный газ' : `${val} ${ruN(val, 'электрон', 'электрона', 'электронов')} снаружи → группа ${groupOf(z)}`}. Формула: ${configOf(e)}.`,
          `${elName(z)} (${EL[z - 1]}): ${z} протон, ${N} нейтрон, ${e} электрон. Қабаттар ${sh.join(', ')}: ${sh.length} қабат → ${sh.length}-период; ${EL_KIND[z - 1] === 2 ? 'сыртқы қабаты толық - асыл газ' : `сыртта ${val} электрон → ${groupOf(z)} топ`}. Формуласы: ${configOf(e)}.`,
        );
      if (st.m === 3) {
        const k = st.task;
        let ok;
        let goal;
        let done;
        const ks = shellsOf(k.z);
        if (k.type === 0) {
          ok = z === k.z && e === z;
          goal = u(`find the element whose atom has ${ks.length} electron layers and ${ks.at(-1)} electrons on the outer one.`, `найди элемент, у атома которого ${ks.length} ${ruN(ks.length, 'электронный слой', 'электронных слоя', 'электронных слоёв')} и ${ks.at(-1)} ${ruN(ks.at(-1), 'электрон', 'электрона', 'электронов')} на внешнем.`, `атомында ${ks.length} электрон қабаты және сыртқы қабатында ${ks.at(-1)} электрон бар элементті тап.`);
          done = u(`It is ${elName(k.z)}: layers ${ks.join(', ')}, period ${ks.length}, group ${groupOf(k.z)}.`, `Это ${elLow(k.z)}: слои ${ks.join(', ')}, период ${ks.length}, группа ${groupOf(k.z)}.`, `Бұл ${elLow(k.z)}: қабаттар ${ks.join(', ')}, ${ks.length}-период, ${groupOf(k.z)} топ.`);
        } else if (k.type === 1) {
          ok = z === k.z && N === k.n;
          goal = u(`build the nucleus of ${EL[k.z - 1]}-${k.z + k.n} (${sup(k.z + k.n)}${EL[k.z - 1]}): choose Z and N.`, `собери ядро ${EL[k.z - 1]}-${k.z + k.n} (${sup(k.z + k.n)}${EL[k.z - 1]}): подбери Z и N.`, `${EL[k.z - 1]}-${k.z + k.n} (${sup(k.z + k.n)}${EL[k.z - 1]}) ядросын құрастыр: Z мен N-ді тап.`);
          done = `Z = ${k.z}, N = A − Z = ${k.z + k.n} − ${k.z} = ${k.n}.`;
        } else if (k.type === 2) {
          const qq = k.z - k.e;
          ok = z === k.z && e === k.e;
          goal = u(`build the ion ${EL[k.z - 1]}${chargeSup(qq)}: choose Z and the number of electrons.`, `собери ион ${EL[k.z - 1]}${chargeSup(qq)}: подбери Z и число электронов.`, `${EL[k.z - 1]}${chargeSup(qq)} ионын құрастыр: Z мен электрондар санын тап.`);
          done = `e⁻ = Z − (${qq > 0 ? '+' : '−'}${Math.abs(qq)}) = ${k.z} ${qq > 0 ? '−' : '+'} ${Math.abs(qq)} = ${k.e}.`;
        } else {
          ok = z === k.z && e === z;
          goal = u(`which element has the electron formula ${configOf(k.z)}?`, `у какого элемента электронная формула ${configOf(k.z)}?`, `қай элементтің электрондық формуласы ${configOf(k.z)}?`);
          done = u(`Add the upper numbers: ${k.z} electrons → ${elName(k.z)}.`, `Сложи верхние цифры: ${k.z} электронов → ${elLow(k.z)}.`, `Жоғарғы сандарды қос: ${k.z} электрон → ${elLow(k.z)}.`);
        }
        caption = taskCap(goal, ok, u(`Now: ${EL[z - 1]}, Z = ${z}.`, `Сейчас: ${EL[z - 1]}, Z = ${z}.`, `Қазір: ${EL[z - 1]}, Z = ${z}.`), done);
        return { svg: svg + taskBadge(ok, 170, 14), caption };
      }
      return { svg, caption };
    },
  },

  molar: {
    title: L('Moles: grams, particles, litres', 'Моль: граммы, частицы, литры', 'Моль: грамм, бөлшек, литр'),
    intro: L('1 mol is 6.02·10²³ particles; its mass in grams is M (sum of Ar), a gas takes 22.4 L at STP. n = m / M = N / Nₐ = V / Vm.', '1 моль - это 6,02·10²³ частиц, его масса в граммах равна M (сумма Ar), газ при н. у. занимает 22,4 л. n = m / M = N / Nₐ = V / Vm.', '1 моль - 6,02·10²³ бөлшек, оның граммдағы массасы M-ге (Ar қосындысы) тең, газ қ. ж. 22,4 л алады. n = m / M = N / Nₐ = V / Vm.'),
    sliders: [{ id: 'm', label: L('mass m, g', 'масса m, г', 'масса m, г'), min: 0, max: 200, step: 0.5, value: 36 }],
    buttons: [L('n = m / M', 'n = m / M', 'n = m / M'), L('Gas: V = n·Vm', 'Газ: V = n·Vm', 'Газ: V = n·Vm'), L('Mass fraction', 'Массовая доля', 'Массалық үлес'), L('Substance ↻', 'Вещество ↻', 'Зат ↻'), TASK],
    state: () => ({ m: 0, s: 0, task: null }),
    pressed: (i, v, st) => i === st.m || (i === 4 && st.m === 3),
    btnHidden: (i, v, st) => i === 3 && st.m === 3,
    onButton(i, st) {
      if (i === 3) {
        do st.s = (st.s + 1) % SUBST.length;
        while (st.m === 1 && !SUBST[st.s][1]);
        return null;
      }
      if (i < 3) {
        st.m = i;
        if (i === 1) while (!SUBST[st.s][1]) st.s = (st.s + 1) % SUBST.length;
        return null;
      }
      st.m = 3;
      st.task = molTask();
      st.s = st.task.s;
      return { m: 0 };
    },
    draw(v, step, st) {
      const [f, gas] = SUBST[st.s];
      const F = subF(f);
      const M = molarOf(f);
      const n = v.m / M;
      const N = n * 6.02;
      const head = `${tt(160, 22, `M(${F}) = ${molarSum(f)} = ${fmt(M, 1)} ${u('g/mol', 'г/моль', 'г/моль')}`, 'exs-t')}`;
      const mode = st.m === 3 ? (st.task.type === 1 ? 1 : 0) : st.m;
      let pic = '';
      if (mode === 0) {
        const full = Math.floor(n + 1e-9);
        const part = n - full;
        pic = Array.from({ length: Math.min(10, Math.ceil(n - 1e-9)) }, (_, i) => {
          const fill = i < full ? 1 : part;
          const x = 48 + (i % 5) * 56;
          const y = 92 + Math.floor(i / 5) * 50;
          const end = fill >= 0.999 ? `<circle class="ex-fill exc-p" style="opacity:.75" cx="${x}" cy="${y}" r="20"/>` : `<path class="ex-fill exc-p" style="opacity:.75" d="M${x} ${y} L${x} ${y - 20} A20 20 0 ${fill > 0.5 ? 1 : 0} 1 ${n1(x + 20 * Math.sin(fill * 2 * Math.PI))} ${n1(y - 20 * Math.cos(fill * 2 * Math.PI))} Z"/>`;
          return `<circle class="ex-stroke exc-p" style="stroke-width:1.5" cx="${x}" cy="${y}" r="20"/>${end}${tt(x, y + 4, fill >= 0.999 ? `1 ${UN.mol()}` : fmt(fill, 2), 'exs-s')}`;
        }).join('');
        pic += `${tt(160, 46, `n = m / M = ${fmt(v.m, 1)} / ${fmt(M, 1)} = ${fmt(n, 3)} ${UN.mol()}`, 'exs-h')}${n > 10 ? tt(160, 182, u('(only 10 moles drawn)', '(нарисовано только 10 моль)', '(тек 10 моль салынған)'), 'exs-s') : ''}
          ${box(4, 190, 236, 24)}${tt(122, 206, `N = n·Nₐ = ${fmt(n, 3)} · 6,02·10²³ ≈ ${fmt(N, 2)}·10²³`, 'exs-t')}`;
      } else if (mode === 1) {
        const V = n * 22.4;
        if (!gas) pic = `${box(30, 70, 260, 70)}${tt(160, 98, u(`${F} is not a gas at STP,`, `${F} при н. у. не газ,`, `${F} қ. ж. газ емес,`), 'exs-m')}${tt(160, 118, u('choose another substance ↻', 'выбери другое вещество ↻', 'басқа зат таңда ↻'), 'exs-t')}`;
        else {
          const full = Math.floor(n + 1e-9);
          const part = n - full;
          pic = Array.from({ length: Math.min(8, Math.ceil(n - 1e-9)) }, (_, i) => {
            const fill = i < full ? 1 : part;
            const x = 26 + (i % 4) * 72;
            const y = 62 + Math.floor(i / 4) * 64;
            return `<rect class="ex-stroke exc-b" style="stroke-width:1.5" x="${x}" y="${y}" width="52" height="52" rx="4"/><rect class="ex-fill exc-b" style="opacity:.45" x="${x}" y="${n1(y + 52 * (1 - fill))}" width="52" height="${n1(52 * fill)}" rx="4"/>${tt(x + 26, y + 30, `${fmt(22.4 * fill, 1)} ${UN.L()}`, 'exs-s')}`;
          }).join('');
          pic += `${tt(160, 46, `V = n·Vm = ${fmt(n, 3)} · ${fmt(22.4, 1)} = ${fmt(V, 2)} ${UN.L()}`, 'exs-h')}${box(30, 192, 260, 22)}${tt(160, 207, u('each cube - 1 mol of any gas = 22.4 L (0 °C, 1 atm)', 'каждый куб - 1 моль любого газа = 22,4 л (0 °C, 1 атм)', 'әр куб - кез келген газдың 1 молі = 22,4 л (0 °C, 1 атм)'), 'exs-s')}`;
        }
      } else {
        const comp = Object.entries(parseF(f));
        let x0 = 20;
        const bar = comp
          .map(([e, k]) => {
            const w = (k * arOf(e)) / M;
            const wpx = 280 * w;
            const cls = EL_CLS[e] ?? 'exc-p';
            const seg = `<rect class="ex-fill ${cls}" style="opacity:.8" x="${n1(x0)}" y="52" width="${n1(wpx)}" height="26"/>${wpx > 26 ? tt(x0 + wpx / 2, 69, e, 'exs-t exs-on') : ''}`;
            x0 += wpx;
            return seg;
          })
          .join('');
        const rows = comp
          .map(([e, k], i) => {
            const w = (k * arOf(e)) / M;
            return `${tt(20, 104 + i * 22, `w(${e}) = ${k > 1 ? `${k}·` : ''}${fmt(arOf(e), 1)} / ${fmt(M, 1)} = ${fmt(w * 100, 1)}%`, `exs-t ex-start tc ${EL_CLS[e] ?? 'exc-p'}`)}${tt(300, 104 + i * 22, `${fmt(w * v.m, 1)} ${UN.g()}`, 'exs-t ex-end')}`;
          })
          .join('');
        pic = `${bar}${tt(300, 46, `${u('in', 'в', '')} ${fmt(v.m, 1)} ${UN.g()} ${F}${getLang() === 'kk' ? ' ішінде' : ''}:`, 'exs-s ex-end')}${rows}`;
      }
      const svg = `${head}${pic}`;
      let caption =
        mode === 0
          ? u(`${fmt(v.m, 1)} g of ${F} is n = m / M = ${fmt(n, 3)} mol (a full circle = 1 mol = ${fmt(M, 1)} g). That is N = n·6.02·10²³ ≈ ${fmt(N, 2)}·10²³ molecules. A heavier molecule (bigger M) gives fewer moles for the same mass.`, `${fmt(v.m, 1)} г ${F} - это n = m / M = ${fmt(n, 3)} моль (полный круг = 1 моль = ${fmt(M, 1)} г). Это N = n·6,02·10²³ ≈ ${fmt(N, 2)}·10²³ частиц. Чем тяжелее молекула (больше M), тем меньше молей при той же массе.`, `${fmt(v.m, 1)} г ${F} - бұл n = m / M = ${fmt(n, 3)} моль (толық шеңбер = 1 моль = ${fmt(M, 1)} г). Бұл N = n·6,02·10²³ ≈ ${fmt(N, 2)}·10²³ бөлшек. Молекула ауыр болса (M үлкен), сол массада моль аз болады.`)
          : mode === 1
            ? u(`At STP 1 mol of any gas takes 22.4 L. ${fmt(v.m, 1)} g of ${F}: n = ${fmt(n, 3)} mol, V = n·22.4 = ${fmt(n * 22.4, 2)} L. The same volume of hydrogen would weigh much less - but contain the same number of molecules.`, `При н. у. 1 моль любого газа занимает 22,4 л. ${fmt(v.m, 1)} г ${F}: n = ${fmt(n, 3)} моль, V = n·22,4 = ${fmt(n * 22.4, 2)} л. Такой же объём водорода весил бы намного меньше - но молекул в нём столько же.`, `Қ. ж. кез келген газдың 1 молі 22,4 л алады. ${fmt(v.m, 1)} г ${F}: n = ${fmt(n, 3)} моль, V = n·22,4 = ${fmt(n * 22.4, 2)} л. Сондай көлемдегі сутек әлдеқайда жеңіл - бірақ молекула саны бірдей.`)
            : u(`Mass fraction of an element: w = k·Ar / M. In ${F} the shares add up to 100%, and they do not depend on how many grams you take.`, `Массовая доля элемента: w = k·Ar / M. В ${F} доли в сумме дают 100% и не зависят от того, сколько граммов взять.`, `Элементтің массалық үлесі: w = k·Ar / M. ${F} құрамындағы үлестер қосындысы 100% және неше грамм алғанға тәуелді емес.`);
      if (st.m === 3) {
        const q = st.task;
        const ok = near(v.m, q.m, 0.6);
        let goal;
        let done;
        if (q.type === 0) {
          goal = u(`weigh out ${fmt(q.n, 2)} mol of ${F}.`, `отмерь ${fmt(q.n, 2)} моль ${F}.`, `${fmt(q.n, 2)} моль ${F} өлшеп ал.`);
          done = `m = n·M = ${fmt(q.n, 2)} · ${fmt(M, 1)} = ${fmt(q.m, 2)} ${UN.g()}.`;
        } else if (q.type === 1) {
          goal = u(`what mass of ${F} takes ${fmt(q.V, 1)} L at STP?`, `какая масса ${F} занимает ${fmt(q.V, 1)} л при н. у.?`, `қ. ж. ${fmt(q.V, 1)} л алатын ${F} массасы қанша?`);
          done = `n = ${fmt(q.V, 1)} / 22,4 = ${fmt(q.n, 2)} ${UN.mol()}, m = n·M = ${fmt(q.m, 2)} ${UN.g()}.`;
        } else {
          goal = u(`take as much ${F} as contains ${fmt(q.n * 6.02, 3)}·10²³ molecules.`, `возьми столько ${F}, чтобы в нём было ${fmt(q.n * 6.02, 3)}·10²³ молекул.`, `ішінде ${fmt(q.n * 6.02, 3)}·10²³ молекула болатындай ${F} ал.`);
          done = `n = N / Nₐ = ${fmt(q.n, 2)} ${UN.mol()}, m = n·M = ${fmt(q.m, 2)} ${UN.g()}.`;
        }
        caption = taskCap(goal, ok, u(`Now m = ${fmt(v.m, 1)} g, n = ${fmt(n, 3)} mol.`, `Сейчас m = ${fmt(v.m, 1)} г, n = ${fmt(n, 3)} моль.`, `Қазір m = ${fmt(v.m, 1)} г, n = ${fmt(n, 3)} моль.`), done);
        return { svg: svg + taskBadge(ok, 318, mode === 1 ? 186 : 206), caption };
      }
      return { svg, caption };
    },
  },

  punnett: {
    title: L('Genetics: Punnett square', 'Генетика: решётка Пеннета', 'Генетика: Пеннет торы'),
    intro: L('Each parent passes one allele of each gene. A capital letter is dominant: it shows even with one copy.', 'Каждый родитель передаёт по одному аллелю каждого гена. Большая буква - доминантный аллель: он проявляется даже в одной копии.', 'Әр ата-ана әр геннің бір аллелін береді. Бас әріп - доминантты аллель: бір көшірмеде де көрінеді.'),
    sliders: [
      { id: 'p1', label: L('mother ♀', 'мать ♀', 'аналық ♀'), min: 0, max: 8, step: 1, value: 4, show: (i) => geno(i, PUN_MODE, true) },
      { id: 'p2', label: L('father ♂', 'отец ♂', 'аталық ♂'), min: 0, max: 8, step: 1, value: 4, show: (i) => geno(i, PUN_MODE, false) },
    ],
    buttons: [L('Monohybrid', 'Моногибридное', 'Моногибридті'), L('Dihybrid', 'Дигибридное', 'Дигибридті'), L('Incomplete dominance', 'Неполное доминирование', 'Толымсыз доминанттылық'), L('Sex-linked', 'Сцепленное с полом', 'Жынысқа тіркескен'), TASK],
    state: () => ({ m: 0, task: null }),
    pressed: (i, v, st) => i === st.m,
    onButton(i, st) {
      st.m = i;
      if (i < 4) return { p1: 4, p2: 4 };
      st.task = { ...pick(PUN_TASKS) };
      return { p1: 0, p2: 0 };
    },
    draw(v, step, st) {
      const task = st.m === 4 ? st.task : null;
      const mode = task ? task.mode : st.m;
      PUN_MODE = mode;
      const i1 = Math.round(v.p1);
      const i2 = Math.round(v.p2);
      const { g1, g2, cells } = punCross(i1, i2, mode);
      const nc = g1.length;
      const cs = nc === 4 ? 31 : 50;
      const x0 = nc === 4 ? 36 : 54;
      const y0 = nc === 4 ? 40 : 58;
      let grid = '';
      g1.forEach((g, j) => (grid += tt(x0 + j * cs + cs / 2, y0 - 7, g, nc === 4 ? 'exs-t tc exc-k' : 'exs-m tc exc-k')));
      g2.forEach((g, r) => (grid += tt(x0 - 6, y0 + r * cs + cs / 2 + 4, g, `${nc === 4 ? 'exs-t' : 'exs-m'} ex-end tc exc-b`)));
      cells.forEach((c, k) => {
        const x = x0 + (k % nc) * cs;
        const y = y0 + Math.floor(k / nc) * cs;
        const bg = mode === 3 ? ['exc-g', 'exc-y', 'exc-g', 'exc-r', 'exc-r'][c.p] : mode === 2 ? ['exc-r', 'exc-k', 'exc-m'][c.p] : mode === 0 ? ['exc-y', 'exc-g'][c.p] : ['exc-y', 'exc-y', 'exc-g', 'exc-g'][c.p];
        grid += `<rect class="ex-fill ${bg}" style="opacity:.22" x="${x + 1}" y="${y + 1}" width="${cs - 2}" height="${cs - 2}" rx="5"/>${tt(x + cs / 2, y + (nc === 4 ? cs / 2 - 1 : cs / 2 - 4), c.g, nc === 4 ? 'exs-s tc' : 'exs-t')}${phIcon(mode, c.p, x + cs / 2, y + (nc === 4 ? cs - 8 : cs - 13), nc === 4 ? 4.5 : 7)}`;
      });
      // Расщепление по фенотипу.
      const nPh = PH_NAMES[mode].length;
      const cnt = Array(nPh).fill(0);
      for (const c of cells) cnt[c.p] += 1;
      const total = cells.length;
      const used = cnt.map((n, p) => [n, p]).filter(([n]) => n > 0);
      const gg = used.map(([n]) => n).reduce(gcd);
      const ratio = used.map(([n]) => n / gg).join(' : ');
      const gtCnt = {};
      for (const c of cells) gtCnt[c.g] = (gtCnt[c.g] ?? 0) + 1;
      const gts = Object.entries(gtCnt);
      const gg2 = gts.map(([, n]) => n).reduce(gcd);
      const lx = 196;
      let legend = `${box(lx - 10, 4, 130, 212)}${tt(lx + 55, 20, `${geno(i1, mode, true)} × ${geno(i2, mode, false)}`, 'exs-m')}${tt(lx + 55, 36, u('phenotypes', 'фенотипы', 'фенотиптер'), 'exs-s')}`;
      used.forEach(([n, p], k) => {
        const y = 52 + k * 27;
        legend += `${phIcon(mode, p, lx + 3, y + 1, 6.5)}${tt(lx + 14, y, tx(PH_NAMES[mode][p]), 'exs-s ex-start tc')}${tt(lx + 14, y + 12, `${n}/${total} = ${fmt((n / total) * 100, 1)}%`, 'exs-t ex-start')}`;
      });
      const ly = 52 + used.length * 27 + 4;
      legend += `${tt(lx + 55, ly + 4, ratio, 'exs-h')}`;
      if (mode !== 3) legend += `${tt(lx + 55, ly + 22, u('genotypes', 'генотипы', 'генотиптер'), 'exs-s')}${tt(lx + 55, ly + 36, gts.length <= 4 ? gts.map(([g]) => g).join(' : ') : `${gts.length} ${u('kinds', 'видов', 'түрі')}`, 'exs-s')}${tt(lx + 55, ly + 50, gts.length <= 4 ? gts.map(([, n]) => n / gg2).join(' : ') : '', 'exs-t')}`;
      const head = `${tt(x0 + (nc * cs) / 2, nc === 4 ? 18 : 26, u("mother's gametes", 'гаметы матери', 'аналық гаметалары'), 'exs-s')}${tt(x0 - 6, y0 - 7, u('father', 'отец', 'аталық'), 'exs-s ex-end')}`;
      const svg = `${head}${grid}${legend}`;
      const P1 = geno(i1, mode, true);
      const P2 = geno(i2, mode, false);
      let caption;
      if (mode === 0) {
        const law = P1 === 'Aa' && P2 === 'Aa' ? u("Mendel's 2nd law (segregation): 3 : 1 by phenotype, 1 : 2 : 1 by genotype.", 'второй закон Менделя (расщепление): 3 : 1 по фенотипу, 1 : 2 : 1 по генотипу.', 'Мендельдің 2-заңы (ажырау): фенотип бойынша 3 : 1, генотип бойынша 1 : 2 : 1.') : (P1 === 'AA' && P2 === 'aa') || (P1 === 'aa' && P2 === 'AA') ? u("Mendel's 1st law: all F₁ hybrids are the same (Aa, yellow).", 'первый закон Менделя: все гибриды F₁ одинаковы (Aa, жёлтые).', 'Мендельдің 1-заңы: барлық F₁ будандары бірдей (Aa, сары).') : (P1 === 'aa') !== (P2 === 'aa') && (P1 === 'Aa' || P2 === 'Aa') ? u('A test cross with aa shows the hidden a: 1 : 1.', 'анализирующее скрещивание с aa выявляет скрытый a: 1 : 1.', 'aa-мен талдаушы будандастыру жасырын a-ны көрсетеді: 1 : 1.') : '';
        caption = u(`${P1} × ${P2}: yellow (A_) ${cnt[0]}/4, green (aa) ${cnt[1]}/4. ${law}`, `${P1} × ${P2}: жёлтые (A_) ${cnt[0]}/4, зелёные (aa) ${cnt[1]}/4. ${law ? law[0].toUpperCase() + law.slice(1) : ''}`, `${P1} × ${P2}: сары (A_) ${cnt[0]}/4, жасыл (aa) ${cnt[1]}/4. ${law}`);
      } else if (mode === 1)
        caption = u(
          `${P1} × ${P2}: each parent gives 4 kinds of gametes, 16 combinations. A - yellow, a - green; B - smooth, b - wrinkled. Ratio ${ratio}.${P1 === 'AaBb' && P2 === 'AaBb' ? " Mendel's 3rd law: the genes are inherited independently, 9 : 3 : 3 : 1." : ''}`,
          `${P1} × ${P2}: каждый родитель даёт 4 вида гамет, всего 16 сочетаний. A - жёлтый, a - зелёный; B - гладкий, b - морщинистый. Расщепление ${ratio}.${P1 === 'AaBb' && P2 === 'AaBb' ? ' Третий закон Менделя: гены наследуются независимо, 9 : 3 : 3 : 1.' : ''}`,
          `${P1} × ${P2}: әр ата-ана 4 түрлі гамета береді, барлығы 16 үйлесім. A - сары, a - жасыл; B - тегіс, b - бүріскен. Ажырау ${ratio}.${P1 === 'AaBb' && P2 === 'AaBb' ? ' Мендельдің 3-заңы: гендер тәуелсіз тұқым қуалайды, 9 : 3 : 3 : 1.' : ''}`,
        );
      else if (mode === 2)
        caption = u(
          `Incomplete dominance (night beauty): AA - red, Aa - pink, aa - white. The heterozygote is in between, so the phenotype ratio equals the genotype ratio: ${ratio}.`,
          `Неполное доминирование (ночная красавица): AA - красные, Aa - розовые, aa - белые. Гетерозигота промежуточная, поэтому расщепление по фенотипу совпадает с генотипом: ${ratio}.`,
          `Толымсыз доминанттылық (түнгі сұлу): AA - қызыл, Aa - қызғылт, aa - ақ. Гетерозигота аралық, сондықтан фенотип бойынша ажырау генотиппен бірдей: ${ratio}.`,
        );
      else
        caption = u(
          `Haemophilia is recessive and on the X chromosome: Xᴴ - normal, Xʰ - haemophilia. A son gets X only from his mother, so one Xʰ makes him ill; a daughter with XᴴXʰ is a healthy carrier.`,
          `Гемофилия рецессивна и сцеплена с X-хромосомой: Xᴴ - норма, Xʰ - гемофилия. Сын получает X только от матери, и одной Xʰ хватает, чтобы он болел; дочь XᴴXʰ - здоровая носительница.`,
          `Гемофилия рецессивті және X-хромосомаға тіркескен: Xᴴ - қалыпты, Xʰ - гемофилия. Ұл X-ті тек анасынан алады, бір Xʰ оның ауыруына жетеді; XᴴXʰ қызы - сау тасымалдаушы.`,
        );
      if (task) {
        let ok;
        if (task.ph) ok = used.map(([n]) => n / gg).sort((a, b) => b - a).join(':') === task.ph.join(':');
        else if (task.gt) ok = gts.length === 1 && gts[0][0] === task.gt;
        else ok = cnt[3] === 0 && cnt[4] === 1 && cnt[2] === 1;
        const modeName = tx([L('monohybrid', 'моногибридное', 'моногибридті'), L('dihybrid', 'дигибридное', 'дигибридті'), L('incomplete dominance', 'неполное доминирование', 'толымсыз доминанттылық'), L('sex-linked', 'сцепленное с полом', 'жынысқа тіркескен')][mode]);
        caption = taskCap(
          `(${modeName}) ${tx(task.text)}.`,
          ok,
          u(`Now ${P1} × ${P2} gives ${ratio}. Change the parents.`, `Сейчас ${P1} × ${P2} даёт ${ratio}. Меняй родителей.`, `Қазір ${P1} × ${P2} ${ratio} береді. Ата-аналарды өзгерт.`),
          u(`${P1} × ${P2} gives ${ratio}.`, `${P1} × ${P2} даёт ${ratio}.`, `${P1} × ${P2} ${ratio} береді.`),
        );
        return { svg: svg + taskBadge(ok, 180, 214), caption };
      }
      return { svg, caption };
    },
  },

  photosynthesis: {
    title: L('Photosynthesis and its limiting factors', 'Фотосинтез и что его ограничивает', 'Фотосинтез және оны не шектейді'),
    intro: L('6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ in the light, in chloroplasts. The rate is set by the factor in shortest supply: light, CO₂ or temperature.', '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ на свету, в хлоропластах. Скорость задаёт фактор, которого меньше всего: свет, CO₂ или температура.', '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ жарықта, хлоропластарда. Жылдамдықты ең аз фактор анықтайды: жарық, CO₂ немесе температура.'),
    sliders: [
      { id: 'light', label: L('light, %', 'свет, %', 'жарық, %'), min: 0, max: 100, step: 1, value: 60, hidden: (v, st) => st.m === 2 && st.task.type !== 0 },
      { id: 'co2', label: 'CO₂, %', min: 0.01, max: 0.15, step: 0.005, value: 0.04, hidden: (v, st) => st.m === 2 && st.task.type !== 1 },
      { id: 't', label: 't, °C', min: 0, max: 50, step: 1, value: 25, hidden: (v, st) => st.m === 2 && st.task.type === 0 },
    ],
    buttons: [L('Leaf', 'Лист', 'Жапырақ'), L('Rate graph', 'График скорости', 'Жылдамдық графигі'), L('Night', 'Ночь', 'Түн'), TASK],
    state: () => ({ m: 0, ph: 0, task: null }),
    pressed: (i, v, st) => i === st.m || (i === 3 && st.m === 2),
    btnHidden: (i, v, st) => i === 2 && st.m === 2,
    onButton(i, st, v) {
      if (i === 2) return { light: v.light > 0 ? 0 : 70 };
      if (i < 2) {
        st.m = i;
        return null;
      }
      st.m = 2;
      st.task = psTask();
      const q = st.task;
      return { light: q.light, co2: q.co2, t: q.t };
    },
    live(dt, v, st) {
      st.ph += dt;
    },
    draw(v, step, st) {
      const { P, R } = psRate(v.light, v.co2, v.t);
      // Чистая скорость из округлённых процентов, чтобы в подписи сходилась арифметика.
      const net = (Math.round(P * 100) - Math.round(R * 100)) / 100;
      const bubbles = Math.round(Math.max(0, net) * 60);
      const lim = psLimit(v);
      const limName = [u('light', 'свет', 'жарық'), 'CO₂', u('temperature', 'температура', 'температура')];
      const L1 = v.light / 100;
      let svg;
      if (st.m === 1 || (st.m === 2 && st.task.type === 2)) {
        // График: по оси X - свет (или температура в задании про оптимум).
        const byT = st.m === 2;
        const sx = (x) => 40 + x * (byT ? 5.4 : 2.7);
        const sy = (y) => 186 - y * 160;
        const f = (x, c) => (byT ? psRate(v.light, c, x).net : psRate(x, c, v.t).net);
        const X1 = byT ? 50 : 100;
        let g = '';
        for (let x = 0; x <= X1; x += byT ? 10 : 20) g += `<line class="ex-grid" x1="${sx(x)}" y1="${sy(-0.1)}" x2="${sx(x)}" y2="${sy(1)}"/>${tt(sx(x), 200, String(x), 'exs-s')}`;
        const cur = byT ? v.t : v.light;
        const comp = byT ? null : psComp(v.co2, v.t);
        svg = `${g}<line class="ex-axis" x1="${sx(0)}" y1="${sy(0)}" x2="${sx(X1) + 4}" y2="${sy(0)}"/><line class="ex-axis" x1="${sx(0)}" y1="${sy(-0.1)}" x2="${sx(0)}" y2="${sy(1)}"/>
          ${tt(sx(X1), 213, byT ? 't, °C' : u('light, %', 'свет, %', 'жарық, %'), 'exs-s ex-end')}${tt(sx(0) - 4, sy(0) + 4, '0', 'exs-s ex-end')}${tt(sx(0) + 4, 14, u('O₂ output (net)', 'выделение O₂ (чистое)', 'O₂ бөлінуі (таза)'), 'exs-s ex-start')}
          ${byT ? '<g/>' : `<g class="ex-faint"><path class="ex-stroke exc-g ex-dash" style="stroke-width:1.5" d="${plot((x) => f(x, 0.15), 0, X1, sx, sy)}"/></g>${tt(sx(100) - 2, sy(f(100, 0.15)) - 5, 'CO₂ 0,15%', 'exs-s ex-end tc exc-g')}`}
          <path class="ex-curve" d="${plot((x) => f(x, v.co2), 0, X1, sx, sy)}"/>${byT ? '' : tt(sx(100) - 2, sy(f(100, v.co2)) - 6, `CO₂ ${fmt(v.co2, 3)}%`, 'exs-s ex-end tc exc-p')}
          ${comp !== null && !byT ? `<circle class="ex-fill exc-r" cx="${n1(sx(comp))}" cy="${n1(sy(0))}" r="3.5"/>${tt(sx(comp) + 5, sy(0) - 7, u('compensation point', 'точка компенсации', 'компенсация нүктесі'), 'exs-s ex-start tc exc-r')}` : '<g/><g/>'}
          ${ln(sx(cur), sy(f(cur, v.co2)), sx(cur), sy(0), 'exc-o ex-dash', 1.2)}<circle class="ex-dot" cx="${n1(sx(cur))}" cy="${n1(sy(f(cur, v.co2)))}" r="5"/>
          ${box(196, 124, 120, 48)}${tt(256, 140, `${u('net', 'чистая', 'таза')}: ${fmt(net * 100, 0)}%`, 'exs-t')}${tt(256, 155, `${u('gross', 'общая', 'жалпы')} ${fmt(P * 100, 0)}% − ${u('resp.', 'дыхание', 'тыныс')} ${fmt(R * 100, 0)}%`, 'exs-s')}${tt(256, 167, lim >= 0 ? `${u('limited by', 'ограничивает', 'шектейді')}: ${limName[lim]}` : u('no limit', 'всё в норме', 'шектеу жоқ'), 'exs-s tc exc-o')}`;
      } else {
        const rays = Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return `<line x1="${n1(34 + 17 * Math.cos(a))}" y1="${n1(34 + 17 * Math.sin(a))}" x2="${n1(34 + 25 * Math.cos(a))}" y2="${n1(34 + 25 * Math.sin(a))}"/>`;
        }).join('');
        const nb = Math.round(clamp(net, 0, 1) * 9);
        const bub = Array.from({ length: nb }, (_, i) => {
          const k = (st.ph * (0.3 + net) + i / Math.max(nb, 1)) % 1;
          return `<circle class="ex-bubble" cx="${n1(258 + 7 * Math.sin(k * 9 + i))}" cy="${n1(96 - k * 70)}" r="${n1(2.5 + 2.5 * k)}" opacity="${n1((1 - k) * 100) / 100}"/>`;
        }).join('');
        const th = clamp(v.t / 50, 0, 1);
        svg = `<g class="ex-sun" opacity="${n1((0.15 + 0.85 * L1) * 100) / 100}"><circle cx="34" cy="34" r="13"/><g class="ex-rays">${rays}</g></g>
          ${L1 > 0 ? `<g class="exc-y" opacity="${n1((0.3 + 0.7 * L1) * 100) / 100}">${arrow(56, 50, 104, 84, '', 1 + 3 * L1)}</g>` : '<g/>'}${tt(60, 76, `${u('light', 'свет', 'жарық')} ${fmt(v.light, 0)}%`, 'exs-s ex-end')}
          <path class="ex-leaf" style="opacity:${n1((0.4 + 0.6 * clamp(P, 0, 1)) * 100) / 100}" d="M92 150 Q150 58 246 92 Q196 182 92 150 Z"/><path class="ex-vein" d="M92 150 Q170 120 246 92"/>
          <ellipse cx="170" cy="122" rx="20" ry="10" class="ex-fill exc-g" style="opacity:.9;stroke:var(--card);stroke-width:1"/>${[0, 1, 2].map((k) => `<rect x="${159 + k * 8}" y="117" width="5" height="10" rx="1" class="ex-fill" style="color:color-mix(in srgb, var(--green) 50%, #000)"/>`).join('')}${tt(170, 145, u('chloroplast', 'хлоропласт', 'хлоропласт'), 'exs-s exs-on')}
          ${arrow(8, 186, 98, 150, 'exc-m', 1 + 4 * (v.co2 / 0.15))}${tt(10, 176, `CO₂ ${fmt(v.co2, 3)}%`, 'exs-t ex-start')}
          ${arrow(150, 214, 150, 160, 'exc-b', 2.5)}${tt(156, 206, `H₂O ${u('from roots', 'из корней', 'тамырдан')}`, 'exs-s ex-start tc exc-b')}
          ${net > 0 ? arrow(236, 96, 262, 70, 'exc-g', 1 + 4 * clamp(net, 0, 1)) : arrow(268, 70, 240, 96, 'exc-r', 2)}${bub}${tt(264, 20, net > 0 ? `O₂ ↑ ${bubbles} ${u('bubbles/min', 'пуз./мин', 'көпіршік/мин')}` : u('O₂ is taken in', 'O₂ поглощается', 'O₂ сіңіріледі'), `exs-t tc ${net > 0 ? 'exc-g' : 'exc-r'}`)}
          ${arrow(210, 140, 236, 176, 'exc-o', 1 + 3 * clamp(P, 0, 1))}${tt(250, 192, `C₆H₁₂O₆ ${fmt(P * 100, 0)}%`, 'exs-t tc exc-o')}
          <rect class="ex-thermo" x="296" y="110" width="10" height="70" rx="5"/><rect x="298" y="${n1(178 - 66 * th)}" width="6" height="${n1(66 * th)}" rx="3" class="ex-fill exc-r"/>${tt(301, 196, `${fmt(v.t, 0)} °C`, 'exs-s')}`;
      }
      let caption;
      if (v.light < 0.5) caption = u('No light - no photosynthesis. The plant only breathes: it takes in O₂ and gives out CO₂, day and night.', 'Нет света - нет фотосинтеза. Растение только дышит: поглощает O₂ и выделяет CO₂ (дышит оно и днём, и ночью).', 'Жарық жоқ - фотосинтез жоқ. Өсімдік тек тыныс алады: O₂ сіңіріп, CO₂ бөледі (күндіз де, түнде де тыныс алады).');
      else
        caption = u(
          `Photosynthesis ${fmt(P * 100, 0)}%, respiration ${fmt(R * 100, 0)}%: net ${net > 0 ? `+${fmt(net * 100, 0)}% - the leaf gives out O₂` : `${fmt(net * 100, 0)}% - less than breathing, O₂ is taken in`}. ${lim >= 0 ? `Now the limiting factor is ${limName[lim]}: adding it speeds things up most.` : 'All factors are near their best.'}${v.t > 40 ? ' Above 40 °C the enzymes are damaged.' : ''}`,
          `Фотосинтез ${fmt(P * 100, 0)}%, дыхание ${fmt(R * 100, 0)}%: итого ${net > 0 ? `+${fmt(net * 100, 0)}% - лист выделяет O₂` : `${fmt(net * 100, 0)}% - меньше дыхания, O₂ поглощается`}. ${lim >= 0 ? `Сейчас ограничивает ${limName[lim]}: если добавить его, скорость вырастет сильнее всего.` : 'Все факторы близки к лучшим.'}${v.t > 40 ? ' Выше 40 °C разрушаются ферменты.' : ''}`,
          `Фотосинтез ${fmt(P * 100, 0)}%, тыныс алу ${fmt(R * 100, 0)}%: барлығы ${net > 0 ? `+${fmt(net * 100, 0)}% - жапырақ O₂ бөледі` : `${fmt(net * 100, 0)}% - тыныс алудан аз, O₂ сіңіріледі`}. ${lim >= 0 ? `Қазір шектейтін фактор - ${limName[lim]}: оны қоссаң, жылдамдық ең көп өседі.` : 'Барлық фактор ең жақсысына жақын.'}${v.t > 40 ? ' 40 °C-тан жоғары ферменттер бұзылады.' : ''}`,
        );
      if (st.m === 2) {
        const q = st.task;
        let ok;
        let goal;
        let done;
        if (q.type === 0) {
          ok = v.light >= q.Lc - 0.01 && v.light <= q.Lc + 2.5;
          goal = u(`CO₂ ${fmt(q.co2, 2)}%, ${q.t} °C. Find the least light at which the leaf starts to give out O₂ (compensation point).`, `CO₂ ${fmt(q.co2, 2)}%, ${q.t} °C. Найди наименьший свет, при котором лист начинает выделять O₂ (точка компенсации).`, `CO₂ ${fmt(q.co2, 2)}%, ${q.t} °C. Жапырақ O₂ бөле бастайтын ең аз жарықты тап (компенсация нүктесі).`);
          done = u(`At ≈ ${fmt(q.Lc, 0)}% light photosynthesis equals respiration.`, `При ≈ ${fmt(q.Lc, 0)}% света фотосинтез равен дыханию.`, `≈ ${fmt(q.Lc, 0)}% жарықта фотосинтез тыныс алуға тең.`);
        } else if (q.type === 1) {
          ok = P >= 0.9 * psRate(80, 0.15, 27).P;
          goal = u('the light is fixed at 80%. Make photosynthesis at least 90% of the best possible.', 'свет 80% менять нельзя. Подними фотосинтез хотя бы до 90% от наилучшего.', 'жарық 80%, оны өзгертуге болмайды. Фотосинтезді ең жақсысының кемінде 90%-ына жеткіз.');
          done = u('More CO₂ (as in greenhouses) and a warm 25-30 °C.', 'Больше CO₂ (как в теплицах) и тепло 25-30 °C.', 'CO₂ көбірек (жылыжайлардағыдай) және 25-30 °C жылу.');
        } else {
          ok = near(v.t, 27, 2);
          goal = u('find the optimal temperature for photosynthesis (the top of the curve).', 'найди оптимальную температуру фотосинтеза (вершину кривой).', 'фотосинтездің оңтайлы температурасын тап (қисықтың шыңы).');
          done = u('About 25-30 °C. Colder - enzymes are slow, hotter than 40 °C - they are destroyed.', 'Около 25-30 °C. Холоднее - ферменты медленные, выше 40 °C - разрушаются.', 'Шамамен 25-30 °C. Суықта ферменттер баяу, 40 °C-тан жоғары - бұзылады.');
        }
        caption = taskCap(goal, ok, u(`Now net ${fmt(net * 100, 0)}%.`, `Сейчас итог ${fmt(net * 100, 0)}%.`, `Қазір барлығы ${fmt(net * 100, 0)}%.`), done);
        return { svg: svg + taskBadge(ok, 318, 212), caption };
      }
      return { svg, caption };
    },
  },

  gas: {
    title: L('Gas laws: isotherm, isobar, isochore', 'Газовые законы: изотерма, изобара, изохора', 'Газ заңдары: изотерма, изобара, изохора'),
    intro: L('For a fixed amount of gas pV = νRT. Keep one of p, V, T constant and see how the other two change.', 'Для данного количества газа pV = νRT. Оставь одну из величин p, V, T постоянной и смотри, как меняются две другие.', 'Газдың берілген мөлшері үшін pV = νRT. p, V, T шамаларының бірін тұрақты қалдырып, қалған екеуінің өзгерісін бақыла.'),
    sliders: [
      { id: 'V', label: L('V, L', 'V, л', 'V, л'), min: 1, max: 4, step: 0.05, value: 2, hidden: (v, st) => st.mode === 1 || st.mode === 2 },
      { id: 'T', label: L('T, K', 'T, К', 'T, К'), min: 150, max: 600, step: 1, value: 300, hidden: (v, st) => st.mode === 0 },
    ],
    buttons: [L('T = const', 'T = const', 'T = const'), L('p = const', 'p = const', 'p = const'), L('V = const', 'V = const', 'V = const'), TASK],
    state: () => {
      let seed = 7;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      return { m: 0, mode: 0, p0: 100, task: null, mol: Array.from({ length: 26 }, () => ({ x: rnd(), y: rnd(), a: rnd() * Math.PI * 2 })) };
    },
    pressed: (i, v, st) => (st.m === 3 ? i === 3 : i === st.mode),
    onButton(i, st, v) {
      if (i < 3) {
        st.m = i;
        st.mode = i;
        st.p0 = gasP(v.V, v.T);
        return null;
      }
      st.m = 3;
      st.task = gasTask();
      st.mode = st.task.type;
      st.p0 = st.task.p0 ?? 100;
      return { V: st.task.V0, T: st.task.T0 };
    },
    live(dt, v, st) {
      const sp = 0.9 * Math.sqrt(v.T / 300);
      for (const p of st.mol) {
        p.x += Math.cos(p.a) * sp * dt;
        p.y += Math.sin(p.a) * sp * dt * 1.6;
        if (p.x < 0 || p.x > 1) (p.x = clamp(p.x, 0, 1)), (p.a = Math.PI - p.a);
        if (p.y < 0 || p.y > 1) (p.y = clamp(p.y, 0, 1)), (p.a = -p.a);
      }
    },
    draw(v, step, st) {
      // Изобара: объём следует за температурой.
      if (st.mode === 1) v.V = clamp((GAS_NU * 8.31 * v.T) / st.p0, 1, 4);
      const p = gasP(v.V, v.T);
      const h = v.V * 40;
      const top = 200 - h;
      const hue = Math.round(220 - ((v.T - 150) / 450) * 220);
      const mol = st.mol.map((m) => `<circle cx="${n1(22 + m.x * 96)}" cy="${n1(198 - m.y * (h - 6))}" r="3.3" style="fill:hsl(${hue} 80% 55%)"/>`).join('');
      // График процесса.
      const gx0 = 168;
      const gy0 = 186;
      let graph;
      let xl;
      let yl;
      if (st.mode === 0) {
        const sx = (V) => gx0 + (V - 0.5) * 38;
        const sy = (pp) => gy0 - pp * 0.36;
        graph = `${[200, 300, 450].map((T) => `<path class="ex-stroke exc-m ex-faint" style="stroke-width:1" d="${plot((V) => sy(gasP(V, T)), 0.9, 4, sx, (y) => y)}"/>`).join('')}<path class="ex-curve" d="${plot((V) => sy(gasP(V, v.T)), 0.9, 4, sx, (y) => y)}"/><circle class="ex-dot" cx="${n1(sx(v.V))}" cy="${n1(clamp(sy(p), 10, 190))}" r="5"/>${tt(312, sy(gasP(4, v.T)) - 8, `T = ${fmt(v.T, 0)} ${u('K', 'К', 'К')}`, 'exs-s ex-end tc exc-p')}${[1, 2, 3, 4].map((V) => tt(sx(V), gy0 + 12, String(V), 'exs-s')).join('')}`;
        xl = `V, ${UN.L()}`;
        yl = `p, ${UN.kPa()}`;
      } else {
        const sx = (T) => gx0 + T * 0.24;
        const isoP = st.mode === 2;
        const y = isoP ? p : v.V;
        const sy = isoP ? (pp) => gy0 - pp * 0.36 : (V) => gy0 - V * 40;
        const k = isoP ? p / v.T : v.V / v.T;
        graph = `${ln(sx(0), sy(0), sx(150), sy(k * 150), 'exc-m ex-dash', 1.2)}${ln(sx(150), sy(k * 150), sx(600), sy(k * 600), 'exc-p', 3)}<circle class="ex-dot" cx="${n1(sx(v.T))}" cy="${n1(clamp(sy(y), 10, 190))}" r="5"/>${[0, 300, 600].map((T) => tt(sx(T), gy0 + 12, String(T), 'exs-s')).join('')}`;
        xl = `T, ${u('K', 'К', 'К')}`;
        yl = isoP ? `p, ${UN.kPa()}` : `V, ${UN.L()}`;
      }
      const law = [u('Boyle-Mariotte: pV = const', 'Бойль-Мариотт: pV = const', 'Бойль-Мариотт: pV = const'), u('Gay-Lussac: V/T = const', 'Гей-Люссак: V/T = const', 'Гей-Люссак: V/T = const'), u('Charles: p/T = const', 'Шарль: p/T = const', 'Шарль: p/T = const')][st.mode];
      const svg = `<path class="ex-cyl" d="M18 26 V202 H122 V26"/><rect class="ex-piston" x="20" y="${n1(top - 10)}" width="100" height="10" rx="3"/><line class="ex-rod" x1="70" y1="${n1(top - 10)}" x2="70" y2="4"/>${mol}
        ${tt(98, top - 16, `V = ${fmt(v.V, 2)} ${UN.L()}`, 'exs-t')}
        ${box(126, 4, 40, 60)}${tt(146, 18, 'p', 'exs-s')}${tt(146, 33, fmt(p, 0), 'exs-t tc exc-r')}${tt(146, 46, UN.kPa(), 'exs-s')}${tt(146, 59, `${fmt(p / 101.3, 2)} ${u('atm', 'атм', 'атм')}`, 'exs-s')}
        ${box(126, 150, 40, 52)}${tt(146, 165, 'T', 'exs-s')}${tt(146, 180, fmt(v.T, 0), 'exs-t tc exc-o')}${tt(146, 195, `${fmt(v.T - 273, 0)} °C`, 'exs-s')}
        <line class="ex-axis" x1="${gx0}" y1="${gy0}" x2="316" y2="${gy0}"/><line class="ex-axis" x1="${gx0}" y1="${gy0}" x2="${gx0}" y2="14"/>${tt(316, 212, xl, 'exs-s ex-end')}${tt(gx0 + 4, 14, yl, 'exs-s ex-start')}
        ${graph}${tt(242, 30, law, 'exs-s tc exc-p')}`;
      const nm = [u('isothermal', 'изотермический', 'изотермиялық'), u('isobaric', 'изобарный', 'изобаралық'), u('isochoric', 'изохорный', 'изохоралық')][st.mode];
      let caption = [
        u(`Isothermal process (T = ${fmt(v.T, 0)} K): pV = ${fmt(p, 1)} · ${fmt(v.V, 2)} = ${fmt(p * v.V, 0)} kPa·L stays constant. Squeeze the gas 2 times - the molecules hit the walls 2 times more often, p doubles.`, `Изотермический процесс (T = ${fmt(v.T, 0)} К): pV = ${fmt(p, 1)} · ${fmt(v.V, 2)} = ${fmt(p * v.V, 0)} кПа·л не меняется. Сожми газ в 2 раза - молекулы бьют о стенки в 2 раза чаще, p вдвое больше.`, `Изотермиялық процесс (T = ${fmt(v.T, 0)} К): pV = ${fmt(p, 1)} · ${fmt(v.V, 2)} = ${fmt(p * v.V, 0)} кПа·л өзгермейді. Газды 2 есе сықсаң - молекулалар қабырғаға 2 есе жиі соғылады, p екі есе артады.`),
        u(`Isobaric process (p = ${fmt(p, 0)} kPa): V/T = ${fmt(v.V, 2)} / ${fmt(v.T, 0)} = ${fmt((v.V / v.T) * 1000, 2)}·10⁻³ L/K. Heat the gas - it expands and pushes the piston up.`, `Изобарный процесс (p = ${fmt(p, 0)} кПа): V/T = ${fmt(v.V, 2)} / ${fmt(v.T, 0)} = ${fmt((v.V / v.T) * 1000, 2)}·10⁻³ л/К. Нагреваешь газ - он расширяется и поднимает поршень.`, `Изобаралық процесс (p = ${fmt(p, 0)} кПа): V/T = ${fmt(v.V, 2)} / ${fmt(v.T, 0)} = ${fmt((v.V / v.T) * 1000, 2)}·10⁻³ л/К. Газды қыздырсаң - ол ұлғайып, поршеньді көтереді.`),
        u(`Isochoric process (V = ${fmt(v.V, 2)} L): p/T = ${fmt(p, 0)} / ${fmt(v.T, 0)} = ${fmt(p / v.T, 3)} kPa/K. The piston is fixed: faster molecules hit harder, so p grows with T.`, `Изохорный процесс (V = ${fmt(v.V, 2)} л): p/T = ${fmt(p, 0)} / ${fmt(v.T, 0)} = ${fmt(p / v.T, 3)} кПа/К. Поршень закреплён: быстрые молекулы бьют сильнее, и p растёт вместе с T.`, `Изохоралық процесс (V = ${fmt(v.V, 2)} л): p/T = ${fmt(p, 0)} / ${fmt(v.T, 0)} = ${fmt(p / v.T, 3)} кПа/К. Поршень бекітілген: жылдам молекулалар қатты соғады, p T-мен бірге өседі.`),
      ][st.mode];
      if (st.m === 3) {
        const q = st.task;
        let ok;
        let goal;
        let done;
        if (q.type === 0) {
          ok = near(v.V, q.ans, 0.03);
          goal = u(`${nm} process at 300 K. Change the volume so that the pressure becomes ${fmt(q.p, 0)} kPa.`, `${nm} процесс при 300 К. Измени объём так, чтобы давление стало ${fmt(q.p, 0)} кПа.`, `300 К-дегі ${nm} процесс. Қысым ${fmt(q.p, 0)} кПа болатындай көлемді өзгерт.`);
          done = `p₁V₁ = p₂V₂: V₂ = ${fmt(gasP(q.V0, 300), 0)} · ${q.V0} / ${fmt(q.p, 0)} = ${fmt(q.ans, 2)} ${UN.L()}.`;
        } else if (q.type === 1) {
          ok = near(v.T, q.ans, 3);
          goal = u(`${nm} process at 100 kPa. Bring the volume to ${fmt(q.V1, 2)} L.`, `${nm} процесс при 100 кПа. Доведи объём до ${fmt(q.V1, 2)} л.`, `100 кПа-дағы ${nm} процесс. Көлемді ${fmt(q.V1, 2)} л-ге жеткіз.`);
          done = `V₁/T₁ = V₂/T₂: T₂ = ${q.T0} · ${fmt(q.V1, 2)} / ${fmt(q.V0, 2)} = ${q.ans} ${u('K', 'К', 'К')}.`;
        } else {
          ok = near(v.T, q.ans, 3);
          goal = u(`${nm} process, V = 2 L. At what temperature is the pressure ${fmt(q.p, 0)} kPa?`, `${nm} процесс, V = 2 л. При какой температуре давление станет ${fmt(q.p, 0)} кПа?`, `${nm} процесс, V = 2 л. Қандай температурада қысым ${fmt(q.p, 0)} кПа болады?`);
          done = `p₁/T₁ = p₂/T₂: T₂ = ${q.T0} · ${fmt(q.p, 0)} / ${fmt(gasP(2, q.T0), 0)} = ${q.ans} ${u('K', 'К', 'К')}.`;
        }
        caption = taskCap(goal, ok, u(`Now p = ${fmt(p, 0)} kPa, V = ${fmt(v.V, 2)} L, T = ${fmt(v.T, 0)} K.`, `Сейчас p = ${fmt(p, 0)} кПа, V = ${fmt(v.V, 2)} л, T = ${fmt(v.T, 0)} К.`, `Қазір p = ${fmt(p, 0)} кПа, V = ${fmt(v.V, 2)} л, T = ${fmt(v.T, 0)} К.`), done);
        return { svg: svg + taskBadge(ok, 316, 46), caption };
      }
      return { svg, caption };
    },
  },

  pendulum: {
    title: L('Pendulum period', 'Период маятника', 'Маятник периоды'),
    intro: L('T = 2π√(l/g): the period depends on the length and gravity only - not on the mass and (for small swings) not on the amplitude.', 'T = 2π√(l/g): период зависит только от длины и g - не от массы и (при малых размахах) не от амплитуды.', 'T = 2π√(l/g): период тек ұзындық пен g-ге тәуелді - массаға және (кіші тербелісте) амплитудаға тәуелді емес.'),
    sliders: [
      { id: 'l', label: L('length l, m', 'длина l, м', 'ұзындық l, м'), min: 0.1, max: 2.5, step: 0.01, value: 1.5 },
      { id: 'm', label: L('mass m, kg', 'масса m, кг', 'масса m, кг'), min: 0.1, max: 2, step: 0.1, value: 0.5, hidden: (v, st) => st.m === 1 },
      { id: 'th', label: L('amplitude, °', 'амплитуда, °', 'амплитуда, °'), min: 3, max: 30, step: 1, value: 15, hidden: (v, st) => st.m === 1 },
    ],
    buttons: [L('Planet ↻', 'Планета ↻', 'Ғаламшар ↻'), L('Compare with l/4', 'Сравнить с l/4', 'l/4-пен салыстыру'), TASK, FREE],
    state: () => ({ p: 0, cmp: false, m: 0, time: 0, task: null }),
    pressed: (i, v, st) => (i === 1 && st.cmp) || (i === 2 && st.m === 1),
    btnHidden: (i, v, st) => (i === 3 ? st.m !== 1 : st.m === 1 && i < 2),
    onButton(i, st) {
      st.time = 0;
      if (i === 0) st.p = (st.p + 1) % 3;
      else if (i === 1) st.cmp = !st.cmp;
      else if (i === 3) st.m = 0;
      else {
        st.m = 1;
        st.cmp = false;
        st.task = pendTask(PLANETS[st.p].g);
        return { l: 0.3 };
      }
      return null;
    },
    live(dt, v, st) {
      st.time += dt;
    },
    draw(v, step, st) {
      const P = PLANETS[st.p];
      const g = P.g;
      const T = 2 * Math.PI * Math.sqrt(v.l / g);
      const w = (2 * Math.PI) / T;
      const th0 = rad(v.th);
      const sc = 72;
      const px = st.cmp ? 110 : 128;
      const py = 14;
      const bob = (l, ph, cls, r) => {
        const th = th0 * Math.cos(ph);
        const L1 = l * sc;
        const bx = px + L1 * Math.sin(th);
        const by = py + L1 * Math.cos(th);
        const arc = `M${n1(px - L1 * Math.sin(th0))} ${n1(py + L1 * Math.cos(th0))} A${n1(L1)} ${n1(L1)} 0 0 0 ${n1(px + L1 * Math.sin(th0))} ${n1(py + L1 * Math.cos(th0))}`;
        return `<path class="ex-stroke exc-m ex-dash" style="stroke-width:1" d="${arc}"/><line class="ex-rad" x1="${px}" y1="${py}" x2="${n1(bx)}" y2="${n1(by)}"/><circle class="ex-fill ${cls}" cx="${n1(bx)}" cy="${n1(by)}" r="${r}" style="stroke:var(--card);stroke-width:2"/>`;
      };
      const ph = w * st.time;
      const r = 6 + v.m * 3;
      let pend = `${ln(px - 40, py, px + 40, py, 'exc-m', 3)}${ln(px, py, px, py + v.l * sc + 10, 'exc-m ex-faint', 1)}${bob(v.l, ph, 'exc-o', r)}`;
      const T4 = T / 2;
      if (st.cmp) pend += bob(v.l / 4, (2 * Math.PI * st.time) / T4, 'exc-b', r);
      // Энергия: доля Eк и Eп в данный момент.
      const ep = Math.cos(ph) ** 2;
      const vmax = Math.sqrt(2 * g * v.l * (1 - Math.cos(th0)));
      const n = Math.floor(st.time / T);
      const info = `${box(206, 4, 110, 132)}${tt(212, 18, `${tx(P.name)}: g = ${fmt(g, 2)}`, 'exs-t ex-start')}${tt(212, 36, `T = ${fmt(T, 2)} ${UN.s()}`, 'exs-h ex-start tc exc-o')}${tt(212, 52, `ν = 1/T = ${fmt(1 / T, 2)} ${UN.Hz()}`, 'exs-t ex-start')}
        ${st.cmp ? tt(212, 68, `l/4: T = ${fmt(T4, 2)} ${UN.s()}`, 'exs-t ex-start tc exc-b') : tt(212, 68, `${u('v at bottom', 'v внизу', 'v төменде')} = ${fmt(vmax, 2)} ${UN.ms()}`, 'exs-t ex-start')}
        ${tt(212, 86, `t = ${fmt(st.time, 1)} ${UN.s()} · ${n} ${u('osc.', 'кол.', 'терб.')}`, 'exs-s ex-start')}
        <rect x="212" y="96" width="${n1(98 * (1 - ep))}" height="9" rx="3" class="ex-fill exc-o"/><rect x="${n1(212 + 98 * (1 - ep))}" y="96" width="${n1(98 * ep)}" height="9" rx="3" class="ex-fill exc-b"/>${tt(212, 118, u('KE', 'Eк', 'Eк'), 'exs-s ex-start tc exc-o')}${tt(310, 118, u('PE', 'Eп', 'Eп'), 'exs-s ex-end tc exc-b')}${tt(261, 130, `E = ${fmt(v.m * g * v.l * (1 - Math.cos(th0)), 3)} ${UN.J()}`, 'exs-s')}`;
      const svg = `${pend}${info}${tt(px, 214, `l = ${fmt(v.l, 2)} ${UN.m()}, m = ${fmt(v.m, 1)} ${UN.kg()}`, 'exs-t')}`;
      let caption = u(
        `T = 2π√(l/g) = 2π√(${fmt(v.l, 2)} / ${fmt(g, 2)}) = ${fmt(T, 2)} s. ${st.cmp ? `A pendulum 4 times shorter swings 2 times faster: T = ${fmt(T4, 2)} s.` : `The mass ${fmt(v.m, 1)} kg does not matter: change it - T stays the same. At the bottom all energy is kinetic, at the ends - potential.`}`,
        `T = 2π√(l/g) = 2π√(${fmt(v.l, 2)} / ${fmt(g, 2)}) = ${fmt(T, 2)} с. ${st.cmp ? `Маятник в 4 раза короче качается в 2 раза чаще: T = ${fmt(T4, 2)} с.` : `Масса ${fmt(v.m, 1)} кг не важна: измени её - T не изменится. Внизу вся энергия кинетическая, в крайних точках - потенциальная.`}`,
        `T = 2π√(l/g) = 2π√(${fmt(v.l, 2)} / ${fmt(g, 2)}) = ${fmt(T, 2)} с. ${st.cmp ? `4 есе қысқа маятник 2 есе жиі тербеледі: T = ${fmt(T4, 2)} с.` : `${fmt(v.m, 1)} кг масса маңызды емес: өзгертсең де T өзгермейді. Төменде энергия толық кинетикалық, шеткі нүктелерде - потенциалдық.`}`,
      );
      if (st.m === 1) {
        const q = st.task;
        const ok = near(T, q.T, 0.02);
        caption = taskCap(
          u(`on ${tx(P.name)} (g = ${fmt(g, 2)} m/s²) make a pendulum with period T = ${fmt(q.T, 1)} s.`, `на планете ${tx(P.name)} (g = ${fmt(g, 2)} м/с²) сделай маятник с периодом T = ${fmt(q.T, 1)} с.`, `${tx(P.name)} ғаламшарында (g = ${fmt(g, 2)} м/с²) периоды T = ${fmt(q.T, 1)} с маятник жаса.`),
          ok,
          u(`Now T = ${fmt(T, 2)} s. Longer string - longer period.`, `Сейчас T = ${fmt(T, 2)} с. Длиннее нить - больше период.`, `Қазір T = ${fmt(T, 2)} с. Жіп ұзын болса - период үлкен.`),
          `l = gT² / 4π² = ${fmt(g, 2)} · ${fmt(q.T, 1)}² / 39,48 ≈ ${fmt(q.l, 2)} ${UN.m()}.`,
        );
        return { svg: svg + taskBadge(ok, 316, 154), caption };
      }
      return { svg, caption };
    },
  },
  'sine-wave': {
    title: L('Waves: amplitude, frequency, phase', 'Волна: амплитуда, частота, фаза', 'Толқын: амплитуда, жиілік, фаза'),
    intro: L('y = A·sin(2π·f·t + φ). A is the height of the crest, f is how many waves fit in one second, φ shifts the wave sideways.', 'y = A·sin(2π·f·t + φ). A - высота гребня, f - сколько волн умещается за секунду, φ сдвигает волну вбок.', 'y = A·sin(2π·f·t + φ). A - толқын жотасының биіктігі, f - бір секундта неше толқын сыяды, φ толқынды бүйірге ығыстырады.'),
    sliders: [
      { id: 'A', label: 'A', min: 0.2, max: 2, step: C, value: 1 },
      { id: 'f', label: L('f, Hz', 'f, Гц', 'f, Гц'), min: 0.25, max: 3, step: C, value: 1 },
      { id: 'ph', label: 'φ, °', min: 0, max: 360, step: C, value: 0 },
    ],
    buttons: [L('▶ Shift the phase', '▶ Сдвигать фазу', '▶ Фазаны ығыстыру')],
    play: 'ph',
    playDur: 3000,
    playLinear: true,
    draw(v) {
      const sx = (tt) => 20 + tt * 145;
      const sy = (y) => 110 - y * 40;
      const w = (tt) => v.A * Math.sin(2 * Math.PI * v.f * tt + (v.ph * Math.PI) / 180);
      const T = 1 / v.f;
      const tc = ((((0.25 - v.ph / 360) % 1) + 1) % 1) * T;
      const top = sy(v.A);
      const t2 = tc + T <= 2 ? tc + T : tc - T;
      const [ta, tb] = [Math.min(tc, t2), Math.max(tc, t2)];
      return {
        svg: `<line class="ex-axis" x1="20" y1="110" x2="312" y2="110"/><line class="ex-axis" x1="20" y1="20" x2="20" y2="200"/>
          ${[0, 0.5, 1, 1.5, 2].map((s) => `<text class="ex-tiny" x="${sx(s)}" y="212">${fmt(s, 1)}</text>`).join('')}
          <path class="ex-stroke exc-m" style="opacity:.35;stroke-width:1.5" d="${plot((tt) => Math.sin(2 * Math.PI * tt), 0, 2, sx, sy, 160)}"/>
          <path class="ex-curve" d="${plot(w, 0, 2, sx, sy, 240)}"/>
          ${arrow(sx(tc), 110, sx(tc), top, 'exc-k', 2)}<text class="ex-tag tc exc-k" x="${n1(sx(tc) + 5)}" y="${n1((110 + top) / 2 + 4)}">A</text>
          ${ta >= 0 && tb <= 2.001 ? `<g class="exc-o"><line class="ex-stroke" style="stroke-width:1.5" x1="${n1(sx(ta))}" y1="${n1(top - 8)}" x2="${n1(sx(tb))}" y2="${n1(top - 8)}"/></g><text class="ex-tag tc exc-o" x="${n1(sx(ta) + 4)}" y="${n1(top - 13)}">T = ${fmt(T)} ${u('s', 'с', 'с')}</text>` : '<g/><g/>'}`,
        caption: L(
          `A = ${fmt(v.A)}: the crest rises ${fmt(v.A)} above the middle line. f = ${fmt(v.f)} Hz: ${fmt(v.f)} waves per second, so one wave lasts T = 1/f = ${fmt(T)} s. φ = ${fmt(v.ph)}° shifts the wave by ${fmt(v.ph / 360)} of a period. The grey wave is A = 1, f = 1, φ = 0.`,
          `A = ${fmt(v.A)}: гребень поднимается на ${fmt(v.A)} над средней линией. f = ${fmt(v.f)} Гц: ${fmt(v.f)} волны в секунду, значит одна волна длится T = 1/f = ${fmt(T)} с. φ = ${fmt(v.ph)}° сдвигает волну на ${fmt(v.ph / 360)} периода. Серая волна - A = 1, f = 1, φ = 0.`,
          `A = ${fmt(v.A)}: жота орта сызықтан ${fmt(v.A)}-ге көтеріледі. f = ${fmt(v.f)} Гц: секундына ${fmt(v.f)} толқын, демек бір толқын T = 1/f = ${fmt(T)} с созылады. φ = ${fmt(v.ph)}° толқынды периодтың ${fmt(v.ph / 360)} бөлігіне ығыстырады. Сұр толқын - A = 1, f = 1, φ = 0.`,
        ),
      };
    },
  },

  ph: {
    title: L('The pH scale', 'Шкала pH', 'pH шкаласы'),
    intro: L('pH shows how acidic or alkaline a solution is: below 7 - acid, 7 - neutral, above 7 - alkali. One step on the scale means 10 times more or fewer H⁺ ions.', 'pH показывает, насколько раствор кислый или щелочной: меньше 7 - кислота, 7 - нейтральный, больше 7 - щёлочь. Шаг шкалы на 1 - это в 10 раз больше или меньше ионов H⁺.', 'pH ерітіндінің қаншалықты қышқыл не сілтілі екенін көрсетеді: 7-ден аз - қышқыл, 7 - бейтарап, 7-ден көп - сілті. Шкаладағы 1 қадам - H⁺ иондары 10 есе көп не аз деген сөз.'),
    sliders: [{ id: 'pH', label: 'pH', min: 0, max: 14, step: C, value: 7 }],
    buttons: [L('Lemon juice', 'Лимонный сок', 'Лимон шырыны'), L('Pure water', 'Чистая вода', 'Таза су'), L('Soap', 'Мыло', 'Сабын')],
    onButton: (i) => ({ pH: [2.4, 7, 10][i] }),
    draw(v) {
      const hue = (x) => (x <= 7 ? (x / 7) * 120 : 120 + ((x - 7) / 7) * 160);
      const col = (x) => `hsl(${Math.round(hue(x))} 75% 52%)`;
      const scale = Array.from({ length: 15 }, (_, i) => `<rect x="${20 + i * 18.67}" y="176" width="19" height="16" style="fill:${col(i)}"/>`).join('');
      const nH = Math.round(12 * clamp(0.5 + (7 - v.pH) / 12, 0, 1));
      const ions = Array.from({ length: 12 }, (_, i) => {
        const x = 124 + (i % 4) * 24 + (Math.floor(i / 4) % 2) * 10;
        const y = 98 + Math.floor(i / 4) * 22;
        const hp = i < nH;
        return `<text class="ex-tiny ex-ion${hp ? '' : ' oh'}" x="${x}" y="${y}">${hp ? 'H⁺' : 'OH⁻'}</text>`;
      }).join('');
      const px = 20 + (v.pH / 14) * 280;
      const neutral = Math.abs(v.pH - 7) < 0.005;
      const ratio = 10 ** Math.abs(7 - v.pH);
      const kind = (acid, neu, base) => (neutral ? neu : v.pH < 7 ? acid : base);
      const exp = fmt(-v.pH);
      return {
        svg: `<path class="ex-beaker" d="M110 40 V160 Q110 168 118 168 H202 Q210 168 210 160 V40"/><path d="M112 72 H208 V160 Q208 166 202 166 H118 Q112 166 112 160 Z" style="fill:${col(v.pH)};opacity:.55"/>${ions}
          ${scale}<path class="ex-fill" style="color:var(--ink)" d="M${n1(px)} 174 l-7 -12 h14 Z"/>${[0, 7, 14].map((x) => `<text class="ex-tiny" x="${20 + x * 20}" y="206">${x}</text>`).join('')}
          <text class="ex-big" x="270" y="70">${fmt(v.pH)}</text><text class="ex-small" x="270" y="94" style="fill:${col(v.pH)}">${u(...kind(['acid', 'кислота', 'қышқыл'], ['neutral', 'нейтр.', 'бейтарап'], ['alkali', 'щёлочь', 'сілті']))}</text>
          <text class="ex-tag" x="8" y="40">[H⁺] = 10<tspan dy="-6" font-size="9">${exp}</tspan></text>`,
        caption: neutral
          ? L('pH = 7: neutral, like pure water - H⁺ and OH⁻ ions are equal (10⁻⁷ mol/L each).', 'pH = 7: нейтральная среда, как чистая вода, - ионов H⁺ и OH⁻ поровну (по 10⁻⁷ моль/л).', 'pH = 7: бейтарап орта, таза судағыдай - H⁺ және OH⁻ иондары тең (әрқайсысы 10⁻⁷ моль/л).')
          : L(
              `pH = ${fmt(v.pH)}: ${kind(['acidic'], [''], ['alkaline'])[0]}. [H⁺] = 10^(${exp}) mol/L - ${fmt(ratio, ratio < 10 ? 2 : 0)} times ${v.pH < 7 ? 'more' : 'fewer'} H⁺ ions than in pure water.`,
              `pH = ${fmt(v.pH)}: ${kind(['кислая среда'], [''], ['щелочная среда'])[0]}. [H⁺] = 10^(${exp}) моль/л - ионов H⁺ в ${fmt(ratio, ratio < 10 ? 2 : 0)} раз ${v.pH < 7 ? 'больше' : 'меньше'}, чем в чистой воде.`,
              `pH = ${fmt(v.pH)}: ${kind(['қышқыл орта'], [''], ['сілтілі орта'])[0]}. [H⁺] = 10^(${exp}) моль/л - H⁺ иондары таза судағыдан ${fmt(ratio, ratio < 10 ? 2 : 0)} есе ${v.pH < 7 ? 'көп' : 'аз'}.`,
            ),
      };
    },
  },

  solution: {
    title: L('Solutions: mass fraction', 'Растворы: массовая доля', 'Ерітінділер: массалық үлес'),
    intro: L('The mass fraction shows what part of the solution is the dissolved substance: w = m(substance) / m(solution). Add water - the solution gets weaker; evaporate water - it gets stronger.', 'Массовая доля показывает, какую часть раствора составляет растворённое вещество: w = m(вещества) / m(раствора). Долили воды - раствор слабее, выпарили воду - крепче.', 'Массалық үлес ерітіндінің қандай бөлігі еріген зат екенін көрсетеді: w = m(зат) / m(ерітінді). Су қосса - ерітінді әлсірейді, суды буландырса - күшейеді.'),
    sliders: [
      { id: 's', label: L('salt, g', 'соль, г', 'тұз, г'), min: 0, max: 100, step: C, value: 20 },
      { id: 'w', label: L('water, g', 'вода, г', 'су, г'), min: 20, max: 400, step: C, value: 180 },
    ],
    buttons: [L('+ 100 g water', '+ 100 г воды', '+ 100 г су'), L('Evaporate 50 g', 'Выпарить 50 г', '50 г буландыру'), RESET],
    onButton: (i, st, v) => [{ w: clamp(v.w + 100, 20, 400) }, { w: clamp(v.w - 50, 20, 400) }, { s: 20, w: 180 }][i],
    draw(v) {
      const total = v.s + v.w;
      const frac = v.s / total;
      const h = clamp((total / 500) * 150, 8, 150);
      const dots = Array.from({ length: Math.round(v.s / 4) }, (_, i) => {
        const x = 70 + ((i * 37) % 96);
        const y = 196 - ((i * 53) % Math.max(6, h - 6)) - 4;
        return `<circle class="ex-fill exc-m" cx="${x}" cy="${n1(y)}" r="2"/>`;
      }).join('');
      return {
        svg: `<path class="ex-stroke exc-m" style="fill:none;stroke-width:2.5" d="M60 40 V200 H180 V40"/>
          <rect x="62" y="${n1(198 - h)}" width="116" height="${n1(h)}" style="fill:color-mix(in srgb, var(--blue) ${Math.round(18 + frac * 70)}%, var(--surface))"/>${dots}
          <text class="ex-big" x="250" y="70">${fmt(frac * 100, 1)}%</text>
          <text class="ex-tag" x="200" y="105">m(${u('solution', 'р-ра', 'ерітінді')}) = ${fmt(total, 1)} ${u('g', 'г', 'г')}</text>
          <text class="ex-tag" x="200" y="128">w = ${fmt(v.s, 1)} / ${fmt(total, 1)}</text>`,
        caption: L(
          `w = ${fmt(v.s, 1)} g ÷ ${fmt(total, 1)} g = ${fmt(frac * 100, 1)}%. Remember: the solution's mass is salt plus water, not just water. Adding water keeps the salt the same but makes the fraction smaller.`,
          `w = ${fmt(v.s, 1)} г ÷ ${fmt(total, 1)} г = ${fmt(frac * 100, 1)}%. Помни: масса раствора - это соль плюс вода, а не только вода. Если долить воды, соли столько же, а доля меньше.`,
          `w = ${fmt(v.s, 1)} г ÷ ${fmt(total, 1)} г = ${fmt(frac * 100, 1)}%. Есте сақта: ерітінді массасы - тұз бен судың қосындысы, тек су емес. Су қоссаң, тұз сол күйі, ал үлесі азаяды.`,
        ),
      };
    },
  },

  foodchain: {
    title: L('Food chain and the 10% rule', 'Пищевая цепь и правило 10%', 'Қоректік тізбек және 10% ережесі'),
    intro: L('At each step of a food chain only about 10% of the energy passes on - the rest is spent on life and lost as heat. That is why chains are short and predators are few.', 'На каждом звене пищевой цепи дальше переходит лишь около 10% энергии - остальное тратится на жизнь и уходит в тепло. Поэтому цепи короткие, а хищников мало.', 'Қоректік тізбектің әр буынында энергияның тек 10%-ы ғана әрі өтеді - қалғаны тіршілікке жұмсалып, жылуға айналады. Сондықтан тізбектер қысқа, жыртқыштар аз.'),
    sliders: [
      { id: 'E', label: L('plants, kJ', 'растения, кДж', 'өсімдіктер, кДж'), min: 1000, max: 100000, step: 100, value: 50000 },
      { id: 'p', label: L('passes on, %', 'переходит, %', 'өтеді, %'), min: 5, max: 20, step: C, value: 10 },
    ],
    buttons: [L('10% rule', 'Правило 10%', '10% ережесі')],
    onButton: () => ({ p: 10 }),
    draw(v) {
      const names = [L('grass', 'трава', 'шөп'), L('hare', 'заяц', 'қоян'), L('fox', 'лиса', 'түлкі'), L('wolf', 'волк', 'қасқыр')];
      const icons = ['🌿', '🐇', '🦊', '🐺'];
      const vals = names.map((_, i) => v.E * (v.p / 100) ** i);
      // «в 10 раз», «в 2 раза», «в 6,7 раза»
      const timesRu = (x) => {
        const r = Math.round(x * 10) / 10;
        if (!Number.isInteger(r)) return 'раза';
        return r % 10 >= 2 && r % 10 <= 4 && (r % 100 < 12 || r % 100 > 14) ? 'раза' : 'раз';
      };
      const max = Math.log10(v.E + 1);
      const bars = vals
        .map((e, i) => {
          const w = clamp((Math.log10(e + 1) / max) * 220, 14, 220);
          const y = 180 - i * 42;
          return `<rect x="${n1(160 - w / 2)}" y="${y}" width="${n1(w)}" height="34" rx="6" class="ex-fill ${['exc-g', 'exc-y', 'exc-o', 'exc-r'][i]}" style="opacity:.8"/><text class="ex-small" x="160" y="${y + 22}">${icons[i]} ${tx(names[i])}: ${fmt(e, e < 10 ? 2 : 0)}</text>`;
        })
        .join('');
      return {
        svg: bars,
        caption: L(
          `From ${fmt(v.E, 0)} kJ in plants only ${fmt(vals[3], 1)} kJ reach the wolf - ${fmt((vals[3] / v.E) * 100, 3)}%. With ${fmt(v.p, 1)}% passing at each step, every next level gets ${fmt(100 / v.p, 1)} times less energy.`,
          `Из ${fmt(v.E, 0)} кДж в растениях до волка доходит лишь ${fmt(vals[3], 1)} кДж - ${fmt((vals[3] / v.E) * 100, 3)}%. Если на каждом звене переходит ${fmt(v.p, 1)}%, у каждого следующего энергии в ${fmt(100 / v.p, 1)} ${timesRu(100 / v.p)} меньше.`,
          `Өсімдіктердегі ${fmt(v.E, 0)} кДж-дан қасқырға тек ${fmt(vals[3], 1)} кДж жетеді - ${fmt((vals[3] / v.E) * 100, 3)}%. Әр буында ${fmt(v.p, 1)}% өтсе, келесі деңгейде энергия ${fmt(100 / v.p, 1)} есе аз.`,
        ),
      };
    },
  },

  enzyme: {
    title: L('Enzymes: temperature and pH', 'Ферменты: температура и pH', 'Ферменттер: температура және pH'),
    intro: L('An enzyme works fastest at its optimum. Warmer speeds it up - until the protein is destroyed (denatured) above about 45 °C. Each enzyme also has its own best pH.', 'Фермент работает быстрее всего в оптимуме. Тепло ускоряет его - пока белок не разрушится (денатурирует) выше примерно 45 °C. И у каждого фермента свой лучший pH.', 'Фермент оптимумда ең жылдам жұмыс істейді. Жылу оны жылдамдатады - шамамен 45 °C-тан жоғары ақуыз бұзылғанға (денатурация) дейін. Әр ферменттің өз ең жақсы pH-ы бар.'),
    sliders: [
      { id: 't', label: 't, °C', min: 0, max: 80, step: C, value: 37 },
      { id: 'ph', label: 'pH', min: 1, max: 13, step: C, value: 7 },
    ],
    buttons: [L('Amylase (saliva)', 'Амилаза (слюна)', 'Амилаза (сілекей)'), L('Pepsin (stomach)', 'Пепсин (желудок)', 'Пепсин (асқазан)')],
    state: () => ({ k: 0 }),
    pressed: (i, v, st) => i === st.k,
    onButton(i, st) {
      st.k = i;
      return { ph: i ? 2 : 7, t: 37 };
    },
    draw(v, step, st) {
      const opt = st.k ? 2 : 7;
      const act = (t, ph) => {
        const T = t <= 40 ? Math.exp(-(((t - 37) / 18) ** 2)) : Math.exp(-(((40 - 37) / 18) ** 2)) * Math.max(0, 1 - (t - 40) / 18);
        return T * Math.exp(-(((ph - opt) / 1.8) ** 2));
      };
      const sx = (t) => 20 + t * 3.6;
      const sy = (a) => 190 - a * 150;
      const curve = plot((t) => act(t, v.ph), 0, 80, sx, sy);
      const a = act(v.t, v.ph);
      return {
        svg: `<line class="ex-axis" x1="20" y1="190" x2="310" y2="190"/><line class="ex-axis" x1="20" y1="20" x2="20" y2="190"/>
          <path class="ex-stroke exc-p" style="fill:none;stroke-width:2.5" d="${curve}"/>
          <circle class="ex-fill exc-o" cx="${n1(sx(v.t))}" cy="${n1(sy(a))}" r="6"/>
          <text class="ex-tiny" x="${sx(37)}" y="205">37 °C</text><text class="ex-tiny" x="${sx(0)}" y="205">0</text><text class="ex-tiny" x="${sx(80)}" y="205">80</text>
          <text class="ex-tag" x="190" y="30">${u('activity', 'активность', 'белсенділік')}: ${Math.round(a * 100)}%</text>`,
        caption:
          v.t > 45
            ? L(`At ${fmt(v.t, 0)} °C the enzyme protein is denatured - its shape is broken and it almost stops working, even when cooled back.`, `При ${fmt(v.t, 0)} °C белок фермента денатурирует - его форма разрушена, и он почти перестаёт работать, даже если остудить.`, `${fmt(v.t, 0)} °C-та фермент ақуызы денатурацияланады - пішіні бұзылып, салқындатса да дерлік жұмыс істемейді.`)
            : L(`${st.k ? 'Pepsin works in the acidic stomach (pH ≈ 2)' : 'Amylase works in neutral saliva (pH ≈ 7)'}. Now activity is ${Math.round(a * 100)}%: closer to 37 °C and the right pH - faster.`, `${st.k ? 'Пепсин работает в кислом желудке (pH ≈ 2)' : 'Амилаза работает в нейтральной слюне (pH ≈ 7)'}. Сейчас активность ${Math.round(a * 100)}%: чем ближе к 37 °C и нужному pH, тем быстрее.`, `${st.k ? 'Пепсин қышқыл асқазанда жұмыс істейді (pH ≈ 2)' : 'Амилаза бейтарап сілекейде жұмыс істейді (pH ≈ 7)'}. Қазір белсенділік ${Math.round(a * 100)}%: 37 °C-қа және қажетті pH-қа жақын болған сайын жылдамырақ.`),
      };
    },
  },

  cellsize: {
    title: L('Why cells are small', 'Почему клетки маленькие', 'Жасушалар неге кішкентай'),
    intro: L('A cell takes in food and oxygen through its surface, but needs them for its whole volume. When a cell grows, volume grows faster than surface - so big cells starve.', 'Клетка получает пищу и кислород через поверхность, а нужны они всему объёму. Когда клетка растёт, объём растёт быстрее поверхности - большой клетке не хватает питания.', 'Жасуша қорек пен оттегін беті арқылы алады, ал олар бүкіл көлемге керек. Жасуша өскенде көлем бетке қарағанда тез өседі - үлкен жасушаға қорек жетпейді.'),
    sliders: [{ id: 'a', label: L('side a, µm', 'сторона a, мкм', 'қыры a, мкм'), min: 1, max: 10, step: C, value: 3 }],
    buttons: [L('a × 2', 'a × 2', 'a × 2'), RESET],
    onButton: (i, st, v) => [{ a: clamp(v.a * 2, 1, 10) }, { a: 3 }][i],
    draw(v) {
      const a = v.a;
      const S = 6 * a * a;
      const V = a ** 3;
      const s = 9 * a;
      const x = 70 - s / 2;
      const y = 140 - s / 2;
      const d = s * 0.45;
      const ratio = S / V;
      return {
        svg: `<path class="ex-fill exc-g" style="opacity:.35" d="M${n1(x)} ${n1(y)} h${n1(s)} v${n1(s)} h${n1(-s)} Z"/><path class="ex-fill exc-g" style="opacity:.55" d="M${n1(x)} ${n1(y)} l${n1(d)} ${n1(-d)} h${n1(s)} l${n1(-d)} ${n1(d)} Z"/><path class="ex-fill exc-g" style="opacity:.75" d="M${n1(x + s)} ${n1(y)} l${n1(d)} ${n1(-d)} v${n1(s)} l${n1(-d)} ${n1(d)} Z"/>
          <text class="ex-tag" x="180" y="60">S = 6a² = ${fmt(S, 1)}</text><text class="ex-tag" x="180" y="84">V = a³ = ${fmt(V, 1)}</text>
          <text class="ex-big" x="245" y="125">S/V = ${fmt(ratio)}</text>
          <rect x="180" y="150" width="${n1(clamp(ratio * 20, 4, 130))}" height="18" rx="5" class="ex-fill exc-b"/>`,
        caption: L(
          `For a = ${fmt(a)} µm: surface ${fmt(S, 1)}, volume ${fmt(V, 1)}, so each unit of volume has ${fmt(ratio)} units of surface (S/V = 6/a). Double the side and S/V halves - feeding the inside becomes twice as hard.`,
          `При a = ${fmt(a)} мкм: поверхность ${fmt(S, 1)}, объём ${fmt(V, 1)}, на каждую единицу объёма приходится ${fmt(ratio)} единицы поверхности (S/V = 6/a). Увеличь сторону вдвое - S/V уменьшится вдвое, и кормить середину станет вдвое труднее.`,
          `a = ${fmt(a)} мкм болғанда: беті ${fmt(S, 1)}, көлемі ${fmt(V, 1)}, әр көлем бірлігіне ${fmt(ratio)} бет бірлігі келеді (S/V = 6/a). Қырын екі есе үлкейтсең - S/V екі есе азаяды, ортасын қоректендіру екі есе қиындайды.`,
        ),
      };
    },
  },

  ions: {
    title: L('Writing formulas from ion charges', 'Формулы по зарядам ионов', 'Иондар зарядтары бойынша формула'),
    intro: L('A compound is neutral: the total plus charge equals the total minus charge. Ca²⁺ and Cl⁻ give CaCl₂ - two Cl⁻ balance one Ca²⁺.', 'Вещество электронейтрально: сумма плюсов равна сумме минусов. Ca²⁺ и Cl⁻ дают CaCl₂ - два Cl⁻ уравновешивают один Ca²⁺.', 'Зат электрбейтарап: оң зарядтар қосындысы теріс зарядтар қосындысына тең. Ca²⁺ мен Cl⁻ CaCl₂ береді - екі Cl⁻ бір Ca²⁺-ті теңестіреді.'),
    sliders: [],
    buttons: ['Na⁺', 'Ca²⁺', 'Al³⁺', 'Cl⁻', 'O²⁻', 'PO₄³⁻'],
    state: () => ({ c: 1, an: 0 }),
    pressed: (i, v, st) => (i < 3 ? i === st.c : i - 3 === st.an),
    onButton(i, st) {
      if (i < 3) st.c = i;
      else st.an = i - 3;
    },
    draw(v, step, st) {
      const CAT = [['Na', 1], ['Ca', 2], ['Al', 3]];
      const AN = [['Cl', 1, false], ['O', 2, false], ['PO₄', 3, true]];
      const [cs, cq] = CAT[st.c];
      const [as, aq, poly] = AN[st.an];
      const g = (x, y) => (y ? g(y, x % y) : x);
      const l = (cq * aq) / g(cq, aq);
      const nc = l / cq;
      const na = l / aq;
      const sub = (n) => (n > 1 ? String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]) : '');
      const formula = `${cs}${sub(nc)}${poly && na > 1 ? `(${as})${sub(na)}` : `${as}${sub(na)}`}`;
      const sup = (q, s) => `${q > 1 ? '⁰¹²³⁴⁵⁶⁷⁸⁹'[q] : ''}${s === '+' ? '⁺' : '⁻'}`;
      const bubbles = [
        ...Array.from({ length: nc }, (_, i) => `<circle class="ex-fill exc-o" cx="${40 + i * 44}" cy="90" r="18"/><text class="ex-small" x="${40 + i * 44}" y="95" style="fill:#fff">${cs}${sup(cq, '+')}</text>`),
        ...Array.from({ length: na }, (_, i) => `<circle class="ex-fill exc-b" cx="${40 + i * 44}" cy="150" r="18"/><text class="ex-small" x="${40 + i * 44}" y="155" style="fill:#fff;font-size:11px">${as}${sup(aq, '−')}</text>`),
      ].join('');
      return {
        svg: `${bubbles}<text class="ex-big" x="250" y="110">${formula}</text><text class="ex-tag" x="200" y="150">+${nc * cq} ${u('and', 'и', 'және')} −${na * aq}</text>`,
        caption: L(
          `${cs}${sup(cq, '+')} and ${as}${sup(aq, '−')}: the smallest common multiple of ${cq} and ${aq} is ${l}, so ${nc} × (+${cq}) = ${na} × (−${aq}) in size. Formula: ${formula}.`,
          `${cs}${sup(cq, '+')} и ${as}${sup(aq, '−')}: наименьшее общее кратное ${cq} и ${aq} - ${l}, поэтому ${nc} × (+${cq}) уравновешивают ${na} × (−${aq}). Формула: ${formula}.`,
          `${cs}${sup(cq, '+')} және ${as}${sup(aq, '−')}: ${cq} пен ${aq}-тің ең кіші ортақ еселігі - ${l}, сондықтан ${nc} × (+${cq}) ${na} × (−${aq})-ті теңестіреді. Формула: ${formula}.`,
        ),
      };
    },
  },

  // ===== Физика: Архимед, пружина, цепи, преломление, плавление, давление =====

  buoyancy: {
    title: L("Archimedes' principle: float or sink", 'Закон Архимеда: утонет или всплывёт', 'Архимед заңы: батады ма, қалқиды ма'),
    intro: L('A liquid pushes up with a force equal to the weight of the liquid displaced. If the body is less dense than the liquid, it floats with part of it above the surface.', 'Жидкость выталкивает тело с силой, равной весу вытесненной жидкости. Если тело легче (менее плотное), чем жидкость, оно плавает, частично выступая над водой.', 'Сұйық денені ығыстырылған сұйықтың салмағына тең күшпен итереді. Дене сұйықтан жеңіл (тығыздығы аз) болса, бір бөлігі судан шығып, қалқиды.'),
    sliders: [
      { id: 'rb', label: L('body density, kg/m³', 'плотность тела, кг/м³', 'дене тығыздығы, кг/м³'), min: 100, max: 3000, step: 10, value: 600 },
      { id: 'rl', label: L('liquid density, kg/m³', 'плотность жидкости, кг/м³', 'сұйық тығыздығы, кг/м³'), min: 700, max: 1300, step: 10, value: 1000 },
    ],
    buttons: [L('Wood', 'Дерево', 'Ағаш'), L('Ice', 'Лёд', 'Мұз'), L('Iron', 'Железо', 'Темір'), L('Sea water', 'Морская вода', 'Теңіз суы')],
    onButton: (i) => [{ rb: 600 }, { rb: 900 }, { rb: 2700 }, { rl: 1030 }][i],
    draw(v) {
      const k = v.rb / v.rl;
      const side = 60;
      const surf = 90;
      const floats = k < 1;
      const sub = floats ? k * side : side;
      const top = floats ? surf - (side - sub) : 196 - side;
      return {
        svg: `<rect x="20" y="${surf}" width="280" height="110" class="ex-fill exc-b" style="opacity:.25"/><line class="ex-stroke exc-b" x1="20" y1="${surf}" x2="300" y2="${surf}"/>
          <rect x="130" y="${n1(top)}" width="${side}" height="${side}" rx="6" class="ex-fill exc-o" style="opacity:.85"/>
          ${arrow(160, n1(top + side / 2), 160, n1(top + side / 2 + 40), 'exc-r', 2.5)}${arrow(178, n1(top + side), 178, n1(top + side - (floats ? 40 : 40 / k)), 'exc-g', 2.5)}
          <text class="ex-tag" x="8" y="20">ρ ${u('body', 'тела', 'дене')} / ρ ${u('liquid', 'жидк.', 'сұйық')} = ${fmt(k)}</text>
          <text class="ex-tag" x="8" y="42">${floats ? `${u('under water', 'под водой', 'су астында')}: ${Math.round(k * 100)}%` : u('sinks', 'тонет', 'батады')}</text>`,
        caption: floats
          ? L(`The body is ${fmt(k)} times as dense as the liquid, so it floats with ${Math.round(k * 100)}% of its volume under the surface: then the buoyant force (green) equals gravity (red).`, `Плотность тела в ${fmt(k)} раза от плотности жидкости, поэтому оно плавает, погрузившись на ${Math.round(k * 100)}% объёма: тогда сила Архимеда (зелёная) равна силе тяжести (красная).`, `Дене тығыздығы сұйық тығыздығының ${fmt(k)} бөлігі, сондықтан ол көлемінің ${Math.round(k * 100)}%-ына батып, қалқиды: сонда Архимед күші (жасыл) ауырлық күшіне (қызыл) тең.`)
          : L(`The body is denser than the liquid (${fmt(k)} times), so even fully under water the buoyant force is smaller than gravity - it sinks.`, `Тело плотнее жидкости (в ${fmt(k)} раза), поэтому даже полностью под водой сила Архимеда меньше силы тяжести - оно тонет.`, `Дене сұйықтан тығызырақ (${fmt(k)} есе), сондықтан толық батса да Архимед күші ауырлық күшінен аз - ол батады.`),
      };
    },
  },

  spring: {
    title: L("Hooke's law: a spring", 'Закон Гука: пружина', 'Гук заңы: серіппе'),
    intro: L('The spring stretches in proportion to the force: F = k · x. A stiffer spring (bigger k) stretches less under the same load.', 'Пружина растягивается пропорционально силе: F = k · x. Чем жёстче пружина (больше k), тем меньше она растянется под тем же грузом.', 'Серіппе күшке пропорционал созылады: F = k · x. Серіппе неғұрлым қатаң (k үлкен) болса, сол жүкпен соғұрлым аз созылады.'),
    sliders: [
      { id: 'm', label: L('mass, kg', 'масса, кг', 'масса, кг'), min: 0, max: 5, step: C, value: 2 },
      { id: 'k', label: L('k, N/m', 'k, Н/м', 'k, Н/м'), min: 50, max: 500, step: 1, value: 200 },
    ],
    buttons: [L('m × 2', 'm × 2', 'm × 2'), L('k × 2', 'k × 2', 'k × 2'), RESET],
    onButton: (i, st, v) => [{ m: clamp(v.m * 2, 0, 5) }, { k: clamp(v.k * 2, 50, 500) }, { m: 2, k: 200 }][i],
    draw(v) {
      const F = v.m * 10;
      const x = F / v.k;
      const len = 50 + x * 300;
      const coils = Array.from({ length: 12 }, (_, i) => `${i % 2 ? 'L130' : 'L190'} ${n1(30 + (len * (i + 1)) / 13)}`).join(' ');
      return {
        svg: `<line class="ex-axis" x1="100" y1="30" x2="220" y2="30"/><path class="ex-stroke exc-m" style="fill:none;stroke-width:2" d="M160 30 ${coils} L160 ${n1(30 + len)}"/>
          <rect x="135" y="${n1(30 + len)}" width="50" height="${n1(20 + v.m * 5)}" rx="5" class="ex-fill exc-o"/><text class="ex-small" x="160" y="${n1(46 + len)}" style="fill:#fff">${fmt(v.m, 1)} ${u('kg', 'кг', 'кг')}</text>
          <text class="ex-tag" x="200" y="80">F = mg = ${fmt(F, 1)} ${u('N', 'Н', 'Н')}</text><text class="ex-tag" x="200" y="104">x = F / k</text><text class="ex-big" x="250" y="140">${fmt(x * 100, 1)} ${u('cm', 'см', 'см')}</text>`,
        caption: L(`x = F / k = ${fmt(F, 1)} N ÷ ${fmt(v.k, 0)} N/m = ${fmt(x, 3)} m = ${fmt(x * 100, 1)} cm. Double the mass - the stretch doubles; double k - it halves.`, `x = F / k = ${fmt(F, 1)} Н ÷ ${fmt(v.k, 0)} Н/м = ${fmt(x, 3)} м = ${fmt(x * 100, 1)} см. Удвой массу - растяжение удвоится; удвой k - уменьшится вдвое.`, `x = F / k = ${fmt(F, 1)} Н ÷ ${fmt(v.k, 0)} Н/м = ${fmt(x, 3)} м = ${fmt(x * 100, 1)} см. Массаны екі есе арттыр - созылу екі есе артады; k-ны екі есе арттыр - екі есе азаяды.`),
      };
    },
  },

  melting: {
    title: L('Heating ice: melting and boiling', 'Нагревание льда: плавление и кипение', 'Мұзды қыздыру: балқу және қайнау'),
    intro: L('While ice melts or water boils, the temperature stays the same - all the heat goes into changing the state. That is why the graph has flat steps.', 'Пока лёд плавится или вода кипит, температура не меняется - вся теплота уходит на смену состояния. Поэтому на графике горизонтальные площадки.', 'Мұз еріп немесе су қайнап жатқанда температура өзгермейді - бүкіл жылу күйді өзгертуге кетеді. Сондықтан графикте көлденең алаңдар бар.'),
    sliders: [{ id: 'Q', label: L('heat given, kJ', 'подведено тепла, кДж', 'берілген жылу, кДж'), min: 0, max: 3100, step: 1, value: 200 }],
    buttons: [L('▶ Heat up', '▶ Нагреть', '▶ Қыздыру')],
    play: 'Q',
    playDur: 9000,
    playLinear: true,
    draw(v) {
      // 1 кг: лёд от −20 °C (c = 2,1), плавление 334 кДж, вода (c = 4,2), кипение 2260 кДж, пар (c = 2,0) до 120 °C.
      const segs = [
        { q: 42, t0: -20, t1: 0 },
        { q: 334, t0: 0, t1: 0 },
        { q: 420, t0: 0, t1: 100 },
        { q: 2260, t0: 100, t1: 100 },
        { q: 40, t0: 100, t1: 120 },
      ];
      const total = segs.reduce((s, x) => s + x.q, 0);
      const T = (Q) => {
        let left = Q;
        for (const s of segs) {
          if (left <= s.q) return s.t0 + ((s.t1 - s.t0) * left) / s.q;
          left -= s.q;
        }
        return 120;
      };
      const phase = (Q) => {
        let acc = 0;
        for (let i = 0; i < segs.length; i++) {
          acc += segs[i].q;
          if (Q <= acc) return i;
        }
        return 4;
      };
      const sx = (q) => 30 + (q / total) * 280;
      const sy = (t) => 190 - ((t + 20) / 140) * 160;
      let d = 'M' + sx(0) + ' ' + sy(-20);
      for (let acc = 0, i = 0; i < segs.length; i++) {
        acc += segs[i].q;
        d += ` L${n1(sx(acc))} ${n1(sy(segs[i].t1))}`;
      }
      const ph = phase(v.Q);
      const names = [L('ice warms', 'лёд нагревается', 'мұз жылиды'), L('ice melts (0 °C)', 'лёд плавится (0 °C)', 'мұз ериді (0 °C)'), L('water warms', 'вода нагревается', 'су жылиды'), L('water boils (100 °C)', 'вода кипит (100 °C)', 'су қайнайды (100 °C)'), L('steam warms', 'пар нагревается', 'бу жылиды')];
      return {
        svg: `<line class="ex-axis" x1="30" y1="190" x2="310" y2="190"/><line class="ex-axis" x1="30" y1="20" x2="30" y2="190"/>
          <text class="ex-tiny" x="18" y="${sy(0) + 4}">0</text><text class="ex-tiny" x="16" y="${sy(100) + 4}">100</text>
          <path class="ex-stroke exc-m" style="fill:none;stroke-width:2;opacity:.4" d="${d}"/><circle class="ex-fill exc-r" cx="${n1(sx(v.Q))}" cy="${n1(sy(T(v.Q)))}" r="6"/>
          <text class="ex-tag" x="40" y="22">t = ${fmt(T(v.Q), 1)} °C · ${tx(names[ph])}</text>`,
        caption: L(
          `Given ${fmt(v.Q, 0)} kJ to 1 kg of ice. Now: ${tx(names[ph])}, ${fmt(T(v.Q), 1)} °C. Melting takes 334 kJ, boiling away 2260 kJ - far more than warming water from 0 to 100 °C (420 kJ).`,
          `Подведено ${fmt(v.Q, 0)} кДж к 1 кг льда. Сейчас: ${tx(names[ph])}, ${fmt(T(v.Q), 1)} °C. На плавление уходит 334 кДж, на выкипание - 2260 кДж: гораздо больше, чем на нагрев воды от 0 до 100 °C (420 кДж).`,
          `1 кг мұзға ${fmt(v.Q, 0)} кДж берілді. Қазір: ${tx(names[ph])}, ${fmt(T(v.Q), 1)} °C. Балқуға 334 кДж, толық қайнап кетуге 2260 кДж кетеді: суды 0-ден 100 °C-қа дейін қыздырудан (420 кДж) әлдеқайда көп.`,
        ),
      };
    },
  },

  pressure: {
    title: L('Pressure in a liquid', 'Давление в жидкости', 'Сұйықтағы қысым'),
    intro: L('The deeper, the higher the pressure: p = ρ g h. It does not depend on the shape of the vessel - only on depth and the liquid.', 'Чем глубже, тем больше давление: p = ρ g h. Оно не зависит от формы сосуда - только от глубины и жидкости.', 'Неғұрлым терең болса, қысым соғұрлым жоғары: p = ρ g h. Ол ыдыстың пішініне тәуелді емес - тек тереңдікке және сұйыққа.'),
    sliders: [
      { id: 'h', label: L('depth h, m', 'глубина h, м', 'тереңдік h, м'), min: 0, max: 100, step: C, value: 10 },
      { id: 'r', label: L('density, kg/m³', 'плотность, кг/м³', 'тығыздық, кг/м³'), min: 700, max: 13600, step: 10, value: 1000 },
    ],
    buttons: [L('Water', 'Вода', 'Су'), L('Sea water', 'Морская вода', 'Теңіз суы'), L('Mercury', 'Ртуть', 'Сынап')],
    onButton: (i) => [{ r: 1000 }, { r: 1030 }, { r: 13600 }][i],
    draw(v) {
      const p = v.r * 10 * v.h;
      const y = 30 + (v.h / 100) * 160;
      const atm = p / 101325;
      return {
        svg: `<rect x="20" y="30" width="180" height="170" class="ex-fill exc-b" style="opacity:${0.15 + Math.min(0.6, v.r / 25000)}"/><line class="ex-stroke exc-b" x1="20" y1="30" x2="200" y2="30"/>
          <circle class="ex-fill exc-o" cx="110" cy="${n1(y)}" r="8"/>${[0, 1, 2, 3].map((k) => arrow(110 + 22 * Math.cos((k * Math.PI) / 2), y + 22 * Math.sin((k * Math.PI) / 2), 110 + 10 * Math.cos((k * Math.PI) / 2), y + 10 * Math.sin((k * Math.PI) / 2), 'exc-r', Math.min(4, 1 + atm / 3))).join('')}
          <text class="ex-tag" x="210" y="60">p = ρgh</text><text class="ex-big" x="262" y="100">${fmt(p / 1000, 1)}</text><text class="ex-small" x="262" y="120">${u('kPa', 'кПа', 'кПа')}</text><text class="ex-tag" x="210" y="150">≈ ${fmt(atm, 2)} ${u('atm', 'атм', 'атм')}</text>`,
        caption: L(
          `p = ${fmt(v.r, 0)} · 10 · ${fmt(v.h, 1)} = ${fmt(p / 1000, 1)} kPa (plus the atmosphere on top). In water every 10 m adds about 1 atmosphere. The pressure pushes equally in all directions.`,
          `p = ${fmt(v.r, 0)} · 10 · ${fmt(v.h, 1)} = ${fmt(p / 1000, 1)} кПа (плюс атмосферное сверху). В воде каждые 10 м добавляют примерно 1 атмосферу. Давление действует одинаково во все стороны.`,
          `p = ${fmt(v.r, 0)} · 10 · ${fmt(v.h, 1)} = ${fmt(p / 1000, 1)} кПа (үстінен атмосфералық қысым қосылады). Суда әр 10 м шамамен 1 атмосфера қосады. Қысым барлық жаққа бірдей әсер етеді.`,
        ),
      };
    },
  },
};
// Данные для сцен.

const ATOM_R = { H: 5.5, O: 8, N: 8, Mg: 9 };
const REACTIONS = [
  { f: ['H₂', 'O₂', 'H₂O'], mol: [{ atoms: ['H', 'H'] }, { atoms: ['O', 'O'] }, { atoms: ['H', 'O', 'H'] }], ans: [2, 1, 2] },
  { f: ['N₂', 'H₂', 'NH₃'], mol: [{ atoms: ['N', 'N'] }, { atoms: ['H', 'H'] }, { atoms: ['H', 'N', 'H', 'H'] }], ans: [1, 3, 2] },
  { f: ['Mg', 'O₂', 'MgO'], mol: [{ atoms: ['Mg'] }, { atoms: ['O', 'O'] }, { atoms: ['Mg', 'O'] }], ans: [2, 1, 2] },
];
