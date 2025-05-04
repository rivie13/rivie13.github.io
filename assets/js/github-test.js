/**
 * GitHub API Test Script
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
  console.log('DOM loaded, initializing GitHub activity');
  testGitHubAPI();
}); 