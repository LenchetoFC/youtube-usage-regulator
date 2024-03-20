// chrome.action.setBadgeText({text: 'ON'});

// Listens for request to get or set chrome storage
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Get value of settings 
  if (request.operation === "retrieve") {
    chrome.storage.sync.get([request.key], function(result) {
      // Send a response back to the content script
      sendResponse({data: result[request.key]});
    });

    return true;
  } 
  // Change value of settings 
  else if (request.operation === "set") {
    let save = {};
    save[request.key] = request.value;
    chrome.storage.sync.set(save);
    return true;
  }


  // Updates the current web page with HTML file
  if (request.redirect) {
    chrome.tabs.update(sender.tab.id, {url: chrome.runtime.getURL(request.redirect)});
    sendResponse({status: "success"});
  }
  return true;
});