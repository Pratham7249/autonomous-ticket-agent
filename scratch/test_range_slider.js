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

  // Set seat count to 2 via range input or click
  console.log('Selecting seat quantity 2...');
  await page.evaluate(() => {
    const range = document.querySelector('input[type="range"]');
    if (range) {
      range.value = 2;
      range.dispatchEvent(new Event('input', { bubbles: true }));
      range.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(1000);

  // Find Select Seats button
  const selectBtn = page.locator('button:has-text("Select Seats"), div[role="button"]:has-text("Select Seats")').first();
  console.log('Select Seats visible:', await selectBtn.isVisible());
  await selectBtn.click();
  await page.waitForTimeout(3000);

  console.log('URL after clicking Select Seats:', page.url());

  // Check seat layout DOM
  const seatLayoutInfo = await page.evaluate(() => {
    // Find all seat elements
    const seats = Array.from(document.querySelectorAll('td, div, a')).filter(el => {
      const cls = el.className || '';
      return (typeof cls === 'string' && (cls.includes('seat') || cls.includes('_available') || cls.includes('SRow') || cls.includes('seat-container')));
    });

    const seatButtons = Array.from(document.querySelectorAll('a._available, [data-seat-type], div[data-seat-id], a[class*="available"]'));

    return {
      seatCount: seats.length,
      availableCount: seatButtons.length,
      sampleAvailable: seatButtons.slice(0, 10).map(s => ({
        tag: s.tagName,
        className: s.className,
        id: s.id,
        text: s.innerText?.trim(),
        href: s.getAttribute('href'),
        dataset: Object.assign({}, s.dataset)
      }))
    };
  });
  console.log('Seat layout elements:', JSON.stringify(seatLayoutInfo, null, 2));

  // Screenshot of layout
  await page.screenshot({ path: 'scratch/seat_grid_opened.png' });
  console.log('Saved screenshot to scratch/seat_grid_opened.png');

  await browser.close();
})();
