(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  var headerSearch = document.querySelector('.header-search');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      if (headerSearch) {
        headerSearch.classList.toggle('is-open');
      }
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
      });
    });

    window.setInterval(function () {
      showHero(current + 1);
    }, 5200);
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  var filterList = document.querySelector('[data-filter-list]');
  if (filterRoot && filterList) {
    var input = filterRoot.querySelector('[data-filter-input]');
    var typeSelect = filterRoot.querySelector('[data-filter-type]');
    var sortSelect = filterRoot.querySelector('[data-sort-select]');
    var items = Array.prototype.slice.call(filterList.children);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function textOf(item) {
      return (item.textContent || '').toLowerCase();
    }

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var sorted = items.slice();

      if (sortSelect && sortSelect.value === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }

      if (sortSelect && sortSelect.value === 'year-asc') {
        sorted.sort(function (a, b) {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        });
      }

      if (sortSelect && sortSelect.value === 'title') {
        sorted.sort(function (a, b) {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-CN');
        });
      }

      sorted.forEach(function (item) {
        filterList.appendChild(item);
      });

      items.forEach(function (item) {
        var matchesKeyword = !keyword || textOf(item).indexOf(keyword) !== -1;
        var matchesType = !type || String(item.dataset.type || '').indexOf(type) !== -1;
        item.classList.toggle('hidden-by-filter', !(matchesKeyword && matchesType));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilters);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', applyFilters);
    }
    applyFilters();
  }

  var playerBox = document.querySelector('[data-player-box]');
  var playButton = document.querySelector('[data-play-button]');
  var video = document.querySelector('#video-player');

  if (playerBox && playButton && video) {
    var source = video.getAttribute('data-src');
    var prepared = false;

    function prepareVideo() {
      if (prepared || !source) {
        return;
      }
      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    playButton.addEventListener('click', function () {
      prepareVideo();
      var promise = video.play();
      playerBox.classList.add('is-playing');
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          playerBox.classList.remove('is-playing');
        });
      }
    });

    video.addEventListener('play', function () {
      playerBox.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        playerBox.classList.remove('is-playing');
      }
    });
  }
})();
