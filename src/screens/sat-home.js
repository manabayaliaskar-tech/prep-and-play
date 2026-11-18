// Главная страница SAT: «продолжить путь», задание дня, все игровые режимы, прогноз балла.

import { t, tx } from '../core/i18n.js';
import { DAILY_GOAL, getProfile, levelInfo, todayXp } from '../core/profile.js';
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

export function satHomeScreen(app) {
  const render = () => {
    const p = getProfile();
    const lvl = levelInfo(p.xp);
    const xpToday = todayXp();
    const lastExam = p.exams.at(-1);
    const records = { survival: p.records.survival, blitz: p.records.blitz, det: p.records.detective };
    app.innerHTML = `
      <section class="page home">
        <a class="crumb" href="#/exams">← ${t('nav.exams')}</a>
        <div class="hero-card">
          <div class="hero-mascot">${mascot(xpToday >= DAILY_GOAL ? 'win' : 'happy', 'mascot-xl float')}</div>
          <div class="hero-text">
            <p class="hero-kicker">SAT</p>
            <h1>${t('home.title')}</h1>
            <p class="muted">${t('home.subtitle')}</p>
            <div class="hero-badges">
              <span class="badge lvl-xp-badge">⭐ <b>${t('home.level', { n: lvl.level })}</b> <span class="lx-num">${p.xp}/${p.xp - lvl.into + lvl.need} XP</span><span class="goal-bar"><i style="width:${Math.round((lvl.into / lvl.need) * 100)}%"></i></span></span>
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
          <div class="score-preview-value">${lastExam ? (lastExam.total ?? lastExam.rw ?? lastExam.math) : '-'}</div>
          <a class="btn btn-primary" href="#/exam">📝 ${t('home.takeExam')}</a>
        </div>

        <a class="premium-card" href="#/premium">
          <span class="premium-star">⭐</span>
          <span><b>${t('home.premiumTitle')}</b><small>${t('home.premiumText')}</small></span>
          <span class="daily-go">→</span>
        </a>

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
