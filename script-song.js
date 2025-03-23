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
                    { src: albumArt.src, sizes: '450x450', type: 'image/gif' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
            navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
            navigator.mediaSession.setActionHandler('previoustrack', () => navigateToSong(songIndex - 1));
            navigator.mediaSession.setActionHandler('nexttrack', () => navigateToSong(songIndex + 1));
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                audioPlayer.currentTime = details.seekTime;
            });
        }
    }

    fetch("songs.json")
        .then(response => response.json())
        .then(data => {
            songs = data;
            if (songs[songIndex]) {
                const song = songs[songIndex];
                songTitle.textContent = song.title;
                songDescription.textContent = song.description;
                audioPlayer.src = song.src;
                audioPlayer.load();

                // Set up media session metadata
                updateMediaSessionMetadata(song);

                // Auto-play song
                audioPlayer.play().then(() => {
                    playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                }).catch(error => {
                    console.log("Auto-play prevented:", error);
                    playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                });

                // Update button states
                prevSongBtn.disabled = songIndex <= 0;
                nextSongBtn.disabled = songIndex >= songs.length - 1;
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
        } else if (songIndex < songs.length - 1) {
            navigateToSong(songIndex + 1);
        }
    });

    seekBar.addEventListener("input", function () {
        const time = (seekBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = time;
        currentTimeEl.textContent = formatTime(time);
    });

    prevSongBtn.addEventListener("click", () => {
        if (songIndex > 0) navigateToSong(songIndex - 1);
    });

    nextSongBtn.addEventListener("click", () => {
        if (songIndex < songs.length - 1) navigateToSong(songIndex + 1);
    });

    function navigateToSong(newIndex) {
        if (isShuffleOn) {
            newIndex = Math.floor(Math.random() * songs.length);
        }
        if (newIndex >= 0 && newIndex < songs.length) {
            window.location.href = `song.html?song=${newIndex}`;
        }
    }
});
