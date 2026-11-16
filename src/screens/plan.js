// Экран «План подготовки»: выбор экзамена и даты, готовность, норма на сегодня, тренировка дня.

import { courseById, courseHref } from '../catalog/index.js';
import { dayKey } from '../core/dates.js';
import { t, tx } from '../core/i18n.js';
import { saveProfile, syncAchievements } from '../core/profile.js';
import { PLAN_SESSION, addPlanProgress, clearPlan, dailyTarget, daysLeft, getPlan, planExams, planSpec, planToday, readiness, setPlan, trackScores } from '../core/plan.js';
import { addDays } from '../core/review.js';
import { createRng, newSeed } from '../core/random.js';
import { navigate } from '../core/router.js';
import { buildTopicSet } from '../pools/stream.js';
import { esc } from '../ui/dom.js';
import { courseBadge, ring } from './hub.js';
import { baseStats, celebrate, runSession } from './play.js';

/** Карточка плана на главной: либо прогресс плана, либо приглашение его составить. */
export function planCardHtml(today = dayKey()) {
  const plan = getPlan();
  if (!plan) {
    return `
      <a class="plan-card is-empty" href="#/plan">
        <span class="plan-card-icon" aria-hidden="true">🗓️</span>
        <span class="plan-card-text"><b>${t('plan.cta')}</b><small>${t('plan.ctaDesc')}</small></span>
        <span class="daily-go">→</span>
      </a>`;
  }
  const course = courseById(plan.course);
  const days = daysLeft(plan, today);
  const target = dailyTarget(days);
  const done = planToday(today);
  const ready = readiness(course);
  return `
    <a class="plan-card" href="#/plan" style="--c:${course.color}">
      <span class="plan-ring">${ring(ready, 100)}<b>${ready}%</b></span>
      <span class="plan-card-text">
        <b>${esc(tx(course.name))} · ${days ? t('plan.daysLeft', { n: days }) : t('plan.examDay')}</b>
        <small>${t('plan.ready', { n: ready })} · ${t('plan.todayShort', { c: Math.min(done, target), n: target })}</small>
        <span class="plan-bar" aria-hidden="true"><i style="width:${Math.min(100, Math.round((done / target) * 100))}%"></i></span>
      </span>
      <span class="plan-card-go ${done >= target ? 'is-done' : ''}">${done >= target ? '✔' : '▶'}</span>
    </a>`;
}

export function planRoute(app) {
  let session = null;
  let editing = false;

  function startToday(course) {
    if (course.id === 'sat') {
      navigate('/weak');
      return;
    }
    session = runSession(app, {
      title: () => `🗓️ ${t('plan.title')} · ${tx(course.name)}`,
      questions: buildTopicSet({ rng: createRng(newSeed()), spec: planSpec(course), count: PLAN_SESSION }),
      catalog: true,
      exitTo: '/plan',
      onFinish: (run) => {
        addPlanProgress(run.answered);
        saveProfile();
        const plan = getPlan();
        const target = dailyTarget(daysLeft(plan));
        const done = planToday();
        celebrate(done >= target);
        return () => ({
          mood: done >= target ? 'win' : 'neutral',
          title: done >= target ? t('plan.dayDone') : t('pr.done'),
          subtitle: t('plan.todayShort', { c: Math.min(done, target), n: target }),
          xp: run.xp,
          stats: [...baseStats(run), { icon: '📈', label: t('plan.readyLabel'), value: `${readiness(course)}%` }],
          log: run.log,
          actions: [
            ...(done < target ? [{ label: `▶ ${t('plan.more')}`, onClick: () => navigate('/plan'), primary: true }] : []),
            { label: `🗓️ ${t('plan.title')}`, href: '/plan', primary: done >= target },
            { label: `🏠 ${t('res.home')}`, href: '/' },
          ],
        });
      },
    });
  }

  function renderSetup(plan) {
    const exams = planExams();
    const chosen = plan?.course ?? 'ent';
    const date = plan?.date ?? addDays(dayKey(), 60);
    app.innerHTML = `
      <section class="page setup">
        <div class="setup-card wide plan-setup">
          <div class="setup-icon">🗓️</div>
          <h1>${t('plan.title')}</h1>
          <p class="muted">${t('plan.desc')}</p>
          <h2 class="section-title">${t('plan.pickExam')}</h2>
          <div class="plan-exams" role="radiogroup">
            ${exams
              .map(
                (c) => `<button type="button" role="radio" class="plan-exam" data-exam="${c.id}" aria-checked="${c.id === chosen}" style="--c:${c.color}">
                  ${courseBadge(c)}<span>${esc(tx(c.name))}</span></button>`,
              )
              .join('')}
          </div>
          <label class="plan-date"><span>${t('plan.pickDate')}</span><input type="date" min="${addDays(dayKey(), 1)}" value="${date}"></label>
          <button type="button" class="btn btn-primary btn-xl plan-submit">✔ ${t('plan.save')}</button>
          ${plan ? `<button type="button" class="btn btn-soft plan-cancel">${t('plan.cancel')}</button>` : ''}
        </div>
      </section>`;
    let exam = chosen;
    app.querySelectorAll('[data-exam]').forEach((b) =>
      b.addEventListener('click', () => {
        exam = b.dataset.exam;
        app.querySelectorAll('[data-exam]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      }),
    );
    app.querySelector('.plan-submit').addEventListener('click', () => {
      const value = app.querySelector('.plan-date input').value;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value <= dayKey()) {
        app.querySelector('.plan-date').classList.add('is-error');
        return;
      }
      setPlan(exam, value);
      syncAchievements();
      editing = false;
      render();
    });
    app.querySelector('.plan-cancel')?.addEventListener('click', () => {
      editing = false;
      render();
    });
  }

  function render() {
    const plan = getPlan();
    if (!plan || editing) {
      renderSetup(plan);
      return;
    }
    const course = courseById(plan.course);
    const days = daysLeft(plan);
    const target = dailyTarget(days);
    const done = planToday();
    const ready = readiness(course);
    const scores = course.id === 'sat' ? [] : trackScores(course).sort((a, b) => a.score - b.score);
    app.innerHTML = `
      <section class="page plan-page">
        <div class="plan-hero" style="--c:${course.color}">
          <div class="plan-big-ring">${ring(ready, 100)}<div><b>${ready}%</b><small>${t('plan.readyLabel')}</small></div></div>
          <div class="plan-hero-text">
            <p class="hero-kicker">${t('plan.title')}</p>
            <h1>${esc(tx(course.name))}</h1>
            <p class="muted">${days ? t('plan.until', { n: days, date: plan.date.split('-').reverse().join('.') }) : t('plan.examDay')}</p>
            <div class="plan-today">
              <span>${t('plan.todayShort', { c: Math.min(done, target), n: target })}</span>
              <span class="plan-bar"><i style="width:${Math.min(100, Math.round((done / target) * 100))}%"></i></span>
            </div>
            <button type="button" class="btn btn-primary btn-xl plan-go">${done >= target ? `✔ ${t('plan.extra')}` : `▶ ${t('plan.start', { n: PLAN_SESSION })}`}</button>
          </div>
        </div>
        ${
          scores.length
            ? `<div class="panel">
                <h2>${t('plan.subjects')}</h2>
                <p class="muted small">${t('plan.subjectsHint')}</p>
                <div class="weak-list">
                  ${scores
                    .map(
                      (s, i) => `<a class="weak-item plan-subject ${i < 2 ? 'is-focus' : ''}" href="#/c/${course.id}/${s.track.id}">
                        <div class="weak-name">${i < 2 ? '🎯 ' : ''}${esc(tx(s.track.name))}</div>
                        <div class="bar"><i style="width:${Math.round(s.score * 100)}%"></i></div>
                        <div class="weak-pct">${Math.round(s.score * 100)}%</div>
                      </a>`,
                    )
                    .join('')}
                </div>
              </div>`
            : `<div class="panel"><p class="muted">${t('plan.satHint')}</p><a class="btn btn-soft" href="#/sat">SAT →</a></div>`
        }
        <div class="plan-tools">
          <a class="btn btn-soft" href="#${courseHref(course)}">📚 ${t('plan.openExam')}</a>
          <button type="button" class="btn btn-soft plan-edit">✏️ ${t('plan.edit')}</button>
          <button type="button" class="btn btn-soft plan-delete">🗑 ${t('plan.delete')}</button>
        </div>
      </section>`;
    app.querySelector('.plan-go').addEventListener('click', () => startToday(course));
    app.querySelector('.plan-edit').addEventListener('click', () => {
      editing = true;
      render();
    });
    app.querySelector('.plan-delete').addEventListener('click', () => {
      clearPlan();
      render();
    });
  }

  render();
  return { cleanup: () => session?.cleanup(), relabel: () => (session ? session.relabel() : render()) };
}
