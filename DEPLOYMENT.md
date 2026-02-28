# SaathiCare — Deployment Guide

## Prerequisites

- **Node.js** ≥ 20.x  (`node --version`)
- **npm** ≥ 10.x  (`npm --version`)
- **Python 3** (needed by `better-sqlite3` native build on some systems)
- **C++ Build Tools** (see [Troubleshooting](#9-troubleshooting) if `npm install` fails)

---

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd saathicare
npm install
```

> **Windows users:** If `better-sqlite3` fails during install, run:
> ```powershell
> npm install --global windows-build-tools
> ```
> or install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the "Desktop development with C++" workload.

> **macOS users:** Run `xcode-select --install` if you don't have Xcode CLI tools.

---

## 2. Environment Setup

Copy the included example file:

```bash
cp .env.example .env.local
```

Then fill in your values:

```env
# Required for AI Companion (get from https://aistudio.google.com/apikey)
# Leave blank to use pre-written fallback responses instead of live LLM
GEMINI_API_KEY=your_key_here

# JWT signing secret (change in production!)
JWT_SECRET=saathicare-hackathon-2024

# Socket.io URL (only change if running on a different port)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

> **Note**: The app works **without** `GEMINI_API_KEY` — the AI companion will use warm, pre-written contextual responses instead of live LLM output.

---

## 3. Run Locally (Development)

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### What happens on first boot:

1. A **`saathicare.db`** SQLite file is auto-created in the project root
2. All **17 database tables** are created automatically (users, patient_profiles, schedule_tasks, memory_cards, people_cards, memory_room_objects, qr_scans, chat_messages, internal_messages, journal_entries, medications, medication_logs, health_records, game_sessions, alerts, mood_logs, companion_conversations)
3. **Demo data** is seeded automatically (3 user accounts, full patient profile, 7 schedule tasks, 12 memory flashcards, 6 people, 11 memory-room objects, 5 medications, 5 journal entries, 30 game sessions, 6 alerts, 30 mood logs, 3 health records)
4. The app is **ready to use immediately** — no manual setup needed

---

## 4. Demo Accounts

All accounts use password **`demo123`**

| Role | Name | Email |
|---|---|---|
| **Patient** | Ravi Sharma | `ravi@saathi.care` |
| **Guardian** | Priya Sharma | `priya@saathi.care` |
| **Caretaker** | Nurse Anita | `anita@saathi.care` |

---

## 5. Key URLs

| URL | Purpose |
|---|---|
| `/` | Landing page |
| `/login` | Login with demo accounts |
| `/patient` | Patient dashboard (login as Ravi) |
| `/patient/schedule` | Daily schedule with task completion |
| `/patient/memories` | Memory flashcards |
| `/patient/people` | People wallet |
| `/patient/memory-room` | Interactive memory rooms |
| `/patient/companion` | AI companion chat |
| `/patient/companion/music` | Music therapy |
| `/patient/games` | Cognitive games hub |
| `/patient/games/card_match` | Card Match game |
| `/patient/games/word_recall` | Word Recall game |
| `/patient/games/pattern_tap` | Pattern Tap game |
| `/guardian` | Guardian dashboard (login as Priya) |
| `/guardian/journal` | Caretaker journal entries |
| `/guardian/medications` | Medication management |
| `/guardian/analytics` | Cognitive analytics |
| `/guardian/alerts` | Alert center |
| `/guardian/memory-room` | Memory room management |
| `/caretaker` | Caretaker dashboard (login as Anita) |
| `/caretaker/journal` | Daily journal entry |
| `/caretaker/medications` | Medication administration |
| `/scan/ravi-sharma-2024` | Public QR scan page (no login needed) |

---

## 6. Backend API Endpoints

All API routes live under `/api/`. Authentication uses JWT Bearer tokens.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login (email, password, role) → JWT token |
| `GET` | `/api/auth/me` | Get current user from token |
| `GET` | `/api/schedule` | Today's schedule tasks |
| `PUT` | `/api/schedule` | Toggle task completion |
| `GET` | `/api/memories` | Memory flashcards |
| `PUT` | `/api/memories` | Log recall attempt |
| `GET` | `/api/people` | People wallet cards |
| `GET` | `/api/memory-room?room=kitchen` | Memory room objects (optionally filtered by room) |
| `GET` | `/api/medications` | Active medications + today's logs |
| `POST` | `/api/medications` | Log medication administered |
| `GET` | `/api/journal` | Journal entries (last 30) |
| `POST` | `/api/journal` | Create journal entry |
| `GET` | `/api/games` | Game sessions, streak, avg score |
| `POST` | `/api/games` | Log a game session |
| `GET` | `/api/alerts` | Recent alerts |
| `PUT` | `/api/alerts` | Mark alert as read |
| `GET` | `/api/analytics` | Full analytics dashboard data |
| `GET` | `/api/mood` | Mood logs |
| `POST` | `/api/mood` | Log a mood |
| `GET` | `/api/health` | Health records |
| `GET` | `/api/qr` | QR code data + scan history |
| `GET` | `/api/scan/:token` | Public scan endpoint (no auth) |
| `GET` | `/api/stage` | Care stage config |
| `PUT` | `/api/stage` | Update care stage |
| `POST` | `/api/companion/chat` | AI companion chat |

---

## 7. Production Build

```bash
npm run build
npm start
```

The app will run on **port 3000** by default. To change:

```bash
PORT=8080 npm start
```

> **Important**: The `next.config.ts` includes `serverExternalPackages: ['better-sqlite3']` to ensure the native SQLite module is not bundled by webpack and loads correctly in production.

---

## 8. Data Persistence

- **Database**: `saathicare.db` (SQLite, auto-created in project root)
- **Uploaded files**: `./public/uploads/` directory
- **To reset all data**: Delete `saathicare.db` and restart the server — it will re-create and re-seed automatically

---

## 9. Deployment Options

### Option A: Local Demo (Recommended for Hackathon)

Just run `npm run dev` on the demo machine. No deployment needed.

### Option B: VPS / Cloud VM (DigitalOcean, AWS EC2, etc.)

```bash
# 1. SSH into your server
ssh user@your-server

# 2. Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install build essentials for better-sqlite3
sudo apt-get install -y build-essential python3

# 4. Clone and install
git clone <your-repo-url>
cd saathicare
npm install

# 5. Set environment variables
cp .env.example .env.local
nano .env.local  # fill in values

# 6. Build and run
npm run build
npm start

# 7. (Optional) Use PM2 for process management
npm install -g pm2
pm2 start npm --name saathicare -- start
pm2 save
pm2 startup
```

### Option C: Railway / Render

1. Connect your GitHub repo in the dashboard
2. Set environment variables (`JWT_SECRET`, `GEMINI_API_KEY`)
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. SQLite works on these platforms since they provide persistent disk storage

### Option D: Vercel

> **⚠ Warning**: SQLite (`better-sqlite3`) does **not** work on Vercel's serverless/edge functions because they don't have a writable filesystem. For Vercel deployment, you would need to replace SQLite with a hosted database (Supabase, PlanetScale, Neon, etc.). **This is NOT recommended for the hackathon demo.**

---

## 10. Troubleshooting

| Issue | Fix |
|---|---|
| `better-sqlite3` build error on Windows | Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with "Desktop development with C++" workload, then `npm rebuild better-sqlite3` |
| `better-sqlite3` build error on macOS | Run `xcode-select --install`, then `npm rebuild better-sqlite3` |
| `better-sqlite3` build error on Linux | Run `sudo apt-get install -y build-essential python3`, then `npm rebuild better-sqlite3` |
| Port 3000 in use | `PORT=3001 npm run dev` (Linux/macOS) or `set PORT=3001 && npm run dev` (Windows) |
| Database locked | Stop all running instances of the app, delete `saathicare.db`, restart |
| Gemini API errors | Check `GEMINI_API_KEY` in `.env.local`. App gracefully falls back to warm pre-written responses if the key is missing or invalid |
| Blank pages after login | Clear localStorage: run `localStorage.clear()` in browser console, then refresh |
| `MODULE_NOT_FOUND: better-sqlite3` in production | Ensure `next.config.ts` contains `serverExternalPackages: ['better-sqlite3']` and re-run `npm run build` |
| TypeScript errors during build | Run `npx tsc --noEmit` to see errors, fix them, then `npm run build` |

---

## 11. Database Schema Overview

The SQLite database (`saathicare.db`) contains **17 tables**:

| Table | Purpose |
|---|---|
| `users` | All user accounts (patient, guardian, caretaker) |
| `patient_profiles` | Extended patient info, QR token, care stage |
| `guardian_patient` | Guardian ↔ Patient relationships |
| `caretaker_patient` | Caretaker ↔ Patient relationships |
| `schedule_tasks` | Daily schedule with task completion tracking |
| `memory_cards` | Memory flashcards with recall statistics |
| `people_cards` | People wallet (family, doctors, caretakers) |
| `memory_room_objects` | Interactive objects placed in virtual rooms |
| `qr_scans` | Log of all QR code scans |
| `chat_messages` | Good Samaritan chat messages |
| `internal_messages` | Internal messaging between users |
| `journal_entries` | Caretaker daily journal entries |
| `medications` | Medication list for patient |
| `medication_logs` | Medication administration log |
| `health_records` | Medical records, lab reports, prescriptions |
| `game_sessions` | Cognitive game results and scores |
| `alerts` | System alerts (medication missed, mood changes, etc.) |
| `mood_logs` | Patient mood tracking |
| `companion_conversations` | AI companion conversation history |

All tables use `TEXT` primary keys (UUIDs) and `INTEGER` timestamps (Unix epoch). Foreign keys are enforced via `PRAGMA foreign_keys = ON`.
