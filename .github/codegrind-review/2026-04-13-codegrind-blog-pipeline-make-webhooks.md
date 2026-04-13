# CodeGrind Blog Review Packet

## Draft post

- Title: Fixing CodeGrind's Blog Pipeline: From LinkedIn API to Make Webhooks
- Post file: _posts/codegrind/2026-04-13-codegrind-blog-pipeline-make-webhooks.md
- Canonical URL: https://rivie13.github.io/blog/2026/04/13/codegrind-blog-pipeline-make-webhooks/
- Image path: /assets/images/codegrind/2026-04-13-codegrind-blog-pipeline-make-webhooks.png
- Image generated this run: true

## Review notes

- Approve this PR only when both the article content and the social copy look ready for public release.
- Merging this PR will publish the post on the site and dispatch the approved social copy workflow.
- If edits are needed, update this PR branch instead of merging.

## Social preview

### Bluesky

Enabled: true

CodeGrind's blog pipeline evolved! We migrated from direct LinkedIn API calls to Make webhooks, enhancing automation and reliability. Learn how we enforced character limits and improved distribution. https://rivie13.github.io/blog/2026/04/13/codegrind-blog-pipeline-make-webhooks/

### LinkedIn

Enabled: true

CodeGrind's blog distribution faced scaling challenges with direct LinkedIn API integrations, leading to rate limit fragility and character limit issues. We've successfully migrated our workflow to Make webhooks, decoupling blog generation from social posting and improving weekly automation.

Our solution involved:
1. Character Limit Enforcement: A preflight check in GitHub Actions ensures posts adhere to LinkedIn's 1200-character limit.
2. Paragraph Preservation: A utility intelligently truncates excerpts while maintaining paragraph breaks and sentence integrity.

This shift enhances resilience, flexibility for non-technical team members, and testability, ensuring reliable social distribution.

Read the full story:
https://rivie13.github.io/blog/2026/04/13/codegrind-blog-pipeline-make-webhooks/
