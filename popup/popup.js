console.debug("Entered popup.js");

/**
 * Returns the element representation of the id.
 * @param {string} element_id 
 * @returns {HTMLElement}
 */
function dom_id(element_id) {
    return document.getElementById(element_id);
}

/**
 * Shows the provided section element.
 * @param {HTMLElement} element - the element to show
 */
function show_section(element) {
    console.debug("show_section() called for " + element);
    element.style.display = "block";
}

/**
 * Hides the provided section element.
 * @param {HTMLElement} element - the element to hide
 */
function hide_section(element) {
    console.debug("hide_section() called for " + element);
    element.style.display = "none";
}

/**
 * Adds a word to the display element.
 * @param {string} word - the word to add
 */
function add_word_to_display(word) {
    console.debug("add_word_to_display()", "'" + word + "'");
    let element = document.createElement("span");
    element.innerText = word;
    topics_list.appendChild(element);
    console.debug("Added", "'" + word + "'", "to topics list display");
}

// example restricted words
let restricted_words = ["violence", "segmentation fault", "pain"];
console.info("Example restricted words are:", restricted_words.toString());

// element that represents the list of topics
const topics_list = document.getElementsByClassName("container-words")[0];

// add all words to display element
restricted_words.forEach((word) => { add_word_to_display(word); });
console.debug("All words from list added to display");

// make first button on welcome screen move to the next screen
dom_id("button-continue-setup").addEventListener("click", () => {
    hide_section(dom_id("section-welcome"))
    show_section(dom_id("section-choice"))
});
console.debug("Event listener created for button#button-continue-setup");

// make first button on words screen move to the next screen
dom_id("button-finish-setup").addEventListener("click", () => {
    hide_section(dom_id("section-choice"));
    show_section(dom_id("section-enabled"));
});
console.debug("Event listener created for button#button-finish-setup");

// make button add input as word
dom_id("button-add-word").addEventListener("click", () => {
    let input_value = dom_id("section-choice-input").value;
    add_word_to_display(input_value);
    restricted_words.push(input_value);
    dom_id("section-choice-input").value = "";
});
console.debug("Event listener created for button#button-add-word");

console.debug("Reached end of popup.js")
