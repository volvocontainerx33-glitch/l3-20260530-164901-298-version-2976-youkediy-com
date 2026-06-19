(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        restart();
    }

    var panel = document.querySelector("[data-filter-panel]");

    if (panel) {
        var search = panel.querySelector("[data-search-input]");
        var region = panel.querySelector("[data-region-filter]");
        var type = panel.querySelector("[data-type-filter]");
        var year = panel.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector("[data-empty-state]");

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.textContent
            ].join(" "));
        }

        function applyFilters() {
            var keyword = normalize(search && search.value);
            var selectedRegion = region ? region.value : "";
            var selectedType = type ? type.value : "";
            var selectedYear = year ? year.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var matched = true;
                if (keyword && cardText(card).indexOf(keyword) === -1) {
                    matched = false;
                }
                if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
                    matched = false;
                }
                if (selectedType && card.getAttribute("data-type") !== selectedType) {
                    matched = false;
                }
                if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
                    matched = false;
                }
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        [search, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    }
}());
