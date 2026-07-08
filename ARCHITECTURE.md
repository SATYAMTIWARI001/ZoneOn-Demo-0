# ZoneOn AI System Architecture

This document describes the architectural patterns, modules, and component flows of the ZoneOn AI platform.

---

## 🏗️ Architectural Style

ZoneOn AI utilizes a **Full-Stack Modular Architecture** featuring an Express.js backend coupled with a React + Vite frontend. It is designed around the principles of **high separation of concerns**, **sandbox resilience**, and **strict server-side data proxying**.

---

## 🛰️ Modular Components

### 1. Presentation Tier (Client)
- **Vite & React**: Fast SPA compilation, state managers, and declarative layouts.
- **Framer Motion**: Smooth canvas transitions, responsive drawer overlays, and floating status elements.
- **Tailwind CSS v4**: Utility-first styling targeting mobile, tablet, and desktop viewports seamlessly.

### 2. Business Logic Tier (Server API)
- **Express.js API Routes**: Exposes endpoints for managing incidents, announcements, metrics, weather, and conversational agents.
- **Google Gemini SDK Proxy**: Interacts with Google's generative AI models server-side to isolate credentials and perform incident triage.

### 3. Safety/Accessibility Adapters
- **Safe Speech Bridge (`src/lib/speech.ts`)**: Acts as a resilient wrapper around the Web Speech API. Ensures that browser iframe security sandboxing or lack of audio permissions do not trigger unhandled exceptions.

---

## 🔁 Sequence Flow: Incident Creation and Triage

```
  User / Staff               Frontend                Express API             Google Gemini
      |                         |                         |                         |
      |-- Create Incident ----->|                         |                         |
      |   (Title, Description)  |-- POST /api/incidents ->|                         |
      |                         |                          |-- Triage Request ------>|
      |                         |                          |                         |
      |                         |                          |<-- Severity & Checklist |
      |                         |<-- Created Incident -----|                         |
      |                         |    with AI Details       |                         |
      |<-- Render Heatmap Spot -|                         |                         |
```

1. A staff member or user registers an incident (e.g., "Slippery floor near Gate C").
2. The frontend sends the report payload to `/api/incidents`.
3. The server receives the report, formats the prompt template, and dispatches it to Google Gemini.
4. Gemini returns the predicted category (Medical, Security, Crowd, Facilities, Transit), drafts an official title, classifies severity, and provides emergency checklist actions.
5. The server persists the triaged incident and pushes the response back to the client.
6. The client map updates, rendering an active SOS blinker on the sector.
