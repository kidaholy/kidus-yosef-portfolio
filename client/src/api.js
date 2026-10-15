// Base URL for API calls.
// - Explicit REACT_APP_API_URL wins when set to a non-empty value.
// - Production builds default to same-origin `/api` (rewritten to the
//   serverless function on Vercel) — NOT localhost. client/.env.production is
//   gitignored, so the build there must not depend on it to get this right.
// - Development falls back to the local API server.
const configuredUrl = process.env.REACT_APP_API_URL;
const API_URL =
  configuredUrl !== undefined && configuredUrl !== ''
    ? configuredUrl.replace(/\/$/, '')
    : process.env.NODE_ENV === 'production'
      ? ''
      : 'http://localhost:5000';

const jsonFetch = async (path, options = {}) => {
  const { timeout = 8000, ...rest } = options;
  // Bound every request so a hung (not refused) API can't stall the page.
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...rest,
      ...(controller ? { signal: controller.signal } : {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(data.message || `Request failed (${res.status})`);
      error.status = res.status;
      throw error;
    }
    return data;
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The API may still be starting (dev) or its serverless instance may be cold,
// so transient failures are retried instead of leaving the page without content.
const RETRY_DELAYS = [400, 900, 1800, 3000, 4000, 5000, 8000, 10000, 15000];

const withRetry = async (fn) => {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const retryable = !err.status || err.status >= 500;
      if (!retryable || attempt === RETRY_DELAYS.length) break;
      await sleep(RETRY_DELAYS[attempt]);
    }
  }
  throw lastError;
};

export const fetchPortfolio = () => withRetry(() => jsonFetch('/api/portfolio', { timeout: 6000 }));

export const sendMessage = (payload) =>
  jsonFetch('/api/messages', { method: 'POST', body: JSON.stringify(payload) });

const adminHeaders = (user, pass) => ({
  Authorization: `Basic ${btoa(`${user}:${pass}`)}`,
  'Content-Type': 'application/json',
});

export const fetchMessages = async (user, pass) => {
  const res = await fetch(`${API_URL}/api/messages`, {
    headers: adminHeaders(user, pass),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return {
    data,
    storeMode: res.headers.get('X-Store-Mode') || '',
  };
};

export const setMessageRead = (user, pass, id, read) =>
  jsonFetch(`/api/messages/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(user, pass),
    body: JSON.stringify({ read }),
  });

export const deleteMessage = (user, pass, id) =>
  jsonFetch(`/api/messages/${id}`, { method: 'DELETE', headers: adminHeaders(user, pass) });
