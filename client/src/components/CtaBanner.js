const CtaBanner = ({ cta = {} }) => (
  <section className="section" id="cta">
    <div
      className="cta-banner reveal"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/cta-bg.svg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <span className="kicker">{cta.kicker || 'Want to work with me?'}</span>
      <h2>{cta.title || 'I Am Available for Freelancing'}</h2>
      <a className="btn-p" href="#contact">
        Hire Me!
      </a>
    </div>
  </section>
);

export default CtaBanner;
