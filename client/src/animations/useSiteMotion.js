import { useLayoutEffect } from 'react';
import { createRegistry, ensureSiteMotion } from './siteMotion';
import { disableMotion, prefersReducedMotion } from './motion';

// Mounts the site-wide Anime.js layer once, applies animations to whatever
// markup currently exists, and re-applies them whenever new markup appears
// (async profile data, portfolio filters, route changes, admin inbox, ...).
//
// A single registry owns every animation/observer/listener so one cleanup
// reverts the whole thing — no duplicate triggers when navigating between
// routes and nothing left hidden if anything fails.
const useSiteMotion = () => {
  useLayoutEffect(() => {
    const root = document.getElementById('root') || document.body;
    const registry = createRegistry(prefersReducedMotion());

    const run = () => {
      try {
        ensureSiteMotion(registry, root);
      } catch {
        registry.rescue();
      }
    };

    // Pre-hide + animate before the first paint (layout effect runs pre-paint).
    run();

    // New markup (fetch results, filters, slides) is detected here; observed
    // mutations are child-list only, so Anime.js style writes never loop.
    const observer = new MutationObserver(run);
    observer.observe(root, { childList: true, subtree: true });

    // If the environment never delivers an animation frame (e.g. an occluded
    // window), stop animating and reveal everything — content must never be
    // left frozen half-hidden.
    let rafSeen = false;
    const rafProbe = requestAnimationFrame(() => {
      rafSeen = true;
    });
    const watchdog = setTimeout(() => {
      if (rafSeen) return;
      disableMotion();
      registry.reduced = true;
      registry.finalize();
    }, 1000);

    // Safety sweep: reveal anything still pending once it scrolls into view.
    let sweepRaf = 0;
    const sweep = () => {
      // rAF may never tick when the window is occluded; sweep directly then.
      if (!rafSeen) {
        registry.sweep();
        return;
      }
      if (sweepRaf) return;
      sweepRaf = requestAnimationFrame(() => {
        sweepRaf = 0;
        registry.sweep();
      });
    };
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep);
    const late1 = setTimeout(registry.sweep.bind(registry), 700);
    const late2 = setTimeout(registry.sweep.bind(registry), 2200);
    // Content must never be withheld: if anything is still hidden shortly after
    // load, show it. Also covers late-arriving sections (e.g. a slow API).
    const revealSafety = setTimeout(registry.revealHidden.bind(registry), 1500);
    const revealSafetyLate = setTimeout(registry.revealHidden.bind(registry), 3000);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', sweep);
      window.removeEventListener('resize', sweep);
      cancelAnimationFrame(rafProbe);
      if (sweepRaf) cancelAnimationFrame(sweepRaf);
      clearTimeout(watchdog);
      clearTimeout(late1);
      clearTimeout(late2);
      clearTimeout(revealSafety);
      clearTimeout(revealSafetyLate);
      registry.revert();
    };
  }, []);
};

export default useSiteMotion;
