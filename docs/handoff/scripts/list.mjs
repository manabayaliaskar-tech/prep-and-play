const h = await import('/home/user/School/src/pools/humanities/history.js');
const b = await import('/home/user/School/src/pools/science/bio-geo.js');
const l = await import('/home/user/School/src/pools/humanities/language.js');
const name = process.argv[2]; const lvl = process.argv[3];
const map = { bio: b.BIOLOGY, geo: b.GEOGRAPHY, soc: l.SOCIAL, kz: h.HISTORY_KZ, ru: h.HISTORY_RU, world: h.HISTORY_WORLD, ...Object.fromEntries(Object.entries(h.HISTORY_REGION)) };
const rows = map[name];
for (const r of rows) if (!lvl || r[0] == lvl) { const t = r[1]; console.log(r[0], (typeof t === 'string' ? t : t.ru).slice(0, 70), '=>', (typeof r[2] === 'string' ? r[2] : r[2].ru).slice(0, 25)); }
