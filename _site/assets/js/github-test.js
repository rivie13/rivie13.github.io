/**
 * GitHub API Test Script
 * This script tests GitHub API authentication
 */

console.log('GitHub API test script loaded');

// Function to display debug results (only during development)
function displayDebugResults(container, message, isError = false) {
  // For debugging purposes only
  console.log(isError ? 'Error: ' : 'Success: ', message);
}

// Test function for GitHub API access
async function testGitHubAPI() {
  const activityContainer = document.getElementById('github-activity-feed');
  
  if (!activityContainer) {
    console.error('GitHub activity container not found: #github-activity-feed');
    return;
  }
  
  try {
    console.log('Attempting to fetch GitHub user data...');
    const response = await fetch('https://api.github.com/users/rivie13');
    
    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`);
    }
    
    const userData = await response.json();
    console.log('Successfully fetched user data');
    
    // Try to fetch events
    console.log('Attempting to fetch GitHub events...');
    const eventsResponse = await fetch('https://api.github.com/users/rivie13/events/public');
    
    if (!eventsResponse.ok) {
      throw new Error(`GitHub events API returned status ${eventsResponse.status}`);
    }
    
    const events = await eventsResponse.json();
    console.log(`Successfully fetched ${events.length} events`);
    
    if (events.length === 0) {
      displayDebugResults(activityContainer, 'GitHub API is accessible, but no events were found for this user.', false);
      activityContainer.innerHTML = '<p class="text-gray-500">No recent GitHub activity found.</p>';
      return;
    }
    
    // Automatically initialize the GitHub activity fetcher
    console.log('Initializing GitHub activity fetcher with events');
    new GitHubActivityFetcher('rivie13', '#github-activity-feed', { count: 5 });
    
  } catch (error) {
    console.error('Error testing GitHub API:', error);
    displayDebugResults(activityContainer, `Error accessing GitHub API: ${error.message}`, true);
    activityContainer.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Failed to load GitHub activities. Please try again later.
    </div>`;
  }
}

// Run the test when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("Running GitHub API authentication test...");
  
  // Test 1: Direct fetch with client_id
  const directUrl = `https://api.github.com/rate_limit?client_id=${window.GitHubConfig.clientId}`;
  
  console.log("TEST 1: Direct fetch with client_id");
  console.log(`URL: ${directUrl}`);
  
  fetch(directUrl)
    .then(response => {
      console.log("TEST 1 Response status:", response.status);
      console.log("TEST 1 Response headers:", {
        'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
        'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
        'x-ratelimit-used': response.headers.get('x-ratelimit-used')
      });
      return response.json();
    })
    .then(data => {
      console.log("TEST 1 Response data:", data);
    })
    .catch(error => {
      console.error("TEST 1 Error:", error);
    });
  
  // Test 2: Using GitHubConfig.addClientId
  const configUrl = window.GitHubConfig.addClientId('https://api.github.com/rate_limit');
  
  console.log("TEST 2: Using GitHubConfig.addClientId");
  console.log(`URL: ${configUrl}`);
  
  fetch(configUrl)
    .then(response => {
      console.log("TEST 2 Response status:", response.status);
      console.log("TEST 2 Response headers:", {
        'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
        'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
        'x-ratelimit-used': response.headers.get('x-ratelimit-used')
      });
      return response.json();
    })
    .then(data => {
      console.log("TEST 2 Response data:", data);
    })
    .catch(error => {
      console.error("TEST 2 Error:", error);
    });
    
  // Test 3: Using RequestQueue
  console.log("TEST 3: Using RequestQueue");
  window.RequestQueue.add(configUrl, (response, data) => {
    console.log("TEST 3 Response status:", response.status);
    console.log("TEST 3 Response data:", data);
  });
}); 