/**
 * Author: Lorenzo Ramirez
 * Purpose: This script is injected into the YouTube page
 *  and hides elements from the page
 *
 */

/** SECTION - FUNCTION DECLARATIONS */

/** FUNCTION: Gets all additional blocked websites and redirects the user if the current website is blocked
 *
 * @returns {void}
 *
 * @example checkBlockedWebsite()
 */
async function checkBlockedWebsite() {
  let allWebsites = await selectAllRecordsGlobal("additional-websites");

  console.log("blockedWebsites");
  console.log(allWebsites);

  // Iterates through each blocked website, removes 'https://', and checks if that is in the current URL
  // -- redirects user to dashboard page
  allWebsites.forEach((element) => {
    let baseURL = element.url.split("//");
    if (window.location.href.includes(baseURL[1])) {
      redirectUser();
    }
  });
}

/** FUNCTION: hides the element with the given ID
 *
 * @param {string} elementID - ID of the element to hide
 *
 * @param {string} elementName - Descriptive name of the element that's being hidden
 *
 * @returns {void}
 *
 * @example hideDOMContent("#guide-inner-content [title='Home']", "Home Button - Drawer Event Listener")
 */
function hideDOMContent(elementID, elementName) {
  try {
    // Ensure the DOM is fully loaded before running the script
    $(document).ready(function () {
      const contentItems = $(elementID);

      // NOTE: Doesn't throw error if drawer is closed since it's rechecked when it's opened
      if (contentItems.length === 0) {
        throw new Error(
          `${elementName}: Element with ID ${elementID} not found.`
        );
      }

      // Iterate through all found elements to remove them
      // contentItems.forEach((_, item) => {
      contentItems.each((_, item) => {
        // $(item).css("display", "none");
        // $(item).slideUp();
        $(item).remove();
        console.log(`Hides ${elementName}: ${elementID}`);
      });
    });
  } catch (error) {
    console.log(
      `Error removing ${elementID} for ${elementName}: ${error.message}`
    );
  }
}

/** FUNCTION: Updates the HTML of the current web page with the specified HTML page
 *
 * @param {string} htmlPage - The path to the HTML page to be loaded
 *
 * @returns {void}
 *
 * @example redirectUser()
 */
function redirectUser() {
  chrome.runtime.sendMessage(
    { redirect: "/html/dashboard.html" },
    function (response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log(response);
      }
    }
  );
}

/** FUNCTION: Hides all buttons that redirect user's to the YT home page
 *
 * @returns {void}
 *
 * @example hideHomeButton();
 */
// FIXME: unreliable sometimes - needs further testing
function hideHomeButton() {
  // YouTube Logo
  hideDOMContent("#logo > a", "Home Button - YouTube Logo");

  setTimeout(() => {
    // Side Home Button
    hideDOMContent(
      "ytd-mini-guide-entry-renderer a[title='Home']",
      "Side Home Button - timeout 500"
    );
  }, 500);

  // Drawer home button - will not show if the side drawer haven't been opened yet
  $("ytd-masthead #guide-button").on("click", function () {
    setTimeout(() => {
      // Home Button
      hideDOMContent(
        "#guide-inner-content [title='Home']",
        "Home Button - Drawer Event Listener"
      );
      // Home Button as YT Logo
      hideDOMContent(
        "ytd-topbar-logo-renderer [title='YouTube Home']",
        "Home Button - YouTube Logo on guide button click"
      );

      // Side Home Button
      hideDOMContent(
        "ytd-mini-guide-entry-renderer a[title='Home']",
        "Side Home Button - on guide button click"
      );
    }, 500);
  });

  // Drawer home button - drawer is already opened
  if ($("tp-yt-app-drawer").opened) {
    console.log("drawer opened");
    hideDOMContent(
      "#guide-inner-content [title='Home']",
      "Home Button - Drawer Opened"
    );
  }

  // Side home button home page (only exists on home page)
  if (!window.location.href.includes("/watch?")) {
    hideDOMContent(
      "ytd-mini-guide-renderer [title='Home']",
      "Side Home Button - home page"
    );
  }
}

/** FUNCTION: Hides all buttons that leads to YT Shorts page
 *
 * @returns {void}
 *
 * @example hideShortsButton();
 */
// FIXME: unreliable sometimes - needs further testing
function hideShortsButton() {
  setTimeout(() => {
    // Side Shorts button
    hideDOMContent(
      "ytd-mini-guide-entry-renderer a[title='Shorts']",
      "Side Shorts Button - timeout 500"
    );
  }, 500);

  // Drawer shorts button - will not show if the side drawer haven't been opened yet
  $("ytd-masthead #guide-button").on("click", function () {
    setTimeout(() => {
      hideDOMContent(
        "#guide-inner-content a[title='Shorts']",
        "Shorts Button - Drawer Event Listener"
      );

      // Side Shorts button
      // hideDOMContent(
      //   "ytd-mini-guide-entry-renderer a[title='Shorts']",
      //   "Side Shorts Button - on guide button click"
      // );
    }, 500);
  });

  // Drawer home button - drawer is already opened
  if ($("tp-yt-app-drawer").opened) {
    hideDOMContent(
      "#guide-inner-content a[title='Shorts']",
      "Shorts Button - Drawer Opened"
    );
  }

  // Side home button home page (only exists on home page)
  if (!window.location.href.includes("/watch?")) {
    hideDOMContent(
      "ytd-mini-guide-renderer a[title='Shorts']",
      "Side Shorts Button - home page"
    );
  }
}

/** FUNCTION: Hides all Shorts videos and recommended Shorts
 *  NOTE: applies to home & playback pages
 *
 * @returns {void}
 *
 * @example hideShortsContent();
 */
function hideShortsContent() {
  // Hides shorts button as well
  hideShortsButton();

  if (window.location.href.includes("/watch?")) {
    // Shorts content - side recommendations (playback)
    hideDOMContent("ytd-reel-shelf-renderer", "Shorts Content - playback");
  } else if (window.location.href.includes("?search_query=")) {
    // Shorts chip filter - search page
    hideDOMContent(
      "yt-chip-cloud-chip-renderer:has([title='Shorts'])",
      "shorts chip content - search page"
    );
    hideDOMContent(
      "ytd-reel-shelf-renderer:has(ytm-shorts-lockup-view-model-v2)",
      "Shorts Content - search page"
    );
  } else if (window.location.href.includes("youtube.com")) {
    // Shorts content - home page
    hideDOMContent(
      "ytd-reel-shelf-renderer:has(ytm-shorts-lockup-view-model-v2)",
      "Shorts Content - home page"
    );

    hideDOMContent(
      "ytd-rich-shelf-renderer:has(ytm-shorts-lockup-view-model-v2)",
      "Shorts Content - home page other try"
    );
    console.log("should hide shorts");
  }

  // Redirects user if they are on shorts page
  if (window.location.href.includes("/shorts/")) {
    redirectUser();
  }
}

/** FUNCTION: Hides search at top middle of page
 *  NOTE: applies to home & playback pages
 *
 * @returns {void}
 *
 * @example hideSearchBar();
 */
function hideSearchBar() {
  hideDOMContent("#center:has(#search)", "Search Bar");
}

/** FUNCTION: Hides all video recommendations on home page and on side of videos
 *  NOTE: applies to home & playback pages
 *
 * @returns {void}
 *
 * @example hideVideoRecommendations();
 */
function hideVideoRecommendations() {
  if (window.location.href.includes("/watch?")) {
    // Side recommendations - playback
    hideDOMContent(
      "#secondary:has(ytd-watch-next-secondary-results-renderer) #related",
      "Recommendations on video playback pages"
    );

    // Removes button to switch to default view because the layout
    //  is messed up after removing recommendations on that view
    hideDOMContent(
      ".ytp-size-button",
      "Default View Button for recommendations - playback"
    );

    setTimeout(() => {
      // Video Wall after videos
      hideDOMContent(
        ".videowall-endscreen",
        "Video Wall after video ends - playback"
      );

      // FIXME: next video still autoplays
      // Video Wall after videos
      // hideDOMContent(
      //   ".ytp-autonav-endscreen-countdown-overlay",
      //   "Autoplay screen after video ends - playback"
      // );
    }, 5000);
  } else if (window.location.href.includes("youtube.com")) {
    // Video recommendations - home page
    hideDOMContent(
      "ytd-rich-grid-renderer > #contents > ytd-rich-item-renderer",
      "Recommendations on home pages"
    );
  }

  // Also disables infinite recommendations
  disableInfiniteRecommendations();
}

/** FUNCTION: Removes the element that loads another section of recommended videos
 *  NOTE: applies to home & playback pages
 *
 * @returns {void}
 *
 * @example disableInfiniteRecommendations();
 */
function disableInfiniteRecommendations() {
  hideDOMContent(
    "#primary ytd-continuation-item-renderer",
    "Infinite Video Recommendations"
  );
}

/** FUNCTION: Hides skip button on videos to avoid moving from video to video easily
 *
 * @returns {void}
 *
 * @example hideSkipButton();
 */
function hideSkipButton() {
  hideDOMContent("#player-container .ytp-next-button", "Playback Skip Button");
}

/** FUNCTION: Hides all comment sections
 *  NOTE: applies to playback and shorts pages
 *
 * @returns {void}
 *
 * @example hideComments();
 */
// FIXME: comments sometimes takes too long to load in
function hideComments() {
  if (window.location.href.includes("watch")) {
    hideDOMContent("ytd-comments#comments", "Comments Section on videos");
  } else if (window.location.href.includes("/shorts/")) {
    //FIXME: none of this works
    hideDOMContent(
      "watch-while-engagement-panel",
      "Comments Section in Shorts"
    );
    hideDOMContent("#comments-button", "Comments button in Shorts");
    $("#comments-buttons").on("click", function () {
      console.log("clicked");
      hideDOMContent(
        "`${this} watch-while-engagement-panel`",
        "Comments Section in Shorts"
      );
    });
  }
}

/** FUNCTION: Retrieves and applies all active limitations to current web page
 *
 * @returns {void}
 *
 * @example applyActiveLimitations();
 */
function applyActiveLimitations() {
  if (window.location.href.includes("youtube.com")) {
    setTimeout(async () => {
      try {
        // Get only active limitations from storage
        let allActiveLimitations = filterRecordsGlobal(
          "youtube-limitations",
          "active",
          true
        );

        // Iterate through active limitations to apply to current web page
        for (let index in allActiveLimitations) {
          // Limitation name property from storage
          const currentLimitation = allActiveLimitations[index].name;

          // Run hide/disable function that corresponds with the current limitation name
          switch (currentLimitation) {
            case "all-pages":
              if (window.location.href.includes("youtube.com/")) {
                redirectUser();
              }
              break;
            case "home-page":
              hideHomeButton();

              if (window.location.href === "https://www.youtube.com/") {
                redirectUser();
              }
              break;
            case "shorts-page":
              hideShortsButton();

              if (window.location.href.includes("youtube.com/shorts")) {
                redirectUser();
              }
              break;
            case "home-button":
              hideHomeButton();
              break;
            case "shorts-button":
              hideShortsButton();
              break;
            case "shorts-content":
              hideShortsContent();
              break;
            case "search-bar":
              hideSearchBar();
              break;
            case "infinite-recommendations":
              disableInfiniteRecommendations();
              break;
            case "video-recommendations":
              hideVideoRecommendations();
              break;
            case "skip-button":
              if (window.location.href.includes("/watch?")) {
                hideSkipButton();
              }
              break;
            case "comments-section":
              if (window.location.href.includes("/watch?")) {
                hideComments();
              }
              break;
          }
        }
      } catch (error) {
        console.error(error.message);
      }
    }, 2000);
  }
}

/** FUNCTION: Gets current time as of execution
 *
 * @returns {string} Returns the current time in a string format
 *
 * @example let currentTime = getCurrentTime();
 */
function getCurrentTime() {
  let currentDateTime = new Date();
  let currentHour = currentDateTime.getHours();
  let currentMinute = currentDateTime.getMinutes();

  return `${currentHour}:${currentMinute < 10 ? "0" : ""}${currentMinute}`;
}

/** TODO: FUNCTION: Checks stored schedule times and blocks YouTube accordingly
 *
 * @returns {void}
 *
 * @example checkSchedules();
 */
// function checkSchedules () {
//   // console.log("CHECKING SCHEDULE TIMES...");

//   // Settings IDs
//   let scheduleList = [
//     "sunday", "monday", "tuesday",
//     "wednesday", "thursday", "friday",
//     "saturday"
//   ];

//   // Empty array to store the boolean values when the current time is checked with schedule times
//   let blockYouTube = [];

//   // Gets current time (string) and day of the week (int - index of day of week i.e. Monday == 1)
//   let currentTime = getCurrentTime();
//   let currentDay = new Date().getDay();

//   TODO: get current day of week, filter records for just that day instead of iterating through all days

//   // Iterates through schedule days and only gets schedule times when it is the current day
//   // FIXME: if there's any time scheduled that day, it will block youtube
//   scheduleList.forEach(async (day, index) => {
//     console.log(currentDay, index, day)
//     if (currentDay === index) {
//       console.log(currentDay)
//       let times = await sendMessageToServiceWorker({operation: "retrieveNested", parentKey: "schedule-days", key: day});

//       console.log(`times: ${times}`)
//       // Checking if current time is within schedule times
//       if (times) { // All day schedule
//         blockYouTube.push(true);
//       } else if (times === false && times.length > 1) { // if all day is false and there is at least one scheduled interval
//         timesSelection = times.slice(1) // Only grabs the schedule intervals (array)

//         // Iterates through each schedule interval
//         timesSelection.forEach((time) => {
//           // Adds true value to blockYoutube array if current time is between interval
//           if (currentTime >= time[0] && currentTime <= time[1]) {
//             blockYouTube.push(true);
//           }

//         })
//       }
//     }
//     // Redirects user to blocked page if there is at least true value in blockYouTube array
//     //  & sets youtube-site restriction setting to true
//     if (blockYouTube.includes(true)) {
//       // console.log("WITHIN SCHEDULE TIMES. BLOCKING YOUTUBE");
//       // await sendSetSettingsMsg({operation: "set", key: 'scheduleOn', value: true});
//       //updateHTML("/html/blocked-page.html");
//       return;
//     } else {
//       // Sets youtube-site restriction to false if there are NO true values in blockYouTube array
//       // await sendSetSettingsMsg({operation: "set", key: 'scheduleOn', value: false});
//       // console.log("NOT WITHIN SCHEDULE TIMES");
//     }
//   })
// }

/** !SECTION */

/** SECTION - EVENT LISTENERS */

/**
 * Starts tracking time when site is focused
 * Gets current time when tracking starts
 */

// TODO: Get value of pause video on inactive and save to global variable
// TODO: improve tracking by tracking pause/play button instead of window focus

// Starts timer immediately, even if not focused at first
let startTime = new Date();
console.log(`start time immediately ${startTime}`);

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

/** !SECTION */

/** SECTION - ONLOAD FUNCTION CALLS */

addNewWatchTimeEntry();

// Removes any YouTube element that is current limited (only on YouTube site)
applyActiveLimitations();

// Redirects user from current website if it is in the blocked website list
checkBlockedWebsite();

// Redirects user to dashboard from YouTube if a limited schedule is active
// checkSchedules();

/** !SECTION */
