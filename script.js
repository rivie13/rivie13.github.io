// Get all video elements
var videos = document.querySelectorAll("video");

// Add click event listeners to each video
videos.forEach(function(video) {
  video.addEventListener("click", function() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });
});