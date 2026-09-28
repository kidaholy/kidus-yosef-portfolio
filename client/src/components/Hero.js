import { IconDoc, IconArrow, IconMail, IconSend } from './icons';

const Hero = ({ profile }) => {
  const {
    heroKicker = 'Hello, I am',
    name = '',
    heroSub = '',
    tagline = '',
    cvPath = '/kidus-yosef-cv.pdf',
    availability = '',
  } = profile;

  return (
    <div className="hero-wrap" id="top">
      <div className="hero-card">
        <div className="hero-grid">
          <div className="hero-copy">
            {availability && (
              <span className="avail-badge fade-up">
                <span className="dot" /> {availability}
              </span>
            )}
            <span className="chip fade-up" style={{ animationDelay: '0.1s' }}>
              {heroKicker}
            </span>
            <h1 className="hero-name fade-up" style={{ animationDelay: '0.2s' }}>
              {name.split(' ').map((word, i) => (
                <span key={i}>
                  {i === 1 ? <span className="grad-text">{word}</span> : word}
                  {i < name.split(' ').length - 1 ? ' ' : ''}
                </span>
              ))}
            </h1>
            <p className="hero-sub fade-up" style={{ animationDelay: '0.3s' }}>{heroSub}</p>
            {tagline && (
              <p className="hero-tag fade-up" style={{ animationDelay: '0.38s' }}>{tagline}</p>
            )}
            <div className="hero-actions fade-up" style={{ animationDelay: '0.46s' }}>
              <a className="btn-p" href={cvPath} target="_blank" rel="noreferrer">
                <IconDoc /> Download CV
              </a>
              <a
                className="btn-g"
                href="#portfolio"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                My Work
              </a>
              <a
                className="btn-g"
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <IconMail /> Hire Me
              </a>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-glow" />
            <div className="hero-ring r2" />
            <div className="hero-ring r1" />
            <img className="portrait photo" src="/kidus-portrait.png" alt={name} />
            <div className="float-card fc1">
              <span className="fc-ico">
                <IconSend />
              </span>
              <span>
                <span className="fc-val">5+ Projects</span>
                <br />
                <span className="fc-lbl">Across 3 industries</span>
              </span>
            </div>
            <div className="float-card fc2">
              <span className="fc-ico">
                <IconArrow />
              </span>
              <span>
                <span className="fc-val">4+ Years</span>
                <br />
                <span className="fc-lbl">Production experience</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
