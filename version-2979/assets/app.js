
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function initMenu() {
    const header = qs('.site-header');
    const btn = qs('.mobile-toggle');
    if (!header || !btn) return;
    btn.addEventListener('click', function () {
      header.classList.toggle('open');
    });
  }

  function initCardLinks() {
    const search = new URLSearchParams(window.location.search);
    const q = (search.get('q') || '').trim();
    const input = qs('.search-input');
    if (input && q) input.value = q;
  }

  function movieScore(item) {
    const text = [item.title, item.region, item.type, item.genre, ...(item.tags || []), item.one_line || ''].join(' ');
    let score = 0;
    if (/(喜剧|搞笑|无厘头)/.test(text)) score += 15;
    if (/(动作|悬疑|犯罪|惊悚|谍战|卧底)/.test(text)) score += 14;
    if (/(爱情|治愈|家庭|青春|温情|校园|文艺|音乐)/.test(text)) score += 12;
    if (/(动画|动漫|TV动画)/.test(text)) score += 11;
    score += Math.max(0, 2026 - Number(item.year || 0));
    score += (item.tags || []).length * 0.4;
    return score;
  }

  function initSearchPage() {
    const box = qs('[data-search-page]');
    if (!box) return;
    const results = qs('[data-search-results]');
    const count = qs('[data-search-count]');
    const chips = qsa('[data-filter-chip]');
    const data = window.SEARCH_DATA || [];
    const search = new URLSearchParams(window.location.search);
    const initial = (search.get('q') || '').trim();
    const input = qs('.search-input');
    const button = qs('.search-button');
    const state = { genre: '全部', q: initial };
    if (input && initial) input.value = initial;

    function render(list) {
      if (!results) return;
      results.innerHTML = list.map(function (item) {
        return `
          <a class="movie-card ${item.tone}" href="/movie/${item.id}.html">
            <div class="card-poster">
              <div class="card-chip">${item.year}</div>
              <div class="card-badge">${item.region}</div>
              <div class="card-title">${item.title}</div>
              <div class="card-sub">${item.type} · ${item.genre}</div>
              <div class="card-meta">${(item.tags || []).slice(0, 3).join(' · ')}</div>
            </div>
            <div class="card-body"><p>${item.one_line || ''}</p></div>
          </a>`;
      }).join('');
      if (count) count.textContent = `共找到 ${list.length} 部影片`;
    }

    function apply() {
      let list = data.slice();
      const q = (input ? input.value : state.q).trim().toLowerCase();
      const active = chips.find(function (el) { return el.classList.contains('active'); });
      const genre = active ? active.textContent.trim() : '全部';
      if (q) {
        list = list.filter(function (item) {
          const hay = [item.title, item.region, item.type, item.genre, item.year, (item.tags || []).join(' '), item.one_line].join(' ').toLowerCase();
          return hay.indexOf(q) !== -1;
        });
      }
      if (genre !== '全部') {
        list = list.filter(function (item) {
          const hay = [item.genre, item.type, item.region, (item.tags || []).join(' ')].join(' ');
          return hay.indexOf(genre) !== -1;
        });
      }
      list.sort(function (a, b) { return movieScore(b) - movieScore(a) || String(a.title).localeCompare(String(b.title), 'zh'); });
      render(list.slice(0, 200));
    }

    if (button) button.addEventListener('click', function (e) { e.preventDefault(); apply(); });
    if (input) input.addEventListener('input', apply);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        apply();
      });
    });
    apply();
  }

  function initHomeSearchBox() {
    const hero = qs('.hero-search');
    if (!hero) return;
    const input = qs('input[name="q"]', hero);
    if (!input) return;
    const search = new URLSearchParams(window.location.search);
    if (search.get('q')) input.value = search.get('q');
  }

  function initPlayer() {
    qsa('[data-hls-video]').forEach(function (video) {
      const src = video.getAttribute('data-src');
      if (!src) return;
      const attach = function () { video.src = src; video.load(); };
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        attach();
        return;
      }
      const Hls = window.Hls;
      if (Hls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (evt, data) {
          if (data && data.fatal) {
            console.warn('HLS error', data.type, data.details);
          }
        });
        return;
      }
      attach();
    });
  }

  function initPageMarkers() {
    const page = document.body.getAttribute('data-page');
    if (!page) return;
    qsa('.desktop-nav a, .mobile-nav a').forEach(function (a) {
      if (a.getAttribute('href') && a.getAttribute('href').replace(/^[.]/, '') === window.location.pathname) {
        a.classList.add('active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initCardLinks();
    initSearchPage();
    initHomeSearchBox();
    initPlayer();
    initPageMarkers();
  });
})();
