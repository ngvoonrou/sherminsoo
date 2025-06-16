export function setupVisualDesign() {
  fetch("data/visualDesign.json")
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById("visualDesignContainer");

      data.forEach((section) => {
        const col = document.createElement("div");
        col.className = "col-md-3";

        let innerHTML = `<div class="text-center mb-2"><strong>${section.title}</strong></div>`;

        if (section.type === "images") {
          innerHTML += `<div class="d-flex flex-column gap-2">`;
          section.items.forEach((img) => {
            innerHTML += `<img src="${img.src}" class="img-fluid rounded" alt="${img.alt}">`;
          });
          innerHTML += `</div>`;
        } else if (section.type === "video") {
          innerHTML += `
          <div class="ratio ratio-9x16 rounded overflow-hidden">
            <video controls poster="${section.poster}">
              <source src="${section.videoSrc}" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p class="mt-2 text-center">
            <a href="${section.link}" class="link-secondary">Link to slideshow</a>
          </p>
        `;
        }

        col.innerHTML = innerHTML;
        container.appendChild(col);
      });
    })
    .catch((error) =>
      console.error("Error loading visual design data:", error)
    );
}
