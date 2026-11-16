// Верхняя панель: логотип, разделы сайта, серия дней, уровень, язык, звук.

import { LANGS, getLang, setLang, t } from '../core/i18n.js';
import { currentStreak, getProfile, levelInfo, saveProfile } from '../core/profile.js';
import { currentPath } from '../core/router.js';
import { groupOfPath } from '../catalog/index.js';
import { LOGO } from './mascot.js';
import { themePickerHtml } from './theme-picker.js';

/** Переключатель языка. Нажатия обрабатываются один раз на весь документ (см. main.js). */
export function langSwitchHtml(extra = '') {
  return `<div class="lang-switch ${extra}" role="group" aria-label="Language">${LANGS.map(
    (l) => `<button type="button" data-lang="${l.id}" class="${l.id === getLang() ? 'is-active' : ''}" aria-pressed="${l.id === getLang()}">${l.label}</button>`,
  ).join('')}</div>`;
}

export function bindLangSwitches() {
  document.addEventListener('click', (e) => {
    const button = e.target.closest?.('[data-lang]');
    if (button) setLang(button.dataset.lang);
  });
}

export function renderTopbar() {
  const el = document.getElementById('topbar');
  if (!el) return;
  const p = getProfile();
  const lvl = levelInfo(p.xp);
  const streak = currentStreak();
  const path = currentPath();
  const group = groupOfPath(path);
  const item = (href, key, icon, active) =>
    `<a class="nav-item ${active ? 'is-active' : ''}" href="#${href}" ${active ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span><span class="nav-label">${t(key)}</span></a>`;
  el.innerHTML = `
    <div class="topbar-inner">
      <a class="logo" href="#/" aria-label="Prep&amp;Play">${LOGO}<span class="logo-text">Prep<span class="logo-amp">&amp;</span>Play</span></a>
      <nav class="nav" aria-label="${t('nav.label')}">
        ${item('/', 'nav.home', '🏠', path === '/')}
        ${item('/practice', 'nav.practice', '📅', group === 'daily')}
        ${item('/exams', 'nav.exams', '📝', group === 'exams')}
        ${item('/c/olymp', 'nav.olymp', '🏆', group === 'olymp')}
        ${item('/code', 'nav.code', '💻', group === 'code')}
        ${item('/profile', 'nav.profile', '👤', path.startsWith('/profile') || path.startsWith('/achievements'))}
      </nav>
      <div class="top-stats">
        <span class="stat-chip streak ${streak ? 'is-on' : ''}" title="${t('top.streak')}">🔥 <b>${streak}</b></span>
        <span class="stat-chip level" title="${t('top.level')}">
          <span class="lvl-badge">${lvl.level}</span>
          <span class="lvl-bar" aria-hidden="true"><i style="width:${Math.round((lvl.into / lvl.need) * 100)}%"></i></span>
        </span>
      </div>
      ${langSwitchHtml()}
      <a class="icon-btn premium-link ${path.startsWith('/premium') ? 'is-active' : ''}" href="#/premium" aria-label="${t('nav.premium')}" title="${t('nav.premium')}">💎</a>
      <div class="theme-menu">
        <button type="button" class="icon-btn theme-btn" aria-label="${t('theme.title')}" title="${t('theme.title')}" aria-haspopup="true" aria-expanded="false">🎨</button>
        <div class="theme-pop" hidden><p class="theme-pop-title">${t('theme.pick')}</p>${themePickerHtml()}</div>
      </div>
      <button type="button" class="icon-btn sound-toggle" aria-label="${t('top.sound')}" title="${t('top.sound')}">${p.sound ? '🔊' : '🔇'}</button>
    </div>`;
  el.querySelector('.sound-toggle').addEventListener('click', () => {
    p.sound = !p.sound;
    saveProfile();
  });
}
