from src.services.minio_service import test


class ResourceService:
    @staticmethod
    def describe_storage() -> str:
        return test()
