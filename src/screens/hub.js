// Главная: приветствие, цель дня, «продолжить» и три раздела сайта -
// экзамены, олимпиадная математика, ежедневная практика.

import { EXPLAINERS } from '../content/explainers.js';
import { countryOf, flagSvg } from '../catalog/countries.js';
import { dueMistakes, getMistakes } from '../core/review.js';
import { restRulesToday, rulesTileCount } from '../core/rules.js';
import { storage } from '../core/storage.js';
import { getPlan, readiness } from '../core/plan.js';
import { maybeStartTour, tourDone } from '../ui/tour.js';
import { getGoal, goalHref, regionExams, welcomeDone } from '../core/goal.js';
import { bindQuizHost, quizHostHtml } from '../ui/quiz-host.js';
import { COURSES, GROUPS, courseById, courseHref, courseStars, coursesIn, trackById, trackHref, trackRecord } from '../catalog/index.js';
import { dayKey, msUntilMidnight } from '../core/dates.js';
import { canInstall, dismissInstall, install, installDismissed } from '../core/pwa.js';
import { openModal } from '../ui/overlay.js';
import { t, tx } from '../core/i18n.js';
import { questState } from '../core/quests.js';
import { DAILY_GOAL, currentStreak, getProfile, levelInfo, todayXp } from '../core/profile.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { homeCourses, isPinned, pinButton } from '../core/pins.js';
import { openChestModal, rewardCardsHtml } from './report.js';
import { openWardrobe } from '../ui/wardrobe-ui.js';
import { bindPoke } from '../ui/prepi-poke.js';
import { flameSvg } from '../core/economy.js';
import { seasonCardHtml } from './season.js';
import { getSaved } from '../core/saved.js';
import { bindLife, giftCardHtml, moodOf, rescueCardHtml } from './prepi-life.js';
import { dailyDeals } from '../core/shop.js';
import { goodThumb } from '../ui/goods-ui.js';
import { coinHtml } from '../ui/coin.js';

/** Ряд инструментов учёбы: анимации тем, аудирование, сохранённое (на странице «Практика»). */
export function learnRowHtml() {
  const saved = getSaved().length;
  const card = (href, icon, title, desc, cls = '') => `<a class="learn-card ${cls}" href="#${href}"><span class="learn-icon" aria-hidden="true">${icon}</span><span><b>${title}</b><small>${desc}</small></span></a>`;
  return `<div class="learn-row">
    ${card('/explain', '🎬', t('explain.title'), t('hub.explainDesc', { n: EXPLAINERS.length }), 'lc-explain')}
    ${card('/c/ielts/listening', '🎧', t('hub.listen'), t('hub.listenDesc'), 'lc-listen')}
    ${card('/saved', '🔖', t('saved.title'), saved ? t('hub.savedN', { n: saved }) : t('hub.savedDesc'), 'lc-saved')}
    ${card('/sheets', '📄', t('sheet.indexTitle'), t('sheet.short'), 'lc-sheets')}
  </div>`;
}

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
  // Экзамены - с флагом страны во весь значок и коротким кодом поверх.
  const country = course.group === 'exams' ? countryOf(course.id) : null;
  if (country) return `<span class="code-badge flag-badge ${course.code.length > 4 ? 'is-long' : ''} ${cls}" style="--c:${course.color}" aria-hidden="true">${flagSvg(country)}<b class="flag-code">${course.code}</b></span>`;
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
export function levelChips(course, { limit = 0, cls = '', named = false } = {}) {
  // Равные ряды без «хвоста»: столько колонок, чтобы последний ряд не был почти пустым.
  // limit - показать только первые уровни, а остальные спрятать за плашкой «+N →» (ведёт на страницу курса).
  // named - с коротким названием уровня (для компьютера): не больше 3 рядов.
  const all = course.tracks;
  const shown = limit && all.length > limit ? all.slice(0, limit) : all;
  const rest = all.length - shown.length;
  const n = shown.length + (rest ? 1 : 0);
  const rows = n <= 3 ? 1 : n <= 8 ? 2 : 3;
  const cols = named ? Math.ceil(n / rows) : Math.ceil(n / Math.ceil(n / 7));
  return `<div class="level-chips ${named ? 'is-named' : ''} ${cls}" style="--cols:${cols}">${shown
    .map((track) => {
      const rec = trackRecord(course, track);
      const best = rec?.best ?? 0;
      const stars = `<span class="lc-stars">${'★'.repeat(best)}${'☆'.repeat(3 - best)}</span>`;
      return `<a class="level-chip ${best ? 'done' : ''} ${rec?.boss ? 'has-crown' : ''}" href="#${trackHref(course, track)}" title="${esc(tx(track.name))}"><b>${esc(track.icon)}</b>${named ? `<span class="lc-name">${esc(tx(track.name))}</span>` : ''}${stars}</a>`;
    })
    .join('')}${rest ? `<a class="level-chip level-more" href="#${courseHref(course)}" aria-label="${t('cat.allLevels', { n: all.length })}"><b>+${rest}</b>${named ? `<span class="lc-name">${t('cat.allLevels', { n: all.length })}</span>` : ''}<span class="lc-stars">→</span></a>` : ''}</div>`;
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

/** Большая карточка квиза: Препи-ведущий с колесом фортуны, рекорды и кнопки режимов. */
export function quizHero(p = getProfile(), day = dayKey()) {
  const r = p.records ?? {};
  const classic = Object.values(r.quiz ?? {});
  const dailyDone = r.quizDaily?.[day] !== undefined;
  const chip = (icon, label, value) => `<span class="qh-chip"><span aria-hidden="true">${icon}</span>${label}: <b>${value}</b></span>`;
  return `
    <section class="quiz-hero" aria-label="${t('quiz.title')}">
      <div class="qh-bg" aria-hidden="true"></div>
      ${quizHostHtml('in-hero')}
      <div class="qh-body">
        <h2>${t('quiz.title')}</h2>
        <p>${t('hub.quizHero')}</p>
        <div class="qh-chips">
          ${chip('🎯', t('quiz.mode.classic'), classic.length ? `${Math.max(...classic)}/10` : '-')}
          ${chip('⚡', t('quiz.mode.blitz'), r.quizBlitz || '-')}
          ${chip('❤️', t('quiz.mode.survival'), r.quizSurvival || '-')}
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

/** Баннер «серия сгорит»: серия есть, а сегодня ещё ни одного очка опыта. */
export function streakRiskHtml(streak, xpToday) {
  if (!streak || xpToday > 0) return '';
  const hours = Math.max(1, Math.ceil(msUntilMidnight() / 3600000));
  return `<a class="hero-risk-pill" href="#/quiz/daily">${flameSvg(streak)} ${t('risk.pill', { n: streak, h: hours })}<span class="risk-tail">${t('risk.pillTail')}</span> →</a>`;
}

/** Большая кнопка магазина рядом с Препи: товары дня и монеты. */
function heroShopHtml(p) {
  const deals = dailyDeals(dayKey());
  return `<a class="hero-shop" href="#/shop">
    <span class="hero-shop-top"><span class="hero-shop-bag" aria-hidden="true">🛍️</span><b>${t('shop.title')}</b></span>
    <span class="hero-shop-deals">${deals.slice(0, 3).map((d) => `<span class="mini-deal">${goodThumb(d.id)}<i>−${d.discount}%</i></span>`).join('')}</span>
    <span class="hero-shop-coins">${coinHtml()} ${p.coins ?? 0}</span>
  </a>`;
}

/** Установка: окно браузера или инструкция для iPhone и iPad. */
export async function startInstall() {
  const result = await install();
  if (result === 'ios') {
    openModal({
      title: `📲 ${t('pwa.title')}`,
      body: `<ol class="ios-steps"><li>${t('pwa.ios1')}</li><li>${t('pwa.ios2')}</li><li>${t('pwa.ios3')}</li></ol>`,
    });
  }
}

/**
 * «На сегодня» - одна строка компактных плиток вместо четырёх карточек: продолжить, план дня, ошибки, план экзамена.
 * Лишние плитки прячутся сами (нет ошибок - нет плитки; план составлен - показывается готовность).
 */
function todayStripHtml(p) {
  const tiles = [];
  const last = p.last;
  if (last) {
    let href = '#/sat';
    let name = 'SAT';
    if (last.course !== 'sat') {
      const course = courseById(last.course);
      const track = course ? trackById(course, last.track) : null;
      if (course && track) {
        href = `#${trackHref(course, track)}`;
        name = `${tx(course.name)} · ${tx(track.name)}`;
      } else href = '';
    }
    if (href) tiles.push(`<a class="ts-tile ts-continue" href="${href}"><span class="ts-icon">▶</span><span class="ts-text"><small>${t('hub.continue')}</small><b>${esc(name)}</b></span></a>`);
  } else if (courseById(getGoal())) {
    // Ещё не занимался, но выбрал цель - первая плитка ведёт в первый урок.
    const goal = courseById(getGoal());
    tiles.push(`<a class="ts-tile ts-continue" href="#${goalHref(goal)}"><span class="ts-icon">▶</span><span class="ts-text"><small>${t('welcome.start')}</small><b>${esc(tx(goal.name))}</b></span></a>`);
  }
  const quests = questState(p, dayKey());
  const qDone = quests.filter((q) => q.done).length;
  const next = quests.find((q) => !q.done);
  const rings = quests.map((q) => `<i class="${q.done ? 'on' : ''}" style="--p:${Math.round((q.value / q.quest.goal) * 100)}"></i>`).join('');
  tiles.push(`<button type="button" class="ts-tile ts-quests ${next ? '' : 'is-done'}" aria-expanded="false"><span class="ts-icon">${next ? '🎁' : '🎉'}</span><span class="ts-text"><small>${t('quest.title')} ${qDone}/${quests.length} <span class="ts-rings" aria-hidden="true">${rings}</span></small><b>${next ? `${esc(t(`quest.${next.quest.id}`, { n: next.quest.goal }))} · ${next.value}/${next.quest.goal}` : t('quest.allDone')}</b></span><span class="ts-caret" aria-hidden="true">▾</span></button>`);
  // Повторить правила: только когда есть что повторять; крестик - отложить до завтра.
  const rules = rulesTileCount();
  if (rules) {
    tiles.push(`<div class="ts-wrap"><a class="ts-tile ts-rules has-badge" href="#/rules"><span class="ts-icon">📘</span><span class="ts-text"><small>${t('rules.tile')}</small><b>${t('rules.tileN', { n: rules })}</b></span><span class="ts-badge">${rules}</span></a><button type="button" class="ts-later" aria-label="${t('rules.later')}" title="${t('rules.later')}">×</button></div>`);
  }
  const mistakes = getMistakes();
  if (mistakes.length) {
    const due = dueMistakes(dayKey()).length;
    tiles.push(`<a class="ts-tile ${due ? 'has-badge' : 'is-done'}" href="#/mistakes"><span class="ts-icon">🔁</span><span class="ts-text"><small>${t('strip.mistakes')}</small><b>${due ? t('strip.due', { n: due }) : '✔'}</b></span>${due ? `<span class="ts-badge">${due}</span>` : ''}</a>`);
  }
  const plan = getPlan();
  const pc = plan ? courseById(plan.course) : null;
  tiles.push(
    pc
      ? `<a class="ts-tile ts-plan" href="#/plan"><span class="ts-icon">📅</span><span class="ts-text"><small>${esc(tx(pc.name))}</small><b>${t('strip.ready', { n: readiness(pc) })}</b></span></a>`
      : `<a class="ts-tile ts-plan ts-dashed" href="#/plan"><span class="ts-icon">📅</span><span class="ts-text"><small>${t('strip.plan')}</small><b>${t('strip.planMake')}</b></span></a>`,
  );
  return `<div class="today-strip" style="--n:${tiles.length}">${tiles.join('')}</div>
        <div class="ts-pop" hidden>${questsCard(p)}<a class="ts-pop-link" href="#/today">🧭 ${t('strip.today')} →</a></div>`;
}

/** Сколько экзаменов на главной: цель, экзамены своей страны, международные. */
const HOME_EXAMS = 6;

/**
 * Правая колонка главной на компьютере: прогресс дня, задания дня, друзья и инструменты учёбы.
 * На телефоне и планшете скрыта - там то же самое есть в полосе «на сегодня».
 */
function railHtml(p, lvl, streak, xpToday) {
  const goal = Math.min(xpToday, DAILY_GOAL);
  // Список друзей храним в «friends» (src/core/friends.js); модуль не грузим ради одного числа.
  const friendList = storage.get('friends', []);
  const friends = Array.isArray(friendList) ? friendList.length : 0;
  const link = (href, icon, title, desc) => `<a class="rail-link" href="#${href}"><span class="rail-ico" aria-hidden="true">${icon}</span><span><b>${title}</b><small>${desc}</small></span></a>`;
  return `<aside class="hub-rail" aria-label="${t('rail.label')}">
    <a class="rail-card rail-me" href="#/profile">
      <span class="rail-ring" style="--p:${Math.round((goal / DAILY_GOAL) * 100)}">${mascot(moodOf(p).mascot, 'mascot-sm', undefined, { form: moodOf(p).form })}</span>
      <span class="rail-me-text">
        <b>${p.name ? esc(p.name) : t('home.level', { n: lvl.level })}</b>
        <small>${p.name ? `${t('home.level', { n: lvl.level })} · ` : ''}${p.xp}/${p.xp - lvl.into + lvl.need} XP</small>
        <span class="rail-row"><span class="rail-pill">${flameSvg(streak)} ${streak}</span><span class="rail-pill">🎯 ${goal}/${DAILY_GOAL}</span></span>
      </span>
    </a>
    <div class="rail-card rail-quests">${questsCard(p)}</div>
    <div class="rail-card rail-links">
      ${link('/friends', '👋', t('fr.title'), friends ? t('rail.friendsN', { n: friends }) : t('rail.friendsCta'))}
      ${link('/explain', '🎬', t('explain.title'), t('hub.explainDesc', { n: EXPLAINERS.length }))}
      ${link('/sheets', '📄', t('sheet.indexTitle'), t('sheet.short'))}
      ${link('/c/ielts/listening', '🎧', t('hub.listen'), t('hub.listenDesc'))}
    </div>
  </aside>`;
}

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
       <div class="hub-layout">
       <div class="hub-main">
        <div class="hero-card">
          <div class="hero-mascot prepi-stage">
            <button type="button" class="prepi-poke" aria-label="${t('prepi.poke')}">${mascot(moodOf(p).mascot, 'mascot-xl float', undefined, { form: moodOf(p).form })}</button>
            <button type="button" class="prepi-dress-btn" aria-label="${t('wear.title')}">👗 <small>${t('wear.title')}</small></button>
          </div>
          <div class="hero-text">
            <div class="hero-title">
              <p class="hero-kicker">${name ? t('home.helloName', { name }) : t('home.hello')}</p>
              ${streakRiskHtml(streak, xpToday)}
              <h1>${t('hub.title')}</h1>
              <p class="muted">${t('hub.subtitle')}</p>
            </div>
            <div class="hero-badges">
              <span class="badge lvl-xp-badge" title="${t('home.level', { n: lvl.level })}">⭐ <b>${t('home.level', { n: lvl.level })}</b> <span class="lx-num">${p.xp}/${p.xp - lvl.into + lvl.need} XP</span><span class="goal-bar"><i style="width:${Math.round((lvl.into / lvl.need) * 100)}%"></i></span></span>
              <span class="badge goal-badge ${xpToday >= DAILY_GOAL ? 'is-done' : ''}" title="${t('home.goal')}">🎯 <b>${Math.min(xpToday, DAILY_GOAL)}/${DAILY_GOAL}</b> ${xpToday >= DAILY_GOAL ? t('home.goalDone') : t('home.goal')}<span class="goal-bar"><i style="width:${Math.round((Math.min(xpToday, DAILY_GOAL) / DAILY_GOAL) * 100)}%"></i></span></span>
            </div>
          </div>
          ${heroShopHtml(p)}
        </div>

        ${rescueCardHtml(p)}

        ${giftCardHtml(p)}

        ${todayStripHtml(p)}

        ${quizHero(p)}

        <div class="life-row single">
          ${seasonCardHtml(p)}
        </div>


        ${rewardCardsHtml()}




        <section class="block">
          ${head(group('daily'), t('hub.open'), dailyBlock.hidden)}
          <div class="daily-grid">${dailyBlock.shown.map(levelCard).join('')}</div>
          ${dailyBlock.hidden ? `<p class="muted tiny pin-hint">☆ ${t('pin.hint')}</p>` : ''}
        </section>

        <section class="block">
          ${head(group('exams'), `${t('hub.allExams')} (${exams.length})`)}
          <div class="course-grid">${regionExams(exams.map((c) => c.id)).slice(0, HOME_EXAMS).map((id) => courseCard(courseById(id))).join('')}</div>
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
       </div>
       ${railHtml(p, lvl, streak, xpToday)}
       </div>
      </section>`;
    app.querySelector('.prepi-stage .prepi-dress-btn')?.addEventListener('click', () => openWardrobe(render));
    bindPoke(app.querySelector('.prepi-poke'), () => {
      const m = moodOf(getProfile());
      return { mood: m.mascot, cls: 'mascot-xl float', outfit: undefined, form: m.form, line: t(`mood.${m.id}`, { n: getProfile().streak?.count ?? 0 }) };
    });
    bindLife(app, render);
    bindQuizHost(app);
    // Первый заход: сначала «К чему готовишься?», экскурсия - потом.
    if (!welcomeDone() && !tourDone() && !(p.xp > 0)) import('../ui/welcome.js').then((m) => m.needsWelcome() && m.openWelcome());
    else maybeStartTour();
    app.querySelector('.install-go')?.addEventListener('click', startInstall);
    app.querySelector('.install-close')?.addEventListener('click', () => {
      dismissInstall();
      render();
    });
    app.querySelector('.ts-later')?.addEventListener('click', () => {
      restRulesToday();
      render();
    });
    const qBtn = app.querySelector('.ts-quests');
    qBtn?.addEventListener('click', () => {
      const pop = app.querySelector('.ts-pop');
      pop.hidden = !pop.hidden;
      qBtn.setAttribute('aria-expanded', String(!pop.hidden));
    });
    app.querySelectorAll('[data-open-chest]').forEach((b) => b.addEventListener('click', () => openChestModal(Number(b.dataset.openChest), render)));
  };
  render();
  // Браузер может сообщить о возможности установки уже после отрисовки.
  const onReady = () => render();
  document.addEventListener('installready', onReady);
  return { relabel: render, cleanup: () => document.removeEventListener('installready', onReady) };
}
