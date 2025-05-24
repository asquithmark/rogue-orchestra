document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add('loaded');
    const audioPlayer = document.getElementById("audioPlayer");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const seekBar = document.getElementById("seekBar");
    // const volumeSlider = document.getElementById("volumeSlider"); // Removed
    const songTitle = document.getElementById("songTitle");
    const songDescription = document.getElementById("songDescription");
    const toggleDescription = document.getElementById("toggleDescription");
    const backLink = document.getElementById("backLink");
    const prevSongBtn = document.getElementById("prevSong");
    const nextSongBtn = document.getElementById("nextSong");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const repeatBtn = document.getElementById("repeatBtn");
    const currentTimeEl = document.getElementById("currentTime");
    const durationEl = document.getElementById("duration");
    const albumArt = document.getElementById("albumArt");

    let isShuffleOn = false;
    let isRepeatOn = false;
    let songs = [];
    let currentSongIndex = 0;
    let currentSongData; // To store the current song object

    const params = new URLSearchParams(window.location.search);
    let songIndex = parseInt(params.get("song")) || 0;

    function formatTime(seconds) {
        const roundedSeconds = Math.floor(seconds);
        return `${Math.floor(roundedSeconds / 60)}:${String(roundedSeconds % 60).padStart(2, '0')}`;
    }

    // Helper to update the visual seek bar and time displays
    function updateSeekBarUI() {
        if (isNaN(audioPlayer.duration)) return;

        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        const percent = (currentTime / duration) * 100;

        seekBar.value = percent;
        // Get the --color-interactive-strong from computed style of body
        const interactiveColor = getComputedStyle(document.body).getPropertyValue('--color-interactive-strong').trim() || '#FFFFFF';
        seekBar.style.background = `linear-gradient(to right, ${interactiveColor} ${percent}%, var(--color-surface-border) ${percent}%)`;
        currentTimeEl.textContent = formatTime(currentTime);
        if (durationEl.textContent !== formatTime(duration)) { // Only update if changed
             durationEl.textContent = formatTime(duration);
        }
    }

    function updateMediaSessionPositionState() {
        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
            if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
                try {
                    navigator.mediaSession.setPositionState({
                        duration: audioPlayer.duration,
                        playbackRate: audioPlayer.playbackRate,
                        position: audioPlayer.currentTime
                    });
                } catch (error) {
                    console.error('Error setting media session position state:', error);
                }
            }
        }
    }

    function updateMediaSessionMetadata(song) {
        currentSongData = song; // Store current song data
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: 'The Rogue Orchestra',
                album: 'The Rogue Orchestra Collection',
                artwork: [
                    { src: albumArt.src, sizes: '512x512', type: 'image/gif' } // Use current album art src
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => {
                audioPlayer.play();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                audioPlayer.pause();
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                playPreviousSong();
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                playNextSong();
            });

            /*
            try {
                navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                    const skipTime = details.seekOffset || 10;
                    audioPlayer.currentTime = Math.max(audioPlayer.currentTime - skipTime, 0);
                    updateSeekBarUI();
                    updateMediaSessionPositionState();
                });
            } catch (error) { console.error('Failed to set seekbackward handler', error); }

            try {
                navigator.mediaSession.setActionHandler('seekforward', (details) => {
                    const skipTime = details.seekOffset || 10;
                    audioPlayer.currentTime = Math.min(audioPlayer.currentTime + skipTime, audioPlayer.duration);
                    updateSeekBarUI();
                    updateMediaSessionPositionState();
                });
            } catch (error) { console.error('Failed to set seekforward handler', error); }
            */

            try {
                navigator.mediaSession.setActionHandler('seekto', (details) => {
                    if (details.fastSeek && audioPlayer.fastSeek) {
                        audioPlayer.fastSeek(details.seekTime);
                    } else {
                        audioPlayer.currentTime = details.seekTime;
                    }
                    updateSeekBarUI();
                    updateMediaSessionPositionState();
                });
            } catch (error) { console.error('Failed to set seekto handler', error); }
        }
    }

    function loadAndPlaySong(song) {
        audioPlayer.src = `assets/${song.audioFile}`;
        songTitle.textContent = song.title;
        songDescription.innerHTML = song.description;
        songDescription.classList.add('collapsed');
        toggleDescription.textContent = 'show more';
        
        audioPlayer.load(); // Ensure player loads new src
        audioPlayer.play().then(() => {
            updatePlayPauseButton();
            updateMediaSessionMetadata(song);
            updateMediaSessionPositionState(); // Initial position state
        }).catch(error => {
            console.log('Autoplay prevented:', error);
            updatePlayPauseButton(); // Still update button if autoplay fails
            updateMediaSessionMetadata(song); // And metadata
            updateMediaSessionPositionState();
        });
    }

    fetch("songs.json")
        .then(response => response.json())
        .then(data => {
            songs = data;
            if (songs[songIndex]) {
                currentSongIndex = songIndex;
                loadAndPlaySong(songs[currentSongIndex]);
                updateNavigationButtons();
            }
        })
        .catch(error => console.error("Error loading songs.json:", error));

    audioPlayer.addEventListener('loadedmetadata', () => {
        updateSeekBarUI(); // Initial setup of seek bar and duration
        updateMediaSessionPositionState();
    });

    audioPlayer.addEventListener('play', () => {
        updatePlayPauseButton();
        updateMediaSessionPositionState();
    });

    audioPlayer.addEventListener('pause', () => {
        updatePlayPauseButton();
        updateMediaSessionPositionState();
    });

    toggleDescription.addEventListener('click', () => {
        songDescription.classList.toggle('collapsed');
        toggleDescription.textContent = songDescription.classList.contains('collapsed') ? 'show more' : 'show less';
    });

    backLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('index.html');
    });

    playPauseBtn.addEventListener("click", function () {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    });

    shuffleBtn.addEventListener("click", function() {
        isShuffleOn = !isShuffleOn;
        shuffleBtn.classList.toggle("active", isShuffleOn);
        // No need to updateNavigationButtons here as it's based on currentSongIndex
    });

    repeatBtn.addEventListener("click", function() {
        isRepeatOn = !isRepeatOn;
        repeatBtn.classList.toggle("active", isRepeatOn);
        audioPlayer.loop = isRepeatOn; // Set audio player's loop property
    });

    audioPlayer.addEventListener("timeupdate", function () {
        updateSeekBarUI();
        updateMediaSessionPositionState(); // Keep session state updated
    });

    audioPlayer.addEventListener("ended", function() {
        if (isRepeatOn) {
            // Browser's native loop will handle it if audioPlayer.loop is true
            // If not using native loop, then: audioPlayer.currentTime = 0; audioPlayer.play();
        } else {
            playNextSong();
        }
    });

    seekBar.addEventListener("input", function () {
        if (!isNaN(audioPlayer.duration)) {
            const time = (seekBar.value / 100) * audioPlayer.duration;
            audioPlayer.currentTime = time;
            // updateSeekBarUI will be called by the 'timeupdate' event shortly after currentTime changes.
            // For immediate feedback while dragging:
            const percent = seekBar.value;
            const interactiveColor = getComputedStyle(document.body).getPropertyValue('--color-interactive-strong').trim() || '#FFFFFF';
            seekBar.style.background = `linear-gradient(to right, ${interactiveColor} ${percent}%, var(--color-surface-border) ${percent}%)`;
            currentTimeEl.textContent = formatTime(time);
        }
    });
    // Call setPositionState when user finishes seeking manually
    seekBar.addEventListener("change", function() {
        if (!isNaN(audioPlayer.duration)) {
            updateMediaSessionPositionState();
        }
    });

    // volumeSlider.addEventListener('input', () => { // Removed
    //     audioPlayer.volume = volumeSlider.value;
    // });

    // audioPlayer.volume = volumeSlider.value; // Initial volume set - Removed (browser default or hardware controls will manage)
    // Default volume is 1.0 (max). Users will use hardware controls.

    prevSongBtn.addEventListener("click", () => {
        playPreviousSong();
    });

    nextSongBtn.addEventListener("click", () => {
        playNextSong();
    });

    function playNextSong() {
        if (isShuffleOn) {
            let nextIndex = Math.floor(Math.random() * songs.length);
            if (songs.length > 1) {
                while (nextIndex === currentSongIndex) {
                    nextIndex = Math.floor(Math.random() * songs.length);
                }
            }
            currentSongIndex = nextIndex;
        } else if (currentSongIndex < songs.length - 1) {
            currentSongIndex++;
        } else {
            currentSongIndex = 0; // Loop to first song
        }
        if (songs[currentSongIndex]) {
            loadAndPlaySong(songs[currentSongIndex]);
            updateNavigationButtons();
        }
    }

    function playPreviousSong() {
        if (isShuffleOn) {
            // More complex shuffle previous logic could be implemented, for now, just pick another random one.
            let prevRandomIndex = Math.floor(Math.random() * songs.length);
            if (songs.length > 1) {
                while (prevRandomIndex === currentSongIndex) {
                    prevRandomIndex = Math.floor(Math.random() * songs.length);
                }
            }
            currentSongIndex = prevRandomIndex;
        } else if (currentSongIndex > 0) {
            currentSongIndex--;
        } else {
            currentSongIndex = songs.length - 1; // Loop to last song
        }
        if (songs[currentSongIndex]) {
            loadAndPlaySong(songs[currentSongIndex]);
            updateNavigationButtons();
        }
    }

    function updatePlayPauseButton() {
        if (audioPlayer.paused) {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        } else {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
    }

    function updateNavigationButtons() {
        // In non-shuffle mode, disable prev if at first song and not looping, next if at last and not looping.
        // For simplicity here, we'll allow looping via next/prev buttons.
        prevSongBtn.disabled = false; // songs.length === 0;
        nextSongBtn.disabled = false; // songs.length === 0;
    }

    function navigate(url) {
        document.body.classList.remove('loaded');
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }
});
