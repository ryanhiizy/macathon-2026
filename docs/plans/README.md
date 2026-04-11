# Plans

Execution plans for non-trivial work. Plans are first-class artifacts — the record of what we decided to build and why.

## Layout

- [`in-progress/`](in-progress/) — plans currently being executed
- [`completed/`](completed/) — plans that have shipped

## When to write a plan

Write a plan before writing code if the task:

- Spans multiple files
- Introduces a new feature
- Changes data model or architecture
- Touches more than one domain

Small bug fixes, one-line edits, and pure refactors do not need a plan.

## Naming

`YYYY-MM-DD-<slug>.md` — e.g. `2026-04-11-camera-capture.md`.

## Shape

A plan should include:

1. **Goal** — what are we building, one paragraph
2. **Why** — what problem this solves, why now
3. **Approach** — the high-level solution, tradeoffs considered
4. **Files to change** — concrete list
5. **Risks** — what could go wrong
6. **Out of scope** — what we're deliberately not doing

## Lifecycle

1. Create in [`in-progress/`](in-progress/)
2. Execute and update the plan as decisions change
3. On merge, move to [`completed/`](completed/)
4. Update the relevant doc in [`../features/`](../features/) or [`../architecture/`](../architecture/) to reflect the new reality
