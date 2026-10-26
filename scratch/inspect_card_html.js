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

  const bookBtn = page.locator('button:has-text("Book tickets")').first();
  await bookBtn.click();
  await page.waitForTimeout(2500);

  const formatBtn = page.locator('div[class*="sc-a1lh1q"]:has-text("2D")').first();
  if (await formatBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await formatBtn.click();
    await page.waitForTimeout(3000);
  }

  // Look for any elements with AM or PM or time in the theater list
  const sampleCard = await page.evaluate(() => {
    const link = document.querySelector('a[href*="/cinemas/"]');
    if (!link) return 'No cinema link';
    let card = link.parentElement;
    for (let i = 0; i < 6; i++) {
      if (card.parentElement && card.parentElement.children.length > 2) {
        card = card.parentElement;
      }
    }
    return {
      outerHTML: card.outerHTML.slice(0, 2000),
      allTexts: Array.from(card.querySelectorAll('*')).map(el => el.innerText).filter(t => t && (t.includes('AM') || t.includes('PM') || /\d{1,2}:\d{2}/.test(t))).slice(0, 10)
    };
  });

  console.log('Sample Card HTML & Times:', JSON.stringify(sampleCard, null, 2));

  await browser.close();
})();
