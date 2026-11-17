// Закладки и заметки: можно сохранить любое задание, чтобы вернуться к нему позже, и записать к нему мысль.
// Хранится само задание целиком (они генерируются, по номеру их не восстановить).

import { dayKey } from './dates.js';
import { storage } from './storage.js';

export const SAVED_LIMIT = 300;
export const NOTE_LIMIT = 1000;

export function getSaved() {
  const list = storage.get('saved', []);
  return Array.isArray(list) ? list.filter((x) => x && x.id && x.q) : [];
}

const put = (list) => storage.set('saved', list.slice(0, SAVED_LIMIT));

export const isSaved = (id) => getSaved().some((x) => x.id === id);
export const savedItem = (id) => getSaved().find((x) => x.id === id) ?? null;

/** Копия задания без служебных полей сессии. */
function cleanQ(q) {
  const copy = JSON.parse(JSON.stringify(q));
  delete copy.tier;
  return copy;
}

export function addSaved(q, today = dayKey()) {
  const list = getSaved();
  if (list.some((x) => x.id === q.id)) return false;
  list.unshift({ id: q.id, q: cleanQ(q), note: '', date: today });
  put(list);
  return true;
}

export function removeSaved(id) {
  put(getSaved().filter((x) => x.id !== id));
}

/** Переключает закладку. Возвращает true, если задание теперь сохранено. */
export function toggleSaved(q, today = dayKey()) {
  if (isSaved(q.id)) {
    removeSaved(q.id);
    return false;
  }
  addSaved(q, today);
  return true;
}

/** Заметка к заданию. Если задание ещё не в закладках — сохраняет его. Пустая заметка просто стирается. */
export function setNote(q, text, today = dayKey()) {
  const note = String(text ?? '').slice(0, NOTE_LIMIT).trim();
  const list = getSaved();
  let item = list.find((x) => x.id === q.id);
  if (!item) {
    if (!note) return null;
    item = { id: q.id, q: cleanQ(q), note: '', date: today };
    list.unshift(item);
  }
  item.note = note;
  item.edited = today;
  put(list);
  return item;
}
