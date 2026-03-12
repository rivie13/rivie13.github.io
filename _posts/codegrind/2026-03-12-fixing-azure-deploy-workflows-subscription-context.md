---
layout: post
title: "Fixing Azure Deploy Workflows: Decoupling Login from Subscription Context"
date: 2026-03-12 06:00:00 +0000
categories: [CodeGrind, DevOps]
tags: [CodeGrind, Azure, CI/CD, GitHub Actions, Cloud Architecture, Automation, Deployment]
author: Riviera Sperduto
excerpt: "How CodeGrind resolved a critical Azure login failure by decoupling authentication from subscription preflight checks."
image: /assets/images/codegrind/2026-03-12-fixing-azure-deploy-workflows-subscription-context.png
keywords: Azure login, GitHub Actions, subscription context, CI/CD, deployment automation, cloud infrastructure"
slug: fixing-azure-deploy-workflows-subscription-context
canonical_url: https://rivie13.github.io/blog/2026/03/12/fixing-azure-deploy-workflows-subscription-context/
---

## The Problem

Last week, CodeGrind's deployment pipeline started failing with a cryptic error: **"No subscriptions found"** during the Azure login step. The issue wasn't that we lacked subscriptions—it was that the `azure/login` action was performing a subscription preflight check that didn't match our deployment context.

This type of failure is insidious because it happens *after* successful authentication but *before* any actual deployment work. The error message makes it sound like a credentials issue, but the real problem was architectural: we were coupling two concerns that should have been independent.

## Root Cause Analysis

The `azure/login` GitHub Action performs several steps:
1. Authenticate with Azure using provided credentials
2. Query available subscriptions
3. Set the default subscription context
4. Return subscription metadata as JSON

Our workflow was failing at step 2 because the service principal had valid credentials but the subscription query returned an empty result set. This could happen when:
- The service principal has permissions on a management group but not on individual subscriptions
- The tenant has multiple subscriptions but none are assigned to the principal
- The principal's role is scoped to resources, not subscriptions

## The Solution

We extracted subscription handling into a **separate composite action** called `azure-auth-preflight`. This action:

1. **Performs authentication only** — no subscription validation
2. **Gracefully handles missing subscriptions** — doesn't fail if the query returns null or empty
3. **Adds defensive JSON parsing** — validates the subscription response before attempting to use it
4. **Decouples concerns** — login and subscription context are now independent steps

### Implementation

# .github/actions/azure-auth-preflight/action.yml
name: 'Azure Auth Preflight'
description: 'Authenticate with Azure and optionally set subscription context'
inputs:
  azure-credentials:
    required: true
    description: 'Azure service principal credentials'
  allow-no-subscriptions:
    required: false
    default: 'true'
    description: 'Allow auth to succeed even if no subscriptions are found'
runs:
  using: 'composite'
  steps:
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ inputs.azure-credentials }}
    
    - name: Set Subscription Context (if available)
      shell: bash
      run: |
        SUBS=$(az account list --output json 2>/dev/null || echo '[]')
        if [ "$(echo "$SUBS" | jq 'length')" -gt 0 ]; then
          FIRST_SUB=$(echo "$SUBS" | jq -r '.[0].id')
          az account set --subscription "$FIRST_SUB"
          echo "Subscription context set to: $FIRST_SUB"
        else
          if [ "${{ inputs.allow-no-subscriptions }}" != "true" ]; then
            echo "Error: No subscriptions found"
            exit 1
          fi
          echo "No subscriptions found, but continuing (allow-no-subscriptions=true)"
        fi

### Usage in Deploy Workflow

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Azure Auth Preflight
        uses: ./.github/actions/azure-auth-preflight
        with:
          azure-credentials: ${{ secrets.AZURE_CREDENTIALS }}
          allow-no-subscriptions: 'true'
      
      - name: Deploy to Azure
        run: |
          # Your deployment commands here
          az functionapp deployment source config-zip ...

## Why This Matters for CodeGrind

CodeGrind's deployment pipeline runs multiple times per day. A single flaky Azure login step could:
- Block blog post generation (automated daily)
- Delay bug fixes from reaching production
- Prevent emergency hotfixes during peak hours

By decoupling authentication from subscription validation, we:
- **Reduced failure surface area** — login now only depends on credentials, not subscription state
- **Improved debugging** — subscription issues are now visible as warnings, not fatal errors
- **Increased reliability** — the pipeline continues even if subscription metadata is unavailable
- **Maintained security** — no credentials are logged or exposed

## Key Takeaways

1. **Separate authentication from context** — login and subscription selection are distinct concerns
2. **Fail gracefully** — use defensive parsing for cloud API responses
3. **Make errors actionable** — distinguish between "auth failed" and "subscription not found"
4. **Test edge cases** — service principals with unusual permission scopes will expose these issues

For teams using Azure in GitHub Actions, this pattern applies to any workflow that combines `azure/login` with downstream Azure CLI commands. The decoupling is especially important in multi-tenant or multi-subscription environments.

Learn more about CodeGrind's infrastructure at [codegrind.online](https://codegrind.online), and explore the full deployment workflow in the [CodeGrind repository](https://github.com/rivie13/CodeGrind).

---

**Further Reading:**
- [Azure/login GitHub Action Documentation](https://github.com/Azure/login)
- [Azure CLI Account Management](https://learn.microsoft.com/en-us/cli/azure/account)
- CodeGrind's previous post on [CI/CD improvements](https://rivie13.github.io/codegrind/2026/03/10/streamlining-development-workflows-recent-updates-codegrind-ci-cd.html)
