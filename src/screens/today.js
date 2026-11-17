// «Что мне сегодня делать?»: карточка на главной и страница с планом дня.
// Тренировка дня собирается из ошибок к повтору, слабых тем и плана подготовки.

import { courseById, courseHref, trackHref } from '../catalog/index.js';
import { DECK_COURSE } from '../core/cards.js';
import { dayKey } from '../core/dates.js';
import { t, tx } from '../core/i18n.js';
import { addPlanProgress, planSpec } from '../core/plan.js';
import { DAILY_GOAL, getProfile, saveProfile, todayXp } from '../core/profile.js';
import { createRng, newSeed } from '../core/random.js';
import { applyReview, dueMistakes } from '../core/review.js';
import { MIX_MISTAKES, MIX_SIZE, focusCourse, todaySteps } from '../core/today.js';
import { skillName } from '../content/labels.js';
import { buildQuiz } from '../pools/quiz.js';
import { buildTopicSet } from '../pools/stream.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { courseWeakTopics, weakSpec } from './review.js';
import { baseStats, celebrate, runSession } from './play.js';

/** Что войдёт в тренировку дня: вопросы и короткое объяснение, откуда они. */
export function buildMix(profile = getProfile(), today = dayKey(), rng = createRng(newSeed())) {
  const mistakes = dueMistakes(today, MIX_MISTAKES);
  const focus = focusCourse(profile);
  const course = focus.course;
  const weak = course ? courseWeakTopics(course, profile, 3) : [];
  const parts = { mistakes: mistakes.length, weak: weak.map((w) => w.topic), course: course?.id ?? null };
  const rest = MIX_SIZE - mistakes.length;
  const questions = mistakes.map((x) => x.q);
  if (course) {
    // Слабые темы — примерно половина, остальное — план или последний уровень.
    const weakCount = weak.length ? Math.ceil(rest / 2) : 0;
    if (weakCount) questions.push(...buildTopicSet({ rng, spec: weakSpec(course, weak), count: weakCount }));
    const mainSpec = focus.plan ? planSpec(course, profile) : (focus.track ?? course.tracks[0]).spec;
    questions.push(...buildTopicSet({ rng, spec: mainSpec, count: rest - weakCount }));
  } else {
    // Новичок: квиз обо всём средней сложности.
    questions.push(...buildQuiz({ rng, level: 4, count: rest }));
  }
  return { questions, parts, mistakeIds: new Set(mistakes.map((x) => x.q.id)) };
}

/** Карточка на главной. */
export function todayCardHtml(p = getProfile()) {
  const steps = todaySteps(p, { xpToday: todayXp(), goal: DAILY_GOAL });
  const done = steps.filter((s) => s.done).length;
  const mixDone = steps[0].done;
  return `<a class="today-card ${mixDone ? 'is-done' : ''}" href="#/today">
    <span class="today-icon" aria-hidden="true">${mixDone ? '✅' : '🧭'}</span>
    <span class="today-text">
      <b>${t('today.title')}</b>
      <small>${mixDone ? t('today.doneShort', { c: done, n: steps.length }) : t('today.cardDesc', { n: MIX_SIZE })}</small>
    </span>
    <span class="today-steps" aria-hidden="true">${steps.map((s) => `<i class="${s.done ? 'is-done' : ''}">${s.icon}</i>`).join('')}</span>
  </a>`;
}

function stepHtml(s) {
  const p = s.params;
  const link = (href, label) => `<a class="btn ${s.done ? 'btn-soft' : 'btn-primary'} btn-sm" href="#${href}">${label}</a>`;
  let title = '';
  let desc = '';
  let action = '';
  switch (s.id) {
    case 'mix': {
      title = t('today.mix', { n: MIX_SIZE });
      const bits = [];
      if (p.mistakes) bits.push(t('today.fromMistakes', { n: p.mistakes }));
      if (p.course) bits.push(t('today.fromCourse', { name: tx(p.course.name) }));
      desc = bits.length ? bits.join(' · ') : t('today.fromQuiz');
      action = `<button type="button" class="btn ${s.done ? 'btn-soft' : 'btn-primary'} btn-sm today-start">${s.done ? `↻ ${t('today.again')}` : `▶ ${t('today.start')}`}</button>`;
      break;
    }
    case 'cards':
      title = t('today.cards', { n: p.n });
      desc = tx(courseById(DECK_COURSE[p.lang]).name);
      action = link(`/cards/${p.lang}`, t('today.go'));
      break;
    case 'mock': {
      const course = courseById(p.course);
      title = t('today.mock', { name: tx(course.name) });
      desc = p.never ? t('today.mockFirst') : t('today.mockWeek');
      action = link(`/mock/${p.course}`, t('today.go'));
      break;
    }
    case 'season':
      title = t('today.season', { n: p.n });
      desc = t('today.seasonDesc');
      action = link('/season', t('today.go'));
      break;
    default:
      title = s.done ? t('today.goalDone') : t('today.goal', { n: p.left });
      desc = t('today.goalDesc');
  }
  return `<li class="today-step ${s.done ? 'is-done' : ''}">
    <span class="ts-check">${s.done ? '✓' : s.icon}</span>
    <span class="ts-text"><b>${title}</b><small>${esc(desc)}</small></span>
    ${action}
  </li>`;
}

export function todayRoute(app) {
  let session = null;

  const render = () => {
    const p = getProfile();
    const steps = todaySteps(p, { xpToday: todayXp(), goal: DAILY_GOAL });
    const done = steps.filter((s) => s.done).length;
    const focus = focusCourse(p);
    const weak = focus.course ? courseWeakTopics(focus.course, p, 3) : [];
    app.innerHTML = `
      <section class="page today-page">
        <div class="today-hero">
          ${mascot(done === steps.length ? 'win' : 'happy', 'mascot-lg float')}
          <div>
            <p class="hero-kicker">${t('today.kicker')}</p>
            <h1>${t('today.title')}</h1>
            <p class="muted">${t('today.desc')}</p>
            <div class="today-progress"><span class="bar"><i style="width:${Math.round((done / steps.length) * 100)}%"></i></span><b>${done}/${steps.length}</b></div>
          </div>
        </div>
        <ol class="today-list">${steps.map(stepHtml).join('')}</ol>
        ${
          weak.length
            ? `<div class="panel today-why"><h2>${t('today.whyTitle')}</h2><p class="muted small">${t('today.why')}</p><div class="weak-card-topics">${weak
                .map((w) => `<span class="weak-topic"><span>${esc(tx(skillName(w.topic)))}</span><b>${w.pct}%</b></span>`)
                .join('')}</div></div>`
            : ''
        }
      </section>`;
    app.querySelector('.today-start')?.addEventListener('click', start);
  };

  function start() {
    const p = getProfile();
    const { questions, mistakeIds } = buildMix(p);
    const focus = focusCourse(p);
    session = runSession(app, {
      title: () => `🧭 ${t('today.mixShort')}`,
      questions,
      catalog: true,
      hints: true,
      exitTo: '/today',
      onFinish: (run) => {
        const prof = getProfile();
        for (const e of run.log) if (mistakeIds.has(e.question.id)) applyReview(e.question.id, e.correct);
        if (focus.plan) addPlanProgress(run.answered);
        prof.todayMix = dayKey();
        prof.counters.todayMixes = (prof.counters.todayMixes ?? 0) + 1;
        saveProfile();
        celebrate(run.correct >= Math.ceil(run.answered * 0.7));
        return () => ({
          mood: run.correct >= Math.ceil(run.answered * 0.7) ? 'win' : 'neutral',
          title: t('today.mixDone'),
          subtitle: t('pr.result', { c: run.correct, n: run.answered }),
          xp: run.xp,
          stats: baseStats(run),
          log: run.log,
          actions: [
            { label: `🧭 ${t('today.back')}`, href: '/today', primary: true },
            ...(focus.course ? [{ label: `← ${esc(tx(focus.course.name))}`, href: focus.track ? trackHref(focus.course, focus.track) : courseHref(focus.course) }] : []),
          ],
        });
      },
    });
  }

  render();
  return { relabel: () => (session ? session.relabel?.() : render()), cleanup: () => session?.cleanup?.() };
}
