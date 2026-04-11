from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parent
BACKEND_ENV_PATH = BACKEND_DIR / ".env"


def load_backend_env() -> None:
    load_dotenv(BACKEND_ENV_PATH, override=False)


@dataclass(frozen=True)
class Settings:
    openai_api_key: str | None
    anthropic_api_key: str | None
    gemini_api_key: str | None
    openai_model: str
    anthropic_model: str
    gemini_model: str
    supabase_url: str | None
    supabase_service_key: str | None

    @property
    def prompt_provider(self) -> str:
        if self.openai_api_key:
            return "openai"
        if self.anthropic_api_key:
            return "anthropic"
        return "none"

    @property
    def provider_configured(self) -> bool:
        return self.prompt_provider != "none"


def get_settings() -> Settings:
    load_backend_env()
    return Settings(
        openai_api_key=os.getenv("OPENAI_API_KEY") or None,
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY") or None,
        gemini_api_key=os.getenv("GEMINI_API_KEY") or None,
        openai_model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        anthropic_model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest"),
        gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        supabase_url=os.getenv("SUPABASE_URL") or None,
        supabase_service_key=os.getenv("SUPABASE_SERVICE_KEY") or None,
    )
