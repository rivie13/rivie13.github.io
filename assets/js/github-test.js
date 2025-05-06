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

// Create a test div if it doesn't exist already
function createTestDiv() {
  if (!document.getElementById('github-api-test-results')) {
    const div = document.createElement('div');
    div.id = 'github-api-test-results';
    div.className = 'mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded';
    div.innerHTML = '<h3 class="text-lg font-semibold mb-2">GitHub API Test Results</h3><div id="github-test-content" class="text-sm"></div>';
    document.body.appendChild(div);
    return div.querySelector('#github-test-content');
  }
  return document.getElementById('github-test-content');
}

// Add a log entry to the test div
function logToTestDiv(message, isError = false) {
  const testDiv = createTestDiv();
  const logEntry = document.createElement('div');
  logEntry.className = isError ? 'text-red-600 mb-1' : 'text-green-600 mb-1';
  logEntry.innerHTML = message;
  testDiv.appendChild(logEntry);
  console.log(message);
}

// Function to check if URL is using the Azure Function
function isUsingAzureFunction(url) {
  return url.includes('portfoliowebsitegithubauth.azurewebsites.net');
}

// Run the test when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("Running GitHub API authentication test...");
  
  // Show results on page if URL has 'test' parameter
  const showResults = window.location.search.includes('test');
  
  if (showResults) {
    logToTestDiv("<strong>GitHub API Tests Running...</strong>");
    
    // Add a Clear Cache button at the top
    const clearCacheBtn = document.createElement('div');
    clearCacheBtn.className = 'mb-4 text-right';
    clearCacheBtn.innerHTML = `
      <button id="clear-github-cache" class="bg-red-600 text-white py-2 px-4 rounded shadow hover:bg-red-700 transition-colors">
        Clear GitHub Cache
      </button>
    `;
    document.getElementById('github-api-test-results').prepend(clearCacheBtn);
    
    // Add event listener to clear cache button
    document.getElementById('clear-github-cache').addEventListener('click', function() {
      const clearedCount = window.GitHubConfig.clearAllCaches();
      logToTestDiv(`<strong>Cleared ${clearedCount} cached items</strong>`);
      
      // Reload the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
    
    logToTestDiv("<strong>Azure Function Domain Check</strong>");
    
    // Verify all API paths are using Azure Function
    const endpoints = [
      'https://api.github.com/rate_limit',
      'https://api.github.com/users/rivie13',
      'https://api.github.com/users/rivie13/repos',
      'https://api.github.com/users/rivie13/events',
    ];
    
    endpoints.forEach(endpoint => {
      const proxiedUrl = window.GitHubConfig.addClientId(endpoint);
      const isUsingProxy = isUsingAzureFunction(proxiedUrl);
      
      logToTestDiv(`Endpoint: ${endpoint} → ${isUsingProxy ? 'Using Azure Function ✓' : 'Direct API Call ✗'} (${proxiedUrl})`, !isUsingProxy);
    });
  }
  
  // Test 1: Using GitHubConfig.addClientId (previously was direct fetch)
  const configUrl = window.GitHubConfig.addClientId('https://api.github.com/rate_limit');
  
  console.log("TEST 1: Using GitHubConfig.addClientId");
  console.log(`URL: ${configUrl}`);
  
  fetch(configUrl)
    .then(response => {
      console.log("TEST 1 Response status:", response.status);
      console.log("TEST 1 Response headers:", {
        'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
        'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
        'x-ratelimit-used': response.headers.get('x-ratelimit-used')
      });
      if (showResults) {
        logToTestDiv(`TEST 1 - Using Azure Function: <strong>${response.status === 200 ? 'SUCCESS' : 'FAIL'}</strong><br>
          Status: ${response.status}<br>
          Rate Limit: ${response.headers.get('x-ratelimit-remaining')}/${response.headers.get('x-ratelimit-limit')}
        `);
      }
      return response.json();
    })
    .then(data => {
      console.log("TEST 1 Response data:", data);
      if (data && data.resources && data.resources.core) {
        const limit = data.resources.core.limit;
        const remaining = data.resources.core.remaining;
        if (showResults) {
          logToTestDiv(`TEST 1 - Rate limits from response body: ${remaining}/${limit}`);
        }
      }
    })
    .catch(error => {
      console.error("TEST 1 Error:", error);
      if (showResults) {
        logToTestDiv(`TEST 1 - Error: ${error.message}`, true);
      }
    });
  
  // Test 2: Using GitHubConfig.addClientId with a different endpoint
  const reposUrl = window.GitHubConfig.addClientId('https://api.github.com/users/rivie13/repos?per_page=2');
  
  console.log("TEST 2: Using GitHubConfig.addClientId for repos");
  console.log(`URL: ${reposUrl}`);
  
  fetch(reposUrl)
    .then(response => {
      console.log("TEST 2 Response status:", response.status);
      console.log("TEST 2 Response headers:", {
        'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
        'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
        'x-ratelimit-used': response.headers.get('x-ratelimit-used')
      });
      if (showResults) {
        logToTestDiv(`TEST 2 - Using Azure Function for repos: <strong>${response.status === 200 ? 'SUCCESS' : 'FAIL'}</strong><br>
          Status: ${response.status}<br>
          Rate Limit Info: ${response.headers.get('x-ratelimit-remaining') || 'Not available'}/${response.headers.get('x-ratelimit-limit') || 'Not available'}
        `);
      }
      return response.json();
    })
    .then(data => {
      console.log("TEST 2 Response data:", data);
      if (showResults && Array.isArray(data)) {
        logToTestDiv(`TEST 2 - Fetched ${data.length} repositories`);
      }
    })
    .catch(error => {
      console.error("TEST 2 Error:", error);
      if (showResults) {
        logToTestDiv(`TEST 2 - Error: ${error.message}`, true);
      }
    });
    
  // Test 3: Using RequestQueue
  console.log("TEST 3: Using RequestQueue");
  window.RequestQueue.add(configUrl, (response, data) => {
    console.log("TEST 3 Response status:", response.status);
    console.log("TEST 3 Response data:", data);
    if (showResults) {
      if (response.ok) {
        logToTestDiv(`TEST 3 - Using RequestQueue: <strong>SUCCESS</strong><br>
          Status: ${response.status}
        `);
        
        // If we have data, show rate limit info
        if (data && data.resources && data.resources.core) {
          const limit = data.resources.core.limit;
          const remaining = data.resources.core.remaining;
          logToTestDiv(`TEST 3 - Rate limits: ${remaining}/${limit}`);
        }
      } else {
        logToTestDiv(`TEST 3 - Using RequestQueue: <strong>FAIL</strong><br>
          Status: ${response.status}
        `, true);
      }
    }
  });
  
  // Add a helper button to run tests - only show in dev mode
  if (!document.getElementById('github-api-test-button') && !showResults && window.location.hostname === '127.0.0.1' && window.location.port === '4000') {
    setTimeout(() => {
      const button = document.createElement('div');
      button.id = 'github-api-test-button';
      button.className = 'fixed bottom-4 right-4 z-50';
      button.innerHTML = `
        <a href="?test=true" class="bg-blue-600 text-white py-2 px-4 rounded shadow hover:bg-blue-700 transition-colors">
          Test GitHub API
        </a>
      `;
      document.body.appendChild(button);
    }, 1000);
  }
}); 