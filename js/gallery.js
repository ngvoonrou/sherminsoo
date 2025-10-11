// ---------------------------------------------
// Helpers
// ---------------------------------------------
function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || "";
}
function setParam(name, value) {
  const url = new URL(window.location.href);
  if (value === null) url.searchParams.delete(name);
  else url.searchParams.set(name, value);
  history.replaceState({}, "", url.toString());
}

// ---------------------------------------------
// Refs & State
// ---------------------------------------------
const titleEl = document.getElementById("galleryTitle");
const descEl = document.getElementById("galleryDesc");
const host = document.getElementById("galleryHost");
const slideshowHost = document.getElementById("slideshowHost");
const layoutSelect = document.getElementById("layoutSelect");
const layoutTip = document.getElementById("layoutTip");
const ssThumbs = document.getElementById("ssThumbs");

let PHOTOS = []; // {src, title, year, w, h, ar}
let CURRENT_LAYOUT = "horizontal"; // horizontal | slideshow
let SLIDE_INDEX = 0;

const TIPS = {
  horizontal:
    "Horizontal: sideways scroll with snap; natural aspect preserved.",
  slideshow: "Slideshow: one large image with thumbnails.",
};

// ---------------------------------------------
// Image meta loader to get natural sizes (for aspect ratios)
// ---------------------------------------------
function loadMeta(src) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () =>
      resolve({ w: im.naturalWidth || 1, h: im.naturalHeight || 1 });
    im.onerror = () => resolve({ w: 1, h: 1 });
    im.src = src;
  });
}
async function addMetaToPhotos(list) {
  const metas = await Promise.all(list.map((p) => loadMeta(p.src)));
  return list.map((p, i) => {
    const w = metas[i].w || 1;
    const h = metas[i].h || 1;
    return { ...p, w, h, ar: w / h };
  });
}

// ---------------------------------------------
// Builders
// ---------------------------------------------
function makeItem(photo, index) {
  const wrap = document.createElement("figure");
  wrap.className = "gallery-item";
  wrap.dataset.index = index;

  const title = photo.title || `Photo ${index + 1}`;
  const year = photo.year || "";

  const img = document.createElement("img");
  img.src = photo.src;
  img.alt = title;
  img.loading = "lazy";
  img.decoding = "async";

  const overlay = document.createElement("div");
  overlay.className = "gallery-overlay";
  overlay.innerHTML = `<span>${title}</span><span style="opacity:.85">${year}</span>`;

  const meta = document.createElement("figcaption");
  meta.className = "gallery-meta";
  meta.innerHTML = `<span>${title}</span><span>${year}</span>`;

  wrap.appendChild(img);
  wrap.appendChild(overlay);
  wrap.appendChild(meta);

  return wrap;
}

function renderHostItems() {
  host.innerHTML = "";
  PHOTOS.forEach((p, i) => host.appendChild(makeItem(p, i)));
}

// Set each horizontal card’s aspect from meta so width matches height cleanly.
function tuneHorizontalCards() {
  const heightPx =
    parseInt(getComputedStyle(host).getPropertyValue("--h")) || 260;
  [...host.children].forEach((fig) => {
    const idx = Number(fig.dataset.index);
    const info = PHOTOS[idx];
    if (!info) return;
    fig.style.aspectRatio = `${info.w} / ${info.h}`; // preserve natural ratio
    fig.style.height = `${heightPx}px`;
  });
}

// ---------------------------------------------
// Slideshow
// ---------------------------------------------
function buildSlideshow() {
  const stageImg = slideshowHost.querySelector(".ss-img");
  const stageCap = slideshowHost.querySelector(".ss-cap");
  const btnPrev = slideshowHost.querySelector(".ss-prev");
  const btnNext = slideshowHost.querySelector(".ss-next");

  ssThumbs.innerHTML = "";
  PHOTOS.forEach((p, i) => {
    const b = document.createElement("button");
    b.className = "ss-thumb";
    b.type = "button";
    b.setAttribute("aria-label", `Show ${p.title || `Photo ${i + 1}`}`);
    b.innerHTML = `<img src="${p.src}" alt="${p.title || `Photo ${i + 1}`}" />`;
    b.addEventListener("click", () => showSlide(i));
    ssThumbs.appendChild(b);
  });

  btnPrev.onclick = () => showSlide(SLIDE_INDEX - 1);
  btnNext.onclick = () => showSlide(SLIDE_INDEX + 1);

  document.addEventListener("keydown", onSlideKeys);
  function onSlideKeys(e) {
    if (CURRENT_LAYOUT !== "slideshow") return;
    if (e.key === "ArrowLeft") showSlide(SLIDE_INDEX - 1);
    if (e.key === "ArrowRight") showSlide(SLIDE_INDEX + 1);
  }

  function showSlide(i) {
    if (!PHOTOS.length) return;
    SLIDE_INDEX = (i + PHOTOS.length) % PHOTOS.length;
    const cur = PHOTOS[SLIDE_INDEX];
    stageImg.src = cur.src;
    stageImg.alt = cur.title || "";
    stageCap.textContent = [cur.title, cur.year].filter(Boolean).join(" • ");
    ssThumbs.querySelectorAll(".ss-thumb").forEach((el, idx) => {
      el.classList.toggle("is-active", idx === SLIDE_INDEX);
    });
  }

  showSlide(0);
}

// ---------------------------------------------
// Layout switching
// ---------------------------------------------
function applyLayout(mode) {
  CURRENT_LAYOUT = mode;
  setParam("mode", mode);
  try {
    localStorage.setItem("gallery_mode", mode);
  } catch {}

  layoutSelect.value = mode;
  layoutTip.textContent = TIPS[mode] || "";

  // Reset classes/visibility
  host.className = "gallery-host";
  slideshowHost.hidden = true;

  if (mode === "slideshow") {
    host.setAttribute("aria-busy", "true");
    host.innerHTML = "";
    slideshowHost.hidden = false;
    buildSlideshow();
    host.setAttribute("aria-busy", "false");
    return;
  }

  // Horizontal
  host.setAttribute("aria-busy", "true");
  host.classList.add("gallery--horizontal");
  renderHostItems();
  tuneHorizontalCards();
  host.setAttribute("aria-busy", "false");
}

// ---------------------------------------------
// Data load & init
// ---------------------------------------------
async function renderGallery() {
  const key = getParam("country");
  try {
    const res = await fetch("data/films.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load films.json");
    const data = await res.json();

    const countries = Array.isArray(data?.countries) ? data.countries : [];
    const country = countries.find((c) => c.key === key) || countries[0];

    if (!country) {
      titleEl.textContent = "Film Gallery";
      descEl.textContent = "No images yet.";
      host.removeAttribute("aria-busy");
      return;
    }

    titleEl.textContent = country.name;
    descEl.textContent = country.desc || "";

    const base = (country.photos || []).map((p) => ({
      src: p.src,
      title: p.title || "",
      year: p.year || "",
    }));

    PHOTOS = await addMetaToPhotos(base);

    const fromUrl = getParam("mode");
    const initial =
      fromUrl && ["horizontal", "slideshow"].includes(fromUrl)
        ? fromUrl
        : localStorage.getItem("gallery_mode") || "horizontal";

    applyLayout(initial);

    if (!PHOTOS.length) {
      host.innerHTML = `<div class="text-center" style="opacity:.7">No photos yet.</div>`;
    }
  } catch (e) {
    console.error(e);
    host.innerHTML = `<div class="text-center" style="opacity:.7">Failed to load gallery.</div>`;
  } finally {
    host.removeAttribute("aria-busy");
  }
}

// UI events
layoutSelect.addEventListener("change", (e) => applyLayout(e.target.value));

// Kickoff
renderGallery();

// Re-tune on resize
let resizeTimer = null;
window.addEventListener("resize", () => {
  if (resizeTimer) cancelAnimationFrame(resizeTimer);
  resizeTimer = requestAnimationFrame(() => {
    if (CURRENT_LAYOUT === "horizontal") applyLayout("horizontal");
  });
});
