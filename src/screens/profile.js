// Профиль: уровень, общая статистика, прогресс по разделам, точность по темам,
// «паутина» навыков SAT, достижения, рекорды, настройки.

import { COURSES, courseHref, practiceKey } from '../catalog/index.js';
import { t, tx } from '../core/i18n.js';
import { currentStreak, getProfile, levelInfo, resetProgress, saveProfile } from '../core/profile.js';
import { ACHIEVEMENTS } from '../content/achievements.js';
import { DOMAINS, LEVELS_PER_ZONE, SKILLS, ZONES } from '../content/skills.js';
import { POOLS, TOPICS } from '../pools/topics.js';
import { masteredCount } from '../core/review.js';
import { CHESTS, WEAR, currentWear, setWear, unlockedWear } from '../core/rewards.js';
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

function radar(values) {
  const keys = Object.keys(DOMAINS);
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
      return `<text x="${x}" y="${y + 6}" text-anchor="middle" class="radar-icon">${DOMAINS[k].icon}</text>`;
    })
    .join('');
  return `<svg class="radar" viewBox="0 0 300 300" role="img" aria-label="${t('profile.radar')}">${rings}${axes}<polygon class="radar-shape" points="${shape}"/>${labels}</svg>`;
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
          ${mascot('happy', 'mascot-lg')}
          <div class="profile-main">
            <label class="name-field inline"><span>${t('profile.name')}</span><input class="name-input" type="text" maxlength="24" value="${esc(p.name)}" placeholder="${t('duel.namePlaceholder')}"/></label>
            <div class="level-line"><span class="lvl-badge big">${lvl.level}</span><div class="bar xp"><i style="width:${Math.round((lvl.into / lvl.need) * 100)}%"></i></div><span class="muted small">${lvl.into}/${lvl.need} XP</span></div>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-tile"><b>${p.counters.answered}</b><span>${t('profile.answered')}</span></div>
          <div class="stat-tile"><b>${acc}%</b><span>${t('res.accuracy')}</span></div>
          <div class="stat-tile"><b>🔥 ${currentStreak()}</b><span>${t('profile.streak', { best: p.streak.best })}</span></div>
          <div class="stat-tile"><b>${earned}/${ACHIEVEMENTS.length}</b><span>${t('profile.achievements')}</span></div>
        </div>

        <div class="two-col">
          ${sectionsPanel(p)}
          ${topicsPanel(p)}
        </div>

        <div class="panel">
          <h2>${t('profile.achievements')}</h2>
          <div class="ach-grid">
            ${ACHIEVEMENTS.map(
              (a) => `<div class="ach ${p.achievements[a.id] ? 'earned' : ''}" title="${esc(tx(a.desc))}"><span class="ach-icon">${a.icon}</span><b>${esc(tx(a.name))}</b><small>${esc(tx(a.desc))}</small></div>`,
            ).join('')}
          </div>
        </div>

        <h2 class="section-title">SAT</h2>
        <div class="two-col">
          <div class="panel">
            <h2>${t('profile.radar')}</h2>
            ${radar(values)}
            <div class="domain-legend">${Object.entries(DOMAINS)
              .map(
                ([k, d]) =>
                  `<div class="dl-row"><span>${d.icon} ${esc(tx(d.name))}</span><b>${values[k] === null ? '—' : `${Math.round(values[k] * 100)}%`}</b></div>`,
              )
              .join('')}</div>
          </div>
          <div class="panel">
            <h2>${t('profile.skills')}</h2>
            <div class="skill-list">
              ${Object.entries(SKILLS)
                .map(([k, s]) => {
                  const st = p.skills[k];
                  const pct = st ? Math.round((st.c / st.a) * 100) : null;
                  return `<div class="skill-row ${st ? '' : 'untried'}"><span>${esc(tx(s.name))}</span><div class="bar" style="--c:${DOMAINS[s.domain].color}"><i style="width:${pct ?? 0}%"></i></div><b>${pct === null ? '—' : `${pct}%`}</b></div>`;
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
              <div><span>🎯 ${t('quiz.short')} · ${t('quiz.mode.classic')}</span><b>${Object.values(p.records.quiz ?? {}).length ? `${Math.max(...Object.values(p.records.quiz))}/10` : '—'}</b></div>
              <div><span>⚡ ${t('quiz.short')} · ${t('quiz.mode.blitz')}</span><b>${p.records.quizBlitz ?? 0}</b></div>
              <div><span>❤️ ${t('quiz.short')} · ${t('quiz.mode.survival')}</span><b>${p.records.quizSurvival ?? 0}</b></div>
              <div><span>📅 ${t('quiz.mode.daily')}</span><b>${Object.keys(p.records.quizDaily ?? {}).length}</b></div>
              <div><span>🔁 ${t('rv.mastered')}</span><b>${masteredCount()}</b></div>
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
        </div>

        <div class="panel appearance">
          <h2>🎨 ${t('theme.title')}</h2>
          <p class="muted small">${t('theme.pick')}</p>
          ${themePickerHtml('wide')}
        </div>

        <div class="panel wardrobe">
          <h2>👗 ${t('wear.title')}</h2>
          <p class="muted small">${t('wear.hint')}</p>
          <div class="wardrobe-row">
            <div class="wardrobe-prepi">${mascot('happy', 'mascot-lg')}</div>
            <div class="wardrobe-items">
              ${WEAR.map((w) => {
                const open = unlockedWear().includes(w.id);
                const chest = CHESTS.find((c) => c.wear === w.id);
                return `<button type="button" class="wear-item ${open ? '' : 'is-locked'}" data-wear="${w.id}" aria-pressed="${currentWear() === w.id}" ${open ? '' : 'disabled'}>
                  <span class="wear-icon">${open ? w.icon : '🔒'}</span>
                  <span class="wear-name">${t(`wear.${w.id}`)}</span>
                  ${open ? '' : `<small>${t('wear.locked', { n: chest?.days ?? 0 })}</small>`}
                </button>`;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="panel settings">
          <h2>${t('profile.settings')}</h2>
          <label class="toggle"><input type="checkbox" class="sound-input" ${p.sound ? 'checked' : ''}/><span>${t('profile.sound')}</span></label>
          <label class="volume"><span>🔊 ${t('profile.volume')}</span><input type="range" class="volume-input" min="0" max="100" step="5" value="${Math.round(getVolume() * 100)}" ${p.sound ? '' : 'disabled'}/></label>
          <button type="button" class="btn btn-danger-soft reset-btn">🗑 ${t('profile.reset')}</button>
        </div>
      </section>`;

    app.querySelector('.name-input').addEventListener('change', (e) => {
      p.name = e.target.value.trim().slice(0, 24);
      saveProfile();
      toast(`✅ ${t('profile.saved')}`, { kind: 'good' });
    });
    app.querySelector('.sound-input').addEventListener('change', (e) => {
      p.sound = e.target.checked;
      saveProfile();
      app.querySelector('.volume-input').disabled = !p.sound;
    });
    app.querySelector('.volume-input').addEventListener('change', (e) => {
      setVolume(Number(e.target.value) / 100);
      sfx.correct(1);
    });
    app.querySelectorAll('[data-wear]').forEach((b) =>
      b.addEventListener('click', () => {
        setWear(b.dataset.wear);
        sfx.select();
        render();
      }),
    );
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
