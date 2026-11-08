// Всплывающие уведомления (тосты) и модальные окна.

import { t } from '../core/i18n.js';

export function toast(html, { kind = 'info', duration = 3200 } = {}) {
  const root = document.getElementById('toasts');
  if (!root) return;
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.innerHTML = html;
  root.append(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 350);
  }, duration);
}

export function openModal({ title = '', body = '', actions = [] } = {}) {
  const root = document.getElementById('modal-root');
  const previous = document.activeElement;
  root.innerHTML = `
    <div class="modal-backdrop" data-close>
      <div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
        <div class="modal-head"><h2>${title}</h2><button type="button" class="icon-btn" data-close aria-label="${t('common.close')}">✕</button></div>
        <div class="modal-body">${body}</div>
        ${actions.length ? `<div class="modal-actions">${actions.map((a, i) => `<button type="button" class="btn ${a.primary ? 'btn-primary' : a.danger ? 'btn-danger' : 'btn-soft'}" data-action="${i}">${a.label}</button>`).join('')}</div>` : ''}
      </div>
    </div>`;
  const close = () => {
    root.innerHTML = '';
    document.removeEventListener('keydown', onKey);
    previous?.focus?.();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKey);
  root.querySelector('.modal-backdrop').addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) close();
  });
  root.querySelectorAll('[data-close]').forEach((b) => b.tagName === 'BUTTON' && b.addEventListener('click', close));
  root.querySelectorAll('[data-action]').forEach((b) =>
    b.addEventListener('click', () => {
      const action = actions[Number(b.dataset.action)];
      close();
      action.onClick?.();
    }),
  );
  root.querySelector('.modal button')?.focus();
  return close;
}
