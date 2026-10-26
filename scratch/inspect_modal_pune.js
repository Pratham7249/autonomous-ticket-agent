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

  console.log('Navigating to Pune Pehla Pyaar...');
  await page.goto('https://in.bookmyshow.com/movies/pune/pehla-pyaar-doosri-baar/ET00517731', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const bookBtn = page.locator('button:has-text("Book tickets")').first();
  await bookBtn.click();
  await page.waitForTimeout(2000);

  const modalContent = await page.evaluate(() => {
    const modals = Array.from(document.querySelectorAll('div[role="dialog"], div[class*="modal"], div[class*="sc-"]')).filter(el => {
      const t = el.innerText || '';
      return t.includes('2D') || t.includes('Select') || t.includes('Language') || t.includes('Hindi');
    });
    return modals.map(m => m.innerText.slice(0, 300)).slice(0, 5);
  });
  console.log('Modal Content:', modalContent);

  // Check all clickable items inside dialog
  const dialogButtons = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="dialog"] button, div[role="dialog"] div[role="button"], div[role="dialog"] li, div[class*="modal"] span, div[class*="modal"] div'));
    return items.map(b => b.innerText ? b.innerText.trim() : '').filter(t => t.length > 0 && t.length < 50).slice(0, 20);
  });
  console.log('Dialog Buttons:', dialogButtons);

  await browser.close();
})();
