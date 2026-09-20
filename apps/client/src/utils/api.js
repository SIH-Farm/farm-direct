// ============================================
// Central API client
// ============================================
// Requests go to a RELATIVE `/api/...` path by default so the app keeps working
// from other devices / LAN / any deployed host (Vite proxies `/api` to the
// Express server on :3001 — see vite.config.js).
// Point VITE_API_URL at an absolute origin (e.g. https://api.farmdirect.in/api)
// when the API is hosted elsewhere.

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export function apiUrl(path = '') {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `Request to ${path} failed (HTTP ${res.status})`);
  }

  return json.data;
}

export const apiGet = (path) => request(path, { method: 'GET' });

export const apiPost = (path, body) =>
  request(path, { method: 'POST', body: JSON.stringify(body) });

export const apiPatch = (path, body) =>
  request(path, { method: 'PATCH', body: JSON.stringify(body) });

export const apiDelete = (path) => request(path, { method: 'DELETE' });
