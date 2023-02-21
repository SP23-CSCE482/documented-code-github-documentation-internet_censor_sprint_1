/**
 * Returns the element representation of the id.
 * @param {string} elementId
 * @return {HTMLElement}
 */
function getElementFromId(elementId) {
  return document.getElementById(elementId);
}

/**
 * Shows the provided section element.
 * @param {HTMLElement} element - the element to show
 */
function showSection(element) {
  console.debug('Showing', element);
  element.style.display = 'block';
}

/**
 * Hides the provided section element.
 * @param {HTMLElement} element - the element to hide
 */
function hideSection(element) {
  console.debug('Hiding', element);
  element.style.display = 'none';
}

/**
 * Adds a word to the display element.
 * @param {string} word - the word to add
 */
function addWordToDisplay(word) {
  const element = document.createElement('span');
  element.innerText = word;
  topicsList.appendChild(element);
  console.debug('Added topics list display:', word);
}

/**
 * Sends a message to the extension with the list of topics the user chose.
 */
function sendListToBackend() {
  console.debug('Popup will send sensitive topics list to extension');
  (async () => {
    const response = await chrome.runtime.sendMessage({
      msg_type: 'first_save_topics',
      msg_content: {list: restrictedWords},
    });
    console.debug('Popup recieved acknowledgement', response);
    if (response.status == 'ok') {
      hideSection(getElementFromId('section-choice'));
      hideSection(getElementFromId('section-welcome'));
      showSection(getElementFromId('section-enabled'));
    } else {
      console.error('Extension did not acknowledge message');
    }
  })();
}

// example restricted words
const restrictedWords = ['violence', 'segmentation fault', 'pain'];
console.info('Initial sensitive topics', restrictedWords);

// element that represents the list of topics
const topicsList = document.getElementsByClassName('container-words')[0];

// add all words to display element
restrictedWords.forEach((word) => {
  addWordToDisplay(word);
});

// 'Set up custom topics' button shows the topic list screen
getElementFromId('button-continue-setup').addEventListener('click', () => {
  hideSection(getElementFromId('section-welcome'));
  showSection(getElementFromId('section-choice'));
});

// 'Use defaults' button completes setup
getElementFromId('button-default-setup').addEventListener('click', () => {
  console.debug('User chose to use default configuration');
  sendListToBackend();
});

// 'Finish setup' button on topics screen completes setup
getElementFromId('button-finish-setup').addEventListener('click', () => {
  console.debug('User clicked finish setup button');
  sendListToBackend();
});

// 'Add' button on topics screen adds topic to list
getElementFromId('button-add-word').addEventListener('click', () => {
  const inputValue = getElementFromId('section-choice-input').value;
  addWordToDisplay(inputValue);
  restrictedWords.push(inputValue);
  getElementFromId('section-choice-input').value = '';
});
