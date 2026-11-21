// Анимации тем: алгебра, геометрия и высшая математика. Формат сцены описан в src/screens/explain.js.
// У каждой сцены несколько режимов (вкладки), примеры (кнопка «Ещё ↻») и режим «Задание»:
// сцена загадывает цель, проверяет ползунки или перетаскивание и показывает ✓ или подсказку.

import { getLang, t, tx } from '../core/i18n.js';
import { L } from '../pools/gen.js';
import { esc } from '../ui/dom.js';
import { W, H, C, SVGNS, reduced, clamp, lerp, ease, n1, fmt, term, coef, lineEq, u, hhmm, arrow, plot, axes, slider, morph, AGAIN, RESET, PROGRESS } from './kit.js';

// ---------- Общие помощники сцен ----------

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

const OLD = {
  balance: {
    title: L('Equations as a balance', 'Уравнение - это весы', 'Теңдеу - таразы'),
    intro: L(
      'An equation is a balance: whatever you do to one pan, do to the other, and it stays level.',
      'Уравнение - это весы в равновесии. Что делаешь с одной чашей, то же делай с другой - и весы не перекосятся.',
      'Теңдеу - тепе-теңдіктегі таразы. Бір табақпен не істесең, екіншісімен де соны істе - таразы қисаймайды.',
    ),
    sliders: [
      { id: 'a', label: 'a', min: 1, max: 4, value: 3 },
      { id: 'x', label: 'x', min: 1, max: 5, value: 2 },
      { id: 'b', label: 'b', min: 0, max: 6, value: 4 },
    ],
    buttons: [L('Remove b from both pans', 'Убрать b с обеих чаш', 'Екі табақтан b-ны алу'), L('Divide both pans by a', 'Разделить обе чаши на a', 'Екі табақты a-ға бөлу'), AGAIN],
    draw(v, step, st, f) {
      const { a, x, b } = v;
      const c = a * x + b;
      // Какие коробки на каких чашах на каждом шаге; между шагами - плавный переход.
      const stage = (s) => {
        const left = s >= 2 ? ['x0'] : [...Array.from({ length: a }, (_, i) => `x${i}`), ...(s >= 1 ? [] : Array.from({ length: b }, (_, i) => `w${i}`))];
        const rightN = s >= 2 ? x : s >= 1 ? c - b : c;
        const pos = new Map();
        const put = (ids, cx) => {
          const per = ids.length > 15 ? 7 : Math.min(5, Math.max(1, ids.length));
          ids.forEach((id, i) => pos.set(id, [cx - per * 9.5 + (i % per) * 19, 120 - 19 - Math.floor(i / per) * 19]));
        };
        put(left, 85);
        put(Array.from({ length: rightN }, (_, i) => `r${i}`), 235);
        return pos;
      };
      const s0 = clamp(Math.floor(f), 0, 2);
      const s1 = Math.min(2, s0 + 1);
      const k = clamp(f - s0, 0, 1);
      const A = stage(s0);
      const B = stage(s1);
      const ids = [...Array.from({ length: a }, (_, i) => `x${i}`), ...Array.from({ length: b }, (_, i) => `w${i}`), ...Array.from({ length: c }, (_, i) => `r${i}`)];
      const boxes = ids
        .map((id, i) => {
          const p = A.get(id);
          const q = B.get(id);
          if (!p && !q) return '';
          let xy;
          let op = 1;
          if (p && q) xy = [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
          else if (p) {
            xy = [p[0], p[1] - 18 * k];
            op = 1 - k;
          } else {
            xy = [q[0], q[1] - 18 * (1 - k)];
            op = k;
          }
          if (op < 0.02) return '';
          const isX = id[0] === 'x';
          return `<g transform="translate(${n1(xy[0])} ${n1(xy[1])})" opacity="${n1(op * 100) / 100}" data-key="${id}"><g class="${isX ? 'ex-x' : 'ex-w'}" style="--i:${i % 12}"><rect width="17" height="17" rx="4"/><text x="8.5" y="12.5">${isX ? 'x' : '1'}</text></g></g>`;
        })
        .join('');
      const se = clamp(Math.round(f), 0, 2);
      const eq = [`${a === 1 ? '' : a}x + ${b} = ${c}`, `${a === 1 ? '' : a}x = ${c - b}`, `x = ${x}`][se];
      return {
        svg: `<line class="ex-axis" x1="160" y1="128" x2="160" y2="196"/><path class="ex-base" d="M130 200 L190 200 L160 180 Z"/>
          <g class="ex-beam"><line x1="40" y1="124" x2="280" y2="124"/><path class="ex-pan" d="M35 124 Q85 150 135 124"/><path class="ex-pan" d="M185 124 Q235 150 285 124"/></g>${boxes}
          <text class="ex-big" x="160" y="30">${eq}</text>`,
        caption: [
          L(`On the left: ${a} boxes x and ${b} weights. On the right: ${c} weights. The scale is level.`, `Слева: ${a} коробки x и ${b} гирь. Справа: ${c} гирь. Весы в равновесии.`, `Сол жақта: ${a} x қорапшасы және ${b} гір. Оң жақта: ${c} гір. Таразы тең.`),
          L(`We removed ${b} weights from both pans - still level: ${a}x = ${c - b}.`, `Убрали по ${b} гирь с обеих чаш - равновесие осталось: ${a}x = ${c - b}.`, `Екі табақтан ${b} гірден алдық - тепе-теңдік сақталды: ${a}x = ${c - b}.`),
          L(`Split each pan into ${a} equal parts: one box x weighs ${x}.`, `Делим каждую чашу на ${a} равные части: одна коробка x весит ${x}.`, `Әр табақты ${a} тең бөлікке бөлеміз: бір x қорапшасы ${x} тартады.`),
        ][step],
      };
    },
  },

  fractions: {
    title: L('What a fraction is', 'Что такое дробь', 'Бөлшек дегеніміз не'),
    intro: L('The denominator says into how many equal parts the whole is cut; the numerator says how many parts we take.', 'Знаменатель показывает, на сколько равных частей разрезали целое, числитель - сколько частей взяли.', 'Бөлім бүтінді неше тең бөлікке бөлгенін, алым - неше бөлік алғанын көрсетеді.'),
    sliders: [
      { id: 'n', label: L('numerator', 'числитель', 'алым'), min: 0, max: 12, value: 3 },
      { id: 'd', label: L('denominator', 'знаменатель', 'бөлім'), min: 2, max: 12, value: 4 },
    ],
    clamp(v) {
      v.n = Math.min(v.n, v.d);
    },
    buttons: [L('Multiply top and bottom by 2', 'Умножить числитель и знаменатель на 2', 'Алым мен бөлімді 2-ге көбейту'), AGAIN],
    draw(v, step, st, f) {
      const d0 = v.d;
      const n0 = Math.min(v.n, d0);
      const k = clamp(f, 0, 1);
      const split = k > 0.999;
      const m = split ? 2 : 1;
      const d = d0 * m;
      const n = n0 * m;
      const cx = 95;
      const cy = 112;
      const r = 78;
      const slices = Array.from({ length: d }, (_, i) => {
        const a0 = (i / d) * Math.PI * 2 - Math.PI / 2;
        const a1 = ((i + 1) / d) * Math.PI * 2 - Math.PI / 2;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const p = `M${cx} ${cy} L${n1(cx + r * Math.cos(a0))} ${n1(cy + r * Math.sin(a0))} A${r} ${r} 0 ${large} 1 ${n1(cx + r * Math.cos(a1))} ${n1(cy + r * Math.sin(a1))} Z`;
        return `<path class="ex-slice ${i < n ? 'on' : ''}" style="--i:${i}" d="${p}"/>`;
      }).join('');
      const bar = Array.from({ length: d }, (_, i) => `<rect class="ex-slice ${i < n ? 'on' : ''}" style="--i:${i}" x="${n1(195 + (i * 110) / d)}" y="150" width="${n1(110 / d - 1)}" height="26" rx="3"/>`).join('');
      // Пока идёт переход - «нож» разрезает каждую часть пополам.
      const cuts =
        !split && k > 0
          ? Array.from({ length: d0 }, (_, i) => {
              const am = ((i + 0.5) / d0) * Math.PI * 2 - Math.PI / 2;
              const bx = 195 + ((i + 0.5) * 110) / d0 - 0.5;
              return `<line class="ex-cut" x1="${cx}" y1="${cy}" x2="${n1(cx + r * k * Math.cos(am))}" y2="${n1(cy + r * k * Math.sin(am))}"/><line class="ex-cut" x1="${n1(bx)}" y1="150" x2="${n1(bx)}" y2="${n1(150 + 26 * k)}"/>`;
            }).join('')
          : '';
      const shown = k >= 0.5 ? 2 : 1;
      const nn = n0 * shown;
      const dd = d0 * shown;
      return {
        svg: `${slices}${bar}<g>${cuts}</g>
          <text class="ex-big" x="250" y="70">${nn}/${dd}</text>
          <text class="ex-small" x="250" y="100">= ${fmt(nn / dd, 3)}</text>
          <text class="ex-small" x="250" y="126">= ${fmt((nn / dd) * 100, 1)}%</text>`,
        caption:
          step === 0
            ? L(`The whole is cut into ${d0} equal parts and ${n0} are shaded: ${n0}/${d0}.`, `Целое разрезали на ${d0} равных частей и закрасили ${n0}: это ${n0}/${d0}.`, `Бүтінді ${d0} тең бөлікке бөліп, ${n0}-ін бояды: бұл ${n0}/${d0}.`)
            : L(`Each part was cut in two: ${n0 * 2}/${d0 * 2} is the same amount as ${n0}/${d0}. That is why fractions can be simplified.`, `Каждую часть разрезали пополам: ${n0 * 2}/${d0 * 2} - то же количество, что ${n0}/${d0}. Поэтому дроби можно сокращать.`, `Әр бөлікті екіге бөлдік: ${n0 * 2}/${d0 * 2} - ${n0}/${d0}-пен бірдей мөлшер. Сондықтан бөлшекті қысқартуға болады.`),
      };
    },
  },

  percent: {
    title: L('Percent: one hundredth', 'Процент - это сотая часть', 'Пайыз - жүзден бір бөлік'),
    intro: L('Imagine the number cut into 100 equal cells. p% is p of those cells.', 'Представь, что число разрезали на 100 равных клеточек. p% - это p таких клеточек.', 'Санды 100 тең торкөзге бөлді деп елестет. p% - осындай p торкөз.'),
    sliders: [
      { id: 'p', label: 'p, %', min: 0, max: 100, step: C, value: 25 },
      { id: 'N', label: 'N', min: 10, max: 2000, value: 400 },
    ],
    buttons: [L('p = 50%: a half', 'p = 50% - половина', 'p = 50% - жартысы'), L('p = 12.5%: an eighth', 'p = 12,5% - восьмая', 'p = 12,5% - сегізден бір')],
    onButton: (i) => [{ p: 50 }, { p: 12.5 }][i],
    draw(v) {
      const full = Math.floor(v.p + 1e-9);
      const part = v.p - full;
      const cells = Array.from({ length: 100 }, (_, i) => `<rect class="ex-cell ${i < full ? 'on' : ''}" style="--i:${i}" x="${12 + (i % 10) * 18}" y="${18 + Math.floor(i / 10) * 18}" width="16" height="16" rx="3"/>`).join('');
      const pi = Math.min(full, 99);
      const partial = `<rect class="ex-part" x="${12 + (pi % 10) * 18}" y="${18 + Math.floor(pi / 10) * 18}" width="${full < 100 ? n1(16 * part) : 0}" height="16" rx="2"/>`;
      const one = v.N / 100;
      const val = (v.N * v.p) / 100;
      return {
        svg: `${cells}${partial}<text class="ex-small" x="262" y="60">1% = ${fmt(one)}</text><text class="ex-big" x="262" y="100">${fmt(v.p)}%</text><text class="ex-small" x="262" y="130">= ${fmt(val)}</text>`,
        caption: L(`One cell is 1% of ${v.N}, that is ${v.N} ÷ 100 = ${fmt(one)}. ${fmt(v.p)} cells: ${fmt(one)} × ${fmt(v.p)} = ${fmt(val)}.`, `Одна клетка - 1% от ${v.N}, то есть ${v.N} ÷ 100 = ${fmt(one)}. ${fmt(v.p)} клеток: ${fmt(one)} × ${fmt(v.p)} = ${fmt(val)}.`, `Бір торкөз - ${v.N}-нің 1%-ы, яғни ${v.N} ÷ 100 = ${fmt(one)}. ${fmt(v.p)} торкөз: ${fmt(one)} × ${fmt(v.p)} = ${fmt(val)}.`),
      };
    },
  },

  pythagoras: {
    title: L('The Pythagorean theorem', 'Теорема Пифагора', 'Пифагор теоремасы'),
    intro: L('Build a square on each side of a right triangle: the two small squares together have exactly the area of the big one.', 'Построим квадрат на каждой стороне прямоугольного треугольника: два маленьких квадрата вместе равны по площади большому.', 'Тікбұрышты үшбұрыштың әр қабырғасына шаршы саламыз: екі кіші шаршының ауданы бірге үлкенінікіне тең.'),
    sliders: [
      { id: 'a', label: 'a', min: 1, max: 6, step: C, value: 3 },
      { id: 'b', label: 'b', min: 1, max: 6, step: C, value: 4 },
    ],
    buttons: [L('3, 4, 5', '3, 4, 5', '3, 4, 5'), L('Isosceles: a = b', 'Равнобедренный: a = b', 'Теңбүйірлі: a = b')],
    onButton: (i, st, v) => [{ a: 3, b: 4 }, { b: v.a }][i],
    draw(v) {
      const s = 16;
      const A = [120, 150];
      const B = [120 + v.b * s, 150];
      const Cp = [120, 150 - v.a * s];
      const a2 = v.a * v.a;
      const b2 = v.b * v.b;
      const c2 = a2 + b2;
      const c = Math.sqrt(c2);
      const sq = (p, q, cls, i) => {
        const dx = q[0] - p[0];
        const dy = q[1] - p[1];
        return `<path class="ex-sq ${cls}" style="--i:${i}" d="M${n1(p[0])} ${n1(p[1])} L${n1(q[0])} ${n1(q[1])} L${n1(q[0] + dy)} ${n1(q[1] - dx)} L${n1(p[0] + dy)} ${n1(p[1] - dx)} Z"/>`;
      };
      const exact = Math.abs(c - Math.round(c)) < 0.005;
      return {
        svg: `<g transform="translate(-10 22) scale(0.82)">${sq(A, Cp, 'sq-a', 0)}${sq(B, A, 'sq-b', 1)}${sq(Cp, B, 'sq-c', 2)}<path class="ex-tri" d="M${A} L${n1(B[0])} ${B[1]} L${Cp[0]} ${n1(Cp[1])} Z"/></g>
          <text class="ex-small" x="250" y="60">a² = ${fmt(a2)}</text><text class="ex-small" x="250" y="86">b² = ${fmt(b2)}</text><text class="ex-big" x="250" y="122">c² = ${fmt(c2)}</text><text class="ex-small" x="250" y="150">c ${exact ? '=' : '≈'} ${fmt(c)}</text>`,
        caption: L(`${fmt(v.a)}² + ${fmt(v.b)}² = ${fmt(a2)} + ${fmt(b2)} = ${fmt(c2)}, so the hypotenuse is √${fmt(c2)} ${exact ? '=' : '≈'} ${fmt(c)}. Try a = 3, b = 4 for a whole number.`, `${fmt(v.a)}² + ${fmt(v.b)}² = ${fmt(a2)} + ${fmt(b2)} = ${fmt(c2)}, значит гипотенуза √${fmt(c2)} ${exact ? '=' : '≈'} ${fmt(c)}. Попробуй a = 3, b = 4 - получится целое число.`, `${fmt(v.a)}² + ${fmt(v.b)}² = ${fmt(a2)} + ${fmt(b2)} = ${fmt(c2)}, демек гипотенуза √${fmt(c2)} ${exact ? '=' : '≈'} ${fmt(c)}. a = 3, b = 4 етіп көр - бүтін сан шығады.`),
      };
    },
  },

  angles: {
    title: L('Angles of a triangle add up to 180°', 'Сумма углов треугольника - 180°', 'Үшбұрыш бұрыштарының қосындысы - 180°'),
    intro: L('Tear off the three corners of any triangle and put them together: they always form a straight line.', 'Оторви три угла любого треугольника и сложи их вместе - всегда получится развёрнутый угол.', 'Кез келген үшбұрыштың үш бұрышын жыртып, бірге қос - әрқашан жазыңқы бұрыш шығады.'),
    sliders: [
      { id: 'A', label: 'A°', min: 20, max: 120, step: C, value: 60 },
      { id: 'B', label: 'B°', min: 20, max: 120, step: C, value: 50 },
    ],
    clamp(v) {
      if (v.A + v.B > 160) v.B = 160 - v.A;
    },
    buttons: [L('Put the corners together', 'Сложить углы вместе', 'Бұрыштарды бірге қосу'), AGAIN],
    draw(v, step, st, f) {
      const { A, B } = v;
      const Cc = 180 - A - B;
      const rad = (d) => (d * Math.PI) / 180;
      const P = [40, 150];
      const Q = [200, 150];
      const ta = Math.tan(rad(A));
      const tb = Math.tan(rad(B));
      const x = (160 * tb) / (ta + tb);
      const R = [40 + x, 150 - x * ta];
      const k = clamp(f, 0, 1);
      const wedge = (from, to, cls) => {
        const r = 26;
        const cx = lerp(from[0], 260, k);
        const cy = lerp(from[1], 190, k);
        const st0 = lerp(from[2], to, k);
        const a0 = rad(st0);
        const a1 = rad(st0 + from[3]);
        return `<path class="ex-wedge ${cls}" d="M${n1(cx)} ${n1(cy)} L${n1(cx + r * Math.cos(a0))} ${n1(cy - r * Math.sin(a0))} A${r} ${r} 0 0 0 ${n1(cx + r * Math.cos(a1))} ${n1(cy - r * Math.sin(a1))} Z"/>`;
      };
      return {
        svg: `<path class="ex-tri" d="M${P} L${Q} L${n1(R[0])} ${n1(R[1])} Z"/><line class="ex-axis" x1="210" y1="190" x2="310" y2="190" opacity="${n1(k * 10) / 10}"/>
          <g>${wedge([P[0], P[1], 0, A], 0, 'w-a')}${wedge([R[0], R[1], 180 + A, Cc], A, 'w-c')}${wedge([Q[0], Q[1], 180 - B, B], A + Cc, 'w-b')}</g>
          <text class="ex-small" x="${P[0] - 8}" y="${P[1] + 18}">A = ${fmt(A)}°</text><text class="ex-small" x="${Q[0] + 4}" y="${Q[1] + 18}">B = ${fmt(B)}°</text><text class="ex-small" x="${n1(R[0])}" y="${n1(R[1] - 10)}">C = ${fmt(Cc)}°</text>`,
        caption:
          step >= 1
            ? L(`${fmt(A)}° + ${fmt(Cc)}° + ${fmt(B)}° = 180°: together the three angles make a straight line.`, `${fmt(A)}° + ${fmt(Cc)}° + ${fmt(B)}° = 180°: три угла вместе образуют развёрнутый угол - прямую линию.`, `${fmt(A)}° + ${fmt(Cc)}° + ${fmt(B)}° = 180°: үш бұрыш бірге жазыңқы бұрыш - түзу сызық құрайды.`)
            : L(`Change A and B: C always equals 180° − A − B = ${fmt(Cc)}°.`, `Меняй A и B: угол C всегда равен 180° − A − B = ${fmt(Cc)}°.`, `A мен B-ны өзгерт: C бұрышы әрқашан 180° − A − B = ${fmt(Cc)}°.`),
      };
    },
  },

  parabola: {
    title: L('The parabola y = ax² + bx + c', 'Парабола y = ax² + bx + c', 'Парабола y = ax² + bx + c'),
    intro: L('a sets the direction and width, c moves the graph up and down, b shifts the vertex sideways. The discriminant tells how many times the graph crosses the x-axis.', 'a задаёт направление ветвей и ширину, c поднимает и опускает график, b сдвигает вершину вбок. Дискриминант показывает, сколько раз график пересекает ось x.', 'a тармақтардың бағыты мен енін, c графикті жоғары-төмен жылжытады, b төбені бүйірге ығыстырады. Дискриминант график x осін неше рет қиятынын көрсетеді.'),
    sliders: [
      { id: 'a', label: 'a', min: -3, max: 3, step: C, value: 1 },
      { id: 'b', label: 'b', min: -6, max: 6, step: C, value: -2 },
      { id: 'c', label: 'c', min: -6, max: 6, step: C, value: -3 },
    ],
    buttons: [L('a → −a: flip', 'a → −a: перевернуть', 'a → −a: аудару'), L('D = 0: touch the axis', 'D = 0: касание оси', 'D = 0: оске жанасу')],
    onButton(i, st, v) {
      if (i === 0) return { a: -v.a };
      const a = Math.abs(v.a) < 0.05 ? 1 : v.a;
      return { a, c: clamp((v.b * v.b) / (4 * a), -6, 6) };
    },
    draw(v) {
      const { a, b, c } = v;
      const sx = (x) => 160 + x * 22;
      const sy = (y) => 110 - y * 11;
      const path = plot((x) => a * x * x + b * x + c, -7.3, 7.3, sx, sy, 150);
      const grid = Array.from({ length: 15 }, (_, i) => `<line class="ex-grid" x1="${sx(i - 7)}" y1="0" x2="${sx(i - 7)}" y2="${H}"/>`).join('');
      const base = `${grid}<line class="ex-axis" x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}"/><line class="ex-axis" x1="${sx(0)}" y1="0" x2="${sx(0)}" y2="${H}"/><path class="ex-curve" d="${path}"/>`;
      if (Math.abs(a) < 0.005) {
        const root = Math.abs(b) > 0.005 ? -c / b : null;
        return {
          svg: `${base}${root !== null ? `<circle class="ex-dot dot-root" cx="${n1(sx(root))}" cy="${sy(0)}" r="5"/>` : ''}<text class="ex-tag" x="8" y="18">a = 0</text>`,
          caption: L(`a = 0: no x² term, so this is a straight line ${lineEq(b, c)}, not a parabola.${root !== null ? ` It crosses the axis at x = ${fmt(root)}.` : ''}`, `a = 0: нет слагаемого x², это уже не парабола, а прямая ${lineEq(b, c)}.${root !== null ? ` Она пересекает ось в x = ${fmt(root)}.` : ''}`, `a = 0: x² қосылғышы жоқ, бұл парабола емес, ${lineEq(b, c)} түзуі.${root !== null ? ` Ол осьті x = ${fmt(root)} нүктесінде қияды.` : ''}`),
        };
      }
      const D = b * b - 4 * a * c;
      const one = Math.abs(D) < 0.005;
      const xv = -b / (2 * a);
      const yv = a * xv * xv + b * xv + c;
      const roots = one ? [xv] : D < 0 ? [] : [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort((p, q) => p - q);
      const kind = (two, single, none) => (one ? single : D > 0 ? two : none);
      return {
        svg: `${base}${roots.map((r) => `<circle class="ex-dot dot-root" cx="${n1(sx(r))}" cy="${sy(0)}" r="5"/>`).join('')}<circle class="ex-dot" cx="${n1(sx(xv))}" cy="${n1(clamp(sy(yv), -20, 240))}" r="5"/>
          <text class="ex-tag" x="8" y="18">D = ${fmt(one ? 0 : D)}</text>`,
        caption: L(
          `D = b² − 4ac = ${fmt(one ? 0 : D)}: ${kind('two roots', 'one root', 'no real roots')}. Vertex at x = −b/(2a) = ${fmt(xv)}.${roots.length ? ` Roots: ${roots.map((r) => fmt(r)).join('; ')}.` : ''}`,
          `D = b² − 4ac = ${fmt(one ? 0 : D)}: ${kind('два корня', 'один корень', 'корней нет')}. Вершина в x = −b/(2a) = ${fmt(xv)}.${roots.length ? ` Корни: ${roots.map((r) => fmt(r)).join('; ')}.` : ''}`,
          `D = b² − 4ac = ${fmt(one ? 0 : D)}: ${kind('екі түбір', 'бір түбір', 'түбір жоқ')}. Төбесі x = −b/(2a) = ${fmt(xv)}.${roots.length ? ` Түбірлер: ${roots.map((r) => fmt(r)).join('; ')}.` : ''}`,
        ),
      };
    },
  },

  'unit-circle': {
    title: L('Sine and cosine on the unit circle', 'Синус и косинус на единичной окружности', 'Бірлік шеңбердегі синус пен косинус'),
    intro: L('A point moves around a circle of radius 1. Its x-coordinate is the cosine of the angle, its y-coordinate is the sine.', 'Точка движется по окружности радиуса 1. Её координата x - косинус угла, координата y - синус.', 'Нүкте радиусы 1 шеңбер бойымен қозғалады. Оның x координатасы - бұрыштың косинусы, y координатасы - синусы.'),
    sliders: [{ id: 'deg', label: L('angle, °', 'угол, °', 'бұрыш, °'), min: 0, max: 360, step: C, value: 30 }],
    buttons: [L('▶ Rotate', '▶ Крутить', '▶ Айналдыру')],
    play: 'deg',
    playDur: 4000,
    draw(v) {
      const r = 70;
      const cx = 90;
      const cy = 110;
      const a = (v.deg * Math.PI) / 180;
      const px = cx + r * Math.cos(a);
      const py = cy - r * Math.sin(a);
      const wave = plot((d) => cy - r * Math.sin((d * Math.PI) / 180), 0, v.deg, (d) => 180 + (d / 360) * 130, (y) => y, Math.max(2, Math.ceil(v.deg / 3)));
      return {
        svg: `<circle class="ex-ring" cx="${cx}" cy="${cy}" r="${r}"/><line class="ex-axis" x1="10" y1="${cy}" x2="315" y2="${cy}"/><line class="ex-axis" x1="${cx}" y1="25" x2="${cx}" y2="195"/>
          <line class="ex-cos" x1="${cx}" y1="${cy}" x2="${n1(px)}" y2="${cy}"/><line class="ex-sin" x1="${n1(px)}" y1="${cy}" x2="${n1(px)}" y2="${n1(py)}"/><line class="ex-rad" x1="${cx}" y1="${cy}" x2="${n1(px)}" y2="${n1(py)}"/>
          <circle class="ex-dot" cx="${n1(px)}" cy="${n1(py)}" r="6"/><path class="ex-curve thin" d="${wave}"/><line class="ex-axis" x1="180" y1="25" x2="180" y2="195"/>
          <text class="ex-tag t-cos" x="12" y="20">cos = ${fmt(Math.cos(a))}</text><text class="ex-tag t-sin" x="12" y="210">sin = ${fmt(Math.sin(a))}</text>`,
        caption: L(`Angle ${fmt(v.deg)}°: cos = ${fmt(Math.cos(a))} (green, along x), sin = ${fmt(Math.sin(a))} (pink, along y). On the right, the sine traced as a wave.`, `Угол ${fmt(v.deg)}°: cos = ${fmt(Math.cos(a))} (зелёный отрезок по x), sin = ${fmt(Math.sin(a))} (розовый по y). Справа - синус, нарисованный как волна.`, `Бұрыш ${fmt(v.deg)}°: cos = ${fmt(Math.cos(a))} (x бойынша жасыл кесінді), sin = ${fmt(Math.sin(a))} (y бойынша қызғылт). Оң жақта - толқын түріндегі синус.`),
      };
    },
  },

  derivative: {
    title: L('The derivative is the slope of the tangent', 'Производная - наклон касательной', 'Туынды - жанаманың көлбеулігі'),
    intro: L('Take a secant through two close points of the graph and bring them together: the secant turns into the tangent, and its slope is the derivative.', 'Проведём секущую через две близкие точки графика и будем сближать их: секущая превратится в касательную, а её наклон - это производная.', 'График екі жақын нүктесі арқылы қиюшы жүргізіп, оларды жақындатайық: қиюшы жанамаға айналады, ал оның көлбеулігі - туынды.'),
    sliders: [
      { id: 'x0', label: 'x₀', min: -2, max: 2, step: C, value: 0.5 },
      { id: 'h', label: 'h', min: 0, max: 2, step: C, value: 1.5 },
    ],
    buttons: [L('▶ h → 0', '▶ h → 0', '▶ h → 0')],
    play: 'h',
    playReverse: true,
    draw(v) {
      const fn = (x) => (x * x * x) / 3 - x;
      const df = (x) => x * x - 1;
      const sx = (x) => 160 + x * 55;
      const sy = (y) => 110 - y * 55;
      const path = plot(fn, -2.6, 2.6, sx, sy, 110);
      const x0 = v.x0;
      const x1 = x0 + v.h;
      const k = v.h > 0.001 ? (fn(x1) - fn(x0)) / v.h : df(x0);
      const line = (m) => `M${sx(-3)} ${n1(sy(fn(x0) + m * (-3 - x0)))} L${sx(3)} ${n1(sy(fn(x0) + m * (3 - x0)))}`;
      return {
        svg: `<line class="ex-axis" x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}"/><line class="ex-axis" x1="${sx(0)}" y1="0" x2="${sx(0)}" y2="${H}"/>
          <path class="ex-curve" d="${path}"/><path class="ex-tan" d="${line(df(x0))}"/><path class="ex-sec" d="${line(k)}" opacity="${v.h > 0.001 ? 1 : 0}"/><circle class="ex-dot dot-root" cx="${n1(sx(x1))}" cy="${n1(sy(fn(x1)))}" r="${v.h > 0.001 ? 5 : 0}"/><circle class="ex-dot" cx="${n1(sx(x0))}" cy="${n1(sy(fn(x0)))}" r="6"/>
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
          return `<rect class="ex-bar" x="${30 + i * 46}" y="${n1(180 - h)}" width="34" height="${n1(h)}" rx="4"/><text class="ex-small" x="${47 + i * 46}" y="198">${i + 1}</text><text class="ex-tiny" x="${47 + i * 46}" y="${n1(174 - h)}">${total ? Math.round(share * 100) : 0}%</text>`;
        })
        .join('');
      const ideal = 180 - 300 / 6;
      return {
        svg: `<line class="ex-axis" x1="20" y1="180" x2="310" y2="180"/>${bars}<line class="ex-ideal" x1="20" y1="${ideal}" x2="310" y2="${ideal}"/><text class="ex-tag" x="210" y="${ideal - 6}">1/6 ≈ ${fmt(100 / 6, 1)}%</text>
          ${st.last ? `<text class="ex-die" x="285" y="40" data-key="${total}">${'⚀⚁⚂⚃⚄⚅'[st.last - 1]}</text>` : '<g/>'}<text class="ex-tag" x="8" y="18">N = ${total}</text>`,
        caption: total
          ? L(`After ${total} rolls the bars are ${total < 60 ? 'still uneven - chance plays a big role' : 'getting close to the dashed line at 1/6'}.`, `После ${total} бросков столбики ${total < 60 ? 'ещё неровные - случай играет большую роль' : 'приближаются к пунктиру на уровне 1/6'}.`, `${total} лақтырудан кейін бағаналар ${total < 60 ? 'әлі тегіс емес - кездейсоқтықтың рөлі үлкен' : '1/6 деңгейіндегі пунктирге жақындап келеді'}.`)
          : L('Press a button to roll.', 'Нажми кнопку, чтобы бросить кубик.', 'Ойын сүйегін лақтыру үшін батырманы бас.'),
      };
    },
  },

  motion: {
    title: L('Moving towards each other', 'Движение навстречу', 'Қарсы қозғалыс'),
    intro: L('When two objects move towards each other, the distance between them shrinks by v₁ + v₂ every hour (the closing speed).', 'Когда два объекта движутся навстречу, расстояние между ними каждый час уменьшается на v₁ + v₂ - это скорость сближения.', 'Екі нысан қарама-қарсы қозғалғанда, олардың арасындағы қашықтық әр сағат сайын v₁ + v₂-ге азаяды - бұл жақындасу жылдамдығы.'),
    sliders: [
      { id: 'S', label: L('S, km', 'S, км', 'S, км'), min: 60, max: 300, step: C, value: 240 },
      { id: 'v1', label: L('v₁, km/h', 'v₁, км/ч', 'v₁, км/сағ'), min: 20, max: 100, step: C, value: 60 },
      { id: 'v2', label: L('v₂, km/h', 'v₂, км/ч', 'v₂, км/сағ'), min: 20, max: 100, step: C, value: 80 },
      { id: 'tt', label: PROGRESS, min: 0, max: 100, step: C, value: 0 },
    ],
    buttons: [L('▶ Go', '▶ Поехали', '▶ Жүрдік')],
    play: 'tt',
    playLinear: true,
    playDur: 3000,
    draw(v) {
      const vs = v.v1 + v.v2;
      const tMeet = v.S / vs;
      const time = (v.tt / 100) * tMeet;
      const x1 = 30 + ((v.v1 * time) / v.S) * 260;
      const x2 = 290 - ((v.v2 * time) / v.S) * 260;
      const gap = Math.max(0, v.S - vs * time);
      const km = u('km', 'км', 'км');
      return {
        svg: `<line class="ex-road" x1="20" y1="120" x2="300" y2="120"/><text class="ex-small" x="30" y="150">A</text><text class="ex-small" x="290" y="150">B</text>
          <text class="ex-car" x="${n1(x1)}" y="114">🚗</text><text class="ex-car flip" x="${n1(x2)}" y="114">🚙</text>
          <text class="ex-tag" x="8" y="20">t = ${fmt(time)} ${t('explain.h')}</text><text class="ex-tag" x="8" y="42">${t('explain.gap')}: ${fmt(gap, 1)} ${km}</text>
          <text class="ex-small" x="160" y="190">t = S / (v₁ + v₂) = ${fmt(v.S)} / ${fmt(vs)} = ${fmt(tMeet)} ${t('explain.h')}</text>`,
        caption: L(`Closing speed ${fmt(v.v1)} + ${fmt(v.v2)} = ${fmt(vs)} km/h. ${fmt(v.S)} km ÷ ${fmt(vs)} km/h = ${fmt(tMeet)} h until they meet.`, `Скорость сближения ${fmt(v.v1)} + ${fmt(v.v2)} = ${fmt(vs)} км/ч. ${fmt(v.S)} км ÷ ${fmt(vs)} км/ч = ${fmt(tMeet)} ч до встречи.`, `Жақындасу жылдамдығы ${fmt(v.v1)} + ${fmt(v.v2)} = ${fmt(vs)} км/сағ. Кездескенге дейін ${fmt(v.S)} км ÷ ${fmt(vs)} км/сағ = ${fmt(tMeet)} сағ.`),
      };
    },
  },

  // ---------- Новые анимации ----------

  linear: {
    title: L('Linear function y = kx + b', 'Линейная функция y = kx + b', 'Сызықтық функция y = kx + b'),
    intro: L('k is the slope: how much y changes when x grows by 1. b is the point where the line crosses the y-axis.', 'k - угловой коэффициент: на сколько меняется y, когда x увеличивается на 1. b - точка, где прямая пересекает ось y.', 'k - бұрыштық коэффициент: x бірге артқанда y қаншаға өзгереді. b - түзудің y осін қиятын нүктесі.'),
    sliders: [
      { id: 'k', label: 'k', min: -3, max: 3, step: C, value: 0.5 },
      { id: 'b', label: 'b', min: -4, max: 4, step: C, value: 1 },
    ],
    buttons: [L('k × 2', 'k × 2', 'k × 2'), L('k → −k', 'k → −k', 'k → −k'), RESET],
    onButton: (i, st, v) => [{ k: clamp(v.k * 2, -3, 3) }, { k: -v.k }, { k: 0.5, b: 1 }][i],
    draw(v) {
      const { k, b } = v;
      const sx = (x) => 160 + x * 20;
      const sy = (y) => 110 - y * 20;
      const y1 = k + b;
      const flat = fmt(k) === '0';
      const root = flat ? null : -b / k;
      return {
        svg: `${axes(sx, sy, [-8, 8], [-5, 5])}<path class="ex-curve" d="M${sx(-9)} ${n1(sy(-9 * k + b))} L${sx(9)} ${n1(sy(9 * k + b))}"/>
          <g class="exc-o"><path class="ex-stroke ex-dash" d="M${sx(0)} ${n1(sy(b))} H${sx(1)} V${n1(sy(b + k))}"/></g>
          <text class="ex-tag tc exc-o" x="${sx(1) + 6}" y="${n1((sy(b) + sy(b + k)) / 2 + 4)}">${fmt(k)}</text>
          <circle class="ex-dot" cx="${sx(0)}" cy="${n1(sy(b))}" r="6"/><circle class="ex-dot dot-root" cx="${sx(1)}" cy="${n1(sy(y1))}" r="4"/>
          ${root !== null && Math.abs(root) < 8 ? `<circle class="ex-dot dot-root" cx="${n1(sx(root))}" cy="${sy(0)}" r="5"/>` : '<g/>'}
          <text class="ex-tag" x="8" y="18">${lineEq(k, b)}</text>`,
        caption: flat
          ? L(`k = 0: the line is horizontal, y is always ${fmt(b)}. b = ${fmt(b)} is where it crosses the y-axis.`, `k = 0: прямая горизонтальна, y всегда равен ${fmt(b)}. b = ${fmt(b)} - точка пересечения с осью y.`, `k = 0: түзу көлденең, y әрқашан ${fmt(b)}. b = ${fmt(b)} - y осімен қиылысу нүктесі.`)
          : L(`k = ${fmt(k)}: when x grows by 1, y ${k > 0 ? 'grows' : 'falls'} by ${fmt(Math.abs(k))} (orange step). b = ${fmt(b)}: the line crosses the y-axis at (0; ${fmt(b)}). It crosses the x-axis at x = −b/k = ${fmt(root)}.`, `k = ${fmt(k)}: когда x растёт на 1, y ${k > 0 ? 'растёт' : 'уменьшается'} на ${fmt(Math.abs(k))} (оранжевая ступенька). b = ${fmt(b)}: прямая пересекает ось y в точке (0; ${fmt(b)}). Ось x - в точке x = −b/k = ${fmt(root)}.`, `k = ${fmt(k)}: x бірге артқанда y ${fmt(Math.abs(k))}-ге ${k > 0 ? 'артады' : 'кемиді'} (қызғылт сары баспалдақ). b = ${fmt(b)}: түзу y осін (0; ${fmt(b)}) нүктесінде қияды. x осін - x = −b/k = ${fmt(root)} нүктесінде.`),
      };
    },
  },

  exponential: {
    title: L('Exponential vs linear growth', 'Показательный рост против линейного', 'Көрсеткіштік өсу мен сызықтық өсу'),
    intro: L('Linear growth adds the same amount every step; exponential growth multiplies by the same number. Sooner or later the exponent always wins.', 'Линейный рост каждый шаг прибавляет одно и то же, показательный - умножает на одно и то же число. Рано или поздно показательный рост всегда обгоняет.', 'Сызықтық өсу әр қадамда бірдей шама қосады, көрсеткіштік өсу бірдей санға көбейтеді. Ерте ме, кеш пе көрсеткіштік өсу әрқашан озады.'),
    sliders: [
      { id: 'a', label: L('multiply by a', 'умножать на a', 'a-ға көбейту'), min: 1.1, max: 3, step: C, value: 1.5 },
      { id: 'd', label: L('add d', 'прибавлять d', 'd қосу'), min: 0.5, max: 5, step: C, value: 3 },
      { id: 'n', label: L('steps n', 'шагов n', 'қадам n'), min: 0, max: 10, step: C, value: 4 },
    ],
    buttons: [L('▶ Grow', '▶ Расти', '▶ Өсу')],
    play: 'n',
    playDur: 4000,
    playLinear: true,
    draw(v) {
      const lin = (n) => 1 + v.d * n;
      const ex = (n) => v.a ** n;
      const ymax = Math.max(lin(v.n), ex(v.n), 5) * 1.15;
      const sx = (n) => 30 + n * 27;
      const sy = (y) => 196 - (y / ymax) * 170;
      const g = (n) => ex(n) - lin(n);
      let cross = 0;
      if (Math.log(v.a) < v.d) {
        let lo = 1e-6;
        let hi = 1;
        while (g(hi) < 0 && hi < 1e4) hi *= 2;
        for (let i = 0; i < 60; i++) {
          const mid = (lo + hi) / 2;
          if (g(mid) < 0) lo = mid;
          else hi = mid;
        }
        cross = hi;
      }
      const ahead = ex(v.n) > lin(v.n);
      return {
        svg: `<line class="ex-axis" x1="30" y1="196" x2="310" y2="196"/><line class="ex-axis" x1="30" y1="14" x2="30" y2="196"/>
          ${Array.from({ length: 11 }, (_, i) => `<text class="ex-tiny" x="${sx(i)}" y="210">${i}</text>`).join('')}<text class="ex-tiny" x="16" y="${n1(sy(ymax / 1.15))}">${fmt(ymax / 1.15, 0)}</text>
          ${cross > 0 && cross <= v.n ? `<line class="ex-grid" x1="${n1(sx(cross))}" y1="14" x2="${n1(sx(cross))}" y2="196" style="stroke-dasharray:4 4"/>` : '<g/>'}
          <g class="exc-o"><path class="ex-stroke" d="${plot(lin, 0, v.n, sx, sy, 60)}"/><circle class="ex-fill" cx="${n1(sx(v.n))}" cy="${n1(sy(lin(v.n)))}" r="5"/></g>
          <g class="exc-p"><path class="ex-stroke" d="${plot(ex, 0, v.n, sx, sy, 80)}"/><circle class="ex-fill" cx="${n1(sx(v.n))}" cy="${n1(sy(ex(v.n)))}" r="5"/></g>
          <text class="ex-tag tc exc-o" x="40" y="22">1 + ${fmt(v.d)}·n = ${fmt(lin(v.n))}</text><text class="ex-tag tc exc-p" x="40" y="40">${fmt(v.a)}ⁿ = ${fmt(ex(v.n))}</text>`,
        caption: L(
          `After ${fmt(v.n)} steps: linear 1 + ${fmt(v.d)}·n = ${fmt(lin(v.n))}, exponential ${fmt(v.a)}ⁿ = ${fmt(ex(v.n))}. ${cross > 0 ? `The exponential overtakes at n ≈ ${fmt(cross)}${ahead ? ' - and then runs away.' : '.'}` : 'Here the exponential is ahead from the very start.'}`,
          `Через ${fmt(v.n)} шагов: линейный рост 1 + ${fmt(v.d)}·n = ${fmt(lin(v.n))}, показательный ${fmt(v.a)}ⁿ = ${fmt(ex(v.n))}. ${cross > 0 ? `Показательный обгоняет при n ≈ ${fmt(cross)}${ahead ? ' - и дальше улетает вверх.' : '.'}` : 'Здесь показательный рост впереди с самого начала.'}`,
          `${fmt(v.n)} қадамнан кейін: сызықтық өсу 1 + ${fmt(v.d)}·n = ${fmt(lin(v.n))}, көрсеткіштік ${fmt(v.a)}ⁿ = ${fmt(ex(v.n))}. ${cross > 0 ? `Көрсеткіштік өсу n ≈ ${fmt(cross)} кезінде озады${ahead ? ' - содан кейін жоғары ұшып кетеді.' : '.'}` : 'Мұнда көрсеткіштік өсу басынан алда.'}`,
        ),
      };
    },
  },

  logarithm: {
    title: L('The logarithm undoes a power', 'Логарифм - обратный к степени', 'Логарифм - дәрежеге кері амал'),
    intro: L('log_b(x) answers the question: to what power must b be raised to get x? Its graph is the mirror image of y = bˣ in the line y = x.', 'log_b(x) отвечает на вопрос: в какую степень нужно возвести b, чтобы получить x? Его график - зеркальное отражение y = bˣ относительно прямой y = x.', 'log_b(x) сұраққа жауап береді: x шығу үшін b-ны қандай дәрежеге шығару керек? Оның графигі y = bˣ графигінің y = x түзуіне қатысты айнадағы бейнесі.'),
    sliders: [
      { id: 'b', label: L('base b', 'основание b', 'негіз b'), min: 1.2, max: 4, step: C, value: 2 },
      { id: 'x', label: 'x', min: 0.1, max: 16, step: C, value: 8 },
    ],
    buttons: [L('x = 1', 'x = 1', 'x = 1'), L('x = b', 'x = b', 'x = b'), L('x = b²', 'x = b²', 'x = b²')],
    onButton: (i, st, v) => ({ x: clamp([1, v.b, v.b * v.b][i], 0.1, 16) }),
    draw(v) {
      const { b, x } = v;
      const y = Math.log(x) / Math.log(b);
      const sx = (X) => 30 + X * 10;
      const sy = (Y) => 170 - Y * 10;
      const lg = plot((X) => Math.log(X) / Math.log(b), 0.02, 29, sx, sy, 160);
      const pw = plot((X) => b ** X, -3, Math.log(22) / Math.log(b), sx, sy, 100);
      const P = [sx(x), sy(y)];
      const Q = [sx(y), sy(x)];
      return {
        svg: `${axes(sx, sy, [-3, 29], [-5, 17])}<line class="ex-ideal" x1="${sx(-3)}" y1="${sy(-3)}" x2="${sx(20)}" y2="${sy(20)}" style="opacity:.5"/>
          <path class="ex-curve thin" d="${pw}"/><path class="ex-curve" d="${lg}"/>
          <g class="exc-m"><line class="ex-stroke ex-dash" style="stroke-width:1.5" x1="${n1(P[0])}" y1="${n1(P[1])}" x2="${n1(Q[0])}" y2="${n1(Q[1])}"/><line class="ex-stroke ex-dash" style="stroke-width:1.5" x1="${n1(P[0])}" y1="${n1(P[1])}" x2="${n1(P[0])}" y2="${sy(0)}"/><line class="ex-stroke ex-dash" style="stroke-width:1.5" x1="${n1(P[0])}" y1="${n1(P[1])}" x2="${sx(0)}" y2="${n1(P[1])}"/></g>
          <circle class="ex-dot" cx="${n1(P[0])}" cy="${n1(clamp(P[1], -10, 230))}" r="6"/><circle class="ex-dot dot-root" cx="${n1(clamp(Q[0], -10, 330))}" cy="${n1(Q[1])}" r="5"/>
          <text class="ex-tag tc exc-p" x="200" y="150">y = log_${fmt(b)}(x)</text><text class="ex-tag t-sin" x="60" y="20">y = ${fmt(b)}ˣ</text>
          <text class="ex-tag" x="200" y="20">log_${fmt(b)}(${fmt(x)}) = ${fmt(y)}</text>`,
        caption: L(
          `log_${fmt(b)}(${fmt(x)}) = ${fmt(y)}, because ${fmt(b)}^${fmt(y)} ≈ ${fmt(x)}. ${x < 1 ? 'For x < 1 the logarithm is negative.' : Math.abs(x - 1) < 0.005 ? 'log of 1 is always 0: b⁰ = 1.' : 'The orange dot on y = bˣ is the same pair of numbers swapped.'}`,
          `log_${fmt(b)}(${fmt(x)}) = ${fmt(y)}, потому что ${fmt(b)}^${fmt(y)} ≈ ${fmt(x)}. ${x < 1 ? 'При x < 1 логарифм отрицательный.' : Math.abs(x - 1) < 0.005 ? 'Логарифм единицы всегда 0: b⁰ = 1.' : 'Оранжевая точка на y = bˣ - та же пара чисел, только переставленная.'}`,
          `log_${fmt(b)}(${fmt(x)}) = ${fmt(y)}, себебі ${fmt(b)}^${fmt(y)} ≈ ${fmt(x)}. ${x < 1 ? 'x < 1 болғанда логарифм теріс.' : Math.abs(x - 1) < 0.005 ? 'Бірдің логарифмі әрқашан 0: b⁰ = 1.' : 'y = bˣ бойындағы қызғылт сары нүкте - орындары ауысқан сол сандар жұбы.'}`,
        ),
      };
    },
  },

  'circle-area': {
    title: L('Why the area of a circle is πr²', 'Почему площадь круга - πr²', 'Неліктен дөңгелектің ауданы πr²'),
    intro: L('Cut the circle into thin rings and straighten each one. The rings line up into a triangle with base 2πr (the circumference) and height r.', 'Разрежем круг на тонкие кольца и распрямим каждое. Кольца сложатся в треугольник с основанием 2πr (длина окружности) и высотой r.', 'Дөңгелекті жұқа сақиналарға бөліп, әрқайсысын түзейік. Сақиналар табаны 2πr (шеңбер ұзындығы), биіктігі r үшбұрыш құрайды.'),
    sliders: [
      { id: 'r', label: 'r', min: 1, max: 5, step: C, value: 3 },
      { id: 'k', label: L('unroll', 'развернуть', 'жазу'), min: 0, max: 1, step: C, value: 0 },
    ],
    buttons: [L('Unroll into a triangle', 'Развернуть в треугольник', 'Үшбұрышқа жазу'), L('Roll back', 'Свернуть обратно', 'Қайта орау')],
    onButton: (i) => ({ k: i === 0 ? 1 : 0, $dur: 1400 }),
    draw(v) {
      const { r, k } = v;
      const s = 9;
      const cx = 160;
      const cy = 95;
      const base = 200;
      const N = 10;
      const M = 36;
      const rings = Array.from({ length: N }, (_, j) => {
        const rho = (r * (j + 0.5)) / N;
        let d = '';
        for (let i = 0; i <= M; i++) {
          const q = i / M - 0.5;
          const th = 2 * Math.PI * q;
          const X = lerp(cx + rho * s * Math.sin(th), cx + 2 * Math.PI * rho * s * q, k);
          const Y = lerp(cy + rho * s * Math.cos(th), base - (r - rho) * s - (r * s) / N / 2, k);
          d += `${i ? 'L' : 'M'}${n1(X)} ${n1(Y)} `;
        }
        return `<path class="ex-ring2${j % 2 ? ' alt' : ''}" style="stroke-width:${n1((r * s) / N + 0.4)}" d="${d}"/>`;
      }).join('');
      const S = Math.PI * r * r;
      const lab = clamp(k * 2 - 1, 0, 1);
      return {
        svg: `${rings}<line class="ex-rad" x1="${cx}" y1="${cy}" x2="${n1(cx + r * s)}" y2="${cy}" opacity="${n1((1 - k) * 10) / 10}"/>
          <g opacity="${n1(lab * 10) / 10}"><text class="ex-small" x="${cx}" y="${base + 15}">2πr = ${fmt(2 * Math.PI * r)}</text><g class="exc-o"><line class="ex-stroke ex-dash" style="stroke-width:1.5" x1="${n1(cx + Math.PI * r * s + 8)}" y1="${base}" x2="${n1(cx + Math.PI * r * s + 8)}" y2="${n1(base - r * s)}"/></g><text class="ex-tag tc exc-o" x="${n1(cx + Math.PI * r * s + 12)}" y="${n1(base - (r * s) / 2 + 4)}">r</text></g>
          <text class="ex-tag" x="8" y="18">S = πr² = ${fmt(S)}</text>`,
        caption:
          k < 0.5
            ? L(`A circle of radius ${fmt(r)} is made of thin rings. Unroll them: the longest ring is the circumference 2πr = ${fmt(2 * Math.PI * r)}.`, `Круг радиуса ${fmt(r)} состоит из тонких колец. Развернём их: самое длинное кольцо - это длина окружности 2πr = ${fmt(2 * Math.PI * r)}.`, `Радиусы ${fmt(r)} дөңгелек жұқа сақиналардан тұрады. Оларды жазайық: ең ұзын сақина - шеңбер ұзындығы 2πr = ${fmt(2 * Math.PI * r)}.`)
            : L(`The rings became a triangle: base 2πr = ${fmt(2 * Math.PI * r)}, height r = ${fmt(r)}. Its area is ½ · 2πr · r = πr² = ${fmt(S)}.`, `Кольца превратились в треугольник: основание 2πr = ${fmt(2 * Math.PI * r)}, высота r = ${fmt(r)}. Его площадь ½ · 2πr · r = πr² = ${fmt(S)}.`, `Сақиналар үшбұрышқа айналды: табаны 2πr = ${fmt(2 * Math.PI * r)}, биіктігі r = ${fmt(r)}. Ауданы ½ · 2πr · r = πr² = ${fmt(S)}.`),
      };
    },
  },

  vectors: {
    title: L('Adding vectors', 'Сложение векторов', 'Векторларды қосу'),
    intro: L('To add two vectors, put the start of the second at the end of the first. The sum goes from the start of the first to the end of the second; coordinates simply add up.', 'Чтобы сложить векторы, приставим начало второго к концу первого. Сумма идёт из начала первого в конец второго, а координаты просто складываются.', 'Векторларды қосу үшін екіншісінің басын біріншісінің соңына қоямыз. Қосынды біріншісінің басынан екіншісінің соңына барады, ал координаталар жай ғана қосылады.'),
    sliders: [
      { id: 'bx', label: 'b: x', min: -4, max: 4, step: C, value: 1 },
      { id: 'by', label: 'b: y', min: -4, max: 4, step: C, value: 2.5 },
    ],
    buttons: [L('Move b to the end of a', 'Перенести b в конец a', 'b-ны a-ның соңына көшіру'), L('Parallelogram: b + a', 'Параллелограмм: b + a', 'Параллелограмм: b + a'), AGAIN],
    draw(v, step, st, f) {
      const ax = 3;
      const ay = 1;
      const { bx, by } = v;
      const P = (x, y) => [120 + x * 20, 130 - y * 20];
      const k1 = clamp(f, 0, 1);
      const k2 = clamp(f - 1, 0, 1);
      const O = P(0, 0);
      const A = P(ax, ay);
      const Bs = P(ax * k1, ay * k1);
      const Be = P(ax * k1 + bx, ay * k1 + by);
      const S = P(ax + bx, ay + by);
      const Bo = P(bx, by);
      const sx = Math.hypot(ax + bx, ay + by);
      return {
        svg: `${axes((x) => 120 + x * 20, (y) => 130 - y * 20, [-6, 10], [-5, 7])}
          <g opacity="${n1(k2 * 10) / 10}">${arrow(O[0], O[1], Bo[0], Bo[1], 'exc-b ex-faint', 2)}${arrow(Bo[0], Bo[1], S[0], S[1], 'exc-p ex-faint', 2)}</g>
          ${arrow(O[0], O[1], A[0], A[1], 'exc-p')}${arrow(Bs[0], Bs[1], Be[0], Be[1], 'exc-b')}
          <g opacity="${n1(k1 * 10) / 10}">${arrow(O[0], O[1], S[0], S[1], 'exc-o', 3)}</g>
          <text class="ex-tag tc exc-p" x="${n1((O[0] + A[0]) / 2)}" y="${n1((O[1] + A[1]) / 2 + 16)}">a</text><text class="ex-tag tc exc-b" x="${n1((Bs[0] + Be[0]) / 2 + 6)}" y="${n1((Bs[1] + Be[1]) / 2)}">b</text>
          <text class="ex-tag tc exc-p" x="8" y="18">a = (3; 1)</text><text class="ex-tag tc exc-b" x="8" y="36">b = (${fmt(bx)}; ${fmt(by)})</text><text class="ex-tag tc exc-o" x="8" y="54" opacity="${n1(k1 * 10) / 10}">a + b = (${fmt(ax + bx)}; ${fmt(ay + by)})</text>`,
        caption: [
          L(`a = (3; 1), b = (${fmt(bx)}; ${fmt(by)}). To add them, move b so that it starts where a ends.`, `a = (3; 1), b = (${fmt(bx)}; ${fmt(by)}). Чтобы сложить, перенесём b так, чтобы он начинался в конце a.`, `a = (3; 1), b = (${fmt(bx)}; ${fmt(by)}). Қосу үшін b-ны a-ның соңынан басталатындай көшіреміз.`),
          L(`a + b goes from the start of a to the end of b: (3 + ${fmt(bx)}; 1 + ${fmt(by)}) = (${fmt(ax + bx)}; ${fmt(ay + by)}), length ${fmt(sx)}.`, `a + b идёт из начала a в конец b: (3 + ${fmt(bx)}; 1 + ${fmt(by)}) = (${fmt(ax + bx)}; ${fmt(ay + by)}), длина ${fmt(sx)}.`, `a + b a-ның басынан b-ның соңына барады: (3 + ${fmt(bx)}; 1 + ${fmt(by)}) = (${fmt(ax + bx)}; ${fmt(ay + by)}), ұзындығы ${fmt(sx)}.`),
          L(`Going along b first and then a ends in the same point: a + b = b + a. The sum is the diagonal of the parallelogram.`, `Если идти сначала по b, потом по a, придём в ту же точку: a + b = b + a. Сумма - диагональ параллелограмма.`, `Алдымен b, содан кейін a бойымен жүрсек, сол нүктеге келеміз: a + b = b + a. Қосынды - параллелограмның диагоналы.`),
        ][step],
      };
    },
  },

  systems: {
    title: L('A system of equations is two lines', 'Система уравнений - это две прямые', 'Теңдеулер жүйесі - екі түзу'),
    intro: L('Each linear equation is a line. The solution of the system is the point that lies on both lines - where they cross.', 'Каждое линейное уравнение - прямая. Решение системы - точка, которая лежит на обеих прямых, то есть их пересечение.', 'Әр сызықтық теңдеу - түзу. Жүйенің шешімі - екі түзуде де жатқан нүкте, яғни олардың қиылысуы.'),
    sliders: [
      { id: 'k1', label: 'k₁', min: -3, max: 3, step: C, value: 1 },
      { id: 'b1', label: 'b₁', min: -4, max: 4, step: C, value: -1 },
      { id: 'k2', label: 'k₂', min: -3, max: 3, step: C, value: -0.5 },
    ],
    buttons: [L('Make them parallel', 'Сделать параллельными', 'Параллель ету'), L('Make them the same line', 'Совместить прямые', 'Түзулерді беттестіру'), RESET],
    onButton: (i, st, v) => [{ k2: v.k1 }, { k2: v.k1, b1: 2 }, { k1: 1, b1: -1, k2: -0.5 }][i],
    draw(v) {
      const { k1, b1, k2 } = v;
      const b2 = 2;
      const sx = (x) => 160 + x * 20;
      const sy = (y) => 110 - y * 20;
      const par = Math.abs(k1 - k2) < 0.005;
      const same = par && Math.abs(b1 - b2) < 0.005;
      const X = par ? 0 : (b2 - b1) / (k1 - k2);
      const Y = k1 * X + b1;
      const line = (k, b, cls) => `<g class="${cls}"><path class="ex-stroke" d="M${sx(-9)} ${n1(sy(-9 * k + b))} L${sx(9)} ${n1(sy(9 * k + b))}"/></g>`;
      const vis = !par && Math.abs(X) < 8 && Math.abs(Y) < 6;
      return {
        svg: `${axes(sx, sy, [-8, 8], [-5, 5])}${line(k2, b2, 'exc-b')}${line(k1, b1, 'exc-p')}
          ${vis ? `<g class="exc-m"><line class="ex-stroke ex-dash" style="stroke-width:1.2" x1="${n1(sx(X))}" y1="${n1(sy(Y))}" x2="${n1(sx(X))}" y2="${sy(0)}"/><line class="ex-stroke ex-dash" style="stroke-width:1.2" x1="${n1(sx(X))}" y1="${n1(sy(Y))}" x2="${sx(0)}" y2="${n1(sy(Y))}"/></g><circle class="ex-dot dot-root" cx="${n1(sx(X))}" cy="${n1(sy(Y))}" r="6"/>` : '<g/><g/>'}
          <text class="ex-tag tc exc-p" x="8" y="18">${lineEq(k1, b1)}</text><text class="ex-tag tc exc-b" x="8" y="36">${lineEq(k2, b2)}</text>`,
        caption: same
          ? L('The lines coincide: every point of the line is a solution - infinitely many solutions.', 'Прямые совпали: каждая точка прямой - решение. Решений бесконечно много.', 'Түзулер беттесті: түзудің әр нүктесі - шешім. Шешімдер шексіз көп.')
          : par
            ? L(`k₁ = k₂ = ${fmt(k1)}: the lines are parallel and never meet - the system has no solutions.`, `k₁ = k₂ = ${fmt(k1)}: прямые параллельны и не пересекаются - у системы нет решений.`, `k₁ = k₂ = ${fmt(k1)}: түзулер параллель, қиылыспайды - жүйенің шешімі жоқ.`)
            : L(`Equate the right sides: ${fmt(k1)}x${term(b1)} = ${fmt(k2)}x + 2 → x = (2 − b₁)/(k₁ − k₂) = ${fmt(X)}, y = ${fmt(Y)}. Solution: (${fmt(X)}; ${fmt(Y)}).`, `Приравняем правые части: ${fmt(k1)}x${term(b1)} = ${fmt(k2)}x + 2 → x = (2 − b₁)/(k₁ − k₂) = ${fmt(X)}, y = ${fmt(Y)}. Решение: (${fmt(X)}; ${fmt(Y)}).`, `Оң жақтарын теңестіреміз: ${fmt(k1)}x${term(b1)} = ${fmt(k2)}x + 2 → x = (2 − b₁)/(k₁ − k₂) = ${fmt(X)}, y = ${fmt(Y)}. Шешімі: (${fmt(X)}; ${fmt(Y)}).`),
      };
    },
  },

  progression: {
    title: L('Arithmetic and geometric progressions', 'Арифметическая и геометрическая прогрессии', 'Арифметикалық және геометриялық прогрессиялар'),
    intro: L('An arithmetic progression adds the same number d each time; a geometric one multiplies by the same number q.', 'Арифметическая прогрессия каждый раз прибавляет одно и то же число d, геометрическая - умножает на одно и то же число q.', 'Арифметикалық прогрессия әр жолы бірдей d санын қосады, геометриялық - бірдей q санына көбейтеді.'),
    sliders: [
      { id: 'a1', label: 'a₁ = b₁', min: 0.5, max: 5, step: C, value: 1 },
      { id: 'd', label: 'd', min: 0, max: 3, step: C, value: 1 },
      { id: 'q', label: 'q', min: 0.5, max: 2, step: C, value: 1.5 },
    ],
    buttons: [L('q = 2: doubling', 'q = 2: удвоение', 'q = 2: екі еселену'), L('d = 0 and q = 1', 'd = 0 и q = 1', 'd = 0 және q = 1')],
    onButton: (i) => [{ q: 2 }, { d: 0, q: 1 }][i],
    draw(v) {
      const { a1, d, q } = v;
      const ar = Array.from({ length: 8 }, (_, i) => a1 + i * d);
      const ge = Array.from({ length: 8 }, (_, i) => a1 * q ** i);
      const top = Math.max(...ar, ...ge);
      const h = (x) => (x / top) * 140;
      const bars = ar
        .map((x, i) => `<rect class="ex-pbar exc-o" x="${22 + i * 37}" y="${n1(186 - h(x))}" width="15" height="${n1(h(x))}" rx="3"/><rect class="ex-pbar exc-p" x="${38 + i * 37}" y="${n1(186 - h(ge[i]))}" width="15" height="${n1(h(ge[i]))}" rx="3"/><text class="ex-tiny" x="${37 + i * 37}" y="200">${i + 1}</text>`)
        .join('');
      const S8 = ((ar[0] + ar[7]) * 8) / 2;
      return {
        svg: `<line class="ex-axis" x1="16" y1="186" x2="314" y2="186"/>${bars}
          <text class="ex-tag tc exc-o" x="8" y="18">aₙ = a₁ + (n − 1)d: a₈ = ${fmt(ar[7])}</text><text class="ex-tag tc exc-p" x="8" y="36">bₙ = b₁·qⁿ⁻¹: b₈ = ${fmt(ge[7])}</text>`,
        caption: L(
          `Arithmetic (orange): +${fmt(d)} each time, a₈ = ${fmt(a1)} + 7·${fmt(d)} = ${fmt(ar[7])}, sum S₈ = (a₁ + a₈)·8/2 = ${fmt(S8)}. Geometric (purple): ×${fmt(q)} each time, b₈ = ${fmt(a1)}·${fmt(q)}⁷ = ${fmt(ge[7])}.${q < 1 ? ' With q < 1 the terms shrink.' : ''}`,
          `Арифметическая (оранжевая): каждый раз +${fmt(d)}, a₈ = ${fmt(a1)} + 7·${fmt(d)} = ${fmt(ar[7])}, сумма S₈ = (a₁ + a₈)·8/2 = ${fmt(S8)}. Геометрическая (фиолетовая): каждый раз ×${fmt(q)}, b₈ = ${fmt(a1)}·${fmt(q)}⁷ = ${fmt(ge[7])}.${q < 1 ? ' При q < 1 члены уменьшаются.' : ''}`,
          `Арифметикалық (қызғылт сары): әр жолы +${fmt(d)}, a₈ = ${fmt(a1)} + 7·${fmt(d)} = ${fmt(ar[7])}, қосынды S₈ = (a₁ + a₈)·8/2 = ${fmt(S8)}. Геометриялық (күлгін): әр жолы ×${fmt(q)}, b₈ = ${fmt(a1)}·${fmt(q)}⁷ = ${fmt(ge[7])}.${q < 1 ? ' q < 1 болғанда мүшелер кемиді.' : ''}`,
        ),
      };
    },
  },

  'mean-median': {
    title: L('Mean and median', 'Среднее и медиана', 'Орта мән және медиана'),
    intro: L('Drag the dots. The mean is the balance point of all values; the median is the middle value after sorting. One outlier pulls the mean, but hardly moves the median.', 'Перетаскивай точки. Среднее - точка равновесия всех значений, медиана - значение посередине после сортировки. Один выброс тянет среднее, а медиана почти не двигается.', 'Нүктелерді сүйре. Орта мән - барлық мәндердің тепе-теңдік нүктесі, медиана - сұрыптаудан кейінгі ортадағы мән. Бір шығыңқы мән орта мәнді тартады, ал медиана әрең қозғалады.'),
    values: { p0: 2, p1: 3, p2: 4, p3: 4.5, p4: 6, p5: 7 },
    sliders: [{ id: 'p6', label: L('last value', 'последнее значение', 'соңғы мән'), min: 0, max: 20, step: C, value: 8.5 }],
    buttons: [L('Add an outlier', 'Добавить выброс', 'Шығыңқы мән қосу'), RESET],
    onButton: (i) => [{ p6: 19.5 }, { p0: 2, p1: 3, p2: 4, p3: 4.5, p4: 6, p5: 7, p6: 8.5 }][i],
    onDrag(key, p, v) {
      v[key] = Math.round(clamp((p.x - 20) / 14, 0, 20) * 100) / 100;
    },
    draw(v) {
      const ks = ['p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
      const xs = ks.map((k) => v[k]);
      const sorted = [...xs].sort((a, b) => a - b);
      const sum = xs.reduce((s, x) => s + x, 0);
      const mean = sum / 7;
      const med = sorted[3];
      const sx = (x) => 20 + x * 14;
      const dots = ks
        .map((k, i) => {
          const y = 66 + i * 12;
          return `<line class="ex-grid" x1="${n1(sx(v[k]))}" y1="${y}" x2="${n1(sx(v[k]))}" y2="160"/><circle class="ex-dot" cx="${n1(sx(v[k]))}" cy="${y}" r="6"/><circle class="ex-hit" data-drag="${k}" cx="${n1(sx(v[k]))}" cy="${y}" r="12"/>`;
        })
        .join('');
      const chips = sorted.map((x, i) => `<rect class="ex-chip${i === 3 ? ' mid' : ''}" x="${16 + i * 42}" y="10" width="38" height="22" rx="7"/><text class="ex-tiny ex-chipt" x="${35 + i * 42}" y="25">${fmt(x, 1)}</text>`).join('');
      return {
        svg: `${chips}<line class="ex-axis" x1="20" y1="160" x2="300" y2="160"/>${[0, 5, 10, 15, 20].map((x) => `<text class="ex-tiny" x="${sx(x)}" y="174">${x}</text>`).join('')}${dots}
          <path class="ex-fill exc-o" d="M${n1(sx(mean))} 162 l-9 16 h18 Z"/><text class="ex-tag tc exc-o" x="${n1(clamp(sx(mean) + 12, 0, 250))}" y="194">x̄ = ${fmt(mean)}</text>
          <g class="exc-g"><line class="ex-stroke" style="stroke-width:3" x1="${n1(sx(med))}" y1="44" x2="${n1(sx(med))}" y2="160"/></g><text class="ex-tag tc exc-g" x="${n1(clamp(sx(med) + 6, 0, 250))}" y="52">Me = ${fmt(med)}</text>`,
        caption: L(
          `Mean = sum ÷ 7 = ${fmt(sum)} ÷ 7 = ${fmt(mean)} (the balance point, orange). Median = the 4th of 7 sorted values = ${fmt(med)} (green).${Math.abs(mean - med) > 1.5 ? ' They differ a lot - a far-away value drags the mean, not the median.' : ''}`,
          `Среднее = сумма ÷ 7 = ${fmt(sum)} ÷ 7 = ${fmt(mean)} (точка равновесия, оранжевая). Медиана = 4-е из 7 упорядоченных значений = ${fmt(med)} (зелёная).${Math.abs(mean - med) > 1.5 ? ' Они сильно разошлись: далёкое значение тянет среднее, но не медиану.' : ''}`,
          `Орта мән = қосынды ÷ 7 = ${fmt(sum)} ÷ 7 = ${fmt(mean)} (тепе-теңдік нүктесі, қызғылт сары). Медиана = реттелген 7 мәннің 4-сі = ${fmt(med)} (жасыл).${Math.abs(mean - med) > 1.5 ? ' Олар қатты алшақтады: алыс мән орта мәнді тартады, медиананы емес.' : ''}`,
        ),
      };
    },
  },

  integral: {
    title: L('The integral as a sum of rectangles', 'Интеграл - сумма прямоугольников', 'Интеграл - тіктөртбұрыштар қосындысы'),
    intro: L('Cover the area under the graph with thin rectangles and add up their areas. The more rectangles, the closer the sum is to the exact area - the integral.', 'Закроем площадь под графиком тонкими прямоугольниками и сложим их площади. Чем больше прямоугольников, тем ближе сумма к точной площади - интегралу.', 'График астындағы ауданды жұқа тіктөртбұрыштармен жауып, аудандарын қосайық. Тіктөртбұрыштар неғұрлым көп болса, қосынды нақты ауданға - интегралға соғұрлым жақын.'),
    sliders: [
      { id: 'b', label: 'b', min: 0.5, max: 3, step: C, value: 2 },
      { id: 'n', label: 'n', min: 1, max: 40, value: 4 },
    ],
    buttons: [L('▶ n → 40', '▶ n → 40', '▶ n → 40')],
    play: 'n',
    playDur: 3000,
    draw(v) {
      const n = Math.round(v.n);
      const { b } = v;
      const sx = (x) => 30 + x * 90;
      const sy = (y) => 196 - y * 19;
      const dx = b / n;
      let sum = 0;
      const rects = Array.from({ length: n }, (_, i) => {
        const x = i * dx;
        const h = x * x;
        sum += h * dx;
        return `<rect class="ex-rect" x="${n1(sx(x))}" y="${n1(sy(h))}" width="${n1(dx * 90)}" height="${n1(h * 19)}"/>`;
      }).join('');
      const exact = (b * b * b) / 3;
      const area = `M${sx(0)} ${sy(0)} ${plot((x) => x * x, 0, b, sx, sy, 60).replace(/^M/, 'L')} L${n1(sx(b))} ${sy(0)} Z`;
      return {
        svg: `<path class="ex-area" d="${area}"/>${rects}<line class="ex-axis" x1="20" y1="196" x2="312" y2="196"/><line class="ex-axis" x1="30" y1="10" x2="30" y2="206"/>
          <path class="ex-curve" d="${plot((x) => x * x, 0, 3.1, sx, sy, 80)}"/><line class="ex-ideal" x1="${n1(sx(b))}" y1="${n1(sy(b * b))}" x2="${n1(sx(b))}" y2="196"/><text class="ex-tiny" x="${n1(sx(b))}" y="210">b</text>
          <text class="ex-tag" x="40" y="22">Σ = ${fmt(sum, 3)}</text><text class="ex-tag tc exc-p" x="40" y="40">∫₀ᵇ x² dx = b³/3 = ${fmt(exact, 3)}</text>`,
        caption: L(
          `${n} rectangles of width Δx = b/n = ${fmt(dx, 3)}: their total area is ${fmt(sum, 3)}. The exact area under y = x² from 0 to ${fmt(b)} is b³/3 = ${fmt(exact, 3)}, the error is ${fmt(exact - sum, 3)}. More rectangles - smaller error: the integral is the limit of these sums.`,
          `${n} прямоугольников шириной Δx = b/n = ${fmt(dx, 3)}: их общая площадь ${fmt(sum, 3)}. Точная площадь под y = x² от 0 до ${fmt(b)} - b³/3 = ${fmt(exact, 3)}, ошибка ${fmt(exact - sum, 3)}. Больше прямоугольников - меньше ошибка: интеграл - это предел таких сумм.`,
          `Ені Δx = b/n = ${fmt(dx, 3)} болатын ${n} тіктөртбұрыш: жалпы ауданы ${fmt(sum, 3)}. y = x² астындағы 0-ден ${fmt(b)}-ге дейінгі нақты аудан b³/3 = ${fmt(exact, 3)}, қателік ${fmt(exact - sum, 3)}. Тіктөртбұрыш көп болса - қателік аз: интеграл - осындай қосындылардың шегі.`,
        ),
      };
    },
  },

  inequality: {
    title: L('Inequalities on the number line', 'Неравенства на числовой прямой', 'Сан түзуіндегі теңсіздіктер'),
    intro: L('Solve ax > b like an equation, but when you divide by a negative number the sign flips. The answer is a ray on the number line.', 'Неравенство ax > b решаем как уравнение, но при делении на отрицательное число знак меняется. Ответ - луч на числовой прямой.', 'ax > b теңсіздігін теңдеу сияқты шешеміз, бірақ теріс санға бөлгенде таңба өзгереді. Жауап - сан түзуіндегі сәуле.'),
    sliders: [
      { id: 'a', label: 'a', min: -5, max: 5, step: C, value: -2 },
      { id: 'b', label: 'b', min: -10, max: 10, step: C, value: 4 },
    ],
    buttons: ['>', '≥', '<', '≤'],
    state: () => ({ s: 0 }),
    pressed: (i, v, st) => i === st.s,
    onButton(i, st) {
      st.s = i;
    },
    draw(v, step, st) {
      const S = ['>', '≥', '<', '≤'];
      const flip = { '>': '<', '≥': '≤', '<': '>', '≤': '≥' };
      const a = Math.abs(v.a) < 0.05 ? 0 : v.a;
      const sign = S[st.s];
      const sx = (x) => 160 + x * 13;
      if (a === 0) {
        const ok = { '>': 0 > v.b, '≥': 0 >= v.b, '<': 0 < v.b, '≤': 0 <= v.b }[sign];
        return {
          svg: `<line class="ex-axis" x1="10" y1="120" x2="310" y2="120"/>${ok ? `<line class="ex-stroke exc-p" style="stroke-width:5" x1="10" y1="120" x2="310" y2="120"/>` : ''}<text class="ex-big" x="160" y="60">0 · x ${sign} ${fmt(v.b)}</text>`,
          caption: L(ok ? 'With a = 0 the inequality is true for every x.' : 'With a = 0 the inequality is never true - no solutions.', ok ? 'При a = 0 неравенство верно при любом x.' : 'При a = 0 неравенство неверно ни при каком x - решений нет.', ok ? 'a = 0 болғанда теңсіздік кез келген x үшін дұрыс.' : 'a = 0 болғанда теңсіздік ешбір x үшін дұрыс емес - шешім жоқ.'),
        };
      }
      const r = v.b / a;
      const s2 = a < 0 ? flip[sign] : sign;
      const right = s2 === '>' || s2 === '≥';
      const closed = s2 === '≥' || s2 === '≤';
      const X = clamp(sx(r), 10, 310);
      return {
        svg: `<text class="ex-big" x="160" y="45">${fmt(a)}x ${sign} ${fmt(v.b)}</text><text class="ex-tag" x="160" y="72" style="text-anchor:middle">x ${s2} ${fmt(r)}</text>
          <line class="ex-axis" x1="10" y1="130" x2="310" y2="130"/>${[-10, -5, 0, 5, 10].map((t) => `<line class="ex-stroke exc-m" x1="${sx(t)}" y1="125" x2="${sx(t)}" y2="135"/><text class="ex-tiny" x="${sx(t)}" y="150">${t}</text>`).join('')}
          <line class="ex-stroke exc-p" style="stroke-width:5" x1="${n1(X)}" y1="130" x2="${right ? 310 : 10}" y2="130"/>
          <circle cx="${n1(X)}" cy="130" r="6" class="${closed ? 'ex-fill exc-p' : 'ex-stroke exc-p'}" style="${closed ? '' : 'fill:var(--surface);stroke-width:2.5'}"/>`,
        caption: L(
          `Divide both sides by ${fmt(a)}: x ${s2} ${fmt(r)}.${a < 0 ? ' a is negative, so the sign flipped!' : ''} ${closed ? 'The point is filled - it belongs to the answer.' : 'The point is empty - it is not included.'}`,
          `Делим обе части на ${fmt(a)}: x ${s2} ${fmt(r)}.${a < 0 ? ' a отрицательное, поэтому знак перевернулся!' : ''} ${closed ? 'Точка закрашена - она входит в ответ.' : 'Точка пустая - она не входит в ответ.'}`,
          `Екі жағын ${fmt(a)}-ге бөлеміз: x ${s2} ${fmt(r)}.${a < 0 ? ' a теріс, сондықтан таңба аударылды!' : ''} ${closed ? 'Нүкте боялған - ол жауапқа кіреді.' : 'Нүкте бос - ол жауапқа кірмейді.'}`,
        ),
      };
    },
  },

  combinatorics: {
    title: L('Arrangements and combinations', 'Размещения и сочетания', 'Орналастырулар мен терулер'),
    intro: L('How many ways to pick k of n? If order matters (podium places) - arrangements n!/(n−k)!. If not (a team) - combinations: divide by k! more.', 'Сколькими способами выбрать k из n? Если порядок важен (места на пьедестале) - размещения n!/(n−k)!. Если нет (команда) - сочетания: делим ещё на k!.', 'n-нен k-ны неше тәсілмен таңдауға болады? Рет маңызды болса (тұғырдағы орындар) - орналастыру n!/(n−k)!. Маңызды болмаса (команда) - теру: тағы k!-ға бөлеміз.'),
    sliders: [
      { id: 'n', label: 'n', min: 1, max: 10, value: 5 },
      { id: 'k', label: 'k', min: 0, max: 10, value: 3 },
    ],
    buttons: [L('Order matters', 'Порядок важен', 'Рет маңызды'), L('Order does not matter', 'Порядок не важен', 'Рет маңызды емес')],
    state: () => ({ ord: 0 }),
    pressed: (i, v, st) => i === st.ord,
    onButton(i, st) {
      st.ord = i;
    },
    draw(v, step, st) {
      const n = Math.round(v.n);
      const k = Math.min(Math.round(v.k), n);
      const f = (x) => (x <= 1 ? 1 : x * f(x - 1));
      const A = f(n) / f(n - k);
      const Cn = A / f(k);
      const res = st.ord ? Cn : A;
      const people = Array.from({ length: n }, (_, i) => `<circle class="ex-fill ${i < k ? 'exc-p' : 'exc-m'}" style="opacity:${i < k ? 1 : 0.35}" cx="${30 + i * 29}" cy="80" r="11"/><text class="ex-tiny" x="${30 + i * 29}" y="84" style="fill:#fff">${i + 1}</text>`).join('');
      const slots = st.ord ? '' : '';
      return {
        svg: `${people}${slots}<text class="ex-big" x="160" y="150">${st.ord ? `C(${n}, ${k})` : `A(${n}, ${k})`} = ${res}</text>
          <text class="ex-tag" x="160" y="180" style="text-anchor:middle">${st.ord ? `${n}! / (${k}! · ${n - k}!)` : `${n}! / ${n - k}!${k ? ` = ${Array.from({ length: k }, (_, i) => n - i).join(' · ')}` : ''}`}</text>`,
        caption: st.ord
          ? L(`Choosing a team of ${k} from ${n}: ${Cn} ways. Each team can be ordered in ${k}! = ${f(k)} ways, so C = A / k! = ${A} / ${f(k)} = ${Cn}.`, `Выбрать команду из ${k} человек среди ${n}: ${Cn} способов. Каждую команду можно упорядочить ${k}! = ${f(k)} способами, поэтому C = A / k! = ${A} / ${f(k)} = ${Cn}.`, `${n} адамнан ${k} адамдық команда таңдау: ${Cn} тәсіл. Әр команданы ${k}! = ${f(k)} тәсілмен реттеуге болады, сондықтан C = A / k! = ${A} / ${f(k)} = ${Cn}.`)
          : L(`Places 1st, 2nd, … for ${k} of ${n}: the first place has ${n} options, the next ${n - 1}, … - in total ${A}.`, `Места 1-е, 2-е, … для ${k} из ${n}: на первое место ${n} вариантов, на следующее ${n - 1}, … - всего ${A}.`, `${n} адамнан ${k} адамға 1-, 2-, … орындар: бірінші орынға ${n} нұсқа, келесіге ${n - 1}, … - барлығы ${A}.`),
      };
    },
  },

  volume: {
    title: L('Volume of prisms, cylinders and cones', 'Объём призмы, цилиндра и конуса', 'Призма, цилиндр және конус көлемі'),
    intro: L('Volume of a prism or cylinder = base area × height. A cone or pyramid with the same base and height holds exactly one third of that.', 'Объём призмы или цилиндра = площадь основания × высота. Конус или пирамида с тем же основанием и высотой вмещают ровно треть этого.', 'Призма немесе цилиндр көлемі = табан ауданы × биіктік. Табаны мен биіктігі бірдей конус не пирамида оның дәл үштен бірін сыйғызады.'),
    sliders: [
      { id: 'r', label: 'r', min: 1, max: 5, step: C, value: 3 },
      { id: 'h', label: 'h', min: 1, max: 8, step: C, value: 5 },
    ],
    buttons: [L('Cylinder', 'Цилиндр', 'Цилиндр'), L('Cone', 'Конус', 'Конус')],
    state: () => ({ k: 0 }),
    pressed: (i, v, st) => i === st.k,
    onButton(i, st) {
      st.k = i;
    },
    draw(v, step, st) {
      const s = 14;
      const R = v.r * s;
      const Hh = v.h * s * 0.9;
      const cx = 95;
      const base = 195;
      const top = base - Hh;
      const ry = R * 0.3;
      const Sb = Math.PI * v.r * v.r;
      const Vc = Sb * v.h;
      const Vv = st.k ? Vc / 3 : Vc;
      const shape = st.k
        ? `<path class="ex-fill exc-o" style="opacity:.55" d="M${n1(cx - R)} ${base} L${cx} ${n1(top)} L${n1(cx + R)} ${base} Z"/>`
        : `<path class="ex-fill exc-b" style="opacity:.45" d="M${n1(cx - R)} ${n1(top)} V${base} A${n1(R)} ${n1(ry)} 0 0 0 ${n1(cx + R)} ${base} V${n1(top)} Z"/><ellipse class="ex-fill exc-b" style="opacity:.7" cx="${cx}" cy="${n1(top)}" rx="${n1(R)}" ry="${n1(ry)}"/>`;
      return {
        svg: `${shape}<ellipse class="ex-stroke exc-m" style="fill:none" cx="${cx}" cy="${base}" rx="${n1(R)}" ry="${n1(ry)}"/>
          <line class="ex-stroke exc-k ex-dash" x1="${cx}" y1="${base}" x2="${cx}" y2="${n1(top)}"/><line class="ex-stroke exc-p" x1="${cx}" y1="${base}" x2="${n1(cx + R)}" y2="${base}"/>
          <text class="ex-tag" x="200" y="60">S = πr² = ${fmt(Sb, 1)}</text>
          <text class="ex-tag" x="200" y="84">V = ${st.k ? '⅓ · ' : ''}S · h</text>
          <text class="ex-big" x="250" y="125">V = ${fmt(Vv, 1)}</text>`,
        caption: st.k
          ? L(`Cone: V = ⅓ πr²h = ⅓ · ${fmt(Sb, 1)} · ${fmt(v.h)} = ${fmt(Vv, 1)}. Three such cones fill a cylinder of the same size.`, `Конус: V = ⅓ πr²h = ⅓ · ${fmt(Sb, 1)} · ${fmt(v.h)} = ${fmt(Vv, 1)}. Три таких конуса заполняют цилиндр того же размера.`, `Конус: V = ⅓ πr²h = ⅓ · ${fmt(Sb, 1)} · ${fmt(v.h)} = ${fmt(Vv, 1)}. Осындай үш конус сол өлшемдегі цилиндрді толтырады.`)
          : L(`Cylinder: V = πr²h = ${fmt(Sb, 1)} · ${fmt(v.h)} = ${fmt(Vv, 1)}. Double r and the volume grows 4 times; double h - only 2 times.`, `Цилиндр: V = πr²h = ${fmt(Sb, 1)} · ${fmt(v.h)} = ${fmt(Vv, 1)}. Увеличь r вдвое - объём вырастет в 4 раза; h вдвое - только в 2 раза.`, `Цилиндр: V = πr²h = ${fmt(Sb, 1)} · ${fmt(v.h)} = ${fmt(Vv, 1)}. r-ді екі есе арттырсаң - көлем 4 есе өседі; h-ты екі есе - тек 2 есе.`),
      };
    },
  },

  complex: {
    title: L('Complex numbers on the plane', 'Комплексные числа на плоскости', 'Жазықтықтағы комплекс сандар'),
    intro: L('z = a + bi is a point (a; b). Its length is |z| = √(a² + b²). Multiplying by i turns the point 90° counterclockwise.', 'z = a + bi - это точка (a; b). Её длина |z| = √(a² + b²). Умножение на i поворачивает точку на 90° против часовой стрелки.', 'z = a + bi - (a; b) нүктесі. Оның ұзындығы |z| = √(a² + b²). i-ге көбейту нүктені сағат тіліне қарсы 90°-қа бұрады.'),
    sliders: [
      { id: 'a', label: 'a', min: -4, max: 4, step: C, value: 3 },
      { id: 'b', label: 'b', min: -4, max: 4, step: C, value: 2 },
    ],
    buttons: [L('× i', '× i', '× i'), L('conjugate', 'сопряжённое', 'түйіндес'), L('z²', 'z²', 'z²')],
    onButton: (i, st, v) => [{ a: -v.b, b: v.a }, { b: -v.b }, { a: clamp(v.a * v.a - v.b * v.b, -4, 4), b: clamp(2 * v.a * v.b, -4, 4) }][i],
    draw(v) {
      const sx = (x) => 160 + x * 24;
      const sy = (y) => 110 - y * 24;
      const mod = Math.hypot(v.a, v.b);
      const arg = (Math.atan2(v.b, v.a) * 180) / Math.PI;
      return {
        svg: `${axes(sx, sy, [-6, 6], [-4, 4])}<text class="ex-tiny" x="305" y="${sy(0) - 6}">Re</text><text class="ex-tiny" x="${sx(0) + 12}" y="12">Im</text>
          ${arrow(sx(0), sy(0), sx(v.a), sy(v.b), 'exc-p', 2.5)}<circle class="ex-fill exc-p" cx="${n1(sx(v.a))}" cy="${n1(sy(v.b))}" r="4"/>
          <line class="ex-stroke exc-m ex-dash" x1="${n1(sx(v.a))}" y1="${n1(sy(v.b))}" x2="${n1(sx(v.a))}" y2="${sy(0)}"/>
          <text class="ex-tag" x="8" y="18">z = ${fmt(v.a)}${term(v.b)}i</text><text class="ex-tag" x="8" y="38">|z| = ${fmt(mod)} · arg ≈ ${fmt(arg, 0)}°</text>`,
        caption: L(
          `z = ${fmt(v.a)}${term(v.b)}i lies at (${fmt(v.a)}; ${fmt(v.b)}), its length |z| = √(${fmt(v.a)}² + ${fmt(v.b)}²) = ${fmt(mod)}. Press × i: the arrow turns 90°, the length stays. i² = −1 - two turns of 90° point the other way.`,
          `z = ${fmt(v.a)}${term(v.b)}i - точка (${fmt(v.a)}; ${fmt(v.b)}), длина |z| = √(${fmt(v.a)}² + ${fmt(v.b)}²) = ${fmt(mod)}. Нажми × i: стрелка повернётся на 90°, длина не изменится. i² = −1 - два поворота на 90° смотрят в обратную сторону.`,
          `z = ${fmt(v.a)}${term(v.b)}i - (${fmt(v.a)}; ${fmt(v.b)}) нүктесі, ұзындығы |z| = √(${fmt(v.a)}² + ${fmt(v.b)}²) = ${fmt(mod)}. × i бас: нұсқар 90°-қа бұрылады, ұзындық өзгермейді. i² = −1 - 90°-тық екі бұрылыс кері жаққа қарайды.`,
        ),
      };
    },
  },

  limit: {
    title: L('Limit of a sequence', 'Предел последовательности', 'Тізбектің шегі'),
    intro: L('A sequence has a limit L if its terms get as close to L as you like when n grows. (1 + 1/n)ⁿ slowly approaches the number e ≈ 2.718.', 'Последовательность имеет предел L, если её члены становятся сколь угодно близки к L при росте n. (1 + 1/n)ⁿ медленно приближается к числу e ≈ 2,718.', 'n өскенде мүшелері L-ге қалағанша жақындаса, тізбектің шегі L болады. (1 + 1/n)ⁿ e ≈ 2,718 санына баяу жақындайды.'),
    sliders: [{ id: 'n', label: 'n', min: 1, max: 60, value: 10 }],
    buttons: ['(1 + 1/n)ⁿ → e', '1/n → 0', '(n + 1)/n → 1'],
    state: () => ({ k: 0 }),
    pressed: (i, v, st) => i === st.k,
    onButton(i, st) {
      st.k = i;
    },
    draw(v, step, st) {
      const F = [(n) => (1 + 1 / n) ** n, (n) => 1 / n, (n) => (n + 1) / n];
      const LIM = [Math.E, 0, 1];
      const top = [3, 1.1, 2.1][st.k];
      const bot = [1.8, 0, 0.9][st.k];
      const N = Math.round(v.n);
      const sx = (n) => 20 + (n / 60) * 290;
      const sy = (y) => 190 - ((y - bot) / (top - bot)) * 170;
      const dots = Array.from({ length: N }, (_, i) => `<circle class="ex-fill exc-p" cx="${n1(sx(i + 1))}" cy="${n1(sy(F[st.k](i + 1)))}" r="${i === N - 1 ? 5 : 2.6}"/>`).join('');
      const val = F[st.k](N);
      return {
        svg: `<line class="ex-axis" x1="20" y1="190" x2="310" y2="190"/><line class="ex-stroke exc-o ex-dash" x1="20" y1="${n1(sy(LIM[st.k]))}" x2="310" y2="${n1(sy(LIM[st.k]))}"/>${dots}
          <text class="ex-tag" x="200" y="${n1(sy(LIM[st.k]) - 8)}">L = ${fmt(LIM[st.k], 3)}</text>
          <text class="ex-tag" x="24" y="20">a(${N}) = ${fmt(val, 4)} · |a − L| = ${fmt(Math.abs(val - LIM[st.k]), 4)}</text>`,
        caption: L(
          `At n = ${N} the term is ${fmt(val, 4)}, only ${fmt(Math.abs(val - LIM[st.k]), 4)} from the limit ${fmt(LIM[st.k], 3)}. Increase n - the gap keeps shrinking but the terms never have to reach the limit exactly.`,
          `При n = ${N} член равен ${fmt(val, 4)}, до предела ${fmt(LIM[st.k], 3)} осталось лишь ${fmt(Math.abs(val - LIM[st.k]), 4)}. Увеличивай n - разница продолжает уменьшаться, хотя члены могут так и не стать равны пределу.`,
          `n = ${N} болғанда мүше ${fmt(val, 4)}, ${fmt(LIM[st.k], 3)} шегіне дейін тек ${fmt(Math.abs(val - LIM[st.k]), 4)} қалды. n-ді арттыр - айырма кішірейе береді, бірақ мүшелер шекке тең болмауы да мүмкін.`,
        ),
      };
    },
  },

  // ===== Вторая пачка: начальная математика, арифметика, матрицы, соли, передача данных =====

  tens: {
    title: L('Tens and ones', 'Десятки и единицы', 'Ондықтар мен бірліктер'),
    intro: L('Any number up to 100 is made of tens (bundles of 10) and ones. 47 = 4 tens and 7 ones.', 'Любое число до 100 складывается из десятков (пачек по 10) и единиц. 47 = 4 десятка и 7 единиц.', '100-ге дейінгі кез келген сан ондықтардан (10-нан бума) және бірліктерден тұрады. 47 = 4 ондық және 7 бірлік.'),
    sliders: [{ id: 'n', label: L('number', 'число', 'сан'), min: 0, max: 99, value: 47 }],
    buttons: ['+1', '+10', '−1', '−10'],
    onButton: (i, st, v) => ({ n: clamp(v.n + [1, 10, -1, -10][i], 0, 99) }),
    draw(v) {
      const n = Math.round(v.n);
      const t = Math.floor(n / 10);
      const o = n % 10;
      const rods = Array.from({ length: t }, (_, i) => `<rect x="${14 + i * 20}" y="60" width="14" height="120" rx="3" class="ex-fill exc-b" style="opacity:.85"/>${Array.from({ length: 9 }, (_, k) => `<line class="ex-stroke" style="stroke:var(--surface);stroke-width:1" x1="${14 + i * 20}" y1="${72 + k * 12}" x2="${28 + i * 20}" y2="${72 + k * 12}"/>`).join('')}`).join('');
      const ones = Array.from({ length: o }, (_, i) => `<rect x="${214 + (i % 3) * 18}" y="${130 - Math.floor(i / 3) * 18}" width="14" height="14" rx="3" class="ex-fill exc-o"/>`).join('');
      return {
        svg: `${rods}${ones}<text class="ex-big" x="160" y="36">${n} = ${t} · 10 + ${o}</text><text class="ex-tiny" x="100" y="200">${u('tens', 'десятки', 'ондықтар')}: ${t}</text><text class="ex-tiny" x="245" y="200">${u('ones', 'единицы', 'бірліктер')}: ${o}</text>`,
        caption: L(`${n} has ${t} ten${t === 1 ? '' : 's'} (blue rods) and ${o} one${o === 1 ? '' : 's'} (orange cubes). When there are 10 ones, they join into a new ten.`, `В числе ${n} - ${t} дес. (синие палочки) и ${o} ед. (оранжевые кубики). Когда единиц набирается 10, они собираются в новый десяток.`, `${n} санында ${t} ондық (көк таяқшалар) және ${o} бірлік (қызғылт сары текшелер). Бірлік 10-ға жеткенде, олар жаңа ондыққа жиналады.`),
      };
    },
  },

  column: {
    title: L('Column addition with carrying', 'Сложение столбиком с переходом', 'Бағанмен қосу (ауыстырумен)'),
    intro: L('Add ones with ones, tens with tens. If the ones make 10 or more, write the ones digit and carry 1 to the tens.', 'Складываем единицы с единицами, десятки с десятками. Если единиц получилось 10 или больше, пишем цифру единиц, а 1 переносим в десятки.', 'Бірліктерді бірліктермен, ондықтарды ондықтармен қосамыз. Бірліктер 10 не одан көп болса, бірліктер цифрын жазып, 1-ді ондықтарға ауыстырамыз.'),
    sliders: [
      { id: 'a', label: 'a', min: 10, max: 999, value: 358 },
      { id: 'b', label: 'b', min: 10, max: 999, value: 276 },
    ],
    buttons: [L('Next digit', 'Следующий разряд', 'Келесі разряд'), RESET],
    state: () => ({ k: 0 }),
    onSlide(key, v, st) {
      st.k = 0;
    },
    onButton(i, st) {
      st.k = i ? 0 : Math.min(st.k + 1, 4);
    },
    draw(v, step, st) {
      const a = Math.round(v.a);
      const b = Math.round(v.b);
      const s = a + b;
      const da = String(a).padStart(4, ' ');
      const db = String(b).padStart(4, ' ');
      const ds = String(s).padStart(4, ' ');
      const carry = [0, 0, 0, 0];
      for (let i = 3, c = 0; i >= 0; i--) {
        const x = (Number(da[i]) || 0) + (Number(db[i]) || 0) + c;
        c = x >= 10 ? 1 : 0;
        if (i > 0) carry[i - 1] = c;
      }
      const X = (i) => 140 + i * 34;
      const shown = (i) => 3 - i < st.k;
      const row = (str, y, cls = '') => [...str].map((ch, i) => `<text class="ex-big${cls}" x="${X(i)}" y="${y}">${ch.trim()}</text>`).join('');
      const carries = carry.map((c, i) => (c && shown(i + 1) ? `<text class="ex-small exc-r" x="${X(i)}" y="44">1</text>` : '')).join('');
      const res = [...ds].map((ch, i) => (shown(i) ? `<text class="ex-big exc-p" x="${X(i)}" y="170">${ch.trim()}</text>` : '')).join('');
      const col = st.k < 4 ? 3 - st.k : -1;
      return {
        svg: `${col >= 0 ? `<rect x="${X(col) - 16}" y="52" width="32" height="128" rx="8" class="ex-fill exc-y" style="opacity:.25"/>` : ''}${carries}${row(da, 82)}<text class="ex-big" x="100" y="118">+</text>${row(db, 118)}<line class="ex-axis" x1="110" y1="134" x2="${X(3) + 20}" y2="134"/>${res}`,
        caption:
          st.k >= 4 || st.k > String(s).length - 1
            ? L(`${a} + ${b} = ${s}. The red 1s are carries.`, `${a} + ${b} = ${s}. Красные единички - это переносы в следующий разряд.`, `${a} + ${b} = ${s}. Қызыл бірліктер - келесі разрядқа ауыстыру.`)
            : L('Press "Next digit": we add the highlighted column, starting from the ones.', 'Нажимай «Следующий разряд»: складываем подсвеченный столбик, начиная с единиц.', '«Келесі разряд» бас: бірліктерден бастап белгіленген бағанды қосамыз.'),
      };
    },
  },

  numline: {
    title: L('Negative numbers on the number line', 'Отрицательные числа на прямой', 'Сан түзуіндегі теріс сандар'),
    intro: L('Adding a positive number moves right, adding a negative moves left. Subtracting a negative is the same as adding a positive: 3 − (−2) = 5.', 'Прибавить положительное - шаг вправо, отрицательное - шаг влево. Вычесть отрицательное - то же, что прибавить положительное: 3 − (−2) = 5.', 'Оң санды қосу - оңға қадам, терісті қосу - солға қадам. Терісті азайту оңды қосумен бірдей: 3 − (−2) = 5.'),
    sliders: [
      { id: 'a', label: 'a', min: -10, max: 10, value: 3 },
      { id: 'b', label: 'b', min: -10, max: 10, value: -5 },
    ],
    buttons: ['a + b', 'a − b'],
    state: () => ({ op: 0 }),
    pressed: (i, v, st) => i === st.op,
    onButton(i, st) {
      st.op = i;
    },
    draw(v, step, st) {
      const a = Math.round(v.a);
      const b = Math.round(v.b);
      const d = st.op ? -b : b;
      const r = a + d;
      const sx = (x) => 160 + x * 7.5;
      const ticks = Array.from({ length: 41 }, (_, i) => i - 20).map((x) => `<line class="ex-stroke exc-m" x1="${sx(x)}" y1="${x % 5 ? 136 : 130}" x2="${sx(x)}" y2="${x % 5 ? 144 : 150}"/>${x % 5 ? '' : `<text class="ex-tiny" x="${sx(x)}" y="166">${x}</text>`}`).join('');
      return {
        svg: `<line class="ex-axis" x1="5" y1="140" x2="315" y2="140"/>${ticks}
          <circle class="ex-fill exc-b" cx="${sx(a)}" cy="140" r="6"/>
          <path class="ex-stroke exc-${d >= 0 ? 'g' : 'r'}" style="fill:none;stroke-width:2.5" d="M${sx(a)} 132 Q${n1((sx(a) + sx(r)) / 2)} ${n1(132 - Math.min(70, Math.abs(d) * 6))} ${sx(r)} 132"/>
          <circle class="ex-fill exc-p" cx="${sx(r)}" cy="140" r="7"/>
          <text class="ex-big" x="160" y="45">${a} ${st.op ? '−' : '+'} ${b < 0 ? `(${fmt(b)})` : b} = ${fmt(r)}</text>`,
        caption: L(
          `Start at ${a}, ${d >= 0 ? `move ${d} to the right` : `move ${-d} to the left`} - you land on ${r}.${st.op && b < 0 ? ' Subtracting a negative number turned into moving right!' : ''}`,
          `Начинаем с ${a}, ${d >= 0 ? `идём на ${d} вправо` : `идём на ${-d} влево`} - попадаем в ${fmt(r)}.${st.op && b < 0 ? ' Вычитание отрицательного числа превратилось в шаг вправо!' : ''}`,
          `${a}-тен бастап, ${d >= 0 ? `оңға ${d} қадам` : `солға ${-d} қадам`} жүреміз - ${fmt(r)}-ге түсеміз.${st.op && b < 0 ? ' Теріс санды азайту оңға қадамға айналды!' : ''}`,
        ),
      };
    },
  },

  areamul: {
    title: L('Multiplication as area', 'Умножение как площадь', 'Көбейту - аудан ретінде'),
    intro: L('a × b is the number of squares in a rectangle a by b. Split a two-digit number into tens and ones - the rectangle splits into easy parts.', 'a × b - это число клеток в прямоугольнике a на b. Разбей двузначное число на десятки и единицы - прямоугольник разделится на простые части.', 'a × b - a-ға b тіктөртбұрыштағы шаршылар саны. Екі таңбалы санды ондықтар мен бірліктерге бөлсең, тіктөртбұрыш оңай бөліктерге бөлінеді.'),
    sliders: [
      { id: 'a', label: 'a', min: 1, max: 19, value: 14 },
      { id: 'b', label: 'b', min: 1, max: 12, value: 6 },
    ],
    buttons: [L('Swap a and b', 'Поменять a и b', 'a мен b-ны ауыстыру')],
    onButton: (i, st, v) => ({ a: clamp(v.b, 1, 19), b: clamp(v.a, 1, 12) }),
    draw(v) {
      const a = Math.round(v.a);
      const b = Math.round(v.b);
      const c = Math.min(14, 280 / Math.max(a, 1), 150 / Math.max(b, 1));
      const t = Math.floor(a / 10) * 10;
      const o = a - t;
      const cells = [];
      for (let y = 0; y < b; y++) for (let x = 0; x < a; x++) cells.push(`<rect x="${n1(20 + x * c)}" y="${n1(50 + y * c)}" width="${n1(c - 1.5)}" height="${n1(c - 1.5)}" rx="2" class="ex-fill ${x < t ? 'exc-b' : 'exc-o'}" style="opacity:.75"/>`);
      return {
        svg: `${cells.join('')}<text class="ex-big" x="160" y="32">${a} × ${b} = ${a * b}</text>${t && o ? `<text class="ex-tag" x="20" y="${n1(70 + b * c)}">${t} × ${b} + ${o} × ${b} = ${t * b} + ${o * b}</text>` : ''}`,
        caption: L(
          `${a} rows of ${b}... or ${b} rows of ${a} - the same ${a * b} squares.${t && o ? ` Split ${a} = ${t} + ${o}: ${t * b} (blue) + ${o * b} (orange) = ${a * b}.` : ''}`,
          `${a} × ${b} = ${a * b} клеток, и от перестановки множителей площадь не меняется.${t && o ? ` Разбей ${a} = ${t} + ${o}: ${t * b} (синие) + ${o * b} (оранжевые) = ${a * b}.` : ''}`,
          `${a} × ${b} = ${a * b} шаршы, көбейткіштердің орнын ауыстырғаннан аудан өзгермейді.${t && o ? ` ${a} = ${t} + ${o} деп бөл: ${t * b} (көк) + ${o * b} (қызғылт сары) = ${a * b}.` : ''}`,
        ),
      };
    },
  },

  decimals: {
    title: L('Decimals: tenths and hundredths', 'Десятичные дроби: десятые и сотые', 'Ондық бөлшектер: ондықтар мен жүздіктер'),
    intro: L('Split a square into 100 small cells. One cell is 0.01, a column of ten is 0.1. So 0.37 = 3 columns and 7 cells.', 'Раздели квадрат на 100 клеток. Одна клетка - 0,01, столбик из десяти - 0,1. Значит, 0,37 = 3 столбика и 7 клеток.', 'Шаршыны 100 торға бөл. Бір тор - 0,01, оннан тұратын баған - 0,1. Демек, 0,37 = 3 баған және 7 тор.'),
    sliders: [{ id: 'x', label: 'x', min: 0, max: 1, step: 0.01, value: 0.37 }],
    buttons: ['+0,1', '+0,01', '−0,01'],
    onButton: (i, st, v) => ({ x: clamp(Math.round((v.x + [0.1, 0.01, -0.01][i]) * 100) / 100, 0, 1) }),
    draw(v) {
      const k = Math.round(v.x * 100);
      const cells = Array.from({ length: 100 }, (_, i) => {
        const col = Math.floor(i / 10);
        const row = i % 10;
        return `<rect x="${20 + col * 17}" y="${30 + (9 - row) * 17}" width="15" height="15" rx="2" class="ex-fill ${i < k ? (col < Math.floor(k / 10) ? 'exc-b' : 'exc-o') : 'exc-m'}" style="opacity:${i < k ? 0.85 : 0.15}"/>`;
      }).join('');
      const t = Math.floor(k / 10);
      const h = k % 10;
      return {
        svg: `${cells}<text class="ex-big" x="260" y="80">${fmt(k / 100)}</text><text class="ex-tag" x="200" y="115">= ${fmt(t / 10, 1)} + ${fmt(h / 100)}</text><text class="ex-tag" x="200" y="140">= ${k}%</text><text class="ex-tag" x="200" y="165">= ${k}/100</text>`,
        caption: L(`${fmt(k / 100)} is ${t} tenths (blue columns) and ${h} hundredths (orange cells) - ${k} cells out of 100, that is ${k}%.`, `${fmt(k / 100)} - это ${t} десятых (синие столбики) и ${h} сотых (оранжевые клетки) - ${k} клеток из 100, то есть ${k}%.`, `${fmt(k / 100)} - бұл ${t} ондық (көк бағандар) және ${h} жүздік (қызғылт сары торлар) - 100-ден ${k} тор, яғни ${k}%.`),
      };
    },
  },

  ratio: {
    title: L('Ratio and proportion', 'Отношения и пропорции', 'Қатынас және пропорция'),
    intro: L('A ratio 2 : 3 means for every 2 parts of one thing there are 3 parts of another. Scale both parts by the same number - the ratio stays the same.', 'Отношение 2 : 3 значит: на каждые 2 части одного приходится 3 части другого. Умножь обе части на одно число - отношение не изменится.', '2 : 3 қатынасы: біреуінің әр 2 бөлігіне екіншісінің 3 бөлігі келеді. Екі бөлікті бір санға көбейтсең - қатынас өзгермейді.'),
    sliders: [
      { id: 'p', label: L('juice parts', 'частей сока', 'шырын бөлігі'), min: 1, max: 6, value: 2 },
      { id: 'q', label: L('water parts', 'частей воды', 'су бөлігі'), min: 1, max: 6, value: 3 },
      { id: 'T', label: L('total, ml', 'всего, мл', 'барлығы, мл'), min: 100, max: 1000, step: 50, value: 500 },
    ],
    buttons: [L('Double the recipe', 'Удвоить рецепт', 'Рецептті екі есе'), RESET],
    onButton: (i, st, v) => [{ T: clamp(v.T * 2, 100, 1000) }, { p: 2, q: 3, T: 500 }][i],
    draw(v) {
      const p = Math.round(v.p);
      const q = Math.round(v.q);
      const part = v.T / (p + q);
      const w = 280 / (p + q);
      const blocks = Array.from({ length: p + q }, (_, i) => `<rect x="${n1(20 + i * w)}" y="80" width="${n1(w - 3)}" height="50" rx="6" class="ex-fill ${i < p ? 'exc-o' : 'exc-b'}" style="opacity:.8"/>`).join('');
      return {
        svg: `<text class="ex-big" x="160" y="45">${p} : ${q}</text>${blocks}<text class="ex-tag" x="20" y="160">${u('one part', 'одна часть', 'бір бөлік')} = ${fmt(v.T, 0)} : ${p + q} = ${fmt(part, 1)}</text><text class="ex-tag" x="20" y="185">${u('juice', 'сок', 'шырын')} ${fmt(part * p, 1)} · ${u('water', 'вода', 'су')} ${fmt(part * q, 1)}</text>`,
        caption: L(`Total ${fmt(v.T, 0)} ml in the ratio ${p} : ${q}: there are ${p + q} equal parts of ${fmt(part, 1)} ml, so juice ${fmt(part * p, 1)} ml and water ${fmt(part * q, 1)} ml.`, `Всего ${fmt(v.T, 0)} мл в отношении ${p} : ${q}: это ${p + q} равных частей по ${fmt(part, 1)} мл, значит сока ${fmt(part * p, 1)} мл, воды ${fmt(part * q, 1)} мл.`, `Барлығы ${fmt(v.T, 0)} мл, қатынасы ${p} : ${q}: бұл ${fmt(part, 1)} мл-ден ${p + q} тең бөлік, демек шырын ${fmt(part * p, 1)} мл, су ${fmt(part * q, 1)} мл.`),
      };
    },
  },

  sieve: {
    title: L('Prime numbers: the sieve of Eratosthenes', 'Простые числа: решето Эратосфена', 'Жай сандар: Эратосфен елегі'),
    intro: L('Cross out all multiples of 2, then of 3, 5, 7… What is left are primes - numbers divisible only by 1 and themselves.', 'Вычеркни все числа, кратные 2, потом 3, 5, 7… Останутся простые - числа, которые делятся только на 1 и на себя.', '2-ге еселі барлық сандарды сыз, кейін 3, 5, 7-ге… Жай сандар қалады - тек 1-ге және өзіне бөлінетін сандар.'),
    sliders: [],
    buttons: [L('Next prime', 'Следующее простое', 'Келесі жай сан'), L('▶ All', '▶ Всё', '▶ Барлығы'), RESET],
    state: () => ({ done: [] }),
    onButton(i, st, v, api) {
      const next = () => {
        const p = [2, 3, 5, 7].find((x) => !st.done.includes(x));
        if (p) st.done.push(p);
        return Boolean(p);
      };
      if (i === 0) next();
      else if (i === 1) api.run(() => next(), 700);
      else {
        api.stop();
        st.done = [];
      }
    },
    draw(v, step, st) {
      const crossedBy = (n) => st.done.find((p) => n !== p && n % p === 0);
      const cells = Array.from({ length: 100 }, (_, i) => {
        const n = i + 1;
        const by = crossedBy(n);
        const prime = n > 1 && !by && st.done.length === 4;
        const x = 12 + (i % 10) * 30;
        const y = 12 + Math.floor(i / 10) * 20;
        const color = n === 1 ? 'exc-m' : by ? ['exc-r', 'exc-o', 'exc-b', 'exc-k'][[2, 3, 5, 7].indexOf(by)] : prime || st.done.includes(n) ? 'exc-g' : '';
        return `<text class="ex-tiny ${color}" x="${x + 13}" y="${y + 13}" style="${by || n === 1 ? 'opacity:.35;text-decoration:line-through' : prime || st.done.includes(n) ? 'font-weight:900' : ''}">${n}</text>`;
      }).join('');
      const left = Array.from({ length: 99 }, (_, i) => i + 2).filter((n) => !crossedBy(n)).length;
      return {
        svg: cells,
        caption: st.done.length
          ? L(`Crossed out multiples of ${st.done.join(', ')}. ${st.done.length === 4 ? `The ${left} numbers left are all the primes up to 100.` : `${left} numbers are still left.`}`, `Вычеркнуты кратные ${st.done.join(', ')}. ${st.done.length === 4 ? `Оставшиеся ${left} чисел - все простые числа до 100.` : `Осталось ещё ${left} чисел.`}`, `${st.done.join(', ')}-ге еселілер сызылды. ${st.done.length === 4 ? `Қалған ${left} сан - 100-ге дейінгі барлық жай сандар.` : `Әлі ${left} сан қалды.`}`)
          : L('Press "Next prime": we start with 2.', 'Нажми «Следующее простое» - начнём с 2.', '«Келесі жай сан» бас - 2-ден бастаймыз.'),
      };
    },
  },

  matrix: {
    title: L('A matrix transforms the plane', 'Матрица преобразует плоскость', 'Матрица жазықтықты түрлендіреді'),
    intro: L('A 2×2 matrix sends the vector (1; 0) to its first column and (0; 1) to its second. The unit square becomes a parallelogram whose area is the determinant.', 'Матрица 2×2 переводит вектор (1; 0) в свой первый столбец, а (0; 1) - во второй. Единичный квадрат становится параллелограммом, его площадь - определитель.', '2×2 матрица (1; 0) векторын бірінші бағанына, (0; 1)-ді екіншісіне апарады. Бірлік шаршы параллелограмға айналады, оның ауданы - анықтауыш.'),
    sliders: [
      { id: 'a', label: 'a', min: -2, max: 2, step: C, value: 1.5 },
      { id: 'b', label: 'b', min: -2, max: 2, step: C, value: 0.5 },
      { id: 'c', label: 'c', min: -2, max: 2, step: C, value: 0 },
      { id: 'd', label: 'd', min: -2, max: 2, step: C, value: 1 },
    ],
    buttons: [L('Identity', 'Единичная', 'Бірлік'), L('Rotate 90°', 'Поворот 90°', '90° бұру'), L('det = 0', 'det = 0', 'det = 0')],
    onButton: (i) => [{ a: 1, b: 0, c: 0, d: 1 }, { a: 0, b: -1, c: 1, d: 0 }, { a: 1, b: 2, c: 0.5, d: 1 }][i],
    draw(v) {
      const sx = (x) => 160 + x * 32;
      const sy = (y) => 110 - y * 32;
      const P = (x, y) => [v.a * x + v.b * y, v.c * x + v.d * y];
      const pts = [P(0, 0), P(1, 0), P(1, 1), P(0, 1)].map(([x, y]) => `${n1(sx(x))},${n1(sy(y))}`).join(' ');
      const det = v.a * v.d - v.b * v.c;
      return {
        svg: `${axes(sx, sy, [-5, 5], [-3, 3])}<polygon points="${sx(0)},${sy(0)} ${sx(1)},${sy(0)} ${sx(1)},${sy(1)} ${sx(0)},${sy(1)}" class="ex-fill exc-m" style="opacity:.2"/>
          <polygon points="${pts}" class="ex-fill exc-p" style="opacity:.35"/>${arrow(sx(0), sy(0), sx(v.a), sy(v.c), 'exc-o', 2.5)}${arrow(sx(0), sy(0), sx(v.b), sy(v.d), 'exc-b', 2.5)}
          <text class="ex-tag" x="8" y="18">(${fmt(v.a)} ${fmt(v.b)} / ${fmt(v.c)} ${fmt(v.d)})</text><text class="ex-tag" x="8" y="38">det = ad − bc = ${fmt(det)}</text>`,
        caption: L(
          `The orange arrow is the first column (${fmt(v.a)}; ${fmt(v.c)}), the blue one the second (${fmt(v.b)}; ${fmt(v.d)}). det = ${fmt(det)}: the area changed ${fmt(Math.abs(det))} times${det < 0 ? ', and the picture is flipped' : ''}${Math.abs(det) < 0.01 ? ' - everything is squashed onto a line, there is no inverse matrix' : ''}.`,
          `Оранжевая стрелка - первый столбец (${fmt(v.a)}; ${fmt(v.c)}), синяя - второй (${fmt(v.b)}; ${fmt(v.d)}). det = ${fmt(det)}: площадь изменилась в ${fmt(Math.abs(det))} раза${det < 0 ? ', а фигура перевернулась' : ''}${Math.abs(det) < 0.01 ? ' - всё сплющилось в прямую, обратной матрицы нет' : ''}.`,
          `Қызғылт сары нұсқар - бірінші баған (${fmt(v.a)}; ${fmt(v.c)}), көгі - екінші (${fmt(v.b)}; ${fmt(v.d)}). det = ${fmt(det)}: аудан ${fmt(Math.abs(det))} есе өзгерді${det < 0 ? ', ал фигура аударылды' : ''}${Math.abs(det) < 0.01 ? ' - бәрі түзуге жаншылды, кері матрица жоқ' : ''}.`,
        ),
      };
    },
  },

};

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
      return `${T(14, 26, u('was: 100%', 'было: 100%', 'болды: 100%'), 'm11 ex-start exm-mut')}${box(14, 32, sx(NN) - 14, 26, 'exc-b', 5, 0.85)}${T(sx(NN) - 6, 50, fmt(NN), 'm12 ex-end exm-on')}
        ${T(14, 84, `${u('now', 'стало', 'болды')}: ${fmt(100 + sg * pp)}%`, 'm11 ex-start exm-mut')}${box(14, 90, sx(nw) - 14, 26, 'exc-p', 5, 0.85)}${nw > top * 0.15 ? T(sx(nw) - 6, 108, fmt(nw), 'm12 ex-end exm-on') : T(sx(nw) + 4, 108, fmt(nw), 'm12 ex-start')}
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
        ${head}${T(312, 18, `Δy/Δx = ${fmt(ks)}`, 'm11 tc exc-o ex-end h')}${T(312, 34, `f′(${fmt(x0)}) = ${fmt(kz)}`, 'm11 tc exc-g ex-end h')}`,
      caption: h <= 0.001 ? L(`h = 0: the two points merged, the secant became the tangent with slope f′(${fmt(x0)}) = ${F.ds} = ${fmt(kz)}.`, `h = 0: точки слились, секущая стала касательной с наклоном f′(${fmt(x0)}) = ${F.ds} = ${fmt(kz)}.`, `h = 0: нүктелер қосылды, қиюшы көлбеулігі f′(${fmt(x0)}) = ${F.ds} = ${fmt(kz)} жанамаға айналды.`) : L(
        `Secant slope Δy/Δx = (f(x₀ + h) − f(x₀))/h = ${fmt(y1 - y0)}/${fmt(h)} = ${fmt(ks)}. As h → 0 it tends to f′(x₀) = ${F.ds} = ${fmt(kz)} - the slope of the green tangent. Press ▶.`,
        `Наклон секущей Δy/Δx = (f(x₀ + h) − f(x₀))/h = ${fmt(y1 - y0)}/${fmt(h)} = ${fmt(ks)}. При h → 0 он стремится к f′(x₀) = ${F.ds} = ${fmt(kz)} - наклону зелёной касательной. Нажми ▶.`,
        `Қиюшы көлбеулігі Δy/Δx = (f(x₀ + h) − f(x₀))/h = ${fmt(y1 - y0)}/${fmt(h)} = ${fmt(ks)}. h → 0 болғанда ол f′(x₀) = ${F.ds} = ${fmt(kz)} мәніне - жасыл жанаманың көлбеулігіне ұмтылады. ▶ бас.`,
      ),
    };
  },
});

export const SCENES_MATH = {
  ...OLD,
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
};
