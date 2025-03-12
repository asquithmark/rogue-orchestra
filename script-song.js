document.addEventListener("DOMContentLoaded", function () {
    const audioPlayer = document.getElementById("audioPlayer");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const seekBar = document.getElementById("seekBar");
    const songTitle = document.getElementById("songTitle");
    const songDescription = document.getElementById("songDescription");
    const prevSongBtn = document.getElementById("prevSong");
    const nextSongBtn = document.getElementById("nextSong");
    const songNav = document.querySelector(".song-navigation");

    const params = new URLSearchParams(window.location.search);
    let songIndex = parseInt(params.get("song")) || 0;

    fetch("songs.json")
        .then(response => response.json())
        .then(songs => {
            if (songs[songIndex]) {
                songTitle.textContent = songs[songIndex].title;
                songDescription.textContent = songs[songIndex].description;
                audioPlayer.src = songs[songIndex].src;
                audioPlayer.load();

                // Auto-play song
                audioPlayer.addEventListener("canplaythrough", () => {
                    playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                });

                document.body.addEventListener("click", () => {
                    if (audioPlayer.paused) {
                        audioPlayer.play();
                        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                    }
                }, { once: true });

                // Handle button visibility and alignment
                prevSongBtn.style.display = songIndex > 0 ? "block" : "none";
                nextSongBtn.style.display = songIndex < songs.length - 1 ? "block" : "none";

                // **Fix alignment issue**: If only "Next" exists, align it to the right
                if (songIndex === 0) {
                    nextSongBtn.style.marginLeft = "auto"; // Push it to the right
                } else {
                    nextSongBtn.style.marginLeft = ""; // Reset if not first song
                }

                prevSongBtn.addEventListener("click", () => navigateToSong(songIndex - 1));
                nextSongBtn.addEventListener("click", () => navigateToSong(songIndex + 1));

                // Swipe gestures (Fixed Implementation)
                let startX = 0;
                document.addEventListener("touchstart", (event) => {
                    startX = event.touches[0].clientX;
                });

                document.addEventListener("touchend", (event) => {
                    let endX = event.changedTouches[0].clientX;
                    let diff = startX - endX;

                    if (diff > 50 && songIndex < songs.length - 1) {
                        navigateToSong(songIndex + 1); // Swipe left → Next Song
                    } else if (diff < -50 && songIndex > 0) {
                        navigateToSong(songIndex - 1); // Swipe right → Previous Song
                    }
                });
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

    function navigateToSong(newIndex) {
        window.location.href = `song.html?song=${newIndex}`;
    }
});
