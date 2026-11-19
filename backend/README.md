# Backend Design

The backend will serve the React app and run SegFormer inference. Keep HTTP
handling, KITTI-360 file access, and model execution in separate modules so each
part can be changed independently.

## Proposed source layout

```text
backend/
├── pyproject.toml
├── README.md
└── src/
    ├── __init__.py                 # Package entry point
    ├── main.py                     # FastAPI app and lifespan setup
    ├── api/
    │   ├── router.py               # Mounts route groups under /api
    │   └── routes/
    │       ├── health.py            # Health/readiness endpoints
    │       ├── sequences.py         # Browse available KITTI-360 sequences/frames
    │       ├── frame.py            # Frame metadata and frame job submission
    │       ├── jobs.py              # Job listing and cancellation
    │       └── segment.py           # Model listing and sequence job submission
    ├── core/
    │   ├── config.py                # Dataset/model paths and environment settings
    │   └── errors.py                # Shared API errors
    ├── schemas/
    │   ├── frame.py                 # Frame, GPS, and pose response models
    │   └── segment.py              # Segment request/model/result schemas
    ├── services/
    │   ├── kitti360.py              # Resolve image and synchronized OXTS files
    │   └── segment.py              # Inference service
    ├── inference/
    │   ├── segformer.py             # Load B0 once and run predictions
    │   ├── preprocessing.py         # Convert input images to model tensors
    │   └── postprocessing.py        # Color masks and calculate class coverage
    └── utils/
        └── images.py                # PNG encoding and image helpers
```

## Data and model paths

Use environment variables so the backend can find local files without copying
large datasets or weights into its package:

- `KITTI360_DATASET`: defaults to `../datasets/KITTI-360` from the repository
  root. This project currently stores images under `data_images/`, labels under
  `data_2d_semantics/`, and synchronized GPS/IMU files under `data_poses_oxt/`.
- `SEGFORMER_MODEL_DIR`: defaults to
  `../training/models/segformer-finetuned-cityscapes-1024-1024/b0`.

The dataset service pairs each rectified image at
`data_images/<sequence>/image_<camera>/data_rect/<frame>.png` with the matching
`data_poses_oxt/<sequence>/oxts/data/<frame>.txt`. It reads latitude, longitude,
and altitude from the synchronized OXTS record. The inference engine receives
the image; GPS is returned as associated metadata and is not fed into SegFormer.

## API shape

- `GET /health`: service status.
- `GET /api/sequence`: available sequence names.
- `GET /api/sequence/{sequence_id}`: ordered frames for a sequence.
- `GET /api/sequence/{sequence_id}/frame/{frame_id}`: frame metadata and GPS.
- `POST /api/sequence/{sequence_id}/frame/{frame_id}/segment`: submit a frame job.
- `GET /api/job`: list jobs; `DELETE /api/job/{job_id}`: cancel a job.
- `GET /api/segment/models`: available models (`SegmentModelList`).
- `POST /api/segment/segment`: submit a sequence segment job with
  `model_id` and `sequence_id`.

The job and segment submission routes are contract placeholders and return
HTTP 501 until a worker service is implemented. Legacy synchronous inference
routes have been removed.

Successful API responses use the shared envelope shape
`{"success": true, "data": ..., "error": null}`. Response payloads use typed
Pydantic schemas, including `SegmentModelList`, `FrameDetail`, and `JobList`.

## Run the API

From this directory, run `uv sync` and then `uv run uvicorn src.main:app --reload`.
The API docs are available at `/docs`. Set `CORS_ORIGINS` to a comma-separated
list of frontend origins when the frontend is not on `http://localhost:5173`.
`MAX_UPLOAD_BYTES` controls the upload limit (20 MiB by default).

The frame and model discovery routes are implemented. Job storage, submission,
and cancellation will be connected when the worker service is added.
