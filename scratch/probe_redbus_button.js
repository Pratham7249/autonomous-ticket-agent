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
    await page.goto('https://www.redbus.in/bus-tickets/pune-to-nagpur', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Open view seats on first bus
    const viewSeatsBtn = page.locator('button:has-text("View seats"), div[class*="tupleWrapper"] button').first();
    if (await viewSeatsBtn.isVisible({ timeout: 10000 })) {
      await viewSeatsBtn.click();
      await page.waitForTimeout(4000);
    }
    
    // Click first available seat
    const seat = page.locator('span[aria-label*="availability available"]').first();
    if (await seat.isVisible({ timeout: 5000 })) {
      await seat.click();
      await page.waitForTimeout(2000);
    }
    
    // Now inspect all elements that contain "Select boarding" or "boarding & dropping"
    const buttonInfo = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      const matches = all.filter(el => {
        const text = el.innerText || '';
        return text.includes('boarding & dropping') && text.length < 60;
      });
      return matches.map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        text: el.innerText,
        outerHTML: el.outerHTML.substring(0, 200),
        rect: el.getBoundingClientRect()
      }));
    });
    
    console.log('--- FOUND BUTTON ELEMENTS ---');
    console.log(JSON.stringify(buttonInfo, null, 2));

    // Also inspect the tab headers at the top: "Board/Drop point"
    const tabsInfo = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('*')).filter(el => {
        const t = (el.innerText || '').trim();
        return t === 'Board/Drop point' || t === 'Select seats' || t === 'Passenger Info';
      });
      return tabs.map(el => ({
        tagName: el.tagName,
        className: el.className,
        text: el.innerText,
        outerHTML: el.outerHTML.substring(0, 150)
      }));
    });
    console.log('\n--- FOUND TAB ELEMENTS ---');
    console.log(JSON.stringify(tabsInfo, null, 2));
    
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
