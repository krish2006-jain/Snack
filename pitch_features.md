# SaathiCare: Pitch Deck Features Guide

This document outlines the core, high-impact features of **SaathiCare** to highlight during your hackathon presentation or pitch. These features demonstrate technical complexity, deep user empathy, and real-world viability for dementia and Alzheimer's care.

---

## 1. SmritiSaathi: The Context-Aware Memory Companion 🧠
*The crown jewel of the platform—an emotionally intelligent 3D avatar that acts as a 24/7 companion.*
* **People Wallet Integration:** The AI dynamically injects the patient's real family tree, personal history, and specific memories (from the database) into its context window. It uses this to ground the patient back in reality when they feel confused or anxious.
* **Bi-Directional Emotion Detection:** The 3D model doesn't just read text; it analyzes the emotional sentiment of the generated response and physically animates its facial expressions and body language (e.g., smiling warmly, acting concerned) to match.
* **Voice-First Design:** Patients don't need to type. A "tap to wake" interface allows natural, spoken conversations.

## 2. BolSaathi: Seamless Multilingual Engine 🇮🇳
*Breaking language barriers for elderly users who often revert to their mother tongue.*
* **Auto-Language Detection:** The LLM agent automatically detects if the patient is speaking English, Hindi, or Marathi, and seamlessly replies in the exact same language without requiring any manual toggles or UI settings.
* **Smart TTS Routing:** The frontend browser engine actively scans the AI's output for Devanagari script (`\u0900-\u097F`). If detected, it overrides the device's default English voice and forces a native Indian voice (like `hi-IN` or `mr-IN`), ensuring proper cultural pronunciation and avoiding robotic-sounding distortions.

## 3. Good Samaritan Emergency Protocol 🚨
*A life-saving safety net for wandering (elopement) risks.*
* **Instant Stranger Access ID:** Patients wear a simple QR code (bracelet/lanyard). When scanned by a stranger, it opens a secure, minimal web app—no app download required.
* **Medical Analysis AI:** Strangers can converse with a specialized AI agent trained on the patient's medical chart (allergies, diabetes, Alzheimer's stage) to get immediate instructions on what to do while waiting for help.
* **Live Geo-Location Match:** Strangers can see an interactive map comparing their current live location with the patient's recorded home address to help guide them back.

## 4. Nostalgia Radio & Cognitive Design 🎶
*Tailored UI and therapeutic features.*
* **Music Therapy:** Caregivers can remotely manage and inject era-appropriate songs (e.g., 1960s Lata Mangeshkar, 70s Kishore Kumar) into the patient's Nostalgia Radio. Music has been clinically proven to reduce "sundowning" agitation in dementia patients.
* **Dementia-Friendly UI:** The patient interface explicitly avoids complex menus. It uses massive touch targets, distinct pill shapes, high-contrast layouts, and icon-driven UX (no confusing hamburger menus or nested settings).

## 5. Tri-Role Care Architecture 👨‍👩‍👦
*A holistic ecosystem that syncs the entire care network.*
* **Patient Dashboard:** Simplified, calming, and focused on current tasks, brain games, and therapeutic memories.
* **Caretaker Dashboard:** Optimized for the hired nurse or daily helper. Features quick task check-offs (medication tracking, meals) and immediate contact arrays.
* **Guardian Dashboard:** Optimized for the distant family member (e.g., a son in another city). Features high-level analytics, AI-generated Cognitive Trend Scores, and the ability to remotely curate the *People Wallet* and *Nostalgia Radio*.

## 6. The "Memory Room" 🕰️
*Virtual reminiscence therapy.*
* An immersive digital space where familiar, beloved objects (like an old wedding photo from Varanasi, or a favorite chai cup) are stored. 
* Exploring these items triggers recorded voice notes or stories from family members, actively stimulating the patient's hippocampus and long-term memory retrieval.
