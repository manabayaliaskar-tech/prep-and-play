const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1360, height: 900 } });
  const errors = [];
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const SP = process.argv[2];
  await p.goto('http://localhost:8765/#sorting');
  await p.waitForTimeout(800);
  // step a few times
  for (let i=0;i<5;i++) await p.click('[data-pb="next"]');
  await p.screenshot({ path: SP + '/sort.png', fullPage: true });
  // predict mode
  await p.click('.switch');
  await p.click('[data-pb="reset"]');
  await p.click('[data-pb="play"]');
  await p.waitForTimeout(1500);
  console.log('question visible:', await p.isVisible('[data-role="question"]'));
  await p.screenshot({ path: SP + '/predict.png' });
  await p.click('[data-answer="yes"]');
  await p.waitForTimeout(300);
  console.log('feedback:', await p.textContent('[data-role="feedback"]'));
  // race
  await p.goto('http://localhost:8765/#race'); await p.waitForTimeout(300);
  await p.click('[data-speed="10"]');
  await p.click('[data-role="start"]');
  await p.waitForTimeout(4000);
  await p.screenshot({ path: SP + '/race.png', fullPage: true });
  console.log('insight:', (await p.textContent('[data-role="insight"]')).trim().slice(0,150));
  // path
  await p.goto('http://localhost:8765/#path'); await p.waitForTimeout(300);
  await p.click('[data-role="maze"]');
  await p.click('#view-path [data-pb="play"]');
  await p.waitForTimeout(2500);
  await p.screenshot({ path: SP + '/path-anim.png' });
  await p.click('#view-path [data-pb="end"]');
  await p.waitForTimeout(300);
  await p.click('[data-role="compare"]');
  await p.screenshot({ path: SP + '/path.png', fullPage: true });
  console.log('stats:', await p.textContent('[data-role="stat-visited"]'), await p.textContent('[data-role="stat-cost"]'));
  // quiz
  await p.goto('http://localhost:8765/#quiz'); await p.waitForTimeout(300);
  await p.click('[data-action="start"]');
  await p.click('[data-option="0"]');
  await p.screenshot({ path: SP + '/quiz.png' });
  // mobile
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  m.on('pageerror', e => errors.push('m pageerror: ' + e.message));
  await m.goto('http://localhost:8765/#sorting'); await m.waitForTimeout(500);
  await m.screenshot({ path: SP + '/mobile.png', fullPage: true });
  const sw = await m.evaluate(() => document.documentElement.scrollWidth);
  console.log('mobile scrollWidth', sw);
  await m.goto('http://localhost:8765/#path'); await m.waitForTimeout(500);
  console.log('mobile path scrollWidth', await m.evaluate(() => document.documentElement.scrollWidth));
  await m.screenshot({ path: SP + '/mobile-path.png', fullPage: true });
  console.log('errors:', errors);
  await b.close();
})();
