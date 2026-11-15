// Разбор решения: сначала на английском (как на экзамене), потом можно переключить на русский или казахский.

import { getLang, t } from '../core/i18n.js';
import { checkAchievements, getProfile, saveProfile } from '../core/profile.js';
import { esc } from './dom.js';

const LABELS = { en: 'EN', ru: 'RU', kk: 'KZ' };

export function mountSolution(container, q) {
  // Задания SAT — на английском, поэтому разбор сначала английский.
  // Задания из общих банков показываются на языке интерфейса — и разбор тоже.
  let lang = q.local ? getLang() : 'en';

  function body() {
    const ex = q.ex[lang] ?? q.ex.en;
    if (Array.isArray(ex)) return `<ol class="sol-steps">${ex.map((step) => `<li>${step}</li>`).join('')}</ol>`;
    return `<p>${q.local && q.section === 'math' ? ex : esc(ex)}</p>`;
  }

  function render() {
    container.innerHTML = `
      <div class="solution">
        <div class="sol-head">
          <span class="sol-title">💡 ${t('sol.title')}</span>
          <div class="sol-langs" role="group" aria-label="${t('sol.language')}">
            ${['en', 'ru', 'kk'].map((l) => `<button type="button" class="sol-lang ${l === lang ? 'is-active' : ''}" data-sol-lang="${l}">${LABELS[l]}</button>`).join('')}
          </div>
        </div>
        <div class="sol-body" lang="${lang}">${body()}</div>
        ${
          lang === 'en' && !q.local
            ? `<div class="sol-help"><span>${t('sol.notClear')}</span>
                <button type="button" class="btn btn-soft btn-sm" data-sol-lang="ru">Объяснить по-русски</button>
                <button type="button" class="btn btn-soft btn-sm" data-sol-lang="kk">Қазақша түсіндіру</button>
              </div>`
            : ''
        }
      </div>`;
    container.querySelectorAll('[data-sol-lang]').forEach((button) =>
      button.addEventListener('click', () => {
        const next = button.dataset.solLang;
        if (next !== 'en' && lang === 'en' && !q.local) {
          getProfile().counters.langSwitch += 1;
          checkAchievements();
          saveProfile();
        }
        lang = next;
        render();
      }),
    );
  }

  render();
}
