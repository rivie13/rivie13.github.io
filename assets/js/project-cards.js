/**
 * Project Cards Enhancer
 * This script automatically adds the correct GitHub language statistics to project cards
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM Content Loaded - Starting language update");
  const username = window.GitHubConfig.username;
  
  // Project cards queue to process them one by one
  const projectQueue = [];
  let isProcessingQueue = false;
  
  // Map project slugs to their actual repository names
  const projectRepoMap = {
    'codegrind': ['codegrind'],
    'helios-swarm-robotics': ['robotics-nav2-slam-example', 'helios'],
    'bestnotes': ['01-bestnotes'],
    'projectile-launcher-rework': ['plr'],
    'book-player-application': ['assignment-10-rivie13']
  };
  
  // Wait for any RequestQueue initialization to complete
  setTimeout(() => {
    // Make sure we have the RequestQueue available from github-repos.js
    if (!window.RequestQueue) {
      console.error("RequestQueue not available. Creating local fallback.");
      window.RequestQueue = createFallbackQueue();
    }
    
    // Find all project cards in both featured and all projects sections
    console.log("Finding all project cards on the page");
    findAndProcessCards();
    
  }, 100);
  
  // Process next project in queue
  function processNextProject() {
    if (projectQueue.length === 0) {
      isProcessingQueue = false;
      return;
    }
    
    isProcessingQueue = true;
    const { id, repos, container } = projectQueue.shift();
    
    // First check if data is already cached by github-repos.js
    const cacheKey = `project_languages_${repos.join('_')}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    const now = Date.now();
    const cacheDuration = window.GitHubConfig ? window.GitHubConfig.cacheDuration : 24 * 60 * 60 * 1000;
    const forceRefresh = window.location.search.includes('force_refresh');
    
    if (!forceRefresh && cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < cacheDuration)) {
      console.log(`Using cached language data for: ${repos.join(', ')}`);
      const languages = JSON.parse(cachedData);
      updateLanguageBar(container, languages);
      
      // Wait before processing the next project to avoid too many UI updates at once
      setTimeout(processNextProject, 100);
      return;
    }
    
    // Use API for all projects with authentication
    updateLanguageData(username, repos, container, id).then(() => {
      // Wait a shorter time (500ms) before processing the next project
      setTimeout(processNextProject, 500);
    });
  }
  
  // Add project to queue for processing
  function queueProject(id, repos, container) {
    // Check if this container is already in the queue or has been processed
    if (container.dataset.languageProcessed === 'true') {
      console.log(`Container for ${id} already processed, skipping`);
      return;
    }
    
    // Mark container as being processed
    container.dataset.languageProcessed = 'true';
    
    projectQueue.push({ id, repos, container });
    
    if (!isProcessingQueue) {
      processNextProject();
    }
  }
  
  // Find all project cards and process them
  function findAndProcessCards() {
    // Track processed containers to avoid duplicates
    const processedContainers = new Set();
    
    // Find all project cards - include cards without specific IDs to catch featured cards
    const allProjectCards = document.querySelectorAll('.bg-white.dark\\:bg-gray-800.rounded-lg');
    
    allProjectCards.forEach(card => {
      // Find the project title to identify which project this is
      const titleElem = card.querySelector('h3');
      if (!titleElem) return;
      
      const titleText = titleElem.textContent.trim();
      let projectId = null;
      
      // Identify project by name
      if (titleText.includes('CodeGrind')) {
        projectId = 'codegrind';
      } else if (titleText.includes('Helios')) {
        projectId = 'helios-swarm-robotics';
      } else if (titleText.includes('BestNotes')) {
        projectId = 'bestnotes';
      } else if (titleText.includes('Projectile Launcher')) {
        projectId = 'projectile-launcher-rework';
      } else if (titleText.includes('Book Player')) {
        projectId = 'book-player-application';
      }
      
      if (!projectId || !projectRepoMap[projectId]) return;
      
      console.log(`Found project card for: ${projectId} with title "${titleText}"`);
      
      // SIMPLIFIED: Always look for the parent language container with class language-container,
      // NOT the inner .languages-container as that's what we'll be updating
      let languageContainer = card.querySelector('.language-container');
      
      // Fallback to other methods only if we don't find a dedicated container
      if (!languageContainer) {
        // Try looking for a language heading 
        const languageHeading = card.querySelector('.mb-4 h4');
        if (languageHeading && languageHeading.textContent.includes('LANGUAGE')) {
          languageContainer = languageHeading.closest('.mb-4');
        }
      }
      
      if (!languageContainer) {
        console.warn(`Could not find language container for ${projectId}`);
        return;
      }
      
      // Skip if this exact container has already been processed
      if (processedContainers.has(languageContainer)) {
        console.log(`Container for ${projectId} already processed, skipping`);
        return;
      }
      
      // Mark this container as processed
      processedContainers.add(languageContainer);
      
      // Initially show loading state
      showLanguageLoading(languageContainer);
      
      // Queue the project for processing
      queueProject(projectId, projectRepoMap[projectId], languageContainer);
    });
    
    // SIMPLIFIED: We ONLY need to look for cards with ID if we missed any
    // But we'll now look for the SAME container class as above
    document.querySelectorAll('[id*="codegrind"], [id*="helios"], [id*="bestnotes"], [id*="projectile"], [id*="book-player"]').forEach(card => {
      let projectId = null;
      
      if (card.id.includes('codegrind')) {
        projectId = 'codegrind';
      } else if (card.id.includes('helios')) {
        projectId = 'helios-swarm-robotics';
      } else if (card.id.includes('bestnotes')) {
        projectId = 'bestnotes';
      } else if (card.id.includes('projectile')) {
        projectId = 'projectile-launcher-rework';
      } else if (card.id.includes('book-player')) {
        projectId = 'book-player-application';
      }
      
      if (!projectId || !projectRepoMap[projectId]) return;
      
      // CONSISTENT: Always look for parent container, NOT the inner container
      let languageContainer = card.querySelector('.language-container');
      
      // Fallback only if needed
      if (!languageContainer) {
        const languageHeading = card.querySelector('.mb-4 h4');
        if (languageHeading && languageHeading.textContent.includes('LANGUAGE')) {
          languageContainer = languageHeading.closest('.mb-4');
        }
      }
      
      if (!languageContainer) return;
      
      // Skip if this exact container has already been processed
      if (processedContainers.has(languageContainer)) {
        console.log(`Container for ${projectId} already processed (by ID), skipping`);
        return;
      }
      
      console.log(`Found project card by ID: ${card.id} (${projectId})`);
      
      // Mark this container as processed
      processedContainers.add(languageContainer);
      
      // Initially show loading state
      showLanguageLoading(languageContainer);
      
      // Queue the project for processing
      queueProject(projectId, projectRepoMap[projectId], languageContainer);
    });
  }
  
  /**
   * Show loading state for language data
   */
  function showLanguageLoading(container) {
    // Find the inner languages-container
    let innerContainer = container.querySelector('.languages-container');
    
    // If container doesn't have an inner languages-container, it means it's the inner container itself
    if (!innerContainer) {
      innerContainer = container;
    }
    
    // Update only the inner container
    innerContainer.innerHTML = `
      <div class="text-center py-2">
        <div class="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full mx-auto mb-1"></div>
        <div class="text-xs text-gray-500">Loading language data...</div>
      </div>
    `;
  }
  
  /**
   * Fetch language data from multiple repos and update the container
   */
  async function updateLanguageData(username, repos, container, projectId) {
    try {
      // Check cache first
      const cacheKey = `project_languages_${repos.join('_')}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      const now = Date.now();
      const cacheDuration = window.GitHubConfig ? window.GitHubConfig.cacheDuration : 24 * 60 * 60 * 1000;
      const forceRefresh = window.location.search.includes('force_refresh');
      
      if (!forceRefresh && cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < cacheDuration)) {
        console.log(`Using cached language data for: ${repos.join(', ')}`);
        const languages = JSON.parse(cachedData);
        updateLanguageBar(container, languages);
        return;
      }
      
      // Combine data from multiple repos
      let combinedData = {};
      let isPrivate = false;
      let isFork = false;
      
      // First, check if any of the repos are private or forks
      for (const repo of repos) {
        try {
          const repoUrl = window.GitHubConfig ? 
            window.GitHubConfig.addClientId(`https://api.github.com/repos/${username}/${repo}`) :
            `https://api.github.com/repos/${username}/${repo}`;
          
          console.log(`DEBUG Cards - Getting repo metadata for ${repo}: ${repoUrl}`);
          
          // Use the global RequestQueueClient for proper authentication
          await new Promise(resolve => {
            window.RequestQueue.add(repoUrl, (response, data) => {
              if (response.ok) {
                if (data.private) {
                  isPrivate = true;
                  console.log(`Repo ${repo} is private`);
                }
                if (data.fork) {
                  isFork = true;
                  console.log(`Repo ${repo} is a fork`);
                }
              }
              resolve();
            });
          });
        } catch (err) {
          console.warn(`Failed to fetch repo metadata for ${repo}:`, err);
        }
      }
      
      if (isPrivate) {
        // For private repos, use authentication to get real data
        console.log(`Attempting to fetch language data for private repo(s): ${repos.join(', ')}`);
      }
      
      // Limit to only one API request at a time to reduce rate limiting
      for (const repo of repos) {
        try {
          const langUrl = window.GitHubConfig ? 
            window.GitHubConfig.addClientId(`https://api.github.com/repos/${username}/${repo}/languages`) :
            `https://api.github.com/repos/${username}/${repo}/languages`;
          
          console.log(`DEBUG Cards - Getting language data for ${repo}: ${langUrl}`);
          
          // Use the global RequestQueueClient for proper authentication
          await new Promise(resolve => {
            window.RequestQueue.add(langUrl, (response, data) => {
              if (response.ok) {
                // Add each language's bytes to the combined data
                for (const [lang, bytes] of Object.entries(data)) {
                  combinedData[lang] = (combinedData[lang] || 0) + bytes;
                }
                console.log(`Successfully fetched language data for ${repo}`);
              } else {
                console.warn(`Failed to fetch language data for ${repo}: ${response.status}`);
                if (response.status === 404) {
                  console.log(`Repo ${repo} not found`);
                } else if (response.status === 403) {
                  console.warn(`Rate limited for ${repo}. Using fallback.`);
                }
              }
              
              resolve();
            });
          });
          
        } catch (err) {
          console.warn(`Failed to fetch language data for ${repo}:`, err);
        }
      }
      
      // Calculate percentages
      const totalBytes = Object.values(combinedData).reduce((a, b) => a + b, 0);
      
      if (totalBytes === 0) {
        // No language data available, show appropriate fallback
        container.innerHTML = `
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
          <div class="flex flex-wrap">
            <span class="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">
              ${isPrivate ? 'Private repository - language data available via API' : 
                isFork ? 'Forked repository - language data not available' : 'No language data available'}
            </span>
          </div>
        `;
        return;
      }
      
      const languages = Object.entries(combinedData)
        .map(([name, bytes]) => ({
          name,
          percentage: Math.round((bytes / totalBytes) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage);
      
      // Cache the results
      try {
        localStorage.setItem(cacheKey, JSON.stringify(languages));
        localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
      } catch (e) {
        console.warn('Failed to cache language data:', e);
      }
      
      updateLanguageBar(container, languages);
      
      // Update fork/private status on the cards
      updateRepoStatus(projectId, isPrivate, isFork);
      
    } catch (error) {
      console.error('Error updating language data:', error);
      container.innerHTML = `
        <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">LANGUAGES</h4>
        <div class="text-xs text-gray-500 py-1">Failed to load language data</div>
      `;
    }
  }
  
  /**
   * Updates the language bar in the container
   */
  function updateLanguageBar(container, languages) {
    // Log the container we're updating to debug
    console.log("Updating language bar in container:", container);
    
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
    
    // Find the inner languages-container
    let innerContainer = container.querySelector('.languages-container');
    
    // If container doesn't have an inner languages-container, it means it's the inner container itself
    if (!innerContainer) {
      innerContainer = container;
    }
    
    // Generate the language bar HTML (without heading)
    let html = `<div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">`;
    
    // Add language bars
    languages.forEach(lang => {
      const bgClass = colorMap[lang.name] || "bg-gray-400";
      html += `<div class="${bgClass}" style="width: ${lang.percentage}%; height: 100%; float: left;" title="${lang.name}: ${lang.percentage}%"></div>`;
    });
    
    html += `</div>`;
    html += `<div class="flex flex-wrap mt-1 text-xs">`;
    
    // Add language text
    languages.forEach(lang => {
      html += `<span class="mr-2">${lang.name} (${lang.percentage}%)</span>`;
    });
    
    html += `</div>`;
    
    // Update only the inner container
    innerContainer.innerHTML = html;
  }
  
  /**
   * Update private/fork status on project cards
   */
  function updateRepoStatus(projectId, isPrivate, isFork) {
    if (!projectId) return;
    
    // Find all cards for this project
    const projectCards = document.querySelectorAll(`[id*="${projectId}"]`);
    
    projectCards.forEach(card => {
      const titleElem = card.querySelector('h3');
      if (!titleElem) return;
      
      // Check if status indicators already exist
      let privateIndicator = titleElem.querySelector('.private-indicator');
      let forkIndicator = titleElem.querySelector('.fork-indicator');
      
      // Create private indicator if needed
      if (isPrivate && !privateIndicator) {
        const indicator = document.createElement('span');
        indicator.className = 'private-indicator ml-2 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded';
        indicator.textContent = 'Private';
        titleElem.appendChild(indicator);
      }
      
      // Create fork indicator if needed
      if (isFork && !forkIndicator) {
        const indicator = document.createElement('span');
        indicator.className = 'fork-indicator ml-2 bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded';
        indicator.textContent = 'Fork';
        titleElem.appendChild(indicator);
      }
    });
  }
  
  /**
   * Create a fallback queue if RequestQueue isn't available from github-repos.js
   */
  function createFallbackQueue() {
    return {
      queue: [],
      running: false,
      maxConcurrent: 3,
      activeRequests: 0,
      
      add: function(url, callback) {
        this.queue.push({ url, callback });
        if (!this.running) {
          this.process();
        }
      },
      
      process: function() {
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
        
        fetch(url)
          .then(response => response.json().then(data => ({ response, data })))
          .then(({ response, data }) => {
            this.activeRequests--;
            callback(response, data);
            
            setTimeout(() => {
              this.processNext();
            }, 500);
          })
          .catch(error => {
            console.error(`Error fetching ${url}:`, error);
            this.activeRequests--;
            callback({ ok: false, status: 500 }, { message: error.message });
            
            setTimeout(() => {
              this.processNext();
            }, 500);
          });
      }
    };
  }
});