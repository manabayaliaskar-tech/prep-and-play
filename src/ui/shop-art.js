// Рисунки магазина: кристалл-осколок (вторая валюта) и три сундука.

/** Осколок — фиолетовый кристалл. */
export const shardHtml = (cls = '') => `<svg class="shard ${cls}" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 1.5 L20 8 L16.5 21 L7.5 21 L4 8 Z" fill="#a78bfa" stroke="#6d28d9" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M12 1.5 L12 21 M4 8 L20 8 M12 8 L7.5 21 M12 8 L16.5 21" stroke="#6d28d9" stroke-width=".9" opacity=".55"/>
  <path d="M12 1.5 L4 8 L12 8 Z" fill="#ede9fe" opacity=".85"/>
  <path d="M12 8 L7.5 21 L4 8 Z" fill="#7c3aed" opacity=".45"/>
</svg>`;

const CHEST = {
  basic: { body: '#d97706', dark: '#92400e', light: '#fbbf24', band: '#78350f', lock: '#e5e7eb', gem: '#94a3b8' },
  super: { body: '#7c3aed', dark: '#4c1d95', light: '#a78bfa', band: '#facc15', lock: '#fde047', gem: '#f472b6' },
  mega: { body: '#0ea5e9', dark: '#075985', light: '#7dd3fc', band: '#e0f2fe', lock: '#ffffff', gem: '#22d3ee' },
};

/** Сундук: basic — деревянный, super — фиолетовый с золотом, mega — алмазный. open — крышка откинута. */
export function chestSvg(id, { open = false, cls = '' } = {}) {
  const c = CHEST[id] ?? CHEST.basic;
  const lid = open
    ? `<g class="chest-lid" transform="rotate(-28 14 40)"><path d="M10 40 Q10 14 50 14 Q90 14 90 40 Z" fill="${c.body}" stroke="${c.dark}" stroke-width="3" stroke-linejoin="round"/><path d="M18 36 Q20 22 50 22 Q80 22 82 36" fill="none" stroke="${c.light}" stroke-width="3" opacity=".6"/><rect x="44" y="14" width="12" height="26" fill="${c.band}"/></g>`
    : `<g class="chest-lid"><path d="M10 44 Q10 16 50 16 Q90 16 90 44 Z" fill="${c.body}" stroke="${c.dark}" stroke-width="3" stroke-linejoin="round"/><path d="M18 38 Q20 24 50 24 Q80 24 82 38" fill="none" stroke="${c.light}" stroke-width="3" opacity=".6"/><rect x="44" y="16" width="12" height="28" fill="${c.band}" stroke="${c.dark}" stroke-width="1.5"/></g>`;
  const glow = open ? `<g class="chest-glow"><path d="M50 44 L18 -6 L82 -6 Z" fill="#fde68a" opacity=".55"/><ellipse cx="50" cy="44" rx="34" ry="9" fill="#fff7cc" opacity=".9"/></g>` : '';
  return `<svg class="chest chest-${id} ${open ? 'is-open' : ''} ${cls}" viewBox="0 -8 100 92" aria-hidden="true">
    <ellipse cx="50" cy="80" rx="40" ry="5" fill="#000" opacity=".15"/>
    ${glow}
    <rect x="10" y="42" width="80" height="36" rx="5" fill="${c.body}" stroke="${c.dark}" stroke-width="3"/>
    <rect x="10" y="42" width="80" height="9" fill="${c.dark}" opacity=".35"/>
    <path d="M16 70 L84 70" stroke="${c.light}" stroke-width="2.5" opacity=".45" stroke-linecap="round"/>
    <rect x="44" y="42" width="12" height="36" fill="${c.band}" stroke="${c.dark}" stroke-width="1.5"/>
    <rect x="10" y="42" width="7" height="36" fill="${c.band}" opacity=".85"/><rect x="83" y="42" width="7" height="36" fill="${c.band}" opacity=".85"/>
    ${lid}
    <rect x="41" y="${open ? 46 : 38}" width="18" height="16" rx="4" fill="${c.lock}" stroke="${c.dark}" stroke-width="2"/>
    <circle cx="50" cy="${open ? 54 : 46}" r="3.4" fill="${c.gem}"/>
    ${id === 'mega' ? `<path d="M24 56 l4 -6 l4 6 l-4 6 Z M68 56 l4 -6 l4 6 l-4 6 Z" fill="#fff" opacity=".85"/>` : ''}
    ${id === 'super' ? `<circle cx="27" cy="60" r="4" fill="${c.gem}" stroke="${c.band}" stroke-width="1.5"/><circle cx="73" cy="60" r="4" fill="${c.gem}" stroke="${c.band}" stroke-width="1.5"/>` : ''}
  </svg>`;
}
