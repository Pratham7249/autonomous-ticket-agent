const { chromium } = require('playwright-core');
const fs = require('fs');

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
  try {
    const url = 'https://www.redbus.in/bus-tickets/pune-to-nagpur?fromCityName=Pune&toCityName=Nagpur&fromCityId=130&toCityId=624&onward=27-Oct-2026';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(3000);

    // Click "Tomorrow" date pill if present
    const tomorrowBtn = page.locator('button:has-text("Tomorrow")').first();
    if (await tomorrowBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tomorrowBtn.click();
      await page.waitForTimeout(3000);
    }

    // View seats
    const viewSeatsBtn = page.locator('button:has-text("View seats"), div[class*="tupleWrapper"] button').first();
    await viewSeatsBtn.waitFor({ state: 'visible', timeout: 20000 });
    await viewSeatsBtn.click();
    await page.waitForTimeout(3000);

    // Select available seat
    const seat = page.locator('span[aria-label*="availability available"]').first();
    await seat.waitFor({ state: 'visible', timeout: 10000 });
    await seat.click();
    await page.waitForTimeout(2000);

    // Click bottom red button
    const redBtn = page.locator('button, div[role="button"], a, div').filter({ hasText: /^Select boarding & dropping points$/i }).last();
    await redBtn.waitFor({ state: 'visible', timeout: 10000 });
    await redBtn.click({ force: true });
    await page.waitForTimeout(3000);

    // Now on Board/Drop point screen:
    // Dump all radios or buttons under Boarding/Dropping
    const boardDropDom = await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('input[type="radio"], li, div[class*="point"]'));
      return radios.map(r => ({
        tag: r.tagName,
        type: r.type,
        text: (r.innerText || r.value || '').substring(0, 50),
        className: r.className
      })).slice(0, 10);
    });
    console.log('Board/Drop elements:', JSON.stringify(boardDropDom, null, 2));

    // Click first available dropping point radio
    await page.evaluate(() => {
      const dropRadios = Array.from(document.querySelectorAll('input[type="radio"]'));
      if (dropRadios.length > 1) {
        dropRadios[dropRadios.length - 1].click();
      } else {
        // Find text Samruddhi or Chhatrapati
        const all = Array.from(document.querySelectorAll('*'));
        const el = all.find(e => (e.innerText || '').includes('Chhatrapati') || (e.innerText || '').includes('Samruddhi'));
        if (el) el.click();
      }
    });
    await page.waitForTimeout(2000);

    // Look for button to proceed to Passenger Info
    const buttonsAfterDrop = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"], span')).filter(b => {
        const t = (b.innerText || '').trim();
        return t.length > 2 && t.length < 50;
      });
      return btns.map(b => ({ tag: b.tagName, text: b.innerText, class: b.className }));
    });
    console.log('Buttons after drop point selected:', JSON.stringify(buttonsAfterDrop.slice(-8), null, 2));

    // Click the proceed button or tab
    await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      const btn = all.reverse().find(el => {
        const t = (el.innerText || '').toLowerCase().trim();
        return t === 'continue' || t.includes('continue to') || t === 'proceed to book' || t === 'passenger info';
      });
      if (btn) btn.click();
    });
    await page.waitForTimeout(3000);

    // Now inspect all INPUT elements on the page (Passenger Info)
    const inputsInfo = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      return inputs.map(i => ({
        tagName: i.tagName,
        type: i.type,
        name: i.name,
        id: i.id,
        placeholder: i.placeholder,
        value: i.value,
        ariaLabel: i.getAttribute('aria-label'),
        parentText: i.parentElement ? i.parentElement.innerText.substring(0, 60) : ''
      }));
    });
    console.log('--- ALL INPUTS ON PASSENGER SCREEN ---');
    console.log(JSON.stringify(inputsInfo, null, 2));

  } catch (err) {
    console.error('Inspect error:', err);
  } finally {
    await browser.close();
  }
})();
