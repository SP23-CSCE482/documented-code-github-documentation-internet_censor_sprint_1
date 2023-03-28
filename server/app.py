import logging
from flask import Flask
from flask import abort
from markupsafe import escape
import sic_related_words


logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s", level=logging.DEBUG
)

logging.debug("Entered main script.")


app = Flask(__name__)


@app.route("/related-words/<word>/")
def route_related_words(word):
    cleaned_input: str = escape(word)

    # return status bad request if word contains anything but letters
    if not cleaned_input.isalpha():
        abort(400)

    # fail on long input
    if len(cleaned_input) > 20:
        abort(414)

    # make input lowercase for easier matching
    cleaned_input = cleaned_input.lower()

    reply: dict = {
        "what": "related-words",
        "input": cleaned_input,
    }

    try:
        reply["results"] = sic_related_words.get_related_words(cleaned_input)
        return reply
    except:
        logging.critical("Unspecific error while handling get_related_words()")
        abort(500)
