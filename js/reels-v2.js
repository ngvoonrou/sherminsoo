function openVideoModal(videoSrc) {
  const modalVideo = document.getElementById("modalVideo");
  if (modalVideo) {
    modalVideo.src = videoSrc;
    modalVideo.play();
  }

  const modal = new bootstrap.Modal(document.getElementById("videoModal"));
  modal.show();

  document.getElementById("videoModal").addEventListener(
    "hidden.bs.modal",
    () => {
      modalVideo.pause();
      modalVideo.currentTime = 0;
      modalVideo.src = "";
    },
    { once: true }
  );
}

export function setupReelsV2() {
  fetch("data/reels.json")
    .then((response) => response.json())
    .then((reelsV2Data) => {
      const reelsContainer = document.getElementById("reelsV2Container");

      reelsV2Data.forEach((reel) => {
        const col = document.createElement("div");
        col.className = "col";

        const thumbnail =
          reel.thumbnail || "assets/reels/thumbnails/default.jpg";
        const subtitleOrType = reel.subtitle || reel.type || "";

        col.innerHTML = `
        <div class="reels-v2-card">
          <img src="${thumbnail}" alt="${reel.title}">
          <div class="reels-v2-overlay">
            <i class="fas fa-play-circle"></i>
          </div>
        </div>
        <div class="reels-v2-meta">
          <h5>${reel.title}</h5>
          <small>${subtitleOrType}</small>
        </div>
      `;

        col.querySelector(".reels-v2-card").addEventListener("click", () => {
          openVideoModal(reel.src);
        });

        reelsContainer.appendChild(col);
      });
    });
}
