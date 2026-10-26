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
  try {
    const url = 'https://www.redbus.in/bus-tickets/pune-to-nagpur?fromCityName=Pune&toCityName=Nagpur&fromCityId=130&toCityId=624&onward=27-Oct-2026';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(3500);

    // Open first bus view seats
    const viewSeatsBtn = page.locator('div[class*="tupleWrapper"] button, button:has-text("View seats")').first();
    await viewSeatsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await viewSeatsBtn.click();
    await page.waitForTimeout(3000);

    // Click available seat
    const seat = page.locator('span[aria-label*="availability available"]').first();
    await seat.waitFor({ state: 'visible', timeout: 10000 });
    await seat.click();
    await page.waitForTimeout(2000);

    // Inspect elements that match the button
    const result = await page.evaluate(() => {
      const candidates = [];
      document.querySelectorAll('*').forEach(el => {
        const text = (el.innerText || '').trim();
        if (text === 'Select boarding & dropping points') {
          candidates.push({
            tagName: el.tagName,
            className: el.className,
            parentTag: el.parentElement ? el.parentElement.tagName : null,
            parentClass: el.parentElement ? el.parentElement.className : null,
            numChildren: el.children.length,
            isClickable: typeof el.click === 'function'
          });
        }
      });
      return candidates;
    });

    console.log('Result for "Select boarding & dropping points":', JSON.stringify(result, null, 2));

    // Try clicking using getByText
    const btn = page.getByText('Select boarding & dropping points', { exact: true });
    console.log('getByText isVisible:', await btn.isVisible());
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(3000);
      console.log('After click, page URL / step:', page.url());
      const hasBoarding = await page.locator('text="Boarding points"').isVisible().catch(() => false);
      const hasDropping = await page.locator('text="Dropping points"').isVisible().catch(() => false);
      console.log('Boarding points visible:', hasBoarding, 'Dropping points visible:', hasDropping);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
