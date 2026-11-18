// Профиль: уровень, общая статистика, прогресс по разделам, точность по темам,
// карта навыков по всем предметам, активность за неделю, рекорды, экзамены (каждый свёрнут), настройки.

import { notesInNav, setNotesInNav } from '../ui/topbar.js';
import { navigate } from '../core/router.js';
import { startTour } from '../ui/tour.js';
import { COURSES, courseHref, practiceKey } from '../catalog/index.js';
import { t, tx } from '../core/i18n.js';
import { currentStreak, getProfile, levelInfo, resetProgress, saveProfile } from '../core/profile.js';
import { ACHIEVEMENTS } from '../content/achievements.js';
import { flameSvg } from '../core/economy.js';
import { hasMock } from '../catalog/mocks.js';
import { progressPanelHtml, progressPoints } from './mock.js';
import { bindChart } from '../ui/chart.js';
import { achievementsPanel } from './achievements.js';
import { DOMAINS, LEVELS_PER_ZONE, SKILLS, ZONES } from '../content/skills.js';
import { POOLS, TOPICS } from '../pools/topics.js';
import { masteredCount } from '../core/review.js';
import { DECK_LANGS, deckStats } from '../core/cards.js';
import { getPlan, readiness, trackScores } from '../core/plan.js';
import { weekStart, weekSummary } from '../core/rewards.js';
import { dayKey } from '../core/dates.js';
import { courseWeakTopics } from './review.js';
import { openWardrobe } from '../ui/wardrobe-ui.js';
import { getRoom } from '../core/shop.js';
import { roomScene } from '../ui/art/room.js';
import { canInstall } from '../core/pwa.js';
import { startInstall } from './hub.js';
import { getVolume, setVolume, sfx } from '../core/sound.js';
import { mascot } from '../ui/mascot.js';
import { esc } from '../ui/dom.js';
import { openModal, toast } from '../ui/overlay.js';
import { themePickerHtml } from '../ui/theme-picker.js';
import { courseBadge } from './hub.js';

/** Сколько тем показывать сразу; остальные открываются по нажатию. */
const TOPICS_SHOWN = 8;

export function domainMastery(profile) {
  const result = {};
  for (const d of Object.keys(DOMAINS)) {
    let a = 0;
    let c = 0;
    for (const [skill, info] of Object.entries(SKILLS)) {
      if (info.domain !== d) continue;
      a += profile.skills[skill]?.a ?? 0;
      c += profile.skills[skill]?.c ?? 0;
    }
    result[d] = a ? c / a : null;
  }
  return result;
}

/** Курсы каталога, в которых уже есть результаты: звёзды и число начатых уровней или предметов. */
export function courseProgress(profile) {
  const rows = [];
  for (const course of COURSES) {
    let stars = 0;
    let done = 0;
    for (const track of course.tracks) {
      const rec = profile.practice?.[practiceKey(course, track)];
      if (!rec) continue;
      done += 1;
      stars += rec.best;
    }
    if (done) rows.push({ course, stars, max: course.tracks.length * 3, done, total: course.tracks.length });
  }
  return rows;
}

/** Звёзды на карте SAT: набрано и возможно. */
export function satMapStars(profile) {
  const stars = Object.values(profile.map?.stars ?? {}).reduce((sum, s) => sum + s, 0);
  return { stars, max: ZONES.length * LEVELS_PER_ZONE * 3 };
}

/**
 * Точность по темам общих банков (математика, английский, олимпиада, чтение).
 * Сначала идут темы, которые даются труднее. Темы, где ответов меньше minAnswers, не показываются:
 * по одному-двум ответам о теме судить рано.
 */
export function topicAccuracy(profile, minAnswers = 3) {
  return Object.keys(TOPICS)
    .map((id) => ({ id, a: profile.skills[id]?.a ?? 0, c: profile.skills[id]?.c ?? 0 }))
    .filter((s) => s.a >= minAnswers)
    .map((s) => ({ ...s, pct: Math.round((s.c / s.a) * 100) }))
    .sort((x, y) => x.pct - y.pct || y.a - x.a);
}

/** «Паутина»: values - { ключ: 0…1 | null }, icons - { ключ: значок }. */
function radar(values, icons = Object.fromEntries(Object.entries(DOMAINS).map(([k, d]) => [k, d.icon])), label = t('profile.radar')) {
  const keys = Object.keys(icons);
  const cx = 150;
  const cy = 150;
  const R = 110;
  const point = (i, r) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / keys.length;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };
  const rings = [0.25, 0.5, 0.75, 1]
    .map((k) => `<polygon class="radar-ring" points="${keys.map((_, i) => point(i, R * k).join(',')).join(' ')}"/>`)
    .join('');
  const axes = keys.map((_, i) => `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${point(i, R)[0]}" y2="${point(i, R)[1]}"/>`).join('');
  const shape = keys.map((k, i) => point(i, R * Math.max(0.04, values[k] ?? 0)).join(',')).join(' ');
  const labels = keys
    .map((k, i) => {
      const [x, y] = point(i, R + 22);
      return `<text x="${x}" y="${y + 6}" text-anchor="middle" class="radar-icon">${esc(icons[k])}</text>`;
    })
    .join('');
  return `<svg class="radar" viewBox="0 0 300 300" role="img" aria-label="${label}">${rings}${axes}<polygon class="radar-shape" points="${shape}"/>${labels}</svg>`;
}

function progressRow(href, badge, name, sub, stars, max, color) {
  return `
    <a class="progress-row" href="#${href}" style="--c:${color}">
      ${badge}
      <span class="course-text"><b>${name}</b><small>${sub}</small></span>
      <span class="progress-side"><b>★ ${stars}/${max}</b><span class="bar"><i style="width:${Math.round((stars / max) * 100)}%"></i></span></span>
    </a>`;
}

function sectionsPanel(p) {
  const rows = courseProgress(p).map(({ course, stars, max, done, total }) =>
    progressRow(courseHref(course), courseBadge(course), esc(tx(course.name)), t('profile.started', { done, total }), stars, max, course.color),
  );
  const sat = satMapStars(p);
  const satCourse = COURSES.find((c) => c.id === 'sat');
  if (sat.stars > 0 || p.exams.length > 0) {
    rows.unshift(progressRow('/sat', courseBadge(satCourse), 'SAT', t('map.title'), sat.stars, sat.max, satCourse.color));
  }
  return `
    <div class="panel">
      <h2>${t('profile.sections')}</h2>
      ${
        rows.length
          ? `<div class="progress-list">${rows.join('')}</div>`
          : `<div class="empty-note">${mascot('wow', 'mascot-sm')}<p>${t('profile.sectionsEmpty')}</p></div>
             <a class="btn btn-primary panel-cta" href="#/practice">📅 ${t('profile.startPractice')}</a>`
      }
    </div>`;
}

function topicRow(s) {
  const topic = TOPICS[s.id];
  const pool = POOLS[topic.pool];
  return `<div class="skill-row"><span>${pool.icon} ${esc(tx(topic.name))}</span><div class="bar" style="--c:${pool.color}"><i style="width:${s.pct}%"></i></div><b title="${s.c}/${s.a}">${s.pct}%</b></div>`;
}

function topicsPanel(p) {
  const stats = topicAccuracy(p);
  const first = stats.slice(0, TOPICS_SHOWN);
  const rest = stats.slice(TOPICS_SHOWN);
  return `
    <div class="panel">
      <h2>${t('profile.topics')}</h2>
      ${
        stats.length
          ? `<p class="muted small panel-hint">${t('profile.topicsHint')}</p>
             <div class="topic-rows">${first.map(topicRow).join('')}</div>
             ${rest.length ? `<details class="more-topics"><summary>${t('profile.showAll')} (${stats.length})</summary><div class="topic-rows">${rest.map(topicRow).join('')}</div></details>` : ''}`
          : `<div class="empty-note">${mascot('happy', 'mascot-sm')}<p>${t('profile.topicsEmpty')}</p></div>`
      }
    </div>`;
}

// ---------- Общая статистика по всем предметам ----------

/** Предметы для общей карты навыков: ключ → пулы тем, которые в него входят. */
const SUBJECTS = {
  math: ['math'],
  english: ['english', 'reading'],
  langs: ['spanish', 'french', 'chinese'],
  physics: ['physics'],
  chemistry: ['chemistry'],
  biology: ['biology'],
  geography: ['geography'],
  history: ['history', 'social', 'russian'],
  informatics: ['informatics'],
  code: ['code'],
  olymp: ['olymp'],
};
const SUBJECT_ICONS = { math: '📐', english: '🔤', langs: '🌐', physics: '⚛️', chemistry: '⚗️', biology: '🧬', geography: '🌍', history: '📜', informatics: '💻', code: '⌨️', olymp: '🏆' };
const SUBJECT_COLORS = { math: '#22c55e', english: '#3b82f6', langs: '#dc2626', physics: '#6366f1', chemistry: '#14b8a6', biology: '#16a34a', geography: '#0891b2', history: '#b45309', informatics: '#0ea5e9', code: '#64748b', olymp: '#f59e0b' };

/** Точность и число ответов по каждому предмету (по всем темам общих банков). */
export function subjectStats(profile) {
  const out = {};
  for (const [key, pools] of Object.entries(SUBJECTS)) {
    let a = 0;
    let c = 0;
    for (const [id, topic] of Object.entries(TOPICS)) {
      if (!pools.includes(topic.pool)) continue;
      a += profile.skills[id]?.a ?? 0;
      c += profile.skills[id]?.c ?? 0;
    }
    out[key] = { a, c, value: a ? c / a : null };
  }
  return out;
}

function subjectsPanel(p) {
  const stats = subjectStats(p);
  const values = Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, v.value]));
  const rows = Object.keys(SUBJECTS)
    .map((k) => ({ k, ...stats[k] }))
    .sort((x, y) => y.a - x.a);
  return `
    <div class="two-col">
      <div class="panel">
        <h2>${t('profile.subjectMap')}</h2>
        <p class="muted small panel-hint">${t('profile.subjectMapHint')}</p>
        ${radar(values, SUBJECT_ICONS, t('profile.subjectMap'))}
      </div>
      <div class="panel">
        <h2>${t('profile.subjects')}</h2>
        <div class="skill-list">
          ${rows
            .map((r) => {
              const pct = r.value === null ? null : Math.round(r.value * 100);
              return `<div class="skill-row ${r.a ? '' : 'untried'}"><span>${SUBJECT_ICONS[r.k]} ${t(`subj.${r.k}`)}${r.a ? ` <small class="muted">· ${t('profile.solvedN', { n: r.a })}</small>` : ''}</span><div class="bar" style="--c:${SUBJECT_COLORS[r.k]}"><i style="width:${pct ?? 0}%"></i></div><b title="${r.c}/${r.a}">${pct === null ? '-' : `${pct}%`}</b></div>`;
            })
            .join('')}
        </div>
        <a class="btn btn-primary" href="#/mistakes">🔁 ${t('rv.title')}</a>
      </div>
    </div>`;
}

function activityPanel() {
  const week = weekSummary(weekStart());
  const max = Math.max(1, ...week.rows.map((r) => r.xp));
  const days = t('profile.weekdays').split(',');
  return `
    <div class="panel">
      <h2>${t('profile.activity')}</h2>
      <p class="muted small">${t('profile.activityHint', { xp: week.total.xp, n: week.total.a, d: week.active })}</p>
      <div class="week-bars">
        ${week.rows
          .map((r, i) => `<div class="week-bar ${r.day === dayKey() ? 'is-best' : ''}"><span class="wb-value">${r.xp || ''}</span><span class="wb-col"><i style="--h:${Math.round((r.xp / max) * 100)}%"></i></span><span class="wb-day">${days[i] ?? ''}</span></div>`)
          .join('')}
      </div>
    </div>`;
}

function recordsPanel(p) {
  const classic = Object.values(p.records.quiz ?? {});
  const courseBosses = Object.values(p.practice ?? {}).filter((r) => r?.boss).length;
  const words = DECK_LANGS.reduce((sum, l) => sum + deckStats(l).learned, 0);
  const plan = getPlan();
  const planCourse = plan ? COURSES.find((c) => c.id === plan.course) : null;
  const row = (icon, label, value) => `<div><span>${icon} ${label}</span><b>${value}</b></div>`;
  return `
    <div class="panel">
      <h2>${t('profile.recordsAll')}</h2>
      <div class="records">
        ${row('🔥', t('profile.bestStreak'), p.streak.best)}
        ${row('⚔️', t('profile.courseBosses'), courseBosses)}
        ${row('🎯', `${t('quiz.short')} · ${t('quiz.mode.classic')}`, classic.length ? `${Math.max(...classic)}/10` : '-')}
        ${row('⚡', `${t('quiz.short')} · ${t('quiz.mode.blitz')}`, p.records.quizBlitz ?? 0)}
        ${row('❤️', `${t('quiz.short')} · ${t('quiz.mode.survival')}`, p.records.quizSurvival ?? 0)}
        ${row('📅', t('quiz.mode.daily'), Object.keys(p.records.quizDaily ?? {}).length)}
        ${row('🃏', t('profile.wordsLearned'), words)}
        ${row('🔁', t('rv.mastered'), masteredCount())}
        ${planCourse ? row('🗓️', `${t('plan.readyLabel')} · ${esc(tx(planCourse.name))}`, `${readiness(planCourse)}%`) : ''}
      </div>
    </div>`;
}

// ---------- Экзамены: каждый свёрнут, пока его не откроешь ----------

function satFoldBody(p, values) {
  return `
    <div class="two-col">
      <div class="panel">
        <h2>${t('profile.radar')}</h2>
        ${radar(values)}
        <div class="domain-legend">${Object.entries(DOMAINS)
          .map(([k, d]) => `<div class="dl-row"><span>${d.icon} ${esc(tx(d.name))}</span><b>${values[k] === null ? '-' : `${Math.round(values[k] * 100)}%`}</b></div>`)
          .join('')}</div>
      </div>
      <div class="panel">
        <h2>${t('profile.skills')}</h2>
        <div class="skill-list">
          ${Object.entries(SKILLS)
            .map(([k, sk]) => {
              const st = p.skills[k];
              const pct = st ? Math.round((st.c / st.a) * 100) : null;
              return `<div class="skill-row ${st ? '' : 'untried'}"><span>${esc(tx(sk.name))}</span><div class="bar" style="--c:${DOMAINS[sk.domain].color}"><i style="width:${pct ?? 0}%"></i></div><b>${pct === null ? '-' : `${pct}%`}</b></div>`;
            })
            .join('')}
        </div>
        <a class="btn btn-primary" href="#/weak">🎯 ${t('profile.trainWeak')}</a>
      </div>
    </div>
    <div class="two-col">
      <div class="panel">
        <h2>${t('profile.records')}</h2>
        <div class="records">
          <div><span>🛡️ ${t('mode.survival.title')}</span><b>${p.records.survival}</b></div>
          <div><span>⚡ ${t('mode.blitz.title')}</span><b>${p.records.blitz}</b></div>
          <div><span>🕵️ ${t('mode.det.title')}</span><b>${p.records.detective}</b></div>
          <div><span>⚔️ ${t('profile.bosses')}</span><b>${Object.keys(p.map.bosses).length}/${ZONES.length}</b></div>
        </div>
      </div>
      <div class="panel">
        <h2>${t('profile.exams')}</h2>
        ${
          p.exams.length
            ? `<div class="exam-history">${p.exams
                .slice(-6)
                .reverse()
                .map((e) => `<div><span>${e.date} · ${t(e.length === 'full' ? 'exam.full' : 'exam.mini')}</span><b>${e.total ?? e.rw ?? e.math}</b></div>`)
                .join('')}</div>`
            : `<p class="muted">${t('profile.noExams')}</p>`
        }
      </div>
    </div>`;
}

function examFoldBody(p, course) {
  const scores = trackScores(course, p);
  return `
    <div class="skill-list">
      ${scores
        .map(({ track, score }) => {
          const rec = p.practice?.[practiceKey(course, track)];
          return `<a class="skill-row exam-subject" href="#/c/${course.id}/${track.id}"><span>${esc(track.icon)} ${esc(tx(track.name))}</span><div class="bar" style="--c:${course.color}"><i style="width:${Math.round(score * 100)}%"></i></div><b>${rec ? '★'.repeat(rec.best) + '☆'.repeat(3 - rec.best) : '-'}</b></a>`;
        })
        .join('')}
    </div>
    <div class="exam-fold-actions">
      <a class="btn btn-primary btn-sm" href="#${courseHref(course)}">📚 ${t('plan.openExam')}</a>
      ${courseWeakTopics(course).length ? `<a class="btn btn-soft btn-sm" href="#/weak/${course.id}">🎯 ${t('wk.start')}</a>` : ''}
      ${hasMock(course.id) ? `<a class="btn btn-soft btn-sm" href="#/mock/${course.id}">🏁 ${t('mock.title')}</a>` : ''}
    </div>
    ${progressPanelHtml(course.id)}`;
}

function examsSection(p, satValues) {
  const exams = COURSES.filter((c) => c.group === 'exams' && (c.tracks.length || c.id === 'sat'));
  const rows = exams.map((course) => ({ course, ready: readiness(course, p) }));
  rows.sort((a, b) => b.ready - a.ready);
  return `
    <h2 class="section-title">${t('profile.examsTitle')}</h2>
    <p class="muted small">${t('profile.examsHint')}</p>
    <div class="exam-folds">
      ${rows
        .map(
          ({ course, ready }) => `
        <details class="exam-fold" data-exam="${course.id}" style="--c:${course.color}">
          <summary>
            ${courseBadge(course)}
            <span class="course-text"><b>${esc(tx(course.name))}</b><small>${esc(tx(course.full))}</small></span>
            <span class="exam-ready"><span class="bar"><i style="width:${ready}%"></i></span><b>${ready ? `${ready}%` : t('profile.notStarted')}</b></span>
          </summary>
          <div class="exam-fold-body">${course.id === 'sat' ? satFoldBody(p, satValues) : examFoldBody(p, course)}</div>
        </details>`,
        )
        .join('')}
    </div>`;
}

export function profileScreen(app) {
  const render = () => {
    const p = getProfile();
    const lvl = levelInfo(p.xp);
    const acc = p.counters.answered ? Math.round((p.counters.correct / p.counters.answered) * 100) : 0;
    const values = domainMastery(p);
    const earned = ACHIEVEMENTS.filter((a) => p.achievements[a.id]).length;
    app.innerHTML = `
      <section class="page profile">
        <div class="profile-card">
          <button type="button" class="prepi-dress" aria-label="${t('wear.title')}">${mascot('happy', 'mascot-lg')}<span class="prepi-dress-btn">👗 ${t('wear.open')}</span></button>
          <div class="profile-main">
            <label class="name-field inline"><span>${t('profile.name')}</span><input class="name-input" type="text" maxlength="24" value="${esc(p.name)}" placeholder="${t('duel.namePlaceholder')}"/></label>
            <div class="level-line"><span class="lvl-badge big">${lvl.level}</span><div class="bar xp"><i style="width:${Math.round((lvl.into / lvl.need) * 100)}%"></i></div><span class="muted small">${lvl.into}/${lvl.need} XP</span></div>
          </div>
        </div>

        <a class="profile-room" href="#/shop/room" aria-label="${t('profile.room')}">
          ${roomScene(getRoom(p), mascot('happy', 'mascot-stage float'), { compact: true })}
          <span class="profile-room-label">🛋️ ${t('profile.room')} →</span>
        </a>

        <div class="stat-grid">
          <div class="stat-tile"><b>${p.counters.answered}</b><span>${t('profile.answered')}</span></div>
          <div class="stat-tile"><b>${acc}%</b><span>${t('res.accuracy')}</span></div>
          <div class="stat-tile"><b>${flameSvg(currentStreak())} ${currentStreak()}</b><span>${t('profile.streak', { best: p.streak.best })}</span></div>
          <div class="stat-tile"><b>${earned}/${ACHIEVEMENTS.length}</b><span>${t('profile.achievements')}</span></div>
        </div>

        ${subjectsPanel(p)}

        <div class="two-col">
          ${activityPanel()}
          ${recordsPanel(p)}
        </div>

        <div class="two-col">
          ${sectionsPanel(p)}
          ${topicsPanel(p)}
        </div>

${achievementsPanel(p)}

        ${examsSection(p, values)}

        <div class="panel appearance">
          <h2>🎨 ${t('theme.title')}</h2>
          <p class="muted small">${t('theme.pick')}</p>
          ${themePickerHtml('wide')}
        </div>

        <div class="panel settings">
          <h2>${t('profile.settings')}</h2>
          <label class="toggle"><input type="checkbox" class="sound-input" ${p.sound ? 'checked' : ''}/><span>${t('profile.sound')}</span></label>
          <label class="toggle"><input type="checkbox" class="notes-nav-input" ${notesInNav() ? 'checked' : ''}/><span>🔖 ${t('profile.notesNav')}</span></label>
          <label class="volume"><span>🔊 ${t('profile.volume')}</span><input type="range" class="volume-input" min="0" max="100" step="5" value="${Math.round(getVolume() * 100)}" ${p.sound ? '' : 'disabled'}/></label>
          <a class="btn btn-soft" href="#/saved">🔖 ${t('saved.title')}</a>
          <button type="button" class="btn btn-soft tour-btn">🎓 ${t('tour.replay')}</button>
          ${canInstall() ? `<button type="button" class="btn btn-soft install-btn">📲 ${t('pwa.install')}</button>` : ''}
          <button type="button" class="btn btn-danger-soft reset-btn">🗑 ${t('profile.reset')}</button>
        </div>
      </section>`;

    app.querySelector('.name-input').addEventListener('change', (e) => {
      p.name = e.target.value.trim().slice(0, 24);
      saveProfile();
      toast(`✅ ${t('profile.saved')}`, { kind: 'good' });
    });
    app.querySelector('.notes-nav-input')?.addEventListener('change', (e) => setNotesInNav(e.target.checked));
    app.querySelector('.sound-input').addEventListener('change', (e) => {
      p.sound = e.target.checked;
      saveProfile();
      app.querySelector('.volume-input').disabled = !p.sound;
    });
    app.querySelector('.prepi-dress').addEventListener('click', () => openWardrobe(render));
    app.querySelectorAll('.exam-fold[data-exam]').forEach((el) => bindChart(el, progressPoints(el.dataset.exam)));
    app.querySelector('.install-btn')?.addEventListener('click', startInstall);
    app.querySelector('.volume-input').addEventListener('change', (e) => {
      setVolume(Number(e.target.value) / 100);
      sfx.correct(1);
    });
    app.querySelector('.tour-btn')?.addEventListener('click', () => {
      navigate('/');
      setTimeout(startTour, 500);
    });
    app.querySelector('.reset-btn').addEventListener('click', () =>
      openModal({
        title: t('profile.resetTitle'),
        body: `<p>${t('profile.resetText')}</p>`,
        actions: [
          { label: t('common.cancel') },
          {
            label: t('profile.resetConfirm'),
            danger: true,
            onClick: () => {
              resetProgress();
              render();
            },
          },
        ],
      }),
    );
  };
  render();
  return { relabel: render };
}
