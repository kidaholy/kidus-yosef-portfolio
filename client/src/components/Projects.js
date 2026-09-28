const Projects = ({ projects }) => (
  <section className="section" id="projects">
    <div className="section-heading">
      <span className="chip reveal">WHAT I'VE BUILT</span>
      <h2 className="sec-h reveal">Featured Projects</h2>
    </div>
    <div className="projects-grid">
      {projects.map((p) => (
        <article className="glass project-card reveal" key={p.num || p.title}>
          <div className="pnum">{p.num}</div>
          <h3>{p.title}</h3>
          <div className="tech">{p.tech}</div>
          <p>{p.description}</p>
        </article>
      ))}
    </div>
  </section>
);

export default Projects;
