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
  
  const movieUrl = 'https://in.bookmyshow.com/movies/pune/the-vvaan-force-of-the-forrest/ET00444235';
  console.log('Navigating to movie URL:', movieUrl);
  await page.goto(movieUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Look for Book tickets button
  console.log('Finding Book tickets button...');
  const bookBtn = await page.$('button:has-text("Book tickets"), button:has-text("Book Tickets")');
  if (bookBtn) {
    console.log('Clicking Book tickets button...');
    await bookBtn.click();
    await page.waitForTimeout(2500);

    // Check if format modal popped up or redirected to buy tickets
    console.log('Current URL after Book tickets:', page.url());

    // Check format selection buttons (e.g. 2D, Hindi, etc.)
    const formatButtons = await page.$$('span:has-text("2D"), div:has-text("2D"), li:has-text("2D")');
    if (formatButtons.length > 0 && page.url().includes('/movies/')) {
      console.log('Format modal detected, clicking first 2D option...');
      await formatButtons[0].click();
      await page.waitForTimeout(3000);
      console.log('URL after format selection:', page.url());
    }

    // Now on showtimes page!
    // Check Date tabs
    const dateElements = await page.evaluate(() => {
      const dates = Array.from(document.querySelectorAll('a, li, div')).filter(el => {
        const text = el.innerText || '';
        return (text.includes('TODAY') || text.includes('TOM') || text.match(/\b\d{1,2}\s+[A-Z]{3}\b/)) && text.length < 30;
      });
      return dates.map(d => ({ text: d.innerText.replace(/\n/g, ' '), tag: d.tagName, className: d.className })).slice(0, 10);
    });
    console.log('Date tabs found:', dateElements);

    // Check Theaters and Showtimes
    const venueData = await page.evaluate(() => {
      // Find venue/cinema items
      const venues = [];
      const venueHeaders = Array.from(document.querySelectorAll('a[href*="/cinemas/"], .venue-info, .name, [data-sub-venue-name]'));
      
      return venueHeaders.map(v => ({
        name: v.innerText ? v.innerText.trim() : '',
        href: v.href || '',
        parentText: v.closest('li, .listing-info, .venue-container')?.innerText.substring(0, 200) || ''
      })).filter(v => v.name).slice(0, 5);
    });
    console.log('Venues sample:', JSON.stringify(venueData, null, 2));
  } else {
    console.log('Book tickets button not found directly. Checking page text...');
  }

  await browser.close();
})();
