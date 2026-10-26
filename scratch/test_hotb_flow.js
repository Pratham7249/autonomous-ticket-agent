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

  await page.goto('https://in.bookmyshow.com/explore/home/mumbai', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  await page.goto('https://in.bookmyshow.com/movies/mumbai/heart-of-the-beast/ET00504928', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const bookBtn = await page.$('button:has-text("Book tickets"), button:has-text("Book Tickets")');
  console.log('Book tickets button:', !!bookBtn);
  await bookBtn.click();
  await page.waitForTimeout(2000);

  // Take screenshot or check modal
  const modals = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="dialog"], div[class*="modal"], ul, div[class*="popup"]'))
      .map(d => d.innerText)
      .filter(t => t && t.length < 300);
  });
  console.log('Modals/dialogs after click:', modals);

  // Check 2D format buttons or language
  const spans = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('span, div')).map(s => s.innerText.trim()).filter(t => t === '2D' || t === '3D' || t.includes('English') || t.includes('Hindi'));
  });
  console.log('Format/language tags found:', Array.from(new Set(spans)));

  // If there is format button, click it
  const formatBtn = page.locator('span:has-text("2D"), div:has-text("2D"), span:has-text("English"), div:has-text("English")').first();
  if (await formatBtn.isVisible().catch(() => false)) {
    console.log('Clicking format...');
    await formatBtn.click();
    await page.waitForTimeout(3000);
  }

  console.log('Current URL now:', page.url());
  const dateTabs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, div')).map(d => d.innerText.trim()).filter(t => t.includes('TODAY') || t.includes('TOM') || t.includes('SUN') || t.includes('MON'));
  });
  console.log('Date tabs:', dateTabs.slice(0, 10));

  await browser.close();
})();
