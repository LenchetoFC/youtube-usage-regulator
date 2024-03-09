// chrome.action.setBadgeText({text: 'ON'});

// Listens for request to get chrome storage
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Get data from storage
  chrome.storage.sync.get([request.key], function(result) {
    // Send a response back to the content script
    sendResponse({data: result[request.key]});
  });

  return true;
});

// Updates the current web page with HTML file
// Request from content script 
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.redirect) {
    chrome.tabs.update(sender.tab.id, {url: chrome.runtime.getURL(request.redirect)});
    sendResponse({status: "success"});
  }
  return true;
});