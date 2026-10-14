const Footer = ({ onNavigate, items = [], cvPath = '/kidus-yosef-cv.pdf' }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p style={{ margin: 0 }}>© {year} Kidus Yosef · Addis Ababa, Ethiopia</p>
        <nav aria-label="Footer">
          {items.map(({ id, label }) => (
            <button key={id} className="nav-link" onClick={() => onNavigate(id)}>
              {label}
            </button>
          ))}
          <a className="nav-link" href="/cv">
            CV
          </a>
          <a className="nav-link" href="/messages">
            Messages
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
