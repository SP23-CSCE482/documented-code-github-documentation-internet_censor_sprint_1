const url = 'https://sic-ml-flask-835897784448932748-8zjyn.ondigitalocean.app/related-words/';

/**
 * Makes the call to server finding nine related words to the original.
 * @param {string} url
 * @return {string} results
 */
async function callToServer(url) {
  const result = await fetch(url).then((response) => response.json());
  return result.results;
}

/**
 * Handles the word call and sends the response back to the popup.
 * @param {string} word
 * @param {json} sendResponse
 */
async function wordsCall(word, sendResponse) {
  const urlrequest = url + word + '/';
  console.log(urlrequest);

  // Do request
  const array = await callToServer(urlrequest);
  console.log(array);
  sendResponse({status: 'ok', words: array});
}

/**
 * Gets toxicity of input and sends result to caller
 * @param {string} inputString string to get toxicity
 * @param {*} sendResponse 
 */
async function getToxicityAndReply(inputString, sendResponse) {
  const toxicityPrediction = await ToxicityClassifier.isToxic(inputString);
  sendResponse({ status: 'ok', result: toxicityPrediction });  
}

// listen for 'messages' from extension and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug('Extension recieved message', request);

  const isFromExt = chrome.runtime.id == sender.id;
  const isValid = 'msg_type' in request && 'msg_content' in request;

  if (isFromExt && isValid) {

    // handle message that has topics list
    if ('list' in request.msg_content &&
    request.msg_type == 'first_save_topics' &&
    request.msg_content.list.length >= 1) {
      console.debug('Message has the topics list');

      // do something with topic list
      console.debug('Topics list is', request.msg_content.list);

      // send reply back to popup
      sendResponse({status: 'ok'});
    }

    // handle message for related words server call
    else if ('word' in request.msg_content &&
    request.msg_type == 'server_call') {
      const word = request.msg_content.word;
      wordsCall(word, sendResponse);
      return true;
    }

    // handle message for toxicity prediction
    else if (request.msg_type === 'is_toxic' && 'input' in request.msg_content) {
      console.debug("Background script accepted message for toxicity prediction");
      const inputString = request.msg_content.input;      
      getToxicityAndReply(inputString, sendResponse);
      return true;
    }

    // handle message that has required parts but contents are not valid
    else {
      console.error('Message is invalid');
      sendResponse({ status: 'failed' });
    }

  } else {
    // ignore all other messages
    console.error('Message is invalid');
    sendResponse({status: 'failed'});
  }
});

/**
 * Logs to console all data elements in local or synced storage
 */
function logStorage() {
  if (chrome.storage) {
    chrome.storage.local.get(function(data) {
      console.log('chrome.storage.local:');
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log(data);
      }
      chrome.storage.sync.get(function(data) {
        console.log('chrome.storage.sync:');
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log(data);
        }
      });
    });
  } else {
    console.warn('chrome.storage is not accessible, check permissions');
  }
}

// initialization
chrome.runtime.onInstalled.addListener(() => {
  // first extension startup values
  const initialWords = {
    'violence': true,
    'murder': true,
    'suicide': true}; // Nothing wrong with literals

  const initialCatagories = {
    'identity attack': true,
    'insult': true,
    'obscene': true,
    'severe toxicity': true,
    'sexual explicit': true,
    'threat': true,
    'toxicity': true,
  };

  chrome.storage.local.get('keywords', function(result) {
    if (result.keywords) { // defined
      console.log(result.keywords);
    } else { // uninitialised
      console.log('HERE');
      chrome.storage.local.set({keywords: initialWords});
      chrome.storage.local.set({catagories: initialCatagories});
      chrome.storage.local.set({setup: true});
      chrome.storage.local.set({keywordtoggle: false});
      chrome.storage.local.set({contexttoggle: false});
    }
  });
  logStorage();
});
