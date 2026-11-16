// Награды: сундуки за серию дней (в них — опыт и вещи для Препи, см. wardrobe.js) и данные недельного отчёта.

import { addDays } from './review.js';
import { dayKey } from './dates.js';
import { dayRecord, getProfile } from './profile.js';
import { storage } from './storage.js';

// ---------- Сундуки за серию ----------

/** Сундуки за серию: сколько дней подряд, опыт и наряд в награду. */
export const CHESTS = [
  { days: 3, xp: 30, wear: 'scarf' },
  { days: 7, xp: 70, wear: 'glasses' },
  { days: 14, xp: 150, wear: 'headphones' },
  { days: 30, xp: 300, wear: 'crown' },
  { days: 60, xp: 600, wear: 'bow' },
  { days: 100, xp: 1000, wear: 'astro' },
];

export function openedChests() {
  const list = storage.get('chests', []);
  return Array.isArray(list) ? list : [];
}

/** Лучшая серия (сундук не сгорает, если серия потом прервалась). */
const bestStreak = (p) => Math.max(p.streak?.best ?? 0, p.streak?.count ?? 0);

/** Сундуки, которые уже можно открыть. */
export function availableChests(p = getProfile()) {
  const opened = openedChests();
  return CHESTS.filter((c) => bestStreak(p) >= c.days && !opened.includes(c.days));
}

/** Следующий закрытый сундук и сколько дней до него. */
export function nextChest(p = getProfile()) {
  const opened = openedChests();
  const next = CHESTS.find((c) => !opened.includes(c.days) && bestStreak(p) < c.days);
  return next ? { ...next, left: next.days - bestStreak(p) } : null;
}

/** Открывает сундук: отмечает и возвращает награду (опыт начисляет вызывающий). */
export function openChest(days) {
  const chest = CHESTS.find((c) => c.days === days);
  if (!chest || openedChests().includes(days)) return null;
  storage.set('chests', [...openedChests(), days]);
  return chest;
}

// ---------- Недельный отчёт ----------

/** Понедельник недели, в которую входит день. */
export function weekStart(day = dayKey()) {
  const [y, m, d] = day.split('-').map(Number);
  const wd = (new Date(y, m - 1, d).getDay() + 6) % 7;
  return addDays(day, -wd);
}

/** Итоги недели, начинающейся с monday: по дням и всего. */
export function weekSummary(monday) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const rows = days.map((d) => ({ day: d, ...(dayRecord(d) ?? { xp: 0, a: 0, c: 0 }) }));
  const total = rows.reduce((s, r) => ({ xp: s.xp + r.xp, a: s.a + r.a, c: s.c + r.c }), { xp: 0, a: 0, c: 0 });
  const active = rows.filter((r) => r.a > 0 || r.xp > 0).length;
  const best = rows.reduce((b, r) => (r.xp > b.xp ? r : b), rows[0]);
  return { monday, rows, total, active, best, accuracy: total.a ? Math.round((total.c / total.a) * 100) : 0 };
}

/** Отчёт за прошлую неделю и сравнение с позапрошлой. */
export function lastWeekReport(today = dayKey()) {
  const thisMonday = weekStart(today);
  const last = weekSummary(addDays(thisMonday, -7));
  const before = weekSummary(addDays(thisMonday, -14));
  const change = before.total.xp ? Math.round(((last.total.xp - before.total.xp) / before.total.xp) * 100) : null;
  return { last, before, change };
}

/** Показывать ли карточку отчёта на главной: прошлая неделя была активной, а отчёт ещё не открывали. */
export function reportPending(today = dayKey()) {
  const { last } = lastWeekReport(today);
  return last.total.a > 0 && storage.get('reportSeen', '') !== weekStart(today);
}

export function markReportSeen(today = dayKey()) {
  storage.set('reportSeen', weekStart(today));
}

