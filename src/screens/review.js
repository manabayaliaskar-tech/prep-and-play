// Работа над ошибками (повтор неверных заданий по расписанию) и тренировка слабых тем курса.

import { courseById, courseHref } from '../catalog/index.js';
import { dayKey } from '../core/dates.js';
import { t, tx } from '../core/i18n.js';
import { getProfile, saveProfile } from '../core/profile.js';
import { createRng, newSeed } from '../core/random.js';
import { navigate } from '../core/router.js';
import { applyReview, dueMistakes, getMistakes, masteredCount } from '../core/review.js';
import { skillName } from '../content/labels.js';
import { buildTopicSet } from '../pools/stream.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { baseStats, celebrate, runSession } from './play.js';

export const REVIEW_COUNT = 10;
const WEAK_MIN_ANSWERS = 3;
const WEAK_BELOW = 0.75;

// ---------- Слабые темы курса ----------

/** Темы курса, где точность ниже 75% (не меньше трёх ответов). Самые слабые — первыми. */
export function courseWeakTopics(course, profile = getProfile(), limit = 3) {
  const topics = [...new Set(course.tracks.flatMap((tr) => tr.spec.map(([topic]) => topic)))];
  return topics
    .filter((id) => (profile.skills[id]?.a ?? 0) >= WEAK_MIN_ANSWERS)
    .map((id) => {
      const s = profile.skills[id];
      return { topic: id, pct: Math.round((s.c / s.a) * 100), m: (s.c + 1) / (s.a + 2), a: s.a };
    })
    .filter((x) => x.pct < WEAK_BELOW * 100)
    .sort((x, y) => x.m - y.m)
    .slice(0, limit);
}

/** Набор тем для тренировки: каждая слабая тема со всеми ключами, что встречаются в уровнях курса. */
export function weakSpec(course, weak) {
  return weak.map(({ topic }) => {
    const keys = new Set();
    for (const tr of course.tracks) for (const [id, ks] of tr.spec) if (id === topic) ks.forEach((k) => keys.add(k));
    return [topic, [...keys]];
  });
}

/** Карточка на странице курса: слабые темы и кнопка тренировки. */
export function weakCardHtml(course) {
  const weak = courseWeakTopics(course);
  if (!weak.length) return '';
  return `
    <div class="weak-card">
      <div class="weak-card-head">
        <span class="weak-card-icon" aria-hidden="true">🎯</span>
        <div><b>${t('wk.title')}</b><small>${t('wk.desc')}</small></div>
      </div>
      <div class="weak-card-topics">
        ${weak.map((w) => `<span class="weak-topic"><span>${esc(tx(skillName(w.topic)))}</span><b>${w.pct}%</b></span>`).join('')}
      </div>
      <a class="btn btn-primary weak-card-go" href="#/weak/${course.id}">▶ ${t('wk.start')}</a>
    </div>`;
}

export function weakCourseRoute(app, { course: id }) {
  const course = courseById(id);
  if (!course) {
    navigate('/');
    return null;
  }
  const weak = courseWeakTopics(course);
  if (!weak.length) {
    navigate(courseHref(course));
    return null;
  }
  const before = Object.fromEntries(weak.map((w) => [w.topic, w.pct]));
  const session = runSession(app, {
    title: () => `🎯 ${t('wk.title')} · ${tx(course.name)}`,
    questions: buildTopicSet({ rng: createRng(newSeed()), spec: weakSpec(course, weak), count: REVIEW_COUNT }),
    catalog: true,
    exitTo: courseHref(course),
    onFinish: (run) => {
      saveProfile();
      celebrate(run.correct >= 7);
      const p = getProfile();
      const rows = weak
        .map((w) => {
          const s = p.skills[w.topic];
          const now = Math.round((s.c / s.a) * 100);
          const diff = now - before[w.topic];
          return `<div class="weak-item"><div class="weak-name">${esc(tx(skillName(w.topic)))}</div><div class="bar"><i style="width:${now}%"></i></div><div class="weak-pct">${now}%${diff ? ` <small class="${diff > 0 ? 'up' : 'down'}">${diff > 0 ? '▲' : '▼'}${Math.abs(diff)}</small>` : ''}</div></div>`;
        })
        .join('');
      return () => ({
        mood: run.correct >= 7 ? 'win' : 'neutral',
        title: run.correct >= 7 ? t('wk.better') : t('pr.done'),
        subtitle: t('pr.result', { c: run.correct, n: REVIEW_COUNT }),
        xp: run.xp,
        stats: baseStats(run),
        extraHtml: `<section class="quiz-breakdown"><h2>${t('wk.progress')}</h2><div class="weak-list">${rows}</div></section>`,
        log: run.log,
        actions: [
          { label: `↻ ${t('wk.again')}`, onClick: () => navigate(`/weak/${course.id}`), primary: true },
          { label: `← ${esc(tx(course.name))}`, href: courseHref(course) },
        ],
      });
    },
  });
  return session;
}

// ---------- Работа над ошибками ----------

/** Карточка на главной: сколько ошибок пора повторить. */
export function reviewCardHtml(today = dayKey()) {
  const all = getMistakes();
  if (!all.length) return '';
  const due = dueMistakes(today).length;
  return `
    <a class="review-card ${due ? 'has-due' : ''}" href="#/mistakes">
      <span class="review-card-icon" aria-hidden="true">🔁</span>
      <span class="review-card-text"><b>${t('rv.title')}</b><small>${due ? t('rv.due', { n: due }) : t('rv.none', { n: all.length })}</small></span>
      ${due ? `<span class="review-card-count">${due}</span>` : '<span class="review-card-ok">✔</span>'}
    </a>`;
}

export function mistakesRoute(app) {
  let session = null;
  const render = () => {
    const today = dayKey();
    const all = getMistakes();
    const due = dueMistakes(today);
    const stages = [0, 1, 2, 3].map((st) => all.filter((x) => x.stage === st).length);
    app.innerHTML = `
      <section class="page setup">
        <div class="setup-card">
          <div class="setup-icon">🔁</div>
          <h1>${t('rv.title')}</h1>
          <p class="muted">${t('rv.desc')}</p>
          ${
            all.length
              ? `<div class="rv-stages">
                  ${stages.map((n, st) => `<div class="rv-stage"><b>${n}</b><small>${t(`rv.stage${st}`)}</small></div>`).join('')}
                  <div class="rv-stage is-done"><b>${masteredCount()}</b><small>${t('rv.mastered')}</small></div>
                </div>
                <p class="rv-due">${due.length ? t('rv.due', { n: due.length }) : t('rv.later')}</p>`
              : `<div class="empty-note">${mascot('happy', 'mascot-sm')}<p>${t('rv.empty')}</p></div>`
          }
          ${due.length ? `<button type="button" class="btn btn-primary btn-xl start-btn">▶ ${t('rv.start', { n: Math.min(due.length, REVIEW_COUNT) })}</button>` : `<a class="btn btn-soft btn-lg" href="#/">🏠 ${t('res.home')}</a>`}
        </div>
      </section>`;
    app.querySelector('.start-btn')?.addEventListener('click', () => start(due.slice(0, REVIEW_COUNT)));
  };

  function start(items) {
    session = runSession(app, {
      title: () => `🔁 ${t('rv.title')}`,
      questions: items.map((x) => x.q),
      review: true,
      catalog: true,
      exitTo: '/mistakes',
      onFinish: (run) => {
        let mastered = 0;
        for (const e of run.log) if (applyReview(e.question.id, e.correct)) mastered += 1;
        saveProfile();
        celebrate(run.correct >= Math.ceil(run.answered * 0.7));
        return () => ({
          mood: run.correct === run.answered ? 'win' : 'neutral',
          title: run.correct === run.answered ? t('rv.allFixed') : t('rv.doneTitle'),
          subtitle: t('rv.result', { c: run.correct, n: run.answered }),
          xp: run.xp,
          stats: [...baseStats(run), { icon: '🏅', label: t('rv.mastered'), value: mastered }],
          extraHtml: `<p class="muted small quiz-daily-note">${t('rv.schedule')}</p>`,
          log: run.log,
          actions: [
            { label: `↻ ${t('rv.title')}`, onClick: () => navigate('/mistakes'), primary: true },
            { label: `🏠 ${t('res.home')}`, href: '/' },
          ],
        });
      },
    });
  }

  render();
  return { cleanup: () => session?.cleanup(), relabel: () => (session ? session.relabel() : render()) };
}

