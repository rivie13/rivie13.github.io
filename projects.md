---
layout: default
title: Projects
permalink: /projects/
---

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h1 class="text-4xl font-bold mb-8 opacity-0" data-animate="fade-in">Projects</h1>
  
  <p class="text-lg mb-8 opacity-0" data-animate="fade-in">Here are some of the projects I've worked on recently. Most of these projects are available on <a href="https://github.com/rivie13" target="_blank" class="text-blue-600 hover:text-blue-800 underline">GitHub</a>.</p>
  
  <!-- Featured Projects -->
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-6 pb-2 border-b opacity-0" data-animate="fade-in">Featured Projects</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {% assign featured_projects = '' | split: '' %}
      {% for project in site.data.projects %}
        {% if project.name contains 'CodeGrind' or project.name contains 'Helios' %}
          {% assign featured_projects = featured_projects | push: project %}
        {% endif %}
      {% endfor %}
      {% for project in featured_projects %}
        <div class="h-full opacity-0" data-animate="fade-in" data-scroll="fade-up">
          {% include project-card.html project=project %}
        </div>
      {% endfor %}
    </div>
  </section>
  
  <!-- Project Demo Videos -->
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-6 pb-2 border-b opacity-0" data-animate="fade-in">Project Demo Videos</h2>
    
    <div class="mb-8">
      <h3 class="text-xl font-bold mb-4 opacity-0" data-animate="fade-in">CodeGrind Demos</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="opacity-0" data-animate="fade-in" data-scroll="fade-up">
          <h4 class="font-medium mb-2">Code Breach Demo Trailer</h4>
          {% include video-embed.html video_id="P8kmlbjYdI4" caption="A short trailer showcasing the CodeGrind platform" %}
        </div>
        <div class="opacity-0" data-animate="fade-in" data-scroll="fade-up">
          <h4 class="font-medium mb-2">Code Breach Demo Full Length</h4>
          {% include video-embed.html video_id="VZYFaoyLr_4" caption="Full walkthrough of the CodeGrind platform" %}
        </div>
      </div>
    </div>
    
    <div class="mb-8">
      <h3 class="text-xl font-bold mb-4 opacity-0" data-animate="fade-in">Helios Demos</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="opacity-0" data-animate="fade-in" data-scroll="fade-up">
          <h4 class="font-medium mb-2">Single Robot Fire Demo</h4>
          {% include video-embed.html video_id="a-3ocUuVebk" caption="Demonstration of a single robot responding to a fire scenario" %}
        </div>
        <div class="opacity-0" data-animate="fade-in" data-scroll="fade-up">
          <h4 class="font-medium mb-2">Multi Robot Fire Demo</h4>
          {% include video-embed.html video_id="SAaDaRRwqLo" caption="Swarm robotics approach to fire response" %}
        </div>
        <div class="opacity-0" data-animate="fade-in" data-scroll="fade-up">
          <h4 class="font-medium mb-2">Supply Run Demo</h4>
          {% include video-embed.html video_id="8w49PEwId00" caption="Robots performing supply delivery in disaster scenarios" %}
        </div>
      </div>
    </div>
  </section>
  
  <!-- All Projects -->
  <section>
    <h2 class="text-2xl font-bold mb-6 pb-2 border-b opacity-0" data-animate="fade-in">All Projects</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {% for project in site.data.projects %}
        <div class="h-full opacity-0" id="{{ project.name | slugify }}" data-animate="fade-in" data-scroll="fade-up">
          {% include project-card.html project=project %}
        </div>
      {% endfor %}
    </div>
    
    <!-- GitHub Projects -->
    <div id="additional-projects" class="mt-8 opacity-0" data-animate="fade-in" data-scroll="fade-up">
      <!-- Dynamic content will be loaded here by JavaScript -->
    </div>
  </section>
  
  <!-- Individual Project Details -->
  <section class="mt-16">
    {% for project in site.data.projects %}
      {% assign github_data_id = project.name | slugify %}
      {% if project.name contains "Helios" %}
        {% assign github_data_id = "helios-swarm-robotics" %}
      {% endif %}
      
      <div id="{{ project.name | slugify }}-details" class="hidden project-details my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg" data-scroll="fade-up">
        <h2 class="text-2xl font-bold mb-4">{{ project.name }}</h2>
        
        <div class="mb-6">
          <p class="text-gray-700 dark:text-gray-300 text-lg">{{ project.detailed_description }}</p>
        </div>
        
        {% if project.video_id %}
        <div class="mb-8">
          <h3 class="text-xl font-bold mb-4">Project Demo</h3>
          {% include video-embed.html video_id=project.video_id caption=project.name %}
        </div>
        {% endif %}
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div class="mb-6">
              <h3 class="text-xl font-bold mb-3">Challenges</h3>
              <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                {% for challenge in project.challenges %}
                  <li>{{ challenge }}</li>
                {% endfor %}
              </ul>
            </div>
            
            <div class="mb-6">
              <h3 class="text-xl font-bold mb-3">Our Solutions</h3>
              <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                {% for solution in project.solutions %}
                  <li>{{ solution }}</li>
                {% endfor %}
              </ul>
            </div>
            
            <div class="mb-6">
              <h3 class="text-xl font-bold mb-3">Key Features</h3>
              <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                {% for feature in project.features %}
                  <li>{{ feature }}</li>
                {% endfor %}
              </ul>
            </div>
            
            <div class="mb-6">
              <h3 class="text-xl font-bold mb-3">Technologies</h3>
              <div class="flex flex-wrap">
                {% for tech in project.technologies %}
                  <span class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2">{{ tech }}</span>
                {% endfor %}
              </div>
            </div>
          </div>
          
          <div>
            <div class="mb-6">
              <h3 class="text-xl font-bold mb-3">Achievements</h3>
              <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                {% for achievement in project.achievements %}
                  <li>{{ achievement }}</li>
                {% endfor %}
              </ul>
            </div>
            
            <div class="mb-6">
              <h3 class="text-xl font-bold mb-3">Lessons Learned</h3>
              <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                {% for lesson in project.lessons_learned %}
                  <li>{{ lesson }}</li>
                {% endfor %}
              </ul>
            </div>
            
            {% if project.future_plans %}
              <div class="mb-6">
                <h3 class="text-xl font-bold mb-3">Future Plans</h3>
                <p class="text-gray-700 dark:text-gray-300">{{ project.future_plans }}</p>
              </div>
            {% endif %}
            
            <div class="mb-6">
              <h3 class="text-xl font-bold mb-3">Timeline</h3>
              <p class="text-gray-700 dark:text-gray-300">{{ project.period }}</p>
            </div>
            
            <div class="mb-6">
              <h3 class="text-xl font-bold mb-3">GitHub Stats</h3>
              <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div class="github-stats-{{ github_data_id }} flex flex-wrap gap-3 mb-3">
                  <div class="inline-flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span>Loading repository data...</span>
                  </div>
                </div>
                
                <div class="github-topics-{{ github_data_id }} mb-3">
                  <!-- Topics will be populated by JavaScript -->
                </div>
                
                <div class="github-languages-{{ github_data_id }}">
                  <!-- Language data will be populated by JavaScript -->
                </div>
              </div>
            </div>
            
            <h3 class="text-xl font-bold mb-3">Links</h3>
            <div class="space-y-2">
              {% if project.url != "" %}
                <div>
                  <a href="{{ project.url }}" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800 transform hover:translate-x-2 transition-transform">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    Live Demo
                  </a>
                </div>
              {% endif %}
              
              {% if project.repo %}
                <div>
                  <a href="{{ project.repo }}" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800 transform hover:translate-x-2 transition-transform">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                    </svg>
                    GitHub Repository
                  </a>
                </div>
              {% endif %}
              
              {% if project.repo1 %}
                <div>
                  <a href="{{ project.repo1 }}" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800 transform hover:translate-x-2 transition-transform">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                    </svg>
                    {{ project.repo1_description }}
                  </a>
                </div>
              {% endif %}
              
              {% if project.repo2 %}
                <div>
                  <a href="{{ project.repo2 }}" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800 transform hover:translate-x-2 transition-transform">
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
          <button type="button" class="close-details inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors transform hover:scale-105" data-target="{{ project.name | slugify }}-details">
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

<script src="{{ '/assets/js/github-repos.js' | relative_url }}"></script>

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
    
    // Load GitHub API data for project detail cards
    document.querySelectorAll('.project-details').forEach(detailsSection => {
      // Get the project ID from the element ID
      const projectId = detailsSection.id.replace('-details', '');
      
      // Map some special cases
      let repoId = projectId;
      if (projectId === 'helios-swarm-robotics') {
        repoId = 'helios-swarm-robotics';
      } else if (projectId === 'bestnotes') {
        repoId = 'bestnotes';
      } else if (projectId === 'projectile-launcher-rework') {
        repoId = 'projectile-launcher-rework';
      } else if (projectId === 'book-player-application') {
        repoId = 'book-player-application';
      }
      
      // Find repository info
      let repoUrl = '';
      const repoLinks = detailsSection.querySelectorAll('a[href*="github.com"]');
      repoLinks.forEach(link => {
        if (link.textContent.includes('GitHub Repository') || link.textContent.includes('Repo 1')) {
          repoUrl = link.getAttribute('href');
        }
      });
      
      if (!repoUrl) return;
      
      // Extract owner and repo name from the URL
      const urlParts = repoUrl.split('/');
      const owner = urlParts[urlParts.length - 2];
      const repo = urlParts[urlParts.length - 1];
      
      // Fetch repository data
      const apiUrl = window.GitHubConfig.addClientId(`https://api.github.com/repos/${owner}/${repo}`);
      window.RequestQueue.add(apiUrl, (response, data) => {
        if (!response.ok) return;
        
        // Find the GitHub stats container
        const statsContainer = detailsSection.querySelector(`.github-stats-${repoId}`);
        const topicsContainer = detailsSection.querySelector(`.github-topics-${repoId}`);
        const languagesContainer = detailsSection.querySelector(`.github-languages-${repoId}`);
        
        if (statsContainer) {
          // Build stats HTML
          let statsHTML = '';
          
          // Show private/fork status
          if (data.private) {
            statsHTML += `<span class="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
              </svg>
              Private
            </span>`;
          }
          
          if (data.fork) {
            statsHTML += `<span class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
              </svg>
              Forked
            </span>`;
          }
          
          // Stars
          if (data.stargazers_count) {
            statsHTML += `<span class="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              ${data.stargazers_count} ${data.stargazers_count === 1 ? 'star' : 'stars'}
            </span>`;
          }
          
          // Forks
          if (data.forks_count) {
            statsHTML += `<span class="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
              </svg>
              ${data.forks_count} ${data.forks_count === 1 ? 'fork' : 'forks'}
            </span>`;
          }
          
          // Issues
          if (data.open_issues_count) {
            statsHTML += `<span class="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              ${data.open_issues_count} ${data.open_issues_count === 1 ? 'issue' : 'issues'}
            </span>`;
          }
          
          // Watchers
          if (data.watchers_count) {
            statsHTML += `<span class="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
              </svg>
              ${data.watchers_count} ${data.watchers_count === 1 ? 'watcher' : 'watchers'}
            </span>`;
          }
          
          // License
          if (data.license && data.license.name) {
            statsHTML += `<span class="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 100 12 6 6 0 000-12zm-1 5a1 1 0 112 0v3a1 1 0 11-2 0V9zm1-3a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"></path>
              </svg>
              ${data.license.name}
            </span>`;
          }
          
          // Updated date
          if (data.updated_at) {
            const updatedDate = new Date(data.updated_at);
            const formattedDate = updatedDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            
            statsHTML += `<span class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
              </svg>
              Updated: ${formattedDate}
            </span>`;
          }
          
          statsContainer.innerHTML = statsHTML || 'No GitHub stats available';
        }
        
        // Fetch and display topics
        if (topicsContainer && !data.private) {
          const topicsUrl = window.GitHubConfig.addClientId(`https://api.github.com/repos/${owner}/${repo}/topics`);
          window.RequestQueue.add(topicsUrl, (topicsResponse, topicsData) => {
            if (topicsResponse.ok && topicsData && topicsData.names && topicsData.names.length > 0) {
              let topicsHTML = '<h4 class="text-sm font-semibold mb-2">Topics</h4><div class="flex flex-wrap">';
              
              topicsData.names.forEach(topic => {
                topicsHTML += `<span class="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">${topic}</span>`;
              });
              
              topicsHTML += '</div>';
              topicsContainer.innerHTML = topicsHTML;
            } else {
              topicsContainer.innerHTML = '';
            }
          });
        }
        
        // Fetch and display languages
        if (languagesContainer && !data.private) {
          const languagesUrl = window.GitHubConfig.addClientId(`https://api.github.com/repos/${owner}/${repo}/languages`);
          window.RequestQueue.add(languagesUrl, (langResponse, langData) => {
            if (langResponse.ok && Object.keys(langData).length > 0) {
              // Calculate total bytes
              const totalBytes = Object.values(langData).reduce((a, b) => a + b, 0);
              
              // Convert to percentages
              const languages = Object.entries(langData)
                .map(([name, bytes]) => ({
                  name,
                  percentage: Math.round((bytes / totalBytes) * 100)
                }))
                .sort((a, b) => b.percentage - a.percentage);
              
              // Create color map
              const colorMap = {
                "JavaScript": "bg-yellow-400",
                "TypeScript": "bg-blue-500",
                "Python": "bg-blue-600",
                "Java": "bg-orange-600",
                "C#": "bg-green-600",
                "C++": "bg-pink-600",
                "HTML": "bg-red-500",
                "CSS": "bg-purple-500",
                "Ruby": "bg-red-600",
                "Go": "bg-blue-300",
                "Swift": "bg-orange-500",
                "Kotlin": "bg-purple-600",
                "PHP": "bg-indigo-400",
                "C": "bg-gray-500",
                "Shell": "bg-green-400",
                "Rust": "bg-orange-800",
                "Batchfile": "bg-gray-600",
                "ASP.NET": "bg-blue-800",
                "Vue": "bg-green-500",
                "CMake": "bg-indigo-600",
                "Makefile": "bg-gray-600",
                "Lua": "bg-blue-400",
                "YAML": "bg-purple-300",
                "RedScript": "bg-red-700",
                "XML": "bg-orange-300"
              };
              
              // Create language HTML
              let langHTML = '<h4 class="text-sm font-semibold mb-2">Languages</h4>';
              langHTML += '<div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">';
              
              languages.forEach(lang => {
                const bgClass = colorMap[lang.name] || "bg-gray-400";
                langHTML += `<div class="${bgClass}" style="width: ${lang.percentage}%; height: 100%; float: left;" title="${lang.name}: ${lang.percentage}%"></div>`;
              });
              
              langHTML += '</div><div class="flex flex-wrap mt-1 text-xs">';
              
              languages.forEach(lang => {
                langHTML += `<span class="mr-2">${lang.name} (${lang.percentage}%)</span>`;
              });
              
              langHTML += '</div>';
              languagesContainer.innerHTML = langHTML;
            } else {
              languagesContainer.innerHTML = '';
            }
          });
        }
      });
    });
  });
</script>