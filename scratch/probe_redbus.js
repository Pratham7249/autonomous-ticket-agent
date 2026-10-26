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

  console.log('Navigating to RedBus Pune to Nagpur...');
  await page.goto('https://www.redbus.in/bus-tickets/pune-to-nagpur', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  // Click View seats
  console.log('Clicking View seats...');
  const viewSeatsBtn = page.locator('button:has-text("View seats"), button[class*="viewSeatsBtn"]').first();
  await viewSeatsBtn.click({ force: true });
  await page.waitForTimeout(3000);

  // Select 1 berth
  console.log('Selecting seat...');
  const seat = page.locator('span[aria-label*="availability available"], span[class*="sleeper"]:has-text("₹")').first();
  await seat.click({ force: true });
  await page.waitForTimeout(1000);

  // Click red button "Select boarding & dropping points"
  console.log('Clicking Select boarding & dropping points...');
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const btn = all.reverse().find(el => (el.innerText || '').trim() === 'Select boarding & dropping points' && el.children.length === 0);
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);

  // Select boarding point
  console.log('Selecting boarding point...');
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div, li, label, span'));
    const b = items.find(el => (el.innerText || '').toLowerCase().includes('wageshwar') && el.innerText.length < 80);
    if (b) b.click();
  });
  await page.waitForTimeout(1000);

  // Select dropping point
  console.log('Selecting dropping point...');
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div, li, label, span'));
    const d = items.find(el => (el.innerText || '').toLowerCase().includes('chhatrapati') && el.innerText.length < 80);
    if (d) d.click();
  });
  await page.waitForTimeout(2000);

  // Check if there is any continue button or if it went straight to Passenger Info
  const pageState = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasContact = text.includes('Contact details');
    const hasPassenger = text.includes('Passenger details');
    const hasProceed = text.includes('Proceed to pay');
    
    // Find all inputs
    const inputs = Array.from(document.querySelectorAll('input')).map(inp => ({
      type: inp.type,
      name: inp.name,
      id: inp.id,
      placeholder: inp.placeholder,
      value: inp.value,
      className: inp.className,
      parentText: (inp.parentElement ? inp.parentElement.innerText : '').slice(0, 60),
      grandParentText: (inp.parentElement && inp.parentElement.parentElement ? inp.parentElement.parentElement.innerText : '').slice(0, 100)
    }));

    // Find all buttons
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"]')).map(btn => ({
      text: (btn.innerText || '').trim().slice(0, 50),
      className: btn.className,
      role: btn.getAttribute('role')
    })).filter(b => b.text.length > 0 && b.text.length < 50);

    return {
      hasContact,
      hasPassenger,
      hasProceed,
      inputs,
      buttons: buttons.slice(0, 15)
    };
  });

  console.log('PAGE STATE AFTER SELECTING DROPPING POINT:', JSON.stringify(pageState, null, 2));

  await browser.close();
})();
