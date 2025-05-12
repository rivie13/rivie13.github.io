---
layout: post
title: "Part 1: Conception & Collaboration - Planning a Dynamic Portfolio with AI"
date: 2025-05-08 09:00:00 -0500
categories: [Portfolio Tutorial, AI, Jekyll, Planning]
tags: [Jekyll, AI Collaboration, Portfolio Development, Static Sites, Azure Functions, Planning, Cursor, Web Development]
image: /assets/images/tutorial-part1-banner.png # Placeholder - remember to create this image!
---

Welcome to the first part of a multi-part series where I'll take you through the journey of how I built my current portfolio website! This wasn't just any coding project; it was a rapid development sprint, completed in less than a week, heavily influenced by collaboration with AI assistants, and focused on overcoming the typical limitations of a static website to create something truly dynamic and professional – all while aiming for a free, no-cost hosting solution.

This series will dive into the nitty-gritty, from initial planning with AI to deploying a feature-rich site. In this first post, we'll focus on the crucial initial phase: **conception and collaboration**.

## 1.1. The Vision: More Than Just Static

My initial ambition was clear: I wanted a professional portfolio that did more than just list my skills. It needed to be *dynamic*, showcasing my expertise in Full Stack Development, Cloud/Solutions Architecture, and AI Development, alongside my personal interests in coding, music, and math. And, I wanted this built *quickly* and hosted for *free* on GitHub Pages.

But what did "dynamic" mean for a static site? For me, it included:

*   Live display of my recent GitHub activity.
*   Automatically updated "last modified" dates for my projects.
*   A platform that felt alive and reflected my ongoing work.

## 1.2. The GitHub Pages Challenge: Static Site, Dynamic Dreams

The biggest hurdle? GitHub Pages, my hosting platform of choice for its simplicity and free tier, serves static files. This means no traditional backend server to run databases or server-side code that could easily fetch and display dynamic data. How could I reconcile my dynamic dreams with this static reality? This was the central question that kicked off my planning.

{% include blog-ad.html %}

## 1.3. Partnering with AI: Claude & Gemini as Co-Planners

This is where my AI assistants, Claude and Gemini, became invaluable co-planners. I didn't just dive into coding; my AI assistants and I embarked on a planning spree.

*   **Development Environment:** I primarily used **Cursor**, an AI-first code editor. This IDE was instrumental as it allowed for seamless integration and collaboration with AI models directly within my development workflow, making the process of brainstorming, coding, and refining significantly more efficient.

*   **Brainstorming Technologies:** We explored various options.
    *   Why Jekyll? AI helped confirm its suitability due to its native support on GitHub Pages, its simplicity for content management (especially blogs), and its extensibility.
    *   Why Tailwind CSS? For rapid UI development and a modern look, AI discussions highlighted its utility-first approach as a major advantage.

*   **Exploring Dynamic Data Solutions:** This was a big topic with my AI partners. We discussed initial ideas for fetching GitHub data, and they helped identify potential pitfalls, such as security risks and API rate limits. For instance, a conceptual interaction might have been: "I asked Claude, 'How can I display my latest GitHub commits on a static Jekyll site securely without exposing API tokens?'" or "Gemini, help me outline the structure for a portfolio that needs to fetch real-time project updates."

*   **Structuring the Plan:** The AI assistants were also instrumental in helping me structure the `PLANNING.MD` document in my repository. This document became the detailed roadmap for the entire project, capturing all the decisions and steps we had fleshed out.

## 1.4. The Architectural Cornerstone: Secure GitHub API Access

One of the most critical challenges was securely accessing the GitHub API. To get rich data and avoid stringent rate limits, authentication is often necessary. However, embedding API keys or tokens directly in client-side JavaScript on a public static site is a major security no-no – anyone could grab them!

**The AI-Informed Solution:**

Through discussions with my AI collaborators, we converged on the idea of using a server-side proxy. Specifically, we decided that a serverless function would be the perfect fit: lightweight, cost-effective (often free for typical portfolio traffic), and scalable.

This led to the design of the `portfolioWebsitegithubAuth` Azure Function App, the code for which you can find in my public repository: `rivie13/github-api-proxy-function`.

Its purpose is simple but vital:
*   Act as a secure intermediary between my portfolio website and the GitHub API.
*   Handle authentication with the GitHub API (using a token stored securely in the Azure Function's settings, not in my website's code).
*   Forward requests from my website to the GitHub API and then pass the responses back.

Implementing this secure bridge was a key learning goal for me in this project, and it's a pattern I highly recommend for anyone facing similar challenges with static sites.

## 1.5. From Ideas to Blueprint: Solidifying the Plan

The iterative discussions, brainstorming sessions, and problem-solving with AI didn't just float in the air. They were distilled into the comprehensive `PLANNING.MD` document. This step was crucial. It transformed abstract ideas and AI-generated suggestions into a concrete, actionable blueprint, giving me the confidence to move into the development phase with a clear direction.

## 1.6. The "Less Than a Week" Feat: Setting the Pace

I keep mentioning the "less than a week" development timeline because it underscores the power of this collaborative planning approach. By investing time upfront with my AI partners to define the architecture, choose the right technologies, and anticipate challenges, the actual coding process became incredibly streamlined and efficient. Clear architectural decisions, especially regarding the Azure Function proxy, prevented potential roadblocks later on.

---

That wraps up Part 1! We've covered the all-important conceptualization and planning phase, highlighting how AI collaboration and strategic architectural decisions laid the groundwork for building a dynamic portfolio on a static platform.

Stay tuned for **Part 2**, where we'll roll up our sleeves and dive into:
*   Setting up the Jekyll environment.
*   Crafting the basic site structure and layouts.
*   Getting started with styling using Tailwind CSS.

I'm excited to share the next steps with you! 