// «Поделиться результатом»: рисуем карточку-картинку (canvas 1080x1350) и открываем системное меню «Поделиться».
// Если браузер не умеет делиться файлами - окно с картинкой, кнопками «Скачать» и «Скопировать ссылку».
// Модуль грузится только по нажатию кнопки, чтобы не утяжелять первую загрузку.
//
// shareResult({ title, big, small, note, badge, stars }):
//   title - название экзамена или режима, big - крупное число, small - приписка к нему («/140»),
//   note - строка под числом, badge - плашка («Новый рекорд»), stars - вместо числа нарисовать звёзды,
//   text - свой текст сообщения (по умолчанию «Мой результат в Prep&Play: ...»).

import { getLang, t } from '../core/i18n.js';
import { mascot } from './mascot.js';
import { openModal, toast } from './overlay.js';

const SITE = 'https://prepplay.app/';
const W = 1080;
const H = 1350;
const FONT = "Nunito, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const INK = '#22164f';
const MUTED = '#6b6890';

let lastUrl = null;

// ---------- Рисование ----------

const font = (weight, size) => `${weight} ${size}px ${FONT}`;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Подбирает размер шрифта, чтобы строка влезла в maxW. */
function fitSize(ctx, text, weight, size, maxW, min = 24) {
  let s = size;
  ctx.font = font(weight, s);
  while (s > min && ctx.measureText(text).width > maxW) {
    s -= 2;
    ctx.font = font(weight, s);
  }
  return s;
}

function star(ctx, x, y, r, fill) {
  ctx.beginPath();
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 ? r * 0.48 : r;
    ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a));
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  // Скруглённые кончики лучей.
  ctx.lineJoin = 'round';
  ctx.lineWidth = r * 0.14;
  ctx.strokeStyle = fill;
  ctx.stroke();
}

/** Искорка-звёздочка с четырьмя лучами. */
function sparkle(ctx, x, y, s, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Препи в картинку: SVG -> Blob URL -> Image. Цвета темы подставляем прямо в SVG, иначе var() не сработает. */
async function mascotImage() {
  try {
    let svg = mascot('win', '');
    if (!/^<svg[^>]*\sstyle="/.test(svg)) {
      const cs = getComputedStyle(document.body);
      const v = (name, fb) => cs.getPropertyValue(name).trim() || fb;
      svg = svg.replace('<svg ', `<svg style="--mascot-hi:${v('--mascot-hi', '#e4dcff')};--mascot-1:${v('--mascot-1', '#a48dff')};--mascot-2:${v('--mascot-2', '#6c4cf5')}" `);
    }
    svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="560" height="600" ');
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  } catch {
    return null;
  }
}

async function fontsReady() {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    await Promise.race([Promise.all(['900', '800', '700'].map((w) => document.fonts.load(font(w, 60)))), wait(1500)]);
    await Promise.race([document.fonts.ready, wait(1500)]);
  } catch {
    // без шрифта нарисуем системным
  }
}

function dateText() {
  const d = new Date();
  // Казахских названий месяцев может не быть в браузере («2026 M11 21») - тогда просто цифрами.
  if (getLang() === 'kk') return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  try {
    return new Intl.DateTimeFormat(getLang(), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  } catch {
    return new Date().toLocaleDateString();
  }
}

export async function renderCard(card) {
  const [img] = await Promise.all([mascotImage(), fontsReady()]);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'alphabetic';

  // Фон: фиолетовый градиент с мягкими кругами и искрами.
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#8f72ff');
  bg.addColorStop(0.5, '#6c4cf5');
  bg.addColorStop(1, '#3f23bf');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (const [x, y, r] of [[980, 120, 280], [60, 1240, 320], [120, 420, 120]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const [x, y, s, c] of [[150, 300, 22, '#facc15'], [930, 330, 28, '#fde68a'], [880, 520, 16, '#ffffff'], [210, 520, 14, '#ffffff'], [960, 1190, 20, '#facc15']]) sparkle(ctx, x, y, s, c);

  // Шапка: логотип и дата.
  ctx.save();
  roundRect(ctx, 80, 70, 72, 72, 22);
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(108, 92);
  ctx.lineTo(108, 122);
  ctx.lineTo(132, 107);
  ctx.closePath();
  ctx.fillStyle = '#6c4cf5';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(140, 82, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#facc15';
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#fff';
  ctx.font = font(900, 46);
  ctx.textAlign = 'left';
  ctx.fillText('Prep&Play', 172, 123);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  fitSize(ctx, dateText(), 700, 34, 420);
  ctx.fillText(dateText(), W - 80, 120);

  // Заголовок.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  const head = t('share.headline');
  fitSize(ctx, head, 900, 62, W - 160);
  ctx.fillText(head, W / 2, 218);

  // Белая карточка с результатом.
  const px = 70;
  const py = 610;
  const pw = W - 140;
  const ph = 560;
  ctx.save();
  ctx.shadowColor = 'rgba(25, 8, 90, 0.35)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;
  roundRect(ctx, px, py, pw, ph, 64);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Препи стоит на карточке.
  if (img) {
    const mh = 360;
    const mw = (mh * 140) / 150;
    ctx.drawImage(img, W / 2 - mw / 2, py - mh * (143 / 150) + 6, mw, mh);
  }

  const inner = pw - 120;
  const hasBadge = Boolean(card.badge);
  let y = py + (hasBadge ? 118 : 132);
  ctx.fillStyle = INK;
  fitSize(ctx, card.title, 900, 56, inner);
  ctx.fillText(card.title, W / 2, y);

  if (hasBadge) {
    y += 74;
    const s = fitSize(ctx, card.badge, 800, 34, inner - 60);
    const bw = ctx.measureText(card.badge).width + 64;
    roundRect(ctx, W / 2 - bw / 2, y - 46, bw, 66, 33);
    ctx.fillStyle = '#fff4cc';
    ctx.fill();
    ctx.fillStyle = '#8a6500';
    ctx.font = font(800, s);
    ctx.fillText(card.badge, W / 2, y);
  }

  const bigY = py + (hasBadge ? 430 : 400);
  if (card.stars) {
    const n = 3;
    const r = 92;
    const gap = 230;
    for (let i = 0; i < n; i++) {
      const sx = W / 2 + (i - (n - 1) / 2) * gap;
      const sy = bigY - 90 - (i === 1 ? 24 : 0);
      star(ctx, sx + 4, sy + 8, r, 'rgba(180,120,0,0.25)');
      star(ctx, sx, sy, r, i < card.stars ? '#facc15' : '#e7e3f7');
    }
  } else {
    const big = String(card.big ?? '');
    const small = card.small ? String(card.small) : '';
    let bs = 260;
    let ss = 96;
    const widths = () => {
      ctx.font = font(900, bs);
      const a = ctx.measureText(big).width;
      ctx.font = font(800, ss);
      return [a, small ? ctx.measureText(small).width + 12 : 0];
    };
    let [bw, sw] = widths();
    while (bw + sw > inner && bs > 80) {
      bs -= 6;
      ss = Math.round(bs * 0.37);
      [bw, sw] = widths();
    }
    const x0 = W / 2 - (bw + sw) / 2;
    const grad = ctx.createLinearGradient(0, bigY - bs * 0.75, 0, bigY);
    grad.addColorStop(0, '#8f72ff');
    grad.addColorStop(1, '#4a2fd0');
    ctx.textAlign = 'left';
    ctx.font = font(900, bs);
    ctx.fillStyle = grad;
    ctx.fillText(big, x0, bigY);
    if (small) {
      ctx.font = font(800, ss);
      ctx.fillStyle = '#a9a5c4';
      ctx.fillText(small, x0 + bw + 12, bigY);
    }
    ctx.textAlign = 'center';
  }

  if (card.note) {
    ctx.fillStyle = MUTED;
    fitSize(ctx, card.note, 700, 42, inner);
    ctx.fillText(card.note, W / 2, py + ph - 62);
  }

  // Подвал: адрес сайта.
  ctx.font = font(900, 46);
  const site = 'prepplay.app';
  const sw2 = ctx.measureText(site).width + 80;
  roundRect(ctx, W / 2 - sw2 / 2, 1222, sw2, 84, 42);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText(site, W / 2, 1280);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png'));
}

// ---------- Как делимся ----------

const shareText = (card) => card.text ?? t('share.text', { r: `${card.title} - ${card.stars ? '★★★' : `${card.big}${card.small ?? ''}`}` });

/** Системное меню «Поделиться». true - получилось или человек сам закрыл меню. */
async function nativeShare(file, text) {
  if (!navigator.canShare?.({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file], text, url: SITE });
    return true;
  } catch (e) {
    return e?.name === 'AbortError';
  }
}

function download(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = 'prepplay-result.png';
  document.body.append(a);
  a.click();
  a.remove();
}

function copyLink(text) {
  const done = () => toast(`✓ ${t('share.copied')}`, { kind: 'good' });
  const full = `${text} ${SITE}`;
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(full).then(done, () => toast(t('share.fail'), { kind: 'warn' }));
  else toast(t('share.fail'), { kind: 'warn' });
}

function openShareModal(blob, file, text) {
  if (lastUrl) URL.revokeObjectURL(lastUrl);
  lastUrl = URL.createObjectURL(blob);
  const url = lastUrl;
  const canFiles = Boolean(navigator.canShare?.({ files: [file] }));
  openModal({
    title: t('share.title'),
    body: `<img class="share-preview" src="${url}" alt="${t('share.headline')}" width="1080" height="1350">`,
    actions: [
      ...(canFiles ? [{ label: t('share.btn'), primary: true, onClick: () => nativeShare(file, text) }] : []),
      { label: t('share.download'), primary: !canFiles, onClick: () => download(url) },
      { label: t('share.copy'), onClick: () => copyLink(text) },
    ],
  });
}

export async function shareResult(card) {
  let blob;
  try {
    blob = await renderCard(card);
  } catch {
    toast(t('share.fail'), { kind: 'warn' });
    return;
  }
  const text = shareText(card);
  const file = new File([blob], 'prepplay-result.png', { type: 'image/png' });
  if (await nativeShare(file, text)) return;
  openShareModal(blob, file, text);
}
