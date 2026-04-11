# Hackathon Setup Checklist

Use this as the short operational checklist. For the full setup flow, start with [frontend/README.md](../frontend/README.md).

## 1. Repo and local dependencies

- [ ] Run `npm install` in `frontend/`
- [ ] Create a Python virtualenv at the repo root: `python3 -m venv yolo-env`
- [ ] Activate it and run `pip install -r backend/requirements.txt`
- [ ] Create `frontend/.env`
- [ ] Create `backend/.env`

## 2. Supabase

- [ ] Create the Supabase project
- [ ] Run the schema from [infrastructure/supabase.md](./infrastructure/supabase.md)
- [ ] Create the public `snaps` bucket
- [ ] Enable Realtime for `snaps` and `habit_instances`
- [ ] Enable `pg_cron` and add the missed-window reset job
- [ ] Fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `frontend/.env`

## 3. Local AI server

- [ ] Implement `yolo_server.py` using [infrastructure/yolo-server.md](./infrastructure/yolo-server.md)
- [ ] Add one AI provider key locally: `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
- [ ] Start the server with `uvicorn yolo_server:app --host 0.0.0.0 --port 8000`
- [ ] Verify `curl http://localhost:8000/health` returns `{"ok":true}`
- [ ] Set `EXPO_PUBLIC_YOLO_API_URL` in `frontend/.env`

## 4. Expo app

- [ ] Run `npx expo start --lan` from `frontend/` when the phone and laptop share Wi-Fi
- [ ] Use `npx expo start --tunnel` only when LAN mode is not possible
- [ ] Open Expo Go and confirm the app launches

## 5. Team execution

- [ ] Pull the next task from [hackathon-mvp-task-board.md](./hackathon-mvp-task-board.md)
- [ ] Work in dependency order: foundation -> backend core loop -> frontend core loop -> social/demo surface
- [ ] Keep stretch items out of the critical path
