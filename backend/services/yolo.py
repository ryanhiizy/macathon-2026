from __future__ import annotations

import os
import tempfile
import time
from dataclasses import dataclass


@dataclass(frozen=True)
class DetectionResult:
    classes: list[str]
    confidences: list[float]
    latency_ms: int


class YoloService:
    def __init__(self, model_name: str) -> None:
        self.model_name = model_name
        self._model = None

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def _ensure_model(self):
        if self._model is None:
            from ultralytics import YOLO

            self._model = YOLO(self.model_name)
        return self._model

    def detect(self, image_bytes: bytes) -> DetectionResult:
        start = time.time()
        model = self._ensure_model()

        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as handle:
                handle.write(image_bytes)
                temp_path = handle.name

            results = model(temp_path)[0]
            classes = [results.names[int(class_id)] for class_id in results.boxes.cls]
            confidences = [float(confidence) for confidence in results.boxes.conf]
            latency_ms = int((time.time() - start) * 1000)
            return DetectionResult(
                classes=classes,
                confidences=confidences,
                latency_ms=latency_ms,
            )
        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
