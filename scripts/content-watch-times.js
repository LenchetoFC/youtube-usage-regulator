/**
 * @LenchetoFC
 * @description This controls the watch time tracking feature on youtube pages
 *
 */

/** TODO: NOTE: List of Imported Functions from global-functions.js
 * - displayNotifications();
 */

/** SECTION - FUNCTION DECLARATIONS */

// Save new watch times (total and video type) to current date's entry
async function updateWatchTimes(newWatchTimesObj) {
  let updateWatchTime = await updateRecordByPropertyGlobal(
    "watch-times",
    "date",
    getCurrentDate(),
    newWatchTimesObj
  );

  return updateWatchTime;
}

// Adds new entry into watch times for the current date if !exists
function addNewWatchTimeEntry() {
  getCurrentWatchTimes().then(async (data) => {
    if (data.length === 0) {
      let watchTimeObj = {
        date: getCurrentDate(),
        "long-form-watch-time": 0,
        "short-form-watch-time": 0,
        "total-watch-time": 0,
      };

      await insertRecordsGlobal("watch-times", [watchTimeObj]);
    }
  });
}

function prepareNewWatchTimesObj(
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

/** SECTION - ONLOAD FUNCTION CALLS */
$(document).ready(function () {
  /**
   * Starts tracking time when site is focused
   * Gets current time when tracking starts
   */

  addNewWatchTimeEntry();

  // TODO: Get value of pause video on inactive and save to global variable
  // TODO: improve tracking by tracking pause/play button instead of window focus

  // Starts timer immediately, even if not focused at first
  let startTime = new Date();
  console.log(`start time immediately ${startTime}`);

  // Starts timer when YouTube site is focused
  // TODO: add youtube limitation checks to make sure the elements do not appear
  // -- even if the page never "officially" refreshes
  window.addEventListener("focus", (event) => {
    startTime = new Date();
    // console.log(`start time on focus ${startTime}`);

    // Checks schedule every time the page is focused
    //  to make sure any new schedules are applied without
    //  the need to reload page
    // checkSchedules();
  });

  // Stops tracking and updates time tracking storage values
  // Get current time when tracking ends & compares that with time when tracking started
  window.addEventListener("blur", async (event) => {
    // Get type of video (short-form or long-form)
    let activeLongForm = window.location.href.includes("/watch?");
    let activeShortForm = window.location.href.includes("/shorts/");

    // Updates watch times for the current day in storage
    if (activeLongForm || activeShortForm) {
      // Calculates elapsed time
      const endTime = new Date();
      const elapsedTime = Math.floor((endTime - startTime) / 1000);

      // Gets current day's watch times and updates with new watch times
      getCurrentWatchTimes().then(async (data) => {
        let currentWatchTimeObj = data[0];

        let newWatchTimeObj = prepareNewWatchTimesObj(
          currentWatchTimeObj,
          elapsedTime,
          activeLongForm,
          activeShortForm
        );

        updateWatchTimes(newWatchTimeObj);
      });

      // Save new watch times (total and video type) to current date's entry
      console.log(`elapsed time on blur ${elapsedTime}`);
    } else {
      console.log("Not on playback page.");
    }

    // TODO: depends on pause on inactive global variable, activate this
    // Gets video's play/pause button to simulate a mouse click on it
    // const playButton = document
    //   .getElementsByClassName("ytp-play-button ytp-button")
    //   .item(0);

    // Pause video if it is playing
    // Effectively keeps accurate tracking for when the user is *watching* YouTube
    // if (playButton.getAttribute("data-title-no-tooltip") === "Pause") {
    //   playButton.click();
    // }
  });

  // hides ability to refresh recommendations every time the window is resized.
  // That tag is reset when the window is resized, so this is the workaround
  // window.addEventListener("resize", () => {
  //   setTimeout(() => {
  //     hideDOMContent(
  //       "ytd-continuation-item-renderer",
  //       "Continuous Recommendations"
  //     );
  //   }, 1000);
  // });
});
/** !SECTION */
