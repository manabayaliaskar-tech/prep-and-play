// Профиль: уровень, статистика, «паутина» навыков по 8 доменам, достижения, история пробников, настройки.

import { t, tx } from '../core/i18n.js';
import { currentStreak, getProfile, levelInfo, resetProgress, saveProfile } from '../core/profile.js';
import { ACHIEVEMENTS } from '../content/achievements.js';
import { DOMAINS, SKILLS } from '../content/skills.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { openModal, toast } from '../ui/overlay.js';

export function domainMastery(profile) {
  const result = {};
  for (const d of Object.keys(DOMAINS)) {
    let a = 0;
    let c = 0;
    for (const [skill, info] of Object.entries(SKILLS)) {
      if (info.domain !== d) continue;
      a += profile.skills[skill]?.a ?? 0;
      c += profile.skills[skill]?.c ?? 0;
    }
    result[d] = a ? c / a : null;
  }
  return result;
}

function radar(values) {
  const keys = Object.keys(DOMAINS);
  const cx = 150;
  const cy = 150;
  const R = 110;
  const point = (i, r) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / keys.length;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };
  const rings = [0.25, 0.5, 0.75, 1]
    .map((k) => `<polygon class="radar-ring" points="${keys.map((_, i) => point(i, R * k).join(',')).join(' ')}"/>`)
    .join('');
  const axes = keys.map((_, i) => `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${point(i, R)[0]}" y2="${point(i, R)[1]}"/>`).join('');
  const shape = keys.map((k, i) => point(i, R * Math.max(0.04, values[k] ?? 0)).join(',')).join(' ');
  const labels = keys
    .map((k, i) => {
      const [x, y] = point(i, R + 22);
      return `<text x="${x}" y="${y + 6}" text-anchor="middle" class="radar-icon">${DOMAINS[k].icon}</text>`;
    })
    .join('');
  return `<svg class="radar" viewBox="0 0 300 300" role="img" aria-label="${t('profile.radar')}">${rings}${axes}<polygon class="radar-shape" points="${shape}"/>${labels}</svg>`;
}

export function profileScreen(app) {
  const render = () => {
    const p = getProfile();
    const lvl = levelInfo(p.xp);
    const acc = p.counters.answered ? Math.round((p.counters.correct / p.counters.answered) * 100) : 0;
    const values = domainMastery(p);
    const earned = ACHIEVEMENTS.filter((a) => p.achievements[a.id]).length;
    app.innerHTML = `
      <section class="page profile">
        <div class="profile-card">
          ${mascot('happy', 'mascot-lg')}
          <div class="profile-main">
            <label class="name-field inline"><span>${t('profile.name')}</span><input class="name-input" type="text" maxlength="24" value="${esc(p.name)}" placeholder="${t('duel.namePlaceholder')}"/></label>
            <div class="level-line"><span class="lvl-badge big">${lvl.level}</span><div class="bar xp"><i style="width:${Math.round((lvl.into / lvl.need) * 100)}%"></i></div><span class="muted small">${lvl.into}/${lvl.need} XP</span></div>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-tile"><b>${p.counters.answered}</b><span>${t('profile.answered')}</span></div>
          <div class="stat-tile"><b>${acc}%</b><span>${t('res.accuracy')}</span></div>
          <div class="stat-tile"><b>🔥 ${currentStreak()}</b><span>${t('profile.streak', { best: p.streak.best })}</span></div>
          <div class="stat-tile"><b>${earned}/${ACHIEVEMENTS.length}</b><span>${t('profile.achievements')}</span></div>
        </div>

        <div class="two-col">
          <div class="panel">
            <h2>${t('profile.radar')}</h2>
            ${radar(values)}
            <div class="domain-legend">${Object.entries(DOMAINS)
              .map(
                ([k, d]) =>
                  `<div class="dl-row"><span>${d.icon} ${esc(tx(d.name))}</span><b>${values[k] === null ? '—' : `${Math.round(values[k] * 100)}%`}</b></div>`,
              )
              .join('')}</div>
          </div>
          <div class="panel">
            <h2>${t('profile.skills')}</h2>
            <div class="skill-list">
              ${Object.entries(SKILLS)
                .map(([k, s]) => {
                  const st = p.skills[k];
                  const pct = st ? Math.round((st.c / st.a) * 100) : null;
                  return `<div class="skill-row ${st ? '' : 'untried'}"><span>${esc(tx(s.name))}</span><div class="bar" style="--c:${DOMAINS[s.domain].color}"><i style="width:${pct ?? 0}%"></i></div><b>${pct === null ? '—' : `${pct}%`}</b></div>`;
                })
                .join('')}
            </div>
            <a class="btn btn-primary" href="#/weak">🎯 ${t('profile.trainWeak')}</a>
          </div>
        </div>

        <div class="panel">
          <h2>${t('profile.achievements')}</h2>
          <div class="ach-grid">
            ${ACHIEVEMENTS.map(
              (a) => `<div class="ach ${p.achievements[a.id] ? 'earned' : ''}" title="${esc(tx(a.desc))}"><span class="ach-icon">${a.icon}</span><b>${esc(tx(a.name))}</b><small>${esc(tx(a.desc))}</small></div>`,
            ).join('')}
          </div>
        </div>

        <div class="two-col">
          <div class="panel">
            <h2>${t('profile.records')}</h2>
            <div class="records">
              <div><span>🛡️ ${t('mode.survival.title')}</span><b>${p.records.survival}</b></div>
              <div><span>⚡ ${t('mode.blitz.title')}</span><b>${p.records.blitz}</b></div>
              <div><span>🕵️ ${t('mode.det.title')}</span><b>${p.records.detective}</b></div>
              <div><span>⚔️ ${t('profile.bosses')}</span><b>${Object.keys(p.map.bosses).length}/8</b></div>
            </div>
          </div>
          <div class="panel">
            <h2>${t('profile.exams')}</h2>
            ${
              p.exams.length
                ? `<div class="exam-history">${p.exams
                    .slice(-6)
                    .reverse()
                    .map((e) => `<div><span>${e.date} · ${t(e.length === 'full' ? 'exam.full' : 'exam.mini')}</span><b>${e.total ?? e.rw ?? e.math}</b></div>`)
                    .join('')}</div>`
                : `<p class="muted">${t('profile.noExams')}</p>`
            }
          </div>
        </div>

        <div class="panel settings">
          <h2>${t('profile.settings')}</h2>
          <label class="toggle"><input type="checkbox" class="sound-input" ${p.sound ? 'checked' : ''}/><span>${t('profile.sound')}</span></label>
          <button type="button" class="btn btn-danger-soft reset-btn">🗑 ${t('profile.reset')}</button>
        </div>
      </section>`;

    app.querySelector('.name-input').addEventListener('change', (e) => {
      p.name = e.target.value.trim().slice(0, 24);
      saveProfile();
      toast(`✅ ${t('profile.saved')}`, { kind: 'good' });
    });
    app.querySelector('.sound-input').addEventListener('change', (e) => {
      p.sound = e.target.checked;
      saveProfile();
    });
    app.querySelector('.reset-btn').addEventListener('click', () =>
      openModal({
        title: t('profile.resetTitle'),
        body: `<p>${t('profile.resetText')}</p>`,
        actions: [
          { label: t('common.cancel') },
          {
            label: t('profile.resetConfirm'),
            danger: true,
            onClick: () => {
              resetProgress();
              render();
            },
          },
        ],
      }),
    );
  };
  render();
  return { relabel: render };
}
