# Feature: Photo Verification (YOLO)

Submitted snaps for verifiable habits go through a YOLO object detection pass. If all the prompt's `requiredClasses` are detected above their confidence thresholds, the snap is verified.

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
  ├── insert snap row with verified=true/false ────────────────────────▶│
  │                                                                     │
  ├── if verified: increment circle_members.current_streak ─────────────▶│
```

## YOLO server contract

**Endpoint:** `POST /detect`

**Request:** `multipart/form-data` with one `file` field (JPEG)

**Response:**
```json
{
  "classes": ["person", "banana", "cell phone"],
  "confidences": [0.92, 0.78, 0.41],
  "latency_ms": 142
}
```

The server returns every class YOLO detected above its global minimum (0.25). The client filters against the prompt's per-class thresholds.

## Client-side matching

```ts
function isVerified(prompt: Prompt, detection: YoloResponse): boolean {
  return prompt.requiredClasses.every(req => {
    const idx = detection.classes.indexOf(req.class);
    if (idx === -1) return false;
    return detection.confidences[idx] >= req.minConfidence;
  });
}
```

Matching lives on the client, not the server, so the YOLO server stays dumb and doesn't need the prompt bank.

## Retry behavior

- First attempt fails → show "We couldn't spot the [missing class]. Try again." → user gets one retry within the remaining window
- Second attempt fails → habit instance marked `missed`, streak resets
- Latency target: under 3 seconds end-to-end. If slower, optimistically show "pending" and update when the response lands.

## Trust-based habits

Skip the whole YOLO call. Mark the snap `verified=true` on submission, upload the photo for the feed, done.

## Configuration

The app reads `YOLO_API_URL` from `src/config/yolo.ts`. This constant is updated manually per session when the tunnel URL changes. Do not hardcode it in feature code.

