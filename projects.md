---
layout: default
title: Projects
permalink: /projects/
---

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h1 class="text-4xl font-bold mb-8">Projects</h1>
  
  <p class="text-lg mb-8">Here are some of the projects I've worked on recently. Most of these projects are available on <a href="https://github.com/rivie13" target="_blank" class="text-blue-600 hover:text-blue-800 underline">GitHub</a>.</p>
  
  <!-- Featured Projects -->
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-6 pb-2 border-b">Featured Projects</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {% assign featured_projects = site.data.projects | where_exp: "project", "project.name contains 'CodeGrind' or project.name contains 'Helios'" %}
      {% for project in featured_projects %}
        <div class="h-full">
          {% include project-card.html project=project %}
        </div>
      {% endfor %}
    </div>
  </section>
  
  <!-- All Projects -->
  <section>
    <h2 class="text-2xl font-bold mb-6 pb-2 border-b">All Projects</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {% for project in site.data.projects %}
        <div class="h-full" id="{{ project.name | slugify }}">
          {% include project-card.html project=project %}
        </div>
      {% endfor %}
    </div>
  </section>
  
  <!-- Individual Project Details -->
  <section class="mt-16">
    {% for project in site.data.projects %}
      {% assign github_data_id = project.name | slugify %}
      {% if project.name contains "Helios" %}
        {% assign github_data_id = "helios-swarm-robotics" %}
      {% endif %}
      
      <div id="{{ project.name | slugify }}-details" class="hidden project-details my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">{{ project.name }}</h2>
        
        <div class="mb-4">
          <p class="text-gray-700 dark:text-gray-300">{{ project.description }}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-2">Features</h3>
            <ul class="list-disc list-inside mb-4">
              {% for feature in project.features %}
                <li class="mb-1 text-gray-700 dark:text-gray-300">{{ feature }}</li>
              {% endfor %}
            </ul>
            
            <h3 class="text-xl font-bold mb-2">Technologies</h3>
            <div class="flex flex-wrap mb-4">
              {% for tech in project.technologies %}
                <span class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2">{{ tech }}</span>
              {% endfor %}
            </div>
            
            <div class="mb-4">
              <h3 class="text-xl font-bold mb-2">Timeline</h3>
              <p class="text-gray-700 dark:text-gray-300">{{ project.period }}</p>
            </div>
            
            {% if project.future_plans %}
              <div class="mb-4">
                <h3 class="text-xl font-bold mb-2">Future Plans</h3>
                <p class="text-gray-700 dark:text-gray-300">{{ project.future_plans }}</p>
              </div>
            {% endif %}
          </div>
          
          <div>
            <h3 class="text-xl font-bold mb-2">Links</h3>
            <div class="space-y-2">
              {% if project.url != "" %}
                <div>
                  <a href="{{ project.url }}" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    Live Demo
                  </a>
                </div>
              {% endif %}
              
              {% if project.repo %}
                <div>
                  <a href="{{ project.repo }}" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                    </svg>
                    GitHub Repository
                  </a>
                </div>
              {% endif %}
              
              {% if project.repo1 %}
                <div>
                  <a href="{{ project.repo1 }}" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                    </svg>
                    {{ project.repo1_description }}
                  </a>
                </div>
              {% endif %}
              
              {% if project.repo2 %}
                <div>
                  <a href="{{ project.repo2 }}" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                    </svg>
                    {{ project.repo2_description }}
                  </a>
                </div>
              {% endif %}
              
              {% if project.downloads %}
                <div>
                  <span class="inline-flex items-center text-gray-700">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                    {{ project.downloads }} downloads
                  </span>
                </div>
              {% endif %}
            </div>
            
            <div class="mt-4">
              <span class="text-sm text-gray-500" data-github-last-updated="{{ github_data_id }}">
                Checking for updates...
              </span>
            </div>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <button type="button" class="close-details inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors" data-target="{{ project.name | slugify }}-details">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Close
          </button>
        </div>
      </div>
    {% endfor %}
  </section>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Project details toggle
    document.querySelectorAll('.project-card-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-target');
        const detailsElement = document.getElementById(targetId);
        
        // Hide all other details sections
        document.querySelectorAll('.project-details').forEach(element => {
          element.classList.add('hidden');
        });
        
        // Show the selected details section
        detailsElement.classList.remove('hidden');
        
        // Scroll to the details section
        detailsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    
    // Close buttons for details sections
    document.querySelectorAll('.close-details').forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const detailsElement = document.getElementById(targetId);
        detailsElement.classList.add('hidden');
      });
    });
  });
</script> 