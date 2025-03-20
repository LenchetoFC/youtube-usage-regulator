/**
 * @file sservice-worker.js
 * @description Background script that bridges the gap between content scripts and settings scripts.
 *  Handles storage reading and manipulating by listening to service worker messages from other scripts.
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.getCurrentDate} x3
 *
 * TODO: add try catch to all functions
 * TODO: bundle project using module bundling
 */

/**
 * SECTION - DEFAULT DATABASE
 */
const database = {
  ["watch-times"]: [
    {
      id: 1,
      date: getCurrentDate(),
      "total-watch-time": 0,
      "long-form-watch-time": 0,
      "short-form-watch-time": 0,
    },
  ],

  ["watch-modes"]: [
    {
      id: 1,
      name: "Recreational",
      desc: "Remove content is restricted",
      active: true,
      restrictedTags: [],
      priorityTags: [],
      color: "#3c4672",
    },
    {
      id: 2,
      name: "Safe for Work",
      desc: "Keep that feed PG-13",
      active: false,
      restrictedTags: ["Violence", "Nudity"],
      priorityTags: [],
      color: "#724b9c",
    },
    {
      id: 3,
      name: "Educational",
      desc: "Remove all non-educational materials",
      active: false,
      restrictedTags: ["Game", "Movie"],
      priorityTags: ["School", "Learning", "Study"],
      color: "#974f30",
    },
  ],

  ["spoiler-groups"]: [
    // NOTE: for testing
    // {
    //   id: 1,
    //   name: "Marvel Spoiler Free",
    //   desc: "Tom Holland can't spoiler now.",
    //   active: true,
    //   keywords: ["Marvel", "Avengers", "Captain America", "Secret Wars"],
    //   color: "#3c4672",
    // },
  ],

  ["preferred-creators"]: [],

  ["misc-settings"]: [
    {
      id: 1,
      name: "nav-bar-expanded-state",
      isExpanded: false,
    },
  ],

  ["spoiler-detection"]: [
    {
      id: 1,
      name: "obscure-all-with-spoiler",
      active: false,
    },
    {
      id: 2,
      name: "replace-thumbnail",
      active: false,
    },
  ],

  // NOTE: for testing
  // ["schedule-events"]: [
  //   {
  //     id: 0,
  //     dayId: 6,
  //     startTime: "08:00:00",
  //     endTime: "12:00:00",
  //     additionalSites: true,
  //   },
  //   {
  //     id: 1,
  //     dayId: 3,
  //     startTime: "09:00:00",
  //     endTime: "12:59:15",
  //     additionalSites: false,
  //   },
  //   {
  //     id: 2,
  //     dayId: 6,
  //     startTime: "12:30:00",
  //     endTime: "20:00:00",
  //     additionalSites: true,
  //   },
  //   {
  //     id: 3,
  //     dayId: 3,
  //     startTime: "10:00:00",
  //     endTime: "18:00:00",
  //     additionalSites: true,
  //   },
  //   {
  //     id: 4,
  //     dayId: 4,
  //     startTime: "11:00:00",
  //     endTime: "19:00:00",
  //     additionalSites: false,
  //   },
  //   {
  //     id: 5,
  //     dayId: 0,
  //     startTime: "14:00:00",
  //     endTime: "22:00:00",
  //     additionalSites: false,
  //   },
  // ],

  // ["schedule-days"]: [
  //   {
  //     id: 0,
  //     dayId: 0,
  //     name: "sunday",
  //     active: true,
  //     "all-day": false,
  //     additionalSites: false,
  //   },
  //   {
  //     id: 1,
  //     dayId: 1,
  //     name: "monday",
  //     active: true,
  //     "all-day": true,
  //     additionalSites: false,
  //   },
  //   {
  //     id: 2,
  //     dayId: 2,
  //     name: "tuesday",
  //     active: true,
  //     "all-day": true,
  //     additionalSites: true,
  //   },
  //   {
  //     id: 3,
  //     dayId: 3,
  //     name: "wednesday",
  //     active: true,
  //     "all-day": false,
  //     additionalSites: false,
  //   },
  //   {
  //     id: 4,
  //     dayId: 4,
  //     name: "thursday",
  //     active: true,
  //     "all-day": false,
  //     additionalSites: false,
  //   },
  //   {
  //     id: 5,
  //     dayId: 5,
  //     name: "friday",
  //     active: false,
  //     "all-day": false,
  //     additionalSites: false,
  //   },
  //   {
  //     id: 6,
  //     dayId: 6,
  //     name: "saturday",
  //     active: true,
  //     "all-day": true,
  //     additionalSites: false,
  //   },
  // ],

  ["schedule-events"]: [],

  ["schedule-days"]: [
    {
      id: 0,
      dayId: 0,
      name: "sunday",
      active: false,
      "all-day": false,
      additionalSites: false,
    },
    {
      id: 1,
      dayId: 1,
      name: "monday",
      active: false,
      "all-day": false,
      additionalSites: false,
    },
    {
      id: 2,
      dayId: 2,
      name: "tuesday",
      active: false,
      "all-day": false,
      additionalSites: false,
    },
    {
      id: 3,
      dayId: 3,
      name: "wednesday",
      active: false,
      "all-day": false,
      additionalSites: false,
    },
    {
      id: 4,
      dayId: 4,
      name: "thursday",
      active: false,
      "all-day": false,
      additionalSites: false,
    },
    {
      id: 5,
      dayId: 5,
      name: "friday",
      active: false,
      "all-day": false,
      additionalSites: false,
    },
    {
      id: 6,
      dayId: 6,
      name: "saturday",
      active: false,
      "all-day": false,
      additionalSites: false,
    },
  ],

  ["schedule-event-groups"]: [],

  ["youtube-limitations"]: [
    {
      id: 1,
      name: "home-page",
      active: false,
      popup: false,
      followSchedule: false,
    },
    {
      id: 2,
      name: "shorts-page",
      active: false,
      popup: false,
      followSchedule: false,
    },
    {
      id: 3,
      name: "home-button",
      active: false,
      popup: false,
      followSchedule: false,
    },
    {
      id: 4,
      name: "shorts-button",
      active: false,
      popup: false,
      followSchedule: false,
    },
    {
      id: 5,
      name: "shorts-recom",
      active: false,
      popup: false,
      followSchedule: false,
    },
    {
      id: 6,
      name: "search-bar",
      active: false,
      popup: false,
      followSchedule: false,
    },
    {
      id: 7,
      name: "video-recom",
      active: false,
      popup: false,
      followSchedule: false,
    },
    {
      id: 8,
      name: "infinite-recom",
      active: false,
      popup: false,
      followSchedule: false,
    },
    {
      id: 9,
      name: "skip-button",
      active: false,
      popup: false,
      followSchedule: false,
    },
    {
      id: 10,
      name: "comments-section",
      active: false,
      popup: false,
      followSchedule: false,
    },
    {
      id: 11,
      name: "all-pages",
      active: false,
      popup: false,
      followSchedule: false,
    },
    {
      id: 12,
      name: "pause-video-on-blur",
      active: false,
    },
  ],

  ["additional-websites"]: [],
};

/** Initializes default database in Chrome Storage Sync if doesn't exist */
chrome.storage.sync.get(
  [
    "misc-settings",
    "youtube-limitations",
    "watch-modes",
    "watch-times",
    "schedule-days",
    "schedule-events",
    "preferred-creators",
    "additional-websites",
    "spoiler-detection",
    "spoiler-groups",
  ],
  (result) => {
    if (!result["misc-settings"]) {
      chrome.storage.sync.set({
        "misc-settings": database["misc-settings"],
      });
    }
    if (!result["youtube-limitations"]) {
      chrome.storage.sync.set({
        "youtube-limitations": database["youtube-limitations"],
      });
    }
    // if (!result["watch-modes"]) {
    //   chrome.storage.sync.set({
    //     "watch-modes": database["watch-modes"],
    //   });
    // }
    if (!result["spoiler-detection"]) {
      chrome.storage.sync.set({
        "spoiler-detection": database["spoiler-detection"],
      });
    }
    if (!result["spoiler-groups"]) {
      chrome.storage.sync.set({
        "spoiler-groups": database["spoiler-groups"],
      });
    }
    if (!result["watch-times"]) {
      chrome.storage.sync.set({
        "watch-times": database["watch-times"],
      });
    }
    if (!result["schedule-events"]) {
      chrome.storage.sync.set({
        "schedule-events": database["schedule-events"],
      });
    }
    if (!result["schedule-days"]) {
      chrome.storage.sync.set({ "schedule-days": database["schedule-days"] });
    }
    // if (!result["preferred-creators"]) {
    //   chrome.storage.sync.set({
    //     "preferred-creators": database["preferred-creators"],
    //   });
    // }
    if (!result["additional-websites"]) {
      chrome.storage.sync.set({
        "additional-websites": database["additional-websites"],
      });
    }
    // if (!result["schedule-event-groups"]) {
    //   chrome.storage.sync.set({
    //     "schedule-event-groups": database["schedule-event-groups"],
    //   });
    // }
  }
);

/** !SECTION */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/**
 * Get current date
 *
 * @name getCurrentDate
 *
 * @returns {string} Returns current date in ISO standard format (yyyy-MM-dd) "2024-10-15"
 *
 * @example let currentDate = getCurrentDate();
 */
function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get all records from a table
 *
 * @name selectAllRecords
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 *
 * @returns {object} Returns the records from the given table
 *
 * @example selectAllRecords("youtube-limitations");
 */
function selectAllRecords(table) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([table], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[table] || []);
      }
    });
  });
}

/**
 *
 */
function selectAllStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get((result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        // console.log(result);
        resolve(result || []);
      }
    });
  });
}

/**
 * Get a record by its ID
 *
 * @name selectRecordById
 * @async
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 * @param {int} id - record id i.e. 1
 *
 * @returns {object} Returns the record(s) from the given table that have the given id
 *
 * @example selectRecordById("youtube-limitations", 1);
 */
async function selectRecordById(table, id) {
  const records = await selectAllRecords(table);
  return records.find((record) => record.id === parseInt(id));
}

/**
 * Get a record by property value
 *
 * @name filterRecords
 * @async
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 * @param {string} property - property name i.e. "active"
 * @param {string|number|boolean} value - value of the property to filter by
 *
 * @returns {object} Returns the filtered records from the given table that follows the given condition
 *
 * @example filterRecords("youtube-limitations", "active", true);
 */
async function filterRecords(table, property, value) {
  const records = await selectAllRecords(table);
  return records.filter((record) => record[property] === value);
}

/**
 * Insert new records into a table
 *
 * @name insertRecords
 * @async
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 * @param {array} newRecords - records, can be some or all properties within an existing table i.e. { allDay: true }
 *
 * @returns {void} Returns nothing
 *
 * @example insertRecords("youtube-limitations", [{ popup: true }]);
 *
 * @notes omit id property when calling this as that is calculated in this function
 */
async function insertRecords(table, newRecords) {
  try {
    // Retrieve all records from the table
    const records = await selectAllRecords(table);

    // Ensure newRecords is an array
    if (!Array.isArray(newRecords)) {
      throw new Error("newRecords should be an array");
    }

    // Find the highest current ID
    let maxId = records.length ? Math.max(...records.map((r) => r.id)) : 0;

    // Assign unique IDs to new records
    newRecords.forEach((record) => {
      if (!record.id) {
        record.id = ++maxId;
      }
    });

    // Add new records to the existing records
    const updatedRecords = [...records, ...newRecords];

    // Save the updated records back to the table
    updateRecords(table, updatedRecords);

    // console.log(`Records inserted successfully into table ${table}`);
  } catch (error) {
    throw error;
  }
}

/**
 * Update records
 *
 * @name updateRecords
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 * @param {object} records - records, can be some or all properties within an existing table i.e. { allDay: true }
 *
 * @returns {void} Returns nothing
 *
 * @example updateRecords("youtube-limitations", [{ id: 1, name: "sunday", active: true, allDay: false }]);
 */
function updateRecords(table, records) {
  return new Promise((resolve, reject) => {
    const data = {};
    data[table] = records;
    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(records);
      }
    });
  });
}

/**
 * Import existing records
 *
 * @name importRecords
 *
 * @param {object} importedRecords - records i.e. JSON object of entire database
 *
 * @returns {void} Returns nothing
 *
 * @example importRecords(jsonObject);
 */
function importRecords(importedRecords) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.clear();
    chrome.storage.sync.set(importedRecords, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Update a specific record by ID
 *
 * @name updateRecordByProperty
 * @async
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 * @param {string} property - any record property i.e. id or name or active
 * @param {string|number|boolean} value - value of the property to filter by
 * @param {array} newRecords - records, can be some or all properties within an existing table i.e. { allDay: true }
 *
 * @returns {void} Returns nothing
 *
 * @example updateRecordByProperty("youtube-limitations", "name", "home-button", { popup: true });
 *
 * @notes Ideal to use a unique property identifier, because using a property with the same value among
 *  multiple values will result in only the first record to be updated
 */
async function updateRecordByProperty(table, property, value, newRecords) {
  try {
    // Retrieve all records from the table
    const records = await selectAllRecords(table);

    // console.log(records);

    // Find the index of the record with the specified ID
    const recordIndex = records.findIndex(
      (record) => record[property] === value
    );

    if (recordIndex === -1) {
      throw new Error(
        `Record with property ${property}, value ${value} not found in table ${table}`
      );
    }

    // Update the record's properties
    records[recordIndex] = { ...records[recordIndex], ...newRecords };
    // console.log(
    //   `records for ${property} ${value} with ${JSON.stringify(newRecords)}\n`,
    //   records
    // );

    // Save the updated records back to the table
    updateRecords(table, records);

    return {
      error: false,
      message: `Record updated successfully in table ${table}.`,
    };
  } catch (error) {
    return { error: true, message: error.message };
  }
}

/**
 * Reset a table to its default state
 *
 * @name resetTable
 * @async
 *
 * @param {string} table - table name i.e. "watch-times"
 *
 * @returns {Promise<void>} Returns a promise that resolves when the table is reset
 *
 * @example resetTable("watch-times");
 */
async function resetTable(table) {
  try {
    // Check if the table exists in the default database
    if (!database[table]) {
      throw new Error(`Table ${table} does not exist in the default database`);
    }

    // Delete the existing table
    await new Promise((resolve, reject) => {
      chrome.storage.sync.remove([table], () => {
        if (chrome.runtime.lastError) {
          reject(
            new Error(
              `Error removing table ${table}: ${chrome.runtime.lastError.message}`
            )
          );
        } else {
          resolve();
        }
      });
    });

    // Replace it with the default table from the database object
    const defaultTable = database[table];
    const data = {};
    data[table] = defaultTable;

    await new Promise((resolve, reject) => {
      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(
            new Error(
              `Error setting table ${table}: ${chrome.runtime.lastError.message}`
            )
          );
        } else {
          resolve(`Table ${table} has been reset to its default state`);
        }
      });
    });

    return {
      error: false,
      message: `Table ${table} has been reset to its default state`,
    };
  } catch (error) {
    console.error(`Error resetting table ${table}:`, error);
    return {
      error: true,
      message: `Error resetting table ${table}: ${error.message}`,
    };
  }
}

/**
 * Delete a specific record by ID
 *
 * @name deleteRecordById
 * @async
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 * @param {int} id - record id i.e. 1
 *
 * @returns {void} Returns nothing
 *
 * @example deleteRecordById("youtube-limitations", 1);
 *
 * @notes designed for deleting watch time and watch mode records
 */
async function deleteRecordById(table, id) {
  try {
    // Retrieve all records from the table
    const records = await selectAllRecords(table);
    // console.log(records);

    // Ensure record exists
    const record = await selectRecordById(table, id);

    // console.log(record);

    if (!record) {
      throw new Error(`Record with ID ${id} not found in table ${table}`);
    }

    // Filter out the record with the specified ID
    const updatedRecords = records.filter(
      (record) => record.id !== parseInt(id)
    );
    // console.log(updatedRecords);

    // Save the updated records back to the table
    updateRecords(table, updatedRecords);

    // console.log(
    //   `Record with ID ${id} deleted successfully from table ${table}`
    // );
  } catch (error) {
    return error;
  }
}

/**
 * Delete a specific record by property name
 *
 * @name deletePropertyInRecord
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 * @param {int} id - record id i.e. 1
 * @param {string} property - property name i.e. name or "restricted-tags"
 *
 * @returns {void} Returns nothing
 *
 * @example deletePropertyInRecord("youtube-limitations", 1, "restricted-tags");
 *
 * @notes designed for deleting schedule intervals
 */
async function deletePropertyInRecord(table, id, property) {
  try {
    // Retrieve all records from the table
    const records = await selectAllRecords(table);

    // Find the record with the specified ID
    const recordIndex = records.findIndex((record) => record.id === id);

    if (recordIndex === -1) {
      throw new Error(`Record with ID ${id} not found in table ${table}`);
    }

    // Delete the specified property from the record
    if (records[recordIndex].hasOwnProperty(property)) {
      delete records[recordIndex][property];
    } else {
      throw new Error(`property ${property} not found in record with ID ${id}`);
    }

    // Save the updated records back to the table
    updateRecords(table, records);
  } catch (error) {
    error;
  }
}

/** !SECTION */

/**
 * SECTION - MESSAGE LISTENERS
 */

/**
 * Listens for request to modify or select from chrome storage
 *
 * @name chrome.runtime.onMessage.addListener
 *
 * @param {Object} request - The request object containing operation details
 * @param {Object} sender - The sender object containing information about the message sender
 * @param {Function} sendResponse - The function to call with the response
 *
 * @returns {boolean} Returns true to indicate that the response will be sent asynchronously
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Get value of settings
  if (request.operation === "selectRecordById") {
    // Gets records by ID
    selectRecordById(request.table, request.index)
      .then((table) => sendResponse(table))
      .catch((errorMsg) => {
        sendResponse({
          error: true,
          message: `Error retrieving table ${request.table}, id ${request.index}: ${errorMsg}.`,
        });
      });

    return true;
  } else if (request.operation === "selectAllRecords") {
    // Gets all records from a specified table
    selectAllRecords(request.table)
      .then((table) => sendResponse(table))
      .catch((errorMsg) => {
        sendResponse({
          error: true,
          message: `Error retrieving table ${request.table}: ${errorMsg}.`,
        });
      });

    return true;
  } else if (request.operation === "filterRecords") {
    filterRecords(request.table, request.property, request.value)
      .then((filteredData) => {
        // console.log("Filtered data:", filteredData);
        sendResponse(filteredData);
      })
      .catch((errorMsg) => {
        sendResponse({
          error: true,
          message: `Error filtering table ${request.table}, property ${request.property}, value ${request.value}: ${errorMsg}.`,
        });
      });

    return true;
  } else if (request.operation === "updateRecords") {
    // Updates records of an entire table at once
    updateRecords(request.table, request.newRecords)
      .then((records) => {
        sendResponse({
          error: false,
          message: `Successful updated table ${
            request.table
          }, new records ${JSON.stringify(records)}`,
        });
      })
      .catch((errorMsg) => {
        sendResponse({
          error: true,
          message: `Error updating table ${
            request.table
          }, new records ${JSON.stringify(request.newRecords)}: ${errorMsg}.`,
        });
      });

    return true;
  } else if (request.operation === "updateRecordByProperty") {
    // Updates record by property
    updateRecordByProperty(
      request.table,
      request.property,
      request.value,
      request.newRecords
    )
      .then((result) => {
        sendResponse(result);
      })
      .catch((error) => {
        sendResponse({
          error: true,
          message: error.message,
        });
      });

    return true;
  } else if (request.operation === "deleteRecordById") {
    // Deletes record by ID
    deleteRecordById(request.table, request.id)
      .then(() => {
        sendResponse({
          error: false,
          message: `Successfully deleted of table ${request.table}, id ${request.id}`,
        });
      })
      .catch((errorMsg) => {
        sendResponse({
          error: true,
          message: errorMsg,
        });
      });

    return true;
  } else if (request.operation === "deletePropertyInRecord") {
    // Deletes properties within specific records
    deletePropertyInRecord(request.table, request.id, request.property)
      .then(() => {
        sendResponse({
          error: false,
          message: `Successfully deleted of table ${request.table}, property ${request.property}, id ${request.id}.`,
        });
      })
      .catch((errorMsg) => {
        sendResponse({
          error: true,
          message: errorMsg,
        });
      });

    return true;
  } else if (request.operation === "insertRecords") {
    // Inserts new record into existing object
    insertRecords(request.table, request.records)
      .then(() => {
        sendResponse({
          error: false,
          message: `Successfully inserted records ${JSON.stringify(
            request.records
          )} into table ${request.table}.`,
        });
      })
      .catch((errorMsg) => {
        sendResponse({
          error: true,
          message: errorMsg,
        });
      });

    return true;
  } else if (request.operation === "resetTable") {
    // Resets database table back to default
    resetTable(request.table).then(sendResponse);

    return true;
  } else if (request.operation === "selectAllStorage") {
    selectAllStorage()
      .then((allSettings) => sendResponse(JSON.stringify(allSettings)))
      .catch((errorMsg) => {
        sendResponse({
          error: true,
          message: errorMsg,
        });
      });
  } else if (request.operation == "downloadFile") {
    chrome.downloads.download({
      url:
        "data:application/json;charset=utf-8," +
        encodeURIComponent(request.data),
      filename: request.filename,
      saveAs: true,
    });

    sendResponse({ error: false });
  } else if (request.operation === "importSettings") {
    importRecords(request.records).then(sendResponse);
    sendResponse({ error: false });
  }

  if (request.redirect) {
    // Updates the current web page with HTML file
    chrome.tabs.update(sender.tab.id, {
      url: chrome.runtime.getURL(request.redirect),
    });
    sendResponse({ error: false });
  }
  return true;
});

/** !SECTION */

// TODO: Implement for when ext is updated to display patch notes
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: chrome.runtime.getURL("/onInstalled/onboarding.html"),
    });
  } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    chrome.tabs.create({
      url: chrome.runtime.getURL("/onInstalled/update.html"),
    });
  }
});

// NOTE: For testing purposes, manually invoke the onInstalled event
function simulateOnInstalled(reason) {
  chrome.runtime.onInstalled.dispatch({ reason });
}

// Simulate an installation
// simulateOnInstalled(chrome.runtime.OnInstalledReason.INSTALL);

// Or simulate an update
// simulateOnInstalled(chrome.runtime.OnInstalledReason.UPDATE);
