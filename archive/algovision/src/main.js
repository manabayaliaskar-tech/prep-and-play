// Точка входа: подключает разделы и переключает вкладки по адресу (#sorting, #race, #path, #quiz).

import { mountSortingView } from './ui/sorting-view.js';
import { mountRaceView } from './ui/race-view.js';
import { mountPathView } from './ui/path-view.js';
import { mountQuizView } from './ui/quiz-view.js';

const MOUNTERS = {
  sorting: mountSortingView,
  race: mountRaceView,
  path: mountPathView,
  quiz: mountQuizView,
};

const views = {};
let current = null;

function viewFromHash() {
  const name = location.hash.replace('#', '');
  return name in MOUNTERS ? name : 'sorting';
}

function show(name) {
  if (current === name) return;
  if (current) views[current]?.onHide?.();
  // Раздел создаётся при первом открытии — так страница загружается быстрее.
  if (!views[name]) views[name] = MOUNTERS[name](document.getElementById(`view-${name}`));
  document.querySelectorAll('.view').forEach((section) => {
    section.hidden = section.dataset.view !== name;
  });
  document.querySelectorAll('[data-tab]').forEach((tab) => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle('is-active', active);
    if (active) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  current = name;
}

window.addEventListener('hashchange', () => show(viewFromHash()));

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target;
  if (target.closest?.('input[type="text"], select, textarea')) return;
  if (event.key === ' ' && target.closest?.('button, a')) return;
  if (target.matches?.('input[type="range"]') && event.key.startsWith('Arrow')) return;
  views[current]?.onKey?.(event);
});

show(viewFromHash());
