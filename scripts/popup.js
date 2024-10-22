// Author: Lorenzo Ramirez
// Date Created: 2023-09-05
// Purpose: This file is the popup for the extension
/**
 * @LenchetoFC
 * @description This is the standard popup on toolbar to show
 *  the user's YouTube usage, and the ability to enable any
 *  limitation they set to appear here
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

// TODO: put into global functions
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
function sendMessageToServiceWorker(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// TODO: put into global functions
/** FUNCTION: Get current date
 *
 * @returns {string} Returns current date in ISO standard format (yyyy-MM-dd) "2024-10-15"
 *
 * @example let curretnDate = getCurrentDate();
 */
function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// TODO: put into global functions
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
async function getTotalWatchTime() {
  try {
    let totalTime = 0;

    let totalWatchTimes = await sendMessageToServiceWorker({
      operation: "selectAll",
      table: "watch-times",
    });

    for (let index in totalWatchTimes) {
      // Auto-checks corresponding checkbox input
      // $(`#${data[index].name}-quick`).attr("checked", true);
      // console.log(totalWatchTimes[index]["total-watch-time"]);
      totalTime += totalWatchTimes[index]["total-watch-time"];
    }

    return totalTime;
  } catch (error) {
    console.error(error);
  }
}

// TODO: put into global functions
/** ASYNC FUNCTION: Get the watch times of the current date
 *
 * @returns {int} Returns current date's watch time in seconds i.e. 120
 *
 * @example getTodayWatchTime()
    .then((todayTime) => {
      $(`#today-watch-time`).html(convertTimeToText(todayTime));
    })
    .catch((error) => {
      $(`#today-watch-time`).html(convertTimeToText(error));
      console.error(error);
    });
 */
async function getTodayWatchTime() {
  let currentDate = getCurrentDate();

  try {
    let data = await sendMessageToServiceWorker({
      operation: "filterRecords",
      table: "watch-times",
      property: "date",
      value: currentDate,
    });

    console.log(data);

    let todayTime = data[0]["total-watch-time"];

    return todayTime;
  } catch (error) {
    console.error(error);
  }
}

// TODO: put into global functions
/** FUNCTION: Get total watch time and today's watch time, reformats them, and inserts them into DOM
 *
 * @returns {null}
 *
 * @example getWatchTimes();
 */
function getWatchTimes() {
  getTodayWatchTime()
    .then((todayTime) => {
      $(`#today-watch-time`).html(convertTimeToText(todayTime));
    })
    .catch((error) => {
      $(`#today-watch-time`).html(convertTimeToText(error));
      console.error(error);
    });

  getTotalWatchTime()
    .then((totalTime) => {
      $(`#total-watch-time`).html(convertTimeToText(totalTime));
    })
    .catch((error) => {
      $(`#total-watch-time`).html(convertTimeToText(error));
      console.error(error);
    });
}

// TODO: put into global functions
/** FUNCTION: Reformts website type into a header. "social-media" -> "Social Media"
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
      // Shorts recommendations
      if (word.toLowerCase() === "recommendations") {
        return "Recomm.";
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  return reformattedName;
}

// TODO: put into global functions
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
async function updateLimitationsDB(id, newRecords) {
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
}

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

    $(".current-watch-mode").html(currentWatchMode.name);
    $(".current-watch-mode").css("border-color", currentWatchMode.color);
    $(".current-watch-mode").css("color", currentWatchMode.color);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/** ASYNC FUNCTION: Get all active quick activations for youtube limitations
 *
 * @returns {array} Returns array of objects with active quick activations
 *
 * @example let allQuickActiviations = getActiveQuickActivations();
 */
async function getActiveQuickActivations() {
  let allQuickActivations = await sendMessageToServiceWorker({
    operation: "filterRecords",
    table: "youtube-limitations",
    property: "quick-add",
    value: true,
  });

  return allQuickActivations;
}

/** ASYNC FUNCTION: Attach event listeners to every quick activation button on form
 *
 * @returns {null}
 *
 * @example attachQuickActEvents();
 */
async function attachQuickActEvents() {
  $("#quick-act-form input").on("click", async function () {
    let quickActInputObj = {
      id: parseInt($(this).attr("value")),
      active: $(this).prop("checked"),
    };

    // Updates active status of limitation settings
    await updateLimitationsDB(quickActInputObj.id, {
      active: quickActInputObj.active,
    });
  });
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */

/** ONLOAD FUNCTION CALL: Get all active quick activations records, toggle active quick activation checkboxes, and update YT UI example */
getActiveQuickActivations()
  .then((data) => {
    // Removes quick activation section if there are no buttons to add
    if (data.length === 0) {
      $(".popup-section:has(#quick-act-form)").remove();
    }

    // Iterates through all active quick activations
    for (let quickActObj of data) {
      let checked = quickActObj.active ? "checked" : "";

      // Creates new html element for each quick activation
      let newQuickActHTML = $(
        `<div class="checkbox-item" data-limitation-name="${quickActObj.name}"></div>`
      ).html(`
        <label>
          <input id="${quickActObj.name}" name="${
        quickActObj.name
      }" type="checkbox" value="${quickActObj.id}" ${checked} />
          <span for="name">${reformatSettingName(quickActObj.name)}</span>
        </label>
      `);

      // Appends quick act html to the form
      $("#quick-act-form").append(newQuickActHTML);
    }

    // Attachs event listeners to each button after they are all appended to avoid double listeners per element
    attachQuickActEvents();
  })
  .catch((error) => {
    console.error(error);
  });

/** ONLOAD FUNCTION CALL: Gets total and today's watch times and inserts it into popup */
getWatchTimes();

/** ONLOAD FUNCTION CALL: Gets current watch mode and inserts it into popup */
getCurrentWatchMode();

/** !SECTION */
