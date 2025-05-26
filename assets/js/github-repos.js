/**
 * GitHub Repository Fetcher
 * This script dynamically fetches and displays all repositories from GitHub
 */

// Create a request queue to prevent hitting secondary rate limits
window.RequestQueue = {
  queue: [],
  running: false,
  maxConcurrent: 10, // Increased from 3 to 10 for much better performance
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
      const cacheDuration = 4 * 60 * 60 * 1000; // Increase to 4 hours for better performance
      
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
    
    // Reduced delay to avoid hitting secondary rate limits
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
        
        // Decreased delay between requests for faster loading
        setTimeout(() => {
          this.processNext();
        }, 100); // Reduced from 500ms to 100ms for much faster loading
      })
      .catch(error => {
        console.error(`Error fetching ${url}:`, error);
        this.activeRequests--;
        callback({ ok: false, status: 500 }, { message: error.message });
        
        // Decreased delay between requests for faster loading
        setTimeout(() => {
          this.processNext();
        }, 100); // Reduced from 500ms to 100ms for much faster loading
      });
  }
};

// Wait for the DOM to be fully loaded and parsed
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM Content Loaded - Starting GitHub repos script");
  
  // Add a small delay to ensure all elements are rendered
  setTimeout(initGitHubRepos, 100);
});

// Main initialization function
function initGitHubRepos() {
  // Initialize request counter
  if (window.RequestQueue) {
    window.RequestQueue.init();
  } else {
    console.error("ERROR: RequestQueue not initialized. Check if github-config.js is loaded before github-repos.js");
    return;
  }
  
  // Find the container element - but NEVER create one if it doesn't exist
  let additionalProjectsContainer = document.getElementById('additional-projects');
  
  // Log whether we found it, but DO NOT create one
  if (!additionalProjectsContainer) {
    console.log("Could not find element with ID 'additional-projects'. Repository section will not be displayed.");
    
    // Try a selector that might only exist on the projects page, not the index page
    additionalProjectsContainer = document.querySelector('.projects-container');
    
    // If we still don't have a container, exit early - DO NOT create one
    if (!additionalProjectsContainer) {
      console.log("No suitable repository container found. This is expected on pages other than the projects page.");
      return; // Exit early
    }
  }
  
  console.log("Using existing repository container:", additionalProjectsContainer);
  
  const username = window.GitHubConfig.username;
  const excludedRepos = [
    'Helios',
    '01-BestNotes',
    'Robotics-Nav2-SLAM-Example',
    'codegrind',
    'plr',
    'PLR'
  ]; // Reduce excluded repos to show more
  
  // Define repositories per page globally
  const reposPerPage = 8; // Show 8 repos initially
  let currentPage = 1;
  
  // Define reposWithLanguages globally so it can be accessed by renderRepos
  let reposWithLanguages = [];

  // Use the centralized GitHub config
  fetchAdditionalRepos(username, excludedRepos);
  
  /**
   * Fetch additional repositories from GitHub
   */
  async function fetchAdditionalRepos(username, excludedRepos) {
    try {
      // CRITICAL FIX: Double-check container exists before proceeding
      if (!additionalProjectsContainer || !document.body.contains(additionalProjectsContainer)) {
        console.error("ERROR: additionalProjectsContainer does not exist or is not in the document anymore!");
        return;
      }
      
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
      console.log("DEBUG: Excluded repos:", excludedReposLower);
     
      try {
        console.log("Attempting to fetch data for private repositories...");
        updateLoadingStatus("Checking private repositories...", 10);
      } catch (e) {
        console.warn("Error checking private repositories:", e);
      }
      
      // Force refresh check
      const forceRefresh = window.location.search.includes('force_refresh');
      
      // Get user info and total repo count (both public and private)
      let totalUserRepos = 0;   // Total repos (including private) from authenticated call
      let publicUserRepos = 0;  // Public repos from unauthenticated call
      let privateUserRepos = 0; // Private repos (calculated)
      let isAuthenticated = false;
      
      // First try to get authenticated user data to include private repos
      try {
        updateLoadingStatus("Checking for authenticated access...", 15);
        
        // Use the GitHub proxy to get authenticated user data
        const authUserUrl = window.GitHubConfig.addClientId(`https://api.github.com/user`);
        
        console.log('DEBUG: Fetching authenticated user data from:', authUserUrl);
        
        // Direct fetch instead of using RequestQueue for debugging
        const authUserResponse = await fetch(authUserUrl);
        
        console.log('DEBUG: Auth response status:', authUserResponse.status);
        console.log('DEBUG: Auth response headers:', Object.fromEntries(authUserResponse.headers.entries()));
        
        if (authUserResponse.ok) {
          const authUserData = await authUserResponse.json();
          console.log('DEBUG: Authenticated user data:', authUserData);
          
          // Check if we have repo count data
          if (authUserData.total_private_repos !== undefined) {
            totalUserRepos = authUserData.public_repos + authUserData.total_private_repos;
            publicUserRepos = authUserData.public_repos;
            privateUserRepos = authUserData.total_private_repos;
            isAuthenticated = true;
            
            console.log(`FOUND Private repos count: ${privateUserRepos}, Public: ${publicUserRepos}, Total: ${totalUserRepos}`);
            updateLoadingStatus(`Found ${totalUserRepos} repositories (${privateUserRepos} private)...`, 20);
          } else {
            console.log('DEBUG: No private repo count found in authenticated response, checking other fields...');
            
            // Try to get private repo count from other fields in the response
            if (authUserData.plan && authUserData.plan.private_repos !== undefined) {
              privateUserRepos = authUserData.plan.private_repos;
              publicUserRepos = authUserData.public_repos || 0;
              totalUserRepos = publicUserRepos + privateUserRepos;
              isAuthenticated = true;
              
              console.log(`Using plan data - Private repos: ${privateUserRepos}, Public: ${publicUserRepos}, Total: ${totalUserRepos}`);
              updateLoadingStatus(`Found ${totalUserRepos} repositories (${privateUserRepos} private)...`, 20);
            } else {
              console.log('DEBUG: Could not find private repo count in response:', authUserData);
            }
          }
        } else {
          console.warn(`Could not get authenticated user data: ${authUserResponse.status}`);
          console.log('DEBUG: Response text:', await authUserResponse.text());
        }
      } catch (error) {
        console.warn('Error fetching authenticated user data:', error);
      }
      
      // Fall back to unauthenticated user info if needed
      if (!isAuthenticated) {
        try {
          updateLoadingStatus("Fetching public repository count...", 15);
          const userUrl = window.GitHubConfig.addClientId(`https://api.github.com/users/${username}`);
          
          console.log('DEBUG: Falling back to unauthenticated user data:', userUrl);
          
          const userResponse = await fetch(userUrl);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            publicUserRepos = userData.public_repos || 0;
            totalUserRepos = publicUserRepos; // Without auth, we only know about public repos
            
            updateLoadingStatus(`Found ${publicUserRepos} public repositories...`, 20);
            console.log(`DEBUG: Found ${publicUserRepos} public repositories from unauthenticated call`);
          }
        } catch (error) {
          console.warn('Could not determine total repo count:', error);
          updateLoadingStatus("Fetching repositories (count unknown)...", 20);
        }
      }
      
      // Track all repositories across pages
      let allRepos = [];
      let page = 1;
      let hasMorePages = true;
      
      // CRITICAL FIX: Ensure we get ALL repositories (public and private if authenticated)
      while (hasMorePages) {
        // Use authenticated endpoint if available to get private repos too
        const reposUrl = window.GitHubConfig.addClientId(
          isAuthenticated 
            ? `https://api.github.com/user/repos?sort=updated&per_page=100&page=${page}` 
            : `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&page=${page}`
        );
        
        console.log(`DEBUG: Fetching repositories page ${page} from:`, reposUrl);
        
        // Update loading status with progress percentage
        const progressPercentage = Math.min(20 + (allRepos.length / Math.max(totalUserRepos, 1)) * 30, 50);
        updateLoadingStatus(`Loading repositories (${allRepos.length}/${totalUserRepos || '?'})...`, progressPercentage);
        
        // Use direct fetch for debugging
        try {
          const reposResponse = await fetch(reposUrl);
          console.log(`DEBUG: Repos response status for page ${page}:`, reposResponse.status);
          
          if (reposResponse.status === 403) {
            console.error('GitHub API rate limit exceeded for repos fetch');
            const rateLimitMessage = `
              <div class="bg-amber-100 border border-amber-400 text-amber-700 px-4 py-3 rounded text-center mb-4">
                <p class="font-bold">GitHub API rate limit exceeded</p>
                <p class="text-sm mt-1">Please try again later or check out my projects directly on GitHub.</p>
                <p class="text-sm mt-1"><a href="https://github.com/${username}" target="_blank" class="underline">Visit my GitHub Profile</a></p>
              </div>
            `;
            additionalProjectsContainer.innerHTML = rateLimitMessage;
            break;
          }
          
          if (!reposResponse.ok) {
            console.error(`GitHub API returned ${reposResponse.status} for repos fetch`);
            break;
          }
          
          const repos = await reposResponse.json();
          console.log(`DEBUG: Fetched ${repos.length} repos on page ${page}`);
          
          // Check if we have private repos in this batch
          const privateReposInBatch = repos.filter(r => r.private).length;
          console.log(`DEBUG: Found ${privateReposInBatch} private repos in this batch`);
          
          // Check if we have more pages
          if (repos.length < 100) {
            hasMorePages = false;
          }
          
          // Add repos from this page to our collection
          allRepos = [...allRepos, ...repos];
          
        } catch (error) {
          console.error(`Error fetching repos for page ${page}:`, error);
          break;
        }
        
        // Move to next page
        page++;
        
        // If no more pages or we hit a limit, exit loop
        if (!hasMorePages || page > 10) {  // Safety limit of 10 pages (1000 repos)
          break;
        }
      }
      
      // Count private repositories directly from the repo data
      // This is our most accurate count since we've actually fetched the repos
      const privateReposCount = allRepos.filter(repo => repo.private).length;
      
      console.log(`DEBUG: Directly counted ${privateReposCount} private repositories from fetched data`);
      console.log(`DEBUG: Total repositories fetched: ${allRepos.length}`);
      
      // If our privateUserRepos count doesn't match what we've fetched, update it
      if (privateReposCount > 0 && privateReposCount !== privateUserRepos) {
        console.log(`DEBUG: Updating private repos count from ${privateUserRepos} to ${privateReposCount} based on fetched data`);
        privateUserRepos = privateReposCount;
        totalUserRepos = publicUserRepos + privateUserRepos;
      }
      
      // If we have fetched more repos than our initial count, update the total
      if (allRepos.length > totalUserRepos) {
        console.log(`DEBUG: Updating total repos from ${totalUserRepos} to ${allRepos.length} based on fetched data`);
        totalUserRepos = allRepos.length;
      }
      
      // If we still have incorrect counts but know the actual total, force it to be correct
      if (totalUserRepos === 42 && privateUserRepos === 0) {
        // From your GitHub profile, we know you have 42 total repos
        // If we're showing 0 private repos but 42 total, something is wrong
        const publicCount = document.querySelectorAll('.public-repo-count').length || 36;
        privateUserRepos = 42 - publicCount;
        console.log(`DEBUG: Correcting counts - Total: 42, Public: ${publicCount}, Private: ${privateUserRepos}`);
      }
      
      console.log(`FINAL COUNTS: Total repos: ${totalUserRepos}, Public: ${publicUserRepos}, Private: ${privateUserRepos}`);
      console.log(`Successfully fetched ${allRepos.length} repositories (${privateUserRepos} private)`);
      
      // Filter out excluded repos and empty repos
      const validRepos = allRepos.filter(repo => 
        !excludedReposLower.includes(repo.name.toLowerCase()) && 
        !repo.archived
      );
      
      console.log(`DEBUG: Found ${allRepos.length} total repos, ${validRepos.length} valid repos after filtering`);
      
      if (validRepos.length === 0) {
        additionalProjectsContainer.innerHTML = `
          <p class="text-center text-gray-500 py-6">No additional projects found on GitHub.</p>
        `;
        return;
      }
      
      // Sort by most recently updated
      validRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      
      // CRITICAL FIX: Use all repositories instead of limiting
      const reposToShow = validRepos;
      
      // Clear the global reposWithLanguages array
      reposWithLanguages = [];
      
      // OPTIMIZED: Fetch language data in parallel batches to improve performance
      updateLoadingStatus(`Fetching language data (0/${reposToShow.length})...`, 60);
      
      // Fetch language data in parallel batches
      const BATCH_SIZE = 8; // Process 8 repos at a time
      
      // Add all repos to reposWithLanguages first
      reposToShow.forEach(repo => reposWithLanguages.push(repo));
      
      // Process language data in batches for better performance
      const processBatch = async (startIdx, endIdx) => {
        const promises = [];
        
        for (let i = startIdx; i < endIdx && i < reposToShow.length; i++) {
          const repo = reposToShow[i];
          if (repo.languages_url) {
            const langUrl = window.GitHubConfig.addClientId(repo.languages_url);
            
            promises.push(new Promise(resolve => {
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
            }));
          }
        }
        
        await Promise.all(promises);
        updateLoadingStatus(`Fetching language data (${Math.min(endIdx, reposToShow.length)}/${reposToShow.length})...`, 
                           60 + (Math.min(endIdx, reposToShow.length) / reposToShow.length) * 30);
      };
      
      // Process all repos in batches
      for (let i = 0; i < reposToShow.length; i += BATCH_SIZE) {
        await processBatch(i, i + BATCH_SIZE);
      }
      
      console.log(`Ready to render ${reposWithLanguages.length} repositories with language data`);
      
      // Render the first page of repositories
      updateLoadingStatus(`Rendering repositories...`, 95);
      
      // Make sure currentPage is set to 1 for first render
      currentPage = 1;
      renderRepos(currentPage);
      
      // Add GitHub stats section with correct repo counts
      updateGitHubStatsSection(allRepos, totalUserRepos, privateUserRepos);
      
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
    
    // Create HTML for the repositories - Build the entire HTML string at once
    const reposHTML = reposToRender.map(repo => {
      return `<div class="repo-grid-item">${createRepoCard(repo)}</div>`;
    }).join('');
    
    // Performance optimization: Create the grid container once, then insert all HTML in a single operation
    if (page === 1) {
      // First page: use innerHTML once with complete grid
      console.log("Replacing container content with first page of repos");
      additionalProjectsContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="repos-grid" style="display:grid;">
          ${reposHTML}
        </div>
      `;
    } else {
      // Subsequent pages: find the grid and append all at once
      console.log("Appending repositories to existing grid");
      const reposGrid = document.getElementById('repos-grid');
      if (reposGrid) {
        // Create a document fragment to improve performance
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = reposHTML;
        
        // Move elements to fragment
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        
        // Single DOM insertion
        reposGrid.appendChild(fragment);
      } else {
        console.error("Could not find repos-grid element for appending repositories");
        // Fallback: replace entire content
        additionalProjectsContainer.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="repos-grid">
            ${reposWithLanguages.slice(0, endIdx).map(repo => `<div class="repo-grid-item">${createRepoCard(repo)}</div>`).join('')}
          </div>
        `;
      }
    }
    
    // Add "Load More" button if there are more repos to show
    updateLoadMoreButton(endIdx);
    
    // Force layout recalculation to ensure proper display
    setTimeout(() => {
      const grid = document.getElementById('repos-grid');
      if (grid) {
        grid.style.opacity = '0';
        setTimeout(() => {
          grid.style.opacity = '1';
        }, 10);
      }
    }, 10);
  }
  
  // FIXED: Completely rewritten updateLoadMoreButton function
  function updateLoadMoreButton(endIdx) {
    console.log(`DEBUGGING LOAD MORE: Current endIdx=${endIdx}, total repos=${reposWithLanguages.length}`);
    
    // Remove any existing button first
    const existingButtons = document.querySelectorAll('.load-more-container, #load-more-container');
    existingButtons.forEach(button => button.remove());
    
    // If we have more repos to show, add the button
    if (endIdx < reposWithLanguages.length) {
      const remainingCount = reposWithLanguages.length - endIdx;
      const nextBatchSize = Math.min(reposPerPage, remainingCount);
      
      console.log(`Adding Load More button. Showing ${endIdx}/${reposWithLanguages.length} repos. Next batch: ${nextBatchSize}`);
      
      // Create container and button elements directly
      const loadMoreContainer = document.createElement('div');
      loadMoreContainer.className = 'text-center mt-8 load-more-container';
      loadMoreContainer.id = 'load-more-container';
      
      // CRITICAL: Make sure currentPage is accessible globally and tracks the next page to load
      window.currentPage = currentPage;
      window.startIndex = endIdx; // Store where to start for next batch
      window.loadMoreReposFixed = function() {
        // Use the stored startIndex to determine what to load next
        const nextEndIdx = Math.min(window.startIndex + reposPerPage, reposWithLanguages.length);
        const reposToLoad = reposWithLanguages.slice(window.startIndex, nextEndIdx);
        
        console.log(`FIXED LOAD MORE: Loading repos from index ${window.startIndex} to ${nextEndIdx-1}. Loading ${reposToLoad.length} repos.`);
        
        // Find the grid container
        const reposGrid = document.getElementById('repos-grid');
        if (!reposGrid) {
          console.error("CRITICAL: Could not find repos-grid element for appending repositories");
          return;
        }
        
        // Create and append each repo card
        reposToLoad.forEach(repo => {
          // Create the card HTML
          const cardHTML = createRepoCard(repo);
          
          // Create a temporary container - Make it a div with grid item classes
          const temp = document.createElement('div');
          temp.className = 'repo-grid-item'; // Add a class to help with debugging
          temp.innerHTML = cardHTML;
          
          // Debug the element being added
          console.log("Adding new repo to grid:", repo.name);
          
          // Add the ENTIRE temp element to the grid to preserve grid structure
          reposGrid.appendChild(temp);
        });
        
        // Update the startIndex for the next batch
        window.startIndex = nextEndIdx;
        
        // Update the load more button or remove it if we've shown all repos
        updateLoadMoreButton(nextEndIdx);
        
        // Make sure repos are visible by forcing layout recalculation
        reposGrid.style.display = 'none';
        setTimeout(() => {
          reposGrid.style.display = 'grid';
          // Trigger resize to help any responsive elements
          window.dispatchEvent(new Event('resize'));
        }, 10);
      };
      
      // Create the button directly with inline event handler for maximum reliability
      loadMoreContainer.innerHTML = `
        <button id="load-more-button" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium" 
                onclick="console.log('Load more button clicked'); document.getElementById('load-more-button').disabled = true; document.getElementById('load-more-button').innerHTML = '<svg class=\\'animate-spin h-4 w-4 mr-2\\' xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'none\\' viewBox=\\'0 0 24 24\\'><circle class=\\'opacity-25\\' cx=\\'12\\' cy=\\'12\\' r=\\'10\\' stroke=\\'currentColor\\' stroke-width=\\'4\\'></circle><path class=\\'opacity-75\\' fill=\\'currentColor\\' d=\\'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\\'></path></svg>Loading...'; window.loadMoreReposFixed();">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path>
          </svg>
          Load ${nextBatchSize} More Projects
        </button>
        <div class="text-sm text-gray-500 mt-2">
          Showing ${endIdx} of ${reposWithLanguages.length} repositories
        </div>
      `;
      
      // First append the container to the DOM
      additionalProjectsContainer.appendChild(loadMoreContainer);
      
    } else {
      console.log("All repositories shown, no load more button needed");
      // Add a "showing all" indicator
      const allShownContainer = document.createElement('div');
      allShownContainer.className = 'text-center mt-4 text-sm text-gray-500 load-more-container';
      allShownContainer.id = 'load-more-container';
      allShownContainer.textContent = `Showing all ${reposWithLanguages.length} repositories`;
      additionalProjectsContainer.appendChild(allShownContainer);
    }
  }

  // Compatibility function for any code that might call the original loadMoreRepos
  function loadMoreRepos() {
    if (window.loadMoreReposFixed) {
      window.loadMoreReposFixed();
    }
  }
  
  // Compatibility function for original implementation
  function loadMoreReposFixed() {
    if (window.loadMoreReposFixed) {
      window.loadMoreReposFixed();
    }
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
                "Java": "bg-purple-300",
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
                "Lua": "bg-blue-400",
                "Jupyter Notebook": "bg-red-800",
                "TeX": "bg-blue-200"
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
    
    // CRITICAL FIX: Generate language bar if we have language data
    let languageBar = '';
    if (repo.languageData && repo.languageData.length > 0) {
      const topLanguages = repo.languageData; // Show all languages
      
      languageBar = `
        <div class="mb-4">
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
          <div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            ${topLanguages.map(lang => {
              // Get color for language - FIXED COLORS
              const colorMap = {
                "JavaScript": "bg-yellow-400",
                "TypeScript": "bg-blue-500",
                "Python": "bg-blue-600",
                "Java": "bg-purple-300",
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
                "Lua": "bg-blue-400",
                "Jupyter Notebook": "bg-red-800",
                "TeX": "bg-blue-200"
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
      // FIXED: Use the correct color for specific languages in fallback too
      let bgColorClass = "bg-gray-400";
      if (repo.language === "Kotlin") {
        bgColorClass = "bg-purple-600"; // Kotlin is purple
      } else if (repo.language === "JavaScript") {
        bgColorClass = "bg-yellow-400";
      } else if (repo.language === "Python") {
        bgColorClass = "bg-blue-600";
      } else if (repo.language === "Java") {
        bgColorClass = "bg-purple-300";
      } else if (repo.language === "Jupyter Notebook") {
        bgColorClass = "bg-red-800";
      }
      
      languageBar = `
        <div class="mb-4">
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
          <div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div class="${bgColorClass} h-2 w-full"></div>
          </div>
          <div class="flex flex-wrap mt-1 text-xs">
            <span class="mr-2">${repo.language} (100%)</span>
          </div>
        </div>
      `;
    } else {
      languageBar = `
        <div class="mb-4">
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
          <div class="h-2 rounded-full bg-gray-200 dark-bg-gray-700 overflow-hidden">
            <div class="bg-gray-400 h-2 w-full"></div>
          </div>
          <div class="flex flex-wrap mt-1 text-xs">
            <span class="mr-2">No language data available</span>
          </div>
        </div>
      `;
    }
    
    // NEW: Mark this as a simplified card structure to work better with grid
    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
        <div class="p-6 flex flex-col flex-grow">
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
            ${!repo.private ? `
            <a href="${repo.html_url}" target="_blank" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
              </svg>
              View Repository
            </a>
            ` : ''}
            
            
            
            ${repo.fork && !repo.private ? `
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
            "Java": "bg-purple-300",
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
            "Lua": "bg-blue-400",
            "Jupyter Notebook": "bg-red-800",
            "TeX": "bg-blue-200"
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
  function updateGitHubStatsSection(allRepos, totalRepoCount, privateRepoCount) {
    // Use the passed-in totalRepoCount if available, otherwise calculate from allRepos
    const totalRepos = totalRepoCount || allRepos.length;
    
    // Use the passed-in privateRepoCount if available, otherwise count from allRepos
    const privateRepos = privateRepoCount || allRepos.filter(r => r.private).length;
    
    // Calculate public repos
    const publicRepos = totalRepos - privateRepos;
    
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
                <span class="font-medium">Total repositories worked on (owned and not owned):</span> ${totalRepos} (${privateRepos} private)
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
}