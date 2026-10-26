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

  const theaterRows = await page.evaluate(() => {
    // Each cinema link
    const links = Array.from(document.querySelectorAll('a[href*="/cinemas/"]'));
    return links.map(link => {
      // Find the row element
      let el = link;
      while (el && el.tagName !== 'LI' && !el.classList.contains('list') && el.parentElement && el.parentElement.tagName !== 'UL') {
        el = el.parentElement;
      }
      const container = el || link.parentElement;
      const pills = Array.from(container.querySelectorAll('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]')).map(p => p.getAttribute('aria-label'));
      return {
        theater: link.innerText.trim(),
        containerTag: container.tagName,
        containerClass: container.className,
        pills
      };
    });
  });

  console.log('Theater Rows:', JSON.stringify(theaterRows, null, 2));

  await browser.close();
})();
