from __future__ import annotations

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field, field_validator

from backend.config import get_settings
from backend.services.coach import compute_habit_stats, generate_insight
from backend.services.prompts import (
    PromptProviderError,
    generate_prompt,
    verify_photo,
)


class CoachInsightRequest(BaseModel):
    user_id: str = Field(min_length=1)
    habit_id: str = Field(min_length=1)


class CoachInsightResponse(BaseModel):
    headline: str
    detail: str
    habit_name: str
    insight_type: str


class GeneratePromptRequest(BaseModel):
    habit: str = Field(min_length=1)
    participant_count: int = Field(default=1, ge=1)

    @field_validator("habit")
    @classmethod
    def habit_must_not_be_blank(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("habit must not be blank")
        return trimmed


class GeneratePromptResponse(BaseModel):
    prompt_text: str
    id: str
    source: str


class VerifyPhotoResponse(BaseModel):
    passed: bool
    reason: str
    comment: str
    source: str


app = FastAPI(title="presence prompt + verification server")


@app.get("/health")
def health():
    current_settings = get_settings()
    return {
        "ok": True,
        "provider": current_settings.prompt_provider,
        "provider_configured": current_settings.provider_configured,
        "verification_mode": "ai_prompt_and_judge",
    }


@app.post("/verify-photo", response_model=VerifyPhotoResponse)
async def verify_photo_endpoint(
    prompt_text: str = Form(...),
    participant_count: int = Form(default=1),
    file: UploadFile = File(...),
) -> VerifyPhotoResponse:
    if participant_count < 1:
        raise HTTPException(status_code=400, detail="participant_count must be >= 1")

    if not prompt_text.strip():
        raise HTTPException(status_code=400, detail="prompt_text must not be blank")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="file must be an image")

    image_bytes = await file.read()
    try:
        result = verify_photo(
            settings=get_settings(),
            prompt_text=prompt_text.strip(),
            participant_count=participant_count,
            image_bytes=image_bytes,
            mime_type=file.content_type,
        )
    except PromptProviderError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"verification failed: {exc}") from exc

    return VerifyPhotoResponse(
        passed=result.passed,
        reason=result.reason,
        comment=result.comment,
        source=result.source,
    )


@app.post("/generate-prompt", response_model=GeneratePromptResponse)
def create_prompt(request: GeneratePromptRequest) -> GeneratePromptResponse:
    current_settings = get_settings()
    try:
        result = generate_prompt(
            settings=current_settings,
            habit=request.habit,
            participant_count=request.participant_count,
        )
    except PromptProviderError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"prompt generation failed: {exc}") from exc

    return GeneratePromptResponse(
        prompt_text=result.prompt_text,
        id=result.prompt_id,
        source=result.source,
    )


@app.post("/coach-insight", response_model=CoachInsightResponse)
def get_coach_insight(request: CoachInsightRequest) -> CoachInsightResponse:
    current_settings = get_settings()
    if not current_settings.supabase_url or not current_settings.supabase_service_key:
        raise HTTPException(status_code=503, detail="Supabase not configured")

    try:
        stats = compute_habit_stats(current_settings, request.user_id, request.habit_id)
        insight = generate_insight(current_settings, stats)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"coach insight failed: {exc}") from exc

    return CoachInsightResponse(
        headline=insight.headline,
        detail=insight.detail,
        habit_name=insight.habit_name,
        insight_type=insight.insight_type,
    )
