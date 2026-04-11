# Feature: AI Coach

Personalized habit coaching powered by AI. Analyzes a user's habit history to detect patterns and deliver tailored feedback that helps them stay consistent.

## Concept

After a user has enough data (e.g. 5+ completions of a habit), the AI Coach starts surfacing insights. It pulls from:

- **Completion patterns** — time of day, day of week, streaks, misses
- **Streak history** — longest streak, recent resets, recovery speed
- **Group vs solo prove rates** — does the user do better with friends?
- **Prompt compliance** — how quickly they respond to notifications
- **Cross-habit correlations** — e.g. "you're 3x more likely to cook when you also hit the gym"

## UX: Insight Card (MVP)

The AI Coach lives as a card on the **Habit detail page** (`/habit/[id]`), positioned between the stats row and the weekly history. Each habit gets its own contextual insight.

### Card States

| State | Display |
|---|---|
| Not enough data | Hidden (no card rendered) |
| Insight ready | Coach card with avatar icon, insight text, habit tag |
| Dismissed | Hidden until next insight |

### Card Content

Each card contains:
- Small coach icon/avatar (e.g. a flame or brain icon)
- **Insight headline** — one sentence, actionable (e.g. "You crush gym sessions before 8am")
- **Detail line** — supporting stat (e.g. "90% completion rate vs 40% after noon")
- **Habit tag** — which habit this applies to
- Dismiss button (X)

### Insight Types

| Type | Example |
|---|---|
| Optimal timing | "Your best meditation window is 7-8am — you've never missed it then" |
| Streak momentum | "You're on a 12-day gym streak, your longest yet. Don't break the chain" |
| Risk alert | "You usually skip cooking on Fridays. Pre-plan tonight?" |
| Social boost | "You complete 2x more habits when you Group Prove. Invite someone today" |
| Cross-habit | "On days you run, you're 3x more likely to also meal prep" |
| Recovery | "Last time you broke a streak you bounced back in 2 days. You've got this" |

### Refresh Cadence

- One new insight generated per day (or when the user opens the app and the last insight is >24h old)
- Insights are cached in Supabase so the AI isn't called on every app open

## Implementation Approach

### Data Pipeline

1. Query the user's `habit_instances` and `snaps` for the target habit (last 30 days)
2. Compute basic stats: completion rate, time-of-day distribution, streak lengths, group vs solo ratio
3. Pass the stats summary (not raw data) to the AI provider with a system prompt that asks for one concise, encouraging insight
4. Cache the result in a `coach_insights` table or similar

### AI Prompt Structure

```
You are a habit coach. Given these stats for a user's "{habit_name}" habit, generate ONE short, specific, encouraging insight.

Stats:
- Completion rate (last 30d): {rate}%
- Current streak: {streak} days
- Longest streak: {longest} days
- Best time of day: {time_window}
- Worst day of week: {day}
- Group prove rate: {group_rate}%
- Solo prove rate: {solo_rate}%

Rules:
- One sentence headline + one sentence detail with a specific number
- Be encouraging, not preachy
- Reference the specific habit by name
- If there's a clear actionable pattern, highlight it
```

### Where It Runs

- **MVP:** Call the AI from the FastAPI server via a new `/coach-insight` endpoint. The frontend fetches this when loading the Habits tab.
- **Later:** Could run server-side on a schedule via Supabase Edge Function or pg_cron.

## Screen

- Lives on `app/habit/[id].tsx` — rendered as a component between stats row and weekly history
- Each habit gets its own insight, dismissed independently via AsyncStorage

## Data

- Reads from `habit_instances`, `snaps`, `snap_participants`
- Writes to a new `coach_insights` table (or just caches in-memory/AsyncStorage for MVP)

## Card Visual Spec

```
┌─────────────────────────────────────────┐
│  🧠  AI Coach                      ✕   │
│                                         │
│  You crush gym sessions before 8am      │  ← headline (bold, 16px)
│  90% completion rate vs 40% after noon  │  ← detail (muted, 14px)
│                                         │
│  ┌──────────┐                           │
│  │ Morning gym │                        │  ← habit tag pill
│  └──────────┘                           │
└─────────────────────────────────────────┘
```

- Background: theme accent color at 8% opacity
- Icon: brain or sparkle icon (HugeIcons)
- Dismiss: X button, persisted per day via AsyncStorage
- Loading: skeleton shimmer
- No data / error: card not rendered (return null)
- Animation: fade-in on mount

## Hackathon Scope

For the demo:
- Hardcode 2-3 compelling insights if there isn't enough real data
- Show the card with a real AI-generated insight if the user has enough history
- One insight per day, one habit at a time
- No chat UI, no history of past insights

### Demo Fallback Insights

If Supabase has no data or the API is down, rotate through these:
1. "You're building momentum" / "3 days in — most people quit by day 2. You didn't."
2. "Morning person detected" / "Your 7am completions are 2x your afternoon ones."
3. "Stronger together" / "You complete 80% more habits when you Group Prove."
