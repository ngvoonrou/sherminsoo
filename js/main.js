import { initTyped } from "./typed-init.js";
import { setupGallery, setupRecentWork } from "./gallery.js";
import { setupReels } from "./reels.js";
import { setupModal } from "./modal.js";

document.addEventListener("DOMContentLoaded", () => {
  AOS.init({ once: true, duration: 1000, offset: 100, easing: "ease-in-out" });

  initTyped();
  setupGallery();
  setupRecentWork();
  setupReels();
  setupModal();

  document.addEventListener("mousemove", (e) => {
    const glow = document.getElementById("glowCursor");
    if (glow) {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }
  });
});
