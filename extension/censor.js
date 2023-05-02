/**
 * Function to censor keywords on the web page.
 * @param {string[]} keywords - An array of keywords to be censored.
 */
async function censorKeywords(keywords) {
  // If the keywords array is empty, do not proceed with the censoring.
  if (keywords.length === 0) {
    return;
  }
  // Get all the text nodes on the web page that are not part of a script or style element.
  const textNodes = document.evaluate(
      '//text()[not(ancestor::script)][not(ancestor::style)]',
      document,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null,
  );

  // Create a regex pattern with the keywords to be censored.
  const regex = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'gi');

  // Iterate through all the text nodes.
  for (let i = 0; i < textNodes.snapshotLength; i++) {
    const node = textNodes.snapshotItem(i);
    const textContent = node.textContent;

    // ////////////////////////////////////////////////////////////////////////////
    // Current working issue with text passing to toxicity model taking too long.
    // Uncomment the following code:
    // Check if the text node is toxic.
    /*
    t1 = performance.now();
    chrome.runtime.sendMessage({
      msg_type: 'is_toxic',
      msg_content: { input: textContent },
    }).then(result => console.log(result));
    t2 = performance.now();
    console.log(t2 - t1);
*/
    // ////////////////////////////////////////////////////////////////////////////
    // requestAndCensor();

    // Check if the text node contains any of the keywords to be censored.
    if (regex.test(textContent)) {
      // Replace the keywords with redacted elements.
      const newText = textContent.replace(regex, (match) => {
        const span = document.createElement('span');
        span.className = 'redacted';
        span.textContent = '****';
        span.dataset.word = match;
        return span.outerHTML;
      });

      // Create a document fragment with the new censored text and replace the original text node.
      const fragment = document.createRange().createContextualFragment(newText);
      node.parentNode.replaceChild(fragment, node);
    }
  }
}

/**
 * Debounce function to limit how often a function is called.
 * @param {Function} func - The function to be debounced.
 * @param {number} wait - The debounce delay in milliseconds.
 * @return {Function} - A debounced version of the given function.
 */
function debounce(func, wait) {
  let timeout;
  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(debounced, args);
    }, wait);
  };
}


/**
 * Observe DOM changes and re-run the censor function if any changes are detected.
 * @param {string[]} keywords - An array of keywords to be censored.
 * @return {MutationObserver} - A MutationObserver instance for observing DOM changes.
 */
function observeDOMChanges(keywords) {
  const debouncedCensorKeywords = debounce(() => {
    censorKeywords(keywords);
  }, 300); // Debounce time in milliseconds.

  const observer = new MutationObserver(debouncedCensorKeywords);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}


// Function to fetch keywords from chrome.storage and call the censorKeywords function.
chrome.storage.local.get('keywordtoggle', function(result) {
  if (!result.keywordtoggle) {
    chrome.storage.local.get('keywords', function(result) {
      // Check if keywords are available in the storage.
      if (result.keywords) {
        // Get the enabled keywords from the storage.
        const keywords = Object.keys(result.keywords).filter(
            (keyword) => result.keywords[keyword],
        );

        // If the keywords array is empty, do not proceed with the censoring.
        if (keywords.length === 0) {
          return;
        }

        // Get the current URL.
        const currentURL = window.location.href;

        // Check if the current URL is Twitter or Google Search.
        if (currentURL.includes('https://twitter.com') || currentURL.includes('https://www.google.com/search')) {
          console.log('Censoring disabled for Twitter and Google Search.');
          return;
        }

        // Call the censorKeywords function with the fetched keywords.
        censorKeywords(keywords);

        // Observe DOM changes and re-run the censor function when necessary.
        const observer = observeDOMChanges(keywords);

        // Disconnect the observer when the window is unloaded.
        window.addEventListener('unload', () => {
          observer.disconnect();
        });
      } else {
        console.error('No keywords found in storage');
      }
    });
  }
});


window.addEventListener('focus', () => {
  chrome.storage.local.get('contexttoggle', function(result) {
    if (!result.contexttoggle) {
      requestAndCensor();
    }
  });
});


/**
* Requests and censors text elements with specified enabledCategories.
* Processes a given number of text elements in batches with a delay between them.
* @function
* @param {Array<number>} enabledCategories - Array of enabled category indices to be checked for toxicity.
*/
function requestAndCensor(enabledCategories) {
  performance.mark('Starter'); // Start performance measurement
  maxElements = 105; // Limit the number of elements processed
  const batchSize = 10; // Processed batch size
  const batchDelay = 20; // Add a delay between batches (in milliseconds)

  // Select all text elements (p, h1, h2, h3, h4, h5, h6, li) that are not redacted and have no child elements
  let inputElements = Array.from(document.querySelectorAll('p:not(.redacted):not(:has(*)), h1:not(.redacted):not(:has(*)), h2:not(.redacted):not(:has(*)), h3:not(.redacted):not(:has(*)), h4:not(.redacted):not(:has(*)), h5:not(.redacted):not(:has(*)), h6:not(.redacted):not(:has(*)), li:not(.redacted):not(:has(*))'));
  console.log(inputElements.length);
  // have maxElements equal to the length of elements in the document
  maxElements = inputElements.length;

  inputElements = inputElements.slice(0, maxElements);

  /**
   * Processes a batch of elements starting from the given index.
   * Sends a message to the background to check the toxicity of the batch.
   * If the text is toxic, censor it.
   * @param {number} startIndex - The starting index for the batch to be processed.
   */
  function processBatch(startIndex) {
    if (startIndex >= inputElements.length) return; // Exit if the startIndex is out of bounds
    console.log('start Index', startIndex);

    // Create a batch of elements to process
    const batch = inputElements.slice(startIndex, startIndex + batchSize).map((element) => element.innerText);
    console.assert(batch.length <= batchSize);

    // Send a message to the background to check the toxicity of the batch
    chrome.runtime.sendMessage({
      msg_type: 'is_toxic_batch',
      msg_content: {input: batch},
    }).then((results) => {
      const toxicity_type = 1;
      let attack_results = results.result[toxicity_type].results;
      const trueCategories = enabledCategories;
      const temp = results;

      // Loop over each result in the batch
      for (let i = 0; i < attack_results.length; i++) {
        // Check the enabledCategories for each result
        for (let j = 0; j < trueCategories.length; j++) {
          attack_results = temp.result[trueCategories[j]].results;

          // If the text is toxic, censor it
          if (attack_results[i].match === true) {
            const correspondingElement = inputElements[startIndex + i];
            const tempElement = document.createElement('span');
            tempElement.className = 'redacted';

            tempElement.setAttribute('data-word', correspondingElement.innerText);
            tempElement.innerText = correspondingElement.innerText;

            correspondingElement.innerHTML = '';
            correspondingElement.appendChild(tempElement);
            break;
          }
        }
      }

      // Schedule the processing of the next batch after a delay
      setTimeout(() => processBatch(startIndex + batchSize), batchDelay);
    });
  }

  // Start processing the batch
  processBatch(0);
  performance.mark('Finisher'); // End performance measurement
  console.log(performance.measure('Runntimer', 'Starter', 'Finisher')); // Log the performance measurement
}


// requestAndCensor();


// Function to fetch contexttoggle and initialCatagories from chrome.storage and call the requestAndCensor function.
chrome.storage.local.get(['contexttoggle', 'catagories'], function(result) {
  if (!result.contexttoggle) {
    // Get the index values of the keys that return true in catagories
    const trueCatagoriesIndexes = Object.keys(result.catagories)
        .map((key, index) => (result.catagories[key] === true ? index : -1))
        .filter((index) => index !== -1);
    console.log('True categories indexes: ', trueCatagoriesIndexes);
    if (trueCatagoriesIndexes.length >= 1) {
      requestAndCensor(trueCatagoriesIndexes);
    }
  }
});
