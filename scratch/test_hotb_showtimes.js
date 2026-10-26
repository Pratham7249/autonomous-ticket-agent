const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  await page.goto('https://in.bookmyshow.com/explore/home/mumbai', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  await page.goto('https://in.bookmyshow.com/movies/mumbai/heart-of-the-beast/ET00504928', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const bookBtn = await page.$('button:has-text("Book tickets"), button:has-text("Book Tickets")');
  await bookBtn.click();
  await page.waitForTimeout(2000);

  // Click the 2D format link
  const twoDLink = page.locator('a[class*="sc-ay3jka"]:has-text("2D"), a:has-text("2D")').first();
  if (await twoDLink.isVisible()) {
    console.log('Clicking 2D link...');
    await twoDLink.click();
    await page.waitForTimeout(4000);
  }

  console.log('Current URL:', page.url());
  const dateTabs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, div')).map(d => d.innerText.trim()).filter(t => t.includes('TODAY') || t.includes('TOM') || t.includes('SUN') || t.includes('MON'));
  });
  console.log('Date tabs:', dateTabs.slice(0, 5));

  const pills = await page.evaluate(() => {
    const p = Array.from(document.querySelectorAll('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]'));
    return p.map(el => el.getAttribute('aria-label'));
  });
  console.log(`Found ${pills.length} showtimes!`);
  console.log('Sample showtimes:', pills.slice(0, 5));

  await browser.close();
})();
