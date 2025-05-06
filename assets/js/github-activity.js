/**
 * GitHub Activity Fetcher
 * Fetches and displays GitHub activity for a given username
 */

// RequestQueueClient - Use shared RequestQueue object from github-repos.js
// to avoid duplicate declarations
const RequestQueueClient = {
  add: function(url, callback) {
    // Check if RequestQueue exists in global scope, otherwise fetch directly
    if (window.RequestQueue) {
      window.RequestQueue.add(url, callback);
    } else {
      fetch(url)
        .then(response => {
          return response.json().then(data => ({ response, data }));
        })
        .then(({ response, data }) => {
          callback(response, data);
        })
        .catch(error => {
          callback({ ok: false, status: 500 }, { message: error.message });
        });
    }
  }
};

class GitHubActivityFetcher {
  constructor(username, containerSelector, options = {}) {
    this.username = username || window.GitHubConfig.username;
    this.container = document.querySelector(containerSelector);
    this.options = {
      count: options.count || 15, // Increased from 10 to 15
      cacheTime: options.cacheTime || 300000, // 5 minutes (decreased from 30 minutes)
      filterEvents: options.filterEvents || ['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssuesEvent', 'ReleaseEvent', 'ForkEvent', 'WatchEvent', 'PublicEvent', 'CommitCommentEvent', 'IssueCommentEvent', 'PullRequestReviewEvent']
    };
    
    this.cacheKey = `github_activity_${this.username}`;
    this.lastUpdatedKey = `github_activity_last_updated_${this.username}`;
    
    this.init();
  }
  
  /**
   * Initialize the fetcher
   */
  init() {
    if (!this.container) {
      console.error('GitHub Activity container not found');
      return;
    }
    
    // Very short cache time to keep data fresh
    this.options.cacheTime = 5 * 60 * 1000; // 5 minutes
    
    // Always fetch fresh data first, fall back to cache if needed
    this.fetchActivities();
  }
  
  /**
   * Load activities from cache or fetch from API
   */
  loadActivities() {
    // Immediately try to fetch fresh data
    this.fetchActivities();
  }
  
  /**
   * Fetch activities from GitHub API
   */
  async fetchActivities(isBackgroundFetch = false, forceClearCache = false) {
    try {
      // Clear cache if forced
      if (forceClearCache) {
        console.log('Clearing GitHub activity cache');
        localStorage.removeItem(this.cacheKey);
        localStorage.removeItem(`${this.cacheKey}_timestamp`);
      }
      
      // Display loading state if not a background fetch
      if (!isBackgroundFetch) {
        this.container.innerHTML = `
          <div class="text-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-2 text-sm text-gray-600" id="activity-loading-status">Loading GitHub activity...</p>
          </div>
        `;
      }
      
      // Use the centralized GitHub config to add client_id - use the Azure Function
      // Get the latest events with a higher per_page limit to ensure we get all recent activity
      const eventsUrl = window.GitHubConfig.addClientId(
        `https://api.github.com/users/${this.username}/events?per_page=${this.options.count * 2}`
      );
      
      console.log('Fetching fresh GitHub activity from:', eventsUrl);
      
      // Add a timestamp parameter to bypass browser cache
      const noCacheUrl = eventsUrl + (eventsUrl.includes('?') ? '&' : '?') + '_nocache=' + Date.now();
      
      // Update loading message
      if (!isBackgroundFetch) {
        const loadingStatus = document.getElementById('activity-loading-status');
        if (loadingStatus) {
          loadingStatus.textContent = "Fetching activity data from GitHub...";
        }
      }
      
      // Use RequestQueueClient instead of direct fetch
      await new Promise(resolve => {
        RequestQueueClient.add(noCacheUrl, async (response, events) => {
          if (response.status === 403) {
            // Handle rate limiting - try to load from cache
            console.warn('GitHub API rate limit exceeded for activity data. Using cache or fallback.');
            const cachedActivity = window.GitHubConfig.getCachedData(this.cacheKey);
            
            if (cachedActivity) {
              console.log('Using cached GitHub activity data');
              this.displayActivities(cachedActivity);
            } else {
              if (!isBackgroundFetch) this.displayFallbackActivities();
            }
            
            resolve();
            return;
          }
          
          if (!response.ok) {
            console.error(`GitHub API returned ${response.status}`);
            
            // Try to load from cache if available
            const cachedActivity = window.GitHubConfig.getCachedData(this.cacheKey);
            
            if (cachedActivity) {
              console.log('Using cached GitHub activity data due to API error');
              this.displayActivities(cachedActivity);
            } else {
              if (!isBackgroundFetch) this.displayFallbackActivities();
            }
            
            resolve();
            return;
          }
          
          console.log(`Fetched ${events.length} GitHub events`);
          
          // Update loading message
          if (!isBackgroundFetch) {
            const loadingStatus = document.getElementById('activity-loading-status');
            if (loadingStatus) {
              loadingStatus.textContent = `Processing ${events.length} activity events...`;
            }
          }
          
          // Filter events based on preferences - include more event types
          const filteredEvents = events.filter(event => 
            this.options.filterEvents.includes(event.type)
          ).slice(0, this.options.count);
          
          // Cache the results
          window.GitHubConfig.cacheData(this.cacheKey, filteredEvents);
          
          if (!isBackgroundFetch) {
            this.displayActivities(filteredEvents);
          }
          resolve();
        });
      });
    } catch (error) {
      console.error('Error fetching GitHub activity:', error);
      
      // Try to load from cache if available
      const cachedActivity = window.GitHubConfig.getCachedData(this.cacheKey);
      
      if (cachedActivity) {
        console.log('Using cached GitHub activity data due to error');
        this.displayActivities(cachedActivity);
      } else {
        if (!isBackgroundFetch) this.displayFallbackActivities();
      }
    }
  }
  
  displayFallbackActivities() {
    // Create sample fallback activities
    const fallbackActivities = [
      {
        type: 'PushEvent',
        repo: { name: `${this.username}/rivie13.github.io` },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        payload: { 
          commits: [{ message: 'Updated portfolio website content' }],
          ref: 'refs/heads/main'
        }
      },
      {
        type: 'CreateEvent',
        repo: { name: `${this.username}/helios` },
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        payload: { ref_type: 'branch', ref: 'feature/swarm-ui' }
      },
      {
        type: 'PullRequestEvent',
        repo: { name: `${this.username}/codegrind` },
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        payload: { 
          action: 'opened',
          pull_request: { 
            title: 'Add new AI code inspection feature', 
            html_url: `https://github.com/${this.username}/codegrind/pull/1`
          }
        }
      }
    ];
    
    // Show a warning about rate limit
    this.container.innerHTML = `
      <div class="bg-amber-100 border border-amber-400 text-amber-700 p-3 rounded mb-4">
        <p><strong>GitHub API rate limit exceeded</strong></p>
        <p class="text-sm mt-1">Showing sample activities. Please try again later.</p>
      </div>
    `;
    
    // Display the fallback activities
    this.displayActivities(fallbackActivities, true);
  }
  
  /**
   * Display activities in the container
   */
  displayActivities(events, isFallback = false) {
    if (!events || events.length === 0) {
      this.container.innerHTML = `<p class="text-gray-500 text-center">No recent GitHub activity found.</p>`;
      return;
    }
    
    // Create HTML for the timeline
    let timelineHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">Recent GitHub Activity</h3>
        <button id="refresh-github-activity" class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh
        </button>
      </div>
      <div class="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3">
    `;
    
    events.forEach(event => {
      const eventHTML = this.createEventHTML(event);
      if (eventHTML) {
        timelineHTML += eventHTML;
      }
    });
    
    timelineHTML += `</div>`;
    
    // Add link to GitHub profile
    timelineHTML += `
      <div class="mt-4 text-right">
        <a href="https://github.com/${this.username}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
          View All Activity →
        </a>
      </div>
    `;
    
    // Append or replace content
    if (isFallback) {
      // Append to the warning message
      this.container.innerHTML += timelineHTML;
    } else {
      // Replace loading state
      this.container.innerHTML = timelineHTML;
    }
    
    // Add event listener to refresh button
    const refreshButton = document.getElementById('refresh-github-activity');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        console.log('Manually refreshing GitHub activity...');
        refreshButton.disabled = true;
        refreshButton.innerHTML = `
          <svg class="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refreshing...
        `;
        // Force clear cache when manually refreshing
        this.fetchActivities(false, true);
        
        // Re-enable button after 3 seconds
        setTimeout(() => {
          if (refreshButton) {
            refreshButton.disabled = false;
            refreshButton.innerHTML = `
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            `;
          }
        }, 3000);
      });
    }
  }
  
  /**
   * Format a single activity into HTML
   */
  createEventHTML(event) {
    const eventDate = new Date(event.created_at);
    const formattedDate = this.formatDate(eventDate);
    
    // Get event icon and title
    const { icon, title } = this.getEventDetails(event);
    
    // Create event HTML
    let eventHTML = `
      <div class="mb-6 relative">
        <div class="absolute -left-4 mt-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
          ${icon}
        </div>
        <div class="ml-6">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">${formattedDate}</div>
          <div class="mb-2 font-medium">${title}</div>
    `;
    
    // Add event-specific details
    switch (event.type) {
      case 'PushEvent':
        // Extract branch name from ref
        const branch = event.payload.ref ? event.payload.ref.replace('refs/heads/', '') : 'unknown';
        
        eventHTML += `
          <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span class="font-medium">Branch:</span> ${branch}
          </div>
        `;
        
        // Add commit messages
        if (event.payload.commits && event.payload.commits.length > 0) {
          eventHTML += `<div class="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm">`;
          
          event.payload.commits.slice(0, 3).forEach(commit => {
            eventHTML += `
              <div class="mb-2 last:mb-0 break-words">
                ${commit.message}
              </div>
            `;
          });
          
          // Show truncation message if more than 3 commits
          if (event.payload.commits.length > 3) {
            eventHTML += `
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                +${event.payload.commits.length - 3} more commits
              </div>
            `;
          }
          
          eventHTML += `</div>`;
        }
        break;
        
      case 'CreateEvent':
        // Show what was created (repository, branch, tag)
        const refType = event.payload.ref_type;
        const ref = event.payload.ref || '';
        
        eventHTML += `
          <div class="text-sm text-gray-600 dark:text-gray-300">
            <span class="font-medium">Created ${refType}:</span> ${ref}
          </div>
        `;
        break;
        
      case 'PullRequestEvent':
        // Show PR title and link to PR
        const action = event.payload.action;
        const pr = event.payload.pull_request;
        
        eventHTML += `
          <div class="text-sm text-gray-600 dark:text-gray-300">
            <div class="mb-1"><span class="font-medium">Action:</span> ${action}</div>
            <div><span class="font-medium">Title:</span> ${pr.title}</div>
            <div class="mt-2">
              <a href="${pr.html_url}" target="_blank" class="text-blue-600 hover:underline">
                View pull request
              </a>
            </div>
          </div>
        `;
        break;
        
      case 'IssuesEvent':
        // Show issue details
        const issueAction = event.payload.action;
        const issue = event.payload.issue;
        
        eventHTML += `
          <div class="text-sm text-gray-600 dark:text-gray-300">
            <div class="mb-1"><span class="font-medium">Action:</span> ${issueAction}</div>
            <div><span class="font-medium">Title:</span> ${issue.title}</div>
            <div class="mt-2">
              <a href="${issue.html_url}" target="_blank" class="text-blue-600 hover:underline">
                View issue
              </a>
            </div>
          </div>
        `;
        break;
        
      case 'ReleaseEvent':
        // Show release info
        const release = event.payload.release;
        
        eventHTML += `
          <div class="text-sm text-gray-600 dark:text-gray-300">
            <div><span class="font-medium">Version:</span> ${release.tag_name}</div>
            <div class="mt-2">
              <a href="${release.html_url}" target="_blank" class="text-blue-600 hover:underline">
                View release
              </a>
            </div>
          </div>
        `;
        break;
        
      default:
        // Generic info for other event types
        eventHTML += `
          <div class="text-sm text-gray-600 dark:text-gray-300">
            Activity in repository ${event.repo.name}
          </div>
        `;
    }
    
    eventHTML += `
        </div>
      </div>
    `;
    
    return eventHTML;
  }
  
  getEventDetails(event) {
    // Default icon (code)
    let icon = `<svg class="w-3 h-3 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294l4-13zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0zm6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z"/></svg>`;
    let title = `Activity in ${event.repo.name.split('/')[1]}`;
    
    // Get repository name without owner
    const repoName = event.repo.name.split('/')[1];
    
    switch (event.type) {
      case 'PushEvent':
        icon = `<svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M7 9V5h2v4h2l-3 3-3-3h2z"/><path d="M13 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-7.59l1.4-1.4a.5.5 0 0 0-.4-.86H16v-.15a.5.5 0 0 0-.15-.35l-1.4-1.4a.5.5 0 0 0-.7 0l-1.4 1.4a.5.5 0 0 0-.15.35V9h-.95a.5.5 0 0 0-.4.86l1.4 1.4a.5.5 0 0 0 .7 0l1.4-1.4a.5.5 0 0 0 .15-.35v-.15H15v-2a2 2 0 0 0-2-2z"/></svg>`;
        title = `Pushed to ${repoName}`;
        break;
        
      case 'CreateEvent':
        icon = `<svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>`;
        if (event.payload.ref_type === 'repository') {
          title = `Created repository ${repoName}`;
        } else {
          title = `Created ${event.payload.ref_type} in ${repoName}`;
        }
        break;
        
      case 'PullRequestEvent':
        icon = `<svg class="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM2 3a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm8.98 2H10a.5.5 0 0 0 0 1h.98a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5H3.5a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 6.5v5A1.5 1.5 0 0 0 3.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 10.98 5z"/></svg>`;
        title = `${this.capitalizeFirst(event.payload.action)} pull request in ${repoName}`;
        break;
        
      case 'IssuesEvent':
        icon = `<svg class="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/></svg>`;
        title = `${this.capitalizeFirst(event.payload.action)} issue in ${repoName}`;
        break;
        
      case 'ReleaseEvent':
        // Fixed SVG icon with proper paths
        icon = `<svg class="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 1a1 1 0 0 1 0.68 0.31l4.2 4.2A1 1 0 0 1 12.6 7.13l-4.24 4.24a1 1 0 0 1-1.36 0L2.89 7.13a1 1 0 0 1 0-1.42l4.2-4.2A1 1 0 0 1 8 1z M8 2.41L4.41 6 8 9.59 11.59 6 8 2.41z"></path><circle cx="8" cy="6" r="1"></circle><circle cx="5" cy="6" r="1"></circle><circle cx="11" cy="6" r="1"></circle></svg>`;
        title = `Released ${event.payload.release.name || event.payload.release.tag_name} for ${repoName}`;
        break;
        
      case 'ForkEvent':
        icon = `<svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path></svg>`;
        title = `Forked ${repoName}`;
        break;
        
      case 'WatchEvent':
        icon = `<svg class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"></path></svg>`;
        title = `Starred ${repoName}`;
        break;
        
      case 'IssueCommentEvent':
        icon = `<svg class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2.75 2.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 01.75.75v2.19l2.72-2.72a.75.75 0 01.53-.22h4.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25H2.75zM1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0113.25 12h-4.072l-3.528 3.53A.75.75 0 014 15v-3.025A1.75 1.75 0 012.25 10.25v-7.5z"></path></svg>`;
        title = `Commented on issue in ${repoName}`;
        break;
    }
    
    return { icon, title };
  }
  
  formatDate(date) {
    const now = new Date();
    const diffInMilliseconds = now - date;
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 30) {
      // Format as regular date for older events
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } else if (diffInDays > 0) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  }
  
  capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

/**
 * GitHub Last Updated Fetcher
 * Fetches and displays the last update time for a GitHub repository
 */
class GitHubLastUpdatedFetcher {
  constructor(username, repositoryName, elementSelector, options = {}) {
    this.username = username;
    this.repositoryName = repositoryName;
    this.element = document.querySelector(elementSelector);
    this.options = {
      cacheTime: options.cacheTime || 3600000, // Default: 1 hour in milliseconds
      fallbackText: options.fallbackText || 'Recently updated',
      includeLastCommit: options.includeLastCommit !== false
    };
    
    this.cacheKey = `github_last_updated_${this.username}_${this.repositoryName}`;
    this.lastFetchedKey = `github_last_updated_fetched_${this.username}_${this.repositoryName}`;
    this.lastCommitKey = `github_last_commit_${this.username}_${this.repositoryName}`;
    
    if (this.element) {
      this.init();
    }
  }
  
  /**
   * Initialize the fetcher
   */
  init() {
    this.loadLastUpdated();
  }
  
  /**
   * Load last updated time from cache or fetch from API
   */
  loadLastUpdated() {
    const cached = localStorage.getItem(this.cacheKey);
    const lastFetched = localStorage.getItem(this.lastFetchedKey);
    const cachedCommit = localStorage.getItem(this.lastCommitKey);
    const now = new Date().getTime();
    
    if (cached && lastFetched && (now - parseInt(lastFetched) < this.options.cacheTime)) {
      // Use cached data if it's still valid
      this.displayLastUpdated(cached, cachedCommit);
    } else {
      // Fetch new data
      this.fetchLastUpdated();
    }
  }
  
  /**
   * Fetch last updated time from GitHub API
   */
  async fetchLastUpdated() {
    try {
      // First check if repository exists to avoid 404 errors
      const checkRepoResponse = await fetch(window.GitHubConfig.addClientId(
        `https://api.github.com/repos/${this.username}/${this.repositoryName}`
      ));
      
      if (checkRepoResponse.status === 403) {
        // Rate limit exceeded, log once and provide a clean fallback
        console.warn(`GitHub API rate limit exceeded. Using fallback for ${this.repositoryName}.`);
        this.displayLastUpdated(null);
        return;
      }
      
      if (!checkRepoResponse.ok) {
        // If repo doesn't exist, use fallback
        console.warn(`Repository ${this.repositoryName} not found or private. Using fallback.`);
        this.displayLastUpdated(null);
        return;
      }
      
      const repoData = await checkRepoResponse.json();
      const lastUpdated = repoData.pushed_at || repoData.updated_at;
      
      // Cache repo data
      localStorage.setItem(this.cacheKey, lastUpdated);
      localStorage.setItem(this.lastFetchedKey, new Date().getTime().toString());
      
      // If option is enabled, fetch last commit information
      let lastCommitInfo = null;
      if (this.options.includeLastCommit) {
        try {
          const commitsResponse = await fetch(window.GitHubConfig.addClientId(
            `https://api.github.com/repos/${this.username}/${this.repositoryName}/commits?per_page=1`
          ));
          if (commitsResponse.ok) {
            const commitsData = await commitsResponse.json();
            if (commitsData && commitsData.length > 0) {
              lastCommitInfo = {
                message: commitsData[0].commit.message,
                url: commitsData[0].html_url,
                date: commitsData[0].commit.author.date
              };
              localStorage.setItem(this.lastCommitKey, JSON.stringify(lastCommitInfo));
            }
          }
        } catch (commitError) {
          // Suppress repeated console warnings for commit errors
          if (!window._commitErrorLogged) {
            console.warn(`Error fetching commits. This may be due to API rate limits.`);
            window._commitErrorLogged = true;
          }
        }
      }
      
      this.displayLastUpdated(lastUpdated, lastCommitInfo);
    } catch (error) {
      console.warn(`Error fetching last updated time for ${this.repositoryName}:`, error);
      this.displayLastUpdated(null);
    }
  }
  
  /**
   * Display last updated time in the element
   */
  displayLastUpdated(lastUpdated, lastCommitInfo = null) {
    if (!lastUpdated) {
      this.element.textContent = this.options.fallbackText;
      return;
    }
    
    const date = new Date(lastUpdated);
    const timeAgo = this.getTimeAgo(date);
    
    if (lastCommitInfo) {
      if (typeof lastCommitInfo === 'string') {
        try {
          lastCommitInfo = JSON.parse(lastCommitInfo);
        } catch (e) {
          lastCommitInfo = null;
        }
      }
      
      if (lastCommitInfo && lastCommitInfo.message) {
        // Show the last commit message and time
        const commitMsg = lastCommitInfo.message.length > 50 
          ? lastCommitInfo.message.substring(0, 47) + '...' 
          : lastCommitInfo.message;
          
        const commitTimeAgo = this.getTimeAgo(new Date(lastCommitInfo.date));
        
        this.element.innerHTML = `
          Last commit: <span class="font-medium">${commitTimeAgo}</span>
          <span class="block text-xs opacity-80 mt-1">${this.escapeHTML(commitMsg.split('\n')[0])}</span>
        `;
      } else {
        this.element.textContent = `Last updated: ${timeAgo}`;
      }
    } else {
      this.element.textContent = `Last updated: ${timeAgo}`;
    }
  }
  
  /**
   * Format date to time ago string
   */
  getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    
    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  }
  
  /**
   * Escape HTML to prevent XSS
   */
  escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Initialize GitHub activity fetchers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize activity feed on home page
  const activityContainer = document.getElementById('github-activity-feed');
  if (activityContainer) {
    new GitHubActivityFetcher('rivie13', '#github-activity-feed', { count: 5 });
  }
  
  // First, gather all repository data needed for fetching
  const repoMapping = {
    'codegrind': 'codegrind',
    'helios': 'Helios', 
    'helios-swarm-robotics': 'Helios',
    'bestnotes': '01-BestNotes',
    'projectile-launcher-rework': 'PLR',
    'robotics-nav2-slam-example': 'Robotics-Nav2-SLAM-Example',
    'book-player-application': 'assignment-10-rivie13'
  };
  
  // Cache for repository data to avoid multiple fetches for the same repo
  const repoDataCache = {};
  
  // Process each unique repository once
  const processedRepos = new Set();
  
  // Initialize last updated fetchers for each project
  const projectLastUpdatedElements = document.querySelectorAll('[data-github-last-updated]');
  
  // First pass: collect all unique repos we need to fetch
  projectLastUpdatedElements.forEach(element => {
    const repo = element.getAttribute('data-github-last-updated');
    if (repo && !processedRepos.has(repo)) {
      const actualRepo = repoMapping[repo.toLowerCase()] || repo;
      processedRepos.add(repo);
      
      // Fetch repo data once
      fetchRepoData('rivie13', actualRepo)
        .then(data => {
          repoDataCache[repo] = data;
          
          // Update all elements with this repo attribute
          updateAllElementsForRepo(repo, data);
        })
        .catch(error => {
          console.warn(`Error fetching data for ${actualRepo}:`, error);
          
          // Update all elements with fallback
          updateAllElementsForRepo(repo, null);
        });
    }
  });
  
  /**
   * Fetch repository data from GitHub API
   */
  async function fetchRepoData(username, repoName) {
    console.log(`Fetching data for ${repoName}...`);
    
    try {
      // Check local cache first
      const cacheKey = `github_repo_${username}_${repoName}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheExpiry = localStorage.getItem(`${cacheKey}_expiry`);
      const now = Date.now();
      const cacheAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (cachedData && cacheExpiry && now < parseInt(cacheExpiry)) {
        console.log(`Using cached data for ${repoName}`);
        return JSON.parse(cachedData);
      }
      
      // First check if repository exists to avoid 404 errors
      const repoUrl = window.GitHubConfig.addClientId(
        `https://api.github.com/repos/${username}/${repoName}`
      );
      
      console.log(`DEBUG Auth - URL with client_id: ${repoUrl}`);
      console.log(`DEBUG Auth - Client ID used: ${window.GitHubConfig.clientId}`);
      
      // Use RequestQueueClient to add request to queue
      return new Promise(resolve => {
        RequestQueueClient.add(repoUrl, async (checkRepoResponse, repoData) => {
          // Log the response headers to check rate limit info
          console.log(`DEBUG Auth - Response status: ${checkRepoResponse.status}`);
          console.log(`DEBUG Auth - Rate limit info:`, 
            checkRepoResponse.headers ? {
              remaining: checkRepoResponse.headers.get('x-ratelimit-remaining'),
              limit: checkRepoResponse.headers.get('x-ratelimit-limit'),
              reset: checkRepoResponse.headers.get('x-ratelimit-reset')
            } : 'No headers available'
          );
          
          if (checkRepoResponse.status === 403) {
            // Rate limit exceeded, log once and provide a clean fallback
            console.warn(`GitHub API rate limit exceeded. Using fallback for ${repoName}.`);
            resolve(null);
            return;
          }
          
          if (!checkRepoResponse.ok) {
            // If repo doesn't exist, use fallback
            console.warn(`Repository ${repoName} not found or private. Using fallback.`);
            resolve(null);
            return;
          }
          
          const lastUpdated = repoData.pushed_at || repoData.updated_at;
          
          // If option is enabled, fetch last commit information
          let lastCommitInfo = null;
          
          try {
            const commitsUrl = window.GitHubConfig.addClientId(
              `https://api.github.com/repos/${username}/${repoName}/commits?per_page=1`
            );
            
            // Use RequestQueueClient for commits too
            await new Promise(resolveCommits => {
              RequestQueueClient.add(commitsUrl, (commitsResponse, commitsData) => {
                if (commitsResponse.ok && commitsData && commitsData.length > 0) {
                  lastCommitInfo = {
                    message: commitsData[0].commit.message,
                    url: commitsData[0].html_url,
                    date: commitsData[0].commit.author.date
                  };
                }
                resolveCommits();
              });
            });
          } catch (commitError) {
            // Suppress repeated console warnings for commit errors
            if (!window._commitErrorLogged) {
              console.warn(`Error fetching commits. This may be due to API rate limits.`);
              window._commitErrorLogged = true;
            }
          }
          
          // Save to cache with expiry
          const result = { lastUpdated, lastCommitInfo };
          try {
            localStorage.setItem(cacheKey, JSON.stringify(result));
            localStorage.setItem(`${cacheKey}_expiry`, (now + cacheAge).toString());
          } catch (e) {
            console.warn('Failed to cache repo data:', e);
          }
          
          resolve(result);
        });
      });
    } catch (error) {
      console.error(`Error fetching data for ${repoName}:`, error);
      return null;
    }
  }
  
  /**
   * Update all elements with a specific repo attribute
   */
  function updateAllElementsForRepo(repo, data) {
    // Get all elements with this repo
    const elements = document.querySelectorAll(`[data-github-last-updated="${repo}"]`);
    
    // Loop through them and update each one
    elements.forEach(element => {
      if (!data) {
        element.textContent = 'Recently updated';
        return;
      }
      
      const { lastUpdated, lastCommitInfo } = data;
      
      if (!lastUpdated) {
        element.textContent = 'Recently updated';
        return;
      }
      
      const date = new Date(lastUpdated);
      const timeAgo = getTimeAgo(date);
      
      if (lastCommitInfo && lastCommitInfo.message) {
        // Show the last commit message and time
        const commitMsg = lastCommitInfo.message.length > 50 
          ? lastCommitInfo.message.substring(0, 47) + '...' 
          : lastCommitInfo.message;
          
        const commitTimeAgo = getTimeAgo(new Date(lastCommitInfo.date));
        
        element.innerHTML = `
          Last commit: <span class="font-medium">${commitTimeAgo}</span>
          <span class="block text-xs opacity-80 mt-1">${escapeHTML(commitMsg.split('\n')[0])}</span>
        `;
      } else {
        element.textContent = `Last updated: ${timeAgo}`;
      }
    });
  }
  
  /**
   * Format date to time ago string
   */
  function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    
    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  }
  
  /**
   * Escape HTML to prevent XSS
   */
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}); 