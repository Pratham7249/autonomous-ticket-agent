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

  console.log('Navigating to Wakad seat layout...');
  await page.goto('https://in.bookmyshow.com/movies/pune/seat-layout/ET00517731/PMPW/75805/20261026', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Set seat count to 2
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
    console.log('Clicking "Select Seats"...');
    await selectSeatsBtn.click();
    await page.waitForTimeout(3000);
  }

  // Find seats on Konva canvas
  await page.waitForSelector('.konvajs-content', { timeout: 15000 });
  const stagePos = await page.$eval('.konvajs-content', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top };
  });

  const adjacentSeats = await page.evaluate((seatCount) => {
    if (!window.Konva || !window.Konva.stages || !window.Konva.stages[0]) return null;
    const stage = window.Konva.stages[0];
    const rects = stage.find('Rect');

    const available = [];
    rects.forEach(r => {
      const stroke = (r.stroke ? r.stroke() : '') || '';
      const fill = (r.fill ? r.fill() : '') || '';
      const w = r.width ? r.width() : 0;
      // In BMS, available seats have stroke #1FAD3E or green or fill #FFFFFF
      if ((stroke.toUpperCase() === '#1FAD3E' || stroke.includes('31, 173, 62')) && fill.toUpperCase() === '#FFFFFF' && Math.abs(w - 22) < 6) {
        available.push(r.getAbsolutePosition());
      }
    });

    console.log('Available seats count on canvas:', available.length);
    available.sort((a, b) => a.y - b.y || a.x - b.x);

    for (let i = 0; i < available.length - (seatCount - 1); i++) {
      let isConsecutive = true;
      for (let j = 1; j < seatCount; j++) {
        const prev = available[i + j - 1];
        const curr = available[i + j];
        if (Math.abs(curr.y - prev.y) > 4 || Math.abs(curr.x - prev.x - 28) > 6) {
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

  console.log('Found adjacent seats:', JSON.stringify(adjacentSeats, null, 2));

  if (adjacentSeats && adjacentSeats.length > 0) {
    for (let i = 0; i < adjacentSeats.length; i++) {
      const s = adjacentSeats[i];
      const targetX = stagePos.x + s.x + 11;
      const targetY = stagePos.y + s.y + 11;
      console.log(`Clicking seat ${i + 1} at (${Math.round(targetX)}, ${Math.round(targetY)})...`);
      await page.mouse.click(targetX, targetY);
      await page.waitForTimeout(600);
    }
  }

  await page.waitForTimeout(2000);
  const payBtn = page.locator('button:has-text("Pay"), div[role="button"]:has-text("Pay")').first();
  const payVisible = await payBtn.isVisible({ timeout: 5000 }).catch(() => false);
  console.log('Pay button visible:', payVisible);
  if (payVisible) {
    console.log('Pay button text:', (await payBtn.innerText()).replace(/\n/g, ' '));
  }

  await page.screenshot({ path: 'scratch/wakad_seats_selected.png' });
  console.log('Saved scratch/wakad_seats_selected.png');

  await browser.close();
})();
