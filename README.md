# Onyx Chatter Scheduler

Scheduling tool for the chat team: manage chatters, auto-generate schedules (with shift/days-off/SPH rules), edit slots, and handle time-off requests with email notification and auto-replacement.

## Features

- **Chatters**: Add/remove chatters; set preferred shifts (12am–8am, 8am–4pm, 4pm–12am CST), preferred days off, SPH (sales per hour), and group (VIP / Mid / Pitching). Update SPH weekly as needed.
- **Schedule rules**:
  - **Shift 1 (12am–8am)**: 1 person per day; best accounts.
  - **Shift 2 (8am–4pm)** and **Shift 3 (4pm–12am)**: 3 chatters per day, one per group (VIP, Mid, Pitching).
  - SPH: below $10 → fewer hours; below $25 → less; $25–$30 normal; above $30 → more hours.
- **Auto-generate**: On the **20th** generate for **1st–15th** of the following month; on the **7th** generate for **16th–end of month**. You can also generate a custom date range.
- **Edit schedule**: Change who is on any slot (e.g. after manual time-off or swaps).
- **Time off**: Employee submits request → email sent to **zee@onyxspire.com** → you approve or deny. If approved, the app finds a replacement for affected slots using the same rules.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Seed initial chatters (Adebayo, Sheila, Yorkshare, Mary, Mae, Monah, Jenny, Akans, Owen, Life). After starting the app, open **Chatters** and click **Seed chatters** (or `POST /api/seed`). Or run: `npx tsx scripts/seed-chatters.ts`
3. (Optional) Email on time-off submission: set **Resend** API key and from address:
   - Create `.env.local` in the project root:
     ```
     RESEND_API_KEY=re_xxxx
     EMAIL_FROM=Onyx Scheduler <notifications@yourdomain.com>
     ```
   - Without this, time-off requests still save; only the email is skipped.
4. Run the app:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Data

- All data is stored under the `data/` folder as JSON (`chatters.json`, `schedules.json`, `timeoff.json`). No database required when running locally.
- **GitHub & Vercel:** See [DEPLOY.md](DEPLOY.md) for pushing to GitHub and deploying to Vercel. Note: file-based storage does not persist on Vercel; use locally or add a database for production.

## Pages

- **Dashboard** (`/`): Overview and quick links.
- **Chatters** (`/chatters`): Table of chatters; add, edit, remove; update preferred shifts, days off, SPH, group, fill-in-only.
- **Schedule** (`/schedule`): Generate schedule (auto or custom range), view by date, edit any slot.
- **Time off** (`/time-off`): Submit request (employee); list all requests and approve/deny (admin). Email goes to zee@onyxspire.com on submit.
