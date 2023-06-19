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

// Get the sort button
var sortButton = document.getElementById("sort-button");

// Get the videos or projects to sort
var videos = document.querySelectorAll(".video-container");
var projects = document.querySelectorAll(".project-info");

// Add click event listener to the sort button
sortButton.addEventListener("click", function() {
  // Check if sorting by title or year
  var sortByTitle = true; // Set to false for sorting by year

  if (sortByTitle) {
    // Sort by title alphabetically
    var sortedVideos = Array.from(videos).sort(function(a, b) {
      var titleA = a.querySelector("h2").textContent;
      var titleB = b.querySelector("h2").textContent;
      return titleA.localeCompare(titleB);
    });

    // Update the DOM with the sorted videos
    var container = document.querySelector(".container");
    sortedVideos.forEach(function(video) {
      container.appendChild(video);
    });
  } else {
    // Sort by year composed/published
    var sortedProjects = Array.from(projects).sort(function(a, b) {
      // Replace with your logic for sorting by year
      var yearA = parseInt(a.dataset.year);
      var yearB = parseInt(b.dataset.year);
      return yearA - yearB;
    });

    // Update the DOM with the sorted projects
    var container = document.querySelector(".container");
    sortedProjects.forEach(function(project) {
      container.appendChild(project.parentElement);
    });
  }
});