// TODO: look into adding function properties to storage objects for modifying them maybe?
// Refer Fireship 100+ JavaScript concepts you need to know

// TODO: add try catch to ALL async functions

// Bundle project using Module Bundling

/**
 * SECTION - DEFAULT DATABASE
 */
const database = {
  watchTimes: [
    {
      id: 1,
      date: getCurrentDate(),
      "total-watch-time": 0,
      "long-form-watch-time": 0,
      "short-form-watch-time": 0,
    },
  ],

  watchModes: [
    {
      id: 1,
      name: "Recreational",
      active: true,
      restrictedTags: [],
      priorityTags: [],
      color: "#178220",
    },
    {
      id: 2,
      name: "Safe for Work",
      active: false,
      restrictedTags: ["Violence", "Nudity"],
      priorityTags: [],
      color: "#173282",
    },
    {
      id: 3,
      name: "Educational",
      active: false,
      restrictedTags: ["Game", "Movie"],
      priorityTags: ["School", "Learning", "Study"],
      color: "#178279",
    },
  ],

  preferredCreators: [],

  miscSettings: [
    {
      "install-date": "",
    },
    {
      "last-used-date": "",
    },
    {
      "pause-video-on-blur": false,
    },
  ],

  schedules: [
    { id: 1, name: "sunday", active: false, "all-day": false },
    { id: 2, name: "monday", active: false, "all-day": false },
    { id: 3, name: "tuesday", active: false, "all-day": false },
    { id: 4, name: "wednesday", active: false, "all-day": false },
    { id: 5, name: "thursday", active: false, "all-day": false },
    { id: 6, name: "friday", active: false, "all-day": false },
    { id: 7, name: "saturday", active: false, "all-day": false },
  ],

  youtubeLimitations: [
    {
      id: 1,
      name: "home-page",
      active: false,
      type: "block",
      "quick-add": false,
    },
    {
      id: 2,
      name: "shorts-page",
      active: false,
      type: "block",
      "quick-add": false,
    },
    {
      id: 3,
      name: "home-button",
      active: false,
      type: "hide",
      "quick-add": false,
    },
    {
      id: 4,
      name: "shorts-button",
      active: false,
      type: "hide",
      "quick-add": false,
    },
    {
      id: 5,
      name: "shorts-content",
      active: false,
      type: "hide",
      "quick-add": false,
    },
    {
      id: 6,
      name: "search-bar",
      active: false,
      type: "hide",
      "quick-add": false,
    },
    {
      id: 7,
      name: "video-recommendations",
      active: false,
      type: "hide",
      "quick-add": false,
    },
    {
      id: 8,
      name: "infinite-recommendations",
      active: false,
      type: "hide",
      "quick-add": false,
    },
    {
      id: 9,
      name: "skip-button",
      active: false,
      type: "hide",
      "quick-add": false,
    },
    {
      id: 10,
      name: "comments-section",
      active: false,
      type: "hide",
      "quick-add": false,
    },
    {
      id: 11,
      name: "all-pages",
      active: false,
      type: "block",
      "quick-add": false,
    },
  ],

  additionalWebsites: [],
};

/** Initializes default database in Chrome Storage Sync if doesn't exist */
chrome.storage.sync.get(
  [
    "misc-settings",
    "youtube-limitations",
    "watch-modes",
    "watch-times",
    "schedules",
    "preferred-creators",
    "additional-websites",
  ],
  (result) => {
    if (!result["misc-settings"]) {
      chrome.storage.sync.set({
        "misc-settings": database.miscSettings,
      });
    }
    if (!result["youtube-limitations"]) {
      chrome.storage.sync.set({
        "youtube-limitations": database.youtubeLimitations,
      });
    }
    if (!result["watch-modes"]) {
      chrome.storage.sync.set({
        "watch-modes": database.watchModes,
      });
    }
    if (!result["watch-times"]) {
      chrome.storage.sync.set({
        "watch-times": database.watchTimes,
      });
    }
    if (!result.schedules) {
      chrome.storage.sync.set({ schedules: database.schedules });
    }
    if (!result["preferred-creators"]) {
      chrome.storage.sync.set({
        "preferred-creators": database.preferredCreators,
      });
    }
    if (!result["additional-websites"]) {
      chrome.storage.sync.set({
        "additional-websites": database.additionalWebsites,
      });
    }
  }
);

/** !SECTION */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

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

/** FUNCTION: Get all records from a table
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

/** FUNCTION: Get a record by its ID
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 *
 * @param {int} id - record id i.e. 1
 *
 * @returns {object} Returns the record(s) from the given table that have the given id
 *
 * @example selectRecordById("youtube-limitations", 1);
 */
async function selectRecordById(table, id) {
  const records = await selectAllRecords(table);
  return records.find((record) => record.id === id);
}

/** FUNCTION: Get a record by property value
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 *
 * @returns {object} Returns the filters records from the given table that follows the given condition
 *
 * @example filterRecords("youtube-limitations" (record) => record[id] === 1);
 */
async function filterRecords(table, property, value) {
  const records = await selectAllRecords(table);
  return records.filter((record) => record[property] === value);
}

/** FUNCTION: Insert new records into a table
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 *
 * @param {array} newRecords - records, can be some or all properties within an existing table  i.e. { allDay: true }
 *
 * @returns {void} Returns nothing
 *
 * @example insertRecords("youtube-limitations", { quick-add: true });
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

/** FUNCTION: Update records
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 *
 * @param {object} records - records, can be some or all properties within an existing table  i.e. { allDay: true }
 *
 * @returns {void} Returns nothing
 *
 * @example updateRecords("youtube-limitations", [{ id: 1, name: "sunday", active: true, allDay: false });
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

/** FUNCTION: Update a specific record by ID
 * NOTE: ideal to use a unique column identifier, because using a column with the same value among
 *       multiple values will result in only the first record to be updated
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 *
 * @param {int} column - any record column i.e. id or name or active
 *
 * @param {array} newRecords - records, can be some or all properties within an existing table  i.e. { allDay: true }
 *
 * @returns {void} Returns nothing
 *
 * @example updateRecordByColumn("youtube-limitations", "name", "home-button", { quick-add: true });
 */
async function updateRecordByColumn(table, column, value, newRecords) {
  try {
    // Retrieve all records from the table
    const records = await selectAllRecords(table);

    // Find the index of the record with the specified ID
    const recordIndex = records.findIndex((record) => record[column] === value);

    if (recordIndex === -1) {
      throw new Error(
        `Record with column ${column}, value ${value} not found in table ${table}`
      );
    }

    // Update the record's properties
    records[recordIndex] = { ...records[recordIndex], ...newRecords };
    console.log(
      `records for ${column} ${value} with ${JSON.stringify(newRecords)}\n`,
      records
    );

    // Save the updated records back to the table
    updateRecords(table, records);

    // console.log(`Record with ID ${id} updated successfully`);
  } catch (error) {
    throw error;
  }
}

/** FUNCTION: Delete a specific record by ID
 * NOTE: designed for deleting watch time and watch mode records
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 *
 * @param {int} id - record id i.e. 1
 *
 * @returns {void} Returns nothing
 *
 * @example deleteRecordById("youtube-limitations", 1);
 */
async function deleteRecordById(table, id) {
  try {
    // Retrieve all records from the table
    const records = await selectAllRecords(table);

    // Ensure record exists
    const record = await selectRecordById(table, id);
    if (!record) {
      throw new Error(`Record with ID ${id} not found in table ${table}`);
    }

    // Filter out the record with the specified ID
    const updatedRecords = records.filter((record) => record.id !== id);

    // Save the updated records back to the table
    updateRecords(table, updatedRecords);

    // console.log(
    //   `Record with ID ${id} deleted successfully from table ${table}`
    // );
  } catch (error) {
    throw error;
  }
}

/** FUNCTION: Delete a specific record by property name
 * NOTE: designed for deleting schedule intervals
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 *
 * @param {int} id - record id i.e. 1
 *
 * @param {string} property - property name i.e. name or "restricted-tags"
 *
 * @returns {void} Returns nothing
 *
 * @example deletePropertyInRecord("youtube-limitations", 1, "restricted-tags");
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
    throw error;
  }
}

/** !SECTION */

/**
 * SECTION - MESSAGE LISTENERS
 */

// EVENT LISTENER: Listens for request to modify or select from chrome storage
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Get value of settings
  if (request.operation === "selectById") {
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
  } else if (request.operation === "selectAll") {
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
    // Filters records
    filterRecords(request.table, request.property, request.value)
      .then((filteredData) => sendResponse(filteredData))
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
          data: `Successful updated table ${
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
  } else if (request.operation === "updateRecordByColumn") {
    // Updates record by ID
    updateRecordByColumn(
      request.table,
      request.column,
      request.value,
      request.newRecords
    )
      .then(() => {
        sendResponse({
          data: `Successfully updated table ${request.table} by column ${
            request.column
          }, ${request.value} with new records ${JSON.stringify(
            request.newRecords
          )}.`,
        });
      })
      .catch((errorMsg) => {
        sendResponse({
          error: true,
          message: `Error updating table ${request.table} by column ${
            request.column
          }, value ${request.value}, new records ${JSON.stringify(
            request.newRecords
          )}: ${errorMsg}.`,
        });
      });

    return true;
  } else if (request.operation === "deleteRecordById") {
    // Deletes record by ID
    deleteRecordById(request.table, request.id)
      .then(() => {
        sendResponse({
          data: `Successfully deleted of table ${request.table}, id ${request.id}`,
        });
      })
      .catch((errorMsg) => {
        sendResponse({
          error: true,
          message: `Error deleting table ${request.table}, id ${request.id}: ${errorMsg}.`,
        });
      });

    return true;
  } else if (request.operation === "deletePropertyInRecord") {
    // Deletes properties within specific records
    deletePropertyInRecord(request.table, request.id, request.property)
      .then(() => {
        console.log(
          sendResponse({
            data: `Successfully deleted of table ${request.table}, property ${request.property}, id ${request.id}.`,
          })
        );
      })
      .catch((errorMsg) => {
        sendResponse({
          error: true,
          message: `Error deleting table ${request.table}, property ${request.property}, id ${request.id} table ${request.table}: ${errorMsg}.`,
        });
      });

    return true;
  } else if (request.operation === "insertRecords") {
    // Inserts new record into existing object
    insertRecords(request.table, request.records)
      .then(() => {
        sendResponse({
          data: `Successfuly inserted records ${JSON.stringify(
            request.records
          )} into table ${request.table}.`,
        });
      })
      .catch((errorMsg) => {
        sendResponse({
          error: true,
          message: `Error inserting records ${JSON.stringify(
            request.records
          )} into table ${request.table}: ${errorMsg}`,
        });
      });

    return true;
  }

  if (request.redirect) {
    // Updates the current web page with HTML file
    chrome.tabs.update(sender.tab.id, {
      url: chrome.runtime.getURL(request.redirect),
    });
    sendResponse({ status: "success" });
  }
  return true;
});

/** !SECTION */

// Updates last-used-date to current date if date doesn't match or exist
// chrome.storage.sync.get(["last-used-date"], function (result) {
//   let currentDay = new Date().toDateString(); //Format: dayofweek month day year "Thu Apr 25 2024"

//   // NOTE: Disabled !for now!
//   if (result["last-used-date"] != currentDay) {
//     // Resets today-usage
//     setSetting("last-used-date", currentDay);
//     console.log("TODAY USAGE RESET TO 0");
//   }

//   console.log(result["last-used-date"]);
// });

// TODO: Implement for when ext is updated to display patch notes
// chrome.runtime.onInstalled.addListener(() => {

// });
