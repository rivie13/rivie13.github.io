/**
 * GitHub Repository Fetcher
 * This script dynamically fetches and displays all repositories from GitHub
 */

// Create a request queue to prevent hitting secondary rate limits
window.RequestQueue = {
  queue: [],
  running: false,
  maxConcurrent: 3, // Increased from 1 to 3 for better performance
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
    // Force refresh if URL includes force_refresh parameter
    const forceRefresh = window.location.search.includes('force_refresh');
    
    // First check cache (unless force refresh is enabled)
    if (!forceRefresh) {
      const cacheKey = `github_cache_${url}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      const now = Date.now();
      const cacheDuration = 60 * 60 * 1000; // Increase to 1 hour for better performance
      
      // Use cache if available and not expired
      if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < cacheDuration)) {
        console.log(`Using cached data for: ${url}`);
        // Simulate async behavior to maintain expected flow
        setTimeout(() => {
          callback({ ok: true, status: 200, cached: true }, JSON.parse(cachedData));
        }, 0);
        return;
      }
    } else {
      console.log(`Force refresh enabled, skipping cache for: ${url}`);
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
          const cacheKey = `github_cache_${url}`;
          const now = Date.now();
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
    
    // Add a delay to avoid hitting secondary rate limits
    setTimeout(() => {
      fetch(url)
        .then(response => {
          console.log(`DEBUG - Response status for ${url}: ${response.status}`);
          const rateLimit = {
            limit: response.headers.get('x-ratelimit-limit'),
            remaining: response.headers.get('x-ratelimit-remaining'),
            reset: response.headers.get('x-ratelimit-reset')
          };
          
          console.log(`DEBUG - Rate limit info:`, rateLimit);
          
          return response.json().then(data => ({ response, data }));
        })
        .then(({ response, data }) => {
          this.activeRequests--;
          callback(response, data);
          
          // Add delay between requests
          setTimeout(() => {
            this.processNext();
          }, 500); // Reduced from 1000ms to 500ms for faster loading
        })
        .catch(error => {
          console.error(`Error fetching ${url}:`, error);
          this.activeRequests--;
          callback({ ok: false, status: 500 }, { message: error.message });
          
          // Add delay between requests
          setTimeout(() => {
            this.processNext();
          }, 500); // Reduced from 1000ms to 500ms for faster loading
        });
    }, 500); // Reduced from 1000ms to 500ms for faster loading
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
    'Helios',
    '01-BestNotes',
    'Robotics-Nav2-SLAM-Example',
    'codegrind'
  ]; // Reduce excluded repos to show more
  
  // Define repositories per page globally
  const reposPerPage = 8; // Show 8 repos initially
  let currentPage = 1;
  
  // Define reposWithLanguages globally so it can be accessed by renderRepos
  let reposWithLanguages = [];

  // Use the centralized GitHub config
  fetchAdditionalRepos(username, excludedRepos);
  
  // Clean up any leftover global loading indicators after a reasonable time
  setTimeout(() => {
    const loadingMessage = document.querySelector('.animate-spin');
    if (loadingMessage) {
      const loadingContainer = loadingMessage.closest('div.text-center');
      if (loadingContainer) {
        loadingContainer.remove();
      }
    }
    
    // Also clean up any "Loading language data (x/y)" messages
    const loadingText = document.getElementById('loading-status');
    if (loadingText && loadingText.textContent.includes('Loading')) {
      loadingText.remove();
    }
    
    // Remove global loading message like "Loading language data (8/33)..."
    const allDivs = document.querySelectorAll('div');
    allDivs.forEach(div => {
      if (div.textContent.includes('Loading language data')) {
        div.remove();
      }
    });
  }, 5000); // Give it 5 seconds to load initial data
  
  /**
   * Fetch additional repositories from GitHub
   */
  async function fetchAdditionalRepos(username, excludedRepos) {
    try {
      additionalProjectsContainer.innerHTML = `
        <div class="text-center py-6">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600" id="loading-status">Starting to fetch GitHub repositories...</p>
          <div class="w-full max-w-md mx-auto mt-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700" id="loading-progress-bar">
            <div class="bg-blue-600 h-2.5 rounded-full" style="width: 5%" id="loading-progress-indicator"></div>
          </div>
        </div>
      `;
      
      // Convert excluded repos to lowercase for case-insensitive comparison
      const excludedReposLower = excludedRepos.map(repo => repo.toLowerCase());
      
     
      try {
        console.log("Attempting to fetch data for private CodeGrind repository...");
        updateLoadingStatus("Checking private repositories...", 10);
      } catch (e) {
        console.warn("Error checking private repositories:", e);
      }
      
      // Force refresh check
      const forceRefresh = window.location.search.includes('force_refresh');
      
      // Get total number of repos first to enable pagination
      const totalReposUrl = window.GitHubConfig.addClientId(
        `https://api.github.com/users/${username}`
      );
      
      let totalRepos = 0;
      let reposFetched = 0;
      
      // Get user info to determine total repo count
      try {
        updateLoadingStatus("Checking repository count...", 15);
        const userResponse = await fetch(totalReposUrl);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          totalRepos = userData.public_repos || 0;
          
          // Update loading message with total count
          updateLoadingStatus(`Found ${totalRepos} repositories, starting to fetch...`, 20);
        }
      } catch (e) {
        console.warn('Could not determine total repo count:', e);
        updateLoadingStatus("Fetching repositories (count unknown)...", 20);
      }
      
      // Track all repositories across pages
      let allRepos = [];
      let page = 1;
      let hasMorePages = true;
      
      // Fetch all pages of repositories
      while (hasMorePages) {
        // Use the helper method to add client_id and queue the request
        // Using pagination with 100 per page (GitHub max)
        const reposUrl = window.GitHubConfig.addClientId(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&page=${page}`
        );
        
        console.log(`Fetching repositories page ${page} from:`, reposUrl);
        
        // Update loading status with progress percentage
        const progressPercentage = Math.min(20 + (reposFetched / Math.max(totalRepos, 1)) * 30, 50);
        updateLoadingStatus(`Loading repositories (${reposFetched}/${totalRepos || '?'})...`, progressPercentage);
        
        // Use await with a Promise to make the request queue work with async/await
        const pageRepos = await new Promise(resolve => {
          RequestQueue.add(reposUrl, (response, repos) => {
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
              resolve([]);
              return;
            }
            
            if (!response.ok) {
              console.error(`GitHub API returned ${response.status} for repos fetch`);
              resolve([]);
              return;
            }
            
            // Check if we have more pages
            if (repos.length < 100) {
              hasMorePages = false;
            }
            
            // Update count
            reposFetched += repos.length;
            
            // Update loading message with progress percentage
            const progressPercentage = Math.min(20 + (reposFetched / Math.max(totalRepos, 1)) * 30, 50);
            updateLoadingStatus(`Loading repositories (${reposFetched}/${totalRepos || '?'})...`, progressPercentage);
            
            resolve(repos);
          });
        });
        
        // Add repos from this page to our collection
        allRepos = [...allRepos, ...pageRepos];
        
        // Move to next page
        page++;
        
        // If no more pages or we hit a limit, exit loop
        if (!hasMorePages || page > 10) {  // Safety limit of 10 pages (1000 repos)
          break;
        }
      }
      
      console.log(`Successfully fetched ${allRepos.length} repositories`);
      
      // Filter out excluded repos and empty repos
      const validRepos = allRepos.filter(repo => 
        !excludedReposLower.includes(repo.name.toLowerCase()) && 
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
      
      // Show all repositories instead of limiting to 12
      const reposToShow = validRepos;
      const reposWithLanguages = [];
      
      // Update loading message
      updateLoadingStatus(`Preparing ${validRepos.length} repositories...`, 55);
      
      // Use a simple counter for language data progress
      let languagesLoaded = 0;
      const totalToLoad = reposToShow.length;
      
      // First, fetch the first batch of repositories' language data to display them faster
      const firstBatchSize = Math.min(reposPerPage, reposToShow.length);
      for (let i = 0; i < firstBatchSize; i++) {
        const repo = reposToShow[i];
        try {
          // Skip language fetch for forked repos in first batch to save API calls
          if (!repo.fork && repo.languages_url && !repo.private) {
            const langUrl = window.GitHubConfig.addClientId(repo.languages_url);
            
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
                  
                  repo.languageData = languages;
                }
                
                // Update progress
                languagesLoaded++;
                const progressPercentage = Math.min(55 + (languagesLoaded / totalToLoad) * 40, 95);
                updateLoadingStatus(`Loading language data (${languagesLoaded}/${totalToLoad})...`, progressPercentage);
                
                resolve();
              });
            });
          } else {
            // For private or forked repos
            languagesLoaded++;
          }
        } catch (e) {
          console.warn(`Failed to fetch language data for repo ${repo.name}`, e);
          languagesLoaded++;
        }
        
        // Add to repositories array
        reposWithLanguages.push(repo);
      }
      
      // Render first batch immediately
      updateLoadingStatus(`Rendering first batch of repositories...`, 70);
      currentPage = 1;
      renderRepos(currentPage);
      
      // Then load the rest of the repositories in the background
      for (let i = firstBatchSize; i < reposToShow.length; i++) {
        const repo = reposToShow[i];
        reposWithLanguages.push(repo);
        
        // Continue fetching language data in the background
        if (!repo.fork && repo.languages_url && !repo.private) {
          try {
            const langUrl = window.GitHubConfig.addClientId(repo.languages_url);
            
            // Don't await this promise - let it run in the background
            RequestQueue.add(langUrl, (langResponse, langData) => {
              if (langResponse.ok) {
                // Calculate total bytes
                const totalBytes = Object.values(langData).reduce((a, b) => a + b, 0);
                // Convert to percentages
                const languages = Object.entries(langData).map(([name, bytes]) => ({
                  name,
                  percentage: Math.round((bytes / totalBytes) * 100)
                })).sort((a, b) => b.percentage - a.percentage);
                
                repo.languageData = languages;
                
                // Update the card if it's already visible
                updateRepoCardLanguages(repo);
              }
              
              // Update progress
              languagesLoaded++;
              const progressPercentage = Math.min(70 + (languagesLoaded / totalToLoad) * 25, 95);
              updateLoadingStatus(`Loading language data (${languagesLoaded}/${totalToLoad})...`, progressPercentage);
            });
          } catch (e) {
            console.warn(`Failed to fetch language data for repo ${repo.name}`, e);
            languagesLoaded++;
          }
        } else {
          // Count it as loaded
          languagesLoaded++;
        }
      }
      
      // Update loading message before rendering
      updateLoadingStatus(`Finalizing repository display...`, 95);
      
      // Update last updated timestamps for all repos
      updateLastUpdatedTimestamps();
  
      // Add GitHub stats section
      updateGitHubStatsSection(allRepos);
      
      // Complete loading
      updateLoadingStatus(`Loading complete!`, 100);
      
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
   * Function to render a batch of repositories
   * @param {number} page - The page number to render
   */
  function renderRepos(page) {
    console.log(`Rendering page ${page} of repositories. Total repos: ${reposWithLanguages.length}`);
    const startIdx = (page - 1) * reposPerPage;
    const endIdx = page * reposPerPage;
    const reposToRender = reposWithLanguages.slice(startIdx, endIdx);
    
    console.log(`Rendering repos from index ${startIdx} to ${endIdx-1}. Rendering ${reposToRender.length} repos.`);
    
    // If no repositories to render, show a message
    if (reposToRender.length === 0 && page === 1) {
      additionalProjectsContainer.innerHTML = `
        <p class="text-center text-gray-500 py-6">No additional projects found on GitHub.</p>
      `;
      return;
    }
    
    // Create HTML for the repositories
    let reposHTML = '';
    
    // Add heading if this is the first page
    if (page === 1) {
      reposHTML += `
        <h3 class="text-2xl font-bold mb-6 pb-2 border-b opacity-0" data-animate="fade-in">Additional GitHub Projects</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="github-repos-container">
      `;
    }
    
    // Add repo cards
    reposToRender.forEach(repo => {
      reposHTML += createRepoCard(repo);
    });
    
    // Close the grid container if this is the first page
    if (page === 1) {
      reposHTML += `</div>`;
      
      // Add load more button if there are more repos to show
      if (reposWithLanguages.length > reposPerPage) {
        reposHTML += `
          <div class="text-center mt-8">
            <button id="load-more-repos" class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Load More Projects
            </button>
          </div>
        `;
      }
      
      // Set the HTML
      additionalProjectsContainer.innerHTML = reposHTML;
      
      // Add click event to the load more button
      const loadMoreButton = document.getElementById('load-more-repos');
      if (loadMoreButton) {
        loadMoreButton.addEventListener('click', function() {
          currentPage++;
          loadMoreRepos();
        });
      }
    } else {
      // For subsequent pages, append to the existing container
      const reposContainer = document.getElementById('github-repos-container');
      if (reposContainer) {
        reposContainer.insertAdjacentHTML('beforeend', reposToRender.map(repo => createRepoCard(repo)).join(''));
      }
      
      // Hide the load more button if we've loaded all repos
      const loadMoreButton = document.getElementById('load-more-repos');
      if (loadMoreButton && (currentPage * reposPerPage) >= reposWithLanguages.length) {
        loadMoreButton.style.display = 'none';
      }
    }
  
  }
  
  /**
   * Load more repositories when the "Load More" button is clicked
   */
  function loadMoreRepos() {
    console.log(`Loading more repos, page ${currentPage}`);
    renderRepos(currentPage);
  }
  
  /**
   * Update repo card language data after background loading
   */
  function updateRepoCardLanguages(repo) {
    if (!repo.id || !repo.languageData) return;
    
    // Try to find the card by repo name
    const repoCards = document.querySelectorAll('.bg-white.dark\\:bg-gray-800.rounded-lg');
    
    repoCards.forEach(card => {
      const titleElem = card.querySelector('h3');
      if (titleElem && titleElem.textContent.trim() === repo.name) {
        // Find the language section
        const languageSection = card.querySelector('h4');
        if (languageSection && languageSection.textContent.includes('LANGUAGE')) {
          // Get the parent of the language section
          const languageContainer = languageSection.closest('.mb-4');
          if (languageContainer) {
            // Create HTML for language bar
            let html = `<h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>`;
            html += `<div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">`;
            
            repo.languageData.forEach(lang => {
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
                "XML": "bg-orange-300",
                "JSON": "bg-amber-300"
              };
              const bgClass = colorMap[lang.name] || "bg-gray-400";
              html += `<div class="${bgClass}" style="width: ${lang.percentage}%; height: 100%; float: left;" title="${lang.name}: ${lang.percentage}%"></div>`;
            });
            
            html += `</div>`;
            html += `<div class="flex flex-wrap mt-1 text-xs">`;
            
            repo.languageData.forEach(lang => {
              html += `<span class="mr-2">${lang.name} (${lang.percentage}%)</span>`;
            });
            
            html += `</div>`;
            
            // Update the container
            languageContainer.innerHTML = html;
          }
        }
      }
    });
  }

  /**
   * Create HTML for a repository card
   * @param {Object} repo - The repository object
   * @returns {string} HTML string for the card
   */
  function createRepoCard(repo) {
    // Format date
    const updatedDate = new Date(repo.updated_at);
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = updatedDate.toLocaleDateString('en-US', dateOptions);
    
    // Check if repo has a description
    const description = repo.description || 'No description provided';
    
    // Build language HTML if available
    let languageHTML = '';
    if (repo.languageData && repo.languageData.length > 0) {
      languageHTML += `<div class="mb-4">
        <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
        <div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">`;
      
      repo.languageData.forEach(lang => {
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
          "XML": "bg-orange-300",
          "JSON": "bg-amber-300"
        };
        const bgClass = colorMap[lang.name] || "bg-gray-400";
        languageHTML += `<div class="${bgClass}" style="width: ${lang.percentage}%; height: 100%; float: left;" title="${lang.name}: ${lang.percentage}%"></div>`;
      });
      
      languageHTML += `</div>
        <div class="flex flex-wrap mt-1 text-xs">`;
      
      repo.languageData.forEach(lang => {
        languageHTML += `<span class="mr-2">${lang.name} (${lang.percentage}%)</span>`;
      });
      
      languageHTML += `</div>
      </div>`;
    } else {
      // If we don't have language data yet, show a placeholder
      languageHTML = `<div class="mb-4" id="lang-${repo.id}">
        <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
        <div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div class="bg-gray-400 animate-pulse h-2 w-full"></div>
        </div>
        <div class="flex flex-wrap mt-1 text-xs">
          <span class="mr-2">Loading language data...</span>
        </div>
      </div>`;
    }
    
    // Card HTML
    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6" data-repo-id="${repo.id}" data-animate="fade-up">
        <h3 class="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">
          <a href="${repo.html_url}" target="_blank" rel="noopener" class="hover:underline">
            ${repo.name}
          </a>
        </h3>
        
        <p class="text-gray-600 dark:text-gray-300 mb-4">${description}</p>
        
        ${languageHTML}
        
        <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>
            <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Last updated: ${formattedDate}
          </span>
          <span>
            <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
            ${repo.stargazers_count} stars
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Helper function to create language bar HTML
   */
  function createLanguageBarHTML(languages) {
    return `
      <div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        ${languages.map(lang => {
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
            "XML": "bg-orange-300",
            "JSON": "bg-amber-300"
          };
          const bgClass = colorMap[lang.name] || "bg-gray-400";
          return `<div class="${bgClass}" style="width: ${lang.percentage}%; height: 100%; float: left;" title="${lang.name}: ${lang.percentage}%"></div>`;
        }).join('')}
      </div>
      <div class="flex flex-wrap mt-1 text-xs">
        ${languages.map(lang => `<span class="mr-2">${lang.name} (${lang.percentage}%)</span>`).join('')}
      </div>
    `;
  }

  /**
   * Helper function to create private repo language HTML
   */
  function createPrivateRepoLanguageHTML() {
    return `
      <div class="flex flex-wrap">
        <span class="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">Private repository - GitHub data available via API</span>
      </div>
    `;
  }

  // Helper function to update loading status with progress
  function updateLoadingStatus(message, percentage) {
    const loadingStatus = document.getElementById('loading-status');
    const progressIndicator = document.getElementById('loading-progress-indicator');
    
    if (loadingStatus) {
      loadingStatus.textContent = message;
    }
    
    if (progressIndicator) {
      progressIndicator.style.width = `${percentage}%`;
    }
    
    console.log(`Loading status: ${message} (${percentage}%)`);
  }

  // Helper function to add GitHub stats section
  function updateGitHubStatsSection(allRepos) {
    const totalRepoCount = allRepos.length;
    const publicRepos = allRepos.filter(r => !r.private).length;
    const privateRepos = totalRepoCount - publicRepos;
    
    // Check if "More on GitHub" section already exists to avoid duplication
    const existingGitHubSection = document.querySelector('.more-on-github-section');
    if (!existingGitHubSection) {
      const profileStatsHTML = `
        <div class="mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 more-on-github-section">
          <h3 class="text-xl font-bold mb-4">More on GitHub</h3>
          <p class="mb-4 text-gray-700 dark:text-gray-300">
            Check out my GitHub profile for more projects, contributions, and open source work.
          </p>
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="flex flex-col gap-2">
              <div>
                <span class="font-medium">Total repositories:</span> ${totalRepoCount} (${privateRepos} private)
              </div>
              <div>
                <span class="font-medium">Total stars:</span> ${allRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
              </div>
              <div>
                <span class="font-medium">Total forks:</span> ${allRepos.reduce((sum, repo) => sum + repo.forks_count, 0)}
              </div>
            </div>
            <a href="https://github.com/${window.GitHubConfig.username}" target="_blank" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
              </svg>
              View GitHub Profile
            </a>
          </div>
        </div>
      `;
      
      additionalProjectsContainer.insertAdjacentHTML('beforeend', profileStatsHTML);
    }
  }

  /**
   * Update last updated timestamps for all repos
   */
  function updateLastUpdatedTimestamps() {
    // Get all elements with the data-github-last-updated attribute
    const timestampElements = document.querySelectorAll('[data-github-last-updated]');
    if (!timestampElements || timestampElements.length === 0) {
      console.log('No timestamp elements found to update');
      return;
    }
    
    const username = window.GitHubConfig.username;
    
    timestampElements.forEach(element => {
      const projectId = element.getAttribute('data-github-last-updated');
      if (!projectId) return;
      
      // Get the repo name based on the project ID
      let repo = projectId;
      // Map common project IDs to repo names if needed
      if (projectId === 'helios-swarm-robotics') {
        repo = 'helios';
      } else if (projectId === 'bestnotes') {
        repo = '01-bestnotes';
      } else if (projectId === 'projectile-launcher-rework') {
        repo = 'plr';
      } else if (projectId === 'book-player-application') {
        repo = 'assignment-10-rivie13';
      }
      
      // Check if we already have last updated info
      if (element.textContent && element.textContent.includes('Last updated') && !element.textContent.includes('Loading')) {
        return; // Skip if already updated
      }
      
      // Show loading indicator
      element.textContent = "Loading update info...";
      
      // Get the last updated timestamp
      const repoUrl = window.GitHubConfig.addClientId(`https://api.github.com/repos/${username}/${repo}`);
      
      // Check cache first
      const cacheKey = `repo_details_${username}_${repo}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      const now = Date.now();
      const cacheDuration = window.GitHubConfig ? window.GitHubConfig.cacheDuration : 24 * 60 * 60 * 1000;
      
      if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < cacheDuration)) {
        console.log(`Using cached repo details for: ${repo}`);
        updateLastUpdatedElement(element, JSON.parse(cachedData));
        return;
      }
      
      window.RequestQueue.add(repoUrl, (response, data) => {
        if (response.ok) {
          // Cache the data
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
          } catch (e) {
            console.warn('Failed to cache repo details:', e);
          }
          
          updateLastUpdatedElement(element, data);
        } else {
          element.textContent = "Last updated: Unknown";
        }
      });
    });
  }

  /**
   * Update a last updated element with repo data
   */
  function updateLastUpdatedElement(element, data) {
    if (data.updated_at) {
      // Format the date
      const updatedDate = new Date(data.updated_at);
      const formattedDate = updatedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Update the element
      element.textContent = `Last updated: ${formattedDate}`;
    } else {
      element.textContent = "Last updated: Unknown";
    }
  }
});