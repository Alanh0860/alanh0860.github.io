/* Alan — Hands & Horizons. Gentle reveals only. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
  }

  const header = document.querySelector('[data-header]');
  if (header) {
    let ticking = false;
    const apply = () => { header.classList.toggle('is-stuck', window.scrollY > 40); ticking = false; };
    apply();
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }, { passive: true });
  }
})();
