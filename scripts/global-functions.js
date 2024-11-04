// TODO: make a note for each function about which file its called and how many times its called

/**
 * SECTION - STORAGE RELATED
 */

/** FUNCTION: Sends message to service worker to fulfill specific requests, such as database changes
 * NOTE: all operations (subject to change): 'selectById', 'selectAll', 'filterRecords', 'updateRecords',
 *        'updateRecordByColumn', 'deleteRecordById', 'deletePropertyInRecord', and 'insertRecords'
 *
 * @param {object} message - holds the operation name and other properties to send to servicer worker
 *
 * @returns {various} - can return storage objects or status response messages
 *
 * @example let byIndex = await sendMessageToServiceWorker({operation: "selectById", table: "schedules", index: 1, });
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
window.updateLimitationsDB = async (id, newRecords) => {
  console.log(
    `Updating limitations DB for id: ${id} with new records: ${JSON.stringify(
      newRecords
    )}`
  );
  try {
    let sendUpdatedRecords = await sendMessageToServiceWorker({
      operation: "updateRecordByColumn",
      table: "youtube-limitations",
      column: "id",
      value: id,
      newRecords: newRecords,
    });

    if (!sendUpdatedRecords.error) {
      console.log(
        `Record updated successfully for table youtube-limitations with column id, ${id} with new records ${JSON.stringify(
          newRecords
        )}.`
      );
      return true;
    }
  } catch (error) {
    console.error(`Error updating limitations DB for id: ${id}`, error);
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
window.convertTimeToText = (timeUsage) => {
  // if time usage is below a minute
  if (timeUsage < 60) {
    return `${timeUsage} seconds`;
  } else if (timeUsage >= 60) {
    // if time usage is above a minute
    let min = Math.floor(timeUsage / 60);
    let sec = Math.floor(timeUsage - min * 60);

    // if time usage is between a minute and an hour
    if (timeUsage < 3600) {
      return `${min} ${min === 1 ? "Minute" : "Minutes"} ${sec} Seconds`;
    } else if (timeUsage >= 3600) {
      // if time usage is above an hour
      let hours = Math.floor(timeUsage / 3600);
      let remainingMinutes = Math.floor((timeUsage - hours * 3600) / 60);
      return `${hours} Hr${hours !== 1 ? "s" : ""} ${remainingMinutes} ${
        remainingMinutes === 1 ? "Min" : "Mins"
      } ${sec} ${sec === 1 ? "Sec" : "Secs"}`;
    }
  }
};

/** ASYNC FUNCTION: Get current day's watch times
 *
 * @returns {string} Returns current day's watch time object
 *
 * @example let currentWatchTimes = getCurrentWatchTimes();
 */
window.getCurrentWatchTimes = async () => {
  let currentWatchTimeObj = await sendMessageToServiceWorker({
    operation: "filterRecords",
    table: "watch-times",
    property: "date",
    value: getCurrentDate(),
  });

  return currentWatchTimeObj;
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
