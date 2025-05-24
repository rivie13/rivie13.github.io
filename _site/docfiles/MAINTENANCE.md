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

## Tailwind Styling and Animations

### Dark Mode Implementation
1. Always include dark mode variants for text and background colors:
   ```html
   <p class="text-gray-700 dark:text-gray-300">
   <div class="bg-white dark:bg-slate-800">
   ```
2. Common dark mode color pairs:
   - Text: `text-gray-900 dark:text-white`
   - Secondary text: `text-gray-700 dark:text-gray-300`
   - Backgrounds: `bg-white dark:bg-slate-800`
   - Borders: `border-gray-200 dark:border-gray-700`

### Animation Implementation
1. Wrap content sections in animation divs:
   ```html
   <div class="opacity-0" data-animate="fade-in">
     <!-- Content here -->
   </div>
   ```
2. Use scroll-triggered animations:
   ```html
   <div class="opacity-0" data-scroll="fade-up">
     <!-- Content here -->
   </div>
   ```
3. Common animation patterns:
   - Fade in: `data-animate="fade-in"`
   - Fade up on scroll: `data-scroll="fade-up"`
   - Slide in: `data-animate="slide-in"`
4. Ensure animations are subtle and enhance readability

### Code Block Styling
1. Use the highlight class for code blocks:
   ```html
   <pre class="highlight"><code class="language-javascript">
     // Your code here
   </code></pre>
   ```
2. Include custom styling for code blocks:
   ```css
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
   html.dark .highlight {
     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
   }
   ```

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

## Email Newsletter with Mailchimp

### Initial Mailchimp Setup

1. **Create a Mailchimp account**:
   - Go to [mailchimp.com](https://mailchimp.com) and sign up for a free account
   - The free plan allows up to 2,000 subscribers and 10,000 emails per month

2. **Create an audience**:
   - In your Mailchimp dashboard, go to Audience → Audience dashboard
   - Click "Create Audience" if you don't have one
   - Name your list "Blog Subscribers" or similar
   - Complete the audience setup wizard

3. **Create an embedded signup form**:
   - Go to Audience → Signup forms → Embedded forms
   - Choose "Slim form" or "Horizontal form" for best integration
   - Customize fields (email is sufficient, but you can add name if desired)
   - Customize form design to match your site's style

4. **Get your embed code**:
   - In the form builder, find the "Copy/paste onto your site" section
   - Copy the entire HTML code provided

5. **Update the blog subscription form**:
   - Open `blog.md`
   - Locate the Mailchimp form section
   - Replace the placeholder form action URL with your actual Mailchimp URL
   - It will look similar to: `https://yourdomain.us1.list-manage.com/subscribe/post?u=a1b2c3d4e5f6&amp;id=1a2b3c4d5e`

### Complete Blog Post Publishing Workflow

1. **Create and write your blog post**:
   - Follow the "Adding New Blog Posts" instructions above
   - Create a new file in the `_posts` directory with the filename format: `YYYY-MM-DD-post-title.md`
   - Add front matter and write your content in Markdown

2. **Add images and assets**:
   - Add any images to `/assets/images/posts/`
   - Optimize images before uploading
   - Reference images in your post using proper Markdown syntax

3. **Preview your post locally**:
   - Run `bundle exec jekyll serve`
   - View your post at http://localhost:4000/blog/
   - Make any necessary adjustments

4. **Commit and push to GitHub**:
   ```
   git add .
   git commit -m "Add new blog post: Your Post Title"
   git push origin main
   ```

5. **Verify deployment**:
   - Wait 1-2 minutes for GitHub Pages to build and deploy
   - Visit your live site to ensure the post appears correctly
   - Check that all links and images work properly

6. **Notify subscribers with Mailchimp**:
   - Log in to Mailchimp and go to Campaigns → Email templates
   - Click "Create Campaign" and select "Regular Campaign"
   - Choose your "Blog Subscribers" audience 
   - Set up email details:
     * Subject: "New Blog Post: [Your Post Title]"
     * From name: Your name
     * From email: Your email address

7. **Design your email**:
   - Choose a template or start from scratch
   - Add your blog post title as a heading
   - Include a brief excerpt or summary of your post
   - Add a clear "Read More" button linking to your full blog post
   - Include your branding and sign-off

8. **Test and send**:
   - Send a test email to yourself to verify everything looks correct
   - Make any necessary adjustments
   - Schedule or send immediately to your subscribers

### Email Newsletter Best Practices

1. **Consistent schedule**: Try to maintain a regular posting and emailing schedule
2. **Compelling subject lines**: Keep them under 50 characters and make them interesting
3. **Mobile-friendly**: Ensure your emails are readable on mobile devices
4. **Personalization**: Include the subscriber's name if you collected it
5. **Branding**: Maintain consistent visual identity across your site and emails
6. **Analytics**: Review open rates and click-through rates to improve future emails
7. **Unsubscribe option**: Ensure this works properly (Mailchimp handles this automatically)

### Mailchimp Account Maintenance

1. **List hygiene**:
   - Periodically check for and remove invalid email addresses
   - Monitor bounce rates and unsubscribe requests

2. **Compliance**:
   - Ensure you're following email marketing regulations (GDPR, CAN-SPAM)
   - Never add people to your list without their consent

3. **Usage limits**:
   - Monitor your subscriber count to stay within the free plan limits
   - Consider upgrading if you exceed 2,000 subscribers 