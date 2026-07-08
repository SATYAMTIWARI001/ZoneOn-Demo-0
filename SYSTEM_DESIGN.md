# ZoneOn AI System Design

This document details the software design considerations, design patterns, and operational standards implemented in ZoneOn AI.

---

## 📐 Design Patterns

1. **Proxy Pattern (Server-Side Secrets)**: Client-side modules are forbidden from making direct calls to external third-party APIs (such as Open-Meteo or Google Gemini). Instead, they target internal API paths, enabling the server to cache requests, add rate limiting, and securely inject API keys.
2. **Adapter Pattern (Speech Synthesis)**: The browser's native speech synthesis engine behaves inconsistently across different operating systems, browsers, and iframe contexts. The Safe Speech Adapter provides consistent method access with resilient `try-catch` structures.
3. **State Reducer / Event Dispatch**: Reactive components on the interactive canvas synchronize with the general state manager to reflect state updates immediately (e.g. incident resolution, transit line updates).

---

## ⚡ Non-Functional Design Criteria

### 1. High Accessibility (WCAG 2.2 AA)
- **Assistive Routing Mode**: Highlights wheelchair-friendly escalators and lifts on the stadium visualizer map.
- **Focus Elements**: Dynamic focus rings, ARIA labels, and custom layout tags to support screen readers.
- **Color Contrast**: Compliant visual palette using deep slate backgrounds coupled with high-contrast text tags.

### 2. High Performance
- **Minimal Asset Overhead**: Icons are loaded on-demand from `lucide-react`. No heavy bitmaps or external design frameworks are linked.
- **Lean Canvas Redraws**: Interactive map leverages basic HTML5 elements styled dynamically rather than heavy vector libraries.
- **Lazy Handlers**: Non-blocking asynchronous fetches ensure that the initial viewport renders immediately.
