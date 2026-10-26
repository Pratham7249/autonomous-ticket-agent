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

  // Inspect the canvas elements
  const canvases = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('canvas')).map((c, i) => {
      const rect = c.getBoundingClientRect();
      return {
        index: i,
        width: c.width,
        height: c.height,
        styleWidth: c.style.width,
        styleHeight: c.style.height,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        },
        id: c.id,
        className: c.className,
        parentTag: c.parentElement?.tagName,
        parentClass: c.parentElement?.className
      };
    });
  });
  console.log('Canvas elements:', JSON.stringify(canvases, null, 2));

  // The main layout canvas is usually the largest one!
  // From our screenshot:
  // Top: ~150px
  // The seat grid has:
  // Row A at around Y: ~280px
  // Seat 01 and 02 are near left: ~460px
  // Let's click on the canvas where seat 01 and 02 are located!
  // In the screenshot:
  // Seat 01 is around X=465, Y=280
  // Seat 02 is around X=490, Y=280
  // Let's click at (465, 280) and (490, 280)
  console.log('Clicking canvas at (465, 280)...');
  await page.mouse.click(465, 280);
  await page.waitForTimeout(1000);

  console.log('Clicking canvas at (490, 280)...');
  await page.mouse.click(490, 280);
  await page.waitForTimeout(2000);

  // Take screenshot to see if seats were selected!
  await page.screenshot({ path: 'scratch/after_canvas_clicks.png' });
  console.log('Saved screenshot to scratch/after_canvas_clicks.png');

  // Check if Pay button appeared
  const payButtons = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, div[role="button"], a')).filter(el => {
      const text = el.innerText || '';
      return text.includes('Pay') || text.includes('Book') || text.includes('Proceed') || text.includes('₹520') || text.includes('₹480') || text.includes('₹420');
    });
    return all.map(b => ({ text: b.innerText.replace(/\n/g, ' '), class: b.className, tag: b.tagName }));
  });
  console.log('Pay buttons detected:', payButtons);

  await browser.close();
})();
