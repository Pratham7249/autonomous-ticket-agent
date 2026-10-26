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

  console.log('Navigating to Mumbai...');
  await page.goto('https://in.bookmyshow.com/explore/home/mumbai', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('Opening Heart of the Beast...');
  await page.goto('https://in.bookmyshow.com/movies/mumbai/heart-of-the-beast/ET00504928', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const bookBtn = await page.$('button:has-text("Book tickets"), button:has-text("Book Tickets")');
  await bookBtn.click();
  await page.waitForTimeout(1500);

  const twoDBtn = page.locator('div[class*="sc-a1lh1q"]:has-text("2D")').first();
  if (await twoDBtn.isVisible()) {
    await twoDBtn.click();
    await page.waitForTimeout(3000);
  }

  // Click Tomorrow tab
  const dateTabs = page.locator('div[class*="sc-6bpksa-0"], div[class*="hiVcXH"], div[class*="duJGtO"], a[class*="date-details"]');
  if (await dateTabs.count() > 1) {
    await dateTabs.nth(1).click({ force: true });
    await page.waitForTimeout(3000);
  }

  // Select first available showtime
  const pills = page.locator('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]');
  await pills.first().scrollIntoViewIfNeeded();
  await pills.first().click({ force: true });
  await page.waitForTimeout(4000);

  // Seat quantity popup
  await page.evaluate(() => {
    const range = document.querySelector('input[type="range"]');
    if (range) {
      range.value = 2;
      range.dispatchEvent(new Event('input', { bubbles: true }));
      range.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(800);

  const selectSeatsBtn = page.locator('button:has-text("Select Seats"), div[role="button"]:has-text("Select Seats")').first();
  if (await selectSeatsBtn.isVisible()) {
    await selectSeatsBtn.click();
    await page.waitForTimeout(3000);
  }

  // Konva Canvas seat selection
  const stagePos = await page.$eval('.konvajs-content', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top };
  });

  const seatClickData = await page.evaluate(() => {
    if (!window.Konva || !window.Konva.stages || !window.Konva.stages[0]) return null;
    const stage = window.Konva.stages[0];
    const texts = stage.find('Text');
    const t1 = texts.find(t => t.text && t.text().trim() === '02');
    const t2 = texts.find(t => t.text && t.text().trim() === '03');
    if (t1 && t2) return { s1: t1.getAbsolutePosition(), s2: t2.getAbsolutePosition() };
    return null;
  });

  if (seatClickData) {
    await page.mouse.click(stagePos.x + seatClickData.s1.x + 10, stagePos.y + seatClickData.s1.y + 10);
    await page.waitForTimeout(600);
    await page.mouse.click(stagePos.x + seatClickData.s2.x + 10, stagePos.y + seatClickData.s2.y + 10);
  } else {
    await page.mouse.click(stagePos.x + 414, stagePos.y + 108);
    await page.waitForTimeout(600);
    await page.mouse.click(stagePos.x + 442, stagePos.y + 108);
  }
  await page.waitForTimeout(2000);

  // Click Pay button
  const payBtn = page.locator('button:has-text("Pay"), div[role="button"]:has-text("Pay")').first();
  await payBtn.click();
  await page.waitForTimeout(2500);

  // Accept Terms
  const acceptTerms = page.locator('button:has-text("Accept")').first();
  if (await acceptTerms.isVisible({ timeout: 2500 }).catch(() => false)) {
    await acceptTerms.click();
    await page.waitForTimeout(3000);
  }

  // Skip FnB
  const fnbSkip = page.locator('button:has-text("Skip"), div[role="button"]:has-text("Skip")').filter({ hasNotText: 'main content' }).first();
  if (await fnbSkip.isVisible({ timeout: 2500 }).catch(() => false)) {
    await fnbSkip.click();
    await page.waitForTimeout(3500);
  }

  console.log('On checkout screen. Submitting guest contact details...');
  const emailInput = page.locator('#deemed-email, input[placeholder*="eg: abc@gmail.com"]');
  const mobileInput = page.locator('#deemed-mobile-number, input[placeholder*="eg: 91480XXXXX"]');
  const submitBtn = page.locator('button:has-text("Submit"), div[role="button"]:has-text("Submit")');

  await emailInput.fill('guest.booking@gmail.com');
  await page.waitForTimeout(500);
  await mobileInput.fill('9820198201');
  await page.waitForTimeout(800);

  console.log('Clicking Submit button...');
  await submitBtn.click();
  await page.waitForTimeout(4000);

  console.log('Current URL after Submit:', page.url());
  await page.screenshot({ path: 'scratch/final_payment_page.png' });
  console.log('Saved screenshot scratch/final_payment_page.png');

  // Let's inspect what's on the page
  const pageText = await page.evaluate(() => {
    return document.body.innerText.substring(0, 1000);
  });
  console.log('Page text snippet:\n', pageText);

  await browser.close();
})();
