import { useEffect, useRef, useState } from 'react';
import { playSlideIn } from '../animations/siteMotion';

const AUTO_MS = 6000;

const Testimonials = ({ testimonials = [] }) => {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);
  const trackRef = useRef(null);
  const n = testimonials.length;

  const go = (idx) => setI(((idx % n) + n) % n);

  // Auto-shuffle: advance every 6s, pause on hover/touch
  useEffect(() => {
    if (paused || n <= 1) return undefined;
    timer.current = setInterval(() => setI((v) => (v + 1) % n), AUTO_MS);
    return () => clearInterval(timer.current);
  }, [paused, n]);

  // Replay a staggered entrance for the newly active quote.
  useEffect(() => {
    if (!n) return;
    playSlideIn(trackRef.current?.children[i], { step: 45 });
  }, [i, n]);

  if (!testimonials.length) return null;

  return (
    <section className="section" id="testimonials">
      <div className="sec-head">
        <h2 className="title reveal">Testimonials</h2>
        <p className="sub reveal">What clients say after shipping products together — in their own words.</p>
      </div>

      <div
        className="tm-slider reveal in"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <button className="tm-arrow prev" onClick={() => go(i - 1)} aria-label="Previous testimonial">
          ‹
        </button>

        <div className="tm-viewport">
          <div
            className="tm-track"
            ref={trackRef}
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {testimonials.map((t, idx) => (
              <figure
                className={`tm-slide${idx === i ? ' active' : ''}`}
                key={t.name}
                aria-hidden={idx !== i}
              >
                {t.image ? (
                  <img className="pic-logo" src={t.image} alt={`${t.name} logo`} />
                ) : (
                  <span className="pic-initial">{(t.name || '?').trim()[0]}</span>
                )}
                <figcaption>
                  <div className="name">{t.name}</div>
                  {t.role && <div className="role">{t.role}</div>}
                </figcaption>
                <p className="quote-text">“{t.text}”</p>
              </figure>
            ))}
          </div>
        </div>

        <button className="tm-arrow next" onClick={() => go(i + 1)} aria-label="Next testimonial">
          ›
        </button>
      </div>

      <div className="tm-dots">
        {testimonials.map((t, idx) => (
          <button
            key={t.name}
            className={`tm-dot${idx === i ? ' on' : ''}`}
            onClick={() => go(idx)}
            aria-label={`Show testimonial from ${t.name}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
