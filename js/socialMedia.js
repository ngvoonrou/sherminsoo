export function setuSocialMedia() {
  fetch("data/socialMediaStrategy.json")
    .then((response) => response.json())
    .then((strategyData) => {
      const strategySection = document.getElementById("strategy");

      strategyData.forEach((section, sectionIndex) => {
        const carouselId = `strategy-carousel-${sectionIndex}`;
        const paginationId = `pagination-${sectionIndex}`;
        const nextBtnId = `next-${sectionIndex}`;
        const prevBtnId = `prev-${sectionIndex}`;

        // Section Title
        const sectionTitle = document.createElement("h3");
        sectionTitle.className = "carousel-group-title text-center mt-5";
        sectionTitle.textContent = section.title;
        strategySection.appendChild(sectionTitle);

        // Swiper Container
        const carouselHTML = `
          <div class="swiper strategy-carousel mb-5" id="${carouselId}">
            <div class="swiper-wrapper">
              ${section.projects
                .map((project) => {
                  const {
                    client,
                    inHouseProduction,
                    contentType,
                    descriptionTitle,
                    descriptionPoints,
                    image,
                  } = project;

                  const title = client || inHouseProduction || "Untitled";

                  return `
                    <div class="swiper-slide p-4">
                      <div class="card h-100 shadow-sm">
                        <div class="card-body">
                          <h4 class="card-title">${title}</h4>
                          ${
                            contentType
                              ? `<h6 class="text-muted">${contentType}</h6>`
                              : ""
                          }
                          ${
                            descriptionTitle
                              ? `<p class="text-uppercase text-primary fw-bold small mt-3 mb-0">${descriptionTitle}</p>`
                              : ""
                          }
                          ${
                            descriptionPoints
                              ? `<ul class="small ps-3">${descriptionPoints
                                  .map((point) => `<li>${point}</li>`)
                                  .join("")}</ul>`
                              : ""
                          }
                          ${
                            image && image.length
                              ? `
                              <div class="strategy-image-scroll mt-3">
                                ${image
                                  .map(
                                    (src) =>
                                      `<img src="${src}" class="strategy-image-scroll-item rounded" alt="${title}" />`
                                  )
                                  .join("")}
                              </div>
                            `
                              : ""
                          }
                        </div>
                      </div>
                    </div>
                  `;
                })
                .join("")}
            </div>
            <div class="swiper-pagination" id="${paginationId}"></div>
            <div class="swiper-button-prev" id="${prevBtnId}"></div>
            <div class="swiper-button-next" id="${nextBtnId}"></div>
          </div>
        `;

        strategySection.innerHTML += carouselHTML;

        // Initialize Swiper per section
        setTimeout(() => {
          new Swiper(`#${carouselId}`, {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            pagination: {
              el: `#${paginationId}`,
              clickable: true,
            },
            navigation: {
              nextEl: `#${nextBtnId}`,
              prevEl: `#${prevBtnId}`,
            },
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
