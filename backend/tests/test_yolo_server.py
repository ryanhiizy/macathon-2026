import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.yolo_server import app


class YoloServerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_health_reports_basic_readiness(self) -> None:
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["ok"])
        self.assertIn("provider", data)
        self.assertIn("provider_configured", data)
        self.assertIn("yolo_loaded", data)

    def test_generate_prompt_returns_503_without_ai_provider(self) -> None:
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
                    "category": "running",
                    "mode": "solo",
                    "participant_count": 1,
                },
            )

        self.assertEqual(response.status_code, 503)
        self.assertIn("provider", response.json()["detail"].lower())

    def test_detect_rejects_non_image_uploads(self) -> None:
        response = self.client.post(
            "/detect",
            files={"file": ("notes.txt", b"hello", "text/plain")},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("image", response.json()["detail"].lower())


if __name__ == "__main__":
    unittest.main()
