const WORDS_KEY = 'keywords';
const SETUP_KEY = 'setup';
const TOGGLE_KEY = 'toggle';
const toggleButton = getElementFromId('button-toggle-active');

// Set up button state
chrome.storage.local.get(TOGGLE_KEY).then((result) => {
  const buttonState = result.toggle;
  if (buttonState) {
    toggleButton.classList.add('btn-success');
    toggleButton.textContent = 'Enable Censor';
  } else {
    toggleButton.classList.add('btn-danger');
    toggleButton.textContent = 'Disable Censor';
  }
});

let wordsObj = {};

// load restricted words
chrome.storage.local.get(WORDS_KEY).then((result) => {
  wordsObj = result.keywords;
  console.log(wordsObj);
  const wordArray = Object.keys(wordsObj);
  wordArray.forEach((element) => addWordToDisplay(element));
});

// element that represents the list of topics
const topicsList = document.getElementsByClassName('container-words')[0];

// Setup check
chrome.storage.local.get(SETUP_KEY).then((result) => {
  const initState = result.setup;
  if (!initState) {
    hideSection(getElementFromId('section-welcome'));
    showSection(getElementFromId('section-controls'));
  }
});

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
  const containerElement = document.createElement('div');
  const wordElement = document.createElement('div');
  const removeIconContainerElement = document.createElement('div');

  wordElement.innerText = word;
  containerElement.classList.add('word-container');

  removeIconContainerElement.classList.add('remove-icon-container');

  // create toggle icon
  const toggleElement = document.createElement('i');
  toggleElement.classList.add('bi');
  if (wordsObj[word] == true) {
    toggleElement.classList.add('bi-toggle-on');
  } else {
    toggleElement.classList.add('bi-toggle-off');
  }

  // delete element when trash icon is clicked
  toggleElement.addEventListener('click', (e) => {
    // flip state
    toggleElement.classList.toggle('bi-toggle-on');
    toggleElement.classList.toggle('bi-toggle-off');
    // save toggle flip
    toggleWordFromObj(word);
  });

  // add icon to div container
  removeIconContainerElement.appendChild(toggleElement);

  // create trash icon
  const removeIconElement = document.createElement('i');
  removeIconElement.classList.add('bi', 'bi-trash-fill');

  // delete element when trash icon is clicked
  removeIconElement.addEventListener('click', (e) => {
    const elementToDelete=e.target.parentElement.parentElement;
    removeWordFromDisplay(elementToDelete);
    // remove word from list
    removeWordFromObj(word);
  });

  // add icon to div container
  removeIconContainerElement.appendChild(removeIconElement);

  // add both containers to main container
  containerElement.appendChild(wordElement);
  containerElement.appendChild(removeIconContainerElement);

  // add assembled element to document
  topicsList.prepend(containerElement);

  console.debug('Added topics list display:', word);
}

/**
 * Removes a word from the display list.
 * @param {HTMLElement} element - element that contains the word to remove
 */
function removeWordFromDisplay(element) {
  element.remove();
}

/**
 * Removes restricted word from storage
 * @param {string} word - the word to remove
 */
function removeWordFromObj(word) {
  delete wordsObj[word];

  // save updated obj to Chrome storage
  chrome.storage.local.set({keywords: wordsObj});

  logRestrictedWords();
}

/**
 * Saves restricted word to storage
 * @param {string} word - the word to add
 */
function saveWordToObj(word) {
  wordsObj[word] = true;

  // save updated obj to Chrome storage
  chrome.storage.local.set({keywords: wordsObj});

  logRestrictedWords();
}

/**
 * Toggles word from storage
 * @param {string} word - the word to toggle
 */
function toggleWordFromObj(word) {
  wordsObj[word] = !wordsObj[word];

  // save updated obj to Chrome storage
  chrome.storage.local.set({keywords: wordsObj});

  logRestrictedWords();
}

/**
*For debugging purposes, shows all keys
*@param {array} result - returns coontents of chrome storage variable
**/
function logRestrictedWords() {
  chrome.storage.local.get(WORDS_KEY).then((result) => {
    wordsObj = result.keywords;
    console.log(wordsObj);
    const wordArray = Object.keys(wordsObj);
    console.log(wordArray);
  });
}

/**
 * Sends a message to the extension with the list of topics the user chose.
 */
function sendListToBackend() {
  console.debug('Popup will send sensitive topics list to extension');
  (async () => {
    const response = await chrome.runtime.sendMessage({
      msg_type: 'first_save_topics',
      msg_content: {list: 'test'},
    });
    console.debug('Popup recieved acknowledgement', response);
    if (response.status == 'ok') {
      hideSection(getElementFromId('section-choice'));
      hideSection(getElementFromId('section-welcome'));
      showSection(getElementFromId('section-controls'));
    } else {
      console.error('Extension did not acknowledge message');
    }
  })();
}

/**
 * Sends a message to the extension with the word to send to server.
 * @param {string} word
 */
async function sendWordToBackend(word) {
  (async () => {
    const response = await chrome.runtime.sendMessage({
      msg_type: 'server_call',
      msg_content: {word: word},
    });
    // GET all current keys
    let keyDict = {};
    chrome.storage.local.get(WORDS_KEY).then((result) => {
      keyDict = result.keywords;
    });
    console.debug('Popup recieved acknowledgement', response);
    if (response.status == 'ok') {
      const words = response.words;
      console.log(words);
      words.forEach((element) => {
        if (!(element in keyDict)) {
          saveWordToObj(element);
          addWordToDisplay(element);
        }
      });
    } else {
      console.error('Extension did not acknowledge message');
    }
  })();
}

// 'Set up custom topics' button shows the topic list screen
getElementFromId('button-continue-setup').addEventListener('click', () => {
  hideSection(getElementFromId('section-welcome'));
  showSection(getElementFromId('section-choice'));
  getElementFromId('section-choice-input').focus();
});

// 'Use defaults' button completes setup
getElementFromId('button-default-setup').addEventListener('click', () => {
  console.debug('User chose to use default configuration');
  sendListToBackend();
});

// 'Finish setup' button on topics screen completes setup
getElementFromId('button-finish-setup').addEventListener('click', () => {
  console.debug('User clicked finish setup button');
  chrome.storage.local.set({setup: false});
  sendListToBackend();
});

// Censor Toggle On and Off button
getElementFromId('button-toggle-active').addEventListener('click', () => {
  chrome.storage.local.get(TOGGLE_KEY).then((result) => {
    let state = result.toggle;
    console.log(state);
    state = !state;
    console.log(state);
    chrome.storage.local.set({toggle: state});
    toggleButton.classList.toggle('btn-danger');
    toggleButton.classList.toggle('btn-success');
    if (toggleButton.classList.contains('btn-danger')) {
      toggleButton.textContent = 'Disable Censor';
    } else {
      toggleButton.textContent = 'Enable Censor';
    }
  });
});

// 'Add' button on topics screen adds topic to list
getElementFromId('button-add-word').addEventListener('click', () => {
  const inputValue = getElementFromId('section-choice-input').value;
  // Call to server (word)
  saveWordToObj(inputValue);
  addWordToDisplay(inputValue);
  sendWordToBackend(inputValue);
  getElementFromId('section-choice-input').value = '';
});

// make enter key add item to list
getElementFromId('section-choice-input').addEventListener('keypress', (e) => {
  if (e.key=='Enter') {
    const inputValue = getElementFromId('section-choice-input').value;
    saveWordToObj(inputValue);
    addWordToDisplay(inputValue);
    sendWordToBackend(inputValue);
    getElementFromId('section-choice-input').value = '';
  }
});

// 'Open settings' button on controls page
getElementFromId('button-open-settings').addEventListener('click', () => {
  hideSection(getElementFromId('section-controls'));
  showSection(getElementFromId('section-choice'));
  getElementFromId('section-choice-input').focus();
});
