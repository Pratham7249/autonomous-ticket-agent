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

  const url = 'https://in.bookmyshow.com/movies/pune/pehla-pyaar-doosri-baar/buytickets/ET00517731/20261026?etCodes=ET00517731&language=hindi&refEventCode=ET00517731';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const res = await page.evaluate(() => {
    const link = document.querySelector('a[href*="/cinemas/"]');
    const path = [];
    let curr = link;
    while (curr && curr !== document.body) {
      path.push({
        tag: curr.tagName,
        id: curr.id,
        className: curr.className,
        childCount: curr.children.length,
        hasPills: curr.querySelectorAll('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]').length
      });
      curr = curr.parentElement;
    }
    return path;
  });

  console.log('Hierarchy from link to body:', JSON.stringify(res, null, 2));

  await browser.close();
})();
