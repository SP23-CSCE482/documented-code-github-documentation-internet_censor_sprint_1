#!/usr/bin/env python3

import subprocess
import os
import logging
from preset_variables import EMBED_DIMENSION, GLOVE_DATA_FILE_URL


def main():
    logger = logging.getLogger(__name__)
    logging.basicConfig(level=logging.DEBUG)

    subprocess.run(
        [
            "wget",
            "--no-verbose",
            "--tries",
            "3",
            "--https-only",
            "--no-clobber",
            "--output-document",
            "glove.zip",
            GLOVE_DATA_FILE_URL,
        ],
        check=True,
        timeout=60 * 20,
    )
    logger.info("Done downloading the data file.")

    subprocess.run(
        [
            "unzip",
            "glove.zip",
            f"glove.6B.{EMBED_DIMENSION}d.txt",
        ],
        check=True,
        timeout=60 * 20,
    )
    logger.info("Done unzipping.")

    os.remove("glove.zip")
    logger.info("Deleted unused zip file.")


if __name__ == "__main__":
    main()
