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
    │       └── segmentation.py     # Upload image or request a dataset-frame prediction
    ├── core/
    │   ├── config.py                # Dataset/model paths and environment settings
    │   └── errors.py                # Shared API errors
    ├── schemas/
    │   ├── frame.py                 # Frame, GPS, and pose response models
    │   └── segmentation.py         # Prediction, mask, class coverage, latency
    ├── services/
    │   ├── kitti360.py              # Resolve image and synchronized OXTS files
    │   └── segmentation.py         # Combine frame/image, location, and inference
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
- `GET /api/sequences`: available sequence names.
- `GET /api/sequences/{sequence}/frames`: ordered frame IDs with image/GPS availability.
- `GET /api/sequences/{sequence}/frames/{frame_id}/segmentation`: segment a
  stored frame and return its location with the prediction.
- `POST /api/segmentation`: segment an uploaded raw image and accept GPS fields
  as metadata.

### Frame playback flow

The backend processes stored frames individually. The frontend first lists
sequences, loads the selected sequence's ordered frame list, and requests each
frame's segmentation as playback reaches it. It can cache completed responses
and use them to play frames in a loop. Pausing playback leaves the current
frame selected so the user can inspect its image, segmentation, and metadata.

Each segmentation response should include the frame ID, GPS coordinates when
available, a colorized mask (or mask URL), per-class pixel coverage, and
inference time. The model should load once when the API starts, rather than
once per request. The backend does not need to assemble a video for this flow.

If requesting frames individually is too slow, a batch endpoint can be added
later to process a frame range ahead of playback while still returning a
separate result for each frame. Batch processing is an optimization; the
frame-by-frame endpoint remains the basis for inspecting and pausing on
individual results.

## Current status

This file documents the intended structure. The backend package is still a
minimal stub; the route and inference modules above have not been implemented
yet.
