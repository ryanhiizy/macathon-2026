from __future__ import annotations

import json
from dataclasses import dataclass
from uuid import uuid4

from anthropic import Anthropic
from openai import OpenAI

from backend.config import Settings


CATEGORY_REQUIRED_CLASSES: dict[str, list[dict[str, float | str]]] = {
    "gym": [
        {"class": "person", "min_confidence": 0.5},
        {"class": "sports ball", "min_confidence": 0.2},
    ],
    "running": [
        {"class": "person", "min_confidence": 0.5},
    ],
    "cooking": [
        {"class": "bowl", "min_confidence": 0.35},
    ],
    "meal_prep": [
        {"class": "bowl", "min_confidence": 0.35},
        {"class": "person", "min_confidence": 0.35},
    ],
    "reading": [],
    "meditation": [],
    "water": [],
}


class PromptProviderError(RuntimeError):
    pass


@dataclass(frozen=True)
class PromptResult:
    prompt_text: str
    required_classes: list[dict[str, float | str]]
    prompt_id: str


def get_required_classes(category: str) -> list[dict[str, float | str]]:
    return CATEGORY_REQUIRED_CLASSES.get(category, [])


def build_prompt_instruction(category: str, mode: str, participant_count: int) -> str:
    return (
        "You are writing a short, playful photo challenge for a social habit-tracking app. "
        "Return JSON with a single key named prompt_text. "
        f"The habit category is '{category}'. "
        f"The capture mode is '{mode}'. "
        f"The participant count is {participant_count}. "
        "Make the prompt one sentence, concrete, visual, and easy to perform in a live camera shot."
    )


def parse_prompt_payload(raw_text: str) -> str:
    data = json.loads(raw_text)
    prompt_text = data.get("prompt_text")
    if not isinstance(prompt_text, str) or not prompt_text.strip():
        raise PromptProviderError("Prompt provider returned invalid prompt_text")
    return prompt_text.strip()


def generate_prompt(
    settings: Settings,
    category: str,
    mode: str,
    participant_count: int,
) -> PromptResult:
    provider = settings.prompt_provider
    if provider == "none":
        raise PromptProviderError("No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.")

    instruction = build_prompt_instruction(category, mode, participant_count)
    if provider == "openai":
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.chat.completions.create(
            model=settings.openai_model,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "Return strict JSON only."},
                {"role": "user", "content": instruction},
            ],
        )
        content = response.choices[0].message.content or "{}"
        prompt_text = parse_prompt_payload(content)
    else:
        client = Anthropic(api_key=settings.anthropic_api_key)
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=200,
            system="Return strict JSON only.",
            messages=[{"role": "user", "content": instruction}],
        )
        text_blocks = [block.text for block in response.content if getattr(block, "type", "") == "text"]
        prompt_text = parse_prompt_payload("\n".join(text_blocks))

    return PromptResult(
        prompt_text=prompt_text,
        required_classes=get_required_classes(category),
        prompt_id=f"generated_{uuid4()}",
    )
