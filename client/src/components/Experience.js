import { useEffect, useRef, useState } from 'react';

const Experience = ({ experience = [] }) => {
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);

  // Keep the active card centered in its horizontal scroll track
  const center = (idx) => {
    const track = trackRef.current;
    const card = track?.children[idx];
    if (!track || !card) return;
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    center(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!experience.length) return null;

  return (
    <section className="section" id="experience">
      <div className="sec-head">
        <h2 className="title reveal">My Journey</h2>
        <p className="sub reveal">Professional roles and what I delivered in each.</p>
        <div className="exp-nav">
          {experience.map((exp, idx) => (
            <button
              key={exp.company}
              className={`exp-dot${idx === active ? ' on' : ''}`}
              onClick={() => setActive(idx)}
              aria-label={`Show ${exp.company} role`}
            />
          ))}
        </div>
      </div>

      <div className="exp-slider">
        <button
          className="tm-arrow prev"
          onClick={() => setActive((v) => (v - 1 + experience.length) % experience.length)}
          aria-label="Previous role"
        >
          ‹
        </button>

        <div className="exp-viewport">
          <div
            className="exp-track"
            ref={trackRef}
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {experience.map((exp, idx) => (
              <article
                className={`exp-slide${idx === active ? ' active' : ''}`}
                key={`${exp.company}-${exp.period}`}
                aria-hidden={idx !== active}
              >
                <span className="exp-when">{exp.period}</span>
                <h3 className="exp-co">
                  {exp.link ? (
                    <a href={exp.link} target="_blank" rel="noreferrer">
                      {exp.company}
                    </a>
                  ) : (
                    exp.company
                  )}
                </h3>
                <div className="exp-meta">
                  {exp.role}
                  {exp.location ? ` · ${exp.location}` : ''}
                </div>
                <ul className="exp-points">
                  {exp.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {experience.length > 1 && (
            <div className="exp-progress">
              <div
                className="exp-progress-fill"
                style={{ width: `${((active + 1) / experience.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        <button
          className="tm-arrow next"
          onClick={() => setActive((v) => (v + 1) % experience.length)}
          aria-label="Next role"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default Experience;
