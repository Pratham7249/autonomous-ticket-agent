const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://in.bookmyshow.com/explore/home/mumbai', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    const searchBtn = page.locator('span:has-text("Search for Movies"), input[placeholder*="Search"]').first();
    await searchBtn.click();
    await page.waitForTimeout(1000);
    const searchInput = page.locator('input[placeholder*="Search for Movies"], input[type="text"]').first();
    await searchInput.fill('Ramayana');
    await page.waitForTimeout(2000);
    const results = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('a[href*="/movies/"]'));
      return items.map(el => ({ text: el.innerText.trim(), href: el.href })).slice(0, 10);
    });
    console.log('Results for Ramayana:', results);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
