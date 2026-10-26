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

  const rowTexts = await page.evaluate(() => {
    const virtualRows = Array.from(document.querySelectorAll('.ReactVirtualized__Grid__innerScrollContainer > div'));
    return virtualRows.map((row, idx) => ({
      index: idx,
      fullText: row.innerText.split('\n').filter(Boolean)
    }));
  });

  console.log('Row Texts:', JSON.stringify(rowTexts.slice(0, 10), null, 2));

  await browser.close();
})();
