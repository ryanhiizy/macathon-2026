# Product Requirements Document

> **Hackathon MVP** — This is being built for a hackathon. The goal is a working preview that demonstrates the core loop, not a production-ready product. Scope is intentionally cut to what can be shown. See [Architecture.md](./Architecture.md) for the tech stack.

## 1. Overview

An iOS app that sends you a photo prompt when it's time to do your habit, and you have a short window to prove you did it with your camera. When the window fires, the app hands you a **randomly generated, often absurd prompt** — e.g. *"Going for a run? Take a picture holding a banana like it's a phone"* — and a YOLO object-detection model checks that the expected objects (running shoes, banana, etc.) actually show up in the photo. Verified snaps land in a habit-specific circle of friends who can all see your streak in real time. The social consequence of missing is the product — your circle gets notified, your streak resets to zero, and everyone knows.

## 2. Problem

Existing habit trackers fail for one of two reasons. Either they are entirely self-reported (a tap to "mark complete" is meaningless friction) or they are gamified in isolation (losing a Duolingo streak only matters to you). There is no mainstream product that combines credible photo-based proof of completion with a social accountability layer where your community actually notices when you slip.

## 3. Target User

The primary user is someone aged 18–30 who has tried and abandoned habit apps before, understands why accountability works, and already has a social group they'd credibly compete with or support. Think gym-going students and young professionals who would respond to the phrase "my circle will see if I miss."

## 4. Product Requirements

> Sections 4.1–4.4 cover core functionality. Sections 4.5–4.6 cover the social layer and streak mechanics.

### 4.1 Habit Creation

A user creates a habit by specifying its name, a target time, a frequency (daily, weekdays, custom days), and a category. The category determines the verification mode.

**Verifiable categories** include gym and fitness, cooking and meals, running and outdoor exercise, and other activities where a recognisable physical object or environment can be detected in a photo. When a user selects a verifiable category, they optionally add a keyword descriptor (e.g. "dumbbell", "meal prep") that seeds the AI verification model.

**Trust-based categories** include reading, meditation, journalling, drinking water, and other internally-directed habits where no visual proof is realistic. The app flags these clearly at creation time with copy such as: *"We trust you on this one — your photo is just a ritual check-in."*

A user can belong to an existing circle for a habit or create a new one and invite others via a shareable link.

### 4.2 Notification, Prompt Generation, and Capture Window

At a randomly selected time within ±15 minutes of the habit's target time, the app fires a local scheduled notification. At fire time, the app **generates a random prompt** for the habit (see 4.3) and includes a teaser in the notification (e.g. *"Your gym check-in — today's pose is spicy 👀"*). The user has **30 minutes** from notification delivery to submit their snap. After 30 minutes, the habit instance is marked as missed.

The notification opens the in-app camera directly, and the full prompt text is displayed above the camera view. The photo is timestamped at capture and **cannot** be replaced with a photo from the camera roll. This is a hard technical constraint enforced at the capture layer (we mount `expo-camera` directly and never expose the image picker).

### 4.3 Random Funny Prompts

Each habit instance gets its own randomly generated prompt drawn from a category-specific prompt bank. Prompts are intentionally silly so that the feed is entertaining and so that the required objects are unpredictable (which makes cheating with a single pre-taken photo much harder).

Each prompt specifies:
- **Prompt text** — the instruction the user sees (e.g. *"Take a selfie mid-squat holding a water bottle above your head"*)
- **Required objects** — the list of YOLO classes that must be detected for the snap to verify (e.g. `["person", "bottle"]`)
- **Optional objects** — bonus classes that, if detected, earn a badge or reaction on the feed

Examples by category:

| Category | Prompt | Required YOLO classes |
|---|---|---|
| Running | *"Photo with your running shoes on and a banana like it's a phone"* | `person, banana` |
| Gym | *"Flex with a dumbbell in one hand and point at the camera with the other"* | `person, dumbbell` |
| Cooking | *"Show us your plate with a fork standing straight up in it"* | `bowl, fork` OR `plate, fork` |
| Meal prep | *"Hold up your meal prep container next to your face"* | `person, bowl` |

Prompts are generated client-side from a static JSON bank in V1 (no LLM call needed), with room to swap in an LLM-generated prompt later.

### 4.4 AI Photo Verification (YOLO)

Verifiable habits run the submitted snap through a **YOLO object-detection model** hosted server-side. The backend checks the detected object classes against the prompt's `required_objects` list.

- **All required classes detected above their confidence thresholds:** automatically verified
- **One or more required classes missing:** flagged — user sees *"Hmm, we couldn't spot the [missing object]. Try again."* and gets one retry within the remaining capture window
- **Retry also fails:** habit is marked as missed and is visible to the circle

Trust-based habit snaps bypass YOLO entirely and are marked complete immediately on submission.

The app should surface the verification result within **~3 seconds** of submission. If inference exceeds this latency, the app optimistically marks the habit as pending and updates when the result returns.

> **Hard requirement:** YOLO verification must ship for verifiable habits at launch. Removing it collapses the integrity of the proof mechanic.

### 4.5 Social Layer and Circles

A **circle** is a group of users sharing one habit. Each circle has:
- A name (set by the creator)
- A shared feed of snaps
- A leaderboard showing all member streaks

When a user submits a verified snap, it appears in the circle feed with a timestamp, the user's display name, and a verification badge (for verifiable habits). Circle members can react to snaps with a small set of preset emoji reactions.

When a user misses a habit instance, all circle members receive a push notification: *"[Name] missed their [habit name] streak at [day count]."* The missed instance also appears in the feed as an empty card with a streak-broken indicator. The user's streak counter resets to zero.

A user can be in multiple circles (no limit enforced at launch, though rate-limiting will likely be needed at scale). Circles can be **public** (discoverable via category browse) or **private** (invite-only via link). Private circles are the default at launch.

### 4.6 Streak Mechanics

A streak increments by one for each consecutive day a user submits a verified snap before the capture window closes. Streaks are displayed as a count on each user's profile within a circle and on the circle leaderboard.

When a streak breaks, it resets to zero with **no grace period** in V1. The miss is announced to the circle immediately.

> There is deliberately no "streak freeze" mechanic at launch, as this would undermine the accountability model. This can be revisited in V2 based on retention data.
