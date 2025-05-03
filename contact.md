---
layout: default
title: Contact
permalink: /contact/
---

<div class="max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold mb-6">Contact Me</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
    <div>
      <p class="mb-6">I'm interested in freelance opportunities, contract roles, and full-time positions. If you have any questions or would like to discuss a project, please don't hesitate to get in touch.</p>
      
      <div class="mb-6">
        <h2 class="text-xl font-bold mb-4">Contact Information</h2>
        <ul class="space-y-3">
          <li class="flex items-center">
            <svg class="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            <span>267-340-6316</span>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <a href="mailto:{{ site.email }}" class="hover:text-blue-600">{{ site.email }}</a>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
            <a href="https://github.com/{{ site.github_username }}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600">github.com/{{ site.github_username }}</a>
          </li>
        </ul>
      </div>
    </div>
    
    <div>
      <form action="YOUR_FORMSPREE_URL" method="POST" class="bg-white rounded-lg shadow-md p-6">
        <div class="mb-4">
          <label for="name" class="block text-gray-700 font-medium mb-2">Name</label>
          <input type="text" name="name" id="name" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="mb-4">
          <label for="email" class="block text-gray-700 font-medium mb-2">Email</label>
          <input type="email" name="email" id="email" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="mb-4">
          <label for="subject" class="block text-gray-700 font-medium mb-2">Subject</label>
          <input type="text" name="subject" id="subject" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="mb-6">
          <label for="message" class="block text-gray-700 font-medium mb-2">Message</label>
          <textarea name="message" id="message" rows="5" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>
        
        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all">
          Send Message
        </button>
      </form>
    </div>
  </div>
  
  <div class="bg-gray-50 p-6 rounded-lg">
    <h2 class="text-xl font-bold mb-4">Response Time</h2>
    <p>I typically respond to inquiries within 24-48 hours. For urgent matters, please indicate this in your message subject.</p>
  </div>
</div> 