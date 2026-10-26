/**
 * Antigravity Autonomous Booking Agent - Production Frontend Controller
 * 
 * Supports:
 * 1. Split-Screen Architecture (45% Left / 55% Right)
 * 2. Brand Selector Pills & Single Dynamic Platform Mount (RedBus, BMS, IRCTC)
 * 3. Interactive Mini Deck Berth Picker & Live CLI Command Preview
 * 4. Remote Chrome Viewport, Pipeline Stepper & Animated Cursor
 * 5. Payment Stage Hand-off UI & Collapsible Terminal Drawer
 * 6. Unified Payment Gateway & E-Ticket Boarding Pass Modal
 */

(function () {
  'use strict';

  // --- Global Application State ---
  const state = {
    platform: 'redbus', // 'redbus' | 'bms' | 'irctc'
    theme: localStorage.getItem('theme') || 'dark',
    runId: null,
    eventSource: null,
    isRunning: false,
    selectedRedbusSeats: ['L1', 'L2'],
    bmsSeatsCount: 2,
    baseFare: 998,
    appliedDiscount: 0,
    promoCode: ''
  };

  // --- Initialize Theme ---
  document.documentElement.setAttribute('data-theme', state.theme);

  // --- DOM Element References ---
  // Header
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const engineStatusPill = document.getElementById('engineStatusPill');
  const engineStatusLabel = document.getElementById('engineStatusLabel');
  const globalStopBtn = document.getElementById('globalStopBtn');

  // Brand Selector Pills & Dynamic Mount
  const brandPills = document.querySelectorAll('.brand-pill');
  const formCardRedbus = document.getElementById('formCardRedbus');
  const formCardBms = document.getElementById('formCardBms');
  const formCardIrctc = document.getElementById('formCardIrctc');

  // RedBus Form Elements
  const rbFrom = document.getElementById('rbFrom');
  const rbTo = document.getElementById('rbTo');
  const rbDate = document.getElementById('rbDate');
  const rbOperator = document.getElementById('rbOperator');
  const rbSeatsBadge = document.getElementById('rbSeatsBadge');
  const rbLowerDeckGrid = document.getElementById('rbLowerDeckGrid');
  const rbUpperDeckGrid = document.getElementById('rbUpperDeckGrid');
  const rbBoarding = document.getElementById('rbBoarding');
  const rbDropping = document.getElementById('rbDropping');
  const rbPhone = document.getElementById('rbPhone');
  const rbEmail = document.getElementById('rbEmail');
  const rbPassengerName = document.getElementById('rbPassengerName');
  const rbPassengerAge = document.getElementById('rbPassengerAge');
  const rbPassengerGender = document.getElementById('rbPassengerGender');
  const rbCliPreview = document.getElementById('rbCliPreview');
  const copyRbCmdBtn = document.getElementById('copyRbCmdBtn');
  const executeRbAgentBtn = document.getElementById('executeRbAgentBtn');

  // BookMyShow Form Elements
  const bmsCity = document.getElementById('bmsCity');
  const bmsMovie = document.getElementById('bmsMovie');
  const bmsDate = document.getElementById('bmsDate');
  const bmsFormat = document.getElementById('bmsFormat');
  const bmsCategory = document.getElementById('bmsCategory');
  const bmsMinusBtn = document.getElementById('bmsMinusBtn');
  const bmsPlusBtn = document.getElementById('bmsPlusBtn');
  const bmsSeatVal = document.getElementById('bmsSeatVal');
  const bmsCliPreview = document.getElementById('bmsCliPreview');
  const copyBmsCmdBtn = document.getElementById('copyBmsCmdBtn');
  const executeBmsAgentBtn = document.getElementById('executeBmsAgentBtn');

  // IRCTC Form Elements
  const irctcFrom = document.getElementById('irctcFrom');
  const irctcTo = document.getElementById('irctcTo');
  const irctcDate = document.getElementById('irctcDate');
  const irctcClass = document.getElementById('irctcClass');
  const irctcQuota = document.getElementById('irctcQuota');
  const irctcBerth = document.getElementById('irctcBerth');
  const irctcCliPreview = document.getElementById('irctcCliPreview');
  const copyIrctcCmdBtn = document.getElementById('copyIrctcCmdBtn');
  const executeIrctcAgentBtn = document.getElementById('executeIrctcAgentBtn');

  // Chat Container & Form
  const chatThreadContainer = document.getElementById('chatThreadContainer');
  const agentChatForm = document.getElementById('agentChatForm');
  const agentChatInput = document.getElementById('agentChatInput');

  // Viewport Elements
  const viewportStatusBadge = document.getElementById('viewportStatusBadge');
  const badgeDot = document.getElementById('badgeDot');
  const badgeStatusText = document.getElementById('badgeStatusText');
  const remoteUrlDisplay = document.getElementById('remoteUrlDisplay');
  const takeControlBtn = document.getElementById('takeControlBtn');
  const viewportCursor = document.getElementById('viewportCursor');
  const cursorRipple = document.getElementById('cursorRipple');

  // Viewport Screens
  const screenRedbus = document.getElementById('screenRedbus');
  const screenBms = document.getElementById('screenBms');
  const screenIrctc = document.getElementById('screenIrctc');
  const vpRbRoute = document.getElementById('vpRbRoute');
  const vpBmsTitle = document.getElementById('vpBmsTitle');
  const vpIrctcRoute = document.getElementById('vpIrctcRoute');

  // Pipeline Steps
  const pipeSteps = [
    document.getElementById('pipeStep1'),
    document.getElementById('pipeStep2'),
    document.getElementById('pipeStep3'),
    document.getElementById('pipeStep4')
  ];

  // Payment Handoff Banner
  const paymentHandoffBanner = document.getElementById('paymentHandoffBanner');
  const openGatewayModalBtn = document.getElementById('openGatewayModalBtn');

  // Collapsible Terminal Drawer
  const terminalDrawer = document.getElementById('terminalDrawer');
  const drawerHeaderToggle = document.getElementById('drawerHeaderToggle');
  const clearLogsBtn = document.getElementById('clearLogsBtn');
  const drawerTerminalBody = document.getElementById('drawerTerminalBody');

  // Payment Gateway Modal
  const paymentModalBackdrop = document.getElementById('paymentModalBackdrop');
  const closePaymentModalX = document.getElementById('closePaymentModalX');
  const payServicePill = document.getElementById('payServicePill');
  const payServiceTitle = document.getElementById('payServiceTitle');
  const payServiceRoute = document.getElementById('payServiceRoute');
  const payBaseFare = document.getElementById('payBaseFare');
  const payGrandTotal = document.getElementById('payGrandTotal');
  const payDiscountRow = document.getElementById('payDiscountRow');
  const payPromoCode = document.getElementById('payPromoCode');
  const payDiscountVal = document.getElementById('payDiscountVal');
  const modalPromoInput = document.getElementById('modalPromoInput');
  const modalApplyPromoBtn = document.getElementById('modalApplyPromoBtn');
  const modalPromoAlert = document.getElementById('modalPromoAlert');
  const payConfirmSubmitBtn = document.getElementById('payConfirmSubmitBtn');
  const methodTabs = document.querySelectorAll('.m-tab');

  // E-Ticket Confirmation Modal
  const ticketModalBackdrop = document.getElementById('ticketModalBackdrop');
  const ticketPlatformBadge = document.getElementById('ticketPlatformBadge');
  const ticketPnrDisplay = document.getElementById('ticketPnrDisplay');
  const ticketTitleDisplay = document.getElementById('ticketTitleDisplay');
  const ticketDateDisplay = document.getElementById('ticketDateDisplay');
  const ticketSeatsDisplay = document.getElementById('ticketSeatsDisplay');
  const ticketPaidDisplay = document.getElementById('ticketPaidDisplay');
  const printPassBtn = document.getElementById('printPassBtn');
  const doneTicketBtn = document.getElementById('doneTicketBtn');

  // ==========================================================
  // 1. THEME SWITCHER
  // ==========================================================
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', state.theme);
      localStorage.setItem('theme', state.theme);
    });
  }

  // ==========================================================
  // 2. BRAND PILL PLATFORM SELECTION (STRICT SINGLE-CARD VIEW)
  // ==========================================================
  function selectPlatform(targetPlatform) {
    state.platform = targetPlatform.toLowerCase();

    // Update Brand Pills active class
    brandPills.forEach(pill => {
      if (pill.dataset.platform === state.platform) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Hide all platform config cards, show ONLY the selected one
    if (formCardRedbus) formCardRedbus.style.display = state.platform === 'redbus' ? 'block' : 'none';
    if (formCardBms) formCardBms.style.display = state.platform === 'bms' ? 'block' : 'none';
    if (formCardIrctc) formCardIrctc.style.display = state.platform === 'irctc' ? 'block' : 'none';

    // Update Remote Viewport Screen
    if (screenRedbus) screenRedbus.classList.toggle('active', state.platform === 'redbus');
    if (screenBms) screenBms.classList.toggle('active', state.platform === 'bms');
    if (screenIrctc) screenIrctc.classList.toggle('active', state.platform === 'irctc');

    // Update Omnibox URL
    if (remoteUrlDisplay) {
      if (state.platform === 'redbus') {
        remoteUrlDisplay.textContent = `https://www.redbus.in/bus-tickets/${encodeURIComponent((rbFrom.value || 'mumbai').toLowerCase())}-to-${encodeURIComponent((rbTo.value || 'pune').toLowerCase())}`;
      } else if (state.platform === 'bms') {
        remoteUrlDisplay.textContent = `https://in.bookmyshow.com/explore/movies-${encodeURIComponent((bmsCity.value || 'mumbai').toLowerCase())}`;
      } else if (state.platform === 'irctc') {
        remoteUrlDisplay.textContent = `https://www.irctc.co.in/nget/train-search`;
      }
    }

    // Refresh CLI Command previews
    updateCliPreviews();
  }

  brandPills.forEach(pill => {
    pill.addEventListener('click', () => {
      selectPlatform(pill.dataset.platform);
    });
  });

  // ==========================================================
  // 3. LIVE CLI COMMAND PREVIEWS & SEAT PICKERS
  // ==========================================================
  function updateCliPreviews() {
    // RedBus CLI
    if (rbCliPreview) {
      const fromVal = (rbFrom && rbFrom.value.trim()) || 'Pune';
      const toVal = (rbTo && rbTo.value.trim()) || 'Nagpur';
      const dateVal = (rbDate && rbDate.value) || 'Tomorrow';
      const seatsVal = state.selectedRedbusSeats.length > 0 ? state.selectedRedbusSeats.join(',') : 'L1,L2';
      const boardingVal = (rbBoarding && rbBoarding.value.trim()) || 'Wageshwar';
      const droppingVal = (rbDropping && rbDropping.value.trim()) || 'Chhatrapati Square';
      const phoneVal = (rbPhone && rbPhone.value.trim()) || '9820198201';
      const nameVal = (rbPassengerName && rbPassengerName.value.trim()) || 'Rahul Sharma';
      rbCliPreview.textContent = `node redbus_playwright.js --from="${fromVal}" --to="${toVal}" --date="${dateVal}" --seats=${seatsVal} --boarding="${boardingVal}" --dropping="${droppingVal}" --phone="${phoneVal}" --name="${nameVal}"`;
      if (vpRbRoute) vpRbRoute.textContent = `${fromVal} ➔ ${toVal}`;
    }

    // BMS CLI
    if (bmsCliPreview) {
      const cityVal = (bmsCity && bmsCity.value.trim()) || 'Mumbai';
      const showVal = (bmsMovie && bmsMovie.value.trim()) || 'Ramayana';
      const dateVal = (bmsDate && bmsDate.value) || 'Tomorrow';
      const seatsVal = state.bmsSeatsCount || 2;
      bmsCliPreview.textContent = `node index.js --city="${cityVal}" --show="${showVal}" --date="${dateVal}" --seats=${seatsVal}`;
      if (vpBmsTitle) vpBmsTitle.textContent = showVal;
    }

    // IRCTC CLI
    if (irctcCliPreview) {
      const fromVal = (irctcFrom && irctcFrom.value.trim().toUpperCase()) || 'CSMT';
      const toVal = (irctcTo && irctcTo.value.trim().toUpperCase()) || 'PUNE';
      const dateVal = (irctcDate && irctcDate.value) || 'Tomorrow';
      const classVal = (irctcClass && irctcClass.value) || '3A';
      const quotaVal = (irctcQuota && irctcQuota.value) === 'Tatkal' ? 'TQ' : (irctcQuota && irctcQuota.value) === 'Premium Tatkal' ? 'PT' : 'GN';
      const berthVal = (irctcBerth && irctcBerth.value) || 'Lower';
      irctcCliPreview.textContent = `node irctc_workflow.js --from="${fromVal}" --to="${toVal}" --date="${dateVal}" --class="${classVal}" --quota="${quotaVal}" --berth="${berthVal}"`;
      if (vpIrctcRoute) vpIrctcRoute.textContent = `${fromVal} ➔ ${toVal}`;
    }
  }

  // Hook input changes to update preview
  [rbFrom, rbTo, rbDate, rbOperator, rbBoarding, rbDropping, rbPhone, rbEmail, rbPassengerName, rbPassengerAge, rbPassengerGender].forEach(el => {
    if (el) el.addEventListener('input', updateCliPreviews);
  });
  [bmsCity, bmsMovie, bmsDate, bmsFormat, bmsCategory].forEach(el => {
    if (el) el.addEventListener('input', updateCliPreviews);
  });
  [irctcFrom, irctcTo, irctcDate, irctcClass, irctcQuota, irctcBerth].forEach(el => {
    if (el) el.addEventListener('input', updateCliPreviews);
  });

  // RedBus Mini Deck Seat Picker Interaction
  function initMiniDeck() {
    const berths = document.querySelectorAll('.berth-pill:not(.booked)');
    berths.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const seatNum = btn.dataset.seat;
        if (btn.classList.contains('selected')) {
          btn.classList.remove('selected');
          state.selectedRedbusSeats = state.selectedRedbusSeats.filter(s => s !== seatNum);
        } else {
          btn.classList.add('selected');
          if (!state.selectedRedbusSeats.includes(seatNum)) {
            state.selectedRedbusSeats.push(seatNum);
          }
        }

        // Sort seats (L before U, numbers ascending)
        state.selectedRedbusSeats.sort();

        // Update badge
        if (rbSeatsBadge) {
          rbSeatsBadge.textContent = state.selectedRedbusSeats.length > 0 
            ? `Seats: ${state.selectedRedbusSeats.join(', ')}` 
            : 'Select Seats';
        }

        // Animate visual cursor to clicked berth
        triggerCursorMotion(btn);
        updateCliPreviews();
      });
    });
  }
  initMiniDeck();

  // BookMyShow Seat Count Stepper
  if (bmsMinusBtn && bmsPlusBtn && bmsSeatVal) {
    bmsMinusBtn.addEventListener('click', () => {
      if (state.bmsSeatsCount > 1) {
        state.bmsSeatsCount--;
        bmsSeatVal.textContent = state.bmsSeatsCount;
        updateCliPreviews();
      }
    });
    bmsPlusBtn.addEventListener('click', () => {
      if (state.bmsSeatsCount < 10) {
        state.bmsSeatsCount++;
        bmsSeatVal.textContent = state.bmsSeatsCount;
        updateCliPreviews();
      }
    });
  }

  // Copy CLI Command Buttons
  function setupCopyButton(btn, previewEl) {
    if (!btn || !previewEl) return;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(previewEl.textContent);
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.color = '#10b981';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = '';
        }, 1800);
      } catch (err) {
        console.error('Copy failed', err);
      }
    });
  }
  setupCopyButton(copyRbCmdBtn, rbCliPreview);
  setupCopyButton(copyBmsCmdBtn, bmsCliPreview);
  setupCopyButton(copyIrctcCmdBtn, irctcCliPreview);

  // ==========================================================
  // 4. ANIMATED CURSOR FOLLOWER SIMULATION
  // ==========================================================
  function triggerCursorMotion(targetElement) {
    if (!viewportCursor || !cursorRipple) return;
    try {
      const rect = targetElement.getBoundingClientRect();
      const parentRect = document.querySelector('.remote-viewport-canvas').getBoundingClientRect();
      const top = Math.max(20, rect.top - parentRect.top + 20);
      const left = Math.max(20, rect.left - parentRect.left + 40);

      viewportCursor.style.top = `${top}px`;
      viewportCursor.style.left = `${left}px`;

      cursorRipple.classList.remove('click-anim');
      void cursorRipple.offsetWidth; // Trigger reflow
      cursorRipple.classList.add('click-anim');
    } catch (e) {
      // Fallback
    }
  }

  // ==========================================================
  // 5. COLLAPSIBLE TERMINAL DRAWER & LOGS
  // ==========================================================
  if (drawerHeaderToggle && terminalDrawer) {
    drawerHeaderToggle.addEventListener('click', (e) => {
      // Don't toggle if user clicked Clear button
      if (e.target.closest('#clearLogsBtn')) return;
      terminalDrawer.classList.toggle('collapsed');
    });
  }

  if (clearLogsBtn && drawerTerminalBody) {
    clearLogsBtn.addEventListener('click', () => {
      drawerTerminalBody.innerHTML = `
        <div class="terminal-row system">
          <span class="t-time">${new Date().toLocaleTimeString()}</span>
          <span class="t-msg">[AGENT] Terminal output cleared.</span>
        </div>`;
    });
  }

  function appendTerminalLog(msg, type = 'normal') {
    if (!drawerTerminalBody) return;
    const timeStr = new Date().toLocaleTimeString();
    const row = document.createElement('div');
    row.className = `terminal-row ${type}`;
    row.innerHTML = `<span class="t-time">${timeStr}</span><span class="t-msg">${escapeHtml(msg)}</span>`;
    drawerTerminalBody.appendChild(row);
    drawerTerminalBody.scrollTop = drawerTerminalBody.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==========================================================
  // 6. PIPELINE STEP INDICATOR & CONNECTION BADGE
  // ==========================================================
  function setPipelineStep(stepNumber) {
    pipeSteps.forEach((step, idx) => {
      if (!step) return;
      const stepIdx = idx + 1;
      if (stepIdx < stepNumber) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (stepIdx === stepNumber) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
  }

  function setViewportStatus(label, type = 'idle') {
    if (badgeStatusText) badgeStatusText.textContent = label;
    if (badgeDot) {
      badgeDot.className = 'badge-dot';
      if (type !== 'idle') badgeDot.classList.add(type);
    }
    if (engineStatusLabel) engineStatusLabel.textContent = `Agent Engine: ${label}`;
  }

  // ==========================================================
  // 7. AGENT EXECUTION VIA /api/start-agent & SSE STREAMING
  // ==========================================================
  async function spawnAgent(platform) {
    if (state.isRunning) {
      alert('An automation process is already active. Please wait or click Stop.');
      return;
    }

    state.isRunning = true;
    setViewportStatus('Spawning Remote Chrome', 'spawning');
    setPipelineStep(1);

    // Expand terminal drawer
    if (terminalDrawer) terminalDrawer.classList.remove('collapsed');
    appendTerminalLog(`[LAUNCH] Initiating autonomous ${platform.toUpperCase()} pipeline...`, 'system');

    // Prepare clean JSON payload
    let payload = { platform };
    if (platform === 'redbus') {
      payload.from = (rbFrom && rbFrom.value.trim()) || 'Pune';
      payload.to = (rbTo && rbTo.value.trim()) || 'Nagpur';
      payload.date = (rbDate && rbDate.value) || 'Tomorrow';
      payload.seats = state.selectedRedbusSeats.length > 0 ? state.selectedRedbusSeats.join(',') : 'L1,L2';
      payload.operator = rbOperator ? rbOperator.value : '';
      payload.boarding = rbBoarding ? rbBoarding.value.trim() : 'Wageshwar';
      payload.dropping = rbDropping ? rbDropping.value.trim() : 'Chhatrapati Square';
      payload.phone = rbPhone ? rbPhone.value.trim() : '9820198201';
      payload.email = rbEmail ? rbEmail.value.trim() : 'rahul.booking@gmail.com';
      payload.name = rbPassengerName ? rbPassengerName.value.trim() : 'Rahul Sharma';
      payload.age = rbPassengerAge ? parseInt(rbPassengerAge.value, 10) : 28;
    } else if (platform === 'bms') {
      payload.city = (bmsCity && bmsCity.value.trim()) || 'Mumbai';
      payload.show = (bmsMovie && bmsMovie.value.trim()) || 'Heart of the Beast';
      payload.date = (bmsDate && bmsDate.value) || 'Tomorrow';
      payload.seats = String(state.bmsSeatsCount || 2);
    } else if (platform === 'irctc') {
      payload.from = (irctcFrom && irctcFrom.value.trim().toUpperCase()) || 'CSMT';
      payload.to = (irctcTo && irctcTo.value.trim().toUpperCase()) || 'PUNE';
      payload.date = (irctcDate && irctcDate.value) || 'Tomorrow';
      payload.class = (irctcClass && irctcClass.value) || '3A';
      payload.quota = (irctcQuota && irctcQuota.value) === 'Tatkal' ? 'TQ' : (irctcQuota && irctcQuota.value) === 'Premium Tatkal' ? 'PT' : 'GN';
      payload.berth = (irctcBerth && irctcBerth.value) || 'Lower';
    }

    try {
      const resp = await fetch('/api/start-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize agent process');
      }

      state.runId = data.runId;
      appendTerminalLog(`[PROC] Remote Chrome PID spawned. RunId: ${state.runId}`, 'system');

      // Connect SSE Live Log Stream
      listenToEventStream(state.runId, platform);
    } catch (err) {
      appendTerminalLog(`[ERROR] ${err.message}`, 'error');
      setViewportStatus('Idle / Failed', 'idle');
      state.isRunning = false;
    }
  }

  function listenToEventStream(runId, platform) {
    if (state.eventSource) {
      state.eventSource.close();
    }

    state.eventSource = new EventSource(`/api/automation/stream/${runId}`);

    state.eventSource.onmessage = (event) => {
      try {
        const item = JSON.parse(event.data);
        const text = item.text || '';

        // Classify log type
        let logType = 'normal';
        if (text.includes('ERROR') || text.includes('failed')) logType = 'error';
        else if (text.includes('SUCCESS') || text.includes('Done') || text.includes('Ready')) logType = 'success';
        else if (text.includes('WARN')) logType = 'warn';

        appendTerminalLog(text, logType);

        // Progress pipeline & cursor according to events
        if (text.includes('Launching headed Chrome') || text.includes('Navigating')) {
          setPipelineStep(1);
          setViewportStatus('Route Searching', 'selecting');
        } else if (text.includes('Extracting seat map') || text.includes('available berths') || text.includes('Seating layout')) {
          setPipelineStep(2);
          setViewportStatus('Seat Map Extracted', 'selecting');
        } else if (text.includes('Selecting seat') || text.includes('Clicking seat') || text.includes('Auto-Selecting')) {
          setPipelineStep(3);
          setViewportStatus('Selecting Seats', 'selecting');
          // Animate cursor to seats in viewport
          const targetSeatEl = document.querySelector('.live-berth.active-selected') || document.querySelector('.seat-cell.active-bms');
          if (targetSeatEl) triggerCursorMotion(targetSeatEl);
        } else if (text.includes('Proceed to Pay') || text.includes('Payment page') || text.includes('Awaiting payment') || text.includes('Checkout')) {
          triggerPaymentHandoff(platform);
        }
      } catch (err) {
        // Raw text message
        appendTerminalLog(event.data);
      }
    };

    state.eventSource.addEventListener('status', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.status === 'completed' || data.status === 'exited') {
          appendTerminalLog(`[AGENT] CLI Process execution cycle ended.`, 'system');
          state.isRunning = false;
          // Trigger payment banner if not already triggered
          triggerPaymentHandoff(platform);
        }
      } catch (err) {}
    });

    state.eventSource.onerror = () => {
      state.eventSource.close();
      state.isRunning = false;
    };
  }

  // Trigger Human-in-the-Loop Payment Stage
  function triggerPaymentHandoff(platform) {
    setPipelineStep(4);
    setViewportStatus('Awaiting Payment', 'payment');
    if (paymentHandoffBanner) {
      paymentHandoffBanner.style.display = 'flex';
      paymentHandoffBanner.scrollIntoView({ behavior: 'smooth' });
    }
    appendTerminalLog(`[AWAITING_PAYMENT] Live Chrome paused at checkout. Human payment action required.`, 'warn');
  }

  // Hook Execute Buttons
  if (executeRbAgentBtn) executeRbAgentBtn.addEventListener('click', () => spawnAgent('redbus'));
  if (executeBmsAgentBtn) executeBmsAgentBtn.addEventListener('click', () => spawnAgent('bms'));
  if (executeIrctcAgentBtn) executeIrctcAgentBtn.addEventListener('click', () => spawnAgent('irctc'));

  // Global Emergency Stop Button
  if (globalStopBtn) {
    globalStopBtn.addEventListener('click', async () => {
      if (state.eventSource) state.eventSource.close();
      try {
        await fetch('/api/automation/stop', { method: 'POST' });
      } catch (e) {}
      state.isRunning = false;
      setViewportStatus('Agent Engine Idle', 'idle');
      setPipelineStep(1);
      if (paymentHandoffBanner) paymentHandoffBanner.style.display = 'none';
      appendTerminalLog(`[EMERGENCY_STOP] User aborted all browser processes.`, 'error');
    });
  }

  // Take Control Button
  if (takeControlBtn) {
    takeControlBtn.addEventListener('click', () => {
      alert('Chromium is running headed on your display. You can click into the native Chrome window to directly interact with the DOM, solve any CAPTCHAs, or input passwords.');
    });
  }

  // ==========================================================
  // 8. CONVERSATIONAL AGENT CHAT FORM
  // ==========================================================
  if (agentChatForm && agentChatInput) {
    agentChatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const prompt = agentChatInput.value.trim();
      if (!prompt) return;

      agentChatInput.value = '';
      appendUserChatMessage(prompt);

      // Simple Natural Language Router for Instant Dynamic Card Switching
      const lower = prompt.toLowerCase();
      if (lower.includes('redbus') || lower.includes('bus')) {
        selectPlatform('redbus');
        appendAgentChatMessage(`Switched to <strong>RedBus</strong>. I've configured the route options for your trip. Click Execute to spawn Live Chrome.`);
        return;
      } else if (lower.includes('bookmyshow') || lower.includes('bms') || lower.includes('movie') || lower.includes('cinema')) {
        selectPlatform('bms');
        appendAgentChatMessage(`Switched to <strong>BookMyShow</strong>. I've loaded cinema booking parameters. Ready to launch Chrome on demand.`);
        return;
      } else if (lower.includes('irctc') || lower.includes('train') || lower.includes('rail')) {
        selectPlatform('irctc');
        appendAgentChatMessage(`Switched to <strong>IRCTC</strong>. Indian Railways reservation form is mounted.`);
        return;
      }

      // Fallback: Query backend /api/chat
      try {
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt })
        });
        const data = await resp.json();
        appendAgentChatMessage(data.reply || `I've registered your request: "${prompt}". Ready to book when you click Execute.`);
      } catch (err) {
        appendAgentChatMessage(`Understood! You can inspect the live CLI command preview and click "Spawn Live Chrome" when ready.`);
      }
    });
  }

  function appendUserChatMessage(msg) {
    if (!chatThreadContainer) return;
    const row = document.createElement('div');
    row.className = 'chat-row user';
    row.style.justifyContent = 'flex-end';
    row.innerHTML = `
      <div class="bubble-content" style="background: rgba(37, 99, 235, 0.15); border-color: rgba(37, 99, 235, 0.4); max-width: 80%;">
        <p style="margin: 0; color: #ffffff;">${escapeHtml(msg)}</p>
      </div>`;
    chatThreadContainer.appendChild(row);
    chatThreadContainer.scrollTop = chatThreadContainer.scrollHeight;
  }

  function appendAgentChatMessage(htmlMsg) {
    if (!chatThreadContainer) return;
    const row = document.createElement('div');
    row.className = 'chat-row agent';
    row.innerHTML = `
      <div class="agent-avatar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7h2a3 3 0 0 1 3 3v2h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-1H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1v-2a3 3 0 0 1 3-3h2V5.72A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"></path>
        </svg>
      </div>
      <div class="bubble-content">
        <p>${htmlMsg}</p>
      </div>`;
    chatThreadContainer.appendChild(row);
    chatThreadContainer.scrollTop = chatThreadContainer.scrollHeight;
  }

  // ==========================================================
  // 9. UNIFIED PAYMENT GATEWAY & TICKET GENERATION
  // ==========================================================
  if (openGatewayModalBtn) {
    openGatewayModalBtn.addEventListener('click', () => {
      openPaymentGatewayModal();
    });
  }

  function openPaymentGatewayModal() {
    if (!paymentModalBackdrop) return;

    // Populate dynamic modal info based on active platform
    if (state.platform === 'redbus') {
      if (payServicePill) { payServicePill.textContent = 'RedBus Verified'; payServicePill.style.color = '#e23744'; }
      if (payServiceTitle) payServiceTitle.textContent = (rbOperator && rbOperator.value) || 'Zingbus Plus Electric & Luxury';
      const seats = state.selectedRedbusSeats.length > 0 ? state.selectedRedbusSeats.join(', ') : 'L1, L2';
      if (payServiceRoute) payServiceRoute.textContent = `${(rbFrom && rbFrom.value) || 'Mumbai'} ➔ ${(rbTo && rbTo.value) || 'Pune'} • Berths ${seats}`;
      state.baseFare = 998;
    } else if (state.platform === 'bms') {
      if (payServicePill) { payServicePill.textContent = 'BookMyShow Cinema'; payServicePill.style.color = '#f84464'; }
      if (payServiceTitle) payServiceTitle.textContent = (bmsMovie && bmsMovie.value) || 'Heart of the Beast';
      if (payServiceRoute) payServiceRoute.textContent = `${(bmsCity && bmsCity.value) || 'Mumbai'} • ${state.bmsSeatsCount} Cinema Tickets`;
      state.baseFare = (state.bmsSeatsCount || 2) * 350;
    } else if (state.platform === 'irctc') {
      if (payServicePill) { payServicePill.textContent = 'IRCTC e-Ticketing'; payServicePill.style.color = '#3b82f6'; }
      if (payServiceTitle) payServiceTitle.textContent = 'Deccan Queen Superfast (Train #12123)';
      if (payServiceRoute) payServiceRoute.textContent = `${(irctcFrom && irctcFrom.value) || 'CSMT'} ➔ ${(irctcTo && irctcTo.value) || 'PUNE'} • Class ${irctcClass ? irctcClass.value : '3A'}`;
      state.baseFare = 780;
    }

    calculateTotalFare();
    paymentModalBackdrop.classList.add('active');
  }

  function calculateTotalFare() {
    const convenience = 50;
    const gst = Math.round(state.baseFare * 0.05);
    const total = Math.max(0, state.baseFare + convenience + gst - state.appliedDiscount);

    if (payBaseFare) payBaseFare.textContent = `₹${state.baseFare}.00`;
    if (payGrandTotal) payGrandTotal.textContent = `₹${total}.00`;

    if (state.appliedDiscount > 0) {
      if (payDiscountRow) payDiscountRow.style.display = 'flex';
      if (payPromoCode) payPromoCode.textContent = state.promoCode;
      if (payDiscountVal) payDiscountVal.textContent = `-₹${state.appliedDiscount}.00`;
    } else {
      if (payDiscountRow) payDiscountRow.style.display = 'none';
    }
  }

  // Promo Code Application
  if (modalApplyPromoBtn && modalPromoInput && modalPromoAlert) {
    modalApplyPromoBtn.addEventListener('click', () => {
      const code = modalPromoInput.value.trim().toUpperCase();
      if (code === 'FIRST50' || code === 'OMNIPASS') {
        state.appliedDiscount = 50;
        state.promoCode = code;
        modalPromoAlert.textContent = `✓ Promo applied! ₹50.00 discount deducted.`;
        modalPromoAlert.style.color = '#10b981';
      } else {
        state.appliedDiscount = 0;
        modalPromoAlert.textContent = `Invalid promo code. Try FIRST50.`;
        modalPromoAlert.style.color = '#f87171';
      }
      calculateTotalFare();
    });
  }

  // Payment Method Tabs
  methodTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      methodTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabKey = tab.dataset.tab;
      document.querySelectorAll('.tab-view').forEach(view => {
        view.classList.toggle('active', view.id === `view-${tabKey}`);
      });
    });
  });

  // Close Payment Modal
  if (closePaymentModalX && paymentModalBackdrop) {
    closePaymentModalX.addEventListener('click', () => {
      paymentModalBackdrop.classList.remove('active');
    });
  }

  // Submit Payment Confirmation
  if (payConfirmSubmitBtn) {
    payConfirmSubmitBtn.addEventListener('click', async () => {
      payConfirmSubmitBtn.disabled = true;
      payConfirmSubmitBtn.innerHTML = `<span>⏳ Processing SSL Settlement...</span>`;

      try {
        await fetch('/api/payment/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: state.platform,
            amount: payGrandTotal.textContent,
            promo: state.promoCode
          })
        });
      } catch (err) {}

      setTimeout(() => {
        payConfirmSubmitBtn.disabled = false;
        payConfirmSubmitBtn.innerHTML = `<span>🔒 Pay & Confirm Autonomous Booking</span>`;
        if (paymentModalBackdrop) paymentModalBackdrop.classList.remove('active');
        if (paymentHandoffBanner) paymentHandoffBanner.style.display = 'none';

        // Show Confirmed E-Ticket Modal
        showConfirmedTicketModal();
      }, 900);
    });
  }

  function showConfirmedTicketModal() {
    if (!ticketModalBackdrop) return;

    const pnr = `${state.platform.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    if (ticketPnrDisplay) ticketPnrDisplay.textContent = `PNR: ${pnr}`;

    if (state.platform === 'redbus') {
      if (ticketPlatformBadge) ticketPlatformBadge.textContent = 'RedBus Official e-Ticket';
      if (ticketTitleDisplay) ticketTitleDisplay.textContent = `${rbFrom.value || 'Mumbai'} ➔ ${rbTo.value || 'Pune'}`;
      if (ticketDateDisplay) ticketDateDisplay.textContent = `${rbDate.value || 'Tomorrow'} • 06:30 AM (Zingbus)`;
      if (ticketSeatsDisplay) ticketSeatsDisplay.textContent = `Berths: ${state.selectedRedbusSeats.join(', ') || 'L1, L2'}`;
    } else if (state.platform === 'bms') {
      if (ticketPlatformBadge) ticketPlatformBadge.textContent = 'BookMyShow M-Ticket';
      if (ticketTitleDisplay) ticketTitleDisplay.textContent = bmsMovie.value || 'Heart of the Beast';
      if (ticketDateDisplay) ticketDateDisplay.textContent = `${bmsDate.value || 'Tomorrow'} • 05:30 PM (PVR ICON)`;
      if (ticketSeatsDisplay) ticketSeatsDisplay.textContent = `${state.bmsSeatsCount} Cinema Seats (Gold Tier)`;
    } else if (state.platform === 'irctc') {
      if (ticketPlatformBadge) ticketPlatformBadge.textContent = 'IRCTC Electronic Reservation Slip';
      if (ticketTitleDisplay) ticketTitleDisplay.textContent = `${irctcFrom.value || 'CSMT'} ➔ ${irctcTo.value || 'PUNE'}`;
      if (ticketDateDisplay) ticketDateDisplay.textContent = `${irctcDate.value || 'Tomorrow'} • 07:15 AM (Deccan Queen)`;
      if (ticketSeatsDisplay) ticketSeatsDisplay.textContent = `Coach B2, Berth 34 (${irctcClass ? irctcClass.value : '3A'})`;
    }

    if (ticketPaidDisplay && payGrandTotal) {
      ticketPaidDisplay.textContent = `${payGrandTotal.textContent} (PAID)`;
    }

    appendTerminalLog(`[SUCCESS] Booking confirmed! PNR issued: ${pnr}`, 'success');
    appendAgentChatMessage(`🎉 <strong>Booking Confirmed!</strong> Your official ticket has been staged and confirmed with PNR <code>${pnr}</code>.`);
    ticketModalBackdrop.classList.add('active');
  }

  // Done / Book Another Button
  if (doneTicketBtn && ticketModalBackdrop) {
    doneTicketBtn.addEventListener('click', () => {
      ticketModalBackdrop.classList.remove('active');
      setPipelineStep(1);
      setViewportStatus('Agent Engine Idle', 'idle');
    });
  }

  if (printPassBtn) {
    printPassBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Initial CLI preview update
  updateCliPreviews();
  console.log('[Antigravity Agent] Split-Screen Frontend Initialized Successfully.');
})();
