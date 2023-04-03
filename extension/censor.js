/**
 * Function to censor keywords on the web page.
 * @param {string[]} keywords - An array of keywords to be censored.
 */
function censorKeywords(keywords) {
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
  }, 1000); // Debounce time in milliseconds.

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
