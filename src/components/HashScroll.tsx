'use client';

import { useEffect } from 'react';

/** Scrolls to a single home-section id after arriving with /#section. */
export default function HashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      // Prefer the last segment if a bad /#a#b URL was left in the bar.
      const raw = window.location.hash.replace(/^#/, '');
      const id = raw.split('#').filter(Boolean).pop();
      if (!id) return;

      if (raw.includes('#')) {
        window.history.replaceState(null, '', `/#${id}`);
      }

      const el = document.getElementById(id);
      if (!el) return;
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  return null;
}
