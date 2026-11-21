// Общие помощники анимаций тем: размеры сцены, форматирование чисел, стрелки, графики, оси.
// Ими пользуются сцены в src/explain/scenes-*.js и страница анимации src/screens/explain.js.

import { getLang, tx } from '../core/i18n.js';
import { L } from '../pools/gen.js';
import { esc } from '../ui/dom.js';

const W = 320;
const H = 220;
const C = 0.01; // шаг непрерывных ползунков
const SVGNS = 'http://www.w3.org/2000/svg';
const reduced = () => Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
const n1 = (x) => Math.round(x * 10) / 10;
/** Число для показа: до d знаков, минус «−», в русском и казахском - десятичная запятая. */
const fmt = (x, d = 2) => {
  if (!Number.isFinite(x)) return '∞';
  const r = Math.round(x * 10 ** d) / 10 ** d;
  return String(r === 0 ? 0 : r)
    .replace('-', '−')
    .replace('.', getLang() === 'en' ? '.' : ',');
};
/** « + 3» / « − 3» для записи формул. */
const term = (x, d = 2) => (fmt(x, d).startsWith('−') ? ` − ${fmt(-x, d)}` : ` + ${fmt(x, d)}`);
/** Коэффициент перед x: 1 → «», −1 → «−». */
const coef = (k) => {
  const s = fmt(k);
  return s === '1' ? '' : s === '−1' ? '−' : s;
};
/** y = kx + b как текст. */
const lineEq = (k, b) => (fmt(k) === '0' ? `y = ${fmt(b)}` : `y = ${coef(k)}x${fmt(b) === '0' ? '' : term(b)}`);
const u = (en, ru, kk) => tx(L(en, ru, kk));
const hhmm = (h) => {
  const m = Math.round((((h % 24) + 24) % 24) * 60) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** Стрелка-вектор цвета cls (класс exc-*). */
function arrow(x1, y1, x2, y2, cls, w = 2.5, extra = '') {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const hs = Math.min(9, len * 0.45);
  const bx = x2 - ux * hs;
  const by = y2 - uy * hs;
  const s = hs * 0.55;
  return `<g class="${cls}"${extra}><line class="ex-stroke" style="stroke-width:${w}" x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(bx)}" y2="${n1(by)}"/><path class="ex-fill" d="M${n1(x2)} ${n1(y2)} L${n1(bx - uy * s)} ${n1(by + ux * s)} L${n1(bx + uy * s)} ${n1(by - ux * s)} Z"/></g>`;
}

/** Путь графика y = fn(x) на отрезке [a, b]. */
function plot(fn, a, b, sx, sy, n = 140) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    const y = fn(x);
    if (!Number.isFinite(y)) continue;
    d += `${d ? 'L' : 'M'}${n1(sx(x))} ${n1(clamp(sy(y), -80, H + 80))} `;
  }
  return d;
}

/** Сетка и оси координат. */
function axes(sx, sy, [x0, x1], [y0, y1]) {
  let g = '';
  for (let x = Math.ceil(x0); x <= x1; x++) g += `<line class="ex-grid" x1="${sx(x)}" y1="0" x2="${sx(x)}" y2="${H}"/>`;
  for (let y = Math.ceil(y0); y <= y1; y++) g += `<line class="ex-grid" x1="0" y1="${sy(y)}" x2="${W}" y2="${sy(y)}"/>`;
  return `${g}<line class="ex-axis" x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}"/><line class="ex-axis" x1="${sx(0)}" y1="0" x2="${sx(0)}" y2="${H}"/>`;
}

/** Ползунок: { id, label, min, max, step, value, show }. */
function slider(s, shown) {
  return `<label class="ex-slider"><span>${s.label}</span><input type="range" data-k="${s.id}" min="${s.min}" max="${s.max}" step="${s.step ?? 1}" value="${s.value}" aria-valuetext="${esc(shown)}"><b data-v="${s.id}">${esc(shown)}</b></label>`;
}

/** Обновить детей узла from так, чтобы они совпали с детьми to (без пересоздания одинаковых элементов). */
function morph(from, to) {
  const a = from.childNodes;
  const b = to.childNodes;
  for (let i = 0; i < b.length; i++) {
    const n = b[i];
    const o = a[i];
    if (!o) {
      from.appendChild(n.cloneNode(true));
      continue;
    }
    if (o.nodeType !== n.nodeType || o.nodeName !== n.nodeName || (n.nodeType === 1 && n.getAttribute('data-key') !== o.getAttribute('data-key'))) {
      from.replaceChild(n.cloneNode(true), o);
      continue;
    }
    if (n.nodeType !== 1) {
      if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
      continue;
    }
    for (const at of n.attributes) if (o.getAttribute(at.name) !== at.value) o.setAttribute(at.name, at.value);
    for (const at of [...o.attributes]) if (!n.hasAttribute(at.name)) o.removeAttribute(at.name);
    morph(o, n);
  }
  while (a.length > b.length) from.removeChild(from.lastChild);
}

const AGAIN = L('Start again', 'Сначала', 'Басынан');
const RESET = L('Reset', 'Сбросить', 'Тазалау');
const PROGRESS = L('progress, %', 'прошло, %', 'өтті, %');

// ---------- Сцены ----------

export { W, H, C, SVGNS, reduced, clamp, lerp, ease, n1, fmt, term, coef, lineEq, u, hhmm, arrow, plot, axes, slider, morph, AGAIN, RESET, PROGRESS };
