import { animate, createTimeline, onScroll, stagger, svg, splitText, utils } from 'animejs';
import {
  DUR,
  EASE,
  ENTER_THRESHOLD,
  forceVisible,
  hasContent,
  isInView,
  isMotionEnabled,
  prefersReducedMotion,
} from './motion';

// ===========================================================================
// Reusable Anime.js animation utilities + the DOM scanner that applies them.
//
// Everything here is *additive motion*: it never changes text, structure or
// meaning. Elements are only ever pre-hidden by JavaScript (never hard-coded
// in CSS), so if this module fails to load the site still renders fully.
// ===========================================================================

// ---------------------------------------------------------------------------
// Registry: tracks every animation / observer / listener so a single revert()
// cleans everything up on unmount (no duplicated triggers, no leaked listeners).
// ---------------------------------------------------------------------------
export const createRegistry = (reduced = false) => ({
  reduced,
  animations: [],
  splits: [],
  cleanups: [],
  hoverEls: new Set(),
  touched: new Set(),
  done: new WeakSet(),
  bound: new WeakSet(),
  pending: new Set(),

  track(anim) {
    if (anim) this.animations.push(anim);
    return anim;
  },

  addCleanup(fn) {
    if (fn) this.cleanups.push(fn);
  },

  on(el, type, handler, options) {
    el.addEventListener(type, handler, options);
    this.cleanups.push(() => el.removeEventListener(type, handler, options));
  },

  touch(els) {
    if (!els) return;
    const iterable = typeof els[Symbol.iterator] === 'function' && !els.nodeType;
    (iterable ? Array.from(els) : [els]).forEach((el) => {
      if (el) this.touched.add(el);
    });
  },

  // Reveal anything that is still waiting, once it scrolls into view. This is
  // the belt-and-braces backstop for the scroll observers.
  sweep() {
    if (!this.pending.size) return;
    this.pending.forEach((entry) => {
      if (entry.fired) {
        this.pending.delete(entry);
        return;
      }
      if (isInView(entry.el)) entry.fire();
    });
  },

  // Last-resort recovery: make everything visible again.
  rescue() {
    this.touched.forEach((el) => forceVisible(el));
    this.pending.forEach((entry) => forceVisible(entry.el));
  },

  // Safety net for environments where animation frames never tick (occluded
  // window): snap every animated element to its final visible state so content
  // is never left frozen half-hidden.
  finalize() {
    this.touched.forEach((el) => forceVisible(el));
    this.pending.forEach((entry) => forceVisible(entry.el));
  },

  revert() {
    this.animations.forEach((a) => {
      try {
        a.revert && a.revert();
      } catch {
        /* ignore */
      }
    });
    this.splits.forEach((s) => {
      try {
        s.revert && s.revert();
      } catch {
        /* ignore */
      }
    });
    this.cleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        /* ignore */
      }
    });
    forceVisible(Array.from(this.hoverEls));
    forceVisible(Array.from(this.touched));
    this.animations = [];
    this.splits = [];
    this.cleanups = [];
    this.hoverEls = new Set();
    this.touched = new Set();
    this.done = new WeakSet();
    this.bound = new WeakSet();
    this.pending = new Set();
  },
});

// ---------------------------------------------------------------------------
// Visibility gate: run now if the element is already on screen, otherwise wait
// for it to enter. Uses Anime.js `onScroll()` as the scroll observer, with a
// registry sweep as a safety net so content is never stuck hidden.
// ---------------------------------------------------------------------------
// Applies the "from" state and plays the animation. Elements already on screen
// are set up immediately (pre-paint at mount). Off-screen elements are left in
// their natural, visible state until they actually enter the viewport, then the
// from-state and the animation are applied in the same frame — so nothing can
// ever sit permanently hidden (a background tab throttling rAF can't strand it).
const animateOnEnter = (registry, container, els, from, to) => {
  registry.touch(els);
  if (registry.reduced || !isMotionEnabled()) return; // content stays visible
  const run = () => {
    utils.set(els, from);
    registry.track(animate(els, to));
  };
  if (isInView(container)) {
    run();
    return;
  }
  const entry = {
    el: container,
    fired: false,
    fire: () => {
      if (entry.fired) return;
      entry.fired = true;
      registry.pending.delete(entry);
      run();
    },
  };
  registry.pending.add(entry);
  registry.track(
    onScroll({
      target: container,
      enter: ENTER_THRESHOLD,
      repeat: false,
      onEnter: entry.fire,
    })
  );
};

// Runs a callback once, when the element is (or becomes) visible.
const runOnEnter = (registry, el, run) => {
  if (isInView(el)) {
    run();
    return;
  }
  const entry = {
    el,
    fired: false,
    fire: () => {
      if (entry.fired) return;
      entry.fired = true;
      registry.pending.delete(entry);
      run();
    },
  };
  registry.pending.add(entry);
  registry.track(
    onScroll({ target: el, enter: ENTER_THRESHOLD, repeat: false, onEnter: entry.fire })
  );
};

// ---------------------------------------------------------------------------
// Reveal builders
// ---------------------------------------------------------------------------

// Single element: fade + rise.
export const revealElement = (registry, el, opts = {}) => {
  const { y = 28, x = 0, scale, duration = DUR.reveal, delay = 0, ease = EASE.out } = opts;
  const from = { opacity: 0, y, x };
  if (scale != null) from.scale = scale;
  const to = { opacity: 1, y: 0, x: 0 };
  if (scale != null) to.scale = 1;
  animateOnEnter(registry, el, el, from, { ...to, duration, delay, ease });
};

// A group of children staggered into view.
export const revealStagger = (registry, container, children, opts = {}) => {
  const {
    y = 26,
    duration = DUR.reveal,
    step = 70,
    from = 'first',
    ease = EASE.out,
    delay = 0,
  } = opts;
  const els = Array.from(children || []).filter(Boolean);
  if (!els.length) return;
  animateOnEnter(
    registry,
    container,
    els,
    { opacity: 0, y },
    { opacity: 1, y: 0, duration, ease, delay: stagger(step, { from }) }
  );
};

// Text reveal: split into characters/words and stagger them in.
export const revealText = (registry, el, opts = {}) => {
  const { unit = 'words', step = 24, duration = DUR.reveal, y = 24 } = opts;
  let splitter;
  try {
    splitter = splitText(el, { [unit]: true, accessible: true });
  } catch {
    return;
  }
  registry.splits.push(splitter);
  const targets = unit === 'chars' ? splitter.chars : splitter.words;
  if (!targets || !targets.length) return;
  animateOnEnter(
    registry,
    el,
    targets,
    { opacity: 0, y },
    { opacity: 1, y: 0, duration, ease: EASE.out, delay: stagger(step) }
  );
};

// Animated numeric count-up that ends on the *exact* original string, so the
// displayed value/meaning is preserved (e.g. "30-40%", "5+").
export const revealCounter = (registry, el, opts = {}) => {
  const { duration = DUR.counter, delay = 0 } = opts;
  const original = el.textContent;
  const matches = [...original.matchAll(/\d+/g)];
  if (!matches.length) return;

  const run = () => {
    const state = { p: 0 };
    registry.track(
      animate(state, {
        p: 1,
        duration,
        delay,
        ease: EASE.expo,
        onUpdate: () => {
          let out = '';
          let cursor = 0;
          matches.forEach((m) => {
            out += original.slice(cursor, m.index);
            out += String(Math.round(Number(m[0]) * state.p));
            cursor = m.index + m[0].length;
          });
          out += original.slice(cursor);
          el.textContent = out;
        },
        onComplete: () => {
          el.textContent = original;
        },
      })
    );
  };

  runOnEnter(registry, el, run);
};

// Progress bars: draw the existing inline width by scaling X (no layout thrash).
export const revealBars = (registry, container, opts = {}) => {
  const { duration = 1300, step = 110 } = opts;
  const bars = Array.from(container.querySelectorAll('.track i'));
  if (!bars.length) return;
  animateOnEnter(
    registry,
    container,
    bars,
    { scaleX: 0 },
    { scaleX: 1, duration, ease: EASE.expo, delay: stagger(step) }
  );
};

// SVG line drawing for the existing stroke icons.
export const revealDraw = (registry, container, opts = {}) => {
  const { selector = 'path', duration = 900, step = 50 } = opts;
  let drawables;
  try {
    drawables = svg.createDrawable(container.querySelectorAll(selector));
  } catch {
    return;
  }
  if (!drawables || !drawables.length) return;
  animateOnEnter(
    registry,
    container,
    drawables,
    { draw: '0 0' },
    { draw: ['0 0', '0 1'], duration, ease: EASE.inOut, delay: stagger(step) }
  );
};

// Scroll-linked parallax (progress tied directly to scroll position).
export const parallax = (registry, el, opts = {}) => {
  const { y = 32, rotate = 0 } = opts;
  registry.touch(el);
  const props = { y: [y, -y], ease: EASE.linear };
  if (rotate) props.rotate = [-rotate, rotate];
  registry.track(
    animate(el, {
      ...props,
      autoplay: onScroll({
        target: el,
        enter: 'bottom top',
        leave: 'top bottom',
        sync: true,
      }),
    })
  );
};

// ---------------------------------------------------------------------------
// Interaction builders (hover)
// ---------------------------------------------------------------------------
const bindHover = (registry, el, enter, leave) => {
  registry.hoverEls.add(el);
  registry.on(el, 'mouseenter', enter);
  registry.on(el, 'mouseleave', leave);
  registry.on(el, 'focusin', enter);
  registry.on(el, 'focusout', leave);
};

export const hoverLift = (registry, el, opts = {}) => {
  const { y = -4, scale = 1, duration = 320 } = opts;
  bindHover(
    registry,
    el,
    () => animate(el, { y, scale, duration, ease: EASE.soft }),
    () => animate(el, { y: 0, scale: 1, duration, ease: EASE.soft })
  );
};

export const hoverShift = (registry, el, opts = {}) => {
  const { x = 6, duration = 320 } = opts;
  bindHover(
    registry,
    el,
    () => animate(el, { x, duration, ease: EASE.soft }),
    () => animate(el, { x: 0, duration, ease: EASE.soft })
  );
};

// ---------------------------------------------------------------------------
// Standalone transition helpers used by components on state changes.
// They self-clean their scroll observer once fired.
// ---------------------------------------------------------------------------
export const playSlideIn = (el, opts = {}) => {
  if (!el || prefersReducedMotion() || !isMotionEnabled()) return;
  const { y = 16, step = 55, duration = 560 } = opts;
  const items = Array.from(el.querySelectorAll(':scope > *'));
  if (!items.length) return;

  const run = () => {
    utils.set(items, { opacity: 0, y });
    animate(items, { opacity: 1, y: 0, duration, ease: EASE.out, delay: stagger(step) });
    const points = el.querySelectorAll('.exp-points li');
    if (points.length) {
      utils.set(points, { opacity: 0, y: 10 });
      animate(points, { opacity: 1, y: 0, duration: 460, ease: EASE.out, delay: stagger(45, { start: 180 }) });
    }
  };

  if (isInView(el)) {
    run();
    return;
  }
  const observer = onScroll({
    target: el,
    enter: ENTER_THRESHOLD,
    repeat: false,
    onEnter: () => {
      if (el.isConnected) run();
      observer.revert();
    },
  });
};

export const animateMenuIn = (menuEl, opts = {}) => {
  if (!menuEl || prefersReducedMotion() || !isMotionEnabled()) return;
  const { step = 45 } = opts;
  const links = Array.from(menuEl.querySelectorAll('.nav-link, .nav-cta'));
  if (!links.length) return;
  utils.set(links, { opacity: 0, y: 8 });
  animate(links, { opacity: 1, y: 0, duration: 380, ease: EASE.out, delay: stagger(step) });
};

// ---------------------------------------------------------------------------
// Scanner: apply the right animation to each type of existing element.
// Idempotent — already-processed elements are skipped, so it can be re-run
// whenever new markup appears (async data, filter changes, route changes).
// ---------------------------------------------------------------------------
const ready = (registry, el) => el && !registry.done.has(el) && hasContent(el);

const mark = (registry, ...els) => els.forEach((el) => el && registry.done.add(el));

export const ensureSiteMotion = (registry, root) => {
  if (!root) return;
  const reduced = registry.reduced;

  // 1. Navigation entrance -------------------------------------------------
  const nav = root.querySelector('.site-nav');
  if (nav && !registry.done.has(nav)) {
    registry.done.add(nav);
    if (!reduced) {
      const items = nav.querySelectorAll('.logo-word, .nav-link, .nav-cta');
      registry.touch(items);
      utils.set(items, { opacity: 0, y: -10 });
      registry.track(
        animate(items, { opacity: 1, y: 0, duration: 560, ease: EASE.out, delay: stagger(60) })
      );
    }
  }

  // 2. Hero ----------------------------------------------------------------
  initHero(registry, root);

  // 3. Static section headings + subheads (split-text reveals) --------------
  root.querySelectorAll('.sec-head .title').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealText(registry, el, { unit: 'chars', step: 22, duration: 640 });
  });
  root.querySelectorAll('.sec-head .sub').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealText(registry, el, { unit: 'words', step: 16, duration: 600, y: 18 });
  });

  // 4. About ---------------------------------------------------------------
  root.querySelectorAll('.about-body .title').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealElement(registry, el, { y: 26 });
  });
  root.querySelectorAll('.about-body > p').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealElement(registry, el, { y: 22, duration: 720 });
  });
  root.querySelectorAll('.about-actions').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealStagger(registry, el, el.children, { y: 16, step: 90 });
  });
  root.querySelectorAll('.about-card').forEach((el) => {
    // The card itself must not stay hidden; only its inner parts animate.
    mark(registry, el);
  });
  root.querySelectorAll('.skill-bars').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (reduced) return;
    revealStagger(registry, el, el.querySelectorAll('.skill-bar'), { y: 14, step: 80, duration: 620 });
    revealBars(registry, el);
  });

  // 5. Services ------------------------------------------------------------
  root.querySelectorAll('.svc-grid').forEach((el) => {
    if (!ready(registry, el)) return;
    const buttons = el.querySelectorAll('.svc');
    mark(registry, el, ...buttons);
    if (reduced) return;
    revealStagger(registry, el, buttons, { y: 20, step: 70 });
    revealDraw(registry, el, { selector: '.ico svg path', step: 40, duration: 800 });
  });
  root.querySelectorAll('.svc-panel').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) playSlideIn(el, { step: 60 });
  });

  // 6. Experience ----------------------------------------------------------
  root.querySelectorAll('.exp-nav').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealStagger(registry, el, el.querySelectorAll('.exp-dot'), { y: 8, step: 60, duration: 480 });
  });

  // 7. Skills --------------------------------------------------------------
  root.querySelectorAll('.skills-grid').forEach((el) => {
    if (!ready(registry, el)) return;
    const cards = el.querySelectorAll('.skill-card');
    mark(registry, el, ...cards);
    if (reduced) return;
    revealStagger(registry, el, cards, { y: 24, step: 80 });
    cards.forEach((card) => {
      const pills = card.querySelectorAll('.skill-pill');
      if (pills.length) revealStagger(registry, card, pills, { y: 10, step: 16, duration: 520 });
    });
  });

  // 8. Stats (staggered cards + count-up) ----------------------------------
  root.querySelectorAll('.stats-row').forEach((el) => {
    if (!ready(registry, el)) return;
    const stats = el.querySelectorAll('.stat');
    mark(registry, el, ...stats);
    if (reduced) return;
    revealStagger(registry, el, stats, { y: 26, step: 90 });
    el.querySelectorAll('.stat .value').forEach((value, i) => {
      revealCounter(registry, value, { delay: 120 + i * 90 });
    });
  });

  // 9. Portfolio -----------------------------------------------------------
  root.querySelectorAll('.pf-filters').forEach((el) => {
    if (!ready(registry, el)) return;
    const filters = el.querySelectorAll('.pf-filter');
    mark(registry, el, ...filters);
    if (!reduced) revealStagger(registry, el, filters, { y: 12, step: 50, duration: 480 });
  });
  root.querySelectorAll('.pf-list').forEach((el) => {
    const rows = el.querySelectorAll('.pf-row');
    if (!rows.length) return;
    mark(registry, el, ...rows);
    if (!reduced) revealStagger(registry, el, rows, { y: 22, step: 80 });
  });
  root.querySelectorAll('.pf-foot').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealElement(registry, el, { y: 18 });
  });

  // 10. Testimonials -------------------------------------------------------
  root.querySelectorAll('.tm-slider').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealElement(registry, el, { y: 22 });
  });
  root.querySelectorAll('.tm-dots').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealStagger(registry, el, el.querySelectorAll('.tm-dot'), { y: 8, step: 50, duration: 420 });
  });

  // 11. Contact ------------------------------------------------------------
  root.querySelectorAll('.contact-links').forEach((el) => {
    if (!ready(registry, el)) return;
    const links = el.querySelectorAll('a');
    mark(registry, el, ...links);
    if (reduced) return;
    revealStagger(registry, el, links, { y: 16, step: 70 });
    revealDraw(registry, el, { selector: 'svg path', step: 40, duration: 700 });
  });
  root.querySelectorAll('.contact-card').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealElement(registry, el, { y: 24 });
  });
  root.querySelectorAll('.contact-form').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealElement(registry, el, { y: 24 });
  });

  // 12. Footer -------------------------------------------------------------
  root.querySelectorAll('.footer-inner').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealStagger(registry, el, el.children, { y: 14, step: 90 });
  });

  // 13. CV + Messages pages ------------------------------------------------
  root.querySelectorAll('.cv-head, .cv-frame-wrap').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealElement(registry, el, { y: 22 });
  });
  root.querySelectorAll('.messages-head, .messages-page .contact-form').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealElement(registry, el, { y: 22 });
  });
  const msgCards = Array.from(root.querySelectorAll('.msg-card')).filter(
    (el) => !registry.done.has(el)
  );
  if (msgCards.length) {
    mark(registry, ...msgCards);
    if (!reduced) revealStagger(registry, msgCards[0], msgCards, { y: 18, step: 70 });
  }

  // 14. Generic reveal fallback (covers any remaining `.reveal` element) ----
  root.querySelectorAll('.reveal').forEach((el) => {
    if (!ready(registry, el)) return;
    mark(registry, el);
    if (!reduced) revealElement(registry, el, { y: 26 });
  });

  // 15. Hover interactions (only elements whose CSS does not animate transform)
  bindInteractions(registry, root);
};

const initHero = (registry, root) => {
  const heroRoot = root.querySelector('.hero-wrap');
  if (!heroRoot || registry.done.has(heroRoot)) return;
  registry.done.add(heroRoot);
  if (registry.reduced || !isMotionEnabled()) return;

  const chip = heroRoot.querySelector('.chip');
  const nameWords = heroRoot.querySelectorAll('.hero-name > span');
  const sub = heroRoot.querySelector('.hero-sub');
  const actions = heroRoot.querySelector('.hero-actions');
  const actionEls = actions ? Array.from(actions.children) : [];
  const artEls = [
    heroRoot.querySelector('.hero-glow'),
    heroRoot.querySelector('.hero-ring.r1'),
    heroRoot.querySelector('.hero-ring.r2'),
  ].filter(Boolean);
  const portrait = heroRoot.querySelector('.portrait');
  const floats = heroRoot.querySelectorAll('.float-card');

  registry.touch([chip, sub, ...nameWords, ...actionEls, ...artEls, portrait, ...floats].filter(Boolean));

  if (chip) utils.set(chip, { opacity: 0, y: 16 });
  if (nameWords.length) utils.set(nameWords, { opacity: 0, y: 22 });
  if (sub) utils.set(sub, { opacity: 0, y: 16 });
  if (actionEls.length) utils.set(actionEls, { opacity: 0, y: 14 });
  if (artEls.length) utils.set(artEls, { opacity: 0 });
  if (portrait) utils.set(portrait, { opacity: 0, scale: 0.94 });
  if (floats.length) utils.set(floats, { opacity: 0 });

  const tl = createTimeline({ defaults: { ease: EASE.out, duration: 700 } });
  if (chip) tl.add(chip, { opacity: 1, y: 0 }, 0);
  if (nameWords.length) tl.add(nameWords, { opacity: 1, y: 0, delay: stagger(90) }, 120);
  if (sub) tl.add(sub, { opacity: 1, y: 0 }, 440);
  if (actionEls.length) tl.add(actionEls, { opacity: 1, y: 0, delay: stagger(80) }, 600);
  if (artEls.length) tl.add(artEls, { opacity: 1, duration: 900 }, 200);
  if (portrait) tl.add(portrait, { opacity: 1, scale: 1, duration: 1000 }, 280);
  if (floats.length) tl.add(floats, { opacity: 1, duration: 600, delay: stagger(120) }, 760);
  registry.track(tl);

  // Late-arriving hero copy (availability badge + tagline appear with data).
  const badge = heroRoot.querySelector('.avail-badge');
  if (badge && hasContent(badge)) {
    registry.done.add(badge);
    revealElement(registry, badge, { y: 12, duration: 560 });
  }
  const tag = heroRoot.querySelector('.hero-tag');
  if (tag && hasContent(tag)) {
    registry.done.add(tag);
    revealElement(registry, tag, { y: 14, duration: 600 });
  }

  // Scroll-linked parallax on existing decorative art (no conflicting CSS transform).
  if (portrait) parallax(registry, portrait, { y: 34 });
  const ring2 = heroRoot.querySelector('.hero-ring.r2');
  if (ring2) parallax(registry, ring2, { y: 24 });
};

const bindInteractions = (registry, root) => {
  if (registry.reduced) return; // hover motion is skipped for reduced-motion users
  const bind = (el, fn) => {
    if (!el || registry.bound.has(el)) return;
    registry.bound.add(el);
    fn(el);
  };
  root.querySelectorAll('.svc').forEach((el) =>
    bind(el, (e) => hoverLift(registry, e, { y: -3, scale: 1.02, duration: 300 }))
  );
  root.querySelectorAll('.pf-row').forEach((el) =>
    bind(el, (e) => hoverShift(registry, e, { x: 6, duration: 320 }))
  );
  root.querySelectorAll('.pf-row .pf-arrow').forEach((el) =>
    bind(el, (e) => hoverShift(registry, e, { x: 4, duration: 300 }))
  );
  root.querySelectorAll('.contact-links a').forEach((el) =>
    bind(el, (e) => hoverShift(registry, e, { x: 5, duration: 300 }))
  );
  root.querySelectorAll('.msg-card').forEach((el) =>
    bind(el, (e) => hoverLift(registry, e, { y: -3, duration: 300 }))
  );
  root.querySelectorAll('.btn-p svg, .btn-g svg').forEach((el) =>
    bind(el, (e) => {
      registry.on(el, 'mouseenter', () => animate(el, { x: 3, duration: 260, ease: EASE.soft }));
      registry.on(el, 'mouseleave', () => animate(el, { x: 0, duration: 260, ease: EASE.soft }));
    })
  );
};


