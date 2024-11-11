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

let updateRecordByColumn = await sendMessageToServiceWorker({
  operation: "updateRecordByColumn",
  table: "youtube-limitations",
  column: "id",
  value: 3,
  newRecords: { "quick-add": true, active: true },
});

console.log(`\nupdateRecordsById:`);
if (updateRecordByColumn.error) {
  console.error("Error inserting new records:", updateRecordByColumn.message);
} else {
  console.log(updateRecordByColumn.data);
}

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
  operation: "deletePropertyInRecord",
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
