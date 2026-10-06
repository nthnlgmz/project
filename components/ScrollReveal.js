'use client';

import { useEffect } from 'react';

// Fades and slides sections into view as they are scrolled to.
// Anything already on screen when the page loads is left alone (the hero has its own load animation),
// and nothing is hidden at all if JavaScript or IntersectionObserver is unavailable or the visitor prefers reduced motion.
const TARGETS = [
  '.section-head',
  '.why-grid > *',
  '.nf-card',
  '.story-figure',
  '.enjoy-grid li',
  '.storage',
  '.shop-grid > *',
  '.booths-figure',
  '.booth-item',
  '.booth-note',
  '.booth-empty',
  'details',
  '.contact-buttons li',
];

export default function ScrollReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    const vh = window.innerHeight;
    const seen = new Set();
    document.querySelectorAll(TARGETS.join(',')).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.95 && r.bottom > 0) return; // already visible on load
      // small stagger between siblings, like cards in a row or items in a list
      const index = Array.prototype.indexOf.call(el.parentElement ? el.parentElement.children : [], el);
      el.style.transitionDelay = `${Math.min(Math.max(index, 0), 5) * 80}ms`;
      el.classList.add('reveal');
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return null;
}
