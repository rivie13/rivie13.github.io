/**
 * GitHub Stats Fetcher
 * Displays summary statistics about GitHub activity
 */

document.addEventListener('DOMContentLoaded', function() {
  const username = window.GitHubConfig.username;
  const statsContainer = document.getElementById('github-stats');
  
  if (!statsContainer) return; // Exit if container not found
  
  // Check for force refresh parameter in URL
  const forceRefresh = window.location.search.includes('force_refresh');
  
  // Clear cached data if force refresh is requested
  if (forceRefresh) {
    localStorage.removeItem('github_stats');
    localStorage.removeItem('github_stats_last_updated');
    console.log('Forced refresh of GitHub stats');
  }
  
  // Load stats from cache or fetch from API
  loadStats();
  
  function loadStats() {
    const cachedStats = localStorage.getItem('github_stats');
    const lastUpdated = localStorage.getItem('github_stats_last_updated');
    const now = new Date().getTime();
    
    // Use a shorter cache time (4 hours) to ensure fresher data
    if (cachedStats && lastUpdated && (now - parseInt(lastUpdated) < 14400000) && !forceRefresh) {
      displayStats(JSON.parse(cachedStats));
    } else {
      fetchStats();
    }
  }
  
  async function fetchStats() {
    try {
      statsContainer.innerHTML = `
        <div class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-sm text-gray-600">Fetching GitHub stats...</p>
        </div>
      `;
      
      // Use centralized config for GitHub API requests
      const userUrl = window.GitHubConfig.addClientId(
        `https://api.github.com/users/${username}`
      );
      
      // First, fetch basic user data
      const response = await fetch(userUrl);
      
      if (response.status === 403) {
        // Handle rate limiting with fallback data
        console.warn('GitHub API rate limit exceeded for user data. Using fallback.');
        displayFallbackStats();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }
      
      const userData = await response.json();
      
      // Create a basic stats object with user data
      const stats = {
        followers: userData.followers,
        following: userData.following,
        public_repos: userData.public_repos,
        total_stars: 0,
        total_forks: 0,
        languages: [],
        top_repos: [],
        fetched_at: new Date().toISOString()
      };
      
      // Try to enhance with repo data in a separate request
      try {
        // Fetch all repositories, sorted by recently pushed first
        const reposUrl = window.GitHubConfig.addClientId(
          `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed&direction=desc`
        );
        
        console.log('Fetching GitHub repos from:', reposUrl);
        const reposResponse = await fetch(reposUrl);
        
        if (reposResponse.status === 403) {
          console.warn('GitHub API rate limit exceeded for repos data.');
          // Still display basic stats and cache them
          localStorage.setItem('github_stats', JSON.stringify(stats));
          localStorage.setItem('github_stats_last_updated', new Date().getTime().toString());
          displayStats(stats);
          return;
        }
        
        if (!reposResponse.ok) {
          throw new Error(`GitHub API returned ${reposResponse.status} for repos fetch`);
        }
        
        const reposData = await reposResponse.json();
        console.log(`Fetched ${reposData.length} repositories`);
        
        // Update stats with repo data
        let totalStars = 0;
        let forksOfMyRepos = 0; // Forks others have made of your repos
        let myForksCount = 0;   // Number of repos you've forked from others
        
        // Track all repos by recent activity
        const activeRepos = [...reposData].sort((a, b) => {
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        });
        
        // Get the top 3 most recently active repositories
        stats.top_repos = activeRepos.slice(0, 3);
        
        // Calculate total stars and forks
        reposData.forEach(repo => {
          totalStars += repo.stargazers_count;
          
          // Count forks others have made of your original repos
          if (!repo.fork) {
            forksOfMyRepos += repo.forks_count;
          }
          
          // Count repos that are your forks of other repos
          if (repo.fork) {
            myForksCount++;
          }
        });
        
        stats.total_stars = totalStars;
        // Total forks = repos you've forked + repos others have forked from you
        stats.total_forks = myForksCount + forksOfMyRepos;
        
        // Now fetch language data for ALL repositories, including forks
        const languageTotals = {};
        const languagePromises = [];
        
        // Process all repos for language stats, including forks
        for (const repo of reposData) {
          if (repo.languages_url) {
            const languagePromise = fetch(window.GitHubConfig.addClientId(repo.languages_url))
              .then(response => {
                if (response.ok) {
                  return response.json();
                }
                return {};
              })
              .then(languageData => {
                // Add up language bytes
                for (const [language, bytes] of Object.entries(languageData)) {
                  if (!languageTotals[language]) {
                    languageTotals[language] = 0;
                  }
                  languageTotals[language] += bytes;
                }
              })
              .catch(error => {
                console.warn(`Failed to fetch language data for ${repo.name}:`, error);
              });
            
            languagePromises.push(languagePromise);
          }
        }
        
        // Wait for all language data to be collected
        await Promise.allSettled(languagePromises);
        
        // Convert language bytes to percentages
        const totalBytes = Object.values(languageTotals).reduce((sum, bytes) => sum + bytes, 0);
        if (totalBytes > 0) {
          stats.languages = Object.entries(languageTotals)
            .map(([language, bytes]) => ({
              name: language,
              percentage: Math.round((bytes / totalBytes) * 100)
            }))
            .filter(lang => lang.percentage > 0) // Only include languages with some percentage
            .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
            // No slice - include ALL languages
        }
        
        console.log('Language stats calculated:', stats.languages);
        console.log('Forks calculation - My forks:', myForksCount, 'Forks of my repos:', forksOfMyRepos, 'Total:', stats.total_forks);
        
        // Cache the enhanced stats
        localStorage.setItem('github_stats', JSON.stringify(stats));
        localStorage.setItem('github_stats_last_updated', new Date().getTime().toString());
        
        // Update the display with enhanced stats
        displayStats(stats);
      } catch (reposError) {
        console.error('Error fetching repository data:', reposError);
        // Still display and cache basic stats
        localStorage.setItem('github_stats', JSON.stringify(stats));
        localStorage.setItem('github_stats_last_updated', new Date().getTime().toString());
        displayStats(stats);
      }
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      displayFallbackStats();
    }
  }
  
  function displayFallbackStats() {
    // Display fallback stats when API fails
    const fallbackStats = {
      followers: 10,
      following: 20,
      public_repos: 15,
      total_stars: 25,
      total_forks: 10,
      languages: [
        { name: "Python", percentage: 35 },
        { name: "C#", percentage: 25 },
        { name: "JavaScript", percentage: 20 },
        { name: "Kotlin", percentage: 10 },
        { name: "TypeScript", percentage: 10 }
      ],
      top_repos: [
        { name: "Robotics-Nav2-SLAM-Example", html_url: `https://github.com/${username}/Robotics-Nav2-SLAM-Example`, stargazers_count: 10 },
        { name: "Helios", html_url: `https://github.com/${username}/Helios`, stargazers_count: 8 },
        { name: "CodeGrind", html_url: `https://github.com/${username}/codegrind`, stargazers_count: 7 }
      ]
    };
    
    statsContainer.innerHTML = `
      <div class="bg-amber-100 border border-amber-400 text-amber-700 p-3 rounded mb-4">
        <p><strong>GitHub API rate limit exceeded</strong></p>
        <p class="text-sm mt-1">Showing estimated statistics. Please try again later.</p>
      </div>
    `;
    
    displayStats(fallbackStats, true);
  }
  
  function displayStats(stats, isFallback = false) {
    if (!stats) {
      statsContainer.innerHTML = '<p class="text-gray-500">No GitHub statistics available.</p>';
      return;
    }
    
    // Get the repository counts
    const publicRepos = stats.public_repos || 0;
    const privateRepos = 0; // GitHub API doesn't expose private repo count with client_id auth
    
    // Create language colors mapping
    const languageColors = {
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
      "Lua": "bg-blue-400",
      "ASP.NET": "bg-green-500",
      "Vue": "bg-green-400"
    };
    
    // Create HTML structure
    let html = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- General Stats Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">General Stats</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Public Repositories</span>
              <span class="font-semibold">${publicRepos}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Total Stars</span>
              <span class="font-semibold">${stats.total_stars}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Total Forks</span>
              <span class="font-semibold">${stats.total_forks}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Followers</span>
              <span class="font-semibold">${stats.followers}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Following</span>
              <span class="font-semibold">${stats.following}</span>
            </div>
          </div>
        </div>
        
        <!-- Language Stats Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">Top Languages</h3>
          ${stats.languages && stats.languages.length > 0 ? `
            <div class="space-y-4" style="max-height: 300px; overflow-y: auto;">
              ${stats.languages.map(lang => `
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="font-medium">${lang.name}</span>
                    <span class="text-sm text-gray-600 dark:text-gray-400">${lang.percentage}%</span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="${languageColors[lang.name] || 'bg-blue-600'} h-2 rounded-full" style="width: ${lang.percentage}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="text-gray-500">No language data available.</p>
          `}
        </div>
        
        <!-- Top Repositories Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">Top Repositories</h3>
          ${stats.top_repos && stats.top_repos.length > 0 ? `
            <div class="space-y-4">
              ${stats.top_repos.map(repo => `
                <div class="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                  <a href="${repo.html_url}" target="_blank" class="font-medium hover:text-blue-600">${repo.name}</a>
                  <div class="text-sm text-gray-600 dark:text-gray-400 flex flex-col mt-1">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      ${repo.stargazers_count} stars
                    </div>
                    <div class="flex items-center mt-1">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                      </svg>
                      Updated ${new Date(repo.pushed_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="text-gray-500">No repositories found.</p>
          `}
        </div>
      </div>
    `;
    
    // Add refresh button and view profile link
    html += `
      <div class="mt-4 flex justify-between items-center">
        <button id="github-stats-refresh" class="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh Stats
        </button>
        <a href="https://github.com/${username}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
          View Full Profile →
        </a>
      </div>
      
      <div class="text-xs text-gray-500 mt-2 text-right">
        Last updated: ${new Date().toLocaleString()}
      </div>
    `;
    
    // Add to the container (prepend warning if using fallback)
    if (isFallback) {
      // Warning is already added in displayFallbackStats
      statsContainer.innerHTML += html;
    } else {
      statsContainer.innerHTML = html;
    }
    
    // Add event listener for refresh button
    const refreshButton = document.getElementById('github-stats-refresh');
    if (refreshButton) {
      refreshButton.addEventListener('click', function() {
        // Clear cache
        localStorage.removeItem('github_stats');
        localStorage.removeItem('github_stats_last_updated');
        // Show loading state
        this.innerHTML = `
          <svg class="animate-spin w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Refreshing...
        `;
        // Fetch new data
        fetchStats();
      });
    }
  }
});