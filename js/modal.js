export function setupModal() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const modalCaption = document.getElementById("modalCaption");
  const closeBtn = document.querySelector(".close");
  const navLeft = document.querySelector(".nav-left");
  const navRight = document.querySelector(".nav-right");

  let allImages = [];
  let currentIndex = -1;

  function updateImages() {
    allImages = Array.from(document.querySelectorAll(".photography-item img"));
    allImages.forEach((img, i) => {
      img.style.cursor = "zoom-in";
      img.onclick = () => {
        modal.style.display = "block";
        modalImg.src = img.src;
        modalCaption.innerText = img.alt;
        currentIndex = i;
      };
    });
  }

  closeBtn.onclick = () => (modal.style.display = "none");
  navLeft.onclick = () => navigate(-1);
  navRight.onclick = () => navigate(1);
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };

  function navigate(offset) {
    currentIndex =
      (currentIndex + offset + allImages.length) % allImages.length;
    modalImg.src = allImages[currentIndex].src;
    modalCaption.innerText = allImages[currentIndex].alt;
  }

  // Call once DOM content loaded
  window.addEventListener("load", updateImages);
}
