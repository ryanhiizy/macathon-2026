# Hackathon Setup Checklist

Use this as the short operational checklist. For the full setup flow, start with [frontend/README.md](../frontend/README.md).

## 1. Repo and local dependencies

- [ ] Run `npm install` in `frontend/`
- [ ] Create a Python virtualenv at the repo root: `python3 -m venv yolo-env`
- [ ] Activate it and run `pip install -r backend/requirements.txt`
- [ ] Copy `frontend/.env.example` to `frontend/.env`
- [ ] Copy `backend/.env.example` to `backend/.env`

## 2. Supabase

- [ ] Create the Supabase project
- [ ] Run the canonical schema from [infrastructure/supabase.md](./infrastructure/supabase.md)
- [ ] Confirm the core tables exist: `profiles`, `follows`, `circles`, `circle_members`, `habits`, `habit_instances`, `snaps`, `snap_participants`, `likes`
- [ ] Create the public `snaps` bucket
- [ ] Apply the storage policies from [infrastructure/supabase.md](./infrastructure/supabase.md)
- [ ] Enable Realtime for `snaps`, `habit_instances`, `circle_members`, and `likes`
- [ ] Enable `pg_cron` and add the missed-window reset job
- [ ] Fill `EXPO_PUBLIC_SUPABASE_URL` and either `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `frontend/.env`

## 3. Local prompt + verification server

- [ ] Implement `prompt_verification_server.py` using [infrastructure/prompt-verification-server.md](./infrastructure/prompt-verification-server.md)
- [ ] Add one AI provider key locally: `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
- [ ] Start the server with `uvicorn backend.prompt_verification_server:app --host 0.0.0.0 --port 8000`
- [ ] Verify `curl http://localhost:8000/health` returns `{"ok":true}`
- [ ] Set `EXPO_PUBLIC_PROMPT_API_URL` in `frontend/.env`

## 4. Expo app

- [ ] Run `npx expo start --lan` from `frontend/` when the phone and laptop share Wi-Fi
- [ ] Use `npx expo start --tunnel` only when LAN mode is not possible
- [ ] Open Expo Go and confirm the app launches

## 5. Team execution

- [ ] Pull the next task from [hackathon-mvp-task-board.md](./hackathon-mvp-task-board.md)
- [ ] Work in dependency order: foundation -> backend core loop -> frontend core loop -> social/demo surface
- [ ] Keep stretch items out of the critical path
