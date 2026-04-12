# Circle Variation Design

**Date:** 2026-04-12

## Goal

Make each circle feel distinct for the demo, even when the underlying Supabase rows are sparse or similar. The user should feel like each circle has its own rhythm, member culture, and post history instead of reusing the same generic structure.

## Approved Direction

- Keep real circle identity from Supabase:
  - circle name
  - base habit
  - real uploaded snaps when they exist
  - actual member list when available
- Add deterministic fake variability in the frontend:
  - different analytics shapes and completion patterns per circle
  - richer descriptions / vibe copy
  - varied fallback posts per circle
  - varied member handles, streak spread, and “about” tone when DB content is thin
- Do not add backend or schema changes.
- Do not make data random on each refresh. Variation should be seeded by `circle_id` so the demo stays stable.

## Scope

This change should affect both:

- the circles list cards
- the circle detail screen (`Feed`, `Leaderboard`, `About`)

## Recommended Architecture

- Add a small seeded mock-enrichment layer in `frontend/lib/circles.ts` or a sibling helper.
- Use `circle_id` as the seed input.
- Merge real data with demo fallback data:
  - if real data exists, keep it and enrich around it
  - if real data is missing or repetitive, fill the gaps with seeded fallback content

## Expected Visual Result

Different circles should show visibly different:

- today rate / best streak / average streak
- sparkline curve shape
- number and timing of posts
- caption style and prompt wording
- member ranking spread
- about text and social “vibe”

Examples:

- `5K Every Day` should feel active, performance-oriented, and streak-heavy.
- `Cold Plunge Club` should feel small, intense, and a bit chaotic.
- `Gym Rats` should feel louder and more competitive.
- `Page Turners` should feel quieter, slower, and more reflective.

## Constraints

- Hackathon-first: believable > complete.
- Stable seeded outputs > runtime randomness.
- Minimal UI changes. Most of the work should live in the data shaping layer.

## Risks

- If fake data fully replaces real data, the demo loses credibility after taking a live snap.
  Mitigation: always preserve real snaps and real circle identity.
- If every circle gets too much fake content, the demo can feel overproduced.
  Mitigation: use light enrichment, not total replacement.
