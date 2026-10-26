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
  await page.waitForTimeout(3000);

  const bookBtn = await page.$('button:has-text("Book tickets"), button:has-text("Book Tickets")');
  await bookBtn.click();
  await page.waitForTimeout(1500);

  // Look for 2D button specifically
  const formatElements = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      if (['2D', '4DX', 'MX4D', 'Select all'].includes(el.innerText && el.innerText.trim()) && el.children.length === 0) {
        list.push({ tag: el.tagName, text: el.innerText.trim(), className: el.className, parentTag: el.parentElement.tagName });
      }
    });
    return list;
  });
  console.log('Format elements:', formatElements);

  // Click 2D directly
  const twoDBtn = page.locator('text="2D"').first();
  console.log('2D button visible:', await twoDBtn.isVisible());
  await twoDBtn.click();
  await page.waitForTimeout(3000);

  console.log('Showtimes URL:', page.url());
  const pills = await page.evaluate(() => {
    const p = Array.from(document.querySelectorAll('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]'));
    return p.map(el => el.getAttribute('aria-label'));
  });
  console.log(`Found ${pills.length} showtime pills:`, pills.slice(0, 5));

  await browser.close();
})();
