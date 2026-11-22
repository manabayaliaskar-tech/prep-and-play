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

