(function () {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let index = 0;

        function showSlide(nextIndex) {
            index = nextIndex % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(nextIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }
    }

    const filterScopes = Array.from(document.querySelectorAll('[data-filter-scope]'));

    filterScopes.forEach(function (scope) {
        const input = scope.querySelector('[data-local-filter]');
        const list = document.querySelector('[data-filter-list]');

        if (!input || !list) {
            return;
        }

        const cards = Array.from(list.querySelectorAll('.movie-card'));

        input.addEventListener('input', function () {
            const value = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                const text = card.innerText.toLowerCase();
                card.style.display = text.includes(value) ? '' : 'none';
            });
        });
    });
})();
