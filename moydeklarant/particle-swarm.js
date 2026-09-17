/* =========================================================
   МойДекларант — particle-swarm.js
   A quiet, corporate particle network rendered behind the
   hero section: soft drifting dots with thin connecting
   lines in light blue. Intentionally understated (no glow,
   no neon) — meant to read as "global network", not gaming.
   ========================================================= */
(function () {
  'use strict';

  var canvas = document.getElementById('particleCanvas');
  if (!canvas || !canvas.getContext) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var hero = canvas.closest('.hero');
  var width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var particles = [];
  var rafId = null;
  var isVisible = true;

  /* The hero now sits on a dark navy scrim over photography, so the
     network is drawn in white at low opacity rather than blue. */
  var DOT_COLOR = 'rgba(255, 255, 255, 0.38)';
  var LINE_COLOR = 'rgba(255, 255, 255, 0.16)';
  var LINK_DIST = 130;
  var COUNT_DENSITY = 1 / 16000; // particles per square px, capped below

  function resize() {
    var rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedParticles();
  }

  function seedParticles() {
    var count = Math.min(Math.round(width * height * COUNT_DENSITY), 70);
    count = Math.max(count, 24);
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1 + Math.random() * 1.4
      });
    }
  }

  function step() {
    if (!isVisible) { rafId = null; return; }
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = width + 10; else if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10; else if (p.y > height + 10) p.y = -10;
    }

    ctx.lineWidth = 1;
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.globalAlpha = 1 - dist / LINK_DIST;
          ctx.strokeStyle = LINE_COLOR;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = DOT_COLOR;
    for (var j = 0; j < particles.length; j++) {
      var pt = particles[j];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(step);
  }

  function start() {
    if (rafId === null && isVisible && !prefersReducedMotion) rafId = requestAnimationFrame(step);
  }
  function stop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  if (prefersReducedMotion) {
    // Render a single static, very quiet frame and stop — respects the
    // user's motion preference while keeping the visual texture.
    resize();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = DOT_COLOR;
    particles.forEach(function (p) {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    window.addEventListener('resize', debounce(resize, 200));
    return;
  }

  document.addEventListener('visibilitychange', function () {
    isVisible = !document.hidden;
    if (isVisible) start(); else stop();
  });

  var io = null;
  if ('IntersectionObserver' in window && hero) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        isVisible = entry.isIntersecting && !document.hidden;
        if (isVisible) start(); else stop();
      });
    }, { threshold: 0 });
    io.observe(hero);
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  window.addEventListener('resize', debounce(resize, 200));
  resize();
  start();
})();
