# SaathiCare — Deployment Guide

## Prerequisites

- **Node.js** ≥ 20.x (`node --version`)
- **npm** ≥ 10.x (`npm --version`)
- Terminal / Command Prompt / PowerShell

---

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd saathicare
npm install
```

---

## 2. Environment Setup

Create `.env.local` in the project root (or copy the included one):

```env
# Required for AI Companion (get from https://aistudio.google.com/apikey)
GEMINI_API_KEY=your_key_here

# JWT signing secret (change in production)
JWT_SECRET=saathicare-hackathon-2024

# Socket.io URL (only change if running on a different port)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

> **Note**: The app works without `GEMINI_API_KEY` — the AI companion will use pre-written warm fallback responses instead of live LLM responses.

---

## 3. Run Locally (Development)

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### What happens on first boot:
1. A `saathicare.db` SQLite file is auto-created in the project root
2. All 17 database tables are created automatically
3. Demo data is seeded (3 users, patient profile, schedules, memories, etc.)
4. The app is ready to use immediately

---

## 4. Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Patient** (Ravi Sharma) | `ravi@saathi.care` | `demo123` |
| **Guardian** (Priya Sharma) | `priya@saathi.care` | `demo123` |
| **Caretaker** (Nurse Anita) | `anita@saathi.care` | `demo123` |

---

## 5. Key URLs

| URL | Purpose |
|---|---|
| `/` | Landing page |
| `/login` | Login with demo accounts |
| `/patient` | Patient dashboard (login as Ravi) |
| `/patient/companion` | AI Companion chat |
| `/guardian` | Guardian dashboard (login as Priya) |
| `/caretaker` | Caretaker dashboard (login as Anita) |
| `/scan/ravi-sharma-2024` | Public QR scan page (no login needed) |

---

## 6. Production Build

```bash
npm run build
npm start
```

The app will run on port 3000 by default.

---

## 7. Data Persistence

- Database: `saathicare.db` (SQLite, auto-created in project root)
- Uploaded files: `./public/uploads/` directory
- To **reset all data**: delete `saathicare.db` and restart the server

---

## 8. Deployment Options

### Option A: Local Demo (Recommended for Hackathon)
Just run `npm run dev` on the demo machine. No deployment needed.

### Option B: VPS / Cloud VM
1. SSH into your server
2. Clone the repo, install dependencies
3. Set environment variables
4. Run `npm run build && npm start`
5. Use PM2 for process management: `pm2 start npm --name saathicare -- start`

### Option C: Vercel
```bash
npm i -g vercel
vercel --prod
```
> **Note**: SQLite won't work on Vercel's serverless functions. For Vercel deployment, you'd need to switch to a hosted database (Supabase, PlanetScale, etc.).

### Option D: Railway / Render
1. Connect your GitHub repo
2. Set environment variables in the dashboard
3. SQLite works on these platforms since they provide persistent storage

---

## 9. Troubleshooting

| Issue | Fix |
|---|---|
| `better-sqlite3` build error | Install build tools: `npm install --global windows-build-tools` (Windows) or `xcode-select --install` (macOS) |
| Port 3000 in use | Set `PORT=3001 npm run dev` |
| Database locked | Stop other instances of the app, delete `saathicare.db`, restart |
| Gemini API errors | Check `GEMINI_API_KEY` in `.env.local`. App falls back to warm responses if key is invalid. |
| Blank pages after login | Clear localStorage (`localStorage.clear()` in browser console) |
