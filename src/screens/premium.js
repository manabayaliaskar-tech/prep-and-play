// Страница Premium: модель freemium. Пока идёт бета-версия, всё на сайте открыто,
// а функции Premium показаны как запланированные (оплаты ещё нет).

import { t } from '../core/i18n.js';
import { mascot } from '../ui/mascot.js';

const ROWS = [
  ['premium.rowMap', true, true],
  ['premium.rowModes', true, true],
  ['premium.rowSolutions', true, true],
  ['premium.rowMini', true, true],
  ['premium.rowFull', 'premium.limitWeek', 'premium.unlimited'],
  ['premium.rowAnalytics', false, true],
  ['premium.rowPlan', false, true],
  ['premium.rowTutor', false, true],
  ['premium.rowClass', false, true],
];

const cell = (v) => (v === true ? '<span class="yes">✓</span>' : v === false ? '<span class="no">—</span>' : `<span class="txt">${t(v)}</span>`);

export function premiumScreen(app) {
  const render = () => {
    app.innerHTML = `
      <section class="page premium">
        <div class="premium-hero">
          ${mascot('win', 'mascot-lg')}
          <span class="premium-badge">⭐ Premium</span>
          <h1>${t('premium.title')}</h1>
          <p class="muted">${t('premium.subtitle')}</p>
          <div class="beta-note">🎁 ${t('premium.beta')}</div>
        </div>

        <div class="plans">
          <div class="plan">
            <h2>${t('premium.free')}</h2>
            <p class="plan-price">0 ₸</p>
            <p class="muted">${t('premium.freeDesc')}</p>
            <a class="btn btn-soft btn-lg" href="#/">▶ ${t('premium.play')}</a>
          </div>
          <div class="plan plan-pro">
            <span class="plan-ribbon">${t('premium.soon')}</span>
            <h2>⭐ Premium</h2>
            <p class="plan-price">${t('premium.priceSoon')}</p>
            <p class="muted">${t('premium.proDesc')}</p>
            <button type="button" class="btn btn-primary btn-lg" disabled>🔒 ${t('premium.soon')}</button>
          </div>
        </div>

        <div class="panel">
          <h2>${t('premium.compare')}</h2>
          <div class="table-wrap">
            <table class="compare">
              <thead><tr><th></th><th>${t('premium.free')}</th><th>⭐ Premium</th></tr></thead>
              <tbody>${ROWS.map(([key, free, pro]) => `<tr><th scope="row">${t(key)}</th><td>${cell(free)}</td><td>${cell(pro)}</td></tr>`).join('')}</tbody>
            </table>
          </div>
        </div>

        <div class="feature-grid">
          <div class="feature"><span>🤖</span><b>${t('premium.rowTutor')}</b><p class="muted">${t('premium.tutorDesc')}</p></div>
          <div class="feature"><span>🏫</span><b>${t('premium.rowClass')}</b><p class="muted">${t('premium.classDesc')}</p></div>
          <div class="feature"><span>📅</span><b>${t('premium.rowPlan')}</b><p class="muted">${t('premium.planDesc')}</p></div>
          <div class="feature"><span>📈</span><b>${t('premium.rowAnalytics')}</b><p class="muted">${t('premium.analyticsDesc')}</p></div>
        </div>
      </section>`;
  };
  render();
  return { relabel: render };
}
