const { TOPICS } = await import('/home/user/School/src/pools/topics.js');
const { skillName } = await import('/home/user/School/src/content/labels.js');
const { tx } = await import('/home/user/School/src/core/i18n.js');
const A = ['m', 'o', 'p', 'c', 'b', 'g', 'i'];
const out = { a: [], b: [] };
for (const id of Object.keys(TOPICS)) {
  const pre = id.split('.')[0];
  out[A.includes(pre) ? 'a' : 'b'].push(`${id} | ${tx(skillName(id), 'ru')} | ${tx(skillName(id), 'en')}`);
}
console.log(out.a.length, out.b.length);
const fs = await import('node:fs');
fs.writeFileSync(process.argv[2] + '/topics-a.txt', out.a.join('\n'));
fs.writeFileSync(process.argv[2] + '/topics-b.txt', out.b.join('\n'));
