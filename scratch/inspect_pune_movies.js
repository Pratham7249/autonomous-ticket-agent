const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars'
    ]
  });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  console.log('Navigating to Ramayana movie page in Pune...');
  await page.goto('https://in.bookmyshow.com/movies/pune/namit-malhotras-ramayana/ET00451914', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  const pageInfo = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"], a')).map(b => b.innerText ? b.innerText.trim() : '').filter(Boolean);
    return {
      title: document.title,
      buttons: buttons.slice(0, 20)
    };
  });

  console.log('Page info:', JSON.stringify(pageInfo, null, 2));

  // Also check Pehla Pyaar Doosri Baar or Udta Teer
  console.log('Navigating to Pehla Pyaar Doosri Baar in Pune...');
  await page.goto('https://in.bookmyshow.com/movies/pune/pehla-pyaar-doosri-baar/ET00517731', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  const p2Info = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"], a')).map(b => b.innerText ? b.innerText.trim() : '').filter(Boolean);
    return {
      title: document.title,
      buttons: buttons.slice(0, 20)
    };
  });
  console.log('Pehla Pyaar Info:', JSON.stringify(p2Info, null, 2));

  await browser.close();
})();
