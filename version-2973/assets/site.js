
(function () {
  const ready = (fn) => {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  const normalize = (value) =>
    (value || "")
      .toString()
      .trim()
      .toLowerCase();

  const byId = (id) => document.getElementById(id);

  function initNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav-links]");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      const target = event.target;
      if (nav.contains(target) || toggle.contains(target)) return;
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-root]").forEach((root) => {
      const search = root.querySelector("[data-search-input]");
      const typeFilter = root.querySelector("[data-type-filter]");
      const yearFilter = root.querySelector("[data-year-filter]");
      const regionFilter = root.querySelector("[data-region-filter]");
      const cards = Array.from(root.querySelectorAll("[data-card]"));
      const counter = root.querySelector("[data-result-count]");
      const empty = root.querySelector("[data-empty]");

      if (!search && !typeFilter && !yearFilter && !regionFilter) return;

      const params = new URLSearchParams(window.location.search);
      if (search && params.get("q")) search.value = params.get("q");
      if (typeFilter && params.get("type")) typeFilter.value = params.get("type");
      if (yearFilter && params.get("year")) yearFilter.value = params.get("year");
      if (regionFilter && params.get("region")) regionFilter.value = params.get("region");

      const apply = () => {
        const query = normalize(search && search.value);
        const typeValue = normalize(typeFilter && typeFilter.value);
        const yearValue = normalize(yearFilter && yearFilter.value);
        const regionValue = normalize(regionFilter && regionFilter.value);

        let shown = 0;

        cards.forEach((card) => {
          const cardText = normalize(card.dataset.search);
          const cardType = normalize(card.dataset.type);
          const cardYear = normalize(card.dataset.year);
          const cardRegion = normalize(card.dataset.region);

          const ok =
            (!query || cardText.includes(query)) &&
            (!typeValue || typeValue === "all" || cardType.includes(typeValue)) &&
            (!yearValue || yearValue === "all" || cardYear === yearValue) &&
            (!regionValue || regionValue === "all" || cardRegion.includes(regionValue));

          card.classList.toggle("hidden", !ok);
          if (ok) shown += 1;
        });

        if (counter) counter.textContent = String(shown);
        if (empty) empty.classList.toggle("hidden", shown !== 0);
      };

      [search, typeFilter, yearFilter, regionFilter].forEach((el) => {
        if (!el) return;
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      });

      apply();
    });
  }

  function initPlayer() {
    document.querySelectorAll("[data-player]").forEach((shell) => {
      const video = shell.querySelector("video");
      const playBtn = shell.querySelector("[data-play]");
      if (!video || !playBtn) return;

      const m3u8 = video.dataset.m3u8 || "";
      const mp4 = video.dataset.mp4 || "";
      const sources = Array.from(video.querySelectorAll("source"));
      const hlsSource = sources.find((source) => /mpegurl|m3u8/i.test(source.type || source.src));
      const mp4Source = sources.find((source) => /mp4/i.test(source.type || source.src));

      const activate = (useM3U8) => {
        try {
          if (window.Hls && window.Hls.isSupported() && hlsSource) {
            const hls = new window.Hls();
            hls.loadSource(hlsSource.src);
            hls.attachMedia(video);
            shell._hls = hls;
            return;
          }
        } catch (err) {
          console.warn("HLS init failed", err);
        }

        if (useM3U8 && video.canPlayType("application/vnd.apple.mpegurl")) {
          if (m3u8) video.src = m3u8;
          return;
        }

        if (mp4) {
          video.src = mp4;
        } else if (mp4Source) {
          video.src = mp4Source.src;
        }
      };

      activate(Boolean(m3u8));

      const showState = () => shell.classList.add("is-playing");
      const hideState = () => shell.classList.remove("is-playing");

      playBtn.addEventListener("click", async () => {
        try {
          if (video.paused) {
            await video.play();
          } else {
            video.pause();
          }
        } catch (err) {
          console.warn(err);
        }
      });

      video.addEventListener("play", showState);
      video.addEventListener("playing", showState);
      video.addEventListener("pause", hideState);
      video.addEventListener("ended", hideState);

      shell.addEventListener("click", (event) => {
        const target = event.target;
        if (target && (target.closest && target.closest("button, a, input, select, textarea, label"))) return;
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    });
  }

  function initBackToTop() {
    const btn = byId("backToTop");
    if (!btn) return;
    const toggle = () => {
      const visible = window.scrollY > 500;
      btn.classList.toggle("hidden", !visible);
    };
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initYearNow() {
    document.querySelectorAll("[data-current-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  ready(() => {
    initNavigation();
    initFilters();
    initPlayer();
    initBackToTop();
    initYearNow();
  });
})();
