# Hackathon MVP Setup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the missing dependency manifests, onboarding docs, environment template, and MVP task board so teammates can set up and execute the hackathon build path with minimal ambiguity.

**Architecture:** Keep setup simple and explicit. The repository root should explain the project structure, the frontend README should contain the runnable setup path, the backend should declare Python dependencies in one place, and the task board should mirror the real dependency order of the MVP loop. Documentation should prefer exact commands and narrow scope over abstraction.

**Tech Stack:** Expo SDK 54, React Native, Supabase, FastAPI, Ultralytics YOLO, Anthropic/OpenAI-compatible prompt generation, Markdown documentation.

---

### Task 1: Declare missing runtime dependencies

**Files:**
- Modify: `frontend/package.json`
- Create: `backend/requirements.txt`

**Step 1: Inspect the current dependency gap**

Run:

```bash
sed -n '1,260p' frontend/package.json
find backend -maxdepth 2 -type f | sort
```

Expected: frontend dependencies are incomplete for Supabase/camera/notifications/audio, and backend has no Python manifest.

**Step 2: Update the frontend manifest**

Add the runtime packages needed by the documented MVP setup:

```json
"@supabase/supabase-js": "...",
"expo-audio": "...",
"expo-camera": "...",
"expo-notifications": "..."
```

Do not add non-MVP packages.

**Step 3: Add the backend manifest**

Create `backend/requirements.txt` with:

```txt
fastapi
uvicorn[standard]
python-multipart
ultralytics
anthropic
openai
python-dotenv
```

Keep both AI SDKs available so the local server can swap providers without a manifest change.

**Step 4: Verify manifests look correct**

Run:

```bash
sed -n '1,260p' frontend/package.json
sed -n '1,220p' backend/requirements.txt
```

Expected: both manifests exist and reflect only MVP-critical dependencies.

### Task 2: Add environment scaffolding

**Files:**
- Create: `.env.example`

**Step 1: Define the minimum environment contract**

Document the variables required by the frontend app and local AI server:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_PROMPT_API_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

Only include variables that are actually referenced by the docs or setup flow.

**Step 2: Add usage comments**

Include concise comments that tell teammates which values are mandatory for the app versus optional provider choices for the AI server.

**Step 3: Verify the template**

Run:

```bash
sed -n '1,220p' .env.example
```

Expected: a teammate can copy the file and understand the minimum required values without extra explanation.

### Task 3: Replace starter docs with project-specific onboarding

**Files:**
- Create: `README.md`
- Modify: `frontend/README.md`
- Modify: `docs/setup-checklist.md`

**Step 1: Add a root README**

Create a short repository guide that explains:
- what the app is
- where frontend/backend/docs live
- the fastest path for a new teammate
- where to find the task board

**Step 2: Rewrite the frontend README**

Replace the Expo starter content with project-specific setup instructions:
- prerequisites
- frontend install command
- backend virtualenv and pip install commands
- `.env` creation from `.env.example`
- Supabase setup references
- AI server boot commands
- Expo boot commands for LAN and tunnel mode
- a short "ready to build" verification checklist

**Step 3: Tighten the setup checklist**

Update `docs/setup-checklist.md` so it points to the new authoritative setup flow and stays aligned with the actual manifests and environment variables.

**Step 4: Verify docs are coherent**

Run:

```bash
sed -n '1,240p' README.md
sed -n '1,320p' frontend/README.md
sed -n '1,260p' docs/setup-checklist.md
```

Expected: no stock Expo boilerplate remains, and setup guidance is consistent across docs.

### Task 4: Add the hackathon MVP task board

**Files:**
- Create: `docs/hackathon-mvp-task-board.md`

**Step 1: Model the board around dependency order**

Create sections for:
- Foundation and setup
- Backend core loop
- Frontend core loop
- Social/demo surface
- Demo polish
- Stretch items

**Step 2: Make each task actionable**

For each task, include:
- objective
- dependencies/blockers
- owner guidance
- concrete done state

**Step 3: Keep MVP boundaries explicit**

Mark non-critical work as stretch so the team does not confuse nice-to-have features with the demo path.

**Step 4: Verify board usefulness**

Run:

```bash
sed -n '1,320p' docs/hackathon-mvp-task-board.md
```

Expected: a teammate can pick a task and know whether it is blocked, who should handle it, and how to tell when it is done.

### Task 5: Sanity-check the final setup surface

**Files:**
- Modify: `README.md`
- Modify: `frontend/README.md`
- Modify: `docs/setup-checklist.md`
- Modify: `docs/hackathon-mvp-task-board.md`
- Modify: `.env.example`
- Modify: `frontend/package.json`
- Modify: `backend/requirements.txt`

**Step 1: Re-scan the declared setup**

Run:

```bash
rg -n "supabase|YOLO_API_URL|expo-camera|expo-notifications|requirements.txt|task board" README.md frontend/README.md docs/setup-checklist.md docs/hackathon-mvp-task-board.md .env.example frontend/package.json backend/requirements.txt -S
```

Expected: the core setup concepts are discoverable from the new docs and manifests.

**Step 2: Check git diff for accidental sprawl**

Run:

```bash
git diff -- README.md frontend/README.md docs/setup-checklist.md docs/hackathon-mvp-task-board.md .env.example frontend/package.json backend/requirements.txt
```

Expected: only setup/documentation/task-board changes are present.

**Step 3: Commit**

```bash
git add README.md frontend/README.md docs/setup-checklist.md docs/hackathon-mvp-task-board.md .env.example frontend/package.json backend/requirements.txt docs/plans/in-progress/2026-04-11-hackathon-mvp-setup-design.md docs/plans/in-progress/2026-04-11-hackathon-mvp-setup.md
git commit -m "docs: add hackathon setup and task board"
```

Expected: a clean commit containing only the setup and planning work.
