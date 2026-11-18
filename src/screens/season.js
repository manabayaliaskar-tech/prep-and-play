// Препи Пасс: тема месяца с анимированной сценой, две дорожки наград (бесплатная и «Золотая»),
// задания пасса на день и неделю, бонусные уровни после 30-го, витрина главного приза.
// Анимации: заставка нового сезона, полёт очков, вспышка уровня, раскрытие наград.

import { confetti } from '../core/confetti.js';
import { t, tx } from '../core/i18n.js';
import { getProfile, saveProfile, syncAchievements } from '../core/profile.js';
import {
  GOLD_PRICE,
  TIERS,
  TIER_PTS,
  buyGold,
  claimBonus,
  claimQuest,
  claimTier,
  passQuests,
  seasonLeft,
  seasonMonth,
  seasonState,
  themeOf,
  tierReward,
} from '../core/season.js';
import { grantFree, passGood } from '../core/shop.js';
import { sfx } from '../core/sound.js';
import { storage } from '../core/storage.js';
import { getOutfit, itemById } from '../core/wardrobe.js';
import { passScene } from '../ui/art/pass-scenes.js';
import { coinHtml } from '../ui/coin.js';
import { esc } from '../ui/dom.js';
import { goodName, goodThumb, rarityPill } from '../ui/goods-ui.js';
import { mascot } from '../ui/mascot.js';
import { openModal } from '../ui/overlay.js';
import { chestSvg, shardHtml } from '../ui/shop-art.js';
import { openBoxModal } from './shop.js';

export const seasonName = (id) => tx(themeOf(id).name);

/** Вещь магазина, которую даёт уровень «Золотой» дорожки (или null). */
const goodFor = (st, k, r) => (r.type === 'good' ? passGood(st.id, k, r.kind, r.rarity) : null);

function rewardIcon(st, k, r) {
  if (r.type === 'coins') return coinHtml('coin-lg');
  if (r.type === 'shards') return shardHtml('shard-lg');
  if (r.type === 'box') return chestSvg(r.box);
  if (r.type === 'good') return goodThumb(goodFor(st, k, r)) || '🎁';
  return goodThumb(r.id) || '🎁';
}

function rewardLabel(st, k, r) {
  if (r.type === 'coins' || r.type === 'shards') return `+${r.n}`;
  if (r.type === 'box') return t(`box.${r.box}`);
  if (r.type === 'good') return goodName(goodFor(st, k, r));
  return goodName(r.id);
}

/** Карточка Препи Пасса на главной: мини-сцена сезона, уровень и готовые награды. */
export function seasonCardHtml(p = getProfile()) {
  const st = seasonState(p);
  const th = themeOf(st.id);
  const left = seasonLeft();
  const ready = st.claimable.length + st.claimableGold.length + st.bonusReady;
  return `<a class="season-card pass-card" href="#/season" style="--sa:${th.colors[0]};--sb:${th.colors[1]}">
    <span class="pass-card-scene">${passScene(seasonMonth(st.id), { compact: true })}</span>
    <span class="pass-card-body">
      <span class="pass-logo">${t('pass.name')}${st.gold ? ' <i class="gold-tag">GOLD</i>' : ''}</span>
      <b>${esc(seasonName(st.id))}</b>
      <small>${t('pass.level', { n: st.tier, m: TIERS })} · ${t('season.left', { d: left.days })}</small>
      <span class="season-mini-bar"><i style="width:${Math.round((st.into / TIER_PTS) * 100)}%"></i></span>
    </span>
    ${ready ? `<span class="season-claim-badge">🎁 ${ready}</span>` : '<span class="daily-go">→</span>'}
  </a>`;
}

/** Заставка нового сезона: занавес раскрывается, показывается тема и главные призы. */
function introOverlay(st, th, onDone) {
  const root = document.createElement('div');
  root.className = 'pass-intro';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  const prize = tierReward(st.id, 30, 'gold');
  root.innerHTML = `
    <div class="pass-intro-scene">${passScene(seasonMonth(st.id))}</div>
    <div class="pass-intro-curtain l"></div><div class="pass-intro-curtain r"></div>
    <div class="pass-intro-card">
      <p class="pass-intro-kicker">${t('pass.newSeason')}</p>
      <h2>${t('pass.name')}: ${esc(seasonName(st.id))}</h2>
      <div class="pass-intro-items">
        ${th.items.map((id) => `<span class="pass-intro-item r-${itemById(id)?.rarity}">${goodThumb(id)}</span>`).join('')}
        <span class="pass-intro-item r-legendary is-prize">${goodThumb(passGood(st.id, 30, prize.kind, prize.rarity))}</span>
      </div>
      <p class="muted">${t('pass.introText')}</p>
      <button type="button" class="btn btn-primary btn-lg pass-intro-go">${t('pass.go')} 🚀</button>
    </div>`;
  document.body.append(root);
  requestAnimationFrame(() => root.classList.add('is-in'));
  sfx.win();
  setTimeout(() => confetti({ count: 140 }), 700);
  const close = () => {
    root.classList.add('is-out');
    setTimeout(() => root.remove(), 450);
    onDone?.();
  };
  root.querySelector('.pass-intro-go').addEventListener('click', close);
  root.querySelector('.pass-intro-go').focus({ preventScroll: true });
}

export function seasonRoute(app) {
  let firstRender = true;

  const render = () => {
    const p = getProfile();
    const st = seasonState(p);
    const th = themeOf(st.id);
    const month = seasonMonth(st.id);
    const left = seasonLeft();
    const quests = passQuests(p);
    saveProfile();
    const preview = { ...getOutfit(p), aura: th.items[0], color: th.items[1], pet: th.items[2] };
    const prizeR = tierReward(st.id, 30, 'gold');
    const prize = goodFor(st, 30, prizeR);
    const ready = st.claimable.length + st.claimableGold.length;

    const node = (k, track) => {
      const r = tierReward(st.id, k, track);
      const reached = k <= st.tier;
      const gold = track === 'gold';
      const claimed = gold ? st.claimedGold.includes(k) : st.claimed.includes(k);
      const locked = gold && !st.gold;
      const special = r.type !== 'coins' && r.type !== 'shards';
      const state = claimed ? 'is-claimed' : reached && !locked ? 'is-ready' : 'is-locked';
      return `<div class="pnode ${state} ${special ? 'is-special' : ''} ${r.prize ? 'is-prize' : ''} ${gold ? 'is-gold' : ''}" data-tier="${k}" data-track="${track}">
        <button type="button" class="pnode-btn" ${state === 'is-ready' ? '' : 'disabled'} aria-label="${t('pass.level', { n: k, m: TIERS })}: ${esc(rewardLabel(st, k, r))}">
          <span class="pnode-icon">${claimed ? '✓' : rewardIcon(st, k, r)}</span>
          ${locked ? '<span class="pnode-lock">🔒</span>' : ''}
        </button>
        <span class="pnode-label">${esc(rewardLabel(st, k, r))}</span>
      </div>`;
    };
    const questRow = (q) => `<div class="pquest ${q.done ? 'is-done' : ''} ${q.claimed ? 'is-claimed' : ''}">
        <div class="pquest-text"><b>${t(`pq.${q.id}`, { n: q.target })}</b>
          <span class="pquest-bar"><i style="width:${Math.round((q.value / q.target) * 100)}%"></i></span>
          <small>${q.value}/${q.target}</small></div>
        ${q.claimed ? '<span class="pquest-ok">✔</span>' : `<button type="button" class="btn ${q.done ? 'btn-primary' : 'btn-soft'} btn-sm pquest-claim" data-q="${q.id}" ${q.done ? '' : 'disabled'}>+${q.pts}</button>`}
      </div>`;

    app.innerHTML = `
      <section class="page pass-page" style="--sa:${th.colors[0]};--sb:${th.colors[1]}">
        <div class="pass-hero">
          <div class="pass-hero-scene">${passScene(month)}</div>
          <div class="pass-hero-text">
            <span class="pass-logo big">${t('pass.name')}${st.gold ? ' <i class="gold-tag">GOLD</i>' : ''}</span>
            <h1>${esc(seasonName(st.id))}</h1>
            <p>${t('season.ends', { d: left.days, h: left.hours })}</p>
            <div class="season-level">
              <span class="season-tier-badge"><b>${st.tier}</b><small>/${TIERS}</small></span>
              <div class="season-progress">
                <span class="season-bar"><i style="width:${Math.round((st.into / TIER_PTS) * 100)}%"></i></span>
                <small>${st.tier >= TIERS ? t('pass.bonusNext', { n: TIER_PTS - st.into }) : t('season.toNext', { n: TIER_PTS - st.into, k: st.tier + 1 })}</small>
              </div>
            </div>
            <div class="pass-hero-actions">
              ${ready > 1 ? `<button type="button" class="btn btn-primary pass-claim-all">🎁 ${t('season.claimAll', { n: ready })}</button>` : ''}
              ${st.gold ? '' : `<button type="button" class="btn btn-gold pass-buy-gold">👑 ${t('pass.buyGold')} ${coinHtml()} ${GOLD_PRICE}</button>`}
            </div>
          </div>
          <div class="pass-hero-prepi">${mascot(ready ? 'starstruck' : 'happy', 'mascot-lg float', preview)}</div>
        </div>

        <section class="panel pass-road">
          <div class="shop-block-head"><h2>${t('pass.road')}</h2><span class="muted small">${t('pass.howPts')}</span></div>
          <div class="pass-legend"><span class="pl-free">${t('pass.free')}</span><span class="pl-gold">👑 ${t('pass.gold')}${st.gold ? ' ✔' : ' 🔒'}</span></div>
          <div class="pass-track-wrap">
            <div class="pass-track" style="--fill:${Math.min(100, (st.tier / TIERS) * 100)}%">
              ${Array.from({ length: TIERS }, (_, i) => {
                const k = i + 1;
                return `<div class="pcol ${k <= st.tier ? 'is-reached' : ''} ${k === Math.max(1, st.tier) ? 'is-here' : ''}" data-col="${k}">
                  ${node(k, 'free')}
                  <span class="pcol-num">${k}${k === Math.max(1, st.tier) ? `<span class="pcol-prepi">${mascot(ready ? 'win' : 'happy', 'mascot-xs')}</span>` : ''}</span>
                  ${node(k, 'gold')}
                </div>`;
              }).join('')}
              <div class="pcol pcol-bonus ${st.tier >= TIERS ? 'is-reached' : ''}">
                <div class="pnode ${st.bonusReady ? 'is-ready' : 'is-locked'} is-special"><button type="button" class="pnode-btn pass-bonus" ${st.bonusReady ? '' : 'disabled'}><span class="pnode-icon">${shardHtml('shard-lg')}</span>${st.bonusReady > 1 ? `<span class="pnode-count">×${st.bonusReady}</span>` : ''}</button><span class="pnode-label">${t('pass.bonus')}</span></div>
                <span class="pcol-num">∞</span>
              </div>
            </div>
          </div>
        </section>
        <div class="pass-grid">
          <section class="panel pass-quests">
            <div class="shop-block-head"><h2>🎯 ${t('pass.quests')}</h2><span class="muted small">${t('pass.questsSub')}</span></div>
            <h3>${t('pass.daily')}</h3>${quests.daily.map(questRow).join('')}
            <h3>${t('pass.weekly')}</h3>${quests.weekly.map(questRow).join('')}
          </section>
          <section class="panel pass-prize r-legendary">
            <h2>🏆 ${t('pass.prize')}</h2>
            <div class="pass-prize-art">${prize ? goodThumb(prize) : ''}</div>
            <b>${prize ? esc(goodName(prize)) : ''}</b>
            ${rarityPill('legendary')}
            <small class="muted">${t('pass.prizeHint')}</small>
            <div class="pass-excl">${th.items.map((id, k) => `<span class="pass-excl-item r-${itemById(id)?.rarity} ${(p.seasonItems ?? []).includes(id) ? 'is-got' : ''}" title="${esc(goodName(id))}">${goodThumb(id)}<i>${[10, 20, 30][k]}</i></span>`).join('')}</div>
            <small class="muted">${t('season.note')}</small>
          </section>
        </div>

      </section>`;

    app.querySelectorAll('.pnode.is-ready .pnode-btn:not(.pass-bonus)').forEach((b) =>
      b.addEventListener('click', () => {
        const n = b.closest('.pnode');
        claim(Number(n.dataset.tier), n.dataset.track, b);
      }),
    );
    app.querySelector('.pass-bonus')?.addEventListener('click', (e) => {
      const r = claimBonus(getProfile());
      if (!r) return;
      saveProfile();
      sfx.coin();
      burst(e.currentTarget, `+${r.n}`, 'shard');
      setTimeout(render, 420);
    });
    app.querySelectorAll('.pquest-claim').forEach((b) => b.addEventListener('click', () => takeQuest(b.dataset.q, b)));
    app.querySelector('.pass-claim-all')?.addEventListener('click', claimAll);
    app.querySelector('.pass-buy-gold')?.addEventListener('click', askGold);

    // Плавно прокручиваем дорожку к своему уровню.
    const current = app.querySelector(`.pcol[data-col="${Math.max(1, st.tier)}"]`);
    const wrap = app.querySelector('.pass-track-wrap');
    if (current && wrap) wrap.scrollTo({ left: Math.max(0, current.offsetLeft - wrap.clientWidth / 2), behavior: firstRender ? 'auto' : 'smooth' });
    if (firstRender && storage.get('passSeen', null) !== st.id) {
      storage.set('passSeen', st.id);
      introOverlay(st, th);
    }
    firstRender = false;
  };

  /** Всплывающая цифра над элементом: монеты, осколки или очки пасса. */
  function burst(el, text, kind = 'coin') {
    const r = el.getBoundingClientRect();
    const f = document.createElement('span');
    f.className = `season-burst burst-${kind}`;
    f.innerHTML = `${text} ${kind === 'shard' ? shardHtml() : kind === 'pts' ? '⭐' : coinHtml()}`;
    f.style.left = `${r.left + r.width / 2}px`;
    f.style.top = `${r.top}px`;
    document.body.append(f);
    setTimeout(() => f.remove(), 1300);
  }

  /** Вспышка нового уровня. */
  function levelUp(n) {
    const f = document.createElement('div');
    f.className = 'pass-levelup';
    f.innerHTML = `<span>${t('pass.levelUp')}</span><b>${n}</b>`;
    document.body.append(f);
    sfx.win();
    confetti({ count: 120 });
    setTimeout(() => f.remove(), 1900);
  }

  function reveal(item, extra = '') {
    sfx.win();
    confetti({ count: 160 });
    syncAchievements();
    const outfit = item.kind === 'wear' ? { ...getOutfit(), [item.slot]: item.id } : getOutfit();
    openModal({
      title: `${t('pass.name')} · ${esc(seasonName(seasonState(getProfile()).id))}`,
      body: `<div class="loot-reveal r-${item.rarity}"><div class="loot-rays"></div>${item.kind !== 'room' ? `<div class="loot-prepi">${mascot('win', 'mascot-lg', outfit, { emote: item.kind === 'emote' ? item.id : undefined })}</div>` : ''}<span class="loot-art">${goodThumb(item)}</span><b class="loot-name">${esc(goodName(item))}</b>${rarityPill(item.rarity)}<p class="muted small">${extra || t('season.itemHint')}</p></div>`,
      actions: [{ label: t('shop.great'), primary: true }],
    });
  }

  function claim(tier, track, el) {
    const p = getProfile();
    const st = seasonState(p);
    const r = claimTier(p, tier, undefined, track);
    if (!r) return;
    saveProfile();
    el?.closest('.pnode')?.classList.add('just-claimed');
    if (r.type === 'coins' || r.type === 'shards') {
      sfx.coin();
      if (el) burst(el, `+${r.n}`, r.type === 'shards' ? 'shard' : 'coin');
      setTimeout(render, 420);
    } else if (r.type === 'box') {
      render();
      openBoxModal(r.box, render, { free: true });
    } else if (r.type === 'good') {
      const g = goodFor(st, tier, r);
      const res = g ? grantFree(g.id) : null;
      render();
      if (res) reveal(res.item, res.dup ? `${t('shop3.dup')} +${res.shards}` : '');
    } else {
      render();
      reveal(itemById(r.id));
    }
  }

  function takeQuest(id, el) {
    const p = getProfile();
    const res = claimQuest(p, id);
    if (!res) return;
    saveProfile();
    sfx.coin();
    el.closest('.pquest')?.classList.add('just-claimed');
    burst(el, `+${res.pts}`, 'pts');
    setTimeout(() => {
      render();
      if (res.tierUp) levelUp(res.tierUp);
    }, 520);
  }

  function claimAll() {
    const p = getProfile();
    const st = seasonState(p);
    let coins = 0;
    let shards = 0;
    const special = [];
    for (const [list, track] of [
      [st.claimable, 'free'],
      [st.claimableGold, 'gold'],
    ]) {
      for (const k of list) {
        const r = tierReward(st.id, k, track);
        if (r.type === 'coins') coins += claimTier(p, k, undefined, track).n;
        else if (r.type === 'shards') shards += claimTier(p, k, undefined, track).n;
        else special.push([k, track]);
      }
    }
    saveProfile();
    const el = app.querySelector('.pass-claim-all');
    if (coins || shards) {
      sfx.coin();
      if (el && coins) burst(el, `+${coins}`, 'coin');
      if (el && shards) setTimeout(() => burst(el, `+${shards}`, 'shard'), 250);
    }
    render();
    // Сундуки и вещи открываем по одному — у каждого своя анимация.
    if (special.length) setTimeout(() => claim(special[0][0], special[0][1], null), 450);
  }

  function askGold() {
    const p = getProfile();
    openModal({
      title: `👑 ${t('pass.gold')}`,
      body: `<div class="pass-gold-offer"><p>${t('pass.goldText', { n: GOLD_PRICE })}</p><p class="muted small">${p.coins >= GOLD_PRICE ? t('pass.goldInstant') : t('shop.short', { n: GOLD_PRICE - p.coins })}</p></div>`,
      actions: [
        { label: t('common.cancel') },
        {
          label: `${t('pass.buyGold')} · ${GOLD_PRICE}`,
          primary: true,
          onClick: () => {
            const res = buyGold(getProfile());
            if (!res.ok) return;
            saveProfile();
            sfx.win();
            confetti({ count: 220 });
            document.body.classList.add('gold-flash');
            setTimeout(() => document.body.classList.remove('gold-flash'), 1200);
            render();
          },
        },
      ],
    });
  }

  render();
  return { relabel: render };
}
