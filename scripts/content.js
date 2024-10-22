/**
 * Author: Lorenzo Ramirez
 * Purpose: This script is injected into the YouTube page
 *  and hides elements from the page
 *
 */

/** SECTION - FUNCTION DECLARATIONS */

/** FUNCTION: Sends message to service worker to fulfill specific requests, such as database changes
 * NOTE: all operations (subject to change): 'selectById', 'selectAll', 'filterRecords', 'updateRecords',
 *        'updateRecordByColumn', 'deleteRecordById', 'deletePropertyInRecord', and 'insertRecords'
 *
 * @param {object} message - holds the operation name and other properties to send to servicer worker
 *
 * @returns {various} - can return storage objects or status response messages
 *
 * @example let byIndex = await sendMessageToServiceWorker({operation: "selectById", table: "schedules", index: 1, });
 *
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

/** FUNCTION: Gets all additional blocked websites and redirects the user if the current website is blocked
 *
 * @returns {void}
 *
 * @example checkBlockedWebsite()
 */
async function checkBlockedWebsite() {
  let blockedWebsites = await sendMessageToServiceWorker({
    operation: "selectAll",
    table: "additional-websites",
  });

  // Iterates through each blocked website, removes 'https://', and checks if that is in the current URL
  // -- redirects user to dashboard page
  blockedWebsites.forEach((element) => {
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
        let allActiveLimitations = await sendMessageToServiceWorker({
          operation: "filterRecords",
          table: "youtube-limitations",
          property: "active",
          value: true,
        });

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

// Starts timer immediately, even if not focused at first
let startTime = new Date();
// console.log(`start time immediately ${startTime}`);

// Starts timer when YouTube site is focused
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
  // Calculates elapsed time
  const endTime = new Date();
  const elapsedTime = Math.floor((endTime - startTime) / 1000);
  // console.log(`elapsed time on blur ${elapsedTime}`);

  // Gets current values of both time usages
  // const allTimeUsage = await sendMessageToServiceWorker({
  //   operation: "retrieveNested",
  //   parentKey: "watch-usage",
  //   key: "all-time",
  // });
  // const todayUsage = await sendMessageToServiceWorker({
  //   operation: "retrieveNested",
  //   parentKey: "watch-usage",
  //   key: "today",
  // });
  // const shortsUsage = await sendMessageToServiceWorker({
  //   operation: "retrieveNested",
  //   parentKey: "watch-usage",
  //   key: "shorts",
  // });
  // const regVideoUsage = await sendMessageToServiceWorker({
  //   operation: "retrieveNested",
  //   parentKey: "watch-usage",
  //   key: "regular-video",
  // });

  // Check if the current URL matches the specific URL
  // if (window.location.href.startsWith("https://www.youtube.com/shorts/")) {
  //   console.log("GHDSFGJSGDHJBSEDHJBGYU");
  //   // await sendMessageToServiceWorker({operation: "setNested", parentKey: "watch-usage", key: 'past-month-shorts', value: elapsedTime + shortsUsage});
  // } else if (window.location.href.startsWith("https://www.youtube.com/watch")) {
  //   console.log("GHDSFGJSGDHJBSEDHJBGYU");
  //   // await sendMessageToServiceWorker({operation: "setNested", parentKey: "watch-usage", key: 'past-month-regular', value: elapsedTime + regVideoUsage});
  // }

  // await sendMessageToServiceWorker({
  //   operation: "setNested",
  //   parentKey: "watch-usage",
  //   key: "today",
  //   value: elapsedTime + todayUsage,
  // });
  // await sendMessageToServiceWorker({
  //   operation: "setNested",
  //   parentKey: "watch-usage",
  //   key: "all-time",
  //   value: elapsedTime + allTimeUsage,
  // });

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

// Removes any YouTube element that is current limited (only on YouTube site)
applyActiveLimitations();

// Redirects user from current website if it is in the blocked website list
checkBlockedWebsite();

// Redirects user to dashboard from YouTube if a limited schedule is active
// checkSchedules();

/** !SECTION */
