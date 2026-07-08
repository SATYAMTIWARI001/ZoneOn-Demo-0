# Security Policy

## Product Security & Trust Guidelines

ZoneOn AI is built to provide high-grade security for the FIFA World Cup 2026. This policy outlines how vulnerabilities should be handled, reported, and mitigated.

## Supported Versions

We actively support the following versions of ZoneOn AI with security patches:

| Version | Supported | Notes |
| ------- | --------- | ----- |
| v1.0.x  | Yes       | Core release for stadium deployment. |
| < v1.0  | No        | Pre-production prototypes. |

## Core Security Controls

1. **API Key Security**: The application uses a strict server-to-client architecture. No sensitive API keys (including the Gemini API key) are ever exposed to the client or browser context. All generative actions are proxied via server-side endpoints (`/api/*`).
2. **Robust Input Handling**: Standard Express middleware and strong parameter validation guard all backend endpoints against injection attacks and cross-site scripting (XSS).
3. **Sandbox Resilience**: Audio and voice synthesis features utilize fallback logic to prevent crash errors when run in highly sandboxed browser environments (such as iframes).

## Reporting a Vulnerability

If you discover a security vulnerability, please do not open a public GitHub issue. Instead, report it directly by following these steps:

1. Send an encrypted email to the security response team at `security@zoneon.ai`.
2. Include a detailed description of the vulnerability, steps to reproduce, and a proof of concept (PoC) if available.
3. We will acknowledge receipt of your report within 24 hours and provide an estimated timeline for remediation.

We operate under a responsible disclosure policy, requesting 90 days to remediate issues before public disclosure.
