import logging
from related_words import get_related_words
from flask import Flask, abort
from markupsafe import escape


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


logger.debug("Entered Flask app script.")


app = Flask(__name__)


@app.route("/related-words/<word>/")
def route_related_words(word):
    cleaned_input: str = escape(word)

    # return error if input is invalid
    if not cleaned_input.isalpha() or len(cleaned_input) > 20:
        abort(400)

    # make input lowercase for easier matching
    cleaned_input = cleaned_input.lower()

    try:
        return {"results": get_related_words(cleaned_input)}
    except Exception as error:
        logger.exception(error)
        abort(500)
