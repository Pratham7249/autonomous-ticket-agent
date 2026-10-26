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

  console.log('Navigating to movie in Pune...');
  await page.goto('https://in.bookmyshow.com/movies/pune/pehla-pyaar-doosri-baar/ET00517731', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const bookBtn = page.locator('button:has-text("Book tickets")').first();
  await bookBtn.click();
  await page.waitForTimeout(2500);

  const formatBtn = page.locator('div[class*="sc-a1lh1q"]:has-text("2D")').first();
  if (await formatBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await formatBtn.click();
    await page.waitForTimeout(3000);
  }

  console.log('Page URL:', page.url());

  // Wait for pills or theaters
  await page.waitForSelector('a[href*="/cinemas/"]', { timeout: 15000 });
  const data = await page.evaluate(() => {
    const list = [];
    const cinemaLinks = Array.from(document.querySelectorAll('a[href*="/cinemas/"]'));
    cinemaLinks.forEach(link => {
      const theaterName = link.innerText.trim();
      let card = link.closest('li') || link.parentElement;
      for (let i = 0; i < 8; i++) {
        if (!card || !card.parentElement) break;
        if (card.querySelector('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]')) break;
        card = card.parentElement;
      }
      const pills = card ? Array.from(card.querySelectorAll('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]')).map(p => p.getAttribute('aria-label')) : [];
      list.push({ theaterName, pillCount: pills.length, pills });
    });
    return list;
  });

  console.log('Found Theaters & Pills:', JSON.stringify(data, null, 2));

  await browser.close();
})();
