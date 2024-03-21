// chrome.action.setBadgeText({text: 'ON'});


/**
 * SECTION - STORAGE RELATED
 */

/**
 * Updates settings value
 * 
 * @param {string} key - settings name
 * @param {string} value - settings value
 * @param {string} callback - callback function to say it's successful and closes promise
 * 
 * @returns {void} Returns nothing
 * 
 * @example setSettingsBG(key, value, () => {return}))
 */
const setSettingBG = (key, value, callback) => {
  chrome.storage.sync.set({[key]: value}, callback);
}

// Checks day to reset today-usage to 0 
chrome.storage.sync.get(["last-used-date"], function(result) {
  // Send a response back to the content script
  let currentDay = new Date().toJSON().split("T")[0];
  
  if (result["last-used-date"] != currentDay) {
    setSettingBG("today-usage", 0);
    setSettingBG("last-used-date", currentDay);
    console.log("TODAY USAGE RESET TO 0");
  }
});

/**!SECTION */


/**
 * SECTION - MESSEGE LISTENERS
 */

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
  // Updates value of settings 
  else if (request.operation === "set") {
    setSettingBG(request.key, request.value, function() {
      // This callback function will be called when setSettingBG completes
      // Send a response back to the content script
      sendResponse({data: 'success'});
    });

    return true;
  }


  // Updates the current web page with HTML file
  if (request.redirect) {
    chrome.tabs.update(sender.tab.id, {url: chrome.runtime.getURL(request.redirect)});
    sendResponse({status: "success"});
  }
  return true;
});

/**!SECTION */
