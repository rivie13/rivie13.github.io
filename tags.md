---
layout: default
title: Tags
permalink: /tags/
---

<div class="max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold mb-6 opacity-0" data-animate="fade-in">Tags</h1>
  
  <div class="mb-8 opacity-0" data-animate="fade-in">
    <a href="{{ '/blog/' | relative_url }}" class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
      Back to blog
    </a>
  </div>
  
  <div class="bg-white rounded-lg shadow-md p-6 opacity-0" data-animate="fade-in" data-scroll="fade-up">
    <h2 class="text-xl font-bold mb-4">All Tags</h2>
    
    <div class="flex flex-wrap gap-3 mt-4">
      <a href="{{ '/tag/welcome' | relative_url }}" class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2 px-3 rounded-full transition-colors transform hover:scale-105">
        #welcome
      </a>
      <a href="{{ '/tag/portfolio' | relative_url }}" class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2 px-3 rounded-full transition-colors transform hover:scale-105">
        #portfolio
      </a>
      <a href="{{ '/tag/software-development' | relative_url }}" class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2 px-3 rounded-full transition-colors transform hover:scale-105">
        #software-development
      </a>
    </div>
  </div>
</div> 