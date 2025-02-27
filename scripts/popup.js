/**
 * @file settings-website-blocker.js
 * @description Standard popup on toolbar to show the user's YouTube usage,
 *  and the ability to enable any limitation they set to appear here.
 *
 * @version 1.0.0
 * @date original: 2023-09-05
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.displayNotifications}
 * @see {@link module:global-functions.getCurrentWatchMode}
 * @see {@link module:global-functions.updateRecordByPropertyGlobal}
 * @see {@link module:global-functions.convertTimeToText} x2
 * @see {@link module:global-functions.getCurrentWatchTimes}
 * @see {@link module:global-functions.getTotalWatchTime}
 */

/**
 * SECTION - RESTRICTION EVENTS
 */

/**
 * Checks if the current time is within an event timeframe
 *
 * @name checkActiveRestrictionEvent
 *
 * @returns {boolean} whether or not there is an active restriction event
 *
 * @example let isEventActive = checkActiveRestrictionEvent();
 */
async function checkActiveRestrictionEvent() {
  const { day, hour, minute } = getCurrentTime();
  const currentTime = `${hour}:${minute}:00`;

  const events = await filterRecords("schedule-events", "dayId", day);
  const sortedEvents = sortStartTimes(events);

  // To capture if an event is active; if none found, false is default
  let isEventActive = false;

  // Checks if any schedule days are active
  const currentScheduleDay = await filterRecords("schedule-days", "dayId", day);
  const isActive = currentScheduleDay[0]["all-day"] === true;
  if (isActive) {
    isEventActive = true;
    return isEventActive;
  }

  // Iterate through each event and find if the current time is within an event timeframe
  for (const key in sortedEvents) {
    const { startTime, endTime } = sortedEvents[key];

    // Finds whether or not there is an active event, then breaks out of loop
    if (startTime < currentTime && endTime > currentTime) {
      isEventActive = true;
      break;
    }
  }

  return isEventActive;
}

/**
 * Reformats 'yyyy-mm-dd' to 'mm.dd.yyyy, www'
 *
 * @name reformatDateToText
 *
 * @param {string} dateValue - the watch time date in format 'yyyy-mm-dd'
 *
 * @returns {string} the watch time date in format 'mm.dd.yyy, www' i.e. 6.24.2012, Sun
 *
 * @example
 * let newDateFormat = reformatDateToText("2024-11-06");
 */
function reformatDateToText(dateValue) {
  let date = new Date(dateValue);

  let dateObj = {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),

    // Gets 3-letter day of week text, removes comma from end
    dayOfWeek: date.toUTCString().split(" ").slice(0, 1)[0].replace(/,/g, ""),
  };

  return ` ${dateObj.month}.${dateObj.day}.${dateObj.year}, ${dateObj.dayOfWeek}`;
}

/**
 * Gets the target date using a dayId value
 *
 * @name getDateOfWeek
 *
 * @param {int} dayId - the integer of day of week value
 *
 * @returns {date object} Date object of target date
 *
 * @example let newDateFormat = getDateOfWeek(4);
 */
function getDateOfWeek(dayId) {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  let difference = dayId - currentDay;

  // If dayId is less than currentDay, it's in the next week
  if (difference < 0) {
    difference += 7;
  }

  // Clone the currentDate object and set it to the target date
  const targetDate = new Date(currentDate);
  targetDate.setDate(currentDate.getDate() + difference);

  return targetDate;
}

/**
 * Sorts events according to startTimes in ascending order
 *
 * @name sortStartTimes
 *
 * @param {array} eventArray - array of restriction event objects
 *
 * @returns {array} array of sorted event objects
 *
 * @example const events = await filterRecords("schedule-events", "dayId", dayId);
 *          const sortedEvents = sortStartTimes(events);
 */
function sortStartTimes(eventArray) {
  eventArray.sort((a, b) => {
    const timeA = a.startTime.split(":").join("");
    const timeB = b.startTime.split(":").join("");
    return timeA - timeB;
  });

  return eventArray;
}

/**
 * Gets the next restriction event following the current day and time
 *
 * @name getNextRestrictionEvent
 *
 * @param {int} dayId - the integer of day of week value
 * @param {object} dayObj - object containing all properties about event from database
 *
 * @returns {date object} Date object of date value within the same week
 *
 * @example let nextEvent = await getNextRestrictionEvent(dayId, dayObj);
 */
async function getNextRestrictionEvent(dayId, dayObj) {
  // Formats current time as 'hh:mm:ss'
  const { day, hour, minute } = dayObj;
  const currentTime = `${hour}:${minute}:00`;

  // To capture next event object; undefined until then
  let nextEvent;

  // Checks if the day or following days are all day events
  const scheduleDay = await filterRecords("schedule-days", "dayId", dayId);
  const isAllDayEvent = scheduleDay[0]["all-day"];
  const isDayActive = scheduleDay[0]["active"];

  // Ends function early if the day isn't active at all
  if (!isDayActive) {
    return nextEvent;
  } else if (isAllDayEvent) {
    // Ends function early if the day is active all day
    nextEvent = scheduleDay[0];
    return nextEvent;
  }

  // Get all current days events
  // Sort events by startTime value in ascending order
  const events = await filterRecords("schedule-events", "dayId", dayId);
  const sortedEvents = sortStartTimes(events);

  // Iterate through each event and find the next time (if exists in this day)
  for (const key in sortedEvents) {
    const { startTime } = sortedEvents[key];

    // Captures next event object and breaks out of loop
    // if the start time is past current time AND its from the current day
    // or gets the very first event found in a following day
    if ((startTime > currentTime && day === dayId) || day != dayId) {
      nextEvent = sortedEvents[key];
      break;
    }
  }

  // Return next event; returns 'undefined' if no next event is found within the current day
  return nextEvent;
}

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
 * Generate a list of numbers that act as day IDs that wraps around the week
 *
 * @name generateDayOrder
 *
 * @param {int} dayId - starting number
 *
 * @returns {array} array of day IDs
 *                   i.e. dayObj.day = 4 makes [4,5,6,0,1,2,3]
 *
 *
 * @example const dayOrder = generateDayOrder(dayId);
 *
 */
function generateDayOrder(dayId) {
  let dayOrder = [];
  const totalDays = 7;

  // Iterate through days, wrapping around the week
  for (let i = 0; i < totalDays; i++) {
    dayOrder.push((dayId + i) % totalDays);
  }

  return dayOrder;
}

/**
 * Inserts restriction event into popup html
 *
 * @name insertRestrictionEvent
 *
 * @returns {void}
 *
 * @example insertRestrictionEvent();
 */
async function insertRestrictionEvent() {
  // Finds next restriction event
  const dayObj = getCurrentTime();
  let nextEvent;

  // Gets order of days that wraps around a week
  // i.e. dayObj.day = 4 makes [4,5,6,0,1,2,3]
  let dayOrder = generateDayOrder(dayObj.day);

  // Iterate through all days of week to find the next event (if exist)
  for (let day = 0; day < dayOrder.length; day++) {
    const dayId = dayOrder[day];
    nextEvent = await getNextRestrictionEvent(dayId, dayObj);

    // If nextEvent is not undefined (i.e. any object), break loop
    if (nextEvent) {
      break;
    }
  }

  // if nextEvent is still undefined (i.e. no scheduled events at all), end function
  if (nextEvent == undefined) {
    return;
  }

  // Gets event values (startTime, endTime, dayId)
  const $eventContainer = $("#restriction-event");
  const { dayId } = nextEvent;
  const date = reformatDateToText(getDateOfWeek(dayId));
  $eventContainer.find("#date").html(date);

  // Inserts event details into html
  if (nextEvent["all-day"] === true) {
    $eventContainer.find("p:has(#start-time)").html("All Day");
  } else {
    const { startTime, endTime } = nextEvent;
    $eventContainer.find("#start-time").html(startTime);
    $eventContainer.find("#end-time").html(endTime);
  }
}

/** !SECTION */

/**
 * SECTION - WATCH TIMES
 */

/**
 * Get total watch time and today's watch time, reformats them, and inserts them into DOM
 *
 * @name insertWatchTimes
 *
 * @returns {null}
 *
 * @example getWatchTimes();
 */
function insertWatchTimes() {
  // Gets the total watch time for the current day
  getCurrentWatchTimes()
    .then(async (data) => {
      if (data.length != 0) {
        let todayTime = data[0]["total-watch-time"];
        $(`#today-watch-time`).html(convertTimeToText(todayTime));
      } else {
        $(`#today-watch-time`).html("0 Seconds");
      }
    })
    .catch((error) => {
      $(`#today-watch-time`).html(error);
      console.error(error);
    });

  // Calculates all total watch times from all days
  getTotalWatchTime()
    .then((totalTime) => {
      $(`#total-watch-time`).html(convertTimeToText(totalTime));
    })
    .catch((error) => {
      $(`#total-watch-time`).html(error);
      console.error(error);
    });
}

/** !SECTION */

/**
 * SECTION - RESTRICTED/UNRESTRICTED TAG
 */
/**
 * Updates restricted tag based on if there is an active restriction event
 * or any limitations are set to "always active"
 *
 * @name updateRestrictedTag
 *
 * @returns {void}
 *
 * @example updateRestrictedTag();
 */
async function updateRestrictedTag() {
  // Checks if the current time is within a restriction event timeframe (i.e. any active events)
  const isEventActive = await checkActiveRestrictionEvent();

  // Gets the amount of 'always active' limitations
  const activeLimitations = await getActiveSettings("youtube-limitations", [
    "active",
  ]);
  const isAnyActive = Object.values(activeLimitations).length > 0;

  // Updates tag styles based on any of the above conditions
  const $tagContainer = $("#restriction-status");
  if (isEventActive || isAnyActive) {
    $tagContainer.addClass("active");
    $tagContainer.html("Restricted");
  } else {
    $tagContainer.addClass("inactive");
    $tagContainer.html("Unrestricted");
  }
}

/** !SECTION */

/**
 * SECTION - QUICK LIMITATIONS
 */

/**
 * Reformats website type into a header. "social-media" -> "Social Media"
 *
 * @name reformatSettingName
 *
 * @param {string} name - website type from database - "social-media"
 *
 * @returns {string} reformattedName - "Social Media"
 *
 * @example reformatWebsiteType(`social-media`);
 */
function reformatSettingName(name) {
  // Split the string by hyphens
  let splitArray = name.split("-");

  // Capitalize the first letter of each word and join them with spaces
  let reformattedName = splitArray
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  return reformattedName;
}

/**
 * Get all active quick activations for youtube limitations
 *
 * @name getActiveQuickActivations
 * @async
 *
 * @returns {array} Returns array of objects with active quick activations
 *
 * @example let allQuickActivations = getActiveQuickActivations();
 */
async function insertQuickLimitations() {
  function generatePopupLimitationHTML(limitation) {
    const { id, name, active } = limitation;

    let checked = active ? "checked" : "";

    // Creates new html element for each quick activation
    return `
      <div class="checkbox-item" data-limitation-name="${name}">
        <label>
        <input id="${name}" name="${name}" type="checkbox" value="${id}" ${checked} />
        <span for="${name}">${reformatSettingName(name)}</span>
      </label>
      </div>`;
  }

  // Attach event listeners to every quick activation button on form
  async function attachQuickActEvents() {
    $("#active-popup-limitations input").on("click", async function () {
      try {
        const $isActive = $(this).is(":checked");
        const $id = $(this).attr("value");

        const tableName = "youtube-limitations";
        const newRecord = { active: $isActive, id: parseInt($id) };

        const results = await updateDatabase(tableName, newRecord);

        if (results.error) {
          throw { error: true, message: updateResult.message };
        } else {
          displayNotifications(
            "Refresh YouTube to apply changes",
            "#7b3ed2",
            "verified",
            2500
          );
        }
      } catch (error) {
        console.log(error);

        displayNotifications(
          "Unsuccessfully updated. Check error logs.",
          "#d92121",
          "release_alert",
          5000
        );
      }
    });
  }

  /** MAIN BODY */
  // Get all active popup limitations
  const propertyToCheck = ["popup"];
  const allActivePopupLimitations = await getActiveSettings(
    "youtube-limitations",
    propertyToCheck
  );

  // Removes quick activation section if there are no buttons to add
  if (Object.keys(allActivePopupLimitations).length === 0) {
    $(".popup-section:has(#active-popup-limitations)").remove();
    return true;
  }

  // Iterate through each limitation and insert them into html
  for (const index in allActivePopupLimitations) {
    const limitation = allActivePopupLimitations[index];

    // Generate the HTML for each limitation option
    const baseHtml = generatePopupLimitationHTML(limitation);
    const $limitationContainer = `<div class="limitations-container"></div>`;

    // jQuery objects for form and limitation containers
    const $formContainer = $("#active-popup-limitations");
    const $lastChildContainer = $formContainer
      .find(".limitations-container")
      .last();

    // If there are two children in the last limitation-container,
    // create a new container
    if ($lastChildContainer.children().length !== 2) {
      $lastChildContainer.append(baseHtml);
    } else {
      $formContainer.append($($limitationContainer).append(baseHtml));
    }
  }

  // Attaches event listeners to each button after they are all appended to avoid double listeners per element
  attachQuickActEvents();
}

/** !SECTION */

/**
 * SECTION - CURRENT WATCH MODE
 */

/**
 * Get active watch mode and its properties and inserts it into DOM
 *
 * @name insertCurrentWatchMode
 * @async
 *
 * @returns {null}
 *
 * @example insertCurrentWatchMode();
 */
/** NOTE: inactive until watch mode feature is fully implemented */
// async function insertCurrentWatchMode() {
//   try {
//     const data = await getCurrentWatchMode();
//     $(".current-watch-mode").html(data.name);
//     $(".current-watch-mode").css("--mode-color-bg", data.color);
//     return true;
//   } catch (error) {
//     console.error(error);
//     return false;
//   }
// }

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(async function () {
  /** Get all active quick activations records, toggle active quick activation checkboxes, and update YT UI example */
  insertQuickLimitations();

  /** Gets total and today's watch times and inserts it into popup */
  insertWatchTimes();

  /** NOTE: inactive until watch mode feature is fully implemented */
  /** Gets current watch mode and inserts it into popup */
  // insertCurrentWatchMode();

  /** Gets and inserts next restriction event */
  // $("#restriction-status").on("click", function () {
  insertRestrictionEvent();
  // });

  /** Updates restricted/unrestricted tag based on if there are any 'always active' limitations or active restriction events */
  updateRestrictedTag();
});

/** !SECTION */
