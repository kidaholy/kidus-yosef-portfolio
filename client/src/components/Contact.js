import { useState } from 'react';
import { sendMessage } from '../api';
import { IconMail, IconPhone, IconLinkedin, IconGithub, IconSend } from './icons';

const Contact = ({ profile }) => {
  const { about = {}, socials = {} } = profile;
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ state: 'idle', text: '' });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status.state === 'sending') return;
    setStatus({ state: 'sending', text: '' });
    try {
      await sendMessage(form);
      setStatus({ state: 'ok', text: "Message sent — I'll get back to you soon." });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({ state: 'err', text: err.message || 'Something went wrong. Please try again.' });
    }
  };

  const links = [
    { k: 'EMAIL', v: about.email, href: `mailto:${about.email}`, ico: <IconMail /> },
    { k: 'PHONE', v: about.phone, href: `tel:${(about.phone || '').replace(/\s/g, '')}`, ico: <IconPhone /> },
    { k: 'LINKEDIN', v: (socials.linkedin || '').replace('https://www.', ''), href: socials.linkedin, ico: <IconLinkedin /> },
    { k: 'GITHUB', v: (socials.github || '').replace('https://', ''), href: socials.github, ico: <IconGithub /> },
  ].filter((l) => l.v);

  return (
    <section className="section" id="contact">
      <div className="sec-head">
        <h2 className="title reveal">Get In Touch</h2>
        <p className="sub reveal">
          Have a project in mind? Send a message — I usually reply within a day.
        </p>
      </div>
      <div className="contact-grid">
        <div className="contact-card reveal">
          <h3>Let's build something exceptional</h3>
          <p style={{ fontSize: 12.5, lineHeight: 1.8, color: 'var(--muted2)', margin: 0 }}>
            Available for freelance projects, full-time roles, and collaborations worldwide.
          </p>
          <div className="contact-links">
            {links.map(({ k, v, href, ico }) => (
              <a key={k} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                <span className="ico">{ico}</span>
                <span>
                  <span className="k">{k}</span>
                  {v}
                </span>
              </a>
            ))}
          </div>
        </div>
        <form className="contact-form reveal" onSubmit={onSubmit}>
          <label>
            YOUR NAME
            <input name="name" value={form.name} onChange={onChange} placeholder="Kidus Yosef" required maxLength={120} />
          </label>
          <label>
            YOUR EMAIL
            <input name="email" type="email" value={form.email} onChange={onChange} placeholder="kidus@gmail.com" required />
          </label>
          <label>
            MESSAGE
            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              placeholder="Tell me about your project…"
              required
              maxLength={4000}
            />
          </label>
          <div>
            <button className="btn-p" type="submit" disabled={status.state === 'sending'}>
              <IconSend /> {status.state === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </div>
          {status.text && (
            <p className={`form-note ${status.state === 'ok' ? 'ok' : 'err'}`} role="status">
              {status.text}
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default Contact;
