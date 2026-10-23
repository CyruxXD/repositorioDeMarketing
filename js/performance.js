(() => {
    const pendingCards = new Map();
    let pointerFrame = null;

    document.querySelectorAll('.svc-card, .pln-card, .card').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            pendingCards.set(card, { x: event.clientX, y: event.clientY });
            if (pointerFrame !== null) return;
            pointerFrame = requestAnimationFrame(() => {
                const updates = [...pendingCards].map(([element, position]) => ({
                    element,
                    position,
                    bounds: element.getBoundingClientRect()
                }));
                pendingCards.clear();
                pointerFrame = null;
                updates.forEach(({ element, position, bounds }) => {
                    element.style.setProperty('--mx', `${position.x - bounds.left}px`);
                    element.style.setProperty('--my', `${position.y - bounds.top}px`);
                });
            });
        }, { passive: true });
    });

    const videos = [...document.querySelectorAll('video')];
    if (!videos.length) return;

    const desktop = matchMedia('(min-width: 768px)');
    const nearby = new Set();
    const visible = new Set();
    const pendingPlayback = new WeakSet();
    const blockedPlayback = new Set();

    function updateVideo(video) {
        const breakpoint = video.dataset.breakpoint;
        const eligible = !breakpoint || (breakpoint === 'desktop') === desktop.matches;
        if (document.hidden || !eligible || !nearby.has(video)) {
            video.pause();
            return;
        }

        const source = video.querySelector('source[data-src]');
        if (source && !source.hasAttribute('src')) {
            video.preload = 'auto';
            source.src = source.dataset.src;
            video.load();
        }

        if (visible.has(video)) {
            if (!video.paused || pendingPlayback.has(video)) return;
            video.muted = true;
            pendingPlayback.add(video);
            Promise.resolve(video.play())
                .then(() => blockedPlayback.delete(video))
                .catch((error) => {
                    if (error.name === 'NotAllowedError') blockedPlayback.add(video);
                })
                .finally(() => pendingPlayback.delete(video));
        } else {
            video.pause();
        }
    }

    function updateVideos() {
        videos.forEach(updateVideo);
    }

    videos.forEach((video) => {
        video.defaultMuted = true;
        video.muted = true;
        video.playsInline = true;
        video.addEventListener('canplay', () => updateVideo(video));
    });

    if ('IntersectionObserver' in window) {
        const preloadObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) nearby.add(entry.target);
                else nearby.delete(entry.target);
                updateVideo(entry.target);
            });
        }, { rootMargin: '600px 0px' });
        const playbackObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) visible.add(entry.target);
                else visible.delete(entry.target);
                updateVideo(entry.target);
            });
        });
        videos.forEach((video) => {
            preloadObserver.observe(video);
            playbackObserver.observe(video);
        });
    } else {
        videos.forEach((video) => {
            nearby.add(video);
            visible.add(video);
        });
        updateVideos();
    }

    desktop.addEventListener('change', updateVideos);
    document.addEventListener('visibilitychange', updateVideos);
    window.addEventListener('pageshow', updateVideos);
    window.addEventListener('focus', updateVideos);

    function retryBlockedPlayback(event) {
        if (event.isTrusted) blockedPlayback.forEach(updateVideo);
    }

    document.addEventListener('pointerdown', retryBlockedPlayback, { capture: true, passive: true });
    document.addEventListener('keydown', retryBlockedPlayback, { capture: true });
})();
