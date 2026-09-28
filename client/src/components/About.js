import { IconSend } from './icons';

const About = ({ profile }) => {
  const { about = {}, skillBars = [] } = profile;

  return (
    <section className="section" id="about">
      <div className="about-card reveal">
        <div className="about-body">
          <h2 className="title">{about.heading}</h2>
          {(about.paragraphs || []).map((text, i) => (
            <p key={i}>{text}</p>
          ))}
          <div className="skill-bars">
            {skillBars.map(({ name, pct }) => (
              <div className="skill-bar" key={name}>
                <div className="row">
                  <span>{name}</span>
                  <span>{pct}%</span>
                </div>
                <div className="track">
                  <i style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="about-actions">
            <a className="btn-p" href="#contact">
              <IconSend /> Hire Me!
            </a>
            <a
              className="btn-g"
              href="#experience"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              About Me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
