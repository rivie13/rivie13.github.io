---
layout: default
title: Blog
permalink: /blog/
---

<div class="max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold mb-6 opacity-0" data-animate="fade-in">Blog</h1>
  
  <p class="mb-8 text-lg opacity-0" data-animate="fade-in">Welcome to my blog where I share insights, tutorials, and thoughts on software development, cloud architecture, and AI.</p>

  {% assign post_count = site.posts | size %}

  {% if post_count == 0 %}
  <!-- Display when no posts are available -->
  <div class="bg-white rounded-lg shadow-md p-8 mb-8 opacity-0" data-animate="fade-in" data-scroll="fade-up">
    <div class="text-center mb-6">
      <svg class="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
      </svg>
    </div>
    <h2 class="text-2xl font-bold text-center mb-4">Coming Soon!</h2>
    <p class="text-gray-600 text-center mb-6">I'm currently working on creating valuable content for this blog. Check back soon for articles on:</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      <div class="flex items-start">
        <svg class="w-5 h-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span>Software development best practices</span>
      </div>
      <div class="flex items-start">
        <svg class="w-5 h-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span>Cloud architecture patterns</span>
      </div>
      <div class="flex items-start">
        <svg class="w-5 h-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span>AI development tutorials</span>
      </div>
      <div class="flex items-start">
        <svg class="w-5 h-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span>Project case studies</span>
      </div>
      <div class="flex items-start">
        <svg class="w-5 h-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span>Career insights in tech</span>
      </div>
    </div>
  </div>
  
  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm mb-8 opacity-0" data-animate="fade-in" data-scroll="fade-up">
    <h2 class="text-xl font-bold mb-4">Subscribe for Updates</h2>
    <p class="mb-4 text-gray-700">Get notified when new articles are published. No spam, just valuable content.</p>
    
    <!-- Mailchimp Signup Form -->
    <div id="mc_embed_signup">
      <!-- Replace 'YOUR_MAILCHIMP_URL_HERE' with your actual Mailchimp form action URL -->
      <form action="https://YOUR_MAILCHIMP_URL_HERE.list-manage.com/subscribe/post?u=XXXXXXXX&amp;id=XXXXXXXX" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate flex flex-col sm:flex-row gap-2" target="_blank" novalidate>
        <input type="email" value="" name="EMAIL" class="required email flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" id="mce-EMAIL" placeholder="Your email address" required>
        <!-- This is the hidden field to prevent spam bots - do not remove -->
        <div style="position: absolute; left: -5000px;" aria-hidden="true">
          <input type="text" name="b_XXXXXXXX_XXXXXXXX" tabindex="-1" value="">
        </div>
        <div class="clear">
          <button type="submit" name="subscribe" id="mc-embedded-subscribe" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-105">Subscribe</button>
        </div>
      </form>
    </div>
    <!--End Mailchimp-->
    
    <!-- How to complete setup -->
    <!-- 
    To finish setting up:
    1. Create a Mailchimp account at mailchimp.com
    2. Create an audience for your subscribers
    3. Create an embedded form (Audience → Signup forms → Embedded forms)
    4. Replace the form action URL above with your Mailchimp URL
    5. Delete these instructions
    -->
  </div>
  {% else %}
  <!-- This section will display when blog posts are available -->
  <div class="space-y-8">
    {% for post in site.posts %}
      <article class="bg-white rounded-lg shadow-md overflow-hidden opacity-0" data-animate="fade-in" data-scroll="fade-up">
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-2">
            <a href="{{ post.url | relative_url }}" class="text-blue-600 hover:text-blue-800">{{ post.title }}</a>
          </h2>
          <div class="text-gray-600 mb-4">
            <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %-d, %Y" }}</time>
            {% if post.categories.size > 0 %}
              <span class="mx-1">•</span>
              <span>
                {% for category in post.categories %}
                  <a href="{{ '/categories/' | append: category | relative_url }}" class="hover:text-blue-600">{{ category }}</a>{% unless forloop.last %}, {% endunless %}
                {% endfor %}
              </span>
            {% endif %}
          </div>
          <div class="prose max-w-none mb-4">
            {{ post.excerpt }}
          </div>
          <a href="{{ post.url | relative_url }}" class="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transform hover:translate-x-2 transition-transform">
            Read more 
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </a>
        </div>
      </article>
    {% endfor %}
  </div>
  
  <!-- Pagination -->
  {% if paginator.total_pages > 1 %}
    <div class="flex justify-center space-x-2 mt-8 opacity-0" data-animate="fade-in">
      {% if paginator.previous_page %}
        <a href="{{ paginator.previous_page_path | relative_url }}" class="bg-white rounded-lg shadow px-3 py-1 hover:bg-gray-50">
          Previous
        </a>
      {% endif %}
      
      {% for page in (1..paginator.total_pages) %}
        {% if page == paginator.page %}
          <span class="bg-blue-600 text-white rounded-lg shadow px-3 py-1">{{ page }}</span>
        {% else %}
          <a href="{{ site.paginate_path | relative_url | replace: ':num', page }}" class="bg-white rounded-lg shadow px-3 py-1 hover:bg-gray-50">
            {{ page }}
          </a>
        {% endif %}
      {% endfor %}
      
      {% if paginator.next_page %}
        <a href="{{ paginator.next_page_path | relative_url }}" class="bg-white rounded-lg shadow px-3 py-1 hover:bg-gray-50">
          Next
        </a>
      {% endif %}
    </div>
  {% endif %}
  {% endif %}
  
  <!-- Categories section -->
  <div class="mt-12 opacity-0" data-animate="fade-in" data-scroll="fade-up">
    <h2 class="text-2xl font-bold mb-4">Categories</h2>
    <div class="flex flex-wrap gap-2">
      {% assign categories = site.categories | sort %}
      {% for category in categories %}
        <a href="{{ '/categories/' | append: category[0] | relative_url }}" class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded-full transition-colors transform hover:scale-105">
          {{ category[0] }} ({{ category[1].size }})
        </a>
        {% unless forloop.first %}
          {% assign category_files = category_files | append: ',' %}
        {% endunless %}
        {% capture category_filename %}categories/{{ category[0] }}.md{% endcapture %}
        {% if forloop.first %}
          {% assign category_files = category_filename %}
        {% else %}
          {% assign category_files = category_files | append: category_filename %}
        {% endif %}
      {% endfor %}
      
      {% if categories.size == 0 %}
        <!-- For development testing, show the development category -->
        <a href="{{ '/categories/development/' | relative_url }}" class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded-full transition-colors transform hover:scale-105">
          development (1)
        </a>
        <p class="text-gray-600 mt-2">More categories will appear here once more posts are published.</p>
      {% endif %}
    </div>
  </div>
</div> 