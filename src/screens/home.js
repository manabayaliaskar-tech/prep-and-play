// Главная: приветствие, цель дня, серия, «продолжить путь», ежедневный челлендж, все режимы.

import { dayKey } from '../core/dates.js';
import { t, tx } from '../core/i18n.js';
import { DAILY_GOAL, currentStreak, getProfile, levelInfo, todayXp } from '../core/profile.js';
import { BANK_STATS } from '../content/bank.js';
import { DOMAINS } from '../content/skills.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { nextStep } from './map.js';

function ring(value, max) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const ratio = Math.min(1, value / max);
  return `<svg class="ring" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="${r}" class="ring-bg"/>
    <circle cx="40" cy="40" r="${r}" class="ring-fg ${ratio >= 1 ? 'full' : ''}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - ratio)}"/>
  </svg>`;
}

function continueCard(track, label, icon) {
  const step = nextStep(track);
  if (!step) return '';
  let text;
  if (step.done) text = t('home.trackDone');
  else if (step.boss) text = `${step.zone.boss.icon} ${t('home.bossNext', { name: tx(step.zone.boss.name) })}`;
  else text = `${DOMAINS[step.zone.domain].icon} ${esc(tx(DOMAINS[step.zone.domain].name))} · ${t('map.level', { n: step.n })}`;
  return `<a class="continue-card" href="#${step.href}"><span class="cc-icon">${icon}</span><span class="cc-text"><small>${label}</small><b>${text}</b></span><span class="cc-go">▶</span></a>`;
}

const MODES = [
  { href: '/map', icon: '🗺️', key: 'map', color: '#7c5cff' },
  { href: '/exam', icon: '📝', key: 'exam', color: '#0ea5e9' },
  { href: '/duel', icon: '🤺', key: 'duel', color: '#f43f5e' },
  { href: '/survival', icon: '🛡️', key: 'survival', color: '#22c55e' },
  { href: '/blitz', icon: '⚡', key: 'blitz', color: '#f59e0b' },
  { href: '/detective', icon: '🕵️', key: 'det', color: '#8b5cf6' },
  { href: '/weak', icon: '🎯', key: 'weak', color: '#ec4899' },
  { href: '/daily', icon: '☀️', key: 'daily', color: '#fb923c' },
];

export function homeScreen(app) {
  const render = () => {
    const p = getProfile();
    const lvl = levelInfo(p.xp);
    const streak = currentStreak();
    const xpToday = todayXp();
    const dailyDone = Boolean(p.daily[dayKey()]);
    const lastExam = p.exams.at(-1);
    const records = { survival: p.records.survival, blitz: p.records.blitz, det: p.records.detective };
    const name = p.name ? esc(p.name) : '';
    app.innerHTML = `
      <section class="page home">
        <div class="hero-card">
          <div class="hero-mascot">${mascot(xpToday >= DAILY_GOAL ? 'win' : 'happy', 'mascot-xl float')}</div>
          <div class="hero-text">
            <p class="hero-kicker">${name ? t('home.helloName', { name }) : t('home.hello')}</p>
            <h1>${t('home.title')}</h1>
            <p class="muted">${t('home.subtitle')}</p>
            <div class="hero-badges">
              <span class="badge">⭐ ${t('home.level', { n: lvl.level })}</span>
              <span class="badge ${streak ? 'fire' : ''}">🔥 ${t('home.streak', { n: streak })}</span>
              <span class="badge">⚡ ${p.xp} XP</span>
            </div>
          </div>
          <div class="goal">
            ${ring(xpToday, DAILY_GOAL)}
            <div class="goal-text"><b>${Math.min(xpToday, DAILY_GOAL)}/${DAILY_GOAL}</b><span>${xpToday >= DAILY_GOAL ? t('home.goalDone') : t('home.goal')}</span></div>
          </div>
        </div>

        <div class="continue-row">
          ${continueCard('rw', t('home.continueRw'), '📖')}
          ${continueCard('math', t('home.continueMath'), '📐')}
        </div>

        <a class="daily-card ${dailyDone ? 'done' : ''}" href="#/daily">
          <span class="daily-sun">☀️</span>
          <span><b>${t('daily.title')}</b><small>${dailyDone ? t('home.dailyDone') : t('home.dailyCta')}</small></span>
          <span class="daily-go">${dailyDone ? '✓' : '+30 XP'}</span>
        </a>

        <h2 class="section-title">${t('home.modes')}</h2>
        <div class="modes-grid">
          ${MODES.map(
            (m, i) => `
            <a class="mode-card" href="#${m.href}" style="--c:${m.color}; --i:${i}">
              <span class="mode-icon">${m.icon}</span>
              <b>${t(`mode.${m.key}.title`)}</b>
              <span class="mode-desc">${t(`mode.${m.key}.desc`)}</span>
              ${records[m.key] ? `<span class="mode-record">🏆 ${records[m.key]}</span>` : ''}
            </a>`,
          ).join('')}
        </div>

        <div class="score-preview">
          <div>
            <h2>${t('home.scoreTitle')}</h2>
            <p class="muted">${lastExam ? t('home.scoreLast', { date: lastExam.date }) : t('home.scoreNone')}</p>
          </div>
          <div class="score-preview-value">${lastExam ? (lastExam.total ?? lastExam.rw ?? lastExam.math) : '—'}</div>
          <a class="btn btn-primary" href="#/exam">📝 ${t('home.takeExam')}</a>
        </div>

        <div class="about-card">
          <h2>${t('home.aboutTitle')}</h2>
          <p>${t('home.about', { rw: BANK_STATS.rw, math: BANK_STATS.mathSkills })}</p>
          <p class="muted small">${t('home.official')}
            <a href="https://bluebook.collegeboard.org/" target="_blank" rel="noopener">Bluebook</a> ·
            <a href="https://satsuitequestionbank.collegeboard.org/" target="_blank" rel="noopener">SAT Question Bank</a> ·
            <a href="https://www.khanacademy.org/test-prep/digital-sat" target="_blank" rel="noopener">Khan Academy</a>
          </p>
          <p class="muted tiny">${t('home.trademark')}</p>
        </div>
      </section>`;
  };
  render();
  return { relabel: render };
}
