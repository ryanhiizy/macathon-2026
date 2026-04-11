# YOLO And AI Server Design

## Goal

Scaffold a runnable FastAPI backend for the hackathon MVP that exposes the documented `/health`, `/detect`, and `/generate-prompt` endpoints, with real YOLO integration and OpenAI-first prompt generation behind environment variables.

## Why

The repo already has the intended backend architecture and dependency setup, but no actual server entrypoint. Without a runnable server, the frontend cannot integrate against the real contracts, and the team would only discover networking, model-loading, and provider-config issues late in the hackathon.

## Chosen Approach

Build a small, direct FastAPI service with a thin config layer and two thin service wrappers:

- `backend/yolo_server.py` for the FastAPI app and route definitions
- `backend/config.py` for environment loading and provider selection
- `backend/services/yolo.py` for YOLO model loading and inference formatting
- `backend/services/prompts.py` for OpenAI-first prompt generation, with Anthropic as optional fallback

The scaffold should prefer clear failure over hidden fallback. If prompt generation is requested without a configured provider, the server should return an explicit configuration error. If YOLO inference fails, the server should return a compact 500 instead of silently degrading.

## API Shape

### `GET /health`

Returns a small readiness payload describing:

- API is up
- prompt provider selection
- whether provider credentials are present
- whether the YOLO model has been loaded yet

### `POST /detect`

Accepts multipart image upload and returns:

- `classes`
- `confidences`
- `latency_ms`

### `POST /generate-prompt`

Accepts:

- `category`
- `mode`
- `participant_count`

Returns:

- `prompt_text`
- `required_classes`
- `id`

## OpenAI Decision

OpenAI is the primary provider for this scaffold because that is the likely hackathon choice. Anthropic can remain as an optional fallback if its key is present, but the config resolution order should prefer OpenAI.

## Testing Strategy

Use lightweight backend smoke tests that verify:

- `/health` responds successfully
- `/generate-prompt` returns a configuration error when no provider is configured
- `/detect` rejects non-image uploads cleanly

These tests avoid forcing real provider calls or real YOLO inference in the initial scaffold while still proving the FastAPI contract.

## Risks

- Real YOLO inference pulls in a heavy dependency graph and may behave differently across machines
- Prompt provider APIs can fail due to missing keys, model names, or network issues
- It is easy to over-engineer this service even though the docs want it dumb and replaceable

## Mitigations

- Keep the service wrappers thin
- Use lazy YOLO model loading so the server can still start and answer `/health`
- Return explicit errors for missing or invalid config
- Avoid business logic or database access in this service

## Out Of Scope

- Database access
- Supabase writes
- Prompt-bank fallback inside the server
- Auth or request signing
- Advanced retries or provider abstraction beyond the minimum needed
