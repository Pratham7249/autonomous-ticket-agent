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

  // View seats
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
  await page.waitForTimeout(2000);

  console.log('--- TESTING DROPPING POINT CLICK METHODS ---');

  // Let's test selecting a dropping point row by finding div[role="radio"] or li
  const result = await page.evaluate(() => {
    // 1. Find all dropping point items
    // Dropping points inputs are name^="dp_"
    const dpInputs = Array.from(document.querySelectorAll('input[name^="dp_"]'));
    const beforeCheck = dpInputs.map(i => ({ name: i.name, checked: i.checked }));

    // Find row with text Chhatrapati or ChinchBhavan or Samruddhi
    const allRadios = Array.from(document.querySelectorAll('div[role="radio"], li[role="listitem"]'));
    const targetRow = allRadios.find(r => {
      const t = (r.innerText || '').toLowerCase();
      return (t.includes('chinchbhavan') || t.includes('chhatrapati') || t.includes('samruddhi')) && r.querySelector('input[name^="dp_"]');
    });

    if (targetRow) {
      // Click the row, the div[role="radio"], and the input
      const radioInput = targetRow.querySelector('input[type="radio"]');
      const radioDiv = targetRow.matches('div[role="radio"]') ? targetRow : targetRow.querySelector('div[role="radio"]');

      if (radioInput) {
        radioInput.click();
        radioInput.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        radioInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (radioDiv) {
        radioDiv.click();
        radioDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
      targetRow.click();
      targetRow.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      return {
        foundTarget: true,
        targetText: targetRow.innerText.slice(0, 50),
        radioInputFound: !!radioInput,
        radioInputCheckedNow: radioInput ? radioInput.checked : false,
        beforeCheck
      };
    }

    return { foundTarget: false, beforeCheck };
  });

  console.log('Selection Result:', JSON.stringify(result, null, 2));

  await page.waitForTimeout(1500);

  // Check which radios are checked across the whole document
  const afterCheck = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="radio"]:checked')).map(r => ({
      name: r.name,
      id: r.id,
      text: (r.closest('li, div[role="radio"]')?.innerText || '').slice(0, 50)
    }));
  });
  console.log('Checked Radios in document:', JSON.stringify(afterCheck, null, 2));

  await browser.close();
})();
