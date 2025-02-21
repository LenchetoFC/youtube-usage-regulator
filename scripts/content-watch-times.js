/**
 * @file settings-watch-times.js
 * @description Controls the watch time tracking feature on youtube pages
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.insertRecordsGlobal}
 * @see {@link module:global-functions.updateRecordByPropertyGlobal}
 * @see {@link module:global-functions.getCurrentWatchTimes} x2
 * @see {@link module:global-functions.getCurrentDate} x3
 */

// TODO: Track shorts videos

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/**
 * Save new watch times (total and video type) to current date's entry
 *
 * @name updateWatchTimeRecord
 * @async
 *
 * @param {Object} newWatchTimesObj - The newly created watch time object from createTimeRecordObj()
 *
 * @returns {Object} The result of updating watch time in storage
 *
 * @example updateWatchTimeRecord(newWatchTimeObj);
 */
async function updateWatchTimeRecord(newWatchTimesObj) {
  let updateWatchTime = await updateRecordByPropertyGlobal(
    "watch-times",
    "date",
    getCurrentDate(),
    newWatchTimesObj
  );

  return updateWatchTime;
}

/**
 * Adds a new watch time entry to the storage
 *
 * @name addNewWatchTimeRecord
 *
 * @returns {void}
 *
 * @example addNewWatchTimeRecord();
 */
async function addNewWatchTimeRecord() {
  let watchTimeObj = {
    date: getCurrentDate(),
    "long-form-watch-time": 0,
    "short-form-watch-time": 0,
    "total-watch-time": 0,
  };

  await insertRecordsGlobal("watch-times", [watchTimeObj]);
}

/**
 * Creates a new watch times object with updated watch times
 *
 * @name createTimeRecordObj
 *
 * @param {Object} currentWatchTimeObj - The current watch time object from storage
 * @param {boolean} longForm - Indicates if the video is long-form
 * @param {boolean} shortForm - Indicates if the video is short-form
 * @param {number} elapsedTime - The elapsed time to add to the watch times
 *
 * @returns {Object} The new watch times object with updated values
 *
 * @example const newWatchTimes = createTimeRecordObj(currentWatchTimeObj, true, false, 300);
 */
function createTimeRecordObj(
  currentWatchTimeObj,
  elapsedTime,
  longForm,
  shortForm
) {
  let newWatchTimesObj = {
    date: getCurrentDate(),
    "long-form-watch-time":
      parseInt(currentWatchTimeObj["long-form-watch-time"]) +
      (longForm ? elapsedTime : 0),
    "short-form-watch-time":
      parseInt(currentWatchTimeObj["short-form-watch-time"]) +
      (shortForm ? elapsedTime : 0),
    "total-watch-time":
      parseInt(currentWatchTimeObj["total-watch-time"]) + elapsedTime,
  };

  return newWatchTimesObj;
}

/** !SECTION */

/**
 * Calculates new watch time and calls function to update database
 *
 * @name calculateWatchTime
 *
 * @param {boolean} activeLongForm - if the current URL includes "/watch?"
 * @param {boolean} activeShortForm - if the current URL includes "/shorts/"
 *
 * @returns {void}
 *
 * @example
 * const activeLongForm = window.location.href.includes("/watch?");
 * const activeShortForm = window.location.href.includes("/shorts/");
 * calculateWatchTime(activeLongForm, activeShortForm);
 */
async function calculateWatchTime(activeLongForm, activeShortForm) {
  // Gets current day's watch times and updates with new watch times
  const currentWatchTimes = await getCurrentWatchTimes();
  let currentWatchTimeObj = currentWatchTimes[0];

  let newWatchTimeObj = createTimeRecordObj(
    currentWatchTimeObj,
    1,
    activeLongForm,
    activeShortForm
  );

  // Save new watch times (total and video type) to current date's entry
  updateWatchTimeRecord(newWatchTimeObj);
}

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(function () {
  // Adds new watch time record if there is no record for current day
  getCurrentWatchTimes().then(async (data) => {
    if (data.length === 0) {
      console.log("Creating new record for today...");
      addNewWatchTimeRecord();
    }
  });

  // Sets 1-second interval for only Watch and Shorts pages
  // FIXME: change interval to every 10 seconds to avoid max 1800 writes per hour quotas
  const activeLongForm = window.location.href.includes("/watch?");
  const activeShortForm = window.location.href.includes("/shorts/");
  if (activeLongForm || activeShortForm) {
    // Updates watch time every second when video is playing
    setInterval(() => {
      let $videoStatus;

      if (activeLongForm) {
        $videoStatus = $(".ytp-play-button.ytp-button").attr("title");
      } else if (activeShortForm) {
        $videoStatus = $("#play-pause-button-shape button").attr("title");
      }

      const isPlaying = $videoStatus.indexOf("Pause") !== -1;
      if (isPlaying) {
        calculateWatchTime(activeLongForm, activeShortForm);
      }
    }, 1000);
  }

  // TODO: depends on pause on inactive global variable, activate this
  // let activePauseOnBlur = await filterRecordsGlobal(
  //   "misc-settings",
  //   "pause-video-on-blur",
  //   true
  // );
});

/** !SECTION */

// NOTE: Unused code for an alternative method for tracking watch times
// /**
//  * SECTION - TRACKING BASED ON PLAY/PAUSE STATES
//  * @notes increments watch time until video is done or paused, and then updated to database
//  */

// async function calculateWatchTime() {
//   // NOTE: code for TRACKING BASED ON PLAY/PAUSE STATES
//   // Calculates elapsed time
//   // const endTime = new Date();
//   // const elapsedTime = Math.floor((endTime - startTime) / 1000);

//   // Gets current day's watch times and updates with new watch times
//   ...
// }

// /**
//  * Starts tracking time when play button is active
//  * Gets current time when tracking starts
//  *
//  * @name startTrackingTime
//  *
//  * @returns {void}
//  *
//  *
//  */
// // function startTrackingTime() {
// //   const startTime = new Date();
// //   console.log(`start time immediately ${startTime}`);
// //   return startTime;
// // }

// /**
//  * Stops tracking time and calculates elapsed time when play button is paused
//  *
//  * @name stopTrackingTime
//  *
//  * @returns {void}
//  *
//  */
// // function stopTrackingTime(startTime) {
// //   if (typeof startTime === "undefined") {
// //     console.log("startTime does not exist");
// //     return;
// //   }

// //   calculateWatchTime();
// // }

// // Function to handle attribute changes
// // function handleAttributeChange(mutationsList, observer) {
// //   mutationsList.forEach((mutation) => {
// //     if (
// //       mutation.type === "attributes" &&
// //       mutation.attributeName === "data-title-no-tooltip"
// //     ) {
// //       const titleAttr = mutation.target.getAttribute("data-title-no-tooltip");
// //       const isPlaying = titleAttr === "Pause";

// //       if (isPlaying) {
// //         startTime = startTrackingTime();
// //         console.log("playing");
// //       } else {
// //         stopTrackingTime(startTime);
// //         console.log("paused");
// //       }
// //     }
// //   });
// // }

// // $(document).ready(function () {
// /**
//  * Starts tracking time when site is focused
//  * Gets current time when tracking starts
//  */

// // adds new watch time record if there is no record for current day
// // addNewWatchTimeRecord();

// // $(document).on("click", ".ytp-play-button.ytp-button", function () {
// //   console.log(this);
// //   setTimeout(() => {
// //     const titleAttr = $(this).attr("data-title-no-tooltip");

// //     const isPlaying = titleAttr === "Pause";

// //     if (isPlaying) {
// //       startTime = startTrackingTime();
// //       console.log("playing");
// //     } else {
// //       stopTrackingTime(startTime);
// //       console.log("paused");
// //     }
// //   }, 100); // Adjust the delay as needed
// // });

// // Starts timer immediately, even if not focused at first
// // let startTime;
// // setTimeout(() => {
// //   // Create an observer instance linked to the callback function
// //   const observer = new MutationObserver(handleAttributeChange);

// //   // Start observing the target node for configured mutations
// //   const targetNode = document.querySelector(".ytp-play-button.ytp-button");
// //   if (targetNode) {
// //     observer.observe(targetNode, { attributes: true });
// //     console.log("play button found");
// //   } else {
// //     console.error("Play button not found.");
// //   }

// //   const videoStatus = $(".ytp-play-button.ytp-button").attr(
// //     "data-title-no-tooltip"
// //   );
// //   const isAlreadyPlaying = videoStatus === "Pause";
// //   if (isAlreadyPlaying) {
// //     startTime = startTrackingTime();
// //   }
// // }, 3000);

// // Starts timer when YouTube site is focused
// // TODO: add youtube limitation checks to make sure the elements do not appear
// // -- even if the page never "officially" refreshes
// // window.addEventListener("focus", (event) => {
// // startTime = startTrackingTime();
// // Checks schedule every time the page is focused
// //  to make sure any new schedules are applied without
// //  the need to reload page
// // checkSchedules();
// // });

// // Stops tracking and updates time tracking storage values
// // Get current time when tracking ends & compares that with time when tracking started
// // window.addEventListener("blur", async (event) => {
// // stopTrackingTime(startTime);

// // // Gets video's play/pause button to simulate a mouse click on it
// // const playButton = document
// //   .getElementsByClassName("ytp-play-button ytp-button")
// //   .item(0);
// // // Pause video if it is playing
// // // Effectively keeps accurate tracking for when the user is *watching* YouTube
// // if (playButton.getAttribute("data-title-no-tooltip") === "Pause") {
// //   playButton.click();
// // }
// // });

// // });

// /** !SECTION */
