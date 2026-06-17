const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const hasApi = Boolean(API_BASE);

export async function exchangeMagicToken({ token, sessionId }) {
  if (!API_BASE || !token) return { ok: true, demo: true };
  return request("/api/auth/link/exchange", {
    method: "POST",
    body: JSON.stringify({ token, sessionId })
  });
}

export async function loadWorkoutSession(sessionId) {
  if (!API_BASE) throw new Error("API base URL is not configured");
  return request(`/api/workout-sessions/${sessionId}`, { method: "GET" });
}

export async function postWorkoutEvent(sessionId, eventType, payload = {}) {
  if (!API_BASE) return { ok: true, demo: true };
  return request(`/api/workout-sessions/${sessionId}/events`, {
    method: "POST",
    body: JSON.stringify({
      eventId: `${eventType}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      eventType,
      payload
    })
  });
}

export async function submitOnboarding(memberId, payload) {
  if (!API_BASE) return { ok: true, demo: true };
  return request(`/api/onboarding/${memberId}/submit`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed: ${response.status}`);
    error.status = response.status;
    error.details = data.details;
    throw error;
  }
  return data;
}
