export function setupFilmsPhotography() {
  fetch("data/films-photography.json")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("photographyContainer");
      container.innerHTML = "";
      data.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "photography-item";
        div.innerHTML = `
          <img src="${item.src}" alt="${item.title}" loading="lazy" />
          <div class="photo-meta">
            <div class="photo-index">/ ${String(index + 1).padStart(
              2,
              "0"
            )}</div>
            <div class="photo-info">
              <div class="photo-title">${item.title}</div>
              <div class="photo-country">${item.country}</div>
            </div>
          </div>
        `;
        container.appendChild(div);
      });
    });
}
