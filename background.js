// listen for 'messages' from extension and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.debug("Extension recieved message", request);

    let is_from_ext = chrome.runtime.id == sender.id;
    let is_valid = "msg_type" in request && "msg_content" in request;

    // handle message that has topics list
    if (is_from_ext && is_valid && "list" in request.msg_content && request.msg_type == "first_save_topics" && request.msg_content.list.length >= 1) {
        console.debug("Message has the topics list");

        // do something with topic list
        console.debug("Topics list is", request.msg_content.list);

        // send reply back to popup
        sendResponse({ status: "ok" });
    }

    // ignore all other messages
    else {
        console.error("Message is invalid");
        sendResponse({ status: "failed" });
    }
}
);