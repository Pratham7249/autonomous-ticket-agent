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
  await page.goto('https://in.bookmyshow.com/explore/home/pune', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Click the search bar
  console.log('Locating search bar...');
  const searchBtn = await page.$('span:has-text("Search for Movies, Events, Plays, Sports and Activities"), input[placeholder*="Search"]');
  if (searchBtn) {
    console.log('Clicking search...');
    await searchBtn.click();
    await page.waitForTimeout(1500);

    // Check search input field that pops up
    const searchInput = await page.$('input[placeholder*="Search for Movies"], input[type="text"]');
    if (searchInput) {
      console.log('Typing search query "The Vvaan"...');
      await searchInput.fill('The Vvaan');
      await page.waitForTimeout(2000);

      // Check search suggestions/results
      const results = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('li, div[role="button"], a')).filter(el => {
          return el.innerText && el.innerText.toLowerCase().includes('vvaan');
        });
        return items.map(el => ({ text: el.innerText.substring(0, 80), tag: el.tagName, href: el.href || '' })).slice(0, 5);
      });
      console.log('Search suggestions:', results);
    }
  }

  await browser.close();
})();
