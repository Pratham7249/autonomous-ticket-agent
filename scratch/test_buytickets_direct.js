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

  const url1 = 'https://in.bookmyshow.com/movies/pune/pehla-pyaar-doosri-baar/buytickets/ET00517731/20261026?etCodes=ET00517731&language=hindi&refEventCode=ET00517731';
  console.log('Testing url1:', url1);
  await page.goto(url1, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('URL1 landing:', page.url());
  let pills = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]'))
      .map(p => p.getAttribute('aria-label'));
  });
  console.log('Pills on URL1:', pills.length, pills.slice(0, 5));

  const url2 = 'https://in.bookmyshow.com/buytickets/pehla-pyaar-doosri-baar-pune/movie-pune-ET00517731-MT/20261026';
  console.log('\nTesting url2:', url2);
  await page.goto(url2, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('URL2 landing:', page.url());
  pills = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]'))
      .map(p => p.getAttribute('aria-label'));
  });
  console.log('Pills on URL2:', pills.length, pills.slice(0, 5));

  await browser.close();
})();
