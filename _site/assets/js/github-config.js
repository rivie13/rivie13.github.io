/**
 * GitHub Configuration
 * Central configuration for GitHub API access
 */

// GitHub username
const GITHUB_USERNAME = 'rivie13';

// Your function app URL - replace with your actual deployed function URL
const FUNCTION_APP_URL = 'https://portfoliowebsitegithubauth.azurewebsites.net/api/github';

// Export configuration
window.GitHubConfig = {
  username: GITHUB_USERNAME,
  cacheDuration: 24 * 60 * 60 * 1000, // 24 hours default cache duration (changed from 30 minutes)
  
  // Helper function to use the proxy for GitHub API requests
  addClientId: function(url) {
    // Special case for GraphQL API
    if (url === 'graphql') {
      return this.getGraphQLProxyUrl();
    }
    
    // Extract the path from the GitHub API URL
    const githubApiPrefix = 'https://api.github.com/';
    if (!url.startsWith(githubApiPrefix)) {
      console.warn('URL is not a GitHub API URL:', url);
      return url;
    }
    
    // Extract the path and query parts
    const urlObj = new URL(url);
    const path = url.substring(githubApiPrefix.length);
    
    // Remove any trailing query string from the path
    const pathWithoutQuery = path.split('?')[0];
    
    // Check if this is a topics request which needs special headers
    const isTopicsRequest = pathWithoutQuery.includes('/topics');
    
    // Check if this is an authenticated request (/user or /user/*) which needs special handling
    const isAuthRequest = pathWithoutQuery === 'user' || pathWithoutQuery.startsWith('user/');
    
    if (isAuthRequest) {
      console.log(`DEBUG CONFIG - Detected authenticated request: ${pathWithoutQuery}`);
    }
    
    // Build the new URL using the function app
    let result = `${FUNCTION_APP_URL}/${pathWithoutQuery}`;
    
    // Add any existing query parameters (except client_id)
    const params = new URLSearchParams();
    urlObj.searchParams.forEach((value, key) => {
      if (key !== 'client_id' && key !== 'client_secret') {
        params.append(key, value);
      }
    });
    
    // Add special headers for topics API
    if (isTopicsRequest) {
      params.append('accept', 'application/vnd.github.mercy-preview+json');
    }
    
    // Add authentication indicator for /user endpoints
    if (isAuthRequest) {
      params.append('auth_required', 'true');
    }
    
    // Add the query string if we have parameters
    const queryString = params.toString();
    if (queryString) {
      result += `?${queryString}`;
    }
    
    console.log(`DEBUG CONFIG - Original URL: ${url}`);
    console.log(`DEBUG CONFIG - Proxied URL: ${result}`);
    return result;
  },
  
  // Get the URL for GraphQL API proxy
  getGraphQLProxyUrl: function() {
    // NOTE: Current Azure Function setup doesn't support GraphQL correctly
    // When implementing GraphQL support, uncomment this code and remove the fallback
    
     const graphqlProxyUrl = `${FUNCTION_APP_URL}/graphql`;
     console.log(`DEBUG CONFIG - GraphQL proxy URL: ${graphqlProxyUrl}`);
     return graphqlProxyUrl;
    
    // Fallback to REST API until GraphQL is supported
    //console.warn('GraphQL API not currently supported by proxy. Using REST API fallback.');
    //return null;
  },
  
  // Make a GraphQL request (for future use when the proxy supports it)
  makeGraphQLRequest: async function(query, variables) {
    try {
      // Check if GraphQL proxy is available
      const proxyUrl = this.getGraphQLProxyUrl();
      
      // If no proxy URL, throw error to trigger fallback
      if (!proxyUrl) {
        throw new Error('GraphQL API proxy not available');
      }
      
      // Make the request
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        })
      });
      
      // Check for errors
      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status}`);
      }
      
      // Parse and return the response
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('GraphQL request failed:', error);
      throw error;
    }
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
  },
  
  // Clear all GitHub-related caches
  clearAllCaches: function() {
    console.log('Clearing all GitHub caches');
    const keysToRemove = [];
    
    // Find all GitHub-related localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
          key.startsWith('github_') || 
          key.includes('_github_') || 
          key.includes('github') || 
          key.endsWith('_timestamp')
        )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove the keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return keysToRemove.length;
  }
}; 