# YOLO And AI Server Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a runnable FastAPI backend scaffold for the hackathon MVP with documented `/health`, `/detect`, and `/generate-prompt` endpoints, OpenAI-first prompt generation, and lightweight smoke tests.

**Architecture:** Keep the backend service small and explicit. The FastAPI app should live in one entrypoint, with environment loading and service-specific logic extracted into thin modules for readability. YOLO should load lazily, and prompt generation should fail fast when no provider key is configured.

**Tech Stack:** Python 3, FastAPI, Pydantic, Ultralytics YOLO, OpenAI SDK, Anthropic SDK, python-dotenv, unittest, FastAPI TestClient.

---

### Task 1: Write the failing backend smoke tests

**Files:**
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/test_yolo_server.py`

**Step 1: Write the failing tests**

Create smoke tests for:
- `GET /health` returns 200 and includes readiness keys
- `POST /generate-prompt` returns 503 when no provider key is configured
- `POST /detect` rejects non-image uploads with 400

**Step 2: Run test to verify it fails**

Run:

```bash
source yolo-env/bin/activate && python -m unittest backend.tests.test_yolo_server -v
```

Expected: FAIL because `backend.yolo_server` does not exist yet.

### Task 2: Implement config and services

**Files:**
- Create: `backend/config.py`
- Create: `backend/services/__init__.py`
- Create: `backend/services/prompts.py`
- Create: `backend/services/yolo.py`

**Step 1: Add config loading**

Implement a small config object that:
- loads `.env` from `backend/.env`
- resolves provider preference as OpenAI first, Anthropic second
- exposes readiness helpers

**Step 2: Add prompt service**

Implement a prompt service that:
- validates provider availability
- uses OpenAI if configured
- uses Anthropic if OpenAI is absent and Anthropic is configured
- returns `prompt_text`, `required_classes`, and generated `id`

**Step 3: Add YOLO service**

Implement a YOLO service that:
- lazily loads `yolov8n.pt`
- runs inference on a temp file
- returns normalized classes, confidences, and latency

### Task 3: Implement FastAPI entrypoint

**Files:**
- Create: `backend/yolo_server.py`

**Step 1: Add the app and schemas**

Implement:
- FastAPI app
- request/response models
- `/health`
- `/detect`
- `/generate-prompt`

**Step 2: Keep failures explicit**

Map:
- invalid image upload -> 400
- missing provider config -> 503
- provider or YOLO errors -> 500

### Task 4: Re-run tests and smoke verification

**Files:**
- Modify: `backend/tests/test_yolo_server.py`
- Modify: `backend/yolo_server.py`
- Modify: `backend/config.py`
- Modify: `backend/services/prompts.py`
- Modify: `backend/services/yolo.py`

**Step 1: Run the test suite**

Run:

```bash
source yolo-env/bin/activate && python -m unittest backend.tests.test_yolo_server -v
```

Expected: PASS.

**Step 2: Run syntax/import verification**

Run:

```bash
source yolo-env/bin/activate && python -m py_compile backend/config.py backend/services/prompts.py backend/services/yolo.py backend/yolo_server.py
```

Expected: PASS with no output.

**Step 3: Run a short app import smoke test**

Run:

```bash
source yolo-env/bin/activate && python - <<'PY'
from backend.yolo_server import app
print(app.title)
PY
```

Expected: prints the FastAPI app title.

### Task 5: Commit

**Files:**
- Create: `backend/config.py`
- Create: `backend/services/__init__.py`
- Create: `backend/services/prompts.py`
- Create: `backend/services/yolo.py`
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/test_yolo_server.py`
- Create: `backend/yolo_server.py`
- Create: `docs/plans/in-progress/2026-04-11-yolo-ai-server-design.md`
- Create: `docs/plans/in-progress/2026-04-11-yolo-ai-server.md`

**Step 1: Commit**

```bash
git add backend/config.py backend/services/__init__.py backend/services/prompts.py backend/services/yolo.py backend/tests/__init__.py backend/tests/test_yolo_server.py backend/yolo_server.py docs/plans/in-progress/2026-04-11-yolo-ai-server-design.md docs/plans/in-progress/2026-04-11-yolo-ai-server.md
git commit -m "feat: scaffold yolo ai server"
```
