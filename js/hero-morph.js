// hero-morph.js
export function initHeroMorph() {
  const section = document.getElementById("hero-intro");
  const heroLogo = document.getElementById("heroLogo");
  const navLogo = document.getElementById("navLogo");
  if (!section || !heroLogo || !navLogo) return;

  let dx = 0,
    dy = 0,
    scale = 1;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  function progressThroughSticky() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const top = section.offsetTop;
    const scrollable = Math.max(1, section.offsetHeight - vh);
    return clamp((window.scrollY - top) / scrollable, 0, 1);
  }

  function measure() {
    heroLogo.style.transform = "none";
    const src = heroLogo.getBoundingClientRect();
    const dst = navLogo.getBoundingClientRect();
    const srcX = src.left + src.width / 2;
    const srcY = src.top + src.height / 2;
    const dstX = dst.left + dst.width / 2;
    const dstY = dst.top + dst.height / 2;
    dx = dstX - srcX;
    dy = dstY - srcY;
    scale = dst.height / src.height;
    update();
  }

  function update() {
    const raw = progressThroughSticky();
    const p = ease(raw);
    const s = 1 + (scale - 1) * p;
    const tx = dx * p;
    const ty = dy * p;

    heroLogo.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;

    const bgOn = raw > 0.02;
    const navA = smoothstep(0.35, 0.7, raw);
    const heroA = 1 - smoothstep(0.4, 0.75, raw);

    document.body.classList.toggle("page-revealed", bgOn);
    document.body.classList.toggle("navbar-active", navA > 0.25);
    navLogo.style.opacity = String(navA);
    heroLogo.style.opacity = String(heroA);

    if (raw >= 0.98) {
      navLogo.style.opacity = "1";
      heroLogo.style.opacity = "0";
      document.body.classList.add("page-revealed", "navbar-active");
    }
    if (raw <= 0.01) {
      navLogo.style.opacity = "0";
      heroLogo.style.opacity = "1";
      document.body.classList.remove("navbar-active");
    }
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
      ticking = true;
    }
  }

  function initMeasure() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    } else {
      measure();
    }
  }

  window.addEventListener("load", initMeasure);
  window.addEventListener("resize", initMeasure, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  // Reduced motion: snap logic
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener(
      "scroll",
      () => {
        const p = progressThroughSticky();
        const inHeader = p > 0.2;
        document.body.classList.toggle("page-revealed", inHeader);
        document.body.classList.toggle("navbar-active", inHeader);
        navLogo.style.opacity = inHeader ? "1" : "0";
        heroLogo.style.opacity = inHeader ? "0" : "1";
        heroLogo.style.transform = "none";
      },
      { passive: true }
    );
  }
}
