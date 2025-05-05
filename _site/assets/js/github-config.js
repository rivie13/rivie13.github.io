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
  
  // Helper function to add client_id to any GitHub API URL
  addClientId: function(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}client_id=${this.clientId}`;
  }
}; 