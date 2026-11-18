// Ведущий квиза: Препи в смокинге и цилиндре с микрофоном и колесо фортуны с предметами.
// Колесо крутится, когда заходишь на экран, потом раз в минуту и по нажатию; лампочки бегут, пока оно крутится,
// а Препи объявляет, что выпало; облачко с предметом - кнопка, которая сразу запускает квиз по этому предмету.
// Если в системе включено «уменьшить движение» - само не крутится.

import { t } from '../core/i18n.js';
import { getOutfit } from '../core/wardrobe.js';
import { mascot } from './mascot.js';

/** Сектора колеса: предмет (ключ subj.*), иконка и цвет. */
export const WHEEL = [
  ['math', '📐', '#ef4444'],
  ['english', '🔤', '#f59e0b'],
  ['history', '📜', '#16a34a'],
  ['physics', '⚛️', '#0ea5e9'],
  ['chemistry', '⚗️', '#2563eb'],
  ['biology', '🧬', '#7c3aed'],
  ['geography', '🌍', '#db2777'],
  ['code', '💻', '#f97316'],
];
const SEG = 360 / WHEEL.length;
export const SPIN_EVERY = 60_000;
const SPIN_MS = 4200;
const CX = 110;
const CY = 108;

/** Угол поворота колеса, при котором сектор i оказывается под стрелкой (стрелка сверху). */
export function angleFor(i, from = 0, turns = 4, jitter = 0) {
  const want = (((-(i * SEG + SEG / 2) + jitter - from) % 360) + 360) % 360;
  return from + turns * 360 + want;
}

/** Какой сектор под стрелкой при данном угле поворота. */
export function sectorAt(angle) {
  const theta = (((-angle) % 360) + 360) % 360;
  return Math.floor(theta / SEG) % WHEEL.length;
}

const polar = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [Math.round((CX + r * Math.cos(a)) * 100) / 100, Math.round((CY + r * Math.sin(a)) * 100) / 100];
};

function wheelSvg() {
  const R = 86;
  const wedges = WHEEL.map(([, icon, color], i) => {
    const a0 = i * SEG;
    const a1 = a0 + SEG;
    const [x0, y0] = polar(R, a0);
    const [x1, y1] = polar(R, a1);
    const [ix, iy] = polar(R * 0.64, a0 + SEG / 2);
    return `<path d="M${CX} ${CY} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z" fill="${color}"/>
      <text x="${ix}" y="${iy}" transform="rotate(${a0 + SEG / 2} ${ix} ${iy})" text-anchor="middle" dominant-baseline="central" font-size="22">${icon}</text>`;
  }).join('');
  const lines = WHEEL.map((_, i) => {
    const [x, y] = polar(R, i * SEG);
    return `<line x1="${CX}" y1="${CY}" x2="${x}" y2="${y}"/>`;
  }).join('');
  const bulbs = Array.from({ length: 20 }, (_, i) => {
    const [x, y] = polar(96, i * 18);
    return `<circle class="bulb b${i % 2}" cx="${x}" cy="${y}" r="3.4"/>`;
  }).join('');
  return `<svg class="host-wheel" viewBox="0 0 220 250" aria-hidden="true">
    <defs>
      <linearGradient id="hwGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset=".45" stop-color="#f5b301"/><stop offset="1" stop-color="#a86b00"/></linearGradient>
      <radialGradient id="hwGloss" cx=".35" cy=".25" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient>
    </defs>
    <path class="host-stand" d="M${CX} ${CY + 20} L${CX - 34} 238 M${CX} ${CY + 20} L${CX + 34} 238" stroke="#7c2d12" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="${CX}" cy="240" rx="56" ry="7" fill="#000" opacity=".18"/>
    <circle cx="${CX}" cy="${CY}" r="103" fill="url(#hwGold)"/>
    <circle cx="${CX}" cy="${CY}" r="91" fill="#7c2d12"/>
    <g class="wheel-spin" style="transform-origin:${CX}px ${CY}px">
      ${wedges}
      <g stroke="#fff" stroke-opacity=".85" stroke-width="2.4">${lines}</g>
      <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#hwGloss)"/>
    </g>
    <g class="bulbs">${bulbs}</g>
    <circle cx="${CX}" cy="${CY}" r="21" fill="url(#hwGold)" stroke="#7c2d12" stroke-width="2"/>
    <image href="icons/coin.svg" x="${CX - 17}" y="${CY - 17}" width="34" height="34"/>
    <g class="wheel-pointer"><path d="M${CX - 13} 0 L${CX + 13} 0 L${CX} 26 Z" fill="#e11d48" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><circle cx="${CX}" cy="5" r="3.5" fill="#fff"/></g>
  </svg>`;
}

const hostPrepi = (mood = 'happy') => mascot(mood, 'host-prepi', { ...getOutfit(), head: 'host-hat', neck: 'host-suit', hand: 'host-mic', body: null, face: null, back: null, aura: null, pet: null });

/** Разметка блока ведущего. */
export function quizHostHtml(cls = '') {
  return `<div class="quiz-host ${cls}" role="button" tabindex="0" aria-label="${t('host.hint')}">
    <div class="host-glow" aria-hidden="true"></div>
    ${wheelSvg()}
    <div class="host-prepi-wrap" aria-hidden="true">${hostPrepi()}</div>
    <div class="host-bubble" aria-live="polite" hidden></div>
  </div>`;
}

// Состояние живёт между перерисовками экрана: угол колеса и время последнего вращения.
let angle = 0;
let lastSpin = 0;
let timer = null;

/** Оживляет блок ведущего в root. */
export function bindQuizHost(root) {
  const host = root.querySelector('.quiz-host');
  if (!host) return;
  clearInterval(timer);
  const wheel = host.querySelector('.wheel-spin');
  const bubble = host.querySelector('.host-bubble');
  const prepi = host.querySelector('.host-prepi-wrap');
  const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let spinning = false;
  let hideBubble = 0;
  wheel.style.transform = `rotate(${angle}deg)`;

  const say = (text, ms = 2600, html = null) => {
    clearTimeout(hideBubble);
    if (html) bubble.innerHTML = html;
    else bubble.textContent = text;
    bubble.hidden = false;
    bubble.classList.remove('is-in');
    void bubble.offsetWidth;
    bubble.classList.add('is-in');
    hideBubble = setTimeout(() => (bubble.hidden = true), ms);
  };

  function spin() {
    if (spinning || !host.isConnected) return;
    spinning = true;
    lastSpin = Date.now();
    const i = Math.floor(Math.random() * WHEEL.length);
    const jitter = (Math.random() - 0.5) * (SEG * 0.6);
    angle = angleFor(i, angle, reduced ? 1 : 4, jitter);
    host.classList.add('is-spinning');
    say(t('host.spin'), SPIN_MS);
    wheel.style.transition = reduced ? 'none' : `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.7, 0.12, 1)`;
    wheel.style.transform = `rotate(${angle}deg)`;
    setTimeout(
      () => {
        spinning = false;
        host.classList.remove('is-spinning');
        const [key, icon] = WHEEL[sectorAt(angle)];
        prepi.innerHTML = hostPrepi('win');
        say('', 9000, `<a class="host-go" href="#/quiz/subject/${key}"><span>${icon} ${t(`subj.${key}`)}!</span><small>▶ ${t('host.play')}</small></a>`);
        setTimeout(() => host.isConnected && (prepi.innerHTML = hostPrepi()), 2600);
      },
      reduced ? 50 : SPIN_MS,
    );
  }

  host.addEventListener('click', (e) => {
    // Нажатие на облачко с предметом - переход к квизу, а не новое вращение.
    if (e.target.closest?.('.host-go')) return;
    spin();
  });
  host.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      spin();
    }
  });
  if (reduced) return;
  // При входе - сразу (если давно не крутили), дальше раз в минуту, пока вкладка открыта.
  if (Date.now() - lastSpin > 20_000) setTimeout(spin, 650);
  timer = setInterval(() => {
    if (!host.isConnected) clearInterval(timer);
    else if (globalThis.document?.visibilityState !== 'hidden') spin();
  }, SPIN_EVERY);
}
