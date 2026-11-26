from src.services.segment_service import SegmentService


class HealthService:
    @staticmethod
    def status(segment_service: SegmentService | None) -> dict[str, str]:
        model = "loaded" if segment_service and segment_service.predictor._model else "not_loaded"
        return {"status": "ok", "model": model}
