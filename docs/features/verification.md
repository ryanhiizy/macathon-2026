# Feature: Photo Verification

Submitted snaps for verifiable habits go through YOLO object detection. The primary social verification is the photo itself (BeReal-style) — YOLO adds a layer of integrity for verifiable categories.

## Flow

```
client                 Supabase Storage       YOLO server           Supabase DB
  │                          │                    │                     │
  ├── upload photo ─────────▶│                    │                     │
  │                          │                    │                     │
  │◀─── storage_path ────────┤                    │                     │
  │                                               │                     │
  ├── POST /detect (photo) ──────────────────────▶│                     │
  │                                               │                     │
  │◀─── detected classes ─────────────────────────┤                     │
  │                                                                     │
  ├── client matches vs prompt.requiredClasses                          │
  │                                                                     │
  ├── insert snap row (verified=true/false) ───────────────────────────▶│
  │                                                                     │
  ├── if verified: increment circle_members.current_streak ─────────────▶│
```

## YOLO Server Contract

**Endpoint:** `POST /detect`

**Request:** `multipart/form-data` with one `file` field (JPEG)

**Response:**
```json
{
  "classes": ["person", "banana"],
  "confidences": [0.92, 0.78],
  "latency_ms": 142
}
```

The server returns every class YOLO detected above its global minimum (0.25). The client filters against the prompt's per-class thresholds.

## Client-Side Matching

```ts
function isVerified(requiredClasses: RequiredClass[], detection: YoloResponse): boolean {
  return requiredClasses.every(req => {
    const idx = detection.classes.indexOf(req.class);
    if (idx === -1) return false;
    return detection.confidences[idx] >= req.minConfidence;
  });
}
```

Matching lives on the client — the YOLO server stays dumb and doesn't need the prompt bank.

## Retry Behavior

- First attempt fails → *"We couldn't spot the [missing class]. Try again."* → one retry within the remaining window
- Second attempt fails → habit instance marked `missed`, streak resets
- Latency target: under 3 seconds end-to-end. If slower, optimistically show "pending" and update when the response lands.

## Trust-Based Habits

Skip the YOLO call entirely. Mark the snap `verified=true` on submission, upload the photo for the feed, done.

## Group Prove Verification

The host's photo is used for YOLO detection. If verified, all participants are marked verified and all streaks increment. If failed, the host gets the retry — failure affects all participants.

## Configuration

The app reads `YOLO_API_URL` from `src/config/yolo.ts`. Updated manually per session when the tunnel URL or LAN IP changes. Do not hardcode in feature code.

**LAN mode (demo day):** `http://<laptop-ip>:8000`
**Tunnel mode (remote dev):** `https://<tunnel-url>`
