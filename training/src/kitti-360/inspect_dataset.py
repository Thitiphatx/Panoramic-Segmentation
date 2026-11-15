"""Inspect a KITTI-360 image and its semantic annotation."""

import argparse
import os
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
from kitti360scripts.helpers.annotation import Annotation2D
from kitti360scripts.helpers.labels import id2label


REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DATASET_ROOT = REPOSITORY_ROOT / "datasets" / "KITTI-360"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dataset-root",
        type=Path,
        default=Path(os.environ.get("KITTI360_DATASET", DEFAULT_DATASET_ROOT)),
        help="KITTI-360 dataset root (defaults to KITTI360_DATASET or the repository dataset).",
    )
    parser.add_argument(
        "--sequence", default="2013_05_28_drive_0000_sync", help="Drive sequence name."
    )
    parser.add_argument("--camera", choices=("00", "01"), default="00")
    parser.add_argument(
        "--frame",
        default="0000000250",
        help="Frame number without .png (default: 0000000250).",
    )
    args = parser.parse_args()

    dataset_root = args.dataset_root.expanduser().resolve()
    relative_image = Path(args.sequence) / f"image_{args.camera}" / "data_rect" / f"{args.frame}.png"
    relative_label = Path(args.sequence) / f"image_{args.camera}" / "semantic" / f"{args.frame}.png"
    image_candidates = (
        dataset_root / "data_2d_raw" / relative_image,
        dataset_root / "data_images" / relative_image,
    )
    label_candidates = (
        dataset_root / "data_2d_semantics" / "train" / relative_label,
        dataset_root / "data_2d_semantics" / relative_label,
    )
    image_path = next((path for path in image_candidates if path.is_file()), image_candidates[0])
    label_path = next((path for path in label_candidates if path.is_file()), label_candidates[0])

    missing = [path for path in (image_path, label_path) if not path.is_file()]
    if missing:
        parser.error("missing dataset file(s): " + ", ".join(str(path) for path in missing))

    image = Image.open(image_path).convert("RGB")
    # The installed helper's constructor calls matplotlib.cm.get_cmap, which was
    # removed in newer Matplotlib releases. Semantic PNGs contain plain class
    # IDs, so use its palette renderer directly instead of loadInstance (which
    # expects packed IDs from the separate instance/ directory).
    annotation = Annotation2D.__new__(Annotation2D)
    annotation.semanticId = np.asarray(Image.open(label_path))
    annotation.toSemanticImage()
    semantic_ids = annotation.semanticId
    semantic_rgb = annotation.semanticImg.astype(np.uint8)

    if semantic_ids.shape != (image.height, image.width):
        parser.error(
            f"image and annotation dimensions differ: {image.size} vs "
            f"{(semantic_ids.shape[1], semantic_ids.shape[0])}"
        )

    present_ids = np.unique(semantic_ids)
    present_labels = [id2label[int(label_id)].name for label_id in present_ids if int(label_id) in id2label]
    print(f"Image: {image_path}")
    print(f"Semantic annotation: {label_path}")
    print("Classes: " + ", ".join(present_labels))

    figure, axes = plt.subplots(1, 2, figsize=(14, 5))
    axes[0].imshow(image)
    axes[0].set_title("KITTI-360 image")
    axes[1].imshow(semantic_rgb)
    axes[1].set_title("Semantic labels (official KITTI-360 palette)")
    for axis in axes:
        axis.axis("off")
    figure.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()
