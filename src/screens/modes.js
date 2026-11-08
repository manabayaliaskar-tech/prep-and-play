// Игровые режимы: Выживание, Блиц, Слабые места, Ежедневный челлендж, Дуэль.

import { dayKey, msUntilMidnight } from '../core/dates.js';
import { DUEL_LENGTH, decodeDuel, duelOutcome, encodeDuel } from '../core/duel-code.js';
import { t, tx } from '../core/i18n.js';
import { addXp, getProfile, mastery, saveProfile } from '../core/profile.js';
import { createRng, hashString, newSeed } from '../core/random.js';
import { navigate } from '../core/router.js';
import { storage } from '../core/storage.js';
import { QuestionStream, buildSet } from '../content/bank.js';
import { DOMAINS, SKILLS } from '../content/skills.js';
import { esc, formatTime } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { toast } from '../ui/overlay.js';
import { baseStats, celebrate, runSession } from './play.js';

// ---------- Общий экран подготовки ----------

function sectionPicker(selected) {
  const opts = [
    ['mix', '🎲', t('mode.mix')],
    ['math', '📐', t('mode.math')],
    ['rw', '📖', t('mode.rw')],
  ];
  return `<div class="segmented" role="radiogroup" aria-label="${t('mode.section')}">${opts
    .map(([id, icon, label]) => `<button type="button" role="radio" data-section="${id}" aria-checked="${id === selected}">${icon} ${label}</button>`)
    .join('')}</div>`;
}

function setupScreen(app, { icon, title, desc, rules, record = null, sections = true, extraHtml = '', startLabel, onStart }) {
  let section = storage.get('lastSection', 'mix');
  const render = () => {
    app.innerHTML = `
      <section class="page setup">
        <div class="setup-card">
          <div class="setup-icon">${icon}</div>
          <h1>${title}</h1>
          <p class="muted">${desc}</p>
          <ul class="rules">${rules.map((r) => `<li>${r}</li>`).join('')}</ul>
          ${record !== null ? `<div class="record">🏆 ${t('mode.record')}: <b>${record}</b></div>` : ''}
          ${extraHtml}
          ${sections ? `<div class="setup-section"><span>${t('mode.section')}</span>${sectionPicker(section)}</div>` : ''}
          <button type="button" class="btn btn-primary btn-xl start-btn">${startLabel ?? `▶ ${t('mode.start')}`}</button>
        </div>
      </section>`;
    app.querySelectorAll('[data-section]').forEach((b) =>
      b.addEventListener('click', () => {
        section = b.dataset.section;
        storage.set('lastSection', section);
        app.querySelectorAll('[data-section]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      }),
    );
    app.querySelector('.start-btn').addEventListener('click', () => onStart(section));
  };
  render();
  return render;
}

/** Обёртка: экран подготовки, затем сессия. Поддерживает смену языка на обоих этапах. */
function modeRoute(app, setup, start) {
  let session = null;
  setupScreen(app, {
    ...setup(),
    onStart: (section) => {
      session = start(section);
    },
  });
  return {
    cleanup: () => session?.cleanup(),
    relabel: () => (session ? session.relabel() : setupScreen(app, { ...setup(), onStart: (s) => (session = start(s)) })),
  };
}

const sectionTitle = (section) => ({ mix: t('mode.mix'), math: t('mode.math'), rw: t('mode.rw') })[section];

// ---------- Выживание ----------

export function survivalRoute(app) {
  return modeRoute(
    app,
    () => ({
      icon: '🛡️',
      title: t('survival.title'),
      desc: t('survival.desc'),
      rules: [t('survival.rule1'), t('survival.rule2'), t('survival.rule3')],
      record: getProfile().records.survival,
    }),
    (section) =>
      runSession(app, {
        title: () => `${t('survival.title')} · ${sectionTitle(section)}`,
        stream: new QuestionStream({ rng: createRng(newSeed()), section }),
        difficultyAt: (i) => (i < 5 ? 1 : i < 12 ? 2 : 3),
        lives: 3,
        exitTo: '/survival',
        onFinish: (run) => {
          const p = getProfile();
          const isRecord = run.correct > p.records.survival;
          if (isRecord) p.records.survival = run.correct;
          celebrate(isRecord);
          return () => ({
            mood: isRecord ? 'win' : 'neutral',
            title: isRecord ? t('res.newRecord') : t('survival.over'),
            subtitle: t('survival.score', { n: run.correct }),
            xp: run.xp,
            stats: [...baseStats(run), { icon: '🏆', label: t('mode.record'), value: p.records.survival }],
            log: run.log,
            actions: [
              { label: `↻ ${t('res.again')}`, onClick: () => navigate('/survival'), primary: true },
              { label: `🏠 ${t('res.home')}`, href: '/' },
            ],
          });
        },
      }),
  );
}

// ---------- Блиц ----------

export const BLITZ_SECONDS = 90;

export function blitzRoute(app) {
  return modeRoute(
    app,
    () => ({
      icon: '⚡',
      title: t('blitz.title'),
      desc: t('blitz.desc', { s: BLITZ_SECONDS }),
      rules: [t('blitz.rule1'), t('blitz.rule2'), t('blitz.rule3')],
      record: getProfile().records.blitz,
    }),
    (section) =>
      runSession(app, {
        title: () => `${t('blitz.title')} · ${sectionTitle(section)}`,
        stream: new QuestionStream({ rng: createRng(newSeed()), section, quick: true }),
        difficultyAt: (i) => (i < 8 ? 1 : 2),
        timeLimit: BLITZ_SECONDS,
        quick: true,
        exitTo: '/blitz',
        onFinish: (run) => {
          const p = getProfile();
          const isRecord = run.correct > p.records.blitz;
          if (isRecord) p.records.blitz = run.correct;
          celebrate(isRecord || run.correct >= 8);
          return () => ({
            mood: isRecord ? 'win' : 'neutral',
            title: isRecord ? t('res.newRecord') : t('blitz.over'),
            subtitle: t('blitz.score', { n: run.correct, s: BLITZ_SECONDS }),
            xp: run.xp,
            stats: [...baseStats(run), { icon: '🏆', label: t('mode.record'), value: p.records.blitz }],
            log: run.log,
            actions: [
              { label: `↻ ${t('res.again')}`, onClick: () => navigate('/blitz'), primary: true },
              { label: `🏠 ${t('res.home')}`, href: '/' },
            ],
          });
        },
      }),
  );
}

// ---------- Слабые места ----------

export function weakSkills(limit = 3) {
  const p = getProfile();
  return Object.keys(SKILLS)
    .filter((s) => (p.skills[s]?.a ?? 0) >= 2)
    .map((s) => ({ skill: s, m: mastery(s), a: p.skills[s].a }))
    .sort((x, y) => x.m - y.m)
    .slice(0, limit);
}

export function weakRoute(app) {
  let session = null;
  const render = () => {
    const weak = weakSkills();
    const enough = weak.length > 0;
    app.innerHTML = `
      <section class="page setup">
        <div class="setup-card">
          <div class="setup-icon">🎯</div>
          <h1>${t('weak.title')}</h1>
          <p class="muted">${t('weak.desc')}</p>
          ${
            enough
              ? `<div class="weak-list">${weak
                  .map(
                    (w) => `<div class="weak-item">
                      <div class="weak-name">${esc(tx(SKILLS[w.skill].name))}<span class="muted small"> · ${esc(tx(DOMAINS[SKILLS[w.skill].domain].name))}</span></div>
                      <div class="bar"><i style="width:${Math.round(w.m * 100)}%"></i></div>
                      <div class="weak-pct">${Math.round(w.m * 100)}%</div>
                    </div>`,
                  )
                  .join('')}</div>`
              : `<div class="empty-note">${mascot('wow', 'mascot-sm')}<p>${t('weak.empty')}</p></div>`
          }
          <button type="button" class="btn btn-primary btn-xl start-btn">▶ ${enough ? t('weak.start') : t('weak.diagnostic')}</button>
        </div>
      </section>`;
    app.querySelector('.start-btn').addEventListener('click', () => {
      const skills = enough ? weak.map((w) => w.skill) : null;
      session = runSession(app, {
        title: () => (enough ? t('weak.title') : t('weak.diagnostic')),
        questions: buildSet({ rng: createRng(newSeed()), skills, difficulties: [1, 2, 2, 3], count: 10 }),
        exitTo: '/weak',
        onFinish: (run) => {
          celebrate(run.correct >= 7);
          return () => ({
            mood: run.correct >= 7 ? 'win' : 'neutral',
            title: run.correct >= 7 ? t('weak.great') : t('weak.keepGoing'),
            subtitle: t('weak.after'),
            xp: run.xp,
            stats: baseStats(run),
            log: run.log,
            actions: [
              { label: `🎯 ${t('weak.again')}`, onClick: () => navigate('/weak'), primary: true },
              { label: `👤 ${t('nav.profile')}`, href: '/profile' },
            ],
          });
        },
      });
    });
  };
  render();
  return { cleanup: () => session?.cleanup(), relabel: () => (session ? session.relabel() : render()) };
}

// ---------- Ежедневный челлендж ----------

export const DAILY_COUNT = 5;
export const DAILY_BONUS = 30;

export function dailyQuestions(key = dayKey()) {
  return buildSet({ rng: createRng(hashString(`daily-${key}`)), section: 'mix', difficulties: [1, 2, 2, 3, 3], count: DAILY_COUNT });
}

export function dailyRoute(app) {
  const today = dayKey();
  let session = null;
  let timer = null;
  const render = () => {
    clearInterval(timer);
    const done = getProfile().daily[today];
    app.innerHTML = `
      <section class="page setup">
        <div class="setup-card">
          <div class="setup-icon">☀️</div>
          <h1>${t('daily.title')}</h1>
          <p class="muted">${t('daily.desc', { n: DAILY_COUNT, xp: DAILY_BONUS })}</p>
          ${
            done
              ? `<div class="daily-done">${mascot('win', 'mascot-sm')}<div><b>${t('daily.doneToday', { c: done.c, n: DAILY_COUNT })}</b><p class="muted">${t('daily.next')} <span class="countdown"></span></p></div></div>
                 <a class="btn btn-soft btn-xl" href="#/">🏠 ${t('res.home')}</a>`
              : `<button type="button" class="btn btn-primary btn-xl start-btn">▶ ${t('daily.start')}</button>`
          }
        </div>
      </section>`;
    if (done) {
      const cd = app.querySelector('.countdown');
      const tick = () => {
        const ms = msUntilMidnight();
        cd.textContent = t('daily.countdown', { h: Math.floor(ms / 3600000), m: Math.floor(ms / 60000) % 60 });
      };
      tick();
      timer = setInterval(tick, 30000);
      return;
    }
    app.querySelector('.start-btn').addEventListener('click', () => {
      session = runSession(app, {
        title: () => `☀️ ${t('daily.title')}`,
        questions: dailyQuestions(today),
        exitTo: '/',
        onFinish: (run) => {
          const p = getProfile();
          if (!p.daily[today]) {
            p.daily[today] = { c: run.correct };
            p.counters.dailyDone += 1;
            addXp(DAILY_BONUS);
          }
          saveProfile();
          celebrate(run.correct >= 3);
          return () => ({
            mood: run.correct >= 3 ? 'win' : 'neutral',
            title: t('daily.complete'),
            subtitle: t('daily.result', { c: run.correct, n: DAILY_COUNT }),
            xp: run.xp + DAILY_BONUS,
            stats: baseStats(run),
            log: run.log,
            actions: [{ label: `🏠 ${t('res.home')}`, href: '/', primary: true }],
          });
        },
      });
    });
  };
  render();
  return {
    cleanup: () => {
      clearInterval(timer);
      session?.cleanup();
    },
    relabel: () => (session ? session.relabel() : render()),
  };
}

// ---------- Дуэль ----------

function duelLink(code) {
  return `${location.origin}${location.pathname}#/duel/${code}`;
}

function shareBox(code, text) {
  const link = duelLink(code);
  return `
    <div class="share-box">
      <p><b>${t('duel.shareTitle')}</b></p>
      <div class="share-row"><input class="share-input" readonly value="${esc(link)}" aria-label="${t('duel.link')}"/><button type="button" class="btn btn-primary copy-btn">📋 ${t('duel.copy')}</button></div>
      ${navigator.share ? `<button type="button" class="btn btn-soft share-btn">📤 ${t('duel.share')}</button>` : ''}
      <p class="muted small">${t('duel.shareHint')}</p>
      <template class="share-text">${esc(text)}</template>
    </div>`;
}

function bindShare(app, code, text) {
  const link = duelLink(code);
  const markSent = () => {
    const p = getProfile();
    p.counters.duelsSent += 1;
    saveProfile();
  };
  app.querySelector('.copy-btn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${link}`);
    } catch {
      app.querySelector('.share-input').select();
      document.execCommand?.('copy');
    }
    markSent();
    toast(`✅ ${t('duel.copied')}`, { kind: 'good' });
  });
  app.querySelector('.share-btn')?.addEventListener('click', async () => {
    try {
      await navigator.share({ title: 'Prep&Play', text, url: link });
      markSent();
    } catch {
      // Пользователь закрыл окно «Поделиться».
    }
  });
}

function nameField() {
  return `<label class="name-field"><span>${t('duel.yourName')}</span><input class="name-input" type="text" maxlength="24" value="${esc(getProfile().name)}" placeholder="${t('duel.namePlaceholder')}"/></label>`;
}

function saveName(app) {
  const input = app.querySelector('.name-input');
  if (!input) return getProfile().name;
  const p = getProfile();
  p.name = input.value.trim().slice(0, 24);
  saveProfile();
  return p.name;
}

function playDuel(app, { seed, section, opponent = null }) {
  const name = getProfile().name || t('duel.anonymous');
  const questions = buildSet({ rng: createRng(seed), section, difficulties: [1, 2, 2, 3], count: DUEL_LENGTH });
  return runSession(app, {
    title: () => (opponent ? `🤺 ${t('duel.vs', { name: opponent.name })}` : `🤺 ${t('duel.title')}`),
    questions,
    exitTo: '/duel',
    onFinish: (run) => {
      const me = { correct: run.correct, timeMs: run.timeMs };
      const code = encodeDuel({ seed, section, name, correct: run.correct, timeMs: run.timeMs });
      const outcome = opponent ? duelOutcome(me, opponent) : null;
      celebrate(!opponent || outcome === 'win');
      const shareText = t('duel.shareText', { c: run.correct, n: DUEL_LENGTH });
      return () => ({
        mood: outcome === 'lose' ? 'lose' : 'win',
        title: opponent ? t(`duel.${outcome}`) : t('duel.sent'),
        subtitle: opponent
          ? t('duel.compare', { me: run.correct, them: opponent.correct, name: esc(opponent.name) })
          : t('duel.yourResult', { c: run.correct, n: DUEL_LENGTH, time: formatTime(run.timeMs) }),
        xp: run.xp,
        stats: [
          ...baseStats(run),
          { icon: '⏱', label: t('duel.time'), value: formatTime(run.timeMs) },
          ...(opponent ? [{ icon: '🤺', label: esc(opponent.name), value: `${opponent.correct}/${opponent.total} · ${formatTime(opponent.timeMs)}` }] : []),
        ],
        extraHtml: shareBox(code, shareText),
        log: run.log,
        actions: [
          { label: `🤺 ${t('duel.newDuel')}`, onClick: () => navigate('/duel'), primary: Boolean(opponent) },
          { label: `🏠 ${t('res.home')}`, href: '/' },
        ],
        afterRender: (root) => bindShare(root, code, shareText),
      });
    },
  });
}

export function duelRoute(app) {
  return modeRoute(
    app,
    () => ({
      icon: '🤺',
      title: t('duel.title'),
      desc: t('duel.desc', { n: DUEL_LENGTH }),
      rules: [t('duel.rule1'), t('duel.rule2'), t('duel.rule3')],
      extraHtml: nameField(),
    }),
    (section) => {
      saveName(app);
      return playDuel(app, { seed: newSeed(), section });
    },
  );
}

export function duelAcceptRoute(app, { code }) {
  const challenge = decodeDuel(code);
  let session = null;
  const render = () => {
    if (!challenge) {
      app.innerHTML = `<section class="page setup"><div class="setup-card">${mascot('sad', 'mascot-lg')}<h1>${t('duel.badLink')}</h1><a class="btn btn-primary btn-xl" href="#/duel">🤺 ${t('duel.newDuel')}</a></div></section>`;
      return;
    }
    app.innerHTML = `
      <section class="page setup">
        <div class="setup-card">
          <div class="vs">
            <div class="vs-player"><div class="vs-avatar">🤺</div><b>${esc(challenge.name || t('duel.anonymous'))}</b><span>${challenge.correct}/${challenge.total} · ${formatTime(challenge.timeMs)}</span></div>
            <div class="vs-badge">VS</div>
            <div class="vs-player"><div class="vs-avatar">❓</div><b>${t('duel.you')}</b><span>?</span></div>
          </div>
          <h1>${t('duel.challenged', { name: esc(challenge.name || t('duel.anonymous')) })}</h1>
          <p class="muted">${t('duel.acceptDesc', { n: challenge.total, section: sectionTitle(challenge.section) })}</p>
          ${nameField()}
          <button type="button" class="btn btn-primary btn-xl start-btn">⚔️ ${t('duel.accept')}</button>
        </div>
      </section>`;
    app.querySelector('.start-btn').addEventListener('click', () => {
      saveName(app);
      session = playDuel(app, { seed: challenge.seed, section: challenge.section, opponent: challenge });
    });
  };
  render();
  return { cleanup: () => session?.cleanup(), relabel: () => (session ? session.relabel() : render()) };
}
