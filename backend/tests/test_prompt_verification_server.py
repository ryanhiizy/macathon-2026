import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.prompt_verification_server import app


class PromptVerificationServerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_health_reports_basic_readiness(self) -> None:
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["ok"])
        self.assertIn("provider", data)
        self.assertIn("provider_configured", data)
        self.assertEqual(data["verification_mode"], "ai_prompt_and_judge")

    def test_generate_prompt_works_without_ai_provider(self) -> None:
        with patch.dict(
            os.environ,
            {
                "OPENAI_API_KEY": "",
                "ANTHROPIC_API_KEY": "",
            },
            clear=False,
        ):
            response = self.client.post(
                "/generate-prompt",
                json={
                    "habit": "running",
                    "participant_count": 1,
                },
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("prompt_text", payload)
        self.assertIn("id", payload)

    def test_generate_prompt_falls_back_when_provider_errors(self) -> None:
        with patch.dict(
            os.environ,
            {
                "OPENAI_API_KEY": "fake-key",
                "ANTHROPIC_API_KEY": "",
            },
            clear=False,
        ), patch("backend.services.prompts.OpenAI") as openai_mock:
            openai_mock.return_value.chat.completions.create.side_effect = RuntimeError("quota exceeded")
            response = self.client.post(
                "/generate-prompt",
                json={
                    "habit": "running",
                    "participant_count": 1,
                },
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("prompt_text", payload)
        self.assertTrue(payload["prompt_text"])
        self.assertIn("id", payload)

    def test_verify_photo_rejects_non_image_uploads(self) -> None:
        response = self.client.post(
            "/verify-photo",
            data={"prompt_text": "Take a photo while running", "participant_count": "1"},
            files={"file": ("notes.txt", b"hello", "text/plain")},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("image", response.json()["detail"].lower())

    def test_verify_photo_returns_judgement_without_ai_provider(self) -> None:
        with patch.dict(
            os.environ,
            {
                "OPENAI_API_KEY": "",
                "ANTHROPIC_API_KEY": "",
            },
            clear=False,
        ):
            response = self.client.post(
                "/verify-photo",
                data={"prompt_text": "Take a joyful hydration photo", "participant_count": "2"},
                files={"file": ("snap.jpg", b"\xff\xd8\xff" + (b"x" * 25000), "image/jpeg")},
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("passed", payload)
        self.assertIn("reason", payload)
        self.assertIn("comment", payload)

    def test_verify_photo_falls_back_when_provider_errors(self) -> None:
        with patch.dict(
            os.environ,
            {
                "OPENAI_API_KEY": "fake-key",
                "ANTHROPIC_API_KEY": "",
            },
            clear=False,
        ), patch("backend.services.prompts.OpenAI") as openai_mock:
            openai_mock.return_value.chat.completions.create.side_effect = RuntimeError("quota exceeded")
            response = self.client.post(
                "/verify-photo",
                data={"prompt_text": "Take a fun running selfie with your shoes in frame", "participant_count": "1"},
                files={"file": ("snap.jpg", b"\xff\xd8\xff" + (b"x" * 25000), "image/jpeg")},
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("passed", payload)
        self.assertIn("reason", payload)
        self.assertIn("comment", payload)


if __name__ == "__main__":
    unittest.main()
