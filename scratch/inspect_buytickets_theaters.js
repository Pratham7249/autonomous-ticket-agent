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

  const url = 'https://in.bookmyshow.com/movies/pune/pehla-pyaar-doosri-baar/buytickets/ET00517731/20261026?etCodes=ET00517731&language=hindi&refEventCode=ET00517731';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const theatersWithPills = await page.evaluate(() => {
    const list = [];
    const cinemaLinks = Array.from(document.querySelectorAll('a[href*="/cinemas/"]'));
    cinemaLinks.forEach(link => {
      const theaterName = link.innerText ? link.innerText.trim() : '';
      if (!theaterName) return;

      let card = link.parentElement;
      for (let i = 0; i < 8; i++) {
        if (!card || !card.parentElement) break;
        if (card.querySelector('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]')) break;
        card = card.parentElement;
      }
      if (!card) return;

      const pills = Array.from(card.querySelectorAll('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]'));
      list.push({
        theaterName,
        pillCount: pills.length,
        times: pills.map(p => p.getAttribute('aria-label'))
      });
    });
    return list;
  });

  console.log('Theaters and their showtime pills:');
  theatersWithPills.forEach(t => {
    console.log(`- ${t.theaterName} (${t.pillCount} shows): ${t.times.join(', ')}`);
  });

  await browser.close();
})();
