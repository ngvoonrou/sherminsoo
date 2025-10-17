// gallery.js — masonry + hero + lightbox

// -------- utils --------
function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || "";
}

// -------- refs --------
const masonryEl = document.getElementById("masonry");
const heroTitleEl = document.getElementById("heroTitle");
const heroDescEl = document.getElementById("heroDesc");
const heroEl = document.querySelector(".gallery-hero");
const scrollBtn = document.querySelector(".hero-scroll");

// Lightbox refs
const lbEl = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCap");
const lbPrev = lbEl.querySelector(".lb__prev");
const lbNext = lbEl.querySelector(".lb__next");
const lbClose = lbEl.querySelector(".lb__close");

// state for lightbox
let photoList = [];
let currentIndex = 0;

// graceful image load -> add class for fade-in
function loadWithReady(img, card) {
  const onDone = () => card.classList.add("is-ready");
  if (img.complete) onDone();
  else img.addEventListener("load", onDone, { once: true });
  img.addEventListener("error", () => onDone(), { once: true });
}

// build one card
function makeCard(photo, index) {
  const fig = document.createElement("figure");
  fig.className = "masonry-item";
  fig.dataset.index = index;

  const img = document.createElement("img");
  img.src = photo.src;
  img.alt = photo.title || "Photo";
  img.loading = "lazy";
  img.decoding = "async";

  const cap = document.createElement("figcaption");
  cap.className = "masonry-cap";
  cap.innerHTML = `<span>${photo.title || ""}</span>`;

  fig.appendChild(img);
  fig.appendChild(cap);
  loadWithReady(img, fig);

  // open lightbox on click
  fig.addEventListener("click", () => openLightbox(index));

  return fig;
}

// small parallax effect on hero background
function attachParallax() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const start = heroEl.getBoundingClientRect().top + window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const y = Math.max(0, window.scrollY - start);
      heroEl.style.backgroundPosition = `center calc(50% + ${y * 0.12}px)`;
    },
    { passive: true }
  );
}

// smooth scroll button
scrollBtn?.addEventListener("click", (e) => {
  const sel = e.currentTarget.getAttribute("data-scroll");
  const target = document.querySelector(sel);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
});

// -------- LIGHTBOX --------
function openLightbox(i) {
  currentIndex = i;
  const p = photoList[currentIndex];
  if (!p) return;

  lbImg.src = p.src;
  lbImg.alt = p.title || "Photo";
  lbCap.textContent = p.title || "";
  lbEl.classList.add("lb--open");
  lbEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // prevent background scroll
}
function closeLightbox() {
  lbEl.classList.remove("lb--open");
  lbEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function nextImg() {
  currentIndex = (currentIndex + 1) % photoList.length;
  openLightbox(currentIndex);
}
function prevImg() {
  currentIndex = (currentIndex - 1 + photoList.length) % photoList.length;
  openLightbox(currentIndex);
}
lbNext.addEventListener("click", nextImg);
lbPrev.addEventListener("click", prevImg);
lbClose.addEventListener("click", closeLightbox);

// close on backdrop click
lbEl.addEventListener("click", (e) => {
  if (e.target === lbEl) closeLightbox();
});

// keys: Esc / arrows
window.addEventListener("keydown", (e) => {
  if (!lbEl.classList.contains("lb--open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") nextImg();
  if (e.key === "ArrowLeft") prevImg();
});

// -------- data & render --------
async function renderGallery() {
  const key = getParam("country");

  try {
    const res = await fetch("data/films.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load films.json");
    const data = await res.json();

    const countries = Array.isArray(data?.countries) ? data.countries : [];
    const country = countries.find((c) => c.key === key) || countries[0];

    if (!country) {
      heroTitleEl.textContent = "Film Gallery";
      heroDescEl.textContent = "No images yet.";
      masonryEl.setAttribute("aria-busy", "false");
      return;
    }

    // ---- HERO ----
    heroTitleEl.textContent = country.name;
    heroDescEl.textContent = country.desc || "";
    if (country.cover) {
      heroEl.style.backgroundImage = `url("${country.cover}")`;
      heroEl.style.backgroundPosition = "center";
      heroEl.style.backgroundSize = "cover";
      attachParallax();
    }

    // ---- GRID ----
    photoList = (country.photos || []).map((p) => ({
      src: p.src,
      title: p.title || "",
    }));

    masonryEl.innerHTML = "";
    photoList.forEach((p, i) => masonryEl.appendChild(makeCard(p, i)));

    if (!photoList.length) {
      masonryEl.innerHTML = `<div class="text-center" style="opacity:.7">No photos yet.</div>`;
    }
  } catch (e) {
    console.error(e);
    masonryEl.innerHTML = `<div class="text-center" style="opacity:.7">Failed to load gallery.</div>`;
  } finally {
    masonryEl.setAttribute("aria-busy", "false");
  }
}

renderGallery();
