import { renderProvenSuccess } from "./proven-success.js";
import { setupFilmsPhotography } from "./films-photography.js";
import { initCursor } from "./cursor.js";
import { initHeroMorph } from "./hero-morph.js";
import { initMarquee } from "./marquee.js";
import { initPersonalMedia } from "./personal-social.js";

document.addEventListener("DOMContentLoaded", () => {
  renderProvenSuccess();
  setupFilmsPhotography();
  initHeroMorph();
  initMarquee();
  initPersonalMedia("#storiesStrip", "data/personal-social.json");

  initCursor({
    ringSize: 36,
    ringEmph: 68,
    dotSize: 6,
    ease: 0.18,
    enableBlendMode: true,
  });
});
