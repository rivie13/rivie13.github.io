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
}); 