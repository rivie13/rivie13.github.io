# CodeGrind Blog Review Packet

## Draft post

- Title: Fixing Azure Deploy Workflows: Decoupling Login from Subscription Context
- Post file: _posts/codegrind/2026-03-12-fixing-azure-deploy-workflows-subscription-context.md
- Canonical URL: https://rivie13.github.io/blog/2026/03/12/fixing-azure-deploy-workflows-subscription-context/
- Image path: /assets/images/codegrind/2026-03-12-fixing-azure-deploy-workflows-subscription-context.png
- Image generated this run: true

## Review notes

- Approve this PR only when both the article content and the social copy look ready for public release.
- Merging this PR will publish the post on the site and dispatch the approved social copy workflow.
- If edits are needed, update this PR branch instead of merging.

## Social preview

### Bluesky

Enabled: true

Deployment workflows failing with "No subscriptions found"? CodeGrind shares how decoupling Azure login from subscription context fixed this common issue. Learn more: https://rivie13.github.io/blog/2026/03/12/fixing-azure-deploy-workflows-subscription-context/ #Azure #DevOps #CI/CD

### LinkedIn

Enabled: true

CodeGrind encountered a critical failure in our Azure deployment workflows where the `azure/login` action reported "No subscriptions found." This cryptic error, while appearing to be a credential issue, was actually an architectural problem caused by coupling authentication with subscription preflight checks. We've detailed how we resolved this by creating a composite action, `azureauthpreflight`, to decouple these concerns. This action handles authentication separately, gracefully manages missing subscriptions, and adds defensive JSON parsing. Read the full technical breakdown and implementation details: https://rivie13.github.io/blog/2026/03/12/fixing-azure-deploy-workflows-subscription-context/ #Azure #DevOps #GitHubActions #CI #CD #CloudComputing
