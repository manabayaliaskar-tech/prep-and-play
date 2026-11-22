const f = process.argv[2], name = process.argv[3];
const m = await import(f);
const t = m[name];
const w = (p) => p.paras.reduce((s, [, x]) => s + x.split(/\s+/).length, 0);
console.log(name, t.passages.map(w), t.passages.map((p) => p.groups.reduce((s, g) => s + g.items.length, 0)));
for (const p of t.passages) for (const g of p.groups) for (const it of g.items) {
  const q = it.quote;
  if (q.includes('…') || /^The (passage|writer)/.test(q)) continue;
  const para = p.paras.find(([l]) => l === it.para)?.[1] ?? '';
  if (!para.includes(q)) console.log('QUOTE MISS', p.title, it.para, q.slice(0, 60));
}
