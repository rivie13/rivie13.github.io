/**
 * Main JavaScript file for the portfolio website
 */

// Toggle mobile menu
document.addEventListener('DOMContentLoaded', function() {
  console.log('Portfolio site loaded!');
  
  // Initialize any scripts or components here
  
  // Example: Add smooth scrolling to all links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if(targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if(targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Placeholder for GitHub activity fetcher
  // This will be implemented in Phase 2
  const githubActivitySection = document.querySelector('#github-activity');
  if(githubActivitySection) {
    console.log('GitHub activity section found - will be implemented in Phase 2');
  }
  
  // Mobile menu toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }
  
  // Dark mode toggle (if implemented)
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
      document.documentElement.classList.toggle('dark');
      
      // Save preference to localStorage
      if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('darkMode', 'true');
      } else {
        localStorage.setItem('darkMode', 'false');
      }
    });
    
    // Check for saved preference
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark');
    }
  }
});

// Load external scripts
function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = callback;
  document.head.appendChild(script);
}

// Load GitHub activity script
loadScript('/assets/js/github-activity.js'); 