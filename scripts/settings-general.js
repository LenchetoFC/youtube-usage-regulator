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

/**
 * SECTION - INITIAL VARIABLES AND FUNCTION CALLS
 *
 */

// TODO: Change settings retrievals and sets to await promises like functions in content.js
//        to be able to use the values outside of the callback

// Adds all activities from storage to HTML on load
// retrieveActivityFromStorage();

/**
 * SECTION - FUNCTION DECLARATIONS
 *
 */

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

/** FUNCTION - Toggles all checkboxes based on the settings value (true == checked or false == unchecked) */
function toggleCheckboxes(setting, element) {
  // For determining if a YT element either fades or slides out of yt page examples
  const ytFadeToggleElements = [
    "all-pages",
    "home-page",
    "search-bar",
    "shorts-button",
  ];

  try {
    getSettings(setting, (result) => {
      // Visually displays the status of the setting on load
      if (result[element.value]) {
        element.checked = true; // Auto-updates checkbox status
        $(`.${element.value}`).slideToggle(); // Auto-updates YT UI example
      } else {
        element.checked = false;
      }

      // Updates settings for whichever button is pushed
      element.addEventListener("click", (event) => {
        setNestedSetting(setting, element.name, element.checked);

        // Displays change in YT UI example
        ytFadeToggleElements.includes(element.value)
          ? $(`.${element.value}`).fadeToggle()
          : $(`.${element.value}`).slideToggle();
      });
    });
  } catch (error) {
    console.log(`Error getting settings ${error}`);
  }
}

/**
 * SECTION - EVENT LISTENERS
 *
 */

// Triggers toggleCheckboxes with the type of checkbox on every checkbox within a form
const addictiveForm = document.querySelectorAll("fieldset input");
addictiveForm.forEach((element) => {
  // console.log(element);
  // if (element.name.includes("quick")) {
  //   toggleCheckboxes("quick-actions", element);
  // } else {
  //   toggleCheckboxes("addictive-elements", element);
  //   // toggleCheckboxes("youtube-limtations", element);
  // }
});

// NOTE: Below is all new code

// jQuery animation for displaying button statuses
function buttonStatusAnim(statusMsgId, isSuccessful) {
  const delayTime = isSuccessful ? 1000 : 5000;
  $(statusMsgId)
    .fadeIn(1000)
    .css("display", "flex")
    .delay(delayTime)
    .fadeOut(1000);
}

// Popover won't close when cancel button is pressed if the form is incomplete in any way
$(".cancel").on("click", function () {
  const popoverId = $(this).attr("data-popover");
  document.querySelector(`#${popoverId}`).togglePopover();
});

// Saves restrictive settings and displays status message
$("#save-settings").on("click", function () {
  $("#settings-unsaved-msg").fadeOut();

  const $button = $(this);
  $button.prop("disabled", true);

  // TODO: requires function to save all creators
  // Call function to save all creators
  // Return function status

  setTimeout(function () {
    //NOTE - temporary
    const buttonSuccess = false; // Simulated save outcome

    // Start animation on status message, depending saving outcome
    buttonSuccess
      ? buttonStatusAnim("#settings-success-msg", true)
      : buttonStatusAnim("#settings-failure-msg", false);

    $button.prop("disabled", false); // Re-enable button after operation
  }, 2000);
});

// Saves preferred creators and displays status message
$("#save-creators").on("click", function () {
  $("#creators-unsaved-msg").fadeOut();

  const $button = $(this);
  $button.prop("disabled", true);

  // TODO: requires function to save all creators
  // Call function to save all creators
  // Return function status

  setTimeout(function () {
    //NOTE - temporary
    const buttonSuccess = true; // Simulated save outcome

    // Start animation on status message, depending saving outcome
    buttonSuccess
      ? buttonStatusAnim("#creators-success-msg", true)
      : buttonStatusAnim("#creators-failure-msg", false);

    $button.prop("disabled", false); // Re-enable button after operation
  }, 2000);
});

// Warns user that there are unsaved changes for restrictive settings
$('#limitation-settings input[type="checkbox"]').on("click", function () {
  $("#settings-unsaved-msg").fadeIn(1000).css("display", "flex");
});

// Warns user that there are unsaved changes for preferred creators
$('#creators-list input[type="checkbox"]').on("click", function () {
  $("#creators-unsaved-msg").fadeIn(1000).css("display", "flex");
});

// Removes blocked website from HTML list
// TODO: Delete from database
$("[id^='blocked-website-'] button").on("click", function () {
  const websiteId = $(this).attr("data-website-id");

  if (window.confirm("Permanently delete this website?")) {
    $(`#${websiteId}`).slideUp("slow", function () {
      $(this).remove();
    });
  }
});

/**
 * STORAGE RELATED FUNCTIONS
 */

// Function: Sends message to service worker to fulfill specific requests, such as database changes
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

/**
 * STORAGE FUNCTION EXAMPLES all temporary
 */
// NOTE: temp select record by id
let byIndex = await sendMessageToServiceWorker({
  operation: "selectById",
  table: "schedules",
  index: 1,
});

console.log(`selectById: `);
console.log(byIndex.data);

// NOTE: temp select all records from table
let allRecords = await sendMessageToServiceWorker({
  operation: "selectAll",
  table: "youtube-limitations",
});

console.log(`\nselectAll: ${Object.keys(allRecords).length}`);
// for (let index in allRecords) {
//   console.log(allRecords[index]);
// }

// console.log("\n");

let allRecordsWithoutIndex = await sendMessageToServiceWorker({
  operation: "selectAll",
  table: "misc-settings",
});

console.log(`\nselectAll: ${Object.keys(allRecordsWithoutIndex).length}`);
console.log(allRecordsWithoutIndex.data);
for (let index in allRecordsWithoutIndex.data) {
  console.log(allRecordsWithoutIndex.data[index], parseInt(index));
}

// NOTE: temp select by filtered property boolean
let filterRecordsByBool = await sendMessageToServiceWorker({
  operation: "filterRecordsBool",
  table: "schedules",
  property: "active",
  boolValue: false,
});

console.log(`\nfilterRecordsBool:`);
console.log(filterRecordsByBool.data);
for (let index in filterRecordsByBool.data) {
  console.log(filterRecordsByBool.data[index]);
}

let filterRecordsByKey = await sendMessageToServiceWorker({
  operation: "filterRecords",
  table: "youtube-limitations",
  property: "name",
  value: "home-page",
});

console.log(`\nfilterRecords:`);
console.log(filterRecordsByKey.data);

// NOTE: temp update records
const newSchedules = [
  { id: 1, name: "sunday", active: true, allDay: false },
  { id: 2, name: "monday", active: true, allDay: false },
  { id: 3, name: "tuesday", active: false, allDay: false },
  { id: 4, name: "wednesday", active: false, allDay: true },
  { id: 5, name: "thursday", active: true, allDay: false },
  { id: 6, name: "friday", active: false, allDay: false },
  { id: 7, name: "saturday", active: true, allDay: true },
];

let updateRecords = await sendMessageToServiceWorker({
  operation: "updateRecords",
  table: "schedules",
  newRecords: newSchedules,
});

const newWatchModes = [
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
  {
    id: 4,
    name: "Marvel Mode",
    active: false,
    restrictedTags: [],
    priorityTags: ["Marvel"],
    color: "#341782",
  },
];

let updateWatchModes = await sendMessageToServiceWorker({
  operation: "updateRecords",
  table: "watch-modes",
  newRecords: newWatchModes,
});

console.log(`\nupdate watch modes:`);
console.log(updateWatchModes.data);

// let updateRecordById = await sendMessageToServiceWorker({
//   operation: "updateRecordById",
//   table: "schedules",
//   id: 2,
//   newRecords: { allDay: true },
// });

// console.log(`\nupdateRecordsById:`);
// console.log(updateRecordById.data);

// NOTE: temp select all records from table
let watchModeList = await sendMessageToServiceWorker({
  operation: "selectAll",
  table: "watch-modes",
});

console.log(watchModeList.data);

// NOTE: temp delete record by ID
let deleteWatchMode = await sendMessageToServiceWorker({
  operation: "deleteRecordById",
  table: "watch-modes",
  id: 4,
});

if (deleteWatchMode.error) {
  console.error("Error deleting watch mode:", deleteWatchMode.message);
} else {
  console.log(deleteWatchMode.data);
}

// // NOTE: temp delete property in specific record
let deleteTimeInterval = await sendMessageToServiceWorker({
  operation: "deletepropertyInRecord",
  table: "schedules",
  id: 4,
  property: "interval-1",
});

if (deleteTimeInterval.error) {
  console.error("Error deleting interval:", deleteTimeInterval.message);
} else {
  console.log(deleteTimeInterval.data);
}

// NOTE: temp inserts new records in existing object
let insertNewWatchModes = await sendMessageToServiceWorker({
  operation: "insertRecords",
  table: "watch-modes",
  records: [
    {
      name: "Night Mode",
      active: true,
      restrictedTags: ["Bright"],
      priorityTags: [],
      color: "#000000",
    },
    {
      name: "Relax Mode",
      active: false,
      restrictedTags: ["Stress"],
      priorityTags: ["Calm"],
      color: "#00FF00",
    },
  ],
});

if (insertNewWatchModes.error) {
  console.error("Error inserting new records:", insertNewWatchModes.message);
} else {
  console.log(insertNewWatchModes.data);
}

let insertNewWatchTimes = await sendMessageToServiceWorker({
  operation: "insertRecords",
  table: "watch-times",
  records: [
    {
      date: "09-11-2000",
      "total-watch-time": 1400,
      "long-form-watch-time": 1000,
      "short-form-watch-time": 400,
    },
    {
      date: "09-12-2000",
      "total-watch-time": 5400,
      "long-form-watch-time": 2800,
      "short-form-watch-time": 2600,
    },
  ],
});

if (insertNewWatchTimes.error) {
  console.error("Error inserting new records:", insertNewWatchTimes.message);
} else {
  console.log(insertNewWatchTimes.data);
}
