/**
 * GitHub Stats Fetcher
 * Fetches and displays GitHub statistics for a given username
 */

class GitHubStatsFetcher {
  constructor(username, containerSelector, options = {}) {
    this.username = username;
    this.container = document.querySelector(containerSelector);
    this.options = {
      cacheTime: options.cacheTime || 3600000, // Default: 1 hour in milliseconds
      showLanguages: options.showLanguages !== false,
      showStarCount: options.showStarCount !== false,
      showRepoCount: options.showRepoCount !== false,
      showContributions: options.showContributions !== false
    };
    
    this.cacheKey = `github_stats_${this.username}`;
    this.lastUpdatedKey = `github_stats_last_updated_${this.username}`;
    
    this.init();
  }
  
  /**
   * Initialize the fetcher
   */
  init() {
    if (!this.container) {
      console.error('GitHub Stats container not found');
      return;
    }
    
    this.loadStats();
  }
  
  /**
   * Load stats from cache or fetch from API
   */
  loadStats() {
    const cached = localStorage.getItem(this.cacheKey);
    const lastUpdated = localStorage.getItem(this.lastUpdatedKey);
    const now = new Date().getTime();
    
    if (cached && lastUpdated && (now - parseInt(lastUpdated) < this.options.cacheTime)) {
      // Use cached data if it's still valid
      this.displayStats(JSON.parse(cached));
    } else {
      // Fetch new data
      this.fetchStats();
    }
  }
  
  /**
   * Fetch stats from GitHub API
   */
  async fetchStats() {
    this.container.innerHTML = '<div class="flex justify-center py-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';
    
    try {
      // Fetch user profile data
      const profileResponse = await fetch(`https://api.github.com/users/${this.username}`);
      
      if (!profileResponse.ok) {
        throw new Error(`GitHub API returned ${profileResponse.status}`);
      }
      
      const profileData = await profileResponse.json();
      
      // Fetch repositories - use per_page=100 to get as many as possible
      const reposResponse = await fetch(`https://api.github.com/users/${this.username}/repos?per_page=100`);
      
      if (!reposResponse.ok) {
        throw new Error(`GitHub API returned ${reposResponse.status}`);
      }
      
      const reposData = await reposResponse.json();
      
      // Calculate stats
      const stats = this.calculateStats(profileData, reposData);
      
      // Cache the results
      localStorage.setItem(this.cacheKey, JSON.stringify(stats));
      localStorage.setItem(this.lastUpdatedKey, new Date().getTime().toString());
      
      this.displayStats(stats);
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      this.container.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to load GitHub statistics. Please try again later.
      </div>`;
    }
  }
  
  /**
   * Calculate various statistics from the fetched data
   */
  calculateStats(profile, repos) {
    // Count all repositories
    const ownRepos = repos.filter(repo => !repo.fork);
    const publicRepoCount = ownRepos.length;
    const totalRepoCount = profile.public_repos + profile.owned_private_repos;
    
    // Count stars
    const totalStars = repos.reduce((total, repo) => total + repo.stargazers_count, 0);
    
    // Count forks received
    const totalForks = repos.reduce((total, repo) => total + repo.forks_count, 0);
    
    // Calculate top languages
    const languages = {};
    repos.forEach(repo => {
      if (repo.language && !repo.fork) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    
    const topLanguages = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([language, count]) => ({
        name: language,
        count,
        percentage: Math.round((count / ownRepos.length) * 100)
      }));
    
    // Most starred repos
    const topRepos = [...repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3)
      .map(repo => ({
        name: repo.name,
        stars: repo.stargazers_count,
        url: repo.html_url
      }));
    
    return {
      profile: {
        name: profile.name || profile.login,
        login: profile.login,
        avatar_url: profile.avatar_url,
        html_url: profile.html_url,
        bio: profile.bio,
        public_repos: profile.public_repos,
        private_repos: profile.owned_private_repos || 0,
        total_repos: totalRepoCount,
        followers: profile.followers,
        following: profile.following
      },
      repos: {
        count: publicRepoCount,
        ownRepos: ownRepos.length,
        forkedRepos: repos.length - ownRepos.length,
        totalStars,
        totalForks,
        privateRepoCount: profile.owned_private_repos || 0,
        totalRepoCount: totalRepoCount
      },
      languages: topLanguages,
      topRepos
    };
  }
  
  /**
   * Display stats in the container
   */
  displayStats(stats) {
    if (!stats) {
      this.container.innerHTML = '<p class="text-gray-500">No GitHub statistics available.</p>';
      return;
    }
    
    const privateRepos = stats.profile.private_repos || 0;
    const totalRepos = stats.profile.total_repos || stats.profile.public_repos;
    
    this.container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- General Stats Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">General Stats</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Total Repositories</span>
              <span class="font-semibold">${totalRepos} (${privateRepos} private)</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Total Stars</span>
              <span class="font-semibold">${stats.repos.totalStars}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Total Forks</span>
              <span class="font-semibold">${stats.repos.totalForks}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Followers</span>
              <span class="font-semibold">${stats.profile.followers}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Following</span>
              <span class="font-semibold">${stats.profile.following}</span>
            </div>
          </div>
        </div>
        
        <!-- Language Stats Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">Top Languages</h3>
          ${stats.languages.length > 0 ? `
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
          ${stats.topRepos.length > 0 ? `
            <div class="space-y-4">
              ${stats.topRepos.map(repo => `
                <div class="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                  <a href="${repo.url}" target="_blank" class="font-medium hover:text-blue-600">${repo.name}</a>
                  <div class="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    ${repo.stars} stars
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
        <a href="https://github.com/${this.username}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
          View Full Profile →
        </a>
      </div>
    `;
  }
}

// Initialize GitHub stats fetcher when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const statsContainer = document.getElementById('github-stats');
  if (statsContainer) {
    new GitHubStatsFetcher('rivie13', '#github-stats', {
      cacheTime: 1800000 // 30 minutes to ensure more up-to-date data
    });
  }
});