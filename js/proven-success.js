const JSON_URL = "data/proven-success.json";
const MOUNT_SELECTOR = "#provenMosaic";

/* ---------- utils ---------- */
function isExternal(href = "") {
  try {
    const url = new URL(href, window.location.origin);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/* ---------- data fetch ---------- */
export async function fetchProvenSuccess() {
  const res = await fetch(JSON_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${JSON_URL}: ${res.status}`);
  return res.json();
}

/* ---------- tile ---------- */
function makeTile(company = {}, categoryTitle = "Category") {
  const { image = "", title = "", href = "#" } = company;

  const tile = document.createElement("figure");
  tile.className = "mosaic__tile";
  tile.setAttribute("role", "listitem");

  // AOS fade-up (optional; safe if AOS is not present)
  tile.setAttribute("data-aos", "fade-up");
  tile.setAttribute("data-aos-duration", "700");
  tile.setAttribute("data-aos-offset", "80");

  // Image
  const img = document.createElement("img");
  img.className = "mosaic__img";
  img.src = image;
  img.alt = title ? `${title} visual` : "Case image";
  img.loading = "lazy";
  img.decoding = "async";
  tile.appendChild(img);

  // Overlay: “[Category] — [Company]”
  const overlay = document.createElement("figcaption");
  overlay.className = "mosaic__overlay";
  overlay.innerHTML = `<div class="mosaic__label">${categoryTitle} — ${title}</div>`;
  tile.appendChild(overlay);

  // Clickable link (covers the whole tile)
  const link = document.createElement("a");
  link.className = "mosaic__link";
  link.href = href || "#";
  link.setAttribute("aria-label", `${categoryTitle} — ${title || "View case"}`);

  // Safe external links
  if (isExternal(href)) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  tile.appendChild(link);

  return tile;
}

/* ---------- public render ---------- */
export async function renderProvenSuccess(mountSelector = MOUNT_SELECTOR) {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;

  mount.setAttribute("role", "list");
  mount.setAttribute("aria-busy", "true");

  try {
    const data = await fetchProvenSuccess();
    const tiles = [];

    const categories = Array.isArray(data?.categories) ? data.categories : [];
    categories.forEach((cat) => {
      const catTitle = cat?.title || "Category";
      (cat?.companies || []).forEach((c) => tiles.push(makeTile(c, catTitle)));
    });

    mount.innerHTML = "";

    if (!tiles.length) {
      mount.innerHTML = `
        <div class="text-center" style="opacity:.7">
          No cases to display yet.
        </div>`;
    } else {
      tiles.forEach((t) => mount.appendChild(t));
    }

    // Init/refresh AOS if available
    if (window.AOS && typeof window.AOS.init === "function") {
      // If AOS was not initialized elsewhere:
      if (!document.documentElement.hasAttribute("data-aos-initialized")) {
        window.AOS.init({ once: true, easing: "ease-out-cubic" });
        document.documentElement.setAttribute("data-aos-initialized", "true");
      } else if (typeof window.AOS.refresh === "function") {
        window.AOS.refresh();
      }
    }
  } catch (err) {
    console.error(err);
    mount.innerHTML = `
      <div class="text-center" style="opacity:.7">
        Unable to load Proven Success.
      </div>`;
  } finally {
    mount.removeAttribute("aria-busy");
  }
}
