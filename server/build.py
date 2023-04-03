import subprocess
import os
import logging
from embeddings import GloveEmbedding


os.makedirs(os.environ["EMBEDDINGS_ROOT"], exist_ok=True)
logging.info("Created embeddings directory.")

current_info = GloveEmbedding.settings
current_settings = current_info[os.environ["GLOVE_MODEL_NAME"]]
current_info[os.environ["GLOVE_MODEL_NAME"]] = GloveEmbedding.GloveSetting(
    os.environ["GLOVE_DATA_FILE_URL"],
    current_settings.d_embs,
    current_settings.size,
    current_settings.description,
)
logging.info("Replaced URL in GloveEmbedding setting.")

logging.info("Starting embeddings download...")
GloveEmbedding(
    os.environ["GLOVE_MODEL_NAME"],
    d_emb=int(os.environ["GLOVE_MODEL_EMBEDDINGS_DIMENSION"]),
    show_progress=False,
)
logging.info("Embeddings download finished.")

logging.info("Downloading word list...")
subprocess.run(
    [
        "wget",
        "--no-verbose",
        "-t",
        "3",
        "-O",
        "word_list.txt",
        os.environ["ENGLISH_WORD_LIST_FILE_URL"],
    ],
    check=True,
    timeout=120,
)
logging.info("Done downloading the word list.")

os.remove(
    os.environ["EMBEDDINGS_ROOT"] + "/glove/" + os.environ["GLOVE_MODEL_NAME"] + ".zip"
)
