from pathlib import Path
from time import perf_counter

import torch
from transformers import SegformerForSemanticSegmentation, SegformerImageProcessor


class SegformerPredictor:
    """Load local SegFormer weights once, then predict masks for frames."""

    def __init__(self, model_dir: Path):
        self.model_dir = model_dir
        self._processor = None
        self._model = None

    def predict(self, image):
        if self._model is None:
            self._processor = SegformerImageProcessor.from_pretrained(
                str(self.model_dir), local_files_only=True
            )
            self._torch = torch
            self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self._model = SegformerForSemanticSegmentation.from_pretrained(
                str(self.model_dir), local_files_only=True
            ).to(self._device).eval()

        started = perf_counter()
        inputs = self._processor(images=image, return_tensors="pt")
        inputs = {key: value.to(self._device) for key, value in inputs.items()}
        with self._torch.inference_mode():
            logits = self._model(**inputs).logits
        prediction = self._torch.nn.functional.interpolate(
            logits, size=(image.height, image.width), mode="bilinear", align_corners=False
        ).argmax(dim=1)[0]
        return prediction.cpu().numpy(), (perf_counter() - started) * 1000, self._model.config.id2label
