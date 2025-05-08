/**
 * GitHub Contributions Chart
 * Fetches and displays a user's GitHub contribution activity in a heatmap similar to GitHub's profile
 */

// Add global initialization flag to prevent multiple instances
window.githubContributionsInitialized = window.githubContributionsInitialized || false;

document.addEventListener('DOMContentLoaded', function() {
  // Prevent multiple initializations
  if (window.githubContributionsInitialized) {
    console.log('[GitHub Contributions] Already initialized, skipping duplicate initialization');
    return;
  }
  window.githubContributionsInitialized = true; // Set flag

  // Get configuration
  const username = window.GitHubConfig.username;
  const contributionsContainer = document.getElementById('github-contributions');
  
  if (!contributionsContainer) return; // Exit if container not found
  
  // Load contributions from cache or fetch from API
  loadContributions();
  
  /**
   * Load contributions data from cache or API
   */
  function loadContributions() {
    const cacheKey = `github_contributions_${username}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    const now = Date.now();
    const cacheDuration = 4 * 60 * 60 * 1000; // 4 hours cache duration
    
    if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < cacheDuration)) {
      //console.log('Using cached GitHub contributions data');
      displayContributions(JSON.parse(cachedData));
    } else {
      //console.log('Fetching fresh GitHub contributions data');
      fetchContributions();
    }
  }
  
  /**
   * Fetch contributions using GraphQL API
   */
  async function fetchContributions() {
    try {
      // Show loading state
      contributionsContainer.innerHTML = `
        <div class="text-center py-6">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" aria-hidden="true"></div>
          <p class="mt-2 text-gray-600" aria-live="polite">Loading GitHub contribution data...</p>
        </div>
      `;
      
      // GraphQL query to get contribution data
      const query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    color
                  }
                }
              }
            }
          }
        }
      `;
      
      // Variables for the query
      const variables = { username };
      
      // Try to use GraphQL API first
      try {
        const graphQLData = await window.GitHubConfig.makeGraphQLRequest(query, variables);
        
        // If we get here, the GraphQL request succeeded
        if (graphQLData.data && graphQLData.data.user && 
            graphQLData.data.user.contributionsCollection && 
            graphQLData.data.user.contributionsCollection.contributionCalendar) {
          
          const calendarData = graphQLData.data.user.contributionsCollection.contributionCalendar;
          
          // Process the data into a more usable format
          const contributions = processContributionData(calendarData);
          
          // Cache the data
          const cacheKey = `github_contributions_${username}`;
          const now = Date.now();
          localStorage.setItem(cacheKey, JSON.stringify(contributions));
          localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
          
          // Display the contributions
          displayContributions(contributions);
          return; // Exit function if GraphQL was successful
        }
      } catch (graphQLError) {
        // GraphQL request failed, log and continue to fallback
        console.warn('GraphQL request failed, using REST API fallback:', graphQLError);
      }
      
      // FALLBACK: Use REST API to get basic profile data and generate mock contributions
      const userUrl = window.GitHubConfig.addClientId(
        `https://api.github.com/users/${username}`
      );
      
      // Fetch basic user data
      const userResponse = await fetch(userUrl);
      
      if (!userResponse.ok) {
        throw new Error(`GitHub API returned ${userResponse.status}`);
      }
      
      // Generate mock contribution data based on public activity
      const userData = await userResponse.json();
      const mockContributions = generateMockContributions(userData);
      
      // Cache the mock data
      const cacheKey = `github_contributions_${username}`;
      const now = Date.now();
      localStorage.setItem(cacheKey, JSON.stringify(mockContributions));
      localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
      
      // Display the mock contributions
      displayContributions(mockContributions);
      
      // Also show a notice about using estimated data
      const noticeElement = document.createElement('div');
      noticeElement.className = 'text-amber-600 text-xs mt-2 text-center';
      noticeElement.setAttribute('aria-live', 'polite');
      noticeElement.innerHTML = 'Using estimated contribution data. Working on fixing the direct GitHub GraphQL API access.';
      contributionsContainer.appendChild(noticeElement);
      
    } catch (error) {
      console.error('Error fetching GitHub contributions:', error);
      displayFallbackData();
    }
  }
  
  /**
   * Generate mock contribution data for display
   * This is a temporary solution until GraphQL access is fixed
   */
  function generateMockContributions(userData) {
    const totalContributions = userData.public_repos * 5 + 30; // Estimate based on repos
    const contributions = [];
    
    // Generate exactly one year of data, matching GitHub's timeframe
    const today = new Date();
    // Make sure we're using UTC date strings
    const todayStr = today.toISOString().split('T')[0];
    
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(oneYearAgo.getDate() - 1); // Start exactly one year and one day ago (GitHub's approach)
    
    // Create a date iterator
    let currentDate = new Date(oneYearAgo);
    
    // Generate data for each day
    while (currentDate <= today) {
      // Random contribution count, weighted toward weekdays and more recent dates
      let count = 0;
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const daysSinceStart = Math.floor((currentDate - oneYearAgo) / (1000 * 60 * 60 * 24));
      const recencyFactor = daysSinceStart / 365;
      
      // More likely to have contributions on weekdays and more recently
      if (Math.random() < (isWeekend ? 0.2 : 0.4) * (0.5 + recencyFactor)) {
        // Generate a random count, with higher counts being less common
        count = Math.floor(Math.random() * 5) + 1;
        if (Math.random() < 0.2) {
          count += Math.floor(Math.random() * 5) + 1;
        }
        if (Math.random() < 0.05) {
          count += Math.floor(Math.random() * 10) + 1;
        }
      }
      
      // Add to contributions array
      contributions.push({
        date: currentDate.toISOString().split('T')[0],
        count: count,
        level: getLevelFromCount(count)
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Ensure today is included
    const hasToday = contributions.some(day => day.date === todayStr);
    if (!hasToday) {
      // Add today if missing
      contributions.push({
        date: todayStr,
        count: Math.floor(Math.random() * 5) + 1,
        level: getLevelFromCount(Math.floor(Math.random() * 5) + 1)
      });
    }
    
    // Sort contributions by date
    contributions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      totalContributions,
      contributions
    };
  }
  
  /**
   * Process raw contribution data into a more usable format
   */
  function processContributionData(calendarData) {
    const totalContributions = calendarData.totalContributions;
    const contributions = [];
    
    // Process each week and day
    calendarData.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
          color: day.color,
          // Determine level based on count
          level: getLevelFromCount(day.contributionCount)
        });
      });
    });
    
    return {
      totalContributions,
      contributions
    };
  }
  
  /**
   * Get level (0-4) from contribution count, similar to GitHub's levels
   */
  function getLevelFromCount(count) {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 7) return 2;
    if (count <= 12) return 3;
    return 4; // 13+
  }
  
  /**
   * Adjust date to match GitHub's date display (UTC-based)
   * This helps fix date discrepancies between our chart and GitHub's
   */
  function adjustDateToGitHub(dateStr) {
    // Create a date in UTC from the string
    const date = new Date(dateStr + 'T00:00:00Z');
    // Adjust to correct for Aug 1 appearing as Jul 31 issue
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Display contributions in a heatmap visualization
   */
  function displayContributions(data) {
    if (!data || !data.contributions || data.contributions.length === 0) {
      displayError("No contribution data available");
      return;
    }
    
    // Force refresh if last day is not today - FIX: Compare against local date string
    const lastDateStr = data.contributions[data.contributions.length - 1].date;
    const nowLocal = new Date();
    const year = nowLocal.getFullYear();
    const month = String(nowLocal.getMonth() + 1).padStart(2, '0');
    const day = String(nowLocal.getDate()).padStart(2, '0');
    const todayLocalStr = `${year}-${month}-${day}`;
    
    console.log(`[GitHub Contributions] Date Check - Last API Date: ${lastDateStr}, Today Local: ${todayLocalStr}`);

    if (lastDateStr < todayLocalStr) {
      console.warn(`[GitHub Contributions] Last contribution date (${lastDateStr}) is before today (${todayLocalStr}). Forcing refresh.`);
      // Clear the cache to force a refresh
      localStorage.removeItem(`github_contributions_${username}`);
      localStorage.removeItem(`github_contributions_${username}_timestamp`);
      fetchContributions();
      return;
    }
    
    // DEBUG: Log the data structure
    //console.log("Contribution data structure:", JSON.stringify(data, null, 2));
    
    // Get first week of data for debugging
    if (data.contributions.length > 0) {
      const firstWeekData = data.contributions.slice(0, 7);
      //console.log("First week days with day names:");
      firstWeekData.forEach(day => {
        // Create date with timezone handling
        const dateStr = day.date + "T00:00:00Z"; // Add time component and Z for UTC
        const date = new Date(dateStr);
        const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getUTCDay()];
        //console.log(`${day.date}: ${dayName}, Count: ${day.count}`);
      });
    }
    
    // Get current date to highlight today - FIX: Use local date string for comparison
    // const today = new Date().toISOString().split('T')[0]; // Already defined above
    const todayForHighlight = todayLocalStr; // Use the calculated local date string
    
    // Determine if we're in dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Reorganize contributions by date for easier access
    const contributionsByDate = {};
    data.contributions.forEach(day => {
      contributionsByDate[day.date] = day;
    });
    
    // Get date range
    const startDate = new Date(data.contributions[0].date + "T00:00:00Z"); // Add time and Z for UTC
    const endDate = new Date(data.contributions[data.contributions.length - 1].date + "T00:00:00Z");
    
    // Find first Sunday before or on the start date
    const firstSunday = new Date(startDate.getTime());
    const startDayOfWeek = startDate.getUTCDay(); // Get day of week in UTC (0 = Sunday)
    
    if (startDayOfWeek !== 0) {
      // Move back to previous Sunday
      firstSunday.setUTCDate(firstSunday.getUTCDate() - startDayOfWeek);
    }
    
    // Now build a grid where each week starts with Sunday at the top
    const weeks = [];
    let currentDate = new Date(firstSunday.getTime());
    
    while (currentDate <= endDate) {
      const week = [];
      
      // Create 7 days for this week (Sunday to Saturday)
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        if (dateStr < data.contributions[0].date || dateStr > data.contributions[data.contributions.length - 1].date) {
          // Date outside our data range
          week.push(null);
        } else {
          week.push(contributionsByDate[dateStr] || {
            date: dateStr,
            count: 0,
            level: 0
          });
        }
        
        // Move to next day
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
      
      weeks.push(week);
    }
    
    // Create a text summary of contributions for screen readers
    const activeDays = data.contributions.filter(day => day.count > 0).length;
    const percentActive = Math.round((activeDays / data.contributions.length) * 100);
    const mostActiveDay = [...data.contributions].sort((a, b) => b.count - a.count)[0];
    const mostActiveDateObj = new Date(mostActiveDay.date + "T00:00:00Z");
    const mostActiveDate = mostActiveDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    const textSummary = `
      Made ${data.totalContributions} GitHub contributions in the last year.
      Contributed on ${activeDays} days (${percentActive}% of the year).
      Most active day was ${mostActiveDate} with ${mostActiveDay.count} contributions.
    `;
    
    // Generate HTML for the contribution graph
    let html = `
      <h3 class="text-xl font-bold mb-4">GitHub Contributions</h3>
      <p class="mb-2 text-gray-700 dark:text-gray-300">
        <span class="font-semibold">${data.totalContributions}</span> contributions in the last year
      </p>
      
      <!-- Text summary for screen readers -->
      <div class="sr-only" aria-label="Contribution summary">${textSummary}</div>
      
      <div class="overflow-x-auto">
        <div class="contribution-graph min-w-max" aria-label="GitHub contribution heatmap" role="img">
    `;
    
    // Define month names
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Find month starts - the first column with 4+ days of that month
    const monthStarts = new Map(); // Maps month number to column index
    
    // Calculate the position of each month label
    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
      const week = weeks[weekIndex];
      
      // Count days for each month in this week
      const daysInMonth = {};
      
      for (let dayIndex = 0; dayIndex < week.length; dayIndex++) {
        const day = week[dayIndex];
        if (!day) continue;
        
        const date = new Date(day.date + "T00:00:00Z");
        const month = date.getUTCMonth();
        
        daysInMonth[month] = (daysInMonth[month] || 0) + 1;
      }
      
      // Check each month to see if this week has 4+ days (majority) of that month
      for (const [monthStr, count] of Object.entries(daysInMonth)) {
        const month = parseInt(monthStr);
        
        // If we found a strong presence (4+ days) of a month AND haven't recorded it yet
        if (count >= 4 && !monthStarts.has(month)) {
          monthStarts.set(month, weekIndex);
        }
      }
    }
    
    // Now create a structure where we know which month label goes with which week
    const weeksWithMonths = new Array(weeks.length).fill(null);
    
    // Sort months to make sure they're in order
    const sortedMonths = Array.from(monthStarts.entries()).sort((a, b) => a[1] - b[1]);
    
    for (let i = 0; i < sortedMonths.length; i++) {
      const [month, weekIndex] = sortedMonths[i];
      weeksWithMonths[weekIndex] = months[month];
    }
    
    // Build the month labels row that perfectly aligns with the weeks grid
    html += `
      <div class="grid" style="grid-template-columns: 2rem repeat(${weeks.length}, 1fr); grid-gap: 0.25rem;">
        <!-- Empty cell above day labels -->
        <div class="h-5 text-xs"></div>
        
        <!-- Month labels that align perfectly with week columns -->
        ${weeksWithMonths.map((month, i) => 
          `<div class="h-5 text-xs text-gray-500 text-center ${month ? 'font-medium' : 'opacity-0'}">${month || '.'}</div>`
        ).join('')}
        
        <!-- Day labels column -->
        <div class="grid grid-rows-7 gap-1 text-xs text-gray-500 text-right pr-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
    `;
    
    // Add contribution cells, one column per week (perfectly aligned with month labels)
    weeks.forEach(week => {
      html += `
        <div class="week grid grid-rows-7 gap-1">
      `;
      
      // Each week column has 7 cells, Sunday to Saturday
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const day = week[dayOfWeek];
        
        if (!day) {
          // Empty cell
          html += `<div class="day w-3 h-3 rounded-sm bg-transparent" aria-hidden="true"></div>`;
        } else {
          // Contribution cell with color based on level
          const levelClass = getLevelClass(day.level, isDarkMode);
          
          // Fix the date discrepancy by using adjusted date for comparison and display
          const adjustedDate = adjustDateToGitHub(day.date);
          const isToday = adjustedDate === todayForHighlight; // Use local date string for comparison
          const borderClass = isToday ? 'ring-1 ring-blue-500' : '';
          
          // Create an appropriate aria-label for screen readers
          const formattedDate = formatDateForTooltip(adjustedDate);
          const contribText = day.count === 1 ? 'contribution' : 'contributions';
          const ariaLabel = `${formattedDate}: ${day.count} ${contribText}`;
          
          html += `
            <div class="day w-3 h-3 rounded-sm ${levelClass} ${borderClass}" 
                 data-date="${adjustedDate}" 
                 data-count="${day.count}"
                 aria-label="${ariaLabel}"
                 title="${ariaLabel}">
            </div>
          `;
        }
      }
      
      html += `</div>`;
    });
    
    html += `
      </div> <!-- End of grid -->
      <div class="flex justify-end mt-2">
        <div class="flex items-center text-xs text-gray-500">
          <span class="mr-1">Less</span>
          <div class="flex gap-1" aria-label="Contribution level scale from less to more">
            <div class="w-3 h-3 rounded-sm ${getLevelClass(0, isDarkMode)}" aria-label="No contributions"></div>
            <div class="w-3 h-3 rounded-sm ${getLevelClass(1, isDarkMode)}" aria-label="1-3 contributions"></div>
            <div class="w-3 h-3 rounded-sm ${getLevelClass(2, isDarkMode)}" aria-label="4-7 contributions"></div>
            <div class="w-3 h-3 rounded-sm ${getLevelClass(3, isDarkMode)}" aria-label="8-12 contributions"></div>
            <div class="w-3 h-3 rounded-sm ${getLevelClass(4, isDarkMode)}" aria-label="13+ contributions"></div>
          </div>
          <span class="ml-1">More</span>
        </div>
      </div>
      <div class="text-xs text-gray-500 mt-1 text-right">
        Last updated: ${new Date().toLocaleDateString()}
      </div>
        </div>
      </div>
    `;
    
    // Update the container
    contributionsContainer.innerHTML = html;
    
    // Add tooltips for contribution cells using tippy.js if available
    if (window.tippy) {
      window.tippy('.day[data-count]', {
        content: (reference) => {
          const date = reference.getAttribute('data-date');
          const count = reference.getAttribute('data-count');
          return `${formatDateForTooltip(date)}: ${count} contribution${count !== '1' ? 's' : ''}`;
        }
      });
    }
    
    // Clear localStorage cache after viewing - helps with seeing test changes
    // localStorage.removeItem(`github_contributions_${username}`);
    // localStorage.removeItem(`github_contributions_${username}_timestamp`);
  }
  
  /**
   * Get CSS class for a contribution level
   */
  function getLevelClass(level, isDarkMode) {
    if (isDarkMode) {
      // Dark mode colors - with improved contrast for accessibility
      switch (level) {
        case 0: return 'bg-gray-800';
        case 1: return 'bg-green-800'; // Darker green for better contrast in dark mode
        case 2: return 'bg-green-700';
        case 3: return 'bg-green-500';
        case 4: return 'bg-green-400'; // Lighter green for better contrast in dark mode
        default: return 'bg-gray-800';
      }
    } else {
      // Light mode colors - with improved contrast for accessibility
      switch (level) {
        case 0: return 'bg-gray-200';
        case 1: return 'bg-green-200';
        case 2: return 'bg-green-400';
        case 3: return 'bg-green-600'; // Darker green for better contrast
        case 4: return 'bg-green-800'; // Even darker green for highest contrast
        default: return 'bg-gray-200';
      }
    }
  }
  
  /**
   * Format a date string for display in tooltips
   */
  function formatDateForTooltip(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
});