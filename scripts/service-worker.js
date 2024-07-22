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
  let save = {};
  save[key] = value;
  chrome.storage.sync.set(save, function() {
    getSettings(key, (result) => {
      console.log(`SETTINGS CHANGED: ${key} setting was changed to ${result[key]}`);
    });
  });
}

const getSettings = (key, callback) => {
  chrome.storage.sync.get([key][0], (result) => {
    callback(result[key]);
  });
}


const setNestedSettingBG = (parentKey, key, value, callback) => {
  chrome.storage.sync.get(parentKey, function(result) {
    if (!result[parentKey]) {
      result[parentKey] = {};
    }

    result[parentKey][key] = value;
    let save = {};
    save[parentKey] = result[parentKey];
    
    chrome.storage.sync.set(save, function() {
      getSettings(parentKey, (result) => {
        console.log(`SETTINGS CHANGED: ${parentKey}.${key} setting was changed to ${result[key]}`);
        if (typeof callback === 'function') {
          callback(result); // Execute the callback, passing the result as an argument
        }
      });
    });
  });
};

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
  if (result["last-used-date"] == undefined) {
    console.log("ON INSTALL: DEFAULT SETTINGS CREATED");

    const miscSettings = {
      "install-date": "", "last-used-date": "", "activities": [],
      "pause-video-on-blur": true, "additional-blocked-sites": {} 
    };

    const addictiveElements = {
      "all-pages": false, "home-page": false, "shorts-content": false, "home-btn": false, 
      "shorts-btn": false, "search-bar": false, "recommendations": false, 
      "recomm-refresh": false, "autoplay-btn": false, "skip-btn": false
    };

    const overallWatchTimes = {
      "total-history": [], "all-time": 0, "today": 0
    };

    const regularVideoWatchTimes = {
      "total-history": [], "all-time": 0
    };

    const shortsVideoWatchTimes = {
      "total-history": [], "all-time": 0
    };

    const quickActions = {
      "all-pages": false, "home-page": false, "shorts-content": false, "home-btn": false, 
      "shorts-btn": false, "search-bar": false, "recommendations": false, 
      "recomm-refresh": false, "autoplay-btn": false, "skip-btn": false
    };

    const scheduleActiveDays = {
      "sunday": false, "monday": false, "tuesday": false, "wednesday": false, 
      "thursday": false, "friday": false, "saturday": false
    };

    const scheduleAllDayActive = {
      "sunday": false, "monday": false, "tuesday": false, "wednesday": false, 
      "thursday": false, "friday": false, "saturday": false
    };

    const scheduleSunday = {};
    const scheduleMonday = {};
    const scheduleTuesday = {};
    const scheduleWednesday = {};
    const scheduleThursday = {};
    const scheduleFriday = {};
    const scheduleSaturday = {};

    const watchModesActive = {
      "recreational-mode": true, "educational-mode": false, "sfw-mode": false
    }

    const watchModesRestrictedTags = {
      "recreational-mode": [], "educational-mode": [], "sfw-mode": []
    }
    
    const watchModesAllowedTags = {
      "recreational-mode": [], "educational-mode": [], "sfw-mode": []
    }

    setSettingBG("misc-settings", miscSettings);
    setSettingBG("addictive-elements", addictiveElements);
    setSettingBG("overall-watch-times", overallWatchTimes);
    setSettingBG("regular-video-watch-times", regularVideoWatchTimes);
    setSettingBG("shorts-video-watch-times", shortsVideoWatchTimes);
    setSettingBG("quick-actions", quickActions);
    setSettingBG("schedule-active-days", scheduleActiveDays);
    setSettingBG("schedule-all-day-active", scheduleAllDayActive);
    setSettingBG("schedule-sunday", scheduleSunday);
    setSettingBG("schedule-monday", scheduleMonday);
    setSettingBG("schedule-tuesday", scheduleTuesday);
    setSettingBG("schedule-wednesday", scheduleWednesday);
    setSettingBG("schedule-thursday", scheduleThursday);
    setSettingBG("schedule-friday", scheduleFriday);
    setSettingBG("schedule-saturday", scheduleSaturday);
    setSettingBG("watch-modes-active", watchModesActive);
    setSettingBG("watch-modes-restricted-tags", watchModesRestrictedTags);
    setSettingBG("watch-modes-allowed-tags", watchModesAllowedTags);
  }

});

// NOTE: Implement for when ext is updated to display patch notes
// chrome.runtime.onInstalled.addListener(() => {

// });



/**
 * SECTION - MESSAGE LISTENERS
 */

// Listens for request to get or set chrome storage
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Get value of settings 
  if (request.operation === "retrieve") {
    chrome.storage.sync.get([request.key][0], function(result) {
      // Send a response back to the content script
      sendResponse({data: result[request.key]});
    });

    return true;
  } 

  else if (request.operation === "retrieveNested") {
    getSettings(request.parentKey, (result) => {
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
  else if (request.operation === "setNested") {
    setNestedSettingBG(request.parentKey, request.key, request.value, function() {
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