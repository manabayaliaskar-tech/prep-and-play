// Шпаргалки: одна страница на курс или предмет - правила, формулы, ловушки и короткий пример по каждой теме.
// Собираются из мини-уроков. Кнопка «Печать / PDF» открывает печать браузера (там же «Сохранить как PDF»).
//
//   #/sheets                - все шпаргалки по разделам
//   #/sheet/:course         - шпаргалка курса или экзамена (все предметы)
//   #/sheet/:course/:track  - шпаргалка одного предмета или уровня

import { COURSES, courseById, courseHref, groupById, trackById, trackHref } from '../catalog/index.js';
import { lessonFor } from '../content/lessons/index.js';
import { skillName } from '../content/labels.js';
import { DOMAINS, SKILLS } from '../content/skills.js';
import { t, tx } from '../core/i18n.js';
import { navigate } from '../core/router.js';
import { esc } from '../ui/dom.js';
import { courseBadge } from './hub.js';
import { trackTopics } from './catalog.js';

const uniq = (list) => [...new Set(list)];
const withLesson = (ids) => uniq(ids).filter((id) => lessonFor(id));

/** Разделы шпаргалки курса: [{ title, icon, topics }]. У SAT - домены навыков, у остальных - предметы/уровни. */
function sections(course, trackId = null) {
  if (course.id === 'sat') {
    return Object.entries(DOMAINS).map(([d, dom]) => ({
      title: tx(dom.name),
      icon: dom.icon,
      topics: withLesson(Object.keys(SKILLS).filter((id) => SKILLS[id].domain === d)),
    }));
  }
  const tracks = trackId ? [trackById(course, trackId)].filter(Boolean) : course.tracks;
  const seen = new Set();
  return tracks.map((tr) => {
    // Тема, уже показанная в предыдущем разделе, второй раз не повторяется.
    const topics = withLesson(trackTopics(tr)).filter((id) => !seen.has(id));
    topics.forEach((id) => seen.add(id));
    return { title: tx(tr.name), icon: tr.icon, topics, track: tr };
  });
}

const topicCount = (course) => sections(course).reduce((n, s) => n + s.topics.length, 0);

function topicBlock(id) {
  const les = lessonFor(id);
  return `<article class="sheet-topic">
    <h3>${esc(tx(skillName(id)))}</h3>
    <p class="sheet-rule">${esc(tx(les.rule))}</p>
    ${les.points?.length ? `<ul>${les.points.map((p) => `<li>${esc(tx(p))}</li>`).join('')}</ul>` : ''}
    <div class="sheet-ex"><b>${t('lesson.example')}:</b> <span class="sheet-q">${esc(tx(les.example.q))}</span><ol>${les.example.steps.map((s) => `<li>${esc(tx(s))}</li>`).join('')}</ol></div>
  </article>`;
}

export function sheetRoute(app, { course: courseId, track: trackId = null }) {
  const course = courseById(courseId);
  if (!course) return navigate('/sheets');
  const render = () => {
    const list = sections(course, trackId).filter((s) => s.topics.length);
    const track = trackId ? trackById(course, trackId) : null;
    const many = !trackId && course.tracks.length > 1;
    app.innerHTML = `
      <section class="page sheet-page" style="--c:${course.color}">
        <div class="sheet-bar no-print">
          <a class="crumb" href="#/sheets">← ${t('sheet.all')}</a>
          <div class="sheet-actions">
            <a class="btn btn-soft btn-sm" href="#${track ? trackHref(course, track) : course.href ?? courseHref(course)}">▶ ${t('sheet.practice')}</a>
            <button type="button" class="btn btn-primary btn-sm sheet-print">🖨 ${t('sheet.print')}</button>
          </div>
        </div>
        <header class="sheet-head">
          ${courseBadge(course)}
          <div><small>📄 ${t('sheet.title')}</small><h1>${esc(tx(course.name))}${track ? ` · ${esc(tx(track.name))}` : ''}</h1></div>
        </header>
        ${
          many
            ? `<nav class="sheet-chips no-print">${course.tracks
                .filter((tr) => withLesson(trackTopics(tr)).length)
                .map((tr) => `<a class="explain-chip" href="#/sheet/${course.id}/${tr.id}">${esc(tr.icon)} ${esc(tx(tr.name))}</a>`)
                .join('')}</nav>`
            : ''
        }
        ${
          list.length
            ? list
                .map(
                  (s) => `<section class="sheet-sec">
          ${list.length > 1 || course.id === 'sat' ? `<h2>${esc(s.icon)} ${esc(s.title)}</h2>` : ''}
          <div class="sheet-grid">${s.topics.map(topicBlock).join('')}</div>
        </section>`,
                )
                .join('')
            : `<p class="muted">${t('sheet.empty')}</p>`
        }
        <p class="sheet-foot">Prep&Play · ${esc(tx(course.name))}${track ? ` · ${esc(tx(track.name))}` : ''}</p>
      </section>`;
    app.querySelector('.sheet-print').addEventListener('click', () => window.print());
  };
  render();
  return { relabel: render };
}

export function sheetsRoute(app) {
  const render = () => {
    const groups = ['exams', 'daily', 'code', 'olymp']
      .map((g) => ({ group: groupById(g), courses: COURSES.filter((c) => c.group === g && (!c.href || c.id === 'sat') && topicCount(c) > 0) }))
      .filter((x) => x.group && x.courses.length);
    app.innerHTML = `
      <section class="page catalog sheets-index">
        <div class="page-head">
          <h1>📄 ${t('sheet.indexTitle')}</h1>
          <p class="muted">${t('sheet.indexDesc')}</p>
        </div>
        ${groups
          .map(
            ({ group, courses }) => `<h2 class="section-title">${group.icon} ${esc(tx(group.name))}</h2>
        <div class="sheet-list">${courses
          .map(
            (c) => `<a class="sheet-card" href="#/sheet/${c.id}" style="--c:${c.color}">${courseBadge(c)}<span><b>${esc(tx(c.name))}</b><small>${t('sheet.topics', { n: topicCount(c) })}</small></span><span class="sheet-go">→</span></a>`,
          )
          .join('')}</div>`,
          )
          .join('')}
      </section>`;
  };
  render();
  return { relabel: render };
}
