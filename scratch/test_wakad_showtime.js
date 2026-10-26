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

  console.log('Navigating to movie showtimes in Pune...');
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

  // Find pill for INOX Elpro City Square, Chinchwad
  console.log('Finding showtime pill for Elpro City Square Chinchwad (Wakad area)...');
  const pill = await page.evaluateHandle(() => {
    const cinemaLinks = Array.from(document.querySelectorAll('a[href*="/cinemas/"]'));
    const link = cinemaLinks.find(l => l.innerText.toLowerCase().includes('elpro') || l.innerText.toLowerCase().includes('chinchwad'));
    if (!link) return null;
    let card = link.parentElement;
    for (let i = 0; i < 8; i++) {
      if (!card || !card.parentElement) break;
      if (card.querySelector('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]')) break;
      card = card.parentElement;
    }
    return card ? card.querySelector('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]') : null;
  });

  const pillEl = pill.asElement();
  if (pillEl) {
    console.log('Clicking Wakad-area showtime pill...');
    await pillEl.click();
    await page.waitForTimeout(3500);
    console.log('Current URL after showtime click:', page.url());

    // Check what appears on screen
    const dialogs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div[role="dialog"], div[class*="modal"], ul[id*="pop"], div[id*="pop"]'))
        .map(el => el.innerText.trim())
        .filter(Boolean);
    });
    console.log('Dialogs/Modals:', dialogs);

    await page.screenshot({ path: 'scratch/after_pill_click.png' });
    console.log('Saved screenshot scratch/after_pill_click.png');
  } else {
    console.log('Pill not found!');
  }

  await browser.close();
})();
