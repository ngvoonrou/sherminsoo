import { initTyped } from "./typed-init.js";
import { setuSocialMedia } from "./socialMedia.js";
import { setupVisualDesign } from "./visualDesign.js";
import { setupRecentWork } from "./gallery.js";
import { setupReels } from "./reels.js";
import { setupReelsV2 } from "./reels-v2.js";
import { setupModal } from "./modal.js";

document.addEventListener("DOMContentLoaded", () => {
  AOS.init({ once: true, duration: 1000, offset: 100, easing: "ease-in-out" });

  initTyped();
  setuSocialMedia();
  setupVisualDesign();
  setupRecentWork();
  setupReels();
  setupReelsV2();
  setupModal();

  document.addEventListener("mousemove", (e) => {
    const glow = document.getElementById("glowCursor");
    if (glow) {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }
  });
});
