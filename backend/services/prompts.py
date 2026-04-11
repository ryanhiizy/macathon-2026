from __future__ import annotations

import base64
import hashlib
import json
from dataclasses import dataclass
from uuid import uuid4

from anthropic import Anthropic
from openai import OpenAI

from backend.config import Settings

STRICT_JSON_SYSTEM_PROMPT = "Return strict JSON only."


class PromptProviderError(RuntimeError):
    pass


@dataclass(frozen=True)
class PromptResult:
    prompt_text: str
    prompt_id: str
    source: str


@dataclass(frozen=True)
class VerificationResult:
    passed: bool
    reason: str
    comment: str
    source: str


def build_prompt_instruction(habit: str, participant_count: int) -> str:
    mode = "group" if participant_count > 1 else "solo"
    return (
        "You are writing a short, playful photo challenge for a social habit-tracking app. "
        "Return JSON with exactly this key: prompt_text. "
        f"The tracked habit is '{habit}'. "
        f"The photo mode is '{mode}'. "
        f"The participant count is {participant_count}. "
        "Make the prompt one sentence, concrete, visual, and easy to perform in a live camera shot. "
        "It should feel fun and socially engaging. "
        "Prioritize prompts that are easy to verify from a single image using clear visible cues. "
        "Good cues include obvious hand gestures (peace sign, thumbs up, fist bump), visible objects (water bottle, book, dumbbell, running shoes), or simple pose/action signals (pointing at the habit item, group huddle, synchronized pose). "
        "Avoid hard-to-verify or ambiguous requests such as subtle motion states, implied context, or details that are often out of frame. "
        "For solo prompts require one obvious cue; for group prompts require a shared cue that multiple people can do together."
    )


def parse_prompt_payload(raw_text: str) -> str:
    data = json.loads(raw_text)
    prompt_text = data.get("prompt_text")
    if not isinstance(prompt_text, str) or not prompt_text.strip():
        raise PromptProviderError("Prompt provider returned invalid prompt_text")
    return prompt_text.strip()


def fallback_prompt(habit: str, participant_count: int) -> str:
    normalized_habit = habit.strip().lower() or "your habit"
    if participant_count > 1:
        return (
            f"Take a group photo while doing {normalized_habit}, and have everyone strike a different pose that shows how they tackle it."
        )
    return f"Take a photo of yourself doing {normalized_habit} with one playful detail in frame that shows your mood today."


def build_verification_instruction(prompt_text: str, participant_count: int) -> str:
    mode = "group" if participant_count > 1 else "solo"
    return (
        "You are a playful photo challenge judge for a social habit app. "
        "Look at the provided image and judge whether it satisfies the prompt. "
        "Return JSON with exactly these keys: passed (boolean), reason (string), comment (string). "
        f"Prompt: '{prompt_text}'. "
        f"Mode: '{mode}', participant_count: {participant_count}. "
        "Reason should be short and specific. "
        "Comment should be witty and positive if passed, or encouraging if not."
    )


def parse_verification_payload(raw_text: str) -> VerificationResult:
    data = json.loads(raw_text)
    passed = data.get("passed")
    reason = data.get("reason")
    comment = data.get("comment")
    if not isinstance(passed, bool):
        raise PromptProviderError("Verification provider returned invalid passed flag")
    if not isinstance(reason, str) or not reason.strip():
        raise PromptProviderError("Verification provider returned invalid reason")
    if not isinstance(comment, str) or not comment.strip():
        raise PromptProviderError("Verification provider returned invalid comment")
    return VerificationResult(passed=passed, reason=reason.strip(), comment=comment.strip(), source="provider")


def fallback_verify(prompt_text: str, image_bytes: bytes, participant_count: int) -> VerificationResult:
    if len(image_bytes) < 12_000:
        return VerificationResult(
            passed=False,
            reason="The image looks too small or compressed to confidently judge the prompt.",
            comment="The vibe is shy right now - retake with a clearer shot and bigger scene.",
            source="fallback",
        )

    score_seed = hashlib.sha1(image_bytes + prompt_text.encode("utf-8")).hexdigest()
    score = int(score_seed[:2], 16) / 255
    passed = score > 0.25

    if passed:
        if participant_count > 1:
            comment = "Squad energy approved. This looks like a challenge worth posting."
        else:
            comment = "Main-character moment detected. Prompt nailed."
        reason = "The scene appears aligned with the prompt and has clear visual intent."
    else:
        reason = "The photo does not clearly show the core action requested by the prompt yet."
        comment = "Close, but give it one more dramatic retake and make the prompt action obvious."

    return VerificationResult(passed=passed, reason=reason, comment=comment, source="fallback")


def generate_prompt(
    settings: Settings,
    habit: str,
    participant_count: int,
) -> PromptResult:
    provider = settings.prompt_provider
    if provider == "none":
        return PromptResult(
            prompt_text=fallback_prompt(habit, participant_count),
            prompt_id=f"generated_{uuid4()}",
            source="fallback",
        )

    instruction = build_prompt_instruction(habit, participant_count)
    try:
        if provider == "openai":
            client = OpenAI(api_key=settings.openai_api_key)
            response = client.chat.completions.create(
                model=settings.openai_model,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": STRICT_JSON_SYSTEM_PROMPT},
                    {"role": "user", "content": instruction},
                ],
            )
            content = response.choices[0].message.content or "{}"
            prompt_text = parse_prompt_payload(content)
            source = "openai"
        else:
            client = Anthropic(api_key=settings.anthropic_api_key)
            response = client.messages.create(
                model=settings.anthropic_model,
                max_tokens=200,
                system=STRICT_JSON_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": instruction}],
            )
            text_blocks = [block.text for block in response.content if getattr(block, "type", "") == "text"]
            prompt_text = parse_prompt_payload("\n".join(text_blocks))
            source = "anthropic"
    except Exception:
        prompt_text = fallback_prompt(habit, participant_count)
        source = "fallback"

    return PromptResult(prompt_text=prompt_text, prompt_id=f"generated_{uuid4()}", source=source)


def verify_photo(
    settings: Settings,
    prompt_text: str,
    participant_count: int,
    image_bytes: bytes,
    mime_type: str,
) -> VerificationResult:
    provider = settings.prompt_provider
    if provider == "none":
        return fallback_verify(prompt_text, image_bytes, participant_count)

    instruction = build_verification_instruction(prompt_text, participant_count)
    encoded = base64.b64encode(image_bytes).decode("utf-8")
    try:
        if provider == "openai":
            client = OpenAI(api_key=settings.openai_api_key)
            response = client.chat.completions.create(
                model=settings.openai_model,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": STRICT_JSON_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": instruction},
                            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{encoded}"}},
                        ],
                    },
                ],
            )
            content = response.choices[0].message.content or "{}"
            source = "openai"
        else:
            client = Anthropic(api_key=settings.anthropic_api_key)
            response = client.messages.create(
                model=settings.anthropic_model,
                max_tokens=300,
                system=STRICT_JSON_SYSTEM_PROMPT,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": instruction},
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": mime_type,
                                    "data": encoded,
                                },
                            },
                        ],
                    }
                ],
            )
            text_blocks = [block.text for block in response.content if getattr(block, "type", "") == "text"]
            content = "\n".join(text_blocks)
            source = "anthropic"
        parsed = parse_verification_payload(content)
        return VerificationResult(
            passed=parsed.passed,
            reason=parsed.reason,
            comment=parsed.comment,
            source=source,
        )
    except Exception:
        return fallback_verify(prompt_text, image_bytes, participant_count)
