// Полный тест IELTS Academic Reading «как на экзамене»: три текста, 40 вопросов, 60 минут.
// На широком экране текст и вопросы стоят рядом, на телефоне — переключатель «Текст / Вопросы».
// Ответы можно менять до конца; в конце — band по шкале IELTS и разбор каждого вопроса с цитатой.

import { IELTS_BANDS } from '../catalog/mocks.js';
import { dayKey } from '../core/dates.js';
import { t } from '../core/i18n.js';
import { addXp, checkAchievements, getProfile, recordAnswer, saveProfile } from '../core/profile.js';
import { navigate, setLeaveGuard } from '../core/router.js';
import { sfx } from '../core/sound.js';
import { FULL_MINUTES, IELTS_TESTS, TFNG, YNNG, fullQuestions } from '../pools/ielts-full.js';
import { esc, formatTime } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { celebrate } from './play.js';

const LETTERS = 'ABCDEFGHIJ';
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
const TOPIC = 'r.ielts';

export const bandFor = (correct) => IELTS_BANDS.find(([n]) => correct >= n)?.[1] ?? (correct >= 1 ? 2 : 1);

/** Варианты ответа для вопроса: [{ value, label }]. */
function optionsOf(q) {
  if (q.type === 'tfng') return TFNG.map((label, value) => ({ value, label }));
  if (q.type === 'ynng') return YNNG.map((label, value) => ({ value, label }));
  if (q.type === 'mc') return q.item.choices.map((label, value) => ({ value, label: `${LETTERS[value]}  ${label}` }));
  if (q.type === 'heading') return q.options.map((label, value) => ({ value, label: `${ROMAN[value]}  ${label}` }));
  return q.options.map((label, value) => ({ value, label: `${LETTERS[value]}  ${label}` }));
}

const shortAnswer = (q, v) => {
  if (v === undefined || v === null) return '—';
  if (q.type === 'tfng') return TFNG[v];
  if (q.type === 'ynng') return YNNG[v];
  if (q.type === 'heading') return `${ROMAN[v]} · ${q.options[v]}`;
  if (q.type === 'mc') return `${LETTERS[v]} · ${q.item.choices[v]}`;
  return `${LETTERS[v]} · ${q.options[v]}`;
};

function questionLabel(q) {
  if (q.type === 'heading') return `${t('full.paragraph')} ${q.item.para}`;
  if (q.type === 'mc') return q.item.question;
  if (q.type === 'bank') return q.item.text;
  return q.item.statement;
}

/** Попытки по тесту: старые записи без номера теста относятся к тесту 1. */
const attemptsOf = (history, id) => history.filter((x) => (x.test ?? IELTS_TESTS[0].id) === id);
/** Тест, который стоит пройти следующим: первый ещё не пройденный, иначе тот, где лучший результат ниже. */
export function nextTest(history) {
  const fresh = IELTS_TESTS.find((tt) => !attemptsOf(history, tt.id).length);
  if (fresh) return fresh;
  return [...IELTS_TESTS].sort((a, b) => Math.max(...attemptsOf(history, a.id).map((x) => x.band)) - Math.max(...attemptsOf(history, b.id).map((x) => x.band)))[0];
}

export function fullReadRoute(app) {
  let test = IELTS_TESTS[0];
  let questions = fullQuestions(test);
  let state = null;
  let timer = null;

  function intro() {
    const p = getProfile();
    const history = p.fullReading ?? [];
    const best = history.reduce((m, x) => Math.max(m, x.band), 0);
    const suggested = nextTest(history);
    app.innerHTML = `
      <section class="page setup">
        <a class="crumb" href="#/c/ielts">← IELTS</a>
        <div class="setup-card wide full-intro">
          <div class="setup-icon">📄</div>
          <p class="track-kicker">IELTS Academic</p>
          <h1>${t('full.title')}</h1>
          <p class="muted">${t('full.desc')}</p>
          <ul class="diag-facts">
            <li>📚 ${t('full.f1')}</li>
            <li>⏱ ${t('full.f2', { n: FULL_MINUTES })}</li>
            <li>🧩 ${t('full.f3')}</li>
            <li>📊 ${t('full.f4')}</li>
          </ul>
          ${history.length ? `<p class="diag-last">${t('full.history', { n: history.length, best })}</p>` : ''}
          <h2 class="section-title">${t('full.pick', { n: IELTS_TESTS.length })}</h2>
          <div class="full-tests">${IELTS_TESTS.map((tt, i) => {
            const tries = attemptsOf(history, tt.id);
            const top = tries.length ? Math.max(...tries.map((x) => x.band)) : null;
            return `<button type="button" class="full-test ${tt === suggested ? 'is-suggested' : ''} ${top !== null ? 'is-done' : ''}" data-test="${tt.id}" style="--i:${i}">
              <span class="ft-num">${i + 1}</span>
              <span class="ft-text"><b>${t('full.testN', { n: i + 1 })}</b><small>${tt.passages.map((ps) => esc(ps.title)).join(' · ')}</small></span>
              <span class="ft-band">${top !== null ? `<b>${top}</b><small>band</small>` : tt === suggested ? `<em>${t('full.next')}</em>` : ''}</span>
            </button>`;
          }).join('')}</div>
          <p class="muted small">${t('full.tip')}</p>
        </div>
      </section>`;
    app.querySelectorAll('[data-test]').forEach((b) => b.addEventListener('click', () => start(b.dataset.test)));
  }

  function start(id = test.id) {
    test = IELTS_TESTS.find((tt) => tt.id === id) ?? IELTS_TESTS[0];
    questions = fullQuestions(test);
    state = { answers: {}, passage: 0, view: 'text', left: FULL_MINUTES * 60, startedAt: Date.now(), done: false };
    setLeaveGuard(() => state.done || !Object.keys(state.answers).length || confirm(t('session.leave')));
    document.body.classList.add('in-session');
    render();
    timer = setInterval(() => {
      state.left -= 1;
      const el = app.querySelector('.full-timer');
      if (el) {
        el.textContent = `⏱ ${formatTime(state.left * 1000)}`;
        el.classList.toggle('is-low', state.left <= 300);
      }
      if (state.left <= 0) finish();
    }, 1000);
  }

  function groupHtml(group, gi, pi) {
    const qs = questions.filter((q) => q.passage === pi && q.group === gi);
    const list =
      group.type === 'heading' || group.type === 'bank'
        ? `<div class="full-optlist"><b>${group.type === 'heading' ? t('full.headings') : t('full.wordList')}</b><ol class="${group.type === 'heading' ? 'roman' : 'alpha'}">${group.options.map((o) => `<li>${esc(o)}</li>`).join('')}</ol></div>`
        : '';
    return `<div class="full-group"><p class="full-intro-line">${esc(group.intro)}</p>${list}
      ${qs
        .map((q) => {
          const v = state.answers[q.n];
          return `<div class="full-q ${v !== undefined ? 'is-answered' : ''}" id="fq-${q.n}">
            <span class="full-n">${q.n}</span>
            <div class="full-q-body"><p>${esc(questionLabel(q))}</p>
              ${
                q.type === 'tfng' || q.type === 'ynng'
                  ? `<div class="full-pills" role="radiogroup">${optionsOf(q).map((o) => `<button type="button" role="radio" class="full-pill" aria-checked="${v === o.value}" data-q="${q.n}" data-v="${o.value}">${o.label}</button>`).join('')}</div>`
                  : `<select class="full-select" data-q="${q.n}" aria-label="${t('full.question')} ${q.n}"><option value="">${t('full.choose')}</option>${optionsOf(q)
                      .map((o) => `<option value="${o.value}" ${v === o.value ? 'selected' : ''}>${esc(o.label)}</option>`)
                      .join('')}</select>`
              }
            </div>
          </div>`;
        })
        .join('')}
    </div>`;
  }

  function render() {
    const passage = test.passages[state.passage];
    const answered = Object.keys(state.answers).length;
    app.innerHTML = `
      <section class="full-exam view-${state.view}">
        <header class="full-bar">
          <button type="button" class="icon-btn full-close" aria-label="${t('session.close')}">✕</button>
          <div class="full-tabs" role="tablist">${test.passages
            .map((p, i) => {
              const nums = questions.filter((q) => q.passage === i);
              const done = nums.filter((q) => state.answers[q.n] !== undefined).length;
              return `<button type="button" role="tab" class="full-tab ${i === state.passage ? 'is-active' : ''}" aria-selected="${i === state.passage}" data-passage="${i}">${t('full.passage')} ${i + 1}<small>${done}/${nums.length}</small></button>`;
            })
            .join('')}</div>
          <span class="full-timer">⏱ ${formatTime(state.left * 1000)}</span>
          <button type="button" class="btn btn-primary btn-sm full-finish">${t('full.finish')} · ${answered}/40</button>
        </header>
        <div class="full-switch" role="tablist">
          <button type="button" class="${state.view === 'text' ? 'is-active' : ''}" data-view="text">📖 ${t('full.text')}</button>
          <button type="button" class="${state.view === 'qs' ? 'is-active' : ''}" data-view="qs">✏️ ${t('full.questions')}</button>
        </div>
        <div class="full-split">
          <article class="full-text">
            <h2>${esc(passage.title)}</h2>
            ${passage.paras.map(([letter, text]) => `<p><b class="para-letter">${letter}</b>${esc(text)}</p>`).join('')}
          </article>
          <div class="full-questions">${passage.groups.map((g, gi) => groupHtml(g, gi, state.passage)).join('')}
            <div class="full-next">${
              state.passage < test.passages.length - 1
                ? `<button type="button" class="btn btn-soft" data-passage="${state.passage + 1}">${t('full.passage')} ${state.passage + 2} →</button>`
                : `<button type="button" class="btn btn-primary full-finish">${t('full.finish')}</button>`
            }</div>
          </div>
        </div>
      </section>`;
    bind();
  }

  function setAnswer(n, v) {
    if (v === null || Number.isNaN(v)) delete state.answers[n];
    else state.answers[n] = v;
    sfx.select();
    const btn = app.querySelectorAll('.full-finish')[0];
    if (btn) btn.textContent = `${t('full.finish')} · ${Object.keys(state.answers).length}/40`;
    app.querySelector(`#fq-${n}`)?.classList.toggle('is-answered', state.answers[n] !== undefined);
    const tab = app.querySelector(`.full-tab[data-passage="${state.passage}"] small`);
    if (tab) {
      const nums = questions.filter((q) => q.passage === state.passage);
      tab.textContent = `${nums.filter((q) => state.answers[q.n] !== undefined).length}/${nums.length}`;
    }
  }

  function bind() {
    app.querySelector('.full-close').addEventListener('click', () => navigate('/c/ielts'));
    app.querySelectorAll('[data-passage]').forEach((b) =>
      b.addEventListener('click', () => {
        state.passage = Number(b.dataset.passage);
        render();
        window.scrollTo(0, 0);
      }),
    );
    app.querySelectorAll('[data-view]').forEach((b) =>
      b.addEventListener('click', () => {
        state.view = b.dataset.view;
        app.querySelector('.full-exam').className = `full-exam view-${state.view}`;
        app.querySelectorAll('[data-view]').forEach((x) => x.classList.toggle('is-active', x === b));
        window.scrollTo(0, 0);
      }),
    );
    app.querySelectorAll('.full-pill').forEach((b) =>
      b.addEventListener('click', () => {
        const n = Number(b.dataset.q);
        const v = Number(b.dataset.v);
        const same = state.answers[n] === v;
        setAnswer(n, same ? null : v);
        b.parentElement.querySelectorAll('.full-pill').forEach((x) => x.setAttribute('aria-checked', String(!same && x === b)));
      }),
    );
    app.querySelectorAll('.full-select').forEach((sel) => sel.addEventListener('change', () => setAnswer(Number(sel.dataset.q), sel.value === '' ? null : Number(sel.value))));
    app.querySelectorAll('.full-finish').forEach((b) =>
      b.addEventListener('click', () => {
        const left = 40 - Object.keys(state.answers).length;
        if (left > 0 && !confirm(t('full.confirm', { n: left }))) return;
        finish();
      }),
    );
  }

  function finish() {
    if (state.done) return;
    state.done = true;
    clearInterval(timer);
    document.body.classList.remove('in-session');
    const review = questions.map((q) => ({ q, v: state.answers[q.n], ok: state.answers[q.n] === q.item.answer }));
    const correct = review.filter((r) => r.ok).length;
    const band = bandFor(correct);
    const p = getProfile();
    for (const r of review) if (r.v !== undefined) recordAnswer(TOPIC, r.ok);
    (p.fullReading ??= []).push({ test: test.id, date: dayKey(), correct, band, minutes: Math.round((Date.now() - state.startedAt) / 60000) });
    addXp(correct * 3);
    checkAchievements();
    saveProfile();
    celebrate(band >= 6);
    const perPassage = test.passages.map((_, i) => {
      const list = review.filter((r) => r.q.passage === i);
      return { c: list.filter((r) => r.ok).length, n: list.length };
    });
    app.innerHTML = `
      <section class="results page">
        <div class="results-hero mood-${band >= 6.5 ? 'win' : 'neutral'}">
          ${mascot(band >= 6.5 ? 'win' : 'happy', 'mascot-lg bounce-in')}
          <p class="hero-kicker">${t('full.testN', { n: IELTS_TESTS.indexOf(test) + 1 })}</p>
          <h1>${t('full.done')}</h1>
          <div class="band-badge"><small>${t('full.band')}</small><b>${band}</b></div>
          <p class="results-sub">${t('full.score', { c: correct })}</p>
          <div class="xp-earned">+${correct * 3} XP</div>
        </div>
        <div class="result-stats">${perPassage.map((x, i) => `<div class="result-stat"><span class="rs-icon">📖</span><b>${x.c}/${x.n}</b><span>${t('full.passage')} ${i + 1}</span></div>`).join('')}</div>
        <p class="muted small center">${t('full.scaleNote')}</p>
        <div class="result-actions">
          ${IELTS_TESTS.indexOf(test) < IELTS_TESTS.length - 1 ? `<button type="button" class="btn btn-primary full-next-test">${t('full.testN', { n: IELTS_TESTS.indexOf(test) + 2 })} →</button>` : ''}
          <button type="button" class="btn btn-soft full-again">↻ ${t('full.again')}</button>
          <button type="button" class="btn btn-soft full-list">📄 ${t('full.allTests')}</button>
          <a class="btn btn-soft" href="#/c/ielts">← IELTS</a>
        </div>
        <h2 class="section-title">${t('full.review')}</h2>
        <div class="full-review">${review
          .map(
            (r) => `<details class="full-rev ${r.ok ? 'is-ok' : 'is-bad'}">
              <summary><span class="full-n">${r.q.n}</span><span class="fr-text">${esc(questionLabel(r.q))}</span><span class="fr-mark">${r.ok ? '✓' : '✗'}</span></summary>
              <div class="fr-body">
                <p><span class="muted">${t('why.yours')}:</span> <b>${esc(shortAnswer(r.q, r.v))}</b></p>
                ${r.ok ? '' : `<p><span class="muted">${t('fb.correctAnswer')}:</span> <b>${esc(shortAnswer(r.q, r.q.item.answer))}</b></p>`}
                <p class="fr-quote">${t('full.where', { p: r.q.item.para })} <q>${esc(r.q.item.quote)}</q></p>
              </div>
            </details>`,
          )
          .join('')}</div>
      </section>`;
    app.querySelector('.full-again').addEventListener('click', () => start(test.id));
    app.querySelector('.full-next-test')?.addEventListener('click', () => start(IELTS_TESTS[IELTS_TESTS.indexOf(test) + 1].id));
    app.querySelector('.full-list').addEventListener('click', () => {
      state = null;
      intro();
      window.scrollTo(0, 0);
    });
    window.scrollTo(0, 0);
  }

  intro();
  return {
    cleanup: () => {
      clearInterval(timer);
      document.body.classList.remove('in-session');
    },
    relabel: () => (state && !state.done ? render() : state?.done ? null : intro()),
  };
}

/** Карточка на странице IELTS. */
export function fullReadCardHtml(course) {
  if (course.id !== 'ielts') return '';
  const history = getProfile().fullReading ?? [];
  const last = history.at(-1);
  return `<a class="mock-card full-card" href="#/ielts-full" style="--c:${course.color}">
    <span class="mock-card-icon" aria-hidden="true">📄</span>
    <span class="mock-card-text"><b>${t('full.title')}</b><small>${last ? t('full.lastBand', { band: last.band, c: last.correct }) : t('full.cardDesc')}</small></span>
    <span class="daily-go">→</span>
  </a>`;
}
