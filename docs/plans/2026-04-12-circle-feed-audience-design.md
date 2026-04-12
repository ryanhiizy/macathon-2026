# Circle Feed Audience Design

**Date:** 2026-04-12

## Goal

Make "Circles" mean "posts connected to circle activity", not "group posts only". A circle can contain solo posts from individual members and group posts from multiple members. The friends feed should also be allowed to show group posts.

## Approved Behavior

- The home `Friends` tab can show both solo and group habit posts.
- The home `Circles` tab can also show both solo and group habit posts.
- `is_group_post` stays meaningful, but only as a presentation hint. It must not decide whether a post is eligible to appear in a feed.
- Circle detail already works conceptually: it should show every snap for that circle, regardless of whether the snap is solo or group.

## Hackathon Scope

- Keep the current two-tab home feed.
- Do not redesign the cards.
- Do not add new database tables or relationships.
- Prefer a small classification helper over a broader feed refactor.

## Implementation Direction

- Replace the current home-tab split that uses `post.kind === "group"`.
- Introduce an audience-based helper that decides whether a feed item belongs in `friends`, `circles`, or both.
- For this MVP:
  - photo posts (`solo` and `group`) appear in both tabs
  - dispatch/milestone cards stay in `Friends`
- Stop filtering real Supabase snaps by `is_group_post` so group snaps are not dropped before they reach the UI.

## Risks

- Real group snaps currently do not have dedicated participant metadata in the home feed path, so they may still render using the solo card treatment. That is acceptable for the hackathon as long as the content appears in the correct feeds.
- The two home tabs will overlap more than before. That is intentional and matches the approved product behavior.
