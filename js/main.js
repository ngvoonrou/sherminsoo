import { renderFilmCovers } from "./films-index.js";
import { initHeroMorph } from "./hero-morph.js";
import { initMarquee } from "./marquee.js";
import { initPersonalMedia } from "./personal-social.js";
import { renderCompanyGrid } from "./company-grid.js";

document.addEventListener("DOMContentLoaded", () => {
  renderFilmCovers();
  initHeroMorph();
  initMarquee();
  initPersonalMedia("#storiesStrip", "data/personal-social.json");
  renderCompanyGrid("#companyGrid");
});
