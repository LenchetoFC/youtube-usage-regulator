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

// All settings to get and display on standard popup
let settingsToGet = ["youtubeSite", "all-time-usage", "today-usage", "free-video-count"];

/**
 * Checks settings for disable youtube setting value
 * Visually show if setting is enabled or not
 * Adds event listener to button to change setting's value
 */
settingsToGet.forEach((settingName) => {
  getSettings(settingName, (result) => {
    switch (settingName) {
      case ("youtubeSite"):
        let youTubeSetting = document.querySelectorAll("form input")[0];

        // Visually displays the status of the setting
        if (result === "true") {
          youTubeSetting.checked = true;
        } else {
          youTubeSetting.checked = false;
        }
    
        // Updates settings for whichever button is pushed
        youTubeSetting.addEventListener("click", (event) => {
          setSetting(youTubeSetting.name, youTubeSetting.checked.toString());
        });

      case ("all-time-usage"):
        let allTimeHTML = document.getElementById(settingName);
        allTimeHTML.innerHTML = result;

      case ("today-usage"):
        let todayTimeHTML = document.getElementById(settingName);
        todayTimeHTML.innerHTML = result;

      case ("free-video-count"):
        let freeVideoHTML = document.getElementById(settingName);
        freeVideoHTML.innerHTML = result;
    }
  })
});