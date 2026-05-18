/**
 * TEAM CAROUSEL
 * Mobile: card estático (sem flip, sem tap)
 * Desktop: hover via CSS
 */

(function () {
  "use strict";

  const CONFIG = {
    selector: ".profile-team-section",
    gridSelector: ".profile-team-grid",
    cardSelector: ".profile-team-card",
    breakpoint: 1024,
    autoplay: true,
    interval: 2500,
    swipeThreshold: 50,
  };

  function initCarousel() {
    const section = document.querySelector(CONFIG.selector);
    if (!section) return;
    const grid = section.querySelector(CONFIG.gridSelector);
    if (!grid) return;
    const cards = [...grid.querySelectorAll(CONFIG.cardSelector)];
    if (!cards.length) return;
    createCarousel(section, grid, cards);
  }

  function createCarousel(section, grid, cards) {
    const total = cards.length;

    const wrapper = document.createElement("div");
    wrapper.className = "team-carousel-wrapper";

    const trackContainer = document.createElement("div");
    trackContainer.style.cssText =
      "overflow:hidden;width:100%;position:relative;";

    const track = document.createElement("div");
    track.className = "team-carousel-track";

    // 3x duplicado para loop infinito
    [...cards, ...cards, ...cards].forEach((card, i) => {
      const slide = document.createElement("div");
      slide.className = "team-carousel-slide";
      slide.dataset.index = i % total;
      slide.appendChild(card.cloneNode(true));
      track.appendChild(slide);
    });

    trackContainer.appendChild(track);
    wrapper.appendChild(trackContainer);

    const dotsWrapper = document.createElement("div");
    dotsWrapper.className = "team-carousel-dots";
    const dots = [];

    for (let i = 0; i < total; i++) {
      const dot = document.createElement("button");
      dot.className = "team-carousel-dot";
      dot.addEventListener("click", () => {
        goTo(i);
        restartAutoplay();
      });
      dotsWrapper.appendChild(dot);
      dots.push(dot);
    }

    wrapper.appendChild(dotsWrapper);
    grid.parentNode.insertBefore(wrapper, grid.nextSibling);

    let current = 0;
    let slideWidth = 0;
    let gap = 18;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    // autoplay contínuo + loop infinito REAL (sem pular por slide)
    let rafId = null;
    let lastTs = 0;
    let trackX = 0; // translateX atual (px)
    let speed = 0; // px/s

    function measure() {
      const slide = wrapper.querySelector(".team-carousel-slide");
      if (!slide) return;
      slideWidth = slide.offsetWidth;
      const styles = getComputedStyle(track);
      gap = parseFloat(styles.columnGap) || parseFloat(styles.gap) || 18;
    }

    function step() {
      return slideWidth + gap;
    }

    function centerOffset() {
      return (wrapper.offsetWidth - slideWidth) / 2;
    }

    function getTranslate(index) {
      // triplicação no HTML => podemos usar um bloco para referência
      return -((total + index) * step()) + centerOffset();
    }

    function update() {
      dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
      wrapper.querySelectorAll(".team-carousel-slide").forEach((s) => {
        s.classList.toggle("is-active", Number(s.dataset.index) === current);
      });
    }

    function setPositionByOffset(offsetPx, animate = false) {
      track.style.transition = animate ? "transform 0.35s ease" : "none";
      trackX = offsetPx;
      track.style.transform = `translateX(${trackX}px)`;

      // estimar índice atual para atualizar dots e alinhamento
      const rel = getTranslate(0) - trackX;
      const approxIndex = Math.round(rel / step());
      const idx = ((approxIndex % total) + total) % total;
      current = idx;
      update();
    }

    function stopAutoplay() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      lastTs = 0;
    }

    function startAutoplay() {
      if (!CONFIG.autoplay) return;

      stopAutoplay();

      // velocidade suave ~0.5x da atual (interval era por slide)
      const s = step();
      const targetMsPerSlide = Math.max(800, CONFIG.interval * 2);
      speed = s * (1000 / targetMsPerSlide); // px/s

      lastTs = 0;

      const tick = (ts) => {
        if (!lastTs) lastTs = ts;
        const dt = Math.min(48, ts - lastTs) / 1000;
        lastTs = ts;

        if (!isDragging) {
          trackX -= speed * dt;

          // wrap-around REAL sem transição
          const block = step() * total; // 1 ciclo completo
          const base = getTranslate(0);
          while (trackX < base - block) trackX += block;
          while (trackX > base + block) trackX -= block;

          track.style.transition = "none";
          track.style.transform = `translateX(${trackX}px)`;

          // atualizar dots sem snap
          const rel = base - trackX;
          const approxIndex = Math.round(rel / step());
          const idx = ((approxIndex % total) + total) % total;
          if (idx !== current) {
            current = idx;
            update();
          }
        }

        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    }

    function snapToNearest(animate = true) {
      const s = step();
      const base = getTranslate(0);
      const rel = base - trackX;
      const k = Math.round(rel / s);
      const target = base - k * s;
      setPositionByOffset(target, animate);
    }

    // TOUCH: swipe horizontal (sem flip/tap)
    track.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        currentX = startX;
        isDragging = true;
        stopAutoplay();
        track.style.transition = "none";
        track.classList.add("is-dragging");
      },
      { passive: true },
    );

    track.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const dx = currentX - startX;
        trackX = trackX + dx;
        startX = currentX;

        // wrap enquanto arrasta
        const block = step() * total;
        const base = getTranslate(0);
        while (trackX < base - block) trackX += block;
        while (trackX > base + block) trackX -= block;

        track.style.transition = "none";
        track.style.transform = `translateX(${trackX}px)`;
      },
      { passive: true },
    );

    track.addEventListener(
      "touchend",
      () => {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove("is-dragging");
        snapToNearest(true);
        startAutoplay();
      },
      { passive: true },
    );

    // MOUSE drag
    track.addEventListener(
      "mousedown",
      (e) => {
        isDragging = true;
        startX = e.clientX;
        currentX = startX;
        stopAutoplay();
        track.style.transition = "none";
        track.classList.add("is-dragging");
      },
      { passive: true },
    );

    window.addEventListener(
      "mousemove",
      (e) => {
        if (!isDragging) return;
        currentX = e.clientX;
        const dx = currentX - startX;
        trackX = trackX + dx;
        startX = currentX;

        const block = step() * total;
        const base = getTranslate(0);
        while (trackX < base - block) trackX += block;
        while (trackX > base + block) trackX -= block;

        track.style.transition = "none";
        track.style.transform = `translateX(${trackX}px)`;
      },
      { passive: true },
    );

    window.addEventListener(
      "mouseup",
      () => {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove("is-dragging");
        snapToNearest(true);
        startAutoplay();
      },
      { passive: true },
    );

    window.addEventListener("resize", () => {
      measure();
      const base = getTranslate(0);
      setPositionByOffset(base, false);
      checkBreakpoint();
    });

    function checkBreakpoint() {
      wrapper.style.display =
        window.innerWidth <= CONFIG.breakpoint ? "flex" : "none";
    }

    requestAnimationFrame(() => {
      measure();
      setPositionByOffset(getTranslate(0), false);
      checkBreakpoint();
      startAutoplay();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCarousel);
  } else {
    initCarousel();
  }
})();
