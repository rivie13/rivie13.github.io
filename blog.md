---
layout: default
title: Blog
permalink: /blog/
---

<div class="max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold mb-6">Blog</h1>
  
  <p class="mb-8">Welcome to my blog where I share insights, tutorials, and thoughts on software development, cloud architecture, and AI.</p>

  <div class="bg-white rounded-lg shadow-md p-6 mb-8">
    <div class="text-center mb-4">
      <svg class="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
      </svg>
    </div>
    <h2 class="text-xl font-bold text-center mb-2">Coming Soon!</h2>
    <p class="text-gray-600 text-center">I'm currently working on creating valuable content for this blog. Check back soon for articles on:</p>
    <ul class="list-disc pl-8 mt-4 space-y-2">
      <li>Software development best practices</li>
      <li>Cloud architecture patterns</li>
      <li>AI development tutorials</li>
      <li>Project case studies</li>
      <li>Career insights in tech</li>
    </ul>
  </div>
  
  <!-- This section will dynamically list blog posts when they are available -->
  <!-- 
  <div class="space-y-8">
    {% for post in site.posts %}
      <article class="bg-white rounded-lg shadow-md overflow-hidden">
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
          <a href="{{ post.url | relative_url }}" class="text-blue-600 hover:text-blue-800 font-semibold">
            Read more →
          </a>
        </div>
      </article>
    {% endfor %}
  </div>
  
  <!-- Pagination -->
  <!-- 
  {% if paginator.total_pages > 1 %}
    <div class="flex justify-center space-x-2 mt-8">
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
  -->
</div> 