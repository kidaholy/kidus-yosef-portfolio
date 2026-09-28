import { useEffect, useRef, useState } from 'react';

const PER_VIEW = 2;

const Skills = ({ skillGroups = [], certifications = [] }) => {
  const [achStart, setAchStart] = useState(0);
  const stripRef = useRef(null);

  const maxStart = Math.max(0, certifications.length - PER_VIEW);

  // Slide the achievements strip when the start index changes
  // (translateX % is relative to the strip's own width, so one item = 100/n %)
  useEffect(() => {
    const strip = stripRef.current;
    if (strip && certifications.length) {
      strip.style.transform = `translateX(-${(achStart * 100) / certifications.length}%)`;
    }
  }, [achStart, certifications.length]);

  return (
    <section className="section" id="skills">
      <div className="sec-head">
        <h2 className="title reveal">My Toolkit</h2>
        <p className="sub reveal">Technologies and practices I work with every day.</p>
      </div>

      <div className="skills-grid">
        {skillGroups.map((group) => (
          <div className="skill-card" key={group.title}>
            <h3>{group.title}</h3>
            <div className="skill-tags">
              {(group.items || []).map((item) => (
                <span className="skill-pill" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
        {certifications.length > 0 && (
          <div className="skill-card ach-card">
            <h3>KEY ACHIEVEMENTS</h3>
            <div className="ach-viewport">
              <div className="ach-strip" ref={stripRef}>
                {certifications.map(({ name }) => (
                  <div className="ach-item" key={name}>
                    {name}
                  </div>
                ))}
              </div>
            </div>
            <div className="ach-arrows">
              <button
                className="tm-arrow sm"
                onClick={() => setAchStart((v) => Math.max(v - 1, 0))}
                disabled={achStart === 0}
                aria-label="Previous achievements"
              >
                ‹
              </button>
              <button
                className="tm-arrow sm"
                onClick={() => setAchStart((v) => Math.min(v + 1, maxStart))}
                disabled={achStart >= maxStart}
                aria-label="Next achievements"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
