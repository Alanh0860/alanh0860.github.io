/* Alan — Hands & Horizons.
   Motion engine: scroll reveals, count-up ledger, hero iris, feature parallax,
   sticky header. Everything degrades to fully-visible content without JS and
   collapses gracefully under prefers-reduced-motion. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const hasIO = 'IntersectionObserver' in window;

  // Gate every entrance/idle animation behind .anim-ready: only when motion is OK.
  // Without it, CSS leaves all content in its final, visible state.
  let motion = !reduceMQ.matches;
  if (motion) root.classList.add('anim-ready');

  // ---- Year stamp ----
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Count-up ----
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const fmt = (n, decimals) =>
    n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const target = parseFloat(el.dataset.count);
    if (!isFinite(target)) return;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if (!motion) { el.textContent = fmt(target, decimals); return; }

    const dur = 1500;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = fmt(target * easeOutCubic(p), decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target, decimals);
    };
    requestAnimationFrame(tick);
  }

  // ---- Reveals ----
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const show = (el) => {
    el.classList.add('is-visible');
    const num = el.querySelector('[data-count]');
    if (num) countUp(num);
    if (el.matches('[data-count]')) countUp(el);
  };

  if (!hasIO) {
    reveals.forEach(show);
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      for (const e of entries) {
        if (e.isIntersecting) { show(e.target); obs.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));

    // Failsafe: never let a reveal stay hidden (e.g. if a render skips IO).
    setTimeout(() => reveals.forEach((el) => { if (!el.classList.contains('is-visible')) show(el); }), 2600);
  }

  // ---- Sticky header ----
  const header = document.querySelector('[data-header]');
  if (header) {
    let ticking = false;
    const apply = () => { header.classList.toggle('is-stuck', window.scrollY > 32); ticking = false; };
    apply();
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
  }

  // ---- Feature parallax (skydiving) ----
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax] img'));
  if (parallaxEls.length && motion) {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const img of parallaxEls) {
        const frame = img.parentElement.closest('[data-parallax]') || img.parentElement;
        const r = frame.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) continue;        // offscreen: skip work
        const center = r.top + r.height / 2;
        const progress = (vh / 2 - center) / (vh / 2 + r.height / 2); // -1 .. 1
        const shift = Math.max(-1, Math.min(1, progress)) * (r.height * 0.06);
        img.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    update();
  }

  // ---- React to a live change in motion preference ----
  reduceMQ.addEventListener?.('change', (e) => {
    motion = !e.matches;
    root.classList.toggle('anim-ready', motion);
    if (!motion) reveals.forEach(show);
  });
})();
