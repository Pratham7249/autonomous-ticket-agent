const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars'
    ]
  });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  console.log('Navigating to Pehla Pyaar Doosri Baar in Pune...');
  await page.goto('https://in.bookmyshow.com/movies/pune/pehla-pyaar-doosri-baar/ET00517731', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  const bookBtn = page.locator('button:has-text("Book tickets"), button:has-text("Book Tickets")').first();
  console.log('Book tickets visible:', await bookBtn.isVisible());
  await bookBtn.click();
  await page.waitForTimeout(3000);

  // Check if format modal appears (2D)
  const formatBtn = page.locator('div[class*="sc-a1lh1q"]:has-text("2D"), div:has-text("2D")').first();
  if (await formatBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Format modal visible, clicking 2D...');
    await formatBtn.click();
    await page.waitForTimeout(3000);
  }

  console.log('Current URL on showtimes:', page.url());

  const cinemas = await page.evaluate(() => {
    const cinemaLinks = Array.from(document.querySelectorAll('a[href*="/cinemas/"]'));
    return cinemaLinks.map(l => l.innerText.trim()).filter(Boolean);
  });
  console.log('Cinemas showing this movie in Pune:', cinemas);

  await browser.close();
})();
