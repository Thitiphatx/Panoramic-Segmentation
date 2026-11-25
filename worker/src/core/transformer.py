from collections import Counter

from PIL import Image


def colorize_mask(mask):
    image = Image.fromarray(mask.astype("uint8"), mode="P")
    palette = []
    for class_id in range(256):
        palette.extend(((class_id * 37) % 256, (class_id * 67) % 256, (class_id * 97) % 256))
    image.putpalette(palette)
    return image.convert("RGB")


def class_coverage(mask, labels):
    counts = Counter(int(value) for value in mask.reshape(-1))
    total = int(mask.size)
    return [
        {
            "class_id": class_id,
            "class_name": str(labels.get(class_id, labels.get(str(class_id), f"class_{class_id}"))),
            "pixel_count": count,
            "percentage": round(count * 100 / total, 4) if total else 0.0,
        }
        for class_id, count in sorted(counts.items())
    ]
