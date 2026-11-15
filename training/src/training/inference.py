"""Run SegFormer semantic segmentation on a KITTI-360 image."""

import argparse
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForSemanticSegmentation


REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_IMAGE_PATH = (
    REPOSITORY_ROOT
    / "datasets"
    / "KITTI-360"
    / "data_images"
    / "2013_05_28_drive_0000_sync"
    / "image_00"
    / "data_rect"
    / "0000000000.png"
)
DEFAULT_CHECKPOINT = (
    REPOSITORY_ROOT
    / "training"
    / "models"
    / "segformer-finetuned-cityscapes-1024-1024"
    / "b0"
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--image",
        type=Path,
        default=DEFAULT_IMAGE_PATH,
        help=f"Input image (default: {DEFAULT_IMAGE_PATH})",
    )
    parser.add_argument(
        "--checkpoint",
        default=DEFAULT_CHECKPOINT,
        help="Hugging Face model name or local checkpoint directory.",
    )
    args = parser.parse_args()

    image_path = args.image.expanduser().resolve()
    if not image_path.is_file():
        parser.error(f"image file not found: {image_path}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Running on device: {device}")
    if device.type == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")

    print(f"Loading model: {args.checkpoint}")
    processor = AutoImageProcessor.from_pretrained(
        args.checkpoint, local_files_only=True
    )
    model = AutoModelForSemanticSegmentation.from_pretrained(
        args.checkpoint, local_files_only=True
    )
    model.to(device)
    model.eval()

    image = Image.open(image_path).convert("RGB")
    print(f"Loaded image: {image_path} (size: {image.size})")
    inputs = processor(images=image, return_tensors="pt").to(device)

    print("Running semantic segmentation...")
    with torch.inference_mode():
        outputs = model(**inputs)

    prediction = processor.post_process_semantic_segmentation(
        outputs, target_sizes=[image.size[::-1]]
    )[0].cpu().numpy()
    class_ids = np.unique(prediction)
    labels = model.config.id2label
    class_names = [labels.get(int(class_id), str(class_id)) for class_id in class_ids]
    print(f"Segmentation complete. Classes: {', '.join(class_names)}")

    figure, axes = plt.subplots(1, 2, figsize=(12, 6))
    axes[0].imshow(image)
    axes[0].set_title("Original Image")
    axes[1].imshow(prediction, cmap="tab20", vmin=0, vmax=max(len(labels) - 1, 1))
    axes[1].set_title("Segmentation Mask")
    for axis in axes:
        axis.axis("off")
    figure.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()
