---
layout: post
title: "Part 2: Laying the Foundation - Jekyll Setup and Styling with Tailwind CSS"
date: 2025-05-10 09:00:00 -0500
categories: [Portfolio Tutorial, Jekyll, Development]
tags: [Jekyll, Tailwind CSS, Web Development, Portfolio Development, Static Sites]
image: /assets/images/tutorial-part2-banner.png # Placeholder - remember to create this image!
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

<div class="opacity-0" data-animate="fade-in">
Welcome back to my portfolio tutorial series! In <a href="/blog/2025/05/08/conception-and-collaboration-planning-dynamic-portfolio-with-ai" class="text-blue-600 hover:text-blue-800">Part 1</a>, we explored the planning phase and architectural decisions that set the stage for this portfolio website. Now, it's time to roll up our sleeves and start building. In this second installment, we'll focus on setting up Jekyll and applying styling with Tailwind CSS to create a beautiful, responsive foundation.
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">2.1. Jekyll: The Static Site Engine</h2>

As mentioned in Part 1, Jekyll was our static site generator of choice for several compelling reasons:

- Native support on GitHub Pages, eliminating the need for complex build configurations
- Simplicity for content management, especially for blog posts
- Flexible templating system using Liquid
- Markdown support for easy content creation
- Active community and extensive plugin ecosystem

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">Core Setup</h3>

Setting up a Jekyll site involves creating a specific directory structure. With my AI assistant's guidance, I created the following essential directories:

- `_layouts`: Contains template files that define the look of different types of pages
- `_includes`: Houses reusable components that can be included in layouts and pages
- `_data`: Stores structured data in YAML, JSON, or CSV format
- `assets`: Holds static files like images, CSS, and JavaScript
- `_posts`: Contains blog post files in Markdown format

The most critical configuration file in a Jekyll site is `_config.yml`. Here's a snippet of the essential configurations I included:

{% highlight yaml %}
# Site settings
title: Riviera Sperduto
email: riviera.t.sperduto13@gmail.com
description: >-
  Full Stack Developer, Cloud Architect, and AI Enthusiast. 
  This portfolio showcases my projects and technical expertise.
url: "https://rivie13.github.io"
github_username: rivie13
google_analytics: G-XXXXXXXXXX

# Build settings
markdown: kramdown
permalink: /blog/:year/:month/:day/:title/
plugins:
  - jekyll-feed
  - jekyll-seo-tag
  - jekyll-sitemap
{% endhighlight %}

Additionally, I set up the `Gemfile` to manage Jekyll and plugin versions (you may need to update these versions depending on your Ruby version and other dependencies, this list is not exhaustive):

{% highlight ruby %}
source "https://rubygems.org"

gem "jekyll", "~> 4.4.0"
gem "jekyll-feed", "~> 0.15.1"
gem "jekyll-seo-tag", "~> 2.7.1"
gem "jekyll-sitemap", "~> 1.4.0"

group :jekyll_plugins do
  # Add any other Jekyll plugins here
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]
# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :mswin, :x64_mingw]
{% endhighlight %}
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">2.2. Crafting the Skeleton: Default Layout and Includes</h2>

{% include blog-ad.html %}

The default layout is the primary template that provides the common structure for all pages on the site. In Jekyll, this is typically defined in `_layouts/default.html`. Here's a breakdown of this crucial file:

{% highlight html %}
<!DOCTYPE html>
<html lang="en" class="">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ page.title }} | {{ site.title }}</title>
    {% raw %}{% seo %}{% endraw %}
    
    {% raw %}{% include google-tag.html %}{% endraw %}
    
    <!-- Google AdSense -->
    {% raw %}{% if site.google_adsense %}
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ site.google_adsense }}"
     crossorigin="anonymous"></script>
    {% endif %}{% endraw %}
    
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ '/assets/css/main.css' | relative_url }}">
    <link rel="stylesheet" href="{{ '/assets/css/animations.css' | relative_url }}">
    <link rel="stylesheet" href="{{ '/assets/css/responsive.css' | relative_url }}">
    <link rel="stylesheet" href="{{ '/assets/css/dark-mode.css' | relative_url }}">
    <script>
        // Check for saved dark mode preference on page load
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
        }
    </script>
</head>
<body class="page-transition enter-active">
    
    {% raw %}{% include header.html %}
    
    {% include header-ad.html %}
    
    <main id="main-content" class="container mx-auto px-4 py-8">
        {{ content }}
    </main>
    
    {% include footer-ad.html %}
    
    {% include footer.html %}{% endraw %}
    
    <!-- Load scripts in proper dependency order -->
    <script src="{{ '/assets/js/github-config.js' | relative_url }}"></script>
    <script src="{{ '/assets/js/github-repos.js' | relative_url }}"></script>
    <script src="{{ '/assets/js/github-activity.js' | relative_url }}"></script>
    <script src="{{ '/assets/js/github-stats.js' | relative_url }}"></script>
    <script src="{{ '/assets/js/github-contributions.js' | relative_url }}"></script>
    <script src="{{ '/assets/js/project-cards.js' | relative_url }}"></script>
    <script src="{{ '/assets/js/github-test.js' | relative_url }}"></script>
    <script src="{{ '/assets/js/main.js' | relative_url }}"></script>
    <script src="{{ '/assets/js/animations.js' | relative_url }}"></script>
    <script src="{{ '/assets/js/responsive.js' | relative_url }}"></script>
    
    {% raw %}{% include cookie-consent.html %}{% endraw %}
</body>
</html>
{% endhighlight %}

Notice the inclusion of:
- Semantic HTML structure for better SEO and accessibility
- Metadata and the `{% seo %}` tag to enhance search engine optimization
- Tailwind CSS from CDN and custom CSS files
- Dark mode detection script
- Google Analytics tracking and AdSense integration
- Include tags for various modular components
- JavaScript files that power GitHub integration and other dynamic elements

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">Header and Footer Components</h3>

The `_includes/header.html` file contains the site navigation, which is displayed on every page:

{% highlight html %}
<header class="bg-gray-900 text-white shadow-md">
  <div class="container mx-auto px-4 py-4">
    <nav class="flex flex-wrap items-center justify-between">
      <!-- Logo/Site Title -->
      <a href="{{ '/' | relative_url }}" class="text-xl font-bold text-gray-400" aria-label="Home page">
        {{ site.title | split: " - " | first }}
      </a>
      
      <div class="flex items-center">
        <!-- Dark Mode Toggle -->
        <button id="dark-mode-toggle" class="focus:outline-none mr-4" aria-label="Toggle dark mode">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 dark-mode-sun hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 dark-mode-moon dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      
        <!-- Mobile menu button -->
        <button id="menu-toggle" class="block md:hidden focus:outline-none" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="menu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
      
      <!-- Navigation Links -->
      <div id="menu" class="w-full md:w-auto hidden md:block" role="navigation" aria-label="Main navigation">
        <ul class="flex flex-col md:flex-row md:space-x-6 mt-4 md:mt-0">
          <li><a href="{{ '/' | relative_url }}" class="nav-link block py-2 md:py-0 text-gray-300 hover:text-blue-300" aria-label="Home">Home</a></li>
          <li><a href="{{ '/about/' | relative_url }}" class="nav-link block py-2 md:py-0 text-gray-300 hover:text-blue-300" aria-label="About">About</a></li>
          <li><a href="{{ '/projects/' | relative_url }}" class="nav-link block py-2 md:py-0 text-gray-300 hover:text-blue-300" aria-label="Projects">Projects</a></li>
          <li><a href="{{ '/services/' | relative_url }}" class="nav-link block py-2 md:py-0 text-gray-300 hover:text-blue-300" aria-label="Services">Services</a></li>
          <li><a href="{{ '/resume/' | relative_url }}" class="nav-link block py-2 md:py-0 text-gray-300 hover:text-blue-300" aria-label="Resume">Resume</a></li>
          <li><a href="{{ '/blog/' | relative_url }}" class="nav-link block py-2 md:py-0 text-gray-300 hover:text-blue-300" aria-label="Blog">Blog</a></li>
          <li><a href="{{ '/contact/' | relative_url }}" class="nav-link block py-2 md:py-0 text-gray-300 hover:text-blue-300" aria-label="Contact">Contact</a></li>
          <li><a href="{{ '/privacy/' | relative_url }}" class="nav-link block py-2 md:py-0 text-gray-300 hover:text-blue-300" aria-label="Privacy Policy">Privacy Policy</a></li>
        </ul>
      </div>
    </nav>
  </div>
</header>
{% endhighlight %}

The `_includes/footer.html` file contains copyright information, social links, and contact info:

{% highlight html %}
<footer class="bg-gray-900 text-white py-12" role="contentinfo">
  <div class="container mx-auto px-4">
    <div class="flex flex-wrap">
      <div class="w-full lg:w-1/3 mb-8 lg:mb-0">
        <h2 class="text-xl font-bold mb-4 text-gray-400">{{ site.title }}</h2>
        <p class="text-gray-400">A collection of my software development projects, skills, and services.</p>
        
        <div class="mt-4 flex space-x-4">
          <a href="https://github.com/{{ site.github_username }}" target="_blank" class="text-gray-400 hover:text-white" aria-label="GitHub profile">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/{{ site.linkedin_username }}" target="_blank" class="text-gray-400 hover:text-white" aria-label="LinkedIn profile">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
            </svg>
          </a>
          <a href="mailto:{{ site.email }}" class="text-gray-400 hover:text-white" aria-label="Send email">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 4.25l-7.07 4.42c-.32.2-.74.2-1.06 0L4.4 8.25c-.25-.16-.4-.43-.4-.72 0-.67.73-1.07 1.3-.72L12 11l6.7-4.19c.57-.35 1.3.05 1.3.72 0 .29-.15.56-.4.72z"></path>
            </svg>
          </a>
        </div>
      </div>
      
      <div class="w-full lg:w-1/3 mb-8 lg:mb-0">
        <h2 class="text-xl font-bold mb-4 text-gray-400">Quick Links</h2>
        <nav role="navigation" aria-label="Footer navigation">
          <ul class="text-gray-400">
            <li class="mb-2"><a href="{{ '/' | relative_url }}" class="hover:text-white">Home</a></li>
            <li class="mb-2"><a href="{{ '/about/' | relative_url }}" class="hover:text-white">About</a></li>
            <li class="mb-2"><a href="{{ '/projects/' | relative_url }}" class="hover:text-white">Projects</a></li>
            <li class="mb-2"><a href="{{ '/services/' | relative_url }}" class="hover:text-white">Services</a></li>
            <li class="mb-2"><a href="{{ '/resume/' | relative_url }}" class="hover:text-white">Resume</a></li>
            <li class="mb-2"><a href="{{ '/blog/' | relative_url }}" class="hover:text-white">Blog</a></li>
            <li class="mb-2"><a href="{{ '/contact/' | relative_url }}" class="hover:text-white">Contact</a></li>
          </ul>
        </nav>
      </div>
      
      <div class="w-full lg:w-1/3">
        <h2 class="text-xl font-bold mb-4 text-gray-400">Contact</h2>
        <p class="text-gray-400 mb-2">
          <span class="inline-block mr-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 4.25l-7.07 4.42c-.32.2-.74.2-1.06 0L4.4 8.25c-.25-.16-.4-.43-.4-.72 0-.67.73-1.07 1.3-.72L12 11l6.7-4.19c.57-.35 1.3.05 1.3.72 0 .29-.15.56-.4.72z"></path>
            </svg>
          </span>
          <a href="mailto:{{ site.email }}" class="hover:text-white">{{ site.email }}</a>
        </p>
        <p class="text-gray-400">
          <span class="inline-block mr-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 22c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10zm-1-14v7.59l5.293 5.3 1.414-1.42-4.707-4.71v-6.76h-2z"></path>
            </svg>
          </span>
          Available for freelance projects
        </p>
      </div>
    </div>
    
    <div class="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
      <p>&copy; {{ site.time | date: '%Y' }} {{ site.title }}. All rights reserved.</p>
    </div>
  </div>
</footer>
{% endhighlight %}
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">2.3. Bringing Pages to Life: Initial Content</h2>

With the layouts and includes in place, I could now create the basic content pages. In Jekyll, these are typically Markdown files with YAML front matter at the top. 

For the homepage (`index.md`):

{% highlight html %}
---
layout: default
title: Home
---

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Hero Section -->
  <section class="py-8 md:py-16">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-8 items-center">
      <div class="md:col-span-3 opacity-0 px-2 md:px-0" data-animate="fade-in">
        <h1 class="text-3xl md:text-5xl font-bold mb-3 md:mb-4">Riviera Sperduto</h1>
        <h2 class="text-lg md:text-2xl text-gray-600 mb-4 md:mb-6">Philadelphia-based Full Stack Developer | Cloud/Solutions Architect | AI Developer</h2>
        
        <div class="flex flex-col sm:flex-row mb-4 md:mb-6 items-center">
          <img src="{{ '/assets/images/your-image.jpg' | relative_url }}" alt="Riviera Sperduto" class="w-24 h-24 md:w-32 md:h-32 rounded-full mb-4 sm:mb-0 sm:mr-6 shadow-md border-2 border-blue-500" data-hover="scale">
          <p class="text-base md:text-lg text-center sm:text-left">I craft innovative solutions and leverage cutting-edge technologies to build exceptional digital experiences. With expertise in full-stack development, cloud architecture, and AI, I'm passionate about creating efficient, scalable, and user-friendly applications from my home in the City of Brotherly Love.</p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 md:gap-4">
          <a href="{{ '/projects/' | relative_url }}" class="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-lg transition-all transform hover:scale-105">
            View My Work
          </a>
          <a href="{{ '/contact/' | relative_url }}" class="w-full sm:w-auto text-center bg-transparent hover:bg-blue-50 text-blue-600 font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-lg border border-blue-600 transition-all transform hover:scale-105">
            Get In Touch
          </a>
        </div>
      </div>
      
      <div class="md:col-span-2 opacity-0 mt-6 md:mt-0" data-animate="fade-in">
        <div class="bg-gradient-to-br from-blue-100 to-indigo-100 p-1 rounded-xl shadow-xl" data-hover="scale">
          <!-- Philly image -->
          <img src="{{ '/assets/images/frc-philly-1.gif' | relative_url }}" alt="Philadelphia Skyline" class="rounded-lg w-full">
        </div>
      </div>
    </div>
  </section>
  
  <!-- Featured Projects and other sections follow -->
</div>
{% endhighlight %}

And for the about page (`about.md`):

{% highlight markdown %}
---
layout: default
title: About Me
---

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h1 class="text-3xl font-bold mb-6 opacity-0" data-animate="fade-in">
    About Me
  </h1>
  
  <div class="mt-6 prose max-w-none opacity-0" data-scroll="fade-up">
    <p>
      Hello! I'm Riviera, a Full Stack Developer and Cloud Architect with a passion for building scalable, 
      user-friendly applications. This page shares a bit more about my background, skills, and interests.
    </p>
    
    <h2>Professional Background</h2>
    <p>
      With experience across the full development stack, I specialize in creating robust web applications 
      that leverage modern cloud architecture. My expertise includes:
    </p>
    <ul>
      <li>Full Stack Development (JavaScript, TypeScript, React, Node.js)</li>
      <li>Cloud Architecture (AWS, Azure)</li>
      <li>Backend Systems (APIs, Databases, Serverless)</li>
      <li>AI Integration (Machine Learning APIs, Natural Language Processing)</li>
    </ul>
    
    <!-- Additional sections follow -->
  </div>
</div>
{% endhighlight %}

The YAML front matter at the top of each file contains essential metadata:
- `layout`: Specifies which layout template to use
- `title`: The page title used in the browser tab and SEO
- `permalink`: Defines the URL path for the page (when needed)
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">2.4. Styling with Tailwind CSS: Utility-First Approach</h2>

One of the key decisions I made (with AI guidance) was to use Tailwind CSS for styling. Tailwind is a utility-first CSS framework that allowed me to build custom designs quickly without leaving my HTML.

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">Why Tailwind?</h3>

- **Rapid development**: Create custom UI designs directly in your markup
- **Responsive out of the box**: Easy mobile-first responsive design
- **Consistent design language**: Pre-defined spacing, color, and typography scales
- **Low CSS bundle size**: Only includes the utilities you actually use in production
- **Customizability**: Easily extend or modify the default configuration

In the code snippets above, you can see Tailwind's utility classes in action. For example:

- `container mx-auto px-4`: Sets a container with auto margins and horizontal padding
- `text-3xl md:text-5xl font-bold`: Sets responsive font sizes that change at different breakpoints
- `grid grid-cols-1 md:grid-cols-5 gap-4`: Creates a responsive grid layout
- `bg-gray-900 text-white`: Sets background and text colors for the dark theme

The beauty of Tailwind is how quickly you can iterate on designs directly in your markup, without switching between HTML and CSS files.
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">2.5. Custom Styling Layers: Beyond Tailwind</h2>

While Tailwind CSS handled most of my styling needs, I also created several custom CSS files for specific purposes:

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">assets/css/main.css</h3>

This file contains global styles and any custom components that couldn't be easily created with Tailwind alone:

{% highlight css %}
/* Global styles */
html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Custom components */
.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: #111827;
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

.dark .prose h1,
.dark .prose h2,
.dark .prose h3,
.dark .prose h4,
.dark .prose h5,
.dark .prose h6 {
  color: #f3f4f6;
}

.prose a {
  color: #2563eb;
  text-decoration: underline;
}

.dark .prose a {
  color: #93c5fd;
}

/* Skip to content link for accessibility */
.skip-to-content {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: 1em;
  background-color: white;
  color: black;
  opacity: 0;
}

.skip-to-content:focus {
  left: 50%;
  transform: translateX(-50%);
  opacity: 1;
}
{% endhighlight %}

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">assets/css/animations.css</h3>

This file contains animation-related styles to add subtle motion and visual interest:

{% highlight css %}
/* Page transition effects */
.page-transition {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.enter-active {
  opacity: 1;
}

/* Fade-in animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

/* Entrance animations triggered by scrolling */
[data-animate="fade-in"] {
  opacity: 0;
  transition: opacity 0.6s ease-out;
}

[data-animate="fade-in"].is-visible {
  opacity: 1;
}

[data-scroll="fade-up"] {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

[data-scroll="fade-up"].is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Hover scale effect */
[data-hover="scale"] {
  transition: transform 0.3s ease-in-out;
}

[data-hover="scale"]:hover {
  transform: scale(1.03);
}
{% endhighlight %}

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">assets/css/responsive.css</h3>

This file contains additional responsive design styles beyond what Tailwind provides:

{% highlight css %}
/* Custom responsive adjustments */
@media (max-width: 640px) {
  .project-grid {
    grid-template-columns: 1fr;
  }
  
  .hidden-mobile {
    display: none;
  }
}

/* Print styles */
@media print {
  header, footer, .no-print {
    display: none;
  }
  
  body {
    font-size: 12pt;
    color: black;
    background-color: white;
  }
  
  a {
    text-decoration: none;
    color: black;
  }
  
  a::after {
    content: " (" attr(href) ")";
    font-size: 10pt;
  }
}
{% endhighlight %}

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">assets/css/dark-mode.css</h3>

This file contains styles specific to dark mode:

{% highlight css %}
/* Dark mode specific styles */
html.dark body {
  background-color: #111827;
  color: #f3f4f6;
}

html.dark .bg-white {
  background-color: #1f2937;
}

html.dark .text-gray-900 {
  color: #f3f4f6;
}

html.dark .border-gray-200 {
  border-color: #374151;
}

.dark-mode-sun,
.dark-mode-moon {
  transition: transform 0.5s ease;
}

#dark-mode-toggle:hover .dark-mode-sun,
#dark-mode-toggle:hover .dark-mode-moon {
  transform: rotate(12deg);
}
{% endhighlight %}
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">2.6. Local Development: See It Live!</h2>

With the structure, layouts, and styling in place, it was time to see the site in action. Jekyll makes local development a breeze. After setting up Ruby and installing the necessary gems with `bundle install`, I could run:

{% highlight bash %}
bundle exec jekyll serve
{% endhighlight %}

This command:
1. Builds the site from the source files
2. Serves it locally at http://localhost:4000
3. Watches for changes and rebuilds automatically

This rapid feedback loop was invaluable for iterating on designs and testing functionality. The development process typically followed this pattern:

1. Make changes to a template, page, or CSS file
2. Save the file and wait a moment for Jekyll to rebuild (usually takes less than a second)
3. Refresh the browser to see the changes
4. Repeat until satisfied with the result

The ability to instantly preview changes made the development process much more efficient and enjoyable.

<br>
<br>
<div class="opacity-0" data-scroll="fade-up">
NOTE: The content in this blog does not accurately reflect the content of the actual portfolio. It contains similar elements, but the actual portfolio is more comprehensive and detailed. You will need to expand and flesh out other parts of this and (hopefully) change it up to reflect your own work, experiences, and your own style.
<br>
<br>
</div>

<div class="opacity-0" data-animate="fade-in">
---
<br>
<br>
That wraps up Part 2 of our portfolio tutorial! We've covered the foundational aspects of setting up Jekyll and styling with Tailwind CSS. We now have a well-structured site with a beautiful, responsive, and accessible design.

In Part 3, we'll dive into content architecture and building reusable components, exploring how to use Jekyll's data files and includes to create a modular, maintainable site.

Stay tuned for the next installment, and as always, feel free to reach out with any questions or suggestions in the comments below! 
</div> 