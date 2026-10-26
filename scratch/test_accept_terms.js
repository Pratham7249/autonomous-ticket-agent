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
  await page.waitForTimeout(2000);

  // Click Accept on Terms & Conditions
  const acceptBtn = page.locator('button:has-text("Accept")').first();
  if (await acceptBtn.isVisible()) {
    console.log('Clicking Accept on Terms & Conditions...');
    await acceptBtn.click();
    await page.waitForTimeout(4000);
  }

  console.log('Current URL after Accept:', page.url());

  // Check if F&B modal / Grab a bite is present
  const modalText = await page.evaluate(() => document.body.innerText.substring(0, 400));
  console.log('Page text snippet:', modalText);

  // Check for Skip button (F&B)
  const skipBtn = page.locator('button:has-text("Skip"), div[role="button"]:has-text("Skip")').filter({ hasNotText: 'main content' }).first();
  if (await skipBtn.isVisible()) {
    console.log('F&B Skip button found, clicking...');
    await skipBtn.click();
    await page.waitForTimeout(3000);
    console.log('URL after clicking Skip:', page.url());
  }

  await page.screenshot({ path: 'scratch/after_accept_screen.png' });
  console.log('Saved screenshot to scratch/after_accept_screen.png');

  await browser.close();
})();
