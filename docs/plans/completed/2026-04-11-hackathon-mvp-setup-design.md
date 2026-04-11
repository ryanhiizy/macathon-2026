# Hackathon MVP Setup And Task Board Design

## Goal

Make the repository easy for a teammate to pick up and run for the hackathon MVP by adding the missing dependency manifests, a single clear setup path, environment templates, and a task board that reflects the real backend-first implementation order.

## Why

The current repo has product and architecture docs, but the runnable setup is incomplete. Frontend dependencies are only partially declared, backend dependencies are undocumented in code, there is no environment template, and the existing frontend README is still the default Expo starter text. That makes onboarding slow and introduces avoidable setup failures right when the team should be building the demo loop.

## Chosen Approach

Use the approved "Docs + runnable bootstrap" approach:

1. Add explicit dependency manifests for frontend and backend.
2. Add an `.env.example` that documents the minimum environment variables for the app and local AI server integration.
3. Replace the stock frontend README with a project-specific setup guide that includes exact commands, expected prerequisites, and a short verification path.
4. Add a dedicated hackathon MVP task board in docs that groups work by dependency order, makes blockers obvious, and separates demo-critical work from stretch items.

This keeps the workflow practical for a hackathon: low ceremony, clear commands, and minimal ambiguity.

## Alternatives Considered

### 1. Docs only

Pros:
- Fastest to write
- Lowest editing surface

Cons:
- Leaves dependency setup implicit
- Easier for teammates to miss package or Python requirements
- Does not reduce failure points enough

### 2. Heavy automation

Pros:
- Fewer manual steps
- More repeatable

Cons:
- Adds shell-script maintenance overhead
- Too opinionated for a mixed hackathon environment
- More moving parts than the repo currently needs

## Deliverables

- Updated `frontend/package.json` with missing runtime dependencies
- New backend Python dependency manifest
- New `.env.example`
- Rewritten `frontend/README.md` with project-specific setup and verification
- New root `README.md` for repository navigation
- New hackathon MVP task board in `docs/`

## Documentation Strategy

The docs should be layered:

- Root README: where things live, fastest path to get started
- Frontend README: exact app and AI-server setup commands
- Task board doc: implementation order, status tracking, blockers, and stretch items

This avoids one oversized setup document while still giving a single obvious path for new contributors.

## Task Board Shape

The task board should track:

- Foundation setup
- Backend core loop
- Frontend core loop integration
- Social/demo surface
- Polish and demo readiness
- Stretch items explicitly marked as deferrable

Each task should include owner guidance, dependencies, and a concrete done state.

## Risks

- Doc drift with architecture docs if dependency names or setup commands diverge
- Scope creep if the task board includes too much beyond the MVP loop
- False confidence if docs claim setup is complete without showing the remaining external steps, especially Supabase project creation and environment values

## Mitigations

- Keep docs aligned with `docs/project_overview.md`, `docs/principles.md`, and `docs/setup-checklist.md`
- Keep the task board strict about MVP versus stretch
- Document external prerequisites plainly instead of hiding them behind vague setup language

## Out Of Scope

- Implementing the actual app features
- Creating Supabase projects or provisioning remote services automatically
- Full CI/CD or deployment automation
- Production-hardening RLS, monitoring, or release workflows
