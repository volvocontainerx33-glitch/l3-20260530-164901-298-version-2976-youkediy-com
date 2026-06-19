(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");

        if (!root) {
            return;
        }

        var slides = selectAll("[data-hero-slide]", root);
        var dots = selectAll("[data-hero-dot]", root);
        var index = 0;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10));
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5000);
        }
    }

    function initFilters() {
        var roots = selectAll("[data-filter-root]");

        roots.forEach(function (root) {
            var input = root.querySelector("[data-filter-input]");
            var genre = root.querySelector("[data-filter-genre]");
            var year = root.querySelector("[data-filter-year]");
            var count = root.querySelector("[data-filter-count]");
            var section = root.closest("section") || document;
            var cards = selectAll("[data-card]", section);
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                var genreValue = normalize(genre ? genre.value : "");
                var yearValue = normalize(year ? year.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardGenre = normalize(card.getAttribute("data-genre"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }

                    if (genreValue && cardGenre !== genreValue) {
                        matched = false;
                    }

                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }

                    card.hidden = !matched;

                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible;
                }
            }

            [input, genre, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHero();
        initFilters();
    });
})();
