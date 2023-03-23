// Function to censor keywords on the web page.
function censorKeywords(keywords) {
  // Get all the text nodes on the web page that are not part of a script or style element.
  const textNodes = document.evaluate(
    '//text()[not(ancestor::script)][not(ancestor::style)][not(ancestor::input)]',
    document,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  // Create a regex pattern with the keywords to be censored.
  const regex = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'gi');

  // Iterate through all the text nodes.
  for (let i = 0; i < textNodes.snapshotLength; i++) {
    const node = textNodes.snapshotItem(i);
    const textContent = node.textContent;

    // Check if the text node is part of Google search result elements.
    const isInGoogleSearchElement =
      node.parentElement.closest('div[data-async-context]') ||
      node.parentElement.closest('div[id="searchform"]');

    // Check if the text node contains any of the keywords to be censored.
    if (!isInGoogleSearchElement && regex.test(textContent)) {
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

// Observe DOM changes and re-run the censor function if any changes are detected.
function observeDOMChanges(keywords) {
  const observer = new MutationObserver(() => {
    censorKeywords(keywords);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}

// Function to fetch keywords from chrome.storage and call the censorKeywords function.
chrome.storage.local.get('keywords', function (result) {
  // Check if keywords are available in the storage.
  if (result.keywords) {
    // Get the enabled keywords from the storage.
    const keywords = Object.keys(result.keywords).filter(
      (keyword) => result.keywords[keyword]
    );

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
