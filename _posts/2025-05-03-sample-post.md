---
layout: default
title: "Sample Blog Post"
date: 2025-05-03 12:00:00 -0500
categories: [development, tutorials]
---

# Sample Blog Post

This is a sample blog post template that can be used as a reference for future posts. Jekyll uses Markdown formatting which makes it easy to write and format content.

## Markdown Formatting

### Headers

You can use hashtags (#) to create headers. More hashtags create smaller headers.

### Emphasis

*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

_You **can** combine them_

### Lists

Unordered list:
* Item 1
* Item 2
  * Item 2a
  * Item 2b

Ordered list:
1. Item 1
2. Item 2
3. Item 3

### Links

[Text to display](http://www.example.com)

### Images

![Alt text for image]({{ '/assets/images/placeholder-profile.jpg' | relative_url }})

### Code Blocks

```python
def hello_world():
    print("Hello, World!")
```

## Adding a New Post

To add a new post:

1. Create a new file in the `_posts` directory
2. Name it with the format: `YYYY-MM-DD-title.md`
3. Include the front matter at the top (like this post)
4. Write your content in Markdown
5. Save the file and it will automatically be added to the blog

## Front Matter Options

You can customize various aspects of your post with front matter:

```yaml
---
layout: default
title: "Your Post Title"
date: YYYY-MM-DD HH:MM:SS -0500
categories: [category1, category2]
tags: [tag1, tag2]
author: Your Name
excerpt: A brief excerpt of your post
image: path/to/featured-image.jpg
---
```

This is just a placeholder post. Feel free to delete it when creating actual content! 