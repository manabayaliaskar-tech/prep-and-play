// Каталог: список экзаменов, страница курса (экзамен или набор уровней), раздел «Ежедневная практика».

import { courseById, courseHref, coursesIn, groupById, levelLabel, trackHref, trackRecord } from '../catalog/index.js';
import { t, tx } from '../core/i18n.js';
import { navigate } from '../core/router.js';
import { skillName } from '../content/labels.js';
import { esc } from '../ui/dom.js';
import { courseBadge, courseCard } from './hub.js';

const stars = (n) => `<span class="track-stars ${n ? 'has' : ''}" aria-label="${n}/3">${'★'.repeat(n)}${'☆'.repeat(3 - n)}</span>`;

/** Темы дорожки без повторов — для подсказки «что внутри». */
export function trackTopics(track) {
  return [...new Set(track.spec.map(([topic]) => topic))];
}

function trackCard(course, track) {
  const rec = trackRecord(course, track);
  const label = course.leveled && !course.cefr ? `<span class="track-kicker">${levelLabel(course, track)}</span>` : '';
  return `
    <a class="track-card ${rec?.best ? 'done' : ''}" href="#${trackHref(course, track)}" style="--c:${course.color}">
      <span class="track-icon">${esc(track.icon)}</span>
      <span class="track-text">${label}<b>${esc(tx(track.name))}</b><small>${esc(tx(track.desc))}</small></span>
      <span class="track-side">${stars(rec?.best ?? 0)}<small>${rec ? t('cat.bestPct', { n: rec.pct }) : t('cat.notStarted')}</small></span>
    </a>`;
}

export function tracksHtml(course) {
  if (!course.tracks.length) return `<p class="empty-note">${t('cat.noTracks')}</p>`;
  return `<div class="track-grid ${course.leveled ? 'leveled' : ''}">${course.tracks.map((track) => trackCard(course, track)).join('')}</div>`;
}

function courseHero(course) {
  return `
    <div class="course-hero" style="--c:${course.color}">
      ${courseBadge(course, 'big')}
      <div>
        <h1>${esc(tx(course.name))}</h1>
        <p class="course-full">${esc(tx(course.full))}</p>
        <p class="muted">${esc(tx(course.about))}</p>
        ${course.official ? `<p class="small">${t('cat.official')}: <a href="${course.official.url}" target="_blank" rel="noopener">${esc(course.official.label)}</a></p>` : ''}
      </div>
    </div>`;
}

export function examsScreen(app) {
  const render = () => {
    const group = groupById('exams');
    app.innerHTML = `
      <section class="page catalog">
        <div class="page-head">
          <h1>${group.icon} ${esc(tx(group.name))}</h1>
          <p class="muted">${t('cat.examsDesc')}</p>
        </div>
        <h2 class="section-title">${t('cat.intl')}</h2>
        <div class="course-grid">${coursesIn('exams', 'intl').map(courseCard).join('')}</div>
        <h2 class="section-title">${t('cat.cis')}</h2>
        <div class="course-grid">${coursesIn('exams', 'cis').map(courseCard).join('')}</div>
        <p class="muted tiny catalog-note">${t('cat.disclaimer')}</p>
      </section>`;
  };
  render();
  return { relabel: render };
}

export function courseScreen(app, { course: id }) {
  const course = courseById(id);
  if (!course) {
    navigate('/');
    return null;
  }
  if (course.href) {
    navigate(course.href);
    return null;
  }
  const render = () => {
    const group = groupById(course.group);
    const topics = [...new Set(course.tracks.flatMap(trackTopics))];
    app.innerHTML = `
      <section class="page catalog">
        <a class="crumb" href="#${group.id === 'olymp' ? '/' : group.href}">← ${group.id === 'olymp' ? t('nav.home') : esc(tx(group.name))}</a>
        ${courseHero(course)}
        <h2 class="section-title">${course.leveled ? t('cat.levels') : t('cat.subjects')}</h2>
        ${tracksHtml(course)}
        ${
          course.soon?.length
            ? `<h2 class="section-title">${t('cat.soon')}</h2>
               <div class="soon-chips">${course.soon.map((s) => `<span class="soon-chip">🔒 ${esc(tx(s))}</span>`).join('')}</div>`
            : ''
        }
        ${
          topics.length
            ? `<details class="topics-box"><summary>${t('pr.topics')} (${topics.length})</summary><div class="topic-chips">${topics.map((id2) => `<span class="topic-chip">${esc(tx(skillName(id2)))}</span>`).join('')}</div></details>`
            : ''
        }
        ${course.group === 'exams' ? `<p class="muted tiny catalog-note">${t('cat.disclaimer')}</p>` : ''}
      </section>`;
  };
  render();
  return { relabel: render };
}

export function practiceHubScreen(app) {
  const render = () => {
    const group = groupById('daily');
    app.innerHTML = `
      <section class="page catalog">
        <div class="page-head">
          <h1>${group.icon} ${esc(tx(group.name))}</h1>
          <p class="muted">${t('pr.hubDesc')}</p>
        </div>
        ${coursesIn('daily')
          .map(
            (course) => `
          <div class="practice-course" style="--c:${course.color}">
            <a class="practice-course-head" href="#${courseHref(course)}">${courseBadge(course)}<span class="course-text"><b>${esc(tx(course.name))}</b><small>${esc(tx(course.full))}</small></span></a>
            ${tracksHtml(course)}
          </div>`,
          )
          .join('')}
      </section>`;
  };
  render();
  return { relabel: render };
}
