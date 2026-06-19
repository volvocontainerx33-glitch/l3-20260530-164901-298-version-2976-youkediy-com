const heroState = {
  index: 0,
  timer: null
};

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function initMobileMenu() {
  const button = document.querySelector(".mobile-menu-button");
  const menu = document.querySelector("#mobile-menu");

  if (!button || !menu) {
    return;
  }

  button.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.textContent = isOpen ? "×" : "☰";
  });
}

function setHeroSlide(index) {
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));

  if (!slides.length) {
    return;
  }

  heroState.index = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === heroState.index);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === heroState.index);
  });
}

function initHero() {
  const slides = document.querySelectorAll("[data-hero-slide]");

  if (!slides.length) {
    return;
  }

  document.querySelector("[data-hero-prev]")?.addEventListener("click", () => {
    setHeroSlide(heroState.index - 1);
  });

  document.querySelector("[data-hero-next]")?.addEventListener("click", () => {
    setHeroSlide(heroState.index + 1);
  });

  document.querySelectorAll("[data-hero-dot]").forEach((dot) => {
    dot.addEventListener("click", () => {
      setHeroSlide(Number(dot.dataset.heroDot || 0));
    });
  });

  heroState.timer = window.setInterval(() => {
    setHeroSlide(heroState.index + 1);
  }, 5000);
}

function initImageFallbacks() {
  document.querySelectorAll("img[data-fallback-image]").forEach((image) => {
    image.addEventListener("error", () => {
      const frame = image.closest(".poster-frame") || image.closest(".hero-slide") || image.closest(".detail-backdrop");

      if (frame) {
        frame.classList.add("is-missing", "image-missing");
      }

      image.remove();
    }, { once: true });
  });
}

function initListFilters() {
  document.querySelectorAll("[data-filter-panel]").forEach((panel) => {
    const section = panel.closest("section") || document;
    const list = section.querySelector("[data-filter-list]");
    const keywordInput = panel.querySelector("[data-filter-keyword]");
    const yearSelect = panel.querySelector("[data-filter-year]");
    const typeSelect = panel.querySelector("[data-filter-type]");
    const countNode = panel.querySelector("[data-filter-count]");

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll(".movie-card, .ranking-card"));

    const applyFilter = () => {
      const keyword = normalizeText(keywordInput?.value);
      const year = normalizeText(yearSelect?.value);
      const type = normalizeText(typeSelect?.value);
      let visibleCount = 0;

      cards.forEach((card) => {
        const searchable = normalizeText([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(" "));
        const matchesKeyword = !keyword || searchable.includes(keyword);
        const matchesYear = !year || normalizeText(card.dataset.year) === year;
        const matchesType = !type || normalizeText(card.dataset.type) === type;
        const isVisible = matchesKeyword && matchesYear && matchesType;

        card.classList.toggle("is-hidden", !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (countNode) {
        countNode.textContent = `${visibleCount} 部`;
      }
    };

    [keywordInput, yearSelect, typeSelect].forEach((control) => {
      control?.addEventListener("input", applyFilter);
      control?.addEventListener("change", applyFilter);
    });
  });
}

async function attachHlsSource(video, sourceUrl) {
  const canPlayNative = video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");

  if (canPlayNative) {
    video.src = sourceUrl;
    await video.play().catch(() => {});
    return;
  }

  try {
    const vendorUrl = new URL("hls-vendor-dru42stk.js", import.meta.url).href;
    const module = await import(vendorUrl);
    const Hls = module.H;

    if (Hls && Hls.isSupported()) {
      if (video.__hlsInstance) {
        video.__hlsInstance.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      video.__hlsInstance = hls;
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return;
    }
  } catch (error) {
    console.warn("HLS initialization failed, falling back to direct source.", error);
  }

  video.src = sourceUrl;
  await video.play().catch(() => {});
}

function initPlayers() {
  document.querySelectorAll("[data-play-button]").forEach((button) => {
    button.addEventListener("click", async () => {
      const playerId = button.dataset.playerId;
      const video = playerId ? document.getElementById(playerId) : button.closest(".video-shell")?.querySelector("video");

      if (!video) {
        return;
      }

      const sourceUrl = video.dataset.hlsSrc;

      if (!sourceUrl) {
        return;
      }

      button.classList.add("is-hidden");
      await attachHlsSource(video, sourceUrl);
    });
  });
}

function buildSearchCard(movie) {
  const tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
  const tagHtml = tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

  return `
<article class="movie-card" data-title="${escapeHtml(movie.title)}" data-year="${escapeHtml(movie.year)}" data-type="${escapeHtml(movie.type)}" data-tags="${escapeHtml((movie.tags || []).join(","))}" data-region="${escapeHtml(movie.region)}">
  <a class="movie-card__poster" href="${escapeHtml(movie.url)}" aria-label="观看 ${escapeHtml(movie.title)}">
    <span class="poster-frame">
      <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy" data-fallback-image>
      <span class="poster-fallback-title">${escapeHtml(movie.title)}</span>
    </span>
    <span class="movie-card__badge">${escapeHtml(movie.category)}</span>
  </a>
  <div class="movie-card__body">
    <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
    <p>${escapeHtml(movie.oneLine || "")}</p>
    <div class="movie-meta">
      <span>${escapeHtml(movie.year)}</span>
      <span>${escapeHtml(movie.region)}</span>
      <span>${escapeHtml(movie.type)}</span>
    </div>
    <div class="tag-list">${tagHtml}</div>
  </div>
</article>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initSearchPage() {
  const app = document.querySelector("[data-search-app]");

  if (!app || !window.MovieSearchData) {
    return;
  }

  const form = app.querySelector("[data-search-form]");
  const input = app.querySelector("[data-search-input]");
  const categorySelect = app.querySelector("[data-search-category]");
  const summary = app.querySelector("[data-search-summary]");
  const results = app.querySelector("[data-search-results]");
  const params = new URLSearchParams(window.location.search);

  input.value = params.get("q") || "";

  const runSearch = () => {
    const keyword = normalizeText(input.value);
    const category = normalizeText(categorySelect.value);

    if (!keyword && !category) {
      summary.textContent = "请输入关键词开始搜索。";
      results.innerHTML = "";
      return;
    }

    const matched = window.MovieSearchData.filter((movie) => {
      const haystack = normalizeText([
        movie.title,
        movie.oneLine,
        movie.summary,
        movie.region,
        movie.type,
        movie.year,
        movie.category,
        ...(movie.tags || [])
      ].join(" "));
      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesCategory = !category || normalizeText(movie.category) === category;
      return matchesKeyword && matchesCategory;
    });

    summary.textContent = `共找到 ${matched.length} 部影片`;
    results.innerHTML = matched.map(buildSearchCard).join("");
    initImageFallbacks();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("q", input.value.trim());
    window.history.replaceState({}, "", nextUrl);
    runSearch();
  });

  categorySelect.addEventListener("change", runSearch);
  runSearch();
}

ready(() => {
  initMobileMenu();
  initImageFallbacks();
  initHero();
  initListFilters();
  initPlayers();
  initSearchPage();
});
