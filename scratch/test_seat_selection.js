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
  console.log('Navigating to seat layout URL...');
  await page.goto(seatLayoutUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  // Look for the "How many seats?" modal
  console.log('Looking for seat count buttons...');
  // The numbers 1..10
  const seat2Btn = await page.locator('li:has-text("2"), div:has-text("2"), span:has-text("2")').filter({ hasText: /^2$/ }).first();
  if (await seat2Btn.isVisible()) {
    console.log('Found seat "2" button, clicking...');
    await seat2Btn.click();
    await page.waitForTimeout(1000);
  }

  // Look for "Select Seats" button
  console.log('Looking for "Select Seats" button...');
  const selectSeatsBtn = await page.locator('button:has-text("Select Seats"), div:has-text("Select Seats")').first();
  if (await selectSeatsBtn.isVisible()) {
    console.log('Clicking "Select Seats"...');
    await selectSeatsBtn.click();
    await page.waitForTimeout(3000);
  }

  // Now we should be on the interactive seat layout grid!
  console.log('Current URL after selecting seats:', page.url());

  // Inspect seat elements on the seat layout grid
  const seatGridInfo = await page.evaluate(() => {
    // Find all clickable seat elements
    const allSeats = Array.from(document.querySelectorAll('a, div, span, button')).filter(el => {
      const cls = el.className || '';
      const id = el.id || '';
      return (typeof cls === 'string' && (cls.includes('seat') || cls.includes('_available') || cls.includes('available'))) ||
             (typeof id === 'string' && id.match(/^[A-Z]_\d+/i));
    });

    return {
      totalFound: allSeats.length,
      sampleSeats: allSeats.slice(0, 10).map(s => ({
        id: s.id,
        className: s.className,
        text: s.innerText?.substring(0, 20),
        tagName: s.tagName
      }))
    };
  });
  console.log('Seat grid info:', JSON.stringify(seatGridInfo, null, 2));

  // Also check general available seat selectors
  const availableSeats = await page.evaluate(() => {
    // Check standard BMS seat classes
    const available = Array.from(document.querySelectorAll('._available, a[data-seat-type], .seat._available, [class*="available"]'));
    return available.map(s => ({
      text: s.innerText.trim(),
      id: s.id,
      class: s.className
    })).slice(0, 10);
  });
  console.log('Available seats detected:', availableSeats);

  // Take screenshot of seat layout
  await page.screenshot({ path: 'scratch/seat_layout.png' });
  console.log('Saved screenshot to scratch/seat_layout.png');

  await browser.close();
})();
