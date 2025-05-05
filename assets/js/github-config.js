/**
 * GitHub Configuration
 * Central configuration for GitHub API access
 */

// GitHub OAuth App Client ID for anonymous authentication
const GITHUB_CLIENT_ID = 'Ov23liPijHl3Hzp3NmO5'; // Replace with your actual client ID after creating OAuth App

// GitHub username
const GITHUB_USERNAME = 'rivie13';

// Export configuration
window.GitHubConfig = {
  clientId: GITHUB_CLIENT_ID,
  username: GITHUB_USERNAME,
  cacheDuration: 24 * 60 * 60 * 1000, // 24 hours default cache duration
  
  // Helper function to add client_id to any GitHub API URL
  addClientId: function(url) {
    const separator = url.includes('?') ? '&' : '?';
    const result = `${url}${separator}client_id=${this.clientId}`;
    console.log(`DEBUG CONFIG - Original URL: ${url}`);
    console.log(`DEBUG CONFIG - With client_id: ${result}`);
    return result;
  },

  // Get cached data or return null
  getCachedData: function(key) {
    const cachedData = localStorage.getItem(key);
    const cacheTimestamp = localStorage.getItem(`${key}_timestamp`);
    const now = Date.now();
    
    if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < this.cacheDuration)) {
      return JSON.parse(cachedData);
    }
    return null;
  },
  
  // Cache data with expiration
  cacheData: function(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(`${key}_timestamp`, Date.now().toString());
      return true;
    } catch (e) {
      console.warn('Failed to cache data:', e);
      return false;
    }
  }
}; 