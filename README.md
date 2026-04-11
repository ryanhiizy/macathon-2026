# presence

Hackathon MVP for a social habit-tracking app with live photo proof, Circle accountability, and a local AI/YOLO verification server.

## Repo layout

- `frontend/` — Expo app
- `backend/` — local FastAPI + YOLO server work
- `docs/` — product, architecture, setup, and planning docs

## Start here

1. Read [frontend/README.md](frontend/README.md)
2. Copy [.env.example](.env.example) into the local env files you need
3. Follow [docs/infrastructure/supabase.md](docs/infrastructure/supabase.md) to create the Supabase project
4. Use [docs/hackathon-mvp-task-board.md](docs/hackathon-mvp-task-board.md) to pick work in dependency order

## Fastest onboarding path

```bash
cd frontend
npm install

cd ..
python3 -m venv yolo-env
source yolo-env/bin/activate
pip install -r backend/requirements.txt
```

After that, fill in the real Supabase and YOLO values, start the local AI server, then run Expo from `frontend/`.

## Core docs

- [docs/project_overview.md](docs/project_overview.md)
- [docs/Architecture.md](docs/Architecture.md)
- [docs/setup-checklist.md](docs/setup-checklist.md)
- [docs/hackathon-mvp-task-board.md](docs/hackathon-mvp-task-board.md)
