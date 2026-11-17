// Доступ к каталогу: поиск курса и дорожки, ссылки, прогресс.

import { t, tx } from '../core/i18n.js';
import { getProfile } from '../core/profile.js';
import { COURSES, GROUPS } from './courses.js';

export { COURSES, GROUPS };

export const groupById = (id) => GROUPS.find((g) => g.id === id) ?? null;
export const courseById = (id) => COURSES.find((c) => c.id === id) ?? null;
export const trackById = (course, id) => course?.tracks.find((t) => t.id === id) ?? null;
export const coursesIn = (group, region = null) => COURSES.filter((c) => c.group === group && (!region || c.region === region));

export const courseHref = (course) => course.href ?? `/c/${course.id}`;
export const trackHref = (course, track) => `/c/${course.id}/${track.id}`;
export const practiceKey = (course, track) => `${course.id}:${track.id}`;

/** Подпись уровня: «Уровень 3» или код европейской шкалы (A1…C2). Для предметов экзамена — пусто. */
export function levelLabel(course, track) {
  if (!course.leveled) return '';
  if (track.kicker) return tx(track.kicker);
  return course.cefr ? track.icon : t('pr.level', { n: course.tracks.indexOf(track) + 1 });
}

/** Лучший результат по дорожке: { best: звёзды 0…3, runs, pct } или null. */
export function trackRecord(course, track) {
  return getProfile().practice[practiceKey(course, track)] ?? null;
}

/** Сколько звёзд набрано в курсе и сколько возможно. */
export function courseStars(course) {
  let stars = 0;
  for (const track of course.tracks) stars += trackRecord(course, track)?.best ?? 0;
  return { stars, max: course.tracks.length * 3 };
}

/** Раздел сайта, к которому относится адрес (для подсветки меню). */
export function groupOfPath(path) {
  // Слабые темы курса — раздел этого курса (а /weak без курса — тренировка слабых навыков SAT).
  const weak = path.match(/^\/weak\/([^/]+)/);
  if (weak) return courseById(weak[1])?.group ?? null;
  if (path === '/exams' || /^\/(sat|map|level|boss|exam|survival|blitz|weak|daily|duel|detective|mock)(\/|$)/.test(path)) return 'exams';
  if (path === '/practice') return 'daily';
  if (path === '/code') return 'code';
  const match = path.match(/^\/c\/([^/]+)/);
  return match ? (courseById(match[1])?.group ?? null) : null;
}
