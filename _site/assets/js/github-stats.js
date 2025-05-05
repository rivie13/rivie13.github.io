/**
 * GitHub Stats Fetcher
 * Displays summary statistics about GitHub activity
 */

document.addEventListener('DOMContentLoaded', function() {
  const username = window.GitHubConfig.username;
  const statsContainer = document.getElementById('github-stats');
  
  if (!statsContainer) return; // Exit if container not found
  
  // Load stats from cache or fetch from API
  loadStats();
  
  function loadStats() {
    const cachedStats = localStorage.getItem('github_stats');
    const lastUpdated = localStorage.getItem('github_stats_last_updated');
    const now = new Date().getTime();
    
    // Use cached data if available and less than 1 hour old
    if (cachedStats && lastUpdated && (now - parseInt(lastUpdated) < 3600000)) {
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
      const response = await fetch(window.GitHubConfig.addClientId(
        `https://api.github.com/users/${username}`
      ));
      
      if (response.status === 403) {
        // Handle rate limiting
        statsContainer.innerHTML = `
          <div class="bg-amber-100 border border-amber-400 text-amber-700 p-3 rounded text-sm">
            <p><strong>GitHub API rate limit exceeded</strong></p>
            <p class="mt-1">Please try again later or view my stats directly on GitHub.</p>
          </div>
        `;
        return;
      }
      
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }
      
      const userData = await response.json();
      
      // Fetch repositories for more detailed information
      const reposResponse = await fetch(window.GitHubConfig.addClientId(
        `https://api.github.com/users/${username}/repos?per_page=100`
      ));
      const reposData = await reposResponse.json();
      
      // Calculate language statistics
      const languageStats = {};
      const topRepos = [];
      let totalStars = 0;
      let totalForks = 0;
      
      await Promise.all(reposData.map(async (repo) => {
        // Skip forked repositories for language stats
        if (!repo.fork) {
          try {
            const langResponse = await fetch(window.GitHubConfig.addClientId(repo.languages_url));
            if (langResponse.ok) {
              const langData = await langResponse.json();
              
              // Add language bytes to total
              for (const [lang, bytes] of Object.entries(langData)) {
                languageStats[lang] = (languageStats[lang] || 0) + bytes;
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch language data for ${repo.name}`);
          }
        }
        
        // Track stars and forks
        totalStars += repo.stargazers_count;
        totalForks += repo.forks_count;
        
        // Add to top repos if it has stars
        if (repo.stargazers_count > 0) {
          topRepos.push(repo);
        }
      }));
      
      // Sort repos by stars
      topRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
      
      // Calculate language percentages
      const totalBytes = Object.values(languageStats).reduce((a, b) => a + b, 0);
      const languages = Object.entries(languageStats)
        .map(([name, bytes]) => ({
          name,
          percentage: Math.round((bytes / totalBytes) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage);
      
      // Prepare stats object
      const stats = {
        followers: userData.followers,
        following: userData.following,
        public_repos: userData.public_repos,
        total_stars: totalStars,
        total_forks: totalForks,
        languages: languages.slice(0, 5), // Top 5 languages
        top_repos: topRepos.slice(0, 3), // Top 3 repos
        fetched_at: new Date().toISOString()
      };
      
      // Cache the results
      localStorage.setItem('github_stats', JSON.stringify(stats));
      localStorage.setItem('github_stats_last_updated', new Date().getTime().toString());
      
      displayStats(stats);
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      statsContainer.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
          <p>Failed to load GitHub stats. Please try again later.</p>
        </div>
      `;
    }
  }
  
  function displayStats(stats) {
    if (!stats) {
      statsContainer.innerHTML = '<p class="text-gray-500">No GitHub statistics available.</p>';
      return;
    }
    
    // Get the repository counts
    const publicRepos = stats.public_repos || 0;
    const privateRepos = 0; // GitHub API doesn't expose private repo count with client_id auth
    
    statsContainer.innerHTML = `
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
            <div class="space-y-4">
              ${stats.languages.map(lang => `
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="font-medium">${lang.name}</span>
                    <span class="text-sm text-gray-600 dark:text-gray-400">${lang.percentage}%</span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${lang.percentage}%"></div>
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
                  <div class="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    ${repo.stargazers_count} stars
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="text-gray-500">No repositories found.</p>
          `}
        </div>
      </div>
      
      <div class="mt-4 text-right">
        <a href="https://github.com/${username}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
          View Full Profile →
        </a>
      </div>
    `;
  }
});