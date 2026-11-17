// Миниатюры вещей для витрины магазина и гардероба: сама вещь, нарисованная на силуэте Препи
// и обрезанная по своему месту (шапка — сверху, обувь — снизу и т. д.).

import { COLORS, itemById } from '../core/wardrobe.js';
import { AURA_BACK, AURA_SHAPES } from './art/auras.js';
import { PETS } from './art/pets.js';
import { BACK, BODY, CAP, FACE, FEET, HAND, HEAD, NECK } from './art/wear.js';

let uid = 0;

// Видимая область для каждого слота (в координатах Препи 140×150).
const VIEW = {
  head: '12 -14 116 76',
  face: '24 50 92 56',
  neck: '18 88 104 64',
  body: '18 84 104 64',
  feet: '30 112 80 32',
  back: '-12 -6 164 160',
};

const SILHOUETTE = `<circle cx="70" cy="80" r="48" fill="var(--thumb-body, #e9e4ff)"/><ellipse cx="55" cy="130" rx="12.5" ry="7" fill="var(--thumb-body, #e9e4ff)"/><ellipse cx="85" cy="130" rx="12.5" ry="7" fill="var(--thumb-body, #e9e4ff)"/>`;
const EYES = `<g fill="var(--thumb-ink, #cfc6fb)"><ellipse cx="53" cy="76" rx="9" ry="11"/><ellipse cx="87" cy="76" rx="9" ry="11"/><path d="M60 98 Q70 106 80 98" stroke="var(--thumb-ink, #cfc6fb)" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;

const wrap = (slot, view, inner, extra = '') => `<svg class="item-thumb thumb-${slot}" viewBox="${view}" aria-hidden="true" ${extra}>${inner}</svg>`;

/** Миниатюра вещи (SVG). Если рисунка нет — значок вещи. */
export function itemThumb(it) {
  if (typeof it === 'string') it = itemById(it);
  if (!it) return '';
  const id = it.id;
  switch (it.slot) {
    case 'head': {
      const art = id === 'cap' ? CAP : HEAD[id];
      if (art) return wrap('head', VIEW.head, SILHOUETTE + EYES + art);
      break;
    }
    case 'face':
      if (FACE[id]) return wrap('face', VIEW.face, SILHOUETTE + EYES + FACE[id]);
      break;
    case 'neck':
      if (NECK[id]) return wrap('neck', VIEW.neck, SILHOUETTE + NECK[id]);
      break;
    case 'body':
      if (BODY[id]) {
        const c = `tc${++uid}`;
        return wrap('body', VIEW.body, `${SILHOUETTE}<clipPath id="${c}"><circle cx="70" cy="80" r="48"/></clipPath><g clip-path="url(#${c})">${BODY[id]}</g>`);
      }
      break;
    case 'feet':
      if (FEET[id]) return wrap('feet', VIEW.feet, `<circle cx="70" cy="80" r="48" fill="var(--thumb-body, #e9e4ff)"/>${FEET[id]}`);
      break;
    case 'hand':
      if (HAND[id]) return wrap('hand', '-30 -54 60 66', `${HAND[id]}<circle cx="0" cy="0" r="7" fill="var(--thumb-body, #e9e4ff)" stroke="var(--thumb-ink, #cfc6fb)" stroke-width="1.6"/>`);
      break;
    case 'back':
      if (BACK[id]) return wrap('back', VIEW.back, BACK[id] + SILHOUETTE);
      break;
    case 'color': {
      const pal = COLORS[id] ?? ['var(--mascot-hi)', 'var(--mascot-1)', 'var(--mascot-2)'];
      const g = `tg${++uid}`;
      return wrap(
        'color',
        '0 0 100 100',
        `<defs><radialGradient id="${g}" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="${pal[0]}"/><stop offset=".5" stop-color="${pal[1]}"/><stop offset="1" stop-color="${pal[2]}"/></radialGradient></defs>
         <circle cx="50" cy="52" r="40" fill="url(#${g})"/><ellipse cx="36" cy="32" rx="13" ry="7" transform="rotate(-28 36 32)" fill="#fff" opacity=".55"/><circle cx="50" cy="52" r="39" fill="none" stroke="${pal[2]}" stroke-width="2" opacity=".5"/>`,
      );
    }
    case 'aura': {
      const art = AURA_SHAPES[id];
      if (art) {
        const glow = AURA_BACK[id] ? `<g transform="translate(-20 -22) scale(1)" opacity=".8">${AURA_BACK[id]}</g>` : '';
        return wrap('aura', '0 0 100 100', `${glow}<g transform="translate(50 52) scale(3)">${art.shape}</g><g transform="translate(20 22) scale(1.4)" opacity=".75">${art.shape}</g><g transform="translate(82 78) scale(1.2)" opacity=".6">${art.shape}</g>`);
      }
      break;
    }
    case 'pet':
      if (PETS[id]) return wrap('pet', '-24 -42 48 46', PETS[id]);
      break;
    default:
      break;
  }
  return `<span class="item-thumb thumb-icon" aria-hidden="true">${it.icon ?? '🎁'}</span>`;
}
