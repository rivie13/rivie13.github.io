// Animation utilities for the portfolio site

document.addEventListener('DOMContentLoaded', () => {
  // Initialize animations
  initFadeInElements();
  initHoverEffects();
  initScrollAnimations();
});

// Fade in elements with data-animate="fade-in" attribute on page load
function initFadeInElements() {
  const fadeElements = document.querySelectorAll('[data-animate="fade-in"]');
  
  fadeElements.forEach((element, index) => {
    // Add staggered delay based on index
    const delay = 100 + (index * 100);
    
    setTimeout(() => {
      element.classList.add('opacity-100');
      element.classList.remove('opacity-0');
    }, delay);
  });
}

// Add hover effects to elements with data-hover attribute
function initHoverEffects() {
  const hoverElements = document.querySelectorAll('[data-hover]');
  
  hoverElements.forEach(element => {
    const hoverEffect = element.getAttribute('data-hover');
    
    element.addEventListener('mouseenter', () => {
      if (hoverEffect === 'scale') {
        element.classList.add('transform', 'scale-105');
      } else if (hoverEffect === 'glow') {
        element.classList.add('shadow-glow');
      } else if (hoverEffect === 'lift') {
        element.classList.add('transform', '-translate-y-1');
      }
    });
    
    element.addEventListener('mouseleave', () => {
      if (hoverEffect === 'scale') {
        element.classList.remove('transform', 'scale-105');
      } else if (hoverEffect === 'glow') {
        element.classList.remove('shadow-glow');
      } else if (hoverEffect === 'lift') {
        element.classList.remove('transform', '-translate-y-1');
      }
    });
  });
}

// Implement scroll-triggered animations
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-scroll]');
  
  // Create an observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animation = element.getAttribute('data-scroll');
        
        // Add appropriate animation class based on data attribute
        if (animation === 'fade-up') {
          element.classList.add('animate-fade-up');
        } else if (animation === 'fade-in') {
          element.classList.add('animate-fade-in');
        } else if (animation === 'slide-in') {
          element.classList.add('animate-slide-in');
        }
        
        // Once the animation is applied, stop observing this element
        observer.unobserve(element);
      }
    });
  }, {
    threshold: 0.1, // Trigger when at least 10% of the element is visible
    rootMargin: '0px 0px -100px 0px' // Offset from the viewport bottom
  });
  
  // Start observing each element
  animatedElements.forEach(element => {
    observer.observe(element);
  });
} 