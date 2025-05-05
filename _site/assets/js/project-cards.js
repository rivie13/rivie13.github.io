/**
 * Project Cards Enhancer
 * This script automatically adds the correct GitHub language statistics to project cards
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM Content Loaded - Starting language update");
  const username = window.GitHubConfig.username;
  
  // EXPANDED: Hardcoded language data for ALL projects to avoid API calls completely
  const hardcodedLanguageData = {
    'helios-swarm-robotics': [
      { name: 'ASP.NET', percentage: 43 },
      { name: 'Python', percentage: 30 },
      { name: 'C#', percentage: 15 },
      { name: 'CMake', percentage: 5 },
      { name: 'C++', percentage: 3 },
      { name: 'Lua', percentage: 1 },
      { name: 'Dockerfile', percentage: 1 },
      { name: 'Other', percentage: 2 }
    ],
    'book-player-application': [
      { name: 'Kotlin', percentage: 100 }
    ],
    'codegrind': [
      { name: 'JavaScript', percentage: 48 },
      { name: 'Node.js', percentage: 30 },
      { name: 'React', percentage: 18 },
      { name: 'CSS', percentage: 4 }
    ],
    'bestnotes': [
      { name: 'JavaScript', percentage: 55 },
      { name: 'HTML', percentage: 25 },
      { name: 'CSS', percentage: 20 }
    ],
    'projectile-launcher-rework': [
      { name: 'Lua', percentage: 75 },
      { name: 'RedScript', percentage: 15 },
      { name: 'YAML', percentage: 10 }
    ]
  };
  
  // Map project slugs to their actual repository names
  const projectRepoMap = {
    'codegrind': null, // Private repository
    'helios-swarm-robotics': ['robotics-nav2-slam-example', 'helios'],
    'bestnotes': ['01-bestnotes'],
    'projectile-launcher-rework': ['plr'],
    'book-player-application': ['assignment-10-rivie13']
  };
  
  // Project cards queue to process them one by one
  const projectQueue = [];
  let isProcessingQueue = false;
  
  // Process next project in queue
  function processNextProject() {
    if (projectQueue.length === 0) {
      isProcessingQueue = false;
      return;
    }
    
    isProcessingQueue = true;
    const { id, repos, container } = projectQueue.shift();
    
    // Use hardcoded data if available
    if (hardcodedLanguageData[id]) {
      updateWithHardcodedData(container, hardcodedLanguageData[id]);
      // Wait 500ms before processing the next project to avoid rate limits
      setTimeout(processNextProject, 500);
    } else {
      // Use API for other projects
      updateLanguageData(username, repos, container).then(() => {
        // Wait 1s before processing the next project
        setTimeout(processNextProject, 1000);
      });
    }
  }
  
  // Add project to queue for processing
  function queueProject(id, repos, container) {
    projectQueue.push({ id, repos, container });
    
    if (!isProcessingQueue) {
      processNextProject();
    }
  }
  
  // AGGRESSIVE APPROACH - Find all Helios cards everywhere
  console.log("Finding all Helios cards on the page");
  
  // 1. Find any element containing Helios text
  document.querySelectorAll('*').forEach(element => {
    if (element.textContent && element.textContent.includes("Helios: Swarm Robotics")) {
      console.log("Found Helios text in:", element);
      
      // Try to find the card container
      let card = element;
      // Walk up to find the card container
      while (card && !card.classList.contains('bg-white') && !card.classList.contains('bg-gray-800')) {
        card = card.parentElement;
        if (!card) break;
      }
      
      if (card) {
        console.log("Found Helios card:", card);
        // Find language container in the card
        const languageContainer = card.querySelector('.languages-container');
        if (languageContainer) {
          console.log("Found language container:", languageContainer);
          updateWithHardcodedData(languageContainer, hardcodedLanguageData['helios-swarm-robotics']);
        } else {
          console.log("No language container found in card");
        }
      }
    }
  });
  
  // SPECIAL HANDLING FOR FEATURED PROJECTS SECTION
  // Get all project cards in the featured projects section
  const featuredSection = document.querySelector('section.mb-16');
  if (featuredSection) {
    console.log("Found featured section:", featuredSection);
    // Find all Helios cards in the featured section
    featuredSection.querySelectorAll('.languages-container').forEach(container => {
      // Check if this is a Helios card by examining nearby text
      const cardDiv = container.closest('.p-6');
      if (cardDiv && cardDiv.textContent.includes('Helios: Swarm Robotics')) {
        console.log("Found Helios language container in featured section:", container);
        updateWithHardcodedData(container, hardcodedLanguageData['helios-swarm-robotics']);
      } 
      else if (cardDiv && cardDiv.textContent.includes('Book Player Application')) {
        updateWithHardcodedData(container, hardcodedLanguageData['book-player-application']);
      }
    });
  } else {
    console.log("Featured section not found");
  }
  
  // Apply hardcoded data to ALL Helios and Book Player cards by ID
  document.querySelectorAll('[id*="helios"], [id*="book-player"]').forEach(card => {
    const projectId = card.id.includes('helios') ? 'helios-swarm-robotics' : 'book-player-application';
    console.log("Found card by ID:", card.id);
    
    // Get the language container
    const languageContainer = card.querySelector('.languages-container');
    if (!languageContainer) {
      console.log("No language container found in:", card.id);
      return;
    }
    
    // Use hardcoded data
    if (hardcodedLanguageData[projectId]) {
      console.log("Updating language container for:", projectId);
      updateWithHardcodedData(languageContainer, hardcodedLanguageData[projectId]);
    }
  });
  
  // Process other project cards that need dynamic data
  document.querySelectorAll('[id^="codegrind"], [id^="bestnotes"], [id^="projectile"]').forEach(card => {
    const cardId = card.id.split('-')[0].toLowerCase();
    
    // Skip if it's a project with hardcoded data
    if (hardcodedLanguageData[cardId]) return;
    
    // Find the actual repo(s) for this project
    const repos = projectRepoMap[cardId] || [];
    if (!repos || repos.length === 0) return; // Skip private repos
    
    // Get the language container
    const languageContainer = card.querySelector('.languages-container');
    if (!languageContainer) return;
    
    // Add to queue instead of immediate processing
    queueProject(cardId, repos, languageContainer);
  });
  
  /**
   * Update language container with hardcoded data
   */
  function updateWithHardcodedData(container, languages) {
    console.log("Updating container with languages:", languages);
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
      "Dockerfile": "bg-blue-700",
      "Other": "bg-gray-400"
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
    console.log("Container updated successfully");
  }
  
  /**
   * Fetch language data from multiple repos and update the container
   */
  async function updateLanguageData(username, repos, container) {
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
      const cacheDuration = 7 * 24 * 60 * 60 * 1000; // 7 days cache
      
      if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < cacheDuration)) {
        console.log(`Using cached language data for: ${repos.join(', ')}`);
        const languages = JSON.parse(cachedData);
        updateLanguageBar(container, languages);
        return;
      }
      
      // Combine data from multiple repos
      let combinedData = {};
      
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
              } else if (response.status === 403) {
                console.warn(`Rate limited for ${repo}. Using fallback.`);
                container.innerHTML = `<div class="text-xs text-gray-500 py-1">Language data unavailable (rate limited)</div>`;
                resolve();
                return;
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
        container.innerHTML = `<div class="text-xs text-gray-500 py-1">No language data available</div>`;
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
});