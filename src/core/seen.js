// Память просмотренных заданий: чтобы задания не повторялись между тренировками, режимами и днями.
// Хранит id последних SEEN_MAX заданий по порядку показа. Генераторы выбирают сначала невиденные,
// а когда в теме всё уже видено - самые давние.
//
// Не используется там, где у всех должны быть одинаковые задания: дуэль по ссылке, задание дня.

import { storage } from './storage.js';

const KEY = 'seenQ';
export const SEEN_MAX = 8000;

let order = null; // Map id → номер показа (чем больше, тем свежее)
let counter = 0;
let saveTimer = null;

function load() {
  if (order) return;
  order = new Map();
  const list = storage.get(KEY, []);
  for (const id of Array.isArray(list) ? list : []) order.set(id, ++counter);
}

function scheduleSave() {
  if (saveTimer) return;
  const save = () => {
    saveTimer = null;
    storage.set(KEY, [...order.keys()]);
  };
  saveTimer = typeof setTimeout === 'function' ? setTimeout(save, 400) : (save(), null);
}

export function wasSeen(id) {
  load();
  return order.has(id);
}

/** Насколько давно видели: -1 - не видели, иначе номер показа (меньше - давнее). */
export function seenRank(id) {
  load();
  return order.get(id) ?? -1;
}

export function markSeen(id) {
  if (id == null) return;
  load();
  order.delete(id);
  order.set(id, ++counter);
  while (order.size > SEEN_MAX) order.delete(order.keys().next().value);
  scheduleSave();
}

/** Для тестов и «сбросить прогресс». */
export function resetSeen() {
  order = new Map();
  counter = 0;
  storage.set(KEY, []);
}

/**
 * Множество «уже было» для одной сессии: видено в этой сессии или раньше (если memory).
 * Совместимо с Set по has/add/delete - генераторы работают с ним как раньше.
 */
export class UsedSet {
  constructor({ memory = true } = {}) {
    this.local = new Set();
    // Вне браузера (тесты, сборка) памяти нет: одинаковое зерно всегда даёт одинаковые задания.
    this.memory = memory && typeof globalThis.localStorage !== 'undefined';
  }
  has(id) {
    return this.local.has(id) || (this.memory && wasSeen(id));
  }
  add(id) {
    this.local.add(id);
    if (this.memory) markSeen(id);
    return this;
  }
  delete(id) {
    return this.local.delete(id);
  }
  get size() {
    return this.local.size;
  }
}

/**
 * Из списка, где всё уже видено, - кандидаты для повтора: четверть самых давних.
 * idOf(item) → id задания.
 */
export function oldestOf(items, idOf = (x) => x.id) {
  if (items.length <= 1 || typeof globalThis.localStorage === 'undefined') return items;
  const sorted = [...items].sort((a, b) => seenRank(idOf(a)) - seenRank(idOf(b)));
  return sorted.slice(0, Math.max(1, Math.ceil(items.length / 4)));
}
