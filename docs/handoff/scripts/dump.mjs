import { HISTORY_KZ, HISTORY_REGION, HISTORY_RU, HISTORY_WORLD } from '/home/user/School/src/pools/humanities/history.js';
import { ANALOGIES, RUSSIAN, SENTENCES, SOCIAL } from '/home/user/School/src/pools/humanities/language.js';
const t = (x) => (x && typeof x === 'object') ? (x.ru ?? Object.values(x)[1] ?? JSON.stringify(x)) : x;
const show = (name, rows) => { console.log(`== ${name} (${rows.length})`); for (const r of rows) console.log(r[0], '|', t(r[1]), '=>', t(r[2])); };
const which = process.argv[2];
const all = { kz: HISTORY_KZ, world: HISTORY_WORLD, ru: HISTORY_RU, social: SOCIAL, russian: RUSSIAN, ...HISTORY_REGION };
if (which) show(which, all[which]); else for (const [k,v] of Object.entries(all)) console.log(k, v.length);
