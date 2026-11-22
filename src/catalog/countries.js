// Страны экзаменов: флаг (простой SVG-рисунок, без эмодзи - у флагов-эмодзи нет картинок) и название.
// Экзамены на странице «Экзамены» сгруппированы по странам, своя страна - первой.

import { L } from '../pools/gen.js';

/** Пятиконечная звезда: центр, радиус, цвет. */
function star(cx, cy, r, fill, rot = -90) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = ((rot + i * 36) * Math.PI) / 180;
    const rr = i % 2 ? r * 0.4 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
}
const h3 = (a, b, c) => `<rect width="30" height="20" fill="${a}"/><rect y="6.67" width="30" height="6.67" fill="${b}"/><rect y="13.33" width="30" height="6.67" fill="${c}"/>`;
const v3 = (a, b, c) => `<rect width="30" height="20" fill="${b}"/><rect width="10" height="20" fill="${a}"/><rect x="20" width="10" height="20" fill="${c}"/>`;
const crescent = (cx, cy, r, bg, fill = '#fff') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/><circle cx="${cx + r * 0.28}" cy="${cy}" r="${r * 0.8}" fill="${bg}"/>`;

/** Рисунки флагов в рамке 30×20. */
const FLAGS = {
  kz: `<rect width="30" height="20" fill="#00afca"/><g fill="#fec50c"><circle cx="16" cy="8.4" r="2.6"/><circle cx="16" cy="8.4" r="4.1" fill="none" stroke="#fec50c" stroke-width="0.9" stroke-dasharray="0.7 0.6"/><path d="M10.8 13.2c1.6-1.4 3.4-1.6 5.2-.6 1.8-1 3.6-.8 5.2.6-1.8.2-3.4.8-5.2 1.9-1.8-1.1-3.4-1.7-5.2-1.9z"/><rect x="2" y="1" width="1.3" height="18"/></g><g fill="#00afca"><rect x="2.35" y="2" width=".6" height="1.2"/><rect x="2.35" y="5" width=".6" height="1.2"/><rect x="2.35" y="8" width=".6" height="1.2"/><rect x="2.35" y="11" width=".6" height="1.2"/><rect x="2.35" y="14" width=".6" height="1.2"/><rect x="2.35" y="17" width=".6" height="1.2"/></g>`,
  ru: h3('#fff', '#0039a6', '#d52b1e'),
  by: `<rect width="30" height="20" fill="#cf101a"/><rect y="13.33" width="30" height="6.67" fill="#007d2c"/><rect width="4.5" height="20" fill="#fff"/><g fill="#cf101a"><path d="M2.25 1 3.6 3 2.25 5 .9 3z"/><path d="M2.25 7.5 3.6 10 2.25 12.5.9 10z"/><path d="M2.25 15 3.6 17 2.25 19 .9 17z"/></g>`,
  uz: `<rect width="30" height="20" fill="#1eb53a"/><rect width="30" height="13.2" fill="#fff"/><rect width="30" height="6.4" fill="#0099b5"/><rect y="6.4" width="30" height=".4" fill="#ce1126"/><rect y="12.8" width="30" height=".4" fill="#ce1126"/>${crescent(4.6, 3.2, 2.1, '#0099b5')}<g fill="#fff"><circle cx="9" cy="1.6" r=".45"/><circle cx="10.6" cy="1.6" r=".45"/><circle cx="12.2" cy="1.6" r=".45"/><circle cx="9" cy="3.2" r=".45"/><circle cx="10.6" cy="3.2" r=".45"/><circle cx="12.2" cy="3.2" r=".45"/><circle cx="10.6" cy="4.8" r=".45"/><circle cx="12.2" cy="4.8" r=".45"/></g>`,
  kg: `<rect width="30" height="20" fill="#e8112d"/><circle cx="15" cy="10" r="5.6" fill="none" stroke="#ffef00" stroke-width="1.6" stroke-dasharray="0.9 0.7"/><circle cx="15" cy="10" r="3.7" fill="#ffef00"/><circle cx="15" cy="10" r="2.5" fill="#e8112d"/><path d="M12.8 10h4.4M15 7.8v4.4" stroke="#ffef00" stroke-width=".5"/>`,
  tj: `<rect width="30" height="20" fill="#fff"/><rect width="30" height="5.7" fill="#cc0000"/><rect y="14.3" width="30" height="5.7" fill="#006600"/><path d="M13.3 11.2h3.4l-.3-1.4-1.4.6-1.4-.6z" fill="#f8c300"/>${star(12.6, 8.4, 0.6, '#f8c300')}${star(15, 7.6, 0.6, '#f8c300')}${star(17.4, 8.4, 0.6, '#f8c300')}`,
  az: `${h3('#00b5e2', '#ef3340', '#509e2f')}${crescent(14.2, 10, 2.4, '#ef3340')}${star(17.4, 10, 1.1, '#fff', -90)}`,
  am: h3('#d90012', '#0033a0', '#f2a800'),
  md: `${v3('#0046ae', '#ffd200', '#cc092f')}<path d="M13.6 7.4h2.8v4.2l-1.4 1.6-1.4-1.6z" fill="#b07e2c"/>`,
  us: `<rect width="30" height="20" fill="#b22234"/><g fill="#fff">${[1, 3, 5, 7, 9, 11].map((i) => `<rect y="${(i * 20) / 13}" width="30" height="${20 / 13}"/>`).join('')}</g><rect width="12.5" height="10.77" fill="#3c3b6e"/><g fill="#fff">${[1.6, 4.1, 6.6, 9.1].flatMap((y) => [1.4, 3.6, 5.8, 8, 10.2].map((x) => `<circle cx="${x + (y === 4.1 || y === 9.1 ? 1.1 : 0)}" cy="${y}" r=".45"/>`)).join('')}</g>`,
  gb: `<rect width="30" height="20" fill="#012169"/><path d="M0 0l30 20M30 0 0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0 0 20" stroke="#c8102e" stroke-width="1.3"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#c8102e" stroke-width="3.4"/>`,
  cn: `<rect width="30" height="20" fill="#de2910"/>${star(5, 5, 3, '#ffde00')}${star(10, 2, 1, '#ffde00', -60)}${star(12, 4, 1, '#ffde00', -80)}${star(12, 7, 1, '#ffde00', -100)}${star(10, 9, 1, '#ffde00', -120)}`,
  jp: `<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/>`,
  kr: `<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5" fill="#0047a0"/><path d="M10 10a5 5 0 0 1 10 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 0-5 0" fill="#cd2e3a"/><g stroke="#000" stroke-width=".9"><path d="M3.5 3.6l3-2.1M4.3 4.6l3-2.1M5.1 5.6l3-2.1"/><path d="M23.5 1.5l3 2.1M22.7 2.5l3 2.1M21.9 3.5l3 2.1"/><path d="M3.5 16.4l3 2.1M4.3 15.4l3 2.1M5.1 14.4l3 2.1"/><path d="M23.5 18.5l3-2.1M22.7 17.5l3-2.1M21.9 16.5l3-2.1"/></g>`,
  de: h3('#000', '#dd0000', '#ffce00'),
  tr: `<rect width="30" height="20" fill="#e30a17"/>${crescent(11.5, 10, 5, '#e30a17')}${star(16.6, 10, 1.9, '#fff', 180)}`,
  in: `${h3('#ff9933', '#fff', '#138808')}<circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width=".6"/><circle cx="15" cy="10" r=".6" fill="#000080"/><path d="M15 7.4v5.2M12.4 10h5.2M13.2 8.2l3.6 3.6M16.8 8.2l-3.6 3.6" stroke="#000080" stroke-width=".3"/>`,
  es: `<rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/><rect x="7" y="7.6" width="3.4" height="4.8" rx=".6" fill="#aa151b"/>`,
  fr: v3('#0055a4', '#fff', '#ef4135'),
  it: v3('#009246', '#fff', '#ce2b37'),
  intl: `<rect width="30" height="20" fill="#3b82f6"/><circle cx="15" cy="10" r="6.5" fill="none" stroke="#fff" stroke-width="1"/><ellipse cx="15" cy="10" rx="3" ry="6.5" fill="none" stroke="#fff" stroke-width=".8"/><path d="M8.5 10h13M9.6 6.5h10.8M9.6 13.5h10.8" stroke="#fff" stroke-width=".8"/>`,
};

export const COUNTRIES = {
  kz: L('Kazakhstan', 'Казахстан', 'Қазақстан'),
  ru: L('Russia', 'Россия', 'Ресей'),
  by: L('Belarus', 'Беларусь', 'Беларусь'),
  uz: L('Uzbekistan', 'Узбекистан', 'Өзбекстан'),
  kg: L('Kyrgyzstan', 'Кыргызстан', 'Қырғызстан'),
  tj: L('Tajikistan', 'Таджикистан', 'Тәжікстан'),
  az: L('Azerbaijan', 'Азербайджан', 'Әзірбайжан'),
  am: L('Armenia', 'Армения', 'Армения'),
  md: L('Moldova', 'Молдова', 'Молдова'),
  us: L('USA', 'США', 'АҚШ'),
  gb: L('United Kingdom', 'Великобритания', 'Ұлыбритания'),
  intl: L('International', 'Международные', 'Халықаралық'),
  cn: L('China', 'Китай', 'Қытай'),
  jp: L('Japan', 'Япония', 'Жапония'),
  kr: L('South Korea', 'Южная Корея', 'Оңтүстік Корея'),
  de: L('Germany', 'Германия', 'Германия'),
  fr: L('France', 'Франция', 'Франция'),
  es: L('Spain', 'Испания', 'Испания'),
  it: L('Italy', 'Италия', 'Италия'),
  tr: L('Turkey', 'Турция', 'Түркия'),
  in: L('India', 'Индия', 'Үндістан'),
};

/** Страна каждого экзамена (экзамены, которых ещё нет на сайте, просто не встретятся). */
const EXAM_COUNTRY = {
  ent: 'kz', nis: 'kz', bil: 'kz',
  ege: 'ru', oge: 'ru', trki: 'ru',
  ct: 'by', dtm: 'uz', ort: 'kg', tj: 'tj', dim: 'az', arm: 'am', bac: 'md',
  sat: 'us', act: 'us', psat: 'us', ap: 'us', gre: 'us', gmat: 'us', toefl: 'us', toeic: 'us', duolingo: 'us',
  ielts: 'gb', cambridge: 'gb', pte: 'gb', alevel: 'gb', gcse: 'gb',
  ib: 'intl',
  hsk: 'cn', gaokao: 'cn', jlpt: 'jp', topik: 'kr', csat: 'kr',
  goethe: 'de', testdaf: 'de', delf: 'fr', dele: 'es', cils: 'it',
  yks: 'tr', tomer: 'tr', jee: 'in', neet: 'in',
};

/** Порядок стран по умолчанию: СНГ, потом самые популярные направления. */
export const COUNTRY_ORDER = ['kz', 'ru', 'uz', 'kg', 'by', 'tj', 'az', 'am', 'md', 'us', 'gb', 'intl', 'cn', 'kr', 'jp', 'de', 'fr', 'es', 'it', 'tr', 'in'];

/** Валюта пользователя → его страна (для порядка: своя страна первой). */
export const CURRENCY_COUNTRY = { KZT: 'kz', RUB: 'ru', BYN: 'by', UZS: 'uz', KGS: 'kg', TJS: 'tj', AZN: 'az', AMD: 'am', MDL: 'md' };

export const countryOf = (examId) => EXAM_COUNTRY[examId] ?? null;

/** Флаг страны: SVG с закруглёнными краями. */
export function flagSvg(country, cls = '') {
  const art = FLAGS[country];
  if (!art) return '';
  return `<svg class="flag ${cls}" viewBox="0 0 30 20" aria-hidden="true"><clipPath id="fc-${country}"><rect width="30" height="20" rx="3"/></clipPath><g clip-path="url(#fc-${country})">${art}</g></svg>`;
}
