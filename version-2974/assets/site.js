(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  document.querySelectorAll('.js-header-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = 'library.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  document.querySelectorAll('.js-hero').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var current = 0;

    if (slides.length < 2) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 6200);
  });

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function applyFilters(area) {
    var root = area.closest('section') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var textInput = area.querySelector('.js-filter-input');
    var yearSelect = area.querySelector('.js-year-filter');
    var typeSelect = area.querySelector('.js-type-filter');
    var categorySelect = area.querySelector('.js-category-filter');
    var text = normalize(textInput && textInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var type = normalize(typeSelect && typeSelect.value);
    var category = normalize(categorySelect && categorySelect.value);

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var ok = true;

      if (text && haystack.indexOf(text) === -1) {
        ok = false;
      }
      if (year && normalize(card.getAttribute('data-year')) !== year) {
        ok = false;
      }
      if (type && normalize(card.getAttribute('data-type')) !== type) {
        ok = false;
      }
      if (category && normalize(card.getAttribute('data-category')) !== category) {
        ok = false;
      }

      card.style.display = ok ? '' : 'none';
    });
  }

  document.querySelectorAll('.js-filter-area').forEach(function (area) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    var input = area.querySelector('.js-filter-input');

    if (query && input) {
      input.value = query;
    }

    area.querySelectorAll('input, select').forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(area);
      });
      control.addEventListener('change', function () {
        applyFilters(area);
      });
    });

    applyFilters(area);
  });

  document.querySelectorAll('.js-player').forEach(function (player) {
    var video = player.querySelector('video');
    var source = video ? video.querySelector('source') : null;
    var overlay = player.querySelector('.player-overlay');
    var src = source ? source.getAttribute('src') : '';

    if (!video || !overlay || !src) {
      return;
    }

    function attachMedia() {
      if (video.dataset.ready === 'yes') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        video.dataset.ready = 'yes';
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.dataset.ready = 'yes';
      } else {
        video.src = src;
        video.dataset.ready = 'yes';
      }
    }

    function play() {
      attachMedia();
      overlay.classList.add('hidden');
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  });
})();
