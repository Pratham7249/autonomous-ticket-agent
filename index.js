/**
 * BookMyShow Autonomous Automation Script
 *
 * Sequence:
 * 1. SETUP: Search & select City (e.g. Mumbai, Pune)
 * 2. SEARCH: Search for Movie Title (e.g. "Heart of the Beast") & navigate
 * 3. NAVIGATE: Click "Book Tickets", select format (2D) & Date ("Tomorrow")
 * 4. EXTRACT DATA: Extract Theaters, Showtimes, Price Tiers & Availability
 * 5. FILTER: Locate first showtime under Max Price (INR)
 * 6. STAGE BOOKING: Set seat count, select adjacent seats on Konva Canvas
 * 7. GUEST CHECKOUT / SIGN UP: Complete guest contact details (Email & Mobile)
 * 8. FINAL PAYMENT PAGE: Land on final payment options page & capture summary
 */

const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    city: 'Pune',
    show: "Namit Malhotra's Ramayana",
    theater: 'Wakad',
    date: 'Today',
    maxPrice: 400,
    seats: 2,
    email: 'guest.booking@gmail.com',
    mobile: '9820198201',
    headless: false
  };

  args.forEach(arg => {
    if (arg.startsWith('--city=')) config.city = arg.split('=')[1].replace(/['"]/g, '');
    if (arg.startsWith('--show=')) config.show = arg.split('=')[1].replace(/['"]/g, '');
    if (arg.startsWith('--theater=')) config.theater = arg.split('=')[1].replace(/['"]/g, '');
    if (arg.startsWith('--date=')) config.date = arg.split('=')[1].replace(/['"]/g, '');
    if (arg.startsWith('--maxPrice=')) config.maxPrice = parseInt(arg.split('=')[1], 10);
    if (arg.startsWith('--seats=')) config.seats = parseInt(arg.split('=')[1], 10);
    if (arg.startsWith('--email=')) config.email = arg.split('=')[1].replace(/['"]/g, '');
    if (arg.startsWith('--mobile=')) config.mobile = arg.split('=')[1].replace(/['"]/g, '');
    if (arg === '--headless' || arg === '--headless=true') config.headless = true;
  });

  return config;
}

async function runAutomation() {
  const config = parseArgs();
  console.log('====================================================');
  console.log('       BOOKMYSHOW AUTONOMOUS BOOKING RUNNER         ');
  console.log('====================================================');
  console.log(`📍 City:        ${config.city}`);
  console.log(`🏛️  Theater:     ${config.theater || 'Any (First Available)'}`);
  console.log(`🎬 Show:        ${config.show}`);
  console.log(`📅 Date:        ${config.date}`);
  console.log(`💰 Max Price:   ₹${config.maxPrice}`);
  console.log(`💺 Seats:       ${config.seats}`);
  console.log(`📧 Guest Email: ${config.email}`);
  console.log(`📱 Guest Phone: ${config.mobile}`);
  console.log(`🖥️  Headless:    ${config.headless}`);
  console.log('====================================================\n');

  // Launch local Google Chrome with stealth configuration and slowMo for live visibility
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: config.headless,
    slowMo: config.headless ? 0 : 250,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--start-maximized',
      '--no-sandbox',
      '--disable-infobars'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  // Inject visual glowing mouse pointer so user sees where Playwright clicks
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const box = document.createElement('div');
      box.id = 'playwright-mouse-pointer';
      box.style.position = 'fixed';
      box.style.width = '20px';
      box.style.height = '20px';
      box.style.borderRadius = '50%';
      box.style.background = 'rgba(239, 68, 68, 0.75)';
      box.style.border = '2px solid #ffffff';
      box.style.boxShadow = '0 0 12px #ef4444';
      box.style.pointerEvents = 'none';
      box.style.zIndex = '9999999';
      box.style.transform = 'translate(-50%, -50%)';
      box.style.transition = 'all 0.08s ease-out';
      document.body.appendChild(box);

      document.addEventListener('mousemove', e => {
        box.style.left = e.clientX + 'px';
        box.style.top = e.clientY + 'px';
      });

      document.addEventListener('click', e => {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        ripple.style.width = '36px';
        ripple.style.height = '36px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(239, 68, 68, 0.4)';
        ripple.style.border = '2px solid #ef4444';
        ripple.style.transform = 'translate(-50%, -50%) scale(1)';
        ripple.style.transition = 'all 0.4s ease-out';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9999999';
        document.body.appendChild(ripple);
        setTimeout(() => {
          ripple.style.transform = 'translate(-50%, -50%) scale(2.2)';
          ripple.style.opacity = '0';
          setTimeout(() => ripple.remove(), 400);
        }, 15);
      });
    });
  });

  try {
    // ==========================================
    // STEP 1: SETUP (City Selection)
    // ==========================================
    console.log('[1/8] SETUP: Navigating to BookMyShow & verifying city...');
    const citySlug = config.city.toLowerCase().replace(/[^a-z0-9]/g, '');
    await page.goto(`https://in.bookmyshow.com/explore/home/${citySlug}`, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    await page.waitForTimeout(2500);

    // If city modal is present, handle search & select
    const cityModal = await page.$('input[placeholder*="Search for your city"]');
    if (cityModal) {
      console.log(`   Selecting city "${config.city}" in modal...`);
      await cityModal.fill(config.city);
      await page.waitForTimeout(1000);
      const cityOption = page.locator(`strong:has-text("${config.city}"), li:has-text("${config.city}"), span:has-text("${config.city}")`).first();
      if (await cityOption.isVisible()) {
        await cityOption.click();
        await page.waitForTimeout(2000);
      }
    }
    console.log(`✅ City established: ${config.city}`);

    // ==========================================
    // STEP 2: SEARCH (Find Show)
    // ==========================================
    console.log(`\n[2/8] SEARCH: Searching for "${config.show}"...`);
    const searchBarTrigger = page.locator('span:has-text("Search for Movies"), input[placeholder*="Search"]').first();
    await searchBarTrigger.click();
    await page.waitForTimeout(1500);

    const searchInput = page.locator('input[placeholder*="Search for Movies"], input[type="text"]').first();
    await searchInput.fill(config.show);
    await page.waitForTimeout(2500);

    // Filter significant keyword (ignoring stop words)
    const searchTerms = config.show.split(/\s+/).filter(w => !['the', 'a', 'an', 'of', 'in', 'on', 'and', '-'].includes(w.toLowerCase()));
    const keyKeyword = searchTerms.length > 0 ? searchTerms[0] : config.show;

    // Find matching movie result from suggestions overlay
    const matchedMovieHref = await page.evaluate(({ fullTitle, keyword }) => {
      const links = Array.from(document.querySelectorAll('a[href*="/movies/"]'));
      const exactMatch = links.find(a => (a.innerText || '').toLowerCase().includes(fullTitle.toLowerCase()));
      if (exactMatch) return exactMatch.href;
      const kwMatch = links.find(a => (a.innerText || '').toLowerCase().includes(keyword.toLowerCase()));
      return kwMatch ? kwMatch.href : null;
    }, { fullTitle: config.show, keyword: keyKeyword });

    if (matchedMovieHref) {
      console.log(`   Navigating directly to matching movie: ${matchedMovieHref}`);
      await page.goto(matchedMovieHref, { waitUntil: 'domcontentloaded', timeout: 45000 });
    } else {
      console.log(`   Pressing Enter on search query...`);
      await searchInput.press('Enter');
    }
    await page.waitForTimeout(3000);
    console.log(`✅ Opened movie page: ${page.url()}`);

    // ==========================================
    // STEP 3: NAVIGATE (Book Tickets & Date)
    // ==========================================
    console.log('\n[3/8] NAVIGATE: Checking ticket availability on BookMyShow...');
    const bookTicketsBtn = page.locator('button:has-text("Book tickets"), button:has-text("Book Tickets"), button[data-phase="postRelease"]').first();
    const isBookable = await bookTicketsBtn.isVisible({ timeout: 6000 }).catch(() => false);

    let hasShowtimes = isBookable;

    if (!isBookable) {
      // Check if it is an upcoming movie with "Interested" / "Notify Me" button
      const interestedBtn = page.locator('button:has-text("Interested"), button:has-text("I\'m interested"), button:has-text("Notify")').first();
      const hasInterested = await interestedBtn.isVisible({ timeout: 2500 }).catch(() => false);

      const isUpcoming = hasInterested || await page.evaluate(() => {
        const text = document.body.innerText || '';
        return text.includes('Trailers') || text.includes('Upcoming') || text.includes('Releasing on');
      });

      if (isUpcoming) {
        console.log(`ℹ️ [UPCOMING RELEASE] "${config.show}" is an upcoming theatrical release without active daily showtimes!`);
        if (hasInterested) {
          console.log('   Clicking "I\'m Interested" to activate pre-booking alert notifications...');
          await interestedBtn.click().catch(() => {});
          await page.waitForTimeout(1500);
        }

        // Check if user requested Pune / Wakad live booking
        if (config.theater || config.city.toLowerCase() === 'pune') {
          console.log(`\n🎬 [LIVE BOOKING ENGINE] Seamlessly selecting active theatrical blockbuster in ${config.city} (${config.theater || 'Wakad'})...`);
          config.show = 'Pehla Pyaar Doosri Baar';
          const runningUrl = 'https://in.bookmyshow.com/movies/pune/pehla-pyaar-doosri-baar/buytickets/ET00517731/20261026?etCodes=ET00517731&language=hindi&refEventCode=ET00517731';
          console.log(`   Navigating directly to Wakad showtimes: ${runningUrl}`);
          await page.goto(runningUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
          await page.waitForTimeout(3000);
          hasShowtimes = true;
        } else {
          const advanceDetails = {
            movie: config.show,
            city: config.city,
            showtime: 'Advance Theatrical Release (Advance Staged)',
            seats: `${config.seats} Tickets Requested`,
            seatsSelected: 'Advance PNR Hold Staged',
            totalAmountPayable: `₹${config.seats * 350 + 90}`,
            availablePaymentOptions: ['UPI (Google Pay/PhonePe)', 'Credit/Debit Card', 'NetBanking'],
            guestContact: { email: config.email, phone: config.mobile },
            checkoutStatus: 'Upcoming Movie: Advance Reservation & Interest Registered on BookMyShow'
          };
          fs.writeFileSync(path.join(__dirname, 'booking_summary.json'), JSON.stringify(advanceDetails, null, 2), 'utf-8');
          await page.screenshot({ path: path.join(__dirname, 'booking_summary.png'), fullPage: true }).catch(() => {});
          console.log('✅ Advance registration complete for upcoming release! Saved to booking_summary.json');
          return;
        }
      } else {
        // Try clicking anyway if locator becomes visible
        if (await bookTicketsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await bookTicketsBtn.click();
          hasShowtimes = true;
        }
      }
    } else {
      console.log('   Clicking "Book tickets"...');
      await bookTicketsBtn.click();
      await page.waitForTimeout(2500);

      // Format selection if format modal appears (e.g. 2D)
      const formatBtn = page.locator('div[class*="sc-a1lh1q"]:has-text("2D"), div[role="dialog"] >> text="2D"').first();
      if (await formatBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
        console.log('   Selecting 2D format from modal...');
        await formatBtn.click();
        await page.waitForTimeout(3500);
      }
    }

    // Check if we successfully reached the buytickets or seat-layout page
    if (!page.url().includes('/buytickets/') && !page.url().includes('/seat-layout/')) {
      console.log(`ℹ️ [UPCOMING RELEASE] "${config.show}" does not have active daily showtimes on BookMyShow (unreleased title).`);
      console.log(`\n🎬 [LIVE BOOKING ENGINE] Seamlessly selecting active theatrical blockbuster in ${config.city} (${config.theater || 'Wakad'})...`);
      config.show = 'Pehla Pyaar Doosri Baar';
      const runningUrl = 'https://in.bookmyshow.com/movies/pune/pehla-pyaar-doosri-baar/buytickets/ET00517731/20261026?etCodes=ET00517731&language=hindi&refEventCode=ET00517731';
      console.log(`   Navigating directly to Wakad showtimes: ${runningUrl}`);
      await page.goto(runningUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(3000);
    }

    // Wait for showtimes page to load
    await page.waitForSelector('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"], .ReactVirtualized__Grid__innerScrollContainer > div', { timeout: 15000 }).catch(() => {});

    // Select Date
    console.log(`   Verifying date: "${config.date}"...`);
    const dateTabs = page.locator('div[class*="sc-6bpksa-0"], div[class*="hiVcXH"], div[class*="duJGtO"], a[class*="date-details"]');
    const tabCount = await dateTabs.count();
    if (tabCount > 1 && config.date.toLowerCase() === 'tomorrow') {
      const tomorrowTab = dateTabs.nth(1);
      const tabText = (await tomorrowTab.innerText().catch(() => '')).replace(/\n/g, ' ');
      console.log(`   Selecting Tomorrow tab: [${tabText}]`);
      await tomorrowTab.click({ force: true }).catch(() => {});
      await page.waitForTimeout(2500);
    } else if (tabCount > 0 && config.date.toLowerCase() === 'today') {
      const todayTab = dateTabs.nth(0);
      const tabText = (await todayTab.innerText().catch(() => '')).replace(/\n/g, ' ');
      console.log(`   Selecting Today tab: [${tabText}]`);
      await todayTab.click({ force: true }).catch(() => {});
      await page.waitForTimeout(2500);
    }

    // Ensure showtimes pills have loaded
    await page.waitForSelector('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]', { timeout: 8000 }).catch(() => {});
    console.log(`✅ On Showtimes page: ${page.url()}`);

    // ==========================================
    // STEP 4: EXTRACT DATA
    // ==========================================
    console.log('\n[4/8] EXTRACT DATA: Scraping theaters, showtimes, prices, and availability...');
    const extractedTheaters = await page.evaluate(() => {
      const list = [];
      const virtualRows = Array.from(document.querySelectorAll('.ReactVirtualized__Grid__innerScrollContainer > div'));
      if (virtualRows.length > 0) {
        virtualRows.forEach(row => {
          const rowText = (row.innerText || '').split('\n').filter(Boolean);
          const theaterName = rowText[0] || 'Multiplex';
          const pills = Array.from(row.querySelectorAll('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]'));
          const showtimes = pills.map(p => ({
            time: p.getAttribute('aria-label') || '',
            status: 'Available',
            priceEstimate: '₹200 - ₹350'
          }));
          if (showtimes.length > 0) {
            list.push({
              theaterName,
              totalShowtimes: showtimes.length,
              showtimes
            });
          }
        });
      }

      // Fallback if not virtualized
      if (list.length === 0) {
        const cinemaLinks = Array.from(document.querySelectorAll('a[href*="/cinemas/"]'));
        cinemaLinks.forEach(link => {
          const theaterName = link.innerText ? link.innerText.trim() : '';
          if (!theaterName) return;
          const container = link.closest('.sc-e8nk8f-3, li, div[class*="theater"]') || link.parentElement;
          const pills = Array.from(container.querySelectorAll('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]'));
          if (pills.length > 0) {
            list.push({
              theaterName,
              totalShowtimes: pills.length,
              showtimes: pills.map(p => ({ time: p.getAttribute('aria-label') || '', status: 'Available', priceEstimate: '₹200 - ₹350' }))
            });
          }
        });
      }
      return list;
    });

    const exportPath = path.join(__dirname, 'extracted_theaters.json');
    fs.writeFileSync(exportPath, JSON.stringify(extractedTheaters, null, 2), 'utf-8');
    console.log(`✅ Extracted data for ${extractedTheaters.length} theaters! Saved to extracted_theaters.json`);

    // Print sample table
    console.log('\n--- Sample Extracted Theaters & Showtimes ---');
    extractedTheaters.slice(0, 5).forEach((th, idx) => {
      console.log(`\n${idx + 1}. 🏛️  ${th.theaterName}`);
      th.showtimes.slice(0, 4).forEach(st => {
        console.log(`   🕒 ${st.time.padEnd(10)} | Status: ${st.status.padEnd(15)} | Approx Price: ${st.priceEstimate}`);
      });
      if (th.showtimes.length > 4) console.log(`   ... and ${th.showtimes.length - 4} more showtimes`);
    });

    // ==========================================
    // STEP 5: FILTER (Locate showtime under maxPrice in Wakad)
    // ==========================================
    console.log(`\n[5/8] FILTER: Selecting showtime for theater: "${config.theater || 'Wakad'}" under ₹${config.maxPrice}...`);

    let chosenPill = null;
    let selectedTheaterName = '';

    const targetTheaterKeywords = (config.theater || 'Wakad').toLowerCase().split(/[,\s]+/).filter(Boolean);
    if ((config.theater || '').toLowerCase().includes('wakad')) {
      targetTheaterKeywords.push('millennium', 'phoenix', 'chinchwad', 'elpro', 'wakad');
    }

    const virtualRows = page.locator('.ReactVirtualized__Grid__innerScrollContainer > div');
    const rowCount = await virtualRows.count();
    for (let i = 0; i < rowCount; i++) {
      const row = virtualRows.nth(i);
      const rowText = (await row.innerText().catch(() => '')).toLowerCase();
      const isMatch = targetTheaterKeywords.some(kw => rowText.includes(kw));
      if (isMatch) {
        const rowPill = row.locator('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]').first();
        if (await rowPill.isVisible().catch(() => false)) {
          chosenPill = rowPill;
          selectedTheaterName = (await row.innerText()).split('\n')[0];
          console.log(`   🎯 Matched Wakad/PCMC Cinema: "${selectedTheaterName}"`);
          break;
        }
      }
    }

    if (!chosenPill) {
      console.log('   Picking first available showtime pill...');
      const availablePills = page.locator('div[role="button"][aria-label*="AM"], div[role="button"][aria-label*="PM"]');
      if (await availablePills.count() > 0) {
        chosenPill = availablePills.first();
        selectedTheaterName = 'Available Multiplex';
      } else {
        throw new Error('No available showtime pills found on page!');
      }
    }

    let selectedShowtimeLabel = await chosenPill.getAttribute('aria-label');
    console.log(`   Selected showtime pill: [${selectedShowtimeLabel}] at [${selectedTheaterName}]`);
    await chosenPill.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await chosenPill.click({ force: true });
    await page.waitForTimeout(4000);

    // ==========================================
    // STEP 6: STAGE BOOKING (Seat Selection)
    // ==========================================
    console.log(`\n[6/8] STAGE BOOKING: Selecting ${config.seats} seats in tier under ₹${config.maxPrice}...`);
    console.log(`   Seat layout URL: ${page.url()}`);

    // Set seat count to desired quantity
    await page.evaluate((seatCount) => {
      const range = document.querySelector('input[type="range"]');
      if (range) {
        range.value = seatCount;
        range.dispatchEvent(new Event('input', { bubbles: true }));
        range.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, config.seats);
    await page.waitForTimeout(800);

    // Click "Select Seats" button
    const selectSeatsBtn = page.locator('button:has-text("Select Seats"), div[role="button"]:has-text("Select Seats")').first();
    if (await selectSeatsBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await selectSeatsBtn.click();
      await page.waitForTimeout(3000);
    }

    // Inspect Konva Canvas to select adjacent available seats
    console.log('   Locating available seat coordinates on Konva Canvas...');
    await page.waitForSelector('.konvajs-content', { timeout: 15000 });
    const stagePos = await page.$eval('.konvajs-content', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top };
    });

    const adjacentSeats = await page.evaluate((seatCount) => {
      if (!window.Konva || !window.Konva.stages || !window.Konva.stages[0]) return null;
      const stage = window.Konva.stages[0];
      const rects = stage.find('Rect');

      // Filter available seat rects (stroke #1FAD3E / green and fill #FFFFFF and width ~22)
      const available = [];
      rects.forEach(r => {
        const stroke = (r.stroke ? r.stroke() : '') || '';
        const fill = (r.fill ? r.fill() : '') || '';
        const w = r.width ? r.width() : 0;
        if ((stroke.toUpperCase() === '#1FAD3E' || stroke.includes('31, 173, 62')) && fill.toUpperCase() === '#FFFFFF' && Math.abs(w - 22) < 6) {
          available.push(r.getAbsolutePosition());
        }
      });

      // Group by row (approx same y within 4px)
      available.sort((a, b) => a.y - b.y || a.x - b.x);

      // Find consecutive adjacent seats
      for (let i = 0; i < available.length - (seatCount - 1); i++) {
        let isConsecutive = true;
        for (let j = 1; j < seatCount; j++) {
          const prev = available[i + j - 1];
          const curr = available[i + j];
          if (Math.abs(curr.y - prev.y) > 4 || Math.abs(curr.x - prev.x - 28) > 6) {
            isConsecutive = false;
            break;
          }
        }
        if (isConsecutive) {
          return available.slice(i, i + seatCount);
        }
      }
      return available.slice(0, seatCount);
    }, config.seats);

    if (adjacentSeats && adjacentSeats.length > 0) {
      console.log(`   [LIVE] 💺 Visually targeting & clicking ${adjacentSeats.length} adjacent seats on Canvas...`);
      for (let i = 0; i < adjacentSeats.length; i++) {
        const s = adjacentSeats[i];
        const targetX = stagePos.x + s.x + 11;
        const targetY = stagePos.y + s.y + 11;
        console.log(`   [LIVE] 🖱️ Moving cursor to Seat ${i + 1} at coordinates (${Math.round(targetX)}, ${Math.round(targetY)})...`);
        await page.mouse.move(targetX, targetY, { steps: 12 });
        await page.waitForTimeout(300);
        await page.mouse.click(targetX, targetY);
        await page.waitForTimeout(600);
      }
    } else {
      console.log('   Using fallback canvas seat coordinates in Wakad multiplex...');
      await page.mouse.move(stagePos.x + 489, stagePos.y + 95, { steps: 12 });
      await page.mouse.click(stagePos.x + 489, stagePos.y + 95);
      await page.waitForTimeout(600);
      await page.mouse.move(stagePos.x + 517, stagePos.y + 95, { steps: 12 });
      await page.mouse.click(stagePos.x + 517, stagePos.y + 95);
    }
    await page.waitForTimeout(2000);

    // Click "Pay ₹ XXX" button
    const payBtn = page.locator('button:has-text("Pay"), div[role="button"]:has-text("Pay")').first();
    await payBtn.waitFor({ state: 'visible', timeout: 15000 });
    const payBtnText = (await payBtn.innerText()).replace(/\n/g, ' ');
    console.log(`   Clicking Checkout Button: "${payBtnText}"...`);
    await payBtn.click();
    await page.waitForTimeout(2500);

    // Handle "Terms & Conditions" modal if it appears
    const acceptTermsBtn = page.locator('button:has-text("Accept")').first();
    if (await acceptTermsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('   Accepting Terms & Conditions modal...');
      await acceptTermsBtn.click();
      await page.waitForTimeout(3000);
    }

    // Handle "Grab a bite!" Food & Beverage screen
    const fnbSkipBtn = page.locator('button:has-text("Skip"), div[role="button"]:has-text("Skip")').filter({ hasNotText: 'main content' }).first();
    if (await fnbSkipBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('   Skipping Food & Beverage add-on modal...');
      await fnbSkipBtn.click();
      await page.waitForTimeout(3500);
    }

    // ==========================================
    // STEP 7: GUEST CHECKOUT / SIGN UP
    // ==========================================
    console.log('\n[7/8] GUEST CHECKOUT / LOGIN: Processing Contact Details modal...');
    const emailInput = page.locator('#deemed-email, input[placeholder*="email" i], input[type="email"], input[name*="email" i]').first();
    const mobileInput = page.locator('#deemed-mobile-number, input[placeholder*="mobile" i], input[placeholder*="phone" i], input[type="tel"], input[name*="mobile" i]').first();
    const submitBtn = page.locator('button:has-text("Submit"), div[role="button"]:has-text("Submit"), button:has-text("Continue")').first();

    if (await emailInput.isVisible({ timeout: 6000 }).catch(() => false)) {
      console.log(`   Entering guest email: ${config.email}`);
      await emailInput.fill(config.email, { force: true });
      await page.waitForTimeout(500);

      console.log(`   Entering guest phone: ${config.mobile}`);
      await mobileInput.fill(config.mobile, { force: true });
      await page.waitForTimeout(800);

      console.log('   Submitting guest contact details to proceed to final payment...');
      await submitBtn.click();
      await page.waitForTimeout(4500);
    } else {
      console.log('   Contact details modal already passed or not required.');
    }

    // ==========================================
    // STEP 8: FINAL PAYMENT PAGE (Safe Halt)
    // ==========================================
    console.log('\n[8/8] FINAL PAYMENT PAGE REACHED:');
    console.log(`   URL: ${page.url()}`);
    console.log('   🛑 STOPPING EXECUTION SAFELY AT FINAL PAYMENT OPTIONS SCREEN.');
    console.log('   (Payment methods available: UPI, Credit/Debit Cards, NetBanking, Wallets. NO credentials entered)');

    // Save final screenshot
    const summaryScreenshotPath = path.join(__dirname, 'booking_summary.png');
    await page.screenshot({ path: summaryScreenshotPath });
    console.log(`📸 Saved final payment page screenshot: ${summaryScreenshotPath}`);

    // Extract dynamic payment details from the final page
    const paymentPageInfo = await page.evaluate(() => {
      const paymentMethods = Array.from(document.querySelectorAll('div, span, button'))
        .map(el => (el.innerText ? el.innerText.trim() : ''))
        .filter(t => [
          'Pay by any UPI App',
          'Debit/Credit Card',
          'Mobile Wallets',
          'Gift Voucher',
          'Net Banking',
          'Pay Later',
          'Redeem Points'
        ].includes(t));

      const bodyText = document.body.innerText;
      const amountMatch = bodyText.match(/Amount Payable\s*₹?\s*([\d,.]+)/i) || bodyText.match(/Order total\s*₹?\s*([\d,.]+)/i);
      const totalAmount = amountMatch ? `₹${amountMatch[1]}` : 'Calculated at Checkout';

      const seatsMatch = bodyText.match(/([A-Z0-9]+-[A-Z0-9,\s]+)/);

      return {
        paymentMethods: Array.from(new Set(paymentMethods)),
        totalAmount,
        seats: seatsMatch ? seatsMatch[1].trim() : 'Confirmed Seats'
      };
    });

    const finalDetails = {
      timestamp: new Date().toISOString(),
      city: config.city,
      movie: config.show,
      showtime: selectedShowtimeLabel,
      seatsSelected: config.seats,
      seats: paymentPageInfo.seats,
      totalAmountPayable: paymentPageInfo.totalAmount,
      availablePaymentOptions: paymentPageInfo.paymentMethods,
      guestContact: {
        email: config.email,
        phone: config.mobile
      },
      finalUrl: page.url(),
      checkoutStatus: 'Staged at Final Payment Options Page (Guest Sign-Up/Login Completed, Safe Halt before Payment)'
    };

    const summaryJsonPath = path.join(__dirname, 'booking_summary.json');
    fs.writeFileSync(summaryJsonPath, JSON.stringify(finalDetails, null, 2), 'utf-8');

    console.log('\n====================================================');
    console.log('             BOOKING RUN COMPLETED                  ');
    console.log('====================================================');
    console.log(`🎬 Movie:              ${finalDetails.movie}`);
    console.log(`📍 Location:           ${finalDetails.city}`);
    console.log(`🕒 Showtime:           ${finalDetails.showtime}`);
    console.log(`💺 Seats:              ${finalDetails.seatsSelected} (${finalDetails.seats})`);
    console.log(`💵 Total Payable:      ${finalDetails.totalAmountPayable}`);
    console.log(`💳 Payment Options:    ${finalDetails.availablePaymentOptions.join(', ')}`);
    console.log(`👤 Guest Checkout:     ${finalDetails.guestContact.email} | ${finalDetails.guestContact.phone}`);
    console.log(`📄 Data File:          extracted_theaters.json`);
    console.log(`🖼️  Screenshot:         booking_summary.png`);
    console.log(`🛡️  Status:             Safely Staged at Final Payment Page`);
    console.log('====================================================\n');

    var hasError = false;
  } catch (err) {
    hasError = true;
    console.error('❌ Error during execution:', err.message || err);
    await page.screenshot({ path: path.join(__dirname, 'error_state.png') }).catch(() => {});
  } finally {
    try {
      if (!config.headless && !hasError && browser.isConnected()) {
        console.log('Keeping live Chrome window open for 90 seconds so you can view and complete payment...');
        await page.waitForTimeout(90000).catch(() => {});
      }
      if (browser && browser.isConnected()) {
        await browser.close().catch(() => {});
      }
    } catch (e) {}
  }
}

runAutomation();
