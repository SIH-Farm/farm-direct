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

/**
 * Thrown when no API actually responded — as opposed to an API that responded with
 * an error. The distinction matters because a static-only deploy (no backend running)
 * must degrade gracefully, instead of showing the user an error they cannot act on.
 */
export class ApiUnreachableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiUnreachableError';
    this.unreachable = true;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(apiUrl(path), {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    throw new ApiUnreachableError(`Could not reach the API: ${err.message}`);
  }

  const json = await res.json().catch(() => null);

  // No JSON envelope means we never reached the API. On a static host `/api/*` is
  // typically rewritten to index.html, so this is "no backend", not a failed request.
  if (!json || typeof json !== 'object' || json.success === undefined) {
    throw new ApiUnreachableError(`No API responded at ${apiUrl(path)}`);
  }

  if (!res.ok || !json.success) {
    throw new Error(json.error || `Request to ${path} failed (HTTP ${res.status})`);
  }

  return json.data;
}

export const apiGet = (path) => request(path, { method: 'GET' });

export const apiPost = (path, body) =>
  request(path, { method: 'POST', body: JSON.stringify(body) });

export const apiPatch = (path, body) =>
  request(path, { method: 'PATCH', body: JSON.stringify(body) });

export const apiDelete = (path) => request(path, { method: 'DELETE' });
