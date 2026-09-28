import { useEffect, useState } from 'react';

const Navbar = ({ items, onNavigate, onHire }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => {
      let current = '';
      items.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 160) current = id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);

  const go = (id) => {
    setOpen(false);
    onNavigate(id);
  };

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <button className="logo-word" onClick={() => go('top')} aria-label="Back to top">
          Kidus<span className="dot" />
        </button>
        <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          ☰
        </button>
        <nav className={`nav-items${open ? ' open' : ''}`} aria-label="Primary navigation">
          {items.map(({ id, label }) => (
            <button key={id} className={`nav-link${active === id ? ' on' : ''}`} onClick={() => go(id)}>
              {label}
            </button>
          ))}
          <button className="btn-p nav-cta" onClick={onHire}>
            Hire Me!
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
