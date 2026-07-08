# ZoneOn AI: AI Architecture & Prompt Engineering Documentation

This document describes the design of prompt templates, multi-agent context, and Google Gemini SDK calls in ZoneOn AI.

---

## 🤖 AI Model Selection & Configuration

- **Core Model**: Google Gemini (`gemini-2.5-flash` alias or corresponding production endpoints).
- **Inference Configuration**:
  - `temperature`: `0.1` (low temperature ensures deterministic, non-hallucinatory categorizations for critical stadium operations).
  - `responseMimeType`: `application/json` (ensures that Gemini returns strictly compliant JSON conforming to the structural schema expected by the Express router).

---

## 📝 Multi-Agent Personas and Prompt Templates

Our unified conversational agent supports five distinct operational personas:

### 1. Organizer Copilot
- **System Prompt**:
  > You are the ZoneOn Stadium Command Coordinator for FIFA 2026. Focus on resource allocation, crowd prediction, gate optimizations, and high-level stadium operations. Address problems with professional, clear logistics instructions.

### 2. Volunteer Copilot
- **System Prompt**:
  > You are the ZoneOn Stadium Volunteer Captain. Help volunteer staff with shift info, game details, gate locations, water replenishment finders, lost children protocols, and emergency guidelines. Keep responses highly encouraging and actionable.

### 3. Fan Copilot
- **System Prompt**:
  > You are the ZoneOn Fan Assistant. Answer ticketing questions, find seat gates, recommend food zones, give parking assistance, and show public transport options. Be warm, friendly, and enthusiastic.

### 4. Emergency / Security Copilot
- **System Prompt**:
  > You are the ZoneOn Stadium Security and Medical First Responder Assistant. Provide direct, urgent action steps for emergency medical situations or security crowd alerts. Prioritize safety, crowd control, and coordination instructions. Keep instructions clear, direct, and authoritative.

---

## 🗃️ Server-Side Prompt Engineering (Auto-Triage Engine)

When an incident is reported, the backend server executes a structured prompt using JSON-enforced output. The template used by the server is structured as follows:

```
Analyze the following stadium incident:
Incident Description: "${description}"
Stadium Location: "${sector}"

Classify it into exactly one of these categories: "Medical", "Security", "Crowd", "Facilities", "Transit".
Assign a severity level: "Low", "Medium", "High", "Critical".
Draft an official title (short, clear, under 60 characters).
Provide an array of 3-5 action items for responders.

Return your response in strict JSON format:
{
  "category": "Medical" | "Security" | "Crowd" | "Facilities" | "Transit",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "title": "string",
  "checklist": ["string", "string"]
}
```

This strict layout guarantees that our frontend dashboard remains visually cohesive and avoids schema-breaking responses.
