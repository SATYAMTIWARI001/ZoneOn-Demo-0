import { Incident, TransportStatus, Announcement } from "./src/types";

async function runTests() {
  console.log("\n==================================================");
  console.log("🚀 STARTING ZONEON AI ENDPOINT INTEGRATION TESTS");
  console.log("==================================================\n");

  const BASE_URL = "http://localhost:3000";
  let passedTests = 0;
  let failedTests = 0;

  async function assert(name: string, condition: boolean, message?: string) {
    if (condition) {
      console.log(` ✅ [PASS] ${name}`);
      passedTests++;
    } else {
      console.error(` ❌ [FAIL] ${name}${message ? " - " + message : ""}`);
      failedTests++;
    }
  }

  // Test 1: Health check endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert("Health endpoint returns status 200", res.status === 200);
    const data = await res.json();
    assert("Health status content is 'ok'", data.status === "ok");
  } catch (err: any) {
    assert("Health check executed successfully", false, err.message);
  }

  // Test 2: Live Weather advisory endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/weather`);
    assert("Weather endpoint returns status 200", res.status === 200);
    const data = await res.json();
    assert("Weather data includes location name", typeof data.location === "string" && data.location.includes("MetLife"));
    assert("Weather data contains temperature", typeof data.temperature === "number");
    assert("Weather data contains valid weather condition", typeof data.condition === "string");
  } catch (err: any) {
    assert("Weather endpoint executed successfully", false, err.message);
  }

  // Test 3: Get Incidents List
  try {
    const res = await fetch(`${BASE_URL}/api/incidents`);
    assert("Get incidents returns status 200", res.status === 200);
    const data: Incident[] = await res.json();
    assert("Incidents is a non-empty array", Array.isArray(data) && data.length > 0);
    assert("Incident objects contain id and status", data[0].id !== undefined && data[0].status === "active");
  } catch (err: any) {
    assert("Get incidents list executed successfully", false, err.message);
  }

  // Test 4: Post New Incident
  try {
    const testIncident = {
      type: "medical",
      title: "Test Heat Cramp Section 202",
      description: "Volunteer reported fan feeling moderate muscle cramps from warmth.",
      zone: "Zone C (South Stand)",
      severity: "medium"
    };

    const res = await fetch(`${BASE_URL}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testIncident)
    });

    assert("Post incident returns status 201", res.status === 201);
    const data: Incident = await res.json();
    assert("Created incident contains a unique id", data.id.startsWith("inc-"));
    assert("Created incident is marked active", data.status === "active");
    assert("Created incident matches input title", data.title === testIncident.title);
  } catch (err: any) {
    assert("Post incident executed successfully", false, err.message);
  }

  // Test 5: Get Transit schedules
  try {
    const res = await fetch(`${BASE_URL}/api/transport`);
    assert("Transit endpoint returns status 200", res.status === 200);
    const data: TransportStatus[] = await res.json();
    assert("Transit lines returns a valid list", Array.isArray(data) && data.length > 0);
    assert("Transit objects contain line names", typeof data[0].line === "string");
  } catch (err: any) {
    assert("Get transit schedules executed successfully", false, err.message);
  }

  // Test 6: Adjust Transit schedule link
  try {
    const adjustPayload = {
      index: 0,
      status: "delayed",
      minutesToArrival: 18
    };

    const res = await fetch(`${BASE_URL}/api/transport/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adjustPayload)
    });

    assert("Update transport returns status 200", res.status === 200);
    const updatedLine: TransportStatus = await res.json();
    assert("Updated transit line matches new delay", updatedLine.status === "delayed");
    assert("Updated transit line matches new duration", updatedLine.minutesToArrival === 18);
  } catch (err: any) {
    assert("Adjust transit schedule executed successfully", false, err.message);
  }

  // Test 7: AI Auto-Triage endpoint (raw dispatch classification)
  try {
    const rawTriageReport = {
      rawReport: "elderly fan slipped on beer puddle near section 108 medical tent, looks like a twisted ankle"
    };

    const res = await fetch(`${BASE_URL}/api/incidents/triage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rawTriageReport)
    });

    assert("AI triage endpoint returns status 200", res.status === 200);
    const triageResult = await res.json();
    assert("AI triage successfully classified category as medical", triageResult.category === "medical");
    assert("AI triage classified severity as high or medium", triageResult.severity === "high" || triageResult.severity === "medium");
    assert("AI triage drafted a custom title", typeof triageResult.title === "string" && triageResult.title.length > 0);
    assert("AI triage returned recommended action checklists", Array.isArray(triageResult.suggestedActions) && triageResult.suggestedActions.length > 0);
  } catch (err: any) {
    assert("AI Triage endpoint executed successfully", false, err.message);
  }

  // Test 8: Get Announcements List
  try {
    const res = await fetch(`${BASE_URL}/api/announcements`);
    assert("Get announcements returns status 200", res.status === 200);
    const data: Announcement[] = await res.json();
    assert("Announcements returned as array", Array.isArray(data));
  } catch (err: any) {
    assert("Get announcements executed successfully", false, err.message);
  }

  // Test 9: Conversational Agent Chat API (Mock or Live mode check)
  try {
    const chatPayload = {
      role: "fan",
      message: "Where is the nearest food stand?",
      history: []
    };

    const res = await fetch(`${BASE_URL}/api/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chatPayload)
    });

    assert("Conversational agent API returns status 200", res.status === 200);
    const data = await res.json();
    assert("Agent replied with a content string", typeof data.reply === "string" && data.reply.length > 0);
  } catch (err: any) {
    assert("Conversational agent API executed successfully", false, err.message);
  }

  console.log("\n==================================================");
  console.log("🏁 ZONEON AI INTEGRATION TESTING COMPLETE");
  console.log(` 🏆 PASSED: ${passedTests} | ⚠️ FAILED: ${failedTests}`);
  console.log("==================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
