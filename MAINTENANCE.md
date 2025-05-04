# Portfolio Website Maintenance Guide

This document provides instructions for maintaining and updating the Jekyll-based portfolio website.

## Adding New Blog Posts

1. Create a new file in the `_posts` directory with the filename format: `YYYY-MM-DD-post-title.md`
2. Add the following front matter:
   ```yaml
   ---
   layout: post
   title: "Your Post Title"
   date: YYYY-MM-DD HH:MM:SS -0500
   categories: [category1, category2]
   tags: [tag1, tag2, tag3]
   image: /assets/images/posts/example-image.jpg
   ---
   ```
3. Write your post content in Markdown below the front matter
4. For images:
   - Add images to `/assets/images/posts/`
   - Optimize images before uploading (aim for <500KB per image)
   - Use the following format to include images:
     ```markdown
     ![Alt text](/assets/images/posts/your-image.jpg)
     ```

## Adding New Projects

1. Open `_data/projects.yml`
2. Add a new project entry following this structure:
   ```yaml
   - name: "Project Name"
     description: "Brief project description"
     detailed_description: "Longer project description with details about technologies, challenges, and solutions"
     url: "https://project-website.com/"
     github: "https://github.com/username/repo"
     demo: "https://demo-link.com/"
     image: "/assets/images/projects/project-image.jpg"
     technologies:
       - "Technology 1"
       - "Technology 2"
       - "Technology 3"
     features:
       - "Feature 1 description"
       - "Feature 2 description"
       - "Feature 3 description"
     last_updated: "YYYY-MM-DD" # Will be auto-updated by GitHub API
   ```
3. Add project images to `/assets/images/projects/`
4. Optimize images before uploading (aim for <500KB per image)
5. The "Last Updated" field will be automatically populated by the GitHub API integration

## Updating Existing Projects

1. Open `_data/projects.yml`
2. Find the project entry you want to update
3. Modify the appropriate fields
4. If adding new screenshots, follow the image guidelines above

## Adding YouTube Videos

1. On YouTube, click "Share" under your video
2. Click "Embed" and copy the iframe code
3. Create a new file in `_includes/videos/` with a descriptive name (e.g., `project-demo.html`)
4. Paste the iframe code and adjust as needed:
   ```html
   <div class="video-container">
     <iframe
       width="560"
       height="315"
       src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
       title="YouTube video player"
       frameborder="0"
       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
       allowfullscreen>
     </iframe>
   </div>
   ```
5. In your Markdown file where you want to add the video, include:
   ```liquid
   {% include videos/project-demo.html %}
   ```

## Updating Resume Information

1. To update skills, edit `_data/skills.yml`
2. To update work experience, edit `_data/experience.yml`
3. To update education information, edit `_data/education.yml`
4. To update certifications, edit `_data/certifications.yml`
5. If you have an updated PDF version of your resume, replace the existing file in `/assets/files/resume.pdf`

## Image Optimization Best Practices

1. Use appropriate file formats:
   - JPEG for photographs
   - PNG for images with transparency
   - SVG for icons, logos, and simple illustrations
   - WebP where possible for modern browsers
2. Resize images to the dimensions they'll be displayed at
3. Compress images using tools like:
   - [TinyPNG](https://tinypng.com/) for PNG/JPEG
   - [SVGOMG](https://jakearchibald.github.io/svgomg/) for SVG
   - [Squoosh](https://squoosh.app/) for converting to modern formats
4. Aim for file sizes under 500KB per image
5. Include descriptive alt text for all images

## Monitoring GitHub API Usage

1. The site uses GitHub's API to fetch:
   - Recent activity on the home page
   - Last updated dates for projects
2. GitHub's API has rate limits (60 requests/hour for unauthenticated requests)
3. Current implementation includes caching to minimize API calls
4. To check API rate limit status, visit:
   - https://api.github.com/rate_limit
5. If experiencing API rate limiting, consider:
   - Reducing the frequency of API calls
   - Implementing GitHub token authentication for higher limits

## Local Development

1. Clone the repository:
   ```
   git clone https://github.com/rivie13/rivie13.github.io.git
   cd rivie13.github.io
   ```
2. Ensure Ruby and Jekyll are installed
3. Install dependencies:
   ```
   bundle install
   ```
4. Run the development server:
   ```
   bundle exec jekyll serve
   ```
5. View the site at http://localhost:4000

## Deployment

The site automatically deploys when changes are pushed to the main branch:

1. Make your changes locally
2. Test changes with `bundle exec jekyll serve`
3. Commit changes:
   ```
   git add .
   git commit -m "Description of changes"
   ```
4. Push to GitHub:
   ```
   git push origin main
   ```
5. GitHub Actions will build and deploy the site
6. Wait 1-2 minutes, then verify at https://rivie13.github.io 