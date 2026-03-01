# SaathiCare Hardcoded Data Tracker

This document keeps track of all remaining locations in the `src` directory where data is intentionally hardcoded to support the "Ravi Sharma" demo persona.

The core authenticated dashboard loops (Patient, Guardian, Caretaker) have successfully been wired up to dynamic API endpoints and session management. However, several fallback mechanisms and demo-specific data locations remain.

## 1. Core Mock Data Sources `src/lib/mock-data/*`
All files in `src/lib/mock-data/` (`caretaker.ts`, `patient.ts`, `index.ts`) heavily utilize hardcoded personas (Ravi Sharma, Priya Sharma, Nurse Anita).
* **Reason why it remains:** This is an intentional architectural pattern. When users log in with the `isDemo` flag or no database fallback is available, the frontend securely defaults to this rich, populated mock data state.

## 2. Seed File `src/lib/seed.ts`
The database seeding logic explicitly inserts records for "Ravi Sharma" and "Priya Sharma", including their past chats, memories, and performance history.
* **Reason why it remains:** Used selectively in development and for recreating the demo sandbox.

## 3. Companion Prompts `src/lib/companion-fallbacks.ts`
The arrays of offline/fallback conversation prompts are specifically localized to the demo user ('I am here, Ravi', 'Priya called earlier', etc.).
* **Reason why it remains:** Provides an immediate fallback UX for the 3D companion when LLM connectivity fails in demo mode, maintaining the illusion of the persona.

## 4. Public Landing Pages `src/app/page.tsx` & `src/app/layout.tsx`
The primary landing page (`page.tsx`) explicitly tells the story of "When Ravi forgets" and "Supporting Ravi, guided by Priya." The meta `description` in `layout.tsx` is also statically set to this.
* **Reason why it remains:** Marketing and storytelling purposes; this data is not seen inside the authenticated dashboards. 

## 5. Unauthenticated Map / Scanner Pages
The Good Samaritan / Scanner UI (`src/app/scan/[token]/ScanClient.tsx` and the corresponding `/api/scan/[token]/chat/route.ts`) have hardcoded definitions for the emergency contacts and chat responses (e.g., "Priya Sharma").
* **Reason why it remains:** Unauthenticated dynamic routing limits direct DB joins without a robust token resolution mechanism. For the duration of this MVP, the public scan UI defaults to rendering the demo persona.

## 6. Mini Games
The Word Recall game (`src/app/patient/games/word_recall/page.tsx`) features hardcoded dictionaries matching events from Ravi's life ("LIC", "Ajmer", etc.).
* **Reason why it remains:** Procedurally generating mini-games from dynamic JSON wallet contents requires a complete backend ML service to extract keywords. Hardcoded lists provide sufficient fidelity for demonstration.
