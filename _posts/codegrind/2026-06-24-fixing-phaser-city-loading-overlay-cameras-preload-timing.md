---
layout: post
title: "Fixing Phaser City Loading: Overlay Cameras, Preload Timing, and Service Worker Asset Fetches"
date: 2026-06-24 06:00:00 +0000
categories: [CodeGrind, Game Development, Frontend]
tags: [CodeGrind, Phaser, performance, hydration, Bug Fixes, JavaScript, Game Development]
author: Riviera Sperduto
excerpt: "I fixed City Mode loading bugs by tightening Phaser overlay camera state, preload timing, hydration checks, and service worker asset handling."
image: /assets/images/codegrind/2026-06-24-fixing-phaser-city-loading-overlay-cameras-preload-timing.png
keywords: CodeGrind, Phaser performance, City Mode loading, service worker assets, hydration checks, preload timing, JavaScript game development
slug: fixing-phaser-city-loading-overlay-cameras-preload-timing
canonical_url: https://rivie13.github.io/blog/2026/06/24/fixing-phaser-city-loading-overlay-cameras-preload-timing/
---

CodeGrind's implementation of the phaser game engine had the kind of loading bug that wastes an entire afternoon because nothing is technically “crashing.” The page loaded, Phaser booted, the scene existed, but the apartment intro flow could get stuck behind an overlay camera or render in the wrong visual state depending on timing. There was also just a lot of performance bugs that really made the site not feel great to use on initial boot, which is a big cause for people to bounce.

The real problem was a combination of many things:
1. lifecycle drift: React route hydration, Phaser scene readiness, service worker asset fetches, and mobile onboarding UI were all making assumptions about when the game was “ready.”
2. Phaser's boot sequence was not being initiated at the points it should have been or worse being skipped if a user went through the home page too fast, which caused loading screens to get stuck occassionally.
3. Heavy network calls to load in big assests caused CPU spikes which caused the site to stutter or worse freeze up because these loads were happening on the main thread.

I spent this pass tightening those boundaries in [CodeGrind](https://codegrind.online): overlay cameras now explicitly enter and exit fullscreen states, the service worker path for game assets got stricter error handling, and lazy loading reduced the amount of frontend work competing with Phaser startup.

## The Runtime Bug: Phaser Was Ready, but the Camera Stack Wasn’t

The failing path was City Mode apartment loading:

/city?scene=apartment-room-01
&entry=path-choice
&track=beginner
&learningPath=python-path
&apartmentState=hub
&fallback=%2Flearning%2Fpython-path

The apartment scene uses a normal main camera for the room plus a fullscreen overlay camera for intro and transition UI. The issue was that the overlay camera could remain visible after the overlay targets faded out.

That leaves Phaser in a bad visual state:

- scene children exist
- main camera exists
- intro overlay objects may be hidden
- fullscreen overlay camera can still be active
- rendering appears blank, blocked, or visually stale

The bug was not “Phaser didn’t load.” It was “Phaser loaded, but the camera visibility lifecycle was under-specified.”

## I Added a Headless Scene Inspection Script

Before changing more scene code, I added a tiny Playwright probe so I could inspect the live Phaser scene without guessing from screenshots.

import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type().toUpperCase()}]: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[UNCAUGHT EXCEPTION]: ${err.stack || err.message}`);
  });

  console.log('Navigating to city page (1080p)...');
  await page.goto('http://localhost:5173/city?scene=apartment-room-01&entry=path-choice&track=beginner&learningPath=python-path&apartmentState=hub&fallback=%2Flearning%2Fpython-path');

  await page.waitForTimeout(8000);

  console.log('Taking screenshot...');
  await page.screenshot({ path: 'apartment_hub_debug.png' });

  const sceneInfo = await page.evaluate(() => {
    const scene = window.__CODEGRIND_APARTMENT_PREVIEW_SCENE__;
    if (!scene) {
      return { error: 'SCENE NOT FOUND' };
    }
    return {
      sceneReady: scene.isSceneReady,
      mainCameraExists: !!scene.cameras.main,
      mainCameraType: scene.cameras.main ? scene.cameras.main.constructor.name : null,
      mainCameraVisible: scene.cameras.main ? scene.cameras.main.visible : null,
      mainCameraWillRenderType: scene.cameras.main ? typeof scene.cameras.main.willRender : null,
      overlayCameraExists: !!scene.fullscreenOverlayCamera,
      overlayCameraVisible: scene.fullscreenOverlayCamera ? scene.fullscreenOverlayCamera.visible : null,
      childrenCount: scene.children ? scene.children.list.length : 0,
      childrenTypes: scene.children ? scene.children.list.map(c => c.type) : [],
    };
  });

  console.log('SCENE INFO:', sceneInfo);

  await browser.close();
}

run().catch(console.error);

The important part is this block:

overlayCameraExists: !!scene.fullscreenOverlayCamera,
overlayCameraVisible: scene.fullscreenOverlayCamera ? scene.fullscreenOverlayCamera.visible : null,
childrenCount: scene.children ? scene.children.list.length : 0,
childrenTypes: scene.children ? scene.children.list.map(c => c.type) : [],

I did not need a full test harness for this pass. I needed a fast runtime inspection hook that answered one question: *is the scene actually loaded, or is camera state lying to me?*

That gave me a clean split between asset/preload failures and rendering/camera failures.

## The Core Fix: Make Overlay Camera Visibility Explicit

The first lifecycle fix landed in `createApartmentPreviewScene.js`.

When the apartment scene finishes hiding intro targets and returns to the main viewport, I now force the fullscreen overlay camera off:

if (this.fullscreenOverlayCamera) {
  this.fullscreenOverlayCamera.setVisible(false);
}

if (this.cameras?.main) {
  this.updateViewportLayout();
}

This looks small, but it removes ambiguity. The overlay targets fading out is not the same thing as the overlay camera becoming inactive. Phaser will still keep a camera alive until I explicitly change it.

### Turning the Overlay Camera Back On During Intro

The matching change went into `introFlowMethods.js`:

this.layoutIntroOverlay?.();

if (this.fullscreenOverlayCamera) {
  this.fullscreenOverlayCamera.setVisible(true);
}

[this.introBackdropMatte, this.introCityBackdrop, this.introCityTint]
  .filter(Boolean)
  .forEach((target) => {

This is the other half of the lifecycle contract:

- intro starts → overlay camera visible
- intro ends → overlay camera hidden
- viewport layout updates → main camera owns the room again

Without both sides, I was relying on whatever state the camera happened to retain from the previous render path.

## Preventing Overlay Camera Clears from Wiping the Scene

The overlay camera setup also needed one Phaser-specific detail:

this.fullscreenOverlayCamera = this.cameras.add(
  0,
  0,
  gameWidth,
  gameHeight,
  false,
  'ApartmentPreviewOverlayCamera'
);
this.fullscreenOverlayCamera.clearBeforeRender = false;

The new line is:

this.fullscreenOverlayCamera.clearBeforeRender = false;

That matters because this camera is not supposed to behave like a primary world-rendering camera. It exists for overlay composition. If it clears before render at the wrong point in the stack, it can create the exact kind of “blank but loaded” behavior that makes scene debugging annoying.

I want the overlay camera to draw overlay content without destroying what the main camera already rendered.

## I Closed the Fade-Out Paths Too

The scene had multiple ways to leave intro/overlay mode. Fixing only the main path would have left timing bugs behind.

In `viewportCameraMethods.js`, the fade-out completion now hides the overlay camera:

overlayTargets.forEach((target) => {
  target.setVisible(false);
});
if (this.fullscreenOverlayCamera) {
  this.fullscreenOverlayCamera.setVisible(false);
}

And in `windowCameraTerminalMethods.js`, terminal overlay completion does the same:

this.introCityAnimationTimer?.remove(false);
this.introCityAnimationTimer = null;
if (this.fullscreenOverlayCamera) {
  this.fullscreenOverlayCamera.setVisible(false);
}

This is the part I care about most in Phaser scene work: every entry path needs a matching exit path. It is easy to add a camera for one overlay and forget that three different animation flows can dismiss it.

## Service Worker Asset Fetches Were Part of the Loading Problem

The same loading pass also touched the service worker path. I refactored fetch handling around game assets, API requests, Azure Blob Storage CORS behavior, and error logging.

The activity was centered around these changes:

refactor: streamline service worker fetch handling for game assets and improve error logging
refactor: enhance service worker error handling and improve hydration checks in Phaser integration
refactor: update service worker to support CORS for Azure Blob Storage and improve asset handling
fix: include API requests in service worker fetch handling for game assets

I am keeping this grounded to the available code notes rather than pretending the exact service worker diff is here. The architectural issue was clear enough: City Mode does not only depend on bundled JavaScript. It depends on game assets, API-loaded state, and cross-origin blob-hosted resources behaving consistently during startup.

If a service worker swallows an asset failure or treats a game fetch like a normal document request, Phaser can hang in a misleading state. Better error logging matters because the visible symptom is often “the scene did not finish,” while the real cause is a missing image, failed CORS fetch, or stale cached response.

## Lazy Loading Reduced Contention Before Phaser Boot

I also refactored the public app structure to lazy load pages:

refactor: implement lazy loading for pages and enhance PublicApp structure

That change was part of the same performance pass. City Mode is heavier than a static marketing page or auth screen. If the app eagerly imports unrelated routes before Phaser even gets its turn, the browser does unnecessary parse and execution work on the critical path.

The goal was simple:

- keep public routing lighter
- defer non-current page code
- let Phaser scene initialization compete with less JavaScript during startup
- reduce Lighthouse pressure from oversized initial work

This all means that first time users get a meaningful improvement to many different facets of the site: initial page loads are smoother and quicker, page stutters are eliminated when we 
allow assets to get lazy loaded and happen in the background, and they don't get stuck on loading transitions anymore.

Be sure to check out the site and let me know what you think of the improved UX!

