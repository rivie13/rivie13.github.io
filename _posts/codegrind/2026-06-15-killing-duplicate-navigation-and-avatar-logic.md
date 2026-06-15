---
layout: post
title: "Killing Duplicate Navigation and Avatar Logic Before It Turned Into More Production Bugs"
date: 2026-06-15 06:00:00 +0000
categories: [CodeGrind, Frontend, Development]
tags: [CodeGrind, Frontend, JavaScript, Phaser, State Management, Bug Fixes, Component Design]
author: Riviera Sperduto
excerpt: "I removed duplicated route and avatar logic, deleted a legacy city page, and centralized path normalization before it caused more drift."
image: /assets/images/codegrind/2026-06-15-killing-duplicate-navigation-and-avatar-logic.png
keywords: CodeGrind frontend refactor, React route cleanup, avatar asset resolver, learning path normalization, legacy code removal, city map cleanup"
slug: killing-duplicate-navigation-and-avatar-logic
canonical_url: https://rivie13.github.io/blog/2026/06/15/killing-duplicate-navigation-and-avatar-logic/
---

I spent this round cleaning up the kind of frontend duplication that looks harmless until two screens drift apart, a fallback path gets missed, and production starts behaving inconsistently.

The immediate problem was simple: I had the same logic copied across multiple places for avatar asset resolution and learning path normalization, and I was still carrying a dead legacy city route tied to a massive deprecated page. That is exactly how subtle bugs survive refactors.

This pass was mostly about centralizing rules, deleting dead code, and reducing the number of places where the app could disagree with itself. The work landed inside the main frontend app, guest progress flow, and city scene rendering.

If you want the live product context, the app is at <https://codegrind.online>, and you can check out my github here: <https://github.com/rivie13>.

## The real problem: duplicated rules rot faster than features

I had two especially bad examples of duplication:

1. `normalizeLearningPathId` existed in more than one place.
2. Avatar direction fallback logic existed in more than one city component.

That sounds minor until one branch adds support for `js`, another only supports `javascript-path`, one component falls back from diagonal directions correctly, and another silently breaks image selection.

The refactor fixed both by moving shared behavior into utilities and making consumers import the same implementation.

## Centralizing learning path normalization

Before this cleanup, `App.jsx` contained its own path normalization helper:

const LEARNING_PATH_IDS = new Set(['python-path', 'javascript-path', 'java-path', 'cpp-path']);

const normalizeLearningPathId = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return null;

  if (LEARNING_PATH_IDS.has(normalized)) return normalized;
  if (normalized === 'python') return 'python-path';
  if (normalized === 'javascript' || normalized === 'js') return 'javascript-path';
  if (normalized === 'java') return 'java-path';
  if (normalized === 'cpp' || normalized === 'c++') return 'cpp-path';
  return null;
};

I also had effectively the same logic in `useGuestProgress.js`:

const LEARNING_PATH_IDS = new Set(['python-path', 'javascript-path', 'java-path', 'cpp-path']);

const normalizeLearningPathId = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return null;

  if (LEARNING_PATH_IDS.has(normalized)) return normalized;
  if (normalized === 'python') return 'python-path';
  if (normalized === 'javascript' || normalized === 'js') return 'javascript-path';
  if (normalized === 'java') return 'java-path';
  if (normalized === 'cpp' || normalized === 'c++') return 'cpp-path';

  return null;
};

That is classic copy-paste technical debt. It works right up until one call site gets patched and the other does not.

I replaced both local implementations with a shared import.

### In `App.jsx`

import { normalizeLearningPathId } from './utils/navigation/learningPathUtils';

### In `useGuestProgress.js`

import { normalizeLearningPathId } from '../../utils/navigation/learningPathUtils';

### Why this mattered

`App.jsx` uses the normalized path to derive trial behavior:

const getSelectedTrialLearningPath = (guest) =>
  normalizeLearningPathId(guest?.selectedTrialLearningPath || guest?.progress?.trialLearningPath);

`useGuestProgress.js` also depends on the same normalization rules while interpreting guest progress state. If those two places disagree, guest onboarding and in-app routing diverge. That is the kind of bug that feels random to users because one screen says “you’re on JavaScript” and another behaves like no path was selected.

By forcing both flows through one utility, I reduced that risk to one implementation surface.

## Pulling avatar fallback logic into one utility

The city UI had another repeated block: avatar asset resolution with diagonal fallback handling.

In `CityScene.jsx`, I had this:

const IDLE_DIRECTION_FALLBACKS = {
  northeast: ['east', 'north'],
  northwest: ['west', 'north'],
  southeast: ['east', 'south'],
  southwest: ['west', 'south'],
};

const resolveAvatarAsset = (avatarState, avatarDirection) => {
  const stateAssets = DISTRICT_01_AVATAR_ASSETS?.[avatarState] || {};

  if (stateAssets[avatarDirection]) {
    return stateAssets[avatarDirection];
  }

  const fallbackDirections = IDLE_DIRECTION_FALLBACKS[avatarDirection] || [];

  for (const fallbackDirection of fallbackDirections) {
    if (stateAssets[fallbackDirection]) {
      return stateAssets[fallbackDirection];
    }
  }

  return stateAssets.south || null;
};

const getAvatarCandidates = (avatarAsset) => {
  if (!avatarAsset?.assetPath) return [];

  const primarySrc = getAssetUrl(avatarAsset.assetPath);
  const fallbackSrc = avatarAsset.fallbackSrc;
  if (!fallbackSrc || fallbackSrc === primarySrc) {
    return [primarySrc];
  }

  return [primarySrc, fallbackSrc];
};

And `CityTravelTransition.jsx` contained the same logic again.

I replaced both local copies with a shared import:

import { resolveAvatarAsset, getAvatarCandidates } from '../../utils/city/avatarUtils';

That happened in both files.

### What this fixed beyond “cleaner code”

This was not just aesthetic deduplication.

The city scene and the travel transition both render the same avatar system from different UI states. If one component resolves `northeast` to `east` first and another falls back differently, the player sees visual flicker or mismatched sprites between in-scene movement and transition animation.

That kind of inconsistency is easy to miss in code review because each component still “works.” It only becomes obvious during movement sequences, asset cache misses, or mobile rendering edge cases.

By moving both of these into `avatarUtils`, I made sprite selection deterministic across both render paths.

## Deleting the legacy city route instead of pretending it still mattered

The bigger cleanup was removing the legacy city page entirely.

In `App.jsx`, I removed the import:

-import CityMap from './pages/city/CityMap';

I also removed the old route constant:

-const LEGACY_CITY_MAP_ROUTE_PATH = '/city/legacy';

And I deleted the route registration:

-<Route path={LEGACY_CITY_MAP_ROUTE_PATH} element={<CityMap />} />

Then I deleted `src/pages/city/CityMap.jsx`, which was huge and fully deprecated.

The deleted file was over two thousand lines. Even the visible section tells the story:

import { Box, Button, HStack, Text, VStack, useToast } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CityTravelTransition from '../../components/city/CityTravelTransition';
import { useAuth } from '../../contexts/AuthContext';
import { useGuestProgressCtx } from '../../contexts/GuestProgressProvider';
import PageTemplate from '../../components/layout/PageTemplate';
import CityScene from '../../components/city/CityScene';
import audioManager from '../../utils/audio/AudioManager';
import audioService from '../../utils/audio/AudioService';
import getAssetUrl from '../../utils/assets/assetUrl';
import useIsMobileDevice from '../../hooks/useIsMobileDevice';

And further down, it carried its own constants and duplicated domain rules:

const CITY_WALK_SPEED = 43.2;
const LEARNING_PATH_IDS = new Set(['python-path', 'javascript-path', 'java-path', 'cpp-path']);
const CLUSTER_SCENE_IDS = new Set(['array-fixer-office-01']);
const LEARNING_SCENE_IDS = new Set(['learning-module-guide-01']);
const AVATAR_DIRECTION_FALLBACKS = {
  northeast: ['east', 'north'],
  northwest: ['west', 'north'],
  southeast: ['east', 'south'],
  southwest: ['west', 'south'],
};

That file had become a gravity well: rendering, routing, movement, mobile controls, audio, apartment state, scene math, and navigation behavior all mixed into one place. Keeping it around behind a legacy route meant I was still shipping a dormant alternate implementation of city logic.

Dormant code is not free. It still affects bundle analysis, future refactors, route safety, and mental load.

### Why I removed the route instead of keeping a compatibility alias

Because compatibility layers are only worth it if something still depends on them.

At this point the active path was:

const CITY_ROUTE_PATH = '/city';
const LEGACY_CITY_PHASER_ROUTE_PATH = '/city/phaser-preview';

and the app already routes the real city entry through the Phaser-based page:

<Route path={CITY_ROUTE_PATH} element={<CityPhaserRoute />} />

So keeping `/city/legacy` alive just meant I had two city implementations with overlapping responsibilities. That is how regressions sneak in during “small” updates.

## This refactor also reduced import-level confusion

One detail I care about in large React codebases is import truthfulness. If a component needs city avatar resolution, it should import a city avatar utility,
