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

  // Find all showtime buttons
  const showtimeBtns = page.locator('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]');
  const count = await showtimeBtns.count();
  console.log(`Found ${count} showtime buttons`);

  if (count > 0) {
    const firstBtn = showtimeBtns.first();
    const label = await firstBtn.getAttribute('aria-label');
    console.log(`Clicking first showtime button: ${label}`);
    
    // Scroll into view first
    await firstBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await firstBtn.click();
    console.log('Clicked first button.');

    // Wait and check what changes in the DOM
    await page.waitForTimeout(3000);
    console.log('Current URL:', page.url());

    // Check for seat layout or modal or terms
    const visibleTexts = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div, button, section')).filter(el => {
        const text = el.innerText || '';
        return text.includes('Terms & Conditions') || text.includes('Accept') || text.includes('How many seats') || text.includes('Select Seats') || text.includes('All conversation') || text.includes('Rs.');
      });
      return elements.map(el => el.innerText.substring(0, 100)).slice(0, 5);
    });
    console.log('Visible relevant texts:', visibleTexts);

    // Take a screenshot of the state
    await page.screenshot({ path: 'scratch/after_showtime_click.png' });
    console.log('Saved screenshot to scratch/after_showtime_click.png');
  }

  await browser.close();
})();
