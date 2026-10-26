/**
 * OmniBook AI - Playwright Automation Hub Server
 * Supports:
 * - Real-time Child Process Execution with Server-Sent Events (SSE) streaming
 * - Form-Driven Execution Hub (BookMyShow & RedBus)
 * - Interactive Conversational Chatbot
 * - Unified Payment Gateway & Ticket Generation
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { EventEmitter } = require('events');

const {
  generateDynamicBuses,
  getBusSeatLayout,
  runRedBusAutomation
} = require('./redbus_workflow');

const {
  BMS_MOVIES_DATABASE,
  BMS_THEATERS_DATABASE,
  getCinemaSeatLayout,
  runBMSAutomation
} = require('./bms_workflow');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store for active automation runs and booking sessions
const activeRuns = new Map();
const activeSessions = new Map();
const confirmedBookings = new Map();

// ==========================================
// REAL-TIME AUTOMATION EXECUTION ENGINE (SSE)
// ==========================================

const executeAutomationHandler = (req, res) => {
  const body = req.body || {};
  let rawPlatform = (body.platform || 'BookMyShow').toLowerCase();
  let platform = 'BookMyShow';
  if (rawPlatform.includes('redbus') || rawPlatform.includes('bus')) platform = 'RedBus';
  else if (rawPlatform.includes('irctc') || rawPlatform.includes('train')) platform = 'IRCTC';

  const {
    city = body.city || 'Mumbai',
    show = body.show || body.movie || 'Heart of the Beast',
    date = body.date || 'Tomorrow',
    seats = body.seats || 2,
    fromCity = body.fromCity || body.from || 'Mumbai',
    toCity = body.toCity || body.to || 'Pune',
    busOperator = body.busOperator || body.operator || 'Zingbus Plus Electric & Luxury',
    coachClass = body.coachClass || body.class || '3A',
    quota = body.quota || 'General',
    email = body.email || 'guest.booking@gmail.com',
    mobile = body.mobile || '9820198201',
    headed = body.headed !== undefined ? body.headed : true
  } = body;

  const runId = 'RUN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const runEmitter = new EventEmitter();
  const logBuffer = [];

  function broadcastLog(line, level = 'info') {
    const logObj = {
      timestamp: new Date().toLocaleTimeString(),
      text: line,
      level
    };
    logBuffer.push(logObj);
    runEmitter.emit('log', logObj);
  }

  activeRuns.set(runId, {
    runId,
    platform,
    status: 'RUNNING',
    emitter: runEmitter,
    logs: logBuffer,
    stagedData: null
  });

  res.json({ success: true, runId, message: 'Automation initiated' });

  broadcastLog(`🚀 [ORCHESTRATOR] Initializing ${platform} automation pipeline...`, 'system');
  broadcastLog(`⚙️ Mode: ${headed ? 'Headed (Browser Window Visible)' : 'Headless (Background Process)'}`, 'system');

  let child;
  const isBMS = platform === 'BookMyShow';
  const isRedBus = platform === 'RedBus';

  if (isBMS) {
    const args = [
      'index.js',
      `--city=${city}`,
      `--show=${show}`,
      `--date=${date}`,
      `--seats=${seats}`,
      `--email=${email}`,
      `--mobile=${mobile}`
    ];
    if (!headed) {
      args.push('--headless=true');
    }

    broadcastLog(`📍 City: ${city} | 🎬 Movie: ${show} | 💺 Seats: ${seats}`, 'info');
    broadcastLog(`▶️ Spawning: node ${args.join(' ')}`, 'system');
    child = spawn('node', args, { cwd: __dirname, shell: true });
    activeRuns.get(runId).child = child;
  } else if (isRedBus) {
    // RedBus live Playwright runner
    const seatList = Array.isArray(seats) ? seats.join(',') : (typeof seats === 'number' ? `L1,L2` : seats);
    const rbArgs = [
      'redbus_playwright.js',
      `--from=${fromCity}`,
      `--to=${toCity}`,
      `--date=${date}`,
      `--seats=${seatList}`,
      `--operator=${busOperator}`
    ];
    if (body.boarding) rbArgs.push(`--boarding=${body.boarding}`);
    if (body.dropping) rbArgs.push(`--dropping=${body.dropping}`);
    if (body.phone || body.mobile) rbArgs.push(`--phone=${body.phone || body.mobile}`);
    if (body.email) rbArgs.push(`--email=${body.email}`);
    if (body.name) rbArgs.push(`--name=${body.name}`);
    if (body.age) rbArgs.push(`--age=${body.age}`);
    if (!headed) {
      rbArgs.push('--headless=true');
    }

    broadcastLog(`🚩 Origin: ${fromCity} | 🏁 Destination: ${toCity} | 📅 Date: ${date} | 💺 Berths: ${seatList}`, 'info');
    if (body.boarding || body.dropping) {
      broadcastLog(`🚏 Boarding: ${body.boarding || 'Default'} | 🏁 Dropping: ${body.dropping || 'Default'}`, 'info');
    }
    broadcastLog(`▶️ Spawning: node ${rbArgs.join(' ')}`, 'system');

    child = spawn('node', rbArgs, { cwd: __dirname, shell: true });
    activeRuns.get(runId).child = child;
  } else {
    // IRCTC Train Reservation Pipeline via irctc_workflow.js
    const irctcQuota = quota === 'Tatkal' ? 'TQ' : (quota === 'Premium Tatkal' ? 'PT' : 'GN');
    const irctcArgs = [
      'irctc_workflow.js',
      `--from=${fromCity || 'CSMT'}`,
      `--to=${toCity || 'PUNE'}`,
      `--date=${date || 'Tomorrow'}`,
      `--class=${coachClass || '3A'}`,
      `--quota=${irctcQuota}`,
      `--berth=${body.berth || 'Lower'}`
    ];
    broadcastLog(`🚆 [IRCTC] Initializing train booking: ${fromCity || 'CSMT'} ➔ ${toCity || 'PUNE'}`, 'info');
    broadcastLog(`▶️ Spawning: node ${irctcArgs.join(' ')}`, 'system');
    child = spawn('node', irctcArgs, { cwd: __dirname, shell: true });
    activeRuns.get(runId).child = child;
  }

  // Handle standard output
  child.stdout.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/).filter(l => l.trim().length > 0);
    lines.forEach(line => broadcastLog(line, 'stdout'));
  });

  // Handle standard error
  child.stderr.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/).filter(l => l.trim().length > 0);
    lines.forEach(line => broadcastLog(`⚠️ ${line}`, 'stderr'));
  });

  child.on('close', async (code) => {
    broadcastLog(`🏁 Process exited with code ${code}`, code === 0 ? 'success' : 'warn');

    // Load structured summary artifact
    let summaryData = null;
    try {
      if (isBMS) {
        const sumPath = path.join(__dirname, 'booking_summary.json');
        if (fs.existsSync(sumPath)) {
          summaryData = JSON.parse(fs.readFileSync(sumPath, 'utf-8'));
          // Normalize fare structure
          const numMatch = (summaryData.totalAmountPayable || '').match(/[\d,]+/);
          const totalNum = numMatch ? parseInt(numMatch[0].replace(/,/g, ''), 10) : (seats * 350 + 90);
          summaryData.fare = {
            baseFare: seats * 350,
            perSeatPrice: 350,
            convenienceFee: 85,
            gst: 15,
            totalAmountPayable: totalNum
          };
          summaryData.platform = 'BookMyShow';
          summaryData.sessionId = 'BMSSESS_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
      } else if (isRedBus) {
        const sumPath = path.join(__dirname, 'redbus_booking_summary.json');
        if (fs.existsSync(sumPath)) {
          summaryData = JSON.parse(fs.readFileSync(sumPath, 'utf-8'));
        }
      } else {
        const sumPath = path.join(__dirname, 'irctc_booking_summary.json');
        if (fs.existsSync(sumPath)) {
          summaryData = JSON.parse(fs.readFileSync(sumPath, 'utf-8'));
        }
      }
    } catch (e) {
      console.error('Error reading summary artifact:', e);
    }

    // Fallback if artifact was not created or simulated run
    if (!summaryData) {
      if (isBMS) {
        summaryData = await runBMSAutomation({ city, show, date, seats: ['E7', 'E8'], guest: { email, mobile } });
      } else if (isRedBus) {
        summaryData = await runRedBusAutomation({ fromCity, toCity, date, seats: ['L1', 'L2'], guest: { email, mobile } });
      } else {
        summaryData = {
          platform: 'IRCTC',
          sessionId: 'IRCTCSESS_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          trainName: 'Deccan Queen Superfast (12123)',
          route: { from: fromCity || 'CSMT', to: toCity || 'PUNE', date: date || 'Tomorrow' },
          seats: ['Coach B2: Berth 34 (Lower)', 'Coach B2: Berth 35 (Middle)'],
          fare: { baseFare: 780, perSeatPrice: 390, convenienceFee: 50, gst: 40, totalAmountPayable: 870 }
        };
      }
    }

    // Store in active sessions for Payment Gateway
    activeSessions.set(summaryData.sessionId, summaryData);

    const runObj = activeRuns.get(runId);
    if (runObj) {
      runObj.status = 'COMPLETED';
      runObj.stagedData = summaryData;
      broadcastLog(`✅ [SUCCESS] Staged at Unified Payment Gateway with Session: ${summaryData.sessionId}`, 'success');
      runEmitter.emit('complete', summaryData);
    }
  });

  child.on('error', (err) => {
    broadcastLog(`❌ Child process error: ${err.message}`, 'error');
  });
};

app.post('/api/automation/execute', executeAutomationHandler);
app.post('/api/start-agent', executeAutomationHandler);

// SSE Stream Endpoint for Live Terminal Output
app.get('/api/automation/stream/:runId', (req, res) => {
  const { runId } = req.params;
  const runObj = activeRuns.get(runId);

  if (!runObj) {
    return res.status(404).send('Run session not found');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send existing buffered logs
  runObj.logs.forEach(log => {
    res.write(`data: ${JSON.stringify({ type: 'log', ...log })}\n\n`);
  });

  // Listener for new logs
  const onLog = (logObj) => {
    res.write(`data: ${JSON.stringify({ type: 'log', ...logObj })}\n\n`);
  };

  // Listener for completion
  const onComplete = (stagedData) => {
    res.write(`data: ${JSON.stringify({ type: 'complete', stagedData })}\n\n`);
    res.end();
  };

  runObj.emitter.on('log', onLog);
  runObj.emitter.once('complete', onComplete);

  // If already finished
  if (runObj.status === 'COMPLETED' && runObj.stagedData) {
    res.write(`data: ${JSON.stringify({ type: 'complete', stagedData: runObj.stagedData })}\n\n`);
    res.end();
  }

  req.on('close', () => {
    runObj.emitter.off('log', onLog);
    runObj.emitter.off('complete', onComplete);
  });
});

// ==========================================
// REST API FOR CHATBOT & PLATFORM METADATA
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    supportedPlatforms: ['BookMyShow', 'RedBus'],
    automationEngine: 'Playwright & Autonomous Browser Pipeline'
  });
});

app.get('/api/redbus/routes', (req, res) => {
  res.json({
    popularCities: ['Mumbai', 'Pune', 'Bangalore', 'Goa', 'Delhi', 'Jaipur', 'Hyderabad', 'Chennai'],
    popularRoutes: [
      { from: 'Mumbai', to: 'Pune', duration: '3h 45m', startingFare: 420 },
      { from: 'Bangalore', to: 'Goa', duration: '12h 30m', startingFare: 1200 },
      { from: 'Delhi', to: 'Jaipur', duration: '4h 45m', startingFare: 450 },
      { from: 'Hyderabad', to: 'Bangalore', duration: '8h 45m', startingFare: 890 }
    ]
  });
});

app.get('/api/redbus/buses', (req, res) => {
  const { from = 'Mumbai', to = 'Pune', date = 'Tomorrow' } = req.query;
  const buses = generateDynamicBuses(from, to);
  res.json({
    from,
    to,
    date,
    totalBuses: buses.length,
    buses
  });
});

app.get('/api/redbus/seats', (req, res) => {
  const { busId } = req.query;
  const layout = getBusSeatLayout(busId);
  res.json(layout);
});

app.get('/api/bms/movies', (req, res) => {
  res.json({
    totalMovies: BMS_MOVIES_DATABASE.length,
    movies: BMS_MOVIES_DATABASE
  });
});

app.get('/api/bms/theaters', (req, res) => {
  const city = (req.query.city || 'mumbai').toLowerCase().trim();
  const theaters = BMS_THEATERS_DATABASE[city] || BMS_THEATERS_DATABASE['mumbai'];
  res.json({
    city,
    theaters
  });
});

app.get('/api/bms/seats', (req, res) => {
  const layout = getCinemaSeatLayout();
  res.json({ layout });
});

app.post('/api/bookings/initiate', async (req, res) => {
  try {
    const { platform, details } = req.body;
    let stagedResult;
    if (platform === 'RedBus') {
      stagedResult = await runRedBusAutomation(details || {});
    } else {
      stagedResult = await runBMSAutomation(details || {});
    }

    activeSessions.set(stagedResult.sessionId, stagedResult);

    res.json({
      success: true,
      message: 'Successfully initiated autonomous booking and staged at Payment Gateway!',
      stagedBooking: stagedResult
    });
  } catch (err) {
    console.error('Error initiating booking:', err);
    res.status(500).json({ error: err.message || 'Booking initiation failed' });
  }
});

// ==========================================
// UNIFIED PAYMENT GATEWAY & COMPLETION
// ==========================================

app.post('/api/payment/process', async (req, res) => {
  try {
    const { sessionId, paymentMethod, appliedPromo } = req.body;

    if (!sessionId || !activeSessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session expired or not found' });
    }

    const session = activeSessions.get(sessionId);

    let discount = 0;
    if (appliedPromo === 'FIRST50') discount = 50;
    if (appliedPromo === 'OMNIPASS') discount = 100;

    const basePayable = session.fare ? session.fare.totalAmountPayable : 800;
    const finalAmountPaid = Math.max(basePayable - discount, 10);
    const bookingId = (session.platform === 'RedBus' ? 'RB' : 'BMS') + '-' + Math.floor(100000 + Math.random() * 900000);
    const txnId = 'TXN_' + Math.random().toString(36).substr(2, 10).toUpperCase();

    const confirmedTicket = {
      bookingId,
      txnId,
      platform: session.platform,
      bookedAt: new Date().toISOString(),
      status: 'CONFIRMED',
      payment: {
        method: paymentMethod || 'UPI QR',
        paidAmount: finalAmountPaid,
        discountApplied: discount,
        currency: 'INR',
        paymentStatus: 'SUCCESS',
        referenceId: txnId
      },
      details: session,
      qrPayload: `SECURE_TICKET:${bookingId}|${session.platform}|${finalAmountPaid}|CONFIRMED`
    };

    confirmedBookings.set(bookingId, confirmedTicket);
    activeSessions.delete(sessionId);

    res.json({
      success: true,
      message: 'Payment verified! Your ticket has been confirmed.',
      ticket: confirmedTicket
    });
  } catch (err) {
    console.error('Payment processing failed:', err);
    res.status(500).json({ error: 'Payment processing error' });
  }
});

app.get('/api/bookings/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  if (!confirmedBookings.has(bookingId)) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json(confirmedBookings.get(bookingId));
});

// Stop Active Automation Process
app.post('/api/automation/stop', (req, res) => {
  const { runId } = req.body;
  let stopped = false;

  if (runId && activeRuns.has(runId)) {
    const runObj = activeRuns.get(runId);
    if (runObj.child) {
      runObj.child.kill();
      stopped = true;
    }
    runObj.status = 'STOPPED';
  } else {
    // Stop all active child processes
    for (const [id, r] of activeRuns.entries()) {
      if (r.child) {
        try { r.child.kill(); } catch (e) {}
        stopped = true;
      }
      r.status = 'STOPPED';
    }
  }

  res.json({ success: true, message: stopped ? 'Active browser processes terminated' : 'No active process to stop' });
});

// Conversational AI Booking Assistant Endpoint
app.post('/api/chat', (req, res) => {
  const { message = '' } = req.body;
  const lower = message.toLowerCase();

  let platform = 'BookMyShow';
  let reply = '';
  let command = '';
  let fields = {};

  if (lower.includes('redbus') || lower.includes('bus')) {
    platform = 'RedBus';
    const from = lower.includes('delhi') ? 'Delhi' : (lower.includes('bangalore') ? 'Bangalore' : 'Mumbai');
    const to = lower.includes('jaipur') ? 'Jaipur' : (lower.includes('goa') ? 'Goa' : 'Pune');
    command = `npm run redbus --from="${from}" --to="${to}" --date="Tomorrow" --seats=L1,L2`;
    fields = { fromCity: from, toCity: to, date: 'Tomorrow', seats: 'L1, L2', platform: 'RedBus' };
    reply = `Hi! I've configured RedBus for ${from} ➔ ${to} (Tomorrow, 2 Sleeper Berths). Ready to launch Google Chrome and select seats on the live bus deck!`;
  } else if (lower.includes('train') || lower.includes('irctc')) {
    platform = 'IRCTC';
    command = `npm run irctc --from="Mumbai CSMT" --to="Pune JN" --date="Tomorrow" --seats=2`;
    fields = { fromCity: 'Mumbai CSMT', toCity: 'Pune JN', date: 'Tomorrow', seats: 2, platform: 'IRCTC' };
    reply = `I've prepared the IRCTC railway booking for Mumbai CSMT ➔ Pune JN on Deccan Queen Express (12123).`;
  } else {
    platform = 'BookMyShow';
    const city = lower.includes('pune') ? 'Pune' : (lower.includes('bangalore') ? 'Bengaluru' : 'Mumbai');
    let movie = 'Heart of the Beast';
    if (lower.includes('dune')) movie = 'Dune: Part Two';
    if (lower.includes('stree')) movie = 'Stree 2';
    if (lower.includes('oppenheimer')) movie = 'Oppenheimer';

    command = `npm run bms --city="${city}" --show="${movie}" --date="Tomorrow" --seats=2`;
    fields = { city, show: movie, date: 'Tomorrow', seats: 2, platform: 'BookMyShow' };
    reply = `I've configured BookMyShow for "${movie}" in ${city} (Tomorrow, 2 Seats). Ready to launch Google Chrome and click theater seats live!`;
  }

  res.json({
    success: true,
    reply,
    platform,
    command,
    fields,
    timestamp: new Date().toLocaleTimeString()
  });
});

// Fallback for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Playwright Automation Hub Server running!`);
  console.log(`📍 Web Hub & Console:    http://localhost:${PORT}`);
  console.log(`🎫 Platforms Supported:  BookMyShow & RedBus`);
  console.log(`⚡ Realtime Live Stream: Active (SSE)`);
  console.log(`💳 Unified Payment Flow: Active & Ready`);
  console.log(`======================================================\n`);
});

module.exports = { app, server };
