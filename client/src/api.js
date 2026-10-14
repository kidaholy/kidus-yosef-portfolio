// Dev default: local API server. Production (.env.production): same-origin /api.
const API_URL =
  process.env.REACT_APP_API_URL !== undefined
    ? process.env.REACT_APP_API_URL.replace(/\/$/, '')
    : 'http://localhost:5000';

const jsonFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

export const fetchPortfolio = () => jsonFetch('/api/portfolio');

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
