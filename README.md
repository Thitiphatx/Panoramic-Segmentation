# 🚗 Panoramic Segmentation

A full-stack ML/AI application architecture integrating **SegFormer** (PyTorch / Hugging Face) served via a **FastAPI** backend, paired with a **React** frontend dashboard to visualize street segmentation masks alongside GPS coordinates from the **KITTI-360** dataset.

## 📂 Project Structure

A **Monorepo** structure separating raw datasets, model training pipelines, the AI inference backend, and the interactive web frontend:

```text
panoramic-segmentation/
├── datasets/                 # Local storage for raw & processed datasets (Git-ignored!)
│   └── kitti-360/
│       ├── data_2d_raw/      # Perspective rectified images (image_00/data_rect)
│       ├── data_2d_semantics/# Ground-truth 2D semantic segmentation masks
│       ├── data_poses/       # Vehicle poses (poses.txt) & OXTS GPS/IMU data
│       └── calibration/      # Camera-to-pose calibration files
│
├── training/                 # Model Training & Evaluation Pipeline
│   ├── configs/              # Hyperparameters & training configs (e.g., train_config.yaml)
│   ├── src/
│   │   ├── dataset.py        # Custom PyTorch Dataset loader for KITTI-360
│   │   ├── train.py          # Fine-tuning script for SegFormer
│   │   └── evaluate.py       # mIoU & validation metrics calculation
│   ├── checkpoints/          # Saved model weights during training (.pth / HF format)
│   └── pyproject.toml        # uv project configuration for training dependencies
│
├── backend/                  # FastAPI & SegFormer Inference Server
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI entry point & API endpoints
│   │   ├── model.py          # Loads trained SegFormer weights & runs inference
│   │   └── utils.py          # Image processing & KITTI-360 GPS/Pose utilities
│   ├── weights/              # Production-ready model weights copied from training/
│   ├── pyproject.toml        # uv project configuration for backend dependencies
│   └── Dockerfile            # Optional containerization for backend
│
├── frontend/                 # React Web Application (Vite)
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/           # Sample images & icons
│   │   ├── components/       # UI Components (MapPanel, ImageViewer, ControlBar)
│   │   ├── App.jsx           # Main dashboard layout
│   │   ├── main.jsx          # React DOM entry point
│   │   └── api.js            # Axios / Fetch client for FastAPI
│   ├── package.json          # Node dependencies (react, tailwindcss, leaflet, etc.)
│   └── vite.config.js
│
├── .gitignore                # Must exclude datasets/, checkpoints/, weights/, .venv/
└── README.md                 # Project documentation
```

> **Note on `.gitignore`:** Always add `datasets/`, `*.pth`, `checkpoints/`, and `.venv/` to your `.gitignore` file so large binary datasets and model weights are never committed to Git.

## 🧠 Model Training Pipeline (`training/`)

Before serving the API, fine-tune a pre-trained **SegFormer** model (e.g., `nvidia/segformer-b2-finetuned-cityscapes-1024-1024`) on the KITTI-360 dataset:

1. **`dataset.py`:** Uses `kitti360Scripts` or direct file mapping to pair `data_2d_raw/.../image_00/data_rect/{frame}.png` with `data_2d_semantics/.../image_00/{frame}.png`, applying `SegformerImageProcessor` resizing and normalization.

2. **`train.py`:** Loads pre-trained Cityscapes weights, adapts the classification head if needed (19 standard classes match directly), and runs the PyTorch / Hugging Face `Trainer` loop.

3. **Export Weights:** Once validation `mIoU` converges, export the best checkpoint to `backend/weights/` for API serving.

## ⚙️ Backend Architecture (`backend/`)

The FastAPI server loads the fine-tuned weights from `backend/weights/`, reads KITTI-360 frames and GPS metadata from `datasets/kitti-360/`, and serves predictions to React.

### Recommended API Endpoints:

1. **`GET /api/frames`**

   * **Description:** Retrieves a list of available Frame IDs along with their corresponding GPS/Pose coordinates.

2. **`GET /api/frame/{frame_id}`**

   * **Description:** Fetches the street image, runs SegFormer semantic segmentation, and returns the predicted mask (Base64 or static URL) alongside vehicle pose/GPS data.

3. **`POST /api/segment`**

   * **Payload:** `multipart/form-data` (custom uploaded street image).

   * **Response:** Predicted segmentation mask, class distribution statistics (e.g., `% road`, `% vehicles`), and inference latency.

### Example `backend/app/main.py` Skeleton:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Panoramic Segmentation API", version="1.0.0")

# Enable CORS for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Panoramic Segmentation API is running"}

@app.get("/api/frame/{frame_id}")
def get_frame_segmentation(frame_id: int):
    # TODO:
    # 1. Load frame image from ../datasets/kitti-360/data_2d_raw/...
    # 2. Run SegFormer forward pass using weights in ./weights/
    # 3. Extract GPS/Pose coordinates from ../datasets/kitti-360/data_poses/
    
    return {
        "frame_id": frame_id,
        "gps": {"lat": 49.0145, "lon": 8.4044, "alt": 112.5},
        "image_url": f"/static/images/{frame_id:010d}.png",
        "mask_url": f"/static/masks/{frame_id:010d}.png",
        "stats": {"road_coverage": "42.5%", "vehicles_detected": 3}
    }
```

## 💻 Frontend Architecture (`frontend/`)

The React frontend acts as an interactive inspection tool for visualizing AI predictions alongside the vehicle's spatial trajectory.

### Core Components:

1. **`ImageViewer.jsx`:** Displays the original street perspective image alongside the color-coded SegFormer prediction mask (supports opacity slider or side-by-side comparison).

2. **`MapPanel.jsx`:** Uses `react-leaflet` to render an interactive map plotting the vehicle's trajectory and highlighting the active frame's GPS marker.

3. **`ControlBar.jsx`:** Playback controls (Next/Previous frame, Play/Pause sequence) and class filter toggles (e.g., highlight only Road, Sidewalk, or Vehicles).

## 🚀 Development Workflow (with `uv`)

### 1. Setup & Run Model Training (`training/`)

```bash
cd training

# Initialize uv environment and install training dependencies
uv init
uv add torch torchvision transformers datasets evaluate accelerate pillow numpy
uv add "git+https://github.com/autonomousvision/kitti360Scripts.git"

# Start fine-tuning SegFormer on KITTI-360
uv run python src/train.py --data_dir ../datasets/kitti-360 --output_dir ./checkpoints
```

### 2. Setup & Run FastAPI Backend (`backend/`)

```bash
cd backend

# Initialize uv environment and install inference/API dependencies
uv init
uv add fastapi uvicorn python-multipart torch torchvision transformers pillow numpy
uv add "git+https://github.com/autonomousvision/kitti360Scripts.git"

# Copy trained weights from training/checkpoints/ to backend/weights/
# Run FastAPI development server
uv run uvicorn app.main:app --reload --port 8000
```

### 3. Setup & Run React Frontend (`frontend/`)

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install axios leaflet react-leaflet

# Run React dev server
npm run dev
```