/**
 * GitHub Repository Fetcher
 * This script dynamically fetches and displays additional repositories from GitHub
 */

document.addEventListener('DOMContentLoaded', function() {
  const additionalProjectsContainer = document.getElementById('additional-projects');
  if (!additionalProjectsContainer) return;

  const username = 'rivie13'; // Your GitHub username
  const excludedRepos = [
    'codegrind', 
    'Robotics-Nav2-SLAM-Example', 
    'Helios', 
    '01-BestNotes', 
    'PLR', 
    'assignment-10-rivie13',
    'rivie13.github.io'
  ]; // Repos already in projects.yml
  
  fetchAdditionalRepos(username, excludedRepos);
  
  /**
   * Fetch additional repositories from GitHub
   */
  async function fetchAdditionalRepos(username, excludedRepos) {
    try {
      additionalProjectsContainer.innerHTML = `
        <div class="text-center py-6">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Loading additional projects from GitHub...</p>
        </div>
      `;
      
      // Fetch repositories with the most information
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }
      
      const repos = await response.json();
      
      // Filter out excluded repos, forks and empty repos
      const validRepos = repos.filter(repo => 
        !excludedRepos.includes(repo.name.toLowerCase()) && 
        !repo.fork &&
        (repo.description || repo.language) &&
        !repo.archived
      );
      
      if (validRepos.length === 0) {
        additionalProjectsContainer.innerHTML = `
          <p class="text-center text-gray-500 py-6">No additional projects found on GitHub.</p>
        `;
        return;
      }
      
      // Sort by most recently updated
      validRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      
      // Take the top 6 repos
      const reposToShow = validRepos.slice(0, 6);
      
      // Create HTML for the repositories
      const reposHTML = reposToShow.map(repo => createRepoCard(repo)).join('');
      
      additionalProjectsContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${reposHTML}
        </div>
      `;
      
      // Add "Show More" button if there are more repos
      if (validRepos.length > 6) {
        const showMoreButton = document.createElement('div');
        showMoreButton.className = 'text-center mt-8';
        showMoreButton.innerHTML = `
          <a href="https://github.com/${username}" target="_blank" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
            </svg>
            View More on GitHub
          </a>
        `;
        additionalProjectsContainer.appendChild(showMoreButton);
      }
      
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
      additionalProjectsContainer.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
          <p>Failed to load additional projects from GitHub.</p>
          <p class="text-sm mt-1">GitHub API rate limits may have been reached. Please try again later.</p>
        </div>
      `;
    }
  }
  
  /**
   * Create a repository card HTML
   */
  function createRepoCard(repo) {
    // Get programming languages used
    const languages = [];
    if (repo.language) {
      languages.push(repo.language);
    }
    
    // Format description
    const description = repo.description || `A ${repo.language || ''} repository`;
    
    // Format date
    const updatedDate = new Date(repo.updated_at);
    const formattedDate = updatedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 h-full">
        <div class="p-6">
          <h3 class="text-xl font-bold mb-2">${repo.name}</h3>
          
          <p class="text-gray-600 dark:text-gray-300 mb-4">${description}</p>
          
          <div class="mb-4">
            <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Technologies</h4>
            <div class="flex flex-wrap">
              ${repo.language ? 
                `<span class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">${repo.language}</span>` : ''}
            </div>
          </div>
          
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
            </svg>
            <span>Last updated: ${formattedDate}</span>
          </div>
          
          ${repo.stargazers_count > 0 || repo.forks_count > 0 ? `
          <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            ${repo.stargazers_count > 0 ? `
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span>${repo.stargazers_count} stars</span>
            </div>
            ` : ''}
            
            ${repo.forks_count > 0 ? `
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clip-rule="evenodd"></path>
              </svg>
              <span>${repo.forks_count} forks</span>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div class="flex flex-wrap gap-2 mt-4">
            <a href="${repo.html_url}" target="_blank" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
              </svg>
              GitHub
            </a>
            
            ${repo.homepage ? `
            <a href="${repo.homepage}" target="_blank" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              Live Demo
            </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
}); 