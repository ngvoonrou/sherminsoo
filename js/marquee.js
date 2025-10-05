// marquee.js
export function initMarquee() {
  const marquee = document.querySelector(".marquee");
  if (!marquee) return;

  const groups = marquee.querySelectorAll(".marquee__group");
  if (groups.length < 2) return;

  // Duplicate first group into second for seamless loop
  groups[1].innerHTML = groups[0].innerHTML;

  // Pause on hover (desktop)
  marquee.addEventListener("mouseenter", () =>
    marquee.classList.add("is-paused")
  );
  marquee.addEventListener("mouseleave", () =>
    marquee.classList.remove("is-paused")
  );
}
