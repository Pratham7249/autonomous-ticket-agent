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
  await page.goto('https://in.bookmyshow.com/movies/pune/pehla-pyaar-doosri-baar/ET00517731', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  console.log('Clicking Book tickets button...');
  const btn = page.locator('button[data-phase="postRelease"]').first();
  await btn.click();
  await page.waitForTimeout(3000);

  console.log('URL after click:', page.url());
  const bodySnippet = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Body snippet:', bodySnippet);

  // If format modal appeared
  const modalText = await page.evaluate(() => {
    const m = document.querySelector('div[class*="modal"], div[role="dialog"]');
    return m ? m.innerText : 'No modal found';
  });
  console.log('Modal text:', modalText);

  await page.screenshot({ path: 'scratch/after_btn_click.png' });
  await browser.close();
})();
