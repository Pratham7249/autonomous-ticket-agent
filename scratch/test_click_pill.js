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
  
  const showtimesUrl = 'https://in.bookmyshow.com/movies/pune/the-vvaan-force-of-the-forrest/buytickets/ET00444235/20260927?etCodes=ET00444235&language=hindi&refEventCode=ET00444235';
  await page.goto(showtimesUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Inspect the showtime button/link element specifically
  const pillDetails = await page.evaluate(() => {
    // Find all elements containing text like 09:00 AM
    const elements = Array.from(document.querySelectorAll('*')).filter(el => {
      return el.innerText && el.innerText.trim() === '09:00 AM';
    });
    return elements.map(el => ({
      tagName: el.tagName,
      className: el.className,
      outerHTML: el.outerHTML,
      hasOnClick: typeof el.onclick === 'function' || !!el.getAttribute('onclick'),
      parentTagName: el.parentElement?.tagName,
      parentClass: el.parentElement?.className,
      parentOuterHTML: el.parentElement?.outerHTML.substring(0, 300)
    }));
  });
  console.log('09:00 AM elements:', JSON.stringify(pillDetails, null, 2));

  // Let's click the parent or the element with Playwright
  console.log('Attempting click on first showtime element...');
  const pill = await page.locator('div:has-text("09:00 AM")').last();
  await pill.click({ force: true });
  await page.waitForTimeout(3000);

  console.log('URL after click:', page.url());
  const bodySnippet = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Body snippet after click:', bodySnippet);

  // Check if any modal opened
  const modals = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#modal, [class*="modal"], [class*="popup"], [class*="dialog"]')).map(m => ({
      class: m.className,
      text: m.innerText.substring(0, 150)
    }));
  });
  console.log('Modals found:', modals);

  await browser.close();
})();
