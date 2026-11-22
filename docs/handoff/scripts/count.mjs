import * as M from '/home/user/School/src/pools/humanities/humanities-more2.js';
import { HISTORY_KZ, HISTORY_REGION, HISTORY_RU, HISTORY_WORLD } from '/home/user/School/src/pools/humanities/history.js';
import { RUSSIAN, SOCIAL } from '/home/user/School/src/pools/humanities/language.js';
const sets = { ru: M.HISTORY_RU_MORE2, social: M.SOCIAL_MORE2, russian: M.RUSSIAN_MORE2, ...M.REGION_MORE2 };
for (const [k, rows] of Object.entries(sets)) { const c = [0,0,0,0]; rows.forEach(r => c[r[0]]++); console.log(k, rows.length, 'd1/d2/d3', c.slice(1).join('/')); }
console.log('totals', HISTORY_RU.length, SOCIAL.length, RUSSIAN.length, Object.entries(HISTORY_REGION).map(([k,v])=>k+':'+v.length).join(' '));
// near-duplicate question check within each bank (ru text)
const all = { ru: HISTORY_RU, social: SOCIAL, russian: RUSSIAN, kz: HISTORY_KZ, world: HISTORY_WORLD, ...HISTORY_REGION };
for (const [k, rows] of Object.entries(all)) { const seen = new Map(); for (const r of rows) { const q = r[1].ru; if (seen.has(q)) console.log('same question text', k, q, '|', r[2].ru ?? r[2], 'vs', seen.get(q)); seen.set(q, r[2].ru ?? r[2]); } }
