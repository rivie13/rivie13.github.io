---
layout: post
title: "Structuring CodeGrind Learning Paths Without Turning DSA Into a Content Dump"
date: 2026-07-06 06:00:00 +0000
categories: [CodeGrind, Development]
tags: [CodeGrind, Learning Platform, Coding Practice, Gamification, UX, Software Development]
author: "Rivie"
excerpt: "How I structure CodeGrind learning paths around DSA progression, scoring pressure, AI limits, and gameplay loops instead of dumping random problems."
image: /assets/images/codegrind/2026-07-06-codegrind-learning-path-structure.png
keywords: CodeGrind learning paths, DSA practice platform, coding interview practice, gamified coding, LeetCode integration, programming education"
slug: codegrind-learning-path-structure
canonical_url: https://rivie13.github.io/blog/2026/07/06/codegrind-learning-path-structure/
---

The easiest way to ruin a DSA practice platform is to throw a giant problem list at users and call it a curriculum.

I already had the pieces in place: LeetCode-style challenges, difficulty filters, a real-time editor, Azure Judge0 execution, scoring, AI assistance, profiles, streaks, leaderboards, achievements, and Code Breach gameplay. The problem was not feature coverage. The problem was progression. If a beginner lands in a three-panel coding workspace and sees only `Easy`, `Medium`, and `Hard`, that is technically correct and still not enough.

So I started treating learning paths as a systems design problem: the path has to control cognitive load, execution feedback, AI usage, scoring pressure, and gameplay unlocks without hiding the fact that users are still doing real interview-style coding.

This is the structure I use for [CodeGrind](https://codegrind.online).

## The Runtime Problem: DSA Progression Is Not Just Sorting Problems by Difficulty

The repository context already defines the core product surface:

CodeGrind is an interactive platform that gamifies Data Structures and Algorithms (DSA) practice.
It combines LeetCode-style programming challenges with competitive elements and AI assistance.

That sounds simple until the platform has to decide what a user should do next.

The current feature set includes:

- LeetCode problem integration
- Real-time code editor with syntax highlighting
- Azure OpenAI AI assistant for problem-solving guidance with multiple model support
- Difficulty-based problem filtering
- Responsive three-panel layout (Problem Description, Code Editor, AI Chat)
- Azure Judge0 code execution for real-time testing
- Enhanced Scoring System

Those features pull in different directions.

A problem filter says: “Pick anything.”

A scoring system says: “Optimize your solve.”

An AI assistant says: “Ask for help.”

A game mode says: “Convert programming concepts into defensive actions.”

A learning path has to reconcile all of that. If it does not, the user either wanders randomly or abuses hints until the solve becomes passive.

## The Baseline Product Shape

The core workspace is described as a three-panel layout:

- Responsive three-panel layout (Problem Description, Code Editor, AI Chat)

That layout gives me a useful constraint. A learning path step should always map cleanly into those three panes:

1. **Problem Description**: what concept is being trained.
2. **Code Editor**: where the implementation happens.
3. **AI Chat**: where guidance is allowed but should not replace the solve.

That means a learning path item is not just a row in a database. It needs enough metadata to drive behavior across all three surfaces.

At minimum, I think about each step like this:

type LearningPathStep = {
  id: string;
  pathId: string;
  order: number;

  concept:
    | "arrays"
    | "strings"
    | "hash-maps"
    | "two-pointers"
    | "sliding-window"
    | "stacks"
    | "queues"
    | "trees"
    | "graphs"
    | "dynamic-programming";

  difficulty: "easy" | "medium" | "hard";

  problemSource: "leetcode";
  problemId: string;

  objectives: string[];
  unlockCriteria: {
    minScore?: number;
    requireAcceptedSubmission?: boolean;
    maxAiAssistanceLevel?: "none" | "hint" | "guided";
  };
};

The important part is that `difficulty` is not the curriculum. It is one field inside the curriculum.

## Why I Avoid a Flat Problem Queue

A flat queue is easy to build:

const nextProblem = problems
  .filter(problem => problem.difficulty === selectedDifficulty)
  .at(0);

That is also where progression quality dies.

A better path selector needs to consider topic ordering, previous attempts, acceptance, score, and assistance usage. The platform already tracks the things needed for that model:

- Detailed submission history
- Success rate tracking
- Coding streak tracking
- Best time records
- High score tracking

That gives me a progression engine shape closer to this:

function getNextPathStep(
  path: LearningPathStep[],
  progress: UserProgress
): LearningPathStep | null {
  return path.find(step => {
    const attempt = progress.steps[step.id];

    if (!attempt) {
      return prerequisitesMet(step, progress);
    }

    if (!attempt.accepted && prerequisitesMet(step, progress)) {
      return true;
    }

    if (
      step.unlockCriteria.minScore &&
      attempt.bestScore < step.unlockCriteria.minScore
    ) {
      return true;
    }

    return false;
  }) ?? null;
}

This is intentionally boring code. It is also the kind of boring code that keeps the product honest.

The path does not ask, “What random medium problem should I show?” It asks, “Which concept is currently blocking this user, and what evidence do I have?”

## Scoring Has to Feed the Path, Not Just the Leaderboard

The scoring system already has clear inputs:

- Max score of 1000 per problem
- Score deductions based on:
  - Time taken to solve
  - Memory usage
  - Number of submissions
  - Runtime performance
  - AI assistance usage

That is not just leaderboard data. It is curriculum data.

A user who passes a hash map problem after 11 submissions and heavy AI guidance should not be routed the same way as a user who solves it cleanly in one pass. Both got accepted. They did not demonstrate the same level of control.

A simplified scoring input model looks like this:

type ScoreInputs = {
  accepted: boolean;
  elapsedSeconds: number;
  memoryMb: number;
  submissionCount: number;
  runtimeMs: number;
  aiAssistanceEvents: number;
};

Then the learning path can branch on mastery bands:

function getMasteryBand(score: number): "retry" | "reinforce" | "advance" {
  if (score < 500) return "retry";
  if (score < 800) return "reinforce";
  return "advance";
}

This matters because an accepted solution is not always a good learning signal. In interview prep, the difference between “eventually got it” and “can explain it under pressure” is the difference between passing and failing.

## AI Assistance Needs Boundaries Inside a Path

The README context calls out the AI assistant directly:

- Azure OpenAI AI assistant for problem-solving guidance with multiple model support
- Model switching during conversations
- Resizable chat input for better readability
- Persistent chat interface with fixed controls

I do not want AI to become a copy-paste answer machine. I want it to be available when the user is stuck, but I also want the path system to know how much help was used.

That turns AI assistance into a first-class progression input:

type AiAssistanceEvent = {
  stepId: string;
  type: "concept_hint" | "edge_case_hint" | "complexity_review" | "debug_prompt";
  timestamp: string;
};

Then path rules can be strict where they need to be:

function aiUsageAllowed(
  step: LearningPathStep,
  events: AiAssistanceEvent[]
): boolean {
  const maxLevel = step.unlockCriteria.maxAiAssistanceLevel;

  if (maxLevel === "none") {
    return events.length === 0;
  }

  if (maxLevel === "hint") {
    return events.every(event =>
      ["concept_hint", "edge_case_hint"].includes(event.type)
    );
  }

  return true;
}

That gives me room to design different learning states:

- Early path steps can allow guided help.
- Reinforcement steps can allow only hints.
- Checkpoint steps can require no AI usage.
- Challenge mode can restrict AI assistance completely.

That maps to the existing challenge mode direction:

- Challenge Mode Features
  - Timer challenges
  - AI assistance restrictions
  - Time Attack mode

The key is not banning AI. The key is making AI usage visible to the learning system.

## Judge0 Execution Is the Feedback Loop

The platform uses Azure Judge0 for execution:

- Azure Judge0 code execution for real-time testing

That is one of the most important pieces for path design because immediate execution feedback lets the curriculum adapt without waiting for manual review.

A learning step should care about more than accepted/rejected:

type ExecutionResult = {
  status: "accepted" | "wrong_answer" | "time_limit" | "runtime_error";
  runtimeMs?: number;
  memoryMb?: number;
  failedTestCase?: {
    input: string;
    expected: string;
    actual: string;
  };
};

That result can drive the next UI action:

function getFeedbackMode(result: ExecutionResult): "debug" | "optimize" | "advance" {
  if (result.status === "accepted") {
    return "advance";
  }

  if (result.status === "time_limit") {
    return "optimize";
  }

  return "debug";
}

A time limit failure in a sliding window problem is not the same as a syntax error. The path should respond differently:

- Syntax/runtime error: keep the user in implementation mode.
- Wrong answer: push test-case reasoning.
- Time limit: push complexity analysis.
- Accepted with poor score: add reinforcement.
- Accepted with strong score: unlock the next concept.

## Mapping Gameplay Back to Concepts

The Code
