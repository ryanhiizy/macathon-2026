# Product Requirements Document — presence

> **Hackathon MVP** — A working preview that demonstrates the core loop. Scope is cut to what can be demoable. See [Architecture.md](./Architecture.md) for the tech stack.

## 1. Overview

**presence** is a social habit-tracking app combining the accountability of BeReal's photo verification with the community-driven motivation of Strava. Users build daily habits, prove completion by taking photos prompted by AI-generated challenges, and share progress through a social feed.

Core differentiators:
- **Photo proof** — no checkbox taps; every habit requires a photo
- **AI prompts** — fun, contextual challenges make each verification unique (solo and group)
- **Circles** — habit-specific groups where every member commits to the same habit
- **Group Prove** — complete and verify a habit together in a shared camera session
- **Social consequence** — miss your window and your Circle gets notified; streak resets to zero

## 2. Problem

Existing habit trackers fail for one of two reasons: self-reported (a tap is meaningless) or gamified in isolation (no one else notices). presence combines credible photo-based proof with a social accountability layer where your community actually notices when you slip.

## 3. Target User

Ages 18–30, has tried and abandoned habit apps before, already has a social group they'd credibly compete with or support. Responds to "my Circle will see if I miss."

## 4. Core Concepts

### 4.1 Habits

A recurring daily activity. Each habit has a name, time window, category, and a streak counter. Completion requires a photo — not a tap.

**Verifiable categories** (photo + AI prompt, YOLO-checked): gym, running, cooking, meal prep — activities where a recognisable object can appear in a photo.

**Trust-based categories** (photo check-in, no object detection): reading, meditation, journalling, water — internally-directed habits. Shown at creation with: *"We trust you on this one — your photo is just a ritual check-in."*

### 4.2 Photo Verification

Every habit completion requires a proof photo. The app generates a fun AI prompt tailored to the habit (e.g. *"Throw a peace sign mid-stride on your run!"* for running). The photo and prompt are posted to the social feed. The deadline for submitting aligns with the habit's end time.

### 4.3 Circles

Community groups built around a single habit. All members have committed to the same daily habit. Circles have a shared feed, a leaderboard, and an About section. Members see each other's proof photos, compete on streaks, and motivate each other.

### 4.4 Group Prove

Invite friends to complete a habit together for one session (not permanently). The user picks an incomplete habit, selects friends, and enters a shared camera experience. The AI prompt is adapted for the group context (e.g. *"Everyone jump in the air at the same time!"* instead of a solo prompt). The result is a group post on the feed attributed to all participants — streaks increment for each.

### 4.5 Streaks

Count of consecutive days a user has verified a habit. Displayed on habit cards, feed posts, and Circle leaderboards. Milestone streaks (50 days, 100 days) trigger celebration cards on the feed. No grace period, no streak freeze in V1.

## 5. Pages & Features

### 5.1 Home Page (Feed)

First screen after opening. Two tabs via segmented control:

- **Friends** (default) — posts from people the user follows, reverse-chronological. Includes solo posts, group posts, and milestone celebration cards.
- **Circles** — latest posts from all Circles the user belongs to, shown as Circle cards with thumbnail rows.

**Solo post card:** avatar, name, habit name, time ago, streak badge, proof photo, AI prompt, caption, like/reply actions.

**Group post card:** stacked avatar row, "Group" badge, all participant names, participant count overlay on photo, group AI prompt, individual streak chips per participant, like/comment actions.

**Milestone celebration card:** displayed when a user hits 50 or 100 days. Shows name, habit, streak count, "Celebrate" action.

### 5.2 Habits Page

Personal dashboard for managing daily habits. Top-right: create new habit button.

**Daily progress summary:** circular progress ring showing habits completed/total. Text label (e.g. *"3 habits left · Keep going!"*).

**Habit cards:** icon, name, streak count, scheduled time. Completed habits show a check mark and are muted. Incomplete habits show two buttons: invite (👥) for Group Prove, and "Prove" for solo camera.

**Solo camera view:** habit name in header, AI-generated solo prompt card above the viewfinder, deadline, camera controls (flip, shutter, flash).

**Group Prove flow:**
1. Tap invite → bottom sheet with friend search + scrollable list
2. Select friends → avatar stack preview (e.g. "You + 2 friends")
3. Tap "Start Group Prove · N people" → Group Camera View
4. Group camera: "Group" badge, avatar stack, group-tailored AI prompt, ready-status panel (host auto-ready), participant count overlay, same camera controls
5. Submit → group post on feed, streaks increment for all participants

### 5.3 Circles Page

Lists all Circles the user is in. Header: search (top-left) to discover/join new Circles, create (top-right) to start a new one.

**Circle list card:** icon, name, member count, user's current streak, thumbnail row of recent proof photos.

**Circle detail (3 tabs):**
- **Feed** — chronological proof posts from members (solo + group), filtered to this Circle's habit. Realtime updates.
- **Leaderboard** — ranked by streak. Sub-filters: "All Time" and "Monthly". Shows rank, avatar, name, streak. User's own entry highlighted.
- **About** — Circle description, rules, members list with avatars and streaks. "+ N more" for large Circles.

### 5.4 Profile Page

Instagram-style layout. Header: settings icon.
- User avatar, display name, handle, join date
- Stats bar: total habits, best streak, friends count, Circles count
- Bio (short text, user-set)
- Posts grid: 3-column grid of all proof photos, habit name overlaid. Tap to expand.

## 6. Navigation

Persistent bottom tab bar with 4 tabs: **Home**, **Habits**, **Circles**, **Profile**. Hidden in full-screen camera views (replaced by camera controls + back button).

## 7. AI Prompt System

Key differentiator. Transforms photo verification from a chore into a creative challenge.

- **Solo prompts** — tailored to the specific habit, designed for one person
- **Group prompts** — contextually adapted for multiple people (different from the solo prompt for the same habit)
- Prompts display prominently on the camera screen before the user takes the photo
- The prompt used appears on the feed post for context
- Prompts vary to keep experience fresh

**V1 implementation:** prompts generated by calling Claude/LLM API from the FastAPI server (`/generate-prompt` endpoint). Static JSON bank (`app/constants/prompts.json`) used as fallback if the API is slow or unreachable.

## 8. Notification Window

At ±15 minutes of the habit's target time, a local notification fires with a prompt teaser. User has **30 minutes** to submit their snap. After 30 minutes: habit instance marked missed, circle notified, streak resets to zero.

## 9. Verification

- **Verifiable habits:** submitted snap goes through YOLO object detection on the demo laptop. All required classes detected above confidence threshold = verified. Failure = one retry within the remaining window. Second failure = missed.
- **Trust-based habits:** marked verified immediately on photo submission.
- Verification result within ~3 seconds. If slower, optimistically show "pending".

## 10. Streak Mechanics

- +1 per verified snap before window closes
- Reset to 0 on any missed instance (no grace period in V1)
- Server-side pg_cron runs every minute to expire windows and reset streaks — client timers are never trusted
- Miss announced to Circle immediately via Realtime
