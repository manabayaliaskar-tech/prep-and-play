// Ауры Препи: частицы вокруг него и свечение за спиной.
// Частица — маленький рисунок с центром в (0, 0) размером примерно 12×12. Без id, градиентов и фильтров.

import { itemById } from '../../core/wardrobe.js';

/** Где летают частицы (вокруг Препи в его системе координат 140×150). Отступы от краёв — чтобы частицы не обрезались. */
export const AURA_POINTS = [[12, 32], [128, 28], [8, 94], [132, 84], [104, 12], [36, 12]];

// ---------- Кирпичики ----------
const S = (o, w = 0.9) => ` stroke="${o}" stroke-width="${w}"`;
const P = (d, f, o, w, x = '') => `<path d="${d}" fill="${f}"${o ? S(o, w) : ''}${x}/>`;
const L = (d, o, w = 1, x = '') => `<path d="${d}" fill="none"${S(o, w)}${x}/>`;
const C = (cx, cy, r, f, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${x}/>`;
const E = (cx, cy, rx, ry, f, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"${x}/>`;
const shine = (cx, cy, r = 1) => C(cx, cy, r, '#fff', ' opacity=".8"');
/** Повернуть/сдвинуть абсолютный путь (только команды M L Q C Z) и повторить его n раз по кругу — одной строкой d. */
function spin(d, n, { a0 = 0, dx = 0, dy = 0, k = 1 } = {}) {
  const r1 = (v) => Math.round(v * 10) / 10;
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = ((a0 + (i * 360) / n) * Math.PI) / 180;
    const [c, sn] = [Math.cos(a), Math.sin(a)];
    let pair = [];
    out += d.replace(/-?\d*\.?\d+/g, (num) => {
      pair.push(Number(num));
      if (pair.length < 2) return '\u0000';
      const [x, y] = [pair[0] * k + dx, pair[1] * k + dy];
      pair = [];
      return `${r1(x * c - y * sn)} ${r1(x * sn + y * c)}`;
    }).replace(/\u0000\s*/g, '') + ' ';
  }
  return out.trim();
}

const HEART = 'M0 5.4 C-7 1 -7 -5.4 -3.2 -5.4 C-1.4 -5.4 -.4 -4.2 0 -3 C.4 -4.2 1.4 -5.4 3.2 -5.4 C7 -5.4 7 1 0 5.4 Z';
const STAR = 'M0 -6.4 L1.9 -2.3 L6.2 -2 L2.9 .9 L3.9 5.2 L0 2.9 L-3.9 5.2 L-2.9 .9 L-6.2 -2 L-1.9 -2.3 Z';
const SPARK = (s) => `M0 ${-s} Q${s * 0.13} ${-s * 0.13} ${s} 0 Q${s * 0.13} ${s * 0.13} 0 ${s} Q${-s * 0.13} ${s * 0.13} ${-s} 0 Q${-s * 0.13} ${-s * 0.13} 0 ${-s} Z`;
const FLAKE_ARM = 'M0 0 L0 -6 M0 -3.6 L-1.8 -5.2 M0 -3.6 L1.8 -5.2';

/** Рисунки частиц: { shape: SVG с центром в (0,0), fall: true — падают сверху вниз, а не парят }. */
export const AURA_SHAPES = {
  // ----- Магазинные -----
  sparkles: { shape: P(SPARK(6.6), '#ffe066', '#e9a800', 0.8) + `<g transform="translate(4.6 -4.6)">${P(SPARK(2.4), '#fff3b0', '#e9a800', 0.6)}</g>` + C(0, 0, 1.2, '#fff') },
  hearts: { shape: P(HEART, '#ff5c8a', '#d6336c', 0.9) + E(-2.8, -2.6, 1.5, 1, '#fff', ' opacity=".75" transform="rotate(-30 -2.8 -2.6)"') },
  bubbles: {
    shape:
      C(-0.6, 0.6, 5.2, '#bfe9ff', ' fill-opacity=".35" stroke="#4fb0ea" stroke-width=".9"') +
      L('M-4.2 2.4 A4.4 4.4 0 0 0 1.6 4.6', '#f9a8d4', 1, ' opacity=".8"') +
      L('M-3.2 -2.2 A3.4 3.4 0 0 1 -.2 -3.8', '#fff', 1.2) +
      C(4.6, -4.2, 1.8, '#bfe9ff', ' fill-opacity=".35" stroke="#4fb0ea" stroke-width=".7"') +
      shine(4, -4.8, 0.5),
  },
  leaves: { fall: true, shape: P('M-5.6 4.6 Q-6.4 -4 5.6 -5.6 Q5 4 -5.6 4.6 Z', '#7bd36a', '#3f9a3a', 0.9) + L('M-5.6 4.6 L2.8 -2.8 M-2 1 l-.6 -2.6 M.4 -1.2 l2 .4', '#3f9a3a', 0.6) },
  snow: { fall: true, shape: L(spin(FLAKE_ARM, 6), '#7cc4ef', 2.4) + L(spin(FLAKE_ARM, 6), '#fff', 1.1) + C(0, 0, 1.3, '#fff', S('#7cc4ef', 0.6)) },
  notes: {
    shape:
      E(-3.4, 3.6, 2.6, 1.9, '#a78bfa', `${S('#5b34c9', 0.8)} transform="rotate(-22 -3.4 3.6)"`) +
      E(3.4, 2.2, 2.6, 1.9, '#a78bfa', `${S('#5b34c9', 0.8)} transform="rotate(-22 3.4 2.2)"`) +
      L('M-1.1 3 V-4.4 M5.7 1.6 V-5.8', '#5b34c9', 1.1) +
      P('M-1.6 -4 L6.2 -6.4 V-4.2 L-1.6 -1.8 Z', '#5b34c9') +
      shine(-4.2, 2.8, 0.6),
  },
  sakura: {
    fall: true,
    shape: P(spin('M0 -.6 Q-3 -3 -1.8 -6 Q-.8 -6.6 0 -5.6 Q.8 -6.6 1.8 -6 Q3 -3 0 -.6 Z', 5), '#ffc4dc', '#e77fa8', 0.7) + C(0, 0, 1.5, '#ff86b4') + L(spin('M0 -2.4 L0 -2.5', 5, { a0: 36 }), '#ffe08a', 1),
  },
  stars: { shape: P(STAR, '#ffd23f', '#e09a00', 0.9) + C(-1.3, -0.4, 0.55, '#5a3a00') + C(1.3, -0.4, 0.55, '#5a3a00') + L('M-.8 1 q.8 .7 1.6 0', '#5a3a00', 0.5) + shine(-1.6, -2.6, 0.7) },
  money: {
    fall: true,
    shape:
      `<g transform="rotate(-14)"><rect x="-6.4" y="-4" width="12.8" height="8" rx="1.2" fill="#86e3a0"${S('#2f9a55', 0.9)}/><rect x="-5" y="-2.7" width="10" height="5.4" rx=".8" fill="none"${S('#4fbf73', 0.6)}/>${C(0, 0, 1.8, '#4fbf73')}</g>` +
      C(4, 3.4, 2.8, '#ffd23f', S('#d49b00', 0.8)) +
      C(4, 3.4, 1.5, 'none', S('#e9b100', 0.5)),
  },
  lightning: { shape: P('M1.6 -6.6 L-4.2 .8 H-.4 L-2 6.6 L4.6 -1.4 H.8 Z', '#ffe14d', '#e08b00', 0.9) + L('M.2 -3.6 L-2 -.4', '#fff', 0.8, ' opacity=".8"') },
  fire: {
    shape:
      P('M0 -7 Q1.4 -3.6 3.6 -2.6 Q5.4 0 4.6 3 Q3.6 6.6 0 6.6 Q-3.6 6.6 -4.6 3 Q-5.4 -.4 -2.4 -3.4 Q-2 -1 -.6 -.6 Q-1.6 -4 0 -7 Z', '#ff6b2c', '#d9420f', 0.8) +
      P('M0 -1.6 Q2.8 1 2.6 3 Q2.2 5.2 0 5.2 Q-2.2 5.2 -2.6 3 Q-2.6 .8 0 -1.6 Z', '#ffd23f') +
      E(0, 3.6, 1, 1.3, '#fff7c2'),
  },
  goldglow: { shape: C(0, 0, 5.4, '#fde047', ' opacity=".35"') + P(SPARK(5.8), '#fff3a0', '#f5b400', 0.6) + C(0, 0, 2, '#fffbe0', S('#f5b400', 0.6)) },
  rainbowring: {
    shape:
      `<g fill="none" stroke-width="1.5">${['#f87171', '#facc15', '#4ade80', '#60a5fa'].map((c, i) => `<path d="M${-6 + i * 1.4} 2.4 A${6 - i * 1.4} ${6 - i * 1.4} 0 0 1 ${6 - i * 1.4} 2.4" stroke="${c}"/>`).join('')}</g>` +
      [[-6.2, 3, 1.9], [-4, 3.6, 1.5], [6.2, 3, 1.9], [4, 3.6, 1.5]].map(([x, y, r]) => C(x, y, r, '#fff', S('#c7d2fe', 0.6))).join(''),
  },
  // ----- Сезонные -----
  frost: {
    shape:
      P('M0 -6.6 L4.4 -2.4 L3 4.4 L0 6.6 L-3 4.4 L-4.4 -2.4 Z', '#c7ecff', '#4f9fd6', 0.9) +
      L('M0 -6.6 L0 6.6 M-4.4 -2.4 L0 0 L4.4 -2.4 M-3 4.4 L0 0 L3 4.4', '#fff', 0.6, ' opacity=".9"') +
      P('M0 -6.6 L-4.4 -2.4 L0 0 Z', '#fff', '', 0, ' opacity=".55"'),
  },
  valentine: {
    shape:
      L('M-6.4 5 L6 -4.6', '#a16207', 1.1) +
      P('M6.6 -5.2 L3.4 -4.8 L5.6 -2.6 Z', '#9ca3af', '#6b7280', 0.5) +
      `<g transform="scale(.8)">${P(HEART, '#f43f5e', '#be123c', 1.1)}${E(-2.8, -2.6, 1.4, 0.9, '#fff', ' opacity=".7"')}</g>` +
      L('M-3.4 2.6 L-1.6 1.2', '#a16207', 1.1) +
      P('M-6.4 5 l-1 -2.6 l2.2 .9 Z M-6.4 5 l2.6 1 l-.9 -2.2 Z', '#fda4af', '#e11d48', 0.4),
  },
  tulips: {
    shape:
      L('M0 1 V6.6', '#3f9a3a', 1.2) +
      P('M0 6 Q-4.6 4.4 -4.8 .6 Q-2 1.6 0 4.6 Z', '#7bd36a', '#3f9a3a', 0.6) +
      P('M-4.2 -4.6 L-2 -2.2 L0 -6 L2 -2.2 L4.2 -4.6 Q4.8 2.4 0 2.4 Q-4.8 2.4 -4.2 -4.6 Z', '#ff6b8b', '#d63a5e', 0.8) +
      L('M-2.6 -2.4 Q-2.8 .4 -1.4 1.4', '#fff', 0.7, ' opacity=".7"'),
  },
  planets: {
    shape:
      `<g transform="rotate(-20)">${L('M-7 0 A7 2.4 0 0 1 7 0', '#a78bfa', 1.4)}</g>` +
      C(0, 0, 4, '#f6c177', S('#c47f2a', 0.8)) +
      L('M-3.6 -1.4 Q0 -.4 3.6 -1.6 M-3.4 1.8 Q0 2.6 3.2 1.6', '#e0a050', 0.6) +
      shine(-1.6, -2, 0.8) +
      `<g transform="rotate(-20)">${L('M-7 0 A7 2.4 0 0 0 7 0', '#a78bfa', 1.4)}</g>`,
  },
  daisies: { shape: P(spin('M0 -1 Q-2.6 -3.6 0 -6.6 Q2.6 -3.6 0 -1 Z', 8), '#fff', '#c9c3d6', 0.6) + C(0, 0, 2.4, '#ffcf3d', S('#e09a00', 0.6)) + shine(-0.7, -0.8, 0.6) },
  suns: { shape: P(spin('M-1.2 -4.4 L0 -6.8 L1.2 -4.4 Z', 8), '#ffb020', '#f08c00', 0.5) + C(0, 0, 4, '#ffd23f', S('#f08c00', 0.8)) + shine(-1.4, -1.6, 0.8) },
  shells: {
    shape:
      P('M0 5 Q-7 .6 -6 -2.8 Q-3.2 -6.6 0 -6 Q3.2 -6.6 6 -2.8 Q7 .6 0 5 Z', '#ffc9a8', '#d98a62', 0.8) +
      L('M0 4.4 L-4 -4.4 M0 4.4 L-1.4 -5.8 M0 4.4 L1.4 -5.8 M0 4.4 L4 -4.4', '#e9a07a', 0.6) +
      P('M-1.8 4 h3.6 l-.6 2 h-2.4 Z', '#ffb48a', '#d98a62', 0.6),
  },
  fireworks: {
    shape:
      L(spin('M0 -2.2 L0 -5.4', 8), '#f472b6', 1.1) +
      L(spin('M0 -6.4 L0 -6.5', 8), '#facc15', 1.6) +
      L(spin('M0 -3.6 L0 -3.7', 8, { a0: 22.5 }), '#60a5fa', 1.1) +
      C(0, 0, 1.2, '#fff', S('#f472b6', 0.5)),
  },
  pencils: {
    shape: `<g transform="rotate(-40)">${[
      `<rect x="-5.6" y="-1.7" width="8.6" height="3.4" rx=".4" fill="#ffcf3d"${S('#c98d10', 0.7)}/>`,
      `<rect x="-7.4" y="-1.7" width="2" height="3.4" rx=".8" fill="#ff8fb1"${S('#d6336c', 0.6)}/>`,
      `<rect x="-5.8" y="-1.7" width="1.1" height="3.4" fill="#cbd5e1"/>`,
      P('M3 -1.7 L6.8 0 L3 1.7 Z', '#f6d7a8', '#c98d10', 0.6),
      P('M5.5 -.6 L6.8 0 L5.5 .6 Z', '#3a2c4f'),
      L('M-4.4 -.4 H2.6', '#fff', 0.5, ' opacity=".7"'),
    ].join('')}</g>`,
  },
  ghosts: {
    shape:
      P('M-5 5.4 V-.6 A5 5 0 0 1 5 -.6 V5.4 L3.3 4 L1.7 5.4 L0 4 L-1.7 5.4 L-3.3 4 Z', '#fbfaff', '#a99fd0', 0.9) +
      E(-1.8, -0.6, 0.9, 1.3, '#3a2c4f') +
      E(1.8, -0.6, 0.9, 1.3, '#3a2c4f') +
      E(0, 2, 0.8, 1, '#3a2c4f') +
      E(-3.4, 1.2, 0.9, 0.5, '#ff9fb8') +
      E(3.4, 1.2, 0.9, 0.5, '#ff9fb8'),
  },
  maple: {
    fall: true,
    shape:
      P('M0 4.6 L-4.8 5.2 L-4 2.4 L-6.6 -.6 L-4.6 -1.2 L-5.4 -4.6 L-2.6 -3.4 L-1.8 -5.2 L0 -7 L1.8 -5.2 L2.6 -3.4 L5.4 -4.6 L4.6 -1.2 L6.6 -.6 L4 2.4 L4.8 5.2 Z', '#ff7a2f', '#c2410c', 0.8) +
      L('M0 7 V-4.4 M0 1 L-3.6 -1.6 M0 1 L3.6 -1.6', '#c2410c', 0.6),
  },
  gifts: {
    shape:
      `<rect x="-5" y="-2.4" width="10" height="7.6" rx="1" fill="#f472b6"${S('#be185d', 0.8)}/>` +
      `<rect x="-6" y="-4.4" width="12" height="2.8" rx=".8" fill="#f9a8d4"${S('#be185d', 0.8)}/>` +
      `<rect x="-1" y="-4.4" width="2" height="9.6" fill="#ffd23f"/>` +
      P('M0 -4.4 Q-4.6 -8.4 -3.6 -4.6 Z M0 -4.4 Q4.6 -8.4 3.6 -4.6 Z', '#ffd23f', '#d49b00', 0.6),
  },
  // ----- Новые -----
  raindrops: { fall: true, shape: P('M0 -6.6 Q4.8 -.6 4.6 2.2 A4.6 4.6 0 0 1 -4.6 2.2 Q-4.8 -.6 0 -6.6 Z', '#7cc8ff', '#2f88d0', 0.9) + L('M-2.4 .4 Q-2.8 2.8 -.8 4', '#fff', 0.9, ' opacity=".85"') },
  clovers: {
    fall: true,
    shape:
      L('M0 0 Q1.6 3.6 3.6 6.4', '#2f8f3a', 1) +
      P(spin(HEART, 4, { a0: 45, k: 0.62, dy: -3.2 }), '#5fd16b', '#2f8f3a', 0.75) +
      C(0, 0, 0.9, '#a7f3a0'),
  },
  butterflies: {
    shape:
      `<g class="bf-wings">${P('M-.4 -.6 Q-6.8 -7.4 -6.4 -2 Q-6.2 .4 -.4 .2 Z M-.4 .4 Q-5.6 1.4 -4.6 4.6 Q-2.6 6 -.4 1.4 Z', '#ffa8d8', '#d0679f', 0.7)}${P(
        'M.4 -.6 Q6.8 -7.4 6.4 -2 Q6.2 .4 .4 .2 Z M.4 .4 Q5.6 1.4 4.6 4.6 Q2.6 6 .4 1.4 Z',
        '#ffa8d8',
        '#d0679f',
        0.7,
      )}${C(-3.8, -2.6, 1, '#fff', ' opacity=".8"')}${C(3.8, -2.6, 1, '#fff', ' opacity=".8"')}</g>` +
      E(0, 0.6, 0.8, 3.6, '#5b3a6e') +
      L('M-.3 -2.8 Q-1.4 -5.4 -2.6 -5.8 M.3 -2.8 Q1.4 -5.4 2.6 -5.8', '#5b3a6e', 0.5),
  },
  books: {
    shape:
      P('M0 -1.4 Q-3.4 -4.2 -7 -3.2 V4 Q-3.4 3 0 5.2 Q3.4 3 7 4 V-3.2 Q3.4 -4.2 0 -1.4 Z', '#4f7cf0', '#2f50b0', 0.9) +
      P('M0 -1.8 Q-3 -4.4 -6.2 -3.6 V3 Q-3 2.2 0 4 Q3 2.2 6.2 3 V-3.6 Q3 -4.4 0 -1.8 Z', '#fffdf5') +
      L('M0 -1.8 V4 M-4.8 -1.6 q1.8 -.4 3.4 .4 M-4.8 .4 q1.8 -.4 3.4 .4 M1.4 -1.2 q1.8 -.8 3.4 -.4 M1.4 .8 q1.8 -.8 3.4 -.4', '#b8c2d6', 0.6),
  },
  atoms: {
    shape:
      [0, 60, 120].map((a) => E(0, 0, 6.6, 2.4, 'none', `${S('#60a5fa', 0.9)} transform="rotate(${a})"`)).join('') +
      C(0, 0, 1.8, '#f472b6', S('#be185d', 0.6)) +
      C(6.6, 0, 0.9, '#22d3ee') +
      `<g transform="rotate(120)">${C(-6.6, 0, 0.9, '#22d3ee')}</g>` +
      `<g transform="rotate(240)">${C(0, 2.4, 0.9, '#22d3ee')}</g>`,
  },
  comets: {
    shape:
      P('M-7 -7 L3.4 -.4 L-.4 3.4 Z', '#a78bfa', '', 0, ' opacity=".5"') +
      P('M-5.6 -6.4 L2.8 .4 L.4 2.8 Z', '#67e8f9', '', 0, ' opacity=".85"') +
      C(2, 2, 3.2, '#fff7c2', S('#facc15', 1)) +
      shine(1, 1, 1),
  },
};

/** Свечение за спиной (рисуется до тела). */
export const AURA_BACK = {
  goldglow: `<circle class="aura-glow" cx="70" cy="80" r="62" fill="#fde047" opacity=".35"/>`,
  rainbowring: `<g class="aura-ring" fill="none" stroke-width="4" opacity=".75">${['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa']
    .map((c, i) => `<circle cx="70" cy="80" r="${66 - i * 4}" stroke="${c}"/>`)
    .join('')}</g>`,
  comets: `<circle class="aura-glow" cx="70" cy="80" r="60" fill="#a78bfa" opacity=".28"/>`,
};

export function auraBack(id) {
  return AURA_BACK[id] ?? '';
}

export function auraFront(id) {
  if (!id) return '';
  const art = AURA_SHAPES[id];
  if (art) {
    return `<g class="aura aura-${id} ${art.fall ? 'aura-falls' : ''}">${AURA_POINTS.map(
      ([x, y], i) => `<g transform="translate(${x} ${y}) scale(${i % 2 ? 0.85 : 1.05})"><g class="aura-p" style="animation-delay:${(i * 0.45).toFixed(2)}s">${art.shape}</g></g>`,
    ).join('')}</g>`;
  }
  const icon = itemById(id)?.icon;
  return icon
    ? `<g class="aura aura-${id}">${AURA_POINTS.map(([x, y], i) => `<text class="aura-p" x="${x}" y="${y}" font-size="${i % 2 ? 13 : 16}" text-anchor="middle" style="animation-delay:${(i * 0.45).toFixed(2)}s">${icon}</text>`).join('')}</g>`
    : '';
}
