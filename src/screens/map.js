// Карта «Путь к 1600»: два маршрута (R&W и Math), по 4 острова, на каждом 4 уровня и босс.

import { t, tx } from '../core/i18n.js';
import { getProfile, saveProfile } from '../core/profile.js';
import { createRng, newSeed } from '../core/random.js';
import { navigate } from '../core/router.js';
import { QuestionStream, buildSet } from '../content/bank.js';
import { BOSS_DIFFICULTIES, DOMAINS, LEVELS_PER_ZONE, LEVEL_DIFFICULTIES, SECTIONS, ZONES } from '../content/skills.js';
import { starsFor } from '../engine/session.js';
import { esc } from '../ui/dom.js';
import { baseStats, celebrate, runSession } from './play.js';

const LEVEL_SIZE = 5;

export const zoneById = (id) => ZONES.find((z) => z.id === id);
const levelKey = (zoneId, n) => `${zoneId}-${n}`;

export function levelStars(zoneId, n) {
  return getProfile().map.stars[levelKey(zoneId, n)] ?? 0;
}

export function isZoneUnlocked(zone) {
  const track = ZONES.filter((z) => z.track === zone.track);
  const i = track.indexOf(zone);
  return i === 0 || Boolean(getProfile().map.bosses[track[i - 1].id]);
}

export function isLevelUnlocked(zone, n) {
  if (!isZoneUnlocked(zone)) return false;
  return n === 1 || levelStars(zone.id, n - 1) >= 1;
}

export function isBossUnlocked(zone) {
  return isZoneUnlocked(zone) && levelStars(zone.id, LEVELS_PER_ZONE) >= 1;
}

/** Следующий непройденный шаг на маршруте (для кнопки «Продолжить» на главной). */
export function nextStep(track) {
  const bosses = getProfile().map.bosses;
  for (const zone of ZONES.filter((z) => z.track === track)) {
    if (!isZoneUnlocked(zone)) return null;
    for (let n = 1; n <= LEVELS_PER_ZONE; n++) {
      if (levelStars(zone.id, n) === 0) return { zone, n, href: `/level/${zone.id}/${n}` };
    }
    if (!bosses[zone.id]) return { zone, boss: true, href: `/boss/${zone.id}` };
  }
  return { done: true, href: '/map' };
}

function zoneStars(zone) {
  let sum = 0;
  for (let n = 1; n <= LEVELS_PER_ZONE; n++) sum += levelStars(zone.id, n);
  return sum;
}

function zoneHtml(zone, index) {
  const domain = DOMAINS[zone.domain];
  const unlocked = isZoneUnlocked(zone);
  const bossDone = Boolean(getProfile().map.bosses[zone.id]);
  const nodes = [];
  for (let n = 1; n <= LEVELS_PER_ZONE; n++) {
    const open = isLevelUnlocked(zone, n);
    const stars = levelStars(zone.id, n);
    const current = open && stars === 0;
    nodes.push(`
      <a class="node ${open ? '' : 'locked'} ${current ? 'current' : ''} ${stars ? 'done' : ''}" ${open ? `href="#/level/${zone.id}/${n}"` : 'aria-disabled="true"'} style="--i:${n - 1}" aria-label="${t('map.level', { n })}">
        <span class="node-circle">${open ? n : '🔒'}</span>
        <span class="node-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>
      </a>`);
  }
  const bossOpen = isBossUnlocked(zone);
  nodes.push(`
    <a class="node boss-node ${bossOpen ? '' : 'locked'} ${bossDone ? 'done' : bossOpen ? 'current' : ''}" ${bossOpen ? `href="#/boss/${zone.id}"` : 'aria-disabled="true"'} style="--i:4" aria-label="${t('map.boss')}">
      <span class="node-circle">${bossOpen ? zone.boss.icon : '🔒'}</span>
      <span class="node-label">${bossDone ? `✓ ${t('map.defeated')}` : t('map.boss')}</span>
    </a>`);
  return `
    <section class="zone ${unlocked ? '' : 'zone-locked'}" style="--zone:${domain.color}">
      <header class="zone-head">
        <span class="zone-icon">${domain.icon}</span>
        <div>
          <div class="zone-kicker">${t('map.island', { n: index + 1 })}</div>
          <h3>${esc(tx(domain.name))}</h3>
        </div>
        <span class="zone-stars">★ ${zoneStars(zone)}/${LEVELS_PER_ZONE * 3}</span>
      </header>
      ${unlocked ? '' : `<p class="zone-lock-note">🔒 ${t('map.lockedNote')}</p>`}
      <div class="path">${nodes.join('')}</div>
    </section>`;
}

export function mapScreen(app) {
  const render = () => {
    const track = (id) => {
      const zones = ZONES.filter((z) => z.track === id);
      return `
        <div class="track">
          <h2 class="track-title">${SECTIONS[id].icon} ${esc(tx(SECTIONS[id].name))}</h2>
          ${zones.map((z, i) => zoneHtml(z, i)).join('')}
        </div>`;
    };
    app.innerHTML = `
      <section class="page map-page">
        <div class="page-head">
          <h1>🗺️ ${t('map.title')}</h1>
          <p class="muted">${t('map.subtitle')}</p>
        </div>
        <div class="tracks">${track('rw')}${track('math')}</div>
      </section>`;
  };
  render();
  return { relabel: render };
}

export function levelRoute(app, { zone: zoneId, n: nRaw }) {
  const zone = zoneById(zoneId);
  const n = Number(nRaw);
  if (!zone || !(n >= 1 && n <= LEVELS_PER_ZONE) || !isLevelUnlocked(zone, n)) {
    navigate('/map');
    return null;
  }
  const questions = buildSet({
    rng: createRng(newSeed()),
    domains: [zone.domain],
    difficulties: LEVEL_DIFFICULTIES[n - 1],
    count: LEVEL_SIZE,
  });
  return runSession(app, {
    title: () => `${tx(DOMAINS[zone.domain].name)} · ${t('map.level', { n })}`,
    questions,
    exitTo: '/map',
    onFinish: (run) => {
      const stars = starsFor(run.correct, LEVEL_SIZE);
      const p = getProfile();
      const key = levelKey(zone.id, n);
      const before = p.map.stars[key] ?? 0;
      p.map.stars[key] = Math.max(before, stars);
      saveProfile();
      celebrate(stars >= 1);
      const nextHref = n < LEVELS_PER_ZONE ? `/level/${zone.id}/${n + 1}` : `/boss/${zone.id}`;
      return () => ({
        mood: stars >= 1 ? 'win' : 'lose',
        title: stars >= 1 ? t('res.levelDone') : t('res.levelFail'),
        subtitle: stars >= 1 ? (n < LEVELS_PER_ZONE ? t('res.nextUnlocked') : t('res.bossUnlocked')) : t('res.needThree'),
        stars,
        xp: run.xp,
        stats: baseStats(run),
        log: run.log,
        actions: [
          ...(stars >= 1 ? [{ label: n < LEVELS_PER_ZONE ? `${t('res.nextLevel')} →` : `⚔️ ${t('res.fightBoss')}`, href: nextHref, primary: true }] : []),
          { label: `↻ ${t('res.retry')}`, onClick: () => navigate(`/level/${zone.id}/${n}`), primary: stars < 1 },
          { label: `🗺️ ${t('res.toMap')}`, href: '/map' },
        ],
      });
    },
  });
}

export function bossRoute(app, { zone: zoneId }) {
  const zone = zoneById(zoneId);
  if (!zone || !isBossUnlocked(zone)) {
    navigate('/map');
    return null;
  }
  const stream = new QuestionStream({ rng: createRng(newSeed()), domains: [zone.domain] });
  return runSession(app, {
    title: () => `⚔️ ${t('map.bossFight')}`,
    stream,
    difficultyAt: (i) => BOSS_DIFFICULTIES[i < 3 ? 0 : 1],
    lives: 3,
    boss: zone.boss,
    exitTo: '/map',
    onFinish: (run) => {
      const won = run.bossHp === 0;
      const p = getProfile();
      const first = won && !p.map.bosses[zone.id];
      if (won) p.map.bosses[zone.id] = true;
      saveProfile();
      celebrate(won);
      const track = ZONES.filter((z) => z.track === zone.track);
      const nextZone = track[track.indexOf(zone) + 1];
      return () => ({
        mood: won ? 'win' : 'lose',
        title: won ? t('res.bossWin', { name: tx(zone.boss.name) }) : t('res.bossLose', { name: tx(zone.boss.name) }),
        subtitle: won ? (nextZone ? t('res.zoneUnlocked') : t('res.trackDone')) : t('res.bossTip'),
        xp: run.xp,
        stats: baseStats(run),
        log: run.log,
        extraHtml: first ? `<div class="banner-win">🏆 ${t('res.firstBoss')}</div>` : '',
        actions: [
          ...(won && nextZone ? [{ label: `${t('res.nextIsland')} →`, href: `/level/${nextZone.id}/1`, primary: true }] : []),
          ...(won ? [] : [{ label: `↻ ${t('res.retry')}`, onClick: () => navigate(`/boss/${zone.id}`), primary: true }]),
          { label: `🗺️ ${t('res.toMap')}`, href: '/map' },
        ],
      });
    },
  });
}
