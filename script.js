document.addEventListener("DOMContentLoaded", function () {
    const feedbackButtons = document.querySelectorAll(".feedback-buttons button");

    feedbackButtons.forEach(button => {
        button.addEventListener("click", function () {
            const type = this.dataset.type; // Get the type of feedback
            const isSelected = this.classList.contains("selected");

            // If it's a thumbs up/down, ensure only one is selected at a time
            if (type === "thumb") {
                feedbackButtons.forEach(btn => {
                    if (btn.dataset.type === "thumb") {
                        btn.classList.remove("selected");
                    }
                });
            }

            // Toggle selection
            if (isSelected) {
                this.classList.remove("selected");
            } else {
                this.classList.add("selected");
            }
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const songIndex = urlParams.get("song");

    fetch("songs.json")
        .then(response => response.json())
        .then(data => {
            if (songIndex !== null && data[songIndex]) {
                // ✅ Load Song in Song Page
                const song = data[songIndex];
                document.getElementById("songTitle").textContent = song.title;
                const audioPlayer = document.getElementById("audioPlayer");
                const seekBar = document.getElementById("seekBar");
                const playPauseBtn = document.getElementById("playPauseBtn");

                const filePath = `assets/${song.file}`;
                console.log("Loading song file:", filePath); // Debugging

                audioPlayer.src = filePath;
                audioPlayer.load();
                audioPlayer.play().catch(error => console.log("Autoplay blocked:", error));
                playPauseBtn.innerHTML = "❚❚"; // Set to pause icon on autoplay

                // ✅ Play/Pause Button Logic
                playPauseBtn.addEventListener("click", function () {
                    if (audioPlayer.paused) {
                        audioPlayer.play();
                        playPauseBtn.innerHTML = "❚❚"; // Pause icon
                    } else {
                        audioPlayer.pause();
                        playPauseBtn.innerHTML = "▶"; // Play icon
                    }
                });

                // ✅ Update Seek Bar as Song Plays
                audioPlayer.addEventListener("timeupdate", function () {
                    seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
                });

                // ✅ Allow User to Seek
                seekBar.addEventListener("input", function () {
                    audioPlayer.currentTime = (seekBar.value / 100) * audioPlayer.duration;
                });

                // ✅ Reset Button When Song Ends
                audioPlayer.addEventListener("ended", function () {
                    playPauseBtn.innerHTML = "▶"; // Reset to play icon
                });
            } else if (!songIndex) {
                // ✅ Load Songs in Main Page
                const trackListContainer = document.getElementById("trackList");
                if (trackListContainer) {
                    trackListContainer.innerHTML = ""; // Clear before adding

                    data.slice(0, 7).forEach((song, index) => {
                        const trackButton = document.createElement("button");
                        trackButton.classList.add("track-button");
                        trackButton.innerHTML = `${index + 1}. ${song.title}`;
                        trackButton.onclick = function () {
                            window.location.href = `song.html?song=${index}`;
                        };
                        trackListContainer.appendChild(trackButton);
                    });
                }
            }
        })
        .catch(error => console.error("Error loading songs:", error));
});
