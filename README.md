# Safe Internet Coalition

The Safe Internet Coalition presents a Google Chrome browser extension for content filtering boasting user defined keywords that act as filters. These keywords get passed through machine learning based models in order to get semantically associated words. On page loads, the extension then uses these keywords to find potentially triggering sections, censoring them. The extension also uses client-side machine learning predictions to find offensive content.

## Contents

- Instructions for end-users
    - Requirements
    - Installing the extension
- Information for developers about the browser extension
    - Initial setup
    - Building the extension
    - Running the tests
- Information for developers about the companion server deployment
    - Initial setup
        - Python virtual environment setup
        - Install dependencies
    - API usage
        - Request format
        - Response format
    - Tests
    - Implementation notes
        - Word distance calculation
        - Practical considerations
        - LRU cache
        - Logging
- CI/CD
- Contribution Guide

# Instructions for end-users

## Requirements

To use the browser extension, Google Chrome must be installed (version 110 or later) on your computer.

## Installing the extension

1. Open Chrome
2. Open the manage extension page `Extensions pop-up -> Manage Extensions`
3. Toggle on `Developer Mode` in the top right corner
4. In the top left corner, a button named `Load unpacked` should have appeared. Click on it.
5. Select the folder that holds `manifest.json` in it within the project code

The extension is now installed.

# Developer information (browser extension)

## Initial setup

Building the extension and running tests requires:
- `Node.js` (v14.21.3)
- `npm` (v6.14.18)

After cloning the repository, all dependencies can be installed with:
```bash
npm install
```

## Building the extension

Building the extension bundles important dependencies like `tfjs`. You can build the extension using:
```bash
# optimized build for production
npm run build-dist

# build for friendlier debugging
npm run build-dev
```

Running these commands creates a directory, `dist`, with the artifacts of the build.

## Running the tests

Run the test cases:
```bash
npm test
```

To run the linter:
```bash
npm lint
```

# Developer information (server deployment)

The server component of this project is a Python package meant to assist the browser extension with select machine learning predictions.

The latest deployment provides a publicly accessible API and exclusively handles processing for the related-words functionality, though it can be expanded to offload other operations.

At a high-level, the server uses the following Python modules:
- `gunicorn` and `flask` for simple routing from the application level
- `numpy` for vectorized operations
- `pytest` for tests

Additionally, the server uses pre-trained GloVe word embeddings (*Global Vectors for Word Representation*, 2014) to determine related words.

## Initial setup

### Python virtual environment setup

Before working on this project, consider creating a dedicated virtual environment with Python's `venv`:
```bash
python3 -m venv ./sic-server-venv
source ./sic-server-venv/bin/activate
```

### Install dependencies

The application relies on several Python modules. They are managed by `pip` and can be installed after activating the virtual environment using:
```bash
pip install -U -r requirements.txt
```

## API usage

### Request format

Getting a list of words related to an input word is as easy as sending an HTTP GET request to the server for:
```
/related-words/<your input word>/
```
The server listens on port 8080 by default.

### Response format

If the word in the request is valid and a prediction is made successfully, like in the case of `"salad"`, the server responds with HTTP status code `200 OK` and the following JSON:
```json
{
    "results": [
        "tomato",
        "pasta",
        "soup",
        "dish"
    ]
}
```
Note the `results` key is always an array of zero or more strings.

If the request is invalid or if an exception happens while performing the prediction, the server responds with an appropriate failed HTTP status code using Flask's `abort`, like:
- `400 Bad Request`
- `500 Internal Server Error`

The input is considered valid if it only contains letters and is not longer than twenty letters.

## Running the tests

You can run the test cases using:
```bash
pytest
```

## Implementation notes

### Word distance calculation

The application uses pre-trained embeddings in vector form to find related words by distance. The application uses `numpy` for these operations.

The distance between two words represented by $n$-dimensional vectors, say $V_{banana}$ and $V_{apple}$, is calculated by first finding the element-wise difference between the vectors then calculating the norm of the difference. This essentially yields the Euclidean distance between the words in the vector space. In Python, this can be computed using:
```python
# define embeddings of each word
e_banana = np.array([50, 30, 20, ...])
e_apple = np.array([30, 60, 10, ...])

# calculate the distance
difference = e_banana - e_apple
distance = np.linalg.norm(difference, ord=2)
```

When searching for related words, the distance of the input word to every other word in the vocabulary must be computed. The $k$ most related words then correspond to the $k$ smallest distances computed.

For the purposes of this project, $50 \leq n \leq 300$ and is limited to a few discrete options in this range by the pre-trained embeddings.

### Practical considerations

For performance reasons and for practicality, the application only considers the first couple thousand most common words used in English. For comparison, the pre-trained embeddings include 400,000 unique keys, though some may represent phrases, numbers, multiple words, or symbols that aren't useful to this project.

At build time, the application also excludes many common English words, like "the" and "get", because they appear too often to produce relevant and meaningful matches for words.

### LRU cache

The application uses a LRU (least recently used) cache via Python's `functools` for some functions. The cache allows the results from distance calculations to be stored temporarily to speed up subsequent requests for the same word. The expensive calculation described above is avoided when an item is found the cache.

### Logging

All aspects of the application use Python's `logging` facility throughout to capture information reliably and in a consistent format.

## CI/CD

A CI pipeline has been created for this repo. This involves running the linter and test cases after every commit. For more information, check [GitHub Actions](https://github.com/SP23-CSCE482/github-setup-internet_censor_sprint_1/actions).

## Contribution Guide

If you are interested in contributing and improving Safe Internet Coaltion, please take a look at our [Contribution Guide](https://github.com/SP23-CSCE482/documented-code-github-documentation-internet_censor_sprint_1/blob/main/CONTRIBUTING.md).
