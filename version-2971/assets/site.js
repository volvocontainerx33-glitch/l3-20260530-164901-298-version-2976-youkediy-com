
(function () {
  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function byYearDesc(a, b) {
    return (parseInt(b.dataset.year || "0", 10) || 0) - (parseInt(a.dataset.year || "0", 10) || 0);
  }

  function byTitleAsc(a, b) {
    return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
  }

  function byRegionAsc(a, b) {
    return (a.dataset.region || "").localeCompare(b.dataset.region || "", "zh-Hans-CN");
  }

  function byFeatured(a, b) {
    const pa = parseFloat(a.dataset.popularity || "0");
    const pb = parseFloat(b.dataset.popularity || "0");
    if (pb !== pa) return pb - pa;
    const ya = parseInt(a.dataset.year || "0", 10) || 0;
    const yb = parseInt(b.dataset.year || "0", 10) || 0;
    if (yb !== ya) return yb - ya;
    return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
  }

  function sortCards(cards, mode) {
    const arr = Array.from(cards);
    switch (mode) {
      case "year":
        arr.sort(byYearDesc);
        break;
      case "title":
        arr.sort(byTitleAsc);
        break;
      case "region":
        arr.sort(byRegionAsc);
        break;
      default:
        arr.sort(byFeatured);
        break;
    }
    return arr;
  }

  function setupMobileNav() {
    document.querySelectorAll("[data-nav-toggle]").forEach((toggle) => {
      const nav = document.querySelector("[data-nav]");
      if (!nav) return;
      toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
      });
      document.addEventListener("click", (event) => {
        if (!nav.classList.contains("open")) return;
        if (nav.contains(event.target) || toggle.contains(event.target)) return;
        nav.classList.remove("open");
      });
    });
  }

  function setupFilterRoots() {
    document.querySelectorAll("[data-filter-root]").forEach((root) => {
      const input = root.querySelector("[data-filter-input]");
      const sort = root.querySelector("[data-sort]");
      const cards = Array.from(root.querySelectorAll("[data-card]"));
      const summary = root.querySelector("[data-filter-summary]");
      const empty = root.querySelector("[data-empty]");
      if (!cards.length) return;

      const apply = () => {
        const query = normalize(input ? input.value : "");
        const mode = sort ? sort.value : "featured";

        cards.forEach((card) => {
          const haystack = normalize(
            [
              card.dataset.title,
              card.dataset.region,
              card.dataset.genre,
              card.dataset.tags,
              card.dataset.type,
              card.dataset.year,
            ].join(" ")
          );
          const match = !query || haystack.includes(query);
          card.hidden = !match;
        });

        const visibleCards = cards.filter((card) => !card.hidden);
        const ordered = sortCards(visibleCards, mode);
        ordered.forEach((card) => card.parentElement.appendChild(card));

        if (summary) summary.textContent = `共 ${visibleCards.length} 条`;
        if (empty) empty.hidden = visibleCards.length !== 0;
      };

      if (input) input.addEventListener("input", apply);
      if (sort) sort.addEventListener("change", apply);

      apply();
    });
  }

  function setupPlayer() {
    document.querySelectorAll("[data-player]").forEach((shell) => {
      const video = shell.querySelector("video");
      const playBtn = shell.querySelector("[data-play-button]");
      if (!video) return;

      const mp4 = video.dataset.mp4 || "";
      const hls = video.dataset.hls || "";
      const poster = video.dataset.poster || "";

      if (poster) video.setAttribute("poster", poster);

      if (hls && window.Hls && window.Hls.isSupported()) {
        const hlsPlayer = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hlsPlayer.loadSource(hls);
        hlsPlayer.attachMedia(video);
      } else if (hls && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hls;
      } else if (mp4) {
        video.src = mp4;
      }

      const setPlaying = () => shell.classList.add("playing");
      const setPaused = () => shell.classList.remove("playing");

      if (playBtn) {
        playBtn.addEventListener("click", async () => {
          try {
            await video.play();
            setPlaying();
          } catch (err) {
            console.warn("Playback failed:", err);
          }
        });
      }

      video.addEventListener("play", setPlaying);
      video.addEventListener("pause", setPaused);
      video.addEventListener("ended", setPaused);
      video.addEventListener("click", () => {
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    });
  }

  function setupAnchors() {
    document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = document.querySelector(btn.getAttribute("data-scroll-to"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupMobileNav();
    setupFilterRoots();
    setupPlayer();
    setupAnchors();
  });
})();
