const { LESSONS } = await import('/home/user/School/src/content/lessons/index.js');
for (const id of process.argv.slice(2)) {
  const l = LESSONS[id]; if (!l) { console.log(id, 'MISSING'); continue; }
  console.log('==', id, '\n', l.rule.ru, '\n', l.rule.kk, '\n', (l.points||[]).map(p=>'- '+p.ru).join('\n'), '\n', l.check.q.ru, l.check.options.map(o=>o.ru), l.check.answer);
}
