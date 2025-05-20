document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add('loaded');
    const audioPlayer = document.getElementById("audioPlayer");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const seekBar = document.getElementById("seekBar");
    const volumeSlider = document.getElementById("volumeSlider");
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
                    { src: 'assets/album.gif', sizes: '512x512', type: 'image/gif' }
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
        audioPlayer.src = `assets/${song.audioFile}`;
        songTitle.textContent = song.title;
        songDescription.innerHTML = song.description;
        songDescription.classList.add('collapsed');
        toggleDescription.textContent = 'show more';
        updateMediaSessionMetadata(song);
        
        // Attempt to autoplay; may be prevented by the browser
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

    audioPlayer.addEventListener('loadedmetadata', () => {
        seekBar.style.background = 'linear-gradient(to right, #1DB954 0%, rgba(255,255,255,0.1) 0%)';
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
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });

    shuffleBtn.addEventListener("click", function() {
        isShuffleOn = !isShuffleOn;
        shuffleBtn.classList.toggle("active", isShuffleOn);
        updateNavigationButtons();
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
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            seekBar.style.background = `linear-gradient(to right, #1DB954 0%, #1DB954 ${percent}%, rgba(255,255,255,0.1) ${percent}%)`;
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
        const percent = seekBar.value;
        seekBar.style.background = `linear-gradient(to right, #1DB954 0%, #1DB954 ${percent}%, rgba(255,255,255,0.1) ${percent}%)`;
    });

    volumeSlider.addEventListener('input', () => {
        audioPlayer.volume = volumeSlider.value;
    });

    audioPlayer.volume = volumeSlider.value;

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
        nextSongBtn.disabled = !isShuffleOn && currentSongIndex >= songs.length - 1;
    }

    function navigate(url) {
        document.body.classList.remove('loaded');
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }
});
