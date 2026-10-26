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

  // Navigate to seat layout URL
  await page.goto('https://in.bookmyshow.com/movies/mumbai/seat-layout/ET00504928/IMOB/22795/20260928', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  // Close quantity modal if present
  const selectSeatsBtn = page.locator('button:has-text("Select Seats"), div[role="button"]:has-text("Select Seats")').first();
  if (await selectSeatsBtn.isVisible()) {
    await selectSeatsBtn.click();
    await page.waitForTimeout(2000);
  }

  // Inspect Konva objects
  const konvaInfo = await page.evaluate(() => {
    if (!window.Konva || !window.Konva.stages || !window.Konva.stages[0]) return 'No Konva';
    const stage = window.Konva.stages[0];

    // Find all Shapes / Rects / Groups
    const rects = stage.find('Rect');
    const texts = stage.find('Text');

    const sampleRects = rects.slice(0, 20).map(r => ({
      fill: r.fill ? r.fill() : '',
      stroke: r.stroke ? r.stroke() : '',
      attrs: r.attrs,
      pos: r.getAbsolutePosition()
    }));

    // Check available seats: green stroke or green fill
    const availableSeats = [];
    rects.forEach(r => {
      const stroke = (r.stroke ? r.stroke() : '') || '';
      const fill = (r.fill ? r.fill() : '') || '';
      // Green stroke indicates available seat
      if (stroke.toLowerCase().includes('green') || stroke.includes('#') || stroke.includes('rgb') || stroke.includes('31, 173, 62') || stroke.includes('43b02a') || stroke.includes('2dc492')) {
        availableSeats.push({
          stroke,
          fill,
          pos: r.getAbsolutePosition(),
          width: r.width ? r.width() : 0,
          height: r.height ? r.height() : 0
        });
      }
    });

    return {
      totalRects: rects.length,
      totalTexts: texts.length,
      sampleRects,
      availableSeatsCount: availableSeats.length,
      sampleAvailable: availableSeats.slice(0, 10)
    };
  });

  console.log('Konva Inspection:\n', JSON.stringify(konvaInfo, null, 2));

  await browser.close();
})();
