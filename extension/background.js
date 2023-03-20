// listen for 'messages' from extension and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug('Extension recieved message', request);

  const isFromExt = chrome.runtime.id == sender.id;
  const isValid = 'msg_type' in request && 'msg_content' in request;

  // handle message that has topics list
  if (isFromExt && isValid &&
    'list' in request.msg_content &&
    request.msg_type == 'first_save_topics' &&
    request.msg_content.list.length >= 1) {
    console.debug('Message has the topics list');

    // do something with topic list
    console.debug('Topics list is', request.msg_content.list);

    // send reply back to popup
    sendResponse({status: 'ok'});
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

  chrome.storage.local.get('keywords', function(result) {
    if (result.keywords) { // defined
      console.log(result.keywords);
    } else { // uninitialised
      chrome.storage.local.set({keywords: initialWords});
    }
  });
  logStorage();
});
