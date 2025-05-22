document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add('loaded');
    const trackListContainer = document.getElementById("trackList");
    const introPopup = document.getElementById("introPopup");
    const continueToSongBtn = document.getElementById("continueToSongBtn");
    let pendingSongUrl = ''; // Variable to store the song URL

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
                    pendingSongUrl = destinationUrl; // Store the URL
                    introPopup.style.display = 'flex';
                    setTimeout(() => introPopup.classList.add('visible'), 10); // Trigger fade-in
                });
                trackListContainer.appendChild(trackButton);
            });
        })
        .catch(error => console.error("Error loading songs:", error));

    continueToSongBtn.addEventListener('click', function() {
        if (pendingSongUrl) {
            introPopup.classList.remove('visible');
            setTimeout(() => {
                introPopup.style.display = 'none';
                navigate(pendingSongUrl); // Navigate to the stored URL
            }, 300); // Match CSS transition
        }
    });

    // Optional: Close popup if clicking outside
    introPopup.addEventListener('click', function(event) {
        if (event.target === introPopup) {
            introPopup.classList.remove('visible');
            setTimeout(() => {
                introPopup.style.display = 'none';
                pendingSongUrl = ''; // Clear pending URL if popup is dismissed
            }, 300);
        }
    });
});

function navigate(url) {
    document.body.classList.remove('loaded');
    setTimeout(() => {
        window.location.href = url;
    }, 300); // Ensure this matches CSS transition duration
}
