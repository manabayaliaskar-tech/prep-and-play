// Справочник формул (как на SAT) и ссылка на калькулятор Desmos.

import { t } from '../core/i18n.js';
import { openModal } from './overlay.js';

const R = (formula, en) => `<div class="ref-item"><div class="ref-formula">${formula}</div><div class="ref-name">${en}</div></div>`;

export function openReference() {
  openModal({
    title: `📏 ${t('ref.title')}`,
    body: `
      <div class="ref-grid">
        ${R('<i>A</i> = π<i>r</i><sup>2</sup>, <i>C</i> = 2π<i>r</i>', 'Circle: area, circumference')}
        ${R('<i>A</i> = <i>ℓw</i>', 'Rectangle: area')}
        ${R('<i>A</i> = ½<i>bh</i>', 'Triangle: area')}
        ${R('<i>c</i><sup>2</sup> = <i>a</i><sup>2</sup> + <i>b</i><sup>2</sup>', 'Pythagorean theorem')}
        ${R('<i>x</i>, <i>x</i>√3, 2<i>x</i>', 'Special right triangle 30°–60°–90°')}
        ${R('<i>s</i>, <i>s</i>, <i>s</i>√2', 'Special right triangle 45°–45°–90°')}
        ${R('<i>V</i> = <i>ℓwh</i>', 'Rectangular prism: volume')}
        ${R('<i>V</i> = π<i>r</i><sup>2</sup><i>h</i>', 'Cylinder: volume')}
        ${R('<i>V</i> = 4/3 π<i>r</i><sup>3</sup>', 'Sphere: volume')}
        ${R('<i>V</i> = 1/3 π<i>r</i><sup>2</sup><i>h</i>', 'Cone: volume')}
        ${R('<i>V</i> = 1/3 <i>ℓwh</i>', 'Pyramid: volume')}
        ${R('360° = 2π radians', 'Degrees in a circle')}
        ${R('180°', 'Sum of the angles of a triangle')}
        ${R('<i>x</i> = (−<i>b</i> ± √(<i>b</i><sup>2</sup> − 4<i>ac</i>)) / 2<i>a</i>', 'Quadratic formula (not on the official sheet — memorize it!)')}
      </div>
      <p class="muted small">${t('ref.note')}</p>
      <a class="btn btn-soft" href="https://www.desmos.com/calculator" target="_blank" rel="noopener">🧮 ${t('ref.desmos')}</a>`,
  });
}
