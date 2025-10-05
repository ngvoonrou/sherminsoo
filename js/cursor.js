// js/cursor.js
// Minimal-deps custom cursor module (dot + ring + optional label)
// Usage: import { initCursor } from "./js/cursor.js"; initCursor();
// Or just include this file with type="module" and it will auto-init.

export function initCursor(options = {}) {
  const cfg = {
    ringSize: options.ringSize ?? 36,
    ringEmph: options.ringEmph ?? 68,
    dotSize: options.dotSize ?? 6,
    ease: options.ease ?? 0.18,
    enableBlendMode: options.enableBlendMode ?? true, // difference on by default
  };

  // Respect touch and reduced motion
  const isTouch =
    matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isTouch || reduce) return;

  // Inject HTML (once)
  if (!document.getElementById("cursor")) {
    const root = document.createElement("div");
    root.id = "cursor";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = `
      <div class="c-ring"></div>
      <div class="c-dot"></div>
      <div class="c-label" id="cursorLabel"></div>
    `;
    document.body.appendChild(root);
  }
  const root = document.getElementById("cursor");
  const ring = root.querySelector(".c-ring");
  const dot = root.querySelector(".c-dot");
  const label = root.querySelector(".c-label");

  // Apply inline sizes once (lets CSS stay generic)
  ring.style.width = ring.style.height = `${cfg.ringSize}px`;
  dot.style.width = dot.style.height = `${cfg.dotSize}px`;
  if (cfg.enableBlendMode) root.style.mixBlendMode = "difference";

  document.body.classList.add("cursor-none");

  let tx = innerWidth / 2,
    ty = innerHeight / 2;
  let vx = tx,
    vy = ty; // smoothed position

  // Show/Hide on enter/leave
  const show = () => root.classList.add("-show");
  const hide = () => root.classList.remove("-show");
  window.addEventListener(
    "mousemove",
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
      show();
    },
    { passive: true }
  );
  window.addEventListener("mouseleave", hide, { passive: true });

  // RAF loop
  const raf = () => {
    vx += (tx - vx) * cfg.ease;
    vy += (ty - vy) * cfg.ease;
    ring.style.transform = `translate3d(${vx}px, ${vy}px, 0)`;
    dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Hover states via data attributes
  function onEnter(el) {
    if (el.hasAttribute("data-cursor-hide")) {
      root.classList.add("-hidden");
      return;
    }
    const emph = el.getAttribute("data-cursor-emph");
    const text = emph ?? el.getAttribute("data-cursor");

    root.classList.add("-hover");
    if (emph) root.classList.add("-emph");

    if (text && text.trim()) {
      label.textContent = text.trim();
      root.classList.add("-labeled");
    }
  }
  function onLeave() {
    root.classList.remove("-hover", "-emph", "-labeled", "-hidden");
    label.textContent = "";
  }

  // Delegate
  document.addEventListener(
    "mouseover",
    (e) => {
      let el = e.target;
      while (el && el !== document.body) {
        if (
          el.hasAttribute("data-cursor") ||
          el.hasAttribute("data-cursor-emph") ||
          el.hasAttribute("data-cursor-hide")
        ) {
          onEnter(el);
          return;
        }
        el = el.parentElement;
      }
      onLeave();
    },
    { passive: true }
  );

  document.addEventListener(
    "mouseout",
    (e) => {
      if (!e.relatedTarget) onLeave();
    },
    { passive: true }
  );

  // Expose a tiny API (optional)
  return {
    setLabel(text = "") {
      if (text) {
        label.textContent = text;
        root.classList.add("-labeled");
      } else {
        label.textContent = "";
        root.classList.remove("-labeled");
      }
    },
    destroy() {
      document.body.classList.remove("cursor-none");
      root.remove();
      document.removeEventListener("mouseover", onEnter, true);
      document.removeEventListener("mouseout", onLeave, true);
      window.removeEventListener("mousemove", show, true);
      window.removeEventListener("mouseleave", hide, true);
    },
  };
}

// Auto-init if imported directly in a page
if (document.currentScript?.type === "module") {
  window.addEventListener("DOMContentLoaded", () => initCursor(), {
    once: true,
  });
}
