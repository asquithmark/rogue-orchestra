document.addEventListener("DOMContentLoaded", function () {
    const trackListContainer = document.getElementById("trackList");

    fetch("songs.json")
        .then(response => response.json())
        .then(data => {
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
        })
        .catch(error => console.error("Error loading songs:", error));
});
