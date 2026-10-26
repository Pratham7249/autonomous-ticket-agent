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
  await page.waitForTimeout(1500);

  // Click 2D inside the modal
  const twoDModalBtn = page.locator('div:has-text("Select language and format")').locator('text="2D"').last();
  console.log('twoDModalBtn visible:', await twoDModalBtn.isVisible());
  await twoDModalBtn.click();
  await page.waitForTimeout(4000);

  console.log('Navigated URL:', page.url());
  await page.screenshot({ path: 'scratch/hotb_showtimes.png' });
  console.log('Saved scratch/hotb_showtimes.png');

  await browser.close();
})();
