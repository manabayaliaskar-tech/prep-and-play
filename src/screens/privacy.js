// Страница «Политика конфиденциальности»: что храним, где, как удалить. Для школьников и родителей.

import { PRIVACY, PRIVACY_UPDATED, SUPPORT_EMAIL } from '../content/privacy.js';
import { t, tx } from '../core/i18n.js';
import { esc } from '../ui/dom.js';

export function privacyRoute(app) {
  const render = () => {
    app.innerHTML = `
      <section class="page privacy-page">
        <a class="crumb" href="#/profile">← ${t('nav.profile')}</a>
        <div class="page-head">
          <h1>🔒 ${t('privacy.title')}</h1>
          <p class="muted small">${t('privacy.updated', { date: PRIVACY_UPDATED.split('-').reverse().join('.') })}</p>
        </div>
        ${PRIVACY.map(
          (sec) => `<div class="panel privacy-sec"><h2>${esc(tx(sec.title))}</h2><ul>${sec.items.map((it) => `<li>${esc(tx(it))}</li>`).join('')}</ul></div>`,
        ).join('')}
        <div class="panel privacy-sec">
          <h2>${t('privacy.contact')}</h2>
          <p>${t('privacy.contactText')} <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        </div>
      </section>`;
  };
  render();
  return { relabel: render };
}
