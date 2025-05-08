---
layout: null
published: false
---

# Portfolio Website Redesign Plan (Jekyll on GitHub Pages)

## 1. Project Goal

Transform the existing basic HTML/CSS GitHub Pages site (`rivie13.github.io`) into a modern, professional portfolio. The new site should:
*   Showcase skills and experience in Full Stack Development, Cloud/Solutions Architecture, and AI Development.
*   Highlight personal interests (Coding, Music, Math - including Associate's degree).
*   Offer services as a freelancer and state openness to contract/full-time roles.
*   Dynamically display recent public activity from GitHub.
*   Feature key projects including CodeGrind, Helios, BestNotes, and Projectile Launcher Rework.
*   Incorporate resume information and professional experience.
*   Be easy to maintain and update.
*   Have a distinct and appealing design.

## 2. Technology Choice

*   **Static Site Generator:** Jekyll (natively supported by GitHub Pages)
*   **Styling:** Custom CSS using Tailwind CSS framework for maximum design flexibility and control over animations/themes
*   **Dynamic Content:** Client-side JavaScript to fetch data from the GitHub API (staying within free tier limits)
*   **Contact Form:** Formspree (confirmed)
*   **Video Hosting:** YouTube embeds for video content
*   **Site Hosting:** GitHub Pages

## 3. Phase 1: Jekyll Setup & Basic Conversion

*   **Step 1.1: Backup Current Site (Optional but Recommended)**
    *   Create a new branch (e.g., `git checkout -b legacy-site`) or copy the existing files (`index.html`, `projects.html`, `music.html`, `blog.html`, `style.css`, `script.js`, `media/`) to a local backup folder.
*   **Step 1.2: Clean Repository (on `main` branch)**
    *   Delete existing HTML files: `index.html`, `music.html`, `projects.html`, `blog.html`.
    *   Delete `script.js`.
    *   Keep `style.css` *temporarily* for content/style reference if needed, but plan to delete it later.
    *   Keep the `media/` directory for now.
*   **Step 1.3: Create Jekyll Directory Structure**
    *   Create root file: `_config.yml`
    *   Create directory: `_layouts/`
    *   Create directory: `_includes/`
    *   Create directory: `assets/`
    *   Create subdirectories within `assets/`: `css/`, `js/`, `images/`, `videos/` (for thumbnail images of videos)
    *   Create directory: `_data/` (for structured data like projects, skills)
    *   Create directory: `_posts/` (for blog entries)
    *   Move contents of `media/` into `assets/images/`. Delete the empty `media/` directory.
    *   Create root Markdown files: `index.md`, `about.md`, `projects.md`, `services.md`, `contact.md`, `resume.md` (for dedicated resume page), `blog.md` (for blog index). (Consider renaming `blog.html` concept to a Jekyll blog later if desired).
*   **Step 1.4: Configure `_config.yml`**
    *   Add basic site settings: `title`, `email` (riviera.t.sperduto13@gmail.com), `description`, `baseurl` (likely empty ""), `url` ("https://rivie13.github.io"), `github_username` (rivie13).
    *   Add necessary plugins, e.g., `jekyll-seo-tag`, `jekyll-paginate` (for blog pagination).
    *   Specify Markdown processor (e.g., `kramdown`).
    *   Add social media links (GitHub, LinkedIn).
*   **Step 1.5: Create Default Layout (`_layouts/default.html`)**
    *   Set up basic HTML5 structure (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`).
    *   Add `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
    *   Use Liquid tags for title: `<title>{{ page.title }} | {{ site.title }}</title>`.
    *   Include basic SEO tags (or rely on `jekyll-seo-tag` plugin via `{% seo %}`).
    *   Link to Tailwind CSS: `<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">`
    *   Link to custom CSS file: `<link rel="stylesheet" href="{{ '/assets/css/main.css' | relative_url }}">`.
    *   Include placeholders for header, footer, and page content: `{% include header.html %}`, `{{ content }}`, `{% include footer.html %}`.
    *   Link to main JS file(s) before closing `</body>` if needed.
*   **Step 1.6: Create Header/Footer Includes (`_includes/header.html`, `_includes/footer.html`)**
    *   `header.html`: Create the main site navigation (`<nav>`). Link to Home (`/`), About (`/about/`), Projects (`/projects/`), Services (`/services/`), Resume (`/resume/`), Blog (`/blog/`), Contact (`/contact/`). Use `relative_url` filter for links.
    *   `footer.html`: Add copyright notice (`&copy; {% now 'YYYY' %} {{ site.title }}.`), links (e.g., GitHub profile, LinkedIn profile), or other relevant footer info. Include contact information (phone: 267-340-6316, email: riviera.t.sperduto13@gmail.com).
*   **Step 1.7: Populate Basic Pages (`.md` files)**
    *   Add YAML Front Matter to *each* `.md` file:
        ```yaml
        ---
        layout: default
        title: Page Title (e.g., Home)
        permalink: /page-url/ # Optional, e.g., /about/ (index.md uses /)
        ---
        ```
    *   Copy/paste relevant text content from old HTML files into the corresponding Markdown files (`index.md`, `about.md`). Convert basic formatting to Markdown.
    *   Add placeholder text to `projects.md`, `services.md`, `contact.md` (e.g., "# Projects

Coming soon...").
    *   Create `resume.md` with content from the user's resume, formatted in Markdown.
    *   Set up `blog.md` as an index page that will list blog posts.
*   **Step 1.8: Basic Styling (`assets/css/main.css`)**
    *   Create `assets/css/main.css`.
    *   Add custom CSS to extend Tailwind as needed. Focus on structure, not final design yet.
    *   Delete the old `style.css` file.
*   **Step 1.9: Local Testing**
    *   Ensure Ruby and Jekyll are installed (`gem install bundler jekyll`).
    *   Create a `Gemfile` in the root with `source "https://rubygems.org"; gem "jekyll"` (add plugins like `jekyll-seo-tag`, `jekyll-paginate` here too).
    *   Run `bundle install`.
    *   Run `bundle exec jekyll serve`.
    *   Open `http://localhost:4000` in browser. Verify:
        *   Pages render without errors.
        *   Navigation links work.
        *   Basic content is displayed.
        *   Layout (`default.html`) is applied.

## 4. Phase 2: Content Enhancement & Feature Implementation

*   **Step 2.1: Set Up Tailwind CSS Integration**
    *   Install necessary npm packages for a proper Tailwind setup with PostCSS.
    *   Configure Tailwind to purge unused CSS in production for smaller file sizes.
    *   Set up a color palette for the site (dark blue/gray with accent colors).
    *   Define typography styles using modern sans-serif fonts (Inter, Roboto, or similar).
    *   Create utility classes for animations and transitions to use throughout the site.
*   **Step 2.2: Design Home Page (Bio-Focused with Project Highlights)**
    *   Create a visually appealing bio section at the top with professional photo.
    *   Add a brief professional summary and key skills.
    *   Design a "Featured Projects" section below showing CodeGrind and Helios with brief descriptions and eye-catching visuals.
    *   Add a GitHub activity widget showing 5 most recent meaningful activities.
    *   Include call-to-action buttons to resume, services, and contact sections.
*   **Step 2.3: Populate `Projects` Page (`projects.md`) and Create Project Data**
    *   Create `_data/projects.yml` with detailed information about key projects:
        *   **CodeGrind**: React/Node.js, HTML/CSS, Python, PostgreSQL, Prisma, Microsoft Azure
            *   URL: https://codegrind.online/
            *   Demo Link: [To be added later]
            *   Description: Gamified technical interview preparation platform with AI tutoring assistant
            *   Features: AI guidance without explicit answers, community-contributed problem sets
            *   Future plans: Expansion into comprehensive learning platform
            *   Screenshots: Multiple screenshots showing UI and functionality
            *   Last Updated: [Pull from GitHub API]
        *   **Helios (Capstone Project)**: ASP.NET, Python, C#, Unity
            *   Description: Swarm Robotics platform for disaster scenario simulations
            *   Repository 1: [Robotics-Nav2-SLAM-Example](https://github.com/rivie13/Robotics-Nav2-SLAM-Example) - Base product with Unity components for Navigation2's SLAM tutorial
            *   Repository 2: [Helios](https://github.com/rivie13/Helios) - Release product for capstone project
            *   Features:
                * Frameless PyQt5 GUI with custom title bar
                * Dynamically loaded Unity scenarios for disaster simulations (wildfire, earthquake, flood, tornado, search & rescue, hazmat)
                * PDF export with graph visualizations (temperature, humidity, battery, position)
                * Socket communication with Unity for live sensor data
                * Custom Unity environment using Robotics Warehouse randomizable environment
                * Integration with ROS 2 for robotics navigation
            *   Technologies: ASP.NET, Python, Unity, PyQt5, Socket Communication, ROS 2, C#
            *   Screenshots: Multiple screenshots showing interface and visualizations
            *   Last Updated: [Pull from GitHub API]
        *   **BestNotes**: Python, Qt Core, Pyside6
            *   Description: Free, open-source note-taking application 
            *   Features: Moveable toolbar, customizable eraser features
            *   Testing: Application reliability and code coverage metrics
            *   Last Updated: [Pull from GitHub API]
        *   **Projectile Launcher Rework**: Lua, YAML, JSON, RedScript
            *   Description: Mod for Cyberpunk 2077 with 45k+ downloads
            *   Features: Modified game mechanics, new variants, attachments, and ammo
            *   Last Updated: [Pull from GitHub API]
        *   **Book Player Application**: Kotlin (Mobile Dev final project)
            *   Description: [Add details about the book player application]
            *   Features: [Add key features]
            *   Last Updated: [Pull from GitHub API]
        *   Include information about other GitHub repositories as needed
    *   Create a standard project card template in `_includes/project-card.html` to display each project with:
        *   Title, description, technologies used
        *   Last updated date (pulled from GitHub API)
        *   Links to repo, demo, etc.
        *   Screenshots or preview images
    *   Iterate through project data in `projects.md` using Liquid (`{% for project in site.data.projects %}`).
    *   Style the project display as cards in a responsive grid layout.
    *   Create a dedicated section or page for the Helios project with more detailed information, given its importance as a capstone project.
    *   Similarly create an in-depth section for CodeGrind.
*   **Step 2.4: Create `Skills` Data and Resume Page**
    *   Create `_data/skills.yml` with categories:
        *   **Languages**: Python, Kotlin, Java, C/C++, SQL (MySQL & Postgres), JavaScript, HTML/CSS, YAML, Lua, RedScript
        *   **Frameworks**: Testim.io, Microsoft Active Directory
        *   **Developer Tools**: Git/GitHub, Docker, Microsoft Azure, VS Code, Visual Studio, PyCharm, IntelliJ, MariaDB, Dependency Track, Microsoft Power Automate, Prisma, Ollama
        *   **Libraries**: Qt Core, Pyside6, Meraki, GUIZero, React
    *   Create `_data/experience.yml` with:
        *   SNIPES USA (IT Intern) - Sept 2024 to Dec 2024
        *   Temple University (Student Worker/Intern) - Oct 2023 to Present
    *   Create `_data/education.yml` with Temple University details
    *   Create `_data/certifications.yml` with Microsoft Azure Fundamentals
    *   Format `resume.md` to display this structured data in an attractive layout
    *   Add a button to download PDF version of resume
*   **Step 2.5: Populate `Services` Page (`services.md`)**
    *   Write detailed descriptions for Full Stack, Cloud/Solutions Architect, and AI Developer services.
    *   Clearly state availability and preferred engagement types (freelance, contract, full-time).
    *   Create visually attractive service cards with icons.
*   **Step 2.6: Populate `About` Page (`about.md`)**
    *   Refine the text, weaving together CS, Math (Associates degree), Music background and coding interests.
    *   Add a professional profile picture to `assets/images/` and display it on the page (`![Riviera Sperduto]({{ '/assets/images/your-image.jpg' | relative_url }})`).
    *   Include a section for YouTube video embeds when available.
*   **Step 2.7: Implement GitHub Activity Fetchers**
    *   Create `assets/js/github-activity.js`.
    *   Implement two separate GitHub API fetchers:
        1. **Recent Activity Fetcher**:
           *   Fetch 5 most recent meaningful activities from `https://api.github.com/users/{{ site.github_username }}/events/public`.
           *   Filter for relevant event types (e.g., `PushEvent`, `CreateEvent`).
           *   Format into user-friendly HTML.
           *   Display on home page.
           *   Cache results to stay within API rate limits.
        2. **Project Last Updated Fetcher**:
           *   For each project with a GitHub repo, fetch last commit date.
           *   Display "Last updated: [date]" on each project card.
           *   Implement caching to minimize API calls.
    *   Include error handling and cache expiration logic.
*   **Step 2.8: Implement Blog Structure**
    *   Set up Jekyll's blog functionality with the `_posts` directory.
    *   Create sample post template with front matter.
    *   Configure blog index page with pagination (`blog.md`).
    *   Style blog post list and individual post layouts.
    *   Add categories and tags functionality.
*   **Step 2.9: Implement CodeGrind Integration**
    *   Add screenshots of the CodeGrind platform to `assets/images/`.
    *   Create a prominent section with multiple screenshots showcasing different features.
    *   Add direct links to:
        *   Live site: https://codegrind.online/
        *   Demo: [URL to be added later]
        *   GitHub repository
    *   Do not use iframe embedding to avoid cross-origin issues.
*   **Step 2.10: Implement Contact Form (`contact.md`)**
    *   Sign up for Formspree. Get form endpoint URL.
    *   Create an HTML `<form>` in `contact.md`.
    *   Set `method="POST"` and `action="YOUR_FORMSPREE_URL"`.
    *   Add input fields (`name`, `email`, `message`) with appropriate `name` attributes. Use `<input type="email" name="email">` for email.
    *   Add a submit button (`<button type="submit">Send</button>`).
    *   Style the form using Tailwind CSS classes for a modern look.
    *   Include alternative contact methods (phone, email, LinkedIn).
*   **Step 2.11: Implement Animations and Visual Enhancements**
    *   Add subtle animations for page transitions.
    *   Implement scroll-triggered animations for content sections.
    *   Create hover effects for interactive elements.
    *   Ensure all animations are tasteful and enhance usability rather than distract.
*   **Step 2.12: Ensure Responsiveness**
    *   Test layout on various screen sizes.
    *   Use Tailwind's responsive utility classes for different breakpoints.
    *   Ensure text remains readable and images scale appropriately.
    *   Optimize navigation for mobile devices.

## 5. Phase 3: Finalization & Deployment

*   **Step 3.1: Review & Polish**
    *   Proofread all text content for typos and clarity.
    *   Verify all internal links work correctly.
    *   Check external links (GitHub repos, CodeGrind website, LinkedIn).
    *   Optimize images (compress size, use appropriate formats).
    *   Ensure consistent styling and branding.
    *   Validate HTML/CSS if desired.
*   **Step 3.2: Prepare for YouTube Video Content**
    *   Create placeholder sections in relevant pages for video embeds.
    *   Document the process for adding videos:
        *   Upload video to YouTube
        *   Get embed code
        *   Add to appropriate page using Jekyll's include system
    *   Add thumbnail images as placeholders where videos will eventually go.
*   **Step 3.3: Configure GitHub Pages Settings**
    *   In the repository settings on GitHub (`Settings` > `Pages`):
        *   Ensure `Source` is set to `Deploy from a branch`.
        *   Select the correct branch (`main`).
        *   Select the folder (`/ (root)`).
        *   Ensure Jekyll build is implicitly handled by GitHub Pages or configure a GitHub Action if more complex build steps are needed.
*   **Step 3.4: Commit & Push**
    *   Stage all new/modified files (`git add .`).
    *   Commit changes (`git commit -m "Complete Jekyll site redesign"`).
    *   Push to the `main` branch (`git push origin main`).
*   **Step 3.5: Verify Deployment**
    *   Wait a minute or two for GitHub Actions/Pages to build and deploy.
    *   Visit `https://rivie13.github.io`.
    *   Perform a final check:
        *   All pages load correctly.
        *   Styles are applied.
        *   Navigation works.
        *   GitHub activity widgets load properly.
        *   Project "Last Updated" information displays correctly.
        *   CodeGrind integration works.
        *   Helios project information is displayed correctly.
        *   Resume information is displayed correctly.
        *   Blog structure works.
        *   Contact form looks correct (test submission after deployment).
        *   Check the browser's developer console for any errors.
        *   Test on mobile devices.
*   **Step 3.6: Create Maintenance Workflow Document**
    *   Create `MAINTENANCE.md` in repository with instructions for:
        *   Adding new blog posts (template, front matter format, image guidelines)
        *   Adding new projects to `_data/projects.yml` (required fields, format)
        *   Updating existing project information
        *   Adding YouTube videos (embed process, thumbnail creation)
        *   Updating resume information
        *   Best practices for image optimization
        *   Monitoring GitHub API usage
    *   Include examples for each type of update.
*   **Step 3.7: Future Maintenance Plan**
    *   Update projects in `_data/projects.yml` as needed.
    *   Add YouTube videos when they become available.
    *   Publish blog posts regularly.
    *   Periodically refresh design or dependencies.
    *   Monitor GitHub API usage (ensure it stays within free tier limits).
    *   Update resume information as career progresses. 