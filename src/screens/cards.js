// Экран карточек слов: выбор уровня, переворот карточки, «Знал» / «Не знал», итог.

import { sayButton } from '../core/voice.js';
import { DECK_COURSE, DECK_LANGS, deckStats, rateCard, sessionCards } from '../core/cards.js';
import { courseById, courseHref } from '../catalog/index.js';
import { confetti } from '../core/confetti.js';
import { t, tx } from '../core/i18n.js';
import { addXp, saveProfile, syncAchievements } from '../core/profile.js';
import { navigate } from '../core/router.js';
import { sfx } from '../core/sound.js';
import { storage } from '../core/storage.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';

const LEVELS = { en: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], es: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], fr: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], zh: ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'], ja: ['N5', 'N4', 'N3', 'N2', 'N1'], ko: ['TOPIK 1', 'TOPIK 2', 'TOPIK 3', 'TOPIK 4', 'TOPIK 5', 'TOPIK 6'] };
const SESSION = 15;

/** Карточка на странице языкового курса. */
export function cardsCardHtml(course) {
  const lang = Object.keys(DECK_COURSE).find((l) => DECK_COURSE[l] === course.id);
  if (!lang) return '';
  const { due, learned } = deckStats(lang);
  return `
    <a class="cards-entry" href="#/cards/${lang}" style="--c:${course.color}">
      <span class="cards-entry-stack" aria-hidden="true"><i></i><i></i><i>🃏</i></span>
      <span class="cards-entry-text"><b>${t('cards.title')}</b><small>${due ? t('cards.due', { n: due }) : t('cards.learned', { n: learned })}</small></span>
      <span class="daily-go">▶</span>
    </a>`;
}

export function cardsRoute(app, { lang }) {
  if (!DECK_LANGS.includes(lang)) {
    navigate('/');
    return null;
  }
  const course = courseById(DECK_COURSE[lang]);
  let level = storage.get(`cardsLevel:${lang}`, 1);
  if (!(level >= 1 && level <= 6)) level = 1;
  let queue = [];
  let index = 0;
  let flipped = false;
  let result = null;
  const rated = new Set();

  function setup() {
    const { due, learned, seen } = deckStats(lang);
    app.innerHTML = `
      <section class="page setup">
        <a class="crumb" href="#${courseHref(course)}">← ${esc(tx(course.name))}</a>
        <div class="setup-card">
          <div class="cards-hero" aria-hidden="true"><i></i><i></i><i>🃏</i></div>
          <h1>${t('cards.title')} · ${esc(tx(course.name))}</h1>
          <p class="muted">${t('cards.desc')}</p>
          <div class="rv-stages cards-stats">
            <div class="rv-stage"><b>${due}</b><small>${t('cards.statDue')}</small></div>
            <div class="rv-stage"><b>${seen - learned}</b><small>${t('cards.statLearning')}</small></div>
            <div class="rv-stage is-done"><b>${learned}</b><small>${t('cards.statLearned')}</small></div>
          </div>
          <h2 class="section-title">${t('cards.newLevel')}</h2>
          <div class="quiz-levels cards-levels" role="radiogroup">
            ${(LEVELS[lang] ?? LEVELS.en).map((name, i) => `<button type="button" role="radio" class="quiz-level" data-level="${i + 1}" aria-checked="${i + 1 === level}" style="--k:${(i + 1) * 1.6}"><b>${name}</b></button>`).join('')}
          </div>
          <button type="button" class="btn btn-primary btn-xl start-btn">▶ ${t('cards.start', { n: SESSION })}</button>
        </div>
      </section>`;
    app.querySelectorAll('[data-level]').forEach((b) =>
      b.addEventListener('click', () => {
        level = Number(b.dataset.level);
        storage.set(`cardsLevel:${lang}`, level);
        setup();
      }),
    );
    app.querySelector('.start-btn').addEventListener('click', start);
  }

  function start() {
    queue = sessionCards(lang, level, SESSION);
    index = 0;
    rated.clear();
    result = { knew: 0, didnt: 0, learned: 0 };
    if (!queue.length) {
      app.querySelector('.start-btn').textContent = t('cards.empty');
      return;
    }
    show();
  }

  function show() {
    flipped = false;
    const card = queue[index];
    app.innerHTML = `
      <section class="page cards-page">
        <div class="cards-top">
          <a class="icon-btn" href="#/cards/${lang}" aria-label="${t('session.close')}">✕</a>
          <div class="hud-progress"><i style="width:${Math.round((index / queue.length) * 100)}%"></i></div>
          <span class="cards-count">${index + 1}/${queue.length}</span>
        </div>
        <button type="button" class="flashcard" aria-label="${t('cards.flip')}">
          <span class="flashcard-inner">
            <span class="flashcard-face front"><b lang="${lang === 'zh' ? 'zh' : lang}">${esc(card.front)}</b>${sayButton(card.front, lang, 'card-say', true)}<small>${t('cards.tap')}</small></span>
            <span class="flashcard-face back"><b>${esc(card.front)}</b>${sayButton(card.front, lang, 'card-say', true)}${card.sub ? `<em>${esc(card.sub)}</em>` : ''}<span class="flashcard-meaning">${esc(tx(card.back))}</span></span>
          </span>
        </button>
        <div class="cards-actions" hidden>
          <button type="button" class="btn btn-lg btn-danger cards-no">😕 ${t('cards.no')}</button>
          <button type="button" class="btn btn-lg btn-success cards-yes">😊 ${t('cards.yes')}</button>
        </div>
      </section>`;
    app.querySelector('.flashcard').addEventListener('click', flip);
    app.querySelector('.cards-no').addEventListener('click', () => answer(false));
    app.querySelector('.cards-yes').addEventListener('click', () => answer(true));
  }

  function flip() {
    flipped = !flipped;
    app.querySelector('.flashcard').classList.toggle('is-flipped', flipped);
    app.querySelector('.cards-actions').hidden = false;
    sfx.tap();
  }

  function answer(knew) {
    const card = queue[index];
    if (!rated.has(card.id)) {
      rated.add(card.id);
      if (rateCard(card.id, knew)) {
        result.learned += 1;
        syncAchievements();
      }
      if (knew) result.knew += 1;
      else {
        result.didnt += 1;
        // Незнакомое слово ещё раз покажем в конце этой же сессии.
        queue.push(card);
      }
    } else if (!knew) queue.push(card);
    knew ? sfx.correct(1) : sfx.wrong();
    const el = app.querySelector('.flashcard');
    el.classList.add(knew ? 'fly-right' : 'fly-left');
    setTimeout(() => {
      index += 1;
      if (index >= queue.length || index > SESSION * 2) finish();
      else show();
    }, 260);
  }

  function finish() {
    const xp = addXp(result.knew * 2 + result.didnt);
    saveProfile();
    if (result.knew >= result.didnt) {
      sfx.win();
      confetti({ count: 80 });
    }
    const { due } = deckStats(lang);
    app.innerHTML = `
      <section class="results page">
        <div class="results-hero mood-${result.knew >= result.didnt ? 'win' : 'neutral'}">
          ${mascot(result.knew >= result.didnt ? 'win' : 'happy', 'mascot-lg bounce-in')}
          <h1>${t('cards.done')}</h1>
          <p class="results-sub">${t('cards.result', { k: result.knew, n: result.knew + result.didnt })}</p>
          <div class="xp-earned">+${xp} XP</div>
        </div>
        <div class="result-stats">
          <div class="result-stat"><span class="rs-icon">😊</span><b>${result.knew}</b><span>${t('cards.yes')}</span></div>
          <div class="result-stat"><span class="rs-icon">😕</span><b>${result.didnt}</b><span>${t('cards.no')}</span></div>
          <div class="result-stat"><span class="rs-icon">🏅</span><b>${result.learned}</b><span>${t('cards.statLearned')}</span></div>
          <div class="result-stat"><span class="rs-icon">🔁</span><b>${due}</b><span>${t('cards.statDue')}</span></div>
        </div>
        <p class="muted small quiz-daily-note">${t('cards.schedule')}</p>
        <div class="result-actions">
          <button type="button" class="btn btn-primary btn-lg again">↻ ${t('cards.again')}</button>
          <a class="btn btn-soft btn-lg" href="#${courseHref(course)}">← ${esc(tx(course.name))}</a>
        </div>
      </section>`;
    app.querySelector('.again').addEventListener('click', setup);
  }

  function onKey(e) {
    if (!app.querySelector('.flashcard')) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flip();
    } else if (flipped && (e.key === '1' || e.key === 'ArrowLeft')) answer(false);
    else if (flipped && (e.key === '2' || e.key === 'ArrowRight')) answer(true);
  }
  document.addEventListener('keydown', onKey);

  setup();
  return { cleanup: () => document.removeEventListener('keydown', onKey), relabel: () => (app.querySelector('.flashcard') ? show() : setup()) };
}
