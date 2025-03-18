/**
 * @file global-functions.js
 * @description Contains all global functions that are used throughout all other JavaScript files
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @notes Functions
 * @see {@link module:global-functions.selectRecordByIdGlobal}
 * @see {@link module:global-functions.deleteRecordByIdGlobal}
 * @see {@link module:global-functions.selectAllRecordsGlobal}
 * @see {@link module:global-functions.insertRecordsGlobal}
 * @see {@link module:global-functions.updateRecordByPropertyGlobal}
 * @see {@link module:global-functions.resetTableGlobal}
 * @see {@link module:global-functions.displayNotifications}
 * @see {@link module:global-functions.getCurrentWatchMode}
 * @see {@link module:global-functions.convertTimeToText}
 * @see {@link module:global-functions.getCurrentWatchTimes}
 * @see {@link module:global-functions.getCurrentDate}
 * @see {@link module:global-functions.getTotalWatchTime}
 * @see {@link module:global-functions.redirectUser}
 * @see {@link module:global-functions.toggleButtonAnimation}
 *
 */

// TODO: split functions into separate respective javascript files

/**
 * SECTION - STORAGE RELATED
 */

/**
 * @description Sends a message to the service worker to fulfill specific requests, such as database changes.
 *
 * @name sendMessageToServiceWorker
 * @global
 *
 * @param {Object} message - An object containing the operation name and other properties to send to the service worker.
 * @param {string} message.operation - The name of the operation to perform.
 * @param {string} [message.table] - The name of the table to perform the operation on (if applicable).
 * @param {number} [message.index] - The index or ID of the record to select or delete (if applicable).
 * @param {string} [message.property] - The property to filter or update records by (if applicable).
 * @param {string|number|boolean} [message.value] - The value of the property to filter or update records by (if applicable).
 * @param {Object} [message.records] - The new record data to insert or update (if applicable).
 * @param {Object} [message.newRecords] - The new record data to update (if applicable).
 *
 * @returns {Promise<Object|Array|boolean>} A promise that resolves to the result of the operation, which can be storage objects or status response messages.
 *
 * @example
 * // Select a record by ID
 * let byIndex = await sendMessageToServiceWorker({
 *   operation: "selectRecordById",
 *   table: "schedules",
 *   index: 1,
 * });
 *
 * @example
 * // Insert new records
 * let insertResult = await sendMessageToServiceWorker({
 *   operation: "insertRecords",
 *   table: "watch-times",
 *   records: [{ id: 1, date: "2024-11-04", "total-watch-time": 6042 }],
 * });
 *
 * @notes
 * Supported operations (subject to change):
 * - 'selectRecordById'
 * - 'selectAllRecords'
 * - 'filterRecords'
 * - 'updateRecords'
 * - 'updateRecordByProperty'
 * - 'deleteRecordById'
 * - 'deletePropertyInRecord'
 * - 'insertRecords'
 */
window.sendMessageToServiceWorker = (message) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
};

/**
 * Sends a message to the service worker to filter records from the specified table
 * based on a given property and value. It waits for the promise to resolve and returns the filtered records.
 * If an error occurs, it logs the error to the console and returns false.
 *
 * @name filterRecordsGlobal
 * @global
 * @async
 *
 * @param {string} table - The name of the table to filter records from.
 * @param {string} property - The property to filter records by.
 * @param {string|number|boolean} value - The value of the property to filter records by.
 *
 * @returns {Promise<Array|boolean>} A promise that resolves to an array of filtered records, or false if an error occurs.
 *
 * @example
 * let filteredRecords = await filterRecordsGlobal("watch-times", "type", "long-form");
 */
window.filterRecordsGlobal = async (table, property, value) => {
  try {
    let filteredRecords = await sendMessageToServiceWorker({
      operation: "filterRecords",
      table: table,
      property: property,
      value: value,
    });

    if (!filteredRecords.error) {
      // console.log(filteredRecords);
      return filteredRecords;
    } else {
      throw new Error(filteredRecords);
    }
  } catch (results) {
    console.error(results.message);
    return results;
  }
};

/**
 * Sends a message to the service worker to reset the specified table to its default state.
 * It waits for the promise to resolve and returns the result.
 * If an error occurs, it logs the error to the console and returns false.
 *
 * @name resetTableGlobal
 * @global
 * @async
 *
 * @param {string} table - The name of the table to reset.
 *
 * @returns {Promise<Object|boolean>} A promise that resolves to the result of the reset operation, or false if an error occurs.
 *
 * @example
 * let result = await resetTableGlobal("watch-times");
 */
window.resetTableGlobal = async (table) => {
  try {
    let results = await sendMessageToServiceWorker({
      operation: "resetTable",
      table: table,
    });

    if (!results.error) {
      console.log("Table reset.");
      return results;
    } else {
      throw new Error(results.message);
    }
  } catch (error) {
    console.error(error.message);
    return { error: true, message: error.message };
  }
};

/**
 * Sends a message to the service worker to select all records from the specified table.
 * It waits for the promise to resolve and returns the result.
 * If an error occurs, it logs the error to the console and returns false.
 *
 * @name selectAllRecordsGlobal
 * @global
 * @async
 *
 * @param {string} table - The name of the table to select records from.
 *
 * @returns {Promise<Array|boolean>} A promise that resolves to an array of all records in the specified table, or false if an error occurs.
 *
 * @example
 * let allRecords = await selectAllRecordsGlobal("watch-times");
 */
window.selectAllRecordsGlobal = async (table) => {
  try {
    let results = await sendMessageToServiceWorker({
      operation: "selectAllRecords",
      table: table,
    });

    if (!results.error) {
      return results;
    } else {
      throw new Error(results);
    }
  } catch (results) {
    console.error(results.message);
    return results;
  }
};

/**
 * Sends a message to the service worker to select a record by its ID from the specified table.
 * It waits for the promise to resolve and returns the result.
 * If an error occurs, it logs the error to the console and returns false.
 *
 * @name selectRecordByIdGlobal
 * @global
 * @async
 *
 * @param {string} table - The name of the table to select the record from.
 * @param {number} id - The ID of the record to select.
 *
 * @returns {Promise<Object|boolean>} A promise that resolves to the record with the specified ID, or false if an error occurs.
 *
 * @example
 * let record = await selectRecordByIdGlobal("watch-times", 1);
 */
window.selectRecordByIdGlobal = async (table, id) => {
  try {
    let results = await sendMessageToServiceWorker({
      operation: "selectRecordById",
      table: table,
      index: id,
    });

    if (!results.error || results != null) {
      return results;
    } else {
      throw new Error(results);
    }
  } catch (results) {
    console.error(results.message);
    return results;
  }
};

/**
 * Sends a message to the service worker to update a record by a specified property and value in the specified table.
 * It waits for the promise to resolve and returns true if the update is successful.
 * If an error occurs, it logs the error to the console and returns false.
 *
 * @name updateRecordByPropertyGlobal
 * @global
 * @async
 *
 * @param {string} table - The name of the table to update the record in.
 * @param {string} property - The property to identify the record to update.
 * @param {string|number|boolean} value - The value of the property to identify the record to update.
 * @param {Object} newRecords - The new record data to update.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the update is successful, or false if an error occurs.
 *
 * @example
 * let result = await updateRecordByPropertyGlobal("youtube-limitations", "id", 1, { active: true });
 */
window.updateRecordByPropertyGlobal = async (
  table,
  property,
  value,
  newRecords
) => {
  try {
    let results = await sendMessageToServiceWorker({
      operation: "updateRecordByProperty",
      table: table,
      property: property,
      value: value,
      newRecords: newRecords,
    });

    if (!results.error) {
      return results;
    } else {
      throw { error: true, message: results.message };
    }
  } catch (error) {
    return error;
  }
};

/**
 * Sends a message to the service worker to delete a record by its ID from the specified table.
 * It waits for the promise to resolve and returns the result.
 * If an error occurs, it logs the error to the console and returns false.
 *
 * @name deleteRecordByIdGlobal
 * @global
 * @async
 *
 * @param {string} table - The name of the table to delete the record from.
 * @param {number} id - The ID of the record to delete.
 *
 * @returns {Promise<Object|boolean>} A promise that resolves to the result of the delete operation, or false if an error occurs.
 *
 * @example
 * let result = await deleteRecordByIdGlobal("watch-times", 1);
 */
window.deleteRecordByIdGlobal = async (table, id) => {
  try {
    let results = await sendMessageToServiceWorker({
      operation: "deleteRecordById",
      table: table,
      id: id,
    });

    if (!results.error) {
      return results;
    } else {
      throw new Error(results);
    }
  } catch (results) {
    console.error(results.message);
    return results;
  }
};

/**
 * Sends a message to the service worker to insert new records into the specified table.
 * It waits for the promise to resolve and returns the result.
 * If an error occurs, it logs the error to the console and returns false.
 *
 * @name insertRecordsGlobal
 * @global
 * @async
 *
 * @param {string} table - The name of the table to insert the records into.
 * @param {Array<Object>} newRecords - An array of new record objects to insert into the table.
 *
 * @returns {Promise<Object|boolean>} A promise that resolves to the result of the insert operation, or false if an error occurs.
 *
 * @example
 * let result = await insertRecordsGlobal("watch-times", [{ id: 1, date: "2024-11-04", "total-watch-time": 6042 }]);
 */
window.insertRecordsGlobal = async (table, newRecords) => {
  try {
    let results = await sendMessageToServiceWorker({
      operation: "insertRecords",
      table: table,
      records: newRecords,
    });

    if (!results.error) {
      return results;
    } else {
      throw new Error(results);
    }
  } catch (results) {
    console.error(results.message);
    return results;
  }
};

/**!SECTION */

/**
 * SECTION - WATCH TIME RELATED
 *
 */

/**
 * Converts time usage into an accurate time statement.
 * Time statements are dynamic meaning depending on the amount of time, they will include
 * time measurements (mins, hours, etc.) when needed.
 *
 * @name convertTimeToText
 * @global
 *
 * @param {int} timeUsage - The value of the time usage in seconds.
 *
 * @returns {string} Returns time usage in a statement that is accurate to the amount of time given.
 *
 * @example
 * let usageStatement = convertTimeToText(timeUsage);
 */
window.convertTimeToText = (timeUsage) => {
  if (timeUsage < 60) {
    return formatSeconds(timeUsage);
  } else if (timeUsage < 3600) {
    return formatMinutesAndSeconds(timeUsage);
  } else {
    return formatHoursAndMinutes(timeUsage);
  }
};

/**
 * Formats time usage in seconds.
 *
 * @param {int} timeUsage - The value of the time usage in seconds.
 *
 * @returns {string} Returns time usage in seconds.
 */
function formatSeconds(timeUsage) {
  return `0m <span class="counter-animation" data-num="${timeUsage}"></span>s`;
}

/**
 * Formats time usage in minutes and seconds.
 *
 * @param {int} timeUsage - The value of the time usage in seconds.
 * @param {boolean} abbrActive - A boolean indicating whether to use abbreviated time units.
 *
 * @returns {string} Returns time usage in minutes and seconds.
 */
function formatMinutesAndSeconds(timeUsage, abbrActive) {
  let min = Math.floor(timeUsage / 60);
  let sec = Math.floor(timeUsage - min * 60);
  return `<span class="counter-animation" data-num="${min}"></span>m <span class="counter-animation" data-num="${sec}"></span>s`;
}

/**
 * Formats time usage in hours and minutes.
 *
 * @param {int} timeUsage - The value of the time usage in seconds.
 *
 * @returns {string} Returns time usage in hours and minutes.
 */
function formatHoursAndMinutes(timeUsage) {
  let hours = Math.floor(timeUsage / 3600);
  let remainingMinutes = Math.floor((timeUsage - hours * 3600) / 60);
  return `<span class="counter-animation" data-num="${hours}"></span>hr <span class="counter-animation" data-num="${remainingMinutes}"></span>m`;
}

/**
 * Sends a message to the service worker to filter records from the "watch-times" table
 * based on the current date. It waits for the promise to resolve and returns the current day's watch time object.
 * If an error occurs, it logs the error to the console.
 *
 * @name getCurrentWatchTimes
 * @global
 * @async
 *
 * @returns {Promise<Object>} A promise that resolves to the current day's watch time object.
 *
 * @example
 * let currentWatchTimes = await getCurrentWatchTimes();
 */
window.getCurrentWatchTimes = async () => {
  try {
    let currentWatchTimeObj = await sendMessageToServiceWorker({
      operation: "filterRecords",
      table: "watch-times",
      property: "date",
      value: getCurrentDate(),
    });

    return currentWatchTimeObj;
  } catch (error) {
    console.error("Error fetching current watch times:", error);
  }
};

/**
 * Returns the current date in ISO standard format (yyyy-MM-dd).
 *
 * @name getCurrentDate
 * @global
 *
 * @returns {string} Returns current date in ISO standard format (yyyy-MM-dd).
 *
 * @example
 * let currentDate = getCurrentDate();
 */
window.getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Sends a message to the service worker to select all records from the "watch-times" table.
 * It calculates the total watch time by summing the "total-watch-time" property of each record.
 * It waits for the promise to resolve and returns the total watch time.
 * If an error occurs, it logs the error to the console.
 *
 * @name getTotalWatchTime
 * @global
 * @async
 *
 * @returns {Promise<number>} A promise that resolves to the total watch time.
 *
 * @example
 * let totalWatchTime = await getTotalWatchTime();
 */
window.getTotalWatchTime = async () => {
  try {
    let totalTime = 0;

    let totalWatchTimes = await sendMessageToServiceWorker({
      operation: "selectAllRecords",
      table: "watch-times",
    });

    for (let index in totalWatchTimes) {
      totalTime += totalWatchTimes[index]["total-watch-time"];
    }

    return totalTime;
  } catch (error) {
    console.error(error);
  }
};

/**!SECTION */

/** SECTION - WATCH MODE RELATED */

/**
 * Gets the active watch mode and its properties and inserts it into the DOM.
 * It sends a message to the service worker to filter records from the "watch-modes" table
 * based on the active property being true. It waits for the promise to resolve and returns the active watch mode.
 * If an error occurs, it logs the error to the console and returns false.
 *
 * @name getCurrentWatchMode
 * @async
 *
 * @returns {Promise<Object|boolean>} A promise that resolves to the active watch mode, or false if an error occurs.
 *
 * @example
 * let currentWatchMode = await getCurrentWatchMode();
 */
async function getCurrentWatchMode() {
  try {
    let data = await sendMessageToServiceWorker({
      operation: "filterRecords",
      table: "watch-modes",
      property: "active",
      value: true,
    });

    let currentWatchMode = data[0];

    if (currentWatchMode) {
      return currentWatchMode;
    } else {
      throw Error;
    }
  } catch (error) {
    // console.error(error);
    return false;
  }
}

/**!SECTION */

/** SECTION - NOTIFICATIONS RELATED */

/**
 * Displays a notification message with a specified icon, color, and delay time.
 * It uses jQuery animations to fade in and fade out the notification message.
 *
 * @name displayNotifications
 * @global
 *
 * @param {string} notifId - id of notification element to be modified
 * @param {string} msg - The notification message to display.
 * @param {string} hexColor - The color of the notification message.
 * @param {string} iconName - The name of the icon to display in the notification message.
 * @param {int} delayTime - The amount of time (in milliseconds) that the notification message shows before disappearing.
 * @param {boolean} [isPersistent=false] - A boolean indicating whether the notification message should persist.
 *
 * @returns {void}
 *
 * @example
 * displayNotifications("page-notif-msg", "Saved Successfully", "#40a6ce", "verified", 2000);
 */
window.displayNotifications = (
  notifId,
  msg,
  hexColor,
  iconName,
  delayTime,
  isPersistent = false
) => {
  // debugger;
  console.log(notifId, msg, hexColor, iconName, delayTime, isPersistent);
  // Prepare notification's message, color, and icon
  $(`#${notifId} .material-symbols-rounded`)
    .html(iconName)
    .css("color", hexColor);

  $(`#${notifId} p`).html(msg);

  $(`#${notifId}`).css("--notif-before-background", hexColor);

  const isVisible = $(`#${notifId}`).css("display") === "flex";

  // Trigger display animation
  if (!isPersistent && !isVisible)
    $(`#${notifId}`)
      .fadeIn(1000)
      .css("display", "flex")
      .delay(delayTime)
      .fadeOut(1000);
  else if (!isVisible) {
    $(`#${notifId}`).fadeIn(1000).css("display", "flex");
  }
};

/**!SECTION */

/** SECTION - YOUTUBE LIMITATIONS RELATED */

/**
 * Updates the HTML of the current web page with the specified HTML page.
 * It sends a message to the service worker to redirect the user to a specified HTML page.
 * It waits for the promise to resolve and logs the response or error to the console.
 *
 * @name redirectUser
 * @global
 *
 * @param {string} htmlPage - The path to the HTML page to be loaded.
 *
 * @returns {void}
 *
 * @example
 * redirectUser("/html/dashboard.html");
 *
 */
window.redirectUser = () => {
  chrome.runtime.sendMessage(
    { redirect: "/dashboard.html?redirected=true" },
    function (response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log(response);
      }
    }
  );
};

/**
 * Triggers an animation on any button when there's a process in the background
 *
 * @name toggleButtonAnimation
 * @global
 *
 * @param {string} buttonID - the element ID of the button for the animation to play on
 * @param {boolean} playAnimation - determines if the animation starts or stops
 *
 * @returns {void}
 *
 * @example
 * toggleButtonAnimation(`#save-schedule`, true);
 *
 */
window.toggleButtonAnimation = (buttonID, playAnimation) => {
  const $button = $(buttonID);

  $button.parent().toggleClass("spin-animation");
  $button.prop("disabled", playAnimation);
};

/**!SECTION */

// Hides overlay when it is clicked on
$("#overlay").on("click", function () {
  $(this).css("display", "none");
});

/**!SECTION */

/** SECTION - COUNTER ANIMATION */

/**
 * Gets the time integer from data-num and set --num property with it to initiate counter animation
 *
 * @name updateCounterAnimation
 *
 * @param {node} element - the element (should have 'counter-animation' class) to modify
 *
 * @returns {void}
 *
 * @example updateCounterAnimation(document.getElementsByClassName("counter-animation"))
 */
function updateCounterAnimation(element) {
  const num = parseInt(element.getAttribute("data-num"));
  element.style.setProperty("--num", 0); // Set to an intermediate value
  setTimeout(() => {
    element.style.setProperty("--num", num);
  }, 50); // Short delay to ensure the transition triggers
}

// Starts animation counter on load
$(document).ready(function () {
  // Update existing counter-animation elements
  document
    .querySelectorAll(".counter-animation")
    .forEach(updateCounterAnimation);

  // Set up a MutationObserver to watch for new counter-animation elements
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Update all counter-animation elements within the new node
            const allCounters = node.querySelectorAll(".counter-animation");

            allCounters.forEach(updateCounterAnimation);

            // If the node itself is a counter-animation element, update it as well
            if (node.classList.contains("counter-animation")) {
              updateCounterAnimation(node);
            }
          }
        });
      }
    }
  });

  // Start observing the document body for added nodes
  observer.observe(document.body, { childList: true, subtree: true });
});
/**!SECTION */
