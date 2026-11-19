import io
import os

from minio import Minio
from src.utils.utils import env

def get_client() -> Minio:
    """Create the MinIO client only when an operation needs it."""
    return Minio(
        env("S3_ENDPOINT"),
        access_key=env("S3_ACCESS_KEY"),
        secret_key=env("S3_SECRET_KEY"),
        secure=os.environ.get("S3_USE_SSL", "false").lower() == "true",
    )

bucket = "panoramic-segmentation"
result_path="result"
raw_path="raw"
object_name = "hello.txt"
payload = b"hello from SILO\n"

def test() -> str:
    client = get_client()
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)

    client.put_object(
        bucket,
        object_name,
        io.BytesIO(payload),
        length=len(payload),
        content_type="text/plain",
    )
    stat = client.stat_object(bucket, object_name)
    return f"Uploaded {object_name}: {stat.size} bytes"

