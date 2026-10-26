const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('Navigating to seat layout directly...');
  await page.goto('https://in.bookmyshow.com/movies/pune/seat-layout/ET00517731/PMPW/75805/20261026', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const info = await page.evaluate(() => {
    return {
      hasKonva: typeof window.Konva !== 'undefined',
      hasKonvaStages: typeof window.Konva !== 'undefined' && window.Konva.stages && window.Konva.stages.length,
      hasRangeInput: !!document.querySelector('input[type="range"]'),
      buttons: Array.from(document.querySelectorAll('button, div[role="button"]')).map(b => b.innerText ? b.innerText.trim() : '').filter(Boolean).slice(0, 15),
      bodyTextSnippet: document.body.innerText.slice(0, 400)
    };
  });

  console.log('Seat layout info:', JSON.stringify(info, null, 2));

  await browser.close();
})();
