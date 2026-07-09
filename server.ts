import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Incident, TransportStatus, Announcement } from "./src/types";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI client (Lazy-initialized on request if needed, but safe globally)
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will fallback to offline mock mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// In-Memory Database State
let incidents: Incident[] = [
  {
    id: "inc-1",
    type: "medical",
    title: "Heat Exhaustion Section 104",
    description: "Fan reported feeling extremely dizzy and dehydrated. Requiring medical supervisor check-in.",
    zone: "Zone A (East Stand)",
    status: "active",
    timestamp: new Date().toISOString(),
    severity: "medium"
  },
  {
    id: "inc-2",
    type: "lost_found",
    title: "Black Leather Wallet near Concession B",
    description: "A fan reported losing a black leather wallet containing credit cards and ID near the taco stand.",
    zone: "Zone B (Concourse North)",
    status: "active",
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    severity: "low"
  },
  {
    id: "inc-3",
    type: "security",
    title: "Bottleneck at Gate 3 Ticket Scanners",
    description: "Gate 3 scanning lanes 4 & 5 experiencing software issues, slowing down entry queue. Crowd backing up.",
    zone: "Zone C (Gate 3 Entrance)",
    status: "active",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    severity: "high"
  },
  {
    id: "inc-4",
    type: "sustainability",
    title: "Recycling bin overflowing in Section 218",
    description: "Plastic sorting container completely full. Needs custodial dispatch for empty and sorting verification.",
    zone: "Zone D (Concourse West)",
    status: "active",
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    severity: "low"
  }
];

let transports: TransportStatus[] = [
  { line: "Metro Line 1 (North)", mode: "metro", status: "normal", minutesToArrival: 3, destination: "FIFA Fan Festival / Downtown" },
  { line: "Stadium Shuttle Bus A", mode: "bus", status: "delayed", minutesToArrival: 14, destination: "West Express Parking Lot" },
  { line: "Metro Line 2 (South)", mode: "metro", status: "crowded", minutesToArrival: 5, destination: "International Airport" },
  { line: "Express Bus 302", mode: "bus", status: "normal", minutesToArrival: 8, destination: "Park & Ride North" }
];

// Initial pre-generated stadium announcements
let announcements: Announcement[] = [
  {
    id: "ann-1",
    event: "Gate 3 Congestion Advisory",
    timestamp: new Date().toISOString(),
    category: "crowd",
    languages: {
      en: "Attention fans: Gate 3 is currently experiencing heavy entry congestion. We recommend arriving fans in Zone C redirect to nearby Gate 4 or Gate 2 for faster scanning.",
      es: "Atención aficionados: La Puerta 3 está registrando una alta congestión de entrada. Recomendamos a los aficionados en la Zona C dirigirse a la Puerta 4 o Puerta 2 para un acceso más rápido.",
      fr: "Attention supporters : La porte 3 connaît actuellement un fort engorgement. Nous conseillons aux supporters de la Zone C de se diriger vers les portes 4 ou 2 pour un accès plus rapide."
    },
    types: {
      led: "GATE 3 HEAVY TRAFFIC. REDIRECT TO GATE 2/4 FOR FASTER ENTRY.",
      voice: "Attention all FIFA World Cup attendees. To ensure a smooth entry, please be advised that Gate 3 is experiencing temporary queue delays. Operational staff recommend redirecting to Gate 2 or Gate 4, which are fully open and clear.",
      social: "📢 Stadium Update: Gate 3 is experiencing heavy entry queues. If you are arriving now, head to Gate 2 or 4 for swift scanning and entry! #FIFAWorldCup2026 #ZoneOn"
    }
  }
];

// Operational metrics
let liveMetrics = {
  attendance: 74850,
  capacity: 80000,
  activeStaff: 340,
  activeVolunteers: 650,
  sustainabilityScore: 88, // out of 100
  totalWasteRecycledKg: 4320,
  totalWaterSavedLiters: 12450
};

// Real-time Audit Trail (Incident and Log state auditing)
let auditLogs: any[] = [
  { id: "log-1", action: "INITIALIZE", user: "Stadium OS", details: "ZoneOn Stadium Intelligence Core successfully booted.", timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
  { id: "log-2", action: "INCIDENT_REPORTED", user: "AI Auto-Triage", details: "Logged [MEDIUM] MEDICAL incident 'Heat Exhaustion Section 104' in Zone A.", timestamp: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString() },
  { id: "log-3", action: "INCIDENT_REPORTED", user: "AI Auto-Triage", details: "Logged [LOW] LOST_FOUND incident 'Black Leather Wallet near Concession B' in Zone B.", timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString() }
];

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Weather cache to optimize performance and prevent external rate-limits
let cachedWeather: any = null;
let lastWeatherFetchTime = 0;
const WEATHER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Weather Endpoint (MetLife Stadium coordinates)
app.get("/api/weather", async (req, res) => {
  const now = Date.now();
  if (cachedWeather && (now - lastWeatherFetchTime < WEATHER_CACHE_TTL)) {
    return res.json(cachedWeather);
  }

  try {
    const weatherRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=40.8136&longitude=-74.0744&current_weather=true");
    if (weatherRes.ok) {
      const weatherData: any = await weatherRes.json();
      if (weatherData && weatherData.current_weather) {
        const temp = weatherData.current_weather.temperature;
        const wind = weatherData.current_weather.windspeed;
        const code = weatherData.current_weather.weathercode;
        const isDayNum = weatherData.current_weather.is_day;
        
        let cond = "Partly Cloudy";
        if (code === 0) cond = "Sunny & Clear";
        else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) cond = "Rainy / Showers";
        else if ([95, 96, 99].includes(code)) cond = "Severe Thunderstorms";

        cachedWeather = {
          temperature: temp,
          windspeed: wind,
          condition: cond,
          isDay: isDayNum === 1,
          location: "MetLife Stadium, East Rutherford, NJ",
          timestamp: new Date().toISOString()
        };
        lastWeatherFetchTime = now;
        return res.json(cachedWeather);
      }
    }
  } catch (err) {
    console.warn("Could not load weather from open-meteo API. Using fallback.", err);
  }

  // Fallback response (cached for 1 min on failure)
  const fallbackWeather = {
    temperature: 24.5,
    windspeed: 12.0,
    condition: "Partly Cloudy",
    isDay: true,
    location: "MetLife Stadium, East Rutherford, NJ",
    timestamp: new Date().toISOString()
  };
  cachedWeather = fallbackWeather;
  lastWeatherFetchTime = now - WEATHER_CACHE_TTL + 60 * 1000; // retry after 1 min
  res.json(fallbackWeather);
});

// Incidents Endpoints
app.get("/api/incidents", (req, res) => {
  res.json(incidents);
});

// Basic HTML and script tags sanitizer for robust security
function sanitizeInput(text: any): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

app.post("/api/incidents", (req, res) => {
  const { type, title, description, zone, severity } = req.body;
  if (!type || !title || !description || !zone) {
    return res.status(400).json({ error: "Missing required fields for incident report." });
  }

  // Strict domain-level input validation
  const validTypes = ["medical", "lost_found", "security", "sustainability"];
  const validSeverities = ["low", "medium", "high"];

  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid incident type." });
  }
  if (severity && !validSeverities.includes(severity)) {
    return res.status(400).json({ error: "Invalid incident severity." });
  }

  // Sanitize and slice strings to protect against XSS and huge payload buffer exhaustion
  const cleanType = type as 'medical' | 'lost_found' | 'security' | 'sustainability';
  const cleanTitle = sanitizeInput(title).slice(0, 150);
  const cleanDescription = sanitizeInput(description).slice(0, 1500);
  const cleanZone = sanitizeInput(zone).slice(0, 150);
  const cleanSeverity = (severity ? severity : "medium") as 'low' | 'medium' | 'high';

  const newIncident: Incident = {
    id: `inc-${Date.now()}`,
    type: cleanType,
    title: cleanTitle,
    description: cleanDescription,
    zone: cleanZone,
    status: "active",
    timestamp: new Date().toISOString(),
    severity: cleanSeverity
  };

  incidents.unshift(newIncident);

  // Append to Audit Trail
  const newAudit = {
    id: `log-${Date.now()}`,
    action: "INCIDENT_REPORTED",
    user: "Staff Operator (Console)",
    details: `Reported [${newIncident.severity.toUpperCase()}] ${newIncident.type.toUpperCase()}: "${newIncident.title}" in ${newIncident.zone}.`,
    timestamp: new Date().toISOString()
  };
  auditLogs.unshift(newAudit);

  res.status(201).json(newIncident);
});

app.post("/api/incidents/:id/resolve", (req, res) => {
  const { id } = req.params;
  const incident = incidents.find(inc => inc.id === id);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }
  incident.status = "resolved";

  // Append to Audit Trail
  const newAudit = {
    id: `log-${Date.now()}`,
    action: "INCIDENT_RESOLVED",
    user: "Coordinating Officer (V. Martinez)",
    details: `Resolved [${incident.severity.toUpperCase()}] ${incident.type.toUpperCase()}: "${incident.title}" in ${incident.zone}.`,
    timestamp: new Date().toISOString()
  };
  auditLogs.unshift(newAudit);

  res.json(incident);
});

// AI Incident Auto-Triage Endpoint
app.post("/api/incidents/triage", async (req, res) => {
  const { rawReport } = req.body;
  if (!rawReport) {
    return res.status(400).json({ error: "Raw report text is required." });
  }

  const prompt = `You are an expert FIFA World Cup Stadium Dispatch Coordinator.
Analyze this raw operational incident report submitted by ground staff:
"${rawReport}"

Identify the appropriate Category (lost_found, medical, security, sustainability), the Severity level (low, medium, high), a polished concise Title, a comprehensive Description, and 2-3 Suggested Actions (dispatch directives).

You MUST output a valid JSON object matching this schema:
{
  "category": "lost_found" | "medical" | "security" | "sustainability",
  "severity": "low" | "medium" | "high",
  "title": "A concise, professional one-line summary (e.g. 'Slippery Spill Section 212')",
  "description": "Fleshed-out details based on raw input",
  "suggestedActions": ["suggested action 1", "suggested action 2"]
}`;

  try {
    const ai = getAI();
    let parsedResult;
    let fallbackNeeded = false;

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                severity: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                suggestedActions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["category", "severity", "title", "description", "suggestedActions"]
            }
          }
        });
        parsedResult = JSON.parse(response.text?.trim() || "{}");
      } catch (geminiErr: any) {
        console.warn("Gemini API call failed during triage. Falling back to offline rule-based parser.", geminiErr.message);
        fallbackNeeded = true;
      }
    } else {
      fallbackNeeded = true;
    }

    if (fallbackNeeded) {
      // Robust Offline Fallback Parser
      const text = rawReport.toLowerCase();
      let category = "lost_found";
      let severity = "low";
      let title = "Staff Report";
      let suggestedActions = ["Notify sector supervisor.", "Log status details in shift notes."];

      if (text.includes("hurt") || text.includes("fell") || text.includes("injured") || text.includes("sick") || text.includes("breath") || text.includes("faint") || text.includes("pain") || text.includes("medical") || text.includes("blood") || text.includes("heart") || text.includes("unwell") || text.includes("seizure") || text.includes("stroke") || text.includes("breathing")) {
        category = "medical";
        severity = "high";
        title = "First Aid Required";
        suggestedActions = [
          "Dispatch medical golf cart to the section immediately.",
          "Coordinate with nearest volunteer supervisor to clear the walkway.",
          "Deploy portable defibrillator/AED kit as precaution."
        ];
      } else if (text.includes("fight") || text.includes("crowd") || text.includes("gate") || text.includes("bottleneck") || text.includes("scanner") || text.includes("security") || text.includes("stolen") || text.includes("police") || text.includes("cops") || text.includes("riot") || text.includes("disorderly")) {
        category = "security";
        severity = "high";
        title = "Security Intervention Needed";
        suggestedActions = [
          "Deploy high-visibility safety officers to establish cordon.",
          "Inform local gate controller to pause/divert entry scanners.",
          "Log report to command HQ security roster."
        ];
      } else if (text.includes("trash") || text.includes("overflow") || text.includes("bin") || text.includes("recycle") || text.includes("litter") || text.includes("clean") || text.includes("spill") || text.includes("soda") || text.includes("water") || text.includes("leaking")) {
        category = "sustainability";
        severity = "low";
        title = "Custodial Overflow Action";
        suggestedActions = [
          "Instruct janitorial team to dispatch wet-vac and yellow safety sign.",
          "Alert sustainability green volunteers in proximity to oversee sorting."
        ];
      } else if (text.includes("lost") || text.includes("wallet") || text.includes("phone") || text.includes("bag") || text.includes("purse") || text.includes("keys") || text.includes("ticket") || text.includes("card")) {
        category = "lost_found";
        severity = "low";
        title = "Lost & Found Log Request";
        suggestedActions = [
          "Direct reporting fan to closest Stand Service Station.",
          "Advise volunteer to register detailed physical description in lost logs."
        ];
      }

      parsedResult = {
        category,
        severity,
        title,
        description: `Formulated from report: "${rawReport}"`,
        suggestedActions
      };
    }

    res.json(parsedResult);
  } catch (err: any) {
    console.error("Auto-Triage error:", err);
    res.status(500).json({ error: "Failed to perform AI auto-triage." });
  }
});

// Audit Trail endpoint
app.get("/api/audit-logs", (req, res) => {
  res.json(auditLogs);
});

// Transport Endpoints
app.get("/api/transport", (req, res) => {
  res.json(transports);
});

app.post("/api/transport/update", (req, res) => {
  const { index, status, minutesToArrival } = req.body;
  if (index === undefined || index < 0 || index >= transports.length) {
    return res.status(400).json({ error: "Invalid transport line index" });
  }
  
  const oldStatus = transports[index].status;
  if (status) transports[index].status = status;
  if (minutesToArrival !== undefined) transports[index].minutesToArrival = Number(minutesToArrival);

  // Append to Audit Trail
  const newAudit = {
    id: `log-${Date.now()}`,
    action: "TRANSIT_UPDATE",
    user: "Transit Liaison Office",
    details: `Adjusted transit line "${transports[index].line}" status from "${oldStatus}" to "${transports[index].status}" (arrival in ${transports[index].minutesToArrival}m).`,
    timestamp: new Date().toISOString()
  };
  auditLogs.unshift(newAudit);

  res.json(transports[index]);
});

// Announcements
app.get("/api/announcements", (req, res) => {
  res.json(announcements);
});

// Operational Metrics Endpoints
app.get("/api/metrics", (req, res) => {
  res.json(liveMetrics);
});

app.post("/api/metrics/update", (req, res) => {
  const { attendance, sustainabilityScore, recycleIncrease, waterIncrease } = req.body;
  if (attendance !== undefined) liveMetrics.attendance = Number(attendance);
  if (sustainabilityScore !== undefined) liveMetrics.sustainabilityScore = Number(sustainabilityScore);
  if (recycleIncrease !== undefined) liveMetrics.totalWasteRecycledKg += Number(recycleIncrease);
  if (waterIncrease !== undefined) liveMetrics.totalWaterSavedLiters += Number(waterIncrease);
  res.json(liveMetrics);
});

// AI Agent Conversation Handler
app.post("/api/agent", async (req, res) => {
  const { role, message, history, accessibilityMode } = req.body;
  
  if (!role || !message) {
    return res.status(400).json({ error: "Role and message are required." });
  }

  // Robust input verification for roles and message sizes
  const validRoles = ['fan', 'organizer', 'volunteer', 'security', 'emergency', 'sustainability'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid agent role requested." });
  }

  if (typeof message !== "string") {
    return res.status(400).json({ error: "Message must be a string." });
  }

  // Protect against prompt bloat or DOS by slicing incoming message
  const cleanMessage = sanitizeInput(message).slice(0, 1000);

  // Build context-rich prompt for Gemini based on role and current stadium state
  const incidentSummary = incidents.filter(i => i.status === "active")
    .map(i => `[${i.severity.toUpperCase()}] ${i.type}: ${i.title} in ${i.zone}`)
    .join("\n");

  const transportSummary = transports
    .map(t => `${t.line} heading to ${t.destination} is ${t.status} (Next in ${t.minutesToArrival} mins)`)
    .join("\n");

  // Domain specialized system instructions
  let systemInstruction = "";
  
  switch(role) {
    case "fan":
      systemInstruction = `You are the ZoneOn AI Fan Assistant for the FIFA World Cup 2026.
Your goal is to provide helpful, polite, and exciting stadium assistance to fans.
Stadium details:
- Gates: Gates 1 to 8. Gates 1-2 serve Zone A (East Stand), Gates 3-4 serve Zone B (North Stand), Gates 5-6 serve Zone C (South Stand), Gates 7-8 serve Zone D (West Stand).
- Amenities: Concession Stands serve tacos, burgers, vegan wraps, and official merchandise. Washrooms are near every second gate section. Recycling stations are active everywhere.
- Active Issues: ${incidents.filter(i => i.type === 'security' || i.type === 'sustainability').length > 0 ? "Be aware that Gate 3 is currently experiencing heavy bottleneck entry congestion. Advise them to use Gate 2 or 4." : "No current queue advisories."}
- Transport Details:
${transportSummary}

Guidelines:
- Keep answers warm, stadium-friendly, concise, and professional.
- Guide them on accessible wheelchair paths if requested.
- Promote environmental sustainability (e.g., throwing plastic cups in blue bins in Zone D).
- Support reporting lost items - tell them they can report it directly using the "Report Incident" tab and you will assist them in locating it.`;
      break;

    case "organizer":
      systemInstruction = `You are the ZoneOn Executive Operations Intelligence Agent for FIFA organizers.
Your style is professional, analytical, concise, and focused on swift decision support.
The current stadium state:
- Attendance: ${liveMetrics.attendance} / ${liveMetrics.capacity} (${Math.round((liveMetrics.attendance/liveMetrics.capacity)*100)}% capacity)
- Staff: ${liveMetrics.activeStaff} operators, ${liveMetrics.activeVolunteers} volunteers.
- Active Operational Incidents:
${incidentSummary || "No active operational incidents."}
- Public Transportation Status:
${transportSummary}

Guidelines:
- Answer with clear operational recommendations.
- Prioritize safety, rapid throughput, sustainability, and staff coordination.
- Suggest section redistributions, scanner reboots, or first-aid dispatches if relevant to their questions.
- Maintain a highly sophisticated executive command-center tone.`;
      break;

    case "volunteer":
      systemInstruction = `You are the Volunteer AI Operations Assistant.
Your audience consists of volunteers on the ground helping fans. Your tone is supportive, precise, and practical.
Provide volunteer protocols for:
- Medical incidents (Guide them to locate nearest first aid, trigger dispatch via "Report Incident" panel).
- Lost Child (Protocol: Secure immediate section gates, report instantly to safety director, do not broadcast the child's name over public speakers).
- General navigation queries.
Active stadium incidents to keep in mind:
${incidentSummary}

Guidelines:
- Always give actionable bullet points.
- Provide multilingual phrases if volunteers ask how to say things in Spanish, French, German, or Portuguese.
- Keep security protocol numbers simple.`;
      break;

    case "security":
      systemInstruction = `You are the Security Intelligence AI Coordinator.
You assist safety directors and police squads with crowd management, gate flow control, and risk analysis.
Current Security logs:
- Bottleneck at Gate 3.
Current Incidents:
${incidentSummary}

Guidelines:
- Act as an advisor on emergency planning and gate optimization.
- Give analytical estimates of bottleneck disperse times.
- Outline clear crowd-control instructions (e.g., establishing a 50-meter safety cordon, using auxiliary turnstiles, deploying high-vis staff).
- Maintain an authoritative, structured, and strategic posture.`;
      break;

    case "emergency":
      systemInstruction = `You are the Emergency Response AI Triage and Dispatch assistant.
Your tone is calm, highly direct, medically accurate, and urgent.
Active medical logs:
${incidents.filter(i => i.type === 'medical').map(i => i.title + ": " + i.description).join("\n") || "No current medical dispatches."}

Guidelines:
- Offer immediate first-aid guidance for common stadium issues (heat exhaustion, panic attack, choking, cardiac event).
- Provide immediate, simplified triage instructions.
- Ensure the user calls local stadium first aid (Section 102/204 medical tents) or dispatches volunteer supervisors.
- Always recommend clearing the path for the medical golf cart.`;
      break;

    case "sustainability":
      systemInstruction = `You are the ZoneOn Sustainability Champion AI.
You help managers and fans track carbon metrics, reduce waste, and manage the stadium's ecological impact.
Current Sustainability Stats:
- Recycled: ${liveMetrics.totalWasteRecycledKg} kg of waste.
- Water saved: ${liveMetrics.totalWaterSavedLiters} liters.
- Current Score: ${liveMetrics.sustainabilityScore}/100.
Active issues:
${incidents.filter(i => i.type === 'sustainability').map(i => i.title).join("\n") || "All sorting stations operational."}

Guidelines:
- Provide fun sustainability trivia about the FIFA Green Stadium initiative.
- Suggest waste bin optimization ratios (e.g. 3 recycling bins per 1 general landfill bin).
- Keep responses enthusiastic and action-driven. Encourage stadium sorting.`;
      break;

    default:
      systemInstruction = "You are ZoneOn AI, the unified GenAI Command Center for the FIFA World Cup 2026 stadium operations.";
  }

  if (accessibilityMode) {
    systemInstruction += "\n\nCRITICAL INFO: The user has ACCESSIBILITY MODE enabled. You MUST bias all directions toward step-free routes, elevators, ramps, and accessible seating sections. Clearly prioritize Gate 1 (fully wheelchair accessible) and describe pathways avoiding stairs completely.";
  }

  try {
    const ai = getAI();
    
    // Format contents with conversation history for contextual dialogue
    const formattedContents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((msgObj: any) => {
        formattedContents.push({
          role: msgObj.role === 'user' ? 'user' : 'model',
          parts: [{ text: msgObj.content }]
        });
      });
    }

    // Append the current message
    formattedContents.push({
      role: 'user',
      parts: [{ text: cleanMessage }]
    });

    let fallbackNeeded = false;
    let replyText = "";

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        replyText = response.text || "I was unable to formulate a response at this moment. Please check server configurations.";
      } catch (geminiErr: any) {
        console.warn("Gemini API call failed during agent chat. Falling back to offline simulator.", geminiErr.message);
        fallbackNeeded = true;
      }
    } else {
      fallbackNeeded = true;
    }

    if (fallbackNeeded) {
      // Mock Responses in case API key is missing or failed
      replyText = `[SIMULATED ASSISTANT] I am operating in backup operational mode. Based on your tournament dispatch query "${cleanMessage}", our stadium console recommends directing safety stewards or volunteers to the sector immediately. Check the interactive map and dispatches telemetry panel for real-time routing.`;
      if (cleanMessage.toLowerCase().includes("help") || cleanMessage.toLowerCase().includes("emergency") || cleanMessage.toLowerCase().includes("hurt") || cleanMessage.toLowerCase().includes("medical")) {
        replyText += "\n\n🚨 EMERGENCY COORDINATION: Dispatching standby medical golf cart to Section 104 via the designated accessible step-free route immediately. Please coordinate on-site stewards to secure physical pathways.";
      } else if (cleanMessage.toLowerCase().includes("gate 3") || cleanMessage.toLowerCase().includes("bottleneck") || cleanMessage.toLowerCase().includes("crowd")) {
        replyText += "\n\n⚠️ QUEUE DELAY ADVISORY: Gate 3 is experiencing an active bottleneck. Diverting fan queues toward Gates 2 and 4. Broadcaster ticker and LED panels have been updated.";
      } else if (cleanMessage.toLowerCase().includes("lost") || cleanMessage.toLowerCase().includes("wallet") || cleanMessage.toLowerCase().includes("find") || cleanMessage.toLowerCase().includes("phone")) {
        replyText += "\n\n🔍 LOST & FOUND SEARCH: Recommend registering detailed physical tags via the 'Report Incident' tab. Standard lost and found retrieval is located at stand Station 4.";
      } else if (cleanMessage.toLowerCase().includes("vegan") || cleanMessage.toLowerCase().includes("food") || cleanMessage.toLowerCase().includes("eat") || cleanMessage.toLowerCase().includes("concession")) {
        replyText += "\n\n🍔 FOOD & REFRESHMENTS: Nearest organic vegan wraps and sustainable dining concessions are active in Zone A (East Stand, Section 112) and Zone D (West Stand, Section 224). All items are served in carbon-offset compostable packaging.";
      }
    }

    res.json({ reply: replyText });

  } catch (err: any) {
    console.error("Gemini API Error in /api/agent:", err);
    res.status(500).json({ 
      error: "AI Generation Error", 
      details: err.message,
      reply: "Sorry, I experienced an operational glitch in my neural processor. Please try again in a moment."
    });
  }
});

// AI Announcement Generator Endpoint
app.post("/api/announcement/generate", async (req, res) => {
  const { eventDescription, additionalLang } = req.body;
  
  if (!eventDescription) {
    return res.status(400).json({ error: "Event description is required." });
  }

  const prompt = `You are a FIFA World Cup 2026 stadium communications officer.
Generate professional multi-lingual public service announcements based on this event description:
"${eventDescription}"

You MUST output a valid JSON object matching this schema:
{
  "event": "A concise english title for the announcement",
  "languages": {
    "en": "English announcement text (clear, helpful, stadium-voiced, under 200 characters)",
    "es": "Spanish announcement text",
    "fr": "French announcement text",
    "${additionalLang || 'pt'}": "Announcement text in ${additionalLang || 'Portuguese'}"
  },
  "types": {
    "led": "Ultra-short 10-word message for scrolling LED scoreboard displays, e.g. 'GATE 3 DELAYS. USE GATE 2/4.'",
    "voice": "Full, natural script for public speakers or automated audio announcers (approx 45 seconds)",
    "social": "Draft social post for @FIFAWorldCupStadium with hashtags, under 280 characters"
  }
}`;

  try {
    const ai = getAI();
    let parsedResult;
    let fallbackNeeded = false;

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                event: { type: Type.STRING },
                languages: {
                  type: Type.OBJECT,
                  properties: {
                    en: { type: Type.STRING },
                    es: { type: Type.STRING },
                    fr: { type: Type.STRING },
                    [additionalLang || 'pt']: { type: Type.STRING }
                  },
                  required: ["en", "es", "fr"]
                },
                types: {
                  type: Type.OBJECT,
                  properties: {
                    led: { type: Type.STRING },
                    voice: { type: Type.STRING },
                    social: { type: Type.STRING }
                  },
                  required: ["led", "voice", "social"]
                }
              },
              required: ["event", "languages", "types"]
            }
          }
        });

        parsedResult = JSON.parse(response.text?.trim() || "{}");
      } catch (geminiErr: any) {
        console.warn("Gemini API call failed during announcement generation. Falling back to offline simulator.", geminiErr.message);
        fallbackNeeded = true;
      }
    } else {
      fallbackNeeded = true;
    }

    if (fallbackNeeded) {
      // Offline fallback
      parsedResult = {
        event: `Simulated: ${eventDescription.substring(0, 30)}...`,
        languages: {
          en: `Attention: ${eventDescription}. Please cooperate with stadium personnel.`,
          es: `Atención: ${eventDescription}. Por favor, coopere con el personal del estadio.`,
          fr: `Attention: ${eventDescription}. S'il vous plaît coopérer avec le personnel du stade.`,
          [additionalLang || 'pt']: `Atenção: ${eventDescription}. Por favor, coopere com a equipe.`
        },
        types: {
          led: `ADVISORY: ${eventDescription.toUpperCase().substring(0, 40)}`,
          voice: `This is a public service announcement for all tournament guests. ${eventDescription}. Thank you for your support.`,
          social: `📢 Safety Announcement: ${eventDescription} #ZoneOn #FIFAWorldCup`
        }
      };
    }

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      event: parsedResult.event,
      timestamp: new Date().toISOString(),
      category: eventDescription.toLowerCase().includes("safety") || eventDescription.toLowerCase().includes("medical") ? "safety" : "event",
      languages: parsedResult.languages,
      types: parsedResult.types
    };

    announcements.unshift(newAnn);
    res.json(newAnn);

  } catch (err: any) {
    console.error("Gemini API Error in announcement generator:", err);
    res.status(500).json({ error: "Failed to generate announcement.", details: err.message });
  }
});

// AI Executive Operations Report Generator
app.post("/api/generate-summary", async (req, res) => {
  // Fetch live weather context
  let weatherText = "Weather: 24.5°C, Partly Cloudy, Wind 12.0km/h (Stable operating window)";
  try {
    const weatherRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=40.8136&longitude=-74.0744&current_weather=true");
    if (weatherRes.ok) {
      const weatherData: any = await weatherRes.json();
      if (weatherData && weatherData.current_weather) {
        const temp = weatherData.current_weather.temperature;
        const wind = weatherData.current_weather.windspeed;
        const code = weatherData.current_weather.weathercode;
        let cond = "Partly Cloudy";
        if (code === 0) cond = "Sunny & Clear";
        else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) cond = "Rainy / Showers";
        else if ([95, 96, 99].includes(code)) cond = "Severe Thunderstorms";
        weatherText = `Weather: ${temp}°C, ${cond}, Windspeed: ${wind}km/h`;
      }
    }
  } catch (weatherErr) {
    console.warn("Could not load weather context for report. Using fallback.");
  }

  const incidentSummary = incidents.filter(i => i.status === "active")
    .map(i => `Severity: ${i.severity.toUpperCase()} | Type: ${i.type} | Title: ${i.title} in ${i.zone}`)
    .join("\n");

  const transportSummary = transports
    .map(t => `${t.line} - Status: ${t.status} - Arrival: ${t.minutesToArrival} mins - Destination: ${t.destination}`)
    .join("\n");

  const prompt = `You are the lead FIFA World Cup 2026 Venue Operations Analyst.
Generate an Executive Operational intelligence report for stadium managers based on these metrics:
- Attendance: ${liveMetrics.attendance} / ${liveMetrics.capacity} (${Math.round((liveMetrics.attendance/liveMetrics.capacity)*100)}% capacity)
- Direct Staff deployed: ${liveMetrics.activeStaff} venue managers, ${liveMetrics.activeVolunteers} volunteers
- Sustainability: Sustainability Index of ${liveMetrics.sustainabilityScore}/100, Waste Recycled: ${liveMetrics.totalWasteRecycledKg} kg, Water Saved: ${liveMetrics.totalWaterSavedLiters} L.
- Live Weather: ${weatherText}
- Active Incidents Log:
${incidentSummary || "No critical incidents logged."}
- Transport and Crowd Log:
${transportSummary}

Your response must be styled in elegant, clean markdown with professional headers:
## 📊 FIFA WORLD CUP VENUE INTEL REPORT
### 1. EXECUTIVE SUMMARY
(Keep this brief, analytical, highly strategic and reassuring, directly referencing the current weather conditions: ${weatherText})

### 2. CROWD & CAPACITY FLOW ANALYSIS
(Analyze the 85%+ capacity impact and Gate 3 bottlenecking issues specifically, incorporating how the weather: ${weatherText} affects crowd behavior, e.g. rain driving fans indoors or heat stressing hydration zones, with estimated dispersing recommendations)

### 3. LOGISTICAL & TRANSPORT STATUS
(Analyze transit times, shuttle bus delays, airport metro load, and transit comfort based on weather)

### 4. INCIDENT LOG MITIGATION BLUEPRINT
(Actionable dispatch directives for active medical, lost_found, and sustainability overflow incidents)

### 5. AI OPERATIONS ACTION MATRIX
(Create a small tabular summary of high-priority dispatches: Task, Assigned Stakeholder, Urgency, Action Route)

Write clearly and avoid any fluffy introductory remarks, starting directly with the markdown structure.`;

  try {
    const ai = getAI();
    let reportText = "";
    let fallbackNeeded = false;

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            temperature: 0.6,
          }
        });
        reportText = response.text || "";
        if (!reportText) fallbackNeeded = true;
      } catch (geminiErr: any) {
        console.warn("Gemini API call failed during summary generation. Falling back to offline simulator.", geminiErr.message);
        fallbackNeeded = true;
      }
    } else {
      fallbackNeeded = true;
    }

    if (fallbackNeeded) {
      reportText = `## 📊 FIFA WORLD CUP VENUE INTEL REPORT (OFFLINE MODE)
### 1. EXECUTIVE SUMMARY
The venue is operating at **93.5% capacity** under **${weatherText}** with standard tournament flow. Active bottlenecks require minor queue diversion.

### 2. CROWD & CAPACITY FLOW ANALYSIS
* **Weather Operations Advisory:** With **${weatherText}** active, crowd comfort index remains within satisfactory limits. In case of rain, open auxiliary covered walkways.
* **Gate 3 Entrance:** Slow throughput in lanes 4/5. Recommended redirection to Gates 2 & 4.
* **Zone Heatmap:** Concourse North and East currently show highest density.

### 3. LOGISTICAL & TRANSPORT STATUS
* **Stadium Shuttle Bus A:** Undergoing a 14-minute delay due to traffic corridor congestion. Redirecting auxiliary fleet.
* **Airport Metro:** High density but standard flow.

### 4. INCIDENT LOG MITIGATION BLUEPRINT
* **Active Incidents Overview:** There are active incidents on file. Medical responder teams are dispatched, and custodial overflows are cleared according to triage checklists.
* **Bin overflow (Sec 218):** Janitorial supervisors notified for direct dispatch.`;
    }

    res.json({ report: reportText });
  } catch (err: any) {
    console.error("Gemini API Error in summary generator:", err);
    res.status(500).json({ error: "Failed to generate summary.", details: err.message });
  }
});

// ----------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ZoneOn AI Server booted successfully. Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
