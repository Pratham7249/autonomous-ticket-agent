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

  console.log('Navigating to Mumbai Heart of the Beast...');
  await page.goto('https://in.bookmyshow.com/movies/mumbai/heart-of-the-beast/ET00504928', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const bookBtn = page.locator('button:has-text("Book tickets")').first();
  await bookBtn.click();
  await page.waitForTimeout(2000);

  const btn2D = page.locator('div[class*="sc-a1lh1q"]:has-text("2D")').first();
  console.log('2D visible:', await btn2D.isVisible());
  if (await btn2D.isVisible()) {
    await btn2D.click();
    await page.waitForTimeout(4000);
  }
  console.log('URL after 2D click:', page.url());

  const pills = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]'))
      .map(p => p.getAttribute('aria-label'));
  });
  console.log('Pills count:', pills.length, pills.slice(0, 5));

  await browser.close();
})();
