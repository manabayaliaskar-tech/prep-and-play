// Маскот Prep&Play — Препи: фиолетовый колобок в выпускной шапочке. Настроение меняется.

const INK = '#2b1b5e';

const EYES_OPEN = `
  <circle cx="44" cy="54" r="10" fill="#fff"/><circle cx="76" cy="54" r="10" fill="#fff"/>
  <circle class="pupil" cx="46" cy="56" r="5" fill="${INK}"/><circle class="pupil" cx="78" cy="56" r="5" fill="${INK}"/>
  <circle cx="48" cy="53" r="1.8" fill="#fff"/><circle cx="80" cy="53" r="1.8" fill="#fff"/>`;

const EYES_HAPPY = `
  <path d="M36 56 q8 -10 16 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M68 56 q8 -10 16 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;

const MOUTHS = {
  happy: `<path d="M48 72 Q60 84 72 72" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  wow: `<ellipse cx="60" cy="76" rx="6" ry="8" fill="${INK}"/>`,
  sad: `<path d="M48 80 Q60 70 72 80" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  win: `<path d="M44 70 Q60 92 76 70 Z" fill="${INK}"/><path d="M52 79 Q60 86 68 79" fill="#ff7aa8"/>`,
};

export function mascot(mood = 'happy', cls = '') {
  const eyes = mood === 'win' ? EYES_HAPPY : EYES_OPEN;
  const mouth = MOUTHS[mood] ?? MOUTHS.happy;
  return `<svg class="mascot mascot-${mood} ${cls}" viewBox="0 0 120 124" aria-hidden="true">
    <defs><linearGradient id="mascot-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a48dff"/><stop offset="1" stop-color="#6c4cf5"/></linearGradient></defs>
    <ellipse cx="60" cy="118" rx="32" ry="5" fill="#000" opacity=".08"/>
    <g class="mascot-body">
      <circle cx="60" cy="66" r="44" fill="url(#mascot-g)"/>
      <ellipse cx="44" cy="40" rx="12" ry="7" fill="#fff" opacity=".18"/>
      <circle cx="33" cy="72" r="6" fill="#ff8fb8" opacity=".55"/><circle cx="87" cy="72" r="6" fill="#ff8fb8" opacity=".55"/>
      ${eyes}${mouth}
      <path d="M60 6 L106 22 L60 38 L14 22 Z" fill="${INK}"/>
      <path d="M38 28 L38 38 Q60 48 82 38 L82 28 L60 36 Z" fill="${INK}"/>
      <path d="M102 23 L102 44" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
      <circle cx="102" cy="47" r="4.5" fill="#facc15"/>
    </g>
  </svg>`;
}

export const LOGO = `<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
  <rect width="32" height="32" rx="9" fill="#6c4cf5"/>
  <path d="M12.5 9.5v13l10.5-6.5z" fill="#fff"/>
  <circle cx="25.5" cy="7.5" r="3.5" fill="#facc15"/>
</svg>`;
