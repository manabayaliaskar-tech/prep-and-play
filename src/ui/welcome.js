// Приветствие при первом заходе: «К чему готовишься?». Один экран вместо длинной экскурсии:
// человек выбирает экзамен и сразу попадает в первый урок. Экскурсия по главной - потом, когда вернётся.
// Можно ничего не выбирать («Просто посмотрю») - тогда сразу короткая экскурсия.

import { courseById, coursesIn } from '../catalog/index.js';
import { LANGS, getLang, setLang, t, tx } from '../core/i18n.js';
import { WELCOME_KEY, goalHref, regionExams, setGoal, welcomeDone } from '../core/goal.js';
import { storage } from '../core/storage.js';
import { getProfile } from '../core/profile.js';
import { courseBadge } from '../screens/hub.js';
import { maybeStartTour, tourDone } from './tour.js';
import { mascot } from './mascot.js';
import { esc } from './dom.js';

/** Сколько экзаменов показываем сразу; остальные - по ссылке «Другой экзамен». */
const SHOWN = 6;

let open = false;

/** Нужно ли приветствие: первый заход, ещё ничего не решал и не проходил экскурсию. */
export function needsWelcome(profile = getProfile()) {
  return !open && !welcomeDone() && !tourDone() && !(profile.xp > 0);
}

export function openWelcome() {
  if (open) return;
  open = true;
  const prevFocus = document.activeElement;
  const root = document.createElement('div');
  root.className = 'welcome';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'welcome-title');
  document.body.append(root);
  document.body.classList.add('welcoming');

  const close = () => {
    storage.set(WELCOME_KEY, true);
    open = false;
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('welcoming');
    root.classList.add('is-leaving');
    setTimeout(() => root.remove(), 250);
    prevFocus?.focus?.();
  };
  const go = (id) => {
    const course = courseById(id);
    setGoal(id);
    close();
    location.hash = `#${goalHref(course)}`;
  };
  const browse = () => {
    close();
    maybeStartTour();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') browse();
  };
  document.addEventListener('keydown', onKey);

  const render = () => {
    const exams = coursesIn('exams');
    const ids = regionExams(exams.map((c) => c.id), undefined, null).slice(0, SHOWN);
    const lang = getLang();
    root.innerHTML = `
      <div class="welcome-card">
        <div class="welcome-langs" role="group" aria-label="Language">${LANGS.map((l) => `<button type="button" class="${l.id === lang ? 'is-on' : ''}" data-lang="${l.id}" aria-pressed="${l.id === lang}">${l.label}</button>`).join('')}</div>
        <div class="welcome-prepi" aria-hidden="true">${mascot('win', 'mascot-lg float')}</div>
        <h2 id="welcome-title">${t('welcome.title')}</h2>
        <p class="muted">${t('welcome.text')}</p>
        <div class="welcome-grid">${ids
          .map((id) => courseById(id))
          .map((c) => `<button type="button" class="welcome-exam" data-goal="${c.id}" style="--c:${c.color}">${courseBadge(c)}<span><b>${esc(tx(c.name))}</b><small>${esc(tx(c.full))}</small></span></button>`)
          .join('')}</div>
        <div class="welcome-more">
          <button type="button" class="btn btn-soft btn-sm" data-goal="math">📐 ${t('welcome.school')}</button>
          <button type="button" class="btn btn-soft btn-sm" data-goal="english">🌍 ${t('welcome.langs')}</button>
          <a class="btn btn-soft btn-sm welcome-all" href="#/exams">${t('welcome.otherExam')} →</a>
        </div>
        <button type="button" class="link-btn welcome-skip">${t('welcome.browse')}</button>
      </div>`;
    root.querySelectorAll('[data-goal]').forEach((b) => b.addEventListener('click', () => go(b.dataset.goal)));
    root.querySelector('.welcome-all').addEventListener('click', close);
    root.querySelector('.welcome-skip').addEventListener('click', browse);
    root.querySelectorAll('[data-lang]').forEach((b) =>
      b.addEventListener('click', () => {
        setLang(b.dataset.lang);
        render();
        root.querySelector(`[data-lang="${b.dataset.lang}"]`)?.focus();
      }),
    );
  };
  render();
  requestAnimationFrame(() => root.classList.add('is-in'));
  root.querySelector('.welcome-exam')?.focus({ preventScroll: true });
}
