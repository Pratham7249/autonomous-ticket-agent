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
  await page.goto('https://in.bookmyshow.com/movies/pune/pehla-pyaar-doosri-baar/ET00517731', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const btnInfo = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, a')).find(el => (el.innerText || '').toLowerCase().includes('book tickets'));
    if (!btn) return 'Not found';
    return {
      tagName: btn.tagName,
      href: btn.getAttribute('href'),
      outerHTML: btn.outerHTML
    };
  });
  console.log('Book tickets button info:', JSON.stringify(btnInfo, null, 2));

  await browser.close();
})();
