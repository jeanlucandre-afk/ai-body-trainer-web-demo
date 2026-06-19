import { chromium } from "playwright";

const apiBase = process.env.SMOKE_API_BASE ?? "https://ai-personal-trainer-whatsapp-mvp.vercel.app";
const webBase = process.env.SMOKE_WEB_BASE ?? "https://ai-body-trainer-web-demo.vercel.app";

function assert(condition, message, details) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

async function jsonFetch(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
}

async function bootstrap(displayName, payload = {}) {
  const { response, body } = await jsonFetch(`${apiBase}/api/demo/bootstrap`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ displayName, ...payload })
  });
  assert(response.ok && body?.workoutUrl && body?.workoutSessionId, "demo bootstrap failed", body);
  return body;
}

async function main() {
  const health = await fetch(`${apiBase}/health`);
  assert(health.status === 200, "backend health failed", { status: health.status });

  const userA = await bootstrap("Smoke A", {
    goals: ["Gain strength"],
    injuries: ["Knee"]
  });
  const userB = await bootstrap("Smoke B");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const apiHits = [];
  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/api/")) apiHits.push({ path: new URL(url).pathname, status: response.status() });
  });

  await page.goto(userA.workoutUrl, { waitUntil: "networkidle", timeout: 60000 });
  const bodyText = await page.locator("body").innerText({ timeout: 15000 });
  assert(!page.url().includes("token="), "magic token remained in browser URL", { url: page.url() });
  assert(/Workout|Training|Gym/i.test(bodyText), "workout UI did not render expected content", { bodyText });
  assert(!bodyText.includes("API base URL is not configured"), "web app is missing API configuration");
  assert(apiHits.some((hit) => hit.path === "/api/auth/link/exchange" && hit.status === 200), "link exchange API was not called successfully", apiHits);
  assert(apiHits.some((hit) => hit.path.includes("/api/workout-sessions/") && hit.status === 200), "session API was not called successfully", apiHits);

  const ownSession = await context.request.get(`${webBase}/api/workout-sessions/${userA.workoutSessionId}`);
  assert(ownSession.status() === 200, "own session fetch failed", { status: ownSession.status(), body: await ownSession.text() });
  const sessionBody = await ownSession.json();
  assert(sessionBody.session_id === userA.workoutSessionId, "session ID mismatch", sessionBody);
  assert(Array.isArray(sessionBody.exercises) && sessionBody.exercises.length > 0, "session has no exercises", sessionBody);
  assert(sessionBody.safety_state === "normal", "new session should start normal", sessionBody);

  const duplicateEventId = `smoke_${Date.now()}`;
  const eventPayload = { eventId: duplicateEventId, eventType: "set_completed", payload: { source: "production-smoke" } };
  const firstEvent = await context.request.post(`${webBase}/api/workout-sessions/${userA.workoutSessionId}/events`, { data: eventPayload });
  const secondEvent = await context.request.post(`${webBase}/api/workout-sessions/${userA.workoutSessionId}/events`, { data: eventPayload });
  assert(firstEvent.status() === 200, "first event post failed", { status: firstEvent.status(), body: await firstEvent.text() });
  assert(secondEvent.status() === 200, "duplicate event post failed", { status: secondEvent.status(), body: await secondEvent.text() });
  assert((await secondEvent.json()).duplicate === true, "duplicate event was not deduped");

  const painEvent = await context.request.post(`${webBase}/api/workout-sessions/${userA.workoutSessionId}/events`, {
    data: { eventId: `${duplicateEventId}_pain`, eventType: "pain_reported", payload: { source: "production-smoke" } }
  });
  assert(painEvent.status() === 200, "pain event failed", { status: painEvent.status(), body: await painEvent.text() });
  const escalated = await (await context.request.get(`${webBase}/api/workout-sessions/${userA.workoutSessionId}`)).json();
  assert(escalated.safety_state === "human_escalation", "pain report did not reflect safety escalation", escalated);

  const completion = await context.request.post(`${webBase}/api/workout-sessions/${userA.workoutSessionId}/events`, {
    data: { eventId: `${duplicateEventId}_complete`, eventType: "session_completed", payload: { source: "production-smoke" } }
  });
  assert(completion.status() === 200, "completion event failed", { status: completion.status(), body: await completion.text() });
  const completed = await (await context.request.get(`${webBase}/api/workout-sessions/${userA.workoutSessionId}`)).json();
  assert(completed.status === "completed", "completion did not update session status", completed);

  const crossFetch = await context.request.get(`${webBase}/api/workout-sessions/${userB.workoutSessionId}`);
  assert(crossFetch.status() === 404, "cross-member session fetch was not blocked", { status: crossFetch.status(), body: await crossFetch.text() });

  const unauth = await fetch(`${webBase}/api/workout-sessions/${userA.workoutSessionId}`);
  assert(unauth.status === 401, "unauthenticated session fetch was not blocked", { status: unauth.status, body: await unauth.text() });

  const userBUrl = new URL(userB.workoutUrl);
  const wrongToken = await jsonFetch(`${webBase}/api/auth/link/exchange`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: userBUrl.searchParams.get("token"), sessionId: userA.workoutSessionId })
  });
  assert(wrongToken.response.status === 403, "wrong-session token exchange was not blocked", wrongToken.body);

  await browser.close();
  console.log(JSON.stringify({
    ok: true,
    apiBase,
    webBase,
    checked: [
      "health",
      "magic_link_browser",
      "token_stripping",
      "session_mapping",
      "event_dedupe",
      "pain_safety_state",
      "completion_state",
      "cross_member_isolation",
      "unauthenticated_block",
      "wrong_token_block"
    ]
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  if (error.details) console.error(JSON.stringify(error.details, null, 2));
  process.exit(1);
});
