"""Application entry point for the segmentation worker."""

import logging
import os

from src.workers.segmentation_worker import run_worker


def main() -> None:
    logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
    run_worker()


if __name__ == "__main__":
    main()
