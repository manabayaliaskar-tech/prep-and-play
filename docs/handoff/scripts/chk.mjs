const [,, file, name] = process.argv;
const m = await import('/home/user/School/src/pools/languages/' + file);
const rows = m[name];
const c = {}; const seen = new Set(); const bad = [];
for (const r of rows) {
  const [lv, s, ok, wr, ex] = r;
  c[lv] = (c[lv] || 0) + 1;
  const k = s + '|' + ok; if (seen.has(k)) bad.push('dup ' + k); seen.add(k);
  if (new Set([ok, ...wr]).size !== 4 || wr.length !== 3) bad.push('opts ' + s + ' ' + [ok, ...wr]);
  if ((s.match(/_{3,}/g) || []).length !== 1) bad.push('blank ' + s);
  for (const l of ['en','ru','kk']) if (!ex[l] || ex[l].length < 20 || /undefined|null|NaN/.test(ex[l])) bad.push('ex ' + l + ' ' + s);
  if (/[—–]/.test(JSON.stringify(r))) bad.push('dash ' + s);
}
console.log(c, rows.length); console.log(bad.slice(0, 30).join('\n'));
if (process.argv[4]) for (const r of rows.filter(r => r[0] == +process.argv[4]).slice(0, +process.argv[5] || 400)) console.log(r[0], r[1], '=>', r[2], '|', r[3].join(', '), '||', r[4].ru);
