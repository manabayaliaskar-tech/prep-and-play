const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 700 } });
  await p.goto('http://localhost:3000/#/');
  await p.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('prepplay:wearKnown', JSON.stringify(['cap','nightcap','monocle','lei','jetpack','ocean','sunset','classic']));
    localStorage.setItem('prepplay:profile', JSON.stringify({ xp: 100, achievements: { night: 1, accuracy: 1, weekend: 1, marathon: 1, linguist: 1, streak30: 1 } }));
  });
  const shots = [];
  for (const o of [{ head: 'nightcap', face: 'monocle', neck: 'lei', back: 'jetpack', color: 'ocean' }, { head: 'cap', face: null, neck: 'lei', back: 'jetpack', color: 'sunset' }]) {
    await p.evaluate((o) => localStorage.setItem('prepplay:outfit', JSON.stringify(o)), o);
    await p.goto('http://localhost:3000/#/profile');
    await p.reload();
    await p.waitForTimeout(700);
    shots.push(await (await p.$('.prepi-dress')).screenshot({ path: `shots/wear-new-${shots.length}.png` }));
  }
  await b.close();
})();
