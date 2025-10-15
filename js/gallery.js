// gallery.js — vertical masonry using CSS columns

// -------- utils --------
function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || "";
}

// -------- refs --------
const titleEl = document.getElementById("galleryTitle");
const descEl = document.getElementById("galleryDesc");
const masonryEl = document.getElementById("masonry");

// graceful image load -> add class for fade-in
function loadWithReady(img, card) {
  const onDone = () => card.classList.add("is-ready");
  if (img.complete) onDone();
  else img.addEventListener("load", onDone, { once: true });
  img.addEventListener("error", () => onDone(), { once: true });
}

// build one card
function makeCard(photo) {
  const fig = document.createElement("figure");
  fig.className = "masonry-item";

  const img = document.createElement("img");
  img.src = photo.src;
  img.alt = photo.title;
  img.loading = "lazy";
  img.decoding = "async";

  const cap = document.createElement("figcaption");
  cap.className = "masonry-cap";
  cap.innerHTML = `<span>${photo.title || ""}</span>`;

  fig.appendChild(img);
  fig.appendChild(cap);
  loadWithReady(img, fig);
  return fig;
}

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
      titleEl.textContent = "Film Gallery";
      descEl.textContent = "No images yet.";
      masonryEl.setAttribute("aria-busy", "false");
      return;
    }

    titleEl.textContent = country.name;
    descEl.textContent = country.desc || "";

    const photos = (country.photos || []).map((p) => ({
      src: p.src,
      title: p.title || "",
    }));

    masonryEl.innerHTML = "";
    photos.forEach((p) => masonryEl.appendChild(makeCard(p)));

    if (!photos.length) {
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
