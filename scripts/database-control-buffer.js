/**
 * @file settings-form-controls.js
 * @description This file contains functions that act as a middle man between page
 *              javascript files and service-worker file
 *
 * @version 1.0.0
 * @author LenchetoFC
 */

// TODO: merge global-functions.js and this file (database-control-buffer)

/**
 * Get all active settings from desired table
 *
 * @name getActiveSettings
 * @async
 *
 * @returns {Array} Returns array of records with active values
 *
 * @example const allActiveSettings = getActiveSettings("youtube-limitations", ["active", "followSchedules"]);
 */
async function getActiveSettings(tableName, propertiesToCheck) {
  // Create a Set to store unique active records
  const uniqueActiveRecords = new Set();

  for (const property of propertiesToCheck) {
    const activeRecords = await filterRecordsGlobal(tableName, property, true);

    // Add each active record to the Set
    (activeRecords ?? []).forEach((record) => uniqueActiveRecords.add(record));
  }

  // Convert the Set to an array to return the records
  return Array.from(uniqueActiveRecords);
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
async function selectAllRecords(table) {
  let allRecords = await selectAllRecordsGlobal(table);

  if (allRecords.error) {
    return false;
  } else {
    return allRecords;
  }
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
  return records?.find((record) => record.id === parseInt(id));
}

/**
 * Delete a specific record by ID
 *
 * @name deleteItemFromDatabase
 * @async
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 * @param {int} id - record id i.e. 1
 *
 * @returns {void} Returns nothing
 *
 * @example deleteItemFromDatabase("youtube-limitations", 1);
 *
 */
async function deleteItemFromDatabase(table, itemId) {
  try {
    // Asks user to confirm deletion
    // console.log(itemId);

    if (window.confirm("Permanently delete this item?")) {
      let results = await deleteRecordByIdGlobal(table, itemId);

      // Displays error message if deleting is unsuccessful
      if (results.error) {
        throw new Error(`${results.message}`);
      }
    }
    return true;
  } catch (error) {
    console.error(error);
    // Optionally, you can display an error message to the user here

    return false;
  }
}

/**
 * Update database with given records
 *
 * @name updateDatabase
 *
 * @param {string} table - table name i.e. "youtube-limitations"
 * @param {object} newRecord - records, can be some or all properties within an existing table i.e. { allDay: true }
 *
 * @returns {void} Returns nothing
 *
 * @example updateDatabase("youtube-limitations", [{ id: 1, name: "sunday", active: true, allDay: false }]);
 */
async function updateDatabase(tableName, newRecord) {
  try {
    const result = await updateRecordByPropertyGlobal(
      tableName,
      "id",
      parseInt(newRecord.id),
      newRecord
    );

    return result;
  } catch (error) {
    console.error(error);
    return { error: true, message: error.message };
  }
}

/**
 * Iterates through all changes limitation choices and then calls function to update database
 *
 * @name prepareDatabaseUpdate
 * @async
 *
 * @param {Array} newRecords - array of settings records
 *
 * @returns {boolean} Returns validity value
 *
 * @example const newRecords = [{name: 'home-page-popup', id: 1, isActive: true,
 *                              isQuickAdd: true}, {name: 'shorts-page-popup',
 *                              id: 2, isActive: true, isQuickAdd: true
 *                            }];
 *          let isValid = prepareDatabaseUpdate(newRecords);
 */
async function prepareDatabaseUpdate(tableName, newRecords) {
  try {
    let updateResult;

    for (const key in newRecords) {
      // Updates limitations in database
      const newRecord = newRecords[key];

      updateResult = await updateDatabase(tableName, newRecord);

      // Throws error if there are any problems updating
      if (updateResult.error) {
        throw { error: true, message: updateResult.message };
      }
    }

    return updateResult;
  } catch (error) {
    console.error(error.message);

    return { error: true, message: error.message };
  }
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
  return records?.filter((record) => record[property] === value);
}
