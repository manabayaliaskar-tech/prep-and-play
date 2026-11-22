// Прохождение режимов до итогового экрана: отвечаем на всё (первый вариант / «1»), ловим ошибки.
const { chromium } = require('playwright');
const START = {
  '/c/ege/base': '.start-train', '/c/ent/history': '.start-boss', '/c/ielts/reading': '.start-test',
  '/x/ent/lv/history/1': null, '/x/ielts/survival': '.start-btn', '/x/ent/blitz': '.start-btn', '/x/ege/duel': '.start-btn', '/x/oge/daily': '.start-btn',
  '/survival': '.start-btn', '/blitz': '.start-btn', '/daily': '.start-btn', '/duel': '.start-btn', '/detective': '.start-btn',
  '/quiz/classic': null, '/quiz/daily': null, '/level/rw1/1': null, '/today': '.start-btn, .today-start, .btn-primary', '/weak/ent': null, '/adapt/ent': null, '/diag/ent': '.start-btn, .btn-primary',
  '/c/python/l1': '.start-train', '/c/spanish/a1': '.start-train', '/c/hsk/hsk1': '.start-train', '/mock/oge': '.start-btn, .mock-start, .btn-primary',
};
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route('https://wkwqbghmghhsvjajlkoi.supabase.co/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await ctx.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); localStorage.setItem('prepplay:passIntroSeen', 'true'); });
  const p = await ctx.newPage();
  let errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  p.on('dialog', (d) => d.accept());
  await p.goto('http://localhost:3101/#/'); await p.waitForTimeout(1200);
  for (const [route, start] of Object.entries(START)) {
    errs = [];
    await p.evaluate((h) => (location.hash = h), '#' + route); await p.waitForTimeout(900);
    if (start) { const s = await p.$(start); if (s) { await s.click().catch(() => {}); await p.waitForTimeout(1200); } }
    let steps = 0, done = false, note = '', idle = 0;
    for (; steps < 140; steps++) {
      if (await p.$('.results')) { done = true; break; }
      const skip = await p.$('.lesson-skip'); if (skip) { await skip.click(); await p.waitForTimeout(500); continue; }
      const modalBtn = await p.$('#modal-root .modal [data-action="0"]'); if (modalBtn) { await modalBtn.click().catch(() => {}); await p.waitForTimeout(200); }
      const opt = await p.$('#app .option-card, #app .ml-btn'); if (opt && !(await p.$('.btn-check'))) { await opt.click(); await p.waitForTimeout(900); continue; }
      const check = await p.$('.btn-check');
      if (!check) { const any = await p.$('.mock-next, .mock-finish, .start-btn, .exam-start, .btn-next-section'); if (any) { await any.click().catch(() => {}); await p.waitForTimeout(600); continue; } note = 'нет кнопки ответа'; break; }
      const disabled = await check.isDisabled();
      if (disabled) {
        const ch = await p.$('[data-choice]:not([disabled])'); const inp = await p.$('.spr-input');
        const tok = await p.$('.tok:not([disabled])');
        if (ch) await ch.click(); else if (inp) await inp.fill('1'); else if (tok) await tok.click(); else { await p.waitForTimeout(600); if (++idle > 6) { note = 'не на что ответить'; break; } continue; }
        await p.waitForTimeout(120);
        if (await check.isDisabled()) { await p.waitForTimeout(700); continue; }
      }
      await check.click(); await p.waitForTimeout(160);
    }
    console.log(`${done ? 'OK ' : '!! '} ${route} шагов ${steps}${note ? ' - ' + note : ''}${errs.length ? ' ОШИБКИ: ' + errs.join(' | ') : ''}`);
  }
  await b.close();
})();
