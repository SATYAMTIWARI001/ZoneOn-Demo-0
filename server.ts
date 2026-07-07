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

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Incidents Endpoints
app.get("/api/incidents", (req, res) => {
  res.json(incidents);
});

app.post("/api/incidents", (req, res) => {
  const { type, title, description, zone, severity } = req.body;
  if (!type || !title || !description || !zone) {
    return res.status(400).json({ error: "Missing required fields for incident report." });
  }

  const newIncident: Incident = {
    id: `inc-${Date.now()}`,
    type,
    title,
    description,
    zone,
    status: "active",
    timestamp: new Date().toISOString(),
    severity: severity || "medium"
  };

  incidents.unshift(newIncident);
  res.status(201).json(newIncident);
});

app.post("/api/incidents/:id/resolve", (req, res) => {
  const { id } = req.params;
  const incident = incidents.find(inc => inc.id === id);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }
  incident.status = "resolved";
  res.json(incident);
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
  if (status) transports[index].status = status;
  if (minutesToArrival !== undefined) transports[index].minutesToArrival = Number(minutesToArrival);
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
  const { role, message, history } = req.body;
  
  if (!role || !message) {
    return res.status(400).json({ error: "Role and message are required." });
  }

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
      parts: [{ text: message }]
    });

    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I was unable to formulate a response at this moment. Please check server configurations.";
      res.json({ reply: replyText });
    } else {
      // Mock Responses in case API key is missing
      let replyText = `[OFFLINE MOCK RESPONSE for ${role.toUpperCase()}] I am operating in offline simulation mode because the Gemini API Key is missing. However, based on your query: "${message}", I recommend consulting Zone ${role === 'fan' ? 'A concessions' : 'C safety supervisors'} and checking our real-time incidents log immediately.`;
      if (message.toLowerCase().includes("help") || message.toLowerCase().includes("emergency")) {
        replyText += "\n\n🚨 EMERGENCY RECOMMENDATION: If there is an active medical event, please deploy the Section 104 medical team via the primary transport path immediately.";
      }
      res.json({ reply: replyText });
    }

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

    if (process.env.GEMINI_API_KEY) {
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
    } else {
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
- Active Incidents Log:
${incidentSummary || "No critical incidents logged."}
- Transport and Crowd Log:
${transportSummary}

Your response must be styled in elegant, clean markdown with professional headers:
## 📊 FIFA WORLD CUP VENUE INTEL REPORT
### 1. EXECUTIVE SUMMARY
(Keep this brief, analytical, highly strategic and reassuring)

### 2. CROWD & CAPACITY FLOW ANALYSIS
(Analyze the 85%+ capacity impact and Gate 3 bottlenecking issues specifically, with estimated dispersing recommendations)

### 3. LOGISTICAL & TRANSPORT STATUS
(Analyze transit times, shuttle bus delays, and airport metro load)

### 4. INCIDENT LOG MITIGATION BLUEPRINT
(Actionable dispatch directives for active medical, lost_found, and sustainability overflow incidents)

### 5. AI OPERATIONS ACTION MATRIX
(Create a small tabular summary of high-priority dispatches: Task, Assigned Stakeholder, Urgency, Action Route)

Write clearly and avoid any fluffy introductory remarks, starting directly with the markdown structure.`;

  try {
    const ai = getAI();
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.6,
        }
      });
      res.json({ report: response.text });
    } else {
      res.json({
        report: `## 📊 FIFA WORLD CUP VENUE INTEL REPORT (OFFLINE MODE)
### 1. EXECUTIVE SUMMARY
The venue is operating at **93.5% capacity** with standard tournament flow. Active bottlenecks require minor queue diversion.

### 2. CROWD & CAPACITY FLOW ANALYSIS
* **Gate 3 Entrance:** Slow throughput in lanes 4/5. Recommended redirection to Gates 2 & 4.
* **Zone Heatmap:** Concourse North and East currently show highest density.

### 3. LOGISTICAL & TRANSPORT STATUS
* **Stadium Shuttle Bus A:** Undergoing a 14-minute delay due to traffic corridor congestion. Redirecting auxiliary fleet.
* **Airport Metro:** High density but standard flow.

### 4. INCIDENT LOG MITIGATION BLUEPRINT
* **Heat Exhaustion (Sec 104):** Medical cart dispatched. First-aid tent alerted.
* **Bin overflow (Sec 218):** Janitorial supervisors notified for direct dispatch.`
      });
    }
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
