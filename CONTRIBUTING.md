# Contributing to ZoneOn AI

Thank you for your interest in contributing to the ZoneOn AI project! Together, we can deliver a production-ready Generative AI Stadium Operating System for the FIFA World Cup 2026.

---

## 🛠️ Development Guidelines

To ensure code quality, reliability, and security, all contributions must adhere to the following standards:

1. **Strong Typing**: Use strict TypeScript typing. Avoid using `any` unless absolutely necessary, and provide appropriate interface definitions for all new data structures in `src/types.ts`.
2. **Modular Architecture**: Split complex components into smaller, reusable UI pieces. Keep styling consistent using Tailwind utility classes.
3. **No Key Exposures**: Never hardcode keys or place them in client-side code. Use server-side proxy routes for all external services.
4. **Resilient APIs**: Ensure all frontend endpoints are robust and handle request/network failures gracefully with user-friendly error messages or states.

---

## 📥 Submission Process

1. **Branch Naming**:
   - Features: `feature/your-feature-name`
   - Bugfixes: `bugfix/your-bug-name`
   - Refactoring: `refactor/your-change-name`
2. **Linter & Build Checks**: Run build and lint locally before opening a pull request:
   ```bash
   npm run lint
   npm run build
   ```
3. **API Tests**: Run the endpoint integration tests to verify no regressions were introduced:
   ```bash
   npx tsx test-endpoints.ts
   ```
4. **Pull Requests**:
   - Provide a concise summary of the changes and the reasoning behind them.
   - Reference any related issue IDs.
   - Ensure the automated CI checks pass.
