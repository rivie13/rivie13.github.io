---
layout: post
title: "CodeGrind Goes Open Core & The $0 Infrastructure Migration"
date: 2026-07-09 06:00:00 +0000
categories: [CodeGrind, Development, Cloud Optimization]
tags: [CodeGrind, Open Source, Infrastructure, Migration, Azure, Vercel, Render, Neon, Axiom, Cloudinary, OpenRouter, Microservices, Cost Optimization]
author: Riviera Sperduto
excerpt: "CodeGrind's frontend is now open core under a Business Source License, and I've migrated the entire stack off Azure to a $0 infrastructure model. Here's exactly how I pulled it off."
image: /assets/images/codegrind/2026-07-09-codegrind-open-core-migration.png
keywords: codegrind open core, infrastructure migration, azure to vercel, zero cost hosting, microservice architecture, busl license"
slug: codegrind-goes-open-core-and-the-0-infra-migration
canonical_url: https://rivie13.github.io/blog/2026/07/09/codegrind-goes-open-core-and-the-0-infra-migration/
---

CodeGrind has just gone **open core**! I've officially released a major chunk of the frontend codebase to the public under a **Business Source License**, which will automatically convert to **Apache 2.0 in 2030**.

You can check out the new public repository here: [github.com/rivie13/codegrind-public-frontend](https://github.com/rivie13/codegrind-public-frontend)

For the last two weeks, I've been entirely buried in migrating the app to a new microservice-based architecture. Honestly, running production-grade Azure services—even on their lowest tiers—was bleeding me over **$120 a month**. The Azure experience was fantastic to have while I've been navigating the job hunt and scaling the app, but dropping my infrastructure bill to a flat **$0** is a massive win.

Here is exactly how I pulled off the migration.

## The Infrastructure Shift

| What I Had on Azure | What I'm Using Now (The $0 Stack) |
|---|---|
| **App Service** (Hosted backend & served frontend) | **Vercel** (Serving frontend) + **Render.com** (Hosting backend) |
| **Key Vault** (Secrets management) | Handled natively via provider environment variables |
| **VM** (Ran Judge0 for server-side code execution) | *Eliminated entirely* (Dropped the server requirement) |
| **Blob Storage** (Logs & media assets) | **Cloudinary** (Public media) + **Axiom.co** (Telemetry & logs) |
| **PostgreSQL DB** | **Neon** (Serverless Postgres) |
| **App Insights** (Telemetry) | **Axiom.co** |
| **Azure AI Foundry** (AI features & prompt safety) | **OpenRouter** |
| — | **UptimeRobot.com** (New public status dashboard) |

Getting this set up was incredibly smooth. No credit cards required—I just hooked up my GitHub account and let the integration do the heavy lifting.

## Smart Client-Side Refactoring

You might notice there isn't a dedicated code execution engine listed in my new stack. During the migration, I completely refactored how code execution works. It now runs entirely **client-side on the user's machine**. This architectural shift completely eliminates a massive server expense and keeps the backend from getting clogged up with heavy execution runs.

In order to make this happen, we had to take out C++ from the site (for now), but we still have Python, Java and JavaScript to choose from for now. To run client side code execution we use the browser and webworkers: for JavaScript it is just run in the browser! Pyodide for python, and Cheerpj for Java. All are free to use/license due to the solo dev nature of CodeGrind and now open core nature of the code.

Because of these changes, I'm also completely removing code execution limits soon. They just don't make sense anymore and I am pretty sure it is currently bugged out because of the refactor.

## Monorepo to Multi-Repo & Cleanup

Alongside the infrastructure shift, I broke down the original monorepo into a multi-repo structure and stripped out a ton of code bloat.

To move CodeGrind to an open-core model, I kept the backend private, stripped the proprietary code out of the frontend that makes CodeGrind unique, and opened up pretty much everything else. I still have a lot of refactoring left to do on the frontend, but right now my absolute priority is just ensuring everything is locked down and working properly before I keep cleaning up the codebase.

## What's Next

My biggest immediate goal is patching up a leaky funnel. I need to simplify the UI to make it less confusing and overhaul the tutorial so new users know exactly what to do. That was actually the main focus of my attention before I had to hit the brakes and prioritize this infrastructure migration.

Now that the migration is stable, it's time to get back to the core product experience. There's always a million things to do when you're a solo developer, but I'm excited to keep building.

Take a look at the new setup in action over at [codegrind.online](https://codegrind.online/) to see the fresh microservice coat of paint!
