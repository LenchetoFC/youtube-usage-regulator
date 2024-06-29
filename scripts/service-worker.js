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
  let currentDay = new Date().toDateString(); //Format: dayofweek month day year "Thu Apr 25 2024"

  // NOTE: Disabled !for now!
  // if (result["last-used-date"] != currentDay) {
  //   // Resets today-usage
  //   setSettingBG("today-usage", 0);
  //   setSettingBG("last-used-date", currentDay);
  //   console.log("TODAY USAGE RESET TO 0");
  // }

  console.log(result["last-used-date"]);

  // Sets default settings for all data
  if (result["last-used-date"] != undefined) {
    console.log("ON INSTALL: DEFAULT SETTINGS CREATED");

    const addictiveElements = {
      "all-pages": false, "home-page": false, "shorts-content": false, "home-btn": false, 
      "shorts-btn": false, "search-bar": false, "recommendations": false, 
      "recommendation-refresh": false, "autoplay-btn": false, "skip-btn": false
    };

    const quickActions = {
      "all-pages-quick": false, "home-page-quick": false, "shorts-content-quick": false, "home-btn-quick": false, 
      "shorts-btn-quick": false, "search-bar-quick": false, "recommendations-quick": false, 
      "recommendation-refresh-quick": false, "autoplay-btn-quick": false, "skip-btn-quick": false,
    };

    const scheduleDays = {
      "sunday": [false], "monday": [false], "tuesday": [false], "wednesday": [false], 
      "thursday": [false], "friday": [false], "saturday": [false]
    };

    const watchUsage = {
      "all-time": 0, "today": 0, "regular-video": 0, "shorts": 0, 
      "past-month-video": [], "past-month-shorts": [] 
    };

    setSettingBG("activities", []);
    setSettingBG("quick-actions", quickActions);
    setSettingBG("schedule-days", scheduleDays);
    setSettingBG("addictive-elements", addictiveElements);
    setSettingBG("watch-usage", watchUsage);
    setSettingBG("last-used-date", currentDay);
  }

});

// NOTE: Implement for when ext is updated to display patch notes
// chrome.runtime.onInstalled.addListener(() => {

// });



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
