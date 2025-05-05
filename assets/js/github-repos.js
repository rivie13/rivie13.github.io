/**
 * GitHub Repository Fetcher
 * This script dynamically fetches and displays all repositories from GitHub
 */

// Create a request queue to prevent hitting secondary rate limits
window.RequestQueue = {
  queue: [],
  running: false,
  maxConcurrent: 1, // Reduce to 1 concurrent request
  activeRequests: 0,
  requestCounter: 0,
  
  // Initialize request counter from localStorage if it exists
  init: function() {
    const storedCounter = localStorage.getItem('github_api_request_counter');
    const counterTimestamp = localStorage.getItem('github_api_counter_timestamp');
    const now = Date.now();
    
    // Reset counter if it's been more than an hour
    if (!storedCounter || !counterTimestamp || (now - parseInt(counterTimestamp) > 3600000)) {
      this.requestCounter = 0;
      localStorage.setItem('github_api_request_counter', '0');
      localStorage.setItem('github_api_counter_timestamp', now.toString());
    } else {
      this.requestCounter = parseInt(storedCounter);
    }
    console.log(`GitHub API Request Counter: ${this.requestCounter}/5000`);
  },

  add: function(url, callback) {
    // First check cache
    const cacheKey = `github_cache_${url}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    const now = Date.now();
    const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
    
    // Use cache if available and not expired
    if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < cacheDuration)) {
      console.log(`Using cached data for: ${url}`);
      // Simulate async behavior to maintain expected flow
      setTimeout(() => {
        callback({ ok: true, status: 200, cached: true }, JSON.parse(cachedData));
      }, 0);
      return;
    }
    
    // Check rate limit - if over 4900 requests, only use cache
    if (this.requestCounter > 4900) {
      console.warn("GitHub API rate limit almost reached. Using fallback data only.");
      callback({ ok: false, status: 403, cached: false }, { message: "Rate limit proactively avoided" });
      return;
    }
    
    this.queue.push({ url, callback: (response, data) => {
      // Increment counter for actual API requests (not cached)
      if (!response.cached) {
        this.requestCounter++;
        localStorage.setItem('github_api_request_counter', this.requestCounter.toString());
      }
      
      // Cache successful responses
      if (response.ok) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
        } catch (e) {
          console.warn('Could not cache response data:', e);
        }
      }
      callback(response, data);
    }});
    this.process();
  },

  process: function() {
    if (this.running) return;
    this.running = true;
    this.processNext();
  },

  processNext: function() {
    if (this.queue.length === 0 || this.activeRequests >= this.maxConcurrent) {
      if (this.activeRequests === 0) {
        this.running = false;
      }
      return;
    }

    const { url, callback } = this.queue.shift();
    this.activeRequests++;

    // Debug log the URL
    console.log(`DEBUG - Fetching URL: ${url}`);
    console.log(`DEBUG - Client ID present in URL: ${url.includes('client_id=')}`);
    
    // Add a delay to avoid hitting secondary rate limits
    setTimeout(() => {
      fetch(url)
        .then(response => {
          console.log(`DEBUG - Response status for ${url}: ${response.status}`);
          console.log(`DEBUG - Rate limit remaining: ${response.headers.get('x-ratelimit-remaining')}`);
          console.log(`DEBUG - Rate limit limit: ${response.headers.get('x-ratelimit-limit')}`);
          
          return response.json().then(data => ({ response, data }));
        })
        .then(({ response, data }) => {
          this.activeRequests--;
          callback(response, data);
          
          // Add delay between requests
          setTimeout(() => {
            this.processNext();
          }, 1000); // 1 second delay between requests
        })
        .catch(error => {
          this.activeRequests--;
          callback({ ok: false, status: 500 }, { message: error.message });
          
          // Add delay between requests
          setTimeout(() => {
            this.processNext();
          }, 1000); // 1 second delay between requests
        });
    }, 1000); // Wait 1 second before starting the request
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Initialize request counter
  window.RequestQueue.init();
  
  const additionalProjectsContainer = document.getElementById('additional-projects');
  if (!additionalProjectsContainer) return;

  const username = window.GitHubConfig.username;
  const excludedRepos = [
    'rivie13.github.io',
    'codegrind',
    'robotics-nav2-slam-example',
    'helios',
    '01-bestnotes',
    'plr',
    'assignment-10-rivie13'
  ]; // Exclude both portfolio and manually defined projects
  
  // Use the centralized GitHub config
  fetchAdditionalRepos(username, excludedRepos);
  
  /**
   * Fetch additional repositories from GitHub
   */
  async function fetchAdditionalRepos(username, excludedRepos) {
    try {
      additionalProjectsContainer.innerHTML = `
        <div class="text-center py-6">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Loading all projects from GitHub...</p>
        </div>
      `;
      
      // Use the helper method to add client_id and queue the request
      const reposUrl = window.GitHubConfig.addClientId(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
      );
      
      // Use the request queue instead of direct fetch
      RequestQueue.add(reposUrl, async (response, repos) => {
        if (response.status === 403) {
          // Handle rate limiting specifically
          const rateLimitMessage = `
            <div class="bg-amber-100 border border-amber-400 text-amber-700 px-4 py-3 rounded text-center mb-4">
              <p class="font-bold">GitHub API rate limit exceeded</p>
              <p class="text-sm mt-1">Please try again later or check out my projects directly on GitHub.</p>
              <p class="text-sm mt-1"><a href="https://github.com/${username}" target="_blank" class="underline">Visit my GitHub Profile</a></p>
            </div>
          `;
          additionalProjectsContainer.innerHTML = rateLimitMessage;
          return;
        }
        
        if (!response.ok) {
          throw new Error(`GitHub API returned ${response.status}`);
        }
        
        // Filter out excluded repos and empty repos
        const validRepos = repos.filter(repo => 
          !excludedRepos.includes(repo.name.toLowerCase()) && 
          !repo.archived
        );
        
        if (validRepos.length === 0) {
          additionalProjectsContainer.innerHTML = `
            <p class="text-center text-gray-500 py-6">No additional projects found on GitHub.</p>
          `;
          return;
        }
        
        // Sort by most recently updated
        validRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        // Fetch language data for each repository - but limit to 5 repos max
        const reposToShow = validRepos.slice(0, 5); // Only process the first 5 repos to avoid rate limits
        const reposWithLanguages = [];
        
        for (const repo of reposToShow) {
          try {
            if (repo.languages_url && !repo.private) {
              // Add to queue instead of direct fetch
              const langUrl = window.GitHubConfig.addClientId(repo.languages_url);
              
              // Use Promise to allow async/await with our queue
              await new Promise(resolve => {
                RequestQueue.add(langUrl, (langResponse, langData) => {
                  if (langResponse.ok) {
                    // Calculate total bytes
                    const totalBytes = Object.values(langData).reduce((a, b) => a + b, 0);
                    // Convert to percentages
                    const languages = Object.entries(langData).map(([name, bytes]) => ({
                      name,
                      percentage: Math.round((bytes / totalBytes) * 100)
                    })).sort((a, b) => b.percentage - a.percentage);
                    
                    reposWithLanguages.push({ ...repo, languageData: languages });
                  } else {
                    reposWithLanguages.push(repo);
                  }
                  resolve();
                });
              });
            } else {
              reposWithLanguages.push(repo);
            }
          } catch (e) {
            console.warn(`Failed to fetch language data for ${repo.name}`, e);
            reposWithLanguages.push(repo);
          }
        }
        
        // Create HTML for the repositories
        const reposHTML = reposWithLanguages.map(repo => createRepoCard(repo)).join('');
        
        additionalProjectsContainer.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${reposHTML}
          </div>
        `;
        
        // Add GitHub profile stats section
        const totalRepos = repos.length;
        const publicRepos = repos.filter(r => !r.private).length;
        const privateRepos = totalRepos - publicRepos;
        
        const profileStatsHTML = `
          <div class="mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 class="text-xl font-bold mb-4">More on GitHub</h3>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              Check out my GitHub profile for more projects, contributions, and open source work.
            </p>
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div class="flex flex-col gap-2">
                <div>
                  <span class="font-medium">Total repositories:</span> ${totalRepos} (${privateRepos} private)
                </div>
                <div>
                  <span class="font-medium">Total stars:</span> ${repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
                </div>
                <div>
                  <span class="font-medium">Total forks:</span> ${repos.reduce((sum, repo) => sum + repo.forks_count, 0)}
                </div>
              </div>
              <a href="https://github.com/${username}" target="_blank" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                </svg>
                View GitHub Profile
              </a>
            </div>
          </div>
        `;
        
        additionalProjectsContainer.insertAdjacentHTML('beforeend', profileStatsHTML);
      });
      
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
      additionalProjectsContainer.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
          <p>Failed to load projects from GitHub.</p>
          <p class="text-sm mt-1">GitHub API rate limits may have been reached. Please try again later.</p>
        </div>
      `;
    }
  }
  
  /**
   * Create a repository card HTML
   */
  function createRepoCard(repo) {
    // Format description
    const description = repo.description || `A ${repo.language || ''} repository`;
    
    // Format date
    const updatedDate = new Date(repo.updated_at);
    const formattedDate = updatedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Generate language bar if we have language data
    let languageBar = '';
    if (repo.private) {
      languageBar = `
        <div class="mb-4">
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
          <div class="flex flex-wrap">
            <span class="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">Private repository - stats not available</span>
          </div>
        </div>
      `;
    } else if (repo.languageData && repo.languageData.length > 0) {
      const topLanguages = repo.languageData; // Show all languages
      
      languageBar = `
        <div class="mb-4">
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
          <div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            ${topLanguages.map(lang => {
              // Get color for language
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
                "Vue": "bg-green-500"
              };
              const bgClass = colorMap[lang.name] || "bg-gray-400";
              return `<div class="${bgClass}" style="width: ${lang.percentage}%; height: 100%; float: left;" title="${lang.name}: ${lang.percentage}%"></div>`;
            }).join('')}
          </div>
          <div class="flex flex-wrap mt-1 text-xs">
            ${topLanguages.map(lang => `<span class="mr-2">${lang.name} (${lang.percentage}%)</span>`).join('')}
          </div>
        </div>
      `;
    } else if (repo.language) {
      // Fallback if we don't have detailed language data
      languageBar = `
        <div class="mb-4">
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
          <div class="flex flex-wrap">
            <span class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">${repo.language} (100%)</span>
          </div>
        </div>
      `;
    } else {
      languageBar = `
        <div class="mb-4">
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
          <div class="flex flex-wrap">
            <span class="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">No language data available</span>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 h-full">
        <div class="p-6">
          <h3 class="text-xl font-bold mb-2 flex items-center">
            <svg class="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
            </svg>
            ${repo.name}
            ${repo.private ? `<span class="ml-2 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">Private</span>` : ''}
          </h3>
          
          <p class="text-gray-600 dark:text-gray-300 mb-4">${description}</p>
          
          ${languageBar}
          
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
            </svg>
            <span>Last updated: ${formattedDate}</span>
          </div>
          
          <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            ${repo.stargazers_count > 0 ? `
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span>${repo.stargazers_count} ${repo.stargazers_count === 1 ? 'star' : 'stars'}</span>
            </div>
            ` : ''}
            
            ${repo.forks_count > 0 ? `
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9.707 5.707a1 1 0 00-1.414-1.414L9 11.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l5-5z" clip-rule="evenodd"></path>
              </svg>
              <span>${repo.forks_count} ${repo.forks_count === 1 ? 'fork' : 'forks'}</span>
            </div>
            ` : ''}

            ${repo.watchers_count > 0 ? `
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
              </svg>
              <span>${repo.watchers_count} ${repo.watchers_count === 1 ? 'watcher' : 'watchers'}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="flex flex-wrap gap-2 mt-auto">
            <a href="${repo.html_url}" target="_blank" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
              </svg>
              View Repository
            </a>
            
            ${repo.homepage ? `
            <a href="${repo.homepage}" target="_blank" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              Live Demo
            </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
});