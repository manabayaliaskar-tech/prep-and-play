// Квиз «Всё обо всём»: вопросы из разных предметов подряд.
// Режимы: классика (10 вопросов, сложность 1–10), блиц (60 секунд), выживание (3 жизни, сложность растёт),
// свой квиз (выбранные предметы) и квиз дня (одинаковый для всех).
// Вопросы, которые игрок уже видел, запоминаются и не выдаются снова, пока есть новые.

import { dayKey } from '../core/dates.js';
import { t, tx } from '../core/i18n.js';
import { addXp, getProfile, saveProfile, todayStats } from '../core/profile.js';
import { createRng, newSeed } from '../core/random.js';
import { navigate } from '../core/router.js';
import { storage } from '../core/storage.js';
import { starsFor } from '../engine/session.js';
import { DAILY_QUIZ_LEVEL, QUIZ_COUNT, QUIZ_LEVELS, QUIZ_POOLS, QuizStream, buildQuiz, bySubject, dailyQuiz, survivalLevel } from '../pools/quiz.js';
import { L } from '../pools/gen.js';
import { POOLS } from '../pools/topics.js';
import { baseStats, celebrate, runSession } from './play.js';
import { esc } from '../ui/dom.js';

const SUBJECT_ICONS = ['📐', '⚛️', '⚗️', '🧬', '🌍', '📜', '🔤', '💻', '⚖️', '🏆'];

export const QUIZ_MODES = [
  { id: 'classic', icon: '🎯' },
  { id: 'blitz', icon: '⚡' },
  { id: 'survival', icon: '❤️' },
  { id: 'custom', icon: '🧩' },
  { id: 'daily', icon: '📅' },
];

export const POOL_NAMES = {
  math: L('Math', 'Математика', 'Математика'),
  physics: L('Physics', 'Физика', 'Физика'),
  chemistry: L('Chemistry', 'Химия', 'Химия'),
  biology: L('Biology', 'Биология', 'Биология'),
  geography: L('Geography', 'География', 'География'),
  history: L('History', 'История', 'Тарих'),
  english: L('English', 'Английский', 'Ағылшын тілі'),
  informatics: L('Computer science', 'Информатика', 'Информатика'),
  social: L('Social studies', 'Обществознание', 'Қоғамтану'),
  olymp: L('Brain teasers', 'Головоломки', 'Басқатырғыштар'),
  code: L('Programming', 'Программирование', 'Бағдарламалау'),
};

const BLITZ_SECONDS = 60;
const DAILY_BONUS = 50;
const SEEN_LIMIT = 1500;

// ---------- История показанных вопросов ----------

export function seenSet() {
  const list = storage.get('quizSeen', []);
  return new Set(Array.isArray(list) ? list : []);
}

export function rememberSeen(ids) {
  const list = storage.get('quizSeen', []);
  const next = [...(Array.isArray(list) ? list : []), ...ids].slice(-SEEN_LIMIT);
  storage.set('quizSeen', next);
}

// ---------- Рекорды ----------

function records() {
  const r = getProfile().records;
  r.quiz ??= {};
  r.quizBlitz ??= 0;
  r.quizSurvival ??= 0;
  r.quizDaily ??= {};
  return r;
}

/** Классика: лучший счёт на каждой сложности. Возвращает true, если это рекорд. */
export function saveQuizResult(level, correct) {
  const p = getProfile();
  const best = (p.records.quiz ??= {});
  const isRecord = correct > (best[level] ?? -1);
  if (isRecord) best[level] = correct;
  countGame(p);
  return isRecord;
}

function countGame(p = getProfile()) {
  p.counters.quizzes = (p.counters.quizzes ?? 0) + 1;
  todayStats().quizzes += 1;
}

/** Блиц и выживание: один общий рекорд. */
export function saveModeRecord(mode, value) {
  const r = records();
  const key = mode === 'blitz' ? 'quizBlitz' : 'quizSurvival';
  const isRecord = value > r[key];
  if (isRecord) r[key] = value;
  countGame();
  return isRecord;
}

/** Квиз дня: засчитывается первая попытка за день. Возвращает true, если она первая. */
export function saveDailyQuiz(day, correct) {
  const r = records();
  const first = r.quizDaily[day] === undefined;
  if (first) r.quizDaily[day] = correct;
  countGame();
  return first;
}

const levelName = (level) => t(level <= 3 ? 'quiz.easy' : level <= 7 ? 'quiz.medium' : 'quiz.hard');

/** Сводка по предметам на экране результатов. */
function subjectsHtml(log) {
  const rows = bySubject(log);
  if (!rows.length) return '';
  return `
    <section class="quiz-breakdown">
      <h2>${t('quiz.bySubject')}</h2>
      <div class="qb-list">
        ${rows
          .map((r) => {
            const pct = Math.round((r.correct / r.total) * 100);
            // Цвет программирования почти чёрный — в тёмной теме полоса была бы не видна.
            const color = r.pool === 'code' ? '#64748b' : (POOLS[r.pool]?.color ?? '#7c3aed');
            return `<div class="qb-row" style="--c:${color}">
              <span class="qb-icon" aria-hidden="true">${esc(POOLS[r.pool]?.icon ?? '❓')}</span>
              <span class="qb-name">${tx(POOL_NAMES[r.pool] ?? L(r.pool, r.pool, r.pool))}</span>
              <span class="qb-bar"><i style="width:${pct}%"></i></span>
              <b>${r.correct}/${r.total}</b>
            </div>`;
          })
          .join('')}
      </div>
    </section>`;
}

export function quizRoute(app, params = {}) {
  let mode = QUIZ_MODES.some((m) => m.id === params.mode) ? params.mode : storage.get('quizMode', 'classic');
  if (!QUIZ_MODES.some((m) => m.id === mode)) mode = 'classic';
  let level = storage.get('quizLevel', 3);
  if (!(level >= 1 && level <= QUIZ_LEVELS)) level = 3;
  let pools = storage.get('quizPools', QUIZ_POOLS);
  if (!Array.isArray(pools) || !pools.some((p) => QUIZ_POOLS.includes(p))) pools = [...QUIZ_POOLS];
  pools = pools.filter((p) => QUIZ_POOLS.includes(p));
  let session = null;

  const again = () => navigate(`/quiz/${mode}`);
  const finishStats = (run) => {
    rememberSeen(run.log.map((e) => e.question.id));
    return subjectsHtml(run.log);
  };

  function startClassic(custom = false) {
    const questions = buildQuiz({ rng: createRng(newSeed()), level, seen: seenSet(), pools: custom ? pools : null });
    session = runSession(app, {
      title: () => `${custom ? '🧩' : '🎲'} ${t(custom ? 'quiz.mode.custom' : 'quiz.title')} · ${level}/10`,
      questions,
      catalog: true,
      exitTo: '/quiz',
      onFinish: (run) => {
        const extra = finishStats(run);
        const isRecord = custom ? (countGame(), false) : saveQuizResult(level, run.correct);
        saveProfile();
        celebrate(run.correct >= 7);
        return () => ({
          mood: run.correct >= 7 ? 'win' : run.correct >= 4 ? 'neutral' : 'lose',
          title: run.correct === QUIZ_COUNT ? t('quiz.perfect') : isRecord ? t('res.newRecord') : t('quiz.done'),
          subtitle: t('quiz.result', { c: run.correct, n: QUIZ_COUNT, level }),
          stars: starsFor(run.correct, QUIZ_COUNT),
          xp: run.xp,
          stats: [...baseStats(run), ...(custom ? [] : [{ icon: '🏆', label: t('quiz.bestHere'), value: `${getProfile().records.quiz[level]}/${QUIZ_COUNT}` }])],
          extraHtml: extra,
          log: run.log,
          actions: [
            ...(run.correct >= 7 && level < QUIZ_LEVELS
              ? [{ label: `${t('quiz.harder')} →`, onClick: () => { level += 1; storage.set('quizLevel', level); again(); }, primary: true }]
              : []),
            { label: `↻ ${t('quiz.again')}`, onClick: again, primary: !(run.correct >= 7 && level < QUIZ_LEVELS) },
            { label: `🏠 ${t('res.home')}`, href: '/' },
          ],
        });
      },
    });
  }

  function startBlitz() {
    const stream = new QuizStream({ rng: createRng(newSeed()), seen: seenSet() });
    session = runSession(app, {
      title: () => `⚡ ${t('quiz.mode.blitz')} · ${level}/10`,
      stream: { next: () => stream.next(level) },
      timeLimit: BLITZ_SECONDS,
      quick: true,
      catalog: true,
      exitTo: '/quiz',
      onFinish: (run) => {
        const extra = finishStats(run);
        const isRecord = saveModeRecord('blitz', run.correct);
        saveProfile();
        celebrate(isRecord || run.correct >= 10);
        return () => ({
          mood: run.correct >= 10 ? 'win' : run.correct >= 5 ? 'neutral' : 'lose',
          title: isRecord ? t('res.newRecord') : t('quiz.timeUp'),
          subtitle: t('quiz.blitzResult', { c: run.correct, n: run.answered }),
          xp: run.xp,
          stats: [...baseStats(run), { icon: '🏆', label: t('quiz.record'), value: records().quizBlitz }],
          extraHtml: extra,
          log: run.log,
          actions: [
            { label: `↻ ${t('quiz.again')}`, onClick: again, primary: true },
            { label: `🏠 ${t('res.home')}`, href: '/' },
          ],
        });
      },
    });
  }

  function startSurvival() {
    const stream = new QuizStream({ rng: createRng(newSeed()), seen: seenSet() });
    const start = level;
    session = runSession(app, {
      title: () => `❤️ ${t('quiz.mode.survival')}`,
      stream: { next: (answered) => stream.next(survivalLevel(answered, start)) },
      difficultyAt: (answered) => answered,
      lives: 3,
      catalog: true,
      exitTo: '/quiz',
      onFinish: (run) => {
        const extra = finishStats(run);
        const isRecord = saveModeRecord('survival', run.correct);
        saveProfile();
        celebrate(isRecord || run.correct >= 10);
        return () => ({
          mood: run.correct >= 10 ? 'win' : run.correct >= 5 ? 'neutral' : 'lose',
          title: isRecord ? t('res.newRecord') : t('quiz.survivalOver'),
          subtitle: t('quiz.survivalResult', { c: run.correct, level: survivalLevel(run.answered, start) }),
          xp: run.xp,
          stats: [...baseStats(run), { icon: '🏆', label: t('quiz.record'), value: records().quizSurvival }],
          extraHtml: extra,
          log: run.log,
          actions: [
            { label: `↻ ${t('quiz.again')}`, onClick: again, primary: true },
            { label: `🏠 ${t('res.home')}`, href: '/' },
          ],
        });
      },
    });
  }

  function startDaily() {
    const day = dayKey();
    session = runSession(app, {
      title: () => `📅 ${t('quiz.mode.daily')}`,
      questions: dailyQuiz(day),
      catalog: true,
      exitTo: '/quiz',
      onFinish: (run) => {
        const extra = finishStats(run);
        const first = saveDailyQuiz(day, run.correct);
        const bonus = first ? addXp(DAILY_BONUS) : 0;
        saveProfile();
        celebrate(run.correct >= 7);
        return () => ({
          mood: run.correct >= 7 ? 'win' : run.correct >= 4 ? 'neutral' : 'lose',
          title: run.correct === QUIZ_COUNT ? t('quiz.perfect') : t('quiz.dailyDone'),
          subtitle: t('quiz.result', { c: run.correct, n: QUIZ_COUNT, level: DAILY_QUIZ_LEVEL }),
          stars: starsFor(run.correct, QUIZ_COUNT),
          xp: run.xp + bonus,
          stats: [...baseStats(run), { icon: '🎁', label: t('quiz.dailyBonus'), value: first ? `+${DAILY_BONUS} XP` : '—' }],
          extraHtml: `${extra}<p class="muted small quiz-daily-note">${t('quiz.dailyNote')}</p>`,
          log: run.log,
          actions: [
            { label: `🎯 ${t('quiz.mode.classic')}`, onClick: () => navigate('/quiz/classic'), primary: true },
            { label: `🏠 ${t('res.home')}`, href: '/' },
          ],
        });
      },
    });
  }

  function start() {
    if (mode === 'blitz') startBlitz();
    else if (mode === 'survival') startSurvival();
    else if (mode === 'daily') startDaily();
    else startClassic(mode === 'custom');
  }

  const modeRecord = (id) => {
    const r = records();
    if (id === 'classic') {
      const best = Object.values(r.quiz);
      return best.length ? `${Math.max(...best)}/${QUIZ_COUNT}` : '—';
    }
    if (id === 'blitz') return r.quizBlitz || '—';
    if (id === 'survival') return r.quizSurvival || '—';
    if (id === 'daily') return r.quizDaily[dayKey()] !== undefined ? `✔ ${r.quizDaily[dayKey()]}/${QUIZ_COUNT}` : t('quiz.dailyNew');
    return `${pools.length}/${QUIZ_POOLS.length}`;
  };

  const render = () => {
    const best = records().quiz;
    const dailyDone = records().quizDaily[dayKey()] !== undefined;
    const levelPicker = `
      <div class="quiz-levels" role="radiogroup" aria-label="${t('quiz.pick')}">
        ${Array.from({ length: QUIZ_LEVELS }, (_, i) => i + 1)
          .map(
            (k) => `<button type="button" role="radio" class="quiz-level" data-level="${k}" aria-checked="${k === level}" style="--k:${k}">
              <b>${k}</b>${mode === 'classic' && best[k] !== undefined ? `<small>${best[k]}/${QUIZ_COUNT}</small>` : '<small>&nbsp;</small>'}
            </button>`,
          )
          .join('')}
      </div>
      <p class="quiz-level-name"><b>${t(mode === 'survival' ? 'quiz.startLevel' : 'quiz.level', { n: level })}</b> · ${levelName(level)}</p>`;
    const poolPicker = `
      <div class="quiz-pools" role="group" aria-label="${t('quiz.pickSubjects')}">
        ${QUIZ_POOLS.map(
          (p) => `<button type="button" class="quiz-pool ${pools.includes(p) ? 'is-on' : ''}" data-pool="${p}" aria-pressed="${pools.includes(p)}" style="--c:${p === 'code' ? '#64748b' : (POOLS[p]?.color ?? '#7c3aed')}">
            <span aria-hidden="true">${esc(POOLS[p]?.icon ?? '')}</span>${tx(POOL_NAMES[p])}</button>`,
        ).join('')}
      </div>`;
    app.innerHTML = `
      <section class="page setup quiz-page">
        <div class="setup-card wide quiz-setup">
          <div class="quiz-orbit" aria-hidden="true">${SUBJECT_ICONS.map((icon, i) => `<span style="--i:${i};--n:${SUBJECT_ICONS.length}">${icon}</span>`).join('')}<b>🎲</b></div>
          <h1>${t('quiz.title')}</h1>
          <p class="muted">${t('quiz.desc2')}</p>
          <div class="quiz-modes" role="radiogroup" aria-label="${t('quiz.pickMode')}">
            ${QUIZ_MODES.map(
              (m) => `<button type="button" role="radio" class="quiz-mode ${m.id === 'daily' && !dailyDone ? 'is-new' : ''}" data-mode="${m.id}" aria-checked="${m.id === mode}">
                <span class="qm-icon" aria-hidden="true">${m.icon}</span>
                <b>${t(`quiz.mode.${m.id}`)}</b>
                <small>${t(`quiz.mode.${m.id}Desc`)}</small>
                <span class="qm-record">🏆 ${modeRecord(m.id)}</span>
              </button>`,
            ).join('')}
          </div>
          <div class="quiz-options">
            ${mode === 'daily' ? `<p class="quiz-daily-info">📅 ${t(dailyDone ? 'quiz.dailyAgain' : 'quiz.dailyInfo', { n: QUIZ_COUNT, level: DAILY_QUIZ_LEVEL, xp: DAILY_BONUS })}</p>` : ''}
            ${mode === 'custom' ? poolPicker : ''}
            ${mode !== 'daily' ? levelPicker : ''}
          </div>
          <button type="button" class="btn btn-primary btn-xl start-btn" ${mode === 'custom' && !pools.length ? 'disabled' : ''}>▶ ${t(`quiz.go.${mode}`)}</button>
        </div>
      </section>`;
    app.querySelectorAll('[data-mode]').forEach((b) =>
      b.addEventListener('click', () => {
        mode = b.dataset.mode;
        storage.set('quizMode', mode);
        history.replaceState(null, '', `#/quiz/${mode}`);
        render();
      }),
    );
    app.querySelectorAll('[data-level]').forEach((b) =>
      b.addEventListener('click', () => {
        level = Number(b.dataset.level);
        storage.set('quizLevel', level);
        render();
      }),
    );
    app.querySelectorAll('[data-pool]').forEach((b) =>
      b.addEventListener('click', () => {
        const p = b.dataset.pool;
        pools = pools.includes(p) ? pools.filter((x) => x !== p) : [...pools, p];
        storage.set('quizPools', pools);
        render();
      }),
    );
    app.querySelector('.start-btn').addEventListener('click', start);
  };
  render();
  return { cleanup: () => session?.cleanup(), relabel: () => (session ? session.relabel() : render()) };
}
