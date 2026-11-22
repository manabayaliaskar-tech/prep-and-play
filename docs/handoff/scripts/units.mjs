const { LESSONS } = await import('/home/user/School/src/content/lessons/index.js');
const UNIT = /\d\s*(m\/s²?|m\/s|km\/h|km|kg|mol|g\b|m\b|s\b|J\b|N\b|W\b|Pa\b|K\b|V\b|A\b|Ohm|Ω|h\b|min\b|cm|mm|L\b|l\b)/;
const seen = new Set();
for (const [id, l] of Object.entries(LESSONS)) {
  const all = [l.rule, ...(l.points || []), l.example.q, ...l.example.steps, l.check.q, ...l.check.options, l.check.why];
  for (const v of all) if (v.ru === v.en && UNIT.test(v.ru) && !id.startsWith('e.') && !/^(py|js|java|cpp|code)\./.test(id)) { const k = id + ' | ' + v.ru; if (!seen.has(k)) { seen.add(k); console.log(k); } }
}
