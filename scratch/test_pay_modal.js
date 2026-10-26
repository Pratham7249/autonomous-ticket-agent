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
  
  const seatLayoutUrl = 'https://in.bookmyshow.com/movies/pune/seat-layout/ET00444235/PMPW/72925/20260927';
  await page.goto(seatLayoutUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Click Select Seats
  const selectBtn = page.locator('button:has-text("Select Seats"), div[role="button"]:has-text("Select Seats")').first();
  await selectBtn.click();
  await page.waitForTimeout(3000);

  // Click seats
  const stagePos = await page.$eval('.konvajs-content', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top };
  });

  await page.mouse.click(stagePos.x + 404 + 10, stagePos.y + 98 + 10);
  await page.waitForTimeout(500);
  await page.mouse.click(stagePos.x + 432 + 10, stagePos.y + 98 + 10);
  await page.waitForTimeout(2000);

  // Click Pay button
  const payBtn = page.locator('button:has-text("Pay"), div[role="button"]:has-text("Pay")').first();
  await payBtn.click();
  await page.waitForTimeout(3000);

  // Take screenshot immediately after clicking Pay!
  await page.screenshot({ path: 'scratch/after_pay_click.png' });
  console.log('Saved screenshot to scratch/after_pay_click.png');

  // Inspect all visible buttons and dialogs
  const buttonsAfterPay = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, div[role="button"], a')).filter(b => {
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < window.innerHeight;
    });
    return btns.map(b => ({
      text: b.innerText.replace(/\n/g, ' ').trim(),
      tag: b.tagName,
      role: b.getAttribute('role'),
      class: b.className
    })).filter(b => b.text.length > 0 && b.text.length < 50);
  });
  console.log('Visible buttons after Pay click:', buttonsAfterPay);

  await browser.close();
})();
