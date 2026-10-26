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
  console.log('Navigating to BookMyShow Pune home...');
  await page.goto('https://in.bookmyshow.com/explore/home/pune', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);

  const title = await page.title();
  console.log('Page Title:', title);

  const movies = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div, a')).filter(el => {
      const h = el.getAttribute('href') || '';
      return h.includes('/movies/') || h.includes('/pune/movies/');
    });
    return cards.map(c => ({
      text: (c.innerText || '').split('\n').filter(Boolean).slice(0, 3).join(' | '),
      href: c.href || c.getAttribute('href')
    })).filter(c => c.text.length > 2).slice(0, 10);
  });
  console.log('Found movies on home/pune:', JSON.stringify(movies, null, 2));

  // Also check cinemas in Pune
  console.log('Navigating to BookMyShow Pune cinemas...');
  await page.goto('https://in.bookmyshow.com/explore/cinemas-pune', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  const wakadCinemas = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/cinemas/"]'));
    return links
      .map(l => ({ name: (l.innerText || '').trim(), href: l.href }))
      .filter(c => c.name.toLowerCase().includes('wakad') || c.name.toLowerCase().includes('phoenix') || c.name.toLowerCase().includes('millennium') || c.name.toLowerCase().includes('hinjawadi') || c.name.toLowerCase().includes('chinchwad'));
  });

  console.log('Wakad / nearby cinemas:', JSON.stringify(wakadCinemas, null, 2));
  await browser.close();
})();
