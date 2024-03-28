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

// Checks day to reset today-usage to 0 & free video count to 3
chrome.storage.sync.get(["last-used-date"], function(result) {
  let currentDay = new Date().toJSON().split("T")[0];
  
  if (result["last-used-date"] != currentDay) {
    // Resets today-usage
    setSettingBG("today-usage", 0);
    setSettingBG("last-used-date", currentDay);
    console.log("TODAY USAGE RESET TO 0");

    // // Resets free video count
    // chrome.storage.sync.get(["free-video-count"], function(result) {
    //   if (result["free-video-count"] != 3) {
    //     setSettingBG("free-video", 3);
    //     console.log("FREE VIDEO COUNT RESET TO 3");
    //   }
    // });
  }
});

// Sets default settings for all data
chrome.runtime.onInstalled.addListener(() => {
  console.log("ON INSTALL: DEFAULT SETTINGS CREATED");

  const settings = ["addictive-settings", "activities", "youtube-site", "home-page", 
                    "shorts-page", "home-button", "autoplay-button", "next-vid-btn",
                    "recommended-vids", "left-side-menu", "search-bar", "all-time-usage",
                    "today-usage", "schedule-sun", "schedule-mon", "schedule-tue",
                    "schedule-wed", "schedule-thu", "schedule-fri", "schedule-sat"
                  ];
  
  settings.forEach((setting) => {
    if (setting == "activities") setSettingBG(setting, []);
    else if (setting.includes("schedule-")) setSettingBG(setting, [false]);
    else if (setting.includes("-usage")) setSettingBG(setting, 0);
    else if (setting.includes("last-used-date")) setSettingBG(setting, "");
    else setSettingBG(setting, false);
  })

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
