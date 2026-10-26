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

  // Check iframes
  const frames = page.frames();
  console.log('Number of frames:', frames.length);

  // Inspect tags
  const tagsSummary = await page.evaluate(() => {
    // Check if SVG exists
    const svgs = document.querySelectorAll('svg');
    const canvases = document.querySelectorAll('canvas');
    const tables = document.querySelectorAll('table');
    
    // Search for text "PRIME ROWS" or "01" anywhere in textContent
    const all = Array.from(document.querySelectorAll('*'));
    const primeRowEl = all.find(el => el.textContent && el.textContent.includes('PRIME ROWS') && el.children.length < 3);
    const zeroOneEl = all.find(el => el.textContent && el.textContent.trim() === '01');

    return {
      svgCount: svgs.length,
      canvasCount: canvases.length,
      tableCount: tables.length,
      primeRow: primeRowEl ? { tag: primeRowEl.tagName, class: primeRowEl.className, text: primeRowEl.textContent } : null,
      zeroOne: zeroOneEl ? { tag: zeroOneEl.tagName, class: zeroOneEl.className, text: zeroOneEl.textContent, parent: zeroOneEl.parentElement?.tagName } : null
    };
  });
  console.log('Tags summary:', JSON.stringify(tagsSummary, null, 2));

  // If zeroOneEl wasn't found by textContent === '01', let's search all elements containing '01'
  const matching01 = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*'))
      .filter(el => el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 && el.textContent.trim() === '01')
      .map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.trim() }));
  });
  console.log('Text node 01 matches:', matching01);

  // Also search SVG text elements
  const svgTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('text, tspan')).map(t => t.textContent).slice(0, 20);
  });
  console.log('SVG texts:', svgTexts);

  await browser.close();
})();
