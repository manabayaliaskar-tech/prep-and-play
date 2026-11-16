// Каталог: список экзаменов, страница курса (экзамен или набор уровней), раздел «Ежедневная практика».

import { courseById, courseHref, coursesIn, groupById, levelLabel, trackHref, trackRecord } from '../catalog/index.js';
import { t, tx } from '../core/i18n.js';
import { navigate } from '../core/router.js';
import { skillName } from '../content/labels.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { courseBadge, courseCard } from './hub.js';
import { isPinned, pinButton } from '../core/pins.js';

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
      <span class="track-side">${rec?.boss ? '<span class="crown" title="👑">👑</span>' : ''}${stars(rec?.best ?? 0)}<small>${rec?.runs ? t('cat.bestPct', { n: rec.pct }) : t('cat.notStarted')}</small></span>
    </a>`;
}

/** Высота одного шага пути уровней, px. */
const PATH_STEP = 132;

/**
 * Путь уровней: уровни-«острова» стоят на извилистой дороге сверху вниз.
 * Препи стоит у первого уровня, который ещё не пройден хотя бы на одну звезду.
 */
export function pathHtml(course) {
  const records = course.tracks.map((track) => trackRecord(course, track));
  let current = records.findIndex((rec) => !(rec?.best >= 1));
  if (current < 0) current = course.tracks.length - 1;
  const points = course.tracks.map((_, i) => ({ x: 50 + 27 * Math.sin(i * 0.95), y: 54 + i * PATH_STEP }));
  const height = points.at(-1).y + 96;
  const curve = (list) =>
    list.map((p, i) => (i ? `C${list[i - 1].x} ${list[i - 1].y + PATH_STEP / 2} ${p.x} ${p.y - PATH_STEP / 2} ${p.x} ${p.y}` : `M${p.x} ${p.y}`)).join(' ');
  const nodes = course.tracks
    .map((track, i) => {
      const rec = records[i];
      const best = rec?.best ?? 0;
      const { x, y } = points[i];
      const state = best >= 1 ? 'is-done' : i === current ? 'is-current' : 'is-next';
      const side = x >= 50 ? 'label-left' : 'label-right';
      const kicker = course.cefr ? '' : `<small>${levelLabel(course, track)}</small>`;
      return `
        <a class="path-node ${state} ${side}" href="#${trackHref(course, track)}" style="--x:${x.toFixed(2)};top:${y - 40}px;--i:${i}">
          ${i === current ? `<span class="path-prepi" title="${t('pr.youAreHere')}">${mascot(best ? 'win' : 'happy', 'mascot-path')}</span>` : ''}
          <span class="node-orb"><span class="node-icon">${esc(track.icon)}</span>${rec?.boss ? '<span class="node-crown" aria-label="👑">👑</span>' : ''}</span>
          <span class="node-stars" aria-label="${best}/3">${'★'.repeat(best)}${'☆'.repeat(3 - best)}</span>
          <span class="node-label">${kicker}<b>${esc(tx(track.name))}</b>${rec?.runs ? `<em>${t('cat.bestPct', { n: rec.pct })}</em>` : ''}</span>
        </a>`;
    })
    .join('');
  return `
    <div class="course-path" style="--c:${course.color};height:${height}px">
      <svg class="path-road" viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true">
        <path class="road-base" d="${curve(points)}"/>
        ${current > 0 ? `<path class="road-done" d="${curve(points.slice(0, current + 1))}"/>` : ''}
        <path class="road-dash" d="${curve(points)}"/>
      </svg>
      ${nodes}
    </div>`;
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
        ${course.leveled && course.tracks.length ? pathHtml(course) : tracksHtml(course)}
        ${
          course.soon?.length
            ? `<h2 class="section-title">${t('cat.soon')}</h2>
               <div class="soon-chips">${course.soon.map((s) => `<span class="soon-chip">🔒 ${esc(tx(s))}</span>`).join('')}</div>
               <p class="muted small soon-note">${course.group === 'exams' && ['ielts', 'toefl', 'hsk'].includes(course.id) ? t('cat.soonAudio') : t('cat.soonNative')}</p>`
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

export function practiceHubScreen(app, groupId = 'daily') {
  const render = () => {
    const group = groupById(groupId);
    app.innerHTML = `
      <section class="page catalog">
        <div class="page-head">
          <h1>${group.icon} ${esc(tx(group.name))}</h1>
          <p class="muted">${groupId === 'code' ? t('pr.codeDesc') : t('pr.hubDesc')}</p>
          <p class="muted small pin-hint">★ ${t('pin.hint')}</p>
        </div>
        ${coursesIn(groupId)
          .map(
            (course) => `
          <div class="practice-course" style="--c:${course.color}">
            ${pinButton(course.id, t(isPinned(course.id) ? 'pin.remove' : 'pin.add'))}
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
