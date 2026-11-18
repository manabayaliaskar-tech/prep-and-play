// Фоны Препи Пасса: своя анимированная сцена для каждого месяца (0 - январь … 11 - декабрь).
// SVG 400×200 без id и градиентов; движение задают классы ps-* в styles/main.css.

const r = (n) => Math.round(n * 10) / 10;
const fall = (n, color, size = 2.2, cls = 'ps-fall') =>
  Array.from({ length: n }, (_, i) => `<circle class="${cls}" cx="${r((i * 53 + 17) % 400)}" cy="${r((i * 37) % 120)}" r="${r(size * (0.6 + (i % 3) * 0.3))}" fill="${color}" style="--d:${(5 + (i % 5)).toFixed(1)}s;--delay:${(-i * 0.7).toFixed(1)}s"/>`).join('');
const twinkle = (n, color = '#fff') =>
  Array.from({ length: n }, (_, i) => `<circle class="ps-twinkle" cx="${(i * 71 + 9) % 400}" cy="${(i * 29 + 6) % 110}" r="${i % 4 ? 1.1 : 1.8}" fill="${color}" style="--delay:${(-i * 0.37).toFixed(2)}s"/>`).join('');
const hills = (a, b) => `<path d="M0 150 Q70 112 150 138 T300 130 T400 120 V200 H0 Z" fill="${a}"/><path d="M0 172 Q90 140 190 166 T400 156 V200 H0 Z" fill="${b}"/>`;
const sky = (top, glow, gx = 330, gy = 40) => `<rect width="400" height="200" fill="${top}"/><circle cx="${gx}" cy="${gy}" r="120" fill="${glow}" opacity=".35"/><circle cx="${gx}" cy="${gy}" r="70" fill="${glow}" opacity=".35"/>`;
const pine = (x, y, s, c = '#166534', snow = false) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-2.5" y="0" width="5" height="10" fill="#78350f"/><path d="M-16 2 L0 -18 L16 2 Z M-13 -10 L0 -30 L13 -10 Z M-10 -22 L0 -40 L10 -22 Z" fill="${c}"/>${snow ? '<path d="M-10 -22 L0 -40 L10 -22 L6 -24 L2 -21 L-3 -25 L-6 -22 Z M-13 -10 L-6 -12 L0 -9 L6 -13 L13 -10 L0 -30 Z" fill="#fff" opacity=".9"/>' : ''}</g>`;
const heart = (x, y, s, c) => `<path d="M${x} ${y + s * 0.9} C${x - s * 1.5} ${y - s * 0.1} ${x - s} ${y - s * 1.3} ${x} ${y - s * 0.45} C${x + s} ${y - s * 1.3} ${x + s * 1.5} ${y - s * 0.1} ${x} ${y + s * 0.9} Z" fill="${c}"/>`;
const cloud = (x, y, s = 1, c = '#fff', op = 0.9) => `<g class="ps-cloud" transform="translate(${x} ${y}) scale(${s})" opacity="${op}"><ellipse cx="0" cy="0" rx="26" ry="10" fill="${c}"/><circle cx="-10" cy="-6" r="10" fill="${c}"/><circle cx="8" cy="-9" r="12" fill="${c}"/></g>`;
const sunRays = (x, y, rad, c) =>
  `<g class="ps-spin" style="transform-origin:${x}px ${y}px">${Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `<path d="M${r(x + Math.cos(a - 0.12) * (rad + 6))} ${r(y + Math.sin(a - 0.12) * (rad + 6))} L${r(x + Math.cos(a) * (rad + 20))} ${r(y + Math.sin(a) * (rad + 20))} L${r(x + Math.cos(a + 0.12) * (rad + 6))} ${r(y + Math.sin(a + 0.12) * (rad + 6))} Z" fill="${c}" opacity=".7"/>`;
  }).join('')}</g><circle cx="${x}" cy="${y}" r="${rad}" fill="${c}"/><circle cx="${x - rad * 0.3}" cy="${y - rad * 0.3}" r="${rad * 0.35}" fill="#fff" opacity=".35"/>`;
const flower = (x, y, petal, center, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 V22" stroke="#15803d" stroke-width="2.4"/><ellipse cx="5" cy="14" rx="5" ry="2.5" fill="#22c55e" transform="rotate(-30 5 14)"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-6" rx="3.6" ry="6" fill="${petal}" transform="rotate(${a})"/>`).join('')}<circle r="3.4" fill="${center}"/></g>`;
const tulip = (x, y, c) => `<g transform="translate(${x} ${y})"><path d="M0 0 V26" stroke="#15803d" stroke-width="2.6"/><path d="M-1 16 Q-12 8 -10 0 Q-4 8 -1 14 Z" fill="#22c55e"/><path d="M-8 -12 Q-8 2 0 3 Q8 2 8 -12 L4 -6 L0 -13 L-4 -6 Z" fill="${c}"/><path d="M-5 -9 Q-5 0 -1 1" stroke="#fff" stroke-width="1.4" opacity=".4" fill="none"/></g>`;
const bat = (x, y, s = 1) => `<g class="ps-fly" style="--d:${(7 + x / 80).toFixed(1)}s;--delay:${(-x / 50).toFixed(1)}s" transform="translate(${x} ${y}) scale(${s})"><path class="ps-flap" d="M0 0 Q-6 -8 -16 -4 Q-12 0 -14 5 Q-8 2 -4 6 Q-2 2 0 4 Q2 2 4 6 Q8 2 14 5 Q12 0 16 -4 Q6 -8 0 0 Z" fill="#1e1b4b"/></g>`;
const fish = (x, y, c, s = 1) => `<g class="ps-swim" style="--d:${(9 + (x % 5)).toFixed(1)}s;--delay:${(-x / 40).toFixed(1)}s" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="10" ry="6" fill="${c}"/><path d="M8 0 L16 -6 L16 6 Z" fill="${c}"/><circle cx="-5" cy="-1.5" r="1.6" fill="#fff"/><circle cx="-5.3" cy="-1.5" r=".8" fill="#0f172a"/></g>`;
const leaf = (x, y, c, i) => `<path class="ps-leaf" d="M${x} ${y} q6 -8 12 0 q-6 8 -12 0 Z" fill="${c}" style="--d:${(6 + (i % 4)).toFixed(1)}s;--delay:${(-i * 0.9).toFixed(1)}s"/>`;
const burstFw = (x, y, c, i) =>
  `<g class="ps-firework" style="transform-origin:${x}px ${y}px;--delay:${(-i * 0.8).toFixed(1)}s">${Array.from({ length: 12 }, (_, k) => {
    const a = (k * Math.PI) / 6;
    return `<path d="M${r(x + Math.cos(a) * 6)} ${r(y + Math.sin(a) * 6)} L${r(x + Math.cos(a) * 22)} ${r(y + Math.sin(a) * 22)}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`;
  }).join('')}<circle cx="${x}" cy="${y}" r="3" fill="#fff"/></g>`;
const gift = (x, y, c, ribbon, w = 22) => `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="${-w * 0.8}" width="${w}" height="${w * 0.8}" rx="2" fill="${c}"/><rect x="${-w / 2 - 2}" y="${-w * 0.95}" width="${w + 4}" height="${w * 0.22}" rx="2" fill="${c}"/><rect x="-2.5" y="${-w * 0.95}" width="5" height="${w * 0.95}" fill="${ribbon}"/><path d="M0 ${-w * 0.95} q-8 -8 -10 -1 q4 3 10 1 q8 -8 10 -1 q-4 3 -10 1" fill="${ribbon}"/></g>`;
const pumpkin = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="-8" cy="0" rx="10" ry="12" fill="#ea580c"/><ellipse cx="8" cy="0" rx="10" ry="12" fill="#ea580c"/><ellipse cx="0" cy="0" rx="10" ry="13" fill="#f97316"/><rect x="-2" y="-17" width="4" height="7" rx="1.5" fill="#15803d"/><g class="ps-glow-face" fill="#fde047"><path d="M-9 -4 l4 -4 l3 4 Z M9 -4 l-4 -4 l-3 4 Z M-8 4 q8 6 16 0 l-3 3 l-2 -2 l-3 3 l-3 -3 l-2 2 Z"/></g></g>`;

/** Сцены по месяцам. Каждая - функция (compact) → внутренность SVG. */
const SCENES = [
  // 0 - Зимняя сказка
  (c) => `${sky('#1e3a8a', '#93c5fd', 330, 40)}${twinkle(c ? 10 : 22)}<circle cx="330" cy="40" r="18" fill="#f8fafc"/><circle cx="324" cy="35" r="4" fill="#e2e8f0"/>
    ${hills('#bfdbfe', '#f8fafc')}${pine(250, 150, 1.1, '#166534', true)}${pine(285, 160, 1.4, '#14532d', true)}${c ? '' : pine(360, 152, 1.2, '#166534', true) + pine(320, 168, 0.9, '#15803d', true)}
    ${c ? '' : `<g transform="translate(205 172)"><circle r="11" fill="#fff"/><circle cy="-15" r="8" fill="#fff"/><path d="M0 -15 l8 2 l-8 1 Z" fill="#f97316"/><circle cx="-2.5" cy="-17" r="1" fill="#0f172a"/><circle cx="2" cy="-17" r="1" fill="#0f172a"/><path d="M-6 -9 h12" stroke="#dc2626" stroke-width="3"/></g>`}
    ${fall(c ? 14 : 30, '#fff')}`,
  // 1 - Сердечки
  (c) => `${sky('#fce7f3', '#fda4af', 320, 60)}${cloud(80, 40, 1.1)}${cloud(250, 30, 0.8)}${hills('#fbcfe8', '#f9a8d4')}
    ${[[290, 70, 18, '#f43f5e'], [340, 95, 14, '#fb7185'], [250, 105, 11, '#ec4899']].map(([x, y, s, col], i) => `<g class="ps-bob" style="--delay:${-i}s"><path d="M${x} ${y + s} Q${x + 3} ${y + 40} ${x - 2} ${y + 70}" stroke="#be185d" stroke-width="1" fill="none"/>${heart(x, y, s, col)}<ellipse cx="${x - s * 0.5}" cy="${y - s * 0.3}" rx="${s * 0.22}" ry="${s * 0.12}" fill="#fff" opacity=".6"/></g>`).join('')}
    ${Array.from({ length: c ? 5 : 10 }, (_, i) => `<g class="ps-rise" style="--d:${(6 + (i % 4)).toFixed(1)}s;--delay:${(-i * 0.9).toFixed(1)}s">${heart((i * 41 + 20) % 400, 190, 4 + (i % 3), ['#f43f5e', '#fb7185', '#f472b6'][i % 3])}</g>`).join('')}`,
  // 2 - Весеннее цветение
  (c) => `${sky('#e0f2fe', '#fef08a', 340, 40)}${sunRays(340, 40, 16, '#fde047')}${cloud(90, 35)}${hills('#86efac', '#4ade80')}
    ${[220, 245, 270, 295, 320, 345, 370].slice(0, c ? 4 : 7).map((x, i) => tulip(x, 165 - (i % 2) * 6, ['#f43f5e', '#ec4899', '#facc15', '#a855f7'][i % 4])).join('')}
    ${[[150, 80, '#f472b6'], [300, 60, '#a78bfa']].map(([x, y, col], i) => `<g class="ps-flutter" style="--delay:${-i * 1.3}s" transform="translate(${x} ${y})"><path class="ps-flap" d="M0 0 Q-10 -12 -12 -2 Q-10 6 0 2 Q10 6 12 -2 Q10 -12 0 0 Z" fill="${col}"/><path d="M0 -6 V6" stroke="#1e1b4b" stroke-width="1.6"/></g>`).join('')}`,
  // 3 - Космос
  (c) => `${sky('#0f172a', '#6366f1', 120, 60)}${twinkle(c ? 14 : 34)}<g class="ps-bob"><circle cx="300" cy="70" r="30" fill="#a78bfa"/><path d="M276 62 q24 -8 48 4" stroke="#7c3aed" stroke-width="4" fill="none" opacity=".6"/><ellipse cx="300" cy="72" rx="52" ry="11" fill="none" stroke="#fde68a" stroke-width="4" transform="rotate(-14 300 72)"/><circle cx="290" cy="60" r="7" fill="#fff" opacity=".35"/></g>
    <circle cx="370" cy="30" r="9" fill="#38bdf8"/><circle cx="367" cy="27" r="3" fill="#fff" opacity=".5"/>
    ${c ? '' : `<g class="ps-rocket"><g transform="translate(200 120) rotate(35)"><path d="M0 -26 Q10 -14 9 8 H-9 Q-10 -14 0 -26 Z" fill="#f8fafc"/><circle cy="-8" r="4.5" fill="#38bdf8" stroke="#64748b" stroke-width="1.5"/><path d="M-9 0 L-16 12 L-9 8 Z M9 0 L16 12 L9 8 Z" fill="#ef4444"/><path class="ps-flame" d="M-6 9 Q0 26 6 9 Z" fill="#f97316"/></g></g>`}
    <path d="M0 170 Q100 150 200 168 T400 160 V200 H0 Z" fill="#334155"/><ellipse cx="80" cy="180" rx="16" ry="5" fill="#1e293b"/><ellipse cx="300" cy="182" rx="22" ry="6" fill="#1e293b"/>`,
  // 4 - Сад
  (c) => `${sky('#ecfccb', '#fef08a', 60, 40)}${sunRays(60, 40, 15, '#facc15')}${cloud(220, 30, 0.9)}${hills('#a3e635', '#65a30d')}
    <g fill="#fef3c7" stroke="#d97706" stroke-width="1">${Array.from({ length: 9 }, (_, i) => `<rect x="${200 + i * 22}" y="138" width="10" height="34" rx="3"/>`).join('')}<rect x="198" y="146" width="200" height="5" rx="2"/></g>
    ${Array.from({ length: c ? 5 : 10 }, (_, i) => flower(205 + i * 20, 168 + (i % 2) * 6, i % 2 ? '#fff' : '#fde047', '#f59e0b', 0.9)).join('')}
    <g class="ps-crawl"><g transform="translate(240 186)"><ellipse rx="7" ry="5" fill="#dc2626"/><path d="M0 -5 V5" stroke="#111827"/><circle cx="-2.5" cy="-1" r="1.2" fill="#111827"/><circle cx="2.5" cy="2" r="1.2" fill="#111827"/><circle cx="-7" cy="0" r="2.5" fill="#111827"/></g></g>
    ${[[150, 90], [330, 70]].map(([x, y], i) => `<g class="ps-flutter" style="--delay:${-i}s" transform="translate(${x} ${y})"><ellipse rx="6" ry="4.5" fill="#facc15"/><path d="M-3 -4 V4 M1 -4 V4" stroke="#1e1b4b" stroke-width="1.6"/><ellipse class="ps-flap" cx="0" cy="-6" rx="4" ry="3" fill="#e0f2fe" opacity=".85"/></g>`).join('')}`,
  // 5 - Лето
  (c) => `${sky('#7dd3fc', '#fef08a', 330, 40)}${sunRays(330, 40, 18, '#fbbf24')}${cloud(90, 40)}
    <path d="M0 128 H400 V160 H0 Z" fill="#0ea5e9"/><path class="ps-wave" d="M-20 132 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#e0f2fe" stroke-width="2" fill="none"/>
    <path d="M0 150 Q120 140 240 152 T400 148 V200 H0 Z" fill="#fde68a"/>
    <g transform="translate(300 165)"><path d="M0 0 Q4 -40 -6 -72" stroke="#92400e" stroke-width="6" fill="none"/>${[-60, -20, 20, 60, 100].map((a) => `<path class="ps-sway" d="M-6 -72 q${r(Math.cos((a * Math.PI) / 180) * 30)} ${r(Math.sin((a * Math.PI) / 180) * 18 - 8)} ${r(Math.cos((a * Math.PI) / 180) * 40)} ${r(Math.sin((a * Math.PI) / 180) * 30)}" stroke="#16a34a" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')}</g>
    ${c ? '' : `<g transform="translate(220 175)"><path d="M0 0 V-36" stroke="#78350f" stroke-width="2.5"/><path d="M-30 -30 Q0 -56 30 -30 Z" fill="#f43f5e"/><path d="M-30 -30 Q-15 -38 -10 -30 M10 -30 Q15 -38 30 -30" fill="#fff"/></g><g transform="translate(180 185)"><rect x="-6" y="-14" width="12" height="16" rx="2" fill="#fde047" opacity=".9"/><path d="M2 -14 L6 -24" stroke="#ec4899" stroke-width="1.6"/><circle cx="-3" cy="-14" r="3" fill="#a3e635"/></g>`}`,
  // 6 - Океан
  (c) => `<rect width="400" height="200" fill="#0369a1"/><rect width="400" height="90" fill="#0ea5e9" opacity=".6"/>
    ${[60, 160, 280].map((x, i) => `<path class="ps-ray" style="--delay:${-i}s" d="M${x} 0 L${x + 40} 0 L${x + 90} 200 L${x + 30} 200 Z" fill="#e0f2fe" opacity=".12"/>`).join('')}
    ${fish(120, 70, '#facc15')}${fish(260, 110, '#fb923c', 1.2)}${c ? '' : fish(340, 60, '#f472b6', 0.9) + fish(200, 140, '#a78bfa', 0.8)}
    <path d="M0 175 Q100 160 200 176 T400 170 V200 H0 Z" fill="#fde68a"/>
    ${[230, 260, 350, 375].map((x, i) => `<path class="ps-sway" style="--delay:${-i * 0.6}s" d="M${x} 190 q-10 -20 0 -40 q10 -20 0 -40" stroke="${i % 2 ? '#16a34a' : '#22c55e'}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}
    <g transform="translate(305 185)"><path d="M0 0 V-26 M0 -14 L-12 -26 M0 -18 L12 -32 M-12 -26 L-14 -34 M12 -32 L18 -36" stroke="#fb7185" stroke-width="5" stroke-linecap="round" fill="none"/></g>
    ${fall(c ? 6 : 14, '#e0f2fe', 2.6, 'ps-bubble')}`,
  // 7 - Фестиваль
  (c) => `${sky('#1e1b4b', '#c026d3', 200, 20)}${twinkle(c ? 8 : 16)}${burstFw(90, 50, '#f472b6', 0)}${burstFw(230, 35, '#facc15', 1)}${burstFw(340, 60, '#22d3ee', 2)}${c ? '' : burstFw(160, 80, '#a3e635', 3)}
    <path d="M0 90 Q100 120 200 96 T400 92" stroke="#fde68a" stroke-width="1" fill="none"/>${Array.from({ length: 9 }, (_, i) => `<circle class="ps-blink" cx="${20 + i * 45}" cy="${100 + Math.sin(i) * 6}" r="3.5" fill="${['#f472b6', '#facc15', '#22d3ee'][i % 3]}" style="--delay:${(-i * 0.3).toFixed(1)}s"/>`).join('')}
    <g fill="#312e81">${[[0, 130, 40, 70], [40, 115, 30, 85], [70, 140, 50, 60], [120, 120, 36, 80], [156, 100, 30, 100], [186, 135, 46, 65], [232, 118, 34, 82], [266, 128, 44, 72], [310, 108, 30, 92], [340, 138, 60, 62]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}</g>
    <g fill="#fde047" opacity=".8">${Array.from({ length: c ? 10 : 22 }, (_, i) => `<rect class="ps-blink" x="${(i * 37 + 8) % 390}" y="${150 + (i % 4) * 10}" width="5" height="5" style="--delay:${(-i * 0.5).toFixed(1)}s"/>`).join('')}</g>`,
  // 8 - Снова в школу
  (c) => `<rect width="400" height="200" fill="#fef3c7"/><rect x="190" y="18" width="200" height="110" rx="6" fill="#92400e"/><rect x="197" y="25" width="186" height="96" rx="3" fill="#166534"/>
    <g stroke="#f8fafc" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"><path d="M215 55 h20 m-10 -10 v20"/><path d="M250 55 q10 -16 20 0 t20 0"/><path d="M215 90 l10 -12 l10 12 z"/><path d="M300 92 h40 M300 100 h28"/><path class="ps-twinkle" d="M360 45 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" fill="#fde047" stroke="none"/></g>
    <rect x="0" y="150" width="400" height="50" fill="#d97706"/><rect x="0" y="150" width="400" height="6" fill="#b45309"/>
    <g transform="translate(250 150)"><rect x="-30" y="-12" width="60" height="12" rx="2" fill="#3b82f6"/><rect x="-26" y="-24" width="54" height="12" rx="2" fill="#ef4444"/><rect x="-28" y="-36" width="56" height="12" rx="2" fill="#22c55e"/><path d="M-26 -30 h52 M-24 -18 h48" stroke="#fff" stroke-width="1" opacity=".5"/></g>
    <g transform="translate(320 140)"><circle r="10" fill="#ef4444"/><path d="M0 -10 q3 -6 7 -6" stroke="#15803d" stroke-width="2" fill="none"/><ellipse cx="-4" cy="-3" rx="2.5" ry="3.5" fill="#fff" opacity=".4"/></g>
    ${[340, 352, 364].map((x, i) => `<g transform="translate(${x} 148) rotate(${-14 + i * 10})"><rect x="-3" y="-40" width="6" height="34" fill="${['#facc15', '#38bdf8', '#f472b6'][i]}"/><path d="M-3 -6 L0 2 L3 -6 Z" fill="#fde68a"/></g>`).join('')}
    ${c ? '' : `<g class="ps-plane"><path d="M0 0 L26 8 L4 12 Z M4 12 L8 20 L12 10" fill="#fff" stroke="#94a3b8" stroke-width="1"/></g>`}`,
  // 9 - Хэллоуин
  (c) => `${sky('#3b0764', '#f97316', 320, 50)}${twinkle(c ? 8 : 18, '#fde68a')}<circle cx="320" cy="50" r="28" fill="#fef3c7"/><circle cx="312" cy="44" r="5" fill="#fde68a"/><circle cx="330" cy="58" r="3.5" fill="#fde68a"/>
    <path d="M0 160 Q100 130 210 156 T400 150 V200 H0 Z" fill="#1e1b4b"/><path d="M110 150 Q112 110 100 90 M108 120 L90 104 M106 105 L120 92" stroke="#1e1b4b" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${pumpkin(240, 176)}${pumpkin(282, 182, 0.75)}${c ? '' : pumpkin(350, 178, 0.9)}
    ${bat(180, 50)}${bat(260, 80, 0.8)}${c ? '' : bat(60, 40, 0.7)}
    ${c ? '' : `<g class="ps-bob"><path d="M370 100 q-14 0 -14 16 v18 l5 -4 l5 4 l4 -4 l5 4 l5 -4 l4 4 v-18 q0 -16 -14 -16 Z" fill="#f8fafc" opacity=".9"/><circle cx="365" cy="114" r="2" fill="#1e1b4b"/><circle cx="375" cy="114" r="2" fill="#1e1b4b"/></g>`}`,
  // 10 - Листопад
  (c) => `${sky('#ffedd5', '#fdba74', 340, 45)}${sunRays(340, 45, 14, '#fb923c')}${hills('#fdba74', '#c2410c')}
    ${[[230, 150, 1.2, '#ea580c'], [290, 160, 1.5, '#dc2626'], [355, 150, 1.3, '#f59e0b']].slice(0, c ? 2 : 3).map(([x, y, s, col]) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-8" width="6" height="22" fill="#78350f"/><circle cx="0" cy="-20" r="16" fill="${col}"/><circle cx="-12" cy="-12" r="10" fill="${col}"/><circle cx="12" cy="-13" r="11" fill="${col}"/><circle cx="-4" cy="-26" r="6" fill="#fff" opacity=".2"/></g>`).join('')}
    <g transform="translate(200 186)"><path d="M-6 0 v-6 h12 v6" fill="#fef3c7"/><path d="M-11 -6 q11 -14 22 0 Z" fill="#dc2626"/><circle cx="-3" cy="-9" r="1.6" fill="#fff"/><circle cx="4" cy="-8" r="1.2" fill="#fff"/></g>
    ${Array.from({ length: c ? 7 : 16 }, (_, i) => leaf((i * 53 + 10) % 400, (i * 23) % 80, ['#f97316', '#dc2626', '#facc15', '#b45309'][i % 4], i)).join('')}`,
  // 11 - Новый год
  (c) => `${sky('#14532d', '#fde68a', 300, 30)}${twinkle(c ? 8 : 18, '#fde68a')}<path d="M0 165 Q120 150 220 166 T400 160 V200 H0 Z" fill="#f8fafc"/>
    <g transform="translate(300 175)"><rect x="-5" y="-6" width="10" height="12" fill="#78350f"/><path d="M-44 -4 L0 -50 L44 -4 Z M-36 -36 L0 -82 L36 -36 Z M-27 -66 L0 -110 L27 -66 Z" fill="#166534"/>
      <path d="M-38 -12 Q0 0 38 -14 M-30 -44 Q0 -32 30 -46 M-20 -74 Q0 -64 20 -76" stroke="#facc15" stroke-width="1.6" fill="none"/>
      ${[[-30, -12], [-12, -8], [10, -9], [30, -13], [-22, -44], [0, -38], [22, -45], [-12, -72], [12, -73], [-30, -18]].map(([x, y], i) => `<circle class="ps-blink" cx="${x}" cy="${y}" r="3.2" fill="${['#ef4444', '#facc15', '#38bdf8', '#f472b6'][i % 4]}" style="--delay:${(-i * 0.35).toFixed(2)}s"/>`).join('')}
      <path class="ps-twinkle" d="M0 -120 l4 9 l10 1 l-8 6 l3 10 l-9 -6 l-9 6 l3 -10 l-8 -6 l10 -1 Z" fill="#fde047"/></g>
    ${gift(240, 186, '#ef4444', '#facc15')}${gift(266, 188, '#3b82f6', '#f8fafc', 18)}${c ? '' : gift(350, 188, '#a855f7', '#fde047', 20)}
    ${fall(c ? 10 : 24, '#fff')}`,
];

/** Сцена месяца (0-11). compact - облегчённая версия для карточки на главной. */
export function passScene(month, { compact = false } = {}) {
  const fn = SCENES[((month % 12) + 12) % 12];
  return `<svg class="pass-scene pass-scene-${month}" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${fn(compact)}</svg>`;
}
