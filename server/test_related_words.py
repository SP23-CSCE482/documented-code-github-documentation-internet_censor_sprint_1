import pytest
from related_words import (
    is_word_in_vocab,
    get_related_words,
    get_distance_between_words,
    VOCAB,
)


COMMON_WORDS: list[str] = [
    "phone",
    "address",
    "local",
    "news",
    "download",
    "south",
    "type",
    "county",
    "systems",
    "media",
    "design",
    "north",
    "sports",
    "family",
    "sign",
    "control",
    "current",
    "shipping",
    "internet",
    "office",
    "care",
    "game",
    "american",
    "total",
    "law",
    "project",
    "posted",
    "hotels",
    "security",
    "check",
    "link",
    "version",
    "special",
    "subject",
    "national",
    "technology",
    "file",
    "community",
    "forum",
    "women",
    "water",
    "network",
    "car",
    "posts",
    "pictures",
    "prices",
    "food",
    "history",
    "lamp",
    "house",
    "cable",
    "girl",
    "resources",
    "code",
    "access",
    "photo",
    "education",
    "military",
    "doctor",
]

UNCOMMON_WORDS: list[str] = ["acorn"]

STOP_WORDS: list[str] = [
    "because",
    "much",
    "want",
    "between",
    "open",
    "without",
    "with",
    "out",
    "those",
    "how",
    "many",
    "while",
    "using",
    "seen",
    "cannot",
    "do",
    "not",
    "see",
    "be",
    "the",
    "that",
    "is",
    "am",
    "are",
    "will",
    "tell",
    "few",
    "but",
    "for",
    "them",
    "we",
    "being",
    "in",
    "to",
    "been",
    "have",
    "has",
    "having",
    "had",
    "too",
    "went",
    "go",
    "going",
    "goes",
    "was",
    "were",
    "where",
    "who",
    "when",
    "at",
    "on",
    "after",
    "before",
    "do",
    "does",
    "me",
    "you",
    "they",
    "he",
    "she",
    "did",
    "doing",
    "way",
    "never",
    "always",
    "and",
    "or",
    "if",
    "else",
    "i",
    "new",
    "some",
    "someone",
    "sometimes",
    "somewhere",
    "off",
    "up",
    "under",
]


def test_vocab_size():
    assert len(VOCAB) > 0
    assert len(VOCAB) >= 100
    assert len(VOCAB) >= 500
    assert len(VOCAB) <= 100000


def test_vocab_validity():
    for item in VOCAB:
        assert isinstance(item, str)
        assert len(item) > 0
        assert len(item) <= 20
        assert item.isalpha()


@pytest.mark.parametrize("common_word", COMMON_WORDS)
def test_common_words_in_list(common_word: str):
    assert is_word_in_vocab(common_word)


@pytest.mark.parametrize("common_word", COMMON_WORDS)
def test_common_related_words_length(common_word: str):
    result = get_related_words(common_word)
    assert isinstance(result, list)
    assert len(result) >= 1
    assert len(result) <= 30


@pytest.mark.parametrize("uncommon_word", UNCOMMON_WORDS)
def test_uncommon_related_words_length(uncommon_word: str):
    result = get_related_words(uncommon_word)
    assert isinstance(result, list)
    assert len(result) == 0


@pytest.mark.parametrize("stop_word", STOP_WORDS)
def test_stopwords_related_words_length(stop_word: str):
    result = get_related_words(stop_word)
    assert len(result) == 0


@pytest.mark.parametrize(
    "target_word,related_word,unrelated_word",
    [
        ("easy", "difficult", "impossible"),
        ("food", "chicken", "rock"),
        ("food", "drink", "rock"),
        ("food", "donut", "lava"),
        ("phone", "laptop", "paper"),
        ("car", "truck", "person"),
        ("fire", "hot", "cold"),
        ("winter", "summer", "salsa"),
        ("winter", "cold", "hot"),
        ("winter", "snow", "fire"),
        ("danger", "chaos", "peace"),
        ("turtle", "slow", "fast"),
    ],
)
def test_basic_distances_between_words(
    target_word: str, related_word: str, unrelated_word: str
):
    related_word_dist: float = get_distance_between_words(target_word, related_word)
    unrelated_word_dist: float = get_distance_between_words(target_word, unrelated_word)
    assert related_word_dist > 0
    assert unrelated_word_dist > 0
    assert related_word_dist < unrelated_word_dist
