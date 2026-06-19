(() => {
  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  ready(() => {
    setupHeader();
    setupMobileMenu();
    setupHeroSlider();
    setupCatalogFilter();
    setupPlayers();
    setupImageFallbacks();
  });

  function setupHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) {
      return;
    }

    const update = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 48);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function setupMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');
    const header = document.querySelector('[data-header]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.textContent = open ? '×' : '☰';
      document.body.classList.toggle('is-locked', open);
      if (header) {
        header.classList.toggle('is-open', open);
      }
    });
  }

  function setupHeroSlider() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }

    let current = 0;
    let timer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(current + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupCatalogFilter() {
    const grid = document.querySelector('[data-catalog-grid]');
    const input = document.querySelector('[data-catalog-input]');
    const form = document.querySelector('[data-catalog-form]');
    const state = document.querySelector('[data-filter-state]');

    if (!grid || !input) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    input.value = initialQuery;

    const apply = () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach((card) => {
        const haystack = card.getAttribute('data-search') || '';
        const matched = !query || haystack.includes(query);
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (state) {
        state.textContent = query ? `“${input.value.trim()}” 相关结果：${visible}` : '';
      }
    };

    input.addEventListener('input', apply);

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const url = new URL(window.location.href);
        const query = input.value.trim();
        if (query) {
          url.searchParams.set('q', query);
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState(null, '', url.toString());
        apply();
      });
    }

    apply();
  }

  function setupPlayers() {
    const players = Array.from(document.querySelectorAll('[data-player]'));
    players.forEach((shell) => {
      const video = shell.querySelector('video');
      const button = shell.querySelector('[data-play-button]');

      if (!video || !button) {
        return;
      }

      const start = () => {
        const source = video.getAttribute('data-stream');
        if (!source) {
          return;
        }

        button.classList.add('is-hidden');

        if (window.Hls && window.Hls.isSupported()) {
          if (!video._hlsInstance) {
            const hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) {
            video.src = source;
          }
        } else if (!video.src) {
          video.src = source;
        }

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            button.classList.remove('is-hidden');
          });
        }
      };

      button.addEventListener('click', start);
      shell.addEventListener('click', (event) => {
        if (event.target === video) {
          return;
        }
        start();
      });
    });
  }

  function setupImageFallbacks() {
    const images = Array.from(document.querySelectorAll('img[data-cover]'));
    images.forEach((image) => {
      image.addEventListener('error', () => {
        image.classList.add('is-missing');
        image.setAttribute('aria-hidden', 'true');
      }, { once: true });
    });
  }
})();
