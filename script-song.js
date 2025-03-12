document.addEventListener("DOMContentLoaded", function () {
    const audioPlayer = document.getElementById("audioPlayer");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const seekBar = document.getElementById("seekBar");
    const songDescription = document.getElementById("songDescription"); // New element for description

    const params = new URLSearchParams(window.location.search);
    const songIndex = params.get("song");

    fetch("songs.json")
        .then(response => response.json())
        .then(songs => {
            if (songs[songIndex]) {
                document.getElementById("songTitle").textContent = songs[songIndex].title;
                audioPlayer.src = songs[songIndex].src;
                songDescription.textContent = songs[songIndex].description; // Set description
                audioPlayer.load();

                // Ensure the player starts in a working state
                audioPlayer.addEventListener("canplaythrough", () => {
                    playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                });

                // Handle user-initiated playback
                document.body.addEventListener("click", () => {
                    if (audioPlayer.paused) {
                        audioPlayer.play();
                        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                    }
                }, { once: true });
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

    audioPlayer.addEventListener("timeupdate", function () {
        if (!isNaN(audioPlayer.duration)) {
            seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        }
    });

    seekBar.addEventListener("input", function () {
        audioPlayer.currentTime = (seekBar.value / 100) * audioPlayer.duration;
    });
});
