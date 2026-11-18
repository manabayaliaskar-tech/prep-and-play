// Движение интерфейса: появление экрана при переходе, объёмный наклон карточек под курсором,
// взгляд Препи за курсором. Всё отключается, если в системе включено «уменьшить движение».

const TILT = '.course-card, .track-card, .daily-course, .quiz-card, .premium-card, .option-card, .path-node, .quest-card, .plan, .mode-card';
const MAX_TILT = 7;

const reduced = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Перезапускает анимацию появления экрана. */
export function playRouteIn(app) {
  if (reduced()) return;
  app.classList.remove('route-in');
  void app.offsetWidth;
  app.classList.add('route-in');
}

/** Блоки, которые плавно появляются, когда до них докрутили. */
const REVEAL = '.panel, .know-group, .saved-list, .plan-weeks-panel, .explain-grid, .full-review, .course-grid, .track-grid, .result-stats, .diag-report, .tier-trail, .learn-row, .course-tools';
/** Числа, которые «набегают» от нуля: опыт, итоговые баллы, проценты. */
const COUNT = '.xp-earned, .result-stat b, .band-badge b, .plan-big-ring b, .know-hero .plan-big-ring b';

/** Анимация числа от 0 до значения. Дроби, «9/20» и тексты без чисел не трогаем. */
export function countUp(el, duration = 900) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const text = el.textContent.trim();
  if (text.includes('/')) return;
  const m = text.match(/^([+−-]?)(\d+(?:[.,]\d+)?)(.*)$/);
  if (!m) return;
  const [, sign, num, rest] = m;
  const target = Number(num.replace(',', '.'));
  if (!Number.isFinite(target) || target === 0) return;
  const decimals = (num.split(/[.,]/)[1] ?? '').length;
  const sep = num.includes(',') ? ',' : '.';
  const t0 = performance.now();
  const tick = (now) => {
    const k = Math.min(1, (now - t0) / duration);
    const e = 1 - (1 - k) ** 3;
    const v = (target * e).toFixed(decimals).replace('.', sep);
    el.textContent = `${sign}${v}${rest}`;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Следит за новыми экранами: появление при прокрутке и «набегающие» числа. */
function startReveal(app) {
  if (!('IntersectionObserver' in globalThis)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('rv-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  let pending = 0;
  const scan = () => {
    pending = 0;
    const fold = innerHeight * 0.92;
    let n = 0;
    for (const el of app.querySelectorAll(REVEAL)) {
      if (el.dataset.rv || el.closest('.session')) continue;
      el.dataset.rv = '1';
      // То, что видно сразу, не прячем - иначе экран мигнёт.
      if (el.getBoundingClientRect().top < fold) continue;
      el.classList.add('rv');
      el.style.setProperty('--rv', String(n++ % 4));
      io.observe(el);
    }
    for (const el of app.querySelectorAll(COUNT)) countUp(el);
  };
  new MutationObserver(() => {
    if (!pending) pending = requestAnimationFrame(scan);
  }).observe(app, { childList: true, subtree: true });
  scan();
}

export function startMotion(app) {
  document.addEventListener('routechange', () => playRouteIn(app));
  if (reduced()) return;
  startReveal(app);
  if (!globalThis.matchMedia?.('(pointer: fine)').matches) return;

  let frame = 0;
  let last = null;
  let tilted = null;
  const root = document.documentElement;

  const reset = (el) => {
    el.style.removeProperty('--rx');
    el.style.removeProperty('--ry');
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
    el.classList.remove('is-tilting');
  };

  const update = () => {
    frame = 0;
    const e = last;
    // Взгляд Препи: −1…1 по каждой оси.
    root.style.setProperty('--lx', ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
    root.style.setProperty('--ly', ((e.clientY / innerHeight) * 2 - 1).toFixed(3));

    const card = e.target.closest?.(TILT);
    if (tilted && tilted !== card) reset(tilted);
    tilted = card;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.classList.add('is-tilting');
    card.style.setProperty('--ry', `${((x - 0.5) * MAX_TILT * 2).toFixed(2)}deg`);
    card.style.setProperty('--rx', `${((0.5 - y) * MAX_TILT * 2).toFixed(2)}deg`);
    card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  };

  document.addEventListener(
    'pointermove',
    (e) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(update);
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => tilted && reset(tilted));
  document.addEventListener('routechange', () => {
    tilted = null;
  });
}
