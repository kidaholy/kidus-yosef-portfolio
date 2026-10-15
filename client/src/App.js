import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { fetchPortfolio } from './api';
import useSiteMotion from './animations/useSiteMotion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Stats from './components/Stats';
import Portfolio from './components/Portfolio';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Messages from './pages/Messages';
import Cv from './components/Cv';
import './App.css';

const fallbackProfile = {
  name: 'Kidus Yosef',
  firstName: 'Kidus',
  lastName: 'Yosef',
  title: 'Full-Stack Developer',
  heroKicker: 'Hello, I am',
  heroSub: 'A Professional Full-Stack Developer and UI/UX Designer.',
  stats: [],
  about: {},
  skillBars: [],
  services: [],
  portfolioFilters: ['All'],
  testimonials: [],
  cta: {},
  posts: [],
  cvPath: '/kidus-yosef-cv.pdf',
};

// The last successful profile is cached so a returning visitor renders every
// section immediately instead of waiting on the API for the first paint.
const PROFILE_CACHE_KEY = 'kidus-portfolio-profile-v1';

const readCachedProfile = () => {
  try {
    const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && parsed.name ? parsed : {};
  } catch {
    return {};
  }
};

const cacheProfile = (data) => {
  try {
    window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
  } catch {
    /* private mode / quota — caching is optional */
  }
};

const Home = ({ profile }) => (
  <main>
    <Hero profile={profile} />
    <About profile={profile} />
    <Services services={profile.services || []} />
    <Experience experience={profile.experience || []} />
    <Skills
      skillGroups={profile.skillGroups || []}
      certifications={profile.certifications || []}
    />
    <Stats stats={profile.stats || []} />
    <Portfolio projects={profile.projects || []} filters={profile.portfolioFilters || ['All']} />
    <Testimonials testimonials={profile.testimonials || []} />
    <Contact profile={profile} />
  </main>
);

function App() {
  const [profile, setProfile] = useState(() => ({ ...fallbackProfile, ...readCachedProfile() }));
  const location = useLocation();
  const navigate = useNavigate();
  // Site-wide Anime.js motion layer (reveals, scroll effects, hover, ...).
  // It re-scans automatically as profile data / filters / routes render.
  useSiteMotion();

  // Loads the profile; fetchPortfolio already retries transient failures. If it
  // still isn't loaded, one more attempt is made when the tab becomes visible
  // or the connection returns, so a late-starting API needs no manual reload.
  const loadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    const load = async () => {
      if (inFlight || loadedRef.current) return;
      inFlight = true;
      try {
        const data = await fetchPortfolio();
        if (!cancelled) {
          const next = { ...fallbackProfile, ...data };
          setProfile(next);
          cacheProfile(next);
          loadedRef.current = true;
        }
      } catch {
        /* retried above and by the listeners below */
      } finally {
        inFlight = false;
      }
    };

    const retryWhenAvailable = () => {
      if (document.visibilityState === 'visible') load();
    };

    load();
    document.addEventListener('visibilitychange', retryWhenAvailable);
    window.addEventListener('online', retryWhenAvailable);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', retryWhenAvailable);
      window.removeEventListener('online', retryWhenAvailable);
    };
  }, []);

  // Scroll to top on route change (SPA navigation)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const scrollTo = (id) => {
    if (id === 'cv') {
      navigate('/cv');
      return;
    }
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'about', label: 'About Me' },
    { id: 'services', label: 'Services' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'cv', label: 'CV' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <div className="App app">
      <Navbar items={navItems} onNavigate={scrollTo} onHire={() => scrollTo('contact')} />
      <Routes>
        <Route path="/" element={<Home profile={profile} />} />
        <Route path="/cv" element={<Cv />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer onNavigate={scrollTo} items={navItems} cvPath={profile.cvPath} />
    </div>
  );
}

export default App;
