from __future__ import annotations

from typing import Literal

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from backend.config import get_settings
from backend.services.prompts import PromptProviderError, generate_prompt
from backend.services.yolo import YoloService


class RequiredClass(BaseModel):
    class_name: str = Field(alias="class")
    min_confidence: float

    model_config = {"populate_by_name": True}


class GeneratePromptRequest(BaseModel):
    category: str
    mode: Literal["solo", "group"]
    participant_count: int = Field(default=1, ge=1)


class GeneratePromptResponse(BaseModel):
    prompt_text: str
    required_classes: list[RequiredClass]
    id: str


class DetectResponse(BaseModel):
    classes: list[str]
    confidences: list[float]
    latency_ms: int


app = FastAPI(title="presence YOLO + AI server")
settings = get_settings()
yolo_service = YoloService(settings.yolo_model_name)


@app.get("/health")
def health():
    current_settings = get_settings()
    return {
        "ok": True,
        "provider": current_settings.prompt_provider,
        "provider_configured": current_settings.provider_configured,
        "yolo_loaded": yolo_service.is_loaded,
    }


@app.post("/detect", response_model=DetectResponse)
async def detect(file: UploadFile = File(...)) -> DetectResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="file must be an image")

    image_bytes = await file.read()
    try:
        result = yolo_service.detect(image_bytes)
    except Exception as exc:  # fail fast for the hackathon
        raise HTTPException(status_code=500, detail=f"inference failed: {exc}") from exc

    return DetectResponse(
        classes=result.classes,
        confidences=result.confidences,
        latency_ms=result.latency_ms,
    )


@app.post("/generate-prompt", response_model=GeneratePromptResponse)
def create_prompt(request: GeneratePromptRequest) -> GeneratePromptResponse:
    current_settings = get_settings()
    try:
        result = generate_prompt(
            settings=current_settings,
            category=request.category,
            mode=request.mode,
            participant_count=request.participant_count,
        )
    except PromptProviderError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"prompt generation failed: {exc}") from exc

    return GeneratePromptResponse(
        prompt_text=result.prompt_text,
        required_classes=[
            RequiredClass.model_validate(required_class) for required_class in result.required_classes
        ],
        id=result.prompt_id,
    )
