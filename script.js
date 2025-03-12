document.addEventListener("DOMContentLoaded", function () {
    const feedbackButtons = document.querySelectorAll(".feedback-buttons button");
    const audioPlayer = document.getElementById("audioPlayer");
    const seekBar = document.getElementById("seekBar");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const songTitleElement = document.getElementById("songTitle");

    // Play/Pause Toggle
    playPauseBtn?.addEventListener("click", function () {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.innerHTML = "❚❚";
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = "▶";
        }
    });

    // Update Seek Bar
    audioPlayer?.addEventListener("timeupdate", function () {
        seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
    });

    // Allow User to Seek
    seekBar?.addEventListener("input", function () {
        audioPlayer.currentTime = (seekBar.value / 100) * audioPlayer.duration;
    });

    // Reset Button When Song Ends
    audioPlayer?.addEventListener("ended", function () {
        playPauseBtn.innerHTML = "▶";
    });

    // Load Songs from JSON
    const urlParams = new URLSearchParams(window.location.search);
    const songIndex = urlParams.get("song");

    fetch("songs.json")
        .then(response => response.json())
        .then(data => {
            if (songIndex !== null && data[songIndex]) {
                const song = data[songIndex];

                // Ensure song title appears
                if (songTitleElement) {
                    songTitleElement.textContent = song.title;
                }

                // Set song source and attempt autoplay
                const filePath = `assets/${song.file}`;
                audioPlayer.src = filePath;
                audioPlayer.load();
                audioPlayer.play();
            }
        })
        .catch(error => console.error("Error loading songs:", error));
});
