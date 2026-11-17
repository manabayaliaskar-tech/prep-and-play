// Страница сезона: тема месяца, дорожка из 30 ступеней с наградами, эксклюзивы и отсчёт до конца.
// Анимации мягкие: медленные частицы темы, плавный скролл к своей ступени, пульс у готовых наград.

import { confetti } from '../core/confetti.js';
import { t, tx } from '../core/i18n.js';
import { getProfile, saveProfile, syncAchievements } from '../core/profile.js';
import { TIERS, TIER_PTS, claimTier, seasonLeft, seasonState, themeOf, tierReward } from '../core/season.js';
import { sfx } from '../core/sound.js';
import { getOutfit, itemById } from '../core/wardrobe.js';
import { mascot } from '../ui/mascot.js';
import { openModal } from '../ui/overlay.js';
import { openBoxModal } from './shop.js';

const BOX_ICON = { basic: '📦', super: '🎁', mega: '💎' };

export const seasonName = (id) => tx(themeOf(id).name);

function rewardIcon(r) {
  if (r.type === 'coins') return '🪙';
  if (r.type === 'box') return BOX_ICON[r.box];
  return itemById(r.id)?.icon ?? '🎁';
}

function rewardLabel(r) {
  if (r.type === 'coins') return `+${r.n}`;
  if (r.type === 'box') return t(`box.${r.box}`);
  return t(`wear.${r.id}`);
}

/** Медленные частицы темы для фона (ненавязчиво: мало, полупрозрачные). */
const particles = (icon, n = 9) =>
  `<div class="season-particles" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<span style="--x:${(i * 37) % 100}%;--d:${10 + (i % 4) * 3}s;--delay:${-(i * 1.7).toFixed(1)}s;--s:${0.8 + (i % 3) * 0.25}">${icon}</span>`).join('')}</div>`;

/** Компактная карточка сезона на главной. */
export function seasonCardHtml(p = getProfile()) {
  const st = seasonState(p);
  const th = themeOf(st.id);
  const left = seasonLeft();
  return `<a class="season-card" href="#/season" style="--sa:${th.colors[0]};--sb:${th.colors[1]}">
    ${particles(th.icon, 5)}
    <span class="season-card-icon" aria-hidden="true">${th.icon}</span>
    <span class="season-card-text">
      <b>${t('season.title', { name: seasonName(st.id) })}</b>
      <small>${t('season.tierOf', { n: st.tier, m: TIERS })} · ${t('season.left', { d: left.days })}</small>
      <span class="season-mini-bar"><i style="width:${Math.round((st.into / TIER_PTS) * 100)}%"></i></span>
    </span>
    ${st.claimable.length ? `<span class="season-claim-badge">🎁 ${st.claimable.length}</span>` : '<span class="daily-go">→</span>'}
  </a>`;
}

export function seasonRoute(app) {
  let firstRender = true;

  const render = () => {
    const p = getProfile();
    const st = seasonState(p);
    const th = themeOf(st.id);
    const left = seasonLeft();
    const preview = { ...getOutfit(p), aura: th.items[0], color: th.items[1], pet: th.items[2] };
    const node = (k) => {
      const r = tierReward(st.id, k);
      const reached = k <= st.tier;
      const claimed = st.claimed.includes(k);
      const special = r.type !== 'coins';
      const state = claimed ? 'is-claimed' : reached ? 'is-ready' : 'is-locked';
      return `<li class="tier ${state} ${special ? 'is-special' : ''} ${k === st.tier + 1 ? 'is-next' : ''}" data-tier="${k}">
        ${k === Math.max(1, st.tier) ? `<span class="tier-prepi">${mascot(st.claimable.length ? 'win' : 'happy', 'mascot-xs')}</span>` : ''}
        <button type="button" class="tier-node" ${reached && !claimed ? '' : 'disabled'} aria-label="${t('season.tier', { n: k })}: ${rewardLabel(r)}">
          <span class="tier-icon">${claimed ? '✓' : rewardIcon(r)}</span>
        </button>
        <span class="tier-num">${k}</span>
        <span class="tier-label">${rewardLabel(r)}</span>
      </li>`;
    };
    app.innerHTML = `
      <section class="page season-page" style="--sa:${th.colors[0]};--sb:${th.colors[1]}">
        <div class="season-hero">
          ${particles(th.icon)}
          <div class="season-hero-text">
            <p class="hero-kicker">${t('season.kicker')}</p>
            <h1><span class="season-big-icon">${th.icon}</span> ${t('season.title', { name: seasonName(st.id) })}</h1>
            <p>${t('season.ends', { d: left.days, h: left.hours })}</p>
            <div class="season-level">
              <span class="season-tier-badge"><b>${st.tier}</b><small>/${TIERS}</small></span>
              <div class="season-progress">
                <span class="season-bar"><i style="width:${Math.round((st.into / TIER_PTS) * 100)}%"></i></span>
                <small>${st.tier >= TIERS ? t('season.max') : t('season.toNext', { n: TIER_PTS - st.into, k: st.tier + 1 })}</small>
              </div>
            </div>
            ${st.claimable.length > 1 ? `<button type="button" class="btn btn-primary season-claim-all">🎁 ${t('season.claimAll', { n: st.claimable.length })}</button>` : ''}
          </div>
          <div class="season-preview">
            ${mascot('happy', 'mascot-lg float', preview)}
            <small>${t('season.preview')}</small>
          </div>
        </div>

        <div class="panel season-track-panel">
          <div class="shop-block-head"><h2>${t('season.road')}</h2><span class="muted small">${t('season.howPts')}</span></div>
          <div class="season-track-wrap">
            <ol class="season-track" style="--fill:${Math.min(100, ((st.tier - 0.5) / (TIERS - 1)) * 100)}%">${Array.from({ length: TIERS }, (_, i) => node(i + 1)).join('')}</ol>
          </div>
        </div>

        <div class="panel">
          <h2>${t('season.exclusive')}</h2>
          <div class="season-excl">
            ${th.items
              .map((id, k) => {
                const it = itemById(id);
                const tier = [10, 20, 30][k];
                const got = (p.seasonItems ?? []).includes(id);
                return `<div class="excl-card r-${it.rarity} ${got ? 'is-got' : ''}"><span class="excl-icon">${it.icon}</span><b>${t(`wear.${id}`)}</b><span class="rarity r-${it.rarity}">${t(`rar.${it.rarity}`)}</span><small>${got ? `✔ ${t('season.got')}` : t('season.atTier', { n: tier })}</small></div>`;
              })
              .join('')}
          </div>
          <p class="muted small">${t('season.note')}</p>
        </div>
      </section>`;

    app.querySelectorAll('.tier.is-ready .tier-node').forEach((b) =>
      b.addEventListener('click', () => claim(Number(b.closest('.tier').dataset.tier), b)),
    );
    app.querySelector('.season-claim-all')?.addEventListener('click', claimAll);

    // Плавно прокручиваем дорожку к своей ступени.
    const current = app.querySelector(`.tier[data-tier="${Math.max(1, st.tier)}"]`);
    const wrap = app.querySelector('.season-track-wrap');
    if (current && wrap) {
      const x = current.offsetLeft - wrap.clientWidth / 2 + current.clientWidth / 2;
      wrap.scrollTo({ left: Math.max(0, x), behavior: firstRender ? 'auto' : 'smooth' });
    }
    firstRender = false;
  };

  /** Маленький «всплеск» монет над ступенью. */
  function burst(el, text) {
    const r = el.getBoundingClientRect();
    const f = document.createElement('span');
    f.className = 'season-burst';
    f.textContent = text;
    f.style.left = `${r.left + r.width / 2}px`;
    f.style.top = `${r.top}px`;
    document.body.append(f);
    setTimeout(() => f.remove(), 1200);
  }

  function claim(tier, el) {
    const p = getProfile();
    const r = claimTier(p, tier);
    if (!r) return;
    saveProfile();
    if (r.type === 'coins') {
      sfx.coin();
      if (el) burst(el, `+${r.n} 🪙`);
      el?.closest('.tier')?.classList.add('just-claimed');
      setTimeout(render, 380);
    } else if (r.type === 'box') {
      render();
      openBoxModal(r.box, render, { free: true });
    } else {
      sfx.win();
      confetti({ count: 160 });
      syncAchievements();
      render();
      const it = itemById(r.id);
      openModal({
        title: `${themeOf(seasonState(p).id).icon} ${t('season.exclusive')}`,
        body: `<div class="loot-reveal r-${it.rarity}"><div class="loot-rays"></div><div class="loot-prepi">${mascot('win', 'mascot-lg', { ...getOutfit(p), [it.slot]: it.id })}</div><span class="loot-icon">${it.icon}</span><b class="loot-name">${t(`wear.${it.id}`)}</b><span class="rarity r-${it.rarity}">${t(`rar.${it.rarity}`)}</span><p class="muted small">${t('season.itemHint')}</p></div>`,
        actions: [{ label: t('shop.great'), primary: true }],
      });
    }
  }

  function claimAll() {
    const p = getProfile();
    let coins = 0;
    const special = [];
    for (const k of seasonState(p).claimable) {
      const r = tierReward(seasonState(p).id, k);
      if (r.type === 'coins') coins += claimTier(p, k).n;
      else special.push(k);
    }
    saveProfile();
    if (coins) {
      sfx.coin();
      const el = app.querySelector('.season-claim-all');
      if (el) burst(el, `+${coins} 🪙`);
    }
    render();
    // Сундуки и вещи открываем по одному — у каждого своя анимация.
    if (special.length) setTimeout(() => claim(special[0], null), 400);
  }

  render();
  return { relabel: render };
}
