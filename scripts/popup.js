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
    console.log(settingName);
    if (settingName === "youtubeSite") {
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
    } else if (settingName === "all-time-usage") {
      setSetting(settingName, 4000);
      let usageTime = "";
      // Convert seconds into usable time
      if (result < 60) {
        usageTime = `${result} seconds`;
      } else if (result >= 60) {
        let min = Math.floor(result / 60);
        let sec = Math.floor(result - min * 60);

        if (result < 3600) {
          usageTime = `${min} ${min === 1 ? "Minute" : "Minutes"} ${sec} Seconds`;
        } else if (result >= 3600) {
          let hours = Math.floor(result / 3600); // Calculate the hours
          let remainingMinutes = Math.floor((result - (hours * 3600)) / 60); // Calculate the remaining minutes
          usageTime = `${hours} Hr${hours !== 1 ? 's' : ''} ${remainingMinutes} ${remainingMinutes === 1 ? 'Min' : 'Mins'} ${sec} ${sec === 1 ? 'Sec' : 'Secs'}`;
          // usageTime = `${hours}:${remainingMinutes}:${sec}`;
        }
      }

      console.log(usageTime + "hfs");

      let allTimeHTML = document.getElementById(settingName);
      allTimeHTML.innerHTML = usageTime;
    } else if (settingName === "today-usage") {
      let todayTimeHTML = document.getElementById(settingName);
      todayTimeHTML.innerHTML = result;
    } else if (settingName === "free-video-count") {
      let freeVideoHTML = document.getElementById(settingName);
      freeVideoHTML.innerHTML = result;
    }
  })
});