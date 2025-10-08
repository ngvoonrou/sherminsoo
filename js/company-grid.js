const JSON_URL = "data/company.json";

/* ---------- utils ---------- */
function isExternal(href = "") {
  if (!href) return false;
  try {
    const url = new URL(href, window.location.origin);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/* ---------- data fetch ---------- */
async function fetchCompanies() {
  const res = await fetch(JSON_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${JSON_URL}: ${res.status}`);
  return res.json();
}

/* ---------- card ---------- */
function makeCompanyCard(item = {}) {
  // Map JSON fields to what we need
  const image = item.logo || "";
  const title = item.alt || "";
  const href = item.link ?? "#";

  const card = document.createElement("figure");
  card.className = "company-card";
  card.setAttribute("role", "listitem");

  const img = document.createElement("img");
  img.className = "company-logo-img";
  img.src = image;
  img.alt = title ? `${title}` : "Company logo";
  img.loading = "lazy";
  img.decoding = "async";
  card.appendChild(img);

  const link = document.createElement("a");
  link.href = href || "#";
  link.setAttribute("aria-label", title ? `Open ${title}` : "Open project");
  if (isExternal(href)) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  card.appendChild(link);

  return card;
}

/* ---------- public render ---------- */
export async function renderCompanyGrid(mountSelector = "#companyGrid") {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;

  mount.setAttribute("aria-busy", "true");

  try {
    const data = await fetchCompanies();

    // data is an array of groups: [{ name, key, items: [...] }, ...]
    const companies = (Array.isArray(data) ? data : []).flatMap((group) =>
      Array.isArray(group.items) ? group.items : []
    );

    mount.innerHTML = "";

    if (!companies.length) {
      mount.innerHTML = `
        <div class="text-center" style="opacity:.7">
          No companies to display yet.
        </div>`;
    } else {
      companies.forEach((item) => mount.appendChild(makeCompanyCard(item)));
    }
  } catch (err) {
    console.error(err);
    mount.innerHTML = `
      <div class="text-center" style="opacity:.7">
        Unable to load companies.
      </div>`;
  } finally {
    mount.removeAttribute("aria-busy");
  }
}
