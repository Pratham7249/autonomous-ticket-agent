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
  await page.goto('https://in.bookmyshow.com/explore/cinemas-pune', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);

  const allTheaters = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/cinemas/"]'));
    return links.map(l => ({ name: l.innerText.trim(), href: l.href })).filter(c => c.name.length > 0);
  });
  console.log(`Total Pune Cinemas: ${allTheaters.length}`);
  const wakadMatches = allTheaters.filter(c => 
    c.name.toLowerCase().includes('wakad') || 
    c.name.toLowerCase().includes('phoenix') || 
    c.name.toLowerCase().includes('chinchwad') ||
    c.name.toLowerCase().includes('pimpri') ||
    c.name.toLowerCase().includes('hinjawadi')
  );
  console.log('Wakad / West Pune Cinemas:', JSON.stringify(wakadMatches, null, 2));

  await browser.close();
})();
