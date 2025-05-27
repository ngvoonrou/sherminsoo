export function setupReels() {
  fetch("data/reels.json")
    .then((res) => res.json())
    .then((data) => {
      const slidesContainer = document.getElementById("reelsSlides");
      const titleBox = document.getElementById("reels-main-title");
      const typeBox = document.getElementById("reels-type");
      const subtitleBox = document.getElementById("reels-subtitle");

      data.forEach((reel) => {
        const slide = document.createElement("div");
        slide.className = "swiper-slide";
        slide.innerHTML = `
          <video src="${reel.src}" muted playsinline preload="metadata" class="reel-video"></video>
        `;
        slidesContainer.appendChild(slide);
      });

      const swiper = new Swiper(".reels-swiper", {
        slidesPerView: "auto",
        spaceBetween: 30,
        centeredSlides: true,
        loop: true,
        on: {
          init: function () {
            updateTitles(this.realIndex);
            playVideo(this);
          },
          slideChangeTransitionEnd: function () {
            updateTitles(this.realIndex);
            playVideo(this);
          },
        },
      });

      function updateTitles(index) {
        const reel = data[index];
        titleBox.textContent = reel.title || "";
        typeBox.textContent = reel.type || "";
        subtitleBox.textContent = reel.subtitle || ""; // Default to empty if null/undefined
      }

      function playVideo(swiper) {
        const allVideos = document.querySelectorAll(".reel-video");
        allVideos.forEach((v) => {
          v.pause();
          v.currentTime = 0;
        });

        const activeSlide = swiper.slides[swiper.activeIndex];
        const video = activeSlide.querySelector("video");
        if (video)
          video.play().catch((err) => console.log("Autoplay failed", err));
      }
    });
}
