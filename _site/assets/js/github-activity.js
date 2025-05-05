/**
 * GitHub Activity Fetcher
 * Fetches and displays GitHub activity for a given username
 */

class GitHubActivityFetcher {
  constructor(username, containerSelector, options = {}) {
    this.username = username || window.GitHubConfig.username;
    this.container = document.querySelector(containerSelector);
    this.options = {
      count: options.count || 5,
      cacheTime: options.cacheTime || 3600000, // Default: 1 hour in milliseconds
      filterEvents: options.filterEvents || ['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssuesEvent', 'ReleaseEvent']
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
    
    // Increase cache time to reduce API calls (12 hours)
    this.options.cacheTime = 12 * 3600000;
    
    this.loadActivities();
  }
  
  /**
   * Load activities from cache or fetch from API
   */
  loadActivities() {
    const cachedActivity = localStorage.getItem(this.cacheKey);
    const lastUpdated = localStorage.getItem(this.lastUpdatedKey);
    const now = new Date().getTime();
    
    if (cachedActivity && lastUpdated && (now - parseInt(lastUpdated) < this.options.cacheTime)) {
      this.displayActivities(JSON.parse(cachedActivity));
    } else {
      this.fetchActivities();
    }
  }
  
  /**
   * Fetch activities from GitHub API
   */
  async fetchActivities() {
    try {
      // Display loading state
      this.container.innerHTML = `
        <div class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-sm text-gray-600">Loading GitHub activity...</p>
        </div>
      `;
      
      // Use the centralized GitHub config to add client_id
      const eventsUrl = window.GitHubConfig.addClientId(
        `https://api.github.com/users/${this.username}/events?per_page=${this.options.count}`
      );
      
      const response = await fetch(eventsUrl);
      
      if (response.status === 403) {
        // Handle rate limiting with fallback data
        console.warn('GitHub API rate limit exceeded for activity data. Using fallback.');
        this.displayFallbackActivities();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }
      
      const events = await response.json();
      
      // Filter events based on preferences
      const filteredEvents = events.filter(event => 
        this.options.filterEvents.includes(event.type)
      ).slice(0, this.options.count);
      
      // Cache the results
      localStorage.setItem(this.cacheKey, JSON.stringify(filteredEvents));
      localStorage.setItem(this.lastUpdatedKey, new Date().getTime().toString());
      
      this.displayActivities(filteredEvents);
      
    } catch (error) {
      console.error('Error fetching GitHub activity:', error);
      this.displayFallbackActivities();
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
        icon = `<svg class="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 1a.752.752 0 0 1 .53.22c.26.26 5.28 5.28 5.28 5.28.29.29.29.77 0 1.06 0 0-5.02 5.02-5.28 5.28a.752.752 0 0 1-.53.22.752.752 0 0 1-.53-.22C7.21 12.58 2.19 7.56 2.19 7.56c-.29-.29-.29-.77 0-1.06C2.19 6.5 7.21 1.48 7.47 1.22A.752.752 0 0 1 8 1zm0 3.9c.55 0 1 .45 1 1 0 .55-.45 1-1 1s-1-.45-1-1c0-.55.45-1 1-1zm3.9 1c0 .55-.45 1-1 1s-1-.45-1-1c0-.55.45-1 1-1s1 .45 1 1zm-7.8 0c0 .55-.45 1-1 1s-1-.45-1-1c0-.55.45-1 1-1s1 .45 1 1zm3.9 3.9c.55 0 1 .45 1 1 0 .55-.45 1-1 1s-1-.45-1-1c0-.55.45-1 1-1z"/></svg>`;
        title = `Released ${event.payload.release.name || event.payload.release.tag_name} for ${repoName}`;
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
      // First check if repository exists to avoid 404 errors
      const checkRepoResponse = await fetch(window.GitHubConfig.addClientId(
        `https://api.github.com/repos/${username}/${repoName}`
      ));
      
      if (checkRepoResponse.status === 403) {
        // Rate limit exceeded, log once and provide a clean fallback
        console.warn(`GitHub API rate limit exceeded. Using fallback for ${repoName}.`);
        return null;
      }
      
      if (!checkRepoResponse.ok) {
        // If repo doesn't exist, use fallback
        console.warn(`Repository ${repoName} not found or private. Using fallback.`);
        return null;
      }
      
      const repoData = await checkRepoResponse.json();
      const lastUpdated = repoData.pushed_at || repoData.updated_at;
      
      // If option is enabled, fetch last commit information
      let lastCommitInfo = null;
      try {
        const commitsResponse = await fetch(window.GitHubConfig.addClientId(
          `https://api.github.com/repos/${username}/${repoName}/commits?per_page=1`
        ));
        
        if (commitsResponse.ok) {
          const commitsData = await commitsResponse.json();
          if (commitsData && commitsData.length > 0) {
            lastCommitInfo = {
              message: commitsData[0].commit.message,
              url: commitsData[0].html_url,
              date: commitsData[0].commit.author.date
            };
          }
        }
      } catch (commitError) {
        // Suppress repeated console warnings for commit errors
        if (!window._commitErrorLogged) {
          console.warn(`Error fetching commits. This may be due to API rate limits.`);
          window._commitErrorLogged = true;
        }
      }
      
      return { lastUpdated, lastCommitInfo };
    } catch (error) {
      console.warn(`Error fetching data for ${repoName}:`, error);
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