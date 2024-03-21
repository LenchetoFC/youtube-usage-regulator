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
    } else if (settingName === "free-video-count") {
      let freeVideoHTML = document.getElementById(settingName);
      freeVideoHTML.innerHTML = result;
    }
  })
});

/**
 * Converts time usage into an accurate time statement
 * 
 * @param {int} timeUsage - the value of the time usage storage value
 * 
 * @returns {string} Returns time usage in a statement that is accurate to the amount of time given
 * Time statements are dynamic meaning depending on the amount of time, they will include 
 *  time measurements (mins, hours, etc.) when needed  
 * 
 * @example let usageStatement = convertTimeToText(timeUsage);
 */
const convertTimeToText = (timeUsage) => {
  // if time usage is below a minute
  if (timeUsage < 60) {
    return `${timeUsage} seconds`;
  } else if (timeUsage >= 60) { // if time usage is above a minute
    let min = Math.floor(timeUsage / 60);
    let sec = Math.floor(timeUsage - min * 60);

    // if time usage is between a minute and an hour
    if (timeUsage < 3600) {
      return `${min} ${min === 1 ? "Minute" : "Minutes"} ${sec} Seconds`;
    } else if (timeUsage >= 3600) { // if time usage is above an hour
      let hours = Math.floor(timeUsage / 3600);
      let remainingMinutes = Math.floor((timeUsage - (hours * 3600)) / 60);
      return `${hours} Hr${hours !== 1 ? 's' : ''} ${remainingMinutes} ${remainingMinutes === 1 ? 'Min' : 'Mins'} ${sec} ${sec === 1 ? 'Sec' : 'Secs'}`;
    }
  }
}