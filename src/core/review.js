// Работа над ошибками: неверно решённые задания возвращаются по расписанию, пока не будут освоены.
// Ступени: сразу → через 1 день → через 3 дня → через 7 дней → освоено (убираем из списка).
// Ошибка при повторе возвращает задание на первую ступень, повтор - завтра.

import { dayKey } from './dates.js';
import { storage } from './storage.js';

const KEY = 'mistakes';
/** Через сколько дней задание вернётся после верного ответа на ступени 0, 1, 2. */
export const INTERVALS = [1, 3, 7];
const LIMIT = 200;

export function addDays(day, n) {
  const [y, m, d] = day.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

export function getMistakes() {
  const list = storage.get(KEY, []);
  return Array.isArray(list) ? list.filter((x) => x?.q?.id) : [];
}

function save(list) {
  storage.set(KEY, list.slice(-LIMIT));
}

/** Запоминает неверно решённое задание (копию, чтобы потом показать его точно таким же). */
export function addMistake(q, today = dayKey()) {
  if (!q?.id) return;
  const list = getMistakes().filter((x) => x.q.id !== q.id);
  list.push({ q: JSON.parse(JSON.stringify(q)), stage: 0, due: today, added: today });
  save(list);
}

/** Задания, которые пора повторить сегодня. */
export function dueMistakes(today = dayKey(), limit = Infinity) {
  return getMistakes()
    .filter((x) => x.due <= today)
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.stage - b.stage))
    .slice(0, limit);
}

/** Итог повтора: верно - на следующую ступень (или освоено), неверно - снова завтра. Возвращает true, если освоено. */
export function applyReview(id, correct, today = dayKey()) {
  const list = getMistakes();
  const item = list.find((x) => x.q.id === id);
  if (!item) return false;
  let mastered = false;
  if (correct) {
    if (item.stage >= INTERVALS.length) {
      list.splice(list.indexOf(item), 1);
      mastered = true;
    } else {
      item.due = addDays(today, INTERVALS[item.stage]);
      item.stage += 1;
    }
  } else {
    item.stage = 0;
    item.due = addDays(today, 1);
  }
  save(list);
  if (mastered) storage.set('mistakesMastered', (storage.get('mistakesMastered', 0) || 0) + 1);
  return mastered;
}

export const masteredCount = () => storage.get('mistakesMastered', 0) || 0;
