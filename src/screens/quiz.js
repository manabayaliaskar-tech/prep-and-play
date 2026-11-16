// Квиз «Всё обо всём»: выбор сложности от 1 до 10, затем 10 вопросов из разных предметов.

import { t } from '../core/i18n.js';
import { getProfile, saveProfile, todayStats } from '../core/profile.js';
import { createRng, newSeed } from '../core/random.js';
import { navigate } from '../core/router.js';
import { storage } from '../core/storage.js';
import { starsFor } from '../engine/session.js';
import { QUIZ_COUNT, QUIZ_LEVELS, buildQuiz } from '../pools/quiz.js';
import { baseStats, celebrate, runSession } from './play.js';

const SUBJECT_ICONS = ['📐', '⚛️', '⚗️', '🧬', '🌍', '📜', '🔤', '💻'];

/** Сохраняет результат квиза: лучший счёт на каждой сложности. */
export function saveQuizResult(level, correct) {
  const p = getProfile();
  const best = (p.records.quiz ??= {});
  const isRecord = correct > (best[level] ?? -1);
  if (isRecord) best[level] = correct;
  p.counters.quizzes = (p.counters.quizzes ?? 0) + 1;
  todayStats().quizzes += 1;
  return isRecord;
}

const levelName = (level) => t(level <= 3 ? 'quiz.easy' : level <= 7 ? 'quiz.medium' : 'quiz.hard');

export function quizRoute(app) {
  let level = storage.get('quizLevel', 3);
  if (!(level >= 1 && level <= QUIZ_LEVELS)) level = 3;
  let session = null;

  function start() {
    session = runSession(app, {
      title: () => `🎲 ${t('quiz.title')} · ${level}/10`,
      questions: buildQuiz({ rng: createRng(newSeed()), level }),
      catalog: true,
      exitTo: '/quiz',
      onFinish: (run) => {
        const isRecord = saveQuizResult(level, run.correct);
        saveProfile();
        celebrate(run.correct >= 7);
        const stars = starsFor(run.correct, QUIZ_COUNT);
        return () => ({
          mood: run.correct >= 7 ? 'win' : run.correct >= 4 ? 'neutral' : 'lose',
          title: run.correct === QUIZ_COUNT ? t('quiz.perfect') : isRecord ? t('res.newRecord') : t('quiz.done'),
          subtitle: t('quiz.result', { c: run.correct, n: QUIZ_COUNT, level }),
          stars,
          xp: run.xp,
          stats: [...baseStats(run), { icon: '🏆', label: t('quiz.bestHere'), value: `${getProfile().records.quiz[level]}/${QUIZ_COUNT}` }],
          log: run.log,
          actions: [
            ...(run.correct >= 7 && level < QUIZ_LEVELS ? [{ label: `${t('quiz.harder')} →`, onClick: () => { level += 1; storage.set('quizLevel', level); navigate('/quiz'); }, primary: true }] : []),
            { label: `↻ ${t('quiz.again')}`, onClick: () => navigate('/quiz'), primary: !(run.correct >= 7 && level < QUIZ_LEVELS) },
            { label: `🏠 ${t('res.home')}`, href: '/' },
          ],
        });
      },
    });
  }

  const render = () => {
    const best = getProfile().records.quiz ?? {};
    app.innerHTML = `
      <section class="page setup">
        <div class="setup-card wide quiz-setup">
          <div class="quiz-orbit" aria-hidden="true">${SUBJECT_ICONS.map((icon, i) => `<span style="--i:${i}">${icon}</span>`).join('')}<b>🎲</b></div>
          <h1>${t('quiz.title')}</h1>
          <p class="muted">${t('quiz.desc', { n: QUIZ_COUNT })}</p>
          <div class="quiz-levels" role="radiogroup" aria-label="${t('quiz.pick')}">
            ${Array.from({ length: QUIZ_LEVELS }, (_, i) => i + 1)
              .map(
                (k) => `<button type="button" role="radio" class="quiz-level" data-level="${k}" aria-checked="${k === level}" style="--k:${k}">
                  <b>${k}</b>${best[k] !== undefined ? `<small>${best[k]}/${QUIZ_COUNT}</small>` : '<small>&nbsp;</small>'}
                </button>`,
              )
              .join('')}
          </div>
          <p class="quiz-level-name"><b>${t('quiz.level', { n: level })}</b> · ${levelName(level)}</p>
          <button type="button" class="btn btn-primary btn-xl start-btn">▶ ${t('quiz.start')}</button>
        </div>
      </section>`;
    app.querySelectorAll('[data-level]').forEach((b) =>
      b.addEventListener('click', () => {
        level = Number(b.dataset.level);
        storage.set('quizLevel', level);
        render();
      }),
    );
    app.querySelector('.start-btn').addEventListener('click', start);
  };
  render();
  return { cleanup: () => session?.cleanup(), relabel: () => (session ? session.relabel() : render()) };
}
