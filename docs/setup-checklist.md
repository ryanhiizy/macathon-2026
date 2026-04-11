# Hackathon Setup Checklist

> Hackathon MVP — speed over perfection. Everything here is the minimum to get a demoable app running.

---

## Stack Summary

| Layer | Choice | Why |
|---|---|---|
| App | Expo Go + `expo start --lan` | No build needed, no tunnel needed if on same Wi-Fi |
| Backend | Supabase (free tier) | Auth + Postgres + Storage + Realtime in one SDK |
| AI server | FastAPI on demo laptop (`localhost:8000`) | YOLO + prompt generation in one Python file |
| Networking | **LAN mode** — phone and laptop on same Wi-Fi | Zero tunnel setup, most reliable on demo day |

> **No Cloudflare tunnel, no ngrok required** — as long as the phone and laptop are on the same Wi-Fi (which they will be on demo day). If you need to dev from home separately, fall back to `ngrok http 8000` for the AI server.

---

## Checklist

### Supabase (one-time)

- [ ] Create a project at [supabase.com](https://supabase.com) (free tier is fine)
- [ ] Run the DB schema migration (see `docs/infrastructure/supabase.md`)
- [ ] Create a Storage bucket called `snaps` (public read)
- [ ] Enable Realtime on the `snaps` and `streaks` tables
- [ ] Set up the pg_cron streak-reset job (see `docs/infrastructure/supabase.md`)
- [ ] Copy the project URL + anon key into a `.env` file in the app root (never commit this)

### Expo App

- [ ] `npm install` in repo root
- [ ] `npx expo install expo-camera expo-notifications expo-audio` (pins to SDK 54)
- [ ] Create `.env` with Supabase URL + anon key
- [ ] Make sure phone and laptop are on the **same Wi-Fi**
- [ ] `npx expo start --lan` — scan the QR with Expo Go on the iPhone

### AI Server (demo laptop)

- [ ] `python -m venv yolo-env && source yolo-env/bin/activate` (or `yolo-env\Scripts\activate` on Windows)
- [ ] `pip install ultralytics fastapi "uvicorn[standard]" python-multipart anthropic` (or `openai` if using OpenAI)
- [ ] Add AI API key to environment: `export ANTHROPIC_API_KEY=...`
- [ ] Create / run `yolo_server.py` (see `docs/infrastructure/yolo-server.md` — also add `/generate-prompt` endpoint)
- [ ] `uvicorn yolo_server:app --host 0.0.0.0 --port 8000`
- [ ] Find laptop's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux) — look for the Wi-Fi adapter
- [ ] Paste `http://<laptop-ip>:8000` into the app's `YOLO_API_URL` constant
- [ ] Test: `curl http://localhost:8000/health` → `{"ok":true}`

### Prompt Bank

- [ ] Create `assets/prompts.json` with the static prompt bank (fallback if AI generation is slow)

---

## On Demo Day

1. Both laptop and phone on the **same Wi-Fi**
2. `npx expo start --lan` in one terminal
3. `uvicorn yolo_server:app --host 0.0.0.0 --port 8000` in another terminal
4. Update `YOLO_API_URL` in the app with the laptop's current IP (IPs can change between sessions)
5. Scan QR, open app, verify camera + detection works

---

## If Not on Same Wi-Fi (dev from home)

Only then do you need a tunnel for the AI server:

```bash
# Option A — ngrok (free account, reliable)
ngrok http 8000

# Option B — Cloudflare (no account needed)
cloudflared tunnel --url http://localhost:8000
```

Paste the generated HTTPS URL into `YOLO_API_URL`. For the Expo app itself, switch to `npx expo start --tunnel`.
