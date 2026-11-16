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

export function startMotion(app) {
  document.addEventListener('routechange', () => playRouteIn(app));
  if (reduced() || !globalThis.matchMedia?.('(pointer: fine)').matches) return;

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
