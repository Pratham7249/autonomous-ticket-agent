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

  const urls = [
    'https://in.bookmyshow.com/movies/pune/udta-teer/ET00495822',
    'https://in.bookmyshow.com/movies/pune/prahaar/ET00502504',
    'https://in.bookmyshow.com/movies/pune/drishyam-the-conclusion/ET00477911'
  ];

  for (const url of urls) {
    console.log(`Checking ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(2000);
    const bookBtn = page.locator('button:has-text("Book tickets"), button:has-text("Book Tickets")').first();
    if (await bookBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bookBtn.click();
      await page.waitForTimeout(2500);

      const formatBtn = page.locator('div[class*="sc-a1lh1q"]:has-text("2D"), div:has-text("2D")').first();
      if (await formatBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await formatBtn.click();
        await page.waitForTimeout(2500);
      }

      const cinemas = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href*="/cinemas/"]')).map(l => l.innerText.trim()).filter(Boolean);
      });
      console.log(`Cinemas (${cinemas.length}):`, cinemas.slice(0, 15));
    } else {
      console.log('No Book tickets button (upcoming movie).');
    }
  }

  await browser.close();
})();
