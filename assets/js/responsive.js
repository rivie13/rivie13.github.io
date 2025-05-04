// Responsive utilities for the portfolio site

document.addEventListener('DOMContentLoaded', () => {
  initResponsiveMenu();
  initResponsiveImageLoading();
  addResizeListeners();
  checkScreenSize();
});

// Mobile menu toggle functionality
function initResponsiveMenu() {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      document.body.classList.toggle('overflow-hidden');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target) && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });
  }
}

// Load appropriate image sizes based on screen width
function initResponsiveImageLoading() {
  const responsiveImages = document.querySelectorAll('[data-src-mobile]');
  
  responsiveImages.forEach(img => {
    const mobileSrc = img.getAttribute('data-src-mobile');
    const desktopSrc = img.getAttribute('data-src-desktop');
    
    if (mobileSrc && desktopSrc) {
      if (window.innerWidth < 768) {
        img.src = mobileSrc;
      } else {
        img.src = desktopSrc;
      }
    }
  });
}

// Add resize event listeners
function addResizeListeners() {
  let resizeTimer;
  
  window.addEventListener('resize', () => {
    // Throttle resize event
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      checkScreenSize();
      initResponsiveImageLoading();
    }, 250);
  });
}

// Make layout adjustments based on screen size
function checkScreenSize() {
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = window.innerWidth >= 1024;
  
  // Add appropriate classes to body for CSS targeting
  document.body.classList.toggle('is-mobile', isMobile);
  document.body.classList.toggle('is-tablet', isTablet);
  document.body.classList.toggle('is-desktop', isDesktop);
  
  // Adjust layout for different screen sizes
  const gridContainers = document.querySelectorAll('[data-responsive-grid]');
  gridContainers.forEach(container => {
    if (isMobile) {
      container.classList.remove('md:grid-cols-2', 'lg:grid-cols-3');
      container.classList.add('grid-cols-1');
    } else if (isTablet) {
      container.classList.remove('grid-cols-1', 'lg:grid-cols-3');
      container.classList.add('md:grid-cols-2');
    } else {
      container.classList.remove('grid-cols-1');
      container.classList.add('md:grid-cols-2', 'lg:grid-cols-3');
    }
  });
  
  // Simplify animations on mobile for better performance
  if (isMobile) {
    document.querySelectorAll('.animate-complex').forEach(el => {
      el.classList.remove('animate-complex');
      el.classList.add('animate-simple');
    });
  }
} 