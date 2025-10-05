// hero-morph.js
// Sticky-on-element + scale-to-top, and correctly "unfix" when scrolling up.

export function initHeroMorph() {
  const hero = document.getElementById("hero-intro");
  const wordMark = document.getElementById("wordMark");
  const navPlaceholder = document.getElementById("navBrandPlaceholder");
  const navBar = document.querySelector(".brand-navbar");
  if (!hero || !wordMark || !navPlaceholder || !navBar) return;

  let startTop = 0; // natural top (centered) distance from viewport top
  let finalScale = 1; // scale when docked to navbar height
  let lockAtY = 0; // scrollY at which the H1’s top reaches 0 (hits navbar)

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function measure() {
    const prev = wordMark.style.transform;
    wordMark.style.transform = "none";

    const vh = window.innerHeight || document.documentElement.clientHeight;
    const h1Rect = wordMark.getBoundingClientRect();
    const baseH = h1Rect.height;

    // H1 is centered by the grid, so its initial top ≈ (vh - height)/2
    startTop = Math.max(1, (vh - baseH) / 2);

    // Include safe-area via computed padding on the real navbar
    const navRect = navPlaceholder.getBoundingClientRect();
    const navStyles = getComputedStyle(navBar);
    const navPadTop = parseFloat(navStyles.paddingTop) || 0; // env(safe-area-inset-top) on iOS
    const navH = (navRect.height || 72) + navPadTop;

    finalScale = clamp(navH / baseH, 0.3, 1);

    // The scroll position where the H1 touches the top:
    // hero’s page-top plus the initial "top" distance of the H1.
    const heroTopOnPage = hero.getBoundingClientRect().top + window.scrollY;
    lockAtY = heroTopOnPage + startTop;

    wordMark.style.transform = prev;
    update();
  }

  function update() {
    const y = window.scrollY || window.pageYOffset;
    const stuck = y >= lockAtY - 1;

    if (stuck) {
      // keep it fixed at the top even after hero ends
      if (!wordMark.classList.contains("is-fixed")) {
        wordMark.classList.add("is-fixed");
      }
      wordMark.style.transform = `translateX(-50%) scale(${finalScale})`;
    } else {
      // release back into the hero, scale based on current distance to top
      wordMark.classList.remove("is-fixed");

      // While not stuck, scale smoothly from centered -> navbar size.
      const currentTop = clamp(lockAtY - y, 0, startTop); // 0..startTop
      const p = clamp(currentTop / startTop, 0, 1); // 0..1
      const s = finalScale + (1 - finalScale) * p;
      wordMark.style.transform = `scale(${s})`;
    }

    document.body.classList.toggle("page-revealed", stuck);
    document.body.classList.toggle("navbar-active", stuck);
  }

  // rAF-throttled scroll
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

  // Reduced motion: snap
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY || window.pageYOffset;
        const stuck = y >= lockAtY;
        wordMark.classList.toggle("is-fixed", stuck);
        wordMark.style.transform = stuck
          ? `translateX(-50%) scale(${finalScale})`
          : "none";
        document.body.classList.toggle("page-revealed", stuck);
        document.body.classList.toggle("navbar-active", stuck);
      },
      { passive: true }
    );
  }
}
