// «Грамматический детектив»: найди неправильное слово, пока не вышло время.

import { t } from '../core/i18n.js';
import { addXp, checkAchievements, getProfile, saveProfile } from '../core/profile.js';
import { createRng, newSeed, shuffle } from '../core/random.js';
import { navigate, setLeaveGuard } from '../core/router.js';
import { sfx, vibrate } from '../core/sound.js';
import { DETECTIVE } from '../content/detective.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { renderResults } from '../ui/results.js';
import { langSwitchHtml } from '../ui/topbar.js';
import { celebrate } from './play.js';

export const ROUND = 8;
export const SECONDS = 20;
const STRIP = /^[“”"(]+|[.,!?;:“”")]+$/g;

export function tokenize(text) {
  return text.split(' ').map((raw) => ({ raw, word: raw.replace(STRIP, '') }));
}

export function errorIndex(item) {
  return tokenize(item.text).findIndex((tok) => tok.word === item.wrong);
}

export function detectiveRoute(app) {
  const st = { view: 'intro', items: [], i: 0, score: 0, found: 0, timeLeft: SECONDS, timer: null, picked: null, solLang: 'en', finished: false, build: null, log: [] };
  setLeaveGuard(() => st.view !== 'play' || confirm(t('session.leave')));

  function intro() {
    st.view = 'intro';
    app.innerHTML = `
      <section class="page setup">
        <div class="setup-card">
          <div class="setup-icon">🕵️</div>
          <h1>${t('det.title')}</h1>
          <p class="muted">${t('det.desc')}</p>
          <ul class="rules"><li>${t('det.rule1', { n: ROUND })}</li><li>${t('det.rule2', { s: SECONDS })}</li><li>${t('det.rule3')}</li></ul>
          <div class="record">🏆 ${t('mode.record')}: <b>${getProfile().records.detective}</b></div>
          <button type="button" class="btn btn-primary btn-xl start-btn">🔎 ${t('det.start')}</button>
        </div>
      </section>`;
    app.querySelector('.start-btn').addEventListener('click', start);
  }

  function start() {
    st.items = shuffle(DETECTIVE, createRng(newSeed())).slice(0, ROUND);
    st.i = 0;
    st.score = 0;
    st.found = 0;
    st.log = [];
    st.view = 'play';
    document.body.classList.add('in-session');
    next();
  }

  function next() {
    st.picked = null;
    st.solLang = 'en';
    st.timeLeft = SECONDS;
    renderPlay();
    clearInterval(st.timer);
    st.timer = setInterval(() => {
      st.timeLeft -= 1;
      const el = app.querySelector('.det-timer');
      if (el) {
        el.textContent = `⏱ ${st.timeLeft}`;
        el.classList.toggle('is-low', st.timeLeft <= 5);
      }
      const bar = app.querySelector('.det-time i');
      if (bar) bar.style.width = `${(st.timeLeft / SECONDS) * 100}%`;
      if (st.timeLeft <= 0) pick(-1);
    }, 1000);
  }

  function renderPlay() {
    const item = st.items[st.i];
    const tokens = tokenize(item.text);
    const answer = errorIndex(item);
    const done = st.picked !== null;
    const correct = st.picked === answer;
    app.innerHTML = `
      <div class="session detective">
        <header class="hud">
          <button type="button" class="icon-btn hud-close" aria-label="${t('session.close')}">✕</button>
          <div class="hud-progress"><i style="width:${(st.i / ROUND) * 100}%"></i></div>
          <div class="hud-right"><span class="det-timer ${st.timeLeft <= 5 ? 'is-low' : ''}">⏱ ${st.timeLeft}</span><span class="xp-chip">🕵️<b>${st.score}</b></span></div>
        </header>
        <div class="session-title"><span>${t('det.title')}</span><span class="q-counter">${st.i + 1} / ${ROUND}</span>${langSwitchHtml('mini')}</div>
        <div class="det-time"><i style="width:${(st.timeLeft / SECONDS) * 100}%"></i></div>
        <p class="det-hint">${t('det.tap')}</p>
        <div class="det-sentence ${done ? 'is-done' : ''}">
          ${tokens
            .map((tok, i) => {
              let cls = 'tok';
              if (done && i === answer) cls += ' is-error';
              if (done && i === st.picked && !correct) cls += ' is-miss';
              return `<button type="button" class="${cls}" data-tok="${i}" ${done ? 'disabled' : ''}>${esc(tok.raw)}</button>`;
            })
            .join(' ')}
        </div>
        ${
          done
            ? `<div class="det-feedback ${correct ? 'good' : 'bad'}">
                <div class="det-fb-head">${mascot(correct ? 'win' : 'sad', 'mascot-sm')}<div><b>${correct ? t('det.found') : st.picked === -1 ? t('det.timeout') : t('det.miss')}</b>
                <div>${t('det.fix')}: <s>${esc(item.wrong)}</s> → <b>${esc(item.fix)}</b></div></div></div>
                <div class="solution">
                  <div class="sol-head"><span class="sol-title">💡 ${t('sol.title')}</span><div class="sol-langs">${['en', 'ru', 'kk'].map((l) => `<button type="button" class="sol-lang ${l === st.solLang ? 'is-active' : ''}" data-l="${l}">${l === 'kk' ? 'KZ' : l.toUpperCase()}</button>`).join('')}</div></div>
                  <div class="sol-body"><p>${esc(item.ex[st.solLang])}</p></div>
                </div>
              </div>`
            : ''
        }
        <footer class="answer-bar"><div class="answer-bar-inner">
          ${done ? `<button type="button" class="btn btn-lg btn-check ${correct ? 'btn-success' : 'btn-danger'} next-btn">${st.i + 1 < ROUND ? t('session.continue') : t('session.finish')}</button>` : `<button type="button" class="btn btn-soft btn-lg btn-check" disabled>${t('det.waiting')}</button>`}
        </div></footer>
      </div>`;
    app.querySelector('.hud-close').addEventListener('click', () => navigate('/'));
    app.querySelectorAll('[data-tok]').forEach((b) => b.addEventListener('click', () => pick(Number(b.dataset.tok))));
    app.querySelectorAll('[data-l]').forEach((b) =>
      b.addEventListener('click', () => {
        if (b.dataset.l !== 'en' && st.solLang === 'en') {
          getProfile().counters.langSwitch += 1;
          saveProfile();
        }
        st.solLang = b.dataset.l;
        renderPlay();
      }),
    );
    app.querySelector('.next-btn')?.addEventListener('click', advance);
    app.querySelector('.next-btn')?.focus({ preventScroll: true });
  }

  function pick(i) {
    if (st.picked !== null) return;
    clearInterval(st.timer);
    const item = st.items[st.i];
    st.picked = i;
    const correct = i === errorIndex(item);
    if (correct) {
      st.found += 1;
      const gained = 10 + st.timeLeft;
      st.score += gained;
      addXp(Math.round(gained / 2));
      sfx.correct(st.found);
    } else {
      sfx.wrong();
      vibrate(120);
    }
    st.log.push({ correct });
    renderPlay();
  }

  function advance() {
    st.i += 1;
    if (st.i < ROUND) next();
    else finish();
  }

  function finish() {
    clearInterval(st.timer);
    st.view = 'done';
    document.body.classList.remove('in-session');
    const p = getProfile();
    p.counters.detectiveFound += st.found;
    const isRecord = st.score > p.records.detective;
    if (isRecord) p.records.detective = st.score;
    checkAchievements();
    saveProfile();
    celebrate(st.found >= ROUND / 2);
    st.build = () => ({
      mood: st.found >= ROUND / 2 ? 'win' : 'neutral',
      title: isRecord ? t('res.newRecord') : t('det.over'),
      subtitle: t('det.result', { f: st.found, n: ROUND }),
      stats: [
        { icon: '🔎', label: t('det.foundLabel'), value: `${st.found}/${ROUND}` },
        { icon: '⭐', label: t('det.points'), value: st.score },
        { icon: '🏆', label: t('mode.record'), value: p.records.detective },
      ],
      actions: [
        { label: `↻ ${t('res.again')}`, onClick: () => navigate('/detective'), primary: true },
        { label: `🏠 ${t('res.home')}`, href: '/' },
      ],
    });
    renderResults(app, st.build);
  }

  function onKey(e) {
    if (st.view === 'play' && st.picked !== null && e.key === 'Enter' && !e.target.matches?.('button')) advance();
  }
  document.addEventListener('keydown', onKey);

  intro();
  return {
    cleanup() {
      clearInterval(st.timer);
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('in-session');
    },
    relabel() {
      if (st.view === 'intro') intro();
      else if (st.view === 'play') renderPlay();
      else renderResults(app, st.build);
    },
  };
}
