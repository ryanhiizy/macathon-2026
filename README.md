# presence

Hackathon MVP for a social habit-tracking app with live photo proof, Circle accountability, and a local AI/YOLO verification server.

## Repo layout

- `frontend/` — Expo app
- `backend/` — local FastAPI + YOLO server work
- `docs/` — product, architecture, setup, and planning docs

## Start here

1. Read [frontend/README.md](frontend/README.md)
2. Copy [frontend/.env.example](frontend/.env.example) to `frontend/.env`
3. Copy [backend/.env.example](backend/.env.example) to `backend/.env`
4. Follow [docs/infrastructure/supabase.md](docs/infrastructure/supabase.md) to create the Supabase project
5. Use [docs/hackathon-mvp-task-board.md](docs/hackathon-mvp-task-board.md) to pick work in dependency order

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
