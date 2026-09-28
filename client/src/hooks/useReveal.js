import { useEffect } from 'react';

// Adds `.in` to `.reveal` elements as they enter the viewport.
//
// Robust by design: in-view elements are revealed synchronously on mount (no
// waiting for events), and the check re-runs on scroll, resize, any click
// (capture phase — catches programmatic smooth-scrolls and edge cases where
// scroll events don't fire) and once more after 300ms for late layout shifts.
// Re-runs when `deps` change (e.g. late-mounted API data).
const revealInView = () => {
  const vh = window.innerHeight;
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < vh - 30 && r.bottom > 0) el.classList.add('in');
  });
};

const useReveal = (deps = []) => {
  useEffect(() => {
    revealInView();

    const onReveal = () => revealInView();
    window.addEventListener('scroll', onReveal, { passive: true });
    window.addEventListener('resize', onReveal);
    document.addEventListener('click', onReveal, true);
    document.addEventListener('pointerdown', onReveal, true);
    const t = setTimeout(onReveal, 300);

    return () => {
      window.removeEventListener('scroll', onReveal);
      window.removeEventListener('resize', onReveal);
      document.removeEventListener('click', onReveal, true);
      document.removeEventListener('pointerdown', onReveal, true);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useReveal;
