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
  console.log('Navigating to showtimes...');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Click the Wakad showtime pill ("02:35 PM" or first pill of row 0)
  const wakadPill = page.locator('.ReactVirtualized__Grid__innerScrollContainer > div').first().locator('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]').first();
  console.log('Wakad pill visible:', await wakadPill.isVisible());
  console.log('Wakad pill label:', await wakadPill.getAttribute('aria-label'));
  await wakadPill.click();
  await page.waitForTimeout(4000);

  console.log('URL after pill click:', page.url());

  // Check if terms or seat selector modal appears
  const modalText = await page.evaluate(() => {
    const modals = Array.from(document.querySelectorAll('div[role="dialog"], div[class*="modal"], ul[id*="pop"], div[id*="pop"]'));
    return modals.map(m => m.innerText.trim()).filter(Boolean);
  });
  console.log('Modals after pill click:', modalText);

  await page.screenshot({ path: 'scratch/wakad_after_pill_click.png' });
  console.log('Saved scratch/wakad_after_pill_click.png');

  await browser.close();
})();
