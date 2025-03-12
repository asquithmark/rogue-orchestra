document.addEventListener("DOMContentLoaded", function () {
    const feedbackButtons = document.querySelectorAll(".feedback-buttons button");
    const audioPlayer = document.getElementById("audioPlayer");
    const seekBar = document.getElementById("seekBar");
    const playPauseBtn = document.getElementById("playPauseBtn");

    // Ensure Autoplay Works or Shows Correct Button State
    const attemptAutoplay = () => {
        audioPlayer.play().then(() => {
            playPauseBtn.innerHTML = "❚❚"; // Pause icon if playing
        }).catch(() => {
            playPauseBtn.innerHTML = "▶"; // Show Play button if autoplay is blocked
        });
    };

    attemptAutoplay(); // Try to autoplay on page load

    // Play/Pause Toggle
    playPauseBtn.addEventListener("click", function () {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.innerHTML = "❚❚";
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = "▶";
        }
    });

    // Update Seek Bar
    audioPlayer.addEventListener("timeupdate", function () {
        seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
    });

    // Allow User to Seek
    seekBar.addEventListener("input", function () {
        audioPlayer.currentTime = (seekBar.value / 100) * audioPlayer.duration;
    });

    // Reset Button When Song Ends
    audioPlayer.addEventListener("ended", function () {
        playPauseBtn.innerHTML = "▶";
    });

    // Feedback Button Click Event
    feedbackButtons.forEach(button => {
        button.addEventListener("click", function () {
            const type = this.dataset.type;
            const isSelected = this.classList.contains("selected");

            // If it's a thumbs up/down, allow only one
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

    // Load Songs from JSON
    const urlParams = new URLSearchParams(window.location.search);
    const songIndex = urlParams.get("song");

    fetch("songs.json")
        .then(response => response.json())
        .then(data => {
            if (songIndex !== null && data[songIndex]) {
                const song = data[songIndex];
                document.getElementById("songTitle").textContent = song.title;
                const filePath = `assets/${song.file}`;
                audioPlayer.src = filePath;
                audioPlayer.load();
                attemptAutoplay(); // Try autoplay again after setting the file
            } else if (!songIndex) {
                const trackListContainer = document.getElementById("trackList");
                if (trackListContainer) {
                    trackListContainer.innerHTML = "";
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
