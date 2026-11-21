// Повторение правил: правило темы, в которой ты ошибся, возвращается через 1, 3, 7 и 14 дней.
// Верно ответил на повторе - интервал растёт, после 14 дней правило считается выученным.
// Ошибся - правило вернётся завтра. Не больше 5 правил за раз и одно повторение в день,
// плитку на главной можно отложить до завтра. Никаких всплывающих окон.

import { dayKey } from './dates.js';
import { storage } from './storage.js';
import { addDays } from './review.js';

const KEY = 'rules';
/** Через сколько дней правило вернётся после верного повтора на ступени 0, 1, 2, 3. */
export const RULE_INTERVALS = [1, 3, 7, 14];
/** Сколько правил повторяем за раз. */
export const RULES_PER_DAY = 5;
const LIMIT = 120;

export function getRules() {
  const map = storage.get(KEY, {});
  return map && typeof map === 'object' && !Array.isArray(map) ? map : {};
}

/** Ошибка в задании темы с уроком: правило встанет в очередь на завтра (сегодня его и так видели). */
export function noteRuleMistake(topic, today = dayKey()) {
  if (!topic) return;
  const map = getRules();
  const item = map[topic];
  // Уже ждёт повтора на первой ступени - ничего не меняем, чтобы не отодвигать.
  if (item && item.stage === 0 && item.due <= addDays(today, 1)) return;
  map[topic] = { stage: 0, due: addDays(today, 1), wrong: (item?.wrong ?? 0) + 1 };
  const keys = Object.keys(map);
  // Старые записи убираем, чтобы список не рос бесконечно.
  if (keys.length > LIMIT) for (const k of keys.sort((a, b) => (map[a].due < map[b].due ? -1 : 1)).slice(0, keys.length - LIMIT)) delete map[k];
  storage.set(KEY, map);
}

/** Правила, которые пора повторить: сначала самые просроченные и с большим числом ошибок. */
export function dueRules(today = dayKey(), limit = RULES_PER_DAY) {
  const map = getRules();
  return Object.entries(map)
    .filter(([, x]) => x.due <= today)
    .sort(([, a], [, b]) => (a.due < b.due ? -1 : a.due > b.due ? 1 : (b.wrong ?? 0) - (a.wrong ?? 0)))
    .slice(0, limit)
    .map(([topic]) => topic);
}

/** Итог повтора правила. Возвращает день следующего повтора или null, если правило выучено. */
export function applyRule(topic, correct, today = dayKey()) {
  const map = getRules();
  const item = map[topic];
  if (!item) return null;
  let next = null;
  if (!correct) {
    item.stage = 0;
    item.due = addDays(today, 1);
    next = item.due;
  } else if (item.stage >= RULE_INTERVALS.length - 1) {
    delete map[topic];
  } else {
    item.stage += 1;
    item.due = addDays(today, RULE_INTERVALS[item.stage]);
    next = item.due;
  }
  storage.set(KEY, map);
  return next;
}

/** Отложить до завтра или отметить, что сегодня уже повторяли: плитка скроется до завтра. */
export const restRulesToday = (today = dayKey()) => storage.set('rulesRest', today);

/** Показывать ли плитку «Повторить правила» на главной: есть что повторять и сегодня ещё не отдыхаем. */
export function rulesTileCount(today = dayKey()) {
  if (storage.get('rulesRest', null) === today) return 0;
  return dueRules(today).length;
}
