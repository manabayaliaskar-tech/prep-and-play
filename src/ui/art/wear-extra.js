// Новые вещи: в руке (HAND_ART) и дополнительные шапки, очки и украшения на шею (HEAD_MORE, FACE_MORE, NECK_MORE).
// Правила координат — в комментариях к HAND, HEAD, FACE, NECK в ./wear.js.
// Без id и градиентов: на странице бывает много Препи сразу, поэтому объём — слоями (тень, блик, контур темнее заливки).

const f = (n) => +n.toFixed(1);
const rad = (a) => (a * Math.PI) / 180;
const LJ = 'stroke-linejoin="round" stroke-linecap="round"';
/** Обводка: цвет и толщина, скруглённые стыки. */
const st = (c, w = 1.5) => `stroke="${c}" stroke-width="${w}" ${LJ}`;

/** Пятиконечная (или n-конечная) звезда — путь. */
function starD(x, y, R, r = R * 0.45, n = 5) {
  const p = [];
  for (let k = 0; k < n * 2; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / n;
    const rr = k % 2 ? r : R;
    p.push(`${f(x + rr * Math.cos(a))} ${f(y + rr * Math.sin(a))}`);
  }
  return `M${p.join(' L')} Z`;
}
/** Четырёхлучевая искорка (мерцает через CSS-класс tw). */
const spark = (x, y, s, fill = '#fde68a', delay = 0) =>
  `<path class="tw" style="animation-delay:${delay}s" d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z" fill="${fill}"/>`;
/** Пушистый край: дуга окружности (cx, cy, r) от угла a0 до a1 из n «бугорков» высотой b. Возвращает путь без Z. */
function bumpy(cx, cy, r, a0, a1, n, b) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n);
    const [x, y] = [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    if (!i) d += `M${f(x)} ${f(y)}`;
    else {
      const m = rad(a0 + ((a1 - a0) * (i - 0.5)) / n);
      d += ` Q${f(cx + (r + 2 * b) * Math.cos(m))} ${f(cy + (r + 2 * b) * Math.sin(m))} ${f(x)} ${f(y)}`;
    }
  }
  return d;
}
/** Сегмент шарика-колбаски (для собачки из шариков). */
const sausage = (cx, cy, rx, ry, rot) =>
  `<g transform="rotate(${rot} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#f43f5e" ${st('#9f1239', 1.3)}/><ellipse cx="${f(cx - rx * 0.35)}" cy="${f(cy - ry * 0.35)}" rx="${f(rx * 0.35)}" ry="${f(ry * 0.4)}" fill="#fff" opacity=".55"/></g>`;

// ---------------------------------------------------------------- В руке
// Центр кисти — (0, 0), кисть (круг r 7) рисуется поверх. Вещь торчит вверх; по x держимся в −20…12,
// иначе у поднятой руки (128, 56) край вещи обрежется рамкой картинки.

export const HAND_ART = {
  book: `<g class="wear-book" transform="rotate(-8)">
    <path d="M1.5 -6 L2 7 L3.5 5 L5 7 L4.5 -6 Z" fill="#e11d48" ${st('#9f1239', 0.8)}/>
    <path d="M0 -2 Q-9 -7 -17 -4 L-18 -30 Q-9 -33 0 -28 Q9 -33 15 -30 L14 -4 Q8 -7 0 -2 Z" fill="#2563eb" ${st('#1e3a8a')}/>
    <path d="M0 -5 Q-8 -9 -15.5 -7 L-16 -29 Q-8 -31 0 -26 Z" fill="#fffbeb" ${st('#c9b88f', 1)}/>
    <path d="M0 -5 Q7 -9 12.5 -7 L13 -29 Q7 -31 0 -26 Z" fill="#fef3c7" ${st('#c9b88f', 1)}/>
    <path d="M0 -26 V-5 Q-2.5 -7 -4.5 -7.4 V-28 Z" fill="#d6c7a1" opacity=".45"/>
    <path d="M-13 -24 Q-8.5 -26 -4 -23.6 M-13 -20 Q-8.5 -22 -4 -19.6 M-13 -16 Q-8.5 -18 -4 -15.6 M-13 -12 Q-10 -13.5 -7 -12.2 M3.5 -12.6 Q7 -14 10 -12.8" stroke="#94a3b8" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M3.5 -17 L10 -17 L6.7 -25 Z" fill="#fdba74" ${st('#ea580c', 1)}/>
    <path d="M-17.2 -7 L-17.9 -28" stroke="#60a5fa" stroke-width="1.2" stroke-linecap="round"/>
  </g>`,

  wand: `<g class="wear-wand">
    <g transform="rotate(8)">
      <rect x="-2.4" y="-30" width="4.8" height="40" rx="2.4" fill="#4c2a85" stroke="#2e1065" stroke-width="1.3"/>
      <rect x="-2.4" y="-30" width="4.8" height="8" rx="2.4" fill="#f8fafc" stroke="#a5b4fc" stroke-width="1"/>
      <path d="M-.9 -19 V6" stroke="#a78bfa" stroke-width="1.1" stroke-linecap="round" opacity=".8"/>
      <rect x="-3.2" y="-22" width="6.4" height="2.6" rx="1.2" fill="#facc15" stroke="#a16207" stroke-width=".7"/>
    </g>
    <g class="wand-star"><path d="${starD(4.5, -35, 8.5, 3.9)}" fill="#fde047" ${st('#ca8a04', 1.4)}/><path d="${starD(4.5, -34.6, 4.2, 1.9)}" fill="#fef9c3"/></g>
    ${spark(-7, -41, 3.2, '#fde68a', 0)}${spark(-9, -27, 2.3, '#f0abfc', 0.6)}${spark(10, -47, 2.4, '#fde68a', 1.1)}
  </g>`,

  icecream: `<g class="wear-icecream" transform="rotate(8)">
    <path d="M-8 -14 L8 -14 L1 8 Q0 9.6 -1 8 Z" fill="#f2b45c" ${st('#a16207', 1.4)}/>
    <path d="M-6 -14 L3.5 .2 M-1 -14 L5.1 -4.9 M4 -14 L6.7 -9.9 M-6.2 -8.5 L2.2 4.2 M6 -14 L-3.5 .2 M1 -14 L-5.1 -4.9 M-4 -14 L-6.7 -9.9 M6.2 -8.5 L-2.2 4.2" stroke="#c7832a" stroke-width="1" stroke-linecap="round"/>
    <path d="M-10 -16 Q-12 -29 0 -29.5 Q12 -29 10 -16 Q8.5 -13 6.5 -15 Q4.5 -11 2.5 -15 Q0 -12.5 -2.5 -15 Q-5 -9.5 -6.5 -15 Q-9 -13 -10 -16 Z" fill="#86efac" ${st('#15803d', 1.4)}/>
    <path d="M-9.5 -28.5 Q-11 -42 -1 -42.5 Q9 -42 8 -28.5 Q5.5 -26 3.5 -28 Q1 -25 -2 -28 Q-5 -26.5 -9.5 -28.5 Z" fill="#f9a8d4" ${st('#be185d', 1.4)}/>
    <path d="M-5 -37 l1.6 -1 M2 -38.5 l1.4 1.2 M-1.5 -33.5 l1.8 .3 M4 -33 l.6 -1.6 M-6 -32 l1 1.3" stroke-width="1.4" stroke-linecap="round" stroke="#7c3aed"/>
    <path d="M-3 -40.5 l.4 1.7 M5 -36 l-1.6 .8" stroke="#facc15" stroke-width="1.4" stroke-linecap="round"/>
    <ellipse cx="-5" cy="-24" rx="2.6" ry="1.6" fill="#fff" opacity=".6"/><ellipse cx="-5.5" cy="-37.5" rx="2.2" ry="1.4" fill="#fff" opacity=".6"/>
    <path d="M1.5 -45 Q2.5 -49.5 6 -50.5" stroke="#166534" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <circle cx="1" cy="-44.5" r="3.3" fill="#ef4444" stroke="#991b1b" stroke-width="1.1"/><circle cx="0" cy="-45.6" r="1" fill="#fff" opacity=".8"/>
  </g>`,

  trophy: `<g class="wear-trophy" transform="rotate(-8)">
    <rect x="-8" y="3" width="16" height="6" rx="1.8" fill="#7c2d12" ${st('#431407', 1.2)}/>
    <rect x="-5.5" y="0" width="11" height="4" rx="1" fill="#facc15" ${st('#a16207', 1.1)}/>
    <path d="M-2.5 -14 L2.5 -14 L3 1 L-3 1 Z" fill="#eab308" ${st('#a16207', 1.1)}/>
    <path d="M-11 -33 Q-19 -33 -17.5 -25.5 Q-16 -19.5 -8 -18.5 M11 -33 Q19 -33 17.5 -25.5 Q16 -19.5 8 -18.5" fill="none" stroke="#a16207" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M-11 -33 Q-19 -33 -17.5 -25.5 Q-16 -19.5 -8 -18.5 M11 -33 Q19 -33 17.5 -25.5 Q16 -19.5 8 -18.5" fill="none" stroke="#facc15" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M-12 -36 H12 Q12.5 -20 0 -14.5 Q-12.5 -20 -12 -36 Z" fill="#facc15"/>
    <path d="M5 -35.5 H11.6 Q11.8 -21 1.5 -15 Q8 -22 5 -35.5 Z" fill="#eab308"/>
    <path d="M-12 -36 H12 Q12.5 -20 0 -14.5 Q-12.5 -20 -12 -36 Z" fill="none" ${st('#a16207')}/>
    <ellipse cx="0" cy="-14" rx="4.5" ry="2" fill="#fde047" ${st('#a16207', 1.1)}/>
    <ellipse cx="0" cy="-36" rx="12" ry="2.6" fill="#fef08a" ${st('#a16207', 1.3)}/><ellipse cx="0" cy="-35.7" rx="9.4" ry="1.4" fill="#ca8a04"/>
    <path d="${starD(0, -26, 5, 2.2)}" fill="#fff7cc" ${st('#ca8a04', 1)}/>
    <path d="M-8.5 -32 Q-8.5 -23 -4 -18.5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".75"/>
    ${spark(-15, -40, 3.4, '#fef08a', 0)}${spark(10, -44, 2.6, '#fef08a', 0.8)}
  </g>`,

  pencil: `<g class="wear-pencil" transform="rotate(12)">
    <rect x="-4.5" y="7" width="9" height="7.5" rx="2.6" fill="#f9a8d4" ${st('#be185d', 1.3)}/>
    <rect x="-4.9" y="2.5" width="9.8" height="6" rx="1" fill="#cbd5e1" ${st('#64748b', 1.2)}/>
    <path d="M-4.6 4.5 H4.6 M-4.6 6.5 H4.6" stroke="#94a3b8" stroke-width=".8"/>
    <rect x="-4.5" y="-30" width="9" height="32.5" fill="#facc15"/><rect x="-1.5" y="-30" width="3" height="32.5" fill="#fde68a"/><rect x="1.5" y="-30" width="3" height="32.5" fill="#eab308"/>
    <rect x="-4.5" y="-30" width="9" height="32.5" fill="none" ${st('#a16207', 1.3)}/>
    <path d="M-4.5 -30 L4.5 -30 L1.7 -39 L-1.7 -39 Z" fill="#f5d0a1" ${st('#b7791f', 1.2)}/>
    <path d="M1.5 -30 L4.5 -30 L1.7 -39 L.6 -39 Z" fill="#e3b47a"/>
    <path d="M-4.5 -30 Q-3 -33 -1.5 -30 Q0 -33 1.5 -30 Q3 -33 4.5 -30 Z" fill="#facc15" ${st('#a16207', 1.1)}/>
    <path d="M-1.7 -39 L1.7 -39 L0 -44 Z" fill="#374151" ${st('#1f2937', 1)}/>
  </g>`,

  umbrella: `<g class="wear-umbrella" transform="rotate(-10)">
    <path d="M0 -44 V6 Q0 12 5 12 Q9.5 12 9.5 7.5" fill="none" stroke="#5b2c06" stroke-width="3.8" stroke-linecap="round"/>
    <path d="M0 -44 V6 Q0 12 5 12 Q9.5 12 9.5 7.5" fill="none" stroke="#a16207" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M-17 -30 Q-16 -46 0 -47 Q16 -46 17 -30 Q12.8 -33.5 8.5 -30 Q4.3 -33.5 0 -30 Q-4.3 -33.5 -8.5 -30 Q-12.8 -33.5 -17 -30 Z" fill="#7c3aed"/>
    <path d="M0 -47 Q-6 -42 -8.5 -30 Q-4.3 -33.5 0 -30 Z M0 -47 Q14 -44 17 -30 Q12.8 -33.5 8.5 -30 Q7 -41 0 -47 Z" fill="#a78bfa"/>
    <path d="M-17 -30 Q-16 -46 0 -47 Q16 -46 17 -30 Q12.8 -33.5 8.5 -30 Q4.3 -33.5 0 -30 Q-4.3 -33.5 -8.5 -30 Q-12.8 -33.5 -17 -30 Z" fill="none" ${st('#4c1d95')}/>
    <path d="M-12.5 -37 Q-9 -43 -3 -44.6" stroke="#fff" stroke-width="1.8" opacity=".55" fill="none" stroke-linecap="round"/>
    <g fill="#facc15">${[-17, -8.5, 8.5, 17].map((x) => `<circle cx="${x}" cy="-30" r="1.3"/>`).join('')}<circle cx="0" cy="-48" r="1.9" stroke="#a16207" stroke-width=".8"/></g>
  </g>`,

  pennant: `<g class="wear-pennant" transform="rotate(-8)">
    <rect x="-1.4" y="-42" width="2.8" height="53" rx="1.4" fill="#b45309" ${st('#78350f', 1)}/>
    <g class="flag">
      <path d="M1.4 -41 C6 -38.5 11 -37.5 17 -33 C11 -30.5 6 -27.5 1.4 -25 Z" fill="#7c3aed" ${st('#4c1d95', 1.4)}/>
      <path d="M1.4 -41 C3 -40 4 -39.5 5 -39 V-27 L1.4 -25 Z" fill="#facc15"/>
      <path d="M5 -36.5 C9 -35 12 -34.5 14 -33" stroke="#c4b5fd" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="${starD(9.3, -32.6, 3.3, 1.5)}" fill="#fff"/>
    </g>
    <circle cx="0" cy="-43" r="2.5" fill="#facc15" ${st('#a16207', 1)}/>
  </g>`,

  lollipop: `<g class="wear-lollipop">
    <rect x="-1.3" y="-22" width="2.6" height="32" rx="1.3" fill="#f8fafc" ${st('#94a3b8', 1)}/>
    <circle cx="-2" cy="-31" r="12" fill="#f472b6"/>
    <path d="M-2 -31 m0 -1.5 a1.5 1.5 0 1 1 -1.5 1.5 a3.5 3.5 0 1 1 3.5 3.5 a5.5 5.5 0 1 1 -5.5 -5.5 a7.5 7.5 0 1 1 7.5 7.5" stroke="#fff" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M-2 -31 m0 1.5 a1.5 1.5 0 1 1 1.5 -1.5 a3.5 3.5 0 1 1 -3.5 -3.5 a5.5 5.5 0 1 1 5.5 5.5" stroke="#a78bfa" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".9"/>
    <circle cx="-2" cy="-31" r="12" fill="none" ${st('#be185d')}/>
    <ellipse cx="-7.5" cy="-37" rx="3" ry="1.7" transform="rotate(-38 -7.5 -37)" fill="#fff" opacity=".75"/>
    <path d="M0 -17 L-6 -21 L-6 -13 Z M0 -17 L6 -21 L6 -13 Z" fill="#38bdf8" ${st('#0369a1', 1)}/><circle cx="0" cy="-17" r="1.9" fill="#0ea5e9" ${st('#0369a1', .8)}/>
  </g>`,

  lasersword: `<g class="wear-lasersword" transform="rotate(6)">
    <g class="blade">
      <rect x="-6.5" y="-51" width="13" height="45" rx="6.5" fill="#22d3ee" opacity=".2"/>
      <rect x="-4.2" y="-49" width="8.4" height="42" rx="4.2" fill="#22d3ee" opacity=".55"/>
      <rect x="-2" y="-47.5" width="4" height="40" rx="2" fill="#ecfeff"/>
    </g>
    <rect x="-3.4" y="-9.5" width="6.8" height="5" rx="1" fill="#475569" ${st('#1e293b', 1)}/>
    <rect x="-2.8" y="-5" width="5.6" height="15" rx="1.2" fill="#cbd5e1" ${st('#334155', 1)}/>
    <path d="M-2.8 -1 H2.8 M-2.8 2.5 H2.8 M-2.8 6 H2.8" stroke="#64748b" stroke-width="1"/>
    <rect x="-1.8" y="-4" width="1.1" height="13" fill="#fff" opacity=".6"/>
    <rect x="2.2" y="-3.6" width="1.8" height="3.4" rx=".7" fill="#ef4444"/>
    <rect x="-3.4" y="9.5" width="6.8" height="3" rx="1.2" fill="#475569" ${st('#1e293b', 1)}/>
    ${spark(-7, -38, 2.4, '#a5f3fc', 0.2)}${spark(9, -26, 2, '#a5f3fc', 0.9)}
  </g>`,

  fishingrod: `<g class="wear-fishingrod">
    <circle cx="-4.6" cy="7" r="3.8" fill="#94a3b8" ${st('#475569', 1.1)}/><circle cx="-4.6" cy="7" r="1.3" fill="#475569"/>
    <path d="M-1.9 12 L1.9 12 L9.6 -43 L8.4 -43.2 Z" fill="#78350f" ${st('#451a03', 1)}/>
    <path d="M-2 12 L2 12 L3.2 1 L-.6 1 Z" fill="#d6a46b" ${st('#8a5a2b', 1)}/>
    <path d="M5 -14 h2.6 M7.3 -30 h2" stroke="#cbd5e1" stroke-width="1.2"/>
    <path d="M9 -43.5 Q11.5 -32 10 -18.5" stroke="#cbd5e1" stroke-width=".9" fill="none"/>
    <g class="fish"><g transform="rotate(8 10 -11)">
      <path d="M10 -18 Q14.2 -14 13.4 -9 Q12.6 -5 10 -4 Q7.4 -5 6.6 -9 Q5.8 -14 10 -18 Z" fill="#fb923c" ${st('#c2410c', 1.1)}/>
      <path d="M10 -4.5 L6.6 .5 L10 -1.3 L13.4 .5 Z" fill="#fdba74" ${st('#c2410c', 1)}/>
      <path d="M7.6 -9 Q10 -7.5 12.4 -9" stroke="#c2410c" stroke-width=".9" fill="none"/>
      <circle cx="9" cy="-14.2" r="1.3" fill="#fff"/><circle cx="9.2" cy="-14" r=".6" fill="#1f2937"/>
    </g></g>
  </g>`,

  coffee: `<g class="wear-coffee">
    <g class="steam" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"><path d="M-4 -31 Q-7 -35 -4 -39 Q-1 -43 -4 -47"/><path style="animation-delay:.8s" d="M3 -31 Q0 -35 3 -39 Q6 -43 3 -47"/></g>
    <path d="M-9 -22 L9 -22 L6.5 8 Q0 9.5 -6.5 8 Z" fill="#f8fafc"/>
    <path d="M4.5 -22 L9 -22 L6.5 8 L3.5 8.6 Z" fill="#e2e8f0"/>
    <path d="M-9 -22 L9 -22 L6.5 8 Q0 9.5 -6.5 8 Z" fill="none" ${st('#94a3b8', 1.3)}/>
    <path d="M-8.2 -14 L8.2 -14 L7.3 -3 L-7.3 -3 Z" fill="#b45309" ${st('#78350f', 1.2)}/>
    <path d="M0 -6 C-4 -8.5 -3 -11.8 0 -10 C3 -11.8 4 -8.5 0 -6 Z" fill="#fde68a"/>
    <path d="M-10.5 -22 Q-10.5 -25 -9 -25.5 L9 -25.5 Q10.5 -25 10.5 -22 Z" fill="#44403c" ${st('#1c1917', 1.2)}/>
    <path d="M-8 -25.5 Q-7 -28.5 -5 -28.5 L5 -28.5 Q7 -28.5 8 -25.5 Z" fill="#57534e" ${st('#1c1917', 1.1)}/>
    <rect x="1.5" y="-28" width="3.2" height="1.3" rx=".6" fill="#1c1917"/>
    <path d="M-7 -27.5 L-4 -27.8" stroke="#fff" stroke-width="1" opacity=".35" stroke-linecap="round"/>
  </g>`,

  phone: `<g class="wear-phone" transform="rotate(-8)">
    <rect x="9" y="-25" width="1.4" height="6" rx=".6" fill="#334155"/>
    <rect x="-9" y="-32" width="18" height="35" rx="4" fill="#1e293b" ${st('#0f172a', 1.4)}/>
    <rect x="-7.3" y="-30" width="14.6" height="31" rx="2.6" fill="#4f46e5"/>
    <path d="M-7.3 -12 Q0 -16 7.3 -20 V-1.4 Q7.3 1 4.7 1 H-4.7 Q-7.3 1 -7.3 -1.4 Z" fill="#7c3aed" opacity=".55"/>
    <rect x="-2.5" y="-30" width="5" height="1.8" rx=".9" fill="#0f172a"/>
    <rect x="-5.6" y="-26" width="8.5" height="4.2" rx="2.1" fill="#fff"/><rect x="-1.4" y="-20.6" width="7.2" height="4.2" rx="2.1" fill="#4ade80"/><rect x="-5.6" y="-15.2" width="6" height="4.2" rx="2.1" fill="#fff"/>
    <path d="M3.6 -9.4 C1.6 -10.8 2 -12.9 3.6 -11.9 C5.2 -12.9 5.6 -10.8 3.6 -9.4 Z" fill="#f43f5e"/>
    <path d="M-7.3 -28 L2 -30 L-7.3 -12 Z" fill="#fff" opacity=".13"/>
  </g>`,

  telescope: `<g class="wear-telescope" transform="rotate(-10)">
    <rect x="-2" y="2" width="4" height="8" rx="1" fill="#1f2937" ${st('#111827', 1)}/>
    <rect x="-3.4" y="-15" width="6.8" height="18" rx="1" fill="#1e3a8a" ${st('#172554', 1.2)}/>
    <rect x="-4.6" y="-31" width="9.2" height="17" rx="1" fill="#1d4ed8" ${st('#172554', 1.2)}/>
    <path d="M-4.6 -31 L-6.4 -43 L6.4 -43 L4.6 -31 Z" fill="#2563eb" ${st('#172554', 1.2)}/>
    <path d="M1.5 -30 V-15 M1.2 -14 V2" stroke="#172554" stroke-width="1.6" opacity=".35"/>
    <path d="M-2.4 -40 L-2 -32 M-2.2 -29 V-16 M-1.6 -13 V1" stroke="#fff" stroke-width="1.3" opacity=".3" stroke-linecap="round"/>
    <rect x="-4.2" y="-16.5" width="8.4" height="3" rx="1" fill="#facc15" ${st('#a16207', .9)}/>
    <rect x="-5.4" y="-32.5" width="10.8" height="3" rx="1" fill="#facc15" ${st('#a16207', .9)}/>
    <rect x="-7.2" y="-46" width="14.4" height="4" rx="1.5" fill="#facc15" ${st('#a16207', 1)}/>
    <ellipse cx="0" cy="-46" rx="6.2" ry="1.6" fill="#7dd3fc" ${st('#0369a1', .8)}/>
    <path d="${starD(0, -23, 2.6, 1.1)}" fill="#fde68a"/><circle cx="-2.2" cy="-27" r=".7" fill="#fde68a"/><circle cx="2.4" cy="-19.6" r=".6" fill="#fde68a"/>
  </g>`,

  sparkler: `<g class="wear-sparkler">
    <path d="M0 10 V-22" stroke="#9ca3af" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M0 -9 V-23" stroke="#57534e" stroke-width="3.2" stroke-linecap="round"/>
    <g class="burst">
      <circle cx="0" cy="-29" r="10" fill="#fde047" opacity=".3"/>
      <g stroke-linecap="round" stroke-width="1.4">${Array.from({ length: 14 }, (_, k) => {
        const a = rad(k * (360 / 14) + 6);
        const r1 = k % 2 ? 9 : 12.5;
        return `<path d="M${f(3 * Math.cos(a))} ${f(-29 + 3 * Math.sin(a))} L${f(r1 * Math.cos(a))} ${f(-29 + r1 * Math.sin(a))}" stroke="${k % 3 ? '#facc15' : '#fb923c'}"/>`;
      }).join('')}</g>
      <g fill="#fef08a">${[[-11, -36], [10, -38], [-8, -19], [11, -22], [1, -43]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1"/>`).join('')}</g>
      <circle cx="0" cy="-29" r="3.4" fill="#fff"/>
    </g>
  </g>`,

  bouquet: `<g class="wear-bouquet">
    <path d="M-2 -16 Q-17 -20 -17 -33 Q-8 -27 -2 -16 Z M2 -16 Q14 -19 13 -32 Q5 -27 2 -16 Z" fill="#4ade80" ${st('#15803d', 1.2)}/>
    <path d="M-7 -21 Q-12 -26 -14 -30 M6 -21 Q10 -25 11 -29" stroke="#15803d" stroke-width=".9" fill="none" opacity=".7"/>
    <g fill="#fff" ${st('#cbd5e1', .8)}>${Array.from({ length: 8 }, (_, k) => `<ellipse cx="-1" cy="-42.5" rx="1.9" ry="3.6" transform="rotate(${k * 45} -1 -38)"/>`).join('')}</g>
    <circle cx="-1" cy="-38" r="2.6" fill="#facc15" ${st('#ca8a04', .8)}/>
    <path d="M1.5 -36 L4 -32.5 L6 -38 L8 -32.5 L10.5 -36 Q12 -27.5 6 -25.5 Q0 -27.5 1.5 -36 Z" fill="#facc15" ${st('#ca8a04', 1.1)}/>
    <circle cx="-7" cy="-28" r="6.5" fill="#f43f5e" ${st('#9f1239', 1.2)}/>
    <path d="M-7 -28 m-1 -.5 a1.4 1.4 0 1 1 1.6 1.4 a3 3 0 1 1 -3 -3.2 M-12 -26 Q-8 -22 -3 -25" stroke="#be123c" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <g fill="#60a5fa" ${st('#1d4ed8', .7)}><circle cx="-13" cy="-37" r="2"/><circle cx="10" cy="-41" r="1.8"/><circle cx="-14.5" cy="-20.5" r="1.7"/></g>
    <path d="M-12 -20 L11 -20 L2.5 8 L-2.5 8 Z" fill="#fbcfe8" ${st('#db2777', 1.3)}/>
    <path d="M-12 -20 Q-1 -13 11 -20 L7.5 -9 Q0 -6 -8.5 -9 Z" fill="#f9a8d4" ${st('#db2777', 1.1)}/>
    <path d="M0 -7 L-6 -10.5 L-6 -3.5 Z M0 -7 L6 -10.5 L6 -3.5 Z" fill="#e11d48" ${st('#9f1239', 1)}/><circle cx="0" cy="-7" r="1.8" fill="#be123c"/>
  </g>`,

  magnifier: `<g class="wear-magnifier" transform="rotate(-12)">
    <rect x="-2.7" y="-13" width="5.4" height="23" rx="2.7" fill="#92400e" ${st('#5c2c0b', 1.2)}/>
    <path d="M-1.2 -10 V7" stroke="#d6a46b" stroke-width="1.1" stroke-linecap="round"/>
    <rect x="-3.2" y="-15.5" width="6.4" height="4" rx="1" fill="#fbbf24" ${st('#a16207', 1)}/>
    <circle cx="0" cy="-27" r="10.5" fill="#bae6fd" fill-opacity=".45"/>
    <circle cx="0" cy="-27" r="10.5" fill="none" stroke="#a16207" stroke-width="4"/>
    <circle cx="0" cy="-27" r="10.5" fill="none" stroke="#fbbf24" stroke-width="2"/>
    <path d="M-5.8 -30.5 Q-4.6 -34.5 -.6 -35.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M4.6 -23 Q4 -21 2.4 -20.2" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".7"/>
  </g>`,

  calculator: `<g class="wear-calculator" transform="rotate(-8)">
    <rect x="-10" y="-36" width="20" height="38" rx="3" fill="#334155" ${st('#0f172a', 1.4)}/>
    <path d="M-8.5 -34.6 H8.5" stroke="#64748b" stroke-width="1" stroke-linecap="round"/>
    <rect x="-7.5" y="-33" width="15" height="7.5" rx="1.2" fill="#bef264" ${st('#1e293b', 1)}/>
    <path d="M.6 -31.6 V-27 M2.2 -31.6 H4.4 V-29.3 H2.2 V-27 H4.4 M5.2 -31.6 H6.8 V-27 H5.2 M5.6 -29.3 H6.8" stroke="#365314" stroke-width=".9" fill="none"/>
    ${Array.from({ length: 16 }, (_, k) => {
      const [r, c] = [Math.floor(k / 4), k % 4];
      const fill = c === 3 ? '#f97316' : r === 0 ? '#cbd5e1' : '#94a3b8';
      return `<rect x="${f(-7.6 + c * 4.1)}" y="${f(-22.5 + r * 4.3)}" width="3.2" height="3" rx=".9" fill="${fill}"/>`;
    }).join('')}
  </g>`,

  globe: `<g class="wear-globe">
    <path d="M0 4 Q0 -7 4.5 -12" stroke="#a16207" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M0 4 Q0 -7 4.5 -12" stroke="#facc15" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M-7.5 7 Q0 2 7.5 7 L6.5 9.5 Q0 11 -6.5 9.5 Z" fill="#facc15" ${st('#a16207', 1.2)}/>
    <g transform="rotate(-18 0 -26)">
      <circle cx="0" cy="-26" r="12" fill="#38bdf8"/>
      <path d="M-8.5 -33 Q-4 -37.5 1 -34 Q3 -30 -1 -28 Q-2.5 -23.5 -6 -25.5 Q-10.5 -28 -8.5 -33 Z M3 -23.5 Q8 -26 10 -21 Q8 -16 4 -17 Q1 -20 3 -23.5 Z M4.5 -37 Q8.5 -36 8.5 -32.5 Q5.5 -32 4.5 -37 Z M-9 -19 Q-5 -18 -4 -15.5 Q-8 -15 -9 -19 Z" fill="#4ade80" ${st('#15803d', .9)}/>
      <path d="M-12 -26 H12 M-10.4 -32 H10.4 M-10.4 -20 H10.4" stroke="#fff" stroke-width=".7" opacity=".35"/>
      <path d="M0 -38 A12 12 0 0 1 0 -14 A8 12 0 0 0 0 -38 Z" fill="#0c4a6e" opacity=".25"/>
      <circle cx="0" cy="-26" r="12" fill="none" ${st('#0369a1', 1.4)}/>
      <ellipse cx="-5" cy="-31.5" rx="3.4" ry="2.1" transform="rotate(-30 -5 -31.5)" fill="#fff" opacity=".6"/>
      <path d="M0 -11.5 A14.5 14.5 0 0 1 0 -40.5" fill="none" stroke="#a16207" stroke-width="3.4"/>
      <path d="M0 -11.5 A14.5 14.5 0 0 1 0 -40.5" fill="none" stroke="#facc15" stroke-width="1.8"/>
      <circle cx="0" cy="-40.5" r="1.8" fill="#facc15" ${st('#a16207', .8)}/><circle cx="0" cy="-11.5" r="1.8" fill="#facc15" ${st('#a16207', .8)}/>
    </g>
  </g>`,

  torch: `<g class="wear-torch">
    <circle class="glow" cx="0" cy="-33" r="13" fill="#fb923c" opacity=".22"/>
    <path d="M-2.2 12 L2.2 12 L3.3 -14 L-3.3 -14 Z" fill="#92400e" ${st('#5c2c0b', 1.3)}/>
    <path d="M-2.9 -8 L2.9 -11 M-2.7 -3 L2.8 -6 M-2.5 2 L2.6 -1" stroke="#d6a46b" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M-4 -13 L4 -13 L7 -22 L-7 -22 Z" fill="#78716c" ${st('#44403c', 1.3)}/>
    <path d="M2 -13.5 L4 -13.5 L6.5 -21.5 L3.5 -21.5 Z" fill="#57534e" opacity=".6"/>
    <rect x="-7.8" y="-24" width="15.6" height="3" rx="1.2" fill="#a8a29e" ${st('#44403c', 1)}/>
    <g fill="#d6d3d1"><circle cx="-3" cy="-17.5" r=".9"/><circle cx="3" cy="-17.5" r=".9"/></g>
    <g class="flame">
      <path d="M0 -49 Q4 -41 8 -37 Q10.5 -31 7 -25.5 Q0 -21.5 -7 -25.5 Q-10.5 -31 -6 -37.5 Q-5 -33.5 -2 -33.5 Q-5 -41 0 -49 Z" fill="#f97316" ${st('#c2410c', 1)}/>
      <path d="M.5 -41 Q4.5 -35 5.2 -30.5 Q5.2 -26.5 0 -25.5 Q-5 -26.5 -5 -30.5 Q-4 -34.5 -1.5 -33.5 Q-2 -37.5 .5 -41 Z" fill="#facc15"/>
      <ellipse cx="0" cy="-28.6" rx="2.4" ry="3.3" fill="#fef9c3"/>
    </g>
  </g>`,

  baguette: `<g class="wear-baguette" transform="rotate(10)">
    <rect x="-5" y="-44" width="10" height="54" rx="5" fill="#d99a4e" ${st('#8a4b14', 1.4)}/>
    <path d="M2 -42.5 Q4.6 -40.5 4.6 -37 V4 Q4.6 8 2 9" stroke="#b8742e" stroke-width="2.6" fill="none" opacity=".7"/>
    <path d="M-2.8 -39 V-14" stroke="#f5c98a" stroke-width="1.6" stroke-linecap="round"/>
    ${[-35, -26, -17].map((y) => `<path d="M-3.4 ${y + 3} Q0 ${y - 0.6} 3.4 ${y - 3}" stroke="#8a4b14" stroke-width="3.2" stroke-linecap="round" fill="none" opacity=".45"/><path d="M-3.4 ${y + 2.4} Q0 ${y - 1.2} 3.4 ${y - 3.6}" stroke="#f7dcae" stroke-width="2" stroke-linecap="round" fill="none"/>`).join('')}
    <path d="M-6.5 -9 L-4 -11.8 L-1.5 -9.5 L1 -12.4 L3.5 -10 L6.5 -12.8 L6 12 L-6 12 Z" fill="#fef3c7" ${st('#a8a29e', 1)}/>
    <path d="M-6.3 -4 L6.3 -6.5 M-6.1 1 L6.1 -1.5" stroke="#ef4444" stroke-width="1.6"/>
    <g fill="#fff7ed" opacity=".8"><circle cx="-1.5" cy="-40.5" r=".7"/><circle cx="1.5" cy="-30" r=".6"/><circle cx="-2" cy="-22" r=".6"/></g>
  </g>`,

  bubbletea: `<g class="wear-bubbletea">
    <g transform="rotate(12 0 -22)"><rect x="-2.1" y="-48" width="4.2" height="40" rx="1.2" fill="#f472b6" ${st('#be185d', 1)}/><path d="M-.7 -46 V-30" stroke="#fff" stroke-width="1" opacity=".55" stroke-linecap="round"/></g>
    <path d="M-9 -20 L9 -20 L7 5.5 L-7 5.5 Z" fill="#d6a77a"/>
    <path d="M-9 -20 Q0 -18 9 -20 L8.8 -18 Q0 -16 -8.8 -18 Z" fill="#e8c39e"/>
    <g fill="#3f2a1d">${[[-5, 2.4], [-1.6, 3.4], [2, 2], [5.2, 3.6], [-6, -1.6], [6, -1], [-3, -3.6], [3.6, -4.4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7"/>`).join('')}</g>
    <path d="M-9.6 -26 L9.6 -26 L7.2 6 L-7.2 6 Z" fill="#f1f5f9" fill-opacity=".3" ${st('#94a3b8', 1.3)}/>
    <path d="M-10.8 -26 Q0 -37 10.8 -26 Z" fill="#fff" fill-opacity=".45" ${st('#94a3b8', 1.2)}/>
    <rect x="-10.8" y="-27" width="21.6" height="2.4" rx="1.1" fill="#e2e8f0" ${st('#94a3b8', 1)}/>
    <path d="M-6.8 -22 L-5.4 2" stroke="#fff" stroke-width="1.6" opacity=".8" stroke-linecap="round"/>
    <path d="M-6 -31 Q-3 -33.5 0 -33.5" stroke="#fff" stroke-width="1.3" fill="none" opacity=".8" stroke-linecap="round"/>
  </g>`,

  paintbrush: `<g class="wear-paintbrush" transform="rotate(14)">
    <path d="M-1.6 12 Q0 13.8 1.6 12 L2.6 -20 L-2.6 -20 Z" fill="#dc2626" ${st('#7f1d1d', 1.2)}/>
    <path d="M-1.1 -18 L-.7 9" stroke="#fca5a5" stroke-width="1" stroke-linecap="round"/>
    <path d="M-2.8 -20 L2.8 -20 L3.4 -28 L-3.4 -28 Z" fill="#cbd5e1" ${st('#64748b', 1.1)}/>
    <path d="M-3 -23 H3 M-3.2 -25.5 H3.2" stroke="#94a3b8" stroke-width=".8"/>
    <path d="M-3.4 -28 L3.4 -28 Q4.6 -36 .5 -45 Q-4.6 -36 -3.4 -28 Z" fill="#e9c88f" ${st('#8a5a2b', 1.1)}/>
    <path d="M-3.7 -34.5 Q0 -37.5 4 -35 Q3.3 -40.5 .5 -45 Q-3.6 -39.5 -3.7 -34.5 Z" fill="#3b82f6" ${st('#1e40af', 1)}/>
    <path d="M-1 -31 V-34 M1.4 -31 V-34.5" stroke="#8a5a2b" stroke-width=".7" opacity=".6"/>
    <path d="M3.6 -34.5 Q4.6 -31.5 3.8 -30 Q3 -31.4 3.6 -34.5 Z" fill="#3b82f6"/>
    <path d="M-1.6 -39 Q-.6 -42 .4 -43" stroke="#fff" stroke-width="1" opacity=".7" stroke-linecap="round" fill="none"/>
  </g>`,

  balloondog: `<g class="wear-balloondog" transform="translate(-2 0)">
    ${sausage(-12, -6, 3, 6.5, 12)}${sausage(-15.5, -21, 2.6, 5.5, -25)}${sausage(-5, -14, 9.5, 4.2, 0)}
    ${sausage(-1, -34, 2.5, 5, -30)}${sausage(3, -22, 3.2, 6.5, 10)}${sausage(7, -31, 6.5, 3.8, -10)}
    ${sausage(2, -4, 3, 7, -4)}
    <circle cx="13.2" cy="-32.2" r="1.4" fill="#9f1239"/><circle cx="5.5" cy="-33" r="1" fill="#1f2937"/>
    <g fill="#be123c"><circle cx="-12.6" cy="-15" r="1.3"/><circle cx="3" cy="-15" r="1.3"/><circle cx="1.6" cy="-28" r="1.2"/></g>
  </g>`,

  testtube: `<g class="wear-testtube" transform="rotate(10)">
    <g class="bubbles" fill="#bbf7d0" ${st('#16a34a', .7)}><circle cx="1" cy="-44" r="1.8"/><circle style="animation-delay:.7s" cx="-2" cy="-44" r="1.3"/><circle style="animation-delay:1.4s" cx="2" cy="-44" r="1.1"/></g>
    <path d="M-4.6 -38 V2 A4.6 4.6 0 0 0 4.6 2 V-38 Z" fill="#e0f2fe" fill-opacity=".55"/>
    <path d="M-4.6 -19 V2 A4.6 4.6 0 0 0 4.6 2 V-19 Z" fill="#4ade80"/>
    <path d="M1.6 -19 V5 A4.6 4.6 0 0 0 4.6 2 V-19 Z" fill="#16a34a" opacity=".4"/>
    <ellipse cx="0" cy="-19" rx="4.6" ry="1.2" fill="#bbf7d0"/>
    <g fill="#fff" opacity=".8"><circle cx="-1.6" cy="-12" r="1"/><circle cx="1" cy="-7" r=".8"/><circle cx="-.6" cy="-15.4" r=".6"/></g>
    <path d="M-4.6 -38 V2 A4.6 4.6 0 0 0 4.6 2 V-38" fill="none" ${st('#64748b', 1.3)}/>
    <rect x="-6" y="-40.5" width="12" height="3" rx="1.5" fill="#f1f5f9" ${st('#64748b', 1.1)}/>
    <path d="M-2.5 -35 V-3" stroke="#fff" stroke-width="1.4" opacity=".85" stroke-linecap="round"/>
  </g>`,

  scepter: `<g class="wear-scepter">
    <circle class="glow" cx="0" cy="-37" r="11" fill="#fde047" opacity=".3"/>
    <rect x="-2" y="-28" width="4" height="40" rx="2" fill="#facc15" ${st('#a16207', 1.2)}/>
    <rect x=".5" y="-27" width="1.2" height="38" fill="#eab308"/>
    <rect x="-3.4" y="-17" width="6.8" height="2.8" rx="1.2" fill="#fde047" ${st('#a16207', .9)}/>
    <circle cx="0" cy="12.5" r="2.8" fill="#fde047" ${st('#a16207', 1)}/>
    <circle cx="0" cy="-37" r="6.2" fill="#e11d48" ${st('#881337', 1.3)}/>
    <path d="M-3.6 -37 L0 -41.4 L3.6 -37 L0 -33 Z" fill="#fb7185" opacity=".85"/>
    <circle cx="-2.3" cy="-39.3" r="1.2" fill="#fff"/>
    <path d="M-7.4 -41 Q-8.4 -30 -2.6 -27 L2.6 -27 Q8.4 -30 7.4 -41 Q5.4 -33.4 0 -32.4 Q-5.4 -33.4 -7.4 -41 Z" fill="#facc15" ${st('#a16207', 1.2)}/>
    <circle cx="-7.4" cy="-41.6" r="1.5" fill="#fde047" ${st('#a16207', .8)}/><circle cx="7.4" cy="-41.6" r="1.5" fill="#fde047" ${st('#a16207', .8)}/>
    <path d="${starD(0, -47, 3.8, 1.7)}" fill="#fde047" ${st('#a16207', .9)}/>
    <path d="M-1.2 -24 V8" stroke="#fef9c3" stroke-width="1" stroke-linecap="round"/>
    ${spark(-10, -45, 3, '#fef08a', 0)}${spark(9, -30, 2.4, '#fef08a', 0.7)}${spark(-9, -22, 2, '#fef08a', 1.3)}
  </g>`,
};

// ---------------------------------------------------------------- Голова
// Верх шара — y = 32; шапка опускается не ниже бровей (y ≈ 50), по бокам — до y ≈ 60.

const HAIR_SPIKES = [
  [24, 64], [13, 45], [29, 43], [15, 23], [37, 28], [31, 4], [51, 17], [56, -7], [68, 13], [82, -7], [87, 16], [107, 3],
  [103, 27], [125, 22], [111, 42], [127, 46], [116, 64], [106, 50], [100, 56], [94, 46], [86, 55], [78, 45], [70, 54],
  [62, 45], [54, 55], [46, 46], [40, 56], [34, 50],
];
const hairD = HAIR_SPIKES.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ') + ' Z';

export const HEAD_MORE = {
  beanie: `<g class="wear-beanie" transform="rotate(-6 70 30)">
    <path d="M33 44 Q32 13 70 12 Q108 13 107 44 Z" fill="#14b8a6" ${st('#0f766e', 2)}/>
    <path d="M34 31 Q70 21 106 31 L106.6 37.5 Q70 27.5 33.4 37.5 Z" fill="#fde68a" ${st('#0f766e', 1.2)}/>
    <path d="M52 16 Q46 28 45 40 M61 13 Q58 26 57.5 38 M70 12 V37 M79 13 Q82 26 82.5 38 M88 16 Q94 28 95 40" stroke="#0f766e" stroke-width="1.4" opacity=".35" fill="none"/>
    <path d="M29 51 Q70 32 111 51 L109 41 Q70 23 31 41 Z" fill="#0d9488" ${st('#115e59', 2)}/>
    <path d="${Array.from({ length: 13 }, (_, k) => { const x = 35 + k * 5.83; const t = (x - 30) / 80; const y = 41.5 + 16 * (t - 0.5) ** 2 * 1.9; return `M${f(x)} ${f(y - 3.5)} V${f(y + 4)}`; }).join(' ')}" stroke="#115e59" stroke-width="1.4" opacity=".45" stroke-linecap="round"/>
    <path d="M41 30 Q46 20 58 15.5" stroke="#fff" stroke-width="2.6" opacity=".35" fill="none" stroke-linecap="round"/>
    <path d="${bumpy(70, 8, 7, 0, 360, 10, 1)} Z" fill="#fef3c7" ${st('#d6b26e', 1.5)}/>
    <circle cx="67" cy="5.5" r="2.4" fill="#fff" opacity=".8"/>
  </g>`,

  ballcap: `<g class="wear-ballcap" transform="rotate(6 70 30)">
    <path d="M33 46 Q32 13 70 12 Q108 13 107 46 Q70 36 33 46 Z" fill="#ef4444" ${st('#991b1b', 2)}/>
    <path d="M70 12.5 Q60 26 58 40.5 M70 12.5 Q84 24 89 39.5 M70 12.5 Q46 20 41 43" stroke="#991b1b" stroke-width="1.3" opacity=".5" fill="none"/>
    <path d="M41 30 Q46 20 57 16" stroke="#fff" stroke-width="2.6" opacity=".35" fill="none" stroke-linecap="round"/>
    <path d="M93 41 Q118 33 132 42 Q126 51 104 49.5 Z" fill="#dc2626" ${st('#7f1d1d', 2)}/>
    <path d="M100 47.5 Q118 47 129 43" stroke="#7f1d1d" stroke-width="1.4" opacity=".5" fill="none"/>
    <path d="M33 46 Q70 36 107 46" stroke="#7f1d1d" stroke-width="2.6" fill="none"/>
    <circle cx="68" cy="29" r="7.5" fill="#fff" ${st('#991b1b', 1.4)}/>
    <path d="M69.5 23.5 L64.5 30 L68.2 30 L66.5 34.5 L72 27.5 L68.4 27.5 Z" fill="#facc15" ${st('#a16207', .9)}/>
    <circle cx="70" cy="12.5" r="3" fill="#dc2626" ${st('#7f1d1d', 1.2)}/>
  </g>`,

  deerstalker: `<g class="wear-deerstalker" transform="rotate(-5 70 30)">
    <path d="M38 41 Q22 41 15 50 Q30 53 47 46.5 Z M102 41 Q118 41 125 50 Q110 53 93 46.5 Z" fill="#a37a43" ${st('#5c3d16', 1.8)}/>
    <path d="M34 46 Q33 13 70 12 Q107 13 106 46 Q70 38 34 46 Z" fill="#c09659" ${st('#5c3d16', 2)}/>
    <path d="M36 37 Q70 29 104 37 M35 29 Q70 21 105 29 M40 21 Q70 13 100 21 M48 15 Q46 30 46 43 M60 13 Q58 28 58 40 M72 12 V39 M84 13 Q86 28 86 40 M95 17 Q97 30 97 43" stroke="#7c5a26" stroke-width="1.3" opacity=".5" fill="none"/>
    <path d="M36 33 Q70 25 104 33 M53 14 Q52 30 52 41 M89 15 Q91 30 91.5 41" stroke="#b91c1c" stroke-width=".9" opacity=".45" fill="none"/>
    <ellipse cx="42" cy="31" rx="5.5" ry="9" transform="rotate(-28 42 31)" fill="#b4894f" ${st('#5c3d16', 1.5)}/>
    <ellipse cx="98" cy="31" rx="5.5" ry="9" transform="rotate(28 98 31)" fill="#b4894f" ${st('#5c3d16', 1.5)}/>
    <path d="M46 24 Q58 12 66 11 M94 24 Q82 12 74 11" stroke="#5c3d16" stroke-width="1.4" fill="none"/>
    <path d="M70 11 L63 7 L63 15 Z M70 11 L77 7 L77 15 Z" fill="#a37a43" ${st('#5c3d16', 1.2)}/>
    <circle cx="70" cy="11" r="2.2" fill="#7c5a26"/>
  </g>`,

  kabuto: `<g class="wear-kabuto">
    <path d="M33 42 Q22 52 17 67 L26 69 Q29 58 38 48 Z M107 42 Q118 52 123 67 L114 69 Q111 58 102 48 Z" fill="#7f1d1d" ${st('#450a0a', 1.6)}/>
    <path d="M30 50 Q25 58 21.5 67.5 M110 50 Q115 58 118.5 67.5" stroke="#facc15" stroke-width="1.4" stroke-dasharray="2 2" fill="none"/>
    <path d="M32 46 Q31 12 70 10 Q109 12 108 46 Z" fill="#b91c1c" ${st('#7f1d1d', 2)}/>
    <path d="M45 17 Q40 30 41 44 M56 12.5 Q52 28 52.5 43 M70 10 V42 M84 12.5 Q88 28 87.5 43 M95 17 Q100 30 99 44" stroke="#7f1d1d" stroke-width="1.6" opacity=".6" fill="none"/>
    <path d="M40 30 Q44 20 54 15" stroke="#fff" stroke-width="2.6" opacity=".3" fill="none" stroke-linecap="round"/>
    <path d="M31 44 Q20 38 17 26 Q27 28 36 38 Z M109 44 Q120 38 123 26 Q113 28 104 38 Z" fill="#b91c1c" ${st('#facc15', 1.6)}/>
    <path d="M29 50 Q70 34 111 50 L111 43 Q70 27 29 43 Z" fill="#1f2937" ${st('#111827', 1.6)}/>
    <path d="M30 44 Q70 28.5 110 44" stroke="#facc15" stroke-width="1.4" fill="none"/>
    <g fill="#facc15">${[40, 55, 85, 100].map((x) => `<circle cx="${x}" cy="${f(46.5 - 9.6 * (1 - ((x - 70) / 41) ** 2))}" r="1.3"/>`).join('')}</g>
    <path d="M70 40 Q51 33 43 3 Q57 22 70 27 Q83 22 97 3 Q89 33 70 40 Z" fill="#facc15" ${st('#a16207', 1.8)}/>
    <path d="M70 37 Q56 31 48 12" stroke="#fef9c3" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".9"/>
    <circle cx="70" cy="37" r="5.2" fill="#facc15" ${st('#a16207', 1.4)}/><circle cx="70" cy="37" r="2.6" fill="#b91c1c"/>
    <circle cx="70" cy="10.5" r="3.2" fill="#facc15" ${st('#a16207', 1.2)}/>
  </g>`,

  jester: `<g class="wear-jester">
    <path d="M34 46 Q36 18 70 16 Q104 18 106 46 Z" fill="#9333ea" ${st('#581c87', 2)}/>
    <path d="M60 23 C44 6 22 14 12 40 C22 30 30 34 38 44 Z" fill="#9333ea" ${st('#581c87', 2)}/>
    <path d="M80 23 C96 6 118 14 128 40 C118 30 110 34 102 44 Z" fill="#facc15" ${st('#a16207', 2)}/>
    <path d="M54 32 C54 14 66 5 84 1 C78 9 86 19 86 32 Z" fill="#ef4444" ${st('#991b1b', 2)}/>
    <path d="M58 26 C59 16 66 10 76 6" stroke="#fff" stroke-width="2" opacity=".35" fill="none" stroke-linecap="round"/>
    <path d="M32 51 Q70 31 108 51 L108 43 Q70 23 32 43 Z" fill="#facc15" ${st('#a16207', 1.8)}/>
    <path d="${Array.from({ length: 6 }, (_, k) => { const x = 39 + k * 12.4; const t = (x - 70) / 38; const y = 47 - 11 * (1 - t * t); return `M${f(x - 4)} ${f(y)} L${f(x)} ${f(y - 3.6)} L${f(x + 4)} ${f(y)} L${f(x)} ${f(y + 3.6)} Z`; }).join(' ')}" fill="#9333ea" opacity=".85"/>
    ${[[12, 40], [128, 40], [84, 1]].map(([x, y], i) => `<g class="bell" style="animation-delay:${i * 0.25}s"><circle cx="${x}" cy="${y + 3}" r="4.6" fill="#facc15" ${st('#a16207', 1.4)}/><path d="M${x - 2.4} ${y + 4.2} H${x + 2.4}" stroke="#a16207" stroke-width="1.2" stroke-linecap="round"/><circle cx="${x - 1.4}" cy="${y + 1.6}" r="1.2" fill="#fff" opacity=".8"/></g>`).join('')}
  </g>`,

  sombrero: `<g class="wear-sombrero" transform="rotate(-5 70 30)">
    <ellipse cx="70" cy="38" rx="56" ry="10.5" fill="#e9b65a" ${st('#8a5a1a', 2)}/>
    <ellipse cx="70" cy="36.6" rx="50" ry="7.6" fill="#f5cf7e"/>
    <ellipse cx="70" cy="38" rx="52.5" ry="8.8" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="5 4"/>
    <path d="M50 38 Q48 4 70 3 Q92 4 90 38 Z" fill="#f5cf7e" ${st('#8a5a1a', 2)}/>
    <path d="M58 8 Q70 14 82 8" stroke="#8a5a1a" stroke-width="1.5" fill="none" opacity=".6"/>
    <path d="M55 14 Q53 26 54 33 M85 14 Q87 26 86 33" stroke="#c99436" stroke-width="1.4" fill="none" opacity=".6"/>
    <path d="M50.5 28 Q70 33 89.5 28 L90 36 Q70 41 50 36 Z" fill="#16a34a" ${st('#14532d', 1.3)}/>
    <path d="${Array.from({ length: 8 }, (_, k) => `${k ? 'L' : 'M'}${f(52 + k * 5.2)} ${f(k % 2 ? 36 : 30.5) + (k > 1 && k < 6 ? 1.5 : 0.5)}`).join(' ')}" stroke="#fff" stroke-width="1.4" fill="none" ${LJ}/>
    <g fill="#ef4444">${[56, 70, 84].map((x) => `<circle cx="${x}" cy="${x === 70 ? 34.6 : 33.8}" r="1.6"/>`).join('')}</g>
    <path d="M58 9 Q56 18 57 26" stroke="#fff" stroke-width="2.4" opacity=".4" fill="none" stroke-linecap="round"/>
  </g>`,

  sprout: `<g class="wear-sprout">
    <ellipse cx="70" cy="33" rx="7" ry="2.4" fill="#92400e" opacity=".55"/>
    <g class="sprout-sway">
      <path d="M70 34 Q68 24 71 14" stroke="#15803d" stroke-width="4.4" fill="none" stroke-linecap="round"/>
      <path d="M70 34 Q68 24 71 14" stroke="#4ade80" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M70 19 Q58 3 45 11 Q55 27 70 19 Z" fill="#4ade80" ${st('#15803d', 1.8)}/>
      <path d="M68 18.5 Q58 12 49 11.5" stroke="#15803d" stroke-width="1.2" fill="none" opacity=".6"/>
      <path d="M71 15 Q80 -3 99 3 Q93 22 71 15 Z" fill="#86efac" ${st('#15803d', 1.8)}/>
      <path d="M73 14 Q84 8 96 4" stroke="#15803d" stroke-width="1.2" fill="none" opacity=".6"/>
      <path d="M79 6 Q83 2.5 88 1.6" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7" stroke-linecap="round"/>
      <path d="M54 7 Q57 6 60 7" stroke="#fff" stroke-width="1.4" fill="none" opacity=".6" stroke-linecap="round"/>
      <path d="M93 13 Q95.5 16.5 93 18 Q90.5 16.5 93 13 Z" fill="#bae6fd" ${st('#38bdf8', .7)}/>
    </g>
  </g>`,

  spikyhair: `<g class="wear-spikyhair"><g transform="matrix(1 0 0 .85 0 6)">
    <g transform="translate(70 34) scale(1.14) translate(-70 -34)"><path class="aura" d="${hairD}" fill="#fde047" opacity=".35"/></g>
    <path d="${hairD}" fill="#facc15" ${st('#b45309', 2)}/>
    <path d="M30 44 L24 30 L42 32 L40 14 L56 24 L62 6 L70 22 L80 6 L86 24 L100 14 L98 32 L114 30 L108 44 Q70 32 30 44 Z" fill="#eab308" opacity=".55"/>
    <path d="M36 30 L33 14 M54 21 L56 4 M84 20 L84 5 M101 26 L104 12" stroke="#fef9c3" stroke-width="2" stroke-linecap="round" opacity=".9"/>
    <g class="zap" fill="none" stroke="#fef08a" stroke-width="1.6" ${LJ}><path d="M8 34 L13 30 L11 26 L16 22"/><path style="animation-delay:.5s" d="M132 30 L127 34 L130 38 L124 41"/><path style="animation-delay:1s" d="M64 -8 L68 -4 L66 0 L71 3"/></g>
  </g></g>`,

  afro: `<g class="wear-afro" transform="matrix(1 0 0 .8 0 12)">
    <path d="${bumpy(70, 32, 45, 140, 400, 16, 2.4)} C100 46 86 42 70 44 C54 42 40 46 35.5 61 Z" fill="#3b2416" ${st('#1f120a', 2)}/>
    <g fill="none" stroke="#6b4426" stroke-width="2" stroke-linecap="round" opacity=".8"><path d="M38 22 q4 -6 10 -6"/><path d="M52 6 q5 -4 11 -3"/><path d="M34 40 q2 -5 7 -6"/><path d="M58 24 q4 -4 9 -3"/><path d="M78 10 q4 -3 9 -1"/><path d="M90 28 q4 -2 8 1"/></g>
    <g transform="rotate(20 104 18)"><rect x="101" y="4" width="6" height="12" rx="3" fill="#f472b6" ${st('#be185d', 1.2)}/><path d="M100 16 H108 M101 16 V27 M104 16 V28 M107 16 V27" stroke="#be185d" stroke-width="1.6" stroke-linecap="round"/><circle cx="104" cy="8" r="1.4" fill="#fff" opacity=".8"/></g>
  </g>`,

  bandana: `<g class="wear-bandana" transform="rotate(-4 70 30)">
    <path d="M105 44 Q119 52 122 66 Q113 63 108 53 Z M106 46 Q122 45 131 54 Q120 57 108 51 Z" fill="#dc2626" ${st('#7f1d1d', 1.6)}/>
    <path d="M31 50 Q30 13 70 12 Q110 13 109 50 Q70 36 31 50 Z" fill="#ef4444" ${st('#991b1b', 2)}/>
    <g fill="#fff" opacity=".9">${[[48, 24], [70, 20], [92, 26], [58, 36], [82, 35], [40, 39], [100, 40]].map(([x, y], i) => i % 2 ? `<circle cx="${x}" cy="${y}" r="1.6"/><circle cx="${x + 4}" cy="${y - 2}" r=".9"/>` : `<circle cx="${x}" cy="${y}" r="2.2" fill="none" stroke="#fff" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r=".8"/>`).join('')}</g>
    <path d="M34 45.5 Q70 32.5 106 45.5" stroke="#fff" stroke-width="1.3" stroke-dasharray="3 3" fill="none" opacity=".8"/>
    <path d="M42 28 Q48 18 60 15" stroke="#fff" stroke-width="2.6" opacity=".3" fill="none" stroke-linecap="round"/>
    <ellipse cx="107" cy="46" rx="5.5" ry="4.2" fill="#dc2626" ${st('#7f1d1d', 1.6)}/>
  </g>`,

  froghat: `<g class="wear-froghat">
    <circle cx="50" cy="17" r="10.5" fill="#4ade80" ${st('#15803d', 2)}/><circle cx="90" cy="17" r="10.5" fill="#4ade80" ${st('#15803d', 2)}/>
    <path d="M32 48 Q30 16 70 15 Q110 16 108 48 Q70 38 32 48 Z" fill="#4ade80" ${st('#15803d', 2)}/>
    <g fill="#22c55e"><ellipse cx="44" cy="34" rx="3" ry="2"/><ellipse cx="96" cy="33" rx="3.4" ry="2.2"/><ellipse cx="70" cy="26" rx="2.4" ry="1.6"/></g>
    ${[50, 90].map((x) => `<circle cx="${x}" cy="16" r="6.8" fill="#fff" ${st('#15803d', 1.2)}/><circle cx="${x + 1}" cy="17" r="3.5" fill="#1f2937"/><circle cx="${x}" cy="15.4" r="1.3" fill="#fff"/>`).join('')}
    <path d="M50 37 Q70 46 90 37" stroke="#15803d" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <g fill="#f9a8d4" opacity=".8"><ellipse cx="44" cy="40" rx="4" ry="2.4"/><ellipse cx="96" cy="40" rx="4" ry="2.4"/></g>
    <path d="M38 34 Q40 26 46 22" stroke="#fff" stroke-width="2.4" opacity=".4" fill="none" stroke-linecap="round"/>
  </g>`,

  mushroomhat: `<g class="wear-mushroomhat" transform="rotate(-6 70 30)">
    <path d="M24 45 Q70 32 116 45 Q114 53 104 52 Q70 43 36 52 Q26 53 24 45 Z" fill="#fef3c7" ${st('#b45309', 1.6)}/>
    <path d="M40 48.5 L42 45 M52 46 L53 42.5 M64 44.6 L64.5 41 M76 44.6 L75.5 41 M88 46 L87 42.5 M100 48.5 L98 45" stroke="#d6a46b" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M20 46 Q17 4 70 2 Q123 4 120 46 Q70 33 20 46 Z" fill="#ef4444" ${st('#991b1b', 2)}/>
    <path d="M86 6 Q112 12 117 38 Q100 33 92 34 Q102 20 86 6 Z" fill="#b91c1c" opacity=".35"/>
    <g fill="#fff" ${st('#fecaca', 1)}><circle cx="46" cy="22" r="6.2"/><circle cx="72" cy="12" r="7"/><circle cx="97" cy="23" r="5.4"/><circle cx="60" cy="33" r="3.8"/><circle cx="86" cy="34" r="3.2"/><circle cx="31" cy="37" r="3.4"/><circle cx="109" cy="38" r="2.8"/></g>
    <path d="M30 30 Q36 14 54 8" stroke="#fff" stroke-width="2.8" opacity=".35" fill="none" stroke-linecap="round"/>
  </g>`,
};

// ---------------------------------------------------------------- Лицо
// Глаза — (53, 76) и (87, 76), rx ≈ 12, ry ≈ 14; рот около (70, 100). Стёкла — полупрозрачные, чтобы глаза было видно.

const mirror = (inner) => `${inner}<g transform="translate(140 0) scale(-1 1)">${inner}</g>`;

export const FACE_MORE = {
  aviator: `<g class="wear-aviator">
    <path d="M23 71 Q70 59 117 71" stroke="#5c3d16" stroke-width="7.6" fill="none" stroke-linecap="round"/>
    <path d="M23 71 Q70 59 117 71" stroke="#8a5a2b" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M25 70 Q70 58.6 115 70" stroke="#d6a46b" stroke-width=".9" stroke-dasharray="2 2" fill="none"/>
    ${[53, 87].map((x) => `<circle cx="${x}" cy="76" r="11" fill="#fbbf24" fill-opacity=".28"/>
    <circle cx="${x}" cy="76" r="13.4" fill="none" stroke="#5c3d16" stroke-width="5.4"/><circle cx="${x}" cy="76" r="13.4" fill="none" stroke="#8a5a2b" stroke-width="3.4"/>
    <circle cx="${x}" cy="76" r="11" fill="none" stroke="#a16207" stroke-width="2.6"/><circle cx="${x}" cy="76" r="11" fill="none" stroke="#fcd34d" stroke-width="1.2"/>
    <path d="M${x - 6.5} 72 Q${x - 4.5} 67.5 ${x} 67" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"/>`).join('')}
    <path d="M65.5 73 Q70 69.5 74.5 73" stroke="#5c3d16" stroke-width="3.6" fill="none" stroke-linecap="round"/>
  </g>`,

  scuba: `<g class="wear-scuba">
    <path d="M22 78 Q22 65 35 64 M105 64 Q118 65 118 78" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M78 103 Q94 106 106 96 Q115 86 115 62 V30" stroke="#a16207" stroke-width="7.6" fill="none" stroke-linecap="round"/>
    <path d="M78 103 Q94 106 106 96 Q115 86 115 62 V30" stroke="#facc15" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M112.6 40 H117.4 M112.6 50 H117.4 M113 87 l3.6 2.4" stroke="#f97316" stroke-width="2.6"/>
    <rect x="110.5" y="23" width="9" height="7" rx="2" fill="#f97316" ${st('#c2410c', 1.2)}/>
    <ellipse cx="76" cy="102.5" rx="6.5" ry="4.4" fill="#1e293b" ${st('#0f172a', 1)}/>
    <rect x="36" y="63" width="68" height="28" rx="12" fill="#67e8f9" fill-opacity=".25"/>
    <rect x="34.5" y="61.5" width="71" height="31" rx="13" fill="none" stroke="#c2410c" stroke-width="6.4"/>
    <rect x="34.5" y="61.5" width="71" height="31" rx="13" fill="none" stroke="#f97316" stroke-width="4.2"/>
    <path d="M42 70 L50 66 M41 79 L58 67 M88 88 L98 82" stroke="#fff" stroke-width="2" opacity=".55" stroke-linecap="round"/>
    <path d="M62 94 Q62 86.5 70 85.5 Q78 86.5 78 94 Z" fill="#f97316" ${st('#c2410c', 1.3)}/>
    <g class="bub" fill="#e0f2fe" ${st('#7dd3fc', .8)}><circle cx="117" cy="17" r="2.2"/><circle style="animation-delay:.9s" cx="113" cy="17" r="1.5"/></g>
  </g>`,

  nerdglasses: `<g class="wear-nerdglasses">
    <path d="M24 72 L38 69.5 M102 69.5 L116 72" stroke="#1f2937" stroke-width="3.6" stroke-linecap="round"/>
    ${[37.5, 71.5].map((x) => `<rect x="${x}" y="64" width="31" height="24" rx="5" fill="#fff" fill-opacity=".14" stroke="#1f2937" stroke-width="4.2"/><path d="M${x + 3} 65.8 H${x + 28}" stroke="#64748b" stroke-width="1" stroke-linecap="round"/><path d="M${x + 5} 79 L${x + 13} 69 M${x + 10} 81 L${x + 15} 75" stroke="#fff" stroke-width="1.8" opacity=".6" stroke-linecap="round"/>`).join('')}
    <rect x="64.5" y="67.5" width="11" height="10" rx="1.4" fill="#f8fafc" ${st('#94a3b8', 1)}/>
    <path d="M66 70.5 H74 M66 73 H74 M66 75.5 H74" stroke="#cbd5e1" stroke-width=".9"/>
  </g>`,

  roundshades: `<g class="wear-roundshades">
    <path d="M24 74 Q31 70 41 72 M99 72 Q109 70 116 74" stroke="#92400e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    ${[53, 87].map((x) => `<circle cx="${x}" cy="77" r="12" fill="#7c3aed" fill-opacity=".72"/><path d="M${x - 12} 77 A12 12 0 0 0 ${x + 12} 77 Z" fill="#f0abfc" fill-opacity=".35"/>
    <circle cx="${x}" cy="77" r="12" fill="none" stroke="#92400e" stroke-width="3.4"/><circle cx="${x}" cy="77" r="12" fill="none" stroke="#fbbf24" stroke-width="1.6"/>
    <path d="M${x - 7} 73 Q${x - 5} 69.5 ${x - 1} 69" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"/><circle cx="${x + 6}" cy="82" r="1.1" fill="#fff" opacity=".6"/>`).join('')}
    <path d="M65 75 Q70 69.5 75 75" stroke="#92400e" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M65 75 Q70 69.5 75 75" stroke="#fbbf24" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  </g>`,

  freckles: `<g class="wear-freckles">${mirror(`<g fill="#c2410c" opacity=".55"><circle cx="33" cy="89" r="1.5"/><circle cx="38.5" cy="86.5" r="1.3"/><circle cx="44" cy="89" r="1.6"/><circle cx="36" cy="93.5" r="1.4"/><circle cx="41.5" cy="94" r="1.2"/><circle cx="47" cy="92" r="1.1"/></g><g fill="#fb923c" opacity=".55"><circle cx="31" cy="93" r="1"/><circle cx="45" cy="96.5" r="1"/></g>`)}</g>`,

  warpaint: `<g class="wear-warpaint">${mirror(`<path d="M31 87.5 L52 85.2 Q55 86.8 52.4 88.8 L32.4 91.6 Q29.6 90 31 87.5 Z M33 94.8 L51 92.6 Q54 94.2 51.4 96.2 L34.4 98.6 Q31.6 97 33 94.8 Z" fill="#2563eb" ${st('#1e3a8a', 1.1)}/><path d="M35 88.6 L46 87.4 M37 95.8 L45 94.9" stroke="#93c5fd" stroke-width="1.1" stroke-linecap="round"/>`)}
    <path d="M70 46 L72.6 51.4 L70 59 L67.4 51.4 Z" fill="#fff" ${st('#1e3a8a', 1.1)}/>
  </g>`,

  whiskers: `<g class="wear-whiskers">
    <g stroke="#3b2f5c" stroke-width="1.7" stroke-linecap="round" fill="none">${mirror('<path d="M42 91 Q30 87 15 85.5 M42 94.5 Q29 94 14 95.5 M42 98 Q30 101 17 106"/>')}</g>
    <g fill="#3b2f5c" opacity=".6">${mirror('<circle cx="45.5" cy="90" r="1"/><circle cx="47" cy="94.2" r="1"/><circle cx="45.5" cy="98" r="1"/>')}</g>
    <path d="M64.5 87.5 Q70 86 75.5 87.5 Q74 91 70 93.5 Q66 91 64.5 87.5 Z" fill="#f472b6" ${st('#be185d', 1.4)}/>
    <ellipse cx="68" cy="88.5" rx="1.8" ry="1" fill="#fff" opacity=".7"/>
  </g>`,

  masquerade: `<g class="wear-masquerade">
    <path d="M40 66 C27 54 21 40 24 23 C34 36 40 50 40 66 Z" fill="#7c3aed" ${st('#4c1d95', 1.2)}/>
    <path d="M37 67 C25 62 15 52 12 39 C25 45 33 54 37 67 Z" fill="#22d3ee" ${st('#0e7490', 1.2)}/>
    <path d="M43 64 C36 50 36 33 44 20 C48 34 48 50 43 64 Z" fill="#ec4899" ${st('#9d174d', 1.2)}/>
    <path d="M40 66 Q31 46 24 24 M37 67 Q24 54 13 40 M43 64 Q42 40 44 21" stroke="#facc15" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path fill-rule="evenodd" d="M70 70 C60 62 44 56 26 58 C28 66 26 76 32 84 C38 92 50 92 58 89 C64 87 68 85 70 86 C72 85 76 87 82 89 C90 92 102 92 108 84 C114 76 112 66 114 58 C96 56 80 62 70 70 Z M43.5 77 a9.5 7.5 0 1 0 19 0 a9.5 7.5 0 1 0 -19 0 Z M77.5 77 a9.5 7.5 0 1 0 19 0 a9.5 7.5 0 1 0 -19 0 Z" fill="#facc15" ${st('#a16207', 1.6)}/>
    <path d="M31 63 Q38 62 41 67 M109 63 Q102 62 99 67 M35 85 Q42 89 49 87 M105 85 Q98 89 91 87" stroke="#7c3aed" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <ellipse cx="53" cy="77" rx="9.5" ry="7.5" fill="none" stroke="#7c3aed" stroke-width="1.4"/><ellipse cx="87" cy="77" rx="9.5" ry="7.5" fill="none" stroke="#7c3aed" stroke-width="1.4"/>
    <path d="M70 72 L73 76 L70 80 L67 76 Z" fill="#e11d48" ${st('#881337', 1)}/>
    <g fill="#fff" ${st('#cbd5e1', .6)}><circle cx="30" cy="70" r="1.5"/><circle cx="110" cy="70" r="1.5"/><circle cx="40" cy="88" r="1.3"/><circle cx="100" cy="88" r="1.3"/></g>
    <path class="shine" d="M34 64 Q44 60 56 63" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".7"/>
    ${spark(112, 54, 3.4, '#fef08a', 0)}${spark(94, 95, 2.4, '#fef08a', 0.8)}
  </g>`,
};

// ---------------------------------------------------------------- Шея
// Низ шара — y = 128; шарфы и подвески лежат примерно в полосе y 100–145.

/** Точки и углы нормали вдоль кривой воротника (32,104)–(70,128)–(108,104). */
const collar = (n) =>
  Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const x = (1 - t) ** 2 * 32 + 2 * t * (1 - t) * 70 + t * t * 108;
    const y = (1 - t) ** 2 * 104 + 2 * t * (1 - t) * 128 + t * t * 104;
    const ang = (Math.atan2(2 * (1 - t) * 24 + 2 * t * -24, 2 * (1 - t) * 38 + 2 * t * 38) * 180) / Math.PI + 90;
    return [x, y, ang];
  });

const SCARF_WRAP = 'M30 106 Q70 131 110 106';
const SCARF_TAIL = 'M88 115 Q102 126 110 145';

export const NECK_MORE = {
  neckphones: `<g class="wear-neckphones">
    <path d="M37 114 Q70 148 103 114" stroke="#1e293b" stroke-width="5.4" fill="none" stroke-linecap="round"/>
    <path d="M37 114 Q70 148 103 114" stroke="#475569" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    ${[[37, -28], [103, 28]].map(([x, r]) => `<g transform="rotate(${r} ${x} 112)"><rect x="${x - 9.5}" y="103" width="19" height="21" rx="8" fill="#ec4899" ${st('#9d174d', 1.6)}/><rect x="${x - 7.5}" y="100" width="15" height="6.5" rx="3.2" fill="#1f2937" ${st('#0f172a', 1)}/><circle cx="${x}" cy="114.5" r="4" fill="#f9a8d4" ${st('#9d174d', 1)}/><path d="M${x - 6} 109 Q${x - 6} 106.5 ${x - 3} 106.5" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/></g>`).join('')}
  </g>`,

  camera: `<g class="wear-camera">
    <path d="M32 104 Q42 120 53 117 M87 117 Q98 120 108 104" stroke="#7c2d12" stroke-width="4.6" fill="none" stroke-linecap="round"/>
    <path d="M32 104 Q42 120 53 117 M87 117 Q98 120 108 104" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="2 3" fill="none"/>
    <path d="M64 112 L66 106.5 L74 106.5 L76 112 Z" fill="#94a3b8" ${st('#475569', 1.2)}/>
    <rect x="80" y="108" width="5" height="4" rx="1" fill="#ef4444" ${st('#991b1b', .8)}/>
    <rect x="52" y="111" width="36" height="22" rx="4" fill="#1f2937" ${st('#0b1120', 1.6)}/>
    <path d="M54 121 H86 M54 125 H86 M54 129 H86" stroke="#374151" stroke-width="1"/>
    <rect x="52" y="111" width="36" height="7" rx="3" fill="#cbd5e1" ${st('#475569', 1.2)}/>
    <rect x="55" y="112.6" width="7" height="3.6" rx="1" fill="#fef9c3" ${st('#a16207', .7)}/>
    <circle cx="70" cy="124" r="9" fill="#475569" ${st('#0b1120', 1.4)}/>
    <circle cx="70" cy="124" r="6.4" fill="#1e293b" ${st('#94a3b8', 1.2)}/>
    <circle cx="70" cy="124" r="3.6" fill="#3730a3"/>
    <circle cx="68" cy="122" r="1.6" fill="#fff" opacity=".9"/><circle cx="72.4" cy="126.2" r=".9" fill="#fff" opacity=".6"/>
    <rect x="49.5" y="114" width="3" height="4" rx="1" fill="#94a3b8"/><rect x="87.5" y="114" width="3" height="4" rx="1" fill="#94a3b8"/>
  </g>`,

  whistle: `<g class="wear-whistle" transform="translate(0 -5)">
    <path d="M36 106 Q52 121 63 123 M104 106 Q88 121 70 122" stroke="#2563eb" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M36 106 Q52 121 63 123 M104 106 Q88 121 70 122" stroke="#fff" stroke-width="1" stroke-dasharray="3 3" fill="none" opacity=".7"/>
    <circle cx="65.5" cy="123" r="3" fill="none" stroke="#64748b" stroke-width="1.8"/>
    <g transform="rotate(-10 70 128)">
      <path d="M58 124 H74 A7 7 0 1 1 67.1 130 H58 Q57 130 57 129 V125 Q57 124 58 124 Z" fill="#cbd5e1" ${st('#475569', 1.4)}/>
      <path d="M58 127.5 H67" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="68.5" y="123" width="4.5" height="2.6" rx=".8" fill="#334155"/>
      <path d="M71 128 A3.8 3.8 0 0 1 77 131" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".85"/>
      <circle cx="78.5" cy="133" r="1.2" fill="#64748b" opacity=".6"/>
    </g>
  </g>`,

  neckerchief: `<g class="wear-neckerchief">
    <path d="M30 104 Q70 126 110 104 L108 113 Q70 134 32 113 Z" fill="#0ea5e9" ${st('#075985', 1.8)}/>
    <path d="M54 117 L86 117 L71 142 Q70 144 69 142 Z" fill="#0ea5e9" ${st('#075985', 1.8)}/>
    <path d="M70 119 L75 119 L70 136 Z" fill="#0284c7" opacity=".6"/>
    <path d="M58 119.5 L82 119.5 L70 139.5 Z" fill="none" stroke="#fff" stroke-width="1.4" ${LJ}/>
    <path d="M33 108.5 Q70 129 107 108.5" stroke="#fff" stroke-width="1.4" fill="none"/>
    <rect x="64" y="113" width="12" height="9" rx="3.6" fill="#facc15" ${st('#a16207', 1.4)}/>
    <path d="M67 114.5 V120.5 M70 114.5 V120.5 M73 114.5 V120.5" stroke="#a16207" stroke-width=".9" opacity=".7"/>
  </g>`,

  flowercollar: `<g class="wear-flowercollar">
    <g ${st('#be185d', 1.3)}>${collar(11).map(([x, y, a], i) => `<g transform="rotate(${f(a - 90)} ${f(x)} ${f(y)})"><ellipse cx="${f(x)}" cy="${f(y + 5)}" rx="5.6" ry="8.6" fill="${i % 2 ? '#f9a8d4' : '#f472b6'}"/><path d="M${f(x)} ${f(y + 1)}v7" stroke-width="1" opacity=".45"/></g>`).join('')}</g>
    <g transform="translate(70 119)"><path d="M-9 1 Q-6 -5 0 -1 Q6 -5 9 1 Q4 3 0 1 Q-4 3 -9 1 Z" fill="#4ade80" ${st('#15803d', 1)}/><g fill="#fff" stroke="#f9a8d4">${Array.from({ length: 5 }, (_, k) => `<ellipse cy="-4.4" rx="3.2" ry="4.4" transform="rotate(${k * 72})"/>`).join('')}</g><circle r="2.8" fill="#facc15" ${st('#ca8a04', 1)}/><circle cx="-.9" cy="-.9" r=".9" fill="#fff" opacity=".8"/></g>
  </g>`,

  longscarf: `<g class="wear-longscarf">
    <path d="${SCARF_WRAP}" stroke="#7f1d1d" stroke-width="14" fill="none"/>
    <path d="${SCARF_WRAP}" stroke="#ef4444" stroke-width="11.4" fill="none"/>
    <path d="${SCARF_WRAP}" stroke="#fef3c7" stroke-width="11.4" stroke-dasharray="4.5 5.5" fill="none"/>
    <path d="M33 104 Q70 127 107 104" stroke="#fff" stroke-width="1.4" fill="none" opacity=".35"/>
    <g class="tail">
      <path d="${SCARF_TAIL}" stroke="#7f1d1d" stroke-width="13.6" fill="none"/>
      <path d="${SCARF_TAIL}" stroke="#ef4444" stroke-width="11" fill="none"/>
      <path d="${SCARF_TAIL}" stroke="#fef3c7" stroke-width="11" stroke-dasharray="4.5 5.5" stroke-dashoffset="2" fill="none"/>
      <path d="M104 147 L104.5 150 M107 146.4 L107.6 150 M110 146 L110.6 150 M113 145.4 L113.6 150 M116 145 L116.6 149.5" stroke="#b91c1c" stroke-width="1.6" stroke-linecap="round"/>
    </g>
    <ellipse cx="89" cy="116" rx="7.4" ry="6.4" fill="#ef4444" ${st('#7f1d1d', 1.6)}/>
    <path d="M85 113 Q89 111 93 113.5" stroke="#fef3c7" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  </g>`,

  pocketwatch: `<g class="wear-pocketwatch">
    <path d="M38 105 Q52 119 67 110 M102 105 Q88 119 73 110" stroke="#a16207" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M38 105 Q52 119 67 110 M102 105 Q88 119 73 110" stroke="#fde047" stroke-width="1.8" stroke-dasharray="2.2 1.4" fill="none"/>
    <circle class="glow" cx="70" cy="126" r="17" fill="#fde047" opacity=".25"/>
    <circle cx="70" cy="108.6" r="2.8" fill="none" stroke="#a16207" stroke-width="1.8"/>
    <rect x="66.8" y="110.5" width="6.4" height="4.4" rx="1.2" fill="#facc15" ${st('#a16207', 1)}/>
    <circle cx="70" cy="126" r="12.4" fill="#facc15" ${st('#a16207', 1.6)}/>
    <path d="M78 118 A11.4 11.4 0 0 1 73 137.2" stroke="#eab308" stroke-width="2.4" fill="none"/>
    <circle cx="70" cy="126" r="9" fill="#fffbeb" ${st('#ca8a04', 1)}/>
    <path d="${Array.from({ length: 12 }, (_, k) => { const a = rad(k * 30); const r0 = k % 3 ? 7.4 : 6.2; return `M${f(70 + r0 * Math.sin(a))} ${f(126 - r0 * Math.cos(a))} L${f(70 + 8.2 * Math.sin(a))} ${f(126 - 8.2 * Math.cos(a))}`; }).join(' ')}" stroke="#78350f" stroke-width="1" stroke-linecap="round"/>
    <path d="M70 126 L70 120.8 M70 126 L74.4 124" stroke="#1f2937" stroke-width="1.4" stroke-linecap="round"/>
    <g class="sec"><circle cx="70" cy="126" r="7.2" fill="none"/><path d="M70 128 V119" stroke="#dc2626" stroke-width=".8" stroke-linecap="round"/></g>
    <circle cx="70" cy="126" r="1.2" fill="#1f2937"/>
    <path d="M63.5 121 Q65 118 68.6 117.4" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".85"/>
    ${spark(86, 114, 3, '#fef08a', 0)}${spark(54, 136, 2.4, '#fef08a', 0.9)}
  </g>`,
};
