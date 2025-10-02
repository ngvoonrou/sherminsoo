function openVideoModal(videoSrc) {
  const modalVideo = document.getElementById("modalVideo");
  const modal = new bootstrap.Modal(document.getElementById("videoModal"));

  if (modalVideo && videoSrc) {
    modalVideo.src = videoSrc;
    modalVideo.play();
  }
  modal.show();

  document.getElementById("videoModal").addEventListener(
    "hidden.bs.modal",
    () => {
      if (modalVideo) {
        modalVideo.pause();
        modalVideo.currentTime = 0;
        modalVideo.src = "";
      }
    },
    { once: true }
  );
}

export function setupReelsV2() {
  fetch("data/reels.json")
    .then((r) => r.json())
    .then((reelsV2Data) => {
      const container = document.getElementById("reelsV2Container");
      if (!container) return;

      reelsV2Data.forEach((reel) => {
        const col = document.createElement("div");
        col.className = "col";

        const title = reel.title || "Untitled";
        const videoSrc = reel.src || reel.video || ""; // tolerate either key
        const thumbnail =
          reel.thumbnail || "assets/reels/thumbnails/default.jpg";
        const subtitleOrType = reel.subtitle || reel.type || "";

        col.innerHTML = `
          <div class="reels-v2-card" role="button" tabindex="0" aria-label="Play ${title}">
            <img src="${thumbnail}" alt="${title}">
            <div class="reels-v2-overlay">
              <i class="fas fa-play-circle"></i>
            </div>
          </div>
          <div class="reels-v2-meta">
            <h5>${title}</h5>
            <small>${subtitleOrType}</small>
          </div>
        `;

        const card = col.querySelector(".reels-v2-card");
        const play = () => videoSrc && openVideoModal(videoSrc);
        card.addEventListener("click", play);
        card.addEventListener("keydown", (e) =>
          e.key === "Enter" ? play() : null
        );

        container.appendChild(col);
      });
    })
    .catch((err) => {
      console.error("Failed to load reels.json", err);
    });
}
