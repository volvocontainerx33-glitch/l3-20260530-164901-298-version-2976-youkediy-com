(function () {
    const form = document.querySelector('[data-search-form]');
    const input = document.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');
    const count = document.querySelector('[data-search-count]');
    const data = window.MOVIE_SEARCH_DATA || [];

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function render(items, label) {
        if (!results) {
            return;
        }

        results.innerHTML = items.map(function (movie) {
            const tagValues = [movie.region, movie.type, movie.year, movie.genre].filter(Boolean);
            const tags = tagValues.map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card">',
                '    <a class="poster" href="' + escapeHtml(movie.url) + '" style="--poster: url(\'' + escapeHtml(movie.cover) + '\');">',
                '        <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
                '        <span class="poster-play">▶</span>',
                '    </a>',
                '    <div class="card-body">',
                '        <div class="meta-row">',
                '            <span>' + escapeHtml(movie.year) + '</span>',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '        </div>',
                '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="tag-list">' + tags + '</div>',
                '    </div>',
                '</article>'
            ].join('\n');
        }).join('\n');

        if (count) {
            count.textContent = label;
        }
    }

    function runSearch(rawValue) {
        const value = rawValue.trim().toLowerCase();

        if (!value) {
            const latest = data.slice().sort(function (a, b) {
                return Number(b.year || 0) - Number(a.year || 0);
            }).slice(0, 60);
            render(latest, '默认展示最新 60 部影片');
            return;
        }

        const matched = data.filter(function (movie) {
            const haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' ').toLowerCase();

            return haystack.includes(value);
        });

        render(matched.slice(0, 200), '找到 ' + matched.length + ' 条结果，当前显示前 ' + Math.min(200, matched.length) + ' 条');
    }

    if (form && input) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';

        if (initialQuery) {
            input.value = initialQuery;
            runSearch(initialQuery);
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch(input.value || '');
        });

        input.addEventListener('input', function () {
            runSearch(input.value || '');
        });
    }
})();
