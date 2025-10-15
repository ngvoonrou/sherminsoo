function pickCover(country) {
  if (country?.cover) return country.cover;
  const first = country?.photos?.[0]?.src;
  return first || "";
}

function setupCarouselNav(viewport, track, prevBtn, nextBtn) {
  const getStep = () => viewport.clientWidth; // scroll by one full frame

  const updateButtons = () => {
    const maxScroll = track.scrollWidth - viewport.clientWidth;
    const atStart = Math.round(viewport.scrollLeft) <= 0;
    const atEnd =
      Math.round(viewport.scrollLeft) >= Math.max(0, Math.round(maxScroll - 2)); // tiny tolerance
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
  };

  prevBtn.addEventListener("click", () => {
    viewport.scrollBy({ left: -getStep(), behavior: "smooth" });
  });
  nextBtn.addEventListener("click", () => {
    viewport.scrollBy({ left: getStep(), behavior: "smooth" });
  });

  // Keyboard (left/right) when viewport is focused
  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      viewport.scrollBy({ left: -getStep(), behavior: "smooth" });
    } else if (e.key === "ArrowRight") {
      viewport.scrollBy({ left: getStep(), behavior: "smooth" });
    }
  });

  // Update state on interactions
  viewport.addEventListener("scroll", () =>
    requestAnimationFrame(updateButtons)
  );
  window.addEventListener("resize", updateButtons);

  // Initial state
  updateButtons();
}

function enhanceViewportScroll(viewport) {
  // Translate vertical wheel to horizontal scrolling (desktop)
  viewport.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        viewport.scrollBy({ left: e.deltaY, behavior: "smooth" });
      }
    },
    { passive: false }
  );

  // Click-drag to scroll without killing normal clicks
  let isDown = false;
  let startX = 0;
  let startLeft = 0;
  let wasDragging = false;
  const DRAG_THRESHOLD = 5; // px before we treat it as a drag

  const onPointerDown = (e) => {
    // Only left-click / primary touch
    if (e.button !== undefined && e.button !== 0) return;
    isDown = true;
    wasDragging = false;
    startX = e.clientX;
    startLeft = viewport.scrollLeft;
    viewport.style.cursor = "grabbing";
  };

  const onPointerMove = (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) wasDragging = true;
    viewport.scrollLeft = startLeft - dx;
  };

  const onPointerUp = () => {
    isDown = false;
    viewport.style.cursor = "";
    // allow click to proceed next tick if not dragging
    setTimeout(() => {
      wasDragging = false;
    }, 0);
  };

  // If it was a drag, cancel the click so cards don't open accidentally
  const cancelClickIfDragging = (e) => {
    if (wasDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointerleave", onPointerUp);
  viewport.addEventListener("click", cancelClickIfDragging, true); // capture phase
}

export async function renderFilmCovers() {
  const track = document.querySelector("#filmTrack");
  const viewport = document.querySelector("#filmViewport");
  const prevBtn = document.querySelector(".fc-btn.prev");
  const nextBtn = document.querySelector(".fc-btn.next");

  if (!track || !viewport || !prevBtn || !nextBtn) return;

  // Desktop polish
  enhanceViewportScroll(viewport);

  track.setAttribute("aria-busy", "true");
  try {
    const res = await fetch("data/films.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load films.json");
    const data = await res.json();

    const countries = Array.isArray(data?.countries) ? data.countries : [];
    track.innerHTML = "";

    countries.forEach((c) => {
      const card = document.createElement("figure");
      card.className = "film-card";
      card.setAttribute("role", "listitem");
      card.setAttribute("aria-label", c.name);

      // Cover image (lazy)
      const img = document.createElement("img");
      img.className = "film-card__img";
      img.src = pickCover(c);
      img.alt = `${c.name} – film cover`;
      img.loading = "lazy";
      img.decoding = "async";
      img.draggable = false;
      card.appendChild(img);

      // Label
      const label = document.createElement("figcaption");
      label.className = "film-card__label";
      label.innerHTML = `<div class="film-card__name">${c.name}</div>`;
      card.appendChild(label);

      // Clickable layer
      const link = document.createElement("a");
      link.className = "film-card__link";
      link.href = `gallery.html?country=${encodeURIComponent(c.key)}`;
      link.setAttribute("aria-label", `Open ${c.name} gallery`);
      card.appendChild(link);

      track.appendChild(card);
    });

    if (!countries.length) {
      track.innerHTML = `<div class="text-center" style="opacity:.7;padding:16px">No galleries yet.</div>`;
    }

    // Set up buttons/keyboard
    setupCarouselNav(viewport, track, prevBtn, nextBtn);

    // Announce "current" slide to assistive tech
    const slides = () => Array.from(track.querySelectorAll(".film-card"));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = [...entries].sort(
          (a, b) => b.intersectionRatio - a.intersectionRatio
        )[0];
        slides().forEach((s) => s.removeAttribute("aria-current"));
        if (visible?.target)
          visible.target.setAttribute("aria-current", "true");
      },
      { root: viewport, threshold: [0.3, 0.6, 0.9] }
    );
    slides().forEach((el) => io.observe(el));
  } catch (e) {
    console.error(e);
    track.innerHTML = `<div class="text-center" style="opacity:.7;padding:16px">Unable to load film galleries.</div>`;
  } finally {
    track.removeAttribute("aria-busy");
  }
}
