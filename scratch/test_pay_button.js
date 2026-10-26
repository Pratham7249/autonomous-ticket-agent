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

  // Click seats using coordinates
  const stagePos = await page.$eval('.konvajs-content', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top };
  });

  // Seat 02 & 03
  await page.mouse.click(stagePos.x + 404 + 10, stagePos.y + 98 + 10);
  await page.waitForTimeout(500);
  await page.mouse.click(stagePos.x + 432 + 10, stagePos.y + 98 + 10);
  await page.waitForTimeout(2000);

  // Click Pay button
  console.log('Finding Pay button...');
  const payBtn = page.locator('button:has-text("Pay"), div[role="button"]:has-text("Pay")').first();
  console.log('Pay button text:', await payBtn.innerText());
  await payBtn.click();
  await page.waitForTimeout(3000);

  console.log('Current URL after clicking Pay:', page.url());

  // Check if F&B / "Grab a bite!" modal appeared
  const skipBtn = page.locator('button:has-text("Skip"), div[role="button"]:has-text("Skip"), a:has-text("Skip")').first();
  if (await skipBtn.isVisible()) {
    console.log('F&B modal detected! Clicking Skip...');
    await skipBtn.click();
    await page.waitForTimeout(3000);
    console.log('URL after clicking Skip:', page.url());
  }

  // Check what is on the screen now
  const summaryTexts = await page.evaluate(() => {
    return document.body.innerText.split('\n').filter(t => t.trim().length > 0).slice(0, 30);
  });
  console.log('Screen content:', summaryTexts);

  // Take screenshot of the reached checkout / summary screen
  await page.screenshot({ path: 'scratch/final_summary_screen.png' });
  console.log('Saved screenshot to scratch/final_summary_screen.png');

  await browser.close();
})();
