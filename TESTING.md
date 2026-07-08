# ZoneOn AI Testing Framework

This document outlines the testing strategy, execution instructions, and test coverage standards for the ZoneOn AI codebase.

---

## 🧪 Testing Levels

### 1. Backend Integration Tests (`test-endpoints.ts`)
- **Coverage**: 100% of the key endpoint structures.
- **Components Checked**:
  - Weather forecasts.
  - Interactive transit updates.
  - Incident creations, list queries, and resolution transitions.
  - Automated Gemini Triage categorization and severity classifications.
  - Contextual Conversational Agent flows.
- **Execution Command**:
  ```bash
  npx tsx test-endpoints.ts
  ```

### 2. Frontend Accessibility Auditing
- **Coverage**: WCAG 2.2 AA.
- **Criteria Verified**:
  - Focus ring visibility.
  - ARIA label tags on interactive dynamic controls.
  - Element IDs corresponding with automated integration testing standards.
  - Fallback-safe Web Speech Synthesis error shielding.

---

## 🛠️ Automated Testing Pipeline (CI/CD)

Whenever a Pull Request is initiated or a push is made to the `main` branch, the integration pipeline performs:

1. **Static Analysis & Linting**:
   ```bash
   npm run lint
   ```
2. **Build Validation**:
   ```bash
   npm run build
   ```
3. **API Integration Tests**:
   ```bash
   npx tsx test-endpoints.ts
   ```
