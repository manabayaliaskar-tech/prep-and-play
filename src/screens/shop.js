// Магазин Препи: примерка на большом Препи, покупки за монеты, товары дня со скидкой,
// сундуки удачи с шансами, коллекции с наградой и эксклюзивы за достижения.

import { confetti } from '../core/confetti.js';
import { dayKey, msUntilMidnight } from '../core/dates.js';
import { ACH_COINS, XP_PER_COIN, flameSvg, streakMultiplier } from '../core/economy.js';
import { t, tx } from '../core/i18n.js';
import { currentStreak, getProfile, syncAchievements } from '../core/profile.js';
import { BOXES, boxById, boxPool, buyItem, collectionStats, dailyDeals, isOwned, openBox, priceOf, setProgress } from '../core/shop.js';
import { sfx } from '../core/sound.js';
import { storage } from '../core/storage.js';
import { ITEMS, RARITIES, SETS, SLOTS, getOutfit, itemById, toggleItem, unlockHint } from '../core/wardrobe.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { openModal, toast } from '../ui/overlay.js';

const coin = (n) => `<span class="coin-amt">🪙 ${n}</span>`;
const rarityLabel = (r) => `<span class="rarity r-${r}">${t(`rar.${r}`)}</span>`;
const itemName = (it) => t(`wear.${it.id}`);

function hintText(it) {
  const h = unlockHint(it);
  if (!h) return '';
  const params = { ...h.params };
  if (params.name && typeof params.name === 'object') params.name = tx(params.name);
  return t(h.key, params);
}

function timeLeft() {
  const ms = msUntilMidnight();
  return t('shop.dealsIn', { h: Math.floor(ms / 3600000), m: Math.floor((ms % 3600000) / 60000) });
}

export function shopRoute(app) {
  let tab = storage.get('shopTab', 'head');
  if (!SLOTS.includes(tab)) tab = 'head';
  let rarity = 'all';
  let tryId = null;

  const render = () => {
    const p = getProfile();
    const day = dayKey();
    const outfit = getOutfit(p);
    const tried = tryId ? itemById(tryId) : null;
    const preview = tried ? { ...outfit, [tried.slot]: tried.id } : outfit;
    const deals = dailyDeals(day);
    const stats = collectionStats(p);
    const streak = currentStreak();
    const mult = streakMultiplier(streak);

    const itemCard = (it, deal = null) => {
      const owned = isOwned(it, p);
      const worn = outfit[it.slot] === it.id;
      const forSale = it.unlock?.type === 'shop';
      const price = forSale ? priceOf(it, day) : 0;
      let foot;
      if (worn) foot = `<span class="si-state is-worn">✔ ${t('wear.on')}</span>`;
      else if (owned) foot = `<span class="si-state">${t('shop.owned')}</span>`;
      else if (forSale)
        foot = `<span class="si-price ${p.coins >= price ? '' : 'is-short'}">${deal ? `<s>${it.unlock.value}</s> ` : ''}${coin(price)}</span>`;
      else foot = `<span class="si-lock">🔒 ${esc(hintText(it))}</span>`;
      return `<button type="button" class="shop-item r-${it.rarity} ${owned ? 'is-owned' : ''} ${worn ? 'is-worn' : ''} ${tryId === it.id ? 'is-tried' : ''} ${!forSale && !owned ? 'is-exclusive' : ''}" data-try="${it.id}">
        ${deal ? `<span class="si-deal">−${deal.discount}%</span>` : ''}
        <span class="si-icon">${it.icon}</span>
        <span class="si-name">${itemName(it)}</span>
        ${rarityLabel(it.rarity)}
        ${foot}
      </button>`;
    };

    // Панель примерки: что сейчас выбрано и что с этим можно сделать.
    let stageInfo = `<p class="muted small">${t('shop.tryHint')}</p>`;
    if (tried) {
      const owned = isOwned(tried, p);
      const worn = outfit[tried.slot] === tried.id;
      const forSale = tried.unlock?.type === 'shop';
      const price = forSale ? priceOf(tried, day) : 0;
      let action;
      if (owned) action = `<button type="button" class="btn ${worn ? 'btn-soft' : 'btn-primary'} shop-wear">${worn ? t('shop.takeOff') : t('shop.wear')}</button>`;
      else if (forSale)
        action =
          p.coins >= price
            ? `<button type="button" class="btn btn-primary shop-buy">${t('shop.buy')} ${coin(price)}</button>`
            : `<button type="button" class="btn btn-soft" disabled>${t('shop.short', { n: price - p.coins })}</button>`;
      else action = `<p class="si-lock">🔒 ${esc(hintText(tried))}</p>`;
      stageInfo = `
        <div class="stage-item"><span class="stage-icon">${tried.icon}</span><div><b>${itemName(tried)}</b>${rarityLabel(tried.rarity)}</div></div>
        <div class="stage-actions">${action}<button type="button" class="link-btn shop-reset">${t('shop.reset')}</button></div>`;
    }

    const items = ITEMS.filter((it) => it.slot === tab && (rarity === 'all' || it.rarity === rarity) && it.id !== 'classic' && it.id !== 'cap');

    app.innerHTML = `
      <section class="page shop-page">
        <div class="shop-layout">
          <aside class="shop-stage r-${tried?.rarity ?? 'none'}">
            <div class="stage-prepi ${tried ? 'is-trying' : ''}">${mascot(tried ? 'wow' : 'happy', 'mascot-xl float', preview)}</div>
            <div class="stage-info">${stageInfo}</div>
          </aside>

          <div class="shop-main">
            <header class="shop-head">
              <div>
                <h1>🛍️ ${t('shop.title')}</h1>
                <p class="muted">${t('shop.sub')}</p>
              </div>
              <div class="coin-balance" title="${t('shop.balance')}"><span class="coin-big">🪙</span><b>${p.coins}</b></div>
            </header>

            <div class="earn-row">
              <span class="earn-chip">⚡ ${t('shop.earnXp', { n: XP_PER_COIN })}</span>
              <span class="earn-chip">🏆 ${t('shop.earnAch', { n: ACH_COINS })}</span>
              <span class="earn-chip">⭐ ${t('shop.earnLevel')}</span>
              <span class="earn-chip">🎁 ${t('shop.earnGift')}</span>
              <span class="earn-chip ${mult > 1 ? 'is-hot' : ''}">${flameSvg(streak)} ${mult > 1 ? t('shop.earnMult', { m: mult }) : t('shop.earnMultNone')}</span>
            </div>

            <section class="shop-block deals">
              <div class="shop-block-head"><h2>🔥 ${t('shop.deals')}</h2><span class="deal-timer">⏳ ${timeLeft()}</span></div>
              <div class="deal-grid">${deals.map((d) => itemCard(itemById(d.id), d)).join('')}</div>
            </section>

            <section class="shop-block">
              <div class="shop-block-head"><h2>🎰 ${t('shop.boxes')}</h2><span class="muted small">${t('shop.boxesSub')}</span></div>
              <div class="box-grid">
                ${BOXES.map((b) => {
                  const empty = !boxPool(b, p).length;
                  return `<div class="box-card box-${b.id}">
                    <span class="box-icon">${b.icon}</span>
                    <b>${t(`box.${b.id}`)}</b>
                    <div class="box-odds">${RARITIES.filter((r) => b.odds[r]).map((r) => `<span class="rarity r-${r}">${t(`rar.${r}`)} ${b.odds[r]}%</span>`).join('')}</div>
                    <button type="button" class="btn ${p.coins >= b.price && !empty ? 'btn-primary' : 'btn-soft'} box-open" data-box="${b.id}" ${p.coins >= b.price && !empty ? '' : 'disabled'}>${empty ? t('shop.boxEmpty') : `${t('shop.open')} ${coin(b.price)}`}</button>
                  </div>`;
                }).join('')}
              </div>
            </section>

            <section class="shop-block">
              <div class="shop-block-head"><h2>👕 ${t('shop.catalog')}</h2><span class="muted small">${t('shop.collected', { c: stats.got, n: stats.total })}</span></div>
              <div class="shop-tabs" role="tablist">
                ${SLOTS.map((s) => `<button type="button" role="tab" class="shop-tab ${s === tab ? 'is-active' : ''}" aria-selected="${s === tab}" data-tab="${s}">${t(`wear.slot.${s}`)}</button>`).join('')}
              </div>
              <div class="rarity-filter">
                ${['all', ...RARITIES].map((r) => `<button type="button" class="rf ${r === rarity ? 'is-active' : ''} ${r === 'all' ? '' : `r-${r}`}" data-rarity="${r}">${r === 'all' ? t('shop.allRar') : t(`rar.${r}`)}</button>`).join('')}
              </div>
              <div class="shop-grid">${items.map((it) => itemCard(it)).join('') || `<p class="muted">${t('shop.none')}</p>`}</div>
            </section>

            <section class="shop-block">
              <div class="shop-block-head"><h2>🧩 ${t('shop.sets')}</h2><span class="muted small">${t('shop.setsSub')}</span></div>
              <div class="set-grid">
                ${SETS.map((set) => {
                  const pr = setProgress(set, p);
                  return `<div class="set-card ${pr.claimed ? 'is-done' : ''}">
                    <div class="set-top"><span class="set-icon">${set.icon}</span><div><b>${t(`set.${set.id}`)}</b><small>${pr.claimed ? `✔ ${t('shop.setDone')}` : t('shop.setReward', { n: set.coins })}</small></div><span class="set-count">${pr.got}/${pr.total}</span></div>
                    <div class="set-items">${set.items.map((id) => {
                      const it = itemById(id);
                      return `<button type="button" class="set-item r-${it.rarity} ${isOwned(it, p) ? 'is-owned' : ''}" data-try="${id}" title="${itemName(it)}">${it.icon}</button>`;
                    }).join('')}</div>
                    <div class="bar"><i style="width:${Math.round((pr.got / pr.total) * 100)}%"></i></div>
                  </div>`;
                }).join('')}
              </div>
            </section>
          </div>
        </div>
      </section>`;

    bind();
  };

  function bind() {
    app.querySelectorAll('[data-try]').forEach((b) =>
      b.addEventListener('click', () => {
        const it = itemById(b.dataset.try);
        if (!it) return;
        tryId = tryId === it.id ? null : it.id;
        if (tryId && it.slot !== tab && b.closest('.set-items')) tab = it.slot;
        sfx.tap();
        render();
        if (tryId && window.matchMedia('(max-width: 860px)').matches) app.querySelector('.shop-stage')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }),
    );
    app.querySelectorAll('[data-tab]').forEach((b) =>
      b.addEventListener('click', () => {
        tab = b.dataset.tab;
        storage.set('shopTab', tab);
        sfx.tap();
        render();
      }),
    );
    app.querySelectorAll('[data-rarity]').forEach((b) =>
      b.addEventListener('click', () => {
        rarity = b.dataset.rarity;
        sfx.tap();
        render();
      }),
    );
    app.querySelector('.shop-reset')?.addEventListener('click', () => {
      tryId = null;
      render();
    });
    app.querySelector('.shop-wear')?.addEventListener('click', () => {
      toggleItem(tryId);
      syncAchievements();
      sfx.select();
      render();
    });
    app.querySelector('.shop-buy')?.addEventListener('click', () => {
      const res = buyItem(tryId);
      if (!res.ok) return;
      const it = itemById(tryId);
      sfx.coin();
      if (it.rarity !== 'common') confetti({ count: it.rarity === 'legendary' ? 220 : 110 });
      toast(`<span class="toast-icon">${it.icon}</span><span><small>${t('shop.bought')}</small><b>${itemName(it)}</b></span>`, { kind: 'achievement', duration: 3600 });
      announceSets(res.sets);
      syncAchievements();
      tryId = null;
      render();
      app.querySelector('.stage-prepi')?.classList.add('is-celebrating');
    });
    app.querySelectorAll('.box-open').forEach((b) => b.addEventListener('click', () => openBoxModal(b.dataset.box, render)));
  }

  render();
  return { relabel: render };
}

function announceSets(sets) {
  for (const set of sets ?? []) {
    sfx.win();
    confetti({ count: 200 });
    toast(`<span class="toast-icon">${set.icon}</span><span><small>${t('shop.setComplete')}</small><b>${t(`set.${set.id}`)} · +${set.coins} 🪙</b></span>`, { kind: 'achievement', duration: 5200 });
  }
}

/** Окно сундука удачи: сундук трясётся, раскрывается и показывает вещь её редкости. */
export function openBoxModal(boxId, onDone, { free = false } = {}) {
  const box = boxById(boxId);
  if (!box) return;
  const close = openModal({
    title: `${box.icon} ${t(`box.${box.id}`)}`,
    body: `<div class="lootbox-stage">
      <button type="button" class="lootbox" aria-label="${t('shop.open')}"><span>${box.icon}</span></button>
      <p class="muted">${free ? t('season.boxFree') : t('shop.boxTap', { n: box.price })}</p>
    </div>`,
  });
  const stage = document.querySelector('.lootbox-stage');
  const btn = stage?.querySelector('.lootbox');
  btn?.addEventListener('click', () => {
    if (btn.classList.contains('is-opening')) return;
    const res = openBox(boxId, Math.random, { free });
    if (!res.ok) return close();
    btn.classList.add('is-opening');
    sfx.tap();
    setTimeout(() => {
      const it = res.item;
      if (!it) {
        stage.innerHTML = `<div class="loot-reveal r-rare"><div class="loot-rays"></div><span class="loot-icon">🪙</span><b class="loot-name">+${res.coins} 🪙</b><p class="muted small">${t('season.allOwned')}</p><div class="loot-actions"><button type="button" class="btn btn-primary loot-close">${t('shop.great')}</button></div></div>`;
        sfx.coin();
        onDone?.();
        stage.querySelector('.loot-close')?.addEventListener('click', close);
        return;
      }
      const outfit = { ...getOutfit(), [it.slot]: it.id };
      stage.innerHTML = `
        <div class="loot-reveal r-${it.rarity}">
          <div class="loot-rays"></div>
          <div class="loot-prepi">${mascot('win', 'mascot-lg', outfit)}</div>
          <span class="loot-icon">${it.icon}</span>
          <b class="loot-name">${itemName(it)}</b>
          ${rarityLabel(it.rarity)}
          <p class="muted small">${t('shop.boxWorn')}</p>
          <div class="loot-actions">
            ${!free && getProfile().coins >= box.price && boxPool(box).length ? `<button type="button" class="btn btn-primary loot-again">${t('shop.again')} ${coin(box.price)}</button>` : ''}
            <button type="button" class="btn btn-soft loot-close">${t('shop.great')}</button>
          </div>
        </div>`;
      it.rarity === 'common' ? sfx.coin() : sfx.win();
      confetti({ count: { common: 60, rare: 120, epic: 180, legendary: 280 }[it.rarity] });
      announceSets(res.sets);
      syncAchievements();
      onDone?.();
      stage.querySelector('.loot-close')?.addEventListener('click', close);
      stage.querySelector('.loot-again')?.addEventListener('click', () => {
        close();
        openBoxModal(boxId, onDone);
      });
    }, 1300);
  });
}
