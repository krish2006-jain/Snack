# SaathiCare: How It Works (Simple Architecture Guide)

*This document explains the complex technical architecture of the SaathiCare platform in simple, easy-to-understand terms.*

---

## 1. The Core Infrastructure (The Foundation)
SaathiCare is built as a single, powerful web application using **Next.js** and **React**. 
Think of this as an apartment building where everyone lives under one roof, but they each have their own customized floor.

* **The Database (SQLite + Drizzle):** Like a deeply organized file cabinet, we keep everybody's information completely separated. A robust local database securely stores the patient's medical records, their daily schedule, their family members ("People Wallet"), and the caretaker's daily behavior logs.

## 2. The Three User Dashboards (The Custom Floors)
Instead of forcing everyone to use the same complicated screen, SaathiCare creates customized views for the three active roles in a dementia patient's life:

1. **The Patient Dashboard:** Radically simplified. Big buttons, high contrast, and no confusing menus. It features games, tasks, and the voice AI.
2. **The Caretaker Dashboard:** Operational and list-based. This is for the nurse or helper inside the house to quickly check off pills and meals, and log the patient's health instantly.
3. **The Guardian Dashboard:** An analytical command center. This is for the distant son or daughter to look at big-picture data (like the Cognitive Health Score graph) and to remotely add photos or songs for the patient to see.

## 3. The "Agentic AI" Brains (Lyzr Integrations)
Instead of using one generic AI (like standard ChatGPT), SaathiCare employs specialized, highly-trained **Lyzr AI Agents** that act as experts for specific tasks.

### A. The Memory Companion (SmritiSaathi)
When the patient talks to their 3D Avatar, they aren't just talking to a blank slate.
* **Dynamic Context Injection:** Every time the patient speaks, the system silently grabs their family tree (The "People Wallet") and recent memories from the database. It attaches this private knowledge to the patient's message.
* **The Result:** The AI knows that the patient's daughter is named Priya and that her son is Aarav. When the patient is confused, the AI can comfort them by referencing real memories ("Remember when Priya visited yesterday?").

### B. The Multilingual Engine (BolSaathi)
* **Auto-Translation:** If a patient stops speaking English and switches to Hindi or Marathi, the AI detects it and immediately replies in that exact language. 
* **Smart Voice Routing:** The web app explicitly looks for Hindi/Marathi letters in the AI's response (Devanagari script). If it sees them, it overrides your device's default English voice and selects an Indian voice (`hi-IN`), so it actually sounds like native Hindi rather than a broken robot.

### C. The Emergency Medical AI
When a stranger scans the QR code, they get to talk to an AI that *already knows* the patient's medical chart. If the stranger describes symptoms, the AI analyzes the patient's known allergies and medications to provide immediate, safe, first-aid advice.

## 4. The Interactive Hardware & Sensors (Web APIs)
The application doesn't just display text; it listens and looks around securely through the browser:

* **Voice & Hearing (Speech APIs):** We use modern Web Speech interfaces to listen to the patient's microphone and convert it to text (`Speech-to-Text`), and then read the AI's response out loud (`Text-to-Speech`). We use specialized algorithms to make the 3D Avatar lip-sync perfectly to the generated audio words.
* **Emotion Detection Logic:** We analyze the sentiment of the AI's response (e.g., is the topic "happy", "nostalgic", "sad"). The 3D avatar dynamically changes its facial expression and plays body animations to match what it is talking about, providing an empathetic visual cue.
* **Live Mapping (Leaflet):** On the Good Samaritan scanner page, we use GPS APIs to plot the stranger's exact real-world location on an interactive map alongside the patient's registered home address.
