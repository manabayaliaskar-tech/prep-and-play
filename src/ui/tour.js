// Экскурсия по главной: Препи перелетает от раздела к разделу, подсвечивает его и рассказывает, что там.
// Короткая - 7 шагов: только главное, остальное человек найдёт сам.
// Включается сама при первом заходе на главную; пройти заново можно из профиля.
// Если раздела на странице нет (например, нет плана), шаг пропускается.

import { t } from '../core/i18n.js';
import { storage } from '../core/storage.js';
import { mascot } from './mascot.js';

/** Шаги: селектор раздела (null - по центру экрана) и ключ текста tour.<id>.title / .text. */
export const TOUR_STEPS = [
  { id: 'hello', sel: null, mood: 'win' },
  { id: 'stats', sel: '.top-stats' },
  { id: 'hero', sel: '.hero-card' },
  { id: 'quests', sel: '.today-strip' },
  { id: 'courses', sel: '.hub .block' },
  { id: 'nav', sel: '.nav' },
  { id: 'bye', sel: null, mood: 'win' },
];

const DONE_KEY = 'tourDone';
export const tourDone = () => storage.get(DONE_KEY, false) === true;

let active = null;
let autoTried = false;

/** Показать экскурсию при первом заходе (один раз за загрузку страницы). */
export function maybeStartTour() {
  if (autoTried || tourDone() || active) return;
  autoTried = true;
  setTimeout(() => {
    if (tourDone() || !document.querySelector('.hub') || document.body.classList.contains('in-session')) return;
    startTour();
  }, 1100);
}

export function startTour() {
  if (active) return;
  const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const steps = TOUR_STEPS.filter((s) => !s.sel || document.querySelector(s.sel));
  let i = 0;
  let frame = 0;
  const prevFocus = document.activeElement;

  const root = document.createElement('div');
  root.className = 'tour';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', t('tour.label'));
  root.innerHTML = `
    <div class="tour-hole is-center"></div>
    <div class="tour-guide">
      <div class="tour-prepi" aria-hidden="true"></div>
      <div class="tour-card">
        <div class="tour-step"></div>
        <h2 class="tour-title"></h2>
        <p class="tour-text"></p>
        <div class="tour-dots" aria-hidden="true">${steps.map(() => '<i></i>').join('')}</div>
        <div class="tour-actions">
          <button type="button" class="link-btn tour-skip">${t('tour.skip')}</button>
          <span class="tour-spacer"></span>
          <button type="button" class="btn btn-soft btn-sm tour-prev">←</button>
          <button type="button" class="btn btn-primary btn-sm tour-next"></button>
        </div>
      </div>
    </div>`;
  document.body.append(root);
  document.body.classList.add('touring');
  const hole = root.querySelector('.tour-hole');
  const guide = root.querySelector('.tour-guide');
  const prepi = root.querySelector('.tour-prepi');
  active = root;

  function place() {
    const step = steps[i];
    const vw = innerWidth;
    const vh = innerHeight;
    const target = step.sel ? document.querySelector(step.sel) : null;
    const gw = guide.offsetWidth;
    const gh = guide.offsetHeight;
    if (!target) {
      hole.classList.add('is-center');
      hole.style.cssText = `left:${vw / 2}px;top:${vh / 2}px;width:0;height:0`;
      guide.style.left = `${Math.max(12, (vw - gw) / 2)}px`;
      guide.style.top = `${Math.max(12, (vh - gh) / 2)}px`;
      return;
    }
    hole.classList.remove('is-center');
    const r = target.getBoundingClientRect();
    const pad = 8;
    const top = Math.max(4, r.top - pad);
    const bottom = Math.min(vh - 4, r.bottom + pad);
    hole.style.cssText = `left:${r.left - pad}px;top:${top}px;width:${r.width + pad * 2}px;height:${Math.max(0, bottom - top)}px`;
    // Облачко - под разделом, если там есть место, иначе над ним; если не влезает ни туда ни сюда - по центру внизу.
    let gy = bottom + 14;
    if (gy + gh > vh - 8) gy = top - gh - 14;
    if (gy < 8) gy = Math.max(8, vh - gh - 12);
    const gx = Math.min(Math.max(12, r.left + Math.min(24, r.width / 8)), vw - gw - 12);
    guide.style.left = `${gx}px`;
    guide.style.top = `${gy}px`;
  }

  function fly() {
    if (reduced) return;
    prepi.classList.remove('is-flying');
    void prepi.offsetWidth;
    prepi.classList.add('is-flying');
  }

  function show(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    const step = steps[i];
    prepi.innerHTML = mascot(step.mood ?? (i % 3 === 2 ? 'wow' : 'happy'), 'mascot-tour');
    root.querySelector('.tour-step').textContent = t('tour.step', { i: i + 1, n: steps.length });
    root.querySelector('.tour-title').textContent = t(`tour.${step.id}.title`);
    root.querySelector('.tour-text').textContent = t(`tour.${step.id}.text`);
    root.querySelectorAll('.tour-dots i').forEach((d, k) => d.classList.toggle('on', k === i));
    root.querySelector('.tour-prev').hidden = i === 0;
    root.querySelector('.tour-next').textContent = i === steps.length - 1 ? t('tour.finish') : i === 0 ? t('tour.start') : `${t('tour.next')} →`;
    const target = step.sel ? document.querySelector(step.sel) : null;
    fly();
    if (target) {
      const r = target.getBoundingClientRect();
      const fits = r.top >= 70 && r.bottom <= innerHeight - 200;
      if (!fits && getComputedStyle(target).position !== 'fixed' && !target.closest('.topbar')) {
        target.scrollIntoView({ block: r.height > innerHeight * 0.5 ? 'start' : 'center', behavior: reduced ? 'auto' : 'smooth' });
      }
    }
    // Пока страница докручивается, облачко летит следом.
    const until = performance.now() + 700;
    const follow = () => {
      place();
      if (performance.now() < until) frame = requestAnimationFrame(follow);
    };
    cancelAnimationFrame(frame);
    follow();
    root.querySelector('.tour-next').focus({ preventScroll: true });
  }

  function close() {
    cancelAnimationFrame(frame);
    storage.set(DONE_KEY, true);
    document.removeEventListener('keydown', onKey, true);
    removeEventListener('resize', place);
    removeEventListener('scroll', place, true);
    removeEventListener('hashchange', close);
    root.classList.add('is-leaving');
    document.body.classList.remove('touring');
    setTimeout(() => root.remove(), reduced ? 0 : 350);
    active = null;
    prevFocus?.focus?.({ preventScroll: true });
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(i + 1);
    else if (e.key === 'ArrowLeft') show(i - 1);
    else return;
    e.preventDefault();
    e.stopPropagation();
  }

  root.querySelector('.tour-next').addEventListener('click', () => (i === steps.length - 1 ? close() : show(i + 1)));
  root.querySelector('.tour-prev').addEventListener('click', () => show(i - 1));
  root.querySelector('.tour-skip').addEventListener('click', close);
  document.addEventListener('keydown', onKey, true);
  addEventListener('resize', place);
  addEventListener('scroll', place, true);
  // Ушли с главной (например, кнопкой «назад») - экскурсия закрывается.
  addEventListener('hashchange', close);
  requestAnimationFrame(() => {
    root.classList.add('is-in');
    show(0);
  });
}
