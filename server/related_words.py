#!/usr/bin/env python3

import logging
import functools
import numpy as np
from preset_variables import (
    EMBED_DIMENSION,
    MAX_VOCAB_SIZE,
    MAX_RELATED_WORDS,
    MAX_CACHED_RELATED_WORDS,
    SKIP_CACHE_PRELOAD,
)


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


def get_stop_words_from_file() -> list[str]:
    logger.debug("Reading stop words from file...")
    with open("stop_word_list.txt", encoding="ascii", errors="replace") as stop_file:
        stop_words: list[str] = stop_file.read().splitlines()
    logger.debug("Accepted %s words from stop words list file.", f"{len(stop_words):,}")
    return stop_words


def load_data_from_file():
    local_vocab: list[str] = []
    local_embeddings = np.empty((MAX_VOCAB_SIZE, EMBED_DIMENSION), dtype=np.float16)

    stop_words: list[str] = get_stop_words_from_file()

    logger.debug("Reading words and embeddings from data file...")

    data_file_name = f"glove.6B.{EMBED_DIMENSION}d.txt"

    i = 0
    with open(data_file_name, encoding="ascii", errors="replace") as data_file:
        for line in data_file:
            if i == MAX_VOCAB_SIZE:
                break

            separated_line = line.strip().split()

            word = separated_line[0]

            if not word.isalpha():
                continue

            if word in stop_words:
                continue

            embeddings = np.array(separated_line[1:], dtype=np.float16)

            local_vocab.append(word)
            local_embeddings[i] = embeddings

            i += 1

    del stop_words

    logger.debug("Accepted %s words from data file.", f"{len(local_vocab):,}")

    return local_vocab, local_embeddings


def get_distance_between_words(word1: str, word2: str):
    return np.linalg.norm(
        EMBEDDINGS[get_word_index(word1)] - EMBEDDINGS[get_word_index(word2)], axis=1
    )


@functools.lru_cache(maxsize=512)
def get_word_index(input_word: str) -> int:
    return VOCAB.index(input_word)


@functools.lru_cache(maxsize=512)
def get_related_words_index(word_index: int) -> list[int]:
    if word_index < 0 or word_index > MAX_VOCAB_SIZE:
        return []

    distances = np.linalg.norm(EMBEDDINGS[word_index] - EMBEDDINGS, axis=1)

    # remove input word from calculation
    distances[np.argmin(distances)] = np.inf

    # get words with smallest distance
    nearest_indexes = np.argpartition(distances, MAX_RELATED_WORDS)[:MAX_RELATED_WORDS]

    # make list with distance, index, and word
    nearest_combined = [(distances[i], i) for i in nearest_indexes]

    del distances

    # sort by distance
    nearest_combined = sorted(nearest_combined)

    return [x[1] for x in nearest_combined]


def get_related_words(input_word: str) -> list[str]:
    logger.debug("Accepted word '%s' to search.", input_word)

    try:
        word_index = get_word_index(input_word)
    except ValueError:
        logger.warning("Word '%s' is not known.", input_word)
        word_index = -1

    result = get_related_words_index(word_index)

    logger.debug("Completed search for '%s' related words.", input_word)

    return [VOCAB[x] for x in result]


def cache_common_words() -> None:
    assert MAX_CACHED_RELATED_WORDS <= len(VOCAB)
    logger.debug(
        "Caching first %s entries in vocab...", f"{MAX_CACHED_RELATED_WORDS:,}"
    )
    for i in range(MAX_CACHED_RELATED_WORDS):
        get_related_words_index(i)
    logger.debug("Done caching vocab.")


VOCAB, EMBEDDINGS = load_data_from_file()


def is_word_in_vocab(word: str) -> bool:
    return word in VOCAB


if not SKIP_CACHE_PRELOAD:
    cache_common_words()
