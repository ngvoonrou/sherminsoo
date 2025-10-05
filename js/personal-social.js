const JSON_URL = "data/personal-social.json";

export async function initPersonalMedia(
  containerSelector = "#storiesStrip",
  jsonUrl = "data/personal-social.json"
) {
  const mount = document.querySelector(containerSelector);
  if (!mount) return;

  try {
    const res = await fetch(jsonUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Build DOM
    const frag = document.createDocumentFragment();

    (data.stories || []).forEach((s) => {
      const card = document.createElement("article");
      card.className = "story-card";
      card.dataset.profile = s.handle || s.profileName || "";
      card.dataset.url = s.url || "#";

      // header
      const header = document.createElement("header");
      header.className = "story-bar";

      const avatar = document.createElement("img");
      avatar.className = "story-avatar";
      avatar.src = s.avatar;
      avatar.alt = "";

      const meta = document.createElement("div");
      meta.className = "story-meta";

      const name = document.createElement("span");
      name.className = "story-name";
      name.textContent = s.profileName || s.handle || "";

      const time = document.createElement("span");
      time.className = "story-time";
      time.textContent = s.timeLabel || "";

      const dots = document.createElement("span");
      dots.className = "story-dots";
      dots.setAttribute("aria-hidden", "true");
      dots.textContent = "•••";

      meta.appendChild(name);
      meta.appendChild(time);

      header.appendChild(avatar);
      header.appendChild(meta);
      header.appendChild(dots);

      // media
      const mediaWrap = document.createElement("div");
      mediaWrap.className = "story-media";

      let video;
      if (s.media?.type === "video") {
        video = document.createElement("video");
        video.className = "story-video";
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        if (s.media.poster) video.poster = s.media.poster;

        const source = document.createElement("source");
        source.src = s.media.src;
        source.type = "video/mp4";
        video.appendChild(source);
      }
      if (video) mediaWrap.appendChild(video);

      // clickable overlay
      const btn = document.createElement("button");
      btn.className = "story-cta";
      btn.type = "button";
      btn.setAttribute(
        "aria-label",
        `Open ${s.handle || s.profileName} on Instagram`
      );

      const playIcon = document.createElement("span");
      playIcon.className = "play-icon";
      playIcon.setAttribute("aria-hidden", "true");
      btn.appendChild(playIcon);

      // assemble
      card.appendChild(header);
      card.appendChild(mediaWrap);
      card.appendChild(btn);
      frag.appendChild(card);
    });

    mount.innerHTML = "";
    mount.appendChild(frag);

    // interactions
    wireClickThrough(mount);
    wireSmartPlayback(mount);
  } catch (err) {
    console.error("Personal media init failed:", err);
    mount.innerHTML =
      '<p style="opacity:.7">Unable to load social stories right now.</p>';
  }
}

/* open IG profile in a new tab */
function wireClickThrough(scope) {
  scope.querySelectorAll(".story-card").forEach((card) => {
    const url = card.dataset.url;
    const btn = card.querySelector(".story-cta");
    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    });
    // keyboard support on the whole card
    card.tabIndex = 0;
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn?.click();
      }
    });
  });
}

/* play/pause videos only when visible */
function wireSmartPlayback(scope) {
  const cards = scope.querySelectorAll(".story-card");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const vid = entry.target.querySelector("video.story-video");
        if (!vid) return;
        if (entry.isIntersecting) {
          vid.muted = true;
          vid.playsInline = true;
          const p = vid.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } else {
          vid.pause();
        }
      });
    },
    { threshold: 0.35 }
  );
  cards.forEach((c) => io.observe(c));
}
