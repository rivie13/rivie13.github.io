---
layout: post
title: "Fixing the City Tutorial Camera Lifecycle and Mobile Tower Dock"
date: 2026-06-22 06:00:00 +0000
categories: [CodeGrind, Game Development, UX]
tags: [CodeGrind, Phaser, Mobile UX, Onboarding, Performance, Bug Fixes]
author: "Riviera Sperduto"
excerpt: "I fixed a Phaser overlay camera lifecycle bug and removed brittle mobile tower dock assumptions from the tutorial flow."
image: /assets/images/codegrind/2026-06-22-fixing-city-tutorial-camera-lifecycle-mobile-tower-dock.png
keywords: CodeGrind, Phaser camera lifecycle, mobile onboarding, tutorial overlay, tower defense UI, frontend performance, city mode"
slug: fixing-city-tutorial-camera-lifecycle-mobile-tower-dock
canonical_url: https://rivie13.github.io/blog/2026/06/22/fixing-city-tutorial-camera-lifecycle-mobile-tower-dock/
---

The bug was not subtle: the apartment intro overlay could survive past its welcome flow and keep interfering with the actual scene. On desktop it showed up as a rendering/layering problem. On mobile it combined with tutorial state assumptions and made the tower-defense onboarding feel like it was fighting the viewport.

I fixed two related pieces this week:

1. The Phaser fullscreen overlay camera now has a stricter lifecycle.
2. The mobile tower dock tutorial no longer auto-opens from brittle selector heuristics.

This work sits directly in the City Mode and learning-path onboarding code inside [my CodeGrind repo](https://github.com/rivie13/CodeGrind). The production app is at [codegrind.online](https://codegrind.online).

## The real problem: overlay cameras were visible too long

The City apartment preview scene has multiple camera responsibilities:

- the main game camera renders the room/world
- a fullscreen overlay camera handles intro/backdrop/tutorial presentation
- window/terminal flows temporarily animate overlay elements
- viewport layout code reacts to resize and responsive changes

That split is fine, but only if visibility is explicit. The previous behavior let the overlay camera exist after the intro overlay had faded or been dismissed. The overlay targets could be hidden while the camera itself remained part of the render pass.

The important fix was small, but it had to happen in several lifecycle exit paths.

if (this.fullscreenOverlayCamera) {
  this.fullscreenOverlayCamera.setVisible(false);
}

if (this.cameras?.main) {
  this.updateViewportLayout();
}

That change landed in `createApartmentPreviewScene.js`, right after intro targets are pushed to alpha `0`.

The reason I like this fix is that it does not rely on “nothing visible means nothing renders.” In Phaser, camera existence and camera visibility are separate concerns. A camera can still participate in the scene pipeline even when the objects it was meant to render are transparent or hidden. I wanted the camera lifecycle to match the UI lifecycle.

## Making the intro overlay camera opt-in again

The inverse also needed to be explicit. When the intro starts, the fullscreen overlay camera should be visible again.

In `introFlowMethods.js`, I added:

this.layoutIntroOverlay?.();

if (this.fullscreenOverlayCamera) {
  this.fullscreenOverlayCamera.setVisible(true);
}

[this.introBackdropMatte, this.introCityBackdrop, this.introCityTint]
  .filter(Boolean)
  .forEach((target) => {

This makes the flow symmetrical:

- intro opens → layout overlay → show overlay camera
- intro closes/fades → hide overlay targets → hide overlay camera

That symmetry matters because the scene can be entered from route state like apartment hub, path choice, fallback learning path, or tutorial transitions. If a camera is only hidden in the “happy path,” it will eventually leak into a resize path or a mobile resume path.

## Preventing the overlay camera from clearing the main render

In `overlaySetupMethods.js`, I also changed the camera setup:

this.fullscreenOverlayCamera = this.cameras.add(
  0,
  0,
  gameWidth,
  gameHeight,
  false,
  'ApartmentPreviewOverlayCamera'
);
this.fullscreenOverlayCamera.clearBeforeRender = false;

The critical line is:

this.fullscreenOverlayCamera.clearBeforeRender = false;

A fullscreen overlay camera should layer on top of the scene. It should not clear before it renders. If it clears, the overlay camera can wipe or visually disrupt the camera underneath it depending on render order and scene state.

This is one of those Phaser footguns where the bug feels like “the UI is flickering” or “the scene disappeared,” but the underlying cause is camera composition. The fix is not a CSS z-index tweak. It is render pipeline hygiene.

## Closing every exit path, not just the obvious one

I also hid the overlay camera in the viewport and terminal overlay teardown methods.

In `viewportCameraMethods.js`:

overlayTargets.forEach((target) => {
  target.setVisible(false);
});
if (this.fullscreenOverlayCamera) {
  this.fullscreenOverlayCamera.setVisible(false);
}

And in `windowCameraTerminalMethods.js`:

this.introCityAnimationTimer?.remove(false);
this.introCityAnimationTimer = null;
if (this.fullscreenOverlayCamera) {
  this.fullscreenOverlayCamera.setVisible(false);
}

The timer cleanup is important too:

this.introCityAnimationTimer?.remove(false);
this.introCityAnimationTimer = null;

If the animation timer keeps running after the overlay is gone, it can mutate objects that are already hidden or in transition. That creates the classic “it only breaks after skipping intro / rotating the phone / reopening the scene” bug class.

The rule I used here: any method that ends the overlay experience must also end the overlay camera’s participation in rendering.

## I added a Playwright scene inspector instead of guessing

This bug was visual, but I did not want to keep debugging it by staring at the browser. I added a small inspection script under `scripts/inspect_scene.js`.

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

The route is intentionally specific:

/city?scene=apartment-room-01&entry=path-choice&track=beginner&learningPath=python-path&apartmentState=hub&fallback=%2Flearning%2Fpython-path

That path recreates the apartment hub transition without manually clicking through the funnel every time.

The useful part is the scene probe:

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

I wanted direct answers to these questions:

- Did the scene actually initialize?
- Does the main camera exist?
- Is the main camera visible?
- Does the overlay camera exist?
- Is the overlay camera still visible after the intro path?
- How many scene children are alive?

The line that matters most during this bug hunt:

overlayCameraVisible: scene.fullscreenOverlayCamera ? scene.fullscreenOverlayCamera.visible : null,

That gave me a fast yes/no signal without relying only on screenshots.

## Mobile onboarding: removing a bad heuristic

The second bug lived in the learning-path tower defense onboarding.

Before the fix, mobile behavior tried to infer whether the tower dock should open by checking the current onboarding step:

const shouldOpenMobileLoadoutForStep = (step) => {
  if (!step) return false;

  const stepId = String(step.id || '');
  const targetSelector = String(step.targetSelector || '');

  return (
    stepId === 'select-function-tower' ||
    targetSelector.includes("[data-tutorial='tower-") ||
    targetSelector.includes('[data-tutorial="tower-')
  );
};

That looks convenient, but it couples tutorial behavior to selector strings. If a target selector changes, the mobile dock behavior changes. If a step reuses a tower selector for highlighting but should not force-open the dock, the tutorial becomes wrong. If mobile layout is collapsed, the tutorial can open UI at the wrong time.

I replaced it with this:

const shouldOpenMobileLoadoutForStep = (step) => {
  return false;
};

That is intentionally blunt. I stopped allowing tutorial step metadata to force-open the mobile loadout.

This does not mean the mobile dock state is ignored. It means I stopped deriving it from fragile step IDs and selector substrings.

## Tracking the actual dock state

Instead of guessing whether the dock should be open, I added explicit state:

const [mobileDockExpanded, setMobileDockExpanded] = useState(false);

Then I wired it to the DOM marker that represents the actual mobile tower dock:

useEffect(() => {
 
