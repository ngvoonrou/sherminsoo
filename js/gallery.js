export function setupGallery() {
  fetch("data/gallery.json")
    .then((res) => res.json())
    .then((data) => {
      const gallery = document.getElementById("masonryGallery");
      gallery.innerHTML = "";
      data.forEach((img) => {
        const div = document.createElement("div");
        div.className = `gallery-item ${img.category}`;
        div.innerHTML = `<img src="${img.src}" alt="${img.title}">`;
        gallery.appendChild(div);
      });
    });

  document.querySelectorAll(".gallery-filters button").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.textContent.toLowerCase();
      const items = document.querySelectorAll(".gallery-item");
      items.forEach((item) => {
        item.style.display =
          category === "all" || item.classList.contains(category)
            ? "block"
            : "none";
      });
    });
  });
}

export function setupRecentWork() {
  fetch("data/gallery.json")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("recentWorkContainer");
      container.innerHTML = "";
      data.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "recent-work-item";
        div.innerHTML = `
          <img src="${item.src}" alt="${item.title}" />
          <div class="photo-meta">
            <div class="photo-index">/ ${String(index + 1).padStart(
              2,
              "0"
            )}</div>
            <div class="photo-info">
              <div class="photo-title">${item.title}</div>
              <div class="photo-year">${item.year}</div>
            </div>
          </div>
        `;
        container.appendChild(div);
      });
    });
}
