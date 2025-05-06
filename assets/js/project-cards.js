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
    'codegrind': ['codegrind'], // Even though private, we'll try to fetch with auth
    'helios-swarm-robotics': ['robotics-nav2-slam-example', 'helios'],
    'bestnotes': ['01-bestnotes'],
    'projectile-launcher-rework': ['plr'],
    'book-player-application': ['assignment-10-rivie13']
  };
  
  // Process next project in queue
  function processNextProject() {
    if (projectQueue.length === 0) {
      isProcessingQueue = false;
      return;
    }
    
    isProcessingQueue = true;
    const { id, repos, container } = projectQueue.shift();
    
    // Use API for all projects
    updateLanguageData(username, repos, container, id).then(() => {
      // Wait 1s before processing the next project
      setTimeout(processNextProject, 1000);
    });
  }
  
  // Add project to queue for processing
  function queueProject(id, repos, container) {
    projectQueue.push({ id, repos, container });
    
    if (!isProcessingQueue) {
      processNextProject();
    }
  }
  
  // Find all project cards in both featured and all projects sections
  console.log("Finding all project cards on the page");
  
  // Get all language containers that need updating
  document.querySelectorAll('.languages-container').forEach(container => {
    // Find the project card by traversing up
    const card = container.closest('.p-6');
    if (!card) return;
    
    // Identify which project this is
    let projectId = null;
    
    // Check for common project names
    if (card.textContent.includes('CodeGrind')) {
      projectId = 'codegrind';
    } else if (card.textContent.includes('Helios')) {
      projectId = 'helios-swarm-robotics';
    } else if (card.textContent.includes('BestNotes')) {
      projectId = 'bestnotes';
    } else if (card.textContent.includes('Projectile Launcher')) {
      projectId = 'projectile-launcher-rework';
    } else if (card.textContent.includes('Book Player')) {
      projectId = 'book-player-application';
    }
    
    if (projectId && projectRepoMap[projectId]) {
      console.log(`Found project card for: ${projectId}`);
      queueProject(projectId, projectRepoMap[projectId], container);
    }
  });
  
  // Also check for cards by ID for special handling
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
    
    // Get the language container
    const languageContainer = card.querySelector('.languages-container');
    if (!languageContainer) return;
    
    console.log(`Found project card by ID: ${card.id} (${projectId})`);
    queueProject(projectId, projectRepoMap[projectId], languageContainer);
  });
  
  // Update last updated timestamps for all repos
  updateLastUpdatedTimestamps();
  
  /**
   * Fetch language data from multiple repos and update the container
   */
  async function updateLanguageData(username, repos, container, projectId) {
    try {
      // Display loading state
      container.innerHTML = `
        <div class="text-center py-2">
          <div class="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full mx-auto mb-1"></div>
          <div class="text-xs text-gray-500">Loading language data...</div>
        </div>
      `;
      
      // Check cache first
      const cacheKey = `project_languages_${repos.join('_')}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      const now = Date.now();
      const cacheDuration = 30 * 60 * 1000; // Reduced to 30 minutes for development
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
          const repoUrl = window.GitHubConfig.addClientId(
            `https://api.github.com/repos/${username}/${repo}`
          );
          
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
        // For private repos, we still try to fetch language data with auth
        console.log(`Attempting to fetch language data for private repo(s): ${repos.join(', ')}`);
      }
      
      // Limit to only one API request at a time to reduce rate limiting
      for (const repo of repos) {
        try {
          const langUrl = window.GitHubConfig.addClientId(
            `https://api.github.com/repos/${username}/${repo}/languages`
          );
          
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
        if (isPrivate) {
          container.innerHTML = `
            <div class="flex flex-wrap">
              <span class="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">
                Private repository - language data not available
              </span>
            </div>
          `;
        } else if (isFork) {
          container.innerHTML = `
            <div class="flex flex-wrap">
              <span class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">
                Forked repository - language data not available
              </span>
            </div>
          `;
        } else {
          container.innerHTML = `
            <div class="flex flex-wrap">
              <span class="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">
                No language data available
              </span>
            </div>
          `;
        }
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
      container.innerHTML = `<div class="text-xs text-gray-500 py-1">Failed to load language data</div>`;
    }
  }
  
  /**
   * Updates the language bar in the container
   */
  function updateLanguageBar(container, languages) {
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
      "XML": "bg-orange-300"
    };
    
    let languageHTML = `<div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">`;
    let languageTextHTML = `<div class="flex flex-wrap mt-1 text-xs">`;
    
    languages.forEach(lang => {
      const bgClass = colorMap[lang.name] || "bg-gray-400";
      languageHTML += `<div class="${bgClass}" style="width: ${lang.percentage}%; height: 100%; float: left;" title="${lang.name}: ${lang.percentage}%"></div>`;
      languageTextHTML += `<span class="mr-2">${lang.name} (${lang.percentage}%)</span>`;
    });
    
    languageHTML += `</div>`;
    languageTextHTML += `</div>`;
    
    // Update the container
    container.innerHTML = languageHTML + languageTextHTML;
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
   * Update last updated timestamps for all repos
   */
  function updateLastUpdatedTimestamps() {
    // Get all elements with the data-github-last-updated attribute
    const timestampElements = document.querySelectorAll('[data-github-last-updated]');
    
    timestampElements.forEach(element => {
      const projectId = element.getAttribute('data-github-last-updated');
      if (!projectId || !projectRepoMap[projectId]) return;
      
      // Get the repos for this project
      const repos = projectRepoMap[projectId];
      if (!repos || repos.length === 0) return;
      
      // Take the first repo to get the timestamp
      const repo = repos[0];
      
      // Get the last updated timestamp
      const repoUrl = window.GitHubConfig.addClientId(
        `https://api.github.com/repos/${username}/${repo}`
      );
      
      window.RequestQueue.add(repoUrl, (response, data) => {
        if (response.ok && data.updated_at) {
          // Format the date
          const updatedDate = new Date(data.updated_at);
          const formattedDate = updatedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          // Update the element
          element.textContent = `Last updated: ${formattedDate}`;
          
          // Add additional GitHub stats if available
          if (data.stargazers_count || data.forks_count || data.open_issues_count) {
            const statsContainer = document.createElement('div');
            statsContainer.className = 'mt-2 text-sm text-gray-500';
            
            let statsHTML = '';
            
            if (data.stargazers_count) {
              statsHTML += `<span class="mr-3"><svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>${data.stargazers_count} ${data.stargazers_count === 1 ? 'star' : 'stars'}</span>`;
            }
            
            if (data.forks_count) {
              statsHTML += `<span class="mr-3"><svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
              </svg>${data.forks_count} ${data.forks_count === 1 ? 'fork' : 'forks'}</span>`;
            }
            
            if (data.open_issues_count) {
              statsHTML += `<span><svg class="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
              </svg>${data.open_issues_count} ${data.open_issues_count === 1 ? 'issue' : 'issues'}</span>`;
            }
            
            if (statsHTML) {
              statsContainer.innerHTML = statsHTML;
              element.parentNode.appendChild(statsContainer);
            }
          }
        } else {
          element.textContent = "Last updated: Unknown";
        }
      });
    });
  }
});