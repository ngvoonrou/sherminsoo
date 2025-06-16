export function setupVisualDesign() {
  fetch("data/visualDesign.json")
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById("visualDesignContainer");

      data.forEach((section) => {
        const col = document.createElement("div");
        col.className = "col-md-3 text-center";

        // Custom title banner style
        const titleHTML = `
            <div class="mb-4">
                <div class="d-inline-block px-4 py-2 border border-1 rounded-pill fw-semibold" 
                    style="border-color: #d8b78f; color: #5c4a36; font-family: 'Playfair', serif; background-color: #fff;">
                ${section.title}
                </div>
            </div>
        `;

        let contentHTML = "";

        if (section.type === "images") {
          if (section.title === "Guest Review") {
            contentHTML += `<div class="row row-cols-2 g-2">`;
            section.items.forEach((img) => {
              contentHTML += `
                <div class="col">
                  <img src="${img.src}" alt="${img.alt}" class="img-fluid rounded w-100" />
                </div>`;
            });
            contentHTML += `</div>`;
          } else {
            contentHTML += `<div class="d-flex flex-column gap-3 align-items-center">`;
            section.items.forEach((img) => {
              contentHTML += `
                <img src="${img.src}" alt="${img.alt}" class="img-fluid rounded" style="max-width: 100%;" />
              `;
            });
            contentHTML += `</div>`;
          }
        }

        if (section.type === "video") {
          contentHTML += `
            <div class="video-wrapper position-relative">
                <video controls poster="${section.poster}" class="w-100 h-100 object-fit-cover rounded">
                    <source src="${section.videoSrc}" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
            <p class="mt-2">
                <a href="${section.link}" class="link-secondary" target="_blank">Link to slideshow</a>
            </p>
        `;
        }

        col.innerHTML = titleHTML + contentHTML;
        container.appendChild(col);
      });
    })
    .catch((error) =>
      console.error("Error loading visual design data:", error)
    );
}
