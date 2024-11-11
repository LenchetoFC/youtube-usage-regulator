// TODO: make a note for each function about which file its called and how many times its called
// TODO: add all storage related functions (basically just the sendMessageToServiceWorker code that other files would do)

/**
 * SECTION - STORAGE RELATED
 */

/** FUNCTION: Sends message to service worker to fulfill specific requests, such as database changes
 * NOTE: all operations (subject to change): 'selectRecordById', 'selectAllRecords', 'filterRecords', 'updateRecords',
 *        'updateRecordByProperty', 'deleteRecordById', 'deletePropertyInRecord', and 'insertRecords'
 *
 * @param {object} message - holds the operation name and other properties to send to servicer worker
 *
 * @returns {various} - can return storage objects or status response messages
 *
 * @example let byIndex = await sendMessageToServiceWorker({operation: "selectRecordById", table: "schedules", index: 1, });
 *
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

/** ASYNC FUNCTION: Update a specific record by ID
 *
 * @param {int} id - record id i.e. 1
 *
 * @param {array} newRecords - records, can be some or all properties
 *        within an existing table  i.e. { allDay: true }
 *
 * @returns {boolean} Returns if the process was successful or not
 *
 * @example await updateLimitationsDB(3, { quick-add: true });
 */
// window.updateLimitationsDB = async (id, newRecords) => {
//   console.log(
//     `Updating limitations DB for id: ${id} with new records: ${JSON.stringify(
//       newRecords
//     )}`
//   );
//   try {
//     let sendUpdatedRecords = await sendMessageToServiceWorker({
//       operation: "updateRecordByProperty",
//       table: "youtube-limitations",
//       property: "id",
//       value: id,
//       newRecords: newRecords,
//     });

//     if (!sendUpdatedRecords.error) {
//       console.log(
//         `Record updated successfully for table youtube-limitations with property id, ${id} with new records ${JSON.stringify(
//           newRecords
//         )}.`
//       );
//       return true;
//     } else {
//       throw Error;
//     }
//   } catch (error) {
//     console.error(`Error updating limitations DB for id: ${id}`, error);
//     return false;
//   }
// };

/**
 * filterRecords x 4
 * resetTable x 2
 * selectAllRecords x 3
 * selectRecordById x 2
 * updateRecordByProperty x 3
 * deleteRecordById
 * insertRecords x 2
 */
window.filterRecordsGlobal = async (table, property, value) => {
  try {
    let filteredRecords = await sendMessageToServiceWorker({
      operation: "filterRecords",
      table: table,
      property: property,
      value: value,
    });

    return filteredRecords;
  } catch (error) {
    console.error(error);
    return false;
  }
};

window.resetTableGlobal = async (table) => {
  try {
    // let result = await sendMessageToServiceWorker({
    await sendMessageToServiceWorker({
      operation: "resetTable",
      table: table,
    });

    // return result;
  } catch (error) {
    console.error(error);
    // return false;
  }
};

window.selectAllRecordsGlobal = async (table) => {
  try {
    let allRecordsInTable = await sendMessageToServiceWorker({
      operation: "selectAllRecords",
      table: table,
    });

    return allRecordsInTable;
  } catch (error) {
    console.error(error);
    return false;
  }
};

window.selectRecordByIdGlobal = async (table, id) => {
  try {
    let recordsWithId = await sendMessageToServiceWorker({
      operation: "selectRecordById",
      table: table,
      index: id,
    });

    return recordsWithId;
  } catch (error) {
    console.error(error);
    return false;
  }
};

window.updateRecordByPropertyGlobal = async (
  table,
  property,
  value,
  newRecords
) => {
  try {
    let sendUpdatedRecords = await sendMessageToServiceWorker({
      operation: "updateRecordByProperty",
      table: table,
      property: property,
      value: value,
      newRecords: newRecords,
    });

    if (!sendUpdatedRecords.error) {
      console.log(
        `Record updated successfully for table youtube-limitations with property id, ${value} with new records ${JSON.stringify(
          newRecords
        )}.`
      );
      return true;
    } else {
      throw Error;
    }
  } catch (error) {
    console.error(`Error updating limitations DB for id: ${value}`, error);
    return false;
  }
};

window.deleteRecordByIdGlobal = async (table, id) => {
  try {
    console.log(table);
    console.log(id);
    let result = await sendMessageToServiceWorker({
      operation: "deleteRecordById",
      table: table,
      id: id,
    });

    console.log(result);

    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
};

window.insertRecordsGlobal = async (table, newRecords) => {
  try {
    let result = await sendMessageToServiceWorker({
      operation: "insertRecords",
      table: table,
      records: newRecords,
    });

    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**!SECTION */

/**
 * SECTION - TIME USAGE RELATED
 *
 */
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
window.convertTimeToText = (timeUsage, abbrActive = false) => {
  // if time usage is below a minute
  if (timeUsage < 60) {
    return `${timeUsage} seconds`;
  } else if (timeUsage >= 60) {
    // if time usage is above a minute
    let min = Math.floor(timeUsage / 60);
    let sec = Math.floor(timeUsage - min * 60);

    // if time usage is between a minute and an hour
    if (timeUsage < 3600) {
      let timeText = abbrActive
        ? `${min} ${min === 1 ? "Min" : "Mins"} ${sec} Sec`
        : `${min} ${min === 1 ? "Minute" : "Minutes"} ${sec} Seconds`;
      return timeText;
    } else if (timeUsage >= 3600) {
      // if time usage is above an hour
      let hours = Math.floor(timeUsage / 3600);
      let remainingMinutes = Math.floor((timeUsage - hours * 3600) / 60);
      return `${hours} Hr${hours !== 1 ? "s" : ""} ${remainingMinutes} ${
        remainingMinutes === 1 ? "Min" : "Mins"
      }`;
    }
  }
};

/** ASYNC FUNCTION: Get current day's watch times
 *
 * @returns {Object} Returns current day's watch time object
 *
 * @example let currentWatchTimes = await getCurrentWatchTimes();
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

/** FUNCTION: Get current date
 *
 * @returns {string} Returns current date in ISO standard format (yyyy-MM-dd) "2024-10-15"
 *
 * @example let currentDate = getCurrentDate();
 */
window.getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**!SECTION */

/** ASYNC FUNCTION: Get active watch mode and its properties and inserts it into DOM
 *
 * @returns {null}
 *
 * @example getCurrentWatchMode();
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

    return currentWatchMode;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/** ASYNC FUNCTION: Get the total watch times from the first date to the current date
 *
 * @returns {int} Returns current date's watch time in seconds i.e. 120
 *
 * @example getTotalWatchTime()
    .then((totalTime) => {
      $(`#total-watch-time`).html(convertTimeToText(totalTime));
    })
    .catch((error) => {
      $(`#total-watch-time`).html(convertTimeToText(error));
      console.error(error);
    });
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

/** FUNCTION: jQuery animation for displaying submit button statuses
 *
 * @param {string} statusMsgId - element ID of button message to show
 *
 * @param {int} delayTime - amount of time (in seconds) that the buttons shows before disappearing
 *
 * @returns {void} Returns nothing
 *
 * @example displayNotifications("Saved Successfully", "#40a6ce", "verified", 2000);
 *
 */
window.displayNotifications = (
  msg,
  hexColor,
  iconName,
  delayTime,
  isPersistent = false
) => {
  // Prepare notification's message, color, and icon
  $("#notif-msg .material-symbols-rounded")
    .html(iconName)
    .css("color", hexColor);

  $("#notif-msg p").html(msg);

  $("#notif-msg").css("--notif-before-background", hexColor);

  // Trigger display animation
  if (!isPersistent)
    $("#notif-msg")
      .fadeIn(1000)
      .css("display", "flex")
      .delay(delayTime)
      .fadeOut(1000);
  else {
    $("#notif-msg").fadeIn(1000).css("display", "flex");
  }
};
