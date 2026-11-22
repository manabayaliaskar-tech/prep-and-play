// Анимации тем: алгебра, геометрия и высшая математика. Формат сцены описан в src/screens/explain.js.
// У каждой сцены несколько режимов (вкладки), примеры (кнопка «Ещё ↻») и режим «Задание»:
// сцена загадывает цель, проверяет ползунки или перетаскивание и показывает ✓ или подсказку.

import { t, tx } from '../core/i18n.js';
import { L } from '../pools/gen.js';
import { esc } from '../ui/dom.js';
import { W, H, clamp, lerp, ease, n1, fmt, term, coef, u, arrow, plot, RESET } from './kit.js';

// ---------- Общие помощники сцен ----------

/** Строки интерфейса (в сценах t занято временем). */
const ui = { h: () => t('explain.h'), gap: () => t('explain.gap'), slope: () => t('explain.slope') };

const MORE = L('Another ↻', 'Ещё ↻', 'Тағы ↻');
const TASK = L('Task', 'Задание', 'Тапсырма');
const STEP = L('Step →', 'Шаг →', 'Қадам →');
const PLAY = L('▶ Play', '▶ Пуск', '▶ Іске қосу');

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const gcd = (a, b) => {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a;
};
const lcm = (a, b) => (a && b ? Math.abs(a * b) / gcd(a, b) : 0);
const near = (x, y, e = 0.051) => Math.abs(x - y) < e;
const op = (k) => Math.round(clamp(k, 0, 1) * 100) / 100;
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const deg = (d) => (d * Math.PI) / 180;
/** Русское склонение после числа: pl(5, 'часть', 'части', 'частей'). */
const pl = (n, one, few, many) => {
  const m = Math.abs(Math.round(n)) % 100;
  const k = m % 10;
  return m > 10 && m < 20 ? many : k === 1 ? one : k >= 2 && k <= 4 ? few : many;
};

/** Дробь n/d в несократимом виде: «3/4», «−5/2», «2». */
const frs = (n, d) => {
  if (!d) return '∞';
  const g = gcd(n, d) || 1;
  let a = Math.round(n / g);
  let b = Math.round(d / g);
  if (b < 0) {
    a = -a;
    b = -b;
  }
  if (b === 1) return fmt(a, 0);
  return `${a < 0 ? '−' : ''}${Math.abs(a)}/${b}`;
};
/** Число как простая дробь, если знаменатель не больше maxD, иначе десятичная запись. */
const nice = (x, maxD = 12, d0 = 2) => {
  for (let d = 1; d <= maxD; d++) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < 1e-9) return frs(n, d);
  }
  return fmt(x, d0);
};

/** Число для формулы: отрицательное - в скобках, «(−3)». */
const pn = (x, d = 2) => (fmt(x, d).startsWith('−') ? `(${fmt(x, d)})` : fmt(x, d));
/** Многочлен строкой: polyStr([[1, 'x²'], [-2, 'x'], [3, '']]) → «x² − 2x + 3». */
const polyStr = (terms, f = (x) => fmt(x)) => {
  let s = '';
  for (const [k, v] of terms) {
    if (Math.abs(k) < 1e-9) continue;
    const num = v && f(Math.abs(k)) === '1' ? '' : f(Math.abs(k));
    s += s ? (k < 0 ? ' − ' : ' + ') : k < 0 ? '−' : '';
    s += num + v;
  }
  return s || '0';
};
/** Показатель степени верхними индексами: sup(-12) → «⁻¹²». */
const sup = (n) => String(fmt(n, 2)).replace(/[−\d,.]/g, (c) => ({ '−': '⁻', ',': '\u00b7', '.': '\u00b7' })[c] ?? '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]);
/** Путь графика с разрывами там, где он выходит за полосу [ylo, yhi] пикселей. */
function plotClip(fn, a, b, sx, sy, ylo, yhi, n = 160) {
  let d = '';
  let pen = false;
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    const y = fn(x);
    const Y = sy(y);
    if (!Number.isFinite(y) || Y < ylo - 2 || Y > yhi + 2) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${n1(sx(x))} ${n1(Y)} `;
    pen = true;
  }
  return d || 'M0 0';
}
/** Подпись из нескольких кусков L(...) или строк (через пробел). */
const J = (...ps) => {
  const o = {};
  for (const l of ['en', 'ru', 'kk']) o[l] = ps.filter(Boolean).map((p) => tx(p, l)).join(' ');
  return o;
};

// SVG-примитивы. Цвет - класс exc-* (штрих и заливка берут currentColor).
/** Текст: cls - размер (m9..m18), цвет (tc exc-o), выравнивание (ex-start, ex-end), h - обводка-подложка. */
const T = (x, y, s, cls = 'm12') => `<text class="${cls}" x="${n1(x)}" y="${n1(y)}">${esc(String(s))}</text>`;
const ln = (x1, y1, x2, y2, cls = 'exc-m', w = 1.5) => `<line class="ex-stroke ${cls}" style="stroke-width:${w}" x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}"/>`;
const dot = (x, y, r = 4, cls = 'exc-p') => `<circle class="ex-fill exm-dot ${cls}" cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}"/>`;
const ring = (x, y, r = 4, cls = 'exc-p', w = 2) => `<circle class="ex-stroke exm-hole ${cls}" style="stroke-width:${w}" cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}"/>`;
const box = (x, y, w, h, cls = 'exc-p', rx = 3, o = 1) => `<rect class="ex-fill ${cls}"${o < 1 ? ` style="opacity:${op(o)}"` : ''} x="${n1(x)}" y="${n1(y)}" width="${n1(Math.max(0, w))}" height="${n1(Math.max(0, h))}" rx="${rx}"/>`;
const soft = (x, y, w, h, cls = 'exc-p', rx = 3) => `<rect class="exm-soft ${cls}" x="${n1(x)}" y="${n1(y)}" width="${n1(Math.max(0, w))}" height="${n1(Math.max(0, h))}" rx="${rx}"/>`;
const pth = (d, cls = 'exc-p', w = 2.5) => `<path class="ex-stroke ${cls}" style="stroke-width:${w}" d="${d}"/>`;
const area = (d, cls = 'exc-p', o = 0.22) => `<path class="ex-fill ${cls}" style="opacity:${op(o)}" d="${d}"/>`;
const pts = (P) => P.map((p) => `${n1(p[0])} ${n1(p[1])}`).join(' L');
const poly = (P, cls = 'exc-p', o = 0.25) => `<path class="ex-fill ${cls}" style="opacity:${op(o)}" d="M${pts(P)} Z"/>`;
const hit = (key, x, y, r = 14) => `<circle class="ex-hit" data-drag="${key}" cx="${n1(x)}" cy="${n1(y)}" r="${r}"/>`;
/** Точка окружности: угол a (градусы, против часовой) от центра (cx, cy). */
const on = (cx, cy, r, a) => [cx + r * Math.cos(deg(a)), cy - r * Math.sin(deg(a))];
/** Дуга от угла a0 до a1 (градусы, против часовой); fill - закрашенный сектор. */
function arcD(cx, cy, r, a0, a1, fill = false) {
  const [x0, y0] = on(cx, cy, r, a0);
  const [x1, y1] = on(cx, cy, r, a1);
  const big = Math.abs(a1 - a0) % 360 > 180 ? 1 : 0;
  const sw = a1 >= a0 ? 0 : 1;
  if (Math.abs(a1 - a0) >= 359.99) return `M${n1(cx + r)} ${n1(cy)} A${r} ${r} 0 1 0 ${n1(cx - r)} ${n1(cy)} A${r} ${r} 0 1 0 ${n1(cx + r)} ${n1(cy)}${fill ? ' Z' : ''}`;
  return `${fill ? `M${n1(cx)} ${n1(cy)} L` : 'M'}${n1(x0)} ${n1(y0)} A${n1(r)} ${n1(r)} 0 ${big} ${sw} ${n1(x1)} ${n1(y1)}${fill ? ' Z' : ''}`;
}
/** Плашка задания справа сверху: цель, зелёная - когда решено. */
function badge(s, ok, x = 316, y = 4) {
  const w = Math.min(312, String(s).length * 6.2 + 18);
  return `<g class="${ok ? 'exc-g' : 'exc-o'}"><rect class="exm-soft" x="${n1(x - w)}" y="${y}" width="${n1(w)}" height="19" rx="9.5"/>${T(x - w / 2, y + 13.5, `${ok ? '✓ ' : ''}${s}`, 'm11 tc')}</g>`;
}

/**
 * Координатная сетка в прямоугольнике [X0, X1] × [Y0, Y1] пикселей для x ∈ [x0, x1], y ∈ [y0, y1].
 * step - шаг сетки, lab - шаг подписей. Возвращает { sx, sy, svg }.
 */
function grid({ x0, x1, y0, y1, X0 = 0, X1 = W, Y0 = 0, Y1 = H, step = 1, ystep = step, lab = 1, ylab = lab, labels = true }) {
  const sx = (x) => X0 + ((x - x0) / (x1 - x0)) * (X1 - X0);
  const sy = (y) => Y1 - ((y - y0) / (y1 - y0)) * (Y1 - Y0);
  let g = '';
  const eps = 1e-9;
  for (let x = Math.ceil(x0 / step - eps) * step; x <= x1 + eps; x += step) g += `<line class="ex-grid" x1="${n1(sx(x))}" y1="${Y0}" x2="${n1(sx(x))}" y2="${Y1}"/>`;
  for (let y = Math.ceil(y0 / ystep - eps) * ystep; y <= y1 + eps; y += ystep) g += `<line class="ex-grid" x1="${X0}" y1="${n1(sy(y))}" x2="${X1}" y2="${n1(sy(y))}"/>`;
  const ax = clamp(sy(0), Y0, Y1);
  const ay = clamp(sx(0), X0, X1);
  g += `<line class="ex-axis" x1="${X0}" y1="${n1(ax)}" x2="${X1}" y2="${n1(ax)}"/><line class="ex-axis" x1="${n1(ay)}" y1="${Y0}" x2="${n1(ay)}" y2="${Y1}"/>`;
  if (labels) {
    for (let x = Math.ceil(x0 / lab - eps) * lab; x <= x1 + eps; x += lab) if (Math.abs(x) > eps && sx(x) > X0 + 4 && sx(x) < X1 - 4) g += T(sx(x), ax + 10, fmt(x), 'm9 exm-mut');
    for (let y = Math.ceil(y0 / ylab - eps) * ylab; y <= y1 + eps; y += ylab) if (Math.abs(y) > eps && sy(y) > Y0 + 4 && sy(y) < Y1 - 4) g += T(ay - 3, sy(y) + 3, fmt(y), 'm9 exm-mut ex-end');
    g += T(ay - 3, ax + 10, '0', 'm9 exm-mut ex-end');
  }
  return { sx, sy, svg: g };
}

/** Числовая прямая от a до b на [X0, X1] на высоте y: деления через step, подписи через lab. */
function numLine(a, b, X0, X1, y, step = 1, lab = 1, label = (x) => fmt(x)) {
  const sx = (x) => X0 + ((x - a) / (b - a)) * (X1 - X0);
  let g = `<line class="ex-axis" x1="${X0 - 6}" y1="${y}" x2="${X1 + 6}" y2="${y}"/><path class="ex-fill exc-m" d="M${X1 + 10} ${y} l-7 -4 v8 Z"/>`;
  const n = Math.round((b - a) / step);
  for (let i = 0; i <= n && n <= 400; i++) {
    const x = a + i * step;
    const major = Math.abs(x / lab - Math.round(x / lab)) < 1e-6;
    g += ln(sx(x), y - (major ? 5 : 3), sx(x), y + (major ? 5 : 3), 'exc-m', major ? 1.4 : 1);
    if (major) g += T(sx(x), y + 16, label(x), 'm10 exm-mut');
  }
  return { sx, svg: g };
}

/**
 * Сцена с режимами. tabs - вкладки (подсвечена текущая st.m); acts - кнопки-действия
 * { label, only: [режимы, где видна] }. onTab(m, st, v, again, api) и onAct(j, st, v, api) возвращают патч значений.
 */
function modes({ tabs, acts = [], onTab, onAct, state, ...rest }) {
  const n = tabs.length;
  return {
    ...rest,
    buttons: [...tabs, ...acts.map((a) => a.label ?? a)],
    state: () => ({ m: 0, score: 0, task: null, ...(state?.() ?? {}) }),
    pressed: (i, v, st) => i === st.m,
    btnHidden: (i, v, st) => i >= n && Boolean(acts[i - n].only) && !acts[i - n].only.includes(st.m),
    onButton(i, st, v, api) {
      if (i < n) {
        const again = st.m === i;
        st.m = i;
        return onTab?.(i, st, v, again, api);
      }
      return onAct?.(i - n, st, v, api);
    },
  };
}
/** Ползунок виден только в режимах ms. */
const only = (...ms) => (v, st) => !ms.includes(st.m);

/** Засчитать задание (один раз) и вернуть ok. */
function check(st, ok) {
  if (ok && st.task && !st.task.done) {
    st.task.done = true;
    st.score += 1;
  }
  return Boolean(ok);
}
/** Подпись задания: условие и ✓ или подсказка. */
const taskCap = (st, ok, ask, hint) =>
  J(ask, ok ? L(`✓ Correct! Solved: ${st.score}. "Another ↻" - a new task.`, `✓ Верно! Решено: ${st.score}. «Ещё ↻» - новое задание.`, `✓ Дұрыс! Шешілді: ${st.score}. «Тағы ↻» - жаңа тапсырма.`) : hint);

// ---------- Дроби ----------

/** Дробь «столбиком»: числитель над чертой, знаменатель под ней; y - высота черты. */
function sfr(x, y, n, d, size = 18, col = '') {
  const w = Math.max(String(n).length, String(d).length) * size * 0.62 + 6;
  const cls = size >= 18 ? 'm18' : size >= 15 ? 'm15' : size >= 12 ? 'm12' : 'm11';
  return `<g class="${col}">${T(x, y - size * 0.3, n, `${cls} tc`)}<line class="ex-stroke" style="stroke-width:${size > 14 ? 2 : 1.4}" x1="${n1(x - w / 2)}" y1="${y}" x2="${n1(x + w / 2)}" y2="${y}"/>${T(x, y + size * 0.98, d, `${cls} tc`)}</g>`;
}

/** Пиццы для дроби a/b в прямоугольнике (x, y, w, h): по одной на каждое целое. */
function pizzas(a, b, x, y, w, h, on = 'on') {
  const k = Math.max(1, Math.ceil(a / b));
  const cols = k <= 2 ? k : k <= 6 ? 3 : 4;
  const rows = Math.ceil(k / cols);
  const cell = Math.min(w / cols, h / rows);
  const r = cell / 2 - 3;
  let g = '';
  for (let j = 0; j < k; j++) {
    const cx = x + (w - cols * cell) / 2 + (j % cols) * cell + cell / 2;
    const cy = y + (h - rows * cell) / 2 + Math.floor(j / cols) * cell + cell / 2;
    const fill = clamp(a - j * b, 0, b);
    if (b === 1) g += `<circle class="ex-slice ${fill ? on : ''}" cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}"/>`;
    else for (let i = 0; i < b; i++) g += `<path class="ex-slice ${i < fill ? on : ''}" style="--i:${i}" d="${arcD(cx, cy, r, 90 - (i / b) * 360, 90 - ((i + 1) / b) * 360, true)}"/>`;
  }
  return g;
}

/** Полоска на отрезке [0, M]: клетки по 1/b, закрашены первые a (цвет cls). */
function fbar(a, b, M, X0, X1, y, h, cls = 'exc-p', from = 0) {
  const n = M * b;
  const cw = (X1 - X0) / n;
  const gap = Math.min(1.2, cw * 0.18);
  let g = '';
  for (let i = 0; i < n; i++) {
    const on = i >= from && i < from + a;
    g += `<rect class="ex-fill ${on ? cls : 'exm-off'}" x="${n1(X0 + i * cw + gap / 2)}" y="${y}" width="${n1(cw - gap)}" height="${h}" rx="${cw > 8 ? 2 : 0}"/>`;
  }
  // границы целых
  for (let j = 1; j < M; j++) g += ln(X0 + j * b * cw, y - 3, X0 + j * b * cw, y + h + 3, 'exc-m', 2);
  return g;
}

/** Конечна ли десятичная запись n/d. */
const finiteDec = (n, d) => {
  let q = d / gcd(n, d);
  while (q % 2 === 0) q /= 2;
  while (q % 5 === 0) q /= 5;
  return q === 1;
};
/** Смешанное число для n/d (n > d > 0): «1 2/3». */
const mixed = (n, d) => {
  const s = n < 0 ? '−' : '';
  const N = Math.abs(n);
  const w = Math.floor(N / d);
  const r = N % d;
  if (!r) return `${s}${w}`;
  return `${s}${w ? `${w} ` : ''}${frs(r, d)}`;
};
/** «= 0,75» или «≈ 0,333». */
const pctEq = (n, d) => `${Math.abs(((1000 * n) / d) - Math.round((1000 * n) / d)) < 1e-9 ? '=' : '≈'} ${fmt((100 * n) / d, 1)}%`;
const decEq = (n, d) => `${finiteDec(n, d) && Math.abs((n / d) * 1000 - Math.round((n / d) * 1000)) < 1e-9 ? '=' : '≈'} ${fmt(n / d, 3)}`;

const FR_PRE = [[3, 4], [6, 8], [2, 3], [5, 3], [7, 4], [4, 4], [0, 5], [12, 4], [1, 12]];
const FR_PAIRS = [[3, 4, 2, 3], [1, 2, 3, 6], [5, 8, 3, 4], [2, 5, 1, 3], [7, 6, 5, 4], [3, 10, 1, 4]];
const FR_OPS = ['+', '−', '×', '÷'];

function frTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 4);
  while (type === last);
  let t;
  if (type === 0) {
    let p;
    const q = rnd(2, 6);
    do p = rnd(1, q - 1);
    while (gcd(p, q) !== 1);
    t = { p, q, tag: `= ${p}/${q}, b ≠ ${q}` };
  } else if (type === 1) {
    let n;
    let r;
    let q;
    do {
      q = rnd(2, 5);
      n = rnd(1, 2);
      r = rnd(1, q - 1);
    } while (gcd(r, q) !== 1 || n * q + r > 12);
    t = { n, r, q, p: n * q + r, tag: `${n} ${r}/${q} = a/b` };
  } else if (type === 2) {
    let c;
    let d;
    let tp;
    let tq;
    do {
      d = pick([2, 3, 4, 6]);
      c = rnd(1, d - 1);
      const b0 = pick([2, 3, 4, 6, 12]);
      const a0 = rnd(1, b0 - 1);
      tp = a0 * d + c * b0;
      tq = b0 * d;
      const g = gcd(tp, tq);
      tp /= g;
      tq /= g;
    } while (tq > 12 || gcd(c, d) !== 1);
    t = { c, d, tp, tq, tag: `a/b + ${c}/${d} = ${frs(tp, tq)}` };
  } else if (type === 3) {
    const [p, q] = pick([[1, 4], [1, 2], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [3, 2], [5, 4], [7, 10]]);
    t = { p, q, tag: `a/b = ${fmt(p / q, 3)}` };
  } else {
    const [l1, l2, h1, h2] = pick([[1, 2, 2, 3], [1, 3, 1, 2], [2, 3, 3, 4], [3, 4, 4, 5], [1, 4, 1, 3], [2, 5, 1, 2], [1, 5, 1, 4]]);
    t = { l1, l2, h1, h2, tag: `${l1}/${l2} < a/b < ${h1}/${h2}` };
  }
  st.task = { type, done: false, ...t };
  return { a: 1, b: 2 };
}

/** Картинка «одна дробь»: пиццы, полоска, числовая прямая, справа записи. extra(sx) - метки задания на прямой. */
function frOne(a, b, extra = () => '', right = true) {
  const M = Math.max(1, Math.ceil(a / b));
  const nl = numLine(0, M, 20, 300, 190, 1 / b, 1);
  const g = gcd(a, b) || 1;
  let rows = [];
  if (right) {
    if (a && g > 1) rows.push(`= ${a / g}/${b / g}`);
    if (a > b && a % b) rows.push(`= ${mixed(a, b)}`);
    if (a % b === 0) rows.push(`= ${a / b}`);
    rows.push(decEq(a, b));
    rows.push(pctEq(a, b));
  }
  rows = [...new Set(rows)].slice(0, 4);
  const px = nl.sx(a / b);
  return `${pizzas(a, b, 6, 4, 170, 142)}${fbar(a, b, M, 20, 300, 152, 16)}${nl.svg}${extra(nl.sx)}
    ${dot(px, 190, 5.5, 'exc-o')}${T(clamp(px, 16, 304), 181, `${a}/${b}`, 'm11 tc exc-o h')}
    ${right ? `${sfr(250, 38, a, b, 20)}${rows.map((s, i) => T(250, 82 + i * 18, s, 'm12')).join('')}` : ''}`;
}

const fractions = modes({
  title: L('Fractions', 'Обыкновенные дроби', 'Жай бөлшектер'),
  intro: L(
    'a/b: the whole is cut into b equal parts and a of them are taken. Compare, add, multiply and divide fractions in pictures.',
    'a/b: целое разрезали на b равных частей и взяли a из них. Сравнивай, складывай, умножай и дели дроби на картинке.',
    'a/b: бүтінді b тең бөлікке бөліп, a бөлігін алдық. Бөлшектерді суретпен салыстыр, қос, көбейт және бөл.',
  ),
  sliders: [
    { id: 'a', label: L('a - numerator', 'a - числитель', 'a - алым'), min: 0, max: 12, value: 3 },
    { id: 'b', label: L('b - denominator', 'b - знаменатель', 'b - бөлім'), min: 1, max: 12, value: 4 },
    { id: 'c', label: L('c - numerator 2', 'c - числитель 2', 'c - 2-алым'), min: 0, max: 12, value: 1, hidden: only(1, 2) },
    { id: 'd', label: L('d - denominator 2', 'd - знаменатель 2', 'd - 2-бөлім'), min: 1, max: 12, value: 6, hidden: only(1, 2) },
  ],
  tabs: [L('Fraction', 'Дробь', 'Бөлшек'), L('Compare', 'Сравнить', 'Салыстыру'), L('Operations', 'Действия', 'Амалдар'), TASK],
  acts: [{ label: '+ − × ÷ ↻', only: [2] }, { label: MORE }],
  state: () => ({ op: 0, pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return frTask(st);
    return null;
  },
  onAct(j, st, v) {
    if (j === 0) {
      st.op = (st.op + 1) % 4;
      return null;
    }
    if (st.m === 3) return frTask(st);
    if (st.m === 0) {
      st.pre = (st.pre + 1) % FR_PRE.length;
      const [a, b] = FR_PRE[st.pre];
      return { a, b };
    }
    st.pre = (st.pre + 1) % FR_PAIRS.length;
    const [a, b, c, d] = FR_PAIRS[st.pre];
    return { a, b, c, d };
  },
  draw(v, step, st) {
    const a = Math.round(v.a);
    const b = Math.max(1, Math.round(v.b));
    const c = Math.round(v.c);
    const d = Math.max(1, Math.round(v.d));
    const g = gcd(a, b) || 1;

    if (st.m === 0) {
      const sm = a && g > 1 ? ` ${a}/${b} = ${a / g}/${b / g}.` : '';
      const pct = `${a}/${b} ${decEq(a, b)} ${pctEq(a, b)}.`;
      let cap;
      if (a === 0) cap = L(`0/${b} = 0: the whole is cut into ${b} parts, but none is taken.`, `0/${b} = 0: целое разрезали на ${b} ${pl(b, 'часть', 'части', 'частей')}, но не взяли ни одной.`, `0/${b} = 0: бүтін ${b} бөлікке бөлінді, бірақ бірде-біреуі алынбады.`);
      else if (a === b) cap = L(`${a}/${b} = 1: all ${b} parts are taken - a whole.`, `${a}/${b} = 1: взяли все ${b} ${pl(b, 'часть', 'части', 'частей')} - это одно целое.`, `${a}/${b} = 1: барлық ${b} бөлік алынды - бұл бір бүтін.`);
      else if (a < b)
        cap = L(
          `The whole is cut into ${b} equal parts and ${a} are taken: a proper fraction ${a}/${b}.${sm ? ` Top and bottom divide by ${g}:${sm} The same amount, bigger parts.` : ''} ${pct}`,
          `Целое разрезали на ${b} ${pl(b, 'равную часть', 'равные части', 'равных частей')} и взяли ${a}: правильная дробь ${a}/${b}.${sm ? ` Числитель и знаменатель делятся на ${g}:${sm} Та же доля, только части крупнее.` : ''} ${pct}`,
          `Бүтін ${b} тең бөлікке бөлініп, ${a} бөлігі алынды: дұрыс бөлшек ${a}/${b}.${sm ? ` Алым мен бөлім ${g}-ге бөлінеді:${sm} Үлес сол, тек бөліктер ірі.` : ''} ${pct}`,
        );
      else {
        const w = Math.floor(a / b);
        const r = a % b;
        cap = r
          ? L(
              `${a}/${b} > 1 is an improper fraction: ${w} whole (${w * b}/${b}) and ${r}/${b} more, the mixed number ${mixed(a, b)}.${sm} ${pct}`,
              `${a}/${b} > 1 - неправильная дробь: ${w} цел. (${w * b}/${b}) и ещё ${r}/${b}, смешанное число ${mixed(a, b)}.${sm} ${pct}`,
              `${a}/${b} > 1 - бұрыс бөлшек: ${w} бүтін (${w * b}/${b}) және тағы ${r}/${b}, аралас сан ${mixed(a, b)}.${sm} ${pct}`,
            )
          : L(`${a}/${b} = ${a} ÷ ${b} = ${w}: exactly ${w} whole pizzas.`, `${a}/${b} = ${a} ÷ ${b} = ${w}: ровно ${w} ${pl(w, 'целая пицца', 'целых пиццы', 'целых пицц')}.`, `${a}/${b} = ${a} ÷ ${b} = ${w}: дәл ${w} бүтін пицца.`);
      }
      return { svg: frOne(a, b), caption: cap };
    }

    if (st.m === 1) {
      const M = Math.max(1, Math.ceil(Math.max(a / b, c / d)));
      const Lc = lcm(b, d);
      const A = (a * Lc) / b;
      const Cc = (c * Lc) / d;
      const s = a * d === c * b ? '=' : a * d > c * b ? '>' : '<';
      const sx = (x) => 46 + (x / M) * 260;
      let cuts = '';
      if (Lc * M <= 72 && Lc !== b) for (let i = 1; i < Lc * M; i++) if (i % (Lc / b)) cuts += ln(sx(i / Lc), 32, sx(i / Lc), 52, 'exc-m ex-dash', 1);
      if (Lc * M <= 72 && Lc !== d) for (let i = 1; i < Lc * M; i++) if (i % (Lc / d)) cuts += ln(sx(i / Lc), 78, sx(i / Lc), 98, 'exc-m ex-dash', 1);
      const nl = numLine(0, M, 46, 306, 136, Lc * M <= 48 ? 1 / Lc : 1, 1);
      const X = sx(a / b);
      const Y = sx(c / d);
      return {
        svg: `${fbar(a, b, M, 46, 306, 30, 22, 'exc-o')}${fbar(c, d, M, 46, 306, 76, 22, 'exc-b')}${cuts}
          ${sfr(22, 42, a, b, 12, 'exc-o')}${sfr(22, 88, c, d, 12, 'exc-b')}
          ${nl.svg}${ln(X, 104, X, 136, 'exc-o ex-dash', 1.2)}${ln(Y, 100, Y, 136, 'exc-b ex-dash', 1.2)}
          ${dot(X, 136, 5.5, 'exc-o')}${dot(Y, 136, 4, 'exc-b')}
          ${T(160, 184, `${a}/${b} ${s} ${c}/${d}`, 'm18')}${T(160, 206, `${A}/${Lc} ${s} ${Cc}/${Lc}`, 'm12 exm-mut')}`,
        caption:
          s === '='
            ? L(
                `Common denominator lcm(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc} and ${c}/${d} = ${Cc}/${Lc}. The numerators match - the fractions are equal, one and the same point on the line.`,
                `Общий знаменатель НОК(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc} и ${c}/${d} = ${Cc}/${Lc}. Числители равны - дроби равны, это одна и та же точка на прямой.`,
                `Ортақ бөлім ЕКОЕ(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc} және ${c}/${d} = ${Cc}/${Lc}. Алымдар тең - бөлшектер тең, түзудегі бір нүкте.`,
              )
            : L(
                `Bring to the common denominator lcm(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc}, ${c}/${d} = ${Cc}/${Lc}. ${A} ${s} ${Cc}, so ${a}/${b} ${s} ${c}/${d}. Cross check: ${a}·${d} = ${a * d} ${s} ${c}·${b} = ${c * b}.`,
                `Приводим к общему знаменателю НОК(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc}, ${c}/${d} = ${Cc}/${Lc}. ${A} ${s} ${Cc}, значит ${a}/${b} ${s} ${c}/${d}. Проверка крест-накрест: ${a}·${d} = ${a * d} ${s} ${c}·${b} = ${c * b}.`,
                `Ортақ бөлімге келтіреміз ЕКОЕ(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc}, ${c}/${d} = ${Cc}/${Lc}. ${A} ${s} ${Cc}, демек ${a}/${b} ${s} ${c}/${d}. Айқастыра тексеру: ${a}·${d} = ${a * d} ${s} ${c}·${b} = ${c * b}.`,
              ),
      };
    }

    if (st.m === 2) return frOps(a, b, c, d, st.op);

    // ----- Задание -----
    const tk = st.task ?? (frTask(st), st.task);
    let ok = false;
    let ask;
    let hint;
    let svg;
    const cur = `${a}/${b}`;
    if (tk.type === 2) {
      ok = (a * tk.d + tk.c * b) * tk.tq === tk.tp * b * tk.d;
      const op2 = frOps(a, b, tk.c, tk.d, 0, true);
      svg = op2.svg;
      ask = L(`Find a/b: a/b + ${tk.c}/${tk.d} = ${frs(tk.tp, tk.tq)}.`, `Найди a/b: a/b + ${tk.c}/${tk.d} = ${frs(tk.tp, tk.tq)}.`, `a/b табыңыз: a/b + ${tk.c}/${tk.d} = ${frs(tk.tp, tk.tq)}.`);
      const sum = frs(a * tk.d + tk.c * b, b * tk.d);
      hint = L(`Now ${cur} + ${tk.c}/${tk.d} = ${sum}. Hint: a/b = ${frs(tk.tp, tk.tq)} − ${tk.c}/${tk.d}, use a common denominator.`, `Сейчас ${cur} + ${tk.c}/${tk.d} = ${sum}. Подсказка: a/b = ${frs(tk.tp, tk.tq)} − ${tk.c}/${tk.d}, приведи к общему знаменателю.`, `Қазір ${cur} + ${tk.c}/${tk.d} = ${sum}. Кеңес: a/b = ${frs(tk.tp, tk.tq)} − ${tk.c}/${tk.d}, ортақ бөлімге келтір.`);
    } else {
      let mark = () => '';
      if (tk.type === 4) {
        ok = a * tk.l2 > tk.l1 * b && a * tk.h2 < tk.h1 * b;
        mark = (sx) => `${soft(sx(tk.l1 / tk.l2), 184, sx(tk.h1 / tk.h2) - sx(tk.l1 / tk.l2), 12, 'exc-g', 3)}`;
        const Lc = lcm(lcm(tk.l2, tk.h2), 12);
        ask = L(`Find a fraction between ${tk.l1}/${tk.l2} and ${tk.h1}/${tk.h2} (the green strip).`, `Найди дробь между ${tk.l1}/${tk.l2} и ${tk.h1}/${tk.h2} (зелёная полоска).`, `${tk.l1}/${tk.l2} мен ${tk.h1}/${tk.h2} арасындағы бөлшекті тап (жасыл жолақ).`);
        hint = L(`Hint: with denominator ${Lc}: ${(tk.l1 * Lc) / tk.l2}/${Lc} and ${(tk.h1 * Lc) / tk.h2}/${Lc} - take a numerator in between.`, `Подсказка: со знаменателем ${Lc}: ${(tk.l1 * Lc) / tk.l2}/${Lc} и ${(tk.h1 * Lc) / tk.h2}/${Lc} - возьми числитель между ними.`, `Кеңес: бөлімі ${Lc} болса: ${(tk.l1 * Lc) / tk.l2}/${Lc} және ${(tk.h1 * Lc) / tk.h2}/${Lc} - арасындағы алымды ал.`);
      } else {
        const p = tk.p;
        const q = tk.q;
        ok = a > 0 && a * q === p * b && (tk.type !== 0 || b !== q);
        mark = (sx) => (p / q <= Math.max(1, Math.ceil(a / b)) ? ring(sx(p / q), 190, 8, 'exc-g', 2.5) : '');
        if (tk.type === 0) {
          ask = L(`Make a fraction equal to ${p}/${q}, but with another denominator.`, `Получи дробь, равную ${p}/${q}, но с другим знаменателем.`, `${p}/${q}-ге тең, бірақ бөлімі басқа бөлшек құрастыр.`);
          hint =
            a * q === p * b
              ? L(`That is ${p}/${q} itself - take another denominator.`, `Это и есть ${p}/${q} - возьми другой знаменатель.`, `Бұл ${p}/${q}-тің өзі - басқа бөлім ал.`)
              : L(`Hint: multiply top and bottom by the same number, e.g. ${p}/${q} = ${2 * p}/${2 * q}.`, `Подсказка: умножь числитель и знаменатель на одно число, например ${p}/${q} = ${2 * p}/${2 * q}.`, `Кеңес: алым мен бөлімді бір санға көбейт, мысалы ${p}/${q} = ${2 * p}/${2 * q}.`);
        } else if (tk.type === 1) {
          ask = L(`Write the mixed number ${tk.n} ${tk.r}/${q} as a fraction a/b.`, `Запиши смешанное число ${tk.n} ${tk.r}/${q} дробью a/b.`, `${tk.n} ${tk.r}/${q} аралас санын a/b бөлшегімен жаз.`);
          hint = L(`Hint: ${tk.n} whole = ${tk.n * q}/${q}, plus ${tk.r}/${q}. Now ${cur} ${decEq(a, b)}.`, `Подсказка: ${tk.n} цел. = ${tk.n * q}/${q}, плюс ${tk.r}/${q}. Сейчас ${cur} ${decEq(a, b)}.`, `Кеңес: ${tk.n} бүтін = ${tk.n * q}/${q}, қосу ${tk.r}/${q}. Қазір ${cur} ${decEq(a, b)}.`);
        } else {
          ask = L(`Make a/b equal to the decimal ${fmt(p / q, 3)}.`, `Сделай дробь a/b равной ${fmt(p / q, 3)}.`, `a/b бөлшегін ${fmt(p / q, 3)} санына теңе.`);
          hint = L(`Now ${cur} ${decEq(a, b)}. Hint: ${fmt(p / q, 3)} = ${Math.round((p / q) * 1000)}/1000 - simplify it.`, `Сейчас ${cur} ${decEq(a, b)}. Подсказка: ${fmt(p / q, 3)} = ${Math.round((p / q) * 1000)}/1000 - сократи.`, `Қазір ${cur} ${decEq(a, b)}. Кеңес: ${fmt(p / q, 3)} = ${Math.round((p / q) * 1000)}/1000 - қысқарт.`);
        }
      }
      svg = frOne(a, b, mark, false) + sfr(250, 60, a, b, 20);
      svg += T(250, 108, decEq(a, b), 'm12');
    }
    ok = check(st, ok);
    return { svg: `${svg}${badge(tk.tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
  },
});

/** Действия с дробями: op 0..3 = + − × ÷. task - без подписи формулы результата. */
function frOps(a, b, c, d, op, task = false) {
  const S = FR_OPS[op];
  if (op <= 1) {
    const Lc = lcm(b, d);
    const A = (a * Lc) / b;
    const Cc = (c * Lc) / d;
    const R = op ? A - Cc : A + Cc;
    const M = Math.max(1, Math.ceil(op ? Math.max(a / b, c / d) : a / b + c / d));
    const fine = Lc * M <= 72;
    const X0 = 46;
    const X1 = 306;
    const sx = (x) => X0 + (x / M) * (X1 - X0);
    const strip = (from, n, y, cls) => box(sx(from / Lc), y, sx(n / Lc) - X0, 20, cls, 2, 0.85);
    const ticks = (y) => {
      let s = '';
      if (fine) for (let i = 1; i < Lc * M; i++) s += ln(sx(i / Lc), y, sx(i / Lc), y + 20, 'exc-m', i % Lc ? 0.6 : 2);
      return s;
    };
    const base = (y) => box(X0, y, X1 - X0, 20, 'exm-off', 2);
    let res = base(108);
    if (op === 0) res += strip(0, A, 108, 'exc-o') + strip(A, Cc, 108, 'exc-b');
    else if (R >= 0) res += strip(0, R, 108, 'exc-o') + `<rect class="exm-soft exc-b ex-dash" x="${n1(sx(R / Lc))}" y="108" width="${n1(sx(Cc / Lc) - X0)}" height="20"/>`;
    else res += strip(0, Cc, 108, 'exc-r') + strip(0, A, 108, 'exc-o');
    const nl = numLine(0, M, X0, X1, 152, fine && Lc * M <= 48 ? 1 / Lc : 1, 1);
    const simp = frs(R, Lc);
    const g2 = gcd(R, Lc) || 1;
    const tail = `${simp !== `${R}/${Lc}` ? ` = ${simp}` : ''}${Math.abs(R) > Lc && R % Lc ? ` = ${mixed(R / g2, Lc / g2)}` : ''}`;
    const svg = `${base(26)}${strip(0, A, 26, 'exc-o')}${ticks(26)}${base(66)}${strip(0, Cc, 66, 'exc-b')}${ticks(66)}${res}${ticks(108)}
      ${sfr(22, 37, a, b, 12, 'exc-o')}${sfr(22, 77, c, d, 12, 'exc-b')}${T(22, 123, '=', 'm15')}
      ${nl.svg}${R >= 0 ? dot(sx(R / Lc), 152, 5.5, 'exc-p') : ''}
      ${T(160, 188, `${a}/${b} ${S} ${c}/${d} = ${A}/${Lc} ${S} ${Cc}/${Lc}`, 'm12')}${task ? '' : T(160, 208, `= ${R < 0 ? '−' : ''}${Math.abs(R)}/${Lc}${tail}`, 'm12 tc exc-p')}`;
    if (task) return { svg };
    const same = b === d;
    const pre = same
      ? L(`The denominators are equal (${b}), so we ${op ? 'subtract' : 'add'} only the numerators.`, `Знаменатели одинаковые (${b}) - ${op ? 'вычитаем' : 'складываем'} только числители.`, `Бөлімдер бірдей (${b}) - тек алымдарды ${op ? 'азайтамыз' : 'қосамыз'}.`)
      : L(`Different denominators: bring both to lcm(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc}, ${c}/${d} = ${Cc}/${Lc}.`, `Знаменатели разные: приводим к НОК(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc}, ${c}/${d} = ${Cc}/${Lc}.`, `Бөлімдер әртүрлі: ЕКОЕ(${b}, ${d}) = ${Lc}-ге келтіреміз: ${a}/${b} = ${A}/${Lc}, ${c}/${d} = ${Cc}/${Lc}.`);
    const post = L(
      `Then ${A} ${S} ${Cc} = ${R}, the denominator stays ${Lc}: ${R}/${Lc}${tail}.${R < 0 ? ' The result is negative: the blue part is longer.' : ''}`,
      `Затем ${A} ${S} ${Cc} = ${R}, знаменатель остаётся ${Lc}: ${R}/${Lc}${tail}.${R < 0 ? ' Ответ отрицательный: синяя часть длиннее.' : ''}`,
      `Сосын ${A} ${S} ${Cc} = ${R}, бөлім ${Lc} болып қалады: ${R}/${Lc}${tail}.${R < 0 ? ' Жауап теріс: көк бөлік ұзынырақ.' : ''}`,
    );
    return { svg, caption: J(pre, post) };
  }
  if (op === 2) {
    // Площадь: прямоугольник a/b на c/d внутри единичных квадратов.
    const U = Math.max(1, Math.ceil(a / b), Math.ceil(c / d));
    const s = 150 / U;
    const X0 = 14;
    const Y0 = 22;
    const w = (a / b) * s;
    const h = (c / d) * s;
    let g = '';
    for (let i = 0; i < U; i++) for (let j = 0; j < U; j++) g += `<rect class="exm-off" x="${n1(X0 + i * s)}" y="${n1(Y0 + j * s)}" width="${n1(s - 1)}" height="${n1(s - 1)}" rx="2"/>`;
    g += box(X0, Y0, w, U * s, 'exc-o', 0, 0.35) + box(X0, Y0, U * s, h, 'exc-b', 0, 0.35) + box(X0, Y0, w, h, 'exc-p', 0, 0.85);
    if (U * b <= 48) for (let i = 1; i < U * b; i++) g += ln(X0 + (i * s) / b, Y0, X0 + (i * s) / b, Y0 + U * s, 'exc-m', i % b ? 0.5 : 1.5);
    if (U * d <= 48) for (let j = 1; j < U * d; j++) g += ln(X0, Y0 + (j * s) / d, X0 + U * s, Y0 + (j * s) / d, 'exc-m', j % d ? 0.5 : 1.5);
    g += T(X0 + w / 2, 15, `${a}/${b}`, 'm11 tc exc-o') + T(X0 + U * s + 4, Y0 + h / 2 + 4, `${c}/${d}`, 'm11 tc exc-b ex-start');
    const P = a * c;
    const Q = b * d;
    const rows = [`${a}/${b} × ${c}/${d}`, `= (${a}·${c})/(${b}·${d})`, `= ${P}/${Q}`];
    if (frs(P, Q) !== `${P}/${Q}`) rows.push(`= ${frs(P, Q)}`);
    return {
      svg: `${g}${rows.map((r, i) => T(248, 56 + i * 24, r, i ? 'm12' : 'm15')).join('')}`,
      caption: L(
        `Multiply top by top and bottom by bottom: (${a}·${c})/(${b}·${d}) = ${P}/${Q}${frs(P, Q) !== `${P}/${Q}` ? ` = ${frs(P, Q)}` : ''}. In the picture the purple rectangle ${a}/${b} by ${c}/${d} has ${P} small cells, and a whole square has ${Q}.`,
        `Числитель умножаем на числитель, знаменатель на знаменатель: (${a}·${c})/(${b}·${d}) = ${P}/${Q}${frs(P, Q) !== `${P}/${Q}` ? ` = ${frs(P, Q)}` : ''}. На картинке: фиолетовый прямоугольник ${a}/${b} на ${c}/${d} - это ${P} маленьких клеток, а целый квадрат - ${Q}.`,
        `Алымды алымға, бөлімді бөлімге көбейтеміз: (${a}·${c})/(${b}·${d}) = ${P}/${Q}${frs(P, Q) !== `${P}/${Q}` ? ` = ${frs(P, Q)}` : ''}. Суретте ${a}/${b}-ге ${c}/${d} күлгін тіктөртбұрышта ${P} кішкене тор бар, ал тұтас шаршыда - ${Q}.`,
      ),
    };
  }
  // Деление: сколько раз c/d помещается в a/b.
  if (c === 0)
    return {
      svg: `${frOne(a, b, () => '', false)}${T(250, 60, `${a}/${b} ÷ 0/${d}`, 'm15')}${T(250, 90, '= ?', 'm18 tc exc-r')}`,
      caption: L(`c/d = 0/${d} = 0, and you cannot divide by zero. Make c bigger than 0.`, `c/d = 0/${d} = 0, а на ноль делить нельзя. Сделай c больше нуля.`, `c/d = 0/${d} = 0, ал нөлге бөлуге болмайды. c-ны нөлден үлкен ет.`),
    };
  const x = a / b;
  const y = c / d;
  const M = Math.max(1, Math.ceil(Math.max(x, y)));
  const sx = (t) => 30 + (t / M) * 270;
  const qn = a * d;
  const qd = b * c;
  const qv = qn / qd;
  let pcs = '';
  const whole = Math.floor(qv + 1e-9);
  if (whole <= 60) {
    for (let i = 0; i < whole; i++) pcs += box(sx(i * y) + 0.6, 80, sx(y) - 30 - 1.2, 22, i % 2 ? 'exc-b' : 'exc-k', 2, 0.85) + (whole <= 12 ? T(sx((i + 0.5) * y), 95, i + 1, 'm10') : '');
    const rest = qv - whole;
    if (rest > 1e-9) pcs += box(sx(whole * y) + 0.6, 80, (sx(y) - 30) * rest - 1.2, 22, 'exc-b', 2, 0.35) + `<rect class="ex-stroke exc-b ex-dash" style="fill:none;stroke-width:1" x="${n1(sx(whole * y))}" y="80" width="${n1(sx(y) - 30)}" height="22"/>`;
  }
  const nl = numLine(0, M, 30, 300, 136, M * b <= 48 ? 1 / b : 1, 1);
  const res = frs(qn, qd);
  const mx = qv > 1 && qn % qd ? ` = ${mixed(qn / gcd(qn, qd), qd / gcd(qn, qd))}` : '';
  return {
    svg: `${box(30, 40, sx(x) - 30, 22, 'exc-o', 2, 0.85)}${T(30, 34, `${a}/${b}`, 'm11 tc exc-o ex-start')}${pcs}${T(30, 116, `${c}/${d}`, 'm11 tc exc-b ex-start')}${nl.svg}${dot(sx(x), 136, 5, 'exc-o')}
      ${T(160, 182, `${a}/${b} ÷ ${c}/${d} = ${a}/${b} × ${d}/${c}`, 'm12')}${T(160, 204, `= ${qn}/${qd}${res !== `${qn}/${qd}` ? ` = ${res}` : ''}${mx}`, 'm12 tc exc-p')}`,
    caption: L(
      `How many pieces ${c}/${d} fit into ${a}/${b}? Dividing by a fraction = multiplying by the flipped one: ${a}/${b} × ${d}/${c} = ${qn}/${qd}${res !== `${qn}/${qd}` ? ` = ${res}` : ''}${mx}. The answer ${nice(qv, 12)} is how many pieces ${c}/${d} fit in ${a}/${b}.`,
      `Сколько кусков по ${c}/${d} помещается в ${a}/${b}? Делить на дробь = умножать на перевёрнутую: ${a}/${b} × ${d}/${c} = ${qn}/${qd}${res !== `${qn}/${qd}` ? ` = ${res}` : ''}${mx}. Ответ ${nice(qv, 12)} - столько кусков по ${c}/${d} в ${a}/${b}.`,
      `${a}/${b} ішіне ${c}/${d} бөлігі неше рет сыяды? Бөлшекке бөлу = аударылған бөлшекке көбейту: ${a}/${b} × ${d}/${c} = ${qn}/${qd}${res !== `${qn}/${qd}` ? ` = ${res}` : ''}${mx}. Жауап ${nice(qv, 12)} - ${a}/${b} ішіндегі ${c}/${d} бөліктерінің саны.`,
    ),
  };
}

// ---------- Проценты ----------

/** Сетка 10×10: закрашено p клеток (дробная часть - частично), cls - цвет. */
function grid100(p, x, y, c, cls = 'exc-p') {
  let g = '';
  const full = Math.floor(p + 1e-9);
  for (let i = 0; i < 100; i++) {
    const cx = x + (i % 10) * c;
    const cy = y + Math.floor(i / 10) * c;
    g += `<rect class="ex-fill ${i < full ? cls : 'exm-off'}" x="${n1(cx)}" y="${n1(cy)}" width="${n1(c - 1.2)}" height="${n1(c - 1.2)}" rx="${c > 10 ? 2 : 1}"/>`;
  }
  const part = p - full;
  if (part > 1e-6 && full < 100) g += box(x + (full % 10) * c, y + Math.floor(full / 10) * c, (c - 1.2) * part, c - 1.2, cls, 1);
  return g;
}
/** Две сетки (до 200%) в рамке шириной wd. */
function grids(p, x, y, wd, cls) {
  if (p <= 100) return grid100(p, x, y, wd / 10, cls);
  const c = (wd - 6) / 20;
  return grid100(100, x, y + 40, c, cls) + grid100(p - 100, x + wd / 2 + 3, y + 40, c, 'exc-o') + T(x + wd / 4, y + 34, '100%', 'm10 exm-mut') + T(x + (3 * wd) / 4, y + 34, `+${fmt(p - 100)}%`, 'm10 tc exc-o');
}
/** p% как дробь, если красиво: 25% = 1/4. */
const pctFrac = (p) => {
  const n = Math.round(p * 2);
  if (Math.abs(n - p * 2) > 1e-9) return '';
  const f = frs(n, 200);
  return f.includes('/') && Number(f.split('/')[1]) <= 20 ? f : '';
};

const PCT_PRE = [{ p: 50, N: 300 }, { p: 25, N: 480 }, { p: 10, N: 750 }, { p: 12.5, N: 800 }, { p: 150, N: 200 }, { p: 1, N: 1200 }];

function pctTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  if (type === 0) {
    let N;
    let P;
    do {
      N = pick([200, 400, 500, 800, 50, 120, 250, 600, 1000]);
      P = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 120, 150]);
    } while (((N * P) / 100) % 1);
    st.task = { type, N, P, A: (N * P) / 100, done: false };
    return { N, p: 0 };
  }
  if (type === 1) {
    let X;
    let P;
    do {
      X = rnd(5, 100) * 10;
      P = pick([10, 20, 25, 30, 40, 50, 60, 75, 80]);
    } while (((X * P) / 100) % 1);
    st.task = { type, X, P, A: (X * P) / 100, done: false };
    return { p: P, N: 10 };
  }
  let N;
  let P;
  const up = Math.random() < 0.5;
  do {
    N = pick([200, 400, 500, 800, 1200, 1500, 250, 600]);
    P = pick([5, 10, 15, 20, 25, 30, 40, 50]);
  } while (((N * P) / 100) % 1);
  const M = (N * (100 + (up ? P : -P))) / 100;
  st.task = { type, N, P, M, up, done: false };
  st.sg = up ? 1 : -1;
  return { N, p: 0 };
}

const percent = modes({
  title: L('Percentages', 'Проценты', 'Пайыздар'),
  intro: L('1% is one hundredth of a number. Find a part, a whole, or a change in percent.', '1% - это сотая часть числа. Находим часть, целое и изменение в процентах.', '1% - санның жүзден бір бөлігі. Бөлікті, бүтінді және пайыздық өзгерісті табамыз.'),
  sliders: [
    { id: 'p', label: 'p, %', min: 0, max: 200, step: 0.5, value: 25 },
    { id: 'N', label: L('number N', 'число N', 'N саны'), min: 10, max: 2000, step: 10, value: 400 },
  ],
  tabs: [L('Part', 'Часть', 'Бөлік'), L('Change', 'Изменение', 'Өзгеріс'), L('Whole', 'Целое', 'Бүтін'), TASK],
  acts: [{ label: '+ / −', only: [1] }, { label: MORE }],
  state: () => ({ sg: 1, pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return pctTask(st);
    return null;
  },
  onAct(j, st) {
    if (j === 0) {
      st.sg = -st.sg;
      return null;
    }
    if (st.m === 3) return pctTask(st);
    st.pre = (st.pre + 1) % PCT_PRE.length;
    return { ...PCT_PRE[st.pre] };
  },
  draw(v, step, st) {
    const { p, N } = v;
    const one = N / 100;
    const val = (N * p) / 100;
    const fr = pctFrac(p);

    const partView = (pp, NN, cls = 'exc-p', hide = false) => {
      const vv = (NN * pp) / 100;
      const sx = (x) => 12 + (x / Math.max(NN, vv)) * 296;
      return `${grids(pp, 12, 12, 160, cls)}
        ${T(244, 34, `N = ${fmt(NN)}`, 'm12')}${T(244, 56, `1% = ${fmt(NN)} : 100 = ${fmt(NN / 100)}`, 'm10 exm-mut')}
        ${T(244, 92, hide ? '?%' : `${fmt(pp)}%`, 'm18 tc exc-p')}${T(244, 118, `= ${fmt(NN / 100)} · ${hide ? '?' : fmt(pp)} = ${fmt(vv)}`, 'm12')}
        ${!hide && pctFrac(pp) ? T(244, 140, `${fmt(pp)}% = ${pctFrac(pp)} · N`, 'm11 exm-mut') : ''}${!hide ? T(244, 158, `${fmt(pp)}% = ${fmt(pp / 100, 3)} · N`, 'm11 exm-mut') : ''}
        ${box(12, 186, sx(NN) - 12, 14, 'exm-off', 4)}${box(12, 186, sx(vv) - 12, 14, cls, 4, 0.9)}${T(12, 214, '0', 'm9 exm-mut ex-start')}${T(sx(NN), 182, `N = ${fmt(NN)}`, 'm9 exm-mut ex-end')}${T(clamp(sx(vv), 30, 300), 214, fmt(vv), 'm10 tc exc-p')}`;
    };

    const changeView = (pp, NN, sg) => {
      const nw = Math.max(0, NN * (1 + (sg * pp) / 100));
      const top = Math.max(NN, nw);
      const sx = (x) => 14 + (x / top) * 280;
      const diff = nw - NN;
      const k = 1 + (sg * pp) / 100;
      return `${T(14, 26, u('was: 100%', 'было: 100%', 'бұрын: 100%'), 'm11 ex-start exm-mut')}${box(14, 32, sx(NN) - 14, 26, 'exc-b', 5, 0.85)}${T(sx(NN) - 6, 50, fmt(NN), 'm12 ex-end exm-on')}
        ${T(14, 84, `${u('now', 'стало', 'қазір')}: ${fmt(100 + sg * pp)}%`, 'm11 ex-start exm-mut')}${box(14, 90, sx(nw) - 14, 26, 'exc-p', 5, 0.85)}${nw > top * 0.15 ? T(sx(nw) - 6, 108, fmt(nw), 'm12 ex-end exm-on') : T(sx(nw) + 4, 108, fmt(nw), 'm12 ex-start')}
        ${diff ? `${box(sx(Math.min(NN, nw)), 124, Math.abs(sx(nw) - sx(NN)), 8, sg > 0 ? 'exc-g' : 'exc-r', 3)}${ln(sx(NN), 32, sx(NN), 134, 'exc-m ex-dash', 1)}${T((sx(NN) + sx(nw)) / 2, 148, `${sg > 0 ? '+' : '−'}${fmt(pp)}% = ${sg > 0 ? '+' : '−'}${fmt(Math.abs(diff))}`, `m11 tc ${sg > 0 ? 'exc-g' : 'exc-r'}`)}` : ''}
        ${T(160, 180, `${fmt(NN)} · (1 ${sg > 0 ? '+' : '−'} ${fmt(pp / 100, 3)}) = ${fmt(NN)} · ${fmt(k, 3)} = ${fmt(nw)}`, 'm12')}
        ${sg > 0 && pp > 0 ? T(160, 204, `${u('then', 'а потом', 'кейін')} −${fmt(pp)}%: ${fmt(nw)} · ${fmt(1 - pp / 100, 3)} = ${fmt(Math.max(0, nw * (1 - pp / 100)))} ≠ ${fmt(NN)}`, 'm10 exm-mut') : ''}`;
    };

    if (st.m === 0)
      return {
        svg: partView(p, N),
        caption: L(
          `1% of ${fmt(N)} is ${fmt(N)} ÷ 100 = ${fmt(one)} (one cell). ${fmt(p)}% is ${fmt(p)} cells: ${fmt(one)} · ${fmt(p)} = ${fmt(val)}.${fr ? ` Shortcut: ${fmt(p)}% = ${fr}, so take ${fr} of ${fmt(N)}.` : ''}${p > 100 ? ' More than 100% - more than the whole number.' : ''}`,
          `1% от ${fmt(N)} = ${fmt(N)} ÷ 100 = ${fmt(one)} (одна клетка). ${fmt(p)}% - это ${fmt(p)} клеток: ${fmt(one)} · ${fmt(p)} = ${fmt(val)}.${fr ? ` Быстрее: ${fmt(p)}% = ${fr}, то есть ${fr} от ${fmt(N)}.` : ''}${p > 100 ? ' Больше 100% - больше всего числа.' : ''}`,
          `${fmt(N)}-нің 1%-ы = ${fmt(N)} ÷ 100 = ${fmt(one)} (бір торкөз). ${fmt(p)}% - ${fmt(p)} торкөз: ${fmt(one)} · ${fmt(p)} = ${fmt(val)}.${fr ? ` Тезірек: ${fmt(p)}% = ${fr}, яғни ${fmt(N)}-нің ${fr} бөлігі.` : ''}${p > 100 ? ' 100%-дан көп - бүкіл саннан көп.' : ''}`,
        ),
      };

    if (st.m === 1) {
      const sg = st.sg;
      const k = 1 + (sg * p) / 100;
      const nw = N * k;
      if (sg < 0 && p > 100)
        return {
          svg: changeView(100, N, -1),
          caption: L('A price cannot fall by more than 100%: at −100% it is already 0.', 'Цена не может упасть больше чем на 100%: при −100% она уже равна 0.', 'Баға 100%-дан артық төмендей алмайды: −100% болғанда ол 0-ге тең.'),
        };
      return {
        svg: changeView(p, N, sg),
        caption:
          sg > 0
            ? L(
                `+${fmt(p)}%: the new value is ${fmt(100 + p)}% of the old one: ${fmt(N)} · ${fmt(k, 3)} = ${fmt(nw)}. Trap: −${fmt(p)}% after that gives ${fmt(nw * (1 - p / 100))}, not ${fmt(N)} - the second percent is taken from a bigger number.`,
                `+${fmt(p)}%: новое значение - ${fmt(100 + p)}% от старого: ${fmt(N)} · ${fmt(k, 3)} = ${fmt(nw)}. Ловушка: если потом снизить на ${fmt(p)}%, будет ${fmt(nw * (1 - p / 100))}, а не ${fmt(N)} - второй процент берётся от большего числа.`,
                `+${fmt(p)}%: жаңа мән ескінің ${fmt(100 + p)}%-ы: ${fmt(N)} · ${fmt(k, 3)} = ${fmt(nw)}. Тұзақ: кейін ${fmt(p)}%-ға төмендетсең, ${fmt(N)} емес, ${fmt(nw * (1 - p / 100))} шығады - екінші пайыз үлкен саннан алынады.`,
              )
            : L(
                `−${fmt(p)}% (a discount): what is left is ${fmt(100 - p)}% of the old value: ${fmt(N)} · ${fmt(k, 3)} = ${fmt(nw)}. The discount itself is ${fmt(N - nw)}.`,
                `−${fmt(p)}% (скидка): остаётся ${fmt(100 - p)}% от старого: ${fmt(N)} · ${fmt(k, 3)} = ${fmt(nw)}. Сама скидка - ${fmt(N - nw)}.`,
                `−${fmt(p)}% (жеңілдік): ескінің ${fmt(100 - p)}%-ы қалады: ${fmt(N)} · ${fmt(k, 3)} = ${fmt(nw)}. Жеңілдіктің өзі - ${fmt(N - nw)}.`,
              ),
      };
    }

    if (st.m === 2) {
      if (p === 0)
        return {
          svg: `${grid100(0, 12, 12, 16)}${T(244, 100, '0% = ?', 'm18')}`,
          caption: L('0% of any number is 0, so the whole cannot be found. Make p bigger than 0.', '0% от любого числа - это 0, поэтому целое найти нельзя. Сделай p больше нуля.', 'Кез келген санның 0%-ы - 0, сондықтан бүтінді табу мүмкін емес. p-ны 0-ден үлкен ет.'),
        };
      const X = (N * 100) / p;
      return {
        svg: `${grids(p, 12, 12, 160, 'exc-o')}${p <= 100 ? `<rect class="ex-stroke exc-p" style="fill:none;stroke-width:2.5" x="10" y="10" width="162" height="162" rx="4"/>` : ''}
          ${T(244, 34, `${fmt(p)}% = ${fmt(N)}`, 'm15 tc exc-o')}${T(244, 66, `1% = ${fmt(N)} : ${fmt(p)}`, 'm12')}${T(244, 86, `= ${fmt(N / p, 3)}`, 'm12')}
          ${T(244, 120, `100% = ${fmt(N / p, 3)} · 100`, 'm12')}${T(244, 148, `X = ${fmt(X)}`, 'm18 tc exc-p')}${T(244, 172, `X = N · 100 : p`, 'm10 exm-mut')}`,
        caption: L(
          `${fmt(p)}% of an unknown number X is ${fmt(N)}. One percent is ${fmt(N)} ÷ ${fmt(p)} = ${fmt(N / p, 3)}, all 100% are ${fmt(N / p, 3)} · 100 = ${fmt(X)}. Check: ${fmt(p)}% of ${fmt(X)} = ${fmt((X * p) / 100)}.`,
          `${fmt(p)}% неизвестного числа X равны ${fmt(N)}. Один процент - ${fmt(N)} ÷ ${fmt(p)} = ${fmt(N / p, 3)}, все 100% - ${fmt(N / p, 3)} · 100 = ${fmt(X)}. Проверка: ${fmt(p)}% от ${fmt(X)} = ${fmt((X * p) / 100)}.`,
          `Белгісіз X санының ${fmt(p)}%-ы ${fmt(N)}-ге тең. Бір пайыз - ${fmt(N)} ÷ ${fmt(p)} = ${fmt(N / p, 3)}, барлық 100% - ${fmt(N / p, 3)} · 100 = ${fmt(X)}. Тексеру: ${fmt(X)}-тің ${fmt(p)}%-ы = ${fmt((X * p) / 100)}.`,
        ),
      };
    }

    // ----- Задание -----
    const tk = st.task ?? (pctTask(st), st.task);
    let ok;
    let svg;
    let ask;
    let hint;
    if (tk.type === 0) {
      ok = near(p, tk.P, 0.01);
      svg = partView(p, N) + badge(`${fmt(tk.A)} = ?% · ${fmt(tk.N)}`, ok);
      ask = L(`What percent of ${fmt(tk.N)} is ${fmt(tk.A)}? Set p.`, `Сколько процентов от ${fmt(tk.N)} составляет ${fmt(tk.A)}? Установи p.`, `${fmt(tk.A)} саны ${fmt(tk.N)}-нің неше пайызы? p-ны орнат.`);
      hint = L(`Now ${fmt(p)}% of ${fmt(N)} = ${fmt(val)}. Hint: p = part ÷ whole · 100.`, `Сейчас ${fmt(p)}% от ${fmt(N)} = ${fmt(val)}. Подсказка: p = часть ÷ целое · 100.`, `Қазір ${fmt(N)}-нің ${fmt(p)}%-ы = ${fmt(val)}. Кеңес: p = бөлік ÷ бүтін · 100.`);
    } else if (tk.type === 1) {
      ok = near(N, tk.X, 0.01) && near(p, tk.P, 0.01);
      svg = partView(p, N, 'exc-o') + badge(`${fmt(tk.P)}% · N = ${fmt(tk.A)}`, ok);
      ask = L(`${fmt(tk.P)}% of a number is ${fmt(tk.A)}. Find the number: set N (p = ${fmt(tk.P)}%).`, `${fmt(tk.P)}% числа равны ${fmt(tk.A)}. Найди число: установи N (p = ${fmt(tk.P)}%).`, `Санның ${fmt(tk.P)}%-ы ${fmt(tk.A)}-ге тең. Санды тап: N-ді орнат (p = ${fmt(tk.P)}%).`);
      hint = L(`Now ${fmt(p)}% of ${fmt(N)} = ${fmt(val)}. Hint: N = ${fmt(tk.A)} · 100 : ${fmt(tk.P)}.`, `Сейчас ${fmt(p)}% от ${fmt(N)} = ${fmt(val)}. Подсказка: N = ${fmt(tk.A)} · 100 : ${fmt(tk.P)}.`, `Қазір ${fmt(N)}-нің ${fmt(p)}%-ы = ${fmt(val)}. Кеңес: N = ${fmt(tk.A)} · 100 : ${fmt(tk.P)}.`);
    } else {
      ok = near(p, tk.P, 0.01) && near(N, tk.N, 0.01);
      svg = changeView(Math.min(p, tk.up ? 200 : 100), N, tk.up ? 1 : -1) + badge(`${fmt(tk.N)} → ${fmt(tk.M)}`, ok);
      ask = tk.up
        ? L(`The price rose from ${fmt(tk.N)} to ${fmt(tk.M)}. By how many percent? Set p.`, `Цена выросла с ${fmt(tk.N)} до ${fmt(tk.M)}. На сколько процентов? Установи p.`, `Баға ${fmt(tk.N)}-ден ${fmt(tk.M)}-ге өсті. Неше пайызға? p-ны орнат.`)
        : L(`The price fell from ${fmt(tk.N)} to ${fmt(tk.M)}. What is the discount in percent? Set p.`, `Цена снизилась с ${fmt(tk.N)} до ${fmt(tk.M)}. Какая скидка в процентах? Установи p.`, `Баға ${fmt(tk.N)}-ден ${fmt(tk.M)}-ге түсті. Жеңілдік неше пайыз? p-ны орнат.`);
      hint = L(`Hint: the change is ${fmt(Math.abs(tk.M - tk.N))}; divide it by the OLD price ${fmt(tk.N)} and multiply by 100.`, `Подсказка: изменение ${fmt(Math.abs(tk.M - tk.N))}; раздели его на СТАРУЮ цену ${fmt(tk.N)} и умножь на 100.`, `Кеңес: өзгеріс ${fmt(Math.abs(tk.M - tk.N))}; оны ЕСКІ баға ${fmt(tk.N)}-ге бөліп, 100-ге көбейт.`);
    }
    ok = check(st, ok);
    return { svg, caption: taskCap(st, ok, ask, hint) };
  },
});

// ---------- Линейная функция ----------

const LIN = { x0: -8, x1: 8, y0: -5.5, y1: 5.5 };
const lsx = (x) => 160 + x * 20;
const lsy = (y) => 110 - y * 20;
/** Прямая y = kx + b через всю сцену. */
const fullLine = (k, b, cls = 'exc-p', w = 3) => pth(`M${lsx(-9)} ${n1(lsy(-9 * k + b))} L${lsx(9)} ${n1(lsy(9 * k + b))}`, cls, w);
/** k как дробь для подписи. */
const kStr = (k) => nice(k, 10);
/** «y = 2x − 3» с красивыми дробями. */
const lineStr = (k, b) => {
  const K = kStr(k);
  const kx = K === '0' ? '' : K === '1' ? 'x' : K === '−1' ? '−x' : K.includes('/') ? `${K.startsWith('−') ? '−' : ''}(${K.replace('−', '')})x` : `${K}x`;
  const B = nice(b, 10);
  if (!kx) return `y = ${B}`;
  return `y = ${kx}${B === '0' ? '' : B.startsWith('−') ? ` − ${B.slice(1)}` : ` + ${B}`}`;
};

function linTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let K;
  let B;
  if (type === 0) {
    K = pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3]);
    B = rnd(-4, 4);
    st.task = { type, K, B, done: false };
  } else if (type === 1) {
    let x1;
    let x2;
    do {
      K = pick([-2, -1, 1, 2, 0.5, -0.5]);
      B = rnd(-3, 3);
      x1 = rnd(-4, 0);
      x2 = rnd(1, 4);
    } while (!Number.isInteger(K * x1 + B) || !Number.isInteger(K * x2 + B) || Math.abs(K * x1 + B) > 5 || Math.abs(K * x2 + B) > 5);
    st.task = { type, K, B, P: [x1, K * x1 + B], Q: [x2, K * x2 + B], done: false };
  } else {
    K = pick([-2, -1, 1, 2, 0.5]);
    B = rnd(-4, 4);
    let c;
    do c = rnd(-4, 4);
    while (c === B);
    st.task = { type, K, B, c, done: false };
  }
  return { k: 0.5, b: 1 };
}

const linear = modes({
  title: L('Linear function y = kx + b', 'Линейная функция y = kx + b', 'Сызықтық функция y = kx + b'),
  intro: L('k is the slope: how much y changes when x grows by 1. b is where the line crosses the y-axis.', 'k - угловой коэффициент: на сколько меняется y, когда x растёт на 1. b - где прямая пересекает ось y.', 'k - бұрыштық коэффициент: x бірге өскенде y қаншаға өзгереді. b - түзу y осін қиятын нүкте.'),
  sliders: [
    { id: 'k', label: 'k', min: -4, max: 4, step: 0.1, value: 0.5, hidden: only(0, 2, 3) },
    { id: 'b', label: 'b', min: -5, max: 5, step: 0.1, value: 1, hidden: only(0, 2, 3) },
  ],
  values: { xa: -2, ya: -1, xb: 2, yb: 3, px: 2, py: -3 },
  tabs: [L('k and b', 'k и b', 'k және b'), L('Two points', 'По двум точкам', 'Екі нүкте'), L('Two lines', 'Две прямые', 'Екі түзу'), TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return linTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return linTask(st);
    st.pre += 1;
    if (st.m === 1) return [{ xa: -3, ya: 4, xb: 3, yb: -2 }, { xa: -4, ya: 2, xb: 4, yb: 2 }, { xa: 0, ya: -3, xb: 2, yb: 3 }, { xa: -2, ya: -1, xb: 2, yb: 3 }][st.pre % 4];
    if (st.m === 2) return [{ px: -3, py: 2 }, { px: 1, py: 4 }, { px: 2, py: -3 }][st.pre % 3];
    return [{ k: 2, b: -3 }, { k: -1, b: 4 }, { k: 0, b: 2 }, { k: 1, b: 0 }, { k: -0.5, b: -2 }, { k: 0.5, b: 1 }][st.pre % 6];
  },
  onDrag(key, p, v, st) {
    const x = clamp(Math.round((p.x - 160) / 20), -7, 7);
    const y = clamp(Math.round((110 - p.y) / 20), -5, 5);
    if (key === 'A' && !(x === v.xb && y === v.yb)) [v.xa, v.ya] = [x, y];
    if (key === 'B' && !(x === v.xa && y === v.ya)) [v.xb, v.yb] = [x, y];
    if (key === 'P') [v.px, v.py] = [x, y];
  },
  draw(v, step, st) {
    const G = grid({ ...LIN, lab: 2 }).svg;
    const slope = (k, b, cls = 'exc-o') => {
      // ступенька: на 1 вправо, на k вверх/вниз
      const x0 = [2, 1, 3, -3, 4, -4, -2].find((x) => Math.abs(k * x + b) < 4.6 && Math.abs(k * x + b + k) < 4.6 && Math.abs(x + b / (k || 1e-9)) > 0.8) ?? 1;
      const y0 = k * x0 + b;
      if (Math.abs(y0) > 5 || Math.abs(y0 + k) > 5.4) return '';
      return `${pth(`M${lsx(x0)} ${n1(lsy(y0))} H${lsx(x0 + 1)} V${n1(lsy(y0 + k))}`, `${cls} ex-dash`, 2)}${T(lsx(x0 + 0.5), lsy(y0) + (k > 0 ? 13 : -5), '1', `m10 tc ${cls} h`)}${Math.abs(k) > 0.05 ? T(lsx(x0 + 1) + 4, (lsy(y0) + lsy(y0 + k)) / 2 + 4, kStr(k), `m10 tc ${cls} ex-start h`) : ''}`;
    };

    if (st.m === 1) {
      const { xa, ya, xb, yb } = v;
      const dx = xb - xa;
      const dy = yb - ya;
      const P = [lsx(xa), lsy(ya)];
      const Q = [lsx(xb), lsy(yb)];
      let line;
      let cap;
      if (dx === 0) {
        line = ln(P[0], 0, P[0], H, 'exc-p', 3);
        cap = L(`Both points have x = ${fmt(xa)}: the line is vertical, x = ${fmt(xa)}. It is not a function y(x) - k does not exist (we would divide by Δx = 0).`, `У обеих точек x = ${fmt(xa)}: прямая вертикальная, x = ${fmt(xa)}. Это не функция y(x) - k не существует (пришлось бы делить на Δx = 0).`, `Екі нүктеде де x = ${fmt(xa)}: түзу тік, x = ${fmt(xa)}. Бұл y(x) функциясы емес - k жоқ (Δx = 0-ге бөлуге тура келер еді).`);
      } else {
        const k = dy / dx;
        const b = ya - k * xa;
        line = fullLine(k, b);
        cap = L(
          `k = Δy/Δx = (${fmt(yb)} − ${pn(ya)})/(${fmt(xb)} − ${pn(xa)}) = ${fmt(dy)}/${fmt(dx)} = ${kStr(k)}. Then b = y₁ − k·x₁ = ${fmt(ya)} − ${kStr(k)}·${pn(xa)} = ${nice(b, 10)}. The line: ${lineStr(k, b)}. Drag the points.`,
          `k = Δy/Δx = (${fmt(yb)} − ${pn(ya)})/(${fmt(xb)} − ${pn(xa)}) = ${fmt(dy)}/${fmt(dx)} = ${kStr(k)}. Тогда b = y₁ − k·x₁ = ${fmt(ya)} − ${kStr(k)}·${pn(xa)} = ${nice(b, 10)}. Прямая: ${lineStr(k, b)}. Перетаскивай точки.`,
          `k = Δy/Δx = (${fmt(yb)} − ${pn(ya)})/(${fmt(xb)} − ${pn(xa)}) = ${fmt(dy)}/${fmt(dx)} = ${kStr(k)}. Онда b = y₁ − k·x₁ = ${fmt(ya)} − ${kStr(k)}·${pn(xa)} = ${nice(b, 10)}. Түзу: ${lineStr(k, b)}. Нүктелерді сүйре.`,
        );
      }
      const tri = dx ? `${pth(`M${n1(P[0])} ${n1(P[1])} H${n1(Q[0])} V${n1(Q[1])}`, 'exc-o ex-dash', 2)}${T((P[0] + Q[0]) / 2, P[1] + (dy > 0 ? 13 : -5), `Δx = ${fmt(dx)}`, 'm10 tc exc-o h')}${T(Q[0] + (dx > 0 ? 5 : -5), (P[1] + Q[1]) / 2 + 4, `Δy = ${fmt(dy)}`, `m10 tc exc-o h ${dx > 0 ? 'ex-start' : 'ex-end'}`)}` : '';
      return {
        svg: `${G}${line}${tri}${dot(P[0], P[1], 6, 'exc-b')}${dot(Q[0], Q[1], 6, 'exc-k')}${T(P[0] - 8, P[1] - 8, `A(${fmt(xa)}; ${fmt(ya)})`, 'm10 tc exc-b ex-end h')}${T(Q[0] + 8, Q[1] - 8, `B(${fmt(xb)}; ${fmt(yb)})`, 'm10 tc exc-k ex-start h')}
          ${T(8, 18, dx ? lineStr(dy / dx, ya - (dy / dx) * xa) : `x = ${fmt(xa)}`, 'm15 ex-start h')}${hit('A', P[0], P[1], 16)}${hit('B', Q[0], Q[1], 16)}`,
        caption: cap,
      };
    }

    const { k, b } = v;
    const flat = Math.abs(k) < 0.05;

    if (st.m === 2) {
      const { px, py } = v;
      const P = [lsx(px), lsy(py)];
      const bp = py - k * px;
      const perp = flat ? null : -1 / k;
      const bq = flat ? 0 : py - perp * px;
      const onL = Math.abs(py - (k * px + b)) < 0.05;
      return {
        svg: `${G}${fullLine(k, b)}${fullLine(k, bp, 'exc-b', 2.5)}${flat ? ln(P[0], 0, P[0], H, 'exc-g', 2.5) : fullLine(perp, bq, 'exc-g', 2.5)}${dot(P[0], P[1], 6, 'exc-o')}${hit('P', P[0], P[1], 16)}
          ${T(8, 18, lineStr(k, b), 'm12 tc exc-p ex-start h')}${T(8, 36, `∥ ${lineStr(k, bp)}`, 'm12 tc exc-b ex-start h')}${T(8, 54, `⊥ ${flat ? `x = ${fmt(px)}` : lineStr(perp, bq)}`, 'm12 tc exc-g ex-start h')}${T(P[0] + 8, P[1] + 16, `P(${fmt(px)}; ${fmt(py)})`, 'm10 tc exc-o ex-start h')}`,
        caption: flat
          ? L(`k = 0: the parallel line through P is y = ${fmt(py)}, the perpendicular one is vertical, x = ${fmt(px)}.`, `k = 0: параллельная прямая через P - это y = ${fmt(py)}, перпендикулярная - вертикальная x = ${fmt(px)}.`, `k = 0: P арқылы параллель түзу - y = ${fmt(py)}, перпендикуляр түзу - тік x = ${fmt(px)}.`)
          : L(
              `Parallel lines have equal k: through P(${fmt(px)}; ${fmt(py)}) it is ${lineStr(k, bp)}${onL ? ' (P lies on the line - the lines coincide)' : ''}. Perpendicular: k₁·k₂ = −1, so k₂ = −1/${kStr(k)} = ${kStr(perp)}: ${lineStr(perp, bq)}. Drag P.`,
              `У параллельных прямых равные k: через P(${fmt(px)}; ${fmt(py)}) это ${lineStr(k, bp)}${onL ? ' (P лежит на прямой - прямые совпали)' : ''}. Перпендикулярная: k₁·k₂ = −1, значит k₂ = −1/${kStr(k)} = ${kStr(perp)}: ${lineStr(perp, bq)}. Перетаскивай P.`,
              `Параллель түзулердің k-сы тең: P(${fmt(px)}; ${fmt(py)}) арқылы ${lineStr(k, bp)}${onL ? ' (P түзуде жатыр - түзулер беттесті)' : ''}. Перпендикуляр: k₁·k₂ = −1, демек k₂ = −1/${kStr(k)} = ${kStr(perp)}: ${lineStr(perp, bq)}. P-ны сүйре.`,
            ),
      };
    }

    const root = flat ? null : -b / k;
    const ang = (Math.atan(k) * 180) / Math.PI;
    const base = `${G}${fullLine(k, b)}${slope(k, b)}${dot(lsx(0), lsy(b), 6, 'exc-b')}${T(lsx(0) + (k > 0 ? -7 : 7), lsy(b) - 7, `(0; ${fmt(b)})`, `m10 tc exc-b h ${k > 0 ? 'ex-end' : 'ex-start'}`)}
      ${root !== null && Math.abs(root) < 7.5 ? `${dot(lsx(root), lsy(0), 5, 'exc-g')}${T(lsx(root), lsy(0) + (k > 0 ? 16 : -8), `x = ${fmt(root)}`, 'm10 tc exc-g h')}${Math.abs(k) > 0.05 ? pth(arcD(lsx(root), lsy(0), 16, 0, ang), 'exc-g', 1.5) : ''}` : ''}`;

    if (st.m === 3) {
      const tk = st.task ?? (linTask(st), st.task);
      let ok = near(k, tk.K) && near(b, tk.type === 2 ? tk.B : tk.B);
      let svg = base;
      let ask;
      let tag;
      if (tk.type === 0) {
        tag = lineStr(tk.K, tk.B);
        ask = L(`Build the line ${lineStr(tk.K, tk.B)} with the sliders.`, `Построй прямую ${lineStr(tk.K, tk.B)} ползунками.`, `Жүгірткілермен ${lineStr(tk.K, tk.B)} түзуін тұрғыз.`);
      } else if (tk.type === 1) {
        tag = `(${fmt(tk.P[0])}; ${fmt(tk.P[1])}), (${fmt(tk.Q[0])}; ${fmt(tk.Q[1])})`;
        svg += ring(lsx(tk.P[0]), lsy(tk.P[1]), 7, 'exc-o', 2.5) + ring(lsx(tk.Q[0]), lsy(tk.Q[1]), 7, 'exc-o', 2.5);
        ask = L(`Draw the line through the orange points (${fmt(tk.P[0])}; ${fmt(tk.P[1])}) and (${fmt(tk.Q[0])}; ${fmt(tk.Q[1])}).`, `Проведи прямую через оранжевые точки (${fmt(tk.P[0])}; ${fmt(tk.P[1])}) и (${fmt(tk.Q[0])}; ${fmt(tk.Q[1])}).`, `(${fmt(tk.P[0])}; ${fmt(tk.P[1])}) және (${fmt(tk.Q[0])}; ${fmt(tk.Q[1])}) қызғылт сары нүктелері арқылы түзу жүргіз.`);
      } else {
        tag = `∥ ${lineStr(tk.K, tk.c)}, (0; ${fmt(tk.B)})`;
        svg += fullLine(tk.K, tk.c, 'exc-m ex-dash', 2) + ring(lsx(0), lsy(tk.B), 7, 'exc-o', 2.5);
        ask = L(`Make the line parallel to the dashed ${lineStr(tk.K, tk.c)} and passing through (0; ${fmt(tk.B)}).`, `Сделай прямую параллельной пунктирной ${lineStr(tk.K, tk.c)} и проходящей через (0; ${fmt(tk.B)}).`, `Түзуді пунктир ${lineStr(tk.K, tk.c)} түзуіне параллель және (0; ${fmt(tk.B)}) арқылы өтетін ет.`);
      }
      ok = check(st, ok);
      const hint = L(
        `Now ${lineStr(k, b)}. ${near(k, tk.K) ? 'k is right, now b.' : tk.type === 1 ? 'Hint: k = Δy/Δx.' : `Hint: k = ${kStr(tk.K)}.`}`,
        `Сейчас ${lineStr(k, b)}. ${near(k, tk.K) ? 'k уже верный, осталось b.' : tk.type === 1 ? 'Подсказка: k = Δy/Δx.' : `Подсказка: k = ${kStr(tk.K)}.`}`,
        `Қазір ${lineStr(k, b)}. ${near(k, tk.K) ? 'k дұрыс, енді b.' : tk.type === 1 ? 'Кеңес: k = Δy/Δx.' : `Кеңес: k = ${kStr(tk.K)}.`}`,
      );
      return { svg: `${svg}${T(8, 18, lineStr(k, b), 'm12 ex-start h')}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }

    return {
      svg: `${base}${T(8, 18, lineStr(k, b), 'm15 ex-start h')}${T(8, 36, flat ? u('constant', 'постоянная', 'тұрақты') : k > 0 ? u('increasing ↗', 'возрастает ↗', 'өседі ↗') : u('decreasing ↘', 'убывает ↘', 'кемиді ↘'), `m11 ex-start h tc ${flat ? 'exc-m' : k > 0 ? 'exc-g' : 'exc-r'}`)}`,
      caption: flat
        ? L(`k = 0: the line is horizontal, y is always ${fmt(b)}.`, `k = 0: прямая горизонтальна, y всегда равен ${fmt(b)}.`, `k = 0: түзу көлденең, y әрқашан ${fmt(b)}.`)
        : L(
            `k = ${fmt(k)}: when x grows by 1, y ${k > 0 ? 'grows' : 'falls'} by ${fmt(Math.abs(k))} (orange step); the angle with the x-axis is ${fmt(ang, 0)}° (tg α = k). b = ${fmt(b)}: the line crosses the y-axis at (0; ${fmt(b)}), and the x-axis at x = −b/k = ${fmt(root)}.`,
            `k = ${fmt(k)}: когда x растёт на 1, y ${k > 0 ? 'растёт' : 'уменьшается'} на ${fmt(Math.abs(k))} (оранжевая ступенька); угол с осью x - ${fmt(ang, 0)}° (tg α = k). b = ${fmt(b)}: прямая пересекает ось y в (0; ${fmt(b)}), а ось x - в x = −b/k = ${fmt(root)}.`,
            `k = ${fmt(k)}: x бірге өскенде y ${fmt(Math.abs(k))}-ге ${k > 0 ? 'өседі' : 'кемиді'} (қызғылт сары баспалдақ); x осімен бұрышы ${fmt(ang, 0)}° (tg α = k). b = ${fmt(b)}: түзу y осін (0; ${fmt(b)}) нүктесінде, x осін x = −b/k = ${fmt(root)} нүктесінде қияды.`,
          ),
    };
  },
});

// ---------- Парабола ----------

const PSX = (x) => 160 + x * 20;
const PSY = (y) => 120 - y * 10;

function parTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 3);
  while (type === last);
  let t;
  if (type === 0) {
    let r1;
    let r2;
    do {
      r1 = rnd(-4, 3);
      r2 = rnd(r1 + 1, 4);
    } while (Math.abs(r1 * r2) > 6 || Math.abs(r1 + r2) > 6);
    t = { r1, r2, tag: `x₁ = ${fmt(r1)}, x₂ = ${fmt(r2)}`, p: { a: 1, b: 0, c: 0 } };
  } else if (type === 1) {
    let h;
    let m;
    let a;
    do {
      a = pick([1, -1]);
      h = rnd(-3, 3);
      m = rnd(-4, 4);
    } while (Math.abs(a * h * h + m) > 6 || h === 0);
    t = { a, h, m, tag: `(${h}; ${m})`, p: { a, b: 0, c: 0 } };
  } else if (type === 2) {
    let a;
    let b;
    do {
      a = pick([1, 2, -1, 0.5]);
      b = pick([-4, -2, 2, 4, 3, -3]);
    } while (Math.abs((b * b) / (4 * a)) > 6 || Math.abs(((b * b) / (4 * a)) * 10 - Math.round(((b * b) / (4 * a)) * 10)) > 1e-9);
    t = { a, b, c: (b * b) / (4 * a), tag: 'D = 0', p: { a, b, c: 0 } };
  } else t = { tag: 'a < 0, D < 0', p: { a: 1, b: -2, c: -3 } };
  st.task = { type, done: false, ...t };
  return t.p;
}

const parabola = modes({
  title: L('The parabola y = ax² + bx + c', 'Парабола y = ax² + bx + c', 'Парабола y = ax² + bx + c'),
  intro: L('a sets the direction and width, c lifts the graph, b moves the vertex sideways. The discriminant tells how many roots there are.', 'a задаёт направление ветвей и ширину, c поднимает график, b сдвигает вершину вбок. Дискриминант показывает, сколько корней.', 'a тармақтардың бағыты мен енін, c графикті көтереді, b төбені бүйірге жылжытады. Дискриминант түбір санын көрсетеді.'),
  sliders: [
    { id: 'a', label: 'a', min: -3, max: 3, step: 0.1, value: 1 },
    { id: 'b', label: 'b', min: -6, max: 6, step: 0.1, value: -2 },
    { id: 'c', label: 'c', min: -6, max: 6, step: 0.1, value: -3 },
  ],
  tabs: [L('Roots and D', 'Корни и D', 'Түбірлер және D'), L('Vertex', 'Вершина', 'Төбе'), L('Signs', 'Знаки', 'Таңбалар'), TASK],
  acts: [{ label: 'a → −a', only: [0, 1, 2] }, { label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return parTask(st);
    return null;
  },
  onAct(j, st, v) {
    if (j === 0) return { a: -v.a, b: -v.b, c: -v.c };
    if (st.m === 3) return parTask(st);
    st.pre = (st.pre + 1) % 6;
    return [{ a: 1, b: -4, c: 4 }, { a: -1, b: 2, c: 3 }, { a: 0.5, b: 0, c: 2 }, { a: 2, b: 4, c: 0 }, { a: -0.5, b: -1, c: 4 }, { a: 1, b: -2, c: -3 }][st.pre];
  },
  draw(v, step, st) {
    const a = Math.round(v.a * 10) / 10;
    const b = Math.round(v.b * 10) / 10;
    const c = Math.round(v.c * 10) / 10;
    const f = (x) => a * x * x + b * x + c;
    const G = grid({ x0: -8, x1: 8, y0: -10, y1: 12, step: 1, ystep: 2, lab: 2, ylab: 4 }).svg;
    const eq = `y = ${polyStr([[a, 'x²'], [b, 'x'], [c, '']])}`;
    const curve = pth(plot(f, -8.2, 8.2, PSX, PSY, 160), 'exc-p', 3);
    const isLine = a === 0;
    const D = b * b - 4 * a * c;
    const Dz = Math.abs(D) < 1e-9;
    const xv = isLine ? 0 : -b / (2 * a);
    const yv = isLine ? 0 : f(xv);
    const roots = isLine ? (b ? [-c / b] : []) : Dz ? [xv] : D < 0 ? [] : [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort((p, q) => p - q);
    const rootDots = roots.map((r) => `${dot(PSX(r), PSY(0), 5.5, 'exc-o')}${Math.abs(r) < 7.8 ? T(PSX(r), PSY(0) + 15, fmt(r), 'm10 tc exc-o h') : ''}`).join('');
    const vtx = !isLine && Math.abs(yv) < 12 && Math.abs(xv) < 8 ? dot(PSX(xv), PSY(yv), 5, 'exc-k') : '';
    const head = T(8, 18, eq, 'm12 ex-start h');

    if (isLine)
      return {
        svg: `${G}${curve}${rootDots}${head}`,
        caption: L(`a = 0: no x², so this is the straight line y = ${fmt(b)}x${term(c)}, not a parabola.${roots.length ? ` It crosses the x-axis at x = ${fmt(roots[0])}.` : ''}`, `a = 0: нет x², это уже не парабола, а прямая y = ${fmt(b)}x${term(c)}.${roots.length ? ` Она пересекает ось x в x = ${fmt(roots[0])}.` : ''}`, `a = 0: x² жоқ, бұл парабола емес, y = ${fmt(b)}x${term(c)} түзуі.${roots.length ? ` Ол x осін x = ${fmt(roots[0])} нүктесінде қияды.` : ''}`),
      };

    const howMany = (two, one, none) => (Dz ? one : D > 0 ? two : none);
    const rs = roots.map((r) => fmt(r)).join('; ');

    if (st.m === 1) {
      const ghost = pth(plot((x) => a * x * x, -8.2, 8.2, PSX, PSY, 120), 'exc-m ex-dash', 1.5);
      const vy = clamp(PSY(yv), 2, 218);
      const vform = `y = ${coef(a)}${Math.abs(xv) > 1e-9 ? `(x${term(-xv)})²` : 'x²'}${fmt(yv) === '0' ? '' : term(yv)}`;
      return {
        svg: `${G}${ghost}${ln(PSX(xv), 0, PSX(xv), H, 'exc-k ex-dash', 1.5)}${curve}${arrow(PSX(0), PSY(0), PSX(xv), vy, 'exc-o', 2)}${vtx}${dot(PSX(0), PSY(0), 3.5, 'exc-m')}
          ${head}${T(8, 36, vform, 'm12 tc exc-k ex-start h')}${T(PSX(xv) + 6, clamp(vy + (a > 0 ? 16 : -8), 12, 214), `(${fmt(xv)}; ${fmt(yv)})`, 'm10 tc exc-k ex-start h')}${T(312, 214, `x = ${fmt(xv)}`, 'm10 tc exc-k ex-end h')}`,
        caption: L(
          `Vertex: x₀ = −b/(2a) = ${fmt(-b)}/${fmt(2 * a)} = ${fmt(xv)}, y₀ = y(x₀) = ${fmt(yv)}. So ${vform}: the dashed parabola y = ${coef(a)}x² is moved by ${fmt(xv)} along x and ${fmt(yv)} along y (orange arrow). The line x = ${fmt(xv)} is the axis of symmetry; ${a > 0 ? `the smallest value is ${fmt(yv)}` : `the largest value is ${fmt(yv)}`}.`,
          `Вершина: x₀ = −b/(2a) = ${fmt(-b)}/${fmt(2 * a)} = ${fmt(xv)}, y₀ = y(x₀) = ${fmt(yv)}. Значит ${vform}: пунктирную параболу y = ${coef(a)}x² сдвинули на ${fmt(xv)} по x и на ${fmt(yv)} по y (оранжевая стрелка). Прямая x = ${fmt(xv)} - ось симметрии; ${a > 0 ? `наименьшее значение ${fmt(yv)}` : `наибольшее значение ${fmt(yv)}`}.`,
          `Төбе: x₀ = −b/(2a) = ${fmt(-b)}/${fmt(2 * a)} = ${fmt(xv)}, y₀ = y(x₀) = ${fmt(yv)}. Демек ${vform}: пунктир y = ${coef(a)}x² параболасы x бойынша ${fmt(xv)}-ге, y бойынша ${fmt(yv)}-ге жылжыды (қызғылт сары нұсқар). x = ${fmt(xv)} түзуі - симметрия осі; ${a > 0 ? `ең кіші мәні ${fmt(yv)}` : `ең үлкен мәні ${fmt(yv)}`}.`,
        ),
      };
    }

    if (st.m === 2) {
      const pos = `M${PSX(-8.2)} ${PSY(0)} ${plot((x) => Math.max(0, f(x)), -8.2, 8.2, PSX, PSY, 160).replace(/^M/, 'L')} L${PSX(8.2)} ${PSY(0)} Z`;
      const neg = `M${PSX(-8.2)} ${PSY(0)} ${plot((x) => Math.min(0, f(x)), -8.2, 8.2, PSX, PSY, 160).replace(/^M/, 'L')} L${PSX(8.2)} ${PSY(0)} Z`;
      const cuts = [-9, ...roots, 9];
      let segs = '';
      for (let i = 0; i < cuts.length - 1; i++) {
        const m = (cuts[i] + cuts[i + 1]) / 2;
        const pos2 = f(m) > 0;
        segs += ln(PSX(Math.max(cuts[i], -8.2)), PSY(0), PSX(Math.min(cuts[i + 1], 8.2)), PSY(0), pos2 ? 'exc-g' : 'exc-r', 5);
        const lx = clamp((Math.max(cuts[i], -8) + Math.min(cuts[i + 1], 8)) / 2, -7.5, 7.5);
        if (Math.min(cuts[i + 1], 8) - Math.max(cuts[i], -8) > 0.8) segs += T(PSX(lx), PSY(0) + (pos2 ? -8 : 20), pos2 ? '+' : '−', `m15 tc h ${pos2 ? 'exc-g' : 'exc-r'}`);
      }
      const iv = (lo, hi) => `(${lo === -Infinity ? '−∞' : fmt(lo)}; ${hi === Infinity ? '+∞' : fmt(hi)})`;
      let posS;
      let negS;
      if (roots.length === 2) {
        const out = `${iv(-Infinity, roots[0])} ∪ ${iv(roots[1], Infinity)}`;
        const inn = iv(roots[0], roots[1]);
        posS = a > 0 ? out : inn;
        negS = a > 0 ? inn : out;
      } else if (roots.length === 1) {
        const all = `${iv(-Infinity, roots[0])} ∪ ${iv(roots[0], Infinity)}`;
        posS = a > 0 ? all : '∅';
        negS = a > 0 ? '∅' : all;
      } else {
        posS = a > 0 ? '(−∞; +∞)' : '∅';
        negS = a > 0 ? '∅' : '(−∞; +∞)';
      }
      return {
        svg: `${G}${area(pos, 'exc-g', 0.22)}${area(neg, 'exc-r', 0.22)}${curve}${segs}${rootDots}${head}`,
        caption: L(
          `Signs: y > 0 for x ∈ ${posS}; y < 0 for x ∈ ${negS}.${roots.length ? ` At ${rs} y = 0.` : ''} This is how a quadratic inequality is solved: find the roots, look at where the parabola is above or below the axis.`,
          `Знаки: y > 0 при x ∈ ${posS}; y < 0 при x ∈ ${negS}.${roots.length ? ` В точках ${rs} y = 0.` : ''} Так решают квадратное неравенство: находим корни и смотрим, где парабола выше или ниже оси.`,
          `Таңбалар: y > 0, егер x ∈ ${posS}; y < 0, егер x ∈ ${negS}.${roots.length ? ` ${rs} нүктелерінде y = 0.` : ''} Квадрат теңсіздік осылай шешіледі: түбірлерді тауып, парабола осьтен қай жерде жоғары не төмен екенін қараймыз.`,
        ),
      };
    }

    const base = `${G}${curve}${rootDots}${vtx}${dot(PSX(0), PSY(c), 4, 'exc-b')}${head}${T(8, 36, `D = ${fmt(Dz ? 0 : D)}`, `m12 ex-start h tc ${D > 0 ? 'exc-g' : Dz ? 'exc-o' : 'exc-r'}`)}`;

    if (st.m === 3) {
      const tk = st.task ?? (parTask(st), st.task);
      let ok = false;
      let ask;
      let hint;
      if (tk.type === 0) {
        ok = roots.length === 2 && near(roots[0], tk.r1, 0.06) && near(roots[1], tk.r2, 0.06);
        ask = L(`Make the roots x₁ = ${fmt(tk.r1)} and x₂ = ${fmt(tk.r2)}.`, `Сделай корни x₁ = ${fmt(tk.r1)} и x₂ = ${fmt(tk.r2)}.`, `Түбірлерді x₁ = ${fmt(tk.r1)} және x₂ = ${fmt(tk.r2)} ет.`);
        hint = L(`Hint (Vieta, a = 1): b = −(x₁ + x₂) = ${fmt(-(tk.r1 + tk.r2))}, c = x₁·x₂ = ${fmt(tk.r1 * tk.r2)}.`, `Подсказка (Виет, a = 1): b = −(x₁ + x₂) = ${fmt(-(tk.r1 + tk.r2))}, c = x₁·x₂ = ${fmt(tk.r1 * tk.r2)}.`, `Кеңес (Виет, a = 1): b = −(x₁ + x₂) = ${fmt(-(tk.r1 + tk.r2))}, c = x₁·x₂ = ${fmt(tk.r1 * tk.r2)}.`);
      } else if (tk.type === 1) {
        ok = near(a, tk.a) && near(xv, tk.h, 0.06) && near(yv, tk.m, 0.06);
        ask = L(`With a = ${tk.a}, put the vertex at (${fmt(tk.h)}; ${fmt(tk.m)}).`, `При a = ${tk.a} поставь вершину в точку (${fmt(tk.h)}; ${fmt(tk.m)}).`, `a = ${tk.a} болғанда төбені (${fmt(tk.h)}; ${fmt(tk.m)}) нүктесіне қой.`);
        hint = L(`Now the vertex is (${fmt(xv)}; ${fmt(yv)}). Hint: x₀ = −b/(2a), so b = ${fmt(-2 * tk.a * tk.h)}; then pick c.`, `Сейчас вершина (${fmt(xv)}; ${fmt(yv)}). Подсказка: x₀ = −b/(2a), значит b = ${fmt(-2 * tk.a * tk.h)}; потом подбери c.`, `Қазір төбе (${fmt(xv)}; ${fmt(yv)}). Кеңес: x₀ = −b/(2a), демек b = ${fmt(-2 * tk.a * tk.h)}; сосын c-ны таңда.`);
      } else if (tk.type === 2) {
        ok = near(a, tk.a) && near(b, tk.b) && Dz;
        ask = L(`a = ${fmt(tk.a)}, b = ${fmt(tk.b)}. Pick c so that the parabola only touches the x-axis (D = 0).`, `a = ${fmt(tk.a)}, b = ${fmt(tk.b)}. Подбери c, чтобы парабола только касалась оси x (D = 0).`, `a = ${fmt(tk.a)}, b = ${fmt(tk.b)}. Парабола x осін тек жанап өтетіндей c-ны таңда (D = 0).`);
        hint = L(`Now D = ${fmt(D)}. Hint: b² − 4ac = 0 → c = b²/(4a).`, `Сейчас D = ${fmt(D)}. Подсказка: b² − 4ac = 0 → c = b²/(4a).`, `Қазір D = ${fmt(D)}. Кеңес: b² − 4ac = 0 → c = b²/(4a).`);
      } else {
        ok = a < 0 && D < 0 && !Dz;
        ask = L('Make the branches point down and leave no roots at all.', 'Сделай так, чтобы ветви смотрели вниз и корней не было совсем.', 'Тармақтар төмен қарайтын және түбір мүлде болмайтындай ет.');
        hint = L(`Now a = ${fmt(a)}, D = ${fmt(D)}. Hint: a < 0, and the vertex must be below the x-axis.`, `Сейчас a = ${fmt(a)}, D = ${fmt(D)}. Подсказка: a < 0, а вершина должна быть ниже оси x.`, `Қазір a = ${fmt(a)}, D = ${fmt(D)}. Кеңес: a < 0, ал төбе x осінен төмен болуы керек.`);
      }
      ok = check(st, ok);
      return { svg: `${base}${badge(tk.tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }

    return {
      svg: base,
      caption: L(
        `${a > 0 ? 'a > 0: branches up' : 'a < 0: branches down'}. D = b² − 4ac = ${pn(b)}² − 4·${pn(a)}·${pn(c)} = ${fmt(Dz ? 0 : D)}: ${howMany('two roots', 'one root', 'no real roots')}.${roots.length ? ` x = (−b ± √D)/(2a): ${rs}.` : ''} The blue dot (0; ${fmt(c)}) is where the graph meets the y-axis.`,
        `${a > 0 ? 'a > 0: ветви вверх' : 'a < 0: ветви вниз'}. D = b² − 4ac = ${pn(b)}² − 4·${pn(a)}·${pn(c)} = ${fmt(Dz ? 0 : D)}: ${howMany('два корня', 'один корень', 'корней нет')}.${roots.length ? ` x = (−b ± √D)/(2a): ${rs}.` : ''} Синяя точка (0; ${fmt(c)}) - пересечение с осью y.`,
        `${a > 0 ? 'a > 0: тармақтар жоғары' : 'a < 0: тармақтар төмен'}. D = b² − 4ac = ${pn(b)}² − 4·${pn(a)}·${pn(c)} = ${fmt(Dz ? 0 : D)}: ${howMany('екі түбір', 'бір түбір', 'түбір жоқ')}.${roots.length ? ` x = (−b ± √D)/(2a): ${rs}.` : ''} Көк нүкте (0; ${fmt(c)}) - y осімен қиылысу.`,
      ),
    };
  },
});

// ---------- Теорема Пифагора ----------

const PY_TRIPLES = [[3, 4], [6, 8], [5, 12], [9, 12], [1, 1], [1, 2], [2.5, 6], [4, 7.5]];

function pyTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const [a, b] = pick([[3, 4], [5, 12], [6, 8], [9, 12], [8, 6], [12, 5], [4, 3], [12, 9], [1.5, 2], [4.5, 6]]);
    t = { a, b, c: Math.hypot(a, b), p: { a, b: 1 } };
  } else if (type === 1) {
    const [a, b] = pick([[3, 4], [5, 12], [6, 8], [9, 12], [8, 6], [12, 5]]);
    t = { a, b, c: Math.hypot(a, b), p: { a, b: 1 } };
  } else {
    const k = pick([2, 3, 4, 5, 6, 7, 8]);
    t = { k, c2: 2 * k * k, p: { a: 1, b: 1 } };
  }
  st.task = { type, done: false, ...t };
  return t.p;
}

/** Корень красиво: √50 = 5√2, √25 = 5. */
const sqrtStr = (n) => {
  if (Math.abs(n - Math.round(n)) > 1e-9) return `√${fmt(n)}`;
  let out = 1;
  let rest = Math.round(n);
  for (let k = 2; k * k <= rest; k++)
    while (rest % (k * k) === 0) {
      out *= k;
      rest /= k * k;
    }
  return rest === 1 ? String(out) : `${out === 1 ? '' : out}√${rest}`;
};

const pythagoras = modes({
  title: L('The Pythagorean theorem', 'Теорема Пифагора', 'Пифагор теоремасы'),
  intro: L('In a right triangle a² + b² = c²: the squares on the legs together equal the square on the hypotenuse.', 'В прямоугольном треугольнике a² + b² = c²: квадраты на катетах вместе равны квадрату на гипотенузе.', 'Тікбұрышты үшбұрышта a² + b² = c²: катеттердегі шаршылар бірге гипотенузадағы шаршыға тең.'),
  sliders: [
    { id: 'a', label: L('leg a', 'катет a', 'a катеті'), min: 1, max: 12, step: 0.5, value: 3 },
    { id: 'b', label: L('leg b', 'катет b', 'b катеті'), min: 1, max: 12, step: 0.5, value: 4 },
  ],
  values: { ph: 0 },
  tabs: [L('Squares', 'Квадраты', 'Шаршылар'), L('Proof', 'Доказательство', 'Дәлелдеу'), TASK],
  acts: [{ label: L('▶ Rearrange', '▶ Переложить', '▶ Орнын ауыстыру'), only: [1] }, { label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return pyTask(st);
    return null;
  },
  onAct(j, st, v) {
    if (j === 0) return { ph: v.ph > 0.5 ? 0 : 1, $dur: 1600 };
    if (st.m === 2) return pyTask(st);
    st.pre = (st.pre + 1) % PY_TRIPLES.length;
    const [a, b] = PY_TRIPLES[st.pre];
    return { a, b };
  },
  draw(v, step, st) {
    const { a, b } = v;
    const c2 = a * a + b * b;
    const c = Math.sqrt(c2);
    const cs = sqrtStr(c2);
    const exact = Math.abs(c - Math.round(c)) < 1e-9;

    if (st.m === 1) {
      const S = a + b;
      const s = 186 / S;
      const X0 = 10;
      const Y0 = 8;
      const P = (x, y) => [X0 + x * s, Y0 + (S - y) * s];
      const k = clamp(v.ph, 0, 1);
      const kk = (i) => ease(clamp(k * 1.6 - i * 0.3, 0, 1));
      const tri = (pts, dx, dy, i) => {
        const e = kk(i);
        return `<path class="ex-tri" style="stroke-width:1.5" d="M${pts.map(([x, y]) => P(x + dx * e, y + dy * e)).map((q) => `${n1(q[0])} ${n1(q[1])}`).join(' L')} Z"/>`;
      };
      const T1 = [[0, 0], [a, 0], [0, b]];
      const T2 = [[S, 0], [S, a], [a, 0]];
      const T3 = [[S, S], [b, S], [S, a]];
      const T4 = [[0, S], [0, b], [b, S]];
      const inner = [[a, 0], [S, a], [b, S], [0, b]].map(([x, y]) => P(x, y));
      const sqA = [[0, 0], [a, 0], [a, a], [0, a]].map(([x, y]) => P(x, y));
      const sqB = [[a, a], [S, a], [S, S], [a, S]].map(([x, y]) => P(x, y));
      const done = k > 0.99;
      return {
        svg: `${poly(inner, 'exc-p', 0.55 * (1 - k))}${poly(sqA, 'exc-a', 0.6 * k)}${poly(sqB, 'exc-b', 0.6 * k)}
          ${tri(T1, 0, a, 0)}${tri(T2, 0, 0, 1)}${tri(T3, -b, 0, 1)}${tri(T4, a, -b, 2)}
          <rect class="ex-stroke exc-m" style="fill:none;stroke-width:2" x="${X0}" y="${Y0}" width="${n1(S * s)}" height="${n1(S * s)}"/>
          ${k < 0.5 ? T(X0 + (S * s) / 2, Y0 + (S * s) / 2 + 6, 'c²', 'm18 tc exc-p h') : `${T(P(a / 2, 0)[0], P(0, a / 2)[1] + 6, 'a²', 'm15 h')}${T(P(a + b / 2, 0)[0], P(0, a + b / 2)[1] + 6, 'b²', 'm15 h')}`}
          ${T(X0 + (a * s) / 2, Y0 + S * s + 13, 'a', 'm10 exm-mut')}${T(X0 + a * s + (b * s) / 2, Y0 + S * s + 13, 'b', 'm10 exm-mut')}
          ${T(262, 40, `${u('side', 'сторона', 'қабырға')} a + b = ${fmt(S)}`, 'm11')}${T(262, 64, u('4 triangles', '4 треугольника', '4 үшбұрыш'), 'm10 exm-mut')}${T(262, 77, u('do not change', 'не меняются', 'өзгермейді'), 'm10 exm-mut')}
          ${T(262, 104, done ? 'a² + b²' : 'c²', `m15 tc ${done ? 'exc-a' : 'exc-p'}`)}${T(262, 124, done ? `= ${fmt(a * a)} + ${fmt(b * b)}` : `= ${fmt(c2)}`, 'm12')}
          ${T(262, 162, 'c² = a² + b²', `m12 tc ${done ? 'exc-g' : 'exc-m'}`)}`,
        caption: done
          ? L(
              `The same 4 triangles, moved: now the free space is two squares a² + b² = ${fmt(a * a)} + ${fmt(b * b)}. The big square and the triangles did not change, so the free area is the same: c² = a² + b².`,
              `Те же 4 треугольника переложили: теперь свободное место - два квадрата a² + b² = ${fmt(a * a)} + ${fmt(b * b)}. Большой квадрат и треугольники не изменились, значит и свободная площадь та же: c² = a² + b².`,
              `Сол 4 үшбұрыштың орнын ауыстырдық: енді бос орын - екі шаршы a² + b² = ${fmt(a * a)} + ${fmt(b * b)}. Үлкен шаршы мен үшбұрыштар өзгерген жоқ, демек бос аудан да сол: c² = a² + b².`,
            )
          : L(
              `A square with side a + b = ${fmt(S)} holds 4 equal right triangles; the free space in the middle is a square on the hypotenuse, c² = ${fmt(c2)}. Press "Rearrange".`,
              `В квадрат со стороной a + b = ${fmt(S)} положили 4 одинаковых прямоугольных треугольника; свободное место в центре - квадрат на гипотенузе, c² = ${fmt(c2)}. Нажми «Переложить».`,
              `Қабырғасы a + b = ${fmt(S)} шаршыға 4 бірдей тікбұрышты үшбұрыш салдық; ортадағы бос орын - гипотенузадағы шаршы, c² = ${fmt(c2)}. «Орнын ауыстыру» бас.`,
            ),
      };
    }

    // Квадраты на сторонах.
    const s = Math.min(196 / (2 * a + b), 204 / (a + 2 * b));
    const X0 = 6 + (200 - (2 * a + b) * s) / 2;
    const Y0 = 8 + (204 - (a + 2 * b) * s) / 2;
    const P = (x, y) => [X0 + (x + a) * s, Y0 + (a + b - y) * s];
    const C0 = P(0, 0);
    const A = P(0, a);
    const B = P(b, 0);
    const sqA = [[0, 0], [0, a], [-a, a], [-a, 0]].map(([x, y]) => P(x, y));
    const sqB = [[0, 0], [b, 0], [b, -b], [0, -b]].map(([x, y]) => P(x, y));
    const sqC = [[0, a], [b, 0], [b + a, b], [a, a + b]].map(([x, y]) => P(x, y));
    // клетки 1×1 в квадратах катетов, если стороны целые
    let cells = '';
    const unit = (n) => Number.isInteger(n) && n * s >= 0 && n <= 12 && s >= 5;
    if (unit(a)) for (let i = 1; i < a; i++) cells += ln(P(-i, 0)[0], P(0, 0)[1], P(-i, a)[0], P(0, a)[1], 'exc-a', 0.6) + ln(P(-a, i)[0], P(0, i)[1], P(0, i)[0], P(0, i)[1], 'exc-a', 0.6);
    if (unit(b)) for (let i = 1; i < b; i++) cells += ln(P(i, 0)[0], P(0, 0)[1], P(i, -b)[0], P(0, -b)[1], 'exc-b', 0.6) + ln(P(0, -i)[0], P(0, -i)[1], P(b, -i)[0], P(0, -i)[1], 'exc-b', 0.6);
    if (exact && c <= 15 && s >= 5)
      for (let i = 1; i < c; i++) {
        const t = i / c;
        // линии, параллельные сторонам квадрата гипотенузы
        const p1 = [0 + b * t, a - a * t];
        const p2 = [p1[0] + a, p1[1] + b];
        const q1 = [0 + a * t, a + b * t];
        const q2 = [q1[0] + b, q1[1] - a];
        cells += ln(...P(...p1), ...P(...p2), 'exc-p', 0.6) + ln(...P(...q1), ...P(...q2), 'exc-p', 0.6);
      }
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const cA = mid(sqA[0], sqA[2]);
    const cB = mid(sqB[0], sqB[2]);
    const cC = mid(sqC[0], sqC[2]);
    const big = (n) => n * s > 26;
    const hide = st.m === 2 && !(st.task?.done);
    const pic = `${poly(sqA, 'exc-a', 0.45)}${poly(sqB, 'exc-b', 0.45)}${poly(sqC, 'exc-p', 0.4)}${cells}
      <path class="ex-tri" d="M${pts([C0, A, B])} Z"/>${pth(`M${n1(C0[0] + 8)} ${n1(C0[1])} V${n1(C0[1] - 8)} H${n1(C0[0])}`, 'exc-m', 1.2)}
      ${big(a) ? T(cA[0], cA[1] + 4, `${fmt(a * a)}`, 'm11') : ''}${big(b) ? T(cB[0], cB[1] + 4, `${fmt(b * b)}`, 'm11') : ''}${big(c) ? T(cC[0], cC[1] + 4, hide ? '?' : fmt(c2), 'm12') : ''}
      ${T((C0[0] + A[0]) / 2 + 6, (C0[1] + A[1]) / 2 + 4, 'a', 'm11 tc exc-a ex-start h')}${T((C0[0] + B[0]) / 2, C0[1] - 5, 'b', 'm11 tc exc-b h')}${T((A[0] + B[0]) / 2 - 5, (A[1] + B[1]) / 2 - 3, 'c', 'm12 tc exc-p ex-end h')}`;
    const panel = (cTxt) => `${T(262, 30, 'a² + b² = c²', 'm12')}${T(262, 58, `a² = ${fmt(a * a)}`, 'm12 tc exc-a')}${T(262, 80, `b² = ${fmt(b * b)}`, 'm12 tc exc-b')}${T(262, 108, `c² = ${cTxt ?? fmt(c2)}`, 'm15 tc exc-p')}${T(262, 134, cTxt ? 'c = ?' : `c = ${cs}`, 'm15')}${!cTxt && !exact ? T(262, 154, `≈ ${fmt(c)}`, 'm12 exm-mut') : ''}`;

    if (st.m === 2) {
      const tk = st.task ?? (pyTask(st), st.task);
      let ok;
      let ask;
      let hint;
      let tag;
      if (tk.type <= 1) {
        ok = near(a, tk.a, 0.01) && near(b, tk.b, 0.01);
        tag = `a = ${fmt(tk.a)}, c = ${fmt(tk.c)}`;
        ask = L(`Leg a = ${fmt(tk.a)}, hypotenuse c = ${fmt(tk.c)}. Find leg b with the slider.`, `Катет a = ${fmt(tk.a)}, гипотенуза c = ${fmt(tk.c)}. Найди катет b ползунком.`, `a катеті = ${fmt(tk.a)}, гипотенуза c = ${fmt(tk.c)}. b катетін жүгірткімен тап.`);
        hint = L(`Now c² = ${fmt(c2)}, we need ${fmt(tk.c * tk.c)}. Hint: b = √(c² − a²) = √(${fmt(tk.c * tk.c)} − ${fmt(tk.a * tk.a)}).`, `Сейчас c² = ${fmt(c2)}, а нужно ${fmt(tk.c * tk.c)}. Подсказка: b = √(c² − a²) = √(${fmt(tk.c * tk.c)} − ${fmt(tk.a * tk.a)}).`, `Қазір c² = ${fmt(c2)}, ал ${fmt(tk.c * tk.c)} керек. Кеңес: b = √(c² − a²) = √(${fmt(tk.c * tk.c)} − ${fmt(tk.a * tk.a)}).`);
      } else {
        ok = near(a, tk.k, 0.01) && near(b, tk.k, 0.01);
        tag = `a = b, c = ${sqrtStr(tk.c2)}`;
        ask = L(`Build an isosceles right triangle with hypotenuse c = ${sqrtStr(tk.c2)}.`, `Построй равнобедренный прямоугольный треугольник с гипотенузой c = ${sqrtStr(tk.c2)}.`, `Гипотенузасы c = ${sqrtStr(tk.c2)} болатын теңбүйірлі тікбұрышты үшбұрыш тұрғыз.`);
        hint = L(`Now c² = ${fmt(c2)}, we need ${tk.c2}. Hint: a = b, so 2a² = ${tk.c2}.`, `Сейчас c² = ${fmt(c2)}, а нужно ${tk.c2}. Подсказка: a = b, значит 2a² = ${tk.c2}.`, `Қазір c² = ${fmt(c2)}, ал ${tk.c2} керек. Кеңес: a = b, демек 2a² = ${tk.c2}.`);
      }
      ok = check(st, ok);
      return { svg: `${pic}${panel(ok ? null : '?')}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }

    return {
      svg: `${pic}${panel()}`,
      caption: L(
        `${fmt(a)}² + ${fmt(b)}² = ${fmt(a * a)} + ${fmt(b * b)} = ${fmt(c2)}, so the hypotenuse c = √${fmt(c2)} ${exact ? '=' : '≈'} ${exact ? cs : fmt(c)}.${exact && Number.isInteger(a) && Number.isInteger(b) ? ' Integer sides: count the cells - they match!' : ''} The hypotenuse is always the longest side.`,
        `${fmt(a)}² + ${fmt(b)}² = ${fmt(a * a)} + ${fmt(b * b)} = ${fmt(c2)}, значит гипотенуза c = √${fmt(c2)} ${exact ? '=' : '≈'} ${exact ? cs : fmt(c)}.${exact && Number.isInteger(a) && Number.isInteger(b) ? ' Стороны целые: посчитай клетки - сходится!' : ''} Гипотенуза всегда длиннее катетов.`,
        `${fmt(a)}² + ${fmt(b)}² = ${fmt(a * a)} + ${fmt(b * b)} = ${fmt(c2)}, демек гипотенуза c = √${fmt(c2)} ${exact ? '=' : '≈'} ${exact ? cs : fmt(c)}.${exact && Number.isInteger(a) && Number.isInteger(b) ? ' Қабырғалар бүтін: торларды сана - сәйкес келеді!' : ''} Гипотенуза әрқашан катеттерден ұзын.`,
      ),
    };
  },
});

// ---------- Единичная окружность ----------

const SIN_EX = { 0: '0', 30: '1/2', 45: '√2/2', 60: '√3/2', 90: '1', 120: '√3/2', 135: '√2/2', 150: '1/2', 180: '0', 210: '−1/2', 225: '−√2/2', 240: '−√3/2', 270: '−1', 300: '−√3/2', 315: '−√2/2', 330: '−1/2' };
const TAN_EX = { 0: '0', 30: '√3/3', 45: '1', 60: '√3', 120: '−√3', 135: '−1', 150: '−√3/3', 180: '0', 210: '√3/3', 225: '1', 240: '√3', 300: '−√3', 315: '−1', 330: '−√3/3' };
const STD = Object.keys(SIN_EX).map(Number);
const norm360 = (d) => ((Math.round(d * 1000) / 1000) % 360 + 360) % 360;
const sinEx = (d) => SIN_EX[norm360(d)];
const cosEx = (d) => SIN_EX[norm360(d + 90)];
const tanEx = (d) => {
  const r = norm360(d);
  if (r === 90 || r === 270) return '∄';
  return TAN_EX[r];
};
const cotEx = (d) => {
  const r = norm360(d);
  if (r === 0 || r === 180) return '∄';
  return TAN_EX[norm360(90 - r)];
};
/** Угол в радианах: 150° → 5π/6. */
const radStr = (d) => {
  const f = nice(d / 180, 12, 3);
  if (f === '0') return '0';
  if (!/^[−\d/]+$/.test(f)) return `${fmt((d * Math.PI) / 180, 2)}`;
  const [n, m] = f.split('/');
  const num = n === '1' ? 'π' : n === '−1' ? '−π' : `${n}π`;
  return m ? `${num}/${m}` : num;
};
const quarter = (d) => {
  const r = norm360(d);
  if (r % 90 === 0) return 0;
  return Math.floor(r / 90) + 1;
};

function trigTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let A;
  do A = pick(STD.filter((x) => x % 90 !== 0));
  while (st.task && A === st.task.A);
  st.task = { type, A, done: false };
  return { deg: 0 };
}

const unitCircle = modes({
  title: L('Unit circle: sin, cos, tg', 'Единичная окружность: sin, cos, tg', 'Бірлік шеңбер: sin, cos, tg'),
  intro: L('A point moves around a circle of radius 1: its x is the cosine of the angle, its y is the sine, and tg = sin/cos.', 'Точка движется по окружности радиуса 1: её x - косинус угла, y - синус, а tg = sin/cos.', 'Нүкте радиусы 1 шеңбер бойымен қозғалады: оның x-і - бұрыштың косинусы, y-і - синусы, ал tg = sin/cos.'),
  sliders: [{ id: 'deg', label: L('angle α, °', 'угол α, °', 'α бұрышы, °'), min: -360, max: 360, step: 1, value: 30 }],
  tabs: [L('sin and cos', 'sin и cos', 'sin және cos'), L('tg and ctg', 'tg и ctg', 'tg және ctg'), L('Graphs', 'Графики', 'Графиктер'), TASK],
  acts: [{ label: PLAY, only: [0, 1, 2] }, { label: L('Next angle ↻', 'Следующий угол ↻', 'Келесі бұрыш ↻'), only: [0, 1, 2] }, { label: MORE, only: [3] }],
  playDur: 9000,
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return trigTask(st);
    return null;
  },
  onAct(j, st, v, api) {
    if (j === 0) {
      api.play('deg', { dur: 9000, linear: true });
      return null;
    }
    if (j === 2) return trigTask(st);
    const nxt = STD.find((x) => x > norm360(v.deg) + 0.5) ?? 360;
    const base = v.deg - norm360(v.deg);
    return { deg: clamp(base + nxt > 360 ? nxt - 360 : base + nxt, -360, 360), $dur: 500 };
  },
  draw(v, step, st) {
    const d = v.deg;
    const a = deg(d);
    const sn = Math.sin(a);
    const cs = Math.cos(a);
    const S = sinEx(d);
    const Cc = cosEx(d);
    const q = quarter(d);
    const roman = ['', 'I', 'II', 'III', 'IV'];
    const r2 = (x) => (Math.abs(x) < 5e-4 ? 0 : x);

    const circle = (cx, cy, r, small = false) => {
      const [px, py] = on(cx, cy, r, d);
      let g = `${ln(cx - r - 14, cy, cx + r + 14, cy, 'exc-m', 1.2)}${ln(cx, cy - r - 12, cx, cy + r + 12, 'exc-m', 1.2)}<circle class="ex-ring" cx="${cx}" cy="${cy}" r="${r}"/>`;
      if (q) g += area(arcD(cx, cy, r, (q - 1) * 90, q * 90, true), 'exc-y', 0.18);
      if (!small)
        for (const t of STD) {
          const [x1, y1] = on(cx, cy, r - 4, t);
          const [x2, y2] = on(cx, cy, r + 4, t);
          g += ln(x1, y1, x2, y2, 'exc-m', 1);
        }
      if (!small) g += `${T(cx + r + 7, cy - 4, '1', 'm9 exm-mut ex-start')}${T(cx - r - 7, cy - 4, '−1', 'm9 exm-mut ex-end')}${T(cx + 5, cy - r - 4, '1', 'm9 exm-mut ex-start')}${T(cx + 5, cy + r + 11, '−1', 'm9 exm-mut ex-start')}`;
      if (!small) for (let k = 1; k <= 4; k++) g += T(...on(cx, cy, r * 0.62, k * 90 - 45), roman[k], `m10 ${k === q ? '' : 'exm-mut'}`);
      g += pth(arcD(cx, cy, small ? 12 : 18, 0, d), 'exc-o', 2);
      g += ln(cx, cy, px, py, 'exc-m', 2);
      return { g, px, py };
    };

    if (st.m === 2) {
      const cx = 52;
      const cy = 110;
      const r = 42;
      const c0 = circle(cx, cy, r, true);
      const gx = (t) => 108 + ((t + 360) / 720) * 206;
      const gy = (y) => cy - y * r;
      let g = '';
      for (let t = -360; t <= 360; t += 90) g += ln(gx(t), cy - r - 6, gx(t), cy + r + 6, 'exc-m', t === 0 ? 1.2 : 0.4) + (t % 180 === 0 ? T(gx(t), cy + r + 18, `${fmt(t)}°`, 'm9 exm-mut') : '');
      g += ln(gx(-360), cy, gx(360), cy, 'exc-m', 1.2) + ln(gx(-360), gy(1), gx(360), gy(1), 'exc-m ex-dash', 0.6) + ln(gx(-360), gy(-1), gx(360), gy(-1), 'exc-m ex-dash', 0.6);
      g += pth(plot((t) => gy(Math.sin(deg(t))), -360, 360, gx, (y) => y, 200), 'exc-k', 2.2) + pth(plot((t) => gy(Math.cos(deg(t))), -360, 360, gx, (y) => y, 200), 'exc-g', 2.2);
      g += ln(c0.px, c0.py, gx(d), gy(sn), 'exc-k ex-dash', 1) + dot(gx(d), gy(sn), 4.5, 'exc-k') + dot(gx(d), gy(cs), 4.5, 'exc-g') + ln(gx(d), 18, gx(d), 202, 'exc-o', 1);
      return {
        svg: `${c0.g}${ln(cx, cy, c0.px, cy, 'exc-g', 3)}${ln(c0.px, cy, c0.px, c0.py, 'exc-k', 3)}${dot(c0.px, c0.py, 4.5, 'exc-p')}${g}
          ${T(8, 18, `α = ${fmt(d, 0)}° = ${radStr(d)}`, 'm12 ex-start h')}${T(312, 18, `sin α = ${S ?? fmt(r2(sn))}`, 'm11 tc exc-k ex-end h')}${T(312, 34, `cos α = ${Cc ?? fmt(r2(cs))}`, 'm11 tc exc-g ex-end h')}`,
        caption: L(
          `The height of the point is the sine (pink wave), its x is the cosine (green wave). Both repeat every 360° (period 2π), values stay between −1 and 1, and cosine is the sine shifted by 90°: cos α = sin(α + 90°).`,
          `Высота точки - синус (розовая волна), её x - косинус (зелёная). Обе повторяются через 360° (период 2π), значения от −1 до 1, а косинус - это синус, сдвинутый на 90°: cos α = sin(α + 90°).`,
          `Нүктенің биіктігі - синус (қызғылт толқын), x-і - косинус (жасыл). Екеуі де 360° сайын қайталанады (период 2π), мәндері −1-ден 1-ге дейін, ал косинус - 90°-қа жылжыған синус: cos α = sin(α + 90°).`,
        ),
      };
    }

    const cx = 96;
    const cy = 110;
    const r = 78;
    const c0 = circle(cx, cy, r);
    const { px, py } = c0;
    const signs = L(
      `Quarter ${roman[q]}: sin ${sn > 0 ? '+' : '−'}, cos ${cs > 0 ? '+' : '−'}.`,
      `${roman[q]} четверть: sin ${sn > 0 ? '+' : '−'}, cos ${cs > 0 ? '+' : '−'}.`,
      `${roman[q]} ширек: sin ${sn > 0 ? '+' : '−'}, cos ${cs > 0 ? '+' : '−'}.`,
    );
    const val = (ex, x) => ex ?? fmt(r2(x));
    const head = `${T(258, 24, `α = ${fmt(d, 0)}°`, 'm15')}${T(258, 42, `= ${radStr(d)} ${u('rad', 'рад', 'рад')}`, 'm11 exm-mut')}`;

    if (st.m === 1) {
      const tx = cx + r;
      const ty = cy - r;
      const okT = Math.abs(cs) > 1e-6;
      const okC = Math.abs(sn) > 1e-6;
      const tg = okT ? sn / cs : 0;
      const ct = okC ? cs / sn : 0;
      const tY = cy - clamp(tg, -1.35, 1.35) * r;
      const cX = cx + clamp(ct, -1.15, 1.45) * r;
      let g = `${ln(tx, 4, tx, 216, 'exc-o', 1.2)}${ln(4, ty, 216, ty, 'exc-b', 1.2)}${T(tx + 3, 214, 'tg', 'm10 tc exc-o ex-start')}${T(4, ty - 4, 'ctg', 'm10 tc exc-b ex-start')}`;
      if (okT) g += ln(cx, cy, tx, tY, 'exc-o ex-dash', 1) + ln(tx, cy, tx, tY, 'exc-o', 4) + dot(tx, tY, 4.5, 'exc-o');
      if (okC) g += ln(cx, cy, cX, ty, 'exc-b ex-dash', 1) + ln(cx, ty, cX, ty, 'exc-b', 4) + dot(cX, ty, 4.5, 'exc-b');
      const T1 = tanEx(d);
      const C1 = cotEx(d);
      return {
        svg: `${c0.g}${g}${dot(px, py, 5, 'exc-p')}${head}${T(258, 80, `tg α = ${okT ? val(T1, tg) : u('none', 'нет', 'жоқ')}`, 'm12 tc exc-o')}${T(258, 102, `ctg α = ${okC ? val(C1, ct) : u('none', 'нет', 'жоқ')}`, 'm12 tc exc-b')}${T(258, 132, 'tg = sin / cos', 'm10 exm-mut')}${T(258, 148, 'ctg = cos / sin', 'm10 exm-mut')}`,
        caption: !okT
          ? L(`cos ${fmt(d, 0)}° = 0, so tg = sin/cos does not exist: the ray is parallel to the tangent line x = 1 and never meets it.`, `cos ${fmt(d, 0)}° = 0, поэтому tg = sin/cos не существует: луч параллелен линии тангенсов x = 1 и не пересекает её.`, `cos ${fmt(d, 0)}° = 0, сондықтан tg = sin/cos жоқ: сәуле x = 1 тангенстер сызығына параллель, оны қимайды.`)
          : L(
              `tg α = sin/cos = ${fmt(r2(sn))} / ${fmt(r2(cs))} = ${fmt(tg)}: continue the radius to the orange line x = 1, the height of the meeting point is tg. ${okC ? `ctg α = 1/tg = ${fmt(ct)} - on the blue line y = 1.` : 'ctg does not exist here (sin = 0).'} tg repeats every 180°.`,
              `tg α = sin/cos = ${fmt(r2(sn))} / ${fmt(r2(cs))} = ${fmt(tg)}: продолжим радиус до оранжевой прямой x = 1, высота точки встречи - это tg. ${okC ? `ctg α = 1/tg = ${fmt(ct)} - на синей прямой y = 1.` : 'ctg здесь не существует (sin = 0).'} tg повторяется через 180°.`,
              `tg α = sin/cos = ${fmt(r2(sn))} / ${fmt(r2(cs))} = ${fmt(tg)}: радиусты x = 1 қызғылт сары түзуіне дейін созамыз, кездесу нүктесінің биіктігі - tg. ${okC ? `ctg α = 1/tg = ${fmt(ct)} - y = 1 көк түзуінде.` : 'Мұнда ctg жоқ (sin = 0).'} tg 180° сайын қайталанады.`,
            ),
      };
    }

    const pic = `${c0.g}${ln(cx, cy, px, cy, 'exc-g', 4)}${ln(px, cy, px, py, 'exc-k', 4)}${dot(px, py, 6, 'exc-p')}
      ${Math.abs(cs) > 0.15 ? T((cx + px) / 2, cy + (sn > 0 ? 14 : -6), 'cos', 'm10 tc exc-g h') : ''}${Math.abs(sn) > 0.15 ? T(px + (cs >= 0 ? 5 : -5), (cy + py) / 2 + 4, 'sin', `m10 tc exc-k h ${cs >= 0 ? 'ex-start' : 'ex-end'}`) : ''}`;

    if (st.m === 3) {
      const tk = st.task ?? (trigTask(st), st.task);
      const ok = check(st, Math.abs(norm360(d) - tk.A) < 0.5 || Math.abs(norm360(d) - tk.A) > 359.5);
      const A = tk.A;
      const sc = (x) => (Math.sin(deg(x)) > 0 ? '> 0' : '< 0');
      const cc = (x) => (Math.cos(deg(x)) > 0 ? '> 0' : '< 0');
      const ask = [
        L(`Set the angle α = ${radStr(A)}.`, `Поставь угол α = ${radStr(A)}.`, `α = ${radStr(A)} бұрышын қой.`),
        L(`Find α in [0°; 360°): sin α = ${sinEx(A)} and cos α ${cc(A)}.`, `Найди α из [0°; 360°): sin α = ${sinEx(A)} и cos α ${cc(A)}.`, `[0°; 360°) аралығынан α тап: sin α = ${sinEx(A)} және cos α ${cc(A)}.`),
        L(`Find α in [0°; 360°): cos α = ${cosEx(A)} and sin α ${sc(A)}.`, `Найди α из [0°; 360°): cos α = ${cosEx(A)} и sin α ${sc(A)}.`, `[0°; 360°) аралығынан α тап: cos α = ${cosEx(A)} және sin α ${sc(A)}.`),
      ][tk.type];
      const tag = [`α = ${radStr(A)}`, `sin = ${sinEx(A)}, cos ${cc(A)}`, `cos = ${cosEx(A)}, sin ${sc(A)}`][tk.type];
      const hint = [
        L(`Now α = ${fmt(d, 0)}°. Hint: π = 180°, so π/6 = 30°, π/4 = 45°.`, `Сейчас α = ${fmt(d, 0)}°. Подсказка: π = 180°, значит π/6 = 30°, π/4 = 45°.`, `Қазір α = ${fmt(d, 0)}°. Кеңес: π = 180°, демек π/6 = 30°, π/4 = 45°.`),
        J(L(`Now sin α = ${fmt(r2(sn))}.`, `Сейчас sin α = ${fmt(r2(sn))}.`, `Қазір sin α = ${fmt(r2(sn))}.`), L('Hint: look at the signs in the quarters.', 'Подсказка: смотри знаки по четвертям.', 'Кеңес: ширектердегі таңбаларды қара.')),
        J(L(`Now cos α = ${fmt(r2(cs))}.`, `Сейчас cos α = ${fmt(r2(cs))}.`, `Қазір cos α = ${fmt(r2(cs))}.`), L('Hint: cos is the x of the point, sin is the y.', 'Подсказка: cos - это x точки, sin - её y.', 'Кеңес: cos - нүктенің x-і, sin - y-і.')),
      ][tk.type];
      return {
        svg: `${pic}${T(250, 70, `α = ${fmt(d, 0)}°`, 'm15')}${T(250, 96, `sin α = ${fmt(r2(sn))}`, 'm12 tc exc-k')}${T(250, 118, `cos α = ${fmt(r2(cs))}`, 'm12 tc exc-g')}${badge(tag, ok)}`,
        caption: taskCap(st, ok, ask, hint),
      };
    }

    return {
      svg: `${pic}${head}${T(258, 78, `sin α = ${val(S, sn)}`, 'm12 tc exc-k')}${S?.includes('√') ? T(258, 91, `≈ ${fmt(r2(sn))}`, 'm9 exm-mut') : ''}${T(258, 110, `cos α = ${val(Cc, cs)}`, 'm12 tc exc-g')}${Cc?.includes('√') ? T(258, 123, `≈ ${fmt(r2(cs))}`, 'm9 exm-mut') : ''}${T(258, 146, 'sin² α + cos² α = 1', 'm10 exm-mut')}${q ? T(258, 166, `${roman[q]}: sin ${sn > 0 ? '+' : '−'}, cos ${cs > 0 ? '+' : '−'}`, 'm11') : ''}`,
      caption: J(
        L(
          `Angle ${fmt(d, 0)}° = ${radStr(d)}: cos α = ${val(Cc, cs)}${Cc?.includes('√') ? ` ≈ ${fmt(r2(cs))}` : ''} (green, along x), sin α = ${val(S, sn)} (pink, along y).`,
          `Угол ${fmt(d, 0)}° = ${radStr(d)}: cos α = ${val(Cc, cs)}${Cc?.includes('√') ? ` ≈ ${fmt(r2(cs))}` : ''} (зелёный, по x), sin α = ${val(S, sn)} (розовый, по y).`,
          `Бұрыш ${fmt(d, 0)}° = ${radStr(d)}: cos α = ${val(Cc, cs)}${Cc?.includes('√') ? ` ≈ ${fmt(r2(cs))}` : ''} (жасыл, x бойынша), sin α = ${val(S, sn)} (қызғылт, y бойынша).`,
        ),
        q ? signs : null,
        d < 0 ? L('A negative angle goes clockwise.', 'Отрицательный угол отсчитывают по часовой стрелке.', 'Теріс бұрыш сағат тілімен өлшенеді.') : null,
      ),
    };
  },
});

// ---------- Вероятность ----------

const DICE_EV = [
  { t: (S) => L(`sum = ${S}`, `сумма = ${S}`, `қосынды = ${S}`), f: (a, b, S) => a + b === S },
  { t: (S) => L(`sum ≥ ${S}`, `сумма ≥ ${S}`, `қосынды ≥ ${S}`), f: (a, b, S) => a + b >= S },
  { t: () => L('a double', 'дубль (одинаковые)', 'дубль (бірдей)'), f: (a, b) => a === b },
  { t: () => L('at least one 6', 'хотя бы одна 6', 'кемінде бір 6'), f: (a, b) => a === 6 || b === 6 },
];
const URN_EV = [
  L('1 ball: red', '1 шар: красный', '1 шар: қызыл'),
  L('2 balls, no return: both red', '2 шара без возврата: оба красные', '2 шар, қайтармай: екеуі де қызыл'),
  L('2 balls, with return: both red', '2 шара с возвратом: оба красные', '2 шар, қайтарып: екеуі де қызыл'),
  L('2 balls, no return: different colours', '2 шара без возврата: разного цвета', '2 шар, қайтармай: түстері әртүрлі'),
];
/** Вероятность события урны и запись произведения. */
function urnP(r, b, ev) {
  const n = r + b;
  if (!n) return null;
  if (ev === 0) return { p: r / n, num: r, den: n, s: `${r}/${n}` };
  if (ev === 2) return { p: (r / n) ** 2, num: r * r, den: n * n, s: `${r}/${n} · ${r}/${n}` };
  if (n < 2) return null;
  if (ev === 1) return { p: (r * (r - 1)) / (n * (n - 1)), num: r * (r - 1), den: n * (n - 1), s: `${r}/${n} · ${Math.max(0, r - 1)}/${n - 1}` };
  return { p: (2 * r * b) / (n * (n - 1)), num: 2 * r * b, den: n * (n - 1), s: `${r}/${n} · ${b}/${n - 1} + ${b}/${n} · ${r}/${n - 1}` };
}

function probTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 3);
  while (type === last);
  let t = {};
  if (type === 0) {
    const m = pick([1, 2, 3, 4, 5]);
    t = { m };
  } else if (type === 2) {
    const [num, den, b] = pick([[1, 3, 6], [2, 5, 6], [1, 2, 5], [1, 4, 6], [3, 5, 4], [2, 3, 4], [1, 5, 8]]);
    t = { num, den, b, r: (num * b) / (den - num) };
  } else if (type === 3) {
    const r = rnd(1, 9);
    t = { r, b: 10 - r };
  }
  st.task = { type, done: false, urn: type >= 2, ...t };
  st.sim = null;
  st.S = 2;
  return type === 2 ? { r: 1, bl: t.b } : type === 3 ? { r: 5, bl: 2 } : null;
}

const probability = modes({
  title: L('Probability', 'Вероятность', 'Ықтималдық'),
  intro: L('P(A) = favourable outcomes ÷ all equally likely outcomes. Check it with an experiment: the frequency gets close to P.', 'P(A) = благоприятные исходы ÷ все равновозможные исходы. Проверь опытом: частота приближается к P.', 'P(A) = қолайлы нәтижелер ÷ барлық тең мүмкін нәтижелер. Тәжірибемен тексер: жиілік P-ға жақындайды.'),
  sliders: [
    { id: 'r', label: L('red balls', 'красных шаров', 'қызыл шар'), min: 0, max: 10, value: 3, hidden: (v, st) => !(st.m === 1 || (st.m === 2 && st.task?.urn)) },
    { id: 'bl', label: L('blue balls', 'синих шаров', 'көк шар'), min: 0, max: 10, value: 5, hidden: (v, st) => !(st.m === 1 || (st.m === 2 && st.task?.urn)) },
  ],
  tabs: [L('Two dice', 'Два кубика', 'Екі сүйек'), L('Balls', 'Шары', 'Шарлар'), TASK],
  acts: [{ label: L('Experiment ×20', 'Опыт ×20', 'Тәжірибе ×20'), only: [0, 1] }, { label: L('Event ↻', 'Событие ↻', 'Оқиға ↻'), only: [0, 1] }, { label: MORE, only: [2] }],
  state: () => ({ S: 7, ev: [0, 0], sim: null }),
  onTab(m, st, v, again) {
    st.sim = null;
    if (m === 2 && (again || !st.task || st.task.done)) return probTask(st);
    return null;
  },
  onSlide(k, v, st) {
    st.sim = null;
  },
  onAct(j, st, v) {
    if (j === 2) return probTask(st);
    if (j === 1) {
      st.ev[st.m] = (st.ev[st.m] + 1) % 4;
      st.sim = null;
      return null;
    }
    const sim = st.sim ?? { n: 0, k: 0, last: null };
    for (let i = 0; i < 20; i++) {
      if (st.m === 0) {
        const a = rnd(1, 6);
        const b = rnd(1, 6);
        sim.last = [a, b];
        sim.n += 1;
        if (DICE_EV[st.ev[0]].f(a, b, st.S)) sim.k += 1;
      } else {
        const r = Math.round(v.r);
        const n = r + Math.round(v.bl);
        const ev = st.ev[1];
        if (!n || (n < 2 && ev !== 0 && ev !== 2)) break;
        const first = Math.random() < r / n;
        let hitE;
        if (ev === 0) hitE = first;
        else {
          const r2 = ev === 2 ? r : r - (first ? 1 : 0);
          const n2 = ev === 2 ? n : n - 1;
          const second = Math.random() < r2 / n2;
          hitE = ev === 3 ? first !== second : first && second;
          sim.last = [first, second];
        }
        if (ev === 0) sim.last = [first];
        sim.n += 1;
        if (hitE) sim.k += 1;
      }
    }
    st.sim = sim;
    return null;
  },
  onDrag(key, p, v, st) {
    if (key.startsWith('s')) {
      st.S = Number(key.slice(1));
      if (st.m === 0) st.sim = null;
    }
  },
  draw(v, step, st) {
    const tk = st.m === 2 ? (st.task ?? (probTask(st), st.task)) : null;
    const dice = st.m === 0 || (tk && !tk.urn);
    if (dice) {
      const ev = tk ? 0 : st.ev[0];
      const E = DICE_EV[ev];
      const S = st.S;
      const c = 24;
      const X0 = 28;
      const Y0 = 34;
      let g = '';
      let m = 0;
      for (let a = 1; a <= 6; a++)
        for (let b = 1; b <= 6; b++) {
          const inE = E.f(a, b, S);
          if (inE) m += 1;
          const x = X0 + (b - 1) * c;
          const y = Y0 + (a - 1) * c;
          const last = st.sim?.last && st.sim.last[0] === a && st.sim.last[1] === b;
          g += `<rect class="ex-fill ${inE ? 'exc-p' : 'exm-off'}" x="${x}" y="${y}" width="${c - 2}" height="${c - 2}" rx="4"/>${T(x + c / 2 - 1, y + c / 2 + 3, a + b, `m10 ${inE ? 'exm-on' : 'exm-mut'}`)}${last ? `<rect class="ex-stroke exc-o" style="fill:none;stroke-width:2.5" x="${x - 1}" y="${y - 1}" width="${c}" height="${c}" rx="5"/>` : ''}<rect class="ex-hit" data-drag="s${a + b}" x="${x}" y="${y}" width="${c - 2}" height="${c - 2}"/>`;
        }
      for (let i = 1; i <= 6; i++) g += T(X0 + (i - 1) * c + c / 2 - 1, Y0 - 6, i, 'm10 tc exc-b') + T(X0 - 9, Y0 + (i - 1) * c + c / 2 + 3, i, 'm10 tc exc-o');
      g += T(X0 + 4 * c, 14, u('die 2 →', 'кубик 2 →', '2-сүйек →'), 'm9 exm-mut') + T(4, 14, u('die 1 ↓', 'кубик 1 ↓', '1-сүйек ↓'), 'm9 exm-mut ex-start');
      const P = frs(m, 36);
      const sim = st.sim;
      const right = `${T(250, 40, `A: ${tx(E.t(S))}`, 'm11')}${T(250, 70, `P(A) = ${m}/36`, 'm15 tc exc-p')}${T(250, 92, `= ${P} ≈ ${fmt(m / 36, 3)}`, 'm12')}
        ${sim ? `${T(250, 130, `${u('rolls', 'бросков', 'лақтыру')}: ${sim.n}`, 'm11')}${T(250, 148, `${u('A happened', 'A было', 'A болды')}: ${sim.k}`, 'm11')}${T(250, 168, `${u('frequency', 'частота', 'жиілік')} ${fmt(sim.k / sim.n, 3)}`, 'm12 tc exc-o')}${box(190, 180, 120, 10, 'exm-off', 5)}${box(190, 180, 120 * (sim.k / sim.n), 10, 'exc-o', 5)}${ln(190 + 120 * (m / 36), 176, 190 + 120 * (m / 36), 194, 'exc-p', 2.5)}` : T(250, 140, u('tap a cell:', 'нажми на клетку:', 'торды бас:'), 'm9 exm-mut') + T(250, 153, u('pick the sum', 'выбери сумму', 'қосындыны таңда'), 'm9 exm-mut')}`;
      if (tk) {
        let ok;
        let ask;
        let hint;
        let tag;
        if (tk.type === 0) {
          ok = m === tk.m;
          tag = `P = ${frs(tk.m, 36)}`;
          ask = L(`Tap a sum whose probability is ${tk.m}/36${frs(tk.m, 36) !== `${tk.m}/36` ? ` = ${frs(tk.m, 36)}` : ''}.`, `Нажми на сумму, вероятность которой ${tk.m}/36${frs(tk.m, 36) !== `${tk.m}/36` ? ` = ${frs(tk.m, 36)}` : ''}.`, `Ықтималдығы ${tk.m}/36${frs(tk.m, 36) !== `${tk.m}/36` ? ` = ${frs(tk.m, 36)}` : ''} болатын қосындыны бас.`);
          hint = L(`Sum ${S} occurs in ${m} cells. We need ${tk.m} cells.`, `Сумма ${S} встречается в ${m} ${pl(m, 'клетке', 'клетках', 'клетках')}. Нужно ${tk.m}.`, `${S} қосындысы ${m} торда кездеседі. ${tk.m} керек.`);
        } else {
          ok = S === 7;
          tag = 'max P';
          ask = L('Which sum of two dice comes up most often? Tap it.', 'Какая сумма двух кубиков выпадает чаще всего? Нажми на неё.', 'Екі сүйектің қай қосындысы жиі түседі? Соны бас.');
          hint = L(`Sum ${S}: ${m} of 36. Look for the longest diagonal.`, `Сумма ${S}: ${m} из 36. Ищи самую длинную диагональ.`, `${S} қосындысы: 36-дан ${m}. Ең ұзын диагональды ізде.`);
        }
        ok = check(st, ok);
        return { svg: `${g}${T(250, 70, `P = ${m}/36`, 'm15 tc exc-p')}${T(250, 92, `= ${P}`, 'm12')}${T(250, 150, u('tap a cell', 'нажми на клетку', 'торды бас'), 'm9 exm-mut')}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
      }
      const capE = [
        L(`Two dice give 6 · 6 = 36 equally likely pairs. The sum ${S} appears in ${m} of them: P = ${m}/36${P !== `${m}/36` ? ` = ${P}` : ''}. The middle sums are more likely: 7 has the longest diagonal (6 cells).`, `У двух кубиков 6 · 6 = 36 равновозможных пар. Сумма ${S} встречается в ${m} из них: P = ${m}/36${P !== `${m}/36` ? ` = ${P}` : ''}. Средние суммы вероятнее: у 7 самая длинная диагональ (6 клеток).`, `Екі сүйекте 6 · 6 = 36 тең мүмкін жұп бар. ${S} қосындысы олардың ${m}-інде кездеседі: P = ${m}/36${P !== `${m}/36` ? ` = ${P}` : ''}. Ортаңғы қосындылар ықтималырақ: 7-нің диагоналі ең ұзын (6 тор).`),
        L(`Sum ≥ ${S}: ${m} cells of 36, P = ${P}. Counting the opposite event (sum < ${S}) can be faster: 1 − ${36 - m}/36.`, `Сумма ≥ ${S}: ${m} клеток из 36, P = ${P}. Иногда проще посчитать противоположное событие (сумма < ${S}): 1 − ${36 - m}/36.`, `Қосынды ≥ ${S}: 36-дан ${m} тор, P = ${P}. Кейде қарама-қарсы оқиғаны (қосынды < ${S}) санау оңай: 1 − ${36 - m}/36.`),
        L(`A double is the diagonal: 6 of 36, P = 1/6. The second die just has to repeat the first one.`, `Дубль - это диагональ: 6 из 36, P = 1/6. Второй кубик просто должен повторить первый.`, `Дубль - диагональ: 36-дан 6, P = 1/6. Екінші сүйек біріншісін қайталауы керек.`),
        L(`At least one 6: 11 of 36. Faster through the opposite event "no sixes": 1 − (5/6)·(5/6) = 1 − 25/36 = 11/36.`, `Хотя бы одна 6: 11 из 36. Быстрее через противоположное «ни одной шестёрки»: 1 − (5/6)·(5/6) = 1 − 25/36 = 11/36.`, `Кемінде бір 6: 36-дан 11. Қарама-қарсы «бірде-бір алтылық жоқ» арқылы тезірек: 1 − (5/6)·(5/6) = 1 − 25/36 = 11/36.`),
      ][ev];
      const capS = sim ? L(`After ${sim.n} rolls the frequency is ${sim.k}/${sim.n} ≈ ${fmt(sim.k / sim.n, 2)} (the purple mark is P ≈ ${fmt(m / 36, 2)}).`, `После ${sim.n} бросков частота ${sim.k}/${sim.n} ≈ ${fmt(sim.k / sim.n, 2)} (фиолетовая черта - P ≈ ${fmt(m / 36, 2)}).`, `${sim.n} лақтырудан кейін жиілік ${sim.k}/${sim.n} ≈ ${fmt(sim.k / sim.n, 2)} (күлгін сызық - P ≈ ${fmt(m / 36, 2)}).`) : null;
      return { svg: g + right, caption: J(capE, capS) };
    }

    // ----- Шары -----
    const r = Math.round(v.r);
    const b = Math.round(v.bl);
    const n = r + b;
    const ev = tk ? 0 : st.ev[1];
    let g = `<path class="ex-stroke exc-m" style="stroke-width:2.5" d="M12 50 V196 Q12 206 22 206 H108 Q118 206 118 196 V50"/>`;
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 5);
      g += `<circle class="ex-fill exm-dot ${i < r ? 'exc-r' : 'exc-b'}" cx="${26 + (i % 5) * 20}" cy="${193 - row * 20}" r="8.5"/>`;
    }
    g += T(65, 40, `${r} + ${b} = ${n}`, 'm12');
    const res = urnP(r, b, ev);
    // дерево
    const tree = () => {
      if (!n) return '';
      const X1 = 140;
      const X2 = 205;
      const X3 = 268;
      const R = (x, y, lab, cls) => `${dot(x, y, 7, cls)}${lab ? T(x + 10, y + 4, lab, 'm9 ex-start') : ''}`;
      let s = '';
      const pr = [r / n, b / n];
      const ys = [70, 150];
      if (ev === 0) {
        s += ln(X1, 110, X2, ys[0], 'exc-r', 1.5 + 2.5 * pr[0]) + ln(X1, 110, X2, ys[1], 'exc-b', 1.5 + 2.5 * pr[1]);
        s += T((X1 + X2) / 2 - 4, 86, `${r}/${n}`, 'm10 tc exc-r ex-end h') + T((X1 + X2) / 2 - 4, 142, `${b}/${n}`, 'm10 tc exc-b ex-end h');
        s += R(X2, ys[0], u('red ✓', 'красный ✓', 'қызыл ✓'), 'exc-r') + R(X2, ys[1], '', 'exc-b');
        return `${dot(X1, 110, 4, 'exc-m')}${s}`;
      }
      const back = ev === 2;
      const leaves = [];
      [0, 1].forEach((i) => {
        const y = ys[i];
        const first = i === 0;
        s += ln(X1, 110, X2, y, first ? 'exc-r' : 'exc-b', 2) + T((X1 + X2) / 2 - 4, (110 + y) / 2 + (first ? -2 : 10), first ? `${r}/${n}` : `${b}/${n}`, `m9 tc ${first ? 'exc-r' : 'exc-b'} ex-end h`) + dot(X2, y, 6, first ? 'exc-r' : 'exc-b');
        [0, 1].forEach((j) => {
          const y2 = y - 26 + j * 52;
          const second = j === 0;
          const rr = back ? r : r - (first ? 1 : 0);
          const nn = back ? n : n - 1;
          const num = second ? rr : nn - rr;
          const inE = ev === 3 ? first !== second : first && second;
          leaves.push(inE);
          s += ln(X2, y, X3, y2, second ? 'exc-r' : 'exc-b', inE ? 3 : 1.2) + T((X2 + X3) / 2, (y + y2) / 2 + (j ? 11 : -3), `${Math.max(0, num)}/${nn}`, `m9 tc ${second ? 'exc-r' : 'exc-b'} h`) + dot(X3, y2, 5, second ? 'exc-r' : 'exc-b') + (inE ? T(X3 + 9, y2 + 4, '✓', 'm12 tc exc-g ex-start') : '');
        });
      });
      return `${dot(X1, 110, 4, 'exc-m')}${s}`;
    };
    const sim = st.sim;
    const bottom = res ? `${T(220, 200, `P = ${res.s}`, 'm11')}${T(220, 216, `= ${frs(res.num, res.den)} ≈ ${fmt(res.p, 3)}`, 'm11 tc exc-p')}` : '';
    if (tk) {
      const want = tk.type === 2 ? `${tk.num}/${tk.den}` : `${fmt(tk.r / 10)}`;
      const ok = check(st, tk.type === 2 ? b === tk.b && r * tk.den === tk.num * n && n > 0 : r === tk.r && b === tk.b);
      const ask =
        tk.type === 2
          ? L(`There are ${tk.b} blue balls. How many red ones are needed so that P(red) = ${want}?`, `В урне ${tk.b} синих шаров. Сколько нужно красных, чтобы P(красный) = ${want}?`, `Ыдыста ${tk.b} көк шар бар. P(қызыл) = ${want} болу үшін неше қызыл шар керек?`)
          : L(`Put 10 balls in total so that P(red) = ${want}.`, `Положи всего 10 шаров так, чтобы P(красный) = ${want}.`, `P(қызыл) = ${want} болатындай барлығы 10 шар сал.`);
      const hint = L(`Now P(red) = ${r}/${n || 1} ≈ ${fmt(n ? r / n : 0, 3)}.${tk.type === 2 && b !== tk.b ? ` Keep ${tk.b} blue.` : ''}`, `Сейчас P(красный) = ${r}/${n || 1} ≈ ${fmt(n ? r / n : 0, 3)}.${tk.type === 2 && b !== tk.b ? ` Синих должно быть ${tk.b}.` : ''}`, `Қазір P(қызыл) = ${r}/${n || 1} ≈ ${fmt(n ? r / n : 0, 3)}.${tk.type === 2 && b !== tk.b ? ` Көк шар ${tk.b} болуы керек.` : ''}`);
      return { svg: `${g}${tree()}${T(220, 210, `P(${u('red', 'красный', 'қызыл')}) = ${r}/${n || 0}`, 'm12')}${badge(`P = ${want}`, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }
    const simTxt = sim ? T(220, 22, `${u('trials', 'опытов', 'тәжірибе')} ${sim.n}: ${u('freq.', 'частота', 'жиілік')} ${fmt(sim.k / Math.max(1, sim.n), 2)}`, 'm10 tc exc-o') : T(220, 22, tx(URN_EV[ev]), 'm10');
    if (!res)
      return {
        svg: `${g}${simTxt}`,
        caption: n ? L('With one ball you cannot draw two without returning it.', 'Из одного шара нельзя вынуть два без возвращения.', 'Бір шардан екі шарды қайтармай алу мүмкін емес.') : L('The urn is empty: add balls.', 'Урна пустая: добавь шаров.', 'Ыдыс бос: шар қос.'),
      };
    const capU = [
      L(`${r} red of ${n}: P = ${r}/${n}${frs(r, n) !== `${r}/${n}` ? ` = ${frs(r, n)}` : ''} ≈ ${fmt(res.p, 3)}.`, `${r} красных из ${n}: P = ${r}/${n}${frs(r, n) !== `${r}/${n}` ? ` = ${frs(r, n)}` : ''} ≈ ${fmt(res.p, 3)}.`, `${n} шардың ${r}-і қызыл: P = ${r}/${n}${frs(r, n) !== `${r}/${n}` ? ` = ${frs(r, n)}` : ''} ≈ ${fmt(res.p, 3)}.`),
      L(`Without return the second draw has one ball fewer: P = ${res.s} = ${frs(res.num, res.den)}. Multiply along the branch of the tree.`, `Без возврата во второй раз шаров на один меньше: P = ${res.s} = ${frs(res.num, res.den)}. Умножаем вероятности вдоль ветки дерева.`, `Қайтармағанда екінші рет шар біреуге аз: P = ${res.s} = ${frs(res.num, res.den)}. Ағаш бұтағы бойымен көбейтеміз.`),
      L(`With return the draws are independent: P = ${res.s} = ${frs(res.num, res.den)}.`, `С возвратом вынимания независимы: P = ${res.s} = ${frs(res.num, res.den)}.`, `Қайтарғанда алулар тәуелсіз: P = ${res.s} = ${frs(res.num, res.den)}.`),
      L(`Different colours: two branches (red-blue and blue-red), add them: P = ${res.s} = ${frs(res.num, res.den)}.`, `Разного цвета: две ветки (красный-синий и синий-красный), их складываем: P = ${res.s} = ${frs(res.num, res.den)}.`, `Түстері әртүрлі: екі бұтақ (қызыл-көк және көк-қызыл), оларды қосамыз: P = ${res.s} = ${frs(res.num, res.den)}.`),
    ][ev];
    return { svg: `${g}${tree()}${simTxt}${bottom}`, caption: J(capU, sim ? L(`Experiment: ${sim.k} of ${sim.n}.`, `Опыт: ${sim.k} из ${sim.n}.`, `Тәжірибе: ${sim.n}-ден ${sim.k}.`) : null) };
  },
});

// ---------- Системы уравнений ----------

const SSX = (x) => 160 + x * 18;
const SSY = (y) => 110 - y * 18;

function sysTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  if (type === 0) {
    let k1;
    let k2;
    let X;
    let Y;
    let b1;
    let b2;
    do {
      k1 = pick([-2, -1, -0.5, 0.5, 1, 2]);
      k2 = pick([-2, -1, -0.5, 0.5, 1, 2, 0]);
      X = rnd(-3, 3);
      Y = rnd(-3, 3);
      b1 = Y - k1 * X;
      b2 = Y - k2 * X;
    } while (k1 === k2 || Math.abs(b1) > 5 || Math.abs(b2) > 5);
    st.task = { type, X, Y, k1, b1, k2, b2, done: false };
    return { k1, b1, k2, b2: clamp(b2 + pick([-3, 3]), -6, 6) };
  }
  st.task = { type, done: false };
  return { k1: 1, b1: -1, k2: -0.5, b2: 2 };
}

const systems = modes({
  title: L('A system of two equations', 'Система двух уравнений', 'Екі теңдеу жүйесі'),
  intro: L('Each linear equation is a line. The solution of the system is the point lying on both lines.', 'Каждое линейное уравнение - прямая. Решение системы - точка, которая лежит на обеих прямых.', 'Әр сызықтық теңдеу - түзу. Жүйенің шешімі - екі түзуде де жатқан нүкте.'),
  sliders: [
    { id: 'k1', label: 'k₁', min: -3, max: 3, step: 0.5, value: 1 },
    { id: 'b1', label: 'b₁', min: -6, max: 6, step: 0.5, value: -1 },
    { id: 'k2', label: 'k₂', min: -3, max: 3, step: 0.5, value: -0.5 },
    { id: 'b2', label: 'b₂', min: -6, max: 6, step: 0.5, value: 2 },
  ],
  tabs: [L('Graph', 'График', 'График'), L('Step by step', 'По шагам', 'Қадаммен'), TASK],
  acts: [{ label: STEP, only: [1] }, { label: MORE }],
  state: () => ({ s: 0, pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return sysTask(st);
    return null;
  },
  onSlide(k, v, st) {
    st.s = Math.min(st.s, 4);
  },
  onAct(j, st) {
    if (j === 0) {
      st.s = (st.s + 1) % 5;
      return null;
    }
    if (st.m === 2) return sysTask(st);
    st.pre = (st.pre + 1) % 5;
    st.s = 0;
    return [{ k1: 2, b1: -3, k2: -1, b2: 3 }, { k1: 1, b1: 1, k2: 1, b2: -2 }, { k1: -0.5, b1: 2, k2: -0.5, b2: 2 }, { k1: 0, b1: 3, k2: 1.5, b2: 0 }, { k1: 1, b1: -1, k2: -0.5, b2: 2 }][st.pre];
  },
  draw(v, step, st) {
    const { k1, b1, k2, b2 } = v;
    const par = Math.abs(k1 - k2) < 1e-9;
    const same = par && Math.abs(b1 - b2) < 1e-9;
    const X = par ? 0 : (b2 - b1) / (k1 - k2);
    const Y = k1 * X + b1;
    const e1 = lineStr(k1, b1);
    const e2 = lineStr(k2, b2);
    const narrow = st.m === 1;
    const sx = narrow ? (x) => 80 + x * 14 : SSX;
    const sy = narrow ? (y) => 110 - y * 14 : SSY;
    const G = narrow ? grid({ x0: -5.5, x1: 5.5, y0: -7.5, y1: 7.5, X0: 3, X1: 157, Y0: 5, Y1: 215, lab: 2, ylab: 2 }).svg : grid({ x0: -8.8, x1: 8.8, y0: -6, y1: 6, lab: 2, ylab: 2 }).svg;
    const xr = narrow ? 5.6 : 9;
    const line = (k, b, cls) => pth(`M${n1(sx(-xr))} ${n1(sy(-xr * k + b))} L${n1(sx(xr))} ${n1(sy(xr * k + b))}`, cls, 3);
    const vis = !par && Math.abs(X) < (narrow ? 5.5 : 8.8) && Math.abs(Y) < (narrow ? 7.5 : 6);
    const pt = vis ? `${ln(sx(X), sy(Y), sx(X), sy(0), 'exc-m ex-dash', 1.2)}${ln(sx(X), sy(Y), sx(0), sy(Y), 'exc-m ex-dash', 1.2)}${dot(sx(X), sy(Y), 6, 'exc-o')}${T(sx(X) + 8, sy(Y) - 8, `(${nice(X)}; ${nice(Y)})`, 'm11 tc exc-o ex-start h')}` : '';
    const lines = `${line(k2, b2, same ? 'exc-b' : 'exc-b')}${line(k1, b1, same ? 'exc-p ex-dash' : 'exc-p')}`;
    const verdict = same
      ? L('The lines coincide: every point is a solution - infinitely many solutions.', 'Прямые совпали: каждая их точка - решение, решений бесконечно много.', 'Түзулер беттесті: әр нүктесі - шешім, шешімдер шексіз көп.')
      : par
        ? L(`k₁ = k₂ = ${fmt(k1)}, b₁ ≠ b₂: the lines are parallel and never meet - no solutions.`, `k₁ = k₂ = ${fmt(k1)}, b₁ ≠ b₂: прямые параллельны и не пересекаются - решений нет.`, `k₁ = k₂ = ${fmt(k1)}, b₁ ≠ b₂: түзулер параллель, қиылыспайды - шешім жоқ.`)
        : null;

    if (st.m === 1) {
      const rows = [
        [`{ ${e1}`, 'exc-p'],
        [`{ ${e2}`, 'exc-b'],
        [`${polyStr([[k1, 'x'], [b1, '']])} = ${polyStr([[k2, 'x'], [b2, '']])}`, ''],
        [`${polyStr([[k1 - k2, 'x']]) === '0' ? '0·x' : polyStr([[k1 - k2, 'x']])} = ${fmt(b2 - b1)}`, ''],
        [par ? (same ? u('any x', 'x - любое', 'x - кез келген') : u('no x', 'нет x', 'x жоқ')) : `x = ${nice(b2 - b1)} : ${pn(k1 - k2)} = ${nice(X)}`, 'exc-o'],
        [par ? '' : `y = ${fmt(k1)}·${pn(X)}${term(b1)} = ${nice(Y)}`, 'exc-o'],
      ];
      const shown = Math.min(rows.length, st.s + 3);
      const txt = rows
        .slice(0, shown)
        .map(([s, c], i) => T(164, 26 + i * 28, s, `m10 ex-start ${c ? `tc ${c}` : ''}`))
        .join('');
      const caps = [
        L('Both right sides equal y, so we can set them equal (substitution).', 'Обе правые части равны y, значит их можно приравнять (подстановка).', 'Екі оң жақ та y-ке тең, демек оларды теңестіруге болады (ауыстыру).'),
        L('Collect x on the left, numbers on the right.', 'Переносим x влево, числа вправо.', 'x-ті солға, сандарды оңға шығарамыз.'),
        verdict ?? L(`Divide by ${fmt(k1 - k2)}: x = ${nice(X)}.`, `Делим на ${fmt(k1 - k2)}: x = ${nice(X)}.`, `${fmt(k1 - k2)}-ге бөлеміз: x = ${nice(X)}.`),
        verdict ?? L(`Put x into any equation: y = ${nice(Y)}. Answer: (${nice(X)}; ${nice(Y)}) - the orange point.`, `Подставим x в любое уравнение: y = ${nice(Y)}. Ответ: (${nice(X)}; ${nice(Y)}) - оранжевая точка.`, `x-ті кез келген теңдеуге қоямыз: y = ${nice(Y)}. Жауап: (${nice(X)}; ${nice(Y)}) - қызғылт сары нүкте.`),
        verdict ?? L(`Check in the second equation: ${fmt(k2)}·${pn(X)}${term(b2)} = ${nice(k2 * X + b2)} ✓`, `Проверка во втором уравнении: ${fmt(k2)}·${pn(X)}${term(b2)} = ${nice(k2 * X + b2)} ✓`, `Екінші теңдеуде тексеру: ${fmt(k2)}·${pn(X)}${term(b2)} = ${nice(k2 * X + b2)} ✓`),
      ];
      return { svg: `${G}${lines}${st.s >= 3 ? pt : ''}${txt}`, caption: J(L(`Step ${st.s + 1} of 5.`, `Шаг ${st.s + 1} из 5.`, `${st.s + 1}-қадам (5-тен).`), caps[st.s]) };
    }

    const head = `${T(8, 18, e1, 'm12 tc exc-p ex-start h')}${T(8, 36, e2, 'm12 tc exc-b ex-start h')}`;
    if (st.m === 2) {
      const tk = st.task ?? (sysTask(st), st.task);
      let ok;
      let ask;
      let hint;
      let tag;
      if (tk.type === 0) {
        ok = !par && near(X, tk.X, 0.01) && near(Y, tk.Y, 0.01);
        tag = `(${tk.X}; ${tk.Y})`.replace(/-/g, '−');
        ask = L(`Move the lines so that the solution is (${fmt(tk.X)}; ${fmt(tk.Y)}) - the orange ring.`, `Сдвинь прямые так, чтобы решением была точка (${fmt(tk.X)}; ${fmt(tk.Y)}) - оранжевое кольцо.`, `Шешімі (${fmt(tk.X)}; ${fmt(tk.Y)}) нүктесі болатындай түзулерді жылжыт - қызғылт сары сақина.`);
        hint = L(`Now ${par ? 'there is no single point' : `(${nice(X)}; ${nice(Y)})`}. Hint: the point must lie on both lines: b = y − kx.`, `Сейчас ${par ? 'одной точки нет' : `(${nice(X)}; ${nice(Y)})`}. Подсказка: точка должна лежать на обеих прямых: b = y − kx.`, `Қазір ${par ? 'бір нүкте жоқ' : `(${nice(X)}; ${nice(Y)})`}. Кеңес: нүкте екі түзуде де жатуы керек: b = y − kx.`);
      } else if (tk.type === 1) {
        ok = par && !same;
        tag = u('no solutions', 'нет решений', 'шешім жоқ');
        ask = L('Make a system with no solutions.', 'Сделай систему, у которой нет решений.', 'Шешімі жоқ жүйе құрастыр.');
        hint = L('Hint: the lines must never meet. What must be equal: k or b?', 'Подсказка: прямые не должны встречаться. Что должно быть равно: k или b?', 'Кеңес: түзулер кездеспеуі керек. Не тең болуы керек: k ма, b ма?');
      } else {
        ok = same;
        tag = u('infinitely many', 'бесконечно много', 'шексіз көп');
        ask = L('Make a system with infinitely many solutions.', 'Сделай систему с бесконечным числом решений.', 'Шешімдері шексіз көп жүйе құрастыр.');
        hint = L('Hint: every point of one line must lie on the other.', 'Подсказка: каждая точка одной прямой должна лежать на другой.', 'Кеңес: бір түзудің әр нүктесі екіншісінде жатуы керек.');
      }
      ok = check(st, ok);
      const ringT = tk.type === 0 ? ring(SSX(tk.X), SSY(tk.Y), 8, 'exc-o', 2.5) : '';
      return { svg: `${G}${lines}${pt}${ringT}${head}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }

    return {
      svg: `${G}${lines}${pt}${head}`,
      caption:
        verdict ??
        L(
          `Set the right sides equal: ${polyStr([[k1, 'x'], [b1, '']])} = ${polyStr([[k2, 'x'], [b2, '']])} → x = ${nice(X)}, y = ${nice(Y)}. The lines cross at (${nice(X)}; ${nice(Y)}) - one solution, because k₁ ≠ k₂.`,
          `Приравняем правые части: ${polyStr([[k1, 'x'], [b1, '']])} = ${polyStr([[k2, 'x'], [b2, '']])} → x = ${nice(X)}, y = ${nice(Y)}. Прямые пересекаются в (${nice(X)}; ${nice(Y)}) - одно решение, потому что k₁ ≠ k₂.`,
          `Оң жақтарын теңестіреміз: ${polyStr([[k1, 'x'], [b1, '']])} = ${polyStr([[k2, 'x'], [b2, '']])} → x = ${nice(X)}, y = ${nice(Y)}. Түзулер (${nice(X)}; ${nice(Y)}) нүктесінде қиылысады - бір шешім, себебі k₁ ≠ k₂.`,
        ),
    };
  },
});

// ---------- Прогрессии ----------

const progVals = (a1, r, N, geo) => Array.from({ length: N }, (_, i) => (geo ? a1 * r ** i : a1 + i * r));

function progTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 3);
  while (type === last);
  let t;
  if (type === 0) {
    const a1 = rnd(-5, 6);
    const d = pick([-3, -2, -1.5, -1, 0.5, 1, 1.5, 2, 3]);
    const k = rnd(4, 8);
    t = { a1, d, k, ak: a1 + (k - 1) * d, need: 'd', p: { a1, d: 0, n: k } };
  } else if (type === 1) {
    const [b1, q, k] = pick([[2, 3, 4], [1, 2, 6], [3, 2, 5], [5, -2, 4], [1, -3, 4], [16, 0.5, 5], [2, -2, 5], [4, 1.5, 3]]);
    t = { a1: b1, q, k, bk: b1 * q ** (k - 1), need: 'q', p: { a1: b1, q: 1, n: k } };
  } else if (type === 2) {
    const a1 = rnd(-4, 5);
    const d = pick([2, 3, -2, 1.5, 4]);
    const k = rnd(5, 12);
    t = { a1, d, k, ak: a1 + (k - 1) * d, need: 'n', p: { a1, d, n: 1 } };
  } else {
    const a1 = rnd(1, 4);
    const d = pick([1, 2, 3]);
    const k = rnd(4, 10);
    t = { a1, d, k, S: ((2 * a1 + (k - 1) * d) * k) / 2, need: 'n', sum: true, p: { a1, d, n: 1 } };
  }
  st.task = { type, done: false, ...t };
  return t.p;
}

const progression = modes({
  title: L('Arithmetic and geometric progressions', 'Арифметическая и геометрическая прогрессии', 'Арифметикалық және геометриялық прогрессиялар'),
  intro: L('An arithmetic progression adds the same d each time, a geometric one multiplies by the same q.', 'Арифметическая прогрессия каждый раз прибавляет одно и то же d, геометрическая - умножает на одно и то же q.', 'Арифметикалық прогрессия әр жолы бірдей d қосады, геометриялық - бірдей q-ға көбейтеді.'),
  sliders: [
    { id: 'a1', label: 'a₁', min: -10, max: 10, step: 0.5, value: 2, hidden: (v, st) => st.m === 3 },
    { id: 'd', label: 'd', min: -4, max: 4, step: 0.5, value: 1.5, hidden: (v, st) => (st.m === 3 ? st.task?.need !== 'd' : st.m === 1) },
    { id: 'q', label: 'q', min: -3, max: 3, step: 0.5, value: 1.5, hidden: (v, st) => (st.m === 3 ? st.task?.need !== 'q' : st.m !== 1) },
    { id: 'n', label: 'n', min: 1, max: 12, value: 6, hidden: (v, st) => st.m === 3 && st.task?.need !== 'n' },
  ],
  tabs: [L('Arithmetic', 'Арифметическая', 'Арифметикалық'), L('Geometric', 'Геометрическая', 'Геометриялық'), L('Sum', 'Сумма', 'Қосынды'), TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return progTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return progTask(st);
    st.pre += 1;
    if (st.m === 1) return [{ a1: 1, q: 2, n: 8 }, { a1: 8, q: 0.5, n: 6 }, { a1: 1, q: -2, n: 7 }, { a1: 3, q: 1, n: 5 }][st.pre % 4];
    return [{ a1: 1, d: 1, n: 10 }, { a1: 10, d: -2, n: 8 }, { a1: -3, d: 1.5, n: 9 }, { a1: 2, d: 3, n: 6 }][st.pre % 4];
  },
  draw(v, step, st) {
    const tk = st.m === 3 ? (st.task ?? (progTask(st), st.task)) : null;
    const geo = st.m === 1 || tk?.need === 'q';
    const a1 = v.a1;
    const r = geo ? v.q : v.d;
    const n = Math.round(v.n);
    const N = Math.max(8, n);
    const vals = progVals(a1, r, N, geo);
    const an = vals[n - 1];
    const sumN = vals.slice(0, n).reduce((s, x) => s + x, 0);
    const sym = geo ? 'b' : 'a';

    if (st.m === 2) {
      const pos = vals.slice(0, n).every((x) => x >= 0);
      const H0 = 190;
      const tot = a1 + an;
      const k = pos && tot > 0 ? 160 / tot : 0;
      const w = Math.min(24, 250 / n);
      let g = '';
      for (let i = 0; i < n; i++) {
        const x = 30 + i * w;
        const h1 = vals[i] * k;
        const h2 = vals[n - 1 - i] * k;
        g += box(x, H0 - h1, w - 2, h1, 'exc-p', 2, 0.9) + box(x, H0 - h1 - h2, w - 2, h2, 'exc-o', 2, 0.55);
        if (w > 15) g += T(x + w / 2 - 1, H0 + 12, i + 1, 'm9 exm-mut');
      }
      if (pos && tot > 0) g += `<rect class="ex-stroke exc-m ex-dash" style="fill:none;stroke-width:1.5" x="29" y="${n1(H0 - tot * k)}" width="${n1(n * w)}" height="${n1(tot * k)}"/>${T(36 + n * w, H0 - (tot * k) / 2 + 4, `a₁ + aₙ = ${fmt(tot)}`, 'm10 ex-start')}`;
      const S = ((a1 + an) * n) / 2;
      return {
        svg: `${ln(24, H0, 316, H0, 'exc-m', 1.2)}${g}${T(8, 18, `Sₙ = (a₁ + aₙ)·n/2 = (${fmt(a1)} + ${pn(an)})·${n}/2 = ${fmt(S)}`, 'm11 ex-start h')}`,
        caption: pos
          ? L(
              `Gauss's trick: write the sum forwards (purple) and backwards (orange). Every column is a₁ + aₙ = ${fmt(tot)}, there are ${n} columns, so 2S = ${n}·${fmt(tot)} and S${n} = ${fmt(S)}.`,
              `Приём Гаусса: запишем сумму прямо (фиолетовые) и задом наперёд (оранжевые). Каждый столбик = a₁ + aₙ = ${fmt(tot)}, столбиков ${n}, значит 2S = ${n}·${fmt(tot)} и S${n} = ${fmt(S)}.`,
              `Гаусс тәсілі: қосындыны тура (күлгін) және кері (қызғылт сары) жазамыз. Әр баған = a₁ + aₙ = ${fmt(tot)}, баған саны ${n}, демек 2S = ${n}·${fmt(tot)} және S${n} = ${fmt(S)}.`,
            )
          : L(`Some terms are negative, the picture is not drawn, but the formula still works: S${n} = (a₁ + aₙ)·n/2 = ${fmt(S)}.`, `Есть отрицательные члены - картинку не рисуем, но формула работает: S${n} = (a₁ + aₙ)·n/2 = ${fmt(S)}.`, `Теріс мүшелер бар - сурет салмаймыз, бірақ формула орындалады: S${n} = (a₁ + aₙ)·n/2 = ${fmt(S)}.`),
      };
    }

    // столбики членов
    const shown = vals.slice(0, N);
    const mx = Math.max(...shown.map((x) => Math.abs(x)), 1e-9);
    const neg = shown.some((x) => x < 0);
    const zero = neg ? 118 : 190;
    const sc = (neg ? 76 : 150) / mx;
    const w = Math.min(30, 286 / N);
    let g = ln(18, zero, 316, zero, 'exc-m', 1.2);
    shown.forEach((x, i) => {
      const X = 24 + i * w;
      const h = x * sc;
      const on = i === n - 1;
      g += box(X, h >= 0 ? zero - h : zero, w - 4, Math.abs(h), on ? 'exc-o' : 'exc-p', 3, on ? 1 : 0.7);
      g += T(X + w / 2 - 2, zero + (x >= 0 ? 12 : -5), i + 1, 'm9 exm-mut');
      if (w > 21 || on) g += T(X + w / 2 - 2, h >= 0 ? zero - h - 4 : zero - h + 11, Math.abs(x) >= 1000 ? fmt(x, 0) : fmt(x, 1), `m9 ${on ? 'tc exc-o' : ''}`);
      if (i < Math.min(N - 1, 5) && w > 21) g += T(X + w - 2, 44, geo ? `×${fmt(r)}` : `${r >= 0 ? '+' : '−'}${fmt(Math.abs(r))}`, 'm9 tc exc-g');
    });
    const formula = geo ? `bₙ = b₁·qⁿ⁻¹ = ${fmt(a1)}·${pn(r)}${sup(n - 1)} = ${fmt(an)}` : `aₙ = a₁ + (n − 1)d = ${fmt(a1)} + ${n - 1}·${pn(r)} = ${fmt(an)}`;
    const head = T(8, 18, formula, 'm11 ex-start h');

    if (tk) {
      let ok;
      let ask;
      let hint;
      let tag;
      if (tk.type === 0) {
        ok = near(v.d, tk.d, 0.01);
        tag = `a₁ = ${fmt(tk.a1)}, a${tk.k} = ${fmt(tk.ak)}`;
        ask = L(`a₁ = ${fmt(tk.a1)}, a${tk.k} = ${fmt(tk.ak)}. Find the difference d.`, `a₁ = ${fmt(tk.a1)}, a${tk.k} = ${fmt(tk.ak)}. Найди разность d.`, `a₁ = ${fmt(tk.a1)}, a${tk.k} = ${fmt(tk.ak)}. d айырмасын тап.`);
        hint = L(`Now a${tk.k} = ${fmt(an)}. Hint: d = (a${tk.k} − a₁)/(${tk.k} − 1).`, `Сейчас a${tk.k} = ${fmt(an)}. Подсказка: d = (a${tk.k} − a₁)/(${tk.k} − 1).`, `Қазір a${tk.k} = ${fmt(an)}. Кеңес: d = (a${tk.k} − a₁)/(${tk.k} − 1).`);
      } else if (tk.type === 1) {
        ok = near(v.q, tk.q, 0.01);
        tag = `b₁ = ${fmt(tk.a1)}, b${tk.k} = ${fmt(tk.bk)}`;
        ask = L(`b₁ = ${fmt(tk.a1)}, b${tk.k} = ${fmt(tk.bk)}. Find the ratio q.`, `b₁ = ${fmt(tk.a1)}, b${tk.k} = ${fmt(tk.bk)}. Найди знаменатель q.`, `b₁ = ${fmt(tk.a1)}, b${tk.k} = ${fmt(tk.bk)}. q еселігін тап.`);
        hint = L(`Now b${tk.k} = ${fmt(an)}. Hint: q${sup(tk.k - 1)} = ${fmt(tk.bk)} : ${fmt(tk.a1)} = ${fmt(tk.bk / tk.a1)}.`, `Сейчас b${tk.k} = ${fmt(an)}. Подсказка: q${sup(tk.k - 1)} = ${fmt(tk.bk)} : ${fmt(tk.a1)} = ${fmt(tk.bk / tk.a1)}.`, `Қазір b${tk.k} = ${fmt(an)}. Кеңес: q${sup(tk.k - 1)} = ${fmt(tk.bk)} : ${fmt(tk.a1)} = ${fmt(tk.bk / tk.a1)}.`);
      } else if (tk.type === 2) {
        ok = n === tk.k;
        tag = `aₙ = ${fmt(tk.ak)}`;
        ask = L(`a₁ = ${fmt(tk.a1)}, d = ${fmt(tk.d)}. Which term equals ${fmt(tk.ak)}? Set n.`, `a₁ = ${fmt(tk.a1)}, d = ${fmt(tk.d)}. Какой по номеру член равен ${fmt(tk.ak)}? Установи n.`, `a₁ = ${fmt(tk.a1)}, d = ${fmt(tk.d)}. Нешінші мүше ${fmt(tk.ak)}-ге тең? n-ді орнат.`);
        hint = L(`Now a${n} = ${fmt(an)}. Hint: n = (aₙ − a₁)/d + 1.`, `Сейчас a${n} = ${fmt(an)}. Подсказка: n = (aₙ − a₁)/d + 1.`, `Қазір a${n} = ${fmt(an)}. Кеңес: n = (aₙ − a₁)/d + 1.`);
      } else {
        ok = n === tk.k;
        tag = `Sₙ = ${fmt(tk.S)}`;
        ask = L(`a₁ = ${fmt(tk.a1)}, d = ${fmt(tk.d)}. How many first terms add up to ${fmt(tk.S)}? Set n.`, `a₁ = ${fmt(tk.a1)}, d = ${fmt(tk.d)}. Сколько первых членов дают в сумме ${fmt(tk.S)}? Установи n.`, `a₁ = ${fmt(tk.a1)}, d = ${fmt(tk.d)}. Алғашқы неше мүшенің қосындысы ${fmt(tk.S)}? n-ді орнат.`);
        hint = L(`Now S${n} = ${fmt(sumN)}.`, `Сейчас S${n} = ${fmt(sumN)}.`, `Қазір S${n} = ${fmt(sumN)}.`);
      }
      ok = check(st, ok);
      return { svg: `${g}${head}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }

    if (geo) {
      const q = r;
      const Sg = Math.abs(q - 1) < 1e-9 ? a1 * n : (a1 * (q ** n - 1)) / (q - 1);
      return {
        svg: `${g}${head}`,
        caption:
          q === 0
            ? L('q = 0 is not allowed: after the first term everything turns into 0, so a geometric progression needs q ≠ 0.', 'q = 0 нельзя: после первого члена всё превращается в 0, поэтому у геометрической прогрессии q ≠ 0.', 'q = 0 болмайды: бірінші мүшеден кейін бәрі 0-ге айналады, сондықтан геометриялық прогрессияда q ≠ 0.')
            : L(
                `Each term is the previous one ×${fmt(q)}: b${n} = ${fmt(a1)}·${pn(q)}${sup(n - 1)} = ${fmt(an)}. Sum of ${n} terms: S = b₁(qⁿ − 1)/(q − 1) = ${fmt(Sg)}.${q < 0 ? ' q < 0: the signs alternate.' : Math.abs(q) < 1 ? ' |q| < 1: the terms shrink towards 0.' : q === 1 ? ' q = 1: all terms are equal.' : ' q > 1: the terms grow faster and faster.'}`,
                `Каждый член - предыдущий ×${fmt(q)}: b${n} = ${fmt(a1)}·${pn(q)}${sup(n - 1)} = ${fmt(an)}. Сумма ${n} членов: S = b₁(qⁿ − 1)/(q − 1) = ${fmt(Sg)}.${q < 0 ? ' q < 0: знаки чередуются.' : Math.abs(q) < 1 ? ' |q| < 1: члены уменьшаются к 0.' : q === 1 ? ' q = 1: все члены равны.' : ' q > 1: члены растут всё быстрее.'}`,
                `Әр мүше - алдыңғысы ×${fmt(q)}: b${n} = ${fmt(a1)}·${pn(q)}${sup(n - 1)} = ${fmt(an)}. ${n} мүшенің қосындысы: S = b₁(qⁿ − 1)/(q − 1) = ${fmt(Sg)}.${q < 0 ? ' q < 0: таңбалар кезектеседі.' : Math.abs(q) < 1 ? ' |q| < 1: мүшелер 0-ге қарай кемиді.' : q === 1 ? ' q = 1: барлық мүшелер тең.' : ' q > 1: мүшелер барған сайын жылдам өседі.'}`,
              ),
      };
    }
    return {
      svg: `${g}${head}`,
      caption: L(
        `Each term is the previous one ${r >= 0 ? '+' : '−'} ${fmt(Math.abs(r))}: a${n} = a₁ + (n − 1)d = ${fmt(a1)} + ${n - 1}·${pn(r)} = ${fmt(an)} (orange). The tops lie on a straight line. Sum of ${n} terms: ${fmt(sumN)}.${r === 0 ? ' d = 0: all terms are equal.' : ''}`,
        `Каждый член - предыдущий ${r >= 0 ? '+' : '−'} ${fmt(Math.abs(r))}: a${n} = a₁ + (n − 1)d = ${fmt(a1)} + ${n - 1}·${pn(r)} = ${fmt(an)} (оранжевый). Вершины столбиков лежат на прямой. Сумма ${n} членов: ${fmt(sumN)}.${r === 0 ? ' d = 0: все члены равны.' : ''}`,
        `Әр мүше - алдыңғысы ${r >= 0 ? '+' : '−'} ${fmt(Math.abs(r))}: a${n} = a₁ + (n − 1)d = ${fmt(a1)} + ${n - 1}·${pn(r)} = ${fmt(an)} (қызғылт сары). Бағандардың ұштары түзу бойында жатыр. ${n} мүшенің қосындысы: ${fmt(sumN)}.${r === 0 ? ' d = 0: барлық мүшелер тең.' : ''}`,
      ),
    };
  },
});

// ---------- Производная ----------

const FUNS = [
  { f: (x) => x * x, df: (x) => 2 * x, s: 'x²', ds: '2x', y0: -1.5, y1: 9.5, x0: -3.2, x1: 3.2 },
  { f: (x) => (x * x * x) / 3 - x, df: (x) => x * x - 1, s: 'x³/3 − x', ds: 'x² − 1', y0: -3, y1: 3, x0: -3.2, x1: 3.2 },
  { f: Math.sin, df: Math.cos, s: 'sin x', ds: 'cos x', y0: -1.6, y1: 1.6, x0: -3.3, x1: 3.3 },
  { f: Math.exp, df: Math.exp, s: 'eˣ', ds: 'eˣ', y0: -1, y1: 8, x0: -3.2, x1: 2.2 },
];

function derTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const [fi, xs] = pick([[0, [0]], [1, [-1, 1]], [2, [-Math.PI / 2, Math.PI / 2]]]);
    t = { fi, xs };
  } else if (type === 1) {
    const [fi, K, xs] = pick([[0, 3, [1.5]], [0, -2, [-1]], [1, 3, [-2, 2]], [1, 0, [-1, 1]], [3, 1, [0]], [2, 1, [0]], [0, 4, [2]]]);
    t = { fi, K, xs };
  } else t = { fi: pick([1, 2]) };
  st.task = { type, done: false, ...t };
  st.fi = t.fi;
  return { x0: -2.5, h: 0 };
}

const derivative = modes({
  title: L('The derivative is the slope of the tangent', 'Производная - наклон касательной', 'Туынды - жанаманың көлбеулігі'),
  intro: L('Bring two points of the graph together: the secant turns into the tangent, and its slope is the derivative f′(x₀).', 'Сближаем две точки графика: секущая превращается в касательную, а её наклон - это производная f′(x₀).', 'График екі нүктесін жақындатамыз: қиюшы жанамаға айналады, оның көлбеулігі - f′(x₀) туындысы.'),
  sliders: [
    { id: 'x0', label: 'x₀', min: -3, max: 3, step: 0.01, value: 0.5 },
    { id: 'h', label: 'h = Δx', min: 0, max: 2, step: 0.01, value: 1.5, hidden: only(0) },
  ],
  tabs: [L('Secant → tangent', 'Секущая → касательная', 'Қиюшы → жанама'), L('f and f′', 'f и f′', 'f және f′'), TASK],
  acts: [{ label: PLAY, only: [0, 1] }, { label: L('Function ↻', 'Функция ↻', 'Функция ↻'), only: [0, 1] }, { label: MORE, only: [2] }],
  state: () => ({ fi: 1 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return derTask(st);
    return null;
  },
  onAct(j, st, v, api) {
    if (j === 0) {
      if (st.m === 0) api.play('h', { reverse: true, dur: 2500 });
      else api.play('x0', { dur: 5000, linear: true });
      return null;
    }
    if (j === 1) {
      st.fi = (st.fi + 1) % FUNS.length;
      return null;
    }
    return derTask(st);
  },
  draw(v, step, st) {
    const F = FUNS[st.fi];
    const x0 = clamp(v.x0, F.x0 + 0.1, F.x1 - 0.1);
    const { f, df } = F;
    const y0 = f(x0);
    const k = df(x0);
    const kz = Math.abs(k) < 0.005 ? 0 : k;
    const two = st.m === 1;
    const box2 = two ? { Y0: 4, Y1: 120 } : { Y0: 0, Y1: H };
    const G = grid({ x0: F.x0, x1: F.x1, y0: F.y0, y1: F.y1, ...box2, X0: 0, X1: W, lab: 1, ylab: F.y1 > 5 ? 2 : 1, ystep: F.y1 > 5 ? 1 : 0.5 });
    const { sx, sy } = G;
    const tanL = (m, cls, w = 2.5) => pth(`M${n1(sx(F.x0))} ${n1(clamp(sy(y0 + m * (F.x0 - x0)), -200, 400))} L${n1(sx(F.x1))} ${n1(clamp(sy(y0 + m * (F.x1 - x0)), -200, 400))}`, cls, w);
    const curve = pth(plotClip(f, F.x0, F.x1, sx, sy, box2.Y0, box2.Y1), 'exc-p', 3);
    const head = T(8, two ? 18 : 18, `f(x) = ${F.s}`, 'm12 ex-start h');
    const P = dot(sx(x0), sy(y0), 6, 'exc-p');

    if (st.m === 1) {
      const Gd = grid({ x0: F.x0, x1: F.x1, y0: Math.min(-1.5, ...[F.x0, F.x1, 0].map(df)) - 0.3, y1: Math.max(1.5, ...[F.x0, F.x1, 0].map(df)) + 0.3, X0: 0, X1: W, Y0: 126, Y1: 216, lab: 1, ylab: 2, ystep: 1, labels: false });
      // интервалы монотонности на оси f′
      let bands = '';
      const N = 120;
      for (let i = 0; i < N; i++) {
        const xa = F.x0 + ((F.x1 - F.x0) * i) / N;
        const xb = F.x0 + ((F.x1 - F.x0) * (i + 1)) / N;
        bands += ln(sx(xa), Gd.sy(0), sx(xb), Gd.sy(0), df((xa + xb) / 2) > 0 ? 'exc-g' : 'exc-r', 4);
      }
      // экстремумы
      const ext = [];
      for (let i = 0; i < 400; i++) {
        const xa = F.x0 + ((F.x1 - F.x0) * i) / 400;
        const xb = xa + (F.x1 - F.x0) / 400;
        if (df(xa) * df(xb) < 0 || (Math.abs(df(xa)) < 1e-12 && i)) ext.push((xa + xb) / 2);
      }
      const extDots = ext.map((x) => `${dot(sx(x), sy(f(x)), 5, df(x - 0.01) > 0 ? 'exc-r' : 'exc-g')}${T(sx(x), sy(f(x)) + (df(x - 0.01) > 0 ? -8 : 16), df(x - 0.01) > 0 ? 'max' : 'min', `m9 h tc ${df(x - 0.01) > 0 ? 'exc-r' : 'exc-g'}`)}`).join('');
      return {
        svg: `${G.svg}${curve}${tanL(k, 'exc-g')}${extDots}${P}${Gd.svg}${bands}${pth(plotClip(df, F.x0, F.x1, sx, Gd.sy, 126, 216), 'exc-o', 2.5)}${ln(sx(x0), sy(y0), sx(x0), Gd.sy(k), 'exc-m ex-dash', 1)}${dot(sx(x0), clamp(Gd.sy(k), 126, 216), 5, 'exc-o')}
          ${head}${T(8, 140, `f′(x) = ${F.ds}`, 'm11 tc exc-o ex-start h')}${T(312, 18, `f′(${fmt(x0)}) = ${fmt(kz)}`, 'm11 tc exc-g ex-end h')}`,
        caption: J(
          L(
            `The slope of the tangent at x₀ = ${fmt(x0)} is f′(x₀) = ${fmt(kz)} (orange graph below). ${kz > 0 ? 'f′ > 0 - the function increases here.' : kz < 0 ? 'f′ < 0 - the function decreases here.' : 'f′ = 0 - a horizontal tangent: a possible maximum or minimum.'}`,
            `Наклон касательной в x₀ = ${fmt(x0)} равен f′(x₀) = ${fmt(kz)} (оранжевый график внизу). ${kz > 0 ? 'f′ > 0 - здесь функция возрастает.' : kz < 0 ? 'f′ < 0 - здесь функция убывает.' : 'f′ = 0 - касательная горизонтальна: возможен максимум или минимум.'}`,
            `x₀ = ${fmt(x0)} нүктесіндегі жанаманың көлбеулігі f′(x₀) = ${fmt(kz)} (төмендегі қызғылт сары график). ${kz > 0 ? 'f′ > 0 - мұнда функция өседі.' : kz < 0 ? 'f′ < 0 - мұнда функция кемиді.' : 'f′ = 0 - жанама көлденең: максимум не минимум болуы мүмкін.'}`,
          ),
          L('Green on the axis - f increases, red - it decreases.', 'Зелёное на оси - f возрастает, красное - убывает.', 'Осьтегі жасыл - f өседі, қызыл - кемиді.'),
        ),
      };
    }

    if (st.m === 2) {
      const tk = st.task ?? (derTask(st), st.task);
      let ok;
      let ask;
      let hint;
      let tag;
      if (tk.type === 0) {
        ok = tk.xs.some((x) => Math.abs(x - x0) < 0.03);
        tag = "f′(x₀) = 0";
        ask = L(`f(x) = ${F.s}. Find a point where the tangent is horizontal.`, `f(x) = ${F.s}. Найди точку, где касательная горизонтальна.`, `f(x) = ${F.s}. Жанама көлденең болатын нүктені тап.`);
        hint = L(`Now the slope is ${fmt(kz)}. Hint: solve f′(x) = ${F.ds} = 0.`, `Сейчас наклон ${fmt(kz)}. Подсказка: реши f′(x) = ${F.ds} = 0.`, `Қазір көлбеулік ${fmt(kz)}. Кеңес: f′(x) = ${F.ds} = 0 теңдеуін шеш.`);
      } else if (tk.type === 1) {
        ok = tk.xs.some((x) => Math.abs(x - x0) < 0.03);
        tag = `f′(x₀) = ${fmt(tk.K)}`;
        ask = L(`f(x) = ${F.s}. Find x₀ where the slope of the tangent is ${fmt(tk.K)}.`, `f(x) = ${F.s}. Найди x₀, где наклон касательной равен ${fmt(tk.K)}.`, `f(x) = ${F.s}. Жанаманың көлбеулігі ${fmt(tk.K)} болатын x₀ тап.`);
        hint = L(`Now f′(${fmt(x0)}) = ${fmt(kz)}. Hint: solve ${F.ds} = ${fmt(tk.K)}.`, `Сейчас f′(${fmt(x0)}) = ${fmt(kz)}. Подсказка: реши ${F.ds} = ${fmt(tk.K)}.`, `Қазір f′(${fmt(x0)}) = ${fmt(kz)}. Кеңес: ${F.ds} = ${fmt(tk.K)} теңдеуін шеш.`);
      } else {
        ok = k < -0.02;
        tag = "f′(x₀) < 0";
        ask = L(`f(x) = ${F.s}. Put x₀ where the function decreases.`, `f(x) = ${F.s}. Поставь x₀ туда, где функция убывает.`, `f(x) = ${F.s}. x₀-ді функция кемитін жерге қой.`);
        hint = L(`Now f′(${fmt(x0)}) = ${fmt(kz)}. Decreasing means f′ < 0: the tangent goes down.`, `Сейчас f′(${fmt(x0)}) = ${fmt(kz)}. Убывает - значит f′ < 0: касательная идёт вниз.`, `Қазір f′(${fmt(x0)}) = ${fmt(kz)}. Кемиді - f′ < 0: жанама төмен қарайды.`);
      }
      ok = check(st, ok);
      return { svg: `${G.svg}${curve}${tanL(k, ok ? 'exc-g' : 'exc-o')}${P}${head}${T(8, 36, `f′(${fmt(x0)}) = ${fmt(kz)}`, 'm11 ex-start h')}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }

    const h = v.h;
    const x1 = x0 + h;
    const y1 = f(x1);
    const ks = h > 0.001 ? (y1 - y0) / h : k;
    const tri = h > 0.05 ? `${pth(`M${n1(sx(x0))} ${n1(sy(y0))} H${n1(sx(x1))} V${n1(clamp(sy(y1), -10, 230))}`, 'exc-o ex-dash', 1.5)}${T((sx(x0) + sx(x1)) / 2, sy(y0) + (y1 >= y0 ? 13 : -5), `Δx = ${fmt(h)}`, 'm9 tc exc-o h')}${T(sx(x1) + 4, (sy(y0) + sy(y1)) / 2 + 3, `Δy = ${fmt(y1 - y0)}`, 'm9 tc exc-o ex-start h')}` : '';
    return {
      svg: `${G.svg}${curve}${tanL(k, 'exc-g', 2)}${h > 0.001 ? tanL(ks, 'exc-o ex-dash', 2.2) : ''}${tri}${h > 0.001 ? dot(sx(x1), clamp(sy(y1), -10, 230), 5, 'exc-o') : ''}${P}
        ${head}${T(312, 18, `${ui.slope()} Δy/Δx = ${fmt(ks)}`, 'm11 tc exc-o ex-end h')}${T(312, 34, `f′(${fmt(x0)}) = ${fmt(kz)}`, 'm11 tc exc-g ex-end h')}`,
      caption: h <= 0.001 ? L(`h = 0: the two points merged, the secant became the tangent with slope f′(${fmt(x0)}) = ${F.ds} = ${fmt(kz)}.`, `h = 0: точки слились, секущая стала касательной с наклоном f′(${fmt(x0)}) = ${F.ds} = ${fmt(kz)}.`, `h = 0: нүктелер қосылды, қиюшы көлбеулігі f′(${fmt(x0)}) = ${F.ds} = ${fmt(kz)} жанамаға айналды.`) : L(
        `Secant slope Δy/Δx = (f(x₀ + h) − f(x₀))/h = ${fmt(y1 - y0)}/${fmt(h)} = ${fmt(ks)}. As h → 0 it tends to f′(x₀) = ${F.ds} = ${fmt(kz)} - the slope of the green tangent. Press ▶.`,
        `Наклон секущей Δy/Δx = (f(x₀ + h) − f(x₀))/h = ${fmt(y1 - y0)}/${fmt(h)} = ${fmt(ks)}. При h → 0 он стремится к f′(x₀) = ${F.ds} = ${fmt(kz)} - наклону зелёной касательной. Нажми ▶.`,
        `Қиюшы көлбеулігі Δy/Δx = (f(x₀ + h) − f(x₀))/h = ${fmt(y1 - y0)}/${fmt(h)} = ${fmt(ks)}. h → 0 болғанда ол f′(x₀) = ${F.ds} = ${fmt(kz)} мәніне - жасыл жанаманың көлбеулігіне ұмтылады. ▶ бас.`,
      ),
    };
  },
});

// ---------- Уравнение - весы ----------

/** Раскладка коробок на чаши для шага s. Возвращает Map id → [x, y]. */
function balStage(L1, R1) {
  const pos = new Map();
  const put = (ids, cx) => {
    const per = 7;
    const cnt = Math.min(per, Math.max(1, ids.length));
    ids.forEach((id, i) => pos.set(id, [cx - (cnt * 16) / 2 + (i % per) * 16, 150 - 17 - Math.floor(i / per) * 16]));
  };
  put(L1, 85);
  put(R1, 235);
  return pos;
}
const seq = (p, n, from = 0) => Array.from({ length: Math.max(0, n) }, (_, i) => `${p}${i + from}`);

function balTask(st) {
  const two = Math.random() < 0.4;
  const a = rnd(2, 5);
  const X = rnd(1, 6);
  const b = rnd(0, 8);
  const r = two ? (a - 1) * X + b : a * X + b;
  st.task = { two, a, X, b, r, done: false };
  return { x: 1, $dur: 300 };
}

const balance = modes({
  title: L('Equations as a balance', 'Уравнение - это весы', 'Теңдеу - таразы'),
  intro: L('An equation is a balance: do the same to both pans and it stays level.', 'Уравнение - это весы в равновесии: делай одно и то же с обеими чашами, и равновесие сохранится.', 'Теңдеу - тепе-теңдіктегі таразы: екі табаққа да бірдей әрекет жасасаң, тепе-теңдік сақталады.'),
  sliders: [
    { id: 'a', label: L('a - boxes x', 'a - коробок x', 'a - x қорапшасы'), min: 1, max: 5, value: 3, hidden: only(0, 1) },
    { id: 'x', label: L('x - weight of a box', 'x - вес коробки', 'x - қорапша салмағы'), min: 1, max: 6, value: 2 },
    { id: 'b', label: L('b - weights', 'b - гирь', 'b - гір'), min: 0, max: 8, value: 4, hidden: only(0, 1) },
  ],
  values: { ph: 0 },
  tabs: ['ax + b = c', 'ax + b = x + d', TASK],
  acts: [{ label: STEP, only: [0, 1] }, { label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return balTask(st);
    return { ph: 0, $dur: 1 };
  },
  onSlide(k, v) {
    v.ph = 0;
  },
  onAct(j, st, v) {
    if (j === 0) {
      const last = st.m === 1 ? 3 : 2;
      const nx = Math.round(v.ph) + 1;
      return nx > last ? { ph: 0, $dur: 1 } : { ph: nx, $dur: 900 };
    }
    if (st.m === 2) return balTask(st);
    st.pre = (st.pre + 1) % 4;
    return { ...[{ a: 2, x: 5, b: 3 }, { a: 4, x: 1, b: 6 }, { a: 5, x: 3, b: 0 }, { a: 3, x: 2, b: 4 }][st.pre], ph: 0, $dur: 1 };
  },
  draw(v, step, st) {
    const m = st.m;
    const tk = m === 2 ? (st.task ?? (balTask(st), st.task)) : null;
    const two = m === 1 || tk?.two;
    const a = tk ? tk.a : two ? Math.max(2, v.a) : v.a;
    const x = tk ? v.x : v.x;
    const b = tk ? tk.b : v.b;
    // правая часть: c = ax + b или x + d
    const d = two ? (tk ? tk.r : (a - 1) * x + b) : 0;
    const c = tk && !two ? tk.r : a * x + b;
    const stages = two
      ? [
          [[...seq('x', a), ...seq('w', b)], ['y0', ...seq('r', d)]],
          [[...seq('x', a - 1), ...seq('w', b)], seq('r', d)],
          [seq('x', a - 1), seq('r', d - b)],
          [['x0'], seq('r', (d - b) / Math.max(1, a - 1))],
        ]
      : [
          [[...seq('x', a), ...seq('w', b)], seq('r', c)],
          [seq('x', a), seq('r', c - b)],
          [['x0'], seq('r', (c - b) / a)],
        ];
    const ph = tk ? 0 : clamp(v.ph, 0, stages.length - 1);
    const s0 = Math.floor(ph);
    const s1 = Math.min(stages.length - 1, s0 + 1);
    const k = ph - s0;
    const A = balStage(...stages[s0]);
    const B = balStage(...stages[s1]);
    const ids = new Set([...A.keys(), ...B.keys()]);
    const lab = (id) => (id[0] === 'x' || id[0] === 'y' ? (tk ? String(x) : 'x') : '1');
    let boxes = '';
    let i = 0;
    for (const id of ids) {
      const p = A.get(id);
      const q = B.get(id);
      let xy;
      let o = 1;
      if (p && q) xy = [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
      else if (p) {
        xy = [p[0], p[1] - 24 * k];
        o = 1 - k;
      } else {
        xy = [q[0], q[1] - 24 * (1 - k)];
        o = k;
      }
      if (o > 0.02) boxes += `<g transform="translate(${n1(xy[0])} ${n1(xy[1])})" opacity="${op(o)}" data-key="${id}"><g class="${id[0] === 'x' || id[0] === 'y' ? 'ex-x' : 'ex-w'}" style="--i:${i++ % 12}"><rect width="15" height="15" rx="4"/><text x="7.5" y="11.5">${lab(id)}</text></g></g>`;
    }
    const left = a * x + b;
    const right = two ? x + d : c;
    const tilt = tk ? clamp((right - left) * 2.5, -11, 11) : 0;
    const scale = `<line class="ex-axis" x1="160" y1="154" x2="160" y2="196"/><path class="ex-base" d="M130 200 L190 200 L160 180 Z"/>
      <g transform="rotate(${n1(tilt)} 160 150)"><g class="ex-beam"><line x1="30" y1="150" x2="290" y2="150"/><path class="ex-pan" d="M25 150 Q85 176 145 150"/><path class="ex-pan" d="M175 150 Q235 176 295 150"/></g>${boxes}</g>`;
    const sN = Math.round(ph);
    const A1 = a === 1 ? '' : a;
    const eqs = two
      ? [`${A1}x + ${b} = x + ${d}`, `${a - 1 === 1 ? '' : a - 1}x + ${b} = ${d}`, `${a - 1 === 1 ? '' : a - 1}x = ${d - b}`, `x = ${x}`]
      : [`${A1}x + ${b} = ${c}`, `${A1}x = ${c - b}`, `x = ${x}`];

    if (tk) {
      const ok = check(st, x === tk.X);
      const eq = tk.two ? `${a}x + ${b} = x + ${tk.r}` : `${a}x + ${b} = ${tk.r}`;
      const side = left > right ? L('the left pan is heavier - try a smaller x', 'перевешивает левая чаша - попробуй x меньше', 'сол табақ ауыр - кішірек x байқап көр') : L('the right pan is heavier - try a bigger x', 'перевешивает правая чаша - попробуй x больше', 'оң табақ ауыр - үлкенірек x байқап көр');
      return {
        svg: `${scale}${T(160, 30, eq, 'm18')}${T(160, 52, `x = ${x}: ${left} ${left === right ? '=' : left > right ? '>' : '<'} ${right}`, `m12 tc ${ok ? 'exc-g' : 'exc-o'}`)}${badge('x = ?', ok)}`,
        caption: taskCap(
          st,
          ok,
          L(`Solve ${eq}: find the weight of a box x so that the scale is level.`, `Реши ${eq}: подбери вес коробки x, чтобы весы уравновесились.`, `${eq} теңдеуін шеш: таразы теңесетіндей x қорапшасының салмағын тап.`),
          J(L(`At x = ${x}: left ${a}·${x} + ${b} = ${left}, right ${right};`, `При x = ${x}: слева ${a}·${x} + ${b} = ${left}, справа ${right};`, `x = ${x} болғанда: солда ${a}·${x} + ${b} = ${left}, оңда ${right};`), side),
        ),
      };
    }

    const capsOne = [
      L(`Left: ${a} boxes x and ${b} weights; right: ${c} weights. Level: ${eqs[0]}.`, `Слева: ${a} ${pl(a, 'коробка', 'коробки', 'коробок')} x и ${b} ${pl(b, 'гиря', 'гири', 'гирь')}; справа: ${c} ${pl(c, 'гиря', 'гири', 'гирь')}. Равновесие: ${eqs[0]}.`, `Солда: ${a} x қорапшасы және ${b} гір; оңда: ${c} гір. Тепе-теңдік: ${eqs[0]}.`),
      L(`Take ${b} weights off both pans - still level: ${eqs[1]}.`, `Убираем по ${b} с обеих чаш - равновесие осталось: ${eqs[1]}.`, `Екі табақтан ${b} гірден аламыз - тепе-теңдік сақталды: ${eqs[1]}.`),
      L(`Divide both pans by ${a}: one box weighs ${x}. Check: ${a}·${x} + ${b} = ${c} ✓`, `Делим обе чаши на ${a}: одна коробка весит ${x}. Проверка: ${a}·${x} + ${b} = ${c} ✓`, `Екі табақты ${a}-ге бөлеміз: бір қорапша ${x} тартады. Тексеру: ${a}·${x} + ${b} = ${c} ✓`),
    ];
    const capsTwo = [
      L(`x is on both pans: ${eqs[0]}. First get rid of x on the right.`, `x есть на обеих чашах: ${eqs[0]}. Сначала уберём x справа.`, `x екі табақта да бар: ${eqs[0]}. Алдымен оң жақтағы x-ті алып тастаймыз.`),
      L(`Remove one box x from both pans: ${eqs[1]}. (This is moving x to the left side with the opposite sign.)`, `Убираем по одной коробке x с обеих чаш: ${eqs[1]}. (Это и есть перенос x влево с противоположным знаком.)`, `Екі табақтан бір x қорапшасын аламыз: ${eqs[1]}. (Бұл x-ті қарама-қарсы таңбамен солға шығару.)`),
      L(`Remove ${b} weights from both pans: ${eqs[2]}.`, `Убираем по ${b} гирь: ${eqs[2]}.`, `${b} гірден аламыз: ${eqs[2]}.`),
      L(`Divide by ${a - 1}: x = ${x}. Check: ${a}·${x} + ${b} = ${x} + ${d} = ${a * x + b} ✓`, `Делим на ${a - 1}: x = ${x}. Проверка: ${a}·${x} + ${b} = ${x} + ${d} = ${a * x + b} ✓`, `${a - 1}-ге бөлеміз: x = ${x}. Тексеру: ${a}·${x} + ${b} = ${x} + ${d} = ${a * x + b} ✓`),
    ];
    return {
      svg: `${scale}${T(160, 30, eqs[sN], 'm18')}${T(160, 50, `${u('step', 'шаг', 'қадам')} ${sN + 1} / ${eqs.length}`, 'm10 exm-mut')}`,
      caption: (two ? capsTwo : capsOne)[sN],
    };
  },
});

// ---------- Задачи на движение ----------

/** Машинка: корпус и колёса, cls - цвет; dir = 1 вправо, −1 влево. */
const car = (x, y, cls, dir = 1) =>
  `<g class="${cls}" transform="translate(${n1(x)} ${n1(y)}) scale(${dir} 1)"><path class="ex-fill" d="M-13 -4 h26 v-6 h-6 l-5 -6 h-9 l-5 6 h-1 Z"/><rect class="ex-fill" x="-14" y="-6" width="28" height="7" rx="2"/></g><circle class="ex-wheel" cx="${n1(x - 7)}" cy="${n1(y + 2)}" r="3"/><circle class="ex-wheel" cx="${n1(x + 7)}" cy="${n1(y + 2)}" r="3"/>`;

function motTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let S;
  let v1;
  let v2;
  let T0;
  do {
    v1 = rnd(4, 20) * 5;
    v2 = rnd(4, 20) * 5;
    T0 = pick([1, 1.5, 2, 2.5, 3, 4, 5]);
    S = type === 1 ? (v1 - v2) * T0 : (v1 + v2) * T0;
  } while (S < 10 || S > 400 || S % 10 || (type === 1 && v1 <= v2));
  st.task = { type, S, v1, v2, T0, done: false };
  st.dir = type === 1 ? 1 : 0;
  return type === 2 ? { S, v1, v2: 60, t: T0 } : { S, v1, v2, t: 0 };
}

const motion = modes({
  title: L('Motion problems', 'Задачи на движение', 'Қозғалыс есептері'),
  intro: L('Towards each other the distance shrinks by v₁ + v₂ every hour; when one catches up - by v₁ − v₂.', 'Навстречу друг другу расстояние каждый час уменьшается на v₁ + v₂, вдогонку - на v₁ − v₂.', 'Қарсы қозғалғанда арақашықтық әр сағат сайын v₁ + v₂-ге, қуып жеткенде v₁ − v₂-ге кемиді.'),
  sliders: [
    { id: 'S', label: L('S, km', 'S, км', 'S, км'), min: 10, max: 400, step: 10, value: 240, hidden: (v, st) => st.m === 2 },
    { id: 'v1', label: L('v₁, km/h', 'v₁, км/ч', 'v₁, км/сағ'), min: 5, max: 120, step: 5, value: 60, hidden: (v, st) => st.m === 2 },
    { id: 'v2', label: L('v₂, km/h', 'v₂, км/ч', 'v₂, км/сағ'), min: 5, max: 120, step: 5, value: 40, hidden: (v, st) => st.m === 2 && st.task?.type !== 2 },
    { id: 't', label: L('time t, h', 'время t, ч', 'уақыт t, сағ'), min: 0, max: 10, step: 0.1, value: 0, hidden: (v, st) => st.m === 2 && st.task?.type === 2 },
  ],
  tabs: [L('Towards', 'Навстречу', 'Қарсы'), L('Catching up', 'Вдогонку', 'Қуып жету'), TASK],
  acts: [{ label: PLAY, only: [0, 1] }, { label: MORE }],
  state: () => ({ pre: 0, dir: 0 }),
  onTab(m, st, v, again) {
    if (m < 2) st.dir = m;
    if (m === 2 && (again || !st.task || st.task.done)) return motTask(st);
    if (m === 2) st.dir = st.task.type === 1 ? 1 : 0;
    return { t: 0, $dur: 1 };
  },
  onAct(j, st, v, api) {
    if (j === 0) {
      api.play('t', { dur: 5000, linear: true });
      return null;
    }
    if (st.m === 2) return motTask(st);
    st.pre = (st.pre + 1) % 4;
    return [{ S: 300, v1: 70, v2: 80, t: 0 }, { S: 120, v1: 90, v2: 60, t: 0 }, { S: 60, v1: 15, v2: 5, t: 0 }, { S: 240, v1: 60, v2: 40, t: 0 }][st.pre];
  },
  draw(v, step, st) {
    const { S, v1, v2, t } = v;
    const catchUp = st.dir === 1;
    const closing = catchUp ? v1 - v2 : v1 + v2;
    const tm = closing > 0 ? S / closing : Infinity;
    const Tv = Math.max(1, Math.ceil(Math.max(t, Number.isFinite(tm) ? tm * 1.4 : 6)));
    // позиции (км от точки старта первой машины)
    const p1 = (tt) => v1 * tt;
    const p2 = (tt) => (catchUp ? S + v2 * tt : S - v2 * tt);
    const Xm = catchUp ? Math.max(S + v2 * Tv, v1 * Tv) : S;
    const rx = (km) => 24 + (clamp(km, 0, Xm) / Xm) * 272;
    const gap = Math.max(0, catchUp ? p2(t) - p1(t) : p2(t) - p1(t));
    const met = t >= tm - 1e-9;
    const km = u('km', 'км', 'км');
    const hU = ui.h();
    // дорога
    let g = `<line class="ex-road" x1="18" y1="52" x2="302" y2="52"/>${ln(24, 40, 24, 64, 'exc-m', 1.5)}${T(24, 76, 'A', 'm10 exm-mut')}`;
    if (!catchUp) g += ln(296, 40, 296, 64, 'exc-m', 1.5) + T(296, 76, 'B', 'm10 exm-mut');
    else g += ln(rx(S), 40, rx(S), 64, 'exc-m ex-dash', 1) + T(rx(S), 76, `S = ${fmt(S)}`, 'm9 exm-mut');
    if (!met && gap > 0) g += `${ln(rx(p1(t)) + 16, 30, rx(p2(t)) - 16 * (catchUp ? 1 : 1), 30, 'exc-o', 1.2)}${T((rx(p1(t)) + rx(p2(t))) / 2, 26, `${ui.gap()}: ${fmt(gap, 1)} ${km}`, 'm10 tc exc-o h')}`;
    g += car(rx(p1(t)), 50, 'exc-p', 1) + car(rx(p2(t)), 50, 'exc-b', catchUp ? 1 : -1);
    // график s(t)
    const gx = (tt) => 40 + (tt / Tv) * 268;
    const gy = (km2) => 205 - (km2 / Xm) * 105;
    let gr = `${ln(40, 205, 312, 205, 'exc-m', 1.2)}${ln(40, 96, 40, 205, 'exc-m', 1.2)}${T(36, 100, `${fmt(Xm, 0)}`, 'm9 exm-mut ex-end')}${T(36, 208, '0', 'm9 exm-mut ex-end')}${T(312, 198, `t, ${hU}`, 'm9 exm-mut ex-end')}`;
    for (let i = 1; i <= Tv; i++) if (Tv <= 12 || i % 2 === 0) gr += ln(gx(i), 203, gx(i), 207, 'exc-m', 1) + T(gx(i), 216, i, 'm9 exm-mut');
    const lineT = (fn, cls) => pth(`M${n1(gx(0))} ${n1(gy(clamp(fn(0), 0, Xm)))} L${n1(gx(Tv))} ${n1(gy(clamp(fn(Tv), 0, Xm)))}`, cls, 2.2);
    gr += lineT(p1, 'exc-p') + lineT(p2, 'exc-b') + ln(gx(t), 96, gx(t), 205, 'exc-o', 1.2) + dot(gx(t), gy(clamp(p1(t), 0, Xm)), 3.5, 'exc-p') + dot(gx(t), gy(clamp(p2(t), 0, Xm)), 3.5, 'exc-b');
    if (Number.isFinite(tm) && tm <= Tv) gr += dot(gx(tm), gy(p1(tm)), 5, 'exc-g') + T(gx(tm) + 6, gy(p1(tm)) - 6, `t = ${fmt(tm)}`, 'm10 tc exc-g ex-start h');
    const head = T(8, 14, `t = ${fmt(t, 1)} ${hU}`, 'm10 ex-start');
    const sv = `${g}${gr}${head}${T(80, 14, `v = ${catchUp ? `${fmt(v1)} − ${fmt(v2)}` : `${fmt(v1)} + ${fmt(v2)}`} = ${fmt(closing)} ${km}/${hU}`, 'm10 ex-start')}`;

    if (st.m === 2) {
      const tk = st.task ?? (motTask(st), st.task);
      const ok = check(st, tk.type === 2 ? v2 === tk.v2 : near(t, tk.T0, 0.051) && S === tk.S && v1 === tk.v1 && v2 === tk.v2);
      const ask = [
        L(`Two cars ${tk.S} km apart drive towards each other at ${tk.v1} and ${tk.v2} km/h. When do they meet? Set t.`, `Две машины на расстоянии ${tk.S} км едут навстречу со скоростями ${tk.v1} и ${tk.v2} км/ч. Через сколько часов встретятся? Установи t.`, `Арақашықтығы ${tk.S} км екі көлік ${tk.v1} және ${tk.v2} км/сағ жылдамдықпен қарсы жүреді. Неше сағаттан кейін кездеседі? t-ны орнат.`),
        L(`A car at ${tk.v1} km/h chases a truck ${tk.S} km ahead going ${tk.v2} km/h. When will it catch up? Set t.`, `Машина ${tk.v1} км/ч догоняет грузовик, который на ${tk.S} км впереди и едет ${tk.v2} км/ч. Через сколько часов догонит? Установи t.`, `${tk.v1} км/сағ көлік ${tk.S} км алда ${tk.v2} км/сағ жылдамдықпен келе жатқан жүк көлігін қуады. Неше сағаттан кейін қуып жетеді? t-ны орнат.`),
        L(`${tk.S} km, v₁ = ${tk.v1} km/h, they met after ${fmt(tk.T0)} h. Find v₂.`, `${tk.S} км, v₁ = ${tk.v1} км/ч, встретились через ${fmt(tk.T0)} ч. Найди v₂.`, `${tk.S} км, v₁ = ${tk.v1} км/сағ, ${fmt(tk.T0)} сағаттан кейін кездесті. v₂-ні тап.`),
      ][tk.type];
      const hint = [
        L(`Hint: t = S : (v₁ + v₂) = ${tk.S} : ${tk.v1 + tk.v2}.`, `Подсказка: t = S : (v₁ + v₂) = ${tk.S} : ${tk.v1 + tk.v2}.`, `Кеңес: t = S : (v₁ + v₂) = ${tk.S} : ${tk.v1 + tk.v2}.`),
        L(`Hint: t = S : (v₁ − v₂) = ${tk.S} : ${tk.v1 - tk.v2}.`, `Подсказка: t = S : (v₁ − v₂) = ${tk.S} : ${tk.v1 - tk.v2}.`, `Кеңес: t = S : (v₁ − v₂) = ${tk.S} : ${tk.v1 - tk.v2}.`),
        L(`Hint: v₁ + v₂ = S : t = ${fmt(tk.S / tk.T0)} km/h.`, `Подсказка: v₁ + v₂ = S : t = ${fmt(tk.S / tk.T0)} км/ч.`, `Кеңес: v₁ + v₂ = S : t = ${fmt(tk.S / tk.T0)} км/сағ.`),
      ][tk.type];
      return { svg: `${sv}${badge(tk.type === 2 ? 'v₂ = ?' : 't = ?', ok)}`, caption: taskCap(st, ok, ask, J(L(`Now: t = ${fmt(t, 1)} h, gap ${fmt(gap, 1)} km.`, `Сейчас: t = ${fmt(t, 1)} ч, между машинами ${fmt(gap, 1)} км.`, `Қазір: t = ${fmt(t, 1)} сағ, арақашықтық ${fmt(gap, 1)} км.`), hint)) };
    }

    if (catchUp && closing <= 0)
      return {
        svg: sv,
        caption: L(`v₁ = ${fmt(v1)} is not faster than v₂ = ${fmt(v2)}: the gap never shrinks, the first car will not catch up.`, `v₁ = ${fmt(v1)} не больше v₂ = ${fmt(v2)}: расстояние не уменьшается, первая машина не догонит.`, `v₁ = ${fmt(v1)} v₂ = ${fmt(v2)}-ден артық емес: арақашықтық кемімейді, бірінші көлік қуып жетпейді.`),
      };
    const now = L(` Now t = ${fmt(t, 1)} h: the gap is ${fmt(S)} − ${fmt(closing)}·${fmt(t, 1)} = ${fmt(gap, 1)} km.`, ` Сейчас t = ${fmt(t, 1)} ч: между ними ${fmt(S)} − ${fmt(closing)}·${fmt(t, 1)} = ${fmt(gap, 1)} км.`, ` Қазір t = ${fmt(t, 1)} сағ: арасы ${fmt(S)} − ${fmt(closing)}·${fmt(t, 1)} = ${fmt(gap, 1)} км.`);
    return {
      svg: sv,
      caption: J(
        catchUp
          ? L(`Catching up speed v₁ − v₂ = ${fmt(v1)} − ${fmt(v2)} = ${fmt(closing)} km/h. Meeting after t = S : (v₁ − v₂) = ${fmt(S)} : ${fmt(closing)} = ${fmt(tm)} h - where the lines cross on the graph.`, `Скорость сближения вдогонку v₁ − v₂ = ${fmt(v1)} − ${fmt(v2)} = ${fmt(closing)} км/ч. Догонит через t = S : (v₁ − v₂) = ${fmt(S)} : ${fmt(closing)} = ${fmt(tm)} ч - там, где пересекаются линии графика.`, `Қуып жету жылдамдығы v₁ − v₂ = ${fmt(v1)} − ${fmt(v2)} = ${fmt(closing)} км/сағ. t = S : (v₁ − v₂) = ${fmt(S)} : ${fmt(closing)} = ${fmt(tm)} сағаттан кейін қуып жетеді - графиктегі сызықтар қиылысатын жерде.`)
          : L(`Closing speed v₁ + v₂ = ${fmt(v1)} + ${fmt(v2)} = ${fmt(closing)} km/h. They meet after t = S : (v₁ + v₂) = ${fmt(S)} : ${fmt(closing)} = ${fmt(tm)} h - where the lines cross on the graph.`, `Скорость сближения v₁ + v₂ = ${fmt(v1)} + ${fmt(v2)} = ${fmt(closing)} км/ч. Встретятся через t = S : (v₁ + v₂) = ${fmt(S)} : ${fmt(closing)} = ${fmt(tm)} ч - там, где пересекаются линии графика.`, `Жақындасу жылдамдығы v₁ + v₂ = ${fmt(v1)} + ${fmt(v2)} = ${fmt(closing)} км/сағ. t = S : (v₁ + v₂) = ${fmt(S)} : ${fmt(closing)} = ${fmt(tm)} сағаттан кейін кездеседі - графиктегі сызықтар қиылысатын жерде.`),
        met ? L(' They have met.', ' Они уже встретились.', ' Олар кездесті.') : now,
      ),
    };
  },
});

// ---------- Неравенства ----------

const SIGNS = ['>', '≥', '<', '≤'];
const FLIP = { '>': '<', '≥': '≤', '<': '>', '≤': '≥' };
const SYS = [['>', '<'], ['≥', '≤'], ['>', '>'], ['≤', '<'], ['<', '>']];
const isx = (x) => (x === -Infinity ? '−∞' : x === Infinity ? '+∞' : fmt(x));
/** Множество как строка: [{lo, hi, lc, rc}] → «(−∞; 2] ∪ (3; +∞)». */
const setStr = (iv) => (iv.length ? iv.map((s) => (s.lo === s.hi ? `{${fmt(s.lo)}}` : `${s.lc ? '[' : '('}${isx(s.lo)}; ${isx(s.hi)}${s.rc ? ']' : ')'}`)).join(' ∪ ') : '∅');
/** Рисует множество на прямой (sx) на высоте y. */
function drawSet(iv, sx, y, cls = 'exc-p', w = 5) {
  let g = '';
  for (const s of iv) {
    const x1 = s.lo === -Infinity ? 8 : sx(s.lo);
    const x2 = s.hi === Infinity ? 312 : sx(s.hi);
    if (s.lo !== s.hi) g += ln(x1, y, x2, y, cls, w);
    if (s.lo !== -Infinity) g += s.lc ? dot(sx(s.lo), y, 5.5, cls) : ring(sx(s.lo), y, 5, cls, 2.5);
    if (s.hi !== Infinity && s.hi !== s.lo) g += s.rc ? dot(sx(s.hi), y, 5.5, cls) : ring(sx(s.hi), y, 5, cls, 2.5);
  }
  return g;
}
/** Решение x S c. */
const ray = (S, c) => (S === '>' || S === '≥' ? [{ lo: c, hi: Infinity, lc: S === '≥', rc: false }] : [{ lo: -Infinity, hi: c, lc: false, rc: S === '≤' }]);
/** Пересечение двух множеств из одного промежутка. */
function cut(A, B) {
  const a = A[0];
  const b = B[0];
  const lo = Math.max(a.lo, b.lo);
  const hi = Math.min(a.hi, b.hi);
  const lc = lo === a.lo && lo === b.lo ? a.lc && b.lc : lo === a.lo ? a.lc : b.lc;
  const rc = hi === a.hi && hi === b.hi ? a.rc && b.rc : hi === a.hi ? a.rc : b.rc;
  if (lo > hi || (lo === hi && !(lc && rc))) return [];
  return [{ lo, hi, lc, rc }];
}
/** Решение (x − p)(x − q) S 0. */
function quadSet(p, q, S) {
  const [r1, r2] = [Math.min(p, q), Math.max(p, q)];
  const cl = S === '≥' || S === '≤';
  const pos = S === '>' || S === '≥';
  if (r1 === r2) {
    if (pos) return cl ? [{ lo: -Infinity, hi: Infinity }] : [{ lo: -Infinity, hi: r1, lc: false, rc: false }, { lo: r1, hi: Infinity, lc: false, rc: false }];
    return cl ? [{ lo: r1, hi: r1, lc: true, rc: true }] : [];
  }
  return pos
    ? [{ lo: -Infinity, hi: r1, lc: false, rc: cl }, { lo: r2, hi: Infinity, lc: cl, rc: false }]
    : [{ lo: r1, hi: r2, lc: cl, rc: cl }];
}
const sameSet = (A, B) => setStr(A) === setStr(B);

function ineqTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const a = pick([-4, -3, -2, -1, 2, 3, 4]);
    const r = rnd(-4, 4);
    const s = rnd(0, 3);
    t = { a, r, s, want: ray(a < 0 ? FLIP[SIGNS[s]] : SIGNS[s], r), p: { a, b: 0 } };
  } else if (type === 1) {
    const p = rnd(-6, 2);
    const q = rnd(p + 1, 7);
    const s = rnd(0, 3);
    t = { s, want: quadSet(p, q, SIGNS[s]), p: { a: 0, b: 0 } };
  } else t = { sys: rnd(0, 1), p: { a: -2, b: 3 } };
  st.task = { type, done: false, ...t };
  st.s = t.s ?? 0;
  return t.p;
}

const inequality = modes({
  title: L('Inequalities', 'Неравенства', 'Теңсіздіктер'),
  intro: L('Solve like an equation, but dividing by a negative number flips the sign. The answer is a set on the number line.', 'Решаем как уравнение, но при делении на отрицательное число знак переворачивается. Ответ - множество на числовой прямой.', 'Теңдеу сияқты шешеміз, бірақ теріс санға бөлгенде таңба аударылады. Жауап - сан түзуіндегі жиын.'),
  sliders: [
    { id: 'a', label: 'a', min: -6, max: 6, step: 0.5, value: -2, hidden: (v, st) => st.m === 3 && st.task?.type === 0 },
    { id: 'b', label: 'b', min: -8, max: 8, step: 0.5, value: 4 },
  ],
  tabs: ['ax ? b', L('System', 'Система', 'Жүйе'), L('Intervals', 'Интервалы', 'Аралықтар'), TASK],
  acts: [{ label: L('Sign ↻', 'Знак ↻', 'Таңба ↻'), only: [0, 1, 2] }, { label: MORE, only: [3] }],
  state: () => ({ s: 0, sy: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return ineqTask(st);
    return null;
  },
  onAct(j, st) {
    if (j === 1) return ineqTask(st);
    if (st.m === 1) st.sy = (st.sy + 1) % SYS.length;
    else st.s = (st.s + 1) % 4;
    return null;
  },
  draw(v, step, st) {
    const { a, b } = v;
    const nl = numLine(-8, 8, 20, 300, 150, 1, 2);
    const sx = nl.sx;
    const tk = st.m === 3 ? (st.task ?? (ineqTask(st), st.task)) : null;
    const mode = tk ? [0, 2, 1][tk.type] : st.m;
    const S = SIGNS[st.s];

    if (mode === 0) {
      const A = tk ? tk.a : a;
      if (A === 0) {
        const ok0 = { '>': 0 > b, '≥': 0 >= b, '<': 0 < b, '≤': 0 <= b }[S];
        return {
          svg: `${nl.svg}${ok0 ? ln(8, 150, 312, 150, 'exc-p', 5) : ''}${T(160, 40, `0 · x ${S} ${fmt(b)}`, 'm18')}${T(160, 66, ok0 ? 'x ∈ (−∞; +∞)' : 'x ∈ ∅', 'm15 tc exc-p')}`,
          caption: ok0 ? L(`a = 0: 0 ${S} ${fmt(b)} is true for every x.`, `a = 0: 0 ${S} ${fmt(b)} верно при любом x.`, `a = 0: 0 ${S} ${fmt(b)} кез келген x үшін дұрыс.`) : L(`a = 0: 0 ${S} ${fmt(b)} is false - no solutions.`, `a = 0: 0 ${S} ${fmt(b)} неверно - решений нет.`, `a = 0: 0 ${S} ${fmt(b)} дұрыс емес - шешім жоқ.`),
        };
      }
      const r = b / A;
      const S2 = A < 0 ? FLIP[S] : S;
      const set = ray(S2, r);
      const svg = `${nl.svg}${drawSet(set, sx, 150)}${T(160, 34, `${fmt(A)}x ${S} ${fmt(b)}`, 'm18')}${T(160, 58, `x ${S2} ${fmt(b)} : ${pn(A)} = ${nice(r)}`, `m12 tc ${A < 0 ? 'exc-r' : 'exc-p'}`)}${T(160, 82, `x ∈ ${setStr(set)}`, 'm15 tc exc-p')}${Math.abs(r) <= 8 ? T(sx(r), 132, nice(r), 'm11 tc exc-p h') : ''}`;
      if (tk) {
        const ok = check(st, sameSet(set, tk.want));
        return {
          svg: `${svg}${badge(`x ∈ ${setStr(tk.want)}`, ok)}`,
          caption: taskCap(st, ok, L(`${fmt(tk.a)}x ${S} b. Choose b so that the answer is x ∈ ${setStr(tk.want)}.`, `${fmt(tk.a)}x ${S} b. Подбери b, чтобы ответ был x ∈ ${setStr(tk.want)}.`, `${fmt(tk.a)}x ${S} b. Жауап x ∈ ${setStr(tk.want)} болатындай b-ны таңда.`), L(`Now x ∈ ${setStr(set)}. Hint: the boundary is b : a, so b = a·${fmt(tk.r)}.`, `Сейчас x ∈ ${setStr(set)}. Подсказка: граница - это b : a, значит b = a·${pn(tk.r)}.`, `Қазір x ∈ ${setStr(set)}. Кеңес: шекара - b : a, демек b = a·${pn(tk.r)}.`)),
        };
      }
      return {
        svg,
        caption: L(
          `Divide both sides by a = ${fmt(A)}: x ${S2} ${nice(r)}.${A < 0 ? ' a < 0, so the sign flipped!' : ''} ${S === '≥' || S === '≤' ? 'A filled dot: the boundary belongs to the answer.' : 'An empty dot: the boundary is not included.'} Answer: x ∈ ${setStr(set)}.`,
          `Делим обе части на a = ${fmt(A)}: x ${S2} ${nice(r)}.${A < 0 ? ' a < 0, поэтому знак перевернулся!' : ''} ${S === '≥' || S === '≤' ? 'Точка закрашена: граница входит в ответ.' : 'Точка пустая: граница не входит.'} Ответ: x ∈ ${setStr(set)}.`,
          `Екі жағын a = ${fmt(A)}-ге бөлеміз: x ${S2} ${nice(r)}.${A < 0 ? ' a < 0, сондықтан таңба аударылды!' : ''} ${S === '≥' || S === '≤' ? 'Нүкте боялған: шекара жауапқа кіреді.' : 'Нүкте бос: шекара кірмейді.'} Жауап: x ∈ ${setStr(set)}.`,
        ),
      };
    }

    if (mode === 1) {
      const [S1, S2] = tk ? SYS[tk.sys] : SYS[st.sy];
      const A1 = ray(S1, a);
      const B1 = ray(S2, b);
      const res = cut(A1, B1);
      const svg = `${nl.svg}${drawSet(A1, sx, 96, 'exc-o', 3)}${drawSet(B1, sx, 116, 'exc-b', 3)}${drawSet(res, sx, 150, 'exc-p', 6)}
        ${T(8, 24, `{ x ${S1} ${fmt(a)}`, 'm15 tc exc-o ex-start')}${T(8, 48, `{ x ${S2} ${fmt(b)}`, 'm15 tc exc-b ex-start')}${T(312, 36, `x ∈ ${setStr(res)}`, 'm15 tc exc-p ex-end')}`;
      if (tk) {
        const ok = check(st, res.length === 0);
        return { svg: `${svg}${badge('∅', ok)}`, caption: taskCap(st, ok, L('Move a and b so that the system has no solutions.', 'Подвинь a и b так, чтобы у системы не было решений.', 'Жүйенің шешімі болмайтындай a мен b-ны жылжыт.'), L(`Now x ∈ ${setStr(res)}. The orange and blue rays must not overlap.`, `Сейчас x ∈ ${setStr(res)}. Оранжевый и синий лучи не должны перекрываться.`, `Қазір x ∈ ${setStr(res)}. Қызғылт сары мен көк сәулелер қабаттаспауы керек.`)) };
      }
      return {
        svg,
        caption: res.length
          ? L(`A system needs both conditions at once: take the overlap of the orange and blue rays: x ∈ ${setStr(res)}.`, `Система - это оба условия сразу: берём общую часть оранжевого и синего лучей: x ∈ ${setStr(res)}.`, `Жүйе - екі шарт бірге: қызғылт сары мен көк сәулелердің ортақ бөлігін аламыз: x ∈ ${setStr(res)}.`)
          : L('The rays do not overlap: the system has no solutions, x ∈ ∅.', 'Лучи не пересекаются: у системы нет решений, x ∈ ∅.', 'Сәулелер қиылыспайды: жүйенің шешімі жоқ, x ∈ ∅.'),
      };
    }

    // метод интервалов
    const p = a;
    const q = b;
    const set = quadSet(p, q, S);
    const [r1, r2] = [Math.min(p, q), Math.max(p, q)];
    let arcs = '';
    const parts = r1 === r2 ? [[-8, r1], [r1, 8]] : [[-8, r1], [r1, r2], [r2, 8]];
    parts.forEach(([lo, hi], i) => {
      const plus = r1 === r2 ? true : i !== 1;
      if (hi - lo < 0.01) return;
      const xa = sx(lo);
      const xb = sx(hi);
      arcs += pth(`M${n1(xa)} 150 Q${n1((xa + xb) / 2)} ${plus ? 112 : 126} ${n1(xb)} 150`, plus ? 'exc-g' : 'exc-r', 1.5) + T((xa + xb) / 2, plus ? 118 : 128, plus ? '+' : '−', `m15 tc ${plus ? 'exc-g' : 'exc-r'}`);
    });
    const svg = `${nl.svg}${arcs}${drawSet(set, sx, 184, 'exc-p', 5)}${[...new Set([r1, r2])].map((r) => (Math.abs(r) <= 8 ? T(sx(r), 204, fmt(r), 'm11 tc exc-p h') : '')).join('')}${T(160, 30, `(x${term(-p)})(x${term(-q)}) ${S} 0`, 'm18')}${T(160, 58, `x ∈ ${setStr(set)}`, 'm15 tc exc-p')}`;
    if (tk) {
      const ok = check(st, sameSet(set, tk.want));
      return {
        svg: `${svg}${badge(`x ∈ ${setStr(tk.want)}`, ok)}`,
        caption: taskCap(st, ok, L(`Choose the roots a and b so that (x − a)(x − b) ${S} 0 has the answer x ∈ ${setStr(tk.want)}.`, `Подбери корни a и b, чтобы у (x − a)(x − b) ${S} 0 ответ был x ∈ ${setStr(tk.want)}.`, `(x − a)(x − b) ${S} 0 жауабы x ∈ ${setStr(tk.want)} болатындай a мен b түбірлерін таңда.`), L(`Now x ∈ ${setStr(set)}. The roots are the ends of the intervals.`, `Сейчас x ∈ ${setStr(set)}. Корни - это концы промежутков.`, `Қазір x ∈ ${setStr(set)}. Түбірлер - аралықтардың шеттері.`)),
      };
    }
    return {
      svg,
      caption: L(
        `Interval method: the roots ${fmt(r1)}${r1 !== r2 ? ` and ${fmt(r2)}` : ''} cut the line. On the right the product is "+", and the sign changes at each simple root. We need "${S} 0": x ∈ ${setStr(set)}.`,
        `Метод интервалов: корни ${fmt(r1)}${r1 !== r2 ? ` и ${fmt(r2)}` : ''} делят прямую на промежутки. Справа произведение «+», при переходе через простой корень знак меняется. Нужно «${S} 0»: x ∈ ${setStr(set)}.`,
        `Аралықтар әдісі: ${fmt(r1)}${r1 !== r2 ? ` және ${fmt(r2)}` : ''} түбірлері түзуді аралықтарға бөледі. Оң жақта көбейтінді «+», жай түбір арқылы өткенде таңба өзгереді. «${S} 0» керек: x ∈ ${setStr(set)}.`,
      ),
    };
  },
});

// ---------- Степени и показательная функция ----------

/** Значение степени красиво: дробь, если знаменатель небольшой. */
const powStr = (x) => (Math.abs(x) > 1e6 ? fmt(x, 0) : nice(x, 100, 3));

function powTask(st) {
  const last = st.task?.type;
  const list = [
    [2, 5],
    [3, 4],
    [2, -3],
    [3, -2],
    [4, 0.5],
    [0.5, -3],
    [10, -2],
    [9, 0.5],
    [5, 0],
    [2, 6],
  ];
  let i;
  do i = rnd(0, list.length - 1);
  while (i === last);
  const [a, n] = list[i];
  st.task = { type: i, a, n, val: a ** n, done: false };
  return { a, n: 1 };
}

const exponential = modes({
  title: L('Powers and the exponential function', 'Степени и показательная функция', 'Дәрежелер және көрсеткіштік функция'),
  intro: L('aⁿ is a multiplied by itself n times. Negative and fractional exponents follow the same pattern: a⁰ = 1, a⁻ⁿ = 1/aⁿ, a^(1/2) = √a.', 'aⁿ - это a, умноженное само на себя n раз. Отрицательные и дробные показатели продолжают ту же закономерность: a⁰ = 1, a⁻ⁿ = 1/aⁿ, a^(1/2) = √a.', 'aⁿ - a-ның өзіне n рет көбейтіндісі. Теріс және бөлшек көрсеткіштер сол заңдылықты жалғастырады: a⁰ = 1, a⁻ⁿ = 1/aⁿ, a^(1/2) = √a.'),
  sliders: [
    { id: 'a', label: L('base a', 'основание a', 'негіз a'), min: 0.1, max: 4, step: 0.1, value: 2, hidden: (v, st) => st.m === 3 },
    { id: 'n', label: L('exponent n', 'показатель n', 'көрсеткіш n'), min: -4, max: 6, step: 0.5, value: 3 },
    { id: 'm', label: L('exponent m', 'показатель m', 'көрсеткіш m'), min: 0, max: 5, value: 2, hidden: only(2) },
  ],
  tabs: [L('Graph aˣ', 'График aˣ', 'aˣ графигі'), L('Ladder', 'Лестница', 'Баспалдақ'), L('Rules', 'Свойства', 'Қасиеттер'), TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return powTask(st);
    if (m === 1 || m === 2) return { n: clamp(Math.round(v.n), m === 2 ? 0 : -4, 6) };
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return powTask(st);
    st.pre = (st.pre + 1) % 5;
    return [{ a: 3, n: 2 }, { a: 0.5, n: 3 }, { a: 4, n: -1 }, { a: 2, n: 0.5 }, { a: 1, n: 4 }][st.pre];
  },
  draw(v, step, st) {
    const tk = st.m === 3 ? (st.task ?? (powTask(st), st.task)) : null;
    const a = tk ? tk.a : Math.round(v.a * 10) / 10;
    const n = v.n;
    const val = a ** n;
    const aS = nice(a, 10);

    if (st.m === 1) {
      const N = Math.round(n);
      const ks = [-3, -2, -1, 0, 1, 2, 3, 4];
      const w = 37;
      let g = '';
      ks.forEach((k, i) => {
        const x = 12 + i * w;
        const on = k === N;
        g += `${box(x, 92, w - 6, 40, on ? 'exc-o' : k < 0 ? 'exc-b' : k === 0 ? 'exc-g' : 'exc-p', 6, on ? 0.95 : 0.25)}${T(x + w / 2 - 3, 108, `${aS}${sup(k)}`, `m10 ${on ? 'exm-on' : ''}`)}${T(x + w / 2 - 3, 125, powStr(a ** k), `m10 ${on ? 'exm-on' : ''}`)}`;
        if (i < ks.length - 1) g += pth(`M${n1(x + w / 2)} 88 Q${n1(x + w)} 70 ${n1(x + w * 1.5 - 6)} 88`, 'exc-g', 1.2) + T(x + w - 3, 74, `×${aS}`, 'm9 tc exc-g');
        if (i > 0) g += pth(`M${n1(x + w / 2 - 6)} 136 Q${n1(x)} 152 ${n1(x - w / 2)} 136`, 'exc-r', 1.2);
      });
      g += T(160, 164, `← : ${aS}`, 'm10 tc exc-r');
      const inv = N < 0 ? `${aS}${sup(N)} = 1/${aS}${sup(-N)} = 1/${powStr(a ** -N)}` : N === 0 ? `${aS}⁰ = 1` : `${aS}${sup(N)} = ${Array.from({ length: Math.min(N, 6) }, () => aS).join('·')} = ${powStr(a ** N)}`;
      return {
        svg: `${g}${T(160, 36, inv, 'm15')}${T(160, 200, a === 0 ? '' : u('each step to the left divides by a', 'каждый шаг влево делит на a', 'солға әр қадам a-ға бөледі'), 'm10 exm-mut')}`,
        caption: L(
          `To the right each step multiplies by ${aS}, to the left it divides by ${aS}. So ${aS}¹ : ${aS} = ${aS}⁰ = 1, and one more step gives ${aS}⁻¹ = 1/${aS}. That is why a⁰ = 1 and a⁻ⁿ = 1/aⁿ (a ≠ 0).`,
          `Вправо каждый шаг умножает на ${aS}, влево - делит на ${aS}. Значит ${aS}¹ : ${aS} = ${aS}⁰ = 1, а ещё шаг даёт ${aS}⁻¹ = 1/${aS}. Поэтому a⁰ = 1 и a⁻ⁿ = 1/aⁿ (a ≠ 0).`,
          `Оңға әр қадам ${aS}-ға көбейтеді, солға - ${aS}-ға бөледі. Демек ${aS}¹ : ${aS} = ${aS}⁰ = 1, тағы бір қадам ${aS}⁻¹ = 1/${aS} береді. Сондықтан a⁰ = 1 және a⁻ⁿ = 1/aⁿ (a ≠ 0).`,
        ),
      };
    }

    if (st.m === 2) {
      const N = Math.max(0, Math.round(n));
      const M = Math.round(v.m);
      const chain = (k, y, cls, x0 = 20) => Array.from({ length: k }, (_, i) => `${box(x0 + i * 26, y, 22, 22, cls, 5, 0.85)}${T(x0 + i * 26 + 11, y + 15, aS, 'm10 exm-on')}`).join('');
      const g = `${T(20, 30, `${aS}${sup(M)} · ${aS}${sup(N)}`, 'm12 ex-start')}${chain(M, 38, 'exc-o')}${chain(N, 38, 'exc-b', 20 + M * 26 + 8)}
        ${T(20, 86, `= ${aS}${sup(M + N)} = ${powStr(a ** (M + N))}`, 'm12 ex-start tc exc-p')}
        ${T(20, 120, `${aS}${sup(M)} : ${aS}${sup(N)} = ${aS}${sup(M - N)} = ${powStr(a ** (M - N))}`, 'm12 ex-start')}
        ${T(20, 148, `(${aS}${sup(M)})${sup(N)} = ${aS}${sup(M * N)} = ${powStr(a ** (M * N))}`, 'm12 ex-start')}
        ${T(20, 176, `(${aS}·b)${sup(N)} = ${aS}${sup(N)}·b${sup(N)}`, 'm11 ex-start exm-mut')}${T(20, 200, `${aS}^(1/2) = √${aS} = ${fmt(Math.sqrt(a))}`, 'm11 ex-start exm-mut')}`;
      return {
        svg: g,
        caption: L(
          `When multiplying, the factors just line up: ${M} + ${N} = ${M + N} copies of ${aS}, so exponents add. Dividing cancels ${Math.min(M, N)} pairs - exponents subtract. A power of a power multiplies the exponents: ${M}·${N} = ${M * N}.`,
          `При умножении множители просто встают в ряд: ${M} + ${N} = ${M + N} копий ${aS}, поэтому показатели складываются. При делении сокращаются ${Math.min(M, N)} пар - показатели вычитаются. Степень в степени - показатели перемножаются: ${M}·${N} = ${M * N}.`,
          `Көбейткенде көбейткіштер қатарға тұрады: ${aS}-ның ${M} + ${N} = ${M + N} көшірмесі, сондықтан көрсеткіштер қосылады. Бөлгенде ${Math.min(M, N)} жұп қысқарады - көрсеткіштер азаяды. Дәреженің дәрежесі - көрсеткіштер көбейтіледі: ${M}·${N} = ${M * N}.`,
        ),
      };
    }

    // график
    const G = grid({ x0: -4.5, x1: 6.5, y0: -1, y1: 9, X0: 0, X1: W, Y0: 0, Y1: H, lab: 1, ylab: 2 });
    const { sx, sy } = G;
    const curve = pth(plotClip((x) => a ** x, -4.5, 6.5, sx, sy, -5, H + 5), 'exc-p', 3);
    const ghost = a !== 1 ? pth(plotClip((x) => (1 / a) ** x, -4.5, 6.5, sx, sy, -5, H + 5), 'exc-m ex-dash', 1.5) : '';
    const P = sy(val) >= 0 ? `${ln(sx(n), sy(0), sx(n), sy(val), 'exc-o ex-dash', 1.2)}${dot(sx(n), sy(val), 6, 'exc-o')}${T(sx(n) + 7, sy(val) - 6, `(${fmt(n)}; ${powStr(val)})`, 'm10 tc exc-o ex-start h')}` : '';
    const head = `${T(8, 18, `y = ${aS}ˣ`, 'm15 ex-start h')}${T(312, tk ? 40 : 18, `${aS}${sup(n)} = ${powStr(val)}`, 'm12 ex-end h')}${dot(sx(0), sy(1), 4.5, 'exc-g')}`;
    const half = Math.abs(n - Math.round(n)) > 0.01;
    if (tk) {
      const ok = check(st, near(n, tk.n, 0.01));
      return {
        svg: `${G.svg}${curve}${P}${head}${badge(`${nice(tk.a)}ⁿ = ${powStr(tk.val)}`, ok)}`,
        caption: taskCap(
          st,
          ok,
          L(`Find n: ${nice(tk.a)}ⁿ = ${powStr(tk.val)}.`, `Найди n: ${nice(tk.a)}ⁿ = ${powStr(tk.val)}.`, `n-ді тап: ${nice(tk.a)}ⁿ = ${powStr(tk.val)}.`),
          L(`Now ${aS}${sup(n)} = ${powStr(val)}. ${tk.val < 1 && tk.a > 1 ? 'A result smaller than 1 needs a negative exponent.' : tk.val === 1 ? 'Which power of any number is 1?' : Math.abs(tk.n % 1) > 0 ? 'Think of roots: a^(1/2) = √a.' : 'Count how many times to multiply.'}`, `Сейчас ${aS}${sup(n)} = ${powStr(val)}. ${tk.val < 1 && tk.a > 1 ? 'Чтобы получить меньше 1, нужен отрицательный показатель.' : tk.val === 1 ? 'В какой степени любое число равно 1?' : Math.abs(tk.n % 1) > 0 ? 'Вспомни корни: a^(1/2) = √a.' : 'Посчитай, сколько раз умножать.'}`, `Қазір ${aS}${sup(n)} = ${powStr(val)}. ${tk.val < 1 && tk.a > 1 ? '1-ден кіші шығу үшін теріс көрсеткіш керек.' : tk.val === 1 ? 'Кез келген сан қай дәрежеде 1-ге тең?' : Math.abs(tk.n % 1) > 0 ? 'Түбірлерді еске ал: a^(1/2) = √a.' : 'Неше рет көбейту керегін сана.'}`),
        ),
      };
    }
    return {
      svg: `${G.svg}${ln(0, sy(0), W, sy(0), 'exc-r ex-dash', 1)}${ghost}${curve}${P}${head}`,
      caption: J(
        a === 1
          ? L('a = 1: 1ˣ = 1 for every x - a straight line, so the base must be a ≠ 1.', 'a = 1: 1ˣ = 1 при любом x - прямая, поэтому основание a ≠ 1.', 'a = 1: кез келген x үшін 1ˣ = 1 - түзу, сондықтан негіз a ≠ 1.')
          : a > 1
            ? L(`a = ${aS} > 1: the function increases, every +1 to x multiplies y by ${aS}.`, `a = ${aS} > 1: функция возрастает, каждый +1 к x умножает y на ${aS}.`, `a = ${aS} > 1: функция өседі, x-ке әр +1 y-ті ${aS}-ға көбейтеді.`)
            : L(`0 < a = ${aS} < 1: the function decreases.`, `0 < a = ${aS} < 1: функция убывает.`, `0 < a = ${aS} < 1: функция кемиді.`),
        L(`Always through (0; 1) and above the x-axis (y > 0). ${aS}${sup(n)} = ${powStr(val)}${half ? ` - a half exponent is a root: ${aS}${sup(n)} = √(${aS}${sup(2 * n)})` : ''}. Dashed: y = (1/a)ˣ, the mirror image.`, `Всегда проходит через (0; 1) и лежит выше оси x (y > 0). ${aS}${sup(n)} = ${powStr(val)}${half ? ` - половинный показатель - это корень: ${aS}${sup(n)} = √(${aS}${sup(2 * n)})` : ''}. Пунктир - y = (1/a)ˣ, зеркальное отражение.`, `Әрқашан (0; 1) арқылы өтеді және x осінен жоғары жатады (y > 0). ${aS}${sup(n)} = ${powStr(val)}${half ? ` - жарты көрсеткіш - түбір: ${aS}${sup(n)} = √(${aS}${sup(2 * n)})` : ''}. Пунктир - y = (1/a)ˣ, айнадағы бейнесі.`),
      ),
    };
  },
});

// ---------- Логарифм ----------

const BASES = [2, 3, 10, 0.5];
const bStr = (b) => (b === 0.5 ? '½' : String(b));
const logb = (b, x) => Math.log(x) / Math.log(b);
const LOG_TASKS = [
  [2, 5, 32],
  [2, 3, 8],
  [3, 2, 9],
  [3, 4, 81],
  [10, 2, 100],
  [2, -1, 0.5],
  [2, -2, 0.25],
  [3, -2, 1 / 9],
  [10, -1, 0.1],
  [0.5, -3, 8],
  [2, 0, 1],
  [3, 0.5, Math.sqrt(3)],
];

function logTask(st) {
  const last = st.task?.i;
  let i;
  do i = rnd(0, LOG_TASKS.length - 1);
  while (i === last);
  const [b, k, x] = LOG_TASKS[i];
  st.task = { i, b, k, x, done: false };
  st.bi = BASES.indexOf(b);
  return { x: 1 };
}

const logarithm = modes({
  title: L('Logarithms', 'Логарифмы', 'Логарифмдер'),
  intro: L('log_b(x) is the power you raise b to in order to get x. It turns multiplication into addition.', 'log_b(x) - это показатель, в который надо возвести b, чтобы получить x. Логарифм превращает умножение в сложение.', 'log_b(x) - x шығу үшін b-ны шығаратын дәреже көрсеткіші. Логарифм көбейтуді қосуға айналдырады.'),
  sliders: [
    { id: 'x', label: 'x', min: 0.01, max: 100, step: 0.01, value: 8 },
    { id: 'y', label: 'y', min: 0.01, max: 100, step: 0.01, value: 4, hidden: only(1) },
  ],
  tabs: [L('Definition', 'Определение', 'Анықтама'), L('Product rule', 'Логарифм произведения', 'Көбейтінді логарифмі'), TASK],
  acts: [{ label: L('Base ↻', 'Основание ↻', 'Негіз ↻'), only: [0, 1] }, { label: MORE, only: [2] }],
  state: () => ({ bi: 0 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return logTask(st);
    return null;
  },
  onAct(j, st) {
    if (j === 1) return logTask(st);
    st.bi = (st.bi + 1) % BASES.length;
    return null;
  },
  draw(v, step, st) {
    const b = BASES[st.bi];
    const bs = bStr(b);
    const { x, y } = v;
    const lx = logb(b, x);
    const ly = logb(b, y);
    const L2 = (z) => (Math.abs(z - Math.round(z)) < 0.005 ? fmt(Math.round(z), 0) : fmt(z));

    if (st.m === 1) {
      const lo = Math.min(0, lx, ly, lx + ly) - 0.5;
      const hi = Math.max(1, lx, lx + ly) + 0.5;
      const sx = (t) => 16 + ((t - lo) / (hi - lo)) * 288;
      let g = `${ln(10, 120, 310, 120, 'exc-m', 1.5)}`;
      for (let k = Math.ceil(lo); k <= Math.floor(hi); k++) {
        g += ln(sx(k), 113, sx(k), 127, 'exc-m', 1.2) + T(sx(k), 140, powStr(b ** k), 'm9 exm-mut') + T(sx(k), 108, k, 'm9 tc exc-p');
        if (b > 1 && b <= 3) for (let mlt = 2; mlt < b; mlt++) g += ln(sx(k + logb(b, mlt)), 116, sx(k + logb(b, mlt)), 124, 'exc-m', 0.6);
      }
      g += `${box(sx(Math.min(0, lx)), 70, Math.abs(sx(lx) - sx(0)), 14, 'exc-o', 3, 0.9)}${box(sx(Math.min(lx, lx + ly)), 86, Math.abs(sx(lx + ly) - sx(lx)), 14, 'exc-b', 3, 0.9)}${ln(sx(lx + ly), 66, sx(lx + ly), 130, 'exc-p', 2)}${dot(sx(lx + ly), 120, 5, 'exc-p')}
        ${T(sx(lx / 2), 64, `log x = ${L2(lx)}`, 'm10 tc exc-o h')}${T(sx(lx + ly / 2), 158, `log y = ${L2(ly)}`, 'm10 tc exc-b h')}`;
      return {
        svg: `${g}${T(160, 26, `log${sub(bs)}(${fmt(x)}·${fmt(y)}) = ${L2(lx)} + ${L2(ly)} = ${L2(lx + ly)}`, 'm12')}${T(160, 46, `${fmt(x)}·${fmt(y)} = ${fmt(x * y)} = ${bs}${sup(Math.round((lx + ly) * 100) / 100)}`, 'm11 exm-mut')}
          ${T(160, 170, `log${sub(bs)}(x/y) = ${L2(lx)} − ${L2(ly)} = ${L2(lx - ly)}`, 'm11')}${T(160, 192, `log${sub(bs)}(x${sup(2)}) = 2·log${sub(bs)} x = ${L2(2 * lx)}`, 'm11 exm-mut')}${T(16, 156, u('top: exponent, bottom: number', 'сверху показатель, снизу число', 'үстінде дәреже, астында сан'), 'm9 exm-mut ex-start')}`,
        caption: L(
          `On a logarithmic ruler the distance from 1 is the log. Put log x (orange) and log y (blue) end to end: you land on x·y = ${fmt(x * y)}. So log(xy) = log x + log y - this is how slide rules multiplied.`,
          `На логарифмической линейке расстояние от 1 - это логарифм. Приставим log x (оранжевый) и log y (синий) друг к другу - попадём в x·y = ${fmt(x * y)}. Значит log(xy) = log x + log y - так умножали на логарифмической линейке.`,
          `Логарифмдік сызғышта 1-ден арақашықтық - логарифм. log x (қызғылт сары) пен log y (көк) кесінділерін жалғасақ, x·y = ${fmt(x * y)} нүктесіне түсеміз. Демек log(xy) = log x + log y - логарифмдік сызғыш осылай көбейтетін.`,
        ),
      };
    }

    const G = grid({ x0: -2, x1: 17, y0: -5, y1: 5.5, X0: 0, X1: W, Y0: 0, Y1: H, lab: 2, ylab: 1 });
    const { sx, sy } = G;
    const lg = pth(plotClip((t) => logb(b, t), 0.01, 17, sx, sy, -10, H + 10, 300), 'exc-p', 3);
    const pw = pth(plotClip((t) => b ** t, -2, 17, sx, sy, -10, H + 10, 200), 'exc-k', 1.6);
    const diag = ln(sx(-2), sy(-2), sx(5.5), sy(5.5), 'exc-m ex-dash', 1);
    const vis = x <= 17 && Math.abs(lx) < 5.5;
    const P = vis ? `${ln(sx(x), sy(0), sx(x), sy(lx), 'exc-o ex-dash', 1.2)}${ln(sx(0), sy(lx), sx(x), sy(lx), 'exc-o ex-dash', 1.2)}${dot(sx(x), sy(lx), 6, 'exc-o')}${Math.abs(lx) <= 5.5 && lx <= 17 ? dot(sx(lx), sy(x), 4, 'exc-k') : ''}` : '';
    const tY = st.m === 2 ? 22 : 0;
    const head = `${T(312, 18 + tY, `log${sub(bs)} ${fmt(x)} = ${L2(lx)}`, 'm12 ex-end h')}${T(312, 36 + tY, `${bs}${sup(Math.round(lx * 100) / 100)} = ${fmt(x)}`, 'm10 exm-mut ex-end h')}${T(42, 18, `y = log${sub(bs)} x`, 'm12 tc exc-p ex-start h')}${st.m === 2 ? '' : T(42, 36, `y = ${bs}ˣ`, 'm10 tc exc-k ex-start h')}`;
    if (st.m === 2) {
      const tk = st.task ?? (logTask(st), st.task);
      const ok = check(st, Math.abs(lx - tk.k) < 0.02);
      return {
        svg: `${G.svg}${diag}${lg}${P}${head}${badge(`log${sub(bStr(tk.b))} x = ${fmt(tk.k)}`, ok)}`,
        caption: taskCap(st, ok, L(`Find x: log${sub(bStr(tk.b))} x = ${fmt(tk.k)}.`, `Найди x: log${sub(bStr(tk.b))} x = ${fmt(tk.k)}.`, `x-ті тап: log${sub(bStr(tk.b))} x = ${fmt(tk.k)}.`), L(`Now log = ${fmt(lx)}. Hint: by definition x = ${bStr(tk.b)}^${fmt(tk.k)}.`, `Сейчас log = ${fmt(lx)}. Подсказка: по определению x = ${bStr(tk.b)}^${fmt(tk.k)}.`, `Қазір log = ${fmt(lx)}. Кеңес: анықтама бойынша x = ${bStr(tk.b)}^${fmt(tk.k)}.`)),
      };
    }
    return {
      svg: `${G.svg}${diag}${pw}${lg}${P}${head}`,
      caption: J(
        L(`log${sub(bs)} ${fmt(x)} = ${fmt(lx)}, because ${bs}^${fmt(lx)} ≈ ${fmt(x)}.`, `log${sub(bs)} ${fmt(x)} = ${fmt(lx)}, потому что ${bs}^${fmt(lx)} ≈ ${fmt(x)}.`, `log${sub(bs)} ${fmt(x)} = ${fmt(lx)}, себебі ${bs}^${fmt(lx)} ≈ ${fmt(x)}.`),
        Math.abs(x - 1) < 0.005 ? L('log of 1 is always 0.', 'Логарифм единицы всегда 0.', 'Бірдің логарифмі әрқашан 0.') : x < 1 === b > 1 ? L('Here the log is negative.', 'Здесь логарифм отрицательный.', 'Мұнда логарифм теріс.') : null,
        L('x must be > 0 - the graph never touches the y-axis. The pink y = bˣ is the mirror image in y = x.', 'x должен быть > 0 - график не касается оси y. Розовая y = bˣ - зеркальное отражение относительно y = x.', 'x > 0 болуы керек - график y осіне тимейді. Қызғылт y = bˣ - y = x түзуіне қатысты айнадағы бейнесі.'),
      ),
    };
  },
});
/** Нижний индекс основания: 2 → ₂, 10 → ₁₀, ½ → ½. */
function sub(s) {
  return String(s).replace(/\d/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[c]);
}

// ---------- Среднее, медиана, мода ----------

const MM_X = (x) => 20 + x * 14;

function mmTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  const n = type === 1 ? pick([4, 6, 8]) : rnd(5, 8);
  const target = type === 0 ? rnd(4, 14) : type === 1 ? rnd(5, 13) + pick([0, 0.5]) : rnd(6, 16);
  st.task = { type, n, target, done: false };
  return { n };
}

const meanMedian = modes({
  title: L('Mean, median, mode', 'Среднее, медиана, мода', 'Орта мән, медиана, мода'),
  intro: L('Drag the dots. The mean is the balance point, the median is the middle value after sorting, the mode is the most frequent value.', 'Перетаскивай точки. Среднее - точка равновесия, медиана - середина упорядоченного ряда, мода - самое частое значение.', 'Нүктелерді сүйре. Орта мән - тепе-теңдік нүктесі, медиана - реттелген қатардың ортасы, мода - ең жиі мән.'),
  values: { p0: 2, p1: 3, p2: 4, p3: 4.5, p4: 6, p5: 7, p6: 8.5, p7: 10, p8: 12 },
  sliders: [{ id: 'n', label: L('number of values', 'сколько значений', 'мәндер саны'), min: 3, max: 9, value: 7 }],
  tabs: [L('Mean & median', 'Среднее и медиана', 'Орта мән және медиана'), L('Mode & range', 'Мода и размах', 'Мода және құлаш'), TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return mmTask(st);
    if (m === 1) {
      const p = {};
      for (let i = 0; i < 9; i++) p[`p${i}`] = Math.round(v[`p${i}`]);
      return p;
    }
    return null;
  },
  onAct(j, st) {
    if (st.m === 2) return mmTask(st);
    st.pre = (st.pre + 1) % 4;
    if (st.pre === 1) return { p0: 3, p1: 4, p2: 4, p3: 5, p4: 5, p5: 5, p6: 19, n: 7 };
    if (st.pre === 2) return { p0: 2, p1: 6, p2: 7, p3: 9, p4: 12, p5: 15, n: 6 };
    if (st.pre === 3) return { p0: 1, p1: 2, p2: 2, p3: 3, p4: 8, p5: 9, p6: 9, p7: 9, p8: 10, n: 9 };
    return { p0: 2, p1: 3, p2: 4, p3: 4.5, p4: 6, p5: 7, p6: 8.5, n: 7 };
  },
  onDrag(key, p, v, st) {
    const raw = clamp((p.x - 20) / 14, 0, 20);
    v[key] = st.m === 1 ? Math.round(raw) : Math.round(raw * 2) / 2;
  },
  draw(v, step, st) {
    const n = Math.round(v.n);
    const ks = Array.from({ length: n }, (_, i) => `p${i}`);
    const xs = ks.map((k) => v[k]);
    const sorted = [...xs].sort((a, b) => a - b);
    const sum = xs.reduce((s, x) => s + x, 0);
    const mean = sum / n;
    const even = n % 2 === 0;
    const med = even ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[(n - 1) / 2];
    const mid = even ? [n / 2 - 1, n / 2] : [(n - 1) / 2];
    const cnt = new Map();
    for (const x of xs) cnt.set(x, (cnt.get(x) ?? 0) + 1);
    const top = Math.max(...cnt.values());
    const modesL = [...cnt.entries()].filter(([, c]) => c === top && top > 1).map(([x]) => x).sort((a, b) => a - b);
    const range = sorted[n - 1] - sorted[0];
    const chips = sorted.map((x, i) => `<rect class="ex-chip${mid.includes(i) ? ' mid' : ''}" x="${n1(160 - (n * 34) / 2 + i * 34)}" y="8" width="31" height="20" rx="6"/>${T(160 - (n * 34) / 2 + i * 34 + 15.5, 22, fmt(x, 1), 'm10')}`).join('');
    const axis = `${ln(14, 170, 306, 170, 'exc-m', 1.5)}${[0, 5, 10, 15, 20].map((x) => `${ln(MM_X(x), 166, MM_X(x), 174, 'exc-m', 1.2)}${T(MM_X(x), 186, x, 'm9 exm-mut')}`).join('')}`;
    const tk = st.m === 2 ? (st.task ?? (mmTask(st), st.task)) : null;

    if (st.m === 1) {
      const stackN = new Map();
      const dots = ks
        .map((k) => {
          const x = v[k];
          const h = stackN.get(x) ?? 0;
          stackN.set(x, h + 1);
          const y = 158 - h * 15;
          const isMode = modesL.includes(x);
          return `${dot(MM_X(x), y, 6.5, isMode ? 'exc-o' : 'exc-p')}${hit(k, MM_X(x), y, 10)}`;
        })
        .join('');
      return {
        svg: `${chips}${axis}${ln(MM_X(sorted[0]), 200, MM_X(sorted[n - 1]), 200, 'exc-b', 2)}${ln(MM_X(sorted[0]), 194, MM_X(sorted[0]), 206, 'exc-b', 2)}${ln(MM_X(sorted[n - 1]), 194, MM_X(sorted[n - 1]), 206, 'exc-b', 2)}${T((MM_X(sorted[0]) + MM_X(sorted[n - 1])) / 2, 214, `R = ${fmt(sorted[n - 1])} − ${fmt(sorted[0])} = ${fmt(range)}`, 'm10 tc exc-b h')}${dots}
          ${T(8, 48, modesL.length ? `${u('mode', 'мода', 'мода')} = ${modesL.map((x) => fmt(x)).join('; ')}` : u('no mode', 'моды нет', 'мода жоқ'), 'm12 tc exc-o ex-start')}`,
        caption: J(
          modesL.length
            ? L(`Mode: ${modesL.map((x) => fmt(x)).join(' and ')} - appears ${top} times, more than any other value (orange).`, `Мода: ${modesL.map((x) => fmt(x)).join(' и ')} - встречается ${top} раза, чаще остальных (оранжевые).`, `Мода: ${modesL.map((x) => fmt(x)).join(' және ')} - ${top} рет кездеседі, басқалардан жиі (қызғылт сары).`)
            : L('All values are different, so there is no mode. Drag dots onto one place.', 'Все значения разные - моды нет. Перетащи точки в одно место.', 'Барлық мәндер әртүрлі - мода жоқ. Нүктелерді бір жерге сүйре.'),
          L(`Range: max − min = ${fmt(sorted[n - 1])} − ${fmt(sorted[0])} = ${fmt(range)} - how spread out the data are.`, `Размах: max − min = ${fmt(sorted[n - 1])} − ${fmt(sorted[0])} = ${fmt(range)} - насколько разбросаны данные.`, `Құлаш: max − min = ${fmt(sorted[n - 1])} − ${fmt(sorted[0])} = ${fmt(range)} - деректердің шашыраңқылығы.`),
        ),
      };
    }

    const dots = ks
      .map((k, i) => {
        const y = 48 + i * 12;
        return `${ln(MM_X(v[k]), y, MM_X(v[k]), 170, 'exc-m', 0.5)}${dot(MM_X(v[k]), y, 6, 'exc-p')}${hit(k, MM_X(v[k]), y, 12)}`;
      })
      .join('');
    const pic = `${chips}${axis}${dots}${area(`M${n1(MM_X(mean))} 172 l-9 15 h18 Z`, 'exc-o', 1)}${T(clamp(MM_X(mean), 30, 290), 206, `x̄ = ${fmt(mean)}`, 'm11 tc exc-o h')}${ln(MM_X(med), 40, MM_X(med), 170, 'exc-g', 2.5)}${T(clamp(MM_X(med) + 5, 0, 260), 40, `Me = ${fmt(med)}`, 'm11 tc exc-g ex-start h')}`;
    if (tk) {
      const ok = check(st, n === tk.n && (tk.type === 0 ? near(mean, tk.target, 0.001) : tk.type === 1 ? near(med, tk.target, 0.001) : near(range, tk.target, 0.001)));
      const what = [L(`the mean = ${fmt(tk.target)}`, `среднее = ${fmt(tk.target)}`, `орта мән = ${fmt(tk.target)}`), L(`the median = ${fmt(tk.target)}`, `медиана = ${fmt(tk.target)}`, `медиана = ${fmt(tk.target)}`), L(`the range = ${fmt(tk.target)}`, `размах = ${fmt(tk.target)}`, `құлаш = ${fmt(tk.target)}`)][tk.type];
      const hint = [
        L(`Now the mean = ${fmt(mean)}. Hint: the sum must be ${fmt(tk.target)}·${n} = ${fmt(tk.target * n)} (now ${fmt(sum)}).`, `Сейчас среднее = ${fmt(mean)}. Подсказка: сумма должна быть ${fmt(tk.target)}·${n} = ${fmt(tk.target * n)} (сейчас ${fmt(sum)}).`, `Қазір орта мән = ${fmt(mean)}. Кеңес: қосынды ${fmt(tk.target)}·${n} = ${fmt(tk.target * n)} болуы керек (қазір ${fmt(sum)}).`),
        L(`Now the median = ${fmt(med)}. ${n} values - even, so the median is the average of the two middle ones.`, `Сейчас медиана = ${fmt(med)}. Значений ${n} - чётное число, поэтому медиана - среднее двух средних.`, `Қазір медиана = ${fmt(med)}. Мәндер саны ${n} - жұп, сондықтан медиана - ортадағы екі мәннің орташасы.`),
        L(`Now the range = ${fmt(range)}: the distance from the smallest to the largest value.`, `Сейчас размах = ${fmt(range)}: расстояние от самого маленького до самого большого.`, `Қазір құлаш = ${fmt(range)}: ең кішіден ең үлкенге дейінгі арақашықтық.`),
      ][tk.type];
      return { svg: `${pic}${badge(tx(what), ok)}`, caption: taskCap(st, ok, J(L(`${tk.n} values. Drag the dots so that`, `${tk.n} значений. Перетащи точки так, чтобы`, `${tk.n} мән. Нүктелерді сүйреп,`), what, L('.', '.', 'болсын.')), hint) };
    }
    return {
      svg: pic,
      caption: J(
        L(`Mean = sum ÷ ${n} = ${fmt(sum)} ÷ ${n} = ${fmt(mean)} (orange balance point).`, `Среднее = сумма ÷ ${n} = ${fmt(sum)} ÷ ${n} = ${fmt(mean)} (оранжевая точка равновесия).`, `Орта мән = қосынды ÷ ${n} = ${fmt(sum)} ÷ ${n} = ${fmt(mean)} (қызғылт сары тепе-теңдік нүктесі).`),
        even
          ? L(`${n} values - even: median = (${fmt(sorted[n / 2 - 1])} + ${fmt(sorted[n / 2])}) / 2 = ${fmt(med)}.`, `${n} значений - чётное число: медиана = (${fmt(sorted[n / 2 - 1])} + ${fmt(sorted[n / 2])}) / 2 = ${fmt(med)}.`, `${n} мән - жұп сан: медиана = (${fmt(sorted[n / 2 - 1])} + ${fmt(sorted[n / 2])}) / 2 = ${fmt(med)}.`)
          : L(`Median = the middle (${(n + 1) / 2}-th) of the sorted values = ${fmt(med)}.`, `Медиана = середина упорядоченного ряда (${(n + 1) / 2}-е значение) = ${fmt(med)}.`, `Медиана = реттелген қатардың ортасы (${(n + 1) / 2}-мән) = ${fmt(med)}.`),
        Math.abs(mean - med) > 1.5 ? L('A far-away value drags the mean but hardly the median.', 'Далёкое значение тянет среднее, а медиану почти нет.', 'Алыс мән орта мәнді тартады, медиананы әрең.') : null,
      ),
    };
  },
});

// ---------- Комбинаторика ----------

const LET = 'ABCDEFGHIJ';
/** Первые lim упорядоченных выборок (order) или сочетаний k из n. */
function listSel(n, k, order, lim = 24) {
  const out = [];
  const rec = (cur, used, start) => {
    if (out.length >= lim) return;
    if (cur.length === k) {
      out.push(cur.join(''));
      return;
    }
    for (let i = order ? 0 : start; i < n; i++) if (!used.has(i)) {
      used.add(i);
      rec([...cur, LET[i]], used, i + 1);
      used.delete(i);
    }
  };
  rec([], new Set(), 0);
  return out;
}
const Acnt = (n, k) => (k > n ? 0 : fact(n) / fact(n - k));
const Ccnt = (n, k) => (k > n ? 0 : Acnt(n, k) / fact(k));

function combTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const n = rnd(4, 9);
    t = { n, k: 2, val: Ccnt(n, 2), need: 'n', p: { n: 3, k: 2 } };
  } else if (type === 1) {
    const n = rnd(5, 8);
    const k = rnd(2, 4);
    t = { n, k, val: Acnt(n, k), need: 'k', p: { n, k: 0 } };
  } else {
    const n = rnd(3, 6);
    t = { n, k: n, val: fact(n), need: 'n', perm: true, p: { n: 1, k: 1 } };
  }
  st.task = { type, done: false, ...t };
  return t.p;
}

const combinatorics = modes({
  title: L('Combinatorics: arrangements and combinations', 'Комбинаторика: размещения и сочетания', 'Комбинаторика: орналастырулар мен терулер'),
  intro: L('Choosing k of n: if order matters - arrangements A = n!/(n−k)!, if not - combinations C = A/k!.', 'Выбираем k из n: если порядок важен - размещения A = n!/(n−k)!, если нет - сочетания C = A/k!.', 'n-нен k таңдаймыз: рет маңызды болса - орналастыру A = n!/(n−k)!, болмаса - теру C = A/k!.'),
  sliders: [
    { id: 'n', label: 'n', min: 1, max: 10, value: 5, hidden: (v, st) => st.m === 3 && st.task?.need !== 'n' },
    { id: 'k', label: 'k', min: 0, max: 10, value: 3, hidden: (v, st) => st.m === 3 && (st.task?.need !== 'k') },
  ],
  tabs: [L('Order matters', 'Порядок важен', 'Рет маңызды'), L('No order', 'Порядок не важен', 'Рет маңызды емес'), L('Pascal', 'Паскаль', 'Паскаль'), TASK],
  acts: [{ label: MORE, only: [3] }],
  clamp(v) {
    v.k = Math.min(v.k, v.n);
  },
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return combTask(st);
    return null;
  },
  onAct(j, st) {
    return combTask(st);
  },
  draw(v, step, st) {
    const tk = st.m === 3 ? (st.task ?? (combTask(st), st.task)) : null;
    const n = Math.round(v.n);
    const k = tk?.perm ? n : Math.min(Math.round(v.k), n);
    const A = Acnt(n, k);
    const Cn = Ccnt(n, k);
    const people = Array.from({ length: n }, (_, i) => `${dot(18 + i * 22, 22, 9.5, i < k ? 'exc-p' : 'exc-m')}${T(18 + i * 22, 26, LET[i], 'm10 exm-on')}`).join('');

    if (st.m === 2) {
      let g = '';
      for (let r = 0; r <= n; r++)
        for (let c = 0; c <= r; c++) {
          const x = 160 + (c - r / 2) * 28;
          const y = 16 + r * 18.5;
          const on = r === n && c === k;
          g += `${on ? box(x - 13, y - 11, 26, 15, 'exc-o', 5) : ''}${T(x, y, Ccnt(r, c), `${Ccnt(r, c) > 99 ? 'm9' : 'm10'} ${on ? 'exm-on' : r === n ? 'tc exc-p' : 'exm-mut'}`)}`;
        }
      return {
        svg: `${g}${T(8, 214, `C(${n}, ${k}) = ${Cn}`, 'm12 tc exc-o ex-start')}${T(312, 214, `Σ = 2${sup(n)} = ${2 ** n}`, 'm11 ex-end')}`,
        caption: L(
          `Pascal's triangle: every number is the sum of the two above it. Row ${n} lists C(${n}, 0) ... C(${n}, ${n}); the orange one is C(${n}, ${k}) = ${Cn}. The row adds up to 2${sup(n)} = ${2 ** n} - all subsets of ${n} things.`,
          `Треугольник Паскаля: каждое число - сумма двух над ним. В строке ${n} стоят C(${n}, 0) ... C(${n}, ${n}); оранжевое - C(${n}, ${k}) = ${Cn}. Сумма строки 2${sup(n)} = ${2 ** n} - все подмножества из ${n} предметов.`,
          `Паскаль үшбұрышы: әр сан үстіндегі екі санның қосындысы. ${n}-жолда C(${n}, 0) ... C(${n}, ${n}) тұр; қызғылт сары - C(${n}, ${k}) = ${Cn}. Жолдың қосындысы 2${sup(n)} = ${2 ** n} - ${n} заттың барлық ішкі жиындары.`,
        ),
      };
    }

    const order = tk ? tk.type !== 0 : st.m === 0;
    const list = listSel(n, k, order, 30);
    const total = order ? A : Cn;
    const slots = order
      ? Array.from({ length: k }, (_, i) => `${box(18 + i * 30, 44, 26, 24, 'exc-y', 5, 0.5)}${T(31 + i * 30, 61, n - i, 'm11')}${i < k - 1 ? T(46 + i * 30, 61, '·', 'm12') : ''}`).join('')
      : '';
    const cols = 6;
    const lst = list
      .slice(0, 24)
      .map((s, i) => T(30 + (i % cols) * 50, 100 + Math.floor(i / cols) * 17, s || '∅', 'm10 tc exc-p'))
      .join('');
    const formula = order ? `A(${n}, ${k}) = ${n}!/${n - k}! = ${A}` : `C(${n}, ${k}) = ${n}!/(${k}!·${n - k}!) = ${Cn}`;
    const svg = `${people}${slots}${lst}${total > 24 ? T(160, 100 + 4 * 17, `… ${u('total', 'всего', 'барлығы')} ${total}`, 'm10 exm-mut') : ''}${T(160, 192, formula, 'm15')}${T(160, 212, order ? `= ${k ? Array.from({ length: k }, (_, i) => n - i).join('·') : '1'}` : `= A : ${k}! = ${A} : ${fact(k)}`, 'm11 exm-mut')}`;
    if (tk) {
      const ok = check(st, n === tk.n && k === tk.k);
      const ask = [
        L(`A class chooses 2 duty students in C(n, 2) = ${tk.val} ways. How many students are there? Set n.`, `Двух дежурных в классе можно выбрать C(n, 2) = ${tk.val} способами. Сколько учеников? Установи n.`, `Сыныптан екі кезекшіні C(n, 2) = ${tk.val} тәсілмен таңдауға болады. Неше оқушы? n-ді орнат.`),
        L(`A(${tk.n}, k) = ${tk.val}: how many places k are handed out among ${tk.n} people?`, `A(${tk.n}, k) = ${tk.val}: сколько мест k разыгрывают среди ${tk.n} человек?`, `A(${tk.n}, k) = ${tk.val}: ${tk.n} адам арасында неше орын (k) ойнатылады?`),
        L(`n people can stand in a row in ${tk.val} ways. Find n (here k = n).`, `n человек можно поставить в ряд ${tk.val} способами. Найди n (здесь k = n).`, `n адамды қатарға ${tk.val} тәсілмен тұрғызуға болады. n-ді тап (мұнда k = n).`),
      ][tk.type];
      return { svg: `${svg}${badge(`= ${tk.val}`, ok)}`, caption: taskCap(st, ok, ask, L(`Now ${formula}.`, `Сейчас ${formula}.`, `Қазір ${formula}.`)) };
    }
    return {
      svg,
      caption: order
        ? L(
            `Places 1, 2, ... for ${k} of ${n}: the 1st place has ${n} candidates, the next one ${n - 1}, ... Multiply: ${A}. ${k === n ? `k = n: these are permutations, n! = ${A}.` : ''} AB and BA are different here.`,
            `Места 1, 2, ... для ${k} из ${n}: на 1-е место ${n} кандидатов, на следующее ${n - 1}, ... Перемножаем: ${A}. ${k === n ? `k = n: это перестановки, n! = ${A}.` : ''} AB и BA здесь разные.`,
            `${n} адамнан ${k} адамға 1, 2, ... орындар: 1-орынға ${n} үміткер, келесіге ${n - 1}, ... Көбейтеміз: ${A}. ${k === n ? `k = n: бұл алмастырулар, n! = ${A}.` : ''} Мұнда AB мен BA әртүрлі.`,
          )
        : L(
            `A team of ${k} from ${n}: AB and BA are the same team. Every team was counted ${k}! = ${fact(k)} times among the arrangements, so C = ${A} : ${fact(k)} = ${Cn}.`,
            `Команда из ${k} среди ${n}: AB и BA - одна и та же команда. Каждую команду среди размещений посчитали ${k}! = ${fact(k)} раз, поэтому C = ${A} : ${fact(k)} = ${Cn}.`,
            `${n} адамнан ${k} адамдық команда: AB мен BA - бір команда. Әр команда орналастырулар ішінде ${k}! = ${fact(k)} рет саналды, сондықтан C = ${A} : ${fact(k)} = ${Cn}.`,
          ),
    };
  },
});

// ---------- Десятки и единицы ----------

/** Палочки-десятки, единицы и сотня-квадрат для числа n с левого верхнего угла (x, y). */
function blocks(n, x, y, hl = 0) {
  let g = '';
  let cx = x;
  const hund = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;
  for (let h = 0; h < hund; h++) {
    g += `${box(cx, y, 100, 100, 'exc-g', 3, 0.8)}`;
    for (let i = 1; i < 10; i++) g += ln(cx + i * 10, y, cx + i * 10, y + 100, 'exc-g', 0.5) + ln(cx, y + i * 10, cx + 100, y + i * 10, 'exc-g', 0.5);
    cx += 108;
  }
  for (let t = 0; t < tens; t++) {
    g += box(cx, y, 10, 100, 'exc-b', 2, 0.9);
    for (let i = 1; i < 10; i++) g += `<line class="ex-cut" style="stroke-width:1" x1="${cx}" y1="${y + i * 10}" x2="${cx + 10}" y2="${y + i * 10}"/>`;
    cx += 13;
  }
  cx += 6;
  for (let o = 0; o < ones; o++) g += box(cx + (o % 3) * 13, y + 100 - 10 - Math.floor(o / 3) * 13, 10, 10, o >= ones - hl ? 'exc-g' : 'exc-o', 2, 0.9);
  return g;
}

function tensTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 3);
  while (type === last);
  let t;
  if (type === 0) {
    const n = rnd(11, 99);
    t = { n, tag: `${Math.floor(n / 10)} ${u('tens', 'дес.', 'онд.')} ${n % 10} ${u('ones', 'ед.', 'бірл.')}` };
  } else if (type === 1) {
    let a;
    let b;
    do {
      a = rnd(12, 89);
      b = rnd(3, 9);
    } while ((a % 10) + b < 10);
    t = { n: a + b, a, b, tag: `${a} + ${b} = ?` };
  } else if (type === 2) {
    const a = rnd(10, 89);
    t = { n: a + 10, a, tag: `${a} + 10 = ?` };
  } else {
    const a = rnd(25, 99);
    const b = rnd(3, 9);
    t = { n: a - b, a, b, tag: `${a} − ${b} = ?` };
  }
  st.task = { type, done: false, ...t };
  return { a: 0 };
}

const tens = modes({
  title: L('Tens and ones', 'Десятки и единицы', 'Ондықтар мен бірліктер'),
  intro: L('A number is made of tens (rods of 10) and ones. When ones reach 10, they make a new ten.', 'Число складывается из десятков (палочек по 10) и единиц. Когда единиц набирается 10, получается новый десяток.', 'Сан ондықтардан (10-дық таяқшалар) және бірліктерден құралады. Бірлік 10-ға жеткенде жаңа ондық шығады.'),
  sliders: [
    { id: 'a', label: L('number', 'число', 'сан'), min: 0, max: 100, value: 47 },
    { id: 'b', label: L('add', 'прибавить', 'қосу'), min: 1, max: 9, value: 8, hidden: only(1) },
  ],
  tabs: [L('Place value', 'Разряды', 'Разрядтар'), L('Through ten', 'Через десяток', 'Ондық арқылы'), TASK],
  acts: [{ label: '+1', only: [0] }, { label: '+10', only: [0] }, { label: MORE, only: [1, 2] }],
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return tensTask(st);
    return null;
  },
  onAct(j, st, v) {
    if (j === 0) return { a: clamp(v.a + 1, 0, 100) };
    if (j === 1) return { a: clamp(v.a + 10, 0, 100) };
    if (st.m === 2) return tensTask(st);
    return { a: rnd(11, 89), b: rnd(3, 9) };
  },
  draw(v, step, st) {
    const a = Math.round(v.a);
    const nl = numLine(0, 100, 20, 300, 200, 10, 10);
    const marker = (n, cls = 'exc-p') => `${dot(nl.sx(n), 200, 5, cls)}`;
    const digits = (n, x, y) => {
      const s = String(n);
      const cls = s.length === 3 ? ['exc-g', 'exc-b', 'exc-o'] : s.length === 2 ? ['exc-b', 'exc-o'] : ['exc-o'];
      return [...s].map((c, i) => T(x - ((s.length - 1) * 13) / 2 + i * 13, y, c, `m18 tc ${cls[i]}`)).join('');
    };
    if (st.m === 1) {
      const b = Math.round(v.b);
      const t = Math.floor(a / 10);
      const o = a % 10;
      const need = (10 - o) % 10;
      const s = a + b;
      const cross = o + b >= 10 && a < 100;
      // десятичная рамка: 2 × 5 клеток
      const frame = (x, y, fill, extra) => {
        let g = '';
        for (let i = 0; i < 10; i++) {
          const cls = i < fill ? 'exc-o' : i < fill + extra ? 'exc-g' : 'exm-off';
          g += box(x + (i % 5) * 15, y + Math.floor(i / 5) * 15, 13, 13, cls, 2);
        }
        return g;
      };
      let g = '';
      for (let i = 0; i < Math.min(t, 9); i++) g += box(14 + i * 12, 40, 9, 75, 'exc-b', 2, 0.9);
      const fx = 14 + Math.min(t, 9) * 12 + 8;
      g += frame(fx, 70, o, cross ? need : b);
      if (cross) g += frame(fx + 84, 70, 0, b - need);
      const expr = cross && need ? `${a} + ${b} = ${a} + ${need} + ${b - need} = ${a + need} + ${b - need} = ${s}` : `${a} + ${b} = ${s}`;
      return {
        svg: `${g}${T(160, 24, expr, 'm12')}${T(fx + 36, 112, `${o} + ${cross ? need : b}`, 'm10 exm-mut')}${cross ? T(fx + 120, 112, `${b - need}`, 'm10 tc exc-g') : ''}${nl.svg}${marker(a, 'exc-o')}${s <= 100 ? `${pth(`M${n1(nl.sx(a))} 192 Q${n1((nl.sx(a) + nl.sx(s)) / 2)} 168 ${n1(nl.sx(s))} 192`, 'exc-g', 2)}${marker(s, 'exc-g')}` : ''}${T(nl.sx(Math.min(s, 100)), 160, s, 'm12 tc exc-g h')}`,
        caption: cross
          ? L(
              `${a} has ${o} ones. To make a full ten we need ${need} more - take them from ${b}: ${a} + ${need} = ${a + need}. ${b - need} are left: ${a + need} + ${b - need} = ${s}.`,
              `В ${a} - ${o} ед. До полного десятка не хватает ${need} - берём их из ${b}: ${a} + ${need} = ${a + need}. Осталось ${b - need}: ${a + need} + ${b - need} = ${s}.`,
              `${a} санында ${o} бірлік. Толық ондыққа ${need} жетпейді - оларды ${b}-ден аламыз: ${a} + ${need} = ${a + need}. ${b - need} қалды: ${a + need} + ${b - need} = ${s}.`,
            )
          : L(`${o} + ${b} = ${o + b} ones - less than 10, no new ten: ${a} + ${b} = ${s}.`, `${o} + ${b} = ${o + b} ед. - меньше 10, нового десятка нет: ${a} + ${b} = ${s}.`, `${o} + ${b} = ${o + b} бірлік - 10-нан аз, жаңа ондық жоқ: ${a} + ${b} = ${s}.`),
      };
    }
    const t = Math.floor((a % 100) / 10);
    const o = a % 10;
    const pic = `${blocks(a, 14, 50)}${digits(a, 262, 76)}${T(262, 100, a === 100 ? `1 ${u('hundred', 'сотня', 'жүздік')}` : `${t} ${u('tens', 'дес.', 'онд.')} ${o} ${u('ones', 'ед.', 'бірл.')}`, 'm11')}${T(262, 120, a === 100 ? '100 = 10 · 10' : `${a} = ${t}·10 + ${o}`, 'm11 exm-mut')}${nl.svg}${marker(a)}`;
    if (st.m === 2) {
      const tk = st.task ?? (tensTask(st), st.task);
      const ok = check(st, a === tk.n);
      const ask = [
        L(`Show the number: ${tk.tag}.`, `Покажи число: ${tk.tag}.`, `Санды көрсет: ${tk.tag}.`),
        L(`How much is ${tk.a} + ${tk.b}? Set the number.`, `Сколько будет ${tk.a} + ${tk.b}? Установи число.`, `${tk.a} + ${tk.b} неше болады? Санды орнат.`),
        L(`Which number is 10 more than ${tk.a}?`, `Какое число на 10 больше, чем ${tk.a}?`, `Қай сан ${tk.a}-ден 10-ға артық?`),
        L(`How much is ${tk.a} − ${tk.b}?`, `Сколько будет ${tk.a} − ${tk.b}?`, `${tk.a} − ${tk.b} неше болады?`),
      ][tk.type];
      const hint = [
        L(`Now ${t} tens and ${o} ones.`, `Сейчас ${t} дес. и ${o} ед.`, `Қазір ${t} ондық және ${o} бірлік.`),
        L(`Hint: first complete the ten: ${tk.a} + ${10 - (tk.a % 10)} = ${tk.a + 10 - (tk.a % 10)}.`, `Подсказка: сначала дополни до десятка: ${tk.a} + ${10 - (tk.a % 10)} = ${tk.a + 10 - (tk.a % 10)}.`, `Кеңес: алдымен ондыққа толықтыр: ${tk.a} + ${10 - (tk.a % 10)} = ${tk.a + 10 - (tk.a % 10)}.`),
        L('Hint: +10 adds one rod, the ones stay the same.', 'Подсказка: +10 - это ещё одна палочка, единицы не меняются.', 'Кеңес: +10 - тағы бір таяқша, бірліктер өзгермейді.'),
        L(`Hint: ${tk.a} − ${tk.a % 10} = ${tk.a - (tk.a % 10)}, then subtract the rest.`, `Подсказка: ${tk.a} − ${tk.a % 10} = ${tk.a - (tk.a % 10)}, потом вычти остальное.`, `Кеңес: ${tk.a} − ${tk.a % 10} = ${tk.a - (tk.a % 10)}, сосын қалғанын азайт.`),
      ][tk.type];
      return { svg: `${pic}${badge(tk.tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }
    return {
      svg: pic,
      caption: a === 100
        ? L('100 is ten tens: the rods join into a square - one hundred.', '100 - это десять десятков: палочки сложились в квадрат - сотню.', '100 - он ондық: таяқшалар шаршыға - жүздікке жиналды.')
        : L(`${a} = ${t} tens (blue rods of 10) and ${o} ones (orange cubes): ${t}·10 + ${o}. The left digit counts tens, the right one counts ones.`, `${a} = ${t} дес. (синие палочки по 10) и ${o} ед. (оранжевые кубики): ${t}·10 + ${o}. Левая цифра считает десятки, правая - единицы.`, `${a} = ${t} ондық (10-дық көк таяқшалар) және ${o} бірлік (қызғылт сары текшелер): ${t}·10 + ${o}. Сол цифр ондықтарды, оң цифр бірліктерді санайды.`),
    };
  },
});

// ---------- Столбиком ----------

function colTask(st) {
  const sub2 = Math.random() < 0.5;
  let a;
  let b;
  let r;
  do {
    a = rnd(120, 899);
    b = rnd(15, 99);
    r = sub2 ? a - b : a + b;
  } while (r > 999 || r < 10);
  st.task = { sub: sub2, a, r, b, done: false };
  st.k = 4;
  return { a, b: 10 };
}

/** Столбик: цифры, переносы/займы и результат, видимые до шага k (k разрядов справа). */
function columnSvg(a, b, sub2, k, task) {
  const big = sub2 && a < b;
  const A = big ? b : a;
  const B = big ? a : b;
  const R = sub2 ? A - B : A + B;
  const da = String(A).padStart(4, ' ');
  const db = String(B).padStart(4, ' ');
  const dr = String(R).padStart(4, ' ');
  const X = (i) => 120 + i * 34;
  const marks = [];
  const notes = [];
  let c = 0;
  const top = [...da].map((ch) => Number(ch) || 0);
  for (let i = 3; i >= 0; i--) {
    const x = Number(da[i]) || 0;
    const y = Number(db[i]) || 0;
    if (!sub2) {
      const s = x + y + c;
      notes[i] = [x, y, c, s];
      c = s >= 10 ? 1 : 0;
      if (c && i > 0) marks.push([i - 1, '1', 'exc-r']);
    } else {
      let xx = top[i] - c;
      const borrow = xx < y;
      notes[i] = [top[i], y, c, borrow ? xx + 10 - y : xx - y, borrow];
      if (borrow) xx += 10;
      c = borrow ? 1 : 0;
      if (borrow && i > 0) marks.push([i - 1, String(top[i - 1] - 1), 'exc-r']);
    }
  }
  const shown = (i) => 3 - i < k;
  const col = k < 4 ? 3 - k : -1;
  let g = `${col >= 0 && da[col].trim() + db[col].trim() !== '' ? soft(X(col) - 16, 30, 32, 146, 'exc-y', 8) : ''}`;
  g += ['т', 'с', 'д', 'е'].map((h, i) => (i ? T(X(i), 22, [u('', '', ''), u('h', 'с', 'жүз'), u('t', 'д', 'он'), u('o', 'е', 'бір')][i], 'm9 exm-mut') : '')).join('');
  for (const [i, s, cls] of marks) if (shown(i + 1)) g += T(X(i) + (sub2 ? 10 : 0), 44, s, `m11 tc ${cls}`);
  g += [...da].map((ch, i) => T(X(i), 76, ch.trim(), `m18${sub2 && marks.some((m) => m[0] === i && shown(i + 1)) ? ' exm-mut' : ''}`)).join('');
  if (sub2) for (const [i] of marks) if (shown(i + 1)) g += ln(X(i) - 7, 70, X(i) + 7, 60, 'exc-r', 1.5);
  g += T(84, 110, sub2 ? '−' : '+', 'm18') + [...db].map((ch, i) => T(X(i), 110, ch.trim(), 'm18')).join('');
  g += ln(96, 124, X(3) + 20, 124, 'exc-m', 2);
  g += [...dr].map((ch, i) => (shown(i) && !task ? T(X(i), 158, ch.trim(), 'm18 tc exc-p') : '')).join('');
  if (big) g += T(84, 158, '−', 'm18 tc exc-p');
  return { svg: g, notes, R: big ? -R : R, big };
}

const column = modes({
  title: L('Column addition and subtraction', 'Сложение и вычитание столбиком', 'Бағанмен қосу және азайту'),
  intro: L('Work digit by digit from the ones. 10 or more - carry 1 to the next place; not enough - borrow 1 ten.', 'Считаем по разрядам, начиная с единиц. Получилось 10 и больше - переносим 1 в следующий разряд; не хватает - занимаем 1 десяток.', 'Бірліктерден бастап разряд бойынша есептейміз. 10 не одан көп шықса - келесі разрядқа 1 ауыстырамыз; жетпесе - 1 ондық аламыз.'),
  sliders: [
    { id: 'a', label: 'a', min: 10, max: 999, value: 358, hidden: (v, st) => st.m === 2 },
    { id: 'b', label: 'b', min: 10, max: 999, value: 276 },
  ],
  tabs: ['a + b', 'a − b', TASK],
  acts: [{ label: STEP, only: [0, 1] }, { label: MORE }],
  state: () => ({ k: 0 }),
  onSlide(key, v, st) {
    if (st.m < 2) st.k = 0;
  },
  onTab(m, st, v, again) {
    st.k = 0;
    if (m === 2 && (again || !st.task || st.task.done)) return colTask(st);
    if (m === 2) st.k = 4;
    return null;
  },
  onAct(j, st) {
    if (j === 0) {
      st.k = st.k >= 4 ? 0 : st.k + 1;
      return null;
    }
    if (st.m === 2) return colTask(st);
    st.k = 0;
    return st.m ? { a: rnd(300, 999), b: rnd(100, 299) } : { a: rnd(100, 899), b: rnd(100, 899) };
  },
  draw(v, step, st) {
    const a = Math.round(v.a);
    const b = Math.round(v.b);
    if (st.m === 2) {
      const tk = st.task ?? (colTask(st), st.task);
      const c = columnSvg(tk.a, b, tk.sub, 4, false);
      const ok = check(st, c.R === tk.r);
      return {
        svg: `${c.svg}${T(262, 158, `${tk.r}?`, `m12 tc ${ok ? 'exc-g' : 'exc-o'}`)}${badge(`${tk.a} ${tk.sub ? '−' : '+'} b = ${tk.r}`, ok)}`,
        caption: taskCap(
          st,
          ok,
          L(`Find b: ${tk.a} ${tk.sub ? '−' : '+'} b = ${tk.r}.`, `Найди b: ${tk.a} ${tk.sub ? '−' : '+'} b = ${tk.r}.`, `b-ны тап: ${tk.a} ${tk.sub ? '−' : '+'} b = ${tk.r}.`),
          L(`Now ${tk.a} ${tk.sub ? '−' : '+'} ${b} = ${c.R}. Hint: b = ${tk.sub ? `${tk.a} − ${tk.r}` : `${tk.r} − ${tk.a}`}.`, `Сейчас ${tk.a} ${tk.sub ? '−' : '+'} ${b} = ${c.R}. Подсказка: b = ${tk.sub ? `${tk.a} − ${tk.r}` : `${tk.r} − ${tk.a}`}.`, `Қазір ${tk.a} ${tk.sub ? '−' : '+'} ${b} = ${c.R}. Кеңес: b = ${tk.sub ? `${tk.a} − ${tk.r}` : `${tk.r} − ${tk.a}`}.`),
        ),
      };
    }
    const sub2 = st.m === 1;
    const c = columnSvg(a, b, sub2, st.k, false);
    const names = [L('Ones', 'Единицы', 'Бірліктер'), L('Tens', 'Десятки', 'Ондықтар'), L('Hundreds', 'Сотни', 'Жүздіктер'), L('Thousands', 'Тысячи', 'Мыңдықтар')];
    let cap;
    if (st.k === 0) cap = L('Press "Step →": we start with the ones column (highlighted).', 'Нажимай «Шаг →»: начинаем со столбика единиц (подсвечен).', '«Қадам →» бас: бірліктер бағанынан бастаймыз (белгіленген).');
    else if (st.k >= 4 || st.k > String(Math.abs(c.R)).length + 1) cap = L(`Done: ${a} ${sub2 ? '−' : '+'} ${b} = ${c.R}.${c.big ? ' a < b, so we subtracted the smaller from the bigger and put a minus.' : ''}`, `Готово: ${a} ${sub2 ? '−' : '+'} ${b} = ${c.R}.${c.big ? ' a < b, поэтому вычли из большего меньшее и поставили минус.' : ''}`, `Дайын: ${a} ${sub2 ? '−' : '+'} ${b} = ${c.R}.${c.big ? ' a < b, сондықтан үлкеннен кішіні азайтып, минус қойдық.' : ''}`);
    else {
      const i = 4 - st.k;
      const [x, y, cin, s, borrow] = c.notes[i];
      const nm = names[st.k - 1];
      const N = (l) => tx(nm, l);
      cap = sub2
        ? L(`${N('en')}: ${x}${cin ? ' − 1 (borrowed)' : ''} − ${y}${borrow ? `: not enough, borrow a ten: ${x - cin + 10} − ${y} = ${s}` : ` = ${s}`}.`, `${N('ru')}: ${x}${cin ? ' − 1 (заняли)' : ''} − ${y}${borrow ? `: не хватает, занимаем десяток: ${x - cin + 10} − ${y} = ${s}` : ` = ${s}`}.`, `${N('kk')}: ${x}${cin ? ' − 1 (алынды)' : ''} − ${y}${borrow ? `: жетпейді, бір ондық аламыз: ${x - cin + 10} − ${y} = ${s}` : ` = ${s}`}.`)
        : L(`${N('en')}: ${x} + ${y}${cin ? ' + 1' : ''} = ${s}${s >= 10 ? ` - write ${s % 10}, carry 1` : ''}.`, `${N('ru')}: ${x} + ${y}${cin ? ' + 1' : ''} = ${s}${s >= 10 ? ` - пишем ${s % 10}, 1 переносим` : ''}.`, `${N('kk')}: ${x} + ${y}${cin ? ' + 1' : ''} = ${s}${s >= 10 ? ` - ${s % 10} жазамыз, 1 ауыстырамыз` : ''}.`);
    }
    return { svg: c.svg, caption: cap };
  },
});

// ---------- Отрицательные числа ----------

function negTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let a;
  let B;
  do {
    a = rnd(-9, 9);
    B = rnd(-9, 9);
  } while (!a || !B || (type === 2 && Math.abs(a * B) > 60));
  const r = type === 0 ? a + B : type === 1 ? a - B : a * B;
  st.task = { type, a, B, r, done: false };
  return { a, b: 0 };
}

const numline = modes({
  title: L('Negative numbers', 'Отрицательные числа', 'Теріс сандар'),
  intro: L('Adding a positive number moves right, a negative one - left. Subtracting a negative is adding a positive.', 'Прибавить положительное - шаг вправо, отрицательное - влево. Вычесть отрицательное - то же, что прибавить положительное.', 'Оң санды қосу - оңға қадам, терісті - солға. Терісті азайту оңды қосумен бірдей.'),
  sliders: [
    { id: 'a', label: 'a', min: -10, max: 10, value: 3, hidden: (v, st) => st.m === 3 },
    { id: 'b', label: 'b', min: -10, max: 10, value: -5 },
  ],
  tabs: ['a + b', 'a − b', 'a · b', TASK],
  acts: [{ label: MORE }],
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return negTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return negTask(st);
    return { a: rnd(-9, 9), b: rnd(-9, 9) };
  },
  draw(v, step, st) {
    const tk = st.m === 3 ? (st.task ?? (negTask(st), st.task)) : null;
    const opM = tk ? tk.type : st.m;
    const a = tk ? tk.a : Math.round(v.a);
    const b = Math.round(v.b);
    const fa = (x) => (x < 0 ? `(${fmt(x)})` : fmt(x));
    if (opM === 2) {
      const r = a * b;
      const R = Math.max(10, Math.abs(r), Math.abs(b));
      const lim = R <= 10 ? 10 : R <= 20 ? 20 : R <= 50 ? 50 : 100;
      const nl = numLine(-lim, lim, 16, 304, 150, lim / 10, lim / 5);
      const dir = a >= 0 ? 1 : -1;
      let jumps = '';
      for (let i = 0; i < Math.abs(a); i++) {
        const x0 = dir * b * i;
        const x1 = dir * b * (i + 1);
        jumps += pth(`M${n1(nl.sx(x0))} 142 Q${n1((nl.sx(x0) + nl.sx(x1)) / 2)} ${n1(142 - 18 - Math.abs(nl.sx(x1) - nl.sx(x0)) * 0.25)} ${n1(nl.sx(x1))} 142`, dir * b >= 0 ? 'exc-g' : 'exc-r', 2);
      }
      const svg = `${nl.svg}${jumps}${dot(nl.sx(0), 150, 4, 'exc-m')}${dot(nl.sx(r), 150, 6, 'exc-p')}${T(160, 36, `${fa(a)} · ${fa(b)} = ${tk ? '?' : fmt(r)}`, 'm18')}${T(160, 60, tk ? '' : `${a < 0 && b < 0 ? '− · − = +' : a * b < 0 ? '+ · − = −' : '+ · + = +'}`, 'm12 exm-mut')}`;
      if (tk) return negTaskOut(st, tk, b, svg);
      return {
        svg,
        caption: L(
          `${fa(a)} · ${fa(b)}: ${Math.abs(a)} jumps of ${fa(b)}${a < 0 ? ', but a < 0 turns them the other way' : ''} - we land on ${fmt(r)}. ${a < 0 && b < 0 ? 'Minus times minus is plus.' : r < 0 ? 'Different signs give a minus.' : ''}`,
          `${fa(a)} · ${fa(b)}: ${Math.abs(a)} прыжков по ${fa(b)}${a < 0 ? ', но a < 0 разворачивает их в обратную сторону' : ''} - попадаем в ${fmt(r)}. ${a < 0 && b < 0 ? 'Минус на минус даёт плюс.' : r < 0 ? 'Разные знаки дают минус.' : ''}`,
          `${fa(a)} · ${fa(b)}: ${fa(b)} бойынша ${Math.abs(a)} секіріс${a < 0 ? ', бірақ a < 0 оларды кері бұрады' : ''} - ${fmt(r)}-ге түсеміз. ${a < 0 && b < 0 ? 'Минус пен минус плюс береді.' : r < 0 ? 'Әртүрлі таңбалар минус береді.' : ''}`,
        ),
      };
    }
    const d = opM ? -b : b;
    const r = a + d;
    const nl = numLine(-20, 20, 16, 304, 150, 1, 5);
    const h = Math.min(70, 16 + Math.abs(d) * 4);
    const svg = `${nl.svg}${ln(nl.sx(0), 140, nl.sx(0), 160, 'exc-m', 2)}${dot(nl.sx(a), 150, 6, 'exc-b')}
      ${d ? `${pth(`M${n1(nl.sx(a))} 142 Q${n1((nl.sx(a) + nl.sx(r)) / 2)} ${n1(142 - h)} ${n1(nl.sx(r))} 142`, d > 0 ? 'exc-g' : 'exc-r', 2.5)}${T((nl.sx(a) + nl.sx(r)) / 2, 142 - h / 2 - 6, `${d > 0 ? '+' : '−'}${Math.abs(d)}`, `m12 tc h ${d > 0 ? 'exc-g' : 'exc-r'}`)}` : ''}${dot(nl.sx(r), 150, 6, 'exc-p')}
      ${T(160, 36, `${fmt(a)} ${opM ? '−' : '+'} ${fa(b)} = ${tk ? '?' : fmt(r)}`, 'm18')}${opM && b < 0 && !tk ? T(160, 58, `= ${fmt(a)} + ${fmt(-b)}`, 'm12 tc exc-g') : ''}`;
    if (tk) return negTaskOut(st, tk, b, svg);
    return {
      svg,
      caption: L(
        `Start at ${fmt(a)} (blue), ${d >= 0 ? `move ${d} right` : `move ${-d} left`} - you land on ${fmt(r)}.${opM && b < 0 ? ' Subtracting a negative number turned into a step to the right!' : opM ? ' Subtracting means moving left.' : b < 0 ? ' Adding a negative means moving left.' : ''}`,
        `Начинаем с ${fmt(a)} (синяя точка), ${d >= 0 ? `идём на ${d} вправо` : `идём на ${-d} влево`} - попадаем в ${fmt(r)}.${opM && b < 0 ? ' Вычитание отрицательного числа превратилось в шаг вправо!' : opM ? ' Вычитать - значит идти влево.' : b < 0 ? ' Прибавить отрицательное - значит идти влево.' : ''}`,
        `${fmt(a)}-ден бастаймыз (көк нүкте), ${d >= 0 ? `оңға ${d} жүреміз` : `солға ${-d} жүреміз`} - ${fmt(r)}-ге түсеміз.${opM && b < 0 ? ' Теріс санды азайту оңға қадамға айналды!' : opM ? ' Азайту - солға жүру.' : b < 0 ? ' Терісті қосу - солға жүру.' : ''}`,
      ),
    };
  },
});
function negTaskOut(st, tk, b, svg) {
  const S = ['+', '−', '·'][tk.type];
  const fa = (x) => (x < 0 ? `(${fmt(x)})` : fmt(x));
  const cur = tk.type === 0 ? tk.a + b : tk.type === 1 ? tk.a - b : tk.a * b;
  const ok = check(st, b === tk.B);
  return {
    svg: `${svg}${badge(`${fa(tk.a)} ${S} b = ${fmt(tk.r)}`, ok)}`,
    caption: taskCap(st, ok, L(`Find b: ${fa(tk.a)} ${S} b = ${fmt(tk.r)}.`, `Найди b: ${fa(tk.a)} ${S} b = ${fmt(tk.r)}.`, `b-ны тап: ${fa(tk.a)} ${S} b = ${fmt(tk.r)}.`), L(`Now ${fa(tk.a)} ${S} ${fa(b)} = ${fmt(cur)}.`, `Сейчас ${fa(tk.a)} ${S} ${fa(b)} = ${fmt(cur)}.`, `Қазір ${fa(tk.a)} ${S} ${fa(b)} = ${fmt(cur)}.`)),
  };
}

// ---------- Умножение как площадь ----------

function mulTask(st) {
  const type = rnd(0, 1);
  const a = rnd(3, 12);
  const b = rnd(2, 12);
  st.task = type ? { type, a: a * b + rnd(0, b - 1), b, q: a, done: false } : { type, a, b, done: false };
  if (type) st.task.r = st.task.a - b * a;
  return type ? { a: st.task.a, b: 1 } : { a, b: 1 };
}

const areamul = modes({
  title: L('Multiplication and division', 'Умножение и деление', 'Көбейту және бөлу'),
  intro: L('a × b is the number of cells in an a by b rectangle. Division asks how many full rows of b fit in a.', 'a × b - число клеток в прямоугольнике a на b. Деление спрашивает, сколько полных рядов по b помещается в a.', 'a × b - a-ға b тіктөртбұрыштағы тор саны. Бөлу a-ға b-дан неше толық қатар сыятынын сұрайды.'),
  sliders: [
    { id: 'a', label: 'a', min: 1, max: 30, value: 14, hidden: (v, st) => st.m === 2 },
    { id: 'b', label: 'b', min: 1, max: 12, value: 6 },
  ],
  tabs: [L('Area', 'Площадь', 'Аудан'), L('Division', 'Деление', 'Бөлу'), TASK],
  acts: [{ label: MORE }],
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return mulTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 2) return mulTask(st);
    return st.m ? { a: rnd(10, 30), b: rnd(2, 9) } : { a: rnd(11, 29), b: rnd(3, 12) };
  },
  draw(v, step, st) {
    const tk = st.m === 2 ? (st.task ?? (mulTask(st), st.task)) : null;
    const a = tk ? tk.a : Math.round(v.a);
    const b = Math.round(v.b);
    if (st.m === 1 || tk?.type === 1) {
      const q = Math.floor(a / b);
      const r = a % b;
      const c = Math.min(26, 270 / b, 160 / Math.ceil(a / b));
      let g = '';
      for (let i = 0; i < a; i++) {
        const row = Math.floor(i / b);
        g += box(20 + (i % b) * c, 44 + row * c, c - 2, c - 2, row < q ? (row % 2 ? 'exc-b' : 'exc-p') : 'exc-o', 3, 0.85);
      }
      for (let row = 0; row < q && c >= 10; row++) g += T(20 + b * c + 6, 44 + row * c + c / 2 + 3, row + 1, 'm9 exm-mut ex-start');
      const txt = `${a} : ${b} = ${q}${r ? ` ${u('rem.', 'ост.', 'қалд.')} ${r}` : ''}`;
      if (tk) {
        const ok = check(st, b === tk.b);
        return {
          svg: `${g}${T(160, 28, `${a} : b = ${tk.q} ${u('rem.', 'ост.', 'қалд.')} ${tk.r}`, 'm15')}${badge(`b = ?`, ok)}`,
          caption: taskCap(st, ok, L(`${a} : b = ${tk.q} remainder ${tk.r}. Find b.`, `${a} : b = ${tk.q} (ост. ${tk.r}). Найди b.`, `${a} : b = ${tk.q} (қалдық ${tk.r}). b-ны тап.`), L(`Now ${txt}. Hint: ${a} − ${tk.r} = ${a - tk.r} = b · ${tk.q}.`, `Сейчас ${txt}. Подсказка: ${a} − ${tk.r} = ${a - tk.r} = b · ${tk.q}.`, `Қазір ${txt}. Кеңес: ${a} − ${tk.r} = ${a - tk.r} = b · ${tk.q}.`)),
        };
      }
      return {
        svg: `${g}${T(160, 28, txt, 'm15')}`,
        caption: L(
          `${a} cells in rows of ${b}: ${q} full ${q === 1 ? 'row' : 'rows'}${r ? ` and ${r} left over (orange)` : ''}. ${a} = ${b} · ${q} + ${r}, and the remainder ${r} is always less than ${b}.`,
          `${a} клеток рядами по ${b}: ${q} ${pl(q, 'полный ряд', 'полных ряда', 'полных рядов')}${r ? ` и ${r} в остатке (оранжевые)` : ''}. ${a} = ${b} · ${q} + ${r}, остаток ${r} всегда меньше ${b}.`,
          `${b}-дан қатарға қойылған ${a} тор: ${q} толық қатар${r ? ` және қалдықта ${r} (қызғылт сары)` : ''}. ${a} = ${b} · ${q} + ${r}, қалдық ${r} әрқашан ${b}-дан кіші.`,
        ),
      };
    }
    const c = Math.min(20, 292 / a, 150 / b);
    const ta = a >= 10 ? Math.floor(a / 10) * 10 : 0;
    const tb = b >= 10 ? 10 : 0;
    let g = '';
    for (let y = 0; y < b; y++)
      for (let x = 0; x < a; x++) {
        const cls = x < ta ? (y < tb ? 'exc-b' : 'exc-p') : y < tb ? 'exc-g' : 'exc-o';
        g += box(14 + x * c, 46 + y * c, c - 1.2, c - 1.2, cls, 1.5, 0.75);
      }
    const parts = [];
    if (ta && tb) parts.push([ta, tb]);
    if (ta) parts.push([ta, b - tb]);
    if (tb && a - ta) parts.push([a - ta, tb]);
    if (a - ta && b - tb) parts.push([a - ta, b - tb]);
    const split = parts.filter(([x, y]) => x && y);
    const sum = split.map(([x, y]) => `${x}·${y}`).join(' + ');
    const sumV = split.map(([x, y]) => x * y).join(' + ');
    const svg = `${g}${T(160, 28, `${a} × ${b} = ${tk ? '?' : a * b}`, 'm15')}${split.length > 1 && !tk ? T(160, 210, `${sum} = ${sumV} = ${a * b}`, 'm11') : ''}`;
    if (tk) {
      const ok = check(st, b === tk.b);
      return { svg: `${g}${T(160, 28, `${a} × b = ${a * tk.b}`, 'm15')}${T(160, 210, `${a} × ${b} = ${a * b}`, `m12 tc ${ok ? 'exc-g' : 'exc-o'}`)}${badge('b = ?', ok)}`, caption: taskCap(st, ok, L(`Find the missing factor: ${a} × b = ${a * tk.b}.`, `Найди пропущенный множитель: ${a} × b = ${a * tk.b}.`, `Жетіспейтін көбейткішті тап: ${a} × b = ${a * tk.b}.`), L(`Now ${a} × ${b} = ${a * b}. Hint: b = ${a * tk.b} : ${a}.`, `Сейчас ${a} × ${b} = ${a * b}. Подсказка: b = ${a * tk.b} : ${a}.`, `Қазір ${a} × ${b} = ${a * b}. Кеңес: b = ${a * tk.b} : ${a}.`)) };
    }
    return {
      svg,
      caption: split.length > 1
        ? L(`Split the rectangle into easy parts: ${sum} = ${sumV} = ${a * b}. This is the distributive law: (x + y)·z = x·z + y·z.`, `Разрежем прямоугольник на удобные части: ${sum} = ${sumV} = ${a * b}. Это распределительный закон: (x + y)·z = x·z + y·z.`, `Тіктөртбұрышты ыңғайлы бөліктерге бөлеміз: ${sum} = ${sumV} = ${a * b}. Бұл үлестірімділік заңы: (x + y)·z = x·z + y·z.`)
        : L(`${a} × ${b} = ${a * b} cells. Swap the factors - the rectangle turns, the area stays.`, `${a} × ${b} = ${a * b} клеток. От перестановки множителей прямоугольник поворачивается, а площадь та же.`, `${a} × ${b} = ${a * b} тор. Көбейткіштердің орнын ауыстырсаң, тіктөртбұрыш бұрылады, аудан сол.`),
    };
  },
});

// ---------- Десятичные дроби ----------

/** Сетка 10×10 для числа k сотых: столбики-десятые синие, остаток оранжевый. */
function hundredths(k, x, y, c, one = 'exc-b', rest = 'exc-o') {
  let g = '';
  const t = Math.floor(k / 10);
  for (let i = 0; i < 100; i++) {
    const col = Math.floor(i / 10);
    const row = i % 10;
    const on = i < k;
    g += box(x + col * c, y + (9 - row) * c, c - 1.2, c - 1.2, on ? (col < t ? one : rest) : 'exm-off', 1.5, on ? 0.9 : 1);
  }
  return g;
}

function decTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 3);
  while (type === last);
  let k;
  let tag;
  if (type === 0) {
    k = rnd(1, 99);
    tag = `${Math.floor(k / 10)}/10 + ${k % 10}/100`;
  } else if (type === 1) {
    const [p, q] = pick([[1, 4], [3, 4], [1, 5], [2, 5], [1, 2], [7, 20], [3, 25], [9, 10]]);
    k = (100 * p) / q;
    tag = `${p}/${q}`;
  } else if (type === 2) {
    k = rnd(1, 99);
    tag = `${k}%`;
  } else {
    const a = rnd(10, 80);
    const d = pick([5, 7, 10, 12, 15]);
    k = a + d;
    tag = `${fmt(a / 100)} + ${fmt(d / 100)}`;
  }
  st.task = { type, k, tag, done: false };
  return { x: 0 };
}

const decimals = modes({
  title: L('Decimals: tenths and hundredths', 'Десятичные дроби: десятые и сотые', 'Ондық бөлшектер: ондықтар мен жүздіктер'),
  intro: L('A square of 100 cells: one cell is 0.01, a column of ten is 0.1. Compare decimals digit by digit from the left.', 'Квадрат из 100 клеток: одна клетка - 0,01, столбик из десяти - 0,1. Десятичные дроби сравнивают по разрядам слева направо.', '100 торлы шаршы: бір тор - 0,01, оннан тұратын баған - 0,1. Ондық бөлшектерді разрядтар бойынша солдан оңға салыстырады.'),
  sliders: [
    { id: 'x', label: 'x', min: 0, max: 1, step: 0.01, value: 0.37 },
    { id: 'y', label: 'y', min: 0, max: 1, step: 0.01, value: 0.5, hidden: only(2) },
  ],
  tabs: [L('Hundredths', 'Сотые', 'Жүздіктер'), L('Zoom', 'Лупа', 'Лупа'), L('Compare', 'Сравнить', 'Салыстыру'), TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return decTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return decTask(st);
    st.pre = (st.pre + 1) % 4;
    return st.m === 2 ? [{ x: 0.5, y: 0.45 }, { x: 0.3, y: 0.29 }, { x: 0.7, y: 0.7 }, { x: 0.08, y: 0.8 }][st.pre] : { x: [0.05, 0.5, 0.75, 0.37][st.pre] };
  },
  draw(v, step, st) {
    const k = Math.round(v.x * 100);
    const t = Math.floor(k / 10);
    const h = k % 10;
    const X = fmt(k / 100);
    if (st.m === 1) {
      const top = numLine(0, 1, 20, 300, 60, 0.1, 0.1, (q) => fmt(q, 1));
      const lo = Math.min(t, 9) / 10;
      const zx0 = top.sx(lo);
      const zx1 = top.sx(lo + 0.1);
      const bot = numLine(lo, lo + 0.1, 20, 300, 150, 0.01, 0.01, (q) => (Math.abs(q * 100 - Math.round(q * 100)) < 1e-6 ? fmt(q) : ''));
      return {
        svg: `${top.svg}${soft(zx0, 52, zx1 - zx0, 16, 'exc-y', 3)}${pth(`M${n1(zx0)} 68 L20 140 M${n1(zx1)} 68 L300 140`, 'exc-m ex-dash', 1)}${bot.svg}${dot(top.sx(k / 100), 60, 5, 'exc-p')}${k / 100 <= lo + 0.1 + 1e-9 ? dot(bot.sx(k / 100), 150, 6, 'exc-p') : ''}${T(160, 24, `x = ${X}`, 'm18')}${T(160, 196, `${X} = ${fmt(t / 10, 1)} + ${fmt(h / 100)}`, 'm12 tc exc-p')}`,
        caption: L(
          `The top line is cut into tenths. Zoom into the piece from ${fmt(lo, 1)} to ${fmt(lo + 0.1, 1)}: it is cut into 10 hundredths. ${X} is ${t} tenths and ${h} hundredths.`,
          `Верхняя прямая разбита на десятые. Увеличим кусок от ${fmt(lo, 1)} до ${fmt(lo + 0.1, 1)}: он делится на 10 сотых. ${X} - это ${t} десятых и ${h} сотых.`,
          `Жоғарғы түзу ондықтарға бөлінген. ${fmt(lo, 1)}-ден ${fmt(lo + 0.1, 1)}-ге дейінгі бөлікті үлкейтейік: ол 10 жүздікке бөлінеді. ${X} - ${t} ондық және ${h} жүздік.`,
        ),
      };
    }
    if (st.m === 2) {
      const ky = Math.round(v.y * 100);
      const s = k === ky ? '=' : k > ky ? '>' : '<';
      const pad = (q) => fmt(q / 100).padEnd(4, '0');
      const firstDiff = Math.floor(k / 10) !== Math.floor(ky / 10) ? 1 : 2;
      return {
        svg: `${hundredths(k, 16, 40, 12)}${hundredths(ky, 192, 40, 12, 'exc-g', 'exc-k')}${T(76, 30, `x = ${pad(k)}`, 'm12')}${T(252, 30, `y = ${pad(ky)}`, 'm12')}${T(160, 100, s, 'm18')}${T(160, 188, `${pad(k)} ${s} ${pad(ky)}`, 'm18')}${T(160, 208, `${k}/100 ${s} ${ky}/100`, 'm11 exm-mut')}`,
        caption:
          s === '='
            ? L(`${pad(k)} = ${pad(ky)}: the same number of cells.`, `${pad(k)} = ${pad(ky)}: одинаковое число клеток.`, `${pad(k)} = ${pad(ky)}: торлар саны бірдей.`)
            : L(
                `Write both with two digits after the comma: ${pad(k)} and ${pad(ky)}. Compare from the left: the first difference is in the ${firstDiff === 1 ? 'tenths' : 'hundredths'}, so x ${s} y. A longer decimal is not always bigger: 0,5 > 0,45!`,
                `Запишем обе дроби с двумя знаками: ${pad(k)} и ${pad(ky)}. Сравниваем слева направо: первое различие в ${firstDiff === 1 ? 'десятых' : 'сотых'}, значит x ${s} y. Длинная запись не значит больше: 0,5 > 0,45!`,
                `Екеуін үтірден кейін екі цифрмен жазамыз: ${pad(k)} және ${pad(ky)}. Солдан оңға салыстырамыз: алғашқы айырмашылық ${firstDiff === 1 ? 'ондықтарда' : 'жүздіктерде'}, демек x ${s} y. Ұзын жазба үлкен деген сөз емес: 0,5 > 0,45!`,
              ),
      };
    }
    const pic = `${hundredths(k, 16, 22, 17)}${T(254, 60, X, 'm18 tc exc-p')}${T(254, 90, `= ${fmt(t / 10, 1)} + ${fmt(h / 100)}`, 'm12')}${T(254, 114, `= ${k}/100`, 'm12')}${frs(k, 100) !== `${k}/100` && k ? T(254, 138, `= ${frs(k, 100)}`, 'm12') : ''}${T(254, 162, `= ${k}%`, 'm12')}`;
    if (st.m === 3) {
      const tk = st.task ?? (decTask(st), st.task);
      const ok = check(st, k === tk.k);
      const ask = [
        L(`Show the number ${tk.tag} as a decimal.`, `Покажи число ${tk.tag} десятичной дробью.`, `${tk.tag} санын ондық бөлшекпен көрсет.`),
        L(`Write the fraction ${tk.tag} as a decimal.`, `Запиши дробь ${tk.tag} десятичной.`, `${tk.tag} бөлшегін ондық түрде жаз.`),
        L(`Show ${tk.tag} as a decimal.`, `Покажи ${tk.tag} десятичной дробью.`, `${tk.tag}-ды ондық бөлшекпен көрсет.`),
        L(`Find ${tk.tag}.`, `Найди ${tk.tag}.`, `${tk.tag} тап.`),
      ][tk.type];
      const hint = [
        L('Columns are tenths, single cells are hundredths.', 'Столбики - десятые, отдельные клетки - сотые.', 'Бағандар - ондықтар, жеке торлар - жүздіктер.'),
        L('Hint: make the denominator 100.', 'Подсказка: сделай знаменатель 100.', 'Кеңес: бөлімді 100 ет.'),
        L('Hint: p% = p/100.', 'Подсказка: p% = p/100.', 'Кеңес: p% = p/100.'),
        L('Hint: add hundredths to hundredths, carry 10 of them into a tenth.', 'Подсказка: складывай сотые с сотыми, 10 сотых - это одна десятая.', 'Кеңес: жүздікті жүздікке қос, 10 жүздік - бір ондық.'),
      ][tk.type];
      return { svg: `${pic}${badge(tk.tag, ok)}`, caption: taskCap(st, ok, ask, J(L(`Now x = ${X}.`, `Сейчас x = ${X}.`, `Қазір x = ${X}.`), hint)) };
    }
    return {
      svg: pic,
      caption: L(`${X} is ${t} tenths (blue columns) and ${h} hundredths (orange cells): ${k} cells of 100, that is ${k}/100 = ${k}%.`, `${X} - это ${t} десятых (синие столбики) и ${h} сотых (оранжевые клетки): ${k} клеток из 100, то есть ${k}/100 = ${k}%.`, `${X} - ${t} ондық (көк бағандар) және ${h} жүздік (қызғылт сары торлар): 100-ден ${k} тор, яғни ${k}/100 = ${k}%.`),
    };
  },
});

// ---------- Отношения и пропорции ----------

function ratioTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    let p;
    let q;
    let T0;
    do {
      p = rnd(1, 5);
      q = rnd(1, 5);
      T0 = (p + q) * rnd(2, 20) * 10;
    } while (p === q || T0 > 1000);
    t = { p, q, T0, w: (T0 / (p + q)) * q };
  } else if (type === 1) {
    let p;
    let q;
    let k;
    do {
      p = rnd(1, 5);
      q = rnd(1, 7);
      k = rnd(2, 12) * 10;
    } while (p === q || (p + q) * k > 1000);
    t = { p, q, k, T0: (p + q) * k, water: q * k };
  } else {
    const p = rnd(1, 4);
    let q;
    do q = rnd(1, 4);
    while (gcd(p, q) !== 1 || p === q);
    const m = Math.max(p, q) <= 3 ? rnd(2, 3) : 2;
    t = { p, q, P: p * m, Q: q * m };
  }
  st.task = { type, done: false, ...t };
  return type === 2 ? { p: t.P, q: t.Q } : { p: t.p, q: t.q, T: 100 };
}

const ratio = modes({
  title: L('Ratio and proportion', 'Отношения и пропорции', 'Қатынас және пропорция'),
  intro: L('A ratio 2 : 3 means 2 parts of one thing for every 3 parts of another. Multiply both parts by the same number - the ratio stays.', 'Отношение 2 : 3 - на каждые 2 части одного приходится 3 части другого. Умножь обе части на одно число - отношение не изменится.', '2 : 3 қатынасы - біреуінің әр 2 бөлігіне екіншісінің 3 бөлігі келеді. Екеуін бір санға көбейтсең - қатынас өзгермейді.'),
  sliders: [
    { id: 'p', label: L('juice parts', 'частей сока', 'шырын бөлігі'), min: 1, max: 9, value: 2 },
    { id: 'q', label: L('water parts', 'частей воды', 'су бөлігі'), min: 1, max: 9, value: 3 },
    { id: 'T', label: L('total, ml', 'всего, мл', 'барлығы, мл'), min: 10, max: 1000, step: 10, value: 500, hidden: (v, st) => st.m === 3 && st.task?.type === 2 },
  ],
  tabs: [L('Divide', 'Разделить', 'Бөлу'), L('Proportion', 'Пропорция', 'Пропорция'), L('Simplify', 'Сократить', 'Қысқарту'), TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return ratioTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return ratioTask(st);
    st.pre = (st.pre + 1) % 4;
    return [{ p: 1, q: 4, T: 250 }, { p: 3, q: 5, T: 400 }, { p: 6, q: 9, T: 600 }, { p: 2, q: 3, T: 500 }][st.pre];
  },
  draw(v, step, st) {
    const tk = st.m === 3 ? (st.task ?? (ratioTask(st), st.task)) : null;
    const p = Math.round(v.p);
    const q = Math.round(v.q);
    const T0 = v.T;
    const ml = u('ml', 'мл', 'мл');
    const g = gcd(p, q);
    if (st.m === 1) {
      const juice = T0;
      const k = juice / p;
      const water = k * q;
      const bw = 26;
      const row1 = Array.from({ length: p + q }, (_, i) => box(20 + i * bw, 40, bw - 3, 24, i < p ? 'exc-o' : 'exc-b', 4, 0.85)).join('');
      const sc = 280 / Math.max(juice + water, 1);
      return {
        svg: `${T(20, 32, `${u('recipe', 'рецепт', 'рецепт')} ${p} : ${q}`, 'm11 ex-start')}${row1}${T(20, 104, `${u('we have', 'есть', 'бар')} ${fmt(juice)} ${ml} ${u('of juice', 'сока', 'шырын')}`, 'm11 ex-start')}${box(20, 112, juice * sc, 24, 'exc-o', 4, 0.85)}${box(20 + juice * sc, 112, water * sc, 24, 'exc-b', 4, 0.5)}${T(20 + juice * sc + (water * sc) / 2, 129, `x = ${fmt(water)}`, 'm11 h')}
          ${T(160, 172, `${p} : ${q} = ${fmt(juice)} : x`, 'm15')}${T(160, 198, `x = ${fmt(juice)} · ${q} : ${p} = ${fmt(water)} ${ml}`, 'm12 tc exc-b')}`,
        caption: L(
          `Proportion ${p} : ${q} = ${fmt(juice)} : x. The juice grew ${fmt(k)} times (${fmt(juice)} : ${p}), so the water grows ${fmt(k)} times too: x = ${q} · ${fmt(k)} = ${fmt(water)} ${ml}. Cross rule: ${p}·x = ${q}·${fmt(juice)}.`,
          `Пропорция ${p} : ${q} = ${fmt(juice)} : x. Сока стало в ${fmt(k)} раз больше (${fmt(juice)} : ${p}), значит и воды в ${fmt(k)} раз больше: x = ${q} · ${fmt(k)} = ${fmt(water)} ${ml}. Крест-накрест: ${p}·x = ${q}·${fmt(juice)}.`,
          `Пропорция ${p} : ${q} = ${fmt(juice)} : x. Шырын ${fmt(k)} есе көбейді (${fmt(juice)} : ${p}), демек су да ${fmt(k)} есе көбейеді: x = ${q} · ${fmt(k)} = ${fmt(water)} ${ml}. Айқастыра: ${p}·x = ${q}·${fmt(juice)}.`,
        ),
      };
    }
    if (st.m === 2 || tk?.type === 2) {
      const bw = Math.min(30, 280 / (p + q));
      const row = (P, Q, y) => Array.from({ length: P + Q }, (_, i) => box(20 + i * bw, y, bw - 3, 26, i < P ? 'exc-o' : 'exc-b', 4, 0.85)).join('');
      let groups = '';
      if (g > 1) for (let i = 0; i < g; i++) groups += `<rect class="ex-stroke exc-g ex-dash" style="fill:none;stroke-width:1.5" x="${n1(18 + (i * (p / g)) * bw)}" y="36" width="${n1((p / g) * bw - 1)}" height="30" rx="5"/><rect class="ex-stroke exc-g ex-dash" style="fill:none;stroke-width:1.5" x="${n1(18 + (p + (i * q) / g) * bw)}" y="36" width="${n1((q / g) * bw - 1)}" height="30" rx="5"/>`;
      const svg = `${row(p, q, 38)}${groups}${row(p / g, q / g, 110)}${T(20, 30, `${p} : ${q}`, 'm12 ex-start')}${T(20, 102, `= ${p / g} : ${q / g}`, 'm12 ex-start tc exc-g')}${T(160, 180, `${p} : ${q} = (${p} : ${g}) : (${q} : ${g}) = ${p / g} : ${q / g}`, 'm12')}`;
      if (tk) {
        const ok = check(st, p === tk.p && q === tk.q);
        return { svg: `${svg}${badge(`${tk.P} : ${tk.Q} = ?`, ok)}`, caption: taskCap(st, ok, L(`Simplify the ratio ${tk.P} : ${tk.Q} - set it with the sliders.`, `Сократи отношение ${tk.P} : ${tk.Q} - выставь его ползунками.`, `${tk.P} : ${tk.Q} қатынасын қысқарт - жүгірткілермен қой.`), L(`Now ${p} : ${q}. Hint: divide both by gcd(${tk.P}, ${tk.Q}) = ${gcd(tk.P, tk.Q)}.`, `Сейчас ${p} : ${q}. Подсказка: раздели оба на НОД(${tk.P}, ${tk.Q}) = ${gcd(tk.P, tk.Q)}.`, `Қазір ${p} : ${q}. Кеңес: екеуін ЕҮОБ(${tk.P}, ${tk.Q}) = ${gcd(tk.P, tk.Q)}-ге бөл.`)) };
      }
      return {
        svg,
        caption: g > 1
          ? L(`Both parts divide by gcd(${p}, ${q}) = ${g}: the green groups. ${p} : ${q} = ${p / g} : ${q / g} - the same mix, just fewer, bigger parts.`, `Обе части делятся на НОД(${p}, ${q}) = ${g} - зелёные группы. ${p} : ${q} = ${p / g} : ${q / g} - та же смесь, только частей меньше, и они крупнее.`, `Екі бөлік те ЕҮОБ(${p}, ${q}) = ${g}-ге бөлінеді - жасыл топтар. ${p} : ${q} = ${p / g} : ${q / g} - сол қоспа, тек бөліктері аз әрі ірі.`)
          : L(`gcd(${p}, ${q}) = 1: the ratio ${p} : ${q} cannot be simplified.`, `НОД(${p}, ${q}) = 1: отношение ${p} : ${q} уже несократимо.`, `ЕҮОБ(${p}, ${q}) = 1: ${p} : ${q} қатынасы қысқармайды.`),
      };
    }
    const part = T0 / (p + q);
    const w = 280 / (p + q);
    const blocks2 = Array.from({ length: p + q }, (_, i) => `${box(20 + i * w, 70, w - 3, 46, i < p ? 'exc-o' : 'exc-b', 6, 0.85)}${w > 26 ? T(20 + i * w + w / 2 - 1.5, 98, fmt(part, 1), 'm9 exm-on') : ''}`).join('');
    const svg = `${T(160, 34, `${p} : ${q}`, 'm18')}${T(160, 56, `${fmt(T0)} ${ml}`, 'm11 exm-mut')}${blocks2}${T(20 + (p * w) / 2, 134, `${u('juice', 'сок', 'шырын')} ${fmt(part * p, 1)}`, 'm11 tc exc-o')}${T(20 + p * w + (q * w) / 2, 134, `${u('water', 'вода', 'су')} ${fmt(part * q, 1)}`, 'm11 tc exc-b')}${T(160, 176, `${u('one part', 'одна часть', 'бір бөлік')} = ${fmt(T0)} : ${p + q} = ${fmt(part, 2)}`, 'm12')}`;
    if (tk) {
      const ok = check(st, p === tk.p && q === tk.q && near(T0, tk.T0, 0.01));
      const ask = tk.type === 0
        ? L(`Juice : water = ${tk.p} : ${tk.q}, the water is ${fmt(tk.w)} ml. How much drink in total? Set the total.`, `Сок : вода = ${tk.p} : ${tk.q}, воды ${fmt(tk.w)} мл. Сколько всего напитка? Установи «всего».`, `Шырын : су = ${tk.p} : ${tk.q}, су ${fmt(tk.w)} мл. Барлық сусын қанша? «Барлығы» мәнін орнат.`)
        : L(`Juice : water = ${tk.p} : ${tk.q}. There should be ${fmt(tk.water)} ml of water. Find the total.`, `Сок : вода = ${tk.p} : ${tk.q}. Воды должно быть ${fmt(tk.water)} мл. Найди общий объём.`, `Шырын : су = ${tk.p} : ${tk.q}. Су ${fmt(tk.water)} мл болуы керек. Жалпы көлемді тап.`);
      const wv = tk.type === 0 ? tk.w : tk.water;
      return { svg: `${svg}${badge(`${u('water', 'вода', 'су')} = ${fmt(wv)}`, ok)}`, caption: taskCap(st, ok, ask, L(`Now the water is ${fmt(part * q, 1)} ml. Hint: one part = ${fmt(wv)} : ${tk.q}.`, `Сейчас воды ${fmt(part * q, 1)} мл. Подсказка: одна часть = ${fmt(wv)} : ${tk.q}.`, `Қазір су ${fmt(part * q, 1)} мл. Кеңес: бір бөлік = ${fmt(wv)} : ${tk.q}.`)) };
    }
    return {
      svg,
      caption: L(`${fmt(T0)} ml in the ratio ${p} : ${q}: that is ${p + q} equal parts of ${fmt(part, 2)} ml. Juice ${p} parts = ${fmt(part * p, 1)} ml, water ${q} parts = ${fmt(part * q, 1)} ml.`, `${fmt(T0)} мл в отношении ${p} : ${q}: это ${p + q} равных частей по ${fmt(part, 2)} мл. Сок - ${p} ч. = ${fmt(part * p, 1)} мл, вода - ${q} ч. = ${fmt(part * q, 1)} мл.`, `${fmt(T0)} мл, қатынасы ${p} : ${q}: бұл ${fmt(part, 2)} мл-ден ${p + q} тең бөлік. Шырын ${p} бөлік = ${fmt(part * p, 1)} мл, су ${q} бөлік = ${fmt(part * q, 1)} мл.`),
    };
  },
});

// ---------- Простые числа, НОД и НОК ----------

const factors = (n) => {
  const out = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) while (m % p === 0) {
    out.push(p);
    m /= p;
  }
  if (m > 1) out.push(m);
  return out;
};
const isPrime = (n) => n > 1 && factors(n).length === 1;
const powForm = (fs) => {
  const c = new Map();
  for (const p of fs) c.set(p, (c.get(p) ?? 0) + 1);
  return [...c.entries()].map(([p, k]) => (k > 1 ? `${p}${sup(k)}` : p)).join('·');
};

function sieveTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const [lo, hi] = pick([[90, 100], [20, 28], [50, 60], [110, 120], [30, 36], [62, 70]]);
    t = { lo, hi, m: 1 };
  } else if (type === 1) {
    const n = pick([60, 72, 90, 84, 100, 48, 120, 108]);
    t = { n, m: 1 };
  } else {
    const [a, g] = pick([[12, 4], [18, 6], [24, 8], [30, 10], [36, 12], [20, 5]]);
    t = { a, g, m: 2 };
  }
  st.task = { type, done: false, ...t };
  return type === 2 ? { a: t.a, b: 2 } : { a: 2 };
}

const sieve = modes({
  title: L('Primes, GCD and LCM', 'Простые числа, НОД и НОК', 'Жай сандар, ЕҮОБ және ЕКОЕ'),
  intro: L('A prime has exactly two divisors: 1 and itself. Every number splits into primes - that gives GCD and LCM at once.', 'У простого числа ровно два делителя: 1 и оно само. Любое число раскладывается на простые множители - отсюда сразу НОД и НОК.', 'Жай санның дәл екі бөлгіші бар: 1 және өзі. Кез келген сан жай көбейткіштерге жіктеледі - ЕҮОБ пен ЕКОЕ осыдан шығады.'),
  sliders: [
    { id: 'a', label: 'a', min: 2, max: 120, value: 84, hidden: (v, st) => st.m === 0 || (st.m === 3 && st.task?.type === 2) },
    { id: 'b', label: 'b', min: 2, max: 120, value: 90, hidden: (v, st) => !(st.m === 2 || (st.m === 3 && st.task?.type === 2)) },
  ],
  tabs: [L('Sieve', 'Решето', 'Елек'), L('Factors', 'Разложение', 'Жіктеу'), L('GCD and LCM', 'НОД и НОК', 'ЕҮОБ және ЕКОЕ'), TASK],
  acts: [{ label: L('Next prime', 'Следующее простое', 'Келесі жай сан'), only: [0] }, { label: L('▶ All', '▶ Всё', '▶ Барлығы'), only: [0] }, { label: RESET, only: [0] }, { label: MORE, only: [1, 2, 3] }],
  state: () => ({ done: [] }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return sieveTask(st);
    return null;
  },
  onAct(j, st, v, api) {
    const next = () => {
      const p = [2, 3, 5, 7].find((x) => !st.done.includes(x));
      if (p) st.done.push(p);
      return Boolean(p);
    };
    if (j === 0) next();
    else if (j === 1) api.run(() => next(), 700);
    else if (j === 2) {
      api.stop();
      st.done = [];
    } else {
      if (st.m === 3) return sieveTask(st);
      return st.m === 1 ? { a: pick([36, 48, 60, 72, 84, 90, 96, 100, 105, 112, 120]) } : pick([{ a: 12, b: 18 }, { a: 24, b: 36 }, { a: 15, b: 28 }, { a: 42, b: 56 }, { a: 8, b: 12 }]);
    }
    return null;
  },
  draw(v, step, st) {
    if (st.m === 0) {
      const crossedBy = (n) => st.done.find((p) => n !== p && n % p === 0);
      const COL = { 2: 'exc-r', 3: 'exc-o', 5: 'exc-b', 7: 'exc-k' };
      const cells = Array.from({ length: 100 }, (_, i) => {
        const n = i + 1;
        const by = crossedBy(n);
        const prime = n > 1 && !by && (st.done.length === 4 || st.done.includes(n));
        const x = 12 + (i % 10) * 30;
        const y = 8 + Math.floor(i / 10) * 20.5;
        return `${prime ? box(x + 2, y + 1, 26, 17, 'exc-g', 5, 0.3) : ''}${T(x + 15, y + 14, n, `m10 ${n === 1 ? 'exm-mut' : by ? `tc ${COL[by]}` : prime ? 'tc exc-g' : ''}`)}${by ? ln(x + 6, y + 10, x + 24, y + 10, COL[by], 1.3) : ''}`;
      }).join('');
      const left = Array.from({ length: 99 }, (_, i) => i + 2).filter((n) => !crossedBy(n)).length;
      const nx = [2, 3, 5, 7].find((x) => !st.done.includes(x));
      return {
        svg: cells,
        caption: st.done.length
          ? L(`Crossed out the multiples of ${st.done.join(', ')} (each prime has its colour). ${nx ? `${left} numbers are left. Next: ${nx}.` : `The ${left} green numbers are all the primes up to 100. It was enough to sieve by primes up to √100 = 10.`}`, `Вычеркнули кратные ${st.done.join(', ')} (у каждого простого свой цвет). ${nx ? `Осталось ${left} чисел. Дальше: ${nx}.` : `${left} зелёных чисел - все простые числа до 100. Хватило просеять простыми до √100 = 10.`}`, `${st.done.join(', ')}-ге еселілер сызылды (әр жай санның өз түсі). ${nx ? `${left} сан қалды. Келесі: ${nx}.` : `${left} жасыл сан - 100-ге дейінгі барлық жай сандар. √100 = 10-ға дейінгі жай сандармен електен өткізу жеткілікті болды.`}`)
          : L('1 is neither prime nor composite. Press "Next prime": 2 stays, all its multiples are crossed out.', '1 - ни простое, ни составное. Нажми «Следующее простое»: 2 остаётся, все кратные ему вычёркиваем.', '1 - жай да, құрама да емес. «Келесі жай сан» бас: 2 қалады, оған еселілердің бәрін сызамыз.'),
      };
    }
    const tk = st.m === 3 ? (st.task ?? (sieveTask(st), st.task)) : null;
    const a = Math.round(v.a);
    const b = Math.round(v.b);
    if (st.m === 2 || tk?.type === 2) {
      const A = tk ? tk.a : a;
      const fa = factors(A);
      const fb = factors(b);
      const common = [];
      const restB = [...fb];
      const onlyA = [];
      for (const p of fa) {
        const i = restB.indexOf(p);
        if (i >= 0) {
          common.push(p);
          restB.splice(i, 1);
        } else onlyA.push(p);
      }
      const G = common.reduce((s, x) => s * x, 1);
      const Lc = (A * b) / G;
      const place = (arr, cx, cls) => arr.map((p, i) => T(cx + ((i % 2) - 0.5) * 22 * (arr.length > 1 ? 1 : 0), 94 + Math.floor(i / 2) * 20 - (Math.ceil(arr.length / 2) - 1) * 10, p, `m15 tc ${cls}`)).join('');
      const svg = `<circle class="exm-soft exc-o" cx="118" cy="92" r="66"/><circle class="exm-soft exc-b" cx="202" cy="92" r="66"/>${place(onlyA, 90, 'exc-o')}${place(common, 160, 'exc-p')}${place(restB, 230, 'exc-b')}
        ${T(70, 20, `${A} = ${powForm(fa)}`, 'm11 tc exc-o')}${T(250, 20, `${b} = ${powForm(fb)}`, 'm11 tc exc-b')}
        ${T(160, 184, `${u('GCD', 'НОД', 'ЕҮОБ')}(${A}, ${b}) = ${common.length ? common.join('·') : '1'} = ${G}`, 'm12 tc exc-p')}${T(160, 206, `${u('LCM', 'НОК', 'ЕКОЕ')} = ${[...onlyA, ...common, ...restB].sort((x, y) => x - y).join('·')} = ${Lc}`, 'm12')}`;
      if (tk) {
        const ok = check(st, G === tk.g);
        return { svg: `${svg}${badge(`${u('GCD', 'НОД', 'ЕҮОБ')}(${tk.a}, b) = ${tk.g}`, ok)}`, caption: taskCap(st, ok, L(`Find a number b such that gcd(${tk.a}, b) = ${tk.g}.`, `Подбери число b, чтобы НОД(${tk.a}, b) = ${tk.g}.`, `ЕҮОБ(${tk.a}, b) = ${tk.g} болатындай b санын таңда.`), L(`Now gcd = ${G}. The common primes (middle) must multiply to ${tk.g} = ${powForm(factors(tk.g))}.`, `Сейчас НОД = ${G}. Общие простые (в середине) должны дать ${tk.g} = ${powForm(factors(tk.g))}.`, `Қазір ЕҮОБ = ${G}. Ортақ жай сандар (ортада) ${tk.g} = ${powForm(factors(tk.g))} беруі керек.`)) };
      }
      return {
        svg,
        caption: L(
          `Common prime factors are in the middle: their product is GCD = ${G}. LCM takes every factor once from the whole picture: ${Lc}. Check: GCD · LCM = ${G}·${Lc} = ${A * b} = a·b.${G === 1 ? ' GCD = 1: the numbers are coprime.' : ''}`,
          `Общие простые множители - в середине: их произведение - НОД = ${G}. НОК берёт каждый множитель со всей картинки по одному разу: ${Lc}. Проверка: НОД · НОК = ${G}·${Lc} = ${A * b} = a·b.${G === 1 ? ' НОД = 1: числа взаимно простые.' : ''}`,
          `Ортақ жай көбейткіштер ортада: олардың көбейтіндісі - ЕҮОБ = ${G}. ЕКОЕ барлық суреттегі әр көбейткішті бір реттен алады: ${Lc}. Тексеру: ЕҮОБ · ЕКОЕ = ${G}·${Lc} = ${A * b} = a·b.${G === 1 ? ' ЕҮОБ = 1: сандар өзара жай.' : ''}`,
        ),
      };
    }
    // дерево множителей
    const fs = factors(a);
    let g = '';
    let cur = a;
    let x = 150;
    let y = 22;
    const dx = 26;
    const dy = 26;
    g += `${box(x - 18, y - 13, 36, 18, 'exc-p', 6, 0.18)}${T(x, y, a, 'm12')}`;
    fs.forEach((p, i) => {
      if (i === fs.length - 1) return;
      cur /= p;
      const lx = x - dx;
      const rx = x + dx;
      const ny = y + dy;
      g += ln(x - 4, y + 4, lx + 3, ny - 11, 'exc-m', 1.2) + ln(x + 4, y + 4, rx - 3, ny - 11, 'exc-m', 1.2);
      g += `${dot(lx, ny - 4, 11, 'exc-g')}${T(lx, ny, p, 'm11 exm-on')}${T(rx, ny, cur, i === fs.length - 2 ? 'm11' : 'm11')}`;
      if (i === fs.length - 2) g += `${dot(rx, ny - 4, 11, 'exc-g')}${T(rx, ny, cur, 'm11 exm-on')}`;
      x = rx;
      y = ny;
    });
    if (fs.length === 1) g += T(150, 52, u('prime!', 'простое!', 'жай сан!'), 'm12 tc exc-g');
    const formula = `${a} = ${fs.join('·')}${fs.length > 1 && powForm(fs) !== fs.join('·') ? ` = ${powForm(fs)}` : ''}`;
    const divs = Array.from({ length: a }, (_, i) => i + 1).filter((d) => a % d === 0);
    const svg = `${g}${T(160, 192, formula, 'm12 tc exc-p')}${T(160, 212, `${u('divisors', 'делители', 'бөлгіштер')}: ${divs.length > 12 ? `${divs.slice(0, 12).join(', ')}…` : divs.join(', ')} (${divs.length})`, 'm9 exm-mut')}`;
    if (tk) {
      const ok = check(st, tk.type === 0 ? isPrime(a) && a > tk.lo && a < tk.hi : a === tk.n);
      const ask = tk.type === 0 ? L(`Find a prime number between ${tk.lo} and ${tk.hi}.`, `Найди простое число между ${tk.lo} и ${tk.hi}.`, `${tk.lo} мен ${tk.hi} арасындағы жай санды тап.`) : L(`Which number factors as ${powForm(factors(tk.n))}?`, `Какое число раскладывается как ${powForm(factors(tk.n))}?`, `Қай сан ${powForm(factors(tk.n))} болып жіктеледі?`);
      return { svg: `${svg}${badge(tk.type === 0 ? `${tk.lo} < p < ${tk.hi}` : powForm(factors(tk.n)), ok)}`, caption: taskCap(st, ok, ask, L(`Now ${formula}.`, `Сейчас ${formula}.`, `Қазір ${formula}.`)) };
    }
    return {
      svg,
      caption: fs.length === 1
        ? L(`${a} is prime: no divisors except 1 and ${a}.`, `${a} - простое: делителей, кроме 1 и ${a}, нет.`, `${a} - жай сан: 1 мен ${a}-тен басқа бөлгіші жоқ.`)
        : L(`Split off the smallest prime each time: ${formula}. Green circles are primes - they cannot be split. ${a} has ${divs.length} divisors.`, `Каждый раз отделяем наименьший простой множитель: ${formula}. Зелёные кружки - простые, их не разложить. У ${a} ${divs.length} ${pl(divs.length, 'делитель', 'делителя', 'делителей')}.`, `Әр жолы ең кіші жай көбейткішті бөліп аламыз: ${formula}. Жасыл дөңгелектер - жай сандар, оларды жіктеу мүмкін емес. ${a} санының ${divs.length} бөлгіші бар.`),
    };
  },
});

// ---------- Углы ----------

/** Вершины треугольника с углами A, B при основании, вписанные в рамку (x0, y0, w, h). */
function triFit(A, B, x0 = 14, y0 = 26, w = 190, h = 160) {
  const C = 180 - A - B;
  const PR = Math.sin(deg(B)) / Math.sin(deg(C));
  const R = [PR * Math.cos(deg(A)), PR * Math.sin(deg(A))];
  const xs = [0, 1, R[0]];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const s = Math.min(w / (maxX - minX), h / Math.max(R[1], 0.01));
  const ox = x0 + (w - (maxX - minX) * s) / 2 - minX * s;
  const oy = y0 + h;
  const P = (p) => [ox + p[0] * s, oy - p[1] * s];
  return { P: P([0, 0]), Q: P([1, 0]), R: P(R), s, C };
}
const wedge = (cx, cy, r, a0, sweep, cls) => `<path class="ex-fill ${cls}" style="opacity:.85" d="${arcD(cx, cy, r, a0, a0 + sweep, true)}"/>`;
const PAIRS = [
  { n: L('vertical', 'вертикальные', 'вертикаль'), a: 1, b: 3, eq: true },
  { n: L('corresponding', 'соответственные', 'сәйкес'), a: 1, b: 5, eq: true },
  { n: L('alternate interior', 'накрест лежащие', 'айқыш'), a: 4, b: 6, eq: true },
  { n: L('co-interior (same side)', 'односторонние', 'тұстас'), a: 4, b: 5, eq: false },
];

function angTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const A = rnd(3, 9) * 5;
    const Cg = pick([90, 60, 100, 45, 120, 75]);
    t = { A, Cg, B: 180 - A - Cg };
    if (t.B < 10) t = { A: 40, Cg: 90, B: 50 };
  } else if (type === 1) {
    const Cg = pick([20, 40, 60, 80, 100, 120, 30, 50]);
    t = { Cg, B: (180 - Cg) / 2 };
  } else {
    const A = rnd(4, 10) * 5;
    const Ext = A + rnd(4, 14) * 5;
    t = { A, Ext, B: 180 - Ext };
  }
  st.task = { type, done: false, ...t };
  return type === 1 ? { A: 50, B: 50 } : { A: t.A, B: 60 };
}

const angles = modes({
  title: L('Angles', 'Углы', 'Бұрыштар'),
  intro: L('The angles of a triangle add up to 180°. An exterior angle equals the sum of the two non-adjacent ones. Parallel lines cut by a transversal give equal angles.', 'Сумма углов треугольника - 180°. Внешний угол равен сумме двух несмежных с ним. Параллельные прямые и секущая дают равные углы.', 'Үшбұрыш бұрыштарының қосындысы - 180°. Сыртқы бұрыш онымен сыбайлас емес екі бұрыштың қосындысына тең. Параллель түзулер мен қиюшы тең бұрыштар береді.'),
  sliders: [
    { id: 'A', label: 'A°', min: 10, max: 150, value: 60, hidden: (v, st) => st.m === 3 && st.task?.type !== 1 },
    { id: 'B', label: 'B°', min: 10, max: 150, value: 50, hidden: only(0, 1, 3) },
  ],
  values: { ph: 0 },
  clamp(v) {
    if (v.A + v.B > 170) v.B = 170 - v.A;
  },
  tabs: [L('Sum 180°', 'Сумма 180°', 'Қосынды 180°'), L('Exterior', 'Внешний угол', 'Сыртқы бұрыш'), L('Parallel lines', 'Параллельные', 'Параллель түзулер'), TASK],
  acts: [{ label: L('▶ Put together', '▶ Сложить углы', '▶ Бұрыштарды қосу'), only: [0] }, { label: L('Pairs ↻', 'Пары ↻', 'Жұптар ↻'), only: [2] }, { label: MORE, only: [3] }],
  state: () => ({ pr: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return angTask(st);
    return { ph: 0, $dur: 1 };
  },
  onAct(j, st, v) {
    if (j === 0) return { ph: v.ph > 0.5 ? 0 : 1, $dur: 1400 };
    if (j === 1) {
      st.pr = (st.pr + 1) % PAIRS.length;
      return null;
    }
    return angTask(st);
  },
  draw(v, step, st) {
    const tk = st.m === 3 ? (st.task ?? (angTask(st), st.task)) : null;
    if (st.m === 2) {
      const A = v.A;
      const y1 = 70;
      const y2 = 152;
      const dx = (y2 - y1) / Math.tan(deg(A));
      const c1 = 160 + dx / 2;
      const c2 = 160 - dx / 2;
      const pr = PAIRS[st.pr];
      const val = (i) => ([1, 3, 5, 7].includes(i) ? A : 180 - A);
      // углы: 1 - вверх-вправо, 2 - вверх-влево, 3 - вниз-влево, 4 - вниз-вправо
      const starts = { 1: 0, 2: A, 3: 180, 4: 180 + A };
      let g = `${ln(10, y1, 310, y1, 'exc-b', 2.5)}${ln(10, y2, 310, y2, 'exc-b', 2.5)}${ln(c1 + 80 * Math.cos(deg(A)), y1 - 80 * Math.sin(deg(A)), c2 - 80 * Math.cos(deg(A)), y2 + 80 * Math.sin(deg(A)), 'exc-m', 2)}`;
      for (let i = 1; i <= 8; i++) {
        const k = ((i - 1) % 4) + 1;
        const [cx, cy] = i <= 4 ? [c1, y1] : [c2, y2];
        const on = i === pr.a || i === pr.b;
        const sw = k % 2 ? A : 180 - A;
        if (on) g += wedge(cx, cy, 24, starts[k], sw, i === pr.a ? 'exc-o' : pr.eq ? 'exc-o' : 'exc-g');
        const [lx, ly] = on ? on2(cx, cy, 34, starts[k] + sw / 2) : on2(cx, cy, 30, starts[k] + sw / 2);
        g += T(lx, ly + 4, on ? `${fmt(val(i), 0)}°` : i, `m10 ${on ? '' : 'exm-mut'}`);
      }
      g += T(312, 18, tx(pr.n), 'm12 ex-end') + T(14, y1 - 6, 'a', 'm11 tc exc-b ex-start') + T(14, y2 - 6, 'b', 'm11 tc exc-b ex-start') + T(160, 206, 'a ∥ b', 'm11 exm-mut');
      return {
        svg: g,
        caption: J(
          L(`${tx(pr.n, 'en')} angles ${pr.a} and ${pr.b}: `, `${tx(pr.n, 'ru')[0].toUpperCase()}${tx(pr.n, 'ru').slice(1)} углы ${pr.a} и ${pr.b}: `, `${tx(pr.n, 'kk')[0].toUpperCase()}${tx(pr.n, 'kk').slice(1)} ${pr.a} және ${pr.b} бұрыштар: `),
          pr.eq
            ? L(`they are equal, ${fmt(val(pr.a), 0)}° = ${fmt(val(pr.b), 0)}°.`, `они равны, ${fmt(val(pr.a), 0)}° = ${fmt(val(pr.b), 0)}°.`, `олар тең, ${fmt(val(pr.a), 0)}° = ${fmt(val(pr.b), 0)}°.`)
            : L(`they add up to 180°: ${fmt(val(pr.a), 0)}° + ${fmt(val(pr.b), 0)}° = 180°.`, `в сумме 180°: ${fmt(val(pr.a), 0)}° + ${fmt(val(pr.b), 0)}° = 180°.`, `қосындысы 180°: ${fmt(val(pr.a), 0)}° + ${fmt(val(pr.b), 0)}° = 180°.`),
          L('Only two different values appear: A and 180° − A. "Pairs ↻" shows other pairs.', 'Всего два разных значения: A и 180° − A. «Пары ↻» - другие пары.', 'Барлығы екі түрлі мән: A және 180° − A. «Жұптар ↻» - басқа жұптар.'),
        ),
      };
    }
    const A = tk && tk.type !== 1 ? tk.A : v.A;
    const B = Math.min(v.B, 170 - A);
    const { P, Q, R, C } = triFit(A, B);
    const k = clamp(v.ph, 0, 1);
    const kind =
      Math.abs(C - 90) < 0.5 || Math.abs(A - 90) < 0.5 || Math.abs(B - 90) < 0.5
        ? L('right', 'прямоугольный', 'тікбұрышты')
        : Math.max(A, B, C) > 90
          ? L('obtuse', 'тупоугольный', 'доғал бұрышты')
          : L('acute', 'остроугольный', 'сүйір бұрышты');
    const iso = Math.abs(A - B) < 0.5 || Math.abs(A - C) < 0.5 || Math.abs(B - C) < 0.5;
    const tri = `<path class="ex-tri" d="M${pts([P, Q, R])} Z"/>`;
    const lab = (p, a0, sw, s, cls) => {
      const [x, y] = on2(p[0], p[1], 34, a0 + sw / 2);
      return T(x, y + 4, s, `m10 tc ${cls} h`);
    };
    if (st.m === 1 || tk?.type === 2) {
      const ext = 180 - B;
      const svg = `${ln(Q[0], Q[1], Math.min(316, Q[0] + 90), Q[1], 'exc-m ex-dash', 2)}${tri}${wedge(P[0], P[1], 22, 0, A, 'exc-p')}${wedge(R[0], R[1], 22, 180 + A, C, 'exc-o')}${wedge(Q[0], Q[1], 18, 180 - B, B, 'exc-m')}${wedge(Q[0], Q[1], 28, 0, ext, 'exc-g')}
        ${lab(P, 0, A, `${fmt(A, 0)}°`, 'exc-p')}${lab(R, 180 + A, C, `${fmt(C, 0)}°`, 'exc-o')}${T(...on2(Q[0], Q[1], 44, ext / 2), `${fmt(ext, 0)}°`, 'm11 tc exc-g h')}
        ${T(240, 30, `${u('ext.', 'внешн.', 'сырт.')} = 180° − B`, 'm11')}${T(240, 50, `= A + C = ${fmt(A, 0)}° + ${fmt(C, 0)}°`, 'm11')}`;
      if (tk) {
        const ok = check(st, near(180 - B, tk.Ext, 0.5));
        return { svg: `${svg}${badge(`A = ${tk.A}°, ${u('ext.', 'внешн.', 'сырт.')} B = ${tk.Ext}°`, ok)}`, caption: taskCap(st, ok, L(`A = ${tk.A}°, the exterior angle at B is ${tk.Ext}°. Build the triangle: set B.`, `A = ${tk.A}°, внешний угол при B равен ${tk.Ext}°. Построй треугольник: установи B.`, `A = ${tk.A}°, B-дағы сыртқы бұрыш ${tk.Ext}°. Үшбұрышты тұрғыз: B-ны орнат.`), L(`Now the exterior angle is ${fmt(180 - B, 0)}°. Hint: interior + exterior = 180°.`, `Сейчас внешний угол ${fmt(180 - B, 0)}°. Подсказка: внутренний + внешний = 180°.`, `Қазір сыртқы бұрыш ${fmt(180 - B, 0)}°. Кеңес: ішкі + сыртқы = 180°.`)) };
      }
      return {
        svg,
        caption: L(
          `The exterior angle at B (green) = 180° − ${fmt(B, 0)}° = ${fmt(ext, 0)}°. It equals the sum of the two angles not next to it: A + C = ${fmt(A, 0)}° + ${fmt(C, 0)}° = ${fmt(A + C, 0)}°.`,
          `Внешний угол при B (зелёный) = 180° − ${fmt(B, 0)}° = ${fmt(ext, 0)}°. Он равен сумме двух углов, не смежных с ним: A + C = ${fmt(A, 0)}° + ${fmt(C, 0)}° = ${fmt(A + C, 0)}°.`,
          `B-дағы сыртқы бұрыш (жасыл) = 180° − ${fmt(B, 0)}° = ${fmt(ext, 0)}°. Ол өзімен сыбайлас емес екі бұрыштың қосындысына тең: A + C = ${fmt(A, 0)}° + ${fmt(C, 0)}° = ${fmt(A + C, 0)}°.`,
        ),
      };
    }
    // сумма углов: клинья переезжают к развёрнутому углу
    const O = [262, 186];
    const mv = (p, a0, to, sw, cls) => {
      const cx = lerp(p[0], O[0], k);
      const cy = lerp(p[1], O[1], k);
      return wedge(cx, cy, 26, lerp(a0, to, k), sw, cls);
    };
    const svg = `${ln(206, O[1], 316, O[1], 'exc-m', 1.5)}${tri}${mv(P, 0, 0, A, 'exc-p')}${mv(R, 180 + A, A, C, 'exc-o')}${mv(Q, 180 - B, A + C, B, 'exc-b')}
      ${k < 0.1 ? `${lab(P, 0, A, `${fmt(A, 0)}°`, 'exc-p')}${lab(Q, 180 - B, B, `${fmt(B, 0)}°`, 'exc-b')}${lab(R, 180 + A, C, `${fmt(C, 0)}°`, 'exc-o')}` : ''}${k > 0.9 ? T(O[0], O[1] - 40, '180°', 'm15') : ''}
      ${T(P[0] - 4, P[1] + 14, 'A', 'm11 exm-mut')}${T(Q[0] + 4, Q[1] + 14, 'B', 'm11 exm-mut')}${T(R[0], R[1] - 8, 'C', 'm11 exm-mut')}${T(312, 212, `${tx(kind)}${iso ? `, ${u('isosceles', 'равнобедренный', 'теңбүйірлі')}` : ''}`, 'm10 ex-end exm-mut')}`;
    if (tk) {
      const ok = check(st, tk.type === 0 ? near(B, tk.B, 0.5) : near(A, tk.B, 0.5) && near(B, tk.B, 0.5));
      const ask = tk.type === 0
        ? L(`A = ${tk.A}°. Make the angle C = ${tk.Cg}°: set B.`, `A = ${tk.A}°. Сделай угол C = ${tk.Cg}°: установи B.`, `A = ${tk.A}°. C = ${tk.Cg}° бұрышын жаса: B-ны орнат.`)
        : L(`Build an isosceles triangle (A = B) with the top angle C = ${tk.Cg}°.`, `Построй равнобедренный треугольник (A = B) с углом при вершине C = ${tk.Cg}°.`, `Төбесіндегі бұрышы C = ${tk.Cg}° теңбүйірлі үшбұрыш (A = B) тұрғыз.`);
      return { svg: `${svg}${badge(`C = ${tk.Cg}°`, ok)}`, caption: taskCap(st, ok, ask, L(`Now C = ${fmt(C, 0)}°. Hint: C = 180° − A − B.`, `Сейчас C = ${fmt(C, 0)}°. Подсказка: C = 180° − A − B.`, `Қазір C = ${fmt(C, 0)}°. Кеңес: C = 180° − A − B.`)) };
    }
    return {
      svg,
      caption:
        k > 0.9
          ? L(`${fmt(A, 0)}° + ${fmt(C, 0)}° + ${fmt(B, 0)}° = 180°: the three angles form a straight angle.`, `${fmt(A, 0)}° + ${fmt(C, 0)}° + ${fmt(B, 0)}° = 180°: три угла вместе образуют развёрнутый угол.`, `${fmt(A, 0)}° + ${fmt(C, 0)}° + ${fmt(B, 0)}° = 180°: үш бұрыш бірге жазыңқы бұрыш құрайды.`)
          : L(`C = 180° − A − B = 180° − ${fmt(A, 0)}° − ${fmt(B, 0)}° = ${fmt(C, 0)}°. The triangle is ${tx(kind, 'en')}. Press "Put together".`, `C = 180° − A − B = 180° − ${fmt(A, 0)}° − ${fmt(B, 0)}° = ${fmt(C, 0)}°. Треугольник ${tx(kind, 'ru')}. Нажми «Сложить углы».`, `C = 180° − A − B = 180° − ${fmt(A, 0)}° − ${fmt(B, 0)}° = ${fmt(C, 0)}°. Үшбұрыш ${tx(kind, 'kk')}. «Бұрыштарды қосу» бас.`),
    };
  },
});
/** Точка на окружности (как on), но возвращает [x, y] для подписи. */
function on2(cx, cy, r, a) {
  return on(cx, cy, r, a);
}

// ---------- Площади фигур ----------

const rot = (p, c, a) => {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * ca - dy * sa, c[1] + dx * sa + dy * ca];
};

const circleArea = modes({
  title: L('Areas of figures', 'Площади фигур', 'Фигуралардың аудандары'),
  intro: L('Cut a figure and rearrange the pieces into a rectangle - the area does not change. That is where every area formula comes from.', 'Разрежь фигуру и переложи куски в прямоугольник - площадь не изменится. Отсюда все формулы площадей.', 'Фигураны кесіп, бөліктерін тіктөртбұрышқа құрастыр - аудан өзгермейді. Аудан формулаларының бәрі осыдан шығады.'),
  sliders: [
    { id: 'a', label: L('base a', 'основание a', 'табан a'), min: 2, max: 12, step: 0.5, value: 8, hidden: only(0, 1, 2) },
    { id: 'b', label: L('top base b', 'верхнее основание b', 'жоғарғы табан b'), min: 1, max: 10, step: 0.5, value: 4, hidden: only(2) },
    { id: 'h', label: L('height h', 'высота h', 'биіктік h'), min: 1, max: 7, step: 0.5, value: 4, hidden: only(0, 1, 2) },
    { id: 'r', label: L('radius r', 'радиус r', 'радиус r'), min: 1, max: 5, step: 0.5, value: 3, hidden: only(3) },
  ],
  values: { ph: 0 },
  clamp(v) {
    if (v.b > v.a) v.b = v.a;
  },
  tabs: [L('Parallelogram', 'Параллелограмм', 'Параллелограмм'), L('Triangle', 'Треугольник', 'Үшбұрыш'), L('Trapezoid', 'Трапеция', 'Трапеция'), L('Circle', 'Круг', 'Дөңгелек')],
  acts: [{ label: L('▶ Cut and move', '▶ Разрезать', '▶ Кесу') }],
  onTab() {
    return { ph: 0, $dur: 1 };
  },
  onAct(j, st, v) {
    return { ph: v.ph > 0.5 ? 0 : 1, $dur: 1600 };
  },
  draw(v, step, st) {
    const k = ease(clamp(v.ph, 0, 1));
    const done = v.ph > 0.95;
    if (st.m === 3) {
      const r = v.r;
      const R = r * 20;
      const N = 16;
      const al = Math.PI / N;
      const cx = 160;
      const cy = 100;
      const w = (Math.PI * R) / N;
      const x0 = 160 - (Math.PI * R) / 2 - w / 2;
      const yB = 100 + R / 2;
      const sec = `M0 0 L${n1(-R * Math.sin(al))} ${n1(-R * Math.cos(al))} A${n1(R)} ${n1(R)} 0 0 1 ${n1(R * Math.sin(al))} ${n1(-R * Math.cos(al))} Z`;
      let g = '';
      for (let i = 0; i < N; i++) {
        const th = ((i + 0.5) * 360) / N;
        const up = i % 2 === 0;
        const tx0 = x0 + (i + 0.5) * w + (up ? 0 : 0);
        const tgt = up ? [tx0, yB] : [tx0, yB - R * Math.cos(al)];
        const rotA = up ? 0 : 180;
        let from = th;
        if (Math.abs(from - rotA) > 180) from -= 360 * Math.sign(from - rotA);
        const X = lerp(cx, tgt[0], k);
        const Y = lerp(cy, tgt[1], k);
        const A = lerp(from, rotA, k);
        g += `<path class="ex-fill ${i % 2 ? 'exc-b' : 'exc-p'}" style="opacity:.75" transform="translate(${n1(X)} ${n1(Y)}) rotate(${n1(A)})" d="${sec}"/>`;
      }
      const S = Math.PI * r * r;
      return {
        svg: `${g}${done ? `${T(160, yB + 18, `≈ πr = ${fmt(Math.PI * r)}`, 'm11 tc exc-o')}${T(x0 - 4, yB - R / 2 + 4, 'r', 'm12 tc exc-o ex-end')}` : ln(cx, cy, cx + R, cy, 'exc-o', 2) + T(cx + R / 2, cy - 5, 'r', 'm12 tc exc-o h')}
          ${T(8, 18, `S = πr² = ${fmt(S)}`, 'm12 ex-start')}${T(8, 214, `C = 2πr = ${fmt(2 * Math.PI * r)}`, 'm11 ex-start exm-mut')}`,
        caption: done
          ? L(`16 sectors make almost a rectangle: the top and bottom are half the circumference πr each, the height is r. S = πr · r = πr² = ${fmt(S)}. More sectors - closer to a true rectangle.`, `16 секторов сложились почти в прямоугольник: сверху и снизу по половине окружности πr, высота r. S = πr · r = πr² = ${fmt(S)}. Чем больше секторов, тем точнее прямоугольник.`, `16 сектор тіктөртбұрышқа жуық құрады: үсті мен асты шеңбердің жартысы πr, биіктігі r. S = πr · r = πr² = ${fmt(S)}. Сектор көп болса, тіктөртбұрыш дәлірек.`)
          : L(`A circle of radius ${fmt(r)}: circumference 2πr = ${fmt(2 * Math.PI * r)}. Cut it into 16 sectors and lay them head to tail.`, `Круг радиуса ${fmt(r)}: длина окружности 2πr = ${fmt(2 * Math.PI * r)}. Разрежем его на 16 секторов и уложим «валетом».`, `Радиусы ${fmt(r)} дөңгелек: шеңбер ұзындығы 2πr = ${fmt(2 * Math.PI * r)}. Оны 16 секторға бөліп, кезектестіріп қоямыз.`),
      };
    }
    const a = v.a;
    const h = v.h;
    const b = Math.min(v.b, a);
    const s = Math.min(24, 290 / (a + (st.m === 1 ? a : st.m === 2 ? b : a * 0.4) + 1), 120 / h);
    const X0 = 20;
    const Y0 = 196;
    const P = (x, y) => [X0 + x * s, Y0 - y * s];
    const hLine = (x) => `${ln(...P(x, 0), ...P(x, h), 'exc-o ex-dash', 1.5)}${T(P(x, h / 2)[0] + 4, P(x, h / 2)[1] + 4, `h = ${fmt(h)}`, 'm10 tc exc-o ex-start h')}`;
    const baseL = (x1, x2, txt) => T((P(x1, 0)[0] + P(x2, 0)[0]) / 2, Y0 + 15, txt, 'm10 tc exc-b');
    if (st.m === 0) {
      const sh = Math.min(h * 0.7, a * 0.45);
      const body = [P(sh, 0), P(a, 0), P(a + sh, h), P(sh, h)];
      const cut = [P(0, 0), P(sh, 0), P(sh, h)].map((p) => [p[0] + a * s * k, p[1]]);
      const S = a * h;
      return {
        svg: `${poly(body, 'exc-p', 0.35)}${poly(cut, 'exc-o', 0.6)}${pth(`M${pts([P(0, 0), P(a, 0), P(a + sh, h), P(sh, h)])} Z`, 'exc-p ex-dash', 1)}${hLine(sh)}${baseL(0, a, `a = ${fmt(a)}`)}${T(236, 30, done ? 'S = a · h' : 'S = ?', 'm15')}${T(236, 54, `= ${fmt(a)} · ${fmt(h)} = ${fmt(S)}`, 'm12')}`,
        caption: done
          ? L(`The cut-off triangle moved to the right: now it is a rectangle ${fmt(a)} by ${fmt(h)}. S = a·h = ${fmt(S)}. The slanted side does not matter - only the base and the height.`, `Отрезанный треугольник переехал вправо: получился прямоугольник ${fmt(a)} на ${fmt(h)}. S = a·h = ${fmt(S)}. Боковая сторона не важна - только основание и высота.`, `Кесілген үшбұрыш оңға көшті: ${fmt(a)}-ға ${fmt(h)} тіктөртбұрыш шықты. S = a·h = ${fmt(S)}. Бүйір қабырға маңызды емес - тек табан мен биіктік.`)
          : L(`Cut a triangle off along the height h (orange) and move it to the other side. Press ▶.`, `Отрежем треугольник по высоте h (оранжевый) и перенесём на другую сторону. Нажми ▶.`, `h биіктігі бойымен үшбұрышты кесіп (қызғылт сары), екінші жаққа көшірейік. ▶ бас.`),
      };
    }
    if (st.m === 1) {
      const c = a * 0.35;
      const A = P(0, 0);
      const B = P(a, 0);
      const Cc = P(c, h);
      const M = [(B[0] + Cc[0]) / 2, (B[1] + Cc[1]) / 2];
      const ang = Math.PI * k;
      const copy = [A, B, Cc].map((p) => rot(p, M, ang));
      const S = (a * h) / 2;
      return {
        svg: `${poly(copy, 'exc-o', 0.45)}${poly([A, B, Cc], 'exc-p', 0.45)}${pth(`M${pts([A, B, Cc])} Z`, 'exc-p', 2)}${hLine(c)}${baseL(0, a, `a = ${fmt(a)}`)}${T(236, 30, done ? 'S = ½ a · h' : 'S = ?', 'm15')}${T(236, 54, `= ½ · ${fmt(a)} · ${fmt(h)} = ${fmt(S)}`, 'm12')}`,
        caption: done
          ? L(`Two equal triangles make a parallelogram with area a·h = ${fmt(a * h)}. One triangle is half: S = ½·a·h = ${fmt(S)}.`, `Два одинаковых треугольника образуют параллелограмм площадью a·h = ${fmt(a * h)}. Один треугольник - половина: S = ½·a·h = ${fmt(S)}.`, `Екі бірдей үшбұрыш ауданы a·h = ${fmt(a * h)} параллелограмм құрайды. Бір үшбұрыш - жартысы: S = ½·a·h = ${fmt(S)}.`)
          : L('Take a copy of the triangle and turn it by 180°. Press ▶.', 'Возьмём копию треугольника и повернём на 180°. Нажми ▶.', 'Үшбұрыштың көшірмесін алып, 180°-қа бұрайық. ▶ бас.'),
      };
    }
    const d = (a - b) / 2;
    const A = P(0, 0);
    const B = P(a, 0);
    const Cc = P(d + b, h);
    const D = P(d, h);
    const M = [(B[0] + Cc[0]) / 2, (B[1] + Cc[1]) / 2];
    const copy = [A, B, Cc, D].map((p) => rot(p, M, Math.PI * k));
    const S = ((a + b) / 2) * h;
    return {
      svg: `${poly(copy, 'exc-o', 0.45)}${poly([A, B, Cc, D], 'exc-p', 0.45)}${pth(`M${pts([A, B, Cc, D])} Z`, 'exc-p', 2)}${hLine(d)}${baseL(0, a, `a = ${fmt(a)}`)}${T((D[0] + Cc[0]) / 2, D[1] - 6, `b = ${fmt(b)}`, 'm10 tc exc-b h')}${T(250, 30, done ? 'S = (a + b)/2 · h' : 'S = ?', 'm12')}${T(250, 54, `= (${fmt(a)} + ${fmt(b)})/2 · ${fmt(h)}`, 'm11')}${T(250, 74, `= ${fmt(S)}`, 'm15')}`,
      caption: done
        ? L(`Two trapezoids make a parallelogram with base a + b = ${fmt(a + b)} and height ${fmt(h)}. One trapezoid is half of it: S = (a + b)/2 · h = ${fmt(S)}.`, `Две трапеции дают параллелограмм с основанием a + b = ${fmt(a + b)} и высотой ${fmt(h)}. Одна трапеция - половина: S = (a + b)/2 · h = ${fmt(S)}.`, `Екі трапеция табаны a + b = ${fmt(a + b)}, биіктігі ${fmt(h)} параллелограмм береді. Бір трапеция - жартысы: S = (a + b)/2 · h = ${fmt(S)}.`)
        : L('Take a copy of the trapezoid and turn it by 180° around the middle of the side. Press ▶.', 'Возьмём копию трапеции и повернём на 180° вокруг середины боковой стороны. Нажми ▶.', 'Трапецияның көшірмесін бүйір қабырғасының ортасынан 180°-қа бұрайық. ▶ бас.'),
    };
  },
});

// ---------- Векторы ----------

const VX = (x) => 120 + x * 20;
const VY = (y) => 130 - y * 20;
const vs = (x, y) => `(${fmt(x)}; ${fmt(y)})`;

function vecTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) t = { a: pick([[3, 1], [2, 2], [1, 3], [4, -2], [3, 2]]) };
  else if (type === 1) t = { a: [2, 1], S: [rnd(-3, 6), rnd(-2, 5)] };
  else t = { a: [3, 1], len: 5 };
  st.task = { type, done: false, ...t };
  const [ax, ay] = t.a;
  return { ax, ay, bx: 1, by: 1 };
}

const vectors = modes({
  title: L('Vectors', 'Векторы', 'Векторлар'),
  intro: L('A vector is an arrow (x; y). Drag the ends of a and b: coordinates add, subtract and multiply by a number.', 'Вектор - это стрелка (x; y). Перетаскивай концы a и b: координаты складываются, вычитаются и умножаются на число.', 'Вектор - (x; y) нұсқары. a мен b ұштарын сүйре: координаталар қосылады, азаяды және санға көбейтіледі.'),
  sliders: [{ id: 'k', label: 'k', min: -3, max: 3, step: 0.5, value: 2, hidden: only(1) }],
  values: { ax: 3, ay: 1, bx: 1, by: 2.5 },
  tabs: ['a + b', 'a − b, k·a', 'a · b', TASK],
  acts: [{ label: L('Rule ↻', 'Правило ↻', 'Ереже ↻'), only: [0] }, { label: MORE }],
  state: () => ({ par: false }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return vecTask(st);
    return null;
  },
  onAct(j, st) {
    if (j === 0) {
      st.par = !st.par;
      return null;
    }
    if (st.m === 3) return vecTask(st);
    return pick([{ ax: 3, ay: 1, bx: 1, by: 2.5 }, { ax: 2, ay: 2, bx: 2, by: -2 }, { ax: 4, ay: 0, bx: 2, by: 3 }, { ax: -2, ay: 3, bx: 4, by: 1 }]);
  },
  onDrag(key, p, v, st) {
    const x = clamp(Math.round(((p.x - 120) / 20) * 2) / 2, -5.5, 9.5);
    const y = clamp(Math.round(((130 - p.y) / 20) * 2) / 2, -4, 6);
    if (key === 'a' && !(st.m === 3)) [v.ax, v.ay] = [x, y];
    if (key === 'b') [v.bx, v.by] = [x, y];
  },
  draw(v, step, st) {
    const { ax, ay, bx, by } = v;
    const G = grid({ x0: -6, x1: 10, y0: -4.5, y1: 6.5, lab: 2, ylab: 2 }).svg;
    const O = [VX(0), VY(0)];
    const A = [VX(ax), VY(ay)];
    const B = [VX(bx), VY(by)];
    const la = Math.hypot(ax, ay);
    const lb = Math.hypot(bx, by);
    const handles = `${st.m === 3 ? '' : hit('a', A[0], A[1], 14)}${hit('b', B[0], B[1], 14)}${st.m === 3 ? '' : dot(A[0], A[1], 4, 'exc-p')}${dot(B[0], B[1], 4, 'exc-b')}`;
    const labA = T(A[0] + 6, A[1] - 6, 'a', 'm12 tc exc-p ex-start h');
    const labB = T(B[0] + 6, B[1] - 6, 'b', 'm12 tc exc-b ex-start h');
    const tk = st.m === 3 ? (st.task ?? (vecTask(st), st.task)) : null;

    if (st.m === 1) {
      const k = v.k;
      const D = [VX(ax - bx), VY(ay - by)];
      const K = [VX(k * ax), VY(k * ay)];
      return {
        svg: `${G}${arrow(A[0], A[1], VX(ax - bx), VY(ay - by), 'exc-b ex-faint', 2)}${arrow(O[0], O[1], K[0], K[1], 'exc-g', 4)}${arrow(O[0], O[1], A[0], A[1], 'exc-p')}${arrow(O[0], O[1], B[0], B[1], 'exc-b')}${arrow(O[0], O[1], D[0], D[1], 'exc-o', 3)}${handles}${labA}${labB}
          ${T(8, 18, `a − b = ${vs(ax - bx, ay - by)}`, 'm11 tc exc-o ex-start h')}${T(8, 36, `${fmt(k)}·a = ${vs(k * ax, k * ay)}`, 'm11 tc exc-g ex-start h')}${T(D[0] + 6, D[1] + 12, 'a − b', 'm10 tc exc-o ex-start h')}`,
        caption: L(
          `a − b = a + (−b): from the end of a go along −b (faint blue). Coordinates: ${vs(ax, ay)} − ${vs(bx, by)} = ${vs(ax - bx, ay - by)}. k·a (green) stretches a ${fmt(Math.abs(k))} times${k < 0 ? ' and turns it around' : ''}: |k·a| = ${fmt(Math.abs(k) * la)}.`,
          `a − b = a + (−b): из конца a идём по −b (бледная синяя). Координаты: ${vs(ax, ay)} − ${vs(bx, by)} = ${vs(ax - bx, ay - by)}. k·a (зелёный) растягивает a в ${fmt(Math.abs(k))} раза${k < 0 ? ' и разворачивает' : ''}: |k·a| = ${fmt(Math.abs(k) * la)}.`,
          `a − b = a + (−b): a-ның соңынан −b бойымен жүреміз (бозғылт көк). Координаталар: ${vs(ax, ay)} − ${vs(bx, by)} = ${vs(ax - bx, ay - by)}. k·a (жасыл) a-ны ${fmt(Math.abs(k))} есе созады${k < 0 ? ' және кері бұрады' : ''}: |k·a| = ${fmt(Math.abs(k) * la)}.`,
        ),
      };
    }

    if (st.m === 2) {
      const dotp = ax * bx + ay * by;
      const cos = la && lb ? dotp / (la * lb) : 0;
      const phi = (Math.acos(clamp(cos, -1, 1)) * 180) / Math.PI;
      const a0 = (Math.atan2(ay, ax) * 180) / Math.PI;
      const b0 = (Math.atan2(by, bx) * 180) / Math.PI;
      let d0 = b0 - a0;
      if (d0 > 180) d0 -= 360;
      if (d0 < -180) d0 += 360;
      const pr = la ? dotp / (la * la) : 0;
      const F = [VX(pr * ax), VY(pr * ay)];
      const perp = Math.abs(dotp) < 1e-9 && la && lb;
      return {
        svg: `${G}${ln(B[0], B[1], F[0], F[1], 'exc-m ex-dash', 1.2)}${ln(O[0], O[1], F[0], F[1], 'exc-o', 5)}${la && lb ? pth(arcD(O[0], O[1], 22, a0, a0 + d0), 'exc-g', 2) : ''}${arrow(O[0], O[1], A[0], A[1], 'exc-p')}${arrow(O[0], O[1], B[0], B[1], 'exc-b')}${handles}${labA}${labB}
          ${T(8, 18, `a · b = ${fmt(ax)}·${pn(bx)} + ${fmt(ay)}·${pn(by)} = ${fmt(dotp)}`, 'm11 ex-start h')}${T(8, 36, `φ = ${fmt(phi, 1)}°, cos φ = ${fmt(cos, 3)}`, 'm11 tc exc-g ex-start h')}${perp ? T(8, 54, 'a ⊥ b', 'm12 tc exc-g ex-start h') : ''}`,
        caption: J(
          L(`a · b = x₁x₂ + y₁y₂ = ${fmt(dotp)} = |a|·|b|·cos φ = ${fmt(la)}·${fmt(lb)}·${fmt(cos, 3)}.`, `a · b = x₁x₂ + y₁y₂ = ${fmt(dotp)} = |a|·|b|·cos φ = ${fmt(la)}·${fmt(lb)}·${fmt(cos, 3)}.`, `a · b = x₁x₂ + y₁y₂ = ${fmt(dotp)} = |a|·|b|·cos φ = ${fmt(la)}·${fmt(lb)}·${fmt(cos, 3)}.`),
          perp
            ? L('The product is 0 - the vectors are perpendicular!', 'Произведение равно 0 - векторы перпендикулярны!', 'Көбейтінді 0 - векторлар перпендикуляр!')
            : dotp > 0
              ? L('Positive: the angle is acute. The orange part is the shadow (projection) of b on a.', 'Положительное: угол острый. Оранжевый отрезок - «тень» (проекция) b на a.', 'Оң: бұрыш сүйір. Қызғылт сары кесінді - b-ның a-ға «көлеңкесі» (проекциясы).')
              : L('Negative: the angle is obtuse, b points "backwards" relative to a.', 'Отрицательное: угол тупой, b смотрит «назад» относительно a.', 'Теріс: бұрыш доғал, b a-ға қарағанда «артқа» қарайды.'),
        ),
      };
    }

    const S = [VX(ax + bx), VY(ay + by)];
    const sum = `${arrow(O[0], O[1], S[0], S[1], 'exc-o', 3.2)}${T(S[0] + 6, S[1] + 4, 'a + b', 'm11 tc exc-o ex-start h')}`;
    const rule = st.par
      ? `${arrow(B[0], B[1], S[0], S[1], 'exc-p ex-faint', 2)}${arrow(A[0], A[1], S[0], S[1], 'exc-b ex-faint', 2)}`
      : `${arrow(A[0], A[1], S[0], S[1], 'exc-b ex-faint', 2.2)}`;
    const base = `${G}${rule}${arrow(O[0], O[1], A[0], A[1], 'exc-p')}${arrow(O[0], O[1], B[0], B[1], 'exc-b')}${sum}${handles}${labA}${labB}`;
    if (tk) {
      let ok;
      let ask;
      let hint;
      let tag;
      if (tk.type === 0) {
        ok = Math.abs(ax * bx + ay * by) < 1e-9 && lb > 0;
        tag = 'a ⊥ b';
        ask = L(`a = ${vs(ax, ay)}. Drag b so that b ⊥ a.`, `a = ${vs(ax, ay)}. Перетащи b так, чтобы b ⊥ a.`, `a = ${vs(ax, ay)}. b ⊥ a болатындай b-ны сүйре.`);
        hint = L(`Now a·b = ${fmt(ax * bx + ay * by)}. Perpendicular means a·b = 0. Try (${fmt(-ay)}; ${fmt(ax)}).`, `Сейчас a·b = ${fmt(ax * bx + ay * by)}. Перпендикулярны - значит a·b = 0. Попробуй (${fmt(-ay)}; ${fmt(ax)}).`, `Қазір a·b = ${fmt(ax * bx + ay * by)}. Перпендикуляр - a·b = 0. (${fmt(-ay)}; ${fmt(ax)}) байқап көр.`);
      } else if (tk.type === 1) {
        ok = near(ax + bx, tk.S[0], 0.01) && near(ay + by, tk.S[1], 0.01);
        tag = `a + b = ${vs(...tk.S)}`;
        ask = L(`a = ${vs(ax, ay)}. Find b so that a + b = ${vs(...tk.S)}.`, `a = ${vs(ax, ay)}. Найди b, чтобы a + b = ${vs(...tk.S)}.`, `a = ${vs(ax, ay)}. a + b = ${vs(...tk.S)} болатындай b тап.`);
        hint = L(`Now a + b = ${vs(ax + bx, ay + by)}. Hint: b = (a + b) − a.`, `Сейчас a + b = ${vs(ax + bx, ay + by)}. Подсказка: b = (a + b) − a.`, `Қазір a + b = ${vs(ax + bx, ay + by)}. Кеңес: b = (a + b) − a.`);
      } else {
        ok = near(lb, 5, 1e-6);
        tag = '|b| = 5';
        ask = L('Make the length of b equal to 5.', 'Сделай длину вектора b равной 5.', 'b векторының ұзындығын 5-ке теңе.');
        hint = L(`Now |b| = √(${fmt(bx)}² + ${fmt(by)}²) = ${fmt(lb)}. Think of the triangle 3-4-5.`, `Сейчас |b| = √(${fmt(bx)}² + ${fmt(by)}²) = ${fmt(lb)}. Вспомни треугольник 3-4-5.`, `Қазір |b| = √(${fmt(bx)}² + ${fmt(by)}²) = ${fmt(lb)}. 3-4-5 үшбұрышын еске ал.`);
      }
      ok = check(st, ok);
      return { svg: `${base}${T(8, 18, `b = ${vs(bx, by)}`, 'm11 tc exc-b ex-start h')}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }
    return {
      svg: `${base}${T(8, 18, `a = ${vs(ax, ay)}, |a| = ${fmt(la)}`, 'm11 tc exc-p ex-start h')}${T(8, 36, `b = ${vs(bx, by)}, |b| = ${fmt(lb)}`, 'm11 tc exc-b ex-start h')}${T(8, 54, `a + b = ${vs(ax + bx, ay + by)}`, 'm11 tc exc-o ex-start h')}`,
      caption: st.par
        ? L(`Parallelogram rule: put a and b at one point - the sum is the diagonal. a + b = b + a = ${vs(ax + bx, ay + by)}, length ${fmt(Math.hypot(ax + bx, ay + by))}. Drag the arrow ends.`, `Правило параллелограмма: векторы из одной точки - сумма это диагональ. a + b = b + a = ${vs(ax + bx, ay + by)}, длина ${fmt(Math.hypot(ax + bx, ay + by))}. Перетаскивай концы стрелок.`, `Параллелограмм ережесі: векторлар бір нүктеден - қосынды диагональ. a + b = b + a = ${vs(ax + bx, ay + by)}, ұзындығы ${fmt(Math.hypot(ax + bx, ay + by))}. Нұсқар ұштарын сүйре.`)
        : L(`Triangle rule: put the start of b at the end of a (faint). The sum goes from the start of a to the end of b: ${vs(ax, ay)} + ${vs(bx, by)} = ${vs(ax + bx, ay + by)}. Drag the arrow ends.`, `Правило треугольника: начало b - в конец a (бледная стрелка). Сумма - из начала a в конец b: ${vs(ax, ay)} + ${vs(bx, by)} = ${vs(ax + bx, ay + by)}. Перетаскивай концы стрелок.`, `Үшбұрыш ережесі: b-ның басы - a-ның соңында (бозғылт нұсқар). Қосынды a-ның басынан b-ның соңына: ${vs(ax, ay)} + ${vs(bx, by)} = ${vs(ax + bx, ay + by)}. Нұсқар ұштарын сүйре.`),
    };
  },
});

// ---------- Объём и площадь поверхности ----------

const volume = modes({
  title: L('Volume and surface area', 'Объём и площадь поверхности', 'Көлем және бет ауданы'),
  intro: L('Volume of a prism or cylinder = base area × height; a cone or pyramid holds one third of that. Unfold a solid to see its surface area.', 'Объём призмы или цилиндра = площадь основания × высота; конус или пирамида - треть от этого. Разверни тело - увидишь площадь поверхности.', 'Призма не цилиндр көлемі = табан ауданы × биіктік; конус не пирамида - оның үштен бірі. Денені жазсаң - бет ауданын көресің.'),
  sliders: [
    { id: 'a', label: L('a (radius r)', 'a (радиус r)', 'a (радиус r)'), min: 1, max: 6, step: 0.5, value: 3 },
    { id: 'b', label: 'b', min: 1, max: 6, step: 0.5, value: 2, hidden: only(0) },
    { id: 'h', label: 'h', min: 1, max: 8, step: 0.5, value: 4, hidden: (v, st) => st.m === 3 },
  ],
  values: { ph: 0 },
  tabs: [L('Box', 'Параллелепипед', 'Параллелепипед'), L('Cylinder', 'Цилиндр', 'Цилиндр'), L('Cone', 'Конус', 'Конус'), L('Sphere', 'Шар', 'Шар')],
  acts: [{ label: L('Unfold ↔', 'Развёртка ↔', 'Жазба ↔'), only: [0, 1, 2] }],
  onTab() {
    return { ph: 0, $dur: 1 };
  },
  onAct(j, st, v) {
    return { ph: v.ph > 0.5 ? 0 : 1, $dur: 700 };
  },
  draw(v, step, st) {
    const { a, b, h } = v;
    const k = clamp(v.ph, 0, 1);
    const net = k > 0.5;
    const o1 = op(1 - k * 2);
    const o2 = op(k * 2 - 1);
    const P = Math.PI;
    const R = (x, y, w, hh, cls, o = 0.3) => box(x, y, w, hh, cls, 1, o) + `<rect class="ex-stroke exc-m" style="fill:none;stroke-width:1" x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(hh)}"/>`;
    if (st.m === 0) {
      const V = a * b * h;
      const S = 2 * (a * b + b * h + a * h);
      const s = Math.min(22, 150 / (h + b * 0.5), 150 / (a + b * 0.6));
      const dx = b * s * 0.6;
      const dy = b * s * 0.45;
      const x0 = 48;
      const y0 = 196;
      const W1 = a * s;
      const H1 = h * s;
      let grid3 = '';
      if (Number.isInteger(a) && Number.isInteger(h)) {
        for (let i = 1; i < a; i++) grid3 += ln(x0 + i * s, y0, x0 + i * s, y0 - H1, 'exc-b', 0.6);
        for (let j = 1; j < h; j++) grid3 += ln(x0, y0 - j * s, x0 + W1, y0 - j * s, 'exc-b', 0.6);
      }
      const solid = `<g opacity="${o1}">${poly([[x0, y0 - H1], [x0 + dx, y0 - H1 - dy], [x0 + W1 + dx, y0 - H1 - dy], [x0 + W1, y0 - H1]], 'exc-b', 0.55)}${poly([[x0 + W1, y0], [x0 + W1 + dx, y0 - dy], [x0 + W1 + dx, y0 - H1 - dy], [x0 + W1, y0 - H1]], 'exc-b', 0.4)}${box(x0, y0 - H1, W1, H1, 'exc-b', 0, 0.3)}${grid3}
        <path class="ex-stroke exc-m" style="stroke-width:1.5;fill:none" d="M${x0} ${y0} H${n1(x0 + W1)} V${n1(y0 - H1)} H${x0} Z M${x0} ${n1(y0 - H1)} l${n1(dx)} ${n1(-dy)} h${n1(W1)} l${n1(-dx)} ${n1(dy)} M${n1(x0 + W1 + dx)} ${n1(y0 - H1 - dy)} v${n1(H1)} l${n1(-dx)} ${n1(dy)}"/>
        ${T(x0 + W1 / 2, y0 + 13, `a = ${fmt(a)}`, 'm10')}${T(x0 + W1 + dx / 2 + 6, y0 - dy / 2 + 8, `b = ${fmt(b)}`, 'm10 ex-start')}${T(x0 - 4, y0 - H1 / 2, `h = ${fmt(h)}`, 'm10 ex-end')}</g>`;
      // развёртка: крест
      const t = Math.min(12, 200 / (2 * h + 2 * b), 190 / (2 * a + 2 * b));
      const nx = 20;
      const ny = 16;
      const A1 = a * t;
      const B1 = b * t;
      const H2 = h * t;
      const netS = `<g opacity="${o2}">${R(nx + B1, ny, A1, B1, 'exc-o')}${R(nx, ny + B1, B1, H2, 'exc-g')}${R(nx + B1, ny + B1, A1, H2, 'exc-b')}${R(nx + B1 + A1, ny + B1, B1, H2, 'exc-g')}${R(nx + 2 * B1 + A1, ny + B1, A1, H2, 'exc-b')}${R(nx + B1, ny + B1 + H2, A1, B1, 'exc-o')}</g>`;
      return {
        svg: `${solid}${netS}${T(250, 40, `V = a·b·h`, 'm12')}${T(250, 60, `= ${fmt(V)}`, 'm15 tc exc-p')}${T(250, 100, 'S = 2(ab + bh + ah)', 'm10')}${T(250, 120, `= ${fmt(S)}`, 'm12 tc exc-o')}`,
        caption: net
          ? L(`The surface unfolds into 6 rectangles: two a×b (orange), two a×h (blue), two b×h (green). S = 2(${fmt(a * b)} + ${fmt(b * h)} + ${fmt(a * h)}) = ${fmt(S)}.`, `Поверхность разворачивается в 6 прямоугольников: два a×b (оранжевые), два a×h (синие), два b×h (зелёные). S = 2(${fmt(a * b)} + ${fmt(b * h)} + ${fmt(a * h)}) = ${fmt(S)}.`, `Бет 6 тіктөртбұрышқа жазылады: екі a×b (қызғылт сары), екі a×h (көк), екі b×h (жасыл). S = 2(${fmt(a * b)} + ${fmt(b * h)} + ${fmt(a * h)}) = ${fmt(S)}.`)
          : L(`V = a·b·h = ${fmt(a)}·${fmt(b)}·${fmt(h)} = ${fmt(V)}: the base a×b = ${fmt(a * b)} is stacked ${fmt(h)} times. Double one edge - the volume doubles.`, `V = a·b·h = ${fmt(a)}·${fmt(b)}·${fmt(h)} = ${fmt(V)}: основание a×b = ${fmt(a * b)} уложено в ${fmt(h)} слоёв. Удвой одно ребро - объём удвоится.`, `V = a·b·h = ${fmt(a)}·${fmt(b)}·${fmt(h)} = ${fmt(V)}: a×b = ${fmt(a * b)} табаны ${fmt(h)} қабат болып жатыр. Бір қырын екі есе арттырсаң - көлем екі есе артады.`),
      };
    }
    const r = a;
    if (st.m === 3) {
      const s = Math.min(26, 90 / r);
      const cx = 100;
      const cy = 112;
      const Rr = r * s;
      const V = (4 / 3) * P * r ** 3;
      const S = 4 * P * r * r;
      return {
        svg: `<rect class="ex-stroke exc-m ex-dash" style="fill:none;stroke-width:1.2" x="${n1(cx - Rr)}" y="${n1(cy - Rr)}" width="${n1(2 * Rr)}" height="${n1(2 * Rr)}"/><circle class="ex-fill exc-b" style="opacity:.3" cx="${cx}" cy="${cy}" r="${n1(Rr)}"/><circle class="ex-stroke exc-b" style="fill:none;stroke-width:2" cx="${cx}" cy="${cy}" r="${n1(Rr)}"/><ellipse class="ex-stroke exc-b ex-dash" style="fill:none;stroke-width:1.2" cx="${cx}" cy="${cy}" rx="${n1(Rr)}" ry="${n1(Rr * 0.3)}"/>${ln(cx, cy, cx + Rr, cy, 'exc-o', 2)}${T(cx + Rr / 2, cy - 5, `r = ${fmt(r)}`, 'm10 tc exc-o h')}
          ${T(250, 40, 'V = 4/3 πr³', 'm12')}${T(250, 60, `= ${fmt(V)}`, 'm15 tc exc-p')}${T(250, 100, 'S = 4πr²', 'm12')}${T(250, 120, `= ${fmt(S)}`, 'm12 tc exc-o')}${T(250, 160, `${u('cylinder', 'цилиндр', 'цилиндр')}: ${fmt(2 * P * r ** 3)}`, 'm10 exm-mut')}`,
        caption: L(`A ball of radius ${fmt(r)}: V = 4/3·π·r³ = ${fmt(V)}, S = 4πr² = ${fmt(S)}. Archimedes: the ball takes exactly 2/3 of the cylinder around it (dashed), V = 2/3 · 2πr³.`, `Шар радиуса ${fmt(r)}: V = 4/3·π·r³ = ${fmt(V)}, S = 4πr² = ${fmt(S)}. Архимед: шар занимает ровно 2/3 описанного цилиндра (пунктир), V = 2/3 · 2πr³.`, `Радиусы ${fmt(r)} шар: V = 4/3·π·r³ = ${fmt(V)}, S = 4πr² = ${fmt(S)}. Архимед: шар сырттай сызылған цилиндрдің дәл 2/3 бөлігін алады (пунктир), V = 2/3 · 2πr³.`),
      };
    }
    const cone = st.m === 2;
    const Sb = P * r * r;
    const Vv = cone ? (Sb * h) / 3 : Sb * h;
    const l = Math.hypot(r, h);
    const Sside = cone ? P * r * l : 2 * P * r * h;
    const Stot = Sside + (cone ? Sb : 2 * Sb);
    const s = Math.min(18, 160 / h, 85 / r);
    const cx = 100;
    const base = 196;
    const Rr = r * s;
    const Hh = h * s;
    const ry = Rr * 0.3;
    const top = base - Hh;
    const solid = `<g opacity="${o1}">${cone ? `<path class="ex-fill exc-o" style="opacity:.45" d="M${n1(cx - Rr)} ${base} L${cx} ${n1(top)} L${n1(cx + Rr)} ${base} A${n1(Rr)} ${n1(ry)} 0 0 1 ${n1(cx - Rr)} ${base} Z"/>` : `<path class="ex-fill exc-b" style="opacity:.4" d="M${n1(cx - Rr)} ${n1(top)} V${base} A${n1(Rr)} ${n1(ry)} 0 0 0 ${n1(cx + Rr)} ${base} V${n1(top)} Z"/><ellipse class="ex-fill exc-b" style="opacity:.6" cx="${cx}" cy="${n1(top)}" rx="${n1(Rr)}" ry="${n1(ry)}"/>`}
      <ellipse class="ex-stroke exc-m" style="fill:none;stroke-width:1.2" cx="${cx}" cy="${base}" rx="${n1(Rr)}" ry="${n1(ry)}"/>${ln(cx, base, cx, top, 'exc-k ex-dash', 1.5)}${ln(cx, base, cx + Rr, base, 'exc-p', 2)}
      ${T(cx + Rr / 2, base - 4, 'r', 'm11 tc exc-p h')}${T(cx - 5, (base + top) / 2, 'h', 'm11 tc exc-k ex-end h')}${cone ? T((cx + Rr + cx) / 2 + 10, (base + top) / 2, `l = ${fmt(l)}`, 'm10 ex-start h') : ''}</g>`;
    // развёртка
    let netS;
    const t = cone ? Math.min(60 / l, 14) : Math.min(180 / (2 * P * r), 120 / (h + 4 * r), 14);
    if (cone) {
      const ang = (360 * r) / l;
      const L1 = l * t;
      netS = `<g opacity="${o2}"><path class="ex-fill exc-o" style="opacity:.45" d="${arcD(100, 30, L1, -90 - ang / 2, -90 + ang / 2, true)}"/><circle class="ex-fill exc-b" style="opacity:.4" cx="100" cy="${n1(30 + L1 + r * t + 4)}" r="${n1(r * t)}"/>${T(100, 24, `${fmt(ang, 0)}°`, 'm10 exm-mut')}</g>`;
    } else {
      const Wd = 2 * P * r * t;
      const Hn = h * t;
      const y1 = 110 - Hn / 2;
      netS = `<g opacity="${o2}">${R(100 - Wd / 2, y1, Wd, Hn, 'exc-b', 0.35)}<circle class="ex-fill exc-b" style="opacity:.5" cx="100" cy="${n1(y1 - r * t)}" r="${n1(r * t)}"/><circle class="ex-fill exc-b" style="opacity:.5" cx="100" cy="${n1(y1 + Hn + r * t)}" r="${n1(r * t)}"/>${T(100, y1 + Hn / 2 + 4, `2πr = ${fmt(2 * P * r)}`, 'm10 h')}</g>`;
    }
    return {
      svg: `${solid}${netS}${T(250, 30, cone ? 'V = ⅓ πr²h' : 'V = πr²h', 'm12')}${T(250, 52, `= ${fmt(Vv)}`, 'm15 tc exc-p')}${T(250, 90, cone ? 'S = πr² + πrl' : 'S = 2πr² + 2πrh', 'm10')}${T(250, 110, `= ${fmt(Stot)}`, 'm12 tc exc-o')}${cone ? T(250, 150, `${u('3 cones = 1 cylinder', '3 конуса = 1 цилиндр', '3 конус = 1 цилиндр')}`, 'm10 exm-mut') : ''}`,
      caption: net
        ? cone
          ? L(`The side of a cone unrolls into a sector of radius l = √(r² + h²) = ${fmt(l)}: its area is πrl = ${fmt(Sside)}. Plus the base πr² = ${fmt(Sb)}: S = ${fmt(Stot)}.`, `Боковая поверхность конуса разворачивается в сектор радиуса l = √(r² + h²) = ${fmt(l)}: его площадь πrl = ${fmt(Sside)}. Плюс основание πr² = ${fmt(Sb)}: S = ${fmt(Stot)}.`, `Конустың бүйір беті радиусы l = √(r² + h²) = ${fmt(l)} секторға жазылады: ауданы πrl = ${fmt(Sside)}. Қосу табан πr² = ${fmt(Sb)}: S = ${fmt(Stot)}.`)
          : L(`The side of a cylinder unrolls into a rectangle 2πr × h = ${fmt(2 * P * r)} × ${fmt(h)} = ${fmt(Sside)}. Plus two circles 2πr² = ${fmt(2 * Sb)}: S = ${fmt(Stot)}.`, `Боковая поверхность цилиндра - прямоугольник 2πr × h = ${fmt(2 * P * r)} × ${fmt(h)} = ${fmt(Sside)}. Плюс два круга 2πr² = ${fmt(2 * Sb)}: S = ${fmt(Stot)}.`, `Цилиндрдің бүйір беті - 2πr × h = ${fmt(2 * P * r)} × ${fmt(h)} = ${fmt(Sside)} тіктөртбұрыш. Қосу екі дөңгелек 2πr² = ${fmt(2 * Sb)}: S = ${fmt(Stot)}.`)
        : cone
          ? L(`Cone: V = ⅓·πr²·h = ⅓·${fmt(Sb)}·${fmt(h)} = ${fmt(Vv)}. Three such cones fill a cylinder of the same size.`, `Конус: V = ⅓·πr²·h = ⅓·${fmt(Sb)}·${fmt(h)} = ${fmt(Vv)}. Три таких конуса заполняют цилиндр того же размера.`, `Конус: V = ⅓·πr²·h = ⅓·${fmt(Sb)}·${fmt(h)} = ${fmt(Vv)}. Осындай үш конус сол өлшемдегі цилиндрді толтырады.`)
          : L(`Cylinder: V = πr²·h = ${fmt(Sb)}·${fmt(h)} = ${fmt(Vv)}. Double r - the volume grows 4 times; double h - only 2 times.`, `Цилиндр: V = πr²·h = ${fmt(Sb)}·${fmt(h)} = ${fmt(Vv)}. Удвой r - объём вырастет в 4 раза; h - только в 2 раза.`, `Цилиндр: V = πr²·h = ${fmt(Sb)}·${fmt(h)} = ${fmt(Vv)}. r-ді екі есе арттырсаң - көлем 4 есе өседі; h-ты - тек 2 есе.`),
    };
  },
});

// ---------- Интеграл ----------

const IFUN = [
  { f: (x) => x * x, F: (x) => (x * x * x) / 3, s: 'x²', Fs: 'x³/3', y0: -1.2, y1: 9.5 },
  { f: (x) => 4 - x * x, F: (x) => 4 * x - (x * x * x) / 3, s: '4 − x²', Fs: '4x − x³/3', y0: -5.5, y1: 4.8 },
  { f: Math.sin, F: (x) => -Math.cos(x), s: 'sin x', Fs: '−cos x', y0: -1.5, y1: 1.5 },
  { f: (x) => x + 1, F: (x) => (x * x) / 2 + x, s: 'x + 1', Fs: 'x²/2 + x', y0: -2.5, y1: 4.5 },
];
const METH = [L('left', 'левые', 'сол'), L('middle', 'средние', 'орта'), L('right', 'правые', 'оң'), L('trapezoids', 'трапеции', 'трапециялар')];
const INT_TASKS = [
  { fi: 0, a: 0, v: 9, sol: [3] },
  { fi: 3, a: -1, v: 2, sol: [1] },
  { fi: 2, a: 0, v: 1, sol: [Math.PI / 2] },
  { fi: 1, a: 0, v: 0, sol: [Math.sqrt(12)] },
  { fi: 0, a: 0, v: 1 / 3, sol: [1] },
];

function intTask(st) {
  let i;
  do i = rnd(0, INT_TASKS.length - 1);
  while (st.task && st.task.i === i);
  const t = INT_TASKS[i];
  st.task = { i, ...t, done: false };
  st.fi = t.fi;
  return { a: t.a, b: t.a + 0.5 };
}

const integral = modes({
  title: L('The integral: area under the graph', 'Интеграл - площадь под графиком', 'Интеграл - график астындағы аудан'),
  intro: L('Cover the area with thin rectangles and add them up. The limit of these sums is the integral, and it equals F(b) − F(a).', 'Закроем площадь тонкими прямоугольниками и сложим их. Предел таких сумм - интеграл, и он равен F(b) − F(a).', 'Ауданды жұқа тіктөртбұрыштармен жауып, қосамыз. Осындай қосындылардың шегі - интеграл, ол F(b) − F(a)-ға тең.'),
  sliders: [
    { id: 'a', label: 'a', min: -3, max: 3, step: 0.1, value: 0, hidden: (v, st) => st.m === 2 },
    { id: 'b', label: 'b', min: -3, max: 3, step: 0.01, value: 2 },
    { id: 'n', label: 'n', min: 1, max: 40, value: 6, hidden: only(0) },
  ],
  tabs: [L('Riemann sums', 'Суммы', 'Қосындылар'), L('Antiderivative', 'Первообразная', 'Алғашқы функция'), TASK],
  acts: [{ label: L('Function ↻', 'Функция ↻', 'Функция ↻'), only: [0, 1] }, { label: L('Method ↻', 'Способ ↻', 'Тәсіл ↻'), only: [0] }, { label: MORE, only: [2] }],
  state: () => ({ fi: 0, me: 1 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return intTask(st);
    if (m === 2) st.fi = st.task.fi;
    return null;
  },
  onAct(j, st) {
    if (j === 0) st.fi = (st.fi + 1) % IFUN.length;
    else if (j === 1) st.me = (st.me + 1) % 4;
    else return intTask(st);
    return null;
  },
  draw(v, step, st) {
    const F0 = IFUN[st.fi];
    const { f, F } = F0;
    const tk = st.m === 2 ? (st.task ?? (intTask(st), st.task)) : null;
    const a = tk ? tk.a : v.a;
    const b = v.b;
    const exact = F(b) - F(a);
    const two = st.m === 1;
    const G = grid({ x0: -3.3, x1: 3.3, y0: F0.y0, y1: F0.y1, Y0: 0, Y1: two ? 126 : H, lab: 1, ylab: F0.y1 > 5 ? 2 : 1, ystep: F0.y1 > 5 ? 1 : 0.5 });
    const { sx, sy } = G;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const fill = (fn, x1, x2, cls) => (x2 - x1 > 1e-6 ? area(`M${n1(sx(x1))} ${n1(sy(0))} ${plot((x) => fn(x), x1, x2, sx, sy, 80).replace(/^M/, 'L')} L${n1(sx(x2))} ${n1(sy(0))} Z`, cls, 0.3) : '');
    const shade = fill((x) => Math.max(0, f(x)), lo, hi, 'exc-g') + fill((x) => Math.min(0, f(x)), lo, hi, 'exc-r');
    const curve = pth(plotClip(f, -3.3, 3.3, sx, sy, -5, (two ? 126 : H) + 5), 'exc-p', 3);
    const ab = `${ln(sx(a), sy(0) - 4, sx(a), sy(0) + 4, 'exc-o', 2)}${T(sx(a), sy(0) + 16, 'a', 'm11 tc exc-o h')}${ln(sx(b), sy(0) - 4, sx(b), sy(0) + 4, 'exc-o', 2)}${T(sx(b), sy(0) + 16, 'b', 'm11 tc exc-o h')}`;
    const head = T(8, 16, `f(x) = ${F0.s}`, 'm11 ex-start h');
    const nl = `∫ ${fmt(a)}..${fmt(b)}`;

    if (st.m === 1) {
      const Gb = grid({ x0: -3.3, x1: 3.3, y0: -1, y1: 1, Y0: 134, Y1: 216, labels: false });
      const vals = [];
      for (let i = 0; i <= 60; i++) vals.push(F(-3.3 + (6.6 * i) / 60) - F(a));
      const ymin = Math.min(...vals, -0.5);
      const ymax = Math.max(...vals, 0.5);
      const syb = (y) => 216 - ((y - ymin) / (ymax - ymin)) * 80;
      return {
        svg: `${G.svg}${shade}${curve}${ab}${head}${Gb.svg.replace(/<text[^>]*>[^<]*<\/text>/g, '')}${ln(0, syb(0), W, syb(0), 'exc-m', 1.2)}${pth(plotClip((x) => F(x) - F(a), -3.3, 3.3, sx, syb, 132, 218), 'exc-o', 2.5)}${dot(sx(b), syb(exact), 5, 'exc-o')}${ln(sx(b), sy(f(b)), sx(b), syb(exact), 'exc-m ex-dash', 1)}
          ${T(8, 146, `F(x) − F(a), F = ${F0.Fs}`, 'm10 tc exc-o ex-start h')}${T(312, 16, `${nl} = ${fmt(exact, 3)}`, 'm11 ex-end h')}`,
        caption: L(
          `The orange graph is the accumulated area from a to x. It grows where f > 0 (green area) and falls where f < 0 (red). Its slope is f itself: F′ = f. So ∫ from ${fmt(a)} to ${fmt(b)} of ${F0.s} dx = F(b) − F(a) = ${fmt(F(b), 3)} − ${fmt(F(a), 3)} = ${fmt(exact, 3)} (Newton-Leibniz).`,
          `Оранжевый график - накопленная площадь от a до x. Он растёт там, где f > 0 (зелёная площадь), и падает, где f < 0 (красная). Его наклон - сама f: F′ = f. Поэтому ∫ от ${fmt(a)} до ${fmt(b)} ${F0.s} dx = F(b) − F(a) = ${fmt(F(b), 3)} − ${fmt(F(a), 3)} = ${fmt(exact, 3)} (Ньютон-Лейбниц).`,
          `Қызғылт сары график - a-дан x-ке дейінгі жиналған аудан. Ол f > 0 жерде (жасыл аудан) өседі, f < 0 жерде (қызыл) кемиді. Оның көлбеулігі - f-тің өзі: F′ = f. Сондықтан ${fmt(a)}-дан ${fmt(b)}-ге дейін ∫ ${F0.s} dx = F(b) − F(a) = ${fmt(F(b), 3)} − ${fmt(F(a), 3)} = ${fmt(exact, 3)} (Ньютон-Лейбниц).`,
        ),
      };
    }

    if (tk) {
      const ok = check(st, Math.abs(exact - tk.v) < 0.02 && b > tk.a + 0.05);
      return {
        svg: `${G.svg}${shade}${curve}${ab}${head}${T(312, 40, `= ${fmt(exact, 3)}`, 'm12 ex-end h')}${badge(`∫ ${fmt(tk.a)}..b ${F0.s} dx = ${fmt(tk.v, 3)}`, ok)}`,
        caption: taskCap(
          st,
          ok,
          L(`Find b > ${fmt(tk.a)} such that the integral of ${F0.s} from ${fmt(tk.a)} to b equals ${fmt(tk.v, 3)}.`, `Найди b > ${fmt(tk.a)}, при котором интеграл ${F0.s} от ${fmt(tk.a)} до b равен ${fmt(tk.v, 3)}.`, `${fmt(tk.a)}-дан b-ге дейінгі ${F0.s} интегралы ${fmt(tk.v, 3)}-ге тең болатын b > ${fmt(tk.a)} тап.`),
          L(`Now it is ${fmt(exact, 3)}. Hint: F(x) = ${F0.Fs}, solve F(b) − F(${fmt(tk.a)}) = ${fmt(tk.v, 3)}.${tk.v === 0 ? ' Area above and below the axis must cancel.' : ''}`, `Сейчас ${fmt(exact, 3)}. Подсказка: F(x) = ${F0.Fs}, реши F(b) − F(${fmt(tk.a)}) = ${fmt(tk.v, 3)}.${tk.v === 0 ? ' Площади над осью и под осью должны сократиться.' : ''}`, `Қазір ${fmt(exact, 3)}. Кеңес: F(x) = ${F0.Fs}, F(b) − F(${fmt(tk.a)}) = ${fmt(tk.v, 3)} теңдеуін шеш.${tk.v === 0 ? ' Осьтен жоғары және төмен аудандар қысқаруы керек.' : ''}`),
        ),
      };
    }

    const n = Math.round(v.n);
    const dx = (b - a) / n;
    let sum = 0;
    let rects = '';
    for (let i = 0; i < n; i++) {
      const x1 = a + i * dx;
      const x2 = x1 + dx;
      if (st.me === 3) {
        sum += ((f(x1) + f(x2)) / 2) * dx;
        rects += `<path class="ex-rect" d="M${n1(sx(x1))} ${n1(sy(0))} L${n1(sx(x1))} ${n1(clamp(sy(f(x1)), -10, 230))} L${n1(sx(x2))} ${n1(clamp(sy(f(x2)), -10, 230))} L${n1(sx(x2))} ${n1(sy(0))} Z"/>`;
      } else {
        const xs = st.me === 0 ? x1 : st.me === 1 ? x1 + dx / 2 : x2;
        const y = f(xs);
        sum += y * dx;
        const top = clamp(sy(Math.max(y, 0)), -10, 230);
        const bot = clamp(sy(Math.min(y, 0)), -10, 230);
        rects += `<rect class="ex-rect" x="${n1(Math.min(sx(x1), sx(x2)))}" y="${n1(top)}" width="${n1(Math.abs(sx(x2) - sx(x1)))}" height="${n1(bot - top)}"/>`;
      }
    }
    return {
      svg: `${G.svg}${shade}${rects}${curve}${ab}${head}${T(312, 16, `Σ = ${fmt(sum, 3)}`, 'm11 ex-end h')}${T(312, 32, `${nl} = ${fmt(exact, 3)}`, 'm11 tc exc-p ex-end h')}${T(312, 48, `${u('error', 'ошибка', 'қате')} ${fmt(Math.abs(exact - sum), 3)}`, 'm10 exm-mut ex-end h')}`,
      caption: J(
        L(`${n} ${tx(METH[st.me], 'en')} ${st.me === 3 ? '' : 'rectangles '}of width Δx = (b − a)/n = ${fmt(dx, 3)} give ${fmt(sum, 3)}; the exact integral is F(b) − F(a) = ${fmt(exact, 3)}. More pieces - smaller error.`, `${n} ${tx(METH[st.me], 'ru')}${st.me === 3 ? '' : ' прямоугольники'} шириной Δx = (b − a)/n = ${fmt(dx, 3)} дают ${fmt(sum, 3)}; точный интеграл F(b) − F(a) = ${fmt(exact, 3)}. Больше кусочков - меньше ошибка.`, `Ені Δx = (b − a)/n = ${fmt(dx, 3)} болатын ${n} ${tx(METH[st.me], 'kk')}${st.me === 3 ? '' : ' тіктөртбұрыш'} ${fmt(sum, 3)} береді; нақты интеграл F(b) − F(a) = ${fmt(exact, 3)}. Бөлік көп - қате аз.`),
        lo < hi && (f(lo) < 0 || f(hi) < 0 || f((lo + hi) / 2) < 0) ? L('Area below the axis counts with a minus (red).', 'Площадь под осью идёт со знаком минус (красная).', 'Осьтен төменгі аудан минус таңбамен алынады (қызыл).') : null,
        a > b ? L('a > b: the integral changes sign.', 'a > b: интеграл меняет знак.', 'a > b: интеграл таңбасын өзгертеді.') : null,
      ),
    };
  },
});

// ---------- Комплексные числа ----------

const zStr = (a, b) => {
  if (Math.abs(b) < 1e-9) return fmt(a);
  const bi = Math.abs(Math.abs(b) - 1) < 1e-9 ? 'i' : `${fmt(Math.abs(b))}i`;
  if (Math.abs(a) < 1e-9) return `${b < 0 ? '−' : ''}${bi}`;
  return `${fmt(a)} ${b < 0 ? '−' : '+'} ${bi}`;
};
const argD = (a, b) => (Math.atan2(b, a) * 180) / Math.PI;

function cxTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const [re, im] = pick([[3, 4], [-3, 4], [4, -3], [0, 5], [-4, -3]]);
    t = { re, mod: 5, im, tag: `|z| = 5, Re z = ${fmt(re)}` };
  } else if (type === 1) {
    const re = rnd(-3, 3);
    const im = pick([-3, -2, -1, 1, 2, 3]);
    t = { re, im: -im, tag: `z = ${zStr(re, im)} → z̄`, from: [re, im] };
  } else {
    const re = rnd(-3, 3);
    const im = rnd(-3, 3) || 1;
    t = { re, im, tag: `z · i = ${zStr(-im, re)}` };
  }
  st.task = { type, done: false, ...t };
  return { a: 0, b: 0 };
}

const complex = modes({
  title: L('Complex numbers on the plane', 'Комплексные числа на плоскости', 'Жазықтықтағы комплекс сандар'),
  intro: L('z = a + bi is a point (a; b). Adding works like vectors; multiplying multiplies the lengths and adds the angles.', 'z = a + bi - точка (a; b). Сложение - как у векторов; при умножении длины перемножаются, а углы складываются.', 'z = a + bi - (a; b) нүктесі. Қосу векторлардағыдай; көбейткенде ұзындықтар көбейтіледі, бұрыштар қосылады.'),
  sliders: [
    { id: 'a', label: 'Re z = a', min: -4, max: 4, step: 0.5, value: 3 },
    { id: 'b', label: 'Im z = b', min: -4, max: 4, step: 0.5, value: 2 },
  ],
  values: { c: 1, d: 2 },
  tabs: [L('z and |z|', 'z и |z|', 'z және |z|'), 'z + w', 'z · w', TASK],
  acts: [{ label: '× i', only: [0] }, { label: L('conjugate', 'сопряжённое', 'түйіндес'), only: [0] }, { label: MORE, only: [1, 2, 3] }],
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return cxTask(st);
    return null;
  },
  onAct(j, st, v) {
    if (j === 0) return { a: clamp(-v.b, -4, 4), b: clamp(v.a, -4, 4) };
    if (j === 1) return { b: -v.b };
    if (st.m === 3) return cxTask(st);
    return { c: pick([1, -1, 2, 0, 1.5]), d: pick([1, 2, -1, 1.5, -2]) };
  },
  onDrag(key, p, v, st) {
    const R = st.m === 2 ? Math.max(5, Math.hypot(v.a, v.b) * Math.hypot(v.c, v.d) * 1.1) : 5;
    const sc = 100 / R;
    v.c = clamp(Math.round(((p.x - 160) / sc) * 2) / 2, -4, 4);
    v.d = clamp(Math.round(((110 - p.y) / sc) * 2) / 2, -4, 4);
  },
  draw(v, step, st) {
    const { a, b, c, d } = v;
    const mod = Math.hypot(a, b);
    const ph = argD(a, b);
    if (st.m === 1 || st.m === 2) {
      const mult = st.m === 2;
      const pa = mult ? a * c - b * d : a + c;
      const pb = mult ? a * d + b * c : b + d;
      const R = Math.max(5, Math.hypot(pa, pb) * 1.1, mod * 1.1);
      const sc = 100 / R;
      const sx = (x) => 160 + x * sc;
      const sy = (y) => 110 - y * sc;
      const step2 = R > 20 ? 5 : R > 10 ? 2 : 1;
      const G = grid({ x0: -1.6 * R, x1: 1.6 * R, y0: -1.1 * R, y1: 1.1 * R, step: step2, lab: step2 * 2 }).svg;
      const O = [sx(0), sy(0)];
      const Z = [sx(a), sy(b)];
      const Wp = [sx(c), sy(d)];
      const P = [sx(pa), sy(pb)];
      const arcs = mult && mod && Math.hypot(c, d) ? `${pth(arcD(O[0], O[1], 16, 0, ph), 'exc-p', 2)}${pth(arcD(O[0], O[1], 24, 0, argD(c, d)), 'exc-b', 2)}${pth(arcD(O[0], O[1], 32, 0, argD(pa, pb)), 'exc-o', 2)}` : '';
      return {
        svg: `${G}${T(312, sy(0) - 5, 'Re', 'm9 exm-mut ex-end')}${T(sx(0) + 5, 12, 'Im', 'm9 exm-mut ex-start')}${arcs}${mult ? '' : `${arrow(Z[0], Z[1], P[0], P[1], 'exc-b ex-faint', 2)}`}${arrow(O[0], O[1], Z[0], Z[1], 'exc-p')}${arrow(O[0], O[1], Wp[0], Wp[1], 'exc-b')}${arrow(O[0], O[1], P[0], P[1], 'exc-o', 3)}${hit('w', Wp[0], Wp[1], 14)}${dot(Wp[0], Wp[1], 4, 'exc-b')}
          ${T(8, 16, `z = ${zStr(a, b)}`, 'm11 tc exc-p ex-start h')}${T(8, 32, `w = ${zStr(c, d)}`, 'm11 tc exc-b ex-start h')}${T(8, 48, `z ${mult ? '·' : '+'} w = ${zStr(pa, pb)}`, 'm11 tc exc-o ex-start h')}${T(Wp[0] + 6, Wp[1] - 6, 'w', 'm11 tc exc-b ex-start h')}`,
        caption: mult
          ? L(
              `(${zStr(a, b)})(${zStr(c, d)}) = ${fmt(a)}·${pn(c)} − ${pn(b)}·${pn(d)} + (${fmt(a)}·${pn(d)} + ${pn(b)}·${pn(c)})i = ${zStr(pa, pb)}. Lengths multiply: ${fmt(mod)}·${fmt(Math.hypot(c, d))} = ${fmt(Math.hypot(pa, pb))}; angles add: ${fmt(ph, 0)}° + ${fmt(argD(c, d), 0)}° = ${fmt(argD(pa, pb), 0)}° (mod 360°). Drag w.`,
              `(${zStr(a, b)})(${zStr(c, d)}) = ${fmt(a)}·${pn(c)} − ${pn(b)}·${pn(d)} + (${fmt(a)}·${pn(d)} + ${pn(b)}·${pn(c)})i = ${zStr(pa, pb)}, ведь i² = −1. Длины перемножаются: ${fmt(mod)}·${fmt(Math.hypot(c, d))} = ${fmt(Math.hypot(pa, pb))}; углы складываются: ${fmt(ph, 0)}° + ${fmt(argD(c, d), 0)}° = ${fmt(argD(pa, pb), 0)}° (с точностью до 360°). Перетаскивай w.`,
              `(${zStr(a, b)})(${zStr(c, d)}) = ${fmt(a)}·${pn(c)} − ${pn(b)}·${pn(d)} + (${fmt(a)}·${pn(d)} + ${pn(b)}·${pn(c)})i = ${zStr(pa, pb)}, өйткені i² = −1. Ұзындықтар көбейеді: ${fmt(mod)}·${fmt(Math.hypot(c, d))} = ${fmt(Math.hypot(pa, pb))}; бұрыштар қосылады: ${fmt(ph, 0)}° + ${fmt(argD(c, d), 0)}° = ${fmt(argD(pa, pb), 0)}° (360°-қа дейінгі дәлдікпен). w-ны сүйре.`,
            )
          : L(`Add real parts and imaginary parts: (${fmt(a)} + ${pn(c)}) + (${fmt(b)} + ${pn(d)})i = ${zStr(pa, pb)} - like adding vectors. Drag w.`, `Складываем отдельно действительные и мнимые части: (${fmt(a)} + ${pn(c)}) + (${fmt(b)} + ${pn(d)})i = ${zStr(pa, pb)} - как сложение векторов. Перетаскивай w.`, `Нақты және жорамал бөліктерді бөлек қосамыз: (${fmt(a)} + ${pn(c)}) + (${fmt(b)} + ${pn(d)})i = ${zStr(pa, pb)} - векторларды қосу сияқты. w-ны сүйре.`),
      };
    }
    const G = grid({ x0: -8, x1: 8, y0: -5.5, y1: 5.5, lab: 2, ylab: 2 }).svg;
    const sx = (x) => 160 + x * 20;
    const sy = (y) => 110 - y * 20;
    const Z = [sx(a), sy(b)];
    const base = `${G}${T(312, sy(0) - 5, 'Re', 'm9 exm-mut ex-end')}${T(sx(0) + 5, 12, 'Im', 'm9 exm-mut ex-start')}${st.m === 3 ? '' : `${dot(sx(a), sy(-b), 3.5, 'exc-m')}${ln(Z[0], Z[1], sx(a), sy(-b), 'exc-m ex-dash', 1)}${T(sx(a) + 6, sy(-b) + 12, 'z̄', 'm10 exm-mut ex-start h')}`}${ln(Z[0], Z[1], Z[0], sy(0), 'exc-k ex-dash', 1.2)}${ln(sx(0), sy(0), Z[0], sy(0), 'exc-g', 3)}${mod ? pth(arcD(sx(0), sy(0), 18, 0, ph), 'exc-o', 2) : ''}${arrow(sx(0), sy(0), Z[0], Z[1], 'exc-p')}${dot(Z[0], Z[1], 4, 'exc-p')}`;
    const tf = `${fmt(mod)}(cos ${fmt(ph, 0)}° + i·sin ${fmt(ph, 0)}°)`;
    if (st.m === 3) {
      const tk = st.task ?? (cxTask(st), st.task);
      const ok = check(st, tk.type === 0 ? near(mod, 5, 1e-6) && near(a, tk.re, 1e-6) : near(a, tk.re, 1e-6) && near(b, tk.im, 1e-6));
      const ask = [
        L(`Find z with |z| = 5 and Re z = ${fmt(tk.re)}.`, `Найди z, у которого |z| = 5 и Re z = ${fmt(tk.re)}.`, `|z| = 5 және Re z = ${fmt(tk.re)} болатын z тап.`),
        L(`Set the conjugate of ${zStr(tk.from?.[0] ?? 0, tk.from?.[1] ?? 0)}.`, `Поставь число, сопряжённое к ${zStr(tk.from?.[0] ?? 0, tk.from?.[1] ?? 0)}.`, `${zStr(tk.from?.[0] ?? 0, tk.from?.[1] ?? 0)} санына түйіндес санды қой.`),
        L(`Find z: z · i = ${zStr(-tk.im, tk.re)}.`, `Найди z: z · i = ${zStr(-tk.im, tk.re)}.`, `z-ті тап: z · i = ${zStr(-tk.im, tk.re)}.`),
      ][tk.type];
      const hint = [
        L(`Now |z| = ${fmt(mod)}. Hint: a² + b² = 25.`, `Сейчас |z| = ${fmt(mod)}. Подсказка: a² + b² = 25.`, `Қазір |z| = ${fmt(mod)}. Кеңес: a² + b² = 25.`),
        L('Hint: the conjugate keeps a and changes the sign of b - a mirror in the Re axis.', 'Подсказка: у сопряжённого то же a, а знак b противоположный - отражение относительно оси Re.', 'Кеңес: түйіндесте a сол, b-ның таңбасы қарама-қарсы - Re осіне қатысты бейне.'),
        L(`Now z · i = ${zStr(-b, a)}. Hint: × i turns by 90°, so turn back by 90°.`, `Сейчас z · i = ${zStr(-b, a)}. Подсказка: × i поворачивает на 90°, значит поверни обратно на 90°.`, `Қазір z · i = ${zStr(-b, a)}. Кеңес: × i 90°-қа бұрады, демек кері 90°-қа бұр.`),
      ][tk.type];
      return { svg: `${base}${T(8, 16, `z = ${zStr(a, b)}`, 'm12 tc exc-p ex-start h')}${badge(tk.tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }
    return {
      svg: `${base}${T(8, 16, `z = ${zStr(a, b)}`, 'm12 tc exc-p ex-start h')}${T(8, 34, `|z| = √(${pn(a)}² + ${pn(b)}²) = ${fmt(mod)}`, 'm11 ex-start h')}${T(8, 52, `arg z = ${fmt(ph, 1)}°`, 'm11 tc exc-o ex-start h')}${mod ? T(8, 212, `z = ${tf}`, 'm10 ex-start h') : ''}`,
      caption: J(
        L(`z = ${zStr(a, b)} is the point (${fmt(a)}; ${fmt(b)}): real part on Re (green), imaginary on Im. |z| = ${fmt(mod)}, the angle arg z = ${fmt(ph, 1)}°.`, `z = ${zStr(a, b)} - точка (${fmt(a)}; ${fmt(b)}): действительная часть по оси Re (зелёная), мнимая - по Im. |z| = ${fmt(mod)}, угол arg z = ${fmt(ph, 1)}°.`, `z = ${zStr(a, b)} - (${fmt(a)}; ${fmt(b)}) нүктесі: нақты бөлігі Re осі бойынша (жасыл), жорамал - Im бойынша. |z| = ${fmt(mod)}, arg z = ${fmt(ph, 1)}°.`),
        L('"× i" turns z by 90°; i² = −1 means two turns = 180°. The grey point is the conjugate z̄.', '«× i» поворачивает z на 90°; i² = −1 - два поворота дают 180°. Серая точка - сопряжённое z̄.', '«× i» z-ті 90°-қа бұрады; i² = −1 - екі бұрылыс 180° береді. Сұр нүкте - түйіндес z̄.'),
      ),
    };
  },
});

// ---------- Предел ----------

const SEQS = [
  { a: (n) => 1 / n, L: 0, s: '1/n', y0: -0.2, y1: 1.1 },
  { a: (n) => (n + 1) / n, L: 1, s: '(n + 1)/n', y0: 0.8, y1: 2.1 },
  { a: (n) => (1 + 1 / n) ** n, L: Math.E, s: '(1 + 1/n)ⁿ', y0: 1.9, y1: 2.9 },
  { a: (n) => (-1) ** n / n, L: 0, s: '(−1)ⁿ/n', y0: -1.1, y1: 0.7 },
  { a: (n) => (2 * n + 1) / (n + 3), L: 2, s: '(2n + 1)/(n + 3)', y0: 0.6, y1: 2.2 },
  { a: (n) => (-1) ** n, L: null, s: '(−1)ⁿ', y0: -1.4, y1: 1.4 },
];
const FUNL = [
  { f: (x) => (x * x - 1) / (x - 1), p: 1, L: 2, s: '(x² − 1)/(x − 1)', x0: -1, x1: 3, y0: -0.5, y1: 4.5 },
  { f: (x) => Math.sin(x) / x, p: 0, L: 1, s: 'sin x / x', x0: -6, x1: 6, y0: -0.4, y1: 1.3 },
  { f: (x) => (Math.sqrt(x + 1) - 1) / x, p: 0, L: 0.5, s: '(√(x + 1) − 1)/x', x0: -0.9, x1: 3, y0: 0, y1: 1.2 },
  { f: (x) => Math.abs(x) / x, p: 0, L: null, s: '|x| / x', x0: -2, x1: 2, y0: -1.6, y1: 1.6 },
];
/** Номер, начиная с которого все члены в полосе L ± eps (проверяем до 5000). */
function bandN(S, eps) {
  let last = 0;
  for (let n = 1; n <= 5000; n++) if (Math.abs(S.a(n) - S.L) >= eps) last = n;
  return last + 1;
}

function limTask(st) {
  const opts = [[0, 0.1], [0, 0.05], [1, 0.2], [1, 0.04], [4, 0.5], [4, 0.25], [3, 0.1], [0, 0.2]];
  let i;
  do i = rnd(0, opts.length - 1);
  while (st.task && st.task.i === i);
  const [si, eps] = opts[i];
  st.task = { i, si, eps, N: bandN(SEQS[si], eps), done: false };
  st.si = si;
  return { n: 1, eps };
}

const limit = modes({
  title: L('Limits', 'Пределы', 'Шектер'),
  intro: L('L is the limit if the values get as close to L as you like: for any band L ± ε, from some point on all values stay inside.', 'L - предел, если значения подходят к L сколь угодно близко: для любой полосы L ± ε с какого-то места все значения остаются внутри.', 'Мәндер L-ге қалағанша жақындаса, L - шек: кез келген L ± ε жолағы үшін бір орыннан бастап барлық мәндер ішінде қалады.'),
  sliders: [
    { id: 'n', label: 'n', min: 1, max: 100, value: 20 },
    { id: 'eps', label: 'ε', min: 0.02, max: 0.5, step: 0.01, value: 0.2, hidden: (v, st) => st.m === 1 },
  ],
  tabs: [L('Sequence', 'Последовательность', 'Тізбек'), L('Function', 'Функция', 'Функция'), TASK],
  acts: [{ label: L('Example ↻', 'Пример ↻', 'Мысал ↻'), only: [0, 1] }, { label: MORE, only: [2] }],
  state: () => ({ si: 0, fi: 0 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return limTask(st);
    if (m === 2) st.si = st.task.si;
    return null;
  },
  onAct(j, st) {
    if (j === 1) return limTask(st);
    if (st.m === 0) st.si = (st.si + 1) % SEQS.length;
    else st.fi = (st.fi + 1) % FUNL.length;
    return null;
  },
  draw(v, step, st) {
    const n = Math.round(v.n);
    if (st.m === 1) {
      const F = FUNL[st.fi];
      const G = grid({ x0: F.x0, x1: F.x1, y0: F.y0, y1: F.y1, lab: F.x1 > 4 ? 2 : 1, ylab: F.y1 > 2 ? 1 : 0.5, step: F.x1 > 4 ? 1 : 0.5, ystep: F.y1 > 2 ? 1 : 0.25 });
      const { sx, sy } = G;
      const h = (F.x1 - F.x0) / 4 / n;
      const xl = F.p - h;
      const xr = F.p + h;
      const yl = F.f(xl);
      const yr = F.f(xr);
      const curveL = pth(plotClip(F.f, F.x0, F.p - 1e-6, sx, sy, -5, H + 5), 'exc-p', 3);
      const curveR = pth(plotClip(F.f, F.p + 1e-6, F.x1, sx, sy, -5, H + 5), 'exc-p', 3);
      const hole = F.L !== null ? ring(sx(F.p), sy(F.L), 5, 'exc-p', 2.5) : `${ring(sx(F.p), sy(F.f(F.p - 1e-6)), 5, 'exc-p', 2.5)}${ring(sx(F.p), sy(F.f(F.p + 1e-6)), 5, 'exc-p', 2.5)}`;
      return {
        svg: `${G.svg}${curveL}${curveR}${hole}${ln(sx(xl), sy(0), sx(xl), sy(yl), 'exc-o ex-dash', 1)}${ln(sx(xr), sy(0), sx(xr), sy(yr), 'exc-b ex-dash', 1)}${dot(sx(xl), sy(yl), 5, 'exc-o')}${dot(sx(xr), sy(yr), 5, 'exc-b')}
          ${T(8, 16, `f(x) = ${F.s}`, 'm11 ex-start h')}${T(312, 16, `f(${fmt(xl, 3)}) = ${fmt(yl, 4)}`, 'm10 tc exc-o ex-end h')}${T(312, 32, `f(${fmt(xr, 3)}) = ${fmt(yr, 4)}`, 'm10 tc exc-b ex-end h')}${F.L !== null ? T(312, 48, `lim = ${fmt(F.L)}`, 'm12 tc exc-p ex-end h') : ''}`,
        caption: F.L !== null
          ? L(`x → ${F.p}: the points x = ${fmt(xl, 3)} and ${fmt(xr, 3)} come from both sides (move n), and f(x) gets close to ${fmt(F.L)}. At x = ${F.p} itself f is not defined (empty circle), but the limit exists: ${fmt(F.L)}.${st.fi === 0 ? ' Indeed (x² − 1)/(x − 1) = x + 1 for x ≠ 1.' : ''}`, `x → ${F.p}: точки x = ${fmt(xl, 3)} и ${fmt(xr, 3)} подходят с обеих сторон (двигай n), а f(x) приближается к ${fmt(F.L)}. В самой точке x = ${F.p} функция не определена (пустой кружок), но предел есть: ${fmt(F.L)}.${st.fi === 0 ? ' Ведь (x² − 1)/(x − 1) = x + 1 при x ≠ 1.' : ''}`, `x → ${F.p}: x = ${fmt(xl, 3)} және ${fmt(xr, 3)} нүктелері екі жақтан жақындайды (n-ді жылжыт), ал f(x) ${fmt(F.L)}-ге жақындайды. x = ${F.p} нүктесінің өзінде функция анықталмаған (бос дөңгелек), бірақ шегі бар: ${fmt(F.L)}.${st.fi === 0 ? ' Себебі x ≠ 1 болғанда (x² − 1)/(x − 1) = x + 1.' : ''}`)
          : L(`From the left f → −1, from the right f → 1. The one-sided limits differ, so there is no limit at 0.`, `Слева f → −1, справа f → 1. Односторонние пределы разные, поэтому предела в точке 0 нет.`, `Сол жақтан f → −1, оң жақтан f → 1. Бір жақты шектер әртүрлі, сондықтан 0 нүктесінде шек жоқ.`),
      };
    }
    const tk = st.m === 2 ? (st.task ?? (limTask(st), st.task)) : null;
    const S = SEQS[tk ? tk.si : st.si];
    const eps = tk ? tk.eps : v.eps;
    const M = Math.max(10, n);
    const G = grid({ x0: 0, x1: M * 1.04, y0: S.y0, y1: S.y1, X0: 22, X1: 314, Y0: 6, Y1: 210, step: M > 50 ? 10 : M > 20 ? 5 : 1, lab: M > 50 ? 20 : M > 20 ? 10 : 2, ystep: 0.1, ylab: S.y1 - S.y0 > 1.5 ? 0.5 : 0.2 });
    const { sx, sy } = G;
    const Nb = S.L !== null ? bandN(S, eps) : Infinity;
    let dots = '';
    for (let i = 1; i <= n; i++) {
      const y = S.a(i);
      const inb = S.L !== null && Math.abs(y - S.L) < eps;
      dots += `<circle class="ex-fill ${inb ? 'exc-g' : 'exc-r'}" cx="${n1(sx(i))}" cy="${n1(clamp(sy(y), 0, H))}" r="${n > 60 ? 1.8 : n > 30 ? 2.4 : 3.2}"/>`;
    }
    const band = S.L !== null ? `${soft(22, sy(S.L + eps), 292, sy(S.L - eps) - sy(S.L + eps), 'exc-g', 0)}${ln(22, sy(S.L), 314, sy(S.L), 'exc-o ex-dash', 1.5)}${T(312, sy(S.L) - 4, `L = ${fmt(S.L, 3)}`, 'm10 tc exc-o ex-end h')}${Nb <= M ? `${ln(sx(Nb), 6, sx(Nb), 210, 'exc-p ex-dash', 1.2)}${T(sx(Nb) + 3, 20, `N = ${Nb}`, 'm10 tc exc-p ex-start h')}` : ''}` : '';
    const val = S.a(n);
    const head = `${T(30, 18, `aₙ = ${S.s}`, 'm11 ex-start h')}${T(30, 34, `a${sub(n)} = ${fmt(val, 4)}`, 'm10 ex-start h')}`;
    if (tk) {
      const ok = check(st, n === tk.N);
      return {
        svg: `${G.svg}${band.replace(/N = \d+/, 'N = ?').replace(/<line[^>]*exc-p ex-dash[^>]*>/, '')}${dots}${head}${badge(`ε = ${fmt(eps)}: N = ?`, ok)}`,
        caption: taskCap(
          st,
          ok,
          L(`aₙ = ${S.s}, ε = ${fmt(eps)}. Find the smallest N from which all terms are inside the band L ± ε. Set n = N.`, `aₙ = ${S.s}, ε = ${fmt(eps)}. Найди наименьший N, начиная с которого все члены внутри полосы L ± ε. Поставь n = N.`, `aₙ = ${S.s}, ε = ${fmt(eps)}. Барлық мүшелер L ± ε жолағында болатын ең кіші N-ді тап. n = N қой.`),
          L(`Now n = ${n}: |a${sub(n)} − L| = ${fmt(Math.abs(val - S.L), 4)} ${Math.abs(val - S.L) < eps ? '<' : '≥'} ε. Solve |aₙ − L| < ε.`, `Сейчас n = ${n}: |a${sub(n)} − L| = ${fmt(Math.abs(val - S.L), 4)} ${Math.abs(val - S.L) < eps ? '<' : '≥'} ε. Реши |aₙ − L| < ε.`, `Қазір n = ${n}: |a${sub(n)} − L| = ${fmt(Math.abs(val - S.L), 4)} ${Math.abs(val - S.L) < eps ? '<' : '≥'} ε. |aₙ − L| < ε шеш.`),
        ),
      };
    }
    return {
      svg: `${G.svg}${band}${dots}${head}`,
      caption: S.L === null
        ? L('(−1)ⁿ jumps between −1 and 1 forever: no band around a single number catches all terms - there is no limit.', '(−1)ⁿ вечно прыгает между −1 и 1: ни одна узкая полоса вокруг одного числа не поймает все члены - предела нет.', '(−1)ⁿ −1 мен 1 арасында мәңгі секіреді: бір санның айналасындағы ешбір тар жолақ барлық мүшені ұстамайды - шек жоқ.')
        : L(
            `a${sub(n)} = ${fmt(val, 4)}, distance to L = ${fmt(S.L, 3)} is ${fmt(Math.abs(val - S.L), 4)}. For ε = ${fmt(eps)} all terms from N = ${Nb} on are inside the green band. Make ε smaller - N grows, but it always exists: that is the limit.`,
            `a${sub(n)} = ${fmt(val, 4)}, до L = ${fmt(S.L, 3)} осталось ${fmt(Math.abs(val - S.L), 4)}. Для ε = ${fmt(eps)} все члены, начиная с N = ${Nb}, в зелёной полосе. Уменьши ε - N вырастет, но он всегда найдётся: это и есть предел.`,
            `a${sub(n)} = ${fmt(val, 4)}, L = ${fmt(S.L, 3)}-ге дейін ${fmt(Math.abs(val - S.L), 4)} қалды. ε = ${fmt(eps)} үшін N = ${Nb}-ден бастап барлық мүшелер жасыл жолақта. ε-ны кішірейт - N өседі, бірақ ол әрқашан табылады: бұл шек.`,
          ),
    };
  },
});

// ---------- Матрицы ----------

const MX_PRE = [
  { a: 1, b: 0, c: 0, d: 1 },
  { a: 0, b: -1, c: 1, d: 0 },
  { a: -1, b: 0, c: 0, d: 1 },
  { a: 1, b: 1, c: 0, d: 1 },
  { a: 2, b: 0, c: 0, d: 0.5 },
  { a: 1, b: 2, c: 0.5, d: 1 },
];
const MX_TASKS = [
  { M: { a: 0, b: -1, c: 1, d: 0 }, t: L('Rotate the plane by 90° counterclockwise.', 'Поверни плоскость на 90° против часовой стрелки.', 'Жазықтықты сағат тіліне қарсы 90°-қа бұр.') },
  { M: { a: -1, b: 0, c: 0, d: 1 }, t: L('Mirror the plane in the y-axis.', 'Отрази плоскость относительно оси y.', 'Жазықтықты y осіне қатысты шағылыстыр.') },
  { M: { a: 2, b: 0, c: 0, d: 2 }, t: L('Stretch everything 2 times from the origin.', 'Растяни всё в 2 раза от начала координат.', 'Бәрін координаттар басынан 2 есе соз.') },
  { M: { a: 1, b: 0, c: 0, d: -1 }, t: L('Mirror the plane in the x-axis.', 'Отрази плоскость относительно оси x.', 'Жазықтықты x осіне қатысты шағылыстыр.') },
  { det: 0, t: L('Make a matrix with det = 0, but not all zeros.', 'Сделай матрицу с det = 0, но не нулевую.', 'det = 0, бірақ нөлдік емес матрица жаса.') },
  { det: -2, t: L('Make a matrix with det = −2.', 'Сделай матрицу с det = −2.', 'det = −2 болатын матрица жаса.') },
];
function mxTask(st) {
  let i;
  do i = rnd(0, MX_TASKS.length - 1);
  while (st.task && st.task.i === i);
  st.task = { i, ...MX_TASKS[i], done: false };
  return { a: 1, b: 0, c: 0, d: 1 };
}
const mxStr = (v) => `(${fmt(v.a)} ${fmt(v.b)} | ${fmt(v.c)} ${fmt(v.d)})`;

const matrix = modes({
  title: L('A matrix transforms the plane', 'Матрица преобразует плоскость', 'Матрица жазықтықты түрлендіреді'),
  intro: L('A 2×2 matrix sends (1; 0) to its first column and (0; 1) to its second. The whole grid follows; the area changes det times.', 'Матрица 2×2 переводит (1; 0) в свой первый столбец, а (0; 1) - во второй. Вся сетка следует за ними; площадь меняется в det раз.', '2×2 матрица (1; 0)-ді бірінші бағанына, (0; 1)-ді екіншісіне апарады. Бүкіл тор соларға ереді; аудан det есе өзгереді.'),
  sliders: [
    { id: 'a', label: 'a', min: -2, max: 2, step: 0.5, value: 1.5 },
    { id: 'b', label: 'b', min: -2, max: 2, step: 0.5, value: 0.5 },
    { id: 'c', label: 'c', min: -2, max: 2, step: 0.5, value: 0 },
    { id: 'd', label: 'd', min: -2, max: 2, step: 0.5, value: 1 },
  ],
  values: { vx: 1, vy: 1 },
  tabs: [L('Transform', 'Преобразование', 'Түрлендіру'), 'A · v', 'det', TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return mxTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return mxTask(st);
    st.pre = (st.pre + 1) % MX_PRE.length;
    return MX_PRE[st.pre];
  },
  onDrag(key, p, v) {
    v.vx = clamp(Math.round(((p.x - 160) / 30) * 2) / 2, -4, 4);
    v.vy = clamp(Math.round(((110 - p.y) / 30) * 2) / 2, -3, 3);
  },
  draw(v, step, st) {
    const { a, b, c, d } = v;
    const sx = (x) => 160 + x * 30;
    const sy = (y) => 110 - y * 30;
    const M = (x, y) => [a * x + b * y, c * x + d * y];
    const det = a * d - b * c;
    let g = grid({ x0: -5.4, x1: 5.4, y0: -3.7, y1: 3.7, labels: false }).svg;
    // образ сетки
    for (let k = -4; k <= 4; k++) {
      const p1 = M(k, -6);
      const p2 = M(k, 6);
      const q1 = M(-6, k);
      const q2 = M(6, k);
      g += ln(sx(p1[0]), sy(p1[1]), sx(p2[0]), sy(p2[1]), 'exc-p ex-faint', k ? 0.4 : 1) + ln(sx(q1[0]), sy(q1[1]), sx(q2[0]), sy(q2[1]), 'exc-p ex-faint', k ? 0.4 : 1);
    }
    const sq = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const img = sq.map(([x, y]) => M(x, y)).map(([x, y]) => [sx(x), sy(y)]);
    // буква F - видно отражение
    const Fp = [[0, 0], [0, 2], [1.2, 2], [1.2, 1.6], [0.4, 1.6], [0.4, 1.2], [1, 1.2], [1, 0.8], [0.4, 0.8], [0.4, 0]].map(([x, y]) => [x - 3.5, y - 1]);
    const F1 = Fp.map(([x, y]) => [sx(x), sy(y)]);
    const F2 = Fp.map(([x, y]) => M(x, y)).map(([x, y]) => [sx(x), sy(y)]);
    const cols = `${arrow(sx(0), sy(0), sx(a), sy(c), 'exc-o', 2.8)}${arrow(sx(0), sy(0), sx(b), sy(d), 'exc-b', 2.8)}`;
    const head = `${T(8, 18, `A = ${mxStr(v)}`, 'm11 ex-start h')}${T(8, 36, `det = ${fmt(a)}·${pn(d)} − ${pn(b)}·${pn(c)} = ${fmt(det)}`, 'm11 ex-start h')}`;
    if (st.m === 1) {
      const { vx, vy } = v;
      const [wx, wy] = M(vx, vy);
      return {
        svg: `${g}${poly(img, 'exc-p', 0.15)}${arrow(sx(0), sy(0), sx(vx * a), sy(vx * c), 'exc-o ex-faint', 2)}${arrow(sx(vx * a), sy(vx * c), sx(wx), sy(wy), 'exc-b ex-faint', 2)}${arrow(sx(0), sy(0), sx(vx), sy(vy), 'exc-g', 2.8)}${arrow(sx(0), sy(0), sx(wx), sy(wy), 'exc-k', 3)}${hit('v', sx(vx), sy(vy), 14)}${dot(sx(vx), sy(vy), 4, 'exc-g')}
          ${T(8, 18, `(${fmt(a)} ${fmt(b)}) (${fmt(vx)})   (${fmt(a)}·${pn(vx)} + ${fmt(b)}·${pn(vy)})   (${fmt(wx)})`, 'm10 ex-start h')}${T(8, 34, `(${fmt(c)} ${fmt(d)}) (${fmt(vy)}) = (${fmt(c)}·${pn(vx)} + ${fmt(d)}·${pn(vy)}) = (${fmt(wy)})`, 'm10 ex-start h')}${T(sx(vx) + 6, sy(vy) - 6, 'v', 'm11 tc exc-g ex-start h')}${T(sx(wx) + 6, sy(wy) - 6, 'Av', 'm11 tc exc-k ex-start h')}`,
        caption: L(
          `A·v: each row times the column (${fmt(vx)}; ${fmt(vy)}) gives (${fmt(wx)}; ${fmt(wy)}). In the picture: ${fmt(vx)} steps along the first column (orange) and ${fmt(vy)} along the second (blue) - you reach Av. Drag v.`,
          `A·v: каждая строка умножается на столбец (${fmt(vx)}; ${fmt(vy)}) - получаем (${fmt(wx)}; ${fmt(wy)}). На картинке: ${fmt(vx)} шага по первому столбцу (оранжевый) и ${fmt(vy)} по второму (синий) - приходим в Av. Перетаскивай v.`,
          `A·v: әр жол (${fmt(vx)}; ${fmt(vy)}) бағанына көбейтіледі - (${fmt(wx)}; ${fmt(wy)}) шығады. Суретте: бірінші баған бойымен (қызғылт сары) ${fmt(vx)} қадам және екіншісімен (көк) ${fmt(vy)} қадам - Av-ге жетеміз. v-ны сүйре.`,
        ),
      };
    }
    const base = `${g}${poly(F1, 'exc-m', 0.25)}${poly(F2, 'exc-g', 0.55)}${poly(img, det < 0 ? 'exc-r' : 'exc-p', 0.35)}${cols}${head}`;
    if (st.m === 2) {
      return {
        svg: `${base}${T(sx((a + b) / 2), sy((c + d) / 2) + 4, `S = ${fmt(Math.abs(det))}`, 'm11 h')}`,
        caption: Math.abs(det) < 1e-9
          ? L('det = 0: the square is squashed into a segment or a point - the area is 0 and the matrix has no inverse.', 'det = 0: квадрат сплющен в отрезок или точку - площадь 0, обратной матрицы нет.', 'det = 0: шаршы кесіндіге не нүктеге жаншылды - аудан 0, кері матрица жоқ.')
          : L(
              `The unit square (area 1) becomes a parallelogram with area |det| = |ad − bc| = ${fmt(Math.abs(det))}. ${det < 0 ? 'det < 0: the plane is flipped - look at the letter F (red square).' : 'det > 0: the orientation is kept.'}`,
              `Единичный квадрат (площадь 1) стал параллелограммом площадью |det| = |ad − bc| = ${fmt(Math.abs(det))}. ${det < 0 ? 'det < 0: плоскость перевернулась - посмотри на букву F (красный квадрат).' : 'det > 0: ориентация сохранилась.'}`,
              `Бірлік шаршы (ауданы 1) ауданы |det| = |ad − bc| = ${fmt(Math.abs(det))} параллелограмға айналды. ${det < 0 ? 'det < 0: жазықтық аударылды - F әрпіне қара (қызыл шаршы).' : 'det > 0: бағдар сақталды.'}`,
            ),
      };
    }
    if (st.m === 3) {
      const tk = st.task ?? (mxTask(st), st.task);
      const ok = check(st, tk.M ? ['a', 'b', 'c', 'd'].every((k) => near(v[k], tk.M[k], 1e-6)) : near(det, tk.det, 1e-6) && (a || b || c || d));
      return {
        svg: `${base}${badge(tk.M ? u('columns = images', 'столбцы = образы', 'бағандар = бейнелер') : `det = ${fmt(tk.det)}`, ok)}`,
        caption: taskCap(st, ok, tk.t, L('Hint: where must (1; 0) go (first column) and where (0; 1) (second column)?', 'Подсказка: куда должен перейти (1; 0) (первый столбец) и куда (0; 1) (второй столбец)?', 'Кеңес: (1; 0) қайда кетуі керек (бірінші баған) және (0; 1) қайда (екінші баған)?')),
      };
    }
    return {
      svg: base,
      caption: L(
        `Orange arrow = first column (${fmt(a)}; ${fmt(c)}) = image of (1; 0), blue = second column (${fmt(b)}; ${fmt(d)}) = image of (0; 1). The purple grid and the green letter F show where everything goes. Press "Another" for rotation, mirror, shear, stretch.`,
        `Оранжевая стрелка - первый столбец (${fmt(a)}; ${fmt(c)}) = образ (1; 0), синяя - второй (${fmt(b)}; ${fmt(d)}) = образ (0; 1). Фиолетовая сетка и зелёная буква F показывают, куда переходит всё остальное. «Ещё» - поворот, отражение, сдвиг, растяжение.`,
        `Қызғылт сары нұсқар - бірінші баған (${fmt(a)}; ${fmt(c)}) = (1; 0) бейнесі, көгі - екінші баған (${fmt(b)}; ${fmt(d)}) = (0; 1) бейнесі. Күлгін тор мен жасыл F әрпі қалғанының бәрі қайда кететінін көрсетеді. «Тағы» - бұру, шағылыстыру, ығысу, созу.`,
      ),
    };
  },
});

// ---------- Задачи на совместную работу (новая сцена) ----------

const WORK_T = [[6, 3, 0], [4, 12, 0], [10, 15, 0], [6, 12, 0], [2, 6, 0], [3, 12, 0], [6, 6, 0], [5, 20, 0], [3, 6, 1], [4, 12, 1], [2, 3, 1], [6, 12, 1]];

function workTask(st) {
  let i;
  do i = rnd(0, WORK_T.length - 1);
  while (st.task && st.task.i === i);
  const [t1, t2, drain] = WORK_T[i];
  const T0 = drain ? (t1 * t2) / (t2 - t1) : (t1 * t2) / (t1 + t2);
  st.task = { i, t1, t2, drain, T0, done: false };
  return { t1, t2, t: 0 };
}

const work = modes({
  title: L('Work problems: two pipes', 'Задачи на работу: две трубы', 'Жұмысқа берілген есептер: екі құбыр'),
  intro: L('The whole job is 1. If a pipe fills the pool in t hours, it does 1/t of it per hour. Working together, the rates add.', 'Вся работа - это 1. Если труба наполняет бассейн за t часов, за час она делает 1/t. При совместной работе производительности складываются.', 'Барлық жұмыс - 1. Құбыр бассейнді t сағатта толтырса, сағатына 1/t бөлігін орындайды. Бірге жұмыс істегенде өнімділіктер қосылады.'),
  sliders: [
    { id: 't1', label: L('pipe A alone, h', 'труба A одна, ч', 'A құбыры жалғыз, сағ'), min: 1, max: 12, value: 6, hidden: (v, st) => st.m === 2 },
    { id: 't2', label: L('pipe B alone, h', 'труба B одна, ч', 'B құбыры жалғыз, сағ'), min: 1, max: 12, value: 3, hidden: (v, st) => st.m === 2 },
    { id: 't', label: L('time, h', 'время, ч', 'уақыт, сағ'), min: 0, max: 12, step: 0.1, value: 0 },
  ],
  tabs: [L('Together', 'Вместе', 'Бірге'), L('Fill and drain', 'Наполнение и слив', 'Толтыру және ағызу'), TASK],
  acts: [{ label: PLAY, only: [0, 1] }, { label: MORE }],
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return workTask(st);
    return m === 1 ? { t: 0, t1: 3, t2: 6, $dur: 1 } : { t: 0, $dur: 1 };
  },
  onAct(j, st, v, api) {
    if (j === 0) {
      api.play('t', { dur: 6000, linear: true });
      return null;
    }
    if (st.m === 2) return workTask(st);
    return st.m === 1 ? pick([{ t1: 3, t2: 6 }, { t1: 4, t2: 12 }, { t1: 2, t2: 3 }, { t1: 6, t2: 12 }]) : pick([{ t1: 6, t2: 3 }, { t1: 4, t2: 4 }, { t1: 10, t2: 15 }, { t1: 2, t2: 6 }, { t1: 3, t2: 12 }]);
  },
  draw(v, step, st) {
    const tk = st.m === 2 ? (st.task ?? (workTask(st), st.task)) : null;
    const t1 = tk ? tk.t1 : Math.round(v.t1);
    const t2 = tk ? tk.t2 : Math.round(v.t2);
    const drain = tk ? tk.drain : st.m === 1;
    const t = v.t;
    const r = 1 / t1 + (drain ? -1 / t2 : 1 / t2);
    const T0 = r > 1e-9 ? 1 / r : Infinity;
    const lvl = clamp(r * t, 0, 1);
    const hU = ui.h();
    // бассейн
    const X0 = 22;
    const Y0 = 78;
    const Wp = 120;
    const Hp = 110;
    const wy = Y0 + Hp * (1 - lvl);
    let g = `${box(X0, wy, Wp, Y0 + Hp - wy, 'exc-b', 2, 0.45)}<path class="ex-stroke exc-m" style="stroke-width:2.5;fill:none" d="M${X0} ${Y0 - 6} V${Y0 + Hp} H${X0 + Wp} V${Y0 - 6}"/>`;
    for (let k = 1; k < 4; k++) g += ln(X0 + Wp, Y0 + (Hp * k) / 4, X0 + Wp + 5, Y0 + (Hp * k) / 4, 'exc-m', 1) + T(X0 + Wp + 7, Y0 + (Hp * k) / 4 + 3, `${4 - k}/4`, 'm9 exm-mut ex-start');
    // трубы
    const flow = t > 0 && lvl < 1;
    g += `${box(X0 + 10, 40, 40, 10, 'exc-o', 3)}${box(X0 + 44, 40, 8, 26, 'exc-o', 2)}${flow ? box(X0 + 45, 66, 6, wy - 66, 'exc-o', 2, 0.5) : ''}${T(X0 + 30, 34, `A: 1/${t1}`, 'm10 tc exc-o')}`;
    if (drain) g += `${box(X0 + Wp - 12, Y0 + Hp - 2, 8, 16, 'exc-r', 2)}${box(X0 + Wp - 12, Y0 + Hp + 10, 36, 8, 'exc-r', 3)}${T(X0 + Wp + 8, Y0 + Hp + 30, `B: −1/${t2}`, 'm10 tc exc-r')}`;
    else g += `${box(X0 + 70, 40, 40, 10, 'exc-g', 3)}${box(X0 + 70, 40, 8, 26, 'exc-g', 2)}${flow ? box(X0 + 71, 66, 6, wy - 66, 'exc-g', 2, 0.5) : ''}${T(X0 + 90, 34, `B: 1/${t2}`, 'm10 tc exc-g')}`;
    g += T(X0 + Wp / 2, Y0 + Hp - 8, `${fmt(lvl * 100, 0)}%`, 'm12 h');
    // график
    const Tm = Number.isFinite(T0) ? Math.max(Math.ceil(T0 * 1.6), Math.ceil(t), 2) : 12;
    const gx = (x) => 178 + (x / Tm) * 132;
    const gy = (y) => 190 - y * 120;
    g += `${ln(178, 190, 312, 190, 'exc-m', 1.2)}${ln(178, 60, 178, 190, 'exc-m', 1.2)}${ln(178, gy(1), 312, gy(1), 'exc-m ex-dash', 1)}${T(174, gy(1) + 3, '1', 'm9 exm-mut ex-end')}${T(312, 204, `t, ${hU}`, 'm9 exm-mut ex-end')}`;
    const stp = Tm > 12 ? 4 : Tm > 6 ? 2 : 1;
    for (let k = stp; k < Tm; k += stp) g += ln(gx(k), 188, gx(k), 192, 'exc-m', 1) + T(gx(k), 202, k, 'm9 exm-mut');
    const lineR = (rate, cls, w) => pth(`M${gx(0)} ${gy(0)} L${n1(gx(Math.min(Tm, rate > 0 ? 1 / rate : Tm)))} ${n1(gy(clamp(rate * Math.min(Tm, rate > 0 ? 1 / rate : Tm), 0, 1)))}`, cls, w);
    g += lineR(1 / t1, 'exc-o ex-dash', 1.5) + (drain ? '' : lineR(1 / t2, 'exc-g ex-dash', 1.5)) + lineR(r, 'exc-b', 3);
    g += ln(gx(Math.min(t, Tm)), 60, gx(Math.min(t, Tm)), 190, 'exc-p', 1.2) + dot(gx(Math.min(t, Tm)), gy(lvl), 4, 'exc-b');
    if (Number.isFinite(T0) && T0 <= Tm) g += dot(gx(T0), gy(1), 5, 'exc-p') + T(gx(T0), gy(1) - 8, `${nice(T0, 12)} ${hU}`, 'm10 tc exc-p h');
    const rateS = drain ? `1/${t1} − 1/${t2} = ${frs(t2 - t1, t1 * t2)}` : `1/${t1} + 1/${t2} = ${frs(t1 + t2, t1 * t2)}`;
    g += T(8, 16, rateS, 'm11 ex-start');
    if (tk) {
      const ok = check(st, near(t, tk.T0, 0.051));
      return {
        svg: `${g}${badge('t = ?', ok)}`,
        caption: taskCap(
          st,
          ok,
          tk.drain
            ? L(`Pipe A fills the pool in ${t1} h, pipe B drains it in ${t2} h. Both are open: when is the pool full? Set the time.`, `Труба A наполняет бассейн за ${t1} ч, труба B сливает его за ${t2} ч. Открыты обе: когда бассейн наполнится? Установи время.`, `A құбыры бассейнді ${t1} сағатта толтырады, B құбыры ${t2} сағатта ағызады. Екеуі де ашық: бассейн қашан толады? Уақытты орнат.`)
            : L(`Pipe A fills the pool in ${t1} h, pipe B in ${t2} h. How long together? Set the time.`, `Труба A наполняет бассейн за ${t1} ч, труба B - за ${t2} ч. За сколько часов вместе? Установи время.`, `A құбыры бассейнді ${t1} сағатта, B - ${t2} сағатта толтырады. Бірге неше сағатта? Уақытты орнат.`),
          L(`Now ${fmt(lvl * 100, 0)}% is filled. Hint: rate together = ${rateS} of the pool per hour; time = 1 : rate.`, `Сейчас заполнено ${fmt(lvl * 100, 0)}%. Подсказка: вместе за час - ${rateS} бассейна; время = 1 : производительность.`, `Қазір ${fmt(lvl * 100, 0)}% толды. Кеңес: бірге сағатына - бассейннің ${rateS} бөлігі; уақыт = 1 : өнімділік.`),
        ),
      };
    }
    if (drain && r <= 1e-9)
      return {
        svg: g,
        caption: L(`The drain is not slower than the filling (1/${t2} ≥ 1/${t1}): the pool will never fill.`, `Слив не медленнее наполнения (1/${t2} ≥ 1/${t1}): бассейн никогда не наполнится.`, `Ағызу толтырудан баяу емес (1/${t2} ≥ 1/${t1}): бассейн ешқашан толмайды.`),
      };
    return {
      svg: g,
      caption: J(
        drain
          ? L(`Per hour A adds 1/${t1}, B takes away 1/${t2}: together ${rateS} of the pool. It fills in 1 : ${frs(t2 - t1, t1 * t2)} = ${nice(T0, 12)} h.`, `За час A наливает 1/${t1}, B сливает 1/${t2}: вместе ${rateS} бассейна. Наполнится за 1 : ${frs(t2 - t1, t1 * t2)} = ${nice(T0, 12)} ч.`, `Сағатына A 1/${t1} құяды, B 1/${t2} ағызады: бірге бассейннің ${rateS} бөлігі. 1 : ${frs(t2 - t1, t1 * t2)} = ${nice(T0, 12)} сағатта толады.`)
          : L(`Per hour A does 1/${t1}, B does 1/${t2}: together ${rateS} of the pool. Time together = 1 : ${frs(t1 + t2, t1 * t2)} = ${nice(T0, 12)} h - less than each pipe alone.`, `За час A делает 1/${t1}, B - 1/${t2}: вместе ${rateS} бассейна. Время вместе = 1 : ${frs(t1 + t2, t1 * t2)} = ${nice(T0, 12)} ч - меньше, чем у каждой трубы отдельно.`, `Сағатына A 1/${t1}, B 1/${t2} орындайды: бірге бассейннің ${rateS} бөлігі. Бірге уақыт = 1 : ${frs(t1 + t2, t1 * t2)} = ${nice(T0, 12)} сағ - әр құбырдың жалғыз уақытынан аз.`),
        L(`After ${fmt(t, 1)} h: ${fmt(lvl * 100, 0)}%.`, `Через ${fmt(t, 1)} ч: ${fmt(lvl * 100, 0)}%.`, `${fmt(t, 1)} сағаттан кейін: ${fmt(lvl * 100, 0)}%.`),
      ),
    };
  },
});

export const SCENES_MATH = {
  fractions,
  percent,
  linear,
  parabola,
  pythagoras,
  'unit-circle': unitCircle,
  probability,
  systems,
  progression,
  derivative,
  balance,
  motion,
  inequality,
  exponential,
  logarithm,
  'mean-median': meanMedian,
  combinatorics,
  tens,
  column,
  numline,
  areamul,
  decimals,
  ratio,
  sieve,
  angles,
  'circle-area': circleArea,
  vectors,
  volume,
  integral,
  complex,
  limit,
  matrix,
  work,
};
