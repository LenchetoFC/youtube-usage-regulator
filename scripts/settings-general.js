/**
 * @LenchetoFC
 * @description This controls the settings pages and accurately
 *  displays current settings and user information for the general settings
 *
 */

/**
 * NOTE: to access storage from browser console, run this command...
 * chrome.storage.sync.get((result) => { console.log(result) });
 */

/** SECTION - FUNCTION DECLARATIONS */

/** FUNCTION - Creates a new HTML element for an activity and adds it to the 'activity-section' in the document */
// function insertActivityHTML(activity) {
//   let activityItem = $("<li></li>").html(`
//       <div class="activity-item" id="${activity}">
//         ${activity}
//         <button>
//           <img class="icon-delete" src="/images/icon-delete.svg" alt="x delete button">
//         </button>
//       </div>
//   `);

//   activityItem.css("display", "none");

//   $("#activity-section").append(activityItem);
//   activityItem.slideDown();
// }

/** FUNCTION - Adds an activity to the 'activities' setting in storage. If the 'activities' setting does not exist, it creates a new one */
// function addActivityStorage(activity) {
//   getAllRecords("activities").then((activity) => console.log(activity));

//   getSettings("activities", (result) => {
//     // Saves new activity to exisiting storage
//     result.unshift(activity);
//     setSetting("activities", result);
//   });
// }

/** FUNCTION: Sends message to service worker to fulfill specific requests, such as database changes
 * NOTE: all operations (subject to change): 'selectById', 'selectAll', 'filterRecords', 'updateRecords',
 *        'updateRecordByColumn', 'deleteRecordById', 'deletePropertyInRecord', and 'insertRecords'
 *
 * @param {object} message - holds the operation name and other properties to send to servicer worker
 *
 * @returns {various} - can return storage objects or status response messages
 *
 * @example let byIndex = await sendMessageToServiceWorker({operation: "selectById", table: "schedules", index: 1, });
 * //
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

/** FUNCTION: Get all active youtube limitations settings
 *
 * @returns {array} Returns array of records with active values
 *
 * @example let allQuickActiviations = getActiveLimitations();
 */
async function getActiveLimitations() {
  let allActiveLimitations = await sendMessageToServiceWorker({
    operation: "filterRecords",
    table: "youtube-limitations",
    property: "active",
    value: true,
  });

  return allActiveLimitations;
}

/** FUNCTION: Get all active quick activations for youtube limitations
 *
 * @returns {array} Returns array of records with active quick activations
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

/** FUNCTION: Get all settings that have been changed in the form (class name)
 *
 * @returns {array} Returns an array converted from an object of changed settings properties
 *                  necessary for updating storage
 *
 * @example const limitationChoices = getLimitationChoices();
 */
function getLimitationChoices() {
  return $("#limitation-settings fieldset input.changed")
    .map(function () {
      return {
        name: this.name,
        id: parseInt(this.value),
        isActive: this.checked,
        isQuickAdd: this.name.includes("quick"),
      };
    })
    .get();
}

/** FUNCTION: Update a specific record by ID
 *
 * @param {int} id - record id i.e. 1
 *
 * @param {array} newRecords - records, can be some or all properties
 *        within an existing table  i.e. { allDay: true }
 *
 * @returns {boolean} Returns if the process was successful or not
 *
 * @example let isValid = updateLimitationsDB(3, { quick-add: true });
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

    if (sendUpdatedRecords.error) {
      console.error(
        `Error updating record for id: ${id}`,
        sendUpdatedRecords.message
      );
      return false;
    } else {
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

/** FUNCTION: Check if the checkbox form choices are valid (boolean and settings saved successfully)
 *
 * @param {array} id - array of settings records
 *
 * @returns {boolean} Returns validity value
 *
 * @example const settings = [{name: 'home-page-quick', id: 1, isActive: true, isQuickAdd: true}, {name: 'shorts-page-quick', id: 2, isActive: true, isQuickAdd: true}];
 *          let isValid = isValidLimitations(3, settings);
 */
async function isValidLimitations(limitationChoices) {
  let isValid = true;
  for (const limitation of limitationChoices) {
    let quick;
    limitation.isQuickAdd ? (quick = true) : (quick = false);

    if (limitation.isQuickAdd) {
      isValid = await updateLimitationsDB(limitation.id, {
        "quick-add": limitation.isActive,
      });

      if (!isValid) {
        console.error("invalid");
        break;
      }
    } else {
      isValid = await updateLimitationsDB(limitation.id, {
        active: limitation.isActive,
      });

      if (!isValid) {
        console.error("invalid");
        break;
      }
    }
  }
}

/** FUNCTION: jQuery animation for displaying submit button statuses
 *
 * @param {string} statusMsgId - element ID of button message to show
 *
 * @param {int} delayTime - amount of time (in seconds) that the buttons shows before disappearing
 *
 * @returns {null} Returns nothing
 *
 * @example triggerSubmitStatusAnimation("#limitations-no-change-msg", 2500);
 */
function triggerSubmitStatusAnimation(statusMsgId, delayTime) {
  $(statusMsgId)
    .fadeIn(1000)
    .css("display", "flex")
    .delay(delayTime)
    .fadeOut(1000);
}

/** !SECTION */

/** SECTION - ONLOAD FUNCTION CALLS */

/** ONLOAD FUNCTION CALL: Get all active youtube limitation records, toggle active checkboxes, and update YT UI example */
getActiveLimitations()
  .then((data) => {
    console.log(data);
    for (let index in data) {
      // Auto-checks corresponding checkbox input
      $(`#${data[index].name}`).attr("checked", true);

      // Auto-updates YT UI example
      $(`.limitation-demos .${data[index].name}`).slideToggle();
    }
  })
  .catch((error) => {
    console.error(error);
  });

/** ONLOAD FUNCTION CALL: Get all active quick activations records, toggle active quick activation checkboxes, and update YT UI example */
getActiveQuickActivations()
  .then((data) => {
    for (let index in data) {
      // Auto-checks corresponding checkbox input
      $(`#${data[index].name}-quick`).attr("checked", true);
    }
  })
  .catch((error) => {
    console.error(error);
  });

/** !SECTION */

/** SECTION - EVENT LISTENERS */

/** EVENT LISTENER: Popover won't close when cancel button is pressed if the form is incomplete in any way */
$(".cancel").on("click", function () {
  const popoverId = $(this).attr("data-popover");
  document.querySelector(`#${popoverId}`).togglePopover();
});

/** EVENT LISTENER: Warns user that there are unsaved changes for preferred creators */
$('#limitation-settings input[type="checkbox"]').on("click", function () {
  // Toggle the "changed" class on the clicked checkbox
  $(this).toggleClass("changed");

  // Check if any inputs within #limitation-settings have the "changed" class
  const hasChanged = $('#limitation-settings input[type="checkbox"]').hasClass(
    "changed"
  );

  // Fade in or fade out the unsaved message based on the presence of the "changed" class
  if (hasChanged) {
    $("#limitations-unsaved-msg").fadeIn(1000).css("display", "flex");
  } else {
    $("#limitations-unsaved-msg").fadeOut(1000);
  }
});

/** EVENT LISTENER: Saves restrictive settings and displays status message */
$("#save-limitations").on("click", function () {
  // Disable the save button
  const $button = $(this);
  $button.prop("disabled", true);
  $button.parent().toggleClass("spin-animation");

  // Hide unsaved message
  $("#limitations-unsaved-msg").fadeOut();

  console.log("saving limitations...");

  // Retrieve current values of the form inputs: name, id, isActive, isQuickAdd
  const limitationChoices = getLimitationChoices();

  console.log(limitationChoices);

  if (limitationChoices.length == 0) {
    triggerSubmitStatusAnimation("#limitations-no-change-msg", 2500);

    // Re-enable button after animation
    $button.prop("disabled", false);
    $button.parent().toggleClass("spin-animation");

    return;
  } else {
    $('#limitation-settings input[type="checkbox"]').removeClass("changed");
  }
  console.log(limitationChoices);

  let isValid = isValidLimitations(limitationChoices);

  setTimeout(function () {
    // Start animation on status message, depending saving outcome
    isValid
      ? triggerSubmitStatusAnimation("#limitations-success-msg", 1000)
      : triggerSubmitStatusAnimation("#limitations-failure-msg", 5000);

    // Re-enable button after animation
    $button.parent().toggleClass("spin-animation");
    $button.prop("disabled", false);
  }, 2000);
});

//
/** EVENT LISTENER: Warns user that there are unsaved changes for preferred creators */
$('#creators-list input[type="checkbox"]').on("click", function () {
  // Toggle the "changed" class on the clicked checkbox
  $(this).toggleClass("changed");

  // Check if any inputs within #creators-list have the "changed" class
  const hasChanged = $('#creators-list input[type="checkbox"]').hasClass(
    "changed"
  );

  // Fade in or fade out the unsaved message based on the presence of the "changed" class
  if (hasChanged) {
    $("#creators-unsaved-msg").fadeIn(1000).css("display", "flex");
  } else {
    $("#creators-unsaved-msg").fadeOut(1000);
  }
});

/** TODO: EVENT LISTENER: Saves preferred creators and displays status message */
$("#save-creators").on("click", function () {
  $('#creators-list input[type="checkbox"]').removeClass("changed");
  $("#creators-unsaved-msg").fadeOut();

  // TODO: change for creators
  // if (limitationChoices.length == 0) {
  //   triggerSubmitStatusAnimation("#limitations-no-change-msg", 5000);

  //   // Re-enable button after animation
  //   $button.parent().toggleClass("spin-animation");
  //   $button.prop("disabled", false);
  //   return;
  // }

  const $button = $(this);
  $button.parent().toggleClass("spin-animation");
  $button.prop("disabled", true);

  // TODO: requires function to save all creators
  // Call function to save all creators
  // Return function status

  setTimeout(function () {
    //NOTE - temporary
    const buttonSuccess = true; // Simulated save outcome

    // Start animation on status message, depending saving outcome
    buttonSuccess
      ? triggerSubmitStatusAnimation("#creators-success-msg", 1000)
      : triggerSubmitStatusAnimation("#creators-failure-msg", 5000);

    $button.parent().toggleClass("spin-animation");
    $button.prop("disabled", false); // Re-enable button after operation
  }, 2000);
});

/** TODO: EVENT LISTENER: Removes website from database and web page when delete button is pressed */
$("[id^='blocked-website-'] button").on("click", function () {
  const websiteId = $(this).attr("data-website-id");

  // Asks user to confirm deletion
  if (window.confirm("Permanently delete this website?")) {
    $(`#${websiteId}`).slideUp("slow", function () {
      $(this).remove();

      // TODO: delete website from database through ID
    });
  }
});

/** !SECTION */

/**
 * STORAGE FUNCTION EXAMPLES all temporary
 */
// // NOTE: temp select record by id
// let byIndex = await sendMessageToServiceWorker({
//   operation: "selectById",
//   table: "schedules",
//   index: 1,
// });

// console.log(`selectById: `);
// console.log(byIndex.data);

// // NOTE: temp select all records from table
// let allRecords = await sendMessageToServiceWorker({
//   operation: "selectAll",
//   table: "youtube-limitations",
// });

// console.log(`\nselectAll: ${Object.keys(allRecords).length}`);
// // for (let index in allRecords) {
// //   console.log(allRecords[index]);
// // }

// // console.log("\n");

// let allRecordsWithoutIndex = await sendMessageToServiceWorker({
//   operation: "selectAll",
//   table: "misc-settings",
// });

// console.log(`\nselectAll: ${Object.keys(allRecordsWithoutIndex).length}`);
// console.log(allRecordsWithoutIndex.data);
// for (let index in allRecordsWithoutIndex.data) {
//   console.log(allRecordsWithoutIndex.data[index], parseInt(index));
// }

// // NOTE: temp select by filtered property boolean
// let filterRecordsByBool = await sendMessageToServiceWorker({
//   operation: "filterRecordsBool",
//   table: "schedules",
//   property: "active",
//   boolValue: false,
// });

// console.log(`\nfilterRecordsBool:`);
// console.log(filterRecordsByBool.data);
// for (let index in filterRecordsByBool.data) {
//   console.log(filterRecordsByBool.data[index]);
// }

// let filterRecordsByKey = await sendMessageToServiceWorker({
//   operation: "filterRecords",
//   table: "youtube-limitations",
//   property: "name",
//   value: "home-page",
// });

// console.log(`\nfilterRecords:`);
// console.log(filterRecordsByKey.data);

// // NOTE: temp update records
// const newSchedules = [
//   { id: 1, name: "sunday", active: true, allDay: false },
//   { id: 2, name: "monday", active: true, allDay: false },
//   { id: 3, name: "tuesday", active: false, allDay: false },
//   { id: 4, name: "wednesday", active: false, allDay: true },
//   { id: 5, name: "thursday", active: true, allDay: false },
//   { id: 6, name: "friday", active: false, allDay: false },
//   { id: 7, name: "saturday", active: true, allDay: true },
// ];

// let updateRecords = await sendMessageToServiceWorker({
//   operation: "updateRecords",
//   table: "schedules",
//   newRecords: newSchedules,
// });

// const newWatchModes = [
//   {
//     id: 1,
//     name: "Recreational",
//     active: true,
//     restrictedTags: [],
//     priorityTags: [],
//     color: "#178220",
//   },
//   {
//     id: 2,
//     name: "Safe for Work",
//     active: false,
//     restrictedTags: ["Violence", "Nudity"],
//     priorityTags: [],
//     color: "#173282",
//   },
//   {
//     id: 3,
//     name: "Educational",
//     active: false,
//     restrictedTags: ["Game", "Movie"],
//     priorityTags: ["School", "Learning", "Study"],
//     color: "#178279",
//   },
//   {
//     id: 4,
//     name: "Marvel Mode",
//     active: false,
//     restrictedTags: [],
//     priorityTags: ["Marvel"],
//     color: "#341782",
//   },
// ];

// let updateWatchModes = await sendMessageToServiceWorker({
//   operation: "updateRecords",
//   table: "watch-modes",
//   newRecords: newWatchModes,
// });

// console.log(`\nupdate watch modes:`);
// console.log(updateWatchModes.data);

// let updateRecordByColumn = await sendMessageToServiceWorker({
//   operation: "updateRecordByColumn",
//   table: "youtube-limitations",
//   column: "id",
//   value: 3,
//   newRecords: { "quick-add": true, active: true },
// });

// console.log(`\nupdateRecordsById:`);
// if (updateRecordByColumn.error) {
//   console.error("Error inserting new records:", updateRecordByColumn.message);
// } else {
//   console.log(updateRecordByColumn.data);
// }

// // NOTE: temp select all records from table
// let watchModeList = await sendMessageToServiceWorker({
//   operation: "selectAll",
//   table: "watch-modes",
// });

// console.log(watchModeList.data);

// // NOTE: temp delete record by ID
// let deleteWatchMode = await sendMessageToServiceWorker({
//   operation: "deleteRecordById",
//   table: "watch-modes",
//   id: 4,
// });

// if (deleteWatchMode.error) {
//   console.error("Error deleting watch mode:", deleteWatchMode.message);
// } else {
//   console.log(deleteWatchMode.data);
// }

// // // NOTE: temp delete property in specific record
// let deleteTimeInterval = await sendMessageToServiceWorker({
//   operation: "deletePropertyInRecord",
//   table: "schedules",
//   id: 4,
//   property: "interval-1",
// });

// if (deleteTimeInterval.error) {
//   console.error("Error deleting interval:", deleteTimeInterval.message);
// } else {
//   console.log(deleteTimeInterval.data);
// }

// // NOTE: temp inserts new records in existing object
// let insertNewWatchModes = await sendMessageToServiceWorker({
//   operation: "insertRecords",
//   table: "watch-modes",
//   records: [
//     {
//       name: "Night Mode",
//       active: true,
//       restrictedTags: ["Bright"],
//       priorityTags: [],
//       color: "#000000",
//     },
//     {
//       name: "Relax Mode",
//       active: false,
//       restrictedTags: ["Stress"],
//       priorityTags: ["Calm"],
//       color: "#00FF00",
//     },
//   ],
// });

// if (insertNewWatchModes.error) {
//   console.error("Error inserting new records:", insertNewWatchModes.message);
// } else {
//   console.log(insertNewWatchModes.data);
// }

// let insertNewWatchTimes = await sendMessageToServiceWorker({
//   operation: "insertRecords",
//   table: "watch-times",
//   records: [
//     {
//       date: "09-11-2000",
//       "total-watch-time": 1400,
//       "long-form-watch-time": 1000,
//       "short-form-watch-time": 400,
//     },
//     {
//       date: "09-12-2000",
//       "total-watch-time": 5400,
//       "long-form-watch-time": 2800,
//       "short-form-watch-time": 2600,
//     },
//   ],
// });

// if (insertNewWatchTimes.error) {
//   console.error("Error inserting new records:", insertNewWatchTimes.message);
// } else {
//   console.log(insertNewWatchTimes.data);
// }
