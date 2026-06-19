import { H as Hls } from './hls-dru42stk.js';

const video = document.querySelector('#movie-player');
const startButton = document.querySelector('[data-player-start]');
const videoBox = document.querySelector('.video-box');

function setPlayingState() {
    if (videoBox) {
        videoBox.classList.add('is-playing');
    }
}

function initializePlayer() {
    if (!video) {
        return;
    }

    const source = video.getAttribute('data-video-src');

    if (!source) {
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        window.__movieHls = hls;
    } else {
        video.src = source;
    }
}

initializePlayer();

if (startButton && video) {
    startButton.addEventListener('click', function () {
        setPlayingState();
        video.play().catch(function () {
            video.controls = true;
        });
    });
}

if (video) {
    video.addEventListener('play', setPlayingState);
}
