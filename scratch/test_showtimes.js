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
  console.log('Navigating to showtimes URL for Tomorrow (SUN 27 SEP)...');
  await page.goto(showtimesUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Inspect venue listings container and showtimes
  const showtimesData = await page.evaluate(() => {
    // Find all cinema items
    const venues = [];
    const cinemaElements = Array.from(document.querySelectorAll('li, div')).filter(el => {
      return el.querySelector('a[href*="/cinemas/"]') && el.querySelector('button, .showtime-pill, a[data-session-id], [data-online]');
    });

    // Let's also look for all showtime pills/buttons
    const pills = Array.from(document.querySelectorAll('a[data-session-id], button, div')).filter(el => {
      const text = el.innerText || '';
      return text.match(/^\s*\d{1,2}:\d{2}\s*(?:AM|PM)\s*$/i);
    });

    return {
      pillsCount: pills.length,
      samplePills: pills.slice(0, 8).map(p => {
        let parent = p.closest('li') || p.parentElement?.parentElement;
        let cinema = parent ? (parent.querySelector('a[href*="/cinemas/"]')?.innerText || '') : '';
        return {
          time: p.innerText.trim(),
          cinema: cinema,
          className: p.className,
          tag: p.tagName,
          dataset: Object.assign({}, p.dataset),
          parentText: p.parentElement?.innerText?.substring(0, 100)
        };
      })
    };
  });

  console.log('Showtime pills info:', JSON.stringify(showtimesData, null, 2));

  // Let's test hovering over the first showtime pill to check tooltip/price info
  const firstPill = await page.$('a[data-session-id], a:has-text("AM"), a:has-text("PM"), button:has-text("AM"), button:has-text("PM")');
  if (firstPill) {
    console.log('Hovering over first showtime pill...');
    await firstPill.hover();
    await page.waitForTimeout(1000);

    const tooltipInfo = await page.evaluate(() => {
      const tooltips = Array.from(document.querySelectorAll('.tooltip, [role="tooltip"], div[class*="price"], div[class*="popup"], div[class*="category"]')).filter(el => {
        return el.innerText && el.innerText.match(/Rs|INR|₹|\d{2,4}/);
      });
      return tooltips.map(t => t.innerText.substring(0, 200));
    });
    console.log('Hover tooltip info:', tooltipInfo);
  }

  await browser.close();
})();
