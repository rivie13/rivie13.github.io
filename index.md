---
layout: default
title: Home
---

<div class="max-w-6xl mx-auto">
  <!-- Hero Section -->
  <section class="py-12 md:py-16">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
      <div class="md:col-span-3">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Riviera Sperduto</h1>
        <h2 class="text-xl md:text-2xl text-gray-600 mb-6">Full Stack Developer | Cloud/Solutions Architect | AI Developer</h2>
        
        <p class="text-lg mb-6">I craft innovative solutions and leverage cutting-edge technologies to build exceptional digital experiences. With expertise in full-stack development, cloud architecture, and AI, I'm passionate about creating efficient, scalable, and user-friendly applications.</p>
        
        <div class="flex flex-wrap gap-4">
          <a href="{{ '/projects/' | relative_url }}" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
            View My Work
          </a>
          <a href="{{ '/contact/' | relative_url }}" class="bg-transparent hover:bg-blue-50 text-blue-600 font-bold py-3 px-6 rounded-lg border border-blue-600 transition-all">
            Get In Touch
          </a>
        </div>
      </div>
      
      <div class="md:col-span-2">
        <div class="bg-gradient-to-br from-blue-100 to-indigo-100 p-1 rounded-xl shadow-xl">
          <!-- Placeholder for profile image -->
          <img src="{{ '/assets/images/placeholder-profile.jpg' | relative_url }}" alt="Riviera Sperduto" class="rounded-lg w-full">
        </div>
      </div>
    </div>
  </section>
  
  <!-- Featured Projects Section -->
  <section class="py-12 border-t">
    <h2 class="text-3xl font-bold mb-8">Featured Projects</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- CodeGrind Project -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
        <div class="h-48 bg-gray-200 flex items-center justify-center">
          <!-- Placeholder for project image -->
          <div class="text-gray-400 text-center">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
            <p>CodeGrind Screenshot</p>
          </div>
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
      <div class="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
        <div class="h-48 bg-gray-200 flex items-center justify-center">
          <!-- Placeholder for project image -->
          <div class="text-gray-400 text-center">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
            <p>Helios Screenshot</p>
          </div>
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
    
    <div class="mt-8 text-center">
      <a href="{{ '/projects/' | relative_url }}" class="inline-block text-blue-600 hover:text-blue-800 font-bold">
        View All Projects →
      </a>
    </div>
  </section>
  
  <!-- GitHub Activity Section -->
  <section class="py-12 border-t">
    <h2 class="text-3xl font-bold mb-8">Recent GitHub Activity</h2>
    
    <div class="bg-white rounded-lg shadow-md p-6">
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
  
  <!-- Services Overview Section -->
  <section class="py-12 border-t">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold">Services</h2>
      <a href="{{ '/services/' | relative_url }}" class="text-blue-600 hover:text-blue-800 font-medium">
        View All Services →
      </a>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Full Stack Development -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">Full Stack Development</h3>
        <p class="text-gray-600">Comprehensive web and application development with both frontend and backend expertise.</p>
      </div>
      
      <!-- Cloud/Solutions Architecture -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">Cloud Architecture</h3>
        <p class="text-gray-600">Strategic cloud infrastructure design and implementation for optimal performance and cost efficiency.</p>
      </div>
      
      <!-- AI Development -->
      <div class="bg-white rounded-lg shadow-md p-6">
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
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 md:p-12 text-white text-center">
      <h2 class="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
      <p class="text-lg md:text-xl opacity-90 mb-8 max-w-3xl mx-auto">Let's collaborate to bring your ideas to life with tailored solutions that meet your specific needs.</p>
      <a href="{{ '/contact/' | relative_url }}" class="inline-block bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition-all">
        Get in Touch
      </a>
    </div>
  </section>
</div> 