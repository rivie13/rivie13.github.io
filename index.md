---
layout: default
title: Home
---

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Hero Section -->
  <section class="py-8 md:py-16">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-8 items-center">
      <div class="md:col-span-3 opacity-0 px-2 md:px-0" data-animate="fade-in">
        <h1 class="text-3xl md:text-5xl font-bold mb-3 md:mb-4">Riviera Sperduto</h1>
        <h2 class="text-lg md:text-2xl text-gray-600 mb-4 md:mb-6">Philadelphia-based Full Stack Developer | Cloud/Solutions Architect | AI Developer</h2>
        
        <div class="flex flex-col sm:flex-row mb-4 md:mb-6 items-center">
          <img src="{{ '/assets/images/your-image.jpg' | relative_url }}" alt="Riviera Sperduto" class="w-24 h-24 md:w-32 md:h-32 rounded-full mb-4 sm:mb-0 sm:mr-6 shadow-md border-2 border-blue-500" data-hover="scale">
          <p class="text-base md:text-lg text-center sm:text-left">I craft innovative solutions and leverage cutting-edge technologies to build exceptional digital experiences. With expertise in full-stack development, cloud architecture, and AI, I'm passionate about creating efficient, scalable, and user-friendly applications from my home in the City of Brotherly Love.</p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 md:gap-4">
          <a href="{{ '/projects/' | relative_url }}" class="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-lg transition-all transform hover:scale-105">
            View My Work
          </a>
          <a href="{{ '/contact/' | relative_url }}" class="w-full sm:w-auto text-center bg-transparent hover:bg-blue-50 text-blue-600 font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-lg border border-blue-600 transition-all transform hover:scale-105">
            Get In Touch
          </a>
        </div>
      </div>
      
      <div class="md:col-span-2 opacity-0 mt-6 md:mt-0" data-animate="fade-in" data-scroll="fade-up">
        <div class="bg-gradient-to-br from-blue-100 to-indigo-100 p-1 rounded-xl shadow-xl" data-hover="scale">
          <!-- Philly image -->
          <img src="{{ '/assets/images/frc-philly-1.gif' | relative_url }}" alt="Philadelphia Skyline" class="rounded-lg w-full">
        </div>
      </div>
    </div>
  </section>
  
  <!-- Featured Projects Section -->
  <section class="py-12 border-t">
    <h2 class="text-3xl font-bold mb-8 opacity-0" data-animate="fade-in">Featured Projects</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- CodeGrind Project -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg opacity-0" data-animate="fade-in" data-scroll="fade-up">
        <div class="h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
          <!-- Project image -->
          <img src="{{ '/assets/images/logo.png' | relative_url }}" alt="CodeGrind Logo" class="w-full h-full object-contain">
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold mb-2">CodeGrind</h3>
          <p class="mb-4">Gamified technical interview preparation platform with AI tutoring assistant.</p>
          <div class="flex justify-between items-center">
            <a href="{{ '/projects/#codegrind' | relative_url }}" class="text-blue-600 hover:text-blue-800 font-medium">
              Learn More →
            </a>
            <div class="flex space-x-2">
              <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">React</span>
              <span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">Node.js</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Helios Project -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg opacity-0" data-animate="fade-in" data-scroll="fade-up">
        <div class="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
          <!-- Project image -->
          <img src="{{ '/assets/images/Helios.png' | relative_url }}" alt="Helios Screenshot" class="w-full h-full object-cover">
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold mb-2">Helios (Capstone Project)</h3>
          <p class="mb-4">Swarm Robotics platform for disaster scenario simulations with Unity integration.</p>
          <div class="flex justify-between items-center">
            <a href="{{ '/projects/#helios' | relative_url }}" class="text-blue-600 hover:text-blue-800 font-medium">
              Learn More →
            </a>
            <div class="flex space-x-2">
              <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Python</span>
              <span class="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">Unity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-8 text-center opacity-0" data-animate="fade-in" data-scroll="fade-up">
      <a href="{{ '/projects/' | relative_url }}" class="inline-block text-blue-600 hover:text-blue-800 font-bold transform hover:translate-x-2 transition-transform">
        View All Projects →
      </a>
    </div>
  </section>
  
  <!-- Video Showcase Section -->
  <section class="py-12 border-t">
    <h2 class="text-3xl font-bold mb-8 opacity-0" data-animate="fade-in">Project Demos & Performances</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <!-- CodeGrind Video -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden opacity-0" data-animate="fade-in" data-scroll="fade-up">
        <div class="p-4 pb-0">
          <h3 class="text-lg font-bold">CodeGrind Demo</h3>
          <p class="text-gray-600 text-sm mb-4">Interactive coding platform with gamified learning experience</p>
        </div>
        {% include video-embed.html video_id="P8kmlbjYdI4" %}
      </div>
      
      <!-- Helios Video -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden opacity-0" data-animate="fade-in" data-scroll="fade-up">
        <div class="p-4 pb-0">
          <h3 class="text-lg font-bold">Helios: Single Robot Fire Demo</h3>
          <p class="text-gray-600 text-sm mb-4">Disaster response simulation with swarm robotics</p>
        </div>
        {% include video-embed.html video_id="a-3ocUuVebk" %}
      </div>
    </div>
    
    <!-- Music Performance Video -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Hermit Songs and Dichterliebe Recital Video -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden opacity-0" data-animate="fade-in" data-scroll="fade-up">
        <div class="p-4 pb-0">
          <h3 class="text-lg font-bold">Barber and Schuman: Hermit Songs and Dichterliebe Recital</h3>
          <p class="text-gray-600 text-sm mb-4">Classical vocal performance as tenor soloist</p>
        </div>
        {% include video-embed.html video_id="ORs265LEYQY" %}
      </div>
      
      <!-- Music Career Overview -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden p-6 opacity-0" data-animate="fade-in" data-scroll="fade-up">
        <h3 class="text-lg font-bold mb-3">Multi-Disciplinary Background</h3>
        <p class="text-gray-700 mb-4">Beyond technology, I bring a diverse set of experiences that enhance my creative problem-solving abilities:</p>
        <ul class="space-y-2 text-gray-700 mb-4">
          <li class="flex items-start">
            <svg class="w-5 h-5 mr-2 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <span class="font-medium">Semi-Professional Singer</span> - Tenor vocalist with performance experience in various concerts and productions
            </div>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 mr-2 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <span class="font-medium">Music Teacher</span> - Experience teaching music lessons to students of all ages and skill levels
            </div>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 mr-2 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <span class="font-medium">Former Small Business Owner</span> - Founded and operated "Philly Personal Shoppers"
            </div>
          </li>
        </ul>
        <a href="{{ '/about/' | relative_url }}" class="inline-block text-blue-600 hover:text-blue-800 font-medium transform hover:translate-x-2 transition-transform">Learn more about my background →</a>
      </div>
    </div>
  </section>
  
  <!-- Philadelphia Section -->
  <section class="py-12 border-t">
    <h2 class="text-3xl font-bold mb-8 opacity-0" data-animate="fade-in">Proudly Based in Philadelphia</h2>
    
    <div class="bg-white rounded-lg shadow-md p-6 overflow-hidden opacity-0" data-animate="fade-in" data-scroll="fade-up">
      <div class="flex flex-col md:flex-row gap-8 items-center">
        <div class="md:w-1/2">
          <img src="{{ '/assets/images/9864029d3d105423f29f6f1032bc6f45.gif' | relative_url }}" alt="Philadelphia Cityscape" class="rounded-lg w-full shadow-sm" data-hover="scale">
        </div>
        <div class="md:w-1/2">
          <h3 class="text-xl font-bold mb-4">Embracing the City of Brotherly Love</h3>
          <p class="text-gray-700 mb-4">Since moving to Philadelphia in 2017, I instantly fell in love with this vibrant city. The city's rich history of innovation and creativity inspires my approach to development and problem-solving.</p>
          <p class="text-gray-700">I'm proud to contribute to Philadelphia's growing tech community and enjoy collaborating with local businesses and organizations to create digital solutions that help our city thrive.</p>
        </div>
      </div>
    </div>
  </section>
  
  <!-- GitHub Activity Section -->
  <section class="py-12 border-t">
    <h2 class="text-3xl font-bold mb-8 opacity-0" data-animate="fade-in">Recent GitHub Activity</h2>
    
    <div id="github-activity-feed" class="bg-white rounded-lg shadow-md p-6 overflow-hidden opacity-0" data-animate="fade-in" data-scroll="fade-up">
      <div class="text-center">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">GitHub Activity Feed Coming Soon</h3>
        <p class="text-gray-600">This section will dynamically display my recent GitHub activities.</p>
      </div>
    </div>
  </section>
  
  <!-- GitHub Stats Section -->
  <section class="py-12 border-t">
    <h2 class="text-3xl font-bold mb-8 opacity-0" data-animate="fade-in">GitHub Stats</h2>
    
    <div id="github-stats" class="opacity-0" data-animate="fade-in" data-scroll="fade-up">
      <div class="text-center">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">GitHub Statistics Loading...</h3>
        <p class="text-gray-600">This section will show various statistics about my GitHub repositories and activity.</p>
      </div>
    </div>
    
    <!-- GitHub Contributions Chart -->
    <div id="github-contributions" class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 opacity-0" data-animate="fade-in" data-scroll="fade-up">
      <div class="text-center">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">GitHub Contribution Chart Loading...</h3>
        <p class="text-gray-600">This chart will show my GitHub contribution activity over the past year.</p>
      </div>
    </div>
  </section>
  
  <!-- Services Overview Section -->
  <section class="py-12 border-t">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold opacity-0" data-animate="fade-in">Services</h2>
      <a href="{{ '/services/' | relative_url }}" class="text-blue-600 hover:text-blue-800 font-medium transform hover:translate-x-2 transition-transform">
        View All Services →
      </a>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Full Stack Development -->
      <div class="bg-white rounded-lg shadow-md p-6 opacity-0" data-animate="fade-in" data-scroll="fade-up" data-hover="scale">
        <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">Full Stack Development</h3>
        <p class="text-gray-600">Comprehensive web and application development with both frontend and backend expertise.</p>
      </div>
      
      <!-- Cloud/Solutions Architecture -->
      <div class="bg-white rounded-lg shadow-md p-6 opacity-0" data-animate="fade-in" data-scroll="fade-up" data-hover="scale">
        <div class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">Cloud Architecture</h3>
        <p class="text-gray-600">Strategic cloud infrastructure design and implementation for optimal performance and cost efficiency.</p>
      </div>
      
      <!-- AI Development -->
      <div class="bg-white rounded-lg shadow-md p-6 opacity-0" data-animate="fade-in" data-scroll="fade-up" data-hover="scale">
        <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">AI Development</h3>
        <p class="text-gray-600">Custom AI and machine learning solutions to enhance applications and provide intelligent features.</p>
      </div>
    </div>
  </section>
  
  <!-- Call to Action -->
  <section class="py-12 border-t">
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 md:p-12 text-white text-center opacity-0" data-animate="fade-in" data-scroll="fade-up" data-hover="scale">
      <h2 class="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
      <p class="text-lg md:text-xl opacity-90 mb-8 max-w-3xl mx-auto">Let's collaborate to bring your ideas to life with tailored solutions that meet your specific needs.</p>
      <a href="{{ '/contact/' | relative_url }}" class="inline-block bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105">
        Get in Touch
      </a>
    </div>
  </section>
</div> 