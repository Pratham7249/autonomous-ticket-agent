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

  // Inspect the venue blocks
  const venueBlocks = await page.evaluate(() => {
    // Find elements containing cinema link
    const cinemaLinks = Array.from(document.querySelectorAll('a[href*="/cinemas/"]'));
    return cinemaLinks.map(cinemaLink => {
      const cinemaName = cinemaLink.innerText ? cinemaLink.innerText.trim() : '';
      
      // Find the container enclosing this cinema and its showtimes
      let container = cinemaLink.parentElement;
      for (let i = 0; i < 6; i++) {
        if (!container || !container.parentElement) break;
        // Check if this container has showtime pills
        const pillMatches = container.innerText.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/g);
        if (pillMatches && pillMatches.length > 0) {
          break;
        }
        container = container.parentElement;
      }

      // Collect pills inside container
      const pillElements = container ? Array.from(container.querySelectorAll('*')).filter(el => {
        return el.children.length === 0 && el.innerText && el.innerText.trim().match(/^\d{1,2}:\d{2}\s*(?:AM|PM)$/i);
      }) : [];

      const times = pillElements.map(el => {
        // Find color or status style
        const color = window.getComputedStyle(el).color;
        const parentStyle = el.parentElement ? window.getComputedStyle(el.parentElement) : null;
        return {
          time: el.innerText.trim(),
          color: color,
          borderColor: parentStyle ? parentStyle.borderColor : ''
        };
      });

      return {
        cinemaName,
        timesCount: times.length,
        times: times.slice(0, 6)
      };
    }).slice(0, 5);
  });

  console.log('Venue blocks:', JSON.stringify(venueBlocks, null, 2));

  // Now let's test clicking the first showtime pill to see what popup/page appears!
  console.log('Testing clicking first showtime pill...');
  const firstPill = await page.$('div:has-text("09:00 AM"), a:has-text("09:00 AM")');
  if (firstPill) {
    await firstPill.click();
    await page.waitForTimeout(2000);

    // Look for popup/modal (terms, seat count, etc.)
    const popups = await page.evaluate(() => {
      const modals = Array.from(document.querySelectorAll('div[role="dialog"], .modal, div[class*="popup"], div[class*="overlay"], div[class*="terms"]'));
      return modals.map(m => m.innerText.substring(0, 200));
    });
    console.log('Popups detected:', popups);

    // Check if "Accept" button is visible
    const acceptBtn = await page.$('button:has-text("Accept"), div:has-text("Accept")');
    console.log('Accept button exists:', !!acceptBtn);
    if (acceptBtn) {
      await acceptBtn.click();
      await page.waitForTimeout(2000);
      console.log('Clicked Accept. Current URL:', page.url());
    }

    // Check seat count selector
    const seatNumbers = await page.evaluate(() => {
      const seats = Array.from(document.querySelectorAll('li, div, span')).filter(el => {
        return el.innerText && el.innerText.trim().match(/^[1-9]|10$/) && el.children.length === 0;
      });
      return seats.map(s => s.innerText.trim()).slice(0, 10);
    });
    console.log('Seat number elements:', seatNumbers);

    // Check "Select Seats" button
    const selectSeatsBtn = await page.$('button:has-text("Select Seats"), div:has-text("Select Seats")');
    console.log('Select Seats button exists:', !!selectSeatsBtn);
  }

  await browser.close();
})();
