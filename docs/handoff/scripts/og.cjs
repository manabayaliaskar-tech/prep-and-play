const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.addInitScript(() => { localStorage.setItem('prepplay:lang', JSON.stringify('ru')); localStorage.setItem('prepplay:tourDone', 'true'); });
  await p.goto('http://localhost:3101/#/'); await p.waitForTimeout(1500);
  await p.evaluate(async () => {
    const { mascot } = await import('/src/ui/mascot.js');
    document.body.innerHTML = `<div style="width:1200px;height:630px;display:flex;align-items:center;gap:40px;padding:0 70px;box-sizing:border-box;background:radial-gradient(120% 120% at 0% 0%,#8b6cff,#6c4cf5 45%,#3d1fb8);font-family:Nunito,sans-serif;color:#fff;overflow:hidden">
      <div style="flex:none;width:400px;height:400px;display:grid;place-items:center;filter:drop-shadow(0 20px 30px rgba(0,0,0,.25))">${mascot('win', '', undefined, { fx: false }).replace('<svg', '<svg style="width:400px;height:400px"')}</div>
      <div><div style="font-size:84px;font-weight:900;line-height:1">Prep&amp;Play</div>
      <div style="font-size:40px;font-weight:800;margin-top:18px;line-height:1.2">Подготовка к экзаменам<br>в виде игры</div>
      <div style="font-size:28px;font-weight:700;margin-top:22px;opacity:.9">ЕНТ · ЕГЭ · SAT · IELTS · TOEFL · ОГЭ</div>
      <div style="display:inline-block;margin-top:28px;background:#facc15;color:#2a1d00;font-size:28px;font-weight:900;padding:12px 26px;border-radius:18px">Бесплатно</div></div></div>`;
    document.body.style.margin = '0';
  });
  await p.waitForTimeout(500);
  await p.screenshot({ path: '/home/user/School/icons/og-image.png' });
  await b.close();
})();
