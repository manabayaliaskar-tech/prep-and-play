const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => m.type()==='error' && errs.push('console: '+m.text()));
  p.on('dialog', d => d.accept());
  const SP = process.argv[2];
  const ans = async () => { if (await p.$('.spr-input')) await p.fill('.spr-input', '999'); else await p.keyboard.press('1'); await p.keyboard.press('Enter'); await p.waitForTimeout(150); };
  // survival via keyboard
  await p.goto('http://localhost:8765/#/survival'); await p.waitForTimeout(300); await p.click('.start-btn'); await p.waitForTimeout(300);
  let guard = 0;
  while (!(await p.$('.results')) && guard++ < 40) { await ans(); await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
  console.log('survival finished:', !!(await p.$('.results')), await p.textContent('.results-sub').catch(()=>'-'));
  // language switch mid question
  await p.goto('http://localhost:8765/#/level/m1/1'); await p.waitForTimeout(400);
  await p.goto('http://localhost:8765/#/'); await p.waitForTimeout(200);
  await p.click('[data-lang="en"]'); await p.waitForTimeout(200);
  await p.goto('http://localhost:8765/#/level/rw1/1'); await p.waitForTimeout(300);
  await p.click('.choice >> nth=2');
  await p.evaluate(() => { document.body.classList.remove('in-session'); });
  await p.click('[data-lang="kk"]').catch(()=>console.log('no topbar in session (expected)'));
  // daily
  await p.goto('http://localhost:8765/#/daily'); await p.waitForTimeout(300); await p.click('.start-btn'); await p.waitForTimeout(300);
  for (let i=0;i<5;i++){ await ans(); await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
  console.log('daily:', await p.textContent('.results-hero h1'));
  await p.goto('http://localhost:8765/#/'); await p.waitForTimeout(200); await p.goto('http://localhost:8765/#/daily'); await p.waitForTimeout(300);
  console.log('daily again:', (await p.textContent('.setup-card')).replace(/\s+/g,' ').slice(0,120));
  // profile
  await p.goto('http://localhost:8765/#/profile'); await p.waitForTimeout(500);
  await p.screenshot({ path: SP + '/pp-profile.png', fullPage: true });
  // weak
  await p.goto('http://localhost:8765/#/weak'); await p.waitForTimeout(300);
  console.log('weak:', (await p.textContent('.setup-card')).replace(/\s+/g,' ').slice(0,160));
  // home after progress
  await p.goto('http://localhost:8765/#/'); await p.waitForTimeout(400);
  await p.screenshot({ path: SP + '/pp-home2.png' });
  console.log('errors', errs);
  await b.close();
})();
