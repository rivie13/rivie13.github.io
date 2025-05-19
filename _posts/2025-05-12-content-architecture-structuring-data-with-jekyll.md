---
layout: post
title: "Part 3: Content Architecture - Structuring Data with Jekyll and Building Reusable Components"
date: 2025-05-12 09:00:00 -0500
categories: [Portfolio Tutorial, Jekyll, Development]
tags: [Jekyll, Data Management, Component Design, Web Development, Portfolio Development]
image: /assets/images/tutorial-part3-banner.png # Placeholder - remember to create this image!
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
Welcome to Part 3 of our portfolio development series! In <a href="/blog/2025/05/08/conception-and-collaboration-planning-dynamic-portfolio-with-ai" class="text-blue-600 hover:text-blue-800">Part 1</a>, we planned our portfolio with AI assistance, and in <a href="/blog/2025/05/10/laying-the-foundation-jekyll-setup-and-styling-with-tailwind-css" class="text-blue-600 hover:text-blue-800">Part 2</a>, we set up Jekyll and styled our site with Tailwind CSS. Now, we'll dive into one of the most crucial aspects of a maintainable website: content architecture and reusable components.
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">3.1. Jekyll's Data Powerhouse: The `_data` Directory</h2>

One of Jekyll's most powerful features is its ability to manage structured data through YAML files in the `_data` directory. This approach separates content from presentation, making our site more maintainable and easier to update.

Let's explore how you could organize different types of content. Note that all the examples below are fictional and meant to demonstrate the structure - they don't reflect my actual experience or skills. You should customize these templates with your own information:

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">Projects Data Structure</h3>

Here's an example structure for `_data/projects.yml` showing how you might organize project information:

{% highlight yaml %}
- name: "Portfolio Website"
  description: "A dynamic Jekyll-based portfolio with GitHub integration"
  detailed_description: |
    A professional portfolio website built with Jekyll and hosted on GitHub Pages. 
    Features include dynamic GitHub activity integration via Azure Functions, 
    dark mode support, and responsive design with Tailwind CSS.
  url: "https://rivie13.github.io"
  github: "https://github.com/rivie13/rivie13.github.io"
  demo: "https://rivie13.github.io"
  image: "/assets/images/projects/portfolio.jpg"
  technologies:
    - "Jekyll"
    - "Tailwind CSS"
    - "Azure Functions"
    - "GitHub API"
  features:
    - "Dynamic GitHub activity integration"
    - "Dark mode support"
    - "Responsive design"
    - "Blog with categories and tags"
  last_updated: "2025-05-12" # Auto-updated by GitHub API
{% endhighlight %}

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">Skills Organization</h3>

Here's an example of how you might structure your `_data/skills.yml` file. Note that your actual file structure might be different - for instance, my actual skills file uses a simpler categorization with direct lists under each category. This is just one possible way to organize skills with proficiency levels and years of experience:

{% highlight yaml %}
- category: "Web Development"
  skills:
    - name: "HTML/CSS"
      level: 85
      years: 2
    - name: "JavaScript"
      level: 80
      years: 2
    - name: "React"
      level: 75
      years: 1

- category: "Programming Languages"
  skills:
    - name: "Python"
      level: 85
      years: 3
    - name: "Java"
      level: 75
      years: 2
    - name: "C++"
      level: 70
      years: 1

- category: "Tools & Technologies"
  skills:
    - name: "Git"
      level: 85
      years: 2
    - name: "Docker"
      level: 70
      years: 1
    - name: "VS Code"
      level: 90
      years: 2
{% endhighlight %}

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">Experience and Education</h3>

Here's an example of how you might structure work experience in `_data/experience.yml`. Remember to replace this with your actual work history:

{% highlight yaml %}
- company: "Example Tech Corp"
  position: "Software Developer"
  period: "2023 - Present"
  location: "Remote"
  description: |
    Working on full-stack web applications and cloud infrastructure.
    Focus on modern JavaScript frameworks and cloud services.
  achievements:
    - "Implemented new feature that improved user engagement by 25%"
    - "Reduced API response time by 40%"
    - "Mentored 2 junior developers"

# Additional entries...
{% endhighlight %}

And here's an example structure for education in `_data/education.yml`. This is just a template - customize it with your own educational background:

{% highlight yaml %}
- institution: "State University"
  degree: "B.S. in Computer Science"
  period: "2020 - 2024"
  location: "Anytown, USA"
  achievements:
    - "Dean's List 2022-2023"
    - "Computer Science Club Member"
    - "Completed Senior Project on Web Development"

# Additional entries...
{% endhighlight %}
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">3.2. Building Reusable Views: The Magic of `_includes`</h2>

{% include blog-ad.html %}

Jekyll's include system allows us to create modular, reusable components. Let's look at some key components I developed:

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">Project Cards</h3>

The `_includes/project-card.html` component displays project information consistently:

{% highlight html %}
<div class="project-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105" data-project-id="{{ project.github | split: '/' | last }}">
  <!-- Project Image -->
  <img 
    src="{{ project.image | relative_url }}" 
    alt="{{ project.name }}"
    class="w-full h-48 object-cover"
    loading="lazy"
  >
  
  <div class="p-6">
    <!-- Project Title and Links -->
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">
        {{ project.name }}
      </h3>
      <div class="flex space-x-2">
        {% raw %}{% if project.github %}
        <a href="{{ project.github }}" 
           class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="View {{ project.name }} on GitHub">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
        </a>
        {% endif %}{% endraw %}
        
        {% raw %}{% if project.demo %}
        <a href="{{ project.demo }}" 
           class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="View live demo of {{ project.name }}">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </a>
        {% endif %}{% endraw %}
      </div>
    </div>
    
    <!-- Project Description -->
    <p class="text-gray-600 dark:text-gray-300 mb-4">
      {{ project.description }}
    </p>
    
    <!-- Technologies -->
    <div class="mb-4">
      <div class="flex flex-wrap gap-2">
        {% raw %}{% for tech in project.technologies %}
        <span class="px-2 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
          {{ tech }}
        </span>
        {% endfor %}{% endraw %}
      </div>
    </div>
    
    <!-- Last Updated -->
    <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      Last updated: <span data-github-last-updated="{{ project.github }}">Loading...</span>
    </div>
  </div>
</div>
{% endhighlight %}

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">Skill Bars</h3>

The `_includes/skill-bar.html` component visualizes skill proficiency:

{% highlight html %}
<div class="skill-bar mb-4">
  <div class="flex justify-between items-center mb-1">
    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ skill.name }}
      {% raw %}{% if skill.years %}
      <span class="text-xs text-gray-500 dark:text-gray-400">
        ({{ skill.years }} years)
      </span>
      {% endif %}{% endraw %}
    </span>
    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ skill.level }}%
    </span>
  </div>
  <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
    <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
         style="width: 0%" 
         data-target-width="{{ skill.level }}%">
    </div>
  </div>
</div>
{% endhighlight %}



<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">3.3. Using Components in Pages</h2>

Now that we have our data structure and components, let's see how to use them in our pages. Here's an example from `projects.html`:

{% highlight html %}
---
layout: default
title: Projects
---

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-white opacity-0" data-animate="fade-in">
    My Projects
  </h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {% raw %}{% for project in site.data.projects %}
      {% include project-card.html project=project %}
    {% endfor %}{% endraw %}
  </div>
</div>
{% endhighlight %}

And from `skills.html`:

{% highlight html %}
---
layout: default
title: Skills
---

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-white opacity-0" data-animate="fade-in">
    Technical Skills
  </h1>
  
  <div class="space-y-8">
    {% raw %}{% for category in site.data.skills %}
    <div class="opacity-0" data-scroll="fade-up">
      <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {{ category.category }}
      </h2>
      
      <div class="space-y-4">
        {% for skill in category.skills %}
          {% include skill-bar.html skill=skill %}
        {% endfor %}
      </div>
    </div>
    {% endfor %}{% endraw %}
  </div>
</div>
{% endhighlight %}
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">3.4. Enhancing Components with JavaScript</h2>

To make our components truly dynamic, we need to add some JavaScript functionality. Here's how I enhanced the project cards and skill bars:

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">Project Card Enhancements</h3>

In `assets/js/project-cards.js`:

{% highlight javascript %}
class ProjectCardManager {
  constructor() {
    this.cards = document.querySelectorAll('.project-card');
    this.initializeCards();
  }
  
  initializeCards() {
    this.cards.forEach(card => {
      // Add hover animations
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
      
      // Initialize GitHub last updated date
      const projectId = card.dataset.projectId;
      if (projectId) {
        this.fetchLastUpdated(projectId, card);
      }
    });
  }
  
  async fetchLastUpdated(projectId, card) {
    try {
      const dateSpan = card.querySelector('[data-github-last-updated]');
      if (!dateSpan) return;
      
      const response = await fetch(`/api/github/repos/${projectId}`);
      const data = await response.json();
      
      const lastUpdated = new Date(data.pushed_at);
      dateSpan.textContent = lastUpdated.toLocaleDateString();
    } catch (error) {
      console.error('Error fetching last updated date:', error);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProjectCardManager();
});
{% endhighlight %}

<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">Skill Bar Animations</h3>

In `assets/js/skill-bars.js`:

{% highlight javascript %}
class SkillBarAnimator {
  constructor() {
    this.skillBars = document.querySelectorAll('.skill-bar');
    this.observer = this.createIntersectionObserver();
    this.initializeObserver();
  }
  
  createIntersectionObserver() {
    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateSkillBar(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });
  }
  
  initializeObserver() {
    this.skillBars.forEach(bar => {
      this.observer.observe(bar);
    });
  }
  
  animateSkillBar(skillBar) {
    const progressBar = skillBar.querySelector('[data-target-width]');
    const targetWidth = progressBar.dataset.targetWidth;
    
    // Reset to 0
    progressBar.style.width = '0%';
    
    // Animate to target width
    requestAnimationFrame(() => {
      progressBar.style.width = targetWidth;
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SkillBarAnimator();
});
{% endhighlight %}
</div>

<div class="opacity-0" data-scroll="fade-up">
<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">3.5. Maintaining Data and Components</h2>

To keep our content architecture maintainable, I follow these best practices:

1. **Single Source of Truth**: All structured data lives in the `_data` directory.
2. **Component Documentation**: Each component in `_includes` has a comment block explaining its purpose and required parameters.
3. **Consistent Naming**: Follow a clear naming convention for both data files and components.
4. **Version Control**: Track changes to data files and components separately in git commits.
5. **Regular Updates**: Keep project data current using the GitHub API integration.

The `MAINTENANCE.MD` file in the repository provides detailed instructions for updating content and managing the site's data structure.
</div>

<div class="opacity-0" data-animate="fade-in">

<br>
<br>
---
<br>
<br>

That concludes Part 3 of our portfolio tutorial series! We've covered how to:
- Structure data effectively using Jekyll's `_data` directory
- Create reusable components with `_includes`
- Enhance components with JavaScript for dynamic functionality
- Maintain a clean and organized content architecture
</div>
<br>
<div class="opacity-0" data-animate="fade-in">
Remember that all the examples shown in this post are templates meant to demonstrate the structure and possibilities - they don't reflect my actual skills, experience, or education. When building your own portfolio, you should:
1. Replace all example data with your actual information
2. Modify the data structures to better fit your needs
3. Adjust the component designs to match your style
4. Consider different ways to organize and present your unique skills and experiences

In Part 4, we'll dive into the exciting world of dynamic GitHub API integration through our Azure Function proxy, bringing real-time data to our static site.

Stay tuned, and feel free to experiment with these data structures and components. Remember, good architecture is the foundation of a maintainable website!</div> 