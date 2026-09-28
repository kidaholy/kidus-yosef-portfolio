import { useState } from 'react';

const icons = {
  code: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </svg>
  ),
  pen: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
  cart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  cloud: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  ),
  chart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 16l4-6 4 3 5-8" />
    </svg>
  ),
};

const Services = ({ services = [] }) => {
  const [active, setActive] = useState(0);
  const current = services[active] || {};

  return (
    <section className="section" id="services">
      <div className="sec-head">
        <h2 className="title reveal">Our Services</h2>
        <p className="sub reveal">
          Everything you need to launch and grow a modern digital product — from first wireframe to a
          monitored production deployment.
        </p>
      </div>
      <div className="svc-grid reveal">
        {services.map((s, i) => (
          <button
            key={s.key}
            className={`svc${i === active ? ' on' : ''}`}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
          >
            <span className="ico">{icons[s.icon] || icons.code}</span>
            {s.label}
          </button>
        ))}
      </div>
      {current.title && (
        <div className="svc-panel" key={active}>
          <h3>{current.title}</h3>
          <p>{current.desc}</p>
          <a className="btn-p" href="#contact">
            Order Now
          </a>
        </div>
      )}
    </section>
  );
};

export default Services;
