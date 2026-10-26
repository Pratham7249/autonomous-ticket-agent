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
  console.log('Navigating to showtimes URL...');
  await page.goto(showtimesUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Extract all theater showtimes
  const extracted = await page.evaluate(() => {
    // Find all cinema items
    const cinemaLinks = Array.from(document.querySelectorAll('a[href*="/cinemas/"]'));
    const results = [];

    cinemaLinks.forEach(link => {
      const theaterName = link.innerText ? link.innerText.trim() : '';
      if (!theaterName) return;

      // Find the parent row/card containing this cinema
      let card = link.parentElement;
      for (let i = 0; i < 8; i++) {
        if (!card || !card.parentElement) break;
        if (card.querySelector('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]')) {
          break;
        }
        card = card.parentElement;
      }

      if (!card) return;

      const pills = Array.from(card.querySelectorAll('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]'));
      const showtimes = [];

      pills.forEach(pill => {
        const aria = pill.getAttribute('aria-label') || '';
        const timeMatch = aria.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
        const time = timeMatch ? timeMatch[1] : aria;

        // Check availability status based on styles
        let status = 'Available';
        const style = window.getComputedStyle(pill);
        const borderColor = style.borderColor;
        const color = style.color;

        if (borderColor.includes('241, 177, 3') || borderColor.includes('orange') || borderColor.includes('yellow')) {
          status = 'Fast Filling';
        } else if (borderColor.includes('31, 173, 62') || borderColor.includes('green')) {
          status = 'Available';
        } else if (style.opacity < 0.7 || borderColor.includes('150') || borderColor.includes('200')) {
          status = 'Almost Full / Sold Out';
        }

        showtimes.push({
          time,
          label: aria,
          status,
          borderColor
        });
      });

      if (showtimes.length > 0) {
        results.push({
          theaterName,
          showtimesCount: showtimes.length,
          showtimes
        });
      }
    });

    return results;
  });

  console.log(`Extracted ${extracted.length} theaters!`);
  console.log('Sample data:', JSON.stringify(extracted.slice(0, 3), null, 2));

  await browser.close();
})();
