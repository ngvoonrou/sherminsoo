// js/company-stack.js (updated)
// Renders stacked company sections where each logo is an <a> linking to a company page.
export async function renderCompanyStack(
  targetSelector = "#companyStackInner",
  jsonPath = "data/company.json"
) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  target.setAttribute("aria-busy", "true");
  target.innerHTML = `<div class="stack-empty">Loading companies…</div>`;

  let data = [];
  try {
    const res = await fetch(jsonPath, { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to fetch");
    data = await res.json();
  } catch (err) {
    console.warn("company.json load failed, using fallback", err);
    data = [
      {
        name: "Personal Branding",
        key: "personal",
        items: [{ logo: "", alt: "logo", link: null }],
      },
    ];
  }

  // small helper: make a slug suitable for filenames/paths
  const slugify = (str) =>
    String(str || "")
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  // Render stack according to the JSON order
  target.innerHTML = "";
  data.forEach((section, sidx) => {
    const sec = document.createElement("section");
    sec.className = "company-stack-section";
    sec.setAttribute("aria-labelledby", `company-section-${sidx}-title`);

    // Heading (pill)
    const heading = document.createElement("div");
    heading.className = "company-pill";
    heading.id = `company-section-${sidx}-title`;
    heading.textContent = section.name;
    sec.appendChild(heading);

    // Row of logos
    const row = document.createElement("div");
    row.className = "company-logos-row";
    row.setAttribute("role", "list");

    // decide section-level fallback page slug
    const sectionSlug = section.key
      ? slugify(section.key)
      : slugify(section.name || `section-${sidx}`);

    section.items.forEach((it, idx) => {
      const item = document.createElement("div");
      item.className = "company-logo-item";
      item.setAttribute("role", "listitem");

      // create anchor always (clickable)
      const a = document.createElement("a");
      a.className = "company-logo-button";
      a.setAttribute("role", "link");
      a.setAttribute(
        "aria-label",
        it.alt || section.name || `company ${idx + 1}`
      );

      // Resolve href:
      // Priority: it.link (explicit) -> it.page (explicit company page) -> companies/<sectionSlug>-<idx>.html -> companies/<sectionSlug>.html -> company.html?company=<sectionSlug>
      let href = null;
      if (it.link) {
        href = it.link;
      } else if (it.page) {
        href = it.page;
      } else {
        // prefer a section-level page, fall back to index-per-item naming if necessary
        // try companies/<sectionSlug>.html
        href = `companies/${sectionSlug}.html`;
        // if you prefer per-item page instead, uncomment next line:
        // href = `companies/${sectionSlug}-${idx + 1}.html`;
      }

      a.href = href;

      // If external link, open in new tab
      const isExternal =
        /^https?:\/\//i.test(href) && !href.includes(location.hostname);
      if (isExternal) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }

      // Put image or placeholder inside anchor
      if (it.logo) {
        const img = document.createElement("img");
        img.loading = "lazy";
        img.src = it.logo;
        img.alt = it.alt || section.name || `logo ${idx + 1}`;
        img.className = "company-logo-img";
        a.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "company-logo-placeholder";
        placeholder.textContent = "logo";
        a.appendChild(placeholder);
      }

      item.appendChild(a);
      row.appendChild(item);
    });

    sec.appendChild(row);
    target.appendChild(sec);
  });

  target.setAttribute("aria-busy", "false");
}
