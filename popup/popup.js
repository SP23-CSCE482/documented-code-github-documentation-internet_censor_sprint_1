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
    console.debug("Showing", element);
    element.style.display = "block";
}

/**
 * Hides the provided section element.
 * @param {HTMLElement} element - the element to hide
 */
function hide_section(element) {
    console.debug("Hiding", element);
    element.style.display = "none";
}

/**
 * Adds a word to the display element.
 * @param {string} word - the word to add
 */
function add_word_to_display(word) {
    let element = document.createElement("span");
    element.innerText = word;
    topics_list.appendChild(element);
    console.debug("Added topics list display:", word);
}

/**
 * Sends a message to the extension background with the final list of topics the user chose.
 */
function send_list_to_backend() {
    console.debug("Popup will send sensitive topics list to extension for processing");
    (async () => {
        const response = await chrome.runtime.sendMessage({
            msg_type: "first_save_topics",
            msg_content: { list: restricted_words }
        });
        console.debug("Popup recieved acknowledgement", response);
        if (response.status == "ok") {
            hide_section(dom_id("section-choice"));
            hide_section(dom_id("section-welcome"));
            show_section(dom_id("section-enabled"));
        } else {
            console.error("Extension did not acknowledge message");
        }
    })();
}

// example restricted words
let restricted_words = ["violence", "segmentation fault", "pain"];
console.info("Initial sensitive topics", restricted_words);

// element that represents the list of topics
const topics_list = document.getElementsByClassName("container-words")[0];

// add all words to display element
restricted_words.forEach((word) => { add_word_to_display(word); });

// 'Set up custom topics' button shows the topic list screen
dom_id("button-continue-setup").addEventListener("click", () => {
    hide_section(dom_id("section-welcome"));
    show_section(dom_id("section-choice"));
});

// 'Use defaults' button completes setup
dom_id("button-default-setup").addEventListener("click", () => {
    console.debug("User chose to use default configuration");
    send_list_to_backend();
});

// 'Finish setup' button on topics screen completes setup
dom_id("button-finish-setup").addEventListener("click", () => {
    console.debug("User clicked finish setup button");
    send_list_to_backend();
});

// 'Add' button on topics screen adds topic to list
dom_id("button-add-word").addEventListener("click", () => {
    let input_value = dom_id("section-choice-input").value;
    add_word_to_display(input_value);
    restricted_words.push(input_value);
    dom_id("section-choice-input").value = "";
});
