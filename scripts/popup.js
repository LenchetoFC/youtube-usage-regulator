// Author: Lorenzo Ramirez
// Date Created: 2023-09-05
// Purpose: This file is the popup for the extension
/**
 * @LenchetoFC 
 * @description This is the standard popup on toolbar to show
 *  the user's YouTube usasge, how many free videos they have left,
 *  and the ability to disable YouTube entirely
 * 
 */

/**
 * SECTION - STORAGE RELATED
 * 
 */
// All settings to get and display on standard popup
let settingsToGet = ["youtube-site", "all-time-usage", "today-usage"];

/**
 * Gets settings and appropriately changes UI
 */
settingsToGet.forEach((settingName) => {
  getSettings(settingName, (result) => {
    if (settingName === "youtube-site") {
      let youTubeSetting = document.querySelectorAll("form input")[0];

      // Visually displays the status of the setting
      if (result === true) {
        youTubeSetting.checked = true;
      } else {
        youTubeSetting.checked = false;
      }

      // Updates settings for whichever button is pushed
      youTubeSetting.addEventListener("click", (event) => {
        setSetting(youTubeSetting.name, youTubeSetting.checked.toString());
      });
    } else if (settingName === "all-time-usage") {
      // Converts seconds from all time usage storage value into accurate time statement
      let usageTime = convertTimeToText(result);

      // Updates all time usage value in popup
      let allTimeHTML = document.getElementById(settingName);
      allTimeHTML.innerHTML = usageTime;
    } else if (settingName === "today-usage") {
      // Converts seconds from all time usage storage value into accurate time statement
      let usageTime = convertTimeToText(result);

      // Updates current day's usage value in popup
      let todayTimeHTML = document.getElementById(settingName);
      todayTimeHTML.innerHTML = usageTime;
    }
    // else if (settingName === "free-video-count") {
    //   let freeVideoHTML = document.getElementById(settingName);
    //   freeVideoHTML.innerHTML = result;
    // }
  })
});

/** !SECTION */