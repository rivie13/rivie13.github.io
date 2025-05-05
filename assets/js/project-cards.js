/**
 * Project Cards Enhancer
 * This script automatically adds the correct GitHub language statistics to project cards
 */

document.addEventListener('DOMContentLoaded', function() {
  const username = 'rivie13';
  
  // Hardcoded language data for specific projects
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
      { name: 'JavaScript', percentage: 93.3 },
      { name: 'CSS', percentage: 3.3 },
      { name: 'Python', percentage: 3.2 },
      { name: 'Other', percentage: 0.2 }
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
  
  // Handle CodeGrind card - override private repository message
  document.querySelectorAll('#codegrind').forEach(card => {
    // Find the private repository message
    const privateMessage = card.querySelector('.flex.flex-wrap span.bg-gray-100');
    if (privateMessage) {
      // Get the parent container
      const parentContainer = privateMessage.closest('.flex.flex-wrap').parentNode;
      if (parentContainer) {
        // Generate language bar HTML
        let languageHTML = createLanguageHTML(hardcodedLanguageData['codegrind']);
        
        // Replace the parent container's content
        parentContainer.innerHTML = languageHTML;
      }
    }
  });
  
  // Process all project cards for the targeted projects
  document.querySelectorAll('[id^="helios"], [id^="book-player"]').forEach(card => {
    let projectId;
    if (card.id.split('-')[0] === 'helios') {
      projectId = 'helios-swarm-robotics';
    } else if (card.id.split('-')[0] === 'book') {
      projectId = 'book-player-application';
    }
    
    // Get the language container
    const languageContainer = card.querySelector('.languages-container');
    if (!languageContainer) return;
    
    // Use hardcoded data
    if (hardcodedLanguageData[projectId]) {
      updateWithHardcodedData(languageContainer, hardcodedLanguageData[projectId]);
    }
  });
  
  // Process other project cards that need dynamic data
  document.querySelectorAll('[id^="bestnotes"], [id^="projectile"]').forEach(card => {
    const cardId = card.id.split('-')[0].toLowerCase();
    
    // Skip if it's a project with hardcoded data
    if (hardcodedLanguageData[cardId]) return;
    
    // Find the actual repo(s) for this project
    const repos = projectRepoMap[cardId] || [];
    if (!repos || repos.length === 0) return; // Skip private repos
    
    // Get the language container
    const languageContainer = card.querySelector('.languages-container');
    if (!languageContainer) return;
    
    // Fetch and combine language data from all repos
    updateLanguageData(username, repos, languageContainer);
  });
  
  /**
   * Create HTML for language bar
   */
  function createLanguageHTML(languages) {
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
    
    return languageHTML + languageTextHTML;
  }
  
  /**
   * Update language container with hardcoded data
   */
  function updateWithHardcodedData(container, languages) {
    container.innerHTML = createLanguageHTML(languages);
  }
  
  /**
   * Fetch language data from multiple repos and update the container
   */
  async function updateLanguageData(username, repos, container) {
    try {
      // Combine data from multiple repos
      let combinedData = {};
      
      for (const repo of repos) {
        try {
          const response = await fetch(`https://api.github.com/repos/${username}/${repo}/languages`);
          if (response.ok) {
            const data = await response.json();
            
            // Add each language's bytes to the combined data
            for (const [lang, bytes] of Object.entries(data)) {
              combinedData[lang] = (combinedData[lang] || 0) + bytes;
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch language data for ${repo}:`, err);
        }
      }
      
      // Calculate percentages
      const totalBytes = Object.values(combinedData).reduce((a, b) => a + b, 0);
      if (totalBytes === 0) return;
      
      const languages = Object.entries(combinedData)
        .map(([name, bytes]) => ({
          name,
          percentage: Math.round((bytes / totalBytes) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage);
      
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
      
    } catch (error) {
      console.error('Error updating language data:', error);
    }
  }
}); 