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
  
  for (const city of ['mumbai', 'pune', 'national-capital-region-ncr', 'bengaluru']) {
    console.log(`Checking city: ${city}`);
    await page.goto(`https://in.bookmyshow.com/explore/home/${city}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const searchBtn = await page.$('span:has-text("Search for Movies"), input[placeholder*="Search"]');
    if (searchBtn) {
      await searchBtn.click();
      await page.waitForTimeout(1000);
      const searchInput = await page.$('input[placeholder*="Search for Movies"], input[type="text"]');
      if (searchInput) {
        await searchInput.fill('Heart of the Beast');
        await page.waitForTimeout(2000);

        const results = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/movies/"]'));
          return links.map(l => ({ text: l.innerText.trim(), href: l.href }));
        });
        console.log(`Results for ${city}:`, results);

        if (results.length > 0) break;
      }
    }
  }

  await browser.close();
})();
