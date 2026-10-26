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

  await page.goto('https://in.bookmyshow.com/movies/mumbai/seat-layout/ET00504928/IMOB/22795/20260928', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const selectSeatsBtn = page.locator('button:has-text("Select Seats"), div[role="button"]:has-text("Select Seats")').first();
  if (await selectSeatsBtn.isVisible()) {
    await selectSeatsBtn.click();
    await page.waitForTimeout(2000);
  }

  const stagePos = await page.$eval('.konvajs-content', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top };
  });

  const adjacentSeats = await page.evaluate((seatCount) => {
    if (!window.Konva || !window.Konva.stages || !window.Konva.stages[0]) return null;
    const stage = window.Konva.stages[0];
    const rects = stage.find('Rect');

    // Filter available seat rects (stroke #1FAD3E and fill #FFFFFF and width ~22)
    const available = [];
    rects.forEach(r => {
      const stroke = (r.stroke ? r.stroke() : '') || '';
      const fill = (r.fill ? r.fill() : '') || '';
      const w = r.width ? r.width() : 0;
      if (stroke.toUpperCase() === '#1FAD3E' && fill.toUpperCase() === '#FFFFFF' && Math.abs(w - 22) < 4) {
        available.push(r.getAbsolutePosition());
      }
    });

    // Group by row (approx same y within 4px)
    available.sort((a, b) => a.y - b.y || a.x - b.x);

    // Find consecutive adjacent seats
    for (let i = 0; i < available.length - (seatCount - 1); i++) {
      let isConsecutive = true;
      for (let j = 1; j < seatCount; j++) {
        const prev = available[i + j - 1];
        const curr = available[i + j];
        if (Math.abs(curr.y - prev.y) > 4 || Math.abs(curr.x - prev.x - 28) > 4) {
          isConsecutive = false;
          break;
        }
      }
      if (isConsecutive) {
        return available.slice(i, i + seatCount);
      }
    }
    return available.slice(0, seatCount);
  }, 2);

  console.log('Selected adjacent seats:', adjacentSeats);

  for (const s of adjacentSeats) {
    await page.mouse.click(stagePos.x + s.x + 11, stagePos.y + s.y + 11);
    await page.waitForTimeout(600);
  }
  await page.waitForTimeout(1500);

  const payBtn = page.locator('button:has-text("Pay"), div[role="button"]:has-text("Pay")').first();
  console.log('Pay button visible:', await payBtn.isVisible());
  if (await payBtn.isVisible()) {
    console.log('Pay button text:', (await payBtn.innerText()).replace(/\n/g, ' '));
  }

  await page.screenshot({ path: 'scratch/smart_seats_clicked.png' });
  await browser.close();
})();
