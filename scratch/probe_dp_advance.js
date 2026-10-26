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
    await page.waitForTimeout(3000);

    const viewSeatsBtn = page.locator('button:has-text("View seats"), div[class*="tupleWrapper"] button').first();
    await viewSeatsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await viewSeatsBtn.click();
    await page.waitForTimeout(3000);

    const seat = page.locator('span[aria-label*="availability available"]').first();
    await seat.waitFor({ state: 'visible', timeout: 10000 });
    await seat.click();
    await page.waitForTimeout(2000);

    const redBtn = page.locator('button, div[role="button"], a, div').filter({ hasText: /^Select boarding & dropping points$/i }).last();
    await redBtn.waitFor({ state: 'visible', timeout: 10000 });
    await redBtn.click({ force: true });
    await page.waitForTimeout(3000);

    // Check dropping point radio dp_0
    console.log('Clicking dropping point radio dp_0...');
    const dp0 = page.locator('input[name="dp_0"]').first();
    if (await dp0.isVisible().catch(() => false)) {
      await dp0.check({ force: true });
    } else {
      await page.evaluate(() => {
        const dp = document.querySelector('input[name^="dp_"]');
        if (dp) {
          dp.checked = true;
          dp.click();
          dp.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
    await page.waitForTimeout(1500);

    // Now inspect all buttons that appear
    const activeButtons = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, div[role="button"], a'));
      return all.map(el => ({
        tag: el.tagName,
        text: (el.innerText || '').trim(),
        role: el.getAttribute('role'),
        className: el.className,
        rect: el.getBoundingClientRect()
      })).filter(b => b.text.length > 2 && b.rect.width > 30);
    });
    console.log('Active buttons after checking dp_0:');
    console.log(JSON.stringify(activeButtons, null, 2));

    // Try clicking the button or tab "Passenger Info"
    const pTab = page.locator('text="Passenger Info"').first();
    console.log('Passenger Info tab visible:', await pTab.isVisible().catch(() => false));
    if (await pTab.isVisible().catch(() => false)) {
      await pTab.click();
      await page.waitForTimeout(2500);
      console.log('After clicking Passenger Info tab, inputs count:', await page.locator('input').count());
      const pInputs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input')).map(i => ({
          name: i.name,
          type: i.type,
          placeholder: i.placeholder,
          id: i.id,
          parent: i.parentElement ? i.parentElement.innerText.substring(0, 40) : ''
        }));
      });
      console.log('Passenger screen inputs:', JSON.stringify(pInputs, null, 2));
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
