const [file, name] = process.argv.slice(2);
const m = await import(file);
const rows = m[name];
const c = {}; const seen = new Set(); let bad = 0;
for (const r of rows) {
  c[r[0]] = (c[r[0]] || 0) + 1;
  const k = r[1] + '|' + r[2];
  if (seen.has(k)) { console.log('DUP', k); bad++; }
  seen.add(k);
  const opts = [r[2], ...r[3]];
  if (new Set(opts).size !== 4 || r[3].length !== 3) { console.log('OPTS', r[1], opts); bad++; }
  if ((r[1].match(/_{3,}/g) || []).length !== 1) { console.log('BLANK', r[1]); bad++; }
  const j = JSON.stringify(r);
  if (/undefined|NaN|null|[—–]/.test(j)) { console.log('BADTXT', j.slice(0, 200)); bad++; }
}
console.log(c, rows.length, 'bad', bad);
if (process.argv[4]) for (const r of rows.filter((x) => x[0] == process.argv[4]).slice(0, 400)) console.log(r[1], '=>', r[2], '|', r[3].join(' / '));
