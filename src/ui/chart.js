// Простой линейный график результатов (SVG): одна линия, тонкие отметки, тихая сетка,
// подписи только у первой и последней точки, подсказка при наведении или фокусе.
// Прогнозов нет - только то, что уже было.

import { esc } from './dom.js';

let uid = 0;

/**
 * points: [{ label, value, note, hollow }] - по порядку попыток.
 * max - верх шкалы (максимум экзамена). Возвращает HTML; подсказки включает bindChart().
 */
export function lineChart(points, { max, ariaLabel = '', height = 190 } = {}) {
  if (!points.length) return '';
  return `<div class="chart" data-max="${max}" data-height="${height}" data-label="${esc(ariaLabel)}">${chartSvg(points, { max, ariaLabel, height, width: 600 })}<div class="chart-tip" hidden></div></div>`;
}

/** Сам SVG: рисуется под реальную ширину блока, чтобы подписи были обычного размера. */
function chartSvg(points, { max, ariaLabel, height, width }) {
  const id = `ch${++uid}`;
  const W = Math.max(260, Math.round(width));
  const H = height;
  const pad = { l: 40, r: 18, t: 16, b: 28 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const n = points.length;
  const x = (i) => pad.l + (n === 1 ? iw / 2 : (iw * i) / (n - 1));
  const y = (v) => pad.t + ih - (Math.max(0, Math.min(max, v)) / max) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => Math.round(max * k * 10) / 10);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const area = `${path} L${x(n - 1).toFixed(1)} ${pad.t + ih} L${x(0).toFixed(1)} ${pad.t + ih} Z`;
  const showLabel = (i) => i === 0 || i === n - 1;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ariaLabel)}">
      <defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--chart-line);stop-opacity:.18"/><stop offset="1" style="stop-color:var(--chart-line);stop-opacity:0"/></linearGradient></defs>
      ${ticks
        .map((tk) => `<line class="chart-grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(tk)}" y2="${y(tk)}"/><text class="chart-axis" x="${pad.l - 8}" y="${y(tk) + 4}" text-anchor="end">${tk}</text>`)
        .join('')}
      <path d="${area}" fill="url(#${id}g)"/>
      <path class="chart-line" d="${path}" fill="none"/>
      ${points
        .map(
          (p, i) => `<g class="chart-pt" tabindex="0" data-i="${i}" aria-label="${esc(`${p.label}: ${p.value}${p.note ? ` (${p.note})` : ''}`)}">
            <circle class="chart-hit" cx="${x(i)}" cy="${y(p.value)}" r="16"/>
            <circle class="chart-dot ${p.hollow ? 'is-hollow' : ''}" cx="${x(i)}" cy="${y(p.value)}" r="5"/>
            ${showLabel(i) ? `<text class="chart-val" x="${x(i)}" y="${y(p.value) - 12}" text-anchor="middle">${p.value}</text>` : ''}
            ${showLabel(i) || n <= 8 ? `<text class="chart-axis" x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(p.label)}</text>` : ''}
          </g>`,
        )
        .join('')}
    </svg>`;
}

/** Подсказки у точек графиков внутри root. points - те же данные, что у lineChart. */
export function bindChart(root, points) {
  const box = root.querySelector('.chart');
  if (!box) return;
  const width = box.clientWidth;
  if (width) {
    box.querySelector('svg')?.remove();
    box.insertAdjacentHTML('afterbegin', chartSvg(points, { max: Number(box.dataset.max), height: Number(box.dataset.height), ariaLabel: box.dataset.label, width }));
  }
  const tip = box.querySelector('.chart-tip');
  const show = (g) => {
    const p = points[Number(g.dataset.i)];
    const dot = g.querySelector('.chart-dot').getBoundingClientRect();
    const r = box.getBoundingClientRect();
    tip.innerHTML = `<b>${esc(String(p.value))}</b><span>${esc(p.label)}</span>${p.note ? `<small>${esc(p.note)}</small>` : ''}`;
    tip.hidden = false;
    tip.style.left = `${dot.left - r.left + dot.width / 2}px`;
    tip.style.top = `${dot.top - r.top}px`;
  };
  const hide = () => (tip.hidden = true);
  box.querySelectorAll('.chart-pt').forEach((g) => {
    g.addEventListener('mouseenter', () => show(g));
    g.addEventListener('focus', () => show(g));
    g.addEventListener('click', () => show(g));
    g.addEventListener('mouseleave', hide);
    g.addEventListener('blur', hide);
  });
}
