const { COURSES } = await import('/home/user/School/src/catalog/index.js');
const { EXPLAINERS } = await import('/home/user/School/src/content/explainers.js');
const r = ['/', '/practice', '/exams', '/code', '/quiz', '/quiz/classic', '/quiz/blitz', '/quiz/survival', '/quiz/daily', '/mistakes', '/plan', '/report', '/sat', '/map', '/exam', '/survival', '/blitz', '/weak', '/daily', '/duel', '/detective', '/profile', '/achievements', '/shop', '/season', '/today', '/saved', '/ielts-full', '/explain', '/premium', '/sheets', '/privacy', '/cards/en', '/cards/es', '/cards/fr', '/cards/zh'];
for (const t of ['featured', 'wear', 'room', 'emote', 'sets', 'chests']) r.push('/shop/' + t);
for (const c of COURSES) {
  r.push('/c/' + c.id);
  if (c.tracks.length) { r.push('/sheet/' + c.id, '/weak/' + c.id, '/diag/' + c.id, '/know/' + c.id, '/adapt/' + c.id); }
  for (const tr of c.tracks) r.push(`/c/${c.id}/${tr.id}`);
  if (c.group === 'exams' && c.tracks.length) { for (const m of ['path', 'survival', 'blitz', 'duel', 'daily', 'theory']) r.push(`/x/${c.id}/${m}`); r.push(`/x/${c.id}/lv/${c.tracks[0].id}/1`, '/mock/' + c.id); }
}
for (const e of EXPLAINERS) r.push('/explain/' + e.id);
console.log(JSON.stringify(r));
