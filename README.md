# ⚽ ZoneOn AI (Enterprise-Grade Stadium OS)

[![World Cup 2026](https://img.shields.io/badge/FIFA_World_Cup-2026-blue.svg?style=flat-square&logo=fifa)](https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini API](https://img.shields.io/badge/GenAI-Google_Gemini-orange.svg?style=flat-square&logo=google-gemini)](https://ai.google.dev/)
[![React 18+](https://img.shields.io/badge/Framework-React_18-cyan.svg?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/CSS-Tailwind_v4-38bdf8.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

**ZoneOn AI** is an enterprise-grade Generative AI Stadium Operating System custom-built for the **FIFA World Cup 2026**. Designed to connect and coordinate fans, organizers, volunteers, medical responders, security personnel, transit dispatchers, and accessibility teams, ZoneOn AI uses Google Gemini models and state-of-the-art full-stack architecture to turn stadiums into intelligent, reactive environments.

---

## 🏟️ Platform Overview & Architecture

ZoneOn AI is built on a highly modular full-stack architecture designed for split-second latency, offline-ready resilience, and multi-agent synergy. 

```
                                  +-----------------------+
                                  |      Fans, Staff,     |
                                  |    & Operations UI    |
                                  +-----------+-----------+
                                              |
                                              v (HTTP Requests / APIs)
                                  +-----------+-----------+
                                  |     Express Node.js   |
                                  |      Backend Host     |
                                  +-----+-----+-----+-----+
                                        |     |     |
                 +----------------------+     |     +----------------------+
                 v                            v                            v
    +------------+------------+  +------------+------------+  +------------+------------+
    |   Google Gemini Agent   |  |   Stadium Metrics Engine|  |   Real-time Weather &   |
    |   & Triage Services     |  |   & Heatmap Simulators  |  |   Transit Integrations  |
    +-------------------------+  +-------------------------+  +-------------------------+
```

---

## ⚡ Core Features

- **Interactive Dynamic Stadium Heatmap**: Highly detailed 2D sector layout rendering seating areas, crowd density levels, queue times, SOS incident coordinates, and safe accessibility routes.
- **Unified Incident Triage Engine**: Auto-categorization of safety/medical alerts with automatic severity grading, title drafting, and action checklists using Google Gemini.
- **Multitask Conversational Agent Panel**: Specialized command copilots (Organizers, Volunteers, Fans, Emergency Response) that keep contextual logs and trigger text-to-speech output.
- **Stadium PA & Smart Broadcast Hub**: Fully integrated voice broadcasting interface to pipe emergency safety scripts directly into stadium audio systems using safe speech wrappers.
- **Enterprise Operations & Weather Dashboard**: Continuous ingestion of transit system delays, real-time meteorology indexes, and audit logs.

---

## 🗂️ Project Directory Structure

```
├── .env.example              # Declarative template for environment credentials
├── index.html                # Entry web document
├── package.json              # Direct and peer-dependency registry
├── server.ts                 # Production-grade Node.js server with Vite middleware integration
├── test-endpoints.ts         # High-coverage API endpoint integration test suite
├── tsconfig.json             # TypeScript static compiler configurations
├── vite.config.ts            # Vite bundler configuration pipeline
└── src
    ├── main.tsx              # Browser DOM entrypoint
    ├── App.tsx               # Primary interface orchestrator and view-state coordinator
    ├── index.css             # Unified tailwind stylesheet importing system fonts
    ├── types.ts              # Declarative type, interface, and enum contracts
    ├── lib
    │   └── speech.ts         # Sandbox-resilient web speech synthesis wrapper
    └── components
        ├── AgentPanel.tsx    # Conversational copilots with role switches and accessible speech
        ├── AnnouncementPanel.tsx # Smart PA broadcast manager and script generator
        ├── StadiumMap.tsx    # Interactive canvas-based map rendering seats and crowd heatmaps
        └── StatsDashboard.tsx # Incident logger, weather station, transit feeds, and analytics
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js** v18 or higher
- **NPM** v9 or higher
- **Google Gemini API Key** (set as `GEMINI_API_KEY` in environment variables)

### Installation
1. Clone or extract the project repository.
2. Initialize dependencies:
   ```bash
   npm install
   ```
3. Establish your environment properties:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY inside .env
   ```

### Execution
- **Development Server Mode**:
  ```bash
  npm run dev
  ```
  The development server will launch on port `3000` with hot-reloading support.
  
- **Production Compilation & Run**:
  ```bash
  npm run build
  npm run start
  ```

---

## 🧪 Integration Testing Suite

The repository contains an automated endpoint test harness (`test-endpoints.ts`) verifying the status codes, response schemas, security validation, audit logging, and core logic of each backend route. To run the integration tests locally:

```bash
npm run test
```

All 35 critical assertions verify health, weather feeds, incident triage, transit telemetry, security validation, audit logging, and conversational FAQ-matching engine processing logic.

---

## 🤝 Contributing

We welcome contributions to help scale ZoneOn AI. Please consult our [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on our workflow, conventions, and community standard policies.

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
