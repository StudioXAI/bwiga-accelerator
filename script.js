/* =========================================================================
   BWiGA Accelerator
   Main script
   ========================================================================= */

/* --------------------------------------------------------------------------
   1.  Animated particle network (hero background)
   -------------------------------------------------------------------------- */
(function initNetworkBackground() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Skip animation if user prefers reduced motion
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let particles = [];
  let animationId = null;

  // Tune particle density to viewport area (cheaper on mobile)
  function getParticleCount() {
    const area = window.innerWidth * window.innerHeight;
    return Math.min(100, Math.max(40, Math.floor(area / 18000)));
  }

  const MAX_DISTANCE = 160;
  const COLORS = [
    { r: 212, g: 175, b: 55 },   // gold
    { r: 34, g: 211, b: 238 },   // cyan
    { r: 16, g: 185, b: 129 },   // emerald
  ];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR for perf
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function init() {
    particles = [];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.6 + 0.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  function animate() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.02;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      const pulseScale = 1 + Math.sin(p.pulse) * 0.3;
      const alpha = 0.6 + Math.sin(p.pulse) * 0.2;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * pulseScale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
      ctx.fill();

      // Soft glow ring
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * pulseScale * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.15})`;
      ctx.fill();
    }

    // Connecting lines — chain edges
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;
        const maxSq = MAX_DISTANCE * MAX_DISTANCE;
        if (distSq < maxSq) {
          const dist = Math.sqrt(distSq);
          const opacity = (1 - dist / MAX_DISTANCE) * 0.22;
          const c1 = particles[i].color;
          const c2 = particles[j].color;
          const r = (c1.r + c2.r) / 2;
          const g = (c1.g + c2.g) / 2;
          const b = (c1.b + c2.b) / 2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  function start() {
    if (animationId) cancelAnimationFrame(animationId);
    resize();
    init();
    if (!reducedMotion) animate();
  }

  // Pause when tab is hidden to save CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationId) cancelAnimationFrame(animationId);
      animationId = null;
    } else if (!reducedMotion) {
      animate();
    }
  });

  // Debounced resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(start, 200);
  });

  start();
})();

/* --------------------------------------------------------------------------
   2.  Sticky header — adds class on scroll
   -------------------------------------------------------------------------- */
(function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;
  function update() {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  });
})();

/* --------------------------------------------------------------------------
   3.  Mobile menu drawer
   -------------------------------------------------------------------------- */
(function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-overlay');
  if (!toggle || !menu || !overlay) return;

  function open() {
    menu.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
  }
  function close() {
    menu.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    menu.classList.contains('open') ? close() : open();
  });
  overlay.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });
})();

/* --------------------------------------------------------------------------
   4.  FAQ tabs + accordion
   -------------------------------------------------------------------------- */
(function initFAQ() {
  const tabs = document.querySelectorAll('.faq-tab');
  const lists = document.querySelectorAll('.faq-list');

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      tabs.forEach(t => t.classList.remove('active'));
      lists.forEach(l => l.classList.remove('active'));
      tab.classList.add('active');
      const list = document.getElementById(target);
      if (list) list.classList.add('active');
    });
  });

  // Accordion expand/collapse
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      // Optional: close siblings within same list (uncomment for one-at-a-time behavior)
      // item.parentElement.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      item.classList.toggle('open', !wasOpen);
      btn.setAttribute('aria-expanded', String(!wasOpen));
    });
  });
})();

/* --------------------------------------------------------------------------
   5.  Reveal-on-scroll
   -------------------------------------------------------------------------- */
(function initReveal() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* --------------------------------------------------------------------------
   6.  Active section highlight in nav (optional polish)
   -------------------------------------------------------------------------- */
(function initActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.mega-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('current', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
})();

/* --------------------------------------------------------------------------
   7.  Card cursor-tracking glow
   Updates --mx and --my CSS custom properties on each card so a soft
   radial gradient follows the cursor across the surface.
   -------------------------------------------------------------------------- */
(function initCardGlow() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  // Skip on touch-primary devices — saves CPU and the effect doesn't apply
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (isTouch) return;

  const cards = document.querySelectorAll(
    '.pillar-card, .program-card, .criteria-card, .demo-card, .thesis-card'
  );

  cards.forEach(card => {
    let raf = null;
    card.addEventListener('mousemove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
        raf = null;
      });
    });
    card.addEventListener('mouseleave', () => {
      // Smooth return to centre
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
})();

/* --------------------------------------------------------------------------
   8.  Scroll progress bar
   -------------------------------------------------------------------------- */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  let ticking = false;
  function update() {
    const scrolled = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
})();

/* --------------------------------------------------------------------------
   9.  Smooth-scroll for anchor links (fine-tunes native behavior)
   -------------------------------------------------------------------------- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || href === '#top') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 80; // header height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
