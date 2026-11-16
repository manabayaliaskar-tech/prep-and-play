// Достижения: превью из 10 штук в профиле и отдельная страница со всеми — по разделам,
// с фильтром «Полученные / Не полученные» и полосками прогресса.

import { t, tx } from '../core/i18n.js';
import { getProfile } from '../core/profile.js';
import { storage } from '../core/storage.js';
import { ITEMS } from '../core/wardrobe.js';
import { ACH_CATS, ACHIEVEMENTS, achProgress } from '../content/achievements.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';

export const ACH_PREVIEW = 10;

const fmtDate = (d) => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d.split('-').reverse().join('.') : '');

/** Вещь гардероба, которую открывает достижение. */
const rewardOf = (id) => ITEMS.find((it) => it.unlock?.type === 'ach' && it.unlock.value === id) ?? null;

function achCard(a, p) {
  const earned = Boolean(p.achievements[a.id]);
  const prog = earned ? null : achProgress(a, p);
  const reward = rewardOf(a.id);
  const date = earned ? fmtDate(p.achievements[a.id]) : '';
  return `<div class="ach ${earned ? 'earned' : ''}" title="${esc(tx(a.desc))}">
    <span class="ach-icon">${a.icon}</span>
    <b>${esc(tx(a.name))}</b>
    <small>${esc(tx(a.desc))}</small>
    ${prog ? `<span class="ach-prog"><span class="bar"><i style="width:${Math.round((prog.now / prog.goal) * 100)}%"></i></span><span class="ach-prog-n">${prog.now}/${prog.goal}</span></span>` : ''}
    ${date ? `<span class="ach-date">${t('ach.earnedOn', { date })}</span>` : ''}
    ${reward ? `<span class="ach-reward" title="${esc(t('ach.reward', { item: t(`wear.${reward.id}`) }))}">${reward.icon}</span>` : ''}
  </div>`;
}

/** Порядок для превью: сначала свежие полученные, потом те, что ближе всего к получению. */
function previewOrder(p) {
  const earned = ACHIEVEMENTS.filter((a) => p.achievements[a.id]).sort((x, y) => String(p.achievements[y.id]).localeCompare(String(p.achievements[x.id])));
  const ratio = (a) => {
    const pr = achProgress(a, p);
    return pr ? pr.now / pr.goal : 0;
  };
  const locked = ACHIEVEMENTS.filter((a) => !p.achievements[a.id])
    .map((a, i) => ({ a, r: ratio(a), i }))
    .sort((x, y) => y.r - x.r || x.i - y.i)
    .map((x) => x.a);
  return [...earned, ...locked];
}

/** Панель достижений в профиле: 10 карточек и кнопка «Все достижения +N». */
export function achievementsPanel(p = getProfile()) {
  const list = previewOrder(p).slice(0, ACH_PREVIEW);
  const earned = ACHIEVEMENTS.filter((a) => p.achievements[a.id]).length;
  const rest = ACHIEVEMENTS.length - list.length;
  return `<div class="panel ach-panel">
    <div class="ach-head">
      <h2>${t('profile.achievements')} <span class="muted small">${earned}/${ACHIEVEMENTS.length}</span></h2>
      <a class="btn btn-soft btn-sm ach-all-link" href="#/achievements">${t('ach.all')} <span class="more-badge">+${rest}</span></a>
    </div>
    <div class="ach-grid">${list.map((a) => achCard(a, p)).join('')}</div>
  </div>`;
}

export function achievementsRoute(app) {
  let filter = storage.get('achFilter', 'all');
  const render = () => {
    const p = getProfile();
    const earned = ACHIEVEMENTS.filter((a) => p.achievements[a.id]).length;
    const pct = Math.round((earned / ACHIEVEMENTS.length) * 100);
    const show = (a) => (filter === 'earned' ? Boolean(p.achievements[a.id]) : filter === 'locked' ? !p.achievements[a.id] : true);
    const sections = ACH_CATS.map((cat) => {
      const all = ACHIEVEMENTS.filter((a) => a.cat === cat);
      const items = all.filter(show);
      if (!items.length) return '';
      const got = all.filter((a) => p.achievements[a.id]).length;
      return `<section class="ach-section">
        <h2>${t(`ach.cat.${cat}`)} <span class="muted small">${got}/${all.length}</span></h2>
        <div class="ach-grid">${items.map((a) => achCard(a, p)).join('')}</div>
      </section>`;
    }).join('');
    app.innerHTML = `
      <section class="page ach-page">
        <div class="ach-hero">
          ${mascot(earned ? 'win' : 'happy', 'mascot-md float')}
          <div class="ach-hero-text">
            <h1>🏆 ${t('ach.title')}</h1>
            <p class="muted">${t('ach.sub', { n: earned, m: ACHIEVEMENTS.length })}</p>
            <div class="ach-total"><div class="bar xp"><i style="width:${pct}%"></i></div><b>${earned}/${ACHIEVEMENTS.length}</b></div>
          </div>
        </div>
        <div class="ach-filters" role="tablist">
          ${['all', 'earned', 'locked']
            .map((f) => `<button type="button" role="tab" class="ach-filter ${filter === f ? 'is-active' : ''}" aria-selected="${filter === f}" data-filter="${f}">${t(`ach.f${f[0].toUpperCase()}${f.slice(1)}`)}</button>`)
            .join('')}
        </div>
        ${sections || `<p class="muted ach-empty">${mascot('think', 'mascot-sm')}</p>`}
      </section>`;
    app.querySelectorAll('[data-filter]').forEach((b) =>
      b.addEventListener('click', () => {
        filter = b.dataset.filter;
        storage.set('achFilter', filter);
        render();
      }),
    );
  };
  render();
  return { relabel: render };
}
