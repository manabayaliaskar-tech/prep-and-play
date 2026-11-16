// Маскот Prep&Play — Препи: объёмный светящийся шар с орбитальным кольцом и выпускной шапочкой.
// Цвета берутся из темы (--mascot-hi, --mascot-1, --mascot-2), поэтому Препи меняется вместе с оформлением.
// Глаза моргают и следят за курсором (переменные --lx/--ly задаёт ui/motion.js).
// Настроения: happy, wow, sad, win, think.

import { COLORS, getOutfit } from '../core/wardrobe.js';

const INK = '#22164f';
let uid = 0;

const eye = (cx, cy, ry = 13) => `
  <g class="eye">
    <ellipse cx="${cx}" cy="${cy}" rx="11" ry="${ry}" fill="#fff"/>
    <g class="pupils">
      <ellipse cx="${cx + 1}" cy="${cy + 2}" rx="6.4" ry="${ry * 0.6}" fill="${INK}"/>
      <circle cx="${cx + 3.6}" cy="${cy - 2.4}" r="2.6" fill="#fff"/>
      <circle cx="${cx - 2}" cy="${cy + 5}" r="1.2" fill="#fff" opacity=".8"/>
    </g>
  </g>`;

const EYES = {
  open: eye(53, 76) + eye(87, 76),
  big: eye(53, 75, 15) + eye(87, 75, 15),
  happy: `
    <path d="M43 79 Q53 66 63 79" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M77 79 Q87 66 97 79" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  up: `
    <g class="eye"><ellipse cx="53" cy="76" rx="11" ry="13" fill="#fff"/><ellipse cx="55" cy="70" rx="6" ry="7.5" fill="${INK}"/><circle cx="57.5" cy="67" r="2.4" fill="#fff"/></g>
    <g class="eye"><ellipse cx="87" cy="76" rx="11" ry="13" fill="#fff"/><ellipse cx="89" cy="70" rx="6" ry="7.5" fill="${INK}"/><circle cx="91.5" cy="67" r="2.4" fill="#fff"/></g>`,
};

const BROWS = {
  wow: `<path d="M43 56 Q52 50 61 55" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M79 55 Q88 50 97 56" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
  sad: `<path d="M44 62 L61 57" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><path d="M79 57 L96 62" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
  think: `<path d="M44 58 Q52 55 61 58" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M79 54 Q88 49 97 55" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
};

const MOUTHS = {
  happy: `<path d="M58 97 Q70 108 82 97" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`,
  wow: `<ellipse cx="70" cy="101" rx="6" ry="7.5" fill="${INK}"/><ellipse cx="70" cy="104" rx="3.4" ry="2.6" fill="#ff7aa8"/>`,
  sad: `<path d="M59 105 Q70 96 81 105" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`,
  win: `<path d="M54 94 Q70 118 86 94 Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M61 104 Q70 112 79 104 Q70 99 61 104 Z" fill="#ff7aa8"/>`,
  think: `<path d="M61 101 Q68 98 79 100" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`,
};

const sparkle = (x, y, s, delay) =>
  `<path class="spark" style="animation-delay:${delay}s" d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z" fill="#facc15"/>`;

// Наряды Препи по слотам (см. core/wardrobe.js): голова, лицо, шея, спина и цвет шара.
const CAP = `
      <g class="cap" transform="rotate(-10 70 30)">
        <path d="M50 30 L50 40 Q70 49 90 40 L90 30 L70 37 Z" fill="${'#22164f'}"/>
        <path d="M70 13 L108 26 L70 39 L32 26 Z" fill="${'#22164f'}"/>
        <path d="M70 15 L102 26 L70 22 L38 26 Z" fill="#fff" opacity=".14"/>
        <g class="tassel"><path d="M70 26 L101 28 L102 44" stroke="#facc15" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="102" cy="47" r="4.4" fill="#facc15"/></g>
      </g>`;
const HEAD = {
  crown: `<g class="wear-crown"><path d="M44 42 L47 16 L58 29 L70 10 L82 29 L93 16 L96 42 Z" fill="#facc15" stroke="#f59e0b" stroke-width="2.5" stroke-linejoin="round"/><circle cx="70" cy="33" r="4" fill="#ef4444"/><circle cx="55" cy="36" r="3" fill="#3b82f6"/><circle cx="85" cy="36" r="3" fill="#22c55e"/></g>`,
  bow: `<g class="wear-bow" transform="rotate(14 98 38)"><path d="M98 38 L80 26 Q76 38 80 50 Z" fill="#ec4899"/><path d="M98 38 L116 26 Q120 38 116 50 Z" fill="#ec4899"/><circle cx="98" cy="38" r="6" fill="#be185d"/></g>`,
  headphones: `<g class="wear-headphones"><path d="M24 80 Q24 24 70 24 Q116 24 116 80" stroke="#1e293b" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="14" y="66" width="18" height="30" rx="8" fill="#7c3aed"/><rect x="108" y="66" width="18" height="30" rx="8" fill="#7c3aed"/></g>`,
  astro: `<g class="wear-astro"><circle cx="70" cy="80" r="60" fill="#bae6fd" fill-opacity=".18" stroke="#e2e8f0" stroke-width="4"/><path d="M36 50 Q48 32 68 28" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/><line x1="70" y1="20" x2="70" y2="8" stroke="#94a3b8" stroke-width="3"/><circle cx="70" cy="7" r="4" fill="#ef4444"/></g>`,
  party: `<g class="wear-party" transform="rotate(12 74 30)"><path d="M56 40 L74 2 L92 40 Z" fill="#a855f7"/><path d="M62 28 L86 28 M66 18 L82 18" stroke="#facc15" stroke-width="4"/><circle cx="74" cy="3" r="6" fill="#facc15"/><ellipse cx="74" cy="40" rx="20" ry="4" fill="#7e22ce"/></g>`,
  beret: `<g class="wear-beret" transform="rotate(-8 70 34)"><ellipse cx="70" cy="36" rx="36" ry="12" fill="#7c3aed"/><ellipse cx="66" cy="30" rx="26" ry="9" fill="#8b5cf6"/><rect x="68" y="18" width="5" height="9" rx="2" fill="#5b21b6"/></g>`,
  laurel: `<g class="wear-laurel" fill="#16a34a">${[[30, 66], [33, 54], [39, 44], [47, 36], [57, 31], [83, 31], [93, 36], [101, 44], [107, 54], [110, 66]]
    .map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="4" transform="rotate(${i < 5 ? -50 + i * 12 : 50 - (i - 5) * 12} ${x} ${y})"/>`)
    .join('')}<circle cx="70" cy="30" r="4" fill="#facc15"/></g>`,
  wizard: `<g class="wear-wizard" transform="rotate(-8 70 30)"><path d="M46 40 L74 -4 L96 40 Z" fill="#1e3a8a"/><ellipse cx="71" cy="40" rx="32" ry="7" fill="#1e40af"/><path d="M70 14 l2 5 l5 0 l-4 3 l2 5 l-5 -3 l-5 3 l2 -5 l-4 -3 l5 0 Z" fill="#facc15"/><circle cx="82" cy="28" r="2" fill="#fde68a"/></g>`,
  halo: `<g class="wear-halo"><ellipse cx="70" cy="20" rx="26" ry="7" fill="none" stroke="#facc15" stroke-width="5"/><ellipse cx="70" cy="20" rx="26" ry="7" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/></g>`,
};
const FACE = {
  glasses: `<g class="wear-glasses"><circle cx="53" cy="76" r="14" fill="#fff" fill-opacity=".12" stroke="#22164f" stroke-width="3.2"/><circle cx="87" cy="76" r="14" fill="#fff" fill-opacity=".12" stroke="#22164f" stroke-width="3.2"/><path d="M67 75 Q70 71 73 75" stroke="#22164f" stroke-width="3" fill="none"/></g>`,
  sunglasses: `<g class="wear-sunglasses"><rect x="38" y="66" width="30" height="20" rx="8" fill="#0f172a"/><rect x="72" y="66" width="30" height="20" rx="8" fill="#0f172a"/><path d="M68 72 L72 72" stroke="#0f172a" stroke-width="4"/><path d="M43 70 L52 70" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".6"/><path d="M77 70 L86 70" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".6"/></g>`,
  starglasses: `<g class="wear-starglasses" fill="#f472b6" fill-opacity=".85" stroke="#be185d" stroke-width="2">${[53, 87]
    .map((x) => `<path d="M${x} 60 L${x + 4.5} 71 L${x + 16} 71 L${x + 7} 78 L${x + 10.5} 90 L${x} 83 L${x - 10.5} 90 L${x - 7} 78 L${x - 16} 71 L${x - 4.5} 71 Z"/>`)
    .join('')}</g>`,
  mustache: `<path class="wear-mustache" d="M54 93 Q62 85 70 91 Q78 85 86 93 Q80 99 70 95 Q60 99 54 93 Z" fill="#22164f"/>`,
};
const NECK = {
  scarf: `<g class="wear-scarf"><path d="M32 106 Q70 128 108 106 L106 118 Q70 140 34 118 Z" fill="#ef4444"/><path d="M88 120 L96 142 L85 144 L80 123 Z" fill="#dc2626"/><path d="M40 112 Q70 130 100 112" stroke="#fff" stroke-width="2" stroke-dasharray="4 5" fill="none" opacity=".6"/></g>`,
  bowtie: `<g class="wear-bowtie"><path d="M70 122 L54 113 L54 131 Z" fill="#ef4444"/><path d="M70 122 L86 113 L86 131 Z" fill="#ef4444"/><circle cx="70" cy="122" r="4.5" fill="#b91c1c"/></g>`,
  medal: `<g class="wear-medal"><path d="M58 100 L70 122 L82 100" stroke="#3b82f6" stroke-width="5" fill="none"/><circle cx="70" cy="128" r="9" fill="#facc15" stroke="#f59e0b" stroke-width="2"/><text x="70" y="132" text-anchor="middle" font-size="10" font-weight="900" fill="#92400e">1</text></g>`,
  chain: `<g class="wear-chain"><path d="M38 108 Q70 134 102 108" stroke="#facc15" stroke-width="3.5" stroke-dasharray="2 4" stroke-linecap="round" fill="none"/><path d="M70 120 L76 128 L70 136 L64 128 Z" fill="#38bdf8" stroke="#0ea5e9" stroke-width="1.5"/></g>`,
};
const BACK = {
  cape: `<path class="wear-cape" d="M34 92 Q16 140 36 146 L104 146 Q124 140 106 92 Z" fill="#dc2626"/>`,
  wings: `<g class="wear-wings" fill="#fff" stroke="#cbd5e1" stroke-width="2"><path class="wing-l" d="M30 80 Q-4 46 4 98 Q18 92 30 100 Z"/><path class="wing-r" d="M110 80 Q144 46 136 98 Q122 92 110 100 Z"/></g>`,
  sword: `<g class="wear-sword" transform="rotate(24 118 90)"><rect x="115" y="34" width="8" height="64" rx="3" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/><rect x="107" y="96" width="24" height="6" rx="3" fill="#b45309"/><rect x="116" y="102" width="6" height="14" rx="2" fill="#78350f"/></g>`,
  backpack: `<g class="wear-backpack"><rect x="6" y="64" width="34" height="48" rx="11" fill="#f97316"/><rect x="11" y="86" width="22" height="16" rx="5" fill="#fb923c"/></g>`,
};

export function mascot(mood = 'happy', cls = '') {
  const outfit = getOutfit();
  const id = `pp${++uid}`;
  const palette = COLORS[outfit.color];
  const colorStyle = palette ? ` style="--mascot-hi:${palette[0]};--mascot-1:${palette[1]};--mascot-2:${palette[2]}"` : '';
  const eyes = mood === 'win' ? EYES.happy : mood === 'wow' ? EYES.big : mood === 'think' ? EYES.up : EYES.open;
  const mouth = MOUTHS[mood] ?? MOUTHS.happy;
  return `<svg class="mascot mascot-${mood} ${cls}" viewBox="0 0 140 150" aria-hidden="true"${colorStyle}>
    <defs>
      <radialGradient id="${id}b" cx=".36" cy=".3" r=".78">
        <stop offset="0" style="stop-color:var(--mascot-hi)"/>
        <stop offset=".5" style="stop-color:var(--mascot-1)"/>
        <stop offset="1" style="stop-color:var(--mascot-2)"/>
      </radialGradient>
      <radialGradient id="${id}s" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#fff" stop-opacity=".95"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fde68a"/><stop offset=".5" stop-color="#facc15"/><stop offset="1" stop-color="#f59e0b"/>
      </linearGradient>
    </defs>
    <ellipse class="mascot-shadow" cx="70" cy="143" rx="34" ry="5" fill="#000" opacity=".14"/>
    <g class="mascot-body">
      ${BACK[outfit.back] ?? ''}
      <g transform="rotate(-9 70 112)"><path class="ring-back" d="M6 112 A64 13 0 0 1 134 112" fill="none" stroke="url(#${id}r)" stroke-width="5" opacity=".55"/></g>
      <circle cx="70" cy="80" r="48" fill="url(#${id}b)"/>
      <circle cx="70" cy="80" r="46.5" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>
      <ellipse cx="50" cy="54" rx="17" ry="10" transform="rotate(-28 50 54)" fill="url(#${id}s)"/>
      <circle cx="38" cy="72" r="2.6" fill="#fff" opacity=".7"/>
      <ellipse cx="40" cy="93" rx="7" ry="4.5" fill="#ff8fb8" opacity=".5"/>
      <ellipse cx="100" cy="93" rx="7" ry="4.5" fill="#ff8fb8" opacity=".5"/>
      ${BROWS[mood] ?? ''}
      <g class="face">${eyes}</g>
      ${mouth}
      ${mood === 'sad' ? '<path class="tear" d="M98 84 Q102 92 98 95 Q94 92 98 84 Z" fill="#7dd3fc"/>' : ''}
      ${NECK[outfit.neck] ?? ''}
      ${FACE[outfit.face] ?? ''}
      <g transform="rotate(-9 70 112)"><path class="ring-front" d="M6 112 A64 13 0 0 0 134 112" fill="none" stroke="url(#${id}r)" stroke-width="5"/></g>
${outfit.head === 'cap' ? CAP : (HEAD[outfit.head] ?? '')}
    </g>
    ${mood === 'win' ? sparkle(14, 40, 7, 0) + sparkle(126, 52, 6, 0.5) + sparkle(120, 118, 5, 1) + sparkle(20, 112, 5, 1.4) : ''}
  </svg>`;
}

export const LOGO = `<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
  <defs><radialGradient id="logo-g" cx=".35" cy=".3" r=".8"><stop offset="0" style="stop-color:var(--mascot-hi)"/><stop offset=".55" style="stop-color:var(--mascot-1)"/><stop offset="1" style="stop-color:var(--mascot-2)"/></radialGradient></defs>
  <rect width="32" height="32" rx="10" fill="url(#logo-g)"/>
  <path d="M12.5 9.5v13l10.5-6.5z" fill="#fff"/>
  <circle cx="25.5" cy="7.5" r="3.5" fill="#facc15"/>
</svg>`;
