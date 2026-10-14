import { useMemo, useState } from 'react';

const Portfolio = ({ projects = [], filters = [] }) => {
  const [active, setActive] = useState('All');
  // A filter change remounts the list (keyed), which lets the site motion
  // layer re-run its staggered row entrance for the newly rendered rows.
  const [interacted, setInteracted] = useState(false);

  const selectFilter = (f) => {
    setActive(f);
    setInteracted(true);
  };

  const visible = useMemo(
    () => (active === 'All' ? projects : projects.filter((p) => p.category === active)),
    [projects, active]
  );

  return (
    <section className="section" id="portfolio">
      <div className="sec-head">
        <h2 className="title reveal">Our Portfolio</h2>
        <p className="sub reveal">
          A selection of products I have designed and engineered — from multi-tenant SaaS platforms to
          real-time marketplaces.
        </p>
      </div>
      <div className="pf-filters">
        {filters.map((f) => (
          <button key={f} className={`pf-filter${active === f ? ' on' : ''}`} onClick={() => selectFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className={`pf-list${interacted ? ' pf-anim' : ''}`} key={interacted ? active : 'initial'}>
        {visible.map((p) => {
          const Row = p.link ? 'a' : 'div';
          const linkProps = p.link
            ? { href: p.link, target: '_blank', rel: 'noreferrer' }
            : {};
          return (
            <Row
              className={`pf-row${interacted ? '' : ' reveal'}`}
              key={p.num || p.title}
              {...linkProps}
              title={p.description}
            >
              <span className="pf-num">{p.num}</span>
              <div className="pf-main">
                <h3>
                  {p.title}
                  {p.link && <span className="pf-arrow"> ↗</span>}
                </h3>
                <span className="tech">{p.tech}</span>
                <p>{p.description}</p>
              </div>
              <span className="pf-side">
                <span className="cat">{p.category}</span>
                {p.link && <span className="visit">Visit site</span>}
              </span>
            </Row>
          );
        })}
      </div>
      <div className="pf-foot">
        <a className="btn-g" href="#contact">
          Order Now
        </a>
      </div>
    </section>
  );
};

export default Portfolio;
