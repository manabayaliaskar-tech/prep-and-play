// Эмоции и танцы Препи (покупаются в магазине). Каждая эмоция — CSS-анимация на <svg class="mascot emote emote-<id>">
// плюс, если нужно, реквизит (props) поверх Препи в его координатах 140×150, лицо (mood) и поза рук (pose).
// EMOTES[id] = { mood, pose, props, scene, ms }: props двигаются вместе с телом (внутри .mascot-body),
// scene — неподвижный реквизит вокруг (вне тела), ms — длительность одного проигрывания.
// Вся анимация — в styles/parts/emotes.css. Классы реквизита начинаются с emo-:
//   emo-al / emo-ar — вращаются вместе с левой / правой рукой (вокруг плеча),
//   emo-fx — мимолётные эффекты (без анимации скрыты, например при prefers-reduced-motion).

const OUT = '#22164f';

/** Кисть Препи поверх реквизита (как в mascot.js), чтобы рука «держала» предмет. */
const hand = (x, y) =>
  `<g class="emo-hand"><circle cx="${x}" cy="${y}" r="7" fill="var(--mascot-1)" stroke="var(--mascot-2)" stroke-width="1.6"/><circle cx="${x - 2}" cy="${y - 2.2}" r="2.2" fill="#fff" opacity=".45"/></g>`;

const f1 = (n) => Number(n.toFixed(1));

/** Пятиконечная звезда. */
function star5(x, y, r, fill, line, sw = 1.2) {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 ? r * 0.48 : r;
    pts.push(`${f1(x + rr * Math.cos(a))} ${f1(y + rr * Math.sin(a))}`);
  }
  return `<path d="M${pts.join(' L')} Z" fill="${fill}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>`;
}

/** Четырёхлучевая искорка. */
const sparkle = (x, y, s, fill = '#facc15', line = '') =>
  `<path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z" fill="${fill}"${line ? ` stroke="${line}" stroke-width=".8" stroke-linejoin="round"` : ''}/>`;

/** Сердечко с тенью и бликом. */
function heart(x, y, s, fill = '#fb7185', shade = '#e11d48', line = '#9f1239') {
  const d = `M${x} ${f1(y + s * 0.9)} C${f1(x - s * 1.5)} ${f1(y - s * 0.1)} ${f1(x - s)} ${f1(y - s * 1.3)} ${x} ${f1(y - s * 0.45)} C${f1(x + s)} ${f1(y - s * 1.3)} ${f1(x + s * 1.5)} ${f1(y - s * 0.1)} ${x} ${f1(y + s * 0.9)} Z`;
  return `<path d="${d}" fill="${fill}" stroke="${line}" stroke-width="${f1(Math.max(1, s * 0.16))}" stroke-linejoin="round"/>
    <path d="M${f1(x + s * 1.05)} ${f1(y - s * 0.25)} C${f1(x + s * 0.95)} ${f1(y + s * 0.25)} ${f1(x + s * 0.45)} ${f1(y + s * 0.55)} ${x} ${f1(y + s * 0.75)}" stroke="${shade}" stroke-width="${f1(s * 0.32)}" fill="none" stroke-linecap="round" opacity=".55"/>
    <ellipse cx="${f1(x - s * 0.55)}" cy="${f1(y - s * 0.5)}" rx="${f1(s * 0.28)}" ry="${f1(s * 0.18)}" transform="rotate(-35 ${f1(x - s * 0.55)} ${f1(y - s * 0.5)})" fill="#fff" opacity=".8"/>`;
}

/** Нота (восьмая). */
const note = (x, y, fill, line) =>
  `<path d="M${x + 3.4} ${y - 1} V${y - 15} q6.5 1.5 6 9.5" stroke="${line}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
   <ellipse cx="${x}" cy="${y}" rx="4.4" ry="3.3" transform="rotate(-22 ${x} ${y})" fill="${fill}" stroke="${line}" stroke-width="1.3"/>
   <ellipse cx="${x - 1.4}" cy="${y - 1}" rx="1.4" ry=".8" transform="rotate(-22 ${x - 1.4} ${y - 1})" fill="#fff" opacity=".8"/>`;

/** Облачко пыли. */
const puff = (x, y, dir = 1) =>
  `<g fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"><circle cx="${x}" cy="${y}" r="4.2"/><circle cx="${x - 5 * dir}" cy="${y + 1}" r="3"/><circle cx="${x + 3.6 * dir}" cy="${y - 2.4}" r="2.4"/></g>`;

/** Мимолётный эффект: style задаёт переменные (--x, --y, --r, --dl) для общей анимации. */
const fx = (cls, style, inner) => `<g class="emo-fx ${cls}"${style ? ` style="${style}"` : ''}>${inner}</g>`;

// Детерминированный «случай» — чтобы конфетти и искры не прыгали между перерисовками.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const CONFETTI = ['#f43f5e', '#facc15', '#22d3ee', '#a3e635', '#a78bfa', '#fb923c', '#f472b6'];
const darker = { '#f43f5e': '#9f1239', '#facc15': '#a16207', '#22d3ee': '#0e7490', '#a3e635': '#4d7c0f', '#a78bfa': '#5b21b6', '#fb923c': '#9a3412', '#f472b6': '#9d174d' };

// ---------- Реквизит ----------

/** Помпон чирлидера в точке (cx, cy). */
function pompom(cx, cy, [base, shade, hi, line]) {
  const n = 14;
  let rim = '';
  let fill = '';
  let strands = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const [px, py] = [f1(cx + 9 * Math.cos(a)), f1(cy + 9 * Math.sin(a))];
    rim += `<circle cx="${px}" cy="${py}" r="3.6"/>`;
    fill += `<circle cx="${px}" cy="${py}" r="2.6"/>`;
    strands += `<path d="M${f1(cx + 2.5 * Math.cos(a))} ${f1(cy + 2.5 * Math.sin(a))} L${f1(cx + 9.5 * Math.cos(a))} ${f1(cy + 9.5 * Math.sin(a))}"/>`;
  }
  let shine = '';
  for (let i = 0; i < 5; i++) {
    const a = -2.6 + i * 0.32;
    shine += `<path d="M${f1(cx + 3 * Math.cos(a))} ${f1(cy + 3 * Math.sin(a))} L${f1(cx + 8.5 * Math.cos(a))} ${f1(cy + 8.5 * Math.sin(a))}"/>`;
  }
  return `<g class="emo-pom">
    <g fill="${line}">${rim}<circle cx="${cx}" cy="${cy}" r="9"/></g>
    <g fill="${base}">${fill}</g>
    <circle cx="${cx}" cy="${cy}" r="8.6" fill="${shade}"/>
    <g stroke="${base}" stroke-width="2.6" stroke-linecap="round">${strands}</g>
    <g stroke="${hi}" stroke-width="1.4" stroke-linecap="round" opacity=".95">${shine}</g>
    <circle cx="${cx}" cy="${cy}" r="2.4" fill="${base}" stroke="${shade}" stroke-width=".8"/>
  </g>`;
}

/** Мячик для жонглирования. */
function ball(x, y, [base, shade, hi, line]) {
  return `<circle cx="${x}" cy="${y}" r="7.5" fill="${base}" stroke="${line}" stroke-width="1.4"/>
    <path d="M${x + 6.9} ${y + 1.2} A7 7 0 0 1 ${x - 1.2} ${y + 7} Q${x + 5} ${y + 5} ${x + 6.9} ${y + 1.2} Z" fill="${shade}"/>
    <path d="M${x - 7} ${y + 0.8} Q${x} ${y - 4} ${x + 7} ${y + 0.8}" stroke="${line}" stroke-width="1" fill="none" opacity=".45"/>
    <ellipse cx="${x - 2.8}" cy="${y - 3.2}" rx="2.4" ry="1.5" transform="rotate(-30 ${x - 2.8} ${y - 3.2})" fill="${hi}"/>`;
}

/** Электрогитара: корпус в (30, 116), гриф уходит вправо-вверх к правой руке. */
const GUITAR = `<g transform="translate(30 116) rotate(-13.5)">
    <path d="M104 -3.4 L117 -6.6 Q120.6 -6.6 120.2 -3.2 L119.4 3.2 Q119 5.4 115.6 5 L104 3.6 Z" fill="#1f2937" stroke="#0b0f19" stroke-width="1.2" stroke-linejoin="round"/>
    <g fill="#e5e7eb" stroke="#475569" stroke-width=".6"><circle cx="109" cy="-5.6" r="1.4"/><circle cx="114" cy="-6.6" r="1.4"/><circle cx="109" cy="5.4" r="1.4"/><circle cx="114" cy="6.2" r="1.4"/></g>
    <rect x="12" y="-3" width="94" height="6" rx="1.5" fill="#b45309" stroke="#5b2a06" stroke-width="1.2"/>
    <rect x="14" y="-1.9" width="90" height="3.8" fill="#7c2d12"/>
    <path d="M24 -1.9 V1.9 M33 -1.9 V1.9 M42 -1.9 V1.9 M51 -1.9 V1.9 M60 -1.9 V1.9 M69 -1.9 V1.9 M78 -1.9 V1.9 M87 -1.9 V1.9 M96 -1.9 V1.9" stroke="#fde68a" stroke-width=".8"/>
    <circle cx="46.5" cy="0" r=".9" fill="#fef3c7"/><circle cx="64.5" cy="0" r=".9" fill="#fef3c7"/>
    <g fill="#7f1d1d"><ellipse cx="-6" cy="1" rx="16.2" ry="14.2"/><ellipse cx="11" cy="-1" rx="11.6" ry="10.6"/></g>
    <g fill="#ef4444"><ellipse cx="-6" cy="1" rx="14.6" ry="12.6"/><ellipse cx="11" cy="-1" rx="10" ry="9"/></g>
    <path d="M-20.4 4 Q-12 15 2 11 Q14 8 20 2 Q19 8 12 9.6 Q2 14.6 -8 13.4 Q-17 12 -20.4 4 Z" fill="#b91c1c"/>
    <path d="M-17 -6 Q-11 -11.6 -3 -10.4 M6 -9 Q12 -10 16 -7" stroke="#fecaca" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M-3 -6.6 Q8 -9.4 15 -4 L13 5.4 Q2 9 -5 5.6 Z" fill="#fff7ed" stroke="#7f1d1d" stroke-width=".8" stroke-linejoin="round"/>
    <g fill="#1f2937"><rect x="0" y="-4.4" width="2.8" height="8.8" rx=".9"/><rect x="6.4" y="-4.6" width="2.8" height="8.8" rx=".9"/><rect x="-13" y="-3.8" width="3.4" height="7.6" rx="1"/></g>
    <g fill="#fde68a" stroke="#a16207" stroke-width=".6"><circle cx="-15" cy="7" r="1.8"/><circle cx="-9.6" cy="9.4" r="1.8"/></g>
    <path d="M-11.6 -1.5 H106 M-11.6 0 H106 M-11.6 1.5 H106" stroke="#f8fafc" stroke-width=".45" opacity=".9"/>
  </g>`;

/** Волшебная палочка в правой руке (в позе rest; поворачивается вместе с рукой). */
const WAND = `<g class="emo-ar emo-wand">
    <path d="M121 112 H155" stroke="${OUT}" stroke-width="4.6" stroke-linecap="round"/>
    <path d="M121 112 H147" stroke="#334155" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M147.5 112 H154.4" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M125 111 H144" stroke="#94a3b8" stroke-width=".8" stroke-linecap="round"/>
    <g class="emo-wand-star">${star5(158, 112, 4.4, '#facc15', '#b45309', 1)}</g>
    ${hand(121, 112)}
  </g>`;

/** Заводной ключ сбоку (для робота). */
const WINDUP_KEY = `<g class="emo-key">
    <rect x="22" y="115.2" width="18" height="3.6" rx="1.2" fill="#eab308" stroke="#92400e" stroke-width="1"/>
    <rect x="35" y="113.6" width="3.4" height="6.8" rx="1" fill="#ca8a04" stroke="#92400e" stroke-width="1"/>
    <g class="emo-key-bow">
      <path d="M23 117 C19 104 5 103 7 111.4 C8 114.6 8 119.4 7 122.6 C5 131 19 130 23 117 Z" fill="#facc15" stroke="#92400e" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M21 117 C16 108 9 107 10 112 M21 117 C16 126 9 127 10 122" stroke="#ca8a04" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M12 108.6 Q15 107.6 17.6 110" stroke="#fef9c3" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    </g>
  </g>`;

/** Кирпичи и доска для карате (доска из двух половинок). */
const BRICK = (x, y) =>
  `<rect x="${x}" y="${y}" width="13" height="8.6" rx="1.2" fill="#dc6b3f" stroke="#7c2d12" stroke-width="1.2"/><path d="M${x + 1.5} ${y + 6.6} H${x + 11.5}" stroke="#a3401f" stroke-width="1.6" stroke-linecap="round"/><path d="M${x + 2} ${y + 2} H${x + 7}" stroke="#fdba8c" stroke-width="1.2" stroke-linecap="round"/>`;
const boardHalf = (x0, x1, cls) =>
  `<g class="${cls}"><rect x="${x0}" y="120.6" width="${x1 - x0}" height="6.4" rx="1" fill="#e9b26f" stroke="#7c4a1d" stroke-width="1.2"/><path d="M${x0 + 1} 125.4 H${x1 - 1}" stroke="#c4863f" stroke-width="1.8"/><path d="M${x0 + 2} 122.6 Q${(x0 + x1) / 2} 121.4 ${x1 - 2} 123" stroke="#a8692f" stroke-width=".7" fill="none"/><path d="M${x0 + 2} 121.8 H${x0 + 7}" stroke="#fde3b8" stroke-width="1" stroke-linecap="round"/></g>`;

/** Цветок лотоса (сиденье для медитации). */
function lotus() {
  const petal = (x, y, len, w, ang, fill, line) =>
    `<path d="M0 0 Q${w} ${-len * 0.55} 0 ${-len} Q${-w} ${-len * 0.55} 0 0 Z" transform="translate(${x} ${y}) rotate(${ang})" fill="${fill}" stroke="${line}" stroke-width="1.2" stroke-linejoin="round"/>`;
  const vein = (x, y, len, ang) => `<path d="M0 -3 V${-len * 0.7}" transform="translate(${x} ${y}) rotate(${ang})" stroke="#fff" stroke-width="1" opacity=".55" stroke-linecap="round"/>`;
  return `<g class="emo-lotus">
    <ellipse cx="70" cy="145.5" rx="36" ry="4.6" fill="#4ade80" stroke="#15803d" stroke-width="1.2"/>
    <path d="M40 145 Q70 141 100 145" stroke="#bbf7d0" stroke-width="1.2" fill="none" opacity=".8"/>
    ${petal(70, 145, 18, 9, -62, '#fbcfe8', '#db2777')}${petal(70, 145, 18, 9, 62, '#fbcfe8', '#db2777')}
    ${petal(70, 145, 17, 8, -30, '#f9a8d4', '#db2777')}${petal(70, 145, 17, 8, 30, '#f9a8d4', '#db2777')}
    ${petal(70, 145, 16, 8, 0, '#fbcfe8', '#db2777')}
    ${petal(66, 146, 12, 7, -48, '#f472b6', '#be185d')}${petal(74, 146, 12, 7, 48, '#f472b6', '#be185d')}
    ${vein(70, 145, 16, 0)}${vein(70, 145, 17, -30)}${vein(70, 145, 17, 30)}
  </g>`;
}

/** Диско-шар на нити в левом верхнем углу. */
function discoBall(cx = 22, cy = 17, r = 10.5) {
  let tiles = '';
  let glints = '';
  const R = rng(7);
  for (let gx = -3; gx <= 3; gx++) {
    for (let gy = -3; gy <= 3; gy++) {
      const [x, y] = [cx + gx * 3.4, cy + gy * 3.4];
      if (Math.hypot(x - cx, y - cy) > r - 1.6) continue;
      const lit = gx + gy;
      const fill = lit <= -2 ? '#f8fafc' : lit >= 2 ? '#94a3b8' : '#cbd5e1';
      tiles += `<rect x="${f1(x - 1.5)}" y="${f1(y - 1.5)}" width="3" height="3" rx=".5" fill="${fill}"/>`;
      if (R() < 0.45) glints += `<rect class="emo-glint" style="--dl:-${f1(R() * 1.2)}s" x="${f1(x - 1.5)}" y="${f1(y - 1.5)}" width="3" height="3" rx=".5" fill="${R() < 0.5 ? '#fff' : '#a5f3fc'}"/>`;
    }
  }
  return `<g class="emo-disco">
    <path d="M${cx} -14 V${cy - r}" stroke="#475569" stroke-width="1.4"/>
    <rect x="${cx - 2.6}" y="${cy - r - 2.6}" width="5.2" height="3.4" rx="1" fill="#64748b" stroke="#334155" stroke-width=".8"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#64748b"/>
    ${tiles}${glints}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#334155" stroke-width="1.4"/>
    <ellipse cx="${cx - 3.6}" cy="${cy - 4}" rx="3" ry="2" transform="rotate(-35 ${cx - 3.6} ${cy - 4})" fill="#fff" opacity=".85"/>
    <g class="emo-twinkle" style="--dl:0s">${sparkle(cx + 11, cy - 6, 3.6, '#fff', '#94a3b8')}</g>
    <g class="emo-twinkle" style="--dl:-.4s">${sparkle(cx - 10, cy + 9, 3, '#fff', '#94a3b8')}</g>
    <g class="emo-twinkle" style="--dl:-.8s">${sparkle(cx + 8, cy + 12, 2.6, '#fff', '#94a3b8')}</g>
  </g>`;
}

/** Хлопушка: остриё в (x, y), смотрит под углом ang. */
const popper = (x, y, ang, cls) =>
  `<g transform="translate(${x} ${y}) rotate(${ang})"><g class="${cls}">
    <path d="M0 0 L-7.4 -22 L7.4 -22 Z" fill="#facc15" stroke="#92400e" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M-2.2 -6.6 L2.4 -7.2 L4 -12 L-4.2 -12.6 Z M-5.5 -16.6 L5.7 -17 L6.6 -19.8 L-6.6 -19.8 Z" fill="#ef4444"/>
    <path d="M-1.6 -4 L-5.4 -18" stroke="#fef9c3" stroke-width="1.3" stroke-linecap="round"/>
    <ellipse cx="0" cy="-22" rx="7.4" ry="2.4" fill="#7c2d12" stroke="#92400e" stroke-width="1"/>
  </g></g>`;

// ---------- Частицы ----------

/** Конфетти из хлопушки в точке (x, y): dir = 1 — летят вправо, -1 — влево. */
function confetti(x, y, dir, seed) {
  const R = rng(seed);
  let out = '';
  for (let i = 0; i < 11; i++) {
    const c = CONFETTI[Math.floor(R() * CONFETTI.length)];
    const kind = i % 3;
    const shape = kind === 0
      ? `<rect x="${x - 3}" y="${y - 1.8}" width="6" height="3.6" rx=".6" fill="${c}" stroke="${darker[c]}" stroke-width=".6"/>`
      : kind === 1
        ? `<circle cx="${x}" cy="${y}" r="2.3" fill="${c}" stroke="${darker[c]}" stroke-width=".6"/>`
        : `<path d="M${x - 3.5} ${y} q1.75 -2.4 3.5 0 t3.5 0" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    const vx = dir * (6 + R() * 84);
    const vy = -(88 + R() * 44);
    const style = `--x:${f1(vx)}px;--y:${f1(vy)}px;--dx:${f1(dir * (6 + R() * 14))}px;--r:${Math.round((R() < 0.5 ? -1 : 1) * (240 + R() * 400))}deg;--dl:${f1(R() * 0.12)}s;--fl:${f1(0.3 + R() * 0.35)}s`;
    out += fx('emo-conf', style, `<g class="emo-flutter">${shape}</g>`);
  }
  return out;
}

/** Салют: кольцо искр вокруг (x, y). */
function firework(x, y, colors, dl) {
  let out = '';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const c = colors[i % colors.length];
    out += fx('emo-fw', `--x:${f1(Math.cos(a) * 15)}px;--y:${f1(Math.sin(a) * 15)}px;--dl:${dl}s`, `<circle cx="${x}" cy="${y}" r="2.1" fill="${c}"/><circle cx="${x}" cy="${y}" r=".9" fill="#fff"/>`);
  }
  return out + fx('emo-fw-core', `--dl:${dl}s`, sparkle(x, y, 7, '#fff7c2', '#facc15'));
}

/** Звёзды, разлетающиеся из точки. */
function starBurst(x, y, n, dist, colors, cls = 'emo-burst-star') {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const c = colors[i % colors.length];
    out += fx(cls, `--x:${f1(Math.cos(a) * dist)}px;--y:${f1(Math.sin(a) * dist)}px;--r:${i % 2 ? 160 : -160}deg`, star5(x, y, i % 2 ? 3.6 : 4.8, c[0], c[1], 0.9));
  }
  return out;
}

// ---------- Эмоции ----------

export const EMOTES = {
  // Большое «привет!»: рука машет, тело покачивается в такт.
  'e-wave': {
    mood: 'happy',
    pose: 'wave',
    ms: 1600,
    props: `<g class="emo-fx emo-wl" stroke="#a78bfa" stroke-width="2.6" fill="none" stroke-linecap="round"><path d="M106 52 q-6 -8 -2 -18"/><path d="M99 56 q-5 -5 -3 -12"/></g>
      <g class="emo-fx emo-wr" stroke="#a78bfa" stroke-width="2.6" fill="none" stroke-linecap="round"><path d="M141 72 q6 -8 3 -18"/><path d="M147 66 q4 -5 2 -11"/></g>`,
  },

  // Весёлый танец: шаг-приставка с покачиванием, руки размахивают.
  'e-dance': {
    mood: 'win',
    pose: 'rest',
    ms: 1200,
    scene: fx('emo-note', '--x:-8px;--dl:0s', note(20, 74, '#a78bfa', '#5b21b6')) + fx('emo-note', '--x:8px;--dl:-.6s', note(116, 66, '#f472b6', '#9d174d')),
  },

  // Прыжки «звёздочкой»: руки вверх-вниз, приседания при приземлении.
  'e-jacks': {
    mood: 'happy',
    pose: 'open',
    ms: 1000,
    scene: fx('emo-puff', '', puff(42, 139, -1)) + fx('emo-puff', '', puff(98, 139, 1)),
  },

  // Сладкий зевок с потягиванием, потом сонное покачивание.
  'e-yawn': {
    mood: 'sleep',
    pose: 'open',
    ms: 3000,
    props: `${fx('emo-yawn', '', `<ellipse cx="70" cy="103" rx="10.5" ry="13.5" fill="${OUT}" stroke="#120b33" stroke-width="1.4"/><ellipse cx="70" cy="111" rx="7" ry="4.4" fill="#ff7aa8"/><path d="M63 94 Q70 91.6 77 94" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".9"/>`)}
      ${fx('emo-tear', '', '<path d="M101 82 Q104.6 87.6 101 90 Q97.4 87.6 101 82 Z" fill="#7dd3fc" stroke="#38bdf8" stroke-width=".9"/>')}`,
  },

  // Волчок: замах, два оборота в прыжке, приземление.
  'e-spin': {
    mood: 'win',
    pose: 'open',
    ms: 1400,
    scene: fx('emo-swoosh', '', `<path d="M12 88 A58 14 0 0 0 128 88" stroke="#c4b5fd" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M18 60 A52 11 0 0 0 122 60" stroke="#ddd6fe" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  },

  // Робот: механические шаги и щелчки руками, сбоку крутится заводной ключ.
  'e-robot': {
    mood: 'cool',
    pose: 'open',
    ms: 2000,
    props: WINDUP_KEY,
  },

  // Чирлидер с помпонами: руки по очереди, затем прыжок.
  'e-cheer': {
    mood: 'win',
    pose: 'open',
    ms: 1400,
    props: `<g class="emo-al">${pompom(5, 75, ['#f472b6', '#db2777', '#fce7f3', '#9d174d'])}</g><g class="emo-ar">${pompom(135, 75, ['#fbbf24', '#d97706', '#fef3c7', '#92400e'])}</g>`,
  },

  // Лунная походка: скольжение назад, разворот, скольжение обратно.
  'e-moonwalk': {
    mood: 'cool',
    pose: 'hips',
    ms: 2400,
    props: `<g class="emo-speed" stroke="#a5b4fc" stroke-width="3" fill="none" stroke-linecap="round"><path d="M126 58 H140"/><path d="M131 72 H140"/><path d="M122 124 H138"/></g>`,
  },

  // Карате: замах, удар ребром ладони — доска на кирпичах ломается пополам.
  'e-karate': {
    mood: 'cool',
    pose: 'rest',
    ms: 2000,
    props: fx('emo-chop', '', '<path d="M128.4 68.5 A28 28 0 0 1 119.6 119.2" stroke="#c4b5fd" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/><path d="M128.4 68.5 A28 28 0 0 1 119.6 119.2" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>'),
    scene: `<g class="emo-bricks">${BRICK(104, 127)}${BRICK(104, 135.6)}${BRICK(127, 127)}${BRICK(127, 135.6)}</g>
      ${boardHalf(102, 122, 'emo-board-l')}${boardHalf(122, 142, 'emo-board-r')}
      ${fx('emo-impact', '', `<g stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M${f1(122 + 8 * Math.cos((a * Math.PI) / 180))} ${f1(121 + 8 * Math.sin((a * Math.PI) / 180))} L${f1(122 + 15 * Math.cos((a * Math.PI) / 180))} ${f1(121 + 15 * Math.sin((a * Math.PI) / 180))}"/>`).join('')}</g>${star5(122, 121, 7, '#fde047', '#f59e0b', 1.2)}`)}
      ${[[-14, -16, 200], [12, -20, -240], [-20, -4, 160], [18, -6, -180]].map(([x, y, r]) => fx('emo-splinter', `--x:${x}px;--y:${y}px;--r:${r}deg`, '<rect x="120" y="121" width="5" height="2" rx=".6" fill="#e9b26f" stroke="#7c4a1d" stroke-width=".6"/>')).join('')}`,
  },

  // Воздушный поцелуй: «чмок» — и сердечки улетают.
  'e-blow-kiss': {
    mood: 'love',
    pose: 'rest',
    ms: 2200,
    props: fx('emo-lips', '', '<path d="M62 101 Q66 94.6 70 98.6 Q74 94.6 78 101 Q74 107.6 70 106 Q66 107.6 62 101 Z" fill="#f43f5e" stroke="#9f1239" stroke-width="1.2" stroke-linejoin="round"/><path d="M63.4 101.2 Q70 102.6 76.6 101.2" stroke="#9f1239" stroke-width="1" fill="none"/><ellipse cx="66" cy="99" rx="1.6" ry=".9" fill="#fff" opacity=".8"/>'),
    scene: [
      ['--x:30px;--y:-56px;--dl:0s', 11],
      ['--x:38px;--y:-20px;--dl:.1s', 6],
      ['--x:14px;--y:-76px;--dl:.18s', 5.5],
      ['--x:6px;--y:-38px;--dl:.26s', 4.5],
    ].map(([style, s], i) => fx('emo-kiss-heart', style, heart(106, 100, s, i % 2 ? '#fda4af' : '#fb7185'))).join(''),
  },

  // Сальто назад: присед, прыжок с полным оборотом, приземление.
  'e-backflip': {
    mood: 'win',
    pose: 'open',
    ms: 1600,
    scene: `${fx('emo-trail', '', '<path d="M70 -6 A56 56 0 0 0 14 50" stroke="#c4b5fd" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M70 106 A56 56 0 0 0 126 50" stroke="#c4b5fd" stroke-width="4" fill="none" stroke-linecap="round"/>')}
      ${fx('emo-land', '', puff(40, 139, -1) + puff(100, 139, 1))}`,
  },

  // Жонглёр: три мячика по дуге из руки в руку.
  'e-juggle': {
    mood: 'think',
    pose: 'rest',
    ms: 1200,
    props: [
      ['#ef4444', '#b91c1c', '#fecaca', '#7f1d1d'],
      ['#facc15', '#ca8a04', '#fef9c3', '#854d0e'],
      ['#38bdf8', '#0284c7', '#e0f2fe', '#075985'],
    ].map((c, i) => `<g class="emo-jx emo-jx${i + 1}"><g class="emo-jy">${ball(21, 102, c)}</g></g>`).join(''),
  },

  // Рок-звезда: соло на электрогитаре, качает головой, вылетают ноты.
  'e-guitar': {
    mood: 'cool',
    pose: 'rest',
    ms: 1600,
    props: `${GUITAR}<g class="emo-al">${hand(19, 112)}</g><g class="emo-ar">${hand(121, 112)}</g>`,
    scene: [
      [8, 98, '--x:-6px;--dl:0s', '#a78bfa', '#5b21b6'],
      [44, 88, '--x:-4px;--dl:-.55s', '#22d3ee', '#0e7490'],
      [124, 72, '--x:8px;--dl:-1.1s', '#f472b6', '#9d174d'],
    ].map(([x, y, s, c, l]) => fx('emo-note', s, note(x, y, c, l))).join(''),
  },

  // Фокус-покус: взмахи палочкой, «та-да!» — взрыв звёзд и дождь блёсток.
  'e-magic': {
    mood: 'wink',
    pose: 'rest',
    ms: 2000,
    props: WAND,
    scene: `${[[100, 50, 0], [116, 40, -0.15], [108, 60, -0.3]].map(([x, y, d]) => fx('emo-twinkle-fx', `--dl:${d}s`, sparkle(x, y, 3.6, '#fde68a', '#f59e0b'))).join('')}
      ${fx('emo-flash', '', `<circle cx="126" cy="48" r="11" fill="#fef9c3" opacity=".75"/>${sparkle(126, 48, 18, '#fff', '#facc15')}`)}
      ${starBurst(126, 48, 10, 20, [['#facc15', '#b45309'], ['#f472b6', '#9d174d'], ['#67e8f9', '#0e7490'], ['#c4b5fd', '#5b21b6']])}
      ${[[24, 22, 0], [46, 10, 0.08], [70, 4, 0.16], [94, 12, 0.04], [114, 20, 0.12], [36, 34, 0.2]].map(([x, y, d], i) => fx('emo-glitter', `--dl:${d}s`, sparkle(x, y, i % 2 ? 2.6 : 3.4, i % 3 === 0 ? '#facc15' : i % 3 === 1 ? '#f9a8d4' : '#a5f3fc'))).join('')}`,
  },

  // Брейк-данс: топрок, падение на спину, вращение (бэкспин), кип-ап и фриз.
  'e-breakdance': {
    mood: 'cool',
    pose: 'open',
    ms: 2400,
    scene: `<g class="emo-mat"><path d="M24 139 L116 139 L127 147.5 L13 147.5 Z" fill="#d6a46a" stroke="#7c5631" stroke-width="1.3" stroke-linejoin="round"/><path d="M70 139 L70 147.5 M47 139 L42 147.5 M93 139 L98 147.5" stroke="#b7834a" stroke-width="1"/><path d="M28 141 L60 141" stroke="#f1d3a8" stroke-width="1.2" stroke-linecap="round"/></g>
      ${fx('emo-swirl', '', '<path d="M8 104 A62 15 0 0 0 132 104" stroke="#c4b5fd" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M16 72 A54 12 0 0 0 124 72" stroke="#ddd6fe" stroke-width="3" fill="none" stroke-linecap="round"/>')}`,
  },

  // Медитация: парит над лотосом, мягкое сияние и расходящиеся круги.
  'e-meditate': {
    mood: 'proud',
    pose: 'belly',
    ms: 3200,
    props: '<g class="emo-halo" fill="none"><circle cx="70" cy="80" r="56" stroke="#fde68a" stroke-width="7" opacity=".28"/><circle cx="70" cy="80" r="56" stroke="#fef9c3" stroke-width="2" opacity=".8"/></g>',
    scene: `${lotus()}
      ${[0, -1.07, -2.13].map((d) => fx('emo-om', `--dl:${d}s`, '<circle cx="70" cy="74" r="50" fill="none" stroke="#facc15" stroke-width="2.4"/>')).join('')}
      ${[[44, 132, 0], [96, 130, -0.8], [58, 128, -1.6], [84, 133, -2.4], [70, 126, -1.2]].map(([x, y, d]) => fx('emo-mote', `--dl:${d}s`, `<circle cx="${x}" cy="${y}" r="2.2" fill="#fde68a" stroke="#f59e0b" stroke-width=".6"/>`)).join('')}`,
  },

  // Диско: зеркальный шар, цветные лучи и пятна света, движение «Лихорадки субботнего вечера».
  'e-disco': {
    mood: 'starstruck',
    pose: 'wave',
    ms: 2000,
    scene: `<g class="emo-beams">${[['#f472b6', 30, 64], ['#22d3ee', 58, 96], ['#facc15', 88, 124], ['#a3e635', 112, 150]].map(([c, a, b]) => `<path class="emo-beam" d="M22 17 L${a} 152 L${b} 152 Z" fill="${c}" opacity=".2"/>`).join('')}</g>
      <g class="emo-spots">${[['#f472b6', 46], ['#22d3ee', 70], ['#facc15', 96]].map(([c, x]) => `<ellipse class="emo-spot" cx="${x}" cy="144" rx="13" ry="3.4" fill="${c}" opacity=".45"/>`).join('')}</g>
      ${discoBall()}`,
  },

  // Триумф: прыжок с кулаками вверх, хлопушки с конфетти и салют.
  'e-victory': {
    mood: 'win',
    pose: 'up',
    ms: 2400,
    scene: `${popper(12, 146, 32, 'emo-popper-l')}${popper(128, 146, -32, 'emo-popper-r')}
      ${confetti(23.7, 127.3, 1, 11)}${confetti(116.3, 127.3, -1, 29)}
      ${firework(24, 24, ['#f472b6', '#facc15'], 0)}${firework(116, 18, ['#22d3ee', '#a3e635'], 0.36)}`,
  },
};
