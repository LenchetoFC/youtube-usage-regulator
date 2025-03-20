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
 * SECTION - RESTRICTION SCHEDULE CHECKS
 */
/**
 * Inserts restriction event into popup html
 *
 * @name getCurrentTime
 *
 * @returns {object} object of current date and time
 *
 * @example const currentDayObj = getCurrentTime();
 */
function getCurrentTime() {
  const currentDay = new Date();
  const dayObj = {
    day: currentDay.getDay(),
    hour: currentDay.getHours(),
    minute: currentDay.getMinutes(),
  };

  return dayObj;
}

/**
 * Check if the current time is within a schedule timeframe for current day
 *
 * @name isActiveSchedule
 *
 * @param {object} dayObj { day, hour, minute }
 *
 * @returns {boolean} boolean value of if there is an active schedule
 *
 * @example
 * const dayObj = getCurrentTime();
 * const isActive = await isActiveSchedule(dayObj);
 */
async function isActiveSchedule({ day, hour, minute }) {
  // Gets if the current day has an active all-day value
  const allDayEvents = await filterRecordsGlobal("schedule-days", "dayId", day);
  const isAllDay = allDayEvents[0]["all-day"];

  // If all day schedule is active, skip rest of code and return true
  if (isAllDay) {
    return true;
  }

  // Formats current time as 'hh:mm:ss'
  const minutes = minute.toString().padStart(2, "0");
  const currentTime = `${hour}:${minutes}:00`;

  // Gets schedule events that happen within the day
  const events = await filterRecordsGlobal("schedule-events", "dayId", day);
  for (const { startTime, endTime } of events) {
    // Check if the current time falls within the event's start and end time
    if (currentTime > startTime && currentTime < endTime) {
      return true;
    }
  }

  return false;
}

/**
 * Checks stored schedule times and blocks YouTube accordingly
 *
 * @name checkSchedules
 *
 * @returns {boolean} isActive - boolean value of if there are any currently active schedules
 *
 * @example checkSchedules();
 *
 */
async function checkSchedules() {
  // console.log("Checking for active schedules...");

  // Gets current time (string) and day of the week (int - index of day of week i.e. Monday == 1)
  const dayObj = getCurrentTime();

  const isActive = await isActiveSchedule(dayObj);

  return isActive;
}

/** !SECTION */

/** SECTION - YOUTUBE LIMITATION APPLICATIONS */

/**
 * Gets all active and scheduled limitations and applies relevant limitations to YouTube page
 *
 * @name youtubeLimitations
 *
 * @returns {void}
 *
 * @example youtubeLimitations();
 *
 */
async function youtubeLimitations() {
  // Gets always active limitations from storage
  const allActiveLimitations = await filterRecordsGlobal(
    "youtube-limitations",
    "active",
    true
  );

  // Gets all scheduled limitations from storage
  const allScheduledLimitations = await filterRecordsGlobal(
    "youtube-limitations",
    "followSchedule",
    true
  );

  // If any always active limitations exist, apply them
  // Checks if any schedules are currently active
  const isActive = await checkSchedules();
  if (isActive && allScheduledLimitations)
    applyLimitations(allScheduledLimitations);

  // If any schedule limitations exist, apply them
  if (allActiveLimitations) applyLimitations(allActiveLimitations);
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */

$(document).ready(async function () {
  youtubeLimitations();
});

// Reapplies limitations when navigating between pages
window.addEventListener("yt-navigate-finish", async function () {
  youtubeLimitations();
});

/** !SECTION */
