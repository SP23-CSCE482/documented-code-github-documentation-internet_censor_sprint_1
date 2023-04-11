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

//////////////////////////////////////////////////////////////////////////////
    //Current working issue with text passing to toxicity model taking too long.
    //Uncomment the following code:
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
//////////////////////////////////////////////////////////////////////////////
    //requestAndCensor();

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




// example of how to get toxicity
setTimeout(async () => {
  let testString = "Your string goes here";
  
  const response = await chrome.runtime.sendMessage({
    msg_type: 'is_toxic',
    msg_content: {input: testString},
  });

  console.debug('Toxicity result is', response);

}, 5000);


 // example of censoring with batches

async function processBatch(batch, startIndex, inputElements, censoredMap, enabledCategories) {
  const results = await chrome.runtime.sendMessage({
    msg_type: 'is_toxic_batch',
    msg_content: { input: batch }
  });

  for (let i = 0; i < batch.length; i++) {
    const currentIndex = startIndex + i;
    const correspondingElement = inputElements[currentIndex];

    // Check if the element has already been censored and skip it
    if (censoredMap.get(correspondingElement)) {
      continue;
    }

    let shouldCensor = false;

    // loop over each enabled category
    for (let j = 0; j < enabledCategories.length; j++) {
      let attack_results = results.result[enabledCategories[j]].results;
      let result = attack_results[i];

      if (result.match) {
        shouldCensor = true;
        break;
      }
    }

    // if shouldCensor is true, censor the corresponding element
    if (shouldCensor) {
      // Mark the element as censored in the censoredMap
      censoredMap.set(correspondingElement, true);

      // Split the text content into sentences
      const sentences = correspondingElement.innerText.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [correspondingElement.innerText];

      // Clear the original element's content
      correspondingElement.innerHTML = '';

      // Iterate over the sentences and create a redacted span for each one
      sentences.forEach(sentence => {
          const tempElement = document.createElement('span');
          tempElement.className = 'redacted';
          tempElement.setAttribute('data-word', sentence);
          tempElement.innerText = sentence;
          correspondingElement.appendChild(tempElement);
      });
    }



  }
}


async function requestAndCensor(enabledCategories) {
  // Define the censoredMap
  const censoredMap = new WeakMap();
  // get all elements from page that are p tags, do not have the redacted class, and do not have any child elements
  // this will miss some elements, but good for now
  let inputElements = Array.from(document.querySelectorAll('p:not(.redacted):not(:has(*)), h1:not(.redacted):not(:has(*)), h2:not(.redacted):not(:has(*)), h3:not(.redacted):not(:has(*)), h4:not(.redacted):not(:has(*)), h5:not(.redacted):not(:has(*)), h6:not(.redacted):not(:has(*)), li:not(.redacted):not(:has(*))'));


  // Process each batch sequentially
  for (let startIndex = 0; startIndex < inputElements.length; startIndex += 30) {
    const batch = inputElements.slice(startIndex, startIndex + 30).map((element) => element.innerText);
    await processBatch(batch, startIndex, inputElements, censoredMap, enabledCategories);
  }
}



// Function to fetch contexttoggle and initialCatagories from chrome.storage and call the requestAndCensor function.
chrome.storage.local.get(['contexttoggle', 'catagories'], async function(result) {
  if (!result.contexttoggle) {
    // Create a new object with key-value pairs set to true
    const trueCatagories = Object.entries(result.catagories)
      .filter(([key, value]) => value === true)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    console.log("Enabled categories: ", Object.keys(trueCatagories));
    console.log("Enabled categories values: ", Object.values(trueCatagories));

    // Get the index values of the keys that return true in catagories
    const trueCatagoriesIndexes = Object.keys(result.catagories)
      .map((key, index) => (result.catagories[key] === true ? index : -1))
      .filter(index => index !== -1);

    console.log("True categories indexes: ", trueCatagoriesIndexes);
    await requestAndCensor(trueCatagoriesIndexes);
  }
});





