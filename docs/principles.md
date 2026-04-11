# Engineering Principles

Rules that matter for this hackathon. Keep it working, keep it demo-able.

## The constraints that cannot move

- **Expo Go only.** Windows team, no Xcode, no EAS. If a package says "requires dev build", don't use it. Use `npx expo install` not `npm install`.
- **No camera roll.** Mount `<CameraView>` directly, never `expo-image-picker`. This is the whole integrity mechanic of the product.
- **YOLO runs on the demo laptop.** It's a local Python server behind a tunnel. Don't try to move it to the cloud during the hackathon.
- **Streak reset is server-side.** pg_cron in Supabase. A client timer is not trusted.
- **No secrets in git.** `.env`, Supabase keys, tunnel tokens — none of it gets committed.

## What to prioritise

Demo loop first: notification fires → camera opens with prompt → photo taken → YOLO verifies → snap in circle feed → streak updates. Everything else is secondary. If a feature isn't part of that loop, it can wait.

**Working > pretty > correct > fast.** In that order, for a hackathon.

## What doesn't matter right now

- Perfect TypeScript types — use `any` and move on if you're stuck
- Strict RLS policies — permissive policies are fine for a 3-person demo
- Error handling edge cases — surface errors as a toast and move on
- Code organisation — messy code that runs beats clean code that doesn't
- Broad test coverage — don't chase it during the hackathon
- Plans workflow — write a plan if a feature is genuinely complex, skip it otherwise

## What still matters

- `npx tsc --noEmit` should pass before you say a feature is done
- The feature should actually run on the phone, not just compile
- Use minimal TDD only when it buys real confidence
- Critical paths, risky integrations, or contract-heavy behavior can justify a small smoke test or contract test
- Do not default to broad test suites for every feature
- `CLAUDE.md` and `AGENTS.md` mirror each other — update both when you change one
