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
  
  await page.goto('https://in.bookmyshow.com/movies/heart-of-the-beast/ET00504928', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());

  const bookBtn = await page.$('button:has-text("Book tickets"), button:has-text("Book Tickets")');
  console.log('Book tickets button visible:', !!bookBtn);

  if (bookBtn) {
    await bookBtn.click();
    await page.waitForTimeout(3000);
    console.log('After clicking Book tickets, URL:', page.url());
  } else {
    // Check what is on the page
    const content = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('Body snippet:', content);
  }

  await browser.close();
})();
