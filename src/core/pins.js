// Закреплённые курсы: на главной в блоке показываются 4 курса, сначала закреплённые пользователем,
// затем те, где он занимался недавно, затем - по порядку каталога.

import { storage } from './storage.js';
import { getProfile } from './profile.js';

export const HOME_LIMIT = 4;
/** Что показываем, если пользователь ничего не закрепил и ещё нигде не занимался. */
const DEFAULTS = { daily: ['math', 'english', 'physics', 'chemistry'], code: ['python'] };

export function getPins() {
  const pins = storage.get('pins', []);
  return Array.isArray(pins) ? pins.filter((x) => typeof x === 'string') : [];
}

export const isPinned = (id) => getPins().includes(id);

export function togglePin(id) {
  const pins = getPins();
  const next = pins.includes(id) ? pins.filter((x) => x !== id) : [...pins, id];
  storage.set('pins', next);
  return next.includes(id);
}

/** Дата последнего занятия по каждому курсу из профиля. */
function lastActivity(profile) {
  const last = {};
  for (const [key, rec] of Object.entries(profile.practice ?? {})) {
    const course = key.split(':')[0];
    if (rec?.last && (!last[course] || rec.last > last[course])) last[course] = rec.last;
  }
  return last;
}

/**
 * Порядок курсов блока на главной: закреплённые, недавние, курсы по умолчанию, остальные.
 * Возвращает { shown: первые HOME_LIMIT, hidden: сколько ещё осталось }.
 */
export function homeCourses(courses, group, { pins = getPins(), profile = getProfile(), limit = HOME_LIMIT } = {}) {
  const ids = courses.map((c) => c.id);
  const last = lastActivity(profile);
  const recent = ids.filter((id) => last[id]).sort((a, b) => (last[b] > last[a] ? 1 : last[b] < last[a] ? -1 : 0));
  const order = [...pins.filter((id) => ids.includes(id)), ...recent, ...(DEFAULTS[group] ?? []), ...ids];
  const unique = [...new Set(order)];
  const byId = new Map(courses.map((c) => [c.id, c]));
  const shown = unique.slice(0, limit).map((id) => byId.get(id));
  return { shown, hidden: Math.max(0, courses.length - shown.length) };
}

/** Кнопка-звёздочка «закрепить на главной». */
export function pinButton(id, label) {
  const on = isPinned(id);
  return `<button type="button" class="pin-btn ${on ? 'is-on' : ''}" data-pin="${id}" aria-pressed="${on}" title="${label}" aria-label="${label}">${on ? '★' : '☆'}</button>`;
}

/** Один обработчик на весь документ: нажатие на звёздочку закрепляет курс и перерисовывает экран. */
export function bindPins(onChange) {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest?.('[data-pin]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    togglePin(btn.dataset.pin);
    onChange?.();
  });
}
