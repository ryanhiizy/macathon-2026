# presence frontend setup

This app runs from the `frontend/` directory. The backend is a separate local FastAPI server that runs on the demo laptop.

## Prerequisites

- Node.js 20+ and npm
- Python 3.10+
- Expo Go on a physical iPhone
- A Supabase project
- Phone and laptop on the same Wi-Fi for demo day, or tunnel access for remote development

## Install the frontend

```bash
cd frontend
npm install
```

The MVP-critical Expo and Supabase packages are already declared in `package.json`.

## Install the local AI server dependencies

From the repository root:

```bash
python3 -m venv yolo-env
source yolo-env/bin/activate
pip install -r backend/requirements.txt
```

Windows:

```bash
python -m venv yolo-env
yolo-env\Scripts\activate
pip install -r backend/requirements.txt
```

## Environment setup

From the repository root, create the local env files you need:

```bash
cp .env.example frontend/.env
cp .env.example backend/.env
```

Fill in at least:

- `EXPO_PUBLIC_SUPABASE_URL` — required
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — required
- `EXPO_PUBLIC_PROMPT_API_URL` — required once the app calls the local AI server
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` — required once prompt generation is wired

## Supabase one-time setup

Follow [docs/infrastructure/supabase.md](../docs/infrastructure/supabase.md) and complete:

1. Create the project
2. Run the canonical schema
3. Create the `snaps` storage bucket
4. Apply the storage policies
5. Enable Realtime on `snaps`, `habit_instances`, `circle_members`, and `likes`
6. Enable `pg_cron` and add the missed-window reset job

## Local AI server

The server implementation lives at `backend/prompt_verification_server.py`. Start it with:

```bash
source yolo-env/bin/activate
uvicorn backend.prompt_verification_server:app --host 0.0.0.0 --port 8000
```

The server contract and sample implementation live in [docs/infrastructure/prompt-verification-server.md](../docs/infrastructure/prompt-verification-server.md).

## Running the app

Demo day, same Wi-Fi:

```bash
cd frontend
npx expo start --lan
```

Remote development:

```bash
cd frontend
npx expo start --tunnel
```

If you are using a tunnel for the AI server, set `EXPO_PUBLIC_PROMPT_API_URL` to the HTTPS tunnel URL.

## Ready-to-build checklist

- `frontend/node_modules` exists after `npm install`
- `backend/requirements.txt` installed into `yolo-env`
- `frontend/.env` exists and contains Supabase values
- `backend/.env` exists for local AI server secrets
- Supabase schema, storage, Realtime, and cron are configured
- You can run `npx expo start --lan` from `frontend/`
- The AI server file is implemented or assigned from the task board

## Source of truth

- Product scope: [docs/project_overview.md](../docs/project_overview.md)
- Setup: [docs/setup-checklist.md](../docs/setup-checklist.md)
- Task board: [docs/hackathon-mvp-task-board.md](../docs/hackathon-mvp-task-board.md)
