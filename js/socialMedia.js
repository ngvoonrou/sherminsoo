export function setuSocialMedia() {
  fetch("data/socialMediaStrategy.json")
    .then((response) => response.json())
    .then((strategyData) => {
      const strategySection = document.getElementById("strategy");

      strategyData.forEach((section, index) => {
        const sectionTitle = document.createElement("h3");
        sectionTitle.className = "mt-5 mb-3 text-center";
        sectionTitle.textContent = section.title;
        strategySection.appendChild(sectionTitle);

        const row = document.createElement("div");
        row.className = "row g-4";

        section.projects.forEach((project, projIndex) => {
          const {
            client,
            inHouseProduction,
            contentType,
            descriptionTitle,
            descriptionPoints,
            image,
          } = project;

          const title = client || inHouseProduction || "Untitled";

          const swiperId = `strategy-swiper-${index}-${projIndex}`;

          const cardHTML = `
            <div class="col-md-6 col-lg-4"}">
              <div class="card strategy-card h-100 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title mb-2">${title}</h5>
                  ${
                    contentType
                      ? `<h6 class="card-subtitle text-muted mb-2">${contentType}</h6>`
                      : ""
                  }
                  ${
                    descriptionTitle
                      ? `<p class="text-uppercase text-primary fw-bold small mb-2">${descriptionTitle}</p>`
                      : ""
                  }
                  ${
                    descriptionPoints
                      ? `<ul class="small ps-3 mb-3">${descriptionPoints
                          .map((point) => `<li>${point}</li>`)
                          .join("")}</ul>`
                      : ""
                  }
                  ${
                    image && image.length
                      ? `<div class="swiper strategy-swiper" id="${swiperId}">
                          <div class="swiper-wrapper">
                            ${image
                              .map(
                                (src) => `
                                  <div class="swiper-slide">
                                    <img src="${src}" class="img-fluid rounded" alt="${title}" style="height: 100px; object-fit: cover;" />
                                  </div>
                                `
                              )
                              .join("")}
                          </div>
                        </div>`
                      : ""
                  }
                </div>
              </div>
            </div>
          `;

          row.innerHTML += cardHTML;
        });

        strategySection.appendChild(row);

        setTimeout(() => {
          new Swiper(".strategy-swiper", {
            slidesPerView: 2.2,
            spaceBetween: 10,
            freeMode: true,
          });
        }, 0);
      });
    })
    .catch((error) => {
      console.error("Failed to load strategy data:", error);
      document.getElementById(
        "strategy"
      ).innerHTML += `<p class="text-danger">Failed to load content.</p>`;
    });
}
