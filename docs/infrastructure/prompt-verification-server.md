# Prompt + Verification Server

Local FastAPI server for the demo laptop. It powers:

- `POST /generate-prompt` (fun prompt from habit + participant count)
- `POST /verify-photo` (pass/fail + reason + comment for prompt + image)

This server is called directly by the Expo app.

## Setup (one-time)

From repo root:

```bash
python -m venv yolo-env
source yolo-env/bin/activate
pip install -r backend/requirements.txt
```

Add `backend/.env` values if you want live model calls:

- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- Optional: `OPENAI_MODEL`, `ANTHROPIC_MODEL`

If provider calls fail (quota/network), the backend falls back to deterministic local responses for demo continuity.

## Run

```bash
source yolo-env/bin/activate
uvicorn backend.prompt_verification_server:app --host 0.0.0.0 --port 8000
```

Use `0.0.0.0` so tunnel tools can reach it.

## API Contracts

### `GET /health`

Response shape:

```json
{
  "ok": true,
  "provider": "openai | anthropic | none",
  "provider_configured": true,
  "verification_mode": "ai_prompt_and_judge"
}
```

### `POST /generate-prompt`

Request JSON:

```json
{
  "habit": "running",
  "participant_count": 1
}
```

Response JSON:

```json
{
  "prompt_text": "Take a photo ...",
  "id": "generated_..."
}
```

### `POST /verify-photo`

Multipart form fields:

- `prompt_text` (string)
- `participant_count` (int)
- `file` (image upload)

Response JSON:

```json
{
  "passed": true,
  "reason": "The scene appears aligned with the prompt and has clear visual intent.",
  "comment": "Main-character moment detected. Prompt nailed."
}
```

## Curl Smoke Tests

```bash
curl -X POST http://localhost:8000/generate-prompt \
  -H "Content-Type: application/json" \
  -d '{"habit":"running","participant_count":1}'
```

```bash
curl -X POST http://localhost:8000/verify-photo \
  -F "prompt_text=Take a fun running selfie with your shoes in frame" \
  -F "participant_count=1" \
  -F "file=@/absolute/path/to/photo.jpg"
```

## Tunnel Notes

For Expo tunnel mode, run a separate tunnel for this server:

```bash
cloudflared tunnel --url http://localhost:8000
```

Set `EXPO_PUBLIC_PROMPT_API_URL` to the HTTPS tunnel URL.
