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

  // Select 2 seats
  await page.evaluate(() => {
    const range = document.querySelector('input[type="range"]');
    if (range) {
      range.value = 2;
      range.dispatchEvent(new Event('input', { bubbles: true }));
      range.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  const selectBtn = page.locator('button:has-text("Select Seats"), div[role="button"]:has-text("Select Seats")').first();
  await selectBtn.click();
  await page.waitForTimeout(2500);

  // Inspect seat elements
  const seatDetails = await page.evaluate(() => {
    // Find elements with text "01", "02", "03", etc.
    const seatEls = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.innerText ? el.innerText.trim() : '';
      return text.match(/^0?[1-9]$|^[1-9]\d$/) && el.children.length === 0;
    });

    return {
      count: seatEls.length,
      sample: seatEls.slice(0, 10).map(s => ({
        text: s.innerText.trim(),
        tagName: s.tagName,
        className: s.className,
        id: s.id,
        parentTag: s.parentElement?.tagName,
        parentClass: s.parentElement?.className,
        parentDataset: Object.assign({}, s.parentElement?.dataset),
        dataset: Object.assign({}, s.dataset)
      }))
    };
  });
  console.log('Seat details:', JSON.stringify(seatDetails, null, 2));

  // Let's test clicking seat "01" and "02"
  console.log('Clicking seat 01 and 02...');
  const seat01 = page.locator('div, span, button, a').filter({ hasText: /^01$/ }).first();
  const seat02 = page.locator('div, span, button, a').filter({ hasText: /^02$/ }).first();
  
  if (await seat01.isVisible()) {
    await seat01.click();
    console.log('Clicked 01');
    await page.waitForTimeout(500);
  }
  if (await seat02.isVisible()) {
    await seat02.click();
    console.log('Clicked 02');
    await page.waitForTimeout(1500);
  }

  // Look for the "Pay" or "Book" button at the bottom
  const bottomBar = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, div[role="button"], a')).filter(el => {
      const t = el.innerText || '';
      return t.includes('Pay') || t.includes('Book') || t.includes('Proceed') || t.includes('₹');
    });
    return btns.map(b => ({
      text: b.innerText.replace(/\n/g, ' '),
      tag: b.tagName,
      className: b.className
    })).slice(0, 5);
  });
  console.log('Bottom bar buttons after seat selection:', bottomBar);

  await page.screenshot({ path: 'scratch/seats_selected.png' });
  console.log('Saved screenshot to scratch/seats_selected.png');

  await browser.close();
})();
