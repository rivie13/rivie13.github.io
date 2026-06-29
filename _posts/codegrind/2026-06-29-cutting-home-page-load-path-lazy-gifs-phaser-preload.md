---
layout: post
title: "Cutting the Home Page Load Path: Lazy GIFs, Lazy Routes, and Phaser Preload Timing"
date: 2026-06-29 06:00:00 +0000
categories: [CodeGrind, Frontend, Performance]
tags: [CodeGrind, Frontend, Performance, Phaser, Vite, React, UX]
author: "Riviera Sperduto"
excerpt: "I removed eager Phaser preloading, deferred showcase GIF downloads, and split route bundles to reduce CodeGrind's initial home page load pressure."
image: /assets/images/codegrind/2026-06-29-cutting-home-page-load-path-lazy-gifs-phaser-preload.png
keywords: CodeGrind performance, React lazy loading, Phaser preload, Lighthouse optimization, lazy GIF loading, Vite code splitting"
slug: cutting-home-page-load-path-lazy-gifs-phaser-preload
canonical_url: https://rivie13.github.io/blog/2026/06/29/cutting-home-page-load-path-lazy-gifs-phaser-preload/
---

The home page was doing too much work before the user asked for anything.

The worst part was not one giant obvious bug. It was death by “small” eager work: a Phaser background preload scheduled from the root app, GIF media with `loading="lazy"` still present in the DOM during Lighthouse’s audit window, and a route table importing pages that did not need to be in the first bundle.

I fixed this by moving Phaser preload behind user intent, deferring showcase media until it is near the viewport, and converting public pages to lazy-loaded route components. The work is in the [CodeGrind repo](https://github.com/rivie13/CodeGrind), and the result is a cleaner first-load path for [CodeGrind](https://codegrind.online).

## The real problem: root-level work leaked into every route

The root app had this preload effect:

import { preloadPhaserBackground } from './utils/phaser/PhaserBackgroundPreloader';

useEffect(() => {
  if (typeof window === 'undefined') return;

  let timeoutId = null;

  const runPreload = () => {
    console.log('[App] Running background preloader (immediate)...');
    preloadPhaserBackground().catch((err) => {
      console.error('[App] Background preloading error:', err);
    });
  };

  timeoutId = setTimeout(runPreload, 0);

  return () => {
    if (timeoutId !== null) {
      console.log('[App] Cancelling scheduled preloader (unmounted)');
      clearTimeout(timeoutId);
    }
  };
}, []);

That `setTimeout(runPreload, 0)` looked harmless, but it effectively meant:

- load the React app
- mount the root component
- immediately enqueue Phaser background preload
- compete with the home page’s critical rendering work
- do it even when the visitor had not clicked into the game/demo path

That was bad for production performance because Phaser assets are not cheap. I do want warm game startup, but not by stealing bandwidth and main-thread time from the landing page.

So I removed the import and the root effect from `App.jsx`:

-import { preloadPhaserBackground } from './utils/phaser/PhaserBackgroundPreloader';

-  useEffect(() => {
-    if (typeof window === 'undefined') return;
-
-    let timeoutId = null;
-
-    const runPreload = () => {
-      console.log('[App] Running background preloader (immediate)...');
-      preloadPhaserBackground().catch((err) => {
-        console.error('[App] Background preloading error:', err);
-      });
-    };
-
-    timeoutId = setTimeout(runPreload, 0);
-
-    return () => {
-      if (timeoutId !== null) {
-        console.log('[App] Cancelling scheduled preloader (unmounted)');
-        clearTimeout(timeoutId);
-      }
-    };
-  }, []);

The root app should coordinate app shell state and routing. It should not start pulling game assets just because React mounted.

## Moving Phaser preload behind the hero click

I still wanted the game path to feel responsive after the visitor commits to it. So I moved the preload trigger into the home flow where the intent actually happens.

The home page previously imported `prebootPhaserInstance`:

-import { prebootPhaserInstance } from '../../utils/phaser/PhaserBackgroundPreloader';
+import { preloadPhaserBackground } from '../../utils/phaser/PhaserBackgroundPreloader';

Then I changed the hero action from prebooting the instance to preloading the background:

-      prebootPhaserInstance().catch((err) => {
-        console.warn('[Home] Background preboot error:', err);
+      preloadPhaserBackground().catch((err) => {
+        console.warn('[Home] Background preload error:', err);
       });

That distinction matters.

A preboot-style call tends to imply more lifecycle risk: creating or warming a Phaser instance before the DOM/game container is definitely in the right state. A background preload is narrower. It keeps the optimization focused on assets instead of prematurely driving the game lifecycle.

The intent gate is the important part. The preload now happens when the user enters the demo path from the hero flow, not automatically during app startup.

## Why `loading="lazy"` was not enough for showcase GIFs

The showcase section had this image rendering path:

<Image
  src={section.mediaSrc}
  alt={section.mediaAlt}
  width="100%"
  height="100%"
  objectFit="cover"
  loading="lazy"
  decoding="async"
  fetchpriority="low"
/>

At a glance, this seems fine. It uses lazy loading, async decoding, and low fetch priority.

But the browser still sees a real `src` immediately. Depending on layout, viewport heuristics, browser behavior, and Lighthouse timing, below-the-fold media can still contribute network pressure earlier than I want.

For heavy showcase GIFs, I wanted stronger control: no `src` at all until the media is within range.

So I added `LazyGifImage`:

/**
 * Lazy-loads an image only when it comes within 200px of the viewport.
 * Keeps the <img> `src` empty during Lighthouse's audit window — zero network
 * activity for showcase GIFs until the user actually scrolls near them.
 */
const LazyGifImage = ({ src, alt, ...imgProps }) => {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box ref={ref} width="100%" height="100%">
      <Image
        src={loaded ? src : undefined}
        alt={alt}
        width="100%"
        height="100%"
        objectFit="cover"
        loading="lazy"
        decoding="async"
        fetchpriority="low"
        {...imgProps}
      />
    </Box>
  );
};

The important line is this:

src={loaded ? src : undefined}

That prevents the browser from fetching the GIF until the observer flips `loaded` to `true`.

I kept the native image hints too:

loading="lazy"
decoding="async"
fetchpriority="low"

Those are still useful after the `src` is attached. The difference is that `IntersectionObserver` controls when the `src` exists in the first place.

Then I replaced the direct image render:

-                          <Image
-                            src={section.mediaSrc}
-                            alt={section.mediaAlt}
-                            width="100%"
-                            height="100%"
-                            objectFit="cover"
-                            loading="lazy"
-                            decoding="async"
-                            fetchpriority="low"
-                          />
+                          <LazyGifImage src={section.mediaSrc} alt={section.mediaAlt} />

This is the kind of fix I prefer for landing-page media: make the network graph match the user’s scroll position instead of trusting browser heuristics alone.

## Testing the browser API without pretending JSDOM is a browser

Adding `IntersectionObserver` broke the test environment unless I provided a stub. JSDOM does not implement that API by default.

I added this to `HomeShowcaseSection.test.jsx`:

import { beforeAll, describe, expect, it, vi } from 'vitest';

// JSDOM does not provide IntersectionObserver; polyfill with a stub so
// LazyGifImage's useEffect hook does not throw during render.
beforeAll(() => {
  class MockIntersectionObserver {
    constructor() {
      this.observe = vi.fn();
      this.unobserve = vi.fn();
      this.disconnect = vi.fn();
    }
  }
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

This stub is intentionally boring. I am not trying to simulate browser intersection behavior in a unit test for this component. I only need the render path to avoid crashing so the existing component tests can keep validating navigation and interaction behavior.

If I needed confidence around actual lazy-loading behavior, I would push that into an integration/browser test where layout and viewport intersection are real.

## Splitting route bundles instead of importing every page up front

The next load-path issue was the route import structure in `App.jsx`.

Before the refactor, the app imported a long list of pages directly:

import AboutPage from './pages/info/AboutPage';
import AchievementTestPage from './pages/dev/AchievementTestPage';
import AdTest from './pages/dev/AdTest';
import SuccessModalPreviewPage from './pages/dev/SuccessModalPreviewPage';
import AIProblems from './pages/ai/AIProblems';
import AIProblemsCreate from './pages/ai/AIProblemsCreate';
import AIProblemsView from './pages/ai/AIProblemsView';
import BlogPage from './pages/blog/BlogPage';
import BlogPostPage from './pages/blog/BlogPostPage';
import NativeBlogPostPage from './pages/blog/NativeBlogPostPage';
import CancelEmailChangePage from './pages/auth/CancelEmailChangePage';
import ClusterMap from './pages/games/ClusterMap';
import EmailChangeVerificationPage from './
