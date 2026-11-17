// Разбор решения: сначала на английском (как на экзамене), потом можно переключить на русский или казахский.

import { getLang, t } from '../core/i18n.js';
import { checkAchievements, getProfile, saveProfile } from '../core/profile.js';
import { esc } from './dom.js';

const LABELS = { en: 'EN', ru: 'RU', kk: 'KZ' };

/**
 * stepwise — длинное решение (3+ шагов) открывается по шагу: «Следующий шаг» / «Показать всё».
 * Так ученик может попробовать продолжить сам, а не просто прочитать ответ.
 */
export function mountSolution(container, q, { stepwise = false } = {}) {
  // Задания SAT — на английском, поэтому разбор сначала английский.
  // Задания из общих банков показываются на языке интерфейса — и разбор тоже.
  let lang = q.local ? getLang() : 'en';
  const total = Array.isArray(q.ex?.en ?? q.ex?.ru) ? (q.ex.en ?? q.ex.ru).length : 0;
  let shown = stepwise && total >= 3 ? 1 : Infinity;

  function body() {
    const ex = q.ex[lang] ?? q.ex.en;
    if (Array.isArray(ex)) {
      const open = Math.min(shown, ex.length);
      const items = ex.slice(0, open).map((step, i) => `<li class="${i === open - 1 && shown !== Infinity ? 'is-new' : ''}">${step}</li>`).join('');
      const more =
        open < ex.length
          ? `<div class="sol-stepper"><span class="sol-count">${t('sol.stepOf', { i: open, n: ex.length })}</span>
              <button type="button" class="btn btn-primary btn-sm sol-next">${t('sol.next')} ▸</button>
              <button type="button" class="link-btn sol-all">${t('sol.all')}</button></div>
             <p class="sol-try muted small">${t('sol.tryNext')}</p>`
          : '';
      return `<ol class="sol-steps">${items}</ol>${more}`;
    }
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
    container.querySelector('.sol-next')?.addEventListener('click', () => {
      shown += 1;
      if (shown >= total) shown = Infinity;
      render();
      container.querySelector('.sol-next')?.focus({ preventScroll: true });
    });
    container.querySelector('.sol-all')?.addEventListener('click', () => {
      shown = Infinity;
      render();
    });
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
