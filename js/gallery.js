function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || "";
}

function makeItem(photo, index) {
  const wrap = document.createElement("figure");
  wrap.className = "gallery-item";
  wrap.innerHTML = `
    <img src="${photo.src}" alt="${
    photo.title || `Photo ${index + 1}`
  }" loading="lazy" decoding="async" />
    <figcaption class="gallery-meta">
      <span>${photo.title || ""}</span>
      <span>${photo.year || ""}</span>
    </figcaption>
  `;
  return wrap;
}

async function renderGallery() {
  const key = getParam("country");
  const titleEl = document.getElementById("galleryTitle");
  const descEl = document.getElementById("galleryDesc");
  const mount = document.getElementById("galleryMasonry");

  try {
    const res = await fetch("data/films.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load films.json");
    const data = await res.json();

    const countries = Array.isArray(data?.countries) ? data.countries : [];
    const country = countries.find((c) => c.key === key) || countries[0];

    if (!country) {
      titleEl.textContent = "Film Gallery";
      descEl.textContent = "No images yet.";
      mount.removeAttribute("aria-busy");
      return;
    }

    titleEl.textContent = country.name;
    descEl.textContent = country.desc || "";

    mount.innerHTML = "";
    (country.photos || []).forEach((p, i) => mount.appendChild(makeItem(p, i)));

    if (!(country.photos || []).length) {
      mount.innerHTML = `<div class="text-center" style="opacity:.7">No photos yet.</div>`;
    }
  } catch (e) {
    console.error(e);
    mount.innerHTML = `<div class="text-center" style="opacity:.7">Failed to load gallery.</div>`;
  } finally {
    mount.removeAttribute("aria-busy");
  }
}

renderGallery();
