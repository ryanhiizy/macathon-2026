# presence
*Built at Macathon 2026.*
devpost: https://devpost.com/software/presence-6ay0vb

A social habit-tracking app — Habit Tracker × BeReal × Strava. Prove your habits with live photos, compete with friends in Circles, and let AI keep it fun.

## Try it
Since this is a native mobile app, we've hosted everything so you can just follow the steps to get it on your iphone:

IOS installation instructions:
1. Download Testflight
2. Get the Expo Go beta app through: https://testflight.apple.com/join/GZJxxfUU/
3. Scan the QR Code below with your phone camera and follow the link into Expo Go beta
4. Access the presence app via Expo Go beta app

![Demo QR Code](demo-photos/PresenceAppDownload.png)

## How It Works

1. Create a daily habit (gym, cooking, reading, etc.)
2. Get a notification around your target time
3. Open the in-app camera and receive an AI-generated photo prompt
4. Take a live photo following the prompt
5.  Vision model detection verifies the photo on the backend
6. Your verified snap posts to your Circles' feed — miss the window and your streak resets

## Tech Stack

| Layer | Tech |
|---|---|
| Mobile app | React Native + Expo SDK 55, TypeScript, Expo Router, NativeWind |
| Backend-as-a-Service | Supabase (Auth, Postgres, Storage, Realtime) |
| AI / Verification server | FastAPI + Claude/OpenAI/Gemini for prompt generation |
| Hosting (server) | Fly.io or local laptop via tunnel |

## Repo Layout
```
frontend/          Expo app (screens, components, lib)
├── app/           Expo Router screens (tabs, auth, camera, circles, habits, …)
├── components/    Shared UI components
├── lib/           Data layer, Supabase client, business logic
└── constants/     Theme, prompt bank

backend/           FastAPI prompt + verification server
├── prompt_verification_server.py
└── config.py

docs/              Product, architecture, and planning docs
```


