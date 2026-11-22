// Помощники для тем 7-11 классов и после школы: запись формул (степени, корни, многочлены),
// точные значения вида a√b/c и чертежи - геометрия по точкам, графики функций, числовая прямая, тела.

import { MINUS as M, fracHtml, gcd } from '../../core/format.js';
import { L, n } from '../gen.js';
import { svg } from './kit.js';

export { M };
export const X = '<i>x</i>';
export const Y = '<i>y</i>';
export const iv = (s) => `<i>${s}</i>`;
/** Дробь из готовых строк: числитель и знаменатель. */
export const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
/** Сокращённая дробь из целых чисел (с минусом и целыми). */
export const fv = (a, b = 1) => fracHtml(a, b);
export const sup = (b, e) => `${b}<sup>${e}</sup>`;
/** Число с минусом «−». */
export const nm = (x) => n(x);
/** Отрицательное число - в скобках. */
export const pr = (x) => (x < 0 ? `(${n(x)})` : n(x));
/** « + 3» / « − 3». */
export const sg = (x) => (x < 0 ? ` ${M} ${n(-x)}` : ` + ${n(x)}`);
/** Десятичное число на языке l: точка в английском, запятая в русском и казахском. */
export const dl = (x, l) => (l === 'en' ? n(x) : n(x).replace('.', ','));
export const r3 = (x) => Math.round(x * 1000) / 1000;
export const NZ = (rng, lo, hi) => {
  let t = 0;
  while (t === 0) t = lo + Math.floor(rng() * (hi - lo + 1));
  return t;
};
/** Перемешивание без мутации. */
export const shuf = (rng, a) => a.map((x) => [rng(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

// ---------- Корни и точные значения ----------

/** √m = s√t: самый большой квадрат выносим из-под корня. */
export function rootSplit(m) {
  let s = 1;
  let t = m;
  for (let k = 2; k * k <= t; k++)
    while (t % (k * k) === 0) {
      t /= k * k;
      s *= k;
    }
  return [s, t];
}
export const rt = (m) => `√${m}`;
/**
 * Точное значение a·√b / c в сокращённом виде (HTML).
 * surd(1, 2, 2) → √2/2, surd(6, 12, 4) → 3√3, surd(5, 1, 2) → 5/2.
 */
export function surd(a, b = 1, c = 1) {
  if (a === 0 || b === 0) return '0';
  const [s, t] = rootSplit(b);
  let p = a * s;
  let q = c;
  if (q < 0) [p, q] = [-p, -q];
  const g = gcd(p, q) || 1;
  p /= g;
  q /= g;
  if (t === 1) return fracHtml(p, q);
  const neg = p < 0 ? M : '';
  const top = `${Math.abs(p) === 1 ? '' : Math.abs(p)}√${t}`;
  return q === 1 ? `${neg}${top}` : `${neg}${fr(top, q)}`;
}
/** Значение a·√b / c числом (для сравнения). */
export const surdV = (a, b = 1, c = 1) => (a * Math.sqrt(b)) / c;

// ---------- Одночлены и многочлены ----------

/** Буквенная часть: {a: 2, b: 1} → a²b (курсив, степени). */
export function letters(vars) {
  return Object.entries(vars)
    .filter(([, e]) => e !== 0)
    .map(([k, e]) => (e === 1 ? iv(k) : `${iv(k)}<sup>${e}</sup>`))
    .join('');
}
/** Одночлен: коэффициент и буквы. mono(-3, {x: 2}) → −3x². */
export function mono(c, vars = {}) {
  const lt = letters(vars);
  if (!lt) return n(c);
  if (c === 1) return lt;
  if (c === -1) return `${M}${lt}`;
  return `${n(c)}${lt}`;
}
/** Сумма одночленов [[c, vars], ...] с правильными знаками; нулевые пропускаются. */
export function poly(list) {
  const parts = [];
  for (const [c, vars] of list) {
    if (c === 0) continue;
    const body = mono(Math.abs(c), vars);
    if (!parts.length) parts.push(c < 0 ? `${M}${body}` : body);
    else parts.push(c < 0 ? ` ${M} ${body}` : ` + ${body}`);
  }
  return parts.length ? parts.join('') : '0';
}
/** Многочлен от x по коэффициентам от старшей степени. */
export const px = (coefs, name = 'x') => poly(coefs.map((c, i) => [c, { [name]: coefs.length - 1 - i }]));
/** Произведение многочленов по коэффициентам. */
export function pmul(a, b) {
  const r = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => (r[i + j] += x * y)));
  return r;
}

// ---------- Плоские чертежи ----------

const r1 = (x) => Math.round(x * 10) / 10;
const C = ['var(--primary)', 'var(--accent)', 'var(--blue, #3b82f6)', 'var(--orange, #f97316)'];
const t = (x, y, s, cls = 'geo-l', anchor = 'middle', size = '') => `<text x="${r1(x)}" y="${r1(y)}" class="${cls}" text-anchor="${anchor}"${size ? ` font-size="${size}"` : ''}>${s}</text>`;

/**
 * Чертёж по точкам в обычных координатах (y вверх), масштаб подбирается сам.
 * P - {A: [x, y]}; polys - многоугольники (списки имён); segs / dashed / hl - отрезки [A, B];
 * sides - подписи отрезков [A, B, текст]; angles - дуги [A, O, B, текст]; right - прямые углы [A, O, B];
 * circles - [{ c: 'O', r }] или [{ at: [x, y], r }]; ticks - [A, B, k] черточки равенства;
 * hide - имена точек без подписи; dots - точки с кружком; lines - прямые через две точки (до края).
 */
export function scene({ P, polys = [], segs = [], dashed = [], hl = [], sides = [], angles = [], right = [], circles = [], ticks = [], hide = [], dots = [], lab = {}, w = 260, h = 190, pad = 28, fill = [] }) {
  const all = Object.values(P);
  const ext = [...all];
  for (const c of circles) {
    const o = c.at ?? P[c.c];
    ext.push([o[0] - c.r, o[1] - c.r], [o[0] + c.r, o[1] + c.r]);
  }
  const xs = ext.map((p) => p[0]);
  const ys = ext.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min((w - 2 * pad) / (x1 - x0 || 1), (h - 2 * pad) / (y1 - y0 || 1));
  const ox = (w - (x1 - x0) * k) / 2;
  const oy = (h - (y1 - y0) * k) / 2;
  const S = (p) => [ox + (p[0] - x0) * k, h - oy - (p[1] - y0) * k];
  const Q = Object.fromEntries(Object.entries(P).map(([nme, p]) => [nme, S(p)]));
  const cen = [all.reduce((s, p) => s + p[0], 0) / all.length, all.reduce((s, p) => s + p[1], 0) / all.length];
  const cs = S(cen);
  const out = [];
  polys.forEach((pl, i) => out.push(`<polygon points="${pl.map((nme) => Q[nme].map(r1).join(',')).join(' ')}" fill="${fill[i] ?? 'var(--fig-fill)'}" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/>`));
  for (const c of circles) {
    const o = S(c.at ?? P[c.c]);
    out.push(`<circle cx="${r1(o[0])}" cy="${r1(o[1])}" r="${r1(c.r * k)}" fill="${c.fill ?? 'none'}" stroke="${c.color ?? 'currentColor'}" stroke-width="2"${c.dash ? ' stroke-dasharray="5 4"' : ''}/>`);
  }
  const line = ([a, b], extra) => `<line x1="${r1(Q[a][0])}" y1="${r1(Q[a][1])}" x2="${r1(Q[b][0])}" y2="${r1(Q[b][1])}" ${extra}/>`;
  segs.forEach((s) => out.push(line(s, 'stroke="currentColor" stroke-width="2.2" stroke-linecap="round"')));
  dashed.forEach((s) => out.push(line(s, 'stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 4"')));
  hl.forEach((s) => out.push(line(s, `stroke="${C[0]}" stroke-width="3.2" stroke-linecap="round"`)));
  for (const [a, b, cnt] of ticks) {
    const [p, q] = [Q[a], Q[b]];
    const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    const u = [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
    const nv = [-u[1], u[0]];
    for (let i = 0; i < cnt; i++) {
      const off = (i - (cnt - 1) / 2) * 5;
      const c0 = [m[0] + u[0] * off, m[1] + u[1] * off];
      out.push(`<line x1="${r1(c0[0] - nv[0] * 6)}" y1="${r1(c0[1] - nv[1] * 6)}" x2="${r1(c0[0] + nv[0] * 6)}" y2="${r1(c0[1] + nv[1] * 6)}" stroke="${C[0]}" stroke-width="2"/>`);
    }
  }
  for (const [a, o, b, s, rr = 22] of angles) {
    const [A, O, B] = [Q[a], Q[o], Q[b]];
    const t0 = Math.atan2(A[1] - O[1], A[0] - O[0]);
    let dt = Math.atan2(B[1] - O[1], B[0] - O[0]) - t0;
    while (dt > Math.PI) dt -= 2 * Math.PI;
    while (dt <= -Math.PI) dt += 2 * Math.PI;
    const p0 = [O[0] + rr * Math.cos(t0), O[1] + rr * Math.sin(t0)];
    const p1 = [O[0] + rr * Math.cos(t0 + dt), O[1] + rr * Math.sin(t0 + dt)];
    out.push(`<path d="M${r1(p0[0])},${r1(p0[1])} A${rr},${rr} 0 0 ${dt > 0 ? 1 : 0} ${r1(p1[0])},${r1(p1[1])}" fill="none" stroke="${C[0]}" stroke-width="2"/>`);
    if (s) {
      const tm = t0 + dt / 2;
      const d = rr + 13;
      out.push(t(O[0] + d * Math.cos(tm), O[1] + d * Math.sin(tm) + 5, s, 'geo-l', 'middle', 13));
    }
  }
  for (const [a, o, b] of right) {
    const [A, O, B] = [Q[a], Q[o], Q[b]];
    const u = [(A[0] - O[0]) / Math.hypot(A[0] - O[0], A[1] - O[1]), (A[1] - O[1]) / Math.hypot(A[0] - O[0], A[1] - O[1])];
    const v = [(B[0] - O[0]) / Math.hypot(B[0] - O[0], B[1] - O[1]), (B[1] - O[1]) / Math.hypot(B[0] - O[0], B[1] - O[1])];
    const s = 11;
    out.push(`<polyline points="${r1(O[0] + u[0] * s)},${r1(O[1] + u[1] * s)} ${r1(O[0] + (u[0] + v[0]) * s)},${r1(O[1] + (u[1] + v[1]) * s)} ${r1(O[0] + v[0] * s)},${r1(O[1] + v[1] * s)}" fill="none" stroke="currentColor" stroke-width="1.5"/>`);
  }
  for (const [a, b, s] of sides) {
    const [p, q] = [Q[a], Q[b]];
    const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    let nv = [-(q[1] - p[1]) / len, (q[0] - p[0]) / len];
    if ((m[0] - cs[0]) * nv[0] + (m[1] - cs[1]) * nv[1] < 0) nv = [-nv[0], -nv[1]];
    out.push(t(m[0] + nv[0] * 14, m[1] + nv[1] * 14 + 5, s, 'geo-l', 'middle', 13));
  }
  for (const nme of dots) out.push(`<circle cx="${r1(Q[nme][0])}" cy="${r1(Q[nme][1])}" r="3.5" fill="currentColor"/>`);
  for (const [nme, p] of Object.entries(Q)) {
    if (hide.includes(nme)) continue;
    let d = lab[nme];
    if (!d) {
      const dx = p[0] - cs[0];
      const dy = p[1] - cs[1];
      const len = Math.hypot(dx, dy) || 1;
      d = [(dx / len) * 13, (dy / len) * 13];
    }
    out.push(t(p[0] + d[0], p[1] + d[1] + 5, nme.replace(/(\d)$/, '<tspan font-size="10" dy="3">$1</tspan>'), 'geo-v'));
  }
  return svg(w, h, out.join(''));
}

/** Точка на окружности радиуса r с центром c под углом deg (в градусах). */
export const onCircle = (c, r, deg) => [c[0] + r * Math.cos((deg * Math.PI) / 180), c[1] + r * Math.sin((deg * Math.PI) / 180)];

/** Треугольник ABC по сторонам: A(0, 0), B(c, 0), C - сверху. */
export function triBySides(a, b, c) {
  const x = (b * b + c * c - a * a) / (2 * c);
  const y = Math.sqrt(Math.max(0.01, b * b - x * x));
  return { A: [0, 0], B: [c, 0], C: [x, y] };
}
/** Треугольник ABC по стороне AB = 1 и углам при A и B. */
export function triByAngles(A, B) {
  const ra = (A * Math.PI) / 180;
  const rb = (B * Math.PI) / 180;
  const tt = Math.sin(rb) / Math.sin(ra + rb);
  return { A: [0, 0], B: [1, 0], C: [tt * Math.cos(ra), tt * Math.sin(ra)] };
}

// ---------- Графики функций ----------

/**
 * Координатная плоскость с графиками. fns - [{ f, color, dash, from, to }], pts - {подпись: [x, y]},
 * shade - { f, g, a, b } закрашенная область между f и g (по умолчанию g = 0).
 */
export function plot({ fns = [], xr = [-6, 6], yr = [-6, 6], pts = {}, shade = null, w = 250, h = 250, grid = 1, vlines = [] }) {
  const pad = 12;
  const kx = (w - 2 * pad) / (xr[1] - xr[0]);
  const ky = (h - 2 * pad) / (yr[1] - yr[0]);
  const X0 = (x) => pad + (x - xr[0]) * kx;
  const Y0 = (y) => h - pad - (y - yr[0]) * ky;
  const out = [];
  for (let x = Math.ceil(xr[0] / grid) * grid; x <= xr[1]; x += grid) out.push(`<line x1="${r1(X0(x))}" y1="${pad}" x2="${r1(X0(x))}" y2="${h - pad}" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>`);
  for (let y = Math.ceil(yr[0] / grid) * grid; y <= yr[1]; y += grid) out.push(`<line x1="${pad}" y1="${r1(Y0(y))}" x2="${w - pad}" y2="${r1(Y0(y))}" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>`);
  if (shade) {
    const g = shade.g ?? (() => 0);
    const N = 80;
    const top = [];
    const bot = [];
    for (let i = 0; i <= N; i++) {
      const x = shade.a + ((shade.b - shade.a) * i) / N;
      top.push(`${r1(X0(x))},${r1(Y0(shade.f(x)))}`);
      bot.unshift(`${r1(X0(x))},${r1(Y0(g(x)))}`);
    }
    out.push(`<polygon points="${[...top, ...bot].join(' ')}" fill="${C[0]}" fill-opacity="0.22" stroke="none"/>`);
  }
  const ax = Y0(0);
  const ay = X0(0);
  if (ax >= pad && ax <= h - pad) out.push(`<line x1="4" y1="${r1(ax)}" x2="${w - 4}" y2="${r1(ax)}" stroke="currentColor" stroke-width="1.6"/>`, `<polygon points="${w - 2},${r1(ax)} ${w - 10},${r1(ax - 4)} ${w - 10},${r1(ax + 4)}" fill="currentColor"/>`, t(w - 8, ax - 7, 'x', 'geo-v', 'end'));
  if (ay >= pad && ay <= w - pad) out.push(`<line x1="${r1(ay)}" y1="${h - 4}" x2="${r1(ay)}" y2="4" stroke="currentColor" stroke-width="1.6"/>`, `<polygon points="${r1(ay)},2 ${r1(ay - 4)},10 ${r1(ay + 4)},10" fill="currentColor"/>`, t(ay + 8, 14, 'y', 'geo-v', 'start'));
  if (ax >= pad && ay >= pad) out.push(t(ay - 5, ax + 14, '0', 'geo-l', 'end', 11), t(X0(grid), ax + 14, String(grid), 'geo-l', 'middle', 11), t(ay - 5, Y0(grid) + 4, String(grid), 'geo-l', 'end', 11));
  for (const x of vlines) out.push(`<line x1="${r1(X0(x))}" y1="${pad}" x2="${r1(X0(x))}" y2="${h - pad}" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 4"/>`);
  fns.forEach((fn, i) => {
    const a = fn.from ?? xr[0];
    const b = fn.to ?? xr[1];
    const N = 240;
    let path = '';
    let pen = false;
    let prev = null;
    for (let j = 0; j <= N; j++) {
      const x = a + ((b - a) * j) / N;
      const y = fn.f(x);
      const ok = Number.isFinite(y) && y > yr[0] - (yr[1] - yr[0]) && y < yr[1] + (yr[1] - yr[0]);
      // Разрыв (асимптота): большой скачок - поднимаем перо.
      if (!ok || (prev !== null && Math.abs(y - prev) > (yr[1] - yr[0]) * 0.8)) {
        pen = false;
        prev = ok ? y : null;
        if (!ok) continue;
      }
      const yy = Math.max(yr[0] - 1, Math.min(yr[1] + 1, y));
      path += `${pen ? 'L' : 'M'}${r1(X0(x))},${r1(Y0(yy))}`;
      pen = true;
      prev = y;
    }
    out.push(`<path d="${path}" fill="none" stroke="${fn.color ?? C[i % C.length]}" stroke-width="2.6"${fn.dash ? ' stroke-dasharray="6 4"' : ''} clip-path="url(#pc)"/>`);
  });
  for (const [lb, [x, y]] of Object.entries(pts)) out.push(`<circle cx="${r1(X0(x))}" cy="${r1(Y0(y))}" r="4" fill="${C[1]}"/>`, lb ? t(X0(x) + 6, Y0(y) - 6, lb, 'geo-v', 'start') : '');
  return svg(w, h, `<defs><clipPath id="pc"><rect x="${pad}" y="${pad}" width="${w - 2 * pad}" height="${h - 2 * pad}"/></clipPath></defs>${out.join('')}`);
}

/**
 * Числовая прямая для неравенств: points - [{ v: подпись, closed }], слева направо;
 * shade - номера промежутков (0 - левее первой точки, 1 - между первой и второй, ...); signs - знаки на промежутках.
 */
export function axisFig(points, { shade = [], signs = null } = {}) {
  const w = 300;
  const y = 46;
  const k = points.length;
  const xs = points.map((_, i) => 40 + ((w - 80) * (k === 1 ? 0.5 : i / (k - 1))));
  const out = [`<line x1="8" y1="${y}" x2="${w - 8}" y2="${y}" stroke="currentColor" stroke-width="2"/>`, `<polygon points="${w - 4},${y} ${w - 13},${y - 5} ${w - 13},${y + 5}" fill="currentColor"/>`];
  const edges = [8, ...xs, w - 14];
  for (const i of shade) {
    const [a, b] = [edges[i], edges[i + 1]];
    out.push(`<line x1="${r1(a)}" y1="${y}" x2="${r1(b)}" y2="${y}" stroke="${C[0]}" stroke-width="6" stroke-opacity="0.55"/>`);
    for (let x = a + 4; x < b - 2; x += 9) out.push(`<line x1="${r1(x)}" y1="${y - 2}" x2="${r1(x + 8)}" y2="${y - 12}" stroke="${C[0]}" stroke-width="1.4"/>`);
  }
  if (signs)
    signs.forEach((s, i) => {
      const a = edges[i];
      const b = edges[i + 1];
      out.push(t((a + b) / 2, y - 16, s, 'geo-v', 'middle', 16));
    });
  points.forEach((p, i) => {
    out.push(`<circle cx="${r1(xs[i])}" cy="${y}" r="5" fill="${p.closed ? 'currentColor' : 'var(--fig-fill)'}" stroke="currentColor" stroke-width="2"/>`);
    out.push(t(xs[i], y + 24, p.v, 'geo-v', 'middle', 14));
  });
  return svg(w, 80, out.join(''));
}

// ---------- Пространственные чертежи ----------

/** Наклонная проекция точки (x, y, z): z - вглубь. */
export const proj = ([x, y, z]) => [x + z * 0.42, y + z * 0.32];

/**
 * Тело по точкам в пространстве: P3 - {A: [x, y, z]}, edges - видимые рёбра, hidden - невидимые (пунктир),
 * hl - выделенные отрезки; остальные параметры - как у scene.
 */
export function solid({ P3, edges = [], hidden = [], hl = [], ...rest }) {
  const P = Object.fromEntries(Object.entries(P3).map(([k, p]) => [k, proj(p)]));
  return scene({ P, segs: edges, dashed: hidden, hl, ...rest });
}

/** Куб ABCDA1B1C1D1 со стороной 1 (нижнее основание ABCD, D - дальний левый). */
export const CUBE = { A: [0, 0, 0], B: [1, 0, 0], C: [1, 0, 1], D: [0, 0, 1], A1: [0, 1, 0], B1: [1, 1, 0], C1: [1, 1, 1], D1: [0, 1, 1] };
export const CUBE_EDGES = [['A', 'B'], ['B', 'C'], ['A', 'A1'], ['B', 'B1'], ['C', 'C1'], ['A1', 'B1'], ['B1', 'C1'], ['C1', 'D1'], ['D1', 'A1']];
export const CUBE_HIDDEN = [['A', 'D'], ['D', 'C'], ['D', 'D1']];
export const cubeFig = (hlSegs = [], extra = {}) => solid({ P3: CUBE, edges: CUBE_EDGES, hidden: CUBE_HIDDEN, hl: hlSegs, w: 220, h: 200, ...extra });

/** Тело вращения: kind 'cyl' | 'cone' | 'sphere' | 'frustum'; labels - подписи r, h, l. */
export function revolveFig(kind, { r = 'r', h = 'h', l = '', R = '' } = {}) {
  const W = 240;
  const H = 200;
  const cx = 120;
  const out = [];
  const ell = (y, rx, ry, dashTop) =>
    dashTop
      ? `<path d="M${cx - rx},${y} A${rx},${ry} 0 0 0 ${cx + rx},${y}" fill="none" stroke="currentColor" stroke-width="2"/><path d="M${cx - rx},${y} A${rx},${ry} 0 0 1 ${cx + rx},${y}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>`
      : `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="var(--fig-fill)" stroke="currentColor" stroke-width="2"/>`;
  if (kind === 'sphere') {
    out.push(`<circle cx="${cx}" cy="100" r="78" fill="var(--fig-fill)" stroke="currentColor" stroke-width="2.3"/>`, ell(100, 78, 20, true));
    out.push(`<line x1="${cx}" y1="100" x2="${cx + 78}" y2="100" stroke="${C[0]}" stroke-width="2.5"/>`, `<circle cx="${cx}" cy="100" r="3" fill="currentColor"/>`, t(cx + 39, 94, r));
    return svg(W, H, out.join(''));
  }
  const top = 30;
  const bot = 170;
  const rx = 70;
  const ry = 16;
  if (kind === 'cyl') {
    out.push(`<path d="M${cx - rx},${top} L${cx - rx},${bot} A${rx},${ry} 0 0 0 ${cx + rx},${bot} L${cx + rx},${top}" fill="var(--fig-fill)" stroke="currentColor" stroke-width="2.2"/>`, ell(bot, rx, ry, true), ell(top, rx, ry, false));
    out.push(`<line x1="${cx}" y1="${top}" x2="${cx}" y2="${bot}" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>`, `<line x1="${cx}" y1="${bot}" x2="${cx + rx}" y2="${bot}" stroke="${C[0]}" stroke-width="2.5"/>`);
    out.push(t(cx + rx / 2, bot - 6, r), t(cx - 8, (top + bot) / 2, h, 'geo-l', 'end'));
  } else if (kind === 'cone') {
    out.push(`<path d="M${cx - rx},${bot} L${cx},${top} L${cx + rx},${bot} A${rx},${ry} 0 0 1 ${cx - rx},${bot}" fill="var(--fig-fill)" stroke="currentColor" stroke-width="2.2"/>`, ell(bot, rx, ry, true));
    out.push(`<line x1="${cx}" y1="${top}" x2="${cx}" y2="${bot}" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>`, `<line x1="${cx}" y1="${bot}" x2="${cx + rx}" y2="${bot}" stroke="${C[0]}" stroke-width="2.5"/>`);
    out.push(t(cx + rx / 2, bot - 6, r), t(cx - 8, (top + bot) / 2 + 10, h, 'geo-l', 'end'));
    if (l) out.push(t(cx + rx / 2 + 14, (top + bot) / 2, l, 'geo-l', 'start'));
  } else {
    const rt0 = 36;
    out.push(`<path d="M${cx - rx},${bot} L${cx - rt0},${top} L${cx + rt0},${top} L${cx + rx},${bot} A${rx},${ry} 0 0 1 ${cx - rx},${bot}" fill="var(--fig-fill)" stroke="currentColor" stroke-width="2.2"/>`, ell(bot, rx, ry, true), ell(top, rt0, 8, false));
    out.push(`<line x1="${cx}" y1="${top}" x2="${cx}" y2="${bot}" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>`, `<line x1="${cx}" y1="${bot}" x2="${cx + rx}" y2="${bot}" stroke="${C[0]}" stroke-width="2.5"/>`, `<line x1="${cx}" y1="${top}" x2="${cx + rt0}" y2="${top}" stroke="${C[0]}" stroke-width="2.5"/>`);
    out.push(t(cx + rx / 2, bot - 6, R || r), t(cx + rt0 / 2, top - 6, r), t(cx - 8, (top + bot) / 2, h, 'geo-l', 'end'));
  }
  return svg(W, H, out.join(''));
}

/** Слова «да / нет» и подобные короткие ответы. */
export const YES = L('yes', 'да', 'иә');
export const NO = L('no', 'нет', 'жоқ');
