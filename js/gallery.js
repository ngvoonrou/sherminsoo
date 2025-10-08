function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || "";
}

function makeItem(photo, index) {
  const wrap = document.createElement("figure");
  wrap.className = "gallery-item";

  const title = photo.title || `Photo ${index + 1}`;
  const year = photo.year || "";

  // Image
  const img = document.createElement("img");
  img.src = photo.src;
  img.alt = title;
  img.loading = "lazy";
  img.decoding = "async";

  // Bottom overlay (appears on hover/focus)
  const overlay = document.createElement("div");
  overlay.className = "gallery-overlay";
  overlay.innerHTML = `<span>${title}</span><span style="opacity:.85">${year}</span>`;

  // Hidden figcaption (kept for semantics; you can remove if you like)
  const meta = document.createElement("figcaption");
  meta.className = "gallery-meta";
  meta.innerHTML = `<span>${title}</span><span>${year}</span>`;

  // Clickable layer (keyboard accessible)
  const cta = document.createElement("button");
  cta.className = "gallery-cta";
  cta.type = "button";
  cta.setAttribute("aria-label", `Enlarge ${title}`);

  // Attach
  wrap.appendChild(img);
  wrap.appendChild(overlay);
  wrap.appendChild(meta);
  wrap.appendChild(cta);

  // Lightbox hook
  cta.addEventListener("click", () => openLightbox(photo.src, title, year));
  cta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox(photo.src, title, year);
    }
  });

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

// ===== Simple Lightbox =====
const lb = (() => {
  const el = document.getElementById("lightbox");
  const img = el.querySelector(".lb-img");
  const cap = el.querySelector(".lb-caption");
  const closeBtn = el.querySelector(".lb-close");

  function open(src, title, year) {
    img.src = src;
    img.alt = title || "";
    cap.textContent = [title, year].filter(Boolean).join(" • ");
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    // Avoid keeping large image in memory if not needed:
    img.src = "";
  }

  // backdrop click
  el.addEventListener("click", (e) => {
    if (e.target === el) close();
  });
  // close button
  closeBtn.addEventListener("click", close);
  // ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && el.classList.contains("is-open")) close();
  });

  return { open, close };
})();

function openLightbox(src, title, year) {
  lb.open(src, title, year);
}
