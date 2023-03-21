function censorWords(wordsToCensor) {
    const regexPatterns = wordsToCensor.map(
      (word) => new RegExp(`\\b${word}\\b`, "gi")
    );
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );
  
    const nodesToReplace = [];
  
    while (walker.nextNode()) {
      const node = walker.currentNode;
  
      for (const pattern of regexPatterns) {
        if (pattern.test(node.textContent)) {
          nodesToReplace.push({ node: node, pattern: pattern });
        }
      }
    }
  
    for (const item of nodesToReplace) {
      const node = item.node;
      const pattern = item.pattern;
      let textContent = node.textContent;
  
      textContent = textContent.replace(pattern, (match) => {
        const span = document.createElement("span");
        span.className = "redacted";
        span.textContent = match;
        span.setAttribute("data-word", match);
        return span.outerHTML;
      });
  
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = textContent;
      const parentNode = node.parentNode;
      let child;
  
      while ((child = tempDiv.firstChild)) {
        parentNode.insertBefore(child, node);
      }
  
      parentNode.removeChild(node);
    }
  }

  function fetchWordsAndCensor() {
    chrome.storage.local.get('keywords', (result) => {
      if (result.keywords) {
        const wordsToCensor = Object.keys(result.keywords).filter((word) => result.keywords[word]);
        censorWords(wordsToCensor);
      }
    });
  }





  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "censorWords") {
      fetchWordsAndCensor();
    }
  });




  fetchWordsAndCensor();
  