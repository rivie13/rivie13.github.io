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
          }, 1000); // 1 second delay between requests
        })
        .catch(error => {
          console.error(`Error fetching ${url}:`, error);
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
    'Helios',
    '01-BestNotes',
    'Robotics-Nav2-SLAM-Example',
    'codegrind'
  ]; // Reduce excluded repos to show more
  
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
    const globalLoadingMsg = document.querySelector('div:contains("Loading language data")');
    if (globalLoadingMsg) {
      globalLoadingMsg.remove();
    }
  }, 5000); // Give it 5 seconds to load initial data
  
  /**
   * Fetch additional repositories from GitHub
   */
  async function fetchAdditionalRepos(username, excludedRepos) {
    try {
      additionalProjectsContainer.innerHTML = `
        <div class="text-center py-6">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600" id="loading-status">Loading all projects from GitHub...</p>
        </div>
      `;
      
      // Convert excluded repos to lowercase for case-insensitive comparison
      const excludedReposLower = excludedRepos.map(repo => repo.toLowerCase());
      
      // Try to fetch CodeGrind info if we're authenticated
      let codegrindInfo = null;
      try {
        console.log("Attempting to fetch data for private CodeGrind repository...");
        const codegrindUrl = window.GitHubConfig.addClientId(
          `https://api.github.com/repos/${username}/codegrind`
        );
        
        await new Promise(resolve => {
          RequestQueue.add(codegrindUrl, (response, data) => {
            if (response.ok) {
              console.log("Successfully fetched CodeGrind repository data");
              codegrindInfo = data;
            } else {
              console.log(`Failed to fetch CodeGrind data. Status: ${response.status}`);
            }
            resolve();
          });
        });
      } catch (e) {
        console.warn("Error fetching CodeGrind repository data:", e);
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
        const userResponse = await fetch(totalReposUrl);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          totalRepos = userData.public_repos || 0;
          
          // Update loading message with total count
          document.getElementById('loading-status').textContent = 
            `Loading repositories (0/${totalRepos})...`;
        }
      } catch (e) {
        console.warn('Could not determine total repo count:', e);
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
        
        // Update loading status
        document.getElementById('loading-status').textContent = 
          `Loading repositories (${reposFetched}/${totalRepos || '?'})...`;
          
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
            
            // Update loading message
            document.getElementById('loading-status').textContent = 
              `Loading repositories (${reposFetched}/${totalRepos || '?'})...`;
              
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
      const loadingStatus = document.getElementById('loading-status');
      if (loadingStatus) {
        loadingStatus.textContent = `Loading language data for repositories...`;
      }
        
      // Use a simple counter for language data progress
      let languagesLoaded = 0;
      
      for (const repo of reposToShow) {
        try {
          // First try to get topics for this repository
          // Topics require an explicit accept header
          try {
            if (!repo.private) {
              const topicsUrl = window.GitHubConfig.addClientId(
                `https://api.github.com/repos/${username}/${repo.name}/topics`
              );
              
              await new Promise(resolve => {
                RequestQueue.add(topicsUrl, (topicsResponse, topicsData) => {
                  if (topicsResponse.ok && topicsData && topicsData.names) {
                    repo.topics = topicsData.names;
                    console.log(`Got ${repo.topics.length} topics for ${repo.name}`);
                  }
                  resolve();
                });
              });
            }
          } catch (e) {
            console.warn(`Failed to fetch topics for ${repo.name}`, e);
          }
          
          // Skip language fetch for forked repos to save API calls
          if (repo.fork) {
            // Don't use a simplified language object for forked repos
            // Instead, fetch the actual language data
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
                      // If language fetch fails for forked repo, use a fallback
                      reposWithLanguages.push({ 
                        ...repo, 
                        languageData: [{ name: "No language data available", percentage: 100 }] 
                      });
                    }
                    
                    // Update progress
                    languagesLoaded++;
                    const loadingStatus = document.getElementById('loading-status');
                    if (loadingStatus) {
                      loadingStatus.textContent = `Loading language data (${languagesLoaded}/${reposToShow.length})...`;
                    }
                    
                    resolve();
                  });
                });
              } else {
                // For private forked repos
                reposWithLanguages.push(repo);
                
                // Update progress
                languagesLoaded++;
                const loadingStatus = document.getElementById('loading-status');
                if (loadingStatus) {
                  loadingStatus.textContent = `Loading language data (${languagesLoaded}/${reposToShow.length})...`;
                }
              }
            } catch (e) {
              console.warn(`Failed to fetch language data for forked repo ${repo.name}`, e);
              reposWithLanguages.push(repo);
              
              // Update progress
              languagesLoaded++;
              const loadingStatus = document.getElementById('loading-status');
              if (loadingStatus) {
                loadingStatus.textContent = `Loading language data (${languagesLoaded}/${reposToShow.length})...`;
              }
            }
          } else if (repo.languages_url && !repo.private) {
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
                  // Even if language data fetch fails, still include the repo
                  reposWithLanguages.push(repo);
                }
                
                // Update progress
                languagesLoaded++;
                const loadingStatus = document.getElementById('loading-status');
                if (loadingStatus) {
                  loadingStatus.textContent = `Loading language data (${languagesLoaded}/${reposToShow.length})...`;
                }
                
                resolve();
              });
            });
          } else {
            // Include private repos too
            reposWithLanguages.push(repo);
            
            // Update progress
            languagesLoaded++;
            const loadingStatus = document.getElementById('loading-status');
            if (loadingStatus) {
              loadingStatus.textContent = `Loading language data (${languagesLoaded}/${reposToShow.length})...`;
            }
          }
        } catch (e) {
          console.warn(`Failed to fetch language data for ${repo.name}`, e);
          reposWithLanguages.push(repo);
          
          // Update progress even on error
          languagesLoaded++;
          const loadingStatus = document.getElementById('loading-status');
          if (loadingStatus) {
            loadingStatus.textContent = `Loading language data (${languagesLoaded}/${reposToShow.length})...`;
          }
        }
      }
      
      // Update loading message before rendering
      const loadingStatus2 = document.getElementById('loading-status');
      if (loadingStatus2) {
        loadingStatus2.textContent = `Rendering ${reposWithLanguages.length} repositories...`;
      }
        
      // Implement pagination to show repositories in batches
      const reposPerPage = 8; // Show 8 repos initially
      let currentPage = 1;
      
      // Function to render a batch of repositories
      function renderRepos(page) {
        console.log(`Rendering page ${page} of repositories. Total repos: ${reposWithLanguages.length}`);
        const startIdx = (page - 1) * reposPerPage;
        const endIdx = page * reposPerPage;
        const reposToRender = reposWithLanguages.slice(startIdx, endIdx);
        
        console.log(`Rendering repos from index ${startIdx} to ${endIdx-1}. Rendering ${reposToRender.length} repos.`);
        
        // Create HTML for the repositories
        const reposHTML = reposToRender.map(repo => createRepoCard(repo)).join('');
        
        // Replace or append content
        if (page === 1) {
          // First page: replace content
          console.log("Replacing container content with first page of repos");
          additionalProjectsContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="repos-grid">
              ${reposHTML}
            </div>
          `;
        } else {
          // Subsequent pages: append content
          console.log("Appending repositories to existing grid");
          const reposGrid = document.getElementById('repos-grid');
          if (reposGrid) {
            // Create a temporary div to hold the new HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = reposHTML;
            
            // Append each child individually to maintain grid structure
            while (tempDiv.firstChild) {
              reposGrid.appendChild(tempDiv.firstChild);
            }
          } else {
            console.error("Could not find repos-grid element for appending more repositories");
            // Fallback: replace entire content
            additionalProjectsContainer.innerHTML = `
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="repos-grid">
                ${reposWithLanguages.slice(0, endIdx).map(repo => createRepoCard(repo)).join('')}
              </div>
            `;
          }
        }
        
        // Add "Load More" button if there are more repos to show
        updateLoadMoreButton(endIdx);
        
        // Start loading language data for displayed repositories first
        loadLanguageDataForDisplayedRepos(reposToRender);
      }
      
      // Function to update or add the load more button
      function updateLoadMoreButton(endIdx) {
        // Remove existing button if any
        const existingButton = document.getElementById('load-more-container');
        if (existingButton) {
          existingButton.remove();
        }
        
        if (endIdx < reposWithLanguages.length) {
          console.log(`Adding Load More button. Showing ${endIdx}/${reposWithLanguages.length} repos`);
          const remainingCount = Math.min(reposPerPage, reposWithLanguages.length - endIdx);
          
          const loadMoreHTML = `
            <div class="text-center mt-8" id="load-more-container">
              <button id="load-more-button" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path>
                </svg>
                Load ${remainingCount} More Repositories
              </button>
              <div class="text-sm text-gray-500 mt-2">
                Showing ${endIdx} of ${reposWithLanguages.length} repositories
              </div>
            </div>
          `;
          additionalProjectsContainer.insertAdjacentHTML('beforeend', loadMoreHTML);
          
          // Add click event listener to the button
          document.getElementById('load-more-button').addEventListener('click', function() {
            console.log("Load more button clicked");
            
            // Update button to show loading state
            this.disabled = true;
            this.innerHTML = `
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            `;
            
            // Delay slightly to let the button update render
            setTimeout(() => {
              currentPage++;
              renderRepos(currentPage);
            }, 50);
          });
        } else {
          console.log("All repositories shown, no load more button needed");
          // Add a "showing all" indicator
          additionalProjectsContainer.insertAdjacentHTML('beforeend', `
            <div class="text-center mt-4 text-sm text-gray-500" id="load-more-container">
              Showing all ${reposWithLanguages.length} repositories
            </div>
          `);
        }
      }
      
      // Function to load language data for displayed repositories first
      async function loadLanguageDataForDisplayedRepos(displayedRepos) {
        for (const repo of displayedRepos) {
          if (!repo.languageData && repo.languages_url && !repo.private) {
            try {
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
                    
                    repo.languageData = languages;
                    
                    // Find and update the repo card in the DOM
                    updateRepoCardLanguages(repo);
                  }
                  resolve();
                });
              });
            } catch (e) {
              console.warn(`Failed to load language data for displayed repo ${repo.name}:`, e);
            }
          }
        }
        
        // After loading visible repos, start loading the rest
        loadRemainingLanguageData();
      }
      
      // Function to load language data for remaining repositories
      async function loadRemainingLanguageData() {
        const currentlyDisplayed = reposPerPage * currentPage;
        const remainingRepos = reposWithLanguages.slice(currentlyDisplayed);
        
        for (const repo of remainingRepos) {
          if (!repo.languageData && repo.languages_url && !repo.private) {
            try {
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
                    
                    repo.languageData = languages;
                  }
                  resolve();
                });
              });
            } catch (e) {
              console.warn(`Failed to load language data for remaining repo ${repo.name}:`, e);
            }
          }
        }
      }
      
      // Function to update a specific repo card's language display
      function updateRepoCardLanguages(repo) {
        // Find the repo card in the DOM
        const repoCards = document.querySelectorAll('.bg-white.dark\\:bg-gray-800.rounded-lg');
        
        for (const card of repoCards) {
          const titleElem = card.querySelector('h3');
          if (titleElem && titleElem.textContent.includes(repo.name)) {
            const languageContainer = card.querySelector('.languages-container');
            if (languageContainer && repo.languageData) {
              // Create HTML for language bar
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
              
              let html = `<div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">`;
              repo.languageData.forEach(lang => {
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
            break;
          }
        }
      }
      
      // Render the first page of repositories
      console.log(`Starting to render repositories. Found ${reposWithLanguages.length} repos with languages`);
      renderRepos(currentPage);
      
      // Add additional GitHub stats section
      const totalRepoCount = allRepos.length;
      const publicRepos = allRepos.filter(r => !r.private).length;
      const privateRepos = totalRepoCount - publicRepos;
      
      // Add CodeGrind section if we successfully retrieved it
      if (codegrindInfo) {
        console.log("Processing CodeGrind repository information");
        
        // Fetch language data for CodeGrind if available
        let codegrindLanguages = [];
        try {
          if (codegrindInfo.languages_url) {
            const langUrl = window.GitHubConfig.addClientId(codegrindInfo.languages_url);
            await new Promise(resolve => {
              RequestQueue.add(langUrl, (langResponse, langData) => {
                if (langResponse.ok) {
                  // Calculate total bytes
                  const totalBytes = Object.values(langData).reduce((a, b) => a + b, 0);
                  // Convert to percentages
                  codegrindLanguages = Object.entries(langData).map(([name, bytes]) => ({
                    name,
                    percentage: Math.round((bytes / totalBytes) * 100)
                  })).sort((a, b) => b.percentage - a.percentage);
                }
                resolve();
              });
            });
          }
        } catch (e) {
          console.warn("Error fetching CodeGrind language data:", e);
        }
        
        // Find and update existing CodeGrind cards instead of creating a new section
        updateExistingCodegrindCards(codegrindInfo, codegrindLanguages);
      }
      
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
      }
      
      // Add a "Force Refresh" button for development
      if (document.querySelector('#dev-tools')) {
        const refreshButton = `
          <div class="mt-4 text-right">
            <a href="?force_refresh=true" class="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs transition-colors">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Force Refresh Data
            </a>
          </div>
        `;
        additionalProjectsContainer.insertAdjacentHTML('beforeend', refreshButton);
      }
      
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
    
    // Get repo topics if available
    const topics = repo.topics || [];
    const topicsHTML = topics.length > 0 ? `
      <div class="mb-4">
        <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">TOPICS</h4>
        <div class="flex flex-wrap">
          ${topics.map(topic => `
            <span class="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">${topic}</span>
          `).join('')}
        </div>
      </div>
    ` : '';
    
    // Get license info if available
    const licenseHTML = repo.license ? `
      <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 100 12 6 6 0 000-12zm-1 5a1 1 0 112 0v3a1 1 0 11-2 0V9zm1-3a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"></path>
        </svg>
        <span>${repo.license.name || repo.license.spdx_id || 'Licensed'}</span>
      </div>
    ` : '';
    
    // Generate language bar if we have language data
    let languageBar = '';
    if (repo.private) {
      languageBar = `
        <div class="mb-4">
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
          <div class="flex flex-wrap">
            <span class="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">Private repository - language data available via API</span>
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
            ${repo.fork ? `<span class="ml-2 bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded">Fork</span>` : ''}
            ${repo.archived ? `<span class="ml-2 bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">Archived</span>` : ''}
          </h3>
          
          <p class="text-gray-600 dark:text-gray-300 mb-4">${description}</p>
          
          ${languageBar}
          
          ${topicsHTML}
          
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
            </svg>
            <span>Last updated: ${formattedDate}</span>
          </div>
          
          ${licenseHTML}
          
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
                <path fill-rule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clip-rule="evenodd"></path>
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

            ${repo.open_issues_count > 0 ? `
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
              </svg>
              <span>${repo.open_issues_count} ${repo.open_issues_count === 1 ? 'issue' : 'issues'}</span>
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
            
            ${repo.fork ? `
            <a href="${repo.source ? repo.source.html_url : repo.html_url.replace(/\/[^/]+\/[^/]+$/, `/${repo.full_name.split('/')[0]}/${repo.name}`)}" target="_blank" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
              </svg>
              Original Repo
            </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update existing CodeGrind project cards with data from the API
   */
  function updateExistingCodegrindCards(repoInfo, languages) {
    console.log("Looking for existing CodeGrind cards to update");
    
    // Find all CodeGrind project cards (both in featured and all projects sections)
    const codegrindCards = document.querySelectorAll('[id^="codegrind"]');
    
    if (codegrindCards.length === 0) {
      console.log("No existing CodeGrind cards found");
      return;
    }
    
    console.log(`Found ${codegrindCards.length} CodeGrind cards to update`);
    
    // Format date
    const formattedDate = new Date(repoInfo.updated_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Update each card
    codegrindCards.forEach(card => {
      console.log(`Updating card: ${card.id}`);
      
      // Update description if available
      const descriptionElem = card.querySelector('p.text-gray-600, p.text-gray-300');
      if (descriptionElem && repoInfo.description) {
        console.log(`Updating description to: ${repoInfo.description}`);
        descriptionElem.textContent = repoInfo.description;
      }
      
      // Update language information
      if (languages && languages.length > 0) {
        console.log(`Updating language data with ${languages.length} languages`);
        
        // First try to find the languages container
        const languageContainer = card.querySelector('.languages-container');
        const languageHeading = card.querySelector('.mb-4 h4, h4.text-sm');
        
        if (languageContainer) {
          console.log('Found language container with class to update');
          
          // Create language bar HTML
          const languageBarHTML = createLanguageBarHTML(languages);
          languageContainer.innerHTML = languageBarHTML;
        } else if (languageHeading && (languageHeading.textContent.includes('LANGUAGE') || languageHeading.textContent.includes('Language'))) {
          // Try to find the parent container
          console.log('Found language heading to update');
          const parentDiv = languageHeading.closest('.mb-4');
          if (parentDiv) {
            console.log('Found language section parent div to update');
            parentDiv.innerHTML = `
              <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
              ${createLanguageBarHTML(languages)}
            `;
          }
        } else {
          // No language section found, try to find anywhere to insert
          console.log('No language section found, looking for insertion point');
          const keyFeaturesHeading = card.querySelector('h4, .text-sm.font-semibold.uppercase');
          if (keyFeaturesHeading && keyFeaturesHeading.textContent.includes('KEY FEATURES')) {
            const featuresParent = keyFeaturesHeading.parentElement;
            if (featuresParent && featuresParent.parentElement) {
              console.log('Inserting language bar before features section');
              const langDiv = document.createElement('div');
              langDiv.className = 'mb-4';
              langDiv.innerHTML = `
                <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
                ${createLanguageBarHTML(languages)}
              `;
              featuresParent.parentElement.insertBefore(langDiv, featuresParent);
            }
          }
        }
      } else {
        // No language data available, update with private repo message
        console.log('No language data available, updating with private repo message');
        const languageContainer = card.querySelector('.languages-container');
        const languageHeading = card.querySelector('.mb-4 h4, h4.text-sm');
        
        if (languageContainer) {
          languageContainer.innerHTML = createPrivateRepoLanguageHTML();
        } else if (languageHeading && (languageHeading.textContent.includes('LANGUAGE') || languageHeading.textContent.includes('Language'))) {
          const parentDiv = languageHeading.closest('.mb-4');
          if (parentDiv) {
            parentDiv.innerHTML = `
              <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
              ${createPrivateRepoLanguageHTML()}
            `;
          }
        }
      }
      
      // Update "Last updated" text
      const dateElements = card.querySelectorAll('[data-github-last-updated="codegrind"]');
      if (dateElements.length > 0) {
        dateElements.forEach(element => {
          console.log(`Updating last updated date to: ${formattedDate}`);
          element.textContent = `Last updated: ${formattedDate}`;
        });
      } else {
        // Try to find any span with "Last updated" or similar text
        const spanElements = card.querySelectorAll('span.text-sm, span.text-gray-500');
        spanElements.forEach(element => {
          if (element.textContent.includes('updated') || element.textContent.includes('commit')) {
            console.log(`Updating span with date: ${formattedDate}`);
            element.textContent = `Last updated: ${formattedDate}`;
          }
        });
      }
      
      // Update GitHub link if available
      const githubLinks = card.querySelectorAll('a[href*="github.com"]');
      githubLinks.forEach(link => {
        if (link.textContent.includes('GitHub') && repoInfo.html_url) {
          console.log(`Updating GitHub URL to: ${repoInfo.html_url}`);
          link.href = repoInfo.html_url;
        }
      });
      
      console.log(`Updated CodeGrind card: ${card.id}`);
    });
    
    // Remove any duplicate CodeGrind section we might have created previously
    const separateCodegrindSection = document.querySelector('.mt-10.mb-6 h3');
    if (separateCodegrindSection && separateCodegrindSection.textContent.includes('CodeGrind (Private Repository)')) {
      const section = separateCodegrindSection.closest('.mt-10.mb-6');
      if (section) {
        console.log("Removing separate CodeGrind section");
        section.remove();
      }
    }
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
});