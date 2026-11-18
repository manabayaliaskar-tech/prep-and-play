// Магазин Препи 3.0. Слева — сцена: Препи в своей комнате, на нём примеряется выбранная вещь.
// Справа — разделы: Витрина (товары дня, набор недели, подборка), Гардероб, Комната, Эмоции, Наборы, Сундуки.

import { confetti } from '../core/confetti.js';
import { dayKey, msUntilMidnight } from '../core/dates.js';
import { ACH_COINS, XP_PER_COIN, flameSvg, streakMultiplier } from '../core/economy.js';
import { GOODS, forSale, goodById, hasGood } from '../core/goods.js';
import { t, tx } from '../core/i18n.js';
import { currentStreak, getProfile, syncAchievements } from '../core/profile.js';
import { createRng, shuffle } from '../core/random.js';
import {
  BOXES,
  DUP_SHARDS,
  SET_BONUS,
  SET_DISCOUNT,
  SHARD_PRICES,
  activeSet,
  boxById,
  buyItem,
  buySet,
  buyWithShards,
  collectionStats,
  dailyDeals,
  getEmote,
  getRoom,
  openBox,
  pityLeft,
  priceOf,
  setEmote,
  setPrice,
  setProgress,
  shopGoods,
  toggleRoomItem,
  wearSet,
} from '../core/shop.js';
import { sfx } from '../core/sound.js';
import { storage } from '../core/storage.js';
import { ITEMS, RARITIES, SETS, SLOTS, getOutfit, itemById, toggleItem, unlockHint } from '../core/wardrobe.js';
import * as roomArt from '../ui/art/room.js';
import { animateCoin, coinHtml } from '../ui/coin.js';
import { esc } from '../ui/dom.js';
import { goodName, goodThumb, kindLabel, rarityPill } from '../ui/goods-ui.js';
import { mascot } from '../ui/mascot.js';
import { openModal, toast } from '../ui/overlay.js';
import { chestSvg, shardHtml } from '../ui/shop-art.js';

export const SHOP_TABS = ['home', 'wear', 'room', 'emote', 'sets', 'chests'];
const TAB_ICON = { home: '✨', wear: '👕', room: '🛋️', emote: '💃', sets: '🧩', chests: '🎁' };
const SLOT_ICON = { head: '🎩', face: '👓', neck: '🧣', body: '👕', feet: '👟', hand: '✋', back: '🎒', color: '🎨', aura: '✨', pet: '🐾' };

const coin = (n) => `<span class="coin-amt">🪙 ${n}</span>`;
const shards = (n) => `<span class="shard-amt">${shardHtml()} ${n}</span>`;

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

const seedOf = (text) => [...text].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);
const weekIndex = (day) => Math.floor(Date.parse(`${day}T00:00:00Z`) / (7 * 86400000));
/** Набор недели — меняется каждый понедельник. */
export const weeklySet = (day = dayKey()) => SETS[((weekIndex(day) % SETS.length) + SETS.length) % SETS.length];

/** Наряд, в котором показывается набор целиком. */
function setOutfit(set, base) {
  const outfit = { ...base };
  for (const id of set.items) {
    const it = itemById(id);
    if (it) outfit[it.slot] = it.id;
  }
  return outfit;
}

const roomSlots = () => (roomArt.ROOM_SLOTS?.length ? roomArt.ROOM_SLOTS : [...new Set(shopGoods('room').map((g) => g.slot))]);
const scene = (room, prepi, opts) => (roomArt.roomScene ? roomArt.roomScene(room, prepi, opts) : `<div class="room-scene">${prepi}</div>`);

let routeSeq = 0;

export function shopRoute(app, params = {}) {
  const me = ++routeSeq;
  // Таймеры (праздник после покупки) не должны перерисовывать магазин, если уже открыт другой экран или вкладка.
  const alive = () => me === routeSeq && app.querySelector('.shop3');
  let tab = SHOP_TABS.includes(params.tab) ? params.tab : storage.get('shopTab3', 'home');
  if (!SHOP_TABS.includes(tab)) tab = 'home';
  let wearSlot = storage.get('shopSlot', 'head');
  if (!SLOTS.includes(wearSlot)) wearSlot = 'head';
  let roomSlot = null;
  let rarity = 'all';
  let owned = 'all';
  let tryId = null;
  let trySetId = null;
  let celebrate = false;

  const render = () => {
    const p = getProfile();
    const day = dayKey();
    const outfit = getOutfit(p);
    const room = getRoom(p);
    const tried = tryId ? goodById(tryId) : null;
    const triedSet = trySetId ? SETS.find((x) => x.id === trySetId) ?? null : null;
    const previewOutfit = triedSet ? setOutfit(triedSet, outfit) : tried?.kind === 'wear' ? { ...outfit, [tried.slot]: tried.id } : outfit;
    const previewRoom = tried?.kind === 'room' ? { ...room, [tried.slot]: tried.id } : room;
    const emote = tried?.kind === 'emote' ? tried.id : celebrate ? getEmote(p) : null;
    const mood = celebrate ? 'starstruck' : triedSet ? (setProgress(triedSet, p).done ? 'proud' : 'wow') : tried && !hasGood(tried, p) ? 'wow' : 'happy';
    const deals = dailyDeals(day);
    const dealOf = (id) => deals.find((d) => d.id === id) ?? null;
    const set = activeSet(p, outfit);
    const slots = roomSlots();
    if (!roomSlot || !slots.includes(roomSlot)) roomSlot = slots[0] ?? null;

    // ---------- Карточка товара ----------
    const card = (g, { big = false } = {}) => {
      const has = hasGood(g, p);
      const on = g.kind === 'wear' ? outfit[g.slot] === g.id : g.kind === 'room' ? room[g.slot] === g.id : getEmote(p) === g.id;
      const deal = dealOf(g.id);
      let foot;
      if (on) foot = `<span class="gc-state is-on">✔ ${g.kind === 'room' ? t('shop3.placed') : g.kind === 'emote' ? t('shop3.victory') : t('wear.on')}</span>`;
      else if (has) foot = `<span class="gc-state">${t('shop.owned')}</span>`;
      else if (forSale(g)) {
        const price = priceOf(g, day);
        foot = `<span class="gc-price ${p.coins >= price ? '' : 'is-short'}">${deal ? `<s>${g.unlock.value}</s>` : ''}${coin(price)}</span>`;
      } else foot = `<span class="gc-lock">🔒 ${esc(hintText(g))}</span>`;
      return `<button type="button" class="gcard r-${g.rarity} ${has ? 'is-owned' : ''} ${on ? 'is-on' : ''} ${tryId === g.id ? 'is-tried' : ''} ${big ? 'is-big' : ''}" data-try="${g.id}" aria-pressed="${tryId === g.id}">
        ${deal ? `<span class="gc-deal">−${deal.discount}%</span>` : ''}
        <span class="gc-rar" title="${t(`rar.${g.rarity}`)}"></span>
        <span class="gc-art">${goodThumb(g)}</span>
        <span class="gc-name">${esc(goodName(g))}</span>
        ${big ? `<span class="gc-kind">${kindLabel(g)}</span>` : ''}
        <span class="gc-foot">${foot}</span>
      </button>`;
    };

    const filterOwned = (list) => list.filter((g) => (rarity === 'all' || g.rarity === rarity) && (owned === 'all' || (owned === 'mine' ? hasGood(g, p) : !hasGood(g, p))));
    const filters = () => `<div class="s3-filters">
        <div class="chip-row">${['all', ...RARITIES].map((r) => `<button type="button" class="fchip ${r === rarity ? 'is-active' : ''} ${r === 'all' ? '' : `r-${r}`}" data-rarity="${r}">${r === 'all' ? t('shop.allRar') : t(`rar.${r}`)}</button>`).join('')}</div>
        <div class="chip-row">${['all', 'mine', 'new'].map((o) => `<button type="button" class="fchip ${o === owned ? 'is-active' : ''}" data-owned="${o}">${t(`shop3.f.${o}`)}</button>`).join('')}</div>
      </div>`;
    const grid = (list) => (list.length ? `<div class="ggrid">${list.map((g) => card(g)).join('')}</div>` : `<p class="muted s3-empty">${t('shop.none')}</p>`);

    // ---------- Разделы ----------
    let body = '';
    if (tab === 'home') {
      const ws = weeklySet(day);
      const wsProg = setProgress(ws, p);
      const wsOffer = setPrice(ws, p, day);
      const rng = createRng(seedOf(`pick:${day}`));
      const picks = shuffle(shopGoods().filter((g) => !hasGood(g, p) && !dealOf(g.id)), rng).slice(0, 8);
      const stats = collectionStats(p);
      body = `
        <section class="s3-block">
          <div class="s3-head"><h2>🔥 ${t('shop.deals')}</h2><span class="deal-timer">⏳ ${timeLeft()}</span></div>
          <div class="ggrid deals">${deals.map((d) => card(goodById(d.id), { big: true })).join('')}</div>
        </section>
        <section class="s3-block week-set r-legendary">
          <button type="button" class="ws-prepi" data-tryset="${ws.id}" aria-label="${t('shop3.trySet')}">${mascot('proud', 'mascot-set float', setOutfit(ws, outfit))}</button>
          <div class="ws-text">
            <span class="ws-kicker">⭐ ${t('shop3.weekSet')}</span>
            <h2>${set?.id === ws.id ? '✔ ' : ''}${t(`set.${ws.id}`)}</h2>
            <p class="muted small">${t('shop3.setPerks', { n: ws.coins, b: SET_BONUS })}</p>
            <div class="ws-items">${ws.items.map((id) => `<button type="button" class="ws-item r-${goodById(id)?.rarity} ${hasGood(id, p) ? 'is-owned' : ''}" data-try="${id}" title="${esc(goodName(id))}">${goodThumb(id)}</button>`).join('')}</div>
            <div class="ws-actions">
              ${wsOffer?.missing.length ? `<button type="button" class="btn btn-primary set-buy" data-set="${ws.id}" ${p.coins >= wsOffer.price ? '' : 'disabled'}>${t('shop3.buySet')} ${coin(wsOffer.price)} <s class="muted">${wsOffer.full}</s></button>` : ''}
              ${wsProg.done ? `<button type="button" class="btn btn-soft set-wear" data-set="${ws.id}">${t('shop3.wearSet')}</button>` : ''}
              <button type="button" class="link-btn" data-tab="sets">${t('shop3.allSets')} →</button>
            </div>
          </div>
        </section>
        <section class="s3-block">
          <div class="s3-head"><h2>🎯 ${t('shop3.picks')}</h2><span class="muted small">${t('shop.collected', { c: stats.got, n: stats.total })}</span></div>
          ${grid(picks)}
        </section>
        <section class="s3-block earn">
          <h2>🪙 ${t('shop3.earn')}</h2>
          <div class="earn-row">
            <span class="earn-chip">⚡ ${t('shop.earnXp', { n: XP_PER_COIN })}</span>
            <span class="earn-chip">🏆 ${t('shop.earnAch', { n: ACH_COINS })}</span>
            <span class="earn-chip">⭐ ${t('shop.earnLevel')}</span>
            <span class="earn-chip">🎁 ${t('shop.earnGift')}</span>
            <span class="earn-chip ${streakMultiplier(currentStreak()) > 1 ? 'is-hot' : ''}">${flameSvg(currentStreak())} ${streakMultiplier(currentStreak()) > 1 ? t('shop.earnMult', { m: streakMultiplier(currentStreak()) }) : t('shop.earnMultNone')}</span>
            <span class="earn-chip">🧩 ${t('shop3.earnSet', { b: SET_BONUS })}</span>
          </div>
        </section>`;
    } else if (tab === 'wear') {
      const all = ITEMS.filter((it) => it.slot === wearSlot && it.id !== 'classic' && it.id !== 'cap');
      body = `
        <div class="slot-row" role="tablist">${SLOTS.map((s) => {
          const list = ITEMS.filter((it) => it.slot === s);
          return `<button type="button" role="tab" class="slot-chip ${s === wearSlot ? 'is-active' : ''}" aria-selected="${s === wearSlot}" data-slot="${s}"><span>${SLOT_ICON[s]}</span>${t(`wear.slot.${s}`)}<small>${list.filter((it) => hasGood(it, p)).length}/${list.length}</small></button>`;
        }).join('')}</div>
        ${filters()}
        ${grid(filterOwned(all))}`;
    } else if (tab === 'room') {
      const all = GOODS.filter((g) => g.kind === 'room' && g.slot === roomSlot);
      body = `
        <div class="slot-row" role="tablist">${slots.map((s) => `<button type="button" role="tab" class="slot-chip ${s === roomSlot ? 'is-active' : ''}" aria-selected="${s === roomSlot}" data-rslot="${s}">${t(`room.slot.${s}`)}</button>`).join('')}</div>
        ${filters()}
        ${all.length ? grid(filterOwned(all)) : `<p class="muted s3-empty">${t('shop3.roomSoon')}</p>`}`;
    } else if (tab === 'emote') {
      const all = GOODS.filter((g) => g.kind === 'emote');
      body = `
        <p class="muted s3-lead">${t('shop3.emoteLead')}</p>
        ${filters()}
        ${all.length ? grid(filterOwned(all)) : `<p class="muted s3-empty">${t('shop3.emoteSoon')}</p>`}`;
    } else if (tab === 'sets') {
      body = `<p class="muted s3-lead">${t('shop3.setsLead', { b: SET_BONUS, d: SET_DISCOUNT })}</p>
        <div class="set3-grid">${SETS.map((s) => {
          const pr = setProgress(s, p);
          const offer = setPrice(s, p, day);
          const isActive = set?.id === s.id;
          return `<article class="set3 ${pr.claimed ? 'is-done' : ''} ${isActive ? 'is-active' : ''}">
            <div class="set3-prepi" data-tryset="${s.id}" role="button" tabindex="0" title="${t('shop3.trySet')}">${mascot(isActive ? 'proud' : 'happy', 'mascot-set', setOutfit(s, outfit))}</div>
            <div class="set3-body">
              <div class="set3-top"><h3>${t(`set.${s.id}`)}</h3><span class="set-count">${pr.got}/${pr.total}</span></div>
              <small class="muted">${pr.claimed ? `✔ ${t('shop.setDone')}` : t('shop.setReward', { n: s.coins })} · ${isActive ? `<b class="set-bonus-on">+${SET_BONUS}% 🪙 ${t('shop3.bonusOn')}</b>` : t('shop3.bonusIf', { b: SET_BONUS })}</small>
              <div class="set3-items">${s.items.map((id) => `<button type="button" class="set3-item r-${goodById(id)?.rarity} ${hasGood(id, p) ? 'is-owned' : ''}" data-try="${id}" title="${esc(goodName(id))}">${goodThumb(id)}</button>`).join('')}</div>
              <div class="bar"><i style="width:${Math.round((pr.got / pr.total) * 100)}%"></i></div>
              <div class="set3-actions">
                ${pr.done ? (isActive ? `<span class="gc-state is-on">✔ ${t('shop3.setOn')}</span>` : `<button type="button" class="btn btn-primary btn-sm set-wear" data-set="${s.id}">${t('shop3.wearSet')}</button>`) : ''}
                ${offer?.missing.length ? `<button type="button" class="btn ${p.coins >= offer.price ? 'btn-primary' : 'btn-soft'} btn-sm set-buy" data-set="${s.id}" ${p.coins >= offer.price ? '' : 'disabled'}>${t('shop3.buyMissing', { n: offer.missing.length })} ${coin(offer.price)}</button>` : ''}
              </div>
            </div>
          </article>`;
        }).join('')}</div>`;
    } else if (tab === 'chests') {
      body = `
        <div class="chest-grid">${BOXES.map((b) => {
          const left = pityLeft(b, p);
          return `<div class="chest-card chest-${b.id}">
            <button type="button" class="chest-art" data-box="${b.id}" aria-label="${t('shop.open')}">${chestSvg(b.id)}</button>
            <b>${t(`box.${b.id}`)}</b>
            <div class="odds">${RARITIES.filter((r) => b.odds[r]).map((r) => `<div class="odd r-${r}"><span>${t(`rar.${r}`)}</span><i style="width:${b.odds[r]}%"></i><b>${b.odds[r]}%</b></div>`).join('')}</div>
            ${left ? `<small class="pity">🌟 ${t('shop3.pity', { n: left })}</small>` : `<small class="pity muted">${t('shop3.noPity')}</small>`}
            <button type="button" class="btn ${p.coins >= b.price ? 'btn-primary' : 'btn-soft'} box-open" data-box="${b.id}" ${p.coins >= b.price ? '' : 'disabled'}>${t('shop.open')} ${coin(b.price)}</button>
          </div>`;
        }).join('')}</div>
        <section class="s3-block shard-info">
          <div class="s3-head"><h2>${shardHtml('shard-lg')} ${t('shop3.shards')}</h2>${shards(p.shards ?? 0)}</div>
          <p class="muted small">${t('shop3.shardsLead')}</p>
          <div class="shard-table">${RARITIES.map((r) => `<div class="shard-row r-${r}">${rarityPill(r)}<span>${t('shop3.dupGives')} <b>+${DUP_SHARDS[r]}</b></span><span>${t('shop3.exchange')} <b>${SHARD_PRICES[r]}</b> ${shardHtml()}</span></div>`).join('')}</div>
        </section>`;
    }

    // ---------- Панель примерки ----------
    let tryPanel;
    if (triedSet) {
      const pr = setProgress(triedSet, p);
      const offer = setPrice(triedSet, p, day);
      let actions = '';
      if (offer?.missing.length) actions += p.coins >= offer.price ? `<button type="button" class="btn btn-primary set-buy" data-set="${triedSet.id}">${t('shop3.buyMissing', { n: offer.missing.length })} ${coin(offer.price)}</button>` : `<button type="button" class="btn btn-soft" disabled>${t('shop.short', { n: offer.price - p.coins })}</button>`;
      if (pr.done && set?.id !== triedSet.id) actions += `<button type="button" class="btn btn-primary set-wear" data-set="${triedSet.id}">${t('shop3.wearSet')}</button>`;
      if (set?.id === triedSet.id) actions += `<span class="gc-state is-on">✔ ${t('shop3.setOn')}</span>`;
      tryPanel = `
        <div class="try-item r-legendary"><span class="try-art try-set">🧩</span><div><b>${t(`set.${triedSet.id}`)}</b><small>${t('shop3.tab.sets')} · ${pr.got}/${pr.total}</small><small>${t('shop3.bonusIf', { b: SET_BONUS })}</small></div></div>
        <div class="try-actions">${actions}<button type="button" class="link-btn try-reset">${t('shop.reset')}</button></div>`;
    } else if (tried) {
      const has = hasGood(tried, p);
      const price = forSale(tried) ? priceOf(tried, day) : 0;
      const shardPrice = SHARD_PRICES[tried.rarity];
      let actions = '';
      if (has) {
        if (tried.kind === 'wear') actions = `<button type="button" class="btn ${outfit[tried.slot] === tried.id ? 'btn-soft' : 'btn-primary'} act-wear">${outfit[tried.slot] === tried.id ? t('shop.takeOff') : t('shop.wear')}</button>`;
        else if (tried.kind === 'room') actions = `<button type="button" class="btn ${room[tried.slot] === tried.id ? 'btn-soft' : 'btn-primary'} act-place">${room[tried.slot] === tried.id ? t('shop3.remove') : t('shop3.place')}</button>`;
        else actions = getEmote(p) === tried.id ? `<span class="gc-state is-on">✔ ${t('shop3.victory')}</span>` : `<button type="button" class="btn btn-primary act-emote">${t('shop3.makeVictory')}</button>`;
      } else if (forSale(tried)) {
        actions = p.coins >= price ? `<button type="button" class="btn btn-primary act-buy">${t('shop.buy')} ${coin(price)}</button>` : `<button type="button" class="btn btn-soft" disabled>${t('shop.short', { n: price - p.coins })}</button>`;
        if ((p.shards ?? 0) >= shardPrice) actions += `<button type="button" class="btn btn-soft act-shards">${t('shop3.forShards')} ${shards(shardPrice)}</button>`;
      } else actions = `<p class="gc-lock">🔒 ${esc(hintText(tried))}</p>`;
      tryPanel = `
        <div class="try-item r-${tried.rarity}"><span class="try-art">${goodThumb(tried)}</span><div><b>${esc(goodName(tried))}</b><small>${kindLabel(tried)}</small>${rarityPill(tried.rarity)}</div></div>
        <div class="try-actions">${actions}<button type="button" class="link-btn try-reset">${t('shop.reset')}</button></div>`;
    } else {
      tryPanel = `<p class="muted small try-hint">${t('shop3.tryHint')}</p>
        ${set ? `<p class="set-bonus-line">🧩 ${t('shop3.activeSet', { name: t(`set.${set.id}`), b: SET_BONUS })}</p>` : ''}
        ${getEmote(p) ? `<button type="button" class="btn btn-soft btn-sm play-emote">▶ ${esc(goodName(getEmote(p)))}</button>` : ''}`;
    }

    app.innerHTML = `
      <section class="page shop3 tab-${tab}">
        <div class="s3-layout">
          <aside class="s3-stage r-${triedSet ? 'legendary' : (tried?.rarity ?? 'none')}">
            <div class="s3-scene ${tried || triedSet ? 'is-trying' : ''} ${celebrate ? 'is-celebrating' : ''}">${scene(previewRoom, mascot(mood, 'mascot-stage', previewOutfit, { emote }), { compact: false })}</div>
            <div class="s3-try">${tryPanel}</div>
          </aside>
          <div class="s3-main">
            <header class="s3-top">
              <div><h1>🛍️ ${t('shop.title')}</h1><p class="muted small">${t('shop3.sub')}</p></div>
              <div class="wallet">
                <span class="wallet-chip coin-balance" title="${t('shop.balance')}">${coinHtml('coin-lg')}<b>${p.coins}</b></span>
                <span class="wallet-chip shard-balance" title="${t('shop3.shards')}">${shardHtml('shard-lg')}<b>${p.shards ?? 0}</b></span>
              </div>
            </header>
            <nav class="s3-tabs" role="tablist">${SHOP_TABS.map((x) => `<button type="button" role="tab" class="s3-tab ${x === tab ? 'is-active' : ''}" aria-selected="${x === tab}" data-tab="${x}"><span>${TAB_ICON[x]}</span>${t(`shop3.tab.${x}`)}</button>`).join('')}</nav>
            <div class="s3-body">${body}</div>
          </div>
        </div>
      </section>`;
    bind();
  };

  const go = (next) => {
    tab = next;
    storage.set('shopTab3', tab);
    sfx.tap();
    render();
    app.querySelector('.s3-tabs')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  function bind() {
    app.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => go(b.dataset.tab)));
    app.querySelectorAll('[data-try]').forEach((b) =>
      b.addEventListener('click', () => {
        const g = goodById(b.dataset.try);
        if (!g) return;
        tryId = tryId === g.id ? null : g.id;
        trySetId = null;
        celebrate = false;
        sfx.tap();
        render();
        if (tryId && window.matchMedia('(max-width: 900px)').matches) app.querySelector('.s3-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }),
    );
    app.querySelectorAll('[data-slot]').forEach((b) =>
      b.addEventListener('click', () => {
        wearSlot = b.dataset.slot;
        storage.set('shopSlot', wearSlot);
        sfx.tap();
        render();
      }),
    );
    app.querySelectorAll('[data-rslot]').forEach((b) =>
      b.addEventListener('click', () => {
        roomSlot = b.dataset.rslot;
        sfx.tap();
        render();
      }),
    );
    app.querySelectorAll('[data-rarity]').forEach((b) =>
      b.addEventListener('click', () => {
        rarity = b.dataset.rarity;
        render();
      }),
    );
    app.querySelectorAll('[data-owned]').forEach((b) =>
      b.addEventListener('click', () => {
        owned = b.dataset.owned;
        render();
      }),
    );
    app.querySelectorAll('[data-tryset]').forEach((b) => b.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), b.click())));
    app.querySelectorAll('[data-tryset]').forEach((b) =>
      b.addEventListener('click', () => {
        // Примерить набор целиком: Препи надевает все его вещи сразу.
        trySetId = trySetId === b.dataset.tryset ? null : b.dataset.tryset;
        tryId = null;
        celebrate = false;
        sfx.tap();
        render();
        if (trySetId && window.matchMedia('(max-width: 900px)').matches) app.querySelector('.s3-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }),
    );
    app.querySelector('.try-reset')?.addEventListener('click', () => {
      tryId = null;
      trySetId = null;
      render();
    });
    app.querySelector('.act-wear')?.addEventListener('click', () => {
      toggleItem(tryId);
      syncAchievements();
      sfx.select();
      render();
    });
    app.querySelector('.act-place')?.addEventListener('click', () => {
      toggleRoomItem(tryId);
      sfx.select();
      render();
    });
    app.querySelector('.act-emote')?.addEventListener('click', () => {
      setEmote(tryId);
      sfx.select();
      render();
    });
    app.querySelector('.play-emote')?.addEventListener('click', () => {
      celebrate = true;
      render();
      setTimeout(() => {
        celebrate = false;
        if (alive()) render();
      }, 3600);
    });
    app.querySelector('.act-buy')?.addEventListener('click', () => purchase(buyItem(tryId)));
    app.querySelector('.act-shards')?.addEventListener('click', () => purchase(buyWithShards(tryId), true));
    app.querySelectorAll('.set-buy').forEach((b) =>
      b.addEventListener('click', () => {
        const res = buySet(b.dataset.set);
        if (!res.ok) return;
        sfx.win();
        confetti({ count: 220 });
        toast(`<span class="toast-icon">🧩</span><span><small>${t('shop3.setBought')}</small><b>${t(`set.${b.dataset.set}`)}</b></span>`, { kind: 'achievement', duration: 4200 });
        announceSets(res.sets);
        syncAchievements();
        tryId = null;
        trySetId = null;
        celebrateNow();
      }),
    );
    app.querySelectorAll('.set-wear').forEach((b) =>
      b.addEventListener('click', () => {
        const s = SETS.find((x) => x.id === b.dataset.set);
        if (!s) return;
        wearSet(s);
        syncAchievements();
        sfx.select();
        tryId = null;
        trySetId = null;
        render();
      }),
    );
    app.querySelectorAll('[data-box]').forEach((b) =>
      b.addEventListener('click', () => {
        if (getProfile().coins < (boxById(b.dataset.box)?.price ?? Infinity)) return;
        openBoxModal(b.dataset.box, render);
      }),
    );
  }

  function celebrateNow() {
    celebrate = true;
    render();
    app.querySelector('.s3-scene')?.classList.add('is-celebrating');
    animateCoin(app.querySelector('.coin-balance .coin'), 'spend');
    setTimeout(() => {
      celebrate = false;
      if (alive()) render();
    }, 2600);
  }

  function purchase(res, byShards = false) {
    if (!res.ok) return;
    const g = goodById(tryId);
    sfx.coin();
    if (g.rarity !== 'common') confetti({ count: g.rarity === 'legendary' ? 220 : 110 });
    toast(`<span class="toast-thumb">${goodThumb(g)}</span><span><small>${byShards ? t('shop3.boughtShards') : g.kind === 'wear' ? t('shop.bought') : t('shop3.boughtOther')}</small><b>${esc(goodName(g))}</b></span>`, { kind: 'achievement', duration: 3600 });
    announceSets(res.sets);
    syncAchievements();
    tryId = g.kind === 'emote' ? g.id : null;
    celebrateNow();
  }

  render();
  return { relabel: render };
}

function announceSets(sets) {
  for (const set of sets ?? []) {
    sfx.win();
    confetti({ count: 200 });
    toast(`<span class="toast-icon">🧩</span><span><small>${t('shop.setComplete')}</small><b>${t(`set.${set.id}`)} · +${set.coins} 🪙</b></span>`, { kind: 'achievement', duration: 5200 });
  }
}

/** Окно сундука: сундук трясётся, раскрывается и показывает, что выпало (повторка превращается в осколки). */
export function openBoxModal(boxId, onDone, { free = false } = {}) {
  const box = boxById(boxId);
  if (!box) return;
  const close = openModal({
    title: `${t(`box.${box.id}`)}`,
    body: `<div class="lootbox-stage">
      <button type="button" class="lootbox3" aria-label="${t('shop.open')}">${chestSvg(box.id)}</button>
      <p class="muted">${free ? t('season.boxFree') : t('shop.boxTap', { n: box.price })}</p>
      ${pityLeft(box) ? `<small class="pity">🌟 ${t('shop3.pity', { n: pityLeft(box) })}</small>` : ''}
    </div>`,
  });
  const stage = document.querySelector('.lootbox-stage');
  const btn = stage?.querySelector('.lootbox3');
  btn?.addEventListener('click', () => {
    if (btn.classList.contains('is-opening')) return;
    const res = openBox(boxId, Math.random, { free });
    if (!res.ok) return close();
    btn.classList.add('is-opening');
    sfx.tap();
    setTimeout(() => {
      const g = res.item;
      const outfit = g.kind === 'wear' ? { ...getOutfit(), [g.slot]: g.id } : getOutfit();
      const prepi = g.kind === 'wear' || g.kind === 'emote' ? `<div class="loot-prepi">${mascot('win', 'mascot-lg', outfit, { emote: g.kind === 'emote' ? g.id : undefined })}</div>` : '';
      stage.innerHTML = `
        <div class="loot-reveal r-${g.rarity} ${res.dup ? 'is-dup' : ''}">
          <div class="loot-rays"></div>
          <div class="loot-chest">${chestSvg(box.id, { open: true })}</div>
          ${prepi}
          <span class="loot-art">${goodThumb(g)}</span>
          <b class="loot-name">${esc(goodName(g))}</b>
          ${rarityPill(g.rarity)}
          <p class="muted small">${res.dup ? `${t('shop3.dup')} <b class="dup-shards">+${res.shards} ${shardHtml()}</b>` : g.kind === 'wear' ? t('shop.boxWorn') : g.kind === 'room' ? t('shop3.boxPlaced') : t('shop3.boxEmote')}</p>
          <div class="loot-actions">
            ${!free && getProfile().coins >= box.price ? `<button type="button" class="btn btn-primary loot-again">${t('shop.again')} ${coin(box.price)}</button>` : ''}
            <button type="button" class="btn btn-soft loot-close">${t('shop.great')}</button>
          </div>
        </div>`;
      res.dup || g.rarity === 'common' ? sfx.coin() : sfx.win();
      confetti({ count: res.dup ? 40 : { common: 60, rare: 120, epic: 180, legendary: 280 }[g.rarity] });
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
