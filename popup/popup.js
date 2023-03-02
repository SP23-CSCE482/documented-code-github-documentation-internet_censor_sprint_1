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

  // create trash icon
  const removeIconElement = document.createElement('i');
  removeIconElement.classList.add('bi', 'bi-trash-fill');

  // delete element when trash icon is clicked
  removeIconElement.addEventListener('click', (e) => {
    const elementToDelete=e.target.parentElement.parentElement;
    removeWordFromDisplay(elementToDelete);
    // remove word from list
    removeWordFromArray(word);
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
 * Removes restricted word from array
 * @param {string} word - the word to add
 */
function removeWordFromArray(word) {
  const index = restrictedWords.indexOf(word);
  console.log('Index value:', index);
  restrictedWords.splice(index, 1);

  // save updated restrictedWords array to Chrome storage
  updateRestrictedWordsInStorage();

  logRestrictedWords();
}


/**
*For debugging purposes, shows log of restrictedWords array
*@param {array} result - returns coontents of chrome storage variable
**/
function logRestrictedWords() {
  chrome.storage.local.get(['restrictedWords'], function(result) {
    console.log('Updated restricted words:', result.restrictedWords);
  });
}


/**
*sets the restrictedWords array in the Chrome storage to the current value
* @param {array} restrictedWords - array of words
*/
function updateRestrictedWordsInStorage() {
  chrome.storage.local.set({restrictedWords: restrictedWords}, function() {
    console.log('Updated restricted words in storage:', restrictedWords);
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
      msg_content: {list: restrictedWords},
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

// example restricted words
const restrictedWords = ['violence', 'segmentation fault', /*'pain'*/];
chrome.storage.local.set({restrictedWords}, function() {
  console.log('Initial sensitive topicsm', restrictedWords);
});

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
  sendListToBackend();
});

// 'Add' button on topics screen adds topic to list
getElementFromId('button-add-word').addEventListener('click', () => {
  const inputValue = getElementFromId('section-choice-input').value;
  addWordToDisplay(inputValue);
  restrictedWords.unshift(inputValue);
  updateRestrictedWordsInStorage();
  getElementFromId('section-choice-input').value = '';
});

// make enter key add item to list
getElementFromId('section-choice-input').addEventListener('keypress', (e) => {
  if (e.key=='Enter') {
    const inputValue = getElementFromId('section-choice-input').value;
    addWordToDisplay(inputValue);
    restrictedWords.unshift(inputValue);
    updateRestrictedWordsInStorage();
    console.debug('Initial sensitive topicsm', restrictedWords);
    getElementFromId('section-choice-input').value = '';
  }
});

// 'Open settings' button on controls page
getElementFromId('button-open-settings').addEventListener('click', () => {
  console.debug('User clicked open settings button');
  chrome.runtime.openOptionsPage(()=>{});
});
