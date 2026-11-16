// Переключатель цветовых тем: набор образцов. Нажатия обрабатываются один раз на весь документ.

import { t, tx } from '../core/i18n.js';
import { THEMES, getTheme, setTheme } from '../core/theme.js';

export function themePickerHtml(extra = '') {
  const current = getTheme();
  return `<div class="theme-picker ${extra}" role="radiogroup" aria-label="${t('theme.pick')}">${THEMES.map(
    (theme) => `<button type="button" role="radio" class="theme-swatch ${theme.dark ? 'is-dark' : ''}" data-theme-id="${theme.id}" aria-checked="${theme.id === current}" style="--s1:${theme.colors[0]};--s2:${theme.colors[1]}">
      <span class="swatch-orb" aria-hidden="true"></span>
      <span class="swatch-name">${tx(theme.name)}${theme.dark ? ` <small>· ${t('theme.dark')}</small>` : ''}</span>
    </button>`,
  ).join('')}</div>`;
}

export function bindThemePicker() {
  document.addEventListener('click', (e) => {
    const swatch = e.target.closest?.('[data-theme-id]');
    if (swatch) {
      setTheme(swatch.dataset.themeId);
      document.querySelectorAll('[data-theme-id]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.themeId === getTheme())));
      return;
    }
    // Всплывающее меню тем в верхней панели.
    const toggle = e.target.closest?.('.theme-btn');
    const pop = document.querySelector('.theme-pop');
    if (!pop) return;
    if (toggle) {
      pop.hidden = !pop.hidden;
      toggle.setAttribute('aria-expanded', String(!pop.hidden));
    } else if (!e.target.closest('.theme-pop')) {
      pop.hidden = true;
      document.querySelector('.theme-btn')?.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    const pop = document.querySelector('.theme-pop');
    if (e.key === 'Escape' && pop && !pop.hidden) {
      pop.hidden = true;
      document.querySelector('.theme-btn')?.focus();
    }
  });
}
