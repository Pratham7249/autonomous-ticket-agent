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

  const modalInfo = await page.evaluate(() => {
    // Find element containing "Select all" or "2D"
    const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('Select all') && e.children.length > 0 && e.children.length < 10);
    return el ? el.outerHTML : 'NOT FOUND';
  });
  console.log('Modal element HTML:', modalInfo);

  await browser.close();
})();
