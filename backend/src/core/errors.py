class DatasetNotFoundError(Exception):
    """Raised when a requested KITTI-360 sequence or frame is unavailable."""


class InferenceUnavailableError(Exception):
    """Raised when model dependencies or weights are not available."""


class InvalidImageError(Exception):
    """Raised when uploaded bytes are not a supported image."""
