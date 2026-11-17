// Окно гардероба Препи: превью, вкладки по слотам, вещи с подсказкой, как открыть закрытые.

import { t, tx } from '../core/i18n.js';
import { sfx } from '../core/sound.js';
import { syncAchievements } from '../core/profile.js';
import { ITEMS, SLOTS, getOutfit, isUnlocked, toggleItem, unlockHint } from '../core/wardrobe.js';
import { goodName, goodThumb } from './goods-ui.js';
import { mascot } from './mascot.js';
import { openModal } from './overlay.js';

let lastSlot = 'head';

function hintText(it) {
  const h = unlockHint(it);
  if (!h) return '';
  const params = { ...h.params };
  if (params.name && typeof params.name === 'object') params.name = tx(params.name);
  return t(h.key, params);
}

function body(slot) {
  const outfit = getOutfit();
  const items = ITEMS.filter((it) => it.slot === slot);
  const opened = ITEMS.filter((it) => isUnlocked(it)).length;
  return `
    <div class="wardrobe-modal">
      <div class="wm-preview">${mascot('happy', 'mascot-lg float')}<p class="muted small">${t('wear.count', { c: opened, n: ITEMS.length })}</p><a class="btn btn-primary btn-sm wm-shop" href="#/shop">🛍️ ${t('shop.title')}</a></div>
      <div class="wm-side">
        <div class="wm-tabs" role="tablist">
          ${SLOTS.map((s) => `<button type="button" role="tab" class="wm-tab" data-slot="${s}" aria-selected="${s === slot}">${t(`wear.slot.${s}`)}</button>`).join('')}
        </div>
        <div class="wm-items">
          ${items
            .map((it) => {
              const open = isUnlocked(it);
              const on = outfit[it.slot] === it.id;
              return `<button type="button" class="wear-item ${open ? '' : 'is-locked'}" data-item="${it.id}" aria-pressed="${on}" ${open ? '' : 'disabled'}>
                <span class="wear-icon">${goodThumb(it)}${open ? '' : '<i class="wear-lock">🔒</i>'}</span>
                <span class="wear-name">${goodName(it)}</span>
                ${open ? (on ? `<small>✔ ${t('wear.on')}</small>` : '') : `<small>${hintText(it)}</small>`}
              </button>`;
            })
            .join('')}
        </div>
      </div>
    </div>`;
}

/** Открывает гардероб; onChange вызывается после каждой смены наряда (чтобы перерисовать экран). */
export function openWardrobe(onChange) {
  openModal({ title: `👗 ${t('wear.title')}`, body: body(lastSlot) });
  const root = document.getElementById('modal-root');
  const rerender = () => {
    const holder = root.querySelector('.modal-body');
    if (!holder) return;
    holder.innerHTML = body(lastSlot);
    bind();
  };
  function bind() {
    root.querySelector('.wm-shop')?.addEventListener('click', () => {
      root.innerHTML = '';
    });
    root.querySelectorAll('[data-slot]').forEach((b) =>
      b.addEventListener('click', () => {
        lastSlot = b.dataset.slot;
        sfx.tap();
        rerender();
      }),
    );
    root.querySelectorAll('[data-item]').forEach((b) =>
      b.addEventListener('click', () => {
        toggleItem(b.dataset.item);
        syncAchievements();
        sfx.select();
        rerender();
        onChange?.();
      }),
    );
  }
  bind();
}
