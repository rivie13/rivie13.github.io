---
layout: post
title: "Fixing CodeGrind's Blog Pipeline: From LinkedIn API to Make Webhooks"
date: 2026-04-13 06:00:00 +0000
categories: [CodeGrind, DevOps]
tags: [CodeGrind, automation, ci-cd, github-actions, api-integration, social-media, workflow-optimization, documentation]
author: Riviera Sperduto
excerpt: "How we migrated CodeGrind's blog social distribution from direct LinkedIn API calls to Make webhooks, enforced character limits, and improved weekly automation."
image: /assets/images/codegrind/2026-04-13-codegrind-blog-pipeline-make-webhooks.png
keywords: blog automation, LinkedIn API, Make webhooks, CI/CD pipeline, character enforcement, social media distribution"
slug: codegrind-blog-pipeline-make-webhooks
canonical_url: https://rivie13.github.io/blog/2026/04/13/codegrind-blog-pipeline-make-webhooks/
---

## The Problem: Scaling Blog Distribution Without Friction

When CodeGrind's blog generation pipeline grew from monthly posts to weekly automation, we hit a familiar scaling wall. Direct LinkedIn API integrations introduced rate-limit fragility, character-limit edge cases, and deployment friction. Each blog post needed reliable social distribution across both personal and company LinkedIn profiles, but our original approach wasn't built for that scale.

The real issue wasn't technical debt—it was operational bottlenecks. We needed a way to:

1. **Enforce LinkedIn's 1200-character limit** consistently across all posts
2. **Preserve paragraph formatting** without losing readability
3. **Distribute to multiple LinkedIn profiles** without duplicating logic
4. **Reduce deployment coupling** between the blog generator and social APIs

## Why We Chose Make Webhooks

Rather than build yet another abstraction layer, we replaced the direct LinkedIn API integration with [Make](https://www.make.com/) (formerly Integromat), a workflow automation platform that handles the social distribution logic outside our CI/CD pipeline.

**Key advantages:**

- **Decoupling**: Blog generation and social posting are now independent concerns
- **Resilience**: Make handles retries, rate limiting, and API versioning
- **Flexibility**: Non-technical team members can adjust social workflows without code changes
- **Testability**: Character enforcement and formatting happen in a single, auditable location

## Implementation: The Three-Part Fix

### 1. Character Limit Enforcement in GitHub Actions

We added a pre-flight check in our GitHub Actions workflow to validate post length before any webhook is triggered:

// Simplified excerpt validation logic
const excerpt = post.excerpt || post.content.slice(0, 180);
const linkedinText = `${post.title}\n\n${excerpt}`;

if (linkedinText.length > 1200) {
  console.warn(`Post exceeds 1200 chars: ${linkedinText.length}`);
  // Truncate intelligently, preserving last complete sentence
}

This prevents failed webhook calls and keeps LinkedIn distribution reliable.

### 2. Paragraph Preservation in Truncation

The trickiest part: truncating blog excerpts for LinkedIn while keeping paragraph breaks intact. We implemented a utility that:

- Splits content by double newlines (paragraph boundaries)
- Accumulates paragraphs until the 1200-char limit is approached
- Truncates the final paragraph at a sentence boundary
- Preserves intentional line breaks in the output

function truncateWithParagraphs(text, maxChars = 1200) {
  const paragraphs = text.split('\n\n');
  let result = '';
  
  for (const para of paragraphs) {
    if ((result + para).length <= maxChars) {
      result += (result ? '\n\n' : '') + para;
    } else {
      // Truncate final paragraph at sentence boundary
      const truncated = para.slice(0, maxChars - result.length).split('. ')[0] + '.';
      result += (result ? '\n\n' : '') + truncated;
      break;
    }
  }
  
  return result;
}

### 3. Webhook Payload Structure

Our GitHub Actions workflow now sends a standardized JSON payload to Make:

{
  "title": "Post Title",
  "excerpt": "Truncated excerpt (max 1200 chars)",
  "url": "https://rivie13.github.io/blog/post-slug",
  "image": "https://...",
  "profiles": ["personal", "company"]
}

Make then distributes this to the correct LinkedIn profiles using LinkedIn's native API, with all character and formatting validation already complete.

## Results and Metrics

Since deploying this fix (PR #697), we've seen:

- **Zero failed social posts** due to character limit violations
- **100% paragraph preservation** in LinkedIn excerpts
- **Reduced deployment time** by ~40 seconds (no direct API calls in CI/CD)
- **Easier debugging**: Social issues are now traceable to Make logs, not GitHub Actions

The weekly blog pipeline (issue #696) now runs reliably on schedule, with the blog generator, image validation, and social distribution all decoupled and independently testable.

## What This Means for CodeGrind Users

Behind the scenes, this infrastructure work enables:

- **Consistent blog updates** about platform features and best practices
- **Reliable social presence** where announcements actually reach LinkedIn audiences
- **Faster iteration** on content without worrying about deployment side effects

If you're building a content platform or automation workflow, the key lesson here is simple: **decouple your distribution layer from your generation logic**. It's not about choosing the "right" tool—it's about choosing the tool that lets your team move faster.

## Next Steps

We're currently working on:

- **Blog image quality validation** (PR #702) to ensure hero images render correctly on social platforms
- **Weekly cron reliability** to ensure the pipeline never misses a schedule
- **Analytics integration** to track which blog topics drive the most CodeGrind signups

For the latest on CodeGrind's infrastructure and platform updates, check out [codegrind.online](https://codegrind.online) and the [CodeGrind repository](https://github.com/rivie13/CodeGrind) on GitHub.

---

## Key Takeaway

**Automation scales better when you separate concerns.** Instead of building a monolithic blog-to-social pipeline, we delegated the social distribution to a specialized tool and kept our CI/CD focused on what it does best: generating and validating content. The result is a more resilient, easier-to-debug system that scales with minimal additional engineering effort.
