// Недельный отчёт (страница + картинка «поделиться») и сундуки за серию дней (карточка на главной и окно).

import { confetti } from '../core/confetti.js';
import { getLang, t, tx } from '../core/i18n.js';
import { addXp, getProfile, saveProfile } from '../core/profile.js';
import { availableChests, lastWeekReport, markReportSeen, nextChest, openChest, reportPending } from '../core/rewards.js';
import { sfx } from '../core/sound.js';
import { skillName } from '../content/labels.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { openModal } from '../ui/overlay.js';
import { COLORS, getOutfit, itemById } from '../core/wardrobe.js';
import { openWardrobe } from '../ui/wardrobe-ui.js';

const WEEKDAYS = {
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  kk: ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс'],
};
const fmtDay = (d) => d.split('-').reverse().slice(0, 2).join('.');

/** Самые слабые темы за всё время (не меньше 3 ответов). */
function weakTopics(limit = 3) {
  const skills = getProfile().skills;
  return Object.entries(skills)
    .filter(([, s]) => s.a >= 3)
    .map(([id, s]) => ({ id, pct: Math.round((s.c / s.a) * 100), m: (s.c + 1) / (s.a + 2) }))
    .sort((a, b) => a.m - b.m)
    .slice(0, limit);
}

// ---------- Карточки на главной ----------

export function rewardCardsHtml() {
  const chests = availableChests();
  const parts = [];
  if (chests.length) {
    const c = chests[0];
    parts.push(`
      <button type="button" class="chest-card" data-open-chest="${c.days}">
        <span class="chest-icon" aria-hidden="true">🎁</span>
        <span class="chest-text"><b>${t('chest.ready', { n: c.days })}</b><small>${t('chest.readyDesc')}</small></span>
        <span class="chest-go">${t('chest.open')}</span>
      </button>`);
  }
  if (reportPending()) {
    parts.push(`
      <a class="report-card" href="#/report">
        <span class="chest-icon" aria-hidden="true">📊</span>
        <span class="chest-text"><b>${t('report.ready')}</b><small>${t('report.readyDesc')}</small></span>
        <span class="daily-go">→</span>
      </a>`);
  }
  return parts.join('');
}

/** Подпись к серии на главной: сколько дней до следующего сундука. */
export function nextChestBadge() {
  const next = nextChest();
  return next ? `<span class="badge chest-badge" title="${t('chest.next', { n: next.left })}">🎁 ${t('chest.inDays', { n: next.left })}</span>` : '';
}

/** Окно открытия сундука. */
export function openChestModal(days, onDone) {
  const close = openModal({
    title: t('chest.title', { n: days }),
    body: `<div class="chest-stage"><button type="button" class="chest-box" aria-label="${t('chest.open')}">🎁</button><p class="muted">${t('chest.tap')}</p></div>`,
  });
  const box = document.querySelector('.chest-box');
  box?.addEventListener('click', () => {
    const chest = openChest(days);
    if (!chest) return close();
    addXp(chest.xp);
    saveProfile();
    sfx.win();
    confetti({ count: 160 });
    const w = itemById(chest.wear);
    document.querySelector('.chest-stage').innerHTML = `
      <div class="chest-open">✨</div>
      <div class="chest-rewards">
        <div class="chest-reward"><b>+${chest.xp} XP</b><small>${t('chest.xp')}</small></div>
        ${w ? `<div class="chest-reward is-wear"><b>${w.icon}</b><small>${t('chest.wear', { name: t(`wear.${w.id}`) })}</small></div>` : ''}
      </div>
      <div class="chest-prepi">${mascot('win', 'mascot-md')}</div>
      <button type="button" class="btn btn-primary chest-wardrobe">${t('chest.toWardrobe')}</button>`;
    document.querySelector('.chest-wardrobe')?.addEventListener('click', () => {
      close();
      openWardrobe(onDone);
    });
    onDone?.();
  });
}

// ---------- Страница отчёта ----------

/** Препи в текущем наряде как картинка (переменные темы подставляются явно — в картинке CSS не работает). */
function prepiImage() {
  const css = getComputedStyle(document.documentElement);
  const palette = COLORS[getOutfit().color] ?? ['--mascot-hi', '--mascot-1', '--mascot-2'].map((v) => css.getPropertyValue(v).trim() || '#a78bfa');
  const svg = mascot('win')
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="280" height="300" ')
    .replace(/ style="--mascot[^"]*"/, '')
    .replace(/var\(--mascot-hi\)/g, palette[0])
    .replace(/var\(--mascot-1\)/g, palette[1])
    .replace(/var\(--mascot-2\)/g, palette[2]);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

/** Картинка 1080×1350 для сторис: итоги недели и Препи в своём наряде. */
async function shareImage(report) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const g = canvas.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 1080, 1350);
  grad.addColorStop(0, '#7c3aed');
  grad.addColorStop(0.55, '#ec4899');
  grad.addColorStop(1, '#f97316');
  g.fillStyle = grad;
  g.fillRect(0, 0, 1080, 1350);
  g.fillStyle = 'rgba(255,255,255,0.16)';
  g.beginPath();
  g.arc(900, 180, 260, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#fff';
  g.font = '800 64px Nunito, system-ui, sans-serif';
  g.fillText('Prep&Play', 80, 140);
  g.font = '700 46px Nunito, system-ui, sans-serif';
  g.fillText(t('report.title'), 80, 220);
  g.font = '600 34px Nunito, system-ui, sans-serif';
  g.fillText(`${fmtDay(report.last.monday)} – ${fmtDay(report.last.rows[6].day)}`, 80, 272);
  const tiles = [
    [String(report.last.total.xp), 'XP'],
    [String(report.last.total.a), t('report.tasks')],
    [`${report.last.accuracy}%`, t('report.accuracy')],
    [`${report.last.active}/7`, t('report.days')],
  ];
  tiles.forEach(([v, label], i) => {
    const x = 80 + (i % 2) * 470;
    const y = 340 + Math.floor(i / 2) * 250;
    g.fillStyle = 'rgba(255,255,255,0.2)';
    g.beginPath();
    g.roundRect(x, y, 440, 220, 36);
    g.fill();
    g.fillStyle = '#fff';
    g.font = '900 96px Nunito, system-ui, sans-serif';
    g.fillText(v, x + 36, y + 120);
    g.font = '600 34px Nunito, system-ui, sans-serif';
    g.fillText(label, x + 36, y + 180);
  });
  const max = Math.max(1, ...report.last.rows.map((r) => r.xp));
  report.last.rows.forEach((r, i) => {
    const h = Math.round((r.xp / max) * 260);
    const x = 100 + i * 128;
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.beginPath();
    g.roundRect(x, 1140 - 260, 80, 260, 20);
    g.fill();
    g.fillStyle = '#fff';
    if (h) {
      g.beginPath();
      g.roundRect(x, 1140 - h, 80, h, 20);
      g.fill();
    }
    g.font = '700 30px Nunito, system-ui, sans-serif';
    g.fillText(WEEKDAYS[getLang()]?.[i] ?? WEEKDAYS.en[i], x + 14, 1190);
  });
  g.font = '700 36px Nunito, system-ui, sans-serif';
  g.fillText(t('report.shareText'), 80, 1280);
  const prepi = await prepiImage();
  if (prepi) g.drawImage(prepi, 760, 20, 280, 300);
  return canvas;
}

async function share(report) {
  const canvas = await shareImage(report);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return;
  const file = new File([blob], 'prep-and-play-week.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Prep&Play', text: t('report.shareText') });
      return;
    } catch {
      // Пользователь закрыл окно «поделиться» — сохраним картинку.
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function reportRoute(app) {
  markReportSeen();
  const render = () => {
    const report = lastWeekReport();
    const { last, change } = report;
    const max = Math.max(1, ...last.rows.map((r) => r.xp));
    const weak = weakTopics();
    const days = WEEKDAYS[getLang()] ?? WEEKDAYS.en;
    app.innerHTML = `
      <section class="page report-page">
        <div class="report-hero">
          ${mascot(last.total.a ? 'win' : 'think', 'mascot-lg float')}
          <div>
            <p class="hero-kicker">${fmtDay(last.monday)} – ${fmtDay(last.rows[6].day)}</p>
            <h1>${t('report.title')}</h1>
            <p class="muted">${last.total.a ? (change === null ? t('report.first') : change >= 0 ? t('report.up', { n: change }) : t('report.down', { n: -change })) : t('report.empty')}</p>
          </div>
        </div>
        <div class="result-stats">
          <div class="result-stat"><span class="rs-icon">⚡</span><b class="count-up" data-to="${last.total.xp}">${last.total.xp}</b><span>XP</span></div>
          <div class="result-stat"><span class="rs-icon">✏️</span><b class="count-up" data-to="${last.total.a}">${last.total.a}</b><span>${t('report.tasks')}</span></div>
          <div class="result-stat"><span class="rs-icon">🎯</span><b>${last.accuracy}%</b><span>${t('report.accuracy')}</span></div>
          <div class="result-stat"><span class="rs-icon">🔥</span><b>${last.active}/7</b><span>${t('report.days')}</span></div>
        </div>
        <div class="panel">
          <h2>${t('report.byDay')}</h2>
          <div class="week-bars">
            ${last.rows
              .map(
                (r, i) => `<div class="week-bar ${r === last.best && r.xp ? 'is-best' : ''}"><span class="wb-value">${r.xp || ''}</span><span class="wb-col"><i style="--h:${Math.round((r.xp / max) * 100)}%"></i></span><span class="wb-day">${days[i]}</span></div>`,
              )
              .join('')}
          </div>
        </div>
        ${
          weak.length
            ? `<div class="panel"><h2>${t('report.weak')}</h2><div class="weak-list">${weak
                .map((w) => `<div class="weak-item"><div class="weak-name">${esc(tx(skillName(w.id)))}</div><div class="bar"><i style="width:${w.pct}%"></i></div><div class="weak-pct">${w.pct}%</div></div>`)
                .join('')}</div><a class="btn btn-soft" href="#/mistakes">🔁 ${t('rv.title')}</a></div>`
            : ''
        }
        <div class="result-actions">
          <button type="button" class="btn btn-primary btn-lg report-share">📤 ${t('report.share')}</button>
          <a class="btn btn-soft btn-lg" href="#/">🏠 ${t('res.home')}</a>
        </div>
      </section>`;
    app.querySelector('.report-share').addEventListener('click', () => share(report));
  };
  render();
  return { relabel: render };
}
