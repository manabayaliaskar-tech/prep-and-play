const { chromium } = require('playwright');
const S = __dirname + '/';
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ w: 390, h: 844, n: 'm' }, { w: 1280, h: 900, n: 'd' }]) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e.stack || e).slice(0, 300)));
    p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
    await p.goto('http://localhost:3102/');
    await p.evaluate(() => { localStorage.setItem('prepplay:profile', JSON.stringify({ coins: 20000, shards: 500 })); });
    await p.reload();
    await p.waitForTimeout(500);
    const log = [];
    const ovf = async (tag) => { const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > vp.w) log.push(`OVERFLOW ${tag} ${w}`); };
    for (const tab of ['home', 'wear', 'room', 'emote', 'sets', 'chests']) {
      await p.goto(`http://localhost:3102/#/shop/${tab}`);
      await p.waitForTimeout(700);
      await ovf(tab);
      log.push(`${tab}: cards ${await p.$$eval('.gcard', (x) => x.length)}`);
    }
    // Покупка вещи из гардероба
    await p.goto('http://localhost:3102/#/shop/wear');
    await p.waitForTimeout(500);
    await p.click('[data-slot="hand"]');
    await p.waitForTimeout(300);
    await p.click('.gcard[data-try="wand"]');
    await p.waitForTimeout(300);
    await p.click('.act-buy');
    await p.waitForTimeout(800);
    log.push('wand worn: ' + (await p.evaluate(() => JSON.parse(localStorage.getItem('prepplay:outfit')).hand)));
    if (vp.n === 'm') await p.screenshot({ path: S + 'flow-wand.png' });
    // Комната: купить диван и поставить
    await p.goto('http://localhost:3102/#/shop/room');
    await p.waitForTimeout(500);
    await p.click('[data-rslot="seat"]');
    await p.waitForTimeout(300);
    await p.click('.gcard >> nth=1');
    await p.waitForTimeout(300);
    await p.click('.act-buy');
    await p.waitForTimeout(800);
    log.push('room: ' + (await p.evaluate(() => localStorage.getItem('prepplay:room'))));
    // Эмоция
    await p.goto('http://localhost:3102/#/shop/emote');
    await p.waitForTimeout(500);
    await p.click('.gcard >> nth=0');
    await p.waitForTimeout(300);
    await p.click('.act-buy');
    await p.waitForTimeout(800);
    log.push('emote: ' + (await p.evaluate(() => localStorage.getItem('prepplay:emote'))));
    if (vp.n === 'd') await p.screenshot({ path: S + 'flow-emote.png' });
    // Набор
    await p.goto('http://localhost:3102/#/shop/sets');
    await p.waitForTimeout(500);
    await p.click('.set-buy >> nth=0');
    await p.waitForTimeout(900);
    log.push('active set line: ' + (await p.$eval('.s3-try', (e) => e.innerText.slice(0, 80))));
    // Сундук
    await p.goto('http://localhost:3102/#/shop/chests');
    await p.waitForTimeout(500);
    await p.click('.box-open[data-box="super"]');
    await p.waitForTimeout(400);
    await p.click('.lootbox3');
    await p.waitForTimeout(1800);
    log.push('loot: ' + (await p.$eval('.loot-reveal', (e) => e.innerText.replace(/\s+/g, ' ').slice(0, 100))));
    await p.screenshot({ path: S + `flow-loot-${vp.n}.png` });
    await p.click('.loot-close');
    // Профиль и главная
    await p.goto('http://localhost:3102/#/profile');
    await p.waitForTimeout(700);
    await ovf('profile');
    if (vp.n === 'm') await p.screenshot({ path: S + 'flow-profile.png' });
    await p.goto('http://localhost:3102/#/');
    await p.waitForTimeout(800);
    await ovf('hub');
    await p.click('.prepi-poke');
    await p.waitForTimeout(400);
    console.log(vp.n, log.join('\n  '), '\n  errors', errs);
    await p.close();
  }
  await b.close();
})();
