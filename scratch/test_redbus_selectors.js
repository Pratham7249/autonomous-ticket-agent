const { chromium } = require('playwright-core');

async function test() {
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

  await page.goto('https://www.redbus.in/bus-tickets/mumbai-to-pune', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const tomorrowBtn = page.locator('button:has-text("Tomorrow")').first();
  if (await tomorrowBtn.isVisible()) {
    await tomorrowBtn.click();
    await page.waitForTimeout(5000);

    const viewSeatsBtn = page.locator('button:has-text("View seats"), button[class*="viewSeatsBtn"]').first();
    await viewSeatsBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await viewSeatsBtn.click();
    await page.waitForTimeout(4000);

    const availableSeats = page.locator('span[aria-label*="availability available"]');
    await availableSeats.nth(0).click({ force: true });
    await page.waitForTimeout(800);
    await availableSeats.nth(1).click({ force: true });
    await page.waitForTimeout(1500);

    const selectPointsBtn = page.locator('button:has-text("Select boarding & dropping points"), div:has-text("Select boarding & dropping points")').first();
    console.log('Clicking Select boarding & dropping points...');
    await selectPointsBtn.click({ force: true });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'scratch/redbus_board_drop.png' });
    console.log('Saved screenshot to scratch/redbus_board_drop.png');

    // Check for "Fill passenger details" or "Continue"
    const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Fill passenger details"), button:has-text("Proceed")').first();
    if (await continueBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('Found continue button:', await continueBtn.innerText());
      await continueBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'scratch/redbus_passenger_details.png' });
      console.log('Saved screenshot to scratch/redbus_passenger_details.png');
    }
  }

  await browser.close();
}

test().catch(console.error);
