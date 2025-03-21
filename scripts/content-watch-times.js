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

/**
 * SECTION - WATCH TIME FUNCTIONS
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

async function checkExistingWatchRecord(date) {
  const recordsWithDate = await filterRecordsGlobal(
    "watch-times",
    "date",
    date
  );

  if (recordsWithDate?.length > 0) {
    return true;
  } else {
    return false;
  }
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

/**
 * Calculates new watch time and calls function to update database
 *
 * @name calculateWatchTime
 *
 * @param {boolean} secondsActive - number of seconds to add to watch time database
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
async function calculateWatchTime(
  secondsActive,
  activeLongForm,
  activeShortForm
) {
  // Gets current day's watch times and updates with new watch times
  const currentWatchTimes = await getCurrentWatchTimes();
  let currentWatchTimeObj = currentWatchTimes[0];

  let newWatchTimeObj = createTimeRecordObj(
    currentWatchTimeObj,
    secondsActive,
    activeLongForm,
    activeShortForm
  );

  // Save new watch times (total and video type) to current date's entry
  updateWatchTimeRecord(newWatchTimeObj);
}

/** !SECTION */

/**
 * SECTION - PAUSE ON BLUR
 */
/**
 * Gets value of pauseOnBlur setting from database
 *
 * @name getPauseOnBlurValue
 *
 * @returns {boolean} isActive - boolean value of if setting is active
 *
 * @example const isActive = getPauseOnBlurValue();
 *
 */
async function getPauseOnBlurValue() {
  let activePauseOnBlur = await filterRecordsGlobal(
    "youtube-limitations",
    "name",
    "pause-video-on-blur"
  );

  const isActive = activePauseOnBlur[0]["active"];

  return isActive;
}

/**
 * Pause video if it is currently playing
 *
 * @name pauseVideo
 *
 * @returns {void}
 *
 * @example pauseVideo();
 *
 */
function pauseVideo(isFirstPress) {
  const activeLongForm = window.location.href?.includes("/watch?");
  const activeShortForm = window.location.href?.includes("/shorts/");

  let playButton;
  let valueToCheck;

  // Gets video's play/pause button to simulate a mouse click on it, depending on page
  if (activeLongForm) {
    playButton = document
      .getElementsByClassName("ytp-play-button ytp-button")
      ?.item(0);

    valueToCheck = "Pause";
  } else if (activeShortForm) {
    playButton = document.querySelector("#play-pause-button-shape button");
    valueToCheck = isFirstPress ? "Play" : "Pause";
  }

  // Pause video if it is playing and a play button exists
  if (playButton && (activeLongForm || activeShortForm)) {
    const titleValue = playButton?.getAttribute("title");
    const isPlaying = titleValue?.includes(valueToCheck);

    if (isPlaying) {
      playButton?.click();
    }
  }
}

/** !SECTION */

/**
 * SECTION - COUNTING WATCH TIMES
 */
$(document).ready(function () {
  // Sets 1-second interval for only Watch and Shorts pages
  const activeLongForm = window.location.href?.includes("/watch?");
  const activeShortForm = window.location.href?.includes("/shorts/");
  if (activeLongForm || activeShortForm) {
    // Count watch time every second when video is playing
    let secondsActive = 0;
    let count = 0;
    setInterval(() => {
      count++;
      let videoStatus;

      // Gets the play status, depending on page
      if (activeLongForm) {
        videoStatus = document
          .querySelector(".ytp-play-button.ytp-button")
          ?.getAttribute("title");
      } else if (activeShortForm) {
        videoStatus = document
          .querySelector("#play-pause-button-shape button")
          ?.getAttribute("title");
      }

      // If play status is pause, that means video is actively playing
      const isPlaying = videoStatus?.includes("Pause");
      if (isPlaying) {
        secondsActive++;

        // Save every 10 seconds for a max write of 360 per hour
        if (secondsActive === 10) {
          calculateWatchTime(secondsActive, activeLongForm, activeShortForm);
          secondsActive = 0;
        }
      }

      // Save the current secondsActive to database every 30 seconds
      // (in case the video have been paused or stopped before 10 seconds passed),
      if (count === 30) {
        calculateWatchTime(secondsActive, activeLongForm, activeShortForm);
        secondsActive = 0;
      }
    }, 1000);
  }
});

/** !SECTION */

/**
 * SECTION - ASYNC ON LOAD CODE
 */
$(document).ready(async function () {
  // Adds new watch time record if there is no record for current day and only on watch pages
  if (
    window.location.href.includes("/watch?") &&
    !(await checkExistingWatchRecord(getCurrentDate()))
  ) {
    // console.log("Creating new record for today...");
    addNewWatchTimeRecord();
  }

  // Gets pause on blur setting value once on load
  const isActive = await getPauseOnBlurValue();

  // On shorts pages, the title value of the play button is inaccurate
  // so this variable is needed to offset that
  let isFirstPress = true;

  // Pause video only if pause on blur is active
  window.addEventListener("blur", async (event) => {
    if (isActive) pauseVideo(isFirstPress);
    isFirstPress = false;
  });
});

/** !SECTION */
