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

    t1 = performance.now();
    chrome.runtime.sendMessage({
      msg_type: 'is_toxic',
      msg_content: { input: textContent },
    }).then(result => console.log(result));
    t2 = performance.now();
    console.log(t2 - t1);
    
//////////////////////////////////////////////////////////////////////////////

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



// example of how to get toxicity
setTimeout(async () => {
  let testString = "Your string goes here";
  
  const response = await chrome.runtime.sendMessage({
    msg_type: 'is_toxic',
    msg_content: {input: testString},
  });

  console.debug('Toxicity result is', response);

}, 5000);


/* // example of censoring with batches

function requestAndCensor() {
    // get all elements from page that are p tags, do not have the redacted class, and do not have any child elements
    // this will miss some elements, but good for now
    let inputElements = Array.from(document.querySelectorAll('p:not(.redacted):not(:has(*))'));

    // keep only first 30 elements
    inputElements = inputElements.slice(0, 30);

    // save the text from each element
    let batch = [];
    for (let element of inputElements) {
        batch.push(element.innerText);
    }
    console.assert(batch.length === inputElements.length);

    performance.mark("before_sending_message");

    // send message to extension with array of text
    chrome.runtime.sendMessage({
        msg_type: 'is_toxic',
        msg_content: { input: batch }
    }).then(results => {

        performance.mark("message_recv");
        console.log(performance.measure("Delay before recieving reply from extension", "before_sending_message", "message_recv"));

        // only consider insults
        const toxicity_type = 1;
        let attack_results = results.result[toxicity_type].results;

        // assert length of results is the same length as input
        console.assert(inputElements.length === attack_results.length);

        // loop over each result
        for (let i = 0; i < attack_results.length; i++) {
            let result = attack_results[i];

            // if result was true, censor the corresponding element
            if (result.match === true) {
                const correspondingElement = inputElements[i];
                const tempElement = document.createElement('span');
                tempElement.className = 'redacted';
                tempElement.innerText = '********';
                correspondingElement.innerHTML = '';
                correspondingElement.appendChild(tempElement);
            }
        }
    });

}

requestAndCensor();

*/