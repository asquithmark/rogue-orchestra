document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add('loaded');
    const trackListContainer = document.getElementById("trackList");

    fetch("songs.json")
        .then(response => response.json())
        .then(data => {
            trackListContainer.innerHTML = "";
            data.forEach((song, index) => {
                const trackButton = document.createElement("button");
                trackButton.classList.add("track-button");
                trackButton.innerHTML = `<span class="track-title">${song.title}</span>`;
                // Store the destination URL on the button itself or create an <a> tag
                // For simplicity with current structure, we'll build URL directly
                const destinationUrl = `song.html?song=${index}`;
                trackButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    navigate(destinationUrl);
                });
                trackListContainer.appendChild(trackButton);
            });
        })
        .catch(error => console.error("Error loading songs:", error));
});

function navigate(url) {
    document.body.classList.remove('loaded');
    setTimeout(() => {
        window.location.href = url;
    }, 300); // Ensure this matches CSS transition duration
}
