// Игровой экран: одно задание за раз, проверка, комбо, опыт, жизни, босс, таймер.
// Используется всеми режимами, кроме пробного экзамена и детектива.

import { confetti } from '../core/confetti.js';
import { t, tx } from '../core/i18n.js';
import { addXp, checkAchievements, getProfile, recordAnswer, saveProfile } from '../core/profile.js';
import { navigate, setLeaveGuard } from '../core/router.js';
import { sfx, vibrate } from '../core/sound.js';
import { checkAnswer } from '../engine/answer.js';
import { applyAnswer, createRun } from '../engine/session.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { bindQuestion, correctAnswerHtml, questionHtml } from '../ui/question.js';
import { openReference } from '../ui/reference.js';
import { renderResults } from '../ui/results.js';
import { mountSolution } from '../ui/solution.js';
import { langSwitchHtml } from '../ui/topbar.js';

const PRAISE_KEYS = ['fb.praise1', 'fb.praise2', 'fb.praise3', 'fb.praise4', 'fb.praise5', 'fb.praise6'];

/**
 * config:
 *  title, questions (массив) или stream + difficultyAt(i),
 *  lives, boss { icon, name }, timeLimit (сек), quick (быстрый режим без паузы на разбор),
 *  exitTo, onFinish(run, { reason }) → функция build для экрана результатов.
 */
export function runSession(app, config) {
  const {
    title,
    questions = null,
    stream = null,
    difficultyAt = () => 2,
    lives = null,
    boss = null,
    timeLimit = null,
    quick = false,
    exitTo = '/',
    onFinish,
  } = config;
  const total = questions ? questions.length : null;
  // Заголовок может быть функцией — тогда он переводится заново при смене языка.
  const titleText = () => (typeof title === 'function' ? title() : title);
  const run = createRun({ lives, bossHp: boss ? 100 : null });
  const state = {
    index: 0,
    q: null,
    binder: null,
    phase: 'answer',
    qStart: 0,
    timeLeft: timeLimit,
    last: null,
    end: false,
    finished: false,
    build: null,
    timer: null,
  };

  setLeaveGuard(() => state.finished || run.answered === 0 || confirm(t('session.leave')));
  document.body.classList.add('in-session');

  const el = {};

  function shell() {
    app.innerHTML = `
      <div class="session ${quick ? 'is-quick' : ''}">
        <header class="hud">
          <button type="button" class="icon-btn hud-close" aria-label="${t('session.close')}">✕</button>
          <div class="hud-progress" aria-hidden="true"><i></i></div>
          <div class="hud-right">
            ${lives !== null ? '<span class="hearts" aria-label="lives"></span>' : ''}
            ${timeLimit ? '<span class="hud-timer"></span>' : ''}
            <span class="combo-chip" hidden></span>
            <span class="xp-chip">⚡<b>0</b></span>
          </div>
        </header>
        ${
          boss
            ? `<div class="boss">
                <div class="boss-avatar" aria-hidden="true">${boss.icon}</div>
                <div class="boss-info"><div class="boss-name">${esc(tx(boss.name))}</div><div class="boss-hp"><i></i><span></span></div></div>
              </div>`
            : ''
        }
        <div class="session-title"><span>${esc(titleText())}</span><span class="q-counter"></span><button type="button" class="link-btn ref-btn" hidden>📏 ${t('ref.short')}</button>${langSwitchHtml('mini')}</div>
        <main class="q-area"></main>
        <footer class="answer-bar"><div class="answer-bar-inner"><button type="button" class="btn btn-primary btn-lg btn-check" disabled>${t('session.check')}</button></div></footer>
        <div class="sheet" hidden></div>
      </div>`;
    el.session = app.querySelector('.session');
    el.progress = app.querySelector('.hud-progress i');
    el.hearts = app.querySelector('.hearts');
    el.timer = app.querySelector('.hud-timer');
    el.combo = app.querySelector('.combo-chip');
    el.xp = app.querySelector('.xp-chip b');
    el.bossHp = app.querySelector('.boss-hp i');
    el.bossHpText = app.querySelector('.boss-hp span');
    el.bossAvatar = app.querySelector('.boss-avatar');
    el.counter = app.querySelector('.q-counter');
    el.area = app.querySelector('.q-area');
    el.check = app.querySelector('.btn-check');
    el.sheet = app.querySelector('.sheet');
    el.ref = app.querySelector('.ref-btn');
    app.querySelector('.hud-close').addEventListener('click', () => navigate(exitTo));
    el.check.addEventListener('click', () => (state.phase === 'answer' ? check() : proceed()));
    el.ref.addEventListener('click', openReference);
    updateHud();
  }

  function updateHud() {
    let progress = 0;
    if (total) progress = state.index / total;
    else if (boss) progress = 1 - run.bossHp / 100;
    else if (timeLimit) progress = 1 - state.timeLeft / timeLimit;
    else progress = Math.min(1, run.correct / 30);
    el.progress.style.width = `${Math.round(progress * 100)}%`;
    if (el.hearts) {
      el.hearts.innerHTML = Array.from({ length: run.maxLives }, (_, i) => `<span class="heart ${i < run.lives ? '' : 'lost'}">❤</span>`).join('');
    }
    if (el.timer) {
      el.timer.textContent = `⏱ ${state.timeLeft}`;
      el.timer.classList.toggle('is-low', state.timeLeft <= 10);
    }
    el.combo.hidden = run.combo < 2;
    el.combo.textContent = `🔥 ×${run.combo}`;
    el.xp.textContent = run.xp;
    if (el.bossHp) {
      el.bossHp.style.width = `${run.bossHp}%`;
      el.bossHpText.textContent = `${run.bossHp} HP`;
    }
    el.counter.textContent = total
      ? `${Math.min(state.phase === 'answer' ? state.index + 1 : state.index, total)} / ${total}`
      : `#${run.answered + (state.phase === 'answer' ? 1 : 0)}`;
  }

  function renderCurrent() {
    const q = state.q;
    el.area.innerHTML = questionHtml(q);
    el.area.firstElementChild.classList.add('slide-in');
    el.ref.hidden = q.section !== 'math';
    state.binder = bindQuestion(el.area, q, {
      onChange: (r) => {
        if (state.phase === 'answer') {
          el.check.disabled = r === null;
          sfx.select();
        }
      },
      onSubmit: () => (state.phase === 'answer' ? check() : proceed()),
    });
    el.sheet.hidden = true;
    el.check.disabled = true;
    el.check.textContent = t('session.check');
    el.check.className = 'btn btn-primary btn-lg btn-check';
    if (state.phase === 'feedback' && state.last) {
      state.binder.setResponse(state.last.response);
      state.binder.lock(state.last.correct);
      showFeedback();
    }
    updateHud();
  }

  function showQuestion() {
    state.phase = 'answer';
    state.last = null;
    state.q = questions ? questions[state.index] : stream.next(difficultyAt(run.answered));
    state.qStart = performance.now();
    renderCurrent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function floatXp(text, kind = 'xp') {
    const f = document.createElement('div');
    f.className = `float-text float-${kind}`;
    f.textContent = text;
    el.session.append(f);
    setTimeout(() => f.remove(), 1100);
  }

  function check() {
    if (state.phase !== 'answer' || state.binder.response === null) return;
    const q = state.q;
    const response = state.binder.response;
    const correct = checkAnswer(q, response);
    const timeMs = performance.now() - state.qStart;
    const result = applyAnswer(run, { question: q, correct, response, timeMs });
    recordAnswer(q.skill, correct);
    addXp(result.xp);
    const p = getProfile();
    p.counters.bestCombo = Math.max(p.counters.bestCombo, run.bestCombo);
    state.binder.lock(correct);
    state.last = { correct, response, result };
    state.phase = 'feedback';
    state.index += 1;
    state.end =
      (total !== null && state.index >= total) || result.outOfLives || result.bossDefeated || (timeLimit !== null && state.timeLeft <= 0);

    const card = el.area.firstElementChild;
    card.classList.remove('slide-in');
    if (correct) {
      card.classList.add('pop');
      sfx.correct(run.combo);
      floatXp(`+${result.xp} XP`);
      if (run.combo >= 3 && run.combo % 5 === 0) confetti({ y: 0.25, count: 60 });
      if (boss) {
        sfx.hit();
        el.bossAvatar.classList.remove('hit');
        void el.bossAvatar.offsetWidth;
        el.bossAvatar.classList.add('hit');
        floatXp(`−${result.damage}`, 'dmg');
      }
    } else {
      card.classList.add('shake');
      sfx.wrong();
      vibrate(120);
      el.session.classList.remove('flash-bad');
      void el.session.offsetWidth;
      el.session.classList.add('flash-bad');
    }
    updateHud();
    if (quick) {
      el.check.disabled = true;
      setTimeout(() => proceed(), correct ? 380 : 1100);
      return;
    }
    showFeedback();
  }

  function showFeedback() {
    const { correct, result } = state.last;
    const praise = t(PRAISE_KEYS[(run.answered * 7) % PRAISE_KEYS.length]);
    el.sheet.className = `sheet ${correct ? 'sheet-good' : 'sheet-bad'}`;
    el.sheet.hidden = false;
    el.sheet.innerHTML = `
      <div class="sheet-inner">
        <div class="sheet-head">
          ${mascot(correct ? 'win' : 'sad', 'mascot-sm')}
          <div>
            <div class="sheet-title">${correct ? praise : t('fb.wrong')}</div>
            <div class="sheet-sub">${
              correct
                ? `+${result.xp} XP${run.combo >= 3 ? ` · 🔥 ${t('fb.combo', { n: run.combo })}` : ''}`
                : `${t('fb.correctAnswer')}: ${correctAnswerHtml(state.q)}`
            }</div>
          </div>
        </div>
        <div class="sheet-solution"></div>
        <div class="sheet-actions">
          <button type="button" class="btn btn-soft btn-sol">${correct ? t('fb.showSolution') : t('fb.howToSolve')}</button>
        </div>
      </div>`;
    el.sheet.querySelector('.btn-sol').addEventListener('click', (e) => {
      mountSolution(el.sheet.querySelector('.sheet-solution'), state.q);
      e.currentTarget.remove();
    });
    if (!correct) {
      mountSolution(el.sheet.querySelector('.sheet-solution'), state.q);
      el.sheet.querySelector('.btn-sol').remove();
    }
    el.check.disabled = false;
    el.check.textContent = state.end ? t('session.finish') : t('session.continue');
    el.check.className = `btn btn-lg btn-check ${correct ? 'btn-success' : 'btn-danger'}`;
    el.check.focus({ preventScroll: true });
  }

  function proceed() {
    if (state.finished) return;
    if (state.end || (timeLimit !== null && state.timeLeft <= 0)) finish(timeLimit && state.timeLeft <= 0 ? 'time' : 'done');
    else showQuestion();
  }

  function finish(reason) {
    state.finished = true;
    state.phase = 'done';
    clearInterval(state.timer);
    document.body.classList.remove('in-session');
    state.build = onFinish(run, { reason });
    checkAchievements();
    saveProfile();
    renderResults(app, state.build);
    window.scrollTo(0, 0);
  }

  function onKey(e) {
    if (state.phase === 'done' || document.getElementById('modal-root')?.childElementCount) return;
    const q = state.q;
    if (state.phase === 'answer' && q?.type === 'mc') {
      const map = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
      const i = map[e.key.toLowerCase()];
      if (i !== undefined && !e.target.matches?.('input')) {
        state.binder.select(i);
        return;
      }
    }
    if (e.key === 'Enter' && !e.target.matches?.('input, button, a, summary')) {
      e.preventDefault();
      if (state.phase === 'answer') check();
      else if (!quick) proceed();
    }
  }
  document.addEventListener('keydown', onKey);

  if (timeLimit) {
    state.timer = setInterval(() => {
      if (state.finished) return;
      state.timeLeft -= 1;
      if (state.timeLeft <= 5 && state.timeLeft > 0) sfx.tick();
      updateHud();
      if (state.timeLeft <= 0) {
        clearInterval(state.timer);
        if (state.phase === 'answer' || quick) finish('time');
        else {
          state.end = true;
          el.check.textContent = t('session.finish');
        }
      }
    }, 1000);
  }

  shell();
  showQuestion();

  return {
    cleanup() {
      document.removeEventListener('keydown', onKey);
      clearInterval(state.timer);
      document.body.classList.remove('in-session');
    },
    relabel() {
      if (state.phase === 'done') {
        renderResults(app, state.build);
        return;
      }
      const response = state.binder?.response;
      shell();
      renderCurrent();
      if (state.phase === 'answer' && response !== null && response !== undefined) {
        state.binder.setResponse(response);
        el.check.disabled = false;
      }
    },
  };
}

/** Общие кнопки и статистика для экранов результатов. */
export function baseStats(run) {
  return [
    { icon: '✅', label: t('res.correct'), value: `${run.correct}/${run.answered}` },
    { icon: '🎯', label: t('res.accuracy'), value: `${run.answered ? Math.round((run.correct / run.answered) * 100) : 0}%` },
    { icon: '🔥', label: t('res.bestCombo'), value: run.bestCombo },
  ];
}

export function celebrate(win) {
  if (win) {
    sfx.win();
    confetti();
  } else {
    sfx.lose();
  }
}
