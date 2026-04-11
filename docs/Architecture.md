# Architecture

> Hackathon MVP stack — chosen for speed of development and demo viability.

See [project_overview.md](./project_overview.md) for full product requirements.

## Runtime Decision: Expo Go

We run the app in **Expo Go** on our own iPhones — no custom dev build, no EAS, no Apple Developer account. This is viable because the team is on Windows and we only need to preview the app on our own devices, not distribute it.

Expo Go constraints we've designed around:

| Constraint | Impact | Our solution |
|---|---|---|
| Remote push notifications unreliable in Expo Go | Can't trigger the daily habit prompt via a push server | **Schedule notifications locally on-device** — each user's target time is known, so the client schedules its own ±15 min jittered local notification |
| `expo-background-fetch` not available | Can't reset streaks client-side when a window expires | **Server-side cron** — Supabase pg_cron / Edge Function runs every minute, expires windows, resets streaks, broadcasts via Realtime |
| Custom URL schemes don't work in dev | Invite links can't use `habitapp://` | Use `Linking.createURL('/invite/<code>')` — auto-resolves to `exp://...` in dev, real scheme later |

## Tech Stack

### Frontend (Expo SDK 54)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React Native + Expo SDK ~54 | |
| Language | TypeScript | |
| Routing | Expo Router v6 | File-based routing |
| Navigation | React Navigation (Bottom Tabs) | |
| Animations | React Native Reanimated ~4.1 + `react-native-worklets` 0.5 | Already paired correctly |
| Gestures | React Native Gesture Handler | |
| UI styling | NativeWind (Tailwind for RN) | Fast to style, no component API to learn |
| Icons | `@expo/vector-icons` | Already installed |

### Expo modules to add

Install with `npx expo install` so versions are pinned to SDK 54:

```bash
npx expo install expo-camera expo-notifications expo-audio
```

| Package | Purpose |
|---|---|
| `expo-camera` | In-app camera capture. Mount `<CameraView>` directly so camera-roll access is structurally impossible. Use `takePictureAsync({ exif: true })` for timestamp + metadata. |
| `expo-notifications` | **Local scheduled** notifications only (no remote push in Expo Go). iOS cap: 64 pending. |
| `expo-audio` | Shutter sound on capture |
| `expo-haptics` | Tactile feedback on capture (already installed) |
| `expo-file-system` | Photo upload handling (already transitively available) |
| `expo-linking` | Invite deep links (already installed) |

### Backend

| Layer | Choice | Notes |
|---|---|---|
| BaaS | Supabase | Covers auth, Postgres, Storage, Realtime in one SDK |
| Client SDK | `@supabase/supabase-js` | Pure JS, works in Expo Go |
| Auth | Supabase magic link / OTP | Redirect to `exp://...--/auth/callback` in dev |
| Database | Supabase Postgres | Users, circles, habits, snaps, streaks |
| File storage | Supabase Storage | Habit snap photos |
| Realtime | Supabase Realtime (WebSocket) | Circle feed updates while app is open |
| Scheduled jobs | Supabase pg_cron or Edge Function | **Critical:** runs every minute to expire habit windows and reset streaks — this cannot live client-side |

### AI / Verification

| Layer | Choice | Notes |
|---|---|---|
| Model | **YOLO** (Ultralytics YOLOv8n) | Fast object detection, ~6MB weights, runs on CPU |
| Runtime | Local Python server on the demo laptop (FastAPI + `ultralytics` + `uvicorn`) | No cloud hosting — we run it ourselves during the demo |
| Verification logic | Compare detected classes against the prompt's `required_objects` list | All required classes above confidence threshold (0.50 default) = verified |
| Prompt bank | Static JSON in-repo for V1 | Swap in LLM-generated prompts later if time allows |

#### Reachability options (pick whichever works on the hackathon network)

Since we're using `expo start --tunnel` and the phone may not share a LAN with the laptop, the YOLO server needs to be reachable from the phone. Options, in order of preference:

1. **Cloudflare Tunnel** — `cloudflared tunnel --url http://localhost:8000`. No account, no signup, one command, gives a public HTTPS URL. Preferred default.
2. **ngrok** — `ngrok http 8000`. Requires a free account. Stable and well-known fallback.
3. **localtunnel** — `npx localtunnel --port 8000`. Zero setup, less reliable.
4. **LAN mode** — if the hackathon Wi-Fi allows peer connections, switch Expo to `expo start --lan` and hit `http://<laptop-ip>:8000` directly. Simplest path when it works.

The public URL from whichever tunnel we use gets pasted into a single constant in the app (e.g. `YOLO_API_URL`) during the demo.

#### Verification flow

```
┌─────────────┐    ┌──────────────┐    ┌────────────────────┐
│  expo-camera │───▶│   Supabase   │    │  Local laptop      │
│   (capture)  │    │    Storage   │    │  ┌──────────────┐  │
└─────────────┘    └──────────────┘    │  │  FastAPI +   │  │
       │                                │  │  YOLOv8n     │  │
       │  image (HTTPS via tunnel)      │  └──────────────┘  │
       └───────────────────────────────▶│         ▲          │
                                         └─────────┼──────────┘
                                                   │
                                           detected classes
                                                   │
                                                   ▼
                                          ┌──────────────┐
                                          │  Postgres    │  streak +1
                                          │  + Realtime  │─────────────▶ circle feed
                                          └──────────────┘
```

> No Supabase Edge Function proxy in V1 — the YOLO server is local and temporary, so there's no endpoint worth hiding. The client calls the tunnel URL directly.

## MVP Scope

In scope for the hackathon preview:

- [ ] Habit creation (name, time, category, verifiable vs. trust-based)
- [ ] AI-generated prompts via FastAPI server (`/generate-prompt`) with static JSON fallback
- [ ] Solo camera capture (camera roll structurally blocked)
- [ ] Prompt text displayed above the camera view
- [ ] Photo upload to Supabase Storage
- [ ] YOLO object detection via Python inference server (`/detect`)
- [ ] Required-object matching against the prompt's class list (client-side)
- [ ] Group Prove — invite friends, group camera, group AI prompt, group post
- [ ] Circle creation + invite link (`Linking.createURL`)
- [ ] Join circle from invite link
- [ ] Home feed — Friends tab + Circles tab
- [ ] Solo post cards and group post cards
- [ ] Milestone celebration cards (7, 14, 30, 50, 100 day streaks)
- [ ] Circle detail — Feed / Leaderboard (All Time + Monthly) / About tabs
- [ ] Profile page — stats bar, bio, posts grid
- [ ] Streak counter per user per circle
- [ ] Local scheduled notifications for the daily prompt (±15 min jitter)
- [ ] Server-side streak reset on missed window (pg_cron)
- [ ] In-app notification when a circle member misses (Realtime)
- [ ] Like on snaps

Explicitly out of scope for MVP:

- Real remote push notifications (Expo Go limitation — use local scheduled notifications)
- Comments on snaps
- Streak freeze / grace period
- Rate limiting
- Custom notification categories / interactive notifications
- Public circle discovery beyond search by name
