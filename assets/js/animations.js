// Animation utilities for the portfolio site

document.addEventListener('DOMContentLoaded', () => {
  // Ensure elements are hidden before animations start
  document.body.classList.add('animations-ready');
  
  // Initialize animations after a very short delay to ensure CSS is applied
  setTimeout(() => {
    initFadeInElements();
    initHoverEffects();
    initScrollAnimations();
  }, 10);
});

// Fade in elements with data-animate="fade-in" attribute on page load
function initFadeInElements() {
  const fadeElements = document.querySelectorAll('[data-animate="fade-in"]');
  
  fadeElements.forEach((element, index) => {
    // Add staggered delay based on index
    const delay = 100 + (index * 100);
    
    setTimeout(() => {
      element.style.opacity = '1';
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
  
  // Create a map to track which elements have been animated to prevent re-animation
  const animatedElementsMap = new WeakSet();
  
  // Create an observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animatedElementsMap.has(entry.target)) {
        const element = entry.target;
        const animation = element.getAttribute('data-scroll');
        const delay = element.getAttribute('data-delay') || 0;
        
        // Mark this element as being animated to prevent re-animation
        animatedElementsMap.add(element);
        
        setTimeout(() => {
          // Only animate if the element hasn't already been animated by another system
          if (!element.style.opacity || element.style.opacity === '0') {
            // Add appropriate animation class based on data attribute
            if (animation === 'fade-up') {
              element.classList.add('animate-fade-up');
            } else if (animation === 'fade-in') {
              element.classList.add('animate-fade-in');
            } else if (animation === 'slide-in') {
              element.classList.add('animate-slide-in');
            }
            
            // Explicitly make the element visible when animation is triggered
            element.style.visibility = 'visible';
            element.style.opacity = '1';
          }
        }, parseInt(delay));
        
        // Once the animation is applied, stop observing this element
        observer.unobserve(element);
      }
    });
  }, {
    threshold: 0.1, // More lenient threshold for mobile devices
    rootMargin: '0px 0px -20px 0px' // Smaller margin for mobile compatibility
  });
  
  // Observe all scroll animation elements
  animatedElements.forEach(element => {
    observer.observe(element);
  });
} 