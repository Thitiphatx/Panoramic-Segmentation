# Segmentation worker

The worker consumes sequence segmentation job IDs from Redis `job_queue`. Jobs
are Redis hashes named `job:<id>` with `status=pending`, `model_id`, and
`sequence_id`. The worker atomically claims pending jobs, records progress,
then marks each job `completed` or `failed`.

## Structure

- `src/main.py` configures logging and starts the worker.
- `src/core/` contains environment-backed settings and Redis, database, and
  object-storage client construction.
- `src/workers/segmentation_worker.py` waits for Redis and polls the job queue.
- `src/services/job_service.py` claims jobs and processes their frames.
- `src/inferer/`, `src/core/transformer.py`, and `src/models.py` provide model
  inference, mask utilities, and database models.

It loads the sequence frames from PostgreSQL, downloads each raw frame from
MinIO, runs the selected local SegFormer model, colorizes the predicted class
mask, uploads a PNG, inserts or updates its class coverage in `fameresult`, and
writes the MinIO object path to the matching `frame.metadata.path.segmented`.

## Configuration

Provide `REDIS_HOST` and `S3_ENDPOINT`, plus either `DATABASE_URL` or the
`POSTGRES_HOST`, `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` values.
Optional settings are
`REDIS_PORT` (6379), `REDIS_USERNAME`, `REDIS_PASSWORD`, `S3_ACCESS_KEY`,
`S3_SECRET_KEY`, `S3_USE_SSL`, `S3_BUCKET` (`panoramic-segmentation`),
`MODEL_DIR` (defaults to `src/models/segforme-cityscapes-1024-1024`), and
`WORKER_POLL_SECONDS` (2). The image contains local B0 through B5 weights.

Run `python src/main.py` from this directory. PyTorch is supplied by the base
image; `requirements.txt` installs the PostgreSQL, Redis, MinIO, image, and
Transformers dependencies.
