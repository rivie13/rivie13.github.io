---
layout: post
title: "Part 4: Dynamic Power - Secure GitHub API Integration via Azure Functions & Client-Side JavaScript"
date: 2025-05-18 10:00:00 -0500
categories: [Portfolio Tutorial, Development, Jekyll, JavaScript, Azure, Key Vault, Function App]
tags: [Jekyll, Static Sites, GitHub API, Azure Functions, Serverless, JavaScript, API Integration, Web Development, AI Collaboration, Portfolio Development]
image: /assets/images/tutorial-part4-banner.png # Placeholder - replace with actual image
---

<style>
/* Custom code block styling for this post */
.highlight {
  border-radius: 6px;
  margin: 1.5rem 0;
  padding: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

.highlight pre {
  padding: 1.25rem;
  margin: 0;
  overflow-x: auto;
  line-height: 1.5;
}

.highlight code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
}

/* Dark mode considerations */
html.dark .highlight {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
}

/* Different background colors for different language blocks */
.language-yaml .highlight { background-color: #f8fafc; border-left: 4px solid #4f46e5; }
.language-ruby .highlight { background-color: #fef2f2; border-left: 4px solid #dc2626; }
.language-html .highlight { background-color: #f0f9ff; border-left: 4px solid #0ea5e9; }
.language-css .highlight { background-color: #f5f3ff; border-left: 4px solid #a855f7; }
.language-bash .highlight { background-color: #f0fdf4; border-left: 4px solid #16a34a; }

/* Dark mode versions */
html.dark .language-yaml .highlight { background-color: #1e293b; border-left: 4px solid #4f46e5; }
html.dark .language-ruby .highlight { background-color: #350c0c; border-left: 4px solid #dc2626; }
html.dark .language-html .highlight { background-color: #082f49; border-left: 4px solid #0ea5e9; }
html.dark .language-css .highlight { background-color: #2e1065; border-left: 4px solid #a855f7; }
html.dark .language-bash .highlight { background-color: #052e16; border-left: 4px solid #16a34a; }
</style>
{% include code-style.html %}
<div class="opacity-0" data-animate="fade-in">
Welcome to the final and most exciting part of our tutorial series on building a dynamic portfolio with Jekyll, AI, and a sprinkle of serverless magic! In the previous installments, we laid the conceptual groundwork, set up our Jekyll site with Tailwind CSS, and structured our content for easy management. Now, we dive into the heart of the "dynamic" aspect: securely fetching and displaying GitHub data using an Azure Function App as a proxy and orchestrating it all with client-side JavaScript.

This is where our static site truly comes alive, showcasing real-time project updates and GitHub activity. We'll also cover the finishing touches like analytics, ads, and the automated deployment pipeline that makes it all seamless. Let's get started!
</div>



<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">4.1. The Secure Gateway: Azure Function App (<code>portfolioWebsitegithubAuth</code>)</h2>
<p>
As we discussed in Part 1, one of the primary challenges with displaying dynamic data from APIs on a static site like GitHub Pages is security. We need to interact with the GitHub API, which often requires authentication (like a personal access token) to get better rate limits and access certain information. Embedding such a token directly in client-side JavaScript would be a major security risk, as it would be visible to anyone inspecting the site's code.
</p>
<p><strong>The "Why" Revisited:</strong><br>
Exposing API keys or tokens in your frontend code is like leaving your house keys under the doormat – convenient, but not secure. Malicious actors could easily find and misuse your token, potentially exhausting your API rate limits, accessing private data (if your token has those permissions), or even performing actions on your behalf.
</p>
<p><strong>Our Solution: The Serverless Proxy</strong><br>
To circumvent this, we implemented a server-side proxy using Azure Functions. This serverless function, named <code>portfolioWebsitegithubAuth</code> (you can find its codebase at <a href="https://github.com/rivie13/github-api-proxy-function">rivie13/github-api-proxy-function</a> on GitHub), acts as a secure intermediary:
</p>
<ol>
  <li><strong>Client-Side Request:</strong> Our Jekyll site's JavaScript makes API requests to our Azure Function's endpoint.</li>
  <li><strong>Secure Authentication & Secret Retrieval:</strong> The Azure Function, running on the server-side, uses its managed identity to securely fetch sensitive configurations like the GitHub API token from Azure Key Vault (in this project, a vault named <code>codegrind-platform-kv</code>). The Function App's application settings use Key Vault References instead of storing secrets directly. This token is then used to authenticate with the actual GitHub API.</li>
  <li><strong>Data Forwarding:</strong> It fetches the requested data from GitHub.</li>
  <li><strong>Response to Client:</strong> It then forwards the data back to our client-side JavaScript, without ever exposing the sensitive token.</li>
</ol>
<p><strong>Key Features of the Azure Function Proxy:</strong></p>
<ul>
  <li><strong>Handles Authentication:</strong> Securely manages the GitHub API token by retrieving it from Azure Key Vault at runtime using Key Vault references. This means the token isn't stored directly in the Function App's configuration or code.</li>
  <li><strong>Passes Rate Limit Information:</strong> It can also relay GitHub's API rate limit headers back to the client, which helps in debugging and managing API usage.</li>
  <li><strong>CORS (Cross-Origin Resource Sharing):</strong> Configured to allow requests from our portfolio's domain.</li>
</ul>
<p>Here's a conceptual peek at where you might find your deployed function in the Azure portal (actual UI may vary):</p>
<img src="/assets/images/azure_function_app_screenshot.png" alt="Azure Function App Screenshot" style="width: 100%; height: auto;" class="mb-4">

<p><strong>The Connection:</strong><br>
All our frontend JavaScript that needs GitHub data is configured to make API calls to this Azure Function's URL (e.g., <code>https://portfolioWebsitegithubAuth.azurewebsites.net/api/github/...</code>) instead of directly to <code>https://api.github.com/...</code>.
</p>
<p>This setup not only secures our API token by keeping it out of direct application settings but also provides a centralized point for managing API interactions, which can be beneficial for logging, monitoring, or adding more complex logic in the future. This was a key learning goal for the project – to implement a secure and efficient bridge for API data on a static platform, following best practices for secrets management using Azure Key Vault.</p>
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">4.2. Orchestrating API Calls: <code>assets/js/github-config.js</code></h2>
{% include blog-ad.html %}





<p>With our secure Azure Function proxy in place, the next step is to ensure our client-side JavaScript knows how to use it. This is where <code>assets/js/github-config.js</code> comes into play.</p>
<p>This small but crucial file serves two main purposes:</p>
<ol>
  <li><strong>Centralizing GitHub Username:</strong> It stores your GitHub username, making it easy to update if needed.</li>
  <li><strong>Rewriting API URLs:</strong> Most importantly, it contains the logic to transform standard GitHub API URLs (<code>https://api.github.com/...</code>) into URLs that point to our Azure Function proxy.</li>
</ol>
<p>Let's look at a simplified version of the key function (the actual implementation might have more features like query parameter handling):</p>
<pre><code class="language-javascript">// assets/js/github-config.js (Simplified Example)
const GITHUB_USERNAME = 'your-github-username'; // Replace with your username
const PROXY_URL_BASE = 'https://portfolioWebsitegithubAuth.azurewebsites.net/api/github'; // Your Azure Function URL

function getProxiedGithubApiUrl(apiPath) {
  // Example: apiPath might be '/users/your-github-username/events'
  // Ensures no double slashes if apiPath starts with one
  const cleanApiPath = apiPath.startsWith('/') ? apiPath.substring(1) : apiPath;
  return `${PROXY_URL_BASE}/${cleanApiPath}`;
}

// Example usage (not in github-config.js itself, but how other scripts would use it):
// const userEventsUrl = getProxiedGithubApiUrl(`/users/${GITHUB_USERNAME}/events`);
// console.log(userEventsUrl); 
// Output: https://portfolioWebsitegithubAuth.azurewebsites.net/api/github/users/your-github-username/events
</code></pre>
<p>By abstracting this logic into <code>github-config.js</code>, all other JavaScript files that need to fetch GitHub data can simply call <code>getProxiedGithubApiUrl()</code> with the desired GitHub API path. This keeps the rest of our codebase cleaner and makes it easy to change the proxy URL or logic in one place if ever needed.</p>
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">4.3. Fetching and Displaying GitHub Data: The JavaScript Workhorses</h2>
<p>Now for the client-side JavaScript files that do the heavy lifting of fetching data (via our proxy, of course) and dynamically updating our portfolio's content. This is where the "AI-assisted vibe coding" I mentioned in Part 1 often came in handy, especially for structuring classes, handling asynchronous operations, and implementing caching.</p>
<p><strong><code>assets/js/github-activity.js</code> Deep Dive:</strong><br>
This script is responsible for fetching and displaying your recent GitHub activity on the homepage, creating that "live" feel. It typically involves two main classes:</p>
<ul>
  <li><strong>GitHubActivityFetcher Class:</strong>
    <ul>
      <li><strong>Fetching User Events:</strong> Makes <code>fetch</code> requests to the proxied endpoint for user events (e.g., <code>/users/${GITHUB_USERNAME}/events</code>). These events can include pushes, pull request creations, issue comments, etc.</li>
      <li><strong>Event Filtering & Formatting:</strong> Not all events might be relevant. This class filters them (e.g., only show 'PushEvent', 'PullRequestEvent', 'IssuesEvent') and formats them into a more readable HTML structure for the timeline.</li>
      <li><strong>Rendering the Timeline:</strong> Dynamically injects the formatted activity into a designated container on your homepage.</li>
      <li><strong>Client-Side Caching (<code>localStorage</code>):</strong> To avoid hitting the GitHub API (even via the proxy) on every single page load, which can be excessive and lead to rate limiting, this class implements client-side caching. Fetched activity is stored in <code>localStorage</code> with an expiry time. Subsequent visits will load from cache if the data is still fresh, significantly speeding up load times and reducing API calls.</li>
      <li><strong>"Refresh" Button Functionality:</strong> Often includes a button that allows users (or you, during development) to manually clear the cache and fetch the latest activity.</li>
    </ul>
  </li>
  <li><strong>GitHubLastUpdatedFetcher Class:</strong>
    <ul>
      <li><strong>Fetching Repository Data:</strong> For each project listed in <code>_data/projects.yml</code> that has a GitHub repository URL, this class fetches repository data, specifically looking for the <code>pushed_at</code> timestamp or the date of the last commit. This allows us to display "Last updated: ..." information on project cards.</li>
      <li><strong>Populating Fields:</strong> It finds the corresponding <code>&lt;span data-github-last-updated="{{ project.github_data_id }}"&gt;Loading...&lt;/span&gt;</code> elements (as discussed in Part 3) and updates their content with the fetched date.</li>
      <li><strong>Client-Side Caching:</strong> Similar to <code>GitHubActivityFetcher</code>, this class also uses <code>localStorage</code> to cache the last updated timestamps, improving performance.</li>
    </ul>
  </li>
</ul>
<p><strong>Other Key JavaScript Files:</strong></p>
<ul>
  <li><code>assets/js/github-repos.js</code>: If you have a dedicated section to list your public repositories, this script would fetch that list (e.g., from <code>/users/${GITHUB_USERNAME}/repos</code>) and display them, often with details like descriptions, stars, and languages. It also uses the proxy and caching.</li>
  <li><code>assets/js/github-stats.js</code> & <code>assets/js/github-contributions.js</code>: These might be used to fetch and display contribution statistics, like a contribution graph (though embedding GitHub's own graph image is often simpler) or language usage stats across your repositories. Again, all API calls are routed through the Azure proxy.</li>
  <li><code>assets/js/project-cards.js</code>: This script might be responsible for more dynamic elements within project cards beyond just the "last updated" date. For example, if you wanted to dynamically fetch and display the primary programming languages used in each project repository, this script (or a similar one) would handle that. It would parse the <code>languages_url</code> provided by the GitHub Repos API for each project.</li>
</ul>
<p><strong>The <code>RequestQueueClient</code> (Advanced Technique):</strong><br>
In some implementations, especially if you're making many API calls in quick succession (e.g., fetching language data for 20 projects), you might find a utility class like <code>RequestQueueClient</code>. My AI assistants were particularly helpful in conceptualizing and refining this. Its purpose is to:</p>
<ul>
  <li><strong>Manage Multiple API Requests:</strong> Instead of firing off all requests simultaneously, which could overwhelm the browser, the Azure proxy, or even hit GitHub's secondary rate limits (which are more complex than the primary hourly limit), a queue manages requests.</li>
  <li><strong>Concurrency Control:</strong> It sends a limited number of requests at a time (e.g., 3-5 concurrent requests).</li>
  <li><strong>Delay/Backoff:</strong> It can introduce slight delays between batches of requests.</li>
</ul>
<p>This ensures a smoother experience and more robust data fetching, especially for users with slower connections or when many data points need to be loaded.</p>
<p><strong>AI in JS Development:</strong><br>
Throughout the development of these JavaScript modules, AI played a significant role:</p>
<ul>
  <li><strong>Boilerplate Generation:</strong> "Generate a JavaScript class <code>GitHubFetcher</code> that takes a URL, fetches JSON, and has a method to get the data."</li>
  <li><strong>Asynchronous Logic:</strong> Helping structure <code>async/await</code> calls and <code>Promise</code> handling correctly.</li>
  <li><strong>Debugging:</strong> "Why is this <code>fetch</code> call returning undefined?" or "How do I properly handle errors in this Promise chain?"</li>
  <li><strong>Caching Implementation:</strong> "Show me how to cache API responses in <code>localStorage</code> with an expiration time."</li>
  <li><strong>Refinement:</strong> Suggesting better variable names, ways to break down complex functions, or more efficient data manipulation techniques.</li>
</ul>
<p>The ability to quickly iterate on JavaScript logic with an AI assistant like those in Cursor dramatically sped up the development of these dynamic features.</p>
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">4.4. Enhancing User Experience: Animations and Responsiveness</h2>
<p>A dynamic site isn't just about data; it's also about how the user experiences that data. Subtle animations and a responsive design contribute significantly to a polished feel.</p>
<ul>
  <li><code>assets/js/animations.js</code>: This script typically handles UI effects. For instance:
    <ul>
      <li><strong>Scroll-based Animations:</strong> Elements fading in or sliding into view as the user scrolls down the page (often using the Intersection Observer API for performance). You might have seen <code>data-animate="fade-in"</code> attributes in the HTML – this script would bring them to life.</li>
      <li><strong>Hover Effects:</strong> More complex hover effects that might require JavaScript.</li>
    </ul>
  </li>
  <li><code>assets/js/responsive.js</code>: While most responsiveness is handled by Tailwind CSS's utility classes and custom CSS in <code>assets/css/responsive.css</code>, there might be cases where JavaScript is needed to enhance responsive behavior. For example, dynamically changing an element's properties or behavior based on screen size if CSS alone isn't sufficient.</li>
  <li><code>assets/js/main.js</code>: This can be a catch-all for general site-wide JavaScript functionalities, like:
    <ul>
      <li><strong>Dark Mode Toggle:</strong> The logic to switch between light and dark themes and save the user's preference in <code>localStorage</code>.</li>
      <li><strong>Mobile Navigation Toggle:</strong> Handling the opening and closing of a mobile menu.</li>
      <li><strong>Smooth Scrolling:</strong> Implementing smooth scrolling for anchor links.</li>
    </ul>
  </li>
</ul>
<p>These scripts add that layer of polish that makes the site feel modern and engaging.</p>
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">4.5. Final Touches and Going Live</h2>
<p>With the core dynamic features in place, it's time for the final touches before fully going live and setting up the automated deployment.</p>
<p><strong>Contact Form (Formspree):</strong><br>
As detailed in <code>PLANNING.MD</code> and briefly in Part 1, integrating a contact form on a static site usually requires a third-party service. I used <a href="https://formspree.io/">Formspree</a>.
<ul>
  <li><strong>Setup:</strong> You create an account, set up a new form, and Formspree provides you with an endpoint URL.</li>
  <li><strong>HTML:</strong> You add a standard HTML form to your contact page, pointing its <code>action</code> attribute to your Formspree endpoint and setting the <code>method</code> to <code>POST</code>.</li>
  <li><strong>Result:</strong> When a user submits the form, the data is sent to Formspree, which then forwards it to your email address. No backend code needed on your site!</li>
</ul>
</p>
<p><strong>Cookie Consent:</strong><br>
To comply with privacy regulations like GDPR, a cookie consent banner is often necessary, especially if you're using analytics or ads.
<ul>
  <li><code>_includes/cookie-consent.html</code>: This include likely contains the HTML markup for the banner.</li>
  <li><strong>Associated JS:</strong> A small JavaScript snippet (perhaps in <code>main.js</code> or its own file) handles showing the banner, and then hiding and setting a cookie or <code>localStorage</code> item when the user accepts, so they don't see the banner on every page or visit.</li>
</ul>
</p>
<p><strong>Analytics & Monetization:</strong></p>
<ul>
  <li><strong>Google Analytics:</strong>
    <ul>
      <li><strong>Integration:</strong> This is typically done by including a JavaScript snippet provided by Google Analytics. In our Jekyll setup, this is neatly handled by <code>_includes/google-tag.html</code>, which is then included in <code>_layouts/default.html</code>.</li>
      <li><strong>Purpose:</strong> Allows you to track website traffic, user behavior (pages visited, time on site), referral sources, and much more. Essential for understanding your audience and improving your content.</li>
    </ul>
  </li>
  <li><strong>Google AdSense:</strong>
    <ul>
      <li><strong>Integration:</strong> If you choose to monetize your site with ads, Google AdSense provides ad code snippets. These are placed in your HTML where you want ads to appear. We used includes like <code>_includes/header-ad.html</code> and <code>_includes/footer-ad.html</code> (and potentially in-article ad includes) to manage these.</li>
      <li><strong>Purpose:</strong> Displays targeted ads on your site, allowing you to earn revenue from impressions or clicks. The <code>_config.yml</code> might have a setting to easily enable/disable ads site-wide.</li>
    </ul>
  </li>
</ul>
<p>This automated workflow means your site is always up-to-date with the latest changes in your <code>main</code> branch, without any manual intervention for deployment.</p>
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">4.6. Reflection: Dynamic Power in Under a Week – The Grand Finale!</h2>
<p>And there we have it! From initial concept to a fully dynamic, feature-rich portfolio, all built on a static hosting platform (GitHub Pages) and accomplished in <strong>less than a week</strong>.</p>
<p>This journey has showcased several key themes:</p>
<ul>
  <li><strong>Strategic Planning is Paramount:</strong> The initial planning phase, heavily assisted by AI, was crucial in defining the architecture and identifying solutions to potential roadblocks (like secure API access). This upfront investment saved immense time during development.</li>
  <li><strong>AI as a True Collaborator:</strong> Throughout this project, AI tools (Claude, Gemini, particularly within the Cursor IDE) served as invaluable partners. They helped brainstorm, generate code, debug complex JavaScript, refine content, and even structure documentation. This isn't about AI replacing developers, but augmenting their capabilities for incredible speed and efficiency.</li>
  <li><strong>Overcoming Static Site Limitations:</strong> The Azure Function App proxy is a testament to how creative architectural choices can bring dynamic capabilities to static hosting environments, securely and cost-effectively.</li>
  <li><strong>The Power of Modern Tooling:</strong> Jekyll for content management, Tailwind CSS for rapid UI development, GitHub Actions for CI/CD, and serverless functions like Azure Functions collectively provide a powerful, efficient, and often free (or very low-cost) stack for building sophisticated web projects.</li>
  <li><strong>Continuous Learning:</strong> Implementing the Azure Function proxy and some of the more complex JavaScript interactions were fantastic learning experiences, pushing the boundaries of what I thought was quickly achievable on a static site.</li>
</ul>
<p>Building this portfolio was not just about creating an online presence; it was an exercise in rapid development, problem-solving, and effective AI collaboration. The result is a site that not only showcases my work but also tells the story of its own creation – a story I hope has been insightful and inspiring for you through this tutorial series.</p>
<p>Thank you for following along! I encourage you to experiment with these technologies and see how AI can supercharge your own development workflows.<br><br></p>

<hr>
<br>
<p><strong>What's Next?</strong></p>
<ul>
  <li>Explore the live portfolio and see these features in action!</li>
  <li>Dive into the <a href="https://github.com/rivie13/rivie13.github.io">source code on GitHub</a> to see all the details.</li>
  <li>Check out the <a href="https://github.com/rivie13/github-api-proxy-function">Azure Function proxy code</a>.</li>
  <li>Leave a comment below with your thoughts or questions!</li>
</ul>
<p>Happy coding!</p>
</div> 