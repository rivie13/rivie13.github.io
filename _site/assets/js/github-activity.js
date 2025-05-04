/**
 * GitHub Activity Fetcher
 * Fetches and displays GitHub activity for a given username
 */

class GitHubActivityFetcher {
  constructor(username, containerSelector, options = {}) {
    this.username = username;
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
    
    this.loadActivities();
  }
  
  /**
   * Load activities from cache or fetch from API
   */
  loadActivities() {
    const cached = localStorage.getItem(this.cacheKey);
    const lastUpdated = localStorage.getItem(this.lastUpdatedKey);
    const now = new Date().getTime();
    
    if (cached && lastUpdated && (now - parseInt(lastUpdated) < this.options.cacheTime)) {
      // Use cached data if it's still valid
      this.displayActivities(JSON.parse(cached));
    } else {
      // Fetch new data
      this.fetchActivities();
    }
  }
  
  /**
   * Fetch activities from GitHub API
   */
  async fetchActivities() {
    this.container.innerHTML = '<div class="flex justify-center py-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';
    
    try {
      const response = await fetch(`https://api.github.com/users/${this.username}/events/public`);
      
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter and limit events
      const activities = data
        .filter(event => this.options.filterEvents.includes(event.type))
        .slice(0, this.options.count);
      
      // Cache the results
      localStorage.setItem(this.cacheKey, JSON.stringify(activities));
      localStorage.setItem(this.lastUpdatedKey, new Date().getTime().toString());
      
      this.displayActivities(activities);
    } catch (error) {
      console.error('Error fetching GitHub activities:', error);
      this.container.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to load GitHub activities. Please try again later.
      </div>`;
    }
  }
  
  /**
   * Display activities in the container
   */
  displayActivities(activities) {
    if (!activities || activities.length === 0) {
      this.container.innerHTML = '<p class="text-gray-500">No recent GitHub activity found.</p>';
      return;
    }
    
    const activityItems = activities.map(activity => this.formatActivity(activity)).join('');
    
    this.container.innerHTML = `
      <div class="space-y-4">
        ${activityItems}
      </div>
      <div class="mt-4 text-right">
        <a href="https://github.com/${this.username}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
          View more on GitHub →
        </a>
      </div>
    `;
  }
  
  /**
   * Format a single activity into HTML
   */
  formatActivity(activity) {
    const date = new Date(activity.created_at);
    const timeAgo = this.getTimeAgo(date);
    let content = '';
    
    switch (activity.type) {
      case 'PushEvent':
        const commits = activity.payload.commits || [];
        const repoName = activity.repo.name.split('/')[1];
        content = `
          <div class="flex items-start">
            <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm">
                Pushed ${commits.length} commit${commits.length === 1 ? '' : 's'} to 
                <a href="https://github.com/${activity.repo.name}" target="_blank" class="font-medium hover:text-blue-600">${repoName}</a>
              </p>
              ${commits.length > 0 ? `
                <div class="mt-1 text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-hidden">
                  ${commits.slice(0, 2).map(commit => `
                    <div class="truncate">
                      <span class="font-mono text-gray-500">${commit.sha.substring(0, 7)}</span> ${this.escapeHTML(commit.message.split('\n')[0])}
                    </div>
                  `).join('')}
                  ${commits.length > 2 ? `<div class="text-gray-500 mt-1">+ ${commits.length - 2} more commit${commits.length - 2 === 1 ? '' : 's'}</div>` : ''}
                </div>
              ` : ''}
              <div class="mt-1 text-xs text-gray-500">${timeAgo}</div>
            </div>
          </div>
        `;
        break;
        
      case 'CreateEvent':
        const refType = activity.payload.ref_type;
        const ref = activity.payload.ref;
        const repoNameCreate = activity.repo.name.split('/')[1];
        content = `
          <div class="flex items-start">
            <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm">
                Created ${refType} ${ref ? `<code class="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">${ref}</code> in` : ''}
                <a href="https://github.com/${activity.repo.name}" target="_blank" class="font-medium hover:text-blue-600">${repoNameCreate}</a>
              </p>
              <div class="mt-1 text-xs text-gray-500">${timeAgo}</div>
            </div>
          </div>
        `;
        break;
        
      case 'PullRequestEvent':
        const action = activity.payload.action;
        const prNumber = activity.payload.number;
        const prTitle = activity.payload.pull_request.title;
        const repoNamePR = activity.repo.name.split('/')[1];
        content = `
          <div class="flex items-start">
            <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-1">
              <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm">
                ${action === 'opened' ? 'Opened' : action === 'closed' ? 'Closed' : 'Updated'} pull request 
                <a href="${activity.payload.pull_request.html_url}" target="_blank" class="font-medium hover:text-blue-600">#${prNumber}</a> in
                <a href="https://github.com/${activity.repo.name}" target="_blank" class="font-medium hover:text-blue-600">${repoNamePR}</a>
              </p>
              <p class="mt-1 text-xs text-gray-600">${this.escapeHTML(prTitle)}</p>
              <div class="mt-1 text-xs text-gray-500">${timeAgo}</div>
            </div>
          </div>
        `;
        break;
        
      case 'IssuesEvent':
        const issueAction = activity.payload.action;
        const issueNumber = activity.payload.issue.number;
        const issueTitle = activity.payload.issue.title;
        const repoNameIssue = activity.repo.name.split('/')[1];
        content = `
          <div class="flex items-start">
            <div class="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-1">
              <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm">
                ${issueAction === 'opened' ? 'Opened' : issueAction === 'closed' ? 'Closed' : 'Updated'} issue 
                <a href="${activity.payload.issue.html_url}" target="_blank" class="font-medium hover:text-blue-600">#${issueNumber}</a> in
                <a href="https://github.com/${activity.repo.name}" target="_blank" class="font-medium hover:text-blue-600">${repoNameIssue}</a>
              </p>
              <p class="mt-1 text-xs text-gray-600">${this.escapeHTML(issueTitle)}</p>
              <div class="mt-1 text-xs text-gray-500">${timeAgo}</div>
            </div>
          </div>
        `;
        break;
        
      case 'ReleaseEvent':
        const releaseName = activity.payload.release.name || activity.payload.release.tag_name;
        const repoNameRelease = activity.repo.name.split('/')[1];
        content = `
          <div class="flex items-start">
            <div class="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-1">
              <svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M8.878.392a1.75 1.75 0 00-1.756 0l-5.25 3.045A1.75 1.75 0 001 4.951v6.098c0 .624.332 1.2.872 1.514l5.25 3.045a1.75 1.75 0 001.756 0l5.25-3.045c.54-.313.872-.89.872-1.514V4.951c0-.624-.332-1.2-.872-1.514L8.878.392zM7.875 1.69a.25.25 0 01.25 0l4.63 2.685L8 7.133 3.245 4.375l4.63-2.685zM2.5 5.677v5.372c0 .09.047.171.125.216l4.625 2.683V8.432L2.5 5.677zm6.25 8.271l4.625-2.683a.25.25 0 00.125-.216V5.677L8.75 8.432v5.516z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm">
                Released 
                <a href="${activity.payload.release.html_url}" target="_blank" class="font-medium hover:text-blue-600">${this.escapeHTML(releaseName)}</a> in
                <a href="https://github.com/${activity.repo.name}" target="_blank" class="font-medium hover:text-blue-600">${repoNameRelease}</a>
              </p>
              <div class="mt-1 text-xs text-gray-500">${timeAgo}</div>
            </div>
          </div>
        `;
        break;
        
      default:
        const repoNameDefault = activity.repo.name.split('/')[1];
        content = `
          <div class="flex items-start">
            <div class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 mt-1">
              <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm">
                Activity in
                <a href="https://github.com/${activity.repo.name}" target="_blank" class="font-medium hover:text-blue-600">${repoNameDefault}</a>
              </p>
              <div class="mt-1 text-xs text-gray-500">${timeAgo}</div>
            </div>
          </div>
        `;
    }
    
    return `<div class="border-b border-gray-100 dark:border-gray-800 pb-4">${content}</div>`;
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
      fallbackText: options.fallbackText || 'Recently updated'
    };
    
    this.cacheKey = `github_last_updated_${this.username}_${this.repositoryName}`;
    this.lastFetchedKey = `github_last_updated_fetched_${this.username}_${this.repositoryName}`;
    
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
    const now = new Date().getTime();
    
    if (cached && lastFetched && (now - parseInt(lastFetched) < this.options.cacheTime)) {
      // Use cached data if it's still valid
      this.displayLastUpdated(cached);
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
      const response = await fetch(`https://api.github.com/repos/${this.username}/${this.repositoryName}`);
      
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }
      
      const data = await response.json();
      const lastUpdated = data.pushed_at || data.updated_at;
      
      // Cache the results
      localStorage.setItem(this.cacheKey, lastUpdated);
      localStorage.setItem(this.lastFetchedKey, new Date().getTime().toString());
      
      this.displayLastUpdated(lastUpdated);
    } catch (error) {
      console.error(`Error fetching last updated time for ${this.repositoryName}:`, error);
      this.displayLastUpdated(null);
    }
  }
  
  /**
   * Display last updated time in the element
   */
  displayLastUpdated(lastUpdated) {
    if (!lastUpdated) {
      this.element.textContent = this.options.fallbackText;
      return;
    }
    
    const date = new Date(lastUpdated);
    const timeAgo = this.getTimeAgo(date);
    
    this.element.textContent = `Last updated: ${timeAgo}`;
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
}

// Initialize GitHub activity fetchers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize activity feed on home page
  const activityContainer = document.getElementById('github-activity-feed');
  if (activityContainer) {
    new GitHubActivityFetcher('rivie13', '#github-activity-feed', { count: 5 });
  }
  
  // Initialize last updated fetchers for each project
  const projectLastUpdatedElements = document.querySelectorAll('[data-github-last-updated]');
  projectLastUpdatedElements.forEach(element => {
    const repo = element.getAttribute('data-github-last-updated');
    if (repo) {
      new GitHubLastUpdatedFetcher('rivie13', repo, `[data-github-last-updated="${repo}"]`);
    }
  });
}); 