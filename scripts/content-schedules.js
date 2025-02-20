/**
 * @file settings-schedules.js
 * @description Controls the scheduling feature on webpages
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions...}
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/**
 * Gets current time as of execution
 *
 * @name getCurrentTime
 *
 * @returns {string} Returns the current time in a string format
 *
 * @example let currentTime = getCurrentTime();
 */
function getCurrentTime() {
  let currentDateTime = new Date();
  let currentHour = currentDateTime.getHours();
  let currentMinute = currentDateTime.getMinutes();

  return `${currentHour}:${currentMinute < 10 ? "0" : ""}${currentMinute}`;
}

/**
 * Checks stored schedule times and blocks YouTube accordingly
 *
 * @name checkSchedules
 *
 * @returns {void}
 *
 * @example checkSchedules();
 *
 * TODO: implement fullcalendar.io libary
 */
// function checkSchedules () {
//   // console.log("CHECKING SCHEDULE TIMES...");

//   // Settings IDs
//   let scheduleList = [
//     "sunday", "monday", "tuesday",
//     "wednesday", "thursday", "friday",
//     "saturday"
//   ];

//   // Empty array to store the boolean values when the current time is checked with schedule times
//   let blockYouTube = [];

//   // Gets current time (string) and day of the week (int - index of day of week i.e. Monday == 1)
//   let currentTime = getCurrentTime();
//   let currentDay = new Date().getDay();

//   TODO: get current day of week, filter records for just that day instead of iterating through all days

//   // Iterates through schedule days and only gets schedule times when it is the current day
//   // FIXME: if there's any time scheduled that day, it will block youtube
//   scheduleList.forEach(async (day, index) => {
//     console.log(currentDay, index, day)
//     if (currentDay === index) {
//       console.log(currentDay)
//       let times = await sendMessageToServiceWorker({operation: "retrieveNested", parentKey: "schedule-days", key: day});

//       console.log(`times: ${times}`)
//       // Checking if current time is within schedule times
//       if (times) { // All day schedule
//         blockYouTube.push(true);
//       } else if (times === false && times.length > 1) { // if all day is false and there is at least one scheduled interval
//         timesSelection = times.slice(1) // Only grabs the schedule intervals (array)

//         // Iterates through each schedule interval
//         timesSelection.forEach((time) => {
//           // Adds true value to blockYoutube array if current time is between interval
//           if (currentTime >= time[0] && currentTime <= time[1]) {
//             blockYouTube.push(true);
//           }

//         })
//       }
//     }
//     // Redirects user to blocked page if there is at least true value in blockYouTube array
//     //  & sets youtube-site restriction setting to true
//     if (blockYouTube.includes(true)) {
//       // console.log("WITHIN SCHEDULE TIMES. BLOCKING YOUTUBE");
//       // await sendSetSettingsMsg({operation: "set", key: 'scheduleOn', value: true});
//       //updateHTML("/html/blocked-page.html");
//       return;
//     } else {
//       // Sets youtube-site restriction to false if there are NO true values in blockYouTube array
//       // await sendSetSettingsMsg({operation: "set", key: 'scheduleOn', value: false});
//       // console.log("NOT WITHIN SCHEDULE TIMES");
//     }
//   })
// }

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(function () {
  // TODO: check schedule every second
  // Redirects user to dashboard from YouTube if a limited schedule is active
  // checkSchedules();
});
/** !SECTION */
