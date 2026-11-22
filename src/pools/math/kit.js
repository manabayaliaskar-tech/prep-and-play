// Помощники для тем 1-6 классов: короткая сборка заданий, слова для задач и простые чертежи (SVG).

import { pick, randomInt } from '../../core/random.js';
import { L, ask, n, plural, poolQ, steps, textOf, val } from '../gen.js';

export const MINUS = '−';
export const TIMES = '×';
export const DIV = ':';
export const R = randomInt;
export const one = pick;

/** Случайный вариант задания: kinds - массив функций без аргументов. */
export const anyOf = (rng, kinds) => pick(rng, kinds)();

/** Задание с числовым ответом. wrong - типичные ошибки (числа или why()). min - самое маленькое допустимое значение вариантов. */
export function qNum(ctx, id, d, prompt, ex, ans, wrong, { fig = null, spr = 0.3, fmt, display, min = 0 } = {}) {
  const ok = (w) => {
    const v = val(w);
    return typeof v === 'number' && Number.isFinite(v) && Math.abs(v - ans) > 1e-9 && v >= min;
  };
  const step = Number.isInteger(ans) ? 1 : 0.1;
  const pad = [1, 2, 3, 4, 5, 6].flatMap((k) => [ans + k * step, ans - k * step]).map((x) => Math.round(x * 1000) / 1000);
  const ws = [...wrong.filter(ok), ...pad.filter(ok)];
  const opts = { spr };
  if (fmt) opts.fmt = fmt;
  if (display) opts.display = display;
  return poolQ(id, d, { prompt, ex: steps(...ex), figure: fig, ...ask(ctx, ans, ws, opts) });
}

/** Задание с вариантами-текстами: correct + неправильные (берутся первые три разных). */
export function qText(ctx, id, d, prompt, ex, correct, wrong, { fig = null } = {}) {
  const key = (x) => `${textOf(x, 'en')}|${textOf(x, 'ru')}`;
  const seen = new Set([key(correct)]);
  const ws = [];
  for (const w of wrong) {
    if (ws.length === 3) break;
    if (w === undefined || w === null) continue;
    const k = key(w);
    if (!seen.has(k)) {
      seen.add(k);
      ws.push(w);
    }
  }
  if (ws.length < 2) throw new Error(`${id}: мало вариантов для ${key(correct)}`);
  const all = [correct, ...ws];
  const order = all.map((_, i) => [ctx.rng(), i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  return poolQ(id, d, { prompt, ex: steps(...ex), figure: fig, mc: { choices: order.map((i) => all[i]), answer: order.indexOf(0) } });
}

// ---------- Слова для задач ----------

/** Имена: [en, ru, kk, девочка]. */
export const NAMES = [
  ['Ali', 'Али', 'Әли', 0],
  ['Dana', 'Дана', 'Дана', 1],
  ['Timur', 'Тимур', 'Тимур', 0],
  ['Aru', 'Ару', 'Ару', 1],
  ['Arman', 'Арман', 'Арман', 0],
  ['Mira', 'Мира', 'Мира', 1],
  ['Erlan', 'Ерлан', 'Ерлан', 0],
  ['Asel', 'Асель', 'Әсел', 1],
];
/** Глагол прошедшего времени по роду: g(name, 'купил', 'купила'). */
export const g = (name, m, f) => (name[3] ? f : m);

/** Предметы: [en ед., en мн., [ru вин. ед., ru 2-4, ru 5+], kk]. */
export const ITEMS = [
  ['apple', 'apples', ['яблоко', 'яблока', 'яблок'], 'алма'],
  ['pencil', 'pencils', ['карандаш', 'карандаша', 'карандашей'], 'қарындаш'],
  ['book', 'books', ['книгу', 'книги', 'книг'], 'кітап'],
  ['ball', 'balls', ['мяч', 'мяча', 'мячей'], 'доп'],
  ['sweet', 'sweets', ['конфету', 'конфеты', 'конфет'], 'кәмпит'],
  ['flower', 'flowers', ['цветок', 'цветка', 'цветков'], 'гүл'],
  ['sticker', 'stickers', ['наклейку', 'наклейки', 'наклеек'], 'жапсырма'],
  ['notebook', 'notebooks', ['тетрадь', 'тетради', 'тетрадей'], 'дәптер'],
  ['pear', 'pears', ['грушу', 'груши', 'груш'], 'алмұрт'],
  ['marker', 'markers', ['фломастер', 'фломастера', 'фломастеров'], 'фломастер'],
];
/** «5 apples» / «5 яблок» / «5 алма». */
export const cnt = (k, it) => L(`${n(k)} ${k === 1 ? it[0] : it[1]}`, `${n(k)} ${plural(k, ...it[2])}`, `${n(k)} ${it[3]}`);

/** Две разные случайные записи из списка. */
export function two(rng, list) {
  const a = pick(rng, list);
  let b = pick(rng, list);
  while (b === a) b = pick(rng, list);
  return [a, b];
}

/** «3 дня», «5 минут» - русское слово после числа. */
export const ru = (k, forms) => `${n(k)} ${plural(k, ...forms)}`;

// ---------- Казахские окончания после чисел ----------

const KK_UNITS = ['', 'бір', 'екі', 'үш', 'төрт', 'бес', 'алты', 'жеті', 'сегіз', 'тоғыз'];
const KK_TENS = ['', 'он', 'жиырма', 'отыз', 'қырық', 'елу', 'алпыс', 'жетпіс', 'сексен', 'тоқсан'];
/** Последнее слово в названии числа (по нему выбирается окончание). */
function kkLast(x) {
  const v = Math.abs(Math.round(x));
  if (!Number.isInteger(x)) return KK_UNITS[Number(String(x).slice(-1))];
  if (v === 0) return 'нөл';
  if (v % 10) return KK_UNITS[v % 10];
  if (v % 100) return KK_TENS[(v % 100) / 10];
  if (v % 1000) return 'жүз';
  if (v % 1e6) return 'мың';
  return 'миллион';
}
const back = (w) => /[аоұыя]/.test(w.replace(/.*([аәоөұүыіеэиуя])[^аәоөұүыіеэиуя]*$/, '$1'));
const lastCh = (w) => w[w.length - 1];
/** Дательный падеж: 5-ке, 6-ға, 10-ға, 3-ке. */
export function kkDat(x) {
  const w = kkLast(x);
  const hard = /[кқпстшфхцч]/.test(lastCh(w));
  return `${n(x).replace('.', ',')}-${back(w) ? (hard ? 'қа' : 'ға') : hard ? 'ке' : 'ге'}`;
}
/** Исходный падеж: 5-тен, 6-дан, 10-нан. */
export function kkAbl(x) {
  const w = kkLast(x);
  const c = lastCh(w);
  const t = /[мнң]/.test(c) ? 'н' : /[кқпстшфхцчбвгд]/.test(c) ? 'т' : 'д';
  return `${n(x).replace('.', ',')}-${t}${back(w) ? 'ан' : 'ен'}`;
}

/** Местный падеж: 5-те, 6-да, 10-да. */
export function kkLoc(x) {
  const w = kkLast(x);
  const hard = /[кқпстшфхцч]/.test(lastCh(w));
  return `${n(x).replace('.', ',')}-${hard ? 'т' : 'д'}${back(w) ? 'а' : 'е'}`;
}
/** Время с окончанием местного падежа: 8:30-да, 8:05-те, 8:00-де. */
export function kkAt(h, m) {
  const w = kkLoc(m || h);
  return `${h}:${String(m).padStart(2, '0')}${w.slice(w.indexOf('-'))}`;
}

// ---------- Чертежи ----------

const C = ['var(--primary)', 'var(--accent)', 'var(--blue, #3b82f6)', 'var(--orange, #f97316)'];
export const COLORS = [
  // [en, ru (м. р.), ru (ж. р.), kk, цвет]
  ['red', 'красный', 'красная', 'қызыл', '#ef4444'],
  ['blue', 'синий', 'синяя', 'көк', '#3b82f6'],
  ['green', 'зелёный', 'зелёная', 'жасыл', '#22c55e'],
  ['yellow', 'жёлтый', 'жёлтая', 'сары', '#eab308'],
];

export const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" class="geo" role="img" aria-label="figure">${inner}</svg>`;
export const txt = (x, y, s, { cls = 'geo-l', anchor = 'middle', size = '' } = {}) =>
  `<text x="${r1(x)}" y="${r1(y)}" class="${cls}" text-anchor="${anchor}"${size ? ` font-size="${size}"` : ''}>${s}</text>`;
const r1 = (x) => Math.round(x * 10) / 10;
const STROKE = 'stroke="currentColor" stroke-width="2" stroke-linejoin="round"';

/** Одна фигурка для счёта и рядов: kind 0 - круг, 1 - квадрат, 2 - треугольник, 3 - звезда, 4 - прямоугольник. */
export function shape(kind, cx, cy, s, fill) {
  const h = s / 2;
  if (kind === 0) return `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(h)}" fill="${fill}" ${STROKE}/>`;
  if (kind === 1) return `<rect x="${r1(cx - h)}" y="${r1(cy - h)}" width="${s}" height="${s}" fill="${fill}" ${STROKE}/>`;
  if (kind === 2) return `<polygon points="${r1(cx)},${r1(cy - h)} ${r1(cx + h)},${r1(cy + h)} ${r1(cx - h)},${r1(cy + h)}" fill="${fill}" ${STROKE}/>`;
  if (kind === 4) return `<rect x="${r1(cx - h)}" y="${r1(cy - h * 0.6)}" width="${s}" height="${r1(s * 0.6)}" fill="${fill}" ${STROKE}/>`;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? h * 0.45 : h;
    pts.push(`${r1(cx + rr * Math.cos(a))},${r1(cy + rr * Math.sin(a))}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" ${STROKE}/>`;
}

/** Предметы для счёта рядами по 5. */
export function countSvg(count, kind, color = C[0]) {
  const per = 5;
  const rows = Math.ceil(count / per);
  const s = 30;
  const items = [];
  for (let i = 0; i < count; i++) items.push(shape(kind, 30 + (i % per) * 44 + (Math.floor(i / per) % 2 ? 0 : 0), 28 + Math.floor(i / per) * 42, s, color));
  return svg(250, 16 + rows * 42, items.join(''));
}

/** Десятки (палочки по 10) и единицы (кружки). */
export function tensSvg(tens, ones) {
  const parts = [];
  for (let i = 0; i < tens; i++) {
    const x = 14 + i * 22;
    parts.push(`<rect x="${x}" y="10" width="14" height="120" rx="3" fill="${C[0]}" ${STROKE}/>`);
    for (let k = 1; k < 10; k++) parts.push(`<line x1="${x}" y1="${10 + k * 12}" x2="${x + 14}" y2="${10 + k * 12}" stroke="currentColor" stroke-width="1"/>`);
  }
  const x0 = 24 + tens * 22;
  for (let i = 0; i < ones; i++) parts.push(`<circle cx="${x0 + (i % 3) * 20}" cy="${20 + Math.floor(i / 3) * 20}" r="8" fill="${C[1]}" ${STROKE}/>`);
  return svg(Math.max(120, x0 + 70), 140, parts.join(''));
}

/** Циферблат: h - часы, m - минуты. */
export function clockSvg(h, m) {
  const cx = 90;
  const cy = 90;
  const parts = [`<circle cx="${cx}" cy="${cy}" r="78" fill="var(--fig-fill)" stroke="currentColor" stroke-width="3"/>`];
  for (let i = 1; i <= 12; i++) {
    const a = (i * Math.PI) / 6 - Math.PI / 2;
    parts.push(txt(cx + 62 * Math.cos(a), cy + 62 * Math.sin(a) + 5, i, { cls: 'geo-v' }));
  }
  for (let i = 0; i < 60; i++) {
    const a = (i * Math.PI) / 30;
    const r0 = i % 5 ? 74 : 70;
    parts.push(`<line x1="${r1(cx + r0 * Math.sin(a))}" y1="${r1(cy - r0 * Math.cos(a))}" x2="${r1(cx + 78 * Math.sin(a))}" y2="${r1(cy - 78 * Math.cos(a))}" stroke="currentColor" stroke-width="${i % 5 ? 1 : 2}"/>`);
  }
  const ha = (((h % 12) + m / 60) * Math.PI) / 6;
  const ma = (m * Math.PI) / 30;
  parts.push(`<line x1="${cx}" y1="${cy}" x2="${r1(cx + 38 * Math.sin(ha))}" y2="${r1(cy - 38 * Math.cos(ha))}" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>`);
  parts.push(`<line x1="${cx}" y1="${cy}" x2="${r1(cx + 58 * Math.sin(ma))}" y2="${r1(cy - 58 * Math.cos(ma))}" stroke="${C[0]}" stroke-width="3.5" stroke-linecap="round"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="5" fill="currentColor"/>`);
  return svg(180, 180, parts.join(''));
}

/** Линейка в сантиметрах и отрезок над ней от a до b. mm - показывать миллиметры. */
export function rulerSvg(a, b, { len = 12, mm = false } = {}) {
  const u = 20;
  const x0 = 16;
  const parts = [`<rect x="${x0 - 8}" y="50" width="${len * u + 16}" height="44" rx="4" fill="var(--fig-fill)" stroke="currentColor" stroke-width="1.5"/>`];
  for (let i = 0; i <= len * (mm ? 10 : 2); i++) {
    const x = x0 + (i * u) / (mm ? 10 : 2);
    const big = mm ? i % 10 === 0 : i % 2 === 0;
    const mid = mm && i % 5 === 0;
    parts.push(`<line x1="${r1(x)}" y1="50" x2="${r1(x)}" y2="${big ? 66 : mid ? 61 : 57}" stroke="currentColor" stroke-width="${big ? 1.5 : 0.8}"/>`);
    if (big) parts.push(txt(x, 84, mm ? i / 10 : i / 2, { size: 12 }));
  }
  parts.push(`<line x1="${r1(x0 + a * u)}" y1="30" x2="${r1(x0 + b * u)}" y2="30" stroke="${C[0]}" stroke-width="4" stroke-linecap="round"/>`);
  for (const x of [a, b]) parts.push(`<line x1="${r1(x0 + x * u)}" y1="22" x2="${r1(x0 + x * u)}" y2="50" stroke="${C[0]}" stroke-width="1" stroke-dasharray="3 3"/>`);
  return svg(len * u + 32, 100, parts.join(''));
}

/** Монеты (кружки) и купюры (прямоугольники) с номиналом. */
export function moneySvg(values) {
  const parts = [];
  let x = 10;
  let y = 10;
  for (const v of values) {
    const note = v >= 500;
    const w = note ? 92 : 22 + Math.min(String(v).length, 3) * 6;
    if (x + w > 300) {
      x = 10;
      y += 60;
    }
    if (note) {
      parts.push(`<rect x="${x}" y="${y + 6}" width="${w}" height="44" rx="5" fill="color-mix(in srgb, var(--accent) 25%, var(--fig-fill))" ${STROKE}/>`);
      parts.push(txt(x + w / 2, y + 34, v, { cls: 'geo-v' }));
    } else {
      const r = w / 2;
      parts.push(`<circle cx="${x + r}" cy="${y + 28}" r="${r}" fill="color-mix(in srgb, var(--orange, #f97316) 30%, var(--fig-fill))" ${STROKE}/>`);
      parts.push(txt(x + r, y + 33, v, { cls: 'geo-v', size: 14 }));
    }
    x += w + 10;
  }
  return svg(310, y + 62, parts.join(''));
}

/** k групп по m предметов (смысл умножения). */
export function groupsSvg(k, m) {
  const cols = Math.min(k, 4);
  const per = Math.min(m, 5);
  const w = per * 16 + 14;
  const rowsIn = Math.ceil(m / 5);
  const h = rowsIn * 16 + 14;
  const parts = [];
  for (let i = 0; i < k; i++) {
    const gx = 8 + (i % cols) * (w + 10);
    const gy = 8 + Math.floor(i / cols) * (h + 10);
    parts.push(`<rect x="${gx}" y="${gy}" width="${w}" height="${h}" rx="10" fill="var(--fig-fill)" stroke="currentColor" stroke-width="1.5"/>`);
    for (let j = 0; j < m; j++) parts.push(`<circle cx="${gx + 15 + (j % 5) * 16}" cy="${gy + 15 + Math.floor(j / 5) * 16}" r="6" fill="${C[i % 2]}"/>`);
  }
  return svg(cols * (w + 10) + 6, Math.ceil(k / cols) * (h + 10) + 6, parts.join(''));
}

/** Круг из n равных частей, k закрашено. */
export function pieFracSvg(nParts, k) {
  const cx = 70;
  const cy = 70;
  const r = 60;
  const parts = [];
  for (let i = 0; i < nParts; i++) {
    const a0 = (i * 2 * Math.PI) / nParts - Math.PI / 2;
    const a1 = ((i + 1) * 2 * Math.PI) / nParts - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const d = `M${cx},${cy} L${r1(cx + r * Math.cos(a0))},${r1(cy + r * Math.sin(a0))} A${r},${r} 0 ${large} 1 ${r1(cx + r * Math.cos(a1))},${r1(cy + r * Math.sin(a1))} Z`;
    parts.push(`<path d="${d}" fill="${i < k ? C[0] : 'var(--fig-fill)'}" ${STROKE}/>`);
  }
  return svg(140, 140, parts.join(''));
}

/** Полоска из n равных частей, k закрашено. */
export function barFracSvg(nParts, k) {
  const w = 240 / nParts;
  const parts = [];
  for (let i = 0; i < nParts; i++) parts.push(`<rect x="${r1(10 + i * w)}" y="10" width="${r1(w)}" height="50" fill="${i < k ? C[2] : 'var(--fig-fill)'}" ${STROKE}/>`);
  return svg(260, 70, parts.join(''));
}

/** Многоугольник по точкам с подписями сторон (labels[i] - сторона от точки i к i+1). */
export function polySvg(pts, labels, { w = 260, h = 180, right = [] } = {}) {
  const parts = [`<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="var(--fig-fill)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>`];
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const len = Math.hypot(dx, dy) || 1;
    if (labels[i]) parts.push(txt(mx + (dx / len) * 18, my + (dy / len) * 18 + 5, labels[i]));
  });
  for (const i of right) {
    const p = pts[i];
    const a = pts[(i + pts.length - 1) % pts.length];
    const b = pts[(i + 1) % pts.length];
    const u = [(a[0] - p[0]) / Math.hypot(a[0] - p[0], a[1] - p[1]), (a[1] - p[1]) / Math.hypot(a[0] - p[0], a[1] - p[1])];
    const v = [(b[0] - p[0]) / Math.hypot(b[0] - p[0], b[1] - p[1]), (b[1] - p[1]) / Math.hypot(b[0] - p[0], b[1] - p[1])];
    const s = 12;
    parts.push(`<polyline points="${r1(p[0] + u[0] * s)},${r1(p[1] + u[1] * s)} ${r1(p[0] + u[0] * s + v[0] * s)},${r1(p[1] + u[1] * s + v[1] * s)} ${r1(p[0] + v[0] * s)},${r1(p[1] + v[1] * s)}" fill="none" stroke="currentColor" stroke-width="1.5"/>`);
  }
  return svg(w, h, parts.join(''));
}

/** Фигура из клеток на сетке: cells - список [x, y]. */
export function gridSvg(cells, cols, rows) {
  const u = 22;
  const parts = [];
  for (const [x, y] of cells) parts.push(`<rect x="${8 + x * u}" y="${8 + y * u}" width="${u}" height="${u}" fill="${C[0]}" fill-opacity="0.55"/>`);
  for (let i = 0; i <= cols; i++) parts.push(`<line x1="${8 + i * u}" y1="8" x2="${8 + i * u}" y2="${8 + rows * u}" stroke="currentColor" stroke-width="0.6" opacity="0.5"/>`);
  for (let j = 0; j <= rows; j++) parts.push(`<line x1="8" y1="${8 + j * u}" x2="${8 + cols * u}" y2="${8 + j * u}" stroke="currentColor" stroke-width="0.6" opacity="0.5"/>`);
  return svg(16 + cols * u, 16 + rows * u, parts.join(''));
}

/** Окружность с центром O и отрезком: kind 'r' - радиус, 'd' - диаметр. */
export function circleSvg(kind, label) {
  const parts = [`<circle cx="90" cy="80" r="64" fill="var(--fig-fill)" stroke="currentColor" stroke-width="2.5"/>`, `<circle cx="90" cy="80" r="3" fill="currentColor"/>`, txt(84, 74, 'O', { cls: 'geo-v' })];
  if (kind === 'r') parts.push(`<line x1="90" y1="80" x2="154" y2="80" stroke="${C[0]}" stroke-width="3"/>`, txt(122, 98, label));
  else parts.push(`<line x1="26" y1="80" x2="154" y2="80" stroke="${C[0]}" stroke-width="3"/>`, txt(120, 98, label));
  return svg(180, 160, parts.join(''));
}

/** Прямоугольный параллелепипед a × b × c (наклонная проекция). */
export function boxSvg(a, b, c) {
  const W = 120;
  const H = 70;
  const D = 40;
  const x = 30;
  const y = 50;
  const f = [[x, y], [x + W, y], [x + W, y + H], [x, y + H]];
  const o = [D, -D * 0.7];
  const parts = [
    `<polygon points="${f.map((p) => p.join(',')).join(' ')}" fill="var(--fig-fill)" ${STROKE}/>`,
    `<polygon points="${x},${y} ${x + o[0]},${y + o[1]} ${x + W + o[0]},${y + o[1]} ${x + W},${y}" fill="color-mix(in srgb, var(--primary) 18%, var(--fig-fill))" ${STROKE}/>`,
    `<polygon points="${x + W},${y} ${x + W + o[0]},${y + o[1]} ${x + W + o[0]},${y + H + o[1]} ${x + W},${y + H}" fill="color-mix(in srgb, var(--primary) 30%, var(--fig-fill))" ${STROKE}/>`,
    txt(x + W / 2, y + H + 20, a),
    txt(x + W + D / 2 + 16, y + H + o[1] / 2 + 12, b, { anchor: 'start' }),
    txt(x - 8, y + H / 2 + 5, c, { anchor: 'end' }),
  ];
  return svg(240, 150, parts.join(''));
}

/** Столбчатая диаграмма. labels - подписи (строки), values - числа. */
export function barsSvg(labels, values, top) {
  const w = 300;
  const h = 190;
  const x0 = 34;
  const y0 = 160;
  const hh = 140;
  const step = top <= 10 ? 2 : top <= 20 ? 5 : top <= 50 ? 10 : top <= 100 ? 20 : top <= 200 ? 50 : 100;
  const parts = [];
  for (let v = 0; v <= top; v += step) {
    const y = y0 - (v / top) * hh;
    parts.push(`<line x1="${x0}" y1="${r1(y)}" x2="${w - 6}" y2="${r1(y)}" stroke="currentColor" stroke-width="0.6" opacity="0.4"/>`, txt(x0 - 4, y + 4, v, { anchor: 'end', size: 11 }));
  }
  const bw = (w - x0 - 10) / labels.length;
  labels.forEach((lab, i) => {
    const bh = (values[i] / top) * hh;
    parts.push(`<rect x="${r1(x0 + i * bw + bw * 0.2)}" y="${r1(y0 - bh)}" width="${r1(bw * 0.6)}" height="${r1(bh)}" fill="${C[i % C.length]}" stroke="currentColor" stroke-width="1"/>`);
    parts.push(txt(x0 + i * bw + bw / 2, y0 + 18, lab, { size: 12 }));
  });
  parts.push(`<line x1="${x0}" y1="${y0}" x2="${w - 6}" y2="${y0}" stroke="currentColor" stroke-width="1.5"/>`);
  return svg(w, h, parts.join(''));
}

/** Круговая диаграмма: parts - доли (сумма 1), labels - подписи. */
export function pieSvg(parts, labels) {
  const cx = 80;
  const cy = 80;
  const r = 66;
  let a = -Math.PI / 2;
  const out = [];
  parts.forEach((p, i) => {
    const b = a + p * 2 * Math.PI;
    const large = b - a > Math.PI ? 1 : 0;
    out.push(`<path d="M${cx},${cy} L${r1(cx + r * Math.cos(a))},${r1(cy + r * Math.sin(a))} A${r},${r} 0 ${large} 1 ${r1(cx + r * Math.cos(b))},${r1(cy + r * Math.sin(b))} Z" fill="${C[i % C.length]}" fill-opacity="0.8" ${STROKE}/>`);
    const m = (a + b) / 2;
    out.push(txt(cx + r * 0.62 * Math.cos(m), cy + r * 0.62 * Math.sin(m) + 5, labels[i], { size: 13 }));
    a = b;
  });
  return svg(160, 160, out.join(''));
}

/** Луч или прямая с делениями: from - первое число, step - цена деления, count - число делений, marks - {подпись: значение}. */
export function lineSvg(from, step, count, marks = {}, { showAll = false, labelEvery = 1 } = {}) {
  const x0 = 20;
  const u = 260 / count;
  const parts = [`<line x1="${x0 - 8}" y1="50" x2="${x0 + count * u + 12}" y2="50" stroke="currentColor" stroke-width="2"/>`, `<polygon points="${x0 + count * u + 14},50 ${x0 + count * u + 4},45 ${x0 + count * u + 4},55" fill="currentColor"/>`];
  for (let i = 0; i <= count; i++) {
    const x = x0 + i * u;
    parts.push(`<line x1="${r1(x)}" y1="44" x2="${r1(x)}" y2="56" stroke="currentColor" stroke-width="1.5"/>`);
    if (showAll ? i % labelEvery === 0 : i <= 1) parts.push(txt(x, 74, n(from + i * step), { size: 12 }));
  }
  for (const [lab, v] of Object.entries(marks)) {
    const x = x0 + ((v - from) / step) * u;
    parts.push(`<circle cx="${r1(x)}" cy="50" r="5" fill="${C[0]}"/>`, txt(x, 34, lab, { cls: 'geo-v' }));
  }
  return svg(320, 84, parts.join(''));
}

/** Координатная плоскость от -m до m с точками {подпись: [x, y]}. */
export function planeSvg(points, m = 6, extra = () => '') {
  const u = 13;
  const c = 8 + m * u;
  const parts = [];
  for (let i = -m; i <= m; i++) {
    parts.push(`<line x1="${c + i * u}" y1="8" x2="${c + i * u}" y2="${8 + 2 * m * u}" stroke="currentColor" stroke-width="0.5" opacity="0.35"/>`);
    parts.push(`<line x1="8" y1="${c + i * u}" x2="${8 + 2 * m * u}" y2="${c + i * u}" stroke="currentColor" stroke-width="0.5" opacity="0.35"/>`);
  }
  parts.push(`<line x1="4" y1="${c}" x2="${12 + 2 * m * u}" y2="${c}" stroke="currentColor" stroke-width="1.8"/>`, `<line x1="${c}" y1="${12 + 2 * m * u}" x2="${c}" y2="4" stroke="currentColor" stroke-width="1.8"/>`);
  parts.push(txt(c + u, c + 14, '1', { size: 11 }), txt(c - 6, c - u + 4, '1', { size: 11, anchor: 'end' }), txt(c - 6, c + 14, '0', { size: 11, anchor: 'end' }));
  parts.push(txt(10 + 2 * m * u, c - 6, 'x', { cls: 'geo-v', anchor: 'end' }), txt(c + 8, 16, 'y', { cls: 'geo-v', anchor: 'start' }));
  parts.push(extra(c, u));
  for (const [lab, [x, y]] of Object.entries(points)) parts.push(`<circle cx="${c + x * u}" cy="${c - y * u}" r="4.5" fill="${C[0]}"/>`, txt(c + x * u + 6, c - y * u - 6, lab, { cls: 'geo-v', anchor: 'start' }));
  return svg(16 + 2 * m * u, 16 + 2 * m * u, parts.join(''));
}

/** Треугольник по двум углам при основании (в градусах) с подписями углов. */
export function triangleSvg(A, B, { labels = true, marks = '' } = {}) {
  const ra = (A * Math.PI) / 180;
  const rb = (B * Math.PI) / 180;
  // Вершина C: пересечение лучей из A(0,0) и B(1,0).
  const t = Math.sin(rb) / Math.sin(ra + rb);
  let pts = [[0, 0], [1, 0], [t * Math.cos(ra), t * Math.sin(ra)]];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const k = Math.min(220 / (Math.max(...xs) - minX), 130 / Math.max(...ys));
  pts = pts.map(([x, y]) => [20 + (x - minX) * k, 150 - y * k]);
  const parts = [`<polygon points="${pts.map((p) => p.map(r1).join(',')).join(' ')}" fill="var(--fig-fill)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>`];
  if (labels) {
    const C3 = 180 - A - B;
    const cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
    const cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
    [A, B, C3].forEach((ang, i) => {
      const [x, y] = pts[i];
      parts.push(txt(x + (cx - x) * 0.32, y + (cy - y) * 0.32 + 5, `${ang}°`, { size: 13 }));
    });
  }
  return svg(260, 170, parts.join('') + marks);
}

/** Запись столбиком: числа выровнены по правому краю, внизу - «?» или ответ. */
export function columnSvg(top, bottom, op, result = '?') {
  const w = 24;
  const len = Math.max(String(top).length, String(bottom).length + 1, String(result).length);
  const x = (i, s) => 30 + (len - String(s).length + i) * w + w / 2;
  const row = (s, y) => [...String(s)].map((ch, i) => txt(x(i, s), y, ch, { cls: 'geo-v', size: 24 })).join('');
  const parts = [row(top, 34), row(bottom, 68), txt(18, 54, op, { cls: 'geo-v', size: 24 }), `<line x1="24" y1="80" x2="${36 + len * w}" y2="80" stroke="currentColor" stroke-width="2"/>`, row(result, 110)];
  return svg(48 + len * w, 122, parts.join(''));
}

/** Угол в deg градусов: вершина, две стороны, дуга (или квадратик для прямого угла). */
export function angleSvg(deg, rot = 0) {
  const vx = 70;
  const vy = 120;
  const a0 = (-rot * Math.PI) / 180;
  const a1 = (-(rot + deg) * Math.PI) / 180;
  const p = (a, r) => [vx + r * Math.cos(a), vy + r * Math.sin(a)];
  const [x0, y0] = p(a0, 120);
  const [x1, y1] = p(a1, 120);
  let mark;
  if (deg === 90) {
    const [ux, uy] = p(a0, 16);
    const [wx, wy] = p(a1, 16);
    mark = `<polyline points="${r1(ux)},${r1(uy)} ${r1(ux + wx - vx)},${r1(uy + wy - vy)} ${r1(wx)},${r1(wy)}" fill="none" stroke="var(--primary)" stroke-width="2"/>`;
  } else {
    const [ax, ay] = p(a0, 26);
    const [bx, by] = p(a1, 26);
    mark = `<path d="M${r1(ax)},${r1(ay)} A26,26 0 0 0 ${r1(bx)},${r1(by)}" fill="none" stroke="var(--primary)" stroke-width="2"/>`;
  }
  const line = (x, y) => `<line x1="${vx}" y1="${vy}" x2="${r1(x)}" y2="${r1(y)}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`;
  return svg(260, 150, `<g transform="translate(${r1(130 - vx - (Math.cos(a0) + Math.cos(a1)) * 30)},0)">${line(x0, y0)}${line(x1, y1)}${mark}<circle cx="${vx}" cy="${vy}" r="4" fill="currentColor"/></g>`);
}
