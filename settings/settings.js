// Settings area script
console.log('Settings area'); ;



/**
 * Returns the element representation of the id.
 * @param {string} elementId
 * @return {HTMLElement}
 */
function getElementFromId(elementId) {
    return document.getElementById(elementId);
}




// Get restrictedWords from Chrome local storage API
function getRestrictedWordsFromStorage(callback) {
    chrome.storage.local.get(['restrictedWords'], function(result) {
      if (result && result.restrictedWords) {
        callback(result.restrictedWords);
      } else {
        callback([]);
      }
    });
  }


  getRestrictedWordsFromStorage(function(restrictedWords) {
    console.log('Retrieved restricted words from storage:', restrictedWords);
    // do something with the restrictedWords array
  });
  

// call chrome storage api for restrictedWords, 
const restrictedSettings = [];
chrome.storage.local.set({ restrictedWords: restrictedSettings }, function() {
  console.log('New array saved to Chrome Storage');
});


chrome.storage.local.get('restrictedWords', function(result) {
    const restrictedWords = result.restrictedWords;
    console.log(restrictedWords[2]); // will output the third element in the array
});



// Add event listener to the "button-add-word" button
document.getElementById('button-add-word').addEventListener('click', function() {
  
    // Retrieve the input value entered by the user in the text field
    const newWord = document.getElementById('section-choice-input').value;
  
    // Get the current restricted words array from Chrome storage
    chrome.storage.local.get(['restrictedWords'], function(result) {
      console.log(result); // Check what the result object contains
      const currentWords = result.restrictedWords || [];
  
      // Add the input value to the restrictedWords array
      currentWords.push(newWord);
  
      // Store the updated restrictedWords array in Chrome storage
      chrome.storage.local.set({restrictedWords: currentWords}, function() {
        console.log('Added new sensitive topic:', newWord);
      });
  
      // Update the UI to display the newly added sensitive topic
      const wordContainer = document.createElement('div');
      wordContainer.classList.add('word-container');
      wordContainer.innerHTML = `
        <div>${newWord}</div>
        <div class="remove-icon-container">
          <i class="bi bi-toggle-on"></i>
          <i class="bi bi-trash-fill"></i>
        </div>
      `;
      console.log('Testing words yo');


    // Ensures trash icon works for user added words
      wordContainer.querySelector('.bi-trash-fill').addEventListener('click', function() {
        wordContainer.remove();
      });
      getElementFromId('section-choice-input').value = '';
      document.querySelector('.container-words').appendChild(wordContainer);
    });
});





//delete word when trash icon is clicked
const trashIcons = document.querySelectorAll('.bi-trash-fill');

trashIcons.forEach(function(trashIcon) {
  trashIcon.addEventListener('click', function(event) {
    // Find the word-container element that contains the trash icon that was clicked
    const wordContainer = event.target.closest('.word-container');
    
    // Remove the entire word-container element from the DOM
    wordContainer.remove();
  });
});


// toggles on off switch.
function toggleIcon(icon) {
    icon.classList.toggle('bi-toggle-on');
    icon.classList.toggle('bi-toggle-off');
}


// Add click event listener to toggle icons
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('bi-toggle-on') || event.target.classList.contains('bi-toggle-off')) {
      event.target.classList.toggle('bi-toggle-on');
      event.target.classList.toggle('bi-toggle-off');
    }
});