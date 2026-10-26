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
  console.log('Navigating to BookMyShow Pune...');
  await page.goto('https://in.bookmyshow.com/explore/home/pune', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const movies = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('a[href*="/pune/movies/"]'));
    return cards.map(c => {
      const text = c.innerText ? c.innerText.trim() : '';
      return {
        text: text.substring(0, 100),
        href: c.href
      };
    }).filter(m => m.text.length > 2).slice(0, 8);
  });
  console.log('Found Movies:', JSON.stringify(movies, null, 2));

  // Check search bar
  const searchPlaceholder = await page.evaluate(() => {
    const searchInputs = Array.from(document.querySelectorAll('input, button, span, div')).filter(el => {
      const text = el.innerText || el.placeholder || '';
      return text.includes('Search for Movies') || text.includes('Search');
    });
    return searchInputs.map(el => ({
      tagName: el.tagName,
      className: el.className,
      id: el.id,
      placeholder: el.placeholder,
      text: el.innerText
    })).slice(0, 5);
  });
  console.log('Search candidates:', JSON.stringify(searchPlaceholder, null, 2));

  await browser.close();
})();
