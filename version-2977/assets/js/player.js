(function () {
    function initMoviePlayer(source) {
        var video = document.querySelector("[data-movie-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        var hlsInstance = null;
        var attached = false;

        if (!video || !overlay || !source) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                attached = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                attached = true;
                return;
            }

            video.src = source;
            attached = true;
        }

        function startPlayback() {
            attachSource();
            overlay.classList.add("is-hidden");
            video.controls = true;
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        overlay.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
