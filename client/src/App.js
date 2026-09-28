import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { fetchPortfolio } from './api';
import useReveal from './hooks/useReveal';
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
  const [profile, setProfile] = useState(fallbackProfile);
  const location = useLocation();
  // Re-observe reveal elements whenever profile data (re)renders new sections
  useReveal([profile]);

  useEffect(() => {
    let cancelled = false;
    fetchPortfolio()
      .then((data) => {
        if (!cancelled) setProfile({ ...fallbackProfile, ...data });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll to top on route change (SPA navigation)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const scrollTo = (id) => {
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
    { id: 'contact', label: 'Contact Us' },
  ];

  const initials = `${(profile.firstName || 'K')[0]}${(profile.lastName || 'Y')[0]}`.toUpperCase();

  return (
    <div className="App app">
      <Navbar items={navItems} onNavigate={scrollTo} onHire={() => scrollTo('contact')} />
      <Routes>
        <Route path="/" element={<Home profile={profile} />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer onNavigate={scrollTo} items={navItems} cvPath={profile.cvPath} />
    </div>
  );
}

export default App;
