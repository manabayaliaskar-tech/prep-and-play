const r = await import('/home/user/School/src/pools/languages/romance.js');
const c = await import('/home/user/School/src/pools/languages/chinese.js');
const m = { es: r.SPANISH, fr: r.FRENCH, zh: c.CHINESE }[process.argv[2]];
for (const row of m) { const q = typeof row[1] === 'string' ? row[1] : row[1].ru; const a = typeof row[2] === 'string' ? row[2] : row[2].ru; console.log(row[0], q, '=>', a); }
