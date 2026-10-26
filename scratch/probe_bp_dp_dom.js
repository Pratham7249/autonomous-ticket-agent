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

  console.log('Navigating to RedBus Pune to Nagpur...');
  await page.goto('https://www.redbus.in/bus-tickets/pune-to-nagpur?fromCityId=130&fromCityName=Pune&toCityId=624&toCityName=Nagpur&onward=25-Oct-2026&doj=25-Oct-2026&ref=search', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  // Click Tomorrow pill if present
  const tomorrowBtn = page.locator('button:has-text("Tomorrow")').first();
  if (await tomorrowBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await tomorrowBtn.click();
    await page.waitForTimeout(3000);
  }

  // Click View seats
  console.log('Clicking View seats...');
  const viewSeatsBtn = page.locator('button:has-text("View seats"), button[class*="viewSeatsBtn"]').first();
  await viewSeatsBtn.click({ force: true });
  await page.waitForTimeout(3000);

  // Select 1 berth
  console.log('Selecting seat...');
  const seat = page.locator('span[aria-label*="availability available"], span[class*="sleeper"]:has-text("₹")').first();
  await seat.click({ force: true });
  await page.waitForTimeout(1000);

  // Click red button
  console.log('Clicking red button...');
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const btn = all.reverse().find(el => (el.innerText || '').trim() === 'Select boarding & dropping points' && el.children.length === 0);
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);

  // Now inspect the Boarding and Dropping points DOM!
  const inspection = await page.evaluate(() => {
    // 1. All radios
    const radios = Array.from(document.querySelectorAll('input[type="radio"]')).map(r => ({
      tag: r.tagName,
      name: r.name,
      id: r.id,
      value: r.value,
      checked: r.checked,
      parentText: (r.parentElement ? r.parentElement.innerText : '').slice(0, 50),
      grandParentText: (r.parentElement?.parentElement ? r.parentElement.parentElement.innerText : '').slice(0, 70),
      parentTag: r.parentElement?.tagName,
      grandParentTag: r.parentElement?.parentElement?.tagName
    }));

    // 2. Elements containing "Chhatrapati" or "ChinchBhavan" or "Samruddhi"
    const targets = Array.from(document.querySelectorAll('*')).filter(el => {
      const t = el.innerText || '';
      return (t.includes('ChinchBhavan') || t.includes('Chhatrapati') || t.includes('Samruddhi')) && t.length < 100;
    }).map(el => ({
      tag: el.tagName,
      className: el.className,
      role: el.getAttribute('role'),
      id: el.id,
      text: el.innerText.slice(0, 60),
      hasRadio: !!el.querySelector('input[type="radio"]'),
      childCount: el.children.length
    }));

    // 3. Check the right column "Dropping points"
    const dropCol = Array.from(document.querySelectorAll('div, section')).find(el => {
      const h = el.querySelector('h3, h4, h5, div, span');
      return (el.innerText || '').includes('Dropping points') && (el.innerText || '').includes('05:');
    });

    return {
      radiosCount: radios.length,
      radios,
      targets: targets.slice(0, 10),
      dropColSnippet: dropCol ? dropCol.innerHTML.slice(0, 500) : 'none'
    };
  });

  console.log('INSPECTION RESULT:\n', JSON.stringify(inspection, null, 2));

  await browser.close();
})();
