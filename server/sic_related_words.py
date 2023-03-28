import os
from embeddings import GloveEmbedding
import numpy as np
import logging


logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s", level=logging.DEBUG
)


def read_words_from_file() -> list[str]:
    accepted_words: list[str] = []
    with open("word_list.txt", encoding="utf-8") as list_file:
        for current_word in list_file:
            current_word = current_word.strip()

            if len(current_word) < 4:
                continue

            if not is_word_in_db(current_word):
                continue

            accepted_words.append(current_word)
    logging.debug(f"Read {len(accepted_words)} words from file.")
    return accepted_words


def get_related_words(input_word: str) -> list[str]:
    logging.debug(f"Accepted word '{input_word}' to search.")

    if not is_word_in_vocab(input_word):
        logging.debug(f"Word '{input_word}' is not known.")
        return [input_word]

    input_word_embeddings = np.array(EMBEDDINGS_DB.emb(input_word))

    distances = np.array(
        [
            np.linalg.norm(
                input_word_embeddings - np.array(EMBEDDINGS_DB.emb(x)), ord=2
            )
            for x in GLOBAL_VOCAB
        ]
    )

    output_list = []

    for i in range(int(os.environ["MAX_RETURNED_RELATED_WORDS"]) + 1):
        index_min = np.argmin(distances)
        if i != 0:
            output_list.append(GLOBAL_VOCAB[index_min])
        distances[index_min] = np.inf

    del distances

    logging.debug(f"Related words for '{input_word}' finished.")

    return output_list


def is_word_in_vocab(input_word: str) -> bool:
    return input_word in GLOBAL_VOCAB


def is_word_in_db(input_word: str) -> bool:
    query_result = EMBEDDINGS_DB.lookup(input_word)
    return query_result is not None


# make object to query local database of embeddings
EMBEDDINGS_DB: GloveEmbedding = GloveEmbedding(
    os.environ["GLOVE_MODEL_NAME"],
    d_emb=int(os.environ["GLOVE_MODEL_EMBEDDINGS_DIMENSION"]),
)
logging.debug("Loaded embeddings.")


GLOBAL_VOCAB: list[str] = read_words_from_file()
