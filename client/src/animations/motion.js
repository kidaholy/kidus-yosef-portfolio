import { utils } from 'animejs';

// ---------------------------------------------------------------------------
// Shared motion tokens and helpers for every Anime.js animation on the site.
// Keeping these in one place keeps timings/easing consistent and lets the rest
// of the codebase stay focused on *what* is animated, not *how*.
// ---------------------------------------------------------------------------

export const REDUCE_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Global "can we actually run animation frames?" switch. It starts enabled and
// is turned off by the motion layer if requestAnimationFrame never ticks (an
// occluded/background window), so content is never left frozen half-hidden.
let motionEnabled = true;
export const isMotionEnabled = () => motionEnabled;
export const disableMotion = () => {
  motionEnabled = false;
};

// Easing token names use Anime.js v4 string syntax, e.g. 'out(3)'.
export const EASE = {
  out: 'out(3)',
  soft: 'out(2)',
  inOut: 'inOut(2.5)',
  expo: 'out(4)',
  linear: 'linear',
};

export const DUR = {
  fast: 420,
  base: 700,
  reveal: 780,
  medium: 900,
  slow: 1200,
  counter: 1500,
};

// Scroll threshold: start the animation once the element's bottom edge is
// ~40px past the top of the viewport (i.e. it has just entered the screen).
export const ENTER_THRESHOLD = 'bottom-=40 top';

export const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia(REDUCE_MOTION_QUERY).matches;
  } catch {
    return false;
  }
};

// True once an element has reached the viewport (or been scrolled past). Note
// there is deliberately no `bottom > 0` check: content jumped over with an
// anchor link or a fast scroll must still end up revealed, never stuck hidden.
export const isInView = (el, ratio = 0.92) => {
  if (!el || typeof el.getBoundingClientRect !== 'function') return false;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  return rect.top < vh * ratio;
};

// Force targets into their natural, fully-visible state. Used as the safety
// net so no element is ever left hidden if an animation fails to run.
export const forceVisible = (targets) => {
  if (!targets) return;
  const iterable = typeof targets[Symbol.iterator] === 'function' && !targets.nodeType;
  const list = iterable ? Array.from(targets) : [targets];
  if (!list.length) return; // never hand Anime.js an empty target set
  try {
    utils.set(list, { opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 });
  } catch {
    /* never let the safety net throw */
  }
};

// An element is "ready" to animate once it actually has visible content. This
// prevents animating empty placeholders before async profile data arrives.
export const hasContent = (el) => {
  if (!el) return false;
  if (!el.textContent) return true;
  return el.textContent.trim().length > 0;
};
