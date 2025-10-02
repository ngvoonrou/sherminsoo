import { initTyped } from "./typed-init.js";
import { setupSocialMedia } from "./social-media.js";
import { setupVisualDesign } from "./visual-design.js";
import { setupRecentWork } from "./gallery.js";
import { setupReels } from "./reels.js";
import { setupReelsV2 } from "./reels-v2.js";
import { setupProjectMarketing } from "./project-marketing.js";
import { setupModal } from "./modal.js";

document.addEventListener("DOMContentLoaded", () => {
  AOS.init({ once: true, duration: 1000, offset: 100, easing: "ease-in-out" });

  initTyped();
  setupSocialMedia();
  setupVisualDesign();
  setupRecentWork();
  setupReels();
  setupReelsV2();
  setupProjectMarketing();
  setupModal();

  document.addEventListener("mousemove", (e) => {
    const glow = document.getElementById("glowCursor");
    if (glow) {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }
  });
});
