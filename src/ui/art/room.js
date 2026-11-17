// Комната Препи: обои, пол, окно, мебель и украшения. См. roomScene() и roomItemThumb().
//
// Сцена — один SVG с viewBox 0 0 320 200 (16:10; компактный вариант обрезан до 0 12 320 180, 16:9).
// Задняя стена: x 34…320, y 0…132; левая стена — узкая трапеция x 0…34 (лёгкая перспектива 3/4,
// точка схода (190, 60)); пол — ниже y 132. Окно — справа на стене, свет падает справа сверху,
// поэтому тени мебели на полу чуть смещены влево.
//
// ROOM_ART:
//   wall, floor, window — готовые слои в координатах комнаты;
//   seat, desk, shelf, plant, lamp, toy — рисунок в своих координатах: (0, 0) — точка, где вещь
//     стоит на полу (низ по центру), вверх — отрицательные y; в комнате вещь сдвигается в ANCHOR;
//   poster — центр рисунка в (0, 0);
//   rug — ковёр «сверху» (плоский), в комнате сплющивается по вертикали.
// В разметке нет id, градиентов и фильтров: на одной странице может быть много комнат.

const f1 = (n) => Math.round(n * 10) / 10;
const rng = (seed) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
/** Мягкая тень на полу (свет из окна справа — тень немного влево). */
const sh = (rx, dx = -4, ry = rx * 0.17) => `<ellipse cx="${dx}" cy="-.5" rx="${rx}" ry="${f1(ry)}" fill="#24123c" opacity=".2"/>`;
/** Четырёхлучевая искра. */
const spark = (x, y, r, fill = '#fff', cls = 'room-sparkle') =>
  `<path class="${cls}" d="M${x} ${f1(y - r)}q0 ${r} ${r} ${r}q-${r} 0 -${r} ${r}q0 -${r} -${r} -${r}q${r} 0 ${r} -${r}Z" fill="${fill}"/>`;
/** Свечение — несколько полупрозрачных кругов (без градиентов). */
const glow = (x, y, r, c, cls = 'room-glow') =>
  `<g class="${cls}" fill="${c}"><circle cx="${x}" cy="${y}" r="${r}" opacity=".09"/><circle cx="${x}" cy="${y}" r="${f1(r * 0.68)}" opacity=".12"/><circle cx="${x}" cy="${y}" r="${f1(r * 0.4)}" opacity=".16"/></g>`;
/** Звёзды в прямоугольнике: точки, часть мерцает. */
const stars = (seed, n, w, h, x0 = 0, y0 = 0, fill = '#fff') => {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = f1(x0 + r() * w), y = f1(y0 + r() * h), s = f1(0.35 + r() * 0.7);
    out += i % 3 === 0 ? spark(x, y, f1(s * 2.2), fill, 'room-twinkle') : `<circle cx="${x}" cy="${y}" r="${s}" fill="${fill}" opacity="${f1(0.5 + r() * 0.5)}"/>`;
  }
  return out;
};

/* ------------------------------------------------------------------ стены */

// Левая стена — та же текстура, сжатая и скошенная (вертикальные узоры остаются вертикальными).
const SIDE_W = 70;
const sideY = (y) => f1(-13.1 + (161 * y) / 132);

function wallLayer({ base, trim, pat, rails = [], side = true, dark = false }) {
  const rail = rails
    .map(([y, h, c]) => `<rect x="34" y="${y}" width="286" height="${h}" fill="${c}"/><path d="M0 ${sideY(y)}L34 ${y}V${y + h}L0 ${sideY(y + h)}Z" fill="${c}"/>`)
    .join('');
  return `<g class="room-wall"><rect x="34" y="0" width="286" height="132" fill="${base}"/><svg x="34" y="0" width="286" height="132" viewBox="0 0 286 132">${pat(286, 132)}</svg>`
    + `<path d="M0 -14L34 0V132L0 148Z" fill="${base}"/>${side ? `<g transform="matrix(${f1(34 / SIDE_W * 1000) / 1000} ${f1(13.1 / SIDE_W * 1000) / 1000} 0 1 0 -13.1)"><svg width="${SIDE_W}" height="165" viewBox="0 0 ${SIDE_W} 165">${pat(SIDE_W, 165)}</svg></g>` : ''}`
    + `${rail}<path d="M0 -14L34 0V132L0 148Z" fill="#1d1238" opacity="${dark ? 0.22 : 0.09}"/>`
    + `<rect x="34" y="125" width="286" height="7" fill="${trim}"/><rect x="34" y="125" width="286" height="1.4" fill="#fff" opacity=".3"/><path d="M0 ${sideY(125)}L34 125V132L0 147.7Z" fill="${trim}"/><path d="M0 ${sideY(125)}L34 125V132L0 147.7Z" fill="#1d1238" opacity=".14"/>`
    + `<path d="M34 0V132" stroke="#1d1238" stroke-opacity=".12" stroke-width=".8"/><rect width="320" height="7" fill="#1d1238" opacity=".07"/><rect width="320" height="2.5" fill="#1d1238" opacity=".07"/></g>`;
}

const stripesV = (w, h, step, sw, c, x0 = 0) => {
  let d = '';
  for (let x = x0; x < w; x += step) d += `M${x} 0h${sw}v${h}h-${sw}Z`;
  return `<path d="${d}" fill="${c}"/>`;
};
const dotGrid = (w, h, step, r, c) => {
  let d = '';
  for (let y = step / 2, row = 0; y < h; y += step, row++) {
    for (let x = row % 2 ? step : step / 2; x < w; x += step) d += `M${f1(x)} ${f1(y)}h0`;
  }
  return `<path d="${d}" stroke="${c}" stroke-width="${2 * r}" stroke-linecap="round"/>`;
};
const rot = (x, y, a, px, py) => {
  const c = Math.cos(a), s = Math.sin(a);
  return `${f1(x + px * c - py * s)} ${f1(y + px * s + py * c)}`;
};

const WALLS = {
  'r-wall-cream': {
    base: '#f8ead6', trim: '#d9b78f', side: false,
    rails: [[88, 3, '#e3c49c']],
    pat: (w, h) => `<rect y="90" width="${w}" height="${h - 90}" fill="#f1dcbf"/>${Array.from({ length: Math.ceil(w / 32) }, (_, i) => `<rect x="${6 + i * 32}" y="97" width="24" height="23" rx="2" fill="none" stroke="#e3c49c" stroke-width="1.2"/>`).join('')}${dotGrid(w, 86, 22, 1.1, '#efd9bb')}`,
  },
  'r-wall-mint': { base: '#d8f1e4', trim: '#8fc9ad', pat: (w, h) => stripesV(w, h, 26, 11, '#c5e9d6') + stripesV(w, h, 26, 1.2, '#b3dfc8', 18) },
  'r-wall-lilac': { base: '#ece6ff', trim: '#b8a8f0', pat: (w, h) => dotGrid(w, h, 15, 1.9, '#d8cdfb') + dotGrid(w, h, 30, 1.2, '#f9f7ff') },
  'r-wall-candy': {
    base: '#fff0f6', trim: '#f58fb8',
    pat: (w, h) => stripesV(w, h, 24, 12, '#ffd2e5') + stripesV(w, h, 24, 2, '#b8ecdc', 17) + dotGrid(w, h, 24, 1.3, '#fff'),
  },
  'r-wall-wood': {
    base: '#c48553', trim: '#7d4b28',
    pat: (w, h) => {
      const r = rng(7);
      let out = stripesV(w, h, 36, 18, '#bb7c4b');
      for (let x = 18; x < w; x += 18) out += `<rect x="${x - 0.8}" width="1.6" height="${h}" fill="#94592f"/><rect x="${x + 0.8}" width="1" height="${h}" fill="#d99c69" opacity=".7"/>`;
      let k = '';
      for (let i = 0; i < w / 14; i++) k += `M${f1(r() * w)} ${f1(r() * h)}a2.4 1.4 0 1 0 4.8 0a2.4 1.4 0 1 0 -4.8 0`;
      return out + `<path d="${k}" fill="none" stroke="#9c6136" stroke-width=".8"/>`;
    },
  },
  'r-wall-leaves': {
    base: '#e3f2d4', trim: '#6aa456',
    pat: (w, h) => {
      const r = rng(11);
      const d = ['', ''];
      let v = '';
      for (let y = 8, row = 0; y < h; y += 20, row++) {
        for (let x = row % 2 ? 4 : 16; x < w; x += 24) {
          const a = ((r() * 120 - 60) * Math.PI) / 180, k = r() < 0.5 ? 0 : 1, cx = x + r() * 4;
          d[k] += `M${rot(cx, y, a, 0, -6)}Q${rot(cx, y, a, 5, 0)} ${rot(cx, y, a, 0, 6)}Q${rot(cx, y, a, -5, 0)} ${rot(cx, y, a, 0, -6)}Z`;
          v += `M${rot(cx, y, a, 0, -5)}L${rot(cx, y, a, 0, 5)}`;
        }
      }
      return `<path d="${d[0]}" fill="#b9dc9f"/><path d="${d[1]}" fill="#a4cf86"/><path d="${v}" stroke="#8cbf6c" stroke-width=".6"/>`;
    },
  },
  'r-wall-waves': {
    base: '#d6f0fb', trim: '#4aa3cf',
    pat: (w, h) => {
      let d = '';
      for (let y = 10; y < h; y += 16) {
        d += `M-6 ${y}`;
        for (let x = -6; x < w + 12; x += 12) d += `q3 -4 6 0t6 0`;
      }
      return `<path d="${d}" stroke="#a9dcf2" stroke-width="2" fill="none" stroke-linecap="round"/>${dotGrid(w, h, 32, 1.6, '#eefaff')}`;
    },
  },
  'r-wall-snow': {
    base: '#e7f0fb', trim: '#8fb0d6',
    pat: (w, h) => {
      const r = rng(5);
      let d = '';
      for (let y = 12, row = 0; y < h; y += 26, row++) {
        for (let x = row % 2 ? 6 : 19; x < w; x += 26) {
          const s = 3 + r() * 2, a = s * 0.87, b = s / 2;
          d += `M${x} ${f1(y - s)}V${f1(y + s)}M${f1(x - a)} ${f1(y - b)}L${f1(x + a)} ${f1(y + b)}M${f1(x - a)} ${f1(y + b)}L${f1(x + a)} ${f1(y - b)}`;
        }
      }
      return `<path d="${d}" stroke="#c9dbf0" stroke-width="1.1" stroke-linecap="round"/>` + dotGrid(w, h, 13, 0.8, '#fff');
    },
  },
  'r-wall-neon': {
    base: '#1b1538', trim: '#0e0a24', dark: true,
    pat: (w, h) => {
      let d = '';
      for (let x = 0; x < w; x += 18) d += `M${x} 0V${h}`;
      for (let y = 10; y < h; y += 18) d += `M0 ${y}H${w}`;
      return `<path d="${d}" stroke="#2f2766" stroke-width=".8"/><g class="room-neon"><rect y="104" width="${w}" height="5" fill="#e879f9" opacity=".25"/><rect y="105.6" width="${w}" height="1.8" fill="#f5b8ff"/><rect y="20" width="${w}" height="5" fill="#22d3ee" opacity=".2"/><rect y="21.6" width="${w}" height="1.6" fill="#a5f3fc"/></g>`;
    },
  },
  'r-wall-galaxy': {
    base: '#1a1446', trim: '#0f0b2e', dark: true,
    pat: (w, h) => `<ellipse cx="${f1(w * 0.3)}" cy="40" rx="60" ry="22" fill="#3b2a85" opacity=".45"/><ellipse cx="${f1(w * 0.75)}" cy="90" rx="70" ry="20" fill="#5b2a8a" opacity=".3"/>${stars(w + 3, Math.round(w / 4.5), w, h - 8)}${w > 100 ? '<circle cx="250" cy="104" r="6" fill="#f472b6"/><path d="M243 102 Q250 100 257 106" stroke="#fbcfe8" stroke-width="1" fill="none" opacity=".7"/><circle cx="20" cy="18" r="3.5" fill="#7dd3fc"/>' : ''}`,
  },
  'r-wall-royal': {
    base: '#6b1d3a', trim: '#c8962a', dark: true, side: false,
    rails: [[86, 4, '#d4a531']],
    pat: (w, h) => {
      let d = '', g = '';
      for (let x = -20; x < w + 20; x += 20) d += `M${x} 0l${h * 0.66} ${h}M${x} 0l-${h * 0.66} ${h}`;
      for (let y = 12, row = 0; y < 86; y += 15, row++) for (let x = row % 2 ? 10 : 0; x < w; x += 20) g += `M${x} ${y - 2.4}l2 2.4l-2 2.4l-2 -2.4Z`;
      return `<path d="${d}" stroke="#8a2a4c" stroke-width="1.1"/><path d="${g}" fill="#e2b545"/><rect y="90" width="${w}" height="${h - 90}" fill="#561530"/>${Array.from({ length: Math.ceil(w / 30) }, (_, i) => `<rect x="${5 + i * 30}" y="96" width="22" height="24" rx="2" fill="none" stroke="#c8962a" stroke-width="1"/>`).join('')}<path class="room-shimmer" d="M0 0h18l-40 ${h}h-18Z" fill="#fff6c8" fill-opacity=".12"/>`;
    },
  },
};

/* ------------------------------------------------------------------- пол */

const FX = (xb, y) => f1(190 + ((xb - 190) * (y - 60)) / 72);
const FLOOR_D = 'M0 147.7L34 132H320V200H0Z';
const rowYs = (s, k = 200) => {
  const ys = [132];
  for (let i = 1; ; i++) {
    const z = 1 / 72 - (i * s) / (72 * k);
    if (z <= 1 / 145) return ys.concat(205);
    ys.push(f1(60 + 1 / z));
  }
};
const quad = (a, b, y0, y1) => `M${FX(a, y0)} ${y0}L${FX(b, y0)} ${y0}L${FX(b, y1)} ${y1}L${FX(a, y1)} ${y1}Z`;
/** Шахматная плитка в перспективе (рисуются только тёмные клетки поверх фона). */
const checker = (s, c, grout, gw = 0.6) => {
  const ys = rowYs(s);
  let d = '', g = '';
  for (let i = 0, xb = 34; xb < 330; xb += s, i++) {
    g += `M${xb} 132L${FX(xb, 205)} 205`;
    for (let k = 0; k < ys.length - 1; k++) if ((i + k) % 2) d += quad(xb, xb + s, ys[k], ys[k + 1]);
  }
  for (const y of ys) g += `M0 ${y}H320`;
  return `<path d="${d}" fill="${c}"/>${grout ? `<path d="${g}" stroke="${grout}" stroke-width="${gw}"/>` : ''}`;
};
/** Доски: полосы к точке схода, швы поперёк. */
const planks = (s, cols, seam, seed) => {
  const r = rng(seed);
  let out = '', d = '';
  for (let i = 0, xb = 34; xb < 330; xb += s, i++) {
    out += `<path d="${quad(xb, xb + s, 132, 205)}" fill="${cols[i % cols.length]}"/>`;
    d += `M${xb} 132L${FX(xb, 205)} 205`;
    for (const y of [f1(136 + r() * 16), f1(158 + r() * 30)]) d += `M${FX(xb, y)} ${y}L${FX(xb + s, y)} ${y}`;
  }
  return out + `<path d="${d}" stroke="${seam}" stroke-width=".8"/>`;
};
/** Случайные точки на полу (в перспективе: дальше — мельче). */
const floorDots = (seed, n, fn) => {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const y = 134 + r() * 66, xb = 38 + r() * 290, k = (y - 60) / 72;
    out += fn(FX(xb, y), f1(y), k, r);
  }
  return out;
};

function floorLayer(base, inner) {
  return `<g class="room-floor"><path d="${FLOOR_D}" fill="${base}"/><svg x="0" y="132" width="320" height="68" viewBox="0 132 320 68">${inner}</svg><path d="M0 147.7L34 132H320V136.5H35L0 153Z" fill="#1d1238" opacity=".1"/><rect y="190" width="320" height="10" fill="#1d1238" opacity=".05"/></g>`;
}

const FLOORS = {
  'r-floor-oak': ['#c98d57', planks(18, ['#c98d57', '#c28450', '#cf9560', '#c5894f'], '#9a6236', 3)],
  'r-floor-tiles': ['#eef2f8', checker(24, '#d3dcea', '#c2cddf')],
  'r-floor-pink': ['#fff0f6', checker(22, '#ffc9de', '#f9b4cf', 0.5)],
  'r-floor-grass': ['#8fcf6a', `<path d="${quad(34, 330, 132, 205)}" fill="#8fcf6a"/>${(() => {
    const t = ['', ''];
    floorDots(4, 70, (x, y, k, r) => {
      t[r() < 0.5 ? 0 : 1] += `M${x} ${y}l${f1(-1.5 * k)} ${f1(-4 * k)}M${x} ${y}l0 ${f1(-5 * k)}M${x} ${y}l${f1(1.5 * k)} ${f1(-4 * k)}`;
      return '';
    });
    return `<path d="${t[0]}" stroke="#6bb54b" stroke-width="1.1" stroke-linecap="round"/><path d="${t[1]}" stroke="#a8de85" stroke-width="1.1" stroke-linecap="round"/>`;
  })()}${floorDots(9, 14, (x, y, k, r) => `<circle cx="${x}" cy="${y}" r="${f1(1.3 * k)}" fill="${r() < 0.5 ? '#fff' : '#fde047'}"/>`)}`],
  'r-floor-sand': ['#f3dca6', `${floorDots(2, 26, (x, y, k) => `<path d="M${f1(x - 9 * k)} ${y}q${f1(4.5 * k)} -${f1(2 * k)} ${f1(9 * k)} 0t${f1(9 * k)} 0" stroke="#e2c587" stroke-width="${f1(0.9 * k)}" fill="none"/>`)}${floorDots(6, 6, (x, y, k, r) => (r() < 0.5 ? `<path d="M${x} ${f1(y - 3 * k)}l${f1(1 * k)} ${f1(2 * k)}h${f1(2 * k)}l${f1(-1.6 * k)} ${f1(1.4 * k)}l${f1(0.8 * k)} ${f1(2.2 * k)}l${f1(-2.2 * k)} ${f1(-1.2 * k)}l${f1(-2.2 * k)} ${f1(1.2 * k)}l${f1(0.8 * k)} ${f1(-2.2 * k)}l${f1(-1.6 * k)} ${f1(-1.4 * k)}h${f1(2 * k)}Z" fill="#fb923c"/>` : `<path d="M${f1(x - 2.5 * k)} ${y}a${f1(2.5 * k)} ${f1(2.5 * k)} 0 0 1 ${f1(5 * k)} 0Z" fill="#fde2e4" stroke="#f9a8b8" stroke-width=".5"/>`))}`],
  'r-floor-ice': ['#d8eefa', `${checker(46, '#cbe6f6', '#b3d8ef', 0.9)}${floorDots(12, 8, (x, y, k) => `<path d="M${x} ${y}l${f1(6 * k)} ${f1(-1.4 * k)}l${f1(3 * k)} ${f1(1.5 * k)}" stroke="#fff" stroke-width=".7" fill="none"/>`)}${floorDots(3, 10, (x, y, k) => spark(x, y, f1(1.8 * k), '#fff', 'room-twinkle'))}`],
  'r-floor-marble': ['#f5f2ed', `${checker(30, '#e3ddd4', '#cfc6b8', 0.7)}${floorDots(8, 12, (x, y, k) => `<path d="M${x} ${y}q${f1(4 * k)} ${f1(-2 * k)} ${f1(7 * k)} 0t${f1(8 * k)} ${f1(-1 * k)}" stroke="#b9b0a3" stroke-width=".5" fill="none" opacity=".7"/>`)}`],
  'r-floor-neon': ['#120d2b', `${(() => {
    const ys = rowYs(20);
    let d = '';
    for (let xb = 34; xb < 330; xb += 20) d += `M${xb} 132L${FX(xb, 205)} 205`;
    for (const y of ys) d += `M0 ${y}H320`;
    return `<path d="${d}" stroke="#22d3ee" stroke-width="2.4" opacity=".14"/><path class="room-neon" d="${d}" stroke="#67e8f9" stroke-width=".7"/>`;
  })()}`],
  'r-floor-space': ['#120c34', `${checker(28, '#1b1446', '#3b2f80', 0.6)}${floorDots(21, 28, (x, y, k, r) => (r() < 0.3 ? spark(x, y, f1(1.6 * k), '#c4b5fd', 'room-twinkle') : `<circle cx="${x}" cy="${y}" r="${f1(0.5 * k)}" fill="#fff" opacity=".8"/>`))}`],
  'r-floor-gold': ['#8a521f', `${checker(22, '#b97a2c', null)}${(() => {
    const ys = rowYs(22);
    let d = '';
    for (let xb = 34; xb < 330; xb += 22) d += `M${xb} 132L${FX(xb, 205)} 205`;
    for (const y of ys) d += `M0 ${y}H320`;
    return `<path d="${d}" stroke="#f2c94c" stroke-width=".8"/>`;
  })()}<path class="room-shimmer" d="M0 132h24l-30 70h-24Z" fill="#fff6c8" fill-opacity=".16"/>`],
};

/* ------------------------------------------------------------------- окно */

// Вид из окна рисуется в квадрате 72×64; mood влияет на освещение комнаты.
const pine = (x, y, w, h, c, snow) =>
  `<path d="M${x} ${y - h}L${f1(x + w / 2)} ${y}H${f1(x - w / 2)}Z" fill="${c}"/>${snow ? `<path d="M${x} ${y - h}L${f1(x + w / 5)} ${f1(y - h * 0.6)}L${x} ${f1(y - h * 0.68)}L${f1(x - w / 5)} ${f1(y - h * 0.6)}Z" fill="#fff"/>` : ''}`;
const cloud = (x, y, s, cls = 'room-cloud', c = '#fff') =>
  `<g class="${cls}" fill="${c}"><ellipse cx="${x}" cy="${y}" rx="${f1(9 * s)}" ry="${f1(3.4 * s)}"/><circle cx="${f1(x - 2 * s)}" cy="${f1(y - 2.5 * s)}" r="${f1(3.8 * s)}"/><circle cx="${f1(x + 3 * s)}" cy="${f1(y - 2 * s)}" r="${f1(3 * s)}"/></g>`;
const buildings = (seed, list, c, lit, litP = 0.5) => {
  const r = rng(seed);
  let out = '', w = '';
  for (const [x, top, bw] of list) {
    out += `<rect x="${x}" y="${top}" width="${bw}" height="${64 - top}" fill="${c}"/>`;
    for (let yy = top + 3; yy < 60; yy += 5) for (let xx = x + 2; xx < x + bw - 2; xx += 4) if (r() < litP) w += `M${xx} ${yy}h2v2.4h-2Z`;
  }
  return out + `<path d="${w}" fill="${lit}"/>`;
};
const snowfall = (seed) => {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < 26; i++) {
    const x = f1(r() * 72), y = f1(r() * 64), s = f1(0.6 + r() * 0.7);
    for (const yy of [y, y - 64]) d += `M${x} ${f1(yy)}h0`;
  }
  return `<path class="room-snowfall" d="${d}" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`;
};

const VIEWS = {
  'r-win-city': ['day', `<rect width="72" height="64" fill="#9ed6ff"/><rect width="72" height="20" fill="#88cafc"/><circle cx="56" cy="13" r="10" fill="#fff6c2" opacity=".5"/><circle cx="56" cy="13" r="6.5" fill="#ffe27a"/>${cloud(18, 17, 1)}${cloud(42, 27, 0.7, 'room-cloud is-slow')}${buildings(3, [[0, 34, 9], [9, 26, 11], [22, 38, 8], [31, 30, 10], [44, 36, 9], [55, 24, 12], [66, 33, 8]], '#b8d2ec', '#dbeafe', 0.4)}${buildings(4, [[-2, 44, 12], [12, 40, 9], [24, 46, 13], [40, 41, 10], [53, 47, 9], [62, 42, 12]], '#7a9fc8', '#cfe3fa', 0.45)}<path d="M0 64V56Q6 52 12 56Q18 51 25 56Q31 52 38 57Q46 52 52 57Q60 52 66 56Q70 54 72 56V64Z" fill="#5fb36a"/>`],
  'r-win-mountains': ['day', `<rect width="72" height="64" fill="#bfe6ff"/><rect width="72" height="18" fill="#a6d9fd"/>${cloud(54, 12, 0.8)}<path d="M0 44L18 18L30 32L46 12L64 34L72 28V64H0Z" fill="#8eb1d0"/><path d="M18 18L13 26L17 25L20 28L23 24ZM46 12L39 22L43 20L46 24L50 20L53 21Z" fill="#fff"/><path d="M0 50Q18 40 36 48T72 44V64H0Z" fill="#7cc47a"/><path d="M0 58Q20 50 40 57T72 54V64H0Z" fill="#5fae62"/>${pine(10, 54, 6, 10, '#3f8f53')}${pine(16, 55, 5, 8, '#357d47')}${pine(58, 52, 6, 11, '#3f8f53')}${pine(64, 53, 5, 8, '#357d47')}`],
  'r-win-forest': ['day', `<rect width="72" height="64" fill="#d3f0ff"/><path d="M60 0L40 64H52L66 0Z" fill="#fffbe0" opacity=".45"/><circle cx="64" cy="8" r="6" fill="#fff1a8"/>${[4, 14, 24, 34, 44, 54, 64, 74].map((x) => pine(x, 46, 12, 22, '#94cfa6')).join('')}${[0, 12, 26, 38, 52, 66].map((x, i) => pine(x, 56, 14, 28 + (i % 2) * 6, '#5aa874')).join('')}${[6, 30, 58].map((x) => pine(x, 64, 16, 30, '#3b8a5a')).join('')}<rect y="60" width="72" height="4" fill="#4a9a5a"/>`],
  'r-win-sea': ['day', `<rect width="72" height="64" fill="#a8dcff"/><rect width="72" height="16" fill="#91d0fd"/><circle cx="16" cy="14" r="6" fill="#ffe27a"/>${cloud(48, 14, 0.9)}<rect y="36" width="72" height="28" fill="#3aa0d8"/><rect y="36" width="72" height="2" fill="#86cdf1"/><path class="room-wave" d="M-12 44q3 -2 6 0t6 0t6 0M14 50q3 -2 6 0t6 0t6 0M40 45q3 -2 6 0t6 0t6 0M-4 57q3 -2 6 0t6 0t6 0M34 58q3 -2 6 0t6 0t6 0t6 0" stroke="#d3efff" stroke-width="1" fill="none" opacity=".75"/><g class="room-boat"><path d="M38 41H54L51 45H41Z" fill="#9a5b32"/><path d="M46 40V26L55 39Z" fill="#fff"/><path d="M45 40V29L39 39Z" fill="#fde4e4"/><path d="M46 26l4 1.5l-4 1.5Z" fill="#ef4444"/></g><path d="M22 26q2 -2 4 0q2 -2 4 0M30 22q1.5 -1.5 3 0q1.5 -1.5 3 0" stroke="#475569" stroke-width=".8" fill="none"/>`],
  'r-win-sunset': ['sunset', `<rect width="72" height="64" fill="#ffb36b"/><rect width="72" height="34" fill="#f58a7c"/><rect width="72" height="22" fill="#c4679f"/><rect width="72" height="10" fill="#7a4fa8"/><circle cx="36" cy="44" r="16" fill="#ffd27a" opacity=".35"/><circle cx="36" cy="44" r="10" fill="#ffe08a"/>${cloud(14, 20, 0.9, 'room-cloud', '#f9a3a8')}${cloud(58, 14, 0.7, 'room-cloud is-slow', '#e08ab8')}<path d="M0 46Q20 38 38 46T72 42V64H0Z" fill="#5b3a6e"/><path d="M0 54Q16 48 34 55T72 52V64H0Z" fill="#43295a"/><path d="M18 30q2 -2 4 0q2 -2 4 0M50 26q1.5 -1.5 3 0q1.5 -1.5 3 0" stroke="#4a2350" stroke-width=".9" fill="none"/>`],
  'r-win-snow': ['day', `<rect width="72" height="64" fill="#d3e3f4"/><rect width="72" height="18" fill="#bfd3ea"/><path d="M0 40Q20 30 40 38T72 34V64H0Z" fill="#eef4fb"/><path d="M0 50Q24 42 44 50T72 48V64H0Z" fill="#fff"/><path d="M0 50Q24 42 44 50T72 48" stroke="#d6e2f0" stroke-width="1.2" fill="none"/>${pine(12, 46, 10, 18, '#2f6b52', 1)}${pine(20, 48, 8, 13, '#285c46', 1)}${pine(56, 44, 11, 20, '#2f6b52', 1)}${pine(64, 46, 8, 13, '#285c46', 1)}<path d="M32 46h8v-6l-4 -4l-4 4Z" fill="#b45309"/><path d="M31 40.6l5 -5.2l5 5.2" stroke="#fff" stroke-width="1.6" fill="none"/><rect x="35" y="42" width="2.6" height="2.6" fill="#fde68a"/>${snowfall(8)}`],
  'r-win-night': ['night', `<rect width="72" height="64" fill="#26336b"/><rect width="72" height="30" fill="#1b2350"/>${stars(19, 22, 72, 36)}<circle cx="54" cy="14" r="12" fill="#fff3c4" opacity=".12"/><circle cx="54" cy="14" r="7.5" fill="#fff3c4"/><circle cx="58" cy="11" r="6.6" fill="#1b2350"/>${buildings(5, [[0, 40, 10], [10, 34, 10], [22, 44, 9], [31, 38, 12], [45, 42, 9], [54, 32, 10], [64, 40, 10]], '#141a3d', '#ffd76a', 0.32)}<path d="M0 64V58Q8 54 16 58Q24 54 32 58Q40 54 48 58Q56 54 64 58Q68 56 72 58V64Z" fill="#0f1430"/>`],
  'r-win-space': ['night', `<rect width="72" height="64" fill="#110b33"/><ellipse cx="20" cy="50" rx="30" ry="12" fill="#3b2a85" opacity=".6"/><ellipse cx="58" cy="16" rx="22" ry="9" fill="#6d28d9" opacity=".3"/>${stars(23, 26, 72, 64)}<path d="M8.5 31.5A15.5 4.2 -18 0 1 37.5 21.5" stroke="#ffd8a8" stroke-width="1.8" fill="none" opacity=".8"/><circle cx="24" cy="28" r="9" fill="#f4a259"/><path d="M15.6 25Q24 22 32.6 25.6M15.2 29.6Q24 27 32.9 30" stroke="#e07a3c" stroke-width="1.6" fill="none"/><circle cx="27" cy="25" r="3" fill="#fff" opacity=".22"/><path d="M37.5 21.5A15.5 4.2 -18 0 1 8.5 31.5" stroke="#ffd8a8" stroke-width="1.8" fill="none"/><circle cx="56" cy="46" r="5" fill="#60a5fa"/><path d="M53 44.5q3 1 5 -1M54 48q2 0 3.5 1" stroke="#34d399" stroke-width="1.2" fill="none"/><g class="room-comet"><path d="M46 12L62 4" stroke="#e0f2fe" stroke-width="1.4" stroke-linecap="round" opacity=".55"/><circle cx="62" cy="4" r="1.6" fill="#fff"/></g>`],
  'r-win-aurora': ['night', `<rect width="72" height="64" fill="#0b1733"/>${stars(31, 20, 72, 40)}<g class="room-aurora"><path d="M-6 34Q8 10 24 22T56 14T78 18V6Q60 2 44 8T12 10T-6 20Z" fill="#34d399" opacity=".45"/><path d="M-6 40Q14 22 30 30T62 22T78 26V16Q58 12 40 20T8 24T-6 30Z" fill="#22d3ee" opacity=".32"/><path d="M-6 26Q16 6 34 14T78 10V2Q56 -2 36 6T-6 14Z" fill="#a78bfa" opacity=".35"/></g><circle cx="60" cy="10" r="3.5" fill="#f1f5ff"/><path d="M0 48L14 32L24 42L38 28L54 44L64 36L72 42V64H0Z" fill="#17284d"/><path d="M14 32L11 36L14 35.4L16 37ZM38 28L34 33L37 32L39 34L41 31.5Z" fill="#c7d7ef"/><rect y="52" width="72" height="12" fill="#1e3a5f"/><path d="M8 56h18M36 59h22M14 61h10" stroke="#34d399" stroke-width=".9" opacity=".5"/>${pine(4, 54, 8, 14, '#0c1a33')}${pine(66, 54, 9, 16, '#0c1a33')}`],
};

const MOOD = {
  day: { light: '#fff6cf', overlay: null },
  sunset: { light: '#ffb98a', overlay: ['#ff7a59', 0.07] },
  night: { light: '#b8c8ff', overlay: ['#140f3a', 0.26] },
};

function windowLayer(view) {
  return `<g class="room-window"><rect x="188.5" y="16.5" width="84" height="74" rx="3" fill="#1d1238" opacity=".12"/><rect x="192" y="14" width="80" height="72" rx="3" fill="#fffaf2" stroke="#d6c3a5" stroke-width="1"/><svg x="196" y="18" width="72" height="64" viewBox="0 0 72 64">${view}<path d="M6 64L24 0H33L15 64ZM18 64L36 0H39L21 64Z" fill="#fff" opacity=".13"/></svg><rect x="196" y="18" width="72" height="64" fill="none" stroke="#cdb894" stroke-width="1"/><rect x="230.5" y="18" width="3" height="64" fill="#fffaf2"/><rect x="196" y="48.5" width="72" height="3" fill="#fffaf2"/><rect x="230.5" y="18" width="1" height="64" fill="#d6c3a5" opacity=".6"/><rect x="185" y="84" width="94" height="5" rx="1.5" fill="#fffaf2" stroke="#d6c3a5" stroke-width=".8"/><rect x="187" y="89" width="90" height="2.4" fill="#1d1238" opacity=".14"/></g>`;
}

/* ----------------------------------------------------------- мебель: диваны */

const SEAT = {
  'r-seat-beanbag': `${sh(40)}<path d="M-38 0Q-47 -20 -31 -34Q-14 -48 6 -45Q30 -41 38 -23Q44 -8 36 0Z" fill="#7c83f0" stroke="#4d51b8" stroke-width="1.2"/><path d="M-38 0Q-30 -11 -6 -13Q20 -14 36 0Z" fill="#6268d8"/><path d="M-36 -2Q-42 -18 -30 -30" stroke="#5a5fcc" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/><path d="M-20 -30Q-2 -22 18 -31" stroke="#5a5fcc" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M8 -42Q26 -39 33 -26" stroke="#b4b8ff" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M-6 -36l3 -3M2 -37l2 -3" stroke="#4d51b8" stroke-width=".8" opacity=".6"/>`,
  'r-seat-sofa': `${sh(56)}<rect x="-45" y="-7" width="4" height="7" rx="1" fill="#7a4a3a"/><rect x="41" y="-7" width="4" height="7" rx="1" fill="#7a4a3a"/><rect x="-46" y="-52" width="92" height="32" rx="9" fill="#ec82aa" stroke="#c0527b" stroke-width="1.2"/><rect x="-42" y="-48" width="41" height="25" rx="7" fill="#f394b9"/><rect x="1" y="-48" width="41" height="25" rx="7" fill="#f59bbd"/><rect x="-48" y="-27" width="96" height="21" rx="6" fill="#e3709a" stroke="#c0527b" stroke-width="1.2"/><rect x="-42" y="-31" width="41" height="11" rx="4" fill="#f7a6c5" stroke="#d76a93" stroke-width=".8"/><rect x="1" y="-31" width="41" height="11" rx="4" fill="#f9b0cc" stroke="#d76a93" stroke-width=".8"/><rect x="-55" y="-38" width="15" height="33" rx="7" fill="#e5789f" stroke="#c0527b" stroke-width="1.2"/><rect x="40" y="-38" width="15" height="33" rx="7" fill="#ee88ae" stroke="#c0527b" stroke-width="1.2"/><rect x="42" y="-36" width="10" height="4" rx="2" fill="#ffc6dc"/><rect x="-36" y="-45" width="16" height="15" rx="4" fill="#fde68a" stroke="#e0b94a" stroke-width=".8" transform="rotate(-12 -28 -37)"/><path d="M30 -46q6 2 10 8" stroke="#ffc6dc" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  'r-seat-bed': (() => {
    const cols = ['#f7a8b8', '#fcd581', '#9fd8c4', '#a7b8f7', '#f9c4a4'];
    let q = '';
    for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) q += `<rect x="${-52 + c * 13}" y="${-26 + r * 9}" width="13" height="9" fill="${cols[(c + r * 3) % 5]}"/>`;
    return `${sh(58)}<rect x="-50" y="-8" width="5" height="8" fill="#8a5530"/><rect x="45" y="-8" width="5" height="8" fill="#8a5530"/><path d="M-52 -24V-52Q-52 -62 -40 -62H40Q52 -62 52 -52V-24Z" fill="#b7794a" stroke="#8a5530" stroke-width="1.2"/><rect x="-45" y="-56" width="90" height="26" rx="5" fill="#c98b5a"/><path d="M-30 -56V-30M0 -56V-30M30 -56V-30" stroke="#b7794a" stroke-width="1.2"/><rect x="-52" y="-32" width="104" height="10" rx="4" fill="#fff7ec" stroke="#e3d3bd" stroke-width=".8"/><rect x="-44" y="-42" width="30" height="13" rx="6" fill="#fff" stroke="#ddd3ee" stroke-width=".8"/><rect x="12" y="-42" width="30" height="13" rx="6" fill="#fff" stroke="#ddd3ee" stroke-width=".8"/>${q}<path d="M-52 -26h104M-52 -17h104" stroke="#fff" stroke-width=".6" stroke-dasharray="2 1.5" opacity=".9"/><rect x="-52" y="-28" width="104" height="4" rx="1.5" fill="#fffaf2"/><rect x="-54" y="-10" width="108" height="6" rx="2" fill="#b7794a" stroke="#8a5530" stroke-width="1"/><rect x="30" y="-9" width="20" height="1.4" fill="#e0a774"/>`;
  })(),
  'r-seat-cloud': `${sh(54)}<g fill="#ece2ff" stroke="#b9a6ee" stroke-width="1.2"><circle cx="-34" cy="-40" r="15"/><circle cx="-12" cy="-48" r="17"/><circle cx="12" cy="-48" r="17"/><circle cx="34" cy="-40" r="15"/></g><rect x="-50" y="-38" width="100" height="32" rx="16" fill="#f5efff" stroke="#b9a6ee" stroke-width="1.2"/><rect x="-40" y="-32" width="80" height="12" rx="6" fill="#ffd3e7" stroke="#f29cc1" stroke-width=".8"/><g stroke-width="1.6" stroke-linecap="round"><path d="M-30 -27l2 -2" stroke="#60a5fa"/><path d="M-18 -25l3 0" stroke="#f59e0b"/><path d="M-4 -28l2 2" stroke="#34d399"/><path d="M10 -26l3 -1" stroke="#a78bfa"/><path d="M24 -28l2 2" stroke="#f87171"/></g><circle cx="-47" cy="-22" r="13" fill="#efe6ff" stroke="#b9a6ee" stroke-width="1.2"/><circle cx="47" cy="-22" r="13" fill="#f7f2ff" stroke="#b9a6ee" stroke-width="1.2"/><circle cx="-36" cy="-4" r="4" fill="#ff8fb8"/><circle cx="36" cy="-4" r="4" fill="#ff8fb8"/><path d="M14 -58q10 0 16 8M44 -30q6 2 7 10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  'r-seat-hammock': `${sh(56, 0, 5)}<rect x="-55" y="-66" width="6" height="66" rx="2" fill="#8b5a33" stroke="#6b4122" stroke-width="1"/><rect x="49" y="-66" width="6" height="66" rx="2" fill="#9a6838" stroke="#6b4122" stroke-width="1"/><path d="M-49 -58L-38 -34M49 -58L38 -34" stroke="#d6b88a" stroke-width="1.2"/><path d="M-40 -36Q0 -2 40 -36Q0 -18 -40 -36Z" fill="#f2c46d" stroke="#c58a35" stroke-width="1"/><path d="M-30 -30Q0 -6 30 -30M-20 -25Q0 -9 20 -25" stroke="#e07a4b" stroke-width="2.2" fill="none"/><ellipse cx="-22" cy="-30" rx="8" ry="4" fill="#fff7ea" transform="rotate(22 -22 -30)"/><g fill="#5fae62"><ellipse cx="-50" cy="-66" rx="7" ry="3.5" transform="rotate(-25 -50 -66)"/><ellipse cx="-56" cy="-62" rx="6" ry="3" transform="rotate(30 -56 -62)"/><ellipse cx="54" cy="-67" rx="7" ry="3.5" transform="rotate(25 54 -67)"/><ellipse cx="-52" cy="-44" rx="4" ry="2" transform="rotate(-40 -52 -44)"/><ellipse cx="53" cy="-38" rx="4" ry="2" transform="rotate(40 53 -38)"/></g><path d="M-52 -64q-3 10 2 20q-4 8 0 16M52 -64q4 12 -1 26" stroke="#4f9a52" stroke-width=".9" fill="none"/>`,
  'r-seat-shell': (() => {
    let fan = '';
    for (let i = 0; i < 9; i++) {
      const a = -80 + i * 20;
      fan += `<ellipse cx="0" cy="-30" rx="9.5" ry="28" fill="${i % 2 ? '#ffa894' : '#ffbcab'}" stroke="#e0715c" stroke-width="1" transform="rotate(${a} 0 -22) translate(0 -6)"/>`;
    }
    return `${sh(52)}<g>${fan}</g><circle cx="0" cy="-22" r="10" fill="#ffbcab"/><rect x="-6" y="-6" width="3" height="6" fill="#d4a531"/><rect x="3" y="-6" width="3" height="6" fill="#d4a531"/><rect x="-44" y="-28" width="88" height="22" rx="11" fill="#2bb3b1" stroke="#168a88" stroke-width="1.2"/><rect x="-38" y="-27" width="76" height="6" rx="3" fill="#5fd3cf"/><g class="room-pulse"><circle cx="0" cy="-48" r="10" fill="#fff8f0" opacity=".25"/></g><circle cx="0" cy="-48" r="6.5" fill="#fff8f0" stroke="#e8d9cf" stroke-width="1"/><circle cx="2" cy="-50" r="2" fill="#fff"/>${spark(30, -56, 3.5)}${spark(-26, -60, 2.5)}`;
  })(),
  'r-seat-gamer': `${sh(32)}<ellipse class="room-pulse" cx="0" cy="-1" rx="34" ry="5" fill="#22d3ee" fill-opacity=".35"/><path d="M0 -10L-22 -3M0 -10L22 -3M0 -10L-11 0M0 -10L11 0" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/><circle cx="-22" cy="-2.4" r="2.6" fill="#0b0f19"/><circle cx="22" cy="-2.4" r="2.6" fill="#0b0f19"/><circle cx="-11" cy="-1" r="2.4" fill="#0b0f19"/><circle cx="11" cy="-1" r="2.4" fill="#0b0f19"/><rect x="-2.5" y="-25" width="5" height="15" fill="#374151"/><path d="M-22 -30L-25 -82Q-25 -92 -14 -94H14Q25 -92 25 -82L22 -30Z" fill="#262b3d" stroke="#0b0f19" stroke-width="1.2"/><path d="M-25 -82L-22 -30H-15L-18 -84Z" fill="#e11d48"/><path d="M25 -82L22 -30H15L18 -84Z" fill="#f43f5e"/><rect class="room-neon" x="-2.5" y="-88" width="5" height="54" rx="2.5" fill="#22d3ee"/><rect x="-12" y="-86" width="24" height="9" rx="4" fill="#e11d48"/><rect x="-11" y="-52" width="22" height="9" rx="4" fill="#be123c"/><rect x="-27" y="-34" width="54" height="10" rx="5" fill="#1f2937" stroke="#0b0f19" stroke-width="1.2"/><rect x="-33" y="-48" width="6" height="18" rx="2" fill="#111827"/><rect x="27" y="-48" width="6" height="18" rx="2" fill="#111827"/><rect x="-36" y="-50" width="12" height="4" rx="2" fill="#374151"/><rect x="24" y="-50" width="12" height="4" rx="2" fill="#374151"/><path d="M12 -90q8 0 10 8" stroke="#64748b" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  'r-seat-rocket': `${sh(56)}<path d="M-36 -10L-40 0M30 -10L34 0" stroke="#64748b" stroke-width="3" stroke-linecap="round"/><g class="room-flame"><path d="M-46 -38Q-66 -28 -46 -16Q-52 -28 -46 -38Z" fill="#fb923c"/><path d="M-46 -33Q-58 -27 -46 -21Z" fill="#fde047"/></g><path d="M-40 -46L-54 -62L-28 -46ZM-40 -12L-52 -4L-30 -12Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/><path d="M-46 -46H30Q56 -42 58 -27Q56 -12 30 -8H-46Q-50 -27 -46 -46Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.2"/><path d="M30 -46Q56 -42 58 -27Q56 -12 30 -8Q37 -27 30 -46Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/><circle cx="18" cy="-27" r="7" fill="#7dd3fc" stroke="#64748b" stroke-width="2"/><circle cx="20" cy="-29" r="2" fill="#fff"/><path d="M-36 -50Q-14 -44 8 -50L8 -22Q-14 -18 -36 -22Z" fill="#6366f1" stroke="#4338ca" stroke-width="1"/>${spark(-24, -40, 2, '#fde68a', 'room-twinkle')}${spark(-6, -32, 2.2, '#fde68a', 'room-twinkle')}<circle cx="-14" cy="-44" r="1" fill="#fff"/><rect x="-46" y="-56" width="20" height="10" rx="5" fill="#fff" stroke="#cbd5e1" stroke-width=".8"/><rect x="-46" y="-20" width="84" height="2" fill="#cbd5e1"/>`,
  'r-seat-throne': `${sh(38)}${glow(0, -56, 46, '#fde68a', 'room-pulse')}<path d="M-27 -30L-29 -80Q-14 -88 0 -98Q14 -88 29 -80L27 -30Z" fill="#e0a82e" stroke="#a8741a" stroke-width="1.2"/><path d="M-21 -34L-22 -76Q-11 -82 0 -88Q11 -82 22 -76L21 -34Z" fill="#b0173f"/><path d="M-12 -70Q0 -78 12 -70M-14 -58H14M-14 -46H14" stroke="#8f1230" stroke-width="1" fill="none"/><path d="M0 -106l4 6l-4 6l-4 -6Z" fill="#38bdf8" stroke="#0369a1" stroke-width=".8"/><circle cx="-27" cy="-80" r="3" fill="#ef4444"/><circle cx="27" cy="-80" r="3" fill="#22c55e"/><rect x="-31" y="-30" width="62" height="22" fill="#e0a82e" stroke="#a8741a" stroke-width="1.2"/><path d="M-4 -19l4 -5l4 5l-4 5Z" fill="#ef4444" stroke="#a8741a" stroke-width=".6"/><path d="M-24 -26H-10M10 -26H24M-24 -12H24" stroke="#a8741a" stroke-width=".8"/><rect x="-30" y="-38" width="60" height="10" rx="4" fill="#c8203f" stroke="#8f1230" stroke-width="1"/><rect x="-39" y="-52" width="11" height="42" rx="4" fill="#e9b73f" stroke="#a8741a" stroke-width="1.2"/><rect x="28" y="-52" width="11" height="42" rx="4" fill="#f0c24d" stroke="#a8741a" stroke-width="1.2"/><circle cx="-33.5" cy="-54" r="5" fill="#f5cf5c" stroke="#a8741a" stroke-width="1"/><circle cx="33.5" cy="-54" r="5" fill="#f5cf5c" stroke="#a8741a" stroke-width="1"/><ellipse cx="-29" cy="-4" rx="7" ry="4" fill="#c48a1c"/><ellipse cx="29" cy="-4" rx="7" ry="4" fill="#c48a1c"/><path d="M20 -84q5 6 6 14" stroke="#fff3c4" stroke-width="2" fill="none" stroke-linecap="round"/>${spark(32, -92, 4.5)}${spark(-36, -70, 3.5, '#fff3c4')}${spark(4, -62, 3)}`,
};

/* ------------------------------------------------------------ мебель: столы */

const DESK = {
  'r-desk-wood': `${sh(38)}<rect x="-31" y="-34" width="5" height="34" fill="#a86d3e"/><rect x="-26" y="-34" width="34" height="8" fill="#94592f" opacity=".6"/><rect x="8" y="-34" width="24" height="34" fill="#b97b4b" stroke="#8f5a32" stroke-width="1"/><path d="M8 -23H32M8 -12H32" stroke="#8f5a32" stroke-width="1"/><circle cx="20" cy="-28.5" r="1.4" fill="#e8c08f"/><circle cx="20" cy="-17.5" r="1.4" fill="#e8c08f"/><circle cx="20" cy="-6.5" r="1.4" fill="#e8c08f"/><rect x="-35" y="-40" width="70" height="6" rx="2" fill="#c98b5a" stroke="#8f5a32" stroke-width="1"/><rect x="-33" y="-39.5" width="66" height="1.4" fill="#e0a774"/><rect x="-26" y="-49" width="9" height="9" rx="1.6" fill="#f87171" stroke="#c94b4b" stroke-width=".8"/><path d="M-17 -47q4 0 4 3t-4 3" stroke="#c94b4b" stroke-width="1.4" fill="none"/><path class="room-steam" d="M-23 -52q-2 -3 0 -6t0 -6M-20 -52q-2 -3 0 -5" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-opacity=".7"/><rect x="-6" y="-44" width="22" height="4" rx="1" fill="#60a5fa"/><rect x="-4" y="-48" width="19" height="4" rx="1" fill="#facc15"/><rect x="-5" y="-52" width="17" height="4" rx="1" fill="#34d399"/><rect x="20" y="-56" width="12" height="16" rx="1.4" fill="#fffaf0" stroke="#b97b4b" stroke-width="1.6"/><circle cx="26" cy="-50" r="3" fill="#a78bfa"/><path d="M22 -43q4 -5 8 0" fill="#7dd3fc"/>`,
  'r-desk-school': `${sh(36)}<path d="M-28 -36V0M28 -36V0M-28 -12H28" stroke="#4f8a6a" stroke-width="2.6" stroke-linecap="round"/><rect x="-26" y="-31" width="52" height="5" rx="1" fill="#5a9c78"/><rect x="-33" y="-41" width="66" height="5" rx="1.5" fill="#e9c27a" stroke="#b8893f" stroke-width="1"/><rect x="-31" y="-40.5" width="62" height="1.2" fill="#f7dca0"/><path d="M-20 -41L-4 -43V-49L-20 -47ZM-4 -43L12 -41V-47L-4 -49Z" fill="#fff" stroke="#cbd5e1" stroke-width=".8"/><path d="M-17 -45.6l10 -1.2M-17 -44l10 -1.2M-1 -46.8l10 1.2M-1 -45.2l10 1.2" stroke="#93c5fd" stroke-width=".6"/><rect x="15" y="-51" width="8" height="10" rx="1" fill="#60a5fa" stroke="#2563eb" stroke-width=".7"/><path d="M17 -51l-1 -7M19.5 -51v-8M22 -51l2 -6" stroke-width="1.6" stroke-linecap="round"/><path d="M17 -51l-1 -7" stroke="#facc15" stroke-width="1.6"/><path d="M19.5 -51v-8" stroke="#ef4444" stroke-width="1.6"/><path d="M22 -51l2 -6" stroke="#22c55e" stroke-width="1.6"/><circle cx="28" cy="-45" r="4" fill="#ef4444" stroke="#b91c1c" stroke-width=".7"/><path d="M28 -49q1 -2 3 -2" stroke="#16a34a" stroke-width="1.2" fill="none"/><circle cx="29.4" cy="-46.4" r="1" fill="#fff" opacity=".6"/>`,
  'r-desk-candy': `${sh(34)}<ellipse cx="0" cy="-2" rx="12" ry="2.6" fill="#f472b6"/><rect x="-4" y="-27" width="8" height="25" fill="#fff"/><path d="M-4 -24l8 -4M-4 -16l8 -4M-4 -8l8 -4" stroke="#f472b6" stroke-width="2.6"/><rect x="-32" y="-41" width="64" height="6" rx="3" fill="#ff9cc4" stroke="#e0628f" stroke-width="1"/><path d="M-32 -35Q-28 -27 -24 -35Q-20 -27 -16 -35Q-12 -27 -8 -35Q-4 -27 0 -35Q4 -27 8 -35Q12 -27 16 -35Q20 -27 24 -35Q28 -27 32 -35Z" fill="#fff0f6" stroke="#f9a8d4" stroke-width=".8"/><path d="M-18 -41H-6L-8 -48H-16Z" fill="#a78bfa" stroke="#7c5ce0" stroke-width=".7"/><circle cx="-15" cy="-50" r="4" fill="#fff"/><circle cx="-10" cy="-50" r="4" fill="#fff"/><circle cx="-12" cy="-53" r="4" fill="#fff"/><circle cx="-12" cy="-57.5" r="2" fill="#ef4444"/><rect x="6" y="-56" width="16" height="15" rx="4" fill="#e0f2fe" stroke="#93c5fd" stroke-width=".9" opacity=".9"/><rect x="5" y="-59" width="18" height="4" rx="1.5" fill="#f472b6"/><circle cx="10" cy="-46" r="2.2" fill="#facc15"/><circle cx="15" cy="-49" r="2.2" fill="#34d399"/><circle cx="18" cy="-44.6" r="2.2" fill="#f87171"/><circle cx="11" cy="-51.5" r="2" fill="#a78bfa"/><path d="M8 -53v8" stroke="#fff" stroke-width="1.2" opacity=".7"/>`,
  'r-desk-stump': `${sh(32)}<path d="M-28 0Q-24 -6 -26 -20Q-27 -30 -26 -34H26Q27 -30 26 -20Q24 -6 28 0Q20 -4 14 0Q6 -4 0 0Q-8 -4 -14 0Q-20 -4 -28 0Z" fill="#9a6234" stroke="#6b3f1d" stroke-width="1.2"/><path d="M-18 -30Q-20 -16 -16 -2M-6 -30Q-8 -14 -6 -3M8 -30Q10 -16 6 -3M18 -30Q20 -16 18 -3" stroke="#7d4b25" stroke-width="1.2" fill="none"/><ellipse cx="0" cy="-34" rx="27" ry="6" fill="#e3b77d" stroke="#b07d44" stroke-width="1"/><ellipse cx="0" cy="-34" rx="18" ry="4" fill="none" stroke="#c8955a" stroke-width=".8"/><ellipse cx="0" cy="-34" rx="9" ry="2" fill="none" stroke="#c8955a" stroke-width=".8"/><path d="M-26 -34q6 -3 12 -1" stroke="#5fae62" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M8 -36H20V-43H8Z" fill="#fef3c7" stroke="#d6b88a" stroke-width=".8"/><path d="M20 -41q3 0 3 2t-3 2" stroke="#d6b88a" stroke-width="1.1" fill="none"/><path class="room-steam" d="M12 -46q-2 -3 0 -6M16 -46q-2 -3 0 -6" stroke="#fff" stroke-width="1" fill="none" stroke-opacity=".7"/><rect x="-14" y="-40" width="16" height="4" rx="1" fill="#16a34a"/><rect x="-12" y="-43.5" width="13" height="3.5" rx="1" fill="#b45309"/><path d="M-26 -2a5 3 0 0 1 10 0Z" fill="#ef4444"/><rect x="-22" y="-2" width="2" height="2" fill="#fff7ed"/><circle cx="-23" cy="-3.6" r=".8" fill="#fff"/><path d="M18 -2a3.6 2.4 0 0 1 7.2 0Z" fill="#f97316"/>`,
  'r-desk-coral': `${sh(34)}<g stroke-linecap="round" fill="none"><path d="M-20 0V-16Q-20 -24 -26 -35M-20 -16Q-14 -24 -12 -35M-24 -27l-5 -3" stroke="#ff7f6e" stroke-width="4"/><path d="M20 0V-14Q21 -24 26 -35M20 -14Q14 -22 12 -35M23 -26l5 -4" stroke="#ff9f7a" stroke-width="4"/></g><ellipse cx="-20" cy="-1" rx="6" ry="1.6" fill="#e86a58"/><ellipse cx="20" cy="-1" rx="6" ry="1.6" fill="#f08a68"/><rect x="-33" y="-41" width="66" height="6" rx="3" fill="#fef3e2" stroke="#e7c9a3" stroke-width="1"/><path d="M-30 -39.6H30" stroke="#fff" stroke-width="1.2"/><circle cx="-20" cy="-38" r="1.1" fill="#fff" stroke="#e7c9a3" stroke-width=".4"/><circle cx="20" cy="-38" r="1.1" fill="#fff" stroke="#e7c9a3" stroke-width=".4"/><path d="M-16 -50l2.4 4.6l5 .6l-3.8 3.4l1 5l-4.6 -2.6l-4.6 2.6l1 -5l-3.8 -3.4l5 -.6Z" fill="#fb923c" stroke="#ea580c" stroke-width=".6" transform="translate(0 4)"/><path d="M6 -41Q4 -52 14 -54Q22 -52 22 -44Q18 -41 6 -41Z" fill="#fde2e4" stroke="#f9a8b8" stroke-width=".9"/><path d="M9 -43Q12 -50 18 -50M12 -42Q14 -47 19 -46" stroke="#f9a8b8" stroke-width=".8" fill="none"/><rect x="24" y="-50" width="6" height="9" rx="2" fill="#bae6fd" stroke="#7dd3fc" stroke-width=".7"/><rect x="25" y="-46" width="4" height="4.4" fill="#fde68a"/><rect x="25.5" y="-52" width="3" height="2.2" fill="#a16207"/>`,
  'r-desk-gamer': `${sh(38)}<path d="M-30 -36L-26 0M30 -36L26 0" stroke="#111827" stroke-width="4" stroke-linecap="round"/><path d="M-29 -26L-27 -8M29 -26L27 -8" stroke="#e11d48" stroke-width="1.4"/><rect x="-35" y="-41" width="70" height="5" rx="1.5" fill="#1f2333" stroke="#0b0d17" stroke-width="1"/><rect class="room-rgb" x="-34" y="-36" width="68" height="1.8" fill="#e879f9"/><ellipse cx="0" cy="-41" rx="10" ry="1.4" fill="#111827"/><rect x="-2.5" y="-50" width="5" height="9" fill="#111827"/><rect x="-25" y="-72" width="50" height="24" rx="2" fill="#0b1020" stroke="#111827" stroke-width="2"/><svg x="-23" y="-70" width="46" height="20" viewBox="0 0 46 20"><rect width="46" height="20" fill="#2a1f6b"/>${stars(41, 6, 46, 10)}<rect y="15" width="46" height="5" fill="#22c55e"/><rect y="15" width="46" height="1.2" fill="#86efac"/><rect x="18" y="11" width="6" height="4" fill="#16a34a"/><g class="room-hop"><rect x="9" y="9" width="4" height="5" rx="1" fill="#f472b6"/><rect x="10" y="10" width="1.2" height="1.2" fill="#fff"/></g><circle cx="32" cy="7" r="2" fill="#facc15" class="room-twinkle"/><rect x="36" y="11" width="3" height="4" fill="#ef4444"/></svg><rect class="room-screen" x="-23" y="-70" width="46" height="20" fill="#a5f3fc" fill-opacity=".08"/><rect x="-20" y="-45" width="28" height="4" rx="1" fill="#374151"/><rect class="room-rgb" x="-19" y="-44.4" width="26" height="1" fill="#22d3ee" style="animation-delay:-1s"/><ellipse cx="16" cy="-42.6" rx="3" ry="1.8" fill="#374151"/><rect x="-33" y="-52" width="7" height="11" rx="1.5" fill="#111827"/><circle cx="-29.5" cy="-48.5" r="2" fill="#374151"/><circle cx="-29.5" cy="-43.5" r="1.2" fill="#374151"/><path d="M25 -48q4 -8 8 0" stroke="#7c3aed" stroke-width="1.6" fill="none"/><rect x="24" y="-48" width="3" height="5" rx="1" fill="#7c3aed"/><rect x="31" y="-48" width="3" height="5" rx="1" fill="#7c3aed"/>`,
  'r-desk-console': `${sh(38)}<path d="M-33 0V-28L-27 -42H27L33 -28V0Z" fill="#cbd5e1" stroke="#64748b" stroke-width="1.2"/><path d="M-27 -42H27L33 -28H-33Z" fill="#475569" stroke="#334155" stroke-width="1"/><rect x="-29" y="-24" width="58" height="20" rx="2" fill="#e2e8f0"/><path d="M-24 -18h14M-24 -13h10M10 -18h14M14 -13h10" stroke="#94a3b8" stroke-width="1.4" stroke-linecap="round"/><circle class="room-blink" cx="-22" cy="-35" r="2.2" fill="#ef4444"/><circle class="room-blink" cx="-14" cy="-35" r="2.2" fill="#facc15" style="animation-delay:-.6s"/><circle class="room-blink" cx="-6" cy="-35" r="2.2" fill="#22c55e" style="animation-delay:-1.2s"/><rect x="2" y="-37" width="12" height="4" rx="1" fill="#22d3ee" class="room-pulse"/><path d="M20 -35l4 -6" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round"/><circle cx="24" cy="-41" r="2" fill="#ef4444"/><rect x="-17" y="-66" width="34" height="24" rx="3" fill="#0f2e2a" stroke="#64748b" stroke-width="1.6"/><g fill="none" stroke="#34d399" stroke-width=".6" opacity=".6"><circle cx="0" cy="-54" r="9"/><circle cx="0" cy="-54" r="5"/><path d="M-11 -54H11M0 -65V-43"/></g><g class="room-sweep"><circle cx="0" cy="-54" r="9" fill="none"/><path d="M0 -54L0 -63A9 9 0 0 1 7.8 -58.5Z" fill="#34d399" opacity=".45"/></g><circle class="room-blink" cx="4" cy="-58" r="1.1" fill="#a7f3d0"/><path d="M-12 -66V-74" stroke="#64748b" stroke-width="1.2"/><circle class="room-blink" cx="-12" cy="-75" r="1.8" fill="#f43f5e" style="animation-delay:-.3s"/>`,
  'r-desk-gold': `${sh(38)}${glow(16, -50, 18, '#a5f3fc', 'room-pulse')}<path d="M-30 -32Q-34 -16 -28 -4Q-30 -1 -26 0M30 -32Q34 -16 28 -4Q30 -1 26 0" stroke="#7c2d12" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M-30 -32Q-34 -16 -28 -4M30 -32Q34 -16 28 -4" stroke="#d4a531" stroke-width="1" fill="none"/><ellipse cx="-26" cy="-1" rx="3" ry="1.6" fill="#d4a531"/><ellipse cx="26" cy="-1" rx="3" ry="1.6" fill="#d4a531"/><rect x="-32" y="-35" width="64" height="18" fill="#6b2410" stroke="#d4a531" stroke-width="1.2"/><rect x="-28" y="-32" width="24" height="12" rx="1" fill="none" stroke="#d4a531" stroke-width=".9"/><rect x="4" y="-32" width="24" height="12" rx="1" fill="none" stroke="#d4a531" stroke-width=".9"/><circle cx="-16" cy="-26" r="1.6" fill="#f2c94c"/><circle cx="16" cy="-26" r="1.6" fill="#f2c94c"/><path d="M-6 -17Q0 -12 6 -17" stroke="#d4a531" stroke-width="1" fill="none"/><rect x="-35" y="-41" width="70" height="6" rx="1.5" fill="#7c2d12" stroke="#d4a531" stroke-width="1.2"/><rect x="-33" y="-40" width="66" height="1.2" fill="#a8461f"/><path d="M-28 -41h14v-2.6a3 1.4 0 0 0 0 -2.8h-14a3 1.4 0 0 1 0 2.8Z" fill="#fef3c7" stroke="#d6b88a" stroke-width=".7"/><rect x="-10" y="-47" width="7" height="6" rx="2" fill="#1e3a8a" stroke="#d4a531" stroke-width=".7"/><path d="M-6 -47Q-2 -58 6 -66Q4 -56 -5 -47Z" fill="#fff" stroke="#cbd5e1" stroke-width=".6"/><path d="M-6 -47L4 -62" stroke="#cbd5e1" stroke-width=".5"/><path d="M10 -41h12l-2 -3h-8Z" fill="#d4a531"/><circle cx="16" cy="-50" r="7" fill="#a5f3fc" stroke="#67e8f9" stroke-width=".8" opacity=".9"/><circle cx="14" cy="-52" r="2.2" fill="#fff" opacity=".8"/><circle cx="18" cy="-48" r="2.4" fill="#c084fc" fill-opacity=".5" class="room-pulse"/>${spark(26, -60, 3)}${spark(-30, -50, 2.5, '#fff3c4')}`,
};

/* ----------------------------------------------------------- мебель: шкафы */

const books = (x0, x1, yb, seed, cols, hMin = 13, hVar = 6) => {
  const r = rng(seed);
  let out = '', x = x0;
  while (x < x1 - 3) {
    const w = 3 + Math.floor(r() * 3), h = hMin + Math.floor(r() * hVar);
    if (x + w > x1) break;
    if (false) {
      out += `<rect x="${x + 1}" y="${yb - h + 1}" width="4" height="${h - 1}" rx=".6" fill="${cols[Math.floor(r() * cols.length)]}" transform="rotate(14 ${x + 1} ${yb})"/>`;
      x += 7;
      continue;
    }
    out += `<rect x="${x}" y="${yb - h}" width="${w}" height="${h}" rx=".6" fill="${cols[Math.floor(r() * cols.length)]}"/><rect x="${x}" y="${yb - h + 3}" width="${w}" height="1" fill="#fff" opacity=".4"/>`;
    x += w + 0.5;
  }
  return out;
};
const BOOK_COLS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];
const trophy = (x, y, s = 1, c = '#facc15', d = '#d4a10a') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-5 -14H5V-11Q5 -6 0 -5Q-5 -6 -5 -11Z" fill="${c}" stroke="${d}" stroke-width=".6"/><path d="M-5 -12.5q-3 0 -3 2.5t4 2M5 -12.5q3 0 3 2.5t-4 2" stroke="${d}" stroke-width="1" fill="none"/><rect x="-1" y="-5" width="2" height="2.6" fill="${d}"/><rect x="-3.6" y="-2.6" width="7.2" height="2.6" rx=".6" fill="#7c4a1e"/></g>`;
const flask = (x, y, c, round = true) =>
  round
    ? `<g transform="translate(${x} ${y})"><circle cx="0" cy="-4.5" r="4.5" fill="#e0f2fe" opacity=".7"/><path d="M-4.4 -3.4A4.5 4.5 0 0 0 4.4 -3.4Z" fill="${c}" class="room-pulse"/><rect x="-1.2" y="-12" width="2.4" height="4" fill="#e0f2fe"/><rect x="-1.5" y="-13" width="3" height="1.6" fill="#92400e"/><circle cx="-1.6" cy="-6" r=".9" fill="#fff"/></g>`
    : `<g transform="translate(${x} ${y})"><rect x="-2.6" y="-12" width="5.2" height="12" rx="1.4" fill="#e0f2fe" opacity=".7"/><rect x="-2.6" y="-7" width="5.2" height="7" rx="1.4" fill="${c}" class="room-pulse"/><rect x="-1.4" y="-14" width="2.8" height="2.4" fill="#92400e"/></g>`;

const SHELF = {
  'r-shelf-books': `${sh(26)}<rect x="-23" y="-88" width="46" height="88" rx="2" fill="#b8794a" stroke="#8a5530" stroke-width="1.2"/><rect x="-19" y="-82" width="38" height="78" fill="#7d4b28"/>${books(-18, 18, -61, 2, BOOK_COLS)}${books(-18, 18, -35, 5, BOOK_COLS)}${books(-18, 6, -7, 9, BOOK_COLS, 14, 5)}<rect x="8" y="-14" width="9" height="7" rx="1.4" fill="#f9a8d4"/><rect x="9" y="-21" width="7" height="7" rx="1.4" fill="#fde68a"/><rect x="-19" y="-61" width="38" height="3" fill="#c98b5a"/><rect x="-19" y="-35" width="38" height="3" fill="#c98b5a"/><rect x="-25" y="-91" width="50" height="4" rx="1" fill="#c98b5a" stroke="#8a5530" stroke-width="1"/><rect x="-23" y="-4" width="46" height="4" fill="#8a5530"/><path d="M-12 -91h8l-1 -6h-6Z" fill="#e0855a"/><path d="M-8 -97q-6 -6 -4 -10q3 3 4 10q1 -8 5 -9q1 5 -5 9" fill="#5fae62"/><circle cx="10" cy="-96" r="5" fill="#fffaf0" stroke="#8a5530" stroke-width="1"/><path d="M10 -96V-99M10 -96h2" stroke="#8a5530" stroke-width=".8"/><path d="M19 -86V-4" stroke="#d9a070" stroke-width="1" opacity=".5"/>`,
  'r-shelf-cubes': `${sh(25)}<rect x="-18" y="-3" width="3" height="3" fill="#94a3b8"/><rect x="15" y="-3" width="3" height="3" fill="#94a3b8"/><rect x="-22" y="-80" width="44" height="77" rx="2" fill="#f8fafc" stroke="#b6c2d4" stroke-width="1.2"/><g fill="#e2e8f0"><rect x="-19" y="-77" width="18" height="22"/><rect x="1" y="-77" width="18" height="22"/><rect x="-19" y="-52" width="18" height="22"/><rect x="1" y="-52" width="18" height="22"/><rect x="-19" y="-27" width="18" height="21"/><rect x="1" y="-27" width="18" height="21"/></g><rect x="-17" y="-67" width="14" height="12" rx="2" fill="#d6a46a" stroke="#a87638" stroke-width=".7"/><path d="M-17 -63h14M-17 -59h14" stroke="#b9874a" stroke-width=".7"/>${books(2, 18, -55, 12, BOOK_COLS, 12, 5)}<circle cx="-10" cy="-37" r="6.5" fill="#fb7185"/><path d="M-16 -37h13M-10 -43.5v13" stroke="#fff" stroke-width="1" opacity=".7"/><path d="M5 -30h10l-1.4 -8h-7.2Z" fill="#60a5fa"/><path d="M10 -38q-5 -5 -3 -9q3 3 3 9q1 -7 5 -8q0 5 -5 8" fill="#4caf6a"/><rect x="-17" y="-18" width="14" height="12" rx="1.6" fill="#c4b5fd" stroke="#8b5cf6" stroke-width=".7"/><path d="M-10 -18v12M-17 -12h14" stroke="#8b5cf6" stroke-width=".8"/><rect x="3" y="-14" width="14" height="8" rx="1.4" fill="#fde68a" stroke="#d4a10a" stroke-width=".6"/><rect x="5" y="-20" width="10" height="6" rx="1.4" fill="#86efac" stroke="#16a34a" stroke-width=".6"/>`,
  'r-shelf-trophy': `${sh(26)}<rect x="-23" y="-90" width="46" height="90" rx="2" fill="#9a5f33" stroke="#6f3f1e" stroke-width="1.2"/><rect x="-19" y="-84" width="38" height="76" fill="#4a2c18"/><rect x="-19" y="-60" width="38" height="2.6" fill="#b8794a"/><rect x="-19" y="-34" width="38" height="2.6" fill="#b8794a"/>${trophy(-9, -60, 1.2)}${trophy(9, -60, 0.9, '#cbd5e1', '#94a3b8')}<g transform="translate(-6 -34)"><path d="M0 -16l3 6l6 .6l-4.6 4l1.4 6l-5.8 -3.4l-5.8 3.4l1.4 -6l-4.6 -4l6 -.6Z" fill="#facc15" stroke="#d4a10a" stroke-width=".6" transform="scale(.8)"/><rect x="-3" y="-3" width="6" height="3" fill="#7c4a1e"/></g><g transform="translate(10 -46)"><path d="M-3 -10L0 -2L3 -10" stroke="#3b82f6" stroke-width="2.4" fill="none"/><circle cx="0" cy="0" r="4" fill="#f59e0b" stroke="#b45309" stroke-width=".7"/></g>${trophy(-8, -8, 1, '#f59e0b', '#b45309')}<rect x="2" y="-20" width="14" height="12" rx="1" fill="#fffaf0" stroke="#d4a531" stroke-width="1"/><path d="M5 -16h8M5 -13h6" stroke="#cbd5e1" stroke-width=".8"/><rect x="-19" y="-84" width="38" height="76" fill="#bfe3ff" opacity=".18"/><path d="M-14 -84L-22 -60M-4 -84L-19 -40M14 -60L4 -8" stroke="#fff" stroke-width="1.4" opacity=".3"/><path d="M0 -84V-8" stroke="#6f3f1e" stroke-width="1.6"/><circle cx="-2.5" cy="-46" r="1" fill="#f2c94c"/><circle cx="2.5" cy="-46" r="1" fill="#f2c94c"/><rect x="-25" y="-93" width="50" height="4" rx="1" fill="#b8794a" stroke="#6f3f1e" stroke-width="1"/>`,
  'r-shelf-jars': (() => {
    const jar = (x, y, c1, c2, c3) => `<g transform="translate(${x} ${y})"><rect x="-6" y="-14" width="12" height="14" rx="3" fill="#f0f9ff" stroke="#bae6fd" stroke-width=".7"/><rect x="-6.6" y="-16.6" width="13.2" height="3.6" rx="1.4" fill="${c1}"/><circle cx="-2.4" cy="-3.4" r="2.2" fill="${c2}"/><circle cx="2.4" cy="-3.6" r="2.2" fill="${c3}"/><circle cx="0" cy="-7.4" r="2.2" fill="${c1}"/><circle cx="-2.6" cy="-10.4" r="1.8" fill="${c3}"/><circle cx="2.4" cy="-10.2" r="1.8" fill="${c2}"/><path d="M-4 -12v9" stroke="#fff" stroke-width="1" opacity=".8"/></g>`;
    return `${sh(26)}<rect x="-23" y="-82" width="46" height="82" rx="4" fill="#ff9cc4" stroke="#d9608f" stroke-width="1.2"/><rect x="-19" y="-77" width="38" height="70" rx="2" fill="#ffe1ee"/><rect x="-19" y="-52" width="38" height="2.6" fill="#ff9cc4"/><rect x="-19" y="-27" width="38" height="2.6" fill="#ff9cc4"/>${jar(-9, -52, '#f472b6', '#facc15', '#34d399')}${jar(9, -52, '#60a5fa', '#f87171', '#a78bfa')}${jar(-9, -27, '#34d399', '#fb923c', '#f472b6')}${jar(9, -27, '#facc15', '#60a5fa', '#f87171')}<rect x="-17" y="-16" width="34" height="9" rx="2" fill="#fff" stroke="#f9a8d4" stroke-width=".7"/><path d="M-14 -11.5h6M-4 -11.5h6M6 -11.5h6" stroke="#f472b6" stroke-width="3" stroke-linecap="round" stroke-dasharray="1.5 1.2"/><path d="M-26 -82Q-20 -76 -14 -82Q-8 -76 -2 -82Q4 -76 10 -82Q16 -76 22 -82Q24 -79 26 -82" stroke="#fff" stroke-width="2.4" fill="none"/><g transform="translate(-8 -82)"><path d="M0 0V-10" stroke="#fff" stroke-width="1.4"/><circle cx="0" cy="-14" r="5" fill="#f472b6"/><path d="M0 -14m-3 0a3 3 0 1 1 3 3" stroke="#fff" stroke-width="1.1" fill="none"/></g><g transform="translate(8 -82)"><path d="M0 0V-7" stroke="#fff" stroke-width="1.4"/><circle cx="0" cy="-10" r="4" fill="#38bdf8"/><path d="M0 -10m-2.2 0a2.2 2.2 0 1 1 2.2 2.2" stroke="#fff" stroke-width="1" fill="none"/></g><rect x="-21" y="-4" width="4" height="4" rx="1" fill="#d9608f"/><rect x="17" y="-4" width="4" height="4" rx="1" fill="#d9608f"/>`;
  })(),
  'r-shelf-terrarium': `${sh(26)}<path d="M-20 0L-10 -88M20 0L10 -88" stroke="#a0673a" stroke-width="3.4" stroke-linecap="round"/><path d="M-20 0L-10 -88M20 0L10 -88" stroke="#c48553" stroke-width="1" stroke-linecap="round"/><g fill="#c98b5a" stroke="#8a5530" stroke-width=".8"><rect x="-18" y="-24" width="36" height="3" rx="1"/><rect x="-15" y="-50" width="30" height="3" rx="1"/><rect x="-12" y="-74" width="24" height="3" rx="1"/></g><path d="M-14 -24a10 10 0 0 1 20 0Z" fill="#e0f2fe" opacity=".55" stroke="#93c5fd" stroke-width=".8"/><path d="M-13 -24h18v-3h-18Z" fill="#a16207"/><path d="M-10 -27q0 -6 3 -8q1 4 -1 8M-2 -27q2 -5 4 -6q0 4 -2 6" fill="#4caf6a"/><circle cx="-4" cy="-28" r="1.2" fill="#f87171"/><path d="M-2 -33q2 -4 6 -4" stroke="#fff" stroke-width="1" fill="none" opacity=".8"/><path d="M9 -24h7l-1 -6h-5Z" fill="#e0855a"/><path d="M12.5 -30q-4 -5 -2 -8q2 2 2 8q1 -6 4 -6q0 4 -4 6" fill="#5fae62"/><path d="M-10 -50h9l-1.2 -6.6h-6.6Z" fill="#fff" stroke="#cbd5e1" stroke-width=".6"/><path d="M-6 -56.6q-4 -7 0 -11q3 5 0 11ZM-6 -56.6q-7 -2 -9 -6q5 0 9 6ZM-6 -56.6q6 -3 8 -8q-5 1 -8 8Z" fill="#3f9a57"/><path d="M3 -50h8l-1 -6h-6Z" fill="#c084fc"/><path d="M7 -56q-2 4 -3 12q-1 6 1 14M7 -56q3 6 4 14" stroke="#4f9a52" stroke-width=".9" fill="none"/><g fill="#5fae62"><ellipse cx="4" cy="-46" rx="2" ry="1.2"/><ellipse cx="5" cy="-38" rx="2" ry="1.2"/><ellipse cx="11" cy="-42" rx="2" ry="1.2"/><ellipse cx="10.6" cy="-34" rx="2" ry="1.2"/></g><path d="M-7 -74h14l-1.4 -7h-11.2Z" fill="#94a3b8"/><path d="M0 -81q-3 -5 -6 -6M0 -81q2 -6 6 -7M0 -81v-8" stroke="#4caf6a" stroke-width="2" stroke-linecap="round" fill="none"/>`,
  'r-shelf-potion': `${sh(26)}${glow(0, -96, 16, '#c084fc', 'room-pulse')}<path d="M-23 0V-76Q-23 -90 0 -92Q23 -90 23 -76V0Z" fill="#3b1f5c" stroke="#24123c" stroke-width="1.2"/><path d="M-19 -4V-74Q-19 -86 0 -87Q19 -86 19 -74V-4Z" fill="#24123c"/><rect x="-19" y="-58" width="38" height="2.6" fill="#6b3f99"/><rect x="-19" y="-32" width="38" height="2.6" fill="#6b3f99"/>${flask(-11, -58, '#a3e635')}${flask(-1, -58, '#f472b6', false)}${flask(10, -58, '#22d3ee')}${flask(-10, -32, '#facc15', false)}${flask(1, -32, '#c084fc')}${flask(12, -32, '#fb7185', false)}<rect x="-16" y="-10" width="16" height="5" rx="1" fill="#7c2d12"/><rect x="-14" y="-14" width="14" height="4" rx="1" fill="#065f46"/><path d="M6 -4l4 -12l4 12Z" fill="#a78bfa" stroke="#7c3aed" stroke-width=".6"/><g class="room-bubbles" fill="#a3e635"><circle cx="-11" cy="-70" r=".9"/><circle cx="-10" cy="-74" r=".7"/></g><g class="room-bubbles" fill="#22d3ee" style="animation-delay:-1.2s"><circle cx="10" cy="-70" r=".9"/><circle cx="11" cy="-74" r=".7"/></g><path d="M-8 -92h16l-2 -2h-12Z" fill="#d4a531"/><circle cx="0" cy="-98" r="6.5" fill="#c4b5fd" opacity=".9"/><circle cx="-2" cy="-100" r="2" fill="#fff" opacity=".8"/><circle cx="1" cy="-97" r="2.4" fill="#f0abfc" class="room-pulse"/>${spark(-16, -82, 2.2, '#f5d0fe')}${spark(16, -78, 2, '#f5d0fe')}`,
  'r-shelf-server': `${sh(24)}<rect x="-21" y="-88" width="42" height="86" rx="2" fill="#1f2333" stroke="#0b0d17" stroke-width="1.2"/><rect x="-18" y="-85" width="36" height="80" fill="#111522"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => {
    const y = -83 + i * 11;
    return `<rect x="-17" y="${y}" width="34" height="9" rx="1" fill="#2a3045" stroke="#3b4260" stroke-width=".5"/><path d="M-14 ${y + 3}h12M-14 ${y + 6}h12" stroke="#151a2b" stroke-width="1.2"/><circle class="room-blink" cx="6" cy="${y + 4.5}" r="1.1" fill="${['#22c55e', '#22d3ee', '#a3e635'][i % 3]}" style="animation-delay:-${(i * 0.37).toFixed(2)}s"/><circle class="room-blink" cx="10" cy="${y + 4.5}" r="1.1" fill="${i % 2 ? '#e879f9' : '#22c55e'}" style="animation-delay:-${(i * 0.61 + 0.2).toFixed(2)}s"/><rect x="13" y="${y + 3.4}" width="2.4" height="2.2" fill="#475569"/>`;
  }).join('')}<rect class="room-rgb" x="-21" y="-90" width="42" height="2" fill="#22d3ee"/><path d="M21 -40q8 6 4 40" stroke="#e879f9" stroke-width="1.6" fill="none"/><path d="M21 -30q5 8 2 30" stroke="#22d3ee" stroke-width="1.6" fill="none"/><rect x="-19" y="-2" width="5" height="2" fill="#0b0d17"/><rect x="14" y="-2" width="5" height="2" fill="#0b0d17"/>`,
  'r-shelf-capsule': `${sh(25)}<rect x="-20" y="-14" width="40" height="14" rx="3" fill="#cbd5e1" stroke="#64748b" stroke-width="1.1"/><rect x="-14" y="-10" width="28" height="3" rx="1.5" fill="#22d3ee" class="room-pulse"/><path d="M-20 -14V-72Q-20 -92 0 -92Q20 -92 20 -72V-14Z" fill="#1e1b4b" stroke="#64748b" stroke-width="1.4"/><path d="M-16 -14V-71Q-16 -88 0 -88Q16 -88 16 -71V-14Z" fill="#c7d2fe" opacity=".14"/>${stars(51, 10, 30, 70, -15, -86)}<rect x="-16" y="-50" width="32" height="2" fill="#94a3b8"/><path d="M-12 -43A10 3 -10 0 1 12 -47" stroke="#ffd8a8" stroke-width="1.4" fill="none"/><circle cx="0" cy="-45" r="7" fill="#f4a259"/><path d="M-6.6 -46.4Q0 -48 6.6 -45.4" stroke="#e07a3c" stroke-width="1.2" fill="none"/><path d="M12 -47A10 3 -10 0 1 -12 -43" stroke="#ffd8a8" stroke-width="1.4" fill="none"/><rect x="-1" y="-38" width="2" height="-0" fill="#94a3b8"/><g class="room-float"><path d="M0 -82Q5 -76 5 -66H-5Q-5 -76 0 -82Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width=".8"/><path d="M-5 -68l-3 4h3ZM5 -68l3 4h-3Z" fill="#ef4444"/><circle cx="0" cy="-72" r="1.8" fill="#38bdf8"/><path d="M-2 -64l2 4l2 -4" fill="#fb923c"/></g><circle cx="-8" cy="-24" r="4" fill="#60a5fa"/><path d="M-10 -25q2 1 4 -1" stroke="#34d399" stroke-width="1" fill="none"/><circle cx="7" cy="-22" r="2.6" fill="#f472b6"/><path d="M-12 -86Q-16 -80 -16 -70" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".4"/>`,
  'r-shelf-royal': `${sh(27)}${glow(0, -98, 18, '#fde68a', 'room-pulse')}<path d="M-24 0V-78Q-24 -86 -16 -88Q0 -96 16 -88Q24 -86 24 -78V0Z" fill="#7c2d12" stroke="#d4a531" stroke-width="1.6"/><path d="M-19 -6V-76Q-19 -82 -13 -83Q0 -89 13 -83Q19 -82 19 -76V-6Z" fill="#3b0d1e"/><path d="M0 -88V-6" stroke="#d4a531" stroke-width="1.4"/><rect x="-19" y="-54" width="38" height="2.4" fill="#d4a531"/><rect x="-19" y="-30" width="38" height="2.4" fill="#d4a531"/><path d="M-14 -54h8l-1 -5q2 -3 0 -6h-6q-2 3 0 6Z" fill="#facc15" stroke="#b8860b" stroke-width=".6"/><path d="M5 -54h10v-2l-2 -5h-6l-2 5Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width=".6"/><circle cx="10" cy="-62" r="2.6" fill="#ef4444"/><path d="M-12 -30l-3 -4l3 -4l3 4ZM-4 -30l-2.4 -3l2.4 -3l2.4 3Z" fill="#22d3ee" stroke="#0e7490" stroke-width=".5"/><path d="M4 -30l-2.4 -4l2.4 -4l2.4 4ZM12 -30l-3 -5l3 -5l3 5Z" fill="#a855f7" stroke="#6b21a8" stroke-width=".5"/><g fill="#facc15" stroke="#b8860b" stroke-width=".5"><circle cx="-12" cy="-8" r="2.4"/><circle cx="-8" cy="-8" r="2.4"/><circle cx="-10" cy="-11" r="2.4"/><circle cx="8" cy="-8" r="2.4"/></g><rect x="-19" y="-83" width="38" height="77" fill="#fde68a" opacity=".06"/><path class="room-shimmer" d="M-19 -83h6l-12 77h-6Z" fill="#fff" fill-opacity=".18"/><circle cx="-2.6" cy="-42" r="1.2" fill="#f2c94c"/><circle cx="2.6" cy="-42" r="1.2" fill="#f2c94c"/><path d="M-10 -94L-12 -104L-6 -99L0 -107L6 -99L12 -104L10 -94Z" fill="#facc15" stroke="#b8860b" stroke-width=".8"/><circle cx="0" cy="-98" r="1.6" fill="#ef4444"/>${spark(17, -100, 3.2)}${spark(-20, -90, 2.4, '#fff3c4')}<rect x="-26" y="-4" width="52" height="4" rx="1" fill="#d4a531"/>`,
};

/* ---------------------------------------------------------------- растения */

const pot = (c, d, rim, w = 12, h = 18) =>
  `<path d="M-${w} -${h}H${w}L${w - 2.6} 0H-${w - 2.6}Z" fill="${c}" stroke="${d}" stroke-width="1"/><rect x="-${w + 1.5}" y="-${h + 4}" width="${2 * w + 3}" height="5" rx="1.5" fill="${rim}" stroke="${d}" stroke-width="1"/><path d="M${w - 4} -${h - 2}L${w - 5.6} -3" stroke="#fff" stroke-width="1.4" opacity=".3" stroke-linecap="round"/>`;
const leaf = (x, y, a, l, w, c, vein) =>
  `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0Q${w} -${f1(l * 0.4)} 0 -${l}Q-${w} -${f1(l * 0.4)} 0 0Z" fill="${c}"/>${vein ? `<path d="M0 -1V-${f1(l * 0.85)}" stroke="${vein}" stroke-width=".8"/>` : ''}</g>`;

const PLANT = {
  'r-plant-cactus': `${sh(16)}<path d="M-6 -22V-56Q-6 -62 0 -62Q6 -62 6 -56V-22Z" fill="#4caf6a" stroke="#2f7d48" stroke-width="1"/><path d="M-6 -38H-12Q-15 -38 -15 -42V-50Q-15 -53 -12.5 -53Q-10 -53 -10 -50V-43H-6Z" fill="#4caf6a" stroke="#2f7d48" stroke-width="1"/><path d="M6 -32H11Q14 -32 14 -36V-46Q14 -49 11.5 -49Q9 -49 9 -46V-37H6Z" fill="#56bb74" stroke="#2f7d48" stroke-width="1"/><path d="M-2 -58V-24M2 -58V-24" stroke="#3a9358" stroke-width=".8"/><path d="M3.4 -58V-26" stroke="#8fe0a6" stroke-width="1.2" opacity=".7"/><g stroke="#e9f5e0" stroke-width=".6"><path d="M-6 -50l-2 -1M-6 -30l-2 -1M6 -44l2 -1M6 -54l2 -1M-12 -48l-2 0M12 -42l2 0"/></g><circle cx="0" cy="-63" r="3" fill="#f472b6"/><circle cx="0" cy="-63" r="1.2" fill="#fde68a"/>${pot('#d9774b', '#a8522d', '#e68a5c')}<ellipse cx="0" cy="-21" rx="10" ry="1.6" fill="#7a4a2a"/>`,
  'r-plant-monstera': `${sh(20)}<g class="room-sway">${[[-4, -20, -48, 30, 13, '#2f9e5b'], [2, -20, 40, 30, 13, '#38a865'], [0, -20, -8, 40, 15, '#2a8f52'], [-2, -20, -82, 22, 10, '#3fb36e'], [2, -20, 74, 24, 10, '#33a061']].map(([x, y, a, l, w, c]) => `<path d="M${x} ${y}L${f1(x + Math.sin(a * Math.PI / 180) * l * 0.45)} ${f1(y - Math.cos(a * Math.PI / 180) * l * 0.45)}" stroke="#2f7d48" stroke-width="1.2"/>${leaf(f1(x + Math.sin(a * Math.PI / 180) * l * 0.4), f1(y - Math.cos(a * Math.PI / 180) * l * 0.4), a, l, w, c, '#1f6e3e')}`).join('')}<path d="M-6 -60l4 3M-10 -52l5 2M6 -58l-4 3" stroke="#e9f9ee" stroke-width="1.2" opacity=".5"/></g><path d="M-12 -18H12L10 0H-10Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/><path d="M-11.4 -12H11.4M-10.8 -6H10.8" stroke="#94a3b8" stroke-width="1.2"/><rect x="-13" y="-21" width="26" height="4" rx="1.5" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1"/>`,
  'r-plant-sunflower': (() => {
    const flower = (x, y, r) => `<g transform="translate(${x} ${y})">${Array.from({ length: 12 }, (_, i) => `<ellipse cx="0" cy="-${f1(r * 0.75)}" rx="${f1(r * 0.28)}" ry="${f1(r * 0.5)}" fill="${i % 2 ? '#facc15' : '#fbbf24'}" transform="rotate(${i * 30})"/>`).join('')}<circle r="${f1(r * 0.45)}" fill="#92400e"/><circle r="${f1(r * 0.25)}" fill="#78350f"/></g>`;
    return `${sh(16)}<g class="room-sway"><path d="M-2 -20Q-6 -40 -6 -60M2 -20Q8 -34 10 -46" stroke="#4d9a3e" stroke-width="2.2" fill="none"/>${leaf(-4, -34, -60, 14, 6, '#5fae4a', '#3f8a32')}${leaf(4, -30, 55, 12, 5, '#6cbf55', '#3f8a32')}${flower(-6, -62, 11)}${flower(10, -47, 8)}</g>${pot('#3b82f6', '#1d4ed8', '#60a5fa')}<path d="M-9 -9h18" stroke="#fde68a" stroke-width="2" stroke-dasharray="3 3"/>`;
  })(),
  'r-plant-fir': `${sh(19)}<path d="M0 -74L16 -46H-16Z" fill="#2f7d52" stroke="#1f5c3b" stroke-width="1"/><path d="M0 -62L19 -32H-19Z" fill="#2f7d52" stroke="#1f5c3b" stroke-width="1"/><path d="M0 -50L21 -20H-21Z" fill="#358a5b" stroke="#1f5c3b" stroke-width="1"/><path d="M-16 -46Q-8 -50 0 -46Q8 -50 16 -46M-19 -32Q-10 -36 0 -32Q10 -36 19 -32M-21 -20Q-10 -24 0 -20Q10 -24 21 -20" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="-6" cy="-40" r="2.2" fill="#ef4444"/><circle cx="8" cy="-28" r="2.2" fill="#3b82f6"/><circle cx="-10" cy="-26" r="2.2" fill="#facc15"/><circle cx="5" cy="-52" r="2" fill="#a855f7"/><g class="room-twinkle"><circle cx="-2" cy="-58" r="1.2" fill="#fde68a"/><circle cx="12" cy="-38" r="1.2" fill="#fde68a"/></g><g class="room-twinkle" style="animation-delay:-1s"><circle cx="-12" cy="-36" r="1.2" fill="#fde68a"/><circle cx="2" cy="-30" r="1.2" fill="#fde68a"/><circle cx="14" cy="-24" r="1.2" fill="#fde68a"/></g><path d="M0 -82l2 4.4l4.8 .4l-3.6 3.2l1 4.6l-4.2 -2.4l-4.2 2.4l1 -4.6l-3.6 -3.2l4.8 -.4Z" fill="#facc15" stroke="#d4a10a" stroke-width=".7"/>${pot('#dc2626', '#991b1b', '#ef4444', 10, 14)}<rect x="-9" y="-10" width="18" height="2.4" fill="#facc15"/>`,
  'r-plant-coral': `${sh(19)}<g stroke-linecap="round" fill="none"><path d="M-4 -16V-36Q-4 -42 -10 -50M-4 -32Q2 -38 2 -48M-8 -44l-6 -2" stroke="#ff7f6e" stroke-width="3.6"/><path d="M6 -16V-30Q8 -38 14 -42M6 -26Q2 -32 4 -38" stroke="#f472b6" stroke-width="3"/><path d="M-12 -16Q-14 -26 -18 -30" stroke="#fb923c" stroke-width="3"/></g><g fill="#fde68a"><circle cx="-10" cy="-50" r="1.6"/><circle cx="2" cy="-48" r="1.6"/><circle cx="14" cy="-42" r="1.4"/><circle cx="-18" cy="-30" r="1.4"/></g><path d="M8 -16q2 -10 0 -16q4 6 2 16" fill="#34d399"/><g class="room-bubbles" fill="#e0f2fe"><circle cx="0" cy="-56" r="1.4"/><circle cx="3" cy="-62" r="1"/></g><path d="M-16 -18Q-18 -2 -9 0H9Q18 -2 16 -18Z" fill="#fde2e4" stroke="#f9a8b8" stroke-width="1"/><path d="M-12 -16Q-12 -4 -6 -1M-4 -17V-1M4 -17V-1M12 -16Q12 -4 6 -1" stroke="#f9a8b8" stroke-width=".9" fill="none"/><path d="M-17 -18H17" stroke="#f9a8b8" stroke-width="2.4" stroke-linecap="round"/><path d="M10 -6l1.4 2.6l2.8 .3l-2.1 1.8l.6 2.8l-2.7 -1.5l-2.7 1.5l.6 -2.8l-2.1 -1.8l2.8 -.3Z" fill="#fb923c"/>`,
  'r-plant-lollipop': (() => {
    const pop = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="#fff" stroke-width="1"/><path d="M${x} ${y}m-${f1(r * 0.6)} 0a${f1(r * 0.6)} ${f1(r * 0.6)} 0 1 1 ${f1(r * 0.6)} ${f1(r * 0.6)}a${f1(r * 0.35)} ${f1(r * 0.35)} 0 1 1 -${f1(r * 0.35)} -${f1(r * 0.35)}" stroke="#fff" stroke-width="1.2" fill="none"/>`;
    return `${sh(17)}<path d="M0 -20V-48M0 -40L-10 -54M0 -36L10 -50" stroke="#fde7ef" stroke-width="2.2" stroke-linecap="round"/><path d="M0 -20V-48M0 -40L-10 -54M0 -36L10 -50" stroke="#f9a8d4" stroke-width="1" stroke-linecap="round" stroke-dasharray="1.6 1.6"/>${pop(0, -56, 9, '#f472b6')}${pop(-12, -56, 6.5, '#38bdf8')}${pop(12, -50, 6.5, '#a3e635')}<path d="M12 -20V-34q0 -4 3.6 -4t3.6 4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M12 -22V-34q0 -4 3.6 -4t3.6 4" stroke="#ef4444" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-dasharray="2 2"/>${pot('#fbcfe8', '#ec4899', '#f9a8d4')}<path d="M-9 -12h18M-9.6 -6h19" stroke="#fff" stroke-width="2.4"/>`;
  })(),
  'r-plant-alien': `${sh(17)}${glow(0, -50, 24, '#67e8f9', 'room-pulse')}<g class="room-sway"><path d="M-2 -20Q-14 -34 -10 -50Q-8 -58 -14 -64M2 -20Q10 -30 8 -44Q6 -54 14 -60M0 -20V-58" stroke="#7c3aed" stroke-width="2.4" fill="none" stroke-linecap="round"/>${leaf(-6, -30, -70, 12, 4, '#a78bfa', '#7c3aed')}${leaf(6, -28, 70, 12, 4, '#a78bfa', '#7c3aed')}<g class="room-pulse"><circle cx="-14" cy="-65" r="4.4" fill="#67e8f9"/><circle cx="14" cy="-61" r="3.8" fill="#a3e635"/></g><circle cx="-15" cy="-66.4" r="1.4" fill="#fff" opacity=".8"/><circle cx="0" cy="-62" r="7" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1"/><circle class="room-look" cx="1" cy="-62" r="3.4" fill="#22c55e"/><circle cx="1" cy="-62" r="1.6" fill="#14532d"/><circle cx="-1.6" cy="-64" r="1" fill="#fff"/></g><path d="M-12 -18H12L9 0H-9Z" fill="#475569" stroke="#1e293b" stroke-width="1"/><rect x="-14" y="-22" width="28" height="5" rx="2" fill="#64748b" stroke="#1e293b" stroke-width="1"/><rect class="room-neon" x="-12" y="-11" width="22" height="2" rx="1" fill="#67e8f9"/>`,
  'r-plant-mushroom': `${sh(20)}${glow(0, -38, 26, '#a78bfa', 'room-pulse')}<path d="M-3 -18Q-4 -32 -2 -46M8 -18V-30M-12 -18V-26" stroke="#f5f0e6" stroke-width="4" stroke-linecap="round"/><path d="M-16 -46Q-14 -60 -2 -60Q10 -60 12 -46Q-2 -42 -16 -46Z" fill="#8b5cf6" stroke="#6d28d9" stroke-width="1"/><path d="M0 -30Q2 -40 10 -40Q18 -40 18 -30Q8 -27 0 -30Z" fill="#22d3ee" stroke="#0891b2" stroke-width="1"/><path d="M-20 -26Q-19 -33 -12 -33Q-5 -33 -5 -26Q-12 -24 -20 -26Z" fill="#f472b6" stroke="#db2777" stroke-width="1"/><g fill="#fff" opacity=".85"><circle cx="-8" cy="-54" r="1.8"/><circle cx="2" cy="-56" r="1.4"/><circle cx="6" cy="-50" r="1.2"/><circle cx="10" cy="-36" r="1.2"/><circle cx="14" cy="-34" r="1"/><circle cx="-14" cy="-30" r="1"/></g><g class="room-spores" fill="#e9d5ff"><circle cx="-6" cy="-64" r="1"/><circle cx="6" cy="-70" r=".8"/><circle cx="14" cy="-48" r=".9"/><circle cx="-14" cy="-56" r=".7"/></g><path d="M-18 -18Q-20 -2 -10 0H10Q20 -2 18 -18Z" fill="#8b5a33" stroke="#5c3a1e" stroke-width="1"/><path d="M-19 -18Q-10 -24 0 -19Q10 -24 19 -18Q10 -15 0 -16Q-10 -15 -19 -18Z" fill="#4caf6a"/><path d="M-12 -12q4 3 8 1M4 -8q4 2 8 0" stroke="#6b4122" stroke-width=".9" fill="none"/>`,
  'r-plant-golden': `${sh(19)}${glow(0, -48, 30, '#fde68a', 'room-pulse')}<path d="M-1 -20Q-3 -32 0 -42M0 -36L-8 -46M1 -32L9 -40" stroke="#a16207" stroke-width="3" stroke-linecap="round" fill="none"/><g stroke="#b8860b" stroke-width=".8"><circle cx="-10" cy="-50" r="9" fill="#eab308"/><circle cx="9" cy="-48" r="9" fill="#facc15"/><circle cx="0" cy="-60" r="11" fill="#fcd34d"/></g><path d="M-6 -66q4 -4 10 -2" stroke="#fff7cc" stroke-width="2" fill="none" stroke-linecap="round"/><g stroke="#fff" stroke-width=".5"><path d="M-12 -46l2 -2.6l2 2.6l-2 2.6Z" fill="#ef4444"/><path d="M6 -56l2 -2.6l2 2.6l-2 2.6Z" fill="#3b82f6"/><path d="M-4 -60l2 -2.6l2 2.6l-2 2.6Z" fill="#22c55e"/><path d="M10 -44l2 -2.6l2 2.6l-2 2.6Z" fill="#a855f7"/></g>${spark(-14, -62, 3)}${spark(14, -64, 2.6, '#fff3c4')}${spark(4, -42, 2.2)}${pot('#facc15', '#b8860b', '#fde047', 11, 16)}<circle cx="0" cy="-9" r="2.2" fill="#ef4444" stroke="#fff" stroke-width=".5"/><circle cx="-6" cy="-9" r="1.4" fill="#22d3ee"/><circle cx="6" cy="-9" r="1.4" fill="#22d3ee"/>`,
};

/* ------------------------------------------------------------------- лампы */

// LAMP_GLOW: [x, y, r, цвет] — свет лампы (поверх ночного затемнения комнаты).
const LAMP_GLOW = {
  'r-lamp-floor': [0, -78, 30, '#ffe7a3'],
  'r-lamp-lantern': [0, -52, 26, '#ffb37a'],
  'r-lamp-candle': [0, -36, 22, '#ffd27a'],
  'r-lamp-mushroom': [0, -26, 24, '#fca5a5'],
  'r-lamp-lava': [0, -52, 24, '#f9a8d4'],
  'r-lamp-neon': [0, -60, 30, '#f0abfc'],
  'r-lamp-moon': [0, -66, 30, '#fef3c7'],
  'r-lamp-jelly': [0, -60, 28, '#a5f3fc'],
  'r-lamp-candelabra': [0, -72, 38, '#ffd27a'],
};
const flame = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><g class="room-flame"><path d="M0 -7Q4 -2 2.6 1Q0 3 -2.6 1Q-4 -2 0 -7Z" fill="#fb923c"/><path d="M0 -4Q2 -1 1.2 .8Q0 1.8 -1.2 .8Q-2 -1 0 -4Z" fill="#fef08a"/></g></g>`;

const LAMP = {
  'r-lamp-floor': `${sh(12, -3)}<ellipse cx="0" cy="-1.6" rx="9" ry="2.4" fill="#475569"/><rect x="-1.2" y="-76" width="2.4" height="75" fill="#64748b"/><rect x="-.2" y="-76" width="1" height="74" fill="#cbd5e1" opacity=".6"/><path d="M-12 -72L-8 -92H8L12 -72Z" fill="#fdf2d0" stroke="#d9c08a" stroke-width="1"/><path d="M3 -92H8L12 -72H7Z" fill="#fff" opacity=".5"/><path d="M-12 -72H12" stroke="#e8c97a" stroke-width="1.6"/><ellipse cx="0" cy="-71" rx="8" ry="1.4" fill="#fff6c8"/>`,
  'r-lamp-lantern': `${sh(12, -3)}<path d="M-8 0L0 -6L8 0" stroke="#7a5a2a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M0 -6V-84Q0 -88 -6 -88H-8" stroke="#8a6a3a" stroke-width="2.2" fill="none"/><path d="M0 -20v-4M0 -40v-4M0 -60v-4" stroke="#6b4f22" stroke-width="2.6"/><path d="M-8 -88V-78" stroke="#475569" stroke-width=".8"/><g class="room-swing"><rect x="-12" y="-79" width="8" height="3" rx="1" fill="#1f2937"/><ellipse cx="-8" cy="-62" rx="12" ry="14" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/><path d="M-8 -76Q-16 -62 -8 -48M-8 -76Q0 -62 -8 -48M-8 -76V-48" stroke="#b91c1c" stroke-width=".8" fill="none"/><path d="M-3 -72Q2 -64 -1 -54" stroke="#fecaca" stroke-width="1.6" fill="none" opacity=".7"/><rect x="-12" y="-49" width="8" height="3" rx="1" fill="#1f2937"/><path d="M-9 -46v6M-7 -46v6" stroke="#facc15" stroke-width="1"/></g>`,
  'r-lamp-candle': `${sh(14, -3)}<g transform="translate(-3 0)"><rect x="-13" y="-24" width="9" height="24" rx="2" fill="#fef3c7" stroke="#e7d3a3" stroke-width=".8"/><rect x="-1" y="-34" width="9" height="34" rx="2" fill="#fffbeb" stroke="#e7d3a3" stroke-width=".8"/><rect x="9" y="-16" width="8" height="16" rx="2" fill="#fde68a" stroke="#e0c57a" stroke-width=".8"/><path d="M-11 -24q0 4 1.4 6M1 -34q0 5 1.6 7M11 -16q0 3 1.2 4" stroke="#fff" stroke-width="1.2" fill="none" opacity=".8"/><path d="M-8.5 -24v-2M3.5 -34v-2M13 -16v-2" stroke="#374151" stroke-width=".8"/>${flame(-8.5, -27)}${flame(3.5, -37, 1.1)}${flame(13, -19, 0.9)}<path d="M-16 -2h34" stroke="#94a3b8" stroke-width="2.4" stroke-linecap="round"/></g>`,
  'r-lamp-mushroom': `${sh(14, -3)}<path d="M-5 0Q-6 -12 -4 -22H4Q6 -12 5 0Z" fill="#fef3c7" stroke="#e0c57a" stroke-width="1"/><path d="M-16 -22Q-16 -40 0 -40Q16 -40 16 -22Q0 -18 -16 -22Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/><g fill="#fff"><circle cx="-8" cy="-30" r="2.6"/><circle cx="4" cy="-35" r="2"/><circle cx="9" cy="-26" r="2.2"/><circle cx="-2" cy="-25" r="1.4"/></g><path d="M6 -38q6 3 8 10" stroke="#fecaca" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M-14 -21.4Q0 -18 14 -21.4" stroke="#fde68a" stroke-width="1.6" fill="none" class="room-pulse"/>`,
  'r-lamp-lava': `${sh(14, -3)}<path d="M-10 0L-7 -24M10 0L7 -24" stroke="#8a5530" stroke-width="2.4" stroke-linecap="round"/><rect x="-11" y="-28" width="22" height="4" rx="1" fill="#b7794a" stroke="#8a5530" stroke-width=".8"/><path d="M-6 -28L-4 -34H4L6 -28Z" fill="#7c3aed"/><path d="M-4 -34L-6.6 -66H6.6L4 -34Z" fill="#fbcfe8" stroke="#c084fc" stroke-width=".8"/><g fill="#ec4899"><ellipse class="room-lava" cx="0" cy="-40" rx="3.2" ry="4"/><ellipse class="room-lava" cx="-1.4" cy="-54" rx="2.6" ry="3.4" style="animation-delay:-2s"/><ellipse class="room-lava" cx="1.6" cy="-62" rx="2" ry="2.4" style="animation-delay:-4s"/></g><path d="M3.4 -62L2.6 -38" stroke="#fff" stroke-width="1" opacity=".6"/><path d="M-6.6 -66L-4 -74H4L6.6 -66Z" fill="#7c3aed"/>`,
  'r-lamp-neon': `${sh(12, -3)}<rect x="-9" y="-4" width="18" height="4" rx="1.6" fill="#1f2937"/><g class="room-neon"><path d="M-4 -4V-70Q-4 -82 6 -84" stroke="#f0abfc" stroke-width="5" fill="none" stroke-linecap="round" opacity=".35"/><path d="M-4 -4V-70Q-4 -82 6 -84" stroke="#fdf4ff" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M-4 -40H4V-88" stroke="#67e8f9" stroke-width="5" fill="none" stroke-linecap="round" opacity=".3"/><path d="M4 -4V-88" stroke="#ecfeff" stroke-width="1.8" stroke-linecap="round"/><circle cx="4" cy="-90" r="3" fill="#ecfeff"/></g>`,
  'r-lamp-moon': `${sh(13, -3)}<path d="M-9 0L0 -40L9 0M0 -40V0" stroke="#7a5a2a" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M0 -40V-50" stroke="#94a3b8" stroke-width="2"/><circle cx="0" cy="-64" r="15" fill="#fef3c7" stroke="#e7d3a3" stroke-width="1"/><g fill="#eedfae"><circle cx="-6" cy="-68" r="3.4"/><circle cx="5" cy="-58" r="2.6"/><circle cx="4" cy="-72" r="1.8"/><circle cx="-4" cy="-56" r="1.4"/></g><path d="M6 -76q6 4 7 12" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>${spark(-14, -84, 2.4, '#fef3c7', 'room-twinkle')}`,
  'r-lamp-jelly': `${sh(13, -3)}<rect x="-11" y="-6" width="22" height="6" rx="2" fill="#334155"/><rect x="-10" y="-84" width="20" height="78" rx="4" fill="#bae6fd" opacity=".3" stroke="#7dd3fc" stroke-width="1"/><g class="room-bubbles" fill="#e0f2fe"><circle cx="-5" cy="-20" r="1"/><circle cx="4" cy="-34" r=".8"/></g><g class="room-float"><path d="M-8 -58Q-8 -72 0 -72Q8 -72 8 -58Q4 -56 0 -58Q-4 -56 -8 -58Z" fill="#f9a8d4" stroke="#ec4899" stroke-width=".8"/><path d="M-4 -66q3 -3 7 -1" stroke="#fff" stroke-width="1.2" fill="none" opacity=".8"/><g class="room-tentacle" stroke="#f9a8d4" stroke-width="1.2" fill="none" stroke-linecap="round"><path d="M-5 -57q-2 6 1 12t-1 10"/><path d="M0 -57q2 7 -1 13t1 8"/><path d="M5 -57q2 6 -1 12t1 9"/></g></g><rect x="-11" y="-88" width="22" height="5" rx="2" fill="#334155"/><path d="M5 -82V-12" stroke="#fff" stroke-width="1.2" opacity=".5"/>`,
  'r-lamp-candelabra': `${sh(14, -3)}<path d="M-10 0Q0 -6 10 0Z" fill="#d4a531" stroke="#a8741a" stroke-width=".8"/><path d="M0 -4V-56" stroke="#d4a531" stroke-width="3"/><circle cx="0" cy="-30" r="3" fill="#e9b73f"/><path d="M0 -50Q-10 -50 -10 -62M0 -50Q10 -50 10 -62M0 -44Q-19 -44 -19 -58M0 -44Q19 -44 19 -58" stroke="#d4a531" stroke-width="2.2" fill="none"/>${[-19, -10, 0, 10, 19].map((x) => {
    const top = x === 0 ? -72 : Math.abs(x) === 10 ? -70 : -66;
    return `<rect x="${x - 3}" y="${top + 6}" width="6" height="2" rx="1" fill="#e9b73f"/><rect x="${x - 1.8}" y="${top}" width="3.6" height="6" fill="#fffbeb"/>${flame(x, top - 1, 0.9)}`;
  }).join('')}<path d="M0 -56V-66" stroke="#d4a531" stroke-width="3"/>${spark(18, -82, 3)}${spark(-20, -76, 2.4, '#fff3c4')}`,
};

/* ------------------------------------------------------------------ ковры */

// Ковры нарисованы «сверху» в прямоугольнике примерно 160×70 с центром в (0, 0).
const RUG = {
  'r-rug-round': `<ellipse rx="76" ry="34" fill="#d9c09a"/><ellipse rx="72" ry="31" fill="#f1e2c8"/><ellipse rx="58" ry="24" fill="none" stroke="#d9c09a" stroke-width="3" stroke-dasharray="6 4"/><ellipse rx="42" ry="17" fill="#e6cfa8"/><ellipse rx="26" ry="10" fill="#f1e2c8"/><ellipse rx="10" ry="4" fill="#d9a873"/>`,
  'r-rug-stripes': `<path d="${Array.from({ length: 13 }, (_, i) => `M${-74 + i * 12} -32v64M${-74 + i * 12 + 2} -32v64`).join('')}" stroke="#e7d3b6" stroke-width="1.2"/><rect x="-70" y="-30" width="140" height="60" rx="3" fill="#fef3e2"/>${['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c'].map((c, i) => `<rect x="${-64 + i * 18.6}" y="-30" width="11" height="60" fill="${c}" opacity=".85"/>`).join('')}<rect x="-70" y="-30" width="140" height="60" rx="3" fill="none" stroke="#e7cfa6" stroke-width="2"/>`,
  'r-rug-heart': `<path d="M0 34C-30 18 -82 4 -82 -16C-82 -36 -50 -42 -26 -30C-14 -24 -6 -20 0 -14C6 -20 14 -24 26 -30C50 -42 82 -36 82 -16C82 4 30 18 0 34Z" fill="#f472b6" stroke="#db2777" stroke-width="2"/><path d="M0 24C-24 12 -66 2 -66 -14C-66 -28 -42 -32 -24 -24C-12 -18 -6 -14 0 -8C6 -14 12 -18 24 -24C42 -32 66 -28 66 -14C66 2 24 12 0 24Z" fill="#f9a8d4"/><path d="M40 -26Q58 -26 62 -16" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`,
  'r-rug-leaf': `<path d="M-84 0Q-40 -44 44 -30Q78 -20 86 0Q78 20 44 30Q-40 44 -84 0Z" fill="#6bbf59" stroke="#3f8f3a" stroke-width="2"/><path d="M-80 0H80M-50 0L-30 -22M-50 0L-30 22M-16 0L6 -26M-16 0L6 26M20 0L40 -24M20 0L40 24M50 0L64 -16M50 0L64 16" stroke="#9ad888" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M-84 0Q-40 -44 44 -30" stroke="#a6e394" stroke-width="2" fill="none" opacity=".7"/>`,
  'r-rug-wave': `<ellipse rx="78" ry="32" fill="#2b8fc4" stroke="#1d6f9c" stroke-width="2"/><ellipse rx="70" ry="27" fill="#3aa5d8"/><path d="M-62 -10q8 -6 16 0t16 0t16 0t16 0t16 0t16 0t16 0M-66 4q8 -6 16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0M-52 16q8 -6 16 0t16 0t16 0t16 0t16 0t16 0" stroke="#bfe8fb" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M-10 -24a6 6 0 0 1 12 0Z" fill="#fde2e4" stroke="#f9a8b8" stroke-width="1"/><circle cx="40" cy="-16" r="3" fill="#fff"/><circle cx="46" cy="-20" r="2" fill="#fff"/>`,
  'r-rug-snow': `<g fill="#f8fbff" stroke="#c9dbf0" stroke-width="1.4">${Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    return `<circle cx="${f1(Math.cos(a) * 70)}" cy="${f1(Math.sin(a) * 28)}" r="9"/>`;
  }).join('')}</g><ellipse rx="72" ry="29" fill="#f8fbff"/><g stroke="#93c5fd" stroke-width="2.4" stroke-linecap="round"><path d="M0 -20V20M-34 -10L34 10M-34 10L34 -10"/><path d="M-6 -16l6 4l6 -4M-6 16l6 -4l6 4M-28 -12l2 6l-8 2M28 12l-2 -6l8 -2M-28 12l2 -6l-8 -2M28 -12l-2 6l8 2" fill="none"/></g><circle r="4" fill="#bfdbfe"/>`,
  'r-rug-neon': `<rect x="-74" y="-30" width="148" height="60" rx="10" fill="#1b1538"/><g class="room-neon"><rect x="-66" y="-23" width="132" height="46" rx="7" fill="none" stroke="#e879f9" stroke-width="5" opacity=".3"/><rect x="-66" y="-23" width="132" height="46" rx="7" fill="none" stroke="#f5b8ff" stroke-width="1.6"/></g><g fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M-40 -8l8 14h-16Z" stroke="#22d3ee"/><circle cx="-12" cy="0" r="7" stroke="#a3e635"/><path d="M12 -7l12 14M24 -7l-12 14" stroke="#f472b6"/><rect x="38" y="-7" width="13" height="13" stroke="#facc15"/></g>`,
  'r-rug-galaxy': `<ellipse rx="78" ry="33" fill="#1e1650" stroke="#3b2f80" stroke-width="2"/><path d="M0 0C20 -4 30 -18 10 -24C-20 -30 -56 -10 -50 10C-44 26 0 30 34 18C56 10 62 -8 50 -16" stroke="#6d4fd8" stroke-width="7" fill="none" opacity=".55" stroke-linecap="round"/><path d="M0 0C-14 6 -10 14 6 12C26 8 30 -6 18 -12" stroke="#c4b5fd" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/><circle r="5" fill="#fde68a"/><circle r="9" fill="#fde68a" opacity=".25"/>${stars(61, 22, 140, 52, -70, -26)}`,
  'r-rug-royal': `<path d="${Array.from({ length: 15 }, (_, i) => `M${-70 + i * 10} -34v-4M${-70 + i * 10} 34v4`).join('')}" stroke="#e2b545" stroke-width="1.6"/><rect x="-76" y="-34" width="152" height="68" rx="3" fill="#9f1239"/><rect x="-70" y="-28" width="140" height="56" fill="none" stroke="#e2b545" stroke-width="3"/><rect x="-62" y="-21" width="124" height="42" fill="#7f0f2e" stroke="#1e3a8a" stroke-width="3"/><path d="M0 -18L30 0L0 18L-30 0Z" fill="#1e3a8a" stroke="#e2b545" stroke-width="2"/><path d="M0 -10L16 0L0 10L-16 0Z" fill="#e2b545"/><circle r="3.4" fill="#9f1239"/><g fill="#e2b545"><path d="M-62 -21l10 0l-10 8ZM62 -21l-10 0l10 8ZM-62 21l10 0l-10 -8ZM62 21l-10 0l10 -8Z"/><circle cx="-46" cy="0" r="3"/><circle cx="46" cy="0" r="3"/></g><path class="room-shimmer" d="M-60 -30h10l-20 60h-10Z" fill="#fff6c8" fill-opacity=".2"/>`,
};

/* ----------------------------------------------------------- картины на стене */

const frame = (w, h, c, d, inner) =>
  `<rect x="${f1(-w / 2 - 1.5)}" y="${f1(-h / 2 + 1.5)}" width="${w}" height="${h}" rx="1.5" fill="#1d1238" opacity=".14"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="1.5" fill="${c}" stroke="${d}" stroke-width="1"/><svg x="${-w / 2 + 1}" y="${-h / 2 + 1}" width="${w - 2}" height="${h - 2}" viewBox="${-w / 2 + 1} ${-h / 2 + 1} ${w - 2} ${h - 2}" overflow="hidden">${inner}</svg>`;
const POSTER = {
  'r-poster-cat': `<path d="M0 -24L-12 -17M0 -24L12 -17" stroke="#8a5530" stroke-width=".8"/><circle cx="0" cy="-24" r="1.4" fill="#94a3b8"/>${frame(30, 34, '#c98b5a', '#8a5530', `<rect x="-12" y="-14" width="24" height="28" fill="#fdf2e0"/><rect x="-10" y="-12" width="20" height="24" fill="#bfe3f8"/><path d="M-10 6Q0 2 10 6V12H-10Z" fill="#9fd08a"/><path d="M-7 2L-7 -9L-3 -5H3L7 -9L7 2Q7 9 0 9Q-7 9 -7 2Z" fill="#fb923c" stroke="#c2410c" stroke-width=".7"/><path d="M-6 -7.4L-4.4 -5.6M6 -7.4L4.4 -5.6" stroke="#fdba74" stroke-width="1"/><ellipse cx="-3" cy="0" rx="1.3" ry="1.8" fill="#1e1b3a"/><ellipse cx="3" cy="0" rx="1.3" ry="1.8" fill="#1e1b3a"/><path d="M-1 3h2l-1 1Z" fill="#f472b6"/><path d="M-1 4.6q-1 1 -2 0M1 4.6q1 1 2 0M-9 2.6h4M-9 4.4l4 -.6M9 2.6h-4M9 4.4l-4 -.6" stroke="#7c2d12" stroke-width=".5" fill="none"/>`)}`,
  'r-poster-board': `${frame(50, 34, '#a0673a', '#6f3f1e', `<rect x="-22" y="-14" width="44" height="28" fill="#2f5d4a"/><rect x="-22" y="-14" width="44" height="28" fill="#fff" opacity=".04"/><g stroke="#f1f5f9" stroke-width="1" fill="none" stroke-linecap="round" opacity=".9"><path d="M-18 6L-8 6L-18 -6Z"/><path d="M-17 -10q2 -2 4 0t4 0M-7 -10h3M-5.5 -11.5v3"/><path d="M-2 8Q4 -16 10 8" stroke="#fde68a"/><path d="M-3 8H18M4 -8V10" opacity=".6"/><circle cx="15" cy="-6" r="3"/><path d="M12 -10l6 0"/></g><rect x="-22" y="14" width="44" height="3" fill="#8a5530"/><rect x="8" y="12.6" width="6" height="1.6" rx=".6" fill="#fff"/><rect x="-14" y="12.6" width="5" height="1.6" rx=".6" fill="#fde68a"/>`)}`,
  'r-poster-mountain': `${frame(42, 30, '#e2b545', '#a8741a', `<rect x="-18" y="-12" width="36" height="24" fill="#fff4d6"/><rect x="-16" y="-10" width="32" height="20" fill="#bfe3f8"/><circle cx="9" cy="-5" r="3" fill="#fde68a"/><path d="M-16 6L-6 -6L2 2L8 -3L16 5V10H-16Z" fill="#7aa6c2"/><path d="M-6 -6L-8.4 -3L-6 -3.6L-4 -2Z" fill="#fff"/><rect x="-16" y="5" width="32" height="5" fill="#5fae62"/><path d="M-12 8h8M2 8h10" stroke="#93c5fd" stroke-width="1"/>`)}`,
  'r-poster-map': `<rect x="-23" y="-14" width="46" height="30" fill="#1d1238" opacity=".12"/><path d="M-22 -16H22V14H-22Z" fill="#f5e6c4" stroke="#c8a46a" stroke-width="1"/><path d="M-22 -16h44v3h-44ZM-22 11h44v3h-44Z" fill="#d6b88a"/><path d="M-18 -10Q-12 -12 -8 -8Q-6 -2 -10 2Q-14 4 -16 0Q-20 -4 -18 -10ZM-4 -10Q2 -12 6 -10Q8 -6 4 -4Q2 0 6 4Q4 8 0 6Q-4 2 -2 -2Q-6 -6 -4 -10ZM10 -8Q16 -12 20 -6Q18 0 14 -2Q10 -2 10 -8ZM12 4Q16 2 18 6Q16 9 12 8Z" fill="#9ccf7f" stroke="#6ea55a" stroke-width=".6"/><path d="M-12 -2Q-4 6 4 -4T16 -4" stroke="#ef4444" stroke-width=".9" stroke-dasharray="1.6 1.4" fill="none"/><circle cx="16" cy="-4" r="1.6" fill="#ef4444"/><circle cx="-12" cy="-2" r="1.4" fill="#3b82f6"/><g transform="translate(-16 8)"><circle r="3" fill="none" stroke="#8a6a3a" stroke-width=".6"/><path d="M0 -3.6L.8 0L0 3.6L-.8 0Z" fill="#8a6a3a"/></g>`,
  'r-poster-pixel': (() => {
    const px = ['..XX.XX..', '.XHXXXXX.', '.XXXXXXX.', '..XXXXX..', '...XXX...', '....X....'];
    let d = '', h = '';
    px.forEach((row, y) => [...row].forEach((c, x) => {
      if (c === 'X') d += `M${-13.5 + x * 3} ${-8 + y * 3}h3v3h-3Z`;
      if (c === 'H') h += `M${-13.5 + x * 3} ${-8 + y * 3}h3v3h-3Z`;
    }));
    return frame(36, 32, '#1e1b4b', '#0f0b2e', `<rect x="-15" y="-13" width="30" height="26" fill="#312e81"/><path d="${d}" fill="#ef4444"/><path d="${h}" fill="#fff"/><g class="room-blink"><path d="M-12 -12h2v2h-2ZM10 8h2v2h-2Z" fill="#facc15"/></g><path d="M8 -11h2v2h-2ZM-12 7h2v2h-2Z" fill="#67e8f9"/>`);
  })(),
  'r-poster-dream': `<g class="room-swing"><path d="M0 -24V-18" stroke="#8a6a3a" stroke-width=".8"/><circle cx="0" cy="-6" r="12" fill="none" stroke="#b07d44" stroke-width="2.4"/><circle cx="0" cy="-6" r="12" fill="none" stroke="#e8c08f" stroke-width=".8" stroke-dasharray="2 2"/><path d="M0 -18L8 -1L-11 -10L11 -10L-8 -1Z" stroke="#f5e6c4" stroke-width=".6" fill="none"/><circle cx="0" cy="-6" r="2" fill="#38bdf8"/><path d="M-8 3V12M0 6V18M8 3V12" stroke="#8a6a3a" stroke-width=".6"/><circle cx="-8" cy="8" r="1.2" fill="#f472b6"/><circle cx="0" cy="11" r="1.2" fill="#facc15"/><circle cx="8" cy="8" r="1.2" fill="#34d399"/>${leaf(-8, 20, 180, 9, 2.6, '#fff', '#cbd5e1')}${leaf(0, 26, 180, 10, 2.8, '#c4b5fd', '#8b5cf6')}${leaf(8, 20, 180, 9, 2.6, '#fff', '#cbd5e1')}</g>`,
  'r-poster-ocean': `<circle cx="-1.5" cy="1.5" r="19" fill="#1d1238" opacity=".14"/><circle r="19" fill="#d4a531" stroke="#a8741a" stroke-width="1"/><circle r="15" fill="#3aa5d8"/><path d="M-15 -4H15" stroke="#7cc8ef" stroke-width="1"/><rect x="-15" y="-15" width="30" height="11" fill="#a8dcff"/><circle cx="8" cy="-10" r="2.6" fill="#ffe27a"/><path d="M-11 4Q-6 -2 2 1Q8 3 8 6Q2 10 -6 8L-10 10L-9 6Z" fill="#1e3a8a"/><circle cx="-1" cy="3" r=".9" fill="#fff"/><path d="M-4 0q-1 -4 1 -6M-4 0q-3 -3 -6 -3" stroke="#bfe8fb" stroke-width=".9" fill="none"/><path d="M6 10l3 -2l0 4Z M9 10a2.6 1.6 0 1 1 0.1 0" fill="#fb923c"/><circle cx="-8" cy="-2" r=".9" fill="#fff"/><circle cx="12" cy="4" r=".8" fill="#fff"/><g fill="#a8741a"><circle cx="0" cy="-17" r="1"/><circle cx="0" cy="17" r="1"/><circle cx="-17" cy="0" r="1"/><circle cx="17" cy="0" r="1"/></g>`,
  'r-poster-planets': `${frame(34, 44, '#0f0b2e', '#3b2f80', `<rect x="-15" y="-20" width="30" height="40" fill="#1a1446"/>${stars(71, 10, 28, 38, -14, -19)}<circle cx="-15" cy="-20" r="9" fill="#fbbf24"/><g fill="none" stroke="#6d5fd8" stroke-width=".5"><circle cx="-15" cy="-20" r="15"/><circle cx="-15" cy="-20" r="24"/><circle cx="-15" cy="-20" r="34"/></g><circle cx="-3" cy="-11" r="2.2" fill="#60a5fa"/><circle cx="4" cy="1" r="3" fill="#f87171"/><circle cx="8" cy="14" r="4" fill="#f4a259"/><path d="M2 15.6L14 12" stroke="#ffd8a8" stroke-width="1"/><circle cx="-12" cy="10" r="1.6" fill="#a3e635"/>`)}`,
  'r-poster-arcade': `${frame(46, 32, '#1b1538', '#0e0a24', `<circle cx="-20" cy="-13" r=".9" fill="#64748b"/><circle cx="20" cy="-13" r=".9" fill="#64748b"/><circle cx="-20" cy="13" r=".9" fill="#64748b"/><circle cx="20" cy="13" r=".9" fill="#64748b"/><g class="room-flicker"><path d="M-12 -7H12Q18 -7 18 0Q18 8 12 8Q8 8 6 4H-6Q-8 8 -12 8Q-18 8 -18 0Q-18 -7 -12 -7Z" fill="none" stroke="#f0abfc" stroke-width="4" opacity=".3"/><path d="M-12 -7H12Q18 -7 18 0Q18 8 12 8Q8 8 6 4H-6Q-8 8 -12 8Q-18 8 -18 0Q-18 -7 -12 -7Z" fill="none" stroke="#fdf4ff" stroke-width="1.2"/><path d="M-12 -2v5M-14.5 .5h5" stroke="#67e8f9" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="-1" r="1.4" fill="#a3e635"/><circle cx="13" cy="2" r="1.4" fill="#f472b6"/></g>`)}`,
  'r-poster-portrait': `${glow(0, 0, 30, '#fde68a', 'room-pulse')}<rect x="-21.5" y="-23.5" width="40" height="48" rx="3" fill="#1d1238" opacity=".16"/><rect x="-20" y="-25" width="40" height="48" rx="3" fill="#e0a82e" stroke="#a8741a" stroke-width="1.2"/><rect x="-16" y="-21" width="32" height="40" rx="2" fill="#f5cf5c" stroke="#a8741a" stroke-width=".8"/><rect x="-13" y="-18" width="26" height="34" rx="1" fill="#3b0d1e"/><g fill="#f5cf5c" stroke="#a8741a" stroke-width=".6"><circle cx="-20" cy="-25" r="3"/><circle cx="20" cy="-25" r="3"/><circle cx="-20" cy="23" r="3"/><circle cx="20" cy="23" r="3"/></g><path d="M-10 16a10 10 0 0 1 20 0" fill="#7f1d3a"/><circle cx="0" cy="2" r="9" fill="#8b6cf6" stroke="#5b3fd0" stroke-width=".8"/><circle cx="3" cy="-1" r="3" fill="#c4b5fd" opacity=".6"/><ellipse cx="-3" cy="2" rx="1.4" ry="2" fill="#1e1b3a"/><ellipse cx="3" cy="2" rx="1.4" ry="2" fill="#1e1b3a"/><path d="M-2 6q2 1.6 4 0" stroke="#1e1b3a" stroke-width=".8" fill="none"/><path d="M-6 -6L-7 -13L-3 -9L0 -14L3 -9L7 -13L6 -6Z" fill="#facc15" stroke="#b8860b" stroke-width=".5"/><rect x="-6" y="18.6" width="12" height="3" rx=".6" fill="#a8741a"/>${spark(15, -18, 3)}${spark(-15, 12, 2.4, '#fff3c4')}`,
};

/* ------------------------------------------------------------------ игрушки */

const TOY = {
  'r-toy-ball': `${sh(12, -3)}<circle cx="0" cy="-13" r="13" fill="#ef4444"/><path d="M0 -26A13 13 0 0 1 0 0Q8 -13 0 -26Z" fill="#3b82f6"/><path d="M0 -26Q-8 -13 0 0Q8 -13 0 -26Z" fill="#facc15"/><path d="M0 -26Q-3 -13 0 0Q3 -13 0 -26Z" fill="#fff"/><circle cx="0" cy="-13" r="13" fill="none" stroke="#9f1d2b" stroke-width=".9" stroke-opacity=".6"/><ellipse cx="0" cy="-25.4" rx="2.6" ry="1.4" fill="#f1f5f9"/><path d="M5 -22q4 2 5 7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/><path d="M-11 -8q3 5 8 7" stroke="#7f1d1d" stroke-width="2" fill="none" stroke-linecap="round" opacity=".2"/>`,
  'r-toy-teddy': `${sh(16, -3)}<ellipse cx="-9" cy="-4" rx="6" ry="4.4" fill="#c27b45" stroke="#8f5228" stroke-width="1"/><ellipse cx="9" cy="-4" rx="6" ry="4.4" fill="#c98650" stroke="#8f5228" stroke-width="1"/><ellipse cx="-9" cy="-4" rx="3" ry="2.2" fill="#f2c89c"/><ellipse cx="9" cy="-4" rx="3" ry="2.2" fill="#f2c89c"/><ellipse cx="0" cy="-16" rx="12" ry="13" fill="#c98650" stroke="#8f5228" stroke-width="1"/><ellipse cx="0" cy="-14" rx="7" ry="8" fill="#e8b68a"/><ellipse cx="-10" cy="-19" rx="4" ry="7.4" fill="#c27b45" stroke="#8f5228" stroke-width="1" transform="rotate(30 -10 -19)"/><ellipse cx="10" cy="-19" rx="4" ry="7.4" fill="#cf8f5a" stroke="#8f5228" stroke-width="1" transform="rotate(-30 10 -19)"/><circle cx="-8" cy="-45" r="4.4" fill="#c27b45" stroke="#8f5228" stroke-width="1"/><circle cx="8" cy="-45" r="4.4" fill="#c98650" stroke="#8f5228" stroke-width="1"/><circle cx="-8" cy="-45" r="2" fill="#e8b68a"/><circle cx="8" cy="-45" r="2" fill="#e8b68a"/><circle cx="0" cy="-37" r="10.5" fill="#cf8f5a" stroke="#8f5228" stroke-width="1"/><ellipse cx="0" cy="-33.6" rx="5" ry="3.8" fill="#f2c89c"/><circle cx="-4" cy="-39" r="1.3" fill="#2b1608"/><circle cx="4" cy="-39" r="1.3" fill="#2b1608"/><ellipse cx="0" cy="-35" rx="1.8" ry="1.2" fill="#2b1608"/><path d="M-1.6 -32.6q1.6 1.2 3.2 0" stroke="#2b1608" stroke-width=".7" fill="none"/><path d="M0 -26L-6 -29V-23ZM0 -26L6 -29V-23Z" fill="#ef4444"/><circle cx="0" cy="-26" r="1.6" fill="#b91c1c"/><path d="M4 -45q4 -2 6 2" stroke="#e8b68a" stroke-width="1.2" fill="none"/>`,
  'r-toy-globe': `${sh(13, -3)}<ellipse cx="0" cy="-2" rx="9" ry="2.6" fill="#8a5530"/><rect x="-1.6" y="-10" width="3.2" height="8" fill="#a0673a"/><circle cx="0" cy="-28" r="15" fill="#3b9ede" stroke="#1d6f9c" stroke-width="1"/><path d="M-10 -36Q-4 -40 0 -36Q2 -30 -4 -28Q-8 -24 -12 -28Q-14 -32 -10 -36ZM4 -40Q10 -40 12 -34Q10 -30 6 -32Q2 -34 4 -40ZM2 -24Q8 -26 10 -20Q8 -16 4 -17Q0 -20 2 -24Z" fill="#7cc47a" stroke="#4f9a52" stroke-width=".5"/><path d="M5 -40q6 3 7 10" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/><path d="M-13 -40A18 18 0 0 0 10 -12" stroke="#d4a531" stroke-width="2" fill="none"/><path d="M-1.6 -10h3.2" stroke="#d4a531" stroke-width="2"/>`,
  'r-toy-guitar': `${sh(14, -3)}<g transform="rotate(-14 0 0)"><rect x="-1.8" y="-56" width="3.6" height="32" fill="#7c4a1e"/><path d="M-3 -62h6v7h-6Z" fill="#5a3412"/><g fill="#e2e8f0"><circle cx="-4" cy="-60" r=".9"/><circle cx="-4" cy="-57" r=".9"/><circle cx="4" cy="-60" r=".9"/><circle cx="4" cy="-57" r=".9"/></g><path d="M0 -26Q-11 -28 -10 -18Q-14 -12 -12 -6Q-8 1 0 1Q8 1 12 -6Q14 -12 10 -18Q11 -28 0 -26Z" fill="#e0913f" stroke="#a35a1c" stroke-width="1"/><path d="M0 -24Q-7 -24 -7 -18Q-10 -12 -8 -7Q-5 -2 0 -2" stroke="#f5b46c" stroke-width="1.4" fill="none" opacity=".6"/><circle cx="0" cy="-14" r="3.6" fill="#3b2410"/><rect x="-4" y="-6" width="8" height="2" fill="#3b2410"/><path d="M-1 -56V-5M1 -56V-5" stroke="#f1f5f9" stroke-width=".35"/><path d="M-1.8 -50h3.6M-1.8 -44h3.6M-1.8 -38h3.6M-1.8 -32h3.6" stroke="#d4a531" stroke-width=".5"/></g>`,
  'r-toy-snowman': `${sh(14, -3)}<circle cx="0" cy="-11" r="12" fill="#f8fbff" stroke="#bcd0ea" stroke-width="1"/><circle cx="0" cy="-29" r="8.5" fill="#f8fbff" stroke="#bcd0ea" stroke-width="1"/><circle cx="0" cy="-43" r="6.5" fill="#f8fbff" stroke="#bcd0ea" stroke-width="1"/><path d="M-10 -6Q-4 0 6 -2" stroke="#dbe6f4" stroke-width="2" fill="none"/><path d="M-6.4 -36H6.4V-38H4.6V-49H-4.6V-38H-6.4Z" fill="#1f2937"/><rect x="-4.6" y="-41" width="9.2" height="2" fill="#ef4444"/><circle cx="-2.2" cy="-44" r=".9" fill="#1f2937"/><circle cx="2.2" cy="-44" r=".9" fill="#1f2937"/><path d="M0 -42.6L6 -41.4L0 -40.6Z" fill="#fb923c"/><path d="M-7 -35Q0 -31 7 -35L7 -32Q0 -28 -7 -32Z" fill="#ef4444"/><path d="M4 -33l2 9l3 -1l-2 -8" fill="#dc2626"/><g fill="#1f2937"><circle cx="0" cy="-30" r=".9"/><circle cx="0" cy="-26" r=".9"/><circle cx="0" cy="-14" r=".9"/></g><path d="M-8 -30L-17 -36M-14 -34l-2 -4M8 -30L16 -38M14 -36l3 -1" stroke="#7c4a1e" stroke-width="1.2" stroke-linecap="round"/>`,
  'r-toy-telescope': `${sh(16, -3)}<path d="M0 -22L-12 0M0 -22L12 0M0 -22L2 0" stroke="#7c4a1e" stroke-width="2" stroke-linecap="round"/><circle cx="0" cy="-23" r="2.6" fill="#475569"/><g transform="rotate(-34 0 -24)"><rect x="-16" y="-28" width="34" height="8" rx="2" fill="#1e3a8a" stroke="#172554" stroke-width="1"/><rect x="18" y="-29.4" width="6" height="10.8" rx="1.4" fill="#d4a531" stroke="#a8741a" stroke-width=".8"/><rect x="-22" y="-26.6" width="7" height="5.2" rx="1" fill="#d4a531" stroke="#a8741a" stroke-width=".8"/><rect x="2" y="-28.6" width="2" height="9.2" fill="#d4a531"/><path d="M-12 -26.4H14" stroke="#60a5fa" stroke-width="1" opacity=".6"/><ellipse cx="24.4" cy="-24" rx="1" ry="4.4" fill="#bae6fd"/></g>${spark(20, -52, 2.4, '#fde68a', 'room-twinkle')}`,
  'r-toy-gifts': `${sh(19, -3)}<rect x="-20" y="-18" width="22" height="18" rx="1.4" fill="#f472b6" stroke="#db2777" stroke-width="1"/><rect x="-10.6" y="-18" width="3.4" height="18" fill="#fde68a"/><rect x="2" y="-14" width="17" height="14" rx="1.4" fill="#38bdf8" stroke="#0284c7" stroke-width="1"/><rect x="2" y="-8.6" width="17" height="3" fill="#fff"/><rect x="-14" y="-32" width="18" height="14" rx="1.4" fill="#a3e635" stroke="#65a30d" stroke-width="1"/><rect x="-6.6" y="-32" width="3.2" height="14" fill="#ef4444"/><path d="M-5 -32Q-12 -40 -10 -32Q-12 -26 -5 -32Q2 -40 0 -32Q2 -26 -5 -32Z" fill="#ef4444" stroke="#b91c1c" stroke-width=".7"/><path d="M10.5 -14q-6 -6 -4 -1q-2 4 4 1q6 -6 4 -1q2 4 -4 1" fill="#fff" stroke="#cbd5e1" stroke-width=".6"/><path d="M-16 -16v12M4 -12v10" stroke="#fff" stroke-width="1.2" opacity=".35"/>${spark(14, -26, 2.4, '#fde68a', 'room-twinkle')}`,
  'r-toy-aquarium': `${sh(26, -3)}<rect x="-24" y="-12" width="48" height="12" rx="1.4" fill="#8a5530" stroke="#5c3a1e" stroke-width="1"/><path d="M-20 -12V0M20 -12V0" stroke="#5c3a1e" stroke-width="1"/><rect x="-25" y="-46" width="50" height="34" rx="2" fill="#7dd3fc" opacity=".55" stroke="#38bdf8" stroke-width="1.2"/><rect x="-24" y="-40" width="48" height="27" fill="#38bdf8" opacity=".35"/><path d="M-24 -16Q-12 -20 0 -16T24 -17V-13H-24Z" fill="#fde68a"/><path d="M-16 -16Q-20 -24 -16 -32M-14 -16Q-10 -24 -13 -30" stroke="#22c55e" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M14 -16Q12 -22 15 -27M17 -16Q19 -21 17 -25" stroke="#16a34a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M4 -14a3 2.4 0 0 1 6 0Z" fill="#94a3b8"/><g class="room-fish"><path d="M-4 -30Q0 -34 5 -30Q0 -26 -4 -30ZM-4 -30L-8 -33V-27Z" fill="#fb923c"/><circle cx="2.6" cy="-30.6" r=".6" fill="#1e1b3a"/></g><g class="room-fish is-slow"><path d="M6 -22Q10 -25 14 -22Q10 -19 6 -22ZM6 -22L3 -24.4V-19.6Z" fill="#facc15"/><circle cx="12" cy="-22.4" r=".5" fill="#1e1b3a"/></g><g class="room-bubbles" fill="#fff"><circle cx="12" cy="-36" r="1"/><circle cx="14" cy="-40" r=".7"/></g><rect x="-26" y="-48" width="52" height="3" rx="1" fill="#334155"/><path d="M-20 -44V-16" stroke="#fff" stroke-width="1.4" opacity=".4"/>`,
  'r-toy-robot': `${sh(15, -3)}<rect x="-12" y="-6" width="10" height="6" rx="2.4" fill="#475569"/><rect x="2" y="-6" width="10" height="6" rx="2.4" fill="#475569"/><rect x="-11" y="-28" width="22" height="22" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="1"/><rect x="-6" y="-22" width="12" height="9" rx="2" fill="#94a3b8"/><circle class="room-blink" cx="-2.6" cy="-17.4" r="1.4" fill="#ef4444"/><circle class="room-blink" cx="2.6" cy="-17.4" r="1.4" fill="#22c55e" style="animation-delay:-.7s"/><path d="M-11 -24Q-18 -22 -18 -14M11 -24Q18 -22 18 -16" stroke="#64748b" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="-18" cy="-13" r="2.4" fill="#94a3b8"/><circle cx="18" cy="-15" r="2.4" fill="#94a3b8"/><rect x="-3" y="-31" width="6" height="3" fill="#64748b"/><rect x="-12" y="-50" width="24" height="19" rx="5" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/><rect x="-9" y="-46" width="18" height="11" rx="3" fill="#0f172a"/><g class="room-look"><rect x="-6" y="-43" width="4" height="5" rx="1.4" fill="#22d3ee"/><rect x="2" y="-43" width="4" height="5" rx="1.4" fill="#22d3ee"/></g><path d="M0 -50V-56" stroke="#64748b" stroke-width="1.2"/><circle class="room-blink" cx="0" cy="-57" r="2" fill="#f43f5e"/><path d="M6 -48q4 2 4 6" stroke="#fff" stroke-width="1.4" fill="none" opacity=".7"/>`,
  'r-toy-chest': `${sh(22, -3)}${glow(0, -26, 26, '#fde68a', 'room-pulse')}<path d="M-21 -19L-19 -40Q0 -48 19 -40L21 -19Z" fill="#6b3a1a" stroke="#4a260f" stroke-width="1"/><path d="M-19 -36Q0 -44 19 -36" stroke="#d4a531" stroke-width="2.4" fill="none"/><path d="M-16 -40L-17 -20M16 -40L17 -20" stroke="#d4a531" stroke-width="2.4"/><path d="M-17 -30Q0 -36 17 -30" stroke="#4a260f" stroke-width=".8" fill="none"/><path d="M-22 -18Q-12 -30 -4 -24Q0 -32 6 -26Q14 -32 22 -18Z" fill="#facc15" stroke="#d4a10a" stroke-width=".8"/><g fill="#fde047" stroke="#b8860b" stroke-width=".5"><circle cx="-12" cy="-22" r="3"/><circle cx="-5" cy="-25" r="3"/><circle cx="4" cy="-27" r="3"/><circle cx="11" cy="-23" r="3"/></g><path d="M-6 -28l3 -4l3 4l-3 4Z" fill="#ef4444" stroke="#fff" stroke-width=".4"/><path d="M8 -27l2.4 -3.4l2.4 3.4l-2.4 3.4Z" fill="#22d3ee" stroke="#fff" stroke-width=".4"/><rect x="-22" y="-20" width="44" height="20" rx="2" fill="#8b4a1f" stroke="#4a260f" stroke-width="1"/><path d="M-22 -14H22M-22 -6H22" stroke="#6b3a1a" stroke-width="1"/><rect x="-22" y="-20" width="5" height="20" fill="#d4a531"/><rect x="17" y="-20" width="5" height="20" fill="#d4a531"/><rect x="-4" y="-16" width="8" height="9" rx="1.4" fill="#d4a531" stroke="#a8741a" stroke-width=".7"/><circle cx="0" cy="-12.6" r="1.2" fill="#4a260f"/><g fill="#fde047" stroke="#b8860b" stroke-width=".5"><circle cx="-26" cy="-2" r="2.6"/><circle cx="26" cy="-3" r="2.6"/><circle cx="23" cy="-1" r="2.4"/></g>${spark(-14, -36, 3.4)}${spark(14, -40, 2.8, '#fff3c4')}${spark(2, -46, 2.4)}`,
};

/* ------------------------------------------------------------- сборка сцены */

export const ROOM_SLOTS = ['wall', 'floor', 'window', 'seat', 'desk', 'shelf', 'plant', 'lamp', 'rug', 'poster', 'toy'];

// Где стоит вещь в комнате (точка опоры).
const ANCHOR = {
  shelf: [62, 140],
  desk: [118, 140],
  poster: [120, 44],
  seat: [234, 146],
  lamp: [300, 144],
  plant: [24, 186],
  toy: [270, 188],
  rug: [166, 176],
};
const RUG_SQUASH = 0.24;

const DEF_WINDOW_WALL = WALLS['r-wall-cream'];

export const ROOM_ART = {
  wall: Object.fromEntries(Object.entries(WALLS).map(([id, w]) => [id, wallLayer(w)])),
  floor: Object.fromEntries(Object.entries(FLOORS).map(([id, [base, inner]]) => [id, floorLayer(base, inner)])),
  window: Object.fromEntries(Object.entries(VIEWS).map(([id, [, view]]) => [id, windowLayer(view)])),
  seat: SEAT,
  desk: DESK,
  shelf: SHELF,
  plant: PLANT,
  lamp: LAMP,
  rug: RUG,
  poster: POSTER,
  toy: TOY,
};

export const DEFAULT_ROOM = {
  wall: 'r-wall-cream',
  floor: 'r-floor-oak',
  window: 'r-win-city',
  seat: null,
  desk: null,
  shelf: null,
  plant: null,
  lamp: null,
  rug: null,
  poster: null,
  toy: null,
};

const place = (slot, id) => {
  const art = ROOM_ART[slot]?.[id];
  if (!art) return '';
  const [x, y] = ANCHOR[slot];
  const inner = slot === 'rug' ? `<g transform="scale(1 ${RUG_SQUASH})">${art}</g>` : art;
  return `<g class="room-item room-${slot}" transform="translate(${x} ${y})">${inner}</g>`;
};

/**
 * Сцена комнаты: SVG-комната и Препи поверх неё (в центре пола).
 * room — { slot: id | null }; обои и пол без значения берутся из DEFAULT_ROOM, остальные пустые слоты не рисуются.
 * prepiSvg — готовая разметка <svg class="mascot">. compact — 16:9 для маленьких карточек.
 */
export function roomScene(room = DEFAULT_ROOM, prepiSvg = '', { compact = false } = {}) {
  const r = room ?? {};
  const wall = ROOM_ART.wall[r.wall] ?? ROOM_ART.wall[DEFAULT_ROOM.wall];
  const floor = ROOM_ART.floor[r.floor] ?? ROOM_ART.floor[DEFAULT_ROOM.floor];
  const mood = MOOD[VIEWS[r.window]?.[0] ?? 'day'];
  const [top, h] = compact ? [12, 180] : [0, 200];
  // Препи: высота 38% сцены, низ рамки — у переднего края пола.
  const ph = h * 0.38;
  const pBottom = compact ? 190 : 194;
  const feetY = f1(pBottom - ph + (ph * 137) / 150);
  const light = r.window && ROOM_ART.window[r.window]
    ? `<path d="M206 133H262L232 184H150Z" fill="${mood.light}" opacity=".16"/><path d="M216 133H250L218 168H176Z" fill="${mood.light}" opacity=".1"/>`
    : '';
  const lamp = r.lamp && LAMP_GLOW[r.lamp] ? (() => {
    const [gx, gy, gr, gc] = LAMP_GLOW[r.lamp];
    const [ax, ay] = ANCHOR.lamp;
    return glow(ax + gx, ay + gy, mood === MOOD.night ? f1(gr * 1.5) : gr, gc);
  })() : '';
  const svg = `<svg class="room-svg" viewBox="0 ${top} 320 ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">`
    + wall + (ROOM_ART.window[r.window] ?? '') + place('poster', r.poster) + floor + light
    + place('rug', r.rug) + place('shelf', r.shelf) + place('desk', r.desk) + place('lamp', r.lamp) + place('seat', r.seat)
    + `<ellipse cx="158" cy="${feetY}" rx="${f1(ph * 0.34)}" ry="${f1(ph * 0.06)}" fill="#24123c" opacity=".22"/>`
    + place('plant', r.plant) + place('toy', r.toy)
    + (mood.overlay ? `<rect x="0" y="0" width="320" height="200" fill="${mood.overlay[0]}" opacity="${mood.overlay[1]}"/>` : '')
    + lamp + '</svg>';
  const bottomPct = f1(((top + h - pBottom) / h) * 100);
  return `<div class="room-scene${compact ? ' is-compact' : ''}${mood === MOOD.night ? ' is-night' : ''}"><div class="room-stage">${svg}<div class="room-prepi" style="bottom:${bottomPct}%">${prepiSvg}</div></div></div>`;
}

// Окно миниатюры для каждого слота (в своих координатах вещи).
const THUMB_BOX = {
  wall: '0 36 124 124',
  floor: '0 110 150 90',
  window: '182 8 100 92',
  seat: '-62 -104 124 110',
  desk: '-42 -78 84 84',
  shelf: '-48 -110 96 114',
  plant: '-40 -86 80 90',
  lamp: '-52 -108 104 112',
  rug: '-82 -52 164 104',
  poster: '-32 -30 64 64',
  toy: '-34 -62 68 66',
};

/** Маленькая картинка одной вещи для витрины магазина. */
export function roomItemThumb(slot, id) {
  const art = ROOM_ART[slot]?.[id];
  if (!art) return '';
  let inner = art;
  if (slot === 'wall') inner = art + ROOM_ART.floor[DEFAULT_ROOM.floor];
  else if (slot === 'floor') inner = ROOM_ART.wall[DEFAULT_ROOM.wall] + art;
  else if (slot === 'window') inner = `<rect x="182" y="8" width="100" height="92" fill="${DEF_WINDOW_WALL.base}"/>${art}`;
  else if (slot === 'rug') inner = `<g transform="scale(1 .72)">${art}</g>`;
  else if (slot === 'lamp' && LAMP_GLOW[id]) {
    const [gx, gy, gr, gc] = LAMP_GLOW[id];
    inner = glow(gx, gy, gr, gc) + art;
  }
  return `<svg class="item-thumb room-thumb thumb-room-${slot}" viewBox="${THUMB_BOX[slot]}" aria-hidden="true" focusable="false">${inner}</svg>`;
}
