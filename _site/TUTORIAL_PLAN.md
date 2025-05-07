# Portfolio Tutorial Series: Building My Portfolio - An AI-Assisted Journey

This document outlines the detailed plan for a multi-part blog series detailing the creation of this Jekyll-based portfolio website, emphasizing AI collaboration, rapid development, and secure GitHub API integration via an Azure Function App.

## Overall Narrative Themes:

*   **AI as a Collaborator:** Consistently highlight how AI tools (Claude, Gemini) were used in planning, problem-solving, code generation, and refinement.
*   **Rapid Development:** Emphasize the "less than a week" timeline and how planning, AI, and chosen technologies contributed to this.
*   **Solving Static Site Limitations:** Showcase how challenges like dynamic content and secure API calls were overcome for a GitHub Pages site.
*   **Learning Journey:** Frame the project as a learning experience, particularly in implementing the Azure Function proxy.

---

## Part 1: Conception & Collaboration: Planning a Dynamic Portfolio with AI on a Static Platform

*   **Goal:** To chronicle the crucial initial planning phase, emphasizing the strategic decisions and AI partnership that set the stage for rapid development.
*   **Key Sections & Details:**
    *   **1.1. The Vision: More Than Just Static**
        *   Describe the initial ambition: A professional, *dynamic* portfolio (showcasing Full Stack, Cloud, AI skills, and personal interests) on GitHub Pages, built *quickly* and free, no money needed.
        *   What "dynamic" meant in this context: live GitHub activity, project updates, etc.
    *   **1.2. The GitHub Pages Challenge: Static Site, Dynamic Dreams**
        *   Explain the core constraint: GitHub Pages serves static files. How do you bring in dynamic content without a traditional backend?
        *   Discuss initial thoughts and hurdles.
    *   **1.3. Partnering with AI: Claude & Gemini as Co-Planners**
        *   **Narrative:** "My AI assistants and I embarked on a planning spree..."
        *   **Details:**
            *   **Development Environment:** Mentioning the use of **Cursor** as the IDE, which facilitated seamless AI integration and collaboration throughout the project.
            *   Brainstorming technologies: Why Jekyll? Why Tailwind CSS? How AI helped weigh pros and cons.
            *   Exploring solutions for dynamic data: Initial ideas, potential pitfalls AI helped identify.
            *   Example AI interactions (conceptual): "I asked Claude, 'How can I display my latest GitHub commits on a static Jekyll site securely?'" or "Gemini, help me outline the structure for a portfolio that needs X, Y, and Z features."
            *   How AI helped in structuring the `PLANNING.MD` document itself.
    *   **1.4. The Architectural Cornerstone: Secure GitHub API Access**
        *   **The Problem:** The need to fetch data from the GitHub API (which requires authentication for better rate limits and private data access if ever needed) without exposing API keys or tokens in client-side JavaScript. Explain *why* this is a security risk.
        *   **The AI-Informed Solution:**
            *   Introduce the concept of a server-side proxy.
            *   How discussions with AI led to the idea of using a serverless function (Azure Functions) as a lightweight, cost-effective proxy.
            *   Reference the `portfolioWebsitegithubAuth` Azure Function App and the `rivie13/github-api-proxy-function` repository. Explain its purpose: to act as a secure intermediary, handling authentication and forwarding requests.
            *   Mention this was a key learning goal: to implement such a secure bridge.
    *   **1.5. From Ideas to Blueprint: Solidifying the Plan**
        *   How the iterative discussions and AI feedback culminated in a clear plan (referencing `PLANNING.MD`).
        *   The confidence gained from this robust planning phase.
    *   **1.6. The "Less Than a Week" Feat: Setting the Pace**
        *   Reiterate the rapid development timeline.
        *   Attribute this speed to thorough AI-assisted planning and clear architectural decisions made upfront.

---

## Part 2: Laying the Foundation: Jekyll Setup and Styling with Tailwind CSS

*   **Goal:** To guide readers through the initial setup of the Jekyll site and the application of a modern styling approach with Tailwind CSS.
*   **Key Sections & Details:**
    *   **2.1. Jekyll: The Static Site Engine**
        *   Briefly reiterate why Jekyll was chosen (GitHub Pages native support, simplicity for content).
        *   **Core Setup:**
            *   Creating the Jekyll directory structure: `_layouts`, `_includes`, `_data`, `assets`, `_posts`.
            *   `_config.yml`: Essential configurations (e.g., `title`, `email`, `description`, `url`, `github_username`, `google_adsense`). Show relevant snippets.
            *   The `Gemfile`: Managing Jekyll and plugin versions.
    *   **2.2. Crafting the Skeleton: Default Layout and Includes**
        *   `_layouts/default.html`:
            *   Its role as the main template.
            *   Walkthrough its structure: `<!DOCTYPE html>`, `<head>` (meta tags, `{% seo %}`, CSS links, **`{% include google-tag.html %}` for Google Analytics**), `<body>` (`{% include header.html %}`, `{{ content }}`, `{% include footer.html %}`, JS script loading).
            *   Highlight the inclusion of multiple CSS files and the dark mode script.
        *   `_includes/header.html`: Site navigation.
        *   `_includes/footer.html`: Copyright, social links, contact info.
    *   **2.3. Bringing Pages to Life: Initial Content**
        *   Creating basic Markdown pages: `index.md`, `about.md`.
        *   YAML Front Matter essentials: `layout`, `title`, `permalink`.
    *   **2.4. Styling with Tailwind CSS: Utility-First Approach**
        *   Integrating Tailwind CSS via the CDN link in `default.html`.
        *   The philosophy of utility-first CSS and how it aids rapid UI development.
        *   Show simple examples of Tailwind classes used in `header.html` or a basic page.
    *   **2.5. Custom Styling Layers: Beyond Tailwind**
        *   The purpose of `assets/css/main.css`: For global styles, overrides, or custom components not easily achieved with Tailwind alone.
        *   `assets/css/animations.css`: Adding subtle animations (transitions, hover effects).
        *   `assets/css/responsive.css`: Ensuring the site looks great on all devices.
        *   `assets/css/dark-mode.css`: Specific styles for the dark theme.
        *   The inline JavaScript in `default.html` for checking `localStorage` and applying the dark mode class to `<html>`.
    *   **2.6. Local Development: See It Live!**
        *   `bundle install` and `bundle exec jekyll serve`.
        *   The iterative cycle of coding and previewing.

---

## Part 3: Content Architecture: Structuring Data with Jekyll and Building Reusable Components

*   **Goal:** To demonstrate how to manage content effectively using Jekyll's data files and create a modular site with reusable include components.
*   **Key Sections & Details:**
    *   **3.1. Jekyll's Data Powerhouse: The `_data` Directory**
        *   **Narrative:** "Keeping content organized and easy to update."
        *   `_data/projects.yml`:
            *   Detailed structure of a project entry (name, description, detailed_description, url, github, demo, image, technologies, features, last_updated placeholder). Show an example.
        *   `_data/skills.yml`: How skills are categorized and listed.
        *   `_data/experience.yml`, `_data/education.yml`, `_data/certifications.yml`: Structuring resume information.
        *   Advantage: Separating content from presentation, making site-wide updates simpler.
    *   **3.2. Building Reusable Views: The Magic of `_includes`**
        *   **`_includes/project-card.html` Deep Dive:**
            *   The core component for displaying projects.
            *   Using Liquid's `{% for project in site.data.projects %}` to iterate.
            *   Accessing project data: `{{ project.name }}`, `{{ project.description }}`.
            *   Conditional logic: `{% if project.url %}`.
            *   **Crucial Link to JS:** Point out placeholders like `<span data-github-last-updated="{{ github_data_id }}">Loading...</span>` and the loading spinner for languages, explaining these will be populated by JavaScript.
        *   `_includes/header.html` and `_includes/footer.html`: Their role in site-wide consistency.
        *   Other specialized includes: `video-embed.html`, `cookie-consent.html`, ad-related includes (`header-ad.html`, etc.), showing modularity.
    *   **3.3. Setting Up the Blog: Sharing Your Voice**
        *   The `_posts` directory and filename convention: `YYYY-MM-DD-your-post-title.md`.
        *   **Essential Front Matter for Posts:**
            *   `layout: post`
            *   `title: "Your Post Title"`
            *   `date: YYYY-MM-DD HH:MM:SS -0500`
            *   `categories: [category1, category2]`
            *   `tags: [tag1, tag2]`
            *   `image: /assets/images/posts/your-image.jpg` (as per `MAINTENANCE.MD`).
        *   **Blog Layouts:**
            *   `_layouts/post.html`: The template for individual blog posts.
            *   `_layouts/category.html` and `_layouts/tag.html`: For displaying posts filtered by category or tag.
        *   Writing content in Markdown.

---

## Part 4: Dynamic Power: Secure GitHub API Integration via Azure Functions & Client-Side JavaScript

*   **Goal:** To unravel the complex JavaScript interactions, focusing on the secure GitHub API integration through the Azure Function App, and how this brings the portfolio to life. This is where the "AI-assisted vibe coding" for complex JS can be highlighted.
*   **Key Sections & Details:**
    *   **4.1. The Secure Gateway: Azure Function App (`portfolioWebsitegithubAuth`)**
        *   **Revisiting the "Why":** Reinforce the security need. Unsafe to expose GitHub tokens/client secrets in frontend JS for a public static site.
        *   **The Solution Architecture:**
            *   Explain the Azure Function App (`portfolioWebsitegithubAuth`) acts as a backend proxy.
            *   Reference its codebase: `rivie13/github-api-proxy-function`. Mention its key features from its README (handles authentication with tokens, passes rate limit info, CORS).
            *   Show the Azure portal screenshot (conceptually, as provided by the user) as evidence of the deployed function.
            *   **The Connection:** How the frontend JS is configured to make API calls to this Azure Function's URL (e.g., `https://portfolioWebsitegithubAuth.azurewebsites.net/api/github/users/...`).
    *   **4.2. Orchestrating API Calls: `assets/js/github-config.js`**
        *   This file's role: Centralizing GitHub username and, crucially, the logic to rewrite GitHub API URLs to point to your Azure Function proxy.
        *   **Show the `addClientId` function (or similarly named function) from this file,** demonstrating how it transforms a standard `https://api.github.com/` URL to `https://portfolioWebsitegithubAuth.azurewebsites.net/api/github/`.
    *   **4.3. Fetching and Displaying GitHub Data: The JavaScript Workhorses**
        *   **`assets/js/github-activity.js` Deep Dive:**
            *   `GitHubActivityFetcher` class:
                *   Fetching user events (pushes, PRs, issues, etc.) via the Azure proxy.
                *   Event filtering, formatting, and rendering the timeline.
                *   Client-side caching (`localStorage`) to minimize calls to the proxy.
                *   "Refresh" button functionality.
            *   `GitHubLastUpdatedFetcher` class:
                *   Fetching `pushed_at` or commit data for repositories via the Azure proxy.
                *   Populating the "Last updated: ..." fields in `project-card.html`.
                *   Client-side caching.
        *   **`assets/js/github-repos.js`, `assets/js/github-stats.js`, `assets/js/github-contributions.js`:**
            *   Briefly explain their roles in fetching other specific GitHub data (e.g., repo lists, contribution graphs/stats).
            *   Emphasize that all these API calls are routed through the Azure proxy via `github-config.js`.
        *   **`assets/js/project-cards.js`:**
            *   If this script is responsible for fetching/displaying language stats or other dynamic elements within project cards, detail that here.
        *   **`RequestQueueClient` (from `github-activity.js` or `github-repos.js`):**
            *   Explain this as an advanced technique (possibly developed with AI's help) to manage multiple API requests efficiently, preventing the site from overwhelming the Azure proxy or hitting GitHub's secondary rate limits too quickly.
        *   **AI in JS Development:** Discuss how AI might have helped with:
            *   Generating boilerplate for `fetch` requests.
            *   Structuring the JavaScript classes.
            *   Debugging asynchronous JavaScript.
            *   Implementing the caching logic.
    *   **4.4. Enhancing User Experience: Animations and Responsiveness**
        *   `assets/js/animations.js`: How it adds subtle UI effects (e.g., on scroll, hover).
        *   `assets/js/responsive.js`: Any JavaScript used to enhance responsiveness beyond CSS.
        *   `assets/js/main.js`: General site-wide JavaScript functionalities.
    *   **4.5. Final Touches and Going Live**
        *   Contact Form: Integrating Formspree (setup described in `PLANNING.MD`).
        *   Cookie Consent: The `_includes/cookie-consent.html` and its associated JS.
        *   **Analytics & Monetization:**
            *   **Google Analytics:** Integrating `_includes/google-tag.html` for website traffic analysis.
            *   **Google AdSense:** Integrating ad snippets (e.g., `_includes/header-ad.html`, `_includes/footer-ad.html`) for potential monetization.
        *   **Deployment: Automated with GitHub Actions for GitHub Pages**
            *   The simplicity of `git push` to the `main` branch triggering the deployment.
            *   **Detailed look at the GitHub Actions workflow file (`.github/workflows/jekyll.yml`):**
                *   Explain the `on: push` and `on: pull_request` triggers.
                *   Breakdown of the `build` job: checking out code, setting up Ruby, installing dependencies (`bundle install`), building the Jekyll site (`bundle exec jekyll build`), and uploading the artifact (`_site` folder).
                *   Breakdown of the `deploy` job: running only on pushes to `main`, configuring the GitHub Pages environment, and using the `actions/deploy-pages@v4` action to deploy the artifact.
                *   Mentioning the `permissions` block for `contents: read`, `pages: write`, and `id-token: write` required for the Actions to function correctly.
    *   **4.6. Reflection: Dynamic Power in Under a Week**
        *   Recap the journey, emphasizing how strategic planning, AI collaboration, and clever architectural choices (like the Azure proxy) enabled the creation of a feature-rich, dynamic portfolio on a static platform within a short timeframe.

---

This fleshed-out plan provides a much richer foundation for the tutorial series. It ensures all key aspects of your development process and the site's architecture are covered in adequate detail. 