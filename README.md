# SaathiCare

**Comprehensive Alzheimer's care management platform** built for patients, guardians, and caretakers.

SaathiCare provides a unified ecosystem that adapts content and interaction complexity based on the patient's cognitive stage (early / moderate / severe). It includes AI-powered companion chat, cognitive games, memory-room therapy, daily scheduling, medication tracking, and a QR-based Good Samaritan system for patient safety.

---

## Live Deployment

🚀 We have deployed SaathiCare here: **[https://snack-production-ca02.up.railway.app/](https://snack-production-ca02.up.railway.app/)**

---

## Quick Start (Run Locally)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local   # fill in optional GEMINI_API_KEY

# 3. Start the development server (runs database seed automatically)
npm run dev                   # → http://localhost:3000
```

Login with any demo account (password: `demo123`):
- **Patient**: `ravi@saathi.care`
- **Guardian**: `priya@saathi.care`
- **Caretaker**: `anita@saathi.care`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | SQLite via `better-sqlite3` |
| Auth | JWT (jose + bcryptjs) |
| AI | Google Gemini 1.5 Flash (with warm fallbacks) |
| State | Zustand |
| UI Icons | Lucide React |

---

## Features

- 🏠 **Role-based dashboards** — Patient, Guardian, Caretaker
- 🧠 **Cognitive games** — Card Match, Word Recall, Pattern Tap
- 💬 **AI Companion** — Context-aware chat with patient history
- 🎵 **Music Therapy** — Mood logging and calming playlists
- 🖼 **Memory Room** — Interactive room-based memory exercises
- 📋 **Daily Schedule** — Visual task tracking with completion
- 💊 **Medication Management** — Tracking and administration logs
- 📓 **Caretaker Journal** — Daily care documentation
- 📊 **Analytics Dashboard** — Cognitive trends, mood, game streaks
- 🔔 **Alert System** — Medication misses, mood changes, geofence
- 📱 **QR Good Samaritan** — Public safety page via QR scan
- 🗂 **Health Records** — Medical docs, prescriptions, lab reports

---

## Documentation

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full deployment instructions, API reference, database schema, and troubleshooting.
