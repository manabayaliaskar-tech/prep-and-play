// Генератор картинок монеты Prep&Play: node tools/coin-svg.mjs
// icons/coin.svg - подробная (насечки, лавровая ветвь, объёмная надпись P&P) для крупных размеров;
// icons/coin-sm.svg - упрощённая для мелких (в тексте и в верхней панели), чтобы P&P читалось.

import { writeFileSync } from 'node:fs';

const r2 = (x) => Math.round(x * 100) / 100;
const rad = (deg) => (deg * Math.PI) / 180;
const at = (cx, cy, r, deg) => [r2(cx + r * Math.cos(rad(deg))), r2(cy + r * Math.sin(rad(deg)))];

const DEFS = `
  <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff2a8"/><stop offset=".28" stop-color="#f7c948"/><stop offset=".62" stop-color="#cf8f14"/><stop offset="1" stop-color="#7f5205"/>
  </linearGradient>
  <radialGradient id="face" cx=".36" cy=".3" r=".8">
    <stop offset="0" stop-color="#fff7c9"/><stop offset=".32" stop-color="#ffd84a"/><stop offset=".72" stop-color="#eba913"/><stop offset="1" stop-color="#b97808"/>
  </radialGradient>
  <linearGradient id="ink" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#b47a08"/><stop offset="1" stop-color="#7a4c02"/>
  </linearGradient>
  <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#9c6606"/><stop offset=".55" stop-color="#c88d12"/><stop offset="1" stop-color="#8a5904"/>
  </linearGradient>`;

/** Насечки по краю монеты. */
function reeds(cx, cy, r1, r2_, n, width, opacity) {
  const lines = Array.from({ length: n }, (_, i) => {
    const a = (360 / n) * i;
    const [x1, y1] = at(cx, cy, r1, a);
    const [x2, y2] = at(cx, cy, r2_, a);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  });
  return `<g stroke="#6d4504" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round">${lines.join('')}</g>`;
}

/** Пятиконечная звёздочка. */
function star(cx, cy, r) {
  const pts = Array.from({ length: 10 }, (_, i) => at(cx, cy, i % 2 ? r * 0.45 : r, -90 + i * 36).join(','));
  return `<polygon points="${pts.join(' ')}"/>`;
}

/**
 * Лавровая ветвь по дуге окружности: от угла from до угла to (в градусах SVG: 0 - вправо, 90 - вниз).
 * Листья парами - снаружи и внутри дуги, наклонены по направлению роста и уменьшаются к концу ветви.
 */
function branch(cx, cy, r, from, to, count) {
  const dir = Math.sign(to - from);
  const stem = (() => {
    const [x1, y1] = at(cx, cy, r, from);
    const [x2, y2] = at(cx, cy, r, to);
    return `<path d="M${x1} ${y1} A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x2} ${y2}" fill="none" stroke="url(#ink)" stroke-width="1.3" stroke-linecap="round"/>`;
  })();
  const leaves = [];
  for (let i = 0; i < count; i++) {
    const k = (i + 0.6) / count;
    const a = from + (to - from) * k;
    const size = 1 - k * 0.42;
    const tangent = a + 90 * dir;
    for (const side of [-1, 1]) {
      const [x, y] = at(cx, cy, r + side * 0.4, a);
      const rot = tangent + side * 38 * dir;
      leaves.push(
        `<path transform="translate(${x} ${y}) rotate(${r2(rot)}) scale(${r2(size)})" d="M0 0 Q4.8 -3.4 10.5 0 Q4.8 3.4 0 0Z" fill="url(#leaf)" stroke="#6a4103" stroke-width=".35"/>` +
          `<path transform="translate(${x} ${y}) rotate(${r2(rot)}) scale(${r2(size)})" d="M1 0 L9 0" stroke="#ffe7a0" stroke-opacity=".55" stroke-width=".45"/>`,
      );
    }
    if (i % 2 === 1) {
      const [bx, by] = at(cx, cy, r - 3.2, a + 4 * dir);
      leaves.push(`<circle cx="${bx}" cy="${by}" r="1.25" fill="#8a5904"/><circle cx="${r2(bx - 0.35)}" cy="${r2(by - 0.35)}" r=".45" fill="#ffe7a0" fill-opacity=".8"/>`);
    }
  }
  return stem + leaves.join('');
}

/** Объёмная надпись: тень внизу справа, блик вверху слева, основной цвет. */
function emboss(text, x, y, size, spacing) {
  const attrs = `x="${x}" y="${y}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="${size}" letter-spacing="${spacing}"`;
  return `<text ${attrs} fill="#5c3a02" fill-opacity=".55" transform="translate(.9 1.1)">${text}</text>` +
    `<text ${attrs} fill="#fffbe0" fill-opacity=".9" transform="translate(-.6 -.7)">${text}</text>` +
    `<text ${attrs} fill="url(#ink)">${text}</text>`;
}

const big = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${DEFS}</defs>
  <circle cx="50" cy="50" r="49" fill="url(#rim)"/>
  ${reeds(50, 50, 45.6, 48.4, 80, 1.1, 0.5)}
  <circle cx="50" cy="50" r="45" fill="none" stroke="#fff4bd" stroke-opacity=".85" stroke-width="1.1"/>
  <circle cx="50" cy="50" r="43.6" fill="url(#face)"/>
  <circle cx="50" cy="50" r="43.6" fill="none" stroke="#9a6405" stroke-opacity=".5" stroke-width=".9"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#8a5904" stroke-opacity=".55" stroke-width="1" stroke-dasharray=".1 2.7" stroke-linecap="round"/>
  ${branch(50, 50, 33, 104, 222, 7)}
  ${branch(50, 50, 33, 76, -42, 7)}
  <g fill="url(#ink)">${star(50, 85, 2.6)}${star(50, 15.5, 2.2)}</g>
  <path d="M36 62 H64" stroke="#8a5904" stroke-opacity=".45" stroke-width=".8" stroke-linecap="round" stroke-dasharray=".1 2.2"/>
  ${emboss('P&amp;P', 50, 57, 19.5, -0.5)}
  <path d="M14 36 A38 38 0 0 1 36 13" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/>
  <ellipse cx="37" cy="29" rx="21" ry="10" transform="rotate(-32 37 29)" fill="#fff" fill-opacity=".16"/>
</svg>
`;

const small = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs>${DEFS}</defs>
  <circle cx="16" cy="16" r="15.6" fill="url(#rim)"/>
  ${reeds(16, 16, 14.2, 15.3, 36, 0.7, 0.45)}
  <circle cx="16" cy="16" r="13.6" fill="url(#face)"/>
  <circle cx="16" cy="16" r="13.6" fill="none" stroke="#9a6405" stroke-opacity=".55" stroke-width=".6"/>
  <circle cx="16" cy="16" r="12.4" fill="none" stroke="#fff4bd" stroke-opacity=".6" stroke-width=".5"/>
  <text x="16" y="20.2" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="11.6" letter-spacing="-.7" fill="#5c3a02" fill-opacity=".45" transform="translate(.45 .55)">P&amp;P</text>
  <text x="16" y="20.2" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="11.6" letter-spacing="-.7" fill="url(#ink)">P&amp;P</text>
  <ellipse cx="11.5" cy="9" rx="7" ry="3.2" transform="rotate(-32 11.5 9)" fill="#fff" fill-opacity=".22"/>
</svg>
`;

writeFileSync(new URL('../icons/coin.svg', import.meta.url), big);
writeFileSync(new URL('../icons/coin-sm.svg', import.meta.url), small);
console.log('icons/coin.svg', big.length, 'bytes; icons/coin-sm.svg', small.length, 'bytes');
