# CodeGrind 1.5 Update Plan (No Code Changes Yet)

## Goals
1. Update the CodeGrind trailer on the site to the new YouTube video: https://youtu.be/7ojBLtyNI50
2. Refresh CodeGrind content across the site to match the current state (Version 1.5.0 and 1.13.0 details).
3. Draft a new blog post plan for the 1.5 release.

---

## A. Trailer Update (New YouTube Video)
**Target video:** 7ojBLtyNI50

**Likely file locations to update (verify in repo):**
- _data/projects.yml (CodeGrind `video_id`)
- Any page or include that embeds the trailer:
  - _includes/video-embed.html
  - _includes/project-card.html
  - projects.md or other project pages
  - index.md (featured project)

**Action:** replace old video ID with `7ojBLtyNI50` wherever CodeGrind trailer is referenced.

---

## B. Content Refresh for CodeGrind (Site Copy)
Update the project content to reflect current state and the 1.5.0 release.

### 1) Core Messaging Updates
**Positioning (short description):**
- “Gamified coding practice platform with a Tower Defense game, learning paths, AI assistance, and community features.”

**Detailed description additions:**
- Modular Tower Defense V2 engine and refactor details
- Learning Paths demo with structured curriculum and tracking
- XP & progression system (streaks, achievements, levels)
- AI problem generation, snippet generation, enhanced chat UX and context
- Stripe subscriptions and improved profile/leaderboard/dashboard
- Discord community and in-app integration
- Audio, visual polish, ad updates

### 2) Update fields in _data/projects.yml (CodeGrind)
**Replace/extend:**
- `description`
- `detailed_description`
- `features` (add 1.5 items)
- `achievements` (add release milestone or community growth if desired)
- `future_plans` (align with current roadmap)
- `video_id` (new trailer)
- `last_updated` (set to 2026-01-31 or 2026-01-30)

**Suggested feature list (curated):**
- Tower Defense V2 engine with modular systems
- Challenge maps and upgraded tutorial flow
- Learning Paths demo with module-based objectives
- XP, streaks, and progression stats
- AI problem and snippet generation, improved chat UX
- Stripe subscriptions and improved profiles/leaderboards
- Discord community integration and announcements
- Expanded audio/visual polish, ads, and background system

### 3) Optional Content Touchpoints
**If present, update text in:**
- index.md (featured project copy)
- projects.md (project page summary)
- any CodeGrind-specific blog pages or sections

---

## C. Blog Post Plan (Version 1.5.0)
**Proposed Title Options:**
2. “CodeGrind 1.5.0 Release: A Full Platform Refactor and New Learning Systems” (I like this one, use this one)

**Slug suggestion:** 2026-01-30-codegrind-1-5-the-refactoring.md

**Front Matter Draft (to finalize later):**
- layout: post
- title: “CodeGrind 1.5.0: The Refactoring”
- date: 2026-01-30
- categories: [codegrind, development, gamedevelopment]
- tags: [codegrind, tower-defense, refactor, learning-paths, ai, progression]

### Blog Structure (Feature Announcement Style)
1. **Intro**
   - Why 1.5.0 is a foundational upgrade
   - Emphasis on modularity, scalability, and better learning flow

2. **Massive Codebase Refactor**
   - V2 engine for Tower Defense
   - UI split into panels/hooks/utils
   - Home experience modularization & performance

3. **Tower Defense V2 Overhaul**
   - New upgrade panel, deployables, terminal commands
   - Improved enemies/projectiles/towers + balance
   - Challenge maps & curated progression

4. **Learning Paths Demo**
   - Structured modules and objectives
   - Completion tracking and guided practice

5. **XP & Progression**
   - XP/streaks/achievements
   - Leveling feedback + milestone rewards
   - Discord integration for community engagement

6. **AI, Chat, and Creator Tools**
   - Problem/snippet generation improvements
   - Better context handling and reliability
   - Prompt injection guardrails

7. **Payments, Profiles, and Community**
   - Stripe subscriptions and cancellations
   - Profile dashboard upgrades
   - Blog feed + Discord join entry

8. **Discord Community**
   - In-app integration
   - Bot + announcements + support channels
   - Challenges/tournaments

9. **Audio, Ads, Visual Polish**
   - Soundtrack expansion
   - Ad slot management
   - Giphy backgrounds + UI refinements

10. **What’s Next**
   - Expand Learning Paths
   - Progression tuning and new challenge maps
   - Continued AI and content improvements

11. **CTA**
   - Link to CodeGrind

   https://codegrind.online/

   https://codegrind.online/games/tower-defense-v2-demo/two-sum

   https://codegrind.online/learning


   - Invite community feedback and Discord
   https://discord.gg/6NvX2Q8raT

### Assets to Include
- New trailer embed
- 2–4 screenshots of the V2 UI (if available) (we can use the ones on azure blob storage)

https://codegrindpublicmedia.blob.core.windows.net/public-media/images/AI_Problem_Generation_GIF_Edited.gif

Blog_FAQ_Upgrades_GIF_Edited.gif
Learning_Demo_GIF_Edited.gif
ProblemWorkspace.png
TowerDefense_V2_GIF_Edited.gif
TowerDefense_V2_Gameplay_Clip_GIF_Edited.gif


- Optional GIFs of challenge maps or UI panels

---

## D. Checklist (Execution Order)
1. Locate all CodeGrind trailer references and swap to `7ojBLtyNI50`
2. Update CodeGrind copy in _data/projects.yml
3. Audit featured-project text on index/projects pages
4. Draft new blog post using the structure above
5. Verify tags/categories align with existing taxonomy

---

## Notes / Follow-ups
- Confirm the exact last_updated date (01/30/2026 is the 1.5 release date)
- Provide any new stats or metrics to include (users, sessions, retention)
- Provide screenshots or key UI visuals for the blog post
