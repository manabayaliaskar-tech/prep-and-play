// Маскот Prep&Play - Препи 2.0: объёмный светящийся шар с ручками, ножками и орбитальным кольцом.
// Цвета берутся из темы (--mascot-hi, --mascot-1, --mascot-2), поэтому Препи меняется вместе с оформлением.
// Глаза моргают и следят за курсором (переменные --lx/--ly задаёт ui/motion.js).
//
// mascot(настроение, класс, наряд, { form, pose }):
//   настроения - happy, wow, sad, win, think, sleep, love, laugh, cool, angry, shy, confused, cry,
//                proud, dizzy, wink, scared, starstruck, sick, ghost (а также neutral → happy, lose → sad);
//   формы (зависят от серии) - buff (качок), blaze (огненный), sick (заболел), ghost (призрак), tomb (призрак над надгробием).
// Система координат: viewBox 0 0 140 150, тело - круг (70, 80) r 48. Рисунки вещей - в ./art/.

import { COLORS, getOutfit } from '../core/wardrobe.js';
import { auraBack, auraFront } from './art/auras.js';
import { EMOTES } from './art/emotes.js';
import { petSvg } from './art/pets.js';
import { BACK, BODY, CAP, FACE, FEET, HAND, HEAD, NECK } from './art/wear.js';

const INK = '#22164f';
let uid = 0;

// ---------- Глаза ----------

/** Открытый глаз: белок, радужка с градиентом, зрачок и два блика. dx/dy - куда смотрит. */
function eyeOpen(id, cx, cy, { rx = 11, ry = 13, ir = 8, dx = 0, dy = 0, shine = 1 } = {}) {
  // Мультяшный глаз: белок, тёмный зрачок-овал и два блика (без обводки и радужки - так Препи добрее).
  const px = cx + 1 + dx;
  const py = cy + 2 + dy;
  const prx = ir * 0.8;
  const pry = Math.min(ry * 0.62, ir * 1.02);
  return `<g class="eye">
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff"/>
    <g class="pupils">
      <ellipse cx="${px}" cy="${py}" rx="${prx.toFixed(1)}" ry="${pry.toFixed(1)}" fill="${INK}"/>
      <circle cx="${(px + prx * 0.42).toFixed(1)}" cy="${(py - pry * 0.5).toFixed(1)}" r="${(2.6 * shine).toFixed(1)}" fill="#fff"/>
      <circle cx="${(px - prx * 0.45).toFixed(1)}" cy="${(py + pry * 0.45).toFixed(1)}" r="${(1.2 * shine).toFixed(1)}" fill="#fff" opacity=".8"/>
    </g>
  </g>`;
}

/** Веко поверх открытого глаза: half - полуприкрыт, angry - нахмурен, sad - грустно опущен. side: -1 левый глаз, 1 правый. */
function lid(id, cx, cy, kind, side) {
  let a;
  let b;
  if (kind === 'half') [a, b] = [cy - 1, cy - 1];
  else if (kind === 'angry') [a, b] = side < 0 ? [cy - 13, cy - 3] : [cy - 3, cy - 13];
  else [a, b] = side < 0 ? [cy - 4, cy - 12] : [cy - 12, cy - 4];
  const mid = (a + b) / 2 + (kind === 'half' ? 1.5 : 0);
  return `<path d="M${cx - 13.5} ${a} Q${cx} ${mid} ${cx + 13.5} ${b} L${cx + 13.5} ${cy - 17} L${cx - 13.5} ${cy - 17} Z" fill="url(#${id}b)"/>
    <path d="M${cx - 12} ${a + 0.5} Q${cx} ${mid} ${cx + 12} ${b + 0.5}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}

const arcEye = (cx, cy, up = true) =>
  `<path d="M${cx - 10} ${cy + 3} Q${cx} ${up ? cy - 10 : cy + 9} ${cx + 10} ${cy + 3}" stroke="${INK}" stroke-width="4.6" fill="none" stroke-linecap="round"/>`;

const heartAt = (x, y, s, fill) => `<path d="M${x} ${y + s * 0.9} C${x - s * 1.5} ${y - s * 0.1} ${x - s} ${y - s * 1.3} ${x} ${y - s * 0.45} C${x + s} ${y - s * 1.3} ${x + s * 1.5} ${y - s * 0.1} ${x} ${y + s * 0.9} Z" fill="${fill}"/>`;
const starAt = (x, y, r, fill, extra = '') => {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const ang = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 ? r * 0.45 : r;
    pts.push(`${(x + rr * Math.cos(ang)).toFixed(1)} ${(y + rr * Math.sin(ang)).toFixed(1)}`);
  }
  return `<path d="M${pts.join(' L')} Z" fill="${fill}" ${extra}/>`;
};

function eyes(id, kind) {
  const L = [53, 76];
  const R = [87, 76];
  const both = (fn) => fn(...L, -1) + fn(...R, 1);
  switch (kind) {
    case 'big':
      return both((x, y) => eyeOpen(id, x, y, { rx: 13, ry: 16, ir: 9, shine: 1.25 }));
    case 'tiny':
      return both((x, y) => eyeOpen(id, x, y, { rx: 13, ry: 16, ir: 4.5 }));
    case 'up':
      return both((x, y) => eyeOpen(id, x, y, { dx: 2.5, dy: -5 }));
    case 'down':
      return both((x, y) => eyeOpen(id, x, y, { dx: -1.5, dy: 5 }) + lid(id, x, y, 'half', 1));
    case 'half':
      return both((x, y, s) => eyeOpen(id, x, y) + lid(id, x, y, 'half', s));
    case 'angry':
      return both((x, y, s) => eyeOpen(id, x, y, { dy: 3 }) + lid(id, x, y, 'angry', s));
    case 'sad':
      return both((x, y, s) => eyeOpen(id, x, y, { dy: 2.5, shine: 1.3 }) + lid(id, x, y, 'sad', s));
    case 'happy':
      return `<g class="face-eyes">${arcEye(...L)}${arcEye(...R)}</g>`;
    case 'closed':
      return `<g class="face-eyes">${arcEye(L[0], L[1] + 1, false)}${arcEye(R[0], R[1] + 1, false)}
        <path d="M44 82 l-3 3 M62 82 l3 3 M78 82 l-3 3 M96 82 l3 3" stroke="${INK}" stroke-width="2" stroke-linecap="round"/></g>`;
    case 'squeeze':
      return `<path d="M44 70 L58 77 L44 83 M96 70 L82 77 L96 83" stroke="${INK}" stroke-width="4.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'wink':
      return eyeOpen(id, ...L) + arcEye(...R);
    case 'odd':
      return eyeOpen(id, L[0], L[1], { rx: 10, ry: 11, ir: 6 }) + eyeOpen(id, R[0], R[1] - 2, { rx: 13.5, ry: 16, ir: 8.5 });
    case 'heart':
      return `<g class="eyes-heart">${heartAt(53, 77, 10.5, '#f43f5e')}${heartAt(87, 77, 10.5, '#f43f5e')}<circle cx="49" cy="72" r="2.6" fill="#fff" opacity=".8"/><circle cx="83" cy="72" r="2.6" fill="#fff" opacity=".8"/></g>`;
    case 'star':
      return `<g class="eyes-star">${starAt(53, 77, 12.5, '#facc15', `stroke="#f59e0b" stroke-width="1.6" stroke-linejoin="round"`)}${starAt(87, 77, 12.5, '#facc15', `stroke="#f59e0b" stroke-width="1.6" stroke-linejoin="round"`)}<circle cx="49.5" cy="72" r="2.4" fill="#fff"/><circle cx="83.5" cy="72" r="2.4" fill="#fff"/></g>`;
    case 'spiral':
      return `<g class="eyes-spiral" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round">${[L, R]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="#fff" stroke-width="1.6" opacity=".95"/><path class="spin" d="M${x} ${y} m0 -1.5 a1.5 1.5 0 1 1 -1.5 1.5 a3.5 3.5 0 1 1 3.5 3.5 a5.5 5.5 0 1 1 -5.5 -5.5 a7.5 7.5 0 1 1 7.5 7.5"/>`)
        .join('')}</g>`;
    case 'hollow':
      return `<g class="eyes-hollow">${[L, R].map(([x, y]) => `<ellipse cx="${x}" cy="${y + 1}" rx="9" ry="12" fill="${INK}" opacity=".85"/><ellipse cx="${x + 2.5}" cy="${y - 3}" rx="3" ry="3.6" fill="#fff" opacity=".9"/>`).join('')}</g>`;
    default:
      return both((x, y) => eyeOpen(id, x, y));
  }
}

// ---------- Брови ----------

const BROWS = {
  soft: ['M43 57 Q52 52 61 55', 'M79 55 Q88 52 97 57'],
  up: ['M42 52 Q52 45 61 50', 'M79 50 Q88 45 98 52'],
  sad: ['M43 59 Q53 57 61 50', 'M79 50 Q87 57 97 59'],
  angry: ['M43 51 Q53 54 62 60', 'M78 60 Q87 54 97 51'],
  think: ['M44 58 Q52 56 61 58', 'M79 52 Q88 46 97 52'],
  flat: ['M44 56 L61 55', 'M79 55 L96 56'],
};
const browsHtml = (kind) =>
  BROWS[kind] ? `<g class="brows" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round">${BROWS[kind].map((d) => `<path d="${d}"/>`).join('')}</g>` : '';

// ---------- Рот ----------

// Открытый рот: форма (по ней обрезаются язык и зубы), язык [cx, cy, rx, ry], верхние зубы - y верхней кромки.
const OPEN_MOUTHS = {
  grin: { shape: '<path d="M56 96 Q70 116 84 96 Q70 99 56 96 Z"/>', tongue: [70, 108, 9, 5], teeth: 93.5 },
  laugh: { shape: '<path d="M52 92 Q70 125 88 92 Q70 98 52 92 Z"/>', tongue: [70, 115, 12, 7.5], teeth: 89.5 },
  o: { shape: '<ellipse cx="70" cy="101" rx="6.5" ry="8.5"/>', tongue: [70, 108, 5.5, 4] },
  wail: { shape: '<path d="M55 108 Q57 91 70 91 Q83 91 85 108 Q70 103 55 108 Z"/>', tongue: [70, 108, 9, 4.5], teeth: 89 },
  scared: { shape: '<path d="M57 105 Q57 94 70 94 Q83 94 83 105 Q70 101 57 105 Z"/>', teeth: 92 },
  grit: { shape: '<rect x="56" y="95" width="28" height="12" rx="5.5"/>', grit: true },
  snore: { shape: '<ellipse cx="70" cy="102" rx="4.2" ry="3.4"/>' },
};
const LINE_MOUTHS = {
  smile: 'M58 97 Q70 108 82 97',
  frown: 'M59 106 Q70 96 81 106',
  hmm: 'M61 102 Q66 99 71 101 T80 100',
  wavy: 'M60 101 Q63.5 97.5 67 101 T74 101 T81 101',
  smirk: 'M60 101 Q72 105 82 95',
  cat: 'M60 98 Q65 105 70 99 Q75 105 80 98',
  flat: 'M62 101 L78 101',
};

function mouthHtml(id, kind) {
  const open = OPEN_MOUTHS[kind];
  if (!open) return `<path class="mouth" d="${LINE_MOUTHS[kind] ?? LINE_MOUTHS.smile}" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const fill = open.shape.replace('/>', ` fill="${INK}"/>`);
  let inner = '';
  if (open.teeth) inner += `<rect x="40" y="${open.teeth}" width="60" height="5.6" rx="2" fill="#fff"/>`;
  if (open.tongue) inner += `<ellipse cx="${open.tongue[0]}" cy="${open.tongue[1]}" rx="${open.tongue[2]}" ry="${open.tongue[3]}" fill="#ff7aa8"/>`;
  if (open.grit) inner += `<rect x="56" y="95" width="28" height="12" fill="#fff"/><path d="M56 101 H84 M62.5 95 V107 M70 95 V107 M77.5 95 V107" stroke="${INK}" stroke-width="1.6"/>`;
  return `<g class="mouth"><clipPath id="${id}m">${open.shape}</clipPath>${fill}<g clip-path="url(#${id}m)">${inner}</g>${open.shape.replace('/>', ` fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`)}</g>`;
}

// ---------- Руки ----------

// Позы: для каждой руки - путь от плеча к кисти [x0 y0 cx cy x1 y1]; front - кисть лежит на лице (рука спрятана за телом).
const POSES = {
  rest: { L: [27, 92, 14, 100, 19, 112], R: [113, 92, 126, 100, 121, 112] },
  droop: { L: [28, 96, 20, 110, 26, 121], R: [112, 96, 120, 110, 114, 121] },
  up: { L: [28, 86, 10, 76, 12, 56], R: [112, 86, 130, 76, 128, 56] },
  open: { L: [27, 90, 10, 88, 5, 75], R: [113, 90, 130, 88, 135, 75] },
  wave: { L: [27, 92, 14, 100, 19, 112], R: [112, 88, 132, 80, 128, 58], wave: true },
  chin: { L: [27, 92, 14, 100, 19, 112], front: [[88, 112]] },
  cover: { front: [[39, 97], [101, 97]] },
  belly: { front: [[50, 119], [90, 119]] },
  hips: { L: [27, 90, 8, 98, 25, 111], R: [113, 90, 132, 98, 115, 111] },
  fists: { L: [27, 92, 10, 94, 15, 79], R: [113, 92, 130, 94, 125, 79] },
  thumb: { L: [27, 92, 14, 100, 19, 112], R: [112, 92, 130, 92, 127, 74], thumb: true },
  scratch: { L: [27, 92, 14, 100, 19, 112], R: [113, 88, 136, 66, 112, 46] },
  flex: { L: [27, 88, 4, 90, 8, 64], R: [113, 88, 136, 90, 132, 64], flex: true },
  hold: { L: [27, 92, 14, 100, 19, 112], R: [113, 92, 128, 99, 123, 106] },
};

const quad = ([x0, y0, cx, cy, x1, y1], t) => [
  (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1,
  (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1,
];

/** Пухлая рука: контур, заливка и блик. Конец скруглён, без отдельной ладошки. */
function armPath([x0, y0, cx, cy, x1, y1], thick) {
  const d = `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`;
  return `<path d="${d}" stroke="var(--mascot-2)" stroke-width="${thick + 3}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="var(--mascot-1)" stroke-width="${thick}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fff" stroke-width="${(thick / 4).toFixed(1)}" fill="none" stroke-linecap="round" opacity=".28" transform="translate(-1.2 -1.6)"/>`;
}

// Рукава костюмов: цвет рукава и его контура (верхняя часть руки окрашивается под костюм).
const SLEEVES = {
  hoodie: ['#38bdf8', '#0369a1'], tuxedo: ['#1f2937', '#030712'], superhero: ['#2563eb', '#1e3a8a'], kimono: ['#e11d48', '#881337'],
  spacesuit: ['#f1f5f9', '#64748b'], labcoat: ['#f8fafc', '#94a3b8'], jersey: ['#16a34a', '#14532d'], knightarmor: ['#cbd5e1', '#475569'],
  overalls: ['#fde047', '#a16207'], raincoat: ['#facc15', '#a16207'], sweater: ['#dc2626', '#7f1d1d'], piratecoat: ['#9f1239', '#4c0519'],
  wizardrobe: ['#312e81', '#1e1b4b'], chefcoat: ['#ffffff', '#94a3b8'], ninjagi: ['#334155', '#0f172a'], pyjamas: ['#bfdbfe', '#2563eb'],
  schooluniform: ['#1e3a8a', '#172554'], tracksuit: ['#10b981', '#065f46'], princessdress: ['#fbcfe8', '#9d174d'], hawaiian: ['#0891b2', '#164e63'],
  trenchcoat: ['#d4a373', '#7c4a1e'],
};

/** Рукав: часть руки от плеча до t = 0.62 в цвете костюма, с манжетой. */
function sleeve(a, thick, [fill, line]) {
  const [mx, my] = quad(a, 0.62);
  const [cx, cy] = quad(a, 0.31);
  const d = `M${a[0]} ${a[1]} Q${(2 * cx - (a[0] + mx) / 2).toFixed(1)} ${(2 * cy - (a[1] + my) / 2).toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  return `<path d="${d}" stroke="${line}" stroke-width="${thick + 4}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${fill}" stroke-width="${thick + 1}" fill="none" stroke-linecap="round"/><circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${(thick / 2 + 1.5).toFixed(1)}" fill="${fill}" stroke="${line}" stroke-width="1.6"/>`;
}

// Позы, где кисть лежала на лице, заменяются похожими - у рук теперь нет отдельных ладошек.
const POSE_SWAP = { chin: 'rest', cover: 'droop', belly: 'hips', thumb: 'wave' };

/** Руки за телом (рисуются до тела). Если в руке вещь - правая рука её держит: кончик руки рисуется поверх вещи. */
function arms(poseId, { buff = false, holding = null, sleeves = null } = {}) {
  let pose = POSES[POSE_SWAP[poseId] ?? poseId] ?? POSES.rest;
  if (holding && !['up', 'flex', 'open'].includes(poseId)) pose = { ...pose, R: POSES.hold.R, wave: false };
  const thick = buff ? 16 : 13;
  let back = '';
  let front = '';
  for (const side of ['L', 'R']) {
    const a = pose[side];
    if (!a) continue;
    const isR = side === 'R';
    const bicep = pose.flex || buff ? `<circle cx="${(a[0] + a[2]) / 2 + (isR ? 2 : -2)}" cy="${(a[1] + a[3]) / 2 - 3}" r="${buff ? 10.5 : 7}" fill="var(--mascot-1)" stroke="var(--mascot-2)" stroke-width="1.6"/>` : '';
    back += `<g class="arm arm-${side.toLowerCase()} ${isR && pose.wave ? 'is-waving' : ''}">${armPath(a, thick)}${sleeves ? sleeve(a, thick, sleeves) : bicep}</g>`;
    if (isR && holding) {
      const [tx, ty] = quad(a, 0.72);
      front += `<g class="held" transform="translate(${a[4]} ${a[5]})">${holding}</g>`;
      front += `<g class="arm-tip">${armPath([+tx.toFixed(1), +ty.toFixed(1), (tx + a[4]) / 2, (ty + a[5]) / 2, a[4], a[5]], thick)}</g>`;
    }
  }
  return { back, front };
}

// ---------- Настроения ----------

const MOODS = {
  happy: { eyes: 'open', brows: null, mouth: 'grin', pose: 'rest' },
  wow: { eyes: 'big', brows: 'up', mouth: 'o', pose: 'open' },
  sad: { eyes: 'sad', brows: 'sad', mouth: 'frown', pose: 'droop', extra: ['tear'] },
  win: { eyes: 'happy', brows: 'up', mouth: 'laugh', pose: 'up', extra: ['sparkles'] },
  think: { eyes: 'up', brows: 'think', mouth: 'hmm', pose: 'chin' },
  sleep: { eyes: 'closed', brows: 'soft', mouth: 'snore', pose: 'droop', extra: ['zzz'] },
  love: { eyes: 'heart', brows: 'up', mouth: 'cat', pose: 'cover', blush: 2, extra: ['hearts'] },
  laugh: { eyes: 'happy', brows: 'up', mouth: 'laugh', pose: 'belly', extra: ['joy'] },
  cool: { eyes: 'half', brows: 'flat', mouth: 'smirk', pose: 'hips' },
  angry: { eyes: 'angry', brows: 'angry', mouth: 'grit', pose: 'fists', extra: ['steam', 'vein'] },
  shy: { eyes: 'down', brows: 'sad', mouth: 'wavy', pose: 'cover', blush: 2 },
  confused: { eyes: 'odd', brows: 'think', mouth: 'wavy', pose: 'scratch', extra: ['question'] },
  cry: { eyes: 'squeeze', brows: 'sad', mouth: 'wail', pose: 'open', extra: ['streams'] },
  proud: { eyes: 'happy', brows: null, mouth: 'smile', pose: 'hips', extra: ['sparkles'] },
  dizzy: { eyes: 'spiral', brows: null, mouth: 'wavy', pose: 'droop', extra: ['stars'] },
  wink: { eyes: 'wink', brows: null, mouth: 'grin', pose: 'thumb' },
  scared: { eyes: 'tiny', brows: 'up', mouth: 'scared', pose: 'open', extra: ['sweat'] },
  starstruck: { eyes: 'star', brows: 'up', mouth: 'laugh', pose: 'up', extra: ['sparkles'] },
  sick: { eyes: 'half', brows: 'sad', mouth: 'flat', pose: 'droop', extra: ['sweat', 'thermo'] },
  ghost: { eyes: 'hollow', brows: null, mouth: 'o', pose: 'open' },
};
MOODS.neutral = MOODS.happy;
MOODS.lose = MOODS.sad;

/** Все настроения, которые умеет показывать Препи. */
export const MASCOT_MOODS = Object.keys(MOODS).filter((m) => m !== 'neutral' && m !== 'lose');
export const MASCOT_FORMS = ['buff', 'blaze', 'sick', 'ghost', 'tomb'];

// ---------- Мелочи вокруг ----------

const sparkle = (x, y, s, delay) =>
  `<path class="spark" style="animation-delay:${delay}s" d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z" fill="#facc15"/>`;

const EXTRAS = {
  tear: '<path class="tear" d="M99 86 Q103 94 99 97 Q95 94 99 86 Z" fill="#7dd3fc"/>',
  streams: `<g class="streams" fill="#7dd3fc" opacity=".9"><path d="M42 82 Q36 100 40 122 L46 122 Q44 100 48 84 Z"/><path d="M98 82 Q104 100 100 122 L94 122 Q96 100 92 84 Z"/></g>`,
  joy: `<g class="joy-drops" fill="#7dd3fc"><path d="M36 70 q-8 -2 -10 -8 q6 2 10 8 Z"/><path d="M104 70 q8 -2 10 -8 q-6 2 -10 8 Z"/></g>`,
  sparkles: sparkle(14, 40, 7, 0) + sparkle(126, 52, 6, 0.5) + sparkle(120, 118, 5, 1) + sparkle(20, 112, 5, 1.4),
  zzz: '<g class="zzz"><text x="104" y="40" font-size="16">z</text><text x="114" y="26" font-size="20">z</text><text x="126" y="10" font-size="24">Z</text></g>',
  hearts: `<g class="float-hearts">${heartAt(18, 46, 6, '#fb7185')}${heartAt(124, 38, 7, '#f43f5e')}${heartAt(112, 14, 5, '#fda4af')}</g>`,
  steam: `<g class="steam" fill="#fff" stroke="#cbd5e1" stroke-width="1.2"><path d="M20 44 q-6 -4 -2 -9 q1 -6 7 -5 q4 -5 9 -1 q6 0 5 6 q4 5 -2 8 Z"/><path d="M120 44 q6 -4 2 -9 q-1 -6 -7 -5 q-4 -5 -9 -1 q-6 0 -5 6 q-4 5 2 8 Z"/></g>`,
  vein: '<g class="vein" stroke="#ef4444" stroke-width="3" fill="none" stroke-linecap="round"><path d="M98 42 q4 4 8 0"/><path d="M98 52 q4 -4 8 0"/><path d="M96 44 q4 3 0 6"/><path d="M108 44 q-4 3 0 6"/></g>',
  question: `<text class="question" x="114" y="36" font-size="28" font-weight="900" fill="${INK}" text-anchor="middle">?</text>`,
  sweat: '<path class="sweat" d="M108 50 Q114 60 108 64 Q102 60 108 50 Z" fill="#7dd3fc" stroke="#38bdf8" stroke-width="1"/>',
  stars: `<g class="dizzy-stars">${starAt(40, 28, 6, '#facc15')}${starAt(100, 26, 5, '#fde047')}${starAt(70, 18, 4.5, '#facc15')}</g>`,
  thermo: `<g class="thermo" transform="rotate(18 72 102)"><rect x="70" y="99" width="28" height="5" rx="2.5" fill="#fff" stroke="#94a3b8" stroke-width="1"/><rect x="74" y="100.5" width="16" height="2" rx="1" fill="#ef4444"/><circle cx="97" cy="101.5" r="4" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/></g>`,
};

// ---------- Яркие эмоции: оттенок тела, фон за спиной и эффекты спереди ----------

const rays = (color, n = 12, r1 = 52, r2 = 74) =>
  `<g class="fx-rays" fill="${color}">${Array.from({ length: n }, (_, i) => {
    const a = (i * 2 * Math.PI) / n;
    const w = Math.PI / n / 1.6;
    const p = (ang, r) => `${(70 + r * Math.cos(ang)).toFixed(1)} ${(80 + r * Math.sin(ang)).toFixed(1)}`;
    return `<path d="M${p(a - w, r1)} L${p(a, r2)} L${p(a + w, r1)} Z"/>`;
  }).join('')}</g>`;
const glow = (color, r = 62, op = 0.22) =>
  `<g class="fx-glow">${[1, 0.8, 0.62].map((k, i) => `<circle cx="70" cy="80" r="${(r * k).toFixed(1)}" fill="${color}" opacity="${(op * (0.6 + i * 0.25)).toFixed(2)}"/>`).join('')}</g>`;
const burst = (color, stroke) =>
  `<path class="fx-burst" d="${Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI) / 8;
    const r = i % 2 ? 50 : 70;
    return `${i ? 'L' : 'M'}${(70 + r * Math.cos(a)).toFixed(1)} ${(80 + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ')} Z" fill="${color}" stroke="${stroke}" stroke-width="2" opacity=".55"/>`;
const confetti = `<g class="fx-confetti">${[[18, 8, '#f43f5e'], [40, 2, '#facc15'], [104, 4, '#22c55e'], [124, 12, '#38bdf8'], [8, 30, '#a855f7'], [132, 34, '#fb923c'], [62, -4, '#ec4899'], [86, -2, '#14b8a6']]
  .map(([x, y, c], i) => `<rect class="fx-c" x="${x}" y="${y}" width="5" height="8" rx="1.5" fill="${c}" style="animation-delay:${(i * 0.17).toFixed(2)}s"/>`)
  .join('')}</g>`;
const RAIN = `<g class="fx-rain"><g class="fx-cloud"><ellipse cx="112" cy="10" rx="18" ry="9" fill="#94a3b8"/><circle cx="102" cy="6" r="8" fill="#a5b4c8"/><circle cx="116" cy="2" r="10" fill="#a5b4c8"/><circle cx="126" cy="8" r="7" fill="#94a3b8"/></g>${[100, 110, 120, 130]
  .map((x, i) => `<path class="fx-drop" d="M${x} 20 q2 5 0 7 q-2 -2 0 -7 Z" fill="#60a5fa" style="animation-delay:${(i * 0.25).toFixed(2)}s"/>`)
  .join('')}</g>`;
const BULB = `<g class="fx-think"><circle cx="104" cy="42" r="3" fill="#fff" stroke="#c4b5fd" stroke-width="1.5"/><circle cx="112" cy="30" r="4.5" fill="#fff" stroke="#c4b5fd" stroke-width="1.5"/><circle cx="124" cy="12" r="11" fill="#fff" stroke="#c4b5fd" stroke-width="1.5"/>
  <g class="fx-bulb"><circle cx="124" cy="10" r="5.5" fill="#fde047" stroke="#ca8a04" stroke-width="1.2"/><rect x="121.5" y="14.5" width="5" height="4" rx="1" fill="#94a3b8"/><path d="M124 1 v-3 M116 6 l-2.5 -2 M132 6 l2.5 -2" stroke="#facc15" stroke-width="1.6" stroke-linecap="round"/></g></g>`;
const BANG = `<g class="fx-bang" fill="#f43f5e"><path d="M16 22 l5 -2 l-2 18 l-3 1 Z"/><circle cx="18.5" cy="45" r="2.6"/><path d="M122 18 l5 1 l-5 17 l-3 -1 Z"/><circle cx="118.5" cy="41" r="2.6"/></g>`;
const SHIVER = `<g class="fx-shiver" stroke="#60a5fa" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M10 64 q-4 6 0 12 q4 6 0 12"/><path d="M130 64 q4 6 0 12 q-4 6 0 12"/><path d="M3 70 q-3 4 0 8"/><path d="M137 70 q3 4 0 8"/></g>`;
const GLINT = `<path class="fx-glint" d="M104 46 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 Z" fill="#fff" stroke="#facc15" stroke-width="1"/>`;
const BIG_HEARTS = `<g class="fx-hearts">${heartAt(14, 40, 8, '#f43f5e')}${heartAt(128, 30, 9, '#fb7185')}${heartAt(118, 6, 6, '#fda4af')}${heartAt(26, 14, 5.5, '#f472b6')}${heartAt(6, 78, 5, '#fb7185')}</g>`;

/** Как ярко показывается каждое настроение: tint - оттенок всего тела, back - за спиной, front - спереди. */
const MOOD_FX = {
  happy: { back: glow('#fde68a', 60, 0.16) },
  win: { back: rays('#facc15') + glow('#fde047', 58, 0.2), front: confetti },
  starstruck: { back: rays('#fbbf24', 16) + glow('#fef08a', 60, 0.24), front: confetti },
  proud: { back: rays('#fde68a', 10, 54, 70) },
  laugh: { back: glow('#fde047', 60, 0.2) },
  love: { tint: ['#f472b6', 0.2], back: `<g class="fx-bigheart">${heartAt(70, 78, 52, '#fbcfe8')}</g>`, front: BIG_HEARTS },
  shy: { tint: ['#fb7185', 0.22] },
  angry: { tint: ['#ef4444', 0.28], back: glow('#f87171', 62, 0.26) },
  scared: { tint: ['#60a5fa', 0.22], back: glow('#bfdbfe', 60, 0.25), front: SHIVER },
  sad: { tint: ['#64748b', 0.18], front: RAIN },
  cry: { tint: ['#3b82f6', 0.16], front: RAIN },
  wow: { back: burst('#fef08a', '#facc15'), front: BANG },
  think: { front: BULB },
  cool: { back: glow('#a5f3fc', 58, 0.16), front: GLINT },
  wink: { front: GLINT },
  dizzy: { tint: ['#a3e635', 0.12] },
  confused: { back: glow('#ddd6fe', 58, 0.2) },
};

/** Веки рисуются цветом тела - при оттенке эмоции их нужно подкрасить так же, иначе останутся светлые пятна. */
function tintLids(html, id, tint) {
  if (!tint) return html;
  return html.replace(new RegExp(`<path d="([^"]+)" fill="url\\(#${id}b\\)"/>`, 'g'), (m, d) => `${m}<path d="${d}" fill="${tint[0]}" opacity="${tint[1]}"/>`);
}

// ---------- Формы (по серии) ----------

const ABS = `<g class="abs" stroke="var(--mascot-2)" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55"><path d="M58 109 q4 3 8 0 M74 109 q4 3 8 0 M59 116 q3.5 2.5 7 0 M74 116 q3.5 2.5 7 0 M61 122 q3 2 6 0 M73 122 q3 2 6 0"/><path d="M70 106 V124"/></g>`;
const SWEATBAND = `<g class="sweatband"><path d="M24 64 Q70 40 116 64 L116 73 Q70 50 24 73 Z" fill="#ef4444"/><path d="M25 68 Q70 45 115 68" stroke="#fff" stroke-width="2.4" fill="none"/></g>`;
const ICEPACK = `<g class="icepack" transform="rotate(-12 70 34)"><path d="M46 38 Q46 22 70 20 Q94 22 94 38 Q70 44 46 38 Z" fill="#60a5fa"/><path d="M52 30 Q70 25 88 30" stroke="#fff" stroke-width="2.5" fill="none" opacity=".7"/><rect x="66" y="16" width="8" height="6" rx="2" fill="#2563eb"/></g>`;
const BANDAGE = `<g class="bandage" transform="rotate(-24 104 96)"><rect x="94" y="92" width="20" height="8" rx="3" fill="#fde68a" stroke="#d6b26e" stroke-width="1"/><rect x="101" y="92" width="6" height="8" fill="#fef3c7"/></g>`;
const BLAZE_BACK = `<g class="blaze-fire">
    <circle cx="70" cy="80" r="60" fill="#fb923c" opacity=".25" class="blaze-glow"/>
    <path class="flame-a" d="M28 70 Q18 40 34 20 Q34 38 44 40 Q40 14 58 -2 Q60 20 70 26 Q76 6 90 -4 Q90 18 98 32 Q106 18 112 16 Q124 40 112 70 Z" fill="#f97316"/>
    <path class="flame-b" d="M38 66 Q32 44 42 30 Q44 42 52 44 Q50 24 62 12 Q66 30 72 34 Q78 18 88 10 Q90 28 96 38 Q102 30 106 28 Q114 46 104 66 Z" fill="#facc15"/>
  </g>`;
const EMBERS = `<g class="embers" fill="#fb923c">${[[16, 40], [124, 30], [10, 90], [130, 84], [104, 6], [36, 10]].map(([x, y], i) => `<circle class="ember" cx="${x}" cy="${y}" r="${2 + (i % 3)}" style="animation-delay:${(i * 0.3).toFixed(1)}s"/>`).join('')}</g>`;
const GHOST_BODY = 'M22 80 A48 48 0 0 1 118 80 L118 122 Q110 136 102 124 Q94 136 86 124 Q78 136 70 124 Q62 136 54 124 Q46 136 38 124 Q30 136 22 122 Z';
const TOMB = `<g class="tomb">
    <path d="M30 150 L30 112 Q30 88 70 88 Q110 88 110 112 L110 150 Z" fill="#9ca3af" stroke="#6b7280" stroke-width="2.5"/>
    <path d="M36 148 L36 113 Q36 94 70 94 Q104 94 104 113 L104 148" fill="none" stroke="#d1d5db" stroke-width="2" opacity=".7"/>
    <text x="70" y="121" text-anchor="middle" font-size="17" font-weight="900" fill="#4b5563" letter-spacing="1">RIP</text>
    <path d="M62 128 Q66 134 64 140 Q60 137 62 128 Z M76 128 Q80 134 78 140 Q74 137 76 128 Z" fill="#6b7280" opacity=".55"/>
    <path d="M98 100 L93 108 L98 113 L95 121" stroke="#6b7280" stroke-width="1.6" fill="none"/>
    <path d="M20 150 Q24 140 28 150 Q32 138 36 150 M104 150 Q108 140 112 150 Q116 136 120 150" stroke="#22c55e" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>`;

// ---------- Сборка ----------

/**
 * Препи целиком (SVG). mood - настроение, cls - CSS-классы, outfit - наряд по слотам (по умолчанию - надетый),
 * opts.form - форма по серии, opts.pose - поза рук вместо позы настроения, opts.emote - танец/эмоция (CSS-анимация).
 */
export function mascot(mood = 'happy', cls = '', outfit = getOutfit(), opts = {}) {
  const id = `pp${++uid}`;
  const emote = opts.emote ? EMOTES[opts.emote] : null;
  if (emote?.mood) mood = emote.mood;
  if (emote?.pose) opts = { ...opts, pose: emote.pose };
  const form = opts.form ?? (mood === 'ghost' ? 'ghost' : mood === 'sick' ? 'sick' : null);
  const faceMood = form === 'tomb' ? 'ghost' : form === 'ghost' ? (mood === 'ghost' ? 'ghost' : mood) : mood;
  const m = MOODS[faceMood] ?? MOODS.happy;
  const palette = COLORS[outfit.color];
  const colorStyle = palette ? ` style="--mascot-hi:${palette[0]};--mascot-1:${palette[1]};--mascot-2:${palette[2]}"` : '';
  const ghosty = form === 'ghost' || form === 'tomb';
  const buff = form === 'buff';
  const held = HAND[outfit.hand] ?? '';
  const poseId = opts.pose ?? (buff ? 'flex' : m.pose);
  const { back: armsBack, front: armsFront } = arms(poseId, { buff, holding: emote ? null : held || null, sleeves: SLEEVES[outfit.body] ?? null });
  const head = outfit.head === 'cap' ? CAP : (HEAD[outfit.head] ?? '');
  const formHead = head ? '' : buff ? SWEATBAND : form === 'sick' ? ICEPACK : '';
  const blush = m.blush === 2
    ? `<g class="blush is-strong"><ellipse cx="38" cy="94" rx="9" ry="5.5" fill="#ff6b9d" opacity=".7"/><ellipse cx="102" cy="94" rx="9" ry="5.5" fill="#ff6b9d" opacity=".7"/><path d="M33 92 l3 -3 M38 93 l3 -3 M97 92 l3 -3 M102 93 l3 -3" stroke="#e11d48" stroke-width="1.4" stroke-linecap="round" opacity=".6"/></g>`
    : `<g class="blush"><ellipse cx="38" cy="94" rx="7.5" ry="4.5" fill="#ff8fb8" opacity=".5"/><ellipse cx="102" cy="94" rx="7.5" ry="4.5" fill="#ff8fb8" opacity=".5"/></g>`;
  const extras = (m.extra ?? []).filter((e) => !(e === 'thermo' && outfit.face));
  // Эффекты эмоций: на маленьких Препи (в задании, на пути уровней) и во время танцев их нет, чтобы не мешали.
  const fxOn = !emote && opts.fx !== false && !/mascot-(xs|path|thumb)/.test(cls);
  const FX = MOOD_FX[faceMood] ?? {};

  const bodyShape = ghosty
    ? `<path d="${GHOST_BODY}" fill="url(#${id}b)"/><path d="${GHOST_BODY}" fill="url(#${id}d)"/><path d="${GHOST_BODY}" fill="none" stroke="var(--mascot-2)" stroke-width="2" opacity=".5"/>`
    : `<circle cx="70" cy="80" r="48" fill="url(#${id}b)"/>
      <circle cx="70" cy="80" r="48" fill="url(#${id}d)"/>
      <circle cx="70" cy="80" r="47" fill="none" stroke="var(--mascot-2)" stroke-width="2" opacity=".55"/>
      <path d="M31 104 A46 46 0 0 0 64 125.6" stroke="var(--mascot-hi)" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>`;

  const feet = ghosty
    ? ''
    : FEET[outfit.feet] ??
      `<g class="feet"><ellipse cx="57" cy="128.5" rx="10" ry="5.5" fill="url(#${id}f)" stroke="var(--mascot-2)" stroke-width="1.4"/><ellipse cx="83" cy="128.5" rx="10" ry="5.5" fill="url(#${id}f)" stroke="var(--mascot-2)" stroke-width="1.4"/></g>`;

  const body = `<g class="mascot-body">
      ${form === 'blaze' ? BLAZE_BACK : ''}
      ${BACK[outfit.back] ?? ''}
      <g transform="rotate(-9 70 112)"><path class="ring-back" d="M6 112 A64 13 0 0 1 134 112" fill="none" stroke="url(#${id}r)" stroke-width="4.5" opacity=".55"/></g>
      ${armsBack}
      ${feet}
      ${bodyShape}
      <ellipse cx="50" cy="54" rx="17" ry="10" transform="rotate(-28 50 54)" fill="url(#${id}s)"/>
      <path d="M33 70 A40 40 0 0 1 52 40" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".35"/>
      <circle cx="38" cy="72" r="2.4" fill="#fff" opacity=".7"/>
      ${buff && !BODY[outfit.body] ? ABS : ''}
      ${BODY[outfit.body] ? `<clipPath id="${id}c"><circle cx="70" cy="80" r="48"/></clipPath><g class="wear-body" clip-path="url(#${id}c)">${BODY[outfit.body]}</g>` : ''}
      ${fxOn && FX.tint && !ghosty ? `<circle class="mood-tint" cx="70" cy="80" r="48" fill="${FX.tint[0]}" opacity="${FX.tint[1]}"/>` : ''}
      ${blush}
      <g class="face">${tintLids(eyes(id, m.eyes), id, fxOn && !ghosty ? FX.tint : null)}${browsHtml(m.brows)}${mouthHtml(id, m.mouth)}</g>
      ${form === 'sick' ? '<circle class="sick-tint" cx="70" cy="80" r="48" fill="#a3e635" opacity=".26"/>' : ''}
      ${form === 'sick' && !outfit.face ? BANDAGE : ''}
      <g transform="rotate(-9 70 112)"><path class="ring-front" d="M6 112 A64 13 0 0 0 134 112" fill="none" stroke="url(#${id}r)" stroke-width="4.5"/></g>
      ${NECK[outfit.neck] ?? ''}
      ${FACE[outfit.face] ?? ''}
      ${head}${formHead}
      ${armsFront}
      ${extras.map((e) => EXTRAS[e] ?? '').join('')}
      ${fxOn ? FX.front ?? '' : ''}
      ${emote?.props ?? ''}
    </g>`;

  const formCls = form ? ` form-${form}` : '';
  const emoteCls = opts.emote ? ` emote emote-${opts.emote}` : '';
  return `<svg class="mascot mascot-${faceMood}${formCls}${emoteCls} ${cls}" viewBox="0 0 140 150" aria-hidden="true"${colorStyle}>
    <defs>
      <radialGradient id="${id}b" gradientUnits="userSpaceOnUse" cx="56" cy="60" r="78">
        <stop offset="0" style="stop-color:var(--mascot-hi)"/>
        <stop offset=".5" style="stop-color:var(--mascot-1)"/>
        <stop offset="1" style="stop-color:var(--mascot-2)"/>
      </radialGradient>
      <radialGradient id="${id}d" gradientUnits="userSpaceOnUse" cx="70" cy="80" r="50" fx="58" fy="62">
        <stop offset=".62" style="stop-color:var(--mascot-2)" stop-opacity="0"/>
        <stop offset="1" style="stop-color:var(--mascot-2)" stop-opacity=".55"/>
      </radialGradient>
      <radialGradient id="${id}s" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#fff" stop-opacity=".95"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id}i" cx=".4" cy=".35" r=".7">
        <stop offset="0" stop-color="#8b7bff"/><stop offset=".6" stop-color="#4c35d4"/><stop offset="1" stop-color="${INK}"/>
      </radialGradient>
      <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color:var(--mascot-1)"/><stop offset="1" style="stop-color:var(--mascot-2)"/>
      </linearGradient>
      <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fde68a"/><stop offset=".5" stop-color="#facc15"/><stop offset="1" stop-color="#f59e0b"/>
      </linearGradient>
    </defs>
    <ellipse class="mascot-shadow" cx="70" cy="143" rx="34" ry="5" fill="#000" opacity="${ghosty ? 0.07 : 0.14}"/>
    ${auraBack(outfit.aura)}
    ${fxOn && form !== 'tomb' ? FX.back ?? '' : ''}
    ${form === 'tomb' ? `<g class="tomb-ghost" transform="translate(27 -14) scale(.62)">${body}</g>${TOMB}` : body}
    ${form === 'tomb' ? '' : auraFront(outfit.aura)}
    ${form === 'tomb' ? '' : petSvg(outfit.pet)}
    ${form === 'blaze' ? EMBERS : ''}
    ${emote?.scene ?? ''}
  </svg>`;
}

export const LOGO = `<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
  <defs><radialGradient id="logo-g" cx=".35" cy=".3" r=".8"><stop offset="0" style="stop-color:var(--mascot-hi)"/><stop offset=".55" style="stop-color:var(--mascot-1)"/><stop offset="1" style="stop-color:var(--mascot-2)"/></radialGradient></defs>
  <rect width="32" height="32" rx="10" fill="url(#logo-g)"/>
  <path d="M12.5 9.5v13l10.5-6.5z" fill="#fff"/>
  <circle cx="25.5" cy="7.5" r="3.5" fill="#facc15"/>
</svg>`;
