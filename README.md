# Autonomous Ticket Agent - Browser Automation Suite

A multi-platform autonomous browser automation and live execution platform built with **Playwright**, **Node.js**, and an **Express / Server-Sent Events (SSE)** backend. 

It provides an interactive three-column workspace matching the **Antigravity Browser Automation Suite** design:
1. **AI Chatbot & input agent panel**: An AI booking assistant paired with direct input cards for **RedBus**, **BookMyShow**, and **IRCTC**.
2. **Task Manager & Run Status**: Command executors showing CLI triggers (`npm run redbus`, `npm run bms`), real-time status chips (`Ready`, `Parsing Seats`, `Connecting to Remote Chrome Instance...`, `States Validation...`), and a live terminal console.
3. **Remote Browser Viewports**: Amber-bordered multi-stream grid displaying real-time browser viewports with callout overlays (`Extracting seat maps live`, `Applying criteria & passenger list`), animated seat maps, and staged payment screens.

---

## 🚀 Running Live on Real Google Chrome

Both **BookMyShow** and **RedBus** execute in **headed Google Chrome** on your desktop, with:
- **Stealth Configuration**: Flags and anti-detection headers to prevent bot blocking.
- **Visual Cursor Pointer Follower**: A glowing cursor injected via `page.addInitScript()` so you can watch Playwright navigate, glide smoothly across the screen, and click seats with ripple highlights.
- **slowMo Visibility**: Paced actions (`slowMo: 350`) allowing human observation of seat selection, dates, and checkout staging.
- **Payment Staging Persistence**: Google Chrome remains open for 90 seconds upon reaching the final payment options page so you can inspect the real checkout.

---

## 💻 Command Palette / CLI Execution

You can run the automations directly from your command palette or terminal:

### 1. Run RedBus Automation Live:
```bash
npm run redbus --from="Mumbai" --to="Pune" --date="Tomorrow" --seats=L1,L2
```
*Navigates to RedBus, selects travel date, clicks "View seats" on the primary bus, visually targets and clicks available sleeper berths on deck, proceeds through boarding points, and stages the booking session.*

### 2. Run BookMyShow Automation Live:
```bash
npm run bms --city="Mumbai" --show="Heart of the Beast" --date="Tomorrow" --seats=2
```
*Navigates to BookMyShow, selects city, searches for the movie, selects 2D format, filters showtimes, selects adjacent seats on the Konva canvas, enters guest details, and stages at the payment page.*

---

## 🌐 Web Application Hub

### Start the Suite Server:
```bash
npm start
```
Open your browser and visit:
👉 **`http://localhost:3000`**

### Features:
- **Global Control Panels**: `▶ Start` (launches live automation in Chrome) and `⏹ Stop` (terminates active browser processes).
- **Conversational Assistant**: Chat with the autonomous assistant (e.g. *"book redbus from mumbai to pune for tomorrow"*), and it will automatically configure the cards and prepare the CLI execution.
- **Live Remote Viewports**: Four concurrent viewport displays simulating bus deck layouts, cinema seat matrices, passenger lists, and train forms.
- **Unified Payment Gateway**: 256-bit SSL encrypted staging checkout supporting UPI QR code scanning, Debit/Credit Cards, Net Banking, and instant E-Ticket generation.
- **Dual Theme Engine**: One-click toggle between sleek dark mode (`#0a0e17`) and high-contrast light mode.
