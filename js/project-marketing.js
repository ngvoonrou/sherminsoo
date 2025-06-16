// js/setupProjectMarketing.js
export function setupProjectMarketing() {
  fetch("data/projectMarketing.json")
    .then((res) => res.json())
    .then((data) => {
      const tabNav = document.getElementById("projectTabs");
      const tabContent = document.getElementById("projectTabsContent");

      tabNav.innerHTML = "";
      tabContent.innerHTML = "";

      data.forEach((item, index) => {
        const isActive = index === 0;

        // Create Tab
        const tabBtn = document.createElement("li");
        tabBtn.className = "nav-item";
        tabBtn.innerHTML = `
          <button class="nav-link ${isActive ? "active" : ""}" 
                  data-bs-toggle="tab" 
                  data-bs-target="#project-${index}" 
                  type="button" 
                  role="tab">
            ${item.title}
          </button>
        `;
        tabNav.appendChild(tabBtn);

        // Create Content Pane
        const contentPane = document.createElement("div");
        contentPane.className = `tab-pane fade ${
          isActive ? "show active" : ""
        }`;
        contentPane.id = `project-${index}`;

        const title = document.createElement("h4");
        title.textContent = item.title;

        const desc = document.createElement("p");
        desc.textContent = item.description;

        contentPane.appendChild(title);
        contentPane.appendChild(desc);

        if (item.media) {
          const row = document.createElement("div");
          row.className = "row g-3";

          item.media.forEach((media) => {
            const col = document.createElement("div");
            col.className = "col-md-3";

            if (media.type === "video") {
              col.innerHTML = `
                <video controls poster="${media.thumbnail}" class="w-100">
                  <source src="${media.src}" type="video/mp4" />
                </video>
              `;
            } else {
              col.innerHTML = `<img src="${media.src}" class="img-fluid rounded shadow" />`;
            }

            row.appendChild(col);
          });

          contentPane.appendChild(row);
        }

        if (item.projects) {
          item.projects.forEach((proj) => {
            const projTitle = document.createElement("h5");
            projTitle.className = "mt-4";
            projTitle.textContent = proj.name;

            const row = document.createElement("div");
            row.className = "row g-3";

            proj.images.forEach((img) => {
              const col = document.createElement("div");
              col.className = "col-md-3";
              col.innerHTML = `<img src="${img}" class="img-fluid rounded" />`;
              row.appendChild(col);
            });

            const link = document.createElement("a");
            link.href = proj.link;
            link.target = "_blank";
            link.className =
              "d-block mt-2 mb-4 text-decoration-underline text-primary";
            link.textContent = `Check out more on ${proj.name} official website`;

            contentPane.appendChild(projTitle);
            contentPane.appendChild(row);
            contentPane.appendChild(link);
          });
        }

        if (item.credits) {
          const credits = document.createElement("div");
          credits.className = "mt-3";
          credits.innerHTML =
            `<small><strong>Credit to:</strong></small><ul>` +
            Object.entries(item.credits)
              .map(
                ([role, val]) =>
                  `<li>${role}: ${
                    val.includes("http")
                      ? `<a href="${val}" target="_blank">${val}</a>`
                      : val
                  }</li>`
              )
              .join("") +
            `</ul>`;
          contentPane.appendChild(credits);
        }

        tabContent.appendChild(contentPane);
      });
    });
}
