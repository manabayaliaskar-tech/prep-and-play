// Рисунки вещей Препи по слотам. Все координаты - в системе Препи: viewBox 0 0 140 150,
// тело - круг с центром (70, 80) и радиусом 48, глаза в (53, 76) и (87, 76), рот около (70, 100),
// ступни - овалы в (55, 130) и (85, 130). Подробнее о слотах - в комментариях к BODY, FEET и HAND ниже.

import { BACK_MORE, BODY_ART, FEET_ART } from './wear-outfit.js';
import { FACE_MORE, HAND_ART, HEAD_MORE, NECK_MORE } from './wear-extra.js';

const INK = '#22164f';

// Наряды Препи по слотам (см. core/wardrobe.js): голова, лицо, шея, спина и цвет шара.
export const CAP = `
      <g class="cap" transform="rotate(-10 70 30)">
        <path d="M50 30 L50 40 Q70 49 90 40 L90 30 L70 37 Z" fill="${'#22164f'}"/>
        <path d="M70 13 L108 26 L70 39 L32 26 Z" fill="${'#22164f'}"/>
        <path d="M70 15 L102 26 L70 22 L38 26 Z" fill="#fff" opacity=".14"/>
        <g class="tassel"><path d="M70 26 L101 28 L102 44" stroke="#facc15" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="102" cy="47" r="4.4" fill="#facc15"/></g>
      </g>`;
// Костюм ведущего квиза (не продаётся в магазине): смокинг с бабочкой и ручка с микрофоном.
const HOST_SUIT = `<g class="host-suit">
    <path d="M30.7 107.5 L56 105 L70 123 L84 105 L109.3 107.5 A48 48 0 0 1 30.7 107.5 Z" fill="#1e1b4b"/>
    <path d="M56 105 L70 123 L84 105 Z" fill="#fff"/>
    <path d="M56 105 L63 105 L70 119 L67 121 Z M84 105 L77 105 L70 119 L73 121 Z" fill="#3730a3"/>
    <path d="M38 113 L46 111 L44 118 Z" fill="#fff"/>
    <path d="M70 109 L59 103 L59 115 Z M70 109 L81 103 L81 115 Z" fill="#e11d48"/>
    <circle cx="70" cy="109" r="3.6" fill="#9f1239"/>
    <circle cx="70" cy="121" r="1.6" fill="#1e1b4b"/>
  </g>`;
const HOST_HAT = `<g class="host-hat" transform="rotate(-9 70 36)">
    <ellipse cx="70" cy="37" rx="27" ry="6.5" fill="#111827"/>
    <path d="M54 37 L56 6 Q70 2 84 6 L86 37 Z" fill="#1f2937"/>
    <path d="M55.2 27 Q70 30 84.8 27 L85.4 33 Q70 36 54.6 33 Z" fill="#e11d48"/>
    <path d="M60 9 L61.5 30" stroke="#fff" stroke-opacity=".22" stroke-width="3" stroke-linecap="round"/>
    <path d="M78 15 l1.4 3 l3.2 .3 l-2.4 2.1 l.8 3.2 l-3 -1.8 l-3 1.8 l.8 -3.2 l-2.4 -2.1 l3.2 -.3 Z" fill="#facc15"/>
  </g>`;

export const HEAD = {
  'host-hat': HOST_HAT,
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
  nightcap: `<g class="wear-nightcap" transform="rotate(-6 70 34)"><path d="M38 40 Q46 6 84 10 Q112 14 118 46 Q104 30 94 40 Z" fill="#2563eb"/><path d="M38 40 Q70 30 96 40" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="118" cy="48" r="7" fill="#fff"/><path d="M60 22 l1.5 3.5 l3.5 0.3 l-2.7 2.3 l0.9 3.6 l-3.2 -2 l-3.2 2 l0.9 -3.6 l-2.7 -2.3 l3.5 -0.3 Z" fill="#facc15"/></g>`,
  cowboy: `<g class="wear-cowboy" transform="rotate(-6 70 32)"><ellipse cx="70" cy="37" rx="46" ry="8" fill="#92400e"/><path d="M47 37 Q48 8 62 13 Q70 19 78 13 Q92 8 93 37 Z" fill="#b45309"/><path d="M49 30 Q70 35 91 30" stroke="#78350f" stroke-width="4" fill="none"/></g>`,
  chef: `<g class="wear-chef" stroke="#cbd5e1" stroke-width="1.5"><rect x="50" y="22" width="40" height="17" rx="3" fill="#fff"/><circle cx="54" cy="18" r="11" fill="#fff"/><circle cx="86" cy="18" r="11" fill="#fff"/><circle cx="70" cy="11" r="13" fill="#fff"/><path d="M56 26 V36 M70 26 V36 M84 26 V36" stroke="#e2e8f0"/></g>`,
  bunny: `<g class="wear-bunny">${[[52, -12], [88, 12]].map(([x, r]) => `<g transform="rotate(${r} ${x} 22)"><ellipse cx="${x}" cy="18" rx="9.5" ry="24" fill="#fff" stroke="#e2e8f0" stroke-width="2"/><ellipse cx="${x}" cy="20" rx="4.5" ry="16" fill="#fbcfe8"/></g>`).join('')}</g>`,
  catears: `<g class="wear-catears"><path d="M30 56 L36 18 L62 38 Z" fill="#334155"/><path d="M36 48 L39 27 L54 39 Z" fill="#f9a8d4"/><path d="M110 56 L104 18 L78 38 Z" fill="#334155"/><path d="M104 48 L101 27 L86 39 Z" fill="#f9a8d4"/></g>`,
  flowers: `<g class="wear-flowers">${[[34, 54, '#f472b6'], [41, 41, '#facc15'], [53, 32, '#a78bfa'], [70, 28, '#fb7185'], [87, 32, '#38bdf8'], [99, 41, '#f472b6'], [106, 54, '#facc15']]
    .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${c}"/><circle cx="${x}" cy="${y}" r="2.4" fill="#fff7ed"/>`)
    .join('')}</g>`,
  ninja: `<g class="wear-ninja"><path d="M24 58 Q70 38 116 58 L116 67 Q70 47 24 67 Z" fill="#dc2626"/><rect x="62" y="45" width="16" height="10" rx="2" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/><path class="ninja-tail" d="M114 61 Q130 60 138 72 M114 64 Q126 72 128 88" stroke="#dc2626" stroke-width="5" fill="none" stroke-linecap="round"/></g>`,
  tophat: `<g class="wear-tophat" transform="rotate(-8 70 30)"><rect x="50" y="0" width="40" height="34" rx="4" fill="#1e1b4b"/><rect x="50" y="23" width="40" height="7" fill="#dc2626"/><ellipse cx="70" cy="35" rx="31" ry="6.5" fill="#1e1b4b"/><rect x="54" y="3" width="6" height="18" rx="3" fill="#fff" opacity=".18"/></g>`,
  pirate: `<g class="wear-pirate" transform="rotate(-6 70 30)"><path d="M26 39 Q34 6 70 9 Q106 6 114 39 Q93 28 70 34 Q47 28 26 39 Z" fill="#111827"/><path d="M29 37 Q48 29 70 35 Q92 29 111 37" stroke="#facc15" stroke-width="2.5" fill="none"/><circle cx="70" cy="21" r="6" fill="#fff"/><circle cx="67.8" cy="20" r="1.5" fill="#111827"/><circle cx="72.2" cy="20" r="1.5" fill="#111827"/><path d="M63 29 L77 23 M63 23 L77 29" stroke="#fff" stroke-width="2"/></g>`,
  santa: `<g class="wear-santa" transform="rotate(10 74 30)"><path d="M42 40 Q50 2 88 7 Q110 12 118 34 L106 30 Q96 18 86 26 L98 40 Z" fill="#dc2626"/><rect x="37" y="33" width="64" height="12" rx="6" fill="#fff"/><circle cx="118" cy="36" r="7.5" fill="#fff"/></g>`,
  propeller: `<g class="wear-propeller"><path d="M36 43 Q38 14 70 14 Q102 14 104 43 Z" fill="#2563eb"/><path d="M53 16 Q58 30 70 14 Q82 30 87 16" fill="#ef4444"/><path d="M36 43 Q70 36 104 43" stroke="#facc15" stroke-width="4" fill="none"/><rect x="68" y="4" width="4" height="11" fill="#475569"/><g class="propeller-blades"><ellipse cx="59" cy="4" rx="11" ry="3.2" fill="#ef4444"/><ellipse cx="81" cy="4" rx="11" ry="3.2" fill="#facc15"/><circle cx="70" cy="4" r="3" fill="#475569"/></g></g>`,
  viking: `<g class="wear-viking"><path d="M38 30 Q16 26 13 4 Q25 20 42 21 Z" fill="#fef3c7" stroke="#d6d3d1" stroke-width="1.5"/><path d="M102 30 Q124 26 127 4 Q115 20 98 21 Z" fill="#fef3c7" stroke="#d6d3d1" stroke-width="1.5"/><path d="M34 44 Q34 12 70 12 Q106 12 106 44 Z" fill="#94a3b8"/><path d="M34 41 L106 41" stroke="#64748b" stroke-width="6"/><path d="M70 12 L70 40" stroke="#64748b" stroke-width="4"/>${[44, 58, 82, 96].map((x) => `<circle cx="${x}" cy="41" r="1.8" fill="#e2e8f0"/>`).join('')}</g>`,
  tiara: `<g class="wear-tiara"><path d="M46 40 L50 24 L60 32 L70 13 L80 32 L90 24 L94 40 Z" fill="#e5e7eb" stroke="#94a3b8" stroke-width="2" stroke-linejoin="round"/><circle cx="70" cy="23" r="4.2" fill="#ec4899"/><circle cx="56" cy="35" r="2.6" fill="#38bdf8"/><circle cx="84" cy="35" r="2.6" fill="#38bdf8"/></g>`,
  unicorn: `<g class="wear-unicorn"><path d="M38 44 Q30 30 40 22 Q44 34 52 36 Z" fill="#f472b6"/><path d="M102 44 Q110 30 100 22 Q96 34 88 36 Z" fill="#a78bfa"/><path d="M61 36 L70 -6 L79 36 Z" fill="#fde68a" stroke="#f59e0b" stroke-width="2" stroke-linejoin="round"/><path d="M63 28 L77 23 M65 18 L75 14 M67 8 L73 5" stroke="#f59e0b" stroke-width="2"/></g>`,
  flamecrown: `<g class="wear-flamecrown"><path d="M40 44 Q37 22 49 10 Q49 26 58 28 Q55 8 70 -4 Q73 16 81 26 Q85 12 93 10 Q103 24 100 44 Z" fill="#f97316"/><path d="M49 44 Q49 30 56 25 Q58 34 64 34 Q63 18 70 9 Q75 25 80 32 Q84 25 88 25 Q93 34 91 44 Z" fill="#facc15"/><path d="M60 44 Q62 36 66 34 Q68 40 70 38 Q72 32 76 34 Q80 40 80 44 Z" fill="#fff7ed"/></g>`,
  halo: `<g class="wear-halo"><ellipse cx="70" cy="20" rx="26" ry="7" fill="none" stroke="#facc15" stroke-width="5"/><ellipse cx="70" cy="20" rx="26" ry="7" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/></g>`,
};
export const FACE = {
  glasses: `<g class="wear-glasses"><circle cx="53" cy="76" r="14" fill="#fff" fill-opacity=".12" stroke="#22164f" stroke-width="3.2"/><circle cx="87" cy="76" r="14" fill="#fff" fill-opacity=".12" stroke="#22164f" stroke-width="3.2"/><path d="M67 75 Q70 71 73 75" stroke="#22164f" stroke-width="3" fill="none"/></g>`,
  sunglasses: `<g class="wear-sunglasses"><rect x="38" y="66" width="30" height="20" rx="8" fill="#0f172a"/><rect x="72" y="66" width="30" height="20" rx="8" fill="#0f172a"/><path d="M68 72 L72 72" stroke="#0f172a" stroke-width="4"/><path d="M43 70 L52 70" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".6"/><path d="M77 70 L86 70" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".6"/></g>`,
  starglasses: `<g class="wear-starglasses" fill="#f472b6" fill-opacity=".85" stroke="#be185d" stroke-width="2">${[53, 87]
    .map((x) => `<path d="M${x} 60 L${x + 4.5} 71 L${x + 16} 71 L${x + 7} 78 L${x + 10.5} 90 L${x} 83 L${x - 10.5} 90 L${x - 7} 78 L${x - 16} 71 L${x - 4.5} 71 Z"/>`)
    .join('')}</g>`,
  monocle: `<g class="wear-monocle"><circle cx="87" cy="76" r="13" fill="#fff" fill-opacity=".15" stroke="#b45309" stroke-width="3.2"/><path d="M98 84 Q104 104 96 122" stroke="#b45309" stroke-width="1.8" fill="none"/></g>`,
  clownnose: `<g class="wear-clownnose"><circle cx="70" cy="89" r="8" fill="#ef4444"/><circle cx="67" cy="86" r="2.6" fill="#fff" opacity=".7"/></g>`,
  blush: `<g class="wear-blush" fill="#facc15">${[[40, 93], [100, 93]].map(([x, y]) => `<path d="M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y - 2} L${x + 3} ${y + 1} L${x + 4.5} ${y + 6} L${x} ${y + 3} L${x - 4.5} ${y + 6} L${x - 3} ${y + 1} L${x - 7} ${y - 2} L${x - 2} ${y - 2} Z"/>`).join('')}</g>`,
  eyepatch: `<g class="wear-eyepatch"><path d="M26 64 Q60 52 100 68" stroke="#111827" stroke-width="3" fill="none"/><ellipse cx="87" cy="77" rx="14" ry="13" fill="#111827"/><path d="M80 72 L86 76" stroke="#fff" stroke-width="1.5" opacity=".3"/></g>`,
  glasses3d: `<g class="wear-glasses3d"><rect x="37" y="65" width="31" height="22" rx="4" fill="#ef4444" fill-opacity=".75" stroke="#f8fafc" stroke-width="3.5"/><rect x="72" y="65" width="31" height="22" rx="4" fill="#3b82f6" fill-opacity=".75" stroke="#f8fafc" stroke-width="3.5"/><path d="M68 72 L72 72" stroke="#f8fafc" stroke-width="4"/></g>`,
  heartglasses: `<g class="wear-heartglasses" fill="#ec4899" fill-opacity=".88" stroke="#9d174d" stroke-width="2">${[53, 87].map((x) => `<path d="M${x} 89 C${x - 19} 76 ${x - 13} 60 ${x} 69 C${x + 13} 60 ${x + 19} 76 ${x} 89 Z"/>`).join('')}<path d="M66 72 Q70 69 74 72" fill="none"/></g>`,
  vr: `<g class="wear-vr"><path d="M24 74 L34 74 M106 74 L116 74" stroke="#1e293b" stroke-width="6"/><rect x="33" y="61" width="74" height="30" rx="12" fill="#1e293b"/><rect x="38" y="66" width="64" height="20" rx="9" fill="#38bdf8" opacity=".65"/><path class="vr-shine" d="M44 70 L58 70" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/></g>`,
  cyber: `<g class="wear-cyber"><path d="M28 64 Q70 54 112 64 L109 86 Q70 77 31 86 Z" fill="#0f172a" opacity=".92"/><path class="visor-scan" d="M36 72 Q70 63 104 72" stroke="#22d3ee" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="53" cy="75" r="3" fill="#f0abfc"/><circle cx="87" cy="75" r="3" fill="#f0abfc"/></g>`,
  mustache: `<path class="wear-mustache" d="M54 93 Q62 85 70 91 Q78 85 86 93 Q80 99 70 95 Q60 99 54 93 Z" fill="#22164f"/>`,
};
export const NECK = {
  'host-suit': HOST_SUIT,
  scarf: `<g class="wear-scarf"><path d="M32 106 Q70 128 108 106 L106 118 Q70 140 34 118 Z" fill="#ef4444"/><path d="M88 120 L96 142 L85 144 L80 123 Z" fill="#dc2626"/><path d="M40 112 Q70 130 100 112" stroke="#fff" stroke-width="2" stroke-dasharray="4 5" fill="none" opacity=".6"/></g>`,
  bowtie: `<g class="wear-bowtie"><path d="M70 122 L54 113 L54 131 Z" fill="#ef4444"/><path d="M70 122 L86 113 L86 131 Z" fill="#ef4444"/><circle cx="70" cy="122" r="4.5" fill="#b91c1c"/></g>`,
  medal: `<g class="wear-medal"><path d="M58 100 L70 122 L82 100" stroke="#3b82f6" stroke-width="5" fill="none"/><circle cx="70" cy="128" r="9" fill="#facc15" stroke="#f59e0b" stroke-width="2"/><text x="70" y="132" text-anchor="middle" font-size="10" font-weight="900" fill="#92400e">1</text></g>`,
  lei: `<g class="wear-lei">${[[36, 110], [46, 118], [58, 123], [70, 125], [82, 123], [94, 118], [104, 110]]
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="6" fill="${['#f472b6', '#facc15', '#fb7185', '#a78bfa'][i % 4]}"/><circle cx="${x}" cy="${y}" r="2" fill="#fff" opacity=".8"/>`)
    .join('')}</g>`,
  tie: `<g class="wear-tie"><path d="M63 115 L77 115 L72 122 L68 122 Z" fill="#1d4ed8"/><path d="M68 121 L72 121 L79 141 L70 149 L61 141 Z" fill="#2563eb"/><path d="M66 129 L76 127 M64 137 L77 134" stroke="#facc15" stroke-width="2"/></g>`,
  bell: `<g class="wear-bell"><path d="M38 110 Q70 128 102 110" stroke="#dc2626" stroke-width="5" fill="none"/><path d="M62 124 Q62 114 70 114 Q78 114 78 124 L80 130 L60 130 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/><circle cx="70" cy="132" r="2.6" fill="#ca8a04"/></g>`,
  winterscarf: `<g class="wear-winterscarf"><path d="M32 106 Q70 128 108 106 L106 118 Q70 140 34 118 Z" fill="#16a34a"/><path d="M38 112 Q70 131 102 112" stroke="#fff" stroke-width="3.5" fill="none"/><path d="M86 120 L95 143 L84 145 L79 123 Z" fill="#dc2626"/><path d="M84 132 L93 131" stroke="#fff" stroke-width="2.5"/></g>`,
  pearls: `<g class="wear-pearls" fill="#fff" stroke="#cbd5e1" stroke-width="1">${[[38, 110], [45, 116], [53, 121], [61, 124], [70, 125], [79, 124], [87, 121], [95, 116], [102, 110]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6"/>`).join('')}<circle cx="70" cy="132" r="5" fill="#fbcfe8"/></g>`,
  amulet: `<g class="wear-amulet"><path d="M44 106 Q70 131 96 106" stroke="#78350f" stroke-width="2.5" fill="none"/><circle cx="70" cy="127" r="9" fill="#1d4ed8" stroke="#facc15" stroke-width="2"/><circle cx="70" cy="127" r="5.5" fill="#fff"/><circle cx="70" cy="127" r="3.4" fill="#38bdf8"/><circle cx="70" cy="127" r="1.6" fill="#0f172a"/></g>`,
  chain: `<g class="wear-chain"><path d="M38 108 Q70 134 102 108" stroke="#facc15" stroke-width="3.5" stroke-dasharray="2 4" stroke-linecap="round" fill="none"/><path d="M70 120 L76 128 L70 136 L64 128 Z" fill="#38bdf8" stroke="#0ea5e9" stroke-width="1.5"/></g>`,
};
export const BACK = {
  cape: `<path class="wear-cape" d="M34 92 Q16 140 36 146 L104 146 Q124 140 106 92 Z" fill="#dc2626"/>`,
  wings: `<g class="wear-wings" fill="#fff" stroke="#cbd5e1" stroke-width="2"><path class="wing-l" d="M30 80 Q-4 46 4 98 Q18 92 30 100 Z"/><path class="wing-r" d="M110 80 Q144 46 136 98 Q122 92 110 100 Z"/></g>`,
  sword: `<g class="wear-sword" transform="rotate(24 118 90)"><rect x="115" y="34" width="8" height="64" rx="3" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/><rect x="107" y="96" width="24" height="6" rx="3" fill="#b45309"/><rect x="116" y="102" width="6" height="14" rx="2" fill="#78350f"/></g>`,
  jetpack: `<g class="wear-jetpack"><rect x="4" y="66" width="16" height="40" rx="7" fill="#94a3b8"/><rect x="120" y="66" width="16" height="40" rx="7" fill="#94a3b8"/><path class="jet-flame" d="M6 106 Q12 128 18 106 Z M122 106 Q128 128 134 106 Z" fill="#f97316"/><path d="M9 106 Q12 118 15 106 Z M125 106 Q128 118 131 106 Z" fill="#facc15"/></g>`,
  balloon: `<g class="wear-balloon"><path d="M108 104 Q124 76 118 46" stroke="#94a3b8" stroke-width="1.5" fill="none"/><g class="balloon-bob"><ellipse cx="118" cy="26" rx="16" ry="19" fill="#ef4444"/><path d="M118 45 l-3.5 4 h7 Z" fill="#dc2626"/><ellipse cx="112" cy="19" rx="4" ry="6.5" fill="#fff" opacity=".45"/></g></g>`,
  shield: `<g class="wear-shield"><path d="M0 66 L25 58 L50 66 Q50 102 25 118 Q0 102 0 66 Z" fill="#2563eb" stroke="#facc15" stroke-width="3"/><path d="M25 70 L25 106 M10 84 L40 84" stroke="#facc15" stroke-width="3.5"/></g>`,
  guitar: `<g class="wear-guitar" transform="rotate(32 116 92)"><rect x="112" y="22" width="7" height="56" rx="2" fill="#78350f"/><rect x="109.5" y="14" width="12" height="11" rx="3" fill="#451a03"/><ellipse cx="115.5" cy="88" rx="14" ry="15" fill="#f97316"/><ellipse cx="115.5" cy="104" rx="18" ry="15" fill="#ea580c"/><circle cx="115.5" cy="93" r="4.5" fill="#7c2d12"/></g>`,
  batwings: `<g class="wear-batwings" fill="#4c1d95" stroke="#2e1065" stroke-width="1.5"><path class="wing" d="M32 80 Q16 50 -2 56 Q8 64 4 74 Q14 72 12 84 Q20 82 22 94 Q26 88 32 96 Z"/><g transform="translate(140 0) scale(-1 1)"><path class="wing" d="M32 80 Q16 50 -2 56 Q8 64 4 74 Q14 72 12 84 Q20 82 22 94 Q26 88 32 96 Z"/></g></g>`,
  katana: `<g class="wear-katana" transform="rotate(-32 32 90)"><rect x="29" y="16" width="6" height="78" rx="3" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/><rect x="23" y="92" width="18" height="5" rx="2" fill="#111827"/><rect x="29" y="97" width="6" height="20" rx="2" fill="#dc2626"/><path d="M30 99 L34 103 M30 105 L34 109 M30 111 L34 115" stroke="#111827" stroke-width="1"/></g>`,
  butterfly: `<g class="wear-butterfly"><g class="wing"><ellipse cx="16" cy="66" rx="19" ry="23" fill="#a78bfa"/><ellipse cx="20" cy="104" rx="14" ry="16" fill="#f472b6"/><circle cx="14" cy="62" r="6" fill="#fde68a"/></g><g transform="translate(140 0) scale(-1 1)"><g class="wing"><ellipse cx="16" cy="66" rx="19" ry="23" fill="#a78bfa"/><ellipse cx="20" cy="104" rx="14" ry="16" fill="#f472b6"/><circle cx="14" cy="62" r="6" fill="#fde68a"/></g></g></g>`,
  dragonwings: `<g class="wear-dragonwings" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2" stroke-linejoin="round"><path class="wing" d="M32 78 L4 38 L12 60 L-2 56 L10 78 L-4 84 L12 92 L2 104 L30 98 Z"/><g transform="translate(140 0) scale(-1 1)"><path class="wing" d="M32 78 L4 38 L12 60 L-2 56 L10 78 L-4 84 L12 92 L2 104 L30 98 Z"/></g></g>`,
  backpack: `<g class="wear-backpack"><rect x="6" y="64" width="34" height="48" rx="11" fill="#f97316"/><rect x="11" y="86" width="22" height="16" rx="5" fill="#fb923c"/></g>`,
};


/**
 * Костюм (слот body): одежда на нижней половине тела - от линии чуть ниже рта (y ≈ 98) до низа шара (y = 128).
 * Рисунок автоматически обрезается по кругу тела, поэтому можно рисовать с запасом (например, прямоугольник x 20-120).
 * Рисуется поверх тела, но под шарфами (слот neck) и под кольцом.
 */
export const BODY = { ...BODY_ART };

/**
 * Обувь (слот feet): рисуется вместо ступней. Ступни - овалы с центрами (55, 130) и (85, 130), rx ≈ 12.5, ry ≈ 7.
 * Верх обуви прячется под телом (низ шара - y = 128), видно примерно от y = 126 до y = 138.
 */
export const FEET = { ...FEET_ART };

/**
 * Вещь в руке (слот hand): рисуется в системе координат кисти - центр кисти в (0, 0), кисть - круг радиусом 7,
 * она рисуется поверх вещи, как будто держит её. Вещь обычно торчит вверх (отрицательные y) на 20-45 единиц.
 * Препи держит её правой рукой (справа на картинке).
 */
export const HAND = {
  ...HAND_ART,
  'host-mic': `<g class="host-mic" transform="translate(-121 -117) rotate(-38 117 112)">
        <rect x="114" y="92" width="6" height="22" rx="3" fill="#1f2937"/>
        <rect x="113.5" y="92" width="7" height="3.5" rx="1.5" fill="#e11d48"/>
        <circle cx="117" cy="86" r="7.5" fill="#9ca3af"/>
        <circle cx="117" cy="86" r="7.5" fill="none" stroke="#4b5563" stroke-width="1.2"/>
        <path d="M111 83 H123 M110.5 87 H123.5 M112 91 H122 M114 80 V92 M117 79 V93 M120 80 V92" stroke="#6b7280" stroke-width=".7"/>
        <circle cx="114.5" cy="83" r="2" fill="#fff" opacity=".6"/>
      </g>`,
};

Object.assign(HEAD, HEAD_MORE);
Object.assign(FACE, FACE_MORE);
Object.assign(NECK, NECK_MORE);
Object.assign(BACK, BACK_MORE);

export { HOST_SUIT, HOST_HAT };
