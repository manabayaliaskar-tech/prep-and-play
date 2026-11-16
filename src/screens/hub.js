// Главная: приветствие, цель дня, «продолжить» и три раздела сайта —
// экзамены, олимпиадная математика, ежедневная практика.

import { COURSES, GROUPS, courseById, courseHref, courseStars, coursesIn, trackById, trackHref, trackRecord } from '../catalog/index.js';
import { dayKey } from '../core/dates.js';
import { t, tx } from '../core/i18n.js';
import { questState } from '../core/quests.js';
import { DAILY_GOAL, currentStreak, getProfile, levelInfo, todayXp } from '../core/profile.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { homeCourses, isPinned, pinButton } from '../core/pins.js';
import { reviewCardHtml } from './review.js';

export function ring(value, max) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const ratio = Math.min(1, value / max);
  return `<svg class="ring" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="${r}" class="ring-bg"/>
    <circle cx="40" cy="40" r="${r}" class="ring-fg ${ratio >= 1 ? 'full' : ''}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - ratio)}"/>
  </svg>`;
}

/** Значок курса: код страны или экзамена в цветном кружке либо эмодзи. */
export function courseBadge(course, cls = '') {
  const isText = /^[A-Za-z+#]+$/.test(course.code);
  return `<span class="code-badge ${isText ? 'is-text' : ''} ${course.code.length > 3 ? 'is-long' : ''} ${cls}" style="--c:${course.color}" aria-hidden="true">${course.code}</span>`;
}

export function courseCard(course) {
  const { stars, max } = courseStars(course);
  const meta = course.href
    ? `<span class="cc-meta">🎮 ${t('cat.game')}</span>`
    : max
      ? `<span class="cc-meta ${stars ? 'has' : ''}">★ ${stars}/${max}</span>`
      : `<span class="cc-meta">${t('cat.soonShort')}</span>`;
  return `
    <a class="course-card" href="#${courseHref(course)}" style="--c:${course.color}">
      ${courseBadge(course)}
      <span class="course-text"><b>${esc(tx(course.name))}</b><small>${esc(tx(course.full))}</small></span>
      ${meta}
    </a>`;
}

/** Плитки уровней: номер или название и звёзды за лучший результат. */
export function levelChips(course) {
  return `<div class="level-chips">${course.tracks
    .map((track) => {
      const rec = trackRecord(course, track);
      const best = rec?.best ?? 0;
      return `<a class="level-chip ${best ? 'done' : ''} ${rec?.boss ? 'has-crown' : ''}" href="#${trackHref(course, track)}" title="${esc(tx(track.name))}"><b>${esc(track.icon)}</b><span>${'★'.repeat(best)}${'☆'.repeat(3 - best)}</span></a>`;
    })
    .join('')}</div>`;
}

/** Карточка «Задания дня»: три задания с полосками прогресса и наградой. */
export function questsCard(profile = getProfile(), day = dayKey()) {
  const quests = questState(profile, day);
  const done = quests.filter((q) => q.done).length;
  return `
    <section class="quests" aria-label="${t('quest.title')}">
      <div class="quests-head">
        <span class="quests-chest ${done === quests.length ? 'is-open' : ''}" aria-hidden="true">${done === quests.length ? '🎉' : '🎁'}</span>
        <div><h2>${t('quest.title')}</h2><p class="muted small">${done === quests.length ? t('quest.allDone') : t('quest.left', { c: done, n: quests.length })}</p></div>
      </div>
      <div class="quest-list">
        ${quests
          .map(
            ({ quest, value, done: ok }) => `
          <div class="quest-card ${ok ? 'is-done' : ''}">
            <span class="quest-icon" aria-hidden="true">${ok ? '✔' : quest.icon}</span>
            <span class="quest-text"><b>${t(`quest.${quest.id}`, { n: quest.goal })}</b>
              <span class="quest-bar" aria-hidden="true"><i style="width:${Math.round((value / quest.goal) * 100)}%"></i></span>
              <small>${value}/${quest.goal}</small></span>
            <span class="quest-reward">+${quest.reward}<small>XP</small></span>
          </div>`,
          )
          .join('')}
      </div>
    </section>`;
}

/** Большая карточка квиза: кубик, рекорды и кнопки режимов. */
export function quizHero(p = getProfile(), day = dayKey()) {
  const r = p.records ?? {};
  const classic = Object.values(r.quiz ?? {});
  const dailyDone = r.quizDaily?.[day] !== undefined;
  const chip = (icon, label, value) => `<span class="qh-chip"><span aria-hidden="true">${icon}</span>${label}: <b>${value}</b></span>`;
  return `
    <section class="quiz-hero" aria-label="${t('quiz.title')}">
      <div class="qh-dice" aria-hidden="true">
        <div class="qh-cube"><span>🎲</span></div>
        ${['📐', '🌍', '⚛️', '🧬', '📜', '🔤', '💻', '🏆'].map((icon, i) => `<i style="--i:${i}">${icon}</i>`).join('')}
      </div>
      <div class="qh-body">
        <h2>${t('quiz.title')}</h2>
        <p>${t('hub.quizHero')}</p>
        <div class="qh-chips">
          ${chip('🎯', t('quiz.mode.classic'), classic.length ? `${Math.max(...classic)}/10` : '—')}
          ${chip('⚡', t('quiz.mode.blitz'), r.quizBlitz || '—')}
          ${chip('❤️', t('quiz.mode.survival'), r.quizSurvival || '—')}
        </div>
        <div class="qh-actions">
          <a class="btn btn-xl qh-play" href="#/quiz/classic">▶ ${t('hub.quizPlay')}</a>
          <a class="btn btn-soft qh-mode" href="#/quiz/blitz">⚡ ${t('quiz.mode.blitz')}</a>
          <a class="btn btn-soft qh-mode" href="#/quiz/survival">❤️ ${t('quiz.mode.survival')}</a>
          <a class="btn btn-soft qh-mode ${dailyDone ? '' : 'is-new'}" href="#/quiz/daily">📅 ${t('quiz.mode.daily')}${dailyDone ? ' ✔' : `<span class="qh-new">${t('quiz.dailyNew')}</span>`}</a>
        </div>
      </div>
    </section>`;
}

function continueCard() {
  const last = getProfile().last;
  if (!last) return '';
  if (last.course === 'sat') {
    return `<a class="continue-card" href="#/sat"><span class="cc-icon">▶</span><span class="cc-text"><small>${t('hub.continue')}</small><b>SAT</b></span><span class="cc-go">▶</span></a>`;
  }
  const course = courseById(last.course);
  const track = trackById(course, last.track);
  if (!course || !track) return '';
  return `<a class="continue-card" href="#${trackHref(course, track)}"><span class="cc-icon">▶</span><span class="cc-text"><small>${t('hub.continue')}</small><b>${esc(tx(course.name))} · ${esc(tx(track.name))}</b></span><span class="cc-go">▶</span></a>`;
}

const HOME_EXAMS = ['sat', 'ent', 'ege', 'ielts', 'toefl', 'oge'];

const isPinnedLabel = (id) => t(isPinned(id) ? 'pin.remove' : 'pin.add');

export function hubScreen(app) {
  const render = () => {
    const p = getProfile();
    const lvl = levelInfo(p.xp);
    const streak = currentStreak();
    const xpToday = todayXp();
    const name = p.name ? esc(p.name) : '';
    const group = (id) => GROUPS.find((g) => g.id === id);
    const head = (g, link, hidden = 0) => `
      <div class="block-head">
        <span class="block-icon" style="--c:${g.color}">${g.icon}</span>
        <div><h2>${esc(tx(g.name))}</h2><p class="muted">${esc(tx(g.desc))}</p></div>
        ${link ? `<a class="btn btn-soft btn-sm block-link" href="#${g.href}">${link} →${hidden ? `<span class="more-badge" title="${t('pin.more', { n: hidden })}">+${hidden}</span>` : ''}</a>` : ''}
      </div>`;
    /** Карточка курса с уровнями и звёздочкой «закрепить». */
    const levelCard = (course) => `
              <div class="daily-course" style="--c:${course.color}">
                ${pinButton(course.id, isPinnedLabel(course.id))}
                <a class="daily-course-head" href="#${courseHref(course)}">${courseBadge(course)}<span class="course-text"><b>${esc(tx(course.name))}</b><small>${esc(tx(course.full))}</small></span></a>
                ${course.tracks.length ? levelChips(course) : `<p class="muted small">${t('cat.soonShort')}</p>`}
              </div>`;
    const dailyBlock = homeCourses(coursesIn('daily'), 'daily');
    const codeBlock = homeCourses(coursesIn('code'), 'code');
    const exams = coursesIn('exams');
    const olymp = courseById('olymp');
    app.innerHTML = `
      <section class="page home hub">
        <div class="hero-card">
          <div class="hero-mascot">${mascot(xpToday >= DAILY_GOAL ? 'win' : 'happy', 'mascot-xl float')}</div>
          <div class="hero-text">
            <p class="hero-kicker">${name ? t('home.helloName', { name }) : t('home.hello')}</p>
            <h1>${t('hub.title')}</h1>
            <p class="muted">${t('hub.subtitle')}</p>
            <div class="hero-badges">
              <span class="badge">⭐ ${t('home.level', { n: lvl.level })}</span>
              <span class="badge ${streak ? 'fire' : ''}">🔥 ${t('home.streak', { n: streak })}</span>
              <span class="badge">⚡ ${p.xp} XP</span>
            </div>
          </div>
          <div class="goal">
            ${ring(xpToday, DAILY_GOAL)}
            <div class="goal-text"><b>${Math.min(xpToday, DAILY_GOAL)}/${DAILY_GOAL}</b><span>${xpToday >= DAILY_GOAL ? t('home.goalDone') : t('home.goal')}</span></div>
          </div>
        </div>

        ${quizHero(p)}

        ${continueCard() ? `<div class="continue-row single">${continueCard()}</div>` : ''}

        ${questsCard(p)}

        ${reviewCardHtml()}

        <section class="block">
          ${head(group('daily'), t('hub.open'), dailyBlock.hidden)}
          <div class="daily-grid">${dailyBlock.shown.map(levelCard).join('')}</div>
          ${dailyBlock.hidden ? `<p class="muted tiny pin-hint">☆ ${t('pin.hint')}</p>` : ''}
        </section>

        <section class="block">
          ${head(group('exams'), `${t('hub.allExams')} (${exams.length})`)}
          <div class="course-grid">${HOME_EXAMS.map((id) => courseCard(courseById(id))).join('')}</div>
        </section>

        <section class="block">
          ${head(group('olymp'), t('hub.open'))}
          <div class="daily-grid one">
            <div class="daily-course" style="--c:${olymp.color}">
              <a class="daily-course-head" href="#${courseHref(olymp)}">${courseBadge(olymp)}<span class="course-text"><b>${esc(tx(olymp.name))}</b><small>${esc(tx(olymp.full))}</small></span></a>
              ${olymp.tracks.length ? levelChips(olymp) : `<p class="muted small">${t('cat.soonShort')}</p>`}
            </div>
          </div>
        </section>

        <section class="block">
          ${head(group('code'), t('hub.open'), codeBlock.hidden)}
          <div class="daily-grid">${codeBlock.shown.map(levelCard).join('')}</div>
        </section>

        <a class="premium-card" href="#/premium">
          <span class="premium-star">💎</span>
          <span><b>${t('home.premiumTitle')}</b><small>${t('home.premiumText')}</small></span>
          <span class="daily-go">→</span>
        </a>

        <div class="about-card">
          <h2>${t('home.aboutTitle')}</h2>
          <p>${t('hub.about', { exams: exams.length, courses: COURSES.length })}</p>
          <p class="muted tiny">${t('cat.disclaimer')}</p>
        </div>
      </section>`;
  };
  render();
  return { relabel: render };
}
