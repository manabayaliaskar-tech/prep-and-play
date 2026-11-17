// Новые вещи: костюмы (BODY), обувь (FEET) и дополнительные вещи на спину (BACK_MORE).
// Правила координат — в комментариях к BODY, FEET, BACK в ./wear.js.
// Анимации (классы of-*) — в styles/parts/outfits.css; при prefers-reduced-motion они выключаются.

// ---------- Общие детали костюмов ----------

/** Ткань костюма: всё ниже линии top (обрезается по кругу тела). */
const cloth = (top, fill, line) => `<path d="${top} L150 150 L-10 150 Z" fill="${fill}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>`;
/** Тень снизу справа — объём. */
const shade = (c, o = 0.35) => `<path d="M114 100 A48 48 0 0 1 46 121.6 A80 80 0 0 0 114 100 Z" fill="${c}" opacity="${o}"/>`;
/** Контур по нижнему краю шара (только под одеждой). */
const rim = (c) => `<path d="M28 101 A47 47 0 0 0 112 101" fill="none" stroke="${c}" stroke-width="2.6"/>`;
/** Блик слева снизу. */
const gloss = (o = 0.35, w = 2.4) => `<path d="M31.5 105 Q35 114 42.5 120" stroke="#fff" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${o}"/>`;
/** Отражение левой половины рисунка на правую сторону (ось x = 70). */
const mirror = (s) => `${s}<g transform="matrix(-1 0 0 1 140 0)">${s}</g>`;
/** Четырёхлучевая искорка. */
const spark = (x, y, s, fill, cls = '', delay = 0) =>
  `<path${cls ? ` class="${cls}"` : ''}${delay ? ` style="animation-delay:${delay}s"` : ''} d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z" fill="${fill}"/>`;

// Вырезы горловины: круглый и V-образный (низ выреза — на глубине d).
const NR = 'M-10 98 L38 100 Q50 101 55 104 Q70 117 85 104 Q90 101 102 100 L150 98';
const NRC = 'M38 100.4 Q50 101 55 104 Q70 117 85 104 Q90 101 102 100.4';
const nv = (d, a = 54, b = 86) => `M-10 98 L44 100 Q${a - 3} 100 ${a} 102 L70 ${d} L${b} 102 Q${b + 3} 100 96 100 L150 98`;

const sakura = (x, y) => `<g transform="translate(${x} ${y})" fill="#fecdd3"><circle cy="-2" r="1.7"/><circle cx="1.9" cy="-.6" r="1.7"/><circle cx="1.2" cy="1.6" r="1.7"/><circle cx="-1.2" cy="1.6" r="1.7"/><circle cx="-1.9" cy="-.6" r="1.7"/><circle r=".9" fill="#facc15"/></g>`;
const hibiscus = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 L0 -4.5 A2.4 2.4 0 0 1 4.3 -1.4 Z M0 0 L4.3 -1.4 A2.4 2.4 0 0 1 2.6 3.6 Z M0 0 L2.6 3.6 A2.4 2.4 0 0 1 -2.6 3.6 Z M0 0 L-2.6 3.6 A2.4 2.4 0 0 1 -4.3 -1.4 Z M0 0 L-4.3 -1.4 A2.4 2.4 0 0 1 0 -4.5 Z" fill="#f472b6" stroke="#be185d" stroke-width=".6"/><circle r="1.2" fill="#fde047"/></g>`;
const leaf = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="4.6" ry="1.9" transform="rotate(${r} ${x} ${y})" fill="#4ade80" stroke="#15803d" stroke-width=".6"/>`;

const dots = (pts, r, fill) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('').replace(/^/, `<g fill="${fill}">`) + '</g>';

export const BODY_ART = {
  hoodie: `<g class="wear-hoodie">${cloth(NR, '#38bdf8', '#0369a1')}${shade('#0369a1', 0.3)}
    <path d="${NRC}" fill="none" stroke="#0ea5e9" stroke-width="7" stroke-linecap="round"/>
    <path d="M44 104.5 Q53 105 57.5 108.5 Q70 120 82.5 108.5 Q87 105 96 104.5" fill="none" stroke="#0369a1" stroke-width="1.3" opacity=".55"/>
    <path d="M47 131 L52 117 Q70 114 88 117 L93 131 Z" fill="#0ea5e9" stroke="#0369a1" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M54.5 119.5 Q70 117 85.5 119.5" stroke="#e0f2fe" stroke-width="1" stroke-dasharray="2 2" fill="none"/>
    <path d="M62 112 Q60.5 116 61 121 M78 112 Q79.5 116 79 121" stroke="#f8fafc" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g fill="#e2e8f0" stroke="#64748b" stroke-width=".6"><rect x="59.5" y="120.5" width="3" height="4.5" rx="1.2"/><rect x="77.5" y="120.5" width="3" height="4.5" rx="1.2"/></g>
    ${rim('#0369a1')}${gloss()}</g>`,

  tuxedo: `<g class="wear-tuxedo"><path d="M52 101 L88 101 L70 128 Z" fill="#fff"/>
    <path d="M64.5 104 L69 121 M75.5 104 L71 121" stroke="#e2e8f0" stroke-width="1.2"/>
    ${cloth(nv(128), '#1f2937', '#030712')}${shade('#000', 0.35)}
    ${mirror('<path d="M53.5 101.5 L70 128 L63.5 128 L44.5 106.5 L48.5 104 L44 101 Z" fill="#374151" stroke="#030712" stroke-width="1" stroke-linejoin="round"/><path d="M49 106 L63 124" stroke="#9ca3af" stroke-width="1" opacity=".5"/>')}
    <path d="M70 111 L61 106.5 Q59.6 111 61 115.5 Z M70 111 L79 106.5 Q80.4 111 79 115.5 Z" fill="#111827" stroke="#000" stroke-width=".8" stroke-linejoin="round"/>
    <rect x="67.4" y="108.6" width="5.2" height="4.8" rx="1.6" fill="#1f2937" stroke="#000" stroke-width=".7"/>
    <path d="M62.5 108.5 L66 110" stroke="#6b7280" stroke-width=".9" stroke-linecap="round"/>
    <g fill="#111827"><circle cx="70" cy="118" r="1.2"/><circle cx="70" cy="123" r="1.2"/></g>
    <path d="M31 115.5 L45 113.5" stroke="#4b5563" stroke-width="1.2"/>
    <path d="M35.5 114.8 L37.8 109.5 L40.2 113.4 L42.6 108.8 L44 113.6 Z" fill="#fff" stroke="#cbd5e1" stroke-width=".6" stroke-linejoin="round"/>
    ${rim('#030712')}${gloss(0.22)}</g>`,

  superhero: `<g class="wear-superhero">${cloth(NR, '#2563eb', '#1e3a8a')}
    ${mirror('<path d="M-10 99 L40 100.6 Q43 115 61 132 L-10 140 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.6" stroke-linejoin="round"/>')}
    ${shade('#1e3a8a', 0.4)}
    <path d="${NRC}" fill="none" stroke="#facc15" stroke-width="3.4" stroke-linecap="round"/>
    <path d="${NRC}" fill="none" stroke="#a16207" stroke-width=".8" transform="translate(0 2)" opacity=".6"/>
    <circle cx="70" cy="117.5" r="7.6" fill="#facc15" stroke="#a16207" stroke-width="1.6"/>
    <circle cx="70" cy="117.5" r="5.8" fill="none" stroke="#fde68a" stroke-width="1"/>
    <path d="M72.2 111.6 L65.8 118.6 L69.8 118.6 L67.6 123.6 L74.4 116.2 L70.4 116.2 L72.6 111.6 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width=".8" stroke-linejoin="round"/>
    <circle cx="66.6" cy="114.2" r="1.1" fill="#fff" opacity=".7"/>
    ${rim('#1e3a8a')}${gloss(0.5, 3)}</g>`,

  kimono: `<g class="wear-kimono">${cloth(nv(118, 54, 86), '#e11d48', '#881337')}
    ${sakura(34, 108)}${sakura(102, 106)}${sakura(46, 121)}${sakura(92, 120)}
    ${shade('#881337', 0.4)}
    <path d="M51 100 L71 118" stroke="#881337" stroke-width="7.5" stroke-linecap="round"/><path d="M51 100 L71 118" stroke="#fff1f2" stroke-width="5" stroke-linecap="round"/>
    <path d="M89 100 L66 121" stroke="#881337" stroke-width="7.5" stroke-linecap="round"/><path d="M89 100 L66 121" stroke="#fff1f2" stroke-width="5" stroke-linecap="round"/>
    <path d="M87 103 L68 120.5" stroke="#fda4af" stroke-width="1.2"/>
    <path d="M-10 113 Q70 121 150 113 L150 150 L-10 150 Z" fill="#1e1b4b" stroke="#0c0a24" stroke-width="1.6"/>
    <path d="M-10 116.5 Q70 124.5 150 116.5 M-10 121 Q70 129 150 121" stroke="#facc15" stroke-width="1.1" fill="none"/>
    <path d="M-10 118.8 Q70 126.8 150 118.8" stroke="#fb923c" stroke-width="1.8" fill="none"/>
    <ellipse cx="70" cy="122.8" rx="3.2" ry="2.2" fill="#fb923c" stroke="#9a3412" stroke-width=".7"/>
    ${rim('#881337')}${gloss(0.3)}</g>`,

  spacesuit: `<g class="wear-spacesuit">${cloth(NR, '#f1f5f9', '#64748b')}${shade('#94a3b8', 0.45)}
    ${mirror('<path d="M25 104 Q30 118 43 127" stroke="#f97316" stroke-width="3.6" fill="none"/><path d="M57 117 Q46 119 41 111" stroke="#94a3b8" stroke-width="4" fill="none"/><path d="M57 117 Q46 119 41 111" stroke="#e2e8f0" stroke-width="2.8" fill="none" stroke-dasharray="1.3 1"/>')}
    <path d="${NRC}" fill="none" stroke="#64748b" stroke-width="7.5" stroke-linecap="round"/>
    <path d="${NRC}" fill="none" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"/>
    <path d="${NRC}" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>
    <rect class="of-glow" x="51" y="107" width="38" height="18" rx="7" fill="#22d3ee"/>
    <rect x="55" y="110" width="30" height="12" rx="3" fill="#334155" stroke="#facc15" stroke-width="1.4"/>
    <rect x="58" y="112.2" width="11" height="6.5" rx="1.2" fill="#0e7490"/>
    <path d="M59 116.2 l2 -2.4 l2 3 l2 -3.2 l2 2.2" stroke="#67e8f9" stroke-width="1" fill="none"/>
    <circle class="of-blink" cx="73.5" cy="114" r="1.6" fill="#ef4444"/><circle cx="78" cy="114" r="1.6" fill="#22c55e"/><circle class="of-blink" style="animation-delay:.8s" cx="82.3" cy="114" r="1.6" fill="#facc15"/>
    <rect x="72" y="117.4" width="11" height="2.2" rx="1.1" fill="#94a3b8"/><rect x="75" y="116.7" width="3" height="3.6" rx="1" fill="#f8fafc"/>
    <circle cx="35" cy="110" r="5" fill="#1d4ed8" stroke="#facc15" stroke-width="1.2"/>${spark(35, 110, 2.8, '#fff')}
    ${rim('#64748b')}${gloss(0.7, 2.6)}</g>`,

  labcoat: `<g class="wear-labcoat"><path d="M50 100 L90 100 L70 126 Z" fill="#bfdbfe"/>
    <path d="M68 107 H72 L73 116 L70 119.5 L67 116 Z" fill="#0f766e"/>
    <path d="M88.5 112 V103.5 h2.6 V112 M92.5 112 V102.5 h2.6 V112 M96.5 112 V104.5 h2.4 V112" fill="#2563eb" stroke="#1e3a8a" stroke-width=".6"/>
    <rect x="92.5" y="102.5" width="2.6" height="9.5" fill="#ef4444" stroke="#7f1d1d" stroke-width=".6"/>
    <rect x="96.5" y="104.5" width="2.4" height="7.5" fill="#facc15" stroke="#a16207" stroke-width=".6"/><rect x="96.5" y="103.4" width="2.4" height="1.8" fill="#f9a8d4"/>
    ${cloth(nv(126), '#f8fafc', '#94a3b8')}${shade('#94a3b8', 0.35)}
    ${mirror('<path d="M53 101 L70 126 L65.5 127.5 L45.5 107 L49.5 104 L45 101 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" stroke-linejoin="round"/>')}
    <path d="M70 126 V140" stroke="#94a3b8" stroke-width="1.4"/>
    <rect x="86.5" y="109.5" width="14" height="11" rx="1.6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.2"/>
    <path d="M89.5 103.5 v4 M93.5 102.5 v4" stroke="#cbd5e1" stroke-width=".8"/>
    <rect x="37.5" y="108.5" width="11" height="7.5" rx="1.2" fill="#fff" stroke="#94a3b8" stroke-width=".9"/><rect x="37.5" y="108.5" width="11" height="2.5" rx="1" fill="#3b82f6"/><path d="M40 113.5 H46" stroke="#94a3b8" stroke-width=".9"/>
    ${rim('#94a3b8')}${gloss(0.6)}</g>`,

  jersey: `<g class="wear-jersey">${cloth(nv(109), '#16a34a', '#14532d')}
    ${mirror('<path d="M27 100 Q32 116 46 128" stroke="#fff" stroke-width="2.4" fill="none"/><path d="M31.5 100 Q36 114 49 125.5" stroke="#fff" stroke-width="2.4" fill="none"/>')}
    ${shade('#14532d', 0.35)}
    <path d="M44 100 Q51 100 54 102 L70 109 L86 102 Q89 100 96 100" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
    <path d="M45 102.6 Q51.5 102.6 54 104.6 L70 111.6 L86 104.6 Q88.5 102.6 95 102.6" fill="none" stroke="#14532d" stroke-width="1" stroke-linejoin="round"/>
    <text x="70" y="123" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="12" font-weight="900" fill="#fff" stroke="#14532d" stroke-width="1.6" paint-order="stroke">7</text>
    ${rim('#14532d')}${gloss(0.3)}</g>`,

  knightarmor: `<g class="wear-knightarmor">${cloth(NR, '#cbd5e1', '#475569')}
    <path d="M-10 108 Q70 122 150 108 M-10 115.5 Q70 129.5 150 115.5" stroke="#64748b" stroke-width="1.8" fill="none"/>
    <path d="M-10 110 Q70 124 150 110 M-10 117.5 Q70 131.5 150 117.5" stroke="#f8fafc" stroke-width="1.4" fill="none"/>
    ${shade('#334155', 0.4)}
    <path d="M70 114 V132" stroke="#f8fafc" stroke-width="1.8"/><path d="M71.6 114 V132" stroke="#94a3b8" stroke-width="1.2"/>
    <path d="${NRC}" fill="none" stroke="#475569" stroke-width="8" stroke-linecap="round"/>
    <path d="${NRC}" fill="none" stroke="#94a3b8" stroke-width="5.6" stroke-linecap="round"/>
    <path d="M42 102.8 Q51 103.6 56 107 Q70 119.5 84 107 Q89 103.6 98 102.8" fill="none" stroke="#facc15" stroke-width="1.4"/>
    <g fill="#facc15" stroke="#a16207" stroke-width=".6"><circle cx="34" cy="110" r="1.6"/><circle cx="106" cy="110" r="1.6"/><circle cx="41" cy="119.5" r="1.6"/><circle cx="99" cy="119.5" r="1.6"/></g>
    ${rim('#475569')}${gloss(0.7, 3)}<ellipse cx="46" cy="112" rx="3.4" ry="1.4" transform="rotate(30 46 112)" fill="#fff" opacity=".7"/></g>`,

  overalls: `<g class="wear-overalls">${cloth(NR, '#fde047', '#a16207')}
    <path d="${NRC}" fill="none" stroke="#eab308" stroke-width="3" stroke-linecap="round"/>
    ${mirror('<path d="M56.5 112 L40 99.5" stroke="#1e3a8a" stroke-width="7.6" stroke-linecap="round"/><path d="M56.5 112 L40 99.5" stroke="#3b82f6" stroke-width="5.2" stroke-linecap="round"/><path d="M55 109.5 L41 99" stroke="#fbbf24" stroke-width=".7" stroke-dasharray="1.4 1"/>')}
    <path d="M-10 117 Q70 125 150 117 L150 150 L-10 150 Z" fill="#3b82f6" stroke="#1e3a8a" stroke-width="1.8"/>
    <path d="M54 110.5 H86 Q87.2 116 86.4 122 H53.6 Q52.8 116 54 110.5 Z" fill="#3b82f6" stroke="#1e3a8a" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="62.5" y="113" width="15" height="7" rx="1.4" fill="none" stroke="#fbbf24" stroke-width=".9" stroke-dasharray="1.6 1.1"/>
    <path d="M-10 119.6 Q70 127.6 150 119.6" stroke="#fbbf24" stroke-width=".9" stroke-dasharray="1.6 1.1" fill="none"/>
    ${shade('#1e3a8a', 0.35)}
    <g fill="#facc15" stroke="#a16207" stroke-width=".8"><circle cx="56" cy="112" r="2.3"/><circle cx="84" cy="112" r="2.3"/></g>
    ${rim('#1e3a8a')}${gloss(0.3)}</g>`,

  raincoat: `<g class="wear-raincoat">${cloth(NR, '#facc15', '#a16207')}${shade('#ca8a04', 0.5)}
    <path d="M70 110.5 V132" stroke="#a16207" stroke-width="1.5"/><path d="M73.6 111 V132" stroke="#ca8a04" stroke-width="1" opacity=".7"/>
    ${mirror('<path d="M39 100.4 Q50 101 55 104 L63.5 110.5 L50 114.5 Q44 108 39 100.4 Z" fill="#fde047" stroke="#a16207" stroke-width="1.5" stroke-linejoin="round"/><path d="M33.5 113.5 Q41 111.5 48.5 113.5 L48 118 Q41 116.2 34 118 Z" fill="#eab308" stroke="#a16207" stroke-width="1.2" stroke-linejoin="round"/><circle cx="41.2" cy="116" r="1" fill="#a16207"/>')}
    <g fill="#fef9c3" stroke="#a16207" stroke-width=".9"><circle cx="71.8" cy="116" r="1.7"/><circle cx="71.8" cy="122.5" r="1.7"/></g>
    ${rim('#a16207')}${gloss(0.75, 3)}<circle cx="38" cy="106" r="1.4" fill="#fff" opacity=".8"/><path d="M95 105 Q100 108 102 112" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/></g>`,

  sweater: `<g class="wear-sweater">${cloth(NR, '#dc2626', '#7f1d1d')}
    <path d="M-10 112.5 H150 M-10 123 H150" stroke="#fff" stroke-width="1.3"/>
    <path d="M${Array.from({ length: 21 }, (_, i) => `${10 + i * 6} ${i % 2 ? 115 : 120.5}`).join(' L')}" stroke="#fff" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
    ${dots([[52, 126.5], [64, 126.5], [76, 126.5], [88, 126.5], [40, 126.5], [100, 126.5]], 1.1, '#fff')}
    <path d="M30 103 l1.5 2 l1.5 -2 M37 104 l1.5 2 l1.5 -2 M44 105.5 l1.5 2 l1.5 -2 M92 105.5 l1.5 2 l1.5 -2 M99 104 l1.5 2 l1.5 -2 M106 103 l1.5 2 l1.5 -2" stroke="#991b1b" stroke-width="1" fill="none"/>
    ${shade('#7f1d1d', 0.35)}
    <path d="${NRC}" fill="none" stroke="#b91c1c" stroke-width="6.5" stroke-linecap="round"/>
    <path d="${NRC}" fill="none" stroke="#7f1d1d" stroke-width="6.5" stroke-dasharray=".9 1.5" opacity=".55"/>
    ${rim('#7f1d1d')}${gloss(0.25)}</g>`,

  piratecoat: `<g class="wear-piratecoat"><path d="M49 100 L91 100 L80 132 L60 132 Z" fill="#fff7ed"/>
    ${[105, 111, 117].map((y) => `<path d="M63 ${y} Q66.5 ${y - 2.5} 70 ${y} Q73.5 ${y - 2.5} 77 ${y} Q75 ${y + 3.5} 77 ${y + 6} Q70 ${y + 4} 63 ${y + 6} Q65 ${y + 3.5} 63 ${y} Z" fill="#fff" stroke="#d6d3d1" stroke-width=".9" stroke-linejoin="round"/>`).join('')}
    ${cloth('M-10 98 L42 100 Q48 100 52 102 L62 132 L78 132 L88 102 Q92 100 98 100 L150 98', '#9f1239', '#4c0519')}${shade('#4c0519', 0.4)}
    <path d="M42 100.2 Q48 100.2 52 102 L62 132 M98 100.2 Q92 100.2 88 102 L78 132" stroke="#facc15" stroke-width="2.4" fill="none" stroke-linejoin="round"/>
    <g fill="#facc15" stroke="#a16207" stroke-width=".8"><circle cx="46" cy="108" r="1.9"/><circle cx="50" cy="116" r="1.9"/><circle cx="94" cy="108" r="1.9"/><circle cx="90" cy="116" r="1.9"/></g>
    <path d="M-10 119.5 Q70 125.5 150 119.5 L150 126 Q70 132 -10 126 Z" fill="#292524" stroke="#0c0a09" stroke-width="1"/>
    <rect x="64.5" y="120.3" width="11" height="7.6" rx="1.6" fill="none" stroke="#facc15" stroke-width="2"/><path d="M70 121.5 V126.5" stroke="#facc15" stroke-width="1.3"/>
    ${rim('#4c0519')}${gloss(0.3)}</g>`,

  wizardrobe: `<g class="wear-wizardrobe">${cloth(NR, '#312e81', '#1e1b4b')}
    <ellipse class="of-glow" cx="52" cy="113" rx="22" ry="10" fill="#818cf8"/>
    ${shade('#1e1b4b', 0.5)}
    <path d="M-10 118 Q70 127 150 118" stroke="#fbbf24" stroke-width="2.4" fill="none"/><path d="M-10 118 Q70 127 150 118" stroke="#92400e" stroke-width="2.4" fill="none" stroke-dasharray="1.2 1.8" opacity=".6"/>
    <path d="M70 111 V132" stroke="#facc15" stroke-width="2.6"/>
    <path d="${NRC}" fill="none" stroke="#facc15" stroke-width="3.4" stroke-linecap="round"/><path d="${NRC}" fill="none" stroke="#fef3c7" stroke-width="1" stroke-linecap="round"/>
    <path d="M45 113.5 a4.4 4.4 0 1 0 5 5.6 a3.5 3.5 0 1 1 -5 -5.6 Z M96.5 120 a3.6 3.6 0 1 0 4 4.6 a2.8 2.8 0 1 1 -4 -4.6 Z" fill="#fde68a"/>
    ${spark(34, 108, 3.4, '#fde047', 'of-twinkle')}${spark(96, 108, 4, '#fde047', 'of-twinkle', 0.6)}${spark(82, 122, 2.8, '#fef9c3', 'of-twinkle', 1.2)}${spark(58, 123, 2.4, '#fde047', 'of-twinkle', 0.9)}
    ${dots([[42, 124], [104, 114], [62, 115.5], [88, 115]], 0.8, '#c7d2fe')}
    ${rim('#1e1b4b')}${gloss(0.3)}</g>`,

  chefcoat: `<g class="wear-chefcoat">${cloth(NR, '#ffffff', '#94a3b8')}${shade('#94a3b8', 0.32)}
    <path d="M78 109 Q80.5 120 78.5 134" stroke="#94a3b8" stroke-width="1.4" fill="none"/><path d="M80 109.5 Q82.5 120 80.5 134" stroke="#ef4444" stroke-width=".9" fill="none"/>
    <g fill="#f1f5f9" stroke="#64748b" stroke-width="1"><circle cx="61" cy="113" r="2.2"/><circle cx="62" cy="121" r="2.2"/><circle cx="88" cy="113" r="2.2"/><circle cx="87" cy="121" r="2.2"/></g>
    <path d="M60 113 h2 M61 112 v2 M61 121 h2 M62 120 v2 M87 113 h2 M88 112 v2 M86 121 h2 M87 120 v2" stroke="#94a3b8" stroke-width=".6"/>
    <rect x="40.4" y="103" width="1.8" height="9" rx=".9" fill="#cbd5e1" stroke="#64748b" stroke-width=".5"/><circle cx="41.3" cy="103" r="1.8" fill="#94a3b8"/><rect x="44" y="104.5" width="1.8" height="7" rx=".6" fill="#ef4444"/>
    <path d="M36.5 111 H49" stroke="#94a3b8" stroke-width="1.2"/>
    <path d="${NRC}" fill="none" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/><path d="${NRC}" fill="none" stroke="#f8fafc" stroke-width="5.4" stroke-linecap="round"/>
    <path d="M38 98.2 Q50 98.6 55 101.6 Q70 114.6 85 101.6 Q90 98.6 102 98.2" fill="none" stroke="#ef4444" stroke-width="1"/>
    ${rim('#94a3b8')}${gloss(0.7)}</g>`,

  ninjagi: `<g class="wear-ninjagi"><path d="M50 100 L90 100 L70 120 Z" fill="#475569"/>
    <path d="M52 100 L68 116 M58 100 L71 113 M64 100 L74 110 M88 100 L72 116 M82 100 L69 113 M76 100 L66 110" stroke="#94a3b8" stroke-width=".7"/>
    ${cloth(nv(118), '#1e293b', '#020617')}${shade('#000', 0.35)}
    <path d="M51 100 L70.5 118" stroke="#020617" stroke-width="7" stroke-linecap="round"/><path d="M51 100 L70.5 118" stroke="#334155" stroke-width="4.6" stroke-linecap="round"/>
    <path d="M89 100 L66.5 121" stroke="#020617" stroke-width="7" stroke-linecap="round"/><path d="M89 100 L66.5 121" stroke="#334155" stroke-width="4.6" stroke-linecap="round"/>
    <path d="M87 102 L68 119.5" stroke="#64748b" stroke-width=".9"/>
    <path d="M-10 115 Q70 122 150 115 L150 122 Q70 129 -10 122 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.2"/>
    <path d="M-10 117 Q70 124 150 117" stroke="#f87171" stroke-width=".9" fill="none"/>
    <path d="M60 122 L56.5 131 L60 131.5 L62.5 123 Z M63 122.5 L63 132 L66.2 131 L65.5 123 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width=".8" stroke-linejoin="round"/>
    <ellipse cx="62.5" cy="121.5" rx="3.6" ry="2.6" fill="#dc2626" stroke="#7f1d1d" stroke-width=".9"/>
    ${rim('#020617')}${gloss(0.18)}</g>`,

  pyjamas: `<g class="wear-pyjamas">${cloth(NR, '#bfdbfe', '#2563eb')}
    ${dots([[30, 103], [40, 102.5], [100, 102.5], [110, 103], [35, 111], [45, 110], [95, 110], [105, 111], [40, 119], [52, 116], [60, 124], [80, 124], [88, 116], [100, 119], [70, 128], [50, 127], [90, 127]], 1.7, '#fff')}
    ${shade('#2563eb', 0.25)}
    ${mirror('<path d="M41 100.4 Q50 101 55 104 Q62 110 66.5 112.5 Q57 117.5 48.5 112 Q41.5 107 41 100.4 Z" fill="#fff" stroke="#2563eb" stroke-width="1.3" stroke-linejoin="round"/><path d="M45 104 Q47 110 53.5 112.2" stroke="#93c5fd" stroke-width=".9" fill="none" stroke-dasharray="1.4 1"/>')}
    <g fill="#fff" stroke="#2563eb" stroke-width="1"><circle cx="70" cy="117.5" r="1.8"/><circle cx="70" cy="124" r="1.8"/></g>
    <rect x="85" y="110" width="12.5" height="9" rx="1.6" fill="#93c5fd" stroke="#2563eb" stroke-width="1.1"/><path d="M85 112.2 H97.5" stroke="#fff" stroke-width="1"/>
    <path d="M90 113.5 a2.6 2.6 0 1 0 3 3.3 a2 2 0 1 1 -3 -3.3 Z" fill="#facc15"/>
    ${rim('#2563eb')}${gloss(0.35)}</g>`,

  schooluniform: `<g class="wear-schooluniform"><path d="M52 101 L88 101 L70 128 Z" fill="#fff"/>
    ${cloth(nv(128), '#1e3a8a', '#172554')}${shade('#0f172a', 0.35)}
    ${mirror('<path d="M53.5 101.5 L70 128 L64 128 L44.5 106.5 L48.5 104 L44 101 Z" fill="#1e40af" stroke="#172554" stroke-width="1" stroke-linejoin="round"/><path d="M53.5 101.6 L61 108.6 L67.6 105 Z" fill="#fff" stroke="#cbd5e1" stroke-width=".8" stroke-linejoin="round"/>')}
    <path d="M67 108.6 H73 L72 113 H68 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width=".7"/>
    <path d="M68 113 H72 L74.6 124.5 L70 128.5 L65.4 124.5 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M67.3 118 L73 115.5 M66.4 123 L74 119.8" stroke="#facc15" stroke-width="1.2"/>
    <path d="M35.5 108 H43 V112 Q43 115.6 39.25 117 Q35.5 115.6 35.5 112 Z" fill="#facc15" stroke="#a16207" stroke-width=".9"/>
    <path d="M36.8 113 L39.25 110.4 L41.7 113" stroke="#b91c1c" stroke-width="1.2" fill="none"/>
    ${rim('#172554')}${gloss(0.25)}</g>`,

  tracksuit: `<g class="wear-tracksuit">${cloth(NR, '#10b981', '#065f46')}
    ${mirror('<path d="M26 100 Q30 116 44 127.5" stroke="#fff" stroke-width="2.2" fill="none"/><path d="M30.5 100 Q34.5 114.5 47.5 125.6" stroke="#fff" stroke-width="2.2" fill="none"/><path d="M41 112 L49 117" stroke="#065f46" stroke-width="1.2" stroke-linecap="round"/>')}
    ${shade('#065f46', 0.35)}
    <path d="M70 110 V132" stroke="#d1d5db" stroke-width="2.4"/><path d="M70 110 V132" stroke="#6b7280" stroke-width="2.4" stroke-dasharray=".8 1.2"/>
    <path d="${NRC}" fill="none" stroke="#065f46" stroke-width="7.6" stroke-linecap="round"/><path d="${NRC}" fill="none" stroke="#059669" stroke-width="5.2" stroke-linecap="round"/>
    <path d="M38 98.2 Q50 98.6 55 101.6 Q70 114.6 85 101.6 Q90 98.6 102 98.2" fill="none" stroke="#fff" stroke-width=".9"/>
    <rect x="68.4" y="111.5" width="3.2" height="5.4" rx="1.2" fill="#e5e7eb" stroke="#4b5563" stroke-width=".7"/>
    ${rim('#065f46')}${gloss(0.35)}</g>`,

  princessdress: `<g class="wear-princessdress">${cloth('M-10 102 L38 104 Q46 98.5 56 101.5 Q64 104 70 111 Q76 104 84 101.5 Q94 98.5 102 104 L150 102', '#f472b6', '#9d174d')}
    <path d="M-10 118 Q70 126 150 118 L150 150 L-10 150 Z" fill="#fbcfe8" stroke="#db2777" stroke-width="1.4"/>
    <path d="M44 123 L41 130 M54 124.5 L52.5 132 M64 125 L63.5 132 M76 125 L76.5 132 M86 124.5 L87.5 132 M96 123 L99 130" stroke="#f472b6" stroke-width="1.1"/>
    ${shade('#9d174d', 0.3)}
    ${mirror('<ellipse cx="30" cy="104" rx="9" ry="7.5" fill="#f9a8d4" stroke="#9d174d" stroke-width="1.4"/><path d="M27 99 Q30 104 27 110 M33 98.5 Q35 104 33 110" stroke="#ec4899" stroke-width=".9" fill="none"/>')}
    <path d="M-10 115.5 Q70 123.5 150 115.5" stroke="#a16207" stroke-width="3.8" fill="none"/><path d="M-10 115.5 Q70 123.5 150 115.5" stroke="#facc15" stroke-width="2.4" fill="none"/>
    <path d="M70 116.4 L73 119.5 L70 122.6 L67 119.5 Z" fill="#ec4899" stroke="#a16207" stroke-width=".9"/>
    ${dots([[46, 102.6], [52, 102.2], [58, 104], [63, 107], [77, 107], [82, 104], [88, 102.2], [94, 102.6]], 1.1, '#fff')}
    ${spark(52, 127, 1.8, '#fff', 'of-twinkle')}${spark(90, 125, 1.6, '#fff', 'of-twinkle', 0.8)}
    ${rim('#9d174d')}${gloss(0.4)}</g>`,

  hawaiian: `<g class="wear-hawaiian">${cloth(nv(118), '#0891b2', '#164e63')}
    ${leaf(42, 104, -30)}${leaf(96, 120, 40)}${leaf(78, 127, -15)}${leaf(104, 104, 25)}${leaf(52, 117, 60)}
    ${hibiscus(35, 112, 1)}${hibiscus(99, 112, 1.1)}${hibiscus(60, 125, 0.85)}${hibiscus(86, 123, 0.75)}
    ${shade('#164e63', 0.35)}
    <path d="M70 118 V132" stroke="#164e63" stroke-width="1.3"/><g fill="#f0fdfa" stroke="#164e63" stroke-width=".6"><circle cx="72.5" cy="122" r="1.3"/><circle cx="72.5" cy="128" r="1.3"/></g>
    ${mirror('<path d="M43 100.2 Q51 100 54 102 L70 118 L61 117 L46 107.5 L41 105 Z" fill="#22d3ee" stroke="#164e63" stroke-width="1.3" stroke-linejoin="round"/>')}
    ${rim('#164e63')}${gloss(0.3)}</g>`,

  trenchcoat: `<g class="wear-trenchcoat"><path d="M52 101 L88 101 L70 124 Z" fill="#f5f5f4"/><path d="M68.5 105.5 H71.5 L72.6 117.5 L70 120.5 L67.4 117.5 Z" fill="#44403c"/>
    ${cloth(nv(124, 53, 87), '#d4a373', '#7c4a1e')}${shade('#7c4a1e', 0.35)}
    ${mirror('<path d="M53 101 L70 124 L62 126.5 L41.5 107.5 L46.5 104.5 L41.5 100.5 Z" fill="#c08552" stroke="#7c4a1e" stroke-width="1.1" stroke-linejoin="round"/><circle cx="46" cy="114" r="1.9" fill="#57534e"/>')}
    <path d="M97 100.5 Q103 110 112 112.5" stroke="#7c4a1e" stroke-width="1.2" fill="none"/><path d="M98.5 103 Q103.5 109.5 111 111" stroke="#fde68a" stroke-width=".7" stroke-dasharray="1.4 1" fill="none"/>
    <path d="M-10 118 Q70 125 150 118 L150 123.5 Q70 130.5 -10 123.5 Z" fill="#b07a45" stroke="#7c4a1e" stroke-width="1"/>
    <rect x="62" y="119.6" width="9" height="7" rx="1" fill="none" stroke="#44403c" stroke-width="1.7"/><path d="M66.5 120.5 V125.6" stroke="#44403c" stroke-width="1.1"/>
    ${rim('#7c4a1e')}${gloss(0.3)}</g>`,
};

// ---------- Обувь ----------
// Рисуем левую туфлю (носок наружу, влево); правая — её зеркальная копия.

const feet = (id, left) => `<g class="wear-${id}">${mirror(left)}</g>`;
/** Силуэт ботинка: носок слева, пятка у центра (x ≈ 67.5), подошва на y ≈ 139. */
const SHOE = 'M44 139 Q38.5 139 39 133.5 Q39.5 127.5 47 125.5 L60 122.5 Q67.5 121.5 67.5 128.5 L67.5 136 Q67.5 139 64.5 139 Z';

/** Полоса эллипса между y0 и y1 (для полосатых носков). */
function band(cx, cy, rx, ry, y0, y1) {
  const dx = (y) => (rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2))).toFixed(2);
  return `M${(cx - dx(y0)).toFixed(2)} ${y0} A${rx} ${ry} 0 0 0 ${(cx - dx(y1)).toFixed(2)} ${y1} L${(cx + +dx(y1)).toFixed(2)} ${y1} A${rx} ${ry} 0 0 0 ${(cx + +dx(y0)).toFixed(2)} ${y0} Z`;
}
const RAINBOW = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];

const sneaker = (up, line, cap, accent) =>
  `<path d="${SHOE}" fill="${up}" stroke="${line}" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M44 139 Q38.5 139 39 133.5 Q39.5 129 44 127.6 Q45.5 133.5 50.5 135.5 L50.5 139 Z" fill="${cap}" stroke="${line}" stroke-width="1.1" stroke-linejoin="round"/>
  <path d="M51 133.8 Q57 128.5 65.5 129.5" stroke="${accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M49.5 127.2 L57.5 130.2 M49.5 130.2 L57.5 127.2 M51 125.6 L58 128" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M38.4 135.4 H68.2 V137.6 Q68.2 140.6 65.2 140.6 H43 Q38.4 140.6 38.4 137 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.1" stroke-linejoin="round"/>
  <path d="M42 140.4 V138.8 M46 140.4 V138.8 M50 140.4 V138.8 M54 140.4 V138.8 M58 140.4 V138.8 M62 140.4 V138.8" stroke="#cbd5e1" stroke-width=".8"/>`;

export const FEET_ART = {
  sneakers: feet('sneakers', `${sneaker('#ef4444', '#991b1b', '#fff', '#fff')}<path d="M45 129.5 Q48 127 53 126.4" stroke="#fff" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round"/>`),

  cowboyboots: feet('cowboyboots', `<path d="M42 137.5 Q34.5 137.8 35 135.6 Q40 131.5 46.5 127 L58 121.8 Q67.5 120 67.5 127.5 V136.5 Q67.5 137.5 66.5 137.5 Z" fill="#b45309" stroke="#451a03" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M42 137.5 Q34.5 137.8 35 135.6 Q38.5 132.6 43.5 129.4 Q46 134 49 137.5 Z" fill="#92400e" stroke="#451a03" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M48 131 Q51 126.5 54.5 129 Q58 131.5 61.5 126.5 M54.5 129 Q55 133.5 59.5 134" stroke="#fbbf24" stroke-width="1" fill="none" stroke-linecap="round"/>
    <path d="M35.5 137.4 H58" stroke="#451a03" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M59.5 136.4 H67 L66.5 140.8 H60.5 Z" fill="#451a03"/>
    <path d="M67.5 133.6 H69.6" stroke="#94a3b8" stroke-width="1.6"/>${spark(69.6, 133.6, 2.4, '#e2e8f0')}
    <path d="M40 133 Q44 130 47.5 128.2" stroke="#fde68a" stroke-width="1.2" fill="none" opacity=".55" stroke-linecap="round"/>`),

  rollerskates: feet('rollerskates', `<path d="M42.5 134.5 Q39.5 128.5 47 126 L49 122.5 L63.5 121.6 Q67.5 121.6 67.5 126 V134.5 Z" fill="#f8fafc" stroke="#64748b" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M43 131 Q48 128.5 52 129 L67.5 129.5" stroke="#f472b6" stroke-width="2.4" fill="none"/>
    <path d="M51 124.5 L58 126.8 M51 127 L58 124.4" stroke="#ec4899" stroke-width="1.2" stroke-linecap="round"/>
    <rect x="40" y="134" width="28" height="3.2" rx="1.4" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
    <path d="M46 137 V139 M62 137 V139" stroke="#475569" stroke-width="2"/>
    <circle cx="39.6" cy="136.6" r="2.6" fill="#ef4444" stroke="#991b1b" stroke-width=".9"/>
    ${[46, 62].map((x) => `<circle cx="${x}" cy="140.2" r="3.7" fill="#22d3ee" stroke="#0e7490" stroke-width="1"/><g class="of-spin"><circle cx="${x}" cy="140.2" r="1.4" fill="#fff"/><path d="M${x - 2.6} 140.2 H${x + 2.6}" stroke="#0e7490" stroke-width=".8"/></g>`).join('')}`),

  flippers: feet('flippers', `<path d="M52 131 L33 129.2 Q29.5 129.4 30 132.6 L31.2 140 Q32 142.2 35 141.8 L54 139 Z" fill="#facc15" stroke="#a16207" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M50.5 131.8 L33 130.8 M51.5 137.8 L33 140.4" stroke="#ca8a04" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M50.5 134.8 L32.5 135.8" stroke="#fde68a" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M50 137.5 Q47.5 128 56 126 L63.5 124.8 Q67.5 124.8 67.5 129.5 V137.5 Z" fill="#334155" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M52 129.5 Q55 127.8 59 127.4" stroke="#94a3b8" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M64 125 Q69.5 130 66.5 137" stroke="#0f172a" stroke-width="2" fill="none"/>`),

  bunnyslippers: feet('bunnyslippers', `<g stroke="#db2777" stroke-width="1.3"><ellipse cx="38.5" cy="122.5" rx="2.8" ry="6.8" transform="rotate(-22 38.5 122.5)" fill="#fdf2f8"/><ellipse cx="45.5" cy="121" rx="2.8" ry="6.8" transform="rotate(8 45.5 121)" fill="#fdf2f8"/></g>
    <ellipse cx="38.7" cy="122.8" rx="1.1" ry="4.4" transform="rotate(-22 38.7 122.8)" fill="#f9a8d4"/><ellipse cx="45.5" cy="121.4" rx="1.1" ry="4.4" transform="rotate(8 45.5 121.4)" fill="#f9a8d4"/>
    <path d="M42 138.6 Q36.5 138.4 37 133 Q37.5 127 46 126 L60 124 Q67.5 123.4 67.5 130 V135 Q67.5 138.6 64 138.6 Z" fill="#fdf2f8" stroke="#db2777" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M38 135.4 Q52 140 67 135.4" stroke="#fbcfe8" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <g fill="#831843"><circle cx="42.5" cy="130.6" r="1.25"/><circle cx="48" cy="130" r="1.25"/></g>
    <circle cx="42.1" cy="130.2" r=".45" fill="#fff"/><circle cx="47.6" cy="129.6" r=".45" fill="#fff"/>
    <ellipse cx="45.2" cy="132.8" rx="1.3" ry=".95" fill="#f472b6"/>
    <path d="M42.6 133.6 l-3.4 .6 M47.8 133.2 l3.4 .3" stroke="#db2777" stroke-width=".6" stroke-linecap="round"/>
    <ellipse cx="40.5" cy="134" rx="1.6" ry=".9" fill="#f9a8d4" opacity=".7"/>`),

  rainboots: feet('rainboots', `<path d="M44 138.8 Q38.5 138.8 39 133.5 Q39.5 128 46.5 126.2 L49 120 L66.5 120 L67.5 128 V138.8 Z" fill="#facc15" stroke="#a16207" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M44 136 Q39 135.5 39.3 132 Q40 129 44 128 Q46.5 132 50 135.2 Z" fill="#eab308"/>
    <path d="M38.6 136.2 H68 V138 Q68 141 65 141 H43 Q38.6 141 38.6 137.8 Z" fill="#a16207" stroke="#713f12" stroke-width="1" stroke-linejoin="round"/>
    <path d="M42 140.8 l1.5 -1.4 l1.5 1.4 l1.5 -1.4 l1.5 1.4 l1.5 -1.4 l1.5 1.4 l1.5 -1.4 l1.5 1.4 l1.5 -1.4 l1.5 1.4 l1.5 -1.4 l1.5 1.4 l1.5 -1.4 l1.5 1.4" stroke="#713f12" stroke-width=".7" fill="none"/>
    <path d="M44.5 129.5 Q50 126.6 56 126.4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/><circle cx="60" cy="126.6" r="1" fill="#fff" opacity=".8"/>`),

  iceskates: feet('iceskates', `<path d="M43.5 136.5 Q39 136.2 39.5 131.8 Q40.5 127 47.5 125.5 L49.5 121.5 L64 121 Q67.5 121 67.5 125.5 V136.5 Z" fill="#fff" stroke="#64748b" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M49.5 123.2 L66.8 122.8" stroke="#bae6fd" stroke-width="2.6"/>
    <path d="M51 125.5 L58 128 M51 128 L58 125.5 M51.5 130.5 L58.5 133 M51.5 133 L58.5 130.5" stroke="#94a3b8" stroke-width="1" stroke-linecap="round"/>
    <path d="M40 135.5 H67.5" stroke="#cbd5e1" stroke-width="2.2"/>
    <path d="M45 136.5 V139.4 M62.5 136.5 V139.4" stroke="#94a3b8" stroke-width="2.2"/>
    <path d="M37 139.2 H67 Q69 139.2 69 140.6 Q69 142 67 142 H38.5 Q35.2 142 35.4 139.4 Q35.6 137.2 37.6 137.4" fill="#e2e8f0" stroke="#475569" stroke-width="1" stroke-linejoin="round"/>
    <path class="of-glint" d="M44 140.2 H58" stroke="#fff" stroke-width="1" stroke-linecap="round"/>
    <path d="M42.5 131 Q44.5 128.2 47.5 127.4" stroke="#e0f2fe" stroke-width="1.4" fill="none" stroke-linecap="round"/>`),

  sabatons: feet('sabatons', `<path d="M40 138.2 Q33.5 138 35.6 135.4 Q41.5 131 48 126 L60 122.2 Q67.5 121 67.5 127.5 V138.2 Z" fill="#cbd5e1" stroke="#475569" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M42.5 131.6 Q46.5 134.5 45 138.2 M49 127.5 Q53.5 131.5 52 138.2 M56 124.6 Q61 129.5 59.5 138.2" stroke="#64748b" stroke-width="1.4" fill="none"/>
    <path d="M43.8 131 Q47.6 133.8 46.4 137.4 M50.4 127 Q54.8 131 53.4 137.4 M57.4 124.2 Q62.2 129 61 137.4" stroke="#f8fafc" stroke-width=".9" fill="none"/>
    <path d="M34.6 137 Q36.5 135 39 134" stroke="#facc15" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M35.6 138.4 H67.5" stroke="#334155" stroke-width="2.4" stroke-linecap="round"/>
    <g fill="#facc15" stroke="#a16207" stroke-width=".5"><circle cx="64.5" cy="128" r="1.2"/><circle cx="64.5" cy="133.5" r="1.2"/></g>
    <path d="M40 133.8 Q44 130.8 47.5 129" stroke="#fff" stroke-width="1.4" fill="none" opacity=".75" stroke-linecap="round"/>`),

  flipflops: feet('flipflops', `<ellipse cx="54" cy="138" rx="15.5" ry="3.6" fill="#f97316" stroke="#c2410c" stroke-width="1.3"/>
    <ellipse cx="54" cy="136.4" rx="15.2" ry="3.4" fill="#fdba74" stroke="#c2410c" stroke-width="1"/>
    <ellipse cx="55" cy="130.5" rx="12" ry="6.4" fill="var(--mascot-1)" stroke="var(--mascot-2)" stroke-width="1.5"/>
    <ellipse cx="50.5" cy="128.6" rx="3.6" ry="1.6" fill="#fff" opacity=".3"/>
    <path d="M42.5 134.4 Q46.5 128.5 51 131.6 Q57 127.2 66.5 133.6" stroke="#0369a1" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M42.5 134.4 Q46.5 128.5 51 131.6 Q57 127.2 66.5 133.6" stroke="#38bdf8" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g fill="#f472b6"><circle cx="49.6" cy="130" r="1.3"/><circle cx="52.4" cy="130" r="1.3"/><circle cx="49.6" cy="132.6" r="1.3"/><circle cx="52.4" cy="132.6" r="1.3"/></g><circle cx="51" cy="131.3" r="1" fill="#fde047"/>`),

  stripesocks: feet('stripesocks', `${RAINBOW.map((c, i) => `<path d="${band(55, 131, 13, 7.6, +(123.4 + i * 2.53).toFixed(2), +(123.4 + (i + 1) * 2.53).toFixed(2))}" fill="${c}"/>`).join('')}
    <ellipse cx="55" cy="131" rx="13" ry="7.6" fill="none" stroke="#581c87" stroke-width="1.5" opacity=".8"/>
    <path d="M42.6 131.5 Q43.5 136 48 137.8" stroke="#fff" stroke-width="2.2" fill="none" opacity=".4" stroke-linecap="round"/>
    <ellipse cx="51" cy="128" rx="4" ry="1.6" fill="#fff" opacity=".35"/>`),

  goldsneakers: feet('goldsneakers', `<ellipse class="of-glow" cx="53" cy="133" rx="17" ry="9" fill="#fde047"/>
    ${sneaker('#facc15', '#a16207', '#fde68a', '#facc15')}
    <path d="M51 135.2 Q54 128.6 65 128.2 Q62 130.4 63.6 131.5 Q60 132 60.8 134 Q56.4 133.6 51 135.2 Z" fill="#fff" stroke="#a16207" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M44.5 129.5 Q47.5 127 52.5 126.4" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/>
    ${spark(34.5, 128, 2.8, '#f59e0b', 'of-twinkle')}${spark(43.5, 137.5, 1.8, '#fff', 'of-twinkle', 0.7)}`),

  rocketboots: feet('rocketboots', `<ellipse class="of-glow" cx="57" cy="143" rx="9" ry="4" fill="#fb923c"/>
    <path class="of-flame" d="M51.5 140.5 Q57 151 62.5 140.5 Z" fill="#f97316"/><path class="of-flame" style="animation-delay:.09s" d="M54 140.5 Q57 147 60 140.5 Z" fill="#fde047"/>
    <path d="M52 138 H62 L61 141 H53 Z" fill="#64748b" stroke="#334155" stroke-width=".9" stroke-linejoin="round"/>
    <path d="M${SHOE.slice(1)}" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M44 139 Q38.5 139 39 133.5 Q39.5 129 44 127.6 Q45.5 133.5 50.5 135.5 L50.5 139 Z" fill="#e2e8f0" stroke="#7f1d1d" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M62 125 L70 122.5 L68.5 130 Z" fill="#94a3b8" stroke="#334155" stroke-width=".9" stroke-linejoin="round"/>
    <path d="M51 134.5 L55 128.6 L57 131.4 L61 126.6" stroke="#facc15" stroke-width="1.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M38.6 136.4 H68 V138 Q68 139.8 66 139.8 H42.5 Q38.6 139.8 38.6 137.6 Z" fill="#475569" stroke="#1e293b" stroke-width="1"/>
    <path d="M41 131 Q42.6 129 45 128.6" stroke="#fff" stroke-width="1.4" fill="none" opacity=".85" stroke-linecap="round"/>`),

  balletshoes: feet('balletshoes', `<ellipse cx="55" cy="130" rx="12" ry="6.6" fill="var(--mascot-1)" stroke="var(--mascot-2)" stroke-width="1.4"/>
    <path d="M50 129 Q55 125 59 119 M60 129 Q54 125 49 120" stroke="#f472b6" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M42 138.6 Q38.5 138.4 39 134.5 Q39.6 130.6 44.5 129.4 Q54 132 62 128.6 Q67.5 127.6 67.5 132 V135.8 Q67.5 138.6 64.5 138.6 Z" fill="#fbcfe8" stroke="#db2777" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M44.5 129.4 Q54 132 62 128.6" stroke="#f472b6" stroke-width="1.6" fill="none"/>
    <path d="M40.5 134.5 l2.2 .8 M40.4 136.6 l2.4 .4 M41.6 132.5 l2 1" stroke="#f472b6" stroke-width=".8" stroke-linecap="round"/>
    <path d="M49 131.5 l-3 -1.8 v3.6 Z M49 131.5 l3 -1.8 v3.6 Z" fill="#f472b6" stroke="#db2777" stroke-width=".6" stroke-linejoin="round"/><circle cx="49" cy="131.5" r=".9" fill="#db2777"/>
    <path d="M38.8 138.4 H67" stroke="#db2777" stroke-width="1.2"/>
    <path d="M43 133.6 Q45 132 47.5 132" stroke="#fff" stroke-width="1.3" fill="none" opacity=".75" stroke-linecap="round"/>`),

  hikingboots: feet('hikingboots', `<path d="M43 137 Q38.5 136.5 39 132 Q39.5 127 46 125.5 L59 121.5 Q67.5 120.5 67.5 127 V137 Z" fill="#78716c" stroke="#292524" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M43 137 Q38.5 136.5 39 132 Q39.5 128.5 44 127.4 Q47 132 48.5 137 Z" fill="#92400e" stroke="#451a03" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M62 123 Q66 124 67.5 128 V137 H61 Z" fill="#92400e" opacity=".85"/>
    <path d="M50 128 L57.5 126 M50.5 131 L58 128.6 M51 134 L58.5 131.4" stroke="#dc2626" stroke-width="1.4" stroke-linecap="round"/>
    <g fill="#d4d4d8" stroke="#52525b" stroke-width=".5"><circle cx="58" cy="126" r="1"/><circle cx="58.5" cy="128.6" r="1"/><circle cx="59" cy="131.4" r="1"/></g>
    <path d="M38 136 H68.5 V139.5 Q68.5 141.5 66 141.5 H42 Q38 141.5 38 139 Z" fill="#292524"/>
    <path d="M40 141.5 v-1.6 h2.5 v1.6 M45 141.5 v-1.6 h2.5 v1.6 M50 141.5 v-1.6 h2.5 v1.6 M55 141.5 v-1.6 h2.5 v1.6 M60 141.5 v-1.6 h2.5 v1.6" stroke="#57534e" stroke-width=".8" fill="none"/>
    <path d="M38.4 137 H68.4" stroke="#f97316" stroke-width="1"/>`),

  clownshoes: feet('clownshoes', `<path d="M44 140 Q30.5 140.4 31 133.5 Q32 125.5 44 126 Q52 126.5 58 124 Q67.5 121 67.5 129 V137 Q67.5 140 64 140 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M31.4 136 Q33.5 141.5 44 141.5 H64.5 Q68 141.5 68 138" stroke="#a16207" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M31.4 136 Q33.5 141.5 44 141.5 H64.5 Q68 141.5 68 138" stroke="#facc15" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="38.5" cy="130" rx="4.2" ry="2.2" transform="rotate(-18 38.5 130)" fill="#fff" opacity=".6"/>
    <g stroke="#1e3a8a" stroke-width="1" fill="#3b82f6" stroke-linejoin="round"><path d="M56 127 Q50 121.5 49.5 126.5 Q50 130.5 56 127 Z"/><path d="M56 127 Q62 121.5 62.5 126.5 Q62 130.5 56 127 Z"/><path d="M55.4 127.5 L52.5 133 M56.6 127.5 L59 133" fill="none" stroke="#3b82f6" stroke-width="1.4"/></g>
    <circle cx="56" cy="127" r="1.6" fill="#1e40af"/>`),
};

// ---------- Вещи на спину ----------

export const BACK_MORE = {
  quiver: `<g class="wear-quiver"><g transform="rotate(35 70 80)">
    <path d="M64 12 V-14 M70 12 V-18 M76 12 V-12" stroke="#a16207" stroke-width="1.8"/>
    <path d="M64 -14 l-3.2 -2.4 v-7 l3.2 2.4 l3.2 -2.4 v7 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M70 -18 l-3.2 -2.4 v-7 l3.2 2.4 l3.2 -2.4 v7 Z" fill="#f8fafc" stroke="#64748b" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M76 -12 l-3.2 -2.4 v-7 l3.2 2.4 l3.2 -2.4 v7 Z" fill="#14b8a6" stroke="#134e4a" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M64 -21 V-14 M70 -25 V-18 M76 -19 V-12" stroke="#7c2d12" stroke-width=".6"/>
    <rect x="60" y="8" width="20" height="100" rx="4" fill="#92400e" stroke="#451a03" stroke-width="2"/>
    <rect x="72" y="9" width="7" height="98" rx="3" fill="#451a03" opacity=".3"/>
    <path d="M63.5 15 V44" stroke="#fbbf24" stroke-width=".9" stroke-dasharray="2 1.6"/><path d="M66 15 V44" stroke="#fff" stroke-width="1.6" opacity=".25"/>
    <rect x="59.6" y="22" width="20.8" height="3.4" fill="#facc15" stroke="#a16207" stroke-width=".7"/>
    <rect x="58.5" y="5.5" width="23" height="7" rx="2.6" fill="#78350f" stroke="#451a03" stroke-width="1.4"/>
  </g></g>`,

  surfboard: `<g class="wear-surfboard"><g transform="rotate(-22 70 80)">
    <path d="M70 -12 Q91 28 89 80 Q87 130 70 152 Q53 130 51 80 Q49 28 70 -12 Z" fill="#67e8f9" stroke="#0e7490" stroke-width="2" stroke-linejoin="round"/>
    <path d="M56 18 Q70 13 84 18 L85.6 27 Q70 22 54.4 27 Z" fill="#f97316"/><path d="M54 31 Q70 26 86 31 L86.4 34 Q70 29 53.6 34 Z" fill="#facc15"/>
    <path d="M70 -8 V148" stroke="#fff" stroke-width="1.2" opacity=".8"/>
    <path d="M59 14 Q55 50 56.5 96" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".5"/>
    <path d="M70 126 L63 140 L70 138 Z" fill="#0e7490"/>
  </g></g>`,

  fairywings: `<g class="wear-fairywings">${mirror(`<g class="of-flap">
    <path d="M36 82 C20 52 -8 36 -7 60 C-6 76 16 88 36 88 Z" fill="#f0abfc" fill-opacity=".6" stroke="#c026d3" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M36 93 C18 96 3 110 11 121 C19 128 32 113 38 99 Z" fill="#a5f3fc" fill-opacity=".65" stroke="#0891b2" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M34 84 Q14 66 -1 56 M34 86 Q14 80 -2 72 M35 96 Q22 106 14 117" stroke="#fff" stroke-width="1" fill="none" opacity=".85"/>
    <g fill="#fff"><circle cx="6" cy="58" r="1.6"/><circle cx="14" cy="72" r="1.1"/><circle cx="18" cy="110" r="1.3"/></g></g>`)}
    ${spark(6, 34, 3, '#f5d0fe', 'of-twinkle')}${spark(134, 40, 2.6, '#cffafe', 'of-twinkle', 0.7)}${spark(4, 106, 2.2, '#fff', 'of-twinkle', 1.3)}</g>`,

  banner: `<g class="wear-banner"><path d="M33 108 L20 -6" stroke="#78350f" stroke-width="3.6" stroke-linecap="round"/><path d="M32 108 L19 -6" stroke="#b45309" stroke-width="1.4" stroke-linecap="round"/>
    <g class="of-wave"><path d="M21 1 Q35 -3 50 2 L43.5 11 L51 20.5 Q36 16 22.8 21 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M21.6 6 Q35 2.5 46 6.4 M22.3 16 Q35 12 46.4 16" stroke="#fff" stroke-width="1.4" fill="none"/>
    <path d="M33.5 7 l1.3 2.6 l2.9 .4 l-2.1 2 l.5 2.9 l-2.6 -1.4 l-2.6 1.4 l.5 -2.9 l-2.1 -2 l2.9 -.4 Z" fill="#facc15" stroke="#a16207" stroke-width=".5"/></g>
    <circle cx="19.4" cy="-7.6" r="3.4" fill="#facc15" stroke="#a16207" stroke-width="1"/><circle cx="18.4" cy="-8.6" r="1" fill="#fff" opacity=".8"/></g>`,

  turtleshell: `<g class="wear-turtleshell"><ellipse cx="70" cy="80" rx="60" ry="57" fill="#65a30d" stroke="#365314" stroke-width="2.6"/>
    <path d="${Array.from({ length: 15 }, (_, i) => {
      const a = (i * 24 * Math.PI) / 180;
      return `M${(70 + 51 * Math.cos(a)).toFixed(1)} ${(80 + 48 * Math.sin(a)).toFixed(1)} L${(70 + 60 * Math.cos(a)).toFixed(1)} ${(80 + 57 * Math.sin(a)).toFixed(1)}`;
    }).join(' ')}" stroke="#365314" stroke-width="1.8"/>
    <ellipse cx="70" cy="80" rx="51" ry="48" fill="#4d7c0f" stroke="#365314" stroke-width="1.8"/>
    <path d="M17 62 A57 54 0 0 1 52 26" stroke="#bef264" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M118 104 A57 54 0 0 1 96 128" stroke="#365314" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/></g>`,

  kite: `<g class="wear-kite"><path d="M122 106 Q136 74 121 36" stroke="#e2e8f0" stroke-width="1.1" fill="none"/><path d="M122 106 Q136 74 121 36" stroke="#64748b" stroke-width=".5" fill="none"/>
    <g class="of-bob"><path d="M118 -4 L116.5 12 L102 9 Z" fill="#ef4444"/><path d="M118 -4 L133 12 L116.5 12 Z" fill="#facc15"/><path d="M133 12 L121 36 L116.5 12 Z" fill="#3b82f6"/><path d="M102 9 L116.5 12 L121 36 Z" fill="#22c55e"/>
    <path d="M118 -4 L133 12 L121 36 L102 9 Z" fill="none" stroke="#334155" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M118 -4 L121 36 M102 9 L133 12" stroke="#78350f" stroke-width="1"/>
    <path d="M106 6 L114 1" stroke="#fff" stroke-width="1.4" opacity=".6" stroke-linecap="round"/>
    <path d="M121 36 Q127 44 121 50 Q115 57 121 64" stroke="#64748b" stroke-width="1" fill="none"/>
    <path d="M124 42 l-3 -2 v4 Z M124 42 l3 -2 v4 Z" fill="#ef4444"/><path d="M117.5 54 l-3 -2 v4 Z M117.5 54 l3 -2 v4 Z" fill="#facc15"/><path d="M121 64 l-3 -2 v4 Z M121 64 l3 -2 v4 Z" fill="#3b82f6"/></g></g>`,

  crystalwings: `<g class="wear-crystalwings">${mirror(`<g class="of-flap of-slow">
    <ellipse class="of-glow" cx="14" cy="78" rx="24" ry="40" fill="#67e8f9"/>
    <path d="M34 76 L6 22 L-4 52 L30 88 Z" fill="#a5f3fc" stroke="#0891b2" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M32 86 L-10 68 L-3 96 L32 97 Z" fill="#67e8f9" stroke="#0891b2" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M34 97 L5 116 L17 126 L38 105 Z" fill="#cffafe" stroke="#0891b2" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M34 76 L1 38 M32 86 L-6 82 M34 97 L11 121" stroke="#fff" stroke-width="1.2" opacity=".85"/>
    <path d="M6 22 L10 50 L30 88 M-10 68 L10 84" stroke="#0e7490" stroke-width=".8" opacity=".5" fill="none"/></g>`)}
    ${spark(4, 18, 3.4, '#fff', 'of-twinkle')}${spark(138, 30, 3, '#e0f2fe', 'of-twinkle', 0.6)}${spark(-6, 104, 2.6, '#fff', 'of-twinkle', 1.1)}${spark(144, 110, 2.4, '#cffafe', 'of-twinkle', 1.6)}</g>`,
};

// Убираем переносы строк и отступы из разметки (их много — Препи бывает на странице десятками).
for (const dict of [BODY_ART, FEET_ART, BACK_MORE]) for (const k of Object.keys(dict)) dict[k] = dict[k].replace(/\s*\n\s*/g, ' ').trim();
