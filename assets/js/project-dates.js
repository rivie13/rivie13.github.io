/**
 * Project Dates Manager
 * Fetches real last push dates from GitHub API and enables dynamic sorting
 */

window.ProjectDates = {
  username: null,
  dates: {},
  initialized: false,
  
  /**
   * Initialize the date fetcher
   */
  init: function(username) {
    this.username = username;
    console.log('ProjectDates: Initialized for user:', username);
  },
  
  /**
   * Fetch repository metadata including pushed_at date
   */
  fetchRepoData: async function(repoName) {
    const cacheKey = `repo_data_${repoName}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    const now = Date.now();
    const cacheDuration = 4 * 60 * 60 * 1000; // 4 hours cache
    
    // Check cache first
    if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < cacheDuration)) {
      console.log(`Using cached repo data for: ${repoName}`);
      return JSON.parse(cachedData);
    }
    
    // Fetch from GitHub API with authentication
    let url = `https://api.github.com/repos/${this.username}/${repoName}`;
    
    // Add authentication if available (needed for private repos)
    if (window.GitHubConfig && window.GitHubConfig.addClientId) {
      url = window.GitHubConfig.addClientId(url);
    }
    
    return new Promise((resolve, reject) => {
      // Use RequestQueue if available, otherwise fetch directly
      if (window.RequestQueue) {
        window.RequestQueue.add(url, (response, data) => {
          if (response.ok) {
            // Cache the data
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
            console.log(`✅ Successfully fetched and cached repo data for ${repoName}`);
            resolve(data);
          } else {
            console.error(`❌ Failed to fetch repo data for ${repoName}: HTTP ${response.status}`);
            reject(new Error(`HTTP ${response.status}`));
          }
        });
      } else {
        // Fallback to direct fetch
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            // Cache the data
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
            resolve(data);
          })
          .catch(error => {
            console.error(`Failed to fetch repo data for ${repoName}:`, error);
            reject(error);
          });
      }
    });
  },
  
  /**
   * Extract repository name from GitHub URL
   */
  extractRepoName: function(githubUrl) {
    if (!githubUrl) return null;
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    return match ? match[2] : null;
  },
  
  /**
   * Get last push date for a project (handles multiple repos)
   */
  getProjectDate: async function(projectElement) {
    const projectTitle = projectElement.querySelector('h3')?.textContent || 'Unknown';
    
    // Find all GitHub links in the project card (including hidden ones)
    const githubLinks = projectElement.querySelectorAll('a[href*="github.com"]');
    
    if (githubLinks.length === 0) {
      console.warn(`⚠️ No GitHub links found for project: ${projectTitle}`);
      return null;
    }
    
    console.log(`🔍 Found ${githubLinks.length} GitHub link(s) for ${projectTitle}`);
    
    const dates = [];
    
    // Fetch dates for all repos in this project
    for (const link of githubLinks) {
      const repoName = this.extractRepoName(link.href);
      if (!repoName) {
        console.warn(`⚠️ Could not extract repo name from: ${link.href}`);
        continue;
      }
      
      console.log(`📡 Fetching date for ${projectTitle} → ${repoName}...`);
      
      try {
        const repoData = await this.fetchRepoData(repoName);
        if (repoData && repoData.pushed_at) {
          dates.push(new Date(repoData.pushed_at));
          console.log(`✅ ${projectTitle} (${repoName}): ${repoData.pushed_at}`);
        } else {
          console.warn(`⚠️ No pushed_at date in response for ${repoName}`);
        }
      } catch (error) {
        console.error(`❌ Error fetching date for ${projectTitle} (${repoName}):`, error.message);
      }
    }
    
    // Return the most recent date if multiple repos
    if (dates.length === 0) {
      console.warn(`⚠️ No valid dates found for ${projectTitle}`);
      return null;
    }
    
    const mostRecentDate = new Date(Math.max(...dates));
    console.log(`📅 Most recent date for ${projectTitle}: ${mostRecentDate.toISOString().split('T')[0]}`);
    return mostRecentDate;
  },
  
  /**
   * Sort project elements by their GitHub push dates
   * Combines YAML projects and GitHub-fetched projects into unified list
   */
  sortProjects: async function(containerSelector, additionalProjectsSelector = '#additional-projects') {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error('Container not found:', containerSelector);
      return;
    }
    
    // Find YAML project cards (from projects.yml)
    // These are direct children with the wrapper div
    const yamlProjectCards = Array.from(container.children).filter(child => {
      // Make sure we're getting the actual project card wrappers
      return child.querySelector('.project-card-link') || child.querySelector('h3');
    });
    console.log(`Found ${yamlProjectCards.length} YAML projects`);
    
    // Wait for GitHub projects to load (poll for up to 5 seconds max)
    let githubProjectCards = [];
    const additionalContainer = document.querySelector(additionalProjectsSelector);
    
    if (additionalContainer) {
      console.log('Waiting for GitHub projects to load...');
      for (let i = 0; i < 10; i++) {
        // Look for project card wrappers in additional container
        const cards = additionalContainer.querySelectorAll('div[class*="opacity"]');
        if (cards.length > 0) {
          githubProjectCards = Array.from(cards).filter(card => {
            return card.querySelector('.project-card-link') || card.querySelector('h3');
          });
          console.log(`Found ${githubProjectCards.length} GitHub-fetched projects`);
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // If no GitHub projects after 5 seconds, continue with just YAML projects
      if (githubProjectCards.length === 0) {
        console.log('No GitHub projects loaded, continuing with YAML projects only');
      }
    }
    
    // Combine all projects
    const allProjects = [...yamlProjectCards, ...githubProjectCards];
    
    if (allProjects.length === 0) {
      console.log('No project cards found to sort');
      return;
    }
    
    console.log(`Sorting ${allProjects.length} total projects (${yamlProjectCards.length} YAML + ${githubProjectCards.length} GitHub)`);
    
    // Fetch dates for all projects
    const projectsWithDates = await Promise.all(
      allProjects.map(async (card) => {
        const title = card.querySelector('h3')?.textContent || 'Unknown';
        console.log(`Fetching date for: ${title}`);
        const date = await this.getProjectDate(card);
        return {
          element: card,
          date: date,
          timestamp: date ? date.getTime() : 0,
          title: title
        };
      })
    );
    
    // Sort by date (most recent first), projects without dates go to end
    projectsWithDates.sort((a, b) => {
      if (a.timestamp === 0 && b.timestamp === 0) return 0;
      if (a.timestamp === 0) return 1;
      if (b.timestamp === 0) return -1;
      return b.timestamp - a.timestamp;
    });
    
    console.log('Sorted projects by date:');
    projectsWithDates.forEach(p => {
      const dateStr = p.date ? p.date.toISOString().split('T')[0] : 'No date';
      console.log(`  ${p.title}: ${dateStr}`);
    });
    
    // Clear both containers
    container.innerHTML = '';
    if (additionalContainer && githubProjectCards.length > 0) {
      additionalContainer.innerHTML = '';
    }
    
    // Add all projects to main container in sorted order
    projectsWithDates.forEach(({ element }) => {
      // Ensure the wrapper div maintains its styling
      if (!element.classList.contains('opacity-0')) {
        element.classList.add('opacity-0');
      }
      container.appendChild(element);
    });
    
    console.log('All projects merged and sorted in main container');
  }
};

// Auto-initialize when GitHubConfig is available
document.addEventListener('DOMContentLoaded', function() {
  if (window.GitHubConfig && window.GitHubConfig.username) {
    window.ProjectDates.init(window.GitHubConfig.username);
  }
});
