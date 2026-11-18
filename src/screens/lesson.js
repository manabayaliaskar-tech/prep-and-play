// Мини-урок «сначала знания, потом задания»: правило, пункты, разобранный пример и вопрос «проверь себя».
// Перед первой тренировкой уровня показываются уроки по его темам, которые человек ещё не видел.
// Потом урок открывается кнопкой «Теория» на странице уровня и ссылкой «Повторить правило» в разборе ошибки.

import { lessonFor } from '../content/lessons/index.js';
import { explainerFor } from '../content/explainers.js';
import { skillName } from '../content/labels.js';
import { t, tx } from '../core/i18n.js';
import { storage } from '../core/storage.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { openModal } from '../ui/overlay.js';

const SEEN_KEY = 'lessonsSeen';
const seenMap = () => storage.get(SEEN_KEY, {}) ?? {};

/** Темы из списка, у которых есть урок. */
export const lessonTopics = (topics) => topics.filter((id) => lessonFor(id));

/** Уроки, которые человек ещё не видел. */
export const unseenLessons = (topics) => {
  const seen = seenMap();
  return lessonTopics(topics).filter((id) => !seen[id]);
};

export function markLessonsSeen(topics) {
  const seen = seenMap();
  for (const id of topics) seen[id] = 1;
  storage.set(SEEN_KEY, seen);
}

/** Тело урока по теме: правило, пункты, пример, «проверь себя». */
export function lessonHtml(topic, { withAnim = true } = {}) {
  const les = lessonFor(topic);
  if (!les) return '';
  const anim = withAnim ? explainerFor(topic) : null;
  return `
    <div class="lesson" data-topic="${topic}">
      <p class="lesson-rule">${esc(tx(les.rule))}</p>
      ${les.points?.length ? `<ul class="lesson-points">${les.points.map((p) => `<li>${esc(tx(p))}</li>`).join('')}</ul>` : ''}
      <div class="lesson-example">
        <h3>${t('lesson.example')}</h3>
        <p class="lesson-q">${esc(tx(les.example.q))}</p>
        <ol>${les.example.steps.map((s) => `<li>${esc(tx(s))}</li>`).join('')}</ol>
      </div>
      <div class="lesson-check">
        <h3>${t('lesson.check')}</h3>
        <p class="lesson-q">${esc(tx(les.check.q))}</p>
        <div class="lesson-options">${les.check.options.map((o, i) => `<button type="button" class="lesson-opt" data-i="${i}">${esc(tx(o))}</button>`).join('')}</div>
        <p class="lesson-why" hidden></p>
      </div>
      ${anim ? `<a class="btn btn-soft btn-sm lesson-anim" href="#/explain/${anim}">🎬 ${t('lesson.anim')}</a>` : ''}
    </div>`;
}

/** Оживляет вопрос «проверь себя» внутри root. */
export function bindLesson(root) {
  root.querySelectorAll('.lesson').forEach((box) => {
    const les = lessonFor(box.dataset.topic);
    const why = box.querySelector('.lesson-why');
    box.querySelectorAll('.lesson-opt').forEach((b) =>
      b.addEventListener('click', () => {
        const ok = Number(b.dataset.i) === les.check.answer;
        box.querySelectorAll('.lesson-opt').forEach((x) => {
          x.disabled = true;
          if (Number(x.dataset.i) === les.check.answer) x.classList.add('is-right');
        });
        if (!ok) b.classList.add('is-wrong');
        why.hidden = false;
        why.className = `lesson-why ${ok ? 'good' : 'bad'}`;
        why.innerHTML = `<b>${ok ? t('lesson.right') : t('lesson.wrong')}</b> ${esc(tx(les.check.why))}`;
      }),
    );
  });
}

/** Урок по одной теме в окне (кнопка «Повторить правило» в разборе ошибки). */
export function openLessonModal(topic) {
  if (!lessonFor(topic)) return;
  openModal({ title: `📖 ${esc(tx(skillName(topic)))}`, body: lessonHtml(topic, { withAnim: false }), actions: [{ label: t('lesson.done'), primary: true }] });
  bindLesson(document.getElementById('modal-root'));
}

/**
 * Урок на весь экран: по одной теме на странице, точки прогресса, «Дальше» и «К заданиям».
 * onDone вызывается и после последней темы, и по кнопке «Я уже знаю».
 */
export function runLesson(app, { topics, title, onDone, doneLabel = t('lesson.start') }) {
  const list = lessonTopics(topics);
  let i = 0;
  const finish = () => {
    markLessonsSeen(list);
    onDone();
  };
  const render = () => {
    const topic = list[i];
    const last = i === list.length - 1;
    app.innerHTML = `
      <section class="page lesson-page">
        <div class="lesson-top">
          <span class="lesson-kicker">${esc(title)}</span>
          <button type="button" class="btn btn-ghost btn-sm lesson-skip">${t('lesson.skip')} →</button>
        </div>
        <div class="lesson-card">
          <div class="lesson-head">
            ${mascot('happy', 'mascot-sm')}
            <div>
              <small>${t('lesson.title')}${list.length > 1 ? ` · ${t('lesson.of', { i: i + 1, n: list.length })}` : ''}</small>
              <h1>${esc(tx(skillName(topic)))}</h1>
            </div>
          </div>
          ${list.length > 1 ? `<div class="lesson-dots">${list.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</div>` : ''}
          ${lessonHtml(topic)}
          <div class="lesson-nav">
            ${i > 0 ? `<button type="button" class="btn btn-soft lesson-prev">← ${t('lesson.prev')}</button>` : '<span></span>'}
            <button type="button" class="btn btn-primary btn-lg lesson-next">${last ? `▶ ${doneLabel}` : `${t('lesson.next')} →`}</button>
          </div>
        </div>
      </section>`;
    bindLesson(app);
    app.querySelector('.lesson-skip').addEventListener('click', finish);
    app.querySelector('.lesson-prev')?.addEventListener('click', () => {
      i -= 1;
      render();
      window.scrollTo(0, 0);
    });
    app.querySelector('.lesson-next').addEventListener('click', () => {
      if (last) return finish();
      i += 1;
      render();
      window.scrollTo(0, 0);
    });
  };
  if (!list.length) {
    onDone();
    return { relabel() {}, cleanup() {} };
  }
  render();
  return { relabel: render, cleanup() {} };
}
