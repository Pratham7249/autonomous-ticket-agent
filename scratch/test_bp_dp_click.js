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

  console.log('Navigating...');
  await page.goto('https://www.redbus.in/bus-tickets/pune-to-nagpur?fromCityId=130&fromCityName=Pune&toCityId=624&toCityName=Nagpur&onward=25-Oct-2026&doj=25-Oct-2026&ref=search', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  // Click View seats
  const viewSeatsBtn = page.locator('button:has-text("View seats"), button[class*="viewSeatsBtn"]').first();
  await viewSeatsBtn.click({ force: true });
  await page.waitForTimeout(3000);

  // Select 1 berth
  const seat = page.locator('span[aria-label*="availability available"], span[class*="sleeper"]:has-text("₹")').first();
  await seat.click({ force: true });
  await page.waitForTimeout(1000);

  // Click red button
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const btn = all.reverse().find(el => (el.innerText || '').trim() === 'Select boarding & dropping points' && el.children.length === 0);
    if (btn) btn.click();
  });
  await page.waitForTimeout(2500);

  // Select Boarding Point Wageshwar
  console.log('Targeting Wageshwar row...');
  const bpRow = page.locator('li[role="listitem"], div[role="radio"]').filter({ hasText: /Wageshwar/i }).first();
  console.log('bpRow visible:', await bpRow.isVisible());
  await bpRow.click({ force: true });
  await page.waitForTimeout(1000);

  // Select Dropping Point ChinchBhavan or Samruddhi or Chhatrapati
  console.log('Targeting ChinchBhavan row...');
  let dpRow = page.locator('li[role="listitem"], div[role="radio"]').filter({ hasText: /ChinchBhavan/i }).first();
  let isDpVisible = await dpRow.isVisible().catch(() => false);
  if (!isDpVisible) {
    console.log('ChinchBhavan not found, trying Chhatrapati...');
    dpRow = page.locator('li[role="listitem"], div[role="radio"]').filter({ hasText: /Chhatrapati/i }).first();
    isDpVisible = await dpRow.isVisible().catch(() => false);
  }
  if (!isDpVisible) {
    console.log('Trying Samruddhi...');
    dpRow = page.locator('li[role="listitem"], div[role="radio"]').filter({ hasText: /Samruddhi/i }).first();
  }

  console.log('dpRow visible:', await dpRow.isVisible());
  await dpRow.scrollIntoViewIfNeeded();
  await dpRow.click({ force: true });
  
  // Also check radio inside dpRow
  const radio = dpRow.locator('input[type="radio"]').first();
  if (await radio.isVisible({ timeout: 1000 }).catch(() => false)) {
    console.log('Checking radio directly...');
    await radio.check({ force: true }).catch(() => {});
  } else {
    // Dispatch click on the role="radio"
    await page.evaluate((dText) => {
      const rows = Array.from(document.querySelectorAll('li[role="listitem"], div[role="radio"]'));
      const target = rows.find(r => (r.innerText || '').toLowerCase().includes(dText.toLowerCase()));
      if (target) {
        const rad = target.querySelector('input[type="radio"]');
        if (rad) {
          rad.checked = true;
          rad.click();
          rad.dispatchEvent(new Event('change', { bubbles: true }));
        }
        target.click();
      }
    }, 'ChinchBhavan');
  }

  await page.waitForTimeout(2000);

  // Verify checked state
  const status = await page.evaluate(() => {
    const checkedRadios = Array.from(document.querySelectorAll('input[type="radio"]:checked')).map(r => ({
      name: r.name,
      id: r.id,
      text: (r.closest('li, div[role="radio"]')?.innerText || '').slice(0, 50)
    }));
    const pageText = document.body.innerText.slice(0, 300);
    const hasPassengerInfo = pageText.includes('Passenger Info') || pageText.includes('Contact details');
    return { checkedRadios, hasPassengerInfo };
  });

  console.log('CLICK VERIFICATION STATUS:', JSON.stringify(status, null, 2));

  await browser.close();
})();
