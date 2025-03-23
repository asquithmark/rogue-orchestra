document.addEventListener("DOMContentLoaded", function () {
    const audioPlayer = document.getElementById("audioPlayer");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const seekBar = document.getElementById("seekBar");
    const songTitle = document.getElementById("songTitle");
    const songDescription = document.getElementById("songDescription");
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

    const params = new URLSearchParams(window.location.search);
    let songIndex = parseInt(params.get("song")) || 0;

    // Format time in minutes:seconds
    function formatTime(seconds) {
        return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
    }

    function updateMediaSessionMetadata(song) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: 'The Rogue Orchestra',
                album: 'The Rogue Orchestra',
                artwork: [
                    { src: 'rogue-orchestra-icon.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => {
                audioPlayer.play();
                updatePlayPauseButton();
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                audioPlayer.pause();
                updatePlayPauseButton();
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                playPreviousSong();
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                playNextSong();
            });
        }
    }

    function loadAndPlaySong(song) {
        audioPlayer.src = song.src;
        songTitle.textContent = song.title;
        songDescription.textContent = song.description;
        updateMediaSessionMetadata(song);
        
        // Autoplay the song
        audioPlayer.play().catch(error => {
            console.log('Autoplay prevented:', error);
        });
        
        updatePlayPauseButton();
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

    playPauseBtn.addEventListener("click", function () {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });

    shuffleBtn.addEventListener("click", function() {
        isShuffleOn = !isShuffleOn;
        shuffleBtn.classList.toggle("active", isShuffleOn);
    });

    repeatBtn.addEventListener("click", function() {
        isRepeatOn = !isRepeatOn;
        repeatBtn.classList.toggle("active", isRepeatOn);
    });

    audioPlayer.addEventListener("timeupdate", function () {
        if (!isNaN(audioPlayer.duration)) {
            seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
            durationEl.textContent = formatTime(audioPlayer.duration);
        }
    });

    audioPlayer.addEventListener("ended", function() {
        if (isRepeatOn) {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            playNextSong();
        }
    });

    seekBar.addEventListener("input", function () {
        const time = (seekBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = time;
        currentTimeEl.textContent = formatTime(time);
    });

    prevSongBtn.addEventListener("click", () => {
        if (currentSongIndex > 0) {
            currentSongIndex--;
            loadAndPlaySong(songs[currentSongIndex]);
            updateNavigationButtons();
        }
    });

    nextSongBtn.addEventListener("click", () => {
        if (currentSongIndex < songs.length - 1) {
            currentSongIndex++;
            loadAndPlaySong(songs[currentSongIndex]);
            updateNavigationButtons();
        }
    });

    function playNextSong() {
        if (currentSongIndex < songs.length - 1) {
            currentSongIndex++;
        } else if (isShuffleOn) {
            currentSongIndex = Math.floor(Math.random() * songs.length);
        } else {
            currentSongIndex = 0;
        }
        loadAndPlaySong(songs[currentSongIndex]);
        updateNavigationButtons();
    }

    function playPreviousSong() {
        if (currentSongIndex > 0) {
            currentSongIndex--;
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
        prevSongBtn.disabled = currentSongIndex <= 0;
        nextSongBtn.disabled = currentSongIndex >= songs.length - 1;
    }
});
