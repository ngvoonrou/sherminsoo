function pickCover(country) {
  if (country?.cover) return country.cover;
  const first = country?.photos?.[0]?.src;
  return first || "";
}

export async function renderFilmCovers(mountSelector = "#filmCovers") {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;

  mount.setAttribute("aria-busy", "true");
  try {
    const res = await fetch("data/films.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load films.json");
    const data = await res.json();

    const countries = Array.isArray(data?.countries) ? data.countries : [];
    mount.innerHTML = "";

    countries.forEach((c, i) => {
      const card = document.createElement("figure");
      card.className = "film-card";

      const bg = document.createElement("div");
      bg.className = "film-card__bg";
      bg.style.backgroundImage = `url("${pickCover(c)}")`;
      card.appendChild(bg);

      const label = document.createElement("figcaption");
      label.className = "film-card__label";
      label.innerHTML = `
        <div class="film-card__name">${c.name}</div>
      `;
      card.appendChild(label);

      const link = document.createElement("a");
      link.className = "film-card__link";
      link.href = `gallery.html?country=${encodeURIComponent(c.key)}`;
      link.setAttribute("aria-label", `Open ${c.name} gallery`);
      card.appendChild(link);

      mount.appendChild(card);
    });

    if (!countries.length) {
      mount.innerHTML = `<div class="text-center" style="opacity:.7">No galleries yet.</div>`;
    }
  } catch (e) {
    console.error(e);
    mount.innerHTML = `<div class="text-center" style="opacity:.7">Unable to load film galleries.</div>`;
  } finally {
    mount.removeAttribute("aria-busy");
  }
}
