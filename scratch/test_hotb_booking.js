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

  // Test across multiple cities if needed
  for (const city of ['mumbai', 'pune', 'national-capital-region-ncr', 'bengaluru']) {
    console.log(`\n--- Testing City: ${city} ---`);
    await page.goto(`https://in.bookmyshow.com/explore/home/${city}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Now visit the movie URL directly with city
    await page.goto(`https://in.bookmyshow.com/movies/${city}/heart-of-the-beast/ET00504928`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const bookBtn = await page.$('button:has-text("Book tickets"), button:has-text("Book Tickets")');
    console.log(`In ${city}, Book tickets button found:`, !!bookBtn);
    if (bookBtn) {
      const text = await bookBtn.innerText();
      console.log(`Button text: "${text}"`);
      await bookBtn.click();
      await page.waitForTimeout(3000);
      console.log(`After click, URL: ${page.url()}`);
      break;
    } else {
      // Check if button is "Interested" or something else
      const btns = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
      });
      console.log(`Buttons on page in ${city}:`, btns.slice(0, 10));
    }
  }

  await browser.close();
})();
