import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMessages, setMessageRead, deleteMessage } from '../api';

const prettyDate = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const Messages = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState({ user: 'admin', pass: '' });
  const [messages, setMessages] = useState([]);
  const [storeMode, setStoreMode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, storeMode: mode } = await fetchMessages(auth.user, auth.pass);
      setMessages(data);
      setStoreMode(mode || '');
      setLoaded(true);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
      setLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Messages · Kidus Yosef';
    return () => {
      document.title = 'Kidus Yosef';
    };
  }, []);

  const toggleRead = async (msg) => {
    try {
      await setMessageRead(auth.user, auth.pass, msg._id, !msg.read);
      setMessages((list) => list.map((m) => (m._id === msg._id ? { ...m, read: !msg.read } : m)));
    } catch (err) {
      setError(err.message);
    }
  };

  // Two-step inline delete confirmation (no native window.confirm dialog)
  const [confirmingId, setConfirmingId] = useState(null);

  const remove = async (msg) => {
    if (confirmingId !== msg._id) {
      setConfirmingId(msg._id);
      return;
    }
    setConfirmingId(null);
    try {
      await deleteMessage(auth.user, auth.pass, msg._id);
      setMessages((list) => list.filter((m) => m._id !== msg._id));
    } catch (err) {
      setError(err.message);
    }
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="messages-page">
      <div className="messages-head">
        <div>
          <span className="chip">ADMIN</span>
          <h1 className="title" style={{ marginTop: 12 }}>
            Messages {loaded ? `(${unread} unread)` : ''}
          </h1>
        </div>
        <button className="btn-g" onClick={() => navigate('/')}>
          ← Back to site
        </button>
      </div>

      <form className="glass contact-form" onSubmit={load} style={{ marginBottom: 20 }}>
        <label>
          ADMIN USER
          <input
            name="user"
            value={auth.user}
            onChange={(e) => setAuth((a) => ({ ...a, user: e.target.value }))}
            autoComplete="username"
          />
        </label>
        <label>
          ADMIN PASSWORD
          <input
            name="pass"
            type="password"
            value={auth.pass}
            onChange={(e) => setAuth((a) => ({ ...a, pass: e.target.value }))}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>
        <div>
          <button className="btn-p" type="submit" disabled={loading}>
            {loading ? 'Loading…' : 'Unlock Inbox'}
          </button>
        </div>
        {error && <p className="form-note err">{error}</p>}
        {!loaded && !error && (
          <p className="form-note">Enter the admin credentials to view the contact inbox.</p>
        )}
      </form>

      {loaded && storeMode === 'memory' && (
        <div className="store-warning" role="alert">
          ⚠️ Temporary storage — the database is not connected, so these messages will be lost when
          the server restarts. Whitelist your IP in MongoDB Atlas (Network Access → add{' '}
          <code>0.0.0.0/0</code>) to store messages permanently.
        </div>
      )}

      {loaded && messages.length === 0 && <p className="form-note">No messages yet.</p>}
      {messages.map((msg) => (
        <article className="glass msg-card" key={msg._id}>
          <div className="msg-top">
            <span className="who">{msg.name}</span>
            <a className="mail" href={`mailto:${msg.email}`}>
              {msg.email}
            </a>
            {!msg.read && <span className="unread-badge">NEW</span>}
            <span className="when">{prettyDate(msg.createdAt)}</span>
          </div>
          <p className="msg-body">{msg.message}</p>
          <div className="msg-actions">
            <button className="pill-btn" onClick={() => toggleRead(msg)}>
              Mark as {msg.read ? 'unread' : 'read'}
            </button>
            <button
              className={`pill-btn danger${confirmingId === msg._id ? ' arming' : ''}`}
              onClick={() => remove(msg)}
              onBlur={() => confirmingId === msg._id && setConfirmingId(null)}
            >
              {confirmingId === msg._id ? 'Click again to confirm' : 'Delete'}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default Messages;
