# Changelog

All notable changes to the ZoneOn AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-08

### Added
- **Interactive Crowd Map**: Introduced custom sector coordinates, crowd heatmap simulation, and active incident trackers on the interactive stadium visualization canvas.
- **Unified Copilot System**: Deployed conversational assistant modules for Fans, Volunteers, Organizers, and Emergency responders leveraging Gemini integrations.
- **Voice PA Broadcaster**: Created a robust broadcast dashboard with fallback-safe Speech Synthesis wrappers to support sandboxed browser modes seamlessly.
- **Live Weather & Transit Integrations**: Added live API connectors fetching Open-Meteo forecasts and local World Cup shuttle metrics.
- **Integration Test Suite**: Created a fully automated testing suite checking endpoint health, schema validation, and triage logic.

### Fixed
- **Speech Synthesis Sandboxing**: Fixed standard `DOMException` and iframe blockages by adding comprehensive fallback state detection.
- **Weather Fetch Evaluation**: Fixed dual-await condition on fetch API handler in `server.ts`.
- **UI Focus Elements**: Resolved keyboard focus issues on key navigational components.
