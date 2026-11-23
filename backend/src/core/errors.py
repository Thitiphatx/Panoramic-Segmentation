class DatasetNotFoundError(Exception):
    """Raised when a requested KITTI-360 sequence or frame is unavailable."""


class InferenceUnavailableError(Exception):
    """Raised when model dependencies or weights are not available."""


class InvalidImageError(Exception):
    """Raised when uploaded bytes are not a supported image."""


class InvalidSegmentRequestError(Exception):
    """Raised when a segmentation request refers to an unsupported model or sequence."""


class SequenceStorageUnavailableError(Exception):
    """Raised when the sequence object store cannot be reached."""


class InvalidSequenceDataError(Exception):
    """Raised when a sequence is missing valid images or matching timestamps."""


class JobServiceUnavailableError(Exception):
    """Raised when a requested job operation is not implemented yet."""


class StorageSyncCancelledError(Exception):
    """Raised when a storage sync has been asked to stop."""
