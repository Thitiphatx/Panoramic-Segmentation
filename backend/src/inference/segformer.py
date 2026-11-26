from pathlib import Path
from time import perf_counter

from src.core.errors import InferenceUnavailableError


class SegformerPredictor:
    """Lazy Hugging Face SegFormer predictor; model loads once on first use."""

    def __init__(self, model_dir: Path):
        self.model_dir = model_dir
        self._processor = None
        self._model = None

    def predict(self, image):
        if self._model is None:
            if not self.model_dir.is_dir():
                raise InferenceUnavailableError(f"SegFormer weights were not found at {self.model_dir}")
            try:
                import torch
                from transformers import SegformerForSemanticSegmentation, SegformerImageProcessor
            except ImportError as exc:
                raise InferenceUnavailableError(
                    "Install the optional inference dependencies (torch and transformers) to run segment inference"
                ) from exc
            try:
                self._processor = SegformerImageProcessor.from_pretrained(str(self.model_dir), local_files_only=True)
                self._model = SegformerForSemanticSegmentation.from_pretrained(
                    str(self.model_dir), local_files_only=True
                ).eval()
                self._torch = torch
            except Exception as exc:
                raise InferenceUnavailableError(f"Could not load SegFormer model: {exc}") from exc

        started = perf_counter()
        inputs = self._processor(images=image, return_tensors="pt")
        with self._torch.inference_mode():
            logits = self._model(**inputs).logits
        prediction = self._torch.nn.functional.interpolate(
            logits, size=(image.height, image.width), mode="bilinear", align_corners=False
        ).argmax(dim=1)[0]
        elapsed_ms = (perf_counter() - started) * 1000
        return prediction.cpu().numpy(), elapsed_ms, self._model.config.id2label
