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

  // Inspect Konva.js stage
  const konvaInfo = await page.evaluate(() => {
    if (!window.Konva || !window.Konva.stages || window.Konva.stages.length === 0) {
      return { konvaAvailable: false };
    }
    const stage = window.Konva.stages[0];
    
    // Find shapes or texts
    const shapes = stage.find('Shape');
    const texts = stage.find('Text');

    // Look for text shapes with numbers
    const seatTexts = texts.filter(t => {
      const text = t.text ? t.text().trim() : '';
      return text.match(/^0?[1-9]$|^[1-9]\d$/);
    });

    return {
      konvaAvailable: true,
      stageWidth: stage.width(),
      stageHeight: stage.height(),
      shapesCount: shapes.length,
      textsCount: texts.length,
      seatTextsCount: seatTexts.length,
      sampleSeatTexts: seatTexts.slice(0, 10).map(t => {
        const pos = t.getAbsolutePosition();
        return {
          text: t.text(),
          x: pos.x,
          y: pos.y,
          attrs: t.attrs
        };
      })
    };
  });
  console.log('Konva Stage Info:', JSON.stringify(konvaInfo, null, 2));

  // Let's also check if Konva shapes have seat objects
  const seatClickTest = await page.evaluate(() => {
    if (!window.Konva || !window.Konva.stages || !window.Konva.stages[0]) return null;
    const stage = window.Konva.stages[0];
    
    // Find text nodes with '01' and '02' in Row A
    const texts = stage.find('Text');
    const t1 = texts.find(t => t.text && t.text().trim() === '01');
    const t2 = texts.find(t => t.text && t.text().trim() === '02');
    
    if (t1 && t2) {
      const p1 = t1.getAbsolutePosition();
      const p2 = t2.getAbsolutePosition();
      return {
        t1Pos: p1,
        t2Pos: p2,
        t1Parent: t1.parent?.className || t1.parent?.nodeType,
        t1Attrs: t1.attrs
      };
    }
    return null;
  });
  console.log('Seat click test info:', seatClickTest);

  if (seatClickTest && seatClickTest.t1Pos) {
    const stagePos = await page.$eval('.konvajs-content', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top };
    });

    const clickX1 = stagePos.x + seatClickTest.t1Pos.x + 10;
    const clickY1 = stagePos.y + seatClickTest.t1Pos.y + 10;
    const clickX2 = stagePos.x + seatClickTest.t2Pos.x + 10;
    const clickY2 = stagePos.y + seatClickTest.t2Pos.y + 10;

    console.log(`Clicking exact coordinates: Seat 01 at (${clickX1}, ${clickY1}), Seat 02 at (${clickX2}, ${clickY2})`);
    await page.mouse.click(clickX1, clickY1);
    await page.waitForTimeout(500);
    await page.mouse.click(clickX2, clickY2);
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'scratch/after_konva_clicks.png' });
    console.log('Saved screenshot to scratch/after_konva_clicks.png');
  }

  await browser.close();
})();
