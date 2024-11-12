/**
 * @LenchetoFC
 * @description This controls the youtube limitations feature on youtube pages
 *
 */

/** TODO: NOTE: List of Imported Functions from global-functions.js
 * - displayNotifications();
 */

/** SECTION - FUNCTION DECLARATIONS */

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
        let allActiveLimitations = await filterRecordsGlobal(
          "youtube-limitations",
          "active",
          true
        );

        console.log(allActiveLimitations);

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
/** !SECTION */

/** SECTION - ONLOAD FUNCTION CALLS */
$(document).ready(function () {
  // Removes any YouTube element that is current limited (only on YouTube site)
  applyActiveLimitations();
});
/** !SECTION */
