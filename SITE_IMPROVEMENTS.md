# Site Improvements Plan

## Current Issues

### Index Page
- **Animation Missing**: "View All Projects" button is missing the animation that other elements have (THIS IS DONE)
- **GitHub Stats Accuracy**: Current GitHub stats may not be fully accurate despite using authentication - I am not sure if language stats are accurate, I want more stats added to this section (THIS IS DONE)
- **Contribution Chart**: The contribution chart needs to be implemented/created (THIS IS DONE)

### Projects Page
- **Loading Behavior Issues**: 
  - Shows "failed to load projects" message while still loading
  - Displays "no additional projects found" incorrectly
  - Loads everything at once and very slowly instead of progressively
  - Languages/stats only appear properly after page refresh, not on initial load
  - Loading appears to complete on second refresh but not first
- **Caching Problems**:
  - Lack of proper caching mechanism for projects
  - Projects should refresh once a day to check for new repos, language stats updates
  - Should only go through the full load process once a day to avoid GitHub API rate limits

#### Technical Details
- **Cache Mechanism**: Implement a cache mechanism for projects, activity, contributions, and stats
- **Cache Duration**: Currently set to 30 minutes in github-config.js, needs to be extended to 24 hours, will change depending on which cache is being used
- **Loading Timeout**: Hard-coded 5-second timeout in github-repos.js removes loading indicators regardless of actual completion
- **Error Handling**: "Failed to load projects" message appears when hitting rate limits or during slow loading
- **Request Queue**: 
  - Low concurrency (maxConcurrent: 1) with 1-second delays between requests causes very slow loading
  - No proper coordination between DOMContentLoaded events and API request completion
- **Loading Indicators**: No progress indicators showing how many repos/languages have been loaded
- **Race Conditions**: Possible race conditions between different scripts (project-cards.js, github-repos.js) accessing the API simultaneously
- **Cache Coordination**: Different caching mechanisms in different files (github-config.js, github-repos.js, project-cards.js) not properly coordinated

### New Features Needed
- **GitHub Contribution Chart**: Implement a contribution calendar/heatmap identical to GitHub's contribution graph
  - Should show daily contributions with varying shades of green based on activity level
  - Must be updated daily
  - Should use GraphQL API for more efficient data fetching

#### Technical Implementation Details
- **New File**: Create `assets/js/github-contributions.js` to implement the contribution chart
- **GraphQL Query**: Use GitHub's GraphQL API with the following query structure:
  ```graphql
  query($userName:String!) {
    user(login: $userName) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              color      # Color to use for the cell
              level      # Level 0-4 indicating contribution intensity
            }
          }
        }
      }
    }
  }
  ```
- **Authentication**: Use the existing auth mechanism in github-config.js to authenticate requests
- **Data Structure**: Process the response into a format suitable for rendering:
  ```javascript
  {
    totalContributions: 1234,
    contributions: [
      {
        date: "2023-01-01",
        count: 5,
        level: 2,
        color: "#39d353"  // Color code matching GitHub's levels
      },
      // more days...
    ]
  }
  ```
- **Visualization**: 
  - Create a grid of cells representing days
  - Use CSS grid for layout, matching GitHub's 7x53 grid (weekdays x weeks)
  - Apply appropriate color based on contribution level
  - Include tooltips showing date and contribution count on hover
- **Color Scheme**: Match GitHub's contribution colors:
  - Level 0 (no contributions): #ebedf0
  - Level 1 (1-3 contributions): #9be9a8
  - Level 2 (4-7 contributions): #40c463
  - Level 3 (8-12 contributions): #30a14e
  - Level 4 (13+ contributions): #216e39
- **Caching**: 
  - Cache the contribution data for 24 hours
  - Use the central caching mechanism in github-config.js
  - Update asynchronously in the background once per day
- **Responsive Design**: 
  - Ensure the chart scales appropriately on mobile devices
  - May need to adjust cell size or grid layout on smaller screens

#### Compatibility and Placement
- **Dark Mode Compatibility**: 
  - Provide alternative color scheme for dark mode
  - Light mode colors: standard GitHub green scale
  - Dark mode colors: #0d1117 (background), #39d353, #26a641, #006d32, #0e4429 (contribution levels)
- **Browser Compatibility**:
  - Test across Chrome, Firefox, Safari, and Edge
  - Use CSS Grid with appropriate fallbacks for older browsers
  - Ensure tooltip functionality works on touch devices
- **Placement in Index Page**:
  - Add to the GitHub statistics section in a new dedicated div
  - Title: "My GitHub Contributions"
  - Include total contributions count for the year
  - Show in a responsive container that maintains the aspect ratio
  - Include loading animation consistent with the rest of the site
- **Accessibility**:
  - Include aria labels for screen readers
  - Ensure color contrast meets WCAG standards
  - Provide text alternative summary of activity

## Potential Future Improvements

### Performance
- Optimize image loading and compression
- Implement lazy loading for off-screen content
- Consider static generation for certain components

### User Experience
- Add dark/light mode toggle
- Improve mobile responsiveness
- Add animations for page transitions

### Technical
- Improve SEO optimization
- Add analytics tracking
- Implement caching strategies for GitHub API calls
- Reduce API rate limit issues

## Priority Items
1. Fix animation on "View All Projects" button (DONE)
2. Implement accurate GitHub contribution chart (DONE)
3. Improve GitHub stats accuracy (DONE)
4. Fix Projects page loading and caching issues

## Notes
This document will be updated as improvements are made and new issues are identified. 