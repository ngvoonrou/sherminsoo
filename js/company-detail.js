const LIST_URL = "data/company.json"; // to verify slug exists + get logo/alt
const DETAIL_URL = "data/company-detail.json"; // richer content per slug

function getSlug() {
  const p = new URLSearchParams(location.search);
  return p.get("slug")?.trim() || "";
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

function findCompanyBySlug(list, slug) {
  const companies = (Array.isArray(list) ? list : []).flatMap((g) =>
    Array.isArray(g.items) ? g.items : []
  );
  return companies.find((c) => c.slug === slug);
}

function render404(mount, slug) {
  mount.innerHTML = `
    <div class="text-center py-5">
      <h1 class="mb-3">Not found</h1>
      <p class="mb-4">We couldn't find details for <strong>${slug}</strong>.</p>
      <a class="btn btn-dark" href="index.html#company">Back to brands</a>
    </div>`;
}

function renderDetail(mount, base, detail) {
  const { alt, logo } = base;
  const {
    name = alt || "Brand",
    summary = "",
    hero = "",
    highlights = [],
    gallery = [],
    website,
  } = detail || {};

  mount.innerHTML = `
    <header class="mb-4">
      <div class="d-flex align-items-center gap-3">
        <img src="${logo}" alt="${
    alt || name
  }" class="rounded" style="width:72px;height:72px;object-fit:contain" />
        <div>
          <h1 class="h3 mb-1">${name}</h1>
          ${
            website
              ? `<a href="${website}" target="_blank" rel="noopener" class="link-underline">Official site</a>`
              : ""
          }
        </div>
      </div>
    </header>

    ${
      hero
        ? `
      <div class="ratio ratio-21x9 mb-4">
        <img src="${hero}" alt="${name} hero image" class="w-100 h-100 object-fit-cover rounded-4" />
      </div>`
        : ""
    }

    <section class="mb-4">
      <h2 class="h5">Overview</h2>
      <p>${summary}</p>
    </section>

    ${
      highlights.length
        ? `
      <section class="mb-4">
        <h2 class="h5">Highlights</h2>
        <ul class="mb-0">
          ${highlights.map((h) => `<li>${h}</li>`).join("")}
        </ul>
      </section>`
        : ""
    }

    ${
      gallery.length
        ? `
      <section>
        <h2 class="h5">Gallery</h2>
        <div class="row g-3">
          ${gallery
            .map(
              (src) => `
            <div class="col-6 col-md-4">
              <img src="${src}" class="w-100 rounded-3" alt="${name} gallery image" loading="lazy" decoding="async" />
            </div>
          `
            )
            .join("")}
        </div>
      </section>`
        : ""
    }
  `;
}

(async function init() {
  const slug = getSlug();
  const mount = document.getElementById("companyDetail");
  if (!slug || !mount) return;

  try {
    const [list, details] = await Promise.all([
      fetchJSON(LIST_URL),
      fetchJSON(DETAIL_URL),
    ]);
    const base = findCompanyBySlug(list, slug);
    const detail = (Array.isArray(details) ? details : []).find(
      (d) => d.slug === slug
    );

    if (!base || !detail) {
      render404(mount, slug);
    } else {
      renderDetail(mount, base, detail);
    }
  } catch (e) {
    console.error(e);
    render404(mount, slug);
  } finally {
    mount?.removeAttribute("aria-busy");
  }
})();
