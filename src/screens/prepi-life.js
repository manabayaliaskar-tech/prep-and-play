// «Жизнь» Препи на главной: настроение и энергия, спасение погасшего огонька,
// подарок за дневную цель и витрина магазина.

import { confetti } from '../core/confetti.js';
import { dayKey } from '../core/dates.js';
import { RESCUE_XP, flameOf, flameSvg, giftCoins, nextFlame, nextMultiplier, prepiMood, rescueState, streakMultiplier } from '../core/economy.js';
import { t } from '../core/i18n.js';
import { DAILY_GOAL, addCoins, currentStreak, getProfile, saveProfile, todayXp } from '../core/profile.js';
import { dailyDeals } from '../core/shop.js';
import { sfx } from '../core/sound.js';
import { itemById } from '../core/wardrobe.js';

export const moodOf = (p = getProfile()) => prepiMood(p, dayKey(), todayXp(), DAILY_GOAL);

/** Пузырь с фразой Препи и шкала его энергии. */
export function moodHtml(p = getProfile()) {
  const mood = moodOf(p);
  return `<div class="prepi-mood m-${mood.id}">
    <p class="mood-bubble">${t(`mood.${mood.id}`)}</p>
    <div class="energy" title="${t('mood.energy')}">
      <span class="energy-label">${mood.energy >= 50 ? '💜' : mood.energy >= 20 ? '💔' : '💤'} ${t('mood.energy')}</span>
      <span class="energy-bar"><i style="width:${mood.energy}%"></i></span>
      <b>${mood.energy}%</b>
    </div>
  </div>`;
}

/** Огонёк серии: цвет, множитель и сколько до следующего цвета. */
export function flameBadgeHtml(streak = currentStreak()) {
  const mult = streakMultiplier(streak);
  const next = nextFlame(streak);
  const nextMult = nextMultiplier(streak);
  const title = [next ? t('flame.next', { n: next.left, color: t(`flame.${next.flame.id}`) }) : '', nextMult ? t('mult.next', { n: nextMult.left, m: nextMult.mult }) : '']
    .filter(Boolean)
    .join(' · ');
  return `<span class="badge flame-badge f-${flameOf(streak).id}" title="${title}">${flameSvg(streak)} ${t('home.streak', { n: streak })}${mult > 1 ? `<span class="mult-tag">×${mult} XP</span>` : ''}</span>`;
}

/** Карточка «Огонёк погас — верни его сегодня». */
export function rescueCardHtml(p = getProfile()) {
  const r = rescueState(p, dayKey(), todayXp());
  if (!r) return '';
  return `<a class="rescue-card" href="#/quiz/classic">
    <span class="rescue-flame" aria-hidden="true">${flameSvg(0)}<span class="rescue-spark">${flameSvg(r.count)}</span></span>
    <span class="rescue-text">
      <b>${t('rescue.title', { n: r.count })}</b>
      <small>${t('rescue.desc', { xp: RESCUE_XP })}</small>
      <span class="bar rescue-bar"><i style="width:${Math.round((r.xp / r.need) * 100)}%"></i></span>
      <small class="rescue-count">${r.xp}/${r.need} XP</small>
    </span>
    <span class="rescue-go">${t('rescue.go')}</span>
  </a>`;
}

/** Подарок Препи за выполненную дневную цель (раз в день). */
export function giftCardHtml(p = getProfile()) {
  if (todayXp() < DAILY_GOAL || p.gift === dayKey()) return '';
  return `<button type="button" class="gift-card">
    <span class="gift-box" aria-hidden="true">🎁</span>
    <span class="gift-text"><b>${t('gift.title')}</b><small>${t('gift.desc')}</small></span>
    <span class="gift-go">+${giftCoins(currentStreak())} 🪙</span>
  </button>`;
}

/** Витрина магазина на главной: баланс и товары дня. */
export function shopCardHtml(p = getProfile()) {
  const deals = dailyDeals(dayKey());
  return `<a class="shop-card" href="#/shop">
    <span class="shop-card-icon" aria-hidden="true">🛍️</span>
    <span class="shop-card-text"><b>${t('shop.title')}</b><small>${t('shop.cardDesc', { n: deals[0].discount })}</small></span>
    <span class="shop-card-deals">${deals.map((d) => `<span class="mini-deal">${itemById(d.id).icon}<i>−${d.discount}%</i></span>`).join('')}</span>
    <span class="shop-card-coins">🪙 ${p.coins ?? 0}</span>
  </a>`;
}

export function bindLife(app, rerender) {
  app.querySelector('.gift-card')?.addEventListener('click', () => {
    const p = getProfile();
    if (p.gift === dayKey()) return;
    p.gift = dayKey();
    const n = giftCoins(currentStreak());
    addCoins(n);
    saveProfile();
    sfx.coin();
    confetti({ count: 90 });
    rerender();
  });
}
